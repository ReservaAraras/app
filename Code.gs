/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESEX ARARAS - MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ponto de entrada principal do Web App.
 * Otimizado para Samsung S20 + Lemur Browser.
 * 
 * Arquivos relacionados:
 * - ApiEndpoints.gs: APIs expostas para o frontend
 * - MenuUI.gs: Menu e diálogos do Google Sheets
 * - SystemInit.gs: Inicialização e testes do sistema
 * 
 * @version 4.0.0
 * @date 2025-12-27
 */

/**
 * Ponto de entrada principal para Web App
 * @param {Object} e - Parâmetros da requisição
 * @returns {HtmlOutput} Página HTML renderizada
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'main';
    
    // Pré-aquece o cache em background
    _warmupCacheAsync();
    
    // Roteamento de páginas
    const pageConfig = _getPageConfig(page);
    
    return HtmlService.createTemplateFromFile(pageConfig.template)
      .evaluate()
      .setTitle(pageConfig.title)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
      
  } catch (error) {
    Logger.log('Erro em doGet: ' + error);
    return _renderErrorPage(error);
  }
}

/**
 * Inclui arquivos HTML parciais
 * @param {string} filename - Nome do arquivo a incluir
 * @returns {string} Conteúdo HTML do arquivo
 */
function include(filename) {
  if (!filename || typeof filename !== 'string') {
    Logger.log('Erro ao incluir script: nome de arquivo inválido');
    return '<!-- Erro: nome de arquivo inválido -->';
  }
  
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log('Erro ao incluir arquivo: ' + filename + ' - ' + error);
    return '<!-- Erro ao carregar: ' + filename + ' -->';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS PRIVADOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retorna configuração da página
 * @private
 */
function _getPageConfig(page) {
  const pages = {
    'export': {
      template: 'MobileExportInterface',
      title: '📤 Exportar Dados - RESEX Araras'
    },
    'main': {
      template: 'Index',
      title: '🌳 RESEX Araras'
    },
    'normalized-dashboard': {
      template: 'DashboardVisualization',
      title: '📊 Dashboard de Índices Normalizados'
    },
    'dashboard': {
      template: 'DashboardVisualization',
      title: '📊 Dashboard de Índices Normalizados'
    },
    'visualizations': {
      template: 'VisualizationDashboard',
      title: '📊 Visualizações - RESEX Araras'
    },
    'viz': {
      template: 'VisualizationDashboard',
      title: '📊 Visualizações - RESEX Araras'
    },
    'plan': {
      template: 'Plan',
      title: '📋 Plano Integrado - Reserva Araras'
    }
  };
  
  return pages[page] || pages['main'];
}

/**
 * Retorna URL do documento Plan.html
 * Usado pelo frontend para abrir em nova aba
 */
function getPlanDocumentUrl() {
  try {
    const scriptUrl = ScriptApp.getService().getUrl();
    return scriptUrl + '?page=plan';
  } catch (error) {
    Logger.log('Erro ao obter URL do Plan: ' + error);
    return null;
  }
}

/**
 * Pré-aquece o cache de forma assíncrona
 * @private
 */
function _warmupCacheAsync() {
  try {
    if (typeof CacheManager !== 'undefined') {
      if (CacheManager.warmupForIndex) {
        CacheManager.warmupForIndex();
      } else if (CacheManager.warmup) {
        CacheManager.warmup();
      }
    }
  } catch (e) {
    // Silencioso - não deve impactar o carregamento
    Logger.log('Warmup cache: ' + e);
  }
}

/**
 * Renderiza página de erro
 * @private
 */
function _renderErrorPage(error) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 20px; 
            background: #121212; 
            color: #E0E0E0; 
          }
          h1 { color: #EF9A9A; }
          .retry-btn { 
            background: #6A994E; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 16px; 
            cursor: pointer; 
            margin-top: 20px; 
          }
          .retry-btn:hover { background: #5a8340; }
        </style>
      </head>
      <body>
        <h1>⚠️ Erro ao carregar</h1>
        <p>${error.toString()}</p>
        <button class="retry-btn" onclick="location.reload()">🔄 Tentar Novamente</button>
      </body>
    </html>
  `);
}
