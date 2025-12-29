/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT SERVICE - Sistema de Exportação de Dados
 * ═══════════════════════════════════════════════════════════════════════════
 */

var ExportService = (function() {
  'use strict';
  
  /**
   * Mapeamento de tipos de formulários para planilhas
   */
  var SHEET_MAPPING = {
    'phytoplankton': 'AmostragemFitoplancton',
    'zooplankton': 'AmostragemZooplancton',
    'physicochemical': 'AnalisesFisicoQuimicas',
    'observations': 'ObservacoesGerais',
    'ichthyofauna': 'RegistrosIctiofauna',
    'macrophytes': 'MacrofitasAquaticas',
    'limnology': 'MonitoramentoLimnologico',
    'benthic': 'AmostragemBentonica'
  };
  
  /**
   * Títulos legíveis por tipo
   */
  var TYPE_TITLES = {
    'phytoplankton': 'Amostragem de Fitoplâncton',
    'zooplankton': 'Amostragem de Zooplâncton',
    'physicochemical': 'Análises Físico-Químicas',
    'observations': 'Observações Gerais',
    'ichthyofauna': 'Registro de Ictiofauna',
    'macrophytes': 'Macrófitas Aquáticas',
    'limnology': 'Monitoramento Limnológico',
    'benthic': 'Amostragem Bentônica'
  };
  
  /**
   * Busca dados por período
   */
  function queryDataByDateRange(formType, startDate, endDate, filters) {
    try {
      var sheetName = SHEET_MAPPING[formType];
      if (!sheetName) {
        throw new Error('Tipo de formulário inválido: ' + formType);
      }
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        Logger.log('⚠️ Planilha não encontrada: ' + sheetName);
        return [];
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return []; // Apenas cabeçalho ou vazio
      
      var headers = data[0];
      var results = [];
      
      var start = startDate ? new Date(startDate) : new Date(0);
      var end = endDate ? new Date(endDate) : new Date();
      
      // Processa cada linha
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowObj = {};
        
        // Converte para objeto
        for (var j = 0; j < headers.length; j++) {
          rowObj[headers[j]] = row[j];
        }
        
        // Filtra por data
        var rowDate = rowObj.data ? new Date(rowObj.data) : null;
        if (rowDate && rowDate >= start && rowDate <= end) {
          // Aplica filtros adicionais se existirem
          var matchesFilters = true;
          if (filters) {
            for (var key in filters) {
              if (rowObj[key] != filters[key]) {
                matchesFilters = false;
                break;
              }
            }
          }
          
          if (matchesFilters) {
            results.push(rowObj);
          }
        }
      }
      
      return results;
      
    } catch (error) {
      Logger.log('❌ Erro em queryDataByDateRange: ' + error);
      return [];
    }
  }
  
  /**
   * Exporta para CSV
   */
  function exportToCSV(data, formType, options) {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Nenhum dado disponível para exportação'
        };
      }
      
      options = options || {};
      var delimiter = options.delimiter || ',';
      var headers = Object.keys(data[0]);
      
      // Monta CSV
      var csv = [];
      
      // Cabeçalho
      csv.push(headers.join(delimiter));
      
      // Dados
      data.forEach(function(row) {
        var values = headers.map(function(header) {
          var value = row[header] || '';
          // Escapa valores com vírgula ou aspas
          if (String(value).indexOf(delimiter) > -1 || String(value).indexOf('"') > -1) {
            value = '"' + String(value).replace(/"/g, '""') + '"';
          }
          return value;
        });
        csv.push(values.join(delimiter));
      });
      
      var csvContent = csv.join('\n');
      
      // Cria arquivo no Drive
      var folder = getFolderOrCreate('Exportacoes');
      var fileName = 'Exportacao_' + formType + '_' + 
                     Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.csv';
      
      var blob = Utilities.newBlob(csvContent, 'text/csv', fileName);
      var file = folder.createFile(blob);
      
      Logger.log('✅ CSV criado: ' + file.getName());
      
      return {
        success: true,
        fileId: file.getId(),
        fileName: file.getName(),
        url: file.getUrl(),
        mimeType: 'text/csv',
        recordCount: data.length
      };
      
    } catch (error) {
      Logger.log('❌ Erro em exportToCSV: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Exporta para Excel (Google Sheets)
   */
  function exportToExcel(data, formType, options) {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Nenhum dado disponível para exportação'
        };
      }
      
      options = options || {};
      var title = TYPE_TITLES[formType] || formType;
      
      // Cria nova planilha
      var ss = SpreadsheetApp.create('Exportacao_' + formType + '_' + 
                                     Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss'));
      var sheet = ss.getActiveSheet();
      sheet.setName(title);
      
      // Cabeçalho
      var headers = Object.keys(data[0]);
      sheet.appendRow(headers);
      
      // Formata cabeçalho
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      
      // Dados
      data.forEach(function(row) {
        var values = headers.map(function(header) {
          return row[header] || '';
        });
        sheet.appendRow(values);
      });
      
      // Auto-resize colunas
      for (var i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
      
      // Congela primeira linha
      sheet.setFrozenRows(1);
      
      // Adiciona filtros
      sheet.getDataRange().createFilter();
      
      // Move para pasta correta
      var folder = getFolderOrCreate('Exportacoes');
      var file = DriveApp.getFileById(ss.getId());
      file.moveTo(folder);
      
      Logger.log('✅ Excel criado: ' + file.getName());
      
      return {
        success: true,
        fileId: ss.getId(),
        fileName: file.getName(),
        url: ss.getUrl(),
        mimeType: 'application/vnd.google-apps.spreadsheet',
        recordCount: data.length
      };
      
    } catch (error) {
      Logger.log('❌ Erro em exportToExcel: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Exporta para PDF
   */
  function exportToPDF(data, formType, options) {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Nenhum dado disponível para exportação'
        };
      }
      
      options = options || {};
      var title = TYPE_TITLES[formType] || formType;
      
      // Cria documento temporário
      var docName = 'Exportacao_' + formType + '_' + 
                    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
      var doc = DocumentApp.create(docName);
      var body = doc.getBody();
      
      // Cabeçalho do documento
      var header = body.appendParagraph(title);
      header.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      
      // Informações da exportação
      body.appendParagraph('Data de Geração: ' + 
                          Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
      
      if (options.startDate && options.endDate) {
        body.appendParagraph('Período: ' + options.startDate + ' até ' + options.endDate);
      }
      
      body.appendParagraph('Total de Registros: ' + data.length);
      body.appendParagraph(''); // Espaço
      
      // Tabela de dados
      var headers = Object.keys(data[0]);
      var table = body.appendTable();
      
      // Linha de cabeçalho
      var headerRow = table.appendTableRow();
      headers.forEach(function(header) {
        var cell = headerRow.appendTableCell(header);
        cell.setBackgroundColor('#4CAF50');
        var para = cell.getChild(0).asParagraph();
        para.setForegroundColor('#FFFFFF');
        para.setBold(true);
      });
      
      // Linhas de dados (limita a 100 registros para não sobrecarregar)
      var maxRows = Math.min(data.length, 100);
      for (var i = 0; i < maxRows; i++) {
        var row = data[i];
        var dataRow = table.appendTableRow();
        
        headers.forEach(function(header) {
          var value = row[header] || '';
          // Limita tamanho do texto
          if (String(value).length > 50) {
            value = String(value).substring(0, 47) + '...';
          }
          dataRow.appendTableCell(String(value));
        });
      }
      
      if (data.length > 100) {
        body.appendParagraph('');
        body.appendParagraph('Nota: Exibindo apenas os primeiros 100 registros de ' + 
                            data.length + ' total.');
      }
      
      // Salva e fecha
      doc.saveAndClose();
      
      // Converte para PDF
      var docFile = DriveApp.getFileById(doc.getId());
      var pdfBlob = docFile.getAs('application/pdf');
      
      // Salva na pasta
      var folder = getFolderOrCreate('Exportacoes');
      var pdfFile = folder.createFile(pdfBlob);
      pdfFile.setName(docName + '.pdf');
      
      // Remove documento temporário
      docFile.setTrashed(true);
      
      Logger.log('✅ PDF criado: ' + pdfFile.getName());
      
      return {
        success: true,
        fileId: pdfFile.getId(),
        fileName: pdfFile.getName(),
        url: pdfFile.getUrl(),
        mimeType: 'application/pdf',
        recordCount: data.length
      };
      
    } catch (error) {
      Logger.log('❌ Erro em exportToPDF: ' + error);
      Logger.log('Stack: ' + error.stack);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Obtém ou cria pasta
   */
  function getFolderOrCreate(folderName) {
    var folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    }
    
    return DriveApp.createFolder(folderName);
  }
  
  /**
   * Lista exportações existentes
   */
  function listExports(limit) {
    try {
      limit = limit || 20;
      var folder = getFolderOrCreate('Exportacoes');
      var files = folder.getFiles();
      var exports = [];
      
      while (files.hasNext() && exports.length < limit) {
        var file = files.next();
        exports.push({
          id: file.getId(),
          name: file.getName(),
          mimeType: file.getMimeType(),
          size: file.getSize(),
          created: file.getDateCreated(),
          modified: file.getLastUpdated(),
          url: file.getUrl()
        });
      }
      
      // Ordena por data de criação (mais recente primeiro)
      exports.sort(function(a, b) {
        return b.created - a.created;
      });
      
      return {
        success: true,
        exports: exports,
        total: exports.length
      };
      
    } catch (error) {
      Logger.log('❌ Erro em listExports: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  // API Pública
  return {
    exportToCSV: exportToCSV,
    exportToExcel: exportToExcel,
    exportToPDF: exportToPDF,
    queryDataByDateRange: queryDataByDateRange,
    listExports: listExports
  };
})();

/**
 * Funções de API expostas
 */
function apiExportData(formType, format, startDate, endDate, filters) {
  try {
    // Busca dados
    var data = ExportService.queryDataByDateRange(formType, startDate, endDate, filters);
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Nenhum dado encontrado para o período selecionado'
      };
    }
    
    // Exporta no formato solicitado
    var result;
    switch (format.toLowerCase()) {
      case 'csv':
        result = ExportService.exportToCSV(data, formType);
        break;
      case 'excel':
        result = ExportService.exportToExcel(data, formType);
        break;
      case 'pdf':
        result = ExportService.exportToPDF(data, formType, {
          startDate: startDate,
          endDate: endDate
        });
        break;
      default:
        return {
          success: false,
          error: 'Formato inválido: ' + format
        };
    }
    
    return result;
    
  } catch (error) {
    Logger.log('❌ Erro em apiExportData: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function apiListExports(limit) {
  return ExportService.listExports(limit);
}

function apiDeleteExport(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    
    return {
      success: true,
      message: 'Arquivo removido com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
