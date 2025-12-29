/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE METRICS - Sistema de Metricas e Performance Monitoring
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Coleta de metricas de performance
 * - Contadores e gauges
 * - Histogramas de latencia
 * - Taxa de erro e sucesso
 * - Metricas de negocio customizadas
 * - Dashboards e alertas
 * 
 * @version 1.0.0
 * @enterprise
 */

const EnterpriseMetrics = (function() {
  'use strict';
  
  // ═════════════════════════════════════════════════════════════════════════
  // STORAGE DE METRICAS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const metrics = {
    counters: {},
    gauges: {},
    histograms: {},
    timers: {}
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COUNTER - Contador incremental
  // ═══════════════════════════════════════════════════════════════════════════
  
  function Counter(name, labels) {
    this.name = name;
    this.labels = labels || {};
    this.value = 0;
    this.createdAt = Date.now();
  }
  
  Counter.prototype.increment = function(amount) {
    this.value += (amount || 1);
    return this.value;
  };
  
  Counter.prototype.reset = function() {
    this.value = 0;
  };
  
  Counter.prototype.getValue = function() {
    return {
      name: this.name,
      type: 'counter',
      value: this.value,
      labels: this.labels,
      updatedAt: Date.now()
    };
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GAUGE - Valor que pode subir ou descer
  // ═══════════════════════════════════════════════════════════════════════════
  
  function Gauge(name, labels) {
    this.name = name;
    this.labels = labels || {};
    this.value = 0;
    this.min = Infinity;
    this.max = -Infinity;
  }
  
  Gauge.prototype.set = function(value) {
    this.value = value;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
  };
  
  Gauge.prototype.increment = function(amount) {
    this.set(this.value + (amount || 1));
  };
  
  Gauge.prototype.decrement = function(amount) {
    this.set(this.value - (amount || 1));
  };
  
  Gauge.prototype.getValue = function() {
    return {
      name: this.name,
      type: 'gauge',
      value: this.value,
      min: this.min === Infinity ? 0 : this.min,
      max: this.max === -Infinity ? 0 : this.max,
      labels: this.labels,
      updatedAt: Date.now()
    };
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HISTOGRAM - Distribuicao de valores
  // ═══════════════════════════════════════════════════════════════════════════
  
  function Histogram(name, labels, buckets) {
    this.name = name;
    this.labels = labels || {};
    this.buckets = buckets || [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    this.counts = {};
    this.sum = 0;
    this.count = 0;
    this.min = Infinity;
    this.max = -Infinity;
    
    // Inicializa buckets
    this.buckets.forEach(function(bucket) {
      this.counts[bucket] = 0;
    }, this);
    this.counts['Inf'] = 0;
  }
  
  Histogram.prototype.observe = function(value) {
    this.sum += value;
    this.count++;
    
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
    
    // Incrementa buckets apropriados
    for (var i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        this.counts[this.buckets[i]]++;
        return;
      }
    }
    this.counts['Inf']++;
  };
  
  Histogram.prototype.getValue = function() {
    const avg = this.count > 0 ? this.sum / this.count : 0;
    
    return {
      name: this.name,
      type: 'histogram',
      count: this.count,
      sum: this.sum,
      avg: avg,
      min: this.min === Infinity ? 0 : this.min,
      max: this.max === -Infinity ? 0 : this.max,
      buckets: this.counts,
      labels: this.labels,
      updatedAt: Date.now()
    };
  };
  
  Histogram.prototype.getPercentile = function(p) {
    if (this.count === 0) return 0;
    
    const targetCount = Math.ceil(this.count * p / 100);
    let accumulatedCount = 0;
    
    for (var i = 0; i < this.buckets.length; i++) {
      accumulatedCount += this.counts[this.buckets[i]];
      if (accumulatedCount >= targetCount) {
        return this.buckets[i];
      }
    }
    
    return this.max;
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER - Medidor de tempo de execucao
  // ═══════════════════════════════════════════════════════════════════════════
  
  function Timer(name) {
    this.name = name;
    this.startTime = Date.now();
  }
  
  Timer.prototype.stop = function() {
    const duration = Date.now() - this.startTime;
    
    // Registra em histogram
    const histogram = getOrCreateHistogram(this.name);
    histogram.observe(duration);
    
    return duration;
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCOES DE ACESSO
  // ═══════════════════════════════════════════════════════════════════════════
  
  function getMetricKey(name, labels) {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    
    const labelStr = Object.keys(labels)
      .sort()
      .map(function(key) { return key + '=' + labels[key]; })
      .join(',');
    
    return name + '{' + labelStr + '}';
  }
  
  function getOrCreateCounter(name, labels) {
    const key = getMetricKey(name, labels);
    if (!metrics.counters[key]) {
      metrics.counters[key] = new Counter(name, labels);
    }
    return metrics.counters[key];
  }
  
  function getOrCreateGauge(name, labels) {
    const key = getMetricKey(name, labels);
    if (!metrics.gauges[key]) {
      metrics.gauges[key] = new Gauge(name, labels);
    }
    return metrics.gauges[key];
  }
  
  function getOrCreateHistogram(name, labels, buckets) {
    const key = getMetricKey(name, labels);
    if (!metrics.histograms[key]) {
      metrics.histograms[key] = new Histogram(name, labels, buckets);
    }
    return metrics.histograms[key];
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // API PUBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    
    /**
     * Incrementa contador
     * @param {string} name - Nome da metrica
     * @param {number} amount - Valor a incrementar
     * @param {Object} labels - Labels
     */
    incrementCounter: function(name, amount, labels) {
      const counter = getOrCreateCounter(name, labels);
      return counter.increment(amount);
    },
    
    /**
     * Define valor de gauge
     * @param {string} name - Nome da metrica
     * @param {number} value - Valor
     * @param {Object} labels - Labels
     */
    setGauge: function(name, value, labels) {
      const gauge = getOrCreateGauge(name, labels);
      gauge.set(value);
    },
    
    /**
     * Registra observacao em histogram
     * @param {string} name - Nome da metrica
     * @param {number} value - Valor observado
     * @param {Object} labels - Labels
     */
    observeHistogram: function(name, value, labels) {
      const histogram = getOrCreateHistogram(name, labels);
      histogram.observe(value);
    },
    
    /**
     * Inicia timer
     * @param {string} name - Nome da metrica
     * @returns {Timer}
     */
    startTimer: function(name) {
      const timer = new Timer(name);
      metrics.timers[name + '_' + Date.now()] = timer;
      return timer;
    },
    
    /**
     * Mede tempo de execucao de funcao
     * @param {string} name - Nome da metrica
     * @param {Function} fn - Funcao a medir
     * @returns {*} Resultado da funcao
     */
    measureTime: function(name, fn) {
      const timer = this.startTimer(name);
      try {
        return fn();
      } finally {
        const duration = timer.stop();
        if (typeof EnterpriseLogger !== 'undefined') {
          EnterpriseLogger.debug('Performance: ' + name, {
            durationMs: duration
          });
        }
      }
    },
    
    /**
     * Obtem todas as metricas
     * @returns {Object}
     */
    getAllMetrics: function() {
      const result = {
        counters: {},
        gauges: {},
        histograms: {},
        timestamp: new Date().toISOString()
      };
      
      Object.keys(metrics.counters).forEach(function(key) {
        result.counters[key] = metrics.counters[key].getValue();
      });
      
      Object.keys(metrics.gauges).forEach(function(key) {
        result.gauges[key] = metrics.gauges[key].getValue();
      });
      
      Object.keys(metrics.histograms).forEach(function(key) {
        result.histograms[key] = metrics.histograms[key].getValue();
      });
      
      return result;
    },
    
    /**
     * Obtem metrica especifica
     * @param {string} name - Nome da metrica
     * @returns {Object}
     */
    getMetric: function(name) {
      // Busca em todos os tipos
      if (metrics.counters[name]) {
        return metrics.counters[name].getValue();
      }
      if (metrics.gauges[name]) {
        return metrics.gauges[name].getValue();
      }
      if (metrics.histograms[name]) {
        return metrics.histograms[name].getValue();
      }
      
      return null;
    },
    
    /**
     * Reseta todas as metricas
     */
    resetAll: function() {
      metrics.counters = {};
      metrics.gauges = {};
      metrics.histograms = {};
      metrics.timers = {};
    },
    
    /**
     * Gera relatorio de metricas
     * @returns {string}
     */
    generateReport: function() {
      const all = this.getAllMetrics();
      const lines = [];
      
      lines.push('═══════════════════════════════════════════════════════');
      lines.push('RELATORIO DE METRICAS - ' + all.timestamp);
      lines.push('═══════════════════════════════════════════════════════\n');
      
      // Counters
      if (Object.keys(all.counters).length > 0) {
        lines.push('COUNTERS:');
        Object.keys(all.counters).forEach(function(key) {
          const m = all.counters[key];
          lines.push('  ' + m.name + ': ' + m.value);
        });
        lines.push('');
      }
      
      // Gauges
      if (Object.keys(all.gauges).length > 0) {
        lines.push('GAUGES:');
        Object.keys(all.gauges).forEach(function(key) {
          const m = all.gauges[key];
          lines.push('  ' + m.name + ': ' + m.value + ' (min: ' + m.min + ', max: ' + m.max + ')');
        });
        lines.push('');
      }
      
      // Histograms
      if (Object.keys(all.histograms).length > 0) {
        lines.push('HISTOGRAMS (Latencia em ms):');
        Object.keys(all.histograms).forEach(function(key) {
          const m = all.histograms[key];
          lines.push('  ' + m.name + ':');
          lines.push('    Count: ' + m.count);
          lines.push('    Avg: ' + m.avg.toFixed(2) + 'ms');
          lines.push('    Min: ' + m.min + 'ms');
          lines.push('    Max: ' + m.max + 'ms');
        });
        lines.push('');
      }
      
      lines.push('═══════════════════════════════════════════════════════');
      
      return lines.join('\n');
    },
    
    /**
     * Log do relatorio
     */
    logReport: function() {
      Logger.log(this.generateReport());
    }
  };
  
})();

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE USO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemplo 1: Contadores
 */
function exemploContadores() {
  EnterpriseMetrics.incrementCounter('requests_total', 1, { endpoint: '/api/data' });
  EnterpriseMetrics.incrementCounter('requests_total', 1, { endpoint: '/api/users' });
  EnterpriseMetrics.incrementCounter('errors_total', 1, { type: 'validation' });
}

/**
 * Exemplo 2: Medicao de tempo
 */
function exemploMedicaoTempo() {
  return EnterpriseMetrics.measureTime('database_query', function() {
    // Simula query
    Utilities.sleep(150);
    return { rows: 42 };
  });
}

/**
 * Exemplo 3: Relatorio
 */
function exemploRelatorio() {
  // Gera algumas metricas
  exemploContadores();
  exemploMedicaoTempo();
  
  // Exibe relatorio
  EnterpriseMetrics.logReport();
}
