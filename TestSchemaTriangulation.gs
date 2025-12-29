/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES DE TRIANGULAÇÃO - Backend ↔ Frontend ↔ Planilhas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Suite de testes para validar a integração completa das 3 intervenções:
 * 1/3 - SchemaRegistry (Backend)
 * 2/3 - DynamicFormBuilder (Frontend)
 * 3/3 - SchemaAdminDashboard (Administração)
 * 
 * @version 1.0.0
 * @date 2025-12-27
 */

/**
 * Executa todos os testes de triangulação
 */
function runAllTriangulationTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTES DE TRIANGULAÇÃO - SchemaRegistry');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Teste 1: Verificar schemas disponíveis
  runTest(results, 'Listar Schemas', () => {
    const result = apiListSchemas();
    if (!result.success) throw new Error('Falha ao listar schemas');
    if (result.schemas.length < 5) throw new Error('Menos de 5 schemas encontrados');
    return `${result.schemas.length} schemas disponíveis`;
  });
  
  // Teste 2: Obter schema específico
  runTest(results, 'Obter Schema QUALIDADE_AGUA', () => {
    const result = apiGetSchema('QUALIDADE_AGUA');
    if (!result.success) throw new Error(result.error);
    if (!result.schema.fields.pH) throw new Error('Campo pH não encontrado');
    return `Schema com ${Object.keys(result.schema.fields).length} campos`;
  });
  
  // Teste 3: Validação de dados
  runTest(results, 'Validar Dados Corretos', () => {
    const data = {
      data: new Date(),
      local: 'Nascente Principal',
      latitude: -15.5,
      longitude: -47.5,
      pH: 7.2,
      oxigenio_dissolvido: 7.5,
      turbidez: 15,
      temperatura: 24,
      responsavel: 'Técnico Ambiental'
    };
    const result = apiValidateData('QUALIDADE_AGUA', data);
    if (!result.valid) throw new Error(result.errors.join(', '));
    return 'Dados válidos';
  });
  
  // Teste 4: Validação de dados inválidos
  runTest(results, 'Rejeitar Dados Inválidos', () => {
    const data = {
      pH: 15, // Inválido: max é 14
      oxigenio_dissolvido: -5 // Inválido: min é 0
    };
    const result = apiValidateData('QUALIDADE_AGUA', data);
    if (result.valid) throw new Error('Deveria ter rejeitado dados inválidos');
    return `${result.errors.length} erros detectados`;
  });
  
  // Teste 5: Geração de dados sintéticos
  runTest(results, 'Gerar Dados Sintéticos', () => {
    const result = apiGenerateSyntheticData('QUALIDADE_AGUA', 5);
    if (!result.success) throw new Error(result.error);
    if (result.records.length !== 5) throw new Error('Quantidade incorreta');
    
    // Verifica se valores estão dentro dos limites
    const record = result.records[0];
    if (record.pH < 0 || record.pH > 14) throw new Error('pH fora dos limites');
    
    return `${result.count} registros gerados`;
  });
  
  // Teste 6: Metadados para formulário
  runTest(results, 'Obter Metadados de Formulário', () => {
    const result = apiGetFormMetadata('QUALIDADE_AGUA');
    if (!result.success) throw new Error(result.error);
    if (!result.displayName) throw new Error('displayName não encontrado');
    if (!result.fields || result.fields.length === 0) throw new Error('Campos não encontrados');
    
    // Verifica se campos sensíveis foram removidos
    const senhaField = result.fields.find(f => f.name === 'senha');
    if (senhaField) throw new Error('Campo sensível não deveria aparecer');
    
    return `${result.fields.length} campos para formulário`;
  });
  
  // Teste 7: Sincronização de planilha
  runTest(results, 'Sincronizar Planilha com Schema', () => {
    const result = apiSyncSheetWithSchema('QUALIDADE_AGUA');
    if (!result.success) throw new Error(result.error);
    return result.message;
  });
  
  // Teste 8: Diagnóstico completo
  runTest(results, 'Executar Diagnóstico', () => {
    const result = apiRunSchemaDiagnostic();
    if (!result.success) throw new Error('Falha no diagnóstico');
    return `${result.syncedCount}/${result.totalSchemas} sincronizados, ${result.totalRecords} registros`;
  });
  
  // Teste 9: Comparar planilha com schema
  runTest(results, 'Comparar Estrutura', () => {
    const result = apiCompareSheetWithSchema('QUALIDADE_AGUA');
    if (!result.success) throw new Error(result.error);
    return result.isSync ? 'Estrutura sincronizada' : `${result.differences.length} diferenças`;
  });
  
  // Teste 10: Exportar schema como JSON
  runTest(results, 'Exportar Schema JSON', () => {
    const result = apiExportSchemaAsJSON('QUALIDADE_AGUA');
    if (!result.success) throw new Error(result.error);
    if (!result.json) throw new Error('JSON não gerado');
    return `JSON com ${result.json.length} caracteres`;
  });
  
  // Teste 11: Inicializar todos os schemas
  runTest(results, 'Inicializar Todos os Schemas', () => {
    const result = apiInitializeAllSchemas();
    if (!result.success) throw new Error('Falha na inicialização');
    return `${result.initialized} schemas inicializados`;
  });
  
  // Teste 12: Verificar existência de planilha
  runTest(results, 'Verificar Existência de Planilha', () => {
    const result = apiCheckSheetExists('QUALIDADE_AGUA');
    if (!result.exists) throw new Error('Planilha deveria existir após inicialização');
    return `Planilha existe com ${result.rows} registros`;
  });
  
  // Resumo
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(`RESULTADO: ${results.passed} passou, ${results.failed} falhou`);
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return results;
}

