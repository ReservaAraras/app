/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE CONECTIVIDADE DE HABITAT COM GRAFOS
 * ═══════════════════════════════════════════════════════════════════════════
 * P23 - Análise de Conectividade Estrutural e Funcional
 * 
 * Funcionalidades:
 * - Modelagem de rede de habitats como grafo
 * - Cálculo de métricas de conectividade (IIC, PC, BC)
 * - Identificação de pontos críticos (stepping stones)
 * - Simulação de cenários de restauração
 * - Integração com P04 (corredores ecológicos)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha FRAGMENTOS_HABITAT_RA
 */
const SCHEMA_FRAGMENTOS = {
  ID_Fragmento: { type: 'string', required: true, unique: true },
  Nome: { type: 'string' },
  Latitude: { type: 'float' },
  Longitude: { type: 'float' },
  Area_ha: { type: 'float', min: 0 },
  Perimetro_m: { type: 'float', min: 0 },
  Tipo_Vegetacao: { type: 'string' },
  Qualidade_Habitat: { type: 'enum', values: ['Alta', 'Media', 'Baixa'] },
  Indice_Forma: { type: 'float' },
  Conectividade_Local: { type: 'float' },
  Centralidade: { type: 'float' },
  E_Stepping_Stone: { type: 'boolean' },
  Fragmentos_Conectados: { type: 'text' },
  Data_Cadastro: { type: 'date' }
};

const FRAGMENTOS_HEADERS = [
  'ID_Fragmento', 'Nome', 'Latitude', 'Longitude', 'Area_ha', 'Perimetro_m',
  'Tipo_Vegetacao', 'Qualidade_Habitat', 'Indice_Forma', 'Conectividade_Local',
  'Centralidade', 'E_Stepping_Stone', 'Fragmentos_Conectados', 'Data_Cadastro'
];

const CONEXOES_HEADERS = [
  'ID_Conexao', 'Fragmento_Origem', 'Fragmento_Destino', 'Distancia_m',
  'Tipo_Conexao', 'Resistencia', 'Probabilidade_Dispersao', 'Existe_Corredor'
];


/**
 * Sistema de Análise de Conectividade de Habitat
 * @namespace HabitatConnectivity
 */
