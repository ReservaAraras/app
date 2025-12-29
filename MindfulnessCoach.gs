/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINDFULNESS COACH - Coach de Regulação Somática
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Prompt 7 do documento: Regulação somática aguda.
 * Acionado pela Serena em casos de alta ansiedade detectada.
 * 
 * Funcionalidades:
 * - Avaliação rápida de estado emocional
 * - Intervenções de emergência para crises
 * - Técnicas de regulação do sistema nervoso
 * - Exercícios de respiração guiados passo-a-passo
 * - Escaneamento corporal para tensão
 * - Protocolos de estabilização
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Níveis de Intensidade Emocional
 */
const INTENSITY_LEVELS = {
  BAIXA: { id: 'baixa', valor: 1, descricao: 'Leve desconforto' },
  MODERADA: { id: 'moderada', valor: 2, descricao: 'Desconforto significativo' },
  ALTA: { id: 'alta', valor: 3, descricao: 'Angústia intensa' },
  CRISE: { id: 'crise', valor: 4, descricao: 'Crise aguda / Pânico' }
};

/**
 * Estados Emocionais Reconhecidos
 */
const EMOTIONAL_STATES = {
  ANSIEDADE: 'ansiedade',
  PANICO: 'panico',
  RAIVA: 'raiva',
  TRISTEZA: 'tristeza',
  DISSOCIACAO: 'dissociacao',
  SOBRECARGA: 'sobrecarga',
  FLASHBACK: 'flashback',
  AGITACAO: 'agitacao'
};

/**
 * Coach de Mindfulness para Regulação Somática
 * @namespace MindfulnessCoach
 */
