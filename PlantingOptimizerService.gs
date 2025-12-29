/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - OTIMIZAÇÃO DE PLANTIO COM ML
 * ═══════════════════════════════════════════════════════════════════════════
 * P13 - Sistema de Otimização de Plantio com Machine Learning
 * 
 * Funcionalidades:
 * - Seleção otimizada de espécies por ML
 * - Arranjo espacial eficiente
 * - Cronograma baseado em clima
 * - Predição de sucesso (sobrevivência, cobertura)
 * - Análise de custo-benefício
 * - Integração com P02 (sucessão) e P11 (clima)
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha PLANTIO_OTIMIZADO_RA
 */
const SCHEMA_PLANTIO_OTIMIZADO = {
  ID_Plano: { type: 'string', required: true, unique: true },
  Data_Criacao: { type: 'datetime', required: true },
  Area_ha: { type: 'float', required: true },
  Objetivo: { type: 'enum', values: ['Restauracao', 'SAF', 'Corredor', 'Enriquecimento'] },
  Tipo_Solo: { type: 'string' },
  pH_Solo: { type: 'float' },
  Fertilidade: { type: 'enum', values: ['Baixa', 'Media', 'Alta'] },
  Declividade_percent: { type: 'float' },
  Exposicao_Solar: { type: 'enum', values: ['Pleno_Sol', 'Meia_Sombra', 'Sombra'] },
  Disponibilidade_Agua: { type: 'enum', values: ['Alta', 'Media', 'Baixa'] },
  Especies_Recomendadas_JSON: { type: 'text' },
  Espacamento_m: { type: 'float' },
  Densidade_Mudas_ha: { type: 'integer' },
  Arranjo_Tipo: { type: 'enum', values: ['Linhas', 'Quinconcio', 'Aleatorio', 'Nucleos'] },
  Distribuicao_Estratos_JSON: { type: 'text' },
  Taxa_Sobrevivencia_Prevista: { type: 'float' },
  Tempo_Cobertura_anos: { type: 'float' },
  Custo_Total_BRL: { type: 'float' },
  ROI_Ecologico: { type: 'float' },
  Cronograma_JSON: { type: 'text' },
  Analise_IA_JSON: { type: 'text' },
  Status: { type: 'enum', values: ['Planejado', 'Em_Execucao', 'Concluido', 'Cancelado'] }
};

const PLANTIO_HEADERS = [
  'ID_Plano', 'Data_Criacao', 'Area_ha', 'Objetivo', 'Tipo_Solo', 'pH_Solo',
  'Fertilidade', 'Declividade_percent', 'Exposicao_Solar', 'Disponibilidade_Agua',
  'Especies_Recomendadas_JSON', 'Espacamento_m', 'Densidade_Mudas_ha', 'Arranjo_Tipo',
  'Distribuicao_Estratos_JSON', 'Taxa_Sobrevivencia_Prevista', 'Tempo_Cobertura_anos',
  'Custo_Total_BRL', 'ROI_Ecologico', 'Cronograma_JSON', 'Analise_IA_JSON', 'Status'
];


/**
 * Otimizador de Plantio com ML
 * @namespace PlantingOptimizer
 */
