/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY ALERT SERVICE - Sistema de Alertas Automáticos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 9/13: Notificações e Alertas Automáticos
 * 
 * Sistema que monitora dados limnológicos e gera alertas quando:
 * - Parâmetros excedem limites CONAMA
 * - Cobertura de macrófitas indica eutrofização
 * - Índices bióticos indicam degradação
 * - Coletas estão atrasadas
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

const ALERT_CONFIG = {
  SHEET_NAME: 'Alertas_RA',
  EMAIL_ENABLED: true,
  MAX_ALERTS_PER_DAY: 10,
  COLLECTION_INTERVAL_DAYS: 15,
  
  // Níveis de severidade
  SEVERITY: {
    CRITICAL: { level: 1, label: 'Crítico', color: '#F44336', icon: '🚨' },
    WARNING: { level: 2, label: 'Atenção', color: '#FF9800', icon: '⚠️' },
    INFO: { level: 3, label: 'Informativo', color: '#2196F3', icon: 'ℹ️' }
  }
};

// Limites para alertas
const ALERT_THRESHOLDS = {
  // Qualidade da água - CONAMA 357/2005 Classe 2
  ph: { min: 6.0, max: 9.0, critical_min: 5.0, critical_max: 10.0 },
  oxigenio_dissolvido: { min: 5.0, critical: 2.0 },
  turbidez: { max: 100, critical: 200 },
  temperatura: { max: 35, critical: 40 },
  condutividade: { max: 500, critical: 1000 },
  
  // Nutrientes
  fosforo_total: { max: 0.030, critical: 0.050 },
  nitrogenio_amoniacal: { max: 3.7, critical: 5.0 },
  
  // Macrófitas
  cobertura_macrofitas: { warning: 50, critical: 75 },
  
  // Índices bióticos
  bmwp: { warning: 35, critical: 15 },
  shannon: { warning: 2.0, critical: 1.0 }
};

// ═══════════════════════════════════════════════════════════════════════════
// GERAÇÃO DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa verificação completa e gera alertas
 * @returns {Object} Resultado da verificação
 */
