/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION SERVICE - Sistema de Notificações e Alertas
 * ═══════════════════════════════════════════════════════════════════════════
 */

var NotificationService = (function() {
  'use strict';
  
  /**
   * Regras de alerta por tipo de parâmetro
   */
  var ALERT_RULES = {
    // Físico-químicos
    ph: {
      min: 6.0,
      max: 9.0,
      critical_min: 5.0,
      critical_max: 10.0,
      message: 'pH fora da faixa ideal (6.0-9.0)'
    },
    
    oxigenio_dissolvido: {
      min: 5.0,
      critical_min: 3.0,
      message: 'Oxigênio dissolvido abaixo do mínimo (< 5 mg/L)'
    },
    
    turbidez: {
      max: 5.0,
      warning_max: 10.0,
      message: 'Turbidez acima do ideal (> 5 NTU)'
    },
    
    dbo: {
      max: 5.0,
      warning_max: 10.0,
      message: 'DBO elevada (> 5 mg/L)'
    },
    
    fosforo: {
      max: 0.030,
      warning_max: 0.050,
      message: 'Fósforo total elevado - risco de eutrofização'
    },
    
    ecoli: {
      max: 0,
      message: 'E. coli detectada - contaminação fecal'
    },
    
    // Macrófitas
    cobertura_percentual: {
      warning_max: 50,
      critical_max: 75,
      message: 'Cobertura de macrófitas elevada'
    },
    
    // Limnologia
    variacao_24h: {
      warning_abs: 15,
      critical_abs: 30,
      message: 'Variação de nível significativa em 24h'
    }
  };
  
  /**
   * Configurações de notificação
   */
  var config = {
    enabled: true,
    checkInterval: 24, // horas
    emailRecipients: [],
    lastCheck: null
  };
  
  /**
   * Carrega configurações
   */
  function loadConfig() {
    try {
      var props = PropertiesService.getScriptProperties();
      var saved = props.getProperty('notificationConfig');
      
      if (saved) {
        var savedConfig = JSON.parse(saved);
        config = Object.assign(config, savedConfig);
      }
      
      return config;
    } catch (error) {
      Logger.log('Erro ao carregar configurações: ' + error);
      return config;
    }
  }
  
  /**
   * Salva configurações
   */
  function saveConfig(newConfig) {
    try {
      config = Object.assign(config, newConfig);
      
      var props = PropertiesService.getScriptProperties();
      props.setProperty('notificationConfig', JSON.stringify(config));
      
      return { success: true };
    } catch (error) {
      Logger.log('Erro ao salvar configurações: ' + error);
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Verifica se deve executar checagem
   */
  function shouldCheckAlerts() {
    if (!config.enabled) return false;
    if (!config.lastCheck) return true;
    
    var now = new Date();
    var lastCheck = new Date(config.lastCheck);
    var hoursSinceLastCheck = (now - lastCheck) / (1000 * 60 * 60);
    
    return hoursSinceLastCheck >= config.checkInterval;
  }
  
  /**
   * Verifica alertas em todos os dados recentes
   */
  function checkAllAlerts(daysBack) {
    try {
      daysBack = daysBack || 7;
      
      if (!shouldCheckAlerts()) {
        return {
          success: true,
          skipped: true,
          message: 'Checagem não necessária no momento'
        };
      }
      
      var alerts = [];
      var endDate = new Date();
      var startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      // Verifica dados físico-químicos
      alerts = alerts.concat(checkPhysicochemicalAlerts(startDate, endDate));
      
      // Verifica macrófitas
      alerts = alerts.concat(checkMacrophytesAlerts(startDate, endDate));
      
      // Verifica limnologia
      alerts = alerts.concat(checkLimnologyAlerts(startDate, endDate));
      
      // Atualiza última checagem
      config.lastCheck = new Date();
      saveConfig(config);
      
      // Envia notificações se houver alertas críticos
      if (alerts.length > 0) {
        sendAlertNotifications(alerts);
      }
      
      // Salva alertas no histórico
      saveAlertsToHistory(alerts);
      
      Logger.log('✅ Checagem de alertas concluída: ' + alerts.length + ' alertas encontrados');
      
      return {
        success: true,
        alertCount: alerts.length,
        alerts: alerts,
        lastCheck: config.lastCheck
      };
      
    } catch (error) {
      Logger.log('❌ Erro em checkAllAlerts: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Verifica alertas físico-químicos
   */
  function checkPhysicochemicalAlerts(startDate, endDate) {
    var alerts = [];
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('AnalisesFisicoQuimicas');
      
      if (!sheet) return alerts;
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return alerts;
      
      var headers = data[0];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowObj = {};
        
        for (var j = 0; j < headers.length; j++) {
          rowObj[headers[j]] = row[j];
        }
        
        var rowDate = rowObj.data ? new Date(rowObj.data) : null;
        if (!rowDate || rowDate < startDate || rowDate > endDate) continue;
        
        // Verifica cada parâmetro
        for (var param in ALERT_RULES) {
          if (rowObj[param] !== undefined && rowObj[param] !== '') {
            var alert = checkParameterAlert(param, rowObj[param], rowObj);
            if (alert) {
              alert.source = 'Físico-Química';
              alert.date = rowDate;
              alert.location = rowObj.local || 'Não especificado';
              alerts.push(alert);
            }
          }
        }
      }
    } catch (error) {
      Logger.log('Erro em checkPhysicochemicalAlerts: ' + error);
    }
    
    return alerts;
  }
  
  /**
   * Verifica alertas de macrófitas
   */
  function checkMacrophytesAlerts(startDate, endDate) {
    var alerts = [];
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('MacrofitasAquaticas');
      
      if (!sheet) return alerts;
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return alerts;
      
      var headers = data[0];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowObj = {};
        
        for (var j = 0; j < headers.length; j++) {
          rowObj[headers[j]] = row[j];
        }
        
        var rowDate = rowObj.data ? new Date(rowObj.data) : null;
        if (!rowDate || rowDate < startDate || rowDate > endDate) continue;
        
        // Verifica cobertura
        if (rowObj.cobertura_percentual) {
          var alert = checkParameterAlert('cobertura_percentual', rowObj.cobertura_percentual, rowObj);
          if (alert) {
            alert.source = 'Macrófitas';
            alert.date = rowDate;
            alert.location = rowObj.local || 'Não especificado';
            alert.species = rowObj.especie_predominante || 'Não identificada';
            alerts.push(alert);
          }
        }
      }
    } catch (error) {
      Logger.log('Erro em checkMacrophytesAlerts: ' + error);
    }
    
    return alerts;
  }
  
  /**
   * Verifica alertas de limnologia
   */
  function checkLimnologyAlerts(startDate, endDate) {
    var alerts = [];
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('MonitoramentoLimnologico');
      
      if (!sheet) return alerts;
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return alerts;
      
      var headers = data[0];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowObj = {};
        
        for (var j = 0; j < headers.length; j++) {
          rowObj[headers[j]] = row[j];
        }
        
        var rowDate = rowObj.data ? new Date(rowObj.data) : null;
        if (!rowDate || rowDate < startDate || rowDate > endDate) continue;
        
        // Verifica variação de nível
        if (rowObj.variacao_24h) {
          var alert = checkParameterAlert('variacao_24h', rowObj.variacao_24h, rowObj);
          if (alert) {
            alert.source = 'Limnologia';
            alert.date = rowDate;
            alert.location = rowObj.local || 'Não especificado';
            alert.waterBody = rowObj.corpo_agua || 'Não especificado';
            alerts.push(alert);
          }
        }
      }
    } catch (error) {
      Logger.log('Erro em checkLimnologyAlerts: ' + error);
    }
    
    return alerts;
  }
  
  /**
   * Verifica alerta de um parâmetro específico
   */
  function checkParameterAlert(paramName, value, context) {
    var rule = ALERT_RULES[paramName];
    if (!rule) return null;
    
    var numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    
    var alert = null;
    
    // Verifica mínimos críticos
    if (rule.critical_min !== undefined && numValue < rule.critical_min) {
      alert = {
        severity: 'CRITICAL',
        parameter: paramName,
        value: numValue,
        threshold: rule.critical_min,
        message: rule.message,
        detail: 'Valor crítico: ' + numValue + ' (mínimo crítico: ' + rule.critical_min + ')'
      };
    }
    // Verifica máximos críticos
    else if (rule.critical_max !== undefined && numValue > rule.critical_max) {
      alert = {
        severity: 'CRITICAL',
        parameter: paramName,
        value: numValue,
        threshold: rule.critical_max,
        message: rule.message,
        detail: 'Valor crítico: ' + numValue + ' (máximo crítico: ' + rule.critical_max + ')'
      };
    }
    // Verifica mínimos normais
    else if (rule.min !== undefined && numValue < rule.min) {
      alert = {
        severity: 'WARNING',
        parameter: paramName,
        value: numValue,
        threshold: rule.min,
        message: rule.message,
        detail: 'Valor abaixo do ideal: ' + numValue + ' (mínimo: ' + rule.min + ')'
      };
    }
    // Verifica máximos normais
    else if (rule.max !== undefined && numValue > rule.max) {
      alert = {
        severity: 'WARNING',
        parameter: paramName,
        value: numValue,
        threshold: rule.max,
        message: rule.message,
        detail: 'Valor acima do ideal: ' + numValue + ' (máximo: ' + rule.max + ')'
      };
    }
    // Verifica avisos
    else if (rule.warning_max !== undefined && numValue > rule.warning_max) {
      alert = {
        severity: 'INFO',
        parameter: paramName,
        value: numValue,
        threshold: rule.warning_max,
        message: rule.message,
        detail: 'Valor de atenção: ' + numValue + ' (limite: ' + rule.warning_max + ')'
      };
    }
    // Verifica valores absolutos (como variação)
    else if (rule.warning_abs !== undefined && Math.abs(numValue) > rule.warning_abs) {
      alert = {
        severity: Math.abs(numValue) > rule.critical_abs ? 'CRITICAL' : 'WARNING',
        parameter: paramName,
        value: numValue,
        threshold: rule.warning_abs,
        message: rule.message,
        detail: 'Variação detectada: ' + numValue
      };
    }
    
    return alert;
  }
  
  /**
   * Envia notificações por email
   */
  function sendAlertNotifications(alerts) {
    if (config.emailRecipients.length === 0) {
      Logger.log('⚠️ Nenhum destinatário configurado para notificações');
      return;
    }
    
    var criticalAlerts = alerts.filter(function(a) { return a.severity === 'CRITICAL'; });
    var warningAlerts = alerts.filter(function(a) { return a.severity === 'WARNING'; });
    
    if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
      return; // Não envia email apenas para INFO
    }
    
    var subject = '🚨 Alertas Ambientais - Reserva Arraras';
    if (criticalAlerts.length > 0) {
      subject = '🔴 ALERTA CRÍTICO - Reserva Arraras (' + criticalAlerts.length + ' crítico' + (criticalAlerts.length > 1 ? 's' : '') + ')';
    }
    
    var body = formatAlertEmail(alerts, criticalAlerts, warningAlerts);
    
    try {
      config.emailRecipients.forEach(function(email) {
        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: body
        });
      });
      
      Logger.log('✅ Notificações enviadas para ' + config.emailRecipients.length + ' destinatário(s)');
    } catch (error) {
      Logger.log('❌ Erro ao enviar notificações: ' + error);
    }
  }
  
  /**
   * Formata email de alerta
   */
  function formatAlertEmail(allAlerts, criticalAlerts, warningAlerts) {
    var html = '<html><body style="font-family: Arial, sans-serif; color: #333;">';
    html += '<h2 style="color: #2196F3;">Sistema de Monitoramento - Reserva Arraras</h2>';
    html += '<p>Data: ' + new Date().toLocaleString('pt-BR') + '</p>';
    html += '<hr>';
    
    if (criticalAlerts.length > 0) {
      html += '<h3 style="color: #F44336;">🔴 Alertas Críticos (' + criticalAlerts.length + ')</h3>';
      html += '<ul>';
      criticalAlerts.forEach(function(alert) {
        html += '<li><strong>' + alert.source + '</strong> - ' + alert.location + '<br>';
        html += alert.message + '<br>';
        html += '<em>' + alert.detail + '</em><br>';
        html += '<small>Data: ' + new Date(alert.date).toLocaleDateString('pt-BR') + '</small></li>';
      });
      html += '</ul><br>';
    }
    
    if (warningAlerts.length > 0) {
      html += '<h3 style="color: #FF9800;">⚠️ Avisos (' + warningAlerts.length + ')</h3>';
      html += '<ul>';
      warningAlerts.forEach(function(alert) {
        html += '<li><strong>' + alert.source + '</strong> - ' + alert.location + '<br>';
        html += alert.message + '<br>';
        html += '<em>' + alert.detail + '</em></li>';
      });
      html += '</ul>';
    }
    
    html += '<hr>';
    html += '<p><small>Este é um email automático do Sistema de Monitoramento Ambiental.</small></p>';
    html += '</body></html>';
    
    return html;
  }
  
  /**
   * Salva alertas no histórico
   */
  function saveAlertsToHistory(alerts) {
    if (alerts.length === 0) return;
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('HistoricoAlertas');
      
      if (!sheet) {
        sheet = ss.insertSheet('HistoricoAlertas');
        sheet.appendRow(['Timestamp', 'Severidade', 'Fonte', 'Parâmetro', 'Valor', 'Local', 'Mensagem', 'Detalhes']);
      }
      
      alerts.forEach(function(alert) {
        sheet.appendRow([
          new Date(),
          alert.severity,
          alert.source,
          alert.parameter,
          alert.value,
          alert.location,
          alert.message,
          alert.detail
        ]);
      });
      
      Logger.log('✅ ' + alerts.length + ' alertas salvos no histórico');
    } catch (error) {
      Logger.log('❌ Erro ao salvar histórico: ' + error);
    }
  }
  
  /**
   * Obtém histórico de alertas
   */
  function getAlertHistory(limit) {
    try {
      limit = limit || 50;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('HistoricoAlertas');
      
      if (!sheet) {
        return { success: true, alerts: [] };
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, alerts: [] };
      }
      
      var headers = data[0];
      var alerts = [];
      
      // Pega os mais recentes (inverte ordem)
      for (var i = Math.max(1, data.length - limit); i < data.length; i++) {
        var row = data[i];
        var alert = {};
        
        for (var j = 0; j < headers.length; j++) {
          alert[headers[j]] = row[j];
        }
        
        alerts.unshift(alert); // Adiciona no início (mais recente primeiro)
      }
      
      return {
        success: true,
        alerts: alerts,
        total: data.length - 1
      };
      
    } catch (error) {
      Logger.log('❌ Erro em getAlertHistory: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  // API Pública
  return {
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    checkAllAlerts: checkAllAlerts,
    getAlertHistory: getAlertHistory,
    sendTestNotification: function() {
      var testAlert = [{
        severity: 'INFO',
        source: 'Teste',
        parameter: 'teste',
        value: 0,
        location: 'Sistema',
        date: new Date(),
        message: 'Esta é uma notificação de teste',
        detail: 'O sistema de notificações está funcionando corretamente'
      }];
      sendAlertNotifications(testAlert);
      return { success: true, message: 'Notificação de teste enviada' };
    }
  };
})();

