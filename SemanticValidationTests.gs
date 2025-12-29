/**
 * Suite de testes para validação semântica
 */
function runSemanticValidationTests() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TESTES DE VALIDAÇÃO SEMÂNTICA');
  Logger.log('═══════════════════════════════════════════════════════════\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Registra schemas de exemplo
  registerExampleSchemas();

  // Teste 1: Validação com schema válido
  results.total++;
  try {
    const validData = {
      nome: 'Cachoeira Principal',
      latitude: -15.234,
      longitude: -47.876,
      categoria: 'cachoeira',
      altitude: 850
    };

    const result = ValidationService.validateWithSchema('Waypoint', validData);
    if (result.valid && result.errors.length === 0) {
      results.passed++;
      Logger.log('✅ Teste 1: Validação com dados válidos - PASSOU');
    } else {
      results.failed++;
      Logger.log('❌ Teste 1: FALHOU - ' + JSON.stringify(result.errors));
    }
    results.tests.push({ name: 'Validação dados válidos', passed: result.valid });
  } catch (e) {
    results.failed++;
    Logger.log('❌ Teste 1: ERRO - ' + e.message);
    results.tests.push({ name: 'Validação dados válidos', passed: false, error: e.message });
  }

  // Teste 2: Validação com campo obrigatório faltando
  results.total++;
  try {
    const invalidData = {
      latitude: -15.234,
      longitude: -47.876
      // nome e categoria faltando
    };

    const result = ValidationService.validateWithSchema('Waypoint', invalidData);
    if (!result.valid && result.errors.length > 0) {
      results.passed++;
      Logger.log('✅ Teste 2: Validação detecta campo obrigatório - PASSOU');
    } else {
      results.failed++;
      Logger.log('❌ Teste 2: FALHOU - Deveria ter detectado campos obrigatórios');
    }
    results.tests.push({ name: 'Detecção campo obrigatório', passed: !result.valid });
  } catch (e) {
    results.failed++;
    Logger.log('❌ Teste 2: ERRO - ' + e.message);
    results.tests.push({ name: 'Detecção campo obrigatório', passed: false, error: e.message });
  }

  // Teste 3: Validação de limites numéricos
  results.total++;
  try {
    const outOfRangeData = {
      nome: 'Teste',
      latitude: 200, // Fora do range
      longitude: -47.876,
      categoria: 'cachoeira'
    };

    const result = ValidationService.validateWithSchema('Waypoint', outOfRangeData);
    if (!result.valid && result.errors.some(e => e.includes('latitude'))) {
      results.passed++;
      Logger.log('✅ Teste 3: Validação de limites numéricos - PASSOU');
    } else {
      results.failed++;
      Logger.log('❌ Teste 3: FALHOU - Deveria ter detectado latitude inválida');
    }
    results.tests.push({ name: 'Validação limites numéricos', passed: !result.valid });
  } catch (e) {
    results.failed++;
    Logger.log('❌ Teste 3: ERRO - ' + e.message);
    results.tests.push({ name: 'Validação limites numéricos', passed: false, error: e.message });
  }

  // Teste 4: Validação de enum
  results.total++;
  try {
    const invalidEnumData = {
      nome: 'Teste',
      latitude: -15.234,
      longitude: -47.876,
      categoria: 'categoria_invalida'
    };

    const result = ValidationService.validateWithSchema('Waypoint', invalidEnumData);
    if (!result.valid && result.errors.some(e => e.includes('categoria'))) {
      results.passed++;
      Logger.log('✅ Teste 4: Validação de enum - PASSOU');
    } else {
      results.failed++;
      Logger.log('❌ Teste 4: FALHOU - Deveria ter detectado categoria inválida');
    }
    results.tests.push({ name: 'Validação enum', passed: !result.valid });
  } catch (e) {
    results.failed++;
    Logger.log('❌ Teste 4: ERRO - ' + e.message);
    results.tests.push({ name: 'Validação enum', passed: false, error: e.message });
  }

  // Teste 5: Score de complexidade
  results.total++;
  try {
    const complexity = semanticMapper.getComplexityScore('Waypoint');
    if (complexity > 0) {
      results.passed++;
      Logger.log(`✅ Teste 5: Score de complexidade (${complexity}) - PASSOU`);
    } else {
      results.failed++;
      Logger.log('❌ Teste 5: FALHOU - Score deveria ser > 0');
    }
    results.tests.push({ name: 'Score de complexidade', passed: complexity > 0 });
  } catch (e) {
    results.failed++;
    Logger.log('❌ Teste 5: ERRO - ' + e.message);
    results.tests.push({ name: 'Score de complexidade', passed: false, error: e.message });
  }

  // Relatório final
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('📊 RESUMO DOS TESTES');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log(`Total: ${results.total}`);
  Logger.log(`✅ Passou: ${results.passed} (${(results.passed/results.total*100).toFixed(1)}%)`);
  Logger.log(`❌ Falhou: ${results.failed} (${(results.failed/results.total*100).toFixed(1)}%)`);
  Logger.log('═══════════════════════════════════════════════════════════\n');

  return results;
}
