/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE HEALTH CHECK - Sistema de Verificacao de Saude
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Health checks de componentes
 * - Readiness e liveness probes
 * - Dependency checks
 * - Status aggregado do sistema
 * - Alertas automaticos
 * 
 * @version 1.0.0
 * @enterprise
 */

const EnterpriseHealthCheck = (function() {
  'use strict';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACAO
  // ═══════════════════════════════════════════════════════════════════════════
  
  const HealthStatus = {
    HEALTHY: 'healthy',
    DEGRADED: 'degraded',
    UNHEALTHY: 'unhealthy'
  };
  
  const registeredChecks = [];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK CLASS
  // ═══════════════════════════════════════════════════════════════════════════
  
  function HealthCheck(name, checkFn, options) {
    this.name = name;
    this.checkFn = checkFn;
    this.critical = options.critical !== false;
    this.timeout = options.timeout || 5000;
    this.interval = options.interval || 60000;
    this.lastCheck = null;
    this.lastResult = null;
  }
  
  HealthCheck.prototype.execute = function() {
    const startTime = Date.now();
    
    try {
      const result = this.checkFn();
      const duration = Date.now() - startTime;
      
      this.lastCheck = new Date().toISOString();
      this.lastResult = {
        status: result.healthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        message: result.message || (result.healthy ? 'OK' : 'Check failed'),
        durationMs: duration,
        details: result.details || {},
        timestamp: this.lastCheck
      };
      
      return this.lastResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.lastCheck = new Date().toISOString();
      this.lastResult = {
        status: HealthStatus.UNHEALTHY,
        message: error.message || error.toString(),
        durationMs: duration,
        error: error.toString(),
        timestamp: this.lastCheck
      };
      
      return this.lastResult;
    }
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKS PADRAO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Check de banco de dados (Spreadsheet)
   */
  function checkDatabase() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        return { healthy: false, message: 'Spreadsheet nao acessivel' };
      }
      
      const sheets = ss.getSheets();
      return {
        healthy: true,
        message: 'Database OK',
        details: {
          spreadsheetId: ss.getId(),
          sheetsCount: sheets.length
        }
      };
    } catch (error) {
      return { healthy: false, message: 'Erro ao acessar database: ' + error };
    }
  }
  
  /**
   * Check de configuracao
   */
  function checkConfiguration() {
    try {
      if (typeof CONFIG === 'undefined') {
        return { healthy: false, message: 'CONFIG nao definido' };
      }
      
      const required = ['SPREADSHEET_ID', 'SHEETS'];
      const missing = [];
      
      required.forEach(function(key) {
        if (!CONFIG[key]) {
          missing.push(key);
        }
      });
      
      if (missing.length > 0) {
        return {
          healthy: false,
          message: 'Configuracao incompleta',
          details: { missing: missing }
        };
      }
      
      return {
        healthy: true,
        message: 'Configuracao OK',
        details: {
          environment: CONFIG.ENVIRONMENT || 'production'
        }
      };
    } catch (error) {
      return { healthy: false, message: 'Erro ao verificar configuracao: ' + error };
    }
  }
  
  /**
   * Check de servicos core
   */
  function checkCoreServices() {
    const services = [
      'DatabaseService',
      'ValidationService',
      'AuthService'
    ];
    
    const available = [];
    const missing = [];
    
    services.forEach(function(service) {
      if (typeof globalThis[service] !== 'undefined') {
        available.push(service);
      } else {
        missing.push(service);
      }
    });
    
    return {
      healthy: missing.length === 0,
      message: missing.length === 0 ? 'Servicos OK' : 'Servicos faltando',
      details: {
        available: available,
        missing: missing,
        total: services.length
      }
    };
  }
  
  /**
   * Check de memoria
   */
  function checkMemory() {
    try {
      // Google Apps Script tem limite de 6 minutos de execucao
      // Vamos verificar se ainda temos tempo
      const cache = CacheService.getScriptCache();
      const testKey = 'health_check_test';
      const testValue = 'ok';
      
      cache.put(testKey, testValue, 60);
      const retrieved = cache.get(testKey);
      
      return {
        healthy: retrieved === testValue,
        message: retrieved === testValue ? 'Cache OK' : 'Cache com problemas',
        details: {
          cacheWorking: retrieved === testValue
        }
      };
    } catch (error) {
      return { healthy: false, message: 'Erro ao verificar cache: ' + error };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // API PUBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    
    HealthStatus: HealthStatus,
    
    /**
     * Registra um health check customizado
     * @param {string} name - Nome do check
     * @param {Function} checkFn - Funcao que retorna {healthy: boolean, message: string}
     * @param {Object} options - Opcoes
     */
    registerCheck: function(name, checkFn, options) {
      const check = new HealthCheck(name, checkFn, options || {});
      registeredChecks.push(check);
      return check;
    },
    
    /**
     * Executa todos os health checks
     * @returns {Object} Status agregado
     */
    checkAll: function() {
      // Registra checks padrão se nao houver nenhum
      if (registeredChecks.length === 0) {
        this.registerDefaultChecks();
      }
      
      const results = [];
      let overallStatus = HealthStatus.HEALTHY;
      let criticalFailed = false;
      
      registeredChecks.forEach(function(check) {
        const result = check.execute();
        results.push({
          name: check.name,
          critical: check.critical,
          status: result.status,
          message: result.message,
          durationMs: result.durationMs,
          details: result.details,
          timestamp: result.timestamp
        });
        
        if (result.status === HealthStatus.UNHEALTHY) {
          if (check.critical) {
            criticalFailed = true;
          }
        }
      });
      
      // Determina status geral
      if (criticalFailed) {
        overallStatus = HealthStatus.UNHEALTHY;
      } else {
        const unhealthyCount = results.filter(function(r) {
          return r.status === HealthStatus.UNHEALTHY;
        }).length;
        
        if (unhealthyCount > 0) {
          overallStatus = HealthStatus.DEGRADED;
        }
      }
      
      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: results,
        summary: {
          total: results.length,
          healthy: results.filter(function(r) { return r.status === HealthStatus.HEALTHY; }).length,
          unhealthy: results.filter(function(r) { return r.status === HealthStatus.UNHEALTHY; }).length
        }
      };
    },
    
    /**
     * Registra checks padrao
     */
    registerDefaultChecks: function() {
      this.registerCheck('database', checkDatabase, { critical: true });
      this.registerCheck('configuration', checkConfiguration, { critical: true });
      this.registerCheck('core_services', checkCoreServices, { critical: true });
      this.registerCheck('cache', checkMemory, { critical: false });
    },
    
    /**
     * Liveness probe - sistema esta vivo?
     * @returns {boolean}
     */
    liveness: function() {
      try {
        // Check basico - consegue executar codigo?
        return true;
      } catch (error) {
        return false;
      }
    },
    
    /**
     * Readiness probe - sistema esta pronto para receber requests?
     * @returns {Object}
     */
    readiness: function() {
      const health = this.checkAll();
      
      return {
        ready: health.status !== HealthStatus.UNHEALTHY,
        status: health.status,
        timestamp: health.timestamp
      };
    },
    
    /**
     * Gera relatorio de saude
     * @returns {string}
     */
    generateReport: function() {
      const health = this.checkAll();
      const lines = [];
      
      lines.push('═══════════════════════════════════════════════════════');
      lines.push('HEALTH CHECK REPORT - ' + health.timestamp);
      lines.push('═══════════════════════════════════════════════════════\n');
      
      // Status geral
      const statusIcon = health.status === HealthStatus.HEALTHY ? '✅' :
                         health.status === HealthStatus.DEGRADED ? '⚠️' : '❌';
      
      lines.push('STATUS GERAL: ' + statusIcon + ' ' + health.status.toUpperCase());
      lines.push('');
      
      // Sumario
      lines.push('SUMARIO:');
      lines.push('  Total de checks: ' + health.summary.total);
      lines.push('  Healthy: ' + health.summary.healthy);
      lines.push('  Unhealthy: ' + health.summary.unhealthy);
      lines.push('');
      
      // Detalhes dos checks
      lines.push('DETALHES:\n');
      health.checks.forEach(function(check) {
        const icon = check.status === HealthStatus.HEALTHY ? '✅' : '❌';
        const critical = check.critical ? '[CRITICAL]' : '[NON-CRITICAL]';
        
        lines.push(icon + ' ' + check.name + ' ' + critical);
        lines.push('   Status: ' + check.status);
        lines.push('   Message: ' + check.message);
        lines.push('   Duration: ' + check.durationMs + 'ms');
        
        if (check.details && Object.keys(check.details).length > 0) {
          lines.push('   Details: ' + JSON.stringify(check.details));
        }
        lines.push('');
      });
      
      lines.push('═══════════════════════════════════════════════════════');
      
      return lines.join('\n');
    },
    
    /**
     * Log do relatorio
     */
    logReport: function() {
      const report = this.generateReport();
      Logger.log(report);
      
      if (typeof EnterpriseLogger !== 'undefined') {
        const health = this.checkAll();
        EnterpriseLogger.info('Health check executado', {
          status: health.status,
          checksTotal: health.summary.total,
          checksHealthy: health.summary.healthy
        });
      }
      
      return report;
    },
    
    /**
     * Limpa checks registrados
     */
    clearChecks: function() {
      registeredChecks.length = 0;
    }
  };
  
})();

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE USO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Health check basico
 */
function exemploHealthCheck() {
  const health = EnterpriseHealthCheck.checkAll();
  Logger.log('Status: ' + health.status);
  Logger.log('Checks: ' + health.summary.total);
}

/**
 * Exemplo 2: Check customizado
 */
function exemploCheckCustomizado() {
  EnterpriseHealthCheck.registerCheck('gemini_api', function() {
    try {
      const hasKey = CONFIG.GEMINI_API_KEY !== null;
      return {
        healthy: hasKey,
        message: hasKey ? 'Gemini API configurado' : 'Gemini API nao configurado',
        details: { configured: hasKey }
      };
    } catch (error) {
      return { healthy: false, message: error.toString() };
    }
  }, { critical: false });
  
  EnterpriseHealthCheck.logReport();
}

/**
 * Exemplo 3: Endpoint de status (para monitoring)
 * NOTA: apiHealthCheck simples está em ApiEndpoints.gs
 * Esta versão retorna ContentService para uso como web endpoint
 */
function apiEnterpriseHealthCheck() {
  const health = EnterpriseHealthCheck.checkAll();
  
  return ContentService
    .createTextOutput(JSON.stringify(health, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
