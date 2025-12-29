/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INPUT VALIDATORS - Validadores de Entrada Reutilizáveis
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Módulo de validação de entrada genérico e reutilizável.
 * Complementa o ValidationService com validadores atômicos.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Validadores de entrada atômicos
 * @namespace InputValidators
 */
const InputValidators = {

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDADORES DE TIPO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida se valor é string não vazia
   */
  isNonEmptyString(value, fieldName = 'Campo') {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return { valid: false, error: `${fieldName} é obrigatório` };
    }
    return { valid: true };
  },

  /**
   * Valida string com tamanho mínimo/máximo
   */
  isStringLength(value, min, max, fieldName = 'Campo') {
    if (typeof value !== 'string') {
      return { valid: false, error: `${fieldName} deve ser texto` };
    }
    const len = value.trim().length;
    if (min && len < min) {
      return { valid: false, error: `${fieldName} deve ter no mínimo ${min} caracteres` };
    }
    if (max && len > max) {
      return { valid: false, error: `${fieldName} deve ter no máximo ${max} caracteres` };
    }
    return { valid: true };
  },

  /**
   * Valida se valor é número
   */
  isNumber(value, fieldName = 'Campo') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} deve ser um número` };
    }
    return { valid: true, value: num };
  },

  /**
   * Valida número em range
   */
  isNumberInRange(value, min, max, fieldName = 'Campo') {
    const numResult = this.isNumber(value, fieldName);
    if (!numResult.valid) return numResult;
    
    const num = numResult.value;
    if (min !== undefined && num < min) {
      return { valid: false, error: `${fieldName} deve ser >= ${min}` };
    }
    if (max !== undefined && num > max) {
      return { valid: false, error: `${fieldName} deve ser <= ${max}` };
    }
    return { valid: true, value: num };
  },

  /**
   * Valida se valor é inteiro positivo
   */
  isPositiveInteger(value, fieldName = 'Campo') {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num !== parseFloat(value)) {
      return { valid: false, error: `${fieldName} deve ser um número inteiro positivo` };
    }
    return { valid: true, value: num };
  },

  /**
   * Valida se valor é booleano
   */
  isBoolean(value, fieldName = 'Campo') {
    if (typeof value !== 'boolean') {
      return { valid: false, error: `${fieldName} deve ser verdadeiro ou falso` };
    }
    return { valid: true };
  },

  /**
   * Valida se valor é array
   */
  isArray(value, fieldName = 'Campo') {
    if (!Array.isArray(value)) {
      return { valid: false, error: `${fieldName} deve ser uma lista` };
    }
    return { valid: true };
  },

  /**
   * Valida se valor é objeto
   */
  isObject(value, fieldName = 'Campo') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { valid: false, error: `${fieldName} deve ser um objeto` };
    }
    return { valid: true };
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDADORES DE FORMATO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida formato de email
   */
  isEmail(value, fieldName = 'Email') {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: `${fieldName} é obrigatório` };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: `${fieldName} inválido` };
    }
    return { valid: true };
  },

  /**
   * Valida formato de telefone brasileiro
   */
  isPhoneBR(value, fieldName = 'Telefone') {
    if (!value) return { valid: true }; // Opcional
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { valid: false, error: `${fieldName} deve ter 10 ou 11 dígitos` };
    }
    return { valid: true, value: cleaned };
  },

  /**
   * Valida formato de CPF
   */
  isCPF(value, fieldName = 'CPF') {
    if (!value) return { valid: false, error: `${fieldName} é obrigatório` };
    const cleaned = String(value).replace(/\D/g, '');
    
    if (cleaned.length !== 11) {
      return { valid: false, error: `${fieldName} deve ter 11 dígitos` };
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return { valid: false, error: `${fieldName} inválido` };
    }
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
    let digit1 = (sum * 10) % 11;
    if (digit1 === 10) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
    let digit2 = (sum * 10) % 11;
    if (digit2 === 10) digit2 = 0;
    
    if (digit1 !== parseInt(cleaned[9]) || digit2 !== parseInt(cleaned[10])) {
      return { valid: false, error: `${fieldName} inválido` };
    }
    
    return { valid: true, value: cleaned };
  },

  /**
   * Valida formato de data
   */
  isDate(value, fieldName = 'Data') {
    if (!value) return { valid: false, error: `${fieldName} é obrigatória` };
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { valid: false, error: `${fieldName} inválida` };
    }
    return { valid: true, value: date };
  },

  /**
   * Valida data no passado
   */
  isPastDate(value, fieldName = 'Data') {
    const dateResult = this.isDate(value, fieldName);
    if (!dateResult.valid) return dateResult;
    
    if (dateResult.value > new Date()) {
      return { valid: false, error: `${fieldName} deve ser no passado` };
    }
    return { valid: true, value: dateResult.value };
  },

  /**
   * Valida data no futuro
   */
  isFutureDate(value, fieldName = 'Data') {
    const dateResult = this.isDate(value, fieldName);
    if (!dateResult.valid) return dateResult;
    
    if (dateResult.value < new Date()) {
      return { valid: false, error: `${fieldName} deve ser no futuro` };
    }
    return { valid: true, value: dateResult.value };
  },

  /**
   * Valida URL
   */
  isURL(value, fieldName = 'URL') {
    if (!value) return { valid: true }; // Opcional
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: `${fieldName} inválida` };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDADORES GEOGRÁFICOS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida latitude
   */
  isLatitude(value, fieldName = 'Latitude') {
    const result = this.isNumberInRange(value, -90, 90, fieldName);
    if (!result.valid) {
      return { valid: false, error: `${fieldName} deve estar entre -90 e 90` };
    }
    return result;
  },

  /**
   * Valida longitude
   */
  isLongitude(value, fieldName = 'Longitude') {
    const result = this.isNumberInRange(value, -180, 180, fieldName);
    if (!result.valid) {
      return { valid: false, error: `${fieldName} deve estar entre -180 e 180` };
    }
    return result;
  },

  /**
   * Valida coordenadas GPS
   */
  isGPSCoordinates(lat, lon) {
    const latResult = this.isLatitude(lat);
    if (!latResult.valid) return latResult;
    
    const lonResult = this.isLongitude(lon);
    if (!lonResult.valid) return lonResult;
    
    return { valid: true, latitude: latResult.value, longitude: lonResult.value };
  },

  /**
   * Valida altitude
   */
  isAltitude(value, fieldName = 'Altitude') {
    return this.isNumberInRange(value, -500, 9000, fieldName);
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDADORES DE ENUM
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida se valor está em lista de opções
   */
  isOneOf(value, options, fieldName = 'Campo') {
    if (!options.includes(value)) {
      return { valid: false, error: `${fieldName} deve ser: ${options.join(', ')}` };
    }
    return { valid: true };
  },

  /**
   * Valida categoria de waypoint
   */
  isWaypointCategory(value) {
    const categories = ['cachoeira', 'mirante', 'inicio', 'fim', 'ponto_interesse', 'perigo', 'descanso', 'agua', 'teste'];
    return this.isOneOf(value, categories, 'Categoria');
  },

  /**
   * Valida dificuldade de trilha
   */
  isTrailDifficulty(value) {
    const difficulties = ['fácil', 'média', 'difícil', 'muito_difícil'];
    return this.isOneOf(value, difficulties, 'Dificuldade');
  },

  /**
   * Valida tipo de observação
   */
  isObservationType(value) {
    const types = ['flora', 'fauna', 'fungo', 'outro'];
    return this.isOneOf(value, types, 'Tipo de observação');
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANITIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Sanitiza string removendo caracteres perigosos
   */
  sanitizeString(value) {
    if (!value || typeof value !== 'string') return '';
    return value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  /**
   * Sanitiza objeto recursivamente
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAÇÃO DE SCHEMA
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Valida objeto contra schema
   * @param {Object} data - Dados a validar
   * @param {Object} schema - Schema de validação
   * @returns {Object} Resultado da validação
   */
  validateSchema(data, schema) {
    const errors = [];
    const warnings = [];
    const sanitized = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Campo obrigatório
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rules.label || field} é obrigatório`);
        continue;
      }
      
      // Se não tem valor e não é obrigatório, pula
      if (value === undefined || value === null || value === '') {
        if (rules.default !== undefined) {
          sanitized[field] = rules.default;
        }
        continue;
      }
      
      // Validação de tipo
      let validatedValue = value;
      
      if (rules.type === 'string') {
        const result = rules.minLength || rules.maxLength 
          ? this.isStringLength(value, rules.minLength, rules.maxLength, rules.label || field)
          : this.isNonEmptyString(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = this.sanitizeString(value);
      }
      
      if (rules.type === 'number') {
        const result = this.isNumberInRange(value, rules.min, rules.max, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = result.value;
      }
      
      if (rules.type === 'integer') {
        const result = this.isPositiveInteger(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = result.value;
      }
      
      if (rules.type === 'email') {
        const result = this.isEmail(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
      }
      
      if (rules.type === 'date') {
        const result = this.isDate(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = result.value;
      }
      
      if (rules.type === 'latitude') {
        const result = this.isLatitude(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = result.value;
      }
      
      if (rules.type === 'longitude') {
        const result = this.isLongitude(value, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
        validatedValue = result.value;
      }
      
      // Validação de enum
      if (rules.enum) {
        const result = this.isOneOf(value, rules.enum, rules.label || field);
        if (!result.valid) { errors.push(result.error); continue; }
      }
      
      // Validação customizada
      if (rules.validate && typeof rules.validate === 'function') {
        const result = rules.validate(value);
        if (!result.valid) {
          errors.push(result.error || `${rules.label || field} inválido`);
          continue;
        }
      }
      
      sanitized[field] = validatedValue;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: sanitized
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDAÇÃO PRÉ-DEFINIDOS
// ═══════════════════════════════════════════════════════════════════════════

const ValidationSchemas = {
  
  waypoint: {
    nome: { type: 'string', required: true, minLength: 3, maxLength: 100, label: 'Nome' },
    categoria: { type: 'string', required: true, enum: ['cachoeira', 'mirante', 'inicio', 'fim', 'ponto_interesse', 'perigo', 'descanso', 'agua', 'teste'], label: 'Categoria' },
    latitude: { type: 'latitude', required: true, label: 'Latitude' },
    longitude: { type: 'longitude', required: true, label: 'Longitude' },
    altitude: { type: 'number', min: 0, max: 3000, label: 'Altitude' },
    descricao: { type: 'string', maxLength: 500, label: 'Descrição' }
  },
  
  trilha: {
    nome: { type: 'string', required: true, minLength: 3, maxLength: 100, label: 'Nome' },
    distancia_km: { type: 'number', min: 0.1, max: 100, label: 'Distância (km)' },
    dificuldade: { type: 'string', enum: ['fácil', 'média', 'difícil', 'muito_difícil'], label: 'Dificuldade' },
    duracao_horas: { type: 'number', min: 0.1, max: 24, label: 'Duração (horas)' },
    descricao: { type: 'string', maxLength: 1000, label: 'Descrição' }
  },
  
  visitante: {
    nome: { type: 'string', required: true, minLength: 2, maxLength: 100, label: 'Nome' },
    email: { type: 'email', label: 'Email' },
    telefone: { type: 'string', maxLength: 20, label: 'Telefone' },
    data_visita: { type: 'date', required: true, label: 'Data da visita' }
  },
  
  observacao: {
    especie_cientifica: { type: 'string', maxLength: 100, label: 'Nome científico' },
    especie_comum: { type: 'string', maxLength: 100, label: 'Nome comum' },
    tipo_observacao: { type: 'string', required: true, enum: ['flora', 'fauna', 'fungo', 'outro'], label: 'Tipo' },
    quantidade: { type: 'integer', min: 1, label: 'Quantidade' },
    latitude: { type: 'latitude', label: 'Latitude' },
    longitude: { type: 'longitude', label: 'Longitude' },
    observacoes: { type: 'string', maxLength: 1000, label: 'Observações' }
  },
  
  qualidadeAgua: {
    local: { type: 'string', required: true, minLength: 3, label: 'Local da coleta' },
    data_coleta: { type: 'date', required: true, label: 'Data da coleta' },
    pH: { type: 'number', min: 0, max: 14, label: 'pH' },
    temperatura: { type: 'number', min: -10, max: 50, label: 'Temperatura (°C)' },
    oxigenio_dissolvido: { type: 'number', min: 0, max: 20, label: 'Oxigênio dissolvido (mg/L)' },
    turbidez: { type: 'number', min: 0, max: 1000, label: 'Turbidez (NTU)' }
  },
  
  usuario: {
    nome: { type: 'string', required: true, minLength: 2, maxLength: 100, label: 'Nome' },
    email: { type: 'email', required: true, label: 'Email' },
    tipo: { type: 'string', required: true, enum: ['admin', 'pesquisador', 'visitante', 'colaborador'], label: 'Tipo de usuário' }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida dados usando schema pré-definido
 */
function apiValidateWithPredefinedSchema(schemaName, data) {
  const schema = ValidationSchemas[schemaName];
  if (!schema) {
    return { valid: false, error: `Schema não encontrado: ${schemaName}` };
  }
  return InputValidators.validateSchema(data, schema);
}

/**
 * Valida e sanitiza dados de entrada
 */
function apiValidateAndSanitize(schemaName, data) {
  const sanitized = InputValidators.sanitizeObject(data);
  return apiValidateWithPredefinedSchema(schemaName, sanitized);
}

/**
 * Lista schemas disponíveis
 */
function apiListValidationSchemas() {
  return {
    success: true,
    schemas: Object.keys(ValidationSchemas),
    count: Object.keys(ValidationSchemas).length
  };
}
