/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - PREDIÇÃO DE EVENTOS EXTREMOS
 * ═══════════════════════════════════════════════════════════════════════════
 * P12 - Sistema de Alerta Antecipado para Eventos Climáticos Extremos
 * 
 * Funcionalidades:
 * - Predição de secas, chuvas intensas, incêndios, ondas de calor
 * - Alertas com 7-30 dias de antecedência
 * - Avaliação de impactos na biodiversidade
 * - Planos de resposta automatizados
 * - Integração com sistema de alertas (P03)
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha EVENTOS_EXTREMOS_RA
 */
const SCHEMA_EVENTOS_EXTREMOS = {
  ID_Evento: { type: 'string', required: true, unique: true },
  Tipo_Evento: { type: 'enum', values: ['Seca', 'Chuva_Intensa', 'Incendio', 'Onda_Calor', 'Geada'] },
  Data_Predicao: { type: 'datetime', required: true },
  Data_Evento_Prevista: { type: 'datetime' },
  Dias_Antecedencia: { type: 'integer' },
  Probabilidade: { type: 'float', range: [0, 1] },
  Severidade: { type: 'enum', values: ['Baixa', 'Moderada', 'Alta', 'Extrema'] },
  Confianca_Modelo: { type: 'float', range: [0, 1] },
  Duracao_Prevista_dias: { type: 'integer' },
  Intensidade_Score: { type: 'float' },
  Area_Afetada_ha: { type: 'float' },
  Zonas_Risco_JSON: { type: 'text' },
  Especies_Vulneraveis_JSON: { type: 'text' },
  Habitats_Afetados_JSON: { type: 'text' },
  Risco_Mortalidade_Fauna: { type: 'enum', values: ['Baixo', 'Moderado', 'Alto', 'Critico'] },
  Risco_Perda_Vegetacao: { type: 'enum', values: ['Baixo', 'Moderado', 'Alto', 'Critico'] },
  Plano_Resposta_JSON: { type: 'text' },
  Acoes_Preventivas_JSON: { type: 'text' },
  Recursos_Necessarios_JSON: { type: 'text' },
  Custo_Resposta_BRL: { type: 'float' },
  Status_Alerta: { type: 'enum', values: ['Emitido', 'Ativo', 'Encerrado', 'Falso_Positivo'] },
  Evento_Confirmado: { type: 'boolean' },
  Danos_Reais: { type: 'text' }
};

const EVENTOS_EXTREMOS_HEADERS = [
  'ID_Evento', 'Tipo_Evento', 'Data_Predicao', 'Data_Evento_Prevista',
  'Dias_Antecedencia', 'Probabilidade', 'Severidade', 'Confianca_Modelo',
  'Duracao_Prevista_dias', 'Intensidade_Score', 'Area_Afetada_ha', 'Zonas_Risco_JSON',
  'Especies_Vulneraveis_JSON', 'Habitats_Afetados_JSON', 'Risco_Mortalidade_Fauna',
  'Risco_Perda_Vegetacao', 'Plano_Resposta_JSON', 'Acoes_Preventivas_JSON',
  'Recursos_Necessarios_JSON', 'Custo_Resposta_BRL', 'Status_Alerta',
  'Evento_Confirmado', 'Danos_Reais'
];


/**
 * Preditor de Eventos Extremos
 * @namespace ExtremeEventsPredictor
 */
