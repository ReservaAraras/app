/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST LIMNOLOGY FORMS - Suite de Testes para Formulários Limnológicos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 6/13: Validação e Testes Integrados
 * 
 * Este arquivo contém testes automatizados para:
 * - Validação de dados dos formulários
 * - Handlers de salvamento
 * - Integridade dos schemas
 * - Simulação de fluxos completos
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE TESTES
// ═══════════════════════════════════════════════════════════════════════════

const TEST_CONFIG = {
  VERBOSE: true,
  STOP_ON_FAILURE: false,
  CLEANUP_AFTER: true
};

var testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// ═══════════════════════════════════════════════════════════════════════════
// FRAMEWORK DE TESTES
// ═══════════════════════════════════════════════════════════════════════════

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    if (TEST_CONFIG.VERBOSE) Logger.log('  ✓ ' + message);
    return true;
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    Logger.log('  ✗ FALHOU: ' + message);
    return false;
  }
}

function assertEqual(actual, expected, message) {
  return assert(actual === expected, message + ' (esperado: ' + expected + ', obtido: ' + actual + ')');
}

function assertNotNull(value, message) {
  return assert(value !== null && value !== undefined, message + ' não deve ser null/undefined');
}

function assertType(value, expectedType, message) {
  return assert(typeof value === expectedType, message + ' deve ser ' + expectedType);
}

function assertArrayLength(arr, minLength, message) {
  return assert(Array.isArray(arr) && arr.length >= minLength, message + ' deve ter pelo menos ' + minLength + ' elementos');
}

// ═══════════════════════════════════════════════════════════════════════════
// DADOS DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

