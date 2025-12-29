/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYSTEM INTEGRATION FINAL - Integração Final do Sistema
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 13/13: Integração Final e Validação do Sistema
 * 
 * Este arquivo consolida todas as 12 intervenções anteriores:
 * 1. Colab Analyzer (duplicatas)
 * 2. Defensive Validation (erros undefined)
 * 3. Sheet Schema Registry (planilhas)
 * 4. Form Styles/Scripts (componentes compartilhados)
 * 5. Padronized Forms (formulários refatorados)
 * 6. Test Suite (testes integrados)
 * 7. Limnology Dashboard
 * 8. Export Service
 * 9. Alert System
 * 10. Menu System
 * 11. Analytics Service
 * 12. Colab Integration
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO DE INTEGRAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const SystemIntegration = {
  
  /**
   * Valida todas as 13 intervenções
   * @returns {Object} Relatório de validação
   */
  validateAllInterventions: function() {
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🔍 VALIDAÇÃO DAS 13 INTERVENÇÕES - Reserva Araras');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      interventions: [],
      summary: { total: 13, passed: 0, partial: 0, failed: 0 },
      overallScore: 0
    };
    
    // Valida cada intervenção
    report.interventions.push(this._validate01_ColabAnalyzer());
    report.interventions.push(this._validate02_DefensiveValidation());
    report.interventions.push(this._validate03_SheetSchemaRegistry());
    report.interventions.push(this._validate04_SharedComponents());
    report.interventions.push(this._validate05_PadronizedForms());
    report.interventions.push(this._validate06_TestSuite());
    report.interventions.push(this._validate07_Dashboard());
    report.interventions.push(this._validate08_ExportService());
    report.interventions.push(this._validate09_AlertSystem());
    report.interventions.push(this._validate10_MenuSystem());
    report.interventions.push(this._validate11_AnalyticsService());
    report.interventions.push(this._validate12_ColabIntegration());
    report.interventions.push(this._validate13_FinalIntegration());
    
    // Calcula resumo
    report.interventions.forEach(function(i) {
      if (i.status === 'passed') report.summary.passed++;
      else if (i.status === 'partial') report.summary.partial++;
      else report.summary.failed++;
    });
    
    report.overallScore = Math.round(
      ((report.summary.passed * 100) + (report.summary.partial * 50)) / report.summary.total
    );
    
    this._printValidationReport(report);
    
    return report;
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAÇÕES INDIVIDUAIS
  // ═══════════════════════════════════════════════════════════════════════
  
  _validate01_ColabAnalyzer: function() {
    var result = { id: 1, name: 'Colab Analyzer', checks: [], status: 'passed' };
    
    // ColabIntegration namespace
    result.checks.push({
      item: 'ColabIntegration namespace',
      ok: typeof ColabIntegration !== 'undefined'
    });
    
    // Funções de análise
    result.checks.push({
      item: 'runLocalAnalysis function',
      ok: typeof ColabIntegration !== 'undefined' && typeof ColabIntegration.runLocalAnalysis === 'function'
    });
    
    // API export
    result.checks.push({
      item: 'apiColabExportProject function',
      ok: typeof apiColabExportProject === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate02_DefensiveValidation: function() {
    var result = { id: 2, name: 'Defensive Validation', checks: [], status: 'passed' };
    
    // DefensiveValidation namespace
    result.checks.push({
      item: 'DefensiveValidation namespace',
      ok: typeof DefensiveValidation !== 'undefined'
    });
    
    // Safe access function
    result.checks.push({
      item: 'safeAccess function',
      ok: typeof DefensiveValidation !== 'undefined' && typeof DefensiveValidation.safeAccess === 'function'
    });
    
    // Validate function
    result.checks.push({
      item: 'validate function',
      ok: typeof DefensiveValidation !== 'undefined' && typeof DefensiveValidation.validate === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate03_SheetSchemaRegistry: function() {
    var result = { id: 3, name: 'Sheet Schema Registry', checks: [], status: 'passed' };
    
    // SHEET_SCHEMAS
    result.checks.push({
      item: 'SHEET_SCHEMAS defined',
      ok: typeof SHEET_SCHEMAS !== 'undefined'
    });
    
    // Schema count
    var schemaCount = typeof SHEET_SCHEMAS !== 'undefined' ? Object.keys(SHEET_SCHEMAS).length : 0;
    result.checks.push({
      item: 'Schemas count >= 50',
      ok: schemaCount >= 50
    });
    
    // createMissingSheets function
    result.checks.push({
      item: 'createMissingSheets function',
      ok: typeof createMissingSheets === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate04_SharedComponents: function() {
    var result = { id: 4, name: 'Shared Components (CSS/JS)', checks: [], status: 'passed' };
    
    // FormStyles.html
    try {
      HtmlService.createHtmlOutputFromFile('FormStyles');
      result.checks.push({ item: 'FormStyles.html exists', ok: true });
    } catch (e) {
      result.checks.push({ item: 'FormStyles.html exists', ok: false });
    }
    
    // FormScripts.html
    try {
      HtmlService.createHtmlOutputFromFile('FormScripts');
      result.checks.push({ item: 'FormScripts.html exists', ok: true });
    } catch (e) {
      result.checks.push({ item: 'FormScripts.html exists', ok: false });
    }
    
    // LimnologyFormHandlers
    result.checks.push({
      item: 'LimnologyFormHandlers namespace',
      ok: typeof LimnologyFormHandlers !== 'undefined'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate05_PadronizedForms: function() {
    var result = { id: 5, name: 'Padronized Forms', checks: [], status: 'passed' };
    
    var forms = [
      'PhysicochemicalForm_Padronizado',
      'PhytoplanktonForm_Padronizado',
      'ZooplanktonForm_Padronizado',
      'BenthicForm_Padronizado',
      'MacrophytesForm_Padronizado',
      'IchthyofaunaForm_Padronizado'
    ];
    
    var existingForms = 0;
    forms.forEach(function(form) {
      try {
        HtmlService.createHtmlOutputFromFile(form);
        existingForms++;
      } catch (e) {}
    });
    
    result.checks.push({
      item: 'Padronized forms: ' + existingForms + '/' + forms.length,
      ok: existingForms >= 4
    });
    
    // openLimnologyForm function
    result.checks.push({
      item: 'openLimnologyForm function',
      ok: typeof openLimnologyForm === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate06_TestSuite: function() {
    var result = { id: 6, name: 'Test Suite', checks: [], status: 'passed' };
    
    // TestRunner
    result.checks.push({
      item: 'TestRunner namespace',
      ok: typeof TestRunner !== 'undefined'
    });
    
    // FormValidationRules
    result.checks.push({
      item: 'FormValidationRules namespace',
      ok: typeof FormValidationRules !== 'undefined'
    });
    
    // runAllLimnologyTests
    result.checks.push({
      item: 'runAllLimnologyTests function',
      ok: typeof runAllLimnologyTests === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate07_Dashboard: function() {
    var result = { id: 7, name: 'Limnology Dashboard', checks: [], status: 'passed' };
    
    // LimnologyDashboard.html
    try {
      HtmlService.createHtmlOutputFromFile('LimnologyDashboard');
      result.checks.push({ item: 'LimnologyDashboard.html exists', ok: true });
    } catch (e) {
      result.checks.push({ item: 'LimnologyDashboard.html exists', ok: false });
    }
    
    // LimnologyDashboardService
    result.checks.push({
      item: 'LimnologyDashboardService namespace',
      ok: typeof LimnologyDashboardService !== 'undefined'
    });
    
    // openLimnologyDashboard
    result.checks.push({
      item: 'openLimnologyDashboard function',
      ok: typeof openLimnologyDashboard === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate08_ExportService: function() {
    var result = { id: 8, name: 'Export Service', checks: [], status: 'passed' };
    
    // LimnologyExportService
    result.checks.push({
      item: 'LimnologyExportService namespace',
      ok: typeof LimnologyExportService !== 'undefined'
    });
    
    // Export functions
    result.checks.push({
      item: 'exportToCSV function',
      ok: typeof LimnologyExportService !== 'undefined' && typeof LimnologyExportService.exportToCSV === 'function'
    });
    
    // LimnologyExportInterface.html
    try {
      HtmlService.createHtmlOutputFromFile('LimnologyExportInterface');
      result.checks.push({ item: 'LimnologyExportInterface.html exists', ok: true });
    } catch (e) {
      result.checks.push({ item: 'LimnologyExportInterface.html exists', ok: false });
    }
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate09_AlertSystem: function() {
    var result = { id: 9, name: 'Alert System', checks: [], status: 'passed' };
    
    // LimnologyAlertService
    result.checks.push({
      item: 'LimnologyAlertService namespace',
      ok: typeof LimnologyAlertService !== 'undefined'
    });
    
    // runAlertCheck
    result.checks.push({
      item: 'runAlertCheck function',
      ok: typeof runAlertCheck === 'function'
    });
    
    // getActiveAlerts
    result.checks.push({
      item: 'getActiveAlerts function',
      ok: typeof getActiveAlerts === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate10_MenuSystem: function() {
    var result = { id: 10, name: 'Menu System', checks: [], status: 'passed' };
    
    // onOpen
    result.checks.push({
      item: 'onOpen function',
      ok: typeof onOpen === 'function'
    });
    
    // Menu functions
    result.checks.push({
      item: 'showAboutDialog function',
      ok: typeof showAboutDialog === 'function'
    });
    
    // Quick access
    result.checks.push({
      item: 'openQuickAccessSidebar function',
      ok: typeof openQuickAccessSidebar === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate11_AnalyticsService: function() {
    var result = { id: 11, name: 'Analytics Service', checks: [], status: 'passed' };
    
    // LimnologyStats
    result.checks.push({
      item: 'LimnologyStats namespace',
      ok: typeof LimnologyStats !== 'undefined'
    });
    
    // DiversityIndices
    result.checks.push({
      item: 'DiversityIndices namespace',
      ok: typeof DiversityIndices !== 'undefined'
    });
    
    // WaterQualityIndices
    result.checks.push({
      item: 'WaterQualityIndices namespace',
      ok: typeof WaterQualityIndices !== 'undefined'
    });
    
    // BioticIndices
    result.checks.push({
      item: 'BioticIndices namespace',
      ok: typeof BioticIndices !== 'undefined'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate12_ColabIntegration: function() {
    var result = { id: 12, name: 'Colab Integration (Limnology)', checks: [], status: 'passed' };
    
    // exportLimnologyDataForColab
    result.checks.push({
      item: 'exportLimnologyDataForColab function',
      ok: typeof exportLimnologyDataForColab === 'function'
    });
    
    // saveLimnologyExportToDrive
    result.checks.push({
      item: 'saveLimnologyExportToDrive function',
      ok: typeof saveLimnologyExportToDrive === 'function'
    });
    
    // Menu integration
    result.checks.push({
      item: 'menuExportLimnologyForColab function',
      ok: typeof menuExportLimnologyForColab === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  _validate13_FinalIntegration: function() {
    var result = { id: 13, name: 'Final Integration', checks: [], status: 'passed' };
    
    // SystemIntegration namespace (self)
    result.checks.push({
      item: 'SystemIntegration namespace',
      ok: typeof SystemIntegration !== 'undefined'
    });
    
    // ProjectHealthCheck
    result.checks.push({
      item: 'ProjectHealthCheck namespace',
      ok: typeof ProjectHealthCheck !== 'undefined'
    });
    
    // initializeSystem
    result.checks.push({
      item: 'initializeSystem function',
      ok: typeof initializeSystem === 'function'
    });
    
    result.status = this._calculateStatus(result.checks);
    return result;
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  _calculateStatus: function(checks) {
    var passed = checks.filter(function(c) { return c.ok; }).length;
    var total = checks.length;
    
    if (passed === total) return 'passed';
    if (passed >= total / 2) return 'partial';
    return 'failed';
  },
  
  _printValidationReport: function(report) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('📊 RELATÓRIO DE VALIDAÇÃO');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    report.interventions.forEach(function(i) {
      var icon = i.status === 'passed' ? '✅' : i.status === 'partial' ? '⚠️' : '❌';
      Logger.log(icon + ' ' + i.id + '/13: ' + i.name + ' [' + i.status.toUpperCase() + ']');
      
      i.checks.forEach(function(c) {
        var checkIcon = c.ok ? '  ✓' : '  ✗';
        Logger.log(checkIcon + ' ' + c.item);
      });
      Logger.log('');
    });
    
    Logger.log('───────────────────────────────────────────────────────────────');
    Logger.log('✅ Passou: ' + report.summary.passed + '/13');
    Logger.log('⚠️ Parcial: ' + report.summary.partial + '/13');
    Logger.log('❌ Falhou: ' + report.summary.failed + '/13');
    Logger.log('📈 Score: ' + report.overallScore + '%');
    Logger.log('═══════════════════════════════════════════════════════════════');
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA DE INICIALIZAÇÃO COMPLETA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema completo da Reserva Araras
 * Executa todas as verificações e configurações necessárias
 * @returns {Object} Resultado da inicialização
 */
function initializeReservaArarasSystem() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('🚀 INICIALIZAÇÃO DO SISTEMA - Reserva Araras');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  var startTime = Date.now();
  var results = {
    timestamp: new Date().toISOString(),
    steps: [],
    success: true
  };
  
  try {
    // 1. Verificar planilhas
    Logger.log('1️⃣ Verificando planilhas...');
    var sheetStatus = getSheetStatus();
    results.steps.push({
      step: 'Verificação de Planilhas',
      existing: sheetStatus.existing,
      missing: sheetStatus.missing,
      status: sheetStatus.missing === 0 ? 'ok' : 'action_needed'
    });
    
    if (sheetStatus.missing > 0) {
      Logger.log('   Criando ' + sheetStatus.missing + ' planilhas faltantes...');
      var createResult = createMissingSheets();
      results.steps[0].created = createResult.results.created.length;
    }
    
    // 2. Configurar triggers
    Logger.log('2️⃣ Configurando triggers...');
    var triggerResult = setupSystemTriggers();
    results.steps.push({
      step: 'Configuração de Triggers',
      triggers: triggerResult.configured,
      status: 'ok'
    });
    
    // 3. Verificar alertas
    Logger.log('3️⃣ Verificando alertas...');
    var alertResult = runAlertCheck();
    results.steps.push({
      step: 'Verificação de Alertas',
      alerts: alertResult.alerts ? alertResult.alerts.length : 0,
      status: 'ok'
    });
    
    // 4. Validar integrações
    Logger.log('4️⃣ Validando integrações...');
    var integrationResult = SystemIntegration.validateAllInterventions();
    results.steps.push({
      step: 'Validação de Integrações',
      score: integrationResult.overallScore,
      passed: integrationResult.summary.passed,
      status: integrationResult.overallScore >= 70 ? 'ok' : 'warning'
    });
    
    // 5. Health check
    Logger.log('5️⃣ Executando health check...');
    var healthResult = ProjectHealthCheck.quickCheck();
    results.steps.push({
      step: 'Health Check',
      score: healthResult.score,
      status: healthResult.score >= 70 ? 'ok' : 'warning'
    });
    
    results.duration = Date.now() - startTime;
    results.success = results.steps.every(function(s) { return s.status !== 'failed'; });
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('✅ SISTEMA INICIALIZADO COM SUCESSO');
    Logger.log('   Duração: ' + results.duration + 'ms');
    Logger.log('   Score de Integração: ' + integrationResult.overallScore + '%');
    Logger.log('   Health Score: ' + healthResult.score + '%');
    Logger.log('═══════════════════════════════════════════════════════════════');
    
  } catch (e) {
    Logger.log('❌ Erro na inicialização: ' + e);
    results.success = false;
    results.error = e.toString();
  }
  
  return results;
}

/**
 * Configura todos os triggers do sistema
 */
function setupSystemTriggers() {
  var configured = [];
  
  // Remove triggers existentes do sistema
  var triggers = ScriptApp.getProjectTriggers();
  var systemTriggers = ['triggerDailyAlertCheck', 'triggerWeeklyAnalysis'];
  
  triggers.forEach(function(trigger) {
    if (systemTriggers.indexOf(trigger.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Trigger diário de alertas (6h)
  try {
    ScriptApp.newTrigger('triggerDailyAlertCheck')
      .timeBased()
      .everyDays(1)
      .atHour(6)
      .create();
    configured.push('triggerDailyAlertCheck');
  } catch (e) {
    Logger.log('   Aviso: Não foi possível criar trigger de alertas');
  }
  
  // Trigger semanal de análise (segunda 8h)
  try {
    ScriptApp.newTrigger('triggerWeeklyAnalysis')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(8)
      .create();
    configured.push('triggerWeeklyAnalysis');
  } catch (e) {
    Logger.log('   Aviso: Não foi possível criar trigger semanal');
  }
  
  return { configured: configured };
}

/**
 * Trigger diário de verificação de alertas
 */
function triggerDailyAlertCheck() {
  Logger.log('🔔 Executando verificação diária de alertas...');
  return runAlertCheck();
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE MENU
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Menu: Validar todas as intervenções
 */
function menuValidateInterventions() {
  var ui = SpreadsheetApp.getUi();
  
  ui.alert('⏳ Validando...', 'Verificando todas as 13 intervenções...', ui.ButtonSet.OK);
  
  var result = SystemIntegration.validateAllInterventions();
  
  var msg = '📊 RESULTADO DA VALIDAÇÃO\n\n';
  msg += '✅ Passou: ' + result.summary.passed + '/13\n';
  msg += '⚠️ Parcial: ' + result.summary.partial + '/13\n';
  msg += '❌ Falhou: ' + result.summary.failed + '/13\n\n';
  msg += '📈 Score: ' + result.overallScore + '%\n\n';
  
  msg += 'Detalhes:\n';
  result.interventions.forEach(function(i) {
    var icon = i.status === 'passed' ? '✅' : i.status === 'partial' ? '⚠️' : '❌';
    msg += icon + ' ' + i.id + '. ' + i.name + '\n';
  });
  
  ui.alert('Validação Completa', msg, ui.ButtonSet.OK);
}

/**
 * Menu: Inicializar sistema completo
 */
function menuInitializeSystem() {
  var ui = SpreadsheetApp.getUi();
  
  var response = ui.alert('Inicializar Sistema',
    'Isso irá:\n' +
    '• Criar planilhas faltantes\n' +
    '• Configurar triggers automáticos\n' +
    '• Verificar alertas\n' +
    '• Validar integrações\n\n' +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) return;
  
  var result = initializeReservaArarasSystem();
  
  if (result.success) {
    ui.alert('✅ Sistema Inicializado',
      'O sistema foi inicializado com sucesso!\n\n' +
      'Duração: ' + result.duration + 'ms\n' +
      'Etapas concluídas: ' + result.steps.length,
      ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Erro', 'Erro na inicialização: ' + result.error, ui.ButtonSet.OK);
  }
}

/**
 * Menu: Gerar relatório do sistema
 */
function menuGenerateSystemReport() {
  var ui = SpreadsheetApp.getUi();
  
  var report = generateSystemReport();
  
  if (report.success) {
    ui.alert('📄 Relatório Gerado',
      'Relatório salvo em:\n' + report.fileUrl + '\n\n' +
      'O arquivo foi salvo no Google Drive.',
      ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Erro', 'Erro ao gerar relatório: ' + report.error, ui.ButtonSet.OK);
  }
}

/**
 * Gera relatório completo do sistema em HTML
 */
function generateSystemReport() {
  try {
    // Coleta dados
    var validation = SystemIntegration.validateAllInterventions();
    var health = ProjectHealthCheck.quickCheck();
    var sheetStatus = getSheetStatus();
    var alerts = getActiveAlerts();
    var stats = getSystemStats();
    
    // Gera HTML
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Relatório do Sistema - Reserva Araras</title>';
    html += '<style>';
    html += 'body{font-family:Arial,sans-serif;margin:40px;background:#f5f5f5}';
    html += '.container{max-width:900px;margin:0 auto;background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}';
    html += 'h1{color:#00796B;border-bottom:3px solid #00BCD4;padding-bottom:10px}';
    html += 'h2{color:#00796B;margin-top:30px}';
    html += '.metric{display:inline-block;background:linear-gradient(135deg,#00796B,#00BCD4);color:white;padding:20px;border-radius:10px;margin:10px;min-width:120px;text-align:center}';
    html += '.metric-value{font-size:2em;font-weight:bold}';
    html += '.metric-label{font-size:0.9em;opacity:0.9}';
    html += 'table{width:100%;border-collapse:collapse;margin:20px 0}';
    html += 'th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}';
    html += 'th{background:#00796B;color:white}';
    html += '.passed{color:#4CAF50}.partial{color:#FF9800}.failed{color:#F44336}';
    html += '.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;color:#666;font-size:0.9em;text-align:center}';
    html += '</style></head><body><div class="container">';
    
    // Header
    html += '<h1>🌊 Relatório do Sistema - Reserva Araras</h1>';
    html += '<p><strong>Data:</strong> ' + new Date().toLocaleString('pt-BR') + '</p>';
    
    // Métricas principais
    html += '<h2>📊 Métricas Principais</h2><div>';
    html += '<div class="metric"><div class="metric-value">' + validation.overallScore + '%</div><div class="metric-label">Score Integração</div></div>';
    html += '<div class="metric"><div class="metric-value">' + health.score + '%</div><div class="metric-label">Health Score</div></div>';
    html += '<div class="metric"><div class="metric-value">' + sheetStatus.existing + '</div><div class="metric-label">Planilhas</div></div>';
    html += '<div class="metric"><div class="metric-value">' + alerts.length + '</div><div class="metric-label">Alertas</div></div>';
    html += '<div class="metric"><div class="metric-value">' + stats.totalColetas + '</div><div class="metric-label">Coletas</div></div>';
    html += '</div>';
    
    // Validação das intervenções
    html += '<h2>✅ Validação das 13 Intervenções</h2>';
    html += '<table><tr><th>#</th><th>Intervenção</th><th>Status</th></tr>';
    validation.interventions.forEach(function(i) {
      var statusClass = i.status === 'passed' ? 'passed' : i.status === 'partial' ? 'partial' : 'failed';
      var icon = i.status === 'passed' ? '✅' : i.status === 'partial' ? '⚠️' : '❌';
      html += '<tr><td>' + i.id + '</td><td>' + i.name + '</td><td class="' + statusClass + '">' + icon + ' ' + i.status.toUpperCase() + '</td></tr>';
    });
    html += '</table>';
    
    // Alertas ativos
    if (alerts.length > 0) {
      html += '<h2>🚨 Alertas Ativos</h2><table><tr><th>Tipo</th><th>Descrição</th><th>Data</th></tr>';
      alerts.slice(0, 10).forEach(function(a) {
        html += '<tr><td>' + a.title + '</td><td>' + a.description + '</td><td>' + a.timestamp.substring(0, 10) + '</td></tr>';
      });
      html += '</table>';
    }
    
    // Footer
    html += '<div class="footer">';
    html += '<p>Sistema de Monitoramento Limnológico - Reserva Araras</p>';
    html += '<p>Versão 1.0.0 | Intervenções 1-13 Implementadas</p>';
    html += '</div></div></body></html>';
    
    // Salva no Drive
    var folder;
    var folders = DriveApp.getFoldersByName('ReservaAraras_Reports');
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('ReservaAraras_Reports');
    }
    
    var filename = 'system_report_' + new Date().toISOString().slice(0, 10) + '.html';
    var file = folder.createFile(filename, html, 'text/html');
    
    return {
      success: true,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      filename: filename
    };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// APIs EXPOSTAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Valida todas as intervenções
 */
function apiValidateInterventions() {
  return SystemIntegration.validateAllInterventions();
}

/**
 * API: Inicializa sistema
 */
function apiInitializeSystem() {
  return initializeReservaArarasSystem();
}

/**
 * API: Status completo do sistema
 */
function apiGetSystemStatus() {
  try {
    var validation = SystemIntegration.validateAllInterventions();
    var health = ProjectHealthCheck.quickCheck();
    var sheetStatus = getSheetStatus();
    var alerts = getActiveAlerts();
    
    return {
      success: true,
      status: {
        integrationScore: validation.overallScore,
        healthScore: health.score,
        sheets: { existing: sheetStatus.existing, missing: sheetStatus.missing },
        alerts: alerts.length,
        interventions: {
          passed: validation.summary.passed,
          partial: validation.summary.partial,
          failed: validation.summary.failed
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
