/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - MOTOR DE GAMIFICAÇÃO E ENGAJAMENTO COMUNITÁRIO
 * ═══════════════════════════════════════════════════════════════════════════
 * P05 - Sistema de Gamificação para Conservação
 * 
 * Funcionalidades:
 * - Sistema de pontos e níveis
 * - Badges e conquistas
 * - Missões diárias, semanais e mensais
 * - Rankings e leaderboards
 * - Moedas verdes e recompensas
 * - Impacto ambiental calculado
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha GAMIFICACAO_RA
 */
const SCHEMA_GAMIFICACAO = {
  ID_Usuario: { type: 'string', required: true, unique: true },
  Nome_Usuario: { type: 'string', required: true },
  Email: { type: 'email' },
  Avatar_URL: { type: 'url' },
  Data_Cadastro: { type: 'datetime', required: true },
  Tipo_Usuario: { type: 'enum', values: ['Monitor', 'Voluntario', 'Visitante', 'Pesquisador', 'Gestor'] },
  Pontos_Totais: { type: 'integer', min: 0, default: 0 },
  Pontos_Mes_Atual: { type: 'integer', min: 0, default: 0 },
  Nivel_Atual: { type: 'integer', min: 1, default: 1 },
  Titulo_Nivel: { type: 'string', default: 'Guardião Iniciante' },
  Experiencia_Atual: { type: 'integer', min: 0, default: 0 },
  Experiencia_Proximo_Nivel: { type: 'integer', min: 0, default: 100 },
  Badges_JSON: { type: 'text' },
  Total_Badges: { type: 'integer', min: 0, default: 0 },
  Conquistas_JSON: { type: 'text' },
  Missoes_Ativas_JSON: { type: 'text' },
  Missoes_Concluidas: { type: 'integer', min: 0, default: 0 },
  Sequencia_Dias: { type: 'integer', min: 0, default: 0 },
  Observacoes_Biodiversidade: { type: 'integer', min: 0, default: 0 },
  Alertas_Reportados: { type: 'integer', min: 0, default: 0 },
  Mudas_Plantadas: { type: 'integer', min: 0, default: 0 },
  Especies_Descobertas: { type: 'integer', min: 0, default: 0 },
  Horas_Voluntariado: { type: 'float', min: 0, default: 0 },
  Posicao_Ranking: { type: 'integer', min: 1 },
  Moedas_Verdes: { type: 'integer', min: 0, default: 0 },
  Impacto_Ambiental_Score: { type: 'float', min: 0, default: 0 },
  CO2_Sequestrado_kg: { type: 'float', min: 0, default: 0 },
  Dias_Ativos: { type: 'integer', min: 0, default: 0 },
  Ultimo_Acesso: { type: 'datetime' },
  Notificacoes_Ativas: { type: 'boolean', default: true }
};

/**
 * Headers da planilha GAMIFICACAO_RA
 */
const GAMIFICACAO_HEADERS = [
  'ID_Usuario', 'Nome_Usuario', 'Email', 'Avatar_URL', 'Data_Cadastro', 'Tipo_Usuario',
  'Pontos_Totais', 'Pontos_Mes_Atual', 'Nivel_Atual', 'Titulo_Nivel',
  'Experiencia_Atual', 'Experiencia_Proximo_Nivel', 'Badges_JSON', 'Total_Badges',
  'Conquistas_JSON', 'Missoes_Ativas_JSON', 'Missoes_Concluidas', 'Sequencia_Dias',
  'Observacoes_Biodiversidade', 'Alertas_Reportados', 'Mudas_Plantadas',
  'Especies_Descobertas', 'Horas_Voluntariado', 'Posicao_Ranking', 'Moedas_Verdes',
  'Impacto_Ambiental_Score', 'CO2_Sequestrado_kg', 'Dias_Ativos', 'Ultimo_Acesso',
  'Notificacoes_Ativas'
];


/**
 * Motor de Gamificação da Reserva Araras
 * @namespace GamificationEngine
 */
