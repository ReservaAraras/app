/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED INTENT ROUTER - Roteador de Intenção Unificado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema central de classificação semântica e roteamento de mensagens
 * para os chatbots especializados da Reserva Araras.
 * 
 * Arquitetura Hub-and-Spoke conforme especificação:
 * - Nível 1: Detecção de Intenção Primária
 * - Nível 2: Análise de Contexto Situacional
 * - Nível 3: Desambiguação Interativa
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Categorias de intenção primária
 */
const INTENT_CATEGORIES = {
  BIO_IDENTIFICATION: {
    id: 'BIO_IDENTIFICATION',
    targetBot: 'BIOBOT',
    keywords: ['espécie', 'animal', 'planta', 'ave', 'mamífero', 'réptil', 'árvore', 
               'identificar', 'que bicho', 'que planta', 'pássaro', 'flor', 'fruto'],
    contextBoost: ['trilha', 'observação', 'foto'],
    priority: 2
  },
  THERAPY_SUPPORT: {
    id: 'THERAPY_SUPPORT',
    targetBot: 'SERENA',
    keywords: ['ansiedade', 'ansioso', 'triste', 'estresse', 'calma', 'relaxar', 
               'respirar', 'meditar', 'paz', 'bem-estar', 'sentindo', 'emoção',
               'nervoso', 'preocupado', 'angústia', 'medo', 'deprimido'],
    contextBoost: ['trilha terapêutica', 'zona de silêncio', 'banho de floresta'],
    priority: 1
  },
  AGRO_MANAGEMENT: {
    id: 'AGRO_MANAGEMENT',
    targetBot: 'AGROBOT',
    keywords: ['saf', 'agrofloresta', 'plantio', 'poda', 'solo', 'adubo', 'parcela',
               'colheita', 'manejo', 'cultivo', 'semente', 'muda', 'irrigação'],
    contextBoost: ['parcela', 'área', 'hectare'],
    priority: 3
  },
  NAV_GEO: {
    id: 'NAV_GEO',
    targetBot: 'GEOBOT',
    keywords: ['onde', 'como chego', 'trilha', 'mapa', 'direção', 'waypoint',
               'coordenada', 'gps', 'distância', 'rota', 'caminho', 'localização'],
    contextBoost: ['perdido', 'encontrar', 'navegar'],
    priority: 2
  },
  EDU_QUERY: {
    id: 'EDU_QUERY',
    targetBot: 'EDUBOT',
    keywords: ['aprender', 'ensinar', 'explicar', 'o que é', 'como funciona',
               'cerrado', 'bioma', 'ecossistema', 'quiz', 'escola', 'aula'],
    contextBoost: ['criança', 'estudante', 'professor'],
    priority: 3
  },
  ECO_LOGISTICS: {
    id: 'ECO_LOGISTICS',
    targetBot: 'TOURBOT',
    keywords: ['visitar', 'horário', 'agendar', 'reservar', 'preço', 'ingresso',
               'tour', 'passeio', 'guia', 'grupo', 'evento', 'calendário'],
    contextBoost: ['data', 'disponibilidade', 'vagas'],
    priority: 3
  },
  IOT_ALERT: {
    id: 'IOT_ALERT',
    targetBot: 'SENTINELBOT',
    keywords: ['sensor', 'alerta', 'fogo', 'incêndio', 'cheia', 'emergência',
               'perigo', 'temperatura', 'umidade', 'nível água', 'câmera'],
    contextBoost: ['urgente', 'crítico', 'imediato'],
    priority: 0 // Máxima prioridade
  },
  HYDRO_THERAPY: {
    id: 'HYDRO_THERAPY',
    targetBot: 'SERENA',
    keywords: ['água', 'rio', 'cachoeira', 'banho', 'imersão', 'hidroterapia',
               'nadar', 'refrescar'],
    contextBoost: ['terapia', 'relaxar'],
    priority: 2,
    safetyCheck: true
  }
};

/**
 * Roteador de Intenção Unificado
 * @namespace IntentRouter
 */
