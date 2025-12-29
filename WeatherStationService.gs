/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ESTAÇÃO METEOROLÓGICA AUTOMATIZADA
 * ═══════════════════════════════════════════════════════════════════════════
 * P20 - Estação Meteorológica com Previsão Local e Integração Total
 * 
 * Funcionalidades:
 * - 10+ sensores meteorológicos em tempo real
 * - Cálculo de índices derivados (sensação térmica, ponto de orvalho, ET0)
 * - Previsão local de 6 horas
 * - Alertas meteorológicos (geada, tempestade, calor extremo)
 * - Integração com P11, P12, P13, P18, P19
 * - Histórico completo
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha ESTACAO_METEOROLOGICA_RA
 */
const SCHEMA_METEOROLOGIA = {
  ID_Leitura: { type: 'string', required: true, unique: true },
  Timestamp: { type: 'datetime', required: true },
  Temperatura_C: { type: 'float' },
  Temperatura_Min_24h: { type: 'float' },
  Temperatura_Max_24h: { type: 'float' },
  Umidade_Relativa_percent: { type: 'float', range: [0, 100] },
  Ponto_Orvalho_C: { type: 'float' },
  Sensacao_Termica_C: { type: 'float' },
  Pressao_Atmosferica_hPa: { type: 'float' },
  Pressao_Nivel_Mar_hPa: { type: 'float' },
  Tendencia_Pressao: { type: 'enum', values: ['Subindo', 'Estavel', 'Caindo'] },
  Velocidade_Vento_ms: { type: 'float', min: 0 },
  Direcao_Vento_graus: { type: 'integer', range: [0, 360] },
  Rajada_Maxima_ms: { type: 'float' },
  Chuva_Atual_mmh: { type: 'float', min: 0 },
  Chuva_Acumulada_24h_mm: { type: 'float', min: 0 },
  Chuva_Acumulada_Mes_mm: { type: 'float', min: 0 },
  Radiacao_Solar_Wm2: { type: 'float', min: 0 },
  Indice_UV: { type: 'float', range: [0, 15] },
  Luminosidade_lux: { type: 'integer', min: 0 },
  Evapotranspiracao_mm: { type: 'float' },
  Risco_Geada: { type: 'boolean' },
  Risco_Tempestade: { type: 'boolean' },
  Risco_Calor_Extremo: { type: 'boolean' },
  Previsao_Chuva_percent: { type: 'integer', range: [0, 100] },
  Previsao_Temperatura_C: { type: 'float' },
  Alertas_JSON: { type: 'text' }
};

const METEOROLOGIA_HEADERS = [
  'ID_Leitura', 'Timestamp', 'Temperatura_C', 'Temperatura_Min_24h', 'Temperatura_Max_24h',
  'Umidade_Relativa_percent', 'Ponto_Orvalho_C', 'Sensacao_Termica_C',
  'Pressao_Atmosferica_hPa', 'Pressao_Nivel_Mar_hPa', 'Tendencia_Pressao',
  'Velocidade_Vento_ms', 'Direcao_Vento_graus', 'Rajada_Maxima_ms',
  'Chuva_Atual_mmh', 'Chuva_Acumulada_24h_mm', 'Chuva_Acumulada_Mes_mm',
  'Radiacao_Solar_Wm2', 'Indice_UV', 'Luminosidade_lux',
  'Evapotranspiracao_mm', 'Risco_Geada', 'Risco_Tempestade', 'Risco_Calor_Extremo',
  'Previsao_Chuva_percent', 'Previsao_Temperatura_C', 'Alertas_JSON'
];


/**
 * Sistema de Estação Meteorológica
 * @namespace WeatherStation
 */
