/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SERVIÇO DE BIODIVERSIDADE COM IA
 * ═══════════════════════════════════════════════════════════════════════════
 * P01 - Sistema de Monitoramento de Biodiversidade em Tempo Real com IA
 * 
 * Funcionalidades:
 * - Análise de imagens com Gemini Vision AI
 * - Identificação automática de espécies
 * - Registro de observações de biodiversidade
 * - Estatísticas e métricas ecológicas
 * - Dashboard de biodiversidade
 * - Alertas de conservação
 * 
 * @version 3.2.0
 * @date 2025-12-25
 */

/**
 * Schema de dados para planilha BIODIVERSIDADE_RA
 */
const SCHEMA_BIODIVERSIDADE = {
  ID_Observacao: { type: 'string', required: true, unique: true },
  Timestamp: { type: 'datetime', required: true },
  ID_Observador: { type: 'string', required: true },
  Nome_Observador: { type: 'string', required: true },
  Tipo_Observador: { type: 'enum', values: ['Monitor', 'Pesquisador', 'Visitante', 'Voluntário'] },
  Latitude: { type: 'float', required: true, range: [-90, 90] },
  Longitude: { type: 'float', required: true, range: [-180, 180] },
  ID_Parcela: { type: 'string' },
  Altitude_m: { type: 'float', min: 0 },
  Zona_Ecologica: { type: 'enum', values: ['Floresta', 'SAF', 'Nascente', 'Trilha', 'Jardim Terapêutico', 'Cerrado', 'Mata de Galeria', 'Vereda'] },
  Reino: { type: 'enum', values: ['Animalia', 'Plantae', 'Fungi', 'Protista', 'Bacteria'] },
  Filo: { type: 'string' },
  Classe: { type: 'string' },
  Ordem: { type: 'string' },
  Familia: { type: 'string' },
  Genero: { type: 'string' },
  Especie_Cientifica: { type: 'string', required: true },
  Nome_Popular: { type: 'string' },
  Quantidade_Individuos: { type: 'integer', min: 1, default: 1 },
  Estagio_Vida: { type: 'enum', values: ['Semente', 'Muda', 'Juvenil', 'Adulto', 'Senescente'] },
  Comportamento_Observado: { type: 'text' },
  Condicao_Saude: { type: 'enum', values: ['Excelente', 'Boa', 'Regular', 'Debilitada', 'Crítica'] },
  URL_Foto_Principal: { type: 'url' },
  URLs_Fotos_Adicionais: { type: 'array' },
  URL_Audio: { type: 'url' },
  Descricao_Visual: { type: 'text', maxLength: 500 },
  IA_Confianca_Identificacao: { type: 'float', range: [0, 1] },
  IA_Especies_Alternativas: { type: 'array' },
  IA_Insights_Ecologicos: { type: 'text' },
  IA_Alertas_Conservacao: { type: 'array' },
  IA_Status_Processamento: { type: 'enum', values: ['Pendente', 'Processando', 'Concluído', 'Erro'] },
  Especie_Indicadora: { type: 'boolean', default: false },
  Especie_Ameacada: { type: 'boolean', default: false },
  Categoria_IUCN: { type: 'enum', values: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'] },
  Endemica_Bioma: { type: 'boolean', default: false },
  Funcao_Ecologica: { type: 'array' },
  Temperatura_C: { type: 'float' },
  Umidade_Relativa: { type: 'float', range: [0, 100] },
  Condicoes_Climaticas: { type: 'enum', values: ['Ensolarado', 'Parcialmente Nublado', 'Nublado', 'Chuvoso'] },
  Validado_Por_Especialista: { type: 'boolean', default: false },
  ID_Validador: { type: 'string' },
  Notas_Validacao: { type: 'text' },
  Tags: { type: 'array' },
  Status: { type: 'enum', values: ['Rascunho', 'Publicado', 'Arquivado'], default: 'Publicado' }
};

/**
 * Headers da planilha BIODIVERSIDADE_RA
 */
const BIODIVERSIDADE_HEADERS = [
  'ID_Observacao', 'Timestamp', 'ID_Observador', 'Nome_Observador', 'Tipo_Observador',
  'Latitude', 'Longitude', 'ID_Parcela', 'Altitude_m', 'Zona_Ecologica',
  'Reino', 'Filo', 'Classe', 'Ordem', 'Familia', 'Genero',
  'Especie_Cientifica', 'Nome_Popular', 'Quantidade_Individuos', 'Estagio_Vida',
  'Comportamento_Observado', 'Condicao_Saude', 'URL_Foto_Principal', 'URLs_Fotos_Adicionais',
  'URL_Audio', 'Descricao_Visual', 'IA_Confianca_Identificacao', 'IA_Especies_Alternativas',
  'IA_Insights_Ecologicos', 'IA_Alertas_Conservacao', 'IA_Status_Processamento',
  'Especie_Indicadora', 'Especie_Ameacada', 'Categoria_IUCN', 'Endemica_Bioma',
  'Funcao_Ecologica', 'Temperatura_C', 'Umidade_Relativa', 'Condicoes_Climaticas',
  'Validado_Por_Especialista', 'ID_Validador', 'Notas_Validacao', 'Tags', 'Status'
];

/**
 * Serviço de Análise de Biodiversidade com Gemini AI
 * @namespace BiodiversityAIService
 */
const BiodiversityAIService = {
  
  /**
   * Nome da planilha de biodiversidade
   */
  SHEET_NAME: 'BIODIVERSIDADE_RA',
  
  /**
   * Inicializa a planilha de biodiversidade com headers
   * @returns {object} Resultado da inicialização
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(BIODIVERSIDADE_HEADERS);
        
        // Formata header
        const headerRange = sheet.getRange(1, 1, 1, BIODIVERSIDADE_HEADERS.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        // Congela primeira linha
        sheet.setFrozenRows(1);
        
        Logger.log(`[BiodiversityAIService] Planilha ${this.SHEET_NAME} criada com sucesso`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[BiodiversityAIService] Erro ao inicializar planilha: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Analisa imagem de espécie usando Gemini Vision
   * @param {string} imageBase64 - Imagem em base64
   * @param {object} context - Contexto da observação (localização, zona, etc)
   * @returns {object} Resultado da análise
   */
  analyzeSpeciesImage: function(imageBase64, context = {}) {
    try {
      const prompt = this._buildAnalysisPrompt(context);
      
      // Verifica se GeminiAIService está disponível
      if (typeof GeminiAIService === 'undefined' || !GeminiAIService.generateContent) {
        throw new Error('GeminiAIService não está disponível');
      }
      
      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      };
      
      const response = GeminiAIService.generateContent(payload);
      return this._parseAIResponse(response);
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.analyzeSpeciesImage] Erro: ${error}`);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  },
  
  /**
   * Constrói prompt contextualizado para análise
   */
  _buildAnalysisPrompt: function(context) {
    const bioma = CONFIG?.RESERVA_CONTEXT?.bioma || 'Cerrado';
    const regiao = CONFIG?.RESERVA_CONTEXT?.nome || 'Reserva Araras';
    
    return `
Você é um especialista em biodiversidade brasileira, com foco no bioma ${bioma}.
Analise a imagem fornecida e retorne um JSON estruturado com as seguintes informações:

**CONTEXTO DA OBSERVAÇÃO:**
- Localização: ${context.zona_ecologica || 'Não especificado'}
- Região: ${regiao}, Goiás, Brasil
- Bioma: ${bioma}
- Coordenadas: ${context.latitude || 'N/A'}, ${context.longitude || 'N/A'}

**ANÁLISE REQUERIDA:**
1. Identificação da espécie (nome científico e popular)
2. Classificação taxonômica completa (Reino, Filo, Classe, Ordem, Família, Gênero)
3. Nível de confiança da identificação (0-1)
4. Espécies alternativas possíveis (top 3)
5. Status de conservação (categoria IUCN se aplicável)
6. Se é espécie endêmica do bioma
7. Função ecológica principal
8. Características distintivas observadas
9. Insights ecológicos relevantes para conservação
10. Alertas de conservação (se houver)

**FORMATO DE RESPOSTA (JSON ESTRITO):**
{
  "especie_cientifica": "Genus species",
  "nome_popular": "Nome comum",
  "reino": "Animalia|Plantae|Fungi",
  "filo": "nome do filo",
  "classe": "nome da classe",
  "ordem": "nome da ordem",
  "familia": "nome da família",
  "genero": "nome do gênero",
  "confianca": 0.95,
  "especies_alternativas": ["Espécie 1", "Espécie 2", "Espécie 3"],
  "categoria_iucn": "LC|NT|VU|EN|CR|DD|NE",
  "endemica": true,
  "especie_indicadora": false,
  "especie_ameacada": false,
  "funcao_ecologica": ["Polinizador", "Dispersor"],
  "caracteristicas_distintivas": "Descrição das características observadas",
  "insights_ecologicos": "Análise do papel ecológico e importância para o ecossistema",
  "alertas_conservacao": ["Alerta 1", "Alerta 2"]
}

Seja preciso, científico e forneça informações acionáveis para conservação.
Retorne APENAS o JSON, sem texto adicional.
`;
  },
  
  /**
   * Processa resposta da IA
   */
  _parseAIResponse: function(response) {
    try {
      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('Resposta da IA vazia ou inválida');
      }
      
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Resposta da IA não contém JSON válido');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      // Valida campos obrigatórios
      if (!data.especie_cientifica) {
        throw new Error('Espécie científica não identificada');
      }
      
      // Normaliza dados
      data.confianca = parseFloat(data.confianca) || 0.5;
      data.endemica = Boolean(data.endemica);
      data.especie_indicadora = Boolean(data.especie_indicadora);
      data.especie_ameacada = Boolean(data.especie_ameacada);
      data.especies_alternativas = Array.isArray(data.especies_alternativas) ? data.especies_alternativas : [];
      data.funcao_ecologica = Array.isArray(data.funcao_ecologica) ? data.funcao_ecologica : [];
      data.alertas_conservacao = Array.isArray(data.alertas_conservacao) ? data.alertas_conservacao : [];
      
      return {
        success: true,
        data: data,
        raw_response: text
      };
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService._parseAIResponse] Erro: ${error}`);
      return {
        success: false,
        error: 'Erro ao processar resposta da IA: ' + error.message,
        raw_response: response
      };
    }
  },
  
  /**
   * Registra observação de biodiversidade
   * @param {object} observationData - Dados da observação
   * @returns {object} Resultado do registro
   */
  registerObservation: function(observationData) {
    try {
      // Inicializa planilha se necessário
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        throw new Error(`Planilha ${this.SHEET_NAME} não encontrada`);
      }
      
      // Gera ID único
      const id = `BIO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Obtém email do usuário
      let userEmail = '';
      try {
        userEmail = Session.getActiveUser().getEmail();
      } catch (e) {
        userEmail = observationData.id_observador || 'anonymous';
      }
      
      // Prepara dados conforme schema
      const row = [
        id,                                                          // ID_Observacao
        new Date(),                                                  // Timestamp
        userEmail,                                                   // ID_Observador
        observationData.nome_observador || userEmail,                // Nome_Observador
        observationData.tipo_observador || 'Monitor',                // Tipo_Observador
        observationData.latitude || '',                              // Latitude
        observationData.longitude || '',                             // Longitude
        observationData.id_parcela || '',                            // ID_Parcela
        observationData.altitude_m || '',                            // Altitude_m
        observationData.zona_ecologica || '',                        // Zona_Ecologica
        observationData.reino || '',                                 // Reino
        observationData.filo || '',                                  // Filo
        observationData.classe || '',                                // Classe
        observationData.ordem || '',                                 // Ordem
        observationData.familia || '',                               // Familia
        observationData.genero || '',                                // Genero
        observationData.especie_cientifica || '',                    // Especie_Cientifica
        observationData.nome_popular || '',                          // Nome_Popular
        observationData.quantidade_individuos || 1,                  // Quantidade_Individuos
        observationData.estagio_vida || '',                          // Estagio_Vida
        observationData.comportamento_observado || '',               // Comportamento_Observado
        observationData.condicao_saude || 'Boa',                     // Condicao_Saude
        observationData.url_foto_principal || '',                    // URL_Foto_Principal
        JSON.stringify(observationData.urls_fotos_adicionais || []), // URLs_Fotos_Adicionais
        observationData.url_audio || '',                             // URL_Audio
        observationData.descricao_visual || '',                      // Descricao_Visual
        observationData.ia_confianca || 0,                           // IA_Confianca_Identificacao
        JSON.stringify(observationData.ia_especies_alternativas || []), // IA_Especies_Alternativas
        observationData.ia_insights || '',                           // IA_Insights_Ecologicos
        JSON.stringify(observationData.ia_alertas || []),            // IA_Alertas_Conservacao
        observationData.ia_status || 'Concluído',                    // IA_Status_Processamento
        observationData.especie_indicadora || false,                 // Especie_Indicadora
        observationData.especie_ameacada || false,                   // Especie_Ameacada
        observationData.categoria_iucn || 'NE',                      // Categoria_IUCN
        observationData.endemica_bioma || false,                     // Endemica_Bioma
        JSON.stringify(observationData.funcao_ecologica || []),      // Funcao_Ecologica
        observationData.temperatura_c || '',                         // Temperatura_C
        observationData.umidade_relativa || '',                      // Umidade_Relativa
        observationData.condicoes_climaticas || '',                  // Condicoes_Climaticas
        false,                                                       // Validado_Por_Especialista
        '',                                                          // ID_Validador
        '',                                                          // Notas_Validacao
        JSON.stringify(observationData.tags || []),                  // Tags
        'Publicado'                                                  // Status
      ];
      
      sheet.appendRow(row);
      
      // Atualiza contador de espécies
      this._updateSpeciesCounter();
      
      // Log da operação
      Logger.log(`[BiodiversityAIService] Observação registrada: ${id}`);
      
      return {
        success: true,
        id: id,
        message: 'Observação registrada com sucesso!',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.registerObservation] Erro: ${error}`);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Atualiza contador de espécies únicas
   */
  _updateSpeciesCounter: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        PropertiesService.getScriptProperties().setProperty('BIODIV_SPECIES_COUNT', '0');
        return;
      }
      
      const data = sheet.getDataRange().getValues();
      
      const uniqueSpecies = new Set();
      for (let i = 1; i < data.length; i++) {
        if (data[i][16]) { // coluna Especie_Cientifica
          uniqueSpecies.add(data[i][16]);
        }
      }
      
      PropertiesService.getScriptProperties()
        .setProperty('BIODIV_SPECIES_COUNT', uniqueSpecies.size.toString());
        
    } catch (error) {
      Logger.log(`[BiodiversityAIService._updateSpeciesCounter] Erro: ${error}`);
    }
  },
  
  /**
   * Obtém estatísticas de biodiversidade
   * @returns {object} Estatísticas completas
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          total_observacoes: 0,
          especies_unicas: 0,
          por_reino: {},
          por_zona: {},
          especies_ameacadas: 0,
          especies_endemicas: 0,
          especies_indicadoras: 0,
          observacoes_ultimos_30_dias: 0,
          observacoes_ultimos_7_dias: 0,
          media_confianca_ia: 0,
          top_especies: [],
          distribuicao_iucn: {}
        };
      }
      
      const data = sheet.getDataRange().getValues();
      
      const stats = {
        total_observacoes: data.length - 1,
        especies_unicas: 0,
        por_reino: {},
        por_zona: {},
        especies_ameacadas: 0,
        especies_endemicas: 0,
        especies_indicadoras: 0,
        observacoes_ultimos_30_dias: 0,
        observacoes_ultimos_7_dias: 0,
        media_confianca_ia: 0,
        top_especies: [],
        distribuicao_iucn: {}
      };
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const speciesCount = {};
      const uniqueSpecies = new Set();
      let totalConfianca = 0;
      let confiancaCount = 0;
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const timestamp = new Date(row[1]);
        const reino = row[10] || 'Não classificado';
        const zona = row[9] || 'Não especificada';
        const especie = row[16];
        const confianca = parseFloat(row[26]) || 0;
        const iucn = row[33] || 'NE';
        
        // Contagem por reino
        stats.por_reino[reino] = (stats.por_reino[reino] || 0) + 1;
        
        // Contagem por zona
        stats.por_zona[zona] = (stats.por_zona[zona] || 0) + 1;
        
        // Espécies únicas e contagem
        if (especie) {
          uniqueSpecies.add(especie);
          speciesCount[especie] = (speciesCount[especie] || 0) + 1;
        }
        
        // Espécies ameaçadas
        if (row[32]) stats.especies_ameacadas++;
        
        // Espécies endêmicas
        if (row[34]) stats.especies_endemicas++;
        
        // Espécies indicadoras
        if (row[31]) stats.especies_indicadoras++;
        
        // Distribuição IUCN
        stats.distribuicao_iucn[iucn] = (stats.distribuicao_iucn[iucn] || 0) + 1;
        
        // Confiança da IA
        if (confianca > 0) {
          totalConfianca += confianca;
          confiancaCount++;
        }
        
        // Observações recentes
        if (timestamp > thirtyDaysAgo) {
          stats.observacoes_ultimos_30_dias++;
        }
        if (timestamp > sevenDaysAgo) {
          stats.observacoes_ultimos_7_dias++;
        }
      }
      
      stats.especies_unicas = uniqueSpecies.size;
      stats.media_confianca_ia = confiancaCount > 0 ? (totalConfianca / confiancaCount).toFixed(2) : 0;
      
      // Top 10 espécies mais observadas
      stats.top_especies = Object.entries(speciesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([especie, count]) => ({ especie, count }));
      
      return stats;
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.getStatistics] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Obtém observações recentes
   * @param {number} limit - Número máximo de observações
   * @returns {Array} Lista de observações recentes
   */
  getRecentObservations: function(limit = 10) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Converte para objetos e ordena por data
      const observations = data.slice(1)
        .map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        })
        .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
        .slice(0, limit);
      
      return observations;
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.getRecentObservations] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Busca observações por espécie
   * @param {string} especie - Nome científico ou popular
   * @returns {Array} Lista de observações
   */
  searchBySpecies: function(especie) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const searchTerm = especie.toLowerCase();
      
      const results = data.slice(1)
        .filter(row => {
          const cientifica = (row[16] || '').toLowerCase();
          const popular = (row[17] || '').toLowerCase();
          return cientifica.includes(searchTerm) || popular.includes(searchTerm);
        })
        .map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
      
      return results;
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.searchBySpecies] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Obtém observações por zona ecológica
   * @param {string} zona - Nome da zona ecológica
   * @returns {Array} Lista de observações
   */
  getByZone: function(zona) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      const results = data.slice(1)
        .filter(row => row[9] === zona)
        .map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
      
      return results;
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.getByZone] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Obtém espécies ameaçadas registradas
   * @returns {Array} Lista de espécies ameaçadas
   */
  getEndangeredSpecies: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const endangeredCategories = ['VU', 'EN', 'CR'];
      
      const endangered = new Map();
      
      for (let i = 1; i < data.length; i++) {
        const especie = data[i][16];
        const iucn = data[i][33];
        const isAmeacada = data[i][32];
        
        if (especie && (endangeredCategories.includes(iucn) || isAmeacada)) {
          if (!endangered.has(especie)) {
            endangered.set(especie, {
              especie_cientifica: especie,
              nome_popular: data[i][17],
              categoria_iucn: iucn,
              total_observacoes: 0,
              ultima_observacao: null,
              zonas: new Set()
            });
          }
          
          const entry = endangered.get(especie);
          entry.total_observacoes++;
          entry.zonas.add(data[i][9]);
          
          const timestamp = new Date(data[i][1]);
          if (!entry.ultima_observacao || timestamp > entry.ultima_observacao) {
            entry.ultima_observacao = timestamp;
          }
        }
      }
      
      return Array.from(endangered.values()).map(e => ({
        ...e,
        zonas: Array.from(e.zonas)
      }));
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.getEndangeredSpecies] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Valida observação por especialista
   * @param {string} observationId - ID da observação
   * @param {string} validatorId - ID do validador
   * @param {string} notes - Notas de validação
   * @returns {object} Resultado da validação
   */
  validateObservation: function(observationId, validatorId, notes = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        throw new Error('Planilha não encontrada');
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === observationId) {
          // Atualiza campos de validação
          sheet.getRange(i + 1, 40).setValue(true);  // Validado_Por_Especialista
          sheet.getRange(i + 1, 41).setValue(validatorId);  // ID_Validador
          sheet.getRange(i + 1, 42).setValue(notes);  // Notas_Validacao
          
          return {
            success: true,
            message: 'Observação validada com sucesso'
          };
        }
      }
      
      return {
        success: false,
        error: 'Observação não encontrada'
      };
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.validateObservation] Erro: ${error}`);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Calcula índice de Shannon-Wiener para uma zona
   * @param {string} zona - Zona ecológica (opcional, calcula geral se não informado)
   * @returns {object} Índice de diversidade
   */
  calculateShannonIndex: function(zona = null) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { index: 0, richness: 0, evenness: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const speciesCounts = {};
      let total = 0;
      
      for (let i = 1; i < data.length; i++) {
        // Filtra por zona se especificado
        if (zona && data[i][9] !== zona) continue;
        
        const especie = data[i][16];
        const quantidade = parseInt(data[i][18]) || 1;
        
        if (especie) {
          speciesCounts[especie] = (speciesCounts[especie] || 0) + quantidade;
          total += quantidade;
        }
      }
      
      if (total === 0) {
        return { index: 0, richness: 0, evenness: 0 };
      }
      
      // Calcula índice de Shannon
      let shannon = 0;
      Object.values(speciesCounts).forEach(count => {
        const p = count / total;
        shannon -= p * Math.log(p);
      });
      
      const richness = Object.keys(speciesCounts).length;
      const maxShannon = Math.log(richness);
      const evenness = maxShannon > 0 ? shannon / maxShannon : 0;
      
      return {
        index: parseFloat(shannon.toFixed(4)),
        richness: richness,
        evenness: parseFloat(evenness.toFixed(4)),
        total_individuos: total,
        zona: zona || 'Todas'
      };
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.calculateShannonIndex] Erro: ${error}`);
      return { index: 0, richness: 0, evenness: 0, error: error.message };
    }
  },
  
  /**
   * Gera relatório de biodiversidade
   * @returns {object} Relatório completo
   */
  generateReport: function() {
    try {
      const stats = this.getStatistics();
      const endangered = this.getEndangeredSpecies();
      const shannonGeral = this.calculateShannonIndex();
      
      // Calcula Shannon por zona
      const zonas = ['Floresta', 'SAF', 'Nascente', 'Trilha', 'Jardim Terapêutico', 'Cerrado', 'Mata de Galeria', 'Vereda'];
      const shannonPorZona = {};
      
      zonas.forEach(zona => {
        shannonPorZona[zona] = this.calculateShannonIndex(zona);
      });
      
      return {
        gerado_em: new Date().toISOString(),
        resumo: {
          total_observacoes: stats.total_observacoes,
          especies_unicas: stats.especies_unicas,
          especies_ameacadas: stats.especies_ameacadas,
          especies_endemicas: stats.especies_endemicas
        },
        diversidade: {
          geral: shannonGeral,
          por_zona: shannonPorZona
        },
        distribuicao: {
          por_reino: stats.por_reino,
          por_zona: stats.por_zona,
          iucn: stats.distribuicao_iucn
        },
        especies_ameacadas: endangered,
        top_especies: stats.top_especies,
        tendencias: {
          ultimos_7_dias: stats.observacoes_ultimos_7_dias,
          ultimos_30_dias: stats.observacoes_ultimos_30_dias
        },
        qualidade_dados: {
          media_confianca_ia: stats.media_confianca_ia
        }
      };
      
    } catch (error) {
      Logger.log(`[BiodiversityAIService.generateReport] Erro: ${error}`);
      return { error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P01 Biodiversidade
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de biodiversidade
 * @returns {object} Resultado
 */
function apiBiodiversidadeInit() {
  return BiodiversityAIService.initializeSheet();
}

/**
 * Analisa imagem de espécie com IA
 * @param {string} imageBase64 - Imagem em base64
 * @param {object} context - Contexto da observação
 * @returns {object} Resultado da análise
 */
function apiBiodiversidadeAnalyzeImage(imageBase64, context) {
  return BiodiversityAIService.analyzeSpeciesImage(imageBase64, context);
}

/**
 * Registra observação de biodiversidade
 * @param {object} data - Dados da observação
 * @returns {object} Resultado
 */
function apiBiodiversidadeRegister(data) {
  return BiodiversityAIService.registerObservation(data);
}

/**
 * Obtém estatísticas de biodiversidade
 * @returns {object} Estatísticas
 */
function apiBiodiversidadeStats() {
  return BiodiversityAIService.getStatistics();
}

/**
 * Obtém observações recentes
 * @param {number} limit - Limite de resultados
 * @returns {Array} Observações
 */
function apiBiodiversidadeRecent(limit) {
  return BiodiversityAIService.getRecentObservations(limit || 10);
}

/**
 * Busca por espécie
 * @param {string} especie - Nome da espécie
 * @returns {Array} Resultados
 */
function apiBiodiversidadeSearch(especie) {
  return BiodiversityAIService.searchBySpecies(especie);
}

/**
 * Obtém espécies ameaçadas
 * @returns {Array} Espécies ameaçadas
 */
function apiBiodiversidadeEndangered() {
  return BiodiversityAIService.getEndangeredSpecies();
}

/**
 * Calcula índice de Shannon
 * @param {string} zona - Zona ecológica (opcional)
 * @returns {object} Índice de diversidade
 */
function apiBiodiversidadeShannon(zona) {
  return BiodiversityAIService.calculateShannonIndex(zona);
}

/**
 * Gera relatório completo de biodiversidade
 * @returns {object} Relatório
 */
function apiBiodiversidadeReport() {
  return BiodiversityAIService.generateReport();
}

/**
 * Valida observação por especialista
 * @param {string} observationId - ID da observação
 * @param {string} validatorId - ID do validador
 * @param {string} notes - Notas
 * @returns {object} Resultado
 */
function apiBiodiversidadeValidate(observationId, validatorId, notes) {
  return BiodiversityAIService.validateObservation(observationId, validatorId, notes);
}

/**
 * Obtém observações por zona
 * @param {string} zona - Nome da zona
 * @returns {Array} Observações
 */
function apiBiodiversidadeByZone(zona) {
  return BiodiversityAIService.getByZone(zona);
}