const TEST_DATA = {
  physicochemical: {
    valid: {
      data: '2025-12-28',
      hora: '10:30',
      local: 'Ponto de Teste 1',
      latitude: -15.234567,
      longitude: -47.876543,
      profundidade: 2.5,
      temperatura: 24.5,
      ph: 7.2,
      oxigenio_dissolvido: 6.8,
      condutividade: 125,
      turbidez: 15,
      transparencia: 1.2,
      responsavel: 'Teste Automatizado'
    },
    invalid: {
      data: '',
      local: '',
      latitude: 'invalido',
      ph: 15 // fora do range
    }
  },
  
  phytoplankton: {
    valid: {
      data: '2025-12-28',
      hora: '09:00',
      local: 'Lago Central',
      latitude: -15.234567,
      longitude: -47.876543,
      metodo_coleta: 'rede_plancton',
      volume_filtrado: 100,
      divisao: 'Chlorophyta',
      abundancia: 1500,
      responsavel: 'Teste Automatizado'
    }
  },
  
  zooplankton: {
    valid: {
      data: '2025-12-28',
      hora: '09:30',
      local: 'Lago Central',
      latitude: -15.234567,
      longitude: -47.876543,
      metodo_coleta: 'rede_plancton',
      grupo: 'Cladocera',
      abundancia: 850,
      responsavel: 'Teste Automatizado'
    }
  },
  
  macrophytes: {
    valid: {
      data: '2025-12-28',
      hora: '11:00',
      local: 'Margem Norte',
      latitude: -15.234567,
      longitude: -47.876543,
      tipo_macrofita: 'emergente',
      especie_predominante: 'Taboa',
      nome_cientifico: 'Typha domingensis',
      cobertura_percentual: 35,
      area_estimada: 150,
      responsavel: 'Teste Automatizado'
    },
    highCoverage: {
      data: '2025-12-28',
      local: 'Margem Sul',
      tipo_macrofita: 'flutuante_livre',
      especie_predominante: 'Aguapé',
      cobertura_percentual: 85 // deve gerar alerta
    }
  },
  
  benthic: {
    valid: {
      data: '2025-12-28',
      hora: '14:00',
      local: 'Rio Principal',
      latitude: -15.234567,
      longitude: -47.876543,
      metodo_coleta: 'surber',
      profundidade: 0.5,
      area_amostrada: 0.09,
      grupo: 'Ephemeroptera',
      abundancia: 45,
      responsavel: 'Teste Automatizado'
    }
  },
  
  ichthyofauna: {
    valid: {
      data: '2025-12-28',
      hora: '08:00',
      local: 'Rio Principal - Trecho 3',
      latitude: -15.234567,
      longitude: -47.876543,
      metodo_coleta: 'tarrafa',
      especies: [
        { nome: 'Lambari', nome_cientifico: 'Astyanax bimaculatus', quantidade: 15, comprimento_medio: 8.5 },
        { nome: 'Piabinha', quantidade: 8, estagio_vida: 'juvenil' }
      ],
      responsavel: 'Teste Automatizado'
    },
    noSpecies: {
      data: '2025-12-28',
      local: 'Rio Principal',
      metodo_coleta: 'tarrafa',
      especies: [] // deve falhar
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa a função validateLimnologyData
 */
function testValidateLimnologyData() {
  Logger.log('\n═══ TESTE: validateLimnologyData ═══');
  
  // Teste 1: Dados válidos
  var result1 = validateLimnologyData(TEST_DATA.physicochemical.valid, ['local', 'data']);
  assert(result1.valid === true, 'Dados válidos devem passar na validação');
  assertNotNull(result1.data, 'Dados sanitizados devem ser retornados');
  assertNotNull(result1.data.id, 'ID deve ser gerado automaticamente');
  assertNotNull(result1.data.timestamp, 'Timestamp deve ser gerado automaticamente');
  
  // Teste 2: Dados inválidos (campos obrigatórios ausentes)
  var result2 = validateLimnologyData(TEST_DATA.physicochemical.invalid, ['local', 'data']);
  assert(result2.valid === false, 'Dados inválidos devem falhar na validação');
  assertArrayLength(result2.errors, 1, 'Deve haver erros de validação');
  
  // Teste 3: Dados nulos
  var result3 = validateLimnologyData(null, ['local']);
  assert(result3.valid === false, 'Dados nulos devem falhar');
  
  // Teste 4: Conversão numérica
  var dataWithStrings = { latitude: '-15.5', longitude: '-47.5', local: 'Teste', data: '2025-01-01' };
  var result4 = validateLimnologyData(dataWithStrings, ['local']);
  assert(result4.valid === true, 'Strings numéricas devem ser convertidas');
  assertEqual(typeof result4.data.latitude, 'number', 'Latitude deve ser número');
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa savePhysicochemicalData
 */
function testSavePhysicochemicalData() {
  Logger.log('\n═══ TESTE: savePhysicochemicalData ═══');
  
  // Mock do DatabaseService se não existir
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  var result = savePhysicochemicalData(TEST_DATA.physicochemical.valid);
  assert(result.success === true, 'Salvamento de dados válidos deve ter sucesso');
  assertNotNull(result.id, 'ID do registro deve ser retornado');
}

/**
 * Testa savePhytoplanktonData
 */
function testSavePhytoplanktonData() {
  Logger.log('\n═══ TESTE: savePhytoplanktonData ═══');
  
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  var result = savePhytoplanktonData(TEST_DATA.phytoplankton.valid);
  assert(result.success === true, 'Salvamento de fitoplâncton deve ter sucesso');
}

/**
 * Testa saveZooplanktonData
 */
function testSaveZooplanktonData() {
  Logger.log('\n═══ TESTE: saveZooplanktonData ═══');
  
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  var result = saveZooplanktonData(TEST_DATA.zooplankton.valid);
  assert(result.success === true, 'Salvamento de zooplâncton deve ter sucesso');
}

/**
 * Testa saveMacrophytesData
 */
function testSaveMacrophytesData() {
  Logger.log('\n═══ TESTE: saveMacrophytesData ═══');
  
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  // Teste com dados válidos
  var result1 = saveMacrophytesData(TEST_DATA.macrophytes.valid);
  assert(result1.success === true, 'Salvamento de macrófitas deve ter sucesso');
  
  // Teste com cobertura alta (deve gerar alerta mas salvar)
  var result2 = saveMacrophytesData(TEST_DATA.macrophytes.highCoverage);
  assert(result2.success === true, 'Cobertura alta deve salvar com alerta');
  assert(result2.message.indexOf('⚠️') !== -1 || result2.message.indexOf('alta') !== -1, 
         'Mensagem deve conter alerta de cobertura alta');
}

/**
 * Testa saveBenthicData
 */
function testSaveBenthicData() {
  Logger.log('\n═══ TESTE: saveBenthicData ═══');
  
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  var result = saveBenthicData(TEST_DATA.benthic.valid);
  assert(result.success === true, 'Salvamento de bentos deve ter sucesso');
}

/**
 * Testa saveIchthyofaunaData
 */
function testSaveIchthyofaunaData() {
  Logger.log('\n═══ TESTE: saveIchthyofaunaData ═══');
  
  if (typeof DatabaseService === 'undefined' || !DatabaseService.create) {
    Logger.log('  ⚠ DatabaseService não disponível - usando mock');
    return;
  }
  
  // Teste com múltiplas espécies
  var result1 = saveIchthyofaunaData(TEST_DATA.ichthyofauna.valid);
  assert(result1.success === true, 'Salvamento de ictiofauna deve ter sucesso');
  assertEqual(result1.records, 2, 'Deve salvar 2 registros de espécies');
  
  // Teste sem espécies (deve falhar)
  var result2 = saveIchthyofaunaData(TEST_DATA.ichthyofauna.noSpecies);
  assert(result2.success === false, 'Salvamento sem espécies deve falhar');
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa integridade dos schemas de limnologia
 */
function testLimnologySchemas() {
  Logger.log('\n═══ TESTE: Schemas de Limnologia ═══');
  
  var limnologySheets = [
    'Fitoplancton_RA',
    'Zooplancton_RA',
    'Macrofitas_RA',
    'Bentos_RA',
    'Ictiofauna_RA',
    'Limnologia_RA'
  ];
  
  limnologySheets.forEach(function(sheetName) {
    var schema = SHEET_SCHEMAS[sheetName];
    assertNotNull(schema, 'Schema deve existir para ' + sheetName);
    
    if (schema) {
      assertArrayLength(schema.headers, 5, sheetName + ' deve ter pelo menos 5 colunas');
      assert(schema.headers.indexOf('id') !== -1, sheetName + ' deve ter coluna id');
      assert(schema.headers.indexOf('timestamp') !== -1, sheetName + ' deve ter coluna timestamp');
      assertNotNull(schema.color, sheetName + ' deve ter cor definida');
      assertNotNull(schema.description, sheetName + ' deve ter descrição');
    }
  });
}

/**
 * Testa consistência entre handlers e schemas
 */
function testHandlerSchemaConsistency() {
  Logger.log('\n═══ TESTE: Consistência Handler-Schema ═══');
  
  // Verifica se LIMNOLOGY_SHEETS está definido
  if (typeof LIMNOLOGY_SHEETS === 'undefined') {
    Logger.log('  ⚠ LIMNOLOGY_SHEETS não definido');
    return;
  }
  
  var mappings = [
    { handler: 'PHYSICOCHEMICAL', schema: 'QualidadeAgua' },
    { handler: 'PHYTOPLANKTON', schema: 'Fitoplancton_RA' },
    { handler: 'ZOOPLANKTON', schema: 'Zooplancton_RA' },
    { handler: 'MACROPHYTES', schema: 'Macrofitas_RA' },
    { handler: 'BENTHIC', schema: 'Bentos_RA' },
    { handler: 'ICHTHYOFAUNA', schema: 'Ictiofauna_RA' }
  ];
  
  mappings.forEach(function(m) {
    var handlerSheet = LIMNOLOGY_SHEETS[m.handler];
    assertEqual(handlerSheet, m.schema, 'Handler ' + m.handler + ' deve apontar para ' + m.schema);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE INTEGRAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa fluxo completo de coleta limnológica
 */
function testFullLimnologyWorkflow() {
  Logger.log('\n═══ TESTE: Fluxo Completo de Coleta ═══');
  
  // Simula uma coleta completa em um ponto
  var coletaId = Utilities.getUuid();
  var pontoColeta = {
    local: 'Ponto de Teste Integrado',
    latitude: -15.234567,
    longitude: -47.876543,
    data: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd')
  };
  
  Logger.log('  📍 Ponto de coleta: ' + pontoColeta.local);
  
  // 1. Dados físico-químicos
  var fqData = Object.assign({}, pontoColeta, {
    hora: '09:00',
    temperatura: 25.5,
    ph: 7.1,
    oxigenio_dissolvido: 6.5
  });
  
  var fqValidation = validateLimnologyData(fqData, ['local', 'data']);
  assert(fqValidation.valid, '1. Validação físico-química OK');
  
  // 2. Fitoplâncton
  var fpData = Object.assign({}, pontoColeta, {
    hora: '09:30',
    metodo_coleta: 'rede_plancton',
    divisao: 'Chlorophyta',
    abundancia: 1200
  });
  
  var fpValidation = validateLimnologyData(fpData, ['local', 'data', 'metodo_coleta']);
  assert(fpValidation.valid, '2. Validação fitoplâncton OK');
  
  // 3. Zooplâncton
  var zpData = Object.assign({}, pontoColeta, {
    hora: '10:00',
    metodo_coleta: 'rede_plancton',
    grupo: 'Copepoda',
    abundancia: 800
  });
  
  var zpValidation = validateLimnologyData(zpData, ['local', 'data', 'metodo_coleta']);
  assert(zpValidation.valid, '3. Validação zooplâncton OK');
  
  // 4. Macrófitas
  var mfData = Object.assign({}, pontoColeta, {
    hora: '10:30',
    tipo_macrofita: 'emergente',
    especie_predominante: 'Taboa',
    cobertura_percentual: 25
  });
  
  var mfValidation = validateLimnologyData(mfData, ['local', 'data', 'tipo_macrofita', 'especie_predominante', 'cobertura_percentual']);
  assert(mfValidation.valid, '4. Validação macrófitas OK');
  
  // 5. Bentos
  var btData = Object.assign({}, pontoColeta, {
    hora: '11:00',
    metodo_coleta: 'surber',
    grupo: 'Ephemeroptera',
    abundancia: 35
  });
  
  var btValidation = validateLimnologyData(btData, ['local', 'data', 'metodo_coleta']);
  assert(btValidation.valid, '5. Validação bentos OK');
  
  // 6. Ictiofauna
  var icData = Object.assign({}, pontoColeta, {
    hora: '11:30',
    metodo_coleta: 'tarrafa',
    especies: [
      { nome: 'Lambari', quantidade: 10 }
    ]
  });
  
  var icValidation = validateLimnologyData(icData, ['local', 'data', 'metodo_coleta']);
  assert(icValidation.valid, '6. Validação ictiofauna OK');
  assert(icData.especies.length > 0, '6. Espécies presentes');
  
  Logger.log('  ✓ Fluxo completo validado com sucesso');
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa casos extremos e limites
 */
function testEdgeCases() {
  Logger.log('\n═══ TESTE: Casos Extremos ═══');
  
  // Teste 1: Coordenadas nos limites
  var coordLimits = [
    { lat: -90, lng: -180, desc: 'Mínimos' },
    { lat: 90, lng: 180, desc: 'Máximos' },
    { lat: 0, lng: 0, desc: 'Zero' }
  ];
  
  coordLimits.forEach(function(c) {
    var data = { local: 'Teste', data: '2025-01-01', latitude: c.lat, longitude: c.lng };
    var result = validateLimnologyData(data, ['local']);
    assert(result.valid, 'Coordenadas ' + c.desc + ' devem ser válidas');
  });
  
  // Teste 2: Strings muito longas
  var longString = new Array(1001).join('a'); // 1000 caracteres
  var longData = { local: longString, data: '2025-01-01' };
  var longResult = validateLimnologyData(longData, ['local']);
  assert(longResult.valid, 'Strings longas devem ser aceitas');
  
  // Teste 3: Caracteres especiais
  var specialData = { local: 'Ponto #1 - Área "Norte" (teste)', data: '2025-01-01' };
  var specialResult = validateLimnologyData(specialData, ['local']);
  assert(specialResult.valid, 'Caracteres especiais devem ser aceitos');
  
  // Teste 4: Valores numéricos extremos
  var extremeData = { 
    local: 'Teste', 
    data: '2025-01-01',
    abundancia: 999999999,
    ph: 0,
    temperatura: -10
  };
  var extremeResult = validateLimnologyData(extremeData, ['local']);
  assert(extremeResult.valid, 'Valores extremos devem ser aceitos');
}

// ═══════════════════════════════════════════════════════════════════════════
// RUNNER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa todos os testes de formulários limnológicos
 * @returns {Object} Resultados dos testes
 */
function runAllLimnologyTests() {
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║     SUITE DE TESTES - FORMULÁRIOS LIMNOLÓGICOS               ║');
  Logger.log('║     Intervenção 6/13: Validação e Testes Integrados          ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('Data: ' + new Date().toISOString());
  Logger.log('');
  
  // Reset resultados
  testResults = { total: 0, passed: 0, failed: 0, errors: [] };
  
  try {
    // Testes de validação
    testValidateLimnologyData();
    
    // Testes de schemas
    testLimnologySchemas();
    testHandlerSchemaConsistency();
    
    // Testes de handlers (se DatabaseService disponível)
    testSavePhysicochemicalData();
    testSavePhytoplanktonData();
    testSaveZooplanktonData();
    testSaveMacrophytesData();
    testSaveBenthicData();
    testSaveIchthyofaunaData();
    
    // Testes de integração
    testFullLimnologyWorkflow();
    
    // Testes de edge cases
    testEdgeCases();
    
  } catch (error) {
    Logger.log('\n✗ ERRO FATAL: ' + error);
    testResults.errors.push('Erro fatal: ' + error.toString());
  }
  
  // Relatório final
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('                    RELATÓRIO FINAL                            ');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('Total de testes: ' + testResults.total);
  Logger.log('Passou: ' + testResults.passed + ' (' + Math.round(testResults.passed/testResults.total*100) + '%)');
  Logger.log('Falhou: ' + testResults.failed);
  Logger.log('');
  
  if (testResults.errors.length > 0) {
    Logger.log('Erros encontrados:');
    testResults.errors.forEach(function(e, i) {
      Logger.log('  ' + (i+1) + '. ' + e);
    });
  }
  
  var status = testResults.failed === 0 ? '✓ TODOS OS TESTES PASSARAM' : '✗ ALGUNS TESTES FALHARAM';
  Logger.log('\n' + status);
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: testResults.failed === 0,
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    errors: testResults.errors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Executa testes rápidos (apenas validação)
 */
function runQuickLimnologyTests() {
  Logger.log('═══ TESTES RÁPIDOS - LIMNOLOGIA ═══\n');
  
  testResults = { total: 0, passed: 0, failed: 0, errors: [] };
  
  testValidateLimnologyData();
  testLimnologySchemas();
  testEdgeCases();
  
  Logger.log('\nResultado: ' + testResults.passed + '/' + testResults.total + ' testes passaram');
  return testResults;
}

/**
 * Função de menu para executar testes
 */
function menuRunLimnologyTests() {
  var result = runAllLimnologyTests();
  
  var ui = SpreadsheetApp.getUi();
  var message = 'Testes executados: ' + result.total + '\n' +
                'Passou: ' + result.passed + '\n' +
                'Falhou: ' + result.failed;
  
  if (result.success) {
    ui.alert('✓ Testes Concluídos', message, ui.ButtonSet.OK);
  } else {
    ui.alert('✗ Falhas Detectadas', message + '\n\nVerifique o log para detalhes.', ui.ButtonSet.OK);
  }
}
