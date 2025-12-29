/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE BANCO DE SEMENTES DO SOLO
 * ═══════════════════════════════════════════════════════════════════════════
 * P28 - Avaliação do Potencial de Regeneração via Banco de Sementes
 * 
 * Funcionalidades:
 * - Coleta padronizada de amostras
 * - Germinação controlada em viveiro
 * - Identificação de plântulas
 * - Densidade de sementes/m²
 * - Viabilidade de sementes
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const AMOSTRAS_HEADERS = [
  'ID_Amostra', 'ID_Ponto', 'Data_Coleta', 'Latitude', 'Longitude',
  'Profundidade_cm', 'Volume_cm3', 'Tipo_Solo', 'Cobertura_Vegetal',
  'Serrapilheira_cm', 'Umidade_Percent', 'Status', 'Observacoes'
];

const GERMINACAO_HEADERS = [
  'ID_Germinacao', 'ID_Amostra', 'Data_Inicio', 'Data_Fim', 'Dias_Monitoramento',
  'Total_Germinadas', 'Total_Especies', 'Densidade_sem_m2', 'Tratamento',
  'Condicoes', 'Observador'
];

const PLANTULAS_HEADERS = [
  'ID_Plantula', 'ID_Germinacao', 'Especie', 'Nome_Popular', 'Familia',
  'Grupo_Ecologico', 'Forma_Vida', 'Data_Germinacao', 'Dias_Germinacao',
  'Quantidade', 'Identificacao_Confirmada'
];

/**
 * Sistema de Análise de Banco de Sementes
 * @namespace SeedBank
 */
