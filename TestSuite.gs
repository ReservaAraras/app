/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST SUITE - RESERVA ARARAS
 * ═══════════════════════════════════════════════════════════════════════════
 * Suite unificada de testes com estrutura consistente
 * 
 * CATEGORIAS:
 * - Unit Tests: Testes unitários de funções individuais
 * - Integration Tests: Testes de integração CRUD completo
 * - Validation Tests: Testes de validação de dados
 * - System Tests: Testes de sistema completo
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNNER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa TODOS os testes do sistema
 * @param {Object} options - Opções de execução
 * @returns {Object} Resultados consolidados
 */
function runAllTests(options = {}) {
  const config = {
    verbose: options.verbose !== false,
    stopOnFailure: options.stopOnFailure || false,
    categories: options.categories || ['unit', 'integration', 'validation', 'system']
  };
  
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║   🧪 RESERVA ARARAS - TEST SUITE                            ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const startTime = new Date();
  const results = {
    timestamp: startTime.toISOString(),
    config: config,
    categories: {},
    summary: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 }
  };
  
  // Executa categorias de teste
  if (config.categories.includes('unit')) {
    results.categories.unit = runUnitTests(config);
  }
  
  if (config.categories.includes('integration')) {
    results.categories.integration = runIntegrationTests(config);
  }
  
  if (config.categories.includes('validation')) {
    results.categories.validation = runValidationTests(config);
  }
  
  if (config.categories.includes('system')) {
    results.categories.system = runSystemTests(config);
  }
  
  // Consolida resultados
  Object.values(results.categories).forEach(category => {
    results.summary.passed += category.summary.passed;
    results.summary.failed += category.summary.failed;
    results.summary.skipped += category.summary.skipped;
    results.summary.total += category.summary.total;
  });
  
  const endTime = new Date();
  results.summary.duration = (endTime - startTime) / 1000;
  
  // Exibe resumo final
  printTestSummary(results);
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS - Testes Unitários
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa testes unitários
 */
