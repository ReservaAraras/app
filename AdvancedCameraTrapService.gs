/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - MONITORAMENTO AVANÇADO DE FAUNA COM CÂMERAS TRAP
 * ═══════════════════════════════════════════════════════════════════════════
 * P29 - Análise Avançada de Dados de Armadilhas Fotográficas
 * 
 * Funcionalidades:
 * - Estimativa populacional (capture-recapture)
 * - Padrões de atividade temporal
 * - Ocupação de habitat (modelos de occupancy)
 * - Interações interespecíficas
 * - Integração com P07 (câmeras trap básico)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const CAPTURAS_ADV_HEADERS = [
  'ID_Captura', 'ID_Camera', 'Data_Hora', 'Especie', 'Nome_Popular',
  'Quantidade', 'Sexo', 'Idade', 'Marcas_Individuais', 'Comportamento',
  'Temperatura', 'Fase_Lunar', 'Confianca_ID', 'Foto_Path', 'Validado'
];

const OCUPACAO_HEADERS = [
  'ID_Analise', 'Especie', 'Periodo', 'Sites_Amostrados', 'Sites_Ocupados',
  'Naive_Occupancy', 'Psi_Estimado', 'SE_Psi', 'P_Deteccao', 'SE_P',
  'AIC', 'Data_Analise'
];

/**
 * Sistema Avançado de Análise de Câmeras Trap
 * @namespace AdvancedCameraTrap
 */
