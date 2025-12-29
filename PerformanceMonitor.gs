/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERFORMANCE MONITOR - Monitora tempo de execução
 * ═══════════════════════════════════════════════════════════════════════════
 * Detecta operações lentas e ajuda a otimizar o projeto
 * 
 * @version 1.0.0
 * @date 2025-11-06
 */

const PerformanceMonitor = {
  
  // Limites de tempo (em ms)
  THRESHOLDS: {
    FAST: 100,
    NORMAL: 1000,
    SLOW: 3000,
    CRITICAL: 6000
  },
  
  // Flag para habilitar/desabilitar monitoramento
  _enabled: false,
  
  /**
   * Habilita/desabilita monitoramento
   */
  setEnabled(enabled) {
    this._enabled = enabled;
  },
  
  /**
   * Executa função e mede tempo (OTIMIZADO)
   */
  measure(name, fn) {
    // Se desabilitado, executa direto sem overhead
    if (!this._enabled) {
      return fn();
    }
    
    const start = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - start;
      
      // Só loga se muito lento
      if (duration > this.THRESHOLDS.SLOW) {
        Logger.log(`⚠️ Lento: ${name} ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Wrapper para APIs (SIMPLIFICADO)
   */
  wrapAPI(name, fn) {
    if (!this._enabled) return fn;
    return (...args) => this.measure(name, () => fn(...args));
  },
  
  /**
   * Log de performance simplificado
   */
  _logPerformance(name, duration) {
    if (duration > this.THRESHOLDS.SLOW) {
      Logger.log(`⚠️ ${name}: ${duration}ms`);
    }
  },
  
  /**
   * Salva log apenas para operações críticas
   */
  _savePerformanceLog(name, duration) {
    // Desabilitado por padrão para reduzir carga
    if (!this._enabled) return;
    
    try {
      const sheet = getSheet('PerformanceLogs');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp', 'Operação', 'Duração (ms)']);
      }
      sheet.appendRow([new Date(), name, duration]);
      
      // Limpa logs antigos
      if (sheet.getLastRow() > 500) {
        sheet.deleteRow(2);
      }
    } catch (e) {
      // Silencioso
    }
  },
  
  /**
   * Obtém estatísticas de performance
   */
  getStats(hours = 24) {
    try {
      const sheet = getSheet('PerformanceLogs');
      
      if (sheet.getLastRow() <= 1) {
        return { message: 'Nenhum dado de performance disponível' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      // Filtra últimas X horas
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      const recentRows = rows.filter(row => new Date(row[0]) > cutoff);
      
      if (recentRows.length === 0) {
        return { message: `Nenhum dado nas últimas ${hours} horas` };
      }
      
      // Calcula estatísticas
      const durations = recentRows.map(row => row[2]);
      const operations = {};
      
      recentRows.forEach(row => {
        const op = row[1];
        if (!operations[op]) {
          operations[op] = { count: 0, total: 0, max: 0, min: Infinity };
        }
        operations[op].count++;
        operations[op].total += row[2];
        operations[op].max = Math.max(operations[op].max, row[2]);
        operations[op].min = Math.min(operations[op].min, row[2]);
      });
      
      // Calcula médias
      Object.keys(operations).forEach(op => {
        operations[op].avg = Math.round(operations[op].total / operations[op].count);
      });
      
      // Ordena por mais lento
      const sorted = Object.entries(operations)
        .sort((a, b) => b[1].avg - a[1].avg)
        .slice(0, 10);
      
      return {
        period: `Últimas ${hours} horas`,
        totalOperations: recentRows.length,
        slowestOperations: sorted.map(([name, stats]) => ({
          name,
          count: stats.count,
          avgDuration: stats.avg,
          maxDuration: stats.max,
          minDuration: stats.min
        }))
      };
    } catch (error) {
      Logger.log(`Erro ao obter stats: ${error}`);
      return { error: error.toString() };
    }
  },
  
  /**
   * Gera relatório de performance
   */
  generateReport() {
    const stats = this.getStats(24);
    
        Logger.log('RELATÓRIO DE PERFORMANCE (24 horas)');
        
    if (stats.error || stats.message) {
      Logger.log(stats.error || stats.message);
      return stats;
    }
    
    Logger.log(`\nTotal de operações: ${stats.totalOperations}`);
    Logger.log('\nOperações mais lentas:');
    
    stats.slowestOperations.forEach((op, i) => {
      Logger.log(`\n${i + 1}. ${op.name}`);
      Logger.log(`   Chamadas: ${op.count}`);
      Logger.log(`   Média: ${op.avgDuration}ms`);
      Logger.log(`   Máximo: ${op.maxDuration}ms`);
      Logger.log(`   Mínimo: ${op.minDuration}ms`);
    });
    
    Logger.log('\n═══════════════════════════════════════════════════════════');
    
    return stats;
  },
  
  /**
   * Benchmark de operação
   */
  benchmark(name, fn, iterations = 10) {
    Logger.log(`\n🔬 Benchmark: ${name} (${iterations} iterações)`);
    
    const durations = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = new Date().getTime();
      fn();
      const duration = new Date().getTime() - start;
      durations.push(duration);
    }
    
    const avg = durations.reduce((a, b) => a + b, 0) / iterations;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    Logger.log(`  Média: ${Math.round(avg)}ms`);
    Logger.log(`  Mínimo: ${min}ms`);
    Logger.log(`  Máximo: ${max}ms`);
    
    return { avg, min, max, durations };
  }
};

/**
 * Testa o monitor de performance
 */
function testarPerformanceMonitor() {
    Logger.log('TESTE DO PERFORMANCE MONITOR');
    
  // Teste 1: Operação rápida
  Logger.log('\n1. Operação rápida:');
  PerformanceMonitor.measure('operacao_rapida', () => {
    return 'resultado';
  });
  
  // Teste 2: Operação normal
  Logger.log('\n2. Operação normal:');
  PerformanceMonitor.measure('operacao_normal', () => {
    Utilities.sleep(500);
    return 'resultado';
  });
  
  // Teste 3: Operação lenta
  Logger.log('\n3. Operação lenta:');
  PerformanceMonitor.measure('operacao_lenta', () => {
    Utilities.sleep(2000);
    return 'resultado';
  });
  
  // Teste 4: Benchmark
  Logger.log('\n4. Benchmark:');
  PerformanceMonitor.benchmark('teste_benchmark', () => {
    const arr = [];
    for (let i = 0; i < 1000; i++) {
      arr.push(i);
    }
  }, 5);
  
  // Teste 5: Relatório
  Logger.log('\n5. Relatório de performance:');
  PerformanceMonitor.generateReport();
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('✅ TESTE CONCLUÍDO');
  }

/**
 * Mostra relatório via UI
 */
function mostrarRelatorioPerformance() {
  const stats = PerformanceMonitor.getStats(24);
  const ui = SpreadsheetApp.getUi();
  
  if (stats.error || stats.message) {
    ui.alert('Relatório de Performance', stats.error || stats.message, ui.ButtonSet.OK);
    return;
  }
  
  let message = `Período: ${stats.period}\n`;
  message += `Total de operações: ${stats.totalOperations}\n\n`;
  message += 'Top 5 operações mais lentas:\n\n';
  
  stats.slowestOperations.slice(0, 5).forEach((op, i) => {
    message += `${i + 1}. ${op.name}\n`;
    message += `   Média: ${op.avgDuration}ms (${op.count} chamadas)\n\n`;
  });
  
  ui.alert('📊 Relatório de Performance', message, ui.ButtonSet.OK);
}
