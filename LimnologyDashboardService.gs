/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIMNOLOGY DASHBOARD SERVICE - Backend do Dashboard Limnológico
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 7/13: Dashboard de Monitoramento Integrado
 * 
 * Serviço que fornece dados consolidados para o dashboard limnológico.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const DASHBOARD_CONFIG = {
  CACHE_TTL: 300, // 5 minutos
  RECENT_DAYS: 30,
  MAX_RECENT_COLLECTIONS: 10
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém dados consolidados para o dashboard
 * @returns {Object} Dados do dashboard
 */
function getLimnologyDashboardData() {
  try {
    var cacheKey = 'limnology_dashboard_data';
    var cached = CacheService.getScriptCache().get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    var data = {
      stats: getCollectionStats(),
      quality: calculateWaterQualityIndex(),
      waterQuality: getLatestWaterQuality(),
      recentCollections: getRecentCollections(),
      alerts: generateAlerts(),
      biotaCounts: getBiotaCounts(),
      indices: getBioticIndices(),
      lastUpdate: new Date().toISOString()
    };
    
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(data), DASHBOARD_CONFIG.CACHE_TTL);
    
    return data;
    
  } catch (error) {
    Logger.log('Erro em getLimnologyDashboardData: ' + error);
    return getDefaultDashboardData();
  }
}

/**
 * Estatísticas gerais de coletas
 */
function getCollectionStats() {
  var stats = {
    totalColetas: 0,
    totalPontos: 0,
    totalEspecies: 0
  };
  
  try {
    var sheets = [
      'QualidadeAgua', 'Fitoplancton_RA', 'Zooplancton_RA',
      'Macrofitas_RA', 'Bentos_RA', 'Ictiofauna_RA'
    ];
    
    var locais = {};
    
    sheets.forEach(function(sheetName) {
      var sheet = getSheet(sheetName);
      if (sheet && sheet.getLastRow() > 1) {
        stats.totalColetas += sheet.getLastRow() - 1;
        
        // Conta locais únicos
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var localIdx = headers.indexOf('local');
        
        if (localIdx !== -1) {
          for (var i = 1; i < data.length; i++) {
            if (data[i][localIdx]) {
              locais[data[i][localIdx]] = true;
            }
          }
        }
      }
    });
    
    stats.totalPontos = Object.keys(locais).length;
    
    // Conta espécies de ictiofauna
    var fishSheet = getSheet('Ictiofauna_RA');
    if (fishSheet && fishSheet.getLastRow() > 1) {
      var fishData = fishSheet.getDataRange().getValues();
      var fishHeaders = fishData[0];
      var nomeIdx = fishHeaders.indexOf('nome_popular');
      var especies = {};
      
      for (var j = 1; j < fishData.length; j++) {
        if (fishData[j][nomeIdx]) {
          especies[fishData[j][nomeIdx]] = true;
        }
      }
      stats.totalEspecies = Object.keys(especies).length;
    }
    
  } catch (e) {
    Logger.log('Erro em getCollectionStats: ' + e);
  }
  
  return stats;
}

/**
 * Calcula índice de qualidade da água (IQA simplificado)
 */
function calculateWaterQualityIndex() {
  try {
    var wq = getLatestWaterQuality();
    if (!wq || !wq.ph) {
      return { score: null, class: 'unknown', label: 'Sem dados' };
    }
    
    var score = 100;
    var penalties = 0;
    
    // pH (ideal: 6.5-8.5)
    if (wq.ph) {
      var ph = parseFloat(wq.ph);
      if (ph < 6 || ph > 9) penalties += 20;
      else if (ph < 6.5 || ph > 8.5) penalties += 10;
    }
    
    // OD (ideal: > 6 mg/L)
    if (wq.oxigenio_dissolvido) {
      var od = parseFloat(wq.oxigenio_dissolvido);
      if (od < 4) penalties += 30;
      else if (od < 5) penalties += 20;
      else if (od < 6) penalties += 10;
    }
    
    // Turbidez (ideal: < 40 NTU)
    if (wq.turbidez) {
      var turb = parseFloat(wq.turbidez);
      if (turb > 100) penalties += 20;
      else if (turb > 40) penalties += 10;
    }
    
    score = Math.max(0, score - penalties);
    
    var classification;
    if (score >= 80) classification = { class: 'excellent', label: 'Excelente' };
    else if (score >= 60) classification = { class: 'good', label: 'Bom' };
    else if (score >= 40) classification = { class: 'moderate', label: 'Regular' };
    else if (score >= 20) classification = { class: 'poor', label: 'Ruim' };
    else classification = { class: 'critical', label: 'Crítico' };
    
    return {
      score: score,
      class: classification.class,
      label: classification.label
    };
    
  } catch (e) {
    Logger.log('Erro em calculateWaterQualityIndex: ' + e);
    return { score: null, class: 'unknown', label: 'Erro' };
  }
}

/**
 * Obtém última coleta de qualidade da água
 */
