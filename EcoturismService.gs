/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ECOTURISM SERVICE - Análises de Ecoturismo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Referências:
 * - ICMBio (2016). Diretrizes para Visitação em Unidades de Conservação
 * - UNWTO (2019). Sustainable Tourism Guidelines
 * - Cifuentes (1992). Capacidade de carga turística
 */

/**
 * Tipos de problemas em trilhas com prioridade base
 */
const TRAIL_ISSUE_TYPES = {
  EROSAO: { nome: 'Erosão', prioridade_base: 2, descricao: 'Desgaste do solo por água ou pisoteio' },
  ARVORE_CAIDA: { nome: 'Árvore Caída', prioridade_base: 1, descricao: 'Árvore bloqueando passagem' },
  PONTE_DANIFICADA: { nome: 'Ponte Danificada', prioridade_base: 1, descricao: 'Estrutura de travessia comprometida' },
  SINALIZACAO: { nome: 'Sinalização Danificada', prioridade_base: 3, descricao: 'Placas ou marcações danificadas' },
  LIXO: { nome: 'Lixo/Resíduos', prioridade_base: 4, descricao: 'Acúmulo de resíduos na trilha' },
  DESLIZAMENTO: { nome: 'Deslizamento', prioridade_base: 1, descricao: 'Movimento de terra ou rochas' },
  ALAGAMENTO: { nome: 'Alagamento', prioridade_base: 2, descricao: 'Acúmulo de água na trilha' },
  VEGETACAO: { nome: 'Vegetação Obstruindo', prioridade_base: 3, descricao: 'Vegetação bloqueando passagem' }
};

/**
 * Multiplicadores de severidade para cálculo de prioridade final
 * Menor valor = maior prioridade
 */
const SEVERITY_MULTIPLIER = {
  Baixa: 1.0,
  Media: 0.75,
  Alta: 0.5,
  Critica: 0.25
};

/**
 * Tipos de incidentes com visitantes (Prompt 28/30)
 */
const INCIDENT_TYPES = {
  FERIMENTO_LEVE: { nome: 'Ferimento Leve', severidade_padrao: 'Media', urgencia: '24h' },
  FERIMENTO_GRAVE: { nome: 'Ferimento Grave', severidade_padrao: 'Critica', urgencia: 'Imediata' },
  EXTRAVIO: { nome: 'Pessoa Extraviada', severidade_padrao: 'Alta', urgencia: 'Imediata' },
  MAL_ESTAR: { nome: 'Mal-estar', severidade_padrao: 'Media', urgencia: '24h' },
  ANIMAL_PERIGOSO: { nome: 'Encontro com Animal Perigoso', severidade_padrao: 'Alta', urgencia: 'Imediata' },
  QUEDA: { nome: 'Queda', severidade_padrao: 'Media', urgencia: '24h' },
  DESIDRATACAO: { nome: 'Desidratação', severidade_padrao: 'Media', urgencia: '24h' },
  PICADA_INSETO: { nome: 'Picada de Inseto/Animal', severidade_padrao: 'Baixa', urgencia: '24h' },
  CLIMA_ADVERSO: { nome: 'Condição Climática Adversa', severidade_padrao: 'Alta', urgencia: 'Imediata' },
  OUTRO: { nome: 'Outro', severidade_padrao: 'Baixa', urgencia: '24h' }
};

/**
 * Perfis de grupos de visitantes
 */
const GROUP_PROFILES = [
  'Individual', 'Casal', 'Família', 'Grupo Escolar', 
  'Idosos', 'Corporativo', 'Pesquisadores', 'Atletas', 'Outro'
];

/**
 * Configuração de perfis de grupo para logística de tours (Prompt 30/30)
 */
const GROUP_PROFILE_CONFIG = {
  'Individual': { ritmo: 'Normal', dificuldade_max: 'Dificil', descansos: 1, duracao_mult: 1.0 },
  'Casal': { ritmo: 'Normal', dificuldade_max: 'Dificil', descansos: 1, duracao_mult: 1.0 },
  'Família': { ritmo: 'Moderado', dificuldade_max: 'Media', descansos: 2, duracao_mult: 1.3 },
  'Grupo Escolar': { ritmo: 'Lento', dificuldade_max: 'Facil', descansos: 3, duracao_mult: 1.5 },
  'Idosos': { ritmo: 'Lento', dificuldade_max: 'Facil', descansos: 4, duracao_mult: 1.8 },
  'Corporativo': { ritmo: 'Moderado', dificuldade_max: 'Media', descansos: 2, duracao_mult: 1.2 },
  'Pesquisadores': { ritmo: 'Variavel', dificuldade_max: 'Dificil', descansos: 2, duracao_mult: 1.5 },
  'Atletas': { ritmo: 'Rapido', dificuldade_max: 'Dificil', descansos: 0, duracao_mult: 0.8 },
  'Outro': { ritmo: 'Moderado', dificuldade_max: 'Media', descansos: 2, duracao_mult: 1.2 }
};

/**
 * Níveis de dificuldade de trilhas
 */
const DIFFICULTY_LEVELS = {
  'Facil': { ordem: 1, duracao_mult: 1.0, descricao: 'Terreno plano, curta distância' },
  'Media': { ordem: 2, duracao_mult: 1.2, descricao: 'Algumas subidas, distância moderada' },
  'Dificil': { ordem: 3, duracao_mult: 1.5, descricao: 'Terreno acidentado, longa distância' }
};

