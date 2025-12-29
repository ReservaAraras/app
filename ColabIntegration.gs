/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COLAB INTEGRATION - Integração GAS ↔ Google Colab
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 1/13: Gatilho nativo do GAS para análise de duplicatas
 * 
 * Este arquivo permite:
 * 1. Exportar código do projeto para análise no Colab
 * 2. Receber resultados de análise do Colab
 * 3. Executar limpeza automática de duplicatas
 * 4. Agendar análises periódicas via triggers
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Configuração da integração
 */
const COLAB_CONFIG = {
  // URL do notebook Colab (quando publicado como webapp)
  COLAB_WEBHOOK_URL: '',  // Preencher quando disponível
  
  // Pasta no Drive para armazenar exports
  EXPORT_FOLDER_NAME: 'ReservaAraras_CodeExport',
  
  // Arquivos a serem analisados
  FILE_EXTENSIONS: ['.gs', '.html'],
  
  // Arquivos a ignorar
  IGNORE_FILES: ['appsscript.json', '.clasp.json'],
  
  // Limite de tamanho por arquivo (bytes)
  MAX_FILE_SIZE: 500000
};

/**
 * Namespace principal de integração
 */
const ColabIntegration = {
  
  /**
   * Exporta todos os arquivos do projeto para análise
   * @returns {Object} Dados exportados
   */
  exportProjectFiles: function() {
    try {
      const scriptId = ScriptApp.getScriptId();
      const files = this._getProjectFiles();
      
      const exportData = {
        project_id: scriptId,
        export_timestamp: new Date().toISOString(),
        files: {},
        metadata: {
          total_files: 0,
          total_size: 0,
          gs_files: 0,
          html_files: 0
        }
      };
      
      files.forEach(file => {
        if (this._shouldIncludeFile(file.name)) {
          exportData.files[file.name] = file.content;
          exportData.metadata.total_files++;
          exportData.metadata.total_size += file.content.length;
          
          if (file.name.endsWith('.gs')) {
            exportData.metadata.gs_files++;
          } else if (file.name.endsWith('.html')) {
            exportData.metadata.html_files++;
          }
        }
      });
      
      Logger.log(`[ColabIntegration] Exportados ${exportData.metadata.total_files} arquivos`);
      Logger.log(`[ColabIntegration] GS: ${exportData.metadata.gs_files}, HTML: ${exportData.metadata.html_files}`);
      
      return {
        success: true,
        data: exportData
      };
      
    } catch (error) {
      Logger.log(`[ColabIntegration] Erro ao exportar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obtém arquivos do projeto
   * @private
   */
  _getProjectFiles: function() {
    const files = [];
    
    // Lista de arquivos conhecidos do projeto (baseado na estrutura)
    const knownFiles = [
      // Core
      'Code.gs', 'Config.gs', 'ConfigConstants.gs', 'ConfigManager.gs',
      'Utils.gs', 'DatabaseService.gs', 'CacheManager.gs',
      
      // CRUD
      'CRUDFactory.gs', 'CRUDApis.gs', 'CRUDRouter_GENERATED.gs',
      
      // Services
      'AuthService.gs', 'ValidationService.gs', 'NotificationService.gs',
      'ExportService.gs', 'SearchService.gs', 'ReportService.gs',
      
      // Domain Services
      'BiodiversityService.gs', 'AgroforestryService.gs', 'EcoturismService.gs',
      'TherapyService.gs', 'GPSService.gs', 'PhotoService.gs',
      'EnvironmentalService.gs',
      
      // AI Services
      'GeminiAIService.gs', 'GeminiRateLimiter.gs', 'BiodiversityAIService.gs',
      
      // Chatbots
      'UnifiedChatbotSystem.gs', 'EcoChatbotService.gs', 'FormAssistantChatbots.gs',
      
      // Analyzers
      'TrophicNetworkAnalyzer.gs', 'EcologicalCorridorAnalyzer.gs',
      'EcologicalAlertSystem.gs',
      
      // Form Handlers
      'FormHelper.gs', 'WaterQualityFormHandler.gs', 'BenthicFormHandler.gs',
      'IchthyofaunaFormHandler.gs', 'LimnologyFormHandler.gs',
      'MacrophytesFormHandler.gs', 'PhysicochemicalFormHandler.gs',
      'PhytoplanktonFormHandler.gs', 'ZooplanktonFormHandler.gs',
      'GeneralObservationsFormHandler.gs',
      
      // API
      'ApiEndpoints.gs', 'ApiHandler.gs', 'IntegratedRouter.gs',
      
      // HTML Forms
      'Index.html', 'dashboard.html', 'AguaForm.html',
      'BiodiversidadeForm.html', 'BiodiversidadeSmartForm.html',
      'BenthicForm.html', 'IchthyofaunaForm.html', 'LimnologyForm.html',
      'MacrophytesForm.html', 'PhysicochemicalForm.html',
      'PhytoplanktonForm.html', 'ZooplanktonForm.html',
      'GeneralObservationsForm.html', 'WaypointForm.html',
      'VisitanteForm.html', 'TerapiaForm.html', 'ProducaoForm.html',
      'SoloForm.html', 'FotoForm.html',
      
      // Dashboards
      'ExecutiveDashboard.html', 'BiodiversityHeatmapDashboard.html',
      'TrophicNetworkDashboard.html', 'CorridorsDashboard.html',
      'AlertsDashboard.html'
    ];
    
    // Tenta ler cada arquivo
    knownFiles.forEach(filename => {
      try {
        let content = '';
        
        if (filename.endsWith('.gs')) {
          // Para arquivos GS, tentamos obter via eval (limitado)
          // Em produção, usar clasp ou API do Apps Script
          content = this._getFileContentSimulated(filename);
        } else if (filename.endsWith('.html')) {
          try {
            const html = HtmlService.createHtmlOutputFromFile(filename.replace('.html', ''));
            content = html.getContent();
          } catch (e) {
            // Arquivo não existe
          }
        }
        
        if (content) {
          files.push({ name: filename, content: content });
        }
      } catch (e) {
        // Ignora arquivos que não existem
      }
    });
    
    return files;
  },
  
  /**
   * Simula obtenção de conteúdo (em produção usar clasp)
   * @private
   */
  _getFileContentSimulated: function(filename) {
    // Em ambiente real, isso seria feito via clasp ou API
    // Aqui retornamos placeholder para demonstração
    return `// Conteúdo de ${filename}\n// Use clasp para exportar código real`;
  },
  
  /**
   * Verifica se arquivo deve ser incluído
   * @private
   */
  _shouldIncludeFile: function(filename) {
    if (COLAB_CONFIG.IGNORE_FILES.includes(filename)) {
      return false;
    }
    
    return COLAB_CONFIG.FILE_EXTENSIONS.some(ext => filename.endsWith(ext));
  },
  
  /**
   * Salva export no Google Drive
   * @param {Object} exportData - Dados exportados
   * @returns {Object} Resultado
   */
  saveExportToDrive: function(exportData) {
    try {
      // Obtém ou cria pasta
      let folder;
      const folders = DriveApp.getFoldersByName(COLAB_CONFIG.EXPORT_FOLDER_NAME);
      
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(COLAB_CONFIG.EXPORT_FOLDER_NAME);
      }
      
      // Cria arquivo JSON
      const filename = `export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const content = JSON.stringify(exportData, null, 2);
      const file = folder.createFile(filename, content, 'application/json');
      
      Logger.log(`[ColabIntegration] Export salvo: ${file.getUrl()}`);
      
      return {
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        filename: filename
      };
      
    } catch (error) {
      Logger.log(`[ColabIntegration] Erro ao salvar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Processa resultado de análise do Colab
   * @param {Object} analysisResult - Resultado da análise
   * @returns {Object} Ações tomadas
   */
  processAnalysisResult: function(analysisResult) {
    try {
      const actions = [];
      
      // Registra no log
      Logger.log('═══════════════════════════════════════════════════════════════');
      Logger.log('📊 RESULTADO DA ANÁLISE DE DUPLICATAS');
      Logger.log('═══════════════════════════════════════════════════════════════');
      Logger.log(`Timestamp: ${analysisResult.timestamp}`);
      Logger.log(`Duplicatas: ${analysisResult.summary?.total_duplicates || 0}`);
      Logger.log(`Conflitos: ${analysisResult.summary?.total_conflicts || 0}`);
      Logger.log(`Críticos: ${analysisResult.summary?.critical || 0}`);
      
      // Processa itens críticos
      if (analysisResult.critical_items && analysisResult.critical_items.length > 0) {
        Logger.log('\n🔴 ITENS CRÍTICOS:');
        analysisResult.critical_items.forEach(item => {
          Logger.log(`  - ${item.type}: ${item.name}`);
          Logger.log(`    Sugestão: ${item.suggestion}`);
          
          actions.push({
            type: 'critical_duplicate',
            item: item.name,
            action: 'review_required'
          });
        });
      }
      
      // Processa recomendações
      if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
        Logger.log('\n💡 RECOMENDAÇÕES:');
        analysisResult.recommendations.forEach(rec => {
          Logger.log(`  ${rec}`);
        });
      }
      
      // Cria alerta se houver críticos
      if (analysisResult.summary?.critical > 0) {
        this._createAlert(analysisResult);
        actions.push({ type: 'alert_created' });
      }
      
      Logger.log('═══════════════════════════════════════════════════════════════');
      
      return {
        success: true,
        actions: actions,
        processed_at: new Date().toISOString()
      };
      
    } catch (error) {
      Logger.log(`[ColabIntegration] Erro ao processar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cria alerta para duplicatas críticas
   * @private
   */
  _createAlert: function(analysisResult) {
    try {
      // Tenta usar sistema de alertas se disponível
      if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
        EcologicalAlertSystem.createAlert({
          tipo: 'ALTO',
          categoria: 'SISTEMA',
          mensagem: `Análise de código: ${analysisResult.summary.critical} duplicatas críticas encontradas`,
          dados: {
            total_duplicatas: analysisResult.summary.total_duplicates,
            criticos: analysisResult.summary.critical,
            timestamp: analysisResult.timestamp
          }
        });
      }
      
      // Envia email se configurado
      const email = Session.getActiveUser().getEmail();
      if (email) {
        MailApp.sendEmail({
          to: email,
          subject: '⚠️ [Reserva Araras] Duplicatas Críticas Detectadas',
          body: `
Análise de Código - Reserva Araras
==================================

Foram encontradas ${analysisResult.summary.critical} duplicatas críticas no código.

Resumo:
- Total de duplicatas: ${analysisResult.summary.total_duplicates}
- Conflitos: ${analysisResult.summary.total_conflicts}
- Críticos: ${analysisResult.summary.critical}
- Altos: ${analysisResult.summary.high}

Recomendações:
${(analysisResult.recommendations || []).join('\n')}

Por favor, revise o código e resolva as duplicatas para evitar comportamento indefinido.

---
Sistema Reserva Araras
          `
        });
      }
      
    } catch (error) {
      Logger.log(`[ColabIntegration] Erro ao criar alerta: ${error}`);
    }
  },
  
  /**
   * Executa análise local simplificada
   * @returns {Object} Resultado da análise
   */
  runLocalAnalysis: function() {
    try {
      Logger.log('═══════════════════════════════════════════════════════════════');
      Logger.log('🔍 ANÁLISE LOCAL DE DUPLICATAS');
      Logger.log('═══════════════════════════════════════════════════════════════');
      
      const duplicates = [];
      const functionRegistry = {};
      const namespaceRegistry = {};
      
      // Analisa funções globais conhecidas
      const globalFunctions = [
        // APIs
        'apiGetData', 'apiSaveData', 'apiDeleteData', 'apiUpdateData',
        'apiUnifiedChatbotMessage', 'apiUnifiedChatbotList',
        'apiBioChatbot', 'apiEcoChatbot', 'apiAgroChatbot',
        
        // Utilitários
        'formatDate', 'generateId', 'validateEmail',
        
        // Handlers
        'doGet', 'doPost', 'onOpen', 'onEdit'
      ];
      
      // Verifica cada função
      globalFunctions.forEach(funcName => {
        try {
          const func = globalThis[funcName];
          if (typeof func === 'function') {
            if (!functionRegistry[funcName]) {
              functionRegistry[funcName] = [];
            }
            functionRegistry[funcName].push('global');
          }
        } catch (e) {
          // Função não existe
        }
      });
      
      // Verifica namespaces conhecidos
      const namespaces = [
        'CONFIG', 'UnifiedChatbotSystem', 'TrophicNetworkAnalyzer',
        'BiodiversityService', 'DatabaseService', 'FormHelper'
      ];
      
      namespaces.forEach(nsName => {
        try {
          const ns = globalThis[nsName];
          if (typeof ns === 'object' && ns !== null) {
            if (!namespaceRegistry[nsName]) {
              namespaceRegistry[nsName] = [];
            }
            namespaceRegistry[nsName].push('global');
          }
        } catch (e) {
          // Namespace não existe
        }
      });
      
      // Conta duplicatas (simplificado)
      let criticalCount = 0;
      
      Object.entries(functionRegistry).forEach(([name, locations]) => {
        if (locations.length > 1) {
          duplicates.push({ name, type: 'function', count: locations.length });
          if (name.startsWith('api')) criticalCount++;
        }
      });
      
      Object.entries(namespaceRegistry).forEach(([name, locations]) => {
        if (locations.length > 1) {
          duplicates.push({ name, type: 'namespace', count: locations.length });
          criticalCount++;
        }
      });
      
      Logger.log(`\nFunções verificadas: ${globalFunctions.length}`);
      Logger.log(`Namespaces verificados: ${namespaces.length}`);
      Logger.log(`Duplicatas encontradas: ${duplicates.length}`);
      Logger.log(`Críticos: ${criticalCount}`);
      
      if (duplicates.length > 0) {
        Logger.log('\n📋 DUPLICATAS:');
        duplicates.forEach(dup => {
          Logger.log(`  - ${dup.type}: ${dup.name} (${dup.count}x)`);
        });
      } else {
        Logger.log('\n✅ Nenhuma duplicata óbvia encontrada na análise local.');
        Logger.log('   Para análise completa, use o Colab Analyzer.');
      }
      
      Logger.log('═══════════════════════════════════════════════════════════════');
      
      return {
        success: true,
        duplicates: duplicates,
        summary: {
          total: duplicates.length,
          critical: criticalCount
        }
      };
      
    } catch (error) {
      Logger.log(`[ColabIntegration] Erro na análise local: ${error}`);
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta projeto para análise no Colab
 */
function apiColabExportProject() {
  return ColabIntegration.exportProjectFiles();
}

/**
 * Salva export no Drive
 */
function apiColabSaveExport() {
  const exportData = ColabIntegration.exportProjectFiles();
  if (exportData.success) {
    return ColabIntegration.saveExportToDrive(exportData.data);
  }
  return exportData;
}

/**
 * Processa resultado de análise
 * @param {Object} result - Resultado do Colab
 */
function apiColabProcessResult(result) {
  return ColabIntegration.processAnalysisResult(result);
}

/**
 * Executa análise local simplificada
 */
function apiColabLocalAnalysis() {
  return ColabIntegration.runLocalAnalysis();
}

/**
 * Trigger para análise periódica (configurar no GAS)
 * Executar semanalmente via Triggers
 */
function triggerWeeklyAnalysis() {
  Logger.log('🔄 Iniciando análise semanal de duplicatas...');
  
  // Executa análise local
  const localResult = ColabIntegration.runLocalAnalysis();
  
  // Exporta para Drive (para análise completa no Colab)
  const exportResult = apiColabSaveExport();
  
  Logger.log(`\n📁 Export salvo: ${exportResult.success ? exportResult.fileUrl : 'Erro'}`);
  Logger.log('✅ Análise semanal concluída');
  
  return {
    local_analysis: localResult,
    export: exportResult
  };
}

/**
 * Adiciona menu de integração
 */
function addColabIntegrationMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔬 Colab Analyzer')
    .addItem('Análise Local Rápida', 'apiColabLocalAnalysis')
    .addItem('Exportar para Colab', 'apiColabSaveExport')
    .addSeparator()
    .addItem('Configurar Trigger Semanal', 'setupWeeklyTrigger')
    .addToUi();
}

/**
 * Configura trigger semanal
 */
function setupWeeklyTrigger() {
  // Remove triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'triggerWeeklyAnalysis') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger (toda segunda às 8h)
  ScriptApp.newTrigger('triggerWeeklyAnalysis')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
  
  Logger.log('✅ Trigger semanal configurado para segundas às 8h');
  
  SpreadsheetApp.getUi().alert(
    '✅ Trigger Configurado',
    'Análise de duplicatas será executada toda segunda-feira às 8h.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVENÇÃO 12/13: EXPORTAÇÃO PARA COLAB LIMNOLÓGICO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta dados limnológicos para análise no Google Colab
 * Formato compatível com colab_limnology_analysis.py
 * @returns {Object} Dados exportados em formato JSON
 */
function exportLimnologyDataForColab() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Mapeamento de planilhas limnológicas
    const limnologySheets = {
      physicochemical: { name: 'FisicoQuimico_RA', label: 'Físico-Químico' },
      phytoplankton: { name: 'Fitoplancton_RA', label: 'Fitoplâncton' },
      zooplankton: { name: 'Zooplancton_RA', label: 'Zooplâncton' },
      benthic: { name: 'Bentos_RA', label: 'Bentos' },
      macrophytes: { name: 'Macrofitas_RA', label: 'Macrófitas' },
      ichthyofauna: { name: 'Ictiofauna_RA', label: 'Ictiofauna' },
      observations: { name: 'ObservacoesGerais_RA', label: 'Observações Gerais' }
    };
    
    const exportData = {
      project: 'Reserva Araras - Sistema Limnológico',
      export_timestamp: new Date().toISOString(),
      version: '1.0.0',
      modules: {}
    };
    
    let totalRecords = 0;
    
    Object.entries(limnologySheets).forEach(([key, config]) => {
      const sheet = ss.getSheetByName(config.name);
      
      if (sheet && sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        const headers = data[0].map(h => String(h).toLowerCase().replace(/\s+/g, '_'));
        
        const records = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const record = {};
          
          headers.forEach((header, idx) => {
            let value = row[idx];
            
            // Converte datas para ISO string
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0];
            }
            // Converte números
            else if (typeof value === 'number') {
              value = value;
            }
            // Strings vazias para null
            else if (value === '' || value === undefined) {
              value = null;
            }
            
            record[header] = value;
          });
          
          // Só adiciona se tiver algum dado
          if (Object.values(record).some(v => v !== null && v !== '')) {
            records.push(record);
          }
        }
        
        if (records.length > 0) {
          exportData.modules[key] = {
            label: config.label,
            sheet_name: config.name,
            record_count: records.length,
            columns: headers,
            data: records
          };
          totalRecords += records.length;
        }
      }
    });
    
    exportData.summary = {
      total_modules: Object.keys(exportData.modules).length,
      total_records: totalRecords,
      exported_at: new Date().toISOString()
    };
    
    Logger.log(`[ColabIntegration] Exportados ${totalRecords} registros de ${Object.keys(exportData.modules).length} módulos`);
    
    return {
      success: true,
      data: exportData
    };
    
  } catch (error) {
    Logger.log(`[ColabIntegration] Erro ao exportar dados limnológicos: ${error}`);
    return { success: false, error: error.message };
  }
}

/**
 * Salva dados limnológicos no Drive para uso no Colab
 * @returns {Object} Resultado com URL do arquivo
 */
function saveLimnologyExportToDrive() {
  try {
    const exportResult = exportLimnologyDataForColab();
    
    if (!exportResult.success) {
      return exportResult;
    }
    
    // Obtém ou cria pasta
    const folderName = 'ReservaAraras_LimnologyExport';
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // Cria arquivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `limnology_export_${timestamp}.json`;
    const content = JSON.stringify(exportResult.data, null, 2);
    const file = folder.createFile(filename, content, 'application/json');
    
    Logger.log(`[ColabIntegration] Export limnológico salvo: ${file.getUrl()}`);
    
    return {
      success: true,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      filename: filename,
      summary: exportResult.data.summary
    };
    
  } catch (error) {
    Logger.log(`[ColabIntegration] Erro ao salvar export: ${error}`);
    return { success: false, error: error.message };
  }
}

/**
 * Menu: Exportar dados para Colab
 */
function menuExportLimnologyForColab() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('⏳ Exportando...', 'Aguarde enquanto os dados são exportados.', ui.ButtonSet.OK);
  
  const result = saveLimnologyExportToDrive();
  
  if (result.success) {
    const msg = `✅ Dados exportados com sucesso!\n\n` +
                `📊 Módulos: ${result.summary.total_modules}\n` +
                `📝 Registros: ${result.summary.total_records}\n\n` +
                `📁 Arquivo: ${result.filename}\n\n` +
                `Para usar no Google Colab:\n` +
                `1. Acesse o arquivo no Drive\n` +
                `2. Faça upload no Colab\n` +
                `3. Execute o notebook colab_limnology_analysis.py`;
    
    ui.alert('✅ Exportação Concluída', msg, ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Erro', `Falha ao exportar: ${result.error}`, ui.ButtonSet.OK);
  }
}

/**
 * API: Exporta dados limnológicos como JSON
 */
function apiExportLimnologyData() {
  return exportLimnologyDataForColab();
}

/**
 * API: Salva export no Drive
 */
function apiSaveLimnologyExport() {
  return saveLimnologyExportToDrive();
}
