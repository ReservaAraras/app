/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES - NORMALIZED INDEX SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 */

function runAllNormalizedIndexTests() {
    Logger.log('INICIANDO TESTES - NormalizedIndexService');
    
  const tests = [
    testMeanCalculation,
    testStdDevCalculation,
    testOutlierRemoval,
    testNormalization,
    testClassification,
    testWaterQualityIndex,
    testBiodiversityIndex,
    testCarbonSequestration,
    testSoilFertility,
    testClimateRisk,
    testAggregateIndices
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      test();
      passed++;
      Logger.log(`✅ ${test.name} - PASSOU`);
    } catch (error) {
      failed++;
      Logger.log(`❌ ${test.name} - FALHOU: ${error.message}`);
    }
  });
  
    Logger.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
    
  return { passed, failed, total: tests.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES ESTATÍSTICOS BÁSICOS
// ═══════════════════════════════════════════════════════════════════════════

function testMeanCalculation() {
  const data = [1, 2, 3, 4, 5];
  const result = NormalizedIndexService.mean(data);
  assertEqual(result, 3, 'Média deve ser 3');
  
  // Teste com valores inválidos
  const dataWithNull = [1, 2, null, 4, 5];
  const result2 = NormalizedIndexService.mean(dataWithNull);
  assertEqual(result2, 3, 'Média deve ignorar null');
  
  // Teste com array vazio
  const result3 = NormalizedIndexService.mean([]);
  assertEqual(result3, null, 'Array vazio deve retornar null');
}

function testStdDevCalculation() {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];
  const result = NormalizedIndexService.stdDev(data);
  assertApproxEqual(result, 2.138, 0.01, 'Desvio padrão incorreto');
  
  // Teste com menos de 2 valores
  const result2 = NormalizedIndexService.stdDev([5]);
  assertEqual(result2, null, 'Menos de 2 valores deve retornar null');
}

function testOutlierRemoval() {
  const data = [10, 12, 11, 13, 100, 12, 11]; // 100 é outlier
  const cleaned = NormalizedIndexService.removeOutliers(data);
  
  assertTrue(cleaned.length < data.length, 'Deve remover outliers');
  assertFalse(cleaned.includes(100), 'Outlier 100 deve ser removido');
}

function testNormalization() {
  // Teste básico
  const result1 = NormalizedIndexService.normalize(50, 0, 100);
  assertEqual(result1, 50, 'Normalização 50 de 0-100 deve ser 50');
  
  // Teste invertido
  const result2 = NormalizedIndexService.normalize(50, 0, 100, true);
  assertEqual(result2, 50, 'Normalização invertida de 50 deve ser 50');
  
  // Teste limites
  const result3 = NormalizedIndexService.normalize(150, 0, 100);
  assertEqual(result3, 100, 'Valor acima do máximo deve ser limitado a 100');
  
  const result4 = NormalizedIndexService.normalize(-10, 0, 100);
  assertEqual(result4, 0, 'Valor abaixo do mínimo deve ser limitado a 0');
}

