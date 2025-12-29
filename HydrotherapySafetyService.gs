/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HYDROTHERAPY SAFETY SERVICE - Serviço de Segurança para Hidroterapia
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de verificação de segurança para atividades de Hidroterapia Natural
 * na Reserva Araras, integrando dados de sensores IoT de qualidade da água.
 * 
 * Funcionalidades:
 * - Verificação em tempo real de condições da água
 * - Bloqueio automático de sugestões de imersão em condições perigosas
 * - Protocolos de hidroterapia seguros
 * - Integração com sensores de nível, turbidez e qualidade
 * - Alertas de segurança
 * 
 * REGRA CRÍTICA (do documento):
 * Se Turbidez > 50 NTU ou Velocidade_Correnteza > Limite_Seguro,
 * bloquear sugestões de imersão e sugerir apenas contemplação visual.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Limites de Segurança para Hidroterapia
 */
const HYDRO_SAFETY_LIMITS = {
  // Turbidez (NTU - Nephelometric Turbidity Units)
  turbidez: {
    seguro: 25,        // Ideal para imersão
    atencao: 40,       // Permitido com cautela
    perigo: 50,        // BLOQUEIO de imersão
    unidade: 'NTU'
  },
  
  // Velocidade da correnteza (m/s)
  correnteza: {
    seguro: 0.3,       // Águas calmas
    atencao: 0.5,      // Correnteza moderada
    perigo: 0.8,       // BLOQUEIO de imersão
    unidade: 'm/s'
  },
  
  // Nível da água (metros acima do normal)
  nivel: {
    baixo: -0.3,       // Muito baixo - evitar
    normal_min: -0.1,
    normal_max: 0.3,
    alto: 0.5,         // Atenção
    perigo: 1.0,       // BLOQUEIO - risco de cheia
    unidade: 'm'
  },
  
  // pH da água
  ph: {
    min_seguro: 6.0,
    max_seguro: 8.5,
    ideal_min: 6.5,
    ideal_max: 7.5
  },
  
  // Temperatura da água (°C)
  temperatura: {
    muito_fria: 15,    // Crioterapia - tempo limitado
    fria: 18,          // Refrescante
    ideal_min: 20,
    ideal_max: 28,
    quente: 30         // Atenção
  },
  
  // Coliformes (UFC/100ml)
  coliformes: {
    seguro: 200,       // Balneabilidade excelente
    atencao: 400,      // Própria
    perigo: 800        // BLOQUEIO - imprópria
  }
};

/**
 * Status de Segurança
 */
const SAFETY_STATUS = {
  SEGURO: 'seguro',
  ATENCAO: 'atencao',
  PERIGO: 'perigo',
  BLOQUEADO: 'bloqueado',
  DESCONHECIDO: 'desconhecido'
};

/**
 * Tipos de Atividade Aquática
 */
const WATER_ACTIVITIES = {
  IMERSAO_TOTAL: {
    id: 'imersao_total',
    nome: 'Imersão Total',
    descricao: 'Banho completo no rio/cachoeira',
    risco: 'alto',
    requisitosTurbidez: 'seguro',
    requisitosCorrenteza: 'seguro'
  },
  IMERSAO_PARCIAL: {
    id: 'imersao_parcial',
    nome: 'Imersão Parcial',
    descricao: 'Pés e pernas na água',
    risco: 'medio',
    requisitosTurbidez: 'atencao',
    requisitosCorrenteza: 'atencao'
  },
  CONTEMPLACAO: {
    id: 'contemplacao',
    nome: 'Contemplação Visual',
    descricao: 'Observação e meditação junto à água',
    risco: 'baixo',
    requisitosTurbidez: 'qualquer',
    requisitosCorrenteza: 'qualquer'
  },
  CRIOTERAPIA: {
    id: 'crioterapia',
    nome: 'Crioterapia Natural',
    descricao: 'Imersão breve em água fria',
    risco: 'alto',
    requisitosTurbidez: 'seguro',
    requisitosCorrenteza: 'seguro',
    tempoMaximo: 180 // segundos
  }
};

/**
 * Serviço de Segurança para Hidroterapia
 * @namespace HydrotherapySafetyService
 */
