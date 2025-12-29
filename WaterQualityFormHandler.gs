/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WATER QUALITY FORM HANDLER - Qualidade da Água
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handler para formulário de qualidade da água (AguaForm.html)
 * Baseado em CONAMA 357/2005 para classificação de corpos d'água
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Constantes de referência CONAMA 357/2005
 */
const CONAMA_LIMITS = {
  CLASSE_1: {
    pH: { min: 6.0, max: 9.0 },
    oxigenio_dissolvido: { min: 6.0 },
    turbidez: { max: 40 },
    coliformes: { max: 200 }
  },
  CLASSE_2: {
    pH: { min: 6.0, max: 9.0 },
    oxigenio_dissolvido: { min: 5.0 },
    turbidez: { max: 100 },
    coliformes: { max: 1000 }
  }
};

/**
 * Cria instância do FormHelper para qualidade da água
 */
function createWaterQualityFormHelper() {
  const form = FormHelper.create();
  
  form.defineFields({
    local: { required: true, label: 'Local da Coleta', minLength: 2 },
    data: { required: true, type: 'date', label: 'Data da Coleta' },
    hora: { label: 'Hora da Coleta' },
    ph: { type: 'number', label: 'pH', min: 0, max: 14 },
    turbidez: { type: 'number', label: 'Turbidez', min: 0, unit: 'NTU' },
    od: { type: 'number', label: 'Oxigênio Dissolvido', min: 0, max: 20, unit: 'mg/L' },
    temperatura: { type: 'number', label: 'Temperatura', min: 0, max: 50, unit: '°C' },
    condutividade: { type: 'number', label: 'Condutividade', min: 0, unit: 'µS/cm' },
    coliformes: { type: 'number', label: 'Coliformes', min: 0, unit: 'NMP/100mL' },
    observacoes: { label: 'Observações' }
  });
  
  return form;
}

/**
 * Classifica qualidade da água baseado em CONAMA 357/2005
 * @param {Object} data - Dados da análise
 * @returns {Object} Classificação e alertas
 */
function classifyWaterQuality(data) {
  // INTERVENÇÃO 2/13: Validação defensiva para evitar erro de undefined
  if (!data || typeof data !== 'object') {
    Logger.log('[classifyWaterQuality] Dados inválidos ou undefined recebidos');
    return {
      classe: 0,
      classificacao: 'Dados Insuficientes',
      alerts: [{
        param: 'Dados',
        value: null,
        status: 'ERRO',
        message: 'Dados de análise não fornecidos ou inválidos'
      }],
      hasAlerts: true
    };
  }
  
  const alerts = [];
  let worstClass = 1;
  
  // pH - com validação defensiva
  const ph = data.ph !== undefined && data.ph !== null ? parseFloat(data.ph) : null;
  if (ph !== null && !isNaN(ph)) {
    if (ph < 6.0 || ph > 9.0) {
      alerts.push({
        param: 'pH',
        value: ph,
        status: 'FORA_PADRAO',
        message: `pH ${ph} fora do padrão CONAMA (6.0-9.0)`
      });
      worstClass = Math.max(worstClass, 3);
    }
  }
  
  // Oxigênio Dissolvido - com validação defensiva
  const od = data.od !== undefined && data.od !== null ? parseFloat(data.od) : null;
  if (od !== null && !isNaN(od)) {
    if (od < 5.0) {
      alerts.push({
        param: 'Oxigênio Dissolvido',
        value: od,
        status: 'BAIXO',
        message: `OD ${od} mg/L abaixo do mínimo Classe 2 (5.0 mg/L)`
      });
      worstClass = Math.max(worstClass, 3);
    } else if (od < 6.0) {
      worstClass = Math.max(worstClass, 2);
    }
  }
  
  // Turbidez - com validação defensiva
  const turbidez = data.turbidez !== undefined && data.turbidez !== null ? parseFloat(data.turbidez) : null;
  if (turbidez !== null && !isNaN(turbidez)) {
    if (turbidez > 100) {
      alerts.push({
        param: 'Turbidez',
        value: turbidez,
        status: 'ALTA',
        message: `Turbidez ${turbidez} NTU acima do limite Classe 2 (100 NTU)`
      });
      worstClass = Math.max(worstClass, 3);
    } else if (turbidez > 40) {
      worstClass = Math.max(worstClass, 2);
    }
  }
  
  // Coliformes - com validação defensiva
  const coliformes = data.coliformes !== undefined && data.coliformes !== null ? parseFloat(data.coliformes) : null;
  if (coliformes !== null && !isNaN(coliformes)) {
    if (coliformes > 1000) {
      alerts.push({
        param: 'Coliformes',
        value: coliformes,
        status: 'ALTO',
        message: `Coliformes ${coliformes} NMP/100mL acima do limite Classe 2`
      });
      worstClass = Math.max(worstClass, 3);
    } else if (coliformes > 200) {
      worstClass = Math.max(worstClass, 2);
    }
  }
  
  const classNames = {
    1: 'Classe 1 - Excelente',
    2: 'Classe 2 - Boa',
    3: 'Classe 3 - Regular',
    4: 'Classe 4 - Ruim'
  };
  
  return {
    classe: worstClass,
    classificacao: classNames[worstClass],
    alerts: alerts,
    hasAlerts: alerts.length > 0
  };
}

