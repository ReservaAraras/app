/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OFFLINE SERVICE - Suporte Offline e Sincronização
 * ═══════════════════════════════════════════════════════════════════════════
 */

var OfflineService = (function() {
  'use strict';
  
  var SYNC_QUEUE_SHEET = 'FilaSincronizacao';
  var MAX_RETRY_ATTEMPTS = 3;
  var SYNC_STATUS = {
    PENDING: 'PENDENTE',
    SYNCING: 'SINCRONIZANDO',
    SUCCESS: 'SUCESSO',
    FAILED: 'FALHA',
    CONFLICT: 'CONFLITO'
  };
  
  /**
   * Adiciona item à fila de sincronização
   */
  function addToSyncQueue(formType, data, metadata) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(SYNC_QUEUE_SHEET);
        sheet.appendRow([
          'ID', 'Timestamp', 'FormType', 'Data', 'Metadata', 
          'Status', 'RetryCount', 'LastAttempt', 'ErrorMessage'
        ]);
      }
      
      var queueId = 'QUEUE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      sheet.appendRow([
        queueId,
        new Date(),
        formType,
        JSON.stringify(data),
        JSON.stringify(metadata || {}),
        SYNC_STATUS.PENDING,
        0,
        '',
        ''
      ]);
      
      Logger.log('✅ Item adicionado à fila: ' + queueId);
      
      return {
        success: true,
        queueId: queueId,
        message: 'Dados salvos localmente. Serão sincronizados quando online.'
      };
      
    } catch (error) {
      Logger.log('❌ Erro em addToSyncQueue: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Processa fila de sincronização
   */
  function processSyncQueue() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        return {
          success: true,
          processed: 0,
          message: 'Fila vazia'
        };
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return {
          success: true,
          processed: 0,
          message: 'Fila vazia'
        };
      }
      
      var headers = data[0];
      var processed = 0;
      var failed = 0;
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowData = {};
        
        for (var j = 0; j < headers.length; j++) {
          rowData[headers[j]] = row[j];
        }
        
        // Processa apenas itens pendentes ou com falha (retry)
        if (rowData.Status === SYNC_STATUS.PENDING || 
            (rowData.Status === SYNC_STATUS.FAILED && rowData.RetryCount < MAX_RETRY_ATTEMPTS)) {
          
          var result = syncQueueItem(rowData, i + 1, sheet);
          
          if (result.success) {
            processed++;
          } else {
            failed++;
          }
        }
      }
      
      Logger.log('✅ Sincronização concluída: ' + processed + ' sucesso, ' + failed + ' falhas');
      
      return {
        success: true,
        processed: processed,
        failed: failed,
        message: 'Sincronização concluída'
      };
      
    } catch (error) {
      Logger.log('❌ Erro em processSyncQueue: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Sincroniza um item da fila
   */
  function syncQueueItem(queueItem, rowIndex, sheet) {
    try {
      // Atualiza status para sincronizando
      sheet.getRange(rowIndex, 6).setValue(SYNC_STATUS.SYNCING);
      sheet.getRange(rowIndex, 8).setValue(new Date());
      
      // Parse dos dados
      var formType = queueItem.FormType;
      var data = JSON.parse(queueItem.Data);
      var metadata = JSON.parse(queueItem.Metadata);
      
      // Obtém o handler apropriado
      var targetSheet = getTargetSheet(formType);
      
      if (!targetSheet) {
        throw new Error('Planilha não encontrada para tipo: ' + formType);
      }
      
      // Verifica conflitos
      var conflict = checkForConflicts(targetSheet, data, metadata);
      
      if (conflict.hasConflict) {
        sheet.getRange(rowIndex, 6).setValue(SYNC_STATUS.CONFLICT);
        sheet.getRange(rowIndex, 9).setValue('Conflito: ' + conflict.message);
        
        return {
          success: false,
          conflict: true,
          message: conflict.message
        };
      }
      
      // Salva os dados
      var saveResult = saveToTargetSheet(targetSheet, data, metadata);
      
      if (saveResult.success) {
        sheet.getRange(rowIndex, 6).setValue(SYNC_STATUS.SUCCESS);
        sheet.getRange(rowIndex, 9).setValue('');
        
        Logger.log('✅ Item sincronizado: ' + queueItem.ID);
        
        return {
          success: true,
          message: 'Sincronizado com sucesso'
        };
      } else {
        throw new Error(saveResult.error);
      }
      
    } catch (error) {
      // Incrementa contador de retry
      var retryCount = parseInt(queueItem.RetryCount) + 1;
      sheet.getRange(rowIndex, 7).setValue(retryCount);
      
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        sheet.getRange(rowIndex, 6).setValue(SYNC_STATUS.FAILED);
      } else {
        sheet.getRange(rowIndex, 6).setValue(SYNC_STATUS.PENDING);
      }
      
      sheet.getRange(rowIndex, 9).setValue(error.toString());
      
      Logger.log('❌ Erro ao sincronizar item: ' + error);
      
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Obtém planilha alvo pelo tipo de formulário
   */
  function getTargetSheet(formType) {
    var sheetMapping = {
      'phytoplankton_sampling': 'AmostragemFitoplancton',
      'zooplankton_sampling': 'AmostragemZooplancton',
      'physicochemical_analysis': 'AnalisesFisicoQuimicas',
      'general_observation': 'ObservacoesGerais',
      'ichthyofauna_sampling': 'RegistrosIctiofauna',
      'macrophytes_assessment': 'MacrofitasAquaticas',
      'limnology_measurement': 'MonitoramentoLimnologico',
      'benthic_sampling': 'AmostragemBentonica',
      'waypoint': 'Waypoints'  // Added for Prompt 29/30
    };
    
    var sheetName = sheetMapping[formType];
    if (!sheetName) return null;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return ss.getSheetByName(sheetName);
  }
  
  /**
   * Verifica conflitos antes de salvar
   */
  function checkForConflicts(sheet, data, metadata) {
    try {
      // Verifica se já existe registro com mesmo ID
      if (data.id) {
        var allData = sheet.getDataRange().getValues();
        var headers = allData[0];
        var idIndex = headers.indexOf('id');
        
        if (idIndex !== -1) {
          for (var i = 1; i < allData.length; i++) {
            if (allData[i][idIndex] === data.id) {
              // Verifica timestamp para resolver conflito
              var timestampIndex = headers.indexOf('timestamp');
              if (timestampIndex !== -1) {
                var existingTimestamp = new Date(allData[i][timestampIndex]);
                var newTimestamp = new Date(data.timestamp);
                
                if (existingTimestamp >= newTimestamp) {
                  return {
                    hasConflict: true,
                    message: 'Registro mais recente já existe no servidor'
                  };
                }
              }
              
              // Se chegou aqui, pode sobrescrever (novo é mais recente)
              return {
                hasConflict: false,
                canOverwrite: true,
                rowIndex: i + 1
              };
            }
          }
        }
      }
      
      return { hasConflict: false };
      
    } catch (error) {
      Logger.log('Erro em checkForConflicts: ' + error);
      return { hasConflict: false };
    }
  }
  
  /**
   * Salva dados na planilha alvo
   */
  function saveToTargetSheet(sheet, data, metadata) {
    try {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var values = [];
      
      // Monta array de valores na ordem dos headers
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        values.push(data[header] !== undefined ? data[header] : '');
      }
      
      sheet.appendRow(values);
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Obtém status da fila
   */
  function getSyncQueueStatus() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        return {
          success: true,
          total: 0,
          pending: 0,
          syncing: 0,
          success: 0,
          failed: 0,
          conflict: 0
        };
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return {
          success: true,
          total: 0,
          pending: 0,
          syncing: 0,
          successCount: 0,
          failed: 0,
          conflict: 0
        };
      }
      
      var status = {
        total: data.length - 1,
        pending: 0,
        syncing: 0,
        successCount: 0,
        failed: 0,
        conflict: 0
      };
      
      var statusIndex = 5; // Coluna Status
      
      for (var i = 1; i < data.length; i++) {
        var itemStatus = data[i][statusIndex];
        
        switch (itemStatus) {
          case SYNC_STATUS.PENDING:
            status.pending++;
            break;
          case SYNC_STATUS.SYNCING:
            status.syncing++;
            break;
          case SYNC_STATUS.SUCCESS:
            status.successCount++;
            break;
          case SYNC_STATUS.FAILED:
            status.failed++;
            break;
          case SYNC_STATUS.CONFLICT:
            status.conflict++;
            break;
        }
      }
      
      return {
        success: true,
        ...status
      };
      
    } catch (error) {
      Logger.log('❌ Erro em getSyncQueueStatus: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Limpa itens sincronizados da fila
   */
  function clearSyncedItems() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        return { success: true, removed: 0 };
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, removed: 0 };
      }
      
      var statusIndex = 5;
      var rowsToDelete = [];
      
      // Identifica linhas a deletar (de baixo para cima)
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][statusIndex] === SYNC_STATUS.SUCCESS) {
          rowsToDelete.push(i + 1);
        }
      }
      
      // Deleta as linhas
      rowsToDelete.forEach(function(rowIndex) {
        sheet.deleteRow(rowIndex);
      });
      
      Logger.log('✅ ' + rowsToDelete.length + ' itens sincronizados removidos da fila');
      
      return {
        success: true,
        removed: rowsToDelete.length
      };
      
    } catch (error) {
      Logger.log('❌ Erro em clearSyncedItems: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Reprocessa itens com falha
   */
  function retryFailedItems() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        return { success: true, retried: 0 };
      }
      
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, retried: 0 };
      }
      
      var statusIndex = 5;
      var retryCountIndex = 6;
      var retried = 0;
      
      // Reset status e retry count para itens com falha
      for (var i = 1; i < data.length; i++) {
        if (data[i][statusIndex] === SYNC_STATUS.FAILED) {
          sheet.getRange(i + 1, statusIndex + 1).setValue(SYNC_STATUS.PENDING);
          sheet.getRange(i + 1, retryCountIndex + 1).setValue(0);
          retried++;
        }
      }
      
      Logger.log('✅ ' + retried + ' itens marcados para reprocessamento');
      
      return {
        success: true,
        retried: retried
      };
      
    } catch (error) {
      Logger.log('❌ Erro em retryFailedItems: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  // API Pública
  return {
    addToSyncQueue: addToSyncQueue,
    processSyncQueue: processSyncQueue,
    getSyncQueueStatus: getSyncQueueStatus,
    clearSyncedItems: clearSyncedItems,
    retryFailedItems: retryFailedItems
  };
})();

/**
 * Funções de API expostas
 */
function apiAddToSyncQueue(formType, data, metadata) {
  return OfflineService.addToSyncQueue(formType, data, metadata);
}

function apiProcessSyncQueue() {
  return OfflineService.processSyncQueue();
}

function apiGetSyncQueueStatus() {
  return OfflineService.getSyncQueueStatus();
}

function apiClearSyncedItems() {
  return OfflineService.clearSyncedItems();
}

function apiRetryFailedItems() {
  return OfflineService.retryFailedItems();
}

/**
 * Trigger automático de sincronização (configurar manualmente)
 */
function autoSyncQueue() {
  OfflineService.processSyncQueue();
}
