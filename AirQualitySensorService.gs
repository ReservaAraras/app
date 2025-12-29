/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE SENSORES IoT DE QUALIDADE DO AR
 * ═══════════════════════════════════════════════════════════════════════════
 * P18 - Integração com Sensores IoT para Monitoramento Ambiental
 * 
 * Funcionalidades:
 * - Processamento de leituras de sensores IoT
 * - Cálculo de IQA (Índice de Qualidade do Ar) padrão EPA/CONAMA
 * - Sistema de alertas automáticos
 * - Análise de tendências temporais
 * - Detecção de impactos de queimadas
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha SENSORES_QUALIDADE_AR_RA
 */
const SCHEMA_QUALIDADE_AR = {
  ID_Leitura: { type: 'string', required: true, unique: true },
  ID_Sensor: { type: 'string', required: true },
  Timestamp: { type: 'datetime', required: true },
  Latitude: { type: 'float', range: [-90, 90] },
  Longitude: { type: 'float', range: [-180, 180] },
  Nome_Local: { type: 'string' },
  PM25_ugm3: { type: 'float', min: 0 },
  PM10_ugm3: { type: 'float', min: 0 },
  CO2_ppm: { type: 'integer', min: 0 },
  Temperatura_C: { type: 'float' },
  Umidade_percent: { type: 'float', range: [0, 100] },
  Pressao_hPa: { type: 'float' },
  IQA_Score: { type: 'integer', range: [0, 500] },
  IQA_Categoria: { type: 'enum', values: ['Boa', 'Moderada', 'Ruim', 'Muito_Ruim', 'Pessima'] },
  PM25_AQI: { type: 'integer' },
  PM10_AQI: { type: 'integer' },
  Alerta_PM25: { type: 'boolean' },
  Alerta_PM10: { type: 'boolean' },
  Alerta_CO2: { type: 'boolean' },
  Alerta_Temperatura: { type: 'boolean' },
  Alertas_JSON: { type: 'text' },
  Bateria_percent: { type: 'integer', range: [0, 100] },
  Sinal_RSSI: { type: 'integer' },
  Status_Sensor: { type: 'enum', values: ['Online', 'Offline', 'Manutencao'] }
};

const QUALIDADE_AR_HEADERS = [
  'ID_Leitura', 'ID_Sensor', 'Timestamp', 'Latitude', 'Longitude', 'Nome_Local',
  'PM25_ugm3', 'PM10_ugm3', 'CO2_ppm', 'Temperatura_C', 'Umidade_percent', 'Pressao_hPa',
  'IQA_Score', 'IQA_Categoria', 'PM25_AQI', 'PM10_AQI',
  'Alerta_PM25', 'Alerta_PM10', 'Alerta_CO2', 'Alerta_Temperatura', 'Alertas_JSON',
  'Bateria_percent', 'Sinal_RSSI', 'Status_Sensor'
];

/**
 * Schema para cadastro de sensores
 */
const SENSORES_HEADERS = [
  'ID_Sensor', 'Nome', 'Tipo', 'Latitude', 'Longitude', 'Local_Instalacao',
  'Data_Instalacao', 'Ultima_Leitura', 'Status', 'Bateria_percent', 'Firmware'
];


/**
 * Sistema de Qualidade do Ar com Sensores IoT
 * @namespace AirQualitySensor
 */
