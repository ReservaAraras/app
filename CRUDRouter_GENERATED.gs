/**
 * CRUDRouter.gs - Router centralizado para todas as operações CRUD
 * Gerado automaticamente pela ferramenta de unificação semântica
 * 
 * NOTA: As funções apiCreate/Read/Update/Delete principais estão em ApiEndpoints.gs
 * Este arquivo fornece routers específicos por entidade via CRUDApis
 */

// Mapeamento de entidades para suas funções CRUD
const ENTITY_MAP = {
  'Parcela': 'Parcela',
  'Producao': 'Producao',
  'EspecieAgro': 'EspecieAgro',
  'DadoClimatico': 'DadoClimatico',
  'QualidadeAgua': 'QualidadeAgua',
  'QualidadeSolo': 'QualidadeSolo',
  'ObservacaoBiodiversidade': 'ObservacaoBiodiversidade',
  'Biodiversidade': 'Biodiversidade',
  'RegistroCarbono': 'RegistroCarbono',
  'Visitante': 'Visitante',
  'Trilha': 'Trilha',
  'AvaliacaoEcoturismo': 'AvaliacaoEcoturismo',
  'GPSPoint': 'GPSPoint',
  'Waypoint': 'Waypoint',
  'Rota': 'Rota',
  'Foto': 'Foto',
  'Participante': 'Participante',
  'Sessao': 'Sessao',
  'AvaliacaoTerapia': 'AvaliacaoTerapia',
  'PlantaMedicinal': 'PlantaMedicinal',
  'Preparacao': 'Preparacao',
  'Usuario': 'Usuario',
  'Log': 'Log',
  'Configuracao': 'Configuracao'
};

/**
 * Router genérico para CREATE por entidade
 * Usa CRUDApis para operações específicas de entidade
 */
function apiEntityCreate(entity, data) {
  try {
    const entityName = ENTITY_MAP[entity];
    if (!entityName) {
      throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    const functionName = `create${entityName}`;
    if (typeof CRUDApis[functionName] === 'function') {
      return CRUDApis[functionName](data);
    }
    
    throw new Error(`Função ${functionName} não encontrada`);
  } catch (error) {
    Logger.log(`Erro em apiEntityCreate: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Router genérico para READ por entidade
 */
function apiEntityRead(entity, filters = {}) {
  try {
    const entityName = ENTITY_MAP[entity];
    if (!entityName) {
      throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    const functionName = `read${entityName}`;
    if (typeof CRUDApis[functionName] === 'function') {
      return CRUDApis[functionName](filters);
    }
    
    throw new Error(`Função ${functionName} não encontrada`);
  } catch (error) {
    Logger.log(`Erro em apiEntityRead: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Router genérico para UPDATE por entidade
 */
function apiEntityUpdate(entity, id, data) {
  try {
    const entityName = ENTITY_MAP[entity];
    if (!entityName) {
      throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    const functionName = `update${entityName}`;
    if (typeof CRUDApis[functionName] === 'function') {
      return CRUDApis[functionName](id, data);
    }
    
    throw new Error(`Função ${functionName} não encontrada`);
  } catch (error) {
    Logger.log(`Erro em apiEntityUpdate: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Router genérico para DELETE por entidade
 */
function apiEntityDelete(entity, id) {
  try {
    const entityName = ENTITY_MAP[entity];
    if (!entityName) {
      throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    const functionName = `delete${entityName}`;
    if (typeof CRUDApis[functionName] === 'function') {
      return CRUDApis[functionName](id);
    }
    
    throw new Error(`Função ${functionName} não encontrada`);
  } catch (error) {
    Logger.log(`Erro em apiEntityDelete: ${error.message}`);
    return { success: false, error: error.message };
  }
}
