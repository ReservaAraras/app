/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - MODELO DE MUDANÇAS CLIMÁTICAS LOCAIS
 * ═══════════════════════════════════════════════════════════════════════════
 * P11 - Predição de Impactos Ecológicos das Mudanças Climáticas
 * 
 * Funcionalidades:
 * - Projeções climáticas locais (2030-2050)
 * - 4 cenários RCP (2.6, 4.5, 6.0, 8.5)
 * - Predição de eventos extremos
 * - Avaliação de impactos ecológicos
 * - Planos de adaptação automatizados
 * - Recomendação de espécies resilientes
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha CLIMA_PREDICOES_RA
 */
const SCHEMA_CLIMA_PREDICOES = {
  ID_Predicao: { type: 'string', required: true, unique: true },
  Timestamp_Geracao: { type: 'datetime', required: true },
  Horizonte_Temporal: { type: 'enum', values: ['2030', '2040', '2050'] },
  Cenario_RCP: { type: 'enum', values: ['RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5'] },
  Temperatura_Media_Atual_C: { type: 'float' },
  Temperatura_Media_Futura_C: { type: 'float' },
  Delta_Temperatura_C: { type: 'float' },
  Precipitacao_Anual_Atual_mm: { type: 'float' },
  Precipitacao_Anual_Futura_mm: { type: 'float' },
  Delta_Precipitacao_percent: { type: 'float' },
  Dias_Onda_Calor_ano: { type: 'integer' },
  Dias_Seca_Prolongada_ano: { type: 'integer' },
  Eventos_Chuva_Intensa_ano: { type: 'integer' },
  Risco_Incendio_Score: { type: 'float', range: [0, 1] },
  Especies_Risco_JSON: { type: 'text' },
  Especies_Beneficiadas_JSON: { type: 'text' },
  Mudanca_Fenologia_dias: { type: 'integer' },
  Impacto_Polinizacao: { type: 'enum', values: ['Critico', 'Alto', 'Moderado', 'Baixo'] },
  Impacto_Dispersao: { type: 'enum', values: ['Critico', 'Alto', 'Moderado', 'Baixo'] },
  Acoes_Adaptacao_JSON: { type: 'text' },
  Especies_Plantio_JSON: { type: 'text' },
  Custo_Adaptacao_BRL: { type: 'float' },
  Confianca_Modelo: { type: 'float', range: [0, 1] }
};

const CLIMA_PREDICOES_HEADERS = [
  'ID_Predicao', 'Timestamp_Geracao', 'Horizonte_Temporal', 'Cenario_RCP',
  'Temperatura_Media_Atual_C', 'Temperatura_Media_Futura_C', 'Delta_Temperatura_C',
  'Precipitacao_Anual_Atual_mm', 'Precipitacao_Anual_Futura_mm', 'Delta_Precipitacao_percent',
  'Dias_Onda_Calor_ano', 'Dias_Seca_Prolongada_ano', 'Eventos_Chuva_Intensa_ano',
  'Risco_Incendio_Score', 'Especies_Risco_JSON', 'Especies_Beneficiadas_JSON',
  'Mudanca_Fenologia_dias', 'Impacto_Polinizacao', 'Impacto_Dispersao',
  'Acoes_Adaptacao_JSON', 'Especies_Plantio_JSON', 'Custo_Adaptacao_BRL', 'Confianca_Modelo'
];


/**
 * Motor de Modelagem Climática
 * @namespace ClimateModelEngine
 */
