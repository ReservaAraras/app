var SheetHelper = {};

// Obtém a sheet por nome ou lança erro
SheetHelper.getSheet = function(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Planilha "' + sheetName + '" não encontrada');
  }
  return sheet;
};

SheetHelper.getData = function(sheetName) {
  try {
    var sheet = SheetHelper.getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) return [];
    var headers = data[0];
    var rows = data.slice(1);
    var result = [];
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        obj[headers[c]] = row[c];
      }
      result.push(obj);
    }
    return result;
  } catch (error) {
    return Utils.handleError(error, 'SheetHelper.getData');
  }
};

SheetHelper.addRow = function(sheetName, rowData) {
  try {
    var sheet = SheetHelper.getSheet(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      newRow.push(rowData && rowData.hasOwnProperty(h) ? rowData[h] : '');
    }
    sheet.appendRow(newRow);
    return Utils.createResponse(true, 'Registro adicionado com sucesso', { row: sheet.getLastRow() });
  } catch (error) {
    return Utils.handleError(error, 'SheetHelper.addRow');
  }
};

SheetHelper.updateRow = function(sheetName, rowNumber, rowData) {
  try {
    var sheet = SheetHelper.getSheet(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      if (rowData && rowData.hasOwnProperty(header)) {
        sheet.getRange(rowNumber, i + 1).setValue(rowData[header]);
      }
    }
    return Utils.createResponse(true, 'Registro atualizado com sucesso');
  } catch (error) {
    return Utils.handleError(error, 'SheetHelper.updateRow');
  }
};

SheetHelper.deleteRow = function(sheetName, rowNumber) {
  try {
    var sheet = SheetHelper.getSheet(sheetName);
    sheet.deleteRow(rowNumber);
    return Utils.createResponse(true, 'Registro excluído com sucesso');
  } catch (error) {
    return Utils.handleError(error, 'SheetHelper.deleteRow');
  }
};

SheetHelper.findRow = function(sheetName, searchColumn, searchValue) {
  try {
    var sheet = SheetHelper.getSheet(sheetName);
    var data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) return null;
    var headers = data[0];
    var columnIndex = headers.indexOf(searchColumn);
    if (columnIndex === -1) {
      throw new Error('Coluna "' + searchColumn + '" não encontrada');
    }
    for (var i = 1; i < data.length; i++) {
      if (data[i][columnIndex] == searchValue) {
        return i + 1; // retorna número da linha (1-based)
      }
    }
    return null;
  } catch (error) {
    Logger.log('Erro em SheetHelper.findRow: ' + (error && error.message ? error.message : error));
    return null;
  }
};

// Adiciona fallback mínimo para Utils quando não existir no projeto
if (typeof Utils === 'undefined') {
  var Utils = {
    createResponse: function(success, message, data) {
      return { success: !!success, message: message || '', data: data || null };
    },
    handleError: function(error, context) {
      // Loga e retorna objeto de erro simples
      try { Logger.log((context ? context + ': ' : '') + (error && error.message ? error.message : String(error))); } catch (e) {}
      return { success: false, message: (error && error.message) || String(error) || 'Erro desconhecido' };
    }
  };
}
