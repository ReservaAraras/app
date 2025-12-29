/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY MENU SYSTEM - Sistema de Menu Unificado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 10/13: Menu Unificado e Integração do Sistema
 * 
 * Este arquivo centraliza todos os menus e integrações do sistema
 * de monitoramento limnológico da Reserva Araras.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CRIAÇÃO DO MENU PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cria menu de Limnologia (chamado pelo MenuUI.gs onOpen)
 * NOTA: onOpen principal está em MenuUI.gs para evitar duplicação
 */
function createLimnologyMenu() {
  var ui = SpreadsheetApp.getUi();
  
  // Menu principal de Limnologia
  ui.createMenu('🌊 Limnologia')
    .addSubMenu(ui.createMenu('📝 Formulários')
      .addItem('💧 Físico-Químico', 'openPhysicochemicalForm')
      .addItem('🌿 Fitoplâncton', 'openPhytoplanktonForm')
      .addItem('🦐 Zooplâncton', 'openZooplanktonForm')
      .addItem('🌱 Macrófitas', 'openMacrophytesForm')
      .addItem('🐚 Bentos', 'openBenthicForm')
      .addItem('🐟 Ictiofauna', 'openIchthyofaunaForm'))
    .addSeparator()
    .addItem('📊 Dashboard', 'openLimnologyDashboard')
    .addItem('📥 Exportar Dados', 'openExportInterface')
    .addItem('📝 Gerar Relatório', 'menuGenerateReport')
    .addSeparator()
    .addSubMenu(ui.createMenu('🚨 Alertas')
      .addItem('Verificar Agora', 'menuRunAlertCheck')
      .addItem('Ver Alertas Ativos', 'showActiveAlerts')
      .addItem('Configurar Destinatários', 'menuConfigureAlerts')
      .addItem('Ativar Verificação Diária', 'menuSetupDailyTrigger'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Sistema')
      .addItem('Status das Planilhas', 'showSheetStatus')
      .addItem('Criar Planilhas Faltantes', 'menuCreateMissingSheets')
      .addItem('Validar Integridade', 'menuValidateIntegrity')
      .addSeparator()
      .addItem('🔍 Validar 13 Intervenções', 'menuValidateInterventions')
      .addItem('🚀 Inicializar Sistema', 'menuInitializeSystem')
      .addItem('📄 Gerar Relatório', 'menuGenerateSystemReport')
      .addSeparator()
      .addItem('Executar Testes', 'menuRunAllTests')
      .addItem('Sobre o Sistema', 'showAboutDialog'))
    .addSeparator()
    .addSubMenu(ui.createMenu('📈 Análises')
      .addItem('Análise Completa', 'menuRunFullAnalysis')
      .addItem('Qualidade da Água', 'menuAnalyzeWaterQuality')
      .addItem('Comunidade Bentônica', 'menuAnalyzeBenthic')
      .addItem('Índices de Diversidade', 'menuCalculateDiversity')
      .addSeparator()
      .addItem('📤 Exportar para Colab', 'menuExportLimnologyForColab'))
    .addToUi();
  
  // Verifica alertas ao abrir (silencioso)
  checkAlertsOnOpen();
}

/**
 * Trigger de instalação
 */
function onInstall(e) {
  onOpen(e);
}

// ═══════════════════════════════════════════════════════════════════════════
// ATALHOS PARA FORMULÁRIOS
// ═══════════════════════════════════════════════════════════════════════════

function openPhysicochemicalForm() {
  openLimnologyForm('physicochemical');
}

function openPhytoplanktonForm() {
  openLimnologyForm('phytoplankton');
}

function openZooplanktonForm() {
  openLimnologyForm('zooplankton');
}

function openMacrophytesForm() {
  openLimnologyForm('macrophytes');
}

function openBenthicForm() {
  openLimnologyForm('benthic');
}

function openIchthyofaunaForm() {
  openLimnologyForm('ichthyofauna');
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mostra alertas ativos em dialog
 */
function showActiveAlerts() {
  var alerts = getActiveAlerts();
  var ui = SpreadsheetApp.getUi();
  
  if (alerts.length === 0) {
    ui.alert('✓ Sem Alertas', 'Não há alertas ativos no momento.', ui.ButtonSet.OK);
    return;
  }
  
  var html = HtmlService.createHtmlOutput(buildAlertsDialogHTML(alerts))
    .setWidth(500)
    .setHeight(400);
  
  ui.showModalDialog(html, '🚨 Alertas Ativos (' + alerts.length + ')');
}

/**
 * Constrói HTML do dialog de alertas
 */
function buildAlertsDialogHTML(alerts) {
  var html = '<style>';
  html += 'body { font-family: Arial, sans-serif; padding: 10px; }';
  html += '.alert { padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid; }';
  html += '.critical { background: #FFEBEE; border-color: #F44336; }';
  html += '.warning { background: #FFF3E0; border-color: #FF9800; }';
  html += '.info { background: #E3F2FD; border-color: #2196F3; }';
  html += '.title { font-weight: bold; margin-bottom: 4px; }';
  html += '.desc { color: #666; font-size: 13px; }';
  html += '.meta { font-size: 11px; color: #999; margin-top: 6px; }';
  html += '.btn { padding: 8px 16px; margin: 4px; border: none; border-radius: 4px; cursor: pointer; }';
  html += '.btn-ack { background: #4CAF50; color: white; }';
  html += '.btn-close { background: #9E9E9E; color: white; }';
  html += '</style>';
  
  alerts.forEach(function(a) {
    var cssClass = a.level === 1 ? 'critical' : (a.level === 2 ? 'warning' : 'info');
    html += '<div class="alert ' + cssClass + '">';
    html += '<div class="title">' + a.title + '</div>';
    html += '<div class="desc">' + a.description + '</div>';
    html += '<div class="meta">Módulo: ' + a.module + ' | ' + a.timestamp.substring(0, 10) + '</div>';
    html += '</div>';
  });
  
  html += '<div style="text-align: center; margin-top: 15px;">';
  html += '<button class="btn btn-close" onclick="google.script.host.close()">Fechar</button>';
  html += '</div>';
  
  return html;
}

/**
 * Mostra status das planilhas
 */
function showSheetStatus() {
  var status = getSheetStatus();
  var ui = SpreadsheetApp.getUi();
  
  var msg = 'Total de schemas: ' + status.total_schemas + '\n';
  msg += 'Planilhas existentes: ' + status.existing + '\n';
  msg += 'Planilhas faltantes: ' + status.missing + '\n\n';
  
  if (status.missing > 0) {
    msg += 'Faltantes:\n' + status.missing_sheets.slice(0, 10).join('\n');
    if (status.missing_sheets.length > 10) {
      msg += '\n... e mais ' + (status.missing_sheets.length - 10);
    }
  }
  
  ui.alert('📊 Status das Planilhas', msg, ui.ButtonSet.OK);
}

/**
 * Menu: Criar planilhas faltantes
 */
function menuCreateMissingSheets() {
  var ui = SpreadsheetApp.getUi();
  var status = getSheetStatus();
  
  if (status.missing === 0) {
    ui.alert('✓ Completo', 'Todas as planilhas já existem.', ui.ButtonSet.OK);
    return;
  }
  
  var response = ui.alert('Criar Planilhas',
    'Serão criadas ' + status.missing + ' planilhas faltantes.\n\nDeseja continuar?',
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    var result = createMissingSheets();
    ui.alert('Resultado', 
      'Criadas: ' + result.results.created.length + '\n' +
      'Erros: ' + result.results.errors.length,
      ui.ButtonSet.OK);
  }
}

/**
 * Menu: Validar integridade
 */
function menuValidateIntegrity() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('🔍 Validando...', 'Verificando integridade do banco de dados...', ui.ButtonSet.OK);
  
  var result = validateSheetIntegrity();
  
  var msg = 'Planilhas verificadas: ' + result.checked + '\n';
  msg += 'Válidas: ' + result.valid + '\n';
  msg += 'Com problemas: ' + result.invalid + '\n';
  
  if (result.issues.length > 0) {
    msg += '\nProblemas encontrados:\n';
    result.issues.slice(0, 5).forEach(function(issue) {
      msg += '• ' + issue.sheet + ': ' + issue.issue + '\n';
    });
  }
  
  ui.alert('📋 Resultado da Validação', msg, ui.ButtonSet.OK);
}

/**
 * Verifica alertas ao abrir (silencioso)
 */
function checkAlertsOnOpen() {
  try {
    var alerts = getActiveAlerts();
    var critical = alerts.filter(function(a) { return a.level === 1; });
    
    if (critical.length > 0) {
      // Mostra toast para alertas críticos
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '🚨 ' + critical.length + ' alerta(s) crítico(s) ativo(s)!',
        'Atenção',
        10
      );
    }
  } catch (e) {
    // Silencioso em caso de erro
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DIALOG SOBRE O SISTEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mostra informações sobre o sistema
 */
function showAboutDialog() {
  var html = HtmlService.createHtmlOutput(getAboutHTML())
    .setWidth(450)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, '🌊 Sistema de Monitoramento Limnológico');
}

/**
 * HTML do dialog Sobre
 */
function getAboutHTML() {
  var stats = getSystemStats();
  
  var html = '<style>';
  html += 'body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }';
  html += '.header { text-align: center; padding: 20px; background: linear-gradient(135deg, #00796B, #00BCD4); color: white; border-radius: 10px; margin-bottom: 20px; }';
  html += '.header h1 { margin: 0; font-size: 24px; }';
  html += '.header p { margin: 5px 0 0; opacity: 0.9; }';
  html += '.section { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }';
  html += '.section h3 { margin: 0 0 10px; color: #00796B; font-size: 14px; }';
  html += '.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }';
  html += '.stat { text-align: center; padding: 10px; background: #E0F2F1; border-radius: 6px; }';
  html += '.stat-value { font-size: 24px; font-weight: bold; color: #00796B; }';
  html += '.stat-label { font-size: 11px; color: #666; }';
  html += '.module-list { list-style: none; padding: 0; margin: 0; }';
  html += '.module-list li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }';
  html += '.module-list li:last-child { border: none; }';
  html += '.version { text-align: center; color: #999; font-size: 12px; margin-top: 15px; }';
  html += '</style>';
  
  html += '<div class="header">';
  html += '<h1>🌊 Reserva Araras</h1>';
  html += '<p>Sistema de Monitoramento Limnológico</p>';
  html += '</div>';
  
  html += '<div class="section">';
  html += '<h3>📊 ESTATÍSTICAS</h3>';
  html += '<div class="stat-grid">';
  html += '<div class="stat"><div class="stat-value">' + stats.totalColetas + '</div><div class="stat-label">Coletas</div></div>';
  html += '<div class="stat"><div class="stat-value">' + stats.totalPontos + '</div><div class="stat-label">Pontos</div></div>';
  html += '<div class="stat"><div class="stat-value">' + stats.totalSheets + '</div><div class="stat-label">Planilhas</div></div>';
  html += '<div class="stat"><div class="stat-value">' + stats.alertasAtivos + '</div><div class="stat-label">Alertas</div></div>';
  html += '</div>';
  html += '</div>';
  
  html += '<div class="section">';
  html += '<h3>📦 MÓDULOS INSTALADOS</h3>';
  html += '<ul class="module-list">';
  html += '<li>💧 Físico-Químico (CONAMA 357)</li>';
  html += '<li>🌿 Fitoplâncton</li>';
  html += '<li>🦐 Zooplâncton</li>';
  html += '<li>🌱 Macrófitas Aquáticas</li>';
  html += '<li>🐚 Macroinvertebrados Bentônicos</li>';
  html += '<li>🐟 Ictiofauna</li>';
  html += '</ul>';
  html += '</div>';
  
  html += '<div class="section">';
  html += '<h3>🛠️ FUNCIONALIDADES</h3>';
  html += '<ul class="module-list">';
  html += '<li>📝 Formulários padronizados (mobile-first)</li>';
  html += '<li>📊 Dashboard integrado</li>';
  html += '<li>📥 Exportação CSV/JSON/Relatório</li>';
  html += '<li>🚨 Sistema de alertas automáticos</li>';
  html += '<li>✅ Validação CONAMA 357/2005</li>';
  html += '</ul>';
  html += '</div>';
  
  html += '<div class="version">';
  html += 'Versão 1.0.0 | Dezembro 2025<br>';
  html += 'Desenvolvido para Samsung S20 + Lemur Browser';
  html += '</div>';
  
  return html;
}

/**
 * Obtém estatísticas do sistema
 */
function getSystemStats() {
  var stats = {
    totalColetas: 0,
    totalPontos: 0,
    totalSheets: 0,
    alertasAtivos: 0
  };
  
  try {
    // Coletas
    var collectionStats = getCollectionStats();
    stats.totalColetas = collectionStats.totalColetas || 0;
    stats.totalPontos = collectionStats.totalPontos || 0;
    
    // Planilhas
    var sheetStatus = getSheetStatus();
    stats.totalSheets = sheetStatus.existing || 0;
    
    // Alertas
    var alerts = getActiveAlerts();
    stats.alertasAtivos = alerts.length;
    
  } catch (e) {
    Logger.log('Erro em getSystemStats: ' + e);
  }
  
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// ATALHOS DE TECLADO E SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Abre sidebar de acesso rápido
 */
function openQuickAccessSidebar() {
  var html = HtmlService.createHtmlOutput(getQuickAccessHTML())
    .setTitle('🌊 Acesso Rápido');
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * HTML do sidebar de acesso rápido
 */
function getQuickAccessHTML() {
  var html = '<style>';
  html += 'body { font-family: Arial, sans-serif; padding: 15px; background: #121212; color: #E0E0E0; }';
  html += '.btn { display: block; width: 100%; padding: 15px; margin: 8px 0; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; text-align: left; }';
  html += '.btn-form { background: #1E3A5F; color: white; }';
  html += '.btn-form:hover { background: #2E4A6F; }';
  html += '.btn-action { background: #00796B; color: white; }';
  html += '.btn-action:hover { background: #00897B; }';
  html += '.section { margin: 20px 0; }';
  html += '.section-title { font-size: 12px; color: #888; margin-bottom: 10px; text-transform: uppercase; }';
  html += '</style>';
  
  html += '<div class="section">';
  html += '<div class="section-title">📝 Formulários</div>';
  html += '<button class="btn btn-form" onclick="google.script.run.openPhysicochemicalForm()">💧 Físico-Químico</button>';
  html += '<button class="btn btn-form" onclick="google.script.run.openPhytoplanktonForm()">🌿 Fitoplâncton</button>';
  html += '<button class="btn btn-form" onclick="google.script.run.openZooplanktonForm()">🦐 Zooplâncton</button>';
  html += '<button class="btn btn-form" onclick="google.script.run.openMacrophytesForm()">🌱 Macrófitas</button>';
  html += '<button class="btn btn-form" onclick="google.script.run.openBenthicForm()">🐚 Bentos</button>';
  html += '<button class="btn btn-form" onclick="google.script.run.openIchthyofaunaForm()">🐟 Ictiofauna</button>';
  html += '</div>';
  
  html += '<div class="section">';
  html += '<div class="section-title">⚡ Ações Rápidas</div>';
  html += '<button class="btn btn-action" onclick="google.script.run.openLimnologyDashboard()">📊 Dashboard</button>';
  html += '<button class="btn btn-action" onclick="google.script.run.openExportInterface()">📥 Exportar</button>';
  html += '<button class="btn btn-action" onclick="google.script.run.menuRunAlertCheck()">🚨 Verificar Alertas</button>';
  html += '</div>';
  
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES DE INTEGRAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema (primeira execução)
 */
function initializeSystem() {
  Logger.log('═══ INICIALIZANDO SISTEMA ═══');
  
  var results = {
    sheets: null,
    triggers: null,
    success: true
  };
  
  try {
    // 1. Cria planilhas faltantes
    Logger.log('1. Verificando planilhas...');
    var sheetStatus = getSheetStatus();
    if (sheetStatus.missing > 0) {
      results.sheets = createMissingSheets();
      Logger.log('   Criadas: ' + results.sheets.results.created.length);
    } else {
      Logger.log('   Todas as planilhas existem');
    }
    
    // 2. Configura trigger de alertas
    Logger.log('2. Configurando triggers...');
    results.triggers = setupDailyAlertTrigger();
    
    // 3. Executa verificação inicial de alertas
    Logger.log('3. Verificação inicial de alertas...');
    runAlertCheck();
    
    Logger.log('═══ SISTEMA INICIALIZADO ═══');
    
  } catch (e) {
    Logger.log('Erro na inicialização: ' + e);
    results.success = false;
    results.error = e.toString();
  }
  
  return results;
}

/**
 * Obtém resumo do sistema para API
 */
function getSystemSummary() {
  return {
    version: '1.0.0',
    modules: ['physicochemical', 'phytoplankton', 'zooplankton', 'macrophytes', 'benthic', 'ichthyofauna'],
    stats: getSystemStats(),
    quality: calculateWaterQualityIndex(),
    alerts: getActiveAlerts().length,
    lastUpdate: new Date().toISOString()
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE MENU PARA ANÁLISES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Menu: Análise de qualidade da água
 */
function menuAnalyzeWaterQuality() {
  var result = analyzeWaterQuality();
  var ui = SpreadsheetApp.getUi();
  
  if (!result.success) {
    ui.alert('Erro', result.error, ui.ButtonSet.OK);
    return;
  }
  
  var a = result.analysis;
  var msg = '💧 ANÁLISE DE QUALIDADE DA ÁGUA\n\n';
  msg += 'Período: ' + a.periodo.registros + ' registros\n\n';
  
  if (a.iqa) {
    msg += 'IQA: ' + a.iqa.value + ' - ' + a.iqa.classification.label + '\n';
  }
  if (a.iet) {
    msg += 'IET: ' + a.iet.value + ' - ' + a.iet.classification.label + '\n';
  }
  
  msg += '\nPARÂMETROS:\n';
  Object.keys(a.parametros).forEach(function(p) {
    var stats = a.parametros[p].estatisticas;
    var trend = a.parametros[p].tendencia;
    msg += '• ' + p + ': média=' + stats.mean + ' (±' + stats.std + ') ' + (trend ? trend.trend : '') + '\n';
  });
  
  ui.alert('Resultado', msg, ui.ButtonSet.OK);
}

/**
 * Menu: Análise bentônica
 */
function menuAnalyzeBenthic() {
  var result = analyzeBenthicCommunity();
  var ui = SpreadsheetApp.getUi();
  
  if (!result.success) {
    ui.alert('Erro', result.error, ui.ButtonSet.OK);
    return;
  }
  
  var a = result.analysis;
  var msg = '🐚 ANÁLISE DA COMUNIDADE BENTÔNICA\n\n';
  
  msg += 'DIVERSIDADE:\n';
  msg += '• Riqueza: ' + a.diversidade.riqueza + ' famílias\n';
  msg += '• Shannon (H\'): ' + a.diversidade.shannon + '\n';
  msg += '• Equitabilidade: ' + a.diversidade.pielou + '\n\n';
  
  msg += 'ÍNDICES BIÓTICOS:\n';
  msg += '• BMWP: ' + a.bmwp.value + ' - ' + a.bmwp.classification.label + '\n';
  msg += '  (' + a.bmwp.classification.quality + ')\n';
  msg += '• %EPT: ' + a.ept.value + '% - ' + (a.ept.classification ? a.ept.classification.label : 'N/A') + '\n';
  
  ui.alert('Resultado', msg, ui.ButtonSet.OK);
}

/**
 * Menu: Calcular índices de diversidade
 */
function menuCalculateDiversity() {
  var ui = SpreadsheetApp.getUi();
  
  var response = ui.prompt('Índices de Diversidade',
    'Digite as abundâncias separadas por vírgula:\n(ex: 10, 25, 5, 30, 8)',
    ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  var values = response.getResponseText().split(',').map(function(v) {
    return parseInt(v.trim()) || 0;
  }).filter(function(v) { return v > 0; });
  
  if (values.length === 0) {
    ui.alert('Erro', 'Nenhum valor válido informado', ui.ButtonSet.OK);
    return;
  }
  
  var indices = DiversityIndices.calculateAll(values);
  
  var msg = '📊 ÍNDICES DE DIVERSIDADE\n\n';
  msg += 'Riqueza (S): ' + indices.riqueza + '\n';
  msg += 'Abundância (N): ' + indices.abundanciaTotal + '\n\n';
  msg += 'Shannon (H\'): ' + indices.shannon + '\n';
  msg += 'Simpson (D): ' + indices.simpson + '\n';
  msg += 'Simpson inverso (1/D): ' + indices.simpsonInverso + '\n';
  msg += 'Margalef: ' + indices.margalef + '\n';
  msg += 'Pielou (J\'): ' + indices.pielou + '\n';
  msg += 'Berger-Parker: ' + indices.bergerParker + '\n';
  
  ui.alert('Resultado', msg, ui.ButtonSet.OK);
}
