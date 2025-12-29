/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BENTHIC FORM HANDLER - Amostragem de Organismos Bentônicos
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para bentônicos
 */
function createBenthicFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { required: true, label: 'Hora' },
    local: { required: true, label: 'Local da Coleta' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    metodo_coleta: { required: true, label: 'Método de Coleta' },
    profundidade: { required: true, type: 'number', label: 'Profundidade', min: 0, max: 100 },
    area_amostrada: { required: true, type: 'number', label: 'Área Amostrada', min: 0.01, max: 10 },
    tipo_substrato: { required: true, label: 'Tipo de Substrato' },
    abundancia_total: { required: true, type: 'number', label: 'Abundância Total', min: 0 }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateBenthicField(fieldName, value, fieldConfig) {
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
    Logger.log('Erro em validateBenthicField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Processa e salva formulário de bentônicos
 */
function submitBenthicForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createBenthicFormHelper();
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
    
    // Valida grupos taxonômicos
    if (!formData.grupos_taxonomicos || formData.grupos_taxonomicos.length === 0) {
      return {
        success: false,
        errors: {
          grupos_taxonomicos: 'Selecione pelo menos um grupo taxonômico'
        }
      };
    }
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'benthic_sampling'
    });
    
    // Adiciona ID único
    dataToSave.id = 'BENT_' + Date.now();
    
    // Adiciona grupos taxonômicos
    dataToSave.grupos_taxonomicos = Array.isArray(formData.grupos_taxonomicos) 
      ? formData.grupos_taxonomicos 
      : formData.grupos_taxonomicos.split(',');
    dataToSave.numero_grupos = dataToSave.grupos_taxonomicos.length;
    
    // Adiciona campos opcionais
    if (formData.riqueza_taxa) dataToSave.riqueza_taxa = formData.riqueza_taxa;
    if (formData.temperatura) dataToSave.temperatura = formData.temperatura;
    if (formData.oxigenio) dataToSave.oxigenio = formData.oxigenio;
    if (formData.ph) dataToSave.ph = formData.ph;
    if (formData.condicao_substrato) dataToSave.condicao_substrato = formData.condicao_substrato;
    if (formData.observacoes) dataToSave.observacoes = formData.observacoes;
    
    // Salva no banco de dados
    var sheetName = 'AmostragemBentonica';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Amostragem bentônica salva: ' + dataToSave.id);
    Logger.log('   Profundidade: ' + dataToSave.profundidade + 'm');
    Logger.log('   Substrato: ' + dataToSave.tipo_substrato);
    Logger.log('   Grupos taxonômicos: ' + dataToSave.grupos_taxonomicos.join(', '));
    Logger.log('   Abundância: ' + dataToSave.abundancia_total + ' ind/m²');
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Amostra salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitBenthicForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de bentônicos
 */
function openBenthicForm() {
  var html = HtmlService.createHtmlOutputFromFile('BenthicForm')
    .setWidth(650)
    .setHeight(900)
    .setTitle('🦀 Amostragem Bentônica')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Amostragem Bentônica');
}
