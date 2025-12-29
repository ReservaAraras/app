/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE MONITORAMENTO DE UMIDADE DO SOLO
 * ═══════════════════════════════════════════════════════════════════════════
 * P19 - Sensores IoT de Umidade do Solo e Irrigação Inteligente
 * 
 * Funcionalidades:
 * - Monitoramento em tempo real de umidade do solo
 * - Classificação por tipo de solo (Argiloso, Arenoso, Franco)
 * - Cálculo de necessidade de irrigação
 * - Avaliação de estresse hídrico
 * - Alertas de seca e encharcamento
 * - Histórico e tendências
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha SENSORES_UMIDADE_SOLO_RA
 */
const SCHEMA_UMIDADE_SOLO = {
  ID_Leitura: { type: 'string', required: true, unique: true },
  ID_Sensor: { type: 'string', required: true },
  Timestamp: { type: 'datetime', required: true },
  Latitude: { type: 'float' },
  Longitude: { type: 'float' },
  Area_Nome: { type: 'string' },
  Umidade_Volumetrica_percent: { type: 'float', range: [0, 100] },
  Umidade_Tensao_kPa: { type: 'float' },
  Temperatura_Solo_C: { type: 'float' },
  Condutividade_Eletrica_dSm: { type: 'float' },
  Status_Umidade: { type: 'enum', values: ['Muito_Seco', 'Seco', 'Ideal', 'Umido', 'Encharcado'] },
  Necessidade_Irrigacao: { type: 'boolean' },
  Volume_Irrigacao_L: { type: 'float' },
  Risco_Estresse_Hidrico: { type: 'enum', values: ['Nenhum', 'Baixo', 'Medio', 'Alto', 'Critico'] },
  Stress_Index: { type: 'integer', range: [0, 100] },
  Profundidade_cm: { type: 'integer' },
  Tipo_Solo: { type: 'string' },
  Cultura_Plantada: { type: 'string' },
  Alerta_Seca: { type: 'boolean' },
  Alerta_Encharcamento: { type: 'boolean' },
  Alerta_Salinidade: { type: 'boolean' },
  Alertas_JSON: { type: 'text' },
  Bateria_percent: { type: 'integer' },
  Status_Sensor: { type: 'enum', values: ['Online', 'Offline', 'Manutencao'] }
};

const UMIDADE_SOLO_HEADERS = [
  'ID_Leitura', 'ID_Sensor', 'Timestamp', 'Latitude', 'Longitude', 'Area_Nome',
  'Umidade_Volumetrica_percent', 'Umidade_Tensao_kPa', 'Temperatura_Solo_C', 'Condutividade_Eletrica_dSm',
  'Status_Umidade', 'Necessidade_Irrigacao', 'Volume_Irrigacao_L', 'Risco_Estresse_Hidrico', 'Stress_Index',
  'Profundidade_cm', 'Tipo_Solo', 'Cultura_Plantada',
  'Alerta_Seca', 'Alerta_Encharcamento', 'Alerta_Salinidade', 'Alertas_JSON',
  'Bateria_percent', 'Status_Sensor'
];

const SENSORES_SOLO_HEADERS = [
  'ID_Sensor', 'Nome', 'Latitude', 'Longitude', 'Area_Nome', 'Profundidade_cm',
  'Tipo_Solo', 'Cultura_Plantada', 'Area_m2', 'Data_Instalacao', 'Ultima_Leitura', 'Status', 'Bateria_percent'
];


/**
 * Sistema de Monitoramento de Umidade do Solo
 * @namespace SoilMoistureSensor
 */
