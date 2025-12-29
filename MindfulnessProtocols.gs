/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MINDFULNESS PROTOCOLS - Protocolos de Atenção Plena na Natureza
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Implementação dos protocolos de Mindfulness para a Reserva Araras,
 * integrando práticas contemplativas com o ambiente natural do Cerrado.
 * 
 * Inclui:
 * - Técnicas de respiração (4-7-8, Box Breathing, Respiração da Árvore)
 * - Caminhada Consciente (Fox Walking)
 * - Grounding 5-4-3-2-1
 * - Meditações guiadas na natureza
 * - Coach de Mindfulness (Prompt 7 do documento)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Protocolos de Mindfulness
 * @namespace MindfulnessProtocols
 */
const MindfulnessProtocols = {

  /**
   * Configurações
   */
  CONFIG: {
    defaultBreathCycles: 4,
    pauseBetweenSteps: 3000, // ms
    sessionTypes: ['breathing', 'walking', 'grounding', 'meditation', 'body_scan']
  },

  /**
   * Técnicas de Respiração
   */
  BREATHING_TECHNIQUES: {
    
    respiracao_4_7_8: {
      id: 'respiracao_4_7_8',
      name: 'Respiração 4-7-8',
      alias: 'Respiração Relaxante',
      duration: '3-5 min',
      cycles: 4,
      benefits: [
        'Ativa o sistema nervoso parassimpático',
        'Reduz ansiedade rapidamente',
        'Ajuda a dormir melhor',
        'Diminui pressão arterial'
      ],
      contraindications: ['Problemas respiratórios graves'],
      script: `🌬️ **Respiração 4-7-8**

Esta técnica foi popularizada pelo Dr. Andrew Weil e é chamada de "tranquilizante natural".

**Preparação:**
Sente-se confortavelmente ou deite-se.
Coloque a ponta da língua no céu da boca, atrás dos dentes.

**O Ciclo:**

1️⃣ **INSPIRE** pelo nariz contando mentalmente até **4**
   *(Um... dois... três... quatro)*

2️⃣ **SEGURE** a respiração contando até **7**
   *(Um... dois... três... quatro... cinco... seis... sete)*

3️⃣ **EXPIRE** pela boca fazendo um som suave, contando até **8**
   *(Um... dois... três... quatro... cinco... seis... sete... oito)*

Repita o ciclo **4 vezes**.

💡 *A expiração mais longa que a inspiração ativa a resposta de relaxamento do corpo.*

Vamos começar? Inspire... 🌿`,
      steps: [
        { action: 'inspire', count: 4, instruction: 'Inspire pelo nariz... 1... 2... 3... 4' },
        { action: 'hold', count: 7, instruction: 'Segure... 1... 2... 3... 4... 5... 6... 7' },
        { action: 'expire', count: 8, instruction: 'Expire pela boca... 1... 2... 3... 4... 5... 6... 7... 8' }
      ]
    },

    box_breathing: {
      id: 'box_breathing',
      name: 'Respiração Quadrada',
      alias: 'Box Breathing',
      duration: '4-6 min',
      cycles: 4,
      benefits: [
        'Usada por Navy SEALs para manter calma',
        'Melhora foco e concentração',
        'Equilibra o sistema nervoso',
        'Reduz estresse agudo'
      ],
      script: `📦 **Respiração Quadrada (Box Breathing)**

Técnica usada por militares de elite para manter a calma sob pressão.

Imagine um quadrado. Cada lado tem 4 segundos.

**O Ciclo:**

⬆️ **INSPIRE** - 4 segundos (subindo o lado esquerdo)
➡️ **SEGURE** - 4 segundos (atravessando o topo)
⬇️ **EXPIRE** - 4 segundos (descendo o lado direito)
⬅️ **SEGURE** - 4 segundos (atravessando a base)

Visualize o quadrado enquanto respira.
Cada respiração completa é uma volta no quadrado.

Faça **4 voltas completas**.

Pronto para começar? 🔲`,
      steps: [
        { action: 'inspire', count: 4, instruction: 'Inspire... ⬆️ 1... 2... 3... 4' },
        { action: 'hold', count: 4, instruction: 'Segure... ➡️ 1... 2... 3... 4' },
        { action: 'expire', count: 4, instruction: 'Expire... ⬇️ 1... 2... 3... 4' },
        { action: 'hold', count: 4, instruction: 'Segure... ⬅️ 1... 2... 3... 4' }
      ]
    },

    tree_exchange: {
      id: 'tree_exchange',
      name: 'Respiração da Troca',
      alias: 'Tree Exchange',
      duration: '5-10 min',
      cycles: 10,
      benefits: [
        'Conexão profunda com a natureza',
        'Consciência ecológica',
        'Gratidão e reciprocidade',
        'Calma e presença'
      ],
      requiresNature: true,
      script: `🌳 **Respiração da Troca (Tree Exchange)**

Esta prática conecta você ao ciclo vital que compartilhamos com as árvores.

**Preparação:**
Encontre uma árvore que te atraia.
Fique diante dela, a uma distância confortável.
Se quiser, toque sua casca.

**A Prática:**

🌬️ **Ao INSPIRAR:**
Visualize que você está inalando o oxigênio que esta árvore acabou de produzir.
Sinta esse presente entrando em seus pulmões.
A árvore está te dando vida.

🌿 **Ao EXPIRAR:**
Ofereça seu dióxido de carbono a ela.
É exatamente o que ela precisa para viver.
Você está alimentando a árvore.

**Vocês estão em um ciclo de reciprocidade.**
Esta troca acontece a cada segundo da sua vida.
Hoje, você está consciente dela.

Continue por pelo menos **10 respirações**.

Sinta a conexão. Vocês são parceiros de vida. 💚`,
      steps: [
        { action: 'inspire', count: 5, instruction: 'Inspire o oxigênio da árvore... receba este presente...' },
        { action: 'expire', count: 5, instruction: 'Expire e ofereça seu CO₂... alimente a árvore...' }
      ]
    },

    coherent_breathing: {
      id: 'coherent_breathing',
      name: 'Respiração Coerente',
      alias: '5-5 Breathing',
      duration: '5 min',
      cycles: 6,
      benefits: [
        'Sincroniza coração e respiração',
        'Induz estado de coerência cardíaca',
        'Reduz variabilidade do estresse',
        'Promove equilíbrio emocional'
      ],
      script: `💓 **Respiração Coerente (5-5)**

Esta técnica sincroniza seu coração e respiração em um ritmo harmonioso.

**O Ritmo:**
5 segundos inspirando
5 segundos expirando
= 6 respirações por minuto
= Coerência cardíaca

**A Prática:**

Respire naturalmente pelo nariz.
Não force. Deixe fluir.

🌊 **INSPIRE** suavemente por 5 segundos
   Como uma onda subindo...

🌊 **EXPIRE** suavemente por 5 segundos
   Como uma onda descendo...

Imagine ondas suaves em um lago calmo.
Seu coração e respiração dançam juntos.

Continue por **5 minutos** (30 ciclos).

Você está entrando em coerência. 🌊`,
      steps: [
        { action: 'inspire', count: 5, instruction: 'Inspire suavemente... 🌊 onda subindo...' },
        { action: 'expire', count: 5, instruction: 'Expire suavemente... 🌊 onda descendo...' }
      ]
    }
  },

  /**
   * Técnicas de Grounding (Aterramento)
   */
  GROUNDING_TECHNIQUES: {
    
    grounding_5_4_3_2_1: {
      id: 'grounding_5_4_3_2_1',
      name: 'Grounding 5-4-3-2-1',
      duration: '3-5 min',
      benefits: [
        'Interrompe espirais de ansiedade',
        'Traz de volta ao momento presente',
        'Ativa todos os sentidos',
        'Eficaz para ataques de pânico'
      ],
      script: `🌍 **Grounding 5-4-3-2-1**

Esta técnica usa seus sentidos para te ancorar no presente.
Perfeita quando a mente está acelerada.

Onde você está agora, faça isso:

👁️ **5 COISAS que você pode VER**
Olhe ao redor. Encontre 5 coisas.
Pode ser uma folha, uma pedra, uma nuvem...
Nomeie cada uma mentalmente.

✋ **4 COISAS que você pode TOCAR**
Sinta 4 texturas diferentes.
A casca de uma árvore, a grama, sua roupa, o ar...
Note as diferenças.

👂 **3 SONS que você pode OUVIR**
Feche os olhos. Ouça.
Pássaros? Vento? Sua respiração?
Identifique 3 sons distintos.

👃 **2 CHEIROS que você pode SENTIR**
Inspire profundamente.
Terra úmida? Flores? Folhas?
Encontre 2 aromas.

👅 **1 SABOR que você pode NOTAR**
Qual sabor está na sua boca agora?
Pode ser neutro, e tudo bem.

Você está aqui. Você está presente. Você está seguro(a). 💚`,
      steps: [
        { sense: 'vision', count: 5, instruction: '👁️ Encontre 5 coisas que você pode VER...' },
        { sense: 'touch', count: 4, instruction: '✋ Sinta 4 coisas que você pode TOCAR...' },
        { sense: 'hearing', count: 3, instruction: '👂 Identifique 3 SONS ao seu redor...' },
        { sense: 'smell', count: 2, instruction: '👃 Encontre 2 CHEIROS...' },
        { sense: 'taste', count: 1, instruction: '👅 Note 1 SABOR na sua boca...' }
      ]
    },

    barefoot_grounding: {
      id: 'barefoot_grounding',
      name: 'Aterramento com Pés Descalços',
      duration: '5-10 min',
      benefits: [
        'Conexão elétrica com a terra (earthing)',
        'Reduz inflamação',
        'Melhora sono',
        'Sensação de enraizamento'
      ],
      requiresNature: true,
      script: `🦶 **Aterramento com Pés Descalços**

O contato direto com a terra tem benefícios comprovados.
A Terra tem carga elétrica negativa que equilibra nosso corpo.

**Preparação:**
Encontre um local seguro (grama, terra, areia).
Tire os sapatos e meias.

**A Prática:**

1️⃣ **Primeiro Contato**
Coloque um pé no chão.
Sinta a temperatura. A textura.
Agora o outro pé.

2️⃣ **Raízes Imaginárias**
Imagine raízes crescendo de seus pés.
Elas descem pela terra...
Cada vez mais profundas...
Até o centro da Terra.

3️⃣ **Troca de Energia**
Inspire e puxe energia da terra pelas raízes.
Sinta subindo pelas pernas, pelo corpo.
Expire e deixe tensões descerem pelas raízes.

4️⃣ **Presença**
Fique assim por pelo menos 5 minutos.
Você está conectado ao planeta.
Bilhões de anos de história sob seus pés.

Você pertence a este lugar. 🌍`,
      steps: [
        { action: 'contact', instruction: 'Tire os sapatos. Sinta o primeiro contato com a terra...' },
        { action: 'roots', instruction: 'Imagine raízes crescendo de seus pés, descendo pela terra...' },
        { action: 'exchange', instruction: 'Inspire energia da terra. Expire tensões...' },
        { action: 'presence', instruction: 'Permaneça presente. Você está conectado ao planeta...' }
      ]
    }
  },

  /**
   * Caminhada Consciente
   */
  WALKING_TECHNIQUES: {
    
    fox_walking: {
      id: 'fox_walking',
      name: 'Caminhada da Raposa',
      alias: 'Fox Walking',
      duration: '10-20 min',
      benefits: [
        'Aumenta consciência corporal',
        'Desenvolve presença',
        'Conecta com ancestralidade',
        'Silencia a mente'
      ],
      script: `🦊 **Caminhada da Raposa (Fox Walking)**

Esta técnica vem de tradições indígenas de rastreamento.
Caminhar tão silenciosamente que você não quebraria um galho seco.

**Preparação:**
Encontre um trecho de trilha ou área natural.
Se possível, tire os sapatos (ou use calçado fino).

**A Técnica:**

1️⃣ **Postura**
Joelhos levemente flexionados.
Centro de gravidade baixo.
Olhar suave, visão periférica aberta.

2️⃣ **O Passo da Raposa**
• Levante o pé lentamente
• Mova-o para frente sem tocar o chão
• Toque primeiro com a BORDA EXTERNA do pé
• Role suavemente para dentro
• Sinta o chão ANTES de colocar peso
• Só então transfira o peso

3️⃣ **O Ritmo**
Caminhe na velocidade da floresta, não da cidade.
Cada passo pode levar 3-5 segundos.
Não há pressa. Não há destino.

4️⃣ **A Mente**
Toda atenção nos pés.
Sinta cada textura, cada irregularidade.
Quando pensamentos surgirem, volte aos pés.

Você está se movendo como seus ancestrais.
Silencioso. Presente. Parte da floresta. 🌲`,
      steps: [
        { phase: 'posture', instruction: 'Joelhos flexionados, centro baixo, olhar suave...' },
        { phase: 'lift', instruction: 'Levante o pé lentamente do chão...' },
        { phase: 'move', instruction: 'Mova para frente sem tocar o chão...' },
        { phase: 'contact', instruction: 'Toque com a borda externa primeiro...' },
        { phase: 'roll', instruction: 'Role suavemente para dentro...' },
        { phase: 'weight', instruction: 'Sinta o chão, depois transfira o peso...' }
      ]
    },

    walking_meditation: {
      id: 'walking_meditation',
      name: 'Meditação Caminhando',
      duration: '15-30 min',
      benefits: [
        'Meditação para quem não consegue ficar parado',
        'Integra corpo e mente',
        'Pode ser feita em qualquer lugar',
        'Desenvolve concentração'
      ],
      script: `🚶 **Meditação Caminhando**

Para quem acha difícil meditar sentado.
O movimento se torna a âncora da atenção.

**Escolha um Percurso:**
Um trecho de 10-20 metros.
Você vai caminhar de um lado ao outro, repetidamente.

**A Prática:**

🦶 **Fase 1: Consciência Básica**
Caminhe normalmente.
Apenas note: "pé esquerdo... pé direito..."
Quando chegar ao fim, pare. Respire. Vire-se. Continue.

🦶 **Fase 2: Detalhamento**
Agora note as fases:
"Levantando... movendo... colocando..."
"Levantando... movendo... colocando..."

🦶 **Fase 3: Sensações**
Sinta as sensações em cada fase:
O peso saindo do pé
O movimento pelo ar
O contato com o chão

**Quando a Mente Vagar:**
(E ela vai vagar)
Gentilmente note: "pensando..."
E volte aos pés.

Não há destino. O caminho É a meditação. 🛤️`
    }
  },

  /**
   * Escaneamento Corporal
   */
  BODY_SCAN: {
    id: 'body_scan',
    name: 'Escaneamento Corporal',
    duration: '10-20 min',
    benefits: [
      'Libera tensões inconscientes',
      'Aumenta consciência corporal',
      'Prepara para sono',
      'Reduz dor crônica'
    ],
    script: `🧘 **Escaneamento Corporal**

Uma jornada de atenção pelo seu corpo.
Não para mudar nada — apenas para observar.

**Preparação:**
Deite-se confortavelmente (ou sente-se).
Feche os olhos.
Respire naturalmente.

**A Jornada:**

🦶 **Pés**
Leve sua atenção aos pés.
Dedos, sola, calcanhar.
O que você sente? Tensão? Calor? Formigamento?
Apenas observe. Não julgue.

🦵 **Pernas**
Suba para as panturrilhas... joelhos... coxas...
Note cada sensação.
Respire para essas áreas.

🫁 **Tronco**
Quadril... abdômen... peito...
Sinta a respiração movendo seu corpo.
Onde há tensão? Onde há espaço?

💪 **Braços**
Ombros... braços... mãos... dedos...
Muita tensão se acumula nos ombros.
Permita que se solte.

🧠 **Cabeça**
Pescoço... mandíbula... rosto... topo da cabeça...
Relaxe a testa. Solte a mandíbula.
Suavize os olhos.

✨ **Corpo Inteiro**
Agora sinta todo o corpo de uma vez.
Uma unidade. Um organismo vivo.
Respirando. Existindo. Aqui.

Quando estiver pronto, mova os dedos suavemente.
Abra os olhos lentamente.
Bem-vindo(a) de volta. 💚`,
    regions: ['feet', 'legs', 'torso', 'arms', 'head', 'whole_body']
  },

  /**
   * Coach de Mindfulness (Prompt 7 do documento)
   * Regulação somática aguda
   */
  COACH: {
    name: 'Coach de Mindfulness',
    role: 'Regulação somática aguda',
    
    /**
     * Avalia estado e recomenda técnica
     */
    assess(symptoms) {
      const recommendations = {
        // Ansiedade aguda
        anxiety_high: {
          primary: 'respiracao_4_7_8',
          secondary: 'grounding_5_4_3_2_1',
          message: 'Percebo que a ansiedade está intensa. Vamos começar com respiração para acalmar o sistema nervoso.'
        },
        // Ansiedade moderada
        anxiety_moderate: {
          primary: 'box_breathing',
          secondary: 'walking_meditation',
          message: 'Uma respiração estruturada pode ajudar a equilibrar. Vamos tentar a Respiração Quadrada.'
        },
        // Estresse/tensão
        stress: {
          primary: 'body_scan',
          secondary: 'coherent_breathing',
          message: 'Tensão acumulada no corpo? O escaneamento corporal pode ajudar a liberar.'
        },
        // Desconexão/dissociação
        disconnection: {
          primary: 'grounding_5_4_3_2_1',
          secondary: 'barefoot_grounding',
          message: 'Vamos te trazer de volta ao presente. O grounding sensorial é perfeito para isso.'
        },
        // Agitação mental
        racing_thoughts: {
          primary: 'fox_walking',
          secondary: 'walking_meditation',
          message: 'Mente acelerada? Movimento consciente pode ajudar a desacelerar os pensamentos.'
        },
        // Busca de conexão com natureza
        nature_connection: {
          primary: 'tree_exchange',
          secondary: 'barefoot_grounding',
          message: 'Que bom que você quer se conectar com a natureza. A Respiração da Troca é perfeita.'
        },
        // Geral/manutenção
        general: {
          primary: 'coherent_breathing',
          secondary: 'grounding_5_4_3_2_1',
          message: 'Vamos fazer uma prática de manutenção para cultivar calma e presença.'
        }
      };
      
      return recommendations[symptoms] || recommendations.general;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtém técnica de respiração por ID
   * @param {string} techniqueId - ID da técnica
   */
  getBreathingTechnique(techniqueId) {
    const technique = this.BREATHING_TECHNIQUES[techniqueId];
    if (technique) {
      return { success: true, technique };
    }
    return { success: false, error: 'Técnica não encontrada' };
  },

  /**
   * Obtém técnica de grounding por ID
   * @param {string} techniqueId - ID da técnica
   */
  getGroundingTechnique(techniqueId) {
    const technique = this.GROUNDING_TECHNIQUES[techniqueId];
    if (technique) {
      return { success: true, technique };
    }
    return { success: false, error: 'Técnica não encontrada' };
  },

  /**
   * Obtém técnica de caminhada por ID
   * @param {string} techniqueId - ID da técnica
   */
  getWalkingTechnique(techniqueId) {
    const technique = this.WALKING_TECHNIQUES[techniqueId];
    if (technique) {
      return { success: true, technique };
    }
    return { success: false, error: 'Técnica não encontrada' };
  },

  /**
   * Lista todas as técnicas disponíveis
   */
  listAllTechniques() {
    const all = {
      breathing: Object.entries(this.BREATHING_TECHNIQUES).map(([id, t]) => ({
        id, name: t.name, duration: t.duration
      })),
      grounding: Object.entries(this.GROUNDING_TECHNIQUES).map(([id, t]) => ({
        id, name: t.name, duration: t.duration
      })),
      walking: Object.entries(this.WALKING_TECHNIQUES).map(([id, t]) => ({
        id, name: t.name, duration: t.duration
      })),
      body_scan: {
        id: this.BODY_SCAN.id,
        name: this.BODY_SCAN.name,
        duration: this.BODY_SCAN.duration
      }
    };
    
    return { success: true, techniques: all };
  },

  /**
   * Recomenda técnica baseada em sintomas
   * @param {string} symptoms - Sintomas/estado atual
   */
  recommendTechnique(symptoms) {
    const recommendation = this.COACH.assess(symptoms);
    
    const primaryTechnique = this.BREATHING_TECHNIQUES[recommendation.primary] ||
                            this.GROUNDING_TECHNIQUES[recommendation.primary] ||
                            this.WALKING_TECHNIQUES[recommendation.primary];
    
    const secondaryTechnique = this.BREATHING_TECHNIQUES[recommendation.secondary] ||
                              this.GROUNDING_TECHNIQUES[recommendation.secondary] ||
                              this.WALKING_TECHNIQUES[recommendation.secondary];
    
    return {
      success: true,
      message: recommendation.message,
      primary: primaryTechnique,
      secondary: secondaryTechnique,
      symptoms
    };
  },

  /**
   * Inicia sessão guiada de técnica
   * @param {string} techniqueId - ID da técnica
   * @param {object} options - Opções (cycles, etc)
   */
  startGuidedSession(techniqueId, options = {}) {
    // Busca técnica em todas as categorias
    let technique = this.BREATHING_TECHNIQUES[techniqueId] ||
                   this.GROUNDING_TECHNIQUES[techniqueId] ||
                   this.WALKING_TECHNIQUES[techniqueId];
    
    if (techniqueId === 'body_scan') {
      technique = this.BODY_SCAN;
    }
    
    if (!technique) {
      return { success: false, error: 'Técnica não encontrada' };
    }
    
    const sessionId = `MIND_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    return {
      success: true,
      sessionId,
      technique: {
        id: technique.id,
        name: technique.name,
        duration: technique.duration
      },
      response: {
        text: `🧘 **Iniciando: ${technique.name}**\n\n` +
              `⏱️ Duração: ${technique.duration}\n\n` +
              `---\n\n${technique.script}`,
        type: 'mindfulness_session',
        techniqueId: technique.id
      },
      steps: technique.steps || [],
      cycles: options.cycles || technique.cycles || 4
    };
  },

  /**
   * Obtém próximo passo de uma sessão guiada
   * @param {string} techniqueId - ID da técnica
   * @param {number} stepIndex - Índice do passo atual
   * @param {number} cycleIndex - Índice do ciclo atual
   */
  getNextStep(techniqueId, stepIndex, cycleIndex) {
    const technique = this.BREATHING_TECHNIQUES[techniqueId] ||
                     this.GROUNDING_TECHNIQUES[techniqueId];
    
    if (!technique || !technique.steps) {
      return { success: false, error: 'Técnica sem passos guiados' };
    }
    
    const steps = technique.steps;
    const totalCycles = technique.cycles || 4;
    
    // Próximo passo
    let nextStepIndex = stepIndex + 1;
    let nextCycleIndex = cycleIndex;
    
    if (nextStepIndex >= steps.length) {
      nextStepIndex = 0;
      nextCycleIndex++;
    }
    
    // Verifica se completou todos os ciclos
    if (nextCycleIndex >= totalCycles) {
      return {
        success: true,
        completed: true,
        response: {
          text: `✨ **Prática Completa!**\n\n` +
                `Você completou ${totalCycles} ciclos de ${technique.name}.\n\n` +
                `Como você está se sentindo agora?\n\n` +
                `💚 Lembre-se: você pode fazer esta prática a qualquer momento que precisar.`,
          type: 'mindfulness_complete'
        }
      };
    }
    
    const currentStep = steps[nextStepIndex];
    
    return {
      success: true,
      completed: false,
      stepIndex: nextStepIndex,
      cycleIndex: nextCycleIndex,
      step: currentStep,
      response: {
        text: `**Ciclo ${nextCycleIndex + 1}/${totalCycles}**\n\n${currentStep.instruction}`,
        type: 'mindfulness_step',
        action: currentStep.action,
        count: currentStep.count
      },
      progress: {
        cycle: nextCycleIndex + 1,
        totalCycles,
        step: nextStepIndex + 1,
        totalSteps: steps.length
      }
    };
  },

  /**
   * Gera mini-prática rápida (1-2 min)
   * @param {string} type - Tipo: 'calm', 'focus', 'energy', 'sleep'
   */
  getQuickPractice(type = 'calm') {
    const practices = {
      calm: {
        name: 'Acalmar Rápido',
        script: `🌬️ **Acalmar em 1 Minuto**

Onde você está, faça isso agora:

1. **3 respirações profundas**
   Inspire pelo nariz... expire pela boca...

2. **Solte os ombros**
   Deixe-os cair. Relaxe a mandíbula.

3. **Pés no chão**
   Sinta o peso do seu corpo.

4. **Uma frase**
   Diga mentalmente: "Estou seguro(a). Estou aqui."

Pronto. Você está mais calmo(a). 💚`
      },
      focus: {
        name: 'Foco Rápido',
        script: `🎯 **Foco em 1 Minuto**

Antes de uma tarefa importante:

1. **Feche os olhos** por 10 segundos
   Bloqueie estímulos visuais.

2. **3 respirações pelo nariz**
   Ative o sistema nervoso.

3. **Defina a intenção**
   "Nos próximos X minutos, vou focar em..."

4. **Abra os olhos**
   Olhe para sua tarefa. Comece.

Sua mente está pronta. 🎯`
      },
      energy: {
        name: 'Energia Rápida',
        script: `⚡ **Energia em 1 Minuto**

Precisa de um boost?

1. **Levante-se** (se possível)

2. **5 respirações rápidas pelo nariz**
   Curtas e vigorosas. Como um fole.

3. **Sacuda o corpo**
   Mãos, braços, pernas. 10 segundos.

4. **Espreguice**
   Braços para cima, estique tudo.

5. **Sorriso**
   Mesmo forçado, libera endorfinas.

Energia renovada! ⚡`
      },
      sleep: {
        name: 'Preparar para Dormir',
        script: `🌙 **Relaxar para Dormir**

Na cama, faça isso:

1. **Respiração 4-7-8** (3 ciclos)
   Inspire 4... segure 7... expire 8...

2. **Relaxe o rosto**
   Testa, olhos, mandíbula, língua.

3. **Solte os ombros**
   Deixe afundar no colchão.

4. **Visualize**
   Um lugar seguro e tranquilo.
   Você está lá. Está tudo bem.

Boa noite. 🌙`
      }
    };
    
    const practice = practices[type] || practices.calm;
    
    return {
      success: true,
      type,
      response: {
        text: practice.script,
        type: 'quick_practice',
        name: practice.name
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Mindfulness Protocols
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lista todas as técnicas de mindfulness
 */
function apiMindfulnessList() {
  return MindfulnessProtocols.listAllTechniques();
}

/**
 * Obtém técnica de respiração
 * @param {string} techniqueId - ID da técnica
 */
function apiMindfulnessBreathing(techniqueId) {
  return MindfulnessProtocols.getBreathingTechnique(techniqueId);
}

/**
 * Obtém técnica de grounding
 * @param {string} techniqueId - ID da técnica
 */
function apiMindfulnessGrounding(techniqueId) {
  return MindfulnessProtocols.getGroundingTechnique(techniqueId);
}

/**
 * Obtém técnica de caminhada
 * @param {string} techniqueId - ID da técnica
 */
function apiMindfulnessWalking(techniqueId) {
  return MindfulnessProtocols.getWalkingTechnique(techniqueId);
}

/**
 * Obtém escaneamento corporal
 */
function apiMindfulnessBodyScan() {
  return {
    success: true,
    technique: MindfulnessProtocols.BODY_SCAN
  };
}

/**
 * Recomenda técnica baseada em sintomas
 * @param {string} symptoms - Sintomas (anxiety_high, stress, disconnection, etc)
 */
function apiMindfulnessRecommend(symptoms) {
  return MindfulnessProtocols.recommendTechnique(symptoms);
}

/**
 * Inicia sessão guiada
 * @param {string} techniqueId - ID da técnica
 * @param {object} options - Opções
 */
function apiMindfulnessStart(techniqueId, options) {
  return MindfulnessProtocols.startGuidedSession(techniqueId, options || {});
}

/**
 * Obtém próximo passo da sessão
 * @param {string} techniqueId - ID da técnica
 * @param {number} stepIndex - Índice do passo
 * @param {number} cycleIndex - Índice do ciclo
 */
function apiMindfulnessNextStep(techniqueId, stepIndex, cycleIndex) {
  return MindfulnessProtocols.getNextStep(techniqueId, stepIndex, cycleIndex);
}

/**
 * Obtém prática rápida
 * @param {string} type - Tipo: calm, focus, energy, sleep
 */
function apiMindfulnessQuick(type) {
  return MindfulnessProtocols.getQuickPractice(type || 'calm');
}

/**
 * Coach de Mindfulness - avalia e recomenda
 * @param {string} userMessage - Mensagem do usuário descrevendo estado
 */
function apiMindfulnessCoach(userMessage) {
  // Detecta sintomas na mensagem
  const message = userMessage.toLowerCase();
  let symptoms = 'general';
  
  if (message.includes('ansiedade') || message.includes('ansioso') || 
      message.includes('pânico') || message.includes('nervoso')) {
    symptoms = message.includes('muito') || message.includes('demais') ? 
               'anxiety_high' : 'anxiety_moderate';
  } else if (message.includes('estresse') || message.includes('tensão') || 
             message.includes('tenso')) {
    symptoms = 'stress';
  } else if (message.includes('desconectado') || message.includes('fora do corpo') ||
             message.includes('irreal')) {
    symptoms = 'disconnection';
  } else if (message.includes('pensamento') || message.includes('mente acelerada') ||
             message.includes('não para')) {
    symptoms = 'racing_thoughts';
  } else if (message.includes('natureza') || message.includes('conectar') ||
             message.includes('árvore')) {
    symptoms = 'nature_connection';
  }
  
  const recommendation = MindfulnessProtocols.recommendTechnique(symptoms);
  
  return {
    success: true,
    detectedSymptoms: symptoms,
    response: {
      text: `🧘 **Coach de Mindfulness**\n\n${recommendation.message}\n\n` +
            `**Recomendação Principal:**\n` +
            `${recommendation.primary.name} (${recommendation.primary.duration})\n\n` +
            `**Alternativa:**\n` +
            `${recommendation.secondary.name}\n\n` +
            `Quer que eu guie você na prática principal?`,
      type: 'mindfulness_coach',
      primaryTechnique: recommendation.primary.id,
      secondaryTechnique: recommendation.secondary.id
    }
  };
}
