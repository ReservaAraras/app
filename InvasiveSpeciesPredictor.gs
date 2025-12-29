/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - PREDIÇÃO DE ESPÉCIES INVASORAS
 * ═══════════════════════════════════════════════════════════════════════════
 * P10 - Machine Learning para Detecção e Modelagem de Dispersão
 * 
 * Funcionalidades:
 * - Avaliação de risco de invasão
 * - Detecção precoce de invasões
 * - Modelagem de dispersão espacial
 * - Predição de estabelecimento
 * - Planos de controle automatizados
 * - Análise de impactos
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha ESPECIES_INVASORAS_RA
 */
const SCHEMA_INVASORAS = {
  ID_Especie: { type: 'string', required: true, unique: true },
  Nome_Cientifico: { type: 'string', required: true },
  Nome_Comum: { type: 'string' },
  Timestamp_Primeira_Deteccao: { type: 'datetime' },
  Status_Invasao: { type: 'enum', values: ['Potencial', 'Detectada', 'Estabelecida', 'Dispersando', 'Controlada'] },
  Nivel_Risco: { type: 'enum', values: ['Muito_Alto', 'Alto', 'Moderado', 'Baixo'] },
  Score_Invasividade: { type: 'float', range: [0, 1] },
  Origem_Geografica: { type: 'string' },
  Tipo_Organismo: { type: 'enum', values: ['Planta', 'Animal', 'Fungo', 'Bacteria'] },
  Taxa_Reproducao: { type: 'enum', values: ['Muito_Alta', 'Alta', 'Moderada', 'Baixa'] },
  Dispersao_Mecanismos_JSON: { type: 'text' },
  Tolerancia_Ambiental: { type: 'enum', values: ['Ampla', 'Moderada', 'Restrita'] },
  Pontos_Ocorrencia_JSON: { type: 'text' },
  Area_Infestada_ha: { type: 'float', min: 0 },
  Taxa_Expansao_ha_ano: { type: 'float' },
  Impacto_Biodiversidade: { type: 'enum', values: ['Critico', 'Alto', 'Moderado', 'Baixo'] },
  Especies_Afetadas_JSON: { type: 'text' },
  ML_Prob_Estabelecimento: { type: 'float', range: [0, 1] },
  ML_Area_5anos_ha: { type: 'float' },
  Metodos_Controle_JSON: { type: 'text' },
  Custo_Controle_BRL: { type: 'float' },
  Prioridade_Controle: { type: 'enum', values: ['Urgente', 'Alta', 'Media', 'Baixa'] },
  Status_Controle: { type: 'enum', values: ['Nao_Iniciado', 'Em_Andamento', 'Concluido'] },
  Notas: { type: 'text' }
};

/**
 * Headers da planilha ESPECIES_INVASORAS_RA
 */
const INVASORAS_HEADERS = [
  'ID_Especie', 'Nome_Cientifico', 'Nome_Comum', 'Timestamp_Primeira_Deteccao',
  'Status_Invasao', 'Nivel_Risco', 'Score_Invasividade', 'Origem_Geografica',
  'Tipo_Organismo', 'Taxa_Reproducao', 'Dispersao_Mecanismos_JSON', 'Tolerancia_Ambiental',
  'Pontos_Ocorrencia_JSON', 'Area_Infestada_ha', 'Taxa_Expansao_ha_ano',
  'Impacto_Biodiversidade', 'Especies_Afetadas_JSON', 'ML_Prob_Estabelecimento',
  'ML_Area_5anos_ha', 'Metodos_Controle_JSON', 'Custo_Controle_BRL',
  'Prioridade_Controle', 'Status_Controle', 'Notas'
];

/**
 * Headers da planilha TAREFAS_INVASORAS_RA (Prompt 23)
 */
const TAREFAS_INVASORAS_HEADERS = [
  'ID_Tarefa', 'ID_Especie', 'Nome_Especie', 'Tipo_Tarefa',
  'Prioridade', 'Status', 'Responsavel', 'Data_Criacao',
  'Data_Limite', 'Descricao', 'Plano_Controle_JSON', 'Notas'
];


/**
 * Preditor de Espécies Invasoras
 * @namespace InvasiveSpeciesPredictor
 */
