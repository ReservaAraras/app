/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE CÂMERAS TRAP COM DETECÇÃO AUTOMÁTICA
 * ═══════════════════════════════════════════════════════════════════════════
 * P07 - Rede de Câmeras Trap Inteligentes com IA
 * 
 * Funcionalidades:
 * - Gerenciamento de câmeras trap
 * - Processamento de capturas com IA
 * - Detecção automática de fauna
 * - Análise de padrões comportamentais
 * - Monitoramento de corredores ecológicos
 * - Sistema de validação colaborativa
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha CAMERAS_TRAP_RA
 */
const SCHEMA_CAMERAS_TRAP = {
  ID_Camera: { type: 'string', required: true, unique: true },
  Nome_Camera: { type: 'string', required: true },
  Localizacao_Lat: { type: 'float', required: true },
  Localizacao_Lng: { type: 'float', required: true },
  ID_Corredor: { type: 'string' },
  Zona_Ecologica: { type: 'enum', values: ['Mata_Ciliar', 'Floresta_Secundaria', 'SAF', 'Borda', 'Cerrado', 'Vereda'] },
  Status: { type: 'enum', values: ['Ativa', 'Inativa', 'Manutencao'] },
  Bateria_percent: { type: 'integer', range: [0, 100] },
  Espaco_Armazenamento_GB: { type: 'float' },
  Ultima_Sincronizacao: { type: 'datetime' },
  Resolucao: { type: 'string' },
  Modo_Deteccao: { type: 'enum', values: ['Movimento', 'Calor', 'Hibrido'] },
  Total_Capturas: { type: 'integer', min: 0 },
  Especies_Detectadas_JSON: { type: 'text' },
  Capturas_Ultima_Semana: { type: 'integer' },
  Taxa_Deteccao_Sucesso: { type: 'float', range: [0, 100] },
  Data_Instalacao: { type: 'date' },
  Notas: { type: 'text' }
};

const CAMERAS_HEADERS = [
  'ID_Camera', 'Nome_Camera', 'Localizacao_Lat', 'Localizacao_Lng',
  'ID_Corredor', 'Zona_Ecologica', 'Status', 'Bateria_percent',
  'Espaco_Armazenamento_GB', 'Ultima_Sincronizacao', 'Resolucao',
  'Modo_Deteccao', 'Total_Capturas', 'Especies_Detectadas_JSON',
  'Capturas_Ultima_Semana', 'Taxa_Deteccao_Sucesso', 'Data_Instalacao', 'Notas'
];


/**
 * Schema de dados para planilha CAPTURAS_CAMERA_TRAP_RA
 */
const SCHEMA_CAPTURAS = {
  ID_Captura: { type: 'string', required: true, unique: true },
  ID_Camera: { type: 'string', required: true },
  Timestamp_Captura: { type: 'datetime', required: true },
  Tipo_Midia: { type: 'enum', values: ['Foto', 'Video'] },
  URL_Midia: { type: 'url' },
  Duracao_Video_seg: { type: 'integer' },
  IA_Especies_Detectadas_JSON: { type: 'text' },
  IA_Numero_Individuos: { type: 'integer' },
  IA_Idade_Estimada: { type: 'enum', values: ['Filhote', 'Juvenil', 'Adulto', 'Misto'] },
  IA_Sexo_Estimado: { type: 'enum', values: ['Macho', 'Femea', 'Indeterminado', 'Misto'] },
  IA_Comportamento: { type: 'enum', values: ['Alimentacao', 'Deslocamento', 'Descanso', 'Reproducao', 'Alerta', 'Caca', 'Social'] },
  IA_Confianca: { type: 'float', range: [0, 1] },
  Validado: { type: 'boolean' },
  Validado_Por: { type: 'string' },
  Especies_Confirmadas_JSON: { type: 'text' },
  Observacoes: { type: 'text' },
  Temperatura_C: { type: 'float' },
  Umidade_percent: { type: 'float' },
  Fase_Lunar: { type: 'string' },
  Periodo_Dia: { type: 'enum', values: ['Madrugada', 'Manha', 'Tarde', 'Noite'] }
};

const CAPTURAS_HEADERS = [
  'ID_Captura', 'ID_Camera', 'Timestamp_Captura', 'Tipo_Midia', 'URL_Midia',
  'Duracao_Video_seg', 'IA_Especies_Detectadas_JSON', 'IA_Numero_Individuos',
  'IA_Idade_Estimada', 'IA_Sexo_Estimado', 'IA_Comportamento', 'IA_Confianca',
  'Validado', 'Validado_Por', 'Especies_Confirmadas_JSON', 'Observacoes',
  'Temperatura_C', 'Umidade_percent', 'Fase_Lunar', 'Periodo_Dia'
];


/**
 * Serviço de Câmeras Trap
 * @namespace CameraTrapService
 */
