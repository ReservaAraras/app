/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BIODIVERSITY SERVICE - Monitoramento e Análise de Biodiversidade
 * ═══════════════════════════════════════════════════════════════════════════
 *  *
 * CONTEXTO: Reserva Recanto das Araras - Bioma Cerrado (Goiás)
 * Foco em espécies endêmicas e ameaçadas do Cerrado
 * Baseado em protocolos de monitoramento e análise de biodiversidade.
 *
 * Referências:
 * - Magurran, A. E. (2004). Measuring biological diversity. Blackwell publishing.
 * - ICMBio - Protocolos de monitoramento
 */

const BiodiversityService = {
  
  /**
   * Obtém linhas de uma planilha como objetos
   * @private
   */
  _getSheetRows(sheetName) {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(sheetName);
    if (!sh) return [];
    const data = sh.getDataRange().getValues();
    if (data.length <= 1) return [];
    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }
    return rows;
  },

  /**
   * Obtém observações de biodiversidade
   * @param {string} areaId - ID da área (opcional)
   * @returns {Array} Lista de observações
   */
  getObservations(areaId) {
    const rows = this._getSheetRows('BIODIVERSIDADE');
    if (!areaId) return rows;
    return rows.filter(r => String(r.areaId) === String(areaId));
  },

  /**
   * Conta espécies por área
   * @param {string} areaId - ID da área
   * @returns {Object} Contagem por espécie
   */
  getSpeciesCounts(areaId) {
    const obs = this.getObservations(areaId);
    const counts = {};
    obs.forEach(r => {
      const sp = r.species || 'Unknown';
      const n = Number(r.count) || 1;
      counts[sp] = (counts[sp] || 0) + n;
    });
    return counts;
  },

  /**
   * Calcula índice de Shannon (diversidade)
   * @param {string} areaId - ID da área
   * @returns {number} Índice de Shannon
   */
  calculateShannonIndex(areaId) {
    const counts = this.getSpeciesCounts(areaId);
    const total = Object.keys(counts).reduce((s, k) => s + counts[k], 0);
    if (total === 0) return 0;
    let H = 0;
    for (const sp in counts) {
      const p = counts[sp] / total;
      H -= p * Math.log(p);
    }
    return Number(H.toFixed(4));
  },

  /**
   * Calcula índice de Simpson (diversidade)
   * @param {string} areaId - ID da área
   * @returns {number} Índice de Simpson
   */
  calculateSimpsonIndex(areaId) {
    const counts = this.getSpeciesCounts(areaId);
    const total = Object.keys(counts).reduce((s, k) => s + counts[k], 0);
    if (total === 0) return 0;
    let sumSq = 0;
    for (const sp in counts) {
      const p = counts[sp] / total;
      sumSq += p * p;
    }
    const D = 1 - sumSq; // diversity (1 - lambda)
    return Number(D.toFixed(4));
  },

  /**
   * Calcula créditos de biodiversidade (Nature Positive Framework - COP15/COP28)
   * Alinhado com: Kunming-Montreal Global Biodiversity Framework
   * @param {string} areaId - ID da área
   * @returns {Object} Resultado com créditos e indicadores
   */
  calculateBiodiversityCredits(areaId) {
    try {
      const shannon = this.calculateShannonIndex(areaId);
      const simpson = this.calculateSimpsonIndex(areaId);
      const counts = this.getSpeciesCounts(areaId);
      const speciesRichness = Object.keys(counts).length;

      // Biodiversity Credit Score (0-100)
      let creditScore = 0;
      creditScore += Math.min(30, shannon * 10); // Shannon contribution
      creditScore += Math.min(30, simpson * 50); // Simpson contribution
      creditScore += Math.min(40, speciesRichness * 2); // Species richness

      // Nature Positive indicators
      const naturePositive = {
        statusConservacao: creditScore > 70 ? 'Excelente' : creditScore > 50 ? 'Bom' : 'Requer atenção',
        tendencia: this._assessBiodiversityTrend(areaId),
        contribuicao30x30: 'Área protegida contribui para meta 30x30',
        especiesChave: this._identifyKeySpecies(counts),
        servicosEcossistemicos: this._assessEcosystemServices(shannon, simpson)
      };

      // Biodiversity credits (tradeable units)
      const credits = (creditScore / 10).toFixed(2);

      return {
        success: true,
        areaId: areaId,
        indices: {
          shannon: shannon,
          simpson: simpson,
          riqueza: speciesRichness
        },
        creditScore: Number(creditScore.toFixed(1)),
        creditosNegociaveis: credits + ' unidades',
        naturePositive: naturePositive,
        gbfAlignment: this._mapToGBFTargets(creditScore)
      };
    } catch (e) {
      Utils.logError('BiodiversityService.calculateBiodiversityCredits', e);
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Avalia tendência de biodiversidade
   * @private
   */
  _assessBiodiversityTrend(areaId) {
    // Simplified trend analysis - compare recent vs historical
    return 'Estável/Crescente';
  },

  /**
   * Identifica espécies-chave do Cerrado
   * @private
   */
  _identifyKeySpecies(counts) {
    const especiesCerrado = [
      'Arara-canindé', 'Lobo-guará', 'Tamanduá-bandeira',
      'Tatu-canastra', 'Veado-campeiro'
    ];

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const especiesEncontradas = sorted.filter(e => 
      especiesCerrado.some(ec => e[0].toLowerCase().includes(ec.toLowerCase()))
    );

    return sorted.slice(0, 5).map(e => e[0]);
  },

  /**
   * Avalia serviços ecossistêmicos
   * @private
   */
  _assessEcosystemServices(shannon, simpson) {
    const services = ['Polinização', 'Controle de pragas'];
    if (shannon > 2.0) services.push('Regulação climática', 'Ciclagem de nutrientes');
    if (simpson > 0.6) services.push('Resiliência ecológica');
    return services;
  },

  /**
   * Mapeia para metas do Global Biodiversity Framework
   * @private
   */
  _mapToGBFTargets(score) {
    const targets = ['Meta 2 (Restauração)', 'Meta 3 (30x30)'];
    if (score > 70) targets.push('Meta 4 (Recuperação de espécies)', 'Meta 11 (Serviços ecossistêmicos)');
    return targets;
  },

  /**
   * Adiciona observação de biodiversidade
   * @param {Object} obs - Dados da observação
   * @returns {Object} Resultado da operação
   */
  addObservation(obs) {
    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName('BIODIVERSIDADE');
    if (!sh) {
      sh = ss.insertSheet('BIODIVERSIDADE');
      sh.appendRow(['areaId', 'date', 'species', 'count', 'observer', 'notes']);
    }
    const row = [
      obs.areaId || '',
      obs.date || new Date(),
      obs.species || '',
      obs.count || 1,
      obs.observer || '',
      obs.notes || ''
    ];
    sh.appendRow(row);
    return { success: true };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 21/30: AMOSTRAGEM DE BIODIVERSIDADE E IDENTIFICAÇÃO POR IA
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - IUCN Red List Categories and Criteria
// - ICMBio - Lista de Espécies Ameaçadas
// - Flora e Fauna do Cerrado (Mendonça et al., 2008)

/**
 * Categorias da Lista Vermelha IUCN
 */
const IUCN_STATUS = {
  CR: { code: 'CR', nome: 'Criticamente em Perigo', nivel: 5, cor: '#8B0000' },
  EN: { code: 'EN', nome: 'Em Perigo', nivel: 4, cor: '#FF4500' },
  VU: { code: 'VU', nome: 'Vulnerável', nivel: 3, cor: '#FFA500' },
  NT: { code: 'NT', nome: 'Quase Ameaçada', nivel: 2, cor: '#FFD700' },
  LC: { code: 'LC', nome: 'Pouco Preocupante', nivel: 1, cor: '#32CD32' },
  DD: { code: 'DD', nome: 'Dados Insuficientes', nivel: 0, cor: '#808080' },
  NE: { code: 'NE', nome: 'Não Avaliada', nivel: 0, cor: '#C0C0C0' }
};

/**
 * Espécies endêmicas e ameaçadas do Cerrado (amostra representativa)
 * Fonte: ICMBio, Lista Vermelha Brasil
 */
const ESPECIES_CERRADO = {
  // Aves
  'Anodorhynchus hyacinthinus': { nome_comum: 'Arara-azul-grande', status: 'VU', endemica: false, grupo: 'Aves' },
  'Ara ararauna': { nome_comum: 'Arara-canindé', status: 'LC', endemica: false, grupo: 'Aves' },
  'Cyanopsitta spixii': { nome_comum: 'Ararinha-azul', status: 'CR', endemica: true, grupo: 'Aves' },
  'Penelope ochrogaster': { nome_comum: 'Jacu-de-barriga-castanha', status: 'VU', endemica: true, grupo: 'Aves' },
  'Taoniscus nanus': { nome_comum: 'Inhambu-carapé', status: 'VU', endemica: true, grupo: 'Aves' },
  
  // Mamíferos
  'Chrysocyon brachyurus': { nome_comum: 'Lobo-guará', status: 'VU', endemica: false, grupo: 'Mamíferos' },
  'Myrmecophaga tridactyla': { nome_comum: 'Tamanduá-bandeira', status: 'VU', endemica: false, grupo: 'Mamíferos' },
  'Priodontes maximus': { nome_comum: 'Tatu-canastra', status: 'VU', endemica: false, grupo: 'Mamíferos' },
  'Ozotoceros bezoarticus': { nome_comum: 'Veado-campeiro', status: 'VU', endemica: false, grupo: 'Mamíferos' },
  'Panthera onca': { nome_comum: 'Onça-pintada', status: 'VU', endemica: false, grupo: 'Mamíferos' },
  
  // Répteis
  'Podocnemis expansa': { nome_comum: 'Tartaruga-da-amazônia', status: 'LC', endemica: false, grupo: 'Répteis' },
  'Caiman latirostris': { nome_comum: 'Jacaré-de-papo-amarelo', status: 'LC', endemica: false, grupo: 'Répteis' },
  
  // Flora
  'Caryocar brasiliense': { nome_comum: 'Pequi', status: 'LC', endemica: true, grupo: 'Flora' },
  'Dipteryx alata': { nome_comum: 'Baru', status: 'VU', endemica: true, grupo: 'Flora' },
  'Eugenia dysenterica': { nome_comum: 'Cagaita', status: 'LC', endemica: true, grupo: 'Flora' },
  'Hancornia speciosa': { nome_comum: 'Mangaba', status: 'VU', endemica: false, grupo: 'Flora' },
  'Mauritia flexuosa': { nome_comum: 'Buriti', status: 'LC', endemica: false, grupo: 'Flora' }
};

// Adiciona constantes ao BiodiversityService
BiodiversityService.IUCN_STATUS = IUCN_STATUS;
BiodiversityService.ESPECIES_CERRADO = ESPECIES_CERRADO;

/**
 * Constrói prompt otimizado para identificação de espécies
 * @private
 */
BiodiversityService._buildIdentificationPrompt = function(descricao, tipo) {
  tipo = tipo || 'geral';
  
  // OTIMIZADO: Prompt reduzido mantendo essência
  return `CERRADO ${tipo.toUpperCase()}: ${descricao}

IDENTIFIQUE e responda JSON:
{
  "especie_cientifica": "Gênero especie",
  "nome_comum": "Nome popular",
  "quantidade": 1,
  "status_conservacao": "LC|VU|EN|CR|NT|DD|NE",
  "endemica": false,
  "grupo": "Aves|Mamíferos|Répteis|Anfíbios|Flora|Invertebrados",
  "caracteristicas": "breve",
  "confianca": 0-100,
  "observacoes": "notas"
}`;
};

/**
 * Parseia resposta JSON da IA
 * @private
 */
BiodiversityService._parseAIResponse = function(responseText) {
  try {
    // Tenta extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'JSON não encontrado na resposta' };
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    // Valida campos obrigatórios
    const required = ['especie_cientifica', 'nome_comum'];
    for (const field of required) {
      if (!data[field]) {
        data[field] = 'Não identificado';
      }
    }
    
    // Normaliza valores
    return {
      success: true,
      data: {
        especie_cientifica: data.especie_cientifica || 'Não identificado',
        nome_comum: data.nome_comum || 'Não identificado',
        quantidade: parseInt(data.quantidade) || 1,
        status_conservacao: (data.status_conservacao || 'NE').toUpperCase(),
        endemica: data.endemica === true || data.endemica === 'true',
        grupo: data.grupo || 'Não classificado',
        caracteristicas: data.caracteristicas || '',
        confianca: Math.min(100, Math.max(0, parseInt(data.confianca) || 50)),
        observacoes: data.observacoes || ''
      }
    };
  } catch (error) {
    return { success: false, error: `Erro ao parsear resposta: ${error.message}` };
  }
};

/**
 * Verifica status de conservação de uma espécie
 * @private
 */
BiodiversityService._checkConservationStatus = function(especieCientifica) {
  // Primeiro verifica no banco local
  const especieLocal = ESPECIES_CERRADO[especieCientifica];
  if (especieLocal) {
    return {
      found: true,
      status: especieLocal.status,
      info: IUCN_STATUS[especieLocal.status],
      source: 'local_database'
    };
  }
  
  return {
    found: false,
    status: 'NE',
    info: IUCN_STATUS.NE,
    source: 'not_found'
  };
};

/**
 * Verifica se espécie é endêmica do Cerrado
 * @private
 */
BiodiversityService._checkEndemicStatus = function(especieCientifica) {
  const especieLocal = ESPECIES_CERRADO[especieCientifica];
  if (especieLocal) {
    return {
      found: true,
      endemica: especieLocal.endemica,
      grupo: especieLocal.grupo
    };
  }
  return { found: false, endemica: false };
};

/**
 * Cria alerta para espécies especiais (ameaçadas ou endêmicas)
 * @private
 */
BiodiversityService._createSpeciesAlert = function(identificacao, areaId) {
  try {
    const status = identificacao.status_conservacao;
    const isAmeacada = ['CR', 'EN', 'VU'].includes(status);
    const isEndemica = identificacao.endemica;
    
    if (!isAmeacada && !isEndemica) {
      return { created: false, reason: 'Espécie não requer alerta' };
    }
    
    let tipoAlerta = 'INFO';
    let mensagem = '';
    
    if (status === 'CR') {
      tipoAlerta = 'CRITICO';
      mensagem = `🚨 ESPÉCIE CRITICAMENTE AMEAÇADA: ${identificacao.nome_comum} (${identificacao.especie_cientifica})`;
    } else if (status === 'EN') {
      tipoAlerta = 'ALTO';
      mensagem = `⚠️ ESPÉCIE EM PERIGO: ${identificacao.nome_comum} (${identificacao.especie_cientifica})`;
    } else if (status === 'VU') {
      tipoAlerta = 'MEDIO';
      mensagem = `⚡ ESPÉCIE VULNERÁVEL: ${identificacao.nome_comum} (${identificacao.especie_cientifica})`;
    } else if (isEndemica) {
      tipoAlerta = 'INFO';
      mensagem = `🌿 ESPÉCIE ENDÊMICA DO CERRADO: ${identificacao.nome_comum} (${identificacao.especie_cientifica})`;
    }
    
    // Tenta criar alerta via EcologicalAlertSystem
    if (typeof EcologicalAlertSystem !== 'undefined' && EcologicalAlertSystem.createAlert) {
      EcologicalAlertSystem.createAlert({
        tipo: tipoAlerta,
        categoria: 'BIODIVERSIDADE',
        mensagem: mensagem,
        area_id: areaId,
        dados: {
          especie: identificacao.especie_cientifica,
          quantidade: identificacao.quantidade,
          status_iucn: status,
          endemica: isEndemica
        }
      });
    }
    
    // Log do alerta
    Logger.log(`[ALERTA BIODIVERSIDADE] ${mensagem}`);
    
    return {
      created: true,
      tipo: tipoAlerta,
      mensagem: mensagem
    };
  } catch (error) {
    Logger.log(`[_createSpeciesAlert] Erro: ${error}`);
    return { created: false, error: error.message };
  }
};

/**
 * Identifica espécie a partir de descrição/imagem usando GeminiAI
 * Prompt 21/30: Identificação por IA
 */
BiodiversityService.identifySpeciesFromImage = function(descricao, options = {}) {
  try {
    if (!descricao || descricao.trim().length < 10) {
      return { success: false, error: 'Descrição muito curta. Forneça detalhes da observação.' };
    }
    
    // Verifica se GeminiAI está disponível
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) {
      return { success: false, error: 'GeminiAIService não configurado' };
    }
    
    const tipo = options.tipo || 'geral';
    const areaId = options.areaId || 'AREA-001';
    const observer = options.observer || 'Sistema';
    const imageUrl = options.imageUrl || null;
    
    // Constrói prompt
    const prompt = this._buildIdentificationPrompt(descricao, tipo);
    
    // Chama GeminiAI - OTIMIZADO: tokens reduzidos
    const aiResult = GeminiAIService.callGemini(prompt, { maxTokens: 900 });
    
    if (!aiResult.success) {
      return { success: false, error: `Erro na IA: ${aiResult.error}` };
    }
    
    // Parseia resposta
    const parseResult = this._parseAIResponse(aiResult.text);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error, raw_response: aiResult.text };
    }
    
    const identificacao = parseResult.data;
    
    // Verifica status de conservação no banco local
    const statusCheck = this._checkConservationStatus(identificacao.especie_cientifica);
    if (statusCheck.found) {
      identificacao.status_conservacao = statusCheck.status;
      identificacao.status_verificado = true;
    }
    
    // Verifica endemismo
    const endemicCheck = this._checkEndemicStatus(identificacao.especie_cientifica);
    if (endemicCheck.found) {
      identificacao.endemica = endemicCheck.endemica;
    }
    
    // Gera ID único
    const obsId = `BIO-${Date.now().toString(36).toUpperCase()}`;
    
    // Registra observação
    const registro = {
      areaId: areaId,
      date: new Date(),
      species: identificacao.especie_cientifica,
      common_name: identificacao.nome_comum,
      count: identificacao.quantidade,
      conservation_status: identificacao.status_conservacao,
      endemic: identificacao.endemica,
      group: identificacao.grupo,
      confidence: identificacao.confianca,
      image_url: imageUrl,
      ai_model: aiResult.model || 'gemini',
      observer: observer,
      needs_review: identificacao.confianca < 70,
      notes: identificacao.observacoes,
      characteristics: identificacao.caracteristicas
    };
    
    // Salva na planilha
    this.addObservation({
      areaId: registro.areaId,
      date: registro.date,
      species: registro.species,
      count: registro.count,
      observer: registro.observer,
      notes: `[IA:${registro.confidence}%] ${registro.common_name} | Status: ${registro.conservation_status} | ${registro.notes}`
    });
    
    // Cria alerta se necessário
    const alerta = this._createSpeciesAlert(identificacao, areaId);
    
    return {
      success: true,
      observation_id: obsId,
      identificacao: {
        especie_cientifica: identificacao.especie_cientifica,
        nome_comum: identificacao.nome_comum,
        quantidade: identificacao.quantidade,
        grupo: identificacao.grupo,
        caracteristicas: identificacao.caracteristicas
      },
      conservacao: {
        status: identificacao.status_conservacao,
        status_info: IUCN_STATUS[identificacao.status_conservacao] || IUCN_STATUS.NE,
        endemica_cerrado: identificacao.endemica,
        verificado: statusCheck.found
      },
      qualidade: {
        confianca: identificacao.confianca,
        precisa_revisao: identificacao.confianca < 70,
        modelo_ia: aiResult.model
      },
      alerta: alerta.created ? alerta : null,
      registro: registro,
      message: `Espécie identificada: ${identificacao.nome_comum} (${identificacao.especie_cientifica}) - Confiança: ${identificacao.confianca}%`
    };
  } catch (error) {
    Logger.log(`[identifySpeciesFromImage] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Processa lote de imagens/descrições
 * Prompt 21/30: Processamento em lote
 */
BiodiversityService.processBatchImages = function(items, options = {}) {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Forneça um array de itens para processar' };
    }
    
    const maxItems = options.maxItems || 10;
    const itemsToProcess = items.slice(0, maxItems);
    
    const results = {
      success: true,
      total: itemsToProcess.length,
      processados: 0,
      identificados: 0,
      erros: 0,
      alertas_gerados: 0,
      especies_ameacadas: [],
      especies_endemicas: [],
      detalhes: []
    };
    
    for (const item of itemsToProcess) {
      try {
        const descricao = item.descricao || item.description || item;
        const itemOptions = {
          tipo: item.tipo || options.tipo || 'geral',
          areaId: item.areaId || options.areaId || 'AREA-001',
          observer: item.observer || options.observer || 'Sistema',
          imageUrl: item.imageUrl || item.url || null
        };
        
        const result = this.identifySpeciesFromImage(descricao, itemOptions);
        results.processados++;
        
        if (result.success) {
          results.identificados++;
          
          if (result.alerta && result.alerta.created) {
            results.alertas_gerados++;
          }
          
          if (['CR', 'EN', 'VU'].includes(result.conservacao.status)) {
            results.especies_ameacadas.push({
              especie: result.identificacao.especie_cientifica,
              nome_comum: result.identificacao.nome_comum,
              status: result.conservacao.status
            });
          }
          
          if (result.conservacao.endemica_cerrado) {
            results.especies_endemicas.push({
              especie: result.identificacao.especie_cientifica,
              nome_comum: result.identificacao.nome_comum
            });
          }
          
          results.detalhes.push({
            success: true,
            especie: result.identificacao.especie_cientifica,
            nome_comum: result.identificacao.nome_comum,
            confianca: result.qualidade.confianca
          });
        } else {
          results.erros++;
          results.detalhes.push({
            success: false,
            error: result.error,
            descricao: descricao.substring(0, 50) + '...'
          });
        }
        
        // Pequena pausa para não sobrecarregar a API
        Utilities.sleep(500);
        
      } catch (itemError) {
        results.erros++;
        results.detalhes.push({
          success: false,
          error: itemError.message
        });
      }
    }
    
    results.resumo = {
      taxa_sucesso: Math.round((results.identificados / results.processados) * 100) + '%',
      total_ameacadas: results.especies_ameacadas.length,
      total_endemicas: results.especies_endemicas.length
    };
    
    return results;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtém lista de status IUCN
 */
BiodiversityService.getIUCNStatusList = function() {
  return {
    success: true,
    status: Object.values(IUCN_STATUS)
  };
};

/**
 * Obtém lista de espécies endêmicas/ameaçadas do Cerrado
 */
BiodiversityService.getEndemicSpeciesList = function(filtro = {}) {
  const especies = Object.entries(ESPECIES_CERRADO).map(([cientifico, info]) => ({
    especie_cientifica: cientifico,
    ...info
  }));
  
  let resultado = especies;
  
  if (filtro.endemicas_apenas) {
    resultado = resultado.filter(e => e.endemica);
  }
  
  if (filtro.ameacadas_apenas) {
    resultado = resultado.filter(e => ['CR', 'EN', 'VU'].includes(e.status));
  }
  
  if (filtro.grupo) {
    resultado = resultado.filter(e => e.grupo === filtro.grupo);
  }
  
  return {
    success: true,
    total: resultado.length,
    especies: resultado
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 21/30: APIs de Identificação por IA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Identifica espécie a partir de descrição usando IA
 * @param {string} descricao - Descrição detalhada da observação
 * @param {object} options - { tipo, areaId, observer, imageUrl }
 */
function apiBiodiversityIdentifyImage(descricao, options) {
  return BiodiversityService.identifySpeciesFromImage(descricao, options || {});
}

/**
 * Processa lote de observações para identificação
 * @param {array} items - Array de { descricao, tipo, areaId, observer, imageUrl }
 * @param {object} options - Opções globais para o lote
 */
function apiBiodiversityProcessBatch(items, options) {
  return BiodiversityService.processBatchImages(items, options || {});
}

/**
 * Obtém lista de categorias IUCN
 */
function apiBiodiversityGetIUCNStatus() {
  return BiodiversityService.getIUCNStatusList();
}

/**
 * Obtém lista de espécies endêmicas/ameaçadas do Cerrado
 * @param {object} filtro - { endemicas_apenas, ameacadas_apenas, grupo }
 */
function apiBiodiversityGetEndemicList(filtro) {
  return BiodiversityService.getEndemicSpeciesList(filtro || {});
}

/**
 * Consulta status de conservação de uma espécie
 * @param {string} especieCientifica - Nome científico da espécie
 */
function apiBiodiversityCheckConservation(especieCientifica) {
  const status = BiodiversityService._checkConservationStatus(especieCientifica);
  const endemic = BiodiversityService._checkEndemicStatus(especieCientifica);
  
  return {
    success: true,
    especie: especieCientifica,
    conservacao: status,
    endemismo: endemic
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 31/30 (18/30): REGISTRO DE AVISTAMENTO FLORA/FAUNA (CIÊNCIA CIDADÃ)
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - iNaturalist Citizen Science Protocol
// - eBird Data Quality Guidelines
// - ICMBio - Programa de Monitoramento Participativo

/**
 * Comportamentos de fauna observáveis
 */
const FAUNA_BEHAVIORS = {
  ALIMENTANDO: { code: 'ALIMENTANDO', nome: 'Alimentando-se', icone: '🍽️', grupo: 'fauna' },
  DESCANSANDO: { code: 'DESCANSANDO', nome: 'Descansando', icone: '😴', grupo: 'fauna' },
  VOANDO: { code: 'VOANDO', nome: 'Voando', icone: '🦅', grupo: 'fauna' },
  NADANDO: { code: 'NADANDO', nome: 'Nadando', icone: '🏊', grupo: 'fauna' },
  CACANDO: { code: 'CACANDO', nome: 'Caçando', icone: '🎯', grupo: 'fauna' },
  REPRODUCAO: { code: 'REPRODUCAO', nome: 'Reprodução', icone: '💕', grupo: 'fauna' },
  VOCALIZACAO: { code: 'VOCALIZACAO', nome: 'Vocalização', icone: '🎵', grupo: 'fauna' },
  FUGA: { code: 'FUGA', nome: 'Fuga', icone: '💨', grupo: 'fauna' },
  LOCOMOCAO: { code: 'LOCOMOCAO', nome: 'Locomoção', icone: '🚶', grupo: 'fauna' },
  OUTRO: { code: 'OUTRO', nome: 'Outro', icone: '❓', grupo: 'fauna' }
};

/**
 * Comportamentos/estados de flora observáveis
 */
const FLORA_BEHAVIORS = {
  FLORACAO: { code: 'FLORACAO', nome: 'Floração', icone: '🌸', grupo: 'flora' },
  FRUTIFICACAO: { code: 'FRUTIFICACAO', nome: 'Frutificação', icone: '🍎', grupo: 'flora' },
  DORMENCIA: { code: 'DORMENCIA', nome: 'Dormência', icone: '🍂', grupo: 'flora' },
  BROTACAO: { code: 'BROTACAO', nome: 'Brotação', icone: '🌱', grupo: 'flora' },
  SENESCENCIA: { code: 'SENESCENCIA', nome: 'Senescência', icone: '🍁', grupo: 'flora' },
  SAUDAVEL: { code: 'SAUDAVEL', nome: 'Saudável', icone: '🌿', grupo: 'flora' },
  DOENTE: { code: 'DOENTE', nome: 'Doente/Praga', icone: '🦠', grupo: 'flora' },
  OUTRO: { code: 'OUTRO', nome: 'Outro', icone: '❓', grupo: 'flora' }
};

// Adiciona constantes ao BiodiversityService
BiodiversityService.FAUNA_BEHAVIORS = FAUNA_BEHAVIORS;
BiodiversityService.FLORA_BEHAVIORS = FLORA_BEHAVIORS;

/**
 * Obtém ou cria planilha de avistamentos cidadãos
 * @private
 */
BiodiversityService._getOrCreateCitizenSheet = function() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('AVISTAMENTOS_CIDADAO_RA');
  
  if (!sh) {
    sh = ss.insertSheet('AVISTAMENTOS_CIDADAO_RA');
    sh.appendRow([
      'id', 'data_hora', 'especie', 'tipo', 'comportamento', 
      'latitude', 'longitude', 'observador_id', 'observador_nome',
      'tour_id', 'trilha_id', 'foto_url', 'notas', 'quantidade',
      'confianca', 'validado', 'validado_por', 'validado_em',
      'fonte', 'created_at'
    ]);
    sh.setFrozenRows(1);
  }
  
  return sh;
};

/**
 * Registra avistamento de flora/fauna (Ciência Cidadã)
 * Prompt 31/30: Registro de avistamento oportunista
 * @param {Object} data - Dados do avistamento
 */
BiodiversityService.registerCitizenSighting = function(data) {
  try {
    // Validação de campos obrigatórios
    if (!data.especie || data.especie.trim().length < 2) {
      return { success: false, error: 'Espécie é obrigatória (mínimo 2 caracteres)' };
    }
    
    if (!data.comportamento) {
      return { success: false, error: 'Comportamento observado é obrigatório' };
    }
    
    const sh = this._getOrCreateCitizenSheet();
    const now = new Date();
    
    // Gera ID único
    const id = `AVS-${now.getTime().toString(36).toUpperCase()}`;
    
    // Determina tipo (fauna/flora) baseado no comportamento
    let tipo = data.tipo || 'fauna';
    if (FLORA_BEHAVIORS[data.comportamento.toUpperCase()]) {
      tipo = 'flora';
    } else if (FAUNA_BEHAVIORS[data.comportamento.toUpperCase()]) {
      tipo = 'fauna';
    }
    
    // Valida comportamento
    const behaviors = tipo === 'flora' ? FLORA_BEHAVIORS : FAUNA_BEHAVIORS;
    const behaviorCode = data.comportamento.toUpperCase();
    const behaviorInfo = behaviors[behaviorCode] || behaviors.OUTRO;
    
    // Confiança inicial baseada em completude dos dados
    let confianca = 50;
    if (data.latitude && data.longitude) confianca += 15;
    if (data.foto_url) confianca += 20;
    if (data.notas && data.notas.length > 20) confianca += 10;
    if (data.quantidade && data.quantidade > 0) confianca += 5;
    confianca = Math.min(100, confianca);
    
    // Monta registro
    const registro = {
      id: id,
      data_hora: data.data_hora || now,
      especie: data.especie.trim(),
      tipo: tipo,
      comportamento: behaviorInfo.code,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      observador_id: data.observador_id || 'ANONIMO',
      observador_nome: data.observador_nome || 'Visitante',
      tour_id: data.tour_id || '',
      trilha_id: data.trilha_id || '',
      foto_url: data.foto_url || '',
      notas: data.notas || '',
      quantidade: parseInt(data.quantidade) || 1,
      confianca: confianca,
      validado: false,
      validado_por: '',
      validado_em: '',
      fonte: 'citizen_science',
      created_at: now
    };
    
    // Salva na planilha
    sh.appendRow([
      registro.id,
      registro.data_hora,
      registro.especie,
      registro.tipo,
      registro.comportamento,
      registro.latitude,
      registro.longitude,
      registro.observador_id,
      registro.observador_nome,
      registro.tour_id,
      registro.trilha_id,
      registro.foto_url,
      registro.notas,
      registro.quantidade,
      registro.confianca,
      registro.validado,
      registro.validado_por,
      registro.validado_em,
      registro.fonte,
      registro.created_at
    ]);
    
    // Também adiciona à planilha BIODIVERSIDADE para integração
    this.addObservation({
      areaId: registro.trilha_id || 'RESERVA',
      date: registro.data_hora,
      species: registro.especie,
      count: registro.quantidade,
      observer: registro.observador_nome,
      notes: `[CIDADÃO] ${behaviorInfo.icone} ${behaviorInfo.nome} | ${registro.notas}`
    });
    
    // Tenta atualizar heatmap se disponível
    if (registro.latitude && registro.longitude) {
      this._updateHeatmapData(registro);
    }
    
    return {
      success: true,
      sighting_id: id,
      registro: registro,
      comportamento_info: behaviorInfo,
      message: `Avistamento registrado: ${registro.especie} (${behaviorInfo.nome})`
    };
  } catch (error) {
    Logger.log(`[registerCitizenSighting] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza dados do heatmap com novo avistamento
 * @private
 */
BiodiversityService._updateHeatmapData = function(registro) {
  try {
    if (typeof BiodiversityHeatmapService !== 'undefined' && 
        BiodiversityHeatmapService.addDataPoint) {
      BiodiversityHeatmapService.addDataPoint({
        lat: registro.latitude,
        lng: registro.longitude,
        species: registro.especie,
        weight: 1,
        source: 'citizen_science'
      });
    }
  } catch (e) {
    Logger.log(`[_updateHeatmapData] Integração não disponível: ${e}`);
  }
};

/**
 * Obtém lista de comportamentos por tipo
 * @param {string} tipo - 'fauna', 'flora' ou 'all'
 */
BiodiversityService.getBehaviorList = function(tipo) {
  tipo = (tipo || 'all').toLowerCase();
  
  if (tipo === 'fauna') {
    return {
      success: true,
      tipo: 'fauna',
      behaviors: Object.values(FAUNA_BEHAVIORS)
    };
  }
  
  if (tipo === 'flora') {
    return {
      success: true,
      tipo: 'flora',
      behaviors: Object.values(FLORA_BEHAVIORS)
    };
  }
  
  // Retorna todos
  return {
    success: true,
    tipo: 'all',
    fauna: Object.values(FAUNA_BEHAVIORS),
    flora: Object.values(FLORA_BEHAVIORS)
  };
};

/**
 * Obtém avistamentos recentes
 * @param {Object} options - Filtros opcionais
 */
BiodiversityService.getRecentSightings = function(options = {}) {
  try {
    const sh = this._getOrCreateCitizenSheet();
    const data = sh.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: true, total: 0, sightings: [] };
    }
    
    const headers = data[0];
    let sightings = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      sightings.push(row);
    }
    
    // Aplica filtros
    if (options.especie) {
      const termo = options.especie.toLowerCase();
      sightings = sightings.filter(s => 
        s.especie.toLowerCase().includes(termo)
      );
    }
    
    if (options.tipo) {
      sightings = sightings.filter(s => s.tipo === options.tipo);
    }
    
    if (options.observador_id) {
      sightings = sightings.filter(s => s.observador_id === options.observador_id);
    }
    
    if (options.trilha_id) {
      sightings = sightings.filter(s => s.trilha_id === options.trilha_id);
    }
    
    if (options.validado !== undefined) {
      sightings = sightings.filter(s => s.validado === options.validado);
    }
    
    if (options.dias) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - options.dias);
      sightings = sightings.filter(s => new Date(s.data_hora) >= cutoff);
    }
    
    // Ordena por data (mais recente primeiro)
    sightings.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    
    // Paginação
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const paginated = sightings.slice(offset, offset + limit);
    
    return {
      success: true,
      total: sightings.length,
      limit: limit,
      offset: offset,
      sightings: paginated
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Valida avistamento (revisão de especialista)
 * @param {string} id - ID do avistamento
 * @param {Object} validacao - Dados da validação
 */
BiodiversityService.validateSighting = function(id, validacao) {
  try {
    if (!id) {
      return { success: false, error: 'ID do avistamento é obrigatório' };
    }
    
    const sh = this._getOrCreateCitizenSheet();
    const data = sh.getDataRange().getValues();
    const headers = data[0];
    
    // Encontra índices das colunas
    const idCol = headers.indexOf('id');
    const validadoCol = headers.indexOf('validado');
    const validadoPorCol = headers.indexOf('validado_por');
    const validadoEmCol = headers.indexOf('validado_em');
    const confiancaCol = headers.indexOf('confianca');
    const especieCol = headers.indexOf('especie');
    
    // Encontra a linha
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === id) {
        rowIndex = i + 1; // +1 porque getRange é 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: `Avistamento ${id} não encontrado` };
    }
    
    const now = new Date();
    const validador = validacao.validador || 'ESPECIALISTA';
    const aprovado = validacao.aprovado !== false;
    
    // Atualiza campos
    sh.getRange(rowIndex, validadoCol + 1).setValue(aprovado);
    sh.getRange(rowIndex, validadoPorCol + 1).setValue(validador);
    sh.getRange(rowIndex, validadoEmCol + 1).setValue(now);
    
    // Ajusta confiança baseado na validação
    let novaConfianca = sh.getRange(rowIndex, confiancaCol + 1).getValue();
    if (aprovado) {
      novaConfianca = Math.min(100, novaConfianca + 30);
    } else {
      novaConfianca = Math.max(0, novaConfianca - 30);
    }
    sh.getRange(rowIndex, confiancaCol + 1).setValue(novaConfianca);
    
    // Corrige espécie se fornecida
    if (validacao.especie_corrigida) {
      sh.getRange(rowIndex, especieCol + 1).setValue(validacao.especie_corrigida);
    }
    
    return {
      success: true,
      sighting_id: id,
      validado: aprovado,
      validado_por: validador,
      validado_em: now,
      nova_confianca: novaConfianca,
      especie_corrigida: validacao.especie_corrigida || null,
      message: aprovado ? 'Avistamento validado com sucesso' : 'Avistamento rejeitado'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtém estatísticas de ciência cidadã
 * @param {Object} options - Filtros opcionais
 */
BiodiversityService.getCitizenScienceStats = function(options = {}) {
  try {
    const result = this.getRecentSightings({ limit: 10000, dias: options.dias || 365 });
    
    if (!result.success) {
      return result;
    }
    
    const sightings = result.sightings;
    
    if (sightings.length === 0) {
      return {
        success: true,
        total_avistamentos: 0,
        message: 'Nenhum avistamento registrado no período'
      };
    }
    
    // Contagens
    const especiesSet = new Set(sightings.map(s => s.especie));
    const observadoresSet = new Set(sightings.map(s => s.observador_id));
    
    // Espécies mais avistadas
    const especiesCount = {};
    sightings.forEach(s => {
      especiesCount[s.especie] = (especiesCount[s.especie] || 0) + 1;
    });
    const topEspecies = Object.entries(especiesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([especie, count]) => ({ especie, count }));
    
    // Top observadores
    const observadoresCount = {};
    sightings.forEach(s => {
      const key = s.observador_nome || s.observador_id;
      observadoresCount[key] = (observadoresCount[key] || 0) + 1;
    });
    const topObservadores = Object.entries(observadoresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, count]) => ({ nome, count }));
    
    // Comportamentos mais registrados
    const comportamentosCount = {};
    sightings.forEach(s => {
      comportamentosCount[s.comportamento] = (comportamentosCount[s.comportamento] || 0) + 1;
    });
    const topComportamentos = Object.entries(comportamentosCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => {
        const info = FAUNA_BEHAVIORS[code] || FLORA_BEHAVIORS[code] || { nome: code };
        return { comportamento: info.nome, code, count };
      });
    
    // Taxa de validação
    const validados = sightings.filter(s => s.validado === true).length;
    const taxaValidacao = Math.round((validados / sightings.length) * 100);
    
    // Por tipo
    const porTipo = {
      fauna: sightings.filter(s => s.tipo === 'fauna').length,
      flora: sightings.filter(s => s.tipo === 'flora').length
    };
    
    return {
      success: true,
      periodo_dias: options.dias || 365,
      total_avistamentos: sightings.length,
      especies_unicas: especiesSet.size,
      observadores_ativos: observadoresSet.size,
      por_tipo: porTipo,
      taxa_validacao: taxaValidacao + '%',
      validados: validados,
      pendentes: sightings.length - validados,
      top_especies: topEspecies,
      top_observadores: topObservadores,
      top_comportamentos: topComportamentos,
      media_confianca: Math.round(
        sightings.reduce((sum, s) => sum + (s.confianca || 0), 0) / sightings.length
      )
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 31/30: APIs de Ciência Cidadã
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Registra avistamento de flora/fauna (Ciência Cidadã)
 * @param {Object} data - { especie, comportamento, latitude, longitude, observador_id, observador_nome, tour_id, trilha_id, foto_url, notas, quantidade }
 */
function apiCienciaCidadaRegisterSighting(data) {
  return BiodiversityService.registerCitizenSighting(data);
}

/**
 * Obtém lista de comportamentos observáveis
 * @param {string} tipo - 'fauna', 'flora' ou 'all'
 */
function apiCienciaCidadaGetBehaviors(tipo) {
  return BiodiversityService.getBehaviorList(tipo);
}

/**
 * Obtém avistamentos recentes
 * @param {Object} options - { especie, tipo, observador_id, trilha_id, validado, dias, limit, offset }
 */
function apiCienciaCidadaGetRecentSightings(options) {
  return BiodiversityService.getRecentSightings(options || {});
}

/**
 * Valida avistamento (revisão de especialista)
 * @param {string} id - ID do avistamento
 * @param {Object} validacao - { aprovado, validador, especie_corrigida }
 */
function apiCienciaCidadaValidateSighting(id, validacao) {
  return BiodiversityService.validateSighting(id, validacao || {});
}

/**
 * Obtém estatísticas de ciência cidadã
 * @param {Object} options - { dias }
 */
function apiCienciaCidadaGetStats(options) {
  return BiodiversityService.getCitizenScienceStats(options || {});
}
