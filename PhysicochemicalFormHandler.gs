/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHYSICOCHEMICAL FORM HANDLER - Análise Físico-Química da Água
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Limites de qualidade da água baseados em CONAMA 357/2005
 */
var WaterQualityLimits = {
  ph: { min: 6.0, max: 9.0 },
  oxigenio: { min: 5.0 },
  turbidez: { max: 5.0, warning: 10.0 },
  temperatura: { min: 10, max: 35, warning: 30 },
  dbo: { max: 5.0, warning: 10.0 },
  fosforo: { max: 0.030, warning: 0.050 },
  ecoli: { max: 0 }
};

/**
 * Cria instância do FormHelper para análise físico-química
 */
function createPhysicochemicalFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { required: true, label: 'Hora da Coleta' },
    local: { required: true, label: 'Local da Coleta' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    temperatura: { required: true, type: 'number', label: 'Temperatura', min: 0, max: 50 },
    turbidez: { required: true, type: 'number', label: 'Turbidez', min: 0, max: 1000 },
    cor: { type: 'number', label: 'Cor Aparente', min: 0, max: 500 },
    condutividade: { type: 'number', label: 'Condutividade', min: 0, max: 10000 },
    ph: { required: true, type: 'number', label: 'pH', min: 0, max: 14 },
    oxigenio: { required: true, type: 'number', label: 'Oxigênio Dissolvido', min: 0, max: 20 },
    dbo: { type: 'number', label: 'DBO', min: 0, max: 100 },
    fosforo: { type: 'number', label: 'Fósforo Total', min: 0, max: 10 },
    nitrogenio: { type: 'number', label: 'Nitrogênio Total', min: 0, max: 50 },
    coliformes_totais: { type: 'number', label: 'Coliformes Totais', min: 0 },
    ecoli: { type: 'number', label: 'E. coli', min: 0 }
  });
  
  return form;
}

/**
 * Valida campo individual
 */
function validatePhysicochemicalField(fieldName, value, fieldConfig) {
  try {
    var form = FormHelper.create();
    var fields = {};
    fields[fieldName] = fieldConfig;
    form.defineFields(fields);
    
    var data = {};
    data[fieldName] = value;
    form.setData(data);
    
    var validation = form.validate();
    
    if (!validation.valid && validation.errors[fieldName]) {
      return {
        valid: false,
        message: validation.errors[fieldName]
      };
    }
    
    // Validação GPS
    if (fieldName === 'latitude' || fieldName === 'longitude') {
      var lat = fieldName === 'latitude' ? value : null;
      var lng = fieldName === 'longitude' ? value : null;
      
      if (lat !== null && lng === null) {
        return { valid: true };
      }
      
      var gpsValidation = FormHelper.validateGPSCoordinates(lat, lng);
      if (!gpsValidation.valid) {
        return gpsValidation;
      }
    }
    
    return { valid: true };
    
  } catch (error) {
    Logger.log('Erro em validatePhysicochemicalField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Avalia qualidade da água e retorna avisos
 */
function assessWaterQuality(formData) {
  var warnings = [];
  var criticalIssues = [];
  
  // pH
  if (formData.ph) {
    var ph = parseFloat(formData.ph);
    if (ph < WaterQualityLimits.ph.min || ph > WaterQualityLimits.ph.max) {
      criticalIssues.push('pH fora da faixa permitida (6.0-9.0)');
    }
  }
  
  // Oxigênio Dissolvido
  if (formData.oxigenio) {
    var od = parseFloat(formData.oxigenio);
    if (od < WaterQualityLimits.oxigenio.min) {
      criticalIssues.push('Oxigênio dissolvido abaixo do mínimo (< 5 mg/L)');
    }
  }
  
  // Turbidez
  if (formData.turbidez) {
    var turbidez = parseFloat(formData.turbidez);
    if (turbidez > WaterQualityLimits.turbidez.max) {
      if (turbidez > WaterQualityLimits.turbidez.warning) {
        criticalIssues.push('Turbidez muito elevada (> 10 NTU)');
      } else {
        warnings.push('Turbidez acima do ideal (> 5 NTU)');
      }
    }
  }
  
  // DBO
  if (formData.dbo) {
    var dbo = parseFloat(formData.dbo);
    if (dbo > WaterQualityLimits.dbo.max) {
      if (dbo > WaterQualityLimits.dbo.warning) {
        criticalIssues.push('DBO muito elevada (> 10 mg/L)');
      } else {
        warnings.push('DBO acima do ideal (> 5 mg/L)');
      }
    }
  }
  
  // Fósforo
  if (formData.fosforo) {
    var fosforo = parseFloat(formData.fosforo);
    if (fosforo > WaterQualityLimits.fosforo.max) {
      if (fosforo > WaterQualityLimits.fosforo.warning) {
        criticalIssues.push('Fósforo muito elevado - risco de eutrofização');
      } else {
        warnings.push('Fósforo acima do ideal');
      }
    }
  }
  
  // E. coli
  if (formData.ecoli) {
    var ecoli = parseFloat(formData.ecoli);
    if (ecoli > WaterQualityLimits.ecoli.max) {
      criticalIssues.push('Presença de E. coli detectada - contaminação fecal');
    }
  }
  
  // Temperatura
  if (formData.temperatura) {
    var temp = parseFloat(formData.temperatura);
    if (temp > WaterQualityLimits.temperatura.warning) {
      warnings.push('Temperatura elevada (> 30°C)');
    }
  }
  
  return {
    warnings: warnings,
    criticalIssues: criticalIssues,
    quality: criticalIssues.length === 0 ? (warnings.length === 0 ? 'Excelente' : 'Boa') : 'Inadequada'
  };
}

/**
 * Processa e salva formulário
 */
function submitPhysicochemicalForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createPhysicochemicalFormHelper();
    form.setData(formData);
    
    var validation = form.validate();
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // Validação GPS
    var gpsValidation = form.validateGPS('latitude', 'longitude');
    if (!gpsValidation.valid) {
      return {
        success: false,
        errors: {
          latitude: gpsValidation.message,
          longitude: gpsValidation.message
        }
      };
    }
    
    // Avalia qualidade da água
    var assessment = assessWaterQuality(formData);
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'physicochemical_analysis'
    });
    
    // Adiciona avaliação de qualidade
    dataToSave.id = 'PHYSCHEM_' + Date.now();
    dataToSave.water_quality = assessment.quality;
    dataToSave.has_warnings = assessment.warnings.length > 0;
    dataToSave.has_critical_issues = assessment.criticalIssues.length > 0;
    
    // Salva no banco de dados
    var sheetName = 'AnalisesFisicoQuimicas';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Análise físico-química salva: ' + dataToSave.id);
    Logger.log('   Qualidade: ' + assessment.quality);
    
    if (assessment.criticalIssues.length > 0) {
      Logger.log('   ⚠️ Problemas críticos: ' + assessment.criticalIssues.join(', '));
    }
    
    if (assessment.warnings.length > 0) {
      Logger.log('   ⚡ Avisos: ' + assessment.warnings.join(', '));
    }
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Análise salva com sucesso',
      quality: assessment.quality,
      warnings: assessment.warnings,
      criticalIssues: assessment.criticalIssues
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitPhysicochemicalForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário
 */
function openPhysicochemicalForm() {
  var html = HtmlService.createHtmlOutputFromFile('PhysicochemicalForm')
    .setWidth(700)
    .setHeight(900)
    .setTitle('🧪 Análise Físico-Química')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Análise Físico-Química');
}
