/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MACROPHYTES FORM HANDLER - Registro de Macrófitas Aquáticas
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para macrófitas
 */
function createMacrophytesFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Avaliação' },
    hora: { required: true, label: 'Hora' },
    local: { required: true, label: 'Local da Avaliação' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    tipo_macrofita: { required: true, label: 'Tipo de Macrófita' },
    especie_predominante: { required: true, label: 'Espécie Predominante' },
    cobertura_percentual: { required: true, type: 'number', label: 'Cobertura Percentual', min: 0, max: 100 }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateMacrophytesField(fieldName, value, fieldConfig) {
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
    
    // Validação GPS específica
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
    Logger.log('Erro em validateMacrophytesField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Avalia nível de cobertura e possíveis riscos
 */
function assessCoverageLevel(cobertura) {
  var coverage = parseFloat(cobertura);
  var warnings = [];
  var level = '';
  
  if (coverage < 25) {
    level = 'baixa';
  } else if (coverage < 50) {
    level = 'media';
  } else if (coverage < 75) {
    level = 'alta';
    warnings.push('Cobertura alta - monitorar expansão');
  } else {
    level = 'muito_alta';
    warnings.push('Cobertura muito alta - possível eutrofização');
    warnings.push('Avaliar necessidade de manejo');
  }
  
  return {
    level: level,
    warnings: warnings,
    requires_management: coverage >= 75
  };
}

/**
 * Processa e salva formulário de macrófitas
 */
function submitMacrophytesForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createMacrophytesFormHelper();
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
    
    // Avalia nível de cobertura
    var coverageAssessment = assessCoverageLevel(formData.cobertura_percentual);
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'macrophytes_assessment'
    });
    
    // Adiciona ID único e avaliação
    dataToSave.id = 'MACRO_' + Date.now();
    dataToSave.cobertura_nivel = coverageAssessment.level;
    dataToSave.requer_manejo = coverageAssessment.requires_management;
    
    // Adiciona campos opcionais
    if (formData.nome_cientifico) dataToSave.nome_cientifico = formData.nome_cientifico;
    if (formData.area_estimada) dataToSave.area_estimada = formData.area_estimada;
    if (formData.densidade) dataToSave.densidade = formData.densidade;
    if (formData.altura_media) dataToSave.altura_media = formData.altura_media;
    if (formData.profundidade) dataToSave.profundidade = formData.profundidade;
    if (formData.velocidade_corrente) dataToSave.velocidade_corrente = formData.velocidade_corrente;
    if (formData.estado_conservacao) dataToSave.estado_conservacao = formData.estado_conservacao;
    if (formData.impactos_observados) dataToSave.impactos_observados = formData.impactos_observados;
    if (formData.observacoes) dataToSave.observacoes = formData.observacoes;
    
    // Salva no banco de dados
    var sheetName = 'MacrofitasAquaticas';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Avaliação de macrófitas salva: ' + dataToSave.id);
    Logger.log('   Espécie: ' + dataToSave.especie_predominante);
    Logger.log('   Cobertura: ' + dataToSave.cobertura_percentual + '% (' + coverageAssessment.level + ')');
    
    if (coverageAssessment.warnings.length > 0) {
      Logger.log('   ⚠️ Avisos: ' + coverageAssessment.warnings.join(', '));
    }
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Avaliação salva com sucesso',
      coverage_level: coverageAssessment.level,
      warnings: coverageAssessment.warnings
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitMacrophytesForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de macrófitas
 */
function openMacrophytesForm() {
  var html = HtmlService.createHtmlOutputFromFile('MacrophytesForm')
    .setWidth(650)
    .setHeight(900)
    .setTitle('🌿 Macrófitas Aquáticas')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Macrófitas Aquáticas');
}