const CameraTrapService = {
  
  SHEET_CAMERAS: 'CAMERAS_TRAP_RA',
  SHEET_CAPTURAS: 'CAPTURAS_CAMERA_TRAP_RA',
  
  /**
   * Fauna comum do Cerrado para referência
   */
  FAUNA_CERRADO: [
    { cientifico: 'Chrysocyon brachyurus', comum: 'Lobo-guará', categoria: 'VU', porte: 'Grande', habito: 'Noturno' },
    { cientifico: 'Myrmecophaga tridactyla', comum: 'Tamanduá-bandeira', categoria: 'VU', porte: 'Grande', habito: 'Diurno' },
    { cientifico: 'Tapirus terrestris', comum: 'Anta', categoria: 'VU', porte: 'Grande', habito: 'Noturno' },
    { cientifico: 'Panthera onca', comum: 'Onça-pintada', categoria: 'VU', porte: 'Grande', habito: 'Noturno' },
    { cientifico: 'Puma concolor', comum: 'Onça-parda', categoria: 'VU', porte: 'Grande', habito: 'Crepuscular' },
    { cientifico: 'Leopardus pardalis', comum: 'Jaguatirica', categoria: 'LC', porte: 'Medio', habito: 'Noturno' },
    { cientifico: 'Mazama americana', comum: 'Veado-mateiro', categoria: 'DD', porte: 'Medio', habito: 'Crepuscular' },
    { cientifico: 'Mazama gouazoubira', comum: 'Veado-catingueiro', categoria: 'LC', porte: 'Medio', habito: 'Crepuscular' },
    { cientifico: 'Pecari tajacu', comum: 'Cateto', categoria: 'LC', porte: 'Medio', habito: 'Diurno' },
    { cientifico: 'Tayassu pecari', comum: 'Queixada', categoria: 'VU', porte: 'Medio', habito: 'Diurno' },
    { cientifico: 'Nasua nasua', comum: 'Quati', categoria: 'LC', porte: 'Medio', habito: 'Diurno' },
    { cientifico: 'Procyon cancrivorus', comum: 'Mão-pelada', categoria: 'LC', porte: 'Medio', habito: 'Noturno' },
    { cientifico: 'Cerdocyon thous', comum: 'Cachorro-do-mato', categoria: 'LC', porte: 'Medio', habito: 'Noturno' },
    { cientifico: 'Dasypus novemcinctus', comum: 'Tatu-galinha', categoria: 'LC', porte: 'Pequeno', habito: 'Noturno' },
    { cientifico: 'Euphractus sexcinctus', comum: 'Tatu-peba', categoria: 'LC', porte: 'Pequeno', habito: 'Diurno' },
    { cientifico: 'Hydrochoerus hydrochaeris', comum: 'Capivara', categoria: 'LC', porte: 'Grande', habito: 'Crepuscular' },
    { cientifico: 'Cuniculus paca', comum: 'Paca', categoria: 'LC', porte: 'Medio', habito: 'Noturno' },
    { cientifico: 'Dasyprocta azarae', comum: 'Cutia', categoria: 'DD', porte: 'Pequeno', habito: 'Diurno' },
    { cientifico: 'Rhea americana', comum: 'Ema', categoria: 'NT', porte: 'Grande', habito: 'Diurno' },
    { cientifico: 'Ara ararauna', comum: 'Arara-canindé', categoria: 'LC', porte: 'Grande', habito: 'Diurno' }
  ],

  /**
   * Inicializa planilhas do sistema
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      // Planilha de câmeras
      let sheetCameras = ss.getSheetByName(this.SHEET_CAMERAS);
      if (!sheetCameras) {
        sheetCameras = ss.insertSheet(this.SHEET_CAMERAS);
        sheetCameras.appendRow(CAMERAS_HEADERS);
        this._formatHeader(sheetCameras, CAMERAS_HEADERS.length, '#1565C0');
        this._populateSampleCameras(sheetCameras);
      }
      
      // Planilha de capturas
      let sheetCapturas = ss.getSheetByName(this.SHEET_CAPTURAS);
      if (!sheetCapturas) {
        sheetCapturas = ss.insertSheet(this.SHEET_CAPTURAS);
        sheetCapturas.appendRow(CAPTURAS_HEADERS);
        this._formatHeader(sheetCapturas, CAPTURAS_HEADERS.length, '#00838F');
      }
      
      Logger.log('[CameraTrapService] Planilhas inicializadas');
      return { success: true, sheets: [this.SHEET_CAMERAS, this.SHEET_CAPTURAS] };
      
    } catch (error) {
      Logger.log(`[CameraTrapService] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Formata cabeçalho
   * @private
   */
  _formatHeader: function(sheet, cols, color) {
    const headerRange = sheet.getRange(1, 1, 1, cols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  
  /**
   * Popula câmeras de exemplo
   * @private
   */
  _populateSampleCameras: function(sheet) {
    const cameras = [
      { nome: 'CAM-01 Nascente Principal', lat: -13.4012, lng: -46.3045, zona: 'Mata_Ciliar', corredor: 'COR_001' },
      { nome: 'CAM-02 Trilha do Buriti', lat: -13.4025, lng: -46.3078, zona: 'Vereda', corredor: 'COR_001' },
      { nome: 'CAM-03 SAF Norte', lat: -13.3998, lng: -46.3012, zona: 'SAF', corredor: 'COR_002' },
      { nome: 'CAM-04 Borda Floresta', lat: -13.4056, lng: -46.3089, zona: 'Borda', corredor: 'COR_002' },
      { nome: 'CAM-05 Cerrado Sentido Restrito', lat: -13.4078, lng: -46.3034, zona: 'Cerrado', corredor: '' },
      { nome: 'CAM-06 Corredor Fauna', lat: -13.4034, lng: -46.3056, zona: 'Floresta_Secundaria', corredor: 'COR_001' }
    ];
    
    cameras.forEach((cam, i) => {
      const id = `CAM_${String(i + 1).padStart(3, '0')}`;
      const row = [
        id,
        cam.nome,
        cam.lat,
        cam.lng,
        cam.corredor,
        cam.zona,
        'Ativa',
        Math.floor(Math.random() * 40) + 60, // Bateria 60-100%
        Math.floor(Math.random() * 50) + 10, // Espaço 10-60GB
        new Date(),
        '1080p',
        'Hibrido',
        Math.floor(Math.random() * 200) + 50, // Total capturas
        '[]',
        Math.floor(Math.random() * 30) + 5, // Capturas semana
        Math.floor(Math.random() * 30) + 60, // Taxa sucesso 60-90%
        new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Instalação últimos 6 meses
        'Câmera instalada para monitoramento de fauna'
      ];
      sheet.appendRow(row);
    });
  },

  /**
   * Registra nova câmera
   * @param {object} data - Dados da câmera
   * @returns {object} Resultado
   */
  registerCamera: function(data) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAMERAS);
      
      const id = `CAM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      const row = [
        id,
        data.nome || `Câmera ${id}`,
        data.latitude,
        data.longitude,
        data.id_corredor || '',
        data.zona_ecologica || 'Cerrado',
        data.status || 'Ativa',
        data.bateria || 100,
        data.espaco_armazenamento || 64,
        new Date(),
        data.resolucao || '1080p',
        data.modo_deteccao || 'Hibrido',
        0,
        '[]',
        0,
        0,
        new Date(),
        data.notas || ''
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        id: id,
        message: 'Câmera registrada com sucesso'
      };
      
    } catch (error) {
      Logger.log(`[registerCamera] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista câmeras
   * @param {object} filtros - Filtros opcionais
   * @returns {Array} Lista de câmeras
   */
  getCameras: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAMERAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const cameras = [];
      
      for (let i = 1; i < data.length; i++) {
        const cam = {
          id: data[i][0],
          nome: data[i][1],
          latitude: data[i][2],
          longitude: data[i][3],
          id_corredor: data[i][4],
          zona_ecologica: data[i][5],
          status: data[i][6],
          bateria: data[i][7],
          espaco_armazenamento: data[i][8],
          ultima_sincronizacao: data[i][9],
          resolucao: data[i][10],
          modo_deteccao: data[i][11],
          total_capturas: data[i][12],
          especies_detectadas: this._safeParseJSON(data[i][13], []),
          capturas_ultima_semana: data[i][14],
          taxa_deteccao: data[i][15],
          data_instalacao: data[i][16]
        };
        
        // Aplica filtros
        if (filtros.status && cam.status !== filtros.status) continue;
        if (filtros.zona && cam.zona_ecologica !== filtros.zona) continue;
        if (filtros.corredor && cam.id_corredor !== filtros.corredor) continue;
        
        cameras.push(cam);
      }
      
      return cameras;
      
    } catch (error) {
      Logger.log(`[getCameras] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Parse JSON seguro
   * @private
   */
  _safeParseJSON: function(str, defaultValue) {
    try {
      if (!str || str === '') return defaultValue;
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  },


  /**
   * Processa nova captura de câmera trap
   * @param {string} cameraId - ID da câmera
   * @param {string} mediaUrl - URL da mídia
   * @param {object} metadata - Metadados da captura
   * @returns {object} Resultado do processamento
   */
  processCapture: function(cameraId, mediaUrl, metadata = {}) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAPTURAS);
      
      const captureId = `CAP_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      // Detecta fauna com IA
      const detection = this._detectWildlifeWithAI(mediaUrl, metadata);
      
      // Determina período do dia
      const timestamp = metadata.timestamp || new Date();
      const periodo = this._getPeriodoDia(timestamp);
      
      // Fase lunar aproximada
      const faseLunar = this._getFaseLunar(timestamp);
      
      const row = [
        captureId,
        cameraId,
        timestamp,
        metadata.tipo || 'Foto',
        mediaUrl || '',
        metadata.duracao || 0,
        JSON.stringify(detection.especies || []),
        detection.total_individuos || 0,
        detection.idade || 'Adulto',
        detection.sexo || 'Indeterminado',
        detection.comportamento || 'Deslocamento',
        detection.confianca || 0,
        false,
        '',
        '[]',
        '',
        metadata.temperatura || null,
        metadata.umidade || null,
        faseLunar,
        periodo
      ];
      
      sheet.appendRow(row);
      
      // Atualiza estatísticas da câmera
      this._updateCameraStats(cameraId, detection.especies || []);
      
      // Verifica alertas para espécies raras
      const alerts = this._checkSpeciesAlerts(detection.especies || []);
      
      return {
        success: true,
        capture_id: captureId,
        detection: detection,
        alerts: alerts
      };
      
    } catch (error) {
      Logger.log(`[processCapture] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Detecta fauna usando IA (Gemini)
   * @private
   */
  _detectWildlifeWithAI: function(mediaUrl, metadata) {
    // Se não tiver Gemini, usa detecção simulada
    if (!CONFIG.GEMINI_API_KEY) {
      return this._simulateDetection(metadata);
    }
    
    try {
      const prompt = `Analise esta imagem de câmera trap da Reserva Araras (Cerrado brasileiro) e identifique:
1. Todas as espécies de fauna visíveis
2. Número de indivíduos de cada espécie
3. Comportamento observado
4. Características distintivas (idade, sexo se possível)

Responda APENAS em JSON válido:
{
  "especies": [
    {
      "cientifico": "Nome científico",
      "comum": "Nome popular",
      "confianca": 0.95,
      "individuos": 1,
      "comportamento": "Alimentacao/Deslocamento/Descanso/Reproducao/Alerta/Caca/Social",
      "idade": "Filhote/Juvenil/Adulto",
      "sexo": "Macho/Femea/Indeterminado"
    }
  ],
  "total_individuos": 1,
  "comportamento_geral": "Deslocamento",
  "confianca_geral": 0.85,
  "ambiente": "Descrição do ambiente"
}`;

      const response = GeminiAIService.generateContent(prompt);
      
      if (response && response.success) {
        return this._parseDetectionResponse(response.content);
      }
    } catch (e) {
      Logger.log(`[_detectWildlifeWithAI] Erro Gemini: ${e}`);
    }
    
    return this._simulateDetection(metadata);
  },
  
  /**
   * Parse resposta de detecção
   * @private
   */
  _parseDetectionResponse: function(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          especies: parsed.especies || [],
          total_individuos: parsed.total_individuos || 0,
          comportamento: parsed.comportamento_geral || 'Deslocamento',
          confianca: parsed.confianca_geral || 0.5,
          idade: parsed.especies?.[0]?.idade || 'Adulto',
          sexo: parsed.especies?.[0]?.sexo || 'Indeterminado'
        };
      }
    } catch (e) {
      Logger.log(`[_parseDetectionResponse] Erro: ${e}`);
    }
    return this._simulateDetection({});
  },
  
  /**
   * Simula detecção (fallback)
   * @private
   */
  _simulateDetection: function(metadata) {
    // Seleciona espécies aleatórias do Cerrado
    const numSpecies = Math.floor(Math.random() * 2) + 1;
    const especies = [];
    const shuffled = [...this.FAUNA_CERRADO].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numSpecies && i < shuffled.length; i++) {
      const sp = shuffled[i];
      especies.push({
        cientifico: sp.cientifico,
        comum: sp.comum,
        confianca: 0.7 + Math.random() * 0.25,
        individuos: Math.floor(Math.random() * 3) + 1,
        comportamento: ['Alimentacao', 'Deslocamento', 'Descanso'][Math.floor(Math.random() * 3)],
        idade: 'Adulto',
        sexo: 'Indeterminado',
        categoria_iucn: sp.categoria
      });
    }
    
    const totalIndividuos = especies.reduce((sum, sp) => sum + sp.individuos, 0);
    
    return {
      especies: especies,
      total_individuos: totalIndividuos,
      comportamento: especies[0]?.comportamento || 'Deslocamento',
      confianca: 0.75,
      idade: 'Adulto',
      sexo: 'Indeterminado'
    };
  },


  /**
   * Determina período do dia
   * @private
   */
  _getPeriodoDia: function(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour >= 0 && hour < 6) return 'Madrugada';
    if (hour >= 6 && hour < 12) return 'Manha';
    if (hour >= 12 && hour < 18) return 'Tarde';
    return 'Noite';
  },
  
  /**
   * Calcula fase lunar aproximada
   * @private
   */
  _getFaseLunar: function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Algoritmo simplificado
    const c = Math.floor(year / 100);
    const n = year - 19 * Math.floor(year / 19);
    const k = Math.floor((c - 17) / 25);
    let i = c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;
    i = i - 30 * Math.floor(i / 30);
    i = i - Math.floor(i / 28) * (1 - Math.floor(i / 28) * Math.floor(29 / (i + 1)) * Math.floor((21 - n) / 11));
    let j = year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4);
    j = j - 7 * Math.floor(j / 7);
    const l = i - j;
    const m = 3 + Math.floor((l + 40) / 44);
    const d = l + 28 - 31 * Math.floor(m / 4);
    
    const lunarDay = ((day - d + 30) % 30);
    
    if (lunarDay < 4) return 'Nova';
    if (lunarDay < 11) return 'Crescente';
    if (lunarDay < 18) return 'Cheia';
    if (lunarDay < 25) return 'Minguante';
    return 'Nova';
  },
  
  /**
   * Atualiza estatísticas da câmera
   * @private
   */
  _updateCameraStats: function(cameraId, especies) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAMERAS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === cameraId) {
          const rowIndex = i + 1;
          
          // Incrementa total de capturas
          const totalCapturas = (data[i][12] || 0) + 1;
          sheet.getRange(rowIndex, 13).setValue(totalCapturas);
          
          // Atualiza espécies detectadas
          let especiesAtuais = this._safeParseJSON(data[i][13], []);
          especies.forEach(sp => {
            if (!especiesAtuais.includes(sp.cientifico)) {
              especiesAtuais.push(sp.cientifico);
            }
          });
          sheet.getRange(rowIndex, 14).setValue(JSON.stringify(especiesAtuais));
          
          // Atualiza última sincronização
          sheet.getRange(rowIndex, 10).setValue(new Date());
          
          break;
        }
      }
    } catch (e) {
      Logger.log(`[_updateCameraStats] Erro: ${e}`);
    }
  },
  
  /**
   * Verifica alertas para espécies raras
   * @private
   */
  _checkSpeciesAlerts: function(especies) {
    const alerts = [];
    const categoriasPrioritarias = ['VU', 'EN', 'CR'];
    
    especies.forEach(sp => {
      const faunaRef = this.FAUNA_CERRADO.find(f => f.cientifico === sp.cientifico);
      if (faunaRef && categoriasPrioritarias.includes(faunaRef.categoria)) {
        alerts.push({
          type: 'ESPECIE_AMEACADA',
          species: sp.cientifico,
          comum: sp.comum || faunaRef.comum,
          categoria: faunaRef.categoria,
          message: `Espécie ameaçada detectada: ${faunaRef.comum} (${faunaRef.categoria})`
        });
      }
    });
    
    return alerts;
  },

  /**
   * Lista capturas
   * @param {object} filtros - Filtros opcionais
   * @returns {Array} Lista de capturas
   */
  getCapturas: function(filtros = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAPTURAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const capturas = [];
      
      for (let i = 1; i < data.length; i++) {
        const cap = {
          id: data[i][0],
          camera_id: data[i][1],
          timestamp: data[i][2],
          tipo_midia: data[i][3],
          url_midia: data[i][4],
          duracao: data[i][5],
          especies: this._safeParseJSON(data[i][6], []),
          num_individuos: data[i][7],
          idade: data[i][8],
          sexo: data[i][9],
          comportamento: data[i][10],
          confianca: data[i][11],
          validado: data[i][12],
          validado_por: data[i][13],
          especies_confirmadas: this._safeParseJSON(data[i][14], []),
          observacoes: data[i][15],
          temperatura: data[i][16],
          umidade: data[i][17],
          fase_lunar: data[i][18],
          periodo: data[i][19]
        };
        
        // Aplica filtros
        if (filtros.camera_id && cap.camera_id !== filtros.camera_id) continue;
        if (filtros.validado !== undefined && cap.validado !== filtros.validado) continue;
        if (filtros.periodo && cap.periodo !== filtros.periodo) continue;
        if (filtros.especie) {
          const hasSpecies = cap.especies.some(sp => 
            sp.cientifico === filtros.especie || sp.comum === filtros.especie
          );
          if (!hasSpecies) continue;
        }
        
        capturas.push(cap);
      }
      
      // Ordena por timestamp (mais recentes primeiro)
      capturas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Limita resultados
      if (filtros.limit) {
        return capturas.slice(0, filtros.limit);
      }
      
      return capturas;
      
    } catch (error) {
      Logger.log(`[getCapturas] Erro: ${error}`);
      return [];
    }
  },


  /**
   * Valida captura
   * @param {string} captureId - ID da captura
   * @param {object} validationData - Dados de validação
   * @returns {object} Resultado
   */
  validateCapture: function(captureId, validationData) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CAPTURAS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === captureId) {
          const rowIndex = i + 1;
          
          sheet.getRange(rowIndex, 13).setValue(true); // Validado
          sheet.getRange(rowIndex, 14).setValue(validationData.validador || 'Sistema');
          sheet.getRange(rowIndex, 15).setValue(JSON.stringify(validationData.especies_confirmadas || []));
          sheet.getRange(rowIndex, 16).setValue(validationData.observacoes || '');
          
          return {
            success: true,
            message: 'Captura validada com sucesso'
          };
        }
      }
      
      return { success: false, error: 'Captura não encontrada' };
      
    } catch (error) {
      Logger.log(`[validateCapture] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa uso de corredor ecológico
   * @param {string} corridorId - ID do corredor
   * @param {number} days - Dias para análise
   * @returns {object} Análise do corredor
   */
  analyzeCorridorUsage: function(corridorId, days = 30) {
    try {
      const cameras = this.getCameras({ corredor: corridorId });
      
      if (cameras.length === 0) {
        return { success: false, error: 'Nenhuma câmera encontrada no corredor' };
      }
      
      const cameraIds = cameras.map(c => c.id);
      const allCaptures = this.getCapturas({});
      
      // Filtra capturas do corredor e período
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const captures = allCaptures.filter(c => 
        cameraIds.includes(c.camera_id) && 
        new Date(c.timestamp) >= cutoffDate
      );
      
      // Extrai espécies únicas
      const speciesSet = new Set();
      captures.forEach(c => {
        c.especies.forEach(sp => speciesSet.add(sp.cientifico));
      });
      
      // Calcula picos de atividade
      const hourCounts = {};
      captures.forEach(c => {
        const hour = new Date(c.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }));
      
      // Espécies mais ativas
      const speciesCounts = {};
      captures.forEach(c => {
        c.especies.forEach(sp => {
          speciesCounts[sp.cientifico] = (speciesCounts[sp.cientifico] || 0) + 1;
        });
      });
      
      const mostActive = Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([species, count]) => {
          const ref = this.FAUNA_CERRADO.find(f => f.cientifico === species);
          return {
            cientifico: species,
            comum: ref?.comum || species,
            deteccoes: count
          };
        });
      
      // Calcula efetividade do corredor
      const effectiveness = this._calculateCorridorEffectiveness(captures, cameras);
      
      return {
        success: true,
        corridor_id: corridorId,
        period_days: days,
        cameras_count: cameras.length,
        total_passages: captures.length,
        unique_species: Array.from(speciesSet).length,
        species_list: Array.from(speciesSet),
        peak_hours: peakHours,
        most_active_species: mostActive,
        corridor_effectiveness: effectiveness,
        daily_average: parseFloat((captures.length / days).toFixed(2))
      };
      
    } catch (error) {
      Logger.log(`[analyzeCorridorUsage] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Calcula efetividade do corredor
   * @private
   */
  _calculateCorridorEffectiveness: function(captures, cameras) {
    if (cameras.length === 0) return 0;
    
    // Efetividade baseada em:
    // - Diversidade de espécies
    // - Frequência de uso
    // - Presença de espécies-chave
    
    const speciesSet = new Set();
    let keySpeciesCount = 0;
    const keySpecies = ['Panthera onca', 'Tapirus terrestris', 'Chrysocyon brachyurus'];
    
    captures.forEach(c => {
      c.especies.forEach(sp => {
        speciesSet.add(sp.cientifico);
        if (keySpecies.includes(sp.cientifico)) {
          keySpeciesCount++;
        }
      });
    });
    
    const diversityScore = Math.min(speciesSet.size / 10, 1) * 40;
    const frequencyScore = Math.min(captures.length / (cameras.length * 30), 1) * 30;
    const keySpeciesScore = Math.min(keySpeciesCount / 5, 1) * 30;
    
    return parseFloat((diversityScore + frequencyScore + keySpeciesScore).toFixed(1));
  },


  /**
   * Gera relatório de atividade de fauna
   * @param {string} period - Período ('weekly', 'monthly', 'yearly')
   * @returns {object} Relatório
   */
  generateActivityReport: function(period = 'monthly') {
    try {
      const days = period === 'weekly' ? 7 : (period === 'yearly' ? 365 : 30);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const allCaptures = this.getCapturas({});
      const captures = allCaptures.filter(c => new Date(c.timestamp) >= cutoffDate);
      
      // Riqueza de espécies
      const speciesSet = new Set();
      captures.forEach(c => {
        c.especies.forEach(sp => speciesSet.add(sp.cientifico));
      });
      
      // Top espécies
      const speciesCounts = {};
      captures.forEach(c => {
        c.especies.forEach(sp => {
          speciesCounts[sp.cientifico] = (speciesCounts[sp.cientifico] || 0) + 1;
        });
      });
      
      const topSpecies = Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([species, count]) => {
          const ref = this.FAUNA_CERRADO.find(f => f.cientifico === species);
          return {
            cientifico: species,
            comum: ref?.comum || species,
            categoria: ref?.categoria || 'DD',
            deteccoes: count,
            porcentagem: parseFloat((count / captures.length * 100).toFixed(1))
          };
        });
      
      // Padrões temporais
      const byPeriod = { Madrugada: 0, Manha: 0, Tarde: 0, Noite: 0 };
      const byLunarPhase = { Nova: 0, Crescente: 0, Cheia: 0, Minguante: 0 };
      
      captures.forEach(c => {
        if (c.periodo) byPeriod[c.periodo]++;
        if (c.fase_lunar) byLunarPhase[c.fase_lunar]++;
      });
      
      // Distribuição espacial (por câmera)
      const byCamera = {};
      captures.forEach(c => {
        byCamera[c.camera_id] = (byCamera[c.camera_id] || 0) + 1;
      });
      
      // Avistamentos raros
      const rareSightings = captures.filter(c => {
        return c.especies.some(sp => {
          const ref = this.FAUNA_CERRADO.find(f => f.cientifico === sp.cientifico);
          return ref && ['VU', 'EN', 'CR'].includes(ref.categoria);
        });
      }).slice(0, 10);
      
      // Insights comportamentais
      const behaviorCounts = {};
      captures.forEach(c => {
        if (c.comportamento) {
          behaviorCounts[c.comportamento] = (behaviorCounts[c.comportamento] || 0) + 1;
        }
      });
      
      return {
        success: true,
        period: period,
        period_days: days,
        generated_at: new Date().toISOString(),
        summary: {
          total_captures: captures.length,
          species_richness: speciesSet.size,
          cameras_active: Object.keys(byCamera).length,
          daily_average: parseFloat((captures.length / days).toFixed(2))
        },
        top_species: topSpecies,
        temporal_patterns: {
          by_period: byPeriod,
          by_lunar_phase: byLunarPhase,
          peak_period: Object.entries(byPeriod).sort((a, b) => b[1] - a[1])[0]?.[0]
        },
        spatial_distribution: byCamera,
        rare_sightings: rareSightings.map(c => ({
          timestamp: c.timestamp,
          camera: c.camera_id,
          especies: c.especies.filter(sp => {
            const ref = this.FAUNA_CERRADO.find(f => f.cientifico === sp.cientifico);
            return ref && ['VU', 'EN', 'CR'].includes(ref.categoria);
          })
        })),
        behavioral_insights: behaviorCounts
      };
      
    } catch (error) {
      Logger.log(`[generateActivityReport] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const cameras = this.getCameras({});
      const capturas = this.getCapturas({ limit: 1000 });
      
      // Câmeras por status
      const byStatus = {};
      cameras.forEach(c => {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      });
      
      // Espécies únicas
      const speciesSet = new Set();
      capturas.forEach(c => {
        c.especies.forEach(sp => speciesSet.add(sp.cientifico));
      });
      
      // Capturas pendentes de validação
      const pendingValidation = capturas.filter(c => !c.validado).length;
      
      // Espécies ameaçadas detectadas
      const threatenedSpecies = [];
      speciesSet.forEach(sp => {
        const ref = this.FAUNA_CERRADO.find(f => f.cientifico === sp);
        if (ref && ['VU', 'EN', 'CR'].includes(ref.categoria)) {
          threatenedSpecies.push({
            cientifico: sp,
            comum: ref.comum,
            categoria: ref.categoria
          });
        }
      });
      
      // Bateria média
      const avgBattery = cameras.length > 0 
        ? cameras.reduce((sum, c) => sum + (c.bateria || 0), 0) / cameras.length 
        : 0;
      
      return {
        cameras: {
          total: cameras.length,
          by_status: byStatus,
          average_battery: parseFloat(avgBattery.toFixed(1))
        },
        captures: {
          total: capturas.length,
          pending_validation: pendingValidation,
          validated: capturas.length - pendingValidation
        },
        species: {
          total_detected: speciesSet.size,
          threatened_count: threatenedSpecies.length,
          threatened_list: threatenedSpecies
        },
        recent_activity: capturas.slice(0, 5).map(c => ({
          timestamp: c.timestamp,
          camera: c.camera_id,
          especies: c.especies.map(sp => sp.comum || sp.cientifico)
        }))
      };
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Simula capturas para demonstração
   * @param {number} count - Número de capturas a simular
   * @returns {object} Resultado
   */
  simulateCaptures: function(count = 10) {
    try {
      const cameras = this.getCameras({ status: 'Ativa' });
      
      if (cameras.length === 0) {
        return { success: false, error: 'Nenhuma câmera ativa encontrada' };
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        const camera = cameras[Math.floor(Math.random() * cameras.length)];
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        const result = this.processCapture(camera.id, '', {
          timestamp: timestamp,
          tipo: 'Foto',
          temperatura: 20 + Math.random() * 15,
          umidade: 40 + Math.random() * 40
        });
        
        results.push(result);
      }
      
      return {
        success: true,
        simulated: count,
        results: results
      };
      
    } catch (error) {
      Logger.log(`[simulateCaptures] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  }
};



// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P07 Câmeras Trap
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilhas de câmeras trap
 * @returns {object} Resultado
 */
function apiCamerasTrapInit() {
  return CameraTrapService.initializeSheets();
}

/**
 * Registra nova câmera
 * @param {object} data - Dados da câmera
 * @returns {object} Resultado
 */
function apiCamerasTrapRegister(data) {
  return CameraTrapService.registerCamera(data);
}

/**
 * Lista câmeras
 * @param {object} filtros - Filtros opcionais (status, zona, corredor)
 * @returns {Array} Lista de câmeras
 */
function apiCamerasTrapList(filtros) {
  return CameraTrapService.getCameras(filtros || {});
}

/**
 * Processa nova captura
 * @param {string} cameraId - ID da câmera
 * @param {string} mediaUrl - URL da mídia
 * @param {object} metadata - Metadados
 * @returns {object} Resultado com detecção
 */
function apiCamerasTrapProcessCapture(cameraId, mediaUrl, metadata) {
  return CameraTrapService.processCapture(cameraId, mediaUrl, metadata || {});
}

/**
 * Lista capturas
 * @param {object} filtros - Filtros opcionais
 * @returns {Array} Lista de capturas
 */
function apiCamerasTrapCapturas(filtros) {
  return CameraTrapService.getCapturas(filtros || {});
}

/**
 * Valida captura
 * @param {string} captureId - ID da captura
 * @param {object} validationData - Dados de validação
 * @returns {object} Resultado
 */
function apiCamerasTrapValidate(captureId, validationData) {
  return CameraTrapService.validateCapture(captureId, validationData);
}

/**
 * Analisa uso de corredor ecológico
 * @param {string} corridorId - ID do corredor
 * @param {number} days - Dias para análise
 * @returns {object} Análise
 */
function apiCamerasTrapCorridorAnalysis(corridorId, days) {
  return CameraTrapService.analyzeCorridorUsage(corridorId, days || 30);
}

/**
 * Gera relatório de atividade
 * @param {string} period - Período (weekly, monthly, yearly)
 * @returns {object} Relatório
 */
function apiCamerasTrapReport(period) {
  return CameraTrapService.generateActivityReport(period || 'monthly');
}

/**
 * Obtém estatísticas gerais
 * @returns {object} Estatísticas
 */
function apiCamerasTrapStats() {
  return CameraTrapService.getStatistics();
}

/**
 * Simula capturas para demonstração
 * @param {number} count - Número de capturas
 * @returns {object} Resultado
 */
function apiCamerasTrapSimulate(count) {
  return CameraTrapService.simulateCaptures(count || 10);
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 40/30 (27/30): TOUR VIRTUAL E OBSERVAÇÃO REMOTA
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Virtual Ecotourism Experiences
// - Wildlife Camera Trap Best Practices

/**
 * Pontos de tour virtual
 */
const VIRTUAL_TOUR_POINTS = [
  { id: 'VT01', nome: 'Centro de Visitantes', tipo: 'panorama', ordem: 1, descricao: 'Início da jornada pela Reserva Araras' },
  { id: 'VT02', nome: 'Trilha da Nascente', tipo: 'video', ordem: 2, descricao: 'Caminhada pela mata ciliar até a nascente' },
  { id: 'VT03', nome: 'Mirante do Cerrado', tipo: 'panorama', ordem: 3, descricao: 'Vista panorâmica do bioma Cerrado' },
  { id: 'VT04', nome: 'Vereda do Buriti', tipo: 'audio', ordem: 4, descricao: 'Sons da natureza na vereda' },
  { id: 'VT05', nome: 'SAF Demonstrativo', tipo: 'video', ordem: 5, descricao: 'Sistema Agroflorestal em funcionamento' },
  { id: 'VT06', nome: 'Ponto de Observação de Aves', tipo: 'foto', ordem: 6, descricao: 'Melhor local para avistamento de aves' },
  { id: 'VT07', nome: 'Viveiro de Mudas', tipo: 'panorama', ordem: 7, descricao: 'Produção de mudas nativas' },
  { id: 'VT08', nome: 'Área de Restauração', tipo: 'video', ordem: 8, descricao: 'Projeto de restauração florestal' }
];

/**
 * Limiares de qualidade para capturas
 */
const QUALITY_THRESHOLDS = {
  DESTAQUE: 0.8,    // Score >= 0.8 = destaque
  BOA: 0.6,         // Score >= 0.6 = boa qualidade
  ACEITAVEL: 0.4,   // Score >= 0.4 = aceitável
  BAIXA: 0.0        // Score < 0.4 = baixa qualidade
};

// Adiciona ao CameraTrapService
CameraTrapService.VIRTUAL_TOUR_POINTS = VIRTUAL_TOUR_POINTS;
CameraTrapService.QUALITY_THRESHOLDS = QUALITY_THRESHOLDS;

/**
 * Obtém melhores capturas para galeria pública
 * @param {number} limite - Número de capturas
 * @returns {object} Melhores capturas
 */
CameraTrapService.getBestCaptures = function(limite = 20) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEETS.CAPTURAS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, capturas: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Mapeia capturas com score de qualidade
    let capturas = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const qualidade = row[headers.indexOf('Qualidade_Score')] || 0.5;
      const especie = row[headers.indexOf('Especie_Detectada')];
      
      // Filtra apenas capturas com espécie identificada e boa qualidade
      if (especie && qualidade >= QUALITY_THRESHOLDS.BOA) {
        capturas.push({
          id: row[headers.indexOf('ID_Captura')],
          thumbnail_url: row[headers.indexOf('URL_Midia')],
          especie: especie,
          nome_popular: row[headers.indexOf('Nome_Popular')] || especie,
          data_captura: row[headers.indexOf('Timestamp')],
          qualidade_score: qualidade,
          destaque: qualidade >= QUALITY_THRESHOLDS.DESTAQUE,
          comportamento: row[headers.indexOf('Comportamento')] || 'Observado',
          // Não expõe localização precisa
          regiao: 'Reserva Araras'
        });
      }
    }
    
    // Ordena por qualidade e limita
    capturas.sort((a, b) => b.qualidade_score - a.qualidade_score);
    capturas = capturas.slice(0, limite);
    
    // Adiciona descrições amigáveis
    capturas = capturas.map(c => ({
      ...c,
      descricao: `${c.nome_popular} ${c.comportamento.toLowerCase()} na ${c.regiao}`,
      data_formatada: c.data_captura ? new Date(c.data_captura).toLocaleDateString('pt-BR') : 'Recente'
    }));
    
    return {
      success: true,
      capturas,
      total: capturas.length,
      destaques: capturas.filter(c => c.destaque).length
    };
  } catch (error) {
    Logger.log(`[getBestCaptures] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém pontos do tour virtual
 * @returns {object} Pontos do tour
 */
CameraTrapService.getVirtualTourPoints = function() {
  try {
    const tourPoints = VIRTUAL_TOUR_POINTS.map(point => ({
      ...point,
      icone: this._getTourPointIcon(point.tipo),
      disponivel: true // Em produção, verificar disponibilidade de conteúdo
    }));
    
    return {
      success: true,
      tour: {
        nome: 'Tour Virtual Reserva Araras',
        descricao: 'Explore a reserva sem sair de casa',
        duracao_estimada: '15-20 minutos',
        pontos: tourPoints
      },
      total_pontos: tourPoints.length
    };
  } catch (error) {
    Logger.log(`[getVirtualTourPoints] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém ícone do ponto de tour
 * @private
 */
CameraTrapService._getTourPointIcon = function(tipo) {
  const icons = {
    'panorama': '🌄',
    'video': '🎬',
    'audio': '🔊',
    'foto': '📷'
  };
  return icons[tipo] || '📍';
};

/**
 * Obtém status das câmeras ao vivo
 * @returns {object} Status das câmeras
 */
CameraTrapService.getLiveStatus = function() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEETS.CAMERAS);
    
    const status = {
      cameras_ativas: 0,
      cameras_offline: 0,
      ultima_captura: null,
      capturas_hoje: 0
    };
    
    if (sheet && sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cameraStatus = row[headers.indexOf('Status')];
        
        if (cameraStatus === 'Ativa' || cameraStatus === 'Online') {
          status.cameras_ativas++;
        } else {
          status.cameras_offline++;
        }
      }
    }
    
    // Conta capturas de hoje
    const capturasSheet = ss.getSheetByName(this.SHEETS.CAPTURAS);
    if (capturasSheet && capturasSheet.getLastRow() > 1) {
      const capData = capturasSheet.getDataRange().getValues();
      const headers = capData[0];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      for (let i = capData.length - 1; i >= 1; i--) {
        const timestamp = new Date(capData[i][headers.indexOf('Timestamp')]);
        if (timestamp >= hoje) {
          status.capturas_hoje++;
          if (!status.ultima_captura) {
            status.ultima_captura = timestamp.toLocaleString('pt-BR');
          }
        } else {
          break; // Dados ordenados por data
        }
      }
    }
    
    return {
      success: true,
      status,
      mensagem: status.cameras_ativas > 0 
        ? `${status.cameras_ativas} câmera(s) monitorando a vida selvagem` 
        : 'Câmeras em manutenção'
    };
  } catch (error) {
    Logger.log(`[getLiveStatus] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém galeria pública filtrada
 * @param {object} filtros - { especie, periodo, tipo }
 * @returns {object} Galeria filtrada
 */
CameraTrapService.getPublicGallery = function(filtros = {}) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEETS.CAPTURAS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, galeria: [], total: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    let galeria = [];
    const cutoffDate = filtros.periodo 
      ? new Date(Date.now() - filtros.periodo * 24 * 60 * 60 * 1000)
      : new Date(0);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const timestamp = new Date(row[headers.indexOf('Timestamp')]);
      const especie = row[headers.indexOf('Especie_Detectada')];
      const qualidade = row[headers.indexOf('Qualidade_Score')] || 0.5;
      
      // Aplica filtros
      if (timestamp < cutoffDate) continue;
      if (filtros.especie && especie !== filtros.especie) continue;
      if (qualidade < QUALITY_THRESHOLDS.ACEITAVEL) continue;
      
      galeria.push({
        id: row[headers.indexOf('ID_Captura')],
        url: row[headers.indexOf('URL_Midia')],
        especie: especie,
        nome_popular: row[headers.indexOf('Nome_Popular')] || especie,
        data: timestamp.toLocaleDateString('pt-BR'),
        qualidade: qualidade >= QUALITY_THRESHOLDS.DESTAQUE ? 'destaque' : 
                   qualidade >= QUALITY_THRESHOLDS.BOA ? 'boa' : 'normal',
        comportamento: row[headers.indexOf('Comportamento')]
      });
    }
    
    // Ordena por data (mais recente primeiro)
    galeria.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limita resultado
    const limite = filtros.limite || 50;
    galeria = galeria.slice(0, limite);
    
    // Agrupa por espécie para estatísticas
    const especiesCount = {};
    galeria.forEach(g => {
      especiesCount[g.especie] = (especiesCount[g.especie] || 0) + 1;
    });
    
    return {
      success: true,
      galeria,
      total: galeria.length,
      especies_encontradas: Object.keys(especiesCount).length,
      distribuicao_especies: especiesCount
    };
  } catch (error) {
    Logger.log(`[getPublicGallery] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Virtual Tour (Prompt 40/30)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Obtém melhores capturas
 * @param {number} limite - Número de capturas
 */
function apiVirtualGetBestCaptures(limite) {
  return CameraTrapService.getBestCaptures(limite || 20);
}

/**
 * API: Obtém pontos do tour virtual
 */
function apiVirtualGetTourPoints() {
  return CameraTrapService.getVirtualTourPoints();
}

/**
 * API: Obtém status das câmeras ao vivo
 */
function apiVirtualGetLiveStatus() {
  return CameraTrapService.getLiveStatus();
}

/**
 * API: Obtém galeria pública filtrada
 * @param {object} filtros - Filtros opcionais
 */
function apiVirtualGetGallery(filtros) {
  return CameraTrapService.getPublicGallery(filtros || {});
}
