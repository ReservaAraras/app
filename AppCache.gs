/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APP CACHE - Singleton Centralizado de Cache (Unified Cache System)
 * ═══════════════════════════════════════════════════════════════════════════
 * Unifica e substitui CacheManager e SmartCacheService.
 * Implementa padrão Singleton e L1/L2 Cache (Memória/ScriptCache).
 * 
 * @version 1.0.0
 * @singleton
 */

var AppCache = (function() {
  
  // 🔒 Estado Privado (L1 Cache - Memória)
  const _memoryCache = {};
  const _memoryCacheExpiry = {};
  
  // Constantes
  const DEFAULT_TTL = 600; // 10 minutos
  const MAX_ITEM_SIZE = 100000; // 100KB (limite seguro do CacheService)

  /**
   * Serializa dados com segurança
   */
  function _serialize(data) {
    try {
      return JSON.stringify(data);
    } catch (e) {
      console.error('AppCache: Erro na serialização', e);
      return null;
    }
  }

  /**
   * Deserializa dados com segurança
   */
  function _deserialize(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('AppCache: Erro na deserialização', e);
      return null;
    }
  }

  // 🔓 Interface Pública
  return {
    
    /**
     * Obtém item do cache ou executa função de fetch
     * 
     * @param {string} key - Chave única
     * @param {Function} fetcher - Função que retorna os dados se não houver cache (opcional)
     * @param {number} ttl - Tempo em segundos (default: 600)
     * @returns {*} Dados
     */
    get: function(key, fetcher, ttl) {
      // Normalização
      const _ttl = ttl || DEFAULT_TTL;
      const now = Date.now();

      // 1. L1 - Memória (mais rápido)
      if (_memoryCache[key] && _memoryCacheExpiry[key] > now) {
        // Logger.log(`🚀 AppCache L1 Hit: ${key}`);
        return _memoryCache[key];
      }

      // 2. L2 - ScriptCache (compartilhado na execução)
      try {
        const cache = CacheService.getScriptCache();
        const cachedString = cache.get(key);
        
        if (cachedString) {
          const data = _deserialize(cachedString);
          if (data) {
            // Promove para L1
            _memoryCache[key] = data;
            _memoryCacheExpiry[key] = now + (_ttl * 1000);
            // Logger.log(`📦 AppCache L2 Hit: ${key}`);
            return data;
          }
        }
      } catch (e) {
        console.warn(`AppCache: Erro ao ler L2 para ${key}`, e);
      }

      // 3. Miss - Executar Fetcher
      if (typeof fetcher === 'function') {
        // Logger.log(`🔄 AppCache Miss: ${key}. Fetching...`);
        try {
          const data = fetcher();
          
          if (data !== undefined) {
             this.put(key, data, _ttl);
          }
          return data;
        } catch (e) {
          console.error(`AppCache: Erro no fetcher de ${key}`, e);
          throw e; // Relança para o chamador tratar
        }
      }

      return null; // Nada encontrado e sem fetcher
    },

    /**
     * Salva item no cache explicitamente
     */
    put: function(key, data, ttl) {
      const _ttl = ttl || DEFAULT_TTL;
      const now = Date.now();

      // Salva L1
      _memoryCache[key] = data;
      _memoryCacheExpiry[key] = now + (_ttl * 1000);

      // Salva L2
      try {
        const serialized = _serialize(data);
        if (serialized && serialized.length <= MAX_ITEM_SIZE) {
          CacheService.getScriptCache().put(key, serialized, _ttl);
        } else if (serialized) {
          console.warn(`AppCache: Item ${key} muito grande para L2 (${serialized.length} bytes). Mantido apenas em L1.`);
        }
      } catch (e) {
        console.warn(`AppCache: Erro ao salvar L2 para ${key}`, e);
      }
    },

    /**
     * Remove item do cache
     */
    remove: function(key) {
      delete _memoryCache[key];
      delete _memoryCacheExpiry[key];
      try {
        CacheService.getScriptCache().remove(key);
      } catch (e) { console.warn('AppCache remove err', e); }
    },

    /**
     * Remove múltiplos itens
     */
    removeAll: function(keys) {
      if (!Array.isArray(keys)) return;
      
      keys.forEach(k => {
        delete _memoryCache[k];
        delete _memoryCacheExpiry[k];
      });
      
      try {
        CacheService.getScriptCache().removeAll(keys);
      } catch (e) { console.warn('AppCache removeAll err', e); }
    },

    /**
     * Limpa L1 (Memória) e tenta limpar o que for possível
     * Nota: CacheService não tem 'clearAll', então isso limpa apenas a memória local
     * e chaves se tivessem sido rastreadas, mas como não rastreamos todas chaves L2,
     * isso é um "best effort" para o contexto atual.
     */
    clearMemory: function() {
      for (const k in _memoryCache) delete _memoryCache[k];
      for (const k in _memoryCacheExpiry) delete _memoryCacheExpiry[k];
      Logger.log('AppCache: L1 Memory Cleared');
    },

    /**
     * Versão com suporte a versionamento de chave
     */
    getVersioned: function(key, version, fetcher, ttl) {
      return this.get(`${key}_v${version}`, fetcher, ttl);
    },

    /**
     * Retorna estatísticas simples do L1
     */
    getStats: function() {
      return {
        l1_items: Object.keys(_memoryCache).length,
        l1_keys: Object.keys(_memoryCache)
      };
    }
  };
})();

/**
 * Helper global para acesso fácil (opcional, mantendo compatibilidade de estilo)
 */
function getAppCache() {
  return AppCache;
}
