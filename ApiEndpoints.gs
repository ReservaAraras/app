/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API ENDPOINTS - Funções expostas para o Frontend
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Centraliza todas as APIs chamadas pelo frontend via google.script.run
 * Extraído do Code.gs para melhor organização e manutenibilidade.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUTENTICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API de autenticação
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Object} Resultado da autenticação
 */
function apiAuthenticate(email, password) {
  return _safeExecute('apiAuthenticate', () => AuthService.authenticate(email, password));
}

/**
 * API de validação de sessão
 * @param {string} token - Token de sessão
 * @returns {Object} Resultado da validação
 */
function apiValidateSession(token) {
  if (!token) return { success: false, message: 'Token não fornecido' };
  return _safeExecute('apiValidateSession', () => AuthService.validateSession(token));
}

/**
 * API de validação rápida de sessão (apenas verifica se existe)
 * @param {string} token - Token de sessão
 * @returns {Object} { valid: boolean, userType?: string }
 */
function apiQuickValidateSession(token) {
  if (!token) return { valid: false };
  
  try {
    const cache = CacheService.getUserCache();
    const sessionData = cache.get('session_' + token);
    
    if (!sessionData) return { valid: false };
    
    const session = JSON.parse(sessionData);
    const expiresAt = new Date(session.expiresAt);
    
    return { 
      valid: expiresAt > new Date(),
      userType: session.userType
    };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * API de logout
 * @param {string} token - Token de sessão
 * @returns {Object} Resultado do logout
 */
function apiLogout(token) {
  return _safeExecute('apiLogout', () => AuthService.logout(token));
}

/**
 * API de criação de usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Object} Resultado da criação
 */
function apiCreateUser(userData) {
  return _safeExecute('apiCreateUser', () => AuthService.createUser(userData));
}

/**
 * API de inicialização de usuários padrão
 * @returns {Object} Resultado da inicialização
 */
function apiInitializeDefaultUsers() {
  return _safeExecute('apiInitializeDefaultUsers', () => AuthService.initializeDefaultUsers());
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD GENÉRICO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API genérica de criação
 * @param {string} sheetName - Nome da planilha
 * @param {Object} data - Dados a criar
 * @returns {Object} Resultado da criação
 */
function apiCreate(sheetName, data) {
  return _safeExecute('apiCreate', () => SheetsService.create(sheetName, data));
}

/**
 * API genérica de leitura
 * @param {string} sheetName - Nome da planilha
 * @param {Object} filter - Filtros opcionais
 * @param {Object} options - Opções de leitura
 * @returns {Object} Resultado da leitura
 */
function apiRead(sheetName, filter, options) {
  return _safeExecute('apiRead', () => SheetsService.read(sheetName, filter || {}, options || {}));
}

/**
 * API genérica de leitura por ID
 * @param {string} sheetName - Nome da planilha
 * @param {string} id - ID do registro
 * @returns {Object} Resultado da leitura
 */
function apiReadById(sheetName, id) {
  return _safeExecute('apiReadById', () => SheetsService.readById(sheetName, id));
}

/**
 * API genérica de atualização
 * @param {string} sheetName - Nome da planilha
 * @param {string} id - ID do registro
 * @param {Object} updates - Dados a atualizar
 * @returns {Object} Resultado da atualização
 */
function apiUpdate(sheetName, id, updates) {
  return _safeExecute('apiUpdate', () => SheetsService.update(sheetName, id, updates));
}

/**
 * API genérica de exclusão
 * @param {string} sheetName - Nome da planilha
 * @param {string} id - ID do registro
 * @param {boolean} cascade - Se deve excluir em cascata
 * @returns {Object} Resultado da exclusão
 */
function apiDelete(sheetName, id, cascade) {
  return _safeExecute('apiDelete', () => SheetsService.delete(sheetName, id, cascade || false));
}

/**
 * API genérica de contagem
 * @param {string} sheetName - Nome da planilha
 * @param {Object} filter - Filtros opcionais
 * @returns {Object} Resultado da contagem
 */
function apiCount(sheetName, filter) {
  return _safeExecute('apiCount', () => SheetsService.count(sheetName, filter || {}));
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS E DADOS INICIAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API de estatísticas globais - OTIMIZADA
 * @returns {Object} Estatísticas do sistema
 */
function apiGetStatistics() {
  try {
    if (typeof MobileOptimization !== 'undefined') {
      const result = MobileOptimization.getQuickStats();
      if (result.success) {
        result.stats.waypoints = result.stats.waypoints || 0;
        result.stats.fotos = result.stats.fotos || result.stats.photos || 0;
        result.stats.trilhas = result.stats.trilhas || result.stats.trails || 0;
        result.stats.visitantes = result.stats.visitantes || result.stats.visits || 0;
        result.stats.total = Object.values(result.stats).reduce((a, b) => typeof b === 'number' ? a + b : a, 0);
      }
      return result;
    }
    return { success: true, stats: { total: 0 } };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Retorna todos os dados necessários para inicialização do Index.html
 * @returns {Object} Dados iniciais para o frontend
 */
function apiGetInitialData() {
  try {
    const startTime = Date.now();
    
    if (typeof CacheManager !== 'undefined') {
      const cached = CacheManager.getIndexPreloadData();
      if (cached.statistics && cached.statistics.success) {
        return {
          success: true,
          data: cached,
          loadTime: Date.now() - startTime,
          fromCache: true
        };
      }
    }
    
    const data = {
      statistics: _fetchStatistics(),
      featureFlags: _getFeatureFlags(),
      maintenance: _getMaintenanceStatus(),
      version: CONFIG.VERSION,
      appName: CONFIG.APP_NAME,
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      data: data,
      loadTime: Date.now() - startTime,
      fromCache: false
    };
  } catch (error) {
    Utils.logError('apiGetInitialData', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * API de health check rápido
 * @returns {Object} Status do sistema
 */
function apiHealthCheck() {
  return {
    success: true,
    status: 'online',
    version: CONFIG.VERSION,
    timestamp: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// WRAPPERS DE FORMULÁRIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper para formulário de Biodiversidade
 */
function saveBiodiversidadeForm(data) {
  return _safeExecute('saveBiodiversidadeForm', () => apiCreate('Biodiversidade', data));
}

/**
 * Wrapper para formulário de Solo
 */
function saveSoloForm(data) {
  return _safeExecute('saveSoloForm', () => apiCreate('QualidadeSolo', data));
}

/**
 * Wrapper para formulário de Terapia
 */
function saveTerapiaForm(data) {
  return _safeExecute('saveTerapiaForm', () => apiCreate('AvaliacoesTerapia', data));
}

/**
 * Wrapper para formulário de Produção
 */
function saveProducaoForm(data) {
  return _safeExecute('saveProducaoForm', () => apiCreate('Producao', data));
}

/**
 * Wrapper para Waypoint
 */
function saveWaypoint(data) {
  return _safeExecute('saveWaypoint', () => apiCreate('Waypoints', data));
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS PRIVADOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa função com tratamento de erro padronizado
 * @private
 */
function _safeExecute(fnName, fn) {
  try {
    return fn();
  } catch (error) {
    Utils.logError(fnName, error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtém feature flags para o frontend
 * @private
 */
function _getFeatureFlags() {
  try {
    if (typeof ConfigManager !== 'undefined') {
      return ConfigManager.getFeatureFlags();
    }
    return { success: true, flags: CONFIG.FEATURE_FLAGS || {} };
  } catch (e) {
    return { success: true, flags: {} };
  }
}

/**
 * Obtém status de manutenção
 * @private
 */
function _getMaintenanceStatus() {
  try {
    if (typeof ConfigManager !== 'undefined') {
      return ConfigManager.isMaintenanceMode();
    }
    return { maintenance_mode: false };
  } catch (e) {
    return { maintenance_mode: false };
  }
}

/**
 * Busca estatísticas (fallback)
 * @private
 */
function _fetchStatistics() {
  try {
    return apiGetStatistics();
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZAÇÕES - Gráficos do Drive
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API para obter metadados das visualizações (gráficos PNG do Drive)
 * @returns {Object} Metadados das visualizações
 */
function apiGetVisualizationMetadata() {
  return _safeExecute('apiGetVisualizationMetadata', () => {
    if (typeof getVisualizationMetadata === 'function') {
      const metadata = getVisualizationMetadata();
      return { success: true, metadata: metadata, count: Object.keys(metadata).length };
    }
    return { success: false, error: 'VisualizationSyncService não disponível' };
  });
}

/**
 * API para sincronizar visualizações do Drive
 * @returns {Object} Resultado da sincronização
 */
function apiSyncVisualizations() {
  return _safeExecute('apiSyncVisualizations', () => {
    if (typeof syncVisualizationsFromDrive === 'function') {
      return syncVisualizationsFromDrive();
    }
    return { success: false, error: 'VisualizationSyncService não disponível' };
  });
}

/**
 * API para obter visualizações por categoria
 * @param {string} category - Categoria (biodiversidade, carbono, agua, solo, etc)
 * @returns {Object} Lista de visualizações da categoria
 */
function apiGetVisualizationsByCategory(category) {
  return _safeExecute('apiGetVisualizationsByCategory', () => {
    if (typeof getVisualizationsByCategory === 'function') {
      const visualizations = getVisualizationsByCategory(category);
      return { success: true, visualizations: visualizations, count: visualizations.length };
    }
    return { success: false, error: 'VisualizationSyncService não disponível' };
  });
}

/**
 * API para obter imagem como base64 (fallback para CORS)
 * @param {string} vizId - ID da visualização
 * @returns {Object} Data URL da imagem em base64
 */
function apiGetVisualizationBase64(vizId) {
  return _safeExecute('apiGetVisualizationBase64', () => {
    if (typeof getImageAsBase64 === 'function') {
      return getImageAsBase64(vizId);
    }
    return { success: false, error: 'VisualizationSyncService não disponível' };
  });
}

/**
 * API para obter gráficos mais recentes de cada categoria
 * @returns {Object} Gráficos mais recentes por categoria
 */
function apiGetLatestCharts() {
  return _safeExecute('apiGetLatestCharts', () => {
    if (typeof getVisualizationMetadata !== 'function') {
      return { success: false, error: 'VisualizationSyncService não disponível' };
    }
    
    const metadata = getVisualizationMetadata();
    const categories = {};
    
    // Agrupa por categoria e pega o mais recente de cada
    Object.entries(metadata).forEach(([id, data]) => {
      const cat = data.category;
      if (!categories[cat] || new Date(data.lastUpdated) > new Date(categories[cat].lastUpdated)) {
        categories[cat] = { id, ...data };
      }
    });
    
    return { 
      success: true, 
      charts: categories,
      count: Object.keys(categories).length,
      syncTime: new Date().toISOString()
    };
  });
}
