/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOBILE OPTIMIZATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * Otimizações específicas para Samsung S20 + Lemur Browser
 * 
 * FOCO:
 * - Performance em dispositivos móveis
 * - Exportações otimizadas (CSV, JSON, KML, GPX)
 * - Compressão de dados
 * - Cache inteligente
 * - Batch operations
 */

const MobileOptimization = {
  
  /**
   * Configurações específicas para mobile
   */
  CONFIG: {
    MAX_RECORDS_PER_REQUEST: 50,    // Limite por requisição
    BATCH_SIZE: 20,                  // Tamanho do lote para operações
    CACHE_DURATION: 300000,          // 5 minutos em ms
    COMPRESSION_THRESHOLD: 1000,     // Comprimir se > 1KB
    EXPORT_MAX_ROWS: 1000           // Máximo de linhas para exportação
  },

  /**
   * Leitura otimizada para mobile com paginação
   */
  readOptimized(sheetName, options = {}) {
    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 20, this.CONFIG.MAX_RECORDS_PER_REQUEST);
      const offset = (page - 1) * limit;

      const result = DatabaseService.read(sheetName, options.filter || {}, {
        limit: limit,
        offset: offset,
        sortBy: options.sortBy || 'timestamp',
        sortOrder: options.sortOrder || 'desc'
      });

      if (!result.success) return result;

      // Adiciona metadados de paginação
      return {
        success: true,
        data: result.data,
        pagination: {
          page: page,
          limit: limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: offset + limit < result.total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      Utils.logError('MobileOptimization.readOptimized', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Criação em lote (batch) para múltiplos registros
   */
  batchCreate(sheetName, records) {
    try {
      if (!Array.isArray(records) || records.length === 0) {
        return { success: false, error: 'Nenhum registro fornecido' };
      }

      const results = {
        success: true,
        created: [],
        failed: [],
        total: records.length
      };

      // Processa em lotes
      for (let i = 0; i < records.length; i += this.CONFIG.BATCH_SIZE) {
        const batch = records.slice(i, i + this.CONFIG.BATCH_SIZE);
        
        batch.forEach(record => {
          const result = DatabaseService.create(sheetName, record);
          if (result.success) {
            results.created.push(result.id);
          } else {
            results.failed.push({ record, error: result.error });
          }
        });

        // Pequena pausa entre lotes para evitar timeout
        if (i + this.CONFIG.BATCH_SIZE < records.length) {
          Utilities.sleep(100);
        }
      }

      results.success = results.failed.length === 0;
      return results;
    } catch (error) {
      Utils.logError('MobileOptimization.batchCreate', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Estatísticas rápidas otimizadas para dashboard mobile
   * OTIMIZADO: Usa cache em memória e batch read
   */
  _statsCache: null,
  _statsCacheTime: 0,
  
  getQuickStats() {
    try {
      // Cache em memória por 60 segundos
      const now = Date.now();
      if (this._statsCache && (now - this._statsCacheTime) < 60000) {
        return this._statsCache;
      }
      
      const sheets = ['Waypoints', 'Fotos', 'Trilhas', 'Visitantes', 'ParcelasAgroflorestais', 'EspeciesAgroflorestais'];
      const stats = {};

      // Batch: obtém todas as contagens de uma vez
      sheets.forEach(sheetName => {
        stats[sheetName.toLowerCase().replace('agroflorestais', '')] = this._quickCount(sheetName);
      });

      const result = {
        success: true,
        stats: stats,
        timestamp: new Date()
      };
      
      // Salva em cache
      this._statsCache = result;
      this._statsCacheTime = now;
      
      return result;
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Contagem rápida sem carregar todos os dados
   * OTIMIZADO: Cache de contagens
   */
  _countCache: {},
  _countCacheTime: {},
  
  _quickCount(sheetName) {
    try {
      const now = Date.now();
      // Cache por 30 segundos
      if (this._countCache[sheetName] !== undefined && 
          (now - (this._countCacheTime[sheetName] || 0)) < 30000) {
        return this._countCache[sheetName];
      }
      
      const sheet = getSheet(sheetName);
      if (!sheet) return 0;
      
      const count = Math.max(0, sheet.getLastRow() - 1);
      
      this._countCache[sheetName] = count;
      this._countCacheTime[sheetName] = now;
      
      return count;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Exportação otimizada para CSV (mobile-friendly)
   */
  exportCSVOptimized(sheetName, filters = {}) {
    try {
      const result = DatabaseService.read(sheetName, filters, {
        limit: this.CONFIG.EXPORT_MAX_ROWS
      });

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Sem dados para exportar' };
      }

      // Headers
      const headers = Object.keys(result.data[0]);
      const csvLines = [headers.join(',')];

      // Dados com escape adequado
      result.data.forEach(row => {
        const values = headers.map(h => {
          let value = row[h] || '';
          
          // Formata datas
          if (value instanceof Date) {
            value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
          }
          
          // Escape para CSV
          value = String(value).replace(/"/g, '""');
          
          // Adiciona aspas se contém vírgula, quebra de linha ou aspas
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
          
          return value;
        });
        csvLines.push(values.join(','));
      });

      const csv = csvLines.join('\n');
      const filename = `${sheetName}_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}.csv`;

      return {
        success: true,
        csv: csv,
        filename: filename,
        size: csv.length,
        rows: result.data.length,
        downloadUrl: this._createDownloadUrl(csv, filename, 'text/csv')
      };
    } catch (error) {
      Utils.logError('MobileOptimization.exportCSVOptimized', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Exportação JSON compacta
   */
  exportJSONOptimized(sheetName, filters = {}) {
    try {
      const result = DatabaseService.read(sheetName, filters, {
        limit: this.CONFIG.EXPORT_MAX_ROWS
      });

      if (!result.success) return result;

      const json = JSON.stringify({
        sheet: sheetName,
        exported: new Date(),
        count: result.data.length,
        data: result.data
      }, null, 2);

      const filename = `${sheetName}_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}.json`;

      return {
        success: true,
        json: json,
        filename: filename,
        size: json.length,
        rows: result.data.length,
        downloadUrl: this._createDownloadUrl(json, filename, 'application/json')
      };
    } catch (error) {
      Utils.logError('MobileOptimization.exportJSONOptimized', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Exportação KML otimizada para waypoints (Google Earth)
   */
  exportKMLOptimized(filters = {}) {
    try {
      const result = DatabaseService.read('Waypoints', filters, {
        limit: this.CONFIG.EXPORT_MAX_ROWS
      });

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Sem waypoints para exportar' };
      }

      const kmlParts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<kml xmlns="http://www.opengis.net/kml/2.2">',
        '  <Document>',
        '    <name>Reserva Araras - Waypoints</name>',
        '    <description>Exportado em ' + new Date().toISOString() + '</description>'
      ];

      // Estilos por categoria
      const styles = {
        cachoeira: { icon: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png', color: 'ff0000ff' },
        mirante: { icon: 'http://maps.google.com/mapfiles/kml/paddle/grn-circle.png', color: 'ff00ff00' },
        atração: { icon: 'http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png', color: 'ff00ffff' },
        agua: { icon: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png', color: 'ffff0000' },
        flora: { icon: 'http://maps.google.com/mapfiles/kml/paddle/grn-blank.png', color: 'ff00ff00' },
        fauna: { icon: 'http://maps.google.com/mapfiles/kml/paddle/orange-blank.png', color: 'ff0080ff' }
      };

      // Adiciona estilos
      Object.keys(styles).forEach(cat => {
        kmlParts.push(`    <Style id="style_${cat}">`);
        kmlParts.push('      <IconStyle>');
        kmlParts.push(`        <color>${styles[cat].color}</color>`);
        kmlParts.push('        <Icon>');
        kmlParts.push(`          <href>${styles[cat].icon}</href>`);
        kmlParts.push('        </Icon>');
        kmlParts.push('      </IconStyle>');
        kmlParts.push('    </Style>');
      });

      // Adiciona placemarks
      result.data.forEach(wp => {
        const categoria = wp.categoria || 'default';
        const styleUrl = styles[categoria] ? `#style_${categoria}` : '';
        
        kmlParts.push('    <Placemark>');
        kmlParts.push(`      <name>${this._escapeXml(wp.nome)}</name>`);
        if (wp.descricao) {
          kmlParts.push(`      <description>${this._escapeXml(wp.descricao)}</description>`);
        }
        if (styleUrl) {
          kmlParts.push(`      <styleUrl>${styleUrl}</styleUrl>`);
        }
        kmlParts.push('      <Point>');
        kmlParts.push(`        <coordinates>${wp.longitude},${wp.latitude},${wp.altitude || 0}</coordinates>`);
        kmlParts.push('      </Point>');
        kmlParts.push('    </Placemark>');
      });

      kmlParts.push('  </Document>');
      kmlParts.push('</kml>');

      const kml = kmlParts.join('\n');
      const filename = `waypoints_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}.kml`;

      return {
        success: true,
        kml: kml,
        filename: filename,
        size: kml.length,
        points: result.data.length,
        downloadUrl: this._createDownloadUrl(kml, filename, 'application/vnd.google-earth.kml+xml')
      };
    } catch (error) {
      Utils.logError('MobileOptimization.exportKMLOptimized', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Exportação GPX para trilhas e waypoints
   */
  exportGPXOptimized(filters = {}) {
    try {
      const waypoints = DatabaseService.read('Waypoints', filters, {
        limit: this.CONFIG.EXPORT_MAX_ROWS
      });

      if (!waypoints.success || waypoints.data.length === 0) {
        return { success: false, error: 'Sem dados para exportar' };
      }

      const gpxParts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx version="1.1" creator="Reserva Araras" xmlns="http://www.topografix.com/GPX/1/1">',
        '  <metadata>',
        '    <name>Reserva Araras - Waypoints</name>',
        '    <time>' + new Date().toISOString() + '</time>',
        '  </metadata>'
      ];

      waypoints.data.forEach(wp => {
        gpxParts.push(`  <wpt lat="${wp.latitude}" lon="${wp.longitude}">`);
        if (wp.altitude) {
          gpxParts.push(`    <ele>${wp.altitude}</ele>`);
        }
        gpxParts.push(`    <name>${this._escapeXml(wp.nome)}</name>`);
        if (wp.descricao) {
          gpxParts.push(`    <desc>${this._escapeXml(wp.descricao)}</desc>`);
        }
        if (wp.categoria) {
          gpxParts.push(`    <type>${this._escapeXml(wp.categoria)}</type>`);
        }
        gpxParts.push('  </wpt>');
      });

      gpxParts.push('</gpx>');

      const gpx = gpxParts.join('\n');
      const filename = `waypoints_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}.gpx`;

      return {
        success: true,
        gpx: gpx,
        filename: filename,
        size: gpx.length,
        points: waypoints.data.length,
        downloadUrl: this._createDownloadUrl(gpx, filename, 'application/xml')
      };
    } catch (error) {
      Utils.logError('MobileOptimization.exportGPXOptimized', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Cria URL de download temporária
   */
  _createDownloadUrl(content, filename, mimeType) {
    try {
      // Validações
      if (!content) {
        Logger.log('Erro: conteúdo vazio para download');
        return null;
      }
      
      if (!filename || typeof filename !== 'string') {
        Logger.log('Erro: filename inválido - ' + JSON.stringify(filename));
        return null;
      }
      
      if (!mimeType || typeof mimeType !== 'string') {
        Logger.log('Erro: mimeType inválido - ' + JSON.stringify(mimeType));
        return null;
      }
      
      // Cria blob com tipo MIME correto
      const blob = Utilities.newBlob(content, mimeType, filename);
      
      // Usa pasta específica de fotos (PHOTOS_FOLDER_ID) para imagens, senão DRIVE_FOLDER_ID
      const isImage = mimeType && mimeType.startsWith('image/');
      const folderId = isImage ? (CONFIG.PHOTOS_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID) : CONFIG.DRIVE_FOLDER_ID;
      
      // Tenta usar a pasta configurada, senão usa a raiz do Drive
      let file;
      try {
        if (folderId && folderId !== '') {
          const folder = DriveApp.getFolderById(folderId);
          // Valida que é realmente uma pasta
          if (folder && folder.getName) {
            file = folder.createFile(blob);
          } else {
            Logger.log('Pasta não é válida, usando criação direta');
            file = DriveApp.createFile(blob);
          }
        } else {
          Logger.log('Pasta não configurada, criando arquivo diretamente');
          file = DriveApp.createFile(blob);
        }
      } catch (folderError) {
        Logger.log('Erro ao criar arquivo na pasta configurada, criando diretamente: ' + folderError);
        file = DriveApp.createFile(blob);
      }
      
      // Torna o arquivo público temporariamente
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (sharingError) {
        Logger.log('Aviso: não foi possível tornar arquivo público: ' + sharingError);
      }
      
      return file.getDownloadUrl();
    } catch (error) {
      Logger.log('Erro ao criar URL de download: ' + error);
      Logger.log('Parâmetros: filename=' + filename + ', mimeType=' + mimeType);
      Logger.log('Stack: ' + error.stack);
      return null;
    }
  },

  /**
   * Escape XML para KML/GPX
   */
  _escapeXml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  },

  /**
   * Sincronização incremental (apenas mudanças desde última sync)
   */
  syncIncremental(sheetName, lastSyncTimestamp) {
    try {
      const filter = {};
      if (lastSyncTimestamp) {
        // Filtra apenas registros modificados após última sync
        const result = DatabaseService.read(sheetName, {}, {
          sortBy: 'timestamp',
          sortOrder: 'desc'
        });

        if (!result.success) return result;

        const lastSync = new Date(lastSyncTimestamp);
        const changes = result.data.filter(record => {
          const recordTime = new Date(record.timestamp);
          return recordTime > lastSync;
        });

        return {
          success: true,
          changes: changes,
          count: changes.length,
          timestamp: new Date()
        };
      }

      // Primeira sync - retorna tudo (com limite)
      return this.readOptimized(sheetName, { limit: 50 });
    } catch (error) {
      Utils.logError('MobileOptimization.syncIncremental', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Validação de dados antes de enviar (economiza requisições)
   */
  validateBeforeSubmit(sheetName, data) {
    try {
      const requiredFields = {
        'Waypoints': ['nome', 'latitude', 'longitude', 'categoria'],
        'Fotos': ['nome_arquivo', 'categoria'],
        'ParcelasAgroflorestais': ['nome', 'tipo_sistema', 'area_ha'],
        'Visitantes': ['nome', 'data_visita'],
        'Trilhas': ['nome', 'distancia_km']
      };

      const required = requiredFields[sheetName] || [];
      const errors = [];

      required.forEach(field => {
        if (!data[field] || data[field] === '') {
          errors.push(`Campo obrigatório: ${field}`);
        }
      });

      // Validações específicas
      if (sheetName === 'Waypoints') {
        if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
          errors.push('Latitude inválida (deve estar entre -90 e 90)');
        }
        if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
          errors.push('Longitude inválida (deve estar entre -180 e 180)');
        }
      }

      if (sheetName === 'ParcelasAgroflorestais') {
        if (data.area_ha && data.area_ha <= 0) {
          errors.push('Área deve ser maior que zero');
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      return { valid: false, errors: [error.toString()] };
    }
  },

  /**
   * Compressão de resposta para economizar dados móveis
   */
  compressResponse(data) {
    try {
      const json = JSON.stringify(data);
      
      if (json.length < this.CONFIG.COMPRESSION_THRESHOLD) {
        return { compressed: false, data: json };
      }

      // Compressão simples: remove espaços e quebras de linha
      const compressed = json.replace(/\s+/g, ' ');

      return {
        compressed: true,
        data: compressed,
        originalSize: json.length,
        compressedSize: compressed.length,
        ratio: ((1 - compressed.length / json.length) * 100).toFixed(2) + '%'
      };
    } catch (error) {
      return { compressed: false, data: JSON.stringify(data) };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES EXPOSTAS PARA O FRONTEND
// ═══════════════════════════════════════════════════════════════════════════

function apiReadOptimized(sheetName, options) {
  return MobileOptimization.readOptimized(sheetName, options);
}

function apiBatchCreate(sheetName, records) {
  return MobileOptimization.batchCreate(sheetName, records);
}

function apiGetQuickStats() {
  // Usa cache para resposta instantânea
  if (typeof CacheManager !== 'undefined') {
    return CacheManager.get('quick_stats', () => MobileOptimization.getQuickStats(), 180);
  }
  return MobileOptimization.getQuickStats();
}

function apiExportCSVOptimized(sheetName, filters) {
  return MobileOptimization.exportCSVOptimized(sheetName, filters);
}

function apiExportJSONOptimized(sheetName, filters) {
  return MobileOptimization.exportJSONOptimized(sheetName, filters);
}

function apiExportKMLOptimized(filters) {
  return MobileOptimization.exportKMLOptimized(filters);
}

function apiExportGPXOptimized(filters) {
  return MobileOptimization.exportGPXOptimized(filters);
}

function apiSyncIncremental(sheetName, lastSyncTimestamp) {
  return MobileOptimization.syncIncremental(sheetName, lastSyncTimestamp);
}

function apiValidateBeforeSubmit(sheetName, data) {
  return MobileOptimization.validateBeforeSubmit(sheetName, data);
}

/**
 * API de pré-carregamento otimizada para Index.html
 * Retorna dados essenciais em uma única chamada
 */
function apiPreloadIndexData() {
  try {
    const startTime = new Date().getTime();
    
    // Dados essenciais para o Index
    const preloadData = {
      stats: MobileOptimization.getQuickStats(),
      config: {
        version: CONFIG.VERSION,
        appName: CONFIG.APP_NAME,
        limits: MobileOptimization.CONFIG
      },
      timestamp: new Date().toISOString()
    };
    
    // Adiciona feature flags se disponível
    if (typeof ConfigManager !== 'undefined') {
      preloadData.maintenance = ConfigManager.isMaintenanceMode();
    }
    
    return {
      success: true,
      data: preloadData,
      loadTime: new Date().getTime() - startTime
    };
  } catch (error) {
    Logger.log('apiPreloadIndexData error: ' + error);
    return { success: false, error: error.toString() };
  }
}
