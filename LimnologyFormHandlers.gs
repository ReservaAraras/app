/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY FORM HANDLERS - Handlers Padronizados para Formulários Limnológicos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 4/13: Padronização de Formulários
 * 
 * Este arquivo contém handlers para todos os formulários de monitoramento
 * limnológico, com validação defensiva e integração com o banco de dados.
 * 
 * Formulários cobertos:
 * - Físico-Químico (PhysicochemicalForm)
 * - Fitoplâncton (PhytoplanktonForm)
 * - Zooplâncton (ZooplanktonForm)
 * - Macrófitas (MacrophytesForm)
 * - Bentos (BenthicForm)
 * - Ictiofauna (IchthyofaunaForm)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE PLANILHAS
// ═══════════════════════════════════════════════════════════════════════════

const LIMNOLOGY_SHEETS = {
  PHYSICOCHEMICAL: 'QualidadeAgua',
  PHYTOPLANKTON: 'Fitoplancton_RA',
  ZOOPLANKTON: 'Zooplancton_RA',
  MACROPHYTES: 'Macrofitas_RA',
  BENTHIC: 'Bentos_RA',
  ICHTHYOFAUNA: 'Ictiofauna_RA',
  LIMNOLOGY: 'Limnologia_RA'
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO DEFENSIVA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida e sanitiza dados de entrada
 * @param {Object} data - Dados do formulário
 * @param {Array} requiredFields - Campos obrigatórios
 * @returns {Object} - { valid: boolean, data: Object, errors: Array }
 */
function validateLimnologyData(data, requiredFields) {
  var errors = [];
  var sanitized = {};
  
  // Verifica se data existe
  if (!data || typeof data !== 'object') {
    return { valid: false, data: null, errors: ['Dados inválidos ou ausentes'] };
  }
  
  // Valida campos obrigatórios
  requiredFields = requiredFields || [];
  requiredFields.forEach(function(field) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push('Campo obrigatório ausente: ' + field);
    }
  });
  
  // Sanitiza e converte dados
  Object.keys(data).forEach(function(key) {
    var value = data[key];
    
    // Remove espaços extras de strings
    if (typeof value === 'string') {
      value = value.trim();
    }
    
    // Converte campos numéricos conhecidos
    var numericFields = [
      'latitude', 'longitude', 'profundidade', 'temperatura', 'ph',
      'oxigenio_dissolvido', 'condutividade', 'turbidez', 'transparencia',
      'alcalinidade', 'dureza', 'clorofila_a', 'nitrogenio_total',
      'fosforo_total', 'silicato', 'abundancia', 'biomassa', 'riqueza',
      'densidade', 'comprimento', 'peso', 'quantidade'
    ];
    
    if (numericFields.indexOf(key) !== -1 && value !== '' && value !== null) {
      var num = parseFloat(value);
      if (!isNaN(num)) {
        value = num;
      }
    }
    
    sanitized[key] = value;
  });
  
  // Adiciona metadados
  sanitized.id = sanitized.id || Utilities.getUuid();
  sanitized.timestamp = sanitized.timestamp || new Date().toISOString();
  
  return {
    valid: errors.length === 0,
    data: sanitized,
    errors: errors
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: FÍSICO-QUÍMICO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados físico-químicos
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function savePhysicochemicalData(formData) {
  try {
    var requiredFields = ['local', 'data', 'latitude', 'longitude'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    // Prepara registro
    var record = {
      id: data.id,
      timestamp: data.timestamp,
      data: data.data,
      hora: data.hora || '',
      local: data.local,
      latitude: data.latitude,
      longitude: data.longitude,
      profundidade: data.profundidade || 0,
      temperatura: data.temperatura,
      ph: data.ph,
      oxigenio_dissolvido: data.oxigenio_dissolvido,
      saturacao_oxigenio: data.saturacao_oxigenio || '',
      condutividade: data.condutividade,
      turbidez: data.turbidez,
      transparencia: data.transparencia,
      cor: data.cor || '',
      alcalinidade: data.alcalinidade,
      dureza: data.dureza,
      clorofila_a: data.clorofila_a,
      nitrogenio_total: data.nitrogenio_total,
      nitrogenio_amoniacal: data.nitrogenio_amoniacal || '',
      nitrato: data.nitrato || '',
      nitrito: data.nitrito || '',
      fosforo_total: data.fosforo_total,
      ortofosfato: data.ortofosfato || '',
      silicato: data.silicato || '',
      dbo: data.dbo || '',
      dqo: data.dqo || '',
      solidos_totais: data.solidos_totais || '',
      coliformes: data.coliformes || '',
      responsavel: data.responsavel || '',
      observacoes: data.observacoes || ''
    };
    
    // Salva no banco
    var result = DatabaseService.create(LIMNOLOGY_SHEETS.PHYSICOCHEMICAL, record);
    
    if (result.success) {
      Logger.log('✓ Dados físico-químicos salvos: ' + result.id);
      return { success: true, id: result.id, message: 'Dados salvos com sucesso' };
    } else {
      return { success: false, error: result.error || 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em savePhysicochemicalData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: FITOPLÂNCTON
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados de fitoplâncton
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function savePhytoplanktonData(formData) {
  try {
    var requiredFields = ['local', 'data', 'metodo_coleta'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    var record = {
      id: data.id,
      timestamp: data.timestamp,
      data: data.data,
      hora: data.hora || '',
      local: data.local,
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      profundidade: data.profundidade || 0,
      metodo_coleta: data.metodo_coleta,
      volume_filtrado: data.volume_filtrado || '',
      rede_abertura: data.rede_abertura || '',
      fixador: data.fixador || 'Lugol',
      temperatura_agua: data.temperatura_agua || '',
      transparencia: data.transparencia || '',
      divisao: data.divisao || '',
      classe: data.classe || '',
      ordem: data.ordem || '',
      familia: data.familia || '',
      genero: data.genero || '',
      especie: data.especie || '',
      abundancia: data.abundancia || 0,
      densidade: data.densidade || '',
      biovolume: data.biovolume || '',
      clorofila_a: data.clorofila_a || '',
      indice_shannon: data.indice_shannon || '',
      indice_simpson: data.indice_simpson || '',
      dominancia: data.dominancia || '',
      responsavel: data.responsavel || '',
      observacoes: data.observacoes || ''
    };
    
    var result = DatabaseService.create(LIMNOLOGY_SHEETS.PHYTOPLANKTON, record);
    
    if (result.success) {
      Logger.log('✓ Dados de fitoplâncton salvos: ' + result.id);
      return { success: true, id: result.id, message: 'Dados salvos com sucesso' };
    } else {
      return { success: false, error: result.error || 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em savePhytoplanktonData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: ZOOPLÂNCTON
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados de zooplâncton
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function saveZooplanktonData(formData) {
  try {
    var requiredFields = ['local', 'data', 'metodo_coleta'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    var record = {
      id: data.id,
      timestamp: data.timestamp,
      data: data.data,
      hora: data.hora || '',
      local: data.local,
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      profundidade: data.profundidade || 0,
      metodo_coleta: data.metodo_coleta,
      volume_filtrado: data.volume_filtrado || '',
      rede_abertura: data.rede_abertura || '',
      fixador: data.fixador || 'Formol 4%',
      temperatura_agua: data.temperatura_agua || '',
      grupo: data.grupo || '',
      ordem: data.ordem || '',
      familia: data.familia || '',
      genero: data.genero || '',
      especie: data.especie || '',
      estagio: data.estagio || '',
      sexo: data.sexo || '',
      abundancia: data.abundancia || 0,
      densidade: data.densidade || '',
      biomassa: data.biomassa || '',
      comprimento_medio: data.comprimento_medio || '',
      indice_shannon: data.indice_shannon || '',
      riqueza: data.riqueza || '',
      responsavel: data.responsavel || '',
      observacoes: data.observacoes || ''
    };
    
    var result = DatabaseService.create(LIMNOLOGY_SHEETS.ZOOPLANKTON, record);
    
    if (result.success) {
      Logger.log('✓ Dados de zooplâncton salvos: ' + result.id);
      return { success: true, id: result.id, message: 'Dados salvos com sucesso' };
    } else {
      return { success: false, error: result.error || 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em saveZooplanktonData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: MACRÓFITAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados de macrófitas
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function saveMacrophytesData(formData) {
  try {
    var requiredFields = ['local', 'data', 'tipo_macrofita', 'especie_predominante', 'cobertura_percentual'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    // Validação de cobertura percentual
    var cobertura = parseFloat(data.cobertura_percentual) || 0;
    if (cobertura < 0 || cobertura > 100) {
      return { success: false, error: 'Cobertura percentual deve estar entre 0 e 100' };
    }
    
    var record = {
      id: data.id,
      timestamp: data.timestamp,
      data: data.data,
      hora: data.hora || '',
      local: data.local,
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      tipo_macrofita: data.tipo_macrofita,
      especie_predominante: data.especie_predominante,
      nome_cientifico: data.nome_cientifico || '',
      cobertura_percentual: cobertura,
      area_estimada: data.area_estimada || '',
      densidade: data.densidade || '',
      altura_media: data.altura_media || '',
      profundidade: data.profundidade || '',
      velocidade_corrente: data.velocidade_corrente || '',
      estado_conservacao: data.estado_conservacao || '',
      impactos_observados: data.impactos_observados || '',
      responsavel: data.responsavel || '',
      observacoes: data.observacoes || ''
    };
    
    var result = DatabaseService.create(LIMNOLOGY_SHEETS.MACROPHYTES, record);
    
    if (result.success) {
      Logger.log('✓ Dados de macrófitas salvos: ' + result.id);
      
      // Alerta se cobertura muito alta (possível eutrofização)
      var alertMsg = cobertura > 75 ? ' ⚠️ Cobertura alta detectada!' : '';
      return { success: true, id: result.id, message: 'Dados salvos com sucesso' + alertMsg };
    } else {
      return { success: false, error: result.error || 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em saveMacrophytesData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: BENTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados de bentos
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function saveBenthicData(formData) {
  try {
    var requiredFields = ['local', 'data', 'metodo_coleta'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    var record = {
      id: data.id,
      timestamp: data.timestamp,
      data: data.data,
      hora: data.hora || '',
      local: data.local,
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      profundidade: data.profundidade || 0,
      metodo_coleta: data.metodo_coleta,
      amostrador: data.amostrador || '',
      area_amostrada: data.area_amostrada || '',
      replicas: data.replicas || 1,
      substrato: data.substrato || '',
      tipo_sedimento: data.tipo_sedimento || '',
      materia_organica: data.materia_organica || '',
      grupo: data.grupo || '',
      ordem: data.ordem || '',
      familia: data.familia || '',
      genero: data.genero || '',
      especie: data.especie || '',
      abundancia: data.abundancia || 0,
      densidade: data.densidade || '',
      biomassa: data.biomassa || '',
      grupo_funcional: data.grupo_funcional || '',
      tolerancia: data.tolerancia || '',
      indice_bmwp: data.indice_bmwp || '',
      indice_ibb: data.indice_ibb || '',
      indice_shannon: data.indice_shannon || '',
      responsavel: data.responsavel || '',
      observacoes: data.observacoes || ''
    };
    
    var result = DatabaseService.create(LIMNOLOGY_SHEETS.BENTHIC, record);
    
    if (result.success) {
      Logger.log('✓ Dados de bentos salvos: ' + result.id);
      return { success: true, id: result.id, message: 'Dados salvos com sucesso' };
    } else {
      return { success: false, error: result.error || 'Erro ao salvar dados' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em saveBenthicData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: ICTIOFAUNA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Salva dados de ictiofauna (suporta múltiplas espécies por coleta)
 * @param {Object} formData - Dados do formulário
 * @returns {Object} - Resultado da operação
 */
function saveIchthyofaunaData(formData) {
  try {
    var requiredFields = ['local', 'data', 'metodo_coleta'];
    var validation = validateLimnologyData(formData, requiredFields);
    
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    var data = validation.data;
    
    // Verifica se há espécies
    var especies = data.especies || [];
    if (!Array.isArray(especies) || especies.length === 0) {
      return { success: false, error: 'Adicione pelo menos uma espécie' };
    }
    
    // Valida espécies
    for (var i = 0; i < especies.length; i++) {
      var sp = especies[i];
      if (!sp.nome || !sp.quantidade) {
        return { success: false, error: 'Preencha nome e quantidade de todas as espécies' };
      }
    }
    
    // Gera ID único para a coleta
    var coletaId = data.id || Utilities.getUuid();
    var savedRecords = [];
    
    // Salva cada espécie como um registro separado
    for (var j = 0; j < especies.length; j++) {
      var especie = especies[j];
      
      var record = {
        id: Utilities.getUuid(),
        coleta_id: coletaId,
        timestamp: data.timestamp,
        data: data.data,
        hora: data.hora || '',
        local: data.local,
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        metodo_coleta: data.metodo_coleta,
        nome_popular: especie.nome,
        nome_cientifico: especie.nome_cientifico || '',
        quantidade: parseInt(especie.quantidade) || 1,
        comprimento_medio: especie.comprimento_medio || '',
        peso_medio: especie.peso_medio || '',
        estagio_vida: especie.estagio_vida || '',
        observacoes_especie: especie.observacoes || '',
        responsavel: data.responsavel || '',
        observacoes: data.observacoes || ''
      };
      
      var result = DatabaseService.create(LIMNOLOGY_SHEETS.ICHTHYOFAUNA, record);
      
      if (result.success) {
        savedRecords.push(result.id);
      } else {
        Logger.log('✗ Erro ao salvar espécie ' + (j + 1) + ': ' + result.error);
      }
    }
    
    if (savedRecords.length > 0) {
      Logger.log('✓ Dados de ictiofauna salvos: ' + savedRecords.length + ' espécies');
      return { 
        success: true, 
        id: coletaId, 
        records: savedRecords.length,
        message: savedRecords.length + ' espécie(s) salva(s) com sucesso' 
      };
    } else {
      return { success: false, error: 'Nenhuma espécie foi salva' };
    }
    
  } catch (error) {
    Logger.log('✗ Erro em saveIchthyofaunaData: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém locais de coleta para dropdown
 * @returns {Array} - Lista de locais
 */
function getLimnologyLocations() {
  try {
    // Busca locais únicos das coletas anteriores
    var sheet = getSheet(LIMNOLOGY_SHEETS.PHYSICOCHEMICAL);
    if (!sheet || sheet.getLastRow() < 2) {
      return getDefaultLimnologyLocations();
    }
    
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var localIndex = headers.indexOf('local');
    
    if (localIndex === -1) {
      return getDefaultLimnologyLocations();
    }
    
    var locations = {};
    data.forEach(function(row) {
      var local = row[localIndex];
      if (local && local.trim()) {
        locations[local.trim()] = true;
      }
    });
    
    var result = Object.keys(locations).sort();
    return result.length > 0 ? result : getDefaultLimnologyLocations();
    
  } catch (error) {
    Logger.log('Erro ao obter locais: ' + error);
    return getDefaultLimnologyLocations();
  }
}

/**
 * Retorna locais padrão
 */
function getDefaultLimnologyLocations() {
  return [
    'Nascente Principal',
    'Córrego das Araras',
    'Lago Central',
    'Rio Terra Ronca',
    'Vereda do Buritizal',
    'Represa Norte',
    'Ponto de Captação'
  ];
}

/**
 * Abre formulário de coleta limnológica (usa versões padronizadas)
 * @param {string} formType - Tipo do formulário
 */
function openLimnologyForm(formType) {
  var formMap = {
    'physicochemical': 'PhysicochemicalForm_Padronizado',
    'phytoplankton': 'PhytoplanktonForm_Padronizado',
    'zooplankton': 'ZooplanktonForm_Padronizado',
    'macrophytes': 'MacrophytesForm_Padronizado',
    'benthic': 'BenthicForm_Padronizado',
    'ichthyofauna': 'IchthyofaunaForm_Padronizado',
    'limnology': 'LimnologyForm'
  };
  
  var formName = formMap[formType] || formMap['physicochemical'];
  
  var html = HtmlService.createTemplateFromFile(formName)
    .evaluate()
    .setTitle('Coleta Limnológica')
    .setWidth(400)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Abre formulário original (não padronizado) - para compatibilidade
 * @param {string} formType - Tipo do formulário
 */
function openLimnologyFormOriginal(formType) {
  var formMap = {
    'physicochemical': 'PhysicochemicalForm',
    'phytoplankton': 'PhytoplanktonForm',
    'zooplankton': 'ZooplanktonForm',
    'macrophytes': 'MacrophytesForm',
    'benthic': 'BenthicForm',
    'ichthyofauna': 'IchthyofaunaForm'
  };
  
  var formName = formMap[formType] || formMap['physicochemical'];
  
  var html = HtmlService.createTemplateFromFile(formName)
    .evaluate()
    .setTitle('Coleta Limnológica')
    .setWidth(400)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showSidebar(html);
}
