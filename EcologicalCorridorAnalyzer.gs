/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANALISADOR DE CORREDORES ECOLÓGICOS
 * ═══════════════════════════════════════════════════════════════════════════
 * P04 - Mapeamento de Corredores Ecológicos com Análise de Conectividade
 * 
 * Funcionalidades:
 * - Mapeamento geoespacial de corredores
 * - Análise de conectividade entre fragmentos
 * - Identificação de gargalos e ameaças
 * - Cálculo de permeabilidade para fauna e flora
 * - Recomendações de restauração com IA
 * - Priorização de intervenções
 * 
 * @version 3.2.0
 * @date 2025-12-25
 */

/**
 * Schema de dados para planilha CORREDORES_ECOLOGICOS_RA
 */
const SCHEMA_CORREDORES = {
  ID_Corredor: { type: 'string', required: true, unique: true },
  Nome_Corredor: { type: 'string', required: true },
  Timestamp_Criacao: { type: 'datetime', required: true },
  Tipo_Corredor: { type: 'enum', values: ['Linear', 'Stepping_Stone', 'Matriz_Permeavel', 'Ripario', 'Misto'] },
  Coordenadas_Poligono_JSON: { type: 'text' },
  Comprimento_m: { type: 'float', min: 0 },
  Largura_Media_m: { type: 'float', min: 0 },
  Area_Total_ha: { type: 'float', min: 0 },
  ID_Fragmento_Origem: { type: 'string' },
  ID_Fragmento_Destino: { type: 'string' },
  Coord_Inicio_Lat: { type: 'float' },
  Coord_Inicio_Lng: { type: 'float' },
  Coord_Fim_Lat: { type: 'float' },
  Coord_Fim_Lng: { type: 'float' },
  Cobertura_Vegetal_percent: { type: 'float', range: [0, 100] },
  Altura_Dossel_Media_m: { type: 'float', min: 0 },
  Densidade_Arvores_ha: { type: 'integer', min: 0 },
  Presenca_Agua: { type: 'boolean' },
  Tipo_Vegetacao_Dominante: { type: 'string' },
  Indice_Conectividade: { type: 'float', range: [0, 1] },
  Permeabilidade_Fauna: { type: 'enum', values: ['Muito_Alta', 'Alta', 'Média', 'Baixa', 'Muito_Baixa'] },
  Permeabilidade_Flora: { type: 'enum', values: ['Muito_Alta', 'Alta', 'Média', 'Baixa', 'Muito_Baixa'] },
  Resistencia_Movimento: { type: 'float' },
  Especies_Registradas: { type: 'array' },
  Especies_Alvo: { type: 'array' },
  Frequencia_Uso_Fauna: { type: 'enum', values: ['Muito_Alta', 'Alta', 'Média', 'Baixa', 'Rara'] },
  Gargalos_JSON: { type: 'text' },
  Ameacas_JSON: { type: 'text' },
  Nivel_Fragmentacao: { type: 'enum', values: ['Baixo', 'Moderado', 'Alto', 'Crítico'] },
  IA_Qualidade: { type: 'enum', values: ['Excelente', 'Boa', 'Regular', 'Ruim', 'Crítica'] },
  IA_Recomendacoes: { type: 'array' },
  IA_Prioridade_Restauracao: { type: 'enum', values: ['Muito_Alta', 'Alta', 'Média', 'Baixa'] },
  Status: { type: 'enum', values: ['Planejado', 'Em_Implantacao', 'Ativo', 'Degradado', 'Restauracao'] },
  Responsavel: { type: 'string' },
  Notas: { type: 'text' }
};

/**
 * Headers da planilha CORREDORES_ECOLOGICOS_RA
 */
const CORREDORES_HEADERS = [
  'ID_Corredor', 'Nome_Corredor', 'Timestamp_Criacao', 'Tipo_Corredor',
  'Coordenadas_Poligono_JSON', 'Comprimento_m', 'Largura_Media_m', 'Area_Total_ha',
  'ID_Fragmento_Origem', 'ID_Fragmento_Destino', 'Coord_Inicio_Lat', 'Coord_Inicio_Lng',
  'Coord_Fim_Lat', 'Coord_Fim_Lng', 'Cobertura_Vegetal_percent', 'Altura_Dossel_Media_m',
  'Densidade_Arvores_ha', 'Presenca_Agua', 'Tipo_Vegetacao_Dominante',
  'Indice_Conectividade', 'Permeabilidade_Fauna', 'Permeabilidade_Flora',
  'Resistencia_Movimento', 'Especies_Registradas', 'Especies_Alvo',
  'Frequencia_Uso_Fauna', 'Gargalos_JSON', 'Ameacas_JSON', 'Nivel_Fragmentacao',
  'IA_Qualidade', 'IA_Recomendacoes', 'IA_Prioridade_Restauracao',
  'Status', 'Responsavel', 'Notas'
];


/**
 * Analisador de Corredores Ecológicos
 * @namespace EcologicalCorridorAnalyzer
 */
