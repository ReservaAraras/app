/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GPS SERVICE - Gestão de Pontos GPS, Waypoints e Rotas
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Categorias de waypoints com ícones e cores (Prompt 29/30)
 */
const WAYPOINT_CATEGORIES = {
  POI: { nome: 'Ponto de Interesse', icone: 'star', cor: '#FFD700' },
  PERIGO: { nome: 'Perigo/Risco', icone: 'warning', cor: '#FF0000' },
  FLORA: { nome: 'Flora Notável', icone: 'leaf', cor: '#228B22' },
  FAUNA: { nome: 'Avistamento Fauna', icone: 'paw', cor: '#8B4513' },
  AGUA: { nome: 'Recurso Hídrico', icone: 'water', cor: '#1E90FF' },
  INFRAESTRUTURA: { nome: 'Infraestrutura', icone: 'building', cor: '#808080' },
  MIRANTE: { nome: 'Mirante/Vista', icone: 'eye', cor: '#9370DB' },
  DESCANSO: { nome: 'Área de Descanso', icone: 'bench', cor: '#DEB887' }
};

const GPSService = {

  /**
   * Cria um ponto GPS
   */
  createGPSPoint(data) {
    try {
      if (!data) {
        return { success: false, error: 'Dados não fornecidos' };
      }

      const gpsData = {
        tipo: data.tipo || 'waypoint',
        nome: data.nome,
        descricao: data.descricao || '',
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        altitude: parseFloat(data.altitude) || 0,
        precisao: parseFloat(data.precisao) || 0,
        categoria: data.categoria || 'geral',
        trilha_id: data.trilha_id || '',
        foto_id: data.foto_id || '',
        usuario: Session.getActiveUser().getEmail(),
        data_coleta: new Date(),
        observacoes: data.observacoes || ''
      };

      return SheetsService.create(CONFIG.SHEETS.GPS_POINTS, gpsData);
    } catch (error) {
      Utils.logError('GPSService.createGPSPoint', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Cria um waypoint com fotos
   */
  createWaypoint(data) {
    try {
      if (!data) {
        return { success: false, error: 'Dados não fornecidos' };
      }
      if (!data.nome) {
        return { success: false, error: 'Nome é obrigatório' };
      }

      const waypointData = {
        nome: data.nome,
        descricao: data.descricao || '',
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        altitude: parseFloat(data.altitude) || 0,
        categoria: data.categoria || 'ponto_interesse',
        icone: data.icone || 'marker',
        cor: data.cor || '#FF0000',
        trilha_id: data.trilha_id || '',
        foto_ids: data.foto_ids || '',
        usuario: Session.getActiveUser().getEmail(),
        data_criacao: new Date(),
        visivel: data.visivel !== false,
        observacoes: data.observacoes || ''
      };

      return SheetsService.create(CONFIG.SHEETS.WAYPOINTS, waypointData);
    } catch (error) {
      Utils.logError('GPSService.createWaypoint', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Cria uma rota
   */
  createRoute(data) {
    try {
      if (!data) {
        return { success: false, error: 'Dados não fornecidos' };
      }
      if (!data.nome) {
        return { success: false, error: 'Nome é obrigatório' };
      }

      const routeData = {
        nome: data.nome,
        descricao: data.descricao || '',
        tipo: data.tipo || 'trilha',
        distancia_km: parseFloat(data.distancia_km) || 0,
        duracao_horas: parseFloat(data.duracao_horas) || 0,
        dificuldade: data.dificuldade || 'media',
        pontos_gps: data.pontos_gps || '',
        waypoints_ids: data.waypoints_ids || '',
        elevacao_ganho: parseFloat(data.elevacao_ganho) || 0,
        elevacao_perda: parseFloat(data.elevacao_perda) || 0,
        usuario: Session.getActiveUser().getEmail(),
        data_criacao: new Date(),
        publica: data.publica !== false,
        observacoes: data.observacoes || ''
      };

      return SheetsService.create(CONFIG.SHEETS.ROTAS, routeData);
    } catch (error) {
      Utils.logError('GPSService.createRoute', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém waypoints de uma trilha
   */
  getTrailWaypoints(trilhaId) {
    try {
      return SheetsService.read(CONFIG.SHEETS.WAYPOINTS, {
        filter: { trilha_id: trilhaId },
        sortBy: 'data_criacao',
        sortOrder: 'asc'
      });
    } catch (error) {
      Utils.logError('GPSService.getTrailWaypoints', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém pontos GPS de uma trilha
   */
  getTrailGPSPoints(trilhaId) {
    try {
      return SheetsService.read(CONFIG.SHEETS.GPS_POINTS, {
        filter: { trilha_id: trilhaId },
        sortBy: 'data_coleta',
        sortOrder: 'asc'
      });
    } catch (error) {
      Utils.logError('GPSService.getTrailGPSPoints', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
  },

  toRad(degrees) {
    return degrees * Math.PI / 180;
  },

  /**
   * Calcula distância total de uma rota
   */
  calculateRouteDistance(pontosGPS) {
    try {
      if (!pontosGPS || pontosGPS.length < 2) {
        return 0;
      }

      let totalDistance = 0;
      for (let i = 0; i < pontosGPS.length - 1; i++) {
        const p1 = pontosGPS[i];
        const p2 = pontosGPS[i + 1];
        totalDistance += this.calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon);
      }

      return totalDistance;
    } catch (error) {
      Utils.logError('GPSService.calculateRouteDistance', error);
      return 0;
    }
  },

  /**
   * Exporta rota para GPX
   */
  exportToGPX(routeId) {
    try {
      const route = SheetsService.read(CONFIG.SHEETS.ROTAS, { filter: { id: routeId } });
      if (!route.success || route.data.length === 0) {
        return { success: false, error: 'Rota não encontrada' };
      }

      const routeData = route.data[0];
      const points = SheetsService.read(CONFIG.SHEETS.GPS_POINTS, { filter: { trilha_id: routeData.trilha_id } });

      let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
      gpx += '<gpx version="1.1" creator="Reserva Araras">\n';
      gpx += `  <metadata>\n`;
      gpx += `    <name>${routeData.nome}</name>\n`;
      gpx += `    <desc>${routeData.descricao}</desc>\n`;
      gpx += `  </metadata>\n`;
      gpx += `  <trk>\n`;
      gpx += `    <name>${routeData.nome}</name>\n`;
      gpx += `    <trkseg>\n`;

      if (points.success && points.data.length > 0) {
        points.data.forEach(point => {
          gpx += `      <trkpt lat="${point.latitude}" lon="${point.longitude}">\n`;
          if (point.altitude) {
            gpx += `        <ele>${point.altitude}</ele>\n`;
          }
          gpx += `        <name>${point.nome}</name>\n`;
          gpx += `      </trkpt>\n`;
        });
      }

      gpx += `    </trkseg>\n`;
      gpx += `  </trk>\n`;
      gpx += '</gpx>';

      return { success: true, gpx: gpx };
    } catch (error) {
      Utils.logError('GPSService.exportToGPX', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Busca waypoints próximos
   */
  findNearbyWaypoints(latitude, longitude, radiusKm) {
    try {
      const allWaypoints = SheetsService.read(CONFIG.SHEETS.WAYPOINTS);
      if (!allWaypoints.success) return allWaypoints;

      const nearby = allWaypoints.data.filter(wp => {
        const distance = this.calculateDistance(
          latitude, longitude,
          parseFloat(wp.latitude), parseFloat(wp.longitude)
        );
        return distance <= radiusKm;
      }).map(wp => {
        const distance = this.calculateDistance(
          latitude, longitude,
          parseFloat(wp.latitude), parseFloat(wp.longitude)
        );
        return { ...wp, distancia_km: distance.toFixed(2) };
      }).sort((a, b) => parseFloat(a.distancia_km) - parseFloat(b.distancia_km));

      return { success: true, data: nearby, count: nearby.length };
    } catch (error) {
      Utils.logError('GPSService.findNearbyWaypoints', error);
      return { success: false, error: error.toString() };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OFFLINE SYNC AND BATCH OPERATIONS (Prompt 29/30)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cria múltiplos waypoints em lote (para sincronização offline)
   * @param {Array} waypointsArray - Array de waypoints
   * @returns {object} Resultado com IDs criados
   */
  batchCreateWaypoints(waypointsArray) {
    try {
      if (!waypointsArray || !Array.isArray(waypointsArray) || waypointsArray.length === 0) {
        return { success: false, error: 'Array de waypoints vazio ou inválido' };
      }

      const results = {
        success: true,
        created: [],
        duplicates: [],
        errors: []
      };

      const timestamp = new Date();
      const usuario = Session.getActiveUser().getEmail() || 'offline_sync';

      for (const wp of waypointsArray) {
        try {
          // Valida dados mínimos
          if (!wp.nome || wp.latitude === undefined || wp.longitude === undefined) {
            results.errors.push({ tempId: wp.tempId, error: 'Dados incompletos' });
            continue;
          }

          const lat = parseFloat(wp.latitude);
          const lng = parseFloat(wp.longitude);

          // Verifica duplicatas por coordenadas (dentro de 10m)
          const duplicateCheck = this._checkDuplicateByCoordinates(lat, lng, 0.01);
          if (duplicateCheck.isDuplicate) {
            results.duplicates.push({
              tempId: wp.tempId,
              existingId: duplicateCheck.existingId,
              nome: wp.nome
            });
            continue;
          }

          // Obtém categoria
          const categoria = WAYPOINT_CATEGORIES[wp.categoria] || WAYPOINT_CATEGORIES.POI;

          // Cria waypoint
          const waypointData = {
            nome: wp.nome,
            descricao: wp.descricao || '',
            latitude: lat,
            longitude: lng,
            altitude: parseFloat(wp.altitude) || 0,
            categoria: wp.categoria || 'POI',
            icone: categoria.icone,
            cor: categoria.cor,
            trilha_id: wp.trilha_id || '',
            foto_ids: wp.foto_ids || '',
            usuario: usuario,
            data_criacao: wp.timestamp ? new Date(wp.timestamp) : timestamp,
            data_sync: timestamp,
            visivel: wp.visivel !== false,
            observacoes: wp.observacoes || '',
            origem: 'offline_sync',
            temp_id: wp.tempId || ''
          };

          const createResult = SheetsService.create(CONFIG.SHEETS.WAYPOINTS, waypointData);
          
          if (createResult.success) {
            results.created.push({
              tempId: wp.tempId,
              serverId: createResult.id,
              nome: wp.nome
            });
          } else {
            results.errors.push({ tempId: wp.tempId, error: createResult.error });
          }

        } catch (wpError) {
          results.errors.push({ tempId: wp.tempId, error: wpError.toString() });
        }
      }

      results.summary = {
        total: waypointsArray.length,
        created: results.created.length,
        duplicates: results.duplicates.length,
        errors: results.errors.length
      };

      return results;

    } catch (error) {
      Utils.logError('GPSService.batchCreateWaypoints', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Adiciona waypoints à fila de sincronização
   * @param {Array} waypointsArray - Array de waypoints
   * @returns {object} Resultado com IDs da fila
   */
  queueWaypointsForSync(waypointsArray) {
    try {
      if (!waypointsArray || !Array.isArray(waypointsArray) || waypointsArray.length === 0) {
        return { success: false, error: 'Array de waypoints vazio ou inválido' };
      }

      const queueIds = [];
      const timestamp = new Date();

      for (const wp of waypointsArray) {
        const metadata = {
          offlineTimestamp: wp.timestamp || timestamp.toISOString(),
          deviceInfo: wp.deviceInfo || 'unknown',
          categoria: wp.categoria || 'POI'
        };

        const queueResult = OfflineService.addToSyncQueue('waypoint', wp, metadata);
        
        if (queueResult.success) {
          queueIds.push({
            tempId: wp.tempId,
            queueId: queueResult.queueId
          });
        }
      }

      return {
        success: true,
        queued: queueIds.length,
        queueIds: queueIds,
        mensagem: `${queueIds.length} waypoints adicionados à fila de sincronização`
      };

    } catch (error) {
      Utils.logError('GPSService.queueWaypointsForSync', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Processa fila de sincronização de waypoints
   * @returns {object} Resultado do processamento
   */
  processWaypointSyncQueue() {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('FilaSincronizacao');
      
      if (!sheet) {
        return { success: true, processed: 0, message: 'Fila vazia' };
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, processed: 0, message: 'Fila vazia' };
      }

      const headers = data[0];
      const formTypeCol = headers.indexOf('FormType');
      const statusCol = headers.indexOf('Status');
      const dataCol = headers.indexOf('Data');

      // Coleta waypoints pendentes
      const pendingWaypoints = [];
      const rowIndices = [];

      for (let i = 1; i < data.length; i++) {
        if (data[i][formTypeCol] === 'waypoint' && data[i][statusCol] === 'PENDENTE') {
          try {
            const wpData = JSON.parse(data[i][dataCol]);
            pendingWaypoints.push(wpData);
            rowIndices.push(i + 1);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      if (pendingWaypoints.length === 0) {
        return { success: true, processed: 0, message: 'Nenhum waypoint pendente' };
      }

      // Processa em lote
      const batchResult = this.batchCreateWaypoints(pendingWaypoints);

      // Atualiza status na fila
      if (batchResult.success) {
        for (let i = 0; i < rowIndices.length; i++) {
          const rowIndex = rowIndices[i];
          const tempId = pendingWaypoints[i].tempId;
          
          const wasCreated = batchResult.created.some(c => c.tempId === tempId);
          const wasDuplicate = batchResult.duplicates.some(d => d.tempId === tempId);
          
          if (wasCreated) {
            sheet.getRange(rowIndex, statusCol + 1).setValue('SUCESSO');
          } else if (wasDuplicate) {
            sheet.getRange(rowIndex, statusCol + 1).setValue('DUPLICADO');
          } else {
            sheet.getRange(rowIndex, statusCol + 1).setValue('FALHA');
          }
        }
      }

      return {
        success: true,
        processed: pendingWaypoints.length,
        results: batchResult.summary,
        mensagem: `Processados ${pendingWaypoints.length} waypoints`
      };

    } catch (error) {
      Utils.logError('GPSService.processWaypointSyncQueue', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Retorna categorias de waypoints disponíveis
   * @returns {object} Lista de categorias
   */
  getWaypointCategories() {
    return {
      success: true,
      categorias: Object.entries(WAYPOINT_CATEGORIES).map(([codigo, info]) => ({
        codigo,
        nome: info.nome,
        icone: info.icone,
        cor: info.cor
      }))
    };
  },

  /**
   * Verifica duplicata por coordenadas
   * @private
   */
  _checkDuplicateByCoordinates(lat, lng, radiusKm) {
    try {
      const allWaypoints = SheetsService.read(CONFIG.SHEETS.WAYPOINTS);
      if (!allWaypoints.success || allWaypoints.data.length === 0) {
        return { isDuplicate: false };
      }

      for (const wp of allWaypoints.data) {
        const distance = this.calculateDistance(
          lat, lng,
          parseFloat(wp.latitude), parseFloat(wp.longitude)
        );
        
        if (distance <= radiusKm) {
          return {
            isDuplicate: true,
            existingId: wp.id,
            existingNome: wp.nome,
            distanceKm: distance
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      return { isDuplicate: false };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE MAPS LINK PARSER - Conversão de Links para Coordenadas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrai coordenadas (latitude/longitude) de um link do Google Maps
 * Suporta múltiplos formatos de URL do Google Maps
 * @param {string} googleMapsUrl - URL do Google Maps
 * @returns {object} { success, latitude, longitude, error }
 */
GPSService.parseGoogleMapsLink = function(googleMapsUrl) {
  try {
    if (!googleMapsUrl || typeof googleMapsUrl !== 'string') {
      return { success: false, error: 'URL não fornecida ou inválida' };
    }

    const url = googleMapsUrl.trim();
    let lat = null;
    let lng = null;

    // Padrão 1: URLs com @lat,lng (mais comum)
    // Ex: https://www.google.com/maps/@-15.7942,-47.8825,15z
    // Ex: https://www.google.com/maps/place/.../@-15.7942,-47.8825,17z
    const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    let match = url.match(atPattern);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }

    // Padrão 2: URLs com query parameter q=lat,lng
    // Ex: https://www.google.com/maps?q=-15.7942,-47.8825
    // Ex: https://maps.google.com/?q=-15.7942,-47.8825
    if (!lat || !lng) {
      const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      match = url.match(qPattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    // Padrão 3: URLs com ll=lat,lng (legacy)
    // Ex: https://maps.google.com/?ll=-15.7942,-47.8825
    if (!lat || !lng) {
      const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      match = url.match(llPattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    // Padrão 4: URLs com /place/lat,lng
    // Ex: https://www.google.com/maps/place/-15.7942,-47.8825
    if (!lat || !lng) {
      const placePattern = /\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      match = url.match(placePattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    // Padrão 5: URLs com !3d e !4d (formato interno do Google)
    // Ex: ...!3d-15.7942!4d-47.8825
    if (!lat || !lng) {
      const dPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
      match = url.match(dPattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    // Padrão 6: URLs curtas do goo.gl/maps (precisa expandir)
    // Nota: URLs curtas precisam ser expandidas via fetch
    if (!lat || !lng && (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl'))) {
      return { 
        success: false, 
        error: 'URLs curtas do Google Maps (goo.gl) não são suportadas diretamente. Por favor, abra o link no navegador e copie a URL completa.',
        isShortUrl: true
      };
    }

    // Padrão 7: URLs com dir/ (direções) - extrai destino
    // Ex: https://www.google.com/maps/dir//-15.7942,-47.8825
    if (!lat || !lng) {
      const dirPattern = /\/dir\/[^/]*\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      match = url.match(dirPattern);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    // Valida coordenadas extraídas
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      // Valida range de coordenadas
      if (lat < -90 || lat > 90) {
        return { success: false, error: 'Latitude inválida (deve estar entre -90 e 90)' };
      }
      if (lng < -180 || lng > 180) {
        return { success: false, error: 'Longitude inválida (deve estar entre -180 e 180)' };
      }

      return {
        success: true,
        latitude: lat,
        longitude: lng,
        formatted: {
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          dms: this._toDMS(lat, lng)
        }
      };
    }

    return { 
      success: false, 
      error: 'Não foi possível extrair coordenadas do link. Verifique se o link contém um ponto específico no mapa.' 
    };

  } catch (error) {
    Utils.logError('GPSService.parseGoogleMapsLink', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Converte coordenadas decimais para DMS (Graus, Minutos, Segundos)
 * @private
 */
GPSService._toDMS = function(lat, lng) {
  const toDMSPart = (coord, isLat) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    
    const direction = isLat 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return {
    latitude: toDMSPart(lat, true),
    longitude: toDMSPart(lng, false),
    full: `${toDMSPart(lat, true)} ${toDMSPart(lng, false)}`
  };
};

/**
 * Cria um waypoint a partir de um link do Google Maps
 * @param {string} googleMapsUrl - URL do Google Maps
 * @param {object} additionalData - Dados adicionais do waypoint
 * @returns {object} Resultado da criação
 */
GPSService.createWaypointFromGoogleMapsLink = function(googleMapsUrl, additionalData = {}) {
  try {
    // Extrai coordenadas do link
    const parseResult = this.parseGoogleMapsLink(googleMapsUrl);
    if (!parseResult.success) {
      return parseResult;
    }

    // Prepara dados do waypoint
    const waypointData = {
      tipo: additionalData.tipo || 'waypoint',
      nome: additionalData.nome || 'Ponto do Google Maps',
      descricao: additionalData.descricao || `Importado de: ${googleMapsUrl}`,
      latitude: parseResult.latitude,
      longitude: parseResult.longitude,
      altitude: additionalData.altitude || 0,
      precisao: additionalData.precisao || 0,
      categoria: additionalData.categoria || 'POI',
      trilha_id: additionalData.trilha_id || '',
      foto_id: additionalData.foto_id || '',
      observacoes: additionalData.observacoes || '',
      origem: 'google_maps_link'
    };

    // Cria o ponto GPS
    const createResult = this.createGPSPoint(waypointData);

    if (createResult.success) {
      return {
        success: true,
        id: createResult.id,
        coordenadas: {
          latitude: parseResult.latitude,
          longitude: parseResult.longitude,
          formatted: parseResult.formatted
        },
        mensagem: 'Waypoint criado com sucesso a partir do link do Google Maps'
      };
    }

    return createResult;

  } catch (error) {
    Utils.logError('GPSService.createWaypointFromGoogleMapsLink', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Funções expostas para o frontend
 */
function apiCreateGPSPoint(data) {
  return GPSService.createGPSPoint(data);
}

function apiCreateWaypoint(data) {
  return GPSService.createWaypoint(data);
}

function apiCreateRoute(data) {
  return GPSService.createRoute(data);
}

function apiGetTrailWaypoints(trilhaId) {
  return GPSService.getTrailWaypoints(trilhaId);
}

function apiGetTrailGPSPoints(trilhaId) {
  return GPSService.getTrailGPSPoints(trilhaId);
}

function apiFindNearbyWaypoints(latitude, longitude, radiusKm) {
  return GPSService.findNearbyWaypoints(latitude, longitude, radiusKm);
}

function apiExportRouteToGPX(routeId) {
  return GPSService.exportToGPX(routeId);
}

/**
 * API: Extrai coordenadas de um link do Google Maps
 * @param {string} googleMapsUrl - URL do Google Maps
 * @returns {object} { success, latitude, longitude, formatted, error }
 */
function apiParseGoogleMapsLink(googleMapsUrl) {
  return GPSService.parseGoogleMapsLink(googleMapsUrl);
}

/**
 * API: Cria waypoint a partir de um link do Google Maps
 * @param {string} googleMapsUrl - URL do Google Maps
 * @param {object} additionalData - Dados adicionais (nome, descricao, categoria, etc.)
 * @returns {object} Resultado da criação
 */
function apiCreateWaypointFromGoogleMapsLink(googleMapsUrl, additionalData) {
  return GPSService.createWaypointFromGoogleMapsLink(googleMapsUrl, additionalData);
}

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Offline Sync (Prompt 29/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Cria múltiplos waypoints em lote
 * @param {Array} waypointsArray - Array de waypoints do cliente
 * @returns {object} Resultado com IDs criados, duplicatas e erros
 */
function apiWaypointsBatchCreate(waypointsArray) {
  return GPSService.batchCreateWaypoints(waypointsArray);
}

/**
 * API: Adiciona waypoints à fila de sincronização
 * @param {Array} waypointsArray - Array de waypoints
 * @returns {object} Resultado com IDs da fila
 */
function apiWaypointsQueueSync(waypointsArray) {
  return GPSService.queueWaypointsForSync(waypointsArray);
}

/**
 * API: Processa fila de sincronização de waypoints
 * @returns {object} Resultado do processamento
 */
function apiWaypointsProcessQueue() {
  return GPSService.processWaypointSyncQueue();
}

/**
 * API: Retorna categorias de waypoints disponíveis
 * @returns {object} Lista de categorias com ícones e cores
 */
function apiWaypointsGetCategories() {
  return GPSService.getWaypointCategories();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 34/30 (21/30): MAPA INTERATIVO DE TRILHAS E NAVEGAÇÃO
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Leaflet.js Map Integration
// - GeoJSON Specification (RFC 7946)
// - OpenStreetMap Trail Mapping Guidelines

/**
 * Tags de interesse para POIs
 */
const POI_INTEREST_TAGS = {
  OBSERVACAO_AVES: { tag: 'observacao_aves', nome: 'Observação de Aves', icone: '🦜', categoria: 'FAUNA' },
  CACHOEIRA: { tag: 'cachoeira', nome: 'Cachoeira', icone: '💧', categoria: 'AGUA' },
  MIRANTE: { tag: 'mirante', nome: 'Mirante', icone: '🏔️', categoria: 'MIRANTE' },
  FLORA_RARA: { tag: 'flora_rara', nome: 'Flora Rara', icone: '🌺', categoria: 'FLORA' },
  FAUNA_RARA: { tag: 'fauna_rara', nome: 'Fauna Rara', icone: '🦋', categoria: 'FAUNA' },
  HISTORICO: { tag: 'historico', nome: 'Ponto Histórico', icone: '🏛️', categoria: 'POI' },
  FOTOGRAFIA: { tag: 'fotografia', nome: 'Ponto Fotográfico', icone: '📸', categoria: 'MIRANTE' },
  MEDITACAO: { tag: 'meditacao', nome: 'Área de Meditação', icone: '🧘', categoria: 'DESCANSO' },
  NASCENTE: { tag: 'nascente', nome: 'Nascente', icone: '💦', categoria: 'AGUA' },
  ARVORE_NOTAVEL: { tag: 'arvore_notavel', nome: 'Árvore Notável', icone: '🌳', categoria: 'FLORA' }
};

// Adiciona ao GPSService
GPSService.POI_INTEREST_TAGS = POI_INTEREST_TAGS;


/**
 * Obtém dados completos de uma trilha para o mapa
 * Prompt 34/30: Mapa interativo
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Dados da trilha com waypoints e bounds
 */
GPSService.getTrailMapData = function(trilhaId) {
  try {
    if (!trilhaId) {
      return { success: false, error: 'trilhaId é obrigatório' };
    }

    // Busca dados da trilha
    let trilhaData = null;
    if (typeof DatabaseService !== 'undefined') {
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: trilhaId });
      if (trilha.success && trilha.data.length > 0) {
        trilhaData = trilha.data[0];
      }
    }

    if (!trilhaData) {
      return { success: false, error: 'Trilha não encontrada' };
    }

    // Busca waypoints da trilha
    const waypointsResult = this.getTrailWaypoints(trilhaId);
    const waypoints = waypointsResult.success ? waypointsResult.data : [];

    // Busca pontos GPS da trilha (para o traçado)
    const gpsPointsResult = this.getTrailGPSPoints(trilhaId);
    const gpsPoints = gpsPointsResult.success ? gpsPointsResult.data : [];

    // Calcula bounds (limites do mapa)
    let bounds = { north: -90, south: 90, east: -180, west: 180 };
    const allPoints = [...waypoints, ...gpsPoints];
    
    allPoints.forEach(p => {
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.north = Math.max(bounds.north, lat);
        bounds.south = Math.min(bounds.south, lat);
        bounds.east = Math.max(bounds.east, lng);
        bounds.west = Math.min(bounds.west, lng);
      }
    });

    // Calcula centro
    const center = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    };

    // Formata waypoints para o mapa
    const waypointsFormatted = waypoints.map(wp => {
      const categoria = WAYPOINT_CATEGORIES[wp.categoria] || WAYPOINT_CATEGORIES.POI;
      return {
        id: wp.id,
        nome: wp.nome,
        descricao: wp.descricao || '',
        lat: parseFloat(wp.latitude),
        lng: parseFloat(wp.longitude),
        categoria: wp.categoria || 'POI',
        categoria_info: categoria,
        tags: wp.tags ? wp.tags.split(',').map(t => t.trim()) : [],
        icone: categoria.icone,
        cor: categoria.cor,
        foto_url: wp.foto_ids || ''
      };
    });

    // Formata linha da trilha (GeoJSON LineString)
    const trailLine = gpsPoints.map(p => [
      parseFloat(p.longitude),
      parseFloat(p.latitude)
    ]).filter(c => !isNaN(c[0]) && !isNaN(c[1]));

    return {
      success: true,
      trilha: {
        id: trilhaId,
        nome: trilhaData.nome,
        descricao: trilhaData.descricao || '',
        distancia_km: parseFloat(trilhaData.distancia_km) || 0,
        dificuldade: trilhaData.dificuldade || 'Media',
        duracao_horas: parseFloat(trilhaData.tempo_visita_horas) || 2,
        status: trilhaData.status || 'Ativa'
      },
      waypoints: waypointsFormatted,
      total_waypoints: waypointsFormatted.length,
      trail_line: trailLine,
      bounds: bounds,
      center: center,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: trailLine },
            properties: { nome: trilhaData.nome, tipo: 'trilha' }
          },
          ...waypointsFormatted.map(wp => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
            properties: { id: wp.id, nome: wp.nome, categoria: wp.categoria }
          }))
        ]
      }
    };
  } catch (error) {
    Utils.logError('GPSService.getTrailMapData', error);
    return { success: false, error: error.toString() };
  }
};


/**
 * Obtém waypoints filtrados por categoria ou interesse
 * Prompt 34/30: Filtragem por interesses
 * @param {string} trilhaId - ID da trilha (opcional, null para todas)
 * @param {object} filtros - { categorias: [], tags: [], texto: '' }
 * @returns {object} Waypoints filtrados
 */
GPSService.getFilteredWaypoints = function(trilhaId, filtros = {}) {
  try {
    // Busca waypoints
    let waypointsResult;
    if (trilhaId) {
      waypointsResult = this.getTrailWaypoints(trilhaId);
    } else {
      waypointsResult = SheetsService.read(CONFIG.SHEETS.WAYPOINTS);
    }

    if (!waypointsResult.success) {
      return waypointsResult;
    }

    let waypoints = waypointsResult.data || [];

    // Filtra por categorias
    if (filtros.categorias && filtros.categorias.length > 0) {
      const cats = filtros.categorias.map(c => c.toUpperCase());
      waypoints = waypoints.filter(wp => 
        cats.includes((wp.categoria || 'POI').toUpperCase())
      );
    }

    // Filtra por tags de interesse
    if (filtros.tags && filtros.tags.length > 0) {
      const tagsLower = filtros.tags.map(t => t.toLowerCase());
      waypoints = waypoints.filter(wp => {
        const wpTags = wp.tags ? wp.tags.toLowerCase().split(',').map(t => t.trim()) : [];
        const wpDesc = (wp.descricao || '').toLowerCase();
        const wpNome = (wp.nome || '').toLowerCase();
        
        return tagsLower.some(tag => 
          wpTags.includes(tag) || wpDesc.includes(tag) || wpNome.includes(tag)
        );
      });
    }

    // Filtra por texto livre
    if (filtros.texto && filtros.texto.trim().length > 0) {
      const termo = filtros.texto.toLowerCase().trim();
      waypoints = waypoints.filter(wp => 
        (wp.nome || '').toLowerCase().includes(termo) ||
        (wp.descricao || '').toLowerCase().includes(termo)
      );
    }

    // Formata resultado
    const formatted = waypoints.map(wp => {
      const categoria = WAYPOINT_CATEGORIES[wp.categoria] || WAYPOINT_CATEGORIES.POI;
      return {
        id: wp.id,
        nome: wp.nome,
        descricao: wp.descricao || '',
        lat: parseFloat(wp.latitude),
        lng: parseFloat(wp.longitude),
        categoria: wp.categoria || 'POI',
        icone: categoria.icone,
        cor: categoria.cor,
        trilha_id: wp.trilha_id || ''
      };
    });

    return {
      success: true,
      filtros_aplicados: filtros,
      total: formatted.length,
      waypoints: formatted
    };
  } catch (error) {
    Utils.logError('GPSService.getFilteredWaypoints', error);
    return { success: false, error: error.toString() };
  }
};


/**
 * Obtém contexto de localização do usuário na trilha
 * Prompt 34/30: Localização do usuário em relação aos waypoints
 * @param {string} trilhaId - ID da trilha
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLng - Longitude do usuário
 * @returns {object} Contexto com distâncias e progresso
 */
GPSService.getUserLocationContext = function(trilhaId, userLat, userLng) {
  try {
    if (!userLat || !userLng) {
      return { success: false, error: 'Coordenadas do usuário são obrigatórias' };
    }

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // Obtém dados da trilha
    const trailData = this.getTrailMapData(trilhaId);
    if (!trailData.success) {
      return trailData;
    }

    // Calcula distância para cada waypoint
    const waypointsWithDistance = trailData.waypoints.map(wp => {
      const distKm = this.calculateDistance(lat, lng, wp.lat, wp.lng);
      const distM = Math.round(distKm * 1000);
      return {
        ...wp,
        distancia_km: parseFloat(distKm.toFixed(3)),
        distancia_m: distM,
        distancia_formatada: distM < 1000 ? `${distM}m` : `${distKm.toFixed(1)}km`
      };
    }).sort((a, b) => a.distancia_km - b.distancia_km);

    // Waypoint mais próximo
    const nearest = waypointsWithDistance.length > 0 ? waypointsWithDistance[0] : null;

    // Estima progresso na trilha (simplificado)
    let progressoPct = 0;
    if (trailData.trail_line && trailData.trail_line.length > 1) {
      // Encontra ponto mais próximo na linha da trilha
      let minDist = Infinity;
      let closestIdx = 0;
      
      trailData.trail_line.forEach((coord, idx) => {
        const dist = this.calculateDistance(lat, lng, coord[1], coord[0]);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });
      
      progressoPct = Math.round((closestIdx / (trailData.trail_line.length - 1)) * 100);
    }

    // Calcula distância restante estimada
    const distanciaTotal = trailData.trilha.distancia_km || 0;
    const distanciaRestante = distanciaTotal * (1 - progressoPct / 100);

    return {
      success: true,
      user_position: { lat, lng },
      trilha: {
        id: trilhaId,
        nome: trailData.trilha.nome,
        distancia_total_km: distanciaTotal
      },
      nearest_waypoint: nearest ? {
        id: nearest.id,
        nome: nearest.nome,
        distancia_m: nearest.distancia_m,
        distancia_formatada: nearest.distancia_formatada,
        categoria: nearest.categoria,
        icone: nearest.icone
      } : null,
      waypoints_by_distance: waypointsWithDistance.slice(0, 10),
      progresso: {
        percentual: progressoPct,
        distancia_percorrida_km: (distanciaTotal * progressoPct / 100).toFixed(2),
        distancia_restante_km: distanciaRestante.toFixed(2)
      },
      na_trilha: nearest && nearest.distancia_m < 100
    };
  } catch (error) {
    Utils.logError('GPSService.getUserLocationContext', error);
    return { success: false, error: error.toString() };
  }
};


/**
 * Encontra POI mais próximo de uma categoria
 * Prompt 34/30: Busca por interesse específico
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLng - Longitude do usuário
 * @param {string} categoria - Categoria do POI (opcional)
 * @param {string} tag - Tag de interesse (opcional)
 * @returns {object} POI mais próximo
 */
GPSService.getNearestPOI = function(userLat, userLng, categoria, tag) {
  try {
    if (!userLat || !userLng) {
      return { success: false, error: 'Coordenadas são obrigatórias' };
    }

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    // Busca waypoints filtrados
    const filtros = {};
    if (categoria) filtros.categorias = [categoria];
    if (tag) filtros.tags = [tag];

    const filtered = this.getFilteredWaypoints(null, filtros);
    if (!filtered.success || filtered.waypoints.length === 0) {
      return { 
        success: true, 
        found: false, 
        message: 'Nenhum POI encontrado com os critérios especificados' 
      };
    }

    // Calcula distâncias e encontra mais próximo
    let nearest = null;
    let minDist = Infinity;

    filtered.waypoints.forEach(wp => {
      const dist = this.calculateDistance(lat, lng, wp.lat, wp.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...wp, distancia_km: dist };
      }
    });

    if (!nearest) {
      return { success: true, found: false };
    }

    // Calcula direção aproximada
    const dLat = nearest.lat - lat;
    const dLng = nearest.lng - lng;
    let direcao = '';
    
    if (Math.abs(dLat) > Math.abs(dLng)) {
      direcao = dLat > 0 ? 'Norte' : 'Sul';
    } else {
      direcao = dLng > 0 ? 'Leste' : 'Oeste';
    }

    const distM = Math.round(minDist * 1000);

    return {
      success: true,
      found: true,
      poi: {
        id: nearest.id,
        nome: nearest.nome,
        descricao: nearest.descricao,
        lat: nearest.lat,
        lng: nearest.lng,
        categoria: nearest.categoria,
        icone: nearest.icone,
        cor: nearest.cor,
        trilha_id: nearest.trilha_id
      },
      distancia: {
        km: parseFloat(minDist.toFixed(3)),
        metros: distM,
        formatada: distM < 1000 ? `${distM}m` : `${minDist.toFixed(1)}km`
      },
      direcao: direcao,
      filtros_usados: { categoria, tag }
    };
  } catch (error) {
    Utils.logError('GPSService.getNearestPOI', error);
    return { success: false, error: error.toString() };
  }
};


/**
 * Obtém visão geral de todas as trilhas para o mapa
 * Prompt 34/30: Overview do mapa
 * @returns {object} Resumo de todas as trilhas
 */
GPSService.getAllTrailsOverview = function() {
  try {
    // Busca todas as trilhas
    let trilhas = [];
    if (typeof DatabaseService !== 'undefined') {
      const result = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
      if (result.success) {
        trilhas = result.data;
      }
    }

    if (trilhas.length === 0) {
      return { success: true, trilhas: [], total: 0 };
    }

    // Busca contagem de waypoints por trilha
    const waypointsResult = SheetsService.read(CONFIG.SHEETS.WAYPOINTS);
    const allWaypoints = waypointsResult.success ? waypointsResult.data : [];

    const waypointsByTrail = {};
    allWaypoints.forEach(wp => {
      const tid = wp.trilha_id || 'sem_trilha';
      waypointsByTrail[tid] = (waypointsByTrail[tid] || 0) + 1;
    });

    // Formata trilhas
    const trilhasFormatted = trilhas.map(t => {
      // Tenta extrair centro da trilha
      let center = null;
      if (t.coordenadas_poligono_json) {
        try {
          const coords = JSON.parse(t.coordenadas_poligono_json);
          if (coords && coords.length > 0) {
            const lats = coords.map(c => c[1] || c.lat);
            const lngs = coords.map(c => c[0] || c.lng);
            center = {
              lat: lats.reduce((a, b) => a + b, 0) / lats.length,
              lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
            };
          }
        } catch (e) {}
      }

      return {
        id: t.id,
        nome: t.nome,
        descricao: t.descricao || '',
        distancia_km: parseFloat(t.distancia_km) || 0,
        dificuldade: t.dificuldade || 'Media',
        duracao_horas: parseFloat(t.tempo_visita_horas) || 2,
        status: t.status || 'Ativa',
        num_waypoints: waypointsByTrail[t.id] || 0,
        center: center
      };
    });

    // Estatísticas gerais
    const stats = {
      total_trilhas: trilhasFormatted.length,
      total_waypoints: allWaypoints.length,
      distancia_total_km: trilhasFormatted.reduce((sum, t) => sum + t.distancia_km, 0),
      por_dificuldade: {}
    };

    trilhasFormatted.forEach(t => {
      stats.por_dificuldade[t.dificuldade] = (stats.por_dificuldade[t.dificuldade] || 0) + 1;
    });

    return {
      success: true,
      trilhas: trilhasFormatted,
      total: trilhasFormatted.length,
      estatisticas: stats
    };
  } catch (error) {
    Utils.logError('GPSService.getAllTrailsOverview', error);
    return { success: false, error: error.toString() };
  }
};


/**
 * Obtém lista de tags de interesse disponíveis
 * @returns {object} Tags de interesse
 */
GPSService.getInterestTags = function() {
  return {
    success: true,
    tags: Object.values(POI_INTEREST_TAGS),
    total: Object.keys(POI_INTEREST_TAGS).length
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Interactive Trail Map (Prompt 34/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém dados completos de uma trilha para o mapa
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Dados da trilha com waypoints, bounds e GeoJSON
 */
function apiMapaGetTrailData(trilhaId) {
  return GPSService.getTrailMapData(trilhaId);
}

/**
 * API: Obtém waypoints filtrados por categoria ou interesse
 * @param {string} trilhaId - ID da trilha (null para todas)
 * @param {object} filtros - { categorias: [], tags: [], texto: '' }
 * @returns {object} Waypoints filtrados
 */
function apiMapaGetWaypointsFiltered(trilhaId, filtros) {
  return GPSService.getFilteredWaypoints(trilhaId, filtros || {});
}

/**
 * API: Obtém contexto de localização do usuário na trilha
 * @param {string} trilhaId - ID da trilha
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLng - Longitude do usuário
 * @returns {object} Contexto com waypoint mais próximo e progresso
 */
function apiMapaGetUserContext(trilhaId, userLat, userLng) {
  return GPSService.getUserLocationContext(trilhaId, userLat, userLng);
}

/**
 * API: Encontra POI mais próximo de uma categoria/interesse
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLng - Longitude do usuário
 * @param {string} categoria - Categoria do POI (opcional)
 * @param {string} tag - Tag de interesse (opcional)
 * @returns {object} POI mais próximo com distância e direção
 */
function apiMapaGetNearestPOI(userLat, userLng, categoria, tag) {
  return GPSService.getNearestPOI(userLat, userLng, categoria, tag);
}

/**
 * API: Obtém visão geral de todas as trilhas para o mapa
 * @returns {object} Resumo de todas as trilhas com estatísticas
 */
function apiMapaGetAllTrailsOverview() {
  return GPSService.getAllTrailsOverview();
}

/**
 * API: Obtém lista de tags de interesse disponíveis
 * @returns {object} Tags de interesse com ícones
 */
function apiMapaGetInterestTags() {
  return GPSService.getInterestTags();
}
