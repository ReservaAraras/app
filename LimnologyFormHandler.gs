/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY FORM HANDLER - Monitoramento Limnológico
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Cria instância do FormHelper para limnologia
 */
function createLimnologyFormHelper() {
  var form = FormHelper.create();
  
  form.defineFields({
    data: { required: true, type: 'date', label: 'Data da Medição' },
    hora: { required: true, label: 'Hora' },
    corpo_agua: { required: true, label: 'Corpo d\'Água' },
    local: { required: true, label: 'Local Específico' },
    latitude: { required: true, type: 'number', label: 'Latitude', min: -90, max: 90 },
    longitude: { required: true, type: 'number', label: 'Longitude', min: -180, max: 180 },
    nivel_agua: { required: true, type: 'number', label: 'Nível da Água', min: 0, max: 100 }
  });
  
  return form;
}

/**
 * Valida campo individual do formulário
 */
function validateLimnologyField(fieldName, value, fieldConfig) {
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
    Logger.log('Erro em validateLimnologyField: ' + error);
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Processa e salva formulário de limnologia
 */
function submitLimnologyForm(formData) {
  try {
    // Cria FormHelper e valida
    var form = createLimnologyFormHelper();
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
      formType: 'limnology_measurement'
    });
    
    // Adiciona ID único
    dataToSave.id = 'LIMNO_' + Date.now();
    
    // Adiciona campos opcionais
    if (formData.cota_altimetrica) dataToSave.cota_altimetrica = formData.cota_altimetrica;
    if (formData.variacao_24h) dataToSave.variacao_24h = formData.variacao_24h;
    if (formData.largura) dataToSave.largura = formData.largura;
    if (formData.profundidade_max) dataToSave.profundidade_max = formData.profundidade_max;
    if (formData.vazao) dataToSave.vazao = formData.vazao;
    if (formData.transparencia) dataToSave.transparencia = formData.transparencia;
    if (formData.temperatura_agua) dataToSave.temperatura_agua = formData.temperatura_agua;
    if (formData.condicoes_climaticas) dataToSave.condicoes_climaticas = formData.condicoes_climaticas;
    if (formData.regime_hidrologico) dataToSave.regime_hidrologico = formData.regime_hidrologico;
    if (formData.observacoes) dataToSave.observacoes = formData.observacoes;
    
    // Salva no banco de dados
    var sheetName = 'MonitoramentoLimnologico';
    var result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        errors: { _general: 'Erro ao salvar no banco de dados' }
      };
    }
    
    Logger.log('✅ Medição limnológica salva: ' + dataToSave.id);
    Logger.log('   Corpo d\'água: ' + dataToSave.corpo_agua);
    Logger.log('   Nível: ' + dataToSave.nivel_agua + 'm');
    
    if (formData.variacao_24h) {
      var variacao = parseFloat(formData.variacao_24h);
      if (variacao !== 0) {
        Logger.log('   Variação 24h: ' + (variacao > 0 ? '+' : '') + variacao + 'cm');
      }
    }
    
    return {
      success: true,
      id: dataToSave.id,
      message: 'Medição salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em submitLimnologyForm: ' + error);
    return {
      success: false,
      errors: { _general: error.toString() }
    };
  }
}

/**
 * Abre formulário de limnologia básico
 * NOTA: openLimnologyForm(formType) com parâmetro está em LimnologyFormHandlers.gs
 */
function openBasicLimnologyForm() {
  var html = HtmlService.createHtmlOutputFromFile('LimnologyForm')
    .setWidth(650)
    .setHeight(900)
    .setTitle('📏 Monitoramento Limnológico')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Monitoramento Limnológico');
}
