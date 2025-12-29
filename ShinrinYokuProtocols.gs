/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHINRIN-YOKU PROTOCOLS - Protocolos de Banho de Floresta
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Implementação dos protocolos terapêuticos de Shinrin-yoku (森林浴)
 * para a chatbot Serena da Reserva Araras.
 * 
 * Baseado em:
 * - Forest Therapy Guide (ANFT)
 * - Pesquisas de Qing Li (Nippon Medical School)
 * - Protocolos de Convites Sensoriais
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Protocolos de Shinrin-yoku
 * @namespace ShinrinYokuProtocols
 */
const ShinrinYokuProtocols = {

  /**
   * Configurações do protocolo
   */
  CONFIG: {
    sessionDuration: { min: 60, max: 180 }, // minutos
    invitationPause: 3000, // ms entre convites
    minInvitations: 5,
    maxInvitations: 12
  },

  /**
   * Fases de uma sessão de Shinrin-yoku
   */
  PHASES: {
    THRESHOLD: 'threshold',      // Limiar - entrada consciente
    AWAKENING: 'awakening',      // Despertar sensorial
    IMMERSION: 'immersion',      // Imersão profunda
    REFLECTION: 'reflection',    // Reflexão e integração
    CLOSING: 'closing'           // Fechamento e gratidão
  },

  /**
   * Biblioteca de Convites (Invitations) - O coração do Shinrin-yoku
   * Cada convite guia a atenção sensorial sem ser diretivo
   */
  INVITATIONS: {
    
    // ═══════════════════════════════════════════════════════════════════════
    // FASE 1: O LIMIAR (The Threshold)
    // ═══════════════════════════════════════════════════════════════════════
    threshold: [
      {
        id: 'threshold_portal',
        name: 'O Portal',
        phase: 'threshold',
        duration: '3-5 min',
        script: `🌿 **Convite: O Portal**

Encontre um portal físico onde você está — pode ser a entrada da trilha, uma mudança na vegetação, ou simplesmente uma linha imaginária no chão.

Pare. Respire fundo três vezes.

Este é o limiar entre o mundo cotidiano e o tempo da floresta.

Quando estiver pronto, atravesse esse portal lentamente, deixando para trás:
• As preocupações do dia
• A pressa do relógio
• As expectativas

Do outro lado, apenas você e a floresta existem.

*Atravesse quando sentir que é o momento.*`,
        followUp: 'Como foi atravessar esse portal? O que você deixou para trás?'
      },
      {
        id: 'threshold_permission',
        name: 'Pedindo Permissão',
        phase: 'threshold',
        duration: '2-3 min',
        script: `🌳 **Convite: Pedindo Permissão**

Antes de entrar mais profundamente na floresta, pause um momento.

Em muitas culturas tradicionais, pede-se permissão à floresta antes de entrar.

Não precisa ser em voz alta. Pode ser um pensamento silencioso, uma intenção:

*"Floresta, peço permissão para entrar em seu espaço. Venho em paz, buscando conexão e cura."*

Sinta se há uma resposta — talvez uma brisa, um som de pássaro, ou simplesmente uma sensação de acolhimento.

A floresta sempre diz sim a quem vem com respeito. 💚`,
        followUp: 'Você sentiu alguma resposta da floresta?'
      }
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 2: DESPERTAR SENSORIAL (Sensory Awakening)
    // ═══════════════════════════════════════════════════════════════════════
    awakening: [
      {
        id: 'awakening_radar',
        name: 'O Radar Sensorial',
        phase: 'awakening',
        duration: '5-7 min',
        script: `📡 **Convite: O Radar Sensorial**

Pare e fique completamente imóvel.

Imagine que sua pele é um radar sensível, captando tudo ao redor.

**Tato:**
• Sinta a direção do vento em seu rosto
• Note a temperatura do ar em suas bochechas
• Perceba onde o sol toca sua pele

**Audição:**
Feche os olhos. Expanda sua audição como ondas em um lago.
• Qual é o som mais distante que você consegue ouvir?
• E o mais próximo?
• Há camadas de sons entre eles?

**Olfato:**
Inspire profundamente pelo nariz.
• Que aromas a floresta oferece agora?
• Terra úmida? Folhas? Flores?

Permaneça neste estado de radar por alguns minutos. 🌬️`,
        followUp: 'Quais sentidos estavam mais despertos? O que você descobriu?'
      },
      {
        id: 'awakening_colors',
        name: 'Paleta de Verdes',
        phase: 'awakening',
        duration: '4-5 min',
        script: `🎨 **Convite: Paleta de Verdes**

O Cerrado tem uma riqueza de verdes que muitas vezes não notamos.

Olhe ao seu redor e encontre:

• O verde mais escuro que você consegue ver
• O verde mais claro
• Um verde amarelado
• Um verde azulado
• Um verde prateado (olhe as folhas por baixo!)

Quantos tons diferentes você consegue contar?

Os japoneses têm dezenas de palavras para tons de verde. 
Cada um conta uma história sobre a planta, a estação, a luz.

Que história os verdes ao seu redor estão contando? 🌿`,
        followUp: 'Quantos tons de verde você encontrou? Algum te surpreendeu?'
      }
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 3: IMERSÃO PROFUNDA (Deep Immersion)
    // ═══════════════════════════════════════════════════════════════════════
    immersion: [
      {
        id: 'immersion_tree_breathing',
        name: 'Respirando com a Árvore',
        phase: 'immersion',
        duration: '8-10 min',
        script: `🌳 **Convite: Respirando com a Árvore**

Encontre uma árvore que te atraia. Não escolha com a mente — deixe seu corpo guiar.

Aproxime-se dela. Se sentir vontade, toque sua casca.

Agora, fique diante dela e sincronize sua respiração:

**Ao inspirar:**
Visualize que você está inalando o oxigênio que ela acabou de produzir.
Sinta esse presente entrando em seus pulmões.

**Ao expirar:**
Ofereça seu dióxido de carbono a ela.
É o alimento que ela precisa para viver.

Vocês estão em um ciclo de reciprocidade.
Você e a árvore estão respirando juntos.
Sempre estiveram.

Continue por pelo menos 10 respirações. 💚

*Esta troca acontece a cada segundo da sua vida. Hoje, você está consciente dela.*`,
        followUp: 'Como foi respirar conscientemente com a árvore? O que você sentiu?'
      },
      {
        id: 'immersion_mirror',
        name: 'O Espelho da Paisagem',
        phase: 'immersion',
        duration: '7-10 min',
        script: `🪞 **Convite: O Espelho da Paisagem**

Caminhe lentamente, sem destino.

Deixe que algo na paisagem chame sua atenção — não procure, deixe que venha até você.

Pode ser:
• Uma pedra com formato interessante
• Uma folha caída
• Uma raiz retorcida
• Um galho quebrado
• Uma flor solitária

Quando encontrar, aproxime-se. Observe com curiosidade.

Agora, a pergunta profunda:

**O que neste elemento reflete como você está se sentindo neste momento?**

A natureza frequentemente nos mostra o que precisamos ver.
A raiz retorcida pode falar de resiliência.
A folha caída, de deixar ir.
A flor solitária, de beleza na simplicidade.

O que a floresta está te mostrando sobre você? 🌸`,
        followUp: 'O que você encontrou? O que ele refletiu sobre você?'
      },
      {
        id: 'immersion_sit_spot',
        name: 'Lugar de Sentar',
        phase: 'immersion',
        duration: '15-20 min',
        script: `🧘 **Convite: Seu Lugar de Sentar**

Encontre um lugar onde você possa sentar confortavelmente.

Não precisa ser perfeito. A floresta não julga.

Sente-se e simplesmente... esteja.

Não há nada para fazer.
Não há nada para alcançar.
Não há lugar para ir.

Você já chegou.

Deixe a floresta vir até você:
• Os sons que se aproximam
• Os insetos que passam
• A luz que muda
• O vento que visita

Você é parte desta paisagem agora.
Tão natural quanto a pedra ao seu lado.

Permaneça pelo tempo que sentir certo. ⏳`,
        followUp: 'Como foi simplesmente estar, sem fazer nada? O que veio até você?'
      }
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 4: REFLEXÃO E INTEGRAÇÃO
    // ═══════════════════════════════════════════════════════════════════════
    reflection: [
      {
        id: 'reflection_gratitude',
        name: 'Colheita de Gratidão',
        phase: 'reflection',
        duration: '5-7 min',
        script: `🙏 **Convite: Colheita de Gratidão**

Sua caminhada está chegando ao fim, mas antes de partir...

Olhe ao redor uma última vez.

Encontre três coisas pelas quais você é grato neste momento:

1. **Algo que você viu** que tocou seu coração
2. **Algo que você sentiu** (físico ou emocional)
3. **Algo que você aprendeu** sobre si mesmo

Não precisa ser grandioso. 
A gratidão mora nos detalhes:
• O formato de uma folha
• O calor do sol
• A descoberta de que você pode ficar em silêncio

Guarde essas três coisas como presentes da floresta. 🎁`,
        followUp: 'Quais foram suas três gratidões?'
      },
      {
        id: 'reflection_message',
        name: 'Mensagem da Floresta',
        phase: 'reflection',
        duration: '5 min',
        script: `💌 **Convite: Mensagem da Floresta**

Se a floresta pudesse te enviar uma mensagem hoje, qual seria?

Feche os olhos por um momento.

Pergunte silenciosamente:
*"Floresta, o que você quer me dizer?"*

Espere. Não force.

A resposta pode vir como:
• Uma palavra
• Uma imagem
• Uma sensação
• Uma memória
• Um som

Confie no que vier primeiro.
A floresta fala em uma linguagem anterior às palavras.

Qual foi a mensagem? 🌲`,
        followUp: 'Que mensagem você recebeu da floresta?'
      }
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 5: FECHAMENTO
    // ═══════════════════════════════════════════════════════════════════════
    closing: [
      {
        id: 'closing_threshold_return',
        name: 'Retorno pelo Portal',
        phase: 'closing',
        duration: '3-5 min',
        script: `🚪 **Convite: Retorno pelo Portal**

Chegou a hora de retornar.

Caminhe de volta ao portal por onde você entrou.

Mas antes de atravessá-lo, pause.

Olhe para trás, para a floresta.

Agradeça silenciosamente:
*"Obrigado(a) por me receber. Levo comigo o que aprendi."*

Agora, atravesse o portal de volta.

Do outro lado, o mundo cotidiano espera.
Mas você não é mais a mesma pessoa que entrou.

Carrega agora:
• A calma da floresta em seu corpo
• Os fitoncidas em seus pulmões
• A sabedoria dos convites em seu coração

A floresta estará sempre aqui quando você precisar voltar. 💚

*Bem-vindo(a) de volta.*`,
        followUp: 'Como você se sente agora comparado a quando começou?'
      },
      {
        id: 'closing_anchor',
        name: 'Âncora Sensorial',
        phase: 'closing',
        duration: '3 min',
        script: `⚓ **Convite: Criando uma Âncora**

Antes de partir completamente, vamos criar uma âncora.

Escolha um gesto simples — pode ser:
• Juntar as pontas dos dedos
• Tocar o coração
• Fechar os olhos e respirar fundo

Agora, enquanto faz esse gesto, reviva:
• A sensação de paz que você encontrou
• O momento mais significativo da caminhada
• A conexão com a natureza

Este gesto agora está conectado a essa sensação.

Nos próximos dias, quando precisar de um momento de calma, 
faça esse gesto e deixe a memória da floresta te envolver.

Você carrega a floresta dentro de você. 🌳`,
        followUp: 'Qual gesto você escolheu como sua âncora?'
      }
    ]
  },

  /**
   * Convites especiais para contextos específicos
   */
  SPECIAL_INVITATIONS: {
    // Para ansiedade aguda
    anxiety: {
      id: 'special_anxiety_ground',
      name: 'Raízes de Emergência',
      script: `🌳 **Convite de Emergência: Raízes**

Sinto que você precisa de aterramento agora.

Pare onde está. Não precisa ir a lugar nenhum.

Sinta seus pés no chão.
Imagine raízes crescendo deles, entrando na terra.

Respire:
• Inspire contando até 4
• Segure contando até 4  
• Expire contando até 6

A cada expiração, suas raízes vão mais fundo.
Você está seguro(a). A terra te sustenta.

Repita até sentir seus pés pesados e firmes.

A ansiedade é como vento — passa.
Você é como árvore — permanece. 💚`
    },
    
    // Para tristeza
    sadness: {
      id: 'special_sadness_water',
      name: 'Lágrimas da Floresta',
      script: `💧 **Convite: Lágrimas da Floresta**

A tristeza que você sente é válida.

Na floresta, a água é sagrada.
A chuva alimenta. O rio limpa. O orvalho renova.

Se precisar chorar, a floresta entende.
Suas lágrimas são água — retornam à terra.

Encontre um lugar seguro.
Deixe a tristeza fluir como um córrego.
Não a reprima.

A floresta já viu muitas tempestades.
E depois de cada uma, a vida continua mais verde.

Você também vai florescer novamente. 🌱`
    },
    
    // Para raiva
    anger: {
      id: 'special_anger_release',
      name: 'Entregando ao Vento',
      script: `🌬️ **Convite: Entregando ao Vento**

A raiva é energia. Não é boa nem má — é força.

Encontre um lugar onde você possa ficar sozinho(a).

Respire fundo e, na expiração, solte um som.
Pode ser um suspiro, um grito abafado, um "ahhhh".

Imagine que o vento leva essa energia embora.
Não para suprimir — para transformar.

A floresta transforma tudo:
• Folhas mortas viram adubo
• Árvores caídas viram lar
• Raiva pode virar clareza

O que sua raiva está tentando te dizer?
Que limite foi cruzado?
Que necessidade não foi atendida?

Ouça a mensagem. Depois, deixe o vento levar o resto. 🍃`
    }
  },

  /**
   * Inicia uma sessão de Shinrin-yoku
   * @param {object} context - Contexto do usuário
   * @returns {object} Primeiro convite da sessão
   */
  startSession(context = {}) {
    const sessionId = `SY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Seleciona convite inicial baseado no contexto
    let firstInvitation;
    
    if (context.emotionalState === 'anxious') {
      firstInvitation = this.SPECIAL_INVITATIONS.anxiety;
    } else if (context.emotionalState === 'sad') {
      firstInvitation = this.SPECIAL_INVITATIONS.sadness;
    } else {
      // Começa com o limiar
      firstInvitation = this.INVITATIONS.threshold[0];
    }
    
    return {
      success: true,
      sessionId,
      phase: 'threshold',
      currentInvitation: firstInvitation,
      response: {
        text: `🌲 **Sessão de Shinrin-yoku Iniciada**\n\n` +
              `Bem-vindo(a) ao Banho de Floresta.\n\n` +
              `Nos próximos minutos, vou te guiar através de convites sensoriais. ` +
              `Não há certo ou errado — apenas sua experiência.\n\n` +
              `Respire fundo. Estamos começando.\n\n` +
              `---\n\n${firstInvitation.script}`,
        type: 'shinrin_yoku_start',
        sessionId,
        phase: 'threshold'
      },
      nextPhase: 'awakening',
      totalPhases: 5
    };
  },

  /**
   * Avança para o próximo convite
   * @param {string} sessionId - ID da sessão
   * @param {string} currentPhase - Fase atual
   * @param {string} userFeedback - Feedback do usuário (opcional)
   */
  nextInvitation(sessionId, currentPhase, userFeedback = '') {
    const phaseOrder = ['threshold', 'awakening', 'immersion', 'reflection', 'closing'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    // Seleciona próximo convite
    let nextPhase = currentPhase;
    let invitations = this.INVITATIONS[currentPhase];
    
    // Se já usou todos da fase atual, avança
    if (currentIndex < phaseOrder.length - 1) {
      nextPhase = phaseOrder[currentIndex + 1];
      invitations = this.INVITATIONS[nextPhase];
    }
    
    if (!invitations || invitations.length === 0) {
      return this._endSession(sessionId, userFeedback);
    }
    
    // Seleciona convite aleatório da fase
    const invitation = invitations[Math.floor(Math.random() * invitations.length)];
    
    // Resposta empática ao feedback
    let empathyResponse = '';
    if (userFeedback) {
      empathyResponse = this._generateEmpathyResponse(userFeedback) + '\n\n---\n\n';
    }
    
    return {
      success: true,
      sessionId,
      phase: nextPhase,
      currentInvitation: invitation,
      response: {
        text: empathyResponse + invitation.script,
        type: 'shinrin_yoku_invitation',
        phase: nextPhase,
        invitationId: invitation.id
      },
      followUp: invitation.followUp
    };
  },

  /**
   * Obtém convite específico por ID
   * @param {string} invitationId - ID do convite
   */
  getInvitation(invitationId) {
    for (const phase of Object.values(this.INVITATIONS)) {
      for (const invitation of phase) {
        if (invitation.id === invitationId) {
          return { success: true, invitation };
        }
      }
    }
    
    // Verifica convites especiais
    for (const invitation of Object.values(this.SPECIAL_INVITATIONS)) {
      if (invitation.id === invitationId) {
        return { success: true, invitation };
      }
    }
    
    return { success: false, error: 'Convite não encontrado' };
  },

  /**
   * Obtém convite para emoção específica
   * @param {string} emotion - Emoção detectada
   */
  getEmotionalInvitation(emotion) {
    const emotionMap = {
      'ansiedade': this.SPECIAL_INVITATIONS.anxiety,
      'ansioso': this.SPECIAL_INVITATIONS.anxiety,
      'nervoso': this.SPECIAL_INVITATIONS.anxiety,
      'triste': this.SPECIAL_INVITATIONS.sadness,
      'tristeza': this.SPECIAL_INVITATIONS.sadness,
      'deprimido': this.SPECIAL_INVITATIONS.sadness,
      'raiva': this.SPECIAL_INVITATIONS.anger,
      'irritado': this.SPECIAL_INVITATIONS.anger,
      'frustrado': this.SPECIAL_INVITATIONS.anger
    };
    
    const invitation = emotionMap[emotion.toLowerCase()];
    if (invitation) {
      return { success: true, invitation };
    }
    
    // Default: convite de aterramento
    return { 
      success: true, 
      invitation: this.INVITATIONS.awakening[0] // Radar sensorial
    };
  },

  /**
   * Gera resposta empática ao feedback
   * @private
   */
  _generateEmpathyResponse(feedback) {
    const responses = [
      `💚 Obrigada por compartilhar isso. Sua experiência é única e valiosa.`,
      `🌿 Que bonito. A floresta está te ouvindo também.`,
      `✨ Isso é muito significativo. Guarde essa sensação.`,
      `🙏 Obrigada por estar presente neste momento.`,
      `💫 Cada descoberta é um presente. Continue explorando.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  /**
   * Encerra sessão
   * @private
   */
  _endSession(sessionId, finalFeedback) {
    return {
      success: true,
      sessionId,
      phase: 'completed',
      response: {
        text: `🌲 **Sessão de Shinrin-yoku Concluída**\n\n` +
              `Você completou sua jornada de Banho de Floresta.\n\n` +
              `**Lembre-se:**\n` +
              `• Os benefícios continuam por dias após a prática\n` +
              `• Os fitoncidas que você inalou fortalecem sua imunidade\n` +
              `• A calma que você encontrou está sempre disponível\n\n` +
              `A floresta estará aqui sempre que você precisar voltar.\n\n` +
              `Como você se sente agora? 💚`,
        type: 'shinrin_yoku_complete',
        sessionId
      },
      isComplete: true
    };
  },

  /**
   * Lista todos os convites disponíveis
   */
  listAllInvitations() {
    const all = [];
    
    for (const [phase, invitations] of Object.entries(this.INVITATIONS)) {
      for (const inv of invitations) {
        all.push({
          id: inv.id,
          name: inv.name,
          phase,
          duration: inv.duration
        });
      }
    }
    
    // Adiciona especiais
    for (const [key, inv] of Object.entries(this.SPECIAL_INVITATIONS)) {
      all.push({
        id: inv.id,
        name: inv.name,
        phase: 'special',
        context: key
      });
    }
    
    return { success: true, invitations: all, total: all.length };
  },

  /**
   * Obtém convite rápido para momento de estresse
   */
  getQuickGrounding() {
    return {
      success: true,
      response: {
        text: `🌳 **Aterramento Rápido (2 minutos)**\n\n` +
              `Onde você está agora, faça isso:\n\n` +
              `1. **Pés no chão** - Sinta o peso do seu corpo\n` +
              `2. **5 respirações** - Inspire 4s, expire 6s\n` +
              `3. **5 coisas** - Olhe 5 coisas verdes ao redor\n` +
              `4. **3 sons** - Ouça 3 sons diferentes\n` +
              `5. **1 gratidão** - Uma coisa boa de hoje\n\n` +
              `Pronto. Você está aqui. Você está bem. 💚`,
        type: 'quick_grounding'
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Shinrin-yoku Protocols
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicia sessão de Shinrin-yoku
 * @param {object} context - Contexto do usuário
 */
function apiShinrinYokuStart(context) {
  return ShinrinYokuProtocols.startSession(context || {});
}

/**
 * Avança para próximo convite
 * @param {string} sessionId - ID da sessão
 * @param {string} currentPhase - Fase atual
 * @param {string} feedback - Feedback do usuário
 */
function apiShinrinYokuNext(sessionId, currentPhase, feedback) {
  return ShinrinYokuProtocols.nextInvitation(sessionId, currentPhase, feedback);
}

/**
 * Obtém convite específico
 * @param {string} invitationId - ID do convite
 */
function apiShinrinYokuGetInvitation(invitationId) {
  return ShinrinYokuProtocols.getInvitation(invitationId);
}

/**
 * Obtém convite para emoção
 * @param {string} emotion - Emoção detectada
 */
function apiShinrinYokuEmotional(emotion) {
  return ShinrinYokuProtocols.getEmotionalInvitation(emotion);
}

/**
 * Lista todos os convites
 */
function apiShinrinYokuList() {
  return ShinrinYokuProtocols.listAllInvitations();
}

/**
 * Aterramento rápido
 */
function apiShinrinYokuQuick() {
  return ShinrinYokuProtocols.getQuickGrounding();
}
