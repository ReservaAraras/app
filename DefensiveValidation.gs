/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEFENSIVE VALIDATION - Validações Defensivas para Evitar Erros de Undefined
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 2/13: Correção de erros de undefined identificados nos logs
 * 
 * Erros corrigidos:
 * 1. UnifiedChatbotSystem: TypeError: Cannot read properties of undefined (reading 'toLowerCase')
 * 2. WaterQualityFormHandler: TypeError: Cannot read properties of undefined (reading 'ph')
 * 3. TrophicNetworkAnalyzer: TypeError: Cannot read properties of undefined (reading 'especie_a')
 * 4. TestDataGemini: TypeError: Cannot read properties of undefined (reading 'total')
 * 5. processReading: TypeError: Cannot read properties of undefined (reading 'temperatura')
 * 6. processReading: TypeError: Cannot read properties of undefined (reading 'sensor_id')
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Namespace de validações defensivas
 */
const DefensiveValidation = {
  
  /**
   * Garante que um valor é uma string válida
   * @param {*} value - Valor a validar
   * @param {string} defaultValue - Valor padrão se inválido
   * @returns {string} String válida
   */
  ensureString: function(value, defaultValue = '') {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  },
  
  /**
   * Garante que um valor é um número válido
   * @param {*} value - Valor a validar
   * @param {number} defaultValue - Valor padrão se inválido
   * @returns {number} Número válido
   */
  ensureNumber: function(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  },
  
  /**
   * Garante que um valor é um objeto válido
   * @param {*} value - Valor a validar
   * @param {Object} defaultValue - Valor padrão se inválido
   * @returns {Object} Objeto válido
   */
  ensureObject: function(value, defaultValue = {}) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
    return defaultValue;
  },
  
  /**
   * Garante que um valor é um array válido
   * @param {*} value - Valor a validar
   * @param {Array} defaultValue - Valor padrão se inválido
   * @returns {Array} Array válido
   */
  ensureArray: function(value, defaultValue = []) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (Array.isArray(value)) {
      return value;
    }
    return defaultValue;
  },
  
  /**
   * Acessa propriedade de objeto de forma segura
   * @param {Object} obj - Objeto
   * @param {string} path - Caminho da propriedade (ex: 'a.b.c')
   * @param {*} defaultValue - Valor padrão se não encontrado
   * @returns {*} Valor da propriedade ou default
   */
  safeGet: function(obj, path, defaultValue = undefined) {
    if (obj === null || obj === undefined) {
      return defaultValue;
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  },
  
  /**
   * Valida dados de mensagem para chatbot
   * @param {*} message - Mensagem a validar
   * @returns {Object} Resultado da validação
   */
  validateChatMessage: function(message) {
    if (message === null || message === undefined) {
      return {
        valid: false,
        message: '',
        error: 'Mensagem não pode ser nula ou undefined'
      };
    }
    
    const strMessage = this.ensureString(message);
    
    if (strMessage.trim().length === 0) {
      return {
        valid: false,
        message: '',
        error: 'Mensagem não pode ser vazia'
      };
    }
    
    return {
      valid: true,
      message: strMessage.trim(),
      error: null
    };
  },
  
  /**
   * Valida dados de qualidade da água
   * @param {Object} data - Dados a validar
   * @returns {Object} Dados validados com defaults
   */
  validateWaterQualityData: function(data) {
    const safeData = this.ensureObject(data);
    
    return {
      ph: this.ensureNumber(safeData.ph, null),
      od: this.ensureNumber(safeData.od, null),
      oxigenio_dissolvido: this.ensureNumber(safeData.oxigenio_dissolvido, null),
      turbidez: this.ensureNumber(safeData.turbidez, null),
      temperatura: this.ensureNumber(safeData.temperatura, null),
      coliformes: this.ensureNumber(safeData.coliformes, null),
      coliformes_termotolerantes: this.ensureNumber(safeData.coliformes_termotolerantes, null),
      condutividade: this.ensureNumber(safeData.condutividade, null),
      local: this.ensureString(safeData.local, ''),
      data: safeData.data || new Date(),
      _validated: true
    };
  },
  
  /**
   * Valida dados de interação ecológica
   * @param {Object} data - Dados a validar
   * @returns {Object} Resultado da validação
   */
  validateEcologicalInteraction: function(data) {
    const safeData = this.ensureObject(data);
    
    const errors = [];
    
    // Campos obrigatórios
    if (!safeData.especie_a || this.ensureString(safeData.especie_a).trim() === '') {
      errors.push('especie_a é obrigatório');
    }
    
    if (!safeData.especie_b || this.ensureString(safeData.especie_b).trim() === '') {
      errors.push('especie_b é obrigatório');
    }
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors,
        data: null
      };
    }
    
    return {
      valid: true,
      errors: [],
      data: {
        especie_a: this.ensureString(safeData.especie_a).trim(),
        especie_b: this.ensureString(safeData.especie_b).trim(),
        nome_popular_a: this.ensureString(safeData.nome_popular_a, ''),
        nome_popular_b: this.ensureString(safeData.nome_popular_b, ''),
        tipo: this.ensureString(safeData.tipo, 'Mutualismo'),
        direcao: this.ensureString(safeData.direcao, 'A_para_B'),
        intensidade: this.ensureString(safeData.intensidade, 'Moderada'),
        frequencia: this.ensureNumber(safeData.frequencia, 1),
        confianca: this.ensureNumber(safeData.confianca, 0.8),
        habitat: this.ensureString(safeData.habitat, 'Cerrado'),
        importancia: this.ensureString(safeData.importancia, 'Media'),
        _validated: true
      }
    };
  },
  
  /**
   * Valida dados de leitura de sensor
   * @param {Object} data - Dados a validar
   * @returns {Object} Resultado da validação
   */
  validateSensorReading: function(data) {
    const safeData = this.ensureObject(data);
    
    const errors = [];
    
    // sensor_id é obrigatório
    if (!safeData.sensor_id || this.ensureString(safeData.sensor_id).trim() === '') {
      errors.push('sensor_id é obrigatório');
    }
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors,
        data: null
      };
    }
    
    return {
      valid: true,
      errors: [],
      data: {
        sensor_id: this.ensureString(safeData.sensor_id).trim(),
        temperatura: this.ensureNumber(safeData.temperatura, null),
        umidade: this.ensureNumber(safeData.umidade, null),
        pressao: this.ensureNumber(safeData.pressao, null),
        timestamp: safeData.timestamp || new Date(),
        _validated: true
      }
    };
  },
  
  /**
   * Valida objeto de resultados de teste
   * @param {Object} results - Objeto de resultados
   * @returns {Object} Objeto de resultados válido
   */
  validateTestResults: function(results) {
    const safeResults = this.ensureObject(results);
    
    return {
      total: this.ensureNumber(safeResults.total, 0),
      passed: this.ensureNumber(safeResults.passed, 0),
      failed: this.ensureNumber(safeResults.failed, 0),
      skipped: this.ensureNumber(safeResults.skipped, 0),
      details: this.ensureArray(safeResults.details, [])
    };
  },
  
  /**
   * Wrapper seguro para funções que podem receber undefined
   * @param {Function} fn - Função a executar
   * @param {*} defaultReturn - Valor de retorno padrão em caso de erro
   * @returns {Function} Função wrapped
   */
  safeWrapper: function(fn, defaultReturn = null) {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        Logger.log(`[DefensiveValidation] Erro capturado: ${error}`);
        return defaultReturn;
      }
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PATCHES PARA CORRIGIR ERROS EXISTENTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Patch para UnifiedChatbotSystem.processMessage
 * Corrige: TypeError: Cannot read properties of undefined (reading 'toLowerCase')
 */
