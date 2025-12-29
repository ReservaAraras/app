/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM HELPER - Classe Base para Formulários
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Funcionalidades:
 * - Validação unificada de campos
 * - Gerenciamento de estado do formulário
 * - Integração com GPS
 * - Conversão para JSON
 * - Suporte a campos dinâmicos
 * 
 * @version 1.0.0
 */

var FormHelper = (function() {
  'use strict';
  
  /**
   * Regras de validação por tipo de campo
   */
  var ValidationRules = {
    required: function(value, fieldName) {
      if (value === null || value === undefined || value === '') {
        return { valid: false, message: fieldName + ' é obrigatório' };
      }
      return { valid: true };
    },
    
    number: function(value, fieldName, options) {
      var num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, message: fieldName + ' deve ser um número válido' };
      }
      
      if (options.min !== undefined && num < options.min) {
        return { valid: false, message: fieldName + ' deve ser maior ou igual a ' + options.min };
      }
      
      if (options.max !== undefined && num > options.max) {
        return { valid: false, message: fieldName + ' deve ser menor ou igual a ' + options.max };
      }
      
      return { valid: true, value: num };
    },
    
    gps: function(latitude, longitude) {
      var lat = parseFloat(latitude);
      var lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return { valid: false, message: 'Coordenadas GPS inválidas' };
      }
      
      if (lat < -90 || lat > 90) {
        return { valid: false, message: 'Latitude deve estar entre -90 e 90' };
      }
      
      if (lng < -180 || lng > 180) {
        return { valid: false, message: 'Longitude deve estar entre -180 e 180' };
      }
      
      return { valid: true, latitude: lat, longitude: lng };
    },
    
    date: function(value, fieldName) {
      var date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, message: fieldName + ' deve ser uma data válida' };
      }
      return { valid: true, value: date };
    },
    
    email: function(value, fieldName) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: fieldName + ' deve ser um email válido' };
      }
      return { valid: true };
    }
  };
  
  /**
   * Classe principal FormHelper
   */
  function FormHelperClass(config) {
    this.config = config || {};
    this.fields = this.config.fields || {};
    this.data = {};
    this.errors = {};
    this.isDirty = false;
  }
  
  /**
   * Define o schema de campos do formulário
   */
  FormHelperClass.prototype.defineFields = function(fieldDefinitions) {
    this.fields = fieldDefinitions;
    return this;
  };
  
  /**
   * Define os dados do formulário
   */
  FormHelperClass.prototype.setData = function(data) {
    this.data = data || {};
    this.isDirty = true;
    return this;
  };
  
  /**
   * Obtém valor de um campo
   */
  FormHelperClass.prototype.getValue = function(fieldName) {
    return this.data[fieldName];
  };
  
  /**
   * Define valor de um campo
   */
  FormHelperClass.prototype.setValue = function(fieldName, value) {
    this.data[fieldName] = value;
    this.isDirty = true;
    return this;
  };
  
  /**
   * Valida todos os campos do formulário
   */
  FormHelperClass.prototype.validate = function() {
    this.errors = {};
    var isValid = true;
    
    for (var fieldName in this.fields) {
      var fieldDef = this.fields[fieldName];
      var value = this.data[fieldName];
      
      // Validação de campo obrigatório
      if (fieldDef.required) {
        var requiredCheck = ValidationRules.required(value, fieldDef.label || fieldName);
        if (!requiredCheck.valid) {
          this.errors[fieldName] = requiredCheck.message;
          isValid = false;
          continue;
        }
      }
      
      // Se campo não é obrigatório e está vazio, pula outras validações
      if (!fieldDef.required && (value === null || value === undefined || value === '')) {
        continue;
      }
      
      // Validação por tipo
      if (fieldDef.type) {
        var typeCheck = this._validateByType(fieldName, value, fieldDef);
        if (!typeCheck.valid) {
          this.errors[fieldName] = typeCheck.message;
          isValid = false;
        }
      }
      
      // Validações customizadas
      if (fieldDef.validator && typeof fieldDef.validator === 'function') {
        var customCheck = fieldDef.validator(value, this.data);
        if (!customCheck.valid) {
          this.errors[fieldName] = customCheck.message;
          isValid = false;
        }
      }
    }
    
    return {
      valid: isValid,
      errors: this.errors
    };
  };
  
  /**
   * Valida campo por tipo
   */
  FormHelperClass.prototype._validateByType = function(fieldName, value, fieldDef) {
    var label = fieldDef.label || fieldName;
    
    switch (fieldDef.type) {
      case 'number':
        return ValidationRules.number(value, label, fieldDef);
      case 'date':
        return ValidationRules.date(value, label);
      case 'email':
        return ValidationRules.email(value, label);
      default:
        return { valid: true };
    }
  };
  
  /**
   * Valida coordenadas GPS
   */
  FormHelperClass.prototype.validateGPS = function(latField, lngField) {
    var lat = this.data[latField || 'latitude'];
    var lng = this.data[lngField || 'longitude'];
    
    var result = ValidationRules.gps(lat, lng);
    
    if (!result.valid) {
      this.errors[latField || 'latitude'] = result.message;
      this.errors[lngField || 'longitude'] = result.message;
    }
    
    return result;
  };
  
  /**
   * Obtém erros de validação
   */
  FormHelperClass.prototype.getErrors = function() {
    return this.errors;
  };
  
  /**
   * Verifica se há erros
   */
  FormHelperClass.prototype.hasErrors = function() {
    return Object.keys(this.errors).length > 0;
  };
  
  /**
   * Limpa erros
   */
  FormHelperClass.prototype.clearErrors = function() {
    this.errors = {};
    return this;
  };
  
  /**
   * Converte dados para JSON
   */
  FormHelperClass.prototype.toJSON = function() {
    return JSON.stringify(this.data);
  };
  
  /**
   * Converte dados para objeto (com timestamp e metadata)
   */
  FormHelperClass.prototype.toObject = function(options) {
    options = options || {};
    
    var result = {};
    
    // Copia dados
    for (var key in this.data) {
      result[key] = this.data[key];
    }
    
    // Adiciona metadata se solicitado
    if (options.includeMetadata !== false) {
      result.timestamp = new Date();
      
      if (options.includeUser && typeof Session !== 'undefined') {
        try {
          result.user_email = Session.getActiveUser().getEmail();
        } catch (e) {
          // Ignora se não tiver permissão
        }
      }
      
      if (options.formType) {
        result.form_type = options.formType;
      }
    }
    
    return result;
  };
  
  /**
   * Reseta o formulário
   */
  FormHelperClass.prototype.reset = function() {
    this.data = {};
    this.errors = {};
    this.isDirty = false;
    return this;
  };
  
  /**
   * Verifica se o formulário foi modificado
   */
  FormHelperClass.prototype.hasChanges = function() {
    return this.isDirty;
  };
  
  /**
   * Cria um FormHelper a partir de dados existentes
   */
  FormHelperClass.prototype.loadFromData = function(data) {
    this.data = data || {};
    this.isDirty = false;
    return this;
  };
  
  // API Pública
  return {
    /**
     * Cria nova instância de FormHelper
     */
    create: function(config) {
      return new FormHelperClass(config);
    },
    
    /**
     * Validação estática de GPS
     */
    validateGPSCoordinates: function(latitude, longitude) {
      return ValidationRules.gps(latitude, longitude);
    },
    
    /**
     * Validação estática de campo obrigatório
     */
    validateRequired: function(value, fieldName) {
      return ValidationRules.required(value, fieldName);
    },
    
    /**
     * Validação estática de número
     */
    validateNumber: function(value, fieldName, options) {
      return ValidationRules.number(value, fieldName, options || {});
    },
    
    /**
     * Validação estática de email
     */
    validateEmail: function(value, fieldName) {
      return ValidationRules.email(value, fieldName);
    },
    
    /**
     * Validação estática de data
     */
    validateDate: function(value, fieldName) {
      return ValidationRules.date(value, fieldName);
    }
  };
})();

/**
 * Funções de conveniência para uso direto
 */
function createFormHelper(config) {
  return FormHelper.create(config);
}

function validateGPSCoordinates(latitude, longitude) {
  return FormHelper.validateGPSCoordinates(latitude, longitude);
}