function testClassification() {
  const excellent = NormalizedIndexService.classify(90);
  assertEqual(excellent.label, 'Excelente', 'Score 90 deve ser Excelente');
  
  const good = NormalizedIndexService.classify(70);
  assertEqual(good.label, 'Bom', 'Score 70 deve ser Bom');
  
  const moderate = NormalizedIndexService.classify(50);
  assertEqual(moderate.label, 'Moderado', 'Score 50 deve ser Moderado');
  
  const poor = NormalizedIndexService.classify(30);
  assertEqual(poor.label, 'Ruim', 'Score 30 deve ser Ruim');
  
  const critical = NormalizedIndexService.classify(10);
  assertEqual(critical.label, 'Crítico', 'Score 10 deve ser Crítico');
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE ÍNDICES ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════════════════

function testWaterQualityIndex() {
  const params = {
    pH: 7.0,
    dissolvedOxygen: 8.5,
    BOD: 2,
    temperature: 22,
    totalPhosphorus: 0.05,
    totalNitrogen: 1.5,
    turbidity: 5,
    totalSolids: 100,
    fecalColiforms: 50
  };
  
  const result = NormalizedIndexService.normalizeWaterQuality(params);
  
  assertTrue(result.normalized >= 0 && result.normalized <= 100, 'IQA deve estar entre 0-100');
  assertTrue(result.normalized > 70, 'Água de boa qualidade deve ter IQA > 70');
  assertEqual(result.method, 'NSF-WQI', 'Método deve ser NSF-WQI');
  assertTrue(Array.isArray(result.details), 'Deve ter detalhes dos parâmetros');
}

function testBiodiversityIndex() {
  const species = [
    { name: 'Espécie A', count: 50 },
    { name: 'Espécie B', count: 30 },
    { name: 'Espécie C', count: 20 },
    { name: 'Espécie D', count: 15 },
    { name: 'Espécie E', count: 10 }
  ];
  
  const result = NormalizedIndexService.normalizeBiodiversity(species);
  
  assertTrue(result.normalized >= 0 && result.normalized <= 100, 'Índice deve estar entre 0-100');
  assertEqual(result.speciesCount, 5, 'Deve contar 5 espécies');
  assertEqual(result.totalIndividuals, 125, 'Total de indivíduos deve ser 125');
  assertTrue(result.components.shannon.normalized > 0, 'Shannon deve ser > 0');
  assertTrue(result.components.simpson.normalized > 0, 'Simpson deve ser > 0');
  
  // Teste com baixa diversidade (1 espécie dominante)
  const lowDiversity = [
    { name: 'Dominante', count: 95 },
    { name: 'Rara', count: 5 }
  ];
  
  const result2 = NormalizedIndexService.normalizeBiodiversity(lowDiversity);
  assertTrue(result2.normalized < result.normalized, 'Baixa diversidade deve ter score menor');
}

function testCarbonSequestration() {
  const params = {
    biomassCarbon: 15, // tCO2e
    soilCarbon: 10,    // tCO2e
    area: 1            // ha
  };
  
  const result = NormalizedIndexService.normalizeCarbonSequestration(params);
  
  assertEqual(result.raw, 25, 'Total deve ser 25 tCO2e/ha');
  assertTrue(result.normalized >= 0 && result.normalized <= 100, 'Score deve estar entre 0-100');
  assertEqual(result.components.biomass, 15, 'Biomassa deve ser 15');
  assertEqual(result.components.soil, 10, 'Solo deve ser 10');
  assertEqual(result.unit, 'tCO2e/ha', 'Unidade deve ser tCO2e/ha');
}

function testSoilFertility() {
  const params = {
    pH: 6.5,
    organicMatter: 4.5,
    nitrogen: 90,
    phosphorus: 45,
    potassium: 140,
    cec: 14
  };
  
  const result = NormalizedIndexService.normalizeSoilFertility(params);
  
  assertTrue(result.normalized >= 0 && result.normalized <= 100, 'Fertilidade deve estar entre 0-100');
  assertTrue(result.normalized > 70, 'Solo fértil deve ter score > 70');
  assertTrue(Array.isArray(result.details), 'Deve ter detalhes dos parâmetros');
  
  // Teste com solo pobre
  const poorSoil = {
    pH: 4.5,
    organicMatter: 1.0,
    nitrogen: 20,
    phosphorus: 5,
    potassium: 30,
    cec: 3
  };
  
  const result2 = NormalizedIndexService.normalizeSoilFertility(poorSoil);
  assertTrue(result2.normalized < result.normalized, 'Solo pobre deve ter score menor');
}

function testClimateRisk() {
  const params = {
    droughtRisk: 30,
    floodRisk: 20,
    heatwaveRisk: 15,
    frostRisk: 10,
    stormRisk: 25
  };
  
  const result = NormalizedIndexService.normalizeClimateRisk(params);
  
  assertTrue(result.normalized >= 0 && result.normalized <= 100, 'Score deve estar entre 0-100');
  assertTrue(result.normalized > 50, 'Risco moderado deve ter score > 50');
  assertTrue(Array.isArray(result.risks), 'Deve ter detalhes dos riscos');
  
  // Alto risco deve resultar em baixo score
  const highRisk = {
    droughtRisk: 90,
    floodRisk: 85,
    heatwaveRisk: 80,
    frostRisk: 70,
    stormRisk: 75
  };
  
  const result2 = NormalizedIndexService.normalizeClimateRisk(highRisk);
  assertTrue(result2.normalized < 30, 'Alto risco deve ter score < 30');
}

function testAggregateIndices() {
  const indices = [
    { normalized: 80 },
    { normalized: 70 },
    { normalized: 90 }
  ];
  
  // Teste média simples
  const result1 = NormalizedIndexService.aggregateIndices(indices);
  assertEqual(result1.normalized, 80, 'Média simples deve ser 80');
  
  // Teste média ponderada
  const weights = [0.5, 0.3, 0.2];
  const result2 = NormalizedIndexService.aggregateIndices(indices, weights);
  const expected = (80 * 0.5 + 70 * 0.3 + 90 * 0.2);
  assertEqual(result2.normalized, expected, 'Média ponderada incorreta');
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} - Esperado: ${expected}, Obtido: ${actual}`);
  }
}

function assertApproxEqual(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} - Esperado: ~${expected}, Obtido: ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES DE INTEGRAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

function testIntegrationScenario() {
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('TESTE DE INTEGRAÇÃO - Cenário Completo');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Simular dados de uma propriedade
  const waterQuality = NormalizedIndexService.normalizeWaterQuality({
    pH: 7.2,
    dissolvedOxygen: 8.0,
    BOD: 3,
    temperature: 24,
    totalPhosphorus: 0.08,
    totalNitrogen: 2.0,
    turbidity: 8,
    totalSolids: 150,
    fecalColiforms: 100
  });
  
  const biodiversity = NormalizedIndexService.normalizeBiodiversity([
    { name: 'Ipê', count: 45 },
    { name: 'Jatobá', count: 38 },
    { name: 'Cedro', count: 32 },
    { name: 'Pau-brasil', count: 25 },
    { name: 'Aroeira', count: 20 }
  ]);
  
  const carbon = NormalizedIndexService.normalizeCarbonSequestration({
    biomassCarbon: 18,
    soilCarbon: 12,
    area: 1
  });
  
  const soil = NormalizedIndexService.normalizeSoilFertility({
    pH: 6.8,
    organicMatter: 5.2,
    nitrogen: 95,
    phosphorus: 48,
    potassium: 145,
    cec: 15
  });
  
  const climate = NormalizedIndexService.normalizeClimateRisk({
    droughtRisk: 25,
    floodRisk: 15,
    heatwaveRisk: 20,
    frostRisk: 10,
    stormRisk: 18
  });
  
  // Agregar todos os índices
  const aggregate = NormalizedIndexService.aggregateIndices(
    [waterQuality, biodiversity, carbon, soil, climate],
    [0.20, 0.25, 0.25, 0.20, 0.10]
  );
  
  Logger.log('Resultados:');
  Logger.log(`  Qualidade da Água: ${waterQuality.normalized.toFixed(1)} - ${waterQuality.classification}`);
  Logger.log(`  Biodiversidade: ${biodiversity.normalized.toFixed(1)} - ${biodiversity.classification}`);
  Logger.log(`  Sequestro de Carbono: ${carbon.normalized.toFixed(1)} - ${carbon.classification}`);
  Logger.log(`  Fertilidade do Solo: ${soil.normalized.toFixed(1)} - ${soil.classification}`);
  Logger.log(`  Resiliência Climática: ${climate.normalized.toFixed(1)} - ${climate.classification}`);
  Logger.log(`\n  ÍNDICE AGREGADO: ${aggregate.normalized.toFixed(1)} - ${aggregate.classification}`);
  
  return aggregate;
}
