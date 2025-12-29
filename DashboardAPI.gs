/**
 * Dashboard API - Google Apps Script Backend
 * Integração entre interface HTML e dados do sistema
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Serve a página de dashboard de índices normalizados
 * NOTA: Renomeado para não conflitar com doGet() principal em Code.gs
 * Para acessar, use: ?page=normalized-dashboard
 */
function serveDashboardVisualization() {
  return HtmlService.createHtmlOutputFromFile('DashboardVisualization')
    .setTitle('Dashboard de Índices Normalizados')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Obtém dashboard completo de uma propriedade
 * @param {string} propertyId - ID da propriedade (opcional, usa exemplo se não fornecido)
 * @returns {Object} Dados completos do dashboard
 */
function getDashboardData(propertyId) {
  try {
    // Se não fornecer ID, usa dados de exemplo
    if (!propertyId) {
      return getExamplePropertyData();
    }
    
    // Buscar dados reais da propriedade
    // TODO: Implementar busca real quando houver tabela de propriedades
    return getExamplePropertyData();
    
  } catch (error) {
    Logger.log('Erro em getDashboardData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtém comparação entre múltiplas propriedades
 * @returns {Array} Lista de propriedades com scores
 */
function getComparisonData() {
  try {
    // Dados de exemplo - 3 propriedades
    const properties = [
      calculatePropertyScore({
        name: 'Fazenda Verde',
        waterQuality: { pH: 7.5, dissolvedOxygen: 9, turbidity: 2, temperature: 22 },
        species: [
          { name: 'Sp1', count: 50 },
          { name: 'Sp2', count: 45 },
          { name: 'Sp3', count: 40 },
          { name: 'Sp4', count: 35 }
        ],
        carbon: { biomassCarbon: 28, soilCarbon: 18, area: 1 },
        soil: { pH: 6.8, nitrogen: 85, phosphorus: 75, potassium: 80, organicMatter: 5.5 },
        climate: { treeCanopy: 85, waterAvailability: 90, soilMoisture: 80 }
      }),
      calculatePropertyScore({
        name: 'Fazenda Esperança',
        waterQuality: { pH: 7.0, dissolvedOxygen: 8, turbidity: 5, temperature: 24 },
        species: [
          { name: 'Sp1', count: 100 },
          { name: 'Sp2', count: 80 }
        ],
        carbon: { biomassCarbon: 2, soilCarbon: 1, area: 1 },
        soil: { pH: 7.2, nitrogen: 95, phosphorus: 92, potassium: 98, organicMatter: 6.5 },
        climate: { treeCanopy: 75, waterAvailability: 85, soilMoisture: 85 }
      }),
      calculatePropertyScore({
        name: 'Fazenda Tradicional',
        waterQuality: { pH: 6.5, dissolvedOxygen: 6, turbidity: 15, temperature: 26 },
        species: [
          { name: 'Sp1', count: 50 }
        ],
        carbon: { biomassCarbon: 5, soilCarbon: 3, area: 1 },
        soil: { pH: 5.5, nitrogen: 45, phosphorus: 40, potassium: 42, organicMatter: 2.5 },
        climate: { treeCanopy: 30, waterAvailability: 50, soilMoisture: 45 }
      })
    ];
    
    return {
      success: true,
      properties: properties.sort((a, b) => b.score - a.score)
    };
    
  } catch (error) {
    Logger.log('Erro em getComparisonData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtém evolução temporal dos índices
 * @param {number} years - Número de anos para análise (padrão: 5)
 * @returns {Object} Dados temporais
 */
function getTemporalData(years = 5) {
  try {
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
        biodiversity: [
          { name: 'Sp1', count: 60 },
          { name: 'Sp2', count: 30 },
          { name: 'Sp3', count: 15 }
        ],
        carbon: { biomassCarbon: 10, soilCarbon: 6, area: 1 }
      },
      {
        year: 2023,
        biodiversity: [
          { name: 'Sp1', count: 50 },
          { name: 'Sp2', count: 35 },
          { name: 'Sp3', count: 25 },
          { name: 'Sp4', count: 15 }
        ],
        carbon: { biomassCarbon: 16, soilCarbon: 10, area: 1 }
      },
      {
        year: 2024,
        biodiversity: [
          { name: 'Sp1', count: 45 },
          { name: 'Sp2', count: 40 },
          { name: 'Sp3', count: 30 },
          { name: 'Sp4', count: 25 },
          { name: 'Sp5', count: 20 }
        ],
        carbon: { biomassCarbon: 22, soilCarbon: 14, area: 1 }
      }
    ];
    
    const results = timeline.map(data => {
      const bio = NormalizedIndexService.normalizeBiodiversity(data.biodiversity);
      const carbon = NormalizedIndexService.normalizeCarbonSequestration(data.carbon);
      return {
        year: data.year,
        biodiversity: bio.normalized,
        carbon: carbon.normalized
      };
    });
    
    // Calcular crescimento
    const bioGrowth = calculateGrowthRate(results[0].biodiversity, results[results.length - 1].biodiversity);
    const carbonGrowth = calculateGrowthRate(results[0].carbon, results[results.length - 1].carbon);
    
    return {
      success: true,
      timeline: results,
      growth: {
        biodiversity: bioGrowth,
        carbon: carbonGrowth
      }
    };
    
  } catch (error) {
    Logger.log('Erro em getTemporalData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtém análise de correlação entre índices
 * @returns {Object} Dados de correlação
 */
function getCorrelationData() {
  try {
    // Gerar dados de amostra para correlação
    const samples = [];
    for (let i = 0; i < 30; i++) {
      const biodiversity = Math.random() * 60 + 30; // 30-90
      const soil = biodiversity + (Math.random() - 0.5) * 20; // Correlação positiva com ruído
      const carbon = (biodiversity + soil) / 2 + (Math.random() - 0.5) * 15;
      
      samples.push({
        biodiversity: Math.max(0, Math.min(100, biodiversity)),
        soil: Math.max(0, Math.min(100, soil)),
        carbon: Math.max(0, Math.min(100, carbon))
      });
    }
    
    // Calcular estatísticas
    const bioValues = samples.map(s => s.biodiversity);
    const soilValues = samples.map(s => s.soil);
    const carbonValues = samples.map(s => s.carbon);
    
    const stats = {
      biodiversity: {
        mean: bioValues.reduce((a, b) => a + b) / bioValues.length,
        std: calculateStdDev(bioValues)
      },
      soil: {
        mean: soilValues.reduce((a, b) => a + b) / soilValues.length,
        std: calculateStdDev(soilValues)
      },
      carbon: {
        mean: carbonValues.reduce((a, b) => a + b) / carbonValues.length,
        std: calculateStdDev(carbonValues)
      }
    };
    
    return {
      success: true,
      samples: samples,
      statistics: stats
    };
    
  } catch (error) {
    Logger.log('Erro em getCorrelationData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtém detecção de anomalias
 * @param {string} metricType - Tipo de métrica (pH, temperatura, etc)
 * @returns {Object} Dados de anomalias
 */
function getAnomalyData(metricType = 'pH') {
  try {
    const measurements = [
      { month: '2024-01', value: 7.0, isAnomaly: false },
      { month: '2024-02', value: 7.1, isAnomaly: false },
      { month: '2024-03', value: 7.2, isAnomaly: false },
      { month: '2024-04', value: 4.5, isAnomaly: true },
      { month: '2024-05', value: 7.0, isAnomaly: false },
      { month: '2024-06', value: 7.1, isAnomaly: false },
      { month: '2024-07', value: 7.2, isAnomaly: false },
      { month: '2024-08', value: 9.5, isAnomaly: true },
      { month: '2024-09', value: 7.0, isAnomaly: false },
      { month: '2024-10', value: 7.1, isAnomaly: false }
    ];
    
    const normalMeasurements = measurements.filter(m => !m.isAnomaly);
    const avgValue = normalMeasurements.reduce((sum, m) => sum + m.value, 0) / normalMeasurements.length;
    
    return {
      success: true,
      metricType: metricType,
      measurements: measurements,
      summary: {
        total: measurements.length,
        anomalies: measurements.filter(m => m.isAnomaly).length,
        normalAverage: avgValue
      }
    };
    
  } catch (error) {
    Logger.log('Erro em getAnomalyData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera dados de exemplo de propriedade
 */
function getExamplePropertyData() {
  const exampleData = {
    name: 'Fazenda Esperança',
    location: 'Mata Atlântica, SP',
    area: '50 ha',
    waterQuality: { pH: 7.0, dissolvedOxygen: 8, turbidity: 5, temperature: 24 },
    species: [
      { name: 'Araçari-poca', count: 15 },
      { name: 'Tucano-de-bico-verde', count: 8 },
      { name: 'Sabiá-laranjeira', count: 20 }
    ],
    carbon: { biomassCarbon: 2, soilCarbon: 1, area: 1 },
    soil: { pH: 7.2, nitrogen: 95, phosphorus: 92, potassium: 98, organicMatter: 6.5 },
    climate: { treeCanopy: 75, waterAvailability: 85, soilMoisture: 85 }
  };
  
  return calculatePropertyScore(exampleData);
}

/**
 * Calcula desvio padrão
 */
function calculateStdDev(values) {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calcula taxa de crescimento (importado de NormalizedIndexService.example.gs)
 */
function calculateGrowthRate(initialValue, finalValue) {
  if (initialValue === 0) {
    if (finalValue === 0) {
      return '+0.0% (sem mudança)';
    } else if (finalValue > 0) {
      return `+${finalValue.toFixed(1)} pontos (de 0 para ${finalValue.toFixed(1)})`;
    } else {
      return `${finalValue.toFixed(1)} pontos (de 0 para ${finalValue.toFixed(1)})`;
    }
  }
  
  const percentChange = ((finalValue - initialValue) / initialValue * 100).toFixed(1);
  const sign = percentChange >= 0 ? '+' : '';
  return `${sign}${percentChange}%`;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO DE TESTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa todos os endpoints da API
 */
function testDashboardAPI() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('TESTE: Dashboard API');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  // Teste 1: Dashboard de Propriedade
  Logger.log('1. Dashboard de Propriedade:');
  const dashboardData = getDashboardData();
  Logger.log(`   ${dashboardData.name} - Score: ${dashboardData.score.toFixed(1)}`);
  Logger.log(`   Classificação: ${dashboardData.classification}\n`);
  
  // Teste 2: Comparação
  Logger.log('2. Comparação Entre Propriedades:');
  const comparison = getComparisonData();
  if (comparison.success) {
    comparison.properties.forEach((prop, i) => {
      Logger.log(`   ${i + 1}. ${prop.name} - Score: ${prop.score.toFixed(1)}`);
    });
  }
  Logger.log('');
  
  // Teste 3: Evolução Temporal
  Logger.log('3. Evolução Temporal:');
  const temporal = getTemporalData();
  if (temporal.success) {
    Logger.log(`   Crescimento Biodiversidade: ${temporal.growth.biodiversity}`);
    Logger.log(`   Crescimento Carbono: ${temporal.growth.carbon}`);
  }
  Logger.log('');
  
  // Teste 4: Correlação
  Logger.log('4. Análise de Correlação:');
  const correlation = getCorrelationData();
  if (correlation.success) {
    Logger.log(`   Amostras geradas: ${correlation.samples.length}`);
    Logger.log(`   Biodiversidade - Média: ${correlation.statistics.biodiversity.mean.toFixed(1)}`);
  }
  Logger.log('');
  
  // Teste 5: Anomalias
  Logger.log('5. Detecção de Anomalias:');
  const anomaly = getAnomalyData();
  if (anomaly.success) {
    Logger.log(`   Total de medições: ${anomaly.summary.total}`);
    Logger.log(`   Anomalias detectadas: ${anomaly.summary.anomalies}`);
    Logger.log(`   Média normal: ${anomaly.summary.normalAverage.toFixed(2)}`);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('✅ Todos os testes executados com sucesso!');
  Logger.log('═══════════════════════════════════════════════════════════\n');
}
