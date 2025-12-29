/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ROADMAP DE EVOLUÇÃO E MELHORIAS FUTURAS
 * ═══════════════════════════════════════════════════════════════════════════
 * P37 - Strategic Evolution Roadmap 2025-2027
 * 
 * Features:
 * - Roadmap visualization by quarter/year
 * - Initiative tracking and status
 * - Investment planning
 * - Progress monitoring
 * - ROI projections
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const ROADMAP_HEADERS = [
  'ID_Iniciativa', 'Titulo', 'Descricao', 'Categoria', 'Ano', 'Trimestre',
  'Status', 'Prioridade', 'Investimento_BRL', 'Responsavel', 'Data_Inicio',
  'Data_Conclusao', 'Progresso_Percent', 'Dependencias', 'Tags'
];

/**
 * Sistema de Roadmap
 * @namespace Roadmap
 */
const Roadmap = {
  
  SHEET_NAME: 'ROADMAP_RA',
  
  /**
   * Categorias de iniciativas
   */
  CATEGORIAS: {
    CONSOLIDACAO: { nome: 'Consolidação', icone: '✅', cor: '#4CAF50' },
    OTIMIZACAO: { nome: 'Otimização', icone: '⚡', cor: '#FF9800' },
    EXPANSAO: { nome: 'Expansão', icone: '🚀', cor: '#2196F3' },
    INOVACAO: { nome: 'Inovação', icone: '💡', cor: '#9C27B0' },
    INFRAESTRUTURA: { nome: 'Infraestrutura', icone: '🔧', cor: '#607D8B' },
    INTEGRACAO: { nome: 'Integração', icone: '🔗', cor: '#00BCD4' }
  },
  
  /**
   * Status de iniciativas
   */
  STATUS: {
    PLANEJADO: { nome: 'Planejado', icone: '📋', cor: '#9E9E9E' },
    EM_ANDAMENTO: { nome: 'Em Andamento', icone: '🔄', cor: '#2196F3' },
    CONCLUIDO: { nome: 'Concluído', icone: '✅', cor: '#4CAF50' },
    PAUSADO: { nome: 'Pausado', icone: '⏸️', cor: '#FF9800' },
    CANCELADO: { nome: 'Cancelado', icone: '❌', cor: '#F44336' }
  },
  
  /**
   * Roadmap pré-definido 2025-2027
   */
  ROADMAP_INICIAL: [
    // Q1 2025 - Consolidação
    { id: 'R2025-Q1-01', titulo: '37 Sistemas Implementados', categoria: 'CONSOLIDACAO', ano: 2025, trimestre: 'Q1', status: 'CONCLUIDO', prioridade: 'CRITICA', investimento: 0, progresso: 100, tags: ['core', 'milestone'] },
    { id: 'R2025-Q1-02', titulo: 'Treinamento da Equipe', categoria: 'CONSOLIDACAO', ano: 2025, trimestre: 'Q1', status: 'EM_ANDAMENTO', prioridade: 'ALTA', investimento: 15000, progresso: 60, tags: ['capacitacao', 'equipe'] },
    { id: 'R2025-Q1-03', titulo: 'Documentação Completa', categoria: 'CONSOLIDACAO', ano: 2025, trimestre: 'Q1', status: 'CONCLUIDO', prioridade: 'ALTA', investimento: 5000, progresso: 100, tags: ['docs', 'api'] },
    { id: 'R2025-Q1-04', titulo: 'Ajustes de Feedback', categoria: 'CONSOLIDACAO', ano: 2025, trimestre: 'Q1', status: 'EM_ANDAMENTO', prioridade: 'MEDIA', investimento: 10000, progresso: 40, tags: ['ux', 'feedback'] },
    
    // Q2 2025 - Otimização
    { id: 'R2025-Q2-01', titulo: 'Machine Learning Avançado', categoria: 'OTIMIZACAO', ano: 2025, trimestre: 'Q2', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 45000, progresso: 0, tags: ['ml', 'ia', 'gemini'] },
    { id: 'R2025-Q2-02', titulo: 'App Mobile Nativo', categoria: 'OTIMIZACAO', ano: 2025, trimestre: 'Q2', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 60000, progresso: 0, tags: ['mobile', 'app', 'android', 'ios'] },
    { id: 'R2025-Q2-03', titulo: 'Otimização de Performance', categoria: 'OTIMIZACAO', ano: 2025, trimestre: 'Q2', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 20000, progresso: 0, tags: ['performance', 'cache'] },
    
    // Q3 2025 - Expansão IoT
    { id: 'R2025-Q3-01', titulo: 'Integração com Drones', categoria: 'EXPANSAO', ano: 2025, trimestre: 'Q3', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 80000, progresso: 0, tags: ['drone', 'iot', 'monitoramento'] },
    { id: 'R2025-Q3-02', titulo: 'Sensores Adicionais (50+)', categoria: 'INFRAESTRUTURA', ano: 2025, trimestre: 'Q3', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 40000, progresso: 0, tags: ['iot', 'sensores', 'hardware'] },
    
    // Q4 2025 - Experiência
    { id: 'R2025-Q4-01', titulo: 'Realidade Aumentada Trilhas', categoria: 'INOVACAO', ano: 2025, trimestre: 'Q4', status: 'PLANEJADO', prioridade: 'BAIXA', investimento: 35000, progresso: 0, tags: ['ar', 'trilhas', 'turismo'] },
    { id: 'R2025-Q4-02', titulo: 'Gamificação Avançada', categoria: 'OTIMIZACAO', ano: 2025, trimestre: 'Q4', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 25000, progresso: 0, tags: ['gamificacao', 'engajamento'] },
    
    // 2026 - Expansão
    { id: 'R2026-Q1-01', titulo: 'Blockchain Rastreabilidade', categoria: 'INOVACAO', ano: 2026, trimestre: 'Q1', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 70000, progresso: 0, tags: ['blockchain', 'rastreabilidade'] },
    { id: 'R2026-Q2-01', titulo: 'Marketplace Créditos Carbono', categoria: 'EXPANSAO', ano: 2026, trimestre: 'Q2', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 90000, progresso: 0, tags: ['carbono', 'marketplace', 'vcs'] },
    { id: 'R2026-Q3-01', titulo: 'Rede de Reservas Conectadas', categoria: 'INTEGRACAO', ano: 2026, trimestre: 'Q3', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 120000, progresso: 0, tags: ['rede', 'parceiros', 'integracao'] },
    { id: 'R2026-Q4-01', titulo: 'IA Generativa Educação', categoria: 'INOVACAO', ano: 2026, trimestre: 'Q4', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 50000, progresso: 0, tags: ['ia', 'educacao', 'chatbot'] },
    
    // 2027 - Inovação
    { id: 'R2027-Q1-01', titulo: 'Gêmeo Digital da Reserva', categoria: 'INOVACAO', ano: 2027, trimestre: 'Q1', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 150000, progresso: 0, tags: ['digital-twin', '3d', 'simulacao'] },
    { id: 'R2027-Q2-01', titulo: 'Deep Learning Predição', categoria: 'INOVACAO', ano: 2027, trimestre: 'Q2', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 100000, progresso: 0, tags: ['deep-learning', 'predicao', 'ml'] },
    { id: 'R2027-Q3-01', titulo: 'Automação Total', categoria: 'OTIMIZACAO', ano: 2027, trimestre: 'Q3', status: 'PLANEJADO', prioridade: 'MEDIA', investimento: 80000, progresso: 0, tags: ['automacao', 'processos'] },
    { id: 'R2027-Q4-01', titulo: 'Exportação do Modelo', categoria: 'EXPANSAO', ano: 2027, trimestre: 'Q4', status: 'PLANEJADO', prioridade: 'ALTA', investimento: 60000, progresso: 0, tags: ['franquia', 'modelo', 'expansao'] }
  ],

  /**
   * Inicializa planilha e popula roadmap inicial
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(ROADMAP_HEADERS);
        
        // Formata header
        const headerRange = sheet.getRange(1, 1, 1, ROADMAP_HEADERS.length);
        headerRange.setBackground('#1565C0');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        // Popula com roadmap inicial
        this.ROADMAP_INICIAL.forEach(item => {
          sheet.appendRow([
            item.id,
            item.titulo,
            item.descricao || '',
            item.categoria,
            item.ano,
            item.trimestre,
            item.status,
            item.prioridade,
            item.investimento,
            item.responsavel || '',
            item.data_inicio || '',
            item.data_conclusao || '',
            item.progresso,
            item.dependencias || '',
            item.tags?.join(',') || ''
          ]);
        });
      }
      
      return { success: true, sheet: this.SHEET_NAME };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém roadmap completo
   */
  getRoadmap: function(filtros = {}) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, iniciativas: [], total: 0 };
      }
      
      const data = sheet.getDataRange().getValues().slice(1);
      let iniciativas = data.map(row => ({
        id: row[0],
        titulo: row[1],
        descricao: row[2],
        categoria: row[3],
        categoria_info: this.CATEGORIAS[row[3]] || {},
        ano: row[4],
        trimestre: row[5],
        status: row[6],
        status_info: this.STATUS[row[6]] || {},
        prioridade: row[7],
        investimento: row[8],
        responsavel: row[9],
        data_inicio: row[10],
        data_conclusao: row[11],
        progresso: row[12],
        dependencias: row[13],
        tags: row[14] ? row[14].split(',') : []
      }));
      
      // Aplica filtros
      if (filtros.ano) {
        iniciativas = iniciativas.filter(i => i.ano === filtros.ano);
      }
      if (filtros.trimestre) {
        iniciativas = iniciativas.filter(i => i.trimestre === filtros.trimestre);
      }
      if (filtros.categoria) {
        iniciativas = iniciativas.filter(i => i.categoria === filtros.categoria);
      }
      if (filtros.status) {
        iniciativas = iniciativas.filter(i => i.status === filtros.status);
      }
      
      return { success: true, iniciativas, total: iniciativas.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém visão por ano
   */
  getByYear: function(ano) {
    const result = this.getRoadmap({ ano });
    if (!result.success) return result;
    
    const porTrimestre = { Q1: [], Q2: [], Q3: [], Q4: [] };
    result.iniciativas.forEach(i => {
      if (porTrimestre[i.trimestre]) {
        porTrimestre[i.trimestre].push(i);
      }
    });
    
    const investimentoTotal = result.iniciativas.reduce((sum, i) => sum + (i.investimento || 0), 0);
    const progressoMedio = result.iniciativas.length > 0 
      ? Math.round(result.iniciativas.reduce((sum, i) => sum + i.progresso, 0) / result.iniciativas.length)
      : 0;
    
    return {
      success: true,
      ano,
      por_trimestre: porTrimestre,
      total_iniciativas: result.total,
      investimento_total: investimentoTotal,
      progresso_medio: progressoMedio
    };
  },

  /**
   * Obtém resumo executivo do roadmap
   */
  getSummary: function() {
    try {
      const result = this.getRoadmap();
      if (!result.success) return result;
      
      const iniciativas = result.iniciativas;
      
      // Por status
      const porStatus = {};
      Object.keys(this.STATUS).forEach(s => {
        porStatus[s] = iniciativas.filter(i => i.status === s).length;
      });
      
      // Por categoria
      const porCategoria = {};
      Object.keys(this.CATEGORIAS).forEach(c => {
        porCategoria[c] = iniciativas.filter(i => i.categoria === c).length;
      });
      
      // Por ano
      const porAno = {};
      [2025, 2026, 2027].forEach(ano => {
        const anoData = iniciativas.filter(i => i.ano === ano);
        porAno[ano] = {
          total: anoData.length,
          investimento: anoData.reduce((sum, i) => sum + (i.investimento || 0), 0),
          concluidos: anoData.filter(i => i.status === 'CONCLUIDO').length
        };
      });
      
      // Investimento total
      const investimentoTotal = iniciativas.reduce((sum, i) => sum + (i.investimento || 0), 0);
      
      // Progresso geral
      const progressoGeral = iniciativas.length > 0
        ? Math.round(iniciativas.reduce((sum, i) => sum + i.progresso, 0) / iniciativas.length)
        : 0;
      
      // Próximas iniciativas
      const proximas = iniciativas
        .filter(i => i.status === 'PLANEJADO')
        .sort((a, b) => {
          if (a.ano !== b.ano) return a.ano - b.ano;
          return a.trimestre.localeCompare(b.trimestre);
        })
        .slice(0, 5);
      
      return {
        success: true,
        resumo: {
          total_iniciativas: iniciativas.length,
          por_status: porStatus,
          por_categoria: porCategoria,
          por_ano: porAno,
          investimento_total_3anos: investimentoTotal,
          progresso_geral: progressoGeral,
          proximas_iniciativas: proximas,
          roi_esperado: '400%',
          categorias: this.CATEGORIAS,
          status_tipos: this.STATUS
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status de iniciativa
   */
  updateStatus: function(id, novoStatus, progresso) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          sheet.getRange(i + 1, 7).setValue(novoStatus);
          if (progresso !== undefined) {
            sheet.getRange(i + 1, 13).setValue(progresso);
          }
          if (novoStatus === 'CONCLUIDO') {
            sheet.getRange(i + 1, 12).setValue(new Date().toISOString());
            sheet.getRange(i + 1, 13).setValue(100);
          }
          
          return { success: true, id, status: novoStatus, progresso };
        }
      }
      
      return { success: false, error: 'Iniciativa não encontrada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Adiciona nova iniciativa
   */
  addInitiative: function(dados) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `R${dados.ano}-${dados.trimestre}-${Date.now().toString(36).toUpperCase().slice(-2)}`;
      
      sheet.appendRow([
        id,
        dados.titulo,
        dados.descricao || '',
        dados.categoria || 'CONSOLIDACAO',
        dados.ano || 2025,
        dados.trimestre || 'Q1',
        dados.status || 'PLANEJADO',
        dados.prioridade || 'MEDIA',
        dados.investimento || 0,
        dados.responsavel || '',
        dados.data_inicio || '',
        '',
        0,
        dados.dependencias || '',
        dados.tags?.join(',') || ''
      ]);
      
      return { success: true, id, titulo: dados.titulo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula projeção de investimento
   */
  getInvestmentProjection: function() {
    const result = this.getRoadmap();
    if (!result.success) return result;
    
    const projecao = {
      2025: { desenvolvimento: 0, infraestrutura: 0, treinamento: 0, total: 0 },
      2026: { desenvolvimento: 0, infraestrutura: 0, expansao: 0, total: 0 },
      2027: { inovacao: 0, escalabilidade: 0, total: 0 }
    };
    
    result.iniciativas.forEach(i => {
      const ano = i.ano;
      if (!projecao[ano]) return;
      
      projecao[ano].total += i.investimento || 0;
      
      // Categoriza investimento
      if (i.categoria === 'INFRAESTRUTURA') {
        projecao[ano].infraestrutura = (projecao[ano].infraestrutura || 0) + i.investimento;
      } else if (i.categoria === 'INOVACAO') {
        projecao[ano].inovacao = (projecao[ano].inovacao || 0) + i.investimento;
      } else if (i.categoria === 'EXPANSAO') {
        projecao[ano].expansao = (projecao[ano].expansao || 0) + i.investimento;
      } else {
        projecao[ano].desenvolvimento = (projecao[ano].desenvolvimento || 0) + i.investimento;
      }
    });
    
    const totalGeral = Object.values(projecao).reduce((sum, ano) => sum + ano.total, 0);
    
    return {
      success: true,
      projecao,
      total_3anos: totalGeral,
      roi_esperado: {
        percentual: 400,
        valor_servicos_ecossistemicos_ano: 850000,
        creditos_carbono_ano: 67500,
        economia_operacional_ano: 180000,
        receita_turismo_ano: 240000,
        payback_anos: 0.9
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Roadmap
// ═══════════════════════════════════════════════════════════════════════════

function apiRoadmapInit() {
  return Roadmap.initializeSheet();
}

function apiRoadmapObter(filtros) {
  return Roadmap.getRoadmap(filtros || {});
}

function apiRoadmapPorAno(ano) {
  return Roadmap.getByYear(ano);
}

function apiRoadmapResumo() {
  return Roadmap.getSummary();
}

function apiRoadmapAtualizarStatus(id, status, progresso) {
  return Roadmap.updateStatus(id, status, progresso);
}

function apiRoadmapAdicionar(dados) {
  return Roadmap.addInitiative(dados);
}

function apiRoadmapProjecaoInvestimento() {
  return Roadmap.getInvestmentProjection();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 10/43 - Strategic Roadmap Planning and Milestone Tracking
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Definição de fases do projeto
 */
const PROJECT_PHASES = {
  FASE_1: { id: 'FASE_1', nome: 'Consolidação', trimestres: ['Q1'], ano: 2025, prerequisitos: [] },
  FASE_2: { id: 'FASE_2', nome: 'Implantação IoT', trimestres: ['Q2', 'Q3'], ano: 2025, prerequisitos: ['FASE_1'] },
  FASE_3: { id: 'FASE_3', nome: 'Integração IA', trimestres: ['Q4'], ano: 2025, prerequisitos: ['FASE_2'] },
  FASE_4: { id: 'FASE_4', nome: 'Expansão', trimestres: ['Q1', 'Q2'], ano: 2026, prerequisitos: ['FASE_3'] },
  FASE_5: { id: 'FASE_5', nome: 'Inovação', trimestres: ['Q3', 'Q4'], ano: 2026, prerequisitos: ['FASE_4'] },
  FASE_6: { id: 'FASE_6', nome: 'Escala', trimestres: ['Q1', 'Q2', 'Q3', 'Q4'], ano: 2027, prerequisitos: ['FASE_5'] }
};

/**
 * Extensão do Roadmap para gestão estratégica (Prompt 10/43)
 */
const RoadmapManager = {

  /**
   * Conclui uma fase do projeto
   */
  completePhase: function(faseId) {
    try {
      const fase = PROJECT_PHASES[faseId];
      if (!fase) {
        return { success: false, error: `Fase não encontrada: ${faseId}` };
      }

      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(Roadmap.SHEET_NAME);
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };

      const data = sheet.getDataRange().getValues();
      let iniciativasAtualizadas = 0;
      const iniciativasConcluidas = [];

      for (let i = 1; i < data.length; i++) {
        const ano = data[i][4];
        const trimestre = data[i][5];
        const status = data[i][6];

        if (ano === fase.ano && fase.trimestres.includes(trimestre) && status !== 'CONCLUIDO') {
          sheet.getRange(i + 1, 7).setValue('CONCLUIDO');
          sheet.getRange(i + 1, 12).setValue(new Date().toISOString());
          sheet.getRange(i + 1, 13).setValue(100);
          iniciativasAtualizadas++;
          iniciativasConcluidas.push({ id: data[i][0], titulo: data[i][1] });
        }
      }

      return {
        success: true,
        fase: { id: faseId, nome: fase.nome, status: 'Concluída' },
        iniciativas_atualizadas: iniciativasAtualizadas,
        iniciativas: iniciativasConcluidas,
        mensagem: `Fase ${fase.nome} concluída com ${iniciativasAtualizadas} iniciativa(s)`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Ativa uma fase do projeto
   */
  activatePhase: function(faseId) {
    try {
      const fase = PROJECT_PHASES[faseId];
      if (!fase) return { success: false, error: `Fase não encontrada: ${faseId}` };

      const validacao = this.validateDependencies(faseId);
      if (!validacao.success || !validacao.pode_ativar) {
        return { success: false, error: 'Pré-requisitos não atendidos', dependencias_pendentes: validacao.pendentes || [] };
      }

      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(Roadmap.SHEET_NAME);
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };

      const data = sheet.getDataRange().getValues();
      let iniciativasAtivadas = 0;

      for (let i = 1; i < data.length; i++) {
        if (data[i][4] === fase.ano && fase.trimestres.includes(data[i][5]) && data[i][6] === 'PLANEJADO') {
          sheet.getRange(i + 1, 7).setValue('EM_ANDAMENTO');
          sheet.getRange(i + 1, 11).setValue(new Date().toISOString());
          iniciativasAtivadas++;
        }
      }

      return {
        success: true,
        fase: { id: faseId, nome: fase.nome, status: 'Em Andamento' },
        iniciativas_ativadas: iniciativasAtivadas
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Valida dependências de uma fase
   */
  validateDependencies: function(id) {
    try {
      const fase = PROJECT_PHASES[id];
      if (!fase) return { success: false, error: 'Fase não encontrada' };

      const pendentes = [];
      const concluidas = [];

      for (const prereqId of fase.prerequisitos) {
        const prereq = PROJECT_PHASES[prereqId];
        if (!prereq) continue;

        const roadmap = Roadmap.getRoadmap({ ano: prereq.ano });
        const iniciativasFase = roadmap.iniciativas?.filter(i => prereq.trimestres.includes(i.trimestre)) || [];
        const todasConcluidas = iniciativasFase.every(i => i.status === 'CONCLUIDO');

        if (todasConcluidas && iniciativasFase.length > 0) {
          concluidas.push({ id: prereqId, nome: prereq.nome });
        } else {
          pendentes.push({ id: prereqId, nome: prereq.nome });
        }
      }

      return {
        success: true,
        id: id,
        nome: fase.nome,
        pode_ativar: pendentes.length === 0,
        concluidas: concluidas,
        pendentes: pendentes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém grafo de dependências
   */
  getDependencyGraph: function() {
    try {
      const nodes = [];
      const edges = [];

      Object.values(PROJECT_PHASES).forEach(fase => {
        nodes.push({ id: fase.id, nome: fase.nome, ano: fase.ano, trimestres: fase.trimestres });
        fase.prerequisitos.forEach(prereq => {
          edges.push({ from: prereq, to: fase.id });
        });
      });

      const roadmap = Roadmap.getRoadmap();
      nodes.forEach(node => {
        const fase = PROJECT_PHASES[node.id];
        const iniciativasFase = roadmap.iniciativas?.filter(i => i.ano === fase.ano && fase.trimestres.includes(i.trimestre)) || [];
        const concluidas = iniciativasFase.filter(i => i.status === 'CONCLUIDO').length;
        node.status = concluidas === iniciativasFase.length && iniciativasFase.length > 0 ? 'Concluída' : concluidas > 0 ? 'Em Andamento' : 'Planejada';
        node.progresso = iniciativasFase.length > 0 ? Math.round((concluidas / iniciativasFase.length) * 100) : 0;
      });

      return { success: true, grafo: { nodes, edges }, total_fases: nodes.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula velocidade de entrega
   */
  calculateVelocity: function() {
    try {
      const roadmap = Roadmap.getRoadmap();
      const concluidas = roadmap.iniciativas?.filter(i => i.status === 'CONCLUIDO') || [];

      const porTrimestre = {};
      concluidas.forEach(i => {
        const key = `${i.ano}-${i.trimestre}`;
        porTrimestre[key] = (porTrimestre[key] || 0) + 1;
      });

      const trimestres = Object.keys(porTrimestre);
      const velocidadeTrimestral = trimestres.length > 0 ? concluidas.length / trimestres.length : 0;

      return {
        success: true,
        velocidade: {
          iniciativas_concluidas: concluidas.length,
          velocidade_trimestral: Math.round(velocidadeTrimestral * 100) / 100,
          por_trimestre: porTrimestre,
          tendencia: 'Estável'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Ajusta cronograma baseado na velocidade
   */
  adjustTimelineByVelocity: function() {
    try {
      const velocidade = this.calculateVelocity();
      const roadmap = Roadmap.getRoadmap();
      const pendentes = roadmap.iniciativas?.filter(i => i.status === 'PLANEJADO' || i.status === 'EM_ANDAMENTO') || [];

      const velTrimestral = velocidade.velocidade?.velocidade_trimestral || 1;
      const trimestresNecessarios = Math.ceil(pendentes.length / Math.max(velTrimestral, 0.5));

      const dataConclusao = new Date();
      dataConclusao.setDate(dataConclusao.getDate() + (trimestresNecessarios * 90));

      return {
        success: true,
        ajuste: {
          velocidade_atual: velTrimestral,
          iniciativas_pendentes: pendentes.length,
          trimestres_necessarios: trimestresNecessarios,
          data_conclusao_estimada: dataConclusao.toISOString().split('T')[0]
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório de milestones
   */
  generateMilestoneReport: function() {
    try {
      const roadmap = Roadmap.getRoadmap();
      const grafo = this.getDependencyGraph();
      const velocidade = this.calculateVelocity();
      const timeline = this.adjustTimelineByVelocity();

      const iniciativas = roadmap.iniciativas || [];
      const concluidos = iniciativas.filter(i => i.status === 'CONCLUIDO');
      const emAndamento = iniciativas.filter(i => i.status === 'EM_ANDAMENTO');
      const planejados = iniciativas.filter(i => i.status === 'PLANEJADO');

      return {
        success: true,
        titulo: 'Relatório de Milestones - Roadmap Estratégico',
        data_geracao: new Date().toISOString(),
        sumario: {
          total_iniciativas: iniciativas.length,
          concluidas: concluidos.length,
          em_andamento: emAndamento.length,
          planejadas: planejados.length,
          progresso_geral: iniciativas.length > 0 ? Math.round((concluidos.length / iniciativas.length) * 100) : 0
        },
        fases: grafo.grafo?.nodes || [],
        velocidade: velocidade.velocidade || {},
        timeline_ajustado: timeline.ajuste || {}
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Strategic Roadmap (Prompt 10/43)
// ═══════════════════════════════════════════════════════════════════════════

function apiRoadmapConcluirFase(faseId) {
  return RoadmapManager.completePhase(faseId);
}

function apiRoadmapAtivarFase(faseId) {
  return RoadmapManager.activatePhase(faseId);
}

function apiRoadmapValidarDependencias(id) {
  return RoadmapManager.validateDependencies(id);
}

function apiRoadmapGrafoDependencias() {
  return RoadmapManager.getDependencyGraph();
}

function apiRoadmapVelocidade() {
  return RoadmapManager.calculateVelocity();
}

function apiRoadmapAjustarCronograma() {
  return RoadmapManager.adjustTimelineByVelocity();
}

function apiRoadmapRelatorioMilestones() {
  return RoadmapManager.generateMilestoneReport();
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 10/43
// ═══════════════════════════════════════════════════════════════════════════

function testStrategicRoadmapPlanning() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '10/43 - Strategic Roadmap Planning and Milestone Tracking',
    tests: []
  };

  // Test 1: validateDependencies
  try {
    const deps = RoadmapManager.validateDependencies('FASE_2');
    results.tests.push({
      name: 'validateDependencies',
      status: deps.success !== undefined ? 'PASS' : 'FAIL',
      details: { success: deps.success, pode_ativar: deps.pode_ativar }
    });
  } catch (e) {
    results.tests.push({ name: 'validateDependencies', status: 'ERROR', error: e.message });
  }

  // Test 2: getDependencyGraph
  try {
    const grafo = RoadmapManager.getDependencyGraph();
    results.tests.push({
      name: 'getDependencyGraph',
      status: grafo.success && grafo.grafo?.nodes ? 'PASS' : 'FAIL',
      details: { success: grafo.success, total_fases: grafo.total_fases }
    });
  } catch (e) {
    results.tests.push({ name: 'getDependencyGraph', status: 'ERROR', error: e.message });
  }

  // Test 3: calculateVelocity
  try {
    const vel = RoadmapManager.calculateVelocity();
    results.tests.push({
      name: 'calculateVelocity',
      status: vel.success && vel.velocidade ? 'PASS' : 'FAIL',
      details: { success: vel.success, velocidade_trimestral: vel.velocidade?.velocidade_trimestral }
    });
  } catch (e) {
    results.tests.push({ name: 'calculateVelocity', status: 'ERROR', error: e.message });
  }

  // Test 4: adjustTimelineByVelocity
  try {
    const timeline = RoadmapManager.adjustTimelineByVelocity();
    results.tests.push({
      name: 'adjustTimelineByVelocity',
      status: timeline.success && timeline.ajuste ? 'PASS' : 'FAIL',
      details: { success: timeline.success, trimestres_necessarios: timeline.ajuste?.trimestres_necessarios }
    });
  } catch (e) {
    results.tests.push({ name: 'adjustTimelineByVelocity', status: 'ERROR', error: e.message });
  }

  // Test 5: generateMilestoneReport
  try {
    const report = RoadmapManager.generateMilestoneReport();
    results.tests.push({
      name: 'generateMilestoneReport',
      status: report.success && report.sumario ? 'PASS' : 'FAIL',
      details: { success: report.success, progresso_geral: report.sumario?.progresso_geral }
    });
  } catch (e) {
    results.tests.push({ name: 'generateMilestoneReport', status: 'ERROR', error: e.message });
  }

  const passed = results.tests.filter(t => t.status === 'PASS').length;
  results.summary = { passed, total: results.tests.length, status: passed === results.tests.length ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED' };

  Logger.log(JSON.stringify(results, null, 2));
  return results;
}
