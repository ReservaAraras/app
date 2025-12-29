/**
 * Teste rápido para verificar se as funções estão disponíveis
 */
function testFunctionAvailability() {
    Logger.log('TESTE DE DISPONIBILIDADE DE FUNÇÕES');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const functionsToTest = [
    'deleteParticipanteTerapia',
    'readProducoesByParcela',
    'createParticipanteTerapia',
    'readProducaoById',
    'readAllParcelas',
    'createBiodiversidade',
    'readBiodiversidadeById'
  ];
  
  let available = 0;
  let missing = 0;
  
  functionsToTest.forEach(funcName => {
    try {
      const func = globalThis[funcName];
      if (typeof func === 'function') {
        Logger.log(`✅ ${funcName} - DISPONÍVEL`);
        available++;
      } else {
        Logger.log(`❌ ${funcName} - NÃO É FUNÇÃO`);
        missing++;
      }
    } catch (error) {
      Logger.log(`❌ ${funcName} - NÃO ENCONTRADA: ${error.message}`);
      missing++;
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log(`✅ Disponíveis: ${available}`);
  Logger.log(`❌ Faltando: ${missing}`);
  Logger.log(`📊 Total: ${functionsToTest.length}`);
    
  return {
    success: true,
    available: available,
    missing: missing,
    total: functionsToTest.length
  };
}

/**
 * Teste funcional - tenta executar as funções
 */
function testFunctionsExecution() {
    Logger.log('TESTE DE EXECUÇÃO DE FUNÇÕES');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Teste 1: readProducoesByParcela
  Logger.log('1️⃣ Testando readProducoesByParcela...');
  try {
    const result = readProducoesByParcela('test_id');
    Logger.log(`   ✅ Função executou: ${JSON.stringify(result)}`);
  } catch (error) {
    Logger.log(`   ❌ Erro: ${error.message}`);
  }
  
  // Teste 2: createParticipanteTerapia
  Logger.log('\n2️⃣ Testando createParticipanteTerapia...');
  try {
    const result = createParticipanteTerapia({
      nome: 'Test',
      data_inicio: new Date()
    });
    Logger.log(`   ✅ Função executou: ${JSON.stringify(result)}`);
    
    // Se criou, tenta deletar
    if (result.success && result.id) {
      Logger.log('\n3️⃣ Testando deleteParticipanteTerapia...');
      const deleteResult = deleteParticipanteTerapia(result.id);
      Logger.log(`   ✅ Função executou: ${JSON.stringify(deleteResult)}`);
    }
  } catch (error) {
    Logger.log(`   ❌ Erro: ${error.message}`);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE CONCLUÍDO');
    
  return { success: true };
}
