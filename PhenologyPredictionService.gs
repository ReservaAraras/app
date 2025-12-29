/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - PREDIÇÃO DE FENOLOGIA COM MACHINE LEARNING
 * ═══════════════════════════════════════════════════════════════════════════
 * P24 - Sistema de Predição de Eventos Fenológicos
 * 
 * Funcionalidades:
 * - Predição de floração (±7 dias)
 * - Predição de frutificação
 * - Alertas para polinizadores
 * - Calendário fenológico automático
 * - Integração com P11 (clima)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const FENOLOGIA_HEADERS = [
  'ID_Registro', 'Especie', 'Nome_Popular', 'Data_Observacao', 'Evento',
  'Intensidade', 'Latitude', 'Longitude', 'Temperatura_Media', 'Precipitacao_Acum',
  'Fotoperíodo', 'Observador', 'Notas'
];

const PREDICOES_FENOLOGIA_HEADERS = [
  'ID_Predicao', 'Especie', 'Evento', 'Data_Prevista', 'Confianca',
  'Janela_Inicio', 'Janela_Fim', 'Fatores_Principais', 'Data_Geracao'
];

/**
 * Sistema de Predição Fenológica
 * @namespace PhenologyPrediction
 */
const PhenologyPrediction = {
  
  SHEET_FENOLOGIA: 'FENOLOGIA_RA',
  SHEET_PREDICOES: 'PREDICOES_FENOLOGIA_RA',
  
  /**
   * Eventos fenológicos monitorados
   */
  EVENTOS: {
    FLORACAO: 'Floração',
    FRUTIFICACAO: 'Frutificação',
    FOLHEACAO: 'Folheação',
    QUEDA_FOLHAS: 'Queda de Folhas',
    BROTACAO: 'Brotação',
    DISPERSAO: 'Dispersão de Sementes'
  },
  
  /**
   * Intensidade do evento (escala Fournier)
   */
  INTENSIDADE: {
    0: 'Ausente',
    1: '1-25%',
    2: '26-50%',
    3: '51-75%',
    4: '76-100%'
  },

  /**
   * Espécies do Cerrado com padrões fenológicos conhecidos
   */
  ESPECIES_CERRADO: {
    'Caryocar brasiliense': {
      nome_popular: 'Pequi',
      floracao: { inicio_mes: 8, duracao_dias: 45, trigger_temp: 28 },
      frutificacao: { inicio_mes: 11, duracao_dias: 60 },
      polinizadores: ['morcegos', 'mariposas']
    },
    'Dipteryx alata': {
      nome_popular: 'Baru',
      floracao: { inicio_mes: 10, duracao_dias: 30, trigger_temp: 26 },
      frutificacao: { inicio_mes: 7, duracao_dias: 90 },
      polinizadores: ['abelhas']
    },
    'Eugenia dysenterica': {
      nome_popular: 'Cagaita',
      floracao: { inicio_mes: 8, duracao_dias: 20, trigger_temp: 25 },
      frutificacao: { inicio_mes: 10, duracao_dias: 30 },
      polinizadores: ['abelhas', 'moscas']
    },
    'Mauritia flexuosa': {
      nome_popular: 'Buriti',
      floracao: { inicio_mes: 4, duracao_dias: 60, trigger_temp: 24 },
      frutificacao: { inicio_mes: 12, duracao_dias: 120 },
      polinizadores: ['besouros', 'abelhas']
    },
    'Hymenaea stigonocarpa': {
      nome_popular: 'Jatobá-do-cerrado',
      floracao: { inicio_mes: 10, duracao_dias: 45, trigger_temp: 27 },
      frutificacao: { inicio_mes: 7, duracao_dias: 60 },
      polinizadores: ['morcegos']
    },
    'Anacardium occidentale': {
      nome_popular: 'Caju',
      floracao: { inicio_mes: 7, duracao_dias: 60, trigger_temp: 26 },
      frutificacao: { inicio_mes: 10, duracao_dias: 45 },
      polinizadores: ['abelhas', 'vespas']
    },
    'Hancornia speciosa': {
      nome_popular: 'Mangaba',
      floracao: { inicio_mes: 8, duracao_dias: 30, trigger_temp: 25 },
      frutificacao: { inicio_mes: 10, duracao_dias: 60 },
      polinizadores: ['mariposas']
    },
    'Annona crassiflora': {
      nome_popular: 'Araticum',
      floracao: { inicio_mes: 9, duracao_dias: 30, trigger_temp: 26 },
      frutificacao: { inicio_mes: 1, duracao_dias: 45 },
      polinizadores: ['besouros']
    }
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de observações fenológicas
      let sheetFen = ss.getSheetByName(this.SHEET_FENOLOGIA);
      if (!sheetFen) {
        sheetFen = ss.insertSheet(this.SHEET_FENOLOGIA);
        sheetFen.appendRow(FENOLOGIA_HEADERS);
        const headerRange = sheetFen.getRange(1, 1, 1, FENOLOGIA_HEADERS.length);
        headerRange.setBackground('#8BC34A');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetFen.setFrozenRows(1);
      }
      
      // Planilha de predições
      let sheetPred = ss.getSheetByName(this.SHEET_PREDICOES);
      if (!sheetPred) {
        sheetPred = ss.insertSheet(this.SHEET_PREDICOES);
        sheetPred.appendRow(PREDICOES_FENOLOGIA_HEADERS);
        const headerRange = sheetPred.getRange(1, 1, 1, PREDICOES_FENOLOGIA_HEADERS.length);
        headerRange.setBackground('#689F38');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetPred.setFrozenRows(1);
      }
      
      return { success: true, sheets: [this.SHEET_FENOLOGIA, this.SHEET_PREDICOES] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra observação fenológica
   */
  registerObservation: function(obsData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_FENOLOGIA);
      
      const obsId = `FEN-${Date.now().toString(36).toUpperCase()}`;
      
      // Calcula fotoperíodo aproximado
      const fotoperiodo = this._calculatePhotoperiod(
        obsData.latitude || -13.4,
        new Date(obsData.data || new Date())
      );
      
      const row = [
        obsId,
        obsData.especie || '',
        obsData.nome_popular || this._getNomePopular(obsData.especie),
        obsData.data || new Date().toISOString().split('T')[0],
        obsData.evento || this.EVENTOS.FLORACAO,
        obsData.intensidade || 2,
        obsData.latitude || -13.4,
        obsData.longitude || -46.3,
        obsData.temperatura || '',
        obsData.precipitacao || '',
        fotoperiodo,
        obsData.observador || 'Sistema',
        obsData.notas || ''
      ];
      
      sheet.appendRow(row);
      
      return { success: true, observation_id: obsId, fotoperiodo: fotoperiodo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula fotoperíodo (horas de luz)
   * @private
   */
  _calculatePhotoperiod: function(latitude, date) {
    const dayOfYear = this._getDayOfYear(date);
    const latRad = latitude * Math.PI / 180;
    
    // Declinação solar
    const declination = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180;
    
    // Ângulo horário
    const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
    
    if (cosHourAngle > 1) return 0; // Noite polar
    if (cosHourAngle < -1) return 24; // Dia polar
    
    const hourAngle = Math.acos(cosHourAngle);
    const photoperiod = 2 * hourAngle * 12 / Math.PI;
    
    return Math.round(photoperiod * 10) / 10;
  },

  /**
   * Obtém dia do ano
   * @private
   */
  _getDayOfYear: function(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  },

  /**
   * Obtém nome popular da espécie
   * @private
   */
  _getNomePopular: function(especie) {
    const info = this.ESPECIES_CERRADO[especie];
    return info ? info.nome_popular : especie;
  },

  /**
   * Lista observações fenológicas
   */
  listObservations: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_FENOLOGIA);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, observations: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      let observations = [];
      
      for (let i = 1; i < data.length; i++) {
        const obs = {
          id: data[i][0],
          especie: data[i][1],
          nome_popular: data[i][2],
          data: data[i][3],
          evento: data[i][4],
          intensidade: data[i][5],
          latitude: data[i][6],
          longitude: data[i][7],
          temperatura: data[i][8],
          precipitacao: data[i][9],
          fotoperiodo: data[i][10]
        };
        
        // Aplica filtros
        if (filters.especie && obs.especie !== filters.especie) continue;
        if (filters.evento && obs.evento !== filters.evento) continue;
        
        observations.push(obs);
      }
      
      return { success: true, observations: observations, count: observations.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Prediz eventos fenológicos para uma espécie
   */
  predictPhenology: function(especie, climaData = {}) {
    try {
      const especieInfo = this.ESPECIES_CERRADO[especie];
      if (!especieInfo) {
        return { success: false, error: `Espécie não encontrada: ${especie}` };
      }
      
      const hoje = new Date();
      const predictions = [];
      
      // Obtém dados históricos
      const historico = this._getHistoricalData(especie);
      
      // Predição de floração
      const floracaoPred = this._predictEvent(
        especie,
        'Floração',
        especieInfo.floracao,
        historico.floracao,
        climaData
      );
      predictions.push(floracaoPred);
      
      // Predição de frutificação
      const frutPred = this._predictEvent(
        especie,
        'Frutificação',
        especieInfo.frutificacao,
        historico.frutificacao,
        climaData
      );
      predictions.push(frutPred);
      
      // Salva predições
      this._savePredictions(predictions);
      
      return {
        success: true,
        especie: especie,
        nome_popular: especieInfo.nome_popular,
        predictions: predictions,
        polinizadores: especieInfo.polinizadores,
        recomendacoes: this._generateRecommendations(predictions, especieInfo)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém dados históricos de uma espécie
   * @private
   */
  _getHistoricalData: function(especie) {
    try {
      const obsResult = this.listObservations({ especie: especie });
      if (!obsResult.success) return { floracao: [], frutificacao: [] };
      
      const floracao = [];
      const frutificacao = [];
      
      obsResult.observations.forEach(obs => {
        const data = {
          data: new Date(obs.data),
          intensidade: obs.intensidade,
          temperatura: obs.temperatura,
          fotoperiodo: obs.fotoperiodo
        };
        
        if (obs.evento === 'Floração') floracao.push(data);
        if (obs.evento === 'Frutificação') frutificacao.push(data);
      });
      
      return { floracao, frutificacao };
    } catch (error) {
      return { floracao: [], frutificacao: [] };
    }
  },

  /**
   * Prediz um evento específico
   * @private
   */
  _predictEvent: function(especie, evento, padrao, historico, climaData) {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    
    // Data base do padrão
    let dataBase = new Date(anoAtual, padrao.inicio_mes - 1, 15);
    
    // Se já passou, projeta para próximo ano
    if (dataBase < hoje) {
      dataBase = new Date(anoAtual + 1, padrao.inicio_mes - 1, 15);
    }
    
    // Ajuste baseado em histórico
    let ajusteDias = 0;
    let confianca = 0.6; // Base
    
    if (historico.length >= 3) {
      // Calcula média de desvio do padrão
      const desvios = historico.map(h => {
        const mesObs = h.data.getMonth();
        const mesPadrao = padrao.inicio_mes - 1;
        return (mesObs - mesPadrao) * 30;
      });
      ajusteDias = Math.round(desvios.reduce((a, b) => a + b, 0) / desvios.length);
      confianca += 0.15; // Mais dados = mais confiança
    }
    
    // Ajuste baseado em clima
    if (climaData.temperatura_media) {
      const tempTrigger = padrao.trigger_temp || 26;
      if (climaData.temperatura_media > tempTrigger) {
        ajusteDias -= 7; // Antecipa se mais quente
        confianca += 0.05;
      } else if (climaData.temperatura_media < tempTrigger - 3) {
        ajusteDias += 10; // Atrasa se mais frio
      }
    }
    
    // Ajuste por precipitação
    if (climaData.precipitacao_acumulada !== undefined) {
      if (climaData.precipitacao_acumulada > 200) {
        ajusteDias -= 5; // Chuvas abundantes antecipam
      } else if (climaData.precipitacao_acumulada < 50) {
        ajusteDias += 7; // Seca atrasa
        confianca -= 0.1;
      }
    }
    
    // Data prevista
    const dataPrevista = new Date(dataBase);
    dataPrevista.setDate(dataPrevista.getDate() + ajusteDias);
    
    // Janela de incerteza (±7 dias)
    const janelaInicio = new Date(dataPrevista);
    janelaInicio.setDate(janelaInicio.getDate() - 7);
    const janelaFim = new Date(dataPrevista);
    janelaFim.setDate(janelaFim.getDate() + 7);
    
    return {
      especie: especie,
      evento: evento,
      data_prevista: dataPrevista.toISOString().split('T')[0],
      confianca: Math.min(0.95, Math.max(0.4, confianca)),
      janela_inicio: janelaInicio.toISOString().split('T')[0],
      janela_fim: janelaFim.toISOString().split('T')[0],
      duracao_estimada_dias: padrao.duracao_dias,
      fatores: this._identifyMainFactors(climaData, historico)
    };
  },

  /**
   * Identifica fatores principais
   * @private
   */
  _identifyMainFactors: function(climaData, historico) {
    const fatores = [];
    
    if (historico.length >= 3) {
      fatores.push('Dados históricos (n=' + historico.length + ')');
    }
    if (climaData.temperatura_media) {
      fatores.push('Temperatura média: ' + climaData.temperatura_media + '°C');
    }
    if (climaData.precipitacao_acumulada) {
      fatores.push('Precipitação: ' + climaData.precipitacao_acumulada + 'mm');
    }
    if (fatores.length === 0) {
      fatores.push('Padrão fenológico da espécie');
    }
    
    return fatores.join('; ');
  },

  /**
   * Salva predições na planilha
   * @private
   */
  _savePredictions: function(predictions) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PREDICOES);
      
      predictions.forEach(pred => {
        const row = [
          `PRED-${Date.now().toString(36).toUpperCase()}`,
          pred.especie,
          pred.evento,
          pred.data_prevista,
          pred.confianca,
          pred.janela_inicio,
          pred.janela_fim,
          pred.fatores,
          new Date().toISOString().split('T')[0]
        ];
        sheet.appendRow(row);
      });
    } catch (error) {
      Logger.log(`[_savePredictions] Erro: ${error}`);
    }
  },

  /**
   * Gera recomendações baseadas nas predições
   * @private
   */
  _generateRecommendations: function(predictions, especieInfo) {
    const recomendacoes = [];
    const hoje = new Date();
    
    predictions.forEach(pred => {
      const dataPrev = new Date(pred.data_prevista);
      const diasAte = Math.round((dataPrev - hoje) / (1000 * 60 * 60 * 24));
      
      if (pred.evento === 'Floração') {
        if (diasAte <= 30 && diasAte > 0) {
          recomendacoes.push({
            tipo: 'Preparação',
            mensagem: `Floração de ${especieInfo.nome_popular} prevista em ${diasAte} dias`,
            acao: `Preparar monitoramento de polinizadores: ${especieInfo.polinizadores.join(', ')}`,
            prioridade: 'Alta'
          });
        }
        if (diasAte <= 7 && diasAte > 0) {
          recomendacoes.push({
            tipo: 'Alerta',
            mensagem: `Floração iminente de ${especieInfo.nome_popular}!`,
            acao: 'Iniciar coleta de dados de visitantes florais',
            prioridade: 'Urgente'
          });
        }
      }
      
      if (pred.evento === 'Frutificação') {
        if (diasAte <= 30 && diasAte > 0) {
          recomendacoes.push({
            tipo: 'Preparação',
            mensagem: `Frutificação de ${especieInfo.nome_popular} prevista em ${diasAte} dias`,
            acao: 'Preparar coleta de sementes e monitoramento de dispersores',
            prioridade: 'Media'
          });
        }
      }
    });
    
    return recomendacoes;
  },

  /**
   * Gera calendário fenológico
   */
  generateCalendar: function(ano = null) {
    try {
      const anoRef = ano || new Date().getFullYear();
      const calendario = [];
      
      // Para cada espécie conhecida
      Object.entries(this.ESPECIES_CERRADO).forEach(([especie, info]) => {
        // Floração
        const floracaoInicio = new Date(anoRef, info.floracao.inicio_mes - 1, 1);
        const floracaoFim = new Date(floracaoInicio);
        floracaoFim.setDate(floracaoFim.getDate() + info.floracao.duracao_dias);
        
        calendario.push({
          especie: especie,
          nome_popular: info.nome_popular,
          evento: 'Floração',
          inicio: floracaoInicio.toISOString().split('T')[0],
          fim: floracaoFim.toISOString().split('T')[0],
          mes_pico: info.floracao.inicio_mes,
          polinizadores: info.polinizadores
        });
        
        // Frutificação
        const frutInicio = new Date(anoRef, info.frutificacao.inicio_mes - 1, 1);
        const frutFim = new Date(frutInicio);
        frutFim.setDate(frutFim.getDate() + info.frutificacao.duracao_dias);
        
        calendario.push({
          especie: especie,
          nome_popular: info.nome_popular,
          evento: 'Frutificação',
          inicio: frutInicio.toISOString().split('T')[0],
          fim: frutFim.toISOString().split('T')[0],
          mes_pico: info.frutificacao.inicio_mes
        });
      });
      
      // Ordena por data de início
      calendario.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
      
      return {
        success: true,
        ano: anoRef,
        eventos: calendario,
        total_especies: Object.keys(this.ESPECIES_CERRADO).length,
        resumo_mensal: this._generateMonthlySummary(calendario)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera resumo mensal
   * @private
   */
  _generateMonthlySummary: function(calendario) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const resumo = {};
    
    meses.forEach((mes, i) => {
      resumo[mes] = { floracoes: [], frutificacoes: [] };
    });
    
    calendario.forEach(evento => {
      const mesIdx = new Date(evento.inicio).getMonth();
      const mes = meses[mesIdx];
      
      if (evento.evento === 'Floração') {
        resumo[mes].floracoes.push(evento.nome_popular);
      } else {
        resumo[mes].frutificacoes.push(evento.nome_popular);
      }
    });
    
    return resumo;
  },

  /**
   * Obtém alertas de polinizadores
   */
  getPollinatorAlerts: function() {
    try {
      const hoje = new Date();
      const alertas = [];
      
      Object.entries(this.ESPECIES_CERRADO).forEach(([especie, info]) => {
        const floracaoInicio = new Date(hoje.getFullYear(), info.floracao.inicio_mes - 1, 1);
        const floracaoFim = new Date(floracaoInicio);
        floracaoFim.setDate(floracaoFim.getDate() + info.floracao.duracao_dias);
        
        // Verifica se está em período de floração
        if (hoje >= floracaoInicio && hoje <= floracaoFim) {
          alertas.push({
            tipo: 'Em Floração',
            especie: especie,
            nome_popular: info.nome_popular,
            polinizadores: info.polinizadores,
            dias_restantes: Math.round((floracaoFim - hoje) / (1000 * 60 * 60 * 24)),
            acao: `Monitorar atividade de ${info.polinizadores.join(', ')}`
          });
        }
        
        // Verifica se floração está próxima (30 dias)
        const diasAteFlor = Math.round((floracaoInicio - hoje) / (1000 * 60 * 60 * 24));
        if (diasAteFlor > 0 && diasAteFlor <= 30) {
          alertas.push({
            tipo: 'Floração Próxima',
            especie: especie,
            nome_popular: info.nome_popular,
            polinizadores: info.polinizadores,
            dias_ate: diasAteFlor,
            acao: `Preparar monitoramento de ${info.polinizadores.join(', ')}`
          });
        }
      });
      
      // Ordena por urgência
      alertas.sort((a, b) => {
        if (a.tipo === 'Em Floração') return -1;
        if (b.tipo === 'Em Floração') return 1;
        return (a.dias_ate || 0) - (b.dias_ate || 0);
      });
      
      return {
        success: true,
        alertas: alertas,
        total: alertas.length,
        em_floracao: alertas.filter(a => a.tipo === 'Em Floração').length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Análise com IA usando Gemini
   */
  analyzeWithAI: function(especie, dadosClimaticos) {
    try {
      const apiKey = CONFIG.GEMINI_API_KEY;
      if (!apiKey) {
        return this.predictPhenology(especie, dadosClimaticos);
      }
      
      const especieInfo = this.ESPECIES_CERRADO[especie];
      if (!especieInfo) {
        return { success: false, error: 'Espécie não encontrada' };
      }
      
      const historico = this._getHistoricalData(especie);
      
      const prompt = `Analise a fenologia de ${especie} (${especieInfo.nome_popular}) no Cerrado goiano:

DADOS DA ESPÉCIE:
- Floração típica: mês ${especieInfo.floracao.inicio_mes}, duração ${especieInfo.floracao.duracao_dias} dias
- Frutificação típica: mês ${especieInfo.frutificacao.inicio_mes}, duração ${especieInfo.frutificacao.duracao_dias} dias
- Polinizadores: ${especieInfo.polinizadores.join(', ')}

DADOS CLIMÁTICOS ATUAIS:
${JSON.stringify(dadosClimaticos, null, 2)}

HISTÓRICO DE OBSERVAÇÕES: ${historico.floracao.length + historico.frutificacao.length} registros

Forneça em JSON:
{
  "previsao_floracao": "YYYY-MM-DD",
  "confianca_floracao": 0.0-1.0,
  "previsao_frutificacao": "YYYY-MM-DD",
  "confianca_frutificacao": 0.0-1.0,
  "fatores_influencia": ["fator1", "fator2"],
  "recomendacoes": ["rec1", "rec2"],
  "alertas_polinizadores": "texto"
}`;

      const response = UrlFetchApp.fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          }),
          muteHttpExceptions: true
        }
      );
      
      const result = JSON.parse(response.getContentText());
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extrai JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiAnalysis = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          especie: especie,
          nome_popular: especieInfo.nome_popular,
          ai_analysis: aiAnalysis,
          polinizadores: especieInfo.polinizadores
        };
      }
      
      // Fallback para predição padrão
      return this.predictPhenology(especie, dadosClimaticos);
    } catch (error) {
      Logger.log(`[analyzeWithAI] Erro: ${error}`);
      return this.predictPhenology(especie, dadosClimaticos);
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Predição Fenológica
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de fenologia
 */
function apiFenologiaInit() {
  return PhenologyPrediction.initializeSheets();
}

/**
 * Registra observação fenológica
 */
function apiFenologiaRegistrar(obsData) {
  return PhenologyPrediction.registerObservation(obsData);
}

/**
 * Lista observações fenológicas
 */
function apiFenologiaListar(filters) {
  return PhenologyPrediction.listObservations(filters || {});
}

/**
 * Prediz fenologia de uma espécie
 */
function apiFenologiaPrever(especie, climaData) {
  return PhenologyPrediction.predictPhenology(especie, climaData || {});
}

/**
 * Gera calendário fenológico
 */
function apiFenologiaCalendario(ano) {
  return PhenologyPrediction.generateCalendar(ano);
}

/**
 * Obtém alertas de polinizadores
 */
function apiFenologiaPolinizadores() {
  return PhenologyPrediction.getPollinatorAlerts();
}

/**
 * Análise com IA
 */
function apiFenologiaAnaliseIA(especie, climaData) {
  return PhenologyPrediction.analyzeWithAI(especie, climaData || {});
}

/**
 * Lista espécies disponíveis
 */
function apiFenologiaEspecies() {
  const especies = Object.entries(PhenologyPrediction.ESPECIES_CERRADO).map(([nome, info]) => ({
    nome_cientifico: nome,
    nome_popular: info.nome_popular,
    polinizadores: info.polinizadores,
    mes_floracao: info.floracao.inicio_mes,
    mes_frutificacao: info.frutificacao.inicio_mes
  }));
  
  return { success: true, especies: especies, total: especies.length };
}