function getLatestWaterQuality() {
  try {
    var sheet = getSheet('QualidadeAgua');
    if (!sheet || sheet.getLastRow() < 2) {
      return {};
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var lastRow = data[data.length - 1];
    
    var result = {};
    var fields = ['data', 'temperatura', 'ph', 'oxigenio_dissolvido', 'condutividade', 'turbidez', 'transparencia'];
    
    fields.forEach(function(field) {
      var idx = headers.indexOf(field);
      if (idx !== -1 && lastRow[idx] !== '') {
        result[field] = lastRow[idx];
      }
    });
    
    // Formata data
    if (result.data instanceof Date) {
      result.data = Utilities.formatDate(result.data, 'America/Sao_Paulo', 'dd/MM/yyyy');
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Erro em getLatestWaterQuality: ' + e);
    return {};
  }
}

/**
 * Obtém coletas recentes
 */
function getRecentCollections() {
  var collections = [];
  
  var sources = [
    { sheet: 'QualidadeAgua', icon: '💧', tipo: 'Físico-Químico' },
    { sheet: 'Fitoplancton_RA', icon: '🌿', tipo: 'Fitoplâncton' },
    { sheet: 'Zooplancton_RA', icon: '🦐', tipo: 'Zooplâncton' },
    { sheet: 'Macrofitas_RA', icon: '🌿', tipo: 'Macrófitas' },
    { sheet: 'Bentos_RA', icon: '🐚', tipo: 'Bentos' },
    { sheet: 'Ictiofauna_RA', icon: '🐟', tipo: 'Ictiofauna' }
  ];
  
  try {
    sources.forEach(function(src) {
      var sheet = getSheet(src.sheet);
      if (sheet && sheet.getLastRow() > 1) {
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var dataIdx = headers.indexOf('data');
        var localIdx = headers.indexOf('local');
        
        if (dataIdx !== -1 && localIdx !== -1) {
          var lastRow = data[data.length - 1];
          var dataValue = lastRow[dataIdx];
          
          if (dataValue instanceof Date) {
            dataValue = Utilities.formatDate(dataValue, 'America/Sao_Paulo', 'dd/MM');
          }
          
          collections.push({
            icon: src.icon,
            tipo: src.tipo,
            local: lastRow[localIdx] || 'Local não informado',
            data: dataValue || '--',
            registros: data.length - 1,
            timestamp: lastRow[dataIdx] instanceof Date ? lastRow[dataIdx].getTime() : 0
          });
        }
      }
    });
    
    // Ordena por data mais recente
    collections.sort(function(a, b) { return b.timestamp - a.timestamp; });
    
  } catch (e) {
    Logger.log('Erro em getRecentCollections: ' + e);
  }
  
  return collections.slice(0, DASHBOARD_CONFIG.MAX_RECENT_COLLECTIONS);
}

/**
 * Gera alertas baseados nos dados
 */
function generateAlerts() {
  var alerts = [];
  
  try {
    // Alerta de qualidade da água
    var wq = getLatestWaterQuality();
    
    if (wq.oxigenio_dissolvido && parseFloat(wq.oxigenio_dissolvido) < 5) {
      alerts.push({
        severity: 'critical',
        icon: '🚨',
        title: 'Oxigênio dissolvido baixo',
        description: 'OD = ' + wq.oxigenio_dissolvido + ' mg/L (mín: 5)',
        time: 'Última coleta'
      });
    }
    
    if (wq.ph) {
      var ph = parseFloat(wq.ph);
      if (ph < 6 || ph > 9) {
        alerts.push({
          severity: 'warning',
          icon: '⚠️',
          title: 'pH fora dos limites',
          description: 'pH = ' + wq.ph + ' (CONAMA: 6-9)',
          time: 'Última coleta'
        });
      }
    }
    
    // Alerta de cobertura de macrófitas
    var macroSheet = getSheet('Macrofitas_RA');
    if (macroSheet && macroSheet.getLastRow() > 1) {
      var macroData = macroSheet.getDataRange().getValues();
      var headers = macroData[0];
      var cobIdx = headers.indexOf('cobertura_percentual');
      var localIdx = headers.indexOf('local');
      
      if (cobIdx !== -1) {
        for (var i = macroData.length - 1; i >= 1 && i > macroData.length - 5; i--) {
          var cob = parseFloat(macroData[i][cobIdx]);
          if (cob > 75) {
            alerts.push({
              severity: 'warning',
              icon: '🌿',
              title: 'Cobertura alta de macrófitas',
              description: (macroData[i][localIdx] || 'Local') + ': ' + cob + '%',
              time: 'Recente'
            });
            break;
          }
        }
      }
    }
    
    // Alerta de coletas pendentes (mais de 15 dias)
    var lastCollection = getRecentCollections()[0];
    if (lastCollection && lastCollection.timestamp) {
      var daysSince = Math.floor((Date.now() - lastCollection.timestamp) / (1000 * 60 * 60 * 24));
      if (daysSince > 15) {
        alerts.push({
          severity: 'info',
          icon: 'ℹ️',
          title: 'Coleta pendente',
          description: 'Última coleta há ' + daysSince + ' dias',
          time: daysSince + 'd'
        });
      }
    }
    
  } catch (e) {
    Logger.log('Erro em generateAlerts: ' + e);
  }
  
  return alerts;
}

/**
 * Conta registros por tipo de biota
 */
function getBiotaCounts() {
  var counts = {
    fitoplancton: 0,
    zooplancton: 0,
    macrofitas: 0,
    bentos: 0,
    ictiofauna: 0
  };
  
  try {
    var mapping = {
      'Fitoplancton_RA': 'fitoplancton',
      'Zooplancton_RA': 'zooplancton',
      'Macrofitas_RA': 'macrofitas',
      'Bentos_RA': 'bentos',
      'Ictiofauna_RA': 'ictiofauna'
    };
    
    Object.keys(mapping).forEach(function(sheetName) {
      var sheet = getSheet(sheetName);
      if (sheet && sheet.getLastRow() > 1) {
        counts[mapping[sheetName]] = sheet.getLastRow() - 1;
      }
    });
    
  } catch (e) {
    Logger.log('Erro em getBiotaCounts: ' + e);
  }
  
  return counts;
}

/**
 * Obtém índices bióticos mais recentes
 */
function getBioticIndices() {
  var indices = {
    shannon: null,
    bmwp: null,
    riqueza: null
  };
  
  try {
    // Shannon do bentos
    var bentosSheet = getSheet('Bentos_RA');
    if (bentosSheet && bentosSheet.getLastRow() > 1) {
      var bentosData = bentosSheet.getDataRange().getValues();
      var headers = bentosData[0];
      var shannonIdx = headers.indexOf('indice_shannon');
      var bmwpIdx = headers.indexOf('indice_bmwp');
      
      // Busca último valor não vazio
      for (var i = bentosData.length - 1; i >= 1; i--) {
        if (!indices.shannon && shannonIdx !== -1 && bentosData[i][shannonIdx]) {
          indices.shannon = parseFloat(bentosData[i][shannonIdx]).toFixed(2);
        }
        if (!indices.bmwp && bmwpIdx !== -1 && bentosData[i][bmwpIdx]) {
          indices.bmwp = parseInt(bentosData[i][bmwpIdx]);
        }
        if (indices.shannon && indices.bmwp) break;
      }
    }
    
    // Riqueza de espécies (ictiofauna)
    var fishSheet = getSheet('Ictiofauna_RA');
    if (fishSheet && fishSheet.getLastRow() > 1) {
      var fishData = fishSheet.getDataRange().getValues();
      var fishHeaders = fishData[0];
      var nomeIdx = fishHeaders.indexOf('nome_popular');
      var especies = {};
      
      for (var j = 1; j < fishData.length; j++) {
        if (fishData[j][nomeIdx]) {
          especies[fishData[j][nomeIdx]] = true;
        }
      }
      indices.riqueza = Object.keys(especies).length;
    }
    
  } catch (e) {
    Logger.log('Erro em getBioticIndices: ' + e);
  }
  
  return indices;
}

/**
 * Dados padrão quando não há dados disponíveis
 */
function getDefaultDashboardData() {
  return {
    stats: { totalColetas: 0, totalPontos: 0, totalEspecies: 0 },
    quality: { score: null, class: 'unknown', label: 'Sem dados' },
    waterQuality: {},
    recentCollections: [],
    alerts: [],
    biotaCounts: { fitoplancton: 0, zooplancton: 0, macrofitas: 0, bentos: 0, ictiofauna: 0 },
    indices: { shannon: null, bmwp: null, riqueza: null },
    lastUpdate: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Abre o dashboard limnológico
 */
function openLimnologyDashboard() {
  var html = HtmlService.createTemplateFromFile('LimnologyDashboard')
    .evaluate()
    .setTitle('Dashboard Limnológico')
    .setWidth(450)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Abre seletor de formulário de coleta
 */
function openLimnologyFormSelector() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Nova Coleta',
    'Selecione o tipo:\n1-FísicoQuímico\n2-Fitoplâncton\n3-Zooplâncton\n4-Macrófitas\n5-Bentos\n6-Ictiofauna',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    var types = ['physicochemical', 'phytoplankton', 'zooplankton', 'macrophytes', 'benthic', 'ichthyofauna'];
    var idx = parseInt(result.getResponseText()) - 1;
    if (idx >= 0 && idx < types.length) {
      openLimnologyForm(types[idx]);
    }
  }
}

/**
 * Limpa alertas (marca como lidos)
 */
function clearLimnologyAlerts() {
  CacheService.getScriptCache().remove('limnology_dashboard_data');
  return { success: true };
}

/**
 * Exporta dados limnológicos
 */
function exportLimnologyData() {
  // Implementação simplificada - retorna URL da planilha
  return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

/**
 * Helper para obter sheet - LimnologyDashboard version
 * NOTA: getSheet() principal está em Config.gs
 */
function getLimnologySheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}