/**
 * Funções de API expostas
 */
function apiGetNotificationConfig() {
  return NotificationService.loadConfig();
}

function apiSaveNotificationConfig(newConfig) {
  return NotificationService.saveConfig(newConfig);
}

function apiCheckAlerts(daysBack) {
  return NotificationService.checkAllAlerts(daysBack);
}

function apiGetAlertHistory(limit) {
  return NotificationService.getAlertHistory(limit);
}

function apiSendTestNotification() {
  return NotificationService.sendTestNotification();
}

/**
 * Trigger automático (configurar manualmente)
 */
function dailyAlertCheck() {
  NotificationService.checkAllAlerts(1); // Verifica último dia
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 41/30 (28/30): ASSINATURA DE NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Email Marketing Best Practices
// - LGPD Compliance for Newsletters

/**
 * Configurações de newsletter
 */
const NEWSLETTER_CONFIG = {
  SHEET_NAME: 'NEWSLETTER_SUBS_RA',
  FREQUENCIES: {
    SEMANAL: { id: 'SEMANAL', nome: 'Semanal', dias: 7 },
    QUINZENAL: { id: 'QUINZENAL', nome: 'Quinzenal', dias: 14 },
    MENSAL: { id: 'MENSAL', nome: 'Mensal', dias: 30 }
  },
  TOPICS: {
    CONSERVACAO: { id: 'CONSERVACAO', nome: 'Conservação', icone: '🌳' },
    EVENTOS: { id: 'EVENTOS', nome: 'Eventos', icone: '📅' },
    BIODIVERSIDADE: { id: 'BIODIVERSIDADE', nome: 'Biodiversidade', icone: '🦜' },
    VOLUNTARIADO: { id: 'VOLUNTARIADO', nome: 'Voluntariado', icone: '🤝' }
  }
};

/**
 * Serviço de Newsletter
 */
const NewsletterService = {
  
  SHEET_NAME: NEWSLETTER_CONFIG.SHEET_NAME,
  
  /**
   * Inicializa planilha de newsletter
   */
  initializeSheet: function() {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(this.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(this.SHEET_NAME);
      const headers = ['Email', 'Nome', 'Data_Inscricao', 'Frequencia', 'Topicos_JSON', 'Ativo', 'Token_Unsubscribe'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#9C27B0').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    return sheet;
  },
  
  /**
   * Inscreve email na newsletter
   * @param {string} email - Email do assinante
   * @param {string} nome - Nome do assinante
   * @param {string} frequencia - Frequência desejada
   * @param {Array} topicos - Tópicos de interesse
   * @returns {object} Resultado da inscrição
   */
  subscribe: function(email, nome = '', frequencia = 'MENSAL', topicos = []) {
    try {
      // Valida email
      if (!email || !this._isValidEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }
      
      const sheet = this.initializeSheet();
      
      // Verifica duplicata
      const existing = this._findSubscriber(email);
      if (existing) {
        if (existing.ativo) {
          return { success: false, error: 'Email já inscrito na newsletter' };
        } else {
          // Reativa inscrição
          return this._reactivateSubscription(existing.row, nome, frequencia, topicos);
        }
      }
      
      // Gera token de unsubscribe
      const token = Utilities.getUuid();
      
      // Adiciona novo assinante
      sheet.appendRow([
        email.toLowerCase(),
        nome,
        new Date(),
        frequencia,
        JSON.stringify(topicos.length > 0 ? topicos : Object.keys(NEWSLETTER_CONFIG.TOPICS)),
        true,
        token
      ]);
      
      // Envia email de boas-vindas
      this._sendWelcomeEmail(email, nome, token);
      
      return {
        success: true,
        mensagem: 'Inscrição realizada com sucesso! 🌿',
        email: email,
        frequencia: NEWSLETTER_CONFIG.FREQUENCIES[frequencia]?.nome || 'Mensal',
        proxima_edicao: this._getNextEditionDate(frequencia)
      };
    } catch (error) {
      Logger.log(`[subscribe] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cancela inscrição
   * @param {string} email - Email ou token
   * @returns {object} Resultado
   */
  unsubscribe: function(emailOrToken) {
    try {
      const sheet = this.initializeSheet();
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === emailOrToken.toLowerCase() || data[i][6] === emailOrToken) {
          sheet.getRange(i + 1, 6).setValue(false); // Ativo = false
          return {
            success: true,
            mensagem: 'Inscrição cancelada. Sentiremos sua falta! 🌱'
          };
        }
      }
      
      return { success: false, error: 'Assinatura não encontrada' };
    } catch (error) {
      Logger.log(`[unsubscribe] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obtém estatísticas da newsletter
   * @returns {object} Estatísticas
   */
  getStats: function() {
    try {
      const sheet = this.initializeSheet();
      
      if (sheet.getLastRow() < 2) {
        return { success: true, stats: { total: 0, ativos: 0, inativos: 0 } };
      }
      
      const data = sheet.getDataRange().getValues().slice(1);
      
      const stats = {
        total: data.length,
        ativos: data.filter(row => row[5] === true).length,
        inativos: data.filter(row => row[5] === false).length,
        por_frequencia: {},
        por_topico: {},
        crescimento_mes: 0
      };
      
      const mesPassado = new Date();
      mesPassado.setMonth(mesPassado.getMonth() - 1);
      
      data.forEach(row => {
        if (row[5]) { // Apenas ativos
          // Por frequência
          const freq = row[3] || 'MENSAL';
          stats.por_frequencia[freq] = (stats.por_frequencia[freq] || 0) + 1;
          
          // Por tópico
          const topicos = JSON.parse(row[4] || '[]');
          topicos.forEach(t => {
            stats.por_topico[t] = (stats.por_topico[t] || 0) + 1;
          });
          
          // Crescimento
          if (new Date(row[2]) >= mesPassado) {
            stats.crescimento_mes++;
          }
        }
      });
      
      return { success: true, stats };
    } catch (error) {
      Logger.log(`[getStats] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Valida formato de email
   * @private
   */
  _isValidEmail: function(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Busca assinante por email
   * @private
   */
  _findSubscriber: function(email) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return null;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email.toLowerCase()) {
        return { row: i + 1, email: data[i][0], ativo: data[i][5] };
      }
    }
    return null;
  },
  
  /**
   * Reativa inscrição
   * @private
   */
  _reactivateSubscription: function(row, nome, frequencia, topicos) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_NAME);
    
    sheet.getRange(row, 2).setValue(nome);
    sheet.getRange(row, 4).setValue(frequencia);
    sheet.getRange(row, 5).setValue(JSON.stringify(topicos.length > 0 ? topicos : Object.keys(NEWSLETTER_CONFIG.TOPICS)));
    sheet.getRange(row, 6).setValue(true);
    
    return {
      success: true,
      mensagem: 'Bem-vindo de volta! Sua inscrição foi reativada. 🌿'
    };
  },
  
  /**
   * Envia email de boas-vindas
   * @private
   */
  _sendWelcomeEmail: function(email, nome, token) {
    try {
      const subject = '🌿 Bem-vindo às Crônicas do Cerrado!';
      const body = `
Olá ${nome || 'Amigo(a) da Natureza'}!

Obrigado por se inscrever na newsletter da Reserva Araras!

Você receberá:
🌳 Novidades sobre conservação
🦜 Avistamentos de fauna e flora
📅 Eventos e oportunidades de voluntariado
📚 Conteúdo educativo sobre o Cerrado

Para cancelar sua inscrição a qualquer momento, use este link:
https://reservaararas.org/unsubscribe?token=${token}

Até breve!
Equipe Reserva Araras
      `;
      
      MailApp.sendEmail(email, subject, body);
    } catch (error) {
      Logger.log(`[_sendWelcomeEmail] Erro: ${error}`);
    }
  },
  
  /**
   * Calcula próxima edição
   * @private
   */
  _getNextEditionDate: function(frequencia) {
    const dias = NEWSLETTER_CONFIG.FREQUENCIES[frequencia]?.dias || 30;
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + dias);
    return proxima.toLocaleDateString('pt-BR');
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Newsletter (Prompt 41/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Inscreve na newsletter
 */
function apiNewsletterSubscribe(email, nome, frequencia, topicos) {
  return NewsletterService.subscribe(email, nome, frequencia, topicos);
}

/**
 * API: Cancela inscrição
 */
function apiNewsletterUnsubscribe(emailOrToken) {
  return NewsletterService.unsubscribe(emailOrToken);
}

/**
 * API: Obtém estatísticas
 */
function apiNewsletterGetStats() {
  return NewsletterService.getStats();
}

/**
 * API: Lista frequências disponíveis
 */
function apiNewsletterGetFrequencies() {
  return {
    success: true,
    frequencies: Object.values(NEWSLETTER_CONFIG.FREQUENCIES)
  };
}

/**
 * API: Lista tópicos disponíveis
 */
function apiNewsletterGetTopics() {
  return {
    success: true,
    topics: Object.values(NEWSLETTER_CONFIG.TOPICS)
  };
}
