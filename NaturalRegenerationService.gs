/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE REGENERAÇÃO NATURAL COM PARCELAS PERMANENTES
 * ═══════════════════════════════════════════════════════════════════════════
 * P27 - Monitoramento de Regeneração Natural
 * 
 * Funcionalidades:
 * - Monitoramento de parcelas permanentes (20x20m)
 * - Censo de regenerantes
 * - Taxa de recrutamento
 * - Taxa de mortalidade
 * - Predição de sucessão
 * - Integração com P02 (sucessão ecológica)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const PARCELAS_HEADERS = [
  'ID_Parcela', 'Nome', 'Latitude', 'Longitude', 'Dimensao_m', 'Area_m2',
  'Tipo_Vegetacao', 'Estagio_Sucessional', 'Data_Instalacao', 'Altitude_m',
  'Declividade', 'Exposicao', 'Historico_Uso', 'Status'
];

const REGENERANTES_HEADERS = [
  'ID_Individuo', 'ID_Parcela', 'Especie', 'Nome_Popular', 'CAP_cm', 'Altura_m',
  'Classe_Altura', 'Data_Medicao', 'Status', 'Causa_Morte', 'Coordenada_X',
  'Coordenada_Y', 'Observacoes'
];

const CENSOS_HEADERS = [
  'ID_Censo', 'ID_Parcela', 'Data_Censo', 'Total_Individuos', 'Total_Especies',
  'Recrutamento', 'Mortalidade', 'Densidade_ind_ha', 'Area_Basal_m2_ha',
  'Indice_Shannon', 'Observador'
];

/**
 * Sistema de Monitoramento de Regeneração Natural
 * @namespace NaturalRegeneration
 */
