/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCRIPT INCLUDE HELPER
 * ═══════════════════════════════════════════════════════════════════════════
 * Helper para incluir scripts .gs em arquivos HTML
 * Otimizado para carregamento rápido do Index.html
 * 
 * USO NO HTML:
 * <?!= includeScript('NomeDoArquivo_Script1'); ?>
 */

/**
 * Inclui um arquivo .gs como script no HTML
 * @param {string} filename - Nome do arquivo sem extensão
 * @returns {string} Tag script com o conteúdo
 */
function includeScript(filename) {
  // Validacao: verifica se filename foi fornecido
  if (!filename || typeof filename !== 'string') {
    const errorMsg = 'includeScript() chamado com parametro invalido';
    const errorDetails = {
      parametro: filename,
      tipo: typeof filename,
      valor: String(filename)
    };
    
    // Log detalhado
    Logger.log('Erro ao incluir script undefined: Exception: Bad value');
    Logger.log('A funcao includeScript() requer um nome de arquivo valido como string');
    Logger.log('Parametro recebido: ' + JSON.stringify(errorDetails));
    
    // Log enterprise se disponivel
    if (typeof EnterpriseLogger !== 'undefined') {
      EnterpriseLogger.error(errorMsg, errorDetails);
    }
    
    return '<!-- Erro: nome de arquivo invalido (recebido: ' + typeof filename + ') -->';
  }
  
  try {
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
    
    // Log de sucesso se enterprise logger disponivel
    if (typeof EnterpriseLogger !== 'undefined') {
      EnterpriseLogger.debug('Script incluido', { filename: filename });
    }
    
    return '<script>' + content + '</script>';
  } catch (error) {
    Logger.log('Erro ao incluir script ' + filename + ': ' + error);
    
    if (typeof EnterpriseLogger !== 'undefined') {
      EnterpriseLogger.error('Erro ao incluir script', { filename: filename }, error);
    }
    
    return '<!-- Erro ao carregar ' + filename + ': ' + error.message + ' -->';
  }
}

/**
 * Inclui múltiplos scripts
 * @param {Array<string>} filenames - Array de nomes de arquivos
 * @returns {string} Tags script concatenadas
 */
function includeScripts(filenames) {
  // Validacao: verifica se filenames foi fornecido e e um array
  if (!filenames) {
    Logger.log('Erro: includeScripts() foi chamado sem parametros');
    Logger.log('Uso correto: includeScripts(["arquivo1", "arquivo2"])');
    return '<!-- Erro: array de arquivos nao fornecido -->';
  }
  
  if (!Array.isArray(filenames)) {
    Logger.log('Erro: includeScripts() requer um array de nomes de arquivos');
    Logger.log('Recebido: ' + typeof filenames);
    Logger.log('Uso correto: includeScripts(["arquivo1", "arquivo2"])');
    return '<!-- Erro: parametro deve ser um array -->';
  }
  
  if (filenames.length === 0) {
    Logger.log('Aviso: includeScripts() chamado com array vazio');
    return '<!-- Array vazio - nenhum script incluido -->';
  }
  
  try {
    return filenames.map(function(filename) {
      return includeScript(filename);
    }).join('\n');
  } catch (error) {
    Logger.log('Erro ao processar scripts: ' + error);
    return '<!-- Erro ao processar array de scripts -->';
  }
}

/**
 * Inclui CSS de um arquivo HTML
 * @param {string} filename - Nome do arquivo HTML contendo CSS
 * @returns {string} Tag style com o conteúdo
 */
function includeStyle(filename) {
  if (!filename || typeof filename !== 'string') {
    return '<!-- Erro: nome de arquivo CSS invalido -->';
  }
  
  try {
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
    return '<style>' + content + '</style>';
  } catch (error) {
    Logger.log('Erro ao incluir estilo ' + filename + ': ' + error);
    return '<!-- Erro ao carregar estilo: ' + filename + ' -->';
  }
}

/**
 * Inclui HTML parcial (para componentes reutilizáveis)
 * @param {string} filename - Nome do arquivo HTML
 * @returns {string} Conteúdo HTML
 */
function includePartial(filename) {
  if (!filename || typeof filename !== 'string') {
    return '<!-- Erro: nome de arquivo parcial invalido -->';
  }
  
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log('Erro ao incluir parcial ' + filename + ': ' + error);
    return '<!-- Erro ao carregar parcial: ' + filename + ' -->';
  }
}

/**
 * Retorna dados de configuração para injetar no HTML
 * Útil para passar configurações do backend para o frontend
 * @returns {string} Script com configurações
 */
function includeConfig() {
  try {
    const config = {
      version: CONFIG.VERSION,
      appName: CONFIG.APP_NAME,
      limits: CONFIG.LIMITS,
      featureFlags: CONFIG.FEATURE_FLAGS,
      timestamp: new Date().toISOString()
    };
    
    return '<script>window.APP_CONFIG = ' + JSON.stringify(config) + ';</script>';
  } catch (error) {
    Logger.log('Erro ao incluir config: ' + error);
    return '<script>window.APP_CONFIG = {};</script>';
  }
}

/**
 * Exemplo de uso em HTML:
 * 
 * No <head> ou <body>:
 * <?!= includeScript('Index_Script1'); ?>
 * 
 * Ou múltiplos:
 * <?!= includeScripts(['Index_Script1', 'Index_Script2']); ?>
 * 
 * Para CSS:
 * <?!= includeStyle('StylesMobile'); ?>
 * 
 * Para componentes:
 * <?!= includePartial('UIComponents'); ?>
 * 
 * Para configurações:
 * <?!= includeConfig(); ?>
 */
