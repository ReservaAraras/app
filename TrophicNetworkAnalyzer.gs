/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE REDES TRÓFICAS E INTERAÇÕES ECOLÓGICAS
 * ═══════════════════════════════════════════════════════════════════════════
 * P09 - Modelagem de Redes Tróficas com Simulação de Impactos
 * 
 * Funcionalidades:
 * - Mapeamento de interações ecológicas
 * - Análise de redes tróficas
 * - Identificação de espécies-chave (keystone)
 * - Simulação de extinções e cascatas
 * - Métricas de rede (conectância, modularidade)
 * - Análise de polinização e dispersão
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha INTERACOES_ECOLOGICAS_RA
 */
const SCHEMA_INTERACOES = {
  ID_Interacao: { type: 'string', required: true, unique: true },
  Timestamp_Registro: { type: 'datetime', required: true },
  Especie_A: { type: 'string', required: true },
  Nome_Popular_A: { type: 'string' },
  Especie_B: { type: 'string', required: true },
  Nome_Popular_B: { type: 'string' },
  Tipo_Interacao: { type: 'enum', values: ['Predacao', 'Herbivoria', 'Polinizacao', 'Dispersao_Sementes', 'Mutualismo', 'Competicao', 'Parasitismo', 'Comensalismo'] },
  Direcao: { type: 'enum', values: ['A_para_B', 'B_para_A', 'Bidirecional'] },
  Intensidade: { type: 'enum', values: ['Fraca', 'Moderada', 'Forte'] },
  Frequencia_Observada: { type: 'integer', min: 0 },
  Sazonalidade_JSON: { type: 'text' },
  Fonte_Dados: { type: 'enum', values: ['Observacao_Direta', 'Camera_Trap', 'Literatura', 'Inferencia_IA'] },
  Confianca: { type: 'float', range: [0, 1] },
  Habitat: { type: 'string' },
  Periodo_Dia: { type: 'enum', values: ['Diurno', 'Noturno', 'Crepuscular', 'Qualquer'] },
  Importancia_Ecologica: { type: 'enum', values: ['Critica', 'Alta', 'Media', 'Baixa'] },
  Notas: { type: 'text' }
};

/**
 * Headers da planilha INTERACOES_ECOLOGICAS_RA
 */
const INTERACOES_HEADERS = [
  'ID_Interacao', 'Timestamp_Registro', 'Especie_A', 'Nome_Popular_A',
  'Especie_B', 'Nome_Popular_B', 'Tipo_Interacao', 'Direcao', 'Intensidade',
  'Frequencia_Observada', 'Sazonalidade_JSON', 'Fonte_Dados', 'Confianca',
  'Habitat', 'Periodo_Dia', 'Importancia_Ecologica', 'Notas'
];


/**
 * Analisador de Redes Tróficas
 * @namespace TrophicNetworkAnalyzer
 */
