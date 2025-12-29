/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE PREDITIVA DE SUCESSÃO ECOLÓGICA
 * ═══════════════════════════════════════════════════════════════════════════
 * P02 - Sistema de Análise Preditiva de Sucessão Ecológica com Machine Learning
 * 
 * Funcionalidades:
 * - Análise de estágio sucessional atual
 * - Predições para 5 e 10 anos usando Gemini AI
 * - Simulação de cenários (otimista, realista, pessimista)
 * - Cálculo de sequestro de carbono futuro
 * - Recomendações de manejo personalizadas
 * - Sugestões de espécies para enriquecimento
 * 
 * @version 3.2.0
 * @date 2025-12-25
 */

/**
 * Schema de dados para planilha SUCESSAO_ECOLOGICA_RA
 */
const SCHEMA_SUCESSAO = {
  ID_Analise: { type: 'string', required: true, unique: true },
  Timestamp_Analise: { type: 'datetime', required: true },
  ID_Parcela: { type: 'string', required: true },
  Nome_Parcela: { type: 'string', required: true },
  Area_ha: { type: 'float', min: 0 },
  Idade_Sistema_anos: { type: 'float', min: 0 },
  Estagio_Sucessional_Atual: { type: 'enum', values: ['Pioneira', 'Inicial', 'Intermediária', 'Avançada', 'Clímax'] },
  Indice_Shannon_Atual: { type: 'float', min: 0 },
  Riqueza_Especies_Atual: { type: 'integer', min: 0 },
  Biomassa_Total_ton_ha: { type: 'float', min: 0 },
  Cobertura_Dossel_percent: { type: 'float', range: [0, 100] },
  Taxa_Crescimento_Biomassa_ano: { type: 'float' },
  Taxa_Colonizacao_Especies_ano: { type: 'float' },
  Mortalidade_Individuos_percent: { type: 'float', range: [0, 100] },
  Recrutamento_Novos_Individuos: { type: 'integer', min: 0 },
  pH_Solo_Medio: { type: 'float', range: [0, 14] },
  Materia_Organica_percent: { type: 'float', range: [0, 100] },
  Umidade_Solo_Media_percent: { type: 'float', range: [0, 100] },
  Temperatura_Media_C: { type: 'float' },
  Precipitacao_Anual_mm: { type: 'float', min: 0 },
  Ultima_Intervencao_Data: { type: 'date' },
  Tipo_Intervencao: { type: 'enum', values: ['Plantio', 'Poda', 'Desbaste', 'Adubação', 'Controle Invasoras', 'Nenhuma'] },
  Intensidade_Manejo: { type: 'enum', values: ['Baixa', 'Média', 'Alta'] },
  Estagio_Previsto_5anos: { type: 'enum', values: ['Pioneira', 'Inicial', 'Intermediária', 'Avançada', 'Clímax'] },
  Estagio_Previsto_10anos: { type: 'enum', values: ['Pioneira', 'Inicial', 'Intermediária', 'Avançada', 'Clímax'] },
  Riqueza_Prevista_5anos: { type: 'integer', min: 0 },
  Biomassa_Prevista_5anos_ton_ha: { type: 'float', min: 0 },
  Carbono_Sequestrado_5anos_tCO2e: { type: 'float', min: 0 },
  Tendencia_Sucessional: { type: 'enum', values: ['Progressiva', 'Estável', 'Regressiva'] },
  Velocidade_Sucessao: { type: 'enum', values: ['Muito Lenta', 'Lenta', 'Moderada', 'Rápida', 'Muito Rápida'] },
  Confianca_Predicao: { type: 'float', range: [0, 1] },
  IA_Recomendacoes_Manejo: { type: 'array' },
  IA_Especies_Sugeridas_Plantio: { type: 'array' },
  IA_Alertas_Ecologicos: { type: 'array' },
  IA_Oportunidades_Conservacao: { type: 'array' },
  Cenario_Otimista_JSON: { type: 'text' },
  Cenario_Realista_JSON: { type: 'text' },
  Cenario_Pessimista_JSON: { type: 'text' },
  Modelo_IA_Versao: { type: 'string' },
  Tempo_Processamento_ms: { type: 'integer', min: 0 },
  Status_Validacao: { type: 'enum', values: ['Pendente', 'Validado', 'Rejeitado'] }
};


/**
 * Headers da planilha SUCESSAO_ECOLOGICA_RA
 */
const SUCESSAO_HEADERS = [
  'ID_Analise', 'Timestamp_Analise', 'ID_Parcela', 'Nome_Parcela', 'Area_ha', 'Idade_Sistema_anos',
  'Estagio_Sucessional_Atual', 'Indice_Shannon_Atual', 'Riqueza_Especies_Atual',
  'Biomassa_Total_ton_ha', 'Cobertura_Dossel_percent',
  'Taxa_Crescimento_Biomassa_ano', 'Taxa_Colonizacao_Especies_ano',
  'Mortalidade_Individuos_percent', 'Recrutamento_Novos_Individuos',
  'pH_Solo_Medio', 'Materia_Organica_percent', 'Umidade_Solo_Media_percent',
  'Temperatura_Media_C', 'Precipitacao_Anual_mm',
  'Ultima_Intervencao_Data', 'Tipo_Intervencao', 'Intensidade_Manejo',
  'Estagio_Previsto_5anos', 'Estagio_Previsto_10anos', 'Riqueza_Prevista_5anos',
  'Biomassa_Prevista_5anos_ton_ha', 'Carbono_Sequestrado_5anos_tCO2e',
  'Tendencia_Sucessional', 'Velocidade_Sucessao', 'Confianca_Predicao',
  'IA_Recomendacoes_Manejo', 'IA_Especies_Sugeridas_Plantio',
  'IA_Alertas_Ecologicos', 'IA_Oportunidades_Conservacao',
  'Cenario_Otimista_JSON', 'Cenario_Realista_JSON', 'Cenario_Pessimista_JSON',
  'Modelo_IA_Versao', 'Tempo_Processamento_ms', 'Status_Validacao'
];

