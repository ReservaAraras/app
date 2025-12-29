/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE ERROR HANDLER - Sistema de Tratamento de Erros
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Hierarquia de erros customizados
 * - Error codes padronizados
 * - Retry logic com exponential backoff
 * - Circuit breaker pattern
 * - Error recovery strategies
 * - Logging integrado
 * 
 * @version 1.0.0
 * @enterprise
 */

const EnterpriseErrorHandler = (function() {
  'use strict';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CODIGOS DE ERRO PADRONIZADOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const ErrorCodes = {
    // Validation (1xxx)
    VALIDATION_ERROR: 1001,
    REQUIRED_FIELD_MISSING: 1002,
    INVALID_FORMAT: 1003,
    OUT_OF_RANGE: 1004,
    
    // Business Logic (2xxx)
    BUSINESS_RULE_VIOLATION: 2001,
    DUPLICATE_ENTRY: 2002,
    ENTITY_NOT_FOUND: 2003,
    OPERATION_NOT_ALLOWED: 2004,
    
    // External Services (3xxx)
    EXTERNAL_SERVICE_ERROR: 3001,
    API_RATE_LIMIT: 3002,
    API_TIMEOUT: 3003,
    API_UNAVAILABLE: 3004,
    
    // Database (4xxx)
    DATABASE_ERROR: 4001,
    CONSTRAINT_VIOLATION: 4002,
    TRANSACTION_FAILED: 4003,
    
    // Authentication/Authorization (5xxx)
    AUTHENTICATION_FAILED: 5001,
    AUTHORIZATION_DENIED: 5002,
    SESSION_EXPIRED: 5003,
    INVALID_TOKEN: 5004,
    
    // System (6xxx)
    INTERNAL_ERROR: 6001,
    CONFIGURATION_ERROR: 6002,
    RESOURCE_EXHAUSTED: 6003,
    OPERATION_TIMEOUT: 6004
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CLASSES DE ERRO CUSTOMIZADAS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Erro base enterprise
   */
  function EnterpriseError(message, code, details) {
    this.name = 'EnterpriseError';
    this.message = message;
    this.code = code;
    this.details = details || {};
    this.timestamp = new Date().toISOString();
    this.isRetryable = false;
    this.httpStatus = 500;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnterpriseError);
    }
  }
  EnterpriseError.prototype = Object.create(Error.prototype);
  EnterpriseError.prototype.constructor = EnterpriseError;
  
  /**
   * Erro de validacao
   */
  function ValidationError(message, details) {
    EnterpriseError.call(this, message, ErrorCodes.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
    this.httpStatus = 400;
  }
  ValidationError.prototype = Object.create(EnterpriseError.prototype);
  
  /**
   * Erro de negocio
   */
  function BusinessError(message, code, details) {
    EnterpriseError.call(this, message, code || ErrorCodes.BUSINESS_RULE_VIOLATION, details);
    this.name = 'BusinessError';
    this.httpStatus = 422;
  }
  BusinessError.prototype = Object.create(EnterpriseError.prototype);
  
  /**
   * Erro de servico externo
   */
  function ExternalServiceError(message, serviceName, details) {
    EnterpriseError.call(this, message, ErrorCodes.EXTERNAL_SERVICE_ERROR, details);
    this.name = 'ExternalServiceError';
    this.serviceName = serviceName;
    this.isRetryable = true;
    this.httpStatus = 502;
  }
  ExternalServiceError.prototype = Object.create(EnterpriseError.prototype);
  
  /**
   * Erro de autenticacao
   */
  function AuthenticationError(message, details) {
    EnterpriseError.call(this, message, ErrorCodes.AUTHENTICATION_FAILED, details);
    this.name = 'AuthenticationError';
    this.httpStatus = 401;
  }
  AuthenticationError.prototype = Object.create(EnterpriseError.prototype);
  
  /**
   * Erro de autorizacao
   */
  function AuthorizationError(message, details) {
    EnterpriseError.call(this, message, ErrorCodes.AUTHORIZATION_DENIED, details);
    this.name = 'AuthorizationError';
    this.httpStatus = 403;
  }
  AuthorizationError.prototype = Object.create(EnterpriseError.prototype);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const circuitBreakers = {};
  
  function CircuitBreaker(name, options) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60s
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  CircuitBreaker.prototype.execute = function(fn) {
    const self = this;
    
    // Se circuito aberto, verificar se pode tentar novamente
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        EnterpriseLogger.info('Circuit breaker em HALF_OPEN', { name: this.name });
      } else {
        throw new ExternalServiceError(
          'Circuit breaker aberto para ' + this.name,
          this.name,
          { state: this.state, failures: this.failures }
        );
      }
    }
    
    try {
      const result = fn();
      
      // Sucesso
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.reset();
        }
      } else {
        this.failures = 0;
      }
      
      return result;
      
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  };
  
  CircuitBreaker.prototype.recordFailure = function() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      EnterpriseLogger.error('Circuit breaker ABERTO', {
        name: this.name,
        failures: this.failures
      });
    }
  };
  
  CircuitBreaker.prototype.reset = function() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    EnterpriseLogger.info('Circuit breaker FECHADO', { name: this.name });
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RETRY LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Executa funcao com retry e exponential backoff
   * @param {Function} fn - Funcao a executar
   * @param {Object} options - Opcoes de retry
   * @returns {*} Resultado da funcao
   */
  function executeWithRetry(fn, options) {
    const config = {
      maxRetries: options.maxRetries || 3,
      initialDelay: options.initialDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      backoffMultiplier: options.backoffMultiplier || 2,
      retryableErrors: options.retryableErrors || []
    };
    
    let attempt = 0;
    let delay = config.initialDelay;
    
    function shouldRetry(error) {
      if (attempt >= config.maxRetries) return false;
      
      if (error.isRetryable) return true;
      
      if (config.retryableErrors.length > 0) {
        return config.retryableErrors.some(function(errorType) {
          return error instanceof errorType || error.name === errorType;
        });
      }
      
      return false;
    }
    
    function execute() {
      try {
        return fn();
      } catch (error) {
        attempt++;
        
        if (shouldRetry(error)) {
          EnterpriseLogger.warn('Retentativa ' + attempt + '/' + config.maxRetries, {
            error: error.message,
            delayMs: delay
          });
          
          Utilities.sleep(delay);
          delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
          
          return execute();
        }
        
        throw error;
      }
    }
    
    return execute();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // API PUBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    
    // Classes de erro
    EnterpriseError: EnterpriseError,
    ValidationError: ValidationError,
    BusinessError: BusinessError,
    ExternalServiceError: ExternalServiceError,
    AuthenticationError: AuthenticationError,
    AuthorizationError: AuthorizationError,
    
    // Error codes
    ErrorCodes: ErrorCodes,
    
    /**
     * Trata erro e retorna resposta padronizada
     * @param {Error} error - Erro a tratar
     * @param {Object} context - Contexto adicional
     * @returns {Object} Resposta de erro padronizada
     */
    handleError: function(error, context) {
      const response = {
        success: false,
        error: {
          message: error.message || 'Erro desconhecido',
          code: error.code || ErrorCodes.INTERNAL_ERROR,
          timestamp: new Date().toISOString()
        }
      };
      
      // Adiciona detalhes se for EnterpriseError
      if (error instanceof EnterpriseError) {
        response.error.type = error.name;
        response.error.httpStatus = error.httpStatus;
        
        if (error.details && Object.keys(error.details).length > 0) {
          response.error.details = error.details;
        }
      }
      
      // Log do erro
      if (typeof EnterpriseLogger !== 'undefined') {
        EnterpriseLogger.error('Erro capturado', context || {}, error);
      } else {
        Logger.log('ERROR: ' + JSON.stringify(response));
      }
      
      return response;
    },
    
    /**
     * Wrapper seguro para execucao de funcoes
     * @param {Function} fn - Funcao a executar
     * @param {Object} context - Contexto
     * @returns {Object} Resultado ou erro
     */
    safeExecute: function(fn, context) {
      try {
        const result = fn();
        return {
          success: true,
          data: result
        };
      } catch (error) {
        return this.handleError(error, context);
      }
    },
    
    /**
     * Executa com retry
     * @param {Function} fn - Funcao
     * @param {Object} options - Opcoes de retry
     */
    withRetry: function(fn, options) {
      return executeWithRetry(fn, options || {});
    },
    
    /**
     * Obtem ou cria circuit breaker
     * @param {string} name - Nome do circuit breaker
     * @param {Object} options - Opcoes
     * @returns {CircuitBreaker}
     */
    getCircuitBreaker: function(name, options) {
      if (!circuitBreakers[name]) {
        circuitBreakers[name] = new CircuitBreaker(name, options || {});
      }
      return circuitBreakers[name];
    },
    
    /**
     * Valida dados e lanca erro se invalido
     * @param {boolean} condition - Condicao de validacao
     * @param {string} message - Mensagem de erro
     * @param {Object} details - Detalhes adicionais
     */
    assert: function(condition, message, details) {
      if (!condition) {
        throw new ValidationError(message, details);
      }
    },
    
    /**
     * Valida campo obrigatorio
     * @param {*} value - Valor
     * @param {string} fieldName - Nome do campo
     */
    assertRequired: function(value, fieldName) {
      if (value === null || value === undefined || value === '') {
        throw new ValidationError(
          'Campo obrigatorio: ' + fieldName,
          { field: fieldName, code: ErrorCodes.REQUIRED_FIELD_MISSING }
        );
      }
    }
  };
  
})();

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE USO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Validacao
 */
function exemploValidacao() {
  const EH = EnterpriseErrorHandler;
  
  try {
    const userData = { email: 'test@example.com' };
    
    EH.assertRequired(userData.nome, 'nome');
    EH.assert(userData.email.includes('@'), 'Email invalido');
    
  } catch (error) {
    return EH.handleError(error);
  }
}

/**
 * Exemplo 2: Retry com backoff
 */
function exemploRetry() {
  const EH = EnterpriseErrorHandler;
  
  return EH.withRetry(function() {
    // Simula chamada API externa
    const response = UrlFetchApp.fetch('https://api.example.com/data');
    return JSON.parse(response.getContentText());
  }, {
    maxRetries: 3,
    initialDelay: 1000,
    retryableErrors: ['ExternalServiceError']
  });
}

/**
 * Exemplo 3: Circuit breaker
 */
function exemploCircuitBreaker() {
  const EH = EnterpriseErrorHandler;
  const breaker = EH.getCircuitBreaker('gemini-api', {
    failureThreshold: 5,
    resetTimeout: 60000
  });
  
  try {
    return breaker.execute(function() {
      // Chamada ao Gemini API
      return GeminiAIService.callGemini('test prompt');
    });
  } catch (error) {
    return EH.handleError(error);
  }
}
