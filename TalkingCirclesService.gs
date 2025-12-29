/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TALKING CIRCLES SERVICE - Sistema de Rodas de Conversa
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Implementação de Rodas de Conversa (Talking Circles) para a Reserva Araras.
 * Tecnologia social ancestral adaptada para facilitação digital.
 * 
 * Funcionalidades:
 * - Criação e gestão de círculos
 * - Facilitação híbrida (presencial + digital)
 * - Gestão do "Bastão da Fala" (Talking Piece)
 * - Temas terapêuticos e reflexivos
 * - Síntese emocional anônima
 * - Fechamento com gratidão coletiva
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Schema da planilha RODAS_CONVERSA_RA
 */
const TALKING_CIRCLES_SCHEMA = {
  sheetName: 'RODAS_CONVERSA_RA',
  headers: [
    'ID_Roda', 'Titulo', 'Tema', 'Data_Hora', 'Tipo', 'Status',
    'Facilitador', 'Num_Participantes', 'Duracao_min',
    'Temas_Emergentes_JSON', 'Sentimentos_JSON', 'Feedback_Geral'
  ]
};

/**
 * Schema da planilha PARTICIPACOES_RODA_RA
 */
const CIRCLE_PARTICIPATION_SCHEMA = {
  sheetName: 'PARTICIPACOES_RODA_RA',
  headers: [
    'ID_Participacao', 'ID_Roda', 'ID_Participante_Hash', 'Ordem_Fala',
    'Timestamp_Inicio', 'Timestamp_Fim', 'Duracao_seg',
    'Sentimento_Detectado', 'Participou_Fechamento'
  ]
};

/**
 * Serviço de Rodas de Conversa
 * @namespace TalkingCirclesService
 */
