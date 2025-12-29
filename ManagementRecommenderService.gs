/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE RECOMENDAÇÃO DE AÇÕES DE MANEJO
 * ═══════════════════════════════════════════════════════════════════════════
 * P17 - Sistema de IA para Recomendações Inteligentes de Manejo
 * 
 * Funcionalidades:
 * - Análise integrada de todos os sistemas (P01-P16)
 * - Recomendações com IA contextualizadas
 * - Priorização inteligente (ROI × Urgência × Viabilidade)
 * - Planos de implementação detalhados
 * - Estimativas de custo e prazo
 * - Indicadores de sucesso e gestão de riscos
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha RECOMENDACOES_MANEJO_RA
 */
const SCHEMA_RECOMENDACOES_MANEJO = {
  ID_Recomendacao: { type: 'string', required: true, unique: true },
  Timestamp_Geracao: { type: 'datetime', required: true },
  Categoria: { type: 'enum', values: ['Conservacao', 'Restauracao', 'Monitoramento', 'Infraestrutura', 'Educacao'] },
  Prioridade: { type: 'enum', values: ['Urgente', 'Alta', 'Media', 'Baixa'] },
  Titulo: { type: 'string', required: true },
  Descricao: { type: 'text' },
  Problema_Identificado: { type: 'string' },
  Justificativa: { type: 'text' },
  Objetivo: { type: 'string' },
  Acoes_JSON: { type: 'text' },
  Recursos_JSON: { type: 'text' },
  Custo_Estimado_BRL: { type: 'float' },
  Tempo_Dias: { type: 'integer' },
  ROI_Ecologico: { type: 'float' },
  Urgencia_Score: { type: 'float' },
  Viabilidade_Score: { type: 'float' },
  Score_Final: { type: 'float' },
  Plano_Implementacao_JSON: { type: 'text' },
  Status: { type: 'enum', values: ['Proposta', 'Aprovada', 'Em_Andamento', 'Concluida', 'Cancelada'] },
  Responsavel: { type: 'string' },
  Data_Aprovacao: { type: 'date' }
};

const RECOMENDACOES_HEADERS = [
  'ID_Recomendacao', 'Timestamp_Geracao', 'Categoria', 'Prioridade', 'Titulo',
  'Descricao', 'Problema_Identificado', 'Justificativa', 'Objetivo', 'Acoes_JSON',
  'Recursos_JSON', 'Custo_Estimado_BRL', 'Tempo_Dias', 'ROI_Ecologico',
  'Urgencia_Score', 'Viabilidade_Score', 'Score_Final', 'Plano_Implementacao_JSON',
  'Status', 'Responsavel', 'Data_Aprovacao'
];


/**
 * Sistema de Recomendação de Manejo
 * @namespace ManagementRecommender
 */