const InvasiveSpeciesPredictor = {
  
  SHEET_NAME: 'ESPECIES_INVASORAS_RA',
  TASKS_SHEET_NAME: 'TAREFAS_INVASORAS_RA',
  
  /**
   * Prazos por prioridade (em dias)
   */
  PRIORITY_DEADLINES: {
    'Urgente': 3,
    'Alta': 7,
    'Media': 14,
    'Baixa': 30
  },
  
  /**
   * Mapeamento de nível de risco para severidade de alerta
   */
  RISK_TO_SEVERITY: {
    'Muito_Alto': 10,
    'Alto': 8,
    'Moderado': 5,
    'Baixo': 3
  },
  
  /**
   * Espécies invasoras conhecidas no Cerrado (dados de referência)
   */
  KNOWN_INVASIVES: [
    { nome: 'Brachiaria decumbens', comum: 'Braquiária', tipo: 'Planta', origem: 'África', risco: 'Muito_Alto', reproducao: 'Muito_Alta', tolerancia: 'Ampla', dispersao: ['Vento', 'Animal', 'Humano'] },
    { nome: 'Melinis minutiflora', comum: 'Capim-gordura', tipo: 'Planta', origem: 'África', risco: 'Muito_Alto', reproducao: 'Muito_Alta', tolerancia: 'Ampla', dispersao: ['Vento', 'Animal'] },
    { nome: 'Pinus elliottii', comum: 'Pinus', tipo: 'Planta', origem: 'América do Norte', risco: 'Alto', reproducao: 'Alta', tolerancia: 'Moderada', dispersao: ['Vento'] },
    { nome: 'Leucaena leucocephala', comum: 'Leucena', tipo: 'Planta', origem: 'América Central', risco: 'Alto', reproducao: 'Alta', tolerancia: 'Ampla', dispersao: ['Animal', 'Humano'] },
    { nome: 'Tecoma stans', comum: 'Amarelinho', tipo: 'Planta', origem: 'América Central', risco: 'Alto', reproducao: 'Alta', tolerancia: 'Ampla', dispersao: ['Vento', 'Animal'] },
    { nome: 'Sus scrofa', comum: 'Javali', tipo: 'Animal', origem: 'Eurásia', risco: 'Muito_Alto', reproducao: 'Alta', tolerancia: 'Ampla', dispersao: ['Animal'] },
    { nome: 'Lithobates catesbeianus', comum: 'Rã-touro', tipo: 'Animal', origem: 'América do Norte', risco: 'Alto', reproducao: 'Muito_Alta', tolerancia: 'Moderada', dispersao: ['Agua', 'Humano'] },
    { nome: 'Apis mellifera', comum: 'Abelha-africana', tipo: 'Animal', origem: 'África', risco: 'Moderado', reproducao: 'Alta', tolerancia: 'Ampla', dispersao: ['Animal'] }
  ],
  
  /**
   * Pesos para cálculo de invasividade
   */
  INVASIVENESS_WEIGHTS: {
    taxa_reproducao: 0.25,
    dispersao_capacidade: 0.20,
    tolerancia_ambiental: 0.20,
    competitividade: 0.15,
    associacao_humana: 0.10,
    historico_invasao: 0.10
  },

  /**
   * Inicializa a planilha de espécies invasoras
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(INVASORAS_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, INVASORAS_HEADERS.length);
        headerRange.setBackground('#B71C1C');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        // Popula com espécies conhecidas
        this._populateKnownInvasives(sheet);
        
        Logger.log(`[InvasiveSpeciesPredictor] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[InvasiveSpeciesPredictor] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Popula espécies invasoras conhecidas
   * @private
   */
  _populateKnownInvasives: function(sheet) {
    this.KNOWN_INVASIVES.forEach((sp, index) => {
      const id = `INV_${String(index + 1).padStart(3, '0')}`;
      const score = this._calculateInvasivenessScore({
        taxa_reproducao: sp.reproducao,
        dispersao_mecanismo: sp.dispersao,
        tolerancia_ambiental: sp.tolerancia
      });
      
      const row = [
        id,
        sp.nome,
        sp.comum,
        new Date(),
        'Potencial',
        sp.risco,
        score,
        sp.origem,
        sp.tipo,
        sp.reproducao,
        JSON.stringify(sp.dispersao),
        sp.tolerancia,
        '[]',
        0,
        0,
        sp.risco === 'Muito_Alto' ? 'Critico' : 'Alto',
        '[]',
        0,
        0,
        '[]',
        0,
        sp.risco === 'Muito_Alto' ? 'Urgente' : 'Alta',
        'Nao_Iniciado',
        'Espécie invasora conhecida no Cerrado'
      ];
      sheet.appendRow(row);
    });
  },

  /**
   * Registra nova espécie potencialmente invasora
   * @param {object} data - Dados da espécie
   * @returns {object} Resultado com avaliação de risco
   */
  registerSpecies: function(data) {
    try {
      this.initializeSheet();
      this._initializeTasksSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      // Avalia risco
      const riskAssessment = this.assessInvasionRisk(data);
      
      const row = [
        id,
        data.nome_cientifico,
        data.nome_comum || '',
        new Date(),
        data.status || 'Potencial',
        riskAssessment.risk_level,
        riskAssessment.invasiveness_score,
        data.origem || 'Desconhecida',
        data.tipo || 'Planta',
        data.taxa_reproducao || 'Moderada',
        JSON.stringify(data.dispersao_mecanismo || []),
        data.tolerancia || 'Moderada',
        JSON.stringify(data.pontos_ocorrencia || []),
        data.area_infestada || 0,
        data.taxa_expansao || 0,
        riskAssessment.impacts.biodiversity_impact,
        JSON.stringify(riskAssessment.impacts.affected_species || []),
        riskAssessment.establishment_probability,
        riskAssessment.dispersal_model.predictions?.year_5?.area_ha || 0,
        JSON.stringify(riskAssessment.control_plan.methods || []),
        riskAssessment.control_plan.estimated_cost,
        riskAssessment.control_plan.priority,
        'Nao_Iniciado',
        data.notas || ''
      ];
      
      sheet.appendRow(row);
      
      // Resultado base
      const result = {
        success: true,
        id: id,
        risk_assessment: riskAssessment
      };
      
      // [Prompt 23] Cria tarefa de contenção se risco >= Alta
      if (riskAssessment.risk_level === 'Muito_Alto' || riskAssessment.risk_level === 'Alto') {
        const taskResult = this._createContainmentTask(id, data, riskAssessment);
        if (taskResult.success) {
          result.containment_task = {
            task_id: taskResult.task_id,
            priority: taskResult.priority,
            deadline: taskResult.deadline
          };
        }
      }
      
      // [Prompt 23] Envia alerta ao EcologicalAlertSystem se risco >= Alto
      if (riskAssessment.risk_level === 'Muito_Alto' || riskAssessment.risk_level === 'Alto') {
        const alertResult = this._sendInvasiveAlert(id, data, riskAssessment);
        if (alertResult.success) {
          result.alert = {
            alert_id: alertResult.alert_id,
            sent: alertResult.notificacao_enviada
          };
        }
      }
      
      return result;
      
    } catch (error) {
      Logger.log(`[registerSpecies] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Inicializa planilha de tarefas de contenção
   * @private
   */
  _initializeTasksSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.TASKS_SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.TASKS_SHEET_NAME);
        sheet.appendRow(TAREFAS_INVASORAS_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, TAREFAS_INVASORAS_HEADERS.length);
        headerRange.setBackground('#E65100');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[InvasiveSpeciesPredictor] Planilha ${this.TASKS_SHEET_NAME} criada`);
      }
      
      return { success: true };
    } catch (error) {
      Logger.log(`[_initializeTasksSheet] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cria tarefa de contenção para espécie de alto risco
   * @private
   * @param {string} speciesId - ID da espécie
   * @param {object} data - Dados da espécie
   * @param {object} riskAssessment - Avaliação de risco
   * @returns {object} Resultado com ID da tarefa
   */
  _createContainmentTask: function(speciesId, data, riskAssessment) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.TASKS_SHEET_NAME);
      
      if (!sheet) {
        this._initializeTasksSheet();
      }
      
      const taskId = `TASK_INV_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const priority = riskAssessment.control_plan.priority;
      const deadlineDays = this.PRIORITY_DEADLINES[priority] || 14;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);
      
      const nomeEspecie = data.nome_comum || data.nome_cientifico;
      const descricao = `PROTOCOLO DE CONTENÇÃO - ${nomeEspecie}

Nível de Risco: ${riskAssessment.risk_level}
Score de Invasividade: ${riskAssessment.invasiveness_score}
Probabilidade de Estabelecimento: ${(riskAssessment.establishment_probability * 100).toFixed(1)}%
Área Projetada (5 anos): ${riskAssessment.dispersal_model.predictions?.year_5?.area_ha || 0} ha

AÇÕES RECOMENDADAS:
${riskAssessment.control_plan.methods.map((m, i) => `${i + 1}. ${m.method}: ${m.description}`).join('\n')}

Timeline: ${JSON.stringify(riskAssessment.control_plan.timeline)}
Custo Estimado: R$ ${riskAssessment.control_plan.estimated_cost.toLocaleString('pt-BR')}`;

      const row = [
        taskId,
        speciesId,
        nomeEspecie,
        'Contenção',
        priority,
        'Pendente',
        '', // Responsavel - a ser atribuído pelo GESTOR
        new Date(),
        deadline,
        descricao,
        JSON.stringify(riskAssessment.control_plan),
        `Tarefa criada automaticamente pelo sistema de detecção de invasoras`
      ];
      
      const targetSheet = ss.getSheetByName(this.TASKS_SHEET_NAME);
      targetSheet.appendRow(row);
      
      Logger.log(`[InvasiveSpeciesPredictor] Tarefa de contenção criada: ${taskId} para ${nomeEspecie}`);
      
      return {
        success: true,
        task_id: taskId,
        priority: priority,
        deadline: deadline.toISOString().split('T')[0]
      };
      
    } catch (error) {
      Logger.log(`[_createContainmentTask] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Envia alerta ao EcologicalAlertSystem para espécie invasora
   * @private
   * @param {string} speciesId - ID da espécie
   * @param {object} data - Dados da espécie
   * @param {object} riskAssessment - Avaliação de risco
   * @returns {object} Resultado do alerta
   */
  _sendInvasiveAlert: function(speciesId, data, riskAssessment) {
    try {
      // Verifica se EcologicalAlertSystem está disponível
      if (typeof EcologicalAlertSystem === 'undefined' || !EcologicalAlertSystem.createAlert) {
        Logger.log('[_sendInvasiveAlert] EcologicalAlertSystem não disponível');
        return { success: false, error: 'EcologicalAlertSystem não disponível' };
      }
      
      const nomeEspecie = data.nome_comum || data.nome_cientifico;
      const severidade = this.RISK_TO_SEVERITY[riskAssessment.risk_level] || 5;
      const urgencia = riskAssessment.risk_level === 'Muito_Alto' ? 'Imediata' : '24h';
      
      // Extrai localização se disponível
      const pontos = data.pontos_ocorrencia || [];
      const latitude = pontos.length > 0 ? pontos[0].lat : '';
      const longitude = pontos.length > 0 ? pontos[0].lng : '';
      
      const alertData = {
        tipo: 'Especie_Invasora',
        severidade: severidade,
        urgencia: urgencia,
        titulo: `🚨 Espécie Invasora Detectada: ${nomeEspecie}`,
        descricao: `ALERTA DE ESPÉCIE INVASORA

Espécie: ${data.nome_cientifico} (${nomeEspecie})
Tipo: ${data.tipo || 'Planta'}
Origem: ${data.origem || 'Desconhecida'}
Nível de Risco: ${riskAssessment.risk_level}
Score de Invasividade: ${riskAssessment.invasiveness_score}

Impacto na Biodiversidade: ${riskAssessment.impacts.biodiversity_impact}
Espécies Nativas Ameaçadas: ${riskAssessment.impacts.affected_species.join(', ')}

Área Atual: ${data.area_infestada || 0} ha
Projeção 5 anos: ${riskAssessment.dispersal_model.predictions?.year_5?.area_ha || 0} ha

AÇÃO REQUERIDA: ${riskAssessment.control_plan.priority === 'Urgente' ? 
  'Iniciar protocolo de contenção IMEDIATAMENTE' : 
  'Avaliar e iniciar plano de controle'}`,
        indicador: 'Especie_Invasora',
        valor_atual: `${nomeEspecie} (Score: ${riskAssessment.invasiveness_score})`,
        valor_esperado: 'Ausência de espécies invasoras',
        zona: data.zona || '',
        latitude: latitude,
        longitude: longitude
      };
      
      const result = EcologicalAlertSystem.createAlert(alertData);
      
      Logger.log(`[InvasiveSpeciesPredictor] Alerta enviado: ${result.alert_id} para ${nomeEspecie}`);
      
      return result;
      
    } catch (error) {
      Logger.log(`[_sendInvasiveAlert] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lista tarefas de contenção
   * @param {object} filtros - Filtros opcionais (status, prioridade, especie_id)
   * @returns {Array} Lista de tarefas
   */
  getContainmentTasks: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.TASKS_SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const tasks = [];
      
      for (let i = 1; i < data.length; i++) {
        const task = {
          id: data[i][0],
          especie_id: data[i][1],
          nome_especie: data[i][2],
          tipo_tarefa: data[i][3],
          prioridade: data[i][4],
          status: data[i][5],
          responsavel: data[i][6],
          data_criacao: data[i][7],
          data_limite: data[i][8],
          descricao: data[i][9],
          plano_controle: this._safeParseJSON(data[i][10], {}),
          notas: data[i][11]
        };
        
        // Aplica filtros
        if (filtros.status && task.status !== filtros.status) continue;
        if (filtros.prioridade && task.prioridade !== filtros.prioridade) continue;
        if (filtros.especie_id && task.especie_id !== filtros.especie_id) continue;
        
        tasks.push(task);
      }
      
      return tasks;
      
    } catch (error) {
      Logger.log(`[getContainmentTasks] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Atualiza tarefa de contenção
   * @param {string} taskId - ID da tarefa
   * @param {object} updateData - Dados de atualização
   * @returns {object} Resultado
   */
  updateContainmentTask: function(taskId, updateData) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.TASKS_SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha de tarefas não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === taskId) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, error: 'Tarefa não encontrada' };
      }
      
      // Atualiza campos
      if (updateData.status) {
        sheet.getRange(rowIndex, 6).setValue(updateData.status);
      }
      if (updateData.responsavel) {
        sheet.getRange(rowIndex, 7).setValue(updateData.responsavel);
      }
      if (updateData.notas) {
        const currentNotes = sheet.getRange(rowIndex, 12).getValue() || '';
        const newNotes = `${currentNotes}\n[${new Date().toLocaleDateString('pt-BR')}] ${updateData.notas}`;
        sheet.getRange(rowIndex, 12).setValue(newNotes.trim());
      }
      
      return {
        success: true,
        task_id: taskId,
        message: 'Tarefa atualizada com sucesso'
      };
      
    } catch (error) {
      Logger.log(`[updateContainmentTask] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Avalia risco de invasão de espécie
   * @param {object} speciesData - Dados da espécie
   * @returns {object} Avaliação completa de risco
   */
  assessInvasionRisk: function(speciesData) {
    try {
      // Extrai características
      const traits = {
        taxa_reproducao: speciesData.taxa_reproducao || 'Moderada',
        dispersao_mecanismo: speciesData.dispersao_mecanismo || [],
        tolerancia_ambiental: speciesData.tolerancia || 'Moderada',
        tipo: speciesData.tipo || 'Planta',
        origem: speciesData.origem || 'Desconhecida'
      };
      
      // Calcula score de invasividade
      const invasivenessScore = this._calculateInvasivenessScore(traits);
      
      // Classifica nível de risco
      const riskLevel = this._classifyRiskLevel(invasivenessScore);
      
      // Prediz probabilidade de estabelecimento
      const establishmentProb = this._predictEstablishment(traits, speciesData);
      
      // Modela dispersão
      const dispersalModel = this._modelSpatialDispersal(speciesData);
      
      // Avalia impactos
      const impacts = this._assessPotentialImpacts(speciesData, invasivenessScore);
      
      // Gera plano de controle
      const controlPlan = this._generateControlPlan(speciesData, impacts, riskLevel);
      
      return {
        species: speciesData.nome_cientifico,
        risk_level: riskLevel,
        invasiveness_score: parseFloat(invasivenessScore.toFixed(3)),
        establishment_probability: parseFloat(establishmentProb.toFixed(3)),
        dispersal_model: dispersalModel,
        impacts: impacts,
        control_plan: controlPlan,
        confidence: this._calculateConfidence(traits, speciesData)
      };
      
    } catch (error) {
      Logger.log(`[assessInvasionRisk] Erro: ${error}`);
      return { error: error.message };
    }
  },

  /**
   * Calcula score de invasividade
   * @private
   */
  _calculateInvasivenessScore: function(traits) {
    let score = 0;
    
    // Taxa de reprodução (peso 0.25)
    const reproductionScores = {
      'Muito_Alta': 1.0,
      'Alta': 0.75,
      'Moderada': 0.5,
      'Baixa': 0.25
    };
    score += (reproductionScores[traits.taxa_reproducao] || 0.5) * this.INVASIVENESS_WEIGHTS.taxa_reproducao;
    
    // Capacidade de dispersão (peso 0.20)
    const dispersao = traits.dispersao_mecanismo || [];
    const dispersalScore = Math.min(dispersao.length / 4, 1);
    score += dispersalScore * this.INVASIVENESS_WEIGHTS.dispersao_capacidade;
    
    // Tolerância ambiental (peso 0.20)
    const toleranceScores = {
      'Ampla': 1.0,
      'Moderada': 0.6,
      'Restrita': 0.2
    };
    score += (toleranceScores[traits.tolerancia_ambiental] || 0.6) * this.INVASIVENESS_WEIGHTS.tolerancia_ambiental;
    
    // Competitividade estimada (peso 0.15)
    const competitiveness = traits.taxa_reproducao === 'Muito_Alta' ? 0.9 : 
                           traits.taxa_reproducao === 'Alta' ? 0.7 : 0.5;
    score += competitiveness * this.INVASIVENESS_WEIGHTS.competitividade;
    
    // Associação humana (peso 0.10)
    const humanAssoc = dispersao.includes('Humano') ? 0.8 : 0.3;
    score += humanAssoc * this.INVASIVENESS_WEIGHTS.associacao_humana;
    
    // Histórico de invasão (peso 0.10)
    const isKnownInvasive = this.KNOWN_INVASIVES.some(inv => 
      inv.nome === traits.nome_cientifico
    );
    score += (isKnownInvasive ? 1.0 : 0.3) * this.INVASIVENESS_WEIGHTS.historico_invasao;
    
    return Math.min(score, 1.0);
  },
  
  /**
   * Classifica nível de risco
   * @private
   */
  _classifyRiskLevel: function(score) {
    if (score >= 0.8) return 'Muito_Alto';
    if (score >= 0.6) return 'Alto';
    if (score >= 0.4) return 'Moderado';
    return 'Baixo';
  },
  
  /**
   * Prediz probabilidade de estabelecimento
   * @private
   */
  _predictEstablishment: function(traits, speciesData) {
    const baseProb = this._calculateInvasivenessScore(traits);
    
    // Fator ambiental (Cerrado é favorável para muitas invasoras)
    const envFactor = traits.tolerancia_ambiental === 'Ampla' ? 0.9 : 
                     traits.tolerancia_ambiental === 'Moderada' ? 0.7 : 0.4;
    
    // Pressão de propágulos
    const pontos = speciesData.pontos_ocorrencia || [];
    const propagulePressure = Math.min(pontos.length / 10, 1);
    
    // Modelo logístico simplificado
    const logit = -2.5 + (3.0 * baseProb) + (2.0 * envFactor) + (1.5 * propagulePressure);
    const probability = 1 / (1 + Math.exp(-logit));
    
    return probability;
  },

  /**
   * Modela dispersão espacial
   * @private
   */
  _modelSpatialDispersal: function(speciesData) {
    const pontos = speciesData.pontos_ocorrencia || [];
    
    if (pontos.length === 0) {
      return {
        model_type: 'No_Data',
        current_area_ha: 0,
        predictions: {
          year_1: { area_ha: 0 },
          year_3: { area_ha: 0 },
          year_5: { area_ha: 0 }
        }
      };
    }
    
    // Calcula área atual
    const currentArea = speciesData.area_infestada || this._estimateAreaFromPoints(pontos);
    
    // Taxa de expansão (se não fornecida, estima)
    let expansionRate = speciesData.taxa_expansao || 0;
    if (expansionRate === 0) {
      // Estima baseado em características
      const traits = {
        taxa_reproducao: speciesData.taxa_reproducao,
        dispersao_mecanismo: speciesData.dispersao_mecanismo,
        tolerancia_ambiental: speciesData.tolerancia
      };
      expansionRate = this._estimateExpansionRate(traits, currentArea);
    }
    
    // Predições
    const predictions = {
      year_1: {
        area_ha: parseFloat((currentArea + expansionRate * 1).toFixed(2)),
        expansion_percent: expansionRate > 0 ? parseFloat(((expansionRate / currentArea) * 100).toFixed(1)) : 0
      },
      year_3: {
        area_ha: parseFloat((currentArea + expansionRate * 3).toFixed(2)),
        expansion_percent: expansionRate > 0 ? parseFloat(((expansionRate * 3 / currentArea) * 100).toFixed(1)) : 0
      },
      year_5: {
        area_ha: parseFloat((currentArea + expansionRate * 5).toFixed(2)),
        expansion_percent: expansionRate > 0 ? parseFloat(((expansionRate * 5 / currentArea) * 100).toFixed(1)) : 0
      }
    };
    
    return {
      model_type: 'Linear_Diffusion',
      current_area_ha: currentArea,
      expansion_rate_ha_year: expansionRate,
      predictions: predictions,
      high_risk_direction: this._estimateDispersalDirection(pontos)
    };
  },
  
  /**
   * Estima área a partir de pontos
   * @private
   */
  _estimateAreaFromPoints: function(pontos) {
    if (pontos.length < 2) return 0.1;
    
    // Calcula área aproximada do polígono convexo
    let maxDist = 0;
    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const dist = this._haversineDistance(
          pontos[i].lat, pontos[i].lng,
          pontos[j].lat, pontos[j].lng
        );
        if (dist > maxDist) maxDist = dist;
      }
    }
    
    // Área aproximada (círculo com diâmetro = maxDist)
    const radius = maxDist / 2;
    const areaKm2 = Math.PI * radius * radius;
    return parseFloat((areaKm2 * 100).toFixed(2)); // Converte para hectares
  },
  
  /**
   * Calcula distância Haversine
   * @private
   */
  _haversineDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  /**
   * Estima taxa de expansão
   * @private
   */
  _estimateExpansionRate: function(traits, currentArea) {
    let baseRate = currentArea * 0.1; // 10% ao ano base
    
    if (traits.taxa_reproducao === 'Muito_Alta') baseRate *= 2;
    else if (traits.taxa_reproducao === 'Alta') baseRate *= 1.5;
    
    if (traits.tolerancia_ambiental === 'Ampla') baseRate *= 1.3;
    
    const dispersao = traits.dispersao_mecanismo || [];
    if (dispersao.includes('Vento')) baseRate *= 1.2;
    if (dispersao.includes('Animal')) baseRate *= 1.1;
    
    return parseFloat(baseRate.toFixed(2));
  },
  
  /**
   * Estima direção de dispersão
   * @private
   */
  _estimateDispersalDirection: function(pontos) {
    if (pontos.length < 2) return 'Indeterminada';
    
    // Simplificado: baseado em ventos predominantes do Cerrado
    return 'Nordeste-Sudoeste (ventos predominantes)';
  },

  /**
   * Avalia impactos potenciais
   * @private
   */
  _assessPotentialImpacts: function(speciesData, invasivenessScore) {
    // Impacto na biodiversidade
    let biodiversityImpact;
    if (invasivenessScore >= 0.8) biodiversityImpact = 'Critico';
    else if (invasivenessScore >= 0.6) biodiversityImpact = 'Alto';
    else if (invasivenessScore >= 0.4) biodiversityImpact = 'Moderado';
    else biodiversityImpact = 'Baixo';
    
    // Espécies nativas potencialmente afetadas
    const affectedSpecies = this._identifyAffectedSpecies(speciesData);
    
    // Serviços ecossistêmicos afetados
    const affectedServices = this._identifyAffectedServices(speciesData);
    
    // Custo econômico estimado
    const economicCost = this._estimateEconomicCost(speciesData, invasivenessScore);
    
    return {
      biodiversity_impact: biodiversityImpact,
      affected_species: affectedSpecies,
      affected_services: affectedServices,
      economic_cost_brl: economicCost,
      ecosystem_disruption: invasivenessScore >= 0.7 ? 'Severo' : 'Moderado'
    };
  },
  
  /**
   * Identifica espécies nativas afetadas
   * @private
   */
  _identifyAffectedSpecies: function(speciesData) {
    const tipo = speciesData.tipo || 'Planta';
    
    // Espécies nativas do Cerrado que podem ser afetadas
    const nativeSpecies = {
      'Planta': [
        'Caryocar brasiliense (Pequi)',
        'Dipteryx alata (Baru)',
        'Mauritia flexuosa (Buriti)',
        'Gramíneas nativas do Cerrado'
      ],
      'Animal': [
        'Chrysocyon brachyurus (Lobo-guará)',
        'Myrmecophaga tridactyla (Tamanduá-bandeira)',
        'Anfíbios nativos',
        'Aves do Cerrado'
      ]
    };
    
    return nativeSpecies[tipo] || ['Espécies nativas do Cerrado'];
  },
  
  /**
   * Identifica serviços ecossistêmicos afetados
   * @private
   */
  _identifyAffectedServices: function(speciesData) {
    const services = [];
    const tipo = speciesData.tipo || 'Planta';
    
    if (tipo === 'Planta') {
      services.push('Regulação hídrica');
      services.push('Sequestro de carbono');
      services.push('Habitat para fauna');
      services.push('Polinização');
    } else {
      services.push('Controle de pragas');
      services.push('Dispersão de sementes');
      services.push('Cadeia trófica');
    }
    
    return services;
  },
  
  /**
   * Estima custo econômico
   * @private
   */
  _estimateEconomicCost: function(speciesData, invasivenessScore) {
    const area = speciesData.area_infestada || 1;
    
    // Custo base por hectare (R$)
    let costPerHa = 2000;
    
    if (invasivenessScore >= 0.8) costPerHa = 5000;
    else if (invasivenessScore >= 0.6) costPerHa = 3500;
    
    return parseFloat((area * costPerHa).toFixed(2));
  },

  /**
   * Gera plano de controle
   * @private
   */
  _generateControlPlan: function(speciesData, impacts, riskLevel) {
    const tipo = speciesData.tipo || 'Planta';
    
    // Determina prioridade
    let priority;
    if (riskLevel === 'Muito_Alto' || impacts.biodiversity_impact === 'Critico') {
      priority = 'Urgente';
    } else if (riskLevel === 'Alto') {
      priority = 'Alta';
    } else if (riskLevel === 'Moderado') {
      priority = 'Media';
    } else {
      priority = 'Baixa';
    }
    
    // Seleciona métodos de controle
    const methods = this._selectControlMethods(tipo, speciesData);
    
    // Define timeline
    const timeline = this._defineTimeline(priority);
    
    // Estima custo
    const estimatedCost = this._estimateControlCost(speciesData, methods);
    
    // Prediz efetividade
    const effectiveness = this._predictControlEffectiveness(speciesData, methods);
    
    return {
      priority: priority,
      methods: methods,
      timeline: timeline,
      estimated_cost: estimatedCost,
      expected_effectiveness: effectiveness,
      monitoring_frequency: priority === 'Urgente' ? 'Semanal' : 'Mensal'
    };
  },
  
  /**
   * Seleciona métodos de controle
   * @private
   */
  _selectControlMethods: function(tipo, speciesData) {
    const methods = [];
    
    if (tipo === 'Planta') {
      methods.push({
        method: 'Remoção mecânica',
        description: 'Arranquio manual ou com equipamentos',
        effectiveness: 0.7,
        cost_factor: 1.0
      });
      methods.push({
        method: 'Controle químico localizado',
        description: 'Aplicação de herbicida em pontos específicos',
        effectiveness: 0.85,
        cost_factor: 0.8
      });
      methods.push({
        method: 'Sombreamento',
        description: 'Plantio de espécies nativas para competição',
        effectiveness: 0.6,
        cost_factor: 1.5
      });
    } else if (tipo === 'Animal') {
      methods.push({
        method: 'Captura e remoção',
        description: 'Armadilhas e captura ativa',
        effectiveness: 0.6,
        cost_factor: 1.5
      });
      methods.push({
        method: 'Controle de habitat',
        description: 'Modificação do ambiente para reduzir adequabilidade',
        effectiveness: 0.5,
        cost_factor: 1.2
      });
      methods.push({
        method: 'Monitoramento intensivo',
        description: 'Câmeras trap e patrulhamento',
        effectiveness: 0.4,
        cost_factor: 0.8
      });
    }
    
    return methods;
  },
  
  /**
   * Define timeline de controle
   * @private
   */
  _defineTimeline: function(priority) {
    const timelines = {
      'Urgente': {
        survey: '1 semana',
        initial_control: '2 semanas',
        follow_up: '1 mês',
        monitoring: 'Semanal por 6 meses'
      },
      'Alta': {
        survey: '2 semanas',
        initial_control: '1 mês',
        follow_up: '2 meses',
        monitoring: 'Quinzenal por 1 ano'
      },
      'Media': {
        survey: '1 mês',
        initial_control: '2 meses',
        follow_up: '3 meses',
        monitoring: 'Mensal por 1 ano'
      },
      'Baixa': {
        survey: '2 meses',
        initial_control: '3 meses',
        follow_up: '6 meses',
        monitoring: 'Trimestral por 2 anos'
      }
    };
    
    return timelines[priority] || timelines['Media'];
  },
  
  /**
   * Estima custo de controle
   * @private
   */
  _estimateControlCost: function(speciesData, methods) {
    const area = speciesData.area_infestada || 1;
    const baseCostPerHa = 3000;
    
    let totalCost = area * baseCostPerHa;
    
    // Ajusta por métodos
    methods.forEach(m => {
      totalCost *= m.cost_factor;
    });
    
    return parseFloat(totalCost.toFixed(2));
  },
  
  /**
   * Prediz efetividade do controle
   * @private
   */
  _predictControlEffectiveness: function(speciesData, methods) {
    if (methods.length === 0) return 0;
    
    // Média ponderada das efetividades
    const avgEffectiveness = methods.reduce((sum, m) => sum + m.effectiveness, 0) / methods.length;
    
    // Ajusta por área (áreas maiores são mais difíceis)
    const area = speciesData.area_infestada || 1;
    const areaFactor = area > 100 ? 0.7 : (area > 10 ? 0.85 : 1.0);
    
    return parseFloat((avgEffectiveness * areaFactor * 100).toFixed(1));
  },
  
  /**
   * Calcula confiança da predição
   * @private
   */
  _calculateConfidence: function(traits, speciesData) {
    let confidence = 0.5; // Base
    
    // Mais dados = mais confiança
    if (speciesData.pontos_ocorrencia && speciesData.pontos_ocorrencia.length > 5) {
      confidence += 0.2;
    }
    
    // Espécie conhecida = mais confiança
    const isKnown = this.KNOWN_INVASIVES.some(inv => 
      inv.nome === speciesData.nome_cientifico
    );
    if (isKnown) confidence += 0.2;
    
    // Dados completos = mais confiança
    if (traits.taxa_reproducao && traits.tolerancia_ambiental) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  },

  /**
   * Lista espécies invasoras com filtros
   * @param {object} filtros - Filtros opcionais
   * @returns {Array} Lista de espécies
   */
  getInvasiveSpecies: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const species = [];
      
      for (let i = 1; i < data.length; i++) {
        const sp = {
          id: data[i][0],
          nome_cientifico: data[i][1],
          nome_comum: data[i][2],
          timestamp: data[i][3],
          status: data[i][4],
          nivel_risco: data[i][5],
          score_invasividade: data[i][6],
          origem: data[i][7],
          tipo: data[i][8],
          taxa_reproducao: data[i][9],
          dispersao_mecanismos: this._safeParseJSON(data[i][10], []),
          tolerancia: data[i][11],
          pontos_ocorrencia: this._safeParseJSON(data[i][12], []),
          area_infestada: data[i][13],
          taxa_expansao: data[i][14],
          impacto_biodiversidade: data[i][15],
          especies_afetadas: this._safeParseJSON(data[i][16], []),
          prob_estabelecimento: data[i][17],
          area_5anos: data[i][18],
          metodos_controle: this._safeParseJSON(data[i][19], []),
          custo_controle: data[i][20],
          prioridade_controle: data[i][21],
          status_controle: data[i][22],
          notas: data[i][23]
        };
        
        // Aplica filtros
        if (filtros.status && sp.status !== filtros.status) continue;
        if (filtros.nivel_risco && sp.nivel_risco !== filtros.nivel_risco) continue;
        if (filtros.tipo && sp.tipo !== filtros.tipo) continue;
        if (filtros.prioridade && sp.prioridade_controle !== filtros.prioridade) continue;
        
        species.push(sp);
      }
      
      return species;
      
    } catch (error) {
      Logger.log(`[getInvasiveSpecies] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Parse JSON seguro
   * @private
   */
  _safeParseJSON: function(str, defaultValue) {
    try {
      if (!str || str === '') return defaultValue;
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * Detecção precoce de invasões
   * Analisa dados recentes para identificar novas ameaças
   * @returns {object} Alertas de detecção precoce
   */
  detectEarlyInvasion: function() {
    try {
      const species = this.getInvasiveSpecies();
      const alerts = [];
      
      // Verifica espécies com status "Potencial" que têm pontos de ocorrência
      const potentialThreats = species.filter(sp => 
        sp.status === 'Potencial' && 
        sp.pontos_ocorrencia && 
        sp.pontos_ocorrencia.length > 0
      );
      
      potentialThreats.forEach(sp => {
        alerts.push({
          type: 'NOVA_DETECCAO',
          severity: sp.nivel_risco === 'Muito_Alto' ? 'Critico' : 'Alto',
          species: sp.nome_cientifico,
          nome_comum: sp.nome_comum,
          message: `${sp.nome_comum || sp.nome_cientifico} detectada com ${sp.pontos_ocorrencia.length} ponto(s) de ocorrência`,
          action: 'Verificar e confirmar presença em campo',
          risk_score: sp.score_invasividade
        });
      });
      
      // Verifica espécies com expansão rápida
      const rapidExpansion = species.filter(sp => 
        sp.taxa_expansao > 5 && // Mais de 5 ha/ano
        sp.status !== 'Controlada'
      );
      
      rapidExpansion.forEach(sp => {
        alerts.push({
          type: 'EXPANSAO_RAPIDA',
          severity: 'Alto',
          species: sp.nome_cientifico,
          nome_comum: sp.nome_comum,
          message: `${sp.nome_comum || sp.nome_cientifico} expandindo ${sp.taxa_expansao} ha/ano`,
          action: 'Intensificar controle imediatamente',
          current_area: sp.area_infestada,
          expansion_rate: sp.taxa_expansao
        });
      });
      
      // Verifica espécies de alto risco sem controle iniciado
      const uncontrolled = species.filter(sp => 
        (sp.nivel_risco === 'Muito_Alto' || sp.nivel_risco === 'Alto') &&
        sp.status_controle === 'Nao_Iniciado' &&
        sp.status !== 'Potencial'
      );
      
      uncontrolled.forEach(sp => {
        alerts.push({
          type: 'CONTROLE_PENDENTE',
          severity: sp.nivel_risco === 'Muito_Alto' ? 'Critico' : 'Alto',
          species: sp.nome_cientifico,
          nome_comum: sp.nome_comum,
          message: `${sp.nome_comum || sp.nome_cientifico} de risco ${sp.nivel_risco} sem controle iniciado`,
          action: 'Iniciar plano de controle urgentemente',
          priority: sp.prioridade_controle
        });
      });
      
      // Ordena por severidade
      const severityOrder = { 'Critico': 0, 'Alto': 1, 'Moderado': 2, 'Baixo': 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      
      return {
        success: true,
        total_alerts: alerts.length,
        critical_count: alerts.filter(a => a.severity === 'Critico').length,
        high_count: alerts.filter(a => a.severity === 'Alto').length,
        alerts: alerts,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      Logger.log(`[detectEarlyInvasion] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const species = this.getInvasiveSpecies();
      
      if (species.length === 0) {
        return {
          total_species: 0,
          by_status: {},
          by_risk: {},
          by_type: {},
          total_area_infested: 0,
          total_control_cost: 0
        };
      }
      
      // Por status
      const byStatus = {};
      species.forEach(sp => {
        byStatus[sp.status] = (byStatus[sp.status] || 0) + 1;
      });
      
      // Por nível de risco
      const byRisk = {};
      species.forEach(sp => {
        byRisk[sp.nivel_risco] = (byRisk[sp.nivel_risco] || 0) + 1;
      });
      
      // Por tipo de organismo
      const byType = {};
      species.forEach(sp => {
        byType[sp.tipo] = (byType[sp.tipo] || 0) + 1;
      });
      
      // Por prioridade de controle
      const byPriority = {};
      species.forEach(sp => {
        byPriority[sp.prioridade_controle] = (byPriority[sp.prioridade_controle] || 0) + 1;
      });
      
      // Totais
      const totalArea = species.reduce((sum, sp) => sum + (sp.area_infestada || 0), 0);
      const totalCost = species.reduce((sum, sp) => sum + (sp.custo_controle || 0), 0);
      const avgScore = species.reduce((sum, sp) => sum + (sp.score_invasividade || 0), 0) / species.length;
      
      // Top 5 mais perigosas
      const topThreats = species
        .filter(sp => sp.status !== 'Controlada')
        .sort((a, b) => (b.score_invasividade || 0) - (a.score_invasividade || 0))
        .slice(0, 5)
        .map(sp => ({
          nome: sp.nome_comum || sp.nome_cientifico,
          nome_cientifico: sp.nome_cientifico,
          score: sp.score_invasividade,
          nivel_risco: sp.nivel_risco,
          area: sp.area_infestada
        }));
      
      return {
        total_species: species.length,
        by_status: byStatus,
        by_risk: byRisk,
        by_type: byType,
        by_priority: byPriority,
        total_area_infested_ha: parseFloat(totalArea.toFixed(2)),
        total_control_cost_brl: parseFloat(totalCost.toFixed(2)),
        average_invasiveness_score: parseFloat(avgScore.toFixed(3)),
        top_threats: topThreats,
        species_needing_control: species.filter(sp => 
          sp.status_controle === 'Nao_Iniciado' && 
          sp.prioridade_controle !== 'Baixa'
        ).length
      };
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Atualiza status de controle de uma espécie
   * @param {string} speciesId - ID da espécie
   * @param {object} updateData - Dados de atualização
   * @returns {object} Resultado
   */
  updateControlStatus: function(speciesId, updateData) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === speciesId) {
          rowIndex = i + 1; // +1 porque getRange é 1-indexed
          break;
        }
      }
      
      if (rowIndex === -1) {
        return { success: false, error: 'Espécie não encontrada' };
      }
      
      // Atualiza campos
      if (updateData.status_controle) {
        sheet.getRange(rowIndex, 23).setValue(updateData.status_controle);
      }
      if (updateData.status_invasao) {
        sheet.getRange(rowIndex, 5).setValue(updateData.status_invasao);
      }
      if (updateData.area_infestada !== undefined) {
        sheet.getRange(rowIndex, 14).setValue(updateData.area_infestada);
      }
      if (updateData.notas) {
        const currentNotes = sheet.getRange(rowIndex, 24).getValue() || '';
        const newNotes = `${currentNotes}\n[${new Date().toLocaleDateString('pt-BR')}] ${updateData.notas}`;
        sheet.getRange(rowIndex, 24).setValue(newNotes.trim());
      }
      
      return {
        success: true,
        id: speciesId,
        message: 'Status atualizado com sucesso'
      };
      
    } catch (error) {
      Logger.log(`[updateControlStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Simula dispersão futura de uma espécie
   * @param {string} speciesId - ID da espécie
   * @param {number} years - Anos para simular (padrão: 5)
   * @returns {object} Resultado da simulação
   */
  simulateDispersal: function(speciesId, years = 5) {
    try {
      const species = this.getInvasiveSpecies().find(sp => sp.id === speciesId);
      
      if (!species) {
        return { success: false, error: 'Espécie não encontrada' };
      }
      
      const currentArea = species.area_infestada || 1;
      const expansionRate = species.taxa_expansao || this._estimateExpansionRate({
        taxa_reproducao: species.taxa_reproducao,
        dispersao_mecanismo: species.dispersao_mecanismos,
        tolerancia_ambiental: species.tolerancia
      }, currentArea);
      
      // Simula ano a ano
      const yearlyPredictions = [];
      let area = currentArea;
      
      for (let y = 1; y <= years; y++) {
        area += expansionRate;
        yearlyPredictions.push({
          year: y,
          area_ha: parseFloat(area.toFixed(2)),
          expansion_from_current: parseFloat((area - currentArea).toFixed(2)),
          expansion_percent: parseFloat(((area - currentArea) / currentArea * 100).toFixed(1))
        });
      }
      
      // Calcula impacto projetado
      const finalArea = yearlyPredictions[yearlyPredictions.length - 1].area_ha;
      const impactProjection = this._projectImpact(species, finalArea);
      
      return {
        success: true,
        species: {
          id: species.id,
          nome: species.nome_comum || species.nome_cientifico,
          nome_cientifico: species.nome_cientifico
        },
        current_state: {
          area_ha: currentArea,
          expansion_rate_ha_year: expansionRate,
          status: species.status
        },
        predictions: yearlyPredictions,
        impact_projection: impactProjection,
        recommendations: this._generateDispersalRecommendations(species, finalArea)
      };
      
    } catch (error) {
      Logger.log(`[simulateDispersal] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Projeta impacto futuro
   * @private
   */
  _projectImpact: function(species, projectedArea) {
    const currentArea = species.area_infestada || 1;
    const areaIncrease = projectedArea / currentArea;
    
    // Estima custo de controle futuro
    const currentCost = species.custo_controle || 3000;
    const projectedCost = currentCost * areaIncrease * 1.2; // 20% adicional por complexidade
    
    // Estima espécies adicionais afetadas
    const currentAffected = species.especies_afetadas?.length || 4;
    const projectedAffected = Math.ceil(currentAffected * Math.sqrt(areaIncrease));
    
    return {
      projected_area_ha: projectedArea,
      area_increase_factor: parseFloat(areaIncrease.toFixed(2)),
      projected_control_cost_brl: parseFloat(projectedCost.toFixed(2)),
      projected_species_affected: projectedAffected,
      severity: areaIncrease > 3 ? 'Crítico' : (areaIncrease > 2 ? 'Alto' : 'Moderado')
    };
  },
  
  /**
   * Gera recomendações baseadas na dispersão
   * @private
   */
  _generateDispersalRecommendations: function(species, projectedArea) {
    const recommendations = [];
    const currentArea = species.area_infestada || 1;
    const increase = projectedArea / currentArea;
    
    if (increase > 3) {
      recommendations.push('URGENTE: Iniciar controle imediato para evitar expansão crítica');
      recommendations.push('Estabelecer barreiras de contenção nas bordas da infestação');
      recommendations.push('Mobilizar equipe de resposta rápida');
    } else if (increase > 2) {
      recommendations.push('ALERTA: Intensificar monitoramento e controle');
      recommendations.push('Priorizar remoção em áreas de alta biodiversidade');
    } else {
      recommendations.push('Manter programa de controle atual');
      recommendations.push('Monitorar regularmente para detectar mudanças');
    }
    
    if (species.dispersao_mecanismos?.includes('Vento')) {
      recommendations.push('Atenção especial durante estação seca (dispersão por vento)');
    }
    if (species.dispersao_mecanismos?.includes('Animal')) {
      recommendations.push('Considerar controle de vetores de dispersão');
    }
    
    return recommendations;
  },

  /**
   * Análise com IA (Gemini)
   * @param {string} speciesId - ID da espécie para análise
   * @returns {object} Análise detalhada com IA
   */
  analyzeWithAI: function(speciesId) {
    try {
      const species = this.getInvasiveSpecies().find(sp => sp.id === speciesId);
      
      if (!species) {
        return { success: false, error: 'Espécie não encontrada' };
      }
      
      // Verifica se Gemini está disponível
      if (!CONFIG.GEMINI_API_KEY) {
        return this._generateFallbackAnalysis(species);
      }
      
      const prompt = `Analise a seguinte espécie invasora no contexto do Cerrado brasileiro (Reserva Araras, Goiás):

ESPÉCIE: ${species.nome_cientifico} (${species.nome_comum || 'sem nome comum'})
TIPO: ${species.tipo}
ORIGEM: ${species.origem}
STATUS: ${species.status}
NÍVEL DE RISCO: ${species.nivel_risco}
SCORE DE INVASIVIDADE: ${species.score_invasividade}
ÁREA INFESTADA: ${species.area_infestada} ha
TAXA DE EXPANSÃO: ${species.taxa_expansao} ha/ano
MECANISMOS DE DISPERSÃO: ${JSON.stringify(species.dispersao_mecanismos)}
TOLERÂNCIA AMBIENTAL: ${species.tolerancia}

Forneça uma análise em JSON com:
1. "ecological_impact": impactos ecológicos específicos no Cerrado
2. "native_species_at_risk": lista de espécies nativas ameaçadas
3. "control_strategies": estratégias de controle recomendadas
4. "prevention_measures": medidas preventivas
5. "monitoring_protocol": protocolo de monitoramento sugerido
6. "success_probability": probabilidade de controle bem-sucedido (0-1)
7. "priority_actions": lista de ações prioritárias`;

      try {
        const response = GeminiAIService.generateContent(prompt);
        
        if (response && response.success) {
          const analysis = this._parseGeminiResponse(response.content);
          return {
            success: true,
            species: species.nome_cientifico,
            ai_analysis: analysis,
            generated_at: new Date().toISOString()
          };
        }
      } catch (aiError) {
        Logger.log(`[analyzeWithAI] Erro Gemini: ${aiError}`);
      }
      
      // Fallback se Gemini falhar
      return this._generateFallbackAnalysis(species);
      
    } catch (error) {
      Logger.log(`[analyzeWithAI] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Parse resposta do Gemini
   * @private
   */
  _parseGeminiResponse: function(content) {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw_response: content };
    } catch (e) {
      return { raw_response: content };
    }
  },
  
  /**
   * Análise fallback sem IA
   * @private
   */
  _generateFallbackAnalysis: function(species) {
    const analysis = {
      ecological_impact: [],
      native_species_at_risk: [],
      control_strategies: [],
      prevention_measures: [],
      monitoring_protocol: {},
      success_probability: 0,
      priority_actions: []
    };
    
    // Impactos baseados no tipo
    if (species.tipo === 'Planta') {
      analysis.ecological_impact = [
        'Competição com vegetação nativa por luz e nutrientes',
        'Alteração da estrutura da vegetação',
        'Modificação do regime de fogo',
        'Redução de habitat para fauna'
      ];
      analysis.native_species_at_risk = [
        'Gramíneas nativas do Cerrado',
        'Pequi (Caryocar brasiliense)',
        'Baru (Dipteryx alata)'
      ];
      analysis.control_strategies = [
        'Remoção mecânica antes da frutificação',
        'Controle químico localizado com herbicida',
        'Restauração com espécies nativas'
      ];
    } else {
      analysis.ecological_impact = [
        'Predação de espécies nativas',
        'Competição por recursos',
        'Transmissão de doenças',
        'Alteração de comportamento de presas'
      ];
      analysis.native_species_at_risk = [
        'Fauna nativa do Cerrado',
        'Espécies endêmicas'
      ];
      analysis.control_strategies = [
        'Captura e remoção',
        'Controle de habitat',
        'Monitoramento com câmeras trap'
      ];
    }
    
    analysis.prevention_measures = [
      'Inspeção de veículos e equipamentos',
      'Educação ambiental da comunidade',
      'Monitoramento de áreas de risco'
    ];
    
    analysis.monitoring_protocol = {
      frequency: species.nivel_risco === 'Muito_Alto' ? 'Semanal' : 'Mensal',
      methods: ['Transectos', 'Pontos fixos', 'Registros fotográficos'],
      indicators: ['Área ocupada', 'Densidade', 'Taxa de expansão']
    };
    
    // Probabilidade baseada no status
    analysis.success_probability = species.status === 'Potencial' ? 0.8 :
                                   species.status === 'Detectada' ? 0.6 :
                                   species.status === 'Estabelecida' ? 0.4 : 0.3;
    
    analysis.priority_actions = [
      `Confirmar presença de ${species.nome_comum || species.nome_cientifico} em campo`,
      'Mapear extensão da infestação',
      'Iniciar controle nas bordas da infestação',
      'Estabelecer programa de monitoramento'
    ];
    
    return {
      success: true,
      species: species.nome_cientifico,
      ai_analysis: analysis,
      source: 'fallback_rules',
      generated_at: new Date().toISOString()
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P10 Espécies Invasoras
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de espécies invasoras
 * @returns {object} Resultado
 */
function apiInvasorasInit() {
  return InvasiveSpeciesPredictor.initializeSheet();
}

/**
 * Registra nova espécie potencialmente invasora
 * @param {object} data - Dados da espécie
 * @returns {object} Resultado com avaliação de risco
 */
function apiInvasorasRegister(data) {
  return InvasiveSpeciesPredictor.registerSpecies(data);
}

/**
 * Lista espécies invasoras
 * @param {object} filtros - Filtros opcionais (status, nivel_risco, tipo, prioridade)
 * @returns {Array} Lista de espécies
 */
function apiInvasorasList(filtros) {
  return InvasiveSpeciesPredictor.getInvasiveSpecies(filtros || {});
}

/**
 * Avalia risco de invasão de uma espécie
 * @param {object} speciesData - Dados da espécie
 * @returns {object} Avaliação completa de risco
 */
function apiInvasorasAssessRisk(speciesData) {
  return InvasiveSpeciesPredictor.assessInvasionRisk(speciesData);
}

/**
 * Simula dispersão futura de uma espécie
 * @param {string} speciesId - ID da espécie
 * @param {number} years - Anos para simular (padrão: 5)
 * @returns {object} Resultado da simulação
 */
function apiInvasorasSimulateDispersal(speciesId, years) {
  return InvasiveSpeciesPredictor.simulateDispersal(speciesId, years || 5);
}

/**
 * Detecta invasões precoces
 * @returns {object} Alertas de detecção precoce
 */
function apiInvasorasDetectEarly() {
  return InvasiveSpeciesPredictor.detectEarlyInvasion();
}

/**
 * Obtém estatísticas gerais
 * @returns {object} Estatísticas
 */
function apiInvasorasStats() {
  return InvasiveSpeciesPredictor.getStatistics();
}

/**
 * Atualiza status de controle
 * @param {string} speciesId - ID da espécie
 * @param {object} updateData - Dados de atualização
 * @returns {object} Resultado
 */
function apiInvasorasUpdateControl(speciesId, updateData) {
  return InvasiveSpeciesPredictor.updateControlStatus(speciesId, updateData);
}

/**
 * Análise com IA
 * @param {string} speciesId - ID da espécie
 * @returns {object} Análise detalhada
 */
function apiInvasorasAnalyzeAI(speciesId) {
  return InvasiveSpeciesPredictor.analyzeWithAI(speciesId);
}

/**
 * Lista tarefas de contenção
 * @param {object} filtros - Filtros opcionais (status, prioridade, especie_id)
 * @returns {Array} Lista de tarefas
 */
function apiInvasorasGetTasks(filtros) {
  return InvasiveSpeciesPredictor.getContainmentTasks(filtros || {});
}

/**
 * Atualiza tarefa de contenção
 * @param {string} taskId - ID da tarefa
 * @param {object} updateData - Dados de atualização (status, responsavel, notas)
 * @returns {object} Resultado
 */
function apiInvasorasUpdateTask(taskId, updateData) {
  return InvasiveSpeciesPredictor.updateContainmentTask(taskId, updateData);
}
