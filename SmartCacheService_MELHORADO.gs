/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMART CACHE SERVICE 
 * ═══════════════════════════════════════════════════════════════════════════
 * @deprecated Use AppCache.gs. This file delegates to AppCache for backward compatibility.
 */

const SmartCacheService = {
  DEFAULT_TTL: 600,
  MAX_SIZE: 100000,

  getOrSet(key, fetchFunction, ttlSeconds = null) {
    return AppCache.get(key, fetchFunction, ttlSeconds || this.DEFAULT_TTL);
  },

  invalidate(key) {
    AppCache.remove(key);
    return { success: true };
  },

  invalidateMultiple(keys) {
    AppCache.removeAll(keys);
    return { success: true };
  },

  clearAll() {
    AppCache.clearMemory();
    // CacheService não permite clearAll total programaticamente sem iterar tudo que não temos, 
    // mas AppCache faz o best effort na memória.
    return { success: true, message: 'AppCache Memory Cleared' };
  },

  getVersioned(key, version, fetchFunction, ttlSeconds = null) {
    return AppCache.getVersioned(key, version, fetchFunction, ttlSeconds);
  },

  getStats() {
    const stats = AppCache.getStats();
    return {
      success: true,
      totalKeys: stats.l1_items,
      keys: stats.l1_keys,
      message: 'Stats from AppCache L1'
    };
  },

  warmup() {
    // Redireciona para função de warmup compatível se necessário, ou reimplementa chamada
    // Como CacheManager já tem lógica parecida, aqui simplificamos
    Logger.log('🔥 SmartCache Warmup via AppCache');
    // Implementação simplificada de warmup que existia
    try {
        AppCache.get('env_config', () => {
             const props = PropertiesService.getScriptProperties();
             return { SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID') };
        }, 600);
        return { success: true, itemsWarmed: 1 };
    } catch(e) { return { success: false, error: e.toString() }; }
  },

  getCachedDashboard() {
     return AppCache.get('dashboard_simple', () => {
         if (typeof SimplifiedAnalysisService !== 'undefined') return SimplifiedAnalysisService.getDashboardSimple();
         return {};
     }, 300);
  },
  
  getCachedPhotoStats() {
     return AppCache.get('photo_stats', () => {
         if (typeof PhotoService !== 'undefined') return PhotoService.getPhotoStats();
         return {};
     }, 600);
  },
  
  getCachedTrails() {
     return AppCache.get('trails_list', () => {
         if (typeof DatabaseService !== 'undefined') return DatabaseService.read(CONFIG.SHEETS.TRILHAS, {}, {limit: 100});
         return [];
     }, 300);
  },

  getCachedSheetsList(includeStats = false) {
    const key = includeStats ? 'sheets_list_full' : 'sheets_list_basic';
    return AppCache.get(key, () => {
         const ss = SpreadsheetApp.getActiveSpreadsheet();
         return {
             success: true,
             sheets: ss.getSheets().map(s => ({ name: s.getName() }))
         };
    }, 600);
  },

  getCachedConfig() {
     return AppCache.get('env_config', () => {
        const props = PropertiesService.getScriptProperties();
        return { SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID') }; 
     }, 600);
  }
};

// Funções Exportadas Legadas mantidas
function apiGetCachedDashboard() { return SmartCacheService.getCachedDashboard(); }
function apiClearCache() { return SmartCacheService.clearAll(); }
function apiGetCacheStats() { return SmartCacheService.getStats(); }
function apiWarmupCache() { return SmartCacheService.warmup(); }
function apiGetCachedSheetsList(includeStats) { return SmartCacheService.getCachedSheetsList(includeStats); }

function testarSmartCache() {
  Logger.log('TESTE SMART CACHE (Via AppCache)');
  const val = SmartCacheService.getOrSet('test_smart', () => 'ok', 10);
  Logger.log('Val: ' + val);
}
