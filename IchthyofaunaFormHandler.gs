/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ICHTHYOFAUNA FORM HANDLER - Registro de Ictiofauna
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para ictiofauna
 */
function createIchthyofaunaFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { required: true, label: 'Hora' },
    local: { required: true, label: 'Local da Coleta' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    metodo_coleta: { required: true, label: 'Método de Coleta' }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateIchthyofaunaField(fieldName, value, fieldConfig) {
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
    Logger.log('Erro em validateIchthyofaunaField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Valida espécies
 */
function validateSpecies(especies) {
  var errors = [];
  
  if (!especies || especies.length === 0) {
    return {
      valid: false,
      errors: ['Adicione pelo menos uma espécie']
    };
  }
  
  for (var i = 0; i < especies.length; i++) {
    var sp = especies[i];
    var speciesErrors = [];
    
    if (!sp.nome || sp.nome.trim() === '') {
      speciesErrors.push('Nome da espécie é obrigatório');
    }
    
    if (!sp.quantidade || isNaN(parseInt(sp.quantidade)) || parseInt(sp.quantidade) < 1) {
      speciesErrors.push('Quantidade deve ser um número maior que zero');
    }
    
    if (sp.comprimento_medio && (isNaN(parseFloat(sp.comprimento_medio)) || parseFloat(sp.comprimento_medio) < 0)) {
      speciesErrors.push('Comprimento médio inválido');
    }
    
    if (sp.peso_medio && (isNaN(parseFloat(sp.peso_medio)) || parseFloat(sp.peso_medio) < 0)) {
      speciesErrors.push('Peso médio inválido');
    }
    
    if (speciesErrors.length > 0) {
      errors.push('Espécie ' + (i + 1) + ': ' + speciesErrors.join(', '));
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Processa e salva formulário de ictiofauna
 */
function submitIchthyofaunaForm(formData) {
  try {
    // Cria FormHelper e valida dados básicos
    var form = createIchthyofaunaFormHelper();
    
    var basicData = {
      data: formData.data,
      hora: formData.hora,
      local: formData.local,
      latitude: formData.latitude,
      longitude: formData.longitude,
      metodo_coleta: formData.metodo_coleta
    };
    
    form.setData(basicData);
    
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
    
    // Valida espécies
    var speciesValidation = validateSpecies(formData.especies);
    if (!speciesValidation.valid) {
      return {
        success: false,
        errors: {
          _especies: speciesValidation.errors.join('; ')
        }
      };
    }
    
    // Prepara dados para salvar
    var dataToSave = form.toObject({
      includeMetadata: true,
      includeUser: true,
      formType: 'ichthyofauna_sampling'
    });
    
    // Adiciona ID único
    dataToSave.id = 'ICTIO_' + Date.now();
    
    // Adiciona espécies e estatísticas
    dataToSave.especies = formData.especies;
    dataToSave.total_especies = formData.especies.length;
    dataToSave.total_individuos = formData.especies.reduce(function(sum, sp) {
      return sum + parseInt(sp.quantidade || 0);
    }, 0);
    dataToSave.observacoes = formData.observacoes;
    
    // Salva registro principal
    var sheetName = 'RegistrosIctiofauna';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Registro de ictiofauna salvo: ' + dataToSave.id);
    Logger.log('   Total de espécies: ' + dataToSave.total_especies);
    Logger.log('   Total de indivíduos: ' + dataToSave.total_individuos);
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Registro salvo com sucesso',
      stats: {
        total_especies: dataToSave.total_especies,
        total_individuos: dataToSave.total_individuos
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitIchthyofaunaForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de ictiofauna
 */
function openIchthyofaunaForm() {
  var html = HtmlService.createHtmlOutputFromFile('IchthyofaunaForm')
    .setWidth(700)
    .setHeight(900)
    .setTitle('🐟 Registro de Ictiofauna')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Registro de Ictiofauna');
}