const SeedBank = {
  
  SHEET_AMOSTRAS: 'AMOSTRAS_BANCO_SEMENTES_RA',
  SHEET_GERMINACAO: 'GERMINACAO_SEMENTES_RA',
  SHEET_PLANTULAS: 'PLANTULAS_BANCO_RA',
  
  /**
   * Grupos ecológicos
   */
  GRUPOS_ECOLOGICOS: {
    'Pioneira': { descricao: 'Colonizadoras, alta produção de sementes', longevidade_banco: 'Alta' },
    'Secundária Inicial': { descricao: 'Crescimento rápido, tolerância parcial à sombra', longevidade_banco: 'Média' },
    'Secundária Tardia': { descricao: 'Crescimento lento, tolerância à sombra', longevidade_banco: 'Baixa' },
    'Climácica': { descricao: 'Dependente de sombra, sementes recalcitrantes', longevidade_banco: 'Muito Baixa' }
  },
  
  /**
   * Formas de vida
   */
  FORMAS_VIDA: ['Árvore', 'Arbusto', 'Erva', 'Liana', 'Gramínea', 'Pteridófita'],
  
  /**
   * Espécies comuns em banco de sementes do Cerrado
   */
  ESPECIES_BANCO_CERRADO: {
    'Solanum lycocarpum': { popular: 'Lobeira', grupo: 'Pioneira', forma: 'Arbusto' },
    'Cecropia pachystachya': { popular: 'Embaúba', grupo: 'Pioneira', forma: 'Árvore' },
    'Trema micrantha': { popular: 'Grandiúva', grupo: 'Pioneira', forma: 'Árvore' },
    'Croton urucurana': { popular: 'Sangra-d\'água', grupo: 'Pioneira', forma: 'Árvore' },
    'Vernonia polyanthes': { popular: 'Assa-peixe', grupo: 'Pioneira', forma: 'Arbusto' },
    'Baccharis dracunculifolia': { popular: 'Alecrim-do-campo', grupo: 'Pioneira', forma: 'Arbusto' },
    'Senna alata': { popular: 'Fedegoso', grupo: 'Pioneira', forma: 'Arbusto' },
    'Mimosa pudica': { popular: 'Dormideira', grupo: 'Pioneira', forma: 'Erva' }
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de amostras
      let sheetAmostras = ss.getSheetByName(this.SHEET_AMOSTRAS);
      if (!sheetAmostras) {
        sheetAmostras = ss.insertSheet(this.SHEET_AMOSTRAS);
        sheetAmostras.appendRow(AMOSTRAS_HEADERS);
        this._formatHeader(sheetAmostras, AMOSTRAS_HEADERS.length, '#795548');
      }
      
      // Planilha de germinação
      let sheetGerm = ss.getSheetByName(this.SHEET_GERMINACAO);
      if (!sheetGerm) {
        sheetGerm = ss.insertSheet(this.SHEET_GERMINACAO);
        sheetGerm.appendRow(GERMINACAO_HEADERS);
        this._formatHeader(sheetGerm, GERMINACAO_HEADERS.length, '#8D6E63');
      }
      
      // Planilha de plântulas
      let sheetPlant = ss.getSheetByName(this.SHEET_PLANTULAS);
      if (!sheetPlant) {
        sheetPlant = ss.insertSheet(this.SHEET_PLANTULAS);
        sheetPlant.appendRow(PLANTULAS_HEADERS);
        this._formatHeader(sheetPlant, PLANTULAS_HEADERS.length, '#A1887F');
      }
      
      return { success: true, sheets: [this.SHEET_AMOSTRAS, this.SHEET_GERMINACAO, this.SHEET_PLANTULAS] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  _formatHeader: function(sheet, cols, color) {
    const headerRange = sheet.getRange(1, 1, 1, cols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  /**
   * Registra coleta de amostra de solo
   */
  registerSample: function(sampleData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AMOSTRAS);
      
      const sampleId = `AMS-${Date.now().toString(36).toUpperCase()}`;
      const profundidade = sampleData.profundidade || 5;
      const area = sampleData.area_cm2 || 625; // 25x25cm padrão
      const volume = area * profundidade;
      
      const row = [
        sampleId,
        sampleData.ponto_id || `PT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        sampleData.data || new Date().toISOString().split('T')[0],
        sampleData.latitude || -13.4,
        sampleData.longitude || -46.3,
        profundidade,
        volume,
        sampleData.tipo_solo || 'Latossolo',
        sampleData.cobertura || 'Cerrado',
        sampleData.serrapilheira || 0,
        sampleData.umidade || 0,
        'Coletada',
        sampleData.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
      return { 
        success: true, 
        sample_id: sampleId, 
        volume_cm3: volume,
        area_m2_equivalente: area / 10000
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista amostras
   */
  listSamples: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AMOSTRAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, samples: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const samples = [];
      
      for (let i = 1; i < data.length; i++) {
        const sample = {
          id: data[i][0],
          ponto_id: data[i][1],
          data: data[i][2],
          latitude: data[i][3],
          longitude: data[i][4],
          profundidade: data[i][5],
          volume: data[i][6],
          tipo_solo: data[i][7],
          cobertura: data[i][8],
          status: data[i][11]
        };
        
        if (filters.status && sample.status !== filters.status) continue;
        samples.push(sample);
      }
      
      return { success: true, samples: samples, count: samples.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Inicia experimento de germinação
   */
  startGermination: function(germData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_GERMINACAO);
      
      const germId = `GER-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        germId,
        germData.amostra_id || '',
        germData.data_inicio || new Date().toISOString().split('T')[0],
        '', // Data fim
        0,  // Dias monitoramento
        0,  // Total germinadas
        0,  // Total espécies
        0,  // Densidade
        germData.tratamento || 'Controle',
        germData.condicoes || 'Casa de vegetação, irrigação diária',
        germData.observador || 'Sistema'
      ];
      
      sheet.appendRow(row);
      
      // Atualiza status da amostra
      this._updateSampleStatus(germData.amostra_id, 'Em Germinação');
      
      return { success: true, germination_id: germId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status da amostra
   * @private
   */
  _updateSampleStatus: function(sampleId, status) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AMOSTRAS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sampleId) {
          sheet.getRange(i + 1, 12).setValue(status);
          break;
        }
      }
    } catch (error) {
      Logger.log(`[_updateSampleStatus] Erro: ${error}`);
    }
  },

  /**
   * Registra plântula germinada
   */
  registerSeedling: function(seedlingData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PLANTULAS);
      
      const seedlingId = `PLT-${Date.now().toString(36).toUpperCase()}`;
      
      // Busca informações da espécie no catálogo
      const especieInfo = this.ESPECIES_BANCO_CERRADO[seedlingData.especie] || {};
      
      const row = [
        seedlingId,
        seedlingData.germinacao_id || '',
        seedlingData.especie || 'Não identificada',
        seedlingData.nome_popular || especieInfo.popular || '',
        seedlingData.familia || '',
        seedlingData.grupo || especieInfo.grupo || 'Pioneira',
        seedlingData.forma || especieInfo.forma || 'Erva',
        seedlingData.data || new Date().toISOString().split('T')[0],
        seedlingData.dias || 0,
        seedlingData.quantidade || 1,
        seedlingData.confirmada ? 'Sim' : 'Não'
      ];
      
      sheet.appendRow(row);
      
      return { 
        success: true, 
        seedling_id: seedlingId,
        grupo_ecologico: row[5],
        forma_vida: row[6]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Finaliza experimento de germinação
   */
  finishGermination: function(germId) {
    try {
      const ss = getSpreadsheet();
      
      // Obtém dados da germinação
      const sheetGerm = ss.getSheetByName(this.SHEET_GERMINACAO);
      const germData = sheetGerm.getDataRange().getValues();
      let germRow = -1;
      let amostraId = '';
      let dataInicio = null;
      
      for (let i = 1; i < germData.length; i++) {
        if (germData[i][0] === germId) {
          germRow = i + 1;
          amostraId = germData[i][1];
          dataInicio = new Date(germData[i][2]);
          break;
        }
      }
      
      if (germRow < 0) {
        return { success: false, error: 'Germinação não encontrada' };
      }
      
      // Conta plântulas
      const sheetPlant = ss.getSheetByName(this.SHEET_PLANTULAS);
      const plantData = sheetPlant.getDataRange().getValues();
      
      let totalGerminadas = 0;
      const especies = new Set();
      
      for (let i = 1; i < plantData.length; i++) {
        if (plantData[i][1] === germId) {
          totalGerminadas += plantData[i][9] || 1;
          especies.add(plantData[i][2]);
        }
      }
      
      // Calcula densidade (sementes/m²)
      const samplesResult = this.listSamples();
      const amostra = samplesResult.samples.find(s => s.id === amostraId);
      const areaM2 = amostra ? amostra.volume / 50000 : 0.0625; // Volume/5cm profundidade = área
      const densidade = areaM2 > 0 ? Math.round(totalGerminadas / areaM2) : 0;
      
      // Atualiza registro
      const dataFim = new Date();
      const dias = Math.round((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
      
      sheetGerm.getRange(germRow, 4).setValue(dataFim.toISOString().split('T')[0]);
      sheetGerm.getRange(germRow, 5).setValue(dias);
      sheetGerm.getRange(germRow, 6).setValue(totalGerminadas);
      sheetGerm.getRange(germRow, 7).setValue(especies.size);
      sheetGerm.getRange(germRow, 8).setValue(densidade);
      
      // Atualiza status da amostra
      this._updateSampleStatus(amostraId, 'Concluída');
      
      return {
        success: true,
        germination_id: germId,
        resultados: {
          dias_monitoramento: dias,
          total_germinadas: totalGerminadas,
          total_especies: especies.size,
          densidade_sem_m2: densidade,
          especies: Array.from(especies)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa potencial de regeneração
   */
  analyzeRegenerationPotential: function() {
    try {
      const ss = getSpreadsheet();
      
      // Obtém todas as germinações concluídas
      const sheetGerm = ss.getSheetByName(this.SHEET_GERMINACAO);
      if (!sheetGerm || sheetGerm.getLastRow() < 2) {
        return { success: false, error: 'Sem dados de germinação' };
      }
      
      const germData = sheetGerm.getDataRange().getValues();
      const germinacoes = [];
      
      for (let i = 1; i < germData.length; i++) {
        if (germData[i][3]) { // Tem data fim
          germinacoes.push({
            id: germData[i][0],
            total: germData[i][5],
            especies: germData[i][6],
            densidade: germData[i][7]
          });
        }
      }
      
      if (germinacoes.length === 0) {
        return { success: false, error: 'Nenhuma germinação concluída' };
      }
      
      // Obtém plântulas
      const sheetPlant = ss.getSheetByName(this.SHEET_PLANTULAS);
      const plantData = sheetPlant.getDataRange().getValues();
      
      const porGrupo = { 'Pioneira': 0, 'Secundária Inicial': 0, 'Secundária Tardia': 0, 'Climácica': 0 };
      const porForma = {};
      const especiesTotal = new Set();
      let totalPlantulas = 0;
      
      for (let i = 1; i < plantData.length; i++) {
        const qtd = plantData[i][9] || 1;
        totalPlantulas += qtd;
        especiesTotal.add(plantData[i][2]);
        
        const grupo = plantData[i][5];
        if (porGrupo[grupo] !== undefined) porGrupo[grupo] += qtd;
        
        const forma = plantData[i][6];
        porForma[forma] = (porForma[forma] || 0) + qtd;
      }
      
      // Calcula métricas
      const densidadeMedia = germinacoes.reduce((s, g) => s + g.densidade, 0) / germinacoes.length;
      const percentPioneiras = totalPlantulas > 0 ? Math.round(porGrupo['Pioneira'] / totalPlantulas * 100) : 0;
      
      // Avalia potencial
      let potencial = 'Baixo';
      let recomendacao = '';
      
      if (densidadeMedia > 500 && percentPioneiras > 50) {
        potencial = 'Alto';
        recomendacao = 'Excelente potencial de regeneração natural. Banco de sementes rico em pioneiras.';
      } else if (densidadeMedia > 200 || especiesTotal.size > 10) {
        potencial = 'Médio';
        recomendacao = 'Potencial moderado. Considerar enriquecimento com espécies secundárias.';
      } else {
        potencial = 'Baixo';
        recomendacao = 'Banco de sementes empobrecido. Necessário plantio de mudas e semeadura direta.';
      }
      
      return {
        success: true,
        analise: {
          amostras_analisadas: germinacoes.length,
          total_plantulas: totalPlantulas,
          total_especies: especiesTotal.size,
          densidade_media_m2: Math.round(densidadeMedia),
          potencial_regeneracao: potencial
        },
        composicao: {
          por_grupo_ecologico: porGrupo,
          por_forma_vida: porForma,
          percent_pioneiras: percentPioneiras
        },
        recomendacao: recomendacao,
        especies_encontradas: Array.from(especiesTotal)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   */
  getStatistics: function() {
    try {
      const samplesResult = this.listSamples();
      const samples = samplesResult.samples;
      
      const ss = getSpreadsheet();
      const sheetGerm = ss.getSheetByName(this.SHEET_GERMINACAO);
      const sheetPlant = ss.getSheetByName(this.SHEET_PLANTULAS);
      
      let germinacoesConcluidas = 0;
      let germinacoesAtivas = 0;
      
      if (sheetGerm && sheetGerm.getLastRow() > 1) {
        const germData = sheetGerm.getDataRange().getValues();
        for (let i = 1; i < germData.length; i++) {
          if (germData[i][3]) germinacoesConcluidas++;
          else germinacoesAtivas++;
        }
      }
      
      let totalPlantulas = 0;
      let totalEspecies = new Set();
      
      if (sheetPlant && sheetPlant.getLastRow() > 1) {
        const plantData = sheetPlant.getDataRange().getValues();
        for (let i = 1; i < plantData.length; i++) {
          totalPlantulas += plantData[i][9] || 1;
          totalEspecies.add(plantData[i][2]);
        }
      }
      
      return {
        success: true,
        amostras_coletadas: samples.length,
        amostras_em_germinacao: samples.filter(s => s.status === 'Em Germinação').length,
        amostras_concluidas: samples.filter(s => s.status === 'Concluída').length,
        germinacoes_ativas: germinacoesAtivas,
        germinacoes_concluidas: germinacoesConcluidas,
        total_plantulas: totalPlantulas,
        total_especies: totalEspecies.size
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista espécies do catálogo
   */
  getCatalog: function() {
    return {
      success: true,
      especies: Object.entries(this.ESPECIES_BANCO_CERRADO).map(([nome, info]) => ({
        nome_cientifico: nome,
        ...info
      })),
      grupos_ecologicos: this.GRUPOS_ECOLOGICOS,
      formas_vida: this.FORMAS_VIDA
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Banco de Sementes
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de banco de sementes
 */
function apiBancoSementesInit() {
  return SeedBank.initializeSheets();
}

/**
 * Registra coleta de amostra
 */
function apiBancoSementesColetarAmostra(sampleData) {
  return SeedBank.registerSample(sampleData);
}

/**
 * Lista amostras
 */
function apiBancoSementesListarAmostras(filters) {
  return SeedBank.listSamples(filters || {});
}

/**
 * Inicia experimento de germinação
 */
function apiBancoSementesIniciarGerminacao(germData) {
  return SeedBank.startGermination(germData);
}

/**
 * Registra plântula germinada
 */
function apiBancoSementesRegistrarPlantula(seedlingData) {
  return SeedBank.registerSeedling(seedlingData);
}

/**
 * Finaliza experimento de germinação
 */
function apiBancoSementesFinalizarGerminacao(germId) {
  return SeedBank.finishGermination(germId);
}

/**
 * Analisa potencial de regeneração
 */
function apiBancoSementesAnalisar() {
  return SeedBank.analyzeRegenerationPotential();
}

/**
 * Obtém estatísticas
 */
function apiBancoSementesEstatisticas() {
  return SeedBank.getStatistics();
}

/**
 * Obtém catálogo de espécies
 */
function apiBancoSementesCatalogo() {
  return SeedBank.getCatalog();
}