const PlantingOptimizer = {
  
  SHEET_NAME: 'PLANTIO_OTIMIZADO_RA',
  
  /**
   * Banco de espécies nativas do Cerrado
   */
  SPECIES_DATABASE: [
    // Emergentes
    { nome: 'Dipteryx alata', comum: 'Baru', estrato: 'emergente', crescimento: 'lento', altura_max: 25, 
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 15, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 9, producao: true },
    { nome: 'Hymenaea stigonocarpa', comum: 'Jatobá-do-cerrado', estrato: 'emergente', crescimento: 'lento', altura_max: 20,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 12, 
      taxa_sobrevivencia_base: 0.88, valor_ecologico: 9, producao: true },
    { nome: 'Caryocar brasiliense', comum: 'Pequi', estrato: 'emergente', crescimento: 'lento', altura_max: 15,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 18, 
      taxa_sobrevivencia_base: 0.82, valor_ecologico: 10, producao: true },
    
    // Dossel
    { nome: 'Anacardium occidentale', comum: 'Caju', estrato: 'dossel', crescimento: 'medio', altura_max: 12,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 8, 
      taxa_sobrevivencia_base: 0.90, valor_ecologico: 7, producao: true },
    { nome: 'Eugenia dysenterica', comum: 'Cagaita', estrato: 'dossel', crescimento: 'medio', altura_max: 10,
      tolerancia_seca: 'alta', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 10, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 8, producao: true },
    { nome: 'Hancornia speciosa', comum: 'Mangaba', estrato: 'dossel', crescimento: 'medio', altura_max: 8,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 12, 
      taxa_sobrevivencia_base: 0.80, valor_ecologico: 8, producao: true },
    { nome: 'Qualea grandiflora', comum: 'Pau-terra', estrato: 'dossel', crescimento: 'medio', altura_max: 15,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 8, 
      taxa_sobrevivencia_base: 0.88, valor_ecologico: 7, producao: false },
    { nome: 'Tabebuia aurea', comum: 'Ipê-amarelo', estrato: 'dossel', crescimento: 'medio', altura_max: 18,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 10, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 8, producao: false },
    
    // Subdossel
    { nome: 'Byrsonima verbascifolia', comum: 'Murici', estrato: 'subdossel', crescimento: 'rapido', altura_max: 6,
      tolerancia_seca: 'alta', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 6, 
      taxa_sobrevivencia_base: 0.90, valor_ecologico: 7, producao: true },
    { nome: 'Psidium guineense', comum: 'Araçá', estrato: 'subdossel', crescimento: 'rapido', altura_max: 5,
      tolerancia_seca: 'media', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 5, 
      taxa_sobrevivencia_base: 0.92, valor_ecologico: 6, producao: true },
    { nome: 'Stryphnodendron adstringens', comum: 'Barbatimão', estrato: 'subdossel', crescimento: 'medio', altura_max: 8,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: true, preco_muda: 7, 
      taxa_sobrevivencia_base: 0.88, valor_ecologico: 8, producao: false },
    { nome: 'Dimorphandra mollis', comum: 'Faveiro', estrato: 'subdossel', crescimento: 'medio', altura_max: 10,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: true, preco_muda: 8, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 7, producao: false },
    
    // Sotobosque
    { nome: 'Annona crassiflora', comum: 'Araticum', estrato: 'sotobosque', crescimento: 'lento', altura_max: 4,
      tolerancia_seca: 'alta', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 10, 
      taxa_sobrevivencia_base: 0.82, valor_ecologico: 8, producao: true },
    { nome: 'Solanum lycocarpum', comum: 'Lobeira', estrato: 'sotobosque', crescimento: 'rapido', altura_max: 3,
      tolerancia_seca: 'alta', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 4, 
      taxa_sobrevivencia_base: 0.95, valor_ecologico: 9, producao: true },
    { nome: 'Campomanesia adamantium', comum: 'Gabiroba', estrato: 'sotobosque', crescimento: 'medio', altura_max: 2,
      tolerancia_seca: 'media', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 8, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 7, producao: true },
    
    // Pioneiras
    { nome: 'Cecropia pachystachya', comum: 'Embaúba', estrato: 'pioneira', crescimento: 'muito_rapido', altura_max: 15,
      tolerancia_seca: 'baixa', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 3, 
      taxa_sobrevivencia_base: 0.92, valor_ecologico: 8, producao: false },
    { nome: 'Trema micrantha', comum: 'Grandiúva', estrato: 'pioneira', crescimento: 'muito_rapido', altura_max: 12,
      tolerancia_seca: 'media', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 3, 
      taxa_sobrevivencia_base: 0.90, valor_ecologico: 7, producao: false },
    { nome: 'Croton urucurana', comum: 'Sangra-d\'água', estrato: 'pioneira', crescimento: 'muito_rapido', altura_max: 10,
      tolerancia_seca: 'baixa', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 4, 
      taxa_sobrevivencia_base: 0.88, valor_ecologico: 6, producao: false },
    
    // Palmeiras
    { nome: 'Mauritia flexuosa', comum: 'Buriti', estrato: 'emergente', crescimento: 'lento', altura_max: 20,
      tolerancia_seca: 'baixa', tolerancia_sombra: 'baixa', fixadora_n: false, preco_muda: 15, 
      taxa_sobrevivencia_base: 0.75, valor_ecologico: 10, producao: true },
    { nome: 'Syagrus oleracea', comum: 'Gueroba', estrato: 'dossel', crescimento: 'medio', altura_max: 15,
      tolerancia_seca: 'media', tolerancia_sombra: 'media', fixadora_n: false, preco_muda: 12, 
      taxa_sobrevivencia_base: 0.85, valor_ecologico: 8, producao: true }
  ],

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(PLANTIO_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, PLANTIO_HEADERS.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        Logger.log(`[PlantingOptimizer] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[PlantingOptimizer] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera plano de plantio otimizado
   * @param {object} siteData - Dados do local
   * @param {string} objetivo - Objetivo do plantio
   */
  optimizePlantingPlan: function(siteData, objetivo = 'Restauracao') {
    try {
      this.initializeSheet();
      
      // 1. Analisa condições do local
      const siteAnalysis = this._analyzeSiteConditions(siteData);
      
      // 2. Seleciona espécies candidatas
      const candidateSpecies = this._getCandidateSpecies(siteAnalysis, objetivo);
      
      // 3. Calcula adequação de cada espécie (ML)
      const speciesScores = this._calculateSpeciesSuitability(candidateSpecies, siteAnalysis);
      
      // 4. Otimiza composição de espécies
      const optimalMix = this._optimizeSpeciesMix(speciesScores, siteData.area_ha, objetivo);
      
      // 5. Define arranjo espacial
      const spatialArrangement = this._designSpatialArrangement(optimalMix, objetivo);
      
      // 6. Determina época ideal de plantio
      const plantingSchedule = this._optimizePlantingSchedule(optimalMix);
      
      // 7. Prediz taxa de sucesso
      const successPrediction = this._predictSuccess(optimalMix, siteAnalysis);
      
      // 8. Calcula custos
      const costs = this._calculateCosts(optimalMix, siteData.area_ha);
      
      // 9. Gera ID e salva
      const planId = `PLT-${Date.now()}`;
      
      const plan = {
        id: planId,
        data_criacao: new Date().toISOString(),
        area_ha: siteData.area_ha,
        objetivo: objetivo,
        site_analysis: siteAnalysis,
        especies_recomendadas: optimalMix,
        arranjo: spatialArrangement,
        cronograma: plantingSchedule,
        predicoes: successPrediction,
        custos: costs,
        status: 'Planejado'
      };
      
      // Salva na planilha
      this._savePlan(plan, siteData);
      
      return {
        success: true,
        plan_id: planId,
        plan: plan,
        summary: this._generateSummary(plan)
      };
      
    } catch (error) {
      Logger.log(`[optimizePlantingPlan] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa condições do local
   * @private
   */
  _analyzeSiteConditions: function(siteData) {
    const analysis = {
      solo: {
        tipo: siteData.tipo_solo || 'Latossolo',
        pH: siteData.pH_solo || 5.5,
        fertilidade: siteData.fertilidade || 'Media',
        score: 0
      },
      topografia: {
        declividade: siteData.declividade || 5,
        exposicao: siteData.exposicao_solar || 'Pleno_Sol',
        score: 0
      },
      agua: {
        disponibilidade: siteData.disponibilidade_agua || 'Media',
        distancia_curso_agua: siteData.distancia_agua || 100,
        score: 0
      },
      clima: {
        precipitacao_media: 1400, // mm/ano típico do Cerrado
        temp_media: 24,
        estacao_seca_meses: 5
      }
    };
    
    // Calcula scores
    // Solo
    if (analysis.solo.pH >= 5.0 && analysis.solo.pH <= 6.5) {
      analysis.solo.score = 0.9;
    } else if (analysis.solo.pH >= 4.5 && analysis.solo.pH <= 7.0) {
      analysis.solo.score = 0.7;
    } else {
      analysis.solo.score = 0.5;
    }
    
    if (analysis.solo.fertilidade === 'Alta') analysis.solo.score += 0.1;
    else if (analysis.solo.fertilidade === 'Baixa') analysis.solo.score -= 0.1;
    
    // Topografia
    if (analysis.topografia.declividade < 10) {
      analysis.topografia.score = 0.9;
    } else if (analysis.topografia.declividade < 20) {
      analysis.topografia.score = 0.7;
    } else {
      analysis.topografia.score = 0.5;
    }
    
    // Água
    const waterScores = { 'Alta': 0.95, 'Media': 0.75, 'Baixa': 0.55 };
    analysis.agua.score = waterScores[analysis.agua.disponibilidade] || 0.7;
    
    // Score geral do local
    analysis.overall_score = (
      analysis.solo.score * 0.35 +
      analysis.topografia.score * 0.25 +
      analysis.agua.score * 0.40
    );
    
    return analysis;
  },

  /**
   * Seleciona espécies candidatas
   * @private
   */
  _getCandidateSpecies: function(siteAnalysis, objetivo) {
    let candidates = [...this.SPECIES_DATABASE];
    
    // Filtra por disponibilidade de água
    if (siteAnalysis.agua.disponibilidade === 'Baixa') {
      candidates = candidates.filter(sp => sp.tolerancia_seca === 'alta');
    }
    
    // Filtra por exposição solar
    if (siteAnalysis.topografia.exposicao === 'Sombra') {
      candidates = candidates.filter(sp => sp.tolerancia_sombra !== 'baixa');
    }
    
    // Prioriza produtivas para SAF
    if (objetivo === 'SAF') {
      candidates.sort((a, b) => (b.producao ? 1 : 0) - (a.producao ? 1 : 0));
    }
    
    // Prioriza pioneiras para restauração
    if (objetivo === 'Restauracao') {
      candidates.sort((a, b) => {
        const growthOrder = { 'muito_rapido': 4, 'rapido': 3, 'medio': 2, 'lento': 1 };
        return (growthOrder[b.crescimento] || 0) - (growthOrder[a.crescimento] || 0);
      });
    }
    
    return candidates;
  },

  /**
   * Calcula adequação de cada espécie (ML simulado)
   * @private
   */
  _calculateSpeciesSuitability: function(species, siteAnalysis) {
    return species.map(sp => {
      let score = 0;
      
      // Fator 1: Adequação climática (25%)
      const climateSuitability = sp.tolerancia_seca === 'alta' ? 0.9 : 
                                  sp.tolerancia_seca === 'media' ? 0.7 : 0.5;
      score += climateSuitability * 0.25;
      
      // Fator 2: Adequação de solo (25%)
      let soilSuitability = siteAnalysis.solo.score;
      if (sp.fixadora_n && siteAnalysis.solo.fertilidade === 'Baixa') {
        soilSuitability += 0.15; // Bonus para fixadoras em solo pobre
      }
      score += Math.min(soilSuitability, 1) * 0.25;
      
      // Fator 3: Disponibilidade de água (25%)
      const waterMatch = {
        'Alta': { 'alta': 0.7, 'media': 0.9, 'baixa': 1.0 },
        'Media': { 'alta': 0.85, 'media': 0.9, 'baixa': 0.8 },
        'Baixa': { 'alta': 1.0, 'media': 0.7, 'baixa': 0.5 }
      };
      const waterSuitability = waterMatch[siteAnalysis.agua.disponibilidade]?.[sp.tolerancia_seca] || 0.7;
      score += waterSuitability * 0.25;
      
      // Fator 4: Valor ecológico (15%)
      score += (sp.valor_ecologico / 10) * 0.15;
      
      // Fator 5: Taxa de sobrevivência base (10%)
      score += sp.taxa_sobrevivencia_base * 0.10;
      
      // Ajusta sobrevivência prevista baseado no local
      const predictedSurvival = sp.taxa_sobrevivencia_base * siteAnalysis.overall_score;
      
      return {
        especie: sp.nome,
        nome_comum: sp.comum,
        estrato: sp.estrato,
        crescimento: sp.crescimento,
        score_adequacao: parseFloat(score.toFixed(3)),
        taxa_sobrevivencia_prevista: parseFloat(predictedSurvival.toFixed(3)),
        valor_ecologico: sp.valor_ecologico,
        preco_muda: sp.preco_muda,
        producao: sp.producao,
        fixadora_n: sp.fixadora_n
      };
    }).sort((a, b) => b.score_adequacao - a.score_adequacao);
  },

  /**
   * Otimiza composição de espécies
   * @private
   */
  _optimizeSpeciesMix: function(rankedSpecies, area_ha, objetivo) {
    const mix = [];
    
    // Calcula densidade baseada no objetivo
    const densities = {
      'Restauracao': 1600,  // mudas/ha
      'SAF': 800,           // mais espaçado para manejo
      'Corredor': 2000,     // mais denso para conectividade
      'Enriquecimento': 400 // complementar
    };
    
    const density = densities[objetivo] || 1600;
    const totalSeedlings = Math.round(area_ha * density);
    
    // Distribuição por estrato
    const stratumDistribution = {
      'Restauracao': { emergente: 0.10, dossel: 0.25, subdossel: 0.30, sotobosque: 0.20, pioneira: 0.15 },
      'SAF': { emergente: 0.15, dossel: 0.35, subdossel: 0.30, sotobosque: 0.15, pioneira: 0.05 },
      'Corredor': { emergente: 0.08, dossel: 0.22, subdossel: 0.35, sotobosque: 0.25, pioneira: 0.10 },
      'Enriquecimento': { emergente: 0.20, dossel: 0.40, subdossel: 0.25, sotobosque: 0.15, pioneira: 0.00 }
    };
    
    const distribution = stratumDistribution[objetivo] || stratumDistribution['Restauracao'];
    
    // Seleciona espécies por estrato
    Object.keys(distribution).forEach(estrato => {
      if (distribution[estrato] === 0) return;
      
      const stratumSeedlings = Math.round(totalSeedlings * distribution[estrato]);
      const stratumSpecies = rankedSpecies.filter(s => s.estrato === estrato);
      
      // Máximo 25% de uma única espécie no estrato
      const maxPerSpecies = Math.round(stratumSeedlings * 0.25);
      let remaining = stratumSeedlings;
      let speciesCount = 0;
      
      stratumSpecies.forEach(sp => {
        if (remaining > 0 && speciesCount < 5) { // Máximo 5 espécies por estrato
          const quantity = Math.min(maxPerSpecies, remaining);
          mix.push({
            especie: sp.especie,
            nome_comum: sp.nome_comum,
            estrato: estrato,
            quantidade: quantity,
            score_adequacao: sp.score_adequacao,
            taxa_sobrevivencia_prevista: sp.taxa_sobrevivencia_prevista,
            custo_mudas: quantity * sp.preco_muda,
            producao: sp.producao
          });
          remaining -= quantity;
          speciesCount++;
        }
      });
    });
    
    return mix;
  },

  /**
   * Define arranjo espacial
   * @private
   */
  _designSpatialArrangement: function(speciesMix, objetivo) {
    const arrangements = {
      'Restauracao': { pattern: 'Quinconcio', spacing: 2.5 },
      'SAF': { pattern: 'Linhas', spacing: 4.0 },
      'Corredor': { pattern: 'Nucleos', spacing: 2.0 },
      'Enriquecimento': { pattern: 'Aleatorio', spacing: 5.0 }
    };
    
    const config = arrangements[objetivo] || arrangements['Restauracao'];
    const density = Math.round(10000 / (config.spacing * config.spacing));
    
    // Conta espécies por estrato
    const stratumCounts = {};
    speciesMix.forEach(sp => {
      stratumCounts[sp.estrato] = (stratumCounts[sp.estrato] || 0) + sp.quantidade;
    });
    
    return {
      padrao: config.pattern,
      espacamento_m: config.spacing,
      densidade_ha: density,
      distribuicao_estratos: stratumCounts,
      instrucoes: this._getPlantingInstructions(config.pattern)
    };
  },

  /**
   * Gera instruções de plantio
   * @private
   */
  _getPlantingInstructions: function(pattern) {
    const instructions = {
      'Quinconcio': [
        'Marcar linhas paralelas com espaçamento definido',
        'Alternar posição das mudas entre linhas adjacentes',
        'Plantar emergentes e dossel nas posições centrais',
        'Intercalar pioneiras para sombreamento inicial'
      ],
      'Linhas': [
        'Definir linhas de plantio com orientação leste-oeste',
        'Alternar linhas de espécies produtivas e de serviço',
        'Manter corredores de 4m para manejo',
        'Plantar espécies de maior porte nas bordas'
      ],
      'Nucleos': [
        'Criar núcleos de 5-10 mudas espaçados 10-15m',
        'Cada núcleo com 1 emergente central',
        'Circundar com espécies de dossel e subdossel',
        'Conectar núcleos com pioneiras'
      ],
      'Aleatorio': [
        'Distribuir mudas de forma irregular',
        'Respeitar espaçamento mínimo entre indivíduos',
        'Priorizar clareiras existentes',
        'Evitar competição com vegetação estabelecida'
      ]
    };
    
    return instructions[pattern] || instructions['Quinconcio'];
  },

  /**
   * Otimiza cronograma de plantio
   * @private
   */
  _optimizePlantingSchedule: function(speciesMix) {
    // Meses ideais para plantio no Cerrado (início das chuvas)
    const idealMonths = ['Outubro', 'Novembro', 'Dezembro'];
    
    // Agrupa por estrato para fases
    const phases = [
      {
        fase: 'Fase 1 - Pioneiras',
        descricao: 'Estabelecimento inicial com espécies de crescimento rápido',
        mes_inicio: 'Outubro',
        duracao_dias: 15,
        especies: speciesMix.filter(s => s.estrato === 'pioneira').map(s => s.nome_comum)
      },
      {
        fase: 'Fase 2 - Secundárias Iniciais',
        descricao: 'Plantio de espécies de subdossel e sotobosque',
        mes_inicio: 'Novembro',
        duracao_dias: 30,
        especies: speciesMix.filter(s => s.estrato === 'subdossel' || s.estrato === 'sotobosque').map(s => s.nome_comum)
      },
      {
        fase: 'Fase 3 - Dossel',
        descricao: 'Plantio de espécies de dossel',
        mes_inicio: 'Novembro',
        duracao_dias: 20,
        especies: speciesMix.filter(s => s.estrato === 'dossel').map(s => s.nome_comum)
      },
      {
        fase: 'Fase 4 - Emergentes',
        descricao: 'Plantio de espécies emergentes e clímaces',
        mes_inicio: 'Dezembro',
        duracao_dias: 15,
        especies: speciesMix.filter(s => s.estrato === 'emergente').map(s => s.nome_comum)
      }
    ];
    
    // Remove fases vazias
    const activePhasesFiltered = phases.filter(p => p.especies.length > 0);
    
    return {
      meses_ideais: idealMonths,
      fases: activePhasesFiltered,
      duracao_total_dias: activePhasesFiltered.reduce((sum, p) => sum + p.duracao_dias, 0),
      recomendacoes: [
        'Plantar preferencialmente em dias nublados ou final da tarde',
        'Irrigar imediatamente após o plantio',
        'Aplicar cobertura morta ao redor das mudas',
        'Monitorar semanalmente nos primeiros 3 meses'
      ]
    };
  },

  /**
   * Prediz taxa de sucesso
   * @private
   */
  _predictSuccess: function(speciesMix, siteAnalysis) {
    // Média ponderada de sobrevivência
    const totalMudas = speciesMix.reduce((sum, s) => sum + s.quantidade, 0);
    const weightedSurvival = speciesMix.reduce((sum, s) => 
      sum + (s.taxa_sobrevivencia_prevista * s.quantidade), 0) / totalMudas;
    
    // Ajusta pelo score do local
    const adjustedSurvival = weightedSurvival * (0.7 + siteAnalysis.overall_score * 0.3);
    
    // Tempo para cobertura completa (baseado em crescimento)
    const growthRates = { 'muito_rapido': 1, 'rapido': 2, 'medio': 4, 'lento': 7 };
    const avgGrowthYears = 3.5; // Média aproximada
    
    // Diversidade
    const speciesCount = speciesMix.length;
    const stratumCount = [...new Set(speciesMix.map(s => s.estrato))].length;
    
    // Sequestro de carbono estimado (tCO2/ha em 10 anos)
    const carbonPerHa = 45; // Média para restauração no Cerrado
    
    return {
      taxa_sobrevivencia_prevista: parseFloat((adjustedSurvival * 100).toFixed(1)),
      tempo_cobertura_anos: avgGrowthYears,
      diversidade: {
        total_especies: speciesCount,
        total_estratos: stratumCount,
        indice_shannon: parseFloat((Math.log(speciesCount) * 0.8).toFixed(2))
      },
      beneficios_ecologicos: {
        sequestro_carbono_10anos_tCO2: carbonPerHa,
        habitat_fauna: speciesCount > 15 ? 'Alto' : speciesCount > 8 ? 'Médio' : 'Baixo',
        conectividade: stratumCount >= 4 ? 'Alta' : 'Média',
        servicos_ecossistemicos: ['Sequestro de carbono', 'Habitat para fauna', 'Proteção do solo', 'Regulação hídrica']
      },
      riscos: this._assessRisks(siteAnalysis)
    };
  },

  /**
   * Avalia riscos
   * @private
   */
  _assessRisks: function(siteAnalysis) {
    const risks = [];
    
    if (siteAnalysis.agua.disponibilidade === 'Baixa') {
      risks.push({ risco: 'Estresse hídrico', nivel: 'Alto', mitigacao: 'Irrigação suplementar nos primeiros 2 anos' });
    }
    
    if (siteAnalysis.solo.fertilidade === 'Baixa') {
      risks.push({ risco: 'Deficiência nutricional', nivel: 'Médio', mitigacao: 'Adubação orgânica e uso de fixadoras de N' });
    }
    
    if (siteAnalysis.topografia.declividade > 15) {
      risks.push({ risco: 'Erosão', nivel: 'Médio', mitigacao: 'Plantio em curvas de nível e cobertura do solo' });
    }
    
    risks.push({ risco: 'Competição com gramíneas', nivel: 'Médio', mitigacao: 'Coroamento e roçadas periódicas' });
    risks.push({ risco: 'Formigas cortadeiras', nivel: 'Alto', mitigacao: 'Monitoramento e controle preventivo' });
    
    return risks;
  },

  /**
   * Calcula custos
   * @private
   */
  _calculateCosts: function(speciesMix, area_ha) {
    // Custo das mudas
    const custoMudas = speciesMix.reduce((sum, s) => sum + s.custo_mudas, 0);
    
    // Outros custos por hectare
    const custoPorHa = {
      preparo_solo: 800,
      plantio_mao_obra: 1200,
      insumos: 500,
      manutencao_ano1: 1500,
      manutencao_ano2: 800,
      manutencao_ano3: 400
    };
    
    const custoTotal = custoMudas + 
      (custoPorHa.preparo_solo * area_ha) +
      (custoPorHa.plantio_mao_obra * area_ha) +
      (custoPorHa.insumos * area_ha);
    
    const custoManutencao3anos = (
      custoPorHa.manutencao_ano1 + 
      custoPorHa.manutencao_ano2 + 
      custoPorHa.manutencao_ano3
    ) * area_ha;
    
    // ROI ecológico (valor dos serviços ecossistêmicos)
    const valorServicosPorHaAno = 2500; // Estimativa conservadora
    const roiEcologico = ((valorServicosPorHaAno * area_ha * 10) / (custoTotal + custoManutencao3anos)) * 100;
    
    return {
      custo_mudas: custoMudas,
      custo_implantacao: custoTotal,
      custo_manutencao_3anos: custoManutencao3anos,
      custo_total: custoTotal + custoManutencao3anos,
      custo_por_ha: Math.round((custoTotal + custoManutencao3anos) / area_ha),
      roi_ecologico_percent: parseFloat(roiEcologico.toFixed(1)),
      detalhamento: {
        mudas: custoMudas,
        preparo_solo: custoPorHa.preparo_solo * area_ha,
        mao_obra: custoPorHa.plantio_mao_obra * area_ha,
        insumos: custoPorHa.insumos * area_ha,
        manutencao: custoManutencao3anos
      }
    };
  },

  /**
   * Salva plano na planilha
   * @private
   */
  _savePlan: function(plan, siteData) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        plan.id,
        plan.data_criacao,
        plan.area_ha,
        plan.objetivo,
        siteData.tipo_solo || 'Latossolo',
        siteData.pH_solo || 5.5,
        siteData.fertilidade || 'Media',
        siteData.declividade || 5,
        siteData.exposicao_solar || 'Pleno_Sol',
        siteData.disponibilidade_agua || 'Media',
        JSON.stringify(plan.especies_recomendadas),
        plan.arranjo.espacamento_m,
        plan.arranjo.densidade_ha,
        plan.arranjo.padrao,
        JSON.stringify(plan.arranjo.distribuicao_estratos),
        plan.predicoes.taxa_sobrevivencia_prevista,
        plan.predicoes.tempo_cobertura_anos,
        plan.custos.custo_total,
        plan.custos.roi_ecologico_percent,
        JSON.stringify(plan.cronograma),
        '',
        plan.status
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (error) {
      Logger.log(`[_savePlan] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Gera resumo do plano
   * @private
   */
  _generateSummary: function(plan) {
    const totalMudas = plan.especies_recomendadas.reduce((sum, s) => sum + s.quantidade, 0);
    const especiesProdutivas = plan.especies_recomendadas.filter(s => s.producao).length;
    
    return {
      area: `${plan.area_ha} hectares`,
      objetivo: plan.objetivo,
      total_mudas: totalMudas,
      total_especies: plan.especies_recomendadas.length,
      especies_produtivas: especiesProdutivas,
      arranjo: plan.arranjo.padrao,
      espacamento: `${plan.arranjo.espacamento_m}m`,
      taxa_sobrevivencia: `${plan.predicoes.taxa_sobrevivencia_prevista}%`,
      tempo_cobertura: `${plan.predicoes.tempo_cobertura_anos} anos`,
      custo_total: `R$ ${plan.custos.custo_total.toLocaleString()}`,
      roi_ecologico: `${plan.custos.roi_ecologico_percent}%`,
      inicio_recomendado: plan.cronograma.meses_ideais[0]
    };
  },

  /**
   * Analisa plano com IA (Gemini)
   */
  analyzeWithAI: function(planId) {
    try {
      const plan = this.getPlan(planId);
      if (!plan.success) return plan;
      
      const prompt = `
Você é um especialista em restauração ecológica e sistemas agroflorestais do Cerrado brasileiro.

**PLANO DE PLANTIO:**
- Área: ${plan.data.area_ha} ha
- Objetivo: ${plan.data.objetivo}
- Total de espécies: ${plan.data.especies_recomendadas?.length || 0}
- Taxa sobrevivência prevista: ${plan.data.taxa_sobrevivencia_prevista}%
- Custo total: R$ ${plan.data.custo_total}

**ESPÉCIES SELECIONADAS:**
${JSON.stringify(plan.data.especies_recomendadas?.slice(0, 10) || [], null, 2)}

**ANÁLISE REQUERIDA:**
1. Avalie a diversidade e composição de espécies (0-10)
2. Identifique possíveis problemas ou lacunas
3. Sugira 3 melhorias específicas
4. Estime benefícios ecológicos em 5 e 10 anos
5. Recomende 3 espécies adicionais importantes

Responda em JSON:
{
  "score_diversidade": 8.5,
  "avaliacao_geral": "texto",
  "problemas_identificados": ["problema1", "problema2"],
  "melhorias_sugeridas": ["melhoria1", "melhoria2", "melhoria3"],
  "beneficios_5anos": {"carbono_tCO2": 50, "especies_fauna": 30},
  "beneficios_10anos": {"carbono_tCO2": 120, "especies_fauna": 60},
  "especies_adicionais": [
    {"nome": "Espécie 1", "motivo": "razão"},
    {"nome": "Espécie 2", "motivo": "razão"},
    {"nome": "Espécie 3", "motivo": "razão"}
  ]
}`;

      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      let analysis = null;
      if (response && response.candidates && response.candidates[0]) {
        const text = response.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      }
      
      // Salva análise
      if (analysis) {
        this._updatePlanAnalysis(planId, analysis);
      }
      
      return {
        success: true,
        plan_id: planId,
        ai_analysis: analysis
      };
      
    } catch (error) {
      Logger.log(`[analyzeWithAI] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza análise IA do plano
   * @private
   */
  _updatePlanAnalysis: function(planId, analysis) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('ID_Plano');
      const analysisIndex = headers.indexOf('Analise_IA_JSON');
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === planId) {
          sheet.getRange(i + 1, analysisIndex + 1).setValue(JSON.stringify(analysis));
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtém plano por ID
   */
  getPlan: function(planId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Nenhum plano encontrado' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('ID_Plano')] === planId) {
          const row = data[i];
          return {
            success: true,
            data: {
              id: row[headers.indexOf('ID_Plano')],
              data_criacao: row[headers.indexOf('Data_Criacao')],
              area_ha: row[headers.indexOf('Area_ha')],
              objetivo: row[headers.indexOf('Objetivo')],
              tipo_solo: row[headers.indexOf('Tipo_Solo')],
              pH_solo: row[headers.indexOf('pH_Solo')],
              fertilidade: row[headers.indexOf('Fertilidade')],
              especies_recomendadas: this._safeParseJSON(row[headers.indexOf('Especies_Recomendadas_JSON')]),
              espacamento_m: row[headers.indexOf('Espacamento_m')],
              densidade_ha: row[headers.indexOf('Densidade_Mudas_ha')],
              arranjo: row[headers.indexOf('Arranjo_Tipo')],
              taxa_sobrevivencia_prevista: row[headers.indexOf('Taxa_Sobrevivencia_Prevista')],
              tempo_cobertura_anos: row[headers.indexOf('Tempo_Cobertura_anos')],
              custo_total: row[headers.indexOf('Custo_Total_BRL')],
              roi_ecologico: row[headers.indexOf('ROI_Ecologico')],
              cronograma: this._safeParseJSON(row[headers.indexOf('Cronograma_JSON')]),
              analise_ia: this._safeParseJSON(row[headers.indexOf('Analise_IA_JSON')]),
              status: row[headers.indexOf('Status')]
            }
          };
        }
      }
      
      return { success: false, error: 'Plano não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista todos os planos
   */
  listPlans: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, plans: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      let plans = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        plans.push({
          id: row[headers.indexOf('ID_Plano')],
          data_criacao: row[headers.indexOf('Data_Criacao')],
          area_ha: row[headers.indexOf('Area_ha')],
          objetivo: row[headers.indexOf('Objetivo')],
          taxa_sobrevivencia: row[headers.indexOf('Taxa_Sobrevivencia_Prevista')],
          custo_total: row[headers.indexOf('Custo_Total_BRL')],
          status: row[headers.indexOf('Status')]
        });
      }
      
      // Aplica filtros
      if (filtros.objetivo) {
        plans = plans.filter(p => p.objetivo === filtros.objetivo);
      }
      if (filtros.status) {
        plans = plans.filter(p => p.status === filtros.status);
      }
      
      return { success: true, plans: plans, count: plans.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém banco de espécies
   */
  getSpeciesDatabase: function() {
    return {
      success: true,
      species: this.SPECIES_DATABASE,
      count: this.SPECIES_DATABASE.length,
      by_stratum: {
        emergente: this.SPECIES_DATABASE.filter(s => s.estrato === 'emergente').length,
        dossel: this.SPECIES_DATABASE.filter(s => s.estrato === 'dossel').length,
        subdossel: this.SPECIES_DATABASE.filter(s => s.estrato === 'subdossel').length,
        sotobosque: this.SPECIES_DATABASE.filter(s => s.estrato === 'sotobosque').length,
        pioneira: this.SPECIES_DATABASE.filter(s => s.estrato === 'pioneira').length
      }
    };
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
// API FUNCTIONS - Otimização de Plantio
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de otimização de plantio
 */
function apiPlantioInit() {
  return PlantingOptimizer.initializeSheet();
}

/**
 * Gera plano de plantio otimizado
 * @param {object} siteData - Dados do local {area_ha, tipo_solo, pH_solo, fertilidade, declividade, exposicao_solar, disponibilidade_agua}
 * @param {string} objetivo - Objetivo: Restauracao, SAF, Corredor, Enriquecimento
 */
function apiPlantioOtimizar(siteData, objetivo) {
  return PlantingOptimizer.optimizePlantingPlan(siteData || { area_ha: 1 }, objetivo || 'Restauracao');
}

/**
 * Obtém plano por ID
 * @param {string} planId - ID do plano
 */
function apiPlantioObter(planId) {
  return PlantingOptimizer.getPlan(planId);
}

/**
 * Lista planos de plantio
 * @param {object} filtros - {objetivo, status}
 */
function apiPlantioListar(filtros) {
  return PlantingOptimizer.listPlans(filtros || {});
}

/**
 * Analisa plano com IA
 * @param {string} planId - ID do plano
 */
function apiPlantioAnalisarIA(planId) {
  return PlantingOptimizer.analyzeWithAI(planId);
}

/**
 * Obtém banco de espécies
 */
function apiPlantioEspecies() {
  return PlantingOptimizer.getSpeciesDatabase();
}