const GamificationEngine = {
  
  /**
   * Nome da planilha
   */
  SHEET_NAME: 'GAMIFICACAO_RA',
  
  /**
   * Configurações de níveis
   */
  LEVELS: {
    1: { titulo: 'Guardião Iniciante', xp_required: 0, cor: '#9E9E9E' },
    2: { titulo: 'Observador da Natureza', xp_required: 100, cor: '#8D6E63' },
    3: { titulo: 'Protetor Verde', xp_required: 250, cor: '#4CAF50' },
    4: { titulo: 'Guardião Florestal', xp_required: 500, cor: '#2196F3' },
    5: { titulo: 'Mestre Ecológico', xp_required: 1000, cor: '#9C27B0' },
    6: { titulo: 'Sábio da Mata', xp_required: 2000, cor: '#FF9800' },
    7: { titulo: 'Guardião Ancestral', xp_required: 4000, cor: '#E91E63' },
    8: { titulo: 'Protetor Supremo', xp_required: 8000, cor: '#00BCD4' },
    9: { titulo: 'Guardião Lendário', xp_required: 15000, cor: '#FFD700' },
    10: { titulo: 'Espírito da Floresta', xp_required: 30000, cor: '#FF5722' }
  },
  
  /**
   * Valores de pontos por ação
   */
  POINTS: {
    observacao_biodiversidade: 10,
    observacao_especie_rara: 50,
    observacao_especie_ameacada: 100,
    alerta_reportado: 20,
    alerta_critico: 50,
    muda_plantada: 15,
    arvore_monitorada: 5,
    corredor_mapeado: 100,
    missao_diaria: 25,
    missao_semanal: 100,
    missao_mensal: 500,
    login_diario: 5,
    sequencia_7_dias: 50,
    sequencia_30_dias: 200,
    foto_validada: 10,
    comentario_util: 5,
    ajuda_comunidade: 15
  },

  /**
   * Catálogo de badges
   */
  BADGES: {
    // Bronze
    PRIMEIRO_OBSERVADOR: {
      id: 'PRIMEIRO_OBSERVADOR',
      nome: '🔍 Primeiro Observador',
      descricao: 'Registrou sua primeira observação de biodiversidade',
      categoria: 'Bronze',
      raridade: 'Comum',
      pontos: 10,
      criterio: { tipo: 'observacoes', valor: 1 }
    },
    PRIMEIRO_PLANTIO: {
      id: 'PRIMEIRO_PLANTIO',
      nome: '🌱 Primeiro Plantio',
      descricao: 'Plantou sua primeira muda nativa',
      categoria: 'Bronze',
      raridade: 'Comum',
      pontos: 10,
      criterio: { tipo: 'mudas', valor: 1 }
    },
    // Prata
    EXPLORADOR: {
      id: 'EXPLORADOR',
      nome: '🌿 Explorador',
      descricao: 'Registrou 10 observações de biodiversidade',
      categoria: 'Prata',
      raridade: 'Incomum',
      pontos: 25,
      criterio: { tipo: 'observacoes', valor: 10 }
    },
    JARDINEIRO: {
      id: 'JARDINEIRO',
      nome: '🪴 Jardineiro',
      descricao: 'Plantou 10 mudas nativas',
      categoria: 'Prata',
      raridade: 'Incomum',
      pontos: 25,
      criterio: { tipo: 'mudas', valor: 10 }
    },
    VIGILANTE: {
      id: 'VIGILANTE',
      nome: '👁️ Vigilante',
      descricao: 'Reportou 5 alertas ecológicos',
      categoria: 'Prata',
      raridade: 'Incomum',
      pontos: 25,
      criterio: { tipo: 'alertas', valor: 5 }
    },
    // Ouro
    CIENTISTA_CIDADAO: {
      id: 'CIENTISTA_CIDADAO',
      nome: '🔬 Cientista Cidadão',
      descricao: 'Registrou 50 observações de biodiversidade',
      categoria: 'Ouro',
      raridade: 'Raro',
      pontos: 100,
      criterio: { tipo: 'observacoes', valor: 50 }
    },
    REFLORESTADOR: {
      id: 'REFLORESTADOR',
      nome: '🌳 Reflorestador',
      descricao: 'Plantou 50 mudas nativas',
      categoria: 'Ouro',
      raridade: 'Raro',
      pontos: 100,
      criterio: { tipo: 'mudas', valor: 50 }
    },
    SEMANA_PERFEITA: {
      id: 'SEMANA_PERFEITA',
      nome: '📅 Semana Perfeita',
      descricao: 'Acessou o sistema por 7 dias consecutivos',
      categoria: 'Ouro',
      raridade: 'Raro',
      pontos: 50,
      criterio: { tipo: 'sequencia', valor: 7 }
    },
    // Platina
    PLANTADOR_FLORESTAS: {
      id: 'PLANTADOR_FLORESTAS',
      nome: '🏔️ Plantador de Florestas',
      descricao: 'Plantou 100 mudas nativas',
      categoria: 'Platina',
      raridade: 'Epico',
      pontos: 250,
      criterio: { tipo: 'mudas', valor: 100 }
    },
    MESTRE_BIODIVERSIDADE: {
      id: 'MESTRE_BIODIVERSIDADE',
      nome: '🦜 Mestre da Biodiversidade',
      descricao: 'Registrou 100 observações de biodiversidade',
      categoria: 'Platina',
      raridade: 'Epico',
      pontos: 250,
      criterio: { tipo: 'observacoes', valor: 100 }
    },
    // Diamante
    GUARDIAO_DEDICADO: {
      id: 'GUARDIAO_DEDICADO',
      nome: '⭐ Guardião Dedicado',
      descricao: 'Acessou o sistema por 30 dias consecutivos',
      categoria: 'Diamante',
      raridade: 'Lendario',
      pontos: 500,
      criterio: { tipo: 'sequencia', valor: 30 }
    },
    // Especiais
    DESCOBRIDOR: {
      id: 'DESCOBRIDOR',
      nome: '🦋 Descobridor',
      descricao: 'Registrou uma espécie rara pela primeira vez',
      categoria: 'Especial',
      raridade: 'Epico',
      pontos: 200,
      criterio: { tipo: 'especial', valor: 'especie_rara' }
    },
    HEROI_ALERTA: {
      id: 'HEROI_ALERTA',
      nome: '🚨 Herói do Alerta',
      descricao: 'Reportou um alerta crítico que foi confirmado',
      categoria: 'Especial',
      raridade: 'Epico',
      pontos: 150,
      criterio: { tipo: 'especial', valor: 'alerta_critico' }
    }
  },

  /**
   * Missões disponíveis
   */
  MISSIONS: {
    DAILY: [
      { id: 'DAILY_OBSERVE_3', titulo: 'Observador Atento', descricao: 'Registre 3 observações de biodiversidade', objetivo: 3, tipo: 'observacoes', pontos: 25, moedas: 5 },
      { id: 'DAILY_PLANT_2', titulo: 'Mãos na Terra', descricao: 'Plante 2 mudas nativas', objetivo: 2, tipo: 'mudas', pontos: 30, moedas: 8 },
      { id: 'DAILY_MONITOR', titulo: 'Guardião Vigilante', descricao: 'Reporte uma observação ou alerta', objetivo: 1, tipo: 'qualquer', pontos: 20, moedas: 5 },
      { id: 'DAILY_PHOTO', titulo: 'Fotógrafo da Natureza', descricao: 'Tire 3 fotos de espécies', objetivo: 3, tipo: 'fotos', pontos: 25, moedas: 5 }
    ],
    WEEKLY: [
      { id: 'WEEKLY_OBSERVE_15', titulo: 'Explorador Semanal', descricao: 'Registre 15 observações esta semana', objetivo: 15, tipo: 'observacoes', pontos: 100, moedas: 25 },
      { id: 'WEEKLY_PLANT_10', titulo: 'Plantador Semanal', descricao: 'Plante 10 mudas esta semana', objetivo: 10, tipo: 'mudas', pontos: 150, moedas: 40 },
      { id: 'WEEKLY_ALERT_3', titulo: 'Sentinela', descricao: 'Reporte 3 alertas ecológicos', objetivo: 3, tipo: 'alertas', pontos: 80, moedas: 20 }
    ],
    MONTHLY: [
      { id: 'MONTHLY_OBSERVE_50', titulo: 'Cientista do Mês', descricao: 'Registre 50 observações este mês', objetivo: 50, tipo: 'observacoes', pontos: 500, moedas: 100 },
      { id: 'MONTHLY_PLANT_30', titulo: 'Reflorestador do Mês', descricao: 'Plante 30 mudas este mês', objetivo: 30, tipo: 'mudas', pontos: 600, moedas: 150 },
      { id: 'MONTHLY_STREAK_20', titulo: 'Dedicação Mensal', descricao: 'Acesse 20 dias este mês', objetivo: 20, tipo: 'dias_ativos', pontos: 300, moedas: 75 }
    ]
  },
  
  /**
   * Inicializa a planilha de gamificação
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(GAMIFICACAO_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, GAMIFICACAO_HEADERS.length);
        headerRange.setBackground('#7B1FA2');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[GamificationEngine] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[GamificationEngine] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra ou obtém usuário
   * @param {object} userData - Dados do usuário
   * @returns {object} Perfil do usuário
   */
  registerUser: function(userData) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      // Verifica se usuário já existe
      const existingUser = this._getUserById(userData.id || userData.email);
      if (existingUser) {
        return { success: true, user: existingUser, isNew: false };
      }
      
      const id = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const row = [
        id,
        userData.nome || 'Usuário',
        userData.email || '',
        userData.avatar || '',
        new Date(),
        userData.tipo || 'Visitante',
        0, // Pontos_Totais
        0, // Pontos_Mes_Atual
        1, // Nivel_Atual
        'Guardião Iniciante', // Titulo_Nivel
        0, // Experiencia_Atual
        100, // Experiencia_Proximo_Nivel
        '[]', // Badges_JSON
        0, // Total_Badges
        '[]', // Conquistas_JSON
        '[]', // Missoes_Ativas_JSON
        0, // Missoes_Concluidas
        0, // Sequencia_Dias
        0, // Observacoes_Biodiversidade
        0, // Alertas_Reportados
        0, // Mudas_Plantadas
        0, // Especies_Descobertas
        0, // Horas_Voluntariado
        0, // Posicao_Ranking
        0, // Moedas_Verdes
        0, // Impacto_Ambiental_Score
        0, // CO2_Sequestrado_kg
        1, // Dias_Ativos
        new Date(), // Ultimo_Acesso
        true // Notificacoes_Ativas
      ];
      
      sheet.appendRow(row);
      
      // Atribui missão diária inicial
      const dailyMission = this._assignDailyMission(id);
      
      return {
        success: true,
        user: {
          id: id,
          nome: userData.nome,
          nivel: 1,
          titulo: 'Guardião Iniciante',
          pontos: 0,
          moedas: 0,
          badges: [],
          missao_diaria: dailyMission
        },
        isNew: true
      };
      
    } catch (error) {
      Logger.log(`[registerUser] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra ação do usuário e atribui pontos
   * @param {string} userId - ID do usuário
   * @param {string} actionType - Tipo da ação
   * @param {object} metadata - Metadados adicionais
   * @returns {object} Resultado com pontos e recompensas
   */
  registerAction: function(userId, actionType, metadata = {}) {
    try {
      const user = this._getUserById(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      const basePoints = this.POINTS[actionType] || 0;
      const finalPoints = this._applyMultipliers(basePoints, metadata);
      
      // Atualiza pontos
      user.pontos_totais += finalPoints;
      user.pontos_mes_atual += finalPoints;
      user.experiencia_atual += finalPoints;
      
      // Atualiza estatísticas específicas
      this._updateStats(user, actionType, metadata);
      
      // Verifica subida de nível
      const levelUp = this._checkLevelUp(user);
      
      // Verifica badges
      const newBadges = this._checkBadges(user, actionType, metadata);
      
      // Verifica progresso de missões
      const missionProgress = this._updateMissionProgress(user, actionType, metadata);
      
      // Calcula impacto ambiental
      user.impacto_ambiental_score = this._calculateImpactScore(user);
      
      // Salva dados
      this._saveUserData(user);
      
      return {
        success: true,
        pontos_ganhos: finalPoints,
        pontos_totais: user.pontos_totais,
        nivel_atual: user.nivel_atual,
        titulo: user.titulo_nivel,
        level_up: levelUp,
        novos_badges: newBadges,
        missoes: missionProgress,
        impacto_ambiental: user.impacto_ambiental_score
      };
      
    } catch (error) {
      Logger.log(`[registerAction] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Aplica multiplicadores de eventos
   * @private
   */
  _applyMultipliers: function(basePoints, metadata) {
    let multiplier = 1.0;
    
    if (metadata.special_event) multiplier *= 2.0;
    if (metadata.first_time) multiplier *= 1.5;
    if (metadata.team_action) multiplier *= 1.2;
    if (metadata.weekend) multiplier *= 1.1;
    
    return Math.round(basePoints * multiplier);
  },

  /**
   * Atualiza estatísticas do usuário
   * @private
   */
  _updateStats: function(user, actionType, metadata) {
    switch (actionType) {
      case 'observacao_biodiversidade':
      case 'observacao_especie_rara':
      case 'observacao_especie_ameacada':
        user.observacoes_biodiversidade++;
        if (metadata.especie_nova) user.especies_descobertas++;
        break;
      case 'alerta_reportado':
      case 'alerta_critico':
        user.alertas_reportados++;
        break;
      case 'muda_plantada':
        user.mudas_plantadas += (metadata.quantidade || 1);
        user.co2_sequestrado_kg += (metadata.quantidade || 1) * 5;
        break;
      case 'login_diario':
        user.dias_ativos++;
        user.sequencia_dias++;
        user.ultimo_acesso = new Date();
        break;
    }
  },
  
  /**
   * Verifica se usuário subiu de nível
   * @private
   */
  _checkLevelUp: function(user) {
    const currentLevel = user.nivel_atual;
    const nextLevel = currentLevel + 1;
    
    if (this.LEVELS[nextLevel] && user.experiencia_atual >= this.LEVELS[nextLevel].xp_required) {
      user.nivel_atual = nextLevel;
      user.titulo_nivel = this.LEVELS[nextLevel].titulo;
      user.experiencia_proximo_nivel = this.LEVELS[nextLevel + 1]?.xp_required || 999999;
      
      // Recompensa por subir de nível
      const rewardCoins = nextLevel * 10;
      user.moedas_verdes += rewardCoins;
      
      return {
        subiu_nivel: true,
        novo_nivel: nextLevel,
        novo_titulo: user.titulo_nivel,
        moedas_bonus: rewardCoins
      };
    }
    
    return { subiu_nivel: false };
  },
  
  /**
   * Verifica badges desbloqueados
   * @private
   */
  _checkBadges: function(user, actionType, metadata) {
    const newBadges = [];
    const userBadges = JSON.parse(user.badges_json || '[]');
    
    for (const [badgeId, badge] of Object.entries(this.BADGES)) {
      if (userBadges.includes(badgeId)) continue;
      
      let earned = false;
      
      switch (badge.criterio.tipo) {
        case 'observacoes':
          earned = user.observacoes_biodiversidade >= badge.criterio.valor;
          break;
        case 'mudas':
          earned = user.mudas_plantadas >= badge.criterio.valor;
          break;
        case 'alertas':
          earned = user.alertas_reportados >= badge.criterio.valor;
          break;
        case 'sequencia':
          earned = user.sequencia_dias >= badge.criterio.valor;
          break;
        case 'especial':
          if (badge.criterio.valor === 'especie_rara' && actionType === 'observacao_especie_rara') {
            earned = metadata.first_time === true;
          }
          if (badge.criterio.valor === 'alerta_critico' && actionType === 'alerta_critico') {
            earned = metadata.confirmado === true;
          }
          break;
      }
      
      if (earned) {
        userBadges.push(badgeId);
        user.total_badges++;
        user.pontos_totais += badge.pontos;
        newBadges.push(badge);
      }
    }
    
    user.badges_json = JSON.stringify(userBadges);
    return newBadges;
  },

  /**
   * Atualiza progresso de missões
   * @private
   */
  _updateMissionProgress: function(user, actionType, metadata) {
    const missoes = JSON.parse(user.missoes_ativas_json || '[]');
    const completadas = [];
    
    missoes.forEach(missao => {
      let incremento = 0;
      
      if (missao.tipo === 'observacoes' && actionType.includes('observacao')) {
        incremento = 1;
      } else if (missao.tipo === 'mudas' && actionType === 'muda_plantada') {
        incremento = metadata.quantidade || 1;
      } else if (missao.tipo === 'alertas' && actionType.includes('alerta')) {
        incremento = 1;
      } else if (missao.tipo === 'qualquer') {
        incremento = 1;
      }
      
      if (incremento > 0) {
        missao.progresso = (missao.progresso || 0) + incremento;
        
        if (missao.progresso >= missao.objetivo) {
          missao.concluida = true;
          user.pontos_totais += missao.pontos;
          user.moedas_verdes += missao.moedas;
          user.missoes_concluidas++;
          completadas.push(missao);
        }
      }
    });
    
    // Remove missões concluídas
    user.missoes_ativas_json = JSON.stringify(missoes.filter(m => !m.concluida));
    
    return {
      completadas: completadas,
      ativas: missoes.filter(m => !m.concluida)
    };
  },
  
  /**
   * Calcula score de impacto ambiental
   * @private
   */
  _calculateImpactScore: function(user) {
    let score = 0;
    
    score += user.observacoes_biodiversidade * 2;
    score += user.mudas_plantadas * 10;
    score += user.alertas_reportados * 5;
    score += user.especies_descobertas * 20;
    score += user.horas_voluntariado * 15;
    score += user.co2_sequestrado_kg * 0.5;
    
    return parseFloat(score.toFixed(1));
  },
  
  /**
   * Atribui missão diária
   * @private
   */
  _assignDailyMission: function(userId) {
    const missions = this.MISSIONS.DAILY;
    const randomMission = missions[Math.floor(Math.random() * missions.length)];
    
    return {
      ...randomMission,
      progresso: 0,
      data_atribuicao: new Date().toISOString()
    };
  },

  /**
   * Obtém usuário por ID
   * @private
   */
  _getUserById: function(userId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId || data[i][2] === userId) {
          return {
            row_index: i + 1,
            id: data[i][0],
            nome: data[i][1],
            email: data[i][2],
            avatar: data[i][3],
            data_cadastro: data[i][4],
            tipo: data[i][5],
            pontos_totais: data[i][6] || 0,
            pontos_mes_atual: data[i][7] || 0,
            nivel_atual: data[i][8] || 1,
            titulo_nivel: data[i][9] || 'Guardião Iniciante',
            experiencia_atual: data[i][10] || 0,
            experiencia_proximo_nivel: data[i][11] || 100,
            badges_json: data[i][12] || '[]',
            total_badges: data[i][13] || 0,
            conquistas_json: data[i][14] || '[]',
            missoes_ativas_json: data[i][15] || '[]',
            missoes_concluidas: data[i][16] || 0,
            sequencia_dias: data[i][17] || 0,
            observacoes_biodiversidade: data[i][18] || 0,
            alertas_reportados: data[i][19] || 0,
            mudas_plantadas: data[i][20] || 0,
            especies_descobertas: data[i][21] || 0,
            horas_voluntariado: data[i][22] || 0,
            posicao_ranking: data[i][23] || 0,
            moedas_verdes: data[i][24] || 0,
            impacto_ambiental_score: data[i][25] || 0,
            co2_sequestrado_kg: data[i][26] || 0,
            dias_ativos: data[i][27] || 0,
            ultimo_acesso: data[i][28],
            notificacoes_ativas: data[i][29]
          };
        }
      }
      
      return null;
    } catch (error) {
      Logger.log(`[_getUserById] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Salva dados do usuário
   * @private
   */
  _saveUserData: function(user) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!user.row_index) return;
      
      const row = user.row_index;
      
      sheet.getRange(row, 7).setValue(user.pontos_totais);
      sheet.getRange(row, 8).setValue(user.pontos_mes_atual);
      sheet.getRange(row, 9).setValue(user.nivel_atual);
      sheet.getRange(row, 10).setValue(user.titulo_nivel);
      sheet.getRange(row, 11).setValue(user.experiencia_atual);
      sheet.getRange(row, 12).setValue(user.experiencia_proximo_nivel);
      sheet.getRange(row, 13).setValue(user.badges_json);
      sheet.getRange(row, 14).setValue(user.total_badges);
      sheet.getRange(row, 16).setValue(user.missoes_ativas_json);
      sheet.getRange(row, 17).setValue(user.missoes_concluidas);
      sheet.getRange(row, 18).setValue(user.sequencia_dias);
      sheet.getRange(row, 19).setValue(user.observacoes_biodiversidade);
      sheet.getRange(row, 20).setValue(user.alertas_reportados);
      sheet.getRange(row, 21).setValue(user.mudas_plantadas);
      sheet.getRange(row, 22).setValue(user.especies_descobertas);
      sheet.getRange(row, 25).setValue(user.moedas_verdes);
      sheet.getRange(row, 26).setValue(user.impacto_ambiental_score);
      sheet.getRange(row, 27).setValue(user.co2_sequestrado_kg);
      sheet.getRange(row, 28).setValue(user.dias_ativos);
      sheet.getRange(row, 29).setValue(new Date());
      
    } catch (error) {
      Logger.log(`[_saveUserData] Erro: ${error}`);
    }
  },

  /**
   * Obtém perfil completo do usuário
   * @param {string} userId - ID do usuário
   * @returns {object} Perfil completo
   */
  getUserProfile: function(userId) {
    try {
      const user = this._getUserById(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      const badges = JSON.parse(user.badges_json || '[]');
      const badgesDetalhados = badges.map(id => this.BADGES[id]).filter(b => b);
      
      const missoes = JSON.parse(user.missoes_ativas_json || '[]');
      
      const levelInfo = this.LEVELS[user.nivel_atual];
      const nextLevelInfo = this.LEVELS[user.nivel_atual + 1];
      
      return {
        success: true,
        perfil: {
          id: user.id,
          nome: user.nome,
          avatar: user.avatar,
          tipo: user.tipo,
          data_cadastro: user.data_cadastro
        },
        nivel: {
          atual: user.nivel_atual,
          titulo: user.titulo_nivel,
          cor: levelInfo?.cor || '#9E9E9E',
          xp_atual: user.experiencia_atual,
          xp_proximo: nextLevelInfo?.xp_required || 999999,
          progresso_percent: nextLevelInfo ? 
            Math.round((user.experiencia_atual / nextLevelInfo.xp_required) * 100) : 100
        },
        pontos: {
          totais: user.pontos_totais,
          mes_atual: user.pontos_mes_atual,
          moedas_verdes: user.moedas_verdes
        },
        estatisticas: {
          observacoes: user.observacoes_biodiversidade,
          mudas_plantadas: user.mudas_plantadas,
          alertas: user.alertas_reportados,
          especies_descobertas: user.especies_descobertas,
          dias_ativos: user.dias_ativos,
          sequencia_dias: user.sequencia_dias,
          missoes_concluidas: user.missoes_concluidas
        },
        impacto: {
          score: user.impacto_ambiental_score,
          co2_sequestrado_kg: user.co2_sequestrado_kg
        },
        badges: {
          total: user.total_badges,
          lista: badgesDetalhados
        },
        missoes_ativas: missoes,
        ranking: {
          posicao: user.posicao_ranking || 'N/A'
        }
      };
      
    } catch (error) {
      Logger.log(`[getUserProfile] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém ranking (leaderboard)
   * @param {string} tipo - Tipo de ranking (geral, mensal, impacto)
   * @param {number} limite - Número de posições
   * @returns {Array} Lista ordenada
   */
  getLeaderboard: function(tipo = 'geral', limite = 10) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const users = [];
      
      for (let i = 1; i < data.length; i++) {
        let valor;
        switch (tipo) {
          case 'mensal':
            valor = data[i][7] || 0;
            break;
          case 'impacto':
            valor = data[i][25] || 0;
            break;
          default:
            valor = data[i][6] || 0;
        }
        
        users.push({
          id: data[i][0],
          nome: data[i][1],
          avatar: data[i][3],
          nivel: data[i][8],
          titulo: data[i][9],
          valor: valor,
          badges: data[i][13] || 0
        });
      }
      
      // Ordena por valor
      users.sort((a, b) => b.valor - a.valor);
      
      // Atribui posições
      users.forEach((user, index) => {
        user.posicao = index + 1;
      });
      
      return users.slice(0, limite);
      
    } catch (error) {
      Logger.log(`[getLeaderboard] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Obtém estatísticas gerais do sistema de gamificação
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          total_usuarios: 0,
          pontos_distribuidos: 0,
          badges_conquistados: 0,
          missoes_concluidas: 0,
          impacto_total: 0,
          co2_total_kg: 0
        };
      }
      
      const data = sheet.getDataRange().getValues();
      
      let stats = {
        total_usuarios: data.length - 1,
        pontos_distribuidos: 0,
        badges_conquistados: 0,
        missoes_concluidas: 0,
        impacto_total: 0,
        co2_total_kg: 0,
        observacoes_total: 0,
        mudas_total: 0,
        por_nivel: {},
        por_tipo: {}
      };
      
      for (let i = 1; i < data.length; i++) {
        stats.pontos_distribuidos += data[i][6] || 0;
        stats.badges_conquistados += data[i][13] || 0;
        stats.missoes_concluidas += data[i][16] || 0;
        stats.impacto_total += data[i][25] || 0;
        stats.co2_total_kg += data[i][26] || 0;
        stats.observacoes_total += data[i][18] || 0;
        stats.mudas_total += data[i][20] || 0;
        
        const nivel = data[i][8] || 1;
        stats.por_nivel[nivel] = (stats.por_nivel[nivel] || 0) + 1;
        
        const tipo = data[i][5] || 'Visitante';
        stats.por_tipo[tipo] = (stats.por_tipo[tipo] || 0) + 1;
      }
      
      stats.impacto_total = parseFloat(stats.impacto_total.toFixed(1));
      stats.co2_total_kg = parseFloat(stats.co2_total_kg.toFixed(1));
      
      return stats;
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Obtém missões disponíveis para o usuário
   * @param {string} userId - ID do usuário
   * @returns {object} Missões organizadas por tipo
   */
  getMissions: function(userId) {
    try {
      const user = this._getUserById(userId);
      const missoes_ativas = user ? JSON.parse(user.missoes_ativas_json || '[]') : [];
      
      return {
        success: true,
        ativas: missoes_ativas,
        disponiveis: {
          diarias: this.MISSIONS.DAILY,
          semanais: this.MISSIONS.WEEKLY,
          mensais: this.MISSIONS.MONTHLY
        }
      };
      
    } catch (error) {
      Logger.log(`[getMissions] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Aceita uma missão
   * @param {string} userId - ID do usuário
   * @param {string} missionId - ID da missão
   * @returns {object} Resultado
   */
  acceptMission: function(userId, missionId) {
    try {
      const user = this._getUserById(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      // Encontra a missão
      let mission = null;
      for (const tipo of ['DAILY', 'WEEKLY', 'MONTHLY']) {
        mission = this.MISSIONS[tipo].find(m => m.id === missionId);
        if (mission) break;
      }
      
      if (!mission) {
        return { success: false, error: 'Missão não encontrada' };
      }
      
      const missoes = JSON.parse(user.missoes_ativas_json || '[]');
      
      // Verifica se já está ativa
      if (missoes.find(m => m.id === missionId)) {
        return { success: false, error: 'Missão já está ativa' };
      }
      
      // Adiciona missão
      missoes.push({
        ...mission,
        progresso: 0,
        data_aceita: new Date().toISOString()
      });
      
      user.missoes_ativas_json = JSON.stringify(missoes);
      this._saveUserData(user);
      
      return {
        success: true,
        message: 'Missão aceita!',
        missao: mission
      };
      
    } catch (error) {
      Logger.log(`[acceptMission] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obtém catálogo de badges
   * @returns {object} Badges organizados por categoria
   */
  getBadgesCatalog: function() {
    const categorias = {};
    
    for (const [id, badge] of Object.entries(this.BADGES)) {
      const cat = badge.categoria;
      if (!categorias[cat]) {
        categorias[cat] = [];
      }
      categorias[cat].push(badge);
    }
    
    return {
      success: true,
      total: Object.keys(this.BADGES).length,
      por_categoria: categorias
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P05 Gamificação
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de gamificação
 * @returns {object} Resultado
 */
function apiGamificacaoInit() {
  return GamificationEngine.initializeSheet();
}

/**
 * Registra novo usuário no sistema de gamificação
 * @param {object} userData - Dados do usuário (nome, email, tipo)
 * @returns {object} Perfil criado
 */
function apiGamificacaoRegister(userData) {
  return GamificationEngine.registerUser(userData);
}

/**
 * Registra ação do usuário e atribui pontos
 * @param {string} userId - ID do usuário
 * @param {string} actionType - Tipo da ação
 * @param {object} metadata - Metadados opcionais
 * @returns {object} Resultado com pontos e recompensas
 */
function apiGamificacaoAction(userId, actionType, metadata) {
  return GamificationEngine.registerAction(userId, actionType, metadata || {});
}

/**
 * Obtém perfil completo do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Perfil com estatísticas
 */
function apiGamificacaoProfile(userId) {
  return GamificationEngine.getUserProfile(userId);
}

/**
 * Obtém ranking/leaderboard
 * @param {string} tipo - Tipo (geral, mensal, impacto)
 * @param {number} limite - Número de posições
 * @returns {Array} Lista ordenada
 */
function apiGamificacaoRanking(tipo, limite) {
  return GamificationEngine.getLeaderboard(tipo || 'geral', limite || 10);
}

/**
 * Obtém estatísticas gerais do sistema
 * @returns {object} Estatísticas
 */
function apiGamificacaoStats() {
  return GamificationEngine.getStatistics();
}

/**
 * Obtém missões disponíveis
 * @param {string} userId - ID do usuário
 * @returns {object} Missões
 */
function apiGamificacaoMissions(userId) {
  return GamificationEngine.getMissions(userId);
}

/**
 * Aceita uma missão
 * @param {string} userId - ID do usuário
 * @param {string} missionId - ID da missão
 * @returns {object} Resultado
 */
function apiGamificacaoAcceptMission(userId, missionId) {
  return GamificationEngine.acceptMission(userId, missionId);
}

/**
 * Obtém catálogo de badges
 * @returns {object} Badges por categoria
 */
function apiGamificacaoBadges() {
  return GamificationEngine.getBadgesCatalog();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 33/30 (20/30): EXPLORAÇÃO GAMIFICADA E REIVINDICAÇÃO DE DISTINTIVOS
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Geocaching Best Practices
// - iNaturalist Gamification Model
// - National Park Service Digital Passport

/**
 * Badges de exploração progressivos
 */
const EXPLORER_BADGES = {
  EXPLORADOR_INICIANTE: { 
    id: 'EXPLORADOR_INICIANTE', 
    nome: '🗺️ Explorador Iniciante', 
    descricao: 'Visitou sua primeira trilha',
    trilhas: 1, 
    pontos: 25,
    categoria: 'Exploração',
    raridade: 'Comum'
  },
  EXPLORADOR: { 
    id: 'EXPLORADOR', 
    nome: '🧭 Explorador', 
    descricao: 'Visitou 5 trilhas diferentes',
    trilhas: 5, 
    pontos: 100,
    categoria: 'Exploração',
    raridade: 'Incomum'
  },
  AVENTUREIRO: { 
    id: 'AVENTUREIRO', 
    nome: '🏕️ Aventureiro', 
    descricao: 'Visitou 10 trilhas diferentes',
    trilhas: 10, 
    pontos: 250,
    categoria: 'Exploração',
    raridade: 'Raro'
  },
  DESBRAVADOR: { 
    id: 'DESBRAVADOR', 
    nome: '🏔️ Desbravador', 
    descricao: 'Visitou 25 trilhas diferentes',
    trilhas: 25, 
    pontos: 500,
    categoria: 'Exploração',
    raridade: 'Épico'
  },
  MESTRE_TRILHAS: { 
    id: 'MESTRE_TRILHAS', 
    nome: '👑 Mestre das Trilhas', 
    descricao: 'Visitou 50 trilhas diferentes',
    trilhas: 50, 
    pontos: 1000,
    categoria: 'Exploração',
    raridade: 'Lendário'
  },
  COLECIONADOR_POI: {
    id: 'COLECIONADOR_POI',
    nome: '📍 Colecionador de Pontos',
    descricao: 'Reivindicou 25 waypoints',
    waypoints: 25,
    pontos: 150,
    categoria: 'Exploração',
    raridade: 'Raro'
  },
  TRILHA_COMPLETA: {
    id: 'TRILHA_COMPLETA',
    nome: '✅ Trilha Completa',
    descricao: 'Completou todos os waypoints de uma trilha',
    especial: 'trail_complete',
    pontos: 200,
    categoria: 'Exploração',
    raridade: 'Épico'
  }
};

/**
 * Pontos por ações de exploração
 */
const EXPLORATION_POINTS = {
  waypoint_claim: 15,
  first_waypoint_trail: 25,
  trail_complete: 100,
  first_trail: 50,
  rare_poi: 30
};

// Adiciona ao GamificationEngine
GamificationEngine.EXPLORER_BADGES = EXPLORER_BADGES;
GamificationEngine.EXPLORATION_POINTS = EXPLORATION_POINTS;

/**
 * Garante que a planilha de explorações existe
 * @private
 */
GamificationEngine._ensureExplorationSheet = function() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('EXPLORACOES_RA');
  
  if (!sheet) {
    sheet = ss.insertSheet('EXPLORACOES_RA');
    sheet.appendRow([
      'id', 'user_id', 'poi_id', 'poi_nome', 'trilha_id', 'trilha_nome',
      'timestamp', 'latitude', 'longitude', 'pontos_ganhos', 'badge_desbloqueado'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }
  
  return sheet;
};

/**
 * Obtém informações do POI
 * @private
 */
GamificationEngine._getPOIInfo = function(poiId) {
  try {
    // Tenta buscar em GPS_POINTS ou WAYPOINTS
    const ss = getSpreadsheet();
    const sheetNames = ['GPS_POINTS', 'WAYPOINTS', 'PONTOS_INTERESSE_RA'];
    
    for (const sheetName of sheetNames) {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet || sheet.getLastRow() < 2) continue;
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.findIndex(h => 
        h.toLowerCase().includes('id') && !h.toLowerCase().includes('trilha')
      );
      
      if (idCol === -1) continue;
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idCol]) === String(poiId)) {
          const nomeCol = headers.findIndex(h => 
            h.toLowerCase().includes('nome') || h.toLowerCase().includes('name')
          );
          const trilhaIdCol = headers.findIndex(h => 
            h.toLowerCase().includes('trilha_id') || h.toLowerCase().includes('trail_id')
          );
          
          return {
            found: true,
            id: poiId,
            nome: nomeCol !== -1 ? data[i][nomeCol] : `POI ${poiId}`,
            trilha_id: trilhaIdCol !== -1 ? data[i][trilhaIdCol] : null
          };
        }
      }
    }
    
    return { found: false };
  } catch (e) {
    Logger.log(`[_getPOIInfo] Erro: ${e}`);
    return { found: false };
  }
};

/**
 * Obtém nome da trilha
 * @private
 */
GamificationEngine._getTrailName = function(trilhaId) {
  try {
    if (!trilhaId) return 'Trilha Desconhecida';
    
    if (typeof DatabaseService !== 'undefined') {
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: trilhaId });
      if (trilha.success && trilha.data.length > 0) {
        return trilha.data[0].nome || trilhaId;
      }
    }
    
    return trilhaId;
  } catch (e) {
    return trilhaId || 'Trilha Desconhecida';
  }
};

/**
 * Verifica se usuário já reivindicou este POI
 * @private
 */
GamificationEngine._hasClaimedPOI = function(userId, poiId) {
  try {
    const sheet = this._ensureExplorationSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId && data[i][2] === poiId) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Obtém trilhas únicas visitadas pelo usuário
 * @private
 */
GamificationEngine._getVisitedTrails = function(userId) {
  try {
    const sheet = this._ensureExplorationSheet();
    const data = sheet.getDataRange().getValues();
    const trilhas = new Set();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId && data[i][4]) {
        trilhas.add(data[i][4]);
      }
    }
    
    return Array.from(trilhas);
  } catch (e) {
    return [];
  }
};

/**
 * Conta waypoints reivindicados pelo usuário
 * @private
 */
GamificationEngine._countClaimedWaypoints = function(userId, trilhaId = null) {
  try {
    const sheet = this._ensureExplorationSheet();
    const data = sheet.getDataRange().getValues();
    let count = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        if (!trilhaId || data[i][4] === trilhaId) {
          count++;
        }
      }
    }
    
    return count;
  } catch (e) {
    return 0;
  }
};

/**
 * Reivindica waypoint via QR code
 * Prompt 33/30: Reivindicação de localização
 * @param {string} userId - ID do usuário
 * @param {string} poiId - ID do POI (do QR code)
 * @param {object} coords - Coordenadas opcionais { latitude, longitude }
 * @returns {object} Resultado com pontos e badges
 */
GamificationEngine.claimWaypoint = function(userId, poiId, coords = {}) {
  try {
    if (!userId) {
      return { success: false, error: 'userId é obrigatório' };
    }
    if (!poiId) {
      return { success: false, error: 'poiId é obrigatório (escaneie o QR code)' };
    }

    // Verifica se usuário existe
    const user = this._getUserById(userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado. Registre-se primeiro.' };
    }

    // Verifica se já reivindicou
    if (this._hasClaimedPOI(userId, poiId)) {
      return { 
        success: false, 
        error: 'Você já reivindicou este waypoint!',
        ja_reivindicado: true
      };
    }

    // Obtém informações do POI
    const poiInfo = this._getPOIInfo(poiId);
    const poiNome = poiInfo.found ? poiInfo.nome : `Waypoint ${poiId}`;
    const trilhaId = poiInfo.trilha_id || 'GERAL';
    const trilhaNome = this._getTrailName(trilhaId);

    // Calcula pontos
    let pontosGanhos = EXPLORATION_POINTS.waypoint_claim;
    const trilhasAntes = this._getVisitedTrails(userId);
    const isFirstWaypointOnTrail = !trilhasAntes.includes(trilhaId);
    const isFirstTrailEver = trilhasAntes.length === 0;

    if (isFirstWaypointOnTrail) {
      pontosGanhos += EXPLORATION_POINTS.first_waypoint_trail;
    }
    if (isFirstTrailEver) {
      pontosGanhos += EXPLORATION_POINTS.first_trail;
    }

    // Gera ID da exploração
    const timestamp = new Date();
    const expId = `EXP-${timestamp.getTime().toString(36).toUpperCase()}`;

    // Verifica badges de exploração
    const trilhasDepois = isFirstWaypointOnTrail 
      ? [...trilhasAntes, trilhaId] 
      : trilhasAntes;
    const waypointsTotal = this._countClaimedWaypoints(userId) + 1;
    
    const novosBadges = this._checkExplorerBadges(user, trilhasDepois.length, waypointsTotal);
    let badgeDesbloqueado = novosBadges.length > 0 ? novosBadges[0].id : '';

    // Adiciona pontos dos badges
    novosBadges.forEach(badge => {
      pontosGanhos += badge.pontos;
    });

    // Salva exploração
    const sheet = this._ensureExplorationSheet();
    sheet.appendRow([
      expId,
      userId,
      poiId,
      poiNome,
      trilhaId,
      trilhaNome,
      timestamp,
      coords.latitude || '',
      coords.longitude || '',
      pontosGanhos,
      badgeDesbloqueado
    ]);

    // Atualiza pontos do usuário via registerAction
    this.registerAction(userId, 'waypoint_claim', {
      poi_id: poiId,
      trilha_id: trilhaId,
      pontos_extra: pontosGanhos - EXPLORATION_POINTS.waypoint_claim
    });

    // Monta resposta
    return {
      success: true,
      exploracao_id: expId,
      waypoint: {
        id: poiId,
        nome: poiNome
      },
      trilha: {
        id: trilhaId,
        nome: trilhaNome,
        primeira_visita: isFirstWaypointOnTrail
      },
      pontos: {
        ganhos: pontosGanhos,
        detalhes: {
          waypoint: EXPLORATION_POINTS.waypoint_claim,
          primeira_trilha: isFirstWaypointOnTrail ? EXPLORATION_POINTS.first_waypoint_trail : 0,
          bonus_badges: novosBadges.reduce((sum, b) => sum + b.pontos, 0)
        }
      },
      badges_desbloqueados: novosBadges,
      progresso: {
        trilhas_visitadas: trilhasDepois.length,
        waypoints_total: waypointsTotal
      },
      message: novosBadges.length > 0 
        ? `🎉 Waypoint reivindicado! Você desbloqueou: ${novosBadges.map(b => b.nome).join(', ')}`
        : `✅ Waypoint "${poiNome}" reivindicado! +${pontosGanhos} pontos`
    };

  } catch (error) {
    Logger.log(`[claimWaypoint] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica e concede badges de exploração
 * @private
 */
GamificationEngine._checkExplorerBadges = function(user, numTrilhas, numWaypoints) {
  const novosBadges = [];
  const userBadges = JSON.parse(user.badges_json || '[]');

  // Verifica badges por número de trilhas
  for (const [badgeId, badge] of Object.entries(EXPLORER_BADGES)) {
    if (userBadges.includes(badgeId)) continue;

    let earned = false;

    if (badge.trilhas && numTrilhas >= badge.trilhas) {
      earned = true;
    }
    if (badge.waypoints && numWaypoints >= badge.waypoints) {
      earned = true;
    }

    if (earned) {
      userBadges.push(badgeId);
      user.total_badges = (user.total_badges || 0) + 1;
      novosBadges.push(badge);
    }
  }

  // Atualiza badges do usuário
  if (novosBadges.length > 0) {
    user.badges_json = JSON.stringify(userBadges);
    this._saveUserData(user);
  }

  return novosBadges;
};

/**
 * Obtém progresso de exploração do usuário
 * Prompt 33/30: Rastreamento de progresso
 * @param {string} userId - ID do usuário
 * @returns {object} Progresso detalhado
 */
GamificationEngine.getExplorationProgress = function(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'userId é obrigatório' };
    }

    const user = this._getUserById(userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const trilhasVisitadas = this._getVisitedTrails(userId);
    const waypointsTotal = this._countClaimedWaypoints(userId);
    const userBadges = JSON.parse(user.badges_json || '[]');

    // Badges de exploração conquistados
    const badgesExploracao = Object.values(EXPLORER_BADGES)
      .filter(b => userBadges.includes(b.id))
      .map(b => ({ ...b, conquistado: true }));

    // Próximo badge
    let proximoBadge = null;
    for (const badge of Object.values(EXPLORER_BADGES)) {
      if (!userBadges.includes(badge.id)) {
        if (badge.trilhas) {
          proximoBadge = {
            ...badge,
            progresso: trilhasVisitadas.length,
            objetivo: badge.trilhas,
            percentual: Math.round((trilhasVisitadas.length / badge.trilhas) * 100)
          };
          break;
        }
      }
    }

    // Obtém explorações recentes
    const sheet = this._ensureExplorationSheet();
    const data = sheet.getDataRange().getValues();
    const exploracoes = [];
    
    for (let i = data.length - 1; i >= 1 && exploracoes.length < 10; i--) {
      if (data[i][1] === userId) {
        exploracoes.push({
          id: data[i][0],
          poi_nome: data[i][3],
          trilha_nome: data[i][5],
          timestamp: data[i][6],
          pontos: data[i][9]
        });
      }
    }

    return {
      success: true,
      usuario: {
        id: userId,
        nome: user.nome
      },
      estatisticas: {
        trilhas_visitadas: trilhasVisitadas.length,
        waypoints_reivindicados: waypointsTotal,
        badges_exploracao: badgesExploracao.length
      },
      trilhas: trilhasVisitadas.map(id => ({
        id: id,
        nome: this._getTrailName(id),
        waypoints_reivindicados: this._countClaimedWaypoints(userId, id)
      })),
      badges: {
        conquistados: badgesExploracao,
        proximo: proximoBadge
      },
      exploracoes_recentes: exploracoes
    };

  } catch (error) {
    Logger.log(`[getExplorationProgress] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém progresso em uma trilha específica
 * @param {string} userId - ID do usuário
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Progresso na trilha
 */
GamificationEngine.getTrailProgress = function(userId, trilhaId) {
  try {
    if (!userId || !trilhaId) {
      return { success: false, error: 'userId e trilhaId são obrigatórios' };
    }

    const waypointsReivindicados = this._countClaimedWaypoints(userId, trilhaId);
    const trilhaNome = this._getTrailName(trilhaId);

    // Tenta obter total de waypoints da trilha
    let totalWaypoints = 0;
    try {
      const ss = getSpreadsheet();
      const sheetNames = ['GPS_POINTS', 'WAYPOINTS', 'PONTOS_INTERESSE_RA'];
      
      for (const sheetName of sheetNames) {
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) continue;
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const trilhaCol = headers.findIndex(h => 
          h.toLowerCase().includes('trilha_id') || h.toLowerCase().includes('trail_id')
        );
        
        if (trilhaCol !== -1) {
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][trilhaCol]) === String(trilhaId)) {
              totalWaypoints++;
            }
          }
        }
      }
    } catch (e) {
      totalWaypoints = waypointsReivindicados; // Fallback
    }

    const percentual = totalWaypoints > 0 
      ? Math.round((waypointsReivindicados / totalWaypoints) * 100)
      : 0;

    const completa = totalWaypoints > 0 && waypointsReivindicados >= totalWaypoints;

    return {
      success: true,
      trilha: {
        id: trilhaId,
        nome: trilhaNome
      },
      progresso: {
        waypoints_reivindicados: waypointsReivindicados,
        total_waypoints: totalWaypoints,
        percentual: percentual,
        completa: completa
      },
      status: completa ? '✅ Completa!' : `${percentual}% explorada`
    };

  } catch (error) {
    Logger.log(`[getTrailProgress] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém leaderboard de exploradores
 * @param {string} tipo - 'trilhas' ou 'waypoints'
 * @param {number} limite - Número de posições
 * @returns {Array} Ranking
 */
GamificationEngine.getExplorerLeaderboard = function(tipo = 'trilhas', limite = 10) {
  try {
    const sheet = this._ensureExplorationSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: true, ranking: [], total: 0 };
    }

    // Agrupa por usuário
    const userStats = {};
    
    for (let i = 1; i < data.length; i++) {
      const usrId = data[i][1];
      const trilhaId = data[i][4];
      
      if (!userStats[usrId]) {
        userStats[usrId] = {
          user_id: usrId,
          trilhas: new Set(),
          waypoints: 0
        };
      }
      
      userStats[usrId].trilhas.add(trilhaId);
      userStats[usrId].waypoints++;
    }

    // Converte para array e ordena
    let ranking = Object.values(userStats).map(u => ({
      user_id: u.user_id,
      trilhas: u.trilhas.size,
      waypoints: u.waypoints
    }));

    if (tipo === 'waypoints') {
      ranking.sort((a, b) => b.waypoints - a.waypoints);
    } else {
      ranking.sort((a, b) => b.trilhas - a.trilhas);
    }

    // Adiciona posição e nome
    ranking = ranking.slice(0, limite).map((r, idx) => {
      const user = this._getUserById(r.user_id);
      return {
        posicao: idx + 1,
        user_id: r.user_id,
        nome: user ? user.nome : 'Usuário',
        trilhas_visitadas: r.trilhas,
        waypoints_reivindicados: r.waypoints
      };
    });

    return {
      success: true,
      tipo: tipo,
      ranking: ranking,
      total: Object.keys(userStats).length
    };

  } catch (error) {
    Logger.log(`[getExplorerLeaderboard] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém catálogo de badges de exploração
 * @returns {object} Badges de exploração
 */
GamificationEngine.getExplorerBadgesCatalog = function() {
  return {
    success: true,
    badges: Object.values(EXPLORER_BADGES),
    total: Object.keys(EXPLORER_BADGES).length
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Gamified Exploration (Prompt 33/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Reivindica waypoint via QR code
 * @param {string} userId - ID do usuário
 * @param {string} poiId - ID do POI (escaneado do QR)
 * @param {object} coords - Coordenadas opcionais { latitude, longitude }
 * @returns {object} Resultado com pontos e badges desbloqueados
 */
function apiExploracaoClaimWaypoint(userId, poiId, coords) {
  return GamificationEngine.claimWaypoint(userId, poiId, coords || {});
}

/**
 * API: Obtém progresso de exploração do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Progresso com trilhas, waypoints e badges
 */
function apiExploracaoGetProgress(userId) {
  return GamificationEngine.getExplorationProgress(userId);
}

/**
 * API: Obtém progresso em uma trilha específica
 * @param {string} userId - ID do usuário
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Progresso na trilha com percentual
 */
function apiExploracaoGetTrailProgress(userId, trilhaId) {
  return GamificationEngine.getTrailProgress(userId, trilhaId);
}

/**
 * API: Obtém catálogo de badges de exploração
 * @returns {object} Lista de badges disponíveis
 */
function apiExploracaoGetExplorerBadges() {
  return GamificationEngine.getExplorerBadgesCatalog();
}

/**
 * API: Obtém leaderboard de exploradores
 * @param {string} tipo - 'trilhas' ou 'waypoints'
 * @param {number} limite - Número de posições (default: 10)
 * @returns {object} Ranking de exploradores
 */
function apiExploracaoGetLeaderboard(tipo, limite) {
  return GamificationEngine.getExplorerLeaderboard(tipo || 'trilhas', limite || 10);
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 37/30 (24/30): COMPARTILHAMENTO SOCIAL E PASSAPORTE DIGITAL
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Web Share API (W3C)
// - Social Media Marketing for Conservation

/**
 * Templates de passaporte digital
 */
const PASSPORT_TEMPLATES = {
  STANDARD: {
    id: 'STANDARD',
    nome: 'Passaporte Padrão',
    cor_fundo: '#1B5E20',
    cor_texto: '#FFFFFF',
    dimensoes: { width: 1200, height: 630 }
  },
  EXPLORER: {
    id: 'EXPLORER',
    nome: 'Passaporte Explorador',
    cor_fundo: '#0D47A1',
    cor_texto: '#FFFFFF',
    dimensoes: { width: 1200, height: 630 }
  },
  GUARDIAN: {
    id: 'GUARDIAN',
    nome: 'Passaporte Guardião',
    cor_fundo: '#4A148C',
    cor_texto: '#FFFFFF',
    dimensoes: { width: 1200, height: 630 }
  }
};

/**
 * Plataformas de compartilhamento suportadas
 */
const SHARE_PLATFORMS = {
  WHATSAPP: { id: 'WHATSAPP', nome: 'WhatsApp', icone: '📱', alcance_medio: 50 },
  INSTAGRAM: { id: 'INSTAGRAM', nome: 'Instagram', icone: '📸', alcance_medio: 200 },
  FACEBOOK: { id: 'FACEBOOK', nome: 'Facebook', icone: '👥', alcance_medio: 150 },
  TWITTER: { id: 'TWITTER', nome: 'Twitter/X', icone: '🐦', alcance_medio: 100 },
  LINKEDIN: { id: 'LINKEDIN', nome: 'LinkedIn', icone: '💼', alcance_medio: 80 },
  DOWNLOAD: { id: 'DOWNLOAD', nome: 'Download', icone: '⬇️', alcance_medio: 10 },
  NATIVE: { id: 'NATIVE', nome: 'Compartilhar', icone: '🔗', alcance_medio: 30 }
};

// Adiciona ao GamificationEngine
GamificationEngine.PASSPORT_TEMPLATES = PASSPORT_TEMPLATES;
GamificationEngine.SHARE_PLATFORMS = SHARE_PLATFORMS;

/**
 * Gera passaporte digital com estatísticas da visita
 * @param {string} userId - ID do usuário
 * @param {string} templateId - Template do passaporte (opcional)
 * @returns {object} Passaporte digital gerado
 */
GamificationEngine.generateDigitalPassport = function(userId, templateId = 'STANDARD') {
  try {
    // Obtém dados do usuário
    const user = this._getUserData(userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    const template = this.PASSPORT_TEMPLATES[templateId] || this.PASSPORT_TEMPLATES.STANDARD;
    const passaporteId = `PASS_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Coleta estatísticas de diferentes serviços
    const stats = this._collectPassportStats(userId, user);
    
    // Obtém badges conquistados
    const badges = JSON.parse(user.badges || '[]');
    const conquistas = badges.slice(0, 5).map(b => {
      const badgeInfo = this.BADGES[b] || { nome: b, icone: '🏅' };
      return { id: b, nome: badgeInfo.nome, icone: badgeInfo.icone };
    });
    
    // Gera URL de verificação
    const verificationUrl = `https://reservaararas.org/passaporte/${passaporteId}`;
    const qrCodeData = `RESERVA_ARARAS:${passaporteId}:${userId}`;
    
    // Monta passaporte
    const passaporte = {
      id: passaporteId,
      template: template.id,
      usuario: {
        id: userId,
        nome: user.nome || 'Visitante',
        nivel: user.nivel || 1,
        titulo: user.titulo || 'Guardião Iniciante'
      },
      visita: {
        data: new Date().toISOString(),
        data_formatada: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', month: 'long', year: 'numeric' 
        })
      },
      estatisticas: stats,
      conquistas: conquistas,
      total_badges: badges.length,
      qr_code_data: qrCodeData,
      verification_url: verificationUrl,
      share_text: this._generateShareText(user, stats),
      design: {
        cor_fundo: template.cor_fundo,
        cor_texto: template.cor_texto,
        dimensoes: template.dimensoes
      }
    };
    
    // Salva passaporte gerado
    this._savePassport(passaporte);
    
    return {
      success: true,
      passaporte: passaporte,
      share_options: Object.values(this.SHARE_PLATFORMS)
    };
  } catch (error) {
    Logger.log(`[generateDigitalPassport] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Coleta estatísticas para o passaporte
 * @private
 */
GamificationEngine._collectPassportStats = function(userId, user) {
  const stats = {
    trilhas_percorridas: 0,
    distancia_km: 0,
    especies_avistadas: 0,
    fotos_registradas: 0,
    pontos_totais: user.pontos || 0,
    horas_natureza: 0,
    arvores_plantadas: user.mudas_plantadas || 0,
    co2_compensado_kg: user.co2_sequestrado || 0
  };
  
  try {
    // Tenta obter dados de exploração
    const ss = getSpreadsheet();
    
    // Exploração de trilhas
    const exploSheet = ss.getSheetByName('EXPLORACOES_RA');
    if (exploSheet && exploSheet.getLastRow() > 1) {
      const exploData = exploSheet.getDataRange().getValues();
      const userExplo = exploData.filter(row => row[1] === userId);
      
      const trilhasVisitadas = new Set();
      userExplo.forEach(row => {
        if (row[3]) trilhasVisitadas.add(row[3]); // Trilha_ID
      });
      stats.trilhas_percorridas = trilhasVisitadas.size;
    }
    
    // Avistamentos de biodiversidade
    const avistSheet = ss.getSheetByName('AVISTAMENTOS_CIDADAO_RA');
    if (avistSheet && avistSheet.getLastRow() > 1) {
      const avistData = avistSheet.getDataRange().getValues();
      const userAvist = avistData.filter(row => row[1] === userId);
      stats.especies_avistadas = userAvist.length;
      stats.fotos_registradas = userAvist.filter(row => row[8]).length; // Foto_URL
    }
    
    // Calcula tempo estimado na natureza (baseado em atividades)
    stats.horas_natureza = Math.round((stats.trilhas_percorridas * 2 + stats.especies_avistadas * 0.5) * 10) / 10;
    
    // Estima distância (média de 3km por trilha)
    stats.distancia_km = stats.trilhas_percorridas * 3;
    
  } catch (error) {
    Logger.log(`[_collectPassportStats] Erro ao coletar stats: ${error}`);
  }
  
  return stats;
};

/**
 * Gera texto para compartilhamento
 * @private
 */
GamificationEngine._generateShareText = function(user, stats) {
  const nome = user.nome || 'Eu';
  const titulo = user.titulo || 'Guardião';
  
  let texto = `🌿 ${nome} visitou a Reserva Araras!\n\n`;
  texto += `🏆 Título: ${titulo}\n`;
  
  if (stats.trilhas_percorridas > 0) {
    texto += `🥾 ${stats.trilhas_percorridas} trilha${stats.trilhas_percorridas > 1 ? 's' : ''} percorrida${stats.trilhas_percorridas > 1 ? 's' : ''}\n`;
  }
  if (stats.especies_avistadas > 0) {
    texto += `🦜 ${stats.especies_avistadas} espécie${stats.especies_avistadas > 1 ? 's' : ''} avistada${stats.especies_avistadas > 1 ? 's' : ''}\n`;
  }
  if (stats.pontos_totais > 0) {
    texto += `⭐ ${stats.pontos_totais} pontos conquistados\n`;
  }
  
  texto += `\n🌳 Venha conhecer o Cerrado!\n`;
  texto += `#ReservaAraras #Cerrado #Ecoturismo #Conservação`;
  
  return texto;
};

/**
 * Salva passaporte gerado
 * @private
 */
GamificationEngine._savePassport = function(passaporte) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('PASSAPORTES_RA');
    
    if (!sheet) {
      sheet = ss.insertSheet('PASSAPORTES_RA');
      const headers = ['Passaporte_ID', 'User_ID', 'Data_Geracao', 'Template', 'Stats_JSON', 'Conquistas_JSON', 'Share_Count'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#FF9800').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow([
      passaporte.id,
      passaporte.usuario.id,
      new Date(),
      passaporte.template,
      JSON.stringify(passaporte.estatisticas),
      JSON.stringify(passaporte.conquistas),
      0
    ]);
  } catch (error) {
    Logger.log(`[_savePassport] Erro: ${error}`);
  }
};

/**
 * Obtém estatísticas de passaportes do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Estatísticas de passaportes
 */
GamificationEngine.getPassportStats = function(userId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('PASSAPORTES_RA');
    
    const stats = {
      total_passaportes: 0,
      total_compartilhamentos: 0,
      alcance_estimado: 0,
      ultimo_passaporte: null,
      plataformas_usadas: {}
    };
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, userId, stats };
    }
    
    const data = sheet.getDataRange().getValues();
    const userPassports = data.slice(1).filter(row => row[1] === userId);
    
    stats.total_passaportes = userPassports.length;
    stats.total_compartilhamentos = userPassports.reduce((sum, row) => sum + (row[6] || 0), 0);
    
    if (userPassports.length > 0) {
      const ultimo = userPassports[userPassports.length - 1];
      stats.ultimo_passaporte = {
        id: ultimo[0],
        data: ultimo[2],
        template: ultimo[3]
      };
    }
    
    // Obtém histórico de compartilhamentos
    const shareSheet = ss.getSheetByName('COMPARTILHAMENTOS_RA');
    if (shareSheet && shareSheet.getLastRow() > 1) {
      const shareData = shareSheet.getDataRange().getValues();
      const userShares = shareData.slice(1).filter(row => row[1] === userId);
      
      userShares.forEach(row => {
        const plataforma = row[3];
        stats.plataformas_usadas[plataforma] = (stats.plataformas_usadas[plataforma] || 0) + 1;
        stats.alcance_estimado += row[5] || 0;
      });
    }
    
    return { success: true, userId, stats };
  } catch (error) {
    Logger.log(`[getPassportStats] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Registra compartilhamento de passaporte
 * @param {string} userId - ID do usuário
 * @param {string} passaporteId - ID do passaporte
 * @param {string} plataforma - Plataforma de compartilhamento
 * @returns {object} Resultado do registro
 */
GamificationEngine.logShare = function(userId, passaporteId, plataforma) {
  try {
    const platform = this.SHARE_PLATFORMS[plataforma] || this.SHARE_PLATFORMS.NATIVE;
    const shareId = `SHARE_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName('COMPARTILHAMENTOS_RA');
    
    if (!sheet) {
      sheet = ss.insertSheet('COMPARTILHAMENTOS_RA');
      const headers = ['Share_ID', 'User_ID', 'Passaporte_ID', 'Plataforma', 'Data_Share', 'Alcance_Estimado'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#E91E63').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow([
      shareId,
      userId,
      passaporteId,
      platform.id,
      new Date(),
      platform.alcance_medio
    ]);
    
    // Atualiza contador no passaporte
    this._incrementPassportShareCount(passaporteId);
    
    // Recompensa por compartilhamento
    this.registerAction(userId, 'compartilhamento', { plataforma: platform.id });
    
    return {
      success: true,
      share_id: shareId,
      plataforma: platform,
      pontos_ganhos: 5,
      mensagem: `Obrigado por compartilhar! 🌿 Alcance estimado: ${platform.alcance_medio} pessoas`
    };
  } catch (error) {
    Logger.log(`[logShare] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Incrementa contador de compartilhamentos do passaporte
 * @private
 */
GamificationEngine._incrementPassportShareCount = function(passaporteId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('PASSAPORTES_RA');
    if (!sheet || sheet.getLastRow() < 2) return;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === passaporteId) {
        const currentCount = data[i][6] || 0;
        sheet.getRange(i + 1, 7).setValue(currentCount + 1);
        break;
      }
    }
  } catch (error) {
    Logger.log(`[_incrementPassportShareCount] Erro: ${error}`);
  }
};

/**
 * Obtém histórico de compartilhamentos do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limite - Número máximo de registros
 * @returns {object} Histórico de compartilhamentos
 */
GamificationEngine.getShareHistory = function(userId, limite = 20) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('COMPARTILHAMENTOS_RA');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, userId, historico: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const userShares = data.slice(1)
      .filter(row => row[1] === userId)
      .map(row => ({
        share_id: row[0],
        passaporte_id: row[2],
        plataforma: this.SHARE_PLATFORMS[row[3]] || { id: row[3], nome: row[3], icone: '🔗' },
        data: row[4],
        alcance_estimado: row[5]
      }))
      .reverse()
      .slice(0, limite);
    
    const totalAlcance = userShares.reduce((sum, s) => sum + (s.alcance_estimado || 0), 0);
    
    return {
      success: true,
      userId,
      historico: userShares,
      total: userShares.length,
      alcance_total: totalAlcance
    };
  } catch (error) {
    Logger.log(`[getShareHistory] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Social Sharing & Digital Passport (Prompt 37/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Gera passaporte digital
 * @param {string} userId - ID do usuário
 * @param {string} templateId - Template opcional
 * @returns {object} Passaporte gerado
 */
function apiPassaporteGenerate(userId, templateId) {
  return GamificationEngine.generateDigitalPassport(userId, templateId);
}

/**
 * API: Obtém estatísticas de passaportes do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Estatísticas
 */
function apiPassaporteGetStats(userId) {
  return GamificationEngine.getPassportStats(userId);
}

/**
 * API: Registra compartilhamento
 * @param {string} userId - ID do usuário
 * @param {string} passaporteId - ID do passaporte
 * @param {string} plataforma - Plataforma de compartilhamento
 * @returns {object} Resultado
 */
function apiPassaporteLogShare(userId, passaporteId, plataforma) {
  return GamificationEngine.logShare(userId, passaporteId, plataforma);
}

/**
 * API: Obtém histórico de compartilhamentos
 * @param {string} userId - ID do usuário
 * @param {number} limite - Limite de registros
 * @returns {object} Histórico
 */
function apiPassaporteGetShareHistory(userId, limite) {
  return GamificationEngine.getShareHistory(userId, limite || 20);
}

/**
 * API: Lista templates de passaporte disponíveis
 * @returns {object} Templates
 */
function apiPassaporteGetTemplates() {
  return {
    success: true,
    templates: Object.values(PASSPORT_TEMPLATES)
  };
}

/**
 * API: Lista plataformas de compartilhamento
 * @returns {object} Plataformas
 */
function apiPassaporteGetPlatforms() {
  return {
    success: true,
    platforms: Object.values(SHARE_PLATFORMS)
  };
}
