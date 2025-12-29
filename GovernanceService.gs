/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE GOVERNANÇA E VOTAÇÃO COMUNITÁRIA
 * ═══════════════════════════════════════════════════════════════════════════
 * Prompt 15/30 - Votação Comunitária e Feedback de Iniciativas
 * 
 * Funcionalidades:
 * - Criação de votações de governança
 * - Cálculo de poder de voto ponderado por doações
 * - Registro seguro de votos
 * - Apuração de resultados
 * - Integração com RoadmapService
 * 
 * @version 1.0.0
 * @date 2025-12-27
 */

const VOTACOES_HEADERS = [
  'ID_Votacao', 'Titulo', 'Descricao', 'Tipo', 'Opcoes_JSON', 'Data_Inicio',
  'Data_Fim', 'Status', 'Criado_Por', 'Criado_Em', 'Roadmap_IDs', 'Resultado_JSON'
];

const VOTOS_HEADERS = [
  'ID_Voto', 'ID_Votacao', 'Votante_Email', 'Opcao_Escolhida', 'Peso_Voto',
  'Data_Voto', 'Hash_Verificacao', 'Total_Doacoes_BRL'
];

/**
 * Sistema de Governança
 * @namespace GovernanceService
 */
const GovernanceService = {
  
  SHEET_VOTACOES: 'VOTACOES_RA',
  SHEET_VOTOS: 'VOTOS_RA',
  
  /**
   * Configuração de poder de voto
   */
  VOTING_POWER: {
    MIN_POWER: 1,           // Voto mínimo para qualquer apoiador
    MAX_POWER: 100,         // Limite máximo de poder de voto
    BASE_DONATION: 100,     // Doação base (R$) para cálculo
    FORMULA: 'SQRT',        // SQRT = raiz quadrada, LINEAR = proporcional
    DECAY_YEARS: 3          // Anos para considerar doações recentes
  },
  
  /**
   * Tipos de votação
   */
  POLL_TYPES: {
    PRIORITY: { id: 'PRIORITY', nome: 'Priorização de iniciativas', descricao: 'Escolha qual iniciativa deve ter prioridade' },
    APPROVAL: { id: 'APPROVAL', nome: 'Aprovação/Rejeição', descricao: 'Vote Sim ou Não para uma proposta' },
    MULTIPLE: { id: 'MULTIPLE', nome: 'Múltipla escolha', descricao: 'Escolha uma entre várias opções' }
  },

  /**
   * Status de votação
   */
  POLL_STATUS: {
    DRAFT: { id: 'DRAFT', nome: 'Rascunho', cor: '#9E9E9E' },
    ACTIVE: { id: 'ACTIVE', nome: 'Ativa', cor: '#4CAF50' },
    CLOSED: { id: 'CLOSED', nome: 'Encerrada', cor: '#2196F3' },
    CANCELLED: { id: 'CANCELLED', nome: 'Cancelada', cor: '#F44336' }
  },

  /**
   * Papéis permitidos para votar
   */
  ALLOWED_VOTERS: ['Admin', 'Gestor', 'Apoiador', 'Ambientalista'],
  
  /**
   * Papéis permitidos para criar votações
   */
  ALLOWED_CREATORS: ['Admin', 'Gestor'],

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de votações
      let sheetVotacoes = ss.getSheetByName(this.SHEET_VOTACOES);
      if (!sheetVotacoes) {
        sheetVotacoes = ss.insertSheet(this.SHEET_VOTACOES);
        sheetVotacoes.appendRow(VOTACOES_HEADERS);
        const headerRange = sheetVotacoes.getRange(1, 1, 1, VOTACOES_HEADERS.length);
        headerRange.setBackground('#6A1B9A').setFontColor('#FFFFFF').setFontWeight('bold');
        sheetVotacoes.setFrozenRows(1);
      }
      
      // Planilha de votos
      let sheetVotos = ss.getSheetByName(this.SHEET_VOTOS);
      if (!sheetVotos) {
        sheetVotos = ss.insertSheet(this.SHEET_VOTOS);
        sheetVotos.appendRow(VOTOS_HEADERS);
        const headerRange = sheetVotos.getRange(1, 1, 1, VOTOS_HEADERS.length);
        headerRange.setBackground('#7B1FA2').setFontColor('#FFFFFF').setFontWeight('bold');
        sheetVotos.setFrozenRows(1);
      }
      
      return { success: true, sheets: [this.SHEET_VOTACOES, this.SHEET_VOTOS] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula poder de voto baseado em doações
   * @private
   */
  _calculateVotingPower: function(userEmail) {
    try {
      let totalDonated = 0;
      
      // Tenta obter histórico de doações
      if (typeof DonationService !== 'undefined' && DonationService.getDonorHistory) {
        const history = DonationService.getDonorHistory(userEmail);
        if (history.success && history.resumo) {
          totalDonated = history.resumo.valor_total || 0;
        }
      }
      
      // Calcula poder de voto
      let power = this.VOTING_POWER.MIN_POWER;
      
      if (totalDonated > 0) {
        if (this.VOTING_POWER.FORMULA === 'SQRT') {
          // Raiz quadrada: crescimento mais lento, mais democrático
          power = Math.sqrt(totalDonated / this.VOTING_POWER.BASE_DONATION);
        } else {
          // Linear: proporcional direto
          power = totalDonated / this.VOTING_POWER.BASE_DONATION;
        }
      }
      
      // Aplica limites
      power = Math.max(this.VOTING_POWER.MIN_POWER, power);
      power = Math.min(this.VOTING_POWER.MAX_POWER, power);
      power = Math.round(power * 100) / 100;
      
      return {
        success: true,
        email: userEmail,
        poder_voto: power,
        total_doado_brl: totalDonated,
        formula: this.VOTING_POWER.FORMULA,
        explicacao: this._explainVotingPower(power, totalDonated)
      };
    } catch (error) {
      Logger.log(`[_calculateVotingPower] Erro: ${error}`);
      return { success: false, error: error.message, poder_voto: 1 };
    }
  },

  /**
   * Explica o cálculo do poder de voto
   * @private
   */
  _explainVotingPower: function(power, totalDonated) {
    if (totalDonated === 0) {
      return 'Você tem o voto mínimo de 1. Faça uma doação para aumentar seu poder de voto!';
    }
    return `Com R$ ${totalDonated.toFixed(2)} em doações, seu poder de voto é ${power} (fórmula: √(doações/100))`;
  },

  /**
   * Verifica se usuário pode votar
   * @private
   */
  _checkVoterPermission: function(userEmail) {
    try {
      let userRole = 'Visitante';
      
      if (typeof RBAC !== 'undefined' && RBAC._getUserByEmail) {
        const user = RBAC._getUserByEmail(userEmail);
        userRole = user?.role || 'Visitante';
      }
      
      const canVote = this.ALLOWED_VOTERS.includes(userRole);
      
      return {
        allowed: canVote,
        role: userRole,
        message: canVote ? 'Autorizado a votar' : `Papel '${userRole}' não pode votar. Papéis permitidos: ${this.ALLOWED_VOTERS.join(', ')}`
      };
    } catch (error) {
      return { allowed: false, role: 'Erro', error: error.message };
    }
  },

  /**
   * Verifica se usuário pode criar votações
   * @private
   */
  _checkCreatorPermission: function(userEmail) {
    try {
      let userRole = 'Visitante';
      
      if (typeof RBAC !== 'undefined' && RBAC._getUserByEmail) {
        const user = RBAC._getUserByEmail(userEmail);
        userRole = user?.role || 'Visitante';
      }
      
      const canCreate = this.ALLOWED_CREATORS.includes(userRole);
      
      return {
        allowed: canCreate,
        role: userRole,
        message: canCreate ? 'Autorizado a criar votações' : `Papel '${userRole}' não pode criar votações`
      };
    } catch (error) {
      return { allowed: false, role: 'Erro', error: error.message };
    }
  },

  /**
   * Gera hash de verificação do voto
   * @private
   */
  _generateVoteHash: function(voteData) {
    try {
      const dataString = JSON.stringify({
        votacao: voteData.pollId,
        votante: voteData.email,
        opcao: voteData.option,
        peso: voteData.weight,
        timestamp: voteData.timestamp
      });
      
      const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, dataString);
      return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').toUpperCase().substring(0, 16);
    } catch (error) {
      return Date.now().toString(36).toUpperCase();
    }
  },

  /**
   * Cria uma nova votação
   */
  createPoll: function(pollData, creatorEmail) {
    try {
      this.initializeSheets();
      
      const email = creatorEmail || Session.getActiveUser().getEmail();
      
      // Verifica permissão
      const permission = this._checkCreatorPermission(email);
      if (!permission.allowed) {
        return { success: false, error: permission.message };
      }
      
      // Valida dados obrigatórios
      if (!pollData.titulo || !pollData.opcoes || pollData.opcoes.length < 2) {
        return { success: false, error: 'Título e pelo menos 2 opções são obrigatórios' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTACOES);
      
      const pollId = `VOT-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      
      // Datas padrão: início hoje, fim em 30 dias
      const dataInicio = pollData.data_inicio || now.toISOString().split('T')[0];
      const dataFim = pollData.data_fim || new Date(now.getTime() + 30*24*60*60*1000).toISOString().split('T')[0];
      
      const row = [
        pollId,
        pollData.titulo,
        pollData.descricao || '',
        pollData.tipo || 'PRIORITY',
        JSON.stringify(pollData.opcoes),
        dataInicio,
        dataFim,
        'ACTIVE',
        email,
        now.toISOString(),
        pollData.roadmap_ids ? JSON.stringify(pollData.roadmap_ids) : '',
        ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        poll_id: pollId,
        titulo: pollData.titulo,
        opcoes: pollData.opcoes,
        periodo: { inicio: dataInicio, fim: dataFim },
        status: 'ACTIVE',
        message: 'Votação criada com sucesso!'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém detalhes de uma votação
   */
  getPoll: function(pollId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTACOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Votação não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === pollId) {
          const now = new Date();
          const dataFim = new Date(data[i][6]);
          const isActive = data[i][7] === 'ACTIVE' && now <= dataFim;
          
          return {
            success: true,
            poll: {
              id: data[i][0],
              titulo: data[i][1],
              descricao: data[i][2],
              tipo: data[i][3],
              tipo_info: this.POLL_TYPES[data[i][3]] || {},
              opcoes: JSON.parse(data[i][4] || '[]'),
              data_inicio: data[i][5],
              data_fim: data[i][6],
              status: data[i][7],
              status_info: this.POLL_STATUS[data[i][7]] || {},
              is_active: isActive,
              criado_por: data[i][8],
              criado_em: data[i][9],
              roadmap_ids: data[i][10] ? JSON.parse(data[i][10]) : [],
              resultado: data[i][11] ? JSON.parse(data[i][11]) : null
            }
          };
        }
      }
      
      return { success: false, error: 'Votação não encontrada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista votações
   */
  listPolls: function(status = null) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTACOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, polls: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const polls = [];
      const now = new Date();
      
      for (let i = 1; i < data.length; i++) {
        const pollStatus = data[i][7];
        
        if (status && pollStatus !== status) continue;
        
        const dataFim = new Date(data[i][6]);
        const isActive = pollStatus === 'ACTIVE' && now <= dataFim;
        
        polls.push({
          id: data[i][0],
          titulo: data[i][1],
          tipo: data[i][3],
          data_inicio: data[i][5],
          data_fim: data[i][6],
          status: pollStatus,
          is_active: isActive,
          criado_por: data[i][8]
        });
      }
      
      return { success: true, polls: polls, count: polls.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Verifica se usuário já votou
   * @private
   */
  _hasVoted: function(pollId, userEmail) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTOS);
      
      if (!sheet || sheet.getLastRow() < 2) return false;
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === pollId && data[i][2] === userEmail) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Registra um voto
   */
  castVote: function(pollId, optionId, userEmail) {
    try {
      this.initializeSheets();
      
      const email = userEmail || Session.getActiveUser().getEmail();
      
      // 1. Verifica permissão para votar
      const permission = this._checkVoterPermission(email);
      if (!permission.allowed) {
        return { success: false, error: permission.message };
      }
      
      // 2. Verifica se votação existe e está ativa
      const pollResult = this.getPoll(pollId);
      if (!pollResult.success) {
        return { success: false, error: 'Votação não encontrada' };
      }
      
      if (!pollResult.poll.is_active) {
        return { success: false, error: 'Esta votação não está mais ativa' };
      }
      
      // 3. Verifica se opção é válida
      const opcoes = pollResult.poll.opcoes;
      const opcaoValida = opcoes.find(o => o.id === optionId || o === optionId);
      if (!opcaoValida) {
        return { success: false, error: 'Opção de voto inválida' };
      }
      
      // 4. Verifica se já votou
      if (this._hasVoted(pollId, email)) {
        return { success: false, error: 'Você já votou nesta votação' };
      }
      
      // 5. Calcula poder de voto
      const votingPower = this._calculateVotingPower(email);
      const peso = votingPower.poder_voto || 1;
      
      // 6. Gera hash de verificação
      const timestamp = Date.now();
      const hash = this._generateVoteHash({
        pollId: pollId,
        email: email,
        option: optionId,
        weight: peso,
        timestamp: timestamp
      });
      
      // 7. Registra voto
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTOS);
      
      const voteId = `V-${timestamp.toString(36).toUpperCase()}`;
      
      sheet.appendRow([
        voteId,
        pollId,
        email,
        optionId,
        peso,
        new Date().toISOString(),
        hash,
        votingPower.total_doado_brl || 0
      ]);
      
      return {
        success: true,
        vote_id: voteId,
        poll_id: pollId,
        opcao_votada: typeof opcaoValida === 'object' ? opcaoValida.titulo : opcaoValida,
        peso_voto: peso,
        hash_verificacao: hash,
        message: `Voto registrado com sucesso! Seu voto tem peso ${peso}.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém resultados de uma votação
   */
  getResults: function(pollId) {
    try {
      // Obtém dados da votação
      const pollResult = this.getPoll(pollId);
      if (!pollResult.success) {
        return { success: false, error: 'Votação não encontrada' };
      }
      
      const poll = pollResult.poll;
      const opcoes = poll.opcoes;
      
      // Obtém votos
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTOS);
      
      // Inicializa contagem
      const resultados = {};
      opcoes.forEach(o => {
        const id = typeof o === 'object' ? o.id : o;
        const titulo = typeof o === 'object' ? o.titulo : o;
        resultados[id] = {
          id: id,
          titulo: titulo,
          votos_count: 0,
          votos_ponderados: 0,
          votantes: []
        };
      });
      
      let totalVotos = 0;
      let totalPonderado = 0;
      const votantes = new Set();
      
      if (sheet && sheet.getLastRow() >= 2) {
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
          if (data[i][1] === pollId) {
            const opcaoId = data[i][3];
            const peso = data[i][4] || 1;
            const votante = data[i][2];
            
            if (resultados[opcaoId]) {
              resultados[opcaoId].votos_count++;
              resultados[opcaoId].votos_ponderados += peso;
              resultados[opcaoId].votantes.push(votante.split('@')[0]); // Anonimiza parcialmente
            }
            
            totalVotos++;
            totalPonderado += peso;
            votantes.add(votante);
          }
        }
      }
      
      // Calcula percentuais e ordena
      const ranking = Object.values(resultados)
        .map(r => ({
          ...r,
          percentual: totalPonderado > 0 ? Math.round((r.votos_ponderados / totalPonderado) * 10000) / 100 : 0
        }))
        .sort((a, b) => b.votos_ponderados - a.votos_ponderados);
      
      // Determina vencedor
      const vencedor = ranking.length > 0 && ranking[0].votos_ponderados > 0 ? ranking[0] : null;
      
      return {
        success: true,
        poll_id: pollId,
        titulo: poll.titulo,
        status: poll.status,
        is_active: poll.is_active,
        periodo: {
          inicio: poll.data_inicio,
          fim: poll.data_fim
        },
        participacao: {
          total_votantes: votantes.size,
          total_votos: totalVotos,
          total_ponderado: Math.round(totalPonderado * 100) / 100
        },
        ranking: ranking,
        vencedor: vencedor ? {
          id: vencedor.id,
          titulo: vencedor.titulo,
          votos_ponderados: Math.round(vencedor.votos_ponderados * 100) / 100,
          percentual: vencedor.percentual
        } : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Encerra votação e atualiza Roadmap
   */
  closePollAndUpdateRoadmap: function(pollId, userEmail) {
    try {
      const email = userEmail || Session.getActiveUser().getEmail();
      
      // Verifica permissão
      const permission = this._checkCreatorPermission(email);
      if (!permission.allowed) {
        return { success: false, error: permission.message };
      }
      
      // Obtém resultados
      const results = this.getResults(pollId);
      if (!results.success) {
        return results;
      }
      
      // Atualiza status da votação
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_VOTACOES);
      const data = sheet.getDataRange().getValues();
      
      let rowIndex = -1;
      let roadmapIds = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === pollId) {
          rowIndex = i + 1;
          roadmapIds = data[i][10] ? JSON.parse(data[i][10]) : [];
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, error: 'Votação não encontrada' };
      }
      
      // Atualiza status e resultado
      sheet.getRange(rowIndex, 8).setValue('CLOSED');
      sheet.getRange(rowIndex, 12).setValue(JSON.stringify(results));
      
      // Atualiza prioridades no Roadmap se houver IDs vinculados
      let roadmapUpdated = false;
      if (roadmapIds.length > 0 && results.vencedor && typeof Roadmap !== 'undefined') {
        // Encontra o ID do Roadmap correspondente à opção vencedora
        const vencedorId = results.vencedor.id;
        
        // Atualiza prioridade para CRITICA
        if (Roadmap.updateInitiative) {
          Roadmap.updateInitiative(vencedorId, { prioridade: 'CRITICA' });
          roadmapUpdated = true;
        }
      }
      
      return {
        success: true,
        poll_id: pollId,
        status: 'CLOSED',
        vencedor: results.vencedor,
        roadmap_atualizado: roadmapUpdated,
        message: 'Votação encerrada com sucesso!'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém poder de voto do usuário atual
   */
  getMyVotingPower: function(userEmail) {
    const email = userEmail || Session.getActiveUser().getEmail();
    return this._calculateVotingPower(email);
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Governança e Votação
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de governança
 */
function apiGovernanceInit() {
  return GovernanceService.initializeSheets();
}

/**
 * Cria uma nova votação (GESTOR+)
 * @param {object} pollData - { titulo, descricao, tipo, opcoes: [{id, titulo}], data_inicio, data_fim, roadmap_ids }
 */
function apiGovernanceCreatePoll(pollData) {
  return GovernanceService.createPoll(pollData, Session.getActiveUser().getEmail());
}

/**
 * Obtém detalhes de uma votação
 */
function apiGovernanceGetPoll(pollId) {
  return GovernanceService.getPoll(pollId);
}

/**
 * Lista votações
 * @param {string} status - Filtro opcional: DRAFT, ACTIVE, CLOSED, CANCELLED
 */
function apiGovernanceListPolls(status) {
  return GovernanceService.listPolls(status || null);
}

/**
 * Registra um voto (APOIADOR+)
 * @param {string} pollId - ID da votação
 * @param {string} optionId - ID da opção escolhida
 */
function apiGovernanceVote(pollId, optionId) {
  return GovernanceService.castVote(pollId, optionId, Session.getActiveUser().getEmail());
}

/**
 * Obtém resultados de uma votação
 */
function apiGovernanceResults(pollId) {
  return GovernanceService.getResults(pollId);
}

/**
 * Calcula poder de voto do usuário atual
 */
function apiGovernanceMyVotingPower() {
  return GovernanceService.getMyVotingPower(Session.getActiveUser().getEmail());
}

/**
 * Encerra votação e atualiza Roadmap (GESTOR+)
 */
function apiGovernanceClosePoll(pollId) {
  return GovernanceService.closePollAndUpdateRoadmap(pollId, Session.getActiveUser().getEmail());
}

/**
 * Obtém tipos de votação disponíveis
 */
function apiGovernanceGetPollTypes() {
  return {
    success: true,
    tipos: Object.values(GovernanceService.POLL_TYPES)
  };
}

/**
 * Obtém configuração de poder de voto
 */
function apiGovernanceGetVotingConfig() {
  return {
    success: true,
    config: GovernanceService.VOTING_POWER,
    explicacao: 'Poder de voto = √(total_doações / 100), mínimo 1, máximo 100'
  };
}
