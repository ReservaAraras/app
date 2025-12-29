/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE SENTIMENTO DE VISITANTES
 * ═══════════════════════════════════════════════════════════════════════════
 * P14 - Sistema de NLP para Análise de Feedback de Visitantes
 * 
 * Funcionalidades:
 * - Análise de sentimento com NLP/Gemini AI
 * - Extração de emoções e temas
 * - Cálculo de NPS (Net Promoter Score)
 * - Identificação de entidades (locais, espécies)
 * - Recomendações automáticas de melhoria
 * - Alertas para feedback urgente
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha FEEDBACK_VISITANTES_RA
 */
const SCHEMA_FEEDBACK_VISITANTES = {
  ID_Feedback: { type: 'string', required: true, unique: true },
  Timestamp: { type: 'datetime', required: true },
  ID_Visitante: { type: 'string' },
  Nome_Visitante: { type: 'string' },
  Tipo_Visita: { type: 'enum', values: ['Trilha', 'Workshop', 'Voluntariado', 'Evento', 'Educativo', 'Pesquisa'] },
  Comentario: { type: 'text', required: true },
  Avaliacao_Geral: { type: 'integer', range: [1, 5] },
  Sentimento: { type: 'enum', values: ['Muito_Positivo', 'Positivo', 'Neutro', 'Negativo', 'Muito_Negativo'] },
  Score_Sentimento: { type: 'float', range: [-1, 1] },
  Emocoes_JSON: { type: 'text' },
  Temas_JSON: { type: 'text' },
  Aspectos_Positivos_JSON: { type: 'text' },
  Aspectos_Negativos_JSON: { type: 'text' },
  Sugestoes_JSON: { type: 'text' },
  Entidades_JSON: { type: 'text' },
  Prioridade_Resposta: { type: 'enum', values: ['Urgente', 'Alta', 'Media', 'Baixa'] },
  Requer_Acao: { type: 'boolean' },
  Status_Resposta: { type: 'enum', values: ['Pendente', 'Em_Analise', 'Respondido', 'Arquivado'] }
};

const FEEDBACK_HEADERS = [
  'ID_Feedback', 'Timestamp', 'ID_Visitante', 'Nome_Visitante', 'Tipo_Visita',
  'Comentario', 'Avaliacao_Geral', 'Sentimento', 'Score_Sentimento', 'Emocoes_JSON',
  'Temas_JSON', 'Aspectos_Positivos_JSON', 'Aspectos_Negativos_JSON', 'Sugestoes_JSON',
  'Entidades_JSON', 'Prioridade_Resposta', 'Requer_Acao', 'Status_Resposta'
];


/**
 * Analisador de Sentimento
 * @namespace SentimentAnalyzer
 */
