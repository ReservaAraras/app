/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXEMPLOS PRÁTICOS - NORMALIZED INDEX SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Dashboard Completo de Propriedade
// ═══════════════════════════════════════════════════════════════════════════

function exemploPropertyDashboard() {
    Logger.log('EXEMPLO 1: Dashboard Completo de Propriedade');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Dados simulados de uma propriedade agroflorestal
  const propertyData = {
    name: 'Fazenda Esperança',
    area: 50, // hectares
    location: 'Mata Atlântica, SP'
  };
  
  // 1. Qualidade da Água
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
  
  // 2. Biodiversidade
  const biodiversity = NormalizedIndexService.normalizeBiodiversity([
    { name: 'Ipê Amarelo', count: 45 },
    { name: 'Jatobá', count: 38 },
    { name: 'Cedro', count: 32 },
    { name: 'Pau-brasil', count: 25 },
    { name: 'Aroeira', count: 20 },
    { name: 'Jacarandá', count: 18 },
    { name: 'Peroba', count: 15 }
  ]);
  
  // 3. Sequestro de Carbono
  const carbon = NormalizedIndexService.normalizeCarbonSequestration({
    biomassCarbon: 18,
    soilCarbon: 12,
    area: propertyData.area
  });
  
  // 4. Fertilidade do Solo
  const soil = NormalizedIndexService.normalizeSoilFertility({
    pH: 6.8,
    organicMatter: 5.2,
    nitrogen: 95,
    phosphorus: 48,
    potassium: 145,
    cec: 15
  });
  
  // 5. Resiliência Climática
  const climate = NormalizedIndexService.normalizeClimateRisk({
    droughtRisk: 25,
    floodRisk: 15,
    heatwaveRisk: 20,
    frostRisk: 10,
    stormRisk: 18
  });
  
  // 6. Índice Agregado
  const overall = NormalizedIndexService.aggregateIndices(
    [waterQuality, biodiversity, carbon, soil, climate],
    [0.20, 0.25, 0.25, 0.20, 0.10]
  );
  
  // Exibir resultados
  Logger.log(`Propriedade: ${propertyData.name}`);
  Logger.log(`Localização: ${propertyData.location}`);
  Logger.log(`Área: ${propertyData.area} ha\n`);
  
  Logger.log('ÍNDICES NORMALIZADOS (0-100):');
  Logger.log('─────────────────────────────────────────────────────────\n');
  
  printIndex('Qualidade da Água', waterQuality);
  printIndex('Biodiversidade', biodiversity);
  printIndex('Sequestro de Carbono', carbon);
  printIndex('Fertilidade do Solo', soil);
  printIndex('Resiliência Climática', climate);
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  printIndex('ÍNDICE GERAL', overall);
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  return {
    property: propertyData,
    indices: { waterQuality, biodiversity, carbon, soil, climate },
    overall: overall
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Comparação Entre Propriedades
// ═══════════════════════════════════════════════════════════════════════════

function exemploCompareProperties() {
    Logger.log('EXEMPLO 2: Comparação Entre Propriedades');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Propriedade A: Sistema agroflorestal maduro
  const propertyA = calculatePropertyScore({
    name: 'Fazenda Verde',
    waterQuality: { pH: 7.0, dissolvedOxygen: 9.0, BOD: 1.5, temperature: 22, totalPhosphorus: 0.03, totalNitrogen: 1.0, turbidity: 3, totalSolids: 80, fecalColiforms: 20 },
    species: [
      { name: 'Sp1', count: 50 }, { name: 'Sp2', count: 45 }, { name: 'Sp3', count: 40 },
      { name: 'Sp4', count: 35 }, { name: 'Sp5', count: 30 }, { name: 'Sp6', count: 25 }
    ],
    carbon: { biomassCarbon: 25, soilCarbon: 18, area: 1 },
    soil: { pH: 6.5, organicMatter: 6.0, nitrogen: 110, phosphorus: 55, potassium: 160, cec: 18 }
  });
  
  // Propriedade B: Sistema em transição
  const propertyB = calculatePropertyScore({
    name: 'Fazenda Esperança',
    waterQuality: { pH: 6.8, dissolvedOxygen: 7.5, BOD: 3, temperature: 24, totalPhosphorus: 0.08, totalNitrogen: 2.5, turbidity: 10, totalSolids: 180, fecalColiforms: 150 },
    species: [
      { name: 'Sp1', count: 30 }, { name: 'Sp2', count: 25 }, { name: 'Sp3', count: 20 }
    ],
    carbon: { biomassCarbon: 12, soilCarbon: 8, area: 1 },
    soil: { pH: 6.0, organicMatter: 3.5, nitrogen: 70, phosphorus: 35, potassium: 110, cec: 10 }
  });
  
  // Propriedade C: Sistema convencional
  const propertyC = calculatePropertyScore({
    name: 'Fazenda Tradicional',
    waterQuality: { pH: 6.5, dissolvedOxygen: 6.0, BOD: 5, temperature: 26, totalPhosphorus: 0.15, totalNitrogen: 4.0, turbidity: 20, totalSolids: 300, fecalColiforms: 500 },
    species: [
      { name: 'Sp1', count: 80 }, { name: 'Sp2', count: 15 }
    ],
    carbon: { biomassCarbon: 5, soilCarbon: 3, area: 1 },
    soil: { pH: 5.5, organicMatter: 2.0, nitrogen: 40, phosphorus: 20, potassium: 80, cec: 6 }
  });
  
  // Comparar
  Logger.log('COMPARAÇÃO DE PROPRIEDADES:\n');
  Logger.log(`${propertyA.name.padEnd(25)} Score: ${propertyA.score.toFixed(1)} - ${propertyA.classification}`);
  Logger.log(`${propertyB.name.padEnd(25)} Score: ${propertyB.score.toFixed(1)} - ${propertyB.classification}`);
  Logger.log(`${propertyC.name.padEnd(25)} Score: ${propertyC.score.toFixed(1)} - ${propertyC.classification}`);
  
  Logger.log('\n═══════════════════════════════════════════════════════════\n');
  
  return [propertyA, propertyB, propertyC];
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Monitoramento Temporal
// ═══════════════════════════════════════════════════════════════════════════

function exemploTemporalMonitoring() {
    Logger.log('EXEMPLO 3: Monitoramento Temporal (5 anos)');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  const timeline = [
    {
      year: 2020,
      biodiversity: [{ name: 'Sp1', count: 100 }],
      carbon: { biomassCarbon: 2, soilCarbon: 1, area: 1 }
    },
    {
      year: 2021,
      biodiversity: [{ name: 'Sp1', count: 80 }, { name: 'Sp2', count: 20 }],
      carbon: { biomassCarbon: 5, soilCarbon: 3, area: 1 }
    },
    {
      year: 2022,
      biodiversity: [{ name: 'Sp1', count: 60 }, { name: 'Sp2', count: 30 }, { name: 'Sp3', count: 15 }],
      carbon: { biomassCarbon: 10, soilCarbon: 6, area: 1 }
    },
    {
      year: 2023,
      biodiversity: [{ name: 'Sp1', count: 50 }, { name: 'Sp2', count: 35 }, { name: 'Sp3', count: 25 }, { name: 'Sp4', count: 15 }],
      carbon: { biomassCarbon: 16, soilCarbon: 10, area: 1 }
    },
    {
      year: 2024,
      biodiversity: [{ name: 'Sp1', count: 45 }, { name: 'Sp2', count: 40 }, { name: 'Sp3', count: 30 }, { name: 'Sp4', count: 25 }, { name: 'Sp5', count: 20 }],
      carbon: { biomassCarbon: 22, soilCarbon: 14, area: 1 }
    }
  ];
  
  Logger.log('EVOLUÇÃO DOS ÍNDICES:\n');
  Logger.log('Ano  | Biodiversidade | Carbono | Tendência');
  Logger.log('─────┼────────────────┼─────────┼──────────');
  
  const results = timeline.map(data => {
    const bio = NormalizedIndexService.normalizeBiodiversity(data.biodiversity);
    const carbon = NormalizedIndexService.normalizeCarbonSequestration(data.carbon);
    return {
      year: data.year,
      biodiversity: bio.normalized,
      carbon: carbon.normalized
    };
  });
  
  results.forEach((result, index) => {
    const bioTrend = index > 0 ? getTrend(results[index - 1].biodiversity, result.biodiversity) : '─';
    const carbonTrend = index > 0 ? getTrend(results[index - 1].carbon, result.carbon) : '─';
    
    Logger.log(
      `${result.year} | ${result.biodiversity.toFixed(1).padStart(14)} | ${result.carbon.toFixed(1).padStart(7)} | Bio: ${bioTrend} Carbon: ${carbonTrend}`
    );
  });
  
  // Calcular taxa de crescimento
  const bioGrowth = calculateGrowthRate(results[0].biodiversity, results[4].biodiversity);
  const carbonGrowth = calculateGrowthRate(results[0].carbon, results[4].carbon);
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log(`Crescimento Biodiversidade: ${bioGrowth}`);
  Logger.log(`Crescimento Carbono: ${carbonGrowth}`);
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Análise de Correlação
// ═══════════════════════════════════════════════════════════════════════════

function exemploCorrelationAnalysis() {
    Logger.log('EXEMPLO 4: Análise de Correlação');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Dados de múltiplas propriedades
  const properties = [
    { bio: 85, soil: 82, carbon: 78 },
    { bio: 72, soil: 70, carbon: 68 },
    { bio: 90, soil: 88, carbon: 85 },
    { bio: 45, soil: 48, carbon: 42 },
    { bio: 68, soil: 65, carbon: 63 },
    { bio: 55, soil: 58, carbon: 52 },
    { bio: 78, soil: 75, carbon: 72 },
    { bio: 92, soil: 90, carbon: 88 }
  ];
  
  const bioValues = properties.map(p => p.bio);
  const soilValues = properties.map(p => p.soil);
  const carbonValues = properties.map(p => p.carbon);
  
  Logger.log('CORRELAÇÕES ESPERADAS:\n');
  Logger.log('Biodiversidade vs Solo:     Positiva (alta diversidade = solo fértil)');
  Logger.log('Biodiversidade vs Carbono:  Positiva (mais árvores = mais carbono)');
  Logger.log('Solo vs Carbono:            Positiva (solo fértil = mais biomassa)\n');
  
  Logger.log('ESTATÍSTICAS:\n');
  Logger.log(`Biodiversidade - Média: ${NormalizedIndexService.mean(bioValues).toFixed(1)}, DP: ${NormalizedIndexService.stdDev(bioValues).toFixed(1)}`);
  Logger.log(`Solo           - Média: ${NormalizedIndexService.mean(soilValues).toFixed(1)}, DP: ${NormalizedIndexService.stdDev(soilValues).toFixed(1)}`);
  Logger.log(`Carbono        - Média: ${NormalizedIndexService.mean(carbonValues).toFixed(1)}, DP: ${NormalizedIndexService.stdDev(carbonValues).toFixed(1)}`);
  
  Logger.log('\n═══════════════════════════════════════════════════════════\n');
  
  return properties;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Detecção de Anomalias
// ═══════════════════════════════════════════════════════════════════════════

function exemploAnomalyDetection() {
    Logger.log('EXEMPLO 5: Detecção de Anomalias');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Dados de qualidade da água ao longo do tempo
  const measurements = [
    { date: '2024-01', pH: 7.0 },
    { date: '2024-02', pH: 7.1 },
    { date: '2024-03', pH: 7.2 },
    { date: '2024-04', pH: 4.5 }, // ANOMALIA!
    { date: '2024-05', pH: 7.0 },
    { date: '2024-06', pH: 7.1 },
    { date: '2024-07', pH: 7.2 },
    { date: '2024-08', pH: 9.5 }, // ANOMALIA!
    { date: '2024-09', pH: 7.0 },
    { date: '2024-10', pH: 7.1 }
  ];
  
  const phValues = measurements.map(m => m.pH);
  const cleaned = NormalizedIndexService.removeOutliers(phValues);
  
  Logger.log('MEDIÇÕES DE pH:\n');
  measurements.forEach(m => {
    const isAnomaly = !cleaned.includes(m.pH);
    const flag = isAnomaly ? ' ⚠️  ANOMALIA' : '';
    Logger.log(`${m.date}: pH ${m.pH}${flag}`);
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log(`Total de medições: ${phValues.length}`);
  Logger.log(`Anomalias detectadas: ${phValues.length - cleaned.length}`);
  Logger.log(`Média (sem anomalias): ${NormalizedIndexService.mean(cleaned).toFixed(2)}`);
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  return { original: phValues, cleaned: cleaned };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

function printIndex(name, index) {
  const bar = createProgressBar(index.normalized);
  Logger.log(`${name.padEnd(25)} ${index.normalized.toFixed(1).padStart(5)} ${bar} ${index.classification}`);
}

function createProgressBar(value, length = 20) {
  const filled = Math.round((value / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getTrend(oldValue, newValue) {
  const diff = newValue - oldValue;
  if (diff > 2) return '↗️';
  if (diff < -2) return '↘️';
  return '→';
}

/**
 * Calcula taxa de crescimento percentual tratando casos de divisão por zero
 * @param {number} initialValue - Valor inicial
 * @param {number} finalValue - Valor final
 * @returns {string} Taxa de crescimento formatada ou mensagem descritiva
 */
function calculateGrowthRate(initialValue, finalValue) {
  // Caso especial: valor inicial é zero
  if (initialValue === 0) {
    if (finalValue === 0) {
      return '+0.0% (sem mudança)';
    } else if (finalValue > 0) {
      return `+${finalValue.toFixed(1)} pontos (de 0 para ${finalValue.toFixed(1)})`;
    } else {
      return `${finalValue.toFixed(1)} pontos (de 0 para ${finalValue.toFixed(1)})`;
    }
  }
  
  // Cálculo normal de percentual
  const percentChange = ((finalValue - initialValue) / initialValue * 100).toFixed(1);
  const sign = percentChange >= 0 ? '+' : '';
  return `${sign}${percentChange}%`;
}

function calculatePropertyScore(data) {
  // Validacao: verifica se data foi fornecido
  if (!data || typeof data !== 'object') {
    Logger.log('\n⚠️  ERRO: calculatePropertyScore() foi chamado sem parametros ou com parametro invalido');
    Logger.log('Exemplo de uso correto:');
    Logger.log('calculatePropertyScore({');
    Logger.log('  name: "Fazenda Exemplo",');
    Logger.log('  waterQuality: { pH: 7.0, dissolvedOxygen: 8.0, ... },');
    Logger.log('  species: [{ name: "Sp1", count: 50 }, ...],');
    Logger.log('  carbon: { biomassCarbon: 20, soilCarbon: 15, area: 1 },');
    Logger.log('  soil: { pH: 6.5, organicMatter: 5.0, ... }');
    Logger.log('});\n');
    
    // Retorna valores padrao para nao quebrar o codigo
    return {
      name: 'Erro - dados invalidos',
      score: 0,
      classification: 'Dados invalidos'
    };
  }
  
  // Validacao: verifica se todas as propriedades necessarias existem
  if (!data.waterQuality || !data.species || !data.carbon || !data.soil) {
    Logger.log('\n⚠️  ERRO: Propriedades obrigatorias faltando');
    Logger.log('Esperado: waterQuality, species, carbon, soil');
    Logger.log('Recebido: ' + Object.keys(data).join(', ') + '\n');
    
    // Retorna valores padrao para nao quebrar o codigo
    return {
      name: data.name || 'Erro - propriedades faltando',
      score: 0,
      classification: 'Dados incompletos'
    };
  }
  
  try {
    const water = NormalizedIndexService.normalizeWaterQuality(data.waterQuality);
    const bio = NormalizedIndexService.normalizeBiodiversity(data.species);
    const carbon = NormalizedIndexService.normalizeCarbonSequestration(data.carbon);
    const soil = NormalizedIndexService.normalizeSoilFertility(data.soil);
    
    const overall = NormalizedIndexService.aggregateIndices(
      [water, bio, carbon, soil],
      [0.25, 0.30, 0.25, 0.20]
    );
    
    return {
      name: data.name,
      score: overall.normalized,
      classification: overall.classification
    };
  } catch (error) {
    Logger.log('\n⚠️  ERRO ao calcular score: ' + error.toString() + '\n');
    return {
      name: data.name || 'Erro',
      score: 0,
      classification: 'Erro no calculo'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTAR TODOS OS EXEMPLOS
// ═══════════════════════════════════════════════════════════════════════════

function runAllExamples() {
  exemploPropertyDashboard();
  exemploCompareProperties();
  exemploTemporalMonitoring();
  exemploCorrelationAnalysis();
  exemploAnomalyDetection();
  
  Logger.log('\n✅ Todos os exemplos executados com sucesso!\n');
}
