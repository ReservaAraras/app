/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATISTICAL UTILS - Funções Estatísticas Padronizadas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Base matemática unificada para todo o projeto
 * Garante consistência e rigor estatístico
 */

const StatisticalUtils = {
  
  /**
   * Calcula média aritmética com validação
   */
  mean(array, options = {}) {
    if (!Array.isArray(array) || array.length === 0) {
      return options.defaultValue !== undefined ? options.defaultValue : null;
    }
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v));
    
    if (values.length === 0) {
      return options.defaultValue !== undefined ? options.defaultValue : null;
    }
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  },
  
  /**
   * Calcula mediana
   */
  median(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v)).sort((a, b) => a - b);
    
    if (values.length === 0) return null;
    
    const mid = Math.floor(values.length / 2);
    
    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    }
    
    return values[mid];
  },
  
  /**
   * Calcula moda (valor mais frequente)
   */
  mode(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    const frequency = {};
    let maxFreq = 0;
    let modes = [];
    
    array.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        modes = [val];
      } else if (frequency[val] === maxFreq && !modes.includes(val)) {
        modes.push(val);
      }
    });
    
    return modes.length === array.length ? null : modes;
  },
  
  /**
   * Calcula variância
   * @param {boolean} sample - true para variância amostral (n-1), false para populacional (n)
   */
  variance(array, sample = true) {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v));
    
    if (values.length === 0) return null;
    if (sample && values.length === 1) return null;
    
    const avg = this.mean(values);
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const divisor = sample ? values.length - 1 : values.length;
    
    return squaredDiffs.reduce((acc, val) => acc + val, 0) / divisor;
  },
  
  /**
   * Calcula desvio padrão
   */
  stdDev(array, sample = true) {
    const variance = this.variance(array, sample);
    return variance !== null ? Math.sqrt(variance) : null;
  },
  
  /**
   * Calcula coeficiente de variação (CV%)
   */
  coefficientOfVariation(array) {
    const mean = this.mean(array);
    const stdDev = this.stdDev(array);
    
    if (mean === null || stdDev === null || mean === 0) return null;
    
    return (stdDev / Math.abs(mean)) * 100;
  },
  
  /**
   * Calcula intervalo de confiança
   * @param {number} confidence - nível de confiança (0.90, 0.95, 0.99)
   */
  confidenceInterval(array, confidence = 0.95) {
    if (!Array.isArray(array) || array.length < 2) return null;
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v));
    
    if (values.length < 2) return null;
    
    const mean = this.mean(values);
    const stdDev = this.stdDev(values, true);
    const n = values.length;
    
    // Valores críticos t-Student (aproximação para n > 30 usa z)
    const tValues = {
      0.90: n > 30 ? 1.645 : this._getTValue(n - 1, 0.90),
      0.95: n > 30 ? 1.960 : this._getTValue(n - 1, 0.95),
      0.99: n > 30 ? 2.576 : this._getTValue(n - 1, 0.99)
    };
    
    const tValue = tValues[confidence] || tValues[0.95];
    const marginOfError = tValue * (stdDev / Math.sqrt(n));
    
    return {
      mean: mean,
      lower: mean - marginOfError,
      upper: mean + marginOfError,
      marginOfError: marginOfError,
      confidence: confidence
    };
  },
  
  /**
   * Remove outliers usando método IQR (Interquartile Range)
   */
  removeOutliers(array, method = 'iqr', multiplier = 1.5) {
    if (!Array.isArray(array) || array.length < 4) return array;
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v)).sort((a, b) => a - b);
    
    if (method === 'iqr') {
      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      
      const q1 = values[q1Index];
      const q3 = values[q3Index];
      const iqr = q3 - q1;
      
      const lowerBound = q1 - (multiplier * iqr);
      const upperBound = q3 + (multiplier * iqr);
      
      return values.filter(v => v >= lowerBound && v <= upperBound);
    }
    
    if (method === 'zscore') {
      const mean = this.mean(values);
      const stdDev = this.stdDev(values);
      
      return values.filter(v => Math.abs((v - mean) / stdDev) <= multiplier);
    }
    
    return values;
  },
  
  /**
   * Detecta outliers e retorna informações
   */
  detectOutliers(array, method = 'iqr', multiplier = 1.5) {
    if (!Array.isArray(array) || array.length < 4) {
      return { outliers: [], clean: array, indices: [] };
    }
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v));
    const sorted = [...values].sort((a, b) => a - b);
    
    let lowerBound, upperBound;
    
    if (method === 'iqr') {
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;
      
      lowerBound = q1 - (multiplier * iqr);
      upperBound = q3 + (multiplier * iqr);
    } else if (method === 'zscore') {
      const mean = this.mean(values);
      const stdDev = this.stdDev(values);
      
      lowerBound = mean - (multiplier * stdDev);
      upperBound = mean + (multiplier * stdDev);
    }
    
    const outliers = [];
    const clean = [];
    const indices = [];
    
    values.forEach((v, i) => {
      if (v < lowerBound || v > upperBound) {
        outliers.push(v);
        indices.push(i);
      } else {
        clean.push(v);
      }
    });
    
    return {
      outliers: outliers,
      clean: clean,
      indices: indices,
      bounds: { lower: lowerBound, upper: upperBound },
      method: method
    };
  },
  
  /**
   * Normaliza valor para escala 0-100 (ou customizada)
   */
  normalize(value, min, max, targetMin = 0, targetMax = 100) {
    if (max === min) return targetMin;
    
    const normalized = ((value - min) / (max - min)) * (targetMax - targetMin) + targetMin;
    
    return Math.max(targetMin, Math.min(targetMax, normalized));
  },
  
  /**
   * Calcula Z-score (quantos desvios padrão da média)
   */
  zScore(value, mean, stdDev) {
    if (stdDev === 0) return null;
    return (value - mean) / stdDev;
  },
  
  /**
   * Calcula percentil
   */
  percentile(array, p) {
    if (!Array.isArray(array) || array.length === 0) return null;
    if (p < 0 || p > 100) return null;
    
    const values = array.filter(v => this._isNumeric(v)).map(v => Number(v)).sort((a, b) => a - b);
    
    if (values.length === 0) return null;
    
    const index = (p / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) return values[lower];
    
    return values[lower] * (1 - weight) + values[upper] * weight;
  },
  
  /**
   * Calcula correlação de Pearson entre dois arrays
   */
  pearsonCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return null;
    }
    
    const xValues = x.filter((v, i) => this._isNumeric(v) && this._isNumeric(y[i])).map(v => Number(v));
    const yValues = y.filter((v, i) => this._isNumeric(x[i]) && this._isNumeric(v)).map(v => Number(v));
    
    if (xValues.length < 2) return null;
    
    const n = xValues.length;
    const meanX = this.mean(xValues);
    const meanY = this.mean(yValues);
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = xValues[i] - meanX;
      const dy = yValues[i] - meanY;
      
      numerator += dx * dy;
      sumXSquared += dx * dx;
      sumYSquared += dy * dy;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    
    if (denominator === 0) return null;
    
    return numerator / denominator;
  },
  
  /**
   * Calcula correlação de Spearman (baseada em ranks)
   */
  spearmanCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return null;
    }
    
    const rankX = this._rankArray(x);
    const rankY = this._rankArray(y);
    
    return this.pearsonCorrelation(rankX, rankY);
  },
  
  /**
   * Regressão linear simples: y = a + bx
   */
  linearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return null;
    }
    
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      numerator += dx * (y[i] - meanY);
      denominator += dx * dx;
    }
    
    if (denominator === 0) return null;
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calcula R²
    const yPredicted = x.map(xi => intercept + slope * xi);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const rSquared = ssTot === 0 ? null : 1 - (ssRes / ssTot);
    
    return {
      slope: slope,
      intercept: intercept,
      rSquared: rSquared,
      predict: (xValue) => intercept + slope * xValue
    };
  },
  
  /**
   * Teste t de Student para duas amostras
   */
  tTest(sample1, sample2, paired = false) {
    if (!Array.isArray(sample1) || !Array.isArray(sample2)) return null;
    
    const values1 = sample1.filter(v => this._isNumeric(v)).map(v => Number(v));
    const values2 = sample2.filter(v => this._isNumeric(v)).map(v => Number(v));
    
    if (values1.length < 2 || values2.length < 2) return null;
    
    if (paired && values1.length !== values2.length) return null;
    
    const mean1 = this.mean(values1);
    const mean2 = this.mean(values2);
    const var1 = this.variance(values1, true);
    const var2 = this.variance(values2, true);
    const n1 = values1.length;
    const n2 = values2.length;
    
    let tStatistic, degreesOfFreedom;
    
    if (paired) {
      const differences = values1.map((v, i) => v - values2[i]);
      const meanDiff = this.mean(differences);
      const stdDevDiff = this.stdDev(differences, true);
      
      tStatistic = meanDiff / (stdDevDiff / Math.sqrt(n1));
      degreesOfFreedom = n1 - 1;
    } else {
      // Welch's t-test (não assume variâncias iguais)
      const pooledStdErr = Math.sqrt(var1 / n1 + var2 / n2);
      tStatistic = (mean1 - mean2) / pooledStdErr;
      
      // Welch-Satterthwaite degrees of freedom
      const numerator = Math.pow(var1 / n1 + var2 / n2, 2);
      const denominator = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
      degreesOfFreedom = numerator / denominator;
    }
    
    return {
      tStatistic: tStatistic,
      degreesOfFreedom: degreesOfFreedom,
      mean1: mean1,
      mean2: mean2,
      difference: mean1 - mean2,
      significant: Math.abs(tStatistic) > 2.0 // Aproximação para p < 0.05
    };
  },
  
  // ========== FUNÇÕES AUXILIARES PRIVADAS ==========
  
  _isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  _getTValue(df, confidence) {
    // Tabela simplificada t-Student (aproximação)
    const tTable = {
      0.90: [3.078, 1.886, 1.638, 1.533, 1.476, 1.440, 1.415, 1.397, 1.383, 1.372],
      0.95: [6.314, 2.920, 2.353, 2.132, 2.015, 1.943, 1.895, 1.860, 1.833, 1.812],
      0.99: [31.821, 6.965, 4.541, 3.747, 3.365, 3.143, 2.998, 2.896, 2.821, 2.764]
    };
    
    const values = tTable[confidence] || tTable[0.95];
    
    if (df <= 10) return values[df - 1];
    if (df <= 20) return values[9] - (df - 10) * 0.02;
    if (df <= 30) return values[9] - 0.2 - (df - 20) * 0.01;
    
    // Para df > 30, aproxima pela distribuição normal
    return confidence === 0.90 ? 1.645 : confidence === 0.95 ? 1.960 : 2.576;
  },
  
  _rankArray(array) {
    const indexed = array.map((v, i) => ({ value: v, index: i }));
    indexed.sort((a, b) => a.value - b.value);
    
    const ranks = new Array(array.length);
    
    for (let i = 0; i < indexed.length; i++) {
      let j = i;
      let sum = i + 1;
      let count = 1;
      
      // Handle ties
      while (j + 1 < indexed.length && indexed[j].value === indexed[j + 1].value) {
        j++;
        sum += j + 1;
        count++;
      }
      
      const avgRank = sum / count;
      
      for (let k = i; k <= j; k++) {
        ranks[indexed[k].index] = avgRank;
      }
      
      i = j;
    }
    
    return ranks;
  }
};