function runUnitTests(config = {}) {
  config = {
    verbose: config.verbose !== false,
    stopOnFailure: config.stopOnFailure || false
  };
  
  Logger.log('\n📦 UNIT TESTS - Testes Unitários');
  Logger.log('─'.repeat(70));
  
  const results = {
    category: 'unit',
    tests: [],
    summary: { passed: 0, failed: 0, skipped: 0, total: 0 }
  };
  
  // Define testes unitários
  const unitTests = [
    { name: 'Utils.generateId', fn: testGenerateId },
    { name: 'Utils.formatDate', fn: testFormatDate },
    { name: 'Utils.validateEmail', fn: testValidateEmail },
    { name: 'Config.getSheet', fn: testGetSheet },
    { name: 'DatabaseService.create', fn: testDatabaseCreate },
    { name: 'DatabaseService.read', fn: testDatabaseRead },
    { name: 'DatabaseService.update', fn: testDatabaseUpdate },
    { name: 'DatabaseService.delete', fn: testDatabaseDelete }
  ];
  
  // Executa cada teste
  unitTests.forEach(test => {
    const result = executeTest(test, config);
    results.tests.push(result);
    updateSummary(results.summary, result);
    
    if (config.stopOnFailure && !result.passed) {
      Logger.log('\n⚠️  Parando execução devido a falha');
      return results;
    }
  });
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS - Testes de Integração
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa testes de integração CRUD
 */
function runIntegrationTests(config = {}) {
  config = {
    verbose: config.verbose !== false,
    stopOnFailure: config.stopOnFailure || false
  };
  
  Logger.log('\n🔗 INTEGRATION TESTS - Testes de Integração CRUD');
  Logger.log('─'.repeat(70));
  
  const results = {
    category: 'integration',
    tests: [],
    summary: { passed: 0, failed: 0, skipped: 0, total: 0 }
  };
  
  // Define testes de integração
  const integrationTests = [
    { name: 'Agrofloresta CRUD', fn: testAgroforestaCRUD },
    { name: 'Ambiental CRUD', fn: testAmbientalCRUD },
    { name: 'Ecoturismo CRUD', fn: testEcoturismoCRUD },
    { name: 'GPS CRUD', fn: testGPSCRUD },
    { name: 'Terapia CRUD', fn: testTerapiaCRUD },
    { name: 'Biodiversidade CRUD', fn: testBiodiversidadeCRUD },
    { name: 'Cascade Delete', fn: testCascadeDelete },
    { name: 'Relacionamentos', fn: testRelacionamentos }
  ];
  
  // Executa cada teste
  integrationTests.forEach(test => {
    const result = executeTest(test, config);
    results.tests.push(result);
    updateSummary(results.summary, result);
    
    if (config.stopOnFailure && !result.passed) {
      Logger.log('\n⚠️  Parando execução devido a falha');
      return results;
    }
  });
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION TESTS - Testes de Validação
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa testes de validação de dados
 */
function runValidationTests(config = {}) {
  config = {
    verbose: config.verbose !== false,
    stopOnFailure: config.stopOnFailure || false
  };
  
  Logger.log('\n✅ VALIDATION TESTS - Testes de Validação');
  Logger.log('─'.repeat(70));
  
  const results = {
    category: 'validation',
    tests: [],
    summary: { passed: 0, failed: 0, skipped: 0, total: 0 }
  };
  
  // Define testes de validação
  const validationTests = [
    { name: 'Campos Obrigatórios', fn: testRequiredFields },
    { name: 'Tipos de Dados', fn: testDataTypes },
    { name: 'Limites de Valores', fn: testValueLimits },
    { name: 'Formatos', fn: testFormats },
    { name: 'Integridade Referencial', fn: testReferentialIntegrity }
  ];
  
  // Executa cada teste
  validationTests.forEach(test => {
    const result = executeTest(test, config);
    results.tests.push(result);
    updateSummary(results.summary, result);
    
    if (config.stopOnFailure && !result.passed) {
      Logger.log('\n⚠️  Parando execução devido a falha');
      return results;
    }
  });
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM TESTS - Testes de Sistema
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa testes de sistema completo
 */
function runSystemTests(config = {}) {
  config = {
    verbose: config.verbose !== false,
    stopOnFailure: config.stopOnFailure || false
  };
  
  Logger.log('\n🌐 SYSTEM TESTS - Testes de Sistema');
  Logger.log('─'.repeat(70));
  
  const results = {
    category: 'system',
    tests: [],
    summary: { passed: 0, failed: 0, skipped: 0, total: 0 }
  };
  
  // Define testes de sistema
  const systemTests = [
    { name: 'Navegação', fn: testNavigation },
    { name: 'Workflows', fn: testWorkflows },
    { name: 'Exportação', fn: testExport },
    { name: 'Notificações', fn: testNotifications },
    { name: 'Offline Mode', fn: testOfflineMode }
  ];
  
  // Executa cada teste
  systemTests.forEach(test => {
    const result = executeTest(test, config);
    results.tests.push(result);
    updateSummary(results.summary, result);
    
    if (config.stopOnFailure && !result.passed) {
      Logger.log('\n⚠️  Parando execução devido a falha');
      return results;
    }
  });
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST HELPERS - Funções Auxiliares
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa um teste individual
 */
function executeTest(test, config) {
  const startTime = new Date();
  const result = {
    name: test.name,
    passed: false,
    error: null,
    duration: 0,
    timestamp: startTime.toISOString()
  };
  
  try {
    if (config.verbose) {
      Logger.log(`\n  🧪 ${test.name}`);
    }
    
    // Executa função de teste
    const testResult = test.fn();
    
    // Verifica resultado
    if (testResult && testResult.success !== false) {
      result.passed = true;
      if (config.verbose) {
        Logger.log(`  ✅ PASSOU`);
      }
    } else {
      result.error = testResult?.error || 'Teste retornou falha';
      if (config.verbose) {
        Logger.log(`  ❌ FALHOU: ${result.error}`);
      }
    }
    
  } catch (error) {
    result.error = error.toString();
    if (config.verbose) {
      Logger.log(`  ❌ ERRO: ${result.error}`);
    }
  }
  
  const endTime = new Date();
  result.duration = (endTime - startTime) / 1000;
  
  return result;
}

/**
 * Atualiza sumário de resultados
 */
function updateSummary(summary, result) {
  summary.total++;
  if (result.passed) {
    summary.passed++;
  } else if (result.error && result.error.includes('SKIP')) {
    summary.skipped++;
  } else {
    summary.failed++;
  }
}

/**
 * Imprime sumário final dos testes
 */
function printTestSummary(results) {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║   📊 RESUMO FINAL DOS TESTES                                ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Sumário por categoria
  Object.entries(results.categories).forEach(([category, data]) => {
    const icon = getCategoryIcon(category);
    Logger.log(`${icon} ${category.toUpperCase()}`);
    Logger.log(`   ✅ Passou: ${data.summary.passed}`);
    Logger.log(`   ❌ Falhou: ${data.summary.failed}`);
    Logger.log(`   ⏭️  Pulou: ${data.summary.skipped}`);
    Logger.log(`   📝 Total: ${data.summary.total}\n`);
  });
  
  // Sumário geral
  Logger.log('─'.repeat(70));
  Logger.log(`✅ Total Passou: ${results.summary.passed}`);
  Logger.log(`❌ Total Falhou: ${results.summary.failed}`);
  Logger.log(`⏭️  Total Pulou: ${results.summary.skipped}`);
  Logger.log(`📝 Total Testes: ${results.summary.total}`);
  Logger.log(`⏱️  Duração: ${results.summary.duration.toFixed(2)}s`);
  Logger.log(`📈 Taxa de Sucesso: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  
  if (results.summary.failed === 0) {
    Logger.log('\n🎉 TODOS OS TESTES PASSARAM!');
  } else {
    Logger.log(`\n⚠️  ${results.summary.failed} TESTE(S) FALHARAM`);
  }
  
  Logger.log('\n' + '═'.repeat(70));
}

/**
 * Retorna ícone para categoria
 */
function getCategoryIcon(category) {
  const icons = {
    'unit': '📦',
    'integration': '🔗',
    'validation': '✅',
    'system': '🌐'
  };
  return icons[category] || '🧪';
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK TEST RUNNERS - Atalhos para Execução Rápida
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa apenas testes unitários
 */
function runQuickUnitTests() {
  return runAllTests({ categories: ['unit'], verbose: true });
}

/**
 * Executa apenas testes de integração
 */
function runQuickIntegrationTests() {
  return runAllTests({ categories: ['integration'], verbose: true });
}

/**
 * Executa apenas testes de validação
 */
function runQuickValidationTests() {
  return runAllTests({ categories: ['validation'], verbose: true });
}

/**
 * Executa apenas testes de sistema
 */
function runQuickSystemTests() {
  return runAllTests({ categories: ['system'], verbose: true });
}

/**
 * Teste rápido - apenas essenciais
 */
function runQuickTest() {
  Logger.log('🚀 TESTE RÁPIDO - Apenas Essenciais\n');
  
  const tests = [
    { name: 'Config', fn: testGetSheet },
    { name: 'Database Create', fn: testDatabaseCreate },
    { name: 'Database Read', fn: testDatabaseRead },
    { name: 'Waypoint CRUD', fn: testWaypointCRUD }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      Logger.log(`  🧪 ${test.name}...`);
      const result = test.fn();
      if (result && result.success !== false) {
        Logger.log(`  ✅ PASSOU\n`);
        passed++;
      } else {
        Logger.log(`  ❌ FALHOU\n`);
        failed++;
      }
    } catch (error) {
      Logger.log(`  ❌ ERRO: ${error}\n`);
      failed++;
    }
  });
  
  Logger.log(`\n📊 Resultado: ${passed}/${tests.length} passaram`);
  
  return { passed, failed, total: tests.length };
}