const ExtremeEventsPredictor = {
  
  SHEET_NAME: 'EVENTOS_EXTREMOS_RA',
  
  /**
   * Dados climáticos de referência para o Cerrado
   */
  CLIMATE_BASELINE: {
    temp_media: 24.5,
    temp_max_media: 31.2,
    temp_min_media: 17.8,
    precipitacao_media_mensal: 120, // mm
    umidade_media: 65,
    evapotranspiracao_diaria: 4.5, // mm/dia
    estacao_seca: [5, 6, 7, 8, 9], // Maio a Setembro
    estacao_chuvosa: [10, 11, 12, 1, 2, 3, 4]
  },
  
  /**
   * Zonas de risco na reserva
   */
  RISK_ZONES: [
    { id: 'Z1', nome: 'Mata Ciliar Norte', tipo: 'Mata_Ciliar', risco_incendio: 'Baixo', risco_seca: 'Moderado' },
    { id: 'Z2', nome: 'Cerrado Sentido Restrito', tipo: 'Cerrado', risco_incendio: 'Alto', risco_seca: 'Alto' },
    { id: 'Z3', nome: 'Vereda do Buriti', tipo: 'Vereda', risco_incendio: 'Baixo', risco_seca: 'Alto' },
    { id: 'Z4', nome: 'SAF Principal', tipo: 'SAF', risco_incendio: 'Moderado', risco_seca: 'Moderado' },
    { id: 'Z5', nome: 'Borda Florestal', tipo: 'Borda', risco_incendio: 'Alto', risco_seca: 'Moderado' },
    { id: 'Z6', nome: 'Área de Recuperação', tipo: 'Recuperacao', risco_incendio: 'Muito_Alto', risco_seca: 'Alto' }
  ],
  
  /**
   * Espécies vulneráveis por tipo de evento
   */
  VULNERABLE_SPECIES: {
    'Seca': [
      { nome: 'Mauritia flexuosa', comum: 'Buriti', sensibilidade: 'Muito_Alta' },
      { nome: 'Euterpe edulis', comum: 'Palmito-juçara', sensibilidade: 'Muito_Alta' },
      { nome: 'Anfíbios (geral)', comum: 'Sapos e rãs', sensibilidade: 'Alta' },
      { nome: 'Espécies de sub-bosque', comum: 'Herbáceas', sensibilidade: 'Alta' }
    ],
    'Incendio': [
      { nome: 'Myrmecophaga tridactyla', comum: 'Tamanduá-bandeira', sensibilidade: 'Alta' },
      { nome: 'Priodontes maximus', comum: 'Tatu-canastra', sensibilidade: 'Alta' },
      { nome: 'Répteis (geral)', comum: 'Lagartos e serpentes', sensibilidade: 'Muito_Alta' },
      { nome: 'Ninhos de aves', comum: 'Aves nidificantes', sensibilidade: 'Muito_Alta' },
      { nome: 'Invertebrados de solo', comum: 'Insetos e aracnídeos', sensibilidade: 'Muito_Alta' }
    ],
    'Chuva_Intensa': [
      { nome: 'Ninhos terrestres', comum: 'Aves de solo', sensibilidade: 'Alta' },
      { nome: 'Tocas de mamíferos', comum: 'Tatus e roedores', sensibilidade: 'Moderada' },
      { nome: 'Mudas recém-plantadas', comum: 'Restauração', sensibilidade: 'Alta' }
    ],
    'Onda_Calor': [
      { nome: 'Chrysocyon brachyurus', comum: 'Lobo-guará', sensibilidade: 'Moderada' },
      { nome: 'Anfíbios (geral)', comum: 'Sapos e rãs', sensibilidade: 'Muito_Alta' },
      { nome: 'Peixes de riachos', comum: 'Ictiofauna', sensibilidade: 'Alta' }
    ],
    'Geada': [
      { nome: 'Espécies tropicais', comum: 'Plantas sensíveis ao frio', sensibilidade: 'Muito_Alta' },
      { nome: 'Mudas jovens', comum: 'Restauração', sensibilidade: 'Alta' }
    ]
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
        sheet.appendRow(EVENTOS_EXTREMOS_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, EVENTOS_EXTREMOS_HEADERS.length);
        headerRange.setBackground('#D32F2F');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
        
        Logger.log(`[ExtremeEventsPredictor] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[ExtremeEventsPredictor] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },


  /**
   * Prediz eventos extremos nos próximos dias
   * @param {number} days - Dias para previsão (padrão: 30)
   * @returns {object} Predições de eventos extremos
   */
  predictExtremeEvents: function(days = 30) {
    try {
      this.initializeSheet();
      
      const predictions = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Gera dados meteorológicos simulados
      const weatherData = this._generateWeatherForecast(days);
      
      // 1. Prediz risco de seca
      const droughtRisk = this._predictDrought(weatherData, currentMonth);
      if (droughtRisk.probabilidade > 0.4) {
        predictions.push(droughtRisk);
      }
      
      // 2. Prediz risco de incêndio
      const fireRisk = this._predictFireRisk(weatherData, currentMonth);
      if (fireRisk.probabilidade > 0.3) {
        predictions.push(fireRisk);
      }
      
      // 3. Prediz chuvas intensas
      const rainRisk = this._predictIntenseRain(weatherData, currentMonth);
      if (rainRisk.probabilidade > 0.4) {
        predictions.push(rainRisk);
      }
      
      // 4. Prediz ondas de calor
      const heatwaveRisk = this._predictHeatwave(weatherData);
      if (heatwaveRisk.probabilidade > 0.4) {
        predictions.push(heatwaveRisk);
      }
      
      // 5. Prediz geada (apenas em meses frios)
      if ([5, 6, 7, 8].includes(currentMonth)) {
        const frostRisk = this._predictFrost(weatherData);
        if (frostRisk.probabilidade > 0.3) {
          predictions.push(frostRisk);
        }
      }
      
      // Ordena por probabilidade
      predictions.sort((a, b) => b.probabilidade - a.probabilidade);
      
      // Salva predições
      predictions.forEach(pred => {
        this._savePrediction(pred);
      });
      
      return {
        success: true,
        forecast_days: days,
        generated_at: currentDate.toISOString(),
        total_predictions: predictions.length,
        high_risk_count: predictions.filter(p => p.severidade === 'Alta' || p.severidade === 'Extrema').length,
        predictions: predictions,
        summary: this._generateSummary(predictions)
      };
      
    } catch (error) {
      Logger.log(`[predictExtremeEvents] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera previsão meteorológica simulada
   * @private
   */
  _generateWeatherForecast: function(days) {
    const forecast = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const isRainySeason = this.CLIMATE_BASELINE.estacao_chuvosa.includes(currentMonth);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Variação sazonal
      const seasonalFactor = isRainySeason ? 1.2 : 0.3;
      
      // Temperatura com variação
      const tempVariation = (Math.random() - 0.5) * 6;
      const temp_max = this.CLIMATE_BASELINE.temp_max_media + tempVariation + (isRainySeason ? -2 : 3);
      const temp_min = this.CLIMATE_BASELINE.temp_min_media + tempVariation * 0.5;
      
      // Precipitação
      const rainChance = isRainySeason ? 0.6 : 0.1;
      const hasRain = Math.random() < rainChance;
      const precipitation = hasRain ? Math.random() * 40 * seasonalFactor : 0;
      
      // Umidade
      const humidity = isRainySeason ? 70 + Math.random() * 20 : 40 + Math.random() * 25;
      
      // Vento
      const wind_speed = 5 + Math.random() * 15;
      
      forecast.push({
        date: date,
        day: i + 1,
        temp_max: parseFloat(temp_max.toFixed(1)),
        temp_min: parseFloat(temp_min.toFixed(1)),
        temp_media: parseFloat(((temp_max + temp_min) / 2).toFixed(1)),
        precipitation: parseFloat(precipitation.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(0)),
        humidity_min: parseFloat((humidity - 15).toFixed(0)),
        wind_speed: parseFloat(wind_speed.toFixed(1)),
        is_rainy_season: isRainySeason
      });
    }
    
    return forecast;
  },

  /**
   * Prediz risco de seca
   * @private
   */
  _predictDrought: function(weatherData, currentMonth) {
    const dryDays = weatherData.filter(d => d.precipitation < 1).length;
    const avgHumidity = weatherData.reduce((sum, d) => sum + d.humidity, 0) / weatherData.length;
    const isDrySeason = this.CLIMATE_BASELINE.estacao_seca.includes(currentMonth);
    
    // Calcula déficit hídrico acumulado
    let waterDeficit = 0;
    weatherData.forEach(d => {
      const evapotranspiration = this.CLIMATE_BASELINE.evapotranspiracao_diaria * (d.temp_media / 25);
      waterDeficit += evapotranspiration - d.precipitation;
    });
    
    // Probabilidade baseada em múltiplos fatores
    let probability = 0;
    probability += (dryDays / weatherData.length) * 0.3;
    probability += ((100 - avgHumidity) / 100) * 0.25;
    probability += isDrySeason ? 0.25 : 0.05;
    probability += Math.min(waterDeficit / 100, 0.2);
    
    const severity = this._classifySeverity(probability, 'Seca');
    const affectedZones = this.RISK_ZONES.filter(z => z.risco_seca === 'Alto' || z.risco_seca === 'Muito_Alto');
    
    return {
      id: `EVT-SECA-${Date.now()}`,
      tipo: 'Seca',
      probabilidade: parseFloat(probability.toFixed(3)),
      severidade: severity,
      confianca: 0.75,
      dias_antecedencia: isDrySeason ? 7 : 14,
      duracao_prevista: Math.round(dryDays * 1.5),
      intensidade: parseFloat((waterDeficit / 50).toFixed(2)),
      area_afetada: affectedZones.length * 45,
      zonas_risco: affectedZones,
      especies_vulneraveis: this.VULNERABLE_SPECIES['Seca'],
      habitats_afetados: ['Veredas', 'Matas de Galeria', 'Áreas de Recuperação'],
      risco_mortalidade_fauna: severity === 'Extrema' ? 'Critico' : severity === 'Alta' ? 'Alto' : 'Moderado',
      risco_perda_vegetacao: severity === 'Extrema' ? 'Critico' : severity === 'Alta' ? 'Alto' : 'Moderado',
      indicadores: {
        dias_sem_chuva: dryDays,
        umidade_media: avgHumidity,
        deficit_hidrico_mm: waterDeficit,
        estacao_seca: isDrySeason
      }
    };
  },

  /**
   * Prediz risco de incêndio
   * @private
   */
  _predictFireRisk: function(weatherData, currentMonth) {
    const isDrySeason = this.CLIMATE_BASELINE.estacao_seca.includes(currentMonth);
    
    // Calcula Fire Weather Index simplificado
    const fwiScores = weatherData.map(d => this._calculateFireWeatherIndex(d));
    const avgFWI = fwiScores.reduce((sum, f) => sum + f, 0) / fwiScores.length;
    const maxFWI = Math.max(...fwiScores);
    
    // Dias de alto risco
    const highRiskDays = fwiScores.filter(f => f > 0.6).length;
    
    // Probabilidade
    let probability = 0;
    probability += avgFWI * 0.35;
    probability += (highRiskDays / weatherData.length) * 0.25;
    probability += isDrySeason ? 0.25 : 0.05;
    probability += (maxFWI > 0.8) ? 0.15 : 0;
    
    const severity = this._classifySeverity(probability, 'Incendio');
    const affectedZones = this.RISK_ZONES.filter(z => 
      z.risco_incendio === 'Alto' || z.risco_incendio === 'Muito_Alto'
    );
    
    // Encontra dia de maior risco
    const peakRiskDay = fwiScores.indexOf(maxFWI) + 1;
    
    return {
      id: `EVT-FOGO-${Date.now()}`,
      tipo: 'Incendio',
      probabilidade: parseFloat(Math.min(probability, 0.95).toFixed(3)),
      severidade: severity,
      confianca: 0.80,
      dias_antecedencia: peakRiskDay,
      duracao_prevista: highRiskDays,
      intensidade: parseFloat(maxFWI.toFixed(2)),
      area_afetada: affectedZones.length * 60,
      zonas_risco: affectedZones,
      especies_vulneraveis: this.VULNERABLE_SPECIES['Incendio'],
      habitats_afetados: ['Cerrado Sentido Restrito', 'Bordas Florestais', 'Áreas de Recuperação'],
      risco_mortalidade_fauna: severity === 'Extrema' ? 'Critico' : severity === 'Alta' ? 'Alto' : 'Moderado',
      risco_perda_vegetacao: severity === 'Extrema' ? 'Critico' : 'Alto',
      indicadores: {
        fwi_medio: avgFWI,
        fwi_maximo: maxFWI,
        dias_alto_risco: highRiskDays,
        dia_pico_risco: peakRiskDay,
        estacao_seca: isDrySeason
      }
    };
  },

  /**
   * Prediz chuvas intensas
   * @private
   */
  _predictIntenseRain: function(weatherData, currentMonth) {
    const isRainySeason = this.CLIMATE_BASELINE.estacao_chuvosa.includes(currentMonth);
    
    // Identifica dias com chuva intensa (>30mm)
    const intenseDays = weatherData.filter(d => d.precipitation > 30);
    const veryIntenseDays = weatherData.filter(d => d.precipitation > 50);
    const totalPrecipitation = weatherData.reduce((sum, d) => sum + d.precipitation, 0);
    
    // Probabilidade
    let probability = 0;
    probability += isRainySeason ? 0.35 : 0.1;
    probability += (intenseDays.length / weatherData.length) * 0.3;
    probability += (veryIntenseDays.length > 0) ? 0.2 : 0;
    probability += (totalPrecipitation > 200) ? 0.15 : 0;
    
    const severity = this._classifySeverity(probability, 'Chuva_Intensa');
    
    // Zonas vulneráveis a alagamento
    const affectedZones = this.RISK_ZONES.filter(z => 
      z.tipo === 'Vereda' || z.tipo === 'Mata_Ciliar' || z.tipo === 'Recuperacao'
    );
    
    return {
      id: `EVT-CHUVA-${Date.now()}`,
      tipo: 'Chuva_Intensa',
      probabilidade: parseFloat(probability.toFixed(3)),
      severidade: severity,
      confianca: 0.70,
      dias_antecedencia: intenseDays.length > 0 ? 
        weatherData.findIndex(d => d.precipitation > 30) + 1 : 7,
      duracao_prevista: intenseDays.length || 1,
      intensidade: parseFloat((Math.max(...weatherData.map(d => d.precipitation)) / 50).toFixed(2)),
      area_afetada: affectedZones.length * 30,
      zonas_risco: affectedZones,
      especies_vulneraveis: this.VULNERABLE_SPECIES['Chuva_Intensa'],
      habitats_afetados: ['Veredas', 'Matas Ciliares', 'Áreas Baixas'],
      risco_mortalidade_fauna: severity === 'Extrema' ? 'Alto' : 'Moderado',
      risco_perda_vegetacao: 'Baixo',
      indicadores: {
        dias_chuva_intensa: intenseDays.length,
        dias_chuva_muito_intensa: veryIntenseDays.length,
        precipitacao_total_mm: totalPrecipitation,
        precipitacao_maxima_mm: Math.max(...weatherData.map(d => d.precipitation)),
        estacao_chuvosa: isRainySeason
      }
    };
  },

  /**
   * Prediz ondas de calor
   * @private
   */
  _predictHeatwave: function(weatherData) {
    const baseline = this.CLIMATE_BASELINE.temp_max_media;
    const threshold = baseline + 5; // 5°C acima da média
    
    // Identifica dias de calor extremo
    const hotDays = weatherData.filter(d => d.temp_max > threshold);
    
    // Identifica sequências de dias quentes (onda de calor = 3+ dias consecutivos)
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    weatherData.forEach(d => {
      if (d.temp_max > threshold) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });
    
    const avgMaxTemp = weatherData.reduce((sum, d) => sum + d.temp_max, 0) / weatherData.length;
    const peakTemp = Math.max(...weatherData.map(d => d.temp_max));
    
    // Probabilidade
    let probability = 0;
    probability += (hotDays.length / weatherData.length) * 0.35;
    probability += (maxConsecutive >= 3) ? 0.3 : (maxConsecutive >= 2) ? 0.15 : 0;
    probability += ((avgMaxTemp - baseline) / 10) * 0.2;
    probability += (peakTemp > 38) ? 0.15 : 0;
    
    const severity = this._classifySeverity(probability, 'Onda_Calor');
    
    return {
      id: `EVT-CALOR-${Date.now()}`,
      tipo: 'Onda_Calor',
      probabilidade: parseFloat(probability.toFixed(3)),
      severidade: severity,
      confianca: 0.72,
      dias_antecedencia: hotDays.length > 0 ? 
        weatherData.findIndex(d => d.temp_max > threshold) + 1 : 10,
      duracao_prevista: maxConsecutive || hotDays.length,
      intensidade: parseFloat(((peakTemp - baseline) / 10).toFixed(2)),
      area_afetada: 180, // Afeta toda a reserva
      zonas_risco: this.RISK_ZONES,
      especies_vulneraveis: this.VULNERABLE_SPECIES['Onda_Calor'],
      habitats_afetados: ['Todos os habitats', 'Corpos d\'água', 'Áreas abertas'],
      risco_mortalidade_fauna: severity === 'Extrema' ? 'Critico' : severity === 'Alta' ? 'Alto' : 'Moderado',
      risco_perda_vegetacao: 'Moderado',
      indicadores: {
        dias_calor_extremo: hotDays.length,
        dias_consecutivos_max: maxConsecutive,
        temperatura_maxima: peakTemp,
        temperatura_media_maximas: avgMaxTemp,
        anomalia_termica: avgMaxTemp - baseline
      }
    };
  },

  /**
   * Prediz geadas
   * @private
   */
  _predictFrost: function(weatherData) {
    const frostThreshold = 3; // °C
    
    // Identifica dias com risco de geada
    const frostDays = weatherData.filter(d => d.temp_min < frostThreshold);
    const severeFrostDays = weatherData.filter(d => d.temp_min < 0);
    
    const minTemp = Math.min(...weatherData.map(d => d.temp_min));
    const avgMinTemp = weatherData.reduce((sum, d) => sum + d.temp_min, 0) / weatherData.length;
    
    // Probabilidade
    let probability = 0;
    probability += (frostDays.length / weatherData.length) * 0.4;
    probability += (severeFrostDays.length > 0) ? 0.3 : 0;
    probability += (minTemp < 0) ? 0.2 : (minTemp < 3) ? 0.1 : 0;
    probability += (avgMinTemp < 10) ? 0.1 : 0;
    
    const severity = this._classifySeverity(probability, 'Geada');
    
    // Zonas mais vulneráveis (áreas baixas e de recuperação)
    const affectedZones = this.RISK_ZONES.filter(z => 
      z.tipo === 'Vereda' || z.tipo === 'Recuperacao' || z.tipo === 'SAF'
    );
    
    return {
      id: `EVT-GEADA-${Date.now()}`,
      tipo: 'Geada',
      probabilidade: parseFloat(probability.toFixed(3)),
      severidade: severity,
      confianca: 0.68,
      dias_antecedencia: frostDays.length > 0 ? 
        weatherData.findIndex(d => d.temp_min < frostThreshold) + 1 : 14,
      duracao_prevista: frostDays.length || 1,
      intensidade: parseFloat((Math.abs(minTemp - frostThreshold) / 5).toFixed(2)),
      area_afetada: affectedZones.length * 25,
      zonas_risco: affectedZones,
      especies_vulneraveis: this.VULNERABLE_SPECIES['Geada'],
      habitats_afetados: ['Veredas', 'SAFs', 'Áreas de Recuperação'],
      risco_mortalidade_fauna: 'Baixo',
      risco_perda_vegetacao: severity === 'Extrema' ? 'Critico' : severity === 'Alta' ? 'Alto' : 'Moderado',
      indicadores: {
        dias_risco_geada: frostDays.length,
        dias_geada_severa: severeFrostDays.length,
        temperatura_minima: minTemp,
        temperatura_media_minimas: avgMinTemp
      }
    };
  },

  /**
   * Classifica severidade do evento
   * @private
   */
  _classifySeverity: function(probability, eventType) {
    // Ajusta thresholds por tipo de evento
    const thresholds = {
      'Seca': { baixa: 0.3, moderada: 0.5, alta: 0.7 },
      'Incendio': { baixa: 0.25, moderada: 0.45, alta: 0.65 },
      'Chuva_Intensa': { baixa: 0.35, moderada: 0.55, alta: 0.75 },
      'Onda_Calor': { baixa: 0.3, moderada: 0.5, alta: 0.7 },
      'Geada': { baixa: 0.25, moderada: 0.45, alta: 0.65 }
    };
    
    const t = thresholds[eventType] || { baixa: 0.3, moderada: 0.5, alta: 0.7 };
    
    if (probability >= t.alta) return 'Extrema';
    if (probability >= t.moderada) return 'Alta';
    if (probability >= t.baixa) return 'Moderada';
    return 'Baixa';
  },

  /**
   * Calcula Fire Weather Index simplificado
   * @private
   */
  _calculateFireWeatherIndex: function(dayData) {
    // FWI simplificado baseado em temperatura, umidade e vento
    const tempFactor = Math.min((dayData.temp_max - 20) / 20, 1);
    const humidityFactor = Math.max((100 - dayData.humidity) / 100, 0);
    const windFactor = Math.min(dayData.wind_speed / 30, 1);
    const rainFactor = dayData.precipitation > 5 ? 0 : (dayData.precipitation > 0 ? 0.5 : 1);
    
    const fwi = (tempFactor * 0.3 + humidityFactor * 0.35 + windFactor * 0.15 + rainFactor * 0.2);
    return parseFloat(Math.max(0, Math.min(1, fwi)).toFixed(3));
  },

  /**
   * Gera plano de resposta para evento
   */
  generateResponsePlan: function(eventId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      // Busca evento
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('ID_Evento');
      const tipoIndex = headers.indexOf('Tipo_Evento');
      const severidadeIndex = headers.indexOf('Severidade');
      
      let eventRow = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === eventId) {
          eventRow = data[i];
          break;
        }
      }
      
      if (!eventRow) {
        return { success: false, error: 'Evento não encontrado' };
      }
      
      const tipo = eventRow[tipoIndex];
      const severidade = eventRow[severidadeIndex];
      
      // Gera plano baseado no tipo e severidade
      const plan = this._createResponsePlan(tipo, severidade);
      
      return {
        success: true,
        event_id: eventId,
        event_type: tipo,
        severity: severidade,
        plan: plan
      };
      
    } catch (error) {
      Logger.log(`[generateResponsePlan] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cria plano de resposta específico
   * @private
   */
  _createResponsePlan: function(tipo, severidade) {
    const plans = {
      'Seca': {
        acoes_imediatas: [
          'Verificar níveis de água em reservatórios',
          'Intensificar monitoramento de veredas e nascentes',
          'Preparar sistema de irrigação de emergência para mudas',
          'Alertar equipe de campo sobre risco de incêndio'
        ],
        acoes_preventivas: [
          'Aplicar cobertura morta em áreas de plantio',
          'Reduzir atividades que gerem faíscas',
          'Preparar aceiros preventivos',
          'Verificar equipamentos de combate a incêndio'
        ],
        recursos: [
          { item: 'Caminhão-pipa', quantidade: severidade === 'Extrema' ? 2 : 1 },
          { item: 'Bombas de irrigação', quantidade: 3 },
          { item: 'Mangueiras (metros)', quantidade: 500 },
          { item: 'Equipe de campo', quantidade: severidade === 'Extrema' ? 8 : 4 }
        ],
        monitoramento: [
          'Umidade do solo diária',
          'Nível de corpos d\'água',
          'Condição de espécies sensíveis',
          'Índice de vegetação (NDVI)'
        ],
        custo_estimado: severidade === 'Extrema' ? 15000 : severidade === 'Alta' ? 8000 : 3000
      },
      'Incendio': {
        acoes_imediatas: [
          'Ativar brigada de incêndio',
          'Verificar aceiros e roçar se necessário',
          'Posicionar equipamentos em pontos estratégicos',
          'Alertar Corpo de Bombeiros e ICMBio'
        ],
        acoes_preventivas: [
          'Ampliar aceiros para 10m de largura',
          'Remover material combustível acumulado',
          'Instalar torres de observação temporárias',
          'Proibir queimadas na região'
        ],
        recursos: [
          { item: 'Abafadores', quantidade: 20 },
          { item: 'Bombas costais', quantidade: 10 },
          { item: 'Caminhão-pipa', quantidade: severidade === 'Extrema' ? 3 : 1 },
          { item: 'Brigadistas', quantidade: severidade === 'Extrema' ? 15 : 8 },
          { item: 'EPIs completos', quantidade: 15 },
          { item: 'Rádios comunicadores', quantidade: 8 }
        ],
        monitoramento: [
          'Patrulhamento diário em áreas de risco',
          'Monitoramento de focos de calor (INPE)',
          'Verificação de umidade relativa',
          'Vigilância em bordas florestais'
        ],
        custo_estimado: severidade === 'Extrema' ? 50000 : severidade === 'Alta' ? 25000 : 10000
      },
      'Chuva_Intensa': {
        acoes_imediatas: [
          'Verificar drenagem em áreas de plantio',
          'Proteger mudas recém-plantadas',
          'Recolher equipamentos de campo',
          'Alertar sobre risco de alagamento'
        ],
        acoes_preventivas: [
          'Limpar canais de drenagem',
          'Reforçar contenções em encostas',
          'Verificar estruturas de pontes e passagens',
          'Preparar abrigos para fauna'
        ],
        recursos: [
          { item: 'Lonas de proteção', quantidade: 50 },
          { item: 'Sacos de areia', quantidade: 200 },
          { item: 'Bombas de drenagem', quantidade: 3 },
          { item: 'Equipe de emergência', quantidade: 6 }
        ],
        monitoramento: [
          'Nível de rios e córregos',
          'Áreas de alagamento',
          'Erosão em trilhas e acessos',
          'Condição de infraestrutura'
        ],
        custo_estimado: severidade === 'Extrema' ? 12000 : severidade === 'Alta' ? 6000 : 2500
      },
      'Onda_Calor': {
        acoes_imediatas: [
          'Aumentar disponibilidade de água para fauna',
          'Intensificar irrigação em áreas críticas',
          'Reduzir atividades de campo no período mais quente',
          'Monitorar animais em cativeiro/reabilitação'
        ],
        acoes_preventivas: [
          'Instalar bebedouros artificiais',
          'Criar áreas de sombra temporárias',
          'Verificar sistema de irrigação',
          'Preparar equipe para resgate de fauna'
        ],
        recursos: [
          { item: 'Bebedouros artificiais', quantidade: 10 },
          { item: 'Reservatórios de água (1000L)', quantidade: 5 },
          { item: 'Telas de sombreamento', quantidade: 20 },
          { item: 'Equipe de monitoramento', quantidade: 4 }
        ],
        monitoramento: [
          'Temperatura e umidade horária',
          'Comportamento da fauna',
          'Condição de corpos d\'água',
          'Estresse hídrico em plantas'
        ],
        custo_estimado: severidade === 'Extrema' ? 8000 : severidade === 'Alta' ? 4000 : 1500
      },
      'Geada': {
        acoes_imediatas: [
          'Proteger mudas sensíveis com cobertura',
          'Irrigar áreas críticas antes da geada',
          'Verificar animais em áreas expostas',
          'Acionar aquecimento em viveiros'
        ],
        acoes_preventivas: [
          'Instalar túneis de proteção em mudas',
          'Aplicar cobertura morta espessa',
          'Preparar material de proteção térmica',
          'Identificar espécies mais vulneráveis'
        ],
        recursos: [
          { item: 'TNT para cobertura (m²)', quantidade: 500 },
          { item: 'Palha para cobertura (fardos)', quantidade: 50 },
          { item: 'Aquecedores para viveiro', quantidade: 4 },
          { item: 'Equipe de proteção', quantidade: 6 }
        ],
        monitoramento: [
          'Temperatura mínima noturna',
          'Previsão de geada (INMET)',
          'Condição de mudas protegidas',
          'Danos em vegetação sensível'
        ],
        custo_estimado: severidade === 'Extrema' ? 10000 : severidade === 'Alta' ? 5000 : 2000
      }
    };
    
    return plans[tipo] || plans['Seca'];
  },

  /**
   * Salva predição na planilha
   * @private
   */
  _savePrediction: function(prediction) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        this.initializeSheet();
      }
      
      const plan = this._createResponsePlan(prediction.tipo, prediction.severidade);
      
      const row = [
        prediction.id,
        prediction.tipo,
        new Date().toISOString(),
        new Date(Date.now() + prediction.dias_antecedencia * 24 * 60 * 60 * 1000).toISOString(),
        prediction.dias_antecedencia,
        prediction.probabilidade,
        prediction.severidade,
        prediction.confianca,
        prediction.duracao_prevista,
        prediction.intensidade,
        prediction.area_afetada,
        JSON.stringify(prediction.zonas_risco),
        JSON.stringify(prediction.especies_vulneraveis),
        JSON.stringify(prediction.habitats_afetados),
        prediction.risco_mortalidade_fauna,
        prediction.risco_perda_vegetacao,
        JSON.stringify(plan),
        JSON.stringify(plan.acoes_preventivas),
        JSON.stringify(plan.recursos),
        plan.custo_estimado,
        'Emitido',
        false,
        ''
      ];
      
      ss.getSheetByName(this.SHEET_NAME).appendRow(row);
      
      return true;
    } catch (error) {
      Logger.log(`[_savePrediction] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Gera resumo das predições
   * @private
   */
  _generateSummary: function(predictions) {
    if (predictions.length === 0) {
      return {
        status: 'Normal',
        message: 'Nenhum evento extremo previsto para o período',
        alert_level: 'Verde'
      };
    }
    
    const highRisk = predictions.filter(p => p.severidade === 'Alta' || p.severidade === 'Extrema');
    const types = [...new Set(predictions.map(p => p.tipo))];
    
    let alertLevel = 'Verde';
    if (highRisk.length > 0) {
      alertLevel = highRisk.some(p => p.severidade === 'Extrema') ? 'Vermelho' : 'Laranja';
    } else if (predictions.length > 0) {
      alertLevel = 'Amarelo';
    }
    
    const typeNames = {
      'Seca': 'seca',
      'Incendio': 'incêndio',
      'Chuva_Intensa': 'chuvas intensas',
      'Onda_Calor': 'onda de calor',
      'Geada': 'geada'
    };
    
    const typesText = types.map(t => typeNames[t] || t).join(', ');
    
    return {
      status: alertLevel === 'Verde' ? 'Normal' : alertLevel === 'Amarelo' ? 'Atenção' : 'Alerta',
      message: `${predictions.length} evento(s) previsto(s): ${typesText}. ${highRisk.length} de alto risco.`,
      alert_level: alertLevel,
      total_events: predictions.length,
      high_risk_events: highRisk.length,
      event_types: types,
      most_urgent: predictions[0] ? {
        type: predictions[0].tipo,
        probability: predictions[0].probabilidade,
        days_ahead: predictions[0].dias_antecedencia
      } : null
    };
  },

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, alerts: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const alerts = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const status = row[headers.indexOf('Status_Alerta')];
        
        if (status === 'Emitido' || status === 'Ativo') {
          alerts.push({
            id: row[headers.indexOf('ID_Evento')],
            tipo: row[headers.indexOf('Tipo_Evento')],
            data_predicao: row[headers.indexOf('Data_Predicao')],
            data_evento: row[headers.indexOf('Data_Evento_Prevista')],
            dias_antecedencia: row[headers.indexOf('Dias_Antecedencia')],
            probabilidade: row[headers.indexOf('Probabilidade')],
            severidade: row[headers.indexOf('Severidade')],
            status: status,
            zonas_risco: this._safeParseJSON(row[headers.indexOf('Zonas_Risco_JSON')]),
            especies_vulneraveis: this._safeParseJSON(row[headers.indexOf('Especies_Vulneraveis_JSON')]),
            plano_resposta: this._safeParseJSON(row[headers.indexOf('Plano_Resposta_JSON')]),
            custo_resposta: row[headers.indexOf('Custo_Resposta_BRL')]
          });
        }
      }
      
      // Ordena por severidade e probabilidade
      const severityOrder = { 'Extrema': 4, 'Alta': 3, 'Moderada': 2, 'Baixa': 1 };
      alerts.sort((a, b) => {
        const sevDiff = (severityOrder[b.severidade] || 0) - (severityOrder[a.severidade] || 0);
        if (sevDiff !== 0) return sevDiff;
        return b.probabilidade - a.probabilidade;
      });
      
      return {
        success: true,
        alerts: alerts,
        count: alerts.length,
        by_severity: {
          extrema: alerts.filter(a => a.severidade === 'Extrema').length,
          alta: alerts.filter(a => a.severidade === 'Alta').length,
          moderada: alerts.filter(a => a.severidade === 'Moderada').length,
          baixa: alerts.filter(a => a.severidade === 'Baixa').length
        }
      };
      
    } catch (error) {
      Logger.log(`[getActiveAlerts] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status de alerta
   */
  updateAlertStatus: function(eventId, newStatus, danos = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idIndex = headers.indexOf('ID_Evento');
      const statusIndex = headers.indexOf('Status_Alerta');
      const confirmadoIndex = headers.indexOf('Evento_Confirmado');
      const danosIndex = headers.indexOf('Danos_Reais');
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === eventId) {
          sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
          
          if (newStatus === 'Encerrado') {
            sheet.getRange(i + 1, confirmadoIndex + 1).setValue(true);
          } else if (newStatus === 'Falso_Positivo') {
            sheet.getRange(i + 1, confirmadoIndex + 1).setValue(false);
          }
          
          if (danos) {
            sheet.getRange(i + 1, danosIndex + 1).setValue(danos);
          }
          
          return {
            success: true,
            event_id: eventId,
            new_status: newStatus,
            message: `Status atualizado para ${newStatus}`
          };
        }
      }
      
      return { success: false, error: 'Evento não encontrado' };
      
    } catch (error) {
      Logger.log(`[updateAlertStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas de eventos
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          success: true,
          total_events: 0,
          message: 'Nenhum evento registrado'
        };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const events = [];
      for (let i = 1; i < data.length; i++) {
        events.push({
          tipo: data[i][headers.indexOf('Tipo_Evento')],
          severidade: data[i][headers.indexOf('Severidade')],
          status: data[i][headers.indexOf('Status_Alerta')],
          confirmado: data[i][headers.indexOf('Evento_Confirmado')],
          probabilidade: data[i][headers.indexOf('Probabilidade')],
          custo: data[i][headers.indexOf('Custo_Resposta_BRL')]
        });
      }
      
      // Estatísticas por tipo
      const byType = {};
      const types = ['Seca', 'Incendio', 'Chuva_Intensa', 'Onda_Calor', 'Geada'];
      types.forEach(t => {
        const typeEvents = events.filter(e => e.tipo === t);
        byType[t] = {
          total: typeEvents.length,
          confirmados: typeEvents.filter(e => e.confirmado).length,
          falsos_positivos: typeEvents.filter(e => e.status === 'Falso_Positivo').length,
          ativos: typeEvents.filter(e => e.status === 'Emitido' || e.status === 'Ativo').length
        };
      });
      
      // Estatísticas por severidade
      const bySeverity = {
        Extrema: events.filter(e => e.severidade === 'Extrema').length,
        Alta: events.filter(e => e.severidade === 'Alta').length,
        Moderada: events.filter(e => e.severidade === 'Moderada').length,
        Baixa: events.filter(e => e.severidade === 'Baixa').length
      };
      
      // Acurácia do modelo
      const confirmed = events.filter(e => e.confirmado === true).length;
      const falsePositives = events.filter(e => e.status === 'Falso_Positivo').length;
      const resolved = confirmed + falsePositives;
      const accuracy = resolved > 0 ? (confirmed / resolved) : null;
      
      // Custo total
      const totalCost = events.reduce((sum, e) => sum + (e.custo || 0), 0);
      
      return {
        success: true,
        total_events: events.length,
        active_alerts: events.filter(e => e.status === 'Emitido' || e.status === 'Ativo').length,
        by_type: byType,
        by_severity: bySeverity,
        model_performance: {
          confirmed_events: confirmed,
          false_positives: falsePositives,
          accuracy: accuracy ? parseFloat((accuracy * 100).toFixed(1)) : null,
          accuracy_label: accuracy ? `${(accuracy * 100).toFixed(1)}%` : 'Dados insuficientes'
        },
        financial: {
          total_response_cost: totalCost,
          average_cost: events.length > 0 ? Math.round(totalCost / events.length) : 0
        }
      };
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista eventos com filtros
   */
  listEvents: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, events: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      let events = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        events.push({
          id: row[headers.indexOf('ID_Evento')],
          tipo: row[headers.indexOf('Tipo_Evento')],
          data_predicao: row[headers.indexOf('Data_Predicao')],
          data_evento: row[headers.indexOf('Data_Evento_Prevista')],
          dias_antecedencia: row[headers.indexOf('Dias_Antecedencia')],
          probabilidade: row[headers.indexOf('Probabilidade')],
          severidade: row[headers.indexOf('Severidade')],
          confianca: row[headers.indexOf('Confianca_Modelo')],
          duracao: row[headers.indexOf('Duracao_Prevista_dias')],
          area_afetada: row[headers.indexOf('Area_Afetada_ha')],
          status: row[headers.indexOf('Status_Alerta')],
          confirmado: row[headers.indexOf('Evento_Confirmado')],
          custo: row[headers.indexOf('Custo_Resposta_BRL')]
        });
      }
      
      // Aplica filtros
      if (filtros.tipo) {
        events = events.filter(e => e.tipo === filtros.tipo);
      }
      if (filtros.severidade) {
        events = events.filter(e => e.severidade === filtros.severidade);
      }
      if (filtros.status) {
        events = events.filter(e => e.status === filtros.status);
      }
      if (filtros.limite) {
        events = events.slice(0, filtros.limite);
      }
      
      return {
        success: true,
        events: events,
        count: events.length,
        filters_applied: filtros
      };
      
    } catch (error) {
      Logger.log(`[listEvents] Erro: ${error}`);
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
// API FUNCTIONS - Eventos Extremos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de eventos extremos
 */
function apiEventosExtremosInit() {
  return ExtremeEventsPredictor.initializeSheet();
}

/**
 * Gera predições de eventos extremos
 * @param {number} days - Dias para previsão (padrão: 30)
 */
function apiEventosExtremosPredict(days) {
  return ExtremeEventsPredictor.predictExtremeEvents(days || 30);
}

/**
 * Lista eventos com filtros
 * @param {object} filtros - {tipo, severidade, status, limite}
 */
function apiEventosExtremosLista(filtros) {
  return ExtremeEventsPredictor.listEvents(filtros || {});
}

/**
 * Obtém alertas ativos
 */
function apiEventosExtremosAlertasAtivos() {
  return ExtremeEventsPredictor.getActiveAlerts();
}

/**
 * Atualiza status de alerta
 * @param {string} id - ID do evento
 * @param {string} status - Novo status
 * @param {string} danos - Descrição de danos (opcional)
 */
function apiEventosExtremosAtualizarStatus(id, status, danos) {
  return ExtremeEventsPredictor.updateAlertStatus(id, status, danos);
}

/**
 * Obtém estatísticas de eventos
 */
function apiEventosExtremosEstatisticas() {
  return ExtremeEventsPredictor.getStatistics();
}

/**
 * Gera plano de resposta para evento
 * @param {string} eventId - ID do evento
 */
function apiEventosExtremosPlanoResposta(eventId) {
  return ExtremeEventsPredictor.generateResponsePlan(eventId);
}