function runAlertCheck() {
  Logger.log('═══ VERIFICAÇÃO DE ALERTAS ═══');
  Logger.log('Início: ' + new Date().toISOString());
  
  var alerts = [];
  
  try {
    // 1. Verifica qualidade da água
    var waterAlerts = checkWaterQualityAlerts();
    alerts = alerts.concat(waterAlerts);
    
    // 2. Verifica macrófitas
    var macroAlerts = checkMacrophyteAlerts();
    alerts = alerts.concat(macroAlerts);
    
    // 3. Verifica índices bióticos
    var bioticAlerts = checkBioticIndexAlerts();
    alerts = alerts.concat(bioticAlerts);
    
    // 4. Verifica coletas pendentes
    var pendingAlerts = checkPendingCollections();
    alerts = alerts.concat(pendingAlerts);
    
    // Salva alertas
    if (alerts.length > 0) {
      saveAlerts(alerts);
      
      // Envia notificações
      if (ALERT_CONFIG.EMAIL_ENABLED) {
        sendAlertNotifications(alerts);
      }
    }
    
    Logger.log('Total de alertas: ' + alerts.length);
    
    return {
      success: true,
      alertCount: alerts.length,
      alerts: alerts,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Erro em runAlertCheck: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Verifica alertas de qualidade da água
 */
function checkWaterQualityAlerts() {
  var alerts = [];
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QualidadeAgua');
    if (!sheet || sheet.getLastRow() < 2) return alerts;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Pega últimas 5 coletas para análise
    var recentRows = data.slice(Math.max(1, data.length - 5));
    
    recentRows.forEach(function(row) {
      var local = getValueByHeader(row, headers, 'local');
      var dataColeta = getValueByHeader(row, headers, 'data');
      
      // pH
      var ph = parseFloat(getValueByHeader(row, headers, 'ph'));
      if (!isNaN(ph)) {
        if (ph < ALERT_THRESHOLDS.ph.critical_min || ph > ALERT_THRESHOLDS.ph.critical_max) {
          alerts.push(createAlert('CRITICAL', 'pH Crítico', 
            'pH = ' + ph + ' em ' + local, 'physicochemical', local, dataColeta));
        } else if (ph < ALERT_THRESHOLDS.ph.min || ph > ALERT_THRESHOLDS.ph.max) {
          alerts.push(createAlert('WARNING', 'pH fora dos limites CONAMA', 
            'pH = ' + ph + ' (limite: 6-9) em ' + local, 'physicochemical', local, dataColeta));
        }
      }
      
      // Oxigênio dissolvido
      var od = parseFloat(getValueByHeader(row, headers, 'oxigenio_dissolvido'));
      if (!isNaN(od)) {
        if (od < ALERT_THRESHOLDS.oxigenio_dissolvido.critical) {
          alerts.push(createAlert('CRITICAL', 'Oxigênio Dissolvido Crítico', 
            'OD = ' + od + ' mg/L - Risco de mortandade em ' + local, 'physicochemical', local, dataColeta));
        } else if (od < ALERT_THRESHOLDS.oxigenio_dissolvido.min) {
          alerts.push(createAlert('WARNING', 'Oxigênio Dissolvido Baixo', 
            'OD = ' + od + ' mg/L (mín: 5) em ' + local, 'physicochemical', local, dataColeta));
        }
      }
      
      // Turbidez
      var turb = parseFloat(getValueByHeader(row, headers, 'turbidez'));
      if (!isNaN(turb)) {
        if (turb > ALERT_THRESHOLDS.turbidez.critical) {
          alerts.push(createAlert('CRITICAL', 'Turbidez Crítica', 
            'Turbidez = ' + turb + ' NTU em ' + local, 'physicochemical', local, dataColeta));
        } else if (turb > ALERT_THRESHOLDS.turbidez.max) {
          alerts.push(createAlert('WARNING', 'Turbidez Elevada', 
            'Turbidez = ' + turb + ' NTU (máx: 100) em ' + local, 'physicochemical', local, dataColeta));
        }
      }
      
      // Temperatura
      var temp = parseFloat(getValueByHeader(row, headers, 'temperatura'));
      if (!isNaN(temp) && temp > ALERT_THRESHOLDS.temperatura.max) {
        var severity = temp > ALERT_THRESHOLDS.temperatura.critical ? 'CRITICAL' : 'WARNING';
        alerts.push(createAlert(severity, 'Temperatura Elevada', 
          'Temperatura = ' + temp + '°C em ' + local, 'physicochemical', local, dataColeta));
      }
    });
    
  } catch (e) {
    Logger.log('Erro em checkWaterQualityAlerts: ' + e);
  }
  
  return alerts;
}

/**
 * Verifica alertas de macrófitas
 */
function checkMacrophyteAlerts() {
  var alerts = [];
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Macrofitas_RA');
    if (!sheet || sheet.getLastRow() < 2) return alerts;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Últimas coletas
    var recentRows = data.slice(Math.max(1, data.length - 5));
    
    recentRows.forEach(function(row) {
      var local = getValueByHeader(row, headers, 'local');
      var dataColeta = getValueByHeader(row, headers, 'data');
      var cobertura = parseFloat(getValueByHeader(row, headers, 'cobertura_percentual'));
      
      if (!isNaN(cobertura)) {
        if (cobertura >= ALERT_THRESHOLDS.cobertura_macrofitas.critical) {
          alerts.push(createAlert('CRITICAL', 'Cobertura de Macrófitas Crítica', 
            'Cobertura = ' + cobertura + '% - Possível eutrofização severa em ' + local, 
            'macrophytes', local, dataColeta));
        } else if (cobertura >= ALERT_THRESHOLDS.cobertura_macrofitas.warning) {
          alerts.push(createAlert('WARNING', 'Cobertura de Macrófitas Alta', 
            'Cobertura = ' + cobertura + '% - Monitorar eutrofização em ' + local, 
            'macrophytes', local, dataColeta));
        }
      }
    });
    
  } catch (e) {
    Logger.log('Erro em checkMacrophyteAlerts: ' + e);
  }
  
  return alerts;
}

/**
 * Verifica alertas de índices bióticos
 */
function checkBioticIndexAlerts() {
  var alerts = [];
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bentos_RA');
    if (!sheet || sheet.getLastRow() < 2) return alerts;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Última coleta com índices
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var local = getValueByHeader(row, headers, 'local');
      var dataColeta = getValueByHeader(row, headers, 'data');
      
      // BMWP
      var bmwp = parseFloat(getValueByHeader(row, headers, 'indice_bmwp'));
      if (!isNaN(bmwp)) {
        if (bmwp <= ALERT_THRESHOLDS.bmwp.critical) {
          alerts.push(createAlert('CRITICAL', 'BMWP Crítico', 
            'BMWP = ' + bmwp + ' - Qualidade muito ruim em ' + local, 'benthic', local, dataColeta));
        } else if (bmwp <= ALERT_THRESHOLDS.bmwp.warning) {
          alerts.push(createAlert('WARNING', 'BMWP Baixo', 
            'BMWP = ' + bmwp + ' - Qualidade duvidosa em ' + local, 'benthic', local, dataColeta));
        }
        break; // Só verifica última coleta com índice
      }
      
      // Shannon
      var shannon = parseFloat(getValueByHeader(row, headers, 'indice_shannon'));
      if (!isNaN(shannon)) {
        if (shannon <= ALERT_THRESHOLDS.shannon.critical) {
          alerts.push(createAlert('WARNING', 'Diversidade Baixa', 
            'Shannon H\' = ' + shannon + ' em ' + local, 'benthic', local, dataColeta));
        }
      }
    }
    
  } catch (e) {
    Logger.log('Erro em checkBioticIndexAlerts: ' + e);
  }
  
  return alerts;
}

