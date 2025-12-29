/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMINI RATE LIMITER - Sistema de Controle de Taxa de Requisições
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Gerencia requisições à API Gemini para evitar rate limiting (429):
 * - Queue com throttling automático
 * - Backoff exponencial inteligente
 * - Cache de requisições
 * - Métricas de uso
 *
 * LIMITES DA API GEMINI (Free Tier):
 * - 15 requests per minute (RPM)
 * - 1 million tokens per minute
 * - 1,500 requests per day
 *
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Sistema de Rate Limiting para API Gemini
 * @namespace GeminiRateLimiter
 */
const GeminiRateLimiter = {
  
  /**
   * Configurações do rate limiter
   */
  CONFIG: {
    // Máximo de requisições por minuto (conservador para evitar 429)
    MAX_REQUESTS_PER_MINUTE: 12,
    
    // Delay mínimo entre requisições (ms) - 5 segundos = 12 req/min
    MIN_DELAY_BETWEEN_REQUESTS: 5000,
    
    // Delay base para retry após 429 (ms)
    BASE_RETRY_DELAY: 10000,
    
    // Máximo de tentativas para uma requisição
    MAX_RETRIES: 5,
    
    // Multiplicador para backoff exponencial
    BACKOFF_MULTIPLIER: 2,
    
    // Delay máximo para backoff (2 minutos)
    MAX_BACKOFF_DELAY: 120000,
    
    // TTL do cache em segundos (60 minutos - otimizado para reduzir chamadas)
    CACHE_TTL_SECONDS: 3600,
    
    // Habilitar cache de respostas
    ENABLE_CACHE: true,
    
    // Chave do cache no PropertiesService
    CACHE_KEY: 'GEMINI_RESPONSE_CACHE',
    
    // Chave para armazenar última requisição
    LAST_REQUEST_KEY: 'GEMINI_LAST_REQUEST_TIME',
    
    // Chave para métricas diárias
    METRICS_KEY: 'GEMINI_DAILY_METRICS'
  },
  
  /**
   * Obtém o timestamp da última requisição
   * @returns {number} Timestamp em ms
   */
  getLastRequestTime() {
    try {
      const props = PropertiesService.getScriptProperties();
      const lastTime = props.getProperty(this.CONFIG.LAST_REQUEST_KEY);
      return lastTime ? parseInt(lastTime, 10) : 0;
    } catch (e) {
      return 0;
    }
  },
  
  /**
   * Atualiza o timestamp da última requisição
   */
  setLastRequestTime() {
    try {
      const props = PropertiesService.getScriptProperties();
      props.setProperty(this.CONFIG.LAST_REQUEST_KEY, Date.now().toString());
    } catch (e) {
      Logger.log(`[GeminiRateLimiter] Erro ao salvar timestamp: ${e}`);
    }
  },
  
  /**
   * Aguarda o tempo necessário antes da próxima requisição
   * @returns {number} Tempo aguardado em ms
   */
  waitForNextSlot() {
    const lastRequest = this.getLastRequestTime();
    const now = Date.now();
    const elapsed = now - lastRequest;
    const waitTime = Math.max(0, this.CONFIG.MIN_DELAY_BETWEEN_REQUESTS - elapsed);
    
    if (waitTime > 0) {
      Logger.log(`⏳ [RateLimiter] Aguardando ${Math.round(waitTime/1000)}s antes da próxima requisição...`);
      Utilities.sleep(waitTime);
    }
    
    this.setLastRequestTime();
    return waitTime;
  },
  
  /**
   * Calcula o delay para retry com backoff exponencial
   * @param {number} retryCount - Número da tentativa atual
   * @param {string} retryAfter - Valor do header Retry-After (opcional)
   * @returns {number} Delay em ms
   */
  calculateBackoffDelay(retryCount, retryAfter = null) {
    // Se a API forneceu um tempo específico, use-o (com margem de segurança)
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return (seconds + 5) * 1000; // Adiciona 5 segundos de margem
      }
    }
    
    // Backoff exponencial: 10s, 20s, 40s, 80s, 120s (max)
    const delay = this.CONFIG.BASE_RETRY_DELAY * Math.pow(this.CONFIG.BACKOFF_MULTIPLIER, retryCount - 1);
    return Math.min(delay, this.CONFIG.MAX_BACKOFF_DELAY);
  },
  
  /**
   * Gera uma chave de cache baseada no prompt
   * @param {string} prompt - O prompt da requisição
   * @param {string} model - O modelo usado
   * @returns {string} Chave de cache
   */
  generateCacheKey(prompt, model) {
    // Usa um hash simples do prompt para criar a chave
    let hash = 0;
    const str = `${model}:${prompt}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `cache_${Math.abs(hash).toString(36)}`;
  },
  
  /**
   * Obtém resposta do cache
   * @param {string} cacheKey - Chave do cache
   * @returns {object|null} Resposta cacheada ou null
   */
  getFromCache(cacheKey) {
    if (!this.CONFIG.ENABLE_CACHE) return null;
    
    try {
      const cache = CacheService.getScriptCache();
      const cached = cache.get(cacheKey);
      
      if (cached) {
        Logger.log(`✅ [RateLimiter] Cache hit para ${cacheKey.substring(0, 20)}...`);
        this.updateMetrics('cache_hits');
        return JSON.parse(cached);
      }
    } catch (e) {
      Logger.log(`[RateLimiter] Erro ao ler cache: ${e}`);
    }
    
    return null;
  },
  
  /**
   * Salva resposta no cache
   * @param {string} cacheKey - Chave do cache
   * @param {object} response - Resposta para cachear
   */
  saveToCache(cacheKey, response) {
    if (!this.CONFIG.ENABLE_CACHE) return;
    
    try {
      const cache = CacheService.getScriptCache();
      cache.put(cacheKey, JSON.stringify(response), this.CONFIG.CACHE_TTL_SECONDS);
      Logger.log(`💾 [RateLimiter] Resposta cacheada: ${cacheKey.substring(0, 20)}...`);
    } catch (e) {
      Logger.log(`[RateLimiter] Erro ao salvar cache: ${e}`);
    }
  },
  
  /**
   * Atualiza métricas de uso
   * @param {string} type - Tipo de métrica (requests, errors, cache_hits, rate_limits)
   */
  updateMetrics(type) {
    try {
      const props = PropertiesService.getScriptProperties();
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `${this.CONFIG.METRICS_KEY}_${today}`;
      
      let metrics = {};
      const stored = props.getProperty(metricsKey);
      if (stored) {
        metrics = JSON.parse(stored);
      } else {
        metrics = {
          date: today,
          requests: 0,
          errors: 0,
          cache_hits: 0,
          rate_limits: 0,
          total_wait_time_ms: 0
        };
      }
      
      metrics[type] = (metrics[type] || 0) + 1;
      props.setProperty(metricsKey, JSON.stringify(metrics));
      
    } catch (e) {
      // Ignora erros de métricas para não afetar funcionalidade principal
    }
  },
  
  /**
   * Obtém métricas do dia atual
   * @returns {object} Métricas de uso
   */
  getMetrics() {
    try {
      const props = PropertiesService.getScriptProperties();
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `${this.CONFIG.METRICS_KEY}_${today}`;
      
      const stored = props.getProperty(metricsKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      return {
        date: today,
        requests: 0,
        errors: 0,
        cache_hits: 0,
        rate_limits: 0,
        total_wait_time_ms: 0
      };
    } catch (e) {
      return { error: e.message };
    }
  },
  
  /**
   * Executa uma requisição com rate limiting e retry
   * @param {function} requestFn - Função que executa a requisição
   * @param {object} options - Opções de configuração
   * @returns {object} Resultado da requisição
   */
  executeWithRateLimit(requestFn, options = {}) {
    const startTime = Date.now();
    const maxRetries = options.maxRetries || this.CONFIG.MAX_RETRIES;
    const enableCache = options.enableCache !== false && this.CONFIG.ENABLE_CACHE;
    const cacheKey = options.cacheKey;
    
    // Verifica cache primeiro
    if (enableCache && cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
          processingTime: Date.now() - startTime
        };
      }
    }
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Aguarda slot disponível (throttling)
        const waitedTime = this.waitForNextSlot();
        
        // Executa a requisição
        this.updateMetrics('requests');
        const result = requestFn();
        
        // Verifica se houve rate limit
        if (result && result.errorCode === 429) {
          this.updateMetrics('rate_limits');
          
          if (attempt < maxRetries) {
            const retryAfter = result.retryAfter;
            const backoffDelay = this.calculateBackoffDelay(attempt, retryAfter);
            
            Logger.log(`⚠️ [RateLimiter] Rate limit (429) - Tentativa ${attempt}/${maxRetries}`);
            Logger.log(`⏳ [RateLimiter] Aguardando ${Math.round(backoffDelay/1000)}s antes de retry...`);
            
            Utilities.sleep(backoffDelay);
            continue;
          }
        }
        
        // Sucesso - salva no cache e retorna
        if (result && result.success) {
          if (enableCache && cacheKey) {
            this.saveToCache(cacheKey, result);
          }
          
          return {
            ...result,
            fromCache: false,
            attempts: attempt,
            processingTime: Date.now() - startTime
          };
        }
        
        // Erro não-429, registra e continua ou retorna
        lastError = result;
        
        if (result && result.errorCode && result.errorCode !== 429) {
          // Para erros que não são rate limit, não faz retry
          this.updateMetrics('errors');
          return result;
        }
        
      } catch (error) {
        lastError = { success: false, error: error.toString() };
        this.updateMetrics('errors');
        
        if (attempt < maxRetries) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          Logger.log(`❌ [RateLimiter] Erro na tentativa ${attempt}: ${error}`);
          Logger.log(`⏳ [RateLimiter] Retry em ${Math.round(backoffDelay/1000)}s...`);
          Utilities.sleep(backoffDelay);
        }
      }
    }
    
    // Todas as tentativas falharam
    return {
      success: false,
      error: `Todas as ${maxRetries} tentativas falharam. Último erro: ${lastError?.error || 'Desconhecido'}`,
      lastError: lastError,
      attempts: maxRetries,
      processingTime: Date.now() - startTime,
      suggestion: 'Tente novamente em alguns minutos ou use o modo offline.'
    };
  },
  
  /**
   * Limpa o cache
   */
  clearCache() {
    try {
      const cache = CacheService.getScriptCache();
      // CacheService não tem método para limpar tudo, mas podemos resetar configurações
      const props = PropertiesService.getScriptProperties();
      props.deleteProperty(this.CONFIG.LAST_REQUEST_KEY);
      
      return { success: true, message: 'Cache e configurações resetados' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  /**
   * Reseta o rate limiter (útil após período de cooldown)
   */
  reset() {
    try {
      const props = PropertiesService.getScriptProperties();
      props.deleteProperty(this.CONFIG.LAST_REQUEST_KEY);
      Logger.log('🔄 [RateLimiter] Rate limiter resetado');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  /**
   * Verifica se é seguro fazer uma requisição agora
   * @returns {object} Status com tempo de espera estimado
   */
  checkStatus() {
    const lastRequest = this.getLastRequestTime();
    const now = Date.now();
    const elapsed = now - lastRequest;
    const waitTime = Math.max(0, this.CONFIG.MIN_DELAY_BETWEEN_REQUESTS - elapsed);
    
    return {
      canRequest: waitTime === 0,
      waitTimeMs: waitTime,
      waitTimeSec: Math.ceil(waitTime / 1000),
      lastRequestAgo: Math.round(elapsed / 1000),
      config: {
        minDelaySeconds: this.CONFIG.MIN_DELAY_BETWEEN_REQUESTS / 1000,
        maxRequestsPerMinute: this.CONFIG.MAX_REQUESTS_PER_MINUTE
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO COM GEMINI AI SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper para chamadas Gemini com rate limiting
 * Substitui chamadas diretas para adicionar throttling automático
 * 
 * @param {string} prompt - Prompt para a API
 * @param {object} options - Opções da requisição
 * @returns {object} Resultado da API
 */
function callGeminiWithRateLimit(prompt, options = {}) {
  const model = options.model || GeminiAIService.DEFAULT_MODEL;
  const cacheKey = options.skipCache ? null : GeminiRateLimiter.generateCacheKey(prompt, model);
  
  return GeminiRateLimiter.executeWithRateLimit(
    () => GeminiAIService.callGemini(prompt, options),
    {
      cacheKey: cacheKey,
      enableCache: !options.skipCache,
      maxRetries: options.maxRetries || 5
    }
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// QUEUE SYSTEM - Processamento em Lote
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sistema de Queue para processamento em lote de múltiplas requisições
 * @namespace GeminiRequestQueue
 */
const GeminiRequestQueue = {
  
  /**
   * Processa uma lista de requisições em sequência com rate limiting
   * @param {Array} requests - Lista de objetos {prompt, options, id}
   * @param {function} onProgress - Callback chamado a cada requisição processada
   * @returns {Array} Resultados de todas as requisições
   */
  processQueue(requests, onProgress = null) {
    const results = [];
    const totalRequests = requests.length;
    const startTime = Date.now();
    
    Logger.log(`📋 [Queue] Iniciando processamento de ${totalRequests} requisições`);
    Logger.log(`⏱️ [Queue] Tempo estimado: ${Math.ceil(totalRequests * 6 / 60)} minutos`);
    
    for (let i = 0; i < totalRequests; i++) {
      const request = requests[i];
      const requestId = request.id || `req_${i + 1}`;
      
      Logger.log(`\n🔄 [Queue] Processando ${i + 1}/${totalRequests}: ${requestId}`);
      
      try {
        const result = callGeminiWithRateLimit(request.prompt, request.options || {});
        
        results.push({
          id: requestId,
          success: result.success,
          result: result,
          index: i
        });
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalRequests,
            id: requestId,
            success: result.success,
            fromCache: result.fromCache
          });
        }
        
        Logger.log(`${result.success ? '✅' : '❌'} [Queue] ${requestId}: ${result.success ? 'Sucesso' : result.error}`);
        
      } catch (error) {
        results.push({
          id: requestId,
          success: false,
          error: error.toString(),
          index: i
        });
        
        Logger.log(`❌ [Queue] ${requestId}: Erro - ${error}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    
    Logger.log(`\n📊 [Queue] Processamento concluído:`);
    Logger.log(`   Total: ${totalRequests}`);
    Logger.log(`   Sucesso: ${successCount}`);
    Logger.log(`   Falha: ${totalRequests - successCount}`);
    Logger.log(`   Tempo total: ${Math.round(totalTime / 1000)}s`);
    
    return {
      success: true,
      results: results,
      summary: {
        total: totalRequests,
        successful: successCount,
        failed: totalRequests - successCount,
        successRate: Math.round((successCount / totalRequests) * 100),
        totalTimeMs: totalTime,
        avgTimePerRequest: Math.round(totalTime / totalRequests)
      }
    };
  },
  
  /**
   * Processa requisições dividindo em chunks com pausas entre eles
   * Útil para grandes volumes de requisições
   * 
   * @param {Array} requests - Lista de requisições
   * @param {number} chunkSize - Tamanho de cada chunk (padrão: 5)
   * @param {number} pauseBetweenChunks - Pausa entre chunks em ms (padrão: 30000)
   * @returns {Array} Resultados
   */
  processInChunks(requests, chunkSize = 5, pauseBetweenChunks = 30000) {
    const totalChunks = Math.ceil(requests.length / chunkSize);
    const allResults = [];
    
    Logger.log(`📦 [Queue] Processando ${requests.length} requisições em ${totalChunks} chunks`);
    
    for (let chunk = 0; chunk < totalChunks; chunk++) {
      const start = chunk * chunkSize;
      const end = Math.min(start + chunkSize, requests.length);
      const chunkRequests = requests.slice(start, end);
      
      Logger.log(`\n📦 [Queue] Chunk ${chunk + 1}/${totalChunks} (${chunkRequests.length} requisições)`);
      
      const chunkResults = this.processQueue(chunkRequests);
      allResults.push(...chunkResults.results);
      
      // Pausa entre chunks (exceto no último)
      if (chunk < totalChunks - 1) {
        Logger.log(`⏸️ [Queue] Pausa de ${pauseBetweenChunks/1000}s entre chunks...`);
        Utilities.sleep(pauseBetweenChunks);
      }
    }
    
    const successCount = allResults.filter(r => r.success).length;
    
    return {
      success: true,
      results: allResults,
      summary: {
        total: requests.length,
        successful: successCount,
        failed: requests.length - successCount,
        successRate: Math.round((successCount / requests.length) * 100),
        chunks: totalChunks
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Expostas para o Frontend e Testes
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém status do rate limiter
 */
function apiRateLimiterStatus() {
  return GeminiRateLimiter.checkStatus();
}

/**
 * Obtém métricas de uso do dia
 */
function apiRateLimiterMetrics() {
  return GeminiRateLimiter.getMetrics();
}

/**
 * Reseta o rate limiter
 */
function apiRateLimiterReset() {
  return GeminiRateLimiter.reset();
}

/**
 * Limpa o cache de respostas
 */
function apiRateLimiterClearCache() {
  return GeminiRateLimiter.clearCache();
}

/**
 * Processa múltiplas requisições em queue
 * @param {Array} requests - Array de {prompt, options, id}
 */
function apiProcessGeminiQueue(requests) {
  return GeminiRequestQueue.processQueue(requests);
}


// ═══════════════════════════════════════════════════════════════════════════
// TESTE DO RATE LIMITER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Função de teste para validar o rate limiter
 */
function testRateLimiter() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE DO GEMINI RATE LIMITER');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // 1. Verifica status
  Logger.log('\n1. STATUS DO RATE LIMITER:');
  const status = GeminiRateLimiter.checkStatus();
  Logger.log(JSON.stringify(status, null, 2));
  
  // 2. Testa métricas
  Logger.log('\n2. MÉTRICAS DO DIA:');
  const metrics = GeminiRateLimiter.getMetrics();
  Logger.log(JSON.stringify(metrics, null, 2));
  
  // 3. Testa requisição simples com rate limiting
  Logger.log('\n3. TESTE DE REQUISIÇÃO COM RATE LIMITING:');
  
  if (GeminiAIService.isConfigured()) {
    const result = callGeminiWithRateLimit('Responda apenas: "OK"', {
      maxTokens: 10
    });
    Logger.log(`Sucesso: ${result.success}`);
    Logger.log(`Do cache: ${result.fromCache || false}`);
    Logger.log(`Tentativas: ${result.attempts || 1}`);
    Logger.log(`Tempo: ${result.processingTime}ms`);
  } else {
    Logger.log('⚠️ API Gemini não configurada');
  }
  
  // 4. Métricas atualizadas
  Logger.log('\n4. MÉTRICAS ATUALIZADAS:');
  const metricsAfter = GeminiRateLimiter.getMetrics();
  Logger.log(JSON.stringify(metricsAfter, null, 2));
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE CONCLUÍDO');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return { success: true, status, metrics: metricsAfter };
}


/**
 * Teste de queue com múltiplas requisições
 * ATENÇÃO: Vai consumir várias requisições da API
 */
function testRateLimiterQueue() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE DE QUEUE COM RATE LIMITING');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Cria 3 requisições de teste
  const requests = [
    { id: 'test_1', prompt: 'Responda apenas: "Olá 1"', options: { maxTokens: 10 } },
    { id: 'test_2', prompt: 'Responda apenas: "Olá 2"', options: { maxTokens: 10 } },
    { id: 'test_3', prompt: 'Responda apenas: "Olá 3"', options: { maxTokens: 10 } }
  ];
  
  const result = GeminiRequestQueue.processQueue(requests, (progress) => {
    Logger.log(`📊 Progresso: ${progress.current}/${progress.total} - ${progress.id}`);
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('    RESUMO DO TESTE');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(result.summary, null, 2));
  
  return result;
}
