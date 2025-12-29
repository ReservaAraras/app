// Roteador de ações públicas (mapeie ações esperadas pelo frontend)
var ACTIONS = {
  getData: function(payload) {
    return SheetHelper.getData(payload.sheetName);
  },
  addRow: function(payload) {
    return SheetHelper.addRow(payload.sheetName, payload.rowData);
  },
  updateRow: function(payload) {
    return SheetHelper.updateRow(payload.sheetName, payload.rowNumber, payload.rowData);
  },
  deleteRow: function(payload) {
    return SheetHelper.deleteRow(payload.sheetName, payload.rowNumber);
  },
  findRow: function(payload) {
    return SheetHelper.findRow(payload.sheetName, payload.searchColumn, payload.searchValue);
  }
};

/**
 * Handler de GET legado - DESABILITADO
 * Use Code.gs doGet() como ponto de entrada principal
 * Esta função foi renomeada para evitar conflito
 */
function _legacyDoGet(e) {
  try {
    var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'index';
    return HtmlService.createTemplateFromFile(page)
      .evaluate()
      .setTitle('Sistema Arraras')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return HtmlService.createHtmlOutput('Erro ao carregar página: ' + (error && error.message ? error.message : error));
  }
}

function doPost(e) {
  try {
    var action = e.parameter && e.parameter.action;
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (!action || !ACTIONS[action]) {
      throw new Error('Ação não encontrada: ' + action);
    }
    var result = ACTIONS[action](body);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify(Utils.handleError(error, 'ApiHandler.doPost')))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  // Validacao: verifica se filename foi fornecido
  if (!filename || typeof filename !== 'string') {
    Logger.log('Erro ao incluir script undefined: Exception: Bad value');
    Logger.log('A funcao include() requer um nome de arquivo valido como string');
    return '<!-- Erro: nome de arquivo invalido ou undefined -->';
  }
  
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log('Erro ao incluir arquivo: ' + filename + ' - ' + error);
    return '<!-- Erro ao carregar: ' + filename + ' -->';
  }
}

function createFormTemplate(title, formContent) {
  var template = HtmlService.createTemplateFromFile('FormTemplate');
  template.title = title;
  template.formContent = formContent;
  return template.evaluate();
}
