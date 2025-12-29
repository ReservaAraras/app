/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM VALIDATION RULES - Regras de Validação Centralizadas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 6/13: Validação e Testes Integrados
 * 
 * Este arquivo centraliza todas as regras de validação para formulários,
 * incluindo limites científicos (CONAMA, CETESB) e validações de negócio.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// LIMITES CIENTÍFICOS - QUALIDADE DA ÁGUA
// ═══════════════════════════════════════════════════════════════════════════

const WATER_QUALITY_LIMITS = {
  // CONAMA 357/2005 - Classe 2 (águas doces)
  CONAMA_357: {
    ph: { min: 6.0, max: 9.0, unit: '', warning: 'Fora dos limites CONAMA 357' },
    oxigenio_dissolvido: { min: 5.0, max: null, unit: 'mg/L', warning: 'Abaixo do mínimo CONAMA' },
    turbidez: { min: null, max: 100, unit: 'NTU', warning: 'Acima do limite CONAMA' },
    temperatura: { min: 0, max: 40, unit: '°C', warning: 'Temperatura atípica' },
    condutividade: { min: null, max: 500, unit: 'µS/cm', warning: 'Condutividade elevada' },
    fosforo_total: { min: null, max: 0.030, unit: 'mg/L', warning: 'Fósforo acima do limite' },
    nitrogenio_amoniacal: { min: null, max: 3.7, unit: 'mg/L', warning: 'Amônia elevada' },
    dbo: { min: null, max: 5, unit: 'mg/L', warning: 'DBO acima do limite' }
  },
  
  // Limites para alertas (não necessariamente regulatórios)
  ALERTS: {
    clorofila_a: { warning: 30, critical: 60, unit: 'µg/L', message: 'Possível bloom algal' },
    transparencia: { warning: 0.5, critical: 0.3, unit: 'm', message: 'Baixa transparência' }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LIMITES ECOLÓGICOS
// ═══════════════════════════════════════════════════════════════════════════

const ECOLOGICAL_LIMITS = {
  // Macrófitas
  MACROPHYTES: {
    cobertura_percentual: {
      low: 25,
      medium: 50,
      high: 75,
      critical: 90,
      warnings: {
        high: 'Cobertura alta - possível eutrofização',
        critical: 'Cobertura crítica - intervenção recomendada'
      }
    }
  },
  
  // Índices bióticos - Bentos
  BENTHIC_INDICES: {
    bmwp: {
      excellent: { min: 101, label: 'Excelente' },
      good: { min: 61, max: 100, label: 'Bom' },
      acceptable: { min: 36, max: 60, label: 'Aceitável' },
      doubtful: { min: 16, max: 35, label: 'Duvidoso' },
      critical: { min: 0, max: 15, label: 'Crítico' }
    },
    shannon: {
      high: { min: 3.0, label: 'Alta diversidade' },
      medium: { min: 2.0, max: 3.0, label: 'Média diversidade' },
      low: { min: 0, max: 2.0, label: 'Baixa diversidade' }
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDADORES DE CAMPOS
// ═══════════════════════════════════════════════════════════════════════════

const FieldValidators = {
  
  /**
   * Valida coordenadas geográficas
   */
  validateCoordinates: function(lat, lng) {
    var errors = [];
    
    if (lat !== null && lat !== '' && lat !== undefined) {
      var latNum = parseFloat(lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        errors.push('Latitude deve estar entre -90 e 90');
      }
    }
    
    if (lng !== null && lng !== '' && lng !== undefined) {
      var lngNum = parseFloat(lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.push('Longitude deve estar entre -180 e 180');
      }
    }
    
    return { valid: errors.length === 0, errors: errors };
  },
  
  /**
   * Valida data (não pode ser futura)
   */
  validateDate: function(dateStr, allowFuture) {
    allowFuture = allowFuture || false;
    
    if (!dateStr) {
      return { valid: false, errors: ['Data é obrigatória'] };
    }
    
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { valid: false, errors: ['Data inválida'] };
    }
    
    if (!allowFuture && date > new Date()) {
      return { valid: false, errors: ['Data não pode ser futura'] };
    }
    
    return { valid: true, errors: [] };
  },
  
  /**
   * Valida parâmetro numérico com limites
   */
  validateNumericParam: function(value, paramName, limits) {
    var result = { valid: true, errors: [], warnings: [] };
    
    if (value === null || value === '' || value === undefined) {
      return result; // Campo opcional vazio é válido
    }
    
    var num = parseFloat(value);
    if (isNaN(num)) {
      result.valid = false;
      result.errors.push(paramName + ' deve ser um número');
      return result;
    }
    
    if (limits) {
      if (limits.min !== null && limits.min !== undefined && num < limits.min) {
        result.warnings.push(limits.warning || paramName + ' abaixo do mínimo (' + limits.min + ')');
      }
      if (limits.max !== null && limits.max !== undefined && num > limits.max) {
        result.warnings.push(limits.warning || paramName + ' acima do máximo (' + limits.max + ')');
      }
    }
    
    return result;
  },
  
  /**
   * Valida parâmetros de qualidade da água
   */
  validateWaterQuality: function(data) {
    var result = { valid: true, errors: [], warnings: [], alerts: [] };
    var limits = WATER_QUALITY_LIMITS.CONAMA_357;
    
    // pH
    if (data.ph) {
      var phResult = this.validateNumericParam(data.ph, 'pH', limits.ph);
      result.warnings = result.warnings.concat(phResult.warnings);
    }
    
    // Oxigênio dissolvido
    if (data.oxigenio_dissolvido) {
      var odResult = this.validateNumericParam(data.oxigenio_dissolvido, 'OD', limits.oxigenio_dissolvido);
      result.warnings = result.warnings.concat(odResult.warnings);
      
      // Alerta crítico para OD muito baixo
      if (parseFloat(data.oxigenio_dissolvido) < 2) {
        result.alerts.push('⚠️ CRÍTICO: Oxigênio dissolvido muito baixo - possível mortandade de peixes');
      }
    }
    
    // Turbidez
    if (data.turbidez) {
      var turbResult = this.validateNumericParam(data.turbidez, 'Turbidez', limits.turbidez);
      result.warnings = result.warnings.concat(turbResult.warnings);
    }
    
    // Clorofila-a (alerta de bloom)
    if (data.clorofila_a) {
      var chlValue = parseFloat(data.clorofila_a);
      var chlLimits = WATER_QUALITY_LIMITS.ALERTS.clorofila_a;
      if (chlValue >= chlLimits.critical) {
        result.alerts.push('🚨 ALERTA: Possível bloom algal - clorofila-a = ' + chlValue + ' µg/L');
      } else if (chlValue >= chlLimits.warning) {
        result.warnings.push('Clorofila-a elevada - monitorar');
      }
    }
    
    return result;
  },
  
  /**
   * Valida cobertura de macrófitas
   */
  validateMacrophyteCoverage: function(coverage) {
    var result = { valid: true, errors: [], warnings: [], category: '' };
    var limits = ECOLOGICAL_LIMITS.MACROPHYTES.cobertura_percentual;
    
    var value = parseFloat(coverage);
    if (isNaN(value) || value < 0 || value > 100) {
      result.valid = false;
      result.errors.push('Cobertura deve estar entre 0 e 100%');
      return result;
    }
    
    if (value >= limits.critical) {
      result.category = 'critical';
      result.warnings.push(limits.warnings.critical);
    } else if (value >= limits.high) {
      result.category = 'high';
      result.warnings.push(limits.warnings.high);
    } else if (value >= limits.medium) {
      result.category = 'medium';
    } else {
      result.category = 'low';
    }
    
    return result;
  },
  
  /**
   * Classifica índice BMWP
   */
  classifyBMWP: function(bmwpValue) {
    var value = parseFloat(bmwpValue);
    if (isNaN(value)) return { class: 'unknown', label: 'Não avaliado' };
    
    var classes = ECOLOGICAL_LIMITS.BENTHIC_INDICES.bmwp;
    
    if (value >= classes.excellent.min) return { class: 'excellent', label: classes.excellent.label };
    if (value >= classes.good.min) return { class: 'good', label: classes.good.label };
    if (value >= classes.acceptable.min) return { class: 'acceptable', label: classes.acceptable.label };
    if (value >= classes.doubtful.min) return { class: 'doubtful', label: classes.doubtful.label };
    return { class: 'critical', label: classes.critical.label };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO COMPLETA DE FORMULÁRIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida formulário físico-químico completo
 * @param {Object} data - Dados do formulário
 * @returns {Object} - Resultado da validação
 */
function validatePhysicochemicalForm(data) {
  var result = {
    valid: true,
    errors: [],
    warnings: [],
    alerts: [],
    fieldErrors: {}
  };
  
  // Campos obrigatórios
  var required = ['data', 'local'];
  required.forEach(function(field) {
    if (!data[field]) {
      result.valid = false;
      result.errors.push('Campo obrigatório: ' + field);
      result.fieldErrors[field] = 'Campo obrigatório';
    }
  });
  
  // Validação de data
  var dateResult = FieldValidators.validateDate(data.data);
  if (!dateResult.valid) {
    result.valid = false;
    result.errors = result.errors.concat(dateResult.errors);
    result.fieldErrors.data = dateResult.errors[0];
  }
  
  // Validação de coordenadas
  var coordResult = FieldValidators.validateCoordinates(data.latitude, data.longitude);
  if (!coordResult.valid) {
    result.errors = result.errors.concat(coordResult.errors);
  }
  
  // Validação de qualidade da água
  var wqResult = FieldValidators.validateWaterQuality(data);
  result.warnings = result.warnings.concat(wqResult.warnings);
  result.alerts = result.alerts.concat(wqResult.alerts);
  
  return result;
}

/**
 * Valida formulário de macrófitas
 * @param {Object} data - Dados do formulário
 * @returns {Object} - Resultado da validação
 */
function validateMacrophytesForm(data) {
  var result = {
    valid: true,
    errors: [],
    warnings: [],
    alerts: [],
    fieldErrors: {},
    coverageCategory: ''
  };
  
  // Campos obrigatórios
  var required = ['data', 'local', 'tipo_macrofita', 'especie_predominante', 'cobertura_percentual'];
  required.forEach(function(field) {
    if (!data[field] && data[field] !== 0) {
      result.valid = false;
      result.errors.push('Campo obrigatório: ' + field);
      result.fieldErrors[field] = 'Campo obrigatório';
    }
  });
  
  // Validação de cobertura
  if (data.cobertura_percentual !== undefined) {
    var coverageResult = FieldValidators.validateMacrophyteCoverage(data.cobertura_percentual);
    if (!coverageResult.valid) {
      result.valid = false;
      result.errors = result.errors.concat(coverageResult.errors);
      result.fieldErrors.cobertura_percentual = coverageResult.errors[0];
    }
    result.warnings = result.warnings.concat(coverageResult.warnings);
    result.coverageCategory = coverageResult.category;
  }
  
  return result;
}

/**
 * Valida formulário de ictiofauna
 * @param {Object} data - Dados do formulário
 * @returns {Object} - Resultado da validação
 */
function validateIchthyofaunaForm(data) {
  var result = {
    valid: true,
    errors: [],
    warnings: [],
    fieldErrors: {},
    speciesErrors: []
  };
  
  // Campos obrigatórios
  var required = ['data', 'local', 'metodo_coleta'];
  required.forEach(function(field) {
    if (!data[field]) {
      result.valid = false;
      result.errors.push('Campo obrigatório: ' + field);
      result.fieldErrors[field] = 'Campo obrigatório';
    }
  });
  
  // Validação de espécies
  if (!data.especies || !Array.isArray(data.especies) || data.especies.length === 0) {
    result.valid = false;
    result.errors.push('Adicione pelo menos uma espécie');
  } else {
    data.especies.forEach(function(sp, index) {
      var spErrors = [];
      if (!sp.nome) spErrors.push('Nome é obrigatório');
      if (!sp.quantidade || parseInt(sp.quantidade) < 1) spErrors.push('Quantidade deve ser >= 1');
      
      if (spErrors.length > 0) {
        result.valid = false;
        result.speciesErrors.push({ index: index, errors: spErrors });
      }
    });
  }
  
  return result;
}

/**
 * Valida formulário de bentos
 * @param {Object} data - Dados do formulário
 * @returns {Object} - Resultado da validação
 */
function validateBenthicForm(data) {
  var result = {
    valid: true,
    errors: [],
    warnings: [],
    fieldErrors: {},
    bmwpClass: null
  };
  
  // Campos obrigatórios
  var required = ['data', 'local', 'metodo_coleta'];
  required.forEach(function(field) {
    if (!data[field]) {
      result.valid = false;
      result.errors.push('Campo obrigatório: ' + field);
      result.fieldErrors[field] = 'Campo obrigatório';
    }
  });
  
  // Classificação BMWP se fornecido
  if (data.indice_bmwp) {
    result.bmwpClass = FieldValidators.classifyBMWP(data.indice_bmwp);
    if (result.bmwpClass.class === 'critical' || result.bmwpClass.class === 'doubtful') {
      result.warnings.push('Qualidade da água: ' + result.bmwpClass.label);
    }
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// API PARA FRONTEND
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida campo individual (chamado pelo frontend)
 * @param {string} formType - Tipo do formulário
 * @param {string} fieldName - Nome do campo
 * @param {*} value - Valor do campo
 * @returns {Object} - Resultado da validação
 */
function validateFormField(formType, fieldName, value) {
  var result = { valid: true, message: '', warning: '' };
  
  // Coordenadas
  if (fieldName === 'latitude') {
    var lat = parseFloat(value);
    if (value && (isNaN(lat) || lat < -90 || lat > 90)) {
      result.valid = false;
      result.message = 'Latitude deve estar entre -90 e 90';
    }
    return result;
  }
  
  if (fieldName === 'longitude') {
    var lng = parseFloat(value);
    if (value && (isNaN(lng) || lng < -180 || lng > 180)) {
      result.valid = false;
      result.message = 'Longitude deve estar entre -180 e 180';
    }
    return result;
  }
  
  // pH
  if (fieldName === 'ph') {
    var ph = parseFloat(value);
    if (value && !isNaN(ph)) {
      if (ph < 6 || ph > 9) {
        result.warning = 'pH fora dos limites CONAMA 357 (6-9)';
      }
    }
    return result;
  }
  
  // Cobertura de macrófitas
  if (fieldName === 'cobertura_percentual') {
    var cov = parseFloat(value);
    if (isNaN(cov) || cov < 0 || cov > 100) {
      result.valid = false;
      result.message = 'Cobertura deve estar entre 0 e 100%';
    } else if (cov > 75) {
      result.warning = 'Cobertura alta - possível eutrofização';
    }
    return result;
  }
  
  return result;
}

/**
 * Obtém limites de validação para exibição no frontend
 * @returns {Object} - Limites de validação
 */
function getValidationLimits() {
  return {
    waterQuality: WATER_QUALITY_LIMITS,
    ecological: ECOLOGICAL_LIMITS
  };
}
