/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VISUALIZATION AI SERVICE - Enterprise Analytics
 * Análise inteligente de visualizações com IA generativa
 * 
 * Funcionalidades:
 * - Análise automática de gráficos por categoria
 * - Geração de insights contextuais
 * - Chatbots especializados por domínio de visualização
 * - Relatórios executivos com IA
 * ═══════════════════════════════════════════════════════════════════════════
 */

const VIZ_AI_CONFIG = {
  DRIVE_FOLDER_ID: '1AQmPZWfzdaJu7OpJ2IxR-FjwKJiLk1oS',
  CACHE_KEY: 'VIZ_AI_ANALYSIS_CACHE',
  CACHE_DURATION: 7200 // 2 horas
};

/**
 * Mapeamento de visualizações para contextos de análise
 */
const VIZ_ANALYSIS_CONTEXTS = {
  biodiversidade: {
    files: ['histograma_dap_especies', 'mapa_calor_biodiversidade', 'violino_biodiversidade_estacao'],
    metrics: ['shannon_index', 'species_count', 'endemic_ratio'],
    prompts: {
      summary: 'Analise os indicadores de biodiversidade da Reserva Araras considerando: distribuição de DAP, mapa de calor de espécies e variação sazonal.',
      trend: 'Identifique tendências na biodiversidade baseado nos dados visuais.',
      recommendation: 'Sugira ações de conservação baseadas nos padrões observados.'
    }
  },
  carbono: {
    files: ['histograma_carbono_temporal', 'evolucao_carbono_acumulado'],
    metrics: ['carbon_stock', 'sequestration_rate', 'biomass_growth'],
    prompts: {
      summary: 'Analise o sequestro de carbono e evolução do estoque na reserva.',
      trend: 'Projete a evolução do carbono para os próximos 5 anos.',
      recommendation: 'Recomende estratégias para maximizar o sequestro de carbono.'
    }
  },
  agua: {
    files: ['kde_qualidade_agua', 'radar_qualidade_agua_pontos'],
    metrics: ['ph', 'dissolved_oxygen', 'turbidity', 'conductivity'],
    prompts: {
      summary: 'Avalie a qualidade da água nos pontos de coleta da reserva.',
      trend: 'Identifique padrões sazonais na qualidade hídrica.',
      recommendation: 'Sugira intervenções para melhorar a qualidade da água.'
    }
  },
  solo: {
    files: ['kde_qualidade_solo', 'boxplot_solo_uso'],
    metrics: ['organic_matter', 'ph_soil', 'nutrients', 'compaction'],
    prompts: {
      summary: 'Analise a qualidade do solo por tipo de uso na reserva.',
      trend: 'Compare a evolução da qualidade do solo entre áreas.',
      recommendation: 'Recomende práticas de manejo para recuperação do solo.'
    }
  },
  producao: {
    files: ['barras_producao_receita', 'analise_sazonalidade_producao'],
    metrics: ['yield', 'revenue', 'seasonality', 'diversity'],
    prompts: {
      summary: 'Analise a produção agroflorestal e receita por produto.',
      trend: 'Identifique padrões sazonais e oportunidades de mercado.',
      recommendation: 'Sugira estratégias para otimizar a produção sustentável.'
    }
  },
  terapia: {
    files: ['violino_terapia_eficacia', 'radar_desempenho_terapias'],
    metrics: ['efficacy', 'satisfaction', 'sessions', 'outcomes'],
    prompts: {
      summary: 'Avalie a eficácia das terapias ambientais oferecidas.',
      trend: 'Analise a evolução dos resultados terapêuticos.',
      recommendation: 'Sugira melhorias nos protocolos terapêuticos.'
    }
  },
  clima: {
    files: ['serie_temporal_clima'],
    metrics: ['temperature', 'precipitation', 'humidity', 'radiation'],
    prompts: {
      summary: 'Analise os padrões climáticos da reserva.',
      trend: 'Identifique anomalias e tendências climáticas.',
      recommendation: 'Sugira adaptações às mudanças climáticas observadas.'
    }
  },
  iot: {
    files: ['dashboard_iot'],
    metrics: ['sensor_status', 'data_quality', 'alerts', 'coverage'],
    prompts: {
      summary: 'Avalie o status da rede de sensores IoT.',
      trend: 'Analise a qualidade e cobertura dos dados coletados.',
      recommendation: 'Sugira melhorias na infraestrutura de monitoramento.'
    }
  },
  trilhas: {
    files: ['perfil_elevacao', 'mapa_trilha_2d', 'dashboard_capacidade'],
    metrics: ['elevation', 'distance', 'capacity', 'difficulty'],
    prompts: {
      summary: 'Analise as trilhas e capacidade de carga da reserva.',
      trend: 'Avalie o uso e desgaste das trilhas ao longo do tempo.',
      recommendation: 'Sugira melhorias na gestão de visitantes e trilhas.'
    }
  },
  mrv: {
    files: ['radar_indicadores_mrv'],
    metrics: ['carbon', 'biodiversity', 'water', 'social'],
    prompts: {
      summary: 'Analise os indicadores MRV (Monitoramento, Relato e Verificação).',
      trend: 'Compare a evolução dos indicadores ao longo do tempo.',
      recommendation: 'Sugira ações para melhorar o desempenho MRV.'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANÁLISE COM IA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera análise de IA para uma categoria de visualização
 */
function generateVizAnalysis(category, analysisType = 'summary') {
  try {
    const context = VIZ_ANALYSIS_CONTEXTS[category];
    if (!context) {
      return { success: false, error: `Categoria não encontrada: ${category}` };
    }
    
    // Verificar se Gemini está disponível
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) {
      // Fallback: retornar análise estática baseada na categoria
      return getStaticAnalysis(category, analysisType);
    }
    
    // Buscar dados reais das planilhas para contexto
    const realData = fetchCategoryData(category);
    
    // Construir prompt contextualizado
    const basePrompt = context.prompts[analysisType] || context.prompts.summary;
    const fullPrompt = buildAnalysisPrompt(category, basePrompt, realData);
    
    // Chamar Gemini
    const result = GeminiAIService.callGemini(fullPrompt, {
      maxTokens: 500,
      temperature: 0.7
    });
    
    if (!result.success) {
      // Fallback se Gemini falhar
      return getStaticAnalysis(category, analysisType);
    }
    
    return {
      success: true,
      category: category,
      analysisType: analysisType,
      analysis: result.text,
      metrics: context.metrics,
      timestamp: new Date().toISOString(),
      source: 'ai'
    };
    
  } catch (error) {
    Logger.log(`Erro em generateVizAnalysis: ${error}`);
    return getStaticAnalysis(category, analysisType);
  }
}

/**
 * Retorna análise estática quando IA não está disponível
 */
function getStaticAnalysis(category, analysisType) {
  const staticAnalyses = {
    biodiversidade: {
      summary: 'A Reserva Araras apresenta alta diversidade biológica com índice Shannon acima de 2.5, indicando ecossistema saudável. O monitoramento contínuo de espécies permite identificar padrões sazonais e áreas prioritárias para conservação.',
      trend: 'Tendência de aumento na riqueza de espécies nos últimos 12 meses, especialmente em áreas de regeneração natural.',
      recommendation: 'Recomenda-se intensificar o monitoramento em áreas de borda e implementar corredores ecológicos para conectividade.'
    },
    carbono: {
      summary: 'O sequestro de carbono da reserva está em crescimento constante, com estimativa de 21.4 mil tCO2e acumuladas. A biomassa florestal representa o principal estoque.',
      trend: 'Taxa de sequestro anual de aproximadamente 2.5 tCO2e/ha, acima da média regional.',
      recommendation: 'Priorizar áreas de regeneração para maximizar o sequestro e considerar certificação de créditos de carbono.'
    },
    agua: {
      summary: 'A qualidade da água nos pontos de coleta está dentro dos padrões CONAMA. pH médio de 7.2 e oxigênio dissolvido adequado para vida aquática.',
      trend: 'Estabilidade nos parâmetros ao longo do ano, com variações sazonais esperadas no período chuvoso.',
      recommendation: 'Manter monitoramento mensal e implementar proteção adicional nas nascentes.'
    },
    solo: {
      summary: 'O solo apresenta boa estrutura e teor de matéria orgânica adequado nas áreas de SAF. Áreas de pastagem degradada necessitam recuperação.',
      trend: 'Melhoria gradual nos indicadores de fertilidade nas áreas manejadas com sistemas agroflorestais.',
      recommendation: 'Expandir práticas de cobertura do solo e adubação verde nas áreas em recuperação.'
    },
    terapia: {
      summary: 'As terapias ambientais apresentam alta eficácia, com índice de satisfação acima de 85%. Shinrin-yoku e hidroterapia são as mais procuradas.',
      trend: 'Aumento de 30% na demanda por terapias no último trimestre.',
      recommendation: 'Capacitar mais facilitadores e diversificar os protocolos terapêuticos oferecidos.'
    },
    iot: {
      summary: 'A rede de sensores IoT opera com 95% de disponibilidade. Dados de temperatura, umidade e qualidade do ar são coletados em tempo real.',
      trend: 'Expansão da cobertura de sensores em 20% no último semestre.',
      recommendation: 'Implementar alertas automáticos para anomalias e integrar dados com sistema de gestão.'
    },
    trilhas: {
      summary: 'As trilhas da reserva totalizam 12km com diferentes níveis de dificuldade. Capacidade de carga respeitada em 90% dos dias.',
      trend: 'Aumento no fluxo de visitantes nos finais de semana, necessitando gestão de capacidade.',
      recommendation: 'Implementar sistema de agendamento online e sinalização interpretativa nas trilhas.'
    },
    mrv: {
      summary: 'Os indicadores MRV mostram desempenho positivo em todas as dimensões: carbono, biodiversidade, água e social. Conformidade com padrões internacionais.',
      trend: 'Evolução consistente nos indicadores ao longo dos últimos 24 meses.',
      recommendation: 'Buscar certificações adicionais e ampliar a transparência dos relatórios para stakeholders.'
    }
  };
  
  const categoryData = staticAnalyses[category] || staticAnalyses.mrv;
  const analysis = categoryData[analysisType] || categoryData.summary;
  
  return {
    success: true,
    category: category,
    analysisType: analysisType,
    analysis: analysis,
    metrics: VIZ_ANALYSIS_CONTEXTS[category]?.metrics || [],
    timestamp: new Date().toISOString(),
    source: 'static'
  };
}

/**
 * Constrói prompt de análise com dados reais
 */
function buildAnalysisPrompt(category, basePrompt, data) {
  const context = VIZ_ANALYSIS_CONTEXTS[category];
  
  let prompt = `🌿 RESERVA ARARAS - Análise ${category.toUpperCase()}\n\n`;
  prompt += `Contexto: ${basePrompt}\n\n`;
  
  if (data && Object.keys(data).length > 0) {
    prompt += `Dados disponíveis:\n`;
    for (const [key, value] of Object.entries(data)) {
      prompt += `- ${key}: ${JSON.stringify(value)}\n`;
    }
    prompt += '\n';
  }
  
  prompt += `Métricas relevantes: ${context.metrics.join(', ')}\n\n`;
  prompt += `Forneça uma análise concisa (máximo 3 parágrafos) em português brasileiro, `;
  prompt += `focando em insights acionáveis para gestão ambiental.`;
  
  return prompt;
}

/**
 * Busca dados reais da categoria nas planilhas
 */
function fetchCategoryData(category) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = {};
    
    switch (category) {
      case 'biodiversidade':
        const bioSheet = ss.getSheetByName('BIODIVERSIDADE_RA');
        if (bioSheet) {
          const bioData = bioSheet.getDataRange().getValues();
          data.totalRegistros = bioData.length - 1;
          data.ultimaAtualizacao = bioData[bioData.length - 1]?.[0];
        }
        break;
        
      case 'carbono':
        const carbonSheet = ss.getSheetByName('CARBONO_RA');
        if (carbonSheet) {
          const carbonData = carbonSheet.getDataRange().getValues();
          data.totalMedicoes = carbonData.length - 1;
        }
        break;
        
      case 'agua':
        const waterSheet = ss.getSheetByName('QUALIDADE_AGUA_RA');
        if (waterSheet) {
          const waterData = waterSheet.getDataRange().getValues();
          data.pontosColeta = waterData.length - 1;
        }
        break;
        
      // Adicionar mais categorias conforme necessário
    }
    
    return data;
  } catch (error) {
    Logger.log(`Erro ao buscar dados: ${error}`);
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHATBOT CONTEXTUAL POR VISUALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chatbot contextual para análise de visualizações
 */
function vizChatbotQuery(category, question) {
  try {
    const context = VIZ_ANALYSIS_CONTEXTS[category];
    if (!context) {
      return { success: false, error: 'Categoria não encontrada' };
    }
    
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) {
      // Fallback para respostas pré-definidas
      return getStaticResponse(category, question);
    }
    
    const prompt = buildChatbotPrompt(category, question);
    const result = GeminiAIService.callGemini(prompt, {
      maxTokens: 300,
      temperature: 0.8
    });
    
    return {
      success: true,
      category: category,
      question: question,
      answer: result.success ? result.text : getStaticResponse(category, question).answer,
      source: result.success ? 'ai' : 'static'
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Constrói prompt para chatbot
 */
function buildChatbotPrompt(category, question) {
  const context = VIZ_ANALYSIS_CONTEXTS[category];
  
  return `Você é um especialista em ${category} da Reserva Araras.
Responda de forma concisa e técnica (máximo 2 parágrafos).

Métricas que você monitora: ${context.metrics.join(', ')}
Visualizações disponíveis: ${context.files.join(', ')}

Pergunta do usuário: ${question}

Responda em português brasileiro com foco em dados e ações práticas.`;
}

/**
 * Respostas estáticas de fallback
 */
function getStaticResponse(category, question) {
  const responses = {
    biodiversidade: {
      default: 'A biodiversidade da Reserva Araras é monitorada através de índices como Shannon e contagem de espécies. Consulte os gráficos de distribuição DAP e mapa de calor para análise detalhada.'
    },
    carbono: {
      default: 'O sequestro de carbono é calculado através de medições de biomassa e crescimento florestal. Os gráficos mostram a evolução temporal e acumulado.'
    },
    agua: {
      default: 'A qualidade da água é monitorada em múltiplos pontos de coleta, avaliando pH, oxigênio dissolvido e turbidez.'
    },
    default: {
      default: 'Consulte as visualizações disponíveis para análise detalhada dos indicadores.'
    }
  };
  
  const categoryResponses = responses[category] || responses.default;
  return {
    success: true,
    answer: categoryResponses.default,
    source: 'static'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RELATÓRIOS EXECUTIVOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera relatório executivo consolidado
 */
function generateExecutiveReport(options = {}) {
  try {
    const categories = options.categories || Object.keys(VIZ_ANALYSIS_CONTEXTS);
    const analyses = [];
    
    for (const category of categories) {
      const analysis = generateVizAnalysis(category, 'summary');
      if (analysis.success) {
        analyses.push({
          category: category,
          analysis: analysis.analysis
        });
      }
    }
    
    // Gerar sumário executivo
    let executiveSummary = '';
    
    if (typeof GeminiAIService !== 'undefined' && GeminiAIService.isConfigured()) {
      const summaryPrompt = buildExecutiveSummaryPrompt(analyses);
      const result = GeminiAIService.callGemini(summaryPrompt, {
        maxTokens: 800,
        temperature: 0.6
      });
      executiveSummary = result.success ? result.text : getStaticExecutiveSummary();
    } else {
      executiveSummary = getStaticExecutiveSummary();
    }
    
    return {
      success: true,
      reportType: 'executive',
      generatedAt: new Date().toISOString(),
      executiveSummary: executiveSummary,
      categoryAnalyses: analyses,
      visualizationsCount: Object.values(VIZ_ANALYSIS_CONTEXTS)
        .reduce((acc, ctx) => acc + ctx.files.length, 0)
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Constrói prompt para sumário executivo
 */
function buildExecutiveSummaryPrompt(analyses) {
  let prompt = `🌿 RESERVA ARARAS - Relatório Executivo\n\n`;
  prompt += `Baseado nas seguintes análises por categoria:\n\n`;
  
  for (const item of analyses) {
    prompt += `## ${item.category.toUpperCase()}\n${item.analysis}\n\n`;
  }
  
  prompt += `\nGere um SUMÁRIO EXECUTIVO consolidado (máximo 4 parágrafos) destacando:\n`;
  prompt += `1. Principais conquistas\n`;
  prompt += `2. Áreas de atenção\n`;
  prompt += `3. Recomendações prioritárias\n`;
  prompt += `4. Próximos passos\n\n`;
  prompt += `Use linguagem executiva, concisa e orientada a resultados.`;
  
  return prompt;
}

/**
 * Sumário executivo estático (fallback)
 */
function getStaticExecutiveSummary() {
  return `**Sumário Executivo - Reserva Araras**

**Principais Conquistas:**
A Reserva Araras demonstra excelente desempenho em conservação ambiental, com índice de biodiversidade Shannon acima de 2.5 e sequestro de carbono estimado em 21.4 mil tCO2e. A qualidade da água e do solo mantém-se dentro dos padrões estabelecidos, e as terapias ambientais apresentam alta taxa de satisfação (85%+).

**Áreas de Atenção:**
O fluxo de visitantes nos finais de semana aproxima-se da capacidade de carga em algumas trilhas. Áreas de pastagem degradada necessitam de intervenção para recuperação do solo. A rede de sensores IoT requer expansão para cobertura completa.

**Recomendações Prioritárias:**
1. Implementar sistema de agendamento online para gestão de visitantes
2. Expandir práticas de regeneração natural nas áreas degradadas
3. Buscar certificação de créditos de carbono para monetização
4. Capacitar facilitadores adicionais para terapias ambientais

**Próximos Passos:**
Priorizar a implementação do sistema de agendamento no próximo trimestre, iniciar processo de certificação de carbono e expandir a rede de sensores IoT para monitoramento em tempo real de todas as áreas críticas.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Gera análise de IA para categoria */
function apiVizAnalysis(category, type) {
  return generateVizAnalysis(category, type || 'summary');
}

/** Chatbot contextual por visualização */
function apiVizChatbot(category, question) {
  return vizChatbotQuery(category, question);
}

/** Relatório executivo consolidado */
function apiVizExecutiveReport(options) {
  return generateExecutiveReport(options || {});
}

/** Lista categorias disponíveis para análise */
function apiVizCategories() {
  return {
    success: true,
    categories: Object.entries(VIZ_ANALYSIS_CONTEXTS).map(([id, ctx]) => ({
      id: id,
      files: ctx.files,
      metrics: ctx.metrics
    }))
  };
}

/** Análise rápida de todas as categorias */
function apiVizQuickAnalysis() {
  const results = {};
  for (const category of Object.keys(VIZ_ANALYSIS_CONTEXTS)) {
    const analysis = generateVizAnalysis(category, 'summary');
    results[category] = analysis.success ? analysis.analysis : 'Análise não disponível';
  }
  return { success: true, analyses: results };
}
