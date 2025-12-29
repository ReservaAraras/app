/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UTILS - Funções Utilitárias
 * NOTA: Este arquivo é para Google Apps Script. Não execute `.gs` diretamente no
 * PowerShell. Use o editor em script.google.com ou a CLI `clasp` para deploy.
 * Para suprimir diagnósticos TypeScript/VSCode (projeto Apps Script), veja
 * os arquivos tsconfig.json e .vscode/settings.json adicionados ao projeto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

var Utils = {};

// Validadores
Utils.validators = {
  email: function(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  cpf: function(cpf) {
    var cleaned = (cpf || '').toString().replace(/\D/g, '');
    return cleaned.length === 11;
  },

  phone: function(phone) {
    var cleaned = (phone || '').toString().replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  required: function(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }
};

// Formatadores
Utils.formatters = {
  cpf: function(value) {
    var cleaned = (value || '').toString().replace(/\D/g, '');
    if (cleaned.length !== 11) return value;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  phone: function(value) {
    var cleaned = (value || '').toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  },

  currency: function(value) {
    var n = parseFloat(value);
    if (isNaN(n)) return value;
    return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  date: function(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return date;
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  },

  datetime: function(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return date;
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  }
};

Utils.createResponse = function(success, message, data) {
  return {
    success: !!success,
    message: message || '',
    data: data || null,
    timestamp: new Date().toISOString()
  };
};

Utils.handleError = function(error, context) {
  try {
    Logger.log('Erro em ' + (context || 'unknown') + ': ' + (error && error.message ? error.message : error));
  } catch (e) { /* silence */ }
  return Utils.createResponse(false, 'Erro: ' + (error && error.message ? error.message : String(error)));
};

Utils.validateFields = function(data, rules) {
  var errors = {};
  for (var field in rules) {
    var rule = rules[field];
    var value = data[field];
    if (rule.required && !Utils.validators.required(value)) {
      errors[field] = 'Campo obrigatório';
      continue;
    }
    if (value && rule.type && Utils.validators[rule.type] && !Utils.validators[rule.type](value)) {
      errors[field] = 'Formato inválido';
    }
  }
  return Object.keys(errors).length ? errors : null;
};

/**
 * Registra erro no log (OTIMIZADO - só loga erros críticos)
 * @param {string} context - Contexto do erro
 * @param {Error|string} error - Erro a ser registrado
 */
Utils.logError = function(context, error) {
  try {
    var errorMessage = error && error.message ? error.message : String(error);
    
    // Log apenas no console (mais leve)
    Logger.log('❌ ' + context + ': ' + errorMessage);
    
    // NÃO salva no sheet por padrão (reduz carga)
    // Para habilitar, use Utils.setDetailedLogging(true)
  } catch (e) {
    // Silencioso
  }
};

/**
 * Flag para logging detalhado
 */
Utils._detailedLogging = false;

Utils.setDetailedLogging = function(enabled) {
  Utils._detailedLogging = enabled;
};

/**
 * Gera um ID único
 * @returns {string} ID único
 */
Utils.generateId = function() {
  return 'ID_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Sanitiza string para evitar XSS
 * @param {string} str - String a ser sanitizada
 * @returns {string} String sanitizada
 */
Utils.sanitize = function(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida coordenadas GPS
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True se válidas
 */
Utils.validateCoordinates = function(lat, lng) {
  var latitude = parseFloat(lat);
  var longitude = parseFloat(lng);
  return !isNaN(latitude) && !isNaN(longitude) &&
         latitude >= -90 && latitude <= 90 &&
         longitude >= -180 && longitude <= 180;
};

/**
 * Converte array de arrays em array de objetos
 * @param {Array} data - Array de arrays (primeira linha = headers)
 * @param {Array} headers - Headers (opcional, se não fornecido usa primeira linha)
 * @returns {Array} Array de objetos
 */
Utils.arrayToObjects = function(data, headers) {
  if (!data || data.length === 0) return [];
  
  var useHeaders = headers || data[0];
  var startRow = headers ? 0 : 1;
  var result = [];
  
  for (var i = startRow; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    
    for (var j = 0; j < useHeaders.length; j++) {
      obj[useHeaders[j]] = row[j];
    }
    
    result.push(obj);
  }
  
  return result;
};

/**
 * Converte array de objetos em array de arrays
 * @param {Array} objects - Array de objetos
 * @param {Array} headers - Headers (ordem das colunas)
 * @returns {Array} Array de arrays
 */
Utils.objectsToArray = function(objects, headers) {
  if (!objects || objects.length === 0) return [];
  
  var result = [];
  
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var row = [];
    
    for (var j = 0; j < headers.length; j++) {
      row.push(obj[headers[j]] || '');
    }
    
    result.push(row);
  }
  
  return result;
};

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
Utils.validateEmail = function(email) {
  return Utils.validators.email(email);
};

/**
 * Formata data
 * @param {Date|string} date - Data a formatar
 * @param {string} format - Formato (opcional, padrão: dd/MM/yyyy)
 * @returns {string} Data formatada
 */
Utils.formatDate = function(date, format) {
  return Utils.formatters.date(date);
};

/**
 * Formata data e hora
 * @param {Date|string} date - Data a formatar
 * @returns {string} Data e hora formatadas
 */
Utils.formatDateTime = function(date) {
  return Utils.formatters.datetime(date);
};

/**
 * Clona objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Clone do objeto
 */
Utils.deepClone = function(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    var cloneArray = [];
    for (var i = 0; i < obj.length; i++) {
      cloneArray[i] = Utils.deepClone(obj[i]);
    }
    return cloneArray;
  }
  
  var cloneObj = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = Utils.deepClone(obj[key]);
    }
  }
  return cloneObj;
};

/**
 * Mescla objetos
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} Objeto mesclado
 */
Utils.merge = function(target, source) {
  var result = Utils.deepClone(target);
  
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      result[key] = source[key];
    }
  }
  
  return result;
};

