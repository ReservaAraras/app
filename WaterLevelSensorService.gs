/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE MONITORAMENTO DE NÍVEL DE ÁGUA
 * ═══════════════════════════════════════════════════════════════════════════
 * P21 - Sensores de Nível de Água em Nascentes e Córregos
 * 
 * Funcionalidades:
 * - Monitoramento 24/7 de nascentes e córregos
 * - Sensores ultrassônicos IoT
 * - Cálculo automático de vazão
 * - Alertas de seca e enchente
 * - Análise de tendências
 * - Integração com P12 (eventos extremos)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha SENSORES_NIVEL_AGUA_RA
 */
const SCHEMA_NIVEL_AGUA = {
  ID_Leitura: { type: 'string', required: true, unique: true },
  ID_Sensor: { type: 'string', required: true },
  Timestamp: { type: 'datetime', required: true },
  Latitude: { type: 'float' },
  Longitude: { type: 'float' },
  Corpo_Agua: { type: 'string' },
  Tipo_Corpo: { type: 'enum', values: ['Nascente', 'Corrego', 'Rio', 'Lagoa', 'Represa'] },
  Nivel_Agua_cm: { type: 'float', min: 0 },
  Nivel_Referencia_cm: { type: 'float' },
  Vazao_Ls: { type: 'float', min: 0 },
  Temperatura_Agua_C: { type: 'float' },
  Status: { type: 'enum', values: ['Normal', 'Baixo', 'Critico', 'Enchente'] },
  Alerta_Seca: { type: 'boolean' },
  Alerta_Enchente: { type: 'boolean' },
  Variacao_24h_cm: { type: 'float' },
  Tendencia: { type: 'enum', values: ['Subindo', 'Estavel', 'Caindo'] },
  Alertas_JSON: { type: 'text' },
  Bateria_percent: { type: 'integer' },
  Status_Sensor: { type: 'enum', values: ['Online', 'Offline', 'Manutencao'] }
};

const NIVEL_AGUA_HEADERS = [
  'ID_Leitura', 'ID_Sensor', 'Timestamp', 'Latitude', 'Longitude',
  'Corpo_Agua', 'Tipo_Corpo', 'Nivel_Agua_cm', 'Nivel_Referencia_cm', 'Vazao_Ls',
  'Temperatura_Agua_C', 'Status', 'Alerta_Seca', 'Alerta_Enchente',
  'Variacao_24h_cm', 'Tendencia', 'Alertas_JSON', 'Bateria_percent', 'Status_Sensor'
];

const SENSORES_AGUA_HEADERS = [
  'ID_Sensor', 'Nome', 'Latitude', 'Longitude', 'Corpo_Agua', 'Tipo_Corpo',
  'Nivel_Normal_cm', 'Nivel_Alerta_Baixo_cm', 'Nivel_Alerta_Alto_cm',
  'Largura_Canal_m', 'Data_Instalacao', 'Ultima_Leitura', 'Status', 'Bateria_percent'
];


/**
 * Sistema de Monitoramento de Nível de Água
 * @namespace WaterLevelSensor
 */