const SoilMoistureSensor = {
  
  SHEET_LEITURAS: 'SENSORES_UMIDADE_SOLO_RA',
  SHEET_SENSORES: 'CADASTRO_SENSORES_SOLO_RA',
  
  /**
   * Thresholds de umidade por tipo de solo (%)
   */
  SOIL_THRESHOLDS: {
    'Argiloso': {
      very_dry: 15,
      dry: 25,
      optimal_min: 30,
      optimal_max: 45,
      wet: 55,
      saturated: 60
    },
    'Arenoso': {
      very_dry: 5,
      dry: 10,
      optimal_min: 15,
      optimal_max: 25,
      wet: 30,
      saturated: 35
    },
    'Franco': {
      very_dry: 10,
      dry: 20,
      optimal_min: 25,
      optimal_max: 40,
      wet: 50,
      saturated: 55
    },
    'Franco_Argiloso': {
      very_dry: 12,
      dry: 22,
      optimal_min: 28,
      optimal_max: 42,
      wet: 52,
      saturated: 58
    },
    'Franco_Arenoso': {
      very_dry: 8,
      dry: 15,
      optimal_min: 20,
      optimal_max: 32,
      wet: 40,
      saturated: 45
    }
  },
  
  /**
   * Limites de alerta
   */
  ALERT_THRESHOLDS: {
    SALINIDADE_MAX: 4.0, // dS/m
    TEMP_SOLO_MIN: 10,
    TEMP_SOLO_MAX: 35
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
        sheetLeituras.appendRow(UMIDADE_SOLO_HEADERS);
        const headerRange = sheetLeituras.getRange(1, 1, 1, UMIDADE_SOLO_HEADERS.length);
        headerRange.setBackground('#795548');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheetLeituras.setFrozenRows(1);
      }
      
      // Planilha de sensores
      let sheetSensores = ss.getSheetByName(this.SHEET_SENSORES);
      if (!sheetSensores) {
        sheetSensores = ss.insertSheet(this.SHEET_SENSORES);
        sheetSensores.appendRow(SENSORES_SOLO_HEADERS);
        const headerRange = sheetSensores.getRange(1, 1, 1, SENSORES_SOLO_HEADERS.length);
        headerRange.setBackground('#5D4037');
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
      
      // 2. Obtém configuração do sensor
      const sensorConfig = this._getSensorConfig(sensorData.sensor_id);
      const tipoSolo = sensorData.tipo_solo || sensorConfig?.tipo_solo || 'Franco';
      const areaNome = sensorData.area || sensorConfig?.area_nome || 'Área não definida';
      
      // 3. Classifica status de umidade
      const status = this._classifyMoistureStatus(sensorData.umidade, tipoSolo);
      
      // 4. Calcula necessidade de irrigação
      const irrigation = this._calculateIrrigationNeed(sensorData, status, tipoSolo, sensorConfig?.area_m2 || 100);
      
      // 5. Avalia risco de estresse hídrico
      const stress = this._assessWaterStress(sensorData.umidade, tipoSolo);
      
      // 6. Verifica alertas
      const alerts = this._checkAlerts(sensorData, status, stress);
      
      // 7. Prepara registro completo
      const reading = {
        id: `SM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        sensor_id: sensorData.sensor_id,
        latitude: sensorData.latitude || sensorConfig?.latitude,
        longitude: sensorData.longitude || sensorConfig?.longitude,
        area_nome: areaNome,
        umidade: sensorData.umidade,
        tensao: sensorData.tensao || null,
        temperatura_solo: sensorData.temperatura_solo || null,
        condutividade: sensorData.condutividade || null,
        status_umidade: status,
        necessidade_irrigacao: irrigation.should_irrigate,
        volume_irrigacao: irrigation.volume_liters || 0,
        risco_estresse: stress.risk_level,
        stress_index: stress.stress_index,
        profundidade: sensorData.profundidade || sensorConfig?.profundidade_cm || 30,
        tipo_solo: tipoSolo,
        cultura: sensorData.cultura || sensorConfig?.cultura_plantada || '',
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
        status: status,
        irrigation: irrigation,
        stress: stress,
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
    
    if (data.umidade === undefined || data.umidade === null) {
      return { valid: false, error: 'Umidade é obrigatória' };
    }
    
    if (data.umidade < 0 || data.umidade > 100) {
      return { valid: false, error: 'Umidade deve estar entre 0 e 100%' };
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
            area_nome: data[i][4],
            profundidade_cm: data[i][5],
            tipo_solo: data[i][6],
            cultura_plantada: data[i][7],
            area_m2: data[i][8]
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Classifica status de umidade
   * @private
   */
  _classifyMoistureStatus: function(moisture, soilType) {
    const thresholds = this.SOIL_THRESHOLDS[soilType] || this.SOIL_THRESHOLDS['Franco'];
    
    if (moisture < thresholds.very_dry) return 'Muito_Seco';
    if (moisture < thresholds.dry) return 'Seco';
    if (moisture <= thresholds.optimal_max) return 'Ideal';
    if (moisture <= thresholds.wet) return 'Umido';
    return 'Encharcado';
  },

  /**
   * Calcula necessidade de irrigação
   * @private
   */
  _calculateIrrigationNeed: function(data, status, soilType, areaM2) {
    const shouldIrrigate = (status === 'Muito_Seco' || status === 'Seco');
    
    if (!shouldIrrigate) {
      return {
        should_irrigate: false,
        reason: `Umidade adequada (${status})`
      };
    }
    
    const thresholds = this.SOIL_THRESHOLDS[soilType] || this.SOIL_THRESHOLDS['Franco'];
    const deficit = thresholds.optimal_min - data.umidade;
    
    // Calcula volume de água necessário
    // Fórmula simplificada: deficit% * área * fator de conversão
    const volumeLiters = Math.round(deficit * areaM2 * 0.1);
    
    return {
      should_irrigate: true,
      reason: `Umidade em ${data.umidade}% (mínimo ideal: ${thresholds.optimal_min}%)`,
      deficit_percent: Math.round(deficit * 10) / 10,
      target_moisture: thresholds.optimal_min,
      volume_liters: volumeLiters,
      duration_minutes: Math.ceil(volumeLiters / 10), // 10L/min
      priority: status === 'Muito_Seco' ? 'Alta' : 'Media'
    };
  },

  /**
   * Avalia estresse hídrico
   * @private
   */
  _assessWaterStress: function(moisture, soilType) {
    const thresholds = this.SOIL_THRESHOLDS[soilType] || this.SOIL_THRESHOLDS['Franco'];
    
    let stressIndex = 0;
    let stressType = 'none';
    
    if (moisture < thresholds.very_dry) {
      stressIndex = 100;
      stressType = 'deficit_severo';
    } else if (moisture < thresholds.dry) {
      stressIndex = 70;
      stressType = 'deficit_moderado';
    } else if (moisture < thresholds.optimal_min) {
      stressIndex = 40;
      stressType = 'deficit_leve';
    } else if (moisture > thresholds.saturated) {
      stressIndex = 80;
      stressType = 'encharcamento';
    } else if (moisture > thresholds.wet) {
      stressIndex = 40;
      stressType = 'excesso_leve';
    }
    
    // Classifica risco
    let riskLevel = 'Nenhum';
    if (stressIndex >= 80) riskLevel = 'Critico';
    else if (stressIndex >= 60) riskLevel = 'Alto';
    else if (stressIndex >= 40) riskLevel = 'Medio';
    else if (stressIndex >= 20) riskLevel = 'Baixo';
    
    return {
      stress_index: stressIndex,
      stress_type: stressType,
      risk_level: riskLevel,
      description: this._getStressDescription(stressType, stressIndex)
    };
  },

  /**
   * Descrição do estresse
   * @private
   */
  _getStressDescription: function(type, index) {
    const descriptions = {
      'deficit_severo': 'Plantas em estresse hídrico severo - murcha permanente possível',
      'deficit_moderado': 'Estresse hídrico moderado - crescimento reduzido',
      'deficit_leve': 'Leve déficit hídrico - monitorar',
      'encharcamento': 'Solo encharcado - risco de asfixia radicular',
      'excesso_leve': 'Umidade acima do ideal - reduzir irrigação',
      'none': 'Condições hídricas adequadas'
    };
    return descriptions[type] || 'Status desconhecido';
  },

  /**
   * Verifica alertas
   * @private
   */
  _checkAlerts: function(data, status, stress) {
    const alerts = [];
    
    // Alerta de seca crítica
    if (status === 'Muito_Seco' || stress.risk_level === 'Critico') {
      alerts.push({
        type: 'Seca_Critica',
        severity: 'Urgente',
        value: data.umidade,
        message: `Umidade crítica: ${data.umidade}%`,
        action: 'Irrigação imediata necessária',
        icon: '🔥'
      });
    } else if (status === 'Seco') {
      alerts.push({
        type: 'Seca_Moderada',
        severity: 'Alto',
        value: data.umidade,
        message: `Umidade baixa: ${data.umidade}%`,
        action: 'Programar irrigação',
        icon: '⚠️'
      });
    }
    
    // Alerta de encharcamento
    if (status === 'Encharcado') {
      alerts.push({
        type: 'Encharcamento',
        severity: 'Alto',
        value: data.umidade,
        message: `Solo encharcado: ${data.umidade}%`,
        action: 'Verificar drenagem e suspender irrigação',
        icon: '💧'
      });
    }
    
    // Alerta de salinidade
    if (data.condutividade && data.condutividade > this.ALERT_THRESHOLDS.SALINIDADE_MAX) {
      alerts.push({
        type: 'Salinidade_Alta',
        severity: 'Medio',
        value: data.condutividade,
        message: `Salinidade elevada: ${data.condutividade} dS/m`,
        action: 'Aplicar lâmina de lixiviação',
        icon: '🧂'
      });
    }
    
    // Alerta de temperatura do solo
    if (data.temperatura_solo) {
      if (data.temperatura_solo < this.ALERT_THRESHOLDS.TEMP_SOLO_MIN) {
        alerts.push({
          type: 'Temperatura_Baixa',
          severity: 'Medio',
          value: data.temperatura_solo,
          message: `Solo frio: ${data.temperatura_solo}°C`,
          action: 'Atividade biológica reduzida',
          icon: '❄️'
        });
      } else if (data.temperatura_solo > this.ALERT_THRESHOLDS.TEMP_SOLO_MAX) {
        alerts.push({
          type: 'Temperatura_Alta',
          severity: 'Alto',
          value: data.temperatura_solo,
          message: `Solo quente: ${data.temperatura_solo}°C`,
          action: 'Aplicar cobertura morta',
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
        reading.area_nome,
        reading.umidade,
        reading.tensao || '',
        reading.temperatura_solo || '',
        reading.condutividade || '',
        reading.status_umidade,
        reading.necessidade_irrigacao,
        reading.volume_irrigacao,
        reading.risco_estresse,
        reading.stress_index,
        reading.profundidade,
        reading.tipo_solo,
        reading.cultura,
        reading.alerts.some(a => a.type.includes('Seca')),
        reading.alerts.some(a => a.type === 'Encharcamento'),
        reading.alerts.some(a => a.type === 'Salinidade_Alta'),
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
          sheet.getRange(i + 1, 11).setValue(new Date().toISOString()); // Ultima_Leitura
          sheet.getRange(i + 1, 12).setValue(status); // Status
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
      
      const sensorId = sensorData.id || `SOIL-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        sensorId,
        sensorData.nome || `Sensor Solo ${sensorId}`,
        sensorData.latitude || '',
        sensorData.longitude || '',
        sensorData.area_nome || '',
        sensorData.profundidade_cm || 30,
        sensorData.tipo_solo || 'Franco',
        sensorData.cultura || '',
        sensorData.area_m2 || 100,
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
          area_nome: data[i][4],
          profundidade_cm: data[i][5],
          tipo_solo: data[i][6],
          cultura: data[i][7],
          area_m2: data[i][8],
          data_instalacao: data[i][9],
          ultima_leitura: data[i][10],
          status: data[i][11],
          bateria: data[i][12]
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
      let totalNeedIrrigation = 0;
      let totalAlerts = 0;
      
      for (const sensor of sensorsResult.sensors) {
        const readings = this.getRecentReadings(sensor.id, 1);
        const lastReading = readings.readings[0] || null;
        
        if (lastReading && lastReading.necessidade_irrigacao) totalNeedIrrigation++;
        if (lastReading && lastReading.has_alerts) totalAlerts++;
        
        status.push({
          sensor: sensor,
          last_reading: lastReading,
          is_online: lastReading && this._isRecent(lastReading.timestamp, 60),
          status_umidade: lastReading?.status_umidade || null,
          needs_irrigation: lastReading?.necessidade_irrigacao || false
        });
      }
      
      // Calcula umidade média
      const validReadings = status.filter(s => s.last_reading);
      const avgMoisture = validReadings.length > 0 
        ? Math.round(validReadings.reduce((sum, s) => sum + s.last_reading.umidade, 0) / validReadings.length * 10) / 10
        : null;
      
      return {
        success: true,
        sensors_status: status,
        total_sensors: status.length,
        online_sensors: status.filter(s => s.is_online).length,
        sensors_need_irrigation: totalNeedIrrigation,
        total_alerts: totalAlerts,
        avg_moisture: avgMoisture
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
      let readings = [];
      
      for (let i = data.length - 1; i >= 1 && readings.length < limit; i--) {
        const row = data[i];
        
        if (sensorId && row[1] !== sensorId) continue;
        
        readings.push({
          id: row[0],
          sensor_id: row[1],
          timestamp: row[2],
          area_nome: row[5],
          umidade: row[6],
          tensao: row[7],
          temperatura_solo: row[8],
          condutividade: row[9],
          status_umidade: row[10],
          necessidade_irrigacao: row[11],
          volume_irrigacao: row[12],
          risco_estresse: row[13],
          stress_index: row[14],
          profundidade: row[15],
          tipo_solo: row[16],
          cultura: row[17],
          has_alerts: row[18] || row[19] || row[20]
        });
      }
      
      return { success: true, readings: readings, count: readings.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Análise de tendências de umidade
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
          umidade: parseFloat(data[i][6]) || 0,
          temperatura: parseFloat(data[i][8]) || 0,
          stress_index: parseInt(data[i][14]) || 0,
          needs_irrigation: data[i][11] === true
        });
      }
      
      if (readings.length < 2) {
        return { success: false, error: 'Dados insuficientes para análise' };
      }
      
      // Agrupa por dia
      const dailyData = this._aggregateByDay(readings);
      
      // Calcula estatísticas
      const moistureValues = readings.map(r => r.umidade);
      const stressValues = readings.map(r => r.stress_index);
      
      // Conta dias com necessidade de irrigação
      const irrigationDays = dailyData.filter(d => d.irrigation_needed > 0).length;
      
      return {
        success: true,
        period_days: days,
        total_readings: readings.length,
        trends: {
          moisture: {
            trend: this._calculateTrend(moistureValues),
            avg: this._average(moistureValues),
            min: Math.min(...moistureValues),
            max: Math.max(...moistureValues)
          },
          stress: {
            trend: this._calculateTrend(stressValues),
            avg: this._average(stressValues)
          }
        },
        daily_data: dailyData,
        irrigation_days: irrigationDays,
        irrigation_percentage: Math.round(irrigationDays / dailyData.length * 100),
        driest_day: this._findDriestDay(dailyData),
        wettest_day: this._findWettestDay(dailyData)
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
        byDay[day] = { moisture: [], stress: [], irrigation_needed: 0 };
      }
      byDay[day].moisture.push(r.umidade);
      byDay[day].stress.push(r.stress_index);
      if (r.needs_irrigation) byDay[day].irrigation_needed++;
    });
    
    return Object.entries(byDay).map(([day, values]) => ({
      date: day,
      moisture_avg: this._average(values.moisture),
      moisture_min: Math.min(...values.moisture),
      moisture_max: Math.max(...values.moisture),
      stress_avg: this._average(values.stress),
      irrigation_needed: values.irrigation_needed,
      readings_count: values.moisture.length
    })).sort((a, b) => a.date.localeCompare(b.date));
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
   * Encontra dia mais seco
   * @private
   */
  _findDriestDay: function(dailyData) {
    if (dailyData.length === 0) return null;
    return dailyData.reduce((driest, day) => 
      day.moisture_avg < driest.moisture_avg ? day : driest
    );
  },

  /**
   * Encontra dia mais úmido
   * @private
   */
  _findWettestDay: function(dailyData) {
    if (dailyData.length === 0) return null;
    return dailyData.reduce((wettest, day) => 
      day.moisture_avg > wettest.moisture_avg ? day : wettest
    );
  },

  /**
   * Simula leituras para demonstração
   */
  simulateReadings: function(sensorId, count = 24) {
    const results = [];
    const tiposSolo = ['Franco', 'Argiloso', 'Arenoso'];
    const tipoSolo = tiposSolo[Math.floor(Math.random() * tiposSolo.length)];
    
    for (let i = 0; i < count; i++) {
      // Simula variação diurna de umidade
      const hour = (new Date(Date.now() - i * 3600000)).getHours();
      const isHot = hour >= 10 && hour <= 16;
      
      const reading = {
        sensor_id: sensorId,
        umidade: 25 + Math.random() * 25 - (isHot ? 8 : 0),
        tensao: 20 + Math.random() * 40,
        temperatura_solo: 20 + Math.random() * 10 + (isHot ? 5 : 0),
        condutividade: 0.5 + Math.random() * 2,
        tipo_solo: tipoSolo,
        profundidade: 30,
        bateria: 85 + Math.random() * 15
      };
      
      const result = this.processReading(reading);
      results.push(result);
    }
    
    return {
      success: true,
      simulated_count: count,
      tipo_solo: tipoSolo,
      results: results.slice(0, 5)
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Umidade do Solo
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de umidade do solo
 */
function apiUmidadeSoloInit() {
  return SoilMoistureSensor.initializeSheets();
}

/**
 * Processa leitura de sensor
 * @param {object} sensorData - Dados do sensor
 */
function apiUmidadeSoloProcessar(sensorData) {
  return SoilMoistureSensor.processReading(sensorData);
}

/**
 * Cadastra novo sensor
 * @param {object} sensorData - Dados do sensor
 */
function apiUmidadeSoloCadastrarSensor(sensorData) {
  return SoilMoistureSensor.registerSensor(sensorData);
}

/**
 * Lista sensores cadastrados
 */
function apiUmidadeSoloListarSensores() {
  return SoilMoistureSensor.listSensors();
}

/**
 * Obtém status atual de todos os sensores
 */
function apiUmidadeSoloStatus() {
  return SoilMoistureSensor.getCurrentStatus();
}

/**
 * Obtém leituras recentes
 * @param {string} sensorId - ID do sensor (opcional)
 * @param {number} limit - Limite de registros
 */
function apiUmidadeSoloLeituras(sensorId, limit) {
  return SoilMoistureSensor.getRecentReadings(sensorId, limit || 50);
}

/**
 * Analisa tendências
 * @param {string} sensorId - ID do sensor (opcional)
 * @param {number} days - Dias para análise
 */
function apiUmidadeSoloTendencias(sensorId, days) {
  return SoilMoistureSensor.analyzeTrends(sensorId, days || 7);
}

/**
 * Simula leituras para demonstração
 * @param {string} sensorId - ID do sensor
 * @param {number} count - Quantidade de leituras
 */
function apiUmidadeSoloSimular(sensorId, count) {
  return SoilMoistureSensor.simulateReadings(sensorId, count || 24);
}
