/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - CHATBOT EDUCACIONAL INTELIGENTE
 * ═══════════════════════════════════════════════════════════════════════════
 * P15 - Chatbot com Gemini AI para Educação Ambiental
 * 
 * Funcionalidades:
 * - Respostas inteligentes com Gemini AI
 * - Personalização por nível de conhecimento
 * - Quiz interativo educacional
 * - Sugestões contextuais de perguntas
 * - Geração de conteúdo educativo
 * - Integração com P01 (biodiversidade) e P06 (educação)
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha CHATBOT_INTERACOES_RA
 */
const SCHEMA_CHATBOT_INTERACOES = {
  ID_Conversa: { type: 'string', required: true, unique: true },
  ID_Usuario: { type: 'string' },
  Timestamp_Inicio: { type: 'datetime', required: true },
  Timestamp_Fim: { type: 'datetime' },
  Total_Mensagens: { type: 'integer' },
  Topicos_JSON: { type: 'text' },
  Especies_Mencionadas_JSON: { type: 'text' },
  Nivel_Conhecimento: { type: 'enum', values: ['Iniciante', 'Intermediario', 'Avancado'] },
  Interesse_Principal: { type: 'string' },
  Satisfacao: { type: 'integer', range: [1, 5] },
  Duracao_min: { type: 'float' },
  Quiz_Participou: { type: 'boolean' },
  Quiz_Pontuacao: { type: 'integer' }
};

const CHATBOT_HEADERS = [
  'ID_Conversa', 'ID_Usuario', 'Timestamp_Inicio', 'Timestamp_Fim',
  'Total_Mensagens', 'Topicos_JSON', 'Especies_Mencionadas_JSON',
  'Nivel_Conhecimento', 'Interesse_Principal', 'Satisfacao',
  'Duracao_min', 'Quiz_Participou', 'Quiz_Pontuacao'
];


/**
 * Chatbot Educacional Ara
 * @namespace EcoChatbot
 */
