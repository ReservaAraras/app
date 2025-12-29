/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRUD Factory - Gerador Dinâmico de APIs CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Elimina código repetitivo gerando funções CRUD automaticamente.
 * Reduz ~500 linhas para ~100 linhas mantendo mesma funcionalidade.
 * 
 * @author Reserva Araras
 * @version 2.0.0
 */

/**
 * Factory para criar operações CRUD para qualquer entidade
 * @param {string} sheetKey - Chave da planilha em CONFIG.SHEETS
 * @returns {Object} Objeto com métodos create, read, readById, readAll, update, delete
 */
function createCRUDOperations(sheetKey) {
  const sheetName = CONFIG.SHEETS[sheetKey];
  
  if (!sheetName) {
    throw new Error(`Sheet key não encontrada: ${sheetKey}`);
  }
  
  return {
    create: (data) => DatabaseService.create(sheetName, data),
    read: (filter, options) => DatabaseService.read(sheetName, filter, options),
    readAll: () => DatabaseService.read(sheetName),
    readById: (id) => DatabaseService.readById(sheetName, id),
    update: (id, updates) => DatabaseService.update(sheetName, id, updates),
    delete: (id, cascade) => DatabaseService.delete(sheetName, id, cascade),
    count: (filter) => DatabaseService.count(sheetName, filter),
    exists: (id) => DatabaseService.exists(sheetName, id),
    upsert: (data) => DatabaseService.upsert(sheetName, data)
  };
}

/**
 * Registry de todas as entidades CRUD do sistema
 */
const CRUD_ENTITIES = {
  // Agrofloresta
  Parcela: 'PARCELAS_AGRO',
  Producao: 'PRODUCAO_AGRO',
  EspecieAgro: 'ESPECIES_AGRO',
  
  // Monitoramento Ambiental
  DadoClimatico: 'DADOS_CLIMA',
  QualidadeAgua: 'QUALIDADE_AGUA',
  QualidadeSolo: 'QUALIDADE_SOLO',
  Biodiversidade: 'BIODIVERSIDADE',
  Carbono: 'CARBONO',
  
  // Ecoturismo
  Visitante: 'VISITANTES',
  Trilha: 'TRILHAS',
  AvaliacaoEcoturismo: 'AVALIACOES',
  
  // GPS e Waypoints
  GPSPoint: 'GPS_POINTS',
  Waypoint: 'WAYPOINTS',
  Rota: 'ROTAS',
  Foto: 'FOTOS',
  
  // Terapias
  Participante: 'PARTICIPANTES',
  Sessao: 'SESSOES',
  AvaliacaoTerapia: 'AVALIACOES_TERAPIA',
  
  // Fitoterapia
  PlantaMedicinal: 'PLANTAS_MEDICINAIS',
  Preparacao: 'PREPARACOES',
  
  // Sistema
  Usuario: 'USUARIOS',
  Log: 'LOGS',
  Configuracao: 'CONFIGURACOES',
  
  // New Entities
  OrcamentoAgro: 'ORCAMENTO_AGRO_RA',
  RealocacaoLog: 'REALOCACAO_LOG_RA',
  BiodiversidadeRA: 'BIODIVERSIDADE_RA',
  HeatmapBiodiversidade: 'HEATMAP_BIODIVERSIDADE_RA',
  BackupLog: 'BACKUP_LOG_RA',
  RecoveryLog: 'RECOVERY_LOG_RA',
  CapturaAvancada: 'CAPTURAS_AVANCADO_RA',
  OcupacaoHabitat: 'OCUPACAO_HABITAT_RA'
};

/**
 * Cache de operações CRUD já criadas
 */
const _crudCache = {};

/**
 * Obtém operações CRUD para uma entidade (com cache)
 * @param {string} entityName - Nome da entidade
 * @returns {Object} Operações CRUD
 */
function getCRUD(entityName) {
  if (!_crudCache[entityName]) {
    const sheetKey = CRUD_ENTITIES[entityName];
    if (!sheetKey) {
      throw new Error(`Entidade não registrada: ${entityName}`);
    }
    _crudCache[entityName] = createCRUDOperations(sheetKey);
  }
  return _crudCache[entityName];
}

/**
 * API Unificada - Executa operação CRUD em qualquer entidade
 * @param {string} entity - Nome da entidade
 * @param {string} operation - create|read|readById|update|delete
 * @param {Object} params - Parâmetros da operação
 */