const TalkingCirclesService = {

  /**
   * Configurações
   */
  CONFIG: {
    minParticipants: 3,
    maxParticipants: 12,
    defaultDurationMin: 60,
    speakingTimeMin: 3,
    speakingTimeMax: 10
  },

  /**
   * Tipos de Roda
   */
  CIRCLE_TYPES: {
    PRESENCIAL: 'presencial',
    VIRTUAL: 'virtual',
    HIBRIDO: 'hibrido'
  },

  /**
   * Status da Roda
   */
  CIRCLE_STATUS: {
    AGENDADA: 'agendada',
    EM_ANDAMENTO: 'em_andamento',
    PAUSADA: 'pausada',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
  },

  /**
   * Biblioteca de Temas para Rodas
   */
  THEMES: {
    natureza_resiliencia: {
      id: 'natureza_resiliencia',
      titulo: 'Resiliência da Natureza',
      pergunta_central: 'O que a natureza te ensinou sobre resiliência?',
      perguntas_apoio: [
        'Que momento difícil você superou, assim como a floresta supera o fogo?',
        'Qual "estação seca" da sua vida te preparou para florescer?',
        'Como você se regenera após adversidades?'
      ],
      elementos_natureza: ['fogo', 'seca', 'tempestade', 'regeneração'],
      emoji: '🌱'
    },
    
    raizes_pertencimento: {
      id: 'raizes_pertencimento',
      titulo: 'Raízes e Pertencimento',
      pergunta_central: 'Onde estão suas raízes? O que te faz sentir que pertence?',
      perguntas_apoio: [
        'Que lugar te faz sentir em casa?',
        'Quem são as pessoas que te sustentam como raízes sustentam uma árvore?',
        'O que você herdou de seus ancestrais que te fortalece?'
      ],
      elementos_natureza: ['raízes', 'terra', 'ancestralidade'],
      emoji: '🌳'
    },

    ciclos_mudanca: {
      id: 'ciclos_mudanca',
      titulo: 'Ciclos e Mudanças',
      pergunta_central: 'Que ciclo está se encerrando ou começando na sua vida?',
      perguntas_apoio: [
        'O que você precisa deixar morrer para que algo novo nasça?',
        'Que "folhas" você está pronto para soltar?',
        'Qual semente você está plantando para o futuro?'
      ],
      elementos_natureza: ['estações', 'lua', 'folhas', 'sementes'],
      emoji: '🍂'
    },
    
    agua_emocoes: {
      id: 'agua_emocoes',
      titulo: 'Água e Emoções',
      pergunta_central: 'Se suas emoções fossem água, como estariam fluindo agora?',
      perguntas_apoio: [
        'Você está em um momento de correnteza forte ou águas calmas?',
        'Que emoção está represada precisando fluir?',
        'Como você pode ser mais como a água - adaptável e persistente?'
      ],
      elementos_natureza: ['rio', 'chuva', 'nascente', 'mar'],
      emoji: '💧'
    },
    
    luz_sombra: {
      id: 'luz_sombra',
      titulo: 'Luz e Sombra',
      pergunta_central: 'O que está na luz e o que está na sombra da sua vida agora?',
      perguntas_apoio: [
        'Que parte de você precisa de mais luz?',
        'O que a sombra te ensina sobre descanso e introspecção?',
        'Como você equilibra momentos de exposição e recolhimento?'
      ],
      elementos_natureza: ['sol', 'lua', 'amanhecer', 'anoitecer'],
      emoji: '🌓'
    },
    
    conexao_comunidade: {
      id: 'conexao_comunidade',
      titulo: 'Conexão e Comunidade',
      pergunta_central: 'Como você se conecta com os outros e com a natureza?',
      perguntas_apoio: [
        'Quem são sua "floresta" - as pessoas que te cercam e sustentam?',
        'Como você contribui para o ecossistema ao seu redor?',
        'Que tipo de "polinizador" você é nas suas relações?'
      ],
      elementos_natureza: ['floresta', 'micorrizas', 'polinização', 'simbiose'],
      emoji: '🤝'
    },
    
    gratidao_abundancia: {
      id: 'gratidao_abundancia',
      titulo: 'Gratidão e Abundância',
      pergunta_central: 'Pelo que você é grato hoje? Onde está a abundância na sua vida?',
      perguntas_apoio: [
        'Que "frutos" você colheu recentemente?',
        'O que a natureza te oferece de graça que você às vezes esquece?',
        'Como você pode cultivar mais gratidão no dia a dia?'
      ],
      elementos_natureza: ['frutos', 'colheita', 'fartura', 'dádiva'],
      emoji: '🙏'
    },
    
    cura_transformacao: {
      id: 'cura_transformacao',
      titulo: 'Cura e Transformação',
      pergunta_central: 'O que está em processo de cura ou transformação em você?',
      perguntas_apoio: [
        'Que ferida está cicatrizando?',
        'Como a lagarta, o que você está deixando para trás ao se transformar?',
        'Que borboleta está emergindo de você?'
      ],
      elementos_natureza: ['metamorfose', 'casulo', 'cicatrização', 'renovação'],
      emoji: '🦋'
    }
  },

  /**
   * Scripts de Facilitação
   */
  FACILITATION_SCRIPTS: {
    
    abertura: {
      id: 'abertura',
      name: 'Abertura do Círculo',
      script: `🔵 **Abertura da Roda de Conversa**

Bem-vindos ao nosso círculo.

*O facilitador acende uma vela ou coloca um elemento natural no centro*

Estamos aqui para criar um espaço seguro de escuta e partilha.

**Acordos do Círculo:**

1. 🎯 **Falar do coração** - Compartilhe sua verdade, não teorias
2. 👂 **Escutar do coração** - Ouça sem preparar respostas
3. 🤐 **Confidencialidade** - O que é dito aqui, fica aqui
4. ⏱️ **Respeitar o tempo** - Seja conciso para que todos falem
5. 🙊 **Sem interrupções** - Quem tem o bastão, tem a palavra
6. 💚 **Sem julgamentos** - Acolhemos todas as experiências

**O Bastão da Fala:**
Este objeto representa o direito de falar.
Quem o segura, fala. Os outros, escutam.
Quando terminar, passe para o próximo.

Vamos começar com uma respiração juntos...
*Três respirações profundas coletivas*

O círculo está aberto. 🌿`
    },

    passagem_bastao: {
      id: 'passagem_bastao',
      name: 'Passagem do Bastão',
      getScript: (currentSpeaker, nextSpeaker) => `
🎤 **Passagem do Bastão**

${currentSpeaker ? `Obrigado, ${currentSpeaker}, por compartilhar.` : ''}

Agora é a vez de **${nextSpeaker}** falar.

*Todos os outros, pratiquem a escuta profunda.*
*Não preparem respostas enquanto ouvem.*
*Apenas estejam presentes.*

${nextSpeaker}, quando estiver pronto(a), pode começar. 💚`
    },

    escuta_profunda: {
      id: 'escuta_profunda',
      name: 'Lembrete de Escuta Profunda',
      script: `👂 **Escuta Profunda**

Enquanto alguém fala, pratique:

• **Presença total** - Esteja aqui, não na sua cabeça
• **Corpo relaxado** - Solte tensões, abra o coração
• **Sem julgamento** - Cada experiência é válida
• **Sem conselho** - Não é hora de resolver, é hora de acolher
• **Silêncio interno** - Não prepare sua fala enquanto ouve

A escuta é um presente que damos ao outro. 🎁`
    },

    sintese: {
      id: 'sintese',
      name: 'Síntese do Facilitador',
      getScript: (themes, feelings) => `
📝 **Síntese do Círculo**

*O facilitador reflete o que emergiu, sem identificar indivíduos*

Neste círculo, emergiram temas de:
${themes.map(t => `• ${t}`).join('\n')}

Sentimentos que circularam:
${feelings.map(f => `• ${f}`).join('\n')}

Cada voz trouxe uma peça do mosaico.
Juntas, formam algo maior que a soma das partes.

Obrigado por trazerem suas verdades. 🙏`
    },

    fechamento: {
      id: 'fechamento',
      name: 'Fechamento do Círculo',
      script: `🔴 **Fechamento da Roda**

Nosso círculo está chegando ao fim.

**Rodada de Gratidão:**
Em uma palavra ou frase curta, compartilhe:
*"Sou grato(a) por..."*

*Cada pessoa fala brevemente, passando o bastão*

---

**Encerramento:**

Assim como a natureza opera em ciclos,
este círculo se fecha para que outros possam se abrir.

O que foi compartilhado aqui permanece sagrado.
Levem consigo o que ressoa.
Deixem aqui o que não serve mais.

*O facilitador apaga a vela ou recolhe o elemento central*

O círculo está fechado.
Mas a conexão permanece.

Até o próximo encontro. 💚🌿`
    },

    emergencia_emocional: {
      id: 'emergencia_emocional',
      name: 'Suporte para Emoção Intensa',
      script: `💚 **Momento de Acolhimento**

Percebo que há emoção intensa presente.
Isso é bem-vindo aqui.

*Para quem está sentindo:*
Respire. Você está seguro(a).
Não precisa explicar nem controlar.
Estamos aqui com você.

*Para o grupo:*
Vamos segurar este espaço juntos.
Respirem com a pessoa.
Presença silenciosa é suficiente.

*Pausa de 30 segundos*

Quando estiver pronto(a), pode continuar ou passar o bastão.
Não há pressão. 🌿`
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS DE GESTÃO DE CÍRCULOS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Inicializa planilhas
   */
  initializeSheets() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de Rodas
      let sheet1 = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      if (!sheet1) {
        sheet1 = ss.insertSheet(TALKING_CIRCLES_SCHEMA.sheetName);
        sheet1.appendRow(TALKING_CIRCLES_SCHEMA.headers);
        const headerRange = sheet1.getRange(1, 1, 1, TALKING_CIRCLES_SCHEMA.headers.length);
        headerRange.setBackground('#6A1B9A');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet1.setFrozenRows(1);
      }
      
      // Planilha de Participações
      let sheet2 = ss.getSheetByName(CIRCLE_PARTICIPATION_SCHEMA.sheetName);
      if (!sheet2) {
        sheet2 = ss.insertSheet(CIRCLE_PARTICIPATION_SCHEMA.sheetName);
        sheet2.appendRow(CIRCLE_PARTICIPATION_SCHEMA.headers);
        const headerRange = sheet2.getRange(1, 1, 1, CIRCLE_PARTICIPATION_SCHEMA.headers.length);
        headerRange.setBackground('#7B1FA2');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet2.setFrozenRows(1);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Cria nova Roda de Conversa
   * @param {object} params - Parâmetros da roda
   */
  createCircle(params) {
    try {
      const {
        titulo,
        themeId,
        dataHora,
        tipo = 'presencial',
        facilitador
      } = params;
      
      const theme = this.THEMES[themeId];
      if (!theme) {
        return { success: false, error: 'Tema não encontrado' };
      }
      
      const circleId = `RODA_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      this.initializeSheets();
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      
      const row = [
        circleId,
        titulo || theme.titulo,
        themeId,
        dataHora || new Date().toISOString(),
        tipo,
        this.CIRCLE_STATUS.AGENDADA,
        facilitador || 'Sistema',
        0,
        0,
        '[]',
        '[]',
        ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        circleId,
        theme,
        response: {
          text: `🔵 **Roda de Conversa Criada**\n\n` +
                `**${theme.emoji} ${titulo || theme.titulo}**\n\n` +
                `📋 Tema: ${theme.titulo}\n` +
                `❓ Pergunta Central:\n*"${theme.pergunta_central}"*\n\n` +
                `📅 Data/Hora: ${dataHora || 'A definir'}\n` +
                `📍 Tipo: ${tipo}\n\n` +
                `ID: ${circleId}`,
          type: 'circle_created'
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Inicia uma Roda de Conversa
   * @param {string} circleId - ID da roda
   */
  startCircle(circleId) {
    try {
      const circle = this._getCircle(circleId);
      if (!circle) {
        return { success: false, error: 'Roda não encontrada' };
      }
      
      const theme = this.THEMES[circle.tema];
      
      // Atualiza status
      this._updateCircleStatus(circleId, this.CIRCLE_STATUS.EM_ANDAMENTO);
      
      return {
        success: true,
        circleId,
        response: {
          text: this.FACILITATION_SCRIPTS.abertura.script + 
                `\n\n---\n\n` +
                `**${theme.emoji} Tema de Hoje: ${theme.titulo}**\n\n` +
                `**Pergunta Central:**\n` +
                `*"${theme.pergunta_central}"*\n\n` +
                `**Perguntas de Apoio:**\n` +
                theme.perguntas_apoio.map((p, i) => `${i + 1}. ${p}`).join('\n') +
                `\n\nQuem gostaria de começar? 🌿`,
          type: 'circle_started',
          theme: theme
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Passa o bastão para próximo participante
   * @param {string} circleId - ID da roda
   * @param {string} currentSpeaker - Falante atual (opcional)
   * @param {string} nextSpeaker - Próximo falante
   */
  passTalkingPiece(circleId, currentSpeaker, nextSpeaker) {
    const script = this.FACILITATION_SCRIPTS.passagem_bastao.getScript(
      currentSpeaker, 
      nextSpeaker
    );
    
    // Registra participação
    if (currentSpeaker) {
      this._logParticipation(circleId, currentSpeaker);
    }
    
    return {
      success: true,
      response: {
        text: script,
        type: 'talking_piece_passed',
        currentSpeaker,
        nextSpeaker
      }
    };
  },

  /**
   * Registra participação
   * @private
   */
  _logParticipation(circleId, participantId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CIRCLE_PARTICIPATION_SCHEMA.sheetName);
      
      const participationId = `PART_${Date.now()}`;
      const userHash = typeof ConversationManager !== 'undefined' ?
                      ConversationManager.hashUserId(participantId) :
                      participantId.substring(0, 8);
      
      const row = [
        participationId,
        circleId,
        userHash,
        '', // ordem será calculada
        new Date().toISOString(),
        '',
        0,
        '',
        false
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (e) {
      Logger.log(`[_logParticipation] Erro: ${e}`);
      return false;
    }
  },

  /**
   * Gera síntese do círculo (sem identificar indivíduos)
   * @param {string} circleId - ID da roda
   * @param {array} themes - Temas emergentes
   * @param {array} feelings - Sentimentos detectados
   */
  generateSynthesis(circleId, themes = [], feelings = []) {
    // Temas padrão se não fornecidos
    if (themes.length === 0) {
      themes = ['conexão', 'transformação', 'esperança'];
    }
    if (feelings.length === 0) {
      feelings = ['vulnerabilidade', 'gratidão', 'pertencimento'];
    }
    
    const script = this.FACILITATION_SCRIPTS.sintese.getScript(themes, feelings);
    
    // Salva na planilha
    this._updateCircleData(circleId, {
      temas_emergentes: themes,
      sentimentos: feelings
    });
    
    return {
      success: true,
      response: {
        text: script,
        type: 'circle_synthesis',
        themes,
        feelings
      }
    };
  },

  /**
   * Fecha a Roda de Conversa
   * @param {string} circleId - ID da roda
   */
  closeCircle(circleId) {
    try {
      this._updateCircleStatus(circleId, this.CIRCLE_STATUS.CONCLUIDA);
      
      return {
        success: true,
        response: {
          text: this.FACILITATION_SCRIPTS.fechamento.script,
          type: 'circle_closed'
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Oferece suporte para emoção intensa
   */
  offerEmotionalSupport() {
    return {
      success: true,
      response: {
        text: this.FACILITATION_SCRIPTS.emergencia_emocional.script,
        type: 'emotional_support'
      }
    };
  },

  /**
   * Lembrete de escuta profunda
   */
  remindDeepListening() {
    return {
      success: true,
      response: {
        text: this.FACILITATION_SCRIPTS.escuta_profunda.script,
        type: 'deep_listening_reminder'
      }
    };
  },

  /**
   * Lista temas disponíveis
   */
  listThemes() {
    const themes = Object.entries(this.THEMES).map(([id, theme]) => ({
      id,
      titulo: theme.titulo,
      pergunta_central: theme.pergunta_central,
      emoji: theme.emoji
    }));
    
    return { success: true, themes };
  },

  /**
   * Obtém tema específico
   * @param {string} themeId - ID do tema
   */
  getTheme(themeId) {
    const theme = this.THEMES[themeId];
    if (theme) {
      return { success: true, theme };
    }
    return { success: false, error: 'Tema não encontrado' };
  },

  /**
   * Sugere tema baseado em contexto
   * @param {string} context - Contexto (ex: 'mudança', 'perda', 'celebração')
   */
  suggestTheme(context) {
    const contextMap = {
      'mudança': 'ciclos_mudanca',
      'transição': 'ciclos_mudanca',
      'perda': 'agua_emocoes',
      'luto': 'agua_emocoes',
      'dificuldade': 'natureza_resiliencia',
      'desafio': 'natureza_resiliencia',
      'família': 'raizes_pertencimento',
      'origem': 'raizes_pertencimento',
      'celebração': 'gratidao_abundancia',
      'conquista': 'gratidao_abundancia',
      'cura': 'cura_transformacao',
      'transformação': 'cura_transformacao',
      'comunidade': 'conexao_comunidade',
      'grupo': 'conexao_comunidade',
      'equilíbrio': 'luz_sombra',
      'introspecção': 'luz_sombra'
    };
    
    const lowerContext = context.toLowerCase();
    let suggestedId = 'gratidao_abundancia'; // default
    
    for (const [key, themeId] of Object.entries(contextMap)) {
      if (lowerContext.includes(key)) {
        suggestedId = themeId;
        break;
      }
    }
    
    const theme = this.THEMES[suggestedId];
    
    return {
      success: true,
      suggestedTheme: theme,
      reason: `Baseado no contexto "${context}", sugiro o tema "${theme.titulo}"`,
      response: {
        text: `${theme.emoji} **Tema Sugerido: ${theme.titulo}**\n\n` +
              `**Pergunta Central:**\n*"${theme.pergunta_central}"*\n\n` +
              `Este tema parece adequado para o contexto que você mencionou.\n\n` +
              `Gostaria de criar uma roda com este tema?`,
        type: 'theme_suggestion'
      }
    };
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtém dados de uma roda
   * @private
   */
  _getCircle(circleId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === circleId) {
          return {
            id: data[i][0],
            titulo: data[i][1],
            tema: data[i][2],
            dataHora: data[i][3],
            tipo: data[i][4],
            status: data[i][5],
            facilitador: data[i][6],
            numParticipantes: data[i][7],
            duracao: data[i][8]
          };
        }
      }
      
      return null;
    } catch (e) {
      Logger.log(`[_getCircle] Erro: ${e}`);
      return null;
    }
  },

  /**
   * Atualiza status da roda
   * @private
   */
  _updateCircleStatus(circleId, newStatus) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === circleId) {
          sheet.getRange(i + 1, 6).setValue(newStatus);
          return true;
        }
      }
      
      return false;
    } catch (e) {
      Logger.log(`[_updateCircleStatus] Erro: ${e}`);
      return false;
    }
  },

  /**
   * Atualiza dados da roda
   * @private
   */
  _updateCircleData(circleId, data) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      
      const sheetData = sheet.getDataRange().getValues();
      
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][0] === circleId) {
          if (data.temas_emergentes) {
            sheet.getRange(i + 1, 10).setValue(JSON.stringify(data.temas_emergentes));
          }
          if (data.sentimentos) {
            sheet.getRange(i + 1, 11).setValue(JSON.stringify(data.sentimentos));
          }
          return true;
        }
      }
      
      return false;
    } catch (e) {
      Logger.log(`[_updateCircleData] Erro: ${e}`);
      return false;
    }
  },

  /**
   * Obtém estatísticas de rodas
   */
  getStatistics() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(TALKING_CIRCLES_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, totalCircles: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      
      let total = 0;
      let concluidas = 0;
      let totalParticipantes = 0;
      const themeCount = {};
      
      for (let i = 1; i < data.length; i++) {
        total++;
        if (data[i][5] === this.CIRCLE_STATUS.CONCLUIDA) concluidas++;
        totalParticipantes += data[i][7] || 0;
        
        const tema = data[i][2];
        themeCount[tema] = (themeCount[tema] || 0) + 1;
      }
      
      return {
        success: true,
        totalCircles: total,
        completedCircles: concluidas,
        totalParticipants: totalParticipantes,
        avgParticipantsPerCircle: total > 0 ? (totalParticipantes / total).toFixed(1) : 0,
        themeDistribution: themeCount
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Talking Circles Service
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de Rodas de Conversa
 */
function apiTalkingCirclesInit() {
  return TalkingCirclesService.initializeSheets();
}

/**
 * Lista temas disponíveis para rodas
 */
function apiTalkingCirclesListThemes() {
  return TalkingCirclesService.listThemes();
}

/**
 * Obtém tema específico
 * @param {string} themeId - ID do tema
 */
function apiTalkingCirclesGetTheme(themeId) {
  return TalkingCirclesService.getTheme(themeId);
}

/**
 * Sugere tema baseado em contexto
 * @param {string} context - Contexto/situação
 */
function apiTalkingCirclesSuggestTheme(context) {
  return TalkingCirclesService.suggestTheme(context);
}

/**
 * Cria nova Roda de Conversa
 * @param {object} params - {titulo, themeId, dataHora, tipo, facilitador}
 */
function apiTalkingCirclesCreate(params) {
  return TalkingCirclesService.createCircle(params);
}

/**
 * Inicia uma Roda de Conversa
 * @param {string} circleId - ID da roda
 */
function apiTalkingCirclesStart(circleId) {
  return TalkingCirclesService.startCircle(circleId);
}

/**
 * Passa o bastão da fala
 * @param {string} circleId - ID da roda
 * @param {string} currentSpeaker - Falante atual
 * @param {string} nextSpeaker - Próximo falante
 */
function apiTalkingCirclesPassPiece(circleId, currentSpeaker, nextSpeaker) {
  return TalkingCirclesService.passTalkingPiece(circleId, currentSpeaker, nextSpeaker);
}

/**
 * Gera síntese do círculo
 * @param {string} circleId - ID da roda
 * @param {array} themes - Temas emergentes
 * @param {array} feelings - Sentimentos detectados
 */
function apiTalkingCirclesSynthesis(circleId, themes, feelings) {
  return TalkingCirclesService.generateSynthesis(circleId, themes, feelings);
}

/**
 * Fecha a Roda de Conversa
 * @param {string} circleId - ID da roda
 */
function apiTalkingCirclesClose(circleId) {
  return TalkingCirclesService.closeCircle(circleId);
}

/**
 * Oferece suporte emocional
 */
function apiTalkingCirclesEmotionalSupport() {
  return TalkingCirclesService.offerEmotionalSupport();
}

/**
 * Lembrete de escuta profunda
 */
function apiTalkingCirclesDeepListening() {
  return TalkingCirclesService.remindDeepListening();
}

/**
 * Obtém estatísticas de rodas
 */
function apiTalkingCirclesStats() {
  return TalkingCirclesService.getStatistics();
}

/**
 * Fluxo completo de facilitação via chatbot
 * @param {string} action - Ação: 'create', 'start', 'pass', 'synthesis', 'close'
 * @param {object} params - Parâmetros da ação
 */
function apiTalkingCirclesFacilitate(action, params = {}) {
  switch (action) {
    case 'create':
      return TalkingCirclesService.createCircle(params);
    case 'start':
      return TalkingCirclesService.startCircle(params.circleId);
    case 'pass':
      return TalkingCirclesService.passTalkingPiece(
        params.circleId, 
        params.currentSpeaker, 
        params.nextSpeaker
      );
    case 'synthesis':
      return TalkingCirclesService.generateSynthesis(
        params.circleId,
        params.themes,
        params.feelings
      );
    case 'close':
      return TalkingCirclesService.closeCircle(params.circleId);
    case 'support':
      return TalkingCirclesService.offerEmotionalSupport();
    case 'listening':
      return TalkingCirclesService.remindDeepListening();
    default:
      return { 
        success: false, 
        error: 'Ação não reconhecida',
        availableActions: ['create', 'start', 'pass', 'synthesis', 'close', 'support', 'listening']
      };
  }
}
