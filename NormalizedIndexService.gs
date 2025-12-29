/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NORMALIZED INDEX SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Serviço centralizado para normalização de todos os índices do sistema.
 * Garante consistência, comparabilidade e confiabilidade estatística.
 * 
 * Baseado em:
 * - IPCC Guidelines (2019)
 * - NSF Water Quality Index
 * - Shannon-Wiener Diversity Index
 * - Análise de Inconsistências Matemáticas (2025-11-02)
 * 
 * @version 2.0.0
 * @author Sistema Agroflorestal
 * @date 2025-11-03
 */

const NormalizedIndexService = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTES
  // ═══════════════════════════════════════════════════════════════════════════

  const SCALE = {
    MIN: 0,
    MAX: 100
  };

  const CONFIDENCE_LEVEL = 0.95; // 95% de confiança

  const CLASSIFICATIONS = {
    EXCELLENT: { min: 80, max: 100, label: 'Excelente', color: '#00C853' },
    GOOD: { min: 60, max: 79, label: 'Bom', color: '#64DD17' },
    MODERATE: { min: 40, max: 59, label: 'Moderado', color: '#FFD600' },
    POOR: { min: 20, max: 39, label: 'Ruim', color: '#FF6D00' },
    CRITICAL: { min: 0, max: 19, label: 'Crítico', color: '#D50000' }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNÇÕES ESTATÍSTICAS BÁSICAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calcula média aritmética
   */
  function mean(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;
    return valid.reduce((sum, v) => sum + v, 0) / valid.length;
  }

  /**
   * Calcula desvio padrão
   */
  function stdDev(values, sample = true) {
    if (!Array.isArray(values) || values.length < 2) return null;
    const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (valid.length < 2) return null;
    
    const avg = mean(valid);
    const squareDiffs = valid.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = mean(squareDiffs);
    const divisor = sample ? valid.length - 1 : valid.length;
    
    return Math.sqrt((avgSquareDiff * valid.length) / divisor);
  }

  /**
   * Calcula intervalo de confiança
   */
  function confidenceInterval(values, confidence = CONFIDENCE_LEVEL) {
    if (!Array.isArray(values) || values.length < 2) return null;
    
    const avg = mean(values);
    const sd = stdDev(values);
    const n = values.length;
    
    if (avg === null || sd === null) return null;
    
    // Z-score para 95% de confiança ≈ 1.96
    const zScore = confidence === 0.95 ? 1.96 : 2.576; // 99% = 2.576
    const margin = zScore * (sd / Math.sqrt(n));
    
    return {
      lower: Math.max(0, avg - margin),
      upper: Math.min(100, avg + margin),
      margin: margin
    };
  }

  /**
   * Remove outliers usando método IQR (Interquartile Range)
   */
  function removeOutliers(values, method = 'iqr') {
    if (!Array.isArray(values) || values.length < 4) return values;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v >= lowerBound && v <= upperBound);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALIZAÇÃO UNIVERSAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normaliza valor para escala 0-100
   */
  function normalize(value, min, max, inverted = false) {
    if (typeof value !== 'number' || isNaN(value)) return null;
    if (min === max) return SCALE.MAX / 2; // Valor médio se não há variação
    
    let normalized = ((value - min) / (max - min)) * SCALE.MAX;
    
    if (inverted) {
      normalized = SCALE.MAX - normalized;
    }
    
    return Math.max(SCALE.MIN, Math.min(SCALE.MAX, normalized));
  }

  /**
   * Classifica valor normalizado
   */
  function classify(normalizedValue) {
    if (normalizedValue === null || isNaN(normalizedValue)) {
      return { label: 'Indeterminado', color: '#9E9E9E' };
    }
    
    for (const [key, range] of Object.entries(CLASSIFICATIONS)) {
      if (normalizedValue >= range.min && normalizedValue <= range.max) {
        return { label: range.label, color: range.color };
      }
    }
    
    return { label: 'Indeterminado', color: '#9E9E9E' };
  }

  /**
   * Cria resultado normalizado padrão
   */
  function createNormalizedResult(raw, normalized, params = {}) {
    const classification = classify(normalized);
    
    return {
      raw: raw,
      normalized: normalized,
      classification: classification.label,
      color: classification.color,
      confidence: params.confidence || null,
      percentile: params.percentile || null,
      unit: params.unit || null,
      timestamp: new Date().toISOString()
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ÍNDICES ESPECÍFICOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normaliza Índice de Qualidade da Água (IQA)
   * Baseado em NSF-WQI com 9 parâmetros
   */
  function normalizeWaterQuality(params) {
    const parameters = [
      { 
        name: 'pH', 
        value: params.pH, 
        weight: 0.11,
        ideal: 7.0,
        curve: (v) => {
          if (v < 2) return 0;
          if (v >= 2 && v < 6.9) return 16 + (v - 2) * (50 - 16) / (6.9 - 2);
          if (v >= 6.9 && v <= 7.1) return 92 + (v - 6.9) * (100 - 92) / (7.1 - 6.9);
          if (v > 7.1 && v <= 12) return 80 - (v - 7.1) * (80 - 16) / (12 - 7.1);
          return 0;
        }
      },
      {
        name: 'dissolvedOxygen',
        value: params.dissolvedOxygen,
        weight: 0.17,
        ideal: 9,
        curve: (v) => normalize(v, 0, 14, false)
      },
      {
        name: 'BOD',
        value: params.BOD,
        weight: 0.11,
        ideal: 0,
        curve: (v) => normalize(v, 0, 30, true) // Invertido: menor é melhor
      },
      {
        name: 'temperature',
        value: params.temperature,
        weight: 0.10,
        ideal: 20,
        curve: (v) => {
          const deviation = Math.abs(v - 20);
          return Math.max(0, 100 - deviation * 3);
        }
      },
      {
        name: 'totalPhosphorus',
        value: params.totalPhosphorus,
        weight: 0.10,
        ideal: 0,
        curve: (v) => normalize(v, 0, 10, true)
      },
      {
        name: 'totalNitrogen',
        value: params.totalNitrogen,
        weight: 0.10,
        ideal: 0,
        curve: (v) => normalize(v, 0, 90, true)
      },
      {
        name: 'turbidity',
        value: params.turbidity,
        weight: 0.08,
        ideal: 0,
        curve: (v) => normalize(v, 0, 100, true)
      },
      {
        name: 'totalSolids',
        value: params.totalSolids,
        weight: 0.08,
        ideal: 0,
        curve: (v) => normalize(v, 0, 500, true)
      },
      {
        name: 'fecalColiforms',
        value: params.fecalColiforms,
        weight: 0.15,
        ideal: 0,
        curve: (v) => {
          if (v <= 0) return 100;
          if (v >= 100000) return 3;
          return 98 - (Math.log10(v) / 5) * 95;
        }
      }
    ];

    // Calcula IQA usando produto ponderado (método NSF)
    let iqa = 1;
    const details = [];
    
    for (const param of parameters) {
      if (param.value !== null && param.value !== undefined) {
        const qi = param.curve(param.value);
        iqa *= Math.pow(qi / 100, param.weight);
        details.push({
          parameter: param.name,
          value: param.value,
          qi: qi,
          weight: param.weight
        });
      }
    }
    
    const iqaNormalized = iqa * 100;
    
    return {
      ...createNormalizedResult(iqa, iqaNormalized, { unit: 'IQA' }),
      details: details,
      method: 'NSF-WQI'
    };
  }

  /**
   * Normaliza Índice de Biodiversidade
   * Combina Shannon, Simpson, Evenness e Richness
   */
  function normalizeBiodiversity(species) {
    if (!Array.isArray(species) || species.length === 0) {
      return createNormalizedResult(0, 0, { unit: 'Biodiversity Index' });
    }

    const n = species.length; // Número de espécies
    const N = species.reduce((sum, s) => sum + (s.count || 0), 0); // Total de indivíduos
    
    if (N === 0) {
      return createNormalizedResult(0, 0, { unit: 'Biodiversity Index' });
    }

    // Shannon Index: H = -Σ(pi * ln(pi))
    let shannon = 0;
    let simpson = 0;
    
    for (const sp of species) {
      const pi = sp.count / N;
      if (pi > 0) {
        shannon -= pi * Math.log(pi);
        simpson += pi * pi;
      }
    }
    
    // Normalizar Shannon (0 a log(n))
    const maxShannon = Math.log(n);
    const shannonNorm = n > 1 ? (shannon / maxShannon) * 100 : 0;
    
    // Simpson's Diversity: D = 1 - Σ(pi²)
    const simpsonD = 1 - simpson;
    const simpsonNorm = simpsonD * 100;
    
    // Pielou's Evenness: J = H / Hmax
    const evenness = n > 1 ? shannon / maxShannon : 0;
    const evennessNorm = evenness * 100;
    
    // Margalef's Richness: R = (S - 1) / ln(N)
    const richness = N > 1 ? (n - 1) / Math.log(N) : 0;
    const richnessNorm = Math.min((richness / 10) * 100, 100);
    
    // Índice agregado (média ponderada)
    const aggregate = (
      shannonNorm * 0.30 +
      simpsonNorm * 0.30 +
      evennessNorm * 0.20 +
      richnessNorm * 0.20
    );
    
    return {
      ...createNormalizedResult(aggregate, aggregate, { unit: 'Biodiversity Index' }),
      components: {
        shannon: { raw: shannon, normalized: shannonNorm, max: maxShannon },
        simpson: { raw: simpsonD, normalized: simpsonNorm },
        evenness: { raw: evenness, normalized: evennessNorm },
        richness: { raw: richness, normalized: richnessNorm }
      },
      speciesCount: n,
      totalIndividuals: N
    };
  }

  /**
   * Normaliza Sequestro de Carbono
   * Baseado em IPCC Tier 2 Guidelines
   */
  function normalizeCarbonSequestration(params) {
    const { biomassCarbon, soilCarbon, area = 1 } = params;
    
    // Total em tCO2e/ha
    const totalCarbon = (biomassCarbon || 0) + (soilCarbon || 0);
    const carbonPerHa = totalCarbon / area;
    
    // Normalizar: 0-50 tCO2e/ha = 0-100
    // (50 tCO2e/ha é um valor alto para sistemas agroflorestais)
    const normalized = normalize(carbonPerHa, 0, 50, false);
    
    return {
      ...createNormalizedResult(carbonPerHa, normalized, { unit: 'tCO2e/ha' }),
      components: {
        biomass: biomassCarbon,
        soil: soilCarbon,
        total: totalCarbon
      },
      area: area
    };
  }

  /**
   * Normaliza Fertilidade do Solo
   */
  function normalizeSoilFertility(params) {
    const components = [
      { name: 'pH', value: params.pH, weight: 0.20, ideal: 6.5, range: [4, 8] },
      { name: 'organicMatter', value: params.organicMatter, weight: 0.25, ideal: 5, range: [0, 10] },
      { name: 'nitrogen', value: params.nitrogen, weight: 0.15, ideal: 100, range: [0, 200] },
      { name: 'phosphorus', value: params.phosphorus, weight: 0.15, ideal: 50, range: [0, 100] },
      { name: 'potassium', value: params.potassium, weight: 0.15, ideal: 150, range: [0, 300] },
      { name: 'cec', value: params.cec, weight: 0.10, ideal: 15, range: [0, 30] }
    ];

    let totalScore = 0;
    let totalWeight = 0;
    const details = [];

    for (const comp of components) {
      if (comp.value !== null && comp.value !== undefined) {
        // Calcular score baseado em proximidade ao ideal
        const deviation = Math.abs(comp.value - comp.ideal);
        const maxDeviation = Math.max(
          Math.abs(comp.range[0] - comp.ideal),
          Math.abs(comp.range[1] - comp.ideal)
        );
        const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
        
        totalScore += score * comp.weight;
        totalWeight += comp.weight;
        
        details.push({
          parameter: comp.name,
          value: comp.value,
          ideal: comp.ideal,
          score: score,
          weight: comp.weight
        });
      }
    }

    const fertility = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      ...createNormalizedResult(fertility, fertility, { unit: 'Fertility Index' }),
      details: details
    };
  }

  /**
   * Normaliza Risco Climático
   */
  function normalizeClimateRisk(params) {
    const risks = [
      { name: 'drought', value: params.droughtRisk, weight: 0.30 },
      { name: 'flood', value: params.floodRisk, weight: 0.25 },
      { name: 'heatwave', value: params.heatwaveRisk, weight: 0.20 },
      { name: 'frost', value: params.frostRisk, weight: 0.15 },
      { name: 'storm', value: params.stormRisk, weight: 0.10 }
    ];

    let totalRisk = 0;
    let totalWeight = 0;

    for (const risk of risks) {
      if (risk.value !== null && risk.value !== undefined) {
        totalRisk += risk.value * risk.weight;
        totalWeight += risk.weight;
      }
    }

    const aggregateRisk = totalWeight > 0 ? totalRisk / totalWeight : 0;
    
    // Inverter: alto risco = baixo score
    const normalized = 100 - aggregateRisk;

    return {
      ...createNormalizedResult(aggregateRisk, normalized, { unit: 'Climate Risk' }),
      risks: risks.map(r => ({ name: r.name, value: r.value, weight: r.weight }))
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGREGAÇÃO MULTI-ÍNDICE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Agrega múltiplos índices normalizados
   */
  function aggregateIndices(indices, weights = null) {
    if (!Array.isArray(indices) || indices.length === 0) return null;

    const validIndices = indices.filter(idx => 
      idx && typeof idx.normalized === 'number' && !isNaN(idx.normalized)
    );

    if (validIndices.length === 0) return null;

    // Se não houver pesos, usar média simples
    if (!weights || weights.length !== validIndices.length) {
      const avg = mean(validIndices.map(idx => idx.normalized));
      return createNormalizedResult(avg, avg, { unit: 'Aggregate Index' });
    }

    // Média ponderada
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const weightedSum = validIndices.reduce((sum, idx, i) => 
      sum + (idx.normalized * weights[i]), 0
    );
    const aggregate = weightedSum / totalWeight;

    return createNormalizedResult(aggregate, aggregate, { unit: 'Aggregate Index' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Funções estatísticas
    mean,
    stdDev,
    confidenceInterval,
    removeOutliers,
    
    // Normalização
    normalize,
    classify,
    createNormalizedResult,
    
    // Índices específicos
    normalizeWaterQuality,
    normalizeBiodiversity,
    normalizeCarbonSequestration,
    normalizeSoilFertility,
    normalizeClimateRisk,
    
    // Agregação
    aggregateIndices,
    
    // Constantes
    SCALE,
    CLASSIFICATIONS
  };
})();
