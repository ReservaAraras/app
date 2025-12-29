/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATISTICS SERVICE - Serviço de Estatísticas e Análises
 * ═══════════════════════════════════════════════════════════════════════════
 * @enterprise-grade Sistema de estatísticas global acessível entre arquivos
 */

var StatisticsService = {

  /**
   * Obtém estatísticas gerais de todas as planilhas
   * @returns {Object} Estatísticas por planilha
   */
  getGeneralStatistics() {
    try {
      const stats = {};
      const sheets = Object.values(CONFIG.SHEETS);
      for (let i = 0; i < sheets.length; i++) {
        const sheetName = sheets[i];
        const result = DatabaseService.read(sheetName);
        if (result.success) {
          stats[sheetName] = result.data.length;
        }
      }
      return { success: true, data: stats };
    } catch (error) {
      Utils.logError('StatisticsService.getGeneralStatistics', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém dados para gráficos
   * @param {string} chartType - Tipo de gráfico
   * @returns {Object} Dados formatados para gráfico
   */
  getChartData(chartType) {
    try {
      switch (chartType) {
        case 'plantas_por_familia':
          return this._getPlantsByFamily();
        default:
          return { success: false, error: 'Tipo de gráfico não suportado.' };
      }
    } catch (error) {
      Utils.logError('StatisticsService.getChartData', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém plantas agrupadas por família
   * @private
   */
  _getPlantsByFamily() {
    const result = DatabaseService.read(CONFIG.SHEETS.PLANTAS_MEDICINAIS);
    if (!result.success) {
      return result;
    }

    const byFamily = {};
    result.data.forEach(planta => {
      const familia = planta.Familia || 'Desconhecida';
      byFamily[familia] = (byFamily[familia] || 0) + 1;
    });

    return {
      success: true,
      data: {
        labels: Object.keys(byFamily),
        datasets: [{
          data: Object.values(byFamily)
        }]
      }
    };
  },

  /**
   * Lê planilha e retorna objetos
   * @private
   */
  _readSheet(sheetName) {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(sheetName);
    if (!sh) return { headers: [], rows: [] };
    const data = sh.getDataRange().getValues();
    const headers = data.length ? data[0] : [];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      rows.push(obj);
    }
    return { headers: headers, rows: rows };
  },

  /**
   * Conta registros em uma planilha
   * @param {string} sheetName - Nome da planilha
   * @returns {number} Quantidade de registros
   */
  getCountBySheet(sheetName) {
    const d = this._readSheet(sheetName);
    return d.rows.length;
  },

  /**
   * Sumariza dados por campo
   * @param {string} sheetName - Nome da planilha
   * @param {string} fieldName - Nome do campo
   * @returns {Object} Agregação por valor do campo
   */
  summarizeByField(sheetName, fieldName) {
    const d = this._readSheet(sheetName);
    const agg = {};
    d.rows.forEach(r => {
      const key = r[fieldName] || 'Unknown';
      agg[key] = (agg[key] || 0) + 1;
    });
    return agg;
  },

  /**
   * Gera série temporal
   * @param {string} sheetName - Nome da planilha
   * @param {string} dateField - Campo de data
   * @param {string} valueField - Campo de valor
   * @param {Date} startDate - Data inicial (opcional)
   * @param {Date} endDate - Data final (opcional)
   * @returns {Array} Série temporal
   */
  generateTimeSeries(sheetName, dateField, valueField, startDate, endDate) {
    const d = this._readSheet(sheetName);
    const series = {};
    d.rows.forEach(r => {
      const dt = r[dateField];
      if (!dt) return;
      const dateObj = (dt instanceof Date) ? dt : new Date(dt);
      if (startDate && dateObj < startDate) return;
      if (endDate && dateObj > endDate) return;
      const key = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const val = Number(r[valueField]) || 0;
      series[key] = (series[key] || 0) + val;
    });
    const keys = Object.keys(series).sort();
    return keys.map(k => {
      return { date: k, value: series[k] };
    });
  }
};