const HabitatConnectivity = {
  
  SHEET_FRAGMENTOS: 'FRAGMENTOS_HABITAT_RA',
  SHEET_CONEXOES: 'CONEXOES_HABITAT_RA',
  
  /**
   * Distância máxima de dispersão por tipo de organismo (metros)
   */
  DISPERSAL_DISTANCES: {
    'aves_pequenas': 500,
    'aves_medias': 2000,
    'aves_grandes': 5000,
    'mamiferos_pequenos': 200,
    'mamiferos_medios': 1000,
    'mamiferos_grandes': 3000,
    'sementes_vento': 100,
    'sementes_animais': 1000,
    'default': 1000
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de fragmentos
      let sheetFrag = ss.getSheetByName(this.SHEET_FRAGMENTOS);
      if (!sheetFrag) {
        sheetFrag = ss.insertSheet(this.SHEET_FRAGMENTOS);
        sheetFrag.appendRow(FRAGMENTOS_HEADERS);
        const headerRange = sheetFrag.getRange(1, 1, 1, FRAGMENTOS_HEADERS.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetFrag.setFrozenRows(1);
      }
      
      // Planilha de conexões
      let sheetCon = ss.getSheetByName(this.SHEET_CONEXOES);
      if (!sheetCon) {
        sheetCon = ss.insertSheet(this.SHEET_CONEXOES);
        sheetCon.appendRow(CONEXOES_HEADERS);
        const headerRange = sheetCon.getRange(1, 1, 1, CONEXOES_HEADERS.length);
        headerRange.setBackground('#1B5E20');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetCon.setFrozenRows(1);
      }
      
      return { success: true, sheets: [this.SHEET_FRAGMENTOS, this.SHEET_CONEXOES] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Cadastra fragmento de habitat
   */
  registerFragment: function(fragmentData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_FRAGMENTOS);
      
      const fragId = fragmentData.id || `FRAG-${Date.now().toString(36).toUpperCase()}`;
      
      // Calcula índice de forma (quanto mais próximo de 1, mais circular)
      const indiceForma = fragmentData.area_ha && fragmentData.perimetro_m 
        ? this._calculateShapeIndex(fragmentData.area_ha, fragmentData.perimetro_m)
        : 1;
      
      const row = [
        fragId,
        fragmentData.nome || `Fragmento ${fragId}`,
        fragmentData.latitude || '',
        fragmentData.longitude || '',
        fragmentData.area_ha || 0,
        fragmentData.perimetro_m || 0,
        fragmentData.tipo_vegetacao || 'Cerrado',
        fragmentData.qualidade || 'Media',
        indiceForma,
        0, // Conectividade local (calculada depois)
        0, // Centralidade (calculada depois)
        false, // É stepping stone (calculado depois)
        '', // Fragmentos conectados
        new Date().toISOString().split('T')[0]
      ];
      
      sheet.appendRow(row);
      
      return { success: true, fragment_id: fragId, indice_forma: indiceForma };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula índice de forma (Shape Index)
   * @private
   */
  _calculateShapeIndex: function(areaHa, perimetroM) {
    // SI = P / (2 * sqrt(π * A))
    // Onde P = perímetro, A = área
    const areaM2 = areaHa * 10000;
    const circlePerimeter = 2 * Math.sqrt(Math.PI * areaM2);
    return Math.round(perimetroM / circlePerimeter * 100) / 100;
  },

  /**
   * Lista fragmentos cadastrados
   */
  listFragments: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_FRAGMENTOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, fragments: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const fragments = [];
      
      for (let i = 1; i < data.length; i++) {
        fragments.push({
          id: data[i][0],
          nome: data[i][1],
          latitude: data[i][2],
          longitude: data[i][3],
          area_ha: data[i][4],
          perimetro_m: data[i][5],
          tipo_vegetacao: data[i][6],
          qualidade: data[i][7],
          indice_forma: data[i][8],
          conectividade_local: data[i][9],
          centralidade: data[i][10],
          e_stepping_stone: data[i][11],
          fragmentos_conectados: data[i][12]
        });
      }
      
      return { success: true, fragments: fragments, count: fragments.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Constrói grafo de conectividade
   */
  buildConnectivityGraph: function(dispersalType = 'default') {
    try {
      const fragmentsResult = this.listFragments();
      if (!fragmentsResult.success || fragmentsResult.count < 2) {
        return { success: false, error: 'Necessário pelo menos 2 fragmentos' };
      }
      
      const fragments = fragmentsResult.fragments;
      const maxDistance = this.DISPERSAL_DISTANCES[dispersalType] || this.DISPERSAL_DISTANCES.default;
      
      // Constrói matriz de adjacência
      const nodes = [];
      const edges = [];
      const adjacencyMatrix = [];
      
      fragments.forEach((frag, i) => {
        nodes.push({
          id: frag.id,
          nome: frag.nome,
          area: frag.area_ha,
          qualidade: frag.qualidade,
          lat: frag.latitude,
          lng: frag.longitude
        });
        
        adjacencyMatrix[i] = [];
        
        fragments.forEach((other, j) => {
          if (i === j) {
            adjacencyMatrix[i][j] = 0;
            return;
          }
          
          const distance = this._calculateDistance(
            frag.latitude, frag.longitude,
            other.latitude, other.longitude
          );
          
          if (distance <= maxDistance) {
            // Probabilidade de dispersão baseada na distância
            const probability = this._calculateDispersalProbability(distance, maxDistance);
            
            adjacencyMatrix[i][j] = probability;
            
            if (i < j) { // Evita duplicatas
              edges.push({
                source: frag.id,
                target: other.id,
                distance: Math.round(distance),
                probability: probability
              });
            }
          } else {
            adjacencyMatrix[i][j] = 0;
          }
        });
      });
      
      // Salva conexões
      this._saveConnections(edges);
      
      return {
        success: true,
        graph: {
          nodes: nodes,
          edges: edges,
          node_count: nodes.length,
          edge_count: edges.length,
          dispersal_type: dispersalType,
          max_distance: maxDistance
        },
        adjacency_matrix: adjacencyMatrix
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula distância entre dois pontos (Haversine)
   * @private
   */
  _calculateDistance: function(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Calcula probabilidade de dispersão
   * @private
   */
  _calculateDispersalProbability: function(distance, maxDistance) {
    // Função exponencial negativa
    const alpha = 2 / maxDistance; // Taxa de decaimento
    const prob = Math.exp(-alpha * distance);
    return Math.round(prob * 1000) / 1000;
  },

  /**
   * Salva conexões na planilha
   * @private
   */
  _saveConnections: function(edges) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CONEXOES);
      
      // Limpa conexões anteriores
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      
      edges.forEach((edge, i) => {
        const row = [
          `CON-${i + 1}`,
          edge.source,
          edge.target,
          edge.distance,
          'Potencial',
          1 - edge.probability, // Resistência
          edge.probability,
          false
        ];
        sheet.appendRow(row);
      });
    } catch (error) {
      Logger.log(`[_saveConnections] Erro: ${error}`);
    }
  },


  /**
   * Calcula métricas de conectividade
   */
  calculateConnectivityMetrics: function(dispersalType = 'default') {
    try {
      const graphResult = this.buildConnectivityGraph(dispersalType);
      if (!graphResult.success) return graphResult;
      
      const { nodes, edges, adjacency_matrix } = graphResult.graph;
      const matrix = graphResult.adjacency_matrix;
      const n = nodes.length;
      
      // 1. Índice Integral de Conectividade (IIC)
      const iic = this._calculateIIC(nodes, matrix);
      
      // 2. Probabilidade de Conectividade (PC)
      const pc = this._calculatePC(nodes, matrix);
      
      // 3. Centralidade de intermediação (Betweenness)
      const betweenness = this._calculateBetweenness(matrix, n);
      
      // 4. Grau de cada nó
      const degrees = this._calculateDegrees(matrix, n);
      
      // 5. Identifica stepping stones
      const steppingStones = this._identifySteppingStones(nodes, betweenness, degrees);
      
      // 6. Componentes conectados
      const components = this._findConnectedComponents(matrix, n);
      
      // Atualiza fragmentos com métricas
      this._updateFragmentMetrics(nodes, betweenness, degrees, steppingStones);
      
      return {
        success: true,
        metrics: {
          iic: iic,
          pc: pc,
          total_nodes: n,
          total_edges: edges.length,
          connected_components: components.count,
          largest_component_size: components.largest,
          avg_degree: this._average(degrees),
          max_degree: Math.max(...degrees),
          network_density: (2 * edges.length) / (n * (n - 1))
        },
        node_metrics: nodes.map((node, i) => ({
          id: node.id,
          nome: node.nome,
          degree: degrees[i],
          betweenness: betweenness[i],
          is_stepping_stone: steppingStones.includes(node.id)
        })),
        stepping_stones: steppingStones,
        critical_connections: this._identifyCriticalConnections(edges, betweenness, nodes)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula Índice Integral de Conectividade (IIC)
   * @private
   */
  _calculateIIC: function(nodes, matrix) {
    const n = nodes.length;
    let sum = 0;
    const totalArea = nodes.reduce((s, node) => s + (node.area || 1), 0);
    
    // Calcula caminhos mínimos
    const distances = this._floydWarshall(matrix, n);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const ai = nodes[i].area || 1;
        const aj = nodes[j].area || 1;
        const nlij = distances[i][j]; // Número de links no caminho mínimo
        
        if (nlij < Infinity) {
          sum += (ai * aj) / (1 + nlij);
        }
      }
    }
    
    const iic = sum / (totalArea * totalArea);
    return Math.round(iic * 10000) / 10000;
  },

  /**
   * Calcula Probabilidade de Conectividade (PC)
   * @private
   */
  _calculatePC: function(nodes, matrix) {
    const n = nodes.length;
    let sum = 0;
    const totalArea = nodes.reduce((s, node) => s + (node.area || 1), 0);
    
    // Calcula produto máximo de probabilidades
    const maxProb = this._maxProbabilityPaths(matrix, n);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const ai = nodes[i].area || 1;
        const aj = nodes[j].area || 1;
        const pij = maxProb[i][j];
        
        sum += ai * aj * pij;
      }
    }
    
    const pc = sum / (totalArea * totalArea);
    return Math.round(pc * 10000) / 10000;
  },

  /**
   * Floyd-Warshall para caminhos mínimos
   * @private
   */
  _floydWarshall: function(matrix, n) {
    const dist = [];
    
    // Inicializa
    for (let i = 0; i < n; i++) {
      dist[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) dist[i][j] = 0;
        else if (matrix[i][j] > 0) dist[i][j] = 1;
        else dist[i][j] = Infinity;
      }
    }
    
    // Floyd-Warshall
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }
    
    return dist;
  },

  /**
   * Calcula caminhos de máxima probabilidade
   * @private
   */
  _maxProbabilityPaths: function(matrix, n) {
    const prob = [];
    
    // Inicializa
    for (let i = 0; i < n; i++) {
      prob[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) prob[i][j] = 1;
        else prob[i][j] = matrix[i][j];
      }
    }
    
    // Modificação de Floyd-Warshall para probabilidades
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const throughK = prob[i][k] * prob[k][j];
          if (throughK > prob[i][j]) {
            prob[i][j] = throughK;
          }
        }
      }
    }
    
    return prob;
  },

  /**
   * Calcula centralidade de intermediação
   * @private
   */
  _calculateBetweenness: function(matrix, n) {
    const betweenness = new Array(n).fill(0);
    
    for (let s = 0; s < n; s++) {
      // BFS para encontrar caminhos mínimos
      const dist = new Array(n).fill(Infinity);
      const sigma = new Array(n).fill(0);
      const pred = [];
      for (let i = 0; i < n; i++) pred[i] = [];
      
      dist[s] = 0;
      sigma[s] = 1;
      const queue = [s];
      const stack = [];
      
      while (queue.length > 0) {
        const v = queue.shift();
        stack.push(v);
        
        for (let w = 0; w < n; w++) {
          if (matrix[v][w] > 0) {
            if (dist[w] === Infinity) {
              dist[w] = dist[v] + 1;
              queue.push(w);
            }
            if (dist[w] === dist[v] + 1) {
              sigma[w] += sigma[v];
              pred[w].push(v);
            }
          }
        }
      }
      
      // Acumula
      const delta = new Array(n).fill(0);
      while (stack.length > 0) {
        const w = stack.pop();
        for (const v of pred[w]) {
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
        if (w !== s) {
          betweenness[w] += delta[w];
        }
      }
    }
    
    // Normaliza
    const maxBet = Math.max(...betweenness) || 1;
    return betweenness.map(b => Math.round(b / maxBet * 100) / 100);
  },

  /**
   * Calcula grau de cada nó
   * @private
   */
  _calculateDegrees: function(matrix, n) {
    const degrees = [];
    for (let i = 0; i < n; i++) {
      let degree = 0;
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] > 0) degree++;
      }
      degrees.push(degree);
    }
    return degrees;
  },

  /**
   * Identifica stepping stones
   * @private
   */
  _identifySteppingStones: function(nodes, betweenness, degrees) {
    const steppingStones = [];
    const avgBetweenness = this._average(betweenness);
    const avgDegree = this._average(degrees);
    
    nodes.forEach((node, i) => {
      // Stepping stone: alta centralidade E grau >= 2
      if (betweenness[i] > avgBetweenness && degrees[i] >= 2) {
        steppingStones.push(node.id);
      }
    });
    
    return steppingStones;
  },

  /**
   * Encontra componentes conectados
   * @private
   */
  _findConnectedComponents: function(matrix, n) {
    const visited = new Array(n).fill(false);
    const components = [];
    
    const dfs = (node, component) => {
      visited[node] = true;
      component.push(node);
      for (let i = 0; i < n; i++) {
        if (matrix[node][i] > 0 && !visited[i]) {
          dfs(i, component);
        }
      }
    };
    
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const component = [];
        dfs(i, component);
        components.push(component);
      }
    }
    
    return {
      count: components.length,
      largest: Math.max(...components.map(c => c.length)),
      sizes: components.map(c => c.length)
    };
  },

  /**
   * Identifica conexões críticas
   * @private
   */
  _identifyCriticalConnections: function(edges, betweenness, nodes) {
    return edges
      .map(edge => {
        const sourceIdx = nodes.findIndex(n => n.id === edge.source);
        const targetIdx = nodes.findIndex(n => n.id === edge.target);
        const avgBetweenness = (betweenness[sourceIdx] + betweenness[targetIdx]) / 2;
        
        return {
          ...edge,
          criticality: avgBetweenness,
          priority: avgBetweenness > 0.5 ? 'Alta' : avgBetweenness > 0.25 ? 'Media' : 'Baixa'
        };
      })
      .sort((a, b) => b.criticality - a.criticality)
      .slice(0, 10);
  },

  /**
   * Atualiza métricas dos fragmentos
   * @private
   */
  _updateFragmentMetrics: function(nodes, betweenness, degrees, steppingStones) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_FRAGMENTOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const fragId = data[i][0];
        const nodeIdx = nodes.findIndex(n => n.id === fragId);
        
        if (nodeIdx >= 0) {
          sheet.getRange(i + 1, 10).setValue(degrees[nodeIdx]); // Conectividade local
          sheet.getRange(i + 1, 11).setValue(betweenness[nodeIdx]); // Centralidade
          sheet.getRange(i + 1, 12).setValue(steppingStones.includes(fragId)); // É stepping stone
        }
      }
    } catch (error) {
      Logger.log(`[_updateFragmentMetrics] Erro: ${error}`);
    }
  },

  /**
   * Calcula média
   * @private
   */
  _average: function(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  },

  /**
   * Simula cenário de restauração
   */
  simulateRestoration: function(newFragments) {
    try {
      // Salva estado atual
      const currentMetrics = this.calculateConnectivityMetrics();
      if (!currentMetrics.success) return currentMetrics;
      
      // Adiciona fragmentos temporários
      newFragments.forEach(frag => {
        this.registerFragment(frag);
      });
      
      // Recalcula métricas
      const newMetrics = this.calculateConnectivityMetrics();
      
      // Remove fragmentos temporários (em produção, seria mais sofisticado)
      
      // Calcula impacto
      const impact = {
        iic_change: newMetrics.metrics.iic - currentMetrics.metrics.iic,
        iic_change_percent: ((newMetrics.metrics.iic - currentMetrics.metrics.iic) / currentMetrics.metrics.iic * 100).toFixed(2),
        pc_change: newMetrics.metrics.pc - currentMetrics.metrics.pc,
        new_connections: newMetrics.metrics.total_edges - currentMetrics.metrics.total_edges,
        components_change: currentMetrics.metrics.connected_components - newMetrics.metrics.connected_components
      };
      
      return {
        success: true,
        before: currentMetrics.metrics,
        after: newMetrics.metrics,
        impact: impact,
        recommendation: impact.iic_change > 0 
          ? 'Restauração recomendada - melhoria significativa na conectividade'
          : 'Avaliar alternativas - impacto limitado na conectividade'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Conectividade de Habitat
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de conectividade
 */
function apiConectividadeInit() {
  return HabitatConnectivity.initializeSheets();
}

/**
 * Cadastra fragmento de habitat
 */
function apiConectividadeCadastrarFragmento(fragmentData) {
  return HabitatConnectivity.registerFragment(fragmentData);
}

/**
 * Lista fragmentos cadastrados
 */
function apiConectividadeListarFragmentos() {
  return HabitatConnectivity.listFragments();
}

/**
 * Constrói grafo de conectividade
 */
function apiConectividadeGrafo(dispersalType) {
  return HabitatConnectivity.buildConnectivityGraph(dispersalType || 'default');
}

/**
 * Calcula métricas de conectividade
 */
function apiConectividadeMetricas(dispersalType) {
  return HabitatConnectivity.calculateConnectivityMetrics(dispersalType || 'default');
}

/**
 * Simula cenário de restauração
 */
function apiConectividadeSimular(newFragments) {
  return HabitatConnectivity.simulateRestoration(newFragments || []);
}
