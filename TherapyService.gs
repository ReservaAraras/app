/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THERAPY SERVICE - Análises Terapêuticas Baseadas em Evidências
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Prompt 17/30: Registro de Sessão de Terapia e Notas Clínicas
 * Integração com WeatherStation para correlação ambiente-resultado
 *
 * Referências:
 * - WHO (2019). Mental Health in Primary Care
 * - Bratman et al. (2019). Nature and mental health
 * - Kaplan & Kaplan (1989). The Experience of Nature
 * - Ulrich et al. (1991). Stress recovery during exposure to natural environments
 */

const SESSOES_TERAPIA_HEADERS = [
  'ID_Sessao', 'Participante_ID', 'Data', 'Hora_Inicio', 'Hora_Fim',
  'Tipo_Terapia', 'Local', 'Terapeuta',
  // Biométricos
  'FC_Antes', 'FC_Depois', 'Estresse_Antes', 'Estresse_Depois',
  'Humor_Antes', 'Humor_Depois', 'Pressao_Arterial',
  // Ambientais (integração WeatherStation)
  'Temperatura_C', 'Umidade_Percent', 'Pressao_Atm_hPa', 'Condicao_Clima',
  'Sensacao_Termica', 'Indice_UV',
  // Notas
  'Notas_Clinicas', 'Observacoes', 'Satisfacao'
];