const MindfulnessCoach = {

  BOT_NAME: 'Coach',
  
  /**
   * Configuração
   */
  CONFIG: {
    emergencyTimeout: 30000, // 30 segundos para intervenção de emergência
    checkInInterval: 60000,  // 1 minuto entre check-ins
    maxSessionDuration: 1800000 // 30 minutos máximo
  },

  /**
   * Palavras-chave para detecção de crise
   */
  CRISIS_KEYWORDS: {
    panico: ['pânico', 'ataque', 'não consigo respirar', 'vou morrer', 'coração acelerado', 'sufocando'],
    dissociacao: ['fora do corpo', 'irreal', 'não sou eu', 'assistindo de fora', 'dormência', 'desconectado'],
    flashback: ['lembrança', 'revivendo', 'como se estivesse lá', 'não consigo parar de pensar'],
    autolesao: ['me machucar', 'me cortar', 'não aguento mais', 'quero sumir'],
    suicidio: ['morrer', 'acabar com tudo', 'não vale a pena', 'seria melhor sem mim']
  },

  /**
   * Recursos de emergência
   */
  EMERGENCY_RESOURCES: {
    cvv: {
      nome: 'CVV - Centro de Valorização da Vida',
      telefone: '188',
      disponibilidade: '24 horas',
      descricao: 'Apoio emocional e prevenção do suicídio'
    },
    samu: {
      nome: 'SAMU',
      telefone: '192',
      disponibilidade: '24 horas',
      descricao: 'Emergências médicas'
    },
    caps: {
      nome: 'CAPS - Centro de Atenção Psicossocial',
      descricao: 'Atendimento em saúde mental pelo SUS'
    }
  },

  /**
   * Protocolos de Intervenção por Estado
   */
  INTERVENTION_PROTOCOLS: {
    
    // ═══════════════════════════════════════════════════════════════════════
    // PROTOCOLO PARA ANSIEDADE/PÂNICO
    // ═══════════════════════════════════════════════════════════════════════
    ansiedade: {
      id: 'ansiedade',
      nome: 'Protocolo de Ansiedade',
      fases: [
        {
          nome: 'Estabilização Imediata',
          duracao: '1-2 min',
          script: `🆘 **Estabilização Imediata**

Estou aqui com você. Você está seguro(a).

Primeiro, vamos desacelerar juntos:

**PARE** o que está fazendo.
**SINTA** seus pés no chão.
**RESPIRE** comigo agora:

Inspire... 2... 3... 4...
Segure... 2... 3...
Expire... 2... 3... 4... 5... 6...

Mais uma vez. Você está indo bem.

A ansiedade é desconfortável, mas não é perigosa.
Ela vai passar. Sempre passa. 💚`
        },
        {
          nome: 'Respiração Reguladora',
          duracao: '3-5 min',
          script: `🌬️ **Respiração 4-7-8**

Agora vamos acalmar seu sistema nervoso:

1️⃣ **INSPIRE** pelo nariz contando até 4
   *Um... dois... três... quatro...*

2️⃣ **SEGURE** contando até 7
   *Um... dois... três... quatro... cinco... seis... sete...*

3️⃣ **EXPIRE** pela boca contando até 8
   *Um... dois... três... quatro... cinco... seis... sete... oito...*

Repita 4 vezes no seu ritmo.

A expiração longa ativa seu sistema de calma.
Seu corpo sabe como se acalmar. Confie nele. 🌿`
        },
        {
          nome: 'Grounding Sensorial',
          duracao: '3-5 min',
          script: `🌍 **Aterramento 5-4-3-2-1**

Vamos te trazer de volta ao presente:

👁️ **5 coisas que você VÊ**
Olhe ao redor. Nomeie 5 coisas.
(Uma cadeira... uma planta... a luz...)

✋ **4 coisas que você pode TOCAR**
Sinta 4 texturas diferentes agora.
(O tecido da roupa... a temperatura do ar...)

👂 **3 sons que você OUVE**
Identifique 3 sons ao seu redor.
(Minha voz... o vento... um pássaro...)

👃 **2 cheiros que você SENTE**
Inspire e encontre 2 aromas.

👅 **1 sabor na sua BOCA**
Note o sabor presente.

Você está aqui. Você está presente. Você está seguro(a). 💚`
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROTOCOLO PARA DISSOCIAÇÃO
    // ═══════════════════════════════════════════════════════════════════════
    dissociacao: {
      id: 'dissociacao',
      nome: 'Protocolo de Reconexão',
      fases: [
        {
          nome: 'Orientação Básica',
          duracao: '1-2 min',
          script: `🔵 **Reconexão - Você Está Aqui**

Sei que pode estar se sentindo distante ou irreal.
Isso é uma resposta de proteção do seu corpo.
Vamos te trazer de volta, devagar.

**Diga em voz alta (ou mentalmente):**

"Meu nome é ________."
"Hoje é ________ (dia da semana)."
"Estou em ________ (lugar)."
"Estou seguro(a)."

Agora, olhe para suas mãos.
Abra e feche os dedos.
Essas são SUAS mãos.
Você está no SEU corpo. 🙌`
        },
        {
          nome: 'Estimulação Sensorial',
          duracao: '2-3 min',
          script: `❄️ **Estimulação Sensorial Intensa**

Vamos acordar seus sentidos:

**Escolha uma ou mais:**

💧 **Água fria**
Lave o rosto ou segure gelo nas mãos.
Sinta o frio. Ele é real. Você é real.

👏 **Pressão física**
Aperte suas mãos uma contra a outra.
Sinta a pressão. Sinta seus músculos.

🦶 **Pés no chão**
Tire os sapatos se puder.
Pressione os pés no chão com força.
Sinta a solidez da terra.

🌿 **Cheiro forte**
Cheire algo intenso (café, hortelã, terra).
Deixe o aroma te trazer de volta.

Você está voltando. Devagar. No seu tempo. 💚`
        },
        {
          nome: 'Movimento Consciente',
          duracao: '2-3 min',
          script: `🚶 **Movimento para Reconexão**

O movimento ajuda a reconectar mente e corpo:

1️⃣ **Levante-se** (se puder)
   Sinta o peso do seu corpo.

2️⃣ **Balance** de um pé para o outro
   Devagar. Sinta a transferência de peso.

3️⃣ **Espreguice**
   Estique os braços para cima.
   Boceje se vier.

4️⃣ **Sacuda**
   Sacuda as mãos, os braços.
   Deixe a energia circular.

5️⃣ **Nomeie**
   "Estou de pé. Estou me movendo. Estou aqui."

Seu corpo é seu lar. Bem-vindo(a) de volta. 🏠`
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROTOCOLO PARA RAIVA
    // ═══════════════════════════════════════════════════════════════════════
    raiva: {
      id: 'raiva',
      nome: 'Protocolo de Raiva',
      fases: [
        {
          nome: 'Contenção Segura',
          duracao: '1-2 min',
          script: `🔥 **Contenção da Raiva**

A raiva é energia. Não é boa nem má.
O que importa é o que fazemos com ela.

**Primeiro, não faça nada.**
Não fale. Não aja. Apenas sinta.

Onde a raiva está no seu corpo?
Peito? Mandíbula? Punhos? Estômago?

Coloque a mão nesse lugar.
Reconheça: "Aqui está minha raiva."

Ela tem uma mensagem para você.
Mas primeiro, vamos baixar a temperatura. 🌡️`
        },
        {
          nome: 'Liberação Física Segura',
          duracao: '2-3 min',
          script: `💪 **Liberação Física Segura**

A raiva precisa sair do corpo de forma segura:

**Escolha uma:**

🧊 **Tensão e Soltura**
Feche os punhos com TODA força por 5 segundos.
Agora SOLTE completamente.
Repita 3 vezes.

🌬️ **Respiração de Fogo**
Inspire rápido pelo nariz.
Expire forte pela boca fazendo "HAH!"
Repita 10 vezes.

🚶 **Caminhada Rápida**
Se puder, caminhe rápido por 2 minutos.
Deixe as pernas absorverem a energia.

🗣️ **Som**
Em lugar privado, solte um som.
Pode ser um grito abafado no travesseiro.
O som libera.

A energia está saindo. Você está no controle. 💚`
        },
        {
          nome: 'Reflexão',
          duracao: '2-3 min',
          script: `💭 **Ouvindo a Mensagem da Raiva**

Agora que a intensidade baixou, vamos ouvir:

A raiva geralmente protege algo importante.

**Pergunte-se:**

❓ Que limite foi cruzado?
❓ Que necessidade não foi atendida?
❓ O que eu preciso proteger?

A raiva não é o problema.
O problema é o que a causou.

Você pode sentir raiva E agir com sabedoria.
As duas coisas podem coexistir.

O que você precisa agora? 🌿`
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROTOCOLO PARA TRISTEZA PROFUNDA
    // ═══════════════════════════════════════════════════════════════════════
    tristeza: {
      id: 'tristeza',
      nome: 'Protocolo de Acolhimento',
      fases: [
        {
          nome: 'Validação',
          duracao: '1-2 min',
          script: `💙 **Acolhimento**

A tristeza que você sente é real e válida.
Você não precisa se justificar.
Você não precisa "melhorar" agora.

Às vezes, a coisa mais corajosa é simplesmente sentir.

Se as lágrimas vierem, deixe-as vir.
Elas são água — limpam e renovam.

Estou aqui com você.
Não vou a lugar nenhum. 💚`
        },
        {
          nome: 'Autocompaixão',
          duracao: '2-3 min',
          script: `🤗 **Abraço de Autocompaixão**

Vamos praticar gentileza consigo mesmo(a):

**Coloque uma mão no coração.**
Sinta o calor da sua própria mão.
Sinta seu coração batendo.

**Diga para si mesmo(a):**

"Este é um momento de sofrimento."
*(Reconhecimento)*

"Sofrimento faz parte da vida."
*(Humanidade compartilhada)*

"Que eu possa ser gentil comigo mesmo(a)."
*(Autocompaixão)*

"Que eu possa me dar o que preciso."
*(Cuidado)*

Você merece a mesma compaixão que daria a um amigo querido. 💚`
        },
        {
          nome: 'Recurso Interno',
          duracao: '2-3 min',
          script: `🌳 **Encontrando um Recurso**

Mesmo na tristeza, há recursos dentro de você.

**Lembre-se de um momento em que você se sentiu:**
- Amado(a)
- Seguro(a)
- Em paz

Pode ser recente ou antigo.
Pode ser pequeno.

Feche os olhos e vá até esse momento.
Onde você estava?
Quem estava com você?
O que você sentia no corpo?

Esse momento existe dentro de você.
Você pode visitá-lo quando precisar.

A tristeza é uma visitante. Ela vai passar.
Você permanece. 🌿`
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROTOCOLO PARA SOBRECARGA/OVERWHELM
    // ═══════════════════════════════════════════════════════════════════════
    sobrecarga: {
      id: 'sobrecarga',
      nome: 'Protocolo de Sobrecarga',
      fases: [
        {
          nome: 'Pausa Total',
          duracao: '1-2 min',
          script: `⏸️ **PAUSA**

Você não precisa resolver tudo agora.
Você não precisa fazer nada agora.

**Permissão concedida para PARAR.**

Feche os olhos.
Solte os ombros.
Solte a mandíbula.
Solte as mãos.

Por este momento, não há nada para fazer.
Nenhum problema para resolver.
Nenhuma decisão para tomar.

Apenas respire.
Apenas exista.

O mundo pode esperar 5 minutos. 🌿`
        },
        {
          nome: 'Simplificação',
          duracao: '2-3 min',
          script: `📦 **Uma Coisa de Cada Vez**

A sobrecarga vem de tentar carregar tudo ao mesmo tempo.

Imagine que você está carregando 100 caixas.
Impossível, certo?

Agora imagine colocar 99 no chão.
Ficar com apenas UMA.

**Qual é a UMA coisa que precisa de você agora?**

Não amanhã. Não a lista toda.
Apenas a próxima pequena coisa.

Pode ser:
- Beber água
- Dar um passo
- Fazer uma respiração

Comece por aí. Só isso. 📦`
        },
        {
          nome: 'Contenção',
          duracao: '2-3 min',
          script: `🗃️ **Técnica do Container**

Vamos guardar o que não precisa ser resolvido agora:

Imagine um container forte e seguro.
Pode ser um cofre, uma caixa, um baú.

**Coloque dentro dele:**
- As preocupações de amanhã
- Os problemas dos outros
- As decisões que podem esperar
- Os "e se..."

Feche o container.
Tranque-o.
Ele estará lá quando você precisar.

Mas agora, você está livre.
Agora, você só precisa estar aqui. 💚`
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Avalia estado emocional e intensidade
   * @param {string} message - Mensagem do usuário
   * @returns {object} Avaliação
   */
  assessState(message) {
    const lower = message.toLowerCase();
    let state = null;
    let intensity = INTENSITY_LEVELS.MODERADA;
    let isCrisis = false;
    let needsProfessional = false;
    
    // Verifica palavras de crise primeiro
    for (const [tipo, keywords] of Object.entries(this.CRISIS_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          if (tipo === 'autolesao' || tipo === 'suicidio') {
            needsProfessional = true;
            isCrisis = true;
            intensity = INTENSITY_LEVELS.CRISE;
          } else {
            isCrisis = true;
            intensity = INTENSITY_LEVELS.ALTA;
          }
          
          if (tipo === 'panico') state = EMOTIONAL_STATES.PANICO;
          else if (tipo === 'dissociacao') state = EMOTIONAL_STATES.DISSOCIACAO;
          else if (tipo === 'flashback') state = EMOTIONAL_STATES.FLASHBACK;
          
          break;
        }
      }
      if (isCrisis) break;
    }
    
    // Se não é crise, detecta estado
    if (!state) {
      if (lower.includes('ansiedade') || lower.includes('ansioso') || lower.includes('nervoso')) {
        state = EMOTIONAL_STATES.ANSIEDADE;
      } else if (lower.includes('raiva') || lower.includes('irritado') || lower.includes('furioso')) {
        state = EMOTIONAL_STATES.RAIVA;
      } else if (lower.includes('triste') || lower.includes('deprimido') || lower.includes('vazio')) {
        state = EMOTIONAL_STATES.TRISTEZA;
      } else if (lower.includes('sobrecarregado') || lower.includes('demais') || lower.includes('não aguento')) {
        state = EMOTIONAL_STATES.SOBRECARGA;
      } else if (lower.includes('agitado') || lower.includes('inquieto')) {
        state = EMOTIONAL_STATES.AGITACAO;
      }
    }
    
    // Ajusta intensidade por palavras
    if (lower.includes('muito') || lower.includes('demais') || lower.includes('não consigo')) {
      if (intensity.valor < INTENSITY_LEVELS.ALTA.valor) {
        intensity = INTENSITY_LEVELS.ALTA;
      }
    }
    
    return {
      state: state || EMOTIONAL_STATES.ANSIEDADE, // default
      intensity,
      isCrisis,
      needsProfessional,
      originalMessage: message
    };
  },

  /**
   * Inicia intervenção baseada na avaliação
   * @param {object} assessment - Avaliação do assessState
   */
  startIntervention(assessment) {
    // Se precisa de profissional, prioriza isso
    if (assessment.needsProfessional) {
      return this._handleProfessionalNeed(assessment);
    }
    
    // Seleciona protocolo
    let protocolKey = 'ansiedade'; // default
    
    switch (assessment.state) {
      case EMOTIONAL_STATES.PANICO:
      case EMOTIONAL_STATES.ANSIEDADE:
        protocolKey = 'ansiedade';
        break;
      case EMOTIONAL_STATES.DISSOCIACAO:
      case EMOTIONAL_STATES.FLASHBACK:
        protocolKey = 'dissociacao';
        break;
      case EMOTIONAL_STATES.RAIVA:
        protocolKey = 'raiva';
        break;
      case EMOTIONAL_STATES.TRISTEZA:
        protocolKey = 'tristeza';
        break;
      case EMOTIONAL_STATES.SOBRECARGA:
        protocolKey = 'sobrecarga';
        break;
      default:
        protocolKey = 'ansiedade';
    }
    
    const protocol = this.INTERVENTION_PROTOCOLS[protocolKey];
    const firstPhase = protocol.fases[0];
    
    return {
      success: true,
      sessionId: `COACH_${Date.now()}`,
      assessment,
      protocol: {
        id: protocol.id,
        nome: protocol.nome,
        totalFases: protocol.fases.length
      },
      currentPhase: 0,
      response: {
        text: `🧘 **${this.BOT_NAME} de Mindfulness**\n\n` +
              `Percebo que você está passando por um momento difícil.\n` +
              `Estou aqui para te ajudar a atravessar isso.\n\n` +
              `---\n\n` +
              firstPhase.script,
        type: 'intervention_start',
        phase: firstPhase.nome,
        duration: firstPhase.duracao
      }
    };
  },

  /**
   * Avança para próxima fase do protocolo
   * @param {string} protocolId - ID do protocolo
   * @param {number} currentPhase - Fase atual
   */
  nextPhase(protocolId, currentPhase) {
    const protocol = this.INTERVENTION_PROTOCOLS[protocolId];
    
    if (!protocol) {
      return { success: false, error: 'Protocolo não encontrado' };
    }
    
    const nextPhaseIndex = currentPhase + 1;
    
    if (nextPhaseIndex >= protocol.fases.length) {
      // Protocolo completo
      return {
        success: true,
        completed: true,
        response: {
          text: `✨ **Protocolo Completo**\n\n` +
                `Você passou por todas as fases do ${protocol.nome}.\n\n` +
                `**Como você está se sentindo agora?**\n\n` +
                `Lembre-se:\n` +
                `• Você pode repetir qualquer fase quando precisar\n` +
                `• Essas técnicas estão sempre disponíveis\n` +
                `• Pedir ajuda é força, não fraqueza\n\n` +
                `Estou aqui se precisar de mais alguma coisa. 💚`,
          type: 'intervention_complete'
        }
      };
    }
    
    const phase = protocol.fases[nextPhaseIndex];
    
    return {
      success: true,
      completed: false,
      currentPhase: nextPhaseIndex,
      response: {
        text: `---\n\n**Fase ${nextPhaseIndex + 1}/${protocol.fases.length}: ${phase.nome}**\n` +
              `*(${phase.duracao})*\n\n` +
              phase.script,
        type: 'intervention_phase',
        phase: phase.nome,
        duration: phase.duracao
      }
    };
  },

  /**
   * Trata necessidade de ajuda profissional
   * @private
   */
  _handleProfessionalNeed(assessment) {
    const resources = Object.values(this.EMERGENCY_RESOURCES);
    const resourceList = resources.map(r => 
      r.telefone ? 
        `• **${r.nome}**: ${r.telefone} (${r.disponibilidade})` :
        `• **${r.nome}**: ${r.descricao}`
    ).join('\n');
    
    return {
      success: true,
      needsProfessional: true,
      response: {
        text: `💚 **Você é Importante**\n\n` +
              `O que você está sentindo é sério, e você merece apoio profissional.\n\n` +
              `**Estou aqui com você agora**, mas também quero que você saiba que existem pessoas treinadas para ajudar:\n\n` +
              `${resourceList}\n\n` +
              `---\n\n` +
              `**Enquanto isso, vamos respirar juntos?**\n\n` +
              `Inspire... 2... 3... 4...\n` +
              `Segure... 2... 3...\n` +
              `Expire... 2... 3... 4... 5... 6...\n\n` +
              `Você não está sozinho(a). 💚`,
        type: 'professional_referral',
        resources: this.EMERGENCY_RESOURCES,
        important: true
      }
    };
  },

  /**
   * Check-in rápido de estado
   */
  quickCheckIn() {
    return {
      success: true,
      response: {
        text: `💚 **Check-in Rápido**\n\n` +
              `Como você está se sentindo agora?\n\n` +
              `De 0 a 10, onde:\n` +
              `• 0 = Muito mal, preciso de ajuda\n` +
              `• 5 = Neutro, ok\n` +
              `• 10 = Muito bem, em paz\n\n` +
              `Qual número representa seu estado agora?`,
        type: 'check_in',
        expectsNumber: true
      }
    };
  },

  /**
   * Processa resposta do check-in
   * @param {number} rating - Nota de 0-10
   */
  processCheckIn(rating) {
    const num = parseInt(rating);
    
    if (isNaN(num) || num < 0 || num > 10) {
      return {
        success: false,
        response: {
          text: 'Por favor, responda com um número de 0 a 10.',
          type: 'check_in_invalid'
        }
      };
    }
    
    if (num <= 2) {
      // Crise - inicia intervenção
      return this.startIntervention({
        state: EMOTIONAL_STATES.SOBRECARGA,
        intensity: INTENSITY_LEVELS.ALTA,
        isCrisis: true,
        needsProfessional: num === 0
      });
    }
    
    if (num <= 4) {
      // Desconforto significativo
      return {
        success: true,
        response: {
          text: `💙 Obrigado por compartilhar.\n\n` +
                `Parece que você está passando por um momento difícil.\n\n` +
                `Posso te guiar em:\n` +
                `• 🌬️ Exercício de respiração\n` +
                `• 🌍 Técnica de grounding\n` +
                `• 💆 Relaxamento muscular\n\n` +
                `O que você prefere?`,
          type: 'check_in_low',
          suggestions: ['Respiração', 'Grounding', 'Relaxamento']
        }
      };
    }
    
    if (num <= 6) {
      // Neutro
      return {
        success: true,
        response: {
          text: `💚 Entendi. Você está em um estado neutro.\n\n` +
                `Quer fazer uma prática de manutenção para cultivar mais bem-estar?\n\n` +
                `Ou prefere apenas conversar?`,
          type: 'check_in_neutral'
        }
      };
    }
    
    // Bem
    return {
      success: true,
      response: {
        text: `✨ Que bom saber que você está bem!\n\n` +
              `Este é um ótimo momento para:\n` +
              `• Praticar gratidão\n` +
              `• Fazer uma meditação de manutenção\n` +
              `• Simplesmente apreciar o momento\n\n` +
              `O que você gostaria de fazer?`,
        type: 'check_in_good'
      }
    };
  },

  /**
   * Técnica de emergência rápida (30 segundos)
   */
  emergencyTechnique() {
    return {
      success: true,
      response: {
        text: `🆘 **Técnica de Emergência (30 segundos)**\n\n` +
              `**AGORA:**\n\n` +
              `1️⃣ **PARE** - Não faça nada\n\n` +
              `2️⃣ **PÉS** - Sinta seus pés no chão\n\n` +
              `3️⃣ **RESPIRE** - Uma respiração profunda\n` +
              `   Inspire... Expire...\n\n` +
              `4️⃣ **OLHE** - Encontre algo azul ao seu redor\n\n` +
              `5️⃣ **DIGA** - "Estou seguro(a). Isso vai passar."\n\n` +
              `---\n\n` +
              `Você fez. Você está aqui. 💚\n\n` +
              `Quer continuar com mais técnicas?`,
        type: 'emergency_technique',
        duration: '30 segundos'
      }
    };
  },

  /**
   * Processa mensagem para o Coach
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto da sessão
   */
  processMessage(message, context = {}) {
    const lower = message.toLowerCase();
    
    // Verifica se é resposta de check-in
    if (context.expectsNumber) {
      return this.processCheckIn(message);
    }
    
    // Verifica se quer continuar protocolo
    if (context.currentProtocol && context.currentPhase !== undefined) {
      if (lower.includes('continuar') || lower.includes('próxim') || lower.includes('sim')) {
        return this.nextPhase(context.currentProtocol, context.currentPhase);
      }
    }
    
    // Verifica pedidos específicos
    if (lower.includes('emergência') || lower.includes('agora') || lower.includes('rápido')) {
      return this.emergencyTechnique();
    }
    
    if (lower.includes('check') || lower.includes('como estou')) {
      return this.quickCheckIn();
    }
    
    // Avalia estado e inicia intervenção
    const assessment = this.assessState(message);
    
    if (assessment.isCrisis || assessment.intensity.valor >= INTENSITY_LEVELS.ALTA.valor) {
      return this.startIntervention(assessment);
    }
    
    // Resposta padrão
    return {
      success: true,
      response: {
        text: `🧘 **${this.BOT_NAME} de Mindfulness**\n\n` +
              `Estou aqui para te ajudar com regulação emocional.\n\n` +
              `Posso te guiar em:\n` +
              `• 🆘 Técnica de emergência (30 seg)\n` +
              `• 🌬️ Protocolos de respiração\n` +
              `• 🌍 Técnicas de grounding\n` +
              `• 💚 Check-in de estado\n\n` +
              `Como você está se sentindo? Ou escolha uma opção acima.`,
        type: 'greeting',
        suggestions: ['Técnica de emergência', 'Check-in', 'Estou ansioso(a)']
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Mindfulness Coach
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Avalia estado emocional
 * @param {string} message - Mensagem do usuário
 */
function apiCoachAssess(message) {
  return MindfulnessCoach.assessState(message);
}

/**
 * Inicia intervenção
 * @param {object} assessment - Avaliação prévia ou mensagem
 */
function apiCoachIntervene(assessmentOrMessage) {
  if (typeof assessmentOrMessage === 'string') {
    const assessment = MindfulnessCoach.assessState(assessmentOrMessage);
    return MindfulnessCoach.startIntervention(assessment);
  }
  return MindfulnessCoach.startIntervention(assessmentOrMessage);
}

/**
 * Avança para próxima fase
 * @param {string} protocolId - ID do protocolo
 * @param {number} currentPhase - Fase atual
 */
function apiCoachNextPhase(protocolId, currentPhase) {
  return MindfulnessCoach.nextPhase(protocolId, currentPhase);
}

/**
 * Técnica de emergência rápida
 */
function apiCoachEmergency() {
  return MindfulnessCoach.emergencyTechnique();
}

/**
 * Check-in rápido
 */
function apiCoachCheckIn() {
  return MindfulnessCoach.quickCheckIn();
}

/**
 * Processa resposta do check-in
 * @param {number} rating - Nota 0-10
 */
function apiCoachProcessCheckIn(rating) {
  return MindfulnessCoach.processCheckIn(rating);
}

/**
 * Processa mensagem para o Coach
 * @param {string} message - Mensagem
 * @param {object} context - Contexto
 */
function apiCoachMessage(message, context) {
  return MindfulnessCoach.processMessage(message, context || {});
}

/**
 * Integração com Serena - acionado em alta ansiedade
 * @param {string} message - Mensagem do usuário
 * @param {object} emotionalContext - Contexto emocional detectado
 */
function apiSerenaCallCoach(message, emotionalContext) {
  const assessment = MindfulnessCoach.assessState(message);
  
  // Enriquece com contexto da Serena
  if (emotionalContext) {
    if (emotionalContext.intensity === 'high') {
      assessment.intensity = INTENSITY_LEVELS.ALTA;
    }
    if (emotionalContext.state) {
      assessment.state = emotionalContext.state;
    }
  }
  
  // Se intensidade alta, inicia intervenção
  if (assessment.intensity.valor >= INTENSITY_LEVELS.ALTA.valor || assessment.isCrisis) {
    return {
      shouldIntervene: true,
      intervention: MindfulnessCoach.startIntervention(assessment)
    };
  }
  
  // Caso contrário, retorna avaliação para Serena decidir
  return {
    shouldIntervene: false,
    assessment,
    suggestion: 'Serena pode continuar com suporte padrão'
  };
}

/**
 * Obtém protocolo específico
 * @param {string} protocolId - ID do protocolo
 */
function apiCoachGetProtocol(protocolId) {
  const protocol = MindfulnessCoach.INTERVENTION_PROTOCOLS[protocolId];
  if (protocol) {
    return { success: true, protocol };
  }
  return { 
    success: false, 
    error: 'Protocolo não encontrado',
    available: Object.keys(MindfulnessCoach.INTERVENTION_PROTOCOLS)
  };
}

/**
 * Lista todos os protocolos disponíveis
 */
function apiCoachListProtocols() {
  const protocols = Object.entries(MindfulnessCoach.INTERVENTION_PROTOCOLS).map(([id, p]) => ({
    id,
    nome: p.nome,
    fases: p.fases.length
  }));
  
  return { success: true, protocols };
}
