/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VISUALIZATION SYNC SERVICE
 * Sincronização automática de gráficos PNG do Google Drive
 * 
 * Funcionalidades:
 * - Sincronização manual e automática (trigger diário)
 * - Cache de metadados para performance
 * - Detecção de arquivos novos/atualizados
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VIZ_CONFIG = {
  DRIVE_FOLDER_ID: '1AQmPZWfzdaJu7OpJ2IxR-FjwKJiLk1oS',
  CACHE_KEY: 'VIZ_METADATA_CACHE',
  CACHE_DURATION: 3600, // 1 hora em segundos
  SYNC_STATUS_KEY: 'VIZ_SYNC_STATUS'
};

/**
 * Mapeamento de arquivos PNG para categorias semânticas
 */
const VIZ_MAPPING = {
  'histograma_dap_especies.png': { category: 'biodiversidade', order: 1 },
  'mapa_calor_biodiversidade.png': { category: 'biodiversidade', order: 2 },
  'violino_biodiversidade_estacao.png': { category: 'biodiversidade', order: 3 },
  'histograma_carbono_temporal.png': { category: 'carbono', order: 1 },
  'evolucao_carbono_acumulado.png': { category: 'carbono', order: 2 },
  'kde_qualidade_agua.png': { category: 'agua', order: 1 },
  'radar_qualidade_agua_pontos.png': { category: 'agua', order: 2 },
  'kde_qualidade_solo.png': { category: 'solo', order: 1 },
  'boxplot_solo_uso.png': { category: 'solo', order: 2 },
  'violino_terapia_eficacia.png': { category: 'terapia', order: 1 },
  'radar_desempenho_terapias.png': { category: 'terapia', order: 2 },
  'barras_producao_receita.png': { category: 'producao', order: 1 },
  'analise_sazonalidade_producao.png': { category: 'producao', order: 2 },
  'barras_visitantes_tipo.png': { category: 'visitantes', order: 1 },
  'serie_temporal_clima.png': { category: 'clima', order: 1 },
  'dashboard_iot.png': { category: 'iot', order: 1 },
  'radar_indicadores_mrv.png': { category: 'mrv', order: 1 },
  'heatmap_correlacao_ambiental.png': { category: 'analises', order: 1 },
  'perfil_elevacao.png': { category: 'trilhas', order: 1 },
  'mapa_trilha_2d.png': { category: 'trilhas', order: 2 },
  'dashboard_capacidade.png': { category: 'trilhas', order: 3 },
  'cronograma_projeto.png': { category: 'trilhas', order: 4 }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES PRINCIPAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sincroniza visualizações do Google Drive
 * Chamado pelo frontend ou trigger
 */
function syncVisualizationsFromDrive() {
  try {
    const folder = DriveApp.getFolderById(VIZ_CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFilesByType(MimeType.PNG);
    
    const metadata = {};
    const today = new Date().toDateString();
    const previousMeta = getCachedMetadata();
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const fileId = file.getId();
      const lastUpdated = file.getLastUpdated();
      const vizId = fileName.replace('.png', '');
      
      const mapping = VIZ_MAPPING[fileName] || { category: 'outros', order: 99 };
      const wasUpdatedToday = lastUpdated.toDateString() === today;
      const isNew = !previousMeta[vizId];
      
      // Garantir acesso público ao arquivo
      try {
        const access = file.getSharingAccess();
        if (access !== DriveApp.Access.ANYONE_WITH_LINK) {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      } catch (e) {
        // Ignora erro de permissão
      }
      
      // Usar formato thumbnail para melhor compatibilidade
      // O formato uc?export=view pode ter problemas de CORS
      // Alternativa: usar thumbnail com tamanho grande
      const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
      const fallbackUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
      
      metadata[vizId] = {
        fileId: fileId,
        fileName: fileName,
        category: mapping.category,
        order: mapping.order,
        lastUpdated: lastUpdated.toISOString(),
        updatedToday: wasUpdatedToday,
        isNew: isNew,
        url: directUrl,
        fallbackUrl: fallbackUrl,
        // URL alternativa para download direto (pode precisar de auth)
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
      };
    }
    
    // Salvar no cache
    setCachedMetadata(metadata);
    
    // Atualizar status de sincronização
    updateSyncStatus();
    
    return {
      success: true,
      metadata: metadata,
      count: Object.keys(metadata).length,
      syncTime: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retorna metadados das visualizações (do cache ou sincroniza)
 */
function getVisualizationMetadata() {
  let metadata = getCachedMetadata();
  
  if (!metadata || Object.keys(metadata).length === 0) {
    const result = syncVisualizationsFromDrive();
    metadata = result.metadata || {};
  }
  
  return metadata;
}

/**
 * Retorna status da última sincronização
 */
function getVisualizationSyncStatus() {
  const cache = CacheService.getScriptCache();
  const status = cache.get(VIZ_CONFIG.SYNC_STATUS_KEY);
  return status ? JSON.parse(status) : { lastSync: null };
}

/**
 * Retorna URL direta de uma visualização específica
 */
function getVisualizationUrl(vizId) {
  const metadata = getVisualizationMetadata();
  const viz = metadata[vizId];
  
  if (viz) {
    return viz.url;
  }
  
  return null;
}

/**
 * Lista todas as visualizações por categoria
 */
function getVisualizationsByCategory(category) {
  const metadata = getVisualizationMetadata();
  
  return Object.entries(metadata)
    .filter(([_, data]) => data.category === category)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([id, data]) => ({ id, ...data }));
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function getCachedMetadata() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(VIZ_CONFIG.CACHE_KEY);
  return cached ? JSON.parse(cached) : {};
}

function setCachedMetadata(metadata) {
  const cache = CacheService.getScriptCache();
  cache.put(VIZ_CONFIG.CACHE_KEY, JSON.stringify(metadata), VIZ_CONFIG.CACHE_DURATION);
}

function updateSyncStatus() {
  const cache = CacheService.getScriptCache();
  const status = {
    lastSync: new Date().toISOString(),
    syncedBy: Session.getActiveUser().getEmail() || 'trigger'
  };
  cache.put(VIZ_CONFIG.SYNC_STATUS_KEY, JSON.stringify(status), 86400); // 24h
}

function clearVisualizationCache() {
  const cache = CacheService.getScriptCache();
  cache.remove(VIZ_CONFIG.CACHE_KEY);
  cache.remove(VIZ_CONFIG.SYNC_STATUS_KEY);
  return { success: true, message: 'Cache limpo' };
}

/**
 * Verifica e configura permissões de compartilhamento dos arquivos
 * Necessário para que as imagens sejam acessíveis via URL
 */
function ensurePublicAccess() {
  try {
    const folder = DriveApp.getFolderById(VIZ_CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFilesByType(MimeType.PNG);
    let updated = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      try {
        // Verificar se já está compartilhado
        const access = file.getSharingAccess();
        if (access !== DriveApp.Access.ANYONE_WITH_LINK) {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          updated++;
        }
      } catch (e) {
        console.log(`Não foi possível atualizar permissões de ${file.getName()}: ${e}`);
      }
    }
    
    return { success: true, updated: updated, message: `${updated} arquivos atualizados para acesso público` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Gera URL de imagem com blob base64 (fallback para CORS)
 */
function getImageAsBase64(vizId) {
  try {
    const metadata = getVisualizationMetadata();
    const viz = metadata[vizId];
    
    if (!viz) return { success: false, error: 'Visualização não encontrada' };
    
    const file = DriveApp.getFileById(viz.fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    const mimeType = blob.getContentType();
    
    return {
      success: true,
      dataUrl: `data:${mimeType};base64,${base64}`,
      vizId: vizId
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERS - SINCRONIZAÇÃO AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configura trigger diário para sincronização automática
 * Execute uma vez para ativar
 */
function setupDailySyncTrigger() {
  // Remove triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'dailyVisualizationSync') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger diário às 6h
  ScriptApp.newTrigger('dailyVisualizationSync')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  
  console.log('✓ Trigger diário configurado para 6h');
  return { success: true, message: 'Trigger configurado para sincronização diária às 6h' };
}

/**
 * Função executada pelo trigger diário
 */
function dailyVisualizationSync() {
  console.log('🔄 Iniciando sincronização diária de visualizações...');
  
  const result = syncVisualizationsFromDrive();
  
  if (result.success) {
    console.log(`✓ Sincronização concluída: ${result.count} visualizações`);
    
    // Opcional: enviar notificação por email
    // sendSyncNotification(result);
  } else {
    console.error('✗ Erro na sincronização:', result.error);
  }
  
  return result;
}

/**
 * Remove todos os triggers de sincronização
 */
function removeSyncTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'dailyVisualizationSync') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });
  
  return { success: true, removed: removed };
}

/**
 * Lista triggers ativos
 */
function listActiveTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  return triggers.map(t => ({
    function: t.getHandlerFunction(),
    type: t.getEventType().toString(),
    id: t.getUniqueId()
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Abre o dashboard de visualizações (apenas contexto de menu)
 */
function showVisualizationDashboard() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('VisualizationDashboard')
      .setTitle('Visualizações - Reserva Araras')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    SpreadsheetApp.getUi().showSidebar(html);
  } catch (e) {
    // Contexto não suporta UI (webapp, trigger, etc)
    Logger.log('showVisualizationDashboard: ' + e.message);
    return { success: false, error: 'Função disponível apenas no menu da planilha' };
  }
}

/**
 * Abre visualizações em modal fullscreen (apenas contexto de menu)
 */
function showVisualizationModal() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('VisualizationDashboard')
      .setWidth(800)
      .setHeight(600);
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Visualizações');
  } catch (e) {
    Logger.log('showVisualizationModal: ' + e.message);
    return { success: false, error: 'Função disponível apenas no menu da planilha' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MENU INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Adiciona itens ao menu do sistema
 */
function addVisualizationMenuItems(menu) {
  menu.addItem('📊 Dashboard de Visualizações', 'showVisualizationDashboard')
      .addItem('🔄 Sincronizar Gráficos', 'syncVisualizationsFromDrive')
      .addItem('⚙️ Configurar Sync Diário', 'setupDailySyncTrigger');
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTES
// ═══════════════════════════════════════════════════════════════════════════

function testVisualizationSync() {
  console.log('=== TESTE DE SINCRONIZAÇÃO ===');
  
  // Limpar cache
  clearVisualizationCache();
  console.log('Cache limpo');
  
  // Sincronizar
  const result = syncVisualizationsFromDrive();
  console.log('Resultado:', JSON.stringify(result, null, 2));
  
  // Verificar metadados
  const metadata = getVisualizationMetadata();
  console.log('Total de visualizações:', Object.keys(metadata).length);
  
  // Listar por categoria
  const biodiv = getVisualizationsByCategory('biodiversidade');
  console.log('Biodiversidade:', biodiv.length, 'visualizações');
  
  return result;
}
