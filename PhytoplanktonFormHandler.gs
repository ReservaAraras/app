/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHYTOPLANKTON FORM HANDLER - Processamento de Amostragem de Fitoplâncton
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para fitoplâncton
 */
function createPhytoplanktonFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { required: true, label: 'Hora da Coleta' },
    local: { required: true, label: 'Local da Coleta' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    profundidade: { required: true, type: 'number', label: 'Profundidade', min: 0, max: 100 },
    temperatura: { required: true, type: 'number', label: 'Temperatura', min: 0, max: 50 },
    ph: { type: 'number', label: 'pH', min: 0, max: 14 },
    transparencia: { type: 'number', label: 'Transparência', min: 0 }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validatePhytoplanktonField(fieldName, value, fieldConfig) {
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
        return { valid: true }; // Valida apenas quando ambos estiverem preenchidos
      }
      
      var gpsValidation = FormHelper.validateGPSCoordinates(lat, lng);
      if (!gpsValidation.valid) {
        return gpsValidation;
      }
    }
    
    return { valid: true };
    
  } catch (error) {
    Logger.log('Erro em validatePhytoplanktonField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Processa e salva formulário de fitoplâncton
 */
function submitPhytoplanktonForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createPhytoplanktonFormHelper();
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
      formType: 'phytoplankton_sampling'
    });
    
    // Adiciona ID único
    dataToSave.id = 'PHYTO_' + Date.now();
    
    // Salva no banco de dados
    var sheetName = 'AmostragemFitoplancton'; // Adaptar ao nome da planilha
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Amostragem de fitoplâncton salva: ' + dataToSave.id);
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Amostragem salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitPhytoplanktonForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de fitoplâncton
 */
function openPhytoplanktonForm() {
  var html = HtmlService.createHtmlOutputFromFile('PhytoplanktonForm')
    .setWidth(600)
    .setHeight(800)
    .setTitle('🦠 Amostragem de Fitoplâncton')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Amostragem de Fitoplâncton');
}