const HydrotherapySafetyService = {

  /**
   * Pontos de água monitorados na reserva
   */
  WATER_POINTS: {
    nascente_principal: {
      id: 'nascente_principal',
      nome: 'Nascente Principal',
      tipo: 'nascente',
      coordenadas: { lat: -13.5234, lng: -46.3789 },
      profundidadeMedia: 0.5,
      atividades: ['contemplacao', 'imersao_parcial']
    },
    poco_natural: {
      id: 'poco_natural',
      nome: 'Poço Natural',
      tipo: 'poco',
      coordenadas: { lat: -13.5256, lng: -46.3801 },
      profundidadeMedia: 1.5,
      atividades: ['imersao_total', 'crioterapia', 'contemplacao']
    },
    cachoeira_pequena: {
      id: 'cachoeira_pequena',
      nome: 'Cachoeira Pequena',
      tipo: 'cachoeira',
      coordenadas: { lat: -13.5278, lng: -46.3823 },
      profundidadeMedia: 1.0,
      atividades: ['imersao_total', 'contemplacao']
    },
    corrego_veredas: {
      id: 'corrego_veredas',
      nome: 'Córrego das Veredas',
      tipo: 'corrego',
      coordenadas: { lat: -13.5290, lng: -46.3845 },
      profundidadeMedia: 0.3,
      atividades: ['imersao_parcial', 'contemplacao']
    }
  },

  /**
   * Verifica segurança para hidroterapia em um ponto
   * @param {string} pointId - ID do ponto de água
   * @param {object} sensorData - Dados dos sensores (opcional, busca se não fornecido)
   * @returns {object} Avaliação de segurança
   */
  checkSafety(pointId, sensorData = null) {
    const point = this.WATER_POINTS[pointId];
    if (!point) {
      return { 
        success: false, 
        error: 'Ponto de água não encontrado',
        status: SAFETY_STATUS.DESCONHECIDO
      };
    }

    // Obtém dados dos sensores
    const data = sensorData || this._getSensorData(pointId);
    
    // Avalia cada parâmetro
    const avaliacoes = {
      turbidez: this._evaluateTurbidity(data.turbidez),
      correnteza: this._evaluateCurrentSpeed(data.correnteza),
      nivel: this._evaluateWaterLevel(data.nivel),
      ph: this._evaluatePH(data.ph),
      temperatura: this._evaluateTemperature(data.temperatura),
      coliformes: this._evaluateColiformes(data.coliformes)
    };

    // Determina status geral
    const statusGeral = this._determineOverallStatus(avaliacoes);
    
    // Determina atividades permitidas
    const atividadesPermitidas = this._getAllowedActivities(statusGeral, avaliacoes);

    return {
      success: true,
      pointId,
      pointName: point.nome,
      timestamp: new Date().toISOString(),
      sensorData: data,
      avaliacoes,
      statusGeral,
      atividadesPermitidas,
      recomendacao: this._generateRecommendation(statusGeral, avaliacoes, point)
    };
  },

  /**
   * Avalia turbidez
   * @private
   */
  _evaluateTurbidity(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.turbidez;
    
    if (value <= limits.seguro) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Água cristalina (${value} ${limits.unidade})` 
      };
    }
    if (value <= limits.atencao) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Turbidez moderada (${value} ${limits.unidade})` 
      };
    }
    if (value <= limits.perigo) {
      return { 
        status: SAFETY_STATUS.PERIGO, 
        value, 
        message: `⚠️ Turbidez alta (${value} ${limits.unidade})` 
      };
    }
    return { 
      status: SAFETY_STATUS.BLOQUEADO, 
      value, 
      message: `🚫 BLOQUEADO: Turbidez perigosa (${value} ${limits.unidade})` 
    };
  },

  /**
   * Avalia velocidade da correnteza
   * @private
   */
  _evaluateCurrentSpeed(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.correnteza;
    
    if (value <= limits.seguro) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Águas calmas (${value} ${limits.unidade})` 
      };
    }
    if (value <= limits.atencao) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Correnteza moderada (${value} ${limits.unidade})` 
      };
    }
    if (value <= limits.perigo) {
      return { 
        status: SAFETY_STATUS.PERIGO, 
        value, 
        message: `⚠️ Correnteza forte (${value} ${limits.unidade})` 
      };
    }
    return { 
      status: SAFETY_STATUS.BLOQUEADO, 
      value, 
      message: `🚫 BLOQUEADO: Correnteza perigosa (${value} ${limits.unidade})` 
    };
  },

  /**
   * Avalia nível da água
   * @private
   */
  _evaluateWaterLevel(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.nivel;
    
    if (value < limits.baixo) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Nível muito baixo (${value}m)` 
      };
    }
    if (value >= limits.normal_min && value <= limits.normal_max) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Nível normal (${value}m)` 
      };
    }
    if (value <= limits.alto) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Nível elevado (${value}m)` 
      };
    }
    if (value <= limits.perigo) {
      return { 
        status: SAFETY_STATUS.PERIGO, 
        value, 
        message: `⚠️ Nível alto - risco de cheia (${value}m)` 
      };
    }
    return { 
      status: SAFETY_STATUS.BLOQUEADO, 
      value, 
      message: `🚫 BLOQUEADO: Risco de enchente (${value}m)` 
    };
  },

  /**
   * Avalia pH
   * @private
   */
  _evaluatePH(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.ph;
    
    if (value >= limits.ideal_min && value <= limits.ideal_max) {
      return { status: SAFETY_STATUS.SEGURO, value, message: `pH ideal (${value})` };
    }
    if (value >= limits.min_seguro && value <= limits.max_seguro) {
      return { status: SAFETY_STATUS.ATENCAO, value, message: `pH aceitável (${value})` };
    }
    return { 
      status: SAFETY_STATUS.PERIGO, 
      value, 
      message: `⚠️ pH fora do seguro (${value})` 
    };
  },

  /**
   * Avalia temperatura
   * @private
   */
  _evaluateTemperature(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.temperatura;
    
    if (value < limits.muito_fria) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Água muito fria (${value}°C) - crioterapia breve apenas` 
      };
    }
    if (value < limits.fria) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Água fria/refrescante (${value}°C)` 
      };
    }
    if (value >= limits.ideal_min && value <= limits.ideal_max) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Temperatura ideal (${value}°C)` 
      };
    }
    return { 
      status: SAFETY_STATUS.ATENCAO, 
      value, 
      message: `Água morna (${value}°C)` 
    };
  },

  /**
   * Avalia coliformes
   * @private
   */
  _evaluateColiformes(value) {
    if (value === null || value === undefined) {
      return { status: SAFETY_STATUS.DESCONHECIDO, value: null, message: 'Dados não disponíveis' };
    }
    
    const limits = HYDRO_SAFETY_LIMITS.coliformes;
    
    if (value <= limits.seguro) {
      return { 
        status: SAFETY_STATUS.SEGURO, 
        value, 
        message: `Balneabilidade excelente (${value} UFC/100ml)` 
      };
    }
    if (value <= limits.atencao) {
      return { 
        status: SAFETY_STATUS.ATENCAO, 
        value, 
        message: `Balneabilidade própria (${value} UFC/100ml)` 
      };
    }
    if (value <= limits.perigo) {
      return { 
        status: SAFETY_STATUS.PERIGO, 
        value, 
        message: `⚠️ Balneabilidade imprópria (${value} UFC/100ml)` 
      };
    }
    return { 
      status: SAFETY_STATUS.BLOQUEADO, 
      value, 
      message: `🚫 BLOQUEADO: Contaminação detectada (${value} UFC/100ml)` 
    };
  },

  /**
   * Determina status geral baseado em todas as avaliações
   * @private
   */
  _determineOverallStatus(avaliacoes) {
    const statuses = Object.values(avaliacoes).map(a => a.status);
    
    // Se qualquer parâmetro está BLOQUEADO, status geral é BLOQUEADO
    if (statuses.includes(SAFETY_STATUS.BLOQUEADO)) {
      return SAFETY_STATUS.BLOQUEADO;
    }
    
    // Se qualquer parâmetro está em PERIGO, status geral é PERIGO
    if (statuses.includes(SAFETY_STATUS.PERIGO)) {
      return SAFETY_STATUS.PERIGO;
    }
    
    // Se qualquer parâmetro está em ATENÇÃO, status geral é ATENÇÃO
    if (statuses.includes(SAFETY_STATUS.ATENCAO)) {
      return SAFETY_STATUS.ATENCAO;
    }
    
    // Se todos são DESCONHECIDO, status é DESCONHECIDO
    if (statuses.every(s => s === SAFETY_STATUS.DESCONHECIDO)) {
      return SAFETY_STATUS.DESCONHECIDO;
    }
    
    return SAFETY_STATUS.SEGURO;
  },

  /**
   * Determina atividades permitidas
   * @private
   */
  _getAllowedActivities(statusGeral, avaliacoes) {
    const permitidas = [];
    
    // Contemplação sempre permitida (exceto em emergência)
    if (statusGeral !== SAFETY_STATUS.BLOQUEADO) {
      permitidas.push(WATER_ACTIVITIES.CONTEMPLACAO);
    }
    
    // Imersão parcial em status SEGURO ou ATENÇÃO
    if (statusGeral === SAFETY_STATUS.SEGURO || statusGeral === SAFETY_STATUS.ATENCAO) {
      if (avaliacoes.turbidez.status !== SAFETY_STATUS.PERIGO &&
          avaliacoes.correnteza.status !== SAFETY_STATUS.PERIGO) {
        permitidas.push(WATER_ACTIVITIES.IMERSAO_PARCIAL);
      }
    }
    
    // Imersão total apenas em status SEGURO
    if (statusGeral === SAFETY_STATUS.SEGURO) {
      if (avaliacoes.turbidez.status === SAFETY_STATUS.SEGURO &&
          avaliacoes.correnteza.status === SAFETY_STATUS.SEGURO &&
          avaliacoes.coliformes.status !== SAFETY_STATUS.PERIGO) {
        permitidas.push(WATER_ACTIVITIES.IMERSAO_TOTAL);
      }
    }
    
    // Crioterapia em condições específicas
    if (statusGeral === SAFETY_STATUS.SEGURO &&
        avaliacoes.temperatura.value !== null &&
        avaliacoes.temperatura.value < HYDRO_SAFETY_LIMITS.temperatura.fria) {
      permitidas.push(WATER_ACTIVITIES.CRIOTERAPIA);
    }
    
    return permitidas;
  },

  /**
   * Gera recomendação baseada na avaliação
   * @private
   */
  _generateRecommendation(statusGeral, avaliacoes, point) {
    switch (statusGeral) {
      case SAFETY_STATUS.BLOQUEADO:
        return {
          tipo: 'bloqueio',
          emoji: '🚫',
          titulo: 'IMERSÃO NÃO RECOMENDADA',
          mensagem: `As condições atuais em ${point.nome} não permitem atividades de imersão.\n\n` +
                   `**Alternativa segura:** Contemplação visual e meditação junto à água.\n\n` +
                   `A natureza também cura através dos olhos e ouvidos. ` +
                   `Sente-se em local seguro e aprecie o som da água.`,
          atividadeSugerida: WATER_ACTIVITIES.CONTEMPLACAO
        };
        
      case SAFETY_STATUS.PERIGO:
        return {
          tipo: 'alerta',
          emoji: '⚠️',
          titulo: 'ATENÇÃO - CONDIÇÕES ADVERSAS',
          mensagem: `${point.nome} apresenta condições que requerem cautela.\n\n` +
                   `**Recomendação:** Apenas imersão parcial (pés) em áreas rasas e calmas.\n\n` +
                   `Evite áreas profundas ou com correnteza.`,
          atividadeSugerida: WATER_ACTIVITIES.IMERSAO_PARCIAL
        };
        
      case SAFETY_STATUS.ATENCAO:
        return {
          tipo: 'cautela',
          emoji: '🟡',
          titulo: 'CONDIÇÕES MODERADAS',
          mensagem: `${point.nome} está em condições aceitáveis com algumas ressalvas.\n\n` +
                   `**Recomendação:** Imersão parcial ou total com atenção.\n\n` +
                   `Observe as condições locais antes de entrar.`,
          atividadeSugerida: WATER_ACTIVITIES.IMERSAO_PARCIAL
        };
        
      case SAFETY_STATUS.SEGURO:
        return {
          tipo: 'liberado',
          emoji: '✅',
          titulo: 'CONDIÇÕES IDEAIS',
          mensagem: `${point.nome} está em excelentes condições para hidroterapia!\n\n` +
                   `**Todas as atividades liberadas:**\n` +
                   `• Imersão total\n• Imersão parcial\n• Crioterapia (se água fria)\n• Contemplação\n\n` +
                   `Aproveite os benefícios terapêuticos da água!`,
          atividadeSugerida: WATER_ACTIVITIES.IMERSAO_TOTAL
        };
        
      default:
        return {
          tipo: 'desconhecido',
          emoji: '❓',
          titulo: 'DADOS INSUFICIENTES',
          mensagem: `Não há dados suficientes para avaliar ${point.nome}.\n\n` +
                   `**Recomendação:** Consulte um guia local antes de qualquer atividade aquática.`,
          atividadeSugerida: WATER_ACTIVITIES.CONTEMPLACAO
        };
    }
  },

  /**
   * Obtém dados dos sensores (integração com IoT)
   * @private
   */
  _getSensorData(pointId) {
    // Tenta obter dados reais dos sensores
    try {
      if (typeof WaterLevelSensorService !== 'undefined') {
        const realData = WaterLevelSensorService.getLatestReading(pointId);
        if (realData && realData.success) {
          return realData.data;
        }
      }
    } catch (e) {
      Logger.log(`[_getSensorData] Erro ao obter dados reais: ${e}`);
    }
    
    // Dados simulados para demonstração
    // Em produção, isso viria dos sensores IoT
    const simulatedData = {
      nascente_principal: {
        turbidez: 15,
        correnteza: 0.1,
        nivel: 0.0,
        ph: 7.0,
        temperatura: 22,
        coliformes: 50,
        timestamp: new Date().toISOString()
      },
      poco_natural: {
        turbidez: 20,
        correnteza: 0.05,
        nivel: 0.1,
        ph: 6.8,
        temperatura: 19,
        coliformes: 80,
        timestamp: new Date().toISOString()
      },
      cachoeira_pequena: {
        turbidez: 30,
        correnteza: 0.6,
        nivel: 0.2,
        ph: 7.2,
        temperatura: 21,
        coliformes: 120,
        timestamp: new Date().toISOString()
      },
      corrego_veredas: {
        turbidez: 25,
        correnteza: 0.4,
        nivel: -0.1,
        ph: 6.5,
        temperatura: 24,
        coliformes: 150,
        timestamp: new Date().toISOString()
      }
    };
    
    return simulatedData[pointId] || {
      turbidez: null,
      correnteza: null,
      nivel: null,
      ph: null,
      temperatura: null,
      coliformes: null
    };
  },

  /**
   * Lista todos os pontos de água
   */
  listWaterPoints() {
    const points = Object.entries(this.WATER_POINTS).map(([id, point]) => ({
      id,
      nome: point.nome,
      tipo: point.tipo,
      atividades: point.atividades
    }));
    
    return { success: true, points };
  },

  /**
   * Verifica todos os pontos de água
   */
  checkAllPoints() {
    const results = {};
    
    for (const pointId of Object.keys(this.WATER_POINTS)) {
      results[pointId] = this.checkSafety(pointId);
    }
    
    return { success: true, results };
  },

  /**
   * Protocolos de Hidroterapia
   */
  PROTOCOLS: {
    imersao_terapeutica: {
      id: 'imersao_terapeutica',
      nome: 'Imersão Terapêutica',
      duracao: '15-30 min',
      script: `💧 **Protocolo de Imersão Terapêutica**

**Preparação:**
1. Verifique se as condições estão seguras (✅ já verificado)
2. Hidrate-se antes de entrar
3. Faça alongamentos leves

**A Prática:**

🌊 **Entrada Gradual**
Entre na água lentamente.
Permita que seu corpo se adapte à temperatura.
Respire profundamente a cada passo.

💆 **Imersão Consciente**
Quando estiver confortável, permita-se flutuar ou sentar.
Sinta a pressão hidrostática envolvendo seu corpo.
A água sustenta você — deixe-se ser sustentado(a).

🌬️ **Respiração Aquática**
Sincronize sua respiração com pequenos movimentos da água.
Inspire quando a água sobe levemente.
Expire quando ela desce.

🧘 **Meditação na Água**
Feche os olhos.
Sinta a fronteira entre seu corpo e a água se dissolver.
Você é parte do elemento.

**Benefícios:**
• Relaxamento muscular profundo
• Redução de edemas (pressão hidrostática)
• Liberação de endorfinas
• Conexão com elemento primordial

**Saída:**
Saia lentamente. Seque-se ao sol se possível.
Hidrate-se novamente. 💚`
    },

    crioterapia_natural: {
      id: 'crioterapia_natural',
      nome: 'Crioterapia Natural',
      duracao: '1-3 min',
      temperaturaIdeal: '< 18°C',
      script: `❄️ **Protocolo de Crioterapia Natural**

⚠️ **IMPORTANTE:** Máximo 3 minutos em água muito fria.
Não recomendado para cardíacos ou hipertensos sem orientação médica.

**Preparação:**
1. Aqueça o corpo com movimento (caminhada, alongamento)
2. Respire profundamente várias vezes
3. Mentalize: "Meu corpo sabe se adaptar"

**A Prática:**

🦶 **Fase 1: Pés (30 seg)**
Entre apenas com os pés.
Respire pelo desconforto inicial.
O corpo vai se adaptar.

🦵 **Fase 2: Pernas (30 seg)**
Avance até os joelhos.
Continue respirando profundamente.
Note o formigamento — é normal.

🌊 **Fase 3: Imersão (1-2 min)**
Se confortável, entre até a cintura ou peito.
Mantenha respiração controlada.
NÃO mergulhe a cabeça.

**Saída:**
Saia quando sentir que é suficiente.
Seu corpo sabe o limite.
Seque-se e aqueça-se gradualmente.

**Benefícios:**
• Vasoconstrição → vasodilatação (circulação)
• Liberação de noradrenalina (energia, foco)
• Redução de inflamação
• Fortalecimento do sistema imune
• Resiliência mental 💪`
    },

    contemplacao_aquatica: {
      id: 'contemplacao_aquatica',
      nome: 'Contemplação Aquática',
      duracao: '10-20 min',
      script: `🌊 **Protocolo de Contemplação Aquática**

Quando a imersão não é possível, a água ainda cura através dos sentidos.

**Encontre seu Lugar:**
Sente-se em local seguro, próximo à água.
Pode ser uma pedra, um tronco, ou o próprio chão.

**A Prática:**

👁️ **Visão**
Observe o movimento da água.
Note os padrões, reflexos, cores.
A água nunca é a mesma — como você.

👂 **Audição**
Feche os olhos.
Deixe o som da água preencher sua mente.
Cada gota conta uma história.

🌬️ **Respiração**
Sincronize sua respiração com o ritmo da água.
Se há ondas ou quedas, respire com elas.
Você e a água, no mesmo compasso.

💭 **Reflexão**
A água sempre encontra seu caminho.
Contorna obstáculos, não luta contra eles.
O que isso te ensina sobre sua vida agora?

**Fechamento:**
Agradeça à água por sua presença.
Leve a fluidez com você. 💧`
    }
  },

  /**
   * Obtém protocolo de hidroterapia
   * @param {string} protocolId - ID do protocolo
   */
  getProtocol(protocolId) {
    const protocol = this.PROTOCOLS[protocolId];
    if (protocol) {
      return { success: true, protocol };
    }
    return { success: false, error: 'Protocolo não encontrado' };
  },

  /**
   * Recomenda protocolo baseado nas condições
   * @param {string} pointId - ID do ponto de água
   */
  recommendProtocol(pointId) {
    const safety = this.checkSafety(pointId);
    
    if (!safety.success) {
      return safety;
    }
    
    let recommendedProtocol;
    
    if (safety.statusGeral === SAFETY_STATUS.BLOQUEADO || 
        safety.statusGeral === SAFETY_STATUS.PERIGO) {
      recommendedProtocol = this.PROTOCOLS.contemplacao_aquatica;
    } else if (safety.avaliacoes.temperatura.value < 18) {
      recommendedProtocol = this.PROTOCOLS.crioterapia_natural;
    } else {
      recommendedProtocol = this.PROTOCOLS.imersao_terapeutica;
    }
    
    return {
      success: true,
      safety,
      recommendedProtocol,
      response: {
        text: `${safety.recomendacao.emoji} **${safety.recomendacao.titulo}**\n\n` +
              `📍 Local: ${safety.pointName}\n\n` +
              `${safety.recomendacao.mensagem}\n\n` +
              `---\n\n` +
              `**Protocolo Recomendado:** ${recommendedProtocol.nome}\n` +
              `⏱️ Duração: ${recommendedProtocol.duracao}`,
        type: 'hydrotherapy_recommendation',
        protocol: recommendedProtocol.id
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Hydrotherapy Safety Service
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verifica segurança de um ponto de água
 * @param {string} pointId - ID do ponto
 * @param {object} sensorData - Dados dos sensores (opcional)
 */
function apiHydroCheckSafety(pointId, sensorData) {
  return HydrotherapySafetyService.checkSafety(pointId, sensorData);
}

/**
 * Verifica todos os pontos de água
 */
function apiHydroCheckAll() {
  return HydrotherapySafetyService.checkAllPoints();
}

/**
 * Lista pontos de água disponíveis
 */
function apiHydroListPoints() {
  return HydrotherapySafetyService.listWaterPoints();
}

/**
 * Obtém protocolo de hidroterapia
 * @param {string} protocolId - ID do protocolo
 */
function apiHydroGetProtocol(protocolId) {
  return HydrotherapySafetyService.getProtocol(protocolId);
}

/**
 * Recomenda protocolo baseado nas condições
 * @param {string} pointId - ID do ponto de água
 */
function apiHydroRecommend(pointId) {
  return HydrotherapySafetyService.recommendProtocol(pointId);
}

/**
 * Verifica se imersão é segura (verificação rápida)
 * @param {string} pointId - ID do ponto
 * @returns {object} {safe: boolean, reason: string}
 */
function apiHydroIsImmersionSafe(pointId) {
  const safety = HydrotherapySafetyService.checkSafety(pointId);
  
  if (!safety.success) {
    return { safe: false, reason: safety.error };
  }
  
  const isSafe = safety.statusGeral === SAFETY_STATUS.SEGURO;
  const isAcceptable = safety.statusGeral === SAFETY_STATUS.ATENCAO;
  
  return {
    safe: isSafe,
    acceptable: isAcceptable,
    blocked: safety.statusGeral === SAFETY_STATUS.BLOQUEADO,
    status: safety.statusGeral,
    reason: safety.recomendacao.mensagem,
    allowedActivities: safety.atividadesPermitidas.map(a => a.nome)
  };
}

/**
 * Integração com Serena - verifica antes de sugerir hidroterapia
 * @param {string} pointId - ID do ponto (opcional, verifica todos se não fornecido)
 */
function apiSerenaHydroCheck(pointId) {
  if (pointId) {
    const safety = HydrotherapySafetyService.checkSafety(pointId);
    
    if (safety.statusGeral === SAFETY_STATUS.BLOQUEADO) {
      return {
        success: true,
        canSuggestImmersion: false,
        response: {
          text: `💧 **Sobre Hidroterapia Agora**\n\n` +
                `Verifiquei as condições em ${safety.pointName} e, no momento, ` +
                `a imersão não é recomendada.\n\n` +
                `${safety.recomendacao.mensagem}\n\n` +
                `Posso te guiar em uma **contemplação aquática** — ` +
                `os benefícios da água através dos sentidos, sem entrar nela. ` +
                `Gostaria de experimentar?`,
          type: 'hydro_blocked',
          alternativeProtocol: 'contemplacao_aquatica'
        }
      };
    }
    
    return {
      success: true,
      canSuggestImmersion: true,
      safety,
      response: {
        text: `💧 **Hidroterapia Disponível**\n\n` +
              `${safety.recomendacao.emoji} ${safety.pointName}: ${safety.recomendacao.titulo}\n\n` +
              `${safety.recomendacao.mensagem}`,
        type: 'hydro_available'
      }
    };
  }
  
  // Verifica todos e encontra o melhor
  const allChecks = HydrotherapySafetyService.checkAllPoints();
  let bestPoint = null;
  let bestStatus = null;
  
  for (const [id, check] of Object.entries(allChecks.results)) {
    if (check.statusGeral === SAFETY_STATUS.SEGURO) {
      bestPoint = check;
      bestStatus = SAFETY_STATUS.SEGURO;
      break;
    }
    if (check.statusGeral === SAFETY_STATUS.ATENCAO && bestStatus !== SAFETY_STATUS.SEGURO) {
      bestPoint = check;
      bestStatus = SAFETY_STATUS.ATENCAO;
    }
  }
  
  if (bestPoint) {
    return {
      success: true,
      canSuggestImmersion: true,
      bestPoint,
      response: {
        text: `💧 **Melhor Local para Hidroterapia Agora**\n\n` +
              `${bestPoint.recomendacao.emoji} **${bestPoint.pointName}**\n\n` +
              `${bestPoint.recomendacao.mensagem}`,
        type: 'hydro_best_point'
      }
    };
  }
  
  return {
    success: true,
    canSuggestImmersion: false,
    response: {
      text: `💧 No momento, nenhum ponto de água está em condições ideais para imersão.\n\n` +
            `Posso te guiar em uma **contemplação aquática** como alternativa segura.`,
      type: 'hydro_none_available'
    }
  };
}