const TrophicNetworkAnalyzer = {
  
  SHEET_NAME: 'INTERACOES_ECOLOGICAS_RA',
  
  /**
   * Interações pré-definidas do Cerrado (dados iniciais)
   */
  INTERACOES_BASE: [
    // Predação
    { especie_a: 'Panthera onca', nome_a: 'Onça-pintada', especie_b: 'Tapirus terrestris', nome_b: 'Anta', tipo: 'Predacao', intensidade: 'Forte', importancia: 'Critica' },
    { especie_a: 'Panthera onca', nome_a: 'Onça-pintada', especie_b: 'Mazama americana', nome_b: 'Veado-mateiro', tipo: 'Predacao', intensidade: 'Forte', importancia: 'Alta' },
    { especie_a: 'Chrysocyon brachyurus', nome_a: 'Lobo-guará', especie_b: 'Cavia aperea', nome_b: 'Preá', tipo: 'Predacao', intensidade: 'Moderada', importancia: 'Media' },
    { especie_a: 'Cariama cristata', nome_a: 'Seriema', especie_b: 'Crotalus durissus', nome_b: 'Cascavel', tipo: 'Predacao', intensidade: 'Moderada', importancia: 'Alta' },
    // Herbivoria
    { especie_a: 'Tapirus terrestris', nome_a: 'Anta', especie_b: 'Caryocar brasiliense', nome_b: 'Pequi', tipo: 'Herbivoria', intensidade: 'Forte', importancia: 'Critica' },
    { especie_a: 'Mazama americana', nome_a: 'Veado-mateiro', especie_b: 'Gramíneas', nome_b: 'Gramíneas', tipo: 'Herbivoria', intensidade: 'Forte', importancia: 'Alta' },
    // Polinização
    { especie_a: 'Eulaema nigrita', nome_a: 'Abelha-das-orquídeas', especie_b: 'Catasetum sp.', nome_b: 'Orquídea', tipo: 'Polinizacao', intensidade: 'Forte', importancia: 'Critica' },
    { especie_a: 'Apis mellifera', nome_a: 'Abelha-europeia', especie_b: 'Caryocar brasiliense', nome_b: 'Pequi', tipo: 'Polinizacao', intensidade: 'Forte', importancia: 'Alta' },
    { especie_a: 'Phaethornis pretrei', nome_a: 'Rabo-branco', especie_b: 'Heliconia sp.', nome_b: 'Helicônia', tipo: 'Polinizacao', intensidade: 'Forte', importancia: 'Alta' },
    // Dispersão de sementes
    { especie_a: 'Tapirus terrestris', nome_a: 'Anta', especie_b: 'Mauritia flexuosa', nome_b: 'Buriti', tipo: 'Dispersao_Sementes', intensidade: 'Forte', importancia: 'Critica' },
    { especie_a: 'Chrysocyon brachyurus', nome_a: 'Lobo-guará', especie_b: 'Solanum lycocarpum', nome_b: 'Lobeira', tipo: 'Dispersao_Sementes', intensidade: 'Forte', importancia: 'Critica' },
    { especie_a: 'Ramphastos toco', nome_a: 'Tucano-toco', especie_b: 'Euterpe edulis', nome_b: 'Palmito-juçara', tipo: 'Dispersao_Sementes', intensidade: 'Forte', importancia: 'Alta' },
    { especie_a: 'Ara ararauna', nome_a: 'Arara-canindé', especie_b: 'Mauritia flexuosa', nome_b: 'Buriti', tipo: 'Dispersao_Sementes', intensidade: 'Moderada', importancia: 'Alta' },
    // Mutualismo
    { especie_a: 'Atta sexdens', nome_a: 'Saúva', especie_b: 'Leucoagaricus gongylophorus', nome_b: 'Fungo cultivado', tipo: 'Mutualismo', intensidade: 'Forte', importancia: 'Alta' },
    { especie_a: 'Myrmecophaga tridactyla', nome_a: 'Tamanduá-bandeira', especie_b: 'Atta sexdens', nome_b: 'Saúva', tipo: 'Predacao', intensidade: 'Forte', importancia: 'Alta' }
  ],

  /**
   * Níveis tróficos por grupo
   */
  TROPHIC_LEVELS: {
    'Produtor': 1,
    'Herbivoro': 2,
    'Onivoro': 2.5,
    'Carnivoro_Primario': 3,
    'Carnivoro_Secundario': 4,
    'Predador_Topo': 5
  },
  
  /**
   * Classificação de espécies por nível trófico
   */
  SPECIES_TROPHIC: {
    'Panthera onca': 'Predador_Topo',
    'Chrysocyon brachyurus': 'Onivoro',
    'Tapirus terrestris': 'Herbivoro',
    'Mazama americana': 'Herbivoro',
    'Myrmecophaga tridactyla': 'Carnivoro_Primario',
    'Cariama cristata': 'Carnivoro_Primario',
    'Ramphastos toco': 'Onivoro',
    'Ara ararauna': 'Herbivoro',
    'Caryocar brasiliense': 'Produtor',
    'Mauritia flexuosa': 'Produtor',
    'Solanum lycocarpum': 'Produtor'
  },
  
  /**
   * Inicializa a planilha de interações
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(INTERACOES_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, INTERACOES_HEADERS.length);
        headerRange.setBackground('#00695C');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        // Popula com dados base
        this._populateBaseInteractions(sheet);
        
        Logger.log(`[TrophicNetworkAnalyzer] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[TrophicNetworkAnalyzer] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Popula interações base
   * @private
   */
  _populateBaseInteractions: function(sheet) {
    this.INTERACOES_BASE.forEach((int, index) => {
      const id = `INT_BASE_${String(index + 1).padStart(3, '0')}`;
      const row = [
        id,
        new Date(),
        int.especie_a,
        int.nome_a,
        int.especie_b,
        int.nome_b,
        int.tipo,
        'A_para_B',
        int.intensidade,
        1,
        '[]',
        'Literatura',
        0.9,
        'Cerrado',
        'Qualquer',
        int.importancia,
        'Interação documentada na literatura'
      ];
      sheet.appendRow(row);
    });
  },

  /**
   * Registra nova interação ecológica
   * @param {object} data - Dados da interação
   * @returns {object} Resultado
   */
  registerInteraction: function(data) {
    try {
      // INTERVENÇÃO 2/13: Validação defensiva para evitar erro de undefined
      if (!data || typeof data !== 'object') {
        Logger.log('[registerInteraction] Erro: Dados não fornecidos ou inválidos');
        return {
          success: false,
          error: 'Dados da interação não fornecidos'
        };
      }
      
      // Valida campos obrigatórios
      const especieA = data.especie_a ? String(data.especie_a).trim() : '';
      const especieB = data.especie_b ? String(data.especie_b).trim() : '';
      
      if (!especieA) {
        Logger.log('[registerInteraction] Erro: especie_a é obrigatório');
        return {
          success: false,
          error: 'Campo especie_a é obrigatório'
        };
      }
      
      if (!especieB) {
        Logger.log('[registerInteraction] Erro: especie_b é obrigatório');
        return {
          success: false,
          error: 'Campo especie_b é obrigatório'
        };
      }
      
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `INT_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      const row = [
        id,
        new Date(),
        especieA,
        data.nome_popular_a || '',
        especieB,
        data.nome_popular_b || '',
        data.tipo || 'Mutualismo',
        data.direcao || 'A_para_B',
        data.intensidade || 'Moderada',
        data.frequencia || 1,
        JSON.stringify(data.sazonalidade || []),
        data.fonte || 'Observacao_Direta',
        data.confianca || 0.8,
        data.habitat || 'Cerrado',
        data.periodo || 'Qualquer',
        data.importancia || 'Media',
        data.notas || ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        id: id,
        message: 'Interação registrada com sucesso'
      };
      
    } catch (error) {
      Logger.log(`[registerInteraction] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obtém todas as interações
   * @param {object} filtros - Filtros opcionais
   * @returns {Array} Lista de interações
   */
  getInteractions: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const interactions = [];
      
      for (let i = 1; i < data.length; i++) {
        const int = {
          id: data[i][0],
          timestamp: data[i][1],
          especie_a: data[i][2],
          nome_a: data[i][3],
          especie_b: data[i][4],
          nome_b: data[i][5],
          tipo: data[i][6],
          direcao: data[i][7],
          intensidade: data[i][8],
          frequencia: data[i][9],
          fonte: data[i][11],
          confianca: data[i][12],
          habitat: data[i][13],
          importancia: data[i][15]
        };
        
        // Aplica filtros
        if (filtros.tipo && int.tipo !== filtros.tipo) continue;
        if (filtros.especie && int.especie_a !== filtros.especie && int.especie_b !== filtros.especie) continue;
        if (filtros.importancia && int.importancia !== filtros.importancia) continue;
        
        interactions.push(int);
      }
      
      return interactions;
      
    } catch (error) {
      Logger.log(`[getInteractions] Erro: ${error}`);
      return [];
    }
  },

  /**
   * Constrói rede trófica completa
   * @returns {object} Rede com métricas
   */
  buildTrophicNetwork: function() {
    try {
      const interactions = this.getInteractions();
      
      if (interactions.length === 0) {
        return { success: false, error: 'Nenhuma interação encontrada' };
      }
      
      // Extrai espécies únicas
      const speciesSet = new Set();
      interactions.forEach(int => {
        speciesSet.add(int.especie_a);
        speciesSet.add(int.especie_b);
      });
      const species = Array.from(speciesSet);
      
      // Constrói matriz de adjacência
      const matrix = this._buildAdjacencyMatrix(species, interactions);
      
      // Calcula métricas
      const metrics = this._calculateNetworkMetrics(matrix, species, interactions);
      
      // Identifica espécies-chave
      const keystones = this._identifyKeystoneSpecies(matrix, species, interactions);
      
      // Prepara dados para visualização
      const visualization = this._prepareVisualization(species, interactions);
      
      return {
        success: true,
        species_count: species.length,
        interaction_count: interactions.length,
        species: species,
        metrics: metrics,
        keystone_species: keystones,
        visualization: visualization,
        by_type: this._groupByType(interactions)
      };
      
    } catch (error) {
      Logger.log(`[buildTrophicNetwork] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Constrói matriz de adjacência
   * @private
   */
  _buildAdjacencyMatrix: function(species, interactions) {
    const n = species.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    const speciesIndex = {};
    
    species.forEach((sp, i) => {
      speciesIndex[sp] = i;
    });
    
    interactions.forEach(int => {
      const i = speciesIndex[int.especie_a];
      const j = speciesIndex[int.especie_b];
      
      if (i !== undefined && j !== undefined) {
        const weight = int.intensidade === 'Forte' ? 3 : (int.intensidade === 'Moderada' ? 2 : 1);
        matrix[i][j] = weight;
        
        if (int.direcao === 'Bidirecional') {
          matrix[j][i] = weight;
        }
      }
    });
    
    return matrix;
  },

  /**
   * Calcula métricas da rede
   * @private
   */
  _calculateNetworkMetrics: function(matrix, species, interactions) {
    const n = species.length;
    
    // Conta links
    let totalLinks = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] > 0) totalLinks++;
      }
    }
    
    // Conectância: proporção de links possíveis que existem
    const possibleLinks = n * (n - 1);
    const connectance = possibleLinks > 0 ? totalLinks / possibleLinks : 0;
    
    // Grau médio
    const degrees = species.map((sp, i) => this._calculateDegree(matrix, i));
    const avgDegree = degrees.reduce((a, b) => a + b, 0) / n;
    
    // Densidade de interações por tipo
    const byType = this._groupByType(interactions);
    
    // Métricas por espécie
    const speciesMetrics = species.map((sp, i) => ({
      species: sp,
      nome: this._getPopularName(sp, interactions),
      degree: degrees[i],
      in_degree: this._calculateInDegree(matrix, i),
      out_degree: this._calculateOutDegree(matrix, i),
      trophic_level: this.SPECIES_TROPHIC[sp] || 'Desconhecido',
      trophic_value: this.TROPHIC_LEVELS[this.SPECIES_TROPHIC[sp]] || 2
    }));
    
    return {
      species_richness: n,
      total_interactions: totalLinks,
      connectance: parseFloat(connectance.toFixed(4)),
      average_degree: parseFloat(avgDegree.toFixed(2)),
      network_density: parseFloat((totalLinks / (n * n)).toFixed(4)),
      interactions_by_type: byType,
      species_metrics: speciesMetrics.sort((a, b) => b.degree - a.degree)
    };
  },
  
  /**
   * Calcula grau de um nó
   * @private
   */
  _calculateDegree: function(matrix, nodeIndex) {
    let degree = 0;
    const n = matrix.length;
    
    for (let j = 0; j < n; j++) {
      if (matrix[nodeIndex][j] > 0) degree++;
      if (matrix[j][nodeIndex] > 0) degree++;
    }
    
    return degree;
  },
  
  /**
   * Calcula grau de entrada
   * @private
   */
  _calculateInDegree: function(matrix, nodeIndex) {
    let degree = 0;
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i][nodeIndex] > 0) degree++;
    }
    return degree;
  },
  
  /**
   * Calcula grau de saída
   * @private
   */
  _calculateOutDegree: function(matrix, nodeIndex) {
    let degree = 0;
    for (let j = 0; j < matrix.length; j++) {
      if (matrix[nodeIndex][j] > 0) degree++;
    }
    return degree;
  },
  
  /**
   * Obtém nome popular
   * @private
   */
  _getPopularName: function(species, interactions) {
    const int = interactions.find(i => i.especie_a === species || i.especie_b === species);
    if (int) {
      return int.especie_a === species ? int.nome_a : int.nome_b;
    }
    return species;
  },

  /**
   * Identifica espécies-chave (keystone species)
   * @private
   */
  _identifyKeystoneSpecies: function(matrix, species, interactions) {
    const keystones = [];
    const n = species.length;
    
    species.forEach((sp, i) => {
      const degree = this._calculateDegree(matrix, i);
      const outDegree = this._calculateOutDegree(matrix, i);
      const inDegree = this._calculateInDegree(matrix, i);
      
      // Simula extinção
      const extinctionImpact = this._simulateExtinction(matrix, i, species);
      
      // Calcula índice de keystone
      // Baseado em: grau alto + impacto de extinção alto
      const keystoneIndex = (degree / n) * 0.4 + (extinctionImpact.impact_score) * 0.6;
      
      // Determina papel ecológico
      const role = this._determineEcologicalRole(sp, degree, outDegree, inDegree, interactions);
      
      keystones.push({
        species: sp,
        nome: this._getPopularName(sp, interactions),
        keystone_index: parseFloat(keystoneIndex.toFixed(3)),
        degree: degree,
        out_degree: outDegree,
        in_degree: inDegree,
        extinction_impact: extinctionImpact,
        ecological_role: role,
        trophic_level: this.SPECIES_TROPHIC[sp] || 'Desconhecido',
        is_keystone: keystoneIndex > 0.3
      });
    });
    
    return keystones
      .filter(k => k.is_keystone)
      .sort((a, b) => b.keystone_index - a.keystone_index);
  },
  
  /**
   * Determina papel ecológico
   * @private
   */
  _determineEcologicalRole: function(species, degree, outDegree, inDegree, interactions) {
    const trophic = this.SPECIES_TROPHIC[species];
    
    if (trophic === 'Predador_Topo') return 'Predador de Topo';
    if (trophic === 'Produtor') return 'Produtor Primário';
    
    // Verifica se é dispersor importante
    const dispersalCount = interactions.filter(i => 
      i.tipo === 'Dispersao_Sementes' && (i.especie_a === species || i.especie_b === species)
    ).length;
    if (dispersalCount >= 2) return 'Dispersor-Chave';
    
    // Verifica se é polinizador importante
    const pollinationCount = interactions.filter(i => 
      i.tipo === 'Polinizacao' && (i.especie_a === species || i.especie_b === species)
    ).length;
    if (pollinationCount >= 2) return 'Polinizador-Chave';
    
    if (outDegree > inDegree * 2) return 'Consumidor Generalista';
    if (inDegree > outDegree * 2) return 'Recurso-Chave';
    
    return 'Espécie Intermediária';
  },

  /**
   * Simula extinção de uma espécie
   * @param {Array} matrix - Matriz de adjacência
   * @param {number} targetIndex - Índice da espécie a remover
   * @param {Array} species - Lista de espécies
   * @returns {object} Resultado da simulação
   */
  _simulateExtinction: function(matrix, targetIndex, species) {
    const n = matrix.length;
    
    // Cria cópia da matriz
    const simMatrix = matrix.map(row => [...row]);
    
    // Remove a espécie (zera linha e coluna)
    for (let i = 0; i < n; i++) {
      simMatrix[targetIndex][i] = 0;
      simMatrix[i][targetIndex] = 0;
    }
    
    // Conta interações perdidas diretamente
    let directLoss = 0;
    for (let i = 0; i < n; i++) {
      if (matrix[targetIndex][i] > 0) directLoss++;
      if (matrix[i][targetIndex] > 0) directLoss++;
    }
    
    // Simula extinções secundárias (espécies que dependiam exclusivamente)
    let secondaryExtinctions = 0;
    const extinctSpecies = [targetIndex];
    
    // Verifica espécies que perderam todos os recursos
    for (let i = 0; i < n; i++) {
      if (i === targetIndex) continue;
      
      // Conta recursos restantes
      let resources = 0;
      for (let j = 0; j < n; j++) {
        if (!extinctSpecies.includes(j) && simMatrix[i][j] > 0) {
          resources++;
        }
      }
      
      // Se era consumidor e perdeu todos os recursos
      const outDegree = this._calculateOutDegree(matrix, i);
      if (outDegree > 0 && resources === 0) {
        secondaryExtinctions++;
        extinctSpecies.push(i);
      }
    }
    
    const totalLoss = 1 + secondaryExtinctions;
    const impactScore = totalLoss / n;
    
    return {
      species_removed: species[targetIndex],
      direct_interactions_lost: directLoss,
      secondary_extinctions: secondaryExtinctions,
      total_species_lost: totalLoss,
      impact_score: parseFloat(impactScore.toFixed(3)),
      severity: impactScore > 0.2 ? 'Crítico' : (impactScore > 0.1 ? 'Alto' : (impactScore > 0.05 ? 'Moderado' : 'Baixo'))
    };
  },
  
  /**
   * Simula extinção de espécie específica (API pública)
   * @param {string} speciesName - Nome da espécie
   * @returns {object} Resultado da simulação
   */
  simulateSpeciesExtinction: function(speciesName) {
    try {
      const interactions = this.getInteractions();
      
      // Extrai espécies
      const speciesSet = new Set();
      interactions.forEach(int => {
        speciesSet.add(int.especie_a);
        speciesSet.add(int.especie_b);
      });
      const species = Array.from(speciesSet);
      
      // Encontra índice da espécie
      const targetIndex = species.indexOf(speciesName);
      if (targetIndex === -1) {
        return { success: false, error: 'Espécie não encontrada na rede' };
      }
      
      // Constrói matriz
      const matrix = this._buildAdjacencyMatrix(species, interactions);
      
      // Simula extinção
      const result = this._simulateExtinction(matrix, targetIndex, species);
      
      // Gera recomendações com IA
      const recommendations = this._generateConservationRecommendations(result, speciesName);
      
      return {
        success: true,
        simulation: result,
        recommendations: recommendations
      };
      
    } catch (error) {
      Logger.log(`[simulateSpeciesExtinction] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recomendações de conservação
   * @private
   */
  _generateConservationRecommendations: function(simulation, speciesName) {
    const recommendations = [];
    
    if (simulation.severity === 'Crítico') {
      recommendations.push(`URGENTE: ${speciesName} é uma espécie-chave crítica. Sua extinção causaria colapso em cascata.`);
      recommendations.push('Implementar programa de monitoramento intensivo');
      recommendations.push('Estabelecer áreas de proteção prioritária');
      recommendations.push('Desenvolver plano de manejo específico');
    } else if (simulation.severity === 'Alto') {
      recommendations.push(`ALERTA: ${speciesName} tem alto impacto na rede trófica.`);
      recommendations.push('Monitorar população regularmente');
      recommendations.push('Proteger habitats críticos');
    } else {
      recommendations.push(`${speciesName} tem impacto moderado na rede.`);
      recommendations.push('Manter monitoramento de rotina');
    }
    
    if (simulation.secondary_extinctions > 0) {
      recommendations.push(`Atenção: ${simulation.secondary_extinctions} espécie(s) dependente(s) seriam afetadas`);
    }
    
    return recommendations;
  },
  
  /**
   * Agrupa interações por tipo
   * @private
   */
  _groupByType: function(interactions) {
    const groups = {};
    interactions.forEach(int => {
      groups[int.tipo] = (groups[int.tipo] || 0) + 1;
    });
    return groups;
  },
  
  /**
   * Prepara dados para visualização
   * @private
   */
  _prepareVisualization: function(species, interactions) {
    // Nós
    const nodes = species.map(sp => {
      const trophic = this.SPECIES_TROPHIC[sp] || 'Desconhecido';
      const level = this.TROPHIC_LEVELS[trophic] || 2;
      
      return {
        id: sp,
        label: this._getPopularName(sp, interactions),
        group: trophic,
        level: level,
        size: interactions.filter(i => i.especie_a === sp || i.especie_b === sp).length
      };
    });
    
    // Links
    const links = interactions.map(int => ({
      source: int.especie_a,
      target: int.especie_b,
      type: int.tipo,
      strength: int.intensidade === 'Forte' ? 3 : (int.intensidade === 'Moderada' ? 2 : 1),
      label: int.tipo
    }));
    
    return { nodes, links };
  },

  /**
   * Analisa rede de polinização
   * @returns {object} Análise de polinização
   */
  analyzePollinationNetwork: function() {
    try {
      const interactions = this.getInteractions({ tipo: 'Polinizacao' });
      
      if (interactions.length === 0) {
        return { success: true, message: 'Nenhuma interação de polinização registrada', total: 0 };
      }
      
      const plants = new Set();
      const pollinators = new Set();
      
      interactions.forEach(int => {
        // Assume que espécie_a é polinizador e espécie_b é planta
        pollinators.add(int.especie_a);
        plants.add(int.especie_b);
      });
      
      // Calcula especialização
      const pollinatorSpecialization = {};
      pollinators.forEach(pol => {
        const plantsVisited = interactions.filter(i => i.especie_a === pol).length;
        pollinatorSpecialization[pol] = plantsVisited;
      });
      
      // Identifica polinizadores generalistas vs especialistas
      const avgPlants = Object.values(pollinatorSpecialization).reduce((a, b) => a + b, 0) / pollinators.size;
      
      return {
        success: true,
        total_interactions: interactions.length,
        plant_species: Array.from(plants),
        plant_count: plants.size,
        pollinator_species: Array.from(pollinators),
        pollinator_count: pollinators.size,
        average_plants_per_pollinator: parseFloat(avgPlants.toFixed(2)),
        specialization: pollinatorSpecialization,
        network_vulnerability: plants.size > pollinators.size ? 'Alta' : 'Moderada'
      };
      
    } catch (error) {
      Logger.log(`[analyzePollinationNetwork] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Analisa rede de dispersão de sementes
   * @returns {object} Análise de dispersão
   */
  analyzeSeedDispersalNetwork: function() {
    try {
      const interactions = this.getInteractions({ tipo: 'Dispersao_Sementes' });
      
      if (interactions.length === 0) {
        return { success: true, message: 'Nenhuma interação de dispersão registrada', total: 0 };
      }
      
      const plants = new Set();
      const dispersers = new Set();
      
      interactions.forEach(int => {
        dispersers.add(int.especie_a);
        plants.add(int.especie_b);
      });
      
      // Identifica dispersores-chave
      const disperserEffectiveness = {};
      dispersers.forEach(disp => {
        const plantsDispersed = interactions.filter(i => i.especie_a === disp);
        const strongInteractions = plantsDispersed.filter(i => i.intensidade === 'Forte').length;
        disperserEffectiveness[disp] = {
          plants_dispersed: plantsDispersed.length,
          strong_interactions: strongInteractions,
          effectiveness_score: plantsDispersed.length + strongInteractions
        };
      });
      
      // Ordena por efetividade
      const keyDispersers = Object.entries(disperserEffectiveness)
        .sort((a, b) => b[1].effectiveness_score - a[1].effectiveness_score)
        .slice(0, 5)
        .map(([sp, data]) => ({
          species: sp,
          nome: this._getPopularName(sp, interactions),
          ...data
        }));
      
      return {
        success: true,
        total_interactions: interactions.length,
        plant_species: Array.from(plants),
        plant_count: plants.size,
        disperser_species: Array.from(dispersers),
        disperser_count: dispersers.size,
        key_dispersers: keyDispersers,
        redundancy: dispersers.size / plants.size > 1 ? 'Alta' : 'Baixa'
      };
      
    } catch (error) {
      Logger.log(`[analyzeSeedDispersalNetwork] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const interactions = this.getInteractions();
      const network = this.buildTrophicNetwork();
      
      if (!network.success) {
        return {
          total_interactions: 0,
          total_species: 0,
          by_type: {},
          by_importance: {}
        };
      }
      
      const byImportance = {};
      interactions.forEach(int => {
        byImportance[int.importancia] = (byImportance[int.importancia] || 0) + 1;
      });
      
      return {
        total_interactions: interactions.length,
        total_species: network.species_count,
        connectance: network.metrics.connectance,
        average_degree: network.metrics.average_degree,
        keystone_count: network.keystone_species.length,
        by_type: network.by_type,
        by_importance: byImportance,
        critical_interactions: interactions.filter(i => i.importancia === 'Critica').length
      };
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P09 Redes Tróficas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de interações ecológicas
 * @returns {object} Resultado
 */
function apiRedesTroficasInit() {
  return TrophicNetworkAnalyzer.initializeSheet();
}

/**
 * Registra nova interação ecológica
 * @param {object} data - Dados da interação
 * @returns {object} Resultado
 */
function apiRedesTroficasRegister(data) {
  return TrophicNetworkAnalyzer.registerInteraction(data);
}

/**
 * Lista interações ecológicas
 * @param {object} filtros - Filtros opcionais (tipo, especie, importancia)
 * @returns {Array} Lista de interações
 */
function apiRedesTroficasList(filtros) {
  return TrophicNetworkAnalyzer.getInteractions(filtros || {});
}

/**
 * Constrói e analisa rede trófica completa
 * @returns {object} Rede com métricas e espécies-chave
 */
function apiRedesTroficasBuild() {
  return TrophicNetworkAnalyzer.buildTrophicNetwork();
}

/**
 * Simula extinção de uma espécie
 * @param {string} speciesName - Nome científico da espécie
 * @returns {object} Resultado da simulação
 */
function apiRedesTroficasSimularExtincao(speciesName) {
  return TrophicNetworkAnalyzer.simulateSpeciesExtinction(speciesName);
}

/**
 * Analisa rede de polinização
 * @returns {object} Análise de polinização
 */
function apiRedesTroficasPolinizacao() {
  return TrophicNetworkAnalyzer.analyzePollinationNetwork();
}

/**
 * Analisa rede de dispersão de sementes
 * @returns {object} Análise de dispersão
 */
function apiRedesTroficasDispersao() {
  return TrophicNetworkAnalyzer.analyzeSeedDispersalNetwork();
}

/**
 * Obtém estatísticas gerais
 * @returns {object} Estatísticas
 */
function apiRedesTroficasStats() {
  return TrophicNetworkAnalyzer.getStatistics();
}
