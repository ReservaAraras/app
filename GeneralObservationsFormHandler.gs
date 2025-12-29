/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GENERAL OBSERVATIONS FORM HANDLER - Observações Gerais de Campo
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para observações gerais
 */
function createGeneralObservationFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Observação' },
    hora: { required: true, label: 'Hora' },
    titulo: { required: true, label: 'Título' },
    categoria: { required: true, label: 'Categoria' },
    local: { required: true, label: 'Local' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    descricao: { required: true, label: 'Descrição' },
    prioridade: { required: false, label: 'Prioridade' }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateGeneralObservationField(fieldName, value, fieldConfig) {
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
    Logger.log('Erro em validateGeneralObservationField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Processa e salva formulário de observações gerais
 */
function submitGeneralObservationForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createGeneralObservationFormHelper();
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
    
    // Validações adicionais
    if (!formData.categoria) {
      return {
        success: false,
        errors: {
          categoria: 'Categoria é obrigatória'
        }
      };
    }
    
    if (formData.descricao && formData.descricao.length < 10) {
      return {
        success: false,
        errors: {
          descricao: 'Descrição deve ter pelo menos 10 caracteres'
        }
      };
    }
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'general_observation'
    });
    
    // Adiciona ID único
    dataToSave.id = 'OBS_' + Date.now();
    
    // Define prioridade padrão se não informada
    if (!dataToSave.prioridade) {
      dataToSave.prioridade = 'media';
    }
    
    // Salva no banco de dados
    var sheetName = 'ObservacoesGerais';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Observação geral salva: ' + dataToSave.id);
    Logger.log('   Título: ' + dataToSave.titulo);
    Logger.log('   Categoria: ' + dataToSave.categoria);
    Logger.log('   Prioridade: ' + dataToSave.prioridade);
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Observação salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitGeneralObservationForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de observações gerais
 */
function openGeneralObservationsForm() {
  var html = HtmlService.createHtmlOutputFromFile('GeneralObservationsForm')
    .setWidth(600)
    .setHeight(850)
    .setTitle('📝 Observações Gerais')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Observações Gerais');
}
