/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ZOOPLANKTON FORM HANDLER - Processamento de Amostragem de Zooplâncton
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para zooplâncton
 */
function createZooplanktonFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { required: true, label: 'Hora da Coleta' },
    local: { required: true, label: 'Local da Coleta' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    profundidade: { required: true, type: 'number', label: 'Profundidade', min: 0, max: 100 },
    volume_filtrado: { required: true, type: 'number', label: 'Volume Filtrado', min: 0.1, max: 1000 },
    temperatura: { required: true, type: 'number', label: 'Temperatura', min: 0, max: 50 },
    oxigenio: { type: 'number', label: 'Oxigênio Dissolvido', min: 0, max: 20 },
    tipo_rede: { required: true, label: 'Tipo de Rede' },
    densidade: { type: 'number', label: 'Densidade', min: 0 }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateZooplanktonField(fieldName, value, fieldConfig) {
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
    Logger.log('Erro em validateZooplanktonField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Processa e salva formulário de zooplâncton
 */
function submitZooplanktonForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createZooplanktonFormHelper();
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
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'zooplankton_sampling'
    });
    
    // Adiciona ID único
    dataToSave.id = 'ZOO_' + Date.now();
    
    // Salva no banco de dados
    var sheetName = 'AmostragemZooplancton';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Amostragem de zooplâncton salva: ' + dataToSave.id);
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Amostragem salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitZooplanktonForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de zooplâncton
 */
function openZooplanktonForm() {
  var html = HtmlService.createHtmlOutputFromFile('ZooplanktonForm')
    .setWidth(600)
    .setHeight(800)
    .setTitle('🦐 Amostragem de Zooplâncton')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Amostragem de Zooplâncton');
}
