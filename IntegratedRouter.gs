/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - Integrated API Router (Auto-generated)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Main router for all integrated services
 */
function routeIntegratedRequest(action, params) {
  try {
    let result;

    switch(action) {
      case "BiodiversityService._getSheetRows":
        result = BiodiversityService._getSheetRows(params.sheetName);
        break;

      case "BiodiversityService.getObservations":
        result = BiodiversityService.getObservations(params.areaId);
        break;

      case "BiodiversityService.getSpeciesCounts":
        result = BiodiversityService.getSpeciesCounts(params.areaId);
        break;

      case "BiodiversityService.calculateShannonIndex":
        result = BiodiversityService.calculateShannonIndex(params.areaId);
        break;

      case "BiodiversityService.calculateSimpsonIndex":
        result = BiodiversityService.calculateSimpsonIndex(params.areaId);
        break;

      case "BiodiversityService.calculateBiodiversityCredits":
        result = BiodiversityService.calculateBiodiversityCredits(params.areaId);
        break;

      case "BiodiversityService._assessBiodiversityTrend":
        result = BiodiversityService._assessBiodiversityTrend(params.areaId);
        break;

      case "BiodiversityService._identifyKeySpecies":
        result = BiodiversityService._identifyKeySpecies(params.counts);
        break;

      case "BiodiversityService._assessEcosystemServices":
        result = BiodiversityService._assessEcosystemServices(params.shannon, params.simpson);
        break;

      case "BiodiversityService._mapToGBFTargets":
        result = BiodiversityService._mapToGBFTargets(params.score);
        break;

      case "BiodiversityService.addObservation":
        result = BiodiversityService.addObservation(params.obs);
        break;

      case "EnvironmentalService._avgNormalized":
        result = EnvironmentalService._avgNormalized(params.rows, params.fields);
        break;

      case "StatisticsService.getGeneralStatistics":
        result = StatisticsService.getGeneralStatistics();
        break;

      case "StatisticsService.getChartData":
        result = StatisticsService.getChartData(params.chartType);
        break;

      case "StatisticsService._getPlantsByFamily":
        result = StatisticsService._getPlantsByFamily();
        break;

      case "StatisticsService._readSheet":
        result = StatisticsService._readSheet(params.sheetName);
        break;

      case "StatisticsService.getCountBySheet":
        result = StatisticsService.getCountBySheet(params.sheetName);
        break;

      case "StatisticsService.summarizeByField":
        result = StatisticsService.summarizeByField(params.sheetName, params.fieldName);
        break;

      case "StatisticsService.generateTimeSeries":
        result = StatisticsService.generateTimeSeries(params.sheetName, params.dateField, params.valueField, params.startDate, params.endDate);
        break;

      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return result;
  } catch (error) {
    Logger.log("Router error: " + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * List all available endpoints
 */
function listIntegratedEndpoints() {
  return {
    success: true,
    endpoints: [
      "BiodiversityService._getSheetRows",
      "BiodiversityService.getObservations",
      "BiodiversityService.getSpeciesCounts",
      "BiodiversityService.calculateShannonIndex",
      "BiodiversityService.calculateSimpsonIndex",
      "BiodiversityService.calculateBiodiversityCredits",
      "BiodiversityService._assessBiodiversityTrend",
      "BiodiversityService._identifyKeySpecies",
      "BiodiversityService._assessEcosystemServices",
      "BiodiversityService._mapToGBFTargets",
      "BiodiversityService.addObservation",
      "EnvironmentalService._avgNormalized",
      "StatisticsService.getGeneralStatistics",
      "StatisticsService.getChartData",
      "StatisticsService._getPlantsByFamily",
      "StatisticsService._readSheet",
      "StatisticsService.getCountBySheet",
      "StatisticsService.summarizeByField",
      "StatisticsService.generateTimeSeries",
    ]
  };
}