const ManagementRecommender = {
  
  SHEET_NAME: 'RECOMENDACOES_MANEJO_RA',
  
  /**
   * Tipos de problemas e suas categorias
   */
  ISSUE_CATEGORIES: {
    'biodiversity_decline': 'Conservacao',
    'succession_stagnation': 'Restauracao',
    'critical_alerts': 'Conservacao',
    'low_connectivity': 'Restauracao',
    'invasive_species': 'Conservacao',
    'extreme_events': 'Monitoramento',
    'low_engagement': 'Educacao',
    'infrastructure_issues': 'Infraestrutura',
    'monitoring_gaps': 'Monitoramento'
  },

  /**
   * Templates de recomendações por tipo de problema
   */
  RECOMMENDATION_TEMPLATES: {
    'biodiversity_decline': {
      titulo: 'Programa de Recuperação da Biodiversidade',
      acoes: [
        'Realizar inventário detalhado de espécies',
        'Identificar causas do declínio',
        'Implementar medidas de proteção específicas',
        'Estabelecer programa de monitoramento intensivo',
        'Criar áreas de refúgio para espécies sensíveis'
      ],
      recursos: ['Equipe de biólogos', 'Equipamentos de monitoramento', 'Câmeras trap', 'Material de campo'],
      custo_base: 25000,
      tempo_base: 180
    },
    'succession_stagnation': {
      titulo: 'Aceleração da Sucessão Ecológica',
      acoes: [
        'Mapear áreas com sucessão estagnada',
        'Analisar fatores limitantes',
        'Implementar plantio de enriquecimento',
        'Controlar espécies competidoras',
        'Monitorar resposta da vegetação'
      ],
      recursos: ['Mudas nativas', 'Equipe de plantio', 'Ferramentas', 'Sistema de irrigação'],
      custo_base: 15000,
      tempo_base: 120
    },
    'critical_alerts': {
      titulo: 'Resposta a Alertas Ecológicos Críticos',
      acoes: [
        'Avaliar situação em campo imediatamente',
        'Implementar medidas emergenciais',
        'Mobilizar equipe de resposta rápida',
        'Documentar ocorrência e impactos',
        'Definir ações de mitigação'
      ],
      recursos: ['Equipe de emergência', 'Veículos', 'Equipamentos de proteção', 'Kit de primeiros socorros fauna'],
      custo_base: 10000,
      tempo_base: 30
    },
    'low_connectivity': {
      titulo: 'Ampliação de Corredores Ecológicos',
      acoes: [
        'Mapear gaps de conectividade',
        'Negociar com proprietários vizinhos',
        'Implementar plantio em corredores',
        'Instalar passagens de fauna',
        'Monitorar uso dos corredores'
      ],
      recursos: ['Mudas nativas', 'Cercas', 'Passagens de fauna', 'Equipe técnica'],
      custo_base: 50000,
      tempo_base: 365
    },
    'invasive_species': {
      titulo: 'Controle de Espécies Invasoras',
      acoes: [
        'Mapear distribuição das invasoras',
        'Definir método de controle adequado',
        'Implementar remoção/controle',
        'Restaurar áreas afetadas',
        'Monitorar reinfestação'
      ],
      recursos: ['Equipe de campo', 'Herbicidas seletivos', 'EPIs', 'Mudas para restauração'],
      custo_base: 20000,
      tempo_base: 90
    },
    'extreme_events': {
      titulo: 'Preparação para Eventos Extremos',
      acoes: [
        'Revisar plano de contingência',
        'Preparar equipamentos e recursos',
        'Treinar equipe de resposta',
        'Estabelecer comunicação de emergência',
        'Proteger áreas e espécies vulneráveis'
      ],
      recursos: ['Equipamentos de emergência', 'Reservatórios de água', 'Aceiros', 'Comunicação'],
      custo_base: 30000,
      tempo_base: 60
    },
    'monitoring_gaps': {
      titulo: 'Expansão do Sistema de Monitoramento',
      acoes: [
        'Identificar lacunas de monitoramento',
        'Definir indicadores prioritários',
        'Instalar novos pontos de coleta',
        'Capacitar equipe',
        'Integrar dados ao sistema'
      ],
      recursos: ['Sensores', 'Câmeras', 'Equipamentos de medição', 'Software'],
      custo_base: 35000,
      tempo_base: 90
    }
  },

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(RECOMENDACOES_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, RECOMENDACOES_HEADERS.length);
        headerRange.setBackground('#E65100');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recomendações baseadas em análise de todos os sistemas
   */
  generateRecommendations: function() {
    try {
      this.initializeSheet();
      
      // 1. Coleta dados de todos os sistemas
      const allData = this._collectAllSystemData();
      
      // 2. Identifica problemas e oportunidades
      const issues = this._identifyIssues(allData);
      
      // 3. Gera recomendações
      const recommendations = this._generateRecommendationsForIssues(issues, allData);
      
      // 4. Prioriza recomendações
      const prioritized = this._prioritizeRecommendations(recommendations);
      
      // 5. Gera planos de implementação
      const withPlans = this._generateImplementationPlans(prioritized);
      
      // 6. Salva recomendações
      withPlans.forEach(rec => this._saveRecommendation(rec));
      
      return {
        success: true,
        total_issues: issues.length,
        total_recommendations: withPlans.length,
        by_priority: {
          urgente: withPlans.filter(r => r.prioridade === 'Urgente').length,
          alta: withPlans.filter(r => r.prioridade === 'Alta').length,
          media: withPlans.filter(r => r.prioridade === 'Media').length,
          baixa: withPlans.filter(r => r.prioridade === 'Baixa').length
        },
        recommendations: withPlans
      };
      
    } catch (error) {
      Logger.log(`[generateRecommendations] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Coleta dados de todos os sistemas
   * @private
   */
  _collectAllSystemData: function() {
    // Simula coleta de dados dos sistemas P01-P16
    // Em produção, buscaria dados reais das planilhas
    return {
      general: {
        area_ha: 180,
        annual_budget: 150000,
        staff_count: 8
      },
      biodiversity: {
        species_count: 250,
        species_richness: 45,
        shannon_index: 3.2,
        baseline_richness: 50,
        threatened_species: 12,
        endemic_species: 8
      },
      succession: {
        areas_monitored: 15,
        stagnation_areas: 3,
        recovery_rate: 0.75
      },
      alerts: {
        total_alerts: 25,
        critical_count: 2,
        active_alerts: 5
      },
      corridors: {
        total_corridors: 4,
        connectivity_score: 0.65,
        gaps_identified: 2
      },
      invasive_species: {
        species_detected: 5,
        high_risk_count: 2,
        area_affected_ha: 12
      },
      extreme_events: {
        upcoming_count: 1,
        high_risk_events: 1,
        last_event_days: 45
      },
      cameras: {
        active_cameras: 12,
        captures_month: 450,
        species_detected: 35
      },
      visitors: {
        monthly_average: 320,
        satisfaction_score: 4.2,
        negative_feedback_rate: 0.08
      },
      education: {
        programs_active: 5,
        participants_year: 1200,
        engagement_rate: 0.72
      }
    };
  },

  /**
   * Identifica problemas e oportunidades
   * @private
   */
  _identifyIssues: function(data) {
    const issues = [];
    
    // Análise de biodiversidade
    if (data.biodiversity.species_richness < data.biodiversity.baseline_richness * 0.9) {
      issues.push({
        type: 'biodiversity_decline',
        severity: 'high',
        data: data.biodiversity,
        description: `Declínio de ${Math.round((1 - data.biodiversity.species_richness / data.biodiversity.baseline_richness) * 100)}% na riqueza de espécies`,
        metric: data.biodiversity.species_richness,
        threshold: data.biodiversity.baseline_richness * 0.9
      });
    }
    
    // Análise de sucessão
    if (data.succession.stagnation_areas > 0) {
      issues.push({
        type: 'succession_stagnation',
        severity: data.succession.stagnation_areas > 2 ? 'high' : 'medium',
        data: data.succession,
        description: `${data.succession.stagnation_areas} área(s) com sucessão ecológica estagnada`,
        metric: data.succession.stagnation_areas,
        threshold: 0
      });
    }
    
    // Alertas críticos
    if (data.alerts.critical_count > 0) {
      issues.push({
        type: 'critical_alerts',
        severity: 'urgent',
        data: data.alerts,
        description: `${data.alerts.critical_count} alerta(s) crítico(s) ativo(s) requerem ação imediata`,
        metric: data.alerts.critical_count,
        threshold: 0
      });
    }
    
    // Conectividade de corredores
    if (data.corridors.connectivity_score < 0.7) {
      issues.push({
        type: 'low_connectivity',
        severity: data.corridors.connectivity_score < 0.5 ? 'high' : 'medium',
        data: data.corridors,
        description: `Conectividade ecológica baixa (${(data.corridors.connectivity_score * 100).toFixed(0)}%) com ${data.corridors.gaps_identified} gaps identificados`,
        metric: data.corridors.connectivity_score,
        threshold: 0.7
      });
    }
    
    // Espécies invasoras
    if (data.invasive_species.high_risk_count > 0) {
      issues.push({
        type: 'invasive_species',
        severity: 'urgent',
        data: data.invasive_species,
        description: `${data.invasive_species.high_risk_count} espécie(s) invasora(s) de alto risco detectada(s) em ${data.invasive_species.area_affected_ha} ha`,
        metric: data.invasive_species.high_risk_count,
        threshold: 0
      });
    }
    
    // Eventos extremos previstos
    if (data.extreme_events.upcoming_count > 0) {
      issues.push({
        type: 'extreme_events',
        severity: data.extreme_events.high_risk_events > 0 ? 'urgent' : 'high',
        data: data.extreme_events,
        description: `${data.extreme_events.upcoming_count} evento(s) extremo(s) previsto(s), ${data.extreme_events.high_risk_events} de alto risco`,
        metric: data.extreme_events.upcoming_count,
        threshold: 0
      });
    }
    
    // Lacunas de monitoramento
    const monitoringCoverage = data.cameras.active_cameras / 20; // Assumindo 20 como ideal
    if (monitoringCoverage < 0.7) {
      issues.push({
        type: 'monitoring_gaps',
        severity: 'medium',
        data: { cameras: data.cameras, coverage: monitoringCoverage },
        description: `Cobertura de monitoramento em ${(monitoringCoverage * 100).toFixed(0)}% do ideal`,
        metric: monitoringCoverage,
        threshold: 0.7
      });
    }
    
    return issues;
  },

  /**
   * Gera recomendações para os problemas identificados
   * @private
   */
  _generateRecommendationsForIssues: function(issues, allData) {
    const recommendations = [];
    
    issues.forEach(issue => {
      const template = this.RECOMMENDATION_TEMPLATES[issue.type];
      if (!template) return;
      
      // Tenta gerar com IA
      let aiRecommendation = null;
      try {
        aiRecommendation = this._generateAIRecommendation(issue, allData);
      } catch (e) {
        Logger.log(`[_generateRecommendationsForIssues] IA não disponível: ${e}`);
      }
      
      // Usa IA ou template
      const rec = aiRecommendation || this._generateTemplateRecommendation(issue, template, allData);
      rec.id = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      rec.timestamp = new Date().toISOString();
      rec.problema_identificado = issue.description;
      rec.categoria = this.ISSUE_CATEGORIES[issue.type] || 'Conservacao';
      rec.issue_type = issue.type;
      rec.issue_severity = issue.severity;
      
      recommendations.push(rec);
    });
    
    return recommendations;
  },

  /**
   * Gera recomendação com IA
   * @private
   */
  _generateAIRecommendation: function(issue, allData) {
    const prompt = `
Você é um especialista em manejo de áreas de conservação no Cerrado brasileiro.

**PROBLEMA IDENTIFICADO:**
Tipo: ${issue.type}
Severidade: ${issue.severity}
Descrição: ${issue.description}

**DADOS DE CONTEXTO:**
- Área da reserva: ${allData.general.area_ha} ha
- Espécies catalogadas: ${allData.biodiversity.species_count}
- Índice de Shannon: ${allData.biodiversity.shannon_index}
- Orçamento anual: R$ ${allData.general.annual_budget}
- Equipe: ${allData.general.staff_count} pessoas

**GERE UMA RECOMENDAÇÃO DE MANEJO EM JSON:**
{
  "titulo": "Título conciso e descritivo da ação (máx 60 caracteres)",
  "descricao": "Descrição detalhada da recomendação (150 palavras)",
  "justificativa": "Base científica e técnica para a recomendação (100 palavras)",
  "objetivo": "Objetivo principal mensurável",
  "acoes": ["Ação específica 1", "Ação específica 2", "Ação específica 3", "Ação específica 4", "Ação específica 5"],
  "recursos": ["Recurso necessário 1", "Recurso necessário 2", "Recurso necessário 3"],
  "custo_estimado": 25000,
  "tempo_dias": 90,
  "impacto_esperado": "Descrição do impacto esperado",
  "roi_ecologico": 8.0,
  "urgencia": 7.5,
  "viabilidade": 8.0
}

Os scores devem ser de 0 a 10. Seja realista nos custos e prazos.`;

    const response = GeminiAIService.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
    });
    
    if (response && response.candidates && response.candidates[0]) {
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return null;
  },

  /**
   * Gera recomendação baseada em template
   * @private
   */
  _generateTemplateRecommendation: function(issue, template, allData) {
    // Ajusta custo e tempo baseado na severidade
    const severityMultiplier = { 'urgent': 1.5, 'high': 1.2, 'medium': 1.0, 'low': 0.8 };
    const multiplier = severityMultiplier[issue.severity] || 1.0;
    
    return {
      titulo: template.titulo,
      descricao: `Recomendação gerada automaticamente para resolver: ${issue.description}. Esta ação visa restaurar as condições ideais e prevenir agravamento do problema identificado.`,
      justificativa: `Baseado nos dados de monitoramento, foi identificado que ${issue.description}. A literatura científica indica que ações de manejo ativo são necessárias para reverter esta situação e garantir a integridade ecológica da área.`,
      objetivo: `Resolver o problema de ${issue.type.replace('_', ' ')} e restaurar indicadores aos níveis adequados`,
      acoes: template.acoes,
      recursos: template.recursos,
      custo_estimado: Math.round(template.custo_base * multiplier),
      tempo_dias: Math.round(template.tempo_base * multiplier),
      impacto_esperado: `Melhoria significativa nos indicadores relacionados a ${issue.type.replace('_', ' ')}`,
      roi_ecologico: issue.severity === 'urgent' ? 9.0 : issue.severity === 'high' ? 8.0 : 7.0,
      urgencia: issue.severity === 'urgent' ? 9.5 : issue.severity === 'high' ? 8.0 : 6.0,
      viabilidade: 7.5
    };
  },

  /**
   * Prioriza recomendações
   * @private
   */
  _prioritizeRecommendations: function(recommendations) {
    recommendations.forEach(rec => {
      // Calcula score final ponderado
      rec.score_final = parseFloat((
        rec.roi_ecologico * 0.4 +
        rec.urgencia * 0.4 +
        rec.viabilidade * 0.2
      ).toFixed(2));
      
      // Classifica prioridade
      if (rec.urgencia >= 9 || rec.score_final >= 8.5) {
        rec.prioridade = 'Urgente';
      } else if (rec.score_final >= 7.5) {
        rec.prioridade = 'Alta';
      } else if (rec.score_final >= 6.0) {
        rec.prioridade = 'Media';
      } else {
        rec.prioridade = 'Baixa';
      }
    });
    
    // Ordena por score final (maior primeiro)
    return recommendations.sort((a, b) => b.score_final - a.score_final);
  },

  /**
   * Gera planos de implementação
   * @private
   */
  _generateImplementationPlans: function(recommendations) {
    recommendations.forEach(rec => {
      rec.plano_implementacao = {
        fases: this._breakIntoPhases(rec.acoes, rec.tempo_dias),
        cronograma: this._generateTimeline(rec.tempo_dias),
        marcos: this._defineMilestones(rec.acoes),
        indicadores_sucesso: this._defineSuccessMetrics(rec.objetivo, rec.issue_type),
        riscos: this._identifyRisks(rec),
        contingencias: this._planContingencies(rec)
      };
    });
    
    return recommendations;
  },

  /**
   * Divide ações em fases
   * @private
   */
  _breakIntoPhases: function(actions, totalDays) {
    const phases = [];
    const phaseNames = ['Preparação', 'Execução', 'Consolidação'];
    const phaseDurations = [0.2, 0.5, 0.3]; // 20%, 50%, 30%
    
    let actionIndex = 0;
    const actionsPerPhase = Math.ceil(actions.length / 3);
    
    for (let i = 0; i < 3; i++) {
      const phaseActions = actions.slice(actionIndex, actionIndex + actionsPerPhase);
      actionIndex += actionsPerPhase;
      
      if (phaseActions.length > 0) {
        phases.push({
          fase: i + 1,
          nome: phaseNames[i],
          acoes: phaseActions,
          duracao_dias: Math.round(totalDays * phaseDurations[i]),
          percentual_conclusao: Math.round((i + 1) / 3 * 100)
        });
      }
    }
    
    return phases;
  },

  /**
   * Gera cronograma
   * @private
   */
  _generateTimeline: function(totalDays) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    
    return {
      data_inicio_sugerida: startDate.toISOString().split('T')[0],
      data_fim_prevista: endDate.toISOString().split('T')[0],
      duracao_total_dias: totalDays,
      checkpoints: [
        { dia: Math.round(totalDays * 0.25), descricao: 'Revisão de progresso - 25%' },
        { dia: Math.round(totalDays * 0.5), descricao: 'Avaliação intermediária - 50%' },
        { dia: Math.round(totalDays * 0.75), descricao: 'Preparação para conclusão - 75%' },
        { dia: totalDays, descricao: 'Conclusão e avaliação final - 100%' }
      ]
    };
  },

  /**
   * Define marcos do projeto
   * @private
   */
  _defineMilestones: function(actions) {
    return actions.slice(0, 4).map((action, index) => ({
      marco: index + 1,
      descricao: action,
      criterio_conclusao: `${action} concluída e documentada`
    }));
  },

  /**
   * Define métricas de sucesso
   * @private
   */
  _defineSuccessMetrics: function(objetivo, issueType) {
    const metricsMap = {
      'biodiversity_decline': [
        { indicador: 'Riqueza de espécies', meta: 'Aumento de 10%', metodo: 'Inventário comparativo' },
        { indicador: 'Índice de Shannon', meta: 'Aumento de 0.2', metodo: 'Cálculo estatístico' }
      ],
      'succession_stagnation': [
        { indicador: 'Cobertura vegetal', meta: 'Aumento de 20%', metodo: 'Análise de imagens' },
        { indicador: 'Diversidade de estratos', meta: '3+ estratos', metodo: 'Avaliação de campo' }
      ],
      'invasive_species': [
        { indicador: 'Área infestada', meta: 'Redução de 80%', metodo: 'Mapeamento' },
        { indicador: 'Reinfestação', meta: '<5% em 6 meses', metodo: 'Monitoramento' }
      ],
      'low_connectivity': [
        { indicador: 'Índice de conectividade', meta: '>0.8', metodo: 'Análise espacial' },
        { indicador: 'Uso por fauna', meta: 'Registros em câmeras', metodo: 'Câmeras trap' }
      ]
    };
    
    return metricsMap[issueType] || [
      { indicador: 'Conclusão das ações', meta: '100%', metodo: 'Checklist' },
      { indicador: 'Satisfação da equipe', meta: '>80%', metodo: 'Avaliação' }
    ];
  },

  /**
   * Identifica riscos
   * @private
   */
  _identifyRisks: function(rec) {
    const commonRisks = [
      { risco: 'Atraso na execução', probabilidade: 'Média', impacto: 'Médio', mitigacao: 'Cronograma com folga de 20%' },
      { risco: 'Recursos insuficientes', probabilidade: 'Baixa', impacto: 'Alto', mitigacao: 'Reserva orçamentária de 15%' },
      { risco: 'Condições climáticas adversas', probabilidade: 'Média', impacto: 'Médio', mitigacao: 'Flexibilidade no cronograma' }
    ];
    
    // Adiciona riscos específicos por categoria
    if (rec.categoria === 'Restauracao') {
      commonRisks.push({ risco: 'Baixa taxa de sobrevivência de mudas', probabilidade: 'Média', impacto: 'Alto', mitigacao: 'Replantio previsto no orçamento' });
    }
    
    if (rec.categoria === 'Conservacao') {
      commonRisks.push({ risco: 'Pressão externa (caça, invasão)', probabilidade: 'Baixa', impacto: 'Alto', mitigacao: 'Fiscalização intensificada' });
    }
    
    return commonRisks;
  },

  /**
   * Planeja contingências
   * @private
   */
  _planContingencies: function(rec) {
    return [
      { cenario: 'Orçamento excedido em >20%', acao: 'Priorizar ações essenciais e buscar recursos adicionais' },
      { cenario: 'Prazo comprometido', acao: 'Realocar equipe e revisar escopo' },
      { cenario: 'Resultados abaixo do esperado', acao: 'Análise de causas e ajuste de metodologia' }
    ];
  },

  /**
   * Salva recomendação na planilha
   * @private
   */
  _saveRecommendation: function(rec) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        rec.id,
        rec.timestamp,
        rec.categoria,
        rec.prioridade,
        rec.titulo,
        rec.descricao,
        rec.problema_identificado,
        rec.justificativa,
        rec.objetivo,
        JSON.stringify(rec.acoes),
        JSON.stringify(rec.recursos),
        rec.custo_estimado,
        rec.tempo_dias,
        rec.roi_ecologico,
        rec.urgencia,
        rec.viabilidade,
        rec.score_final,
        JSON.stringify(rec.plano_implementacao),
        'Proposta',
        '',
        ''
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (error) {
      Logger.log(`[_saveRecommendation] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Lista recomendações
   */
  listRecommendations: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, recommendations: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      let recommendations = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        recommendations.push({
          id: row[headers.indexOf('ID_Recomendacao')],
          timestamp: row[headers.indexOf('Timestamp_Geracao')],
          categoria: row[headers.indexOf('Categoria')],
          prioridade: row[headers.indexOf('Prioridade')],
          titulo: row[headers.indexOf('Titulo')],
          problema: row[headers.indexOf('Problema_Identificado')],
          objetivo: row[headers.indexOf('Objetivo')],
          custo: row[headers.indexOf('Custo_Estimado_BRL')],
          tempo_dias: row[headers.indexOf('Tempo_Dias')],
          roi_ecologico: row[headers.indexOf('ROI_Ecologico')],
          urgencia: row[headers.indexOf('Urgencia_Score')],
          score_final: row[headers.indexOf('Score_Final')],
          status: row[headers.indexOf('Status')]
        });
      }
      
      // Aplica filtros
      if (filtros.prioridade) {
        recommendations = recommendations.filter(r => r.prioridade === filtros.prioridade);
      }
      if (filtros.categoria) {
        recommendations = recommendations.filter(r => r.categoria === filtros.categoria);
      }
      if (filtros.status) {
        recommendations = recommendations.filter(r => r.status === filtros.status);
      }
      
      return { success: true, recommendations: recommendations, count: recommendations.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém recomendação por ID
   */
  getRecommendation: function(recId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('ID_Recomendacao')] === recId) {
          const row = data[i];
          return {
            success: true,
            recommendation: {
              id: row[headers.indexOf('ID_Recomendacao')],
              timestamp: row[headers.indexOf('Timestamp_Geracao')],
              categoria: row[headers.indexOf('Categoria')],
              prioridade: row[headers.indexOf('Prioridade')],
              titulo: row[headers.indexOf('Titulo')],
              descricao: row[headers.indexOf('Descricao')],
              problema: row[headers.indexOf('Problema_Identificado')],
              justificativa: row[headers.indexOf('Justificativa')],
              objetivo: row[headers.indexOf('Objetivo')],
              acoes: this._safeParseJSON(row[headers.indexOf('Acoes_JSON')]),
              recursos: this._safeParseJSON(row[headers.indexOf('Recursos_JSON')]),
              custo: row[headers.indexOf('Custo_Estimado_BRL')],
              tempo_dias: row[headers.indexOf('Tempo_Dias')],
              roi_ecologico: row[headers.indexOf('ROI_Ecologico')],
              urgencia: row[headers.indexOf('Urgencia_Score')],
              viabilidade: row[headers.indexOf('Viabilidade_Score')],
              score_final: row[headers.indexOf('Score_Final')],
              plano: this._safeParseJSON(row[headers.indexOf('Plano_Implementacao_JSON')]),
              status: row[headers.indexOf('Status')],
              responsavel: row[headers.indexOf('Responsavel')]
            }
          };
        }
      }
      
      return { success: false, error: 'Recomendação não encontrada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status da recomendação
   */
  updateStatus: function(recId, newStatus, responsavel = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return { success: false, error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('ID_Recomendacao');
      const statusIndex = headers.indexOf('Status');
      const respIndex = headers.indexOf('Responsavel');
      const aprovIndex = headers.indexOf('Data_Aprovacao');
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === recId) {
          sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
          
          if (responsavel) {
            sheet.getRange(i + 1, respIndex + 1).setValue(responsavel);
          }
          
          if (newStatus === 'Aprovada') {
            sheet.getRange(i + 1, aprovIndex + 1).setValue(new Date().toISOString().split('T')[0]);
          }
          
          return { success: true, id: recId, new_status: newStatus };
        }
      }
      
      return { success: false, error: 'Recomendação não encontrada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Parse JSON seguro
   * @private
   */
  _safeParseJSON: function(str) {
    try {
      return str ? JSON.parse(str) : null;
    } catch (e) {
      return null;
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Recomendações de Manejo
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de recomendações
 */
function apiManejoInit() {
  return ManagementRecommender.initializeSheet();
}

/**
 * Gera recomendações de manejo
 */
function apiManejoGerar() {
  return ManagementRecommender.generateRecommendations();
}

/**
 * Lista recomendações
 * @param {object} filtros - {prioridade, categoria, status}
 */
function apiManejoListar(filtros) {
  return ManagementRecommender.listRecommendations(filtros || {});
}

/**
 * Obtém recomendação por ID
 * @param {string} recId - ID da recomendação
 */
function apiManejoObter(recId) {
  return ManagementRecommender.getRecommendation(recId);
}

/**
 * Atualiza status da recomendação
 * @param {string} recId - ID da recomendação
 * @param {string} status - Novo status
 * @param {string} responsavel - Responsável (opcional)
 */
function apiManejoAtualizarStatus(recId, status, responsavel) {
  return ManagementRecommender.updateStatus(recId, status, responsavel);
}