/**
 * Verifica coletas pendentes
 */
function checkPendingCollections() {
  var alerts = [];
  var now = new Date();
  var intervalMs = ALERT_CONFIG.COLLECTION_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
  
  var modules = [
    { sheet: 'QualidadeAgua', name: 'Físico-Químico' },
    { sheet: 'Fitoplancton_RA', name: 'Fitoplâncton' },
    { sheet: 'Zooplancton_RA', name: 'Zooplâncton' },
    { sheet: 'Bentos_RA', name: 'Bentos' },
    { sheet: 'Ictiofauna_RA', name: 'Ictiofauna' }
  ];
  
  try {
    modules.forEach(function(mod) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(mod.sheet);
      if (!sheet || sheet.getLastRow() < 2) {
        alerts.push(createAlert('INFO', 'Sem dados de ' + mod.name, 
          'Nenhuma coleta registrada para ' + mod.name, mod.sheet.toLowerCase(), '', null));
        return;
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var lastRow = data[data.length - 1];
      var lastDate = getValueByHeader(lastRow, headers, 'data');
      
      if (lastDate instanceof Date) {
        var daysSince = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));
        
        if (daysSince > ALERT_CONFIG.COLLECTION_INTERVAL_DAYS * 2) {
          alerts.push(createAlert('WARNING', 'Coleta Muito Atrasada', 
            mod.name + ': última coleta há ' + daysSince + ' dias', mod.sheet.toLowerCase(), '', lastDate));
        } else if (daysSince > ALERT_CONFIG.COLLECTION_INTERVAL_DAYS) {
          alerts.push(createAlert('INFO', 'Coleta Pendente', 
            mod.name + ': última coleta há ' + daysSince + ' dias', mod.sheet.toLowerCase(), '', lastDate));
        }
      }
    });
    
  } catch (e) {
    Logger.log('Erro em checkPendingCollections: ' + e);
  }
  
  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTÊNCIA DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cria objeto de alerta
 */
function createAlert(severity, title, description, module, location, dataColeta) {
  var config = ALERT_CONFIG.SEVERITY[severity] || ALERT_CONFIG.SEVERITY.INFO;
  
  return {
    id: Utilities.getUuid(),
    timestamp: new Date().toISOString(),
    severity: severity,
    severityLevel: config.level,
    severityLabel: config.label,
    icon: config.icon,
    color: config.color,
    title: title,
    description: description,
    module: module,
    location: location || '',
    dataColeta: dataColeta instanceof Date ? dataColeta.toISOString() : (dataColeta || ''),
    status: 'ACTIVE',
    acknowledgedBy: '',
    acknowledgedAt: ''
  };
}

/**
 * Salva alertas na planilha
 */
function saveAlerts(alerts) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(ALERT_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(ALERT_CONFIG.SHEET_NAME);
      sheet.appendRow([
        'ID', 'Timestamp', 'Severidade', 'Nível', 'Título', 'Descrição', 
        'Módulo', 'Local', 'Data Coleta', 'Status', 'Reconhecido Por', 'Reconhecido Em'
      ]);
      sheet.getRange(1, 1, 1, 12).setBackground('#00796B').setFontColor('white').setFontWeight('bold');
    }
    
    alerts.forEach(function(alert) {
      sheet.appendRow([
        alert.id,
        alert.timestamp,
        alert.severityLabel,
        alert.severityLevel,
        alert.title,
        alert.description,
        alert.module,
        alert.location,
        alert.dataColeta,
        alert.status,
        alert.acknowledgedBy,
        alert.acknowledgedAt
      ]);
      
      // Aplica cor baseada na severidade
      var lastRow = sheet.getLastRow();
      if (alert.severity === 'CRITICAL') {
        sheet.getRange(lastRow, 1, 1, 12).setBackground('#FFEBEE');
      } else if (alert.severity === 'WARNING') {
        sheet.getRange(lastRow, 1, 1, 12).setBackground('#FFF3E0');
      }
    });
    
    Logger.log('✓ ' + alerts.length + ' alertas salvos');
    
  } catch (e) {
    Logger.log('Erro em saveAlerts: ' + e);
  }
}