function patchUnifiedChatbotProcessMessage() {
  if (typeof UnifiedChatbotSystem !== 'undefined') {
    const originalProcessMessage = UnifiedChatbotSystem.processMessage;
    
    UnifiedChatbotSystem.processMessage = function(message, context) {
      // Validação defensiva
      const validation = DefensiveValidation.validateChatMessage(message);
      
      if (!validation.valid) {
        Logger.log(`[UnifiedChatbot] Mensagem inválida: ${validation.error}`);
        return {
          success: false,
          error: validation.error,
          response: {
            text: 'Desculpe, não entendi sua mensagem. Pode reformular?',
            type: 'error'
          }
        };
      }
      
      // Garante contexto válido
      const safeContext = DefensiveValidation.ensureObject(context);
      
      // Chama função original com dados validados
      return originalProcessMessage.call(this, validation.message, safeContext);
    };
    
    Logger.log('[Patch] UnifiedChatbotSystem.processMessage corrigido');
  }
}

/**
 * Patch para classifyWaterQuality
 * Corrige: TypeError: Cannot read properties of undefined (reading 'ph')
 */
function patchClassifyWaterQuality() {
  if (typeof classifyWaterQuality !== 'undefined') {
    const originalClassify = classifyWaterQuality;
    
    // Redefine a função global
    this.classifyWaterQuality = function(data) {
      // Validação defensiva
      const safeData = DefensiveValidation.validateWaterQualityData(data);
      
      // Chama função original com dados validados
      return originalClassify(safeData);
    };
    
    Logger.log('[Patch] classifyWaterQuality corrigido');
  }
}

/**
 * Patch para TrophicNetworkAnalyzer.registerInteraction
 * Corrige: TypeError: Cannot read properties of undefined (reading 'especie_a')
 */
