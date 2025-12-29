/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - CHATBOT TERAPÊUTICO INTEGRADO
 * ═══════════════════════════════════════════════════════════════════════════
 * Chatbot de Apoio Terapêutico com Gemini AI
 * 
 * Funcionalidades:
 * - Suporte emocional e bem-estar
 * - Exercícios de mindfulness guiados
 * - Informações sobre terapias na natureza
 * - Avaliação de humor e estado emocional
 * - Recomendações terapêuticas personalizadas
 * - Integração com TherapyService
 * 
 * IMPORTANTE: Este chatbot NÃO substitui atendimento profissional de saúde mental.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Schema de dados para planilha CHATBOT_TERAPIA_RA
 */
const SCHEMA_CHATBOT_TERAPIA = {
  ID_Conversa: { type: 'string', required: true, unique: true },
  ID_Participante: { type: 'string' },
  Timestamp_Inicio: { type: 'datetime', required: true },
  Timestamp_Fim: { type: 'datetime' },
  Total_Mensagens: { type: 'integer' },
  Humor_Inicial: { type: 'enum', values: ['Muito_Mal', 'Mal', 'Neutro', 'Bem', 'Muito_Bem'] },
  Humor_Final: { type: 'enum', values: ['Muito_Mal', 'Mal', 'Neutro', 'Bem', 'Muito_Bem'] },
  Topicos_JSON: { type: 'text' },
  Exercicios_Realizados: { type: 'integer' },
  Duracao_min: { type: 'float' },
  Satisfacao: { type: 'integer', range: [1, 5] }
};

const CHATBOT_TERAPIA_HEADERS = [
  'ID_Conversa', 'ID_Participante', 'Timestamp_Inicio', 'Timestamp_Fim',
  'Total_Mensagens', 'Humor_Inicial', 'Humor_Final', 'Topicos_JSON',
  'Exercicios_Realizados', 'Duracao_min', 'Satisfacao'
];


/**
 * Chatbot Terapêutico Serena
 * @namespace TherapyChatbot
 */