/**
 * Constantes para cálculos ecológicos
 */
const ECOLOGICAL_CONSTANTS = {
  // Fatores de conversão de carbono (IPCC)
  CARBON_TO_CO2: 3.67,
  BIOMASS_TO_CARBON: 0.47,
  
  // Taxas médias de acúmulo de biomassa por estágio (ton/ha/ano)
  BIOMASS_RATES: {
    'Pioneira': 8.0,
    'Inicial': 12.0,
    'Intermediária': 10.0,
    'Avançada': 6.0,
    'Clímax': 2.0
  },
  
  // Biomassa típica por estágio (ton/ha)
  TYPICAL_BIOMASS: {
    'Pioneira': 30,
    'Inicial': 80,
    'Intermediária': 150,
    'Avançada': 250,
    'Clímax': 350
  },
  
  // Índice de Shannon típico por estágio
  TYPICAL_SHANNON: {
    'Pioneira': 1.0,
    'Inicial': 1.8,
    'Intermediária': 2.5,
    'Avançada': 3.2,
    'Clímax': 3.8
  },
  
  // Espécies nativas do Cerrado para enriquecimento
  NATIVE_SPECIES: {
    'Pioneira': [
      'Solanum lycocarpum (Lobeira)',
      'Stryphnodendron adstringens (Barbatimão)',
      'Anacardium humile (Cajuzinho-do-cerrado)'
    ],
    'Inicial': [
      'Caryocar brasiliense (Pequi)',
      'Eugenia dysenterica (Cagaita)',
      'Hancornia speciosa (Mangaba)'
    ],
    'Intermediária': [
      'Dipteryx alata (Baru)',
      'Hymenaea stigonocarpa (Jatobá-do-cerrado)',
      'Mauritia flexuosa (Buriti)'
    ],
    'Avançada': [
      'Astronium fraxinifolium (Gonçalo-alves)',
      'Myracrodruon urundeuva (Aroeira)',
      'Copaifera langsdorffii (Copaíba)'
    ]
  }
};


/**
 * Serviço de Análise Preditiva de Sucessão Ecológica
 * @namespace EcologicalSuccessionAI
 */