const WaterLevelSensor = {
  
  SHEET_LEITURAS: 'SENSORES_NIVEL_AGUA_RA',
  SHEET_SENSORES: 'CADASTRO_SENSORES_AGUA_RA',
  
  /**
   * Thresholds padrão (podem ser customizados por sensor)
   */
  DEFAULT_THRESHOLDS: {
    NASCENTE: {
      normal: 30,      // cm
      baixo: 15,       // cm - alerta de seca
      critico: 5,      // cm - seca crítica
      alto: 50,        // cm - nível alto
      enchente: 70     // cm - enchente
    },
    CORREGO: {
      normal: 50,
      baixo: 25,
      critico: 10,
      alto: 80,
      enchente: 120
    },
    RIO: {
      normal: 100,
      baixo: 50,
      critico: 25,
      alto: 150,
      enchente: 200
    }
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
        sheetLeituras.appendRow(NIVEL_AGUA_HEADERS);
        const headerRange = sheetLeituras.getRange(1, 1, 1, NIVEL_AGUA_HEADERS.length);
        headerRange.setBackground('#0288D1');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetLeituras.setFrozenRows(1);
      }
      
      // Planilha de sensores
      let sheetSensores = ss.getSheetByName(this.SHEET_SENSORES);
      if (!sheetSensores) {
        sheetSensores = ss.insertSheet(this.SHEET_SENSORES);
        sheetSensores.appendRow(SENSORES_AGUA_HEADERS);
        const headerRange = sheetSensores.getRange(1, 1, 1, SENSORES_AGUA_HEADERS.length);
        headerRange.setBackground('#01579B');
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
      this.initializeSheets();
      
      // 1. Valida dados
      const validation = this._validateReading(sensorData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. Obtém configuração do sensor
      const sensorConfig = this._getSensorConfig(sensorData.sensor_id);
      const tipoCorpo = sensorData.tipo_corpo || sensorConfig?.tipo_corpo || 'CORREGO';
      
      // 3. Classifica status do nível
      const status = this._classifyWaterLevel(sensorData.nivel, tipoCorpo, sensorConfig);
      
      // 4. Calcula vazão
      const vazao = this._calculateFlow(sensorData.nivel, sensorConfig);
      
      // 5. Calcula variação 24h e tendência
      const variation = this._calculateVariation(sensorData.sensor_id, sensorData.nivel);
      
      // 6. Verifica alertas
      const alerts = this._checkAlerts(sensorData, status, variation);
      
      // 7. Prepara registro completo
      const reading = {
        id: `WL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        sensor_id: sensorData.sensor_id,
        latitude: sensorData.latitude || sensorConfig?.latitude,
        longitude: sensorData.longitude || sensorConfig?.longitude,
        corpo_agua: sensorData.corpo_agua || sensorConfig?.corpo_agua || 'Não identificado',
        tipo_corpo: tipoCorpo,
        nivel: sensorData.nivel,
        nivel_referencia: sensorConfig?.nivel_normal || 50,
        vazao: vazao,
        temperatura_agua: sensorData.temperatura_agua || null,
        status: status,
        alerta_seca: status === 'Critico' || status === 'Baixo',
        alerta_enchente: status === 'Enchente',
        variacao_24h: variation.variacao,
        tendencia: variation.tendencia,
        alerts: alerts,
        bateria: sensorData.bateria || 100
      };
      
      // 8. Salva no banco
      this._saveReading(reading);
      
      // 9. Atualiza status do sensor
      this._updateSensorStatus(sensorData.sensor_id, 'Online');
      
      return {
        success: true,
        reading_id: reading.id,
        nivel_cm: reading.nivel,
        status: status,
        vazao_ls: vazao,
        variation: variation,
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
    
    if (data.nivel === undefined || data.nivel === null) {
      return { valid: false, error: 'Nível de água é obrigatório' };
    }
    
    if (data.nivel < 0) {
      return { valid: false, error: 'Nível de água não pode ser negativo' };
    }
    
    return { valid: true };
  },

  /**
   * Obtém configuração do sensor
   * @private
   */
  _getSensorConfig: function(sensorId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SENSORES);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === sensorId) {
          return {
            id: data[i][0],
            nome: data[i][1],
            latitude: data[i][2],
            longitude: data[i][3],
            corpo_agua: data[i][4],
            tipo_corpo: data[i][5],
            nivel_normal: data[i][6],
            nivel_alerta_baixo: data[i][7],
            nivel_alerta_alto: data[i][8],
            largura_canal: data[i][9]
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Classifica status do nível de água
   * @private
   */
  _classifyWaterLevel: function(nivel, tipoCorpo, sensorConfig) {
    // Usa thresholds do sensor se disponíveis, senão usa padrão
    let thresholds;
    if (sensorConfig && sensorConfig.nivel_alerta_baixo && sensorConfig.nivel_alerta_alto) {
      thresholds = {
        baixo: sensorConfig.nivel_alerta_baixo,
        critico: sensorConfig.nivel_alerta_baixo * 0.5,
        alto: sensorConfig.nivel_alerta_alto,
        enchente: sensorConfig.nivel_alerta_alto * 1.5
      };
    } else {
      thresholds = this.DEFAULT_THRESHOLDS[tipoCorpo.toUpperCase()] || this.DEFAULT_THRESHOLDS.CORREGO;
    }
    
    if (nivel <= thresholds.critico) return 'Critico';
    if (nivel <= thresholds.baixo) return 'Baixo';
    if (nivel >= thresholds.enchente) return 'Enchente';
    if (nivel >= thresholds.alto) return 'Alto';
    return 'Normal';
  },

  /**
   * Calcula vazão (L/s) usando fórmula de Manning simplificada
   * @private
   */
  _calculateFlow: function(nivel, sensorConfig) {
    if (!sensorConfig || !sensorConfig.largura_canal) {
      // Estimativa simplificada baseada apenas no nível
      return Math.round(nivel * 0.5 * 10) / 10; // L/s aproximado
    }
    
    const largura = sensorConfig.largura_canal; // metros
    const altura = nivel / 100; // converter cm para m
    const area = largura * altura; // m²
    
    // Velocidade estimada (m/s) - simplificado
    const velocidade = 0.3 + (altura * 0.5);
    
    // Vazão em L/s
    const vazao = area * velocidade * 1000;
    return Math.round(vazao * 10) / 10;
  },

  /**
   * Calcula variação 24h e tendência
   * @private
   */
  _calculateVariation: function(sensorId, nivelAtual) {
    try {
      const readings = this._getRecentReadings(sensorId, 24);
      
      if (readings.length < 2) {
        return { variacao: 0, tendencia: 'Estavel' };
      }
      
      // Nível de 24h atrás
      const nivel24h = readings[readings.length - 1].nivel;
      const variacao = Math.round((nivelAtual - nivel24h) * 10) / 10;
      
      // Tendência baseada nas últimas 6 leituras
      const recent = readings.slice(0, Math.min(6, readings.length));
      const avgRecent = recent.reduce((sum, r) => sum + r.nivel, 0) / recent.length;
      
      let tendencia = 'Estavel';
      if (nivelAtual > avgRecent + 2) tendencia = 'Subindo';
      else if (nivelAtual < avgRecent - 2) tendencia = 'Caindo';
      
      return { variacao, tendencia };
    } catch (error) {
      return { variacao: 0, tendencia: 'Estavel' };
    }
  },

  /**
   * Obtém leituras recentes de um sensor
   * @private
   */
  _getRecentReadings: function(sensorId, hours = 24) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_LEITURAS);
      
      if (!sheet || sheet.getLastRow() < 2) return [];
      
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      const data = sheet.getDataRange().getValues();
      const readings = [];
      
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][1] !== sensorId) continue;
        
        const timestamp = new Date(data[i][2]).getTime();
        if (timestamp < cutoffTime) break;
        
        readings.push({
          timestamp: data[i][2],
          nivel: data[i][7],
          vazao: data[i][9],
          status: data[i][11]
        });
      }
      
      return readings;
    } catch (error) {
      return [];
    }
  },


  /**
   * Verifica alertas
   * @private
   */
  _checkAlerts: function(data, status, variation) {
    const alerts = [];
    
    // Alerta de seca crítica
    if (status === 'Critico') {
      alerts.push({
        type: 'Seca_Critica',
        severity: 'Urgente',
        value: data.nivel,
        message: `Nível crítico: ${data.nivel} cm - Nascente/córrego em risco`,
        action: 'Verificar captação e avaliar medidas emergenciais',
        icon: '🔴'
      });
    } else if (status === 'Baixo') {
      alerts.push({
        type: 'Nivel_Baixo',
        severity: 'Alto',
        value: data.nivel,
        message: `Nível baixo: ${data.nivel} cm`,
        action: 'Monitorar evolução e reduzir captação se possível',
        icon: '🟠'
      });
    }
    
    // Alerta de enchente
    if (status === 'Enchente') {
      alerts.push({
        type: 'Enchente',
        severity: 'Urgente',
        value: data.nivel,
        message: `Nível de enchente: ${data.nivel} cm`,
        action: 'Evacuar áreas de risco, proteger equipamentos',
        icon: '🌊'
      });
    } else if (status === 'Alto') {
      alerts.push({
        type: 'Nivel_Alto',
        severity: 'Alto',
        value: data.nivel,
        message: `Nível alto: ${data.nivel} cm`,
        action: 'Monitorar evolução, preparar para possível enchente',
        icon: '⚠️'
      });
    }
    
    // Alerta de variação rápida
    if (Math.abs(variation.variacao) > 20) {
      alerts.push({
        type: 'Variacao_Rapida',
        severity: variation.variacao > 0 ? 'Alto' : 'Medio',
        value: variation.variacao,
        message: `Variação rápida: ${variation.variacao > 0 ? '+' : ''}${variation.variacao} cm em 24h`,
        action: variation.variacao > 0 ? 'Possível chuva intensa a montante' : 'Verificar possível vazamento ou captação excessiva',
        icon: variation.variacao > 0 ? '📈' : '📉'
      });
    }
    
    // Alerta de temperatura da água (se disponível)
    if (data.temperatura_agua !== undefined && data.temperatura_agua !== null) {
      if (data.temperatura_agua > 30) {
        alerts.push({
          type: 'Temperatura_Alta',
          severity: 'Medio',
          value: data.temperatura_agua,
          message: `Temperatura da água elevada: ${data.temperatura_agua}°C`,
          action: 'Pode afetar fauna aquática',
          icon: '🌡️'
        });
      }
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
        reading.corpo_agua,
        reading.tipo_corpo,
        reading.nivel,
        reading.nivel_referencia,
        reading.vazao,
        reading.temperatura_agua || '',
        reading.status,
        reading.alerta_seca,
        reading.alerta_enchente,
        reading.variacao_24h,
        reading.tendencia,
        JSON.stringify(reading.alerts),
        reading.bateria,
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
          sheet.getRange(i + 1, 12).setValue(new Date().toISOString()); // Ultima_Leitura
          sheet.getRange(i + 1, 13).setValue(status); // Status
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
      
      const sensorId = sensorData.id || `WATER-${Date.now().toString(36).toUpperCase()}`;
      const tipoCorpo = sensorData.tipo_corpo || 'Corrego';
      const thresholds = this.DEFAULT_THRESHOLDS[tipoCorpo.toUpperCase()] || this.DEFAULT_THRESHOLDS.CORREGO;
      
      const row = [
        sensorId,
        sensorData.nome || `Sensor ${sensorId}`,
        sensorData.latitude || '',
        sensorData.longitude || '',
        sensorData.corpo_agua || '',
        tipoCorpo,
        sensorData.nivel_normal || thresholds.normal,
        sensorData.nivel_alerta_baixo || thresholds.baixo,
        sensorData.nivel_alerta_alto || thresholds.alto,
        sensorData.largura_canal || 1,
        new Date().toISOString().split('T')[0],
        '',
        'Online',
        100
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
          latitude: data[i][2],
          longitude: data[i][3],
          corpo_agua: data[i][4],
          tipo_corpo: data[i][5],
          nivel_normal: data[i][6],
          nivel_alerta_baixo: data[i][7],
          nivel_alerta_alto: data[i][8],
          largura_canal: data[i][9],
          data_instalacao: data[i][10],
          ultima_leitura: data[i][11],
          status: data[i][12],
          bateria: data[i][13]
        });
      }
      
      return { success: true, sensors: sensors, count: sensors.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém status atual de todos os sensores
   */
  getCurrentStatus: function() {
    try {
      const sensorsResult = this.listSensors();
      if (!sensorsResult.success) return sensorsResult;
      
      const status = [];
      let totalAlerts = 0;
      let totalCritico = 0;
      let totalEnchente = 0;
      
      for (const sensor of sensorsResult.sensors) {
        const readings = this._getRecentReadings(sensor.id, 1);
        const lastReading = readings[0] || null;
        
        if (lastReading) {
          if (lastReading.status === 'Critico') totalCritico++;
          if (lastReading.status === 'Enchente') totalEnchente++;
        }
        
        status.push({
          sensor: sensor,
          last_reading: lastReading,
          is_online: lastReading && this._isRecent(lastReading.timestamp, 60),
          nivel_atual: lastReading?.nivel || null,
          status_nivel: lastReading?.status || null
        });
      }
      
      // Calcula nível médio
      const validReadings = status.filter(s => s.last_reading);
      const avgNivel = validReadings.length > 0 
        ? Math.round(validReadings.reduce((sum, s) => sum + s.last_reading.nivel, 0) / validReadings.length)
        : null;
      
      return {
        success: true,
        sensors_status: status,
        total_sensors: status.length,
        online_sensors: status.filter(s => s.is_online).length,
        sensores_criticos: totalCritico,
        sensores_enchente: totalEnchente,
        nivel_medio_cm: avgNivel
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
          nivel: parseFloat(data[i][7]) || 0,
          vazao: parseFloat(data[i][9]) || 0,
          status: data[i][11]
        });
      }
      
      if (readings.length < 2) {
        return { success: false, error: 'Dados insuficientes' };
      }
      
      // Agrupa por dia
      const dailyData = this._aggregateByDay(readings);
      
      // Estatísticas
      const niveis = readings.map(r => r.nivel);
      const vazoes = readings.map(r => r.vazao);
      
      return {
        success: true,
        period_days: days,
        total_readings: readings.length,
        nivel: {
          media: this._average(niveis),
          min: Math.min(...niveis),
          max: Math.max(...niveis),
          tendencia: this._calculateTrend(niveis)
        },
        vazao: {
          media: this._average(vazoes),
          min: Math.min(...vazoes),
          max: Math.max(...vazoes)
        },
        daily_data: dailyData,
        dias_criticos: dailyData.filter(d => d.status_predominante === 'Critico').length,
        dias_enchente: dailyData.filter(d => d.status_predominante === 'Enchente').length
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
        byDay[day] = { niveis: [], vazoes: [], statuses: [] };
      }
      byDay[day].niveis.push(r.nivel);
      byDay[day].vazoes.push(r.vazao);
      byDay[day].statuses.push(r.status);
    });
    
    return Object.entries(byDay).map(([day, values]) => {
      // Status predominante
      const statusCount = {};
      values.statuses.forEach(s => { statusCount[s] = (statusCount[s] || 0) + 1; });
      const statusPredominante = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0][0];
      
      return {
        date: day,
        nivel_medio: this._average(values.niveis),
        nivel_min: Math.min(...values.niveis),
        nivel_max: Math.max(...values.niveis),
        vazao_media: this._average(values.vazoes),
        status_predominante: statusPredominante,
        readings_count: values.niveis.length
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Calcula tendência
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
   * Simula leituras para demonstração
   */
  simulateReadings: function(sensorId, count = 24) {
    const results = [];
    const tiposCorpo = ['Nascente', 'Corrego'];
    const tipoCorpo = tiposCorpo[Math.floor(Math.random() * tiposCorpo.length)];
    const baseNivel = tipoCorpo === 'Nascente' ? 30 : 50;
    
    for (let i = 0; i < count; i++) {
      // Simula variação natural
      const variation = (Math.random() - 0.5) * 20;
      
      const reading = {
        sensor_id: sensorId,
        nivel: Math.max(5, baseNivel + variation),
        temperatura_agua: 18 + Math.random() * 8,
        tipo_corpo: tipoCorpo,
        bateria: 85 + Math.random() * 15
      };
      
      const result = this.processReading(reading);
      results.push(result);
    }
    
    return {
      success: true,
      simulated_count: count,
      tipo_corpo: tipoCorpo,
      results: results.slice(0, 3)
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Nível de Água
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de nível de água
 */
function apiNivelAguaInit() {
  return WaterLevelSensor.initializeSheets();
}

/**
 * Processa leitura de sensor
 */
function apiNivelAguaProcessar(sensorData) {
  return WaterLevelSensor.processReading(sensorData);
}

/**
 * Cadastra novo sensor
 */
function apiNivelAguaCadastrarSensor(sensorData) {
  return WaterLevelSensor.registerSensor(sensorData);
}

/**
 * Lista sensores cadastrados
 */
function apiNivelAguaListarSensores() {
  return WaterLevelSensor.listSensors();
}

/**
 * Obtém status atual
 */
function apiNivelAguaStatus() {
  return WaterLevelSensor.getCurrentStatus();
}

/**
 * Analisa tendências
 */
function apiNivelAguaTendencias(sensorId, days) {
  return WaterLevelSensor.analyzeTrends(sensorId, days || 7);
}

/**
 * Simula leituras
 */
function apiNivelAguaSimular(sensorId, count) {
  return WaterLevelSensor.simulateReadings(sensorId, count || 24);
}
