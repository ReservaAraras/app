/**
 * Teste de debug para identificar falhas específicas
 */

function debugTestWaypoint() {
  Logger.log('=== DEBUG WAYPOINT ===');
  const result = testFormCRUD('waypoint');
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  return result;
}

function debugTestAgua() {
  Logger.log('=== DEBUG AGUA ===');
  const result = testFormCRUD('agua');
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  return result;
}

function debugTestTerapia() {
  Logger.log('=== DEBUG TERAPIA ===');
  const result = testFormCRUD('terapia');
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  return result;
}

function debugAllFailingTests() {
  Logger.log('\n╔════════════════════════════════════════════════════╗');
  Logger.log('║  🔍 DEBUG DOS TESTES QUE FALHARAM                 ║');
  Logger.log('╚════════════════════════════════════════════════════╝\n');
  
  const tests = ['waypoint', 'agua', 'terapia'];
  const results = {};
  
  tests.forEach(test => {
    Logger.log(`\n--- Testando ${test} ---`);
    const result = testFormCRUD(test);
    results[test] = result;
    
    if (result.success) {
      Logger.log('✅ PASSOU');
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      if (result.results) {
        Logger.log('Detalhes:');
        Logger.log('  CREATE: ' + (result.results.create ? JSON.stringify(result.results.create) : 'null'));
        Logger.log('  READ: ' + (result.results.read ? JSON.stringify(result.results.read) : 'null'));
        Logger.log('  UPDATE: ' + (result.results.update ? JSON.stringify(result.results.update) : 'null'));
        Logger.log('  DELETE: ' + (result.results.delete ? JSON.stringify(result.results.delete) : 'null'));
      }
    }
  });
  
  Logger.log('\n╔════════════════════════════════════════════════════╗');
  Logger.log('║  RESUMO                                            ║');
  Logger.log('╚════════════════════════════════════════════════════╝');
  
  const passed = Object.values(results).filter(r => r.success).length;
  const failed = tests.length - passed;
  Logger.log(`✅ Passou: ${passed}/${tests.length}`);
  Logger.log(`❌ Falhou: ${failed}/${tests.length}`);
  
  return results;
}