const EcologicalSuccessionAI = {
  
  /**
   * Nome da planilha de sucessão ecológica
   */
  SHEET_NAME: 'SUCESSAO_ECOLOGICA_RA',
  
  /**
   * Inicializa a planilha de sucessão ecológica
   * @returns {object} Resultado da inicialização
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(SUCESSAO_HEADERS);
        
        // Formata header
        const headerRange = sheet.getRange(1, 1, 1, SUCESSAO_HEADERS.length);
        headerRange.setBackground('#1565C0');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[EcologicalSuccessionAI] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[EcologicalSuccessionAI] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Analisa sucessão ecológica de uma parcela
   * @param {string} parcelaId - ID da parcela
   * @param {object} options - Opções de análise
   * @returns {object} Resultado da análise preditiva
   */
  analyzeSuccession: function(parcelaId, options = {}) {
    const startTime = Date.now();
    
    try {
      // 1. Coleta dados históricos da parcela
      const historicalData = this._getHistoricalData(parcelaId);
      
      // 2. Coleta dados de biodiversidade
      const biodivData = this._getBiodiversityData(parcelaId);
      
      // 3. Coleta dados ambientais
      const environmentalData = this._getEnvironmentalData(parcelaId);
      
      // 4. Calcula indicadores ecológicos
      const indicators = this._calculateEcologicalIndicators(
        historicalData, 
        biodivData, 
        environmentalData
      );
      
      // 5. Gera predições com Gemini AI
      const predictions = this._generatePredictions(indicators, options);
      
      // 6. Simula cenários futuros
      const scenarios = this._simulateScenarios(indicators, predictions);
      
      // 7. Gera recomendações de manejo
      const recommendations = this._generateRecommendations(indicators, predictions);
      
      // 8. Calcula tempo de processamento
      const processingTime = Date.now() - startTime;
      
      // 9. Salva análise
      const analysisId = this._saveAnalysis({
        parcelaId,
        historicalData,
        indicators,
        predictions,
        scenarios,
        recommendations,
        processingTime
      });
      
      return {
        success: true,
        analysisId: analysisId,
        parcela: {
          id: parcelaId,
          nome: historicalData.nome,
          area_ha: historicalData.area_ha,
          idade_anos: historicalData.idade_anos
        },
        currentStage: indicators.estagio_atual,
        indicators: indicators,
        predictions: predictions,
        scenarios: scenarios,
        recommendations: recommendations,
        confidence: predictions.confianca,
        processingTime: processingTime
      };
      
    } catch (error) {
      Logger.log(`[EcologicalSuccessionAI.analyzeSuccession] Erro: ${error}`);
      return {
        success: false,
        error: error.message
      };
    }
  },

  
  /**
   * Coleta dados históricos da parcela
   * @param {string} parcelaId - ID da parcela
   * @returns {object} Dados históricos
   */
  _getHistoricalData: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.PARCELAS_AGRO);
      
      if (!sheet || sheet.getLastRow() < 2) {
        // Retorna dados simulados se não houver planilha
        return this._getSimulatedParcelaData(parcelaId);
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === parcelaId || data[i][1] === parcelaId) {
          return {
            id: data[i][0] || parcelaId,
            nome: data[i][2] || data[i][1] || `Parcela ${parcelaId}`,
            area_ha: parseFloat(data[i][4]) || 1.0,
            idade_anos: parseFloat(data[i][5]) || this._calculateAge(data[i][0]),
            tipo_sistema: data[i][3] || 'SAF',
            data_implantacao: data[i][6] || new Date()
          };
        }
      }
      
      // Se não encontrou, retorna dados simulados
      return this._getSimulatedParcelaData(parcelaId);
      
    } catch (error) {
      Logger.log(`[_getHistoricalData] Erro: ${error}`);
      return this._getSimulatedParcelaData(parcelaId);
    }
  },
  
  /**
   * Retorna dados simulados para parcela
   */
  _getSimulatedParcelaData: function(parcelaId) {
    return {
      id: parcelaId,
      nome: `Parcela ${parcelaId}`,
      area_ha: 2.5,
      idade_anos: 5,
      tipo_sistema: 'SAF',
      data_implantacao: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
    };
  },
  
  /**
   * Calcula idade aproximada baseada no ID
   */
  _calculateAge: function(timestamp) {
    if (!timestamp) return 3;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 3;
    return Math.max(1, Math.floor((Date.now() - date.getTime()) / (365 * 24 * 60 * 60 * 1000)));
  },
  
  /**
   * Coleta dados de biodiversidade da parcela
   * @param {string} parcelaId - ID da parcela
   * @returns {object} Dados de biodiversidade
   */
  _getBiodiversityData: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      
      // Tenta primeiro a planilha BIODIVERSIDADE_RA (P01)
      let sheet = ss.getSheetByName('BIODIVERSIDADE_RA');
      if (!sheet) {
        sheet = ss.getSheetByName(CONFIG.SHEETS.BIODIVERSIDADE);
      }
      
      if (!sheet || sheet.getLastRow() < 2) {
        return this._getSimulatedBiodivData();
      }
      
      const data = sheet.getDataRange().getValues();
      const observations = [];
      
      for (let i = 1; i < data.length; i++) {
        // Verifica se pertence à parcela (coluna ID_Parcela = índice 7)
        if (data[i][7] === parcelaId || !parcelaId) {
          observations.push({
            especie: data[i][16] || data[i][2], // Especie_Cientifica
            reino: data[i][10] || 'Plantae',
            quantidade: parseInt(data[i][18]) || 1,
            data: data[i][1],
            condicao: data[i][21] || 'Boa'
          });
        }
      }
      
      // Calcula índice de Shannon
      const shannon = this._calculateShannonIndex(observations);
      const uniqueSpecies = new Set(observations.filter(o => o.especie).map(o => o.especie));
      
      return {
        total_observacoes: observations.length,
        especies_unicas: uniqueSpecies.size,
        indice_shannon: shannon,
        observacoes: observations,
        por_reino: this._countByReino(observations)
      };
      
    } catch (error) {
      Logger.log(`[_getBiodiversityData] Erro: ${error}`);
      return this._getSimulatedBiodivData();
    }
  },
  
  /**
   * Retorna dados simulados de biodiversidade
   */
  _getSimulatedBiodivData: function() {
    return {
      total_observacoes: 45,
      especies_unicas: 28,
      indice_shannon: 2.3,
      observacoes: [],
      por_reino: { Plantae: 35, Animalia: 8, Fungi: 2 }
    };
  },
  
  /**
   * Conta observações por reino
   */
  _countByReino: function(observations) {
    const counts = {};
    observations.forEach(obs => {
      const reino = obs.reino || 'Outros';
      counts[reino] = (counts[reino] || 0) + 1;
    });
    return counts;
  },

  
  /**
   * Calcula Índice de Diversidade de Shannon-Wiener
   * @param {Array} observations - Lista de observações
   * @returns {number} Índice de Shannon
   */
  _calculateShannonIndex: function(observations) {
    if (!observations || observations.length === 0) return 0;
    
    const speciesCounts = {};
    let total = 0;
    
    observations.forEach(obs => {
      if (obs.especie) {
        const qty = parseInt(obs.quantidade) || 1;
        speciesCounts[obs.especie] = (speciesCounts[obs.especie] || 0) + qty;
        total += qty;
      }
    });
    
    if (total === 0) return 0;
    
    let shannon = 0;
    Object.values(speciesCounts).forEach(count => {
      const p = count / total;
      if (p > 0) {
        shannon -= p * Math.log(p);
      }
    });
    
    return parseFloat(shannon.toFixed(4));
  },
  
  /**
   * Coleta dados ambientais
   * @param {string} parcelaId - ID da parcela
   * @returns {object} Dados ambientais
   */
  _getEnvironmentalData: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      
      // Tenta obter dados de solo
      const soilData = this._getSoilData(ss, parcelaId);
      
      // Tenta obter dados climáticos
      const climateData = this._getClimateData(ss, parcelaId);
      
      return {
        ph_medio: soilData.ph || 6.2,
        materia_organica: soilData.materia_organica || 3.5,
        umidade_solo: soilData.umidade || 55,
        temperatura_media: climateData.temperatura || 24.5,
        precipitacao_anual: climateData.precipitacao || 1400,
        insolacao_media: climateData.insolacao || 6.5
      };
      
    } catch (error) {
      Logger.log(`[_getEnvironmentalData] Erro: ${error}`);
      return {
        ph_medio: 6.2,
        materia_organica: 3.5,
        umidade_solo: 55,
        temperatura_media: 24.5,
        precipitacao_anual: 1400,
        insolacao_media: 6.5
      };
    }
  },
  
  /**
   * Obtém dados de solo
   */
  _getSoilData: function(ss, parcelaId) {
    try {
      const sheet = ss.getSheetByName(CONFIG.SHEETS.QUALIDADE_SOLO);
      if (!sheet || sheet.getLastRow() < 2) {
        return { ph: 6.2, materia_organica: 3.5, umidade: 55 };
      }
      
      const data = sheet.getDataRange().getValues();
      let latestData = null;
      
      for (let i = data.length - 1; i >= 1; i--) {
        if (!parcelaId || data[i][2] === parcelaId) {
          latestData = {
            ph: parseFloat(data[i][3]) || 6.2,
            materia_organica: parseFloat(data[i][4]) || 3.5,
            umidade: parseFloat(data[i][5]) || 55
          };
          break;
        }
      }
      
      return latestData || { ph: 6.2, materia_organica: 3.5, umidade: 55 };
    } catch (e) {
      return { ph: 6.2, materia_organica: 3.5, umidade: 55 };
    }
  },
  
  /**
   * Obtém dados climáticos
   */
  _getClimateData: function(ss, parcelaId) {
    try {
      const sheet = ss.getSheetByName(CONFIG.SHEETS.DADOS_CLIMA);
      if (!sheet || sheet.getLastRow() < 2) {
        return { temperatura: 24.5, precipitacao: 1400, insolacao: 6.5 };
      }
      
      const data = sheet.getDataRange().getValues();
      let tempSum = 0, precSum = 0, count = 0;
      
      // Calcula médias dos últimos 12 meses
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      for (let i = 1; i < data.length; i++) {
        const date = new Date(data[i][0]);
        if (date >= oneYearAgo) {
          tempSum += parseFloat(data[i][2]) || 0;
          precSum += parseFloat(data[i][3]) || 0;
          count++;
        }
      }
      
      return {
        temperatura: count > 0 ? tempSum / count : 24.5,
        precipitacao: precSum || 1400,
        insolacao: 6.5
      };
    } catch (e) {
      return { temperatura: 24.5, precipitacao: 1400, insolacao: 6.5 };
    }
  },

  
  /**
   * Calcula indicadores ecológicos
   * @param {object} historical - Dados históricos
   * @param {object} biodiv - Dados de biodiversidade
   * @param {object} environmental - Dados ambientais
   * @returns {object} Indicadores calculados
   */
  _calculateEcologicalIndicators: function(historical, biodiv, environmental) {
    const idade = historical.idade_anos || 0;
    const shannon = biodiv.indice_shannon || 0;
    const riqueza = biodiv.especies_unicas || 0;
    
    // Determina estágio sucessional baseado em múltiplos indicadores
    const estagio = this._determineSuccessionalStage(idade, shannon, riqueza);
    
    // Estima biomassa baseada no estágio e idade
    const biomassa = this._estimateBiomass(estagio, idade, historical.area_ha);
    
    // Calcula cobertura de dossel estimada
    const cobertura = this._estimateCanopyCover(estagio, idade);
    
    // Calcula taxa de crescimento
    const taxaCrescimento = ECOLOGICAL_CONSTANTS.BIOMASS_RATES[estagio] || 8.0;
    
    // Calcula resiliência ecológica (índice composto)
    const resiliencia = this._calculateResilience(shannon, riqueza, environmental);
    
    return {
      estagio_atual: estagio,
      indice_shannon: shannon,
      riqueza_especies: riqueza,
      idade_sistema: idade,
      area_ha: historical.area_ha,
      biomassa_ton_ha: biomassa,
      cobertura_dossel: cobertura,
      taxa_crescimento_biomassa: taxaCrescimento,
      ph_solo: environmental.ph_medio,
      materia_organica: environmental.materia_organica,
      umidade_solo: environmental.umidade_solo,
      temperatura_media: environmental.temperatura_media,
      precipitacao_anual: environmental.precipitacao_anual,
      resiliencia_ecologica: resiliencia
    };
  },
  
  /**
   * Determina estágio sucessional
   */
  _determineSuccessionalStage: function(idade, shannon, riqueza) {
    // Pontuação baseada em múltiplos critérios
    let score = 0;
    
    // Critério: Idade do sistema
    if (idade >= 20) score += 4;
    else if (idade >= 12) score += 3;
    else if (idade >= 6) score += 2;
    else if (idade >= 2) score += 1;
    
    // Critério: Índice de Shannon
    if (shannon >= 3.5) score += 4;
    else if (shannon >= 2.5) score += 3;
    else if (shannon >= 1.8) score += 2;
    else if (shannon >= 1.0) score += 1;
    
    // Critério: Riqueza de espécies
    if (riqueza >= 60) score += 4;
    else if (riqueza >= 40) score += 3;
    else if (riqueza >= 20) score += 2;
    else if (riqueza >= 10) score += 1;
    
    // Determina estágio baseado na pontuação total
    if (score >= 10) return 'Clímax';
    if (score >= 8) return 'Avançada';
    if (score >= 5) return 'Intermediária';
    if (score >= 2) return 'Inicial';
    return 'Pioneira';
  },
  
  /**
   * Estima biomassa
   */
  _estimateBiomass: function(estagio, idade, area) {
    const baseBiomass = ECOLOGICAL_CONSTANTS.TYPICAL_BIOMASS[estagio] || 50;
    const rate = ECOLOGICAL_CONSTANTS.BIOMASS_RATES[estagio] || 8;
    
    // Ajusta pela idade dentro do estágio
    const adjustment = Math.min(idade * rate * 0.1, baseBiomass * 0.3);
    
    return parseFloat((baseBiomass + adjustment).toFixed(1));
  },
  
  /**
   * Estima cobertura de dossel
   */
  _estimateCanopyCover: function(estagio, idade) {
    const baseCover = {
      'Pioneira': 20,
      'Inicial': 40,
      'Intermediária': 65,
      'Avançada': 85,
      'Clímax': 95
    };
    
    const base = baseCover[estagio] || 30;
    const adjustment = Math.min(idade * 2, 15);
    
    return Math.min(100, base + adjustment);
  },
  
  /**
   * Calcula índice de resiliência ecológica
   */
  _calculateResilience: function(shannon, riqueza, env) {
    // Índice composto de 0 a 1
    const shannonScore = Math.min(shannon / 4, 1) * 0.4;
    const riquezaScore = Math.min(riqueza / 80, 1) * 0.3;
    const soilScore = (env.materia_organica > 3 ? 1 : env.materia_organica / 3) * 0.3;
    
    return parseFloat((shannonScore + riquezaScore + soilScore).toFixed(2));
  },

  
  /**
   * Gera predições usando Gemini AI
   * @param {object} indicators - Indicadores ecológicos
   * @param {object} options - Opções de análise
   * @returns {object} Predições
   */
  _generatePredictions: function(indicators, options) {
    const bioma = CONFIG?.RESERVA_CONTEXT?.bioma || 'Cerrado';
    
    const prompt = `
Você é um ecólogo especialista em sucessão ecológica de sistemas agroflorestais no bioma ${bioma}.

**DADOS DA PARCELA:**
- Estágio Atual: ${indicators.estagio_atual}
- Idade do Sistema: ${indicators.idade_sistema} anos
- Área: ${indicators.area_ha} hectares
- Índice de Shannon: ${indicators.indice_shannon.toFixed(2)}
- Riqueza de Espécies: ${indicators.riqueza_especies}
- Biomassa Atual: ${indicators.biomassa_ton_ha} ton/ha
- Cobertura de Dossel: ${indicators.cobertura_dossel}%
- pH do Solo: ${indicators.ph_solo}
- Matéria Orgânica: ${indicators.materia_organica}%
- Precipitação Anual: ${indicators.precipitacao_anual} mm

**ANÁLISE REQUERIDA:**
1. Preveja o estágio sucessional em 5 e 10 anos
2. Estime a riqueza de espécies futura
3. Calcule a biomassa e sequestro de carbono esperados
4. Determine a tendência sucessional (Progressiva/Estável/Regressiva)
5. Avalie a velocidade de sucessão
6. Forneça 3-5 recomendações de manejo específicas
7. Sugira 5 espécies nativas do ${bioma} para enriquecimento
8. Identifique alertas ecológicos e oportunidades

**FORMATO DE RESPOSTA (JSON ESTRITO):**
{
  "estagio_5anos": "Inicial|Intermediária|Avançada|Clímax",
  "estagio_10anos": "Intermediária|Avançada|Clímax",
  "riqueza_5anos": 45,
  "riqueza_10anos": 65,
  "biomassa_5anos_ton_ha": 120,
  "biomassa_10anos_ton_ha": 180,
  "carbono_5anos_tCO2e": 220,
  "carbono_10anos_tCO2e": 330,
  "tendencia": "Progressiva|Estável|Regressiva",
  "velocidade": "Muito Lenta|Lenta|Moderada|Rápida|Muito Rápida",
  "confianca": 0.85,
  "recomendacoes_manejo": [
    "Recomendação 1",
    "Recomendação 2"
  ],
  "especies_sugeridas": [
    "Nome científico (Nome popular)",
    "Nome científico (Nome popular)"
  ],
  "alertas": [
    "Alerta 1"
  ],
  "oportunidades": [
    "Oportunidade 1"
  ],
  "justificativa": "Análise detalhada..."
}

Retorne APENAS o JSON, sem texto adicional.
`;
    
    try {
      // Verifica se GeminiAIService está disponível
      if (typeof GeminiAIService !== 'undefined' && GeminiAIService.generateContent) {
        const response = GeminiAIService.generateContent({
          contents: [{ parts: [{ text: prompt }] }]
        });
        
        if (response && response.candidates && response.candidates[0]) {
          const text = response.candidates[0].content.parts[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return this._normalizePredictions(parsed, indicators);
          }
        }
      }
      
      // Fallback: predições baseadas em regras
      return this._generateRuleBasedPredictions(indicators);
      
    } catch (error) {
      Logger.log(`[_generatePredictions] Erro: ${error}`);
      return this._generateRuleBasedPredictions(indicators);
    }
  },
  
  /**
   * Normaliza predições da IA
   */
  _normalizePredictions: function(parsed, indicators) {
    return {
      estagio_5anos: parsed.estagio_5anos || this._predictNextStage(indicators.estagio_atual, 5),
      estagio_10anos: parsed.estagio_10anos || this._predictNextStage(indicators.estagio_atual, 10),
      riqueza_5anos: parseInt(parsed.riqueza_5anos) || Math.round(indicators.riqueza_especies * 1.4),
      riqueza_10anos: parseInt(parsed.riqueza_10anos) || Math.round(indicators.riqueza_especies * 1.8),
      biomassa_5anos_ton_ha: parseFloat(parsed.biomassa_5anos_ton_ha) || indicators.biomassa_ton_ha * 1.5,
      biomassa_10anos_ton_ha: parseFloat(parsed.biomassa_10anos_ton_ha) || indicators.biomassa_ton_ha * 2.0,
      carbono_5anos_tCO2e: parseFloat(parsed.carbono_5anos_tCO2e) || this._calculateCarbon(indicators.biomassa_ton_ha * 1.5, indicators.area_ha),
      carbono_10anos_tCO2e: parseFloat(parsed.carbono_10anos_tCO2e) || this._calculateCarbon(indicators.biomassa_ton_ha * 2.0, indicators.area_ha),
      tendencia: parsed.tendencia || 'Progressiva',
      velocidade: parsed.velocidade || 'Moderada',
      confianca: parseFloat(parsed.confianca) || 0.75,
      recomendacoes_manejo: Array.isArray(parsed.recomendacoes_manejo) ? parsed.recomendacoes_manejo : [],
      especies_sugeridas: Array.isArray(parsed.especies_sugeridas) ? parsed.especies_sugeridas : [],
      alertas: Array.isArray(parsed.alertas) ? parsed.alertas : [],
      oportunidades: Array.isArray(parsed.oportunidades) ? parsed.oportunidades : [],
      justificativa: parsed.justificativa || ''
    };
  },
  
  /**
   * Gera predições baseadas em regras (fallback)
   */
  _generateRuleBasedPredictions: function(indicators) {
    const estagio5 = this._predictNextStage(indicators.estagio_atual, 5);
    const estagio10 = this._predictNextStage(indicators.estagio_atual, 10);
    
    const biomassa5 = indicators.biomassa_ton_ha + (indicators.taxa_crescimento_biomassa * 5);
    const biomassa10 = indicators.biomassa_ton_ha + (indicators.taxa_crescimento_biomassa * 10);
    
    return {
      estagio_5anos: estagio5,
      estagio_10anos: estagio10,
      riqueza_5anos: Math.round(indicators.riqueza_especies * 1.4),
      riqueza_10anos: Math.round(indicators.riqueza_especies * 1.8),
      biomassa_5anos_ton_ha: parseFloat(biomassa5.toFixed(1)),
      biomassa_10anos_ton_ha: parseFloat(biomassa10.toFixed(1)),
      carbono_5anos_tCO2e: this._calculateCarbon(biomassa5, indicators.area_ha),
      carbono_10anos_tCO2e: this._calculateCarbon(biomassa10, indicators.area_ha),
      tendencia: indicators.resiliencia_ecologica > 0.5 ? 'Progressiva' : 'Estável',
      velocidade: this._determineSuccessionSpeed(indicators),
      confianca: 0.70,
      recomendacoes_manejo: this._getDefaultRecommendations(indicators.estagio_atual),
      especies_sugeridas: ECOLOGICAL_CONSTANTS.NATIVE_SPECIES[indicators.estagio_atual] || [],
      alertas: this._generateAlerts(indicators),
      oportunidades: this._generateOpportunities(indicators),
      justificativa: `Predição baseada em modelos ecológicos para ${indicators.estagio_atual}`
    };
  },
  
  /**
   * Prediz próximo estágio sucessional
   */
  _predictNextStage: function(currentStage, years) {
    const stages = ['Pioneira', 'Inicial', 'Intermediária', 'Avançada', 'Clímax'];
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentIndex === -1) return 'Inicial';
    
    // Estima avanço baseado no tempo
    const advancement = years >= 10 ? 2 : (years >= 5 ? 1 : 0);
    const newIndex = Math.min(currentIndex + advancement, stages.length - 1);
    
    return stages[newIndex];
  },
  
  /**
   * Calcula sequestro de carbono
   */
  _calculateCarbon: function(biomass, area) {
    const carbon = biomass * ECOLOGICAL_CONSTANTS.BIOMASS_TO_CARBON;
    const co2e = carbon * ECOLOGICAL_CONSTANTS.CARBON_TO_CO2 * (area || 1);
    return parseFloat(co2e.toFixed(1));
  },
  
  /**
   * Determina velocidade de sucessão
   */
  _determineSuccessionSpeed: function(indicators) {
    const score = indicators.resiliencia_ecologica + 
                  (indicators.materia_organica / 10) + 
                  (indicators.precipitacao_anual / 2000);
    
    if (score > 1.5) return 'Muito Rápida';
    if (score > 1.2) return 'Rápida';
    if (score > 0.8) return 'Moderada';
    if (score > 0.5) return 'Lenta';
    return 'Muito Lenta';
  },
  
  /**
   * Recomendações padrão por estágio
   */
  _getDefaultRecommendations: function(estagio) {
    const recs = {
      'Pioneira': [
        'Introduzir espécies de crescimento rápido para sombreamento',
        'Aplicar cobertura morta para proteção do solo',
        'Controlar espécies invasoras agressivas'
      ],
      'Inicial': [
        'Enriquecer com espécies secundárias iniciais',
        'Realizar podas de formação nas pioneiras',
        'Monitorar regeneração natural'
      ],
      'Intermediária': [
        'Introduzir espécies climácicas tolerantes à sombra',
        'Realizar desbaste seletivo de pioneiras',
        'Manejar estratificação vertical'
      ],
      'Avançada': [
        'Favorecer regeneração natural de espécies tardias',
        'Monitorar fauna dispersora de sementes',
        'Avaliar potencial para certificação de carbono'
      ],
      'Clímax': [
        'Manter monitoramento de longo prazo',
        'Proteger árvores matrizes',
        'Documentar biodiversidade para pesquisa'
      ]
    };
    
    return recs[estagio] || recs['Inicial'];
  },
  
  /**
   * Gera alertas baseados nos indicadores
   */
  _generateAlerts: function(indicators) {
    const alerts = [];
    
    if (indicators.indice_shannon < 1.5) {
      alerts.push('Baixa diversidade - risco de instabilidade ecológica');
    }
    if (indicators.materia_organica < 2.0) {
      alerts.push('Solo empobrecido - necessita adubação orgânica');
    }
    if (indicators.ph_solo < 5.0 || indicators.ph_solo > 7.5) {
      alerts.push('pH do solo fora da faixa ideal');
    }
    if (indicators.cobertura_dossel < 30) {
      alerts.push('Baixa cobertura de dossel - exposição excessiva');
    }
    
    return alerts;
  },
  
  /**
   * Gera oportunidades baseadas nos indicadores
   */
  _generateOpportunities: function(indicators) {
    const opportunities = [];
    
    if (indicators.biomassa_ton_ha > 100) {
      opportunities.push('Potencial para créditos de carbono');
    }
    if (indicators.riqueza_especies > 30) {
      opportunities.push('Área adequada para pesquisa científica');
    }
    if (indicators.estagio_atual === 'Avançada' || indicators.estagio_atual === 'Clímax') {
      opportunities.push('Potencial para ecoturismo educativo');
    }
    if (indicators.resiliencia_ecologica > 0.7) {
      opportunities.push('Sistema resiliente - modelo para replicação');
    }
    
    return opportunities;
  },

  
  /**
   * Simula cenários futuros
   * @param {object} indicators - Indicadores atuais
   * @param {object} predictions - Predições base
   * @returns {object} Cenários simulados
   */
  _simulateScenarios: function(indicators, predictions) {
    return {
      otimista: {
        descricao: 'Manejo intensivo + condições climáticas favoráveis',
        estagio_10anos: this._predictNextStage(predictions.estagio_5anos, 5),
        riqueza_10anos: Math.round(predictions.riqueza_10anos * 1.3),
        biomassa_10anos_ton_ha: parseFloat((predictions.biomassa_10anos_ton_ha * 1.4).toFixed(1)),
        carbono_10anos_tCO2e: parseFloat((predictions.carbono_10anos_tCO2e * 1.4).toFixed(1)),
        shannon_estimado: Math.min(4.0, indicators.indice_shannon * 1.5),
        probabilidade: 0.25
      },
      realista: {
        descricao: 'Manejo moderado + condições climáticas normais',
        estagio_10anos: predictions.estagio_10anos,
        riqueza_10anos: predictions.riqueza_10anos,
        biomassa_10anos_ton_ha: predictions.biomassa_10anos_ton_ha,
        carbono_10anos_tCO2e: predictions.carbono_10anos_tCO2e,
        shannon_estimado: Math.min(4.0, indicators.indice_shannon * 1.25),
        probabilidade: 0.50
      },
      pessimista: {
        descricao: 'Baixo manejo + eventos climáticos extremos',
        estagio_10anos: indicators.estagio_atual, // Mantém estágio atual
        riqueza_10anos: Math.round(predictions.riqueza_10anos * 0.7),
        biomassa_10anos_ton_ha: parseFloat((predictions.biomassa_10anos_ton_ha * 0.8).toFixed(1)),
        carbono_10anos_tCO2e: parseFloat((predictions.carbono_10anos_tCO2e * 0.8).toFixed(1)),
        shannon_estimado: indicators.indice_shannon * 0.9,
        probabilidade: 0.25
      }
    };
  },
  
  /**
   * Gera recomendações de manejo
   * @param {object} indicators - Indicadores atuais
   * @param {object} predictions - Predições
   * @returns {Array} Lista de recomendações
   */
  _generateRecommendations: function(indicators, predictions) {
    const recommendations = [];
    
    // Recomendações baseadas na tendência
    if (predictions.tendencia === 'Regressiva') {
      recommendations.push({
        prioridade: 'CRÍTICA',
        categoria: 'Intervenção Urgente',
        acao: 'Diagnóstico e intervenção imediata',
        detalhes: 'Sistema apresenta sinais de degradação. Avaliar causas e implementar medidas corretivas.',
        prazo: 'Imediato'
      });
    }
    
    // Recomendações baseadas na diversidade
    if (indicators.indice_shannon < 2.0) {
      recommendations.push({
        prioridade: 'ALTA',
        categoria: 'Enriquecimento',
        acao: 'Aumentar diversidade de espécies',
        detalhes: `Introduzir espécies nativas: ${(predictions.especies_sugeridas || []).slice(0, 3).join(', ')}`,
        prazo: '3-6 meses'
      });
    }
    
    // Recomendações baseadas no solo
    if (indicators.materia_organica < 2.5) {
      recommendations.push({
        prioridade: 'MÉDIA',
        categoria: 'Manejo de Solo',
        acao: 'Aumentar matéria orgânica do solo',
        detalhes: 'Aplicar composto orgânico, cobertura morta e adubação verde.',
        prazo: '6-12 meses'
      });
    }
    
    // Recomendações baseadas no estágio
    if (indicators.estagio_atual === 'Pioneira' || indicators.estagio_atual === 'Inicial') {
      recommendations.push({
        prioridade: 'MÉDIA',
        categoria: 'Estruturação',
        acao: 'Acelerar estratificação vertical',
        detalhes: 'Introduzir espécies de diferentes estratos para criar microclima favorável.',
        prazo: '12 meses'
      });
    }
    
    // Recomendações de monitoramento
    recommendations.push({
      prioridade: 'BAIXA',
      categoria: 'Monitoramento',
      acao: 'Manter monitoramento regular',
      detalhes: 'Realizar avaliações trimestrais de biodiversidade e condições do solo.',
      prazo: 'Contínuo'
    });
    
    // Adiciona recomendações da IA se disponíveis
    if (predictions.recomendacoes_manejo && predictions.recomendacoes_manejo.length > 0) {
      predictions.recomendacoes_manejo.forEach((rec, index) => {
        if (typeof rec === 'string' && !recommendations.find(r => r.acao === rec)) {
          recommendations.push({
            prioridade: index === 0 ? 'ALTA' : 'MÉDIA',
            categoria: 'IA',
            acao: rec,
            detalhes: 'Recomendação gerada por análise de IA',
            prazo: '6-12 meses'
          });
        }
      });
    }
    
    return recommendations;
  },

  
  /**
   * Salva análise na planilha
   * @param {object} data - Dados da análise
   * @returns {string} ID da análise
   */
  _saveAnalysis: function(data) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        throw new Error('Planilha não encontrada');
      }
      
      const id = `SUC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const ind = data.indicators;
      const pred = data.predictions;
      const scen = data.scenarios;
      
      const row = [
        id,                                              // ID_Analise
        new Date(),                                      // Timestamp_Analise
        data.parcelaId,                                  // ID_Parcela
        data.historicalData.nome,                        // Nome_Parcela
        ind.area_ha,                                     // Area_ha
        ind.idade_sistema,                               // Idade_Sistema_anos
        ind.estagio_atual,                               // Estagio_Sucessional_Atual
        ind.indice_shannon,                              // Indice_Shannon_Atual
        ind.riqueza_especies,                            // Riqueza_Especies_Atual
        ind.biomassa_ton_ha,                             // Biomassa_Total_ton_ha
        ind.cobertura_dossel,                            // Cobertura_Dossel_percent
        ind.taxa_crescimento_biomassa,                   // Taxa_Crescimento_Biomassa_ano
        0,                                               // Taxa_Colonizacao_Especies_ano
        0,                                               // Mortalidade_Individuos_percent
        0,                                               // Recrutamento_Novos_Individuos
        ind.ph_solo,                                     // pH_Solo_Medio
        ind.materia_organica,                            // Materia_Organica_percent
        ind.umidade_solo,                                // Umidade_Solo_Media_percent
        ind.temperatura_media,                           // Temperatura_Media_C
        ind.precipitacao_anual,                          // Precipitacao_Anual_mm
        '',                                              // Ultima_Intervencao_Data
        'Nenhuma',                                       // Tipo_Intervencao
        'Baixa',                                         // Intensidade_Manejo
        pred.estagio_5anos,                              // Estagio_Previsto_5anos
        pred.estagio_10anos,                             // Estagio_Previsto_10anos
        pred.riqueza_5anos,                              // Riqueza_Prevista_5anos
        pred.biomassa_5anos_ton_ha,                      // Biomassa_Prevista_5anos_ton_ha
        pred.carbono_5anos_tCO2e,                        // Carbono_Sequestrado_5anos_tCO2e
        pred.tendencia,                                  // Tendencia_Sucessional
        pred.velocidade,                                 // Velocidade_Sucessao
        pred.confianca,                                  // Confianca_Predicao
        JSON.stringify(pred.recomendacoes_manejo || []), // IA_Recomendacoes_Manejo
        JSON.stringify(pred.especies_sugeridas || []),   // IA_Especies_Sugeridas_Plantio
        JSON.stringify(pred.alertas || []),              // IA_Alertas_Ecologicos
        JSON.stringify(pred.oportunidades || []),        // IA_Oportunidades_Conservacao
        JSON.stringify(scen.otimista),                   // Cenario_Otimista_JSON
        JSON.stringify(scen.realista),                   // Cenario_Realista_JSON
        JSON.stringify(scen.pessimista),                 // Cenario_Pessimista_JSON
        'gemini-2.0-flash',                              // Modelo_IA_Versao
        data.processingTime || 0,                        // Tempo_Processamento_ms
        'Pendente'                                       // Status_Validacao
      ];
      
      sheet.appendRow(row);
      
      Logger.log(`[EcologicalSuccessionAI] Análise salva: ${id}`);
      return id;
      
    } catch (error) {
      Logger.log(`[_saveAnalysis] Erro: ${error}`);
      return `SUC_${Date.now()}_ERROR`;
    }
  },
  
  /**
   * Obtém histórico de análises de uma parcela
   * @param {string} parcelaId - ID da parcela
   * @returns {Array} Lista de análises
   */
  getParcelaHistory: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const analyses = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === parcelaId) {
          analyses.push({
            id: data[i][0],
            timestamp: data[i][1],
            estagio_atual: data[i][6],
            indice_shannon: data[i][7],
            estagio_previsto_5anos: data[i][23],
            tendencia: data[i][28],
            confianca: data[i][30]
          });
        }
      }
      
      return analyses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    } catch (error) {
      Logger.log(`[getParcelaHistory] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Obtém todas as parcelas disponíveis
   * @returns {Array} Lista de parcelas
   */
  getParcelas: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.PARCELAS_AGRO);
      
      if (!sheet || sheet.getLastRow() < 2) {
        // Retorna parcelas de exemplo
        return [
          { id: 'PARCELA_001', nome: 'Parcela SAF 1', area_ha: 2.5 },
          { id: 'PARCELA_002', nome: 'Parcela SAF 2', area_ha: 1.8 },
          { id: 'PARCELA_003', nome: 'Parcela Agrofloresta', area_ha: 3.2 }
        ];
      }
      
      const data = sheet.getDataRange().getValues();
      const parcelas = [];
      
      for (let i = 1; i < data.length; i++) {
        parcelas.push({
          id: data[i][0],
          nome: data[i][2] || data[i][1],
          area_ha: parseFloat(data[i][4]) || 1.0
        });
      }
      
      return parcelas;
      
    } catch (error) {
      Logger.log(`[getParcelas] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Compara evolução entre duas análises
   * @param {string} analysisId1 - ID da primeira análise
   * @param {string} analysisId2 - ID da segunda análise
   * @returns {object} Comparação
   */
  compareAnalyses: function(analysisId1, analysisId2) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return { error: 'Planilha não encontrada' };
      
      const data = sheet.getDataRange().getValues();
      let analysis1 = null, analysis2 = null;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === analysisId1) analysis1 = data[i];
        if (data[i][0] === analysisId2) analysis2 = data[i];
      }
      
      if (!analysis1 || !analysis2) {
        return { error: 'Análise não encontrada' };
      }
      
      return {
        periodo: {
          inicio: analysis1[1],
          fim: analysis2[1]
        },
        evolucao: {
          shannon: {
            inicial: analysis1[7],
            final: analysis2[7],
            variacao: ((analysis2[7] - analysis1[7]) / analysis1[7] * 100).toFixed(1) + '%'
          },
          riqueza: {
            inicial: analysis1[8],
            final: analysis2[8],
            variacao: analysis2[8] - analysis1[8]
          },
          biomassa: {
            inicial: analysis1[9],
            final: analysis2[9],
            variacao: ((analysis2[9] - analysis1[9]) / analysis1[9] * 100).toFixed(1) + '%'
          },
          estagio: {
            inicial: analysis1[6],
            final: analysis2[6]
          }
        }
      };
      
    } catch (error) {
      Logger.log(`[compareAnalyses] Erro: ${error}`);
      return { error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P02 Sucessão Ecológica
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de sucessão ecológica
 * @returns {object} Resultado
 */
function apiSucessaoInit() {
  return EcologicalSuccessionAI.initializeSheet();
}

/**
 * Analisa sucessão ecológica de uma parcela
 * @param {string} parcelaId - ID da parcela
 * @param {object} options - Opções de análise
 * @returns {object} Resultado da análise
 */
function apiSucessaoAnalyze(parcelaId, options) {
  return EcologicalSuccessionAI.analyzeSuccession(parcelaId, options || {});
}

/**
 * Obtém histórico de análises de uma parcela
 * @param {string} parcelaId - ID da parcela
 * @returns {Array} Histórico de análises
 */
function apiSucessaoHistory(parcelaId) {
  return EcologicalSuccessionAI.getParcelaHistory(parcelaId);
}

/**
 * Obtém lista de parcelas disponíveis
 * @returns {Array} Lista de parcelas
 */
function apiSucessaoGetParcelas() {
  return EcologicalSuccessionAI.getParcelas();
}

/**
 * Compara duas análises
 * @param {string} id1 - ID da primeira análise
 * @param {string} id2 - ID da segunda análise
 * @returns {object} Comparação
 */
function apiSucessaoCompare(id1, id2) {
  return EcologicalSuccessionAI.compareAnalyses(id1, id2);
}

/**
 * Função de conveniência para análise rápida
 * Analisa todas as parcelas disponíveis
 * @returns {Array} Resultados das análises
 */
function apiSucessaoAnalyzeAll() {
  const parcelas = EcologicalSuccessionAI.getParcelas();
  const results = [];
  
  parcelas.forEach(parcela => {
    const result = EcologicalSuccessionAI.analyzeSuccession(parcela.id);
    results.push({
      parcela: parcela.nome,
      success: result.success,
      estagio: result.currentStage,
      tendencia: result.predictions?.tendencia,
      confianca: result.confidence
    });
  });
  
  return results;
}