/**
 * Salva análise de qualidade da água
 * Chamada pelo AguaForm.html
 * @param {Object} formData - Dados do formulário
 * @returns {Object} Resultado da operação
 */
function saveQualidadeAgua(formData) {
  try {
    // Cria FormHelper e valida
    const form = createWaterQualityFormHelper();
    form.setData(formData);
    
    const validation = form.validate();
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // Prepara dados para salvar
    const dataToSave = {
      id: 'AGUA_' + Date.now(),
      timestamp: new Date(),
      data: formData.data,
      hora: formData.hora || '',
      local: formData.local,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      pH: formData.ph !== null ? parseFloat(formData.ph) : null,
      oxigenio_dissolvido: formData.od !== null ? parseFloat(formData.od) : null,
      turbidez: formData.turbidez !== null ? parseFloat(formData.turbidez) : null,
      temperatura: formData.temperatura !== null ? parseFloat(formData.temperatura) : null,
      condutividade: formData.condutividade !== null ? parseFloat(formData.condutividade) : null,
      coliformes_termotolerantes: formData.coliformes !== null ? parseInt(formData.coliformes) : null,
      observacoes: formData.observacoes || '',
      responsavel: Session.getActiveUser().getEmail() || 'Sistema'
    };
    
    // Classifica qualidade
    const classification = classifyWaterQuality({
      ph: dataToSave.pH,
      od: dataToSave.oxigenio_dissolvido,
      turbidez: dataToSave.turbidez,
      coliformes: dataToSave.coliformes_termotolerantes
    });
    
    dataToSave.classe_conama = classification.classe;
    dataToSave.classificacao = classification.classificacao;
    
    // Salva no banco de dados usando o schema
    const sheetName = CONFIG.SHEETS.QUALIDADE_AGUA || 'QualidadeAgua';
    const result = DatabaseService.create(sheetName, dataToSave);
    
    if (!result.success) {
      return {
        success: false,
        error: 'Erro ao salvar no banco de dados: ' + (result.error || 'Erro desconhecido')
      };
    }
    
    // Cria alertas se necessário
    if (classification.hasAlerts) {
      classification.alerts.forEach(alert => {
        try {
          if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
            EcologicalAlertSystem.createAlert({
              tipo: 'MEDIO',
              categoria: 'QUALIDADE_AGUA',
              mensagem: alert.message,
              local: formData.local,
              dados: {
                parametro: alert.param,
                valor: alert.value,
                analise_id: dataToSave.id
              }
            });
          }
        } catch (e) {
          Logger.log('Erro ao criar alerta: ' + e);
        }
      });
    }
    
    Logger.log('✅ Análise de água salva: ' + dataToSave.id);
    Logger.log('   Local: ' + dataToSave.local);
    Logger.log('   Classificação: ' + classification.classificacao);
    if (classification.hasAlerts) {
      Logger.log('   ⚠️ Alertas: ' + classification.alerts.length);
    }
    
    return {
      success: true,
      id: dataToSave.id,
      classificacao: classification,
      message: 'Análise salva com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro em saveQualidadeAgua: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Valida campo individual do formulário de água
 * @param {string} fieldName - Nome do campo
 * @param {*} value - Valor do campo
 * @returns {Object} Resultado da validação
 */
function validateWaterQualityField(fieldName, value) {
  try {
    const form = createWaterQualityFormHelper();
    const data = {};
    data[fieldName] = value;
    form.setData(data);
    
    const validation = form.validate();
    
    if (!validation.valid && validation.errors[fieldName]) {
      return {
        valid: false,
        message: validation.errors[fieldName]
      };
    }
    
    // Validações específicas com feedback CONAMA
    if (fieldName === 'ph' && value !== null && value !== '') {
      const ph = parseFloat(value);
      if (ph < 6.0 || ph > 9.0) {
        return {
          valid: true,
          warning: `pH ${ph} fora do padrão CONAMA 357/2005 (6.0-9.0)`
        };
      }
    }
    
    if (fieldName === 'od' && value !== null && value !== '') {
      const od = parseFloat(value);
      if (od < 5.0) {
        return {
          valid: true,
          warning: `OD ${od} mg/L abaixo do mínimo para Classe 2 (5.0 mg/L)`
        };
      }
    }
    
    return { valid: true };
    
  } catch (error) {
    return {
      valid: false,
      message: 'Erro na validação: ' + error.toString()
    };
  }
}

/**
 * Abre formulário de qualidade da água
 */
function openWaterQualityForm() {
  const html = HtmlService.createHtmlOutputFromFile('AguaForm')
    .setWidth(600)
    .setHeight(800)
    .setTitle('💧 Qualidade da Água')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Análise de Qualidade da Água');
}

/**
 * Obtém últimas análises de um local
 * @param {string} local - Nome do local
 * @param {number} limit - Limite de registros
 * @returns {Object} Últimas análises
 */
function getWaterQualityHistory(local, limit) {
  try {
    const sheetName = CONFIG.SHEETS.QUALIDADE_AGUA || 'QualidadeAgua';
    const result = DatabaseService.read(sheetName, { local: local }, { limit: limit || 10 });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return {
      success: true,
      local: local,
      count: result.data.length,
      analises: result.data
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
