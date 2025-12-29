/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHEETS SERVICE - Sistema Completo de CRUD e Gestão de Dados
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema robusto para gerenciamento completo de todas as planilhas do projeto
 * Inclui validações, relacionamentos, cascata e integração com Drive
 */

const SheetsService = {

  /**
   * Cria todas as planilhas base do sistema
   */
  setupAllSheets() {
    if (!CONFIG || !CONFIG.SHEETS) {
      return { success: false, error: 'CONFIG.SHEETS não está definido' };
    }

    const sheetGroups = [
      this.setupAgroforestrySheets,
      this.setupEnvironmentalMonitoringSheets,
      this.setupCarbonSheets,
      this.setupEcotourismSheets,
      this.setupGpsSheets,
      this.setupTherapySheets,
      this.setupPhytotherapySheets,
      this.setupSystemSheets,
    ];

    let totalSheets = 0;
    sheetGroups.forEach(setupGroup => {
      const sheets = setupGroup.call(this);
      this._setupSheetGroup(sheets);
      totalSheets += sheets.length;
    });

    return { success: true, message: `${totalSheets} planilhas configuradas` };
  },

  _setupSheetGroup(sheets) {
    sheets.forEach(sheetConfig => {
      const sheet = this.getOrCreateSheet(sheetConfig.name, sheetConfig.headers);
      Logger.log(`Planilha ${sheetConfig.name} configurada`);
    });
  },

  setupAgroforestrySheets() {
    return [
      { name: CONFIG.SHEETS.PARCELAS_AGRO, headers: ['id', 'timestamp', 'nome', 'tipo_sistema', 'area_ha', 'idade_anos', 'custo_implantacao', 'custo_manutencao_anual', 'localizacao', 'responsavel', 'latitude', 'longitude', 'observacoes', 'status'] },
      { name: CONFIG.SHEETS.PRODUCAO_AGRO, headers: ['id', 'timestamp', 'parcela_id', 'data', 'produto', 'quantidade_kg', 'valor_reais', 'qualidade', 'destino', 'observacoes'] },
      { name: CONFIG.SHEETS.ESPECIES_AGRO, headers: ['id', 'timestamp', 'nome_cientifico', 'nome_comum', 'familia', 'tipo', 'uso', 'origem', 'observacoes'] },
    ];
  },

  setupEnvironmentalMonitoringSheets() {
    return [
      { name: CONFIG.SHEETS.DADOS_CLIMA, headers: ['id', 'timestamp', 'data', 'temperatura_min', 'temperatura_max', 'temperatura_media', 'umidade', 'precipitacao', 'vento_velocidade', 'vento_direcao', 'pressao', 'radiacao_solar', 'estacao', 'observacoes'] },
      { name: CONFIG.SHEETS.QUALIDADE_AGUA, headers: ['id', 'timestamp', 'data', 'local', 'latitude', 'longitude', 'pH', 'oxigenio_dissolvido', 'turbidez', 'temperatura', 'nitrogenio_total', 'fosforo_total', 'coliformes_termotolerantes', 'solidos_totais', 'condutividade', 'dbo', 'dqo', 'responsavel', 'observacoes'] },
      { name: CONFIG.SHEETS.QUALIDADE_SOLO, headers: ['id', 'timestamp', 'data', 'local', 'latitude', 'longitude', 'pH', 'materia_organica', 'fosforo', 'potassio', 'calcio', 'magnesio', 'aluminio', 'ctc', 'saturacao_bases', 'textura', 'profundidade_cm', 'responsavel', 'observacoes'] },
      { name: CONFIG.SHEETS.BIODIVERSIDADE, headers: ['id', 'timestamp', 'data', 'local', 'latitude', 'longitude', 'tipo_observacao', 'especie_cientifica', 'especie_comum', 'familia', 'quantidade', 'comportamento', 'habitat', 'status_conservacao', 'foto_id', 'observador', 'observacoes'] },
      { name: CONFIG.SHEETS.SUCESSAO_ECOLOGICA, headers: ['id', 'timestamp', 'parcela_id', 'estagio_atual', 'indice_shannon', 'riqueza_especies', 'predicao_5anos', 'confianca', 'cenarios_json', 'recomendacoes_json', 'responsavel'] },
    ];
  },

  setupCarbonSheets() {
    return [
      { name: CONFIG.SHEETS.CARBONO, headers: ['id', 'timestamp', 'data', 'area_id', 'area_nome', 'tipo_vegetacao', 'biomassa_aerea', 'biomassa_subterranea', 'area_ha', 'idade_anos', 'carbono_total', 'co2_equivalente', 'metodologia', 'responsavel', 'observacoes'] },
    ];
  },

  setupEcotourismSheets() {
    return [
      { name: CONFIG.SHEETS.VISITANTES, headers: ['id', 'timestamp', 'data_visita', 'nome', 'email', 'telefone', 'origem_cidade', 'origem_estado', 'origem_pais', 'tamanho_grupo', 'faixa_etaria', 'proposito', 'trilha_id', 'guia', 'observacoes'] },
      { name: CONFIG.SHEETS.TRILHAS, headers: ['id', 'timestamp', 'nome', 'descricao', 'distancia_km', 'largura_m', 'tempo_visita_horas', 'dificuldade', 'elevacao_m', 'tipo_terreno', 'pontos_interesse', 'infraestrutura', 'melhor_epoca', 'restricoes', 'latitude_inicio', 'longitude_inicio', 'status', 'observacoes'] },
      { name: CONFIG.SHEETS.AVALIACOES, headers: ['id', 'timestamp', 'visitante_id', 'data', 'nota', 'aspectos_positivos', 'aspectos_negativos', 'sugestoes', 'recomendaria', 'comentario', 'respondido_por'] },
    ];
  },

  setupGpsSheets() {
    return [
      { name: CONFIG.SHEETS.GPS_POINTS, headers: ['id', 'timestamp', 'tipo', 'nome', 'descricao', 'latitude', 'longitude', 'altitude', 'precisao', 'categoria', 'trilha_id', 'foto_id', 'usuario', 'data_coleta', 'observacoes'] },
      { name: CONFIG.SHEETS.WAYPOINTS, headers: ['id', 'timestamp', 'nome', 'descricao', 'latitude', 'longitude', 'altitude', 'categoria', 'icone', 'cor', 'trilha_id', 'foto_ids', 'usuario', 'data_criacao', 'visivel', 'observacoes'] },
      { name: CONFIG.SHEETS.ROTAS, headers: ['id', 'timestamp', 'nome', 'descricao', 'tipo', 'distancia_km', 'duracao_horas', 'dificuldade', 'pontos_gps', 'waypoints_ids', 'elevacao_ganho', 'elevacao_perda', 'usuario', 'data_criacao', 'publica', 'observacoes'] },
      { name: CONFIG.SHEETS.FOTOS, headers: ['id', 'timestamp', 'nome_arquivo', 'drive_id', 'drive_url', 'tipo', 'categoria', 'latitude', 'longitude', 'waypoint_id', 'trilha_id', 'descricao', 'tags', 'usuario', 'data_upload', 'tamanho_bytes', 'largura', 'altura', 'observacoes'] },
    ];
  },

  setupTherapySheets() {
    return [
      { name: CONFIG.SHEETS.PARTICIPANTES, headers: ['id', 'timestamp', 'nome', 'data_nascimento', 'idade', 'genero', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'data_inicio', 'condicao_principal', 'condicoes_secundarias', 'medicamentos', 'alergias', 'contato_emergencia', 'telefone_emergencia', 'status', 'observacoes'] },
      { name: CONFIG.SHEETS.SESSOES, headers: ['id', 'timestamp', 'participante_id', 'data', 'hora_inicio', 'hora_fim', 'duracao_minutos', 'tipo_terapia', 'local', 'trilha_id', 'terapeuta', 'atividades', 'clima', 'temperatura', 'satisfacao', 'humor_antes', 'humor_depois', 'observacoes_terapeuta', 'observacoes_participante'] },
      { name: CONFIG.SHEETS.AVALIACOES_TERAPIA, headers: ['id', 'timestamp', 'participante_id', 'sessao_id', 'data', 'escala_ansiedade', 'escala_depressao', 'escala_estresse', 'escala_bemestar', 'conexao_natureza', 'qualidade_sono', 'nivel_energia', 'dor_fisica', 'concentracao', 'relacionamentos', 'avaliador', 'observacoes'] },
    ];
  },

  setupPhytotherapySheets() {
    return [
      { name: CONFIG.SHEETS.PLANTAS_MEDICINAIS, headers: ['id', 'timestamp', 'nome_cientifico', 'nome_popular', 'familia', 'parte_usada', 'principios_ativos', 'indicacoes', 'contraindicacoes', 'modo_preparo', 'dosagem', 'interacoes', 'toxicidade', 'evidencias_cientificas', 'referencias', 'local_coleta', 'epoca_coleta', 'status_conservacao', 'foto_ids', 'observacoes'] },
      { name: CONFIG.SHEETS.PREPARACOES, headers: ['id', 'timestamp', 'planta_id', 'tipo_preparacao', 'ingredientes', 'modo_preparo', 'dosagem', 'via_administracao', 'duracao_tratamento', 'indicacoes', 'contraindicacoes', 'efeitos_colaterais', 'data_preparacao', 'validade', 'lote', 'responsavel', 'observacoes'] },
    ];
  },

  setupSystemSheets() {
    return [
      { name: CONFIG.SHEETS.USUARIOS, headers: ['id', 'timestamp', 'nome', 'email', 'telefone', 'tipo_usuario', 'cargo', 'permissao', 'data_criacao', 'ultimo_acesso', 'ativo', 'observacoes'] },
      { name: CONFIG.SHEETS.LOGS, headers: ['timestamp', 'tipo', 'usuario', 'acao', 'planilha', 'registro_id', 'detalhes', 'ip', 'user_agent', 'erro'] },
      { name: CONFIG.SHEETS.CONFIGURACOES, headers: ['id', 'timestamp', 'chave', 'valor', 'descricao', 'tipo', 'usuario', 'data_atualizacao'] },
      { name: CONFIG.SHEETS.NOTIFICATION_LOG, headers: ['id', 'timestamp', 'tipo', 'destinatario', 'assunto', 'mensagem', 'status', 'data_envio', 'usuario'] },
      { name: CONFIG.SHEETS.SYNC_QUEUE, headers: ['id', 'timestamp', 'tipo', 'dados', 'status', 'tentativas', 'data_criacao', 'data_sincronizacao', 'ultimo_erro', 'usuario'] }
    ];
  },

  /**
   * Obtém ou cria uma planilha com headers
   */
  getOrCreateSheet(sheetName, headers) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (headers && headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4CAF50').setFontColor('#FFFFFF');
        sheet.setFrozenRows(1);

        // Auto-resize columns
        for (let i = 1; i <= headers.length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    return sheet;
  },

  /**
   * CRUD Completo com validações
   */
  create(sheetName, data) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      const sheet = getSheet(sheetName);

      // Adiciona metadados
      if (!data.id) data.id = Utils.generateId();
      if (!data.timestamp) data.timestamp = new Date();

      // Obtém headers
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      // Monta valores
      const values = headers.map(h => {
        const value = data[h];
        if (value instanceof Date) return value;
        if (value === undefined || value === null) return '';
        return value;
      });

      // Adiciona linha
      sheet.appendRow(values);

      // Log
      this.log('CREATE', sheetName, data.id, `Registro criado: ${JSON.stringify(data).substring(0, 200)}`);

      return { success: true, data: data, id: data.id };
    } catch (error) {
      Utils.logError('SheetsService.create', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Leitura com filtros avançados
   */
  read(sheetName, options = {}) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      const sheet = getSheet(sheetName);
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return { success: true, data: [], count: 0 };
      }

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

      let records = Utils.arrayToObjects(data, headers);

      // Filtros
      if (options.filter) {
        records = records.filter(record => {
          return Object.keys(options.filter).every(key => {
            const filterValue = options.filter[key];
            const recordValue = record[key];

            // Suporta regex
            if (filterValue instanceof RegExp) {
              return filterValue.test(recordValue);
            }

            return recordValue == filterValue;
          });
        });
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        records = records.filter(record => {
          return Object.values(record).some(value => {
            return String(value).toLowerCase().includes(searchLower);
          });
        });
      }

      // Ordenação
      if (options.sortBy) {
        const sortField = options.sortBy;
        const sortOrder = options.sortOrder || 'asc';
        records.sort((a, b) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Paginação
      const total = records.length;
      if (options.limit) {
        const offset = options.offset || 0;
        records = records.slice(offset, offset + options.limit);
      }

      return { success: true, data: records, count: records.length, total: total };
    } catch (error) {
      Utils.logError('SheetsService.read', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Atualização com validação
   */
  update(sheetName, id, updates) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      const sheet = getSheet(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
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

      Object.keys(updates).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(updates[key]);
        }
      });

      // Log
      this.log('UPDATE', sheetName, id, `Campos atualizados: ${Object.keys(updates).join(', ')}`);

      return { success: true, message: 'Registro atualizado' };
    } catch (error) {
      Utils.logError('SheetsService.update', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Deleção com cascata opcional
   */
  delete(sheetName, id, cascade = false) {
    try {
      if (!sheetName) {
        return { success: false, error: 'Nome da planilha não fornecido' };
      }

      const sheet = getSheet(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
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

      // Cascata
      if (cascade) {
        this.deleteCascade(sheetName, id);
      }

      sheet.deleteRow(rowIndex);

      // Log
      this.log('DELETE', sheetName, id, cascade ? 'Deletado com cascata' : 'Deletado');

      return { success: true, message: 'Registro deletado' };
    } catch (error) {
      Utils.logError('SheetsService.delete', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Deleção em cascata de registros relacionados
   */
  deleteCascade(parentSheet, parentId) {
    const relationships = {
      'ParcelasAgroflorestais': ['ProducaoAgroflorestal'],
      'Trilhas': ['GPSPoints', 'Waypoints', 'Visitantes'],
      'Visitantes': ['AvaliacoesEcoturismo'],
      'ParticipantesTerapia': ['SessoesTerapia', 'AvaliacoesTerapeuticas'],
      'PlantasMedicinais': ['PreparacoesFitoterapicas']
    };

    const relatedSheets = relationships[parentSheet] || [];

    relatedSheets.forEach(childSheet => {
      const foreignKey = parentSheet.replace(/s$/, '') + '_id';
      const children = this.read(childSheet, { filter: { [foreignKey]: parentId } });

      if (children.success && children.data.length > 0) {
        children.data.forEach(child => {
          this.delete(childSheet, child.id, false);
        });
      }
    });
  },

  /**
   * Sistema de logs (OTIMIZADO - desabilitado por padrão)
   */
  _logEnabled: false,
  
  log(tipo, planilha, registroId, detalhes) {
    // Skip se desabilitado
    if (!this._logEnabled) return;
    
    try {
      const logSheet = getSheet(CONFIG.SHEETS.LOGS);
      const user = Session.getActiveUser().getEmail();

      logSheet.appendRow([
        new Date(),
        tipo,
        user,
        tipo,
        planilha,
        registroId,
        detalhes,
        '',
        '',
        ''
      ]);
    } catch (error) {
      // Silencioso
    }
  },
  
  setLogging(enabled) {
    this._logEnabled = enabled;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CAMADA DE API - PIVÔ ENTRE FRONTEND E BACKEND (OTIMIZADA)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const APILayer = {
  /**
   * Wrapper simplificado (removido logging excessivo)
   */
  _wrapCall(serviceName, methodName, fn, ...args) {
    try {
      return fn(...args);
    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Valida parâmetros obrigatórios
   */
  _validateParams(params, required) {
    for (let i = 0; i < required.length; i++) {
      if (!params[required[i]]) {
        return {
          valid: false,
          error: `Parâmetro obrigatório: ${required[i]}`
        };
      }
    }
    return { valid: true };
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRUD GENÉRICO - Funções internas do SheetsService
 * NOTA: As funções apiCreate/Read/Update/Delete principais estão em ApiEndpoints.gs
 * Estas são funções internas usadas pelo SheetsService
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiCreate(sheetName, data) {
  const validation = APILayer._validateParams({ sheetName, data }, ['sheetName', 'data']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SheetsService', 'create', 
    () => SheetsService.create(sheetName, data)
  );
}

function sheetsApiRead(sheetName, options) {
  const validation = APILayer._validateParams({ sheetName }, ['sheetName']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SheetsService', 'read',
    () => SheetsService.read(sheetName, options || {})
  );
}

function sheetsApiUpdate(sheetName, id, updates) {
  const validation = APILayer._validateParams({ sheetName, id, updates }, ['sheetName', 'id', 'updates']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SheetsService', 'update',
    () => SheetsService.update(sheetName, id, updates)
  );
}

function sheetsApiDelete(sheetName, id, cascade) {
  const validation = APILayer._validateParams({ sheetName, id }, ['sheetName', 'id']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SheetsService', 'delete',
    () => SheetsService.delete(sheetName, id, cascade || false)
  );
}

function apiSetupSheets() {
  return APILayer._wrapCall('SheetsService', 'setupAllSheets',
    () => SheetsService.setupAllSheets()
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPERAÇÕES ESPECIALIZADAS - GPS (Sheets.gs internal)
 * NOTA: apiCreateWaypoint principal está em GPSService.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiCreateWaypoint(data) {
  const validation = APILayer._validateParams({ data }, ['data']);
  if (!validation.valid) return validation;
  
  // Validação específica de waypoint
  const waypointValidation = ValidationService.validateWaypoint(data);
  if (!waypointValidation.valid) {
    return { success: false, errors: waypointValidation.errors };
  }
  
  return APILayer._wrapCall('GPSService', 'createWaypoint',
    () => GPSService.createWaypoint(data)
  );
}

function apiGetNearbyWaypoints(latitude, longitude, radiusKm) {
  const validation = APILayer._validateParams({ latitude, longitude }, ['latitude', 'longitude']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('GPSService', 'findNearbyWaypoints',
    () => GPSService.findNearbyWaypoints(latitude, longitude, radiusKm || 1)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSCA E PESQUISA (Sheets.gs internal)
 * NOTA: Funções principais de busca estão em SearchService.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiGlobalSearch(query, options) {
  const validation = APILayer._validateParams({ query }, ['query']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SearchService', 'globalSearch',
    () => SearchService.globalSearch(query, options || {})
  );
}

function sheetsApiSearchNearby(latitude, longitude, radiusKm, type) {
  const validation = APILayer._validateParams({ latitude, longitude }, ['latitude', 'longitude']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SearchService', 'searchNearby',
    () => SearchService.searchNearby(latitude, longitude, radiusKm || 1, type)
  );
}

function sheetsApiGetSearchSuggestions(query, limit) {
  const validation = APILayer._validateParams({ query }, ['query']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('SearchService', 'getSuggestions',
    () => SearchService.getSuggestions(query, limit || 10)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDAÇÃO (Sheets.gs internal)
 * ═══════════════════════════════════════════════════════════════════════════
 */

function apiValidateFormData(formType, data) {
  const validation = APILayer._validateParams({ formType, data }, ['formType', 'data']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('ValidationService', 'validateAndSanitize',
    () => ValidationService.validateAndSanitize(formType, data)
  );
}

function sheetsApiValidateGPS(latitude, longitude) {
  const validation = APILayer._validateParams({ latitude, longitude }, ['latitude', 'longitude']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('ValidationService', 'validateGPS',
    () => ValidationService.validateGPS(latitude, longitude)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OTIMIZAÇÃO MOBILE (Sheets.gs internal)
 * NOTA: Funções principais estão em MobileOptimization.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiReadOptimized(sheetName, options) {
  const validation = APILayer._validateParams({ sheetName }, ['sheetName']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('MobileOptimization', 'readOptimized',
    () => MobileOptimization.readOptimized(sheetName, options || {})
  );
}

function sheetsApiGetQuickStats() {
  return APILayer._wrapCall('MobileOptimization', 'getQuickStats',
    () => MobileOptimization.getQuickStats()
  );
}

function sheetsApiBatchCreate(sheetName, records) {
  const validation = APILayer._validateParams({ sheetName, records }, ['sheetName', 'records']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('MobileOptimization', 'batchCreate',
    () => MobileOptimization.batchCreate(sheetName, records)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORTAÇÃO
 * ═══════════════════════════════════════════════════════════════════════════
 */

function apiExportCSV(sheetName, filters) {
  const validation = APILayer._validateParams({ sheetName }, ['sheetName']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('MobileOptimization', 'exportCSVOptimized',
    () => MobileOptimization.exportCSVOptimized(sheetName, filters || {})
  );
}

function apiExportJSON(sheetName, filters) {
  const validation = APILayer._validateParams({ sheetName }, ['sheetName']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('MobileOptimization', 'exportJSONOptimized',
    () => MobileOptimization.exportJSONOptimized(sheetName, filters || {})
  );
}

function apiExportKML(filters) {
  return APILayer._wrapCall('MobileOptimization', 'exportKMLOptimized',
    () => MobileOptimization.exportKMLOptimized(filters || {})
  );
}

function apiExportGPX(filters) {
  return APILayer._wrapCall('MobileOptimization', 'exportGPXOptimized',
    () => MobileOptimization.exportGPXOptimized(filters || {})
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SINCRONIZAÇÃO OFFLINE (Sheets.gs internal)
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiSyncIncremental(sheetName, lastSyncTimestamp) {
  const validation = APILayer._validateParams({ sheetName }, ['sheetName']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('MobileOptimization', 'syncIncremental',
    () => MobileOptimization.syncIncremental(sheetName, lastSyncTimestamp)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UTILITÁRIOS
 * ═══════════════════════════════════════════════════════════════════════════
 */

function apiGetSheetsList() {
  return APILayer._wrapCall('Utils', 'getSheetsList',
    () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = ss.getSheets().map(s => ({
        name: s.getName(),
        rows: s.getLastRow(),
        columns: s.getLastColumn()
      }));
      return { success: true, sheets: sheets };
    }
  );
}

function apiGetConfig() {
  return APILayer._wrapCall('Config', 'getConfig',
    () => {
      return {
        success: true,
        config: {
          sheets: CONFIG.SHEETS,
          version: '3.1.0',
          features: {
            gps: true,
            photos: true,
            offline: true,
            export: true,
            search: true,
            validation: true
          }
        }
      };
    }
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTENTICAÇÃO E USUÁRIOS (Sheets.gs internal)
 * NOTA: apiAuthenticate e apiCreateUser principais estão em ApiEndpoints.gs
 * ═══════════════════════════════════════════════════════════════════════════
 */

function sheetsApiAuthenticate(email, password) {
  return APILayer._wrapCall('Auth', 'authenticate',
    () => {
      try {
        // Busca usuário na planilha
        const result = SheetsService.read(CONFIG.SHEETS.USUARIOS, { 
          filter: { email: email, ativo: true } 
        });
        
        if (!result.success || !result.data || result.data.length === 0) {
          return { success: false, message: 'Usuário não encontrado' };
        }
        
        const user = result.data[0];
        
        // Verifica senha (em produção, usar hash)
        if (user.senha && user.senha !== password) {
          return { success: false, message: 'Senha incorreta' };
        }
        
        // Atualiza último acesso
        SheetsService.update(CONFIG.SHEETS.USUARIOS, user.id, { 
          ultimo_acesso: new Date() 
        });
        
        return { 
          success: true, 
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.tipo_usuario || 'visitor',
            tipo: user.tipo_usuario,
            permissao: user.permissao,
            cargo: user.cargo
          }
        };
      } catch (error) {
        return { success: false, message: error.toString() };
      }
    }
  );
}

function sheetsApiCreateUser(userData) {
  const validation = APILayer._validateParams({ userData }, ['userData']);
  if (!validation.valid) return validation;
  
  return APILayer._wrapCall('Auth', 'createUser',
    () => {
      // Verifica se email já existe
      const existing = SheetsService.read(CONFIG.SHEETS.USUARIOS, { 
        filter: { email: userData.email } 
      });
      
      if (existing.success && existing.data && existing.data.length > 0) {
        return { success: false, error: 'Email já cadastrado' };
      }
      
      // Cria usuário
      const newUser = {
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone || '',
        tipo_usuario: userData.tipo || 'visitor',
        cargo: userData.cargo || '',
        permissao: userData.permissao || 'read',
        data_criacao: new Date(),
        ultimo_acesso: null,
        ativo: true,
        observacoes: userData.observacoes || ''
      };
      
      return SheetsService.create(CONFIG.SHEETS.USUARIOS, newUser);
    }
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ESTATÍSTICAS DE BIODIVERSIDADE
 * ═══════════════════════════════════════════════════════════════════════════
 */

function apiGetBiodiversityStats() {
  return APILayer._wrapCall('Biodiversity', 'getStats',
    () => {
      try {
        const result = SheetsService.read(CONFIG.SHEETS.BIODIVERSIDADE, {});
        
        if (!result.success) {
          return { success: false, error: result.error };
        }
        
        const records = result.data || [];
        
        // Calcula estatísticas
        const uniqueSpecies = new Set();
        const endangeredSpecies = new Set();
        const endemicSpecies = new Set();
        const recentObservations = [];
        
        records.forEach(record => {
          if (record.especie_cientifica) {
            uniqueSpecies.add(record.especie_cientifica);
          }
          
          // Status de conservação
          const status = (record.status_conservacao || '').toLowerCase();
          if (status.includes('ameaça') || status.includes('perigo') || status.includes('vulnerável')) {
            endangeredSpecies.add(record.especie_cientifica);
          }
          if (status.includes('endêmic')) {
            endemicSpecies.add(record.especie_cientifica);
          }
        });
        
        // Últimas 5 observações
        const sorted = records.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.data || 0);
          const dateB = new Date(b.timestamp || b.data || 0);
          return dateB - dateA;
        });
        
        sorted.slice(0, 5).forEach(obs => {
          recentObservations.push({
            especie: obs.especie_cientifica || 'Não identificada',
            nomePopular: obs.especie_comum || '',
            data: obs.data || obs.timestamp,
            local: obs.local || '',
            icon: getSpeciesIcon(obs.tipo_observacao)
          });
        });
        
        return {
          success: true,
          data: {
            totalSpecies: uniqueSpecies.size,
            totalObservations: records.length,
            endangeredSpecies: endangeredSpecies.size,
            endemicSpecies: endemicSpecies.size,
            recentObservations: recentObservations
          }
        };
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    }
  );
}

function getSpeciesIcon(tipo) {
  const icons = {
    'ave': '🦜',
    'mamifero': '🦁',
    'reptil': '🦎',
    'anfibio': '🐸',
    'peixe': '🐟',
    'inseto': '🦋',
    'planta': '🌿',
    'fungo': '🍄'
  };
  return icons[(tipo || '').toLowerCase()] || '🔬';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPERAÇÕES CRUD ESPECÍFICAS POR ENTIDADE
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Biodiversidade
function apiCreateBiodiversidade(data) {
  return apiCreate(CONFIG.SHEETS.BIODIVERSIDADE, data);
}

function apiReadBiodiversidade(options) {
  return apiRead(CONFIG.SHEETS.BIODIVERSIDADE, options);
}

// Qualidade da Água
function apiCreateQualidadeAgua(data) {
  return apiCreate(CONFIG.SHEETS.QUALIDADE_AGUA, data);
}

function apiReadQualidadeAgua(options) {
  return apiRead(CONFIG.SHEETS.QUALIDADE_AGUA, options);
}

// Qualidade do Solo
function apiCreateQualidadeSolo(data) {
  return apiCreate(CONFIG.SHEETS.QUALIDADE_SOLO, data);
}

function apiReadQualidadeSolo(options) {
  return apiRead(CONFIG.SHEETS.QUALIDADE_SOLO, options);
}

// Visitantes
function apiCreateVisitante(data) {
  return apiCreate(CONFIG.SHEETS.VISITANTES, data);
}

function apiReadVisitantes(options) {
  return apiRead(CONFIG.SHEETS.VISITANTES, options);
}

// Dados Climáticos
function apiCreateDadosClimaticos(data) {
  return apiCreate(CONFIG.SHEETS.DADOS_CLIMA, data);
}

function apiReadDadosClimaticos(options) {
  return apiRead(CONFIG.SHEETS.DADOS_CLIMA, options);
}

// Parcelas Agroflorestais
function apiCreateParcelaAgro(data) {
  return apiCreate(CONFIG.SHEETS.PARCELAS_AGRO, data);
}

function apiReadParcelasAgro(options) {
  return apiRead(CONFIG.SHEETS.PARCELAS_AGRO, options);
}

// Produção Agroflorestal
function apiCreateProducaoAgro(data) {
  return apiCreate(CONFIG.SHEETS.PRODUCAO_AGRO, data);
}

function apiReadProducaoAgro(options) {
  return apiRead(CONFIG.SHEETS.PRODUCAO_AGRO, options);
}

// Terapias
function apiCreateSessaoTerapia(data) {
  return apiCreate(CONFIG.SHEETS.SESSOES, data);
}

function apiReadSessoesTerapia(options) {
  return apiRead(CONFIG.SHEETS.SESSOES, options);
}

// Participantes Terapia
function apiCreateParticipante(data) {
  return apiCreate(CONFIG.SHEETS.PARTICIPANTES, data);
}

function apiReadParticipantes(options) {
  return apiRead(CONFIG.SHEETS.PARTICIPANTES, options);
}


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTERVENÇÃO 1: FUNÇÕES DE API ADICIONAIS
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Waypoints
function apiCreateWaypointData(data) {
  return apiCreate(CONFIG.SHEETS.WAYPOINTS, data);
}

function apiReadWaypoints(options) {
  return apiRead(CONFIG.SHEETS.WAYPOINTS, options);
}

function apiUpdateWaypoint(id, updates) {
  return apiUpdate(CONFIG.SHEETS.WAYPOINTS, id, updates);
}

function apiDeleteWaypoint(id) {
  return apiDelete(CONFIG.SHEETS.WAYPOINTS, id);
}

// Carbono
function apiCreateCarbono(data) {
  return apiCreate(CONFIG.SHEETS.CARBONO, data);
}

function apiReadCarbono(options) {
  return apiRead(CONFIG.SHEETS.CARBONO, options);
}

// Trilhas
function apiCreateTrilha(data) {
  return apiCreate(CONFIG.SHEETS.TRILHAS, data);
}

function apiReadTrilhas(options) {
  return apiRead(CONFIG.SHEETS.TRILHAS, options);
}

/**
 * Obtém estatísticas gerais do sistema
 */
function apiGetSystemStats() {
  return APILayer._wrapCall('System', 'getStats',
    () => {
      try {
        const stats = {};
        const sheets = [
          { key: 'biodiversidade', name: CONFIG.SHEETS.BIODIVERSIDADE },
          { key: 'visitantes', name: CONFIG.SHEETS.VISITANTES },
          { key: 'parcelas', name: CONFIG.SHEETS.PARCELAS_AGRO },
          { key: 'waypoints', name: CONFIG.SHEETS.WAYPOINTS },
          { key: 'qualidadeAgua', name: CONFIG.SHEETS.QUALIDADE_AGUA },
          { key: 'qualidadeSolo', name: CONFIG.SHEETS.QUALIDADE_SOLO }
        ];
        
        sheets.forEach(s => {
          try {
            const sheet = getSheet(s.name);
            stats[s.key] = Math.max(0, sheet.getLastRow() - 1);
          } catch (e) {
            stats[s.key] = 0;
          }
        });
        
        return { success: true, stats: stats };
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    }
  );
}

/**
 * Obtém lista de opções para dropdowns
 */
function apiGetDropdownOptions(tipo) {
  const opcoes = {
    tipoObservacao: ['Visual', 'Auditiva', 'Vestígio', 'Armadilha', 'Camera Trap'],
    statusConservacao: ['LC', 'NT', 'VU', 'EN', 'CR', 'DD', 'NE'],
    habitat: ['Cerrado Típico', 'Cerradão', 'Mata de Galeria', 'Vereda', 'Campo Limpo', 'SAF'],
    tipoVegetacao: ['Cerrado Típico', 'Cerradão', 'Mata de Galeria', 'SAF Jovem', 'SAF Maduro', 'Reflorestamento'],
    tipoTerapia: ['Banho de Floresta', 'Meditação', 'Caminhada', 'Yoga', 'Observação', 'Horta', 'Hidroterapia'],
    tipoUsuario: ['Administrador', 'Terapeuta', 'Tecnico', 'Visitante'],
    texturaSolo: ['Arenosa', 'Média', 'Argilosa', 'Muito Argilosa'],
    categoriaWaypoint: ['Ponto de Interesse', 'Nascente', 'Árvore Notável', 'Fauna', 'Infraestrutura', 'Perigo', 'Outro'],
    dificuldadeTrilha: ['Fácil', 'Moderada', 'Difícil', 'Muito Difícil'],
    propositoVisita: ['Ecoturismo', 'Pesquisa', 'Educação', 'Terapia', 'Voluntariado', 'Outro']
  };
  
  if (tipo && opcoes[tipo]) {
    return { success: true, options: opcoes[tipo] };
  }
  return { success: true, options: opcoes };
}

/**
 * Obtém registros recentes de qualquer planilha
 */
function apiGetRecentRecords(sheetName, limit) {
  const result = apiRead(sheetName, { 
    sortBy: 'timestamp', 
    sortOrder: 'desc', 
    limit: limit || 10 
  });
  return result;
}
