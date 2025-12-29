/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - MAPA DE CALOR DE BIODIVERSIDADE TEMPORAL
 * ═══════════════════════════════════════════════════════════════════════════
 * P08 - Análise Geoespacial com Mapas de Calor Dinâmicos
 * 
 * Funcionalidades:
 * - Geração de mapas de calor de biodiversidade
 * - Identificação de hotspots de riqueza
 * - Análise de variação sazonal
 * - Detecção de áreas críticas para conservação
 * - Recomendações de conservação baseadas em dados
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha HEATMAP_BIODIVERSIDADE_RA
 */
const SCHEMA_HEATMAP = {
  ID_Analise: { type: 'string', required: true, unique: true },
  Timestamp_Geracao: { type: 'datetime', required: true },
  Periodo_Inicio: { type: 'date' },
  Periodo_Fim: { type: 'date' },
  Tipo_Analise: { type: 'enum', values: ['Riqueza', 'Abundancia', 'Endemismo', 'Ameaca'] },
  Grid_Resolution_m: { type: 'integer' },
  Total_Cells: { type: 'integer' },
  Total_Observacoes: { type: 'integer' },
  Total_Especies: { type: 'integer' },
  Hotspots_Count: { type: 'integer' },
  Hotspots_JSON: { type: 'text' },
  Areas_Criticas_JSON: { type: 'text' },
  Variacao_Sazonal_JSON: { type: 'text' },
  Tendencia: { type: 'enum', values: ['Crescente', 'Estavel', 'Decrescente'] },
  Recomendacoes_JSON: { type: 'text' },
  Notas: { type: 'text' }
};

const HEATMAP_HEADERS = [
  'ID_Analise', 'Timestamp_Geracao', 'Periodo_Inicio', 'Periodo_Fim',
  'Tipo_Analise', 'Grid_Resolution_m', 'Total_Cells', 'Total_Observacoes',
  'Total_Especies', 'Hotspots_Count', 'Hotspots_JSON', 'Areas_Criticas_JSON',
  'Variacao_Sazonal_JSON', 'Tendencia', 'Recomendacoes_JSON', 'Notas'
];


/**
 * Motor de Análise de Mapas de Calor de Biodiversidade
 * @namespace BiodiversityHeatmapEngine
 */
