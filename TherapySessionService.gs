/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THERAPY SESSION SERVICE - Gestão de Sessões Terapêuticas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Implementa a estrutura SESSOES_TERAPIA conforme seção 5.1 do documento.
 * Gerencia sessões de Shinrin-yoku, Mindfulness, Rodas de Conversa e Hidroterapia.
 * 
 * Funcionalidades:
 * - Registro de sessões com pseudonimização (LGPD)
 * - Tracking de humor inicial/final (escala 1-10)
 * - Registro de protocolos utilizados
 * - Análise de eficácia das intervenções
 * - Relatórios para o Executivo (DashboardBot)
 * 
 * Segurança (RBAC):
 * - Dados sensíveis pseudonimizados
 * - Tabela VAULT separada para correspondência ID <-> Nome
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Schema da planilha SESSOES_TERAPIA
 */
const THERAPY_SESSION_SCHEMA = {
  sheetName: 'SESSOES_TERAPIA',
  headers: [
    'Session_ID',
    'User_Hash',
    'Data_Inicio',
    'Data_Fim',
    'Duracao_Min',
    'Tipo_Sessao',
    'Protocolo_Usado',
    'Humor_Inicial',
    'Humor_Final',
    'Delta_Humor',
    'Localizacao',
    'Condicoes_Clima',
    'Feedback_Qualitativo',
    'Tags_Emocoes',
    'Completada',
    'Notas_Facilitador'
  ]
};

/**
 * Schema da planilha VAULT (dados sensíveis)
 */
const VAULT_SCHEMA = {
  sheetName: 'VAULT_USUARIOS',
  headers: ['User_Hash', 'Nome_Completo', 'Email', 'Data_Cadastro', 'Consentimento_LGPD']
};

/**
 * Tipos de sessão terapêutica
 */
const THERAPY_TYPES = {
  SHINRIN_YOKU: {
    id: 'SHINRIN_YOKU',
    nome: 'Banho de Floresta',
    duracaoMedia: 90,
    protocolos: ['Limiar', 'Radar_Sensorial', 'Espelho_Paisagem', 'Troca_Arvore', 'Fechamento']
  },
  MINDFULNESS: {
    id: 'MINDFULNESS',
    nome: 'Mindfulness na Natureza',
    duracaoMedia: 30,
    protocolos: ['Respiracao_4_7_8', 'Box_Breathing', 'Grounding_5_4_3_2_1', 'Body_Scan', 'Fox_Walking']
  },
  RODA_CONVERSA: {
    id: 'RODA_CONVERSA',
    nome: 'Roda de Conversa',
    duracaoMedia: 60,
    protocolos: ['Abertura', 'Bastao_Fala', 'Sintese', 'Fechamento']
  },
  HIDROTERAPIA: {
    id: 'HIDROTERAPIA',
    nome: 'Hidroterapia Natural',
    duracaoMedia: 45,
    protocolos: ['Imersao_Terapeutica', 'Crioterapia_Natural', 'Contemplacao_Aquatica']
  },
  LABORTERAPIA: {
    id: 'LABORTERAPIA',
    nome: 'Laborterapia/Manejo Consciente',
    duracaoMedia: 120,
    protocolos: ['Poda_Zen', 'Plantio_Meditativo', 'Colheita_Consciente']
  },
  CRISE: {
    id: 'CRISE',
    nome: 'Intervenção em Crise',
    duracaoMedia: 15,
    protocolos: ['Protocolo_Ansiedade', 'Protocolo_Dissociacao', 'Protocolo_Raiva', 'Grounding_Emergencia']
  }
};

/**
 * Tags de emoções para categorização
 */
const EMOTION_TAGS = [
  'ansiedade', 'estresse', 'tristeza', 'raiva', 'medo',
  'calma', 'paz', 'alegria', 'gratidao', 'conexao',
  'solidao', 'sobrecarga', 'luto', 'esperanca', 'curiosidade'
];

/**
 * Therapy Session Service
 * @namespace TherapySessionService
 */