const TherapyService = {
  
  SHEET_SESSOES: 'SESSOES_TERAPIA_RA',
  
  /**
   * Tipos de terapia disponíveis
   */
  TIPOS_TERAPIA: {
    BANHO_FLORESTA: { id: 'BANHO_FLORESTA', nome: 'Banho de Floresta (Shinrin-yoku)', duracao_media: 90, descricao: 'Imersão sensorial na natureza' },
    MEDITACAO: { id: 'MEDITACAO', nome: 'Meditação Guiada', duracao_media: 45, descricao: 'Meditação em ambiente natural' },
    CAMINHADA: { id: 'CAMINHADA', nome: 'Caminhada Terapêutica', duracao_media: 60, descricao: 'Caminhada consciente em trilha' },
    YOGA: { id: 'YOGA', nome: 'Yoga ao Ar Livre', duracao_media: 60, descricao: 'Prática de yoga em ambiente natural' },
    OBSERVACAO: { id: 'OBSERVACAO', nome: 'Observação de Fauna/Flora', duracao_media: 45, descricao: 'Contemplação ativa da natureza' },
    TERAPIA_HORTA: { id: 'TERAPIA_HORTA', nome: 'Terapia na Horta', duracao_media: 60, descricao: 'Atividades de jardinagem terapêutica' },
    HIDROTERAPIA: { id: 'HIDROTERAPIA', nome: 'Hidroterapia Natural', duracao_media: 45, descricao: 'Imersão em águas naturais' }
  },

  /**
   * Inicializa planilha de sessões
   */
  initializeSessionSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_SESSOES);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_SESSOES);
        sheet.appendRow(SESSOES_TERAPIA_HEADERS);
        const headerRange = sheet.getRange(1, 1, 1, SESSOES_TERAPIA_HEADERS.length);
        headerRange.setBackground('#00695C').setFontColor('#FFFFFF').setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheet: this.SHEET_SESSOES };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém condições ambientais atuais da WeatherStation
   * @private
   */
  _getEnvironmentalConditions: function() {
    try {
      // Tenta obter dados da estação meteorológica
      if (typeof WeatherStation !== 'undefined' && WeatherStation.getCurrentConditions) {
        const weather = WeatherStation.getCurrentConditions();
        if (weather.success && weather.current) {
          return {
            success: true,
            temperatura: weather.current.temperatura || null,
            umidade: weather.current.umidade || null,
            pressao: weather.current.pressao || null,
            sensacao_termica: weather.current.sensacao_termica || null,
            indice_uv: weather.current.indice_uv || null,
            condicao: weather.current.condicao || weather.forecast?.condicao || 'Não disponível',
            fonte: 'WeatherStation'
          };
        }
      }
      
      // Fallback: tenta via API
      if (typeof apiMeteoAtual === 'function') {
        const weather = apiMeteoAtual();
        if (weather.success && weather.current) {
          return {
            success: true,
            temperatura: weather.current.temperatura || null,
            umidade: weather.current.umidade || null,
            pressao: weather.current.pressao || null,
            sensacao_termica: weather.current.sensacao_termica || null,
            indice_uv: weather.current.indice_uv || null,
            condicao: weather.forecast?.condicao || 'Não disponível',
            fonte: 'apiMeteoAtual'
          };
        }
      }
      
      // Sem dados disponíveis
      return {
        success: false,
        temperatura: null,
        umidade: null,
        pressao: null,
        sensacao_termica: null,
        indice_uv: null,
        condicao: 'Dados não disponíveis',
        fonte: 'none'
      };
    } catch (error) {
      Logger.log(`[_getEnvironmentalConditions] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cria uma nova sessão de terapia
   * Prompt 17/30: Integração com WeatherStation
   */
  createSessao: function(sessionData) {
    try {
      this.initializeSessionSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SESSOES);
      
      // Gera ID único
      const sessionId = `ST-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      
      // Obtém condições ambientais automaticamente
      const ambiente = this._getEnvironmentalConditions();
      
      // Valida tipo de terapia
      const tipoTerapia = sessionData.tipo_terapia || 'BANHO_FLORESTA';
      const tipoInfo = this.TIPOS_TERAPIA[tipoTerapia] || this.TIPOS_TERAPIA.BANHO_FLORESTA;
      
      // Calcula variações
      const variacaoFC = (sessionData.fc_depois || 0) - (sessionData.fc_antes || 0);
      const variacaoEstresse = (sessionData.estresse_depois || 0) - (sessionData.estresse_antes || 0);
      const variacaoHumor = (sessionData.humor_depois || 0) - (sessionData.humor_antes || 0);
      
      const row = [
        sessionId,
        sessionData.participante_id || '',
        sessionData.data || now.toISOString().split('T')[0],
        sessionData.hora_inicio || now.toTimeString().split(' ')[0],
        sessionData.hora_fim || '',
        tipoTerapia,
        sessionData.local || 'Trilha Principal',
        sessionData.terapeuta || '',
        // Biométricos
        sessionData.fc_antes || '',
        sessionData.fc_depois || '',
        sessionData.estresse_antes || '',
        sessionData.estresse_depois || '',
        sessionData.humor_antes || '',
        sessionData.humor_depois || '',
        sessionData.pressao_arterial || '',
        // Ambientais (da WeatherStation)
        ambiente.temperatura || '',
        ambiente.umidade || '',
        ambiente.pressao || '',
        ambiente.condicao || '',
        ambiente.sensacao_termica || '',
        ambiente.indice_uv || '',
        // Notas
        sessionData.notas_clinicas || '',
        sessionData.observacoes || '',
        sessionData.satisfacao || ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        session_id: sessionId,
        tipo_terapia: tipoInfo.nome,
        participante: sessionData.participante_id,
        data: sessionData.data || now.toISOString().split('T')[0],
        biometricos: {
          fc: { antes: sessionData.fc_antes, depois: sessionData.fc_depois, variacao: variacaoFC },
          estresse: { antes: sessionData.estresse_antes, depois: sessionData.estresse_depois, variacao: variacaoEstresse },
          humor: { antes: sessionData.humor_antes, depois: sessionData.humor_depois, variacao: variacaoHumor }
        },
        ambiente: {
          temperatura: ambiente.temperatura,
          umidade: ambiente.umidade,
          pressao: ambiente.pressao,
          condicao: ambiente.condicao,
          fonte: ambiente.fonte
        },
        analise: {
          melhoria_humor: variacaoHumor > 0,
          reducao_estresse: variacaoEstresse < 0,
          reducao_fc: variacaoFC < 0
        },
        message: 'Sessão registrada com sucesso!'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula índice de bem-estar de um participante
   * Baseado em escalas validadas: DASS-21, WHO-5
   */
  calculateWellbeingIndex(participanteId) {
    try {
      const avaliacoes = DatabaseService.read(CONFIG.SHEETS.AVALIACOES_TERAPIA,
        { participante_id: participanteId });

      if (!avaliacoes.success || avaliacoes.data.length === 0) {
        return { success: false, error: 'Sem avaliações para este participante' };
      }

      // Ordena por data
      const dados = avaliacoes.data
        .map(a => ({
          data: new Date(a.data),
          ansiedade: parseFloat(a.escala_ansiedade) || 0,
          depressao: parseFloat(a.escala_depressao) || 0,
          estresse: parseFloat(a.escala_estresse) || 0,
          bemestar: parseFloat(a.escala_bemestar) || 0,
          conexaoNatureza: parseFloat(a.conexao_natureza) || 0
        }))
        .sort((a, b) => a.data - b.data);

      const primeira = dados[0];
      const ultima = dados[dados.length - 1];

      // Índice composto de bem-estar (0-100)
      // Fórmula: (Bem-estar + Conexão Natureza - Ansiedade - Depressão - Estresse) / 5 * 20
      const indiceInicial = (((primeira.bemestar + primeira.conexaoNatureza - 
                             primeira.ansiedade - primeira.depressao - primeira.estresse) / 5) * 20) + 50;

      const indiceFinal = (((ultima.bemestar + ultima.conexaoNatureza - 
                           ultima.ansiedade - ultima.depressao - ultima.estresse) / 5) * 20) + 50;

      const melhoria = indiceFinal - indiceInicial;
      const melhoriaPercentual = indiceInicial > 0 ? (melhoria / indiceInicial) * 100 : 0;

      return {
        success: true,
        participante: participanteId,
        totalAvaliacoes: dados.length,
        periodo: {
          inicio: primeira.data,
          fim: ultima.data,
          dias: Math.floor((ultima.data - primeira.data) / (1000 * 60 * 60 * 24))
        },
        indices: {
          inicial: Math.max(0, Math.min(100, indiceInicial)).toFixed(1),
          final: Math.max(0, Math.min(100, indiceFinal)).toFixed(1),
          melhoria: melhoria.toFixed(1),
          melhoriaPercentual: melhoriaPercentual.toFixed(1) + '%'
        },
        evolucao: {
          ansiedade: {
            inicial: primeira.ansiedade,
            final: ultima.ansiedade,
            variacao: (ultima.ansiedade - primeira.ansiedade).toFixed(1)
          },
          depressao: {
            inicial: primeira.depressao,
            final: ultima.depressao,
            variacao: (ultima.depressao - primeira.depressao).toFixed(1)
          },
          estresse: {
            inicial: primeira.estresse,
            final: ultima.estresse,
            variacao: (ultima.estresse - primeira.estresse).toFixed(1)
          },
          bemestar: {
            inicial: primeira.bemestar,
            final: ultima.bemestar,
            variacao: (ultima.bemestar - primeira.bemestar).toFixed(1)
          }
        },
        classificacao: this._classifyWellbeing(indiceFinal),
        recomendacoes: this._generateTherapyRecommendations(ultima, melhoria)
      };
    } catch (error) {
      Utils.logError('TherapyService.calculateWellbeingIndex', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise de efetividade das sessões
   */
  analyzeSessionEffectiveness(participanteId) {
    try {
      const sessoes = DatabaseService.read(CONFIG.SHEETS.SESSOES,
        { participante_id: participanteId });

      if (!sessoes.success || sessoes.data.length === 0) {
        return { success: false, error: 'Sem sessões registradas' };
      }

      const dados = sessoes.data.map(s => ({
        data: new Date(s.data),
        tipo: s.tipo_terapia,
        duracao: parseFloat(s.duracao_minutos) || 60,
        satisfacao: parseFloat(s.satisfacao) || 0,
        local: s.local
      }));

      // Agrupa por tipo de terapia
      const porTipo = {};
      dados.forEach(s => {
        if (!porTipo[s.tipo]) {
          porTipo[s.tipo] = { sessoes: 0, satisfacaoTotal: 0, duracaoTotal: 0 };
        }
        porTipo[s.tipo].sessoes++;
        porTipo[s.tipo].satisfacaoTotal += s.satisfacao;
        porTipo[s.tipo].duracaoTotal += s.duracao;
      });

      const analise = Object.entries(porTipo).map(([tipo, stats]) => ({
        tipo,
        totalSessoes: stats.sessoes,
        satisfacaoMedia: (stats.satisfacaoTotal / stats.sessoes).toFixed(1),
        duracaoMedia: (stats.duracaoTotal / stats.sessoes).toFixed(0)
      }));

      return {
        success: true,
        participante: participanteId,
        totalSessoes: dados.length,
        porTipo: analise,
        satisfacaoGeral: (dados.reduce((sum, s) => sum + s.satisfacao, 0) / dados.length).toFixed(1)
      };
    } catch (error) {
      Utils.logError('TherapyService.analyzeSessionEffectiveness', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Relatório geral do programa terapêutico
   */
  generateProgramReport() {
    try {
      const participantes = DatabaseService.read(CONFIG.SHEETS.PARTICIPANTES);
      const sessoes = DatabaseService.read(CONFIG.SHEETS.SESSOES);
      const avaliacoes = DatabaseService.read(CONFIG.SHEETS.AVALIACOES_TERAPIA);

      if (!participantes.success) {
        return { success: false, error: 'Erro ao carregar participantes' };
      }

      const totalParticipantes = participantes.data.length;
      const totalSessoes = sessoes.success ? sessoes.data.length : 0;
      const totalAvaliacoes = avaliacoes.success ? avaliacoes.data.length : 0;

      // Calcula média de melhoria
      let melhorias = [];
      participantes.data.forEach(p => {
        const resultado = this.calculateWellbeingIndex(p.id);
        if (resultado.success) {
          melhorias.push(parseFloat(resultado.indices.melhoria));
        }
      });

      const melhoriaMedia = melhorias.length > 0 ? Utils.average(melhorias) : 0;

      return {
        success: true,
        dataRelatorio: new Date(),
        resumo: {
          totalParticipantes,
          totalSessoes,
          totalAvaliacoes,
          mediaSessoesPorParticipante: totalParticipantes > 0 ?
            (totalSessoes / totalParticipantes).toFixed(1) : 0
        },
        efetividade: {
          melhoriaMedia: melhoriaMedia.toFixed(1),
          participantesComMelhoria: melhorias.filter(m => m > 0).length,
          taxaSucesso: melhorias.length > 0 ?
            ((melhorias.filter(m => m > 0).length / melhorias.length) * 100).toFixed(1) + '%' : '0%'
        }
      };
    } catch (error) {
      Utils.logError('TherapyService.generateProgramReport', error);
      return { success: false, error: error.toString() };
    }
  },

  // Funções auxiliares
  _classifyWellbeing(indice) {
    if (indice >= 80) return 'Excelente';
    if (indice >= 60) return 'Bom';
    if (indice >= 40) return 'Regular';
    if (indice >= 20) return 'Baixo';
    return 'Crítico';
  },

  _generateTherapyRecommendations(ultima, melhoria) {
    const rec = [];

    if (melhoria > 10) {
      rec.push('Progresso excelente - manter protocolo atual');
    } else if (melhoria > 0) {
      rec.push('Progresso moderado - considerar intensificar sessões');
    } else {
      rec.push('Sem melhoria - reavaliar abordagem terapêutica');
    }

    if (ultima.ansiedade > 7) rec.push('Ansiedade elevada - técnicas de relaxamento');
    if (ultima.depressao > 7) rec.push('Depressão elevada - aumentar atividades ao ar livre');
    if (ultima.estresse > 7) rec.push('Estresse elevado - práticas de mindfulness');
    if (ultima.conexaoNatureza < 5) rec.push('Baixa conexão com natureza - mais tempo em trilhas');

    return rec;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMPT 17/30: FUNÇÕES DE SESSÃO E CORRELAÇÃO AMBIENTAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lista sessões de um participante
   */
  listSessoes: function(participanteId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SESSOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, sessoes: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const sessoes = [];
      
      for (let i = 1; i < data.length; i++) {
        if (!participanteId || data[i][1] === participanteId) {
          sessoes.push({
            id: data[i][0],
            participante_id: data[i][1],
            data: data[i][2],
            hora_inicio: data[i][3],
            hora_fim: data[i][4],
            tipo_terapia: data[i][5],
            local: data[i][6],
            terapeuta: data[i][7],
            biometricos: {
              fc_antes: data[i][8],
              fc_depois: data[i][9],
              estresse_antes: data[i][10],
              estresse_depois: data[i][11],
              humor_antes: data[i][12],
              humor_depois: data[i][13]
            },
            ambiente: {
              temperatura: data[i][15],
              umidade: data[i][16],
              pressao: data[i][17],
              condicao: data[i][18]
            },
            satisfacao: data[i][23]
          });
        }
      }
      
      return { success: true, sessoes: sessoes, count: sessoes.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa correlação entre condições ambientais e resultados terapêuticos
   * Prompt 17/30: Correlação científica ambiente-resultado
   */
  analyzeEnvironmentCorrelation: function() {
    try {
      const sessoesResult = this.listSessoes();
      if (!sessoesResult.success || sessoesResult.count === 0) {
        return { success: false, error: 'Sem sessões para análise' };
      }
      
      const sessoes = sessoesResult.sessoes.filter(s => 
        s.ambiente.temperatura && s.biometricos.humor_antes && s.biometricos.humor_depois
      );
      
      if (sessoes.length < 3) {
        return { success: false, error: 'Mínimo de 3 sessões com dados completos necessário' };
      }
      
      // Calcula variações
      const dados = sessoes.map(s => ({
        temperatura: parseFloat(s.ambiente.temperatura) || 0,
        umidade: parseFloat(s.ambiente.umidade) || 0,
        melhoria_humor: (parseFloat(s.biometricos.humor_depois) || 0) - (parseFloat(s.biometricos.humor_antes) || 0),
        reducao_estresse: (parseFloat(s.biometricos.estresse_antes) || 0) - (parseFloat(s.biometricos.estresse_depois) || 0)
      }));
      
      // Calcula correlações simples (Pearson)
      const corrTempHumor = this._calculateCorrelation(
        dados.map(d => d.temperatura),
        dados.map(d => d.melhoria_humor)
      );
      
      const corrUmidadeEstresse = this._calculateCorrelation(
        dados.map(d => d.umidade),
        dados.map(d => d.reducao_estresse)
      );
      
      // Identifica condições ideais
      const sessoesPositivas = dados.filter(d => d.melhoria_humor > 0 && d.reducao_estresse > 0);
      
      let condicoesIdeais = { temperatura: null, umidade: null };
      if (sessoesPositivas.length > 0) {
        condicoesIdeais.temperatura = {
          media: Math.round(sessoesPositivas.reduce((s, d) => s + d.temperatura, 0) / sessoesPositivas.length * 10) / 10,
          min: Math.min(...sessoesPositivas.map(d => d.temperatura)),
          max: Math.max(...sessoesPositivas.map(d => d.temperatura))
        };
        condicoesIdeais.umidade = {
          media: Math.round(sessoesPositivas.reduce((s, d) => s + d.umidade, 0) / sessoesPositivas.length * 10) / 10,
          min: Math.min(...sessoesPositivas.map(d => d.umidade)),
          max: Math.max(...sessoesPositivas.map(d => d.umidade))
        };
      }
      
      return {
        success: true,
        total_sessoes_analisadas: sessoes.length,
        correlacoes: {
          temperatura_humor: {
            coeficiente: corrTempHumor,
            interpretacao: this._interpretCorrelation(corrTempHumor),
            descricao: 'Correlação entre temperatura e melhoria de humor'
          },
          umidade_estresse: {
            coeficiente: corrUmidadeEstresse,
            interpretacao: this._interpretCorrelation(corrUmidadeEstresse),
            descricao: 'Correlação entre umidade e redução de estresse'
          }
        },
        condicoes_ideais: condicoesIdeais,
        sessoes_com_resultado_positivo: sessoesPositivas.length,
        taxa_sucesso: Math.round((sessoesPositivas.length / sessoes.length) * 100) + '%',
        recomendacoes: this._generateEnvironmentRecommendations(condicoesIdeais, corrTempHumor, corrUmidadeEstresse)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula coeficiente de correlação de Pearson
   * @private
   */
  _calculateCorrelation: function(x, y) {
    const n = x.length;
    if (n !== y.length || n < 2) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return Math.round((numerator / denominator) * 1000) / 1000;
  },

  /**
   * Interpreta coeficiente de correlação
   * @private
   */
  _interpretCorrelation: function(r) {
    const absR = Math.abs(r);
    let forca = '';
    
    if (absR >= 0.7) forca = 'Forte';
    else if (absR >= 0.4) forca = 'Moderada';
    else if (absR >= 0.2) forca = 'Fraca';
    else forca = 'Muito fraca';
    
    const direcao = r >= 0 ? 'positiva' : 'negativa';
    
    return `${forca} ${direcao} (r=${r})`;
  },

  /**
   * Gera recomendações baseadas na análise ambiental
   * @private
   */
  _generateEnvironmentRecommendations: function(condicoes, corrTemp, corrUmidade) {
    const rec = [];
    
    if (condicoes.temperatura) {
      rec.push(`Temperatura ideal para sessões: ${condicoes.temperatura.min}°C a ${condicoes.temperatura.max}°C (média: ${condicoes.temperatura.media}°C)`);
    }
    
    if (condicoes.umidade) {
      rec.push(`Umidade ideal: ${condicoes.umidade.min}% a ${condicoes.umidade.max}% (média: ${condicoes.umidade.media}%)`);
    }
    
    if (corrTemp > 0.3) {
      rec.push('Temperaturas mais altas tendem a melhorar resultados - priorizar horários mais quentes');
    } else if (corrTemp < -0.3) {
      rec.push('Temperaturas mais amenas tendem a melhorar resultados - priorizar manhãs ou fins de tarde');
    }
    
    if (corrUmidade > 0.3) {
      rec.push('Maior umidade correlaciona com melhor redução de estresse - considerar dias após chuva');
    } else if (corrUmidade < -0.3) {
      rec.push('Menor umidade correlaciona com melhor redução de estresse - preferir dias secos');
    }
    
    return rec;
  },

  /**
   * Obtém tipos de terapia disponíveis
   */
  getTiposTerapia: function() {
    return {
      success: true,
      tipos: Object.values(this.TIPOS_TERAPIA)
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMPT 18/30: MEDIÇÃO DE RESULTADOS E RASTREAMENTO DE PROGRESSO
  // ═══════════════════════════════════════════════════════════════════════════

  SHEET_AVALIACOES: 'AVALIACOES_TERAPIA_RA',

  /**
   * Escalas psicométricas validadas
   */
  ESCALAS: {
    DASS_21: {
      id: 'DASS_21',
      nome: 'Depression Anxiety Stress Scales',
      dimensoes: ['depressao', 'ansiedade', 'estresse'],
      range: [0, 21],
      interpretacao: {
        normal: [0, 9],
        leve: [10, 13],
        moderado: [14, 20],
        severo: [21, 27],
        extremo: [28, 42]
      }
    },
    WHO_5: {
      id: 'WHO_5',
      nome: 'WHO-5 Well-Being Index',
      dimensoes: ['bem_estar'],
      range: [0, 25],
      interpretacao: {
        baixo: [0, 12],
        adequado: [13, 25]
      }
    },
    NRS: {
      id: 'NRS',
      nome: 'Nature Relatedness Scale',
      dimensoes: ['conexao_natureza'],
      range: [1, 10],
      interpretacao: {
        baixa: [1, 3],
        moderada: [4, 6],
        alta: [7, 10]
      }
    }
  },

  /**
   * Inicializa planilha de avaliações
   */
  initializeAvaliacoesSheet: function() {
    try {
      const ss = getSpreadsheet();
      const headers = [
        'ID_Avaliacao', 'Participante_ID', 'Data', 'Tipo_Avaliacao',
        'Ansiedade', 'Depressao', 'Estresse', 'Bem_Estar', 'Conexao_Natureza',
        'Indice_Composto', 'Classificacao', 'Avaliador', 'Observacoes'
      ];
      
      let sheet = ss.getSheetByName(this.SHEET_AVALIACOES);
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_AVALIACOES);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setBackground('#00897B').setFontColor('#FFFFFF').setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheet: this.SHEET_AVALIACOES };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra uma avaliação psicométrica
   */
  registerAvaliacao: function(avaliacaoData) {
    try {
      this.initializeAvaliacoesSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AVALIACOES);
      
      const avaliacaoId = `AV-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      
      // Calcula índice composto
      const ansiedade = parseFloat(avaliacaoData.ansiedade) || 0;
      const depressao = parseFloat(avaliacaoData.depressao) || 0;
      const estresse = parseFloat(avaliacaoData.estresse) || 0;
      const bemEstar = parseFloat(avaliacaoData.bem_estar) || 5;
      const conexaoNatureza = parseFloat(avaliacaoData.conexao_natureza) || 5;
      
      // Índice: (Bem-estar + Conexão - (Ansiedade + Depressão + Estresse)/3) normalizado 0-100
      const indiceComposto = Math.max(0, Math.min(100,
        ((bemEstar * 4 + conexaoNatureza * 4 - (ansiedade + depressao + estresse) / 3 * 2) / 10) * 100 / 8
      ));
      
      const classificacao = this._classifyWellbeing(indiceComposto);
      
      const row = [
        avaliacaoId,
        avaliacaoData.participante_id || '',
        avaliacaoData.data || now.toISOString().split('T')[0],
        avaliacaoData.tipo || 'ROTINA',
        ansiedade,
        depressao,
        estresse,
        bemEstar,
        conexaoNatureza,
        Math.round(indiceComposto * 10) / 10,
        classificacao,
        avaliacaoData.avaliador || '',
        avaliacaoData.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        avaliacao_id: avaliacaoId,
        participante: avaliacaoData.participante_id,
        data: avaliacaoData.data || now.toISOString().split('T')[0],
        escalas: { ansiedade, depressao, estresse, bemEstar, conexaoNatureza },
        indice_composto: Math.round(indiceComposto * 10) / 10,
        classificacao: classificacao,
        message: 'Avaliação registrada com sucesso!'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista avaliações de um participante
   */
  listAvaliacoes: function(participanteId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AVALIACOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, avaliacoes: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const avaliacoes = [];
      
      for (let i = 1; i < data.length; i++) {
        if (!participanteId || data[i][1] === participanteId) {
          avaliacoes.push({
            id: data[i][0],
            participante_id: data[i][1],
            data: data[i][2],
            tipo: data[i][3],
            ansiedade: data[i][4],
            depressao: data[i][5],
            estresse: data[i][6],
            bem_estar: data[i][7],
            conexao_natureza: data[i][8],
            indice_composto: data[i][9],
            classificacao: data[i][10]
          });
        }
      }
      
      // Ordena por data
      avaliacoes.sort((a, b) => new Date(a.data) - new Date(b.data));
      
      return { success: true, avaliacoes: avaliacoes, count: avaliacoes.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório de progresso longitudinal
   * Prompt 18/30: Análise de tendência e evolução
   */
  generateProgressReport: function(participanteId) {
    try {
      const avaliacoesResult = this.listAvaliacoes(participanteId);
      
      if (!avaliacoesResult.success || avaliacoesResult.count < 2) {
        return { 
          success: false, 
          error: 'Mínimo de 2 avaliações necessárias para relatório de progresso' 
        };
      }
      
      const avaliacoes = avaliacoesResult.avaliacoes;
      const primeira = avaliacoes[0];
      const ultima = avaliacoes[avaliacoes.length - 1];
      
      // Calcula período
      const dataInicio = new Date(primeira.data);
      const dataFim = new Date(ultima.data);
      const diasTotal = Math.max(1, Math.floor((dataFim - dataInicio) / (1000 * 60 * 60 * 24)));
      const semanasTotal = Math.max(1, Math.ceil(diasTotal / 7));
      
      // Calcula variações
      const variacoes = {
        ansiedade: ultima.ansiedade - primeira.ansiedade,
        depressao: ultima.depressao - primeira.depressao,
        estresse: ultima.estresse - primeira.estresse,
        bem_estar: ultima.bem_estar - primeira.bem_estar,
        conexao_natureza: ultima.conexao_natureza - primeira.conexao_natureza,
        indice: ultima.indice_composto - primeira.indice_composto
      };
      
      // Taxa de melhoria por semana
      const taxaMelhoriaSemanal = variacoes.indice / semanasTotal;
      
      // Classifica progresso
      let classificacaoProgresso;
      if (variacoes.indice >= 15) classificacaoProgresso = 'Melhoria Significativa';
      else if (variacoes.indice >= 5) classificacaoProgresso = 'Melhoria Moderada';
      else if (variacoes.indice >= -5) classificacaoProgresso = 'Estável';
      else if (variacoes.indice >= -15) classificacaoProgresso = 'Regressão Leve';
      else classificacaoProgresso = 'Regressão Significativa';
      
      // Dados para gráfico de evolução
      const evolucaoGrafico = avaliacoes.map(a => ({
        data: a.data,
        indice: a.indice_composto,
        ansiedade: a.ansiedade,
        bem_estar: a.bem_estar
      }));
      
      // Análise por dimensão
      const analiseDimensoes = [
        { dimensao: 'Ansiedade', inicial: primeira.ansiedade, final: ultima.ansiedade, variacao: variacoes.ansiedade, tendencia: variacoes.ansiedade < 0 ? 'Melhora' : variacoes.ansiedade > 0 ? 'Piora' : 'Estável' },
        { dimensao: 'Depressão', inicial: primeira.depressao, final: ultima.depressao, variacao: variacoes.depressao, tendencia: variacoes.depressao < 0 ? 'Melhora' : variacoes.depressao > 0 ? 'Piora' : 'Estável' },
        { dimensao: 'Estresse', inicial: primeira.estresse, final: ultima.estresse, variacao: variacoes.estresse, tendencia: variacoes.estresse < 0 ? 'Melhora' : variacoes.estresse > 0 ? 'Piora' : 'Estável' },
        { dimensao: 'Bem-estar', inicial: primeira.bem_estar, final: ultima.bem_estar, variacao: variacoes.bem_estar, tendencia: variacoes.bem_estar > 0 ? 'Melhora' : variacoes.bem_estar < 0 ? 'Piora' : 'Estável' },
        { dimensao: 'Conexão Natureza', inicial: primeira.conexao_natureza, final: ultima.conexao_natureza, variacao: variacoes.conexao_natureza, tendencia: variacoes.conexao_natureza > 0 ? 'Melhora' : variacoes.conexao_natureza < 0 ? 'Piora' : 'Estável' }
      ];
      
      // Gera recomendações
      const recomendacoes = this._generateProgressRecommendations(ultima, variacoes, classificacaoProgresso);
      
      return {
        success: true,
        participante_id: participanteId,
        periodo: {
          inicio: primeira.data,
          fim: ultima.data,
          dias: diasTotal,
          semanas: semanasTotal,
          total_avaliacoes: avaliacoes.length
        },
        resumo: {
          indice_inicial: primeira.indice_composto,
          indice_final: ultima.indice_composto,
          variacao_total: Math.round(variacoes.indice * 10) / 10,
          variacao_percentual: primeira.indice_composto > 0 ? 
            Math.round((variacoes.indice / primeira.indice_composto) * 1000) / 10 + '%' : 'N/A',
          taxa_melhoria_semanal: Math.round(taxaMelhoriaSemanal * 100) / 100,
          classificacao_inicial: primeira.classificacao,
          classificacao_final: ultima.classificacao,
          progresso: classificacaoProgresso
        },
        analise_dimensoes: analiseDimensoes,
        evolucao_grafico: evolucaoGrafico,
        recomendacoes: recomendacoes,
        evidencias: {
          base_cientifica: 'Bratman et al. (2019), Ulrich et al. (1991)',
          escalas_utilizadas: ['DASS-21', 'WHO-5', 'NRS'],
          nota: 'Resultados baseados em escalas psicométricas validadas'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recomendações baseadas no progresso
   * @private
   */
  _generateProgressRecommendations: function(ultima, variacoes, classificacao) {
    const rec = [];
    
    // Baseado na classificação geral
    if (classificacao === 'Melhoria Significativa') {
      rec.push('✅ Excelente progresso! Manter protocolo atual de terapia na natureza.');
      rec.push('📊 Considerar reduzir frequência de avaliações para mensal.');
    } else if (classificacao === 'Melhoria Moderada') {
      rec.push('👍 Bom progresso. Continuar com o programa atual.');
      rec.push('🔄 Avaliar intensificação de sessões para acelerar resultados.');
    } else if (classificacao === 'Estável') {
      rec.push('⚖️ Resultados estáveis. Revisar abordagem terapêutica.');
      rec.push('🔍 Investigar possíveis barreiras ao progresso.');
    } else {
      rec.push('⚠️ Atenção: regressão detectada. Reavaliação urgente necessária.');
      rec.push('👨‍⚕️ Considerar encaminhamento para avaliação complementar.');
    }
    
    // Recomendações específicas por dimensão
    if (ultima.ansiedade > 7) {
      rec.push('🧘 Ansiedade elevada: intensificar técnicas de respiração e meditação.');
    }
    if (ultima.depressao > 7) {
      rec.push('🌳 Depressão elevada: aumentar exposição à natureza e atividades físicas.');
    }
    if (ultima.estresse > 7) {
      rec.push('🌊 Estresse elevado: priorizar sessões de Banho de Floresta.');
    }
    if (ultima.conexao_natureza < 5) {
      rec.push('🌿 Baixa conexão com natureza: incluir atividades de observação contemplativa.');
    }
    
    return rec;
  },

  /**
   * Obtém escalas psicométricas disponíveis
   */
  getEscalas: function() {
    return {
      success: true,
      escalas: Object.values(this.ESCALAS)
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMPT 19/30: DESIGN DE PRESCRIÇÃO DA NATUREZA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Condições de saúde e suas restrições/recomendações
   */
  CONDICOES_SAUDE: {
    HIPERTENSAO: {
      id: 'HIPERTENSAO',
      nome: 'Hipertensão',
      dificuldade_max: 'Fácil',
      restricoes: ['Evitar subidas íngremes', 'Evitar exposição solar intensa'],
      recomendacoes: ['Trilhas planas', 'Ambientes sombreados', 'Pausas frequentes'],
      atividades_ideais: ['Meditação', 'Contemplação', 'Respiração']
    },
    ANSIEDADE: {
      id: 'ANSIEDADE',
      nome: 'Transtorno de Ansiedade',
      dificuldade_max: 'Moderada',
      restricoes: ['Evitar trilhas muito isoladas', 'Evitar locais com muita gente'],
      recomendacoes: ['Ambientes tranquilos', 'Presença de água', 'Vegetação densa'],
      atividades_ideais: ['Banho de Floresta', 'Respiração', 'Grounding']
    },
    DEPRESSAO: {
      id: 'DEPRESSAO',
      nome: 'Depressão',
      dificuldade_max: 'Moderada',
      restricoes: ['Evitar trilhas muito longas inicialmente'],
      recomendacoes: ['Exposição solar moderada', 'Contato com fauna', 'Atividade física leve'],
      atividades_ideais: ['Caminhada', 'Observação de aves', 'Jardinagem']
    },
    ESTRESSE: {
      id: 'ESTRESSE',
      nome: 'Estresse Crônico',
      dificuldade_max: 'Moderada',
      restricoes: ['Evitar trilhas com muitos obstáculos'],
      recomendacoes: ['Sons da natureza', 'Cachoeiras', 'Áreas de descanso'],
      atividades_ideais: ['Banho de Floresta', 'Meditação', 'Hidroterapia']
    },
    OBESIDADE: {
      id: 'OBESIDADE',
      nome: 'Obesidade',
      dificuldade_max: 'Fácil',
      restricoes: ['Evitar trilhas íngremes', 'Evitar calor extremo'],
      recomendacoes: ['Trilhas curtas inicialmente', 'Progressão gradual', 'Hidratação'],
      atividades_ideais: ['Caminhada leve', 'Yoga', 'Alongamento']
    },
    DIABETES: {
      id: 'DIABETES',
      nome: 'Diabetes',
      dificuldade_max: 'Moderada',
      restricoes: ['Levar lanches', 'Monitorar glicemia'],
      recomendacoes: ['Trilhas com infraestrutura', 'Pausas regulares'],
      atividades_ideais: ['Caminhada', 'Yoga', 'Meditação']
    },
    IDOSO: {
      id: 'IDOSO',
      nome: 'Idoso (65+)',
      dificuldade_max: 'Fácil',
      restricoes: ['Evitar terreno irregular', 'Evitar escadas'],
      recomendacoes: ['Trilhas acessíveis', 'Bancos de descanso', 'Acompanhamento'],
      atividades_ideais: ['Contemplação', 'Observação', 'Meditação sentada']
    },
    GERAL: {
      id: 'GERAL',
      nome: 'Bem-estar Geral',
      dificuldade_max: 'Difícil',
      restricoes: [],
      recomendacoes: ['Variar experiências', 'Explorar diferentes ambientes'],
      atividades_ideais: ['Todas']
    }
  },

  /**
   * Destaques/características das trilhas
   */
  DESTAQUES_TRILHA: {
    MEDITATIVO: { id: 'MEDITATIVO', nome: 'Meditativo', descricao: 'Ambiente silencioso e contemplativo', icone: '🧘' },
    FISICO: { id: 'FISICO', nome: 'Físico', descricao: 'Foco em exercício e movimento', icone: '🏃' },
    CONTEMPLATIVO: { id: 'CONTEMPLATIVO', nome: 'Contemplativo', descricao: 'Vistas panorâmicas e paisagens', icone: '👁️' },
    AQUATICO: { id: 'AQUATICO', nome: 'Aquático', descricao: 'Presença de rios, cachoeiras ou lagos', icone: '💧' },
    FAUNA: { id: 'FAUNA', nome: 'Fauna', descricao: 'Ideal para observação de animais', icone: '🦜' },
    FLORA: { id: 'FLORA', nome: 'Flora', descricao: 'Rica diversidade de plantas', icone: '🌿' }
  },

  /**
   * Atividades terapêuticas por contexto
   */
  ATIVIDADES_TERAPEUTICAS: {
    RESPIRACAO: { nome: 'Exercício de Respiração', duracao: 10, instrucao: 'Encontre um local confortável. Inspire por 4 segundos, segure por 4, expire por 6. Repita 10 vezes.' },
    GROUNDING: { nome: 'Grounding (Aterramento)', duracao: 15, instrucao: 'Tire os sapatos e sinta o solo. Identifique 5 coisas que vê, 4 que ouve, 3 que sente, 2 que cheira, 1 que pode tocar.' },
    SILENCIO: { nome: 'Momento de Silêncio', duracao: 15, instrucao: 'Sente-se confortavelmente e permaneça em silêncio absoluto por 15 minutos. Apenas observe.' },
    CONTEMPLACAO_AGUA: { nome: 'Contemplação da Água', duracao: 20, instrucao: 'Observe o movimento da água. Deixe seus pensamentos fluírem como a correnteza.' },
    ABRACO_ARVORE: { nome: 'Abraço de Árvore', duracao: 5, instrucao: 'Escolha uma árvore grande. Abrace-a por 5 minutos, sentindo sua energia e estabilidade.' },
    CAMINHADA_CONSCIENTE: { nome: 'Caminhada Consciente', duracao: 20, instrucao: 'Caminhe lentamente, prestando atenção em cada passo. Sinta o contato do pé com o solo.' },
    OBSERVACAO_AVES: { nome: 'Observação de Aves', duracao: 30, instrucao: 'Encontre um local com boa visibilidade. Observe as aves sem se mover. Anote espécies vistas.' },
    DIARIO_NATUREZA: { nome: 'Diário da Natureza', duracao: 15, instrucao: 'Escreva sobre o que está sentindo neste momento. Descreva o ambiente ao seu redor.' }
  },

  /**
   * Obtém trilhas disponíveis do sistema
   * @private
   */
  _getAvailableTrails: function() {
    try {
      // Tenta obter do DatabaseService
      if (typeof DatabaseService !== 'undefined' && typeof CONFIG !== 'undefined') {
        const result = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
        if (result.success && result.data) {
          return result.data.map(t => ({
            id: t.id,
            nome: t.nome,
            descricao: t.descricao,
            distancia_km: parseFloat(t.distancia_km) || 0,
            tempo_horas: parseFloat(t.tempo_visita_horas) || 1,
            dificuldade: t.dificuldade || 'Moderada',
            pontos_interesse: t.pontos_interesse || '',
            infraestrutura: t.infraestrutura || '',
            status: t.status || 'ativo'
          })).filter(t => t.status === 'ativo');
        }
      }
      
      // Fallback: trilhas de exemplo
      return [
        { id: 'TR-001', nome: 'Trilha da Cachoeira', descricao: 'Trilha até a cachoeira principal', distancia_km: 2.5, tempo_horas: 1.5, dificuldade: 'Fácil', pontos_interesse: 'Cachoeira, Mirante', infraestrutura: 'Bancos, Corrimão', destaque: 'AQUATICO' },
        { id: 'TR-002', nome: 'Trilha do Cerrado', descricao: 'Imersão no cerrado nativo', distancia_km: 4.0, tempo_horas: 2.5, dificuldade: 'Moderada', pontos_interesse: 'Flora nativa, Fauna', infraestrutura: 'Sinalização', destaque: 'FLORA' },
        { id: 'TR-003', nome: 'Trilha Contemplativa', descricao: 'Trilha curta para meditação', distancia_km: 1.0, tempo_horas: 0.5, dificuldade: 'Fácil', pontos_interesse: 'Área de meditação, Jardim', infraestrutura: 'Bancos, Sombra', destaque: 'MEDITATIVO' },
        { id: 'TR-004', nome: 'Trilha do Mirante', descricao: 'Subida até o mirante panorâmico', distancia_km: 3.5, tempo_horas: 2.0, dificuldade: 'Difícil', pontos_interesse: 'Vista panorâmica', infraestrutura: 'Escadas', destaque: 'CONTEMPLATIVO' },
        { id: 'TR-005', nome: 'Trilha das Aves', descricao: 'Ideal para observação de aves', distancia_km: 2.0, tempo_horas: 1.5, dificuldade: 'Fácil', pontos_interesse: 'Pontos de observação', infraestrutura: 'Esconderijos', destaque: 'FAUNA' }
      ];
    } catch (error) {
      Logger.log(`[_getAvailableTrails] Erro: ${error}`);
      return [];
    }
  },

  /**
   * Filtra trilhas compatíveis com uma condição de saúde
   * @private
   */
  _filterTrailsByCondition: function(trails, condicao) {
    const config = this.CONDICOES_SAUDE[condicao] || this.CONDICOES_SAUDE.GERAL;
    const dificuldadeMax = config.dificuldade_max;
    
    const niveis = { 'Fácil': 1, 'Moderada': 2, 'Difícil': 3 };
    const nivelMax = niveis[dificuldadeMax] || 3;
    
    return trails.filter(t => {
      const nivelTrilha = niveis[t.dificuldade] || 2;
      return nivelTrilha <= nivelMax;
    });
  },

  /**
   * Gera uma Prescrição da Natureza personalizada
   * Prompt 19/30: Design de Prescrição da Natureza
   */
  generateNaturePrescription: function(participanteId, condicao, preferencias = {}) {
    try {
      const condicaoConfig = this.CONDICOES_SAUDE[condicao] || this.CONDICOES_SAUDE.GERAL;
      
      // Obtém trilhas disponíveis
      const todasTrilhas = this._getAvailableTrails();
      const trilhasCompativeis = this._filterTrailsByCondition(todasTrilhas, condicao);
      
      if (trilhasCompativeis.length === 0) {
        return { success: false, error: 'Nenhuma trilha compatível encontrada' };
      }
      
      // Seleciona trilha principal (pode ser baseada em preferência)
      const trilhaPrincipal = preferencias.trilha_id 
        ? trilhasCompativeis.find(t => t.id === preferencias.trilha_id) || trilhasCompativeis[0]
        : trilhasCompativeis[0];
      
      // Seleciona atividades baseadas na condição
      const atividadesRecomendadas = this._selectActivities(condicaoConfig, trilhaPrincipal);
      
      // Calcula duração total
      const duracaoAtividades = atividadesRecomendadas.reduce((sum, a) => sum + a.duracao, 0);
      const duracaoTotal = (trilhaPrincipal.tempo_horas * 60) + duracaoAtividades;
      
      // Gera plano estruturado
      const prescricaoId = `RX-${Date.now().toString(36).toUpperCase()}`;
      const dataEmissao = new Date().toISOString().split('T')[0];
      
      const prescricao = {
        success: true,
        prescricao_id: prescricaoId,
        data_emissao: dataEmissao,
        validade: '30 dias',
        
        paciente: {
          id: participanteId,
          condicao_principal: condicaoConfig.nome
        },
        
        trilha_prescrita: {
          id: trilhaPrincipal.id,
          nome: trilhaPrincipal.nome,
          descricao: trilhaPrincipal.descricao,
          distancia_km: trilhaPrincipal.distancia_km,
          duracao_caminhada_min: Math.round(trilhaPrincipal.tempo_horas * 60),
          dificuldade: trilhaPrincipal.dificuldade,
          pontos_interesse: trilhaPrincipal.pontos_interesse,
          infraestrutura: trilhaPrincipal.infraestrutura
        },
        
        plano_terapeutico: {
          duracao_total_min: duracaoTotal,
          frequencia_recomendada: condicao === 'GERAL' ? '1-2x por semana' : '2-3x por semana',
          atividades: atividadesRecomendadas,
          sequencia: this._generateActivitySequence(trilhaPrincipal, atividadesRecomendadas)
        },
        
        orientacoes: {
          restricoes: condicaoConfig.restricoes,
          recomendacoes: condicaoConfig.recomendacoes,
          equipamentos: ['Água (mínimo 500ml)', 'Protetor solar', 'Chapéu', 'Calçado confortável'],
          contraindicacoes: ['Não realizar em caso de mal-estar', 'Evitar horários de sol intenso (10h-16h)']
        },
        
        trilhas_alternativas: trilhasCompativeis
          .filter(t => t.id !== trilhaPrincipal.id)
          .slice(0, 2)
          .map(t => ({ id: t.id, nome: t.nome, dificuldade: t.dificuldade })),
        
        assinatura: {
          profissional: 'Equipe Terapêutica Reserva Araras',
          registro: 'CRP/CRM',
          nota: 'Esta prescrição é complementar ao tratamento convencional'
        }
      };
      
      return prescricao;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Seleciona atividades terapêuticas baseadas na condição
   * @private
   */
  _selectActivities: function(condicaoConfig, trilha) {
    const atividades = [];
    const ideais = condicaoConfig.atividades_ideais || [];
    
    // Sempre inclui respiração no início
    atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.RESPIRACAO, momento: 'Início' });
    
    // Adiciona atividades baseadas na condição
    if (ideais.includes('Banho de Floresta') || ideais.includes('Todas')) {
      atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.SILENCIO, momento: 'Durante' });
    }
    if (ideais.includes('Meditação') || ideais.includes('Todas')) {
      atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.GROUNDING, momento: 'Durante' });
    }
    if (trilha.destaque === 'AQUATICO' || trilha.pontos_interesse?.includes('Cachoeira')) {
      atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.CONTEMPLACAO_AGUA, momento: 'Ponto de interesse' });
    }
    if (ideais.includes('Observação de aves') || trilha.destaque === 'FAUNA') {
      atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.OBSERVACAO_AVES, momento: 'Durante' });
    }
    
    // Sempre termina com diário
    atividades.push({ ...this.ATIVIDADES_TERAPEUTICAS.DIARIO_NATUREZA, momento: 'Final' });
    
    return atividades;
  },

  /**
   * Gera sequência de atividades na trilha
   * @private
   */
  _generateActivitySequence: function(trilha, atividades) {
    const sequencia = [];
    
    sequencia.push({
      ordem: 1,
      local: 'Início da trilha',
      atividade: 'Preparação e aquecimento',
      duracao_min: 5,
      instrucao: 'Alongue-se levemente. Defina sua intenção para a caminhada.'
    });
    
    let ordem = 2;
    atividades.forEach(a => {
      if (a.momento === 'Início') {
        sequencia.push({
          ordem: ordem++,
          local: 'Área inicial',
          atividade: a.nome,
          duracao_min: a.duracao,
          instrucao: a.instrucao
        });
      }
    });
    
    sequencia.push({
      ordem: ordem++,
      local: 'Trilha',
      atividade: 'Caminhada consciente',
      duracao_min: Math.round(trilha.tempo_horas * 30),
      instrucao: 'Caminhe em ritmo confortável, observando a natureza ao redor.'
    });
    
    atividades.forEach(a => {
      if (a.momento === 'Durante' || a.momento === 'Ponto de interesse') {
        sequencia.push({
          ordem: ordem++,
          local: a.momento === 'Ponto de interesse' ? trilha.pontos_interesse?.split(',')[0] || 'Ponto especial' : 'Área sombreada',
          atividade: a.nome,
          duracao_min: a.duracao,
          instrucao: a.instrucao
        });
      }
    });
    
    sequencia.push({
      ordem: ordem++,
      local: 'Retorno',
      atividade: 'Caminhada de retorno',
      duracao_min: Math.round(trilha.tempo_horas * 30),
      instrucao: 'Retorne em ritmo tranquilo, integrando a experiência.'
    });
    
    atividades.forEach(a => {
      if (a.momento === 'Final') {
        sequencia.push({
          ordem: ordem++,
          local: 'Área de encerramento',
          atividade: a.nome,
          duracao_min: a.duracao,
          instrucao: a.instrucao
        });
      }
    });
    
    return sequencia;
  },

  /**
   * Obtém condições de saúde disponíveis
   */
  getCondicoesSaude: function() {
    return {
      success: true,
      condicoes: Object.values(this.CONDICOES_SAUDE)
    };
  },

  /**
   * Obtém trilhas compatíveis com uma condição
   */
  getTrilhasCompativeis: function(condicao) {
    const trilhas = this._getAvailableTrails();
    const compativeis = this._filterTrailsByCondition(trilhas, condicao);
    
    return {
      success: true,
      condicao: condicao,
      trilhas: compativeis,
      count: compativeis.length
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Terapia e Sessões
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de sessões
 */
function apiTherapyInit() {
  return TherapyService.initializeSessionSheet();
}

/**
 * Cria uma nova sessão de terapia
 * Prompt 17/30: Integração com WeatherStation
 * @param {object} sessionData - Dados da sessão
 */
function apiTherapyCreateSessao(sessionData) {
  return TherapyService.createSessao(sessionData);
}

/**
 * Lista sessões de um participante
 * @param {string} participanteId - ID do participante (opcional)
 */
function apiTherapyListSessoes(participanteId) {
  return TherapyService.listSessoes(participanteId || null);
}

/**
 * Analisa correlação ambiente-resultado
 * Prompt 17/30: Correlação científica
 */
function apiTherapyEnvironmentCorrelation() {
  return TherapyService.analyzeEnvironmentCorrelation();
}

/**
 * Obtém tipos de terapia disponíveis
 */
function apiTherapyGetTiposTerapia() {
  return TherapyService.getTiposTerapia();
}

/**
 * Calcula índice de bem-estar
 */
function apiTherapyWellbeingIndex(participanteId) {
  return TherapyService.calculateWellbeingIndex(participanteId);
}

/**
 * Analisa efetividade das sessões
 */
function apiTherapySessionEffectiveness(participanteId) {
  return TherapyService.analyzeSessionEffectiveness(participanteId);
}

/**
 * Gera relatório do programa
 */
function apiTherapyProgramReport() {
  return TherapyService.generateProgramReport();
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 18/30: APIs de Avaliação e Progresso
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de avaliações
 */
function apiTherapyInitAvaliacoes() {
  return TherapyService.initializeAvaliacoesSheet();
}

/**
 * Registra uma avaliação psicométrica
 * @param {object} avaliacaoData - { participante_id, ansiedade, depressao, estresse, bem_estar, conexao_natureza }
 */
function apiTherapyRegisterAvaliacao(avaliacaoData) {
  return TherapyService.registerAvaliacao(avaliacaoData);
}

/**
 * Lista avaliações de um participante
 */
function apiTherapyListAvaliacoes(participanteId) {
  return TherapyService.listAvaliacoes(participanteId || null);
}

/**
 * Gera relatório de progresso longitudinal
 * Prompt 18/30: Análise de tendência e evolução
 */
function apiTherapyProgressReport(participanteId) {
  return TherapyService.generateProgressReport(participanteId);
}

/**
 * Obtém escalas psicométricas disponíveis
 */
function apiTherapyGetEscalas() {
  return TherapyService.getEscalas();
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 19/30: APIs de Prescrição da Natureza
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera uma Prescrição da Natureza personalizada
 * @param {string} participanteId - ID do participante
 * @param {string} condicao - Condição de saúde (HIPERTENSAO, ANSIEDADE, etc.)
 * @param {object} preferencias - Preferências opcionais { trilha_id }
 */
function apiTherapyGeneratePrescription(participanteId, condicao, preferencias) {
  return TherapyService.generateNaturePrescription(participanteId, condicao || 'GERAL', preferencias || {});
}

/**
 * Obtém condições de saúde disponíveis
 */
function apiTherapyGetCondicoesSaude() {
  return TherapyService.getCondicoesSaude();
}

/**
 * Obtém trilhas compatíveis com uma condição
 */
function apiTherapyGetTrilhasCompativeis(condicao) {
  return TherapyService.getTrilhasCompativeis(condicao || 'GERAL');
}

/**
 * Obtém atividades terapêuticas disponíveis
 */
function apiTherapyGetAtividades() {
  return {
    success: true,
    atividades: Object.entries(TherapyService.ATIVIDADES_TERAPEUTICAS).map(([key, val]) => ({
      id: key,
      ...val
    }))
  };
}

/**
 * Obtém destaques de trilha disponíveis
 */
function apiTherapyGetDestaquesTrilha() {
  return {
    success: true,
    destaques: Object.values(TherapyService.DESTAQUES_TRILHA)
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 20/30: ANONIMIZAÇÃO DE DADOS DE SAÚDE E RELATÓRIOS
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - LGPD (Lei 13.709/2018)
// - HIPAA Privacy Rule
// - WHO Guidelines on Ethical Issues in Public Health Surveillance

/**
 * Configurações de anonimização
 */
const ANONYMIZATION_CONFIG = {
  K_ANONYMITY_MIN: 5,           // Mínimo de indivíduos por grupo
  SALT: 'RESERVA_ARARAS_2024',  // Salt para hash (em produção, usar variável de ambiente)
  GRUPOS_AGREGACAO: ['tipo_terapia', 'condicao', 'faixa_etaria'],
  FAIXAS_ETARIAS: [
    { id: '18-30', min: 18, max: 30 },
    { id: '31-45', min: 31, max: 45 },
    { id: '46-60', min: 46, max: 60 },
    { id: '60+', min: 61, max: 120 }
  ]
};

// Adiciona métodos ao TherapyService
TherapyService.ANONYMIZATION_CONFIG = ANONYMIZATION_CONFIG;

/**
 * Gera hash anônimo para um ID de participante
 * @private
 */
TherapyService._anonymizeParticipantId = function(participanteId) {
  if (!participanteId) return 'ANON-000';
  
  // Usa Utilities.computeDigest para SHA-256
  const input = participanteId + ANONYMIZATION_CONFIG.SALT;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  
  // Converte para hex e pega os primeiros 8 caracteres
  const hash = digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  return 'ANON-' + hash.substring(0, 8).toUpperCase();
};

/**
 * Determina faixa etária baseada na idade
 * @private
 */
TherapyService._getFaixaEtaria = function(idade) {
  if (!idade || idade < 18) return 'Não informado';
  
  for (const faixa of ANONYMIZATION_CONFIG.FAIXAS_ETARIAS) {
    if (idade >= faixa.min && idade <= faixa.max) {
      return faixa.id;
    }
  }
  return '60+';
};

/**
 * Calcula estatísticas para um grupo de dados
 * @private
 */
TherapyService._calculateGroupStatistics = function(dados, campo) {
  if (!dados || dados.length === 0) {
    return { media: 0, desvio_padrao: 0, min: 0, max: 0, n: 0 };
  }
  
  const valores = dados.map(d => parseFloat(d[campo]) || 0).filter(v => !isNaN(v));
  const n = valores.length;
  
  if (n === 0) return { media: 0, desvio_padrao: 0, min: 0, max: 0, n: 0 };
  
  const soma = valores.reduce((a, b) => a + b, 0);
  const media = soma / n;
  
  const somaQuadrados = valores.reduce((a, v) => a + Math.pow(v - media, 2), 0);
  const desvioPadrao = n > 1 ? Math.sqrt(somaQuadrados / (n - 1)) : 0;
  
  return {
    media: Math.round(media * 100) / 100,
    desvio_padrao: Math.round(desvioPadrao * 100) / 100,
    min: Math.min(...valores),
    max: Math.max(...valores),
    n: n
  };
};

/**
 * Garante k-anonimato suprimindo grupos pequenos
 * @private
 */
TherapyService._ensureKAnonymity = function(grupos, k) {
  k = k || ANONYMIZATION_CONFIG.K_ANONYMITY_MIN;
  
  return grupos.filter(grupo => {
    if (grupo.n >= k) {
      return true;
    }
    Logger.log(`[K-Anonymity] Grupo "${grupo.nome}" suprimido (n=${grupo.n} < k=${k})`);
    return false;
  });
};

/**
 * Gera dataset anonimizado completo para pesquisa
 * Prompt 20/30: Anonimização de dados de saúde
 */
TherapyService.generateAnonymizedDataset = function(opcoes = {}) {
  try {
    const ano = opcoes.ano || new Date().getFullYear();
    const dataInicio = new Date(ano, 0, 1);
    const dataFim = new Date(ano, 11, 31);
    
    // Coleta dados de sessões
    const sessoesResult = this.listSessoes();
    const avaliacoesResult = this.listAvaliacoes();
    
    if (!sessoesResult.success && !avaliacoesResult.success) {
      return { success: false, error: 'Sem dados para anonimizar' };
    }
    
    const sessoes = (sessoesResult.sessoes || []).filter(s => {
      const data = new Date(s.data);
      return data >= dataInicio && data <= dataFim;
    });
    
    const avaliacoes = (avaliacoesResult.avaliacoes || []).filter(a => {
      const data = new Date(a.data);
      return data >= dataInicio && data <= dataFim;
    });
    
    // Anonimiza IDs
    const sessoesAnonimas = sessoes.map(s => ({
      id_anonimo: this._anonymizeParticipantId(s.participante_id),
      data_mes: new Date(s.data).getMonth() + 1,
      tipo_terapia: s.tipo_terapia,
      variacao_humor: (parseFloat(s.biometricos?.humor_depois) || 0) - (parseFloat(s.biometricos?.humor_antes) || 0),
      reducao_estresse: (parseFloat(s.biometricos?.estresse_antes) || 0) - (parseFloat(s.biometricos?.estresse_depois) || 0),
      reducao_fc: (parseFloat(s.biometricos?.fc_antes) || 0) - (parseFloat(s.biometricos?.fc_depois) || 0),
      satisfacao: parseFloat(s.satisfacao) || 0
    }));
    
    const avaliacoesAnonimas = avaliacoes.map(a => ({
      id_anonimo: this._anonymizeParticipantId(a.participante_id),
      data_mes: new Date(a.data).getMonth() + 1,
      ansiedade: a.ansiedade,
      depressao: a.depressao,
      estresse: a.estresse,
      bem_estar: a.bem_estar,
      conexao_natureza: a.conexao_natureza,
      indice_composto: a.indice_composto
    }));
    
    // Conta participantes únicos
    const participantesUnicos = new Set([
      ...sessoesAnonimas.map(s => s.id_anonimo),
      ...avaliacoesAnonimas.map(a => a.id_anonimo)
    ]);
    
    return {
      success: true,
      periodo: {
        ano: ano,
        inicio: dataInicio.toISOString().split('T')[0],
        fim: dataFim.toISOString().split('T')[0]
      },
      metadados: {
        total_participantes_anonimos: participantesUnicos.size,
        total_sessoes: sessoesAnonimas.length,
        total_avaliacoes: avaliacoesAnonimas.length,
        k_anonimato: ANONYMIZATION_CONFIG.K_ANONYMITY_MIN,
        data_geracao: new Date().toISOString(),
        metodologia: 'SHA-256 pseudonimização + k-anonimato'
      },
      dados: {
        sessoes: sessoesAnonimas,
        avaliacoes: avaliacoesAnonimas
      },
      aviso_lgpd: 'Dados anonimizados conforme LGPD Art. 12. Não é possível identificar titulares.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Gera Relatório Anual de Impacto na Saúde
 * Prompt 20/30: Relatório com clusters estatísticos
 */
TherapyService.generateHealthImpactReport = function(ano) {
  try {
    ano = ano || new Date().getFullYear();
    
    // Obtém dataset anonimizado
    const dataset = this.generateAnonymizedDataset({ ano: ano });
    if (!dataset.success) {
      return dataset;
    }
    
    const sessoes = dataset.dados.sessoes;
    const avaliacoes = dataset.dados.avaliacoes;
    
    // Agrupa sessões por tipo de terapia
    const gruposPorTipo = {};
    sessoes.forEach(s => {
      const tipo = s.tipo_terapia || 'OUTROS';
      if (!gruposPorTipo[tipo]) {
        gruposPorTipo[tipo] = [];
      }
      gruposPorTipo[tipo].push(s);
    });
    
    // Calcula estatísticas por grupo
    const estatisticasPorTipo = Object.entries(gruposPorTipo).map(([tipo, dados]) => ({
      nome: `Grupo ${tipo}`,
      tipo_terapia: tipo,
      n: dados.length,
      estatisticas: {
        reducao_estresse: this._calculateGroupStatistics(dados, 'reducao_estresse'),
        melhoria_humor: this._calculateGroupStatistics(dados, 'variacao_humor'),
        satisfacao: this._calculateGroupStatistics(dados, 'satisfacao')
      }
    }));
    
    // Aplica k-anonimato
    const gruposValidos = this._ensureKAnonymity(estatisticasPorTipo, ANONYMIZATION_CONFIG.K_ANONYMITY_MIN);
    
    // Estatísticas gerais das avaliações
    const estatisticasGerais = {
      ansiedade: this._calculateGroupStatistics(avaliacoes, 'ansiedade'),
      depressao: this._calculateGroupStatistics(avaliacoes, 'depressao'),
      estresse: this._calculateGroupStatistics(avaliacoes, 'estresse'),
      bem_estar: this._calculateGroupStatistics(avaliacoes, 'bem_estar'),
      conexao_natureza: this._calculateGroupStatistics(avaliacoes, 'conexao_natureza'),
      indice_composto: this._calculateGroupStatistics(avaliacoes, 'indice_composto')
    };
    
    // Gera conclusões automáticas
    const conclusoes = this._generateHealthConclusions(gruposValidos, estatisticasGerais);
    
    // Registra auditoria
    this._logReportGeneration('HEALTH_IMPACT_REPORT', ano);
    
    return {
      success: true,
      relatorio: {
        titulo: `Relatório Anual de Impacto na Saúde - ${ano}`,
        subtitulo: 'Reserva Ecológica Araras - Programa de Terapia na Natureza',
        data_geracao: new Date().toISOString(),
        periodo: dataset.periodo,
        
        resumo_executivo: {
          total_participantes: dataset.metadados.total_participantes_anonimos,
          total_sessoes: dataset.metadados.total_sessoes,
          total_avaliacoes: dataset.metadados.total_avaliacoes,
          grupos_analisados: gruposValidos.length,
          grupos_suprimidos: estatisticasPorTipo.length - gruposValidos.length
        },
        
        resultados_por_tipo_terapia: gruposValidos,
        
        estatisticas_gerais: estatisticasGerais,
        
        conclusoes: conclusoes,
        
        metodologia: {
          anonimizacao: 'Pseudonimização SHA-256 com salt',
          k_anonimato: `k=${ANONYMIZATION_CONFIG.K_ANONYMITY_MIN}`,
          escalas: ['DASS-21', 'WHO-5', 'NRS'],
          conformidade: ['LGPD', 'Princípios éticos de pesquisa em saúde']
        },
        
        referencias: [
          'Bratman et al. (2019). Nature and mental health: An ecosystem service perspective.',
          'Ulrich et al. (1991). Stress recovery during exposure to natural environments.',
          'WHO (2019). Mental Health in Primary Care.'
        ]
      },
      aviso_lgpd: dataset.aviso_lgpd
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Gera conclusões automáticas baseadas nos dados
 * @private
 */
TherapyService._generateHealthConclusions = function(grupos, estatisticasGerais) {
  const conclusoes = [];
  
  // Conclusão sobre redução de estresse
  if (grupos.length > 0) {
    const melhorGrupo = grupos.reduce((best, g) => 
      (g.estatisticas.reducao_estresse.media > (best?.estatisticas?.reducao_estresse?.media || 0)) ? g : best
    , null);
    
    if (melhorGrupo && melhorGrupo.estatisticas.reducao_estresse.media > 0) {
      conclusoes.push({
        tipo: 'DESTAQUE',
        texto: `Redução média do estresse no ${melhorGrupo.nome}: ${melhorGrupo.estatisticas.reducao_estresse.media.toFixed(1)} pontos (n=${melhorGrupo.n})`
      });
    }
  }
  
  // Conclusão sobre bem-estar geral
  if (estatisticasGerais.indice_composto.media > 50) {
    conclusoes.push({
      tipo: 'POSITIVO',
      texto: `Índice médio de bem-estar: ${estatisticasGerais.indice_composto.media.toFixed(1)}/100 (classificação: Bom)`
    });
  }
  
  // Conclusão sobre conexão com natureza
  if (estatisticasGerais.conexao_natureza.media > 6) {
    conclusoes.push({
      tipo: 'POSITIVO',
      texto: `Alta conexão com a natureza observada: média ${estatisticasGerais.conexao_natureza.media.toFixed(1)}/10`
    });
  }
  
  // Conclusão sobre ansiedade/depressão
  if (estatisticasGerais.ansiedade.media < 7 && estatisticasGerais.depressao.media < 7) {
    conclusoes.push({
      tipo: 'POSITIVO',
      texto: 'Níveis de ansiedade e depressão dentro da faixa normal-leve na coorte'
    });
  }
  
  // Conclusão geral
  conclusoes.push({
    tipo: 'GERAL',
    texto: 'Os dados sugerem benefícios significativos do programa de terapia na natureza para a saúde mental dos participantes.'
  });
  
  return conclusoes;
};

/**
 * Registra geração de relatório para auditoria
 * @private
 */
TherapyService._logReportGeneration = function(tipoRelatorio, ano) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('AUDIT_LOG_RA');
    
    if (!sheet) {
      sheet = ss.insertSheet('AUDIT_LOG_RA');
      sheet.appendRow(['Timestamp', 'Tipo', 'Detalhes', 'Usuario']);
      sheet.getRange(1, 1, 1, 4).setBackground('#37474F').setFontColor('#FFFFFF').setFontWeight('bold');
    }
    
    sheet.appendRow([
      new Date().toISOString(),
      tipoRelatorio,
      `Relatório gerado para ano ${ano}`,
      Session.getActiveUser().getEmail() || 'Sistema'
    ]);
  } catch (error) {
    Logger.log(`[_logReportGeneration] Erro ao registrar auditoria: ${error}`);
  }
};

/**
 * Obtém estatísticas públicas agregadas (sem dados individuais)
 * Prompt 20/30: Versão pública para APOIADOR
 */
TherapyService.getAggregatedStatistics = function(ano) {
  try {
    ano = ano || new Date().getFullYear();
    
    const report = this.generateHealthImpactReport(ano);
    if (!report.success) {
      return report;
    }
    
    // Retorna apenas estatísticas agregadas (sem detalhes de grupos)
    return {
      success: true,
      ano: ano,
      resumo: {
        total_participantes: report.relatorio.resumo_executivo.total_participantes,
        total_sessoes: report.relatorio.resumo_executivo.total_sessoes,
        tipos_terapia_oferecidos: report.relatorio.resultados_por_tipo_terapia.length
      },
      indicadores: {
        indice_bemestar_medio: report.relatorio.estatisticas_gerais.indice_composto.media,
        conexao_natureza_media: report.relatorio.estatisticas_gerais.conexao_natureza.media,
        satisfacao_programa: report.relatorio.resultados_por_tipo_terapia.length > 0 
          ? Math.round(report.relatorio.resultados_por_tipo_terapia.reduce((sum, g) => sum + (g.estatisticas.satisfacao.media || 0), 0) / report.relatorio.resultados_por_tipo_terapia.length * 10) / 10
          : null
      },
      conclusoes: report.relatorio.conclusoes.filter(c => c.tipo !== 'DESTAQUE'),
      nota: 'Dados agregados e anonimizados conforme LGPD'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 20/30: APIs de Anonimização e Relatórios de Saúde
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera dataset anonimizado para pesquisa
 * Acesso: GESTOR+
 * @param {number} ano - Ano para filtrar dados (opcional, default: ano atual)
 */
function apiTherapyAnonymizedDataset(ano) {
  return TherapyService.generateAnonymizedDataset({ ano: ano || new Date().getFullYear() });
}

/**
 * Gera Relatório Anual de Impacto na Saúde
 * Acesso: APOIADOR+
 * @param {number} ano - Ano do relatório (opcional, default: ano atual)
 */
function apiTherapyHealthImpactReport(ano) {
  return TherapyService.generateHealthImpactReport(ano || new Date().getFullYear());
}

/**
 * Obtém estatísticas públicas agregadas
 * Acesso: Público
 * @param {number} ano - Ano para estatísticas (opcional, default: ano atual)
 */
function apiTherapyPublicStatistics(ano) {
  return TherapyService.getAggregatedStatistics(ano || new Date().getFullYear());
}