const AdvancedCameraTrap = {
  
  SHEET_CAPTURAS: 'CAPTURAS_AVANCADO_RA',
  SHEET_OCUPACAO: 'OCUPACAO_HABITAT_RA',
  
  /**
   * Comportamentos observáveis
   */
  COMPORTAMENTOS: [
    'Forrageamento', 'Deslocamento', 'Descanso', 'Marcação territorial',
    'Interação social', 'Predação', 'Fuga', 'Cuidado parental', 'Corte'
  ],
  
  /**
   * Fases lunares
   */
  FASES_LUNARES: ['Nova', 'Crescente', 'Cheia', 'Minguante'],
  
  /**
   * Espécies-alvo do Cerrado com parâmetros populacionais
   */
  ESPECIES_ALVO: {
    'Chrysocyon brachyurus': {
      popular: 'Lobo-guará',
      area_vida_km2: 115,
      densidade_tipica: 0.02,
      atividade: 'Crepuscular/Noturno',
      detectabilidade: 0.15
    },
    'Myrmecophaga tridactyla': {
      popular: 'Tamanduá-bandeira',
      area_vida_km2: 9,
      densidade_tipica: 0.1,
      atividade: 'Diurno/Crepuscular',
      detectabilidade: 0.25
    },
    'Tapirus terrestris': {
      popular: 'Anta',
      area_vida_km2: 8,
      densidade_tipica: 0.15,
      atividade: 'Noturno',
      detectabilidade: 0.3
    },
    'Panthera onca': {
      popular: 'Onça-pintada',
      area_vida_km2: 150,
      densidade_tipica: 0.01,
      atividade: 'Crepuscular/Noturno',
      detectabilidade: 0.08
    },
    'Puma concolor': {
      popular: 'Onça-parda',
      area_vida_km2: 80,
      densidade_tipica: 0.02,
      atividade: 'Crepuscular',
      detectabilidade: 0.12
    },
    'Pecari tajacu': {
      popular: 'Cateto',
      area_vida_km2: 3,
      densidade_tipica: 2.5,
      atividade: 'Diurno',
      detectabilidade: 0.4
    },
    'Mazama americana': {
      popular: 'Veado-mateiro',
      area_vida_km2: 1.5,
      densidade_tipica: 1.0,
      atividade: 'Crepuscular/Noturno',
      detectabilidade: 0.35
    },
    'Leopardus pardalis': {
      popular: 'Jaguatirica',
      area_vida_km2: 15,
      densidade_tipica: 0.1,
      atividade: 'Noturno',
      detectabilidade: 0.2
    }
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheetCap = ss.getSheetByName(this.SHEET_CAPTURAS);
      if (!sheetCap) {
        sheetCap = ss.insertSheet(this.SHEET_CAPTURAS);
        sheetCap.appendRow(CAPTURAS_ADV_HEADERS);
        this._formatHeader(sheetCap, CAPTURAS_ADV_HEADERS.length, '#37474F');
      }
      
      let sheetOcup = ss.getSheetByName(this.SHEET_OCUPACAO);
      if (!sheetOcup) {
        sheetOcup = ss.insertSheet(this.SHEET_OCUPACAO);
        sheetOcup.appendRow(OCUPACAO_HEADERS);
        this._formatHeader(sheetOcup, OCUPACAO_HEADERS.length, '#455A64');
      }
      
      return { success: true, sheets: [this.SHEET_CAPTURAS, this.SHEET_OCUPACAO] };
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
   * Registra captura com dados avançados
   */
  registerCapture: function(captureData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAPTURAS);
      
      const captureId = `CAP-${Date.now().toString(36).toUpperCase()}`;
      const dataHora = captureData.data_hora || new Date().toISOString();
      
      // Calcula fase lunar
      const faseLunar = this._calculateLunarPhase(new Date(dataHora));
      
      // Busca info da espécie
      const especieInfo = this.ESPECIES_ALVO[captureData.especie] || {};
      
      const row = [
        captureId,
        captureData.camera_id || '',
        dataHora,
        captureData.especie || '',
        captureData.nome_popular || especieInfo.popular || '',
        captureData.quantidade || 1,
        captureData.sexo || 'Indeterminado',
        captureData.idade || 'Adulto',
        captureData.marcas || '',
        captureData.comportamento || 'Deslocamento',
        captureData.temperatura || '',
        faseLunar,
        captureData.confianca || 0.8,
        captureData.foto || '',
        false
      ];
      
      sheet.appendRow(row);
      
      return { 
        success: true, 
        capture_id: captureId,
        fase_lunar: faseLunar,
        hora: new Date(dataHora).getHours()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula fase lunar
   * @private
   */
  _calculateLunarPhase: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Algoritmo simplificado de fase lunar
    const c = Math.floor(365.25 * year);
    const e = Math.floor(30.6 * month);
    const jd = c + e + day - 694039.09;
    const phase = jd / 29.53;
    const phaseDay = (phase - Math.floor(phase)) * 29.53;
    
    if (phaseDay < 7.4) return 'Nova';
    if (phaseDay < 14.8) return 'Crescente';
    if (phaseDay < 22.1) return 'Cheia';
    return 'Minguante';
  },

  /**
   * Lista capturas
   */
  listCaptures: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAPTURAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, captures: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const captures = [];
      
      for (let i = 1; i < data.length; i++) {
        const capture = {
          id: data[i][0],
          camera_id: data[i][1],
          data_hora: data[i][2],
          especie: data[i][3],
          nome_popular: data[i][4],
          quantidade: data[i][5],
          sexo: data[i][6],
          idade: data[i][7],
          marcas: data[i][8],
          comportamento: data[i][9],
          fase_lunar: data[i][11]
        };
        
        if (filters.especie && capture.especie !== filters.especie) continue;
        if (filters.camera_id && capture.camera_id !== filters.camera_id) continue;
        
        captures.push(capture);
      }
      
      return { success: true, captures: captures, count: captures.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa padrões de atividade temporal
   */
  analyzeActivityPatterns: function(especie) {
    try {
      const capturesResult = this.listCaptures({ especie: especie });
      if (!capturesResult.success || capturesResult.count < 5) {
        return { success: false, error: 'Necessário pelo menos 5 capturas para análise' };
      }
      
      const captures = capturesResult.captures;
      
      // Distribuição por hora
      const porHora = new Array(24).fill(0);
      // Distribuição por período
      const porPeriodo = { 'Diurno': 0, 'Crepuscular': 0, 'Noturno': 0 };
      // Distribuição por fase lunar
      const porLunar = { 'Nova': 0, 'Crescente': 0, 'Cheia': 0, 'Minguante': 0 };
      
      captures.forEach(cap => {
        const hora = new Date(cap.data_hora).getHours();
        porHora[hora]++;
        
        // Classifica período
        if (hora >= 6 && hora < 18) {
          if (hora >= 5 && hora < 7 || hora >= 17 && hora < 19) {
            porPeriodo['Crepuscular']++;
          } else {
            porPeriodo['Diurno']++;
          }
        } else {
          porPeriodo['Noturno']++;
        }
        
        // Fase lunar
        if (porLunar[cap.fase_lunar] !== undefined) {
          porLunar[cap.fase_lunar]++;
        }
      });
      
      // Calcula pico de atividade
      const maxHora = porHora.indexOf(Math.max(...porHora));
      const total = captures.length;
      
      // Determina padrão dominante
      let padraoDominante = 'Diurno';
      if (porPeriodo['Noturno'] > porPeriodo['Diurno'] && porPeriodo['Noturno'] > porPeriodo['Crepuscular']) {
        padraoDominante = 'Noturno';
      } else if (porPeriodo['Crepuscular'] > porPeriodo['Diurno'] * 0.5) {
        padraoDominante = 'Crepuscular';
      }
      
      // Índice de noturno (0-1)
      const indiceNoturno = (porPeriodo['Noturno'] + porPeriodo['Crepuscular'] * 0.5) / total;
      
      return {
        success: true,
        especie: especie,
        total_capturas: total,
        padrao_dominante: padraoDominante,
        indice_noturno: Math.round(indiceNoturno * 100) / 100,
        pico_atividade_hora: maxHora,
        distribuicao_horaria: porHora,
        distribuicao_periodo: porPeriodo,
        distribuicao_lunar: porLunar,
        preferencia_lunar: Object.entries(porLunar).sort((a, b) => b[1] - a[1])[0][0]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Estima ocupação de habitat (Occupancy Model simplificado)
   */
  estimateOccupancy: function(especie) {
    try {
      const capturesResult = this.listCaptures({ especie: especie });
      if (!capturesResult.success) return capturesResult;
      
      const captures = capturesResult.captures;
      
      // Agrupa por câmera (site)
      const siteData = {};
      captures.forEach(cap => {
        if (!siteData[cap.camera_id]) {
          siteData[cap.camera_id] = { detections: 0, occasions: 0 };
        }
        siteData[cap.camera_id].detections++;
      });
      
      const sites = Object.keys(siteData);
      const totalSites = sites.length || 1;
      const sitesOcupados = sites.filter(s => siteData[s].detections > 0).length;
      
      // Naive occupancy
      const naiveOccupancy = sitesOcupados / totalSites;
      
      // Estimativa de detectabilidade (baseada em literatura)
      const especieInfo = this.ESPECIES_ALVO[especie] || {};
      const pDeteccao = especieInfo.detectabilidade || 0.2;
      
      // Occupancy corrigida (MacKenzie et al. 2002 simplificado)
      // Psi = naive / (1 - (1-p)^K) onde K = ocasiões de amostragem
      const K = 10; // Assumindo 10 ocasiões
      const psiEstimado = Math.min(1, naiveOccupancy / (1 - Math.pow(1 - pDeteccao, K)));
      
      // Erro padrão aproximado
      const sePsi = Math.sqrt(psiEstimado * (1 - psiEstimado) / totalSites);
      
      // Salva análise
      this._saveOccupancyAnalysis({
        especie,
        totalSites,
        sitesOcupados,
        naiveOccupancy,
        psiEstimado,
        sePsi,
        pDeteccao
      });
      
      return {
        success: true,
        especie: especie,
        nome_popular: especieInfo.popular || especie,
        sites_amostrados: totalSites,
        sites_ocupados: sitesOcupados,
        naive_occupancy: Math.round(naiveOccupancy * 100) / 100,
        psi_estimado: Math.round(psiEstimado * 100) / 100,
        se_psi: Math.round(sePsi * 100) / 100,
        intervalo_confianca: {
          inferior: Math.max(0, Math.round((psiEstimado - 1.96 * sePsi) * 100) / 100),
          superior: Math.min(1, Math.round((psiEstimado + 1.96 * sePsi) * 100) / 100)
        },
        p_deteccao: pDeteccao,
        interpretacao: this._interpretOccupancy(psiEstimado, naiveOccupancy)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Interpreta resultado de ocupação
   * @private
   */
  _interpretOccupancy: function(psi, naive) {
    const correcao = psi - naive;
    let interpretacao = '';
    
    if (psi >= 0.7) {
      interpretacao = 'Espécie amplamente distribuída na área de estudo.';
    } else if (psi >= 0.4) {
      interpretacao = 'Distribuição moderada, presente em parte significativa da área.';
    } else if (psi >= 0.2) {
      interpretacao = 'Distribuição restrita, pode indicar preferência de habitat específico.';
    } else {
      interpretacao = 'Espécie rara ou com baixa detectabilidade na área.';
    }
    
    if (correcao > 0.2) {
      interpretacao += ' A correção por detectabilidade sugere que a espécie é mais comum do que as detecções indicam.';
    }
    
    return interpretacao;
  },

  /**
   * Salva análise de ocupação
   * @private
   */
  _saveOccupancyAnalysis: function(data) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_OCUPACAO);
      
      const row = [
        `OCC-${Date.now().toString(36).toUpperCase()}`,
        data.especie,
        'Atual',
        data.totalSites,
        data.sitesOcupados,
        data.naiveOccupancy,
        data.psiEstimado,
        data.sePsi,
        data.pDeteccao,
        0.05,
        0,
        new Date().toISOString().split('T')[0]
      ];
      
      sheet.appendRow(row);
    } catch (error) {
      Logger.log(`[_saveOccupancyAnalysis] Erro: ${error}`);
    }
  },

  /**
   * Estima população usando capture-recapture (Lincoln-Petersen)
   */
  estimatePopulation: function(especie) {
    try {
      const capturesResult = this.listCaptures({ especie: especie });
      if (!capturesResult.success || capturesResult.count < 10) {
        return { success: false, error: 'Necessário pelo menos 10 capturas para estimativa' };
      }
      
      const captures = capturesResult.captures;
      
      // Identifica indivíduos por marcas
      const individuos = new Set();
      const comMarcas = captures.filter(c => c.marcas && c.marcas.trim() !== '');
      
      comMarcas.forEach(c => individuos.add(c.marcas));
      
      const nIndividuos = individuos.size;
      
      if (nIndividuos < 3) {
        // Usa método de densidade baseado em literatura
        const especieInfo = this.ESPECIES_ALVO[especie] || {};
        const densidade = especieInfo.densidade_tipica || 0.1;
        const areaEstudo = 50; // km² assumido
        
        return {
          success: true,
          especie: especie,
          metodo: 'Densidade Literatura',
          individuos_identificados: nIndividuos,
          total_capturas: captures.length,
          densidade_estimada: densidade,
          populacao_estimada: Math.round(densidade * areaEstudo),
          area_estudo_km2: areaEstudo,
          nota: 'Estimativa baseada em densidade típica da espécie. Identificação individual necessária para estimativa mais precisa.'
        };
      }
      
      // Lincoln-Petersen modificado (Chapman)
      // Divide capturas em duas "ocasiões"
      const metade = Math.floor(captures.length / 2);
      const ocasiao1 = new Set(comMarcas.slice(0, metade).map(c => c.marcas));
      const ocasiao2 = new Set(comMarcas.slice(metade).map(c => c.marcas));
      
      const n1 = ocasiao1.size; // Marcados na primeira ocasião
      const n2 = ocasiao2.size; // Capturados na segunda ocasião
      const m2 = [...ocasiao2].filter(m => ocasiao1.has(m)).length; // Recapturas
      
      if (m2 === 0) {
        return {
          success: true,
          especie: especie,
          metodo: 'Lincoln-Petersen',
          individuos_identificados: nIndividuos,
          nota: 'Sem recapturas suficientes para estimativa. População pode ser maior que o número de indivíduos identificados.'
        };
      }
      
      // Estimador de Chapman
      const N = Math.round(((n1 + 1) * (n2 + 1)) / (m2 + 1) - 1);
      
      // Variância e IC
      const variancia = ((n1 + 1) * (n2 + 1) * (n1 - m2) * (n2 - m2)) / ((m2 + 1) * (m2 + 1) * (m2 + 2));
      const se = Math.sqrt(variancia);
      
      return {
        success: true,
        especie: especie,
        metodo: 'Lincoln-Petersen (Chapman)',
        individuos_identificados: nIndividuos,
        total_capturas: captures.length,
        parametros: {
          n1_marcados: n1,
          n2_capturados: n2,
          m2_recapturas: m2
        },
        populacao_estimada: N,
        erro_padrao: Math.round(se * 10) / 10,
        intervalo_confianca: {
          inferior: Math.max(nIndividuos, Math.round(N - 1.96 * se)),
          superior: Math.round(N + 1.96 * se)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa interações interespecíficas
   */
  analyzeInteractions: function() {
    try {
      const capturesResult = this.listCaptures();
      if (!capturesResult.success || capturesResult.count < 20) {
        return { success: false, error: 'Necessário pelo menos 20 capturas para análise' };
      }
      
      const captures = capturesResult.captures;
      
      // Agrupa por câmera e janela temporal (1 hora)
      const coOcorrencias = {};
      const especiesSet = new Set();
      
      captures.forEach(cap => {
        especiesSet.add(cap.especie);
      });
      
      const especies = Array.from(especiesSet);
      
      // Inicializa matriz de co-ocorrência
      especies.forEach(sp1 => {
        coOcorrencias[sp1] = {};
        especies.forEach(sp2 => {
          coOcorrencias[sp1][sp2] = 0;
        });
      });
      
      // Conta co-ocorrências (mesma câmera, dentro de 1 hora)
      for (let i = 0; i < captures.length; i++) {
        for (let j = i + 1; j < captures.length; j++) {
          const cap1 = captures[i];
          const cap2 = captures[j];
          
          if (cap1.camera_id === cap2.camera_id && cap1.especie !== cap2.especie) {
            const diff = Math.abs(new Date(cap1.data_hora) - new Date(cap2.data_hora));
            if (diff <= 3600000) { // 1 hora
              coOcorrencias[cap1.especie][cap2.especie]++;
              coOcorrencias[cap2.especie][cap1.especie]++;
            }
          }
        }
      }
      
      // Identifica interações significativas
      const interacoes = [];
      especies.forEach(sp1 => {
        especies.forEach(sp2 => {
          if (sp1 < sp2 && coOcorrencias[sp1][sp2] > 0) {
            interacoes.push({
              especie1: sp1,
              especie2: sp2,
              co_ocorrencias: coOcorrencias[sp1][sp2],
              tipo: this._classifyInteraction(sp1, sp2, coOcorrencias[sp1][sp2])
            });
          }
        });
      });
      
      // Ordena por frequência
      interacoes.sort((a, b) => b.co_ocorrencias - a.co_ocorrencias);
      
      return {
        success: true,
        total_especies: especies.length,
        total_capturas: captures.length,
        interacoes: interacoes.slice(0, 10),
        matriz_coocorrencia: coOcorrencias
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Classifica tipo de interação
   * @private
   */
  _classifyInteraction: function(sp1, sp2, count) {
    // Simplificado - em produção usaria dados de dieta e comportamento
    const predadores = ['Panthera onca', 'Puma concolor', 'Leopardus pardalis'];
    const presas = ['Mazama americana', 'Pecari tajacu', 'Tapirus terrestris'];
    
    if (predadores.includes(sp1) && presas.includes(sp2)) return 'Predador-Presa';
    if (predadores.includes(sp2) && presas.includes(sp1)) return 'Predador-Presa';
    if (predadores.includes(sp1) && predadores.includes(sp2)) return 'Competição';
    
    return 'Neutra/Indefinida';
  },

  /**
   * Obtém estatísticas gerais
   */
  getStatistics: function() {
    try {
      const capturesResult = this.listCaptures();
      const captures = capturesResult.captures || [];
      
      const especies = new Set();
      const cameras = new Set();
      const individuos = new Set();
      
      captures.forEach(cap => {
        especies.add(cap.especie);
        cameras.add(cap.camera_id);
        if (cap.marcas) individuos.add(cap.marcas);
      });
      
      return {
        success: true,
        total_capturas: captures.length,
        total_especies: especies.size,
        total_cameras: cameras.size,
        individuos_identificados: individuos.size,
        especies_lista: Array.from(especies)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista espécies-alvo
   */
  getTargetSpecies: function() {
    return {
      success: true,
      especies: Object.entries(this.ESPECIES_ALVO).map(([nome, info]) => ({
        nome_cientifico: nome,
        ...info
      })),
      comportamentos: this.COMPORTAMENTOS
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Câmeras Trap Avançado
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema avançado de câmeras trap
 */
function apiCameraTrapAdvInit() {
  return AdvancedCameraTrap.initializeSheets();
}

/**
 * Registra captura com dados avançados
 */
function apiCameraTrapAdvRegistrar(captureData) {
  return AdvancedCameraTrap.registerCapture(captureData);
}

/**
 * Lista capturas
 */
function apiCameraTrapAdvListar(filters) {
  return AdvancedCameraTrap.listCaptures(filters || {});
}

/**
 * Analisa padrões de atividade
 */
function apiCameraTrapAdvAtividade(especie) {
  return AdvancedCameraTrap.analyzeActivityPatterns(especie);
}

/**
 * Estima ocupação de habitat
 */
function apiCameraTrapAdvOcupacao(especie) {
  return AdvancedCameraTrap.estimateOccupancy(especie);
}

/**
 * Estima população
 */
function apiCameraTrapAdvPopulacao(especie) {
  return AdvancedCameraTrap.estimatePopulation(especie);
}

/**
 * Analisa interações interespecíficas
 */
function apiCameraTrapAdvInteracoes() {
  return AdvancedCameraTrap.analyzeInteractions();
}

/**
 * Obtém estatísticas
 */
function apiCameraTrapAdvEstatisticas() {
  return AdvancedCameraTrap.getStatistics();
}

/**
 * Lista espécies-alvo
 */
function apiCameraTrapAdvEspecies() {
  return AdvancedCameraTrap.getTargetSpecies();
}