const AirQualitySensor = {
  
  SHEET_LEITURAS: 'SENSORES_QUALIDADE_AR_RA',
  SHEET_SENSORES: 'CADASTRO_SENSORES_RA',
  
  /**
   * Breakpoints EPA para PM2.5 (μg/m³)
   */
  PM25_BREAKPOINTS: [
    { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500, aqiLow: 301, aqiHigh: 500 }
  ],
  
  /**
   * Breakpoints EPA para PM10 (μg/m³)
   */
  PM10_BREAKPOINTS: [
    { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
    { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
    { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
    { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
    { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
    { low: 425, high: 604, aqiLow: 301, aqiHigh: 500 }
  ],
  
  /**
   * Limites de alerta
   */
  ALERT_THRESHOLDS: {
    PM25_MODERADO: 35,
    PM25_CRITICO: 55,
    PM10_MODERADO: 150,
    PM10_CRITICO: 250,
    CO2_MODERADO: 1000,
    CO2_CRITICO: 2000,
    TEMP_MIN: 5,
    TEMP_MAX: 40
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de leituras
      let sheetLeituras = ss.getSheetByName(this.SHEET_LEITURAS);
      if (!sheetLeituras) {
        sheetLeituras = ss.insertSheet(this.SHEET_LEITURAS);
        sheetLeituras.appendRow(QUALIDADE_AR_HEADERS);
        const headerRange = sheetLeituras.getRange(1, 1, 1, QUALIDADE_AR_HEADERS.length);
        headerRange.setBackground('#1565C0');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetLeituras.setFrozenRows(1);
      }
      
      // Planilha de sensores
      let sheetSensores = ss.getSheetByName(this.SHEET_SENSORES);
      if (!sheetSensores) {
        sheetSensores = ss.insertSheet(this.SHEET_SENSORES);
        sheetSensores.appendRow(SENSORES_HEADERS);
        const headerRange = sheetSensores.getRange(1, 1, 1, SENSORES_HEADERS.length);
        headerRange.setBackground('#0D47A1');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetSensores.setFrozenRows(1);
      }
      
      return { success: true, sheets: [this.SHEET_LEITURAS, this.SHEET_SENSORES] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Processa leitura de sensor
   * @param {object} sensorData - Dados do sensor
   */
  processReading: function(sensorData) {
    try {
      // 1. Valida dados
      const validation = this._validateReading(sensorData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. Calcula IQA
      const iqa = this._calculateAQI(sensorData);
      
      // 3. Verifica alertas
      const alerts = this._checkAlerts(sensorData, iqa);
      
      // 4. Prepara registro completo
      const reading = {
        id: `LT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        ...sensorData,
        ...iqa,
        alerts: alerts
      };
      
      // 5. Salva no banco
      this._saveReading(reading);
      
      // 6. Atualiza status do sensor
      this._updateSensorStatus(sensorData.sensor_id, 'Online');
      
      return {
        success: true,
        reading_id: reading.id,
        iqa: iqa,
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
    if (!data.sensor_id) {
      return { valid: false, error: 'ID do sensor é obrigatório' };
    }
    
    if (data.pm25 === undefined && data.pm10 === undefined) {
      return { valid: false, error: 'Pelo menos PM2.5 ou PM10 deve ser informado' };
    }
    
    if (data.pm25 !== undefined && (data.pm25 < 0 || data.pm25 > 1000)) {
      return { valid: false, error: 'PM2.5 fora do range válido (0-1000)' };
    }
    
    if (data.pm10 !== undefined && (data.pm10 < 0 || data.pm10 > 1000)) {
      return { valid: false, error: 'PM10 fora do range válido (0-1000)' };
    }
    
    return { valid: true };
  },

  /**
   * Calcula Índice de Qualidade do Ar (IQA)
   * @private
   */
  _calculateAQI: function(data) {
    const pm25_aqi = data.pm25 !== undefined ? this._calculatePM25_AQI(data.pm25) : 0;
    const pm10_aqi = data.pm10 !== undefined ? this._calculatePM10_AQI(data.pm10) : 0;
    
    // IQA é o maior dos índices
    const aqi = Math.max(pm25_aqi, pm10_aqi);
    
    return {
      iqa_score: aqi,
      iqa_categoria: this._classifyAQI(aqi),
      pm25_aqi: pm25_aqi,
      pm10_aqi: pm10_aqi,
      dominant_pollutant: pm25_aqi >= pm10_aqi ? 'PM2.5' : 'PM10'
    };
  },

  /**
   * Calcula IQA para PM2.5
   * @private
   */
  _calculatePM25_AQI: function(pm25) {
    for (const bp of this.PM25_BREAKPOINTS) {
      if (pm25 >= bp.low && pm25 <= bp.high) {
        return Math.round(
          ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * 
          (pm25 - bp.low) + bp.aqiLow
        );
      }
    }
    return 500; // Além da escala
  },

  /**
   * Calcula IQA para PM10
   * @private
   */
  _calculatePM10_AQI: function(pm10) {
    for (const bp of this.PM10_BREAKPOINTS) {
      if (pm10 >= bp.low && pm10 <= bp.high) {
        return Math.round(
          ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * 
          (pm10 - bp.low) + bp.aqiLow
        );
      }
    }
    return 500;
  },

  /**
   * Classifica IQA em categoria
   * @private
   */
  _classifyAQI: function(aqi) {
    if (aqi <= 50) return 'Boa';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Ruim';
    if (aqi <= 200) return 'Muito_Ruim';
    return 'Pessima';
  },

  /**
   * Verifica alertas
   * @private
   */
  _checkAlerts: function(data, iqa) {
    const alerts = [];
    const th = this.ALERT_THRESHOLDS;
    
    // Alerta PM2.5
    if (data.pm25 > th.PM25_MODERADO) {
      alerts.push({
        type: 'PM25_Alto',
        severity: data.pm25 > th.PM25_CRITICO ? 'Critico' : 'Alto',
        value: data.pm25,
        threshold: th.PM25_MODERADO,
        message: `PM2.5 em ${data.pm25.toFixed(1)} μg/m³ (limite: ${th.PM25_MODERADO})`,
        recommendation: data.pm25 > th.PM25_CRITICO 
          ? 'Suspender todas as atividades ao ar livre' 
          : 'Evitar atividades físicas intensas ao ar livre'
      });
    }
    
    // Alerta PM10
    if (data.pm10 > th.PM10_MODERADO) {
      alerts.push({
        type: 'PM10_Alto',
        severity: data.pm10 > th.PM10_CRITICO ? 'Critico' : 'Alto',
        value: data.pm10,
        threshold: th.PM10_MODERADO,
        message: `PM10 em ${data.pm10.toFixed(1)} μg/m³ (limite: ${th.PM10_MODERADO})`,
        recommendation: 'Pessoas sensíveis devem evitar exposição prolongada'
      });
    }
    
    // Alerta CO2
    if (data.co2 > th.CO2_MODERADO) {
      alerts.push({
        type: 'CO2_Alto',
        severity: data.co2 > th.CO2_CRITICO ? 'Critico' : 'Medio',
        value: data.co2,
        threshold: th.CO2_MODERADO,
        message: `CO2 em ${data.co2} ppm (limite: ${th.CO2_MODERADO})`,
        recommendation: 'Verificar ventilação do ambiente'
      });
    }
    
    // Alerta Temperatura
    if (data.temperatura !== undefined) {
      if (data.temperatura < th.TEMP_MIN || data.temperatura > th.TEMP_MAX) {
        alerts.push({
          type: 'Temperatura_Extrema',
          severity: 'Alto',
          value: data.temperatura,
          message: `Temperatura em ${data.temperatura.toFixed(1)}°C`,
          recommendation: data.temperatura > th.TEMP_MAX 
            ? 'Risco de estresse térmico - hidratação frequente' 
            : 'Risco de hipotermia - proteção térmica necessária'
        });
      }
    }
    
    // Alerta IQA geral
    if (iqa.iqa_score > 100) {
      alerts.push({
        type: 'IQA_Ruim',
        severity: iqa.iqa_score > 150 ? 'Critico' : 'Alto',
        value: iqa.iqa_score,
        message: `Qualidade do ar ${iqa.iqa_categoria} (IQA: ${iqa.iqa_score})`,
        recommendation: iqa.iqa_score > 150 
          ? 'Suspender atividades externas - possível impacto de queimadas'
          : 'Reduzir atividades ao ar livre'
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
      const sheet = ss.getSheetByName(this.SHEET_LEITURAS);
      
      const row = [
        reading.id,
        reading.sensor_id,
        reading.timestamp,
        reading.latitude || '',
        reading.longitude || '',
        reading.local || '',
        reading.pm25 || '',
        reading.pm10 || '',
        reading.co2 || '',
        reading.temperatura || '',
        reading.umidade || '',
        reading.pressao || '',
        reading.iqa_score,
        reading.iqa_categoria,
        reading.pm25_aqi,
        reading.pm10_aqi,
        reading.alerts.some(a => a.type === 'PM25_Alto'),
        reading.alerts.some(a => a.type === 'PM10_Alto'),
        reading.alerts.some(a => a.type === 'CO2_Alto'),
        reading.alerts.some(a => a.type === 'Temperatura_Extrema'),
        JSON.stringify(reading.alerts),
        reading.bateria || '',
        reading.rssi || '',
        'Online'
      ];
      
      sheet.appendRow(row);
      return true;
    } catch (error) {
      Logger.log(`[_saveReading] Erro: ${error}`);
      return false;
    }
  },

  /**
   * Atualiza status do sensor
   * @private
   */
  _updateSensorStatus: function(sensorId, status) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SENSORES);
      
      if (!sheet || sheet.getLastRow() < 2) return;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sensorId) {
          sheet.getRange(i + 1, 8).setValue(new Date().toISOString()); // Ultima_Leitura
          sheet.getRange(i + 1, 9).setValue(status); // Status
          break;
        }
      }
    } catch (error) {
      Logger.log(`[_updateSensorStatus] Erro: ${error}`);
    }
  },


  /**
   * Cadastra novo sensor
   */
  registerSensor: function(sensorData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SENSORES);
      
      const sensorId = sensorData.id || `SENSOR-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        sensorId,
        sensorData.nome || `Sensor ${sensorId}`,
        sensorData.tipo || 'PM_CO2_Temp',
        sensorData.latitude || '',
        sensorData.longitude || '',
        sensorData.local || '',
        new Date().toISOString().split('T')[0],
        '',
        'Online',
        100,
        sensorData.firmware || '1.0.0'
      ];
      
      sheet.appendRow(row);
      
      return { success: true, sensor_id: sensorId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista sensores cadastrados
   */
  listSensors: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SENSORES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, sensors: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const sensors = [];
      
      for (let i = 1; i < data.length; i++) {
        sensors.push({
          id: data[i][0],
          nome: data[i][1],
          tipo: data[i][2],
          latitude: data[i][3],
          longitude: data[i][4],
          local: data[i][5],
          data_instalacao: data[i][6],
          ultima_leitura: data[i][7],
          status: data[i][8],
          bateria: data[i][9],
          firmware: data[i][10]
        });
      }
      
      return { success: true, sensors: sensors, count: sensors.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém leituras recentes
   */
  getRecentReadings: function(sensorId = null, limit = 50) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_LEITURAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, readings: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      let readings = [];
      
      for (let i = data.length - 1; i >= 1 && readings.length < limit; i--) {
        const row = data[i];
        
        if (sensorId && row[1] !== sensorId) continue;
        
        readings.push({
          id: row[0],
          sensor_id: row[1],
          timestamp: row[2],
          latitude: row[3],
          longitude: row[4],
          local: row[5],
          pm25: row[6],
          pm10: row[7],
          co2: row[8],
          temperatura: row[9],
          umidade: row[10],
          pressao: row[11],
          iqa_score: row[12],
          iqa_categoria: row[13],
          pm25_aqi: row[14],
          pm10_aqi: row[15],
          has_alerts: row[16] || row[17] || row[18] || row[19],
          status: row[23]
        });
      }
      
      return { success: true, readings: readings, count: readings.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém última leitura de cada sensor
   */
  getCurrentStatus: function() {
    try {
      const sensorsResult = this.listSensors();
      if (!sensorsResult.success) return sensorsResult;
      
      const status = [];
      
      for (const sensor of sensorsResult.sensors) {
        const readings = this.getRecentReadings(sensor.id, 1);
        const lastReading = readings.readings[0] || null;
        
        status.push({
          sensor: sensor,
          last_reading: lastReading,
          is_online: lastReading && this._isRecent(lastReading.timestamp, 30), // 30 min
          iqa: lastReading ? {
            score: lastReading.iqa_score,
            categoria: lastReading.iqa_categoria
          } : null
        });
      }
      
      // Calcula IQA médio
      const validReadings = status.filter(s => s.last_reading);
      const avgIQA = validReadings.length > 0 
        ? Math.round(validReadings.reduce((sum, s) => sum + s.last_reading.iqa_score, 0) / validReadings.length)
        : null;
      
      return {
        success: true,
        sensors_status: status,
        total_sensors: status.length,
        online_sensors: status.filter(s => s.is_online).length,
        avg_iqa: avgIQA,
        avg_iqa_categoria: avgIQA ? this._classifyAQI(avgIQA) : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Verifica se timestamp é recente
   * @private
   */
  _isRecent: function(timestamp, minutes) {
    const readingTime = new Date(timestamp).getTime();
    const now = Date.now();
    return (now - readingTime) < (minutes * 60 * 1000);
  },

  /**
   * Análise de tendências
   */
  analyzeTrends: function(sensorId = null, days = 7) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_LEITURAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Sem dados para análise' };
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const data = sheet.getDataRange().getValues();
      const readings = [];
      
      for (let i = 1; i < data.length; i++) {
        const timestamp = new Date(data[i][2]);
        if (timestamp < cutoffDate) continue;
        if (sensorId && data[i][1] !== sensorId) continue;
        
        readings.push({
          timestamp: timestamp,
          pm25: parseFloat(data[i][6]) || 0,
          pm10: parseFloat(data[i][7]) || 0,
          co2: parseInt(data[i][8]) || 0,
          temperatura: parseFloat(data[i][9]) || 0,
          umidade: parseFloat(data[i][10]) || 0,
          iqa: parseInt(data[i][12]) || 0
        });
      }
      
      if (readings.length < 2) {
        return { success: false, error: 'Dados insuficientes para análise de tendência' };
      }
      
      // Agrupa por dia
      const dailyData = this._aggregateByDay(readings);
      
      // Calcula tendências
      const pm25Values = readings.map(r => r.pm25);
      const pm10Values = readings.map(r => r.pm10);
      const co2Values = readings.map(r => r.co2);
      const iqaValues = readings.map(r => r.iqa);
      
      return {
        success: true,
        period_days: days,
        total_readings: readings.length,
        trends: {
          pm25: {
            trend: this._calculateTrend(pm25Values),
            avg: this._average(pm25Values),
            min: Math.min(...pm25Values),
            max: Math.max(...pm25Values)
          },
          pm10: {
            trend: this._calculateTrend(pm10Values),
            avg: this._average(pm10Values),
            min: Math.min(...pm10Values),
            max: Math.max(...pm10Values)
          },
          co2: {
            trend: this._calculateTrend(co2Values),
            avg: this._average(co2Values),
            min: Math.min(...co2Values),
            max: Math.max(...co2Values)
          },
          iqa: {
            trend: this._calculateTrend(iqaValues),
            avg: this._average(iqaValues),
            min: Math.min(...iqaValues),
            max: Math.max(...iqaValues)
          }
        },
        daily_data: dailyData,
        worst_day: this._findWorstDay(dailyData),
        best_day: this._findBestDay(dailyData),
        fire_impact_detected: this._detectFireImpact(readings)
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
      const day = r.timestamp.toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { pm25: [], pm10: [], co2: [], iqa: [] };
      }
      byDay[day].pm25.push(r.pm25);
      byDay[day].pm10.push(r.pm10);
      byDay[day].co2.push(r.co2);
      byDay[day].iqa.push(r.iqa);
    });
    
    return Object.entries(byDay).map(([day, values]) => ({
      date: day,
      pm25_avg: this._average(values.pm25),
      pm10_avg: this._average(values.pm10),
      co2_avg: this._average(values.co2),
      iqa_avg: this._average(values.iqa),
      readings_count: values.pm25.length
    })).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Calcula tendência (slope)
   * @private
   */
  _calculateTrend: function(values) {
    if (values.length < 2) return 'estavel';
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    const avgValue = sumY / n;
    const percentChange = (slope * n) / avgValue * 100;
    
    if (percentChange > 10) return 'subindo';
    if (percentChange < -10) return 'descendo';
    return 'estavel';
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
   * Encontra pior dia
   * @private
   */
  _findWorstDay: function(dailyData) {
    if (dailyData.length === 0) return null;
    return dailyData.reduce((worst, day) => 
      day.iqa_avg > worst.iqa_avg ? day : worst
    );
  },

  /**
   * Encontra melhor dia
   * @private
   */
  _findBestDay: function(dailyData) {
    if (dailyData.length === 0) return null;
    return dailyData.reduce((best, day) => 
      day.iqa_avg < best.iqa_avg ? day : best
    );
  },

  /**
   * Detecta impacto de queimadas
   * @private
   */
  _detectFireImpact: function(readings) {
    // Indicadores de queimada: PM2.5 alto + PM10 alto + padrão de pico
    const highPM25 = readings.filter(r => r.pm25 > 55).length;
    const highPM10 = readings.filter(r => r.pm10 > 150).length;
    
    const ratio = (highPM25 + highPM10) / (readings.length * 2);
    
    if (ratio > 0.3) {
      return {
        detected: true,
        confidence: Math.min(ratio * 2, 1),
        message: 'Padrão consistente com impacto de queimadas detectado',
        recommendation: 'Monitorar qualidade do ar e considerar suspensão de atividades externas'
      };
    }
    
    return { detected: false };
  },

  /**
   * Simula leituras para demonstração
   */
  simulateReadings: function(sensorId, count = 24) {
    const results = [];
    const baseTime = Date.now();
    
    for (let i = 0; i < count; i++) {
      // Simula variação diurna
      const hour = (new Date(baseTime - i * 3600000)).getHours();
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      
      const reading = {
        sensor_id: sensorId,
        pm25: 10 + Math.random() * 20 + (isRushHour ? 15 : 0),
        pm10: 20 + Math.random() * 30 + (isRushHour ? 20 : 0),
        co2: 400 + Math.random() * 200,
        temperatura: 22 + Math.random() * 8,
        umidade: 50 + Math.random() * 30,
        pressao: 1010 + Math.random() * 10,
        latitude: -13.4 + Math.random() * 0.01,
        longitude: -46.3 + Math.random() * 0.01,
        local: 'Reserva Araras',
        bateria: 85 + Math.random() * 15,
        rssi: -60 - Math.random() * 30
      };
      
      const result = this.processReading(reading);
      results.push(result);
    }
    
    return {
      success: true,
      simulated_count: count,
      results: results.slice(0, 5) // Retorna apenas primeiros 5 para não sobrecarregar
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Qualidade do Ar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de qualidade do ar
 */
function apiQualidadeArInit() {
  return AirQualitySensor.initializeSheets();
}

/**
 * Processa leitura de sensor
 * @param {object} sensorData - Dados do sensor
 */
function apiQualidadeArProcessar(sensorData) {
  return AirQualitySensor.processReading(sensorData);
}

/**
 * Cadastra novo sensor
 * @param {object} sensorData - Dados do sensor
 */
function apiQualidadeArCadastrarSensor(sensorData) {
  return AirQualitySensor.registerSensor(sensorData);
}

/**
 * Lista sensores cadastrados
 */
function apiQualidadeArListarSensores() {
  return AirQualitySensor.listSensors();
}

/**
 * Obtém status atual de todos os sensores
 */
function apiQualidadeArStatus() {
  return AirQualitySensor.getCurrentStatus();
}

/**
 * Obtém leituras recentes
 * @param {string} sensorId - ID do sensor (opcional)
 * @param {number} limit - Limite de registros
 */
function apiQualidadeArLeituras(sensorId, limit) {
  return AirQualitySensor.getRecentReadings(sensorId, limit || 50);
}

/**
 * Analisa tendências
 * @param {string} sensorId - ID do sensor (opcional)
 * @param {number} days - Dias para análise
 */
function apiQualidadeArTendencias(sensorId, days) {
  return AirQualitySensor.analyzeTrends(sensorId, days || 7);
}

/**
 * Simula leituras para demonstração
 * @param {string} sensorId - ID do sensor
 * @param {number} count - Quantidade de leituras
 */
function apiQualidadeArSimular(sensorId, count) {
  return AirQualitySensor.simulateReadings(sensorId, count || 24);
}