function executeCRUD(entity, operation, params = {}) {
  try {
    const crud = getCRUD(entity);
    
    switch (operation) {
      case 'create':
        return crud.create(params.data);
      case 'read':
        return crud.read(params.filter, params.options);
      case 'readAll':
        return crud.readAll();
      case 'readById':
        return crud.readById(params.id);
      case 'update':
        return crud.update(params.id, params.updates);
      case 'delete':
        return crud.delete(params.id, params.cascade);
      case 'count':
        return crud.count(params.filter);
      case 'exists':
        return crud.exists(params.id);
      case 'upsert':
        return crud.upsert(params.data);
      default:
        return { success: false, error: `Operação inválida: ${operation}` };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES LEGADAS - Mantidas para compatibilidade retroativa
// ═══════════════════════════════════════════════════════════════════════════

// Agrofloresta
function createParcela(data) { return getCRUD('Parcela').create(data); }
function readParcelas(filter, options) { return getCRUD('Parcela').read(filter, options); }
function readAllParcelas() { return getCRUD('Parcela').readAll(); }
function readParcelaById(id) { return getCRUD('Parcela').readById(id); }
function updateParcela(id, updates) { return getCRUD('Parcela').update(id, updates); }
function deleteParcela(id, cascade) { return getCRUD('Parcela').delete(id, cascade); }

function createProducao(data) { return getCRUD('Producao').create(data); }
function readProducao(filter, options) { return getCRUD('Producao').read(filter, options); }
function readProducaoById(id) { return getCRUD('Producao').readById(id); }
function readProducoesByParcela(parcelaId) { return getCRUD('Producao').read({ parcela_id: parcelaId }); }
function updateProducao(id, updates) { return getCRUD('Producao').update(id, updates); }
function deleteProducao(id) { return getCRUD('Producao').delete(id); }

function createEspecieAgro(data) { return getCRUD('EspecieAgro').create(data); }
function readEspeciesAgro(filter, options) { return getCRUD('EspecieAgro').read(filter, options); }
function updateEspecieAgro(id, updates) { return getCRUD('EspecieAgro').update(id, updates); }
function deleteEspecieAgro(id) { return getCRUD('EspecieAgro').delete(id); }

// Monitoramento Ambiental
function createDadoClimatico(data) { return getCRUD('DadoClimatico').create(data); }
function readDadosClimaticos(filter, options) { return getCRUD('DadoClimatico').read(filter, options); }
function updateDadoClimatico(id, updates) { return getCRUD('DadoClimatico').update(id, updates); }
function deleteDadoClimatico(id) { return getCRUD('DadoClimatico').delete(id); }

function createQualidadeAgua(data) { return getCRUD('QualidadeAgua').create(data); }
function readQualidadeAgua(filter, options) { return getCRUD('QualidadeAgua').read(filter, options); }
function readQualidadeAguaById(id) { return getCRUD('QualidadeAgua').readById(id); }
function updateQualidadeAgua(id, updates) { return getCRUD('QualidadeAgua').update(id, updates); }
function deleteQualidadeAgua(id) { return getCRUD('QualidadeAgua').delete(id); }

function createQualidadeSolo(data) { return getCRUD('QualidadeSolo').create(data); }
function readQualidadeSolo(filter, options) { return getCRUD('QualidadeSolo').read(filter, options); }
function updateQualidadeSolo(id, updates) { return getCRUD('QualidadeSolo').update(id, updates); }
function deleteQualidadeSolo(id) { return getCRUD('QualidadeSolo').delete(id); }

function createObservacaoBiodiversidade(data) { return getCRUD('Biodiversidade').create(data); }
function readObservacoesBiodiversidade(filter, options) { return getCRUD('Biodiversidade').read(filter, options); }
function createBiodiversidade(data) { return getCRUD('Biodiversidade').create(data); }
function readBiodiversidadeById(id) { return getCRUD('Biodiversidade').readById(id); }
function updateBiodiversidade(id, updates) { return getCRUD('Biodiversidade').update(id, updates); }
function updateObservacaoBiodiversidade(id, updates) { return getCRUD('Biodiversidade').update(id, updates); }
function deleteBiodiversidade(id) { return getCRUD('Biodiversidade').delete(id); }
function deleteObservacaoBiodiversidade(id) { return getCRUD('Biodiversidade').delete(id); }

function createRegistroCarbono(data) { return getCRUD('Carbono').create(data); }
function readRegistrosCarbono(filter, options) { return getCRUD('Carbono').read(filter, options); }
function updateRegistroCarbono(id, updates) { return getCRUD('Carbono').update(id, updates); }
function deleteRegistroCarbono(id) { return getCRUD('Carbono').delete(id); }

// Ecoturismo
function createVisitante(data) { return getCRUD('Visitante').create(data); }
function readVisitantes(filter, options) { return getCRUD('Visitante').read(filter, options); }
function readVisitanteById(id) { return getCRUD('Visitante').readById(id); }
function updateVisitante(id, updates) { return getCRUD('Visitante').update(id, updates); }
function deleteVisitante(id, cascade) { return getCRUD('Visitante').delete(id, cascade); }

function createTrilha(data) { return getCRUD('Trilha').create(data); }
function readTrilhas(filter, options) { return getCRUD('Trilha').read(filter, options); }
function readTrilhaById(id) { return getCRUD('Trilha').readById(id); }
function updateTrilha(id, updates) { return getCRUD('Trilha').update(id, updates); }
function deleteTrilha(id, cascade) { return getCRUD('Trilha').delete(id, cascade); }

function createAvaliacaoEcoturismo(data) { return getCRUD('AvaliacaoEcoturismo').create(data); }
function readAvaliacoesEcoturismo(filter, options) { return getCRUD('AvaliacaoEcoturismo').read(filter, options); }
function updateAvaliacaoEcoturismo(id, updates) { return getCRUD('AvaliacaoEcoturismo').update(id, updates); }
function deleteAvaliacaoEcoturismo(id) { return getCRUD('AvaliacaoEcoturismo').delete(id); }

// GPS e Waypoints
function createGPSPoint(data) { return getCRUD('GPSPoint').create(data); }
function readGPSPoints(filter, options) { return getCRUD('GPSPoint').read(filter, options); }
function updateGPSPoint(id, updates) { return getCRUD('GPSPoint').update(id, updates); }
function deleteGPSPoint(id) { return getCRUD('GPSPoint').delete(id); }

function createWaypoint(data) { return getCRUD('Waypoint').create(data); }
function readWaypoints(filter, options) { return getCRUD('Waypoint').read(filter, options); }
function readWaypointById(id) { return getCRUD('Waypoint').readById(id); }
function updateWaypoint(id, updates) { return getCRUD('Waypoint').update(id, updates); }
function deleteWaypoint(id, cascade) { return getCRUD('Waypoint').delete(id, cascade); }

function createRota(data) { return getCRUD('Rota').create(data); }
function readRotas(filter, options) { return getCRUD('Rota').read(filter, options); }
function updateRota(id, updates) { return getCRUD('Rota').update(id, updates); }
function deleteRota(id) { return getCRUD('Rota').delete(id); }

function createFoto(data) { return getCRUD('Foto').create(data); }
function readFotos(filter, options) { return getCRUD('Foto').read(filter, options); }
function readFotoById(id) { return getCRUD('Foto').readById(id); }
function updateFoto(id, updates) { return getCRUD('Foto').update(id, updates); }
function deleteFoto(id) { return getCRUD('Foto').delete(id); }

// Terapias
function createParticipante(data) { return getCRUD('Participante').create(data); }
function readParticipantes(filter, options) { return getCRUD('Participante').read(filter, options); }
function readParticipanteById(id) { return getCRUD('Participante').readById(id); }
function updateParticipante(id, updates) { return getCRUD('Participante').update(id, updates); }
function deleteParticipante(id, cascade) { return getCRUD('Participante').delete(id, cascade); }
function createParticipanteTerapia(data) { return getCRUD('Participante').create(data); }
function readParticipanteTerapiaById(id) { return getCRUD('Participante').readById(id); }
function updateParticipanteTerapia(id, updates) { return getCRUD('Participante').update(id, updates); }
function deleteParticipanteTerapia(id, cascade) { return getCRUD('Participante').delete(id, cascade); }

function createSessao(data) { return getCRUD('Sessao').create(data); }
function readSessoes(filter, options) { return getCRUD('Sessao').read(filter, options); }
function updateSessao(id, updates) { return getCRUD('Sessao').update(id, updates); }
function deleteSessao(id) { return getCRUD('Sessao').delete(id); }

function createAvaliacaoTerapia(data) { return getCRUD('AvaliacaoTerapia').create(data); }
function readAvaliacoesTerapia(filter, options) { return getCRUD('AvaliacaoTerapia').read(filter, options); }
function updateAvaliacaoTerapia(id, updates) { return getCRUD('AvaliacaoTerapia').update(id, updates); }
function deleteAvaliacaoTerapia(id) { return getCRUD('AvaliacaoTerapia').delete(id); }

// Fitoterapia
function createPlantaMedicinal(data) { return getCRUD('PlantaMedicinal').create(data); }
function readPlantasMedicinais(filter, options) { return getCRUD('PlantaMedicinal').read(filter, options); }
function readPlantaMedicinalById(id) { return getCRUD('PlantaMedicinal').readById(id); }
function updatePlantaMedicinal(id, updates) { return getCRUD('PlantaMedicinal').update(id, updates); }
function deletePlantaMedicinal(id, cascade) { return getCRUD('PlantaMedicinal').delete(id, cascade); }

function createPreparacao(data) { return getCRUD('Preparacao').create(data); }
function readPreparacoes(filter, options) { return getCRUD('Preparacao').read(filter, options); }
function updatePreparacao(id, updates) { return getCRUD('Preparacao').update(id, updates); }
function deletePreparacao(id) { return getCRUD('Preparacao').delete(id); }

// Sistema
function createUsuario(data) { return getCRUD('Usuario').create(data); }
function readUsuarios(filter, options) { return getCRUD('Usuario').read(filter, options); }
function updateUsuario(id, updates) { return getCRUD('Usuario').update(id, updates); }
function deleteUsuario(id) { return getCRUD('Usuario').delete(id); }

function createLog(data) { return getCRUD('Log').create(data); }
function readLogs(filter, options) { return getCRUD('Log').read(filter, options); }
function updateLog(id, updates) { return getCRUD('Log').update(id, updates); }
function deleteLog(id) { return getCRUD('Log').delete(id); }

function createConfiguracao(data) { return getCRUD('Configuracao').create(data); }
function readConfiguracoes(filter, options) { return getCRUD('Configuracao').read(filter, options); }
function updateConfiguracao(id, updates) { return getCRUD('Configuracao').update(id, updates); }
function deleteConfiguracao(id) { return getCRUD('Configuracao').delete(id); }

// Generated CRUD Functions for New Entities
function createOrcamentoAgro(data) { return getCRUD('OrcamentoAgro').create(data); }
function readOrcamentoAgro(filter, options) { return getCRUD('OrcamentoAgro').read(filter, options); }
function updateOrcamentoAgro(id, updates) { return getCRUD('OrcamentoAgro').update(id, updates); }
function deleteOrcamentoAgro(id) { return getCRUD('OrcamentoAgro').delete(id); }

function createRealocacaoLog(data) { return getCRUD('RealocacaoLog').create(data); }
function readRealocacaoLog(filter, options) { return getCRUD('RealocacaoLog').read(filter, options); }

function createBiodiversidadeRA(data) { return getCRUD('BiodiversidadeRA').create(data); }
function readBiodiversidadeRA(filter, options) { return getCRUD('BiodiversidadeRA').read(filter, options); }
function updateBiodiversidadeRA(id, updates) { return getCRUD('BiodiversidadeRA').update(id, updates); }
function deleteBiodiversidadeRA(id) { return getCRUD('BiodiversidadeRA').delete(id); }

function createHeatmapBiodiversidade(data) { return getCRUD('HeatmapBiodiversidade').create(data); }
function readHeatmapBiodiversidade(filter, options) { return getCRUD('HeatmapBiodiversidade').read(filter, options); }

function createBackupLog(data) { return getCRUD('BackupLog').create(data); }
function readBackupLog(filter, options) { return getCRUD('BackupLog').read(filter, options); }

function createRecoveryLog(data) { return getCRUD('RecoveryLog').create(data); }
function readRecoveryLog(filter, options) { return getCRUD('RecoveryLog').read(filter, options); }

function createCapturaAvancada(data) { return getCRUD('CapturaAvancada').create(data); }
function readCapturaAvancada(filter, options) { return getCRUD('CapturaAvancada').read(filter, options); }
function updateCapturaAvancada(id, updates) { return getCRUD('CapturaAvancada').update(id, updates); }
function deleteCapturaAvancada(id) { return getCRUD('CapturaAvancada').delete(id); }

function createOcupacaoHabitat(data) { return getCRUD('OcupacaoHabitat').create(data); }
function readOcupacaoHabitat(filter, options) { return getCRUD('OcupacaoHabitat').read(filter, options); }

// Funções auxiliares
function countRecords(sheetName, filter) { return DatabaseService.count(sheetName, filter); }
function recordExists(sheetName, id) { return DatabaseService.exists(sheetName, id); }
function upsertRecord(sheetName, data) { return DatabaseService.upsert(sheetName, data); }

// APIs AgroforestryService
function apiCalculateCarbonSequestration(parcelaId) { return AgroforestryService.calculateCarbonSequestration(parcelaId); }
function apiAnalyzeProductivity(parcelaId, periodo) { return AgroforestryService.analyzeProductivity(parcelaId, periodo); }
function apiAnalyzeEconomicViability(parcelaId) { return AgroforestryService.analyzeEconomicViability(parcelaId); }
function apiAnalyzeBiodiversityImpact(parcelaId) { return AgroforestryService.analyzeBiodiversityImpact(parcelaId); }