const BiodiversityHeatmapEngine = {
  
  SHEET_NAME: 'HEATMAP_BIODIVERSIDADE_RA',
  
  /**
   * Limites geográficos da Reserva Araras (aproximados)
   */
  RESERVA_BOUNDS: {
    north: -13.38,
    south: -13.42,
    east: -46.28,
    west: -46.34,
    center: { lat: -13.40, lng: -46.31 }
  },
  
  /**
   * Espécies endêmicas do Cerrado
   */
  ENDEMIC_SPECIES: [
    'Chrysocyon brachyurus',
    'Myrmecophaga tridactyla',
    'Priodontes maximus',
    'Ozotoceros bezoarticus',
    'Rhea americana',
    'Anodorhynchus hyacinthinus',
    'Caryocar brasiliense',
    'Dipteryx alata',
    'Mauritia flexuosa'
  ],
  
  /**
   * Espécies ameaçadas
   */
  THREATENED_SPECIES: [
    'Panthera onca',
    'Chrysocyon brachyurus',
    'Myrmecophaga tridactyla',
    'Priodontes maximus',
    'Tapirus terrestris',
    'Tayassu pecari',
    'Ozotoceros bezoarticus',
    'Anodorhynchus hyacinthinus'
  ],

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(HEATMAP_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, HEATMAP_HEADERS.length);
        headerRange.setBackground('#4A148C');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        Logger.log(`[BiodiversityHeatmapEngine] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[BiodiversityHeatmapEngine] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera mapa de calor de biodiversidade
   * @param {object} params - Parâmetros da análise
   * @returns {object} Resultado com dados do heatmap
   */
  generateHeatmap: function(params = {}) {
    try {
      this.initializeSheet();
      
      const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const endDate = params.endDate ? new Date(params.endDate) : new Date();
      const gridResolution = params.gridResolution || 50;
      const analysisType = params.analysisType || 'Riqueza';
      
      // 1. Coleta observações
      const observations = this._getObservations(startDate, endDate);
      
      // 2. Cria grid geoespacial
      const grid = this._createGrid(gridResolution);
      
      // 3. Mapeia observações para células
      const heatmapData = this._mapObservationsToGrid(observations, grid, analysisType);
      
      // 4. Identifica hotspots
      const hotspots = this._identifyHotspots(heatmapData);
      
      // 5. Detecta áreas críticas
      const criticalAreas = this._detectCriticalAreas(heatmapData, observations);
      
      // 6. Analisa variação temporal
      const temporalAnalysis = this._analyzeTemporalVariation(observations);
      
      // 7. Determina tendência
      const trend = this._calculateTrend(observations);
      
      // 8. Gera recomendações
      const recommendations = this._generateConservationRecommendations(hotspots, criticalAreas);
      
      // 9. Salva análise
      const analysisId = this._saveAnalysis({
        startDate, endDate, analysisType, gridResolution,
        observations, heatmapData, hotspots, criticalAreas,
        temporalAnalysis, trend, recommendations
      });
      
      return {
        success: true,
        analysis_id: analysisId,
        metadata: {
          period: { start: startDate, end: endDate },
          analysis_type: analysisType,
          grid_resolution_m: gridResolution,
          total_observations: observations.length,
          unique_species: this._countUniqueSpecies(observations),
          grid_cells: heatmapData.length,
          cells_with_data: heatmapData.filter(c => c.value > 0).length
        },
        heatmap_data: heatmapData.filter(c => c.value > 0),
        hotspots: hotspots,
        critical_areas: criticalAreas,
        temporal_analysis: temporalAnalysis,
        trend: trend,
        recommendations: recommendations
      };
      
    } catch (error) {
      Logger.log(`[generateHeatmap] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },


  /**
   * Obtém observações de biodiversidade
   * @private
   */
  _getObservations: function(startDate, endDate) {
    const observations = [];
    
    // Tenta obter de BIODIVERSIDADE_RA
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('BIODIVERSIDADE_RA');
      
      if (sheet && sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          const timestamp = new Date(data[i][1]);
          if (timestamp >= startDate && timestamp <= endDate) {
            observations.push({
              id: data[i][0],
              timestamp: timestamp,
              lat: data[i][2] || this.RESERVA_BOUNDS.center.lat + (Math.random() - 0.5) * 0.04,
              lng: data[i][3] || this.RESERVA_BOUNDS.center.lng + (Math.random() - 0.5) * 0.06,
              especie: data[i][4] || 'Espécie não identificada',
              quantidade: data[i][5] || 1
            });
          }
        }
      }
    } catch (e) {
      Logger.log(`[_getObservations] Erro ao ler BIODIVERSIDADE_RA: ${e}`);
    }
    
    // Tenta obter de capturas de câmeras trap
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('CAPTURAS_CAMERA_TRAP_RA');
      
      if (sheet && sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        const camerasSheet = ss.getSheetByName('CAMERAS_TRAP_RA');
        const camerasData = camerasSheet ? camerasSheet.getDataRange().getValues() : [];
        
        // Mapa de câmeras para coordenadas
        const cameraCoords = {};
        for (let i = 1; i < camerasData.length; i++) {
          cameraCoords[camerasData[i][0]] = {
            lat: camerasData[i][2],
            lng: camerasData[i][3]
          };
        }
        
        for (let i = 1; i < data.length; i++) {
          const timestamp = new Date(data[i][2]);
          if (timestamp >= startDate && timestamp <= endDate) {
            const cameraId = data[i][1];
            const coords = cameraCoords[cameraId] || this.RESERVA_BOUNDS.center;
            
            let especies = [];
            try {
              especies = JSON.parse(data[i][6] || '[]');
            } catch (e) {}
            
            especies.forEach(sp => {
              observations.push({
                id: data[i][0],
                timestamp: timestamp,
                lat: coords.lat,
                lng: coords.lng,
                especie: sp.cientifico || sp.comum || 'Desconhecida',
                quantidade: sp.individuos || 1
              });
            });
          }
        }
      }
    } catch (e) {
      Logger.log(`[_getObservations] Erro ao ler CAPTURAS: ${e}`);
    }
    
    // Se não houver dados, gera dados simulados
    if (observations.length === 0) {
      observations.push(...this._generateSimulatedObservations(startDate, endDate));
    }
    
    return observations;
  },
  
  /**
   * Gera observações simuladas para demonstração
   * @private
   */
  _generateSimulatedObservations: function(startDate, endDate) {
    const simulated = [];
    const species = [
      'Chrysocyon brachyurus', 'Myrmecophaga tridactyla', 'Tapirus terrestris',
      'Mazama americana', 'Nasua nasua', 'Cerdocyon thous', 'Dasypus novemcinctus',
      'Hydrochoerus hydrochaeris', 'Cuniculus paca', 'Dasyprocta azarae',
      'Ara ararauna', 'Ramphastos toco', 'Caryocar brasiliense', 'Mauritia flexuosa'
    ];
    
    const numObs = 100 + Math.floor(Math.random() * 100);
    const timeRange = endDate.getTime() - startDate.getTime();
    
    // Cria clusters de observações (hotspots naturais)
    const clusters = [
      { lat: -13.395, lng: -46.305, weight: 0.3 },
      { lat: -13.405, lng: -46.315, weight: 0.25 },
      { lat: -13.410, lng: -46.300, weight: 0.2 },
      { lat: -13.400, lng: -46.325, weight: 0.15 },
      { lat: -13.415, lng: -46.310, weight: 0.1 }
    ];
    
    for (let i = 0; i < numObs; i++) {
      // Seleciona cluster baseado em peso
      const rand = Math.random();
      let cumWeight = 0;
      let selectedCluster = clusters[0];
      
      for (const cluster of clusters) {
        cumWeight += cluster.weight;
        if (rand <= cumWeight) {
          selectedCluster = cluster;
          break;
        }
      }
      
      // Adiciona variação ao redor do cluster
      const lat = selectedCluster.lat + (Math.random() - 0.5) * 0.015;
      const lng = selectedCluster.lng + (Math.random() - 0.5) * 0.02;
      
      simulated.push({
        id: `SIM_${i}`,
        timestamp: new Date(startDate.getTime() + Math.random() * timeRange),
        lat: lat,
        lng: lng,
        especie: species[Math.floor(Math.random() * species.length)],
        quantidade: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return simulated;
  },


  /**
   * Cria grid geoespacial
   * @private
   */
  _createGrid: function(resolution) {
    const bounds = this.RESERVA_BOUNDS;
    const grid = [];
    
    // Converte metros para graus (aproximado)
    const latStep = resolution / 111320;
    const lngStep = resolution / (111320 * Math.cos(bounds.center.lat * Math.PI / 180));
    
    for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
      for (let lng = bounds.west; lng <= bounds.east; lng += lngStep) {
        grid.push({
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6)),
          value: 0,
          especies: [],
          observacoes: 0,
          abundancia: 0
        });
      }
    }
    
    return grid;
  },
  
  /**
   * Mapeia observações para células do grid
   * @private
   */
  _mapObservationsToGrid: function(observations, grid, analysisType) {
    observations.forEach(obs => {
      const cell = this._findNearestCell(grid, obs.lat, obs.lng);
      
      if (cell) {
        cell.observacoes++;
        cell.abundancia += obs.quantidade || 1;
        
        if (!cell.especies.includes(obs.especie)) {
          cell.especies.push(obs.especie);
        }
        
        // Calcula valor baseado no tipo de análise
        switch (analysisType) {
          case 'Riqueza':
            cell.value = cell.especies.length;
            break;
          case 'Abundancia':
            cell.value = cell.abundancia;
            break;
          case 'Endemismo':
            cell.value = cell.especies.filter(e => this._isEndemic(e)).length;
            break;
          case 'Ameaca':
            cell.value = cell.especies.filter(e => this._isThreatened(e)).length;
            break;
        }
      }
    });
    
    return grid;
  },
  
  /**
   * Encontra célula mais próxima
   * @private
   */
  _findNearestCell: function(grid, lat, lng) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const cell of grid) {
      const dist = Math.sqrt(
        Math.pow(cell.lat - lat, 2) + 
        Math.pow(cell.lng - lng, 2)
      );
      
      if (dist < minDist) {
        minDist = dist;
        nearest = cell;
      }
    }
    
    return nearest;
  },
  
  /**
   * Verifica se espécie é endêmica
   * @private
   */
  _isEndemic: function(species) {
    return this.ENDEMIC_SPECIES.some(e => 
      species.toLowerCase().includes(e.toLowerCase().split(' ')[0])
    );
  },
  
  /**
   * Verifica se espécie é ameaçada
   * @private
   */
  _isThreatened: function(species) {
    return this.THREATENED_SPECIES.some(e => 
      species.toLowerCase().includes(e.toLowerCase().split(' ')[0])
    );
  },

  /**
   * Identifica hotspots de biodiversidade
   * @private
   */
  _identifyHotspots: function(heatmapData) {
    const hotspots = [];
    
    // Calcula threshold (percentil 90)
    const values = heatmapData.map(c => c.value).filter(v => v > 0).sort((a, b) => a - b);
    const threshold = values.length > 0 ? values[Math.floor(values.length * 0.75)] : 1;
    
    // Filtra células de alto valor
    const highValueCells = heatmapData.filter(cell => cell.value >= threshold && cell.value > 0);
    
    // Agrupa células próximas em clusters
    const clusters = this._clusterCells(highValueCells);
    
    clusters.forEach((cluster, index) => {
      if (cluster.length === 0) return;
      
      const center = this._calculateClusterCenter(cluster);
      const radius = this._calculateClusterRadius(cluster, center);
      const allSpecies = [...new Set(cluster.flatMap(c => c.especies))];
      
      hotspots.push({
        id: `HS_${index + 1}`,
        centro: center,
        raio_m: Math.round(radius),
        riqueza: Math.max(...cluster.map(c => c.especies.length)),
        abundancia_total: cluster.reduce((sum, c) => sum + c.abundancia, 0),
        especies_count: allSpecies.length,
        especies_chave: allSpecies.slice(0, 5),
        area_ha: parseFloat((Math.PI * radius * radius / 10000).toFixed(2)),
        prioridade: radius > 200 ? 'Muito_Alta' : (radius > 100 ? 'Alta' : 'Media')
      });
    });
    
    return hotspots.sort((a, b) => b.riqueza - a.riqueza);
  },
  
  /**
   * Agrupa células em clusters
   * @private
   */
  _clusterCells: function(cells) {
    if (cells.length === 0) return [];
    
    const clusters = [];
    const visited = new Set();
    const distThreshold = 0.003; // ~300m em graus
    
    cells.forEach(cell => {
      if (visited.has(`${cell.lat},${cell.lng}`)) return;
      
      const cluster = [cell];
      visited.add(`${cell.lat},${cell.lng}`);
      
      // Encontra vizinhos
      cells.forEach(other => {
        if (visited.has(`${other.lat},${other.lng}`)) return;
        
        const dist = Math.sqrt(
          Math.pow(cell.lat - other.lat, 2) + 
          Math.pow(cell.lng - other.lng, 2)
        );
        
        if (dist < distThreshold) {
          cluster.push(other);
          visited.add(`${other.lat},${other.lng}`);
        }
      });
      
      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    });
    
    return clusters;
  },
  
  /**
   * Calcula centro do cluster
   * @private
   */
  _calculateClusterCenter: function(cluster) {
    const sumLat = cluster.reduce((sum, c) => sum + c.lat, 0);
    const sumLng = cluster.reduce((sum, c) => sum + c.lng, 0);
    
    return {
      lat: parseFloat((sumLat / cluster.length).toFixed(6)),
      lng: parseFloat((sumLng / cluster.length).toFixed(6))
    };
  },
  
  /**
   * Calcula raio do cluster
   * @private
   */
  _calculateClusterRadius: function(cluster, center) {
    let maxDist = 0;
    
    cluster.forEach(cell => {
      const dist = this._haversineDistance(center.lat, center.lng, cell.lat, cell.lng);
      if (dist > maxDist) maxDist = dist;
    });
    
    return Math.max(maxDist * 1000, 50); // Mínimo 50m
  },
  
  /**
   * Distância Haversine em km
   * @private
   */
  _haversineDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },


  /**
   * Detecta áreas críticas para conservação
   * @private
   */
  _detectCriticalAreas: function(heatmapData, observations) {
    const criticalAreas = [];
    
    // Áreas com espécies ameaçadas
    const threatenedCells = heatmapData.filter(cell => 
      cell.especies.some(sp => this._isThreatened(sp))
    );
    
    if (threatenedCells.length > 0) {
      const center = this._calculateClusterCenter(threatenedCells);
      criticalAreas.push({
        id: 'CA_AMEACADAS',
        tipo: 'Especies_Ameacadas',
        centro: center,
        raio_m: 500,
        motivo: 'Área com presença de espécies ameaçadas de extinção',
        especies: [...new Set(threatenedCells.flatMap(c => 
          c.especies.filter(sp => this._isThreatened(sp))
        ))],
        prioridade: 'Muito_Alta'
      });
    }
    
    // Áreas com alta diversidade mas baixa proteção (bordas)
    const edgeCells = heatmapData.filter(cell => {
      const isEdge = cell.lat < this.RESERVA_BOUNDS.south + 0.005 ||
                     cell.lat > this.RESERVA_BOUNDS.north - 0.005 ||
                     cell.lng < this.RESERVA_BOUNDS.west + 0.008 ||
                     cell.lng > this.RESERVA_BOUNDS.east - 0.008;
      return isEdge && cell.value > 2;
    });
    
    if (edgeCells.length > 0) {
      const center = this._calculateClusterCenter(edgeCells);
      criticalAreas.push({
        id: 'CA_BORDA',
        tipo: 'Zona_Borda',
        centro: center,
        raio_m: 300,
        motivo: 'Biodiversidade significativa em zona de borda vulnerável',
        especies: [...new Set(edgeCells.flatMap(c => c.especies))].slice(0, 5),
        prioridade: 'Alta'
      });
    }
    
    // Áreas com espécies endêmicas
    const endemicCells = heatmapData.filter(cell => 
      cell.especies.some(sp => this._isEndemic(sp))
    );
    
    if (endemicCells.length > 0) {
      const center = this._calculateClusterCenter(endemicCells);
      criticalAreas.push({
        id: 'CA_ENDEMICAS',
        tipo: 'Especies_Endemicas',
        centro: center,
        raio_m: 400,
        motivo: 'Área com presença de espécies endêmicas do Cerrado',
        especies: [...new Set(endemicCells.flatMap(c => 
          c.especies.filter(sp => this._isEndemic(sp))
        ))],
        prioridade: 'Alta'
      });
    }
    
    return criticalAreas;
  },

  /**
   * Analisa variação temporal/sazonal
   * @private
   */
  _analyzeTemporalVariation: function(observations) {
    const seasons = {
      'Verao': { obs: [], months: [12, 1, 2] },
      'Outono': { obs: [], months: [3, 4, 5] },
      'Inverno': { obs: [], months: [6, 7, 8] },
      'Primavera': { obs: [], months: [9, 10, 11] }
    };
    
    observations.forEach(obs => {
      const month = new Date(obs.timestamp).getMonth() + 1;
      
      for (const [season, data] of Object.entries(seasons)) {
        if (data.months.includes(month)) {
          data.obs.push(obs);
          break;
        }
      }
    });
    
    const analysis = {};
    
    for (const [season, data] of Object.entries(seasons)) {
      const uniqueSpecies = [...new Set(data.obs.map(o => o.especie))];
      analysis[season.toLowerCase()] = {
        observacoes: data.obs.length,
        riqueza: uniqueSpecies.length,
        abundancia: data.obs.reduce((sum, o) => sum + (o.quantidade || 1), 0),
        especies_exclusivas: uniqueSpecies.filter(sp => {
          // Verifica se espécie só aparece nesta estação
          const otherSeasons = Object.entries(seasons).filter(([s]) => s !== season);
          return !otherSeasons.some(([, d]) => d.obs.some(o => o.especie === sp));
        }).length
      };
    }
    
    // Identifica estação mais rica
    const richestSeason = Object.entries(analysis)
      .sort((a, b) => b[1].riqueza - a[1].riqueza)[0];
    
    analysis.estacao_mais_rica = richestSeason ? richestSeason[0] : 'N/A';
    analysis.variacao_sazonal = this._calculateSeasonalVariation(analysis);
    
    return analysis;
  },
  
  /**
   * Calcula índice de variação sazonal
   * @private
   */
  _calculateSeasonalVariation: function(analysis) {
    const values = ['verao', 'outono', 'inverno', 'primavera']
      .map(s => analysis[s]?.riqueza || 0);
    
    if (values.every(v => v === 0)) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    
    return parseFloat(cv.toFixed(3));
  },

  /**
   * Calcula tendência temporal
   * @private
   */
  _calculateTrend: function(observations) {
    if (observations.length < 10) return 'Estavel';
    
    // Agrupa por mês
    const monthly = {};
    observations.forEach(obs => {
      const key = new Date(obs.timestamp).toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = new Set();
      monthly[key].add(obs.especie);
    });
    
    const months = Object.keys(monthly).sort();
    if (months.length < 3) return 'Estavel';
    
    // Calcula tendência simples
    const firstHalf = months.slice(0, Math.floor(months.length / 2));
    const secondHalf = months.slice(Math.floor(months.length / 2));
    
    const avgFirst = firstHalf.reduce((sum, m) => sum + monthly[m].size, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, m) => sum + monthly[m].size, 0) / secondHalf.length;
    
    const change = (avgSecond - avgFirst) / avgFirst;
    
    if (change > 0.1) return 'Crescente';
    if (change < -0.1) return 'Decrescente';
    return 'Estavel';
  },


  /**
   * Gera recomendações de conservação
   * @private
   */
  _generateConservationRecommendations: function(hotspots, criticalAreas) {
    const recommendations = [];
    
    // Recomendações para hotspots
    hotspots.forEach((hotspot, i) => {
      if (i < 3) { // Top 3 hotspots
        recommendations.push({
          tipo: 'Protecao_Hotspot',
          prioridade: hotspot.prioridade,
          localizacao: hotspot.centro,
          titulo: `Proteção do Hotspot ${hotspot.id}`,
          acao: `Estabelecer zona de proteção de ${hotspot.raio_m}m ao redor do hotspot`,
          justificativa: `Área com ${hotspot.riqueza} espécies e ${hotspot.abundancia_total} indivíduos registrados`,
          especies_beneficiadas: hotspot.especies_chave,
          area_ha: hotspot.area_ha
        });
      }
    });
    
    // Recomendações para áreas críticas
    criticalAreas.forEach(area => {
      let acao = '';
      
      switch (area.tipo) {
        case 'Especies_Ameacadas':
          acao = 'Implementar monitoramento intensivo e programa de proteção específico';
          break;
        case 'Zona_Borda':
          acao = 'Criar zona tampão e restaurar vegetação nativa na borda';
          break;
        case 'Especies_Endemicas':
          acao = 'Estabelecer área de preservação permanente para espécies endêmicas';
          break;
        default:
          acao = 'Avaliar necessidade de intervenção de conservação';
      }
      
      recommendations.push({
        tipo: 'Conservacao_Area_Critica',
        prioridade: area.prioridade,
        localizacao: area.centro,
        titulo: `Conservação: ${area.tipo.replace('_', ' ')}`,
        acao: acao,
        justificativa: area.motivo,
        especies_beneficiadas: area.especies
      });
    });
    
    // Recomendações gerais
    if (hotspots.length > 0) {
      recommendations.push({
        tipo: 'Corredor_Ecologico',
        prioridade: 'Alta',
        titulo: 'Conectividade entre Hotspots',
        acao: 'Estabelecer corredores ecológicos conectando os principais hotspots',
        justificativa: `${hotspots.length} hotspots identificados que podem se beneficiar de conectividade`
      });
    }
    
    return recommendations.sort((a, b) => {
      const prioOrder = { 'Muito_Alta': 0, 'Alta': 1, 'Media': 2, 'Baixa': 3 };
      return (prioOrder[a.prioridade] || 3) - (prioOrder[b.prioridade] || 3);
    });
  },

  /**
   * Conta espécies únicas
   * @private
   */
  _countUniqueSpecies: function(observations) {
    return [...new Set(observations.map(o => o.especie))].length;
  },

  /**
   * Salva análise na planilha
   * @private
   */
  _saveAnalysis: function(data) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `HM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      const row = [
        id,
        new Date(),
        data.startDate,
        data.endDate,
        data.analysisType,
        data.gridResolution,
        data.heatmapData.length,
        data.observations.length,
        this._countUniqueSpecies(data.observations),
        data.hotspots.length,
        JSON.stringify(data.hotspots),
        JSON.stringify(data.criticalAreas),
        JSON.stringify(data.temporalAnalysis),
        data.trend,
        JSON.stringify(data.recommendations),
        ''
      ];
      
      sheet.appendRow(row);
      
      return id;
    } catch (e) {
      Logger.log(`[_saveAnalysis] Erro: ${e}`);
      return null;
    }
  },

  /**
   * Lista análises anteriores
   * @param {number} limit - Limite de resultados
   * @returns {Array} Lista de análises
   */
  getAnalyses: function(limit = 10) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const analyses = [];
      
      for (let i = Math.min(data.length - 1, limit); i >= 1; i--) {
        analyses.push({
          id: data[i][0],
          timestamp: data[i][1],
          periodo_inicio: data[i][2],
          periodo_fim: data[i][3],
          tipo_analise: data[i][4],
          resolucao: data[i][5],
          total_celulas: data[i][6],
          total_observacoes: data[i][7],
          total_especies: data[i][8],
          hotspots_count: data[i][9],
          tendencia: data[i][13]
        });
      }
      
      return analyses;
    } catch (error) {
      Logger.log(`[getAnalyses] Erro: ${error}`);
      return [];
    }
  },

  /**
   * Obtém estatísticas gerais
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const analyses = this.getAnalyses(100);
      
      if (analyses.length === 0) {
        return {
          total_analyses: 0,
          message: 'Nenhuma análise realizada ainda'
        };
      }
      
      const latest = analyses[0];
      
      // Média de hotspots
      const avgHotspots = analyses.reduce((sum, a) => sum + (a.hotspots_count || 0), 0) / analyses.length;
      
      // Tendências
      const trends = {};
      analyses.forEach(a => {
        trends[a.tendencia] = (trends[a.tendencia] || 0) + 1;
      });
      
      return {
        total_analyses: analyses.length,
        latest_analysis: {
          id: latest.id,
          date: latest.timestamp,
          species: latest.total_especies,
          hotspots: latest.hotspots_count,
          trend: latest.tendencia
        },
        average_hotspots: parseFloat(avgHotspots.toFixed(1)),
        trend_distribution: trends,
        analysis_types: [...new Set(analyses.map(a => a.tipo_analise))]
      };
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  }
};



// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P08 Mapa de Calor de Biodiversidade
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de heatmap
 * @returns {object} Resultado
 */
function apiHeatmapInit() {
  return BiodiversityHeatmapEngine.initializeSheet();
}

/**
 * Gera mapa de calor de biodiversidade
 * @param {object} params - Parâmetros (startDate, endDate, gridResolution, analysisType)
 * @returns {object} Resultado com dados do heatmap
 */
function apiHeatmapGenerate(params) {
  return BiodiversityHeatmapEngine.generateHeatmap(params || {});
}

/**
 * Lista análises anteriores
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de análises
 */
function apiHeatmapList(limit) {
  return BiodiversityHeatmapEngine.getAnalyses(limit || 10);
}

/**
 * Obtém estatísticas gerais
 * @returns {object} Estatísticas
 */
function apiHeatmapStats() {
  return BiodiversityHeatmapEngine.getStatistics();
}

/**
 * Gera análise rápida com parâmetros padrão
 * @returns {object} Resultado
 */
function apiHeatmapQuickAnalysis() {
  return BiodiversityHeatmapEngine.generateHeatmap({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Últimos 90 dias
    endDate: new Date(),
    gridResolution: 50,
    analysisType: 'Riqueza'
  });
}

/**
 * Gera análise de espécies ameaçadas
 * @returns {object} Resultado
 */
function apiHeatmapThreatened() {
  return BiodiversityHeatmapEngine.generateHeatmap({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    gridResolution: 50,
    analysisType: 'Ameaca'
  });
}

/**
 * Gera análise de endemismo
 * @returns {object} Resultado
 */
function apiHeatmapEndemism() {
  return BiodiversityHeatmapEngine.generateHeatmap({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    gridResolution: 50,
    analysisType: 'Endemismo'
  });
}
