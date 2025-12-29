/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - CONFIGURAÇÃO GLOBAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Configuração central do sistema.
 * 
 * Arquivos relacionados:
 * - ConfigManager.gs: Gerenciamento de feature flags e histórico
 * - ConfigApi.gs: APIs de configuração para frontend
 * - ConfigConstants.gs: Constantes científicas e thresholds
 *
 * @version 4.0.0
 * @date 2025-12-27
 */

const CONFIG = {
  VERSION: '4.0.0',
  APP_NAME: 'Reserva Araras - Sistema Integrado',

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÕES DINÂMICAS (Properties Service)
  // ═══════════════════════════════════════════════════════════════════════
  
  get SPREADSHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') 
      || SpreadsheetApp.getActiveSpreadsheet()?.getId();
  },

  get DRIVE_FOLDER_ID() {
    return PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') 
      || '1AQmPZWfzdaJu7OpJ2IxR-FjwKJiLk1oS';
  },

  // Pasta específica para fotos georeferenciadas
  get PHOTOS_FOLDER_ID() {
    return PropertiesService.getScriptProperties().getProperty('PHOTOS_FOLDER_ID') 
      || PropertiesService.getScriptProperties().getProperty('PHOTOS_FOLDER')
      || '1OmhL1S0maR0x5Xt69PL74zasSpnoCEm2';
  },

  get GEMINI_API_KEY() {
    return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || null;
  },

  get GEMINI_TEMPERATURE() {
    const temp = PropertiesService.getScriptProperties().getProperty('GEMINI_TEMPERATURE');
    return temp !== null ? parseFloat(temp) : 0.2;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LIMITES DO SISTEMA
  // ═══════════════════════════════════════════════════════════════════════
  
  LIMITS: {
    MAX_VARIABLES: 7,
    MAX_SUBJECTS: 7,
    MAX_RECORDS_QUERY: 100,
    MAX_EXECUTION_TIME: 270,
    MAX_CHART_POINTS: 50
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  
  FEATURE_FLAGS: {
    maintenance_mode: false,
    maintenance_message: '',
    maintenance_start: null,
    
    modules: {
      biodiversity: { enabled: true, version: '1.0', description: 'Sistema de Biodiversidade com IA' },
      carbon_tracking: { enabled: true, version: '1.0', description: 'Rastreamento de Carbono' },
      eco_chatbot: { enabled: true, version: '1.0', description: 'Chatbot Educacional' },
      iot_sensors: { enabled: true, version: '1.0', description: 'Sensores IoT' },
      gamification: { enabled: true, version: '1.0', description: 'Sistema de Gamificação' },
      therapy: { enabled: true, version: '1.0', description: 'Terapias na Natureza' },
      external_integrations: { enabled: true, version: '1.0', description: 'Integrações Externas' },
      backup_recovery: { enabled: true, version: '1.0', description: 'Backup e Recuperação' },
      rbac: { enabled: true, version: '1.0', description: 'Controle de Acesso' },
      api_audit: { enabled: true, version: '1.0', description: 'Auditoria de APIs' }
    },
    
    experimental: {
      ai_species_id: { enabled: true, description: 'Identificação de Espécies por IA' },
      predictive_alerts: { enabled: true, description: 'Alertas Preditivos' },
      advanced_analytics: { enabled: false, description: 'Analytics Avançado' },
      real_time_sync: { enabled: false, description: 'Sincronização em Tempo Real' }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NOMES DAS PLANILHAS
  // ═══════════════════════════════════════════════════════════════════════
  
  SHEETS: {
    // Configuração
    CONFIG_HISTORY_RA: 'CONFIG_HISTORY_RA',
    
    // Agrofloresta
    PARCELAS_AGRO: 'ParcelasAgroflorestais',
    PRODUCAO_AGRO: 'ProducaoAgroflorestal',
    ESPECIES_AGRO: 'EspeciesAgroflorestais',
    ORCAMENTO_AGRO_RA: 'ORCAMENTO_AGRO_RA',
    REALOCACAO_LOG_RA: 'REALOCACAO_LOG_RA',

    // Monitoramento Ambiental
    DADOS_CLIMA: 'DadosClimaticos',
    QUALIDADE_AGUA: 'QualidadeAgua',
    QUALIDADE_SOLO: 'QualidadeSolo',
    BIODIVERSIDADE: 'Biodiversidade',
    BIODIVERSIDADE_RA: 'BIODIVERSIDADE_RA',
    SUCESSAO_ECOLOGICA: 'SucessaoEcologica',
    SUCESSAO_ECOLOGICA_RA: 'SUCESSAO_ECOLOGICA_RA',
    ALERTAS_ECOLOGICOS_RA: 'ALERTAS_ECOLOGICOS_RA',
    CORREDORES_ECOLOGICOS_RA: 'CORREDORES_ECOLOGICOS_RA',
    GAMIFICACAO_RA: 'GAMIFICACAO_RA',
    EDUCACAO_AMBIENTAL_RA: 'EDUCACAO_AMBIENTAL_RA',
    INTERACOES_ECOLOGICAS_RA: 'INTERACOES_ECOLOGICAS_RA',
    ESPECIES_INVASORAS_RA: 'ESPECIES_INVASORAS_RA',
    CAMERAS_TRAP_RA: 'CAMERAS_TRAP_RA',
    CAPTURAS_CAMERA_TRAP_RA: 'CAPTURAS_CAMERA_TRAP_RA',
    HEATMAP_BIODIVERSIDADE_RA: 'HEATMAP_BIODIVERSIDADE_RA',
    CLIMA_PREDICOES_RA: 'CLIMA_PREDICOES_RA',
    EVENTOS_EXTREMOS_RA: 'EVENTOS_EXTREMOS_RA',
    PLANTIO_OTIMIZADO_RA: 'PLANTIO_OTIMIZADO_RA',
    FEEDBACK_VISITANTES_RA: 'FEEDBACK_VISITANTES_RA',
    CHATBOT_INTERACOES_RA: 'CHATBOT_INTERACOES_RA',
    RELATORIOS_CIENTIFICOS_RA: 'RELATORIOS_CIENTIFICOS_RA',
    RECOMENDACOES_MANEJO_RA: 'RECOMENDACOES_MANEJO_RA',
    SENSORES_QUALIDADE_AR_RA: 'SENSORES_QUALIDADE_AR_RA',
    CADASTRO_SENSORES_RA: 'CADASTRO_SENSORES_RA',
    SENSORES_UMIDADE_SOLO_RA: 'SENSORES_UMIDADE_SOLO_RA',
    CADASTRO_SENSORES_SOLO_RA: 'CADASTRO_SENSORES_SOLO_RA',
    ESTACAO_METEOROLOGICA_RA: 'ESTACAO_METEOROLOGICA_RA',
    SENSORES_NIVEL_AGUA_RA: 'SENSORES_NIVEL_AGUA_RA',
    CADASTRO_SENSORES_AGUA_RA: 'CADASTRO_SENSORES_AGUA_RA',
    FRAGMENTOS_HABITAT_RA: 'FRAGMENTOS_HABITAT_RA',
    CONEXOES_HABITAT_RA: 'CONEXOES_HABITAT_RA',
    FENOLOGIA_RA: 'FENOLOGIA_RA',
    PREDICOES_FENOLOGIA_RA: 'PREDICOES_FENOLOGIA_RA',
    SERVICOS_ECOSSISTEMICOS_RA: 'SERVICOS_ECOSSISTEMICOS_RA',
    DOENCAS_PLANTAS_RA: 'DOENCAS_PLANTAS_RA',
    PARCELAS_PERMANENTES_RA: 'PARCELAS_PERMANENTES_RA',
    REGENERANTES_RA: 'REGENERANTES_RA',
    CENSOS_REGENERACAO_RA: 'CENSOS_REGENERACAO_RA',
    AMOSTRAS_BANCO_SEMENTES_RA: 'AMOSTRAS_BANCO_SEMENTES_RA',
    GERMINACAO_SEMENTES_RA: 'GERMINACAO_SEMENTES_RA',
    PLANTULAS_BANCO_RA: 'PLANTULAS_BANCO_RA',
    CAPTURAS_AVANCADO_RA: 'CAPTURAS_AVANCADO_RA',
    OCUPACAO_HABITAT_RA: 'OCUPACAO_HABITAT_RA',
    PARCELAS_CARBONO_RA: 'PARCELAS_CARBONO_RA',
    MEDICOES_CARBONO_RA: 'MEDICOES_CARBONO_RA',
    CREDITOS_CARBONO_RA: 'CREDITOS_CARBONO_RA',
    INTEGRACOES_EXTERNAS_RA: 'INTEGRACOES_EXTERNAS_RA',
    DADOS_EXTERNOS_RA: 'DADOS_EXTERNOS_RA',
    BACKUP_LOG_RA: 'BACKUP_LOG_RA',
    RECOVERY_LOG_RA: 'RECOVERY_LOG_RA',
    USUARIOS_RBAC_RA: 'USUARIOS_RBAC_RA',
    AUDIT_LOG_RA: 'AUDIT_LOG_RA',
    TREINAMENTO_RA: 'TREINAMENTO_RA',
    CERTIFICADOS_RA: 'CERTIFICADOS_RA',
    ROADMAP_RA: 'ROADMAP_RA',
    API_AUDIT_RA: 'API_AUDIT_RA',
    VALIDACAO_LOG_RA: 'VALIDACAO_LOG_RA',
    A11Y_AUDIT_RA: 'A11Y_AUDIT_RA',
    CARBONO: 'SequestrosCarbono',

    // Ecoturismo
    VISITANTES: 'Visitantes',
    TRILHAS: 'Trilhas',
    AVALIACOES: 'AvaliacoesEcoturismo',

    // GPS e Waypoints
    GPS_POINTS: 'GPSPoints',
    WAYPOINTS: 'Waypoints',
    ROTAS: 'Rotas',
    FOTOS: 'Fotos',

    // Terapias
    PARTICIPANTES: 'ParticipantesTerapia',
    SESSOES: 'SessoesTerapia',
    AVALIACOES_TERAPIA: 'AvaliacoesTerapeuticas',

    // Fitoterapia
    PLANTAS_MEDICINAIS: 'PlantasMedicinais',
    PREPARACOES: 'PreparacoesFitoterapicas',

    // Sistema
    USUARIOS: 'Usuarios',
    LOGS: 'Logs',
    CONFIGURACOES: 'Configuracoes',
    NOTIFICATION_LOG: 'NotificationLog',
    SYNC_QUEUE: 'SyncQueue'
  },

  // Referência às constantes científicas (definidas em ConfigConstants.gs)
  get CONSTANTS() { return SCIENTIFIC_CONSTANTS; },
  get THRESHOLDS() { return REGULATORY_THRESHOLDS; },
  get CLIMATE_PRIORITIES() { return CLIMATE_PRIORITIES; },
  get RESERVA_CONTEXT() { return RESERVA_CONTEXT; }
};

// ═══════════════════════════════════════════════════════════════════════════
// CACHE E ACESSO A PLANILHAS
// ═══════════════════════════════════════════════════════════════════════════

var _sheetCache = {};
var _spreadsheetCache = null;

/**
 * Obtém a planilha ativa (com cache)
 */
function getSpreadsheet() {
  if (_spreadsheetCache) return _spreadsheetCache;
  
  try {
    _spreadsheetCache = SpreadsheetApp.getActiveSpreadsheet();
    return _spreadsheetCache;
  } catch (e) {
    const spreadsheetId = CONFIG.SPREADSHEET_ID;
    if (spreadsheetId) {
      _spreadsheetCache = SpreadsheetApp.openById(spreadsheetId);
      return _spreadsheetCache;
    }
    throw new Error('Nenhuma planilha disponível. Configure SPREADSHEET_ID.');
  }
}

/**
 * Invalida cache de spreadsheet
 */
function invalidateSpreadsheetCache() {
  _spreadsheetCache = null;
  _sheetCache = {};
}

/**
 * Obtém uma planilha específica (com cache)
 */
function getSheet(sheetName) {
  if (!sheetName || sheetName === 'undefined') return null;
  if (_sheetCache[sheetName]) return _sheetCache[sheetName];

  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    _sheetCache[sheetName] = sheet;
    return sheet;
  } catch (error) {
    Logger.log(`[getSheet] Erro: ${sheetName} - ${error}`);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém todas as configurações do Properties Service
 */
function getEnvironmentConfig() {
  try {
    const props = PropertiesService.getScriptProperties();
    return {
      SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID'),
      DRIVE_FOLDER_ID: props.getProperty('DRIVE_FOLDER_ID'),
      PHOTOS_FOLDER_ID: props.getProperty('PHOTOS_FOLDER_ID') || props.getProperty('PHOTOS_FOLDER'),
      GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY'),
      GEMINI_TEMPERATURE: props.getProperty('GEMINI_TEMPERATURE')
    };
  } catch (error) {
    Logger.log('Erro ao obter configurações: ' + error);
    return null;
  }
}

/**
 * Salva configurações no Properties Service
 */
function saveEnvironmentConfig(config) {
  try {
    const props = PropertiesService.getScriptProperties();
    if (config.SPREADSHEET_ID) props.setProperty('SPREADSHEET_ID', config.SPREADSHEET_ID);
    if (config.DRIVE_FOLDER_ID) props.setProperty('DRIVE_FOLDER_ID', config.DRIVE_FOLDER_ID);
    if (config.PHOTOS_FOLDER_ID) props.setProperty('PHOTOS_FOLDER_ID', config.PHOTOS_FOLDER_ID);
    if (config.GEMINI_API_KEY) props.setProperty('GEMINI_API_KEY', config.GEMINI_API_KEY);
    if (config.GEMINI_TEMPERATURE !== undefined) props.setProperty('GEMINI_TEMPERATURE', config.GEMINI_TEMPERATURE.toString());
    return { success: true, message: 'Configurações salvas' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Verifica se as configurações estão completas
 */
function validateEnvironmentConfig() {
  try {
    const config = getEnvironmentConfig();
    const missing = [];
    if (!config.SPREADSHEET_ID) missing.push('SPREADSHEET_ID');
    if (!config.DRIVE_FOLDER_ID) missing.push('DRIVE_FOLDER_ID');
    if (!config.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
    return { valid: missing.length === 0, missing, config };
  } catch (error) {
    return { valid: false, missing: ['ERROR'], config: null, error: error.toString() };
  }
}
