/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONVERSATION MANAGER - Gestão de Contexto e Memória
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de gestão de contexto conversacional para resolver o problema
 * de "amnésia" dos chatbots, mantendo histórico e continuidade.
 * 
 * Funcionalidades:
 * - Armazenamento de histórico de conversas
 * - Recuperação de contexto para prompts de IA
 * - Gestão de sessões de usuário
 * - Cache inteligente para performance
 * - Pseudonimização para privacidade (LGPD)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Schema da planilha CHATBOT_INTERACOES_RA (expandido)
 */
const CONVERSATION_SCHEMA = {
  sheetName: 'CHATBOT_INTERACOES_RA',
  headers: [
    'ID_Mensagem', 'ID_Sessao', 'ID_Usuario_Hash', 'Timestamp',
    'Tipo', 'Conteudo', 'Intent_Detected', 'Confidence_Score',
    'Bot_Respondente', 'Tempo_Resposta_ms', 'Contexto_JSON'
  ]
};

/**
 * Configurações do ConversationManager
 */
const CONVERSATION_CONFIG = {
  maxHistoryMessages: 10,      // Máximo de mensagens no contexto
  sessionTimeoutMinutes: 30,   // Timeout de sessão
  cacheExpirationSeconds: 300, // 5 minutos de cache
  maxContextTokens: 2000       // Limite de tokens para contexto
};

/**
 * Gerenciador de Conversas
 * @namespace ConversationManager
 */