const TherapyChatbot = {
  
  SHEET_NAME: 'CHATBOT_TERAPIA_RA',
  BOT_NAME: 'Serena',
  
  /**
   * Base de conhecimento terapêutico
   */
  KNOWLEDGE_BASE: {
    terapias: {
      banho_floresta: {
        nome: 'Banho de Floresta (Shinrin-yoku)',
        duracao: '60-90 min',
        beneficios: ['Redução do cortisol', 'Melhora da imunidade', 'Aumento da calma', 'Conexão com a natureza'],
        indicacoes: ['Estresse', 'Ansiedade', 'Esgotamento', 'Desconexão'],
        descricao: 'Imersão sensorial consciente na floresta, praticando a presença plena'
      },
      meditacao: {
        nome: 'Meditação na Natureza',
        duracao: '20-45 min',
        beneficios: ['Clareza mental', 'Redução da ansiedade', 'Equilíbrio emocional', 'Foco'],
        indicacoes: ['Agitação mental', 'Dificuldade de concentração', 'Estresse'],
        descricao: 'Práticas meditativas guiadas em ambientes naturais tranquilos'
      },
      arteterapia: {
        nome: 'Arte-terapia ao Ar Livre',
        duracao: '60-120 min',
        beneficios: ['Expressão emocional', 'Criatividade', 'Processamento de emoções', 'Relaxamento'],
        indicacoes: ['Bloqueios emocionais', 'Dificuldade de expressão', 'Trauma'],
        descricao: 'Atividades artísticas utilizando elementos naturais como inspiração'
      },
      ecoterapia: {
        nome: 'Ecoterapia',
        duracao: '90-180 min',
        beneficios: ['Bem-estar geral', 'Redução sintomas depressivos', 'Aumento da vitalidade'],
        indicacoes: ['Depressão leve/moderada', 'Ansiedade', 'Síndrome de burnout'],
        descricao: 'Atividades terapêuticas estruturadas em ambiente natural'
      },
      hidroterapia: {
        nome: 'Hidroterapia Natural',
        duracao: '45-60 min',
        beneficios: ['Relaxamento muscular', 'Alívio de tensões', 'Sensação de bem-estar'],
        indicacoes: ['Tensão física', 'Insônia', 'Dores crônicas'],
        descricao: 'Imersão em águas naturais da reserva com técnicas de relaxamento'
      }
    },
    
    exercicios_rapidos: {
      respiracao_4_7_8: {
        nome: 'Respiração 4-7-8',
        duracao: '2 min',
        passos: [
          'Inspire pelo nariz contando até 4',
          'Segure a respiração contando até 7',
          'Expire lentamente pela boca contando até 8',
          'Repita 4 vezes'
        ],
        beneficio: 'Acalma o sistema nervoso rapidamente'
      },
      grounding_5_4_3_2_1: {
        nome: 'Grounding 5-4-3-2-1',
        duracao: '3 min',
        passos: [
          'Observe 5 coisas que você pode VER',
          'Toque 4 coisas diferentes',
          'Ouça 3 sons ao seu redor',
          'Identifique 2 cheiros',
          'Note 1 sabor na sua boca'
        ],
        beneficio: 'Traz você de volta ao momento presente'
      },
      relaxamento_muscular: {
        nome: 'Relaxamento Muscular Progressivo',
        duracao: '5 min',
        passos: [
          'Tensione os músculos dos pés por 5 segundos',
          'Relaxe completamente',
          'Suba para panturrilhas, coxas, abdômen...',
          'Continue até o rosto',
          'Sinta o corpo relaxado'
        ],
        beneficio: 'Alivia tensão física e mental'
      },
      visualizacao_natureza: {
        nome: 'Visualização da Natureza',
        duracao: '4 min',
        passos: [
          'Feche os olhos e respire profundamente',
          'Imagine-se em uma clareira tranquila do Cerrado',
          'Sinta o sol aquecendo sua pele',
          'Ouça os pássaros e o vento nas folhas',
          'Permaneça neste lugar seguro'
        ],
        beneficio: 'Reduz ansiedade e promove calma'
      }
    },
    
    frases_apoio: [
      'Você está fazendo o melhor que pode, e isso é o suficiente. 💚',
      'Cada passo em direção ao bem-estar é uma vitória. 🌱',
      'A natureza ensina: tudo tem seu tempo de florescer. 🌸',
      'Você merece momentos de paz e tranquilidade. 🍃',
      'Respirar profundamente é um ato de autocuidado. 🌬️',
      'Assim como as árvores, você tem raízes fortes. 🌳',
      'O sol sempre volta depois da chuva. ☀️'
    ]
  },

  /**
   * Intenções reconhecidas
   */
  INTENTS: {
    saudacao: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey'],
    despedida: ['tchau', 'até mais', 'adeus', 'bye', 'obrigado', 'obrigada'],
    ansiedade: ['ansiedade', 'ansioso', 'ansiosa', 'nervoso', 'nervosa', 'preocupado', 'preocupada', 'agitado'],
    estresse: ['estresse', 'estressado', 'estressada', 'cansado', 'cansada', 'esgotado', 'esgotada', 'burnout'],
    tristeza: ['triste', 'tristeza', 'deprimido', 'deprimida', 'desanimado', 'desanimada', 'pra baixo'],
    raiva: ['raiva', 'irritado', 'irritada', 'bravo', 'brava', 'frustrado', 'frustrada'],
    calma: ['calma', 'relaxar', 'tranquilidade', 'paz', 'acalmar', 'sossego'],
    respiracao: ['respirar', 'respiração', 'respire', 'fôlego'],
    meditacao: ['meditar', 'meditação', 'mindfulness', 'atenção plena'],
    terapia: ['terapia', 'tratamento', 'sessão', 'ajuda profissional'],
    exercicio: ['exercício', 'praticar', 'fazer algo', 'atividade'],
    natureza: ['natureza', 'floresta', 'ar livre', 'banho de floresta'],
    humor: ['como estou', 'meu humor', 'como me sinto', 'sentindo'],
    ajuda: ['ajuda', 'help', 'o que você faz', 'como funciona']
  },

  /**
   * Inicializa planilha
   */
  initializeSheet() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(CHATBOT_TERAPIA_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, CHATBOT_TERAPIA_HEADERS.length);
        headerRange.setBackground('#7B1FA2'); // Roxo para terapia
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Processa mensagem do usuário
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto da conversa
   */
  processMessage(message, context = {}) {
    try {
      const lowerMessage = message.toLowerCase().trim();
      
      // Detecta intenção
      const intent = this._detectIntent(lowerMessage);
      
      // Gera resposta baseada na intenção
      let response;
      
      switch (intent) {
        case 'saudacao':
          response = this._handleGreeting(context);
          break;
        case 'despedida':
          response = this._handleFarewell(context);
          break;
        case 'ansiedade':
          response = this._handleAnxiety();
          break;
        case 'estresse':
          response = this._handleStress();
          break;
        case 'tristeza':
          response = this._handleSadness();
          break;
        case 'raiva':
          response = this._handleAnger();
          break;
        case 'calma':
          response = this._handleCalmRequest();
          break;
        case 'respiracao':
          response = this._handleBreathingExercise();
          break;
        case 'meditacao':
          response = this._handleMeditation();
          break;
        case 'terapia':
          response = this._handleTherapyInfo();
          break;
        case 'exercicio':
          response = this._handleExerciseRequest();
          break;
        case 'natureza':
          response = this._handleNatureTherapy();
          break;
        case 'humor':
          response = this._handleMoodCheck(context);
          break;
        case 'ajuda':
          response = this._handleHelp();
          break;
        default:
          response = this._handleGeneralMessage(message, context);
      }
      
      // Adiciona sugestões
      response.suggestions = this._generateSuggestions(intent);
      response.intent = intent;
      
      // Adiciona frase de apoio aleatória ocasionalmente
      if (Math.random() < 0.3 && !['saudacao', 'despedida', 'ajuda'].includes(intent)) {
        const frases = this.KNOWLEDGE_BASE.frases_apoio;
        response.supportPhrase = frases[Math.floor(Math.random() * frases.length)];
      }
      
      return {
        success: true,
        response: response
      };
      
    } catch (error) {
      Logger.log(`[TherapyChatbot.processMessage] Erro: ${error}`);
      return {
        success: false,
        response: {
          text: 'Desculpe, tive um pequeno problema. Estou aqui para você. Como posso ajudar? 💚',
          suggestions: ['Como estou me sentindo', 'Preciso relaxar', 'Quero um exercício']
        }
      };
    }
  },

  /**
   * Detecta intenção do usuário
   * @private
   */
  _detectIntent(message) {
    for (const [intent, keywords] of Object.entries(this.INTENTS)) {
      if (keywords.some(kw => message.includes(kw))) {
        return intent;
      }
    }
    return 'geral';
  },

  /**
   * Trata saudação
   * @private
   */
  _handleGreeting(context) {
    const hora = new Date().getHours();
    let saudacao = 'Olá';
    if (hora < 12) saudacao = 'Bom dia';
    else if (hora < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';
    
    const greetings = [
      `${saudacao}! 💚 Sou ${this.BOT_NAME}, sua companhia para momentos de bem-estar.\n\nEstou aqui para:\n• 🧘 Guiar exercícios de relaxamento\n• 🌿 Compartilhar sobre terapias na natureza\n• 💭 Ouvir como você está se sentindo\n• 🌬️ Ensinar técnicas de respiração\n\nComo você está hoje?`,
      `${saudacao}! 🌿 Que bom ter você aqui.\n\nSou ${this.BOT_NAME}, e estou aqui para oferecer um momento de acolhimento e calma no seu dia.\n\nComo posso te ajudar agora?`,
      `${saudacao}! 💚 Bem-vindo(a) ao seu espaço de tranquilidade.\n\nSou ${this.BOT_NAME}, e minha missão é te apoiar no caminho do bem-estar.\n\nConte-me: como você está se sentindo?`
    ];
    
    return {
      text: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'greeting',
      showMoodCheck: true
    };
  },

  /**
   * Trata despedida
   * @private
   */
  _handleFarewell(context) {
    const farewells = [
      'Até mais! 💚 Lembre-se: cuidar de si mesmo é um ato de amor. Volte sempre que precisar de um momento de paz.',
      'Que você tenha um dia sereno! 🌿 Estou sempre aqui quando precisar de um respiro.',
      'Até a próxima! 🌱 Carregue consigo a tranquilidade que cultivamos aqui. Cuide-se!'
    ];
    
    return {
      text: farewells[Math.floor(Math.random() * farewells.length)],
      type: 'farewell'
    };
  },

  /**
   * Trata ansiedade
   * @private
   */
  _handleAnxiety() {
    const exercicio = this.KNOWLEDGE_BASE.exercicios_rapidos.respiracao_4_7_8;
    
    return {
      text: `Entendo que você está sentindo ansiedade. Isso é mais comum do que parece, e estou aqui com você. 💚\n\n` +
            `Vamos fazer algo juntos agora mesmo?\n\n` +
            `**${exercicio.nome}** (${exercicio.duracao})\n\n` +
            exercicio.passos.map((p, i) => `${i + 1}. ${p}`).join('\n') +
            `\n\n💡 ${exercicio.beneficio}\n\n` +
            `Tente fazer agora e me conte como se sentiu depois.`,
      type: 'anxiety_support',
      exerciseOffered: 'respiracao_4_7_8',
      actions: [
        { label: 'Fiz o exercício', action: 'exercise_done' },
        { label: 'Outro exercício', action: 'more_exercises' },
        { label: 'Falar com profissional', action: 'professional_help' }
      ]
    };
  },

  /**
   * Trata estresse
   * @private
   */
  _handleStress() {
    const terapia = this.KNOWLEDGE_BASE.terapias.banho_floresta;
    
    return {
      text: `O estresse pode ser muito desgastante, e reconhecer isso já é um passo importante. 🌿\n\n` +
            `A natureza pode ser uma grande aliada. Você sabia?\n\n` +
            `**${terapia.nome}**\n` +
            `⏱️ Duração: ${terapia.duracao}\n\n` +
            `**Benefícios comprovados:**\n` +
            terapia.beneficios.map(b => `• ${b}`).join('\n') +
            `\n\n${terapia.descricao}\n\n` +
            `Podemos fazer um exercício rápido agora para aliviar um pouco dessa tensão?`,
      type: 'stress_support',
      therapyOffered: 'banho_floresta',
      actions: [
        { label: 'Sim, vamos!', action: 'do_exercise' },
        { label: 'Saber mais sobre terapias', action: 'therapy_info' }
      ]
    };
  },

  /**
   * Trata tristeza
   * @private
   */
  _handleSadness() {
    return {
      text: `Sinto muito que você esteja se sentindo assim. 💚 A tristeza faz parte da nossa experiência humana, e está tudo bem senti-la.\n\n` +
            `Estou aqui para te acompanhar neste momento.\n\n` +
            `Algumas coisas que podem ajudar:\n\n` +
            `🌿 **Contato com a natureza** - mesmo olhar pela janela pode trazer alívio\n` +
            `🌬️ **Respiração consciente** - ajuda a acalmar o corpo e a mente\n` +
            `🎨 **Expressão criativa** - desenhar, escrever, o que sentir vontade\n` +
            `🤝 **Conexão humana** - conversar com alguém de confiança\n\n` +
            `Posso te guiar em um exercício de visualização reconfortante, se quiser.\n\n` +
            `⚠️ *Se a tristeza persistir ou for muito intensa, considere buscar apoio profissional. Isso é força, não fraqueza.*`,
      type: 'sadness_support',
      important: 'Se você estiver pensando em se machucar, por favor procure ajuda: CVV - 188 (24h)',
      actions: [
        { label: 'Fazer exercício de visualização', action: 'visualization' },
        { label: 'Técnica de respiração', action: 'breathing' },
        { label: 'Informações sobre ajuda profissional', action: 'professional_help' }
      ]
    };
  },

  /**
   * Trata raiva
   * @private
   */
  _handleAnger() {
    const exercicio = this.KNOWLEDGE_BASE.exercicios_rapidos.relaxamento_muscular;
    
    return {
      text: `A raiva é uma emoção poderosa e válida. O que importa é como lidamos com ela. 💚\n\n` +
            `Vamos canalizar essa energia de forma saudável?\n\n` +
            `**${exercicio.nome}** (${exercicio.duracao})\n\n` +
            exercicio.passos.map((p, i) => `${i + 1}. ${p}`).join('\n') +
            `\n\n💡 ${exercicio.beneficio}\n\n` +
            `A tensão física e emocional estão conectadas. Liberar uma ajuda a liberar a outra.`,
      type: 'anger_support',
      exerciseOffered: 'relaxamento_muscular',
      actions: [
        { label: 'Preciso me acalmar', action: 'calm_down' },
        { label: 'Quero outro exercício', action: 'more_exercises' }
      ]
    };
  },

  /**
   * Trata pedido de calma
   * @private
   */
  _handleCalmRequest() {
    const exercicio = this.KNOWLEDGE_BASE.exercicios_rapidos.visualizacao_natureza;
    
    return {
      text: `Vamos criar um momento de paz juntos. 🌿\n\n` +
            `**${exercicio.nome}** (${exercicio.duracao})\n\n` +
            exercicio.passos.map((p, i) => `${i + 1}. ${p}`).join('\n') +
            `\n\n💡 ${exercicio.beneficio}\n\n` +
            `Respire fundo e permita-se esse momento de tranquilidade.`,
      type: 'calm_support',
      exerciseOffered: 'visualizacao_natureza'
    };
  },

  /**
   * Trata exercício de respiração
   * @private
   */
  _handleBreathingExercise() {
    const exercicio = this.KNOWLEDGE_BASE.exercicios_rapidos.respiracao_4_7_8;
    
    return {
      text: `🌬️ **Vamos respirar juntos!**\n\n` +
            `**${exercicio.nome}**\n\n` +
            exercicio.passos.map((p, i) => `**${i + 1}.** ${p}`).join('\n\n') +
            `\n\n💚 Faça no seu ritmo. Não há pressa.\n\n` +
            `${exercicio.beneficio}`,
      type: 'breathing_exercise',
      exerciseOffered: 'respiracao_4_7_8',
      isExercise: true
    };
  },

  /**
   * Trata meditação
   * @private
   */
  _handleMeditation() {
    const terapia = this.KNOWLEDGE_BASE.terapias.meditacao;
    
    return {
      text: `🧘 **${terapia.nome}**\n\n` +
            `${terapia.descricao}\n\n` +
            `**Benefícios:**\n` +
            terapia.beneficios.map(b => `• ${b}`).join('\n') +
            `\n\n**Mini-meditação (2 minutos):**\n\n` +
            `1. Sente-se confortavelmente\n` +
            `2. Feche os olhos suavemente\n` +
            `3. Observe sua respiração natural\n` +
            `4. Quando pensamentos surgirem, gentilmente volte à respiração\n` +
            `5. Após 2 minutos, abra os olhos lentamente\n\n` +
            `💚 A prática regular traz benefícios duradouros.`,
      type: 'meditation_info',
      therapyOffered: 'meditacao'
    };
  },

  /**
   * Trata informações sobre terapia
   * @private
   */
  _handleTherapyInfo() {
    const terapias = Object.values(this.KNOWLEDGE_BASE.terapias);
    const lista = terapias.map(t => `• **${t.nome}** (${t.duracao})`).join('\n');
    
    return {
      text: `🌿 **Terapias na Natureza - Reserva Araras**\n\n` +
            `Oferecemos várias modalidades de terapia em ambiente natural:\n\n` +
            `${lista}\n\n` +
            `Todas as sessões são conduzidas por profissionais qualificados e integram os benefícios comprovados da natureza no processo terapêutico.\n\n` +
            `Sobre qual delas você gostaria de saber mais?`,
      type: 'therapy_list',
      actions: Object.keys(this.KNOWLEDGE_BASE.terapias).map(key => ({
        label: this.KNOWLEDGE_BASE.terapias[key].nome.split(' ')[0],
        action: `therapy_detail_${key}`
      }))
    };
  },

  /**
   * Trata pedido de exercício
   * @private
   */
  _handleExerciseRequest() {
    const exercicios = Object.values(this.KNOWLEDGE_BASE.exercicios_rapidos);
    const lista = exercicios.map(e => `• **${e.nome}** (${e.duracao}) - ${e.beneficio}`).join('\n\n');
    
    return {
      text: `🧘 **Exercícios Rápidos de Bem-Estar**\n\n` +
            `Tenho algumas práticas curtas que podem ajudar agora:\n\n` +
            `${lista}\n\n` +
            `Qual você gostaria de experimentar?`,
      type: 'exercise_list',
      actions: Object.keys(this.KNOWLEDGE_BASE.exercicios_rapidos).map(key => ({
        label: this.KNOWLEDGE_BASE.exercicios_rapidos[key].nome.split(' ')[0],
        action: `exercise_${key}`
      }))
    };
  },

  /**
   * Trata terapia na natureza
   * @private
   */
  _handleNatureTherapy() {
    const terapia = this.KNOWLEDGE_BASE.terapias.banho_floresta;
    
    return {
      text: `🌳 **O Poder Curativo da Natureza**\n\n` +
            `Pesquisas científicas comprovam que a exposição à natureza:\n\n` +
            `• 📉 Reduz cortisol (hormônio do estresse) em até 12%\n` +
            `• ❤️ Diminui pressão arterial e frequência cardíaca\n` +
            `• 🧠 Melhora humor e reduz pensamentos negativos\n` +
            `• 🛡️ Fortalece o sistema imunológico\n\n` +
            `Na Reserva Araras, praticamos o **${terapia.nome}**:\n\n` +
            `"${terapia.descricao}"\n\n` +
            `Mesmo poucos minutos observando plantas ou ouvindo sons da natureza podem trazer benefícios!`,
      type: 'nature_therapy'
    };
  },

  /**
   * Trata verificação de humor
   * @private
   */
  _handleMoodCheck(context) {
    return {
      text: `💚 **Como você está se sentindo agora?**\n\n` +
            `Escolha a opção que melhor descreve seu estado atual:\n\n` +
            `😢 Muito mal\n` +
            `😔 Mal\n` +
            `😐 Neutro\n` +
            `🙂 Bem\n` +
            `😊 Muito bem\n\n` +
            `Não existe resposta certa ou errada. Reconhecer nossos sentimentos é o primeiro passo para cuidar deles.`,
      type: 'mood_check',
      expectMoodResponse: true,
      actions: [
        { label: '😢 Muito mal', action: 'mood_very_bad' },
        { label: '😔 Mal', action: 'mood_bad' },
        { label: '😐 Neutro', action: 'mood_neutral' },
        { label: '🙂 Bem', action: 'mood_good' },
        { label: '😊 Muito bem', action: 'mood_very_good' }
      ]
    };
  },

  /**
   * Trata ajuda
   * @private
   */
  _handleHelp() {
    return {
      text: `💚 **Olá! Sou ${this.BOT_NAME}**, sua companhia para momentos de bem-estar.\n\n` +
            `Posso te ajudar com:\n\n` +
            `🌬️ **Respiração** - Técnicas para acalmar\n` +
            `   Ex: "Quero respirar"\n\n` +
            `🧘 **Exercícios** - Práticas rápidas de relaxamento\n` +
            `   Ex: "Preciso de um exercício"\n\n` +
            `🌿 **Terapias** - Informações sobre nossas terapias\n` +
            `   Ex: "O que é banho de floresta?"\n\n` +
            `💭 **Emoções** - Suporte para o que está sentindo\n` +
            `   Ex: "Estou ansioso"\n\n` +
            `📊 **Humor** - Verificar como você está\n` +
            `   Ex: "Como estou me sentindo?"\n\n` +
            `⚠️ *Este chatbot não substitui atendimento profissional de saúde mental.*`,
      type: 'help',
      important: 'Em caso de emergência: CVV - 188 (24h)'
    };
  },

  /**
   * Trata mensagem geral com IA
   * @private
   */
  _handleGeneralMessage(message, context) {
    // Tenta usar Gemini AI
    if (typeof GeminiAIService !== 'undefined' && GeminiAIService.isConfigured()) {
      try {
        const aiResponse = this._queryGeminiAI(message, context);
        if (aiResponse && aiResponse.success) {
          return aiResponse.response;
        }
      } catch (e) {
        Logger.log(`[_handleGeneralMessage] Gemini erro: ${e}`);
      }
    }
    
    // Resposta padrão acolhedora
    return {
      text: `Obrigada por compartilhar isso comigo. 💚\n\n` +
            `Estou aqui para te apoiar. Posso te ajudar com:\n\n` +
            `• Exercícios de respiração e relaxamento\n` +
            `• Informações sobre terapias na natureza\n` +
            `• Um momento de calma e acolhimento\n\n` +
            `O que você gostaria de explorar?`,
      type: 'fallback'
    };
  },

  /**
   * Consulta Gemini AI - OTIMIZADO
   * @private
   */
  _queryGeminiAI(message, context) {
    // Prompt otimizado e conciso
    const prompt = `Serena, assistente terapêutico (Reserva Araras - Cerrado/GO).

PERSONA: Acolhedora, calma, empática. Usa 🌿💚🌬️. NÃO substitui profissional.

MENSAGEM: "${message}"

Responda em max 150 palavras: acolha, valide sentimento, ofereça sugestão prática (exercício/reflexão).`;

    try {
      const result = GeminiAIService.callGemini(prompt, { 
        maxTokens: 400,
        temperature: 0.7
      });
      
      if (result.success) {
        return {
          success: true,
          response: {
            text: result.text,
            type: 'ai_response',
            ai_generated: true
          }
        };
      }
    } catch (e) {
      Logger.log(`[_queryGeminiAI] Erro: ${e}`);
    }
    
    return { success: false };
  },

  /**
   * Gera sugestões contextuais
   * @private
   */
  _generateSuggestions(intent) {
    const suggestions = {
      saudacao: ['Como estou me sentindo', 'Quero relaxar', 'Sobre as terapias'],
      despedida: ['Voltar', 'Fazer um exercício antes'],
      ansiedade: ['Outro exercício', 'Falar mais', 'Sobre terapias'],
      estresse: ['Fazer exercício', 'Banho de floresta', 'Respiração'],
      tristeza: ['Exercício de visualização', 'Respirar', 'Ajuda profissional'],
      raiva: ['Exercício de relaxamento', 'Respiração', 'Me acalmar'],
      calma: ['Meditação', 'Verificar meu humor', 'Sobre a natureza'],
      respiracao: ['Outro exercício', 'Meditação', 'Sobre terapias'],
      meditacao: ['Terapias disponíveis', 'Exercício de respiração', 'Banho de floresta'],
      terapia: ['Banho de floresta', 'Meditação', 'Agendar sessão'],
      exercicio: ['Respiração 4-7-8', 'Grounding', 'Relaxamento muscular'],
      natureza: ['Exercício de visualização', 'Agendar visita', 'Terapias'],
      humor: ['Preciso de ajuda', 'Estou bem', 'Fazer exercício'],
      ajuda: ['Verificar humor', 'Exercício rápido', 'Sobre terapias'],
      geral: ['Exercício de respiração', 'Como me sinto', 'Terapias na natureza']
    };
    
    return suggestions[intent] || suggestions.geral;
  },

  /**
   * Salva interação
   */
  logInteraction(conversationId, data) {
    try {
      this.initializeSheet();
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        conversationId,
        data.participantId || '',
        data.startTime || new Date().toISOString(),
        data.endTime || '',
        data.messageCount || 1,
        data.moodInitial || '',
        data.moodFinal || '',
        JSON.stringify(data.topics || []),
        data.exercisesCompleted || 0,
        data.duration || 0,
        data.satisfaction || ''
      ];
      
      sheet.appendRow(row);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas
   */
  getStatistics() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, total_conversations: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const conversations = data.length - 1;
      
      let totalExercises = 0;
      let moodImprovements = 0;
      
      for (let i = 1; i < data.length; i++) {
        totalExercises += data[i][8] || 0;
        // Verifica melhora de humor
        const moodInitial = data[i][5];
        const moodFinal = data[i][6];
        if (moodFinal && moodInitial && this._compareMood(moodFinal, moodInitial) > 0) {
          moodImprovements++;
        }
      }
      
      return {
        success: true,
        total_conversations: conversations,
        total_exercises: totalExercises,
        mood_improvement_rate: conversations > 0 ? 
          ((moodImprovements / conversations) * 100).toFixed(1) + '%' : '0%'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Compara níveis de humor
   * @private
   */
  _compareMood(mood1, mood2) {
    const levels = ['Muito_Mal', 'Mal', 'Neutro', 'Bem', 'Muito_Bem'];
    return levels.indexOf(mood1) - levels.indexOf(mood2);
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Chatbot Terapêutico
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa chatbot terapêutico
 */
function apiTherapyChatbotInit() {
  return TherapyChatbot.initializeSheet();
}

/**
 * Processa mensagem do usuário
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto da conversa
 */
function apiTherapyChatbotMessage(message, context) {
  return TherapyChatbot.processMessage(message, context || {});
}

/**
 * Registra interação
 * @param {string} conversationId - ID da conversa
 * @param {object} data - Dados da interação
 */
function apiTherapyChatbotLog(conversationId, data) {
  return TherapyChatbot.logInteraction(conversationId, data);
}

/**
 * Obtém estatísticas do chatbot terapêutico
 */
function apiTherapyChatbotStats() {
  return TherapyChatbot.getStatistics();
}

/**
 * Obtém exercício específico
 * @param {string} exerciseId - ID do exercício
 */
function apiTherapyChatbotGetExercise(exerciseId) {
  const exercicio = TherapyChatbot.KNOWLEDGE_BASE.exercicios_rapidos[exerciseId];
  if (exercicio) {
    return { success: true, exercise: exercicio };
  }
  return { success: false, error: 'Exercício não encontrado' };
}

/**
 * Obtém informações de terapia específica
 * @param {string} therapyId - ID da terapia
 */
function apiTherapyChatbotGetTherapy(therapyId) {
  const terapia = TherapyChatbot.KNOWLEDGE_BASE.terapias[therapyId];
  if (terapia) {
    return { success: true, therapy: terapia };
  }
  return { success: false, error: 'Terapia não encontrada' };
}

/**
 * Obtém lista de todos os exercícios
 */
function apiTherapyChatbotListExercises() {
  return {
    success: true,
    exercises: Object.entries(TherapyChatbot.KNOWLEDGE_BASE.exercicios_rapidos).map(([id, ex]) => ({
      id: id,
      nome: ex.nome,
      duracao: ex.duracao,
      beneficio: ex.beneficio
    }))
  };
}

/**
 * Obtém lista de todas as terapias
 */
function apiTherapyChatbotListTherapies() {
  return {
    success: true,
    therapies: Object.entries(TherapyChatbot.KNOWLEDGE_BASE.terapias).map(([id, t]) => ({
      id: id,
      nome: t.nome,
      duracao: t.duracao,
      beneficios: t.beneficios
    }))
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO COM THERAPY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém progresso terapêutico de um participante
 * Integra com TherapyService para dados de sessões
 * @param {string} participanteId - ID do participante
 */
function apiTherapyChatbotGetProgress(participanteId) {
  try {
    if (!participanteId) {
      return { success: false, error: 'ID do participante é obrigatório' };
    }
    
    // Busca dados do TherapyService se disponível
    if (typeof TherapyService !== 'undefined') {
      const wellbeing = TherapyService.calculateWellbeingIndex(participanteId);
      const sessoes = TherapyService.listSessoes(participanteId);
      const avaliacoes = TherapyService.listAvaliacoes(participanteId);
      
      return {
        success: true,
        participante: participanteId,
        wellbeing: wellbeing.success ? wellbeing : null,
        sessoes: sessoes.success ? sessoes : null,
        avaliacoes: avaliacoes.success ? avaliacoes : null,
        message: `💚 Encontradas ${sessoes.count || 0} sessões e ${avaliacoes.count || 0} avaliações.`
      };
    }
    
    return { success: false, error: 'TherapyService não disponível' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Registra avaliação rápida de humor via chatbot
 * @param {string} participanteId - ID do participante
 * @param {object} avaliacaoData - Dados da avaliação
 */
function apiTherapyChatbotQuickAssessment(participanteId, avaliacaoData) {
  try {
    if (typeof TherapyService !== 'undefined') {
      const avaliacao = {
        participante_id: participanteId,
        tipo: 'CHATBOT_QUICK',
        ansiedade: avaliacaoData.ansiedade || 0,
        depressao: avaliacaoData.depressao || 0,
        estresse: avaliacaoData.estresse || 0,
        bem_estar: avaliacaoData.bem_estar || 5,
        conexao_natureza: avaliacaoData.conexao_natureza || 5,
        avaliador: 'Chatbot Serena',
        observacoes: avaliacaoData.observacoes || 'Avaliação rápida via chatbot'
      };
      
      return TherapyService.registerAvaliacao(avaliacao);
    }
    
    return { success: false, error: 'TherapyService não disponível' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Converte resposta de humor do chatbot para escala numérica
 * @param {string} mood - Humor em texto (mood_very_bad, mood_bad, etc)
 */
function apiTherapyChatbotConvertMood(mood) {
  const moodMap = {
    'mood_very_bad': { valor: 1, texto: 'Muito_Mal', emoji: '😢', ansiedade: 8, depressao: 8, estresse: 8, bem_estar: 2 },
    'mood_bad': { valor: 2, texto: 'Mal', emoji: '😔', ansiedade: 6, depressao: 6, estresse: 6, bem_estar: 3 },
    'mood_neutral': { valor: 3, texto: 'Neutro', emoji: '😐', ansiedade: 4, depressao: 4, estresse: 4, bem_estar: 5 },
    'mood_good': { valor: 4, texto: 'Bem', emoji: '🙂', ansiedade: 2, depressao: 2, estresse: 2, bem_estar: 7 },
    'mood_very_good': { valor: 5, texto: 'Muito_Bem', emoji: '😊', ansiedade: 1, depressao: 1, estresse: 1, bem_estar: 9 }
  };
  
  return moodMap[mood] || moodMap['mood_neutral'];
}

/**
 * Obtém recomendação de terapia baseada no humor
 * @param {string} mood - Humor em texto
 */
function apiTherapyChatbotRecommendTherapy(mood) {
  const moodData = apiTherapyChatbotConvertMood(mood);
  const terapias = TherapyChatbot.KNOWLEDGE_BASE.terapias;
  
  let recomendacao;
  
  if (moodData.valor <= 2) {
    // Humor muito baixo - terapias suaves
    recomendacao = {
      primary: terapias.banho_floresta,
      secondary: terapias.meditacao,
      message: 'Recomendo atividades suaves e acolhedoras como Banho de Floresta ou Meditação na Natureza.'
    };
  } else if (moodData.valor === 3) {
    // Neutro - explorar opções
    recomendacao = {
      primary: terapias.ecoterapia,
      secondary: terapias.arteterapia,
      message: 'Que tal explorar a Ecoterapia ou Arte-terapia ao ar livre para elevar seu bem-estar?'
    };
  } else {
    // Humor bom - manter e fortalecer
    recomendacao = {
      primary: terapias.hidroterapia,
      secondary: terapias.banho_floresta,
      message: 'Ótimo! Hidroterapia Natural ou Banho de Floresta podem fortalecer esse bem-estar.'
    };
  }
  
  return {
    success: true,
    mood: moodData,
    recomendacao: recomendacao,
    all_therapies: Object.values(terapias)
  };
}

/**
 * Obtém exercício recomendado baseado na emoção
 * @param {string} emotion - Emoção (ansiedade, estresse, tristeza, raiva)
 */
function apiTherapyChatbotRecommendExercise(emotion) {
  const exercicios = TherapyChatbot.KNOWLEDGE_BASE.exercicios_rapidos;
  
  const recomendacoes = {
    ansiedade: {
      primary: exercicios.respiracao_4_7_8,
      backup: exercicios.grounding_5_4_3_2_1,
      reason: 'A respiração 4-7-8 ativa o sistema nervoso parassimpático, promovendo calma.'
    },
    estresse: {
      primary: exercicios.relaxamento_muscular,
      backup: exercicios.respiracao_4_7_8,
      reason: 'O relaxamento muscular progressivo libera tensão acumulada no corpo.'
    },
    tristeza: {
      primary: exercicios.visualizacao_natureza,
      backup: exercicios.grounding_5_4_3_2_1,
      reason: 'A visualização positiva pode ajudar a criar um refúgio mental seguro.'
    },
    raiva: {
      primary: exercicios.relaxamento_muscular,
      backup: exercicios.respiracao_4_7_8,
      reason: 'Liberar tensão física ajuda a processar a energia da raiva de forma saudável.'
    },
    geral: {
      primary: exercicios.respiracao_4_7_8,
      backup: exercicios.visualizacao_natureza,
      reason: 'A respiração consciente é sempre um bom ponto de partida para o bem-estar.'
    }
  };
  
  const rec = recomendacoes[emotion] || recomendacoes.geral;
  
  return {
    success: true,
    emotion: emotion,
    exercicio_principal: rec.primary,
    exercicio_alternativo: rec.backup,
    justificativa: rec.reason,
    all_exercises: Object.values(exercicios)
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO COM SHINRIN-YOKU PROTOCOLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicia sessão de Banho de Floresta via Serena
 * @param {object} context - Contexto do usuário
 */
function apiSerenaStartShinrinYoku(context) {
  if (typeof ShinrinYokuProtocols !== 'undefined') {
    const session = ShinrinYokuProtocols.startSession(context || {});
    
    // Adiciona introdução da Serena
    if (session.success) {
      session.response.text = `💚 *Serena aqui*\n\n` +
        `Que maravilha que você quer experimentar o Shinrin-yoku!\n\n` +
        `O Banho de Floresta é uma prática japonesa que nos reconecta com a natureza ` +
        `através dos sentidos. Estudos mostram que reduz cortisol, pressão arterial ` +
        `e fortalece o sistema imunológico.\n\n` +
        `Vou te guiar através de "convites" — não são instruções, são sugestões gentis ` +
        `para explorar. Não há certo ou errado.\n\n` +
        `---\n\n` + session.response.text;
    }
    
    return session;
  }
  
  return {
    success: false,
    error: 'Módulo Shinrin-yoku não disponível',
    response: {
      text: `💚 O módulo de Banho de Floresta está sendo preparado. ` +
            `Por enquanto, posso te guiar em um exercício de respiração ou visualização. ` +
            `O que você prefere?`,
      suggestions: ['Exercício de respiração', 'Visualização da natureza', 'Grounding 5-4-3-2-1']
    }
  };
}

/**
 * Continua sessão de Shinrin-yoku
 * @param {string} sessionId - ID da sessão
 * @param {string} phase - Fase atual
 * @param {string} feedback - Feedback do usuário
 */
function apiSerenaContinueShinrinYoku(sessionId, phase, feedback) {
  if (typeof ShinrinYokuProtocols !== 'undefined') {
    return ShinrinYokuProtocols.nextInvitation(sessionId, phase, feedback);
  }
  return { success: false, error: 'Módulo não disponível' };
}

/**
 * Obtém convite de Shinrin-yoku para emoção específica
 * @param {string} emotion - Emoção detectada
 */
function apiSerenaEmotionalSupport(emotion) {
  // Primeiro tenta Shinrin-yoku
  if (typeof ShinrinYokuProtocols !== 'undefined') {
    const syResult = ShinrinYokuProtocols.getEmotionalInvitation(emotion);
    if (syResult.success) {
      return {
        success: true,
        source: 'shinrin_yoku',
        response: {
          text: `💚 *Serena percebe que você está sentindo ${emotion}*\n\n` +
                `Tenho um convite especial da floresta para você:\n\n` +
                `---\n\n${syResult.invitation.script}`,
          type: 'emotional_support',
          invitation: syResult.invitation
        }
      };
    }
  }
  
  // Fallback para exercícios do TherapyChatbot
  return apiTherapyChatbotRecommendExercise(emotion);
}

/**
 * Aterramento rápido via Serena
 */
function apiSerenaQuickGrounding() {
  if (typeof ShinrinYokuProtocols !== 'undefined') {
    return ShinrinYokuProtocols.getQuickGrounding();
  }
  
  // Fallback
  const exercicio = TherapyChatbot.KNOWLEDGE_BASE.exercicios_rapidos.grounding_5_4_3_2_1;
  return {
    success: true,
    response: {
      text: `💚 **Aterramento Rápido**\n\n${exercicio.passos.join('\n')}\n\n${exercicio.beneficio}`,
      type: 'quick_grounding'
    }
  };
}