/**
 * Obtém alertas ativos
 */
function getActiveAlerts() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALERT_CONFIG.SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var alerts = [];
    
    for (var i = 1; i < data.length; i++) {
      var status = data[i][headers.indexOf('Status')];
      if (status === 'ACTIVE') {
        alerts.push({
          id: data[i][0],
          timestamp: data[i][1],
          severity: data[i][2],
          level: data[i][3],
          title: data[i][4],
          description: data[i][5],
          module: data[i][6],
          location: data[i][7],
          row: i + 1
        });
      }
    }
    
    // Ordena por nível de severidade
    alerts.sort(function(a, b) { return a.level - b.level; });
    
    return alerts;
    
  } catch (e) {
    Logger.log('Erro em getActiveAlerts: ' + e);
    return [];
  }
}

/**
 * Reconhece (acknowledge) um alerta
 */
function acknowledgeAlert(alertId) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALERT_CONFIG.SHEET_NAME);
    if (!sheet) return { success: false, error: 'Planilha não encontrada' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idIdx = headers.indexOf('ID');
    var statusIdx = headers.indexOf('Status');
    var ackByIdx = headers.indexOf('Reconhecido Por');
    var ackAtIdx = headers.indexOf('Reconhecido Em');
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][idIdx] === alertId) {
        var row = i + 1;
        sheet.getRange(row, statusIdx + 1).setValue('ACKNOWLEDGED');
        sheet.getRange(row, ackByIdx + 1).setValue(Session.getActiveUser().getEmail());
        sheet.getRange(row, ackAtIdx + 1).setValue(new Date().toISOString());
        sheet.getRange(row, 1, 1, 12).setBackground('#E8F5E9');
        
        return { success: true, message: 'Alerta reconhecido' };
      }
    }
    
    return { success: false, error: 'Alerta não encontrado' };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICAÇÕES POR EMAIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Envia notificações por email
 */
function sendAlertNotifications(alerts) {
  try {
    // Filtra apenas alertas críticos e warnings
    var importantAlerts = alerts.filter(function(a) {
      return a.severity === 'CRITICAL' || a.severity === 'WARNING';
    });
    
    if (importantAlerts.length === 0) return;
    
    var recipients = getAlertRecipients();
    if (recipients.length === 0) {
      Logger.log('Nenhum destinatário configurado para alertas');
      return;
    }
    
    var subject = '🚨 Alertas Limnológicos - Reserva Araras (' + importantAlerts.length + ')';
    var body = buildAlertEmailBody(importantAlerts);
    
    recipients.forEach(function(email) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: body
        });
        Logger.log('✓ Email enviado para: ' + email);
      } catch (e) {
        Logger.log('✗ Erro ao enviar email para ' + email + ': ' + e);
      }
    });
    
  } catch (e) {
    Logger.log('Erro em sendAlertNotifications: ' + e);
  }
}

/**
 * Constrói corpo do email de alertas
 */