/**
 * Executa um teste individual
 */
function runTest(results, name, testFn) {
  try {
    const message = testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED', message });
    Logger.log(`✓ ${name}: ${message}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.toString() });
    Logger.log(`✗ ${name}: ${error.toString()}`);
  }
}

/**
 * Teste de integração: Criar registro via schema e verificar na planilha
 */
function testCreateWithSchemaIntegration() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE DE INTEGRAÇÃO: Criar Registro via Schema');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // 1. Gera dados sintéticos
  const syntheticResult = apiGenerateSyntheticData('QUALIDADE_AGUA', 1);
  if (!syntheticResult.success) {
    Logger.log('✗ Falha ao gerar dados sintéticos: ' + syntheticResult.error);
    return false;
  }
  
  const testData = syntheticResult.records[0];
  testData.local = 'TESTE_INTEGRACAO_' + new Date().getTime();
  testData.responsavel = 'Sistema de Testes';
  
  Logger.log('Dados gerados: ' + JSON.stringify(testData).substring(0, 200) + '...');
  
  // 2. Cria registro via schema
  const createResult = apiCreateWithSchema('QUALIDADE_AGUA', testData);
  if (!createResult.success) {
    Logger.log('✗ Falha ao criar registro: ' + (createResult.errors || createResult.error));
    return false;
  }
  
  Logger.log('✓ Registro criado com ID: ' + createResult.id);
  
  // 3. Verifica se registro existe na planilha
  const readResult = apiRead('QualidadeAgua', { filter: { local: testData.local } });
  if (!readResult.success || readResult.data.length === 0) {
    Logger.log('✗ Registro não encontrado na planilha');
    return false;
  }
  
  Logger.log('✓ Registro encontrado na planilha');
  
  // 4. Limpa registro de teste
  const deleteResult = apiDelete('QualidadeAgua', createResult.id);
  if (deleteResult.success) {
    Logger.log('✓ Registro de teste removido');
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE DE INTEGRAÇÃO: SUCESSO');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return true;
}

/**
 * Teste de performance: Geração de dados sintéticos em lote
 */
function testSyntheticDataPerformance() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE DE PERFORMANCE: Geração de Dados Sintéticos');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  const schemas = ['QUALIDADE_AGUA', 'QUALIDADE_SOLO', 'BIODIVERSIDADE', 'DADOS_CLIMA', 'CARBONO'];
  const counts = [10, 50, 100];
  
  for (const schemaName of schemas) {
    for (const count of counts) {
      const start = new Date().getTime();
      const result = apiGenerateSyntheticData(schemaName, count);
      const elapsed = new Date().getTime() - start;
      
      if (result.success) {
        Logger.log(`${schemaName} x${count}: ${elapsed}ms (${Math.round(count/elapsed*1000)} rec/s)`);
      } else {
        Logger.log(`${schemaName} x${count}: ERRO - ${result.error}`);
      }
    }
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Teste de referências científicas
 */
function testScientificReferences() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE: Referências Científicas nos Schemas');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  const schemasWithRefs = {
    'QUALIDADE_AGUA': ['CONAMA 357/2005'],
    'QUALIDADE_SOLO': ['EMBRAPA', 'IAC'],
    'CARBONO': ['IPCC'],
    'SESSOES_TERAPIA': ['OMS', 'Bratman']
  };
  
  for (const [schemaName, expectedRefs] of Object.entries(schemasWithRefs)) {
    const result = apiGetFormMetadata(schemaName);
    if (!result.success) {
      Logger.log(`✗ ${schemaName}: Erro ao obter metadados`);
      continue;
    }
    
    const fieldsWithRefs = result.fields.filter(f => f.reference);
    const foundRefs = fieldsWithRefs.map(f => f.reference).join(' ');
    
    const missingRefs = expectedRefs.filter(ref => !foundRefs.includes(ref));
    
    if (missingRefs.length === 0) {
      Logger.log(`✓ ${schemaName}: ${fieldsWithRefs.length} campos com referências científicas`);
    } else {
      Logger.log(`⚠ ${schemaName}: Referências faltando: ${missingRefs.join(', ')}`);
    }
  }
  
  Logger.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Menu de testes
 */
function showTestMenu() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Testes de Triangulação',
    'Escolha o teste a executar:\n\n' +
    '1. Executar todos os testes\n' +
    '2. Teste de integração\n' +
    '3. Teste de performance\n' +
    '4. Teste de referências científicas',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result === ui.Button.OK) {
    runAllTriangulationTests();
  }
}
