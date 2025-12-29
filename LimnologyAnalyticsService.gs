/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY ANALYTICS SERVICE - Análise Estatística e Índices Ecológicos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 11/13: Análise Estatística e Índices Ecológicos
 * 
 * Serviço para cálculo de:
 * - Estatísticas descritivas
 * - Índices de diversidade (Shannon, Simpson, Margalef)
 * - Índices de qualidade da água (IQA, IET)
 * - Índices bióticos (BMWP, IBB, EPT)
 * - Análise de tendências temporais
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS DESCRITIVAS
// ═══════════════════════════════════════════════════════════════════════════

const LimnologyStats = {
  
  /**
   * Calcula estatísticas descritivas de um array
   * @param {Array} values - Array de valores numéricos
   * @returns {Object} Estatísticas calculadas
   */
  descriptive: function(values) {
    if (!values || values.length === 0) {
      return { n: 0, mean: null, median: null, std: null, min: null, max: null, cv: null };
    }
    
    // Filtra valores válidos
    var nums = values.filter(function(v) { return typeof v === 'number' && !isNaN(v); });
    var n = nums.length;
    
    if (n === 0) {
      return { n: 0, mean: null, median: null, std: null, min: null, max: null, cv: null };
    }
    
    // Ordena para mediana
    var sorted = nums.slice().sort(function(a, b) { return a - b; });
    
    // Média
    var sum = nums.reduce(function(a, b) { return a + b; }, 0);
    var mean = sum / n;
    
    // Mediana
    var median;
    if (n % 2 === 0) {
      median = (sorted[n/2 - 1] + sorted[n/2]) / 2;
    } else {
      median = sorted[Math.floor(n/2)];
    }
    
    // Desvio padrão
    var sqDiffs = nums.map(function(v) { return Math.pow(v - mean, 2); });
    var variance = sqDiffs.reduce(function(a, b) { return a + b; }, 0) / n;
    var std = Math.sqrt(variance);
    
    // Coeficiente de variação
    var cv = mean !== 0 ? (std / mean) * 100 : 0;
    
    return {
      n: n,
      mean: round(mean, 4),
      median: round(median, 4),
      std: round(std, 4),
      min: sorted[0],
      max: sorted[n - 1],
      cv: round(cv, 2),
      sum: round(sum, 4)
    };
  },
  
  /**
   * Calcula percentis
   */
  percentile: function(values, p) {
    var sorted = values.filter(function(v) { return !isNaN(v); }).sort(function(a, b) { return a - b; });
    var idx = (p / 100) * (sorted.length - 1);
    var lower = Math.floor(idx);
    var upper = Math.ceil(idx);
    
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ÍNDICES DE DIVERSIDADE
// ═══════════════════════════════════════════════════════════════════════════

const DiversityIndices = {
  
  /**
   * Índice de Shannon-Wiener (H')
   * H' = -Σ(pi * ln(pi))
   * @param {Array} abundances - Array de abundâncias por espécie
   * @returns {number} Índice de Shannon
   */
  shannon: function(abundances) {
    var total = abundances.reduce(function(a, b) { return a + b; }, 0);
    if (total === 0) return 0;
    
    var h = 0;
    abundances.forEach(function(n) {
      if (n > 0) {
        var pi = n / total;
        h -= pi * Math.log(pi);
      }
    });
    
    return round(h, 4);
  },
  
  /**
   * Índice de Simpson (D)
   * D = Σ(pi²)
   * @param {Array} abundances - Array de abundâncias
   * @returns {number} Índice de Simpson
   */
  simpson: function(abundances) {
    var total = abundances.reduce(function(a, b) { return a + b; }, 0);
    if (total === 0) return 0;
    
    var d = 0;
    abundances.forEach(function(n) {
      if (n > 0) {
        var pi = n / total;
        d += pi * pi;
      }
    });
    
    return round(d, 4);
  },
  
  /**
   * Índice de Simpson inverso (1/D)
   */
  simpsonInverse: function(abundances) {
    var d = this.simpson(abundances);
    return d > 0 ? round(1 / d, 4) : 0;
  },
  
  /**
   * Índice de Margalef (riqueza)
   * DMg = (S - 1) / ln(N)
   * @param {number} S - Número de espécies
   * @param {number} N - Número total de indivíduos
   */
  margalef: function(S, N) {
    if (N <= 1) return 0;
    return round((S - 1) / Math.log(N), 4);
  },
  
  /**
   * Equitabilidade de Pielou (J')
   * J' = H' / ln(S)
   */
  pielou: function(abundances) {
    var S = abundances.filter(function(n) { return n > 0; }).length;
    if (S <= 1) return 1;
    
    var h = this.shannon(abundances);
    var hMax = Math.log(S);
    
    return round(h / hMax, 4);
  },
  
  /**
   * Dominância de Berger-Parker
   * d = Nmax / N
   */
  bergerParker: function(abundances) {
    var total = abundances.reduce(function(a, b) { return a + b; }, 0);
    if (total === 0) return 0;
    
    var max = Math.max.apply(null, abundances);
    return round(max / total, 4);
  },
  
  /**
   * Calcula todos os índices de diversidade
   */
  calculateAll: function(abundances) {
    var S = abundances.filter(function(n) { return n > 0; }).length;
    var N = abundances.reduce(function(a, b) { return a + b; }, 0);
    
    return {
      riqueza: S,
      abundanciaTotal: N,
      shannon: this.shannon(abundances),
      simpson: this.simpson(abundances),
      simpsonInverso: this.simpsonInverse(abundances),
      margalef: this.margalef(S, N),
      pielou: this.pielou(abundances),
      bergerParker: this.bergerParker(abundances)
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ÍNDICES DE QUALIDADE DA ÁGUA
// ═══════════════════════════════════════════════════════════════════════════

const WaterQualityIndices = {
  
  /**
   * Índice de Qualidade da Água (IQA) - CETESB
   * IQA = Π(qi^wi)
   */
  IQA: function(params) {
    // Pesos CETESB
    var weights = {
      oxigenio_dissolvido: 0.17,
      coliformes: 0.15,
      ph: 0.12,
      dbo: 0.10,
      temperatura: 0.10,
      nitrogenio_total: 0.10,
      fosforo_total: 0.10,
      turbidez: 0.08,
      solidos_totais: 0.08
    };
    
    var iqa = 1;
    var totalWeight = 0;
    
    Object.keys(weights).forEach(function(param) {
      if (params[param] !== undefined && params[param] !== null) {
        var q = WaterQualityIndices._getQValue(param, params[param]);
        iqa *= Math.pow(q, weights[param]);
        totalWeight += weights[param];
      }
    });
    
    // Ajusta se não tiver todos os parâmetros
    if (totalWeight > 0 && totalWeight < 1) {
      iqa = Math.pow(iqa, 1 / totalWeight);
    }
    
    return {
      value: round(iqa, 1),
      classification: this._classifyIQA(iqa)
    };
  },
  
  /**
   * Obtém valor q para cada parâmetro (simplificado)
   */
  _getQValue: function(param, value) {
    // Funções simplificadas de qualidade
    switch (param) {
      case 'oxigenio_dissolvido':
        if (value >= 8) return 90;
        if (value >= 6) return 70;
        if (value >= 4) return 50;
        if (value >= 2) return 30;
        return 10;
      case 'ph':
        if (value >= 6.5 && value <= 8.5) return 90;
        if (value >= 6 && value <= 9) return 70;
        return 30;
      case 'turbidez':
        if (value <= 10) return 90;
        if (value <= 40) return 70;
        if (value <= 100) return 50;
        return 20;
      case 'temperatura':
        return 85; // Simplificado
      default:
        return 70;
    }
  },
  
  /**
   * Classifica IQA
   */
  _classifyIQA: function(iqa) {
    if (iqa >= 80) return { class: 'otima', label: 'Ótima', color: '#0000FF' };
    if (iqa >= 52) return { class: 'boa', label: 'Boa', color: '#00FF00' };
    if (iqa >= 37) return { class: 'aceitavel', label: 'Aceitável', color: '#FFFF00' };
    if (iqa >= 20) return { class: 'ruim', label: 'Ruim', color: '#FFA500' };
    return { class: 'pessima', label: 'Péssima', color: '#FF0000' };
  },
  
  /**
   * Índice de Estado Trófico (IET) - Carlson modificado
   * IET = 10 * (6 - ((0.92 - 0.34 * (ln PT)) / ln 2))
   */
  IET: function(params) {
    var ietValues = [];
    
    // IET(PT) - Fósforo Total (µg/L)
    if (params.fosforo_total) {
      var pt = params.fosforo_total * 1000; // mg/L para µg/L
      var ietPT = 10 * (6 - ((0.92 - 0.34 * Math.log(pt)) / Math.log(2)));
      ietValues.push(ietPT);
    }
    
    // IET(CL) - Clorofila-a (µg/L)
    if (params.clorofila_a) {
      var cl = params.clorofila_a;
      var ietCL = 10 * (6 - ((2.04 - 0.695 * Math.log(cl)) / Math.log(2)));
      ietValues.push(ietCL);
    }
    
    // IET(DS) - Transparência Secchi (m)
    if (params.transparencia) {
      var ds = params.transparencia;
      var ietDS = 10 * (6 - (0.64 + Math.log(ds)) / Math.log(2));
      ietValues.push(ietDS);
    }
    
    if (ietValues.length === 0) return null;
    
    var iet = ietValues.reduce(function(a, b) { return a + b; }, 0) / ietValues.length;
    
    return {
      value: round(iet, 1),
      classification: this._classifyIET(iet)
    };
  },
  
  /**
   * Classifica IET
   */
  _classifyIET: function(iet) {
    if (iet <= 47) return { class: 'ultraoligotrofico', label: 'Ultraoligotrófico', color: '#0000FF' };
    if (iet <= 52) return { class: 'oligotrofico', label: 'Oligotrófico', color: '#00BFFF' };
    if (iet <= 59) return { class: 'mesotrofico', label: 'Mesotrófico', color: '#00FF00' };
    if (iet <= 63) return { class: 'eutrofico', label: 'Eutrófico', color: '#FFFF00' };
    if (iet <= 67) return { class: 'supereutrofico', label: 'Supereutrófico', color: '#FFA500' };
    return { class: 'hipereutrofico', label: 'Hipereutrófico', color: '#FF0000' };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ÍNDICES BIÓTICOS
// ═══════════════════════════════════════════════════════════════════════════

const BioticIndices = {
  
  /**
   * Pontuações BMWP por família
   */
  BMWP_SCORES: {
    // Sensíveis (8-10)
    'Siphlonuridae': 10, 'Heptageniidae': 10, 'Leptophlebiidae': 10,
    'Potamanthidae': 10, 'Ephemeridae': 10, 'Taeniopterygidae': 10,
    'Leuctridae': 10, 'Capniidae': 10, 'Perlodidae': 10, 'Perlidae': 10,
    'Chloroperlidae': 10, 'Aphelocheiridae': 10, 'Phryganeidae': 10,
    'Molannidae': 10, 'Beraeidae': 10, 'Odontoceridae': 10,
    'Leptoceridae': 10, 'Goeridae': 10, 'Lepidostomatidae': 10,
    'Brachycentridae': 10, 'Sericostomatidae': 10,
    
    // Moderadamente sensíveis (6-7)
    'Astacidae': 8, 'Lestidae': 8, 'Calopterygidae': 8, 'Gomphidae': 8,
    'Cordulegastridae': 8, 'Aeshnidae': 8, 'Corduliidae': 8,
    'Libellulidae': 8, 'Psychomyiidae': 8, 'Philopotamidae': 8,
    'Caenidae': 7, 'Nemouridae': 7, 'Rhyacophilidae': 7,
    'Polycentropodidae': 7, 'Limnephilidae': 7,
    
    // Tolerantes (4-5)
    'Neritidae': 6, 'Viviparidae': 6, 'Ancylidae': 6, 'Unionidae': 6,
    'Corophiidae': 6, 'Gammaridae': 6, 'Platycnemididae': 6,
    'Coenagriidae': 6, 'Hydroptilidae': 6, 'Baetidae': 5,
    'Haliplidae': 5, 'Curculionidae': 5, 'Chrysomelidae': 5,
    'Tabanidae': 5, 'Stratiomyidae': 5, 'Empididae': 5,
    'Dolichopodidae': 5, 'Dixidae': 5, 'Simuliidae': 5,
    'Tipulidae': 5, 'Limoniidae': 5, 'Psychodidae': 5,
    
    // Resistentes (1-3)
    'Glossiphoniidae': 3, 'Hirudidae': 3, 'Erpobdellidae': 3,
    'Asellidae': 3, 'Hydrobiidae': 3, 'Lymnaeidae': 3,
    'Physidae': 3, 'Planorbidae': 3, 'Sphaeriidae': 3,
    'Chironomidae': 2, 'Culicidae': 2, 'Muscidae': 2,
    'Oligochaeta': 1, 'Syrphidae': 1
  },
  
  /**
   * Calcula BMWP
   * @param {Array} families - Array de famílias encontradas
   * @returns {Object} Score e classificação
   */
  BMWP: function(families) {
    var score = 0;
    var counted = [];
    
    families.forEach(function(family) {
      var familyName = family.trim();
      if (BioticIndices.BMWP_SCORES[familyName] && counted.indexOf(familyName) === -1) {
        score += BioticIndices.BMWP_SCORES[familyName];
        counted.push(familyName);
      }
    });
    
    return {
      value: score,
      familiesCount: counted.length,
      classification: this._classifyBMWP(score)
    };
  },
  
  /**
   * Classifica BMWP
   */
  _classifyBMWP: function(score) {
    if (score > 150) return { class: 'I', label: 'Excelente', quality: 'Águas muito limpas', color: '#0000FF' };
    if (score > 100) return { class: 'II', label: 'Boa', quality: 'Águas limpas', color: '#00FF00' };
    if (score > 60) return { class: 'III', label: 'Aceitável', quality: 'Águas medianamente poluídas', color: '#FFFF00' };
    if (score > 35) return { class: 'IV', label: 'Duvidosa', quality: 'Águas poluídas', color: '#FFA500' };
    if (score > 15) return { class: 'V', label: 'Ruim', quality: 'Águas muito poluídas', color: '#FF0000' };
    return { class: 'VI', label: 'Péssima', quality: 'Águas fortemente poluídas', color: '#800000' };
  },
  
  /**
   * Índice EPT (Ephemeroptera, Plecoptera, Trichoptera)
   * %EPT = (nEPT / N) * 100
   */
  EPT: function(counts) {
    var ept = (counts.ephemeroptera || 0) + (counts.plecoptera || 0) + (counts.trichoptera || 0);
    var total = counts.total || 0;
    
    if (total === 0) return { value: 0, classification: null };
    
    var percent = (ept / total) * 100;
    
    return {
      value: round(percent, 1),
      eptCount: ept,
      totalCount: total,
      classification: this._classifyEPT(percent)
    };
  },
  
  /**
   * Classifica %EPT
   */
  _classifyEPT: function(percent) {
    if (percent >= 75) return { label: 'Excelente', color: '#0000FF' };
    if (percent >= 50) return { label: 'Boa', color: '#00FF00' };
    if (percent >= 25) return { label: 'Regular', color: '#FFFF00' };
    if (percent >= 10) return { label: 'Ruim', color: '#FFA500' };
    return { label: 'Muito Ruim', color: '#FF0000' };
  },
  
  /**
   * Razão EPT/Chironomidae
   */
  EPTChironomidaeRatio: function(eptCount, chironomidaeCount) {
    if (chironomidaeCount === 0) return { value: Infinity, label: 'Excelente (sem Chironomidae)' };
    
    var ratio = eptCount / chironomidaeCount;
    
    var label;
    if (ratio > 1) label = 'Boa qualidade';
    else if (ratio > 0.5) label = 'Qualidade intermediária';
    else label = 'Qualidade comprometida';
    
    return { value: round(ratio, 2), label: label };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANÁLISE DE TENDÊNCIAS
// ═══════════════════════════════════════════════════════════════════════════

const TrendAnalysis = {
  
  /**
   * Calcula tendência linear (regressão simples)
   * @param {Array} data - Array de {x, y} ou valores y
   * @returns {Object} Coeficientes e estatísticas
   */
  linearRegression: function(data) {
    var n = data.length;
    if (n < 2) return null;
    
    // Se for array simples, cria x como índice
    var points = data.map(function(d, i) {
      if (typeof d === 'object') return d;
      return { x: i, y: d };
    });
    
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    points.forEach(function(p) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    });
    
    var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    var intercept = (sumY - slope * sumX) / n;
    
    // R²
    var yMean = sumY / n;
    var ssTotal = 0, ssResidual = 0;
    
    points.forEach(function(p) {
      var yPred = slope * p.x + intercept;
      ssTotal += Math.pow(p.y - yMean, 2);
      ssResidual += Math.pow(p.y - yPred, 2);
    });
    
    var r2 = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
    
    // Tendência
    var trend;
    if (Math.abs(slope) < 0.001) trend = 'estável';
    else if (slope > 0) trend = 'crescente';
    else trend = 'decrescente';
    
    return {
      slope: round(slope, 6),
      intercept: round(intercept, 4),
      r2: round(r2, 4),
      trend: trend,
      predict: function(x) { return slope * x + intercept; }
    };
  },
  
  /**
   * Média móvel
   */
  movingAverage: function(values, window) {
    window = window || 3;
    var result = [];
    
    for (var i = 0; i < values.length; i++) {
      var start = Math.max(0, i - Math.floor(window / 2));
      var end = Math.min(values.length, i + Math.ceil(window / 2));
      var subset = values.slice(start, end);
      var avg = subset.reduce(function(a, b) { return a + b; }, 0) / subset.length;
      result.push(round(avg, 4));
    }
    
    return result;
  },
  
  /**
   * Detecta anomalias (valores fora de 2 desvios padrão)
   */
  detectAnomalies: function(values, threshold) {
    threshold = threshold || 2;
    var stats = LimnologyStats.descriptive(values);
    
    if (!stats.mean || !stats.std) return [];
    
    var anomalies = [];
    var lower = stats.mean - threshold * stats.std;
    var upper = stats.mean + threshold * stats.std;
    
    values.forEach(function(v, i) {
      if (v < lower || v > upper) {
        anomalies.push({
          index: i,
          value: v,
          type: v < lower ? 'baixo' : 'alto',
          deviation: round((v - stats.mean) / stats.std, 2)
        });
      }
    });
    
    return anomalies;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE ANÁLISE INTEGRADA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analisa dados de qualidade da água
 * @param {string} sheetName - Nome da planilha (default: QualidadeAgua)
 * @returns {Object} Análise completa
 */
function analyzeWaterQuality(sheetName) {
  sheetName = sheetName || 'QualidadeAgua';
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'Sem dados para análise' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Extrai séries temporais
    var params = ['temperatura', 'ph', 'oxigenio_dissolvido', 'condutividade', 'turbidez'];
    var series = {};
    
    params.forEach(function(param) {
      var idx = headers.indexOf(param);
      if (idx !== -1) {
        series[param] = [];
        for (var i = 1; i < data.length; i++) {
          var val = parseFloat(data[i][idx]);
          if (!isNaN(val)) series[param].push(val);
        }
      }
    });
    
    // Calcula estatísticas e tendências
    var analysis = {
      periodo: {
        inicio: data[1][headers.indexOf('data')],
        fim: data[data.length - 1][headers.indexOf('data')],
        registros: data.length - 1
      },
      parametros: {}
    };
    
    Object.keys(series).forEach(function(param) {
      if (series[param].length > 0) {
        analysis.parametros[param] = {
          estatisticas: LimnologyStats.descriptive(series[param]),
          tendencia: TrendAnalysis.linearRegression(series[param]),
          anomalias: TrendAnalysis.detectAnomalies(series[param])
        };
      }
    });
    
    // Calcula IQA com últimos valores
    var lastRow = data[data.length - 1];
    var lastParams = {};
    params.forEach(function(p) {
      var idx = headers.indexOf(p);
      if (idx !== -1) lastParams[p] = parseFloat(lastRow[idx]);
    });
    
    analysis.iqa = WaterQualityIndices.IQA(lastParams);
    analysis.iet = WaterQualityIndices.IET(lastParams);
    
    return { success: true, analysis: analysis };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Analisa comunidade bentônica
 */
function analyzeBenthicCommunity() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bentos_RA');
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'Sem dados' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var familiaIdx = headers.indexOf('familia');
    var abundanciaIdx = headers.indexOf('abundancia');
    var grupoIdx = headers.indexOf('grupo');
    
    // Agrupa por família
    var familyCounts = {};
    var groupCounts = { ephemeroptera: 0, plecoptera: 0, trichoptera: 0, total: 0 };
    
    for (var i = 1; i < data.length; i++) {
      var familia = data[i][familiaIdx];
      var abundancia = parseInt(data[i][abundanciaIdx]) || 1;
      var grupo = (data[i][grupoIdx] || '').toLowerCase();
      
      if (familia) {
        familyCounts[familia] = (familyCounts[familia] || 0) + abundancia;
      }
      
      groupCounts.total += abundancia;
      if (grupo === 'ephemeroptera') groupCounts.ephemeroptera += abundancia;
      if (grupo === 'plecoptera') groupCounts.plecoptera += abundancia;
      if (grupo === 'trichoptera') groupCounts.trichoptera += abundancia;
    }
    
    var abundances = Object.values(familyCounts);
    var families = Object.keys(familyCounts);
    
    return {
      success: true,
      analysis: {
        diversidade: DiversityIndices.calculateAll(abundances),
        bmwp: BioticIndices.BMWP(families),
        ept: BioticIndices.EPT(groupCounts),
        familias: familyCounts
      }
    };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

function round(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Menu: Executar análise completa
 */
function menuRunFullAnalysis() {
  var ui = SpreadsheetApp.getUi();
  
  var waterAnalysis = analyzeWaterQuality();
  var benthicAnalysis = analyzeBenthicCommunity();
  
  var msg = '═══ ANÁLISE LIMNOLÓGICA ═══\n\n';
  
  if (waterAnalysis.success) {
    var a = waterAnalysis.analysis;
    msg += '💧 QUALIDADE DA ÁGUA\n';
    msg += 'IQA: ' + (a.iqa ? a.iqa.value + ' (' + a.iqa.classification.label + ')' : 'N/A') + '\n';
    msg += 'IET: ' + (a.iet ? a.iet.value + ' (' + a.iet.classification.label + ')' : 'N/A') + '\n\n';
  }
  
  if (benthicAnalysis.success) {
    var b = benthicAnalysis.analysis;
    msg += '🐚 COMUNIDADE BENTÔNICA\n';
    msg += 'Shannon: ' + b.diversidade.shannon + '\n';
    msg += 'BMWP: ' + b.bmwp.value + ' (' + b.bmwp.classification.label + ')\n';
    msg += '%EPT: ' + b.ept.value + '%\n';
  }
  
  ui.alert('📊 Resultado da Análise', msg, ui.ButtonSet.OK);
}