const SentimentAnalyzer = {
  
  SHEET_NAME: 'FEEDBACK_VISITANTES_RA',
  
  /**
   * Palavras-chave para análise de temas
   */
  THEME_KEYWORDS: {
    infraestrutura: ['trilha', 'banheiro', 'estacionamento', 'sinalização', 'acesso', 'estrutura', 'banco', 'lixeira'],
    atendimento: ['guia', 'monitor', 'atendimento', 'recepção', 'funcionário', 'equipe', 'staff', 'acolhimento'],
    natureza: ['biodiversidade', 'animais', 'plantas', 'paisagem', 'floresta', 'mata', 'natureza', 'verde'],
    atividades: ['trilha', 'workshop', 'observação', 'fotografia', 'caminhada', 'passeio', 'atividade'],
    educacao: ['aprendizado', 'conhecimento', 'educativo', 'informação', 'explicação', 'palestra', 'aula'],
    alimentacao: ['comida', 'lanche', 'água', 'restaurante', 'café', 'alimentação'],
    seguranca: ['seguro', 'segurança', 'perigoso', 'risco', 'cuidado', 'proteção']
  },
  
  /**
   * Palavras indicadoras de sentimento
   */
  SENTIMENT_WORDS: {
    muito_positivo: ['incrível', 'maravilhoso', 'excepcional', 'fantástico', 'perfeito', 'espetacular', 'inesquecível', 'sensacional'],
    positivo: ['bom', 'ótimo', 'legal', 'gostei', 'adorei', 'bonito', 'agradável', 'recomendo', 'excelente', 'lindo'],
    negativo: ['ruim', 'péssimo', 'horrível', 'decepcionante', 'problema', 'falta', 'difícil', 'caro', 'demorado'],
    muito_negativo: ['terrível', 'desastroso', 'nunca mais', 'pior', 'absurdo', 'vergonha', 'inaceitável']
  },
  
  /**
   * Locais conhecidos na reserva
   */
  KNOWN_LOCATIONS: [
    'Trilha da Nascente', 'Trilha do Mirante', 'SAF Norte', 'SAF Sul', 'Viveiro',
    'Centro de Visitantes', 'Área de Camping', 'Lago', 'Cachoeira', 'Mirante',
    'Vereda do Buriti', 'Mata Ciliar', 'Cerrado', 'Sede'
  ],
  
  /**
   * Espécies conhecidas
   */
  KNOWN_SPECIES: [
    'Arara', 'Tucano', 'Lobo-guará', 'Tamanduá', 'Tatu', 'Capivara', 'Macaco',
    'Pequi', 'Buriti', 'Jatobá', 'Ipê', 'Baru', 'Mangaba', 'Cagaita',
    'Orquídea', 'Bromélia', 'Palmeira', 'Bugio', 'Seriema', 'Ema'
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
        sheet.appendRow(FEEDBACK_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length);
        headerRange.setBackground('#7B1FA2');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        Logger.log(`[SentimentAnalyzer] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[SentimentAnalyzer] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa feedback completo
   * @param {object} feedbackData - {comentario, avaliacao, tipo_visita, nome_visitante}
   */
  analyzeFeedback: function(feedbackData) {
    try {
      this.initializeSheet();
      
      const comentario = feedbackData.comentario || '';
      const avaliacao = feedbackData.avaliacao || 3;
      
      // 1. Análise de sentimento
      const sentiment = this._analyzeSentiment(comentario, avaliacao);
      
      // 2. Extração de emoções
      const emotions = this._extractEmotions(comentario);
      
      // 3. Identificação de temas
      const themes = this._identifyThemes(comentario);
      
      // 4. Extração de aspectos positivos/negativos
      const aspects = this._extractAspects(comentario, sentiment.score);
      
      // 5. Extração de sugestões
      const suggestions = this._extractSuggestions(comentario);
      
      // 6. Extração de entidades
      const entities = this._extractEntities(comentario);
      
      // 7. Classificação de prioridade
      const priority = this._classifyPriority(sentiment, themes, avaliacao);
      
      // 8. Gera ID e salva
      const feedbackId = `FBK-${Date.now()}`;
      
      const analysis = {
        id: feedbackId,
        timestamp: new Date().toISOString(),
        visitante_id: feedbackData.visitante_id || '',
        nome_visitante: feedbackData.nome_visitante || 'Anônimo',
        tipo_visita: feedbackData.tipo_visita || 'Trilha',
        comentario: comentario,
        avaliacao: avaliacao,
        sentimento: sentiment.label,
        score_sentimento: sentiment.score,
        emocoes: emotions,
        temas: themes,
        aspectos_positivos: aspects.positivos,
        aspectos_negativos: aspects.negativos,
        sugestoes: suggestions,
        entidades: entities,
        prioridade: priority.nivel,
        requer_acao: priority.requer_acao,
        status: 'Pendente'
      };
      
      // Salva na planilha
      this._saveFeedback(analysis);
      
      return {
        success: true,
        feedback_id: feedbackId,
        analysis: analysis,
        summary: this._generateFeedbackSummary(analysis)
      };
      
    } catch (error) {
      Logger.log(`[analyzeFeedback] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa sentimento do texto
   * @private
   */
  _analyzeSentiment: function(text, rating) {
    const lowerText = text.toLowerCase();
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Conta palavras positivas
    this.SENTIMENT_WORDS.muito_positivo.forEach(word => {
      if (lowerText.includes(word)) {
        positiveCount += 2;
        score += 0.3;
      }
    });
    
    this.SENTIMENT_WORDS.positivo.forEach(word => {
      if (lowerText.includes(word)) {
        positiveCount += 1;
        score += 0.15;
      }
    });
    
    // Conta palavras negativas
    this.SENTIMENT_WORDS.negativo.forEach(word => {
      if (lowerText.includes(word)) {
        negativeCount += 1;
        score -= 0.2;
      }
    });
    
    this.SENTIMENT_WORDS.muito_negativo.forEach(word => {
      if (lowerText.includes(word)) {
        negativeCount += 2;
        score -= 0.35;
      }
    });
    
    // Ajusta pelo rating (1-5)
    const ratingFactor = (rating - 3) * 0.2; // -0.4 a +0.4
    score += ratingFactor;
    
    // Normaliza score entre -1 e 1
    score = Math.max(-1, Math.min(1, score));
    
    // Determina label
    let label;
    if (score >= 0.5) label = 'Muito_Positivo';
    else if (score >= 0.15) label = 'Positivo';
    else if (score >= -0.15) label = 'Neutro';
    else if (score >= -0.5) label = 'Negativo';
    else label = 'Muito_Negativo';
    
    return {
      score: parseFloat(score.toFixed(3)),
      label: label,
      positive_words: positiveCount,
      negative_words: negativeCount,
      confidence: Math.min(0.95, 0.5 + (positiveCount + negativeCount) * 0.1)
    };
  },

  /**
   * Extrai emoções do texto
   * @private
   */
  _extractEmotions: function(text) {
    const lowerText = text.toLowerCase();
    const emotions = [];
    
    const emotionPatterns = {
      'Alegria': ['feliz', 'alegre', 'contente', 'animado', 'empolgado', 'adorei', 'amei', 'maravilhoso'],
      'Admiração': ['impressionante', 'incrível', 'lindo', 'bonito', 'espetacular', 'admirável', 'surpreendente'],
      'Gratidão': ['agradeço', 'obrigado', 'grato', 'gratidão', 'reconhecido'],
      'Tranquilidade': ['paz', 'calmo', 'tranquilo', 'relaxante', 'sereno', 'harmonioso'],
      'Curiosidade': ['interessante', 'curioso', 'aprender', 'descobrir', 'conhecer'],
      'Frustração': ['frustrado', 'irritado', 'chateado', 'decepcionado', 'insatisfeito'],
      'Preocupação': ['preocupado', 'preocupante', 'cuidado', 'atenção', 'problema'],
      'Desapontamento': ['esperava mais', 'decepção', 'não gostei', 'poderia ser melhor']
    };
    
    Object.entries(emotionPatterns).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(kw => lowerText.includes(kw));
      if (matches.length > 0) {
        emotions.push({
          emocao: emotion,
          intensidade: Math.min(1, matches.length * 0.4),
          palavras_chave: matches
        });
      }
    });
    
    return emotions.sort((a, b) => b.intensidade - a.intensidade);
  },

  /**
   * Identifica temas no texto
   * @private
   */
  _identifyThemes: function(text) {
    const lowerText = text.toLowerCase();
    const themes = [];
    
    Object.entries(this.THEME_KEYWORDS).forEach(([theme, keywords]) => {
      const matches = keywords.filter(kw => lowerText.includes(kw));
      if (matches.length > 0) {
        themes.push({
          tema: theme,
          relevancia: parseFloat((matches.length / keywords.length).toFixed(2)),
          palavras_encontradas: matches
        });
      }
    });
    
    return themes.sort((a, b) => b.relevancia - a.relevancia);
  },

  /**
   * Extrai aspectos positivos e negativos
   * @private
   */
  _extractAspects: function(text, sentimentScore) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const positivos = [];
    const negativos = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase().trim();
      
      // Verifica se é positivo
      const hasPositive = this.SENTIMENT_WORDS.positivo.some(w => lowerSentence.includes(w)) ||
                          this.SENTIMENT_WORDS.muito_positivo.some(w => lowerSentence.includes(w));
      
      // Verifica se é negativo
      const hasNegative = this.SENTIMENT_WORDS.negativo.some(w => lowerSentence.includes(w)) ||
                          this.SENTIMENT_WORDS.muito_negativo.some(w => lowerSentence.includes(w)) ||
                          lowerSentence.includes('mas ') || lowerSentence.includes('porém') ||
                          lowerSentence.includes('falta') || lowerSentence.includes('poderia');
      
      if (hasPositive && !hasNegative) {
        positivos.push(sentence.trim());
      } else if (hasNegative) {
        negativos.push(sentence.trim());
      }
    });
    
    return { positivos, negativos };
  },

  /**
   * Extrai sugestões do texto
   * @private
   */
  _extractSuggestions: function(text) {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    
    // Padrões de sugestão
    const suggestionPatterns = [
      /sugiro\s+(.+?)(?:\.|$)/gi,
      /poderia[m]?\s+(.+?)(?:\.|$)/gi,
      /seria\s+bom\s+(.+?)(?:\.|$)/gi,
      /falta[m]?\s+(.+?)(?:\.|$)/gi,
      /precisa[m]?\s+de\s+(.+?)(?:\.|$)/gi,
      /deveria[m]?\s+(.+?)(?:\.|$)/gi,
      /recomendo\s+(.+?)(?:\.|$)/gi
    ];
    
    suggestionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 5) {
          suggestions.push(match[1].trim());
        }
      }
    });
    
    return [...new Set(suggestions)]; // Remove duplicatas
  },

  /**
   * Extrai entidades (locais, espécies)
   * @private
   */
  _extractEntities: function(text) {
    const lowerText = text.toLowerCase();
    const entities = {
      locais: [],
      especies: [],
      atividades: []
    };
    
    // Busca locais
    this.KNOWN_LOCATIONS.forEach(loc => {
      if (lowerText.includes(loc.toLowerCase())) {
        entities.locais.push(loc);
      }
    });
    
    // Busca espécies
    this.KNOWN_SPECIES.forEach(sp => {
      if (lowerText.includes(sp.toLowerCase())) {
        entities.especies.push(sp);
      }
    });
    
    // Busca atividades
    const activities = ['trilha', 'caminhada', 'observação de aves', 'fotografia', 'workshop', 'plantio'];
    activities.forEach(act => {
      if (lowerText.includes(act)) {
        entities.atividades.push(act);
      }
    });
    
    return entities;
  },

  /**
   * Classifica prioridade de resposta
   * @private
   */
  _classifyPriority: function(sentiment, themes, rating) {
    let nivel = 'Baixa';
    let requer_acao = false;
    
    // Urgente: sentimento muito negativo ou rating 1
    if (sentiment.label === 'Muito_Negativo' || rating === 1) {
      nivel = 'Urgente';
      requer_acao = true;
    }
    // Alta: sentimento negativo ou rating 2
    else if (sentiment.label === 'Negativo' || rating === 2) {
      nivel = 'Alta';
      requer_acao = true;
    }
    // Média: neutro com temas de infraestrutura/segurança
    else if (sentiment.label === 'Neutro') {
      const criticalThemes = themes.filter(t => 
        t.tema === 'infraestrutura' || t.tema === 'seguranca'
      );
      if (criticalThemes.length > 0) {
        nivel = 'Media';
        requer_acao = true;
      }
    }
    
    return { nivel, requer_acao };
  },

  /**
   * Salva feedback na planilha
   * @private
   */
  _saveFeedback: function(analysis) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        analysis.id,
        analysis.timestamp,
        analysis.visitante_id,
        analysis.nome_visitante,
        analysis.tipo_visita,
        analysis.comentario,
        analysis.avaliacao,
        analysis.sentimento,
        analysis.score_sentimento,
        JSON.stringify(analysis.emocoes),
        JSON.stringify(analysis.temas),
        JSON.stringify(analysis.aspectos_positivos),
        JSON.stringify(analysis.aspectos_negativos),
        JSON.stringify(analysis.sugestoes),
        JSON.stringify(analysis.entidades),
        analysis.prioridade,
        analysis.requer_acao,
        analysis.status
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (error) {
      Logger.log(`[_saveFeedback] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Gera resumo do feedback
   * @private
   */
  _generateFeedbackSummary: function(analysis) {
    const sentimentEmoji = {
      'Muito_Positivo': '😍',
      'Positivo': '😊',
      'Neutro': '😐',
      'Negativo': '😕',
      'Muito_Negativo': '😞'
    };
    
    return {
      emoji: sentimentEmoji[analysis.sentimento] || '😐',
      sentimento: analysis.sentimento.replace('_', ' '),
      avaliacao: `${analysis.avaliacao}/5 ⭐`,
      principais_temas: analysis.temas.slice(0, 3).map(t => t.tema),
      emocao_principal: analysis.emocoes[0]?.emocao || 'Não identificada',
      requer_atencao: analysis.requer_acao,
      prioridade: analysis.prioridade
    };
  },

  /**
   * Analisa feedback com IA (Gemini)
   */
  analyzeWithAI: function(feedbackId) {
    try {
      const feedback = this.getFeedback(feedbackId);
      if (!feedback.success) return feedback;
      
      const prompt = `
Você é um especialista em análise de experiência do cliente e NLP.

**FEEDBACK DO VISITANTE:**
Comentário: "${feedback.data.comentario}"
Avaliação: ${feedback.data.avaliacao}/5 estrelas
Tipo de visita: ${feedback.data.tipo_visita}

**ANÁLISE REQUERIDA:**
1. Analise o sentimento geral (score de -1 a +1)
2. Identifique as emoções presentes
3. Liste os aspectos positivos mencionados
4. Liste os aspectos negativos ou problemas
5. Extraia sugestões de melhoria
6. Classifique a prioridade de resposta
7. Sugira uma resposta apropriada

Responda em JSON:
{
  "sentimento_score": 0.7,
  "sentimento_label": "Positivo",
  "emocoes": [{"emocao": "Alegria", "intensidade": 0.8}],
  "aspectos_positivos": ["aspecto 1", "aspecto 2"],
  "aspectos_negativos": ["problema 1"],
  "sugestoes_extraidas": ["sugestão 1"],
  "prioridade": "Baixa",
  "resposta_sugerida": "Texto da resposta..."
}`;

      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      let aiAnalysis = null;
      if (response && response.candidates && response.candidates[0]) {
        const text = response.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        }
      }
      
      return {
        success: true,
        feedback_id: feedbackId,
        ai_analysis: aiAnalysis
      };
      
    } catch (error) {
      Logger.log(`[analyzeWithAI] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém feedback por ID
   */
  getFeedback: function(feedbackId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Nenhum feedback encontrado' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('ID_Feedback')] === feedbackId) {
          const row = data[i];
          return {
            success: true,
            data: {
              id: row[headers.indexOf('ID_Feedback')],
              timestamp: row[headers.indexOf('Timestamp')],
              nome_visitante: row[headers.indexOf('Nome_Visitante')],
              tipo_visita: row[headers.indexOf('Tipo_Visita')],
              comentario: row[headers.indexOf('Comentario')],
              avaliacao: row[headers.indexOf('Avaliacao_Geral')],
              sentimento: row[headers.indexOf('Sentimento')],
              score_sentimento: row[headers.indexOf('Score_Sentimento')],
              emocoes: this._safeParseJSON(row[headers.indexOf('Emocoes_JSON')]),
              temas: this._safeParseJSON(row[headers.indexOf('Temas_JSON')]),
              prioridade: row[headers.indexOf('Prioridade_Resposta')],
              status: row[headers.indexOf('Status_Resposta')]
            }
          };
        }
      }
      
      return { success: false, error: 'Feedback não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório de insights
   */
  generateInsightsReport: function(periodo = 30) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, message: 'Nenhum feedback para analisar', feedbacks: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const cutoffDate = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000);
      
      // Filtra feedbacks do período
      const feedbacks = [];
      for (let i = 1; i < data.length; i++) {
        const timestamp = new Date(data[i][headers.indexOf('Timestamp')]);
        if (timestamp >= cutoffDate) {
          feedbacks.push({
            avaliacao: data[i][headers.indexOf('Avaliacao_Geral')],
            sentimento: data[i][headers.indexOf('Sentimento')],
            score: data[i][headers.indexOf('Score_Sentimento')],
            temas: this._safeParseJSON(data[i][headers.indexOf('Temas_JSON')]) || [],
            aspectos_positivos: this._safeParseJSON(data[i][headers.indexOf('Aspectos_Positivos_JSON')]) || [],
            aspectos_negativos: this._safeParseJSON(data[i][headers.indexOf('Aspectos_Negativos_JSON')]) || []
          });
        }
      }
      
      if (feedbacks.length === 0) {
        return { success: true, message: 'Nenhum feedback no período', feedbacks: 0 };
      }
      
      // Calcula métricas
      const avgRating = feedbacks.reduce((sum, f) => sum + (f.avaliacao || 0), 0) / feedbacks.length;
      const avgSentiment = feedbacks.reduce((sum, f) => sum + (f.score || 0), 0) / feedbacks.length;
      
      // Distribuição de sentimentos
      const sentimentDist = {
        muito_positivo: feedbacks.filter(f => f.sentimento === 'Muito_Positivo').length,
        positivo: feedbacks.filter(f => f.sentimento === 'Positivo').length,
        neutro: feedbacks.filter(f => f.sentimento === 'Neutro').length,
        negativo: feedbacks.filter(f => f.sentimento === 'Negativo').length,
        muito_negativo: feedbacks.filter(f => f.sentimento === 'Muito_Negativo').length
      };
      
      // Calcula NPS
      const nps = this._calculateNPS(feedbacks);
      
      // Temas mais frequentes
      const themeCount = {};
      feedbacks.forEach(f => {
        f.temas.forEach(t => {
          themeCount[t.tema] = (themeCount[t.tema] || 0) + 1;
        });
      });
      const topThemes = Object.entries(themeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tema, count]) => ({ tema, count, percent: Math.round(count / feedbacks.length * 100) }));
      
      // Gera recomendações
      const recommendations = this._generateRecommendations(sentimentDist, topThemes, nps, avgRating);
      
      return {
        success: true,
        periodo_dias: periodo,
        total_feedbacks: feedbacks.length,
        metricas: {
          avaliacao_media: parseFloat(avgRating.toFixed(2)),
          sentimento_medio: parseFloat(avgSentiment.toFixed(3)),
          nps: nps
        },
        distribuicao_sentimentos: sentimentDist,
        temas_principais: topThemes,
        recomendacoes: recommendations,
        alertas: this._generateAlerts(sentimentDist, nps)
      };
      
    } catch (error) {
      Logger.log(`[generateInsightsReport] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula NPS (Net Promoter Score)
   * @private
   */
  _calculateNPS: function(feedbacks) {
    const ratings = feedbacks.map(f => f.avaliacao).filter(r => r > 0);
    
    if (ratings.length === 0) {
      return { score: 0, classification: 'Sem dados' };
    }
    
    const promoters = ratings.filter(r => r >= 5).length;
    const passives = ratings.filter(r => r === 4).length;
    const detractors = ratings.filter(r => r <= 3).length;
    const total = ratings.length;
    
    const npsScore = Math.round(((promoters - detractors) / total) * 100);
    
    let classification;
    if (npsScore >= 75) classification = 'Excelente';
    else if (npsScore >= 50) classification = 'Muito Bom';
    else if (npsScore >= 0) classification = 'Bom';
    else if (npsScore >= -50) classification = 'Precisa Melhorar';
    else classification = 'Crítico';
    
    return {
      score: npsScore,
      classification: classification,
      promoters: promoters,
      passives: passives,
      detractors: detractors,
      total: total
    };
  },

  /**
   * Gera recomendações baseadas na análise
   * @private
   */
  _generateRecommendations: function(sentimentDist, topThemes, nps, avgRating) {
    const recommendations = [];
    
    // Recomendação baseada em NPS
    if (nps.score < 50) {
      recommendations.push({
        prioridade: 'Alta',
        categoria: 'Experiência Geral',
        problema: `NPS de ${nps.score} está abaixo do ideal (50+)`,
        acao: 'Implementar programa de melhoria da experiência do visitante',
        impacto_esperado: 'Aumento de 20-30 pontos no NPS em 3 meses'
      });
    }
    
    // Recomendação baseada em avaliação média
    if (avgRating < 4.0) {
      recommendations.push({
        prioridade: 'Alta',
        categoria: 'Satisfação',
        problema: `Avaliação média de ${avgRating.toFixed(1)} está abaixo de 4.0`,
        acao: 'Identificar e resolver principais pontos de insatisfação',
        impacto_esperado: 'Aumento de 0.5 pontos na avaliação média'
      });
    }
    
    // Recomendação baseada em sentimentos negativos
    const totalNegative = sentimentDist.negativo + sentimentDist.muito_negativo;
    const total = Object.values(sentimentDist).reduce((a, b) => a + b, 0);
    if (total > 0 && (totalNegative / total) > 0.2) {
      recommendations.push({
        prioridade: 'Alta',
        categoria: 'Sentimento',
        problema: `${Math.round(totalNegative / total * 100)}% dos feedbacks são negativos`,
        acao: 'Analisar feedbacks negativos e criar plano de ação específico',
        impacto_esperado: 'Redução de 50% nos feedbacks negativos'
      });
    }
    
    // Recomendações baseadas em temas
    topThemes.forEach(theme => {
      if (theme.tema === 'infraestrutura' && theme.percent > 30) {
        recommendations.push({
          prioridade: 'Media',
          categoria: 'Infraestrutura',
          problema: `${theme.percent}% dos feedbacks mencionam infraestrutura`,
          acao: 'Avaliar e melhorar sinalização, banheiros e acessos',
          impacto_esperado: 'Melhoria na percepção de qualidade'
        });
      }
      
      if (theme.tema === 'atendimento' && theme.percent > 25) {
        recommendations.push({
          prioridade: 'Media',
          categoria: 'Atendimento',
          problema: `${theme.percent}% dos feedbacks mencionam atendimento`,
          acao: 'Capacitar equipe e padronizar protocolos de atendimento',
          impacto_esperado: 'Aumento na satisfação com atendimento'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const order = { 'Alta': 3, 'Media': 2, 'Baixa': 1 };
      return order[b.prioridade] - order[a.prioridade];
    });
  },

  /**
   * Gera alertas
   * @private
   */
  _generateAlerts: function(sentimentDist, nps) {
    const alerts = [];
    
    if (sentimentDist.muito_negativo > 0) {
      alerts.push({
        tipo: 'Urgente',
        mensagem: `${sentimentDist.muito_negativo} feedback(s) muito negativo(s) requer(em) atenção imediata`,
        acao: 'Revisar e responder feedbacks urgentes'
      });
    }
    
    if (nps.score < 0) {
      alerts.push({
        tipo: 'Critico',
        mensagem: `NPS negativo (${nps.score}) indica problemas sérios de satisfação`,
        acao: 'Reunião de emergência para plano de ação'
      });
    }
    
    if (nps.detractors > nps.promoters) {
      alerts.push({
        tipo: 'Atencao',
        mensagem: 'Mais detratores que promotores no período',
        acao: 'Analisar causas de insatisfação'
      });
    }
    
    return alerts;
  },

  /**
   * Lista feedbacks com filtros
   */
  listFeedbacks: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, feedbacks: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      let feedbacks = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        feedbacks.push({
          id: row[headers.indexOf('ID_Feedback')],
          timestamp: row[headers.indexOf('Timestamp')],
          nome: row[headers.indexOf('Nome_Visitante')],
          tipo_visita: row[headers.indexOf('Tipo_Visita')],
          comentario: row[headers.indexOf('Comentario')],
          avaliacao: row[headers.indexOf('Avaliacao_Geral')],
          sentimento: row[headers.indexOf('Sentimento')],
          prioridade: row[headers.indexOf('Prioridade_Resposta')],
          status: row[headers.indexOf('Status_Resposta')]
        });
      }
      
      // Aplica filtros
      if (filtros.sentimento) {
        feedbacks = feedbacks.filter(f => f.sentimento === filtros.sentimento);
      }
      if (filtros.prioridade) {
        feedbacks = feedbacks.filter(f => f.prioridade === filtros.prioridade);
      }
      if (filtros.status) {
        feedbacks = feedbacks.filter(f => f.status === filtros.status);
      }
      if (filtros.limite) {
        feedbacks = feedbacks.slice(0, filtros.limite);
      }
      
      // Ordena por timestamp (mais recente primeiro)
      feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return { success: true, feedbacks: feedbacks, count: feedbacks.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status do feedback
   */
  updateFeedbackStatus: function(feedbackId, newStatus) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('ID_Feedback');
      const statusIndex = headers.indexOf('Status_Resposta');
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === feedbackId) {
          sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
          return { success: true, feedback_id: feedbackId, new_status: newStatus };
        }
      }
      
      return { success: false, error: 'Feedback não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém feedbacks urgentes
   */
  getUrgentFeedbacks: function() {
    return this.listFeedbacks({ prioridade: 'Urgente', status: 'Pendente' });
  },

  /**
   * Parse JSON seguro
   * @private
   */
  _safeParseJSON: function(str) {
    try {
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Análise de Sentimento
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de análise de sentimento
 */
function apiFeedbackInit() {
  return SentimentAnalyzer.initializeSheet();
}

/**
 * Analisa novo feedback
 * @param {object} feedbackData - {comentario, avaliacao, tipo_visita, nome_visitante}
 */
function apiFeedbackAnalisar(feedbackData) {
  return SentimentAnalyzer.analyzeFeedback(feedbackData || {});
}

/**
 * Obtém feedback por ID
 * @param {string} feedbackId - ID do feedback
 */
function apiFeedbackObter(feedbackId) {
  return SentimentAnalyzer.getFeedback(feedbackId);
}

/**
 * Lista feedbacks com filtros
 * @param {object} filtros - {sentimento, prioridade, status, limite}
 */
function apiFeedbackListar(filtros) {
  return SentimentAnalyzer.listFeedbacks(filtros || {});
}

/**
 * Gera relatório de insights
 * @param {number} periodo - Período em dias (padrão: 30)
 */
function apiFeedbackRelatorio(periodo) {
  return SentimentAnalyzer.generateInsightsReport(periodo || 30);
}

/**
 * Analisa feedback com IA
 * @param {string} feedbackId - ID do feedback
 */
function apiFeedbackAnalisarIA(feedbackId) {
  return SentimentAnalyzer.analyzeWithAI(feedbackId);
}

/**
 * Atualiza status do feedback
 * @param {string} feedbackId - ID do feedback
 * @param {string} status - Novo status
 */
function apiFeedbackAtualizarStatus(feedbackId, status) {
  return SentimentAnalyzer.updateFeedbackStatus(feedbackId, status);
}

/**
 * Obtém feedbacks urgentes
 */
function apiFeedbackUrgentes() {
  return SentimentAnalyzer.getUrgentFeedbacks();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 38/30 (25/30): FEEDBACK DE SERVIÇO E ANÁLISE DE SENTIMENTO
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - NLP for Customer Feedback Analysis
// - Net Promoter Score (Reichheld, 2003)

/**
 * Tópicos de feedback categorizados
 */
const FEEDBACK_TOPICS = {
  GUIAS: { id: 'GUIAS', nome: 'Guias e Atendimento', icone: '👨‍🏫', keywords: ['guia', 'monitor', 'atendimento', 'explicação', 'acompanhamento'] },
  TRILHAS: { id: 'TRILHAS', nome: 'Trilhas e Percursos', icone: '🥾', keywords: ['trilha', 'caminho', 'percurso', 'sinalização', 'dificuldade'] },
  INFRAESTRUTURA: { id: 'INFRAESTRUTURA', nome: 'Infraestrutura', icone: '🏗️', keywords: ['banheiro', 'estacionamento', 'estrutura', 'banco', 'lixeira'] },
  NATUREZA: { id: 'NATUREZA', nome: 'Natureza e Fauna', icone: '🦜', keywords: ['animal', 'pássaro', 'planta', 'paisagem', 'natureza', 'biodiversidade'] },
  SEGURANCA: { id: 'SEGURANCA', nome: 'Segurança', icone: '🛡️', keywords: ['seguro', 'segurança', 'perigoso', 'risco', 'proteção'] },
  ALIMENTACAO: { id: 'ALIMENTACAO', nome: 'Alimentação', icone: '🍽️', keywords: ['comida', 'lanche', 'água', 'restaurante', 'café'] },
  PRECO: { id: 'PRECO', nome: 'Preço e Valor', icone: '💰', keywords: ['preço', 'valor', 'caro', 'barato', 'custo', 'ingresso'] },
  EDUCACAO: { id: 'EDUCACAO', nome: 'Educação Ambiental', icone: '📚', keywords: ['aprendizado', 'educativo', 'informação', 'conhecimento'] }
};

// Adiciona ao SentimentAnalyzer
SentimentAnalyzer.FEEDBACK_TOPICS = FEEDBACK_TOPICS;

/**
 * Submete feedback de visitante com análise completa
 * @param {string} userId - ID do usuário
 * @param {number} rating - Avaliação 1-5 estrelas
 * @param {string} comentario - Comentário do visitante
 * @param {string} visitaId - ID da visita (opcional)
 * @returns {object} Resultado com análise de sentimento
 */
SentimentAnalyzer.submitVisitorFeedback = function(userId, rating, comentario, visitaId = null) {
  try {
    // Valida entrada
    if (!comentario || comentario.trim().length < 10) {
      return { success: false, error: 'Comentário deve ter pelo menos 10 caracteres' };
    }
    
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Avaliação deve ser entre 1 e 5 estrelas' };
    }
    
    // Analisa feedback
    const analysis = this.analyzeFeedback({
      comentario: comentario,
      avaliacao: rating,
      visitante_id: userId,
      tipo_visita: 'Ecoturismo'
    });
    
    if (!analysis.success) {
      return analysis;
    }
    
    // Extrai tópicos específicos
    const topics = this._extractFeedbackTopics(comentario);
    
    // Recompensa por feedback (integração com gamificação)
    this._rewardFeedback(userId, rating);
    
    return {
      success: true,
      feedback_id: analysis.feedback_id,
      mensagem: 'Obrigado pelo seu feedback! 🌿',
      analise: {
        sentimento: analysis.analysis.sentimento,
        score: analysis.analysis.score_sentimento,
        topicos: topics,
        emocao_principal: analysis.analysis.emocoes[0]?.emocao || 'Não identificada'
      },
      pontos_ganhos: 10
    };
  } catch (error) {
    Logger.log(`[submitVisitorFeedback] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Extrai tópicos específicos do feedback
 * @private
 */
SentimentAnalyzer._extractFeedbackTopics = function(texto) {
  const lowerText = texto.toLowerCase();
  const topics = [];
  
  Object.values(this.FEEDBACK_TOPICS).forEach(topic => {
    const matches = topic.keywords.filter(kw => lowerText.includes(kw));
    if (matches.length > 0) {
      // Determina sentimento do tópico
      let topicSentiment = 'NEUTRO';
      const sentenceWithTopic = this._findSentenceWithKeyword(texto, matches[0]);
      if (sentenceWithTopic) {
        const sentimentResult = this._analyzeSentiment(sentenceWithTopic, 3);
        if (sentimentResult.score > 0.15) topicSentiment = 'POSITIVO';
        else if (sentimentResult.score < -0.15) topicSentiment = 'NEGATIVO';
      }
      
      topics.push({
        id: topic.id,
        nome: topic.nome,
        icone: topic.icone,
        sentimento: topicSentiment,
        keywords_encontradas: matches
      });
    }
  });
  
  return topics;
};

/**
 * Encontra frase contendo keyword
 * @private
 */
SentimentAnalyzer._findSentenceWithKeyword = function(texto, keyword) {
  const sentences = texto.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
      return sentence.trim();
    }
  }
  return null;
};

