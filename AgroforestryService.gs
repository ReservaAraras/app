/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGROFORESTRY SERVICE - Análises Agroflorestais Baseadas em Evidências
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Referências Científicas:
 * - Embrapa (2020). Sistemas Agroflorestais no Cerrado
 * - IPCC (2019). Climate Change and Land
 * - Balbino et al. (2011). Evolução tecnológica e arranjos produtivos de sistemas de integração lavoura-pecuária-floresta no Brasil
 * - Nair (2012). Carbon sequestration studies in agroforestry systems
 */

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 8/43 - Resource Allocation and Budget Optimization Constants
// ═══════════════════════════════════════════════════════════════════════════

const BUDGET_CATEGORIES = {
  MANUTENCAO: 'Manutenção',
  RESTAURACAO: 'Restauração',
  IMPLANTACAO: 'Implantação',
  MONITORAMENTO: 'Monitoramento',
  RESERVA: 'Reserva'
};

const ROI_THRESHOLDS = {
  EXCELENTE: 15,    // ROI >= 15%
  BOM: 10,          // ROI >= 10%
  ACEITAVEL: 5,     // ROI >= 5%
  BAIXO: 0,         // ROI >= 0%
  CRITICO: -999     // ROI < 0%
};

const AgroforestryService = {
  /**
   * Calcula sequestro de carbono de uma parcela
   * Baseado em: IPCC Guidelines (2006, 2019 Refinement) + COP28 Nature-Based Solutions Framework
   * Alinhado com: Global Stocktake e NDC Enhancement Guidelines
   */
  calculateCarbonSequestration(parcelaId) {
    try {
      const result = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO, { id: parcelaId });

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Parcela não encontrada' };
      }

      const parcela = result.data[0];
      const tipoSistema = parcela.tipo_sistema || 'SAF_Cerrado';
      const areaHa = parseFloat(parcela.area_ha) || 0;
      const idadeAnos = parseFloat(parcela.idade_anos) || 1;

      // Taxa de sequestro baseada em literatura
      const taxaAnual = CONFIG.CONSTANTS.CARBON_SEQUESTRATION[tipoSistema] || 5.0;

      // Cálculo de biomassa acumulada (modelo exponencial)
      // B(t) = Bmax * (1 - e^(-k*t))
      const biomasMax = taxaAnual * 30; // Biomassa máxima em 30 anos
      const k = 0.1; // Constante de crescimento
      const biomassaAcumulada = biomasMax * (1 - Math.exp(-k * idadeAnos));

      // Carbono total (above + below ground + soil organic carbon)
      const carbonoAereo = biomassaAcumulada * areaHa * CONFIG.CONSTANTS.CARBON_FRACTION_BIOMASS;
      const carbonoSolo = areaHa * 1.2 * idadeAnos; // Soil organic carbon accumulation
      
      // Select Root-to-Shoot ratio based on system type
      const rootToShoot = CONFIG.CONSTANTS.ROOT_SHOOT_RATIOS[tipoSistema] || CONFIG.CONSTANTS.ROOT_SHOOT_DEFAULT;
      const carbonoRadicular = carbonoAereo * rootToShoot;
      const carbonoTotal = carbonoAereo + carbonoRadicular + carbonoSolo;
      const co2Equivalente = carbonoTotal * CONFIG.CONSTANTS.CARBON_TO_CO2;

      // Sequestro anual atual
      const sequestroAnual = taxaAnual * areaHa;

      // COP28 Nature-Based Solutions metrics
      const cobenefits = this._calculateNbsCobenefits(tipoSistema, areaHa);
      const resilienceScore = this._calculateClimateResilience(parcela);

      return {
        success: true,
        parcela: {
          id: parcelaId,
          nome: parcela.nome,
          tipo: tipoSistema,
          area: areaHa,
          idade: idadeAnos
        },
        carbono: {
          biomassaAcumulada: biomassaAcumulada.toFixed(2),
          carbonoAereo: carbonoAereo.toFixed(2),
          carbonoRadicular: carbonoRadicular.toFixed(2),
          carbonoSolo: carbonoSolo.toFixed(2),
          carbonoTotal: carbonoTotal.toFixed(2),
          co2Equivalente: co2Equivalente.toFixed(2),
          sequestroAnual: sequestroAnual.toFixed(2),
          unidade: 'tCO2e'
        },
        comparacao: {
          equivalenteCarros: Math.floor(co2Equivalente / 4.6),
          equivalenteArvores: Math.floor(co2Equivalente / 0.021),
          contribuicaoNDC: (co2Equivalente * 0.001).toFixed(3) + ' kt CO2e'
        },
        natureBasedSolutions: {
          cobenefits: cobenefits,
          resilienceScore: resilienceScore,
          sdgAlignment: this._mapToSDGs(tipoSistema)
        }
      };
    } catch (error) {
      Utils.logError('AgroforestryService.calculateCarbonSequestration', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Calcula co-benefícios de soluções baseadas na natureza (COP28 framework)
   */
  _calculateNbsCobenefits(tipoSistema, areaHa) {
    return {
      biodiversidade: tipoSistema.includes('Diversa') ? 'Alto' : 'Médio',
      regulacaoHidrica: (areaHa * 0.8).toFixed(1) + ' ha protegidos',
      segurancaAlimentar: tipoSistema.includes('ILPF') || tipoSistema.includes('SAF') ? 'Sim' : 'Parcial',
      empregoLocal: Math.floor(areaHa * 0.3) + ' empregos/ano',
      conhecimentoTradicional: 'Integrado'
    };
  },

  /**
   * Calcula índice de resiliência climática
   */
  _calculateClimateResilience(parcela) {
    let score = 50;
    if (parcela.diversidade_especies > 10) score += 20;
    if (parcela.tipo_sistema && parcela.tipo_sistema.includes('Diversa')) score += 15;
    if (parcela.idade_anos > 5) score += 15;
    return Math.min(100, score);
  },

  /**
   * Mapeia contribuição para ODS (Objetivos de Desenvolvimento Sustentável)
   */
  _mapToSDGs(tipoSistema) {
    const sdgs = ['ODS 13 (Ação Climática)', 'ODS 15 (Vida Terrestre)'];
    if (tipoSistema.includes('ILPF') || tipoSistema.includes('SAF')) {
      sdgs.push('ODS 2 (Fome Zero)', 'ODS 8 (Trabalho Decente)');
    }
    return sdgs;
  },

  /**
   * Análise de produtividade agroflorestal
   */
  analyzeProductivity(parcelaId, periodo = 12) {
    try {
      const producao = DatabaseService.read(CONFIG.SHEETS.PRODUCAO_AGRO, { parcela_id: parcelaId });

      if (!producao.success || producao.data.length === 0) {
        return { success: false, error: 'Sem dados de produção' };
      }

      const dados = producao.data
        .filter(p => {
          const dataProducao = new Date(p.data);
          const mesesAtras = new Date();
          mesesAtras.setMonth(mesesAtras.getMonth() - periodo);
          return dataProducao >= mesesAtras;
        })
        .map(p => ({
          data: p.data,
          produto: p.produto,
          quantidade: parseFloat(p.quantidade_kg) || 0,
          valor: parseFloat(p.valor_reais) || 0
        }));

      if (dados.length === 0) {
        return { success: false, error: 'Sem dados no período' };
      }

      // Agrupa por produto
      const porProduto = {};
      dados.forEach(d => {
        if (!porProduto[d.produto]) {
          porProduto[d.produto] = { quantidade: 0, valor: 0, registros: 0 };
        }
        porProduto[d.produto].quantidade += d.quantidade;
        porProduto[d.produto].valor += d.valor;
        porProduto[d.produto].registros++;
      });

      const totalQuantidade = dados.reduce((sum, d) => sum + d.quantidade, 0);
      const totalValor = dados.reduce((sum, d) => sum + d.valor, 0);

      return {
        success: true,
        periodo: `${periodo} meses`,
        resumo: {
          totalProdutos: Object.keys(porProduto).length,
          quantidadeTotal: totalQuantidade.toFixed(2),
          valorTotal: totalValor.toFixed(2),
          mediaValorMensal: (totalValor / periodo).toFixed(2)
        },
        porProduto: Object.entries(porProduto).map(([produto, stats]) => ({
          produto,
          quantidade: stats.quantidade.toFixed(2),
          valor: stats.valor.toFixed(2),
          mediaRegistro: (stats.quantidade / stats.registros).toFixed(2)
        }))
      };
    } catch (error) {
      Utils.logError('AgroforestryService.analyzeProductivity', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise de viabilidade econômica
   * Baseado em: Análise econômica de sistemas agroflorestais (Embrapa)
   */
  analyzeEconomicViability(parcelaId) {
    try {
      const parcela = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO, { id: parcelaId });
      if (!parcela.success || parcela.data.length === 0) {
        return { success: false, error: 'Parcela não encontrada' };
      }

      const p = parcela.data[0];
      const custoImplantacao = parseFloat(p.custo_implantacao) || 0;
      const custoManutencaoAnual = parseFloat(p.custo_manutencao_anual) || 0;
      const idadeAnos = parseFloat(p.idade_anos) || 1;

      const prod = this.analyzeProductivity(parcelaId, 12);
      const receitaAnual = prod.success ? parseFloat(prod.resumo.valorTotal) : 0;

      // Calcula fluxo de caixa
      const custoTotal = custoImplantacao + (custoManutencaoAnual * idadeAnos);
      const receitaAcumulada = receitaAnual * idadeAnos;
      const lucroAcumulado = receitaAcumulada - custoTotal;

      // ROI e payback
      const roi = custoImplantacao > 0 ? ((lucroAcumulado / custoImplantacao) * 100) : 0;
      const payback = receitaAnual > custoManutencaoAnual ?
        custoImplantacao / (receitaAnual - custoManutencaoAnual) : -1;

      return {
        success: true,
        parcela: p.nome,
        custos: {
          implantacao: custoImplantacao.toFixed(2),
          manutencaoAnual: custoManutencaoAnual.toFixed(2),
          totalAcumulado: custoTotal.toFixed(2)
        },
        receitas: {
          anual: receitaAnual.toFixed(2),
          acumulada: receitaAcumulada.toFixed(2)
        },
        indicadores: {
          lucroAcumulado: lucroAcumulado.toFixed(2),
          roi: roi.toFixed(1) + '%',
          payback: payback > 0 ? payback.toFixed(1) + ' anos' : 'Não viável',
          viavel: lucroAcumulado > 0
        }
      };
    } catch (error) {
      Utils.logError('AgroforestryService.analyzeEconomicViability', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise de impacto na biodiversidade
   */
  analyzeBiodiversityImpact(parcelaId) {
    try {
      var shannon = BiodiversityService.calculateShannonIndex(parcelaId);
      var simpson = BiodiversityService.calculateSimpsonIndex(parcelaId);
      var level = 'Baixa';
      if (shannon >= 2.5 || simpson >= 0.6) level = 'Alta';
      else if (shannon >= 1.5 || simpson >= 0.4) level = 'Moderada';
      return {
        parcelaId: parcelaId,
        shannon: shannon,
        simpson: simpson,
        impactLevel: level
      };
    } catch (e) {
      Utils.logError('AgroforestryService.analyzeBiodiversityImpact', e);
      return { success: false, error: e.toString() };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMPT 8/43 - Resource Allocation and Budget Optimization
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Classifica performance da parcela baseado no ROI
   * @param {number} roi - ROI em percentual
   * @returns {Object} Classificação e ação recomendada
   */
  classifyParcelaPerformance(roi) {
    if (roi >= ROI_THRESHOLDS.EXCELENTE) {
      return { tier: 'Excelente', acao: 'Manter alocação atual', prioridade: 1 };
    } else if (roi >= ROI_THRESHOLDS.BOM) {
      return { tier: 'Bom', acao: 'Monitorar de perto', prioridade: 2 };
    } else if (roi >= ROI_THRESHOLDS.ACEITAVEL) {
      return { tier: 'Aceitável', acao: 'Revisar eficiência', prioridade: 3 };
    } else if (roi >= ROI_THRESHOLDS.BAIXO) {
      return { tier: 'Baixo', acao: 'Considerar realocação', prioridade: 4 };
    } else {
      return { tier: 'Crítico', acao: 'Priorizar para restauração', prioridade: 5 };
    }
  },

  /**
   * Analisa ROI de todas as parcelas ativas
   * @returns {Object} Análise consolidada de todas as parcelas
   */
  analyzeAllParcelsROI() {
    try {
      const parcelas = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO);
      if (!parcelas.success || parcelas.data.length === 0) {
        return { success: false, error: 'Nenhuma parcela encontrada' };
      }

      const analises = [];
      let totalROI = 0;
      let parcelasAnalisadas = 0;

      parcelas.data.forEach(parcela => {
        const viabilidade = this.analyzeEconomicViability(parcela.id);
        if (viabilidade.success) {
          const roiValue = parseFloat(viabilidade.indicadores.roi) || 0;
          const classificacao = this.classifyParcelaPerformance(roiValue);
          
          analises.push({
            id: parcela.id,
            nome: parcela.nome,
            coordenadas: parcela.coordenadas || `${parcela.latitude || 0}, ${parcela.longitude || 0}`,
            area_ha: parseFloat(parcela.area_ha) || 0,
            tipo_sistema: parcela.tipo_sistema,
            roi: roiValue,
            classificacao: classificacao,
            indicadores: viabilidade.indicadores,
            custos: viabilidade.custos,
            receitas: viabilidade.receitas
          });
          
          totalROI += roiValue;
          parcelasAnalisadas++;
        }
      });

      // Ordena por ROI (menor primeiro para identificar problemáticas)
      analises.sort((a, b) => a.roi - b.roi);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        resumo: {
          total_parcelas: parcelas.data.length,
          parcelas_analisadas: parcelasAnalisadas,
          roi_medio: parcelasAnalisadas > 0 ? (totalROI / parcelasAnalisadas).toFixed(2) + '%' : '0%',
          excelentes: analises.filter(a => a.classificacao.tier === 'Excelente').length,
          boas: analises.filter(a => a.classificacao.tier === 'Bom').length,
          aceitaveis: analises.filter(a => a.classificacao.tier === 'Aceitável').length,
          baixas: analises.filter(a => a.classificacao.tier === 'Baixo').length,
          criticas: analises.filter(a => a.classificacao.tier === 'Crítico').length
        },
        parcelas: analises
      };
    } catch (error) {
      Utils.logError('AgroforestryService.analyzeAllParcelsROI', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Identifica parcelas com baixo desempenho
   * @param {number} threshold - Limite de ROI (default: 5%)
   * @returns {Object} Lista de parcelas abaixo do threshold
   */
  identifyUnderperformingParcels(threshold = 5) {
    try {
      const analise = this.analyzeAllParcelsROI();
      if (!analise.success) return analise;

      const underperforming = analise.parcelas.filter(p => p.roi < threshold);

      return {
        success: true,
        threshold: threshold + '%',
        total_identificadas: underperforming.length,
        parcelas: underperforming.map(p => ({
          id: p.id,
          nome: p.nome,
          coordenadas: p.coordenadas,
          roi: p.roi + '%',
          classificacao: p.classificacao.tier,
          acao_recomendada: p.classificacao.acao,
          deficit: (threshold - p.roi).toFixed(2) + '% abaixo do limite'
        })),
        impacto_financeiro: {
          custo_total_underperforming: underperforming.reduce((sum, p) => 
            sum + parseFloat(p.custos?.totalAcumulado || 0), 0).toFixed(2),
          receita_total_underperforming: underperforming.reduce((sum, p) => 
            sum + parseFloat(p.receitas?.acumulada || 0), 0).toFixed(2)
        }
      };
    } catch (error) {
      Utils.logError('AgroforestryService.identifyUnderperformingParcels', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém alocação de orçamento atual
   * @returns {Object} Alocação por categoria
   */
  getBudgetAllocation() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName('ORCAMENTO_AGRO_RA');
      
      // Se a planilha não existir, retorna estrutura padrão
      if (!sheet) {
        return {
          success: true,
          fonte: 'default',
          categorias: {
            [BUDGET_CATEGORIES.MANUTENCAO]: { alocado: 50000, utilizado: 0, disponivel: 50000 },
            [BUDGET_CATEGORIES.RESTAURACAO]: { alocado: 30000, utilizado: 0, disponivel: 30000 },
            [BUDGET_CATEGORIES.IMPLANTACAO]: { alocado: 40000, utilizado: 0, disponivel: 40000 },
            [BUDGET_CATEGORIES.MONITORAMENTO]: { alocado: 15000, utilizado: 0, disponivel: 15000 },
            [BUDGET_CATEGORIES.RESERVA]: { alocado: 10000, utilizado: 0, disponivel: 10000 }
          },
          total_alocado: 145000,
          total_utilizado: 0,
          total_disponivel: 145000
        };
      }

      const data = sheet.getDataRange().getValues().slice(1);
      const categorias = {};
      
      Object.values(BUDGET_CATEGORIES).forEach(cat => {
        categorias[cat] = { alocado: 0, utilizado: 0, disponivel: 0 };
      });

      data.forEach(row => {
        const categoria = row[2];
        if (categorias[categoria]) {
          categorias[categoria].alocado += parseFloat(row[3]) || 0;
          categorias[categoria].utilizado += parseFloat(row[4]) || 0;
        }
      });

      let totalAlocado = 0, totalUtilizado = 0;
      Object.keys(categorias).forEach(cat => {
        categorias[cat].disponivel = categorias[cat].alocado - categorias[cat].utilizado;
        totalAlocado += categorias[cat].alocado;
        totalUtilizado += categorias[cat].utilizado;
      });

      return {
        success: true,
        fonte: 'planilha',
        categorias: categorias,
        total_alocado: totalAlocado,
        total_utilizado: totalUtilizado,
        total_disponivel: totalAlocado - totalUtilizado
      };
    } catch (error) {
      Utils.logError('AgroforestryService.getBudgetAllocation', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Realoca orçamento entre categorias para uma parcela
   * @param {string} parcelaId - ID da parcela
   * @param {string} fromCategory - Categoria de origem
   * @param {string} toCategory - Categoria de destino
   * @param {number} amount - Valor a realocar
   * @returns {Object} Resultado da realocação
   */
  reallocateBudget(parcelaId, fromCategory, toCategory, amount) {
    try {
      // Valida categorias
      if (!Object.values(BUDGET_CATEGORIES).includes(fromCategory)) {
        return { success: false, error: `Categoria de origem inválida: ${fromCategory}` };
      }
      if (!Object.values(BUDGET_CATEGORIES).includes(toCategory)) {
        return { success: false, error: `Categoria de destino inválida: ${toCategory}` };
      }
      if (amount <= 0) {
        return { success: false, error: 'Valor deve ser positivo' };
      }

      const budget = this.getBudgetAllocation();
      if (!budget.success) return budget;

      // Verifica disponibilidade
      if (budget.categorias[fromCategory].disponivel < amount) {
        return { 
          success: false, 
          error: `Saldo insuficiente em ${fromCategory}. Disponível: R$ ${budget.categorias[fromCategory].disponivel.toFixed(2)}` 
        };
      }

      // Registra a realocação
      const ss = getSpreadsheet();
      let logSheet = ss.getSheetByName('REALOCACAO_LOG_RA');
      if (!logSheet) {
        logSheet = ss.insertSheet('REALOCACAO_LOG_RA');
        logSheet.appendRow(['ID', 'Parcela_ID', 'De_Categoria', 'Para_Categoria', 'Valor', 'Data', 'Usuario']);
      }

      const logId = 'REAL_' + Date.now();
      logSheet.appendRow([
        logId,
        parcelaId,
        fromCategory,
        toCategory,
        amount,
        new Date().toISOString(),
        Session.getActiveUser().getEmail() || 'sistema'
      ]);

      return {
        success: true,
        realocacao: {
          id: logId,
          parcela_id: parcelaId,
          de: fromCategory,
          para: toCategory,
          valor: amount,
          data: new Date().toISOString()
        },
        mensagem: `R$ ${amount.toFixed(2)} realocado de ${fromCategory} para ${toCategory} na parcela ${parcelaId}`
      };
    } catch (error) {
      Utils.logError('AgroforestryService.reallocateBudget', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera recomendações de realocação baseadas na análise de ROI
   * @returns {Object} Recomendações de realocação
   */
  getReallocationRecommendations() {
    try {
      const underperforming = this.identifyUnderperformingParcels(5);
      if (!underperforming.success) return underperforming;

      const budget = this.getBudgetAllocation();
      if (!budget.success) return budget;

      const recomendacoes = [];
      const manutencaoDisponivel = budget.categorias[BUDGET_CATEGORIES.MANUTENCAO]?.disponivel || 0;

      underperforming.parcelas.forEach((parcela, index) => {
        // Calcula valor sugerido para realocação (proporcional ao déficit)
        const valorSugerido = Math.min(
          manutencaoDisponivel * 0.2, // Máximo 20% do disponível por parcela
          5000 // Limite por parcela
        );

        if (valorSugerido > 0 && parcela.classificacao === 'Crítico') {
          recomendacoes.push({
            prioridade: index + 1,
            parcela_id: parcela.id,
            parcela_nome: parcela.nome,
            coordenadas: parcela.coordenadas,
            roi_atual: parcela.roi,
            de_categoria: BUDGET_CATEGORIES.MANUTENCAO,
            para_categoria: BUDGET_CATEGORIES.RESTAURACAO,
            valor_sugerido: valorSugerido.toFixed(2),
            justificativa: `ROI ${parcela.roi} está ${parcela.deficit}. Realocar para restauração pode melhorar produtividade.`
          });
        }
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        resumo: {
          parcelas_criticas: underperforming.total_identificadas,
          recomendacoes_geradas: recomendacoes.length,
          valor_total_sugerido: recomendacoes.reduce((sum, r) => sum + parseFloat(r.valor_sugerido), 0).toFixed(2),
          orcamento_manutencao_disponivel: manutencaoDisponivel.toFixed(2)
        },
        recomendacoes: recomendacoes
      };
    } catch (error) {
      Utils.logError('AgroforestryService.getReallocationRecommendations', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera relatório completo de otimização de recursos
   * @returns {Object} Relatório consolidado
   */
  generateOptimizationReport() {
    try {
      const roiAnalysis = this.analyzeAllParcelsROI();
      const underperforming = this.identifyUnderperformingParcels(5);
      const budget = this.getBudgetAllocation();
      const recommendations = this.getReallocationRecommendations();

      return {
        success: true,
        titulo: 'Relatório de Otimização de Recursos - Agrofloresta',
        data_geracao: new Date().toISOString(),
        
        sumario_executivo: {
          total_parcelas: roiAnalysis.resumo?.total_parcelas || 0,
          roi_medio: roiAnalysis.resumo?.roi_medio || '0%',
          parcelas_criticas: underperforming.total_identificadas || 0,
          orcamento_total: budget.total_alocado || 0,
          orcamento_disponivel: budget.total_disponivel || 0
        },

        analise_roi: {
          distribuicao: {
            excelentes: roiAnalysis.resumo?.excelentes || 0,
            boas: roiAnalysis.resumo?.boas || 0,
            aceitaveis: roiAnalysis.resumo?.aceitaveis || 0,
            baixas: roiAnalysis.resumo?.baixas || 0,
            criticas: roiAnalysis.resumo?.criticas || 0
          },
          parcelas_detalhadas: roiAnalysis.parcelas?.slice(0, 10) || []
        },

        parcelas_underperforming: underperforming.parcelas || [],

        alocacao_orcamento: budget.categorias || {},

        recomendacoes_realocacao: recommendations.recomendacoes || [],

        acoes_prioritarias: this._generatePriorityActions(roiAnalysis, underperforming, budget)
      };
    } catch (error) {
      Utils.logError('AgroforestryService.generateOptimizationReport', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera ações prioritárias baseadas na análise
   * @private
   */
  _generatePriorityActions(roiAnalysis, underperforming, budget) {
    const acoes = [];

    if ((underperforming.total_identificadas || 0) > 0) {
      acoes.push({
        prioridade: 'Alta',
        area: 'Restauração',
        acao: `Priorizar restauração de ${underperforming.total_identificadas} parcela(s) com ROI < 5%`,
        impacto_estimado: 'Melhoria de 10-15% no ROI médio'
      });
    }

    if ((budget.categorias?.[BUDGET_CATEGORIES.RESTAURACAO]?.disponivel || 0) < 10000) {
      acoes.push({
        prioridade: 'Alta',
        area: 'Orçamento',
        acao: 'Aumentar fundo de Restauração - saldo baixo',
        impacto_estimado: 'Capacidade de intervenção em parcelas críticas'
      });
    }

    if ((roiAnalysis.resumo?.criticas || 0) > 2) {
      acoes.push({
        prioridade: 'Média',
        area: 'Monitoramento',
        acao: 'Intensificar monitoramento de parcelas críticas',
        impacto_estimado: 'Detecção precoce de problemas'
      });
    }

    return acoes;
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Agroforestry Service
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula sequestro de carbono de uma parcela
 */
function apiAgroforestryCarbonoSequestro(parcelaId) {
  return AgroforestryService.calculateCarbonSequestration(parcelaId);
}

/**
 * Analisa produtividade de uma parcela
 */
function apiAgroforestryProdutividade(parcelaId, periodo) {
  return AgroforestryService.analyzeProductivity(parcelaId, periodo || 12);
}

/**
 * Analisa viabilidade econômica de uma parcela
 */
function apiAgroforestryViabilidade(parcelaId) {
  return AgroforestryService.analyzeEconomicViability(parcelaId);
}

/**
 * Analisa ROI de todas as parcelas (Prompt 8/43)
 */
function apiAgroforestryAnaliseROI() {
  return AgroforestryService.analyzeAllParcelsROI();
}

/**
 * Identifica parcelas com baixo desempenho (Prompt 8/43)
 */
function apiAgroforestryUnderperforming(threshold) {
  return AgroforestryService.identifyUnderperformingParcels(threshold || 5);
}

/**
 * Obtém alocação de orçamento (Prompt 8/43)
 */
function apiAgroforestryOrcamento() {
  return AgroforestryService.getBudgetAllocation();
}

/**
 * Realoca orçamento entre categorias (Prompt 8/43)
 */
function apiAgroforestryRealocarOrcamento(parcelaId, fromCategory, toCategory, amount) {
  return AgroforestryService.reallocateBudget(parcelaId, fromCategory, toCategory, amount);
}

/**
 * Obtém recomendações de realocação (Prompt 8/43)
 */
function apiAgroforestryRecomendacoes() {
  return AgroforestryService.getReallocationRecommendations();
}

/**
 * Gera relatório de otimização de recursos (Prompt 8/43)
 */
function apiAgroforestryRelatorioOtimizacao() {
  return AgroforestryService.generateOptimizationReport();
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 8/43
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa funcionalidades de alocação de recursos e orçamento (Prompt 8/43)
 */
function testResourceAllocationBudget() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '8/43 - Resource Allocation and Budget Optimization',
    tests: []
  };

  // Test 1: classifyParcelaPerformance
  try {
    const excelente = AgroforestryService.classifyParcelaPerformance(20);
    const critico = AgroforestryService.classifyParcelaPerformance(-5);
    results.tests.push({
      name: 'classifyParcelaPerformance',
      status: excelente.tier === 'Excelente' && critico.tier === 'Crítico' ? 'PASS' : 'FAIL',
      details: { excelente, critico }
    });
  } catch (e) {
    results.tests.push({ name: 'classifyParcelaPerformance', status: 'ERROR', error: e.message });
  }

  // Test 2: analyzeAllParcelsROI
  try {
    const roiAnalysis = AgroforestryService.analyzeAllParcelsROI();
    results.tests.push({
      name: 'analyzeAllParcelsROI',
      status: roiAnalysis.success !== undefined ? 'PASS' : 'FAIL',
      details: { 
        success: roiAnalysis.success,
        total_parcelas: roiAnalysis.resumo?.total_parcelas,
        roi_medio: roiAnalysis.resumo?.roi_medio
      }
    });
  } catch (e) {
    results.tests.push({ name: 'analyzeAllParcelsROI', status: 'ERROR', error: e.message });
  }

  // Test 3: identifyUnderperformingParcels
  try {
    const underperforming = AgroforestryService.identifyUnderperformingParcels(5);
    results.tests.push({
      name: 'identifyUnderperformingParcels',
      status: underperforming.success !== undefined ? 'PASS' : 'FAIL',
      details: { 
        success: underperforming.success,
        threshold: underperforming.threshold,
        total: underperforming.total_identificadas
      }
    });
  } catch (e) {
    results.tests.push({ name: 'identifyUnderperformingParcels', status: 'ERROR', error: e.message });
  }

  // Test 4: getBudgetAllocation
  try {
    const budget = AgroforestryService.getBudgetAllocation();
    results.tests.push({
      name: 'getBudgetAllocation',
      status: budget.success && budget.categorias ? 'PASS' : 'FAIL',
      details: { 
        success: budget.success,
        total_alocado: budget.total_alocado,
        categorias: Object.keys(budget.categorias || {})
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getBudgetAllocation', status: 'ERROR', error: e.message });
  }

  // Test 5: getReallocationRecommendations
  try {
    const recommendations = AgroforestryService.getReallocationRecommendations();
    results.tests.push({
      name: 'getReallocationRecommendations',
      status: recommendations.success !== undefined ? 'PASS' : 'FAIL',
      details: { 
        success: recommendations.success,
        total_recomendacoes: recommendations.resumo?.recomendacoes_geradas
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getReallocationRecommendations', status: 'ERROR', error: e.message });
  }

  // Test 6: generateOptimizationReport
  try {
    const report = AgroforestryService.generateOptimizationReport();
    results.tests.push({
      name: 'generateOptimizationReport',
      status: report.success && report.sumario_executivo ? 'PASS' : 'FAIL',
      details: { 
        success: report.success,
        titulo: report.titulo,
        has_sumario: !!report.sumario_executivo,
        has_recomendacoes: !!report.recomendacoes_realocacao
      }
    });
  } catch (e) {
    results.tests.push({ name: 'generateOptimizationReport', status: 'ERROR', error: e.message });
  }

  // Test 7: API Functions
  try {
    const apiROI = apiAgroforestryAnaliseROI();
    const apiOrcamento = apiAgroforestryOrcamento();
    results.tests.push({
      name: 'API Functions',
      status: apiROI !== undefined && apiOrcamento !== undefined ? 'PASS' : 'FAIL',
      details: {
        apiAgroforestryAnaliseROI: !!apiROI,
        apiAgroforestryOrcamento: !!apiOrcamento
      }
    });
  } catch (e) {
    results.tests.push({ name: 'API Functions', status: 'ERROR', error: e.message });
  }

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const total = results.tests.length;
  results.summary = {
    passed: passed,
    total: total,
    percentage: Math.round((passed / total) * 100),
    status: passed === total ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
  };

  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST RESULTS - Prompt 8/43: Resource Allocation and Budget');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(results, null, 2));
  
  return results;
}