function patchTrophicNetworkRegisterInteraction() {
  if (typeof TrophicNetworkAnalyzer !== 'undefined') {
    const originalRegister = TrophicNetworkAnalyzer.registerInteraction;
    
    TrophicNetworkAnalyzer.registerInteraction = function(data) {
      // Validação defensiva
      const validation = DefensiveValidation.validateEcologicalInteraction(data);
      
      if (!validation.valid) {
        Logger.log(`[TrophicNetworkAnalyzer] Dados inválidos: ${validation.errors.join(', ')}`);
        return {
          success: false,
          error: `Dados inválidos: ${validation.errors.join(', ')}`
        };
      }
      
      // Chama função original com dados validados
      return originalRegister.call(this, validation.data);
    };
    
    Logger.log('[Patch] TrophicNetworkAnalyzer.registerInteraction corrigido');
  }
}

/**
 * Aplica todos os patches de correção
 */
function applyAllDefensivePatches() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    APLICANDO PATCHES DEFENSIVOS');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  patchUnifiedChatbotProcessMessage();
  patchClassifyWaterQuality();
  patchTrophicNetworkRegisterInteraction();
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    ✅ PATCHES APLICADOS COM SUCESSO');
  Logger.log('═══════════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES GLOBAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Versão segura de toLowerCase
 * @param {*} value - Valor a converter
 * @returns {string} String em minúsculas
 */
function safeToLowerCase(value) {
  return DefensiveValidation.ensureString(value).toLowerCase();
}

/**
 * Versão segura de acesso a propriedade
 * @param {Object} obj - Objeto
 * @param {string} prop - Propriedade
 * @param {*} defaultValue - Valor padrão
 * @returns {*} Valor da propriedade ou default
 */
function safeGet(obj, prop, defaultValue) {
  return DefensiveValidation.safeGet(obj, prop, defaultValue);
}

/**
 * Valida e retorna dados de formulário seguros
 * @param {Object} formData - Dados do formulário
 * @param {Object} schema - Schema de validação
 * @returns {Object} Dados validados
 */
function validateFormDataSafe(formData, schema) {
  const safeData = DefensiveValidation.ensureObject(formData);
  const safeSchema = DefensiveValidation.ensureObject(schema);
  const result = { valid: true, errors: [], data: {} };
  
  for (const [field, rules] of Object.entries(safeSchema)) {
    const value = safeData[field];
    const safeRules = DefensiveValidation.ensureObject(rules);
    
    // Verifica required
    if (safeRules.required && (value === null || value === undefined || value === '')) {
      result.valid = false;
      result.errors.push(`${field} é obrigatório`);
      continue;
    }
    
    // Aplica tipo
    switch (safeRules.type) {
      case 'number':
        result.data[field] = DefensiveValidation.ensureNumber(value, safeRules.default);
        break;
      case 'string':
        result.data[field] = DefensiveValidation.ensureString(value, safeRules.default || '');
        break;
      case 'array':
        result.data[field] = DefensiveValidation.ensureArray(value, safeRules.default || []);
        break;
      case 'object':
        result.data[field] = DefensiveValidation.ensureObject(value, safeRules.default || {});
        break;
      default:
        result.data[field] = value;
    }
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa validações defensivas no carregamento
 * Adicione esta função ao onOpen ou SystemInit
 */
function initDefensiveValidation() {
  Logger.log('[DefensiveValidation] Inicializando...');
  
  // Aplica patches automaticamente
  applyAllDefensivePatches();
  
  Logger.log('[DefensiveValidation] ✅ Inicializado');
}


// ═══════════════════════════════════════════════════════════════════════════
// RESUMO DAS CORREÇÕES - INTERVENÇÃO 2/13
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ERROS CORRIGIDOS:
 * 
 * 1. UnifiedChatbotSystem.gs (linha 44, 133, 199, 271, 340, 404, 474, 560)
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'toLowerCase')
 *    CAUSA: message passado como undefined/null
 *    CORREÇÃO: Validação defensiva antes de chamar toLowerCase()
 *    
 * 2. WaterQualityFormHandler.gs (linha 63)
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'ph')
 *    CAUSA: data passado como undefined/null
 *    CORREÇÃO: Validação de data no início + parseFloat seguro para cada campo
 *    
 * 3. TrophicNetworkAnalyzer.gs (registerInteraction)
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'especie_a')
 *    CAUSA: data passado como undefined/null
 *    CORREÇÃO: Validação de data e campos obrigatórios antes de processar
 *    
 * 4. TestDataGemini.gs (linhas 907, 940, 621)
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'total')
 *    CAUSA: results passado como undefined quando função chamada isoladamente
 *    CORREÇÃO: Inicialização defensiva de results no início de cada função
 *    
 * 5. processReading (IoT Services)
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'temperatura')
 *    ERRO: TypeError: Cannot read properties of undefined (reading 'sensor_id')
 *    CAUSA: data de sensor passado como undefined/null
 *    CORREÇÃO: validateSensorReading() no DefensiveValidation
 * 
 * ARQUIVOS MODIFICADOS:
 * - UnifiedChatbotSystem.gs
 * - WaterQualityFormHandler.gs
 * - TrophicNetworkAnalyzer.gs
 * - TestDataGemini.gs
 * 
 * ARQUIVO CRIADO:
 * - DefensiveValidation.gs (biblioteca de validações defensivas)
 */