const EcoturismService = {
  /**
   * Calcula NPS (Net Promoter Score)
   */
  calculateNPS() {
    try {
      const avaliacoes = DatabaseService.read(CONFIG.SHEETS.AVALIACOES);

      if (!avaliacoes.success || avaliacoes.data.length === 0) {
        return { success: false, error: 'Sem avaliações' };
      }

      const notas = avaliacoes.data
        .map(a => parseFloat(a.nota) || 0)
        .filter(n => n >= 0 && n <= 10);

      if (notas.length === 0) {
        return { success: false, error: 'Sem notas válidas' };
      }

      const promotores = notas.filter(n => n >= 9).length;
      const neutros = notas.filter(n => n >= 7 && n < 9).length;
      const detratores = notas.filter(n => n < 7).length;

      const nps = ((promotores - detratores) / notas.length) * 100;

      let classificacao;
      if (nps >= 75) classificacao = 'Excelente';
      else if (nps >= 50) classificacao = 'Muito Bom';
      else if (nps >= 0) classificacao = 'Razoável';
      else classificacao = 'Ruim';

      return {
        success: true,
        nps: nps.toFixed(1),
        classificacao,
        distribuicao: {
          promotores: { quantidade: promotores, percentual: ((promotores/notas.length)*100).toFixed(1) + '%' },
          neutros: { quantidade: neutros, percentual: ((neutros/notas.length)*100).toFixed(1) + '%' },
          detratores: { quantidade: detratores, percentual: ((detratores/notas.length)*100).toFixed(1) + '%' }
        },
        totalAvaliacoes: notas.length,
        notaMedia: Utils.average(notas).toFixed(1)
      };
    } catch (error) {
      Utils.logError('EcoturismService.calculateNPS', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise de capacidade de carga de trilha
   * Baseado em: Cifuentes (1992)
   */
  analyzeTrailCapacity(trilhaId) {
    try {
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: trilhaId });

      if (!trilha.success || trilha.data.length === 0) {
        return { success: false, error: 'Trilha não encontrada' };
      }

      const t = trilha.data[0];
      const distanciaKm = parseFloat(t.distancia_km) || 1;
      const larguraM = parseFloat(t.largura_m) || 2;
      const tempoVisitaHoras = parseFloat(t.tempo_visita_horas) || 2;

      // Capacidade de Carga Física (CCF)
      // CCF = (Área disponível / Área ocupada por visitante) × (Horas abertura / Tempo visita)
      const areaDisponivel = distanciaKm * 1000 * larguraM; // m²
      const areaVisitante = 1; // 1m² por visitante
      const horasAbertura = 8; // 8h por dia

      const ccf = (areaDisponivel / areaVisitante) * (horasAbertura / tempoVisitaHoras);

      // Capacidade de Carga Real (CCR) - aplica fatores de correção
      const fatorErosao = 0.8; // 20% de redução por erosão
      const fatorAcessibilidade = 0.9; // 10% de redução por dificuldade
      const fatorPrecipitacao = 0.85; // 15% de redução por chuvas
      const fatorBiodiversidade = 0.9; // 10% de redução para proteção

      const ccr = ccf * fatorErosao * fatorAcessibilidade * fatorPrecipitacao * fatorBiodiversidade;

      // Capacidade de Carga Efetiva (CCE) - capacidade de manejo
      const capacidadeManejo = 0.7; // 70% de capacidade de gestão
      const cce = ccr * capacidadeManejo;

      // Verifica visitação atual
      const visitantes = DatabaseService.read(CONFIG.SHEETS.VISITANTES, { trilha_id: trilhaId });
      const visitacaoAtual = visitantes.success ? visitantes.data.length : 0;

      const utilizacao = (visitacaoAtual / cce) * 100;

      return {
        success: true,
        trilha: {
          id: trilhaId,
          nome: t.nome,
          distancia: distanciaKm,
          dificuldade: t.dificuldade
        },
        capacidades: {
          fisica: Math.floor(ccf),
          real: Math.floor(ccr),
          efetiva: Math.floor(cce),
          recomendadaDiaria: Math.floor(cce)
        },
        visitacao: {
          atual: visitacaoAtual,
          utilizacao: utilizacao.toFixed(1) + '%',
          status: utilizacao > 100 ? 'Sobrecarga' :
                  utilizacao > 80 ? 'Próximo do limite' : 'Adequado'
        },
        recomendacoes: this._generateCapacityRecommendations(utilizacao)
      };
    } catch (error) {
      Utils.logError('EcoturismService.analyzeTrailCapacity', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise demográfica de visitantes
   */
  analyzeDemographics(periodo = 90) {
    try {
      const visitantes = DatabaseService.read(CONFIG.SHEETS.VISITANTES);

      if (!visitantes.success || visitantes.data.length === 0) {
        return { success: false, error: 'Sem dados de visitantes' };
      }

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - periodo);

      const dados = visitantes.data.filter(v => new Date(v.data) >= dataLimite);

      // Origem
      const porOrigem = {};
      dados.forEach(v => {
        const origem = v.origem || 'Não informado';
        porOrigem[origem] = (porOrigem[origem] || 0) + 1;
      });

      // Grupo
      const tamanhoGrupos = dados.map(v => parseFloat(v.tamanho_grupo) || 1);

      return {
        success: true,
        periodo: `${periodo} dias`,
        totalVisitantes: dados.length,
        porOrigem: Object.entries(porOrigem).map(([origem, qtd]) => ({
          origem,
          quantidade: qtd,
          percentual: ((qtd / dados.length) * 100).toFixed(1) + '%'
        })),
        grupos: {
          tamanhoMedio: Utils.average(tamanhoGrupos).toFixed(1),
          tamanhoMinimo: Math.min(...tamanhoGrupos),
          tamanhoMaximo: Math.max(...tamanhoGrupos)
        }
      };
    } catch (error) {
      Utils.logError('EcoturismService.analyzeDemographics', error);
      return { success: false, error: error.toString() };
    }
  },

  _generateCapacityRecommendations(utilizacao) {
    const rec = [];
    if (utilizacao > 100) {
      rec.push('URGENTE: Trilha em sobrecarga - limitar visitação');
      rec.push('Implementar sistema de agendamento obrigatório');
    } else if (utilizacao > 80) {
      rec.push('Trilha próxima do limite - monitorar de perto');
      rec.push('Considerar horários alternativos');
    } else if (utilizacao < 30) {
      rec.push('Baixa utilização - oportunidade de divulgação');
    } else {
      rec.push('Utilização adequada - manter monitoramento');
    }
    return rec;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAIL CONDITION REPORTING (Prompt 27/30)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Registra relatório de condição de trilha
   * @param {object} data - Dados do relatório
   * @returns {object} Resultado com ID do relatório
   */
  reportTrailCondition(data) {
    try {
      // Validações
      if (!data.trilha_id) {
        return { success: false, error: 'trilha_id é obrigatório' };
      }
      if (!data.tipo_problema || !TRAIL_ISSUE_TYPES[data.tipo_problema]) {
        return { success: false, error: 'tipo_problema inválido. Use: ' + Object.keys(TRAIL_ISSUE_TYPES).join(', ') };
      }
      if (!data.severidade || !SEVERITY_MULTIPLIER[data.severidade]) {
        return { success: false, error: 'severidade inválida. Use: Baixa, Media, Alta, Critica' };
      }
      if (!data.latitude || !data.longitude) {
        return { success: false, error: 'Coordenadas GPS (latitude, longitude) são obrigatórias' };
      }

      // Valida coordenadas
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return { success: false, error: 'Latitude inválida' };
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return { success: false, error: 'Longitude inválida' };
      }

      // Busca trilha
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: data.trilha_id });
      if (!trilha.success || trilha.data.length === 0) {
        return { success: false, error: 'Trilha não encontrada' };
      }
      const trilhaNome = trilha.data[0].nome || data.trilha_id;

      // Gera IDs
      const timestamp = new Date();
      const dateStr = Utilities.formatDate(timestamp, 'America/Sao_Paulo', 'yyyyMMdd');
      const reportId = `RT-${dateStr}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const taskId = `MT-${dateStr}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Calcula prioridade final (1 = mais urgente)
      const issueType = TRAIL_ISSUE_TYPES[data.tipo_problema];
      const prioridadeFinal = Math.max(1, Math.round(issueType.prioridade_base * SEVERITY_MULTIPLIER[data.severidade]));

      // Cria relatório
      const relatorio = {
        ID: reportId,
        Trilha_ID: data.trilha_id,
        Trilha_Nome: trilhaNome,
        Tipo_Problema: issueType.nome,
        Tipo_Codigo: data.tipo_problema,
        Severidade: data.severidade,
        Latitude: lat,
        Longitude: lng,
        Descricao: data.descricao || '',
        Foto_URL: data.foto_url || '',
        Reportado_Por: data.reportado_por || Session.getActiveUser().getEmail() || 'anonimo',
        Data_Reporte: timestamp,
        Status: 'Pendente'
      };

      // Salva relatório
      this._ensureSheet('RELATORIOS_TRILHA_RA', [
        'ID', 'Trilha_ID', 'Trilha_Nome', 'Tipo_Problema', 'Tipo_Codigo', 'Severidade',
        'Latitude', 'Longitude', 'Descricao', 'Foto_URL', 'Reportado_Por', 'Data_Reporte', 'Status'
      ]);
      
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetRelatorios = ss.getSheetByName('RELATORIOS_TRILHA_RA');
      sheetRelatorios.appendRow([
        relatorio.ID, relatorio.Trilha_ID, relatorio.Trilha_Nome, relatorio.Tipo_Problema,
        relatorio.Tipo_Codigo, relatorio.Severidade, relatorio.Latitude, relatorio.Longitude,
        relatorio.Descricao, relatorio.Foto_URL, relatorio.Reportado_Por, relatorio.Data_Reporte,
        relatorio.Status
      ]);

      // Cria tarefa de manutenção
      const tarefa = {
        ID: taskId,
        Relatorio_ID: reportId,
        Trilha_ID: data.trilha_id,
        Trilha_Nome: trilhaNome,
        Tipo_Problema: issueType.nome,
        Prioridade: prioridadeFinal,
        Status: 'Pendente',
        Atribuido_Para: '',
        Data_Criacao: timestamp,
        Data_Conclusao: '',
        Notas: ''
      };

      this._ensureSheet('MANUTENCAO_TRILHA_RA', [
        'ID', 'Relatorio_ID', 'Trilha_ID', 'Trilha_Nome', 'Tipo_Problema', 'Prioridade',
        'Status', 'Atribuido_Para', 'Data_Criacao', 'Data_Conclusao', 'Notas'
      ]);

      const sheetManutencao = ss.getSheetByName('MANUTENCAO_TRILHA_RA');
      sheetManutencao.appendRow([
        tarefa.ID, tarefa.Relatorio_ID, tarefa.Trilha_ID, tarefa.Trilha_Nome,
        tarefa.Tipo_Problema, tarefa.Prioridade, tarefa.Status, tarefa.Atribuido_Para,
        tarefa.Data_Criacao, tarefa.Data_Conclusao, tarefa.Notas
      ]);

      // Se severidade crítica, atualiza status da trilha e cria alerta
      let alertCreated = null;
      if (data.severidade === 'Critica') {
        // Atualiza status da trilha para Manutenção
        this._updateTrailStatus(data.trilha_id, 'Manutencao');

        // Cria alerta no EcologicalAlertSystem
        if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
          alertCreated = EcologicalAlertSystem.createAlert({
            tipo: 'Infraestrutura',
            severidade: 8,
            titulo: `Problema Crítico na Trilha: ${trilhaNome}`,
            descricao: `${issueType.nome} - ${data.descricao || issueType.descricao}`,
            latitude: lat,
            longitude: lng,
            zona: trilhaNome,
            recomendacoes: ['Interditar trilha imediatamente', 'Enviar equipe de manutenção', 'Notificar visitantes']
          });
        }
      }

      return {
        success: true,
        relatorio_id: reportId,
        tarefa_id: taskId,
        prioridade: prioridadeFinal,
        trilha_status_atualizado: data.severidade === 'Critica',
        alerta_criado: alertCreated ? alertCreated.success : false,
        mensagem: `Relatório ${reportId} criado com sucesso. Tarefa de manutenção ${taskId} gerada.`
      };

    } catch (error) {
      Utils.logError('EcoturismService.reportTrailCondition', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém fila de manutenção
   * @param {object} filters - Filtros opcionais
   * @returns {object} Lista de tarefas
   */
  getMaintenanceQueue(filters = {}) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('MANUTENCAO_TRILHA_RA');
      
      if (!sheet) {
        return { success: true, data: [], total: 0 };
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, data: [], total: 0 };
      }

      const headers = data[0];
      let tarefas = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });

      // Aplica filtros
      if (filters.status) {
        tarefas = tarefas.filter(t => t.Status === filters.status);
      }
      if (filters.trilha_id) {
        tarefas = tarefas.filter(t => t.Trilha_ID === filters.trilha_id);
      }
      if (filters.prioridade_max) {
        tarefas = tarefas.filter(t => t.Prioridade <= filters.prioridade_max);
      }

      // Ordena por prioridade (menor = mais urgente) e data
      tarefas.sort((a, b) => {
        if (a.Prioridade !== b.Prioridade) {
          return a.Prioridade - b.Prioridade;
        }
        return new Date(b.Data_Criacao) - new Date(a.Data_Criacao);
      });

      return {
        success: true,
        data: tarefas,
        total: tarefas.length,
        filtros_aplicados: filters
      };

    } catch (error) {
      Utils.logError('EcoturismService.getMaintenanceQueue', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Atualiza status de tarefa de manutenção
   * @param {string} taskId - ID da tarefa
   * @param {object} updates - Atualizações
   * @returns {object} Resultado
   */
  updateMaintenanceTask(taskId, updates) {
    try {
      if (!taskId) {
        return { success: false, error: 'taskId é obrigatório' };
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('MANUTENCAO_TRILHA_RA');
      
      if (!sheet) {
        return { success: false, error: 'Planilha de manutenção não encontrada' };
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('ID');
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === taskId) {
          rowIndex = i + 1; // +1 porque sheet é 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        return { success: false, error: 'Tarefa não encontrada' };
      }

      // Atualiza campos permitidos
      const allowedFields = ['Status', 'Atribuido_Para', 'Notas', 'Data_Conclusao'];
      const updatedFields = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          const colIndex = headers.indexOf(field);
          if (colIndex !== -1) {
            sheet.getRange(rowIndex, colIndex + 1).setValue(updates[field]);
            updatedFields.push(field);
          }
        }
      }

      // Se status mudou para Concluído, atualiza data de conclusão
      if (updates.Status === 'Concluido' && !updates.Data_Conclusao) {
        const colIndex = headers.indexOf('Data_Conclusao');
        if (colIndex !== -1) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(new Date());
          updatedFields.push('Data_Conclusao');
        }

        // Atualiza relatório original
        const relatorioIdCol = headers.indexOf('Relatorio_ID');
        const relatorioId = data[rowIndex - 1][relatorioIdCol];
        this._updateReportStatus(relatorioId, 'Resolvido');

        // Verifica se pode restaurar status da trilha
        const trilhaIdCol = headers.indexOf('Trilha_ID');
        const trilhaId = data[rowIndex - 1][trilhaIdCol];
        this._checkAndRestoreTrailStatus(trilhaId);
      }

      return {
        success: true,
        tarefa_id: taskId,
        campos_atualizados: updatedFields,
        mensagem: `Tarefa ${taskId} atualizada com sucesso`
      };

    } catch (error) {
      Utils.logError('EcoturismService.updateMaintenanceTask', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém histórico de relatórios de uma trilha
   * @param {string} trilhaId - ID da trilha
   * @returns {object} Histórico de relatórios
   */
  getTrailReportHistory(trilhaId) {
    try {
      if (!trilhaId) {
        return { success: false, error: 'trilhaId é obrigatório' };
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('RELATORIOS_TRILHA_RA');
      
      if (!sheet) {
        return { success: true, data: [], total: 0 };
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, data: [], total: 0 };
      }

      const headers = data[0];
      const trilhaIdCol = headers.indexOf('Trilha_ID');
      
      const relatorios = data.slice(1)
        .filter(row => row[trilhaIdCol] === trilhaId)
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        })
        .sort((a, b) => new Date(b.Data_Reporte) - new Date(a.Data_Reporte));

      // Estatísticas
      const stats = {
        total: relatorios.length,
        pendentes: relatorios.filter(r => r.Status === 'Pendente').length,
        resolvidos: relatorios.filter(r => r.Status === 'Resolvido').length,
        por_tipo: {},
        por_severidade: {}
      };

      relatorios.forEach(r => {
        stats.por_tipo[r.Tipo_Problema] = (stats.por_tipo[r.Tipo_Problema] || 0) + 1;
        stats.por_severidade[r.Severidade] = (stats.por_severidade[r.Severidade] || 0) + 1;
      });

      return {
        success: true,
        trilha_id: trilhaId,
        data: relatorios,
        estatisticas: stats
      };

    } catch (error) {
      Utils.logError('EcoturismService.getTrailReportHistory', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Retorna tipos de problemas disponíveis
   * @returns {object} Lista de tipos
   */
  getIssueTypes() {
    return {
      success: true,
      tipos: Object.entries(TRAIL_ISSUE_TYPES).map(([codigo, info]) => ({
        codigo,
        nome: info.nome,
        descricao: info.descricao,
        prioridade_base: info.prioridade_base
      })),
      severidades: Object.keys(SEVERITY_MULTIPLIER)
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VISITOR GROUP MANAGEMENT (Prompt 28/30)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Registra check-in de grupo de visitantes
   * @param {object} data - Dados do check-in
   * @returns {object} Resultado com ID da visita
   */
  checkInGroup(data) {
    try {
      // Validações
      if (!data.trilha_id) {
        return { success: false, error: 'trilha_id é obrigatório' };
      }
      if (!data.num_pessoas || data.num_pessoas < 1) {
        return { success: false, error: 'num_pessoas deve ser >= 1' };
      }

      // Busca trilha
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: data.trilha_id });
      if (!trilha.success || trilha.data.length === 0) {
        return { success: false, error: 'Trilha não encontrada' };
      }
      const trilhaNome = trilha.data[0].nome || data.trilha_id;

      // Verifica capacidade
      const capacidade = this.analyzeTrailCapacity(data.trilha_id);
      let capacityWarning = null;
      if (capacidade.success) {
        const ocupacaoAtual = capacidade.visitacao.atual || 0;
        const cce = capacidade.capacidades.efetiva || 100;
        const novaOcupacao = ((ocupacaoAtual + data.num_pessoas) / cce) * 100;
        
        if (novaOcupacao > 100) {
          return { 
            success: false, 
            error: `Capacidade excedida. CCE: ${cce}, Atual: ${ocupacaoAtual}, Solicitado: ${data.num_pessoas}` 
          };
        }
        if (novaOcupacao > 80) {
          capacityWarning = `Atenção: Trilha próxima do limite (${novaOcupacao.toFixed(1)}% da CCE)`;
        }
      }

      // Gera ID
      const timestamp = new Date();
      const dateStr = Utilities.formatDate(timestamp, 'America/Sao_Paulo', 'yyyyMMdd');
      const visitId = `VA-${dateStr}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Valida perfil do grupo
      const perfil = GROUP_PROFILES.includes(data.perfil_grupo) ? data.perfil_grupo : 'Outro';

      // Cria registro de visita
      const visita = {
        ID: visitId,
        Trilha_ID: data.trilha_id,
        Trilha_Nome: trilhaNome,
        Guia_ID: data.guia_id || '',
        Num_Pessoas: data.num_pessoas,
        Perfil_Grupo: perfil,
        Duracao_Esperada_Horas: data.duracao_esperada || 2,
        Data_CheckIn: timestamp,
        Data_CheckOut: '',
        Status: 'Ativa'
      };

      // Salva visita
      this._ensureSheet('VISITAS_ATIVAS_RA', [
        'ID', 'Trilha_ID', 'Trilha_Nome', 'Guia_ID', 'Num_Pessoas', 'Perfil_Grupo',
        'Duracao_Esperada_Horas', 'Data_CheckIn', 'Data_CheckOut', 'Status'
      ]);

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      sheet.appendRow([
        visita.ID, visita.Trilha_ID, visita.Trilha_Nome, visita.Guia_ID,
        visita.Num_Pessoas, visita.Perfil_Grupo, visita.Duracao_Esperada_Horas,
        visita.Data_CheckIn, visita.Data_CheckOut, visita.Status
      ]);

      return {
        success: true,
        visita_id: visitId,
        trilha: trilhaNome,
        num_pessoas: data.num_pessoas,
        perfil: perfil,
        duracao_esperada: visita.Duracao_Esperada_Horas,
        aviso_capacidade: capacityWarning,
        mensagem: `Check-in realizado com sucesso. ID: ${visitId}`
      };

    } catch (error) {
      Utils.logError('EcoturismService.checkInGroup', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Registra check-out de grupo de visitantes
   * @param {string} visitId - ID da visita
   * @returns {object} Resultado do check-out
   */
  checkOutGroup(visitId) {
    try {
      if (!visitId) {
        return { success: false, error: 'visitId é obrigatório' };
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      
      if (!sheet) {
        return { success: false, error: 'Planilha de visitas não encontrada' };
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('ID');
      const statusCol = headers.indexOf('Status');
      const checkOutCol = headers.indexOf('Data_CheckOut');
      const checkInCol = headers.indexOf('Data_CheckIn');

      let rowIndex = -1;
      let visitData = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === visitId) {
          rowIndex = i + 1;
          visitData = {};
          headers.forEach((h, idx) => visitData[h] = data[i][idx]);
          break;
        }
      }

      if (rowIndex === -1) {
        return { success: false, error: 'Visita não encontrada' };
      }

      if (visitData.Status !== 'Ativa') {
        return { success: false, error: `Visita já finalizada. Status: ${visitData.Status}` };
      }

      // Atualiza check-out
      const checkOutTime = new Date();
      sheet.getRange(rowIndex, checkOutCol + 1).setValue(checkOutTime);
      sheet.getRange(rowIndex, statusCol + 1).setValue('Concluida');

      // Calcula duração real
      const checkInTime = new Date(visitData.Data_CheckIn);
      const duracaoReal = (checkOutTime - checkInTime) / (1000 * 60 * 60); // em horas

      return {
        success: true,
        visita_id: visitId,
        trilha: visitData.Trilha_Nome,
        num_pessoas: visitData.Num_Pessoas,
        duracao_esperada_horas: visitData.Duracao_Esperada_Horas,
        duracao_real_horas: duracaoReal.toFixed(2),
        check_in: checkInTime,
        check_out: checkOutTime,
        mensagem: `Check-out realizado com sucesso`
      };

    } catch (error) {
      Utils.logError('EcoturismService.checkOutGroup', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Registra incidente com visitantes
   * @param {object} data - Dados do incidente
   * @returns {object} Resultado com ID do incidente
   */
  reportIncident(data) {
    try {
      // Validações
      if (!data.tipo_incidente || !INCIDENT_TYPES[data.tipo_incidente]) {
        return { success: false, error: 'tipo_incidente inválido. Use: ' + Object.keys(INCIDENT_TYPES).join(', ') };
      }
      if (!data.trilha_id) {
        return { success: false, error: 'trilha_id é obrigatório' };
      }

      const incidentType = INCIDENT_TYPES[data.tipo_incidente];
      const severidade = data.severidade || incidentType.severidade_padrao;

      // Valida severidade
      if (!['Baixa', 'Media', 'Alta', 'Critica'].includes(severidade)) {
        return { success: false, error: 'severidade inválida. Use: Baixa, Media, Alta, Critica' };
      }

      // Busca trilha
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: data.trilha_id });
      const trilhaNome = (trilha.success && trilha.data.length > 0) ? trilha.data[0].nome : data.trilha_id;

      // Gera ID
      const timestamp = new Date();
      const dateStr = Utilities.formatDate(timestamp, 'America/Sao_Paulo', 'yyyyMMdd');
      const incidentId = `IV-${dateStr}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Coordenadas
      const lat = parseFloat(data.latitude) || 0;
      const lng = parseFloat(data.longitude) || 0;

      // Cria registro de incidente
      const incidente = {
        ID: incidentId,
        Visita_ID: data.visita_id || '',
        Trilha_ID: data.trilha_id,
        Trilha_Nome: trilhaNome,
        Tipo_Incidente: incidentType.nome,
        Tipo_Codigo: data.tipo_incidente,
        Severidade: severidade,
        Latitude: lat,
        Longitude: lng,
        Descricao: data.descricao || '',
        Pessoas_Afetadas: data.pessoas_afetadas || 1,
        Reportado_Por: data.reportado_por || Session.getActiveUser().getEmail() || 'anonimo',
        Data_Incidente: timestamp,
        Alerta_ID: '',
        Status: 'Aberto'
      };

      // Salva incidente
      this._ensureSheet('INCIDENTES_VISITANTES_RA', [
        'ID', 'Visita_ID', 'Trilha_ID', 'Trilha_Nome', 'Tipo_Incidente', 'Tipo_Codigo',
        'Severidade', 'Latitude', 'Longitude', 'Descricao', 'Pessoas_Afetadas',
        'Reportado_Por', 'Data_Incidente', 'Alerta_ID', 'Status'
      ]);

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('INCIDENTES_VISITANTES_RA');

      // Cria alerta para incidentes Alta/Crítica
      let alertCreated = null;
      if (severidade === 'Alta' || severidade === 'Critica') {
        if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
          const severidadeScore = severidade === 'Critica' ? 10 : 8;
          alertCreated = EcologicalAlertSystem.createAlert({
            tipo: 'Seguranca_Visitante',
            severidade: severidadeScore,
            titulo: `INCIDENTE: ${incidentType.nome} na ${trilhaNome}`,
            descricao: `${data.descricao || incidentType.nome}. Pessoas afetadas: ${incidente.Pessoas_Afetadas}`,
            latitude: lat,
            longitude: lng,
            zona: trilhaNome,
            urgencia: incidentType.urgencia,
            recomendacoes: this._getIncidentRecommendations(data.tipo_incidente, severidade)
          });

          if (alertCreated && alertCreated.success) {
            incidente.Alerta_ID = alertCreated.alertId || '';
          }
        }

        // Atualiza status da visita se vinculada
        if (data.visita_id) {
          this._updateVisitStatus(data.visita_id, 'Emergencia');
        }
      }

      // Salva no sheet
      sheet.appendRow([
        incidente.ID, incidente.Visita_ID, incidente.Trilha_ID, incidente.Trilha_Nome,
        incidente.Tipo_Incidente, incidente.Tipo_Codigo, incidente.Severidade,
        incidente.Latitude, incidente.Longitude, incidente.Descricao,
        incidente.Pessoas_Afetadas, incidente.Reportado_Por, incidente.Data_Incidente,
        incidente.Alerta_ID, incidente.Status
      ]);

      return {
        success: true,
        incidente_id: incidentId,
        tipo: incidentType.nome,
        severidade: severidade,
        trilha: trilhaNome,
        alerta_criado: alertCreated ? alertCreated.success : false,
        alerta_id: incidente.Alerta_ID,
        urgencia: incidentType.urgencia,
        mensagem: severidade === 'Critica' || severidade === 'Alta' 
          ? `URGENTE: Incidente ${incidentId} registrado. Alerta enviado.`
          : `Incidente ${incidentId} registrado com sucesso.`
      };

    } catch (error) {
      Utils.logError('EcoturismService.reportIncident', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém visitas ativas em uma trilha
   * @param {string} trilhaId - ID da trilha (opcional, retorna todas se não informado)
   * @returns {object} Lista de visitas ativas e status de capacidade
   */
  getActiveVisits(trilhaId) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      
      if (!sheet) {
        return { success: true, data: [], total: 0, ocupacao_atual: 0 };
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, data: [], total: 0, ocupacao_atual: 0 };
      }

      const headers = data[0];
      let visitas = data.slice(1)
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        })
        .filter(v => v.Status === 'Ativa');

      // Filtra por trilha se informado
      if (trilhaId) {
        visitas = visitas.filter(v => v.Trilha_ID === trilhaId);
      }

      // Calcula ocupação
      const ocupacaoAtual = visitas.reduce((sum, v) => sum + (parseInt(v.Num_Pessoas) || 0), 0);

      // Verifica capacidade se trilha específica
      let capacidadeInfo = null;
      if (trilhaId) {
        const capacidade = this.analyzeTrailCapacity(trilhaId);
        if (capacidade.success) {
          const cce = capacidade.capacidades.efetiva || 100;
          const utilizacao = (ocupacaoAtual / cce) * 100;
          capacidadeInfo = {
            cce: cce,
            ocupacao_atual: ocupacaoAtual,
            utilizacao_percentual: utilizacao.toFixed(1) + '%',
            status: utilizacao > 100 ? 'Sobrecarga' : utilizacao > 80 ? 'Próximo do limite' : 'Adequado'
          };
        }
      }

      return {
        success: true,
        data: visitas,
        total_visitas: visitas.length,
        ocupacao_atual: ocupacaoAtual,
        capacidade: capacidadeInfo
      };

    } catch (error) {
      Utils.logError('EcoturismService.getActiveVisits', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Retorna tipos de incidentes disponíveis
   * @returns {object} Lista de tipos
   */
  getIncidentTypes() {
    return {
      success: true,
      tipos: Object.entries(INCIDENT_TYPES).map(([codigo, info]) => ({
        codigo,
        nome: info.nome,
        severidade_padrao: info.severidade_padrao,
        urgencia: info.urgencia
      })),
      perfis_grupo: GROUP_PROFILES,
      severidades: ['Baixa', 'Media', 'Alta', 'Critica']
    };
  },

  /**
   * Gera recomendações para incidentes
   */
  _getIncidentRecommendations(tipoIncidente, severidade) {
    const recomendacoes = {
      FERIMENTO_GRAVE: ['Acionar SAMU/Resgate imediatamente', 'Não mover a vítima', 'Manter vias aéreas livres', 'Aplicar primeiros socorros'],
      EXTRAVIO: ['Iniciar busca imediata', 'Contatar brigada de resgate', 'Verificar último ponto de contato', 'Alertar todas as equipes de campo'],
      ANIMAL_PERIGOSO: ['Evacuar área imediatamente', 'Manter distância segura', 'Alertar outros visitantes', 'Contatar equipe de manejo de fauna'],
      CLIMA_ADVERSO: ['Buscar abrigo seguro', 'Evacuar áreas de risco', 'Monitorar condições', 'Suspender atividades se necessário'],
      FERIMENTO_LEVE: ['Aplicar primeiros socorros', 'Avaliar necessidade de atendimento médico', 'Documentar ocorrência'],
      MAL_ESTAR: ['Oferecer água e descanso', 'Avaliar sinais vitais', 'Considerar evacuação se necessário'],
      QUEDA: ['Verificar lesões', 'Imobilizar se necessário', 'Avaliar necessidade de resgate'],
      DESIDRATACAO: ['Oferecer hidratação', 'Buscar sombra', 'Monitorar estado'],
      PICADA_INSETO: ['Limpar área afetada', 'Observar reações alérgicas', 'Aplicar gelo se necessário'],
      OUTRO: ['Avaliar situação', 'Documentar ocorrência', 'Tomar medidas apropriadas']
    };

    return recomendacoes[tipoIncidente] || recomendacoes.OUTRO;
  },

  /**
   * Atualiza status de uma visita
   */
  _updateVisitStatus(visitId, novoStatus) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      if (!sheet) return false;

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('ID');
      const statusCol = headers.indexOf('Status');

      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === visitId) {
          sheet.getRange(i + 1, statusCol + 1).setValue(novoStatus);
          return true;
        }
      }
      return false;
    } catch (e) {
      Logger.log(`Erro ao atualizar status da visita: ${e}`);
      return false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Garante que a planilha existe com os headers corretos
   */
  _ensureSheet(sheetName, headers) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  },

  /**
   * Atualiza status da trilha
   */
  _updateTrailStatus(trilhaId, novoStatus) {
    try {
      const result = DatabaseService.update(CONFIG.SHEETS.TRILHAS, trilhaId, { status: novoStatus });
      return result.success;
    } catch (e) {
      Logger.log(`Erro ao atualizar status da trilha: ${e}`);
      return false;
    }
  },

  /**
   * Atualiza status do relatório
   */
  _updateReportStatus(relatorioId, novoStatus) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('RELATORIOS_TRILHA_RA');
      if (!sheet) return false;

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('ID');
      const statusCol = headers.indexOf('Status');

      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === relatorioId) {
          sheet.getRange(i + 1, statusCol + 1).setValue(novoStatus);
          return true;
        }
      }
      return false;
    } catch (e) {
      Logger.log(`Erro ao atualizar status do relatório: ${e}`);
      return false;
    }
  },

  /**
   * Verifica se pode restaurar status da trilha (sem tarefas críticas pendentes)
   */
  _checkAndRestoreTrailStatus(trilhaId) {
    try {
      const queue = this.getMaintenanceQueue({ trilha_id: trilhaId, status: 'Pendente' });
      if (queue.success && queue.data.length === 0) {
        // Sem tarefas pendentes, restaura status
        this._updateTrailStatus(trilhaId, 'Ativa');
        return true;
      }
      return false;
    } catch (e) {
      Logger.log(`Erro ao verificar status da trilha: ${e}`);
      return false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUIDED TOUR LOGISTICS (Prompt 30/30)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtém programação diária do guia
   * @param {string} guiaId - ID do guia
   * @param {Date|string} data - Data para consulta (default: hoje)
   * @returns {object} Programação com detalhes dos grupos
   */
  getGuideSchedule(guiaId, data) {
    try {
      if (!guiaId) {
        return { success: false, error: 'guiaId é obrigatório' };
      }

      const targetDate = data ? new Date(data) : new Date();
      const dateStr = Utilities.formatDate(targetDate, 'America/Sao_Paulo', 'yyyy-MM-dd');

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      
      if (!sheet) {
        return { success: true, data: [], total: 0, data_consulta: dateStr };
      }

      const sheetData = sheet.getDataRange().getValues();
      if (sheetData.length <= 1) {
        return { success: true, data: [], total: 0, data_consulta: dateStr };
      }

      const headers = sheetData[0];
      const guiaIdCol = headers.indexOf('Guia_ID');
      const checkInCol = headers.indexOf('Data_CheckIn');

      // Filtra visitas do guia na data especificada
      const visitas = sheetData.slice(1)
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i]);
          return obj;
        })
        .filter(v => {
          if (v.Guia_ID !== guiaId) return false;
          const visitDate = new Date(v.Data_CheckIn);
          const visitDateStr = Utilities.formatDate(visitDate, 'America/Sao_Paulo', 'yyyy-MM-dd');
          return visitDateStr === dateStr;
        })
        .map(v => {
          // Enriquece com análise de perfil
          const profileAnalysis = this.analyzeGroupProfile(v.Perfil_Grupo, v.Num_Pessoas);
          return {
            ...v,
            analise_perfil: profileAnalysis.success ? profileAnalysis : null
          };
        })
        .sort((a, b) => new Date(a.Data_CheckIn) - new Date(b.Data_CheckIn));

      // Estatísticas do dia
      const totalPessoas = visitas.reduce((sum, v) => sum + (parseInt(v.Num_Pessoas) || 0), 0);
      const perfisPorTipo = {};
      visitas.forEach(v => {
        perfisPorTipo[v.Perfil_Grupo] = (perfisPorTipo[v.Perfil_Grupo] || 0) + 1;
      });

      return {
        success: true,
        guia_id: guiaId,
        data_consulta: dateStr,
        data: visitas,
        total_tours: visitas.length,
        total_pessoas: totalPessoas,
        perfis_por_tipo: perfisPorTipo
      };

    } catch (error) {
      Utils.logError('EcoturismService.getGuideSchedule', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Analisa perfil do grupo e retorna recomendações
   * @param {string} perfilGrupo - Tipo de perfil
   * @param {number} numPessoas - Número de pessoas
   * @returns {object} Análise com recomendações
   */
  analyzeGroupProfile(perfilGrupo, numPessoas) {
    try {
      const config = GROUP_PROFILE_CONFIG[perfilGrupo] || GROUP_PROFILE_CONFIG['Outro'];
      const num = parseInt(numPessoas) || 1;

      // Considerações especiais por perfil
      const consideracoes = [];
      const equipamentos = ['Kit primeiros socorros', 'Água extra'];

      switch (perfilGrupo) {
        case 'Idosos':
          consideracoes.push('Ritmo mais lento com paradas frequentes');
          consideracoes.push('Evitar exposição prolongada ao sol');
          consideracoes.push('Verificar condições de saúde antes de iniciar');
          equipamentos.push('Cadeira dobrável para descanso');
          break;
        case 'Grupo Escolar':
          consideracoes.push('Manter grupo unido e fazer contagens frequentes');
          consideracoes.push('Atividades educativas em pontos de interesse');
          consideracoes.push('Verificar autorizações e contatos de emergência');
          equipamentos.push('Apito para sinalização');
          break;
        case 'Família':
          consideracoes.push('Adaptar ritmo ao membro mais lento');
          consideracoes.push('Pontos de interesse para crianças');
          equipamentos.push('Lanches extras');
          break;
        case 'Atletas':
          consideracoes.push('Pode manter ritmo acelerado');
          consideracoes.push('Trilhas desafiadoras são bem-vindas');
          break;
        case 'Pesquisadores':
          consideracoes.push('Tempo extra para observações e coleta');
          consideracoes.push('Flexibilidade no roteiro');
          break;
      }

      // Ajuste por tamanho do grupo
      if (num > 10) {
        consideracoes.push('Grupo grande: considerar divisão em subgrupos');
        consideracoes.push('Comunicação clara sobre pontos de encontro');
      }

      return {
        success: true,
        perfil: perfilGrupo,
        num_pessoas: num,
        configuracao: {
          ritmo: config.ritmo,
          dificuldade_maxima: config.dificuldade_max,
          paradas_descanso: config.descansos,
          multiplicador_duracao: config.duracao_mult
        },
        consideracoes_especiais: consideracoes,
        equipamentos_recomendados: equipamentos
      };

    } catch (error) {
      Utils.logError('EcoturismService.analyzeGroupProfile', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém recomendações de trilhas para um grupo
   * @param {string} perfilGrupo - Tipo de perfil
   * @param {number} numPessoas - Número de pessoas
   * @param {number} duracaoDisponivel - Horas disponíveis (opcional)
   * @returns {object} Lista de trilhas recomendadas
   */
  getTrailRecommendations(perfilGrupo, numPessoas, duracaoDisponivel) {
    try {
      const config = GROUP_PROFILE_CONFIG[perfilGrupo] || GROUP_PROFILE_CONFIG['Outro'];
      const maxDificuldade = DIFFICULTY_LEVELS[config.dificuldade_max] || DIFFICULTY_LEVELS['Media'];

      // Busca todas as trilhas
      const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
      if (!trilhas.success || trilhas.data.length === 0) {
        return { success: false, error: 'Nenhuma trilha encontrada' };
      }

      // Filtra e pontua trilhas
      const recomendacoes = trilhas.data
        .map(t => {
          const dificuldade = DIFFICULTY_LEVELS[t.dificuldade] || DIFFICULTY_LEVELS['Media'];
          const duracaoBase = parseFloat(t.tempo_visita_horas) || 2;
          const duracaoEstimada = duracaoBase * config.duracao_mult;

          // Verifica compatibilidade
          const compativel = dificuldade.ordem <= maxDificuldade.ordem;
          const dentroTempo = !duracaoDisponivel || duracaoEstimada <= duracaoDisponivel;

          // Calcula pontuação (maior = melhor)
          let pontuacao = 100;
          if (!compativel) pontuacao -= 50;
          if (!dentroTempo) pontuacao -= 30;
          if (dificuldade.ordem === maxDificuldade.ordem) pontuacao += 10; // Desafio adequado

          // Verifica capacidade atual
          const capacidade = this.analyzeTrailCapacity(t.id);
          let statusCapacidade = 'Disponível';
          if (capacidade.success) {
            const utilizacao = parseFloat(capacidade.visitacao.utilizacao) || 0;
            if (utilizacao > 80) {
              pontuacao -= 20;
              statusCapacidade = 'Próximo do limite';
            }
            if (utilizacao > 100) {
              pontuacao -= 40;
              statusCapacidade = 'Lotada';
            }
          }

          return {
            id: t.id,
            nome: t.nome,
            dificuldade: t.dificuldade,
            distancia_km: t.distancia_km,
            duracao_base_horas: duracaoBase,
            duracao_estimada_horas: duracaoEstimada.toFixed(1),
            compativel: compativel,
            dentro_tempo: dentroTempo,
            status_capacidade: statusCapacidade,
            pontuacao: pontuacao,
            recomendado: compativel && dentroTempo && pontuacao >= 60
          };
        })
        .sort((a, b) => b.pontuacao - a.pontuacao);

      return {
        success: true,
        perfil: perfilGrupo,
        num_pessoas: numPessoas,
        duracao_disponivel: duracaoDisponivel || 'Sem limite',
        recomendacoes: recomendacoes.filter(r => r.recomendado),
        outras_opcoes: recomendacoes.filter(r => !r.recomendado).slice(0, 3)
      };

    } catch (error) {
      Utils.logError('EcoturismService.getTrailRecommendations', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera plano completo de tour
   * @param {string} visitaId - ID da visita
   * @returns {object} Plano detalhado do tour
   */
  generateTourPlan(visitaId) {
    try {
      if (!visitaId) {
        return { success: false, error: 'visitaId é obrigatório' };
      }

      // Busca dados da visita
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('VISITAS_ATIVAS_RA');
      
      if (!sheet) {
        return { success: false, error: 'Planilha de visitas não encontrada' };
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('ID');

      let visita = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === visitaId) {
          visita = {};
          headers.forEach((h, idx) => visita[h] = data[i][idx]);
          break;
        }
      }

      if (!visita) {
        return { success: false, error: 'Visita não encontrada' };
      }

      // Análise do perfil
      const profileAnalysis = this.analyzeGroupProfile(visita.Perfil_Grupo, visita.Num_Pessoas);

      // Busca dados da trilha
      const trilha = DatabaseService.read(CONFIG.SHEETS.TRILHAS, { id: visita.Trilha_ID });
      const trilhaData = (trilha.success && trilha.data.length > 0) ? trilha.data[0] : null;

      // Calcula duração realista
      const config = GROUP_PROFILE_CONFIG[visita.Perfil_Grupo] || GROUP_PROFILE_CONFIG['Outro'];
      const duracaoBase = trilhaData ? (parseFloat(trilhaData.tempo_visita_horas) || 2) : 2;
      const duracaoRealista = duracaoBase * config.duracao_mult;

      // Gera pontos de parada
      const paradasDescanso = [];
      const numParadas = config.descansos;
      if (numParadas > 0 && trilhaData) {
        const intervalo = 100 / (numParadas + 1);
        for (let i = 1; i <= numParadas; i++) {
          paradasDescanso.push({
            ponto: `${Math.round(intervalo * i)}% do percurso`,
            duracao_minutos: 10,
            atividade: i === Math.ceil(numParadas / 2) ? 'Parada principal (hidratação e lanche)' : 'Parada breve (hidratação)'
          });
        }
      }

      // Verifica compatibilidade trilha-grupo
      const dificuldadeTrilha = trilhaData ? trilhaData.dificuldade : 'Media';
      const maxDificuldade = config.dificuldade_max;
      const dificuldadeOrdem = DIFFICULTY_LEVELS[dificuldadeTrilha]?.ordem || 2;
      const maxOrdem = DIFFICULTY_LEVELS[maxDificuldade]?.ordem || 2;
      const compativel = dificuldadeOrdem <= maxOrdem;

      // Alertas de segurança
      const alertas = [];
      if (!compativel) {
        alertas.push({
          tipo: 'INCOMPATIBILIDADE',
          mensagem: `Trilha ${dificuldadeTrilha} pode ser desafiadora para perfil ${visita.Perfil_Grupo}`,
          acao: 'Considerar trilha alternativa ou reforçar acompanhamento'
        });
      }
      if (visita.Num_Pessoas > 15) {
        alertas.push({
          tipo: 'GRUPO_GRANDE',
          mensagem: 'Grupo com mais de 15 pessoas',
          acao: 'Considerar divisão em subgrupos com guias auxiliares'
        });
      }

      return {
        success: true,
        visita_id: visitaId,
        visita: {
          trilha: visita.Trilha_Nome,
          trilha_id: visita.Trilha_ID,
          perfil: visita.Perfil_Grupo,
          num_pessoas: visita.Num_Pessoas,
          check_in: visita.Data_CheckIn
        },
        trilha: trilhaData ? {
          nome: trilhaData.nome,
          dificuldade: trilhaData.dificuldade,
          distancia_km: trilhaData.distancia_km,
          duracao_base: duracaoBase
        } : null,
        plano: {
          duracao_estimada_horas: duracaoRealista.toFixed(1),
          ritmo_recomendado: config.ritmo,
          paradas_descanso: paradasDescanso,
          compatibilidade: compativel ? 'Adequada' : 'Atenção necessária'
        },
        analise_perfil: profileAnalysis.success ? profileAnalysis : null,
        alertas: alertas,
        dicas: [
          'Verificar condições climáticas antes de iniciar',
          'Confirmar que todos têm água suficiente',
          'Informar pontos de referência e procedimentos de emergência',
          'Manter contato visual com todos os participantes'
        ]
      };

    } catch (error) {
      Utils.logError('EcoturismService.generateTourPlan', error);
      return { success: false, error: error.toString() };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Trail Condition Reporting (Prompt 27/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Registra relatório de condição de trilha
 * @param {object} data - { trilha_id, tipo_problema, severidade, latitude, longitude, descricao?, foto_url? }
 * @returns {object} Resultado com IDs do relatório e tarefa
 */
function apiTrilhasReportCondition(data) {
  return EcoturismService.reportTrailCondition(data);
}

/**
 * API: Obtém fila de manutenção
 * @param {object} filters - { status?, trilha_id?, prioridade_max? }
 * @returns {object} Lista de tarefas ordenadas por prioridade
 */
function apiTrilhasGetMaintenanceQueue(filters) {
  return EcoturismService.getMaintenanceQueue(filters || {});
}

/**
 * API: Atualiza status de tarefa de manutenção
 * @param {string} taskId - ID da tarefa
 * @param {object} updates - { Status?, Atribuido_Para?, Notas? }
 * @returns {object} Resultado da atualização
 */
function apiTrilhasUpdateTaskStatus(taskId, updates) {
  return EcoturismService.updateMaintenanceTask(taskId, updates);
}

/**
 * API: Obtém histórico de relatórios de uma trilha
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Histórico com estatísticas
 */
function apiTrilhasGetReportHistory(trilhaId) {
  return EcoturismService.getTrailReportHistory(trilhaId);
}

/**
 * API: Retorna tipos de problemas disponíveis
 * @returns {object} Lista de tipos e severidades
 */
function apiTrilhasGetIssueTypes() {
  return EcoturismService.getIssueTypes();
}

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Visitor Group Management (Prompt 28/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Registra check-in de grupo de visitantes
 * @param {object} data - { trilha_id, num_pessoas, perfil_grupo?, guia_id?, duracao_esperada? }
 * @returns {object} Resultado com ID da visita
 */
function apiVisitantesCheckIn(data) {
  return EcoturismService.checkInGroup(data);
}

/**
 * API: Registra check-out de grupo de visitantes
 * @param {string} visitId - ID da visita
 * @returns {object} Resultado do check-out com duração
 */
function apiVisitantesCheckOut(visitId) {
  return EcoturismService.checkOutGroup(visitId);
}

/**
 * API: Registra incidente com visitantes
 * @param {object} data - { trilha_id, tipo_incidente, severidade?, visita_id?, latitude?, longitude?, descricao?, pessoas_afetadas? }
 * @returns {object} Resultado com ID do incidente e alerta
 */
function apiVisitantesReportIncident(data) {
  return EcoturismService.reportIncident(data);
}

/**
 * API: Obtém visitas ativas em uma trilha
 * @param {string} trilhaId - ID da trilha (opcional)
 * @returns {object} Lista de visitas ativas e status de capacidade
 */
function apiVisitantesGetActiveVisits(trilhaId) {
  return EcoturismService.getActiveVisits(trilhaId);
}

/**
 * API: Retorna tipos de incidentes disponíveis
 * @returns {object} Lista de tipos, perfis de grupo e severidades
 */
function apiVisitantesGetIncidentTypes() {
  return EcoturismService.getIncidentTypes();
}

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Guided Tour Logistics (Prompt 30/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém programação diária do guia
 * @param {string} guiaId - ID do guia
 * @param {string} data - Data no formato YYYY-MM-DD (opcional, default: hoje)
 * @returns {object} Programação com detalhes dos grupos
 */
function apiGuiaGetDailySchedule(guiaId, data) {
  return EcoturismService.getGuideSchedule(guiaId, data);
}

/**
 * API: Analisa perfil do grupo
 * @param {string} perfilGrupo - Tipo de perfil (Idosos, Grupo Escolar, etc.)
 * @param {number} numPessoas - Número de pessoas no grupo
 * @returns {object} Análise com recomendações de ritmo e equipamentos
 */
function apiGuiaGetGroupProfile(perfilGrupo, numPessoas) {
  return EcoturismService.analyzeGroupProfile(perfilGrupo, numPessoas);
}

/**
 * API: Obtém recomendações de trilhas para um grupo
 * @param {string} perfilGrupo - Tipo de perfil
 * @param {number} numPessoas - Número de pessoas
 * @param {number} duracaoDisponivel - Horas disponíveis (opcional)
 * @returns {object} Lista de trilhas recomendadas ordenadas por adequação
 */
function apiGuiaGetTrailRecommendations(perfilGrupo, numPessoas, duracaoDisponivel) {
  return EcoturismService.getTrailRecommendations(perfilGrupo, numPessoas, duracaoDisponivel);
}

/**
 * API: Gera plano completo de tour
 * @param {string} visitaId - ID da visita ativa
 * @returns {object} Plano detalhado com duração, paradas, alertas e dicas
 */
function apiGuiaGetTourPlan(visitaId) {
  return EcoturismService.generateTourPlan(visitaId);
}

// ═════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 32/30 (19/30): MONITORAMENTO DE CAPACIDADE DE CARGA EM TEMPO REAL
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Cifuentes (1992). Determinación de capacidad de carga turística
// - ICMBio - Roteiro Metodológico para Manejo de Impactos da Visitação

/**
 * Status de capacidade de carga com indicadores visuais
 */
const CAPACITY_STATUS = {
  DISPONIVEL: { code: 'DISPONIVEL', nome: 'Disponível', cor: '#28a745', icone: '🟢', limite_min: 0, limite_max: 50 },
  MODERADO: { code: 'MODERADO', nome: 'Moderado', cor: '#ffc107', icone: '🟡', limite_min: 50, limite_max: 80 },
  PROXIMO_LIMITE: { code: 'PROXIMO_LIMITE', nome: 'Próximo do Limite', cor: '#fd7e14', icone: '🟠', limite_min: 80, limite_max: 95 },
  LOTADA: { code: 'LOTADA', nome: 'Lotada', cor: '#dc3545', icone: '🔴', limite_min: 95, limite_max: 100 },
  SOBRECARGA: { code: 'SOBRECARGA', nome: 'Sobrecarga', cor: '#6f42c1', icone: '⛔', limite_min: 100, limite_max: Infinity }
};

// Adiciona constante ao EcoturismService
EcoturismService.CAPACITY_STATUS = CAPACITY_STATUS;

/**
 * Determina status baseado na utilização percentual
 * @private
 */
EcoturismService._getCapacityStatus = function(utilizacaoPct) {
  const pct = parseFloat(utilizacaoPct) || 0;
  
  if (pct >= 100) return CAPACITY_STATUS.SOBRECARGA;
  if (pct >= 95) return CAPACITY_STATUS.LOTADA;
  if (pct >= 80) return CAPACITY_STATUS.PROXIMO_LIMITE;
  if (pct >= 50) return CAPACITY_STATUS.MODERADO;
  return CAPACITY_STATUS.DISPONIVEL;
};

/**
 * Obtém status de carga em tempo real de uma trilha
 * Prompt 32/30: Indicador de carga em tempo real
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Status detalhado de capacidade
 */
EcoturismService.getTrailLoadStatus = function(trilhaId) {
  try {
    if (!trilhaId) {
      return { success: false, error: 'trilhaId é obrigatório' };
    }

    // Obtém capacidade calculada (CCE)
    const capacidade = this.analyzeTrailCapacity(trilhaId);
    if (!capacidade.success) {
      return { success: false, error: capacidade.error || 'Erro ao calcular capacidade' };
    }

    // Obtém visitas ativas
    const visitasAtivas = this.getActiveVisits(trilhaId);
    const ocupacaoAtual = visitasAtivas.success ? visitasAtivas.ocupacao_atual : 0;
    const numVisitasAtivas = visitasAtivas.success ? visitasAtivas.total_visitas : 0;

    // Calcula utilização
    const cce = capacidade.capacidades.efetiva || 100;
    const utilizacaoPct = (ocupacaoAtual / cce) * 100;
    const vagasDisponiveis = Math.max(0, cce - ocupacaoAtual);

    // Determina status
    const status = this._getCapacityStatus(utilizacaoPct);

    // Gera recomendações baseadas no status
    const recomendacoes = [];
    if (status.code === 'SOBRECARGA') {
      recomendacoes.push('URGENTE: Suspender novas entradas');
      recomendacoes.push('Aguardar saída de visitantes');
      recomendacoes.push('Considerar redirecionamento para outras trilhas');
    } else if (status.code === 'LOTADA') {
      recomendacoes.push('Evitar novas entradas');
      recomendacoes.push('Monitorar saídas de perto');
    } else if (status.code === 'PROXIMO_LIMITE') {
      recomendacoes.push('Limitar tamanho de novos grupos');
      recomendacoes.push('Preparar alternativas');
    } else if (status.code === 'MODERADO') {
      recomendacoes.push('Fluxo normal, monitorar tendência');
    } else {
      recomendacoes.push('Capacidade adequada para receber visitantes');
    }

    return {
      success: true,
      trilha: {
        id: trilhaId,
        nome: capacidade.trilha.nome,
        dificuldade: capacidade.trilha.dificuldade
      },
      capacidade: {
        cce: cce,
        ccf: capacidade.capacidades.fisica,
        ccr: capacidade.capacidades.real
      },
      ocupacao: {
        atual: ocupacaoAtual,
        vagas_disponiveis: vagasDisponiveis,
        num_visitas_ativas: numVisitasAtivas
      },
      utilizacao: {
        percentual: utilizacaoPct.toFixed(1),
        percentual_formatado: utilizacaoPct.toFixed(1) + '%'
      },
      status: {
        code: status.code,
        nome: status.nome,
        cor: status.cor,
        icone: status.icone
      },
      permite_entrada: status.code !== 'SOBRECARGA' && status.code !== 'LOTADA',
      recomendacoes: recomendacoes,
      timestamp: new Date()
    };

  } catch (error) {
    Utils.logError('EcoturismService.getTrailLoadStatus', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Valida se um grupo pode entrar na trilha
 * Prompt 32/30: Validação de entrada
 * @param {string} trilhaId - ID da trilha
 * @param {number} numPessoas - Número de pessoas no grupo
 * @returns {object} Resultado da validação
 */
EcoturismService.validateGroupEntry = function(trilhaId, numPessoas) {
  try {
    if (!trilhaId) {
      return { success: false, error: 'trilhaId é obrigatório' };
    }
    
    const num = parseInt(numPessoas) || 0;
    if (num < 1) {
      return { success: false, error: 'numPessoas deve ser >= 1' };
    }

    // Obtém status atual
    const loadStatus = this.getTrailLoadStatus(trilhaId);
    if (!loadStatus.success) {
      return { success: false, error: loadStatus.error };
    }

    const cce = loadStatus.capacidade.cce;
    const ocupacaoAtual = loadStatus.ocupacao.atual;
    const novaOcupacao = ocupacaoAtual + num;
    const novaUtilizacao = (novaOcupacao / cce) * 100;
    const novoStatus = this._getCapacityStatus(novaUtilizacao);

    // Determina se permite entrada
    const permiteEntrada = novaUtilizacao <= 100;
    const avisoCapacidade = novaUtilizacao > 80;

    // Monta resposta
    const resultado = {
      success: true,
      trilha: loadStatus.trilha,
      grupo: {
        num_pessoas: num
      },
      situacao_atual: {
        ocupacao: ocupacaoAtual,
        cce: cce,
        utilizacao_pct: loadStatus.utilizacao.percentual,
        status: loadStatus.status
      },
      projecao_com_grupo: {
        nova_ocupacao: novaOcupacao,
        nova_utilizacao_pct: novaUtilizacao.toFixed(1),
        novo_status: novoStatus
      },
      decisao: {
        permite_entrada: permiteEntrada,
        aviso_capacidade: avisoCapacidade,
        motivo: ''
      },
      timestamp: new Date()
    };

    // Define motivo da decisão
    if (!permiteEntrada) {
      resultado.decisao.motivo = `Entrada NEGADA: Grupo de ${num} pessoas excederia a CCE (${cce}). Ocupação atual: ${ocupacaoAtual}, Nova ocupação: ${novaOcupacao}`;
      resultado.alternativas = this._suggestAlternativeTrails(trilhaId, num);
    } else if (avisoCapacidade) {
      resultado.decisao.motivo = `Entrada PERMITIDA com AVISO: Trilha ficará em ${novaUtilizacao.toFixed(1)}% da capacidade`;
    } else {
      resultado.decisao.motivo = `Entrada PERMITIDA: Capacidade adequada (${novaUtilizacao.toFixed(1)}% após entrada)`;
    }

    // Cria alerta se necessário
    if (novaUtilizacao >= 80 && loadStatus.utilizacao.percentual < 80) {
      this._createCapacityAlert(trilhaId, loadStatus.trilha.nome, novaUtilizacao, novoStatus);
    }

    return resultado;

  } catch (error) {
    Utils.logError('EcoturismService.validateGroupEntry', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Sugere trilhas alternativas
 * @private
 */
EcoturismService._suggestAlternativeTrails = function(trilhaIdExcluir, numPessoas) {
  try {
    const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
    if (!trilhas.success || trilhas.data.length === 0) {
      return [];
    }

    const alternativas = [];
    for (const t of trilhas.data) {
      if (t.id === trilhaIdExcluir) continue;

      const status = this.getTrailLoadStatus(t.id);
      if (status.success && status.ocupacao.vagas_disponiveis >= numPessoas) {
        alternativas.push({
          trilha_id: t.id,
          nome: t.nome,
          vagas_disponiveis: status.ocupacao.vagas_disponiveis,
          utilizacao_atual: status.utilizacao.percentual_formatado,
          status: status.status.nome
        });
      }
    }

    return alternativas.sort((a, b) => b.vagas_disponiveis - a.vagas_disponiveis).slice(0, 3);
  } catch (e) {
    return [];
  }
};

/**
 * Cria alerta de capacidade
 * @private
 */
EcoturismService._createCapacityAlert = function(trilhaId, trilhaNome, utilizacao, status) {
  try {
    if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
      const severidade = utilizacao >= 100 ? 9 : utilizacao >= 95 ? 7 : 5;
      EcologicalAlertSystem.createAlert({
        tipo: 'Capacidade_Trilha',
        severidade: severidade,
        titulo: `${status.icone} Capacidade da Trilha: ${trilhaNome}`,
        descricao: `Trilha atingiu ${utilizacao.toFixed(1)}% da CCE. Status: ${status.nome}`,
        zona: trilhaNome,
        recomendacoes: utilizacao >= 100 
          ? ['Suspender novas entradas', 'Redirecionar visitantes']
          : ['Monitorar fluxo', 'Preparar alternativas']
      });
    }
  } catch (e) {
    Logger.log(`[_createCapacityAlert] Erro: ${e}`);
  }
};

/**
 * Obtém status de carga de todas as trilhas (Dashboard)
 * Prompt 32/30: Visão geral de capacidade
 * @returns {object} Status de todas as trilhas
 */
EcoturismService.getAllTrailsLoadStatus = function() {
  try {
    const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
    if (!trilhas.success || trilhas.data.length === 0) {
      return { success: false, error: 'Nenhuma trilha encontrada' };
    }

    const statusTrilhas = [];
    let totalCCE = 0;
    let totalOcupacao = 0;
    let trilhasCriticas = 0;

    for (const t of trilhas.data) {
      const status = this.getTrailLoadStatus(t.id);
      if (status.success) {
        statusTrilhas.push({
          trilha_id: t.id,
          nome: status.trilha.nome,
          dificuldade: status.trilha.dificuldade,
          cce: status.capacidade.cce,
          ocupacao_atual: status.ocupacao.atual,
          vagas_disponiveis: status.ocupacao.vagas_disponiveis,
          utilizacao_pct: parseFloat(status.utilizacao.percentual),
          status_code: status.status.code,
          status_nome: status.status.nome,
          status_icone: status.status.icone,
          status_cor: status.status.cor,
          permite_entrada: status.permite_entrada
        });

        totalCCE += status.capacidade.cce;
        totalOcupacao += status.ocupacao.atual;

        if (status.status.code === 'PROXIMO_LIMITE' || 
            status.status.code === 'LOTADA' || 
            status.status.code === 'SOBRECARGA') {
          trilhasCriticas++;
        }
      }
    }

    // Ordena por utilização (maior primeiro)
    statusTrilhas.sort((a, b) => b.utilizacao_pct - a.utilizacao_pct);

    // Calcula utilização geral
    const utilizacaoGeral = totalCCE > 0 ? (totalOcupacao / totalCCE) * 100 : 0;

    return {
      success: true,
      resumo: {
        total_trilhas: statusTrilhas.length,
        capacidade_total: totalCCE,
        ocupacao_total: totalOcupacao,
        utilizacao_geral_pct: utilizacaoGeral.toFixed(1),
        trilhas_criticas: trilhasCriticas,
        status_geral: this._getCapacityStatus(utilizacaoGeral)
      },
      trilhas: statusTrilhas,
      trilhas_disponiveis: statusTrilhas.filter(t => t.permite_entrada),
      trilhas_lotadas: statusTrilhas.filter(t => !t.permite_entrada),
      timestamp: new Date()
    };

  } catch (error) {
    Utils.logError('EcoturismService.getAllTrailsLoadStatus', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Registra snapshot de carga para histórico
 * Prompt 32/30: Rastreamento histórico
 * @returns {object} Resultado do registro
 */
EcoturismService.logLoadSnapshot = function() {
  try {
    const allStatus = this.getAllTrailsLoadStatus();
    if (!allStatus.success) {
      return { success: false, error: allStatus.error };
    }

    // Garante planilha de histórico
    this._ensureSheet('HISTORICO_CARGA_RA', [
      'timestamp', 'trilha_id', 'trilha_nome', 'cce', 'ocupacao_atual',
      'utilizacao_pct', 'status_code', 'num_visitas_ativas'
    ]);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('HISTORICO_CARGA_RA');
    const timestamp = new Date();
    let registros = 0;

    for (const t of allStatus.trilhas) {
      sheet.appendRow([
        timestamp,
        t.trilha_id,
        t.nome,
        t.cce,
        t.ocupacao_atual,
        t.utilizacao_pct,
        t.status_code,
        t.ocupacao_atual // num_visitas aproximado
      ]);
      registros++;
    }

    return {
      success: true,
      timestamp: timestamp,
      registros_criados: registros,
      resumo: allStatus.resumo,
      message: `Snapshot de carga registrado: ${registros} trilhas`
    };

  } catch (error) {
    Utils.logError('EcoturismService.logLoadSnapshot', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Obtém histórico de carga de uma trilha
 * Prompt 32/30: Análise de padrões
 * @param {string} trilhaId - ID da trilha
 * @param {number} dias - Número de dias para análise (default: 30)
 * @returns {object} Histórico com análise de padrões
 */
EcoturismService.getLoadHistory = function(trilhaId, dias) {
  try {
    if (!trilhaId) {
      return { success: false, error: 'trilhaId é obrigatório' };
    }

    const numDias = parseInt(dias) || 30;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - numDias);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('HISTORICO_CARGA_RA');
    
    if (!sheet) {
      return { success: true, data: [], total: 0, message: 'Sem histórico disponível' };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, data: [], total: 0, message: 'Sem histórico disponível' };
    }

    const headers = data[0];
    const trilhaIdCol = headers.indexOf('trilha_id');
    const timestampCol = headers.indexOf('timestamp');

    // Filtra registros
    const registros = data.slice(1)
      .filter(row => {
        if (row[trilhaIdCol] !== trilhaId) return false;
        const rowDate = new Date(row[timestampCol]);
        return rowDate >= dataLimite;
      })
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (registros.length === 0) {
      return { success: true, data: [], total: 0, message: 'Sem histórico para esta trilha' };
    }

    // Análise de padrões
    const utilizacoes = registros.map(r => parseFloat(r.utilizacao_pct) || 0);
    const mediaUtilizacao = utilizacoes.reduce((a, b) => a + b, 0) / utilizacoes.length;
    const maxUtilizacao = Math.max(...utilizacoes);
    const minUtilizacao = Math.min(...utilizacoes);

    // Análise por hora do dia
    const porHora = {};
    registros.forEach(r => {
      const hora = new Date(r.timestamp).getHours();
      if (!porHora[hora]) porHora[hora] = [];
      porHora[hora].push(parseFloat(r.utilizacao_pct) || 0);
    });

    const mediasPorHora = Object.entries(porHora).map(([hora, valores]) => ({
      hora: parseInt(hora),
      media_utilizacao: (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1),
      amostras: valores.length
    })).sort((a, b) => parseFloat(b.media_utilizacao) - parseFloat(a.media_utilizacao));

    // Identifica horários de pico
    const horariosPico = mediasPorHora.filter(h => parseFloat(h.media_utilizacao) > mediaUtilizacao).slice(0, 3);

    return {
      success: true,
      trilha_id: trilhaId,
      periodo_dias: numDias,
      total_registros: registros.length,
      estatisticas: {
        media_utilizacao: mediaUtilizacao.toFixed(1) + '%',
        max_utilizacao: maxUtilizacao.toFixed(1) + '%',
        min_utilizacao: minUtilizacao.toFixed(1) + '%'
      },
      horarios_pico: horariosPico,
      medias_por_hora: mediasPorHora,
      ultimos_registros: registros.slice(0, 20),
      recomendacoes: this._generateLoadRecommendations(mediaUtilizacao, horariosPico)
    };

  } catch (error) {
    Utils.logError('EcoturismService.getLoadHistory', error);
    return { success: false, error: error.toString() };
  }
};

/**
 * Gera recomendações baseadas no histórico de carga
 * @private
 */
EcoturismService._generateLoadRecommendations = function(mediaUtilizacao, horariosPico) {
  const recomendacoes = [];

  if (mediaUtilizacao > 70) {
    recomendacoes.push('Trilha com alta demanda média - considerar sistema de agendamento');
  } else if (mediaUtilizacao < 30) {
    recomendacoes.push('Trilha subutilizada - oportunidade para promoção');
  }

  if (horariosPico.length > 0) {
    const horasPico = horariosPico.map(h => `${h.hora}h`).join(', ');
    recomendacoes.push(`Horários de pico identificados: ${horasPico}`);
    recomendacoes.push('Considerar distribuir visitantes em horários alternativos');
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push('Padrão de utilização equilibrado');
  }

  return recomendacoes;
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Trail Load Capacity Monitoring (Prompt 32/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém status de carga em tempo real de uma trilha
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Status detalhado de capacidade com indicadores visuais
 */
function apiCapacidadeGetTrailLoad(trilhaId) {
  return EcoturismService.getTrailLoadStatus(trilhaId);
}

/**
 * API: Valida se um grupo pode entrar na trilha
 * @param {string} trilhaId - ID da trilha
 * @param {number} numPessoas - Número de pessoas no grupo
 * @returns {object} Decisão de entrada com projeção de ocupação
 */
function apiCapacidadeValidateEntry(trilhaId, numPessoas) {
  return EcoturismService.validateGroupEntry(trilhaId, numPessoas);
}

/**
 * API: Obtém status de carga de todas as trilhas (Dashboard)
 * @returns {object} Visão geral de todas as trilhas ordenadas por utilização
 */
function apiCapacidadeGetAllTrailsStatus() {
  return EcoturismService.getAllTrailsLoadStatus();
}

/**
 * API: Registra snapshot de carga para histórico
 * @returns {object} Resultado do registro com resumo
 */
function apiCapacidadeLogSnapshot() {
  return EcoturismService.logLoadSnapshot();
}

/**
 * API: Obtém histórico de carga de uma trilha
 * @param {string} trilhaId - ID da trilha
 * @param {number} dias - Número de dias para análise (default: 30)
 * @returns {object} Histórico com análise de padrões e horários de pico
 */
function apiCapacidadeGetLoadHistory(trilhaId, dias) {
  return EcoturismService.getLoadHistory(trilhaId, dias);
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 42/30 (29/30): CALENDÁRIO DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Event Management Best Practices
// - Community Engagement in Conservation

/**
 * Categorias de eventos
 */
const EVENT_CATEGORIES = {
  WORKSHOP: { id: 'WORKSHOP', nome: 'Workshop', icone: '🎓', cor: '#4CAF50' },
  VOLUNTARIADO: { id: 'VOLUNTARIADO', nome: 'Dia de Voluntariado', icone: '🤝', cor: '#2196F3' },
  TOUR: { id: 'TOUR', nome: 'Tour Guiado', icone: '🥾', cor: '#FF9800' },
  PALESTRA: { id: 'PALESTRA', nome: 'Palestra', icone: '🎤', cor: '#9C27B0' },
  PLANTIO: { id: 'PLANTIO', nome: 'Mutirão de Plantio', icone: '🌱', cor: '#8BC34A' },
  OBSERVACAO: { id: 'OBSERVACAO', nome: 'Observação de Aves', icone: '🦜', cor: '#00BCD4' },
  EDUCATIVO: { id: 'EDUCATIVO', nome: 'Programa Educativo', icone: '📚', cor: '#3F51B5' }
};

/**
 * Eventos de exemplo (em produção, viriam de planilha)
 */
const SAMPLE_EVENTS = [
  { id: 'EVT001', titulo: 'Workshop de Identificação de Aves', categoria: 'WORKSHOP', data: '2025-01-15', hora: '08:00', duracao_h: 4, vagas: 20, inscritos: 12, preco: 50, descricao: 'Aprenda a identificar as principais aves do Cerrado' },
  { id: 'EVT002', titulo: 'Mutirão de Plantio - Nascente', categoria: 'PLANTIO', data: '2025-01-18', hora: '07:00', duracao_h: 5, vagas: 30, inscritos: 25, preco: 0, descricao: 'Ajude a restaurar a mata ciliar da nascente' },
  { id: 'EVT003', titulo: 'Tour Fotográfico ao Amanhecer', categoria: 'TOUR', data: '2025-01-20', hora: '05:30', duracao_h: 3, vagas: 10, inscritos: 10, preco: 80, descricao: 'Capture as melhores fotos da vida selvagem' },
  { id: 'EVT004', titulo: 'Palestra: Conservação do Cerrado', categoria: 'PALESTRA', data: '2025-01-25', hora: '19:00', duracao_h: 2, vagas: 50, inscritos: 35, preco: 0, descricao: 'Entenda os desafios e soluções para conservar o Cerrado' },
  { id: 'EVT005', titulo: 'Dia de Voluntariado - Manutenção de Trilhas', categoria: 'VOLUNTARIADO', data: '2025-02-01', hora: '08:00', duracao_h: 6, vagas: 15, inscritos: 8, preco: 0, descricao: 'Contribua com a manutenção das trilhas da reserva' },
  { id: 'EVT006', titulo: 'Observação de Aves - Especial Araras', categoria: 'OBSERVACAO', data: '2025-02-08', hora: '06:00', duracao_h: 4, vagas: 12, inscritos: 6, preco: 60, descricao: 'Observe araras-canindé em seu habitat natural' }
];

// Adiciona ao EcoturismService
EcoturismService.EVENT_CATEGORIES = EVENT_CATEGORIES;

/**
 * Obtém eventos futuros
 * @param {number} limite - Número de eventos
 * @returns {object} Eventos futuros
 */
EcoturismService.getUpcomingEvents = function(limite = 10) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Filtra eventos futuros
    const eventos = SAMPLE_EVENTS
      .filter(e => new Date(e.data) >= hoje)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(0, limite)
      .map(e => this._enrichEvent(e));
    
    return {
      success: true,
      eventos,
      total: eventos.length,
      categorias: Object.values(EVENT_CATEGORIES)
    };
  } catch (error) {
    Logger.log(`[getUpcomingEvents] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Enriquece dados do evento
 * @private
 */
EcoturismService._enrichEvent = function(evento) {
  const categoria = EVENT_CATEGORIES[evento.categoria] || EVENT_CATEGORIES.WORKSHOP;
  const vagasDisponiveis = evento.vagas - evento.inscritos;
  
  let status = 'ABERTO';
  let statusLabel = 'Vagas disponíveis';
  let statusCor = '#4CAF50';
  
  if (vagasDisponiveis <= 0) {
    status = 'LOTADO';
    statusLabel = 'Esgotado';
    statusCor = '#F44336';
  } else if (vagasDisponiveis <= 3) {
    status = 'ULTIMAS';
    statusLabel = 'Últimas vagas!';
    statusCor = '#FF9800';
  }
  
  return {
    ...evento,
    categoria_info: categoria,
    data_formatada: new Date(evento.data).toLocaleDateString('pt-BR', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    }),
    vagas_disponiveis: vagasDisponiveis,
    status,
    status_label: statusLabel,
    status_cor: statusCor,
    preco_formatado: evento.preco > 0 ? `R$ ${evento.preco.toFixed(2)}` : 'Gratuito',
    url_inscricao: `https://reservaararas.org/eventos/${evento.id}/inscricao`
  };
};

/**
 * Obtém detalhes de um evento
 * @param {string} eventoId - ID do evento
 * @returns {object} Detalhes do evento
 */
EcoturismService.getEventDetails = function(eventoId) {
  try {
    const evento = SAMPLE_EVENTS.find(e => e.id === eventoId);
    
    if (!evento) {
      return { success: false, error: 'Evento não encontrado' };
    }
    
    const enriched = this._enrichEvent(evento);
    
    return {
      success: true,
      evento: {
        ...enriched,
        requisitos: this._getEventRequirements(evento.categoria),
        o_que_levar: this._getWhatToBring(evento.categoria),
        incluso: this._getWhatsIncluded(evento.categoria, evento.preco)
      }
    };
  } catch (error) {
    Logger.log(`[getEventDetails] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém requisitos do evento
 * @private
 */
EcoturismService._getEventRequirements = function(categoria) {
  const requisitos = {
    WORKSHOP: ['Idade mínima: 12 anos', 'Disposição para aprender'],
    VOLUNTARIADO: ['Idade mínima: 16 anos', 'Boa condição física'],
    TOUR: ['Calçado adequado para trilha', 'Condição física moderada'],
    PLANTIO: ['Idade mínima: 14 anos', 'Disposição para trabalho físico'],
    OBSERVACAO: ['Silêncio durante a atividade', 'Roupas de cores neutras'],
    PALESTRA: ['Nenhum requisito específico'],
    EDUCATIVO: ['Idade conforme programa']
  };
  return requisitos[categoria] || ['Nenhum requisito específico'];
};

/**
 * Obtém lista do que levar
 * @private
 */
EcoturismService._getWhatToBring = function(categoria) {
  const itens = {
    WORKSHOP: ['Caderno e caneta', 'Binóculos (se tiver)', 'Protetor solar'],
    VOLUNTARIADO: ['Roupa que pode sujar', 'Luvas de trabalho', 'Garrafa de água'],
    TOUR: ['Câmera fotográfica', 'Repelente', 'Lanche leve'],
    PLANTIO: ['Roupa velha', 'Chapéu', 'Protetor solar'],
    OBSERVACAO: ['Binóculos', 'Guia de aves (opcional)', 'Câmera com zoom'],
    PALESTRA: ['Caderno para anotações'],
    EDUCATIVO: ['Material escolar básico']
  };
  return itens[categoria] || ['Água', 'Protetor solar'];
};

/**
 * Obtém o que está incluso
 * @private
 */
EcoturismService._getWhatsIncluded = function(categoria, preco) {
  const base = ['Seguro de atividade', 'Guia especializado'];
  
  if (preco > 0) {
    base.push('Certificado de participação');
    if (categoria === 'WORKSHOP' || categoria === 'TOUR') {
      base.push('Material didático');
    }
  }
  
  if (categoria === 'VOLUNTARIADO' || categoria === 'PLANTIO') {
    base.push('Lanche e hidratação');
    base.push('Ferramentas necessárias');
  }
  
  return base;
};

/**
 * Verifica disponibilidade de evento
 * @param {string} eventoId - ID do evento
 * @returns {object} Disponibilidade
 */
EcoturismService.checkEventAvailability = function(eventoId) {
  try {
    const evento = SAMPLE_EVENTS.find(e => e.id === eventoId);
    
    if (!evento) {
      return { success: false, error: 'Evento não encontrado' };
    }
    
    const vagasDisponiveis = evento.vagas - evento.inscritos;
    const dataEvento = new Date(evento.data);
    const hoje = new Date();
    
    return {
      success: true,
      evento_id: eventoId,
      titulo: evento.titulo,
      vagas_totais: evento.vagas,
      vagas_disponiveis: vagasDisponiveis,
      disponivel: vagasDisponiveis > 0 && dataEvento > hoje,
      lista_espera: vagasDisponiveis <= 0,
      dias_para_evento: Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24)),
      inscricoes_abertas: dataEvento > hoje
    };
  } catch (error) {
    Logger.log(`[checkEventAvailability] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Registra inscrição em evento
 * @param {string} eventoId - ID do evento
 * @param {object} dados - Dados do participante
 * @returns {object} Resultado da inscrição
 */
EcoturismService.registerForEvent = function(eventoId, dados) {
  try {
    const availability = this.checkEventAvailability(eventoId);
    
    if (!availability.success) return availability;
    
    if (!availability.disponivel) {
      if (availability.lista_espera) {
        return {
          success: true,
          status: 'LISTA_ESPERA',
          mensagem: 'Você foi adicionado à lista de espera',
          posicao: 1 // Em produção, calcular posição real
        };
      }
      return { success: false, error: 'Inscrições encerradas para este evento' };
    }
    
    // Em produção, salvar na planilha
    const inscricaoId = `INS_${Date.now()}`;
    
    return {
      success: true,
      status: 'CONFIRMADO',
      inscricao_id: inscricaoId,
      evento: availability.titulo,
      mensagem: 'Inscrição realizada com sucesso! 🎉',
      proximos_passos: [
        'Você receberá um email de confirmação',
        'Chegue 15 minutos antes do horário',
        'Traga documento com foto'
      ]
    };
  } catch (error) {
    Logger.log(`[registerForEvent] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Events Calendar (Prompt 42/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém eventos futuros
 */
function apiEventosGetUpcoming(limite) {
  return EcoturismService.getUpcomingEvents(limite || 10);
}

/**
 * API: Obtém detalhes de evento
 */
function apiEventosGetDetails(eventoId) {
  return EcoturismService.getEventDetails(eventoId);
}

/**
 * API: Verifica disponibilidade
 */
function apiEventosCheckAvailability(eventoId) {
  return EcoturismService.checkEventAvailability(eventoId);
}

/**
 * API: Registra inscrição
 */
function apiEventosRegister(eventoId, dados) {
  return EcoturismService.registerForEvent(eventoId, dados || {});
}

/**
 * API: Lista categorias de eventos
 */
function apiEventosGetCategories() {
  return {
    success: true,
    categories: Object.values(EVENT_CATEGORIES)
  };
}
