/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIG API - APIs de Configuração para Frontend
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Funções de API para gerenciamento de configurações.
 * Extraído do Config.gs para melhor organização.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// APIs DE CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém relatório completo de configurações
 */
function apiConfigGetReport() {
  return ConfigManager.getConfigReport();
}

/**
 * API: Atualiza taxa de sequestro de carbono
 */
function apiConfigUpdateCarbonRate(tipo, valor, motivo) {
  return ConfigManager.updateCarbonRate(tipo, valor, motivo);
}

/**
 * API: Define estado de feature flag
 */
function apiConfigSetFeatureFlag(flag, enabled, motivo) {
  return ConfigManager.setFeatureFlag(flag, enabled, motivo);
}

/**
 * API: Define modo de manutenção
 */
function apiConfigSetMaintenanceMode(enabled, message) {
  return ConfigManager.setMaintenanceMode(enabled, message);
}

/**
 * API: Valida configurações do sistema
 */
function apiConfigValidate() {
  return ConfigManager.validateConfig();
}

/**
 * API: Obtém taxas de carbono
 */
function apiConfigGetCarbonRates() {
  return ConfigManager.getCarbonRates();
}

/**
 * API: Obtém feature flags
 */
function apiConfigGetFeatureFlags() {
  return ConfigManager.getFeatureFlags();
}

/**
 * API: Obtém histórico de configurações
 */
function apiConfigGetHistory(limite) {
  return ConfigManager.getConfigHistory(limite);
}

/**
 * API: Retorna configurações essenciais para o Index.html
 */
function apiGetEssentialConfig() {
  try {
    if (typeof CacheManager !== 'undefined') {
      return CacheManager.get('essential_config', getEssentialConfig, 300);
    }
    return getEssentialConfig();
  } catch (error) {
    return { version: CONFIG.VERSION, appName: CONFIG.APP_NAME, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retorna configurações essenciais para o frontend
 */
function getEssentialConfig() {
  return {
    version: CONFIG.VERSION,
    appName: CONFIG.APP_NAME,
    limits: CONFIG.LIMITS,
    reserva: { nome: CONFIG.RESERVA_CONTEXT.nome, bioma: CONFIG.RESERVA_CONTEXT.bioma },
    maintenance: ConfigManager.isMaintenanceMode(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Inicializa o sistema para carregamento rápido do Index.html
 */
function initializeForIndex() {
  try {
    if (typeof CacheManager !== 'undefined') CacheManager.warmupForIndex();
    const maintenance = ConfigManager.isMaintenanceMode();
    if (maintenance.maintenance_mode) Logger.log('⚠️ Sistema em modo de manutenção');
    return { success: true, maintenance };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
