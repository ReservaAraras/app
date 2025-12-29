/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - DASHBOARD IoT CONSOLIDADO
 * ═══════════════════════════════════════════════════════════════════════════
 * P22 - Dashboard Unificado de Todos os Sensores IoT
 * 
 * Consolida dados de:
 * - P18: Qualidade do Ar
 * - P19: Umidade do Solo
 * - P20: Estação Meteorológica
 * - P21: Nível de Água
 * 
 * Funcionalidades:
 * - Visão unificada de todos os sensores
 * - Alertas centralizados
 * - Análise de saúde do sistema
 * - Correlações entre sistemas
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Sistema de Dashboard IoT Consolidado
 * @namespace IoTConsolidated
 */
const IoTConsolidated = {
  
  /**
   * Obtém status consolidado de todos os sistemas IoT
   */
  getConsolidatedStatus: function() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        systems: {},
        totals: {
          total_sensors: 0,
          online_sensors: 0,
          offline_sensors: 0,
          low_battery: 0,
          active_alerts: 0
        },
        alerts: [],
        health_score: 100
      };
      
      // 1. Qualidade do Ar (P18)
      try {
        const airStatus = typeof apiQualidadeArStatus === 'function' ? apiQualidadeArStatus() : null;
        if (airStatus && airStatus.success) {
          results.systems.air_quality = {
            name: 'Qualidade do Ar',
            icon: '🌬️',
            status: 'online',
            total_sensors: airStatus.total_sensors || 0,
            online_sensors: airStatus.online_sensors || 0,
            main_metric: {
              label: 'IQA Médio',
              value: airStatus.avg_iqa || 0,
              unit: '',
              status: this._classifyAirQuality(airStatus.avg_iqa)
            },
            alerts: this._extractAlerts(airStatus.sensors_status, 'air')
          };
          results.totals.total_sensors += airStatus.total_sensors || 0;
          results.totals.online_sensors += airStatus.online_sensors || 0;
        }
      } catch (e) {
        results.systems.air_quality = { name: 'Qualidade do Ar', icon: '🌬️', status: 'error', error: e.message };
      }
      
      // 2. Umidade do Solo (P19)
      try {
        const soilStatus = typeof apiUmidadeSoloStatus === 'function' ? apiUmidadeSoloStatus() : null;
        if (soilStatus && soilStatus.success) {
          results.systems.soil_moisture = {
            name: 'Umidade do Solo',
            icon: '🌱',
            status: 'online',
            total_sensors: soilStatus.total_sensors || 0,
            online_sensors: soilStatus.online_sensors || 0,
            main_metric: {
              label: 'Umidade Média',
              value: soilStatus.avg_moisture || 0,
              unit: '%',
              status: this._classifySoilMoisture(soilStatus.avg_moisture)
            },
            needs_irrigation: soilStatus.sensors_need_irrigation || 0,
            alerts: this._extractAlerts(soilStatus.sensors_status, 'soil')
          };
          results.totals.total_sensors += soilStatus.total_sensors || 0;
          results.totals.online_sensors += soilStatus.online_sensors || 0;
        }
      } catch (e) {
        results.systems.soil_moisture = { name: 'Umidade do Solo', icon: '🌱', status: 'error', error: e.message };
      }
      
      // 3. Estação Meteorológica (P20)
      try {
        const weatherStatus = typeof apiMeteoAtual === 'function' ? apiMeteoAtual() : null;
        if (weatherStatus && weatherStatus.success) {
          results.systems.weather = {
            name: 'Meteorologia',
            icon: '🌦️',
            status: 'online',
            total_sensors: 1,
            online_sensors: 1,
            main_metric: {
              label: 'Temperatura',
              value: weatherStatus.temperatura?.atual || 0,
              unit: '°C',
              status: 'normal'
            },
            secondary_metrics: {
              umidade: weatherStatus.umidade,
              pressao: weatherStatus.pressao?.atual,
              vento: weatherStatus.vento?.velocidade,
              chuva_24h: weatherStatus.chuva?.acumulada_24h
            },
            forecast: weatherStatus.previsao,
            alerts: weatherStatus.alerts || []
          };
          results.totals.total_sensors += 1;
          results.totals.online_sensors += 1;
        }
      } catch (e) {
        results.systems.weather = { name: 'Meteorologia', icon: '🌦️', status: 'error', error: e.message };
      }
      
      // 4. Nível de Água (P21)
      try {
        const waterStatus = typeof apiNivelAguaStatus === 'function' ? apiNivelAguaStatus() : null;
        if (waterStatus && waterStatus.success) {
          results.systems.water_level = {
            name: 'Nível de Água',
            icon: '🌊',
            status: 'online',
            total_sensors: waterStatus.total_sensors || 0,
            online_sensors: waterStatus.online_sensors || 0,
            main_metric: {
              label: 'Nível Médio',
              value: waterStatus.nivel_medio_cm || 0,
              unit: 'cm',
              status: this._classifyWaterLevel(waterStatus)
            },
            critical_count: waterStatus.sensores_criticos || 0,
            flood_count: waterStatus.sensores_enchente || 0,
            alerts: this._extractAlerts(waterStatus.sensors_status, 'water')
          };
          results.totals.total_sensors += waterStatus.total_sensors || 0;
          results.totals.online_sensors += waterStatus.online_sensors || 0;
        }
      } catch (e) {
        results.systems.water_level = { name: 'Nível de Água', icon: '🌊', status: 'error', error: e.message };
      }
      
      // Calcula totais
      results.totals.offline_sensors = results.totals.total_sensors - results.totals.online_sensors;
      
      // Consolida alertas
      Object.values(results.systems).forEach(sys => {
        if (sys.alerts && Array.isArray(sys.alerts)) {
          results.alerts.push(...sys.alerts.map(a => ({...a, system: sys.name})));
        }
      });
      results.totals.active_alerts = results.alerts.length;
      
      // Calcula health score
      results.health_score = this._calculateHealthScore(results);
      
      return { success: true, ...results };
      
    } catch (error) {
      Logger.log(`[getConsolidatedStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Classifica qualidade do ar
   * @private
   */
  _classifyAirQuality: function(iqa) {
    if (!iqa) return 'unknown';
    if (iqa <= 50) return 'good';
    if (iqa <= 100) return 'moderate';
    if (iqa <= 150) return 'unhealthy_sensitive';
    if (iqa <= 200) return 'unhealthy';
    return 'hazardous';
  },

  /**
   * Classifica umidade do solo
   * @private
   */
  _classifySoilMoisture: function(moisture) {
    if (!moisture) return 'unknown';
    if (moisture < 15) return 'critical';
    if (moisture < 25) return 'low';
    if (moisture <= 45) return 'optimal';
    if (moisture <= 55) return 'high';
    return 'waterlogged';
  },

  /**
   * Classifica nível de água
   * @private
   */
  _classifyWaterLevel: function(status) {
    if (status.sensores_enchente > 0) return 'flood';
    if (status.sensores_criticos > 0) return 'critical';
    return 'normal';
  },

  /**
   * Extrai alertas dos sensores
   * @private
   */
  _extractAlerts: function(sensorsStatus, type) {
    const alerts = [];
    if (!sensorsStatus || !Array.isArray(sensorsStatus)) return alerts;
    
    sensorsStatus.forEach(s => {
      if (s.last_reading && s.last_reading.has_alerts) {
        alerts.push({
          sensor_id: s.sensor?.id,
          sensor_name: s.sensor?.nome,
          type: type,
          severity: 'high',
          message: `Alerta em ${s.sensor?.nome || 'sensor'}`
        });
      }
    });
    
    return alerts;
  },

  /**
   * Calcula score de saúde do sistema
   * @private
   */
  _calculateHealthScore: function(results) {
    let score = 100;
    
    // Penaliza sensores offline
    if (results.totals.total_sensors > 0) {
      const offlineRatio = results.totals.offline_sensors / results.totals.total_sensors;
      score -= offlineRatio * 30;
    }
    
    // Penaliza alertas ativos
    score -= Math.min(results.totals.active_alerts * 5, 30);
    
    // Penaliza sistemas com erro
    Object.values(results.systems).forEach(sys => {
      if (sys.status === 'error') score -= 10;
    });
    
    return Math.max(Math.round(score), 0);
  },


  /**
   * Obtém resumo rápido para widgets
   */
  getQuickSummary: function() {
    try {
      const status = this.getConsolidatedStatus();
      if (!status.success) return status;
      
      return {
        success: true,
        timestamp: status.timestamp,
        health_score: status.health_score,
        sensors: {
          total: status.totals.total_sensors,
          online: status.totals.online_sensors,
          offline: status.totals.offline_sensors
        },
        alerts_count: status.totals.active_alerts,
        quick_stats: {
          air_quality: status.systems.air_quality?.main_metric?.value || null,
          soil_moisture: status.systems.soil_moisture?.main_metric?.value || null,
          temperature: status.systems.weather?.main_metric?.value || null,
          water_level: status.systems.water_level?.main_metric?.value || null
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém todos os alertas ativos
   */
  getAllAlerts: function() {
    try {
      const status = this.getConsolidatedStatus();
      if (!status.success) return status;
      
      // Ordena por severidade
      const severityOrder = { 'urgent': 0, 'critical': 1, 'high': 2, 'medium': 3, 'low': 4 };
      const sortedAlerts = status.alerts.sort((a, b) => {
        return (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5);
      });
      
      return {
        success: true,
        total_alerts: sortedAlerts.length,
        alerts: sortedAlerts,
        by_system: {
          air_quality: sortedAlerts.filter(a => a.system === 'Qualidade do Ar').length,
          soil_moisture: sortedAlerts.filter(a => a.system === 'Umidade do Solo').length,
          weather: sortedAlerts.filter(a => a.system === 'Meteorologia').length,
          water_level: sortedAlerts.filter(a => a.system === 'Nível de Água').length
        },
        by_severity: {
          urgent: sortedAlerts.filter(a => a.severity === 'urgent').length,
          high: sortedAlerts.filter(a => a.severity === 'high').length,
          medium: sortedAlerts.filter(a => a.severity === 'medium').length,
          low: sortedAlerts.filter(a => a.severity === 'low').length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Análise de correlações entre sistemas
   */
  analyzeCorrelations: function() {
    try {
      const status = this.getConsolidatedStatus();
      if (!status.success) return status;
      
      const correlations = [];
      const recommendations = [];
      
      // Correlação: Chuva → Umidade do Solo
      const weather = status.systems.weather;
      const soil = status.systems.soil_moisture;
      
      if (weather && soil && weather.secondary_metrics?.chuva_24h > 10) {
        if (soil.needs_irrigation > 0) {
          correlations.push({
            type: 'rain_soil',
            description: 'Chuva recente detectada, mas solo ainda precisa irrigação',
            systems: ['Meteorologia', 'Umidade do Solo'],
            action: 'Verificar se chuva foi suficiente ou se há problemas de infiltração'
          });
        }
      }
      
      // Correlação: Chuva → Nível de Água
      const water = status.systems.water_level;
      if (weather && water && weather.secondary_metrics?.chuva_24h > 20) {
        if (water.flood_count > 0) {
          correlations.push({
            type: 'rain_flood',
            description: 'Chuva intensa correlacionada com risco de enchente',
            systems: ['Meteorologia', 'Nível de Água'],
            action: 'Monitorar níveis e preparar medidas de contenção'
          });
        }
      }
      
      // Correlação: Temperatura alta → Qualidade do Ar
      const air = status.systems.air_quality;
      if (weather && air && weather.main_metric?.value > 35) {
        if (air.main_metric?.value > 100) {
          correlations.push({
            type: 'heat_air',
            description: 'Temperatura alta pode estar afetando qualidade do ar',
            systems: ['Meteorologia', 'Qualidade do Ar'],
            action: 'Evitar atividades ao ar livre nas horas mais quentes'
          });
        }
      }
      
      // Correlação: Seca → Nível de Água baixo
      if (soil && water) {
        if (soil.main_metric?.status === 'critical' && water.critical_count > 0) {
          correlations.push({
            type: 'drought',
            description: 'Condições de seca detectadas em solo e corpos d\'água',
            systems: ['Umidade do Solo', 'Nível de Água'],
            action: 'Implementar medidas de conservação de água'
          });
        }
      }
      
      // Gera recomendações baseadas nas correlações
      if (correlations.length > 0) {
        recommendations.push({
          priority: 'high',
          message: `${correlations.length} correlação(ões) identificada(s) entre sistemas`,
          action: 'Revisar alertas e tomar ações preventivas'
        });
      }
      
      // Recomendação de irrigação
      if (soil && soil.needs_irrigation > 0 && weather) {
        const rainForecast = weather.forecast?.chuva_percent || 0;
        if (rainForecast < 30) {
          recommendations.push({
            priority: 'medium',
            message: `${soil.needs_irrigation} sensor(es) precisam irrigação e baixa chance de chuva`,
            action: 'Programar irrigação para as próximas horas'
          });
        } else {
          recommendations.push({
            priority: 'low',
            message: `Irrigação pode ser adiada - ${rainForecast}% chance de chuva`,
            action: 'Aguardar possível precipitação'
          });
        }
      }
      
      return {
        success: true,
        correlations: correlations,
        recommendations: recommendations,
        analysis_timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém histórico consolidado
   */
  getConsolidatedHistory: function(days = 7) {
    try {
      const history = {
        period_days: days,
        systems: {}
      };
      
      // Histórico de cada sistema
      try {
        const airTrends = typeof apiQualidadeArTendencias === 'function' ? apiQualidadeArTendencias(null, days) : null;
        if (airTrends && airTrends.success) {
          history.systems.air_quality = {
            avg: airTrends.trends?.iqa?.avg,
            trend: airTrends.trends?.iqa?.trend,
            readings: airTrends.total_readings
          };
        }
      } catch (e) {}
      
      try {
        const soilTrends = typeof apiUmidadeSoloTendencias === 'function' ? apiUmidadeSoloTendencias(null, days) : null;
        if (soilTrends && soilTrends.success) {
          history.systems.soil_moisture = {
            avg: soilTrends.trends?.moisture?.avg,
            trend: soilTrends.trends?.moisture?.trend,
            irrigation_days: soilTrends.irrigation_days
          };
        }
      } catch (e) {}
      
      try {
        const weatherStats = typeof apiMeteoEstatisticas === 'function' ? apiMeteoEstatisticas(days) : null;
        if (weatherStats && weatherStats.success) {
          history.systems.weather = {
            temp_avg: weatherStats.temperatura?.media,
            rain_total: weatherStats.chuva?.total_periodo,
            readings: weatherStats.total_readings
          };
        }
      } catch (e) {}
      
      try {
        const waterTrends = typeof apiNivelAguaTendencias === 'function' ? apiNivelAguaTendencias(null, days) : null;
        if (waterTrends && waterTrends.success) {
          history.systems.water_level = {
            avg: waterTrends.nivel?.media,
            trend: waterTrends.nivel?.tendencia,
            critical_days: waterTrends.dias_criticos
          };
        }
      } catch (e) {}
      
      return { success: true, ...history };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Dashboard IoT Consolidado
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém status consolidado de todos os sistemas IoT
 */
function apiIoTStatus() {
  return IoTConsolidated.getConsolidatedStatus();
}

/**
 * Obtém resumo rápido para widgets
 */
function apiIoTResumo() {
  return IoTConsolidated.getQuickSummary();
}

/**
 * Obtém todos os alertas ativos
 */
function apiIoTAlertas() {
  return IoTConsolidated.getAllAlerts();
}

/**
 * Análise de correlações entre sistemas
 */
function apiIoTCorrelacoes() {
  return IoTConsolidated.analyzeCorrelations();
}

/**
 * Obtém histórico consolidado
 * @param {number} days - Dias de histórico
 */
function apiIoTHistorico(days) {
  return IoTConsolidated.getConsolidatedHistory(days || 7);
}