const IntentRouter = {
  
  CONFIDENCE_THRESHOLD: 0.7,
  DISAMBIGUATION_THRESHOLD: 0.5,
  
  /**
   * Mapeia bots para seus handlers
   */
  BOT_HANDLERS: {
    BIOBOT: 'biodiversidade',
    SERENA: 'terapia',
    AGROBOT: 'agrofloresta',
    GEOBOT: 'geolocalizacao',
    EDUBOT: 'educacao',
    TOURBOT: 'ecoturismo',
    SENTINELBOT: 'monitoramento'
  },

  /**
   * Processa mensagem e roteia para o bot apropriado
   * @param {string} message - Mensagem do usuário
   * @param {object} sessionContext - Contexto da sessão
   * @returns {object} Resultado do roteamento
   */
  route(message, sessionContext = {}) {
    try {
      const startTime = Date.now();
      
      // Nível 1: Detecção de Intenção Primária
      const intentAnalysis = this._detectPrimaryIntent(message);
      
      // Nível 2: Análise de Contexto Situacional
      const contextAdjusted = this._applyContextualBoost(intentAnalysis, sessionContext);
      
      // Nível 3: Verificação de Confiança e Desambiguação
      const routingDecision = this._makeRoutingDecision(contextAdjusted, message);
      
      // Log para auditoria
      const processingTime = Date.now() - startTime;
      this._logRouting(message, routingDecision, processingTime);
      
      return routingDecision;
      
    } catch (error) {
      Logger.log(`[IntentRouter.route] Erro: ${error}`);
      return this._createFallbackRouting(message);
    }
  },

  /**
   * Nível 1: Detecta intenção primária via keywords
   * @private
   */
  _detectPrimaryIntent(message) {
    const lowerMessage = message.toLowerCase();
    const scores = {};
    const entities = [];
    
    for (const [intentId, config] of Object.entries(INTENT_CATEGORIES)) {
      let score = 0;
      const matchedKeywords = [];
      
      // Pontuação por keywords
      for (const keyword of config.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += 2;
          matchedKeywords.push(keyword);
          
          // Extrai entidades
          if (!entities.includes(keyword)) {
            entities.push(keyword);
          }
        }
      }
      
      // Ajuste por prioridade (menor = mais urgente)
      if (score > 0) {
        score += (5 - config.priority);
      }
      
      scores[intentId] = {
        score,
        matchedKeywords,
        config
      };
    }
    
    // Ordena por score
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1].score - a[1].score);
    
    const topIntent = sorted[0];
    const secondIntent = sorted[1];
    
    // Calcula confiança normalizada
    const maxPossibleScore = 20;
    const confidence = Math.min(topIntent[1].score / maxPossibleScore, 1);
    
    return {
      primaryIntent: topIntent[0],
      primaryScore: topIntent[1].score,
      confidence,
      matchedKeywords: topIntent[1].matchedKeywords,
      secondaryIntent: secondIntent ? secondIntent[0] : null,
      secondaryScore: secondIntent ? secondIntent[1].score : 0,
      entities,
      allScores: scores
    };
  },

  /**
   * Nível 2: Aplica boost contextual baseado na sessão
   * @private
   */
  _applyContextualBoost(intentAnalysis, sessionContext) {
    const adjusted = { ...intentAnalysis };
    
    // Boost por localização (zona terapêutica, trilha, etc.)
    if (sessionContext.currentZone) {
      const zone = sessionContext.currentZone.toLowerCase();
      
      if (zone.includes('terapêutica') || zone.includes('silêncio')) {
        // Aumenta probabilidade de intenção terapêutica
        if (adjusted.allScores.THERAPY_SUPPORT) {
          adjusted.allScores.THERAPY_SUPPORT.score += 3;
        }
      }
      
      if (zone.includes('saf') || zone.includes('agrofloresta')) {
        if (adjusted.allScores.AGRO_MANAGEMENT) {
          adjusted.allScores.AGRO_MANAGEMENT.score += 3;
        }
      }
    }
    
    // Boost por histórico de conversa
    if (sessionContext.lastIntent) {
      // Continuidade de tema
      if (adjusted.allScores[sessionContext.lastIntent]) {
        adjusted.allScores[sessionContext.lastIntent].score += 1;
      }
    }
    
    // Boost por perfil do usuário
    if (sessionContext.userProfile) {
      if (sessionContext.userProfile.type === 'researcher') {
        if (adjusted.allScores.BIO_IDENTIFICATION) {
          adjusted.allScores.BIO_IDENTIFICATION.score += 2;
        }
      }
      if (sessionContext.userProfile.type === 'visitor_therapy') {
        if (adjusted.allScores.THERAPY_SUPPORT) {
          adjusted.allScores.THERAPY_SUPPORT.score += 2;
        }
      }
    }
    
    // Recalcula ranking após ajustes
    const sorted = Object.entries(adjusted.allScores)
      .sort((a, b) => b[1].score - a[1].score);
    
    adjusted.primaryIntent = sorted[0][0];
    adjusted.primaryScore = sorted[0][1].score;
    adjusted.confidence = Math.min(sorted[0][1].score / 20, 1);
    
    return adjusted;
  },

  /**
   * Nível 3: Decide roteamento ou solicita desambiguação
   * @private
   */
  _makeRoutingDecision(analysis, originalMessage) {
    const intentConfig = INTENT_CATEGORIES[analysis.primaryIntent];
    
    // Caso 1: Alta confiança - roteia diretamente
    if (analysis.confidence >= this.CONFIDENCE_THRESHOLD) {
      return {
        success: true,
        action: 'ROUTE',
        intent: analysis.primaryIntent,
        targetBot: intentConfig.targetBot,
        handler: this.BOT_HANDLERS[intentConfig.targetBot],
        confidence: analysis.confidence,
        entities: analysis.entities,
        requiresSafetyCheck: intentConfig.safetyCheck || false,
        metadata: {
          matchedKeywords: analysis.matchedKeywords,
          processingLevel: 'direct'
        }
      };
    }
    
    // Caso 2: Confiança média - verifica ambiguidade
    if (analysis.confidence >= this.DISAMBIGUATION_THRESHOLD) {
      // Verifica se há competição entre intenções
      const scoreDiff = analysis.primaryScore - analysis.secondaryScore;
      
      if (scoreDiff < 2 && analysis.secondaryIntent) {
        // Ambiguidade detectada - solicita clarificação
        return this._createDisambiguationRequest(analysis, originalMessage);
      }
      
      // Diferença suficiente - roteia com aviso
      return {
        success: true,
        action: 'ROUTE_WITH_CAUTION',
        intent: analysis.primaryIntent,
        targetBot: intentConfig.targetBot,
        handler: this.BOT_HANDLERS[intentConfig.targetBot],
        confidence: analysis.confidence,
        entities: analysis.entities,
        requiresSafetyCheck: intentConfig.safetyCheck || false,
        metadata: {
          matchedKeywords: analysis.matchedKeywords,
          processingLevel: 'medium_confidence',
          alternativeIntent: analysis.secondaryIntent
        }
      };
    }
    
    // Caso 3: Baixa confiança - solicita clarificação
    return this._createClarificationRequest(originalMessage);
  },

  /**
   * Cria solicitação de desambiguação
   * @private
   */
  _createDisambiguationRequest(analysis, message) {
    const primary = INTENT_CATEGORIES[analysis.primaryIntent];
    const secondary = INTENT_CATEGORIES[analysis.secondaryIntent];
    
    const options = [
      {
        intent: analysis.primaryIntent,
        label: this._getIntentLabel(analysis.primaryIntent),
        bot: primary.targetBot
      },
      {
        intent: analysis.secondaryIntent,
        label: this._getIntentLabel(analysis.secondaryIntent),
        bot: secondary.targetBot
      }
    ];
    
    return {
      success: true,
      action: 'DISAMBIGUATE',
      message: `Não tenho certeza se entendi. Você gostaria de:\n\n` +
               `1️⃣ ${options[0].label}\n` +
               `2️⃣ ${options[1].label}\n\n` +
               `Por favor, escolha uma opção ou reformule sua pergunta.`,
      options,
      originalMessage: message,
      confidence: analysis.confidence,
      metadata: {
        processingLevel: 'disambiguation',
        competingIntents: [analysis.primaryIntent, analysis.secondaryIntent]
      }
    };
  },

  /**
   * Cria solicitação de clarificação
   * @private
   */
  _createClarificationRequest(message) {
    return {
      success: true,
      action: 'CLARIFY',
      message: `Hmm, não consegui entender bem sua solicitação. 🤔\n\n` +
               `Posso te ajudar com:\n` +
               `🦋 Identificação de espécies\n` +
               `🧘 Bem-estar e terapia na natureza\n` +
               `🌱 Agrofloresta e manejo\n` +
               `📍 Navegação e trilhas\n` +
               `📚 Educação ambiental\n` +
               `🎒 Visitação e tours\n` +
               `📡 Monitoramento e alertas\n\n` +
               `Sobre qual tema você gostaria de conversar?`,
      originalMessage: message,
      confidence: 0,
      metadata: {
        processingLevel: 'clarification'
      }
    };
  },

  /**
   * Retorna label amigável para intenção
   * @private
   */
  _getIntentLabel(intentId) {
    const labels = {
      BIO_IDENTIFICATION: 'Saber sobre espécies (fauna/flora)',
      THERAPY_SUPPORT: 'Apoio terapêutico e bem-estar',
      AGRO_MANAGEMENT: 'Informações sobre agrofloresta',
      NAV_GEO: 'Navegação e localização',
      EDU_QUERY: 'Aprender sobre o Cerrado',
      ECO_LOGISTICS: 'Visitação e agendamentos',
      IOT_ALERT: 'Alertas e monitoramento',
      HYDRO_THERAPY: 'Hidroterapia e atividades aquáticas'
    };
    return labels[intentId] || intentId;
  },

  /**
   * Cria roteamento fallback
   * @private
   */
  _createFallbackRouting(message) {
    return {
      success: true,
      action: 'FALLBACK',
      intent: 'EDU_QUERY',
      targetBot: 'EDUBOT',
      handler: 'educacao',
      confidence: 0.3,
      entities: [],
      metadata: {
        processingLevel: 'fallback',
        reason: 'No clear intent detected'
      }
    };
  },

  /**
   * Log de roteamento para auditoria
   * @private
   */
  _logRouting(message, decision, processingTime) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message: message.substring(0, 100),
      intent: decision.intent,
      action: decision.action,
      confidence: decision.confidence,
      targetBot: decision.targetBot,
      processingTimeMs: processingTime
    };
    
    // Salva no cache para análise posterior
    try {
      const cache = CacheService.getScriptCache();
      const key = `routing_log_${Date.now()}`;
      cache.put(key, JSON.stringify(logEntry), 3600); // 1 hora
    } catch (e) {
      // Silently fail - logging não deve quebrar o fluxo
    }
    
    Logger.log(`[IntentRouter] ${decision.action}: ${decision.intent} (${(decision.confidence * 100).toFixed(0)}%) -> ${decision.targetBot}`);
  },

  /**
   * Processa resposta de desambiguação do usuário
   * @param {string|number} choice - Escolha do usuário (1 ou 2)
   * @param {object} disambiguationContext - Contexto da desambiguação anterior
   */
  resolveDisambiguation(choice, disambiguationContext) {
    const index = parseInt(choice) - 1;
    
    if (index >= 0 && index < disambiguationContext.options.length) {
      const selected = disambiguationContext.options[index];
      const intentConfig = INTENT_CATEGORIES[selected.intent];
      
      return {
        success: true,
        action: 'ROUTE',
        intent: selected.intent,
        targetBot: selected.bot,
        handler: this.BOT_HANDLERS[selected.bot],
        confidence: 1.0, // Usuário confirmou
        entities: [],
        metadata: {
          processingLevel: 'user_confirmed',
          originalMessage: disambiguationContext.originalMessage
        }
      };
    }
    
    // Escolha inválida - tenta rotear a mensagem original novamente
    return this.route(disambiguationContext.originalMessage);
  },

  /**
   * Roteamento com IA (Gemini) para casos complexos
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto
   */
  routeWithAI(message, context = {}) {
    // Verifica se Gemini está disponível
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) {
      return this.route(message, context);
    }
    
    try {
      const prompt = `Você é o controlador central da Reserva Araras. Analise a mensagem e retorne APENAS um JSON válido.

MENSAGEM: "${message}"

CATEGORIAS DISPONÍVEIS:
- BIO_IDENTIFICATION: Identificação de espécies, fauna, flora
- THERAPY_SUPPORT: Apoio emocional, bem-estar, ansiedade, estresse
- AGRO_MANAGEMENT: Agrofloresta, plantio, manejo, solo
- NAV_GEO: Navegação, trilhas, localização, waypoints
- EDU_QUERY: Educação, aprendizado, explicações
- ECO_LOGISTICS: Visitação, agendamento, tours
- IOT_ALERT: Alertas, sensores, emergências

Retorne SOMENTE o JSON (sem markdown):
{"intent":"CATEGORIA","confidence":0.0-1.0,"entities":["entidade1"],"reasoning":"motivo"}`;

      const result = GeminiAIService.callGemini(prompt, { 
        maxTokens: 200,
        temperature: 0.1 
      });
      
      if (result.success && result.text) {
        const parsed = JSON.parse(result.text.replace(/```json|```/g, '').trim());
        const intentConfig = INTENT_CATEGORIES[parsed.intent];
        
        if (intentConfig) {
          return {
            success: true,
            action: 'ROUTE',
            intent: parsed.intent,
            targetBot: intentConfig.targetBot,
            handler: this.BOT_HANDLERS[intentConfig.targetBot],
            confidence: parsed.confidence,
            entities: parsed.entities || [],
            metadata: {
              processingLevel: 'ai_assisted',
              reasoning: parsed.reasoning
            }
          };
        }
      }
    } catch (e) {
      Logger.log(`[IntentRouter.routeWithAI] Erro: ${e}`);
    }
    
    // Fallback para roteamento baseado em regras
    return this.route(message, context);
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Intent Router
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Roteia mensagem para o bot apropriado
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto da sessão
 * @returns {object} Decisão de roteamento
 */