const EcoChatbot = {
  
  SHEET_NAME: 'CHATBOT_INTERACOES_RA',
  BOT_NAME: 'Ara',
  
  /**
   * Base de conhecimento da reserva
   */
  KNOWLEDGE_BASE: {
    reserva: {
      nome: 'Reserva Recanto das Araras de Terra Ronca',
      localizacao: 'São Domingos, Goiás',
      bioma: 'Cerrado',
      area: '180 hectares',
      caracteristicas: [
        'Cerrado sentido restrito',
        'Cerradão',
        'Mata de galeria',
        'Veredas com buritis'
      ]
    },
    trilhas: [
      { nome: 'Trilha da Nascente', distancia: '2.5 km', dificuldade: 'Fácil', duracao: '1h30', destaque: 'Nascente cristalina e mata ciliar' },
      { nome: 'Trilha do Mirante', distancia: '3.8 km', dificuldade: 'Moderada', duracao: '2h30', destaque: 'Vista panorâmica do cerrado' },
      { nome: 'Trilha das Veredas', distancia: '4.2 km', dificuldade: 'Moderada', duracao: '3h', destaque: 'Buritizal e fauna aquática' },
      { nome: 'Trilha do SAF', distancia: '1.5 km', dificuldade: 'Fácil', duracao: '1h', destaque: 'Sistema agroflorestal demonstrativo' }
    ],
    especies_destaque: [
      { nome: 'Arara-canindé', cientifico: 'Ara ararauna', tipo: 'Ave', curiosidade: 'Pode viver até 60 anos e forma casais para a vida toda' },
      { nome: 'Lobo-guará', cientifico: 'Chrysocyon brachyurus', tipo: 'Mamífero', curiosidade: 'Maior canídeo da América do Sul, é solitário e noturno' },
      { nome: 'Tamanduá-bandeira', cientifico: 'Myrmecophaga tridactyla', tipo: 'Mamífero', curiosidade: 'Come até 30.000 formigas por dia com sua língua de 60cm' },
      { nome: 'Seriema', cientifico: 'Cariama cristata', tipo: 'Ave', curiosidade: 'Parente distante dos dinossauros, mata presas batendo no chão' },
      { nome: 'Pequi', cientifico: 'Caryocar brasiliense', tipo: 'Planta', curiosidade: 'Fruto símbolo do Cerrado, não pode ser mordido por causa dos espinhos' },
      { nome: 'Buriti', cientifico: 'Mauritia flexuosa', tipo: 'Palmeira', curiosidade: 'Árvore da vida do Cerrado, todas as partes são aproveitadas' }
    ],
    horarios: {
      visitacao: '8h às 17h',
      dias: 'Terça a Domingo',
      agendamento: 'Necessário para grupos acima de 10 pessoas'
    },
    atividades: [
      'Trilhas guiadas',
      'Observação de aves',
      'Fotografia de natureza',
      'Workshops de agrofloresta',
      'Educação ambiental',
      'Voluntariado'
    ]
  },

  /**
   * Intenções reconhecidas
   */
  INTENTS: {
    saudacao: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eai', 'e aí'],
    despedida: ['tchau', 'até mais', 'adeus', 'bye', 'valeu', 'obrigado', 'obrigada'],
    especie: ['que animal', 'qual animal', 'que espécie', 'sobre o', 'sobre a', 'conhece o', 'conhece a', 'fale sobre'],
    trilha: ['trilha', 'trilhas', 'caminhada', 'percurso', 'rota', 'caminhar'],
    visita: ['visitar', 'visita', 'horário', 'horarios', 'quando', 'como chegar', 'agendar', 'reservar'],
    agrofloresta: ['agrofloresta', 'saf', 'sistema agroflorestal', 'plantio', 'cultivo'],
    conservacao: ['conservar', 'conservação', 'proteger', 'preservar', 'sustentável', 'sustentabilidade'],
    biodiversidade: ['biodiversidade', 'fauna', 'flora', 'animais', 'plantas', 'espécies'],
    quiz: ['quiz', 'teste', 'perguntas', 'jogar', 'desafio'],
    ajuda: ['ajuda', 'help', 'o que você faz', 'como funciona', 'comandos']
  },

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(CHATBOT_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, CHATBOT_HEADERS.length);
        headerRange.setBackground('#00897B');
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
  processMessage: function(message, context = {}) {
    try {
      const lowerMessage = message.toLowerCase().trim();
      
      // Detecta intenção
      const intent = this._detectIntent(lowerMessage);
      
      // Gera resposta baseada na intenção
      let response;
      
      switch (intent) {
        case 'saudacao':
          response = this._handleGreeting();
          break;
        case 'despedida':
          response = this._handleFarewell();
          break;
        case 'especie':
          response = this._handleSpeciesQuery(lowerMessage);
          break;
        case 'trilha':
          response = this._handleTrailQuery(lowerMessage);
          break;
        case 'visita':
          response = this._handleVisitQuery();
          break;
        case 'agrofloresta':
          response = this._handleAgroforestryQuery();
          break;
        case 'conservacao':
          response = this._handleConservationQuery();
          break;
        case 'biodiversidade':
          response = this._handleBiodiversityQuery();
          break;
        case 'quiz':
          response = this._startQuiz(context.quizTopic || 'geral');
          break;
        case 'ajuda':
          response = this._handleHelp();
          break;
        default:
          response = this._handleGeneralQuery(message, context);
      }
      
      // Adiciona sugestões
      response.suggestions = this._generateSuggestions(intent);
      response.intent = intent;
      
      return {
        success: true,
        response: response
      };
      
    } catch (error) {
      Logger.log(`[processMessage] Erro: ${error}`);
      return {
        success: false,
        response: {
          text: 'Desculpe, tive um probleminha. Pode repetir sua pergunta? 🦜',
          suggestions: ['O que você pode fazer?', 'Quais animais posso ver?']
        }
      };
    }
  },

  /**
   * Detecta intenção do usuário
   * @private
   */
  _detectIntent: function(message) {
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
  _handleGreeting: function() {
    const greetings = [
      `Olá! 🦜 Sou ${this.BOT_NAME}, seu guia virtual pela Reserva Araras!\n\nPosso te ajudar com informações sobre:\n• 🦋 Fauna e flora do Cerrado\n• 🥾 Trilhas e visitação\n• 🌱 Sistemas agroflorestais\n• ♻️ Conservação ambiental\n\nO que você gostaria de saber?`,
      `Oi! Que bom te ver por aqui! 🌳\n\nSou ${this.BOT_NAME}, a arara-guia da reserva. Estou aqui para responder suas dúvidas sobre nossa biodiversidade, trilhas e muito mais!\n\nComo posso ajudar?`,
      `Bem-vindo(a) à Reserva Araras! 🌿\n\nMe chamo ${this.BOT_NAME} e adoro compartilhar conhecimento sobre o Cerrado. Pergunte o que quiser!`
    ];
    
    return {
      text: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'greeting'
    };
  },

  /**
   * Trata despedida
   * @private
   */
  _handleFarewell: function() {
    const farewells = [
      'Até mais! 🦜 Foi um prazer conversar com você. Volte sempre para aprender mais sobre o Cerrado!',
      'Tchau! 🌳 Espero ter ajudado. Que tal uma visita presencial à reserva?',
      'Até a próxima! 🌿 Lembre-se: cada ação conta para a conservação!'
    ];
    
    return {
      text: farewells[Math.floor(Math.random() * farewells.length)],
      type: 'farewell',
      actions: [{ label: 'Agendar Visita', action: 'open_booking' }]
    };
  },

  /**
   * Trata consulta sobre espécies
   * @private
   */
  _handleSpeciesQuery: function(message) {
    // Busca espécie mencionada
    const especies = this.KNOWLEDGE_BASE.especies_destaque;
    let especieEncontrada = null;
    
    for (const esp of especies) {
      if (message.includes(esp.nome.toLowerCase()) || 
          message.includes(esp.cientifico.toLowerCase())) {
        especieEncontrada = esp;
        break;
      }
    }
    
    if (especieEncontrada) {
      return {
        text: `🔍 **${especieEncontrada.nome}** (*${especieEncontrada.cientifico}*)\n\n` +
              `📋 Tipo: ${especieEncontrada.tipo}\n\n` +
              `💡 Curiosidade: ${especieEncontrada.curiosidade}\n\n` +
              `Quer saber sobre outras espécies da reserva?`,
        type: 'species_info',
        entity: especieEncontrada.nome
      };
    }
    
    // Lista espécies disponíveis
    const listaEspecies = especies.map(e => `• ${e.nome} (${e.tipo})`).join('\n');
    
    return {
      text: `🦋 Temos várias espécies incríveis na reserva! Algumas das mais especiais:\n\n${listaEspecies}\n\n` +
            `Sobre qual você quer saber mais?`,
      type: 'species_list'
    };
  },

  /**
   * Trata consulta sobre trilhas
   * @private
   */
  _handleTrailQuery: function(message) {
    const trilhas = this.KNOWLEDGE_BASE.trilhas;
    
    // Verifica se pergunta sobre trilha específica
    for (const trilha of trilhas) {
      if (message.includes(trilha.nome.toLowerCase())) {
        return {
          text: `🥾 **${trilha.nome}**\n\n` +
                `📏 Distância: ${trilha.distancia}\n` +
                `⏱️ Duração: ${trilha.duracao}\n` +
                `💪 Dificuldade: ${trilha.dificuldade}\n` +
                `✨ Destaque: ${trilha.destaque}\n\n` +
                `Gostaria de saber sobre outras trilhas?`,
          type: 'trail_info',
          entity: trilha.nome
        };
      }
    }
    
    // Lista todas as trilhas
    const listaTrilhas = trilhas.map(t => 
      `• **${t.nome}** - ${t.distancia}, ${t.dificuldade}`
    ).join('\n');
    
    return {
      text: `🥾 Nossas trilhas são uma experiência única no Cerrado!\n\n${listaTrilhas}\n\n` +
            `Todas as trilhas são guiadas e seguras. Qual te interessa mais?`,
      type: 'trail_list',
      actions: [{ label: 'Agendar Trilha', action: 'open_booking' }]
    };
  },

  /**
   * Trata consulta sobre visitação
   * @private
   */
  _handleVisitQuery: function() {
    const h = this.KNOWLEDGE_BASE.horarios;
    const atividades = this.KNOWLEDGE_BASE.atividades.map(a => `• ${a}`).join('\n');
    
    return {
      text: `📍 **Informações de Visitação**\n\n` +
            `🕐 Horário: ${h.visitacao}\n` +
            `📅 Dias: ${h.dias}\n` +
            `📝 ${h.agendamento}\n\n` +
            `**Atividades disponíveis:**\n${atividades}\n\n` +
            `📞 Para agendar, entre em contato conosco!`,
      type: 'visit_info',
      actions: [
        { label: 'Agendar Visita', action: 'open_booking' },
        { label: 'Ver Trilhas', action: 'show_trails' }
      ]
    };
  },

  /**
   * Trata consulta sobre agrofloresta
   * @private
   */
  _handleAgroforestryQuery: function() {
    return {
      text: `🌱 **Sistemas Agroflorestais (SAFs)**\n\n` +
            `Na Reserva Araras, praticamos agrofloresta como modelo de produção sustentável!\n\n` +
            `**O que é SAF?**\n` +
            `É um sistema que combina árvores, cultivos agrícolas e/ou animais na mesma área, imitando a floresta natural.\n\n` +
            `**Benefícios:**\n` +
            `• 🌳 Sequestro de carbono\n` +
            `• 💧 Proteção de nascentes\n` +
            `• 🦋 Habitat para fauna\n` +
            `• 🍎 Produção de alimentos\n` +
            `• 💰 Renda para comunidades\n\n` +
            `Temos a **Trilha do SAF** onde você pode conhecer nosso sistema demonstrativo!`,
      type: 'agrofloresta_info',
      actions: [{ label: 'Ver Trilha do SAF', action: 'show_saf_trail' }]
    };
  },

  /**
   * Trata consulta sobre conservação
   * @private
   */
  _handleConservationQuery: function() {
    return {
      text: `♻️ **Conservação na Reserva Araras**\n\n` +
            `O Cerrado é o segundo maior bioma do Brasil e um dos mais ameaçados. Já perdemos mais de 50% da vegetação original!\n\n` +
            `**Nosso trabalho:**\n` +
            `• 🌳 Restauração de áreas degradadas\n` +
            `• 🦜 Monitoramento de fauna\n` +
            `• 🔬 Pesquisa científica\n` +
            `• 📚 Educação ambiental\n` +
            `• 🤝 Engajamento comunitário\n\n` +
            `**Como você pode ajudar:**\n` +
            `• Visite e apoie a reserva\n` +
            `• Participe como voluntário\n` +
            `• Compartilhe conhecimento\n` +
            `• Adote práticas sustentáveis\n\n` +
            `Cada ação conta! 🌍`,
      type: 'conservation_info'
    };
  },

  /**
   * Trata consulta sobre biodiversidade
   * @private
   */
  _handleBiodiversityQuery: function() {
    const reserva = this.KNOWLEDGE_BASE.reserva;
    
    return {
      text: `🦋 **Biodiversidade da Reserva Araras**\n\n` +
            `Estamos no coração do **${reserva.bioma}**, um hotspot de biodiversidade!\n\n` +
            `**Nossos ambientes:**\n` +
            `${reserva.caracteristicas.map(c => `• ${c}`).join('\n')}\n\n` +
            `**Fauna registrada:**\n` +
            `• 🐦 150+ espécies de aves\n` +
            `• 🦎 40+ espécies de répteis\n` +
            `• 🐸 30+ espécies de anfíbios\n` +
            `• 🦊 50+ espécies de mamíferos\n\n` +
            `Quer conhecer algumas espécies especiais?`,
      type: 'biodiversity_info'
    };
  },

  /**
   * Trata pedido de ajuda
   * @private
   */
  _handleHelp: function() {
    return {
      text: `🦜 **Olá! Sou ${this.BOT_NAME}, seu guia virtual!**\n\n` +
            `Posso te ajudar com:\n\n` +
            `🦋 **Espécies** - Pergunte sobre animais e plantas\n` +
            `   Ex: "Fale sobre o lobo-guará"\n\n` +
            `🥾 **Trilhas** - Informações sobre percursos\n` +
            `   Ex: "Quais trilhas vocês têm?"\n\n` +
            `📍 **Visitação** - Horários e agendamento\n` +
            `   Ex: "Como visitar a reserva?"\n\n` +
            `🌱 **Agrofloresta** - Sobre nossos SAFs\n` +
            `   Ex: "O que é agrofloresta?"\n\n` +
            `🎯 **Quiz** - Teste seus conhecimentos\n` +
            `   Ex: "Quero fazer um quiz"\n\n` +
            `É só perguntar! 😊`,
      type: 'help'
    };
  },

  /**
   * Trata consulta geral com IA
   * @private
   */
  _handleGeneralQuery: function(message, context) {
    // Tenta usar Gemini AI se disponível
    try {
      const aiResponse = this._queryGeminiAI(message, context);
      if (aiResponse) {
        return aiResponse;
      }
    } catch (e) {
      Logger.log(`[_handleGeneralQuery] Gemini não disponível: ${e}`);
    }
    
    // Resposta padrão
    return {
      text: `Hmm, não tenho certeza sobre isso! 🤔\n\n` +
            `Posso te ajudar com informações sobre:\n` +
            `• Espécies da reserva\n` +
            `• Trilhas e visitação\n` +
            `• Agrofloresta e conservação\n\n` +
            `Tente reformular sua pergunta ou escolha um dos temas acima!`,
      type: 'fallback'
    };
  },

  /**
   * Consulta Gemini AI
   * @private
   */
  _queryGeminiAI: function(message, context) {
    const prompt = `
Você é Ara, o assistente educacional virtual da Reserva Araras, uma reserva de Cerrado em Goiás, Brasil.

**SUA PERSONALIDADE:**
- Amigável, educativo e inspirador
- Apaixonado por natureza e conservação do Cerrado
- Usa linguagem acessível mas cientificamente precisa
- Usa emojis relacionados à natureza 🌳🦋🌿🦜

**CONHECIMENTO DA RESERVA:**
- Bioma: Cerrado
- Área: 180 hectares
- Localização: São Domingos, Goiás
- Ambientes: Cerrado sentido restrito, Cerradão, Mata de galeria, Veredas
- Fauna: Arara-canindé, Lobo-guará, Tamanduá-bandeira, Seriema
- Flora: Pequi, Buriti, Jatobá, Ipê

**DIRETRIZES:**
1. Seja conciso (máximo 200 palavras)
2. Foque em informações sobre Cerrado e conservação
3. Se não souber, admita e sugira temas que conhece
4. Incentive visitação e conservação

**PERGUNTA DO USUÁRIO:**
"${message}"

Responda de forma educativa e engajadora:`;

    try {
      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      });
      
      if (response && response.candidates && response.candidates[0]) {
        const text = response.candidates[0].content.parts[0].text;
        return {
          text: text,
          type: 'ai_response',
          ai_generated: true
        };
      }
    } catch (e) {
      Logger.log(`[_queryGeminiAI] Erro: ${e}`);
    }
    
    return null;
  },

  /**
   * Inicia quiz interativo
   * @private
   */
  _startQuiz: function(topic) {
    const quizzes = {
      geral: [
        {
          pergunta: 'Qual é o bioma onde está localizada a Reserva Araras?',
          opcoes: ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Caatinga'],
          correta: 1,
          explicacao: 'A Reserva Araras está no Cerrado, o segundo maior bioma brasileiro e um dos mais biodiversos do mundo!'
        },
        {
          pergunta: 'Qual animal é conhecido como o maior canídeo da América do Sul?',
          opcoes: ['Cachorro-do-mato', 'Lobo-guará', 'Raposa-do-campo', 'Graxaim'],
          correta: 1,
          explicacao: 'O lobo-guará (Chrysocyon brachyurus) é o maior canídeo sul-americano, podendo pesar até 30kg!'
        },
        {
          pergunta: 'O que é um Sistema Agroflorestal (SAF)?',
          opcoes: [
            'Monocultura de árvores',
            'Sistema que combina árvores, cultivos e/ou animais',
            'Floresta sem intervenção humana',
            'Plantação de eucalipto'
          ],
          correta: 1,
          explicacao: 'SAFs imitam a estrutura da floresta, combinando diferentes espécies para produção sustentável!'
        },
        {
          pergunta: 'Quantas formigas um tamanduá-bandeira pode comer por dia?',
          opcoes: ['5.000', '10.000', '30.000', '50.000'],
          correta: 2,
          explicacao: 'O tamanduá-bandeira come cerca de 30.000 formigas e cupins por dia com sua língua de 60cm!'
        },
        {
          pergunta: 'Qual palmeira é conhecida como "árvore da vida" do Cerrado?',
          opcoes: ['Coco', 'Buriti', 'Açaí', 'Babaçu'],
          correta: 1,
          explicacao: 'O buriti (Mauritia flexuosa) é chamado de árvore da vida porque todas as suas partes são aproveitadas!'
        }
      ]
    };
    
    const questions = quizzes[topic] || quizzes.geral;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return {
      text: `🎯 **Quiz do Cerrado!**\n\n` +
            `**${randomQuestion.pergunta}**\n\n` +
            randomQuestion.opcoes.map((op, i) => `${i + 1}. ${op}`).join('\n') +
            `\n\nResponda com o número da opção (1-4)!`,
      type: 'quiz',
      quiz_data: randomQuestion
    };
  },

  /**
   * Verifica resposta do quiz
   */
  checkQuizAnswer: function(answer, quizData) {
    const userAnswer = parseInt(answer) - 1;
    const isCorrect = userAnswer === quizData.correta;
    
    if (isCorrect) {
      return {
        text: `✅ **Parabéns! Resposta correta!**\n\n` +
              `💡 ${quizData.explicacao}\n\n` +
              `Quer tentar outra pergunta?`,
        correct: true,
        type: 'quiz_result'
      };
    } else {
      const correctOption = quizData.opcoes[quizData.correta];
      return {
        text: `❌ **Ops! Não foi dessa vez.**\n\n` +
              `A resposta correta era: **${correctOption}**\n\n` +
              `💡 ${quizData.explicacao}\n\n` +
              `Quer tentar outra pergunta?`,
        correct: false,
        type: 'quiz_result'
      };
    }
  },

  /**
   * Gera sugestões contextuais
   * @private
   */
  _generateSuggestions: function(intent) {
    const suggestions = {
      saudacao: ['Quais animais posso ver?', 'Como visitar a reserva?', 'O que é agrofloresta?'],
      especie: ['Ver outras espécies', 'Fazer um quiz', 'Conhecer as trilhas'],
      trilha: ['Agendar visita', 'Ver espécies', 'O que é SAF?'],
      visita: ['Ver trilhas', 'Conhecer espécies', 'Sobre conservação'],
      agrofloresta: ['Ver Trilha do SAF', 'Sobre conservação', 'Fazer quiz'],
      conservacao: ['Como posso ajudar?', 'Visitar a reserva', 'Conhecer espécies'],
      biodiversidade: ['Fale sobre o lobo-guará', 'Quais aves existem?', 'Fazer quiz'],
      quiz: ['Outra pergunta', 'Ver espécies', 'Sobre a reserva'],
      geral: ['O que você pode fazer?', 'Quais animais posso ver?', 'Como visitar?'],
      ajuda: ['Ver espécies', 'Conhecer trilhas', 'Fazer quiz']
    };
    
    return suggestions[intent] || suggestions.geral;
  },

  /**
   * Gera conteúdo educativo
   */
  generateEducationalContent: function(topic, audience = 'geral') {
    const prompt = `
Crie conteúdo educativo sobre "${topic}" para público ${audience}.
Contexto: Reserva de Cerrado em Goiás, Brasil.

Formato:
1. Introdução acessível (2-3 frases)
2. 3 fatos interessantes
3. Por que isso importa para conservação?
4. Uma ação prática que a pessoa pode fazer

Seja inspirador e use emojis! Máximo 250 palavras.`;

    try {
      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response && response.candidates && response.candidates[0]) {
        return {
          success: true,
          content: response.candidates[0].content.parts[0].text,
          topic: topic,
          audience: audience
        };
      }
    } catch (e) {
      Logger.log(`[generateEducationalContent] Erro: ${e}`);
    }
    
    return { success: false, error: 'Não foi possível gerar conteúdo' };
  },

  /**
   * Salva interação
   */
  logInteraction: function(conversationId, data) {
    try {
      this.initializeSheet();
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        conversationId,
        data.userId || '',
        data.startTime || new Date().toISOString(),
        data.endTime || '',
        data.messageCount || 1,
        JSON.stringify(data.topics || []),
        JSON.stringify(data.species || []),
        data.level || 'Iniciante',
        data.mainInterest || '',
        data.satisfaction || '',
        data.duration || 0,
        data.quizParticipated || false,
        data.quizScore || 0
      ];
      
      sheet.appendRow(row);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas do chatbot
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, total_conversations: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const conversations = data.length - 1;
      
      let totalMessages = 0;
      let totalDuration = 0;
      let quizParticipants = 0;
      
      for (let i = 1; i < data.length; i++) {
        totalMessages += data[i][4] || 0;
        totalDuration += data[i][10] || 0;
        if (data[i][11]) quizParticipants++;
      }
      
      return {
        success: true,
        total_conversations: conversations,
        total_messages: totalMessages,
        avg_messages_per_conversation: conversations > 0 ? (totalMessages / conversations).toFixed(1) : 0,
        avg_duration_min: conversations > 0 ? (totalDuration / conversations).toFixed(1) : 0,
        quiz_participation_rate: conversations > 0 ? ((quizParticipants / conversations) * 100).toFixed(1) + '%' : '0%'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Chatbot Educacional
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa chatbot
 */
function apiChatbotInit() {
  return EcoChatbot.initializeSheet();
}

/**
 * Processa mensagem do usuário
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto da conversa
 */
function apiChatbotMessage(message, context) {
  return EcoChatbot.processMessage(message, context || {});
}

/**
 * Verifica resposta do quiz
 * @param {string} answer - Resposta do usuário
 * @param {object} quizData - Dados da pergunta
 */
function apiChatbotQuizCheck(answer, quizData) {
  return EcoChatbot.checkQuizAnswer(answer, quizData);
}

/**
 * Gera conteúdo educativo
 * @param {string} topic - Tópico
 * @param {string} audience - Público-alvo
 */
function apiChatbotConteudo(topic, audience) {
  return EcoChatbot.generateEducationalContent(topic, audience);
}

/**
 * Registra interação
 * @param {string} conversationId - ID da conversa
 * @param {object} data - Dados da interação
 */
function apiChatbotLog(conversationId, data) {
  return EcoChatbot.logInteraction(conversationId, data);
}

/**
 * Obtém estatísticas
 */
function apiChatbotStats() {
  return EcoChatbot.getStatistics();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 35/30 (22/30): IDENTIFICAÇÃO DE ESPÉCIES VIA CHATBOT
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - iNaturalist Species Identification
// - Flora do Brasil 2020
// - WikiAves Brasil

/**
 * Base de conhecimento expandida com curiosidades
 */
const SPECIES_KNOWLEDGE = {
  // Aves
  'arara-canindé': {
    nome_comum: 'Arara-canindé',
    nome_cientifico: 'Ara ararauna',
    tipo: 'Ave',
    familia: 'Psittacidae',
    habitat: 'Cerrado, Amazônia, Pantanal',
    conservacao: 'Pouco Preocupante',
    curiosidades: [
      'Pode viver até 60 anos em cativeiro',
      'Forma casais monogâmicos para a vida toda',
      'Suas penas azuis e amarelas são usadas em artesanato indígena',
      'Come argila para neutralizar toxinas das sementes'
    ],
    dieta: 'Sementes, frutas, castanhas',
    tamanho: '80-90 cm',
    relacionados: ['arara-azul', 'papagaio-verdadeiro', 'periquito-rei']
  },
  'lobo-guará': {
    nome_comum: 'Lobo-guará',
    nome_cientifico: 'Chrysocyon brachyurus',
    tipo: 'Mamífero',
    familia: 'Canidae',
    habitat: 'Cerrado, Campos',
    conservacao: 'Vulnerável',
    curiosidades: [
      'Maior canídeo da América do Sul',
      'Suas pernas longas são adaptação para andar no capim alto',
      'É onívoro e adora fruta-do-lobo (lobeira)',
      'Sua urina tem cheiro forte que marca território',
      'É solitário e noturno'
    ],
    dieta: 'Frutas, pequenos mamíferos, aves, insetos',
    tamanho: '95-115 cm (corpo)',
    relacionados: ['cachorro-do-mato', 'raposa-do-campo']
  },
  'tamanduá-bandeira': {
    nome_comum: 'Tamanduá-bandeira',
    nome_cientifico: 'Myrmecophaga tridactyla',
    tipo: 'Mamífero',
    familia: 'Myrmecophagidae',
    habitat: 'Cerrado, Pantanal, Amazônia',
    conservacao: 'Vulnerável',
    curiosidades: [
      'Come até 30.000 formigas e cupins por dia',
      'Sua língua tem 60 cm e é coberta de saliva pegajosa',
      'Não tem dentes',
      'Suas garras são tão fortes que podem matar uma onça',
      'Carrega o filhote nas costas por até 1 ano'
    ],
    dieta: 'Formigas, cupins',
    tamanho: '1,8-2,2 m (com cauda)',
    relacionados: ['tamanduá-mirim', 'tatu-canastra']
  },
  'seriema': {
    nome_comum: 'Seriema',
    nome_cientifico: 'Cariama cristata',
    tipo: 'Ave',
    familia: 'Cariamidae',
    habitat: 'Cerrado, Campos',
    conservacao: 'Pouco Preocupante',
    curiosidades: [
      'Parente vivo mais próximo dos dinossauros terror birds',
      'Mata presas batendo-as contra pedras',
      'Seu canto pode ser ouvido a 1 km de distância',
      'Prefere correr a voar',
      'Come cobras, inclusive venenosas'
    ],
    dieta: 'Insetos, cobras, lagartos, roedores',
    tamanho: '70-90 cm',
    relacionados: ['ema', 'jacutinga']
  },
  // Flora
  'pequi': {
    nome_comum: 'Pequi',
    nome_cientifico: 'Caryocar brasiliense',
    tipo: 'Flora',
    familia: 'Caryocaraceae',
    habitat: 'Cerrado',
    conservacao: 'Pouco Preocupante',
    curiosidades: [
      'Fruto símbolo do Cerrado e da culinária goiana',
      'NUNCA deve ser mordido - tem espinhos no caroço',
      'Uma árvore pode produzir até 6.000 frutos por ano',
      'O óleo é usado em cosméticos e culinária',
      'Floresce de setembro a novembro'
    ],
    floracao: 'Setembro a Novembro',
    frutificacao: 'Novembro a Fevereiro',
    relacionados: ['baru', 'mangaba', 'cagaita']
  },
  'buriti': {
    nome_comum: 'Buriti',
    nome_cientifico: 'Mauritia flexuosa',
    tipo: 'Flora',
    familia: 'Arecaceae',
    habitat: 'Veredas, áreas alagadas do Cerrado',
    conservacao: 'Pouco Preocupante',
    curiosidades: [
      'Conhecida como "árvore da vida" do Cerrado',
      'Todas as partes são aproveitadas: fruto, folha, tronco',
      'Indica presença de água no subsolo',
      'O fruto é rico em vitamina A e betacaroteno',
      'As veredas de buriti são berçários de fauna'
    ],
    floracao: 'Abril a Agosto',
    frutificacao: 'Dezembro a Março',
    relacionados: ['bacaba', 'açaí', 'babaçu']
  },
  'ipê-amarelo': {
    nome_comum: 'Ipê-amarelo',
    nome_cientifico: 'Handroanthus albus',
    tipo: 'Flora',
    familia: 'Bignoniaceae',
    habitat: 'Cerrado, Mata Atlântica',
    conservacao: 'Pouco Preocupante',
    curiosidades: [
      'Árvore símbolo do Brasil',
      'Floresce no inverno, quando perde todas as folhas',
      'Sua madeira é uma das mais resistentes do Brasil',
      'Existem ipês de várias cores: amarelo, roxo, rosa, branco',
      'As flores são comestíveis e usadas em saladas'
    ],
    floracao: 'Julho a Setembro',
    relacionados: ['ipê-roxo', 'ipê-rosa', 'ipê-branco']
  }
};

// Adiciona ao EcoChatbot
EcoChatbot.SPECIES_KNOWLEDGE = SPECIES_KNOWLEDGE;


/**
 * Identifica espécie a partir de descrição ou imagem
 * Prompt 35/30: Identificação via chatbot
 * @param {string} descricao - Descrição da espécie observada
 * @param {string} imageUrl - URL da imagem (opcional)
 * @returns {object} Identificação com informações educacionais
 */
EcoChatbot.identifySpecies = function(descricao, imageUrl) {
  try {
    if (!descricao || descricao.trim().length < 5) {
      return { 
        success: false, 
        error: 'Por favor, descreva o que você viu com mais detalhes! 🔍' 
      };
    }

    // Primeiro tenta encontrar na base local
    const localMatch = this._searchLocalKnowledge(descricao);
    if (localMatch) {
      return this._formatSpeciesResponse(localMatch, 95);
    }

    // Usa Gemini AI para identificação
    const aiResult = this._identifyWithAI(descricao, imageUrl);
    if (aiResult.success) {
      // Tenta enriquecer com dados locais
      const enriched = this._enrichWithLocalData(aiResult.identificacao);
      return this._formatSpeciesResponse(enriched, aiResult.confianca);
    }

    // Fallback
    return {
      success: true,
      identificacao: null,
      message: `🤔 Não consegui identificar com certeza. Pode me dar mais detalhes?\n\n` +
               `Tente descrever:\n` +
               `• Cor e tamanho\n` +
               `• Formato das folhas/penas/pelo\n` +
               `• Onde você viu (árvore, chão, água)\n` +
               `• Comportamento (se for animal)`,
      sugestoes: ['Mostrar espécies comuns', 'Descrever novamente', 'Ver guia de identificação']
    };

  } catch (error) {
    Logger.log(`[identifySpecies] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Busca na base de conhecimento local
 * @private
 */
EcoChatbot._searchLocalKnowledge = function(descricao) {
  const termos = descricao.toLowerCase();
  
  for (const [key, especie] of Object.entries(SPECIES_KNOWLEDGE)) {
    if (termos.includes(key) || 
        termos.includes(especie.nome_comum.toLowerCase()) ||
        termos.includes(especie.nome_cientifico.toLowerCase())) {
      return especie;
    }
  }
  
  // Busca por características
  const caracteristicas = {
    'azul e amarelo': 'arara-canindé',
    'pernas longas': 'lobo-guará',
    'língua comprida': 'tamanduá-bandeira',
    'come formiga': 'tamanduá-bandeira',
    'crista na cabeça': 'seriema',
    'fruto espinhoso': 'pequi',
    'palmeira': 'buriti',
    'flor amarela': 'ipê-amarelo'
  };
  
  for (const [caract, especieKey] of Object.entries(caracteristicas)) {
    if (termos.includes(caract)) {
      return SPECIES_KNOWLEDGE[especieKey];
    }
  }
  
  return null;
};


/**
 * Identifica espécie usando Gemini AI
 * @private
 */
EcoChatbot._identifyWithAI = function(descricao, imageUrl) {
  try {
    const prompt = `Você é um especialista em biodiversidade do Cerrado brasileiro.

DESCRIÇÃO DO USUÁRIO:
"${descricao}"
${imageUrl ? `\nImagem: ${imageUrl}` : ''}

TAREFA: Identifique a espécie descrita e forneça informações educacionais.

RESPONDA EM JSON:
{
  "nome_comum": "Nome popular",
  "nome_cientifico": "Gênero espécie",
  "tipo": "Flora/Fauna/Ave/Mamífero/Réptil/Anfíbio/Inseto",
  "confianca": 0-100,
  "descricao_breve": "Uma frase sobre a espécie",
  "curiosidades": ["Fato 1", "Fato 2", "Fato 3"],
  "habitat": "Onde vive",
  "conservacao": "Status IUCN",
  "dica_observacao": "Dica para observar na natureza"
}

Se não conseguir identificar, retorne confianca: 0 e explique o motivo.`;

    // Verifica se GeminiAI está disponível
    if (typeof GeminiAIService === 'undefined') {
      return { success: false, error: 'Serviço de IA não disponível' };
    }

    const aiResponse = GeminiAIService.callGemini(prompt, { maxTokens: 800 });
    
    if (!aiResponse.success) {
      return { success: false, error: aiResponse.error };
    }

    // Parseia resposta JSON
    const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Resposta inválida da IA' };
    }

    const data = JSON.parse(jsonMatch[0]);
    
    if (data.confianca < 30) {
      return { success: false, error: 'Confiança muito baixa na identificação' };
    }

    return {
      success: true,
      identificacao: {
        nome_comum: data.nome_comum,
        nome_cientifico: data.nome_cientifico,
        tipo: data.tipo,
        descricao: data.descricao_breve,
        curiosidades: data.curiosidades || [],
        habitat: data.habitat,
        conservacao: data.conservacao,
        dica_observacao: data.dica_observacao
      },
      confianca: data.confianca
    };

  } catch (error) {
    Logger.log(`[_identifyWithAI] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Enriquece dados da IA com conhecimento local
 * @private
 */
EcoChatbot._enrichWithLocalData = function(identificacao) {
  if (!identificacao || !identificacao.nome_comum) return identificacao;
  
  const key = identificacao.nome_comum.toLowerCase().replace(/-/g, '-');
  const local = SPECIES_KNOWLEDGE[key];
  
  if (local) {
    return {
      ...identificacao,
      curiosidades: local.curiosidades || identificacao.curiosidades,
      relacionados: local.relacionados || [],
      familia: local.familia,
      dieta: local.dieta,
      tamanho: local.tamanho,
      floracao: local.floracao,
      frutificacao: local.frutificacao
    };
  }
  
  return identificacao;
};


/**
 * Formata resposta de identificação para o chatbot
 * @private
 */
EcoChatbot._formatSpeciesResponse = function(especie, confianca) {
  if (!especie) {
    return { success: false, error: 'Espécie não encontrada' };
  }

  const emoji = this._getSpeciesEmoji(especie.tipo);
  
  let texto = `${emoji} **${especie.nome_comum}**\n`;
  texto += `*${especie.nome_cientifico || 'Nome científico não disponível'}*\n\n`;
  
  if (especie.descricao) {
    texto += `📝 ${especie.descricao}\n\n`;
  }
  
  texto += `📋 **Informações:**\n`;
  texto += `• Tipo: ${especie.tipo || 'Não classificado'}\n`;
  if (especie.familia) texto += `• Família: ${especie.familia}\n`;
  if (especie.habitat) texto += `• Habitat: ${especie.habitat}\n`;
  if (especie.conservacao) texto += `• Conservação: ${especie.conservacao}\n`;
  if (especie.tamanho) texto += `• Tamanho: ${especie.tamanho}\n`;
  if (especie.dieta) texto += `• Dieta: ${especie.dieta}\n`;
  if (especie.floracao) texto += `• Floração: ${especie.floracao}\n`;
  
  if (especie.curiosidades && especie.curiosidades.length > 0) {
    texto += `\n💡 **Curiosidades:**\n`;
    especie.curiosidades.slice(0, 3).forEach(c => {
      texto += `• ${c}\n`;
    });
  }
  
  if (especie.dica_observacao) {
    texto += `\n🔍 **Dica:** ${especie.dica_observacao}\n`;
  }

  // Sugestões contextuais
  const sugestoes = [];
  if (especie.relacionados && especie.relacionados.length > 0) {
    sugestoes.push(`Ver espécies relacionadas`);
  }
  sugestoes.push(`Mais curiosidades sobre ${especie.nome_comum}`);
  sugestoes.push('Identificar outra espécie');

  return {
    success: true,
    identificacao: {
      nome_comum: especie.nome_comum,
      nome_cientifico: especie.nome_cientifico,
      tipo: especie.tipo,
      confianca: confianca
    },
    educacional: {
      descricao: especie.descricao,
      curiosidades: especie.curiosidades || [],
      habitat: especie.habitat,
      conservacao: especie.conservacao,
      familia: especie.familia
    },
    response: {
      text: texto,
      type: 'species_identification'
    },
    relacionados: especie.relacionados || [],
    sugestoes: sugestoes
  };
};

/**
 * Obtém emoji baseado no tipo de espécie
 * @private
 */
EcoChatbot._getSpeciesEmoji = function(tipo) {
  const emojis = {
    'Ave': '🦜',
    'Mamífero': '🦊',
    'Réptil': '🦎',
    'Anfíbio': '🐸',
    'Inseto': '🦋',
    'Flora': '🌿',
    'Árvore': '🌳',
    'Palmeira': '🌴',
    'Peixe': '🐟'
  };
  return emojis[tipo] || '🔍';
};


/**
 * Obtém informações detalhadas de uma espécie
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Informações completas
 */
EcoChatbot.getSpeciesInfo = function(especieNome) {
  try {
    if (!especieNome) {
      return { success: false, error: 'Nome da espécie é obrigatório' };
    }

    const key = especieNome.toLowerCase().replace(/ /g, '-');
    const especie = SPECIES_KNOWLEDGE[key];

    if (especie) {
      return this._formatSpeciesResponse(especie, 100);
    }

    // Tenta buscar via AI
    return this.identifySpecies(`Informações sobre ${especieNome}`);

  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtém espécies relacionadas
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Lista de espécies relacionadas
 */
EcoChatbot.getSimilarSpecies = function(especieNome) {
  try {
    if (!especieNome) {
      return { success: false, error: 'Nome da espécie é obrigatório' };
    }

    const key = especieNome.toLowerCase().replace(/ /g, '-');
    const especie = SPECIES_KNOWLEDGE[key];

    if (!especie || !especie.relacionados) {
      return { 
        success: true, 
        relacionados: [],
        message: 'Não encontrei espécies relacionadas na base de dados.'
      };
    }

    const relacionados = especie.relacionados.map(nome => {
      const relKey = nome.toLowerCase().replace(/ /g, '-');
      const relEspecie = SPECIES_KNOWLEDGE[relKey];
      
      return {
        nome: nome,
        nome_cientifico: relEspecie?.nome_cientifico || '',
        tipo: relEspecie?.tipo || especie.tipo,
        disponivel_detalhes: !!relEspecie
      };
    });

    return {
      success: true,
      especie_base: especieNome,
      relacionados: relacionados,
      total: relacionados.length
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtém curiosidades de uma espécie
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Lista de curiosidades
 */
EcoChatbot.getSpeciesCuriosities = function(especieNome) {
  try {
    if (!especieNome) {
      return { success: false, error: 'Nome da espécie é obrigatório' };
    }

    const key = especieNome.toLowerCase().replace(/ /g, '-');
    const especie = SPECIES_KNOWLEDGE[key];

    if (especie && especie.curiosidades) {
      const emoji = this._getSpeciesEmoji(especie.tipo);
      
      let texto = `${emoji} **Curiosidades sobre ${especie.nome_comum}:**\n\n`;
      especie.curiosidades.forEach((c, i) => {
        texto += `${i + 1}. ${c}\n\n`;
      });

      return {
        success: true,
        especie: especie.nome_comum,
        curiosidades: especie.curiosidades,
        response: {
          text: texto,
          type: 'curiosities'
        },
        sugestoes: ['Ver informações completas', 'Espécies relacionadas', 'Identificar outra']
      };
    }

    // Gera via AI se não encontrar
    return this.identifySpecies(`Curiosidades interessantes sobre ${especieNome}`);

  } catch (error) {
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Species Identification (Prompt 35/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Identifica espécie a partir de descrição ou imagem
 * @param {string} descricao - Descrição do que foi observado
 * @param {string} imageUrl - URL da imagem (opcional)
 * @returns {object} Identificação com informações educacionais
 */
function apiChatbotIdentifySpecies(descricao, imageUrl) {
  return EcoChatbot.identifySpecies(descricao, imageUrl);
}

/**
 * API: Obtém informações detalhadas de uma espécie
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Informações completas da espécie
 */
function apiChatbotGetSpeciesInfo(especieNome) {
  return EcoChatbot.getSpeciesInfo(especieNome);
}

/**
 * API: Obtém espécies relacionadas
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Lista de espécies relacionadas
 */
function apiChatbotGetSimilarSpecies(especieNome) {
  return EcoChatbot.getSimilarSpecies(especieNome);
}

/**
 * API: Obtém curiosidades de uma espécie
 * @param {string} especieNome - Nome da espécie
 * @returns {object} Lista de curiosidades formatada
 */
function apiChatbotGetSpeciesCuriosities(especieNome) {
  return EcoChatbot.getSpeciesCuriosities(especieNome);
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 43/30 (30/30): CONSULTA GERAL E FAQ DO CHATBOT
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Conversational AI Best Practices
// - FAQ Design for User Experience

/**
 * Categorias de FAQ
 */
const FAQ_CATEGORIES = {
  VISITA: { id: 'VISITA', nome: 'Planejando sua Visita', icone: '📅' },
  ALIMENTACAO: { id: 'ALIMENTACAO', nome: 'Alimentação', icone: '🍽️' },
  ACESSIBILIDADE: { id: 'ACESSIBILIDADE', nome: 'Acessibilidade', icone: '♿' },
  PRECOS: { id: 'PRECOS', nome: 'Preços e Ingressos', icone: '💰' },
  ATIVIDADES: { id: 'ATIVIDADES', nome: 'Atividades', icone: '🥾' },
  HOSPEDAGEM: { id: 'HOSPEDAGEM', nome: 'Hospedagem', icone: '🏕️' },
  SEGURANCA: { id: 'SEGURANCA', nome: 'Segurança', icone: '🛡️' },
  GERAL: { id: 'GERAL', nome: 'Informações Gerais', icone: 'ℹ️' }
};

/**
 * Base de conhecimento FAQ
 */
const FAQ_DATABASE = {
  // Visita
  'melhor epoca visitar': {
    categoria: 'VISITA',
    pergunta: 'Qual a melhor época para visitar?',
    resposta: 'A melhor época para visitar a Reserva Araras é durante a estação seca (maio a setembro). O clima é mais ameno, as trilhas estão secas e a observação de fauna é facilitada. Para ver ipês floridos, visite entre julho e setembro. Para observar aves migratórias, prefira outubro a março.',
    keywords: ['melhor', 'época', 'visitar', 'quando', 'período', 'mês']
  },
  'horario funcionamento': {
    categoria: 'VISITA',
    pergunta: 'Qual o horário de funcionamento?',
    resposta: 'A Reserva Araras funciona de terça a domingo, das 8h às 17h. A última entrada é às 15h para garantir tempo suficiente para as trilhas. Aos sábados e domingos, abrimos às 7h para observação de aves.',
    keywords: ['horário', 'funcionamento', 'abre', 'fecha', 'entrada']
  },
  'como chegar': {
    categoria: 'VISITA',
    pergunta: 'Como chegar à reserva?',
    resposta: 'A Reserva Araras fica a 45km do centro da cidade. Acesso pela rodovia XX, km 32. Há estacionamento gratuito. Não há transporte público direto, mas oferecemos transfer mediante agendamento. Coordenadas GPS: -15.XXXX, -47.XXXX',
    keywords: ['chegar', 'localização', 'endereço', 'como', 'onde', 'gps']
  },
  
  // Alimentação
  'comida vegana': {
    categoria: 'ALIMENTACAO',
    pergunta: 'Vocês têm opções veganas?',
    resposta: 'Sim! Nossa lanchonete oferece opções veganas e vegetarianas, incluindo sanduíches, saladas e sucos naturais. Também temos opções sem glúten. Recomendamos avisar com antecedência para refeições especiais em grupos.',
    keywords: ['vegana', 'vegano', 'vegetariana', 'vegetariano', 'comida', 'alimentação']
  },
  'pode levar comida': {
    categoria: 'ALIMENTACAO',
    pergunta: 'Posso levar minha própria comida?',
    resposta: 'Sim, você pode trazer lanches e água. Temos áreas de piquenique designadas. Pedimos que não deixe lixo nas trilhas e evite alimentos com cheiro forte que possam atrair animais. Bebidas alcoólicas não são permitidas.',
    keywords: ['levar', 'trazer', 'comida', 'lanche', 'piquenique']
  },
  
  // Acessibilidade
  'cadeira rodas': {
    categoria: 'ACESSIBILIDADE',
    pergunta: 'A reserva é acessível para cadeirantes?',
    resposta: 'O Centro de Visitantes e a Trilha Acessível (500m) são totalmente adaptados para cadeiras de rodas. Oferecemos cadeiras de rodas para empréstimo. As demais trilhas têm terreno irregular. Temos banheiros adaptados e estacionamento preferencial.',
    keywords: ['cadeira', 'rodas', 'acessível', 'acessibilidade', 'deficiente', 'mobilidade']
  },
  'criancas': {
    categoria: 'ACESSIBILIDADE',
    pergunta: 'É adequado para crianças?',
    resposta: 'Sim! Temos trilhas adequadas para todas as idades. A Trilha dos Sentidos é especialmente projetada para crianças. Oferecemos programas educativos para escolas e atividades de férias. Crianças menores de 12 anos devem estar acompanhadas por adultos.',
    keywords: ['criança', 'crianças', 'filho', 'filhos', 'família', 'infantil']
  },
  
  // Preços
  'quanto custa': {
    categoria: 'PRECOS',
    pergunta: 'Quanto custa a entrada?',
    resposta: 'Entrada: R$ 30 (adulto), R$ 15 (meia-entrada para estudantes, idosos e crianças 6-12 anos). Crianças até 5 anos não pagam. Moradores locais têm 50% de desconto. Pacotes para grupos e escolas disponíveis.',
    keywords: ['quanto', 'custa', 'preço', 'valor', 'entrada', 'ingresso', 'pagar']
  },
  'formas pagamento': {
    categoria: 'PRECOS',
    pergunta: 'Quais formas de pagamento são aceitas?',
    resposta: 'Aceitamos dinheiro, cartões de débito e crédito (Visa, Master, Elo), e PIX. Para grupos e eventos, também aceitamos transferência bancária com antecedência.',
    keywords: ['pagamento', 'pagar', 'cartão', 'pix', 'dinheiro']
  },
  
  // Atividades
  'trilhas disponiveis': {
    categoria: 'ATIVIDADES',
    pergunta: 'Quais trilhas estão disponíveis?',
    resposta: 'Temos 5 trilhas: Trilha da Nascente (2km, fácil), Trilha do Mirante (3km, moderada), Trilha do Cerrado (4km, moderada), Trilha da Mata (5km, difícil) e Trilha Acessível (500m, fácil). Todas são autoguiadas com sinalização.',
    keywords: ['trilha', 'trilhas', 'caminhada', 'percurso', 'disponível']
  },
  'observacao aves': {
    categoria: 'ATIVIDADES',
    pergunta: 'Como funciona a observação de aves?',
    resposta: 'Oferecemos tours guiados de observação de aves aos sábados e domingos às 6h (R$ 60). Já registramos mais de 200 espécies! Traga binóculos e câmera. Também temos pontos de observação autoguiados ao longo das trilhas.',
    keywords: ['aves', 'pássaros', 'observação', 'birdwatching', 'passarinho']
  },
  
  // Hospedagem
  'onde ficar': {
    categoria: 'HOSPEDAGEM',
    pergunta: 'Há hospedagem na reserva?',
    resposta: 'Temos área de camping (R$ 40/pessoa) com banheiros e chuveiros. Para maior conforto, há pousadas parceiras a 10km. Não temos chalés próprios, mas estamos construindo eco-lodges para 2026.',
    keywords: ['hospedagem', 'dormir', 'ficar', 'camping', 'pousada', 'hotel']
  },
  
  // Segurança
  'animais perigosos': {
    categoria: 'SEGURANCA',
    pergunta: 'Há animais perigosos?',
    resposta: 'A fauna é selvagem mas geralmente evita humanos. Mantenha distância de todos os animais. Há cobras (raras de ver), mas nossas trilhas são bem mantidas. Use calçado fechado e não alimente animais. Em caso de encontro, mantenha calma e afaste-se lentamente.',
    keywords: ['perigoso', 'cobra', 'onça', 'animal', 'seguro', 'segurança', 'risco']
  }
};

// Adiciona ao EcoChatbot
EcoChatbot.FAQ_CATEGORIES = FAQ_CATEGORIES;
EcoChatbot.FAQ_DATABASE = FAQ_DATABASE;

/**
 * Responde pergunta de FAQ
 * @param {string} pergunta - Pergunta do usuário
 * @returns {object} Resposta da FAQ
 */
EcoChatbot.answerFAQ = function(pergunta) {
  try {
    if (!pergunta || pergunta.trim().length < 3) {
      return {
        success: true,
        tipo: 'sugestoes',
        mensagem: 'Como posso ajudar? Aqui estão algumas perguntas frequentes:',
        sugestoes: this.getSuggestedQuestions().questions.slice(0, 5)
      };
    }
    
    const perguntaLower = pergunta.toLowerCase();
    
    // Busca na base de FAQ
    let melhorMatch = null;
    let melhorScore = 0;
    
    for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
      let score = 0;
      
      // Verifica keywords
      faq.keywords.forEach(kw => {
        if (perguntaLower.includes(kw)) {
          score += 2;
        }
      });
      
      // Verifica match parcial na chave
      if (perguntaLower.includes(key.split(' ')[0])) {
        score += 1;
      }
      
      if (score > melhorScore) {
        melhorScore = score;
        melhorMatch = faq;
      }
    }
    
    if (melhorMatch && melhorScore >= 2) {
      const categoria = FAQ_CATEGORIES[melhorMatch.categoria];
      
      return {
        success: true,
        tipo: 'resposta',
        categoria: categoria,
        pergunta_identificada: melhorMatch.pergunta,
        resposta: melhorMatch.resposta,
        confianca: Math.min(0.95, melhorScore * 0.15),
        relacionadas: this._getRelatedQuestions(melhorMatch.categoria)
      };
    }
    
    // Tenta resposta com IA se não encontrou match
    const aiResponse = this._generateAIResponse(pergunta);
    if (aiResponse) {
      return {
        success: true,
        tipo: 'ia',
        resposta: aiResponse,
        aviso: 'Resposta gerada por IA. Para informações oficiais, entre em contato conosco.',
        sugestoes: this.getSuggestedQuestions().questions.slice(0, 3)
      };
    }
    
    // Fallback
    return {
      success: true,
      tipo: 'nao_encontrado',
      mensagem: 'Não encontrei uma resposta específica para sua pergunta. Tente reformular ou escolha uma das perguntas abaixo:',
      sugestoes: this.getSuggestedQuestions().questions.slice(0, 5),
      contato: {
        email: 'contato@reservaararas.org',
        telefone: '(XX) XXXX-XXXX',
        whatsapp: 'https://wa.me/55XXXXXXXXXXX'
      }
    };
  } catch (error) {
    Logger.log(`[answerFAQ] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Gera resposta com IA
 * @private
 */
EcoChatbot._generateAIResponse = function(pergunta) {
  try {
    if (typeof GeminiAIService === 'undefined') return null;
    
    const prompt = `
Você é o assistente virtual da Reserva Araras, uma reserva de conservação do Cerrado brasileiro.
Responda de forma amigável e concisa (máximo 3 frases) à seguinte pergunta do visitante:

"${pergunta}"

Se não souber a resposta, diga que não tem essa informação e sugira entrar em contato.
Responda em português brasileiro.
`;
    
    const response = GeminiAIService.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    if (response && response.candidates && response.candidates[0]) {
      return response.candidates[0].content.parts[0].text;
    }
    
    return null;
  } catch (error) {
    Logger.log(`[_generateAIResponse] Erro: ${error}`);
    return null;
  }
};

/**
 * Obtém perguntas relacionadas
 * @private
 */
EcoChatbot._getRelatedQuestions = function(categoria) {
  const relacionadas = [];
  
  for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
    if (faq.categoria === categoria && relacionadas.length < 3) {
      relacionadas.push(faq.pergunta);
    }
  }
  
  return relacionadas;
};

/**
 * Obtém categorias de FAQ
 * @returns {object} Categorias
 */
EcoChatbot.getFAQCategories = function() {
  const categorias = Object.values(FAQ_CATEGORIES).map(cat => {
    const perguntas = Object.values(FAQ_DATABASE)
      .filter(faq => faq.categoria === cat.id)
      .map(faq => faq.pergunta);
    
    return {
      ...cat,
      total_perguntas: perguntas.length,
      perguntas: perguntas
    };
  });
  
  return {
    success: true,
    categorias,
    total: Object.keys(FAQ_DATABASE).length
  };
};

/**
 * Obtém perguntas sugeridas
 * @returns {object} Perguntas sugeridas
 */
EcoChatbot.getSuggestedQuestions = function() {
  const perguntas = [
    'Qual a melhor época para visitar?',
    'Quanto custa a entrada?',
    'Vocês têm opções veganas?',
    'A reserva é acessível para cadeirantes?',
    'Quais trilhas estão disponíveis?',
    'Como funciona a observação de aves?',
    'Há hospedagem na reserva?',
    'Qual o horário de funcionamento?',
    'É adequado para crianças?',
    'Como chegar à reserva?'
  ];
  
  return {
    success: true,
    questions: perguntas,
    mensagem: 'Perguntas frequentes dos visitantes:'
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Chatbot FAQ (Prompt 43/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Responde pergunta de FAQ
 * @param {string} pergunta - Pergunta do usuário
 */
function apiChatbotFAQ(pergunta) {
  return EcoChatbot.answerFAQ(pergunta);
}

/**
 * API: Obtém categorias de FAQ
 */
function apiChatbotGetFAQCategories() {
  return EcoChatbot.getFAQCategories();
}

/**
 * API: Obtém perguntas sugeridas
 */
function apiChatbotSuggestQuestions() {
  return EcoChatbot.getSuggestedQuestions();
}