/**
 * Recompensa usuário por feedback
 * @private
 */
SentimentAnalyzer._rewardFeedback = function(userId, rating) {
  try {
    if (typeof GamificationEngine !== 'undefined') {
      GamificationEngine.registerAction(userId, 'feedback_enviado', { rating });
    }
  } catch (error) {
    Logger.log(`[_rewardFeedback] Erro: ${error}`);
  }
};

/**
 * Obtém estatísticas agregadas de feedback
 * @param {string} periodo - 'semana', 'mes', 'trimestre', 'ano'
 * @returns {object} Estatísticas agregadas
 */
SentimentAnalyzer.getFeedbackStats = function(periodo = 'mes') {
  try {
    const periodoMap = {
      'semana': 7,
      'mes': 30,
      'trimestre': 90,
      'ano': 365
    };
    
    const dias = periodoMap[periodo] || 30;
    const report = this.generateInsightsReport(dias);
    
    if (!report.success) return report;
    
    // Adiciona análise por tópico
    const topicStats = this._getTopicStats(dias);
    
    return {
      success: true,
      periodo: periodo,
      dias: dias,
      total_feedbacks: report.total_feedbacks,
      metricas: report.metricas,
      distribuicao_sentimentos: report.distribuicao_sentimentos,
      temas_principais: report.temas_principais,
      analise_topicos: topicStats,
      tendencia: this._calculateTrend(dias),
      recomendacoes: report.recomendacoes.slice(0, 3)
    };
  } catch (error) {
    Logger.log(`[getFeedbackStats] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém estatísticas por tópico
 * @private
 */
SentimentAnalyzer._getTopicStats = function(dias) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_NAME);
    
    if (!sheet || sheet.getLastRow() < 2) return {};
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const cutoffDate = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    
    const topicStats = {};
    Object.values(this.FEEDBACK_TOPICS).forEach(t => {
      topicStats[t.id] = { mencoes: 0, sentimento_medio: 0, scores: [] };
    });
    
    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][headers.indexOf('Timestamp')]);
      if (timestamp < cutoffDate) continue;
      
      const comentario = data[i][headers.indexOf('Comentario')] || '';
      const score = data[i][headers.indexOf('Score_Sentimento')] || 0;
      
      Object.values(this.FEEDBACK_TOPICS).forEach(topic => {
        if (topic.keywords.some(kw => comentario.toLowerCase().includes(kw))) {
          topicStats[topic.id].mencoes++;
          topicStats[topic.id].scores.push(score);
        }
      });
    }
    
    // Calcula médias
    Object.keys(topicStats).forEach(topicId => {
      const stats = topicStats[topicId];
      if (stats.scores.length > 0) {
        stats.sentimento_medio = parseFloat((stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(2));
      }
      delete stats.scores;
    });
    
    return topicStats;
  } catch (error) {
    Logger.log(`[_getTopicStats] Erro: ${error}`);
    return {};
  }
};

/**
 * Calcula tendência de sentimento
 * @private
 */
SentimentAnalyzer._calculateTrend = function(dias) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_NAME);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { direcao: 'estavel', variacao: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const now = new Date();
    const halfPeriod = dias / 2;
    
    const recentCutoff = new Date(now.getTime() - halfPeriod * 24 * 60 * 60 * 1000);
    const olderCutoff = new Date(now.getTime() - dias * 24 * 60 * 60 * 1000);
    
    let recentScores = [];
    let olderScores = [];
    
    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][headers.indexOf('Timestamp')]);
      const score = data[i][headers.indexOf('Score_Sentimento')] || 0;
      
      if (timestamp >= recentCutoff) {
        recentScores.push(score);
      } else if (timestamp >= olderCutoff) {
        olderScores.push(score);
      }
    }
    
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;
    
    const variacao = recentAvg - olderAvg;
    let direcao = 'estavel';
    if (variacao > 0.1) direcao = 'melhorando';
    else if (variacao < -0.1) direcao = 'piorando';
    
    return {
      direcao,
      variacao: parseFloat(variacao.toFixed(3)),
      periodo_recente: { feedbacks: recentScores.length, media: parseFloat(recentAvg.toFixed(3)) },
      periodo_anterior: { feedbacks: olderScores.length, media: parseFloat(olderAvg.toFixed(3)) }
    };
  } catch (error) {
    Logger.log(`[_calculateTrend] Erro: ${error}`);
    return { direcao: 'estavel', variacao: 0 };
  }
};

/**
 * Obtém análise de tópicos
 * @returns {object} Análise detalhada por tópico
 */
SentimentAnalyzer.getTopicAnalysis = function() {
  try {
    const topicStats = this._getTopicStats(30);
    
    const analysis = Object.entries(this.FEEDBACK_TOPICS).map(([id, topic]) => {
      const stats = topicStats[id] || { mencoes: 0, sentimento_medio: 0 };
      
      let status = 'neutro';
      let icone_status = '😐';
      if (stats.sentimento_medio > 0.3) { status = 'positivo'; icone_status = '😊'; }
      else if (stats.sentimento_medio < -0.3) { status = 'negativo'; icone_status = '😕'; }
      
      return {
        id: topic.id,
        nome: topic.nome,
        icone: topic.icone,
        mencoes: stats.mencoes,
        sentimento_medio: stats.sentimento_medio,
        status,
        icone_status
      };
    }).sort((a, b) => b.mencoes - a.mencoes);
    
    return {
      success: true,
      periodo: '30 dias',
      topicos: analysis,
      topico_mais_mencionado: analysis[0] || null,
      topico_mais_positivo: [...analysis].sort((a, b) => b.sentimento_medio - a.sentimento_medio)[0] || null,
      topico_mais_negativo: [...analysis].sort((a, b) => a.sentimento_medio - b.sentimento_medio)[0] || null
    };
  } catch (error) {
    Logger.log(`[getTopicAnalysis] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém feedbacks recentes
 * @param {number} limite - Número de feedbacks
 * @returns {object} Feedbacks recentes
 */
SentimentAnalyzer.getRecentFeedback = function(limite = 10) {
  try {
    const result = this.listFeedbacks({ limite: limite });
    
    if (!result.success) return result;
    
    // Enriquece com ícones de sentimento
    const feedbacks = result.feedbacks.map(f => ({
      ...f,
      icone_sentimento: this._getSentimentIcon(f.sentimento),
      estrelas: '⭐'.repeat(f.avaliacao || 0)
    }));
    
    return {
      success: true,
      feedbacks,
      total: feedbacks.length
    };
  } catch (error) {
    Logger.log(`[getRecentFeedback] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém ícone de sentimento
 * @private
 */
SentimentAnalyzer._getSentimentIcon = function(sentimento) {
  const icons = {
    'Muito_Positivo': '😍',
    'Positivo': '😊',
    'Neutro': '😐',
    'Negativo': '😕',
    'Muito_Negativo': '😞'
  };
  return icons[sentimento] || '😐';
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Sentiment Analysis (Prompt 38/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Submete feedback de visitante
 * @param {string} userId - ID do usuário
 * @param {number} rating - Avaliação 1-5
 * @param {string} comentario - Comentário
 * @param {string} visitaId - ID da visita (opcional)
 */
function apiSentimentoSubmitFeedback(userId, rating, comentario, visitaId) {
  return SentimentAnalyzer.submitVisitorFeedback(userId, rating, comentario, visitaId);
}

/**
 * API: Analisa sentimento de texto
 * @param {string} texto - Texto para análise
 */
function apiSentimentoAnalyze(texto) {
  return SentimentAnalyzer.analyzeFeedback({ comentario: texto, avaliacao: 3 });
}

/**
 * API: Obtém estatísticas agregadas
 * @param {string} periodo - 'semana', 'mes', 'trimestre', 'ano'
 */
function apiSentimentoGetStats(periodo) {
  return SentimentAnalyzer.getFeedbackStats(periodo || 'mes');
}

/**
 * API: Obtém análise de tópicos
 */
function apiSentimentoGetTopics() {
  return SentimentAnalyzer.getTopicAnalysis();
}

/**
 * API: Obtém feedbacks recentes
 * @param {number} limite - Número de feedbacks
 */
function apiSentimentoGetRecent(limite) {
  return SentimentAnalyzer.getRecentFeedback(limite || 10);
}

/**
 * API: Lista tópicos de feedback disponíveis
 */
function apiSentimentoListTopics() {
  return {
    success: true,
    topics: Object.values(FEEDBACK_TOPICS)
  };
}
