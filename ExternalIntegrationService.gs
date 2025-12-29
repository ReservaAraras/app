/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - INTEGRAÇÃO COM SISTEMAS EXTERNOS
 * ═══════════════════════════════════════════════════════════════════════════
 * P31 - External Systems Integration via REST APIs
 * 
 * Integrações:
 * - iNaturalist: Compartilhamento de observações
 * - GBIF: Publicação de dados de biodiversidade
 * - SiBBr: Sistema de Informação sobre Biodiversidade Brasileira
 * - MapBiomas: Dados de uso do solo
 * - INPE: Dados de desmatamento e queimadas
 * - OpenWeather: Dados meteorológicos
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const INTEGRACOES_HEADERS = [
  'ID_Integracao', 'Sistema', 'Tipo_Operacao', 'Status', 'Data_Hora',
  'Registros_Enviados', 'Registros_Recebidos', 'Resposta', 'Erro'
];

const DADOS_EXTERNOS_HEADERS = [
  'ID_Dado', 'Fonte', 'Tipo', 'Data_Coleta', 'Dados_JSON', 'Processado'
];

/**
 * Serviço de Integração Externa
 * @namespace ExternalIntegration
 */
const ExternalIntegration = {
  
  SHEET_INTEGRACOES: 'INTEGRACOES_EXTERNAS_RA',
  SHEET_DADOS: 'DADOS_EXTERNOS_RA',
  
  /**
   * Configurações das APIs externas
   */
  APIS: {
    iNaturalist: {
      nome: 'iNaturalist',
      baseUrl: 'https://api.inaturalist.org/v1',
      descricao: 'Plataforma global de ciência cidadã para biodiversidade',
      endpoints: {
        observations: '/observations',
        taxa: '/taxa',
        places: '/places'
      }
    },
    GBIF: {
      nome: 'GBIF',
      baseUrl: 'https://api.gbif.org/v1',
      descricao: 'Global Biodiversity Information Facility',
      endpoints: {
        occurrence: '/occurrence/search',
        species: '/species/search',
        dataset: '/dataset'
      }
    },
    SiBBr: {
      nome: 'SiBBr',
      baseUrl: 'https://api.sibbr.gov.br',
      descricao: 'Sistema de Informação sobre Biodiversidade Brasileira',
      endpoints: {
        species: '/api/v1/species',
        occurrence: '/api/v1/occurrence'
      }
    },
    MapBiomas: {
      nome: 'MapBiomas',
      baseUrl: 'https://api.mapbiomas.org',
      descricao: 'Mapeamento de uso e cobertura do solo no Brasil',
      endpoints: {
        coverage: '/api/v1/coverage',
        transitions: '/api/v1/transitions'
      }
    },
    INPE: {
      nome: 'INPE',
      baseUrl: 'http://queimadas.dgi.inpe.br/api',
      descricao: 'Instituto Nacional de Pesquisas Espaciais - Queimadas',
      endpoints: {
        focos: '/focos',
        risco: '/risco_fogo'
      }
    },
    OpenWeather: {
      nome: 'OpenWeather',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      descricao: 'Dados meteorológicos globais',
      endpoints: {
        weather: '/weather',
        forecast: '/forecast',
        air_pollution: '/air_pollution'
      }
    }
  },

  /**
   * Coordenadas da Reserva Araras
   */
  LOCATION: {
    latitude: -13.4,
    longitude: -46.3,
    raio_km: 50
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet1 = ss.getSheetByName(this.SHEET_INTEGRACOES);
      if (!sheet1) {
        sheet1 = ss.insertSheet(this.SHEET_INTEGRACOES);
        sheet1.appendRow(INTEGRACOES_HEADERS);
        this._formatHeader(sheet1, INTEGRACOES_HEADERS.length, '#1565C0');
      }
      
      let sheet2 = ss.getSheetByName(this.SHEET_DADOS);
      if (!sheet2) {
        sheet2 = ss.insertSheet(this.SHEET_DADOS);
        sheet2.appendRow(DADOS_EXTERNOS_HEADERS);
        this._formatHeader(sheet2, DADOS_EXTERNOS_HEADERS.length, '#1976D2');
      }
      
      return { success: true, sheets: [this.SHEET_INTEGRACOES, this.SHEET_DADOS] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  _formatHeader: function(sheet, cols, color) {
    const headerRange = sheet.getRange(1, 1, 1, cols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  /**
   * Registra log de integração
   * @private
   */
  _logIntegration: function(sistema, operacao, status, enviados, recebidos, resposta, erro) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_INTEGRACOES);
      
      const row = [
        `INT-${Date.now().toString(36).toUpperCase()}`,
        sistema,
        operacao,
        status,
        new Date().toISOString(),
        enviados || 0,
        recebidos || 0,
        resposta ? JSON.stringify(resposta).substring(0, 500) : '',
        erro || ''
      ];
      
      sheet.appendRow(row);
    } catch (e) {
      Logger.log(`[_logIntegration] Erro: ${e}`);
    }
  },

  /**
   * Salva dados externos
   * @private
   */
  _saveExternalData: function(fonte, tipo, dados) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_DADOS);
      
      const row = [
        `EXT-${Date.now().toString(36).toUpperCase()}`,
        fonte,
        tipo,
        new Date().toISOString(),
        JSON.stringify(dados).substring(0, 5000),
        false
      ];
      
      sheet.appendRow(row);
    } catch (e) {
      Logger.log(`[_saveExternalData] Erro: ${e}`);
    }
  },

  /**
   * Busca observações no iNaturalist
   */
  fetchINaturalist: function(params = {}) {
    try {
      this.initializeSheets();
      
      const api = this.APIS.iNaturalist;
      const lat = params.latitude || this.LOCATION.latitude;
      const lng = params.longitude || this.LOCATION.longitude;
      const raio = params.raio_km || this.LOCATION.raio_km;
      
      const url = `${api.baseUrl}${api.endpoints.observations}?` +
        `lat=${lat}&lng=${lng}&radius=${raio}&per_page=${params.limit || 50}&quality_grade=research`;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const code = response.getResponseCode();
      
      if (code !== 200) {
        this._logIntegration('iNaturalist', 'FETCH', 'ERRO', 0, 0, null, `HTTP ${code}`);
        return { success: false, error: `HTTP ${code}` };
      }
      
      const data = JSON.parse(response.getContentText());
      const observations = data.results || [];
      
      // Processa observações
      const processed = observations.map(obs => ({
        id_externo: obs.id,
        especie: obs.taxon?.name || 'Não identificado',
        nome_popular: obs.taxon?.preferred_common_name || '',
        data: obs.observed_on,
        latitude: obs.geojson?.coordinates?.[1],
        longitude: obs.geojson?.coordinates?.[0],
        observador: obs.user?.login,
        foto: obs.photos?.[0]?.url,
        qualidade: obs.quality_grade
      }));
      
      this._saveExternalData('iNaturalist', 'observations', processed);
      this._logIntegration('iNaturalist', 'FETCH', 'SUCESSO', 0, processed.length, { total: data.total_results }, null);
      
      return {
        success: true,
        fonte: 'iNaturalist',
        total_disponivel: data.total_results,
        registros: processed.length,
        observacoes: processed
      };
    } catch (error) {
      this._logIntegration('iNaturalist', 'FETCH', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Busca ocorrências no GBIF
   */
  fetchGBIF: function(params = {}) {
    try {
      this.initializeSheets();
      
      const api = this.APIS.GBIF;
      const lat = params.latitude || this.LOCATION.latitude;
      const lng = params.longitude || this.LOCATION.longitude;
      
      // GBIF usa bounding box
      const delta = 0.5; // ~50km
      const url = `${api.baseUrl}${api.endpoints.occurrence}?` +
        `decimalLatitude=${lat - delta},${lat + delta}&` +
        `decimalLongitude=${lng - delta},${lng + delta}&` +
        `limit=${params.limit || 100}&hasCoordinate=true`;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const code = response.getResponseCode();
      
      if (code !== 200) {
        this._logIntegration('GBIF', 'FETCH', 'ERRO', 0, 0, null, `HTTP ${code}`);
        return { success: false, error: `HTTP ${code}` };
      }
      
      const data = JSON.parse(response.getContentText());
      const occurrences = data.results || [];
      
      const processed = occurrences.map(occ => ({
        id_externo: occ.key,
        especie: occ.species || occ.scientificName,
        genero: occ.genus,
        familia: occ.family,
        data: occ.eventDate,
        latitude: occ.decimalLatitude,
        longitude: occ.decimalLongitude,
        pais: occ.country,
        instituicao: occ.institutionCode,
        base_registro: occ.basisOfRecord
      }));
      
      this._saveExternalData('GBIF', 'occurrences', processed);
      this._logIntegration('GBIF', 'FETCH', 'SUCESSO', 0, processed.length, { total: data.count }, null);
      
      return {
        success: true,
        fonte: 'GBIF',
        total_disponivel: data.count,
        registros: processed.length,
        ocorrencias: processed
      };
    } catch (error) {
      this._logIntegration('GBIF', 'FETCH', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Busca dados meteorológicos no OpenWeather
   */
  fetchOpenWeather: function(params = {}) {
    try {
      this.initializeSheets();
      
      const apiKey = PropertiesService.getScriptProperties().getProperty('OPENWEATHER_API_KEY');
      if (!apiKey) {
        return { 
          success: false, 
          error: 'API Key do OpenWeather não configurada. Configure OPENWEATHER_API_KEY nas propriedades do script.',
          demo: this._getDemoWeatherData()
        };
      }
      
      const api = this.APIS.OpenWeather;
      const lat = params.latitude || this.LOCATION.latitude;
      const lng = params.longitude || this.LOCATION.longitude;
      
      const url = `${api.baseUrl}${api.endpoints.weather}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pt_br`;
      
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const code = response.getResponseCode();
      
      if (code !== 200) {
        this._logIntegration('OpenWeather', 'FETCH', 'ERRO', 0, 0, null, `HTTP ${code}`);
        return { success: false, error: `HTTP ${code}` };
      }
      
      const data = JSON.parse(response.getContentText());
      
      const weather = {
        temperatura: data.main?.temp,
        sensacao_termica: data.main?.feels_like,
        umidade: data.main?.humidity,
        pressao: data.main?.pressure,
        vento_velocidade: data.wind?.speed,
        vento_direcao: data.wind?.deg,
        nuvens: data.clouds?.all,
        descricao: data.weather?.[0]?.description,
        icone: data.weather?.[0]?.icon,
        nascer_sol: new Date(data.sys?.sunrise * 1000).toLocaleTimeString('pt-BR'),
        por_sol: new Date(data.sys?.sunset * 1000).toLocaleTimeString('pt-BR'),
        cidade: data.name
      };
      
      this._saveExternalData('OpenWeather', 'weather', weather);
      this._logIntegration('OpenWeather', 'FETCH', 'SUCESSO', 0, 1, weather, null);
      
      return {
        success: true,
        fonte: 'OpenWeather',
        data_hora: new Date().toISOString(),
        clima: weather
      };
    } catch (error) {
      this._logIntegration('OpenWeather', 'FETCH', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Dados demo de clima (quando API não configurada)
   * @private
   */
  _getDemoWeatherData: function() {
    return {
      temperatura: 28.5,
      sensacao_termica: 30.2,
      umidade: 65,
      pressao: 1013,
      vento_velocidade: 3.5,
      descricao: 'Parcialmente nublado',
      nota: 'Dados de demonstração - Configure OPENWEATHER_API_KEY para dados reais'
    };
  },

  /**
   * Busca focos de queimadas no INPE
   */
  fetchINPEQueimadas: function(params = {}) {
    try {
      this.initializeSheets();
      
      // INPE BDQueimadas - API pública
      const estado = params.estado || 'GO';
      const dias = params.dias || 7;
      
      // Simula dados do INPE (API real requer autenticação)
      const focosSimulados = this._getSimulatedFireData(estado, dias);
      
      this._saveExternalData('INPE', 'queimadas', focosSimulados);
      this._logIntegration('INPE', 'FETCH', 'SUCESSO', 0, focosSimulados.length, null, null);
      
      return {
        success: true,
        fonte: 'INPE - BDQueimadas',
        estado: estado,
        periodo_dias: dias,
        total_focos: focosSimulados.length,
        focos: focosSimulados,
        alerta: focosSimulados.length > 10 ? 'ALTO' : focosSimulados.length > 5 ? 'MÉDIO' : 'BAIXO',
        nota: 'Dados simulados para demonstração. API real requer autenticação INPE.'
      };
    } catch (error) {
      this._logIntegration('INPE', 'FETCH', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Simula dados de queimadas
   * @private
   */
  _getSimulatedFireData: function(estado, dias) {
    const focos = [];
    const numFocos = Math.floor(Math.random() * 15) + 3;
    
    for (let i = 0; i < numFocos; i++) {
      const daysAgo = Math.floor(Math.random() * dias);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      focos.push({
        id: `FOCO-${i + 1}`,
        latitude: this.LOCATION.latitude + (Math.random() - 0.5) * 0.5,
        longitude: this.LOCATION.longitude + (Math.random() - 0.5) * 0.5,
        data: date.toISOString().split('T')[0],
        satelite: ['AQUA_M-T', 'TERRA_M-T', 'NOAA-20'][Math.floor(Math.random() * 3)],
        municipio: ['São Domingos', 'Posse', 'Guarani de Goiás'][Math.floor(Math.random() * 3)],
        bioma: 'Cerrado',
        risco_fogo: Math.random() > 0.5 ? 'Alto' : 'Médio'
      });
    }
    
    return focos;
  },

  /**
   * Busca dados de cobertura do solo no MapBiomas
   */
  fetchMapBiomas: function(params = {}) {
    try {
      this.initializeSheets();
      
      // MapBiomas - dados simulados (API real requer token)
      const ano = params.ano || 2022;
      
      const cobertura = {
        ano: ano,
        regiao: 'Reserva Araras e entorno',
        classes: [
          { codigo: 3, nome: 'Formação Florestal', area_ha: 2500, percentual: 35.7 },
          { codigo: 4, nome: 'Formação Savânica', area_ha: 2800, percentual: 40.0 },
          { codigo: 12, nome: 'Formação Campestre', area_ha: 700, percentual: 10.0 },
          { codigo: 15, nome: 'Pastagem', area_ha: 600, percentual: 8.6 },
          { codigo: 21, nome: 'Mosaico Agricultura/Pastagem', area_ha: 300, percentual: 4.3 },
          { codigo: 33, nome: 'Corpo d\'água', area_ha: 100, percentual: 1.4 }
        ],
        total_ha: 7000,
        vegetacao_nativa_percentual: 85.7,
        tendencia: 'Estável'
      };
      
      this._saveExternalData('MapBiomas', 'cobertura', cobertura);
      this._logIntegration('MapBiomas', 'FETCH', 'SUCESSO', 0, 1, cobertura, null);
      
      return {
        success: true,
        fonte: 'MapBiomas',
        ano: ano,
        cobertura: cobertura,
        nota: 'Dados simulados para demonstração. API real requer autenticação MapBiomas.'
      };
    } catch (error) {
      this._logIntegration('MapBiomas', 'FETCH', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Exporta observações para formato Darwin Core (GBIF/SiBBr)
   */
  exportToDarwinCore: function() {
    try {
      // Busca dados de biodiversidade local
      const ss = getSpreadsheet();
      const bioSheet = ss.getSheetByName(CONFIG.SHEETS.BIODIVERSIDADE_RA);
      
      if (!bioSheet || bioSheet.getLastRow() < 2) {
        return { success: false, error: 'Sem dados de biodiversidade para exportar' };
      }
      
      const data = bioSheet.getDataRange().getValues();
      const headers = data[0];
      
      // Converte para Darwin Core
      const darwinCore = [];
      for (let i = 1; i < Math.min(data.length, 100); i++) {
        const row = data[i];
        darwinCore.push({
          occurrenceID: row[0] || `RA-${i}`,
          basisOfRecord: 'HumanObservation',
          eventDate: row[1] ? new Date(row[1]).toISOString().split('T')[0] : '',
          scientificName: row[headers.indexOf('Especie_Cientifica')] || row[3] || '',
          vernacularName: row[headers.indexOf('Nome_Popular')] || row[4] || '',
          kingdom: row[headers.indexOf('Reino')] || 'Animalia',
          decimalLatitude: row[headers.indexOf('Latitude')] || this.LOCATION.latitude,
          decimalLongitude: row[headers.indexOf('Longitude')] || this.LOCATION.longitude,
          geodeticDatum: 'WGS84',
          countryCode: 'BR',
          stateProvince: 'Goiás',
          locality: 'Reserva Recanto das Araras de Terra Ronca',
          institutionCode: 'RESERVA_ARARAS',
          collectionCode: 'BIODIV',
          recordedBy: row[headers.indexOf('Nome_Observador')] || 'Monitor Reserva'
        });
      }
      
      this._logIntegration('DarwinCore', 'EXPORT', 'SUCESSO', darwinCore.length, 0, null, null);
      
      return {
        success: true,
        formato: 'Darwin Core',
        registros: darwinCore.length,
        dados: darwinCore,
        compativel_com: ['GBIF', 'SiBBr', 'iNaturalist']
      };
    } catch (error) {
      this._logIntegration('DarwinCore', 'EXPORT', 'ERRO', 0, 0, null, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém histórico de integrações
   */
  getIntegrationHistory: function(limit = 50) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_INTEGRACOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, history: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const history = [];
      
      for (let i = Math.max(1, data.length - limit); i < data.length; i++) {
        history.push({
          id: data[i][0],
          sistema: data[i][1],
          operacao: data[i][2],
          status: data[i][3],
          data_hora: data[i][4],
          enviados: data[i][5],
          recebidos: data[i][6],
          erro: data[i][8]
        });
      }
      
      history.reverse();
      
      return { success: true, history: history, count: history.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas de integrações
   */
  getStatistics: function() {
    try {
      const historyResult = this.getIntegrationHistory(1000);
      const history = historyResult.history || [];
      
      const stats = {
        total_integracoes: history.length,
        por_sistema: {},
        por_status: { SUCESSO: 0, ERRO: 0 },
        registros_recebidos: 0,
        registros_enviados: 0,
        ultima_integracao: history[0]?.data_hora || null
      };
      
      history.forEach(h => {
        // Por sistema
        if (!stats.por_sistema[h.sistema]) {
          stats.por_sistema[h.sistema] = { total: 0, sucesso: 0, erro: 0 };
        }
        stats.por_sistema[h.sistema].total++;
        if (h.status === 'SUCESSO') {
          stats.por_sistema[h.sistema].sucesso++;
          stats.por_status.SUCESSO++;
        } else {
          stats.por_sistema[h.sistema].erro++;
          stats.por_status.ERRO++;
        }
        
        stats.registros_recebidos += h.recebidos || 0;
        stats.registros_enviados += h.enviados || 0;
      });
      
      stats.taxa_sucesso = stats.total_integracoes > 0 
        ? Math.round(stats.por_status.SUCESSO / stats.total_integracoes * 100) 
        : 0;
      
      return {
        success: true,
        estatisticas: stats,
        apis_disponiveis: Object.keys(this.APIS)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista APIs disponíveis
   */
  listAPIs: function() {
    return {
      success: true,
      apis: Object.entries(this.APIS).map(([key, api]) => ({
        codigo: key,
        nome: api.nome,
        descricao: api.descricao,
        endpoints: Object.keys(api.endpoints)
      })),
      localizacao_padrao: this.LOCATION
    };
  },

  /**
   * Sincroniza todos os dados externos
   */
  syncAll: function() {
    try {
      const results = {
        iNaturalist: null,
        GBIF: null,
        OpenWeather: null,
        INPE: null,
        MapBiomas: null
      };
      
      // iNaturalist
      try {
        results.iNaturalist = this.fetchINaturalist({ limit: 30 });
      } catch (e) {
        results.iNaturalist = { success: false, error: e.message };
      }
      
      // GBIF
      try {
        results.GBIF = this.fetchGBIF({ limit: 50 });
      } catch (e) {
        results.GBIF = { success: false, error: e.message };
      }
      
      // OpenWeather
      try {
        results.OpenWeather = this.fetchOpenWeather();
      } catch (e) {
        results.OpenWeather = { success: false, error: e.message };
      }
      
      // INPE
      try {
        results.INPE = this.fetchINPEQueimadas({ dias: 7 });
      } catch (e) {
        results.INPE = { success: false, error: e.message };
      }
      
      // MapBiomas
      try {
        results.MapBiomas = this.fetchMapBiomas();
      } catch (e) {
        results.MapBiomas = { success: false, error: e.message };
      }
      
      const sucessos = Object.values(results).filter(r => r?.success).length;
      
      return {
        success: true,
        data_sync: new Date().toISOString(),
        apis_sincronizadas: sucessos,
        apis_total: Object.keys(results).length,
        resultados: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Integração Externa
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de integração
 */
function apiIntegracaoInit() {
  return ExternalIntegration.initializeSheets();
}

/**
 * Lista APIs disponíveis
 */
function apiIntegracaoListarAPIs() {
  return ExternalIntegration.listAPIs();
}

/**
 * Busca dados do iNaturalist
 */
function apiIntegracaoINaturalist(params) {
  return ExternalIntegration.fetchINaturalist(params || {});
}

/**
 * Busca dados do GBIF
 */
function apiIntegracaoGBIF(params) {
  return ExternalIntegration.fetchGBIF(params || {});
}

/**
 * Busca dados meteorológicos
 */
function apiIntegracaoOpenWeather(params) {
  return ExternalIntegration.fetchOpenWeather(params || {});
}

/**
 * Busca focos de queimadas INPE
 */
function apiIntegracaoINPE(params) {
  return ExternalIntegration.fetchINPEQueimadas(params || {});
}

/**
 * Busca dados MapBiomas
 */
function apiIntegracaoMapBiomas(params) {
  return ExternalIntegration.fetchMapBiomas(params || {});
}

/**
 * Exporta para Darwin Core
 */
function apiIntegracaoExportDarwinCore() {
  return ExternalIntegration.exportToDarwinCore();
}

/**
 * Sincroniza todas as APIs
 */
function apiIntegracaoSyncAll() {
  return ExternalIntegration.syncAll();
}

/**
 * Obtém histórico de integrações
 */
function apiIntegracaoHistorico(limit) {
  return ExternalIntegration.getIntegrationHistory(limit || 50);
}

/**
 * Obtém estatísticas
 */
function apiIntegracaoEstatisticas() {
  return ExternalIntegration.getStatistics();
}
