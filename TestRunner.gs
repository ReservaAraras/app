/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST RUNNER - Executor Central de Testes
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 6/13: Validação e Testes Integrados
 * 
 * Executor central que coordena todas as suites de teste do projeto.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const TEST_RUNNER_CONFIG = {
  SUITES: [
    { name: 'Limnology Forms', runner: 'runAllLimnologyTests', critical: true },
    { name: 'CRUD Factory', runner: 'runCRUDFactoryTests', critical: true },
    { name: 'Schema Registry', runner: 'testSchemaRegistry', critical: true },
    { name: 'Defensive Validation', runner: 'testDefensiveValidation', critical: false }
  ],
  LOG_TO_SHEET: true,
  SHEET_NAME: 'TestResults_RA'
};

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa todas as suites de teste
 * @returns {Object} Resultado consolidado
 */
function runAllTests() {
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║          RESERVA ARARAS - SUITE COMPLETA DE TESTES           ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('Início: ' + new Date().toISOString());
  Logger.log('');
  
  var results = {
    timestamp: new Date().toISOString(),
    suites: [],
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    criticalFailures: false
  };
  
  TEST_RUNNER_CONFIG.SUITES.forEach(function(suite) {
    Logger.log('\n▶ Executando: ' + suite.name);
    Logger.log('─'.repeat(50));
    
    var suiteResult = {
      name: suite.name,
      critical: suite.critical,
      success: false,
      tests: 0,
      passed: 0,
      failed: 0,
      error: null
    };

    try {
      if (typeof this[suite.runner] === 'function') {
        var result = this[suite.runner]();
        
        if (result && typeof result === 'object') {
          suiteResult.success = result.success !== false;
          suiteResult.tests = result.total || 0;
          suiteResult.passed = result.passed || 0;
          suiteResult.failed = result.failed || 0;
        } else {
          suiteResult.success = true;
          suiteResult.tests = 1;
          suiteResult.passed = 1;
        }
      } else {
        Logger.log('  ⚠ Runner não encontrado: ' + suite.runner);
        suiteResult.error = 'Runner não encontrado';
      }
    } catch (error) {
      suiteResult.success = false;
      suiteResult.error = error.toString();
      Logger.log('  ✗ Erro: ' + error);
    }
    
    results.suites.push(suiteResult);
    results.totalTests += suiteResult.tests;
    results.totalPassed += suiteResult.passed;
    results.totalFailed += suiteResult.failed;
    
    if (!suiteResult.success && suite.critical) {
      results.criticalFailures = true;
    }
    
    var status = suiteResult.success ? '✓' : '✗';
    Logger.log(status + ' ' + suite.name + ': ' + suiteResult.passed + '/' + suiteResult.tests);
  });
  
  // Relatório final
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('                    RESULTADO FINAL                            ');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('Total: ' + results.totalTests + ' | Passou: ' + results.totalPassed + ' | Falhou: ' + results.totalFailed);
  Logger.log('Taxa de sucesso: ' + Math.round(results.totalPassed / results.totalTests * 100) + '%');
  Logger.log('Falhas críticas: ' + (results.criticalFailures ? 'SIM' : 'Não'));
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Log para sheet se configurado
  if (TEST_RUNNER_CONFIG.LOG_TO_SHEET) {
    logTestResults(results);
  }
  
  return results;
}

/**
 * Executa testes rápidos (apenas validação)
 */
function runQuickTests() {
  Logger.log('═══ TESTES RÁPIDOS ═══\n');
  
  var results = { total: 0, passed: 0, failed: 0 };
  
  // Teste de schemas
  if (typeof SHEET_SCHEMAS !== 'undefined') {
    var schemaCount = Object.keys(SHEET_SCHEMAS).length;
    results.total++;
    if (schemaCount > 40) {
      results.passed++;
      Logger.log('✓ Schemas: ' + schemaCount + ' definidos');
    } else {
      results.failed++;
      Logger.log('✗ Schemas insuficientes: ' + schemaCount);
    }
  }
  
  // Teste de handlers
  var handlers = ['savePhysicochemicalData', 'savePhytoplanktonData', 'saveMacrophytesData'];
  handlers.forEach(function(h) {
    results.total++;
    if (typeof this[h] === 'function') {
      results.passed++;
      Logger.log('✓ Handler: ' + h);
    } else {
      results.failed++;
      Logger.log('✗ Handler ausente: ' + h);
    }
  });
  
  Logger.log('\nResultado: ' + results.passed + '/' + results.total);
  return results;
}