const NaturalRegeneration = {
  
  SHEET_PARCELAS: 'PARCELAS_PERMANENTES_RA',
  SHEET_REGENERANTES: 'REGENERANTES_RA',
  SHEET_CENSOS: 'CENSOS_REGENERACAO_RA',
  
  /**
   * Classes de altura para regenerantes
   */
  CLASSES_ALTURA: {
    'Classe I': { min: 0.1, max: 0.5, descricao: 'Plântulas (10-50cm)' },
    'Classe II': { min: 0.5, max: 1.0, descricao: 'Juvenis baixos (50-100cm)' },
    'Classe III': { min: 1.0, max: 2.0, descricao: 'Juvenis altos (1-2m)' },
    'Classe IV': { min: 2.0, max: 3.0, descricao: 'Arvoretas (2-3m)' },
    'Classe V': { min: 3.0, max: Infinity, descricao: 'Árvores jovens (>3m)' }
  },
  
  /**
   * Estágios sucessionais
   */
  ESTAGIOS: {
    'Inicial': { idade_anos: '0-10', caracteristicas: 'Pioneiras dominantes, alta luminosidade' },
    'Intermediário': { idade_anos: '10-30', caracteristicas: 'Secundárias iniciais, dossel em formação' },
    'Avançado': { idade_anos: '30-100', caracteristicas: 'Secundárias tardias, dossel fechado' },
    'Climax': { idade_anos: '>100', caracteristicas: 'Climácicas dominantes, alta diversidade' }
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de parcelas
      let sheetParcelas = ss.getSheetByName(this.SHEET_PARCELAS);
      if (!sheetParcelas) {
        sheetParcelas = ss.insertSheet(this.SHEET_PARCELAS);
        sheetParcelas.appendRow(PARCELAS_HEADERS);
        this._formatHeader(sheetParcelas, PARCELAS_HEADERS.length, '#33691E');
      }
      
      // Planilha de regenerantes
      let sheetRegen = ss.getSheetByName(this.SHEET_REGENERANTES);
      if (!sheetRegen) {
        sheetRegen = ss.insertSheet(this.SHEET_REGENERANTES);
        sheetRegen.appendRow(REGENERANTES_HEADERS);
        this._formatHeader(sheetRegen, REGENERANTES_HEADERS.length, '#558B2F');
      }
      
      // Planilha de censos
      let sheetCensos = ss.getSheetByName(this.SHEET_CENSOS);
      if (!sheetCensos) {
        sheetCensos = ss.insertSheet(this.SHEET_CENSOS);
        sheetCensos.appendRow(CENSOS_HEADERS);
        this._formatHeader(sheetCensos, CENSOS_HEADERS.length, '#689F38');
      }
      
      return { success: true, sheets: [this.SHEET_PARCELAS, this.SHEET_REGENERANTES, this.SHEET_CENSOS] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Formata cabeçalho
   * @private
   */
  _formatHeader: function(sheet, cols, color) {
    const headerRange = sheet.getRange(1, 1, 1, cols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  /**
   * Cadastra parcela permanente
   */
  registerPlot: function(plotData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PARCELAS);
      
      const plotId = plotData.id || `PP-${Date.now().toString(36).toUpperCase()}`;
      const dimensao = plotData.dimensao || 20;
      const area = dimensao * dimensao;
      
      const row = [
        plotId,
        plotData.nome || `Parcela ${plotId}`,
        plotData.latitude || -13.4,
        plotData.longitude || -46.3,
        dimensao,
        area,
        plotData.tipo_vegetacao || 'Cerrado',
        plotData.estagio || 'Inicial',
        plotData.data_instalacao || new Date().toISOString().split('T')[0],
        plotData.altitude || 0,
        plotData.declividade || 'Plano',
        plotData.exposicao || 'N',
        plotData.historico || '',
        'Ativa'
      ];
      
      sheet.appendRow(row);
      
      return { success: true, plot_id: plotId, area_m2: area };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista parcelas
   */
  listPlots: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PARCELAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, plots: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const plots = [];
      
      for (let i = 1; i < data.length; i++) {
        plots.push({
          id: data[i][0],
          nome: data[i][1],
          latitude: data[i][2],
          longitude: data[i][3],
          dimensao: data[i][4],
          area_m2: data[i][5],
          tipo_vegetacao: data[i][6],
          estagio: data[i][7],
          data_instalacao: data[i][8],
          status: data[i][13]
        });
      }
      
      return { success: true, plots: plots, count: plots.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra indivíduo regenerante
   */
  registerIndividual: function(indData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_REGENERANTES);
      
      const indId = indData.id || `IND-${Date.now().toString(36).toUpperCase()}`;
      
      // Determina classe de altura
      const classeAltura = this._getHeightClass(indData.altura || 0.5);
      
      const row = [
        indId,
        indData.parcela_id || '',
        indData.especie || '',
        indData.nome_popular || '',
        indData.cap || 0,
        indData.altura || 0.5,
        classeAltura,
        indData.data || new Date().toISOString().split('T')[0],
        'Vivo',
        '',
        indData.coord_x || 0,
        indData.coord_y || 0,
        indData.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
      return { success: true, individual_id: indId, classe_altura: classeAltura };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Determina classe de altura
   * @private
   */
  _getHeightClass: function(altura) {
    for (const [classe, range] of Object.entries(this.CLASSES_ALTURA)) {
      if (altura >= range.min && altura < range.max) {
        return classe;
      }
    }
    return 'Classe V';
  },

  /**
   * Atualiza medição de indivíduo
   */
  updateMeasurement: function(indId, newData) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_REGENERANTES);
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === indId) {
          if (newData.cap) sheet.getRange(i + 1, 5).setValue(newData.cap);
          if (newData.altura) {
            sheet.getRange(i + 1, 6).setValue(newData.altura);
            sheet.getRange(i + 1, 7).setValue(this._getHeightClass(newData.altura));
          }
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString().split('T')[0]);
          
          return { success: true, individual_id: indId };
        }
      }
      
      return { success: false, error: 'Indivíduo não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra mortalidade
   */
  registerMortality: function(indId, causa) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_REGENERANTES);
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === indId) {
          sheet.getRange(i + 1, 9).setValue('Morto');
          sheet.getRange(i + 1, 10).setValue(causa || 'Não identificada');
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString().split('T')[0]);
          
          return { success: true, individual_id: indId, status: 'Morto' };
        }
      }
      
      return { success: false, error: 'Indivíduo não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista regenerantes de uma parcela
   */
  listIndividuals: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_REGENERANTES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, individuals: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const individuals = [];
      
      for (let i = 1; i < data.length; i++) {
        if (!parcelaId || data[i][1] === parcelaId) {
          individuals.push({
            id: data[i][0],
            parcela_id: data[i][1],
            especie: data[i][2],
            nome_popular: data[i][3],
            cap: data[i][4],
            altura: data[i][5],
            classe_altura: data[i][6],
            data_medicao: data[i][7],
            status: data[i][8],
            causa_morte: data[i][9]
          });
        }
      }
      
      return { success: true, individuals: individuals, count: individuals.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Realiza censo de parcela
   */
  conductCensus: function(parcelaId, observador) {
    try {
      this.initializeSheets();
      
      // Obtém dados da parcela
      const plotsResult = this.listPlots();
      const parcela = plotsResult.plots.find(p => p.id === parcelaId);
      if (!parcela) {
        return { success: false, error: 'Parcela não encontrada' };
      }
      
      // Obtém indivíduos da parcela
      const indsResult = this.listIndividuals(parcelaId);
      const individuos = indsResult.individuals;
      
      // Filtra vivos
      const vivos = individuos.filter(i => i.status === 'Vivo');
      const mortos = individuos.filter(i => i.status === 'Morto');
      
      // Calcula métricas
      const especies = [...new Set(vivos.map(i => i.especie))];
      const areaHa = parcela.area_m2 / 10000;
      const densidade = vivos.length / areaHa;
      
      // Área basal (soma de π * (CAP/2π)²)
      let areaBasal = 0;
      vivos.forEach(ind => {
        if (ind.cap > 0) {
          const raio = ind.cap / (2 * Math.PI) / 100; // em metros
          areaBasal += Math.PI * raio * raio;
        }
      });
      const areaBasalHa = areaBasal / areaHa;
      
      // Índice de Shannon
      const shannon = this._calculateShannon(vivos);
      
      // Obtém censo anterior para calcular recrutamento/mortalidade
      const censoAnterior = this._getLastCensus(parcelaId);
      let recrutamento = 0;
      let mortalidade = 0;
      
      if (censoAnterior) {
        recrutamento = Math.max(0, vivos.length - censoAnterior.total_individuos + mortos.length);
        mortalidade = mortos.length;
      }
      
      // Salva censo
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CENSOS);
      
      const censoId = `CEN-${Date.now().toString(36).toUpperCase()}`;
      const row = [
        censoId,
        parcelaId,
        new Date().toISOString().split('T')[0],
        vivos.length,
        especies.length,
        recrutamento,
        mortalidade,
        Math.round(densidade),
        Math.round(areaBasalHa * 100) / 100,
        Math.round(shannon * 100) / 100,
        observador || 'Sistema'
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        censo_id: censoId,
        parcela: parcela.nome,
        metricas: {
          total_individuos: vivos.length,
          total_especies: especies.length,
          recrutamento: recrutamento,
          mortalidade: mortalidade,
          taxa_recrutamento_percent: censoAnterior ? Math.round(recrutamento / censoAnterior.total_individuos * 100) : 0,
          taxa_mortalidade_percent: censoAnterior ? Math.round(mortalidade / censoAnterior.total_individuos * 100) : 0,
          densidade_ind_ha: Math.round(densidade),
          area_basal_m2_ha: Math.round(areaBasalHa * 100) / 100,
          indice_shannon: Math.round(shannon * 100) / 100
        },
        distribuicao_classes: this._getClassDistribution(vivos),
        especies_lista: especies
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula índice de Shannon
   * @private
   */
  _calculateShannon: function(individuos) {
    if (individuos.length === 0) return 0;
    
    const contagem = {};
    individuos.forEach(ind => {
      contagem[ind.especie] = (contagem[ind.especie] || 0) + 1;
    });
    
    const total = individuos.length;
    let shannon = 0;
    
    Object.values(contagem).forEach(n => {
      const pi = n / total;
      if (pi > 0) {
        shannon -= pi * Math.log(pi);
      }
    });
    
    return shannon;
  },

  /**
   * Obtém último censo de uma parcela
   * @private
   */
  _getLastCensus: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CENSOS);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      let lastCensus = null;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === parcelaId) {
          if (!lastCensus || new Date(data[i][2]) > new Date(lastCensus.data)) {
            lastCensus = {
              id: data[i][0],
              data: data[i][2],
              total_individuos: data[i][3],
              total_especies: data[i][4]
            };
          }
        }
      }
      
      return lastCensus;
    } catch (error) {
      return null;
    }
  },

  /**
   * Obtém distribuição por classes de altura
   * @private
   */
  _getClassDistribution: function(individuos) {
    const distribuicao = {};
    Object.keys(this.CLASSES_ALTURA).forEach(classe => {
      distribuicao[classe] = 0;
    });
    
    individuos.forEach(ind => {
      if (distribuicao[ind.classe_altura] !== undefined) {
        distribuicao[ind.classe_altura]++;
      }
    });
    
    return distribuicao;
  },

  /**
   * Analisa tendência de regeneração
   */
  analyzeRegeneration: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CENSOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Sem dados de censos' };
      }
      
      const data = sheet.getDataRange().getValues();
      const censos = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === parcelaId) {
          censos.push({
            data: new Date(data[i][2]),
            individuos: data[i][3],
            especies: data[i][4],
            recrutamento: data[i][5],
            mortalidade: data[i][6],
            densidade: data[i][7],
            area_basal: data[i][8],
            shannon: data[i][9]
          });
        }
      }
      
      if (censos.length < 2) {
        return { success: false, error: 'Necessário pelo menos 2 censos para análise' };
      }
      
      // Ordena por data
      censos.sort((a, b) => a.data - b.data);
      
      const primeiro = censos[0];
      const ultimo = censos[censos.length - 1];
      const anos = (ultimo.data - primeiro.data) / (365 * 24 * 60 * 60 * 1000);
      
      // Calcula taxas
      const taxaCrescimento = anos > 0 ? (ultimo.individuos - primeiro.individuos) / anos : 0;
      const taxaRecrutamentoMedia = censos.reduce((s, c) => s + c.recrutamento, 0) / censos.length;
      const taxaMortalidadeMedia = censos.reduce((s, c) => s + c.mortalidade, 0) / censos.length;
      
      // Tendência
      let tendencia = 'Estável';
      if (taxaCrescimento > 5) tendencia = 'Crescimento acelerado';
      else if (taxaCrescimento > 0) tendencia = 'Crescimento moderado';
      else if (taxaCrescimento < -5) tendencia = 'Declínio acentuado';
      else if (taxaCrescimento < 0) tendencia = 'Declínio moderado';
      
      // Predição de sucessão
      const predicaoSucessao = this._predictSuccession(censos, anos);
      
      return {
        success: true,
        parcela_id: parcelaId,
        periodo_analise: {
          inicio: primeiro.data.toISOString().split('T')[0],
          fim: ultimo.data.toISOString().split('T')[0],
          anos: Math.round(anos * 10) / 10,
          total_censos: censos.length
        },
        metricas: {
          individuos_inicial: primeiro.individuos,
          individuos_final: ultimo.individuos,
          variacao_absoluta: ultimo.individuos - primeiro.individuos,
          variacao_percentual: Math.round((ultimo.individuos - primeiro.individuos) / primeiro.individuos * 100),
          taxa_crescimento_ano: Math.round(taxaCrescimento * 10) / 10,
          recrutamento_medio_ano: Math.round(taxaRecrutamentoMedia),
          mortalidade_media_ano: Math.round(taxaMortalidadeMedia),
          balanco_liquido: Math.round(taxaRecrutamentoMedia - taxaMortalidadeMedia)
        },
        diversidade: {
          especies_inicial: primeiro.especies,
          especies_final: ultimo.especies,
          shannon_inicial: primeiro.shannon,
          shannon_final: ultimo.shannon
        },
        tendencia: tendencia,
        predicao_sucessao: predicaoSucessao,
        historico: censos.map(c => ({
          data: c.data.toISOString().split('T')[0],
          individuos: c.individuos,
          especies: c.especies
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Prediz tempo para próximo estágio sucessional
   * @private
   */
  _predictSuccession: function(censos, anosMonitoramento) {
    if (censos.length < 2) return null;
    
    const ultimo = censos[censos.length - 1];
    
    // Baseado em densidade e diversidade, estima estágio atual
    let estagioAtual = 'Inicial';
    if (ultimo.densidade > 2000 && ultimo.shannon > 2.5) estagioAtual = 'Avançado';
    else if (ultimo.densidade > 1000 && ultimo.shannon > 1.5) estagioAtual = 'Intermediário';
    
    // Taxa de incremento de diversidade
    const primeiro = censos[0];
    const taxaDiversidade = anosMonitoramento > 0 
      ? (ultimo.shannon - primeiro.shannon) / anosMonitoramento 
      : 0;
    
    // Estima tempo para próximo estágio
    let tempoProximoEstagio = null;
    let proximoEstagio = null;
    
    if (estagioAtual === 'Inicial' && taxaDiversidade > 0) {
      tempoProximoEstagio = Math.round((1.5 - ultimo.shannon) / taxaDiversidade);
      proximoEstagio = 'Intermediário';
    } else if (estagioAtual === 'Intermediário' && taxaDiversidade > 0) {
      tempoProximoEstagio = Math.round((2.5 - ultimo.shannon) / taxaDiversidade);
      proximoEstagio = 'Avançado';
    }
    
    return {
      estagio_atual: estagioAtual,
      proximo_estagio: proximoEstagio,
      tempo_estimado_anos: tempoProximoEstagio > 0 ? tempoProximoEstagio : null,
      taxa_diversificacao: Math.round(taxaDiversidade * 100) / 100,
      confianca: anosMonitoramento >= 3 ? 'Alta' : anosMonitoramento >= 1 ? 'Média' : 'Baixa'
    };
  },

  /**
   * Obtém estatísticas gerais
   */
  getStatistics: function() {
    try {
      const plotsResult = this.listPlots();
      const indsResult = this.listIndividuals();
      
      const parcelas = plotsResult.plots.filter(p => p.status === 'Ativa');
      const individuos = indsResult.individuals;
      const vivos = individuos.filter(i => i.status === 'Vivo');
      const especies = [...new Set(vivos.map(i => i.especie))];
      
      // Distribuição por classe
      const distribuicao = this._getClassDistribution(vivos);
      
      return {
        success: true,
        parcelas_monitoradas: parcelas.length,
        area_total_m2: parcelas.reduce((s, p) => s + p.area_m2, 0),
        regenerantes_total: vivos.length,
        especies_total: especies.length,
        distribuicao_classes: distribuicao,
        mortalidade_total: individuos.filter(i => i.status === 'Morto').length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Regeneração Natural
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de regeneração
 */
function apiRegeneracaoInit() {
  return NaturalRegeneration.initializeSheets();
}

/**
 * Cadastra parcela permanente
 */
function apiRegeneracaoCadastrarParcela(plotData) {
  return NaturalRegeneration.registerPlot(plotData);
}

/**
 * Lista parcelas
 */
function apiRegeneracaoListarParcelas() {
  return NaturalRegeneration.listPlots();
}

/**
 * Registra indivíduo regenerante
 */
function apiRegeneracaoRegistrarIndividuo(indData) {
  return NaturalRegeneration.registerIndividual(indData);
}

/**
 * Lista indivíduos de uma parcela
 */
function apiRegeneracaoListarIndividuos(parcelaId) {
  return NaturalRegeneration.listIndividuals(parcelaId);
}

/**
 * Atualiza medição de indivíduo
 */
function apiRegeneracaoAtualizarMedicao(indId, newData) {
  return NaturalRegeneration.updateMeasurement(indId, newData);
}

/**
 * Registra mortalidade
 */
function apiRegeneracaoMortalidade(indId, causa) {
  return NaturalRegeneration.registerMortality(indId, causa);
}

/**
 * Realiza censo de parcela
 */
function apiRegeneracaoCenso(parcelaId, observador) {
  return NaturalRegeneration.conductCensus(parcelaId, observador);
}

/**
 * Analisa tendência de regeneração
 */
function apiRegeneracaoAnalisar(parcelaId) {
  return NaturalRegeneration.analyzeRegeneration(parcelaId);
}

/**
 * Obtém estatísticas gerais
 */
function apiRegeneracaoEstatisticas() {
  return NaturalRegeneration.getStatistics();
}

/**
 * Obtém classes de altura
 */
function apiRegeneracaoClasses() {
  return {
    success: true,
    classes: Object.entries(NaturalRegeneration.CLASSES_ALTURA).map(([nome, info]) => ({
      nome,
      ...info
    })),
    estagios: NaturalRegeneration.ESTAGIOS
  };
}
