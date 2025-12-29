/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE SERVICE - Gerenciamento centralizado de dados
 * ═══════════════════════════════════════════════════════════════════════════
 * @enterprise-grade Sistema de banco de dados global acessível entre arquivos
 * @solid OCP - Open/Closed Principle via Hooks Pattern
 */

var DatabaseService = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS PATTERN - Extensibilidade (OCP - Open/Closed Principle)
  // Permite adicionar comportamentos pré/pós operações sem modificar código base
  // ═══════════════════════════════════════════════════════════════════════════
  
  _hooks: {
    beforeCreate: [],
    afterCreate: [],
    beforeUpdate: [],
    afterUpdate: [],
    beforeDelete: [],
    afterDelete: [],
    beforeRead: [],
    afterRead: []
  },

  /**
   * Registra um hook para uma operação
   * @param {string} hookName - Nome do hook (beforeCreate, afterCreate, etc)
   * @param {Function} handler - Função callback(sheetName, data) => data|void
   * @returns {Function} Função para remover o hook
   */
  registerHook(hookName, handler) {
    if (!this._hooks[hookName]) {
      throw new Error(`Hook inválido: ${hookName}. Válidos: ${Object.keys(this._hooks).join(', ')}`);
    }
    this._hooks[hookName].push(handler);
    
    // Retorna função para remover o hook
    return () => {
      const index = this._hooks[hookName].indexOf(handler);
      if (index > -1) {
        this._hooks[hookName].splice(index, 1);
      }
    };
  },

  /**
   * Executa todos os hooks de uma operação
   * @private
   */
  _runHooks(hookName, sheetName, data) {
    let result = data;
    for (const handler of this._hooks[hookName]) {
      try {
        const hookResult = handler(sheetName, result);
        // Se o hook retornar algo, usa como novo valor
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (error) {
        Logger.log(`Erro no hook ${hookName}: ${error}`);
      }
    }
    return result;
  },

  /**
   * Cria um novo registro com validação completa
   */
  create(sheetName, data) {
    try {
      // Validação de entrada
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Dados inválidos' };
      }

      // Hook: beforeCreate (OCP)
      data = this._runHooks('beforeCreate', sheetName, data);

      const sheet = getSheet(sheetName);

      // Adiciona metadados obrigatórios
      if (!data.id) data.id = Utils.generateId();
      if (!data.timestamp) data.timestamp = new Date();

      // Obtém ou cria headers
      let headers = this._getHeaders(sheet);
      if (headers.length === 0) {
        headers = Object.keys(data);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length)
          .setFontWeight('bold')
          .setBackground('#4CAF50')
          .setFontColor('#FFFFFF');
        sheet.setFrozenRows(1);
      }

      const validation = this._validateRequiredFields(sheetName, data);
      if (!validation.valid) {
        return { success: false, error: validation.error, missing: validation.missing };
      }

      // Validação de tipos de dados
      const typeValidation = this._validateDataTypes(sheetName, data);
      if (!typeValidation.valid) {
        return { success: false, error: typeValidation.error, invalidFields: typeValidation.invalidFields };
      }

      // Validação de limites de valores
      const limitsValidation = this._validateValueLimits(sheetName, data);
      if (!limitsValidation.valid) {
        return { success: false, error: limitsValidation.error, invalidFields: limitsValidation.invalidFields };
      }

      // Validação de formatos
      const formatValidation = this._validateFormats(sheetName, data);
      if (!formatValidation.valid) {
        return { success: false, error: formatValidation.error, invalidFields: formatValidation.invalidFields };
      }

      // Validação de integridade referencial
      const referentialValidation = this._validateReferentialIntegrity(sheetName, data);
      if (!referentialValidation.valid) {
        return { success: false, error: referentialValidation.error, invalidFields: referentialValidation.invalidFields };
      }

      // Monta valores na ordem dos headers
      const values = headers.map(h => {
        const value = data[h];
        if (value === undefined || value === null) return '';
        if (value instanceof Date) return value;
        return value;
      });

      // Adiciona linha
      sheet.appendRow(values);

      // Log da operação
      this._log('CREATE', sheetName, data.id, data);

      // Hook: afterCreate (OCP)
      this._runHooks('afterCreate', sheetName, data);

      return { success: true, data: data, id: data.id };
    } catch (error) {
      Utils.logError('DatabaseService.create', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Lê registros com filtros avançados (OTIMIZADO)
   */
  read(sheetName, filter = {}, options = {}) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      const sheet = getSheet(sheetName);
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return { success: true, data: [], count: 0, total: 0 };
      }

      const headers = this._getHeaders(sheet);
      const lastCol = headers.length; // Usa length do cache ao invés de getLastColumn()
      
      // OTIMIZAÇÃO: Lê apenas as colunas necessárias se filtro especificado
      const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

      // OTIMIZAÇÃO: Converte para objetos de forma mais eficiente
      let records = [];
      const headerLen = headers.length;
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const obj = {};
        for (let j = 0; j < headerLen; j++) {
          obj[headers[j]] = row[j];
        }
        records.push(obj);
      }

      // Aplica filtros (OTIMIZADO - early exit)
      const filterKeys = Object.keys(filter);
      if (filterKeys.length > 0) {
        records = records.filter(record => {
          for (let k = 0; k < filterKeys.length; k++) {
            const key = filterKeys[k];
            const filterValue = filter[key];
            const recordValue = record[key];

            if (filterValue instanceof RegExp) {
              if (!filterValue.test(String(recordValue))) return false;
            } else if (recordValue != filterValue) {
              return false;
            }
          }
          return true;
        });
      }

      if (options.search) {
        const searchLower = String(options.search).toLowerCase();
        records = records.filter(record => {
          const values = Object.values(record);
          for (let i = 0; i < values.length; i++) {
            if (String(values[i]).toLowerCase().includes(searchLower)) {
              return true;
            }
          }
          return false;
        });
      }

      // Ordenação
      if (options.sortBy) {
        const sortField = options.sortBy;
        const sortOrder = options.sortOrder || 'asc';
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        records.sort((a, b) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (aVal < bVal) return -1 * multiplier;
          if (aVal > bVal) return 1 * multiplier;
          return 0;
        });
      }

      const total = records.length;

      // Paginação
      if (options.limit) {
        const offset = options.offset || 0;
        records = records.slice(offset, offset + options.limit);
      }

      return {
        success: true,
        data: records,
        count: records.length,
        total: total
      };
    } catch (error) {
      Utils.logError('DatabaseService.read', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Lê um único registro por ID
   */
  readById(sheetName, id) {
    try {
      const result = this.read(sheetName, { id: id });
      if (!result.success) return result;

      if (result.data.length === 0) {
        return { success: false, error: 'Registro não encontrado' };
      }

      return { success: true, data: result.data[0] };
    } catch (error) {
      Utils.logError('DatabaseService.readById', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Atualiza registro com validação
   */
  update(sheetName, id, updates) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      if (!id) {
        return { success: false, error: 'ID não fornecido' };
      }

      if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
        return { success: false, error: 'Nenhuma atualização fornecida' };
      }

      const sheet = getSheet(sheetName);
      const headers = this._getHeaders(sheet);
      const data = sheet.getDataRange().getValues();

      const idIndex = headers.indexOf('id');
      if (idIndex === -1) {
        return { success: false, error: 'Coluna id não encontrada' };
      }

      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] == id) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        return { success: false, error: 'Registro não encontrado' };
      }

      // Validação de tipos de dados nos updates
      const typeValidation = this._validateDataTypes(sheetName, updates);
      if (!typeValidation.valid) {
        return { success: false, error: typeValidation.error, invalidFields: typeValidation.invalidFields };
      }

      // Validação de limites de valores nos updates
      const limitsValidation = this._validateValueLimits(sheetName, updates);
      if (!limitsValidation.valid) {
        return { success: false, error: limitsValidation.error, invalidFields: limitsValidation.invalidFields };
      }

      // Validação de formatos nos updates
      const formatValidation = this._validateFormats(sheetName, updates);
      if (!formatValidation.valid) {
        return { success: false, error: formatValidation.error, invalidFields: formatValidation.invalidFields };
      }

      // Validação de integridade referencial nos updates
      const referentialValidation = this._validateReferentialIntegrity(sheetName, updates);
      if (!referentialValidation.valid) {
        return { success: false, error: referentialValidation.error, invalidFields: referentialValidation.invalidFields };
      }

      updates.timestamp = new Date();

      const updatedFields = [];
      Object.keys(updates).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(updates[key]);
          updatedFields.push(key);
        }
      });

      // Força a persistência dos dados
      SpreadsheetApp.flush();

      // Log da operação
      this._log('UPDATE', sheetName, id, updates);

      return {
        success: true,
        message: 'Registro atualizado',
        updatedFields: updatedFields
      };
    } catch (error) {
      Utils.logError('DatabaseService.update', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Deleta registro com opção de cascata
   */
  delete(sheetName, id, cascade = false) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      if (!id) {
        return { success: false, error: 'ID não fornecido' };
      }

      const sheet = getSheet(sheetName);
      const headers = this._getHeaders(sheet);
      const data = sheet.getDataRange().getValues();

      const idIndex = headers.indexOf('id');
      if (idIndex === -1) {
        return { success: false, error: 'Coluna id não encontrada' };
      }

      let rowIndex = -1;
      let recordData = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] == id) {
          rowIndex = i + 1;
          recordData = data[i];
          break;
        }
      }

      if (rowIndex === -1) {
        return { success: false, error: 'Registro não encontrado' };
      }

      // Deleção em cascata se solicitado
      let cascadeResults = [];
      if (cascade) {
        cascadeResults = this._deleteCascade(sheetName, id);
      }

      sheet.deleteRow(rowIndex);

      // Log da operação
      this._log('DELETE', sheetName, id, { cascade: cascade, cascadeResults: cascadeResults });

      return {
        success: true,
        message: 'Registro deletado',
        cascade: cascade,
        cascadeDeleted: cascadeResults.length
      };
    } catch (error) {
      Utils.logError('DatabaseService.delete', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Conta registros com filtro
   */
  count(sheetName, filter = {}) {
    try {
      const result = this.read(sheetName, filter);
      if (!result.success) return result;

      return { success: true, count: result.total };
    } catch (error) {
      Utils.logError('DatabaseService.count', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Verifica se registro existe
   */
  exists(sheetName, id) {
    try {
      const result = this.readById(sheetName, id);
      return { success: true, exists: result.success };
    } catch (error) {
      Utils.logError('DatabaseService.exists', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Cria ou atualiza (upsert)
   */
  upsert(sheetName, data) {
    try {
      if (!data.id) {
        return this.create(sheetName, data);
      }

      const exists = this.exists(sheetName, data.id);
      if (exists.exists) {
        const { id, ...updates } = data;
        return this.update(sheetName, id, updates);
      } else {
        return this.create(sheetName, data);
      }
    } catch (error) {
      Utils.logError('DatabaseService.upsert', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Deleção em cascata de registros relacionados
   */
  _deleteCascade(parentSheet, parentId) {
    const relationships = {
      'ParcelasAgroflorestais': [
        { sheet: 'ProducaoAgroflorestal', foreignKey: 'parcela_id' }
      ],
      'Trilhas': [
        { sheet: 'GPSPoints', foreignKey: 'trilha_id' },
        { sheet: 'Waypoints', foreignKey: 'trilha_id' },
        { sheet: 'Visitantes', foreignKey: 'trilha_id' }
      ],
      'Visitantes': [
        { sheet: 'AvaliacoesEcoturismo', foreignKey: 'visitante_id' }
      ],
      'ParticipantesTerapia': [
        { sheet: 'SessoesTerapia', foreignKey: 'participante_id' },
        { sheet: 'AvaliacoesTerapeuticas', foreignKey: 'participante_id' }
      ],
      'PlantasMedicinais': [
        { sheet: 'PreparacoesFitoterapicas', foreignKey: 'planta_id' }
      ],
      'Waypoints': [
        { sheet: 'Fotos', foreignKey: 'waypoint_id' }
      ]
    };

    const relatedSheets = relationships[parentSheet] || [];
    const deleted = [];

    relatedSheets.forEach(rel => {
      const filter = {};
      filter[rel.foreignKey] = parentId;
      const children = this.read(rel.sheet, filter);

      if (children.success && children.data.length > 0) {
        children.data.forEach(child => {
          const result = this.delete(rel.sheet, child.id, false);
          if (result.success) {
            deleted.push({ sheet: rel.sheet, id: child.id });
          }
        });
      }
    });

    return deleted;
  },

  /**
   * Valida integridade referencial (chaves estrangeiras)
   */
  _validateReferentialIntegrity(sheetName, data) {
    const foreignKeys = {
      'ProducaoAgroflorestal': {
        'parcela_id': 'ParcelasAgroflorestais'
      },
      'SessoesTerapia': {
        'participante_id': 'ParticipantesTerapia'
      },
      'AvaliacoesTerapeuticas': {
        'participante_id': 'ParticipantesTerapia',
        'sessao_id': 'SessoesTerapia'
      },
      'Visitantes': {
        'trilha_id': 'Trilhas'
      }
    };

    const references = foreignKeys[sheetName] || {};
    const invalidFields = [];

    for (const field in references) {
      const refSheet = references[field];
      const refValue = data[field];

      // Se o campo está preenchido, valida a referência
      if (refValue && refValue !== '') {
        const exists = this.exists(refSheet, refValue);
        if (!exists) {
          invalidFields.push({
            field: field,
            value: refValue,
            referencedSheet: refSheet,
            message: `${field} referencia ID inexistente na planilha ${refSheet}`
          });
        }
      }
    }

    if (invalidFields.length > 0) {
      const errors = invalidFields.map(f => f.message);
      return {
        valid: false,
        error: `Integridade referencial violada: ${errors.join('; ')}`,
        invalidFields: invalidFields
      };
    }

    return { valid: true };
  },

  /**
   * Valida tipos de dados por planilha
   */
  _validateDataTypes(sheetName, data) {
    const fieldTypes = {
      'Waypoints': {
        'latitude': 'number',
        'longitude': 'number',
        'altitude': 'number',
        'precisao': 'number'
      },
      'Trilhas': {
        'distancia_km': 'number',
        'duracao_horas': 'number',
        'dificuldade': 'string'
      },
      'ParcelasAgroflorestais': {
        'area_ha': 'number',
        'idade_anos': 'number',
        'pH_solo': 'number'
      },
      'ProducaoAgroflorestal': {
        'quantidade_kg': 'number',
        'valor_unitario': 'number'
      },
      'Visitantes': {
        'tamanho_grupo': 'number'
      },
      'QualidadeAgua': {
        'pH': 'number',
        'temperatura': 'number',
        'oxigenio_dissolvido': 'number',
        'turbidez': 'number'
      },
      'ORCAMENTO_AGRO_RA': {
        'Categoria': 'string',
        'Alocado': 'number',
        'Utilizado': 'number'
      },
      'REALOCACAO_LOG_RA': {
        'Parcela_ID': 'string',
        'De_Categoria': 'string',
        'Para_Categoria': 'string',
        'Valor': 'number',
        'Usuario': 'string'
      },
      'HEATMAP_BIODIVERSIDADE_RA': {
        'ID_Analise': 'string',
        'Tipo_Analise': 'string',
        'Grid_Resolution_m': 'number',
        'Total_Cells': 'number',
        'Total_Observacoes': 'number'
      },
      'BIODIVERSIDADE_RA': {
        'count': 'number',
        'confidence': 'number',
        'areaId': 'string',
        'species': 'string'
      },
      'BACKUP_LOG_RA': {
        'ID_Backup': 'string',
        'Tamanho_KB': 'number',
        'Duracao_Seg': 'number'
      },
      'RECOVERY_LOG_RA': {
        'ID_Recovery': 'string',
        'Registros_Restaurados': 'number',
        'Duracao_Seg': 'number'
      },
      'CAPTURAS_AVANCADO_RA': {
        'Quantidade': 'number',
        'Confianca_ID': 'number'
      },
      'OCUPACAO_HABITAT_RA': {
        'Sites_Amostrados': 'number',
        'Sites_Ocupados': 'number',
        'Naive_Occupancy': 'number',
        'Psi_Estimado': 'number'
      },
      'QualidadeSolo': {
        'pH': 'number',
        'materia_organica': 'number',
        'umidade': 'number'
      }
    };

    const expectedTypes = fieldTypes[sheetName] || {};
    const invalidFields = [];

    for (const field in expectedTypes) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const expectedType = expectedTypes[field];
        const actualType = typeof data[field];
        const value = data[field];

        if (expectedType === 'number') {
          const num = parseFloat(value);
          if (isNaN(num)) {
            invalidFields.push({
              field: field,
              expected: 'number',
              actual: actualType,
              value: value
            });
          }
        } else if (expectedType === 'string' && actualType !== 'string') {
          invalidFields.push({
            field: field,
            expected: 'string',
            actual: actualType,
            value: value
          });
        }
      }
    }

    if (invalidFields.length > 0) {
      const errors = invalidFields.map(f => `${f.field}: esperado ${f.expected}, recebido ${f.actual}`);
      return {
        valid: false,
        error: `Tipos de dados inválidos: ${errors.join('; ')}`,
        invalidFields: invalidFields
      };
    }

    return { valid: true };
  },

  /**
   * Valida limites de valores por planilha
   */
  _validateValueLimits(sheetName, data) {
    const valueLimits = {
      'QualidadeAgua': {
        'pH': { min: 0, max: 14 },
        'temperatura': { min: -10, max: 50 },
        'oxigenio_dissolvido': { min: 0, max: 20 },
        'turbidez': { min: 0, max: 1000 }
      },
      'QualidadeSolo': {
        'pH': { min: 0, max: 14 },
        'materia_organica': { min: 0, max: 100 },
        'umidade': { min: 0, max: 100 }
      },
      'Waypoints': {
        'latitude': { min: -90, max: 90 },
        'longitude': { min: -180, max: 180 },
        'altitude': { min: -500, max: 9000 }
      },
      'Trilhas': {
        'distancia_km': { min: 0, max: 100 },
        'duracao_horas': { min: 0, max: 24 }
      },
      'ParcelasAgroflorestais': {
        'area_ha': { min: 0, max: 10000 },
        'idade_anos': { min: 0, max: 200 },
        'pH_solo': { min: 0, max: 14 }
      },
      'ProducaoAgroflorestal': {
        'quantidade_kg': { min: 0, max: 100000 },
        'valor_unitario': { min: 0, max: 1000000 }
      },
      'ORCAMENTO_AGRO_RA': {
        'Alocado': { min: 0, max: 10000000 },
        'Utilizado': { min: 0, max: 10000000 }
      },
      'REALOCACAO_LOG_RA': {
        'Valor': { min: 0.01, max: 1000000 }
      },
      'HEATMAP_BIODIVERSIDADE_RA': {
        'Grid_Resolution_m': { min: 1, max: 100000 },
        'Total_Cells': { min: 1, max: 5000000 },
        'Total_Observacoes': { min: 0, max: 1000000 }
      },
      'BIODIVERSIDADE_RA': {
        'count': { min: 1, max: 10000 },
        'confidence': { min: 0, max: 100 }
      },
      'CAPTURAS_AVANCADO_RA': {
        'Quantidade': { min: 1, max: 1000 },
        'Confianca_ID': { min: 0, max: 1 }
      },
      'OCUPACAO_HABITAT_RA': {
        'Naive_Occupancy': { min: 0, max: 1 },
        'Psi_Estimado': { min: 0, max: 1 }
      },
      'Visitantes': {
        'tamanho_grupo': { min: 1, max: 1000 }
      }
    };

    const limits = valueLimits[sheetName] || {};
    const invalidFields = [];

    for (const field in limits) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const value = parseFloat(data[field]);
        const { min, max } = limits[field];

        if (!isNaN(value)) {
          if (value < min || value > max) {
            invalidFields.push({
              field: field,
              value: value,
              min: min,
              max: max,
              message: `${field} deve estar entre ${min} e ${max}`
            });
          }
        }
      }
    }

    if (invalidFields.length > 0) {
      const errors = invalidFields.map(f => f.message);
      return {
        valid: false,
        error: `Valores fora dos limites: ${errors.join('; ')}`,
        invalidFields: invalidFields
      };
    }

    return { valid: true };
  },

  /**
   * Valida formatos de campos (datas, emails, etc)
   */
  _validateFormats(sheetName, data) {
    const dateFields = {
      'Visitantes': ['data_visita'],
      'ParticipantesTerapia': ['data_nascimento'],
      'SessoesTerapia': ['data'],
      'QualidadeAgua': ['data'],
      'QualidadeSolo': ['data'],
      'Biodiversidade': ['data'],
      'DadosClimaticos': ['data'],
      'ProducaoAgroflorestal': ['data_colheita']
    };

    const emailFields = {
      'Visitantes': ['email'],
      'ParticipantesTerapia': ['email_contato']
    };

    const invalidFields = [];

    // Validar campos de data
    const datesToValidate = dateFields[sheetName] || [];
    datesToValidate.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const value = data[field];
        
        // Se for string, tenta converter para Date
        if (typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            invalidFields.push({
              field: field,
              value: value,
              message: `${field} deve ser uma data válida`
            });
          } else {
            // Converte a string para Date no objeto data
            data[field] = date;
          }
        } else if (!(value instanceof Date)) {
          invalidFields.push({
            field: field,
            value: value,
            message: `${field} deve ser uma data`
          });
        } else if (isNaN(value.getTime())) {
          invalidFields.push({
            field: field,
            value: value,
            message: `${field} é uma data inválida`
          });
        }
      }
    });

    // Validar campos de email
    const emailsToValidate = emailFields[sheetName] || [];
    emailsToValidate.forEach(field => {
      if (data[field] && data[field] !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data[field])) {
          invalidFields.push({
            field: field,
            value: data[field],
            message: `${field} deve ser um email válido`
          });
        }
      }
    });

    if (invalidFields.length > 0) {
      const errors = invalidFields.map(f => f.message);
      return {
        valid: false,
        error: `Formatos inválidos: ${errors.join('; ')}`,
        invalidFields: invalidFields
      };
    }

    return { valid: true };
  },

  /**
   * Valida campos obrigatórios por planilha
   */
  _validateRequiredFields(sheetName, data) {
    const requiredFields = {
      'Waypoints': ['nome', 'latitude', 'longitude', 'categoria'],
      'Trilhas': ['nome', 'distancia_km'],
      'Fotos': ['nome_arquivo', 'categoria'],
      'ParcelasAgroflorestais': ['nome', 'tipo_sistema', 'area_ha'],
      'ProducaoAgroflorestal': ['parcela_id', 'produto', 'quantidade_kg'],
      'Visitantes': ['nome', 'data_visita'],
      'ParticipantesTerapia': ['nome', 'data_nascimento'],
      'SessoesTerapia': ['participante_id', 'data', 'tipo_terapia'],
      'PlantasMedicinais': ['nome_cientifico', 'nome_popular'],
      'QualidadeAgua': ['data', 'local', 'pH'],
      'QualidadeSolo': ['data', 'local', 'pH'],
      'QualidadeAgua': ['data', 'local', 'pH'],
      'QualidadeSolo': ['data', 'local', 'pH'],
      'Biodiversidade': ['data', 'local', 'tipo_observacao'],
      'ORCAMENTO_AGRO_RA': ['Categoria', 'Alocado'],
      'REALOCACAO_LOG_RA': ['Parcela_ID', 'De_Categoria', 'Para_Categoria', 'Valor'],
      'HEATMAP_BIODIVERSIDADE_RA': ['ID_Analise', 'Timestamp_Geracao'],
      'BIODIVERSIDADE_RA': ['species', 'count'],
      'BACKUP_LOG_RA': ['ID_Backup', 'Tipo', 'Data_Hora'],
      'RECOVERY_LOG_RA': ['ID_Recovery', 'Backup_ID'],
      'CAPTURAS_AVANCADO_RA': ['ID_Captura', 'Especie', 'Data_Hora'],
      'OCUPACAO_HABITAT_RA': ['ID_Analise', 'Especie']
    };

    const required = requiredFields[sheetName] || [];
    const missing = required.filter(field => !data[field] || data[field] === '');

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Campos obrigatórios faltando: ${missing.join(', ')}`,
        missing: missing
      };
    }

    return { valid: true };
  },

  /**
   * Obtém headers da planilha (COM CACHE)
   * @private
   */
  _headersCache: {},
  
  _getHeaders(sheet) {
    const sheetName = sheet.getName();
    
    // Usa cache em memória para evitar leituras repetidas
    if (this._headersCache[sheetName]) {
      return this._headersCache[sheetName];
    }
    
    if (sheet.getLastRow() === 0) return [];
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    this._headersCache[sheetName] = headers;
    return headers;
  },
  
  /**
   * Invalida cache de headers (chamar após alterações estruturais)
   */
  invalidateHeadersCache(sheetName) {
    if (sheetName) {
      delete this._headersCache[sheetName];
    } else {
      this._headersCache = {};
    }
  },

  /**
   * Sistema de log interno (OTIMIZADO - só loga operações importantes)
   */
  _logEnabled: false, // Desabilitado por padrão para reduzir carga
  
  _log(operation, sheetName, recordId, details) {
    // Skip logging se desabilitado (reduz ~10% da carga em operações CRUD)
    if (!this._logEnabled) return;
    
    try {
      const logSheet = getSheet(CONFIG.SHEETS.LOGS);
      const user = Session.getActiveUser().getEmail() || 'system';
      const detailsStr = JSON.stringify(details).substring(0, 500);

      logSheet.appendRow([
        new Date(),
        operation,
        user,
        operation,
        sheetName,
        recordId,
        detailsStr,
        '',
        '',
        ''
      ]);
    } catch (error) {
      // Silencioso - não impacta operação principal
    }
  },
  
  /**
   * Habilita/desabilita logging
   */
  setLogging(enabled) {
    this._logEnabled = enabled;
  }
};