const EcologicalCorridorAnalyzer = {
  
  /**
   * Nome da planilha de corredores
   */
  SHEET_NAME: 'CORREDORES_ECOLOGICOS_RA',
  
  /**
   * Parâmetros de referência para análise de conectividade
   */
  CONNECTIVITY_PARAMS: {
    // Largura mínima recomendada por tipo de fauna (metros)
    LARGURA_MINIMA: {
      pequenos_mamiferos: 30,
      medios_mamiferos: 100,
      grandes_mamiferos: 200,
      aves: 50,
      anfibios: 20
    },
    // Cobertura vegetal mínima para funcionalidade (%)
    COBERTURA_MINIMA: {
      excelente: 80,
      boa: 60,
      regular: 40,
      ruim: 20
    },
    // Distância máxima entre stepping stones (metros)
    DISTANCIA_MAX_STEPPING: 500
  },

  /**
   * [Prompt 25] Critérios para classificação de tipo de corredor
   */
  CORRIDOR_TYPE_CRITERIA: {
    Linear: {
      continuous: true,
      min_width: 50,           // metros
      min_coverage: 60,        // percentual
      max_gap: 50,             // metros
      description: 'Corredor contínuo conectando dois fragmentos'
    },
    Stepping_Stone: {
      continuous: false,
      min_patch_size: 0.5,     // hectares
      max_distance: 500,       // metros entre patches
      min_patches: 3,
      description: 'Série de fragmentos que facilitam movimento entre áreas'
    },
    Ripario: {
      water_presence: true,
      min_width: 30,           // metros (APP legal mínimo)
      follows_watercourse: true,
      description: 'Corredor ao longo de curso d\'água'
    },
    Matriz_Permeavel: {
      min_coverage: 20,
      max_resistance: 3,
      description: 'Matriz com permeabilidade suficiente para movimento ocasional'
    }
  },

  /**
   * [Prompt 25] Matriz de permeabilidade por grupo de fauna
   */
  FAUNA_PERMEABILITY_MATRIX: {
    pequenos_mamiferos: {
      nome: 'Pequenos Mamíferos',
      exemplos: ['Roedores', 'Marsupiais pequenos', 'Morcegos'],
      min_width: 30,
      min_coverage: 40,
      connectivity_threshold: 0.3,
      tolerancia_gap: 100
    },
    medios_mamiferos: {
      nome: 'Médios Mamíferos',
      exemplos: ['Tamanduá-mirim', 'Cachorro-do-mato', 'Jaguatirica'],
      min_width: 100,
      min_coverage: 60,
      connectivity_threshold: 0.5,
      tolerancia_gap: 200
    },
    grandes_mamiferos: {
      nome: 'Grandes Mamíferos',
      exemplos: ['Lobo-guará', 'Anta', 'Onça-parda'],
      min_width: 200,
      min_coverage: 70,
      connectivity_threshold: 0.7,
      tolerancia_gap: 300
    },
    aves: {
      nome: 'Aves',
      exemplos: ['Araras', 'Tucanos', 'Aves de sub-bosque'],
      min_width: 50,
      min_coverage: 50,
      connectivity_threshold: 0.4,
      tolerancia_gap: 500
    },
    anfibios: {
      nome: 'Anfíbios',
      exemplos: ['Sapos', 'Rãs', 'Pererecas'],
      min_width: 20,
      min_coverage: 30,
      connectivity_threshold: 0.3,
      tolerancia_gap: 50,
      requires_water: true
    }
  },

  /**
   * [Prompt 25] Espécies recomendadas para restauração no Cerrado
   */
  CERRADO_RESTORATION_SPECIES: {
    pioneiras: [
      { nome: 'Solanum lycocarpum', comum: 'Lobeira', funcao: 'Atração de fauna' },
      { nome: 'Cecropia pachystachya', comum: 'Embaúba', funcao: 'Crescimento rápido' },
      { nome: 'Trema micrantha', comum: 'Grandiúva', funcao: 'Cobertura rápida' }
    ],
    secundarias: [
      { nome: 'Caryocar brasiliense', comum: 'Pequi', funcao: 'Alimento fauna' },
      { nome: 'Dipteryx alata', comum: 'Baru', funcao: 'Alimento fauna/humano' },
      { nome: 'Hymenaea stigonocarpa', comum: 'Jatobá-do-cerrado', funcao: 'Estrutura' }
    ],
    climacicas: [
      { nome: 'Qualea grandiflora', comum: 'Pau-terra', funcao: 'Dossel' },
      { nome: 'Vochysia thyrsoidea', comum: 'Gomeira', funcao: 'Dossel' },
      { nome: 'Pterodon pubescens', comum: 'Sucupira-branca', funcao: 'Estrutura' }
    ],
    riparias: [
      { nome: 'Mauritia flexuosa', comum: 'Buriti', funcao: 'Áreas úmidas' },
      { nome: 'Tapirira guianensis', comum: 'Pau-pombo', funcao: 'Mata ciliar' },
      { nome: 'Calophyllum brasiliense', comum: 'Guanandi', funcao: 'Mata ciliar' }
    ]
  },

  /**
   * Inicializa a planilha de corredores
   * @returns {object} Resultado da inicialização
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(CORREDORES_HEADERS);
        
        // Formata header
        const headerRange = sheet.getRange(1, 1, 1, CORREDORES_HEADERS.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[EcologicalCorridorAnalyzer] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[EcologicalCorridorAnalyzer] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cria um novo corredor ecológico
   * @param {object} data - Dados do corredor
   * @returns {object} Resultado com ID do corredor criado
   */
  createCorridor: function(data) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `CORR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Calcula métricas automaticamente
      const area = this._calculateArea(data.comprimento_m, data.largura_media_m);
      const conectividade = this._calculateConnectivity(data);
      const permeabilidadeFauna = this._classifyPermeability(data, 'fauna');
      const permeabilidadeFlora = this._classifyPermeability(data, 'flora');
      const resistencia = this._calculateResistance(data);
      const fragmentacao = this._classifyFragmentation(data);
      
      // Análise com IA
      const aiAnalysis = this._analyzeWithAI(data, conectividade);
      
      const row = [
        id,
        data.nome || `Corredor ${id}`,
        new Date(),
        data.tipo || 'Linear',
        JSON.stringify(data.coordenadas_poligono || []),
        data.comprimento_m || 0,
        data.largura_media_m || 0,
        area,
        data.fragmento_origem || '',
        data.fragmento_destino || '',
        data.coord_inicio_lat || '',
        data.coord_inicio_lng || '',
        data.coord_fim_lat || '',
        data.coord_fim_lng || '',
        data.cobertura_vegetal || 0,
        data.altura_dossel || 0,
        data.densidade_arvores || 0,
        data.presenca_agua || false,
        data.vegetacao_dominante || '',
        conectividade,
        permeabilidadeFauna,
        permeabilidadeFlora,
        resistencia,
        JSON.stringify(data.especies_registradas || []),
        JSON.stringify(data.especies_alvo || []),
        data.frequencia_uso || 'Média',
        JSON.stringify(data.gargalos || []),
        JSON.stringify(data.ameacas || []),
        fragmentacao,
        aiAnalysis.qualidade || 'Regular',
        JSON.stringify(aiAnalysis.recomendacoes || []),
        aiAnalysis.prioridade || 'Média',
        data.status || 'Planejado',
        data.responsavel || '',
        data.notas || ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        id: id,
        conectividade: conectividade,
        permeabilidade_fauna: permeabilidadeFauna,
        permeabilidade_flora: permeabilidadeFlora,
        qualidade_ia: aiAnalysis.qualidade,
        recomendacoes: aiAnalysis.recomendacoes
      };
      
    } catch (error) {
      Logger.log(`[createCorridor] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa um corredor existente
   * @param {string} corridorId - ID do corredor
   * @returns {object} Análise completa do corredor
   */
  analyzeCorridor: function(corridorId) {
    try {
      const corridor = this._getCorridorById(corridorId);
      
      if (!corridor) {
        return { success: false, error: 'Corredor não encontrado' };
      }
      
      // Análise estrutural
      const estrutura = this._analyzeStructure(corridor);
      
      // Análise de biodiversidade
      const biodiversidade = this._analyzeBiodiversity(corridor);
      
      // Identificação de gargalos
      const gargalos = this._identifyBottlenecks(corridor);
      
      // Análise com IA
      const aiAnalysis = this._analyzeWithAI(corridor, corridor.conectividade);
      
      return {
        success: true,
        id: corridorId,
        nome: corridor.nome,
        estrutura: estrutura,
        biodiversidade: biodiversidade,
        conectividade: {
          indice: corridor.conectividade,
          classificacao: this._classifyConnectivity(corridor.conectividade),
          permeabilidade_fauna: corridor.permeabilidade_fauna,
          permeabilidade_flora: corridor.permeabilidade_flora
        },
        gargalos: gargalos,
        ameacas: JSON.parse(corridor.ameacas || '[]'),
        ia_analise: aiAnalysis,
        recomendacoes: aiAnalysis.recomendacoes,
        prioridade_restauracao: aiAnalysis.prioridade
      };
      
    } catch (error) {
      Logger.log(`[analyzeCorridor] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém corredor por ID
   * @private
   */
  _getCorridorById: function(corridorId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === corridorId) {
          return {
            id: data[i][0],
            nome: data[i][1],
            timestamp: data[i][2],
            tipo: data[i][3],
            coordenadas: data[i][4],
            comprimento_m: data[i][5],
            largura_media_m: data[i][6],
            area_ha: data[i][7],
            fragmento_origem: data[i][8],
            fragmento_destino: data[i][9],
            coord_inicio_lat: data[i][10],
            coord_inicio_lng: data[i][11],
            coord_fim_lat: data[i][12],
            coord_fim_lng: data[i][13],
            cobertura_vegetal: data[i][14],
            altura_dossel: data[i][15],
            densidade_arvores: data[i][16],
            presenca_agua: data[i][17],
            vegetacao_dominante: data[i][18],
            conectividade: data[i][19],
            permeabilidade_fauna: data[i][20],
            permeabilidade_flora: data[i][21],
            resistencia: data[i][22],
            especies_registradas: data[i][23],
            especies_alvo: data[i][24],
            frequencia_uso: data[i][25],
            gargalos: data[i][26],
            ameacas: data[i][27],
            fragmentacao: data[i][28],
            qualidade_ia: data[i][29],
            recomendacoes_ia: data[i][30],
            prioridade: data[i][31],
            status: data[i][32],
            responsavel: data[i][33],
            notas: data[i][34]
          };
        }
      }
      
      return null;
    } catch (error) {
      Logger.log(`[_getCorridorById] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Calcula área do corredor em hectares
   * @private
   */
  _calculateArea: function(comprimento, largura) {
    if (!comprimento || !largura) return 0;
    return parseFloat(((comprimento * largura) / 10000).toFixed(2));
  },
  
  /**
   * Calcula índice de conectividade (0-1)
   * @private
   */
  _calculateConnectivity: function(data) {
    let score = 0;
    let factors = 0;
    
    // Fator 1: Largura (peso 0.25)
    if (data.largura_media_m) {
      const larguraScore = Math.min(data.largura_media_m / 200, 1);
      score += larguraScore * 0.25;
      factors++;
    }
    
    // Fator 2: Cobertura vegetal (peso 0.25)
    if (data.cobertura_vegetal) {
      score += (data.cobertura_vegetal / 100) * 0.25;
      factors++;
    }
    
    // Fator 3: Altura do dossel (peso 0.15)
    if (data.altura_dossel) {
      const dosselScore = Math.min(data.altura_dossel / 20, 1);
      score += dosselScore * 0.15;
      factors++;
    }
    
    // Fator 4: Densidade de árvores (peso 0.15)
    if (data.densidade_arvores) {
      const densidadeScore = Math.min(data.densidade_arvores / 500, 1);
      score += densidadeScore * 0.15;
      factors++;
    }
    
    // Fator 5: Presença de água (peso 0.10)
    if (data.presenca_agua) {
      score += 0.10;
    }
    factors++;
    
    // Fator 6: Continuidade (peso 0.10) - baseado em gargalos
    const gargalos = data.gargalos || [];
    const gargalosCount = Array.isArray(gargalos) ? gargalos.length : 0;
    const continuidadeScore = Math.max(0, 1 - (gargalosCount * 0.2));
    score += continuidadeScore * 0.10;
    factors++;
    
    return parseFloat(score.toFixed(3));
  },

  /**
   * Classifica conectividade em texto
   * @private
   */
  _classifyConnectivity: function(index) {
    if (index >= 0.8) return 'Excelente';
    if (index >= 0.6) return 'Boa';
    if (index >= 0.4) return 'Regular';
    if (index >= 0.2) return 'Baixa';
    return 'Muito Baixa';
  },
  
  /**
   * Classifica permeabilidade para fauna ou flora
   * @private
   */
  _classifyPermeability: function(data, tipo) {
    let score = 0;
    
    if (tipo === 'fauna') {
      // Fauna precisa de largura, cobertura e continuidade
      if (data.largura_media_m >= 100) score += 2;
      else if (data.largura_media_m >= 50) score += 1;
      
      if (data.cobertura_vegetal >= 70) score += 2;
      else if (data.cobertura_vegetal >= 40) score += 1;
      
      const gargalos = data.gargalos || [];
      if (gargalos.length === 0) score += 2;
      else if (gargalos.length <= 2) score += 1;
      
      if (data.presenca_agua) score += 1;
      
    } else {
      // Flora precisa de cobertura, densidade e condições de solo
      if (data.cobertura_vegetal >= 80) score += 2;
      else if (data.cobertura_vegetal >= 50) score += 1;
      
      if (data.densidade_arvores >= 400) score += 2;
      else if (data.densidade_arvores >= 200) score += 1;
      
      if (data.altura_dossel >= 15) score += 2;
      else if (data.altura_dossel >= 8) score += 1;
    }
    
    if (score >= 6) return 'Muito_Alta';
    if (score >= 4) return 'Alta';
    if (score >= 3) return 'Média';
    if (score >= 1) return 'Baixa';
    return 'Muito_Baixa';
  },

  /**
   * Calcula resistência ao movimento
   * @private
   */
  _calculateResistance: function(data) {
    // Resistência é inverso da conectividade
    // Valores mais altos = mais difícil atravessar
    let resistance = 1;
    
    // Menor cobertura = maior resistência
    if (data.cobertura_vegetal) {
      resistance += (100 - data.cobertura_vegetal) / 100;
    }
    
    // Menor largura = maior resistência
    if (data.largura_media_m) {
      resistance += Math.max(0, (100 - data.largura_media_m) / 100);
    }
    
    // Gargalos aumentam resistência
    const gargalos = data.gargalos || [];
    resistance += (Array.isArray(gargalos) ? gargalos.length : 0) * 0.3;
    
    return parseFloat(resistance.toFixed(2));
  },
  
  /**
   * Classifica nível de fragmentação
   * @private
   */
  _classifyFragmentation: function(data) {
    const gargalos = data.gargalos || [];
    const numGargalos = Array.isArray(gargalos) ? gargalos.length : 0;
    const cobertura = data.cobertura_vegetal || 0;
    
    if (numGargalos >= 5 || cobertura < 20) return 'Crítico';
    if (numGargalos >= 3 || cobertura < 40) return 'Alto';
    if (numGargalos >= 1 || cobertura < 60) return 'Moderado';
    return 'Baixo';
  },

  /**
   * Analisa estrutura do corredor
   * @private
   */
  _analyzeStructure: function(corridor) {
    return {
      dimensoes: {
        comprimento_m: corridor.comprimento_m,
        largura_media_m: corridor.largura_media_m,
        area_ha: corridor.area_ha
      },
      vegetacao: {
        cobertura_percent: corridor.cobertura_vegetal,
        altura_dossel_m: corridor.altura_dossel,
        densidade_arvores_ha: corridor.densidade_arvores,
        tipo_dominante: corridor.vegetacao_dominante
      },
      recursos: {
        presenca_agua: corridor.presenca_agua,
        tipo_corredor: corridor.tipo
      },
      avaliacao: {
        largura_adequada: corridor.largura_media_m >= 50,
        cobertura_adequada: corridor.cobertura_vegetal >= 60,
        estrutura_vertical: corridor.altura_dossel >= 10
      }
    };
  },
  
  /**
   * Analisa biodiversidade associada ao corredor
   * @private
   */
  _analyzeBiodiversity: function(corridor) {
    const especiesRegistradas = JSON.parse(corridor.especies_registradas || '[]');
    const especiesAlvo = JSON.parse(corridor.especies_alvo || '[]');
    
    return {
      especies_registradas: especiesRegistradas,
      total_especies: especiesRegistradas.length,
      especies_alvo: especiesAlvo,
      frequencia_uso: corridor.frequencia_uso,
      potencial_dispersao: this._evaluateDispersalPotential(corridor)
    };
  },

  /**
   * Avalia potencial de dispersão
   * @private
   */
  _evaluateDispersalPotential: function(corridor) {
    const conectividade = corridor.conectividade || 0;
    const largura = corridor.largura_media_m || 0;
    
    if (conectividade >= 0.7 && largura >= 100) return 'Alto';
    if (conectividade >= 0.4 && largura >= 50) return 'Médio';
    return 'Baixo';
  },
  
  /**
   * Identifica gargalos no corredor
   * @private
   */
  _identifyBottlenecks: function(corridor) {
    const gargalos = JSON.parse(corridor.gargalos || '[]');
    const identificados = [];
    
    // Gargalos registrados
    gargalos.forEach(g => {
      identificados.push({
        tipo: g.tipo || 'Não especificado',
        localizacao: g.localizacao || '',
        severidade: g.severidade || 'Média',
        descricao: g.descricao || ''
      });
    });
    
    // Detecta gargalos automáticos baseado em métricas
    if (corridor.largura_media_m < 30) {
      identificados.push({
        tipo: 'Largura_Insuficiente',
        severidade: 'Alta',
        descricao: `Largura média de ${corridor.largura_media_m}m é insuficiente para fauna de médio porte`
      });
    }
    
    if (corridor.cobertura_vegetal < 40) {
      identificados.push({
        tipo: 'Cobertura_Baixa',
        severidade: 'Alta',
        descricao: `Cobertura vegetal de ${corridor.cobertura_vegetal}% compromete funcionalidade`
      });
    }
    
    return identificados;
  },

  /**
   * Analisa corredor com IA
   * @private
   */
  _analyzeWithAI: function(data, conectividade) {
    try {
      if (typeof GeminiAIService === 'undefined' || !GeminiAIService.generateContent) {
        return this._getDefaultAnalysis(data, conectividade);
      }
      
      const prompt = `
Você é um ecólogo especialista em conectividade de paisagem e corredores ecológicos no Cerrado brasileiro.

**DADOS DO CORREDOR:**
- Nome: ${data.nome || 'Não especificado'}
- Tipo: ${data.tipo || 'Linear'}
- Comprimento: ${data.comprimento_m || 0}m
- Largura média: ${data.largura_media_m || 0}m
- Cobertura vegetal: ${data.cobertura_vegetal || 0}%
- Altura do dossel: ${data.altura_dossel || 0}m
- Densidade de árvores: ${data.densidade_arvores || 0}/ha
- Presença de água: ${data.presenca_agua ? 'Sim' : 'Não'}
- Vegetação dominante: ${data.vegetacao_dominante || 'Não especificada'}
- Índice de conectividade calculado: ${conectividade}

**ANÁLISE REQUERIDA:**
1. Qualidade geral do corredor (Excelente, Boa, Regular, Ruim, Crítica)
2. 3-5 recomendações específicas de manejo/restauração
3. Prioridade de restauração (Muito_Alta, Alta, Média, Baixa)
4. Espécies-alvo que podem se beneficiar

**FORMATO DE RESPOSTA (JSON):**
{
  "qualidade": "Regular",
  "recomendacoes": ["Recomendação 1", "Recomendação 2", "Recomendação 3"],
  "prioridade": "Alta",
  "especies_beneficiadas": ["Espécie 1", "Espécie 2"],
  "justificativa": "Breve justificativa da análise"
}

Retorne APENAS o JSON.
`;
      
      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response && response.candidates && response.candidates[0]) {
        const text = response.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      return this._getDefaultAnalysis(data, conectividade);
      
    } catch (error) {
      Logger.log(`[_analyzeWithAI] Erro: ${error}`);
      return this._getDefaultAnalysis(data, conectividade);
    }
  },

  /**
   * Análise padrão quando IA não está disponível
   * @private
   */
  _getDefaultAnalysis: function(data, conectividade) {
    let qualidade, prioridade;
    const recomendacoes = [];
    
    // Determina qualidade baseado em conectividade
    if (conectividade >= 0.8) {
      qualidade = 'Excelente';
      prioridade = 'Baixa';
    } else if (conectividade >= 0.6) {
      qualidade = 'Boa';
      prioridade = 'Média';
    } else if (conectividade >= 0.4) {
      qualidade = 'Regular';
      prioridade = 'Alta';
    } else if (conectividade >= 0.2) {
      qualidade = 'Ruim';
      prioridade = 'Muito_Alta';
    } else {
      qualidade = 'Crítica';
      prioridade = 'Muito_Alta';
    }
    
    // Gera recomendações baseadas nos dados
    if (data.largura_media_m < 50) {
      recomendacoes.push('Ampliar largura do corredor para mínimo de 50m');
    }
    if (data.cobertura_vegetal < 60) {
      recomendacoes.push('Aumentar cobertura vegetal com plantio de espécies nativas');
    }
    if (data.altura_dossel < 10) {
      recomendacoes.push('Enriquecer com espécies de dossel para aumentar estratificação');
    }
    if (!data.presenca_agua) {
      recomendacoes.push('Considerar criação de pontos de água para fauna');
    }
    if (data.densidade_arvores < 200) {
      recomendacoes.push('Adensar vegetação com plantio de espécies pioneiras e secundárias');
    }
    
    if (recomendacoes.length === 0) {
      recomendacoes.push('Manter monitoramento regular');
      recomendacoes.push('Documentar uso por fauna');
    }
    
    return {
      qualidade: qualidade,
      recomendacoes: recomendacoes,
      prioridade: prioridade,
      especies_beneficiadas: ['Fauna silvestre do Cerrado'],
      justificativa: `Análise baseada em índice de conectividade de ${conectividade}`
    };
  },

  /**
   * Obtém todos os corredores
   * @param {object} filters - Filtros opcionais
   * @returns {Array} Lista de corredores
   */
  getCorridors: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const corridors = [];
      
      for (let i = 1; i < data.length; i++) {
        const corridor = {
          id: data[i][0],
          nome: data[i][1],
          tipo: data[i][3],
          comprimento_m: data[i][5],
          largura_media_m: data[i][6],
          area_ha: data[i][7],
          cobertura_vegetal: data[i][14],
          conectividade: data[i][19],
          permeabilidade_fauna: data[i][20],
          permeabilidade_flora: data[i][21],
          fragmentacao: data[i][28],
          qualidade_ia: data[i][29],
          prioridade: data[i][31],
          status: data[i][32]
        };
        
        // Aplica filtros
        if (filters.status && corridor.status !== filters.status) continue;
        if (filters.tipo && corridor.tipo !== filters.tipo) continue;
        if (filters.prioridade && corridor.prioridade !== filters.prioridade) continue;
        
        corridors.push(corridor);
      }
      
      return corridors;
      
    } catch (error) {
      Logger.log(`[getCorridors] Erro: ${error}`);
      return [];
    }
  },

  /**
   * Obtém estatísticas gerais dos corredores
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const corridors = this.getCorridors();
      
      if (corridors.length === 0) {
        return {
          total: 0,
          area_total_ha: 0,
          comprimento_total_m: 0,
          conectividade_media: 0,
          por_status: {},
          por_tipo: {},
          por_qualidade: {},
          por_prioridade: {}
        };
      }
      
      const stats = {
        total: corridors.length,
        area_total_ha: 0,
        comprimento_total_m: 0,
        conectividade_media: 0,
        por_status: {},
        por_tipo: {},
        por_qualidade: {},
        por_prioridade: {}
      };
      
      let somaConectividade = 0;
      
      corridors.forEach(c => {
        stats.area_total_ha += c.area_ha || 0;
        stats.comprimento_total_m += c.comprimento_m || 0;
        somaConectividade += c.conectividade || 0;
        
        stats.por_status[c.status] = (stats.por_status[c.status] || 0) + 1;
        stats.por_tipo[c.tipo] = (stats.por_tipo[c.tipo] || 0) + 1;
        stats.por_qualidade[c.qualidade_ia] = (stats.por_qualidade[c.qualidade_ia] || 0) + 1;
        stats.por_prioridade[c.prioridade] = (stats.por_prioridade[c.prioridade] || 0) + 1;
      });
      
      stats.area_total_ha = parseFloat(stats.area_total_ha.toFixed(2));
      stats.comprimento_total_km = parseFloat((stats.comprimento_total_m / 1000).toFixed(2));
      stats.conectividade_media = parseFloat((somaConectividade / corridors.length).toFixed(3));
      
      return stats;
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Atualiza status de um corredor
   * @param {string} corridorId - ID do corredor
   * @param {string} newStatus - Novo status
   * @param {string} notas - Notas adicionais
   * @returns {object} Resultado
   */
  updateStatus: function(corridorId, newStatus, notas = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === corridorId) {
          sheet.getRange(i + 1, 33).setValue(newStatus); // Status
          
          if (notas) {
            const notasAtuais = data[i][34] || '';
            const novasNotas = notasAtuais + '\n[' + new Date().toLocaleString('pt-BR') + '] ' + notas;
            sheet.getRange(i + 1, 35).setValue(novasNotas.trim());
          }
          
          return { success: true, message: 'Status atualizado' };
        }
      }
      
      return { success: false, error: 'Corredor não encontrado' };
      
    } catch (error) {
      Logger.log(`[updateStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Gera relatório de conectividade da paisagem
   * @returns {object} Relatório completo
   */
  generateConnectivityReport: function() {
    try {
      const corridors = this.getCorridors();
      const stats = this.getStatistics();
      
      // Análise de rede
      const networkAnalysis = {
        total_corredores: corridors.length,
        corredores_funcionais: corridors.filter(c => c.conectividade >= 0.6).length,
        corredores_criticos: corridors.filter(c => c.prioridade === 'Muito_Alta').length,
        cobertura_total_ha: stats.area_total_ha,
        extensao_total_km: stats.comprimento_total_km
      };
      
      // Prioridades de restauração
      const prioridades = corridors
        .filter(c => c.prioridade === 'Muito_Alta' || c.prioridade === 'Alta')
        .sort((a, b) => (b.area_ha || 0) - (a.area_ha || 0))
        .slice(0, 5);
      
      return {
        success: true,
        data_geracao: new Date().toISOString(),
        resumo: networkAnalysis,
        estatisticas: stats,
        prioridades_restauracao: prioridades,
        recomendacoes_gerais: this._generateGeneralRecommendations(stats, corridors)
      };
      
    } catch (error) {
      Logger.log(`[generateConnectivityReport] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recomendações gerais baseadas nas estatísticas
   * @private
   */
  _generateGeneralRecommendations: function(stats, corridors) {
    const recomendacoes = [];
    
    if (stats.conectividade_media < 0.5) {
      recomendacoes.push('Conectividade média baixa - priorizar restauração dos corredores existentes');
    }
    
    const criticos = corridors.filter(c => c.fragmentacao === 'Crítico').length;
    if (criticos > 0) {
      recomendacoes.push(`${criticos} corredor(es) em estado crítico de fragmentação - ação urgente necessária`);
    }
    
    const semAgua = corridors.filter(c => !c.presenca_agua).length;
    if (semAgua > corridors.length * 0.5) {
      recomendacoes.push('Maioria dos corredores sem recursos hídricos - considerar criação de pontos de água');
    }
    
    if (stats.por_tipo && Object.keys(stats.por_tipo).length < 3) {
      recomendacoes.push('Diversificar tipos de corredores (linear, stepping stone, ripário)');
    }
    
    if (recomendacoes.length === 0) {
      recomendacoes.push('Manter programa de monitoramento regular');
      recomendacoes.push('Documentar uso por fauna para validar funcionalidade');
    }
    
    return recomendacoes;
  },

  /**
   * [Prompt 25] Análise completa de corredor com todos os métricas
   * @param {string} corridorId - ID do corredor
   * @returns {object} Análise completa com conectividade, permeabilidade e tipo
   */
  analyzeCorridorFull: function(corridorId) {
    try {
      const corridor = this._getCorridorById(corridorId);
      
      if (!corridor) {
        return { success: false, error: 'Corredor não encontrado' };
      }
      
      // Análise estrutural básica
      const estrutura = this._analyzeStructure(corridor);
      
      // Índice de conectividade
      const conectividade = {
        indice: corridor.conectividade,
        classificacao: this._classifyConnectivity(corridor.conectividade),
        fatores: this._getConnectivityFactors(corridor)
      };
      
      // [Prompt 25] Permeabilidade por grupo de fauna
      const permeabilidadeFauna = this._assessFaunaPermeabilityByGroup(corridor);
      
      // [Prompt 25] Classificação do tipo de corredor
      const tipoCorreidor = this._classifyCorridorType(corridor);
      
      // Identificação de gargalos
      const gargalos = this._identifyBottlenecks(corridor);
      
      // [Prompt 25] Plano de restauração
      const planoRestauracao = this._generateRestorationPlan(corridor, conectividade, permeabilidadeFauna, gargalos);
      
      // Análise com IA
      const aiAnalysis = this._analyzeWithAI(corridor, corridor.conectividade);
      
      return {
        success: true,
        corridor: {
          id: corridorId,
          nome: corridor.nome,
          tipo_registrado: corridor.tipo,
          status: corridor.status
        },
        estrutura: estrutura,
        conectividade: conectividade,
        permeabilidade_fauna: permeabilidadeFauna,
        tipo_corredor: tipoCorreidor,
        gargalos: gargalos,
        ameacas: JSON.parse(corridor.ameacas || '[]'),
        plano_restauracao: planoRestauracao,
        ia_analise: aiAnalysis,
        funcionalidade: this._assessOverallFunctionality(conectividade, permeabilidadeFauna, tipoCorreidor)
      };
      
    } catch (error) {
      Logger.log(`[analyzeCorridorFull] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * [Prompt 25] Avalia permeabilidade por grupo de fauna
   * @private
   * @param {object} corridor - Dados do corredor
   * @returns {object} Permeabilidade por grupo
   */
  _assessFaunaPermeabilityByGroup: function(corridor) {
    const result = {};
    const largura = corridor.largura_media_m || 0;
    const cobertura = corridor.cobertura_vegetal || 0;
    const conectividade = corridor.conectividade || 0;
    const presencaAgua = corridor.presenca_agua;
    const gargalos = JSON.parse(corridor.gargalos || '[]');
    
    for (const [grupo, criterios] of Object.entries(this.FAUNA_PERMEABILITY_MATRIX)) {
      let score = 0;
      const avaliacoes = [];
      
      // Avalia largura
      const larguraAdequada = largura >= criterios.min_width;
      if (larguraAdequada) {
        score += 0.35;
        avaliacoes.push({ criterio: 'Largura', status: 'Adequada', valor: `${largura}m ≥ ${criterios.min_width}m` });
      } else {
        avaliacoes.push({ criterio: 'Largura', status: 'Insuficiente', valor: `${largura}m < ${criterios.min_width}m` });
      }
      
      // Avalia cobertura
      const coberturaAdequada = cobertura >= criterios.min_coverage;
      if (coberturaAdequada) {
        score += 0.30;
        avaliacoes.push({ criterio: 'Cobertura', status: 'Adequada', valor: `${cobertura}% ≥ ${criterios.min_coverage}%` });
      } else {
        avaliacoes.push({ criterio: 'Cobertura', status: 'Insuficiente', valor: `${cobertura}% < ${criterios.min_coverage}%` });
      }
      
      // Avalia conectividade
      const conectividadeAdequada = conectividade >= criterios.connectivity_threshold;
      if (conectividadeAdequada) {
        score += 0.25;
        avaliacoes.push({ criterio: 'Conectividade', status: 'Adequada', valor: `${conectividade.toFixed(2)} ≥ ${criterios.connectivity_threshold}` });
      } else {
        avaliacoes.push({ criterio: 'Conectividade', status: 'Insuficiente', valor: `${conectividade.toFixed(2)} < ${criterios.connectivity_threshold}` });
      }
      
      // Avalia presença de água (se requerido)
      if (criterios.requires_water) {
        if (presencaAgua) {
          score += 0.10;
          avaliacoes.push({ criterio: 'Água', status: 'Presente', valor: 'Sim' });
        } else {
          avaliacoes.push({ criterio: 'Água', status: 'Ausente', valor: 'Não (requerido para este grupo)' });
        }
      } else {
        score += 0.10; // Não requerido, pontua automaticamente
      }
      
      // Penaliza por gargalos
      if (gargalos.length > 0) {
        const penalidade = Math.min(gargalos.length * 0.05, 0.15);
        score -= penalidade;
      }
      
      score = Math.max(0, Math.min(1, score));
      
      result[grupo] = {
        nome: criterios.nome,
        exemplos: criterios.exemplos,
        adequado: score >= 0.6,
        score: parseFloat(score.toFixed(2)),
        classificacao: score >= 0.8 ? 'Muito_Alta' : score >= 0.6 ? 'Alta' : score >= 0.4 ? 'Média' : score >= 0.2 ? 'Baixa' : 'Muito_Baixa',
        avaliacoes: avaliacoes,
        recomendacao: score < 0.6 ? this._getPermeabilityRecommendation(grupo, avaliacoes) : 'Corredor adequado para este grupo'
      };
    }
    
    return result;
  },

  /**
   * Gera recomendação específica para melhorar permeabilidade
   * @private
   */
  _getPermeabilityRecommendation: function(grupo, avaliacoes) {
    const problemas = avaliacoes.filter(a => a.status !== 'Adequada' && a.status !== 'Presente');
    if (problemas.length === 0) return 'Manter monitoramento';
    
    const recomendacoes = [];
    problemas.forEach(p => {
      if (p.criterio === 'Largura') {
        recomendacoes.push(`Ampliar largura do corredor para atender ${this.FAUNA_PERMEABILITY_MATRIX[grupo].min_width}m`);
      } else if (p.criterio === 'Cobertura') {
        recomendacoes.push(`Aumentar cobertura vegetal para ${this.FAUNA_PERMEABILITY_MATRIX[grupo].min_coverage}%`);
      } else if (p.criterio === 'Conectividade') {
        recomendacoes.push('Melhorar continuidade e estrutura do corredor');
      } else if (p.criterio === 'Água') {
        recomendacoes.push('Criar pontos de água para anfíbios');
      }
    });
    
    return recomendacoes.join('; ');
  },

  /**
   * [Prompt 25] Classifica o tipo de corredor baseado em critérios
   * @private
   * @param {object} corridor - Dados do corredor
   * @returns {object} Classificação do tipo de corredor
   */
  _classifyCorridorType: function(corridor) {
    const largura = corridor.largura_media_m || 0;
    const cobertura = corridor.cobertura_vegetal || 0;
    const presencaAgua = corridor.presenca_agua;
    const gargalos = JSON.parse(corridor.gargalos || '[]');
    const tipoRegistrado = corridor.tipo;
    
    const avaliacoes = {};
    
    // Avalia critérios para Linear
    const linearCriteria = this.CORRIDOR_TYPE_CRITERIA.Linear;
    const linearAtendidos = [];
    const linearNaoAtendidos = [];
    
    if (largura >= linearCriteria.min_width) {
      linearAtendidos.push(`Largura ≥ ${linearCriteria.min_width}m`);
    } else {
      linearNaoAtendidos.push(`Largura < ${linearCriteria.min_width}m (atual: ${largura}m)`);
    }
    
    if (cobertura >= linearCriteria.min_coverage) {
      linearAtendidos.push(`Cobertura ≥ ${linearCriteria.min_coverage}%`);
    } else {
      linearNaoAtendidos.push(`Cobertura < ${linearCriteria.min_coverage}% (atual: ${cobertura}%)`);
    }
    
    const temGapGrande = gargalos.some(g => g.largura && g.largura > linearCriteria.max_gap);
    if (!temGapGrande && gargalos.length <= 2) {
      linearAtendidos.push('Continuidade adequada');
    } else {
      linearNaoAtendidos.push('Descontinuidades significativas');
    }
    
    avaliacoes.Linear = {
      atende: linearNaoAtendidos.length === 0,
      score: linearAtendidos.length / (linearAtendidos.length + linearNaoAtendidos.length),
      criterios_atendidos: linearAtendidos,
      criterios_nao_atendidos: linearNaoAtendidos
    };
    
    // Avalia critérios para Stepping Stone
    const steppingCriteria = this.CORRIDOR_TYPE_CRITERIA.Stepping_Stone;
    const steppingAtendidos = [];
    const steppingNaoAtendidos = [];
    
    // Stepping stone é mais tolerante a descontinuidades
    if (gargalos.length >= 1) {
      steppingAtendidos.push('Estrutura em patches identificada');
    } else {
      steppingNaoAtendidos.push('Sem estrutura de patches clara');
    }
    
    if (cobertura >= 30) {
      steppingAtendidos.push('Cobertura mínima para patches');
    } else {
      steppingNaoAtendidos.push('Cobertura insuficiente');
    }
    
    avaliacoes.Stepping_Stone = {
      atende: steppingAtendidos.length >= 1 && !avaliacoes.Linear.atende,
      score: steppingAtendidos.length / Math.max(1, steppingAtendidos.length + steppingNaoAtendidos.length),
      criterios_atendidos: steppingAtendidos,
      criterios_nao_atendidos: steppingNaoAtendidos
    };
    
    // Avalia critérios para Ripário
    const riparioCriteria = this.CORRIDOR_TYPE_CRITERIA.Ripario;
    const riparioAtendidos = [];
    const riparioNaoAtendidos = [];
    
    if (presencaAgua) {
      riparioAtendidos.push('Presença de água');
    } else {
      riparioNaoAtendidos.push('Sem presença de água');
    }
    
    if (largura >= riparioCriteria.min_width) {
      riparioAtendidos.push(`Largura ≥ ${riparioCriteria.min_width}m (APP)`);
    } else {
      riparioNaoAtendidos.push(`Largura < ${riparioCriteria.min_width}m`);
    }
    
    avaliacoes.Ripario = {
      atende: presencaAgua && largura >= riparioCriteria.min_width,
      score: riparioAtendidos.length / (riparioAtendidos.length + riparioNaoAtendidos.length),
      criterios_atendidos: riparioAtendidos,
      criterios_nao_atendidos: riparioNaoAtendidos
    };
    
    // Determina melhor classificação
    let melhorTipo = 'Matriz_Permeavel';
    let melhorScore = 0;
    
    for (const [tipo, avaliacao] of Object.entries(avaliacoes)) {
      if (avaliacao.atende && avaliacao.score > melhorScore) {
        melhorTipo = tipo;
        melhorScore = avaliacao.score;
      }
    }
    
    // Se ripário atende e tem água, prioriza
    if (avaliacoes.Ripario.atende) {
      melhorTipo = 'Ripario';
    }
    
    return {
      classificacao: melhorTipo,
      tipo_registrado: tipoRegistrado,
      funcional: melhorTipo !== 'Matriz_Permeavel',
      descricao: this.CORRIDOR_TYPE_CRITERIA[melhorTipo]?.description || 'Matriz com baixa conectividade',
      avaliacoes: avaliacoes,
      recomendacao_tipo: this._getTypeRecommendation(melhorTipo, avaliacoes)
    };
  },

  /**
   * Gera recomendação para melhorar tipo de corredor
   * @private
   */
  _getTypeRecommendation: function(tipoAtual, avaliacoes) {
    if (tipoAtual === 'Linear' && avaliacoes.Linear.atende) {
      return 'Corredor linear funcional - manter e monitorar';
    }
    
    if (tipoAtual === 'Matriz_Permeavel') {
      const linearFaltantes = avaliacoes.Linear.criterios_nao_atendidos;
      if (linearFaltantes.length <= 2) {
        return `Para tornar corredor linear funcional: ${linearFaltantes.join('; ')}`;
      }
      return 'Considerar estratégia de stepping stones com plantio de patches';
    }
    
    if (tipoAtual === 'Stepping_Stone') {
      return 'Manter patches existentes e considerar conexão gradual para corredor linear';
    }
    
    if (tipoAtual === 'Ripario') {
      return 'Corredor ripário - garantir largura mínima de APP e enriquecer vegetação';
    }
    
    return 'Avaliar viabilidade de restauração';
  },

  /**
   * [Prompt 25] Gera plano de restauração detalhado
   * @private
   */
  _generateRestorationPlan: function(corridor, conectividade, permeabilidade, gargalos) {
    const acoes = [];
    let prioridade = 'Baixa';
    let custoEstimado = 0;
    
    // Analisa deficiências
    const largura = corridor.largura_media_m || 0;
    const cobertura = corridor.cobertura_vegetal || 0;
    const densidade = corridor.densidade_arvores || 0;
    const dossel = corridor.altura_dossel || 0;
    
    // Ação 1: Ampliação de largura
    if (largura < 50) {
      acoes.push({
        acao: 'Ampliar largura do corredor',
        descricao: `Expandir de ${largura}m para mínimo 50m`,
        prioridade: 'Alta',
        area_estimada_ha: ((50 - largura) * (corridor.comprimento_m || 100)) / 10000,
        custo_estimado: ((50 - largura) * (corridor.comprimento_m || 100) / 10000) * 15000
      });
      prioridade = 'Alta';
      custoEstimado += ((50 - largura) * (corridor.comprimento_m || 100) / 10000) * 15000;
    }
    
    // Ação 2: Aumento de cobertura
    if (cobertura < 60) {
      const areaPlantio = (corridor.area_ha || 1) * ((60 - cobertura) / 100);
      acoes.push({
        acao: 'Aumentar cobertura vegetal',
        descricao: `Elevar cobertura de ${cobertura}% para 60%`,
        prioridade: cobertura < 40 ? 'Alta' : 'Média',
        area_plantio_ha: parseFloat(areaPlantio.toFixed(2)),
        custo_estimado: areaPlantio * 12000
      });
      if (cobertura < 40) prioridade = 'Alta';
      custoEstimado += areaPlantio * 12000;
    }
    
    // Ação 3: Adensamento
    if (densidade < 200) {
      acoes.push({
        acao: 'Adensar vegetação',
        descricao: `Aumentar densidade de ${densidade} para 200+ árvores/ha`,
        prioridade: 'Média',
        mudas_estimadas: Math.ceil((200 - densidade) * (corridor.area_ha || 1)),
        custo_estimado: Math.ceil((200 - densidade) * (corridor.area_ha || 1)) * 25
      });
      custoEstimado += Math.ceil((200 - densidade) * (corridor.area_ha || 1)) * 25;
    }
    
    // Ação 4: Enriquecimento de dossel
    if (dossel < 10) {
      acoes.push({
        acao: 'Enriquecer estrato superior',
        descricao: 'Plantar espécies de dossel para aumentar estratificação',
        prioridade: 'Média',
        especies_sugeridas: this.CERRADO_RESTORATION_SPECIES.secundarias.map(e => e.comum)
      });
    }
    
    // Ação 5: Resolver gargalos
    if (gargalos.length > 0) {
      acoes.push({
        acao: 'Eliminar gargalos',
        descricao: `Restaurar ${gargalos.length} ponto(s) de estrangulamento`,
        prioridade: 'Alta',
        gargalos_identificados: gargalos.length
      });
      prioridade = 'Alta';
    }
    
    // Ação 6: Criar pontos de água (se não tem)
    if (!corridor.presenca_agua) {
      acoes.push({
        acao: 'Criar recursos hídricos',
        descricao: 'Instalar bebedouros ou criar pequenas poças para fauna',
        prioridade: 'Baixa',
        custo_estimado: 2000
      });
      custoEstimado += 2000;
    }
    
    // Seleciona espécies recomendadas
    const especiesRecomendadas = [];
    if (cobertura < 40) {
      especiesRecomendadas.push(...this.CERRADO_RESTORATION_SPECIES.pioneiras);
    }
    if (cobertura >= 40 && cobertura < 70) {
      especiesRecomendadas.push(...this.CERRADO_RESTORATION_SPECIES.secundarias);
    }
    if (cobertura >= 70) {
      especiesRecomendadas.push(...this.CERRADO_RESTORATION_SPECIES.climacicas);
    }
    if (corridor.presenca_agua) {
      especiesRecomendadas.push(...this.CERRADO_RESTORATION_SPECIES.riparias);
    }
    
    // Determina prioridade final
    if (conectividade.indice < 0.3) prioridade = 'Muito_Alta';
    else if (conectividade.indice < 0.5) prioridade = 'Alta';
    
    // Grupos de fauna não atendidos
    const gruposNaoAtendidos = Object.entries(permeabilidade)
      .filter(([_, v]) => !v.adequado)
      .map(([k, v]) => v.nome);
    
    return {
      prioridade: prioridade,
      acoes: acoes,
      especies_recomendadas: especiesRecomendadas.slice(0, 10),
      custo_total_estimado: `R$ ${custoEstimado.toLocaleString('pt-BR')}`,
      grupos_fauna_nao_atendidos: gruposNaoAtendidos,
      timeline_sugerido: prioridade === 'Muito_Alta' ? '6 meses' : prioridade === 'Alta' ? '1 ano' : '2 anos',
      monitoramento: 'Avaliar resultados anualmente com levantamento de fauna'
    };
  },

  /**
   * Obtém fatores de conectividade detalhados
   * @private
   */
  _getConnectivityFactors: function(corridor) {
    return {
      largura: {
        valor: corridor.largura_media_m,
        contribuicao: Math.min((corridor.largura_media_m || 0) / 200, 1) * 0.25
      },
      cobertura: {
        valor: corridor.cobertura_vegetal,
        contribuicao: ((corridor.cobertura_vegetal || 0) / 100) * 0.25
      },
      dossel: {
        valor: corridor.altura_dossel,
        contribuicao: Math.min((corridor.altura_dossel || 0) / 20, 1) * 0.15
      },
      densidade: {
        valor: corridor.densidade_arvores,
        contribuicao: Math.min((corridor.densidade_arvores || 0) / 500, 1) * 0.15
      },
      agua: {
        valor: corridor.presenca_agua,
        contribuicao: corridor.presenca_agua ? 0.10 : 0
      },
      continuidade: {
        gargalos: JSON.parse(corridor.gargalos || '[]').length,
        contribuicao: Math.max(0, 1 - (JSON.parse(corridor.gargalos || '[]').length * 0.2)) * 0.10
      }
    };
  },

  /**
   * Avalia funcionalidade geral do corredor
   * @private
   */
  _assessOverallFunctionality: function(conectividade, permeabilidade, tipoCorreidor) {
    const gruposAdequados = Object.values(permeabilidade).filter(p => p.adequado).length;
    const totalGrupos = Object.keys(permeabilidade).length;
    
    let funcionalidade;
    if (conectividade.indice >= 0.7 && gruposAdequados >= 4 && tipoCorreidor.funcional) {
      funcionalidade = 'Alta';
    } else if (conectividade.indice >= 0.5 && gruposAdequados >= 3) {
      funcionalidade = 'Média';
    } else if (conectividade.indice >= 0.3 && gruposAdequados >= 2) {
      funcionalidade = 'Baixa';
    } else {
      funcionalidade = 'Muito_Baixa';
    }
    
    return {
      nivel: funcionalidade,
      conectividade_indice: conectividade.indice,
      grupos_fauna_atendidos: `${gruposAdequados}/${totalGrupos}`,
      tipo_funcional: tipoCorreidor.funcional,
      resumo: `Corredor com funcionalidade ${funcionalidade.toLowerCase().replace('_', ' ')} - atende ${gruposAdequados} de ${totalGrupos} grupos de fauna`
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P04 Corredores Ecológicos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de corredores ecológicos
 * @returns {object} Resultado
 */
function apiCorredoresInit() {
  return EcologicalCorridorAnalyzer.initializeSheet();
}

/**
 * Cria um novo corredor ecológico
 * @param {object} data - Dados do corredor
 * @returns {object} Resultado com ID e análise
 */
function apiCorredoresCreate(data) {
  return EcologicalCorridorAnalyzer.createCorridor(data);
}

/**
 * Analisa um corredor específico
 * @param {string} corridorId - ID do corredor
 * @returns {object} Análise completa
 */
function apiCorredoresAnalyze(corridorId) {
  return EcologicalCorridorAnalyzer.analyzeCorridor(corridorId);
}

/**
 * Lista todos os corredores
 * @param {object} filters - Filtros opcionais (status, tipo, prioridade)
 * @returns {Array} Lista de corredores
 */
function apiCorredoresList(filters) {
  return EcologicalCorridorAnalyzer.getCorridors(filters || {});
}

/**
 * Obtém estatísticas dos corredores
 * @returns {object} Estatísticas gerais
 */
function apiCorredoresStats() {
  return EcologicalCorridorAnalyzer.getStatistics();
}

/**
 * Atualiza status de um corredor
 * @param {string} corridorId - ID do corredor
 * @param {string} status - Novo status
 * @param {string} notas - Notas opcionais
 * @returns {object} Resultado
 */
function apiCorredoresUpdateStatus(corridorId, status, notas) {
  return EcologicalCorridorAnalyzer.updateStatus(corridorId, status, notas);
}

/**
 * Gera relatório de conectividade da paisagem
 * @returns {object} Relatório completo
 */
function apiCorredoresReport() {
  return EcologicalCorridorAnalyzer.generateConnectivityReport();
}

/**
 * [Prompt 25] Análise completa de corredor com conectividade e permeabilidade
 * @param {string} corridorId - ID do corredor
 * @returns {object} Análise completa com todos os métricas
 */
function apiCorredoresAnalyzeFull(corridorId) {
  return EcologicalCorridorAnalyzer.analyzeCorridorFull(corridorId);
}

/**
 * [Prompt 25] Classifica tipo de corredor (Linear, Stepping Stone, Ripário)
 * @param {string} corridorId - ID do corredor
 * @returns {object} Classificação do tipo de corredor
 */
function apiCorredoresClassifyType(corridorId) {
  try {
    const corridor = EcologicalCorridorAnalyzer._getCorridorById(corridorId);
    if (!corridor) {
      return { success: false, error: 'Corredor não encontrado' };
    }
    
    const classificacao = EcologicalCorridorAnalyzer._classifyCorridorType(corridor);
    
    return {
      success: true,
      corridor_id: corridorId,
      nome: corridor.nome,
      classificacao: classificacao
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * [Prompt 25] Obtém permeabilidade por grupo de fauna
 * @param {string} corridorId - ID do corredor
 * @param {string} faunaGroup - Grupo de fauna (opcional - se não informado, retorna todos)
 * @returns {object} Permeabilidade por grupo
 */
function apiCorredoresGetPermeability(corridorId, faunaGroup) {
  try {
    const corridor = EcologicalCorridorAnalyzer._getCorridorById(corridorId);
    if (!corridor) {
      return { success: false, error: 'Corredor não encontrado' };
    }
    
    const permeabilidade = EcologicalCorridorAnalyzer._assessFaunaPermeabilityByGroup(corridor);
    
    if (faunaGroup && permeabilidade[faunaGroup]) {
      return {
        success: true,
        corridor_id: corridorId,
        grupo: faunaGroup,
        permeabilidade: permeabilidade[faunaGroup]
      };
    }
    
    return {
      success: true,
      corridor_id: corridorId,
      nome: corridor.nome,
      permeabilidade_por_grupo: permeabilidade,
      resumo: {
        grupos_adequados: Object.values(permeabilidade).filter(p => p.adequado).length,
        total_grupos: Object.keys(permeabilidade).length
      }
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * [Prompt 25] Obtém critérios de tipo de corredor
 * @returns {object} Critérios para cada tipo de corredor
 */
function apiCorredoresGetTypeCriteria() {
  return {
    success: true,
    criterios: EcologicalCorridorAnalyzer.CORRIDOR_TYPE_CRITERIA,
    matriz_permeabilidade: EcologicalCorridorAnalyzer.FAUNA_PERMEABILITY_MATRIX
  };
}
