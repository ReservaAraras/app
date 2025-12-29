/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE LOGGER - Sistema de Logging Estruturado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Logging estruturado com contexto
 * - Niveis de log (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Correlacao de requests com trace IDs
 * - Integracao com sistemas externos
 * - Performance tracking
 * - Structured data (JSON)
 * 
 * @version 1.0.0
 * @enterprise
 */

const EnterpriseLogger = (function() {
  'use strict';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACAO
  // ═══════════════════════════════════════════════════════════════════════════
  
  const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };
  
  const LogLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
  
  const CONFIG = {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableSpreadsheet: false,
    enableStackTrace: true,
    maxStackDepth: 10,
    structuredLogging: true,
    correlationId: null,
    environment: 'production',
    version: '1.0.0'
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXTO GLOBAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  let requestContext = {
    requestId: null,
    userId: null,
    sessionId: null,
    startTime: null,
    metadata: {}
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCOES PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Cria uma entrada de log estruturada
   * @private
   */
  function createLogEntry(level, message, data, error) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: LogLevelNames[level],
      message: message,
      environment: CONFIG.environment,
      version: CONFIG.version
    };
    
    // Request context
    if (requestContext.requestId) {
      entry.requestId = requestContext.requestId;
    }
    if (requestContext.userId) {
      entry.userId = requestContext.userId;
    }
    if (requestContext.sessionId) {
      entry.sessionId = requestContext.sessionId;
    }
    
    // Data adicional
    if (data && Object.keys(data).length > 0) {
      entry.data = data;
    }
    
    // Error information
    if (error) {
      entry.error = {
        message: error.message || error.toString(),
        name: error.name,
        type: typeof error
      };
      
      if (CONFIG.enableStackTrace && error.stack) {
        entry.error.stack = parseStackTrace(error.stack);
      }
    }
    
    // Performance
    if (requestContext.startTime) {
      entry.elapsedMs = Date.now() - requestContext.startTime;
    }
    
    return entry;
  }
  
  /**
   * Parse stack trace
   * @private
   */
  function parseStackTrace(stack) {
    if (!stack) return [];
    
    const lines = stack.split('\n')
      .slice(0, CONFIG.maxStackDepth)
      .map(function(line) {
        return line.trim();
      })
      .filter(function(line) {
        return line.length > 0;
      });
    
    return lines;
  }
  
  /**
   * Formata log para console
   * @private
   */
  function formatConsoleLog(entry) {
    const parts = [
      '[' + entry.timestamp + ']',
      '[' + entry.level + ']'
    ];
    
    if (entry.requestId) {
      parts.push('[' + entry.requestId.substring(0, 8) + ']');
    }
    
    parts.push(entry.message);
    
    let output = parts.join(' ');
    
    if (entry.data) {
      output += '\n  Data: ' + JSON.stringify(entry.data);
    }
    
    if (entry.error) {
      output += '\n  Error: ' + entry.error.message;
      if (entry.error.stack) {
        output += '\n  Stack:\n    ' + entry.error.stack.join('\n    ');
      }
    }
    
    if (entry.elapsedMs !== undefined) {
      output += '\n  Elapsed: ' + entry.elapsedMs + 'ms';
    }
    
    return output;
  }
  
  /**
   * Escreve log no console
   * @private
   */
  function writeToConsole(entry) {
    if (!CONFIG.enableConsole) return;
    
    const formatted = formatConsoleLog(entry);
    
    switch (entry.level) {
      case 'DEBUG':
      case 'INFO':
        Logger.log(formatted);
        break;
      case 'WARN':
        Logger.log('WARNING: ' + formatted);
        break;
      case 'ERROR':
      case 'FATAL':
        Logger.log('ERROR: ' + formatted);
        break;
    }
  }
  
  /**
   * Escreve log estruturado
   * @private
   */
  function writeStructuredLog(entry) {
    if (!CONFIG.structuredLogging) return;
    
    // Para Google Cloud Logging ou sistemas externos
    console.log(JSON.stringify(entry));
  }
  
  /**
   * Escreve log
   * @private
   */
  function writeLog(level, message, data, error) {
    if (level < CONFIG.minLevel) return;
    
    const entry = createLogEntry(level, message, data, error);
    
    writeToConsole(entry);
    writeStructuredLog(entry);
    
    return entry;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // API PUBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    
    /**
     * Log nivel DEBUG
     * @param {string} message - Mensagem
     * @param {Object} data - Dados adicionais
     */
    debug: function(message, data) {
      return writeLog(LogLevel.DEBUG, message, data);
    },
    
    /**
     * Log nivel INFO
     * @param {string} message - Mensagem
     * @param {Object} data - Dados adicionais
     */
    info: function(message, data) {
      return writeLog(LogLevel.INFO, message, data);
    },
    
    /**
     * Log nivel WARN
     * @param {string} message - Mensagem
     * @param {Object} data - Dados adicionais
     */
    warn: function(message, data) {
      return writeLog(LogLevel.WARN, message, data);
    },
    
    /**
     * Log nivel ERROR
     * @param {string} message - Mensagem
     * @param {Object} data - Dados adicionais
     * @param {Error} error - Objeto de erro
     */
    error: function(message, data, error) {
      return writeLog(LogLevel.ERROR, message, data, error);
    },
    
    /**
     * Log nivel FATAL
     * @param {string} message - Mensagem
     * @param {Object} data - Dados adicionais
     * @param {Error} error - Objeto de erro
     */
    fatal: function(message, data, error) {
      return writeLog(LogLevel.FATAL, message, data, error);
    },
    
    /**
     * Inicia contexto de request
     * @param {Object} context - Contexto do request
     */
    startRequest: function(context) {
      requestContext = {
        requestId: context.requestId || generateRequestId(),
        userId: context.userId || null,
        sessionId: context.sessionId || null,
        startTime: Date.now(),
        metadata: context.metadata || {}
      };
      
      this.info('Request iniciado', {
        requestId: requestContext.requestId,
        userId: requestContext.userId
      });
      
      return requestContext.requestId;
    },
    
    /**
     * Finaliza contexto de request
     */
    endRequest: function() {
      if (requestContext.startTime) {
        const elapsed = Date.now() - requestContext.startTime;
        this.info('Request finalizado', {
          requestId: requestContext.requestId,
          elapsedMs: elapsed
        });
      }
      
      requestContext = {
        requestId: null,
        userId: null,
        sessionId: null,
        startTime: null,
        metadata: {}
      };
    },
    
    /**
     * Define nivel minimo de log
     * @param {string} level - DEBUG, INFO, WARN, ERROR, FATAL
     */
    setLevel: function(level) {
      const upperLevel = level.toUpperCase();
      if (LogLevel[upperLevel] !== undefined) {
        CONFIG.minLevel = LogLevel[upperLevel];
        this.info('Log level alterado', { level: upperLevel });
      }
    },
    
    /**
     * Define configuracoes
     * @param {Object} config - Configuracoes
     */
    configure: function(config) {
      Object.keys(config).forEach(function(key) {
        if (CONFIG.hasOwnProperty(key)) {
          CONFIG[key] = config[key];
        }
      });
      
      this.info('Logger configurado', config);
    },
    
    /**
     * Obtem contexto atual
     * @returns {Object}
     */
    getContext: function() {
      return Object.assign({}, requestContext);
    },
    
    /**
     * Executa funcao com logging automatico
     * @param {string} operationName - Nome da operacao
     * @param {Function} fn - Funcao a executar
     * @param {Object} context - Contexto adicional
     */
    withLogging: function(operationName, fn, context) {
      const startTime = Date.now();
      const requestId = this.startRequest(context || {});
      
      try {
        this.info('Operacao iniciada: ' + operationName);
        
        const result = fn();
        
        const elapsed = Date.now() - startTime;
        this.info('Operacao concluida: ' + operationName, {
          elapsedMs: elapsed,
          success: true
        });
        
        return result;
        
      } catch (error) {
        const elapsed = Date.now() - startTime;
        this.error('Operacao falhou: ' + operationName, {
          elapsedMs: elapsed,
          success: false
        }, error);
        
        throw error;
        
      } finally {
        this.endRequest();
      }
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITARIOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Gera ID unico para request
   * @private
   */
  function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
})();

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE USO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Log basico
 */
function exemploLogBasico() {
  EnterpriseLogger.info('Aplicacao iniciada');
  EnterpriseLogger.debug('Modo debug ativo', { debug: true });
  EnterpriseLogger.warn('Configuracao faltando', { config: 'API_KEY' });
}

/**
 * Exemplo 2: Log com contexto de request
 */
function exemploLogComContexto() {
  EnterpriseLogger.startRequest({
    userId: 'user123',
    sessionId: 'sess456'
  });
  
  EnterpriseLogger.info('Usuario autenticado');
  EnterpriseLogger.info('Dados carregados', { count: 42 });
  
  EnterpriseLogger.endRequest();
}

/**
 * Exemplo 3: Log de erro
 */
function exemploLogErro() {
  try {
    throw new Error('Algo deu errado');
  } catch (error) {
    EnterpriseLogger.error('Erro na operacao', {
      operation: 'processData',
      input: { id: 123 }
    }, error);
  }
}

/**
 * Exemplo 4: Operacao com logging automatico
 */
function exemploOperacaoComLogging() {
  return EnterpriseLogger.withLogging('processarPedido', function() {
    // Logica de negocio
    return { status: 'success', orderId: 789 };
  }, {
    userId: 'user123',
    metadata: { source: 'mobile' }
  });
}