const WeatherStation = {
  
  SHEET_NAME: 'ESTACAO_METEOROLOGICA_RA',
  
  /**
   * Direções do vento
   */
  WIND_DIRECTIONS: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                    'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
  
  /**
   * Limites de alerta
   */
  ALERT_THRESHOLDS: {
    GEADA_TEMP: 3,
    CALOR_EXTREMO: 38,
    VENTO_FORTE: 15, // m/s
    RAJADA_PERIGOSA: 25, // m/s
    CHUVA_INTENSA: 20, // mm/h
    UV_ALTO: 8,
    UV_EXTREMO: 11,
    PRESSAO_BAIXA: 1000 // hPa
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
        sheet.appendRow(METEOROLOGIA_HEADERS);
        const headerRange = sheet.getRange(1, 1, 1, METEOROLOGIA_HEADERS.length);
        headerRange.setBackground('#1976D2');
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
   * Processa leitura da estação meteorológica
   * @param {object} data - Dados dos sensores
   */
  processReading: function(data) {
    try {
      this.initializeSheet();
      
      // 1. Valida dados
      const validation = this._validateReading(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. Calcula índices derivados
      const indices = this._calculateIndices(data);
      
      // 3. Determina tendência de pressão
      const pressaoTendencia = this._calculatePressureTrend(data.pressao);
      
      // 4. Gera previsão local (6h)
      const forecast = this._generateLocalForecast(data, indices, pressaoTendencia);
      
      // 5. Verifica alertas meteorológicos
      const alerts = this._checkWeatherAlerts(data, indices, forecast);
      
      // 6. Prepara registro completo
      const reading = {
        id: `WS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        ...data,
        ...indices,
        tendencia_pressao: pressaoTendencia,
        forecast: forecast,
        alerts: alerts
      };
      
      // 7. Salva leitura
      this._saveReading(reading);
      
      return {
        success: true,
        reading_id: reading.id,
        current: {
          temperatura: data.temperatura,
          umidade: data.umidade,
          pressao: data.pressao,
          vento: data.vento_velocidade,
          chuva_24h: data.chuva_24h
        },
        indices: indices,
        forecast: forecast,
        alerts: alerts,
        has_alerts: alerts.length > 0
      };
      
    } catch (error) {
      Logger.log(`[processReading] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Valida dados da leitura
   * @private
   */
  _validateReading: function(data) {
    if (data.temperatura === undefined) {
      return { valid: false, error: 'Temperatura é obrigatória' };
    }
    
    if (data.temperatura < -50 || data.temperatura > 60) {
      return { valid: false, error: 'Temperatura fora do range válido (-50 a 60°C)' };
    }
    
    return { valid: true };
  },

  /**
   * Calcula índices derivados
   * @private
   */
  _calculateIndices: function(data) {
    const temp = data.temperatura;
    const umidade = data.umidade || 50;
    const vento = data.vento_velocidade || 0;
    const radiacao = data.radiacao_solar || 0;
    
    return {
      sensacao_termica: this._calculateWindChill(temp, vento, umidade),
      ponto_orvalho: this._calculateDewPoint(temp, umidade),
      evapotranspiracao: this._calculateET0(temp, umidade, vento, radiacao),
      risco_geada: temp < this.ALERT_THRESHOLDS.GEADA_TEMP && umidade > 80,
      risco_tempestade: (data.pressao || 1013) < this.ALERT_THRESHOLDS.PRESSAO_BAIXA && vento > 10,
      risco_calor_extremo: temp > this.ALERT_THRESHOLDS.CALOR_EXTREMO
    };
  },

  /**
   * Calcula sensação térmica (Wind Chill / Heat Index)
   * @private
   */
  _calculateWindChill: function(temp, vento, umidade) {
    // Se temperatura alta, usa Heat Index
    if (temp > 27) {
      // Fórmula simplificada do Heat Index
      const hi = temp + 0.5 * (6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.16 + temp))) * umidade/100 - 10);
      return Math.round(hi * 10) / 10;
    }
    
    // Se temperatura baixa e vento, usa Wind Chill
    if (temp < 10 && vento > 1.3) {
      const ventoKmh = vento * 3.6;
      const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(ventoKmh, 0.16) + 0.3965 * temp * Math.pow(ventoKmh, 0.16);
      return Math.round(wc * 10) / 10;
    }
    
    return temp;
  },

  /**
   * Calcula ponto de orvalho
   * @private
   */
  _calculateDewPoint: function(temp, umidade) {
    // Fórmula de Magnus-Tetens
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(umidade / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
  },

  /**
   * Calcula evapotranspiração de referência (ET0) - Penman-Monteith simplificado
   * @private
   */
  _calculateET0: function(temp, umidade, vento, radiacao) {
    // Fórmula simplificada de Hargreaves
    const ra = radiacao / 1000 || 15; // MJ/m²/dia
    const tmax = temp + 5;
    const tmin = temp - 5;
    const tmean = temp;
    
    const et0 = 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * ra;
    return Math.round(et0 * 10) / 10;
  },

  /**
   * Calcula tendência de pressão
   * @private
   */
  _calculatePressureTrend: function(currentPressure) {
    try {
      const readings = this._getRecentReadings(6); // últimas 6 horas
      if (readings.length < 2) return 'Estavel';
      
      const oldPressure = readings[readings.length - 1].pressao || currentPressure;
      const diff = currentPressure - oldPressure;
      
      if (diff > 2) return 'Subindo';
      if (diff < -2) return 'Caindo';
      return 'Estavel';
    } catch (e) {
      return 'Estavel';
    }
  },

  /**
   * Gera previsão local de 6 horas
   * @private
   */
  _generateLocalForecast: function(data, indices, tendenciaPressao) {
    const temp = data.temperatura;
    const umidade = data.umidade || 50;
    const pressao = data.pressao || 1013;
    const chuvaAtual = data.chuva_atual || 0;
    
    // Probabilidade de chuva baseada em indicadores
    let probChuva = 0;
    
    if (tendenciaPressao === 'Caindo') probChuva += 30;
    if (pressao < 1005) probChuva += 20;
    if (umidade > 80) probChuva += 25;
    if (indices.ponto_orvalho > temp - 3) probChuva += 15;
    if (chuvaAtual > 0) probChuva += 20;
    
    probChuva = Math.min(probChuva, 95);
    
    // Previsão de temperatura (tendência)
    let tempPrevista = temp;
    const hora = new Date().getHours();
    
    if (hora < 12) {
      tempPrevista = temp + 3; // Manhã: esquenta
    } else if (hora < 18) {
      tempPrevista = temp - 1; // Tarde: estabiliza
    } else {
      tempPrevista = temp - 4; // Noite: esfria
    }
    
    // Condição prevista
    let condicao = 'Ensolarado';
    if (probChuva > 70) condicao = 'Chuvoso';
    else if (probChuva > 40) condicao = 'Nublado';
    else if (probChuva > 20) condicao = 'Parcialmente Nublado';
    
    return {
      probabilidade_chuva: probChuva,
      temperatura_prevista: Math.round(tempPrevista * 10) / 10,
      condicao: condicao,
      chuva_intensa_prevista: probChuva > 60 && tendenciaPressao === 'Caindo',
      validade_horas: 6,
      confianca: probChuva > 70 || probChuva < 30 ? 'Alta' : 'Media'
    };
  },


  /**
   * Verifica alertas meteorológicos
   * @private
   */
  _checkWeatherAlerts: function(data, indices, forecast) {
    const alerts = [];
    const th = this.ALERT_THRESHOLDS;
    
    // Alerta de geada
    if (indices.risco_geada) {
      alerts.push({
        type: 'Geada',
        severity: data.temperatura < 0 ? 'Critico' : 'Alto',
        value: data.temperatura,
        message: `Risco de geada: ${data.temperatura}°C`,
        action: 'Proteger plantas sensíveis e mudas',
        icon: '❄️'
      });
    }
    
    // Alerta de calor extremo
    if (indices.risco_calor_extremo) {
      alerts.push({
        type: 'Calor_Extremo',
        severity: data.temperatura > 42 ? 'Critico' : 'Alto',
        value: data.temperatura,
        message: `Calor extremo: ${data.temperatura}°C`,
        action: 'Evitar exposição solar, hidratar frequentemente',
        icon: '🔥'
      });
    }
    
    // Alerta de vento forte
    if (data.vento_velocidade > th.VENTO_FORTE) {
      alerts.push({
        type: 'Vento_Forte',
        severity: data.vento_velocidade > th.RAJADA_PERIGOSA ? 'Critico' : 'Alto',
        value: data.vento_velocidade,
        message: `Vento forte: ${data.vento_velocidade} m/s`,
        action: 'Proteger estruturas e evitar áreas abertas',
        icon: '💨'
      });
    }
    
    // Alerta de chuva intensa
    if (data.chuva_atual > th.CHUVA_INTENSA) {
      alerts.push({
        type: 'Chuva_Intensa',
        severity: data.chuva_atual > 40 ? 'Critico' : 'Alto',
        value: data.chuva_atual,
        message: `Chuva intensa: ${data.chuva_atual} mm/h`,
        action: 'Risco de alagamento, evitar áreas baixas',
        icon: '🌧️'
      });
    }
    
    // Alerta de UV
    if (data.indice_uv > th.UV_ALTO) {
      alerts.push({
        type: 'UV_Alto',
        severity: data.indice_uv > th.UV_EXTREMO ? 'Critico' : 'Alto',
        value: data.indice_uv,
        message: `Índice UV ${data.indice_uv > th.UV_EXTREMO ? 'extremo' : 'alto'}: ${data.indice_uv}`,
        action: 'Usar proteção solar, evitar exposição 10h-16h',
        icon: '☀️'
      });
    }
    
    // Alerta de tempestade prevista
    if (forecast.chuva_intensa_prevista) {
      alerts.push({
        type: 'Tempestade_Prevista',
        severity: 'Alto',
        value: forecast.probabilidade_chuva,
        message: `Tempestade prevista nas próximas 6h (${forecast.probabilidade_chuva}% chance)`,
        action: 'Preparar-se para chuva forte e ventos',
        icon: '⛈️'
      });
    }
    
    // Alerta de pressão baixa
    if (data.pressao && data.pressao < th.PRESSAO_BAIXA) {
      alerts.push({
        type: 'Pressao_Baixa',
        severity: 'Medio',
        value: data.pressao,
        message: `Pressão atmosférica baixa: ${data.pressao} hPa`,
        action: 'Possível mudança de tempo nas próximas horas',
        icon: '📉'
      });
    }
    
    return alerts;
  },

  /**
   * Salva leitura na planilha
   * @private
   */
  _saveReading: function(reading) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const row = [
        reading.id,
        reading.timestamp,
        reading.temperatura,
        reading.temp_min_24h || '',
        reading.temp_max_24h || '',
        reading.umidade || '',
        reading.ponto_orvalho,
        reading.sensacao_termica,
        reading.pressao || '',
        reading.pressao_nivel_mar || '',
        reading.tendencia_pressao,
        reading.vento_velocidade || '',
        reading.vento_direcao || '',
        reading.rajada_maxima || '',
        reading.chuva_atual || 0,
        reading.chuva_24h || 0,
        reading.chuva_mes || 0,
        reading.radiacao_solar || '',
        reading.indice_uv || '',
        reading.luminosidade || '',
        reading.evapotranspiracao,
        reading.risco_geada,
        reading.risco_tempestade,
        reading.risco_calor_extremo,
        reading.forecast.probabilidade_chuva,
        reading.forecast.temperatura_prevista,
        JSON.stringify(reading.alerts)
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (error) {
      Logger.log(`[_saveReading] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Obtém leituras recentes
   * @private
   */
  _getRecentReadings: function(hours = 24) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) return [];
      
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      const data = sheet.getDataRange().getValues();
      const readings = [];
      
      for (let i = data.length - 1; i >= 1; i--) {
        const timestamp = new Date(data[i][1]).getTime();
        if (timestamp < cutoffTime) break;
        
        readings.push({
          timestamp: data[i][1],
          temperatura: data[i][2],
          umidade: data[i][5],
          pressao: data[i][8],
          vento: data[i][11],
          chuva: data[i][14]
        });
      }
      
      return readings;
    } catch (error) {
      return [];
    }
  },

  /**
   * Obtém condições atuais
   */
  getCurrentConditions: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Sem dados disponíveis' };
      }
      
      const lastRow = sheet.getLastRow();
      const data = sheet.getRange(lastRow, 1, 1, METEOROLOGIA_HEADERS.length).getValues()[0];
      
      return {
        success: true,
        timestamp: data[1],
        temperatura: {
          atual: data[2],
          min_24h: data[3],
          max_24h: data[4],
          sensacao: data[7]
        },
        umidade: data[5],
        ponto_orvalho: data[6],
        pressao: {
          atual: data[8],
          nivel_mar: data[9],
          tendencia: data[10]
        },
        vento: {
          velocidade: data[11],
          direcao_graus: data[12],
          direcao_texto: this._getWindDirectionText(data[12]),
          rajada_maxima: data[13]
        },
        chuva: {
          atual_mmh: data[14],
          acumulada_24h: data[15],
          acumulada_mes: data[16]
        },
        radiacao: {
          solar: data[17],
          uv: data[18],
          luminosidade: data[19]
        },
        indices: {
          evapotranspiracao: data[20],
          risco_geada: data[21],
          risco_tempestade: data[22],
          risco_calor: data[23]
        },
        previsao: {
          chuva_percent: data[24],
          temperatura: data[25]
        },
        alerts: this._safeParseJSON(data[26]) || []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Converte graus para direção do vento
   * @private
   */
  _getWindDirectionText: function(degrees) {
    if (degrees === undefined || degrees === null) return 'N/A';
    const index = Math.round(degrees / 22.5) % 16;
    return this.WIND_DIRECTIONS[index];
  },

  /**
   * Obtém histórico de leituras
   */
  getHistory: function(days = 7) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, readings: [], count: 0 };
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const data = sheet.getDataRange().getValues();
      const readings = [];
      
      for (let i = 1; i < data.length; i++) {
        const timestamp = new Date(data[i][1]);
        if (timestamp < cutoffDate) continue;
        
        readings.push({
          timestamp: data[i][1],
          temperatura: data[i][2],
          umidade: data[i][5],
          pressao: data[i][8],
          vento: data[i][11],
          chuva_24h: data[i][15],
          uv: data[i][18]
        });
      }
      
      return { success: true, readings: readings, count: readings.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Análise estatística do período
   */
  analyzeStats: function(days = 30) {
    try {
      const history = this.getHistory(days);
      if (!history.success || history.readings.length === 0) {
        return { success: false, error: 'Dados insuficientes' };
      }
      
      const readings = history.readings;
      const temps = readings.map(r => r.temperatura).filter(t => t !== null && t !== '');
      const umidades = readings.map(r => r.umidade).filter(u => u !== null && u !== '');
      const chuvas = readings.map(r => r.chuva_24h).filter(c => c !== null && c !== '');
      
      // Agrupa por dia
      const dailyData = this._aggregateByDay(readings);
      
      return {
        success: true,
        period_days: days,
        total_readings: readings.length,
        temperatura: {
          media: this._average(temps),
          min: Math.min(...temps),
          max: Math.max(...temps),
          amplitude: Math.max(...temps) - Math.min(...temps)
        },
        umidade: {
          media: this._average(umidades),
          min: Math.min(...umidades),
          max: Math.max(...umidades)
        },
        chuva: {
          total_periodo: chuvas.reduce((a, b) => a + b, 0),
          dias_com_chuva: dailyData.filter(d => d.chuva > 0).length,
          max_24h: Math.max(...chuvas)
        },
        daily_data: dailyData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Agrega dados por dia
   * @private
   */
  _aggregateByDay: function(readings) {
    const byDay = {};
    
    readings.forEach(r => {
      const day = new Date(r.timestamp).toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { temps: [], umidades: [], chuva: 0 };
      }
      if (r.temperatura) byDay[day].temps.push(r.temperatura);
      if (r.umidade) byDay[day].umidades.push(r.umidade);
      if (r.chuva_24h) byDay[day].chuva = Math.max(byDay[day].chuva, r.chuva_24h);
    });
    
    return Object.entries(byDay).map(([day, values]) => ({
      date: day,
      temp_media: this._average(values.temps),
      temp_min: values.temps.length > 0 ? Math.min(...values.temps) : null,
      temp_max: values.temps.length > 0 ? Math.max(...values.temps) : null,
      umidade_media: this._average(values.umidades),
      chuva: values.chuva
    })).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Calcula média
   * @private
   */
  _average: function(values) {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
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
  },

  /**
   * Simula leituras para demonstração
   */
  simulateReadings: function(count = 24) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const hour = (new Date(Date.now() - i * 3600000)).getHours();
      const isDaytime = hour >= 6 && hour <= 18;
      
      const reading = {
        temperatura: 22 + Math.random() * 10 + (isDaytime ? 5 : -3),
        umidade: 50 + Math.random() * 30 + (isDaytime ? -10 : 10),
        pressao: 1010 + Math.random() * 10 - 5,
        vento_velocidade: 2 + Math.random() * 8,
        vento_direcao: Math.floor(Math.random() * 360),
        rajada_maxima: 5 + Math.random() * 15,
        chuva_atual: Math.random() > 0.8 ? Math.random() * 10 : 0,
        chuva_24h: Math.random() * 20,
        chuva_mes: 50 + Math.random() * 100,
        radiacao_solar: isDaytime ? 400 + Math.random() * 600 : 0,
        indice_uv: isDaytime ? 3 + Math.random() * 8 : 0,
        luminosidade: isDaytime ? 30000 + Math.random() * 70000 : 100
      };
      
      const result = this.processReading(reading);
      results.push(result);
    }
    
    return {
      success: true,
      simulated_count: count,
      results: results.slice(0, 3)
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Estação Meteorológica
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa estação meteorológica
 */
function apiMeteoInit() {
  return WeatherStation.initializeSheet();
}

/**
 * Processa leitura da estação
 * @param {object} data - Dados dos sensores
 */
function apiMeteoProcessar(data) {
  return WeatherStation.processReading(data);
}

/**
 * Obtém condições atuais
 */
function apiMeteoAtual() {
  return WeatherStation.getCurrentConditions();
}

/**
 * Obtém histórico de leituras
 * @param {number} days - Dias de histórico
 */
function apiMeteoHistorico(days) {
  return WeatherStation.getHistory(days || 7);
}

/**
 * Análise estatística do período
 * @param {number} days - Dias para análise
 */
function apiMeteoEstatisticas(days) {
  return WeatherStation.analyzeStats(days || 30);
}

/**
 * Simula leituras para demonstração
 * @param {number} count - Quantidade de leituras
 */
function apiMeteoSimular(count) {
  return WeatherStation.simulateReadings(count || 24);
}
