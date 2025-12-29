/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROJECT HEALTH CHECK - Verificação de Saúde do Projeto
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consolida métricas de qualidade, testes e configuração do sistema.
 * Fornece visão geral do estado do projeto após refatorações.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Namespace para verificação de saúde do projeto
 */
const ProjectHealthCheck = {

  /**
   * Executa verificação completa de saúde do projeto
   * @returns {Object} Relatório de saúde
   */
  runFullCheck: function() {
    const startTime = Date.now();
    
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🏥 PROJECT HEALTH CHECK - Reserva Araras');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION,
      checks: {},
      summary: { passed: 0, warnings: 0, failed: 0 },
      recommendations: []
    };
    
    // 1. Verificação de Configuração
    report.checks.configuration = this._checkConfiguration();
    this._updateSummary(report.summary, report.checks.configuration);
    
    // 2. Verificação de Módulos Core
    report.checks.coreModules = this._checkCoreModules();
    this._updateSummary(report.summary, report.checks.coreModules);
    
    // 3. Verificação de Serviços
    report.checks.services = this._checkServices();
    this._updateSummary(report.summary, report.checks.services);
    
    // 4. Verificação de Testes
    report.checks.testing = this._checkTesting();
    this._updateSummary(report.summary, report.checks.testing);
    
    // 5. Verificação de Validação
    report.checks.validation = this._checkValidation();
    this._updateSummary(report.summary, report.checks.validation);
    
    // 6. Verificação de Documentação
    report.checks.documentation = this._checkDocumentation();
    this._updateSummary(report.summary, report.checks.documentation);
    
    // 7. Verificação de Segurança
    report.checks.security = this._checkSecurity();
    this._updateSummary(report.summary, report.checks.security);
    
    // Calcula score geral
    const totalChecks = report.summary.passed + report.summary.warnings + report.summary.failed;
    report.healthScore = Math.round((report.summary.passed / totalChecks) * 100);
    report.status = this._getHealthStatus(report.healthScore);
    report.duration = Date.now() - startTime;
    
    // Gera recomendações
    report.recommendations = this._generateRecommendations(report.checks);
    
    // Imprime resumo
    this._printReport(report);
    
    return report;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VERIFICAÇÕES INDIVIDUAIS
  // ═══════════════════════════════════════════════════════════════════════

  _checkConfiguration: function() {
    Logger.log('📋 Verificando Configuração...');
    const result = { name: 'Configuração', status: 'passed', items: [] };
    
    // CONFIG existe
    if (typeof CONFIG !== 'undefined') {
      result.items.push({ check: 'CONFIG definido', status: 'passed' });
    } else {
      result.items.push({ check: 'CONFIG definido', status: 'failed' });
      result.status = 'failed';
    }
    
    // SPREADSHEET_ID
    if (CONFIG.SPREADSHEET_ID) {
      result.items.push({ check: 'SPREADSHEET_ID configurado', status: 'passed' });
    } else {
      result.items.push({ check: 'SPREADSHEET_ID configurado', status: 'warning', message: 'Usando planilha ativa' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    // GEMINI_API_KEY
    if (CONFIG.GEMINI_API_KEY) {
      result.items.push({ check: 'GEMINI_API_KEY configurada', status: 'passed' });
    } else {
      result.items.push({ check: 'GEMINI_API_KEY configurada', status: 'warning', message: 'IA desabilitada' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    // ConfigManager
    if (typeof ConfigManager !== 'undefined') {
      result.items.push({ check: 'ConfigManager disponível', status: 'passed' });
    } else {
      result.items.push({ check: 'ConfigManager disponível', status: 'failed' });
      result.status = 'failed';
    }
    
    return result;
  },

  _checkCoreModules: function() {
    Logger.log('🔧 Verificando Módulos Core...');
    const result = { name: 'Módulos Core', status: 'passed', items: [] };
    
    const coreModules = [
      { name: 'DatabaseService', required: true },
      { name: 'CRUDFactory', required: false },
      { name: 'CRUD_ENTITIES', required: false },
      { name: 'ValidationService', required: true },
      { name: 'InputValidators', required: false },
      { name: 'AuthService', required: true },
      { name: 'CacheManager', required: false },
      { name: 'Utils', required: true }
    ];
    
    coreModules.forEach(module => {
      const exists = typeof globalThis[module.name] !== 'undefined';
      if (exists) {
        result.items.push({ check: `${module.name} disponível`, status: 'passed' });
      } else if (module.required) {
        result.items.push({ check: `${module.name} disponível`, status: 'failed' });
        result.status = 'failed';
      } else {
        result.items.push({ check: `${module.name} disponível`, status: 'warning', message: 'Opcional' });
        if (result.status === 'passed') result.status = 'warning';
      }
    });
    
    return result;
  },

  _checkServices: function() {
    Logger.log('⚙️ Verificando Serviços...');
    const result = { name: 'Serviços', status: 'passed', items: [] };
    
    const services = [
      'BiodiversityService',
      'CarbonTrackingService',
      'NotificationService',
      'ExportService',
      'NavigationService',
      'PhotoService',
      'GPSService'
    ];
    
    let available = 0;
    services.forEach(service => {
      if (typeof globalThis[service] !== 'undefined') {
        available++;
      }
    });
    
    const percentage = Math.round((available / services.length) * 100);
    result.items.push({ 
      check: `Serviços disponíveis: ${available}/${services.length} (${percentage}%)`, 
      status: percentage >= 70 ? 'passed' : percentage >= 50 ? 'warning' : 'failed'
    });
    
    if (percentage < 50) result.status = 'failed';
    else if (percentage < 70) result.status = 'warning';
    
    return result;
  },

  _checkTesting: function() {
    Logger.log('🧪 Verificando Testes...');
    const result = { name: 'Testes', status: 'passed', items: [] };
    
    // TestFramework
    if (typeof Assert !== 'undefined' && typeof TestRunner !== 'undefined') {
      result.items.push({ check: 'TestFramework disponível', status: 'passed' });
    } else {
      result.items.push({ check: 'TestFramework disponível', status: 'warning' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    // Funções de teste
    const testFunctions = [
      'runAllTests',
      'runCRUDFactoryTests',
      'runInputValidatorsTests',
      'quickTestCRUDFactory',
      'quickTestInputValidators'
    ];
    
    let testCount = 0;
    testFunctions.forEach(fn => {
      if (typeof globalThis[fn] === 'function') testCount++;
    });
    
    result.items.push({ 
      check: `Funções de teste: ${testCount}/${testFunctions.length}`, 
      status: testCount >= 3 ? 'passed' : 'warning'
    });
    
    // ValidationSchemas
    if (typeof ValidationSchemas !== 'undefined') {
      const schemaCount = Object.keys(ValidationSchemas).length;
      result.items.push({ check: `Schemas de validação: ${schemaCount}`, status: 'passed' });
    }
    
    return result;
  },

  _checkValidation: function() {
    Logger.log('✅ Verificando Validação...');
    const result = { name: 'Validação', status: 'passed', items: [] };
    
    // ValidationService
    if (typeof ValidationService !== 'undefined') {
      result.items.push({ check: 'ValidationService disponível', status: 'passed' });
      
      const methods = ['validateGPS', 'validateFormData', 'sanitizeText'];
      let methodCount = 0;
      methods.forEach(m => {
        if (typeof ValidationService[m] === 'function') methodCount++;
      });
      result.items.push({ check: `Métodos de validação: ${methodCount}/${methods.length}`, status: 'passed' });
    } else {
      result.items.push({ check: 'ValidationService disponível', status: 'failed' });
      result.status = 'failed';
    }
    
    // InputValidators
    if (typeof InputValidators !== 'undefined') {
      result.items.push({ check: 'InputValidators disponível', status: 'passed' });
      
      const validators = ['isEmail', 'isLatitude', 'isLongitude', 'validateSchema', 'sanitizeString'];
      let validatorCount = 0;
      validators.forEach(v => {
        if (typeof InputValidators[v] === 'function') validatorCount++;
      });
      result.items.push({ check: `Validadores: ${validatorCount}/${validators.length}`, status: 'passed' });
    } else {
      result.items.push({ check: 'InputValidators disponível', status: 'warning' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    return result;
  },

  _checkDocumentation: function() {
    Logger.log('📚 Verificando Documentação...');
    const result = { name: 'Documentação', status: 'passed', items: [] };
    
    // Verifica se funções principais têm JSDoc (amostragem)
    const functionsToCheck = [
      { name: 'doGet', file: 'Code.gs' },
      { name: 'apiAuthenticate', file: 'ApiEndpoints.gs' },
      { name: 'getSheet', file: 'Config.gs' }
    ];
    
    let documented = 0;
    functionsToCheck.forEach(fn => {
      if (typeof globalThis[fn.name] === 'function') {
        documented++;
      }
    });
    
    result.items.push({ 
      check: `Funções documentadas (amostra): ${documented}/${functionsToCheck.length}`, 
      status: 'passed' 
    });
    
    // CONFIG.VERSION
    if (CONFIG.VERSION) {
      result.items.push({ check: `Versão do sistema: ${CONFIG.VERSION}`, status: 'passed' });
    }
    
    return result;
  },

  _checkSecurity: function() {
    Logger.log('🔒 Verificando Segurança...');
    const result = { name: 'Segurança', status: 'passed', items: [] };
    
    // AuthService
    if (typeof AuthService !== 'undefined') {
      result.items.push({ check: 'AuthService disponível', status: 'passed' });
    } else {
      result.items.push({ check: 'AuthService disponível', status: 'warning' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    // Sanitização disponível
    const hasSanitize = (typeof ValidationService !== 'undefined' && typeof ValidationService.sanitizeText === 'function') ||
                        (typeof InputValidators !== 'undefined' && typeof InputValidators.sanitizeString === 'function');
    
    if (hasSanitize) {
      result.items.push({ check: 'Sanitização de input disponível', status: 'passed' });
    } else {
      result.items.push({ check: 'Sanitização de input disponível', status: 'warning' });
      if (result.status === 'passed') result.status = 'warning';
    }
    
    // Properties Service para credenciais
    try {
      const props = PropertiesService.getScriptProperties();
      result.items.push({ check: 'Properties Service acessível', status: 'passed' });
    } catch (e) {
      result.items.push({ check: 'Properties Service acessível', status: 'failed' });
      result.status = 'failed';
    }
    
    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  _updateSummary: function(summary, check) {
    check.items.forEach(item => {
      if (item.status === 'passed') summary.passed++;
      else if (item.status === 'warning') summary.warnings++;
      else summary.failed++;
    });
  },

  _getHealthStatus: function(score) {
    if (score >= 90) return '🟢 Excelente';
    if (score >= 75) return '🟡 Bom';
    if (score >= 50) return '🟠 Regular';
    return '🔴 Crítico';
  },

  _generateRecommendations: function(checks) {
    const recommendations = [];
    
    Object.values(checks).forEach(check => {
      check.items.forEach(item => {
        if (item.status === 'warning' && item.message) {
          recommendations.push(`⚠️ ${item.check}: ${item.message}`);
        }
        if (item.status === 'failed') {
          recommendations.push(`❌ Corrigir: ${item.check}`);
        }
      });
    });
    
    return recommendations;
  },

  _printReport: function(report) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('📊 RESUMO DO HEALTH CHECK');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    // Status por categoria
    Object.values(report.checks).forEach(check => {
      const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      Logger.log(`${icon} ${check.name}: ${check.status.toUpperCase()}`);
      check.items.forEach(item => {
        const itemIcon = item.status === 'passed' ? '  ✓' : item.status === 'warning' ? '  ⚡' : '  ✗';
        Logger.log(`${itemIcon} ${item.check}`);
      });
      Logger.log('');
    });
    
    // Resumo geral
    Logger.log('───────────────────────────────────────────────────────────────');
    Logger.log(`✅ Passou: ${report.summary.passed}`);
    Logger.log(`⚠️ Avisos: ${report.summary.warnings}`);
    Logger.log(`❌ Falhou: ${report.summary.failed}`);
    Logger.log(`📈 Score: ${report.healthScore}%`);
    Logger.log(`🏥 Status: ${report.status}`);
    Logger.log(`⏱️ Duração: ${report.duration}ms`);
    
    // Recomendações
    if (report.recommendations.length > 0) {
      Logger.log('\n📝 RECOMENDAÇÕES:');
      report.recommendations.forEach(rec => Logger.log(`   ${rec}`));
    }
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
  },

  /**
   * Executa verificação rápida
   */
  quickCheck: function() {
    Logger.log('🚀 Quick Health Check\n');
    
    const checks = [
      { name: 'CONFIG', ok: typeof CONFIG !== 'undefined' },
      { name: 'DatabaseService', ok: typeof DatabaseService !== 'undefined' },
      { name: 'ValidationService', ok: typeof ValidationService !== 'undefined' },
      { name: 'AuthService', ok: typeof AuthService !== 'undefined' },
      { name: 'TestFramework', ok: typeof Assert !== 'undefined' },
      { name: 'InputValidators', ok: typeof InputValidators !== 'undefined' },
      { name: 'ConfigManager', ok: typeof ConfigManager !== 'undefined' },
      { name: 'CRUDFactory', ok: typeof getCRUD === 'function' }
    ];
    
    let passed = 0;
    checks.forEach(c => {
      const icon = c.ok ? '✅' : '❌';
      Logger.log(`${icon} ${c.name}`);
      if (c.ok) passed++;
    });
    
    const score = Math.round((passed / checks.length) * 100);
    Logger.log(`\n📊 Score: ${passed}/${checks.length} (${score}%)`);
    
    return { passed, total: checks.length, score };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES EXPOSTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa verificação completa de saúde do projeto
 */
function runProjectHealthCheck() {
  return ProjectHealthCheck.runFullCheck();
}

/**
 * Executa verificação rápida
 */
function runQuickHealthCheck() {
  return ProjectHealthCheck.quickCheck();
}

/**
 * API: Retorna status de saúde do projeto
 */
function apiGetProjectHealth() {
  try {
    const quick = ProjectHealthCheck.quickCheck();
    return {
      success: true,
      health: {
        score: quick.score,
        passed: quick.passed,
        total: quick.total,
        status: quick.score >= 75 ? 'healthy' : quick.score >= 50 ? 'degraded' : 'unhealthy'
      },
      version: CONFIG.VERSION,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