const ConversationManager = {

  /**
   * Inicializa a planilha de interações
   */
  initializeSheet() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(CONVERSATION_SCHEMA.sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONVERSATION_SCHEMA.sheetName);
        sheet.appendRow(CONVERSATION_SCHEMA.headers);
        
        const headerRange = sheet.getRange(1, 1, 1, CONVERSATION_SCHEMA.headers.length);
        headerRange.setBackground('#1565C0');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        // Configura larguras
        sheet.setColumnWidth(1, 150); // ID_Mensagem
        sheet.setColumnWidth(6, 400); // Conteudo
      }
      
      return { success: true, sheetName: CONVERSATION_SCHEMA.sheetName };
    } catch (error) {
      Logger.log(`[ConversationManager.initializeSheet] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera hash para pseudonimização de usuário (LGPD)
   * @param {string} identifier - Identificador original
   * @returns {string} Hash pseudonimizado
   */
  hashUserId(identifier) {
    if (!identifier) return 'ANON_' + Date.now();
    
    // Usa Utilities.computeDigest para criar hash
    const hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      identifier + '_RESERVA_ARARAS_SALT'
    );
    
    // Converte para string hexadecimal
    return hash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').substring(0, 16);
  },

  /**
   * Cria ou recupera sessão
   * @param {string} userId - ID do usuário (será hasheado)
   * @returns {object} Dados da sessão
   */
  getOrCreateSession(userId) {
    const userHash = this.hashUserId(userId);
    const cache = CacheService.getUserCache();
    const cacheKey = `session_${userHash}`;
    
    // Tenta recuperar do cache
    const cached = cache.get(cacheKey);
    if (cached) {
      const session = JSON.parse(cached);
      session.isResumed = true;
      return session;
    }
    
    // Cria nova sessão
    const sessionId = `SESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      sessionId,
      userHash,
      startTime: new Date().toISOString(),
      messageCount: 0,
      lastIntent: null,
      lastBot: null,
      emotionalState: null,
      currentZone: null,
      context: {},
      isResumed: false
    };
    
    // Salva no cache
    cache.put(cacheKey, JSON.stringify(session), CONVERSATION_CONFIG.sessionTimeoutMinutes * 60);
    
    return session;
  },

  /**
   * Atualiza sessão
   * @param {object} session - Dados da sessão
   */
  updateSession(session) {
    const cache = CacheService.getUserCache();
    const cacheKey = `session_${session.userHash}`;
    
    session.lastUpdate = new Date().toISOString();
    cache.put(cacheKey, JSON.stringify(session), CONVERSATION_CONFIG.sessionTimeoutMinutes * 60);
    
    return { success: true };
  },

  /**
   * Registra mensagem na conversa
   * @param {object} params - Parâmetros da mensagem
   */
  logMessage(params) {
    try {
      const {
        sessionId,
        userHash,
        type,           // 'user' ou 'bot'
        content,
        intentDetected,
        confidenceScore,
        botRespondente,
        tempoResposta,
        contexto
      } = params;
      
      const messageId = `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Salva na planilha
      this.initializeSheet();
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONVERSATION_SCHEMA.sheetName);
      
      const row = [
        messageId,
        sessionId,
        userHash,
        new Date().toISOString(),
        type,
        content.substring(0, 1000), // Limita tamanho
        intentDetected || '',
        confidenceScore || '',
        botRespondente || '',
        tempoResposta || '',
        JSON.stringify(contexto || {})
      ];
      
      sheet.appendRow(row);
      
      // Atualiza cache de histórico
      this._updateHistoryCache(sessionId, {
        messageId,
        type,
        content: content.substring(0, 500),
        timestamp: new Date().toISOString(),
        intent: intentDetected,
        bot: botRespondente
      });
      
      return { success: true, messageId };
      
    } catch (error) {
      Logger.log(`[ConversationManager.logMessage] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza cache de histórico
   * @private
   */
  _updateHistoryCache(sessionId, message) {
    const cache = CacheService.getScriptCache();
    const cacheKey = `history_${sessionId}`;
    
    let history = [];
    const cached = cache.get(cacheKey);
    if (cached) {
      history = JSON.parse(cached);
    }
    
    history.push(message);
    
    // Mantém apenas as últimas N mensagens
    if (history.length > CONVERSATION_CONFIG.maxHistoryMessages) {
      history = history.slice(-CONVERSATION_CONFIG.maxHistoryMessages);
    }
    
    cache.put(cacheKey, JSON.stringify(history), CONVERSATION_CONFIG.cacheExpirationSeconds);
  },

  /**
   * Recupera histórico de conversa
   * @param {string} sessionId - ID da sessão
   * @param {number} limit - Limite de mensagens
   * @returns {array} Histórico de mensagens
   */
  getConversationHistory(sessionId, limit = CONVERSATION_CONFIG.maxHistoryMessages) {
    // Primeiro tenta o cache
    const cache = CacheService.getScriptCache();
    const cacheKey = `history_${sessionId}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      const history = JSON.parse(cached);
      return { success: true, history: history.slice(-limit), source: 'cache' };
    }
    
    // Se não tem cache, busca na planilha
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONVERSATION_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, history: [], source: 'empty' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const sessionIdIndex = headers.indexOf('ID_Sessao');
      
      // Filtra por sessão
      const sessionMessages = [];
      for (let i = data.length - 1; i >= 1 && sessionMessages.length < limit; i--) {
        if (data[i][sessionIdIndex] === sessionId) {
          sessionMessages.unshift({
            messageId: data[i][0],
            type: data[i][4],
            content: data[i][5],
            timestamp: data[i][3],
            intent: data[i][6],
            bot: data[i][8]
          });
        }
      }
      
      // Atualiza cache
      if (sessionMessages.length > 0) {
        cache.put(cacheKey, JSON.stringify(sessionMessages), CONVERSATION_CONFIG.cacheExpirationSeconds);
      }
      
      return { success: true, history: sessionMessages, source: 'sheet' };
      
    } catch (error) {
      Logger.log(`[ConversationManager.getConversationHistory] Erro: ${error}`);
      return { success: false, error: error.message, history: [] };
    }
  },

  /**
   * Formata histórico para injeção em prompt de IA
   * @param {string} sessionId - ID da sessão
   * @returns {string} Contexto formatado
   */
  formatContextForAI(sessionId) {
    const historyResult = this.getConversationHistory(sessionId, 5);
    
    if (!historyResult.success || historyResult.history.length === 0) {
      return '';
    }
    
    const history = historyResult.history;
    let contextText = '**CONTEXTO DA CONVERSA ANTERIOR:**\n\n';
    
    for (const msg of history) {
      const role = msg.type === 'user' ? 'Usuário' : `Bot (${msg.bot || 'Sistema'})`;
      const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR');
      contextText += `[${time}] ${role}: ${msg.content}\n`;
    }
    
    contextText += '\n**FIM DO CONTEXTO**\n\n';
    
    // Verifica limite de tokens (aproximado)
    if (contextText.length > CONVERSATION_CONFIG.maxContextTokens * 4) {
      // Trunca mantendo mensagens mais recentes
      const lines = contextText.split('\n');
      while (contextText.length > CONVERSATION_CONFIG.maxContextTokens * 4 && lines.length > 4) {
        lines.splice(2, 1); // Remove linha do meio
        contextText = lines.join('\n');
      }
    }
    
    return contextText;
  },

  /**
   * Detecta estado emocional baseado no histórico
   * @param {string} sessionId - ID da sessão
   * @returns {object} Estado emocional detectado
   */
  detectEmotionalState(sessionId) {
    const historyResult = this.getConversationHistory(sessionId, 5);
    
    if (!historyResult.success || historyResult.history.length === 0) {
      return { detected: false, state: null };
    }
    
    const emotionKeywords = {
      anxious: ['ansiedade', 'ansioso', 'nervoso', 'preocupado', 'agitado', 'pânico'],
      sad: ['triste', 'tristeza', 'deprimido', 'desanimado', 'chorando', 'sozinho'],
      angry: ['raiva', 'irritado', 'frustrado', 'bravo', 'ódio'],
      stressed: ['estresse', 'estressado', 'cansado', 'esgotado', 'sobrecarregado'],
      calm: ['calmo', 'tranquilo', 'paz', 'relaxado', 'bem'],
      happy: ['feliz', 'alegre', 'contente', 'animado', 'ótimo']
    };
    
    const scores = {};
    for (const emotion of Object.keys(emotionKeywords)) {
      scores[emotion] = 0;
    }
    
    // Analisa mensagens do usuário (mais recentes têm mais peso)
    const userMessages = historyResult.history.filter(m => m.type === 'user');
    
    for (let i = 0; i < userMessages.length; i++) {
      const weight = i + 1; // Mensagens mais recentes têm mais peso
      const content = userMessages[i].content.toLowerCase();
      
      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            scores[emotion] += weight;
          }
        }
      }
    }
    
    // Encontra emoção dominante
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    if (sorted[0][1] > 0) {
      return {
        detected: true,
        state: sorted[0][0],
        confidence: Math.min(sorted[0][1] / 10, 1),
        allScores: scores
      };
    }
    
    return { detected: false, state: null };
  },

  /**
   * Obtém resumo da sessão
   * @param {string} sessionId - ID da sessão
   */
  getSessionSummary(sessionId) {
    const historyResult = this.getConversationHistory(sessionId, 20);
    
    if (!historyResult.success) {
      return { success: false, error: historyResult.error };
    }
    
    const history = historyResult.history;
    const userMessages = history.filter(m => m.type === 'user');
    const botMessages = history.filter(m => m.type === 'bot');
    
    // Coleta intents
    const intents = {};
    for (const msg of history) {
      if (msg.intent) {
        intents[msg.intent] = (intents[msg.intent] || 0) + 1;
      }
    }
    
    // Coleta bots utilizados
    const bots = {};
    for (const msg of botMessages) {
      if (msg.bot) {
        bots[msg.bot] = (bots[msg.bot] || 0) + 1;
      }
    }
    
    // Detecta estado emocional
    const emotionalState = this.detectEmotionalState(sessionId);
    
    return {
      success: true,
      sessionId,
      totalMessages: history.length,
      userMessages: userMessages.length,
      botMessages: botMessages.length,
      intentsUsed: intents,
      botsUsed: bots,
      emotionalState: emotionalState.state,
      emotionalConfidence: emotionalState.confidence,
      firstMessage: history[0]?.timestamp,
      lastMessage: history[history.length - 1]?.timestamp
    };
  },

  /**
   * Processa mensagem completa com contexto
   * @param {string} message - Mensagem do usuário
   * @param {string} userId - ID do usuário
   * @returns {object} Resposta com contexto
   */
  processWithContext(message, userId) {
    const startTime = Date.now();
    
    // 1. Obtém ou cria sessão
    const session = this.getOrCreateSession(userId);
    
    // 2. Registra mensagem do usuário
    this.logMessage({
      sessionId: session.sessionId,
      userHash: session.userHash,
      type: 'user',
      content: message
    });
    
    // 3. Obtém contexto formatado
    const contextForAI = this.formatContextForAI(session.sessionId);
    
    // 4. Detecta estado emocional
    const emotionalState = this.detectEmotionalState(session.sessionId);
    
    // 5. Roteia a mensagem
    let routing;
    if (typeof IntentRouter !== 'undefined') {
      routing = IntentRouter.route(message, {
        ...session.context,
        emotionalState: emotionalState.state,
        lastIntent: session.lastIntent
      });
    } else {
      routing = { action: 'FALLBACK', handler: 'educacao' };
    }
    
    // 6. Atualiza sessão
    session.messageCount++;
    session.lastIntent = routing.intent;
    session.lastBot = routing.targetBot;
    session.emotionalState = emotionalState.state;
    this.updateSession(session);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      session: {
        id: session.sessionId,
        isResumed: session.isResumed,
        messageCount: session.messageCount
      },
      routing,
      context: {
        formatted: contextForAI,
        emotionalState: emotionalState.state,
        emotionalConfidence: emotionalState.confidence
      },
      processingTimeMs: processingTime
    };
  },

  /**
   * Registra resposta do bot
   * @param {string} sessionId - ID da sessão
   * @param {string} userHash - Hash do usuário
   * @param {object} response - Resposta do bot
   * @param {object} routing - Dados de roteamento
   */
  logBotResponse(sessionId, userHash, response, routing) {
    return this.logMessage({
      sessionId,
      userHash,
      type: 'bot',
      content: response.text || JSON.stringify(response),
      intentDetected: routing?.intent,
      confidenceScore: routing?.confidence,
      botRespondente: routing?.targetBot,
      tempoResposta: routing?.processingTimeMs,
      contexto: { type: response.type }
    });
  },

  /**
   * Limpa sessões antigas (para manutenção)
   * @param {number} daysOld - Dias de antiguidade
   */
  cleanOldSessions(daysOld = 30) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONVERSATION_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, deleted: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const timestampIndex = 3; // Coluna Timestamp
      let deletedCount = 0;
      
      // Percorre de trás para frente para não afetar índices
      for (let i = data.length - 1; i >= 1; i--) {
        const rowDate = new Date(data[i][timestampIndex]);
        if (rowDate < cutoffDate) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      
      return { success: true, deleted: deletedCount };
      
    } catch (error) {
      Logger.log(`[ConversationManager.cleanOldSessions] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   */
  getStatistics() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONVERSATION_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, totalMessages: 0, totalSessions: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const sessions = new Set();
      const users = new Set();
      const intents = {};
      const bots = {};
      
      for (let i = 1; i < data.length; i++) {
        sessions.add(data[i][1]); // ID_Sessao
        users.add(data[i][2]);    // ID_Usuario_Hash
        
        const intent = data[i][6];
        if (intent) intents[intent] = (intents[intent] || 0) + 1;
        
        const bot = data[i][8];
        if (bot) bots[bot] = (bots[bot] || 0) + 1;
      }
      
      return {
        success: true,
        totalMessages: data.length - 1,
        totalSessions: sessions.size,
        uniqueUsers: users.size,
        intentDistribution: intents,
        botUsage: bots,
        avgMessagesPerSession: ((data.length - 1) / sessions.size).toFixed(1)
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Conversation Manager
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de conversas
 */
function apiConversationInit() {
  return ConversationManager.initializeSheet();
}

/**
 * Obtém ou cria sessão para usuário
 * @param {string} userId - ID do usuário
 */
function apiGetSession(userId) {
  return ConversationManager.getOrCreateSession(userId);
}

/**
 * Processa mensagem com contexto completo
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 */
function apiProcessWithContext(message, userId) {
  return ConversationManager.processWithContext(message, userId);
}

/**
 * Obtém histórico de conversa
 * @param {string} sessionId - ID da sessão
 * @param {number} limit - Limite de mensagens
 */
function apiGetHistory(sessionId, limit) {
  return ConversationManager.getConversationHistory(sessionId, limit || 10);
}

/**
 * Obtém contexto formatado para IA
 * @param {string} sessionId - ID da sessão
 */
function apiGetContextForAI(sessionId) {
  return {
    success: true,
    context: ConversationManager.formatContextForAI(sessionId)
  };
}

/**
 * Detecta estado emocional da sessão
 * @param {string} sessionId - ID da sessão
 */
function apiDetectEmotion(sessionId) {
  return ConversationManager.detectEmotionalState(sessionId);
}

/**
 * Obtém resumo da sessão
 * @param {string} sessionId - ID da sessão
 */
function apiGetSessionSummary(sessionId) {
  return ConversationManager.getSessionSummary(sessionId);
}

/**
 * Registra mensagem manualmente
 * @param {object} params - Parâmetros da mensagem
 */
function apiLogMessage(params) {
  return ConversationManager.logMessage(params);
}

/**
 * Registra resposta do bot
 * @param {string} sessionId - ID da sessão
 * @param {string} userHash - Hash do usuário
 * @param {object} response - Resposta
 * @param {object} routing - Roteamento
 */
function apiLogBotResponse(sessionId, userHash, response, routing) {
  return ConversationManager.logBotResponse(sessionId, userHash, response, routing);
}

/**
 * Obtém estatísticas de conversas
 */
function apiConversationStats() {
  return ConversationManager.getStatistics();
}

/**
 * Limpa sessões antigas
 * @param {number} daysOld - Dias de antiguidade
 */
function apiCleanOldSessions(daysOld) {
  return ConversationManager.cleanOldSessions(daysOld || 30);
}


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL INTEGRADA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Processa mensagem completa: contexto + roteamento + resposta + log
 * Esta é a função principal que deve ser chamada pelo frontend
 * 
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário (será pseudonimizado)
 * @returns {object} Resposta completa com contexto
 */
function apiChatWithContext(message, userId) {
  const startTime = Date.now();
  
  try {
    // 1. Processa com contexto
    const processed = ConversationManager.processWithContext(message, userId);
    
    if (!processed.success) {
      return processed;
    }
    
    // 2. Executa o handler do bot apropriado
    let botResponse;
    const routing = processed.routing;
    
    // Injeta contexto se for usar IA
    const contextEnhancedMessage = processed.context.formatted + 
      `\n**MENSAGEM ATUAL DO USUÁRIO:**\n"${message}"`;
    
    try {
      // Mapa de handlers
      if (routing.action === 'DISAMBIGUATE' || routing.action === 'CLARIFY') {
        botResponse = {
          text: routing.message,
          type: routing.action.toLowerCase(),
          options: routing.options
        };
      } else {
        // Chama o bot apropriado
        const handlerResult = _executeHandler(routing.handler, message, {
          context: processed.context,
          session: processed.session,
          emotionalState: processed.context.emotionalState
        });
        
        botResponse = handlerResult.response || handlerResult;
      }
    } catch (handlerError) {
      Logger.log(`[apiChatWithContext] Erro no handler: ${handlerError}`);
      botResponse = {
        text: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?',
        type: 'error'
      };
    }
    
    // 3. Registra resposta do bot
    const session = ConversationManager.getOrCreateSession(userId);
    ConversationManager.logBotResponse(
      session.sessionId,
      session.userHash,
      botResponse,
      routing
    );
    
    const totalTime = Date.now() - startTime;
    
    return {
      success: true,
      response: botResponse,
      session: {
        id: processed.session.id,
        isResumed: processed.session.isResumed,
        messageCount: processed.session.messageCount
      },
      routing: {
        intent: routing.intent,
        bot: routing.targetBot,
        confidence: routing.confidence
      },
      context: {
        emotionalState: processed.context.emotionalState,
        hasHistory: processed.context.formatted.length > 0
      },
      processingTimeMs: totalTime
    };
    
  } catch (error) {
    Logger.log(`[apiChatWithContext] Erro geral: ${error}`);
    return {
      success: false,
      error: error.message,
      response: {
        text: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
        type: 'error'
      }
    };
  }
}

/**
 * Executa handler do bot
 * @private
 */
function _executeHandler(handler, message, context) {
  const handlers = {
    'biodiversidade': () => typeof apiBioChatbot !== 'undefined' ? 
      apiBioChatbot(message, context) : { text: 'BioBot indisponível' },
    'terapia': () => typeof apiTherapyChatbotMessage !== 'undefined' ? 
      apiTherapyChatbotMessage(message, context) : { text: 'Serena indisponível' },
    'agrofloresta': () => typeof apiAgroChatbot !== 'undefined' ? 
      apiAgroChatbot(message, context) : { text: 'AgroBot indisponível' },
    'geolocalizacao': () => typeof apiGeoChatbot !== 'undefined' ? 
      apiGeoChatbot(message, context) : { text: 'GeoBot indisponível' },
    'educacao': () => typeof apiEduChatbot !== 'undefined' ? 
      apiEduChatbot(message, context) : { text: 'EduBot indisponível' },
    'ecoturismo': () => typeof apiTourChatbot !== 'undefined' ? 
      apiTourChatbot(message, context) : { text: 'TourBot indisponível' },
    'monitoramento': () => typeof apiSensorChatbot !== 'undefined' ? 
      apiSensorChatbot(message, context) : { text: 'SensorBot indisponível' }
  };
  
  const handlerFn = handlers[handler];
  if (handlerFn) {
    return handlerFn();
  }
  
  return { text: 'Handler não encontrado', type: 'error' };
}
