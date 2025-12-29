/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROFESSIONAL UTILITIES - RESERVA ARARAS
 * ═══════════════════════════════════════════════════════════════════════════
 * Utilitários profissionais para Google Apps Script
 * @version 2.0.0
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING & LOGGING
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ErrorHandler = {
  /**
   * Wrapper para funções com tratamento de erro
   */
  wrap(fn, context = 'Operação') {
    return function(...args) {
      try {
        const result = fn.apply(this, args);
        Logger.log(`✓ ${context} executada com sucesso`);
        return { success: true, data: result };
      } catch (error) {
        Logger.log(`✗ Erro em ${context}: ${error.message}`);
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    };
  },
  
  /**
   * Retry com backoff exponencial
   */
  retry(fn, maxAttempts = 3, delay = 1000) {
    let attempt = 0;
    
    while (attempt < maxAttempts) {
      try {
        return fn();
      } catch (error) {
        attempt++;
        if (attempt >= maxAttempts) throw error;
        
        Logger.log(`Tentativa ${attempt} falhou, aguardando ${delay}ms...`);
        Utilities.sleep(delay);
        delay *= 2; // Backoff exponencial
      }
    }
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Validator = {
  /**
   * Valida dados com regras
   */
  validate(data, rules) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      // Required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = rule.message || 'Campo obrigatório';
        continue;
      }
      
      // Type
      if (rule.type && typeof value !== rule.type) {
        errors[field] = `Deve ser do tipo ${rule.type}`;
        continue;
      }
      
      // Min/Max
      if (rule.min !== undefined && value < rule.min) {
        errors[field] = `Valor mínimo: ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[field] = `Valor máximo: ${rule.max}`;
      }
      
      // Pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || 'Formato inválido';
      }
      
      // Custom validator
      if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message || 'Valor inválido';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },
  
  /**
   * Validadores comuns
   */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  phone: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  
  /**
   * Sanitiza string
   */
  sanitize(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CACHE MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTA: CacheManager está definido em CacheManager.gs
 * Use aquele arquivo para gerenciamento de cache
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERFORMANCE MONITOR
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Performance = {
  timers: {},
  
  /**
   * Inicia timer
   */
  start(label) {
    this.timers[label] = new Date().getTime();
  },
  
  /**
   * Finaliza e loga timer
   */
  end(label) {
    if (!this.timers[label]) return;
    
    const duration = new Date().getTime() - this.timers[label];
    Logger.log(`⏱ ${label}: ${duration}ms`);
    delete this.timers[label];
    
    return duration;
  },
  
  /**
   * Wrapper para medir performance
   */
  measure(fn, label) {
    return function(...args) {
      Performance.start(label);
      const result = fn.apply(this, args);
      Performance.end(label);
      return result;
    };
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RATE LIMITER
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RateLimiter = {
  /**
   * Limita chamadas por tempo
   */
  limit(fn, maxCalls = 10, windowMs = 60000) {
    const calls = [];
    
    return function(...args) {
      const now = Date.now();
      
      // Remove chamadas antigas
      while (calls.length > 0 && calls[0] < now - windowMs) {
        calls.shift();
      }
      
      // Verifica limite
      if (calls.length >= maxCalls) {
        throw new Error('Rate limit excedido. Tente novamente em alguns segundos.');
      }
      
      calls.push(now);
      return fn.apply(this, args);
    };
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BATCH PROCESSOR
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BatchProcessor = {
  /**
   * Processa array em lotes
   */
  process(items, processFn, batchSize = 100, delayMs = 100) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = batch.map(processFn);
      results.push(...batchResults);
      
      // Pausa entre lotes
      if (i + batchSize < items.length) {
        Utilities.sleep(delayMs);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATE UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DateUtils = {
  /**
   * Formata data para pt-BR
   */
  format(date, includeTime = false) {
    if (!(date instanceof Date)) date = new Date(date);
    
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleString('pt-BR', options);
  },
  
  /**
   * Adiciona dias
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  /**
   * Diferença em dias
   */
  diffDays(date1, date2) {
    const diff = Math.abs(date1 - date2);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STRING UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 */

const StringUtils = {
  /**
   * Capitaliza primeira letra
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  /**
   * Slug para URLs
   */
  slugify(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  },
  
  /**
   * Trunca texto
   */
  truncate(str, maxLength = 50, suffix = '...') {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ExportUtils = {
  /**
   * Converte para CSV
   */
  toCSV(data, headers = null) {
    if (!data || data.length === 0) return '';
    
    const keys = headers || Object.keys(data[0]);
    const rows = [keys.join(',')];
    
    data.forEach(row => {
      const values = keys.map(key => {
        const value = row[key] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      rows.push(values.join(','));
    });
    
    return rows.join('\n');
  },
  
  /**
   * Cria arquivo no Drive
   */
  createFile(content, filename, mimeType = 'text/plain') {
    const blob = Utilities.newBlob(content, mimeType, filename);
    const file = DriveApp.createFile(blob);
    return {
      id: file.getId(),
      url: file.getUrl(),
      name: file.getName()
    };
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXEMPLO DE USO
 * ═══════════════════════════════════════════════════════════════════════════
 */

function exemploUsoUtilitarios() {
  // 1. Error Handling
  const safeFn = ErrorHandler.wrap(function() {
    // Sua lógica aqui
    return 'Sucesso!';
  }, 'Minha Operação');
  
  const result = safeFn();
  Logger.log(result);
  
  // 2. Validation
  const validation = Validator.validate(
    { email: 'teste@email.com', idade: 25 },
    {
      email: { required: true, pattern: Validator.email },
      idade: { required: true, type: 'number', min: 18 }
    }
  );
  
  if (!validation.isValid) {
    Logger.log('Erros:', validation.errors);
  }
  
  // 3. Cache
  const dados = CacheManager.get('meus-dados', () => {
    // Função pesada que busca dados
    return { resultado: 'Dados importantes' };
  }, 600);
  
  // 4. Performance
  Performance.start('operacao-pesada');
  // ... código ...
  Performance.end('operacao-pesada');
  
  // 5. Batch Processing
  const items = Array.from({length: 1000}, (_, i) => i);
  const results = BatchProcessor.process(items, item => item * 2, 100);
  
  Logger.log('Processados:', results.length);
}
