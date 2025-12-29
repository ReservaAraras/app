/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CACHE MANAGER - Gerenciamento Centralizado de Cache
 * ═══════════════════════════════════════════════════════════════════════════
 * @deprecated Use AppCache.gs instead. This file is kept for backward compatibility.
 * Delegates all calls to AppCache singleton.
 */

const CacheManager = {
  
  _memoryCache: {}, // Mantido apenas para não quebrar referências diretas, mas não usado
  _memoryCacheExpiry: {},

  get(key, fetchFunction, ttl = 600) {
    return AppCache.get(key, fetchFunction, ttl);
  },
  
  invalidate(key) {
    AppCache.remove(key);
  },
  
  invalidateMultiple(keys) {
    AppCache.removeAll(keys);
  },
  
  clear() {
    AppCache.clearMemory();
  },
  
  getVersioned(key, version, fetchFunction, ttl = 600) {
    return AppCache.getVersioned(key, version, fetchFunction, ttl);
  },
  
  getStats() {
    return AppCache.getStats();
  },
  
  warmup() {
    // Reimplementado usando AppCache
    Logger.log('🔥 Aquecendo cache via AppCache...');
    try {
      AppCache.get('env_config', () => {
        const props = PropertiesService.getScriptProperties();
        return {
          SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID'),
          DRIVE_FOLDER_ID: props.getProperty('DRIVE_FOLDER_ID'),
          GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY'),
          GEMINI_TEMPERATURE: props.getProperty('GEMINI_TEMPERATURE')
        };
      }, 600);
      AppCache.get('sheets_list_basic', () => {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        return {
          success: true,
          sheets: ss.getSheets().map(s => ({ name: s.getName() }))
        };
      }, 600);
      Logger.log('✅ Cache aquecido com sucesso');
    } catch (error) {
      Logger.log(`❌ Erro ao aquecer cache: ${error}`);
    }
  },
  
  warmupForIndex() {
     // Reimplementação simplificada delegando ao que seria o comportamento original
     // Nota: Como AppCache é agnóstico, mantemos a lógica de negócio aqui ou movemos para um serviço de "Warmup"
     // Por compatibilidade, mantemos a lógica mas usando AppCache.put/get
     try {
       AppCache.get('app_statistics', () => {
        const sheets = ['Waypoints', 'Fotos', 'Trilhas', 'Visitantes', 'Biodiversidade', 'ParcelasAgroflorestais'];
        const stats = {};
        sheets.forEach(sheetName => {
          try {
            const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
            if (sheet) {
              stats[sheetName.toLowerCase()] = Math.max(0, sheet.getLastRow() - 1);
            } else {
              stats[sheetName.toLowerCase()] = 0;
            }
          } catch (e) { stats[sheetName.toLowerCase()] = 0; }
        });
        stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
        return { success: true, stats: stats, cached: true };
       }, 300);

       AppCache.get('feature_flags', () => {
         if (typeof ConfigManager !== 'undefined') return ConfigManager.getFeatureFlags();
         if (typeof CONFIG !== 'undefined') return { success: true, flags: CONFIG.FEATURE_FLAGS };
         return { success: true, flags: {} };
       }, 600);

       AppCache.get('maintenance_status', () => {
         if (typeof ConfigManager !== 'undefined') return ConfigManager.isMaintenanceMode();
         return { maintenance_mode: false };
       }, 60);

     } catch(e) { Logger.log('WarmupIndex err: ' + e); }
  },

  getIndexPreloadData() {
    return {
      statistics: AppCache.get('app_statistics', () => ({ success: false }), 300),
      featureFlags: AppCache.get('feature_flags', () => ({ success: true, flags: {} }), 600),
      maintenance: AppCache.get('maintenance_status', () => ({ maintenance_mode: false }), 60),
      timestamp: new Date().toISOString()
    };
  }
};

// Funções globais legadas mantidas
function testarCacheManager() {
  Logger.log('TESTE DEPRECATED - Usando AppCache por baixo');
  const res = CacheManager.get('test_legacy', () => 'funciona', 10);
  Logger.log('Resultado: ' + res);
}

function limparCacheCompleto() {
   AppCache.clearMemory();
   Logger.log('Cache limpo (Memória)');
}
