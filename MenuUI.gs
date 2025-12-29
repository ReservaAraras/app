/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU UI - Interface de Menu do Google Sheets
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Funções de menu e diálogos do Google Sheets.
 * Extraído do Code.gs para melhor organização.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Cria menu personalizado ao abrir a planilha
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🌳 RESEX Araras')
      .addItem('🚀 Inicializar Sistema', 'inicializarSistemaCompleto')
      .addItem('🧪 Testar Sistema', 'testarSistema')
      .addItem('📊 Criar Dados de Exemplo', 'criarDadosExemplo')
      .addSeparator()
      .addSubMenu(ui.createMenu('📊 Visualizações')
        .addItem('📈 Dashboard de Gráficos', 'showVisualizationDashboard')
        .addItem('🔄 Sincronizar do Drive', 'syncVisualizationsFromDrive')
        .addSeparator()
        .addItem('⏰ Configurar Sync Diário', 'setupDailySyncTrigger')
        .addItem('🗑️ Limpar Cache', 'clearVisualizationCache'))
      .addSubMenu(ui.createMenu('🧪 Testes')
        .addItem('📊 Dashboard de Testes', 'openTestDashboard')
        .addItem('🧭 Validador de Navegação', 'openNavigationValidator')
        .addSeparator()
        .addItem('▶️ Suite Completa', 'runComprehensiveTests')
        .addItem('🔬 Integração CRUD', 'runIntegrationTests')
        .addItem('🧭 Navegação Frontend', 'runAllNavigationTests')
        .addItem('⚡ Componentes Críticos', 'runCriticalComponentsTests')
        .addSeparator()
        .addItem('🎲 Gerar Dados de Teste', 'testDataPopulation')
        .addItem('📊 Análise de Cobertura', 'analisarCoberturaTestes'))
      .addSeparator()
      .addItem('⚙️ Configurar Ambiente', 'mostrarConfiguracao')
      .addItem('📱 Abrir App Mobile', 'abrirAppMobile')
      .addItem('📤 Abrir Exportação', 'abrirExportacao')
      .addToUi();
  } catch (error) {
    Logger.log('Erro ao criar menu: ' + error);
  }
}

/**
 * Mostra diálogo de configuração
 */
function mostrarConfiguracao() {
  const config = getEnvironmentConfig();
  const ui = SpreadsheetApp.getUi();
  
  const msg = `
Configuração Atual:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPREADSHEET_ID: ${config.SPREADSHEET_ID || 'NÃO CONFIGURADO'}
DRIVE_FOLDER_ID: ${config.DRIVE_FOLDER_ID || 'NÃO CONFIGURADO'}
GEMINI_API_KEY: ${config.GEMINI_API_KEY ? '***' + config.GEMINI_API_KEY.slice(-4) : 'NÃO CONFIGURADO'}
GEMINI_TEMPERATURE: ${config.GEMINI_TEMPERATURE !== null ? config.GEMINI_TEMPERATURE : '0.7 (padrão)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Todas as configurações são lidas das Variáveis de Ambiente (Properties Service)

Para alterar, execute no editor de scripts:
saveEnvironmentConfig({
  SPREADSHEET_ID: 'seu_id',
  DRIVE_FOLDER_ID: 'seu_id',
  GEMINI_API_KEY: 'sua_chave',
  GEMINI_TEMPERATURE: '0'
});
  `;
  
  ui.alert('⚙️ Configuração do Sistema', msg, ui.ButtonSet.OK);
}

/**
 * Abre diálogo com URL do app mobile
 */
function abrirAppMobile() {
  const url = ScriptApp.getService().getUrl();
  _showUrlDialog('📱 App Mobile', url, 'Abra esta URL no Samsung S20 + Lemur Browser:');
}

/**
 * Abre diálogo com URL de exportação
 */
function abrirExportacao() {
  const url = ScriptApp.getService().getUrl() + '?page=export';
  _showUrlDialog('📤 Interface de Exportação', url, 'Abra esta URL no Samsung S20 + Lemur Browser:');
}

/**
 * Helper para mostrar diálogo com URL
 * @private
 */
function _showUrlDialog(title, url, message) {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; }
          h2 { margin-top: 0; color: #386641; }
          a { color: #386641; word-break: break-all; }
          button { background: #386641; color: white; border: none; padding: 8px 16px; 
                   border-radius: 4px; cursor: pointer; margin-top: 16px; }
          button:hover { background: #2d5235; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p>${message}</p>
        <p><a href="${url}" target="_blank">${url}</a></p>
        <button onclick="google.script.host.close()">Fechar</button>
      </body>
    </html>
  `;
  
  const output = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(200);
  
  SpreadsheetApp.getUi().showModalDialog(output, title);
}


/**
 * Abre diálogo com URL das visualizações
 */
function abrirVisualizacoes() {
  const url = ScriptApp.getService().getUrl() + '?page=visualizations';
  _showUrlDialog('📊 Visualizações', url, 'Dashboard de gráficos e análises:');
}

/**
 * Mostra status da sincronização de visualizações
 */
function mostrarStatusVisualizacoes() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const status = getVisualizationSyncStatus();
    const metadata = getVisualizationMetadata();
    const count = Object.keys(metadata).length;
    
    const lastSync = status.lastSync 
      ? new Date(status.lastSync).toLocaleString('pt-BR')
      : 'Nunca sincronizado';
    
    const msg = `
📊 STATUS DAS VISUALIZAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de gráficos: ${count}
Última sincronização: ${lastSync}
Sincronizado por: ${status.syncedBy || 'N/A'}

Pasta do Drive:
https://drive.google.com/drive/folders/${VIZ_CONFIG.DRIVE_FOLDER_ID}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para sincronizar manualmente:
Menu > Visualizações > Sincronizar do Drive

Para configurar sincronização automática diária:
Menu > Visualizações > Configurar Sync Diário
    `;
    
    ui.alert('📊 Status das Visualizações', msg, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Erro', 'Erro ao obter status: ' + error.message, ui.ButtonSet.OK);
  }
}