const TherapySessionService = {

  /**
   * Inicializa planilhas necessárias
   */
  initializeSheets() {
    const ss = getSpreadsheet();
    const results = [];
    
    // SESSOES_TERAPIA
    let sessaoSheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
    if (!sessaoSheet) {
      sessaoSheet = ss.insertSheet(THERAPY_SESSION_SCHEMA.sheetName);
      sessaoSheet.appendRow(THERAPY_SESSION_SCHEMA.headers);
      this._formatHeader(sessaoSheet, THERAPY_SESSION_SCHEMA.headers.length, '#6A1B9A');
      results.push({ sheet: THERAPY_SESSION_SCHEMA.sheetName, created: true });
    } else {
      results.push({ sheet: THERAPY_SESSION_SCHEMA.sheetName, created: false });
    }
    
    // VAULT (dados sensíveis)
    let vaultSheet = ss.getSheetByName(VAULT_SCHEMA.sheetName);
    if (!vaultSheet) {
      vaultSheet = ss.insertSheet(VAULT_SCHEMA.sheetName);
      vaultSheet.appendRow(VAULT_SCHEMA.headers);
      this._formatHeader(vaultSheet, VAULT_SCHEMA.headers.length, '#B71C1C');
      // Protege a planilha VAULT
      const protection = vaultSheet.protect();
      protection.setDescription('Dados sensíveis - Acesso restrito');
      results.push({ sheet: VAULT_SCHEMA.sheetName, created: true, protected: true });
    } else {
      results.push({ sheet: VAULT_SCHEMA.sheetName, created: false });
    }
    
    return { success: true, results };
  },

  /**
   * Formata cabeçalho da planilha
   * @private
   */
  _formatHeader(sheet, numCols, color) {
    const headerRange = sheet.getRange(1, 1, 1, numCols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  /**
   * Gera hash pseudonimizado para usuário (LGPD)
   * @param {string} identificador - Email ou nome
   * @returns {string} Hash pseudonimizado
   */
  gerarUserHash(identificador) {
    const bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      identificador + '_RESERVA_ARARAS_SALT'
    );
    return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').substring(0, 16);
  },

  /**
   * Registra usuário no VAULT (com consentimento LGPD)
   * @param {string} nome - Nome completo
   * @param {string} email - Email
   * @returns {object} Resultado com userHash
   */
  registrarUsuario(nome, email) {
    try {
      const userHash = this.gerarUserHash(email);
      const ss = getSpreadsheet();
      let vaultSheet = ss.getSheetByName(VAULT_SCHEMA.sheetName);
      
      if (!vaultSheet) {
        this.initializeSheets();
        vaultSheet = ss.getSheetByName(VAULT_SCHEMA.sheetName);
      }
      
      // Verifica se já existe
      const data = vaultSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userHash) {
          return { success: true, userHash, existing: true };
        }
      }
      
      // Registra novo
      vaultSheet.appendRow([
        userHash,
        nome,
        email,
        new Date().toISOString(),
        'SIM' // Consentimento LGPD
      ]);
      
      return { success: true, userHash, existing: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Inicia uma nova sessão terapêutica
   * @param {object} params - Parâmetros da sessão
   * @returns {object} Sessão criada
   */
  iniciarSessao(params) {
    const {
      userHash,
      tipoSessao,
      protocolo,
      humorInicial,
      localizacao = '',
      condicoesClima = ''
    } = params;
    
    // Valida tipo de sessão
    if (!THERAPY_TYPES[tipoSessao]) {
      return {
        success: false,
        error: 'Tipo de sessão inválido',
        tiposDisponiveis: Object.keys(THERAPY_TYPES)
      };
    }
    
    // Valida humor (1-10)
    if (humorInicial < 1 || humorInicial > 10) {
      return { success: false, error: 'Humor deve ser entre 1 e 10' };
    }
    
    const sessionId = `THER_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const dataInicio = new Date().toISOString();
    
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
      
      if (!sheet) {
        this.initializeSheets();
        sheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
      }
      
      const row = [
        sessionId,
        userHash,
        dataInicio,
        '', // Data_Fim (preenchido ao finalizar)
        '', // Duracao_Min
        tipoSessao,
        protocolo || THERAPY_TYPES[tipoSessao].protocolos[0],
        humorInicial,
        '', // Humor_Final
        '', // Delta_Humor
        localizacao,
        condicoesClima,
        '', // Feedback_Qualitativo
        '', // Tags_Emocoes
        'NAO', // Completada
        '' // Notas_Facilitador
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        sessionId,
        tipoSessao: THERAPY_TYPES[tipoSessao].nome,
        protocolo: protocolo || THERAPY_TYPES[tipoSessao].protocolos[0],
        humorInicial,
        dataInicio,
        mensagem: `Sessão de ${THERAPY_TYPES[tipoSessao].nome} iniciada. Duração estimada: ${THERAPY_TYPES[tipoSessao].duracaoMedia} minutos.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Finaliza uma sessão terapêutica
   * @param {object} params - Parâmetros de finalização
   * @returns {object} Resultado
   */
  finalizarSessao(params) {
    const {
      sessionId,
      humorFinal,
      feedbackQualitativo = '',
      tagsEmocoes = [],
      notasFacilitador = ''
    } = params;
    
    if (humorFinal < 1 || humorFinal > 10) {
      return { success: false, error: 'Humor deve ser entre 1 e 10' };
    }
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Encontra índices
      const idx = {
        sessionId: 0,
        dataInicio: headers.indexOf('Data_Inicio'),
        dataFim: headers.indexOf('Data_Fim'),
        duracao: headers.indexOf('Duracao_Min'),
        humorInicial: headers.indexOf('Humor_Inicial'),
        humorFinal: headers.indexOf('Humor_Final'),
        deltaHumor: headers.indexOf('Delta_Humor'),
        feedback: headers.indexOf('Feedback_Qualitativo'),
        tags: headers.indexOf('Tags_Emocoes'),
        completada: headers.indexOf('Completada'),
        notas: headers.indexOf('Notas_Facilitador')
      };
      
      // Encontra a sessão
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sessionId) {
          rowIndex = i + 1; // +1 porque getRange é 1-indexed
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, error: 'Sessão não encontrada' };
      }
      
      const dataFim = new Date();
      const dataInicio = new Date(data[rowIndex - 1][idx.dataInicio]);
      const duracaoMin = Math.round((dataFim - dataInicio) / 60000);
      const humorInicial = data[rowIndex - 1][idx.humorInicial];
      const deltaHumor = humorFinal - humorInicial;
      
      // Atualiza campos
      sheet.getRange(rowIndex, idx.dataFim + 1).setValue(dataFim.toISOString());
      sheet.getRange(rowIndex, idx.duracao + 1).setValue(duracaoMin);
      sheet.getRange(rowIndex, idx.humorFinal + 1).setValue(humorFinal);
      sheet.getRange(rowIndex, idx.deltaHumor + 1).setValue(deltaHumor);
      sheet.getRange(rowIndex, idx.feedback + 1).setValue(feedbackQualitativo);
      sheet.getRange(rowIndex, idx.tags + 1).setValue(tagsEmocoes.join(', '));
      sheet.getRange(rowIndex, idx.completada + 1).setValue('SIM');
      sheet.getRange(rowIndex, idx.notas + 1).setValue(notasFacilitador);
      
      // Interpreta resultado
      let interpretacao = '';
      if (deltaHumor > 2) {
        interpretacao = 'Melhora significativa no bem-estar';
      } else if (deltaHumor > 0) {
        interpretacao = 'Melhora leve no bem-estar';
      } else if (deltaHumor === 0) {
        interpretacao = 'Estado emocional estável';
      } else {
        interpretacao = 'Sessão pode ter mobilizado emoções - acompanhamento recomendado';
      }
      
      return {
        success: true,
        sessionId,
        humorInicial,
        humorFinal,
        deltaHumor,
        duracaoMin,
        interpretacao,
        mensagem: `Sessão finalizada. ${interpretacao}.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa eficácia das intervenções terapêuticas
   * @param {object} filtros - Filtros opcionais
   * @returns {object} Análise de eficácia
   */
  analisarEficacia(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Sem dados suficientes para análise' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const idx = {
        tipoSessao: headers.indexOf('Tipo_Sessao'),
        protocolo: headers.indexOf('Protocolo_Usado'),
        humorInicial: headers.indexOf('Humor_Inicial'),
        humorFinal: headers.indexOf('Humor_Final'),
        deltaHumor: headers.indexOf('Delta_Humor'),
        completada: headers.indexOf('Completada'),
        duracao: headers.indexOf('Duracao_Min')
      };
      
      // Filtra sessões completadas
      const sessoesCompletas = data.slice(1).filter(row => row[idx.completada] === 'SIM');
      
      if (sessoesCompletas.length === 0) {
        return { success: false, error: 'Nenhuma sessão completada' };
      }
      
      // Análise por tipo de sessão
      const porTipo = {};
      const porProtocolo = {};
      let totalDelta = 0;
      let sessoesPositivas = 0;
      
      for (const row of sessoesCompletas) {
        const tipo = row[idx.tipoSessao];
        const protocolo = row[idx.protocolo];
        const delta = parseFloat(row[idx.deltaHumor]) || 0;
        const duracao = parseFloat(row[idx.duracao]) || 0;
        
        totalDelta += delta;
        if (delta > 0) sessoesPositivas++;
        
        // Por tipo
        if (!porTipo[tipo]) {
          porTipo[tipo] = { count: 0, totalDelta: 0, duracaoTotal: 0 };
        }
        porTipo[tipo].count++;
        porTipo[tipo].totalDelta += delta;
        porTipo[tipo].duracaoTotal += duracao;
        
        // Por protocolo
        if (!porProtocolo[protocolo]) {
          porProtocolo[protocolo] = { count: 0, totalDelta: 0 };
        }
        porProtocolo[protocolo].count++;
        porProtocolo[protocolo].totalDelta += delta;
      }
      
      // Calcula médias
      const eficaciaPorTipo = {};
      for (const [tipo, dados] of Object.entries(porTipo)) {
        eficaciaPorTipo[tipo] = {
          sessoes: dados.count,
          deltaMedio: Math.round((dados.totalDelta / dados.count) * 100) / 100,
          duracaoMedia: Math.round(dados.duracaoTotal / dados.count),
          nome: THERAPY_TYPES[tipo]?.nome || tipo
        };
      }
      
      const eficaciaPorProtocolo = {};
      for (const [protocolo, dados] of Object.entries(porProtocolo)) {
        eficaciaPorProtocolo[protocolo] = {
          sessoes: dados.count,
          deltaMedio: Math.round((dados.totalDelta / dados.count) * 100) / 100
        };
      }
      
      // Ordena por eficácia
      const tiposMaisEficazes = Object.entries(eficaciaPorTipo)
        .sort((a, b) => b[1].deltaMedio - a[1].deltaMedio)
        .slice(0, 5);
      
      const protocolosMaisEficazes = Object.entries(eficaciaPorProtocolo)
        .sort((a, b) => b[1].deltaMedio - a[1].deltaMedio)
        .slice(0, 5);
      
      return {
        success: true,
        resumo: {
          totalSessoes: sessoesCompletas.length,
          deltaMedioGeral: Math.round((totalDelta / sessoesCompletas.length) * 100) / 100,
          taxaSucesso: Math.round((sessoesPositivas / sessoesCompletas.length) * 100),
          sessoesComMelhora: sessoesPositivas
        },
        eficaciaPorTipo,
        eficaciaPorProtocolo,
        ranking: {
          tiposMaisEficazes,
          protocolosMaisEficazes
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório executivo de sessões terapêuticas
   * @returns {object} Relatório formatado
   */
  gerarRelatorioExecutivo() {
    const analise = this.analisarEficacia();
    
    if (!analise.success) {
      return analise;
    }
    
    return {
      success: true,
      tipo: 'RELATORIO_EXECUTIVO_TERAPIA',
      titulo: '🧘 Relatório de Bem-Estar - Reserva Araras',
      dataGeracao: new Date().toISOString(),
      
      resumoExecutivo: {
        destaque: `${analise.resumo.totalSessoes} sessões realizadas com ${analise.resumo.taxaSucesso}% de melhora`,
        deltaMedio: `+${analise.resumo.deltaMedioGeral} pontos de humor`,
        impacto: analise.resumo.sessoesComMelhora + ' pessoas relataram melhora'
      },
      
      metricas: analise.resumo,
      eficaciaPorTipo: analise.eficaciaPorTipo,
      
      insights: this._gerarInsights(analise),
      
      recomendacoes: [
        analise.ranking.tiposMaisEficazes[0] ? 
          `Priorizar ${THERAPY_TYPES[analise.ranking.tiposMaisEficazes[0][0]]?.nome || analise.ranking.tiposMaisEficazes[0][0]} (maior eficácia)` : null,
        'Manter registro consistente de humor inicial/final',
        'Coletar feedback qualitativo para insights',
        'Considerar sazonalidade nas análises'
      ].filter(Boolean)
    };
  },

  /**
   * Gera insights automáticos
   * @private
   */
  _gerarInsights(analise) {
    const insights = [];
    
    if (analise.resumo.taxaSucesso >= 80) {
      insights.push('✅ Excelente taxa de sucesso nas intervenções');
    } else if (analise.resumo.taxaSucesso >= 60) {
      insights.push('📊 Taxa de sucesso dentro do esperado');
    } else {
      insights.push('⚠️ Taxa de sucesso abaixo do ideal - revisar protocolos');
    }
    
    if (analise.resumo.deltaMedioGeral > 2) {
      insights.push('🌟 Impacto significativo no bem-estar dos participantes');
    }
    
    // Identifica tipo mais eficaz
    if (analise.ranking.tiposMaisEficazes.length > 0) {
      const melhor = analise.ranking.tiposMaisEficazes[0];
      insights.push(`🏆 ${THERAPY_TYPES[melhor[0]]?.nome || melhor[0]} é o tipo mais eficaz (Δ ${melhor[1].deltaMedio})`);
    }
    
    return insights;
  },

  /**
   * Busca sessões de um usuário
   * @param {string} userHash - Hash do usuário
   * @returns {array} Sessões do usuário
   */
  buscarSessoesUsuario(userHash) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(THERAPY_SESSION_SCHEMA.sheetName);
      
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const sessoes = data.slice(1)
        .filter(row => row[1] === userHash)
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        });
      
      return { success: true, sessoes, total: sessoes.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista tipos de sessão disponíveis
   */
  listarTiposSessao() {
    return Object.entries(THERAPY_TYPES).map(([id, dados]) => ({
      id,
      nome: dados.nome,
      duracaoMedia: dados.duracaoMedia,
      protocolos: dados.protocolos
    }));
  },

  /**
   * Lista tags de emoções disponíveis
   */
  listarTagsEmocoes() {
    return EMOTION_TAGS;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════

/** API: Inicializa planilhas - TherapySession version
 * NOTA: apiTherapyInit() principal está em TherapyService.gs
 */
function apiTherapySessionInit() {
  return TherapySessionService.initializeSheets();
}

/** API: Registra usuário */
function apiTherapyRegisterUser(nome, email) {
  return TherapySessionService.registrarUsuario(nome, email);
}

/** API: Inicia sessão */
function apiTherapyStartSession(params) {
  return TherapySessionService.iniciarSessao(params);
}

/** API: Finaliza sessão */
function apiTherapyEndSession(params) {
  return TherapySessionService.finalizarSessao(params);
}

/** API: Análise de eficácia */
function apiTherapyAnalyze(filtros) {
  return TherapySessionService.analisarEficacia(filtros);
}

/** API: Relatório executivo */
function apiTherapyReport() {
  return TherapySessionService.gerarRelatorioExecutivo();
}

/** API: Sessões do usuário */
function apiTherapyUserSessions(userHash) {
  return TherapySessionService.buscarSessoesUsuario(userHash);
}

/** API: Lista tipos de sessão */
function apiTherapyTypes() {
  return TherapySessionService.listarTiposSessao();
}

/** API: Lista tags de emoções */
function apiTherapyEmotionTags() {
  return TherapySessionService.listarTagsEmocoes();
}