function apiRouteIntent(message, context) {
  return IntentRouter.route(message, context || {});
}

/**
 * Roteia com assistência de IA
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto da sessão
 * @returns {object} Decisão de roteamento
 */
function apiRouteIntentAI(message, context) {
  return IntentRouter.routeWithAI(message, context || {});
}

/**
 * Resolve desambiguação
 * @param {string|number} choice - Escolha do usuário
 * @param {object} disambiguationContext - Contexto da desambiguação
 * @returns {object} Decisão de roteamento
 */
function apiResolveDisambiguation(choice, disambiguationContext) {
  return IntentRouter.resolveDisambiguation(choice, disambiguationContext);
}

/**
 * Processa mensagem completa: roteia e executa
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto da sessão
 * @returns {object} Resposta do bot apropriado
 */
function apiProcessMessage(message, context) {
  // 1. Roteia a mensagem
  const routing = IntentRouter.route(message, context || {});
  
  // 2. Se precisa desambiguação ou clarificação, retorna a pergunta
  if (routing.action === 'DISAMBIGUATE' || routing.action === 'CLARIFY') {
    return {
      success: true,
      needsInput: true,
      response: {
        text: routing.message,
        type: routing.action.toLowerCase(),
        options: routing.options || null
      },
      routing: routing
    };
  }
  
  // 3. Executa o handler do bot apropriado
  try {
    const handlerMap = {
      'biodiversidade': () => apiChatbotDomain('biodiversidade', message, context),
      'terapia': () => apiTherapyChatbotMessage(message, context),
      'agrofloresta': () => apiChatbotDomain('agrofloresta', message, context),
      'geolocalizacao': () => apiChatbotDomain('geolocalizacao', message, context),
      'educacao': () => apiChatbotDomain('educacao', message, context),
      'ecoturismo': () => apiChatbotDomain('ecoturismo', message, context),
      'monitoramento': () => apiChatbotDomain('monitoramento', message, context)
    };
    
    const handler = handlerMap[routing.handler];
    if (handler) {
      const botResponse = handler();
      return {
        success: true,
        needsInput: false,
        response: botResponse.response || botResponse,
        routing: routing
      };
    }
  } catch (e) {
    Logger.log(`[apiProcessMessage] Erro ao executar handler: ${e}`);
  }
  
  // Fallback
  return {
    success: false,
    error: 'Handler não encontrado',
    routing: routing
  };
}

/**
 * Obtém estatísticas de roteamento
 * @returns {object} Estatísticas
 */
function apiGetRoutingStats() {
  // Implementação básica - pode ser expandida
  return {
    success: true,
    categories: Object.keys(INTENT_CATEGORIES),
    bots: Object.values(IntentRouter.BOT_HANDLERS),
    thresholds: {
      confidence: IntentRouter.CONFIDENCE_THRESHOLD,
      disambiguation: IntentRouter.DISAMBIGUATION_THRESHOLD
    }
  };
}