const ClimateModelEngine = {
  
  SHEET_NAME: 'CLIMA_PREDICOES_RA',
  
  /**
   * Dados climáticos de referência para o Cerrado (Reserva Araras)
   */
  BASELINE_CLIMATE: {
    temperatura_media_anual: 24.5, // °C
    temperatura_max_media: 31.2,
    temperatura_min_media: 17.8,
    precipitacao_anual: 1450, // mm
    umidade_relativa_media: 65, // %
    evapotranspiracao_anual: 1200, // mm
    dias_seca_ano: 120, // dias com precipitação < 1mm
    estacao_seca_meses: ['Maio', 'Junho', 'Julho', 'Agosto', 'Setembro']
  },
  
  /**
   * Fatores de ajuste por cenário RCP (IPCC AR5)
   */
  RCP_FACTORS: {
    'RCP2.6': {
      nome: 'Otimista (Mitigação Forte)',
      temp_2030: 0.8, temp_2040: 1.0, temp_2050: 1.0,
      precip_change: -0.05,
      extreme_factor: 1.1,
      description: 'Emissões reduzidas drasticamente, aquecimento limitado a 2°C'
    },
    'RCP4.5': {
      nome: 'Moderado (Estabilização)',
      temp_2030: 1.0, temp_2040: 1.4, temp_2050: 1.8,
      precip_change: -0.10,
      extreme_factor: 1.3,
      description: 'Emissões estabilizadas até 2050, aquecimento de 2-3°C'
    },
    'RCP6.0': {
      nome: 'Alto (Estabilização Tardia)',
      temp_2030: 1.1, temp_2040: 1.6, temp_2050: 2.2,
      precip_change: -0.15,
      extreme_factor: 1.5,
      description: 'Emissões estabilizadas após 2080, aquecimento de 3-4°C'
    },
    'RCP8.5': {
      nome: 'Pessimista (Business as Usual)',
      temp_2030: 1.3, temp_2040: 2.0, temp_2050: 2.8,
      precip_change: -0.20,
      extreme_factor: 2.0,
      description: 'Emissões crescentes, aquecimento > 4°C até 2100'
    }
  },
  
  /**
   * Espécies do Cerrado e sua sensibilidade climática
   */
  SPECIES_CLIMATE_SENSITIVITY: [
    { nome: 'Mauritia flexuosa', comum: 'Buriti', sensibilidade: 'Alta', fator: 'Umidade', limiar_temp: 2.0 },
    { nome: 'Euterpe edulis', comum: 'Palmito-juçara', sensibilidade: 'Muito_Alta', fator: 'Umidade', limiar_temp: 1.5 },
    { nome: 'Chrysocyon brachyurus', comum: 'Lobo-guará', sensibilidade: 'Moderada', fator: 'Habitat', limiar_temp: 2.5 },
    { nome: 'Myrmecophaga tridactyla', comum: 'Tamanduá-bandeira', sensibilidade: 'Moderada', fator: 'Habitat', limiar_temp: 2.5 },
    { nome: 'Tapirus terrestris', comum: 'Anta', sensibilidade: 'Alta', fator: 'Agua', limiar_temp: 2.0 },
    { nome: 'Panthera onca', comum: 'Onça-pintada', sensibilidade: 'Moderada', fator: 'Presa', limiar_temp: 3.0 },
    { nome: 'Ara ararauna', comum: 'Arara-canindé', sensibilidade: 'Moderada', fator: 'Alimento', limiar_temp: 2.5 },
    { nome: 'Caryocar brasiliense', comum: 'Pequi', sensibilidade: 'Baixa', fator: 'Adaptado', limiar_temp: 3.5 },
    { nome: 'Dipteryx alata', comum: 'Baru', sensibilidade: 'Baixa', fator: 'Adaptado', limiar_temp: 3.5 },
    { nome: 'Hymenaea stigonocarpa', comum: 'Jatobá-do-cerrado', sensibilidade: 'Baixa', fator: 'Adaptado', limiar_temp: 4.0 }
  ],
  
  /**
   * Espécies resilientes recomendadas para plantio
   */
  RESILIENT_SPECIES: [
    { nome: 'Hymenaea courbaril', comum: 'Jatobá', tolerancia_seca: 'Alta', crescimento: 'Lento' },
    { nome: 'Anadenanthera colubrina', comum: 'Angico', tolerancia_seca: 'Muito_Alta', crescimento: 'Rapido' },
    { nome: 'Tabebuia impetiginosa', comum: 'Ipê-roxo', tolerancia_seca: 'Alta', crescimento: 'Moderado' },
    { nome: 'Astronium urundeuva', comum: 'Aroeira', tolerancia_seca: 'Muito_Alta', crescimento: 'Lento' },
    { nome: 'Myracrodruon urundeuva', comum: 'Aroeira-do-sertão', tolerancia_seca: 'Muito_Alta', crescimento: 'Moderado' },
    { nome: 'Schinopsis brasiliensis', comum: 'Braúna', tolerancia_seca: 'Muito_Alta', crescimento: 'Lento' },
    { nome: 'Copaifera langsdorffii', comum: 'Copaíba', tolerancia_seca: 'Alta', crescimento: 'Moderado' },
    { nome: 'Bowdichia virgilioides', comum: 'Sucupira', tolerancia_seca: 'Alta', crescimento: 'Lento' }
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
        sheet.appendRow(CLIMA_PREDICOES_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, CLIMA_PREDICOES_HEADERS.length);
        headerRange.setBackground('#E65100');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        Logger.log(`[ClimateModelEngine] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[ClimateModelEngine] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },


  /**
   * Gera projeções climáticas locais
   * @param {string} scenario - Cenário RCP (RCP2.6, RCP4.5, RCP6.0, RCP8.5)
   * @param {string} horizon - Horizonte temporal (2030, 2040, 2050)
   * @returns {object} Projeções completas
   */
  generateClimateProjections: function(scenario = 'RCP4.5', horizon = '2040') {
    try {
      this.initializeSheet();
      
      const rcpFactor = this.RCP_FACTORS[scenario];
      if (!rcpFactor) {
        return { success: false, error: 'Cenário RCP inválido' };
      }
      
      // 1. Calcula projeções de temperatura
      const tempProjection = this._projectTemperature(scenario, horizon);
      
      // 2. Calcula projeções de precipitação
      const precipProjection = this._projectPrecipitation(scenario, horizon);
      
      // 3. Prediz eventos extremos
      const extremeEvents = this._predictExtremeEvents(tempProjection, precipProjection, scenario);
      
      // 4. Avalia impactos ecológicos
      const ecologicalImpacts = this._assessEcologicalImpacts(tempProjection, precipProjection);
      
      // 5. Gera plano de adaptação
      const adaptationPlan = this._generateAdaptationPlan(ecologicalImpacts, tempProjection);
      
      // 6. Calcula confiança do modelo
      const confidence = this._calculateModelConfidence(horizon);
      
      // 7. Salva projeção
      const projectionId = this._saveProjection({
        scenario, horizon, tempProjection, precipProjection,
        extremeEvents, ecologicalImpacts, adaptationPlan, confidence
      });
      
      return {
        success: true,
        projection_id: projectionId,
        scenario: {
          code: scenario,
          name: rcpFactor.nome,
          description: rcpFactor.description
        },
        horizon: horizon,
        temperature: tempProjection,
        precipitation: precipProjection,
        extreme_events: extremeEvents,
        ecological_impacts: ecologicalImpacts,
        adaptation_plan: adaptationPlan,
        confidence: confidence,
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      Logger.log(`[generateClimateProjections] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Projeta mudanças de temperatura
   * @private
   */
  _projectTemperature: function(scenario, horizon) {
    const rcpFactor = this.RCP_FACTORS[scenario];
    const baseline = this.BASELINE_CLIMATE;
    
    // Delta de temperatura baseado no cenário e horizonte
    let deltaTemp;
    switch (horizon) {
      case '2030': deltaTemp = rcpFactor.temp_2030; break;
      case '2040': deltaTemp = rcpFactor.temp_2040; break;
      case '2050': deltaTemp = rcpFactor.temp_2050; break;
      default: deltaTemp = rcpFactor.temp_2040;
    }
    
    // Adiciona variabilidade local
    const localVariation = (Math.random() - 0.5) * 0.3;
    deltaTemp += localVariation;
    
    return {
      atual: {
        media_anual: baseline.temperatura_media_anual,
        maxima_media: baseline.temperatura_max_media,
        minima_media: baseline.temperatura_min_media
      },
      projetado: {
        media_anual: parseFloat((baseline.temperatura_media_anual + deltaTemp).toFixed(1)),
        maxima_media: parseFloat((baseline.temperatura_max_media + deltaTemp * 1.2).toFixed(1)),
        minima_media: parseFloat((baseline.temperatura_min_media + deltaTemp * 0.8).toFixed(1))
      },
      delta: parseFloat(deltaTemp.toFixed(2)),
      classificacao: deltaTemp < 1.5 ? 'Moderado' : (deltaTemp < 2.5 ? 'Significativo' : 'Severo')
    };
  },

  /**
   * Projeta mudanças de precipitação
   * @private
   */
  _projectPrecipitation: function(scenario, horizon) {
    const rcpFactor = this.RCP_FACTORS[scenario];
    const baseline = this.BASELINE_CLIMATE;
    
    // Fator de anos até o horizonte
    const years = parseInt(horizon) - 2025;
    const yearFactor = years / 25; // Normalizado para 25 anos
    
    // Mudança percentual na precipitação
    const precipChange = rcpFactor.precip_change * yearFactor;
    const precipFutura = baseline.precipitacao_anual * (1 + precipChange);
    
    // Mudança na distribuição sazonal (estação seca mais longa)
    const drySeasonExtension = Math.round(years * 0.3); // ~0.3 dias/ano
    
    return {
      atual: {
        anual_mm: baseline.precipitacao_anual,
        dias_seca: baseline.dias_seca_ano,
        estacao_seca_meses: baseline.estacao_seca_meses.length
      },
      projetado: {
        anual_mm: Math.round(precipFutura),
        dias_seca: baseline.dias_seca_ano + drySeasonExtension,
        estacao_seca_meses: baseline.estacao_seca_meses.length + Math.floor(drySeasonExtension / 30)
      },
      delta_percent: parseFloat((precipChange * 100).toFixed(1)),
      delta_mm: Math.round(precipFutura - baseline.precipitacao_anual),
      classificacao: Math.abs(precipChange) < 0.1 ? 'Leve' : (Math.abs(precipChange) < 0.15 ? 'Moderado' : 'Severo')
    };
  },


  /**
   * Prediz eventos extremos
   * @private
   */
  _predictExtremeEvents: function(tempProjection, precipProjection, scenario) {
    const rcpFactor = this.RCP_FACTORS[scenario];
    const extremeFactor = rcpFactor.extreme_factor;
    
    // Baseline de eventos extremos
    const baselineHeatwaves = 5; // dias/ano com T > 38°C
    const baselineDroughts = 30; // dias consecutivos sem chuva
    const baselineIntenseRain = 8; // eventos > 50mm/dia
    const baselineFireRisk = 0.3; // índice 0-1
    
    // Projeções
    const heatwaveDays = Math.round(baselineHeatwaves * extremeFactor * (1 + tempProjection.delta * 0.3));
    const droughtDays = Math.round(baselineDroughts * (1 + Math.abs(precipProjection.delta_percent) / 100 * 2));
    const intenseRainEvents = Math.round(baselineIntenseRain * (1 + Math.abs(precipProjection.delta_percent) / 100 * 1.5));
    
    // Risco de incêndio (combinação de temperatura e seca)
    const fireRisk = Math.min(
      baselineFireRisk * extremeFactor * (1 + tempProjection.delta * 0.2),
      1.0
    );
    
    return {
      ondas_calor: {
        dias_ano: heatwaveDays,
        aumento_percent: Math.round((heatwaveDays / baselineHeatwaves - 1) * 100),
        severidade: heatwaveDays > 15 ? 'Extrema' : (heatwaveDays > 10 ? 'Alta' : 'Moderada')
      },
      secas_prolongadas: {
        dias_ano: droughtDays,
        aumento_percent: Math.round((droughtDays / baselineDroughts - 1) * 100),
        severidade: droughtDays > 60 ? 'Extrema' : (droughtDays > 45 ? 'Alta' : 'Moderada')
      },
      chuvas_intensas: {
        eventos_ano: intenseRainEvents,
        aumento_percent: Math.round((intenseRainEvents / baselineIntenseRain - 1) * 100),
        severidade: intenseRainEvents > 15 ? 'Alta' : 'Moderada'
      },
      risco_incendio: {
        score: parseFloat(fireRisk.toFixed(2)),
        classificacao: fireRisk > 0.7 ? 'Muito_Alto' : (fireRisk > 0.5 ? 'Alto' : (fireRisk > 0.3 ? 'Moderado' : 'Baixo')),
        meses_criticos: ['Julho', 'Agosto', 'Setembro', 'Outubro']
      },
      resumo: {
        eventos_extremos_totais: heatwaveDays + Math.floor(droughtDays / 10) + intenseRainEvents,
        tendencia: 'Aumento significativo de eventos extremos'
      }
    };
  },

  /**
   * Avalia impactos ecológicos
   * @private
   */
  _assessEcologicalImpacts: function(tempProjection, precipProjection) {
    const deltaTemp = tempProjection.delta;
    const deltaPrecip = Math.abs(precipProjection.delta_percent);
    
    // Espécies em risco
    const speciesAtRisk = this.SPECIES_CLIMATE_SENSITIVITY
      .filter(sp => deltaTemp >= sp.limiar_temp || 
                    (sp.fator === 'Umidade' && deltaPrecip > 10) ||
                    (sp.fator === 'Agua' && deltaPrecip > 15))
      .map(sp => ({
        nome_cientifico: sp.nome,
        nome_comum: sp.comum,
        sensibilidade: sp.sensibilidade,
        fator_principal: sp.fator,
        risco: deltaTemp >= sp.limiar_temp ? 'Alto' : 'Moderado'
      }));
    
    // Espécies que podem se beneficiar (adaptadas ao calor)
    const speciesBenefited = this.SPECIES_CLIMATE_SENSITIVITY
      .filter(sp => sp.sensibilidade === 'Baixa' && deltaTemp < sp.limiar_temp)
      .map(sp => ({
        nome_cientifico: sp.nome,
        nome_comum: sp.comum,
        motivo: 'Tolerante a condições mais quentes e secas'
      }));
    
    // Mudança fenológica (dias de antecipação/atraso)
    const phenologyShift = Math.round(deltaTemp * 5); // ~5 dias por °C
    
    // Impacto na polinização
    let pollinationImpact;
    if (deltaTemp > 2.5 || deltaPrecip > 15) {
      pollinationImpact = 'Critico';
    } else if (deltaTemp > 1.5 || deltaPrecip > 10) {
      pollinationImpact = 'Alto';
    } else if (deltaTemp > 1.0) {
      pollinationImpact = 'Moderado';
    } else {
      pollinationImpact = 'Baixo';
    }
    
    // Impacto na dispersão de sementes
    let dispersalImpact;
    if (speciesAtRisk.some(sp => ['Tapirus terrestris', 'Chrysocyon brachyurus'].includes(sp.nome_cientifico))) {
      dispersalImpact = 'Alto';
    } else if (speciesAtRisk.length > 3) {
      dispersalImpact = 'Moderado';
    } else {
      dispersalImpact = 'Baixo';
    }
    
    return {
      especies_em_risco: speciesAtRisk,
      especies_beneficiadas: speciesBenefited,
      total_especies_risco: speciesAtRisk.length,
      mudanca_fenologia: {
        dias: phenologyShift,
        direcao: 'Antecipação',
        impacto: phenologyShift > 15 ? 'Dessincronia com polinizadores' : 'Ajuste gradual'
      },
      impacto_polinizacao: pollinationImpact,
      impacto_dispersao: dispersalImpact,
      servicos_ecossistemicos: {
        sequestro_carbono: deltaTemp > 2 ? 'Reduzido' : 'Mantido',
        regulacao_hidrica: deltaPrecip > 10 ? 'Comprometida' : 'Mantida',
        biodiversidade: speciesAtRisk.length > 5 ? 'Ameaçada' : 'Vulnerável'
      }
    };
  },


  /**
   * Gera plano de adaptação
   * @private
   */
  _generateAdaptationPlan: function(ecologicalImpacts, tempProjection) {
    const actions = [];
    const deltaTemp = tempProjection.delta;
    
    // Ações baseadas em espécies em risco
    if (ecologicalImpacts.especies_em_risco.length > 0) {
      actions.push({
        id: 'ACT_001',
        titulo: 'Criação de Microclimas Protegidos',
        descricao: 'Estabelecer áreas com sombreamento artificial e vegetação densa para espécies sensíveis',
        prioridade: 'Muito_Alta',
        custo_brl: 75000,
        prazo: '2 anos',
        especies_beneficiadas: ecologicalImpacts.especies_em_risco.slice(0, 3).map(sp => sp.nome_comum)
      });
      
      actions.push({
        id: 'ACT_002',
        titulo: 'Sistema de Irrigação em Áreas Críticas',
        descricao: 'Instalar irrigação por gotejamento em habitats de espécies dependentes de umidade',
        prioridade: 'Alta',
        custo_brl: 120000,
        prazo: '1 ano',
        especies_beneficiadas: ecologicalImpacts.especies_em_risco
          .filter(sp => sp.fator_principal === 'Umidade' || sp.fator_principal === 'Agua')
          .map(sp => sp.nome_comum)
      });
    }
    
    // Ações para mudança fenológica
    if (ecologicalImpacts.mudanca_fenologia.dias > 10) {
      actions.push({
        id: 'ACT_003',
        titulo: 'Diversificação de Polinizadores',
        descricao: 'Introduzir espécies de polinizadores com diferentes janelas de atividade',
        prioridade: 'Alta',
        custo_brl: 45000,
        prazo: '3 anos',
        especies_beneficiadas: ['Flora nativa', 'Espécies frutíferas']
      });
    }
    
    // Ações para risco de incêndio
    if (deltaTemp > 1.5) {
      actions.push({
        id: 'ACT_004',
        titulo: 'Sistema de Prevenção de Incêndios',
        descricao: 'Criar aceiros, instalar sensores de fumaça e treinar brigada',
        prioridade: 'Muito_Alta',
        custo_brl: 95000,
        prazo: '1 ano',
        especies_beneficiadas: ['Toda a biodiversidade']
      });
    }
    
    // Ações de restauração
    actions.push({
      id: 'ACT_005',
      titulo: 'Plantio de Espécies Resilientes',
      descricao: 'Enriquecer áreas degradadas com espécies tolerantes à seca',
      prioridade: 'Alta',
      custo_brl: 60000,
      prazo: '5 anos',
      especies_beneficiadas: ['Fauna dependente de frutos', 'Dispersores de sementes']
    });
    
    // Monitoramento
    actions.push({
      id: 'ACT_006',
      titulo: 'Programa de Monitoramento Climático',
      descricao: 'Instalar estação meteorológica e sistema de alerta precoce',
      prioridade: 'Media',
      custo_brl: 35000,
      prazo: '6 meses',
      especies_beneficiadas: ['Gestão adaptativa']
    });
    
    // Espécies recomendadas para plantio
    const recommendedSpecies = this.RESILIENT_SPECIES
      .filter(sp => sp.tolerancia_seca === 'Muito_Alta' || sp.tolerancia_seca === 'Alta')
      .map(sp => ({
        nome_cientifico: sp.nome,
        nome_comum: sp.comum,
        tolerancia_seca: sp.tolerancia_seca,
        crescimento: sp.crescimento,
        recomendacao: sp.tolerancia_seca === 'Muito_Alta' ? 'Prioritária' : 'Recomendada'
      }));
    
    // Calcula custo total
    const totalCost = actions.reduce((sum, a) => sum + a.custo_brl, 0);
    
    return {
      acoes: actions.sort((a, b) => {
        const prioOrder = { 'Muito_Alta': 0, 'Alta': 1, 'Media': 2, 'Baixa': 3 };
        return prioOrder[a.prioridade] - prioOrder[b.prioridade];
      }),
      especies_plantio_recomendadas: recommendedSpecies,
      custo_total_brl: totalCost,
      prazo_implementacao: '1-5 anos',
      resumo: {
        total_acoes: actions.length,
        acoes_urgentes: actions.filter(a => a.prioridade === 'Muito_Alta').length,
        investimento_ano_1: actions.filter(a => a.prazo.includes('1 ano') || a.prazo.includes('6 meses'))
          .reduce((sum, a) => sum + a.custo_brl, 0)
      }
    };
  },

  /**
   * Calcula confiança do modelo
   * @private
   */
  _calculateModelConfidence: function(horizon) {
    // Confiança diminui com horizonte temporal
    const baseConfidence = 0.85;
    const years = parseInt(horizon) - 2025;
    const decay = years * 0.015; // ~1.5% por ano
    
    return parseFloat(Math.max(baseConfidence - decay, 0.5).toFixed(2));
  },

  /**
   * Salva projeção na planilha
   * @private
   */
  _saveProjection: function(data) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `CLIM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      const row = [
        id,
        new Date(),
        data.horizon,
        data.scenario,
        data.tempProjection.atual.media_anual,
        data.tempProjection.projetado.media_anual,
        data.tempProjection.delta,
        data.precipProjection.atual.anual_mm,
        data.precipProjection.projetado.anual_mm,
        data.precipProjection.delta_percent,
        data.extremeEvents.ondas_calor.dias_ano,
        data.extremeEvents.secas_prolongadas.dias_ano,
        data.extremeEvents.chuvas_intensas.eventos_ano,
        data.extremeEvents.risco_incendio.score,
        JSON.stringify(data.ecologicalImpacts.especies_em_risco),
        JSON.stringify(data.ecologicalImpacts.especies_beneficiadas),
        data.ecologicalImpacts.mudanca_fenologia.dias,
        data.ecologicalImpacts.impacto_polinizacao,
        data.ecologicalImpacts.impacto_dispersao,
        JSON.stringify(data.adaptationPlan.acoes),
        JSON.stringify(data.adaptationPlan.especies_plantio_recomendadas),
        data.adaptationPlan.custo_total_brl,
        data.confidence
      ];
      
      sheet.appendRow(row);
      
      return id;
    } catch (e) {
      Logger.log(`[_saveProjection] Erro: ${e}`);
      return null;
    }
  },


  /**
   * Compara cenários climáticos
   * @param {string} horizon - Horizonte temporal
   * @returns {object} Comparação entre cenários
   */
  compareScenarios: function(horizon = '2040') {
    try {
      const scenarios = ['RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5'];
      const comparisons = [];
      
      scenarios.forEach(scenario => {
        const projection = this.generateClimateProjections(scenario, horizon);
        if (projection.success) {
          comparisons.push({
            scenario: scenario,
            nome: this.RCP_FACTORS[scenario].nome,
            delta_temp: projection.temperature.delta,
            delta_precip: projection.precipitation.delta_percent,
            especies_risco: projection.ecological_impacts.total_especies_risco,
            risco_incendio: projection.extreme_events.risco_incendio.score,
            custo_adaptacao: projection.adaptation_plan.custo_total_brl
          });
        }
      });
      
      return {
        success: true,
        horizon: horizon,
        comparisons: comparisons,
        recomendacao: this._recommendScenarioFocus(comparisons)
      };
      
    } catch (error) {
      Logger.log(`[compareScenarios] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Recomenda foco de cenário
   * @private
   */
  _recommendScenarioFocus: function(comparisons) {
    // Recomenda planejar para cenário moderado-pessimista
    return {
      cenario_planejamento: 'RCP4.5',
      justificativa: 'Cenário moderado com boa probabilidade de ocorrência',
      cenario_contingencia: 'RCP6.0',
      justificativa_contingencia: 'Preparar planos de contingência para cenário mais severo'
    };
  },

  /**
   * Lista projeções anteriores
   * @param {number} limit - Limite de resultados
   * @returns {Array} Lista de projeções
   */
  getProjections: function(limit = 10) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const projections = [];
      
      for (let i = data.length - 1; i >= 1 && projections.length < limit; i--) {
        projections.push({
          id: data[i][0],
          timestamp: data[i][1],
          horizonte: data[i][2],
          cenario: data[i][3],
          delta_temp: data[i][6],
          delta_precip: data[i][9],
          risco_incendio: data[i][13],
          custo_adaptacao: data[i][21],
          confianca: data[i][22]
        });
      }
      
      return projections;
    } catch (error) {
      Logger.log(`[getProjections] Erro: ${error}`);
      return [];
    }
  },

  /**
   * Obtém estatísticas gerais
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const projections = this.getProjections(100);
      
      if (projections.length === 0) {
        return {
          total_projections: 0,
          message: 'Nenhuma projeção realizada ainda'
        };
      }
      
      // Agrupa por cenário
      const byScenario = {};
      projections.forEach(p => {
        byScenario[p.cenario] = (byScenario[p.cenario] || 0) + 1;
      });
      
      // Última projeção
      const latest = projections[0];
      
      // Média de delta temperatura
      const avgDeltaTemp = projections.reduce((sum, p) => sum + (p.delta_temp || 0), 0) / projections.length;
      
      return {
        total_projections: projections.length,
        by_scenario: byScenario,
        latest: {
          id: latest.id,
          date: latest.timestamp,
          scenario: latest.cenario,
          horizon: latest.horizonte,
          delta_temp: latest.delta_temp
        },
        average_delta_temp: parseFloat(avgDeltaTemp.toFixed(2)),
        scenarios_available: Object.keys(this.RCP_FACTORS)
      };
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P11 Modelo de Mudanças Climáticas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de projeções climáticas
 * @returns {object} Resultado
 */
function apiClimateInit() {
  return ClimateModelEngine.initializeSheet();
}

/**
 * Gera projeções climáticas
 * @param {string} scenario - Cenário RCP (RCP2.6, RCP4.5, RCP6.0, RCP8.5)
 * @param {string} horizon - Horizonte temporal (2030, 2040, 2050)
 * @returns {object} Projeções completas
 */
function apiClimateProject(scenario, horizon) {
  return ClimateModelEngine.generateClimateProjections(scenario || 'RCP4.5', horizon || '2040');
}

/**
 * Compara todos os cenários
 * @param {string} horizon - Horizonte temporal
 * @returns {object} Comparação
 */
function apiClimateCompare(horizon) {
  return ClimateModelEngine.compareScenarios(horizon || '2040');
}

/**
 * Lista projeções anteriores
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de projeções
 */
function apiClimateList(limit) {
  return ClimateModelEngine.getProjections(limit || 10);
}

/**
 * Obtém estatísticas gerais
 * @returns {object} Estatísticas
 */
function apiClimateStats() {
  return ClimateModelEngine.getStatistics();
}

/**
 * Gera projeção rápida (cenário moderado, 2040)
 * @returns {object} Projeção
 */
function apiClimateQuickProject() {
  return ClimateModelEngine.generateClimateProjections('RCP4.5', '2040');
}

/**
 * Obtém informações dos cenários RCP
 * @returns {object} Informações dos cenários
 */
function apiClimateScenarios() {
  return {
    success: true,
    scenarios: Object.entries(ClimateModelEngine.RCP_FACTORS).map(([code, data]) => ({
      code: code,
      nome: data.nome,
      description: data.description,
      temp_2050: data.temp_2050
    }))
  };
}