/**
 * Registra resultados em planilha
 */
function logTestResults(results) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TEST_RUNNER_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(TEST_RUNNER_CONFIG.SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Total', 'Passou', 'Falhou', 'Taxa', 'Crítico', 'Detalhes']);
    }
    
    var detalhes = results.suites.map(function(s) {
      return s.name + ':' + (s.success ? 'OK' : 'FALHA');
    }).join('; ');
    
    sheet.appendRow([
      results.timestamp,
      results.totalTests,
      results.totalPassed,
      results.totalFailed,
      Math.round(results.totalPassed / results.totalTests * 100) + '%',
      results.criticalFailures ? 'SIM' : 'Não',
      detalhes
    ]);
    
  } catch (e) {
    Logger.log('Erro ao registrar resultados: ' + e);
  }
}

/**
 * Testa o schema registry
 */
function testSchemaRegistry() {
  var results = { total: 0, passed: 0, failed: 0 };
  
  if (typeof SHEET_SCHEMAS === 'undefined') {
    return { success: false, total: 1, passed: 0, failed: 1 };
  }
  
  var requiredSheets = [
    'Fitoplancton_RA', 'Zooplancton_RA', 'Macrofitas_RA',
    'Bentos_RA', 'Ictiofauna_RA', 'QualidadeAgua'
  ];
  
  requiredSheets.forEach(function(name) {
    results.total++;
    if (SHEET_SCHEMAS[name]) {
      results.passed++;
    } else {
      results.failed++;
    }
  });
  
  return {
    success: results.failed === 0,
    total: results.total,
    passed: results.passed,
    failed: results.failed
  };
}

/**
 * Testa validação defensiva
 */
function testDefensiveValidation() {
  var results = { total: 0, passed: 0, failed: 0 };
  
  if (typeof DefensiveValidation === 'undefined') {
    return { success: true, total: 0, passed: 0, failed: 0 };
  }
  
  // Testes básicos
  results.total = 3;
  
  try {
    var r1 = DefensiveValidation.safeGet({a: 1}, 'a');
    if (r1 === 1) results.passed++; else results.failed++;
    
    var r2 = DefensiveValidation.safeGet(null, 'a', 'default');
    if (r2 === 'default') results.passed++; else results.failed++;
    
    var r3 = DefensiveValidation.isValidNumber('123');
    if (r3 === true) results.passed++; else results.failed++;
  } catch (e) {
    results.failed += 3 - results.passed;
  }
  
  return {
    success: results.failed === 0,
    total: results.total,
    passed: results.passed,
    failed: results.failed
  };
}

/**
 * Função de menu para executar testes
 */
function menuRunAllTests() {
  var result = runAllTests();
  
  var ui = SpreadsheetApp.getUi();
  var msg = 'Testes: ' + result.totalTests + '\n' +
            'Passou: ' + result.totalPassed + '\n' +
            'Falhou: ' + result.totalFailed + '\n' +
            'Taxa: ' + Math.round(result.totalPassed / result.totalTests * 100) + '%';
  
  if (result.criticalFailures) {
    ui.alert('⚠️ Falhas Críticas', msg, ui.ButtonSet.OK);
  } else if (result.totalFailed > 0) {
    ui.alert('⚠️ Alguns Testes Falharam', msg, ui.ButtonSet.OK);
  } else {
    ui.alert('✓ Todos os Testes Passaram', msg, ui.ButtonSet.OK);
  }
}
