/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY EXPORT SERVICE - Sistema de Exportação e Relatórios
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 8/13: Exportação e Relatórios Científicos
 * 
 * Serviço para exportação de dados em múltiplos formatos e geração
 * de relatórios científicos padronizados.
 * 
 * Formatos suportados: CSV, JSON, PDF (relatório)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const EXPORT_CONFIG = {
  FOLDER_NAME: 'Reserva_Araras_Exports',
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd_HH-mm',
  CSV_DELIMITER: ';',
  ENCODING: 'UTF-8'
};

const LIMNOLOGY_MODULES = {
  physicochemical: { sheet: 'QualidadeAgua', label: 'Físico-Químico', icon: '💧' },
  phytoplankton: { sheet: 'Fitoplancton_RA', label: 'Fitoplâncton', icon: '🌿' },
  zooplankton: { sheet: 'Zooplancton_RA', label: 'Zooplâncton', icon: '🦐' },
  macrophytes: { sheet: 'Macrofitas_RA', label: 'Macrófitas', icon: '🌱' },
  benthic: { sheet: 'Bentos_RA', label: 'Bentos', icon: '🐚' },
  ichthyofauna: { sheet: 'Ictiofauna_RA', label: 'Ictiofauna', icon: '🐟' }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAÇÃO CSV
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta módulo específico para CSV
 * @param {string} moduleKey - Chave do módulo
 * @param {Object} options - Opções de exportação
 * @returns {Object} - URL do arquivo e metadados
 */
function exportModuleToCSV(moduleKey, options) {
  options = options || {};
  
  try {
    var module = LIMNOLOGY_MODULES[moduleKey];
    if (!module) {
      return { success: false, error: 'Módulo não encontrado: ' + moduleKey };
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module.sheet);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'Sem dados para exportar' };
    }
    
    var data = sheet.getDataRange().getValues();
    
    // Aplica filtros se especificados
    if (options.startDate || options.endDate) {
      data = filterByDateRange(data, options.startDate, options.endDate);
    }
    
    // Converte para CSV
    var csv = convertToCSV(data, EXPORT_CONFIG.CSV_DELIMITER);
    
    // Salva arquivo
    var filename = module.sheet + '_' + getTimestamp() + '.csv';
    var file = saveToExportFolder(filename, csv, 'text/csv');
    
    return {
      success: true,
      filename: filename,
      url: file.getUrl(),
      records: data.length - 1,
      module: module.label
    };
    
  } catch (error) {
    Logger.log('Erro em exportModuleToCSV: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Exporta todos os módulos limnológicos para CSV (ZIP)
 * @param {Object} options - Opções de exportação
 * @returns {Object} - URLs dos arquivos
 */
function exportAllLimnologyToCSV(options) {
  options = options || {};
  var results = { success: true, files: [], errors: [] };
  
  Object.keys(LIMNOLOGY_MODULES).forEach(function(key) {
    var result = exportModuleToCSV(key, options);
    if (result.success) {
      results.files.push(result);
    } else {
      results.errors.push({ module: key, error: result.error });
    }
  });
  
  results.success = results.errors.length === 0;
  results.totalRecords = results.files.reduce(function(sum, f) { return sum + f.records; }, 0);
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAÇÃO JSON
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exporta módulo para JSON
 * @param {string} moduleKey - Chave do módulo
 * @param {Object} options - Opções
 * @returns {Object} - Resultado
 */
function exportModuleToJSON(moduleKey, options) {
  options = options || {};
  
  try {
    var module = LIMNOLOGY_MODULES[moduleKey];
    if (!module) {
      return { success: false, error: 'Módulo não encontrado' };
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module.sheet);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'Sem dados' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        var value = data[i][j];
        // Converte datas para ISO string
        if (value instanceof Date) {
          value = value.toISOString();
        }
        record[headers[j]] = value;
      }
      records.push(record);
    }
    
    var jsonData = {
      metadata: {
        module: module.label,
        sheet: module.sheet,
        exportDate: new Date().toISOString(),
        recordCount: records.length,
        source: 'Reserva Araras - Sistema de Monitoramento Limnológico'
      },
      data: records
    };
    
    var filename = module.sheet + '_' + getTimestamp() + '.json';
    var file = saveToExportFolder(filename, JSON.stringify(jsonData, null, 2), 'application/json');
    
    return {
      success: true,
      filename: filename,
      url: file.getUrl(),
      records: records.length
    };
    
  } catch (error) {
    Logger.log('Erro em exportModuleToJSON: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Exporta dados consolidados para JSON (todos os módulos)
 */
function exportConsolidatedJSON() {
  var consolidated = {
    metadata: {
      exportDate: new Date().toISOString(),
      source: 'Reserva Araras',
      version: '1.0'
    },
    modules: {}
  };
  
  Object.keys(LIMNOLOGY_MODULES).forEach(function(key) {
    var module = LIMNOLOGY_MODULES[key];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module.sheet);
    
    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var records = [];
      
      for (var i = 1; i < data.length; i++) {
        var record = {};
        for (var j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j] instanceof Date ? data[i][j].toISOString() : data[i][j];
        }
        records.push(record);
      }
      
      consolidated.modules[key] = {
        label: module.label,
        count: records.length,
        data: records
      };
    }
  });
  
  var filename = 'Limnologia_Consolidado_' + getTimestamp() + '.json';
  var file = saveToExportFolder(filename, JSON.stringify(consolidated, null, 2), 'application/json');
  
  return { success: true, filename: filename, url: file.getUrl() };
}

// ═══════════════════════════════════════════════════════════════════════════
// GERAÇÃO DE RELATÓRIO CIENTÍFICO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera relatório científico em formato texto/HTML
 * @param {Object} options - Opções do relatório
 * @returns {Object} - Relatório gerado
 */
function generateScientificReport(options) {
  options = options || {};
  
  try {
    var report = {
      title: 'Relatório de Monitoramento Limnológico',
      subtitle: 'Reserva Araras - ' + Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'MMMM yyyy'),
      generatedAt: new Date().toISOString(),
      sections: []
    };
    
    // 1. Resumo Executivo
    report.sections.push(generateExecutiveSummary());
    
    // 2. Qualidade da Água
    report.sections.push(generateWaterQualitySection());
    
    // 3. Comunidades Biológicas
    report.sections.push(generateBiotaSection());
    
    // 4. Índices e Indicadores
    report.sections.push(generateIndicesSection());
    
    // 5. Alertas e Recomendações
    report.sections.push(generateRecommendationsSection());
    
    // Gera HTML do relatório
    var html = renderReportHTML(report);
    
    // Salva como arquivo
    var filename = 'Relatorio_Limnologico_' + getTimestamp() + '.html';
    var file = saveToExportFolder(filename, html, 'text/html');
    
    return {
      success: true,
      filename: filename,
      url: file.getUrl(),
      report: report
    };
    
  } catch (error) {
    Logger.log('Erro em generateScientificReport: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Gera seção de resumo executivo
 */
function generateExecutiveSummary() {
  var stats = getCollectionStats();
  var quality = calculateWaterQualityIndex();
  
  return {
    title: '1. Resumo Executivo',
    content: [
      { type: 'paragraph', text: 'Este relatório apresenta os resultados do monitoramento limnológico realizado na Reserva Araras.' },
      { type: 'stats', data: [
        { label: 'Total de Coletas', value: stats.totalColetas },
        { label: 'Pontos Monitorados', value: stats.totalPontos },
        { label: 'Espécies Registradas', value: stats.totalEspecies },
        { label: 'Índice de Qualidade', value: quality.score + ' (' + quality.label + ')' }
      ]}
    ]
  };
}

/**
 * Gera seção de qualidade da água
 */
function generateWaterQualitySection() {
  var wq = getLatestWaterQuality();
  var limits = WATER_QUALITY_LIMITS ? WATER_QUALITY_LIMITS.CONAMA_357 : {};
  
  var params = [];
  if (wq.temperatura) params.push({ param: 'Temperatura', value: wq.temperatura, unit: '°C', status: 'ok' });
  if (wq.ph) {
    var phStatus = (wq.ph >= 6 && wq.ph <= 9) ? 'ok' : 'warning';
    params.push({ param: 'pH', value: wq.ph, unit: '', status: phStatus, ref: '6-9 (CONAMA)' });
  }
  if (wq.oxigenio_dissolvido) {
    var odStatus = wq.oxigenio_dissolvido >= 5 ? 'ok' : 'critical';
    params.push({ param: 'Oxigênio Dissolvido', value: wq.oxigenio_dissolvido, unit: 'mg/L', status: odStatus, ref: '≥5 (CONAMA)' });
  }
  if (wq.condutividade) params.push({ param: 'Condutividade', value: wq.condutividade, unit: 'µS/cm', status: 'ok' });
  if (wq.turbidez) {
    var turbStatus = wq.turbidez <= 100 ? 'ok' : 'warning';
    params.push({ param: 'Turbidez', value: wq.turbidez, unit: 'NTU', status: turbStatus, ref: '≤100 (CONAMA)' });
  }
  
  return {
    title: '2. Qualidade da Água',
    content: [
      { type: 'paragraph', text: 'Parâmetros físico-químicos da última coleta (' + (wq.data || 'data não informada') + '):' },
      { type: 'table', headers: ['Parâmetro', 'Valor', 'Unidade', 'Referência', 'Status'], rows: params.map(function(p) {
        return [p.param, p.value, p.unit, p.ref || '-', p.status === 'ok' ? '✓' : '⚠'];
      })}
    ]
  };
}

/**
 * Gera seção de comunidades biológicas
 */
function generateBiotaSection() {
  var counts = getBiotaCounts();
  
  return {
    title: '3. Comunidades Biológicas',
    content: [
      { type: 'paragraph', text: 'Registros por grupo taxonômico:' },
      { type: 'list', items: [
        'Fitoplâncton: ' + counts.fitoplancton + ' registros',
        'Zooplâncton: ' + counts.zooplancton + ' registros',
        'Macrófitas: ' + counts.macrofitas + ' registros',
        'Macroinvertebrados bentônicos: ' + counts.bentos + ' registros',
        'Ictiofauna: ' + counts.ictiofauna + ' registros'
      ]}
    ]
  };
}

/**
 * Gera seção de índices
 */
function generateIndicesSection() {
  var indices = getBioticIndices();
  
  var bmwpClass = 'Não avaliado';
  if (indices.bmwp) {
    if (indices.bmwp > 100) bmwpClass = 'Excelente';
    else if (indices.bmwp > 60) bmwpClass = 'Bom';
    else if (indices.bmwp > 35) bmwpClass = 'Aceitável';
    else if (indices.bmwp > 15) bmwpClass = 'Duvidoso';
    else bmwpClass = 'Crítico';
  }
  
  return {
    title: '4. Índices Bióticos',
    content: [
      { type: 'stats', data: [
        { label: 'Índice de Shannon (H\')', value: indices.shannon || '--' },
        { label: 'BMWP', value: (indices.bmwp || '--') + ' (' + bmwpClass + ')' },
        { label: 'Riqueza de Espécies', value: indices.riqueza || '--' }
      ]}
    ]
  };
}

/**
 * Gera seção de recomendações
 */
function generateRecommendationsSection() {
  var alerts = generateAlerts();
  var recommendations = [];
  
  if (alerts.length === 0) {
    recommendations.push('Todos os parâmetros dentro dos limites aceitáveis.');
    recommendations.push('Manter frequência de monitoramento atual.');
  } else {
    alerts.forEach(function(a) {
      if (a.severity === 'critical') {
        recommendations.push('URGENTE: ' + a.title + ' - ' + a.description);
      } else if (a.severity === 'warning') {
        recommendations.push('ATENÇÃO: ' + a.title + ' - ' + a.description);
      }
    });
  }
  
  recommendations.push('Próxima coleta recomendada: ' + getNextCollectionDate());
  
  return {
    title: '5. Alertas e Recomendações',
    content: [
      { type: 'list', items: recommendations }
    ]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZAÇÃO HTML DO RELATÓRIO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Renderiza relatório em HTML
 */
function renderReportHTML(report) {
  var html = '<!DOCTYPE html><html lang="pt-BR"><head>';
  html += '<meta charset="UTF-8">';
  html += '<title>' + report.title + '</title>';
  html += '<style>';
  html += 'body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }';
  html += 'h1 { color: #00796B; border-bottom: 3px solid #00796B; padding-bottom: 10px; }';
  html += 'h2 { color: #00897B; margin-top: 30px; }';
  html += '.subtitle { color: #666; font-size: 1.2em; margin-bottom: 20px; }';
  html += '.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }';
  html += '.stat-box { background: #E0F2F1; padding: 15px; border-radius: 8px; text-align: center; }';
  html += '.stat-value { font-size: 2em; font-weight: bold; color: #00796B; }';
  html += '.stat-label { color: #666; }';
  html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
  html += 'th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }';
  html += 'th { background: #00796B; color: white; }';
  html += 'tr:nth-child(even) { background: #f9f9f9; }';
  html += 'ul { margin: 15px 0; }';
  html += 'li { margin: 8px 0; }';
  html += '.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }';
  html += '@media print { body { max-width: 100%; } }';
  html += '</style></head><body>';
  
  // Cabeçalho
  html += '<h1>🌊 ' + report.title + '</h1>';
  html += '<p class="subtitle">' + report.subtitle + '</p>';
  
  // Seções
  report.sections.forEach(function(section) {
    html += '<h2>' + section.title + '</h2>';
    
    section.content.forEach(function(item) {
      if (item.type === 'paragraph') {
        html += '<p>' + item.text + '</p>';
      } else if (item.type === 'stats') {
        html += '<div class="stats-grid">';
        item.data.forEach(function(stat) {
          html += '<div class="stat-box">';
          html += '<div class="stat-value">' + stat.value + '</div>';
          html += '<div class="stat-label">' + stat.label + '</div>';
          html += '</div>';
        });
        html += '</div>';
      } else if (item.type === 'table') {
        html += '<table><thead><tr>';
        item.headers.forEach(function(h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        item.rows.forEach(function(row) {
          html += '<tr>';
          row.forEach(function(cell) { html += '<td>' + cell + '</td>'; });
          html += '</tr>';
        });
        html += '</tbody></table>';
      } else if (item.type === 'list') {
        html += '<ul>';
        item.items.forEach(function(li) { html += '<li>' + li + '</li>'; });
        html += '</ul>';
      }
    });
  });
  
  // Rodapé
  html += '<div class="footer">';
  html += '<p>Relatório gerado automaticamente em ' + Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm') + '</p>';
  html += '<p>Sistema de Monitoramento Limnológico - Reserva Araras</p>';
  html += '</div>';
  
  html += '</body></html>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Converte array 2D para CSV
 */
function convertToCSV(data, delimiter) {
  delimiter = delimiter || ';';
  return data.map(function(row) {
    return row.map(function(cell) {
      if (cell instanceof Date) {
        return Utilities.formatDate(cell, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
      }
      var str = String(cell);
      if (str.indexOf(delimiter) !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(delimiter);
  }).join('\n');
}

/**
 * Filtra dados por intervalo de datas
 */
function filterByDateRange(data, startDate, endDate) {
  if (!startDate && !endDate) return data;
  
  var headers = data[0];
  var dateIdx = headers.indexOf('data');
  if (dateIdx === -1) return data;
  
  var start = startDate ? new Date(startDate) : new Date(0);
  var end = endDate ? new Date(endDate) : new Date();
  
  var filtered = [headers];
  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][dateIdx];
    if (rowDate instanceof Date && rowDate >= start && rowDate <= end) {
      filtered.push(data[i]);
    }
  }
  
  return filtered;
}

/**
 * Salva arquivo na pasta de exportação
 */
function saveToExportFolder(filename, content, mimeType) {
  var folder = getOrCreateExportFolder();
  var blob = Utilities.newBlob(content, mimeType, filename);
  return folder.createFile(blob);
}

/**
 * Obtém ou cria pasta de exportação
 */
function getOrCreateExportFolder() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var parentFolder = DriveApp.getFileById(ss.getId()).getParents().next();
  
  var folders = parentFolder.getFoldersByName(EXPORT_CONFIG.FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return parentFolder.createFolder(EXPORT_CONFIG.FOLDER_NAME);
}

/**
 * Gera timestamp para nomes de arquivo
 */
function getTimestamp() {
  return Utilities.formatDate(new Date(), 'America/Sao_Paulo', EXPORT_CONFIG.DATETIME_FORMAT);
}

/**
 * Calcula próxima data de coleta recomendada
 */
function getNextCollectionDate() {
  var recent = getRecentCollections();
  if (recent.length === 0) {
    return 'Imediatamente';
  }
  
  // Recomenda coleta a cada 15 dias
  var nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 15);
  return Utilities.formatDate(nextDate, 'America/Sao_Paulo', 'dd/MM/yyyy');
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE DE MENU
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Abre interface de exportação
 */
function openExportInterface() {
  var html = HtmlService.createTemplateFromFile('LimnologyExportInterface')
    .evaluate()
    .setTitle('Exportar Dados')
    .setWidth(400)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Menu: Exportar CSV
 */
function menuExportCSV() {
  var result = exportAllLimnologyToCSV();
  var ui = SpreadsheetApp.getUi();
  
  if (result.success) {
    ui.alert('✓ Exportação Concluída', 
      result.files.length + ' arquivos exportados\n' + 
      result.totalRecords + ' registros totais\n\n' +
      'Arquivos salvos na pasta: ' + EXPORT_CONFIG.FOLDER_NAME,
      ui.ButtonSet.OK);
  } else {
    ui.alert('⚠ Exportação com Erros', 
      'Alguns módulos não foram exportados.\nVerifique o log para detalhes.',
      ui.ButtonSet.OK);
  }
}

/**
 * Menu: Gerar Relatório
 */
function menuGenerateReport() {
  var result = generateScientificReport();
  var ui = SpreadsheetApp.getUi();
  
  if (result.success) {
    var response = ui.alert('✓ Relatório Gerado', 
      'Arquivo: ' + result.filename + '\n\nDeseja abrir o relatório?',
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      var html = HtmlService.createHtmlOutput('<script>window.open("' + result.url + '");google.script.host.close();</script>');
      ui.showModalDialog(html, 'Abrindo...');
    }
  } else {
    ui.alert('✗ Erro', 'Não foi possível gerar o relatório: ' + result.error, ui.ButtonSet.OK);
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES PARA INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém contagem de registros por módulo
 * @returns {Object} Contagens por módulo
 */
function getModuleCounts() {
  var counts = {};
  
  Object.keys(LIMNOLOGY_MODULES).forEach(function(key) {
    var module = LIMNOLOGY_MODULES[key];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module.sheet);
    counts[key] = sheet && sheet.getLastRow() > 1 ? sheet.getLastRow() - 1 : 0;
  });
  
  return counts;
}

/**
 * Adiciona itens ao menu
 */
function addExportMenuItems() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('📥 Exportar')
    .addItem('Abrir Interface de Exportação', 'openExportInterface')
    .addSeparator()
    .addItem('Exportar Todos (CSV)', 'menuExportCSV')
    .addItem('Exportar Consolidado (JSON)', 'menuExportJSON')
    .addSeparator()
    .addItem('Gerar Relatório Científico', 'menuGenerateReport');
  
  return menu;
}

/**
 * Menu: Exportar JSON consolidado
 */
function menuExportJSON() {
  var result = exportConsolidatedJSON();
  var ui = SpreadsheetApp.getUi();
  
  if (result.success) {
    ui.alert('✓ Exportação JSON Concluída', 
      'Arquivo: ' + result.filename + '\n\nSalvo na pasta: ' + EXPORT_CONFIG.FOLDER_NAME,
      ui.ButtonSet.OK);
  } else {
    ui.alert('✗ Erro', result.error, ui.ButtonSet.OK);
  }
}