function buildAlertEmailBody(alerts) {
  var html = '<html><head><style>';
  html += 'body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }';
  html += '.header { background: #00796B; color: white; padding: 20px; text-align: center; }';
  html += '.alert { margin: 15px; padding: 15px; border-radius: 8px; border-left: 4px solid; }';
  html += '.critical { background: #FFEBEE; border-color: #F44336; }';
  html += '.warning { background: #FFF3E0; border-color: #FF9800; }';
  html += '.alert-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }';
  html += '.alert-desc { color: #666; }';
  html += '.alert-meta { font-size: 12px; color: #999; margin-top: 10px; }';
  html += '.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }';
  html += '</style></head><body>';
  
  html += '<div class="header">';
  html += '<h1>🌊 Alertas Limnológicos</h1>';
  html += '<p>Reserva Araras - Sistema de Monitoramento</p>';
  html += '</div>';
  
  html += '<p style="padding: 15px;">Foram detectados <strong>' + alerts.length + ' alerta(s)</strong> que requerem atenção:</p>';
  
  alerts.forEach(function(alert) {
    var cssClass = alert.severity === 'CRITICAL' ? 'critical' : 'warning';
    html += '<div class="alert ' + cssClass + '">';
    html += '<div class="alert-title">' + alert.icon + ' ' + alert.title + '</div>';
    html += '<div class="alert-desc">' + alert.description + '</div>';
    html += '<div class="alert-meta">Módulo: ' + alert.module + ' | Local: ' + (alert.location || 'N/A') + '</div>';
    html += '</div>';
  });
  
  html += '<div class="footer">';
  html += '<p>Este é um email automático do Sistema de Monitoramento Limnológico.</p>';
  html += '<p>Gerado em: ' + new Date().toLocaleString('pt-BR') + '</p>';
  html += '</div>';
  
  html += '</body></html>';
  return html;
}

/**
 * Obtém lista de destinatários de alertas
 */
function getAlertRecipients() {
  try {
    // Tenta obter de propriedades do script
    var props = PropertiesService.getScriptProperties();
    var recipients = props.getProperty('ALERT_RECIPIENTS');
    
    if (recipients) {
      return recipients.split(',').map(function(e) { return e.trim(); });
    }
    
    // Fallback: usa email do proprietário da planilha
    var owner = SpreadsheetApp.getActiveSpreadsheet().getOwner();
    if (owner) {
      return [owner.getEmail()];
    }
    
    return [];
    
  } catch (e) {
    Logger.log('Erro em getAlertRecipients: ' + e);
    return [];
  }
}

/**
 * Configura destinatários de alertas
 */
function setAlertRecipients(emails) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ALERT_RECIPIENTS', emails.join(','));
  return { success: true, recipients: emails };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERS AUTOMÁTICOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configura trigger diário para verificação de alertas
 */
function setupDailyAlertTrigger() {
  // Remove triggers existentes
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runAlertCheck') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger diário às 8h
  ScriptApp.newTrigger('runAlertCheck')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  
  Logger.log('✓ Trigger diário configurado para 8h');
  return { success: true, message: 'Trigger configurado' };
}

/**
 * Remove trigger de alertas
 */
function removeDailyAlertTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runAlertCheck') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });
  
  return { success: true, removed: removed };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém valor por nome do header
 */
function getValueByHeader(row, headers, headerName) {
  var idx = headers.indexOf(headerName);
  return idx !== -1 ? row[idx] : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE DE MENU
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Menu: Verificar alertas agora
 */
function menuRunAlertCheck() {
  var result = runAlertCheck();
  var ui = SpreadsheetApp.getUi();
  
  if (result.success) {
    if (result.alertCount > 0) {
      ui.alert('⚠️ Alertas Detectados', 
        result.alertCount + ' alerta(s) encontrado(s).\n\nVerifique a aba "' + ALERT_CONFIG.SHEET_NAME + '".',
        ui.ButtonSet.OK);
    } else {
      ui.alert('✓ Verificação Concluída', 
        'Nenhum alerta detectado. Todos os parâmetros dentro dos limites.',
        ui.ButtonSet.OK);
    }
  } else {
    ui.alert('✗ Erro', 'Erro na verificação: ' + result.error, ui.ButtonSet.OK);
  }
}

/**
 * Menu: Configurar alertas
 */
function menuConfigureAlerts() {
  var ui = SpreadsheetApp.getUi();
  var currentRecipients = getAlertRecipients().join(', ');
  
  var result = ui.prompt('Configurar Destinatários',
    'Emails para receber alertas (separados por vírgula):\n\nAtual: ' + (currentRecipients || 'Nenhum'),
    ui.ButtonSet.OK_CANCEL);
  
  if (result.getSelectedButton() === ui.Button.OK) {
    var emails = result.getResponseText().split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e; });
    setAlertRecipients(emails);
    ui.alert('✓ Configuração Salva', 'Destinatários: ' + emails.join(', '), ui.ButtonSet.OK);
  }
}

/**
 * Menu: Ativar verificação diária
 */
function menuSetupDailyTrigger() {
  var result = setupDailyAlertTrigger();
  SpreadsheetApp.getUi().alert('✓ Trigger Configurado', 
    'Verificação automática ativada para todos os dias às 8h.', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}