/**
 * Remove valores vazios de objeto
 * @param {Object} obj - Objeto
 * @returns {Object} Objeto sem valores vazios
 */
Utils.removeEmpty = function(obj) {
  var result = {};
  
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
  }
  
  return result;
};

/**
 * Filtra array de objetos
 * @param {Array} array - Array de objetos
 * @param {Object} filter - Filtro (chave: valor)
 * @returns {Array} Array filtrado
 */
Utils.filterArray = function(array, filter) {
  if (!filter || Object.keys(filter).length === 0) return array;
  
  return array.filter(function(item) {
    for (var key in filter) {
      if (filter.hasOwnProperty(key)) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
    }
    return true;
  });
};

/**
 * Ordena array de objetos
 * @param {Array} array - Array de objetos
 * @param {string} key - Chave para ordenar
 * @param {string} order - Ordem (asc ou desc)
 * @returns {Array} Array ordenado
 */
Utils.sortArray = function(array, key, order) {
  var sorted = array.slice();
  
  sorted.sort(function(a, b) {
    var aVal = a[key];
    var bVal = b[key];
    
    if (aVal < bVal) return order === 'desc' ? 1 : -1;
    if (aVal > bVal) return order === 'desc' ? -1 : 1;
    return 0;
  });
  
  return sorted;
};

/**
 * Pagina array
 * @param {Array} array - Array
 * @param {number} page - Página (começa em 1)
 * @param {number} pageSize - Tamanho da página
 * @returns {Object} Resultado paginado
 */
Utils.paginate = function(array, page, pageSize) {
  var start = (page - 1) * pageSize;
  var end = start + pageSize;
  
  return {
    data: array.slice(start, end),
    page: page,
    pageSize: pageSize,
    total: array.length,
    totalPages: Math.ceil(array.length / pageSize)
  };
};

/**
 * Calcula distância entre dois pontos GPS (em km)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distância em km
 */
Utils.calculateDistance = function(lat1, lon1, lat2, lon2) {
  var R = 6371; // Raio da Terra em km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Gera hash simples de string
 * @param {string} str - String
 * @returns {string} Hash
 */
Utils.simpleHash = function(str) {
  var hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Trunca texto
 * @param {string} text - Texto
 * @param {number} length - Comprimento máximo
 * @param {string} suffix - Sufixo (padrão: ...)
 * @returns {string} Texto truncado
 */
Utils.truncate = function(text, length, suffix) {
  if (!text || text.length <= length) return text;
  suffix = suffix || '...';
  return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Capitaliza primeira letra
 * @param {string} str - String
 * @returns {string} String capitalizada
 */
Utils.capitalize = function(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converte para slug
 * @param {string} str - String
 * @returns {string} Slug
 */
Utils.slugify = function(str) {
  if (!str) return '';
  
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Calcula a média de um array de números
 * @param {Array<number>} numbers - Array de números
 * @returns {number} Média dos números
 */
Utils.average = function(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  
  var sum = 0;
  for (var i = 0; i < numbers.length; i++) {
    sum += parseFloat(numbers[i]) || 0;
  }
  
  return sum / numbers.length;
};
