/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMINI AI SERVICE - Inteligência Artificial para Análises
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Integração com Google Gemini AI para:
 * - Análise de dados ambientais
 * - Identificação de espécies (fotos)
 * - Recomendações agroflorestais
 * - Insights sobre biodiversidade
 * - Relatórios inteligentes
 *
 * IMPACTO: Alto | CUSTO: Baixo (API gratuita até 60 req/min)
 */

const GeminiAIService = {

  /**
   * URL base da API Gemini
   * v1beta tem mais modelos disponíveis, incluindo experimentais
   */
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',

  /**
   * Modelo padrão (gemini-2.0-flash é o mais recente e recomendado)
   * Modelos disponíveis (Dez/2024):
   * - gemini-2.0-flash: Mais recente, rápido e eficiente ⭐ RECOMENDADO
   * - gemini-2.0-flash-exp: Versão experimental do 2.0
   * - gemini-1.5-flash-latest: Versão estável do 1.5 flash
   * - gemini-1.5-pro-latest: Versão mais poderosa do 1.5
   * 
   * NOTA: gemini-1.5-flash e gemini-pro foram descontinuados
   */
  DEFAULT_MODEL: 'gemini-2.0-flash',
  
  /**
   * Modelos alternativos (fallback)
   */
  FALLBACK_MODELS: ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],

  /**
   * Verifica se a API está configurada
   */
  isConfigured() {
    return CONFIG.GEMINI_API_KEY !== null;
  },

  /**
   * Valida e sanitiza o nome do modelo
   * Retorna o modelo padrão se não especificado
   */
  validateModel(modelName) {
    if (!modelName) return this.DEFAULT_MODEL;
    
    // Lista de modelos conhecidos como inválidos
    const invalidModels = [
      'gemini-2.0-pro',     // Não existe
      'gemini-pro',         // Descontinuado
      'gemini-1.5-flash',   // Descontinuado - use gemini-1.5-flash-latest
      'gemini-1.5-pro'      // Descontinuado - use gemini-1.5-pro-latest
    ];
    
    // Se for um modelo inválido, usa o padrão
    if (invalidModels.includes(modelName)) {
      Logger.log(`⚠️ Modelo ${modelName} não está disponível. Usando ${this.DEFAULT_MODEL}`);
      return this.DEFAULT_MODEL;
    }
    
    return modelName;
  },

  /**
   * Faz chamada à API Gemini com fallback automático
   */
  callGemini(prompt, options = {}) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'GEMINI_API_KEY não configurada. Configure em Properties Service.'
        };
      }

      // Valida e sanitiza o modelo solicitado
      const requestedModel = this.validateModel(options.model || this.DEFAULT_MODEL);
      const temperature = options.temperature !== undefined ? options.temperature : CONFIG.GEMINI_TEMPERATURE;
      const maxTokens = options.maxTokens || 1000;
      const enableFallback = options.enableFallback !== false;

      // Lista de modelos para tentar (modelo solicitado + fallbacks)
      const modelsToTry = [requestedModel];
      if (enableFallback && requestedModel !== this.DEFAULT_MODEL) {
        modelsToTry.push(this.DEFAULT_MODEL);
      }
      if (enableFallback) {
        modelsToTry.push(...this.FALLBACK_MODELS.filter(m => !modelsToTry.includes(m)));
      }

      let lastError = null;

      // Tenta cada modelo
      for (const model of modelsToTry) {
        try {
          const result = this._makeApiCall(prompt, model, temperature, maxTokens);
          
          if (result.success) {
            // Se usou fallback, adiciona aviso
            if (model !== requestedModel) {
              result.warning = `Modelo ${requestedModel} não disponível. Usando ${model} como alternativa.`;
              Logger.log(`⚠️ Fallback: ${requestedModel} → ${model}`);
            }
            return result;
          }
          
          lastError = result.error;
          
          // Se erro 404 (modelo não encontrado), tenta próximo
          if (result.error && result.error.includes('404')) {
            Logger.log(`⚠️ Modelo ${model} não encontrado, tentando próximo...`);
            continue;
          }
          
          // Para outros erros, retorna imediatamente
          return result;
          
        } catch (error) {
          lastError = error.toString();
          Logger.log(`⚠️ Erro com modelo ${model}: ${error}`);
          continue;
        }
      }

      // Se chegou aqui, todos os modelos falharam
      return {
        success: false,
        error: `Todos os modelos falharam. Último erro: ${lastError}`,
        triedModels: modelsToTry
      };

    } catch (error) {
      Utils.logError('GeminiAIService.callGemini', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Faz a chamada real à API (método interno)
   * Com retry automático para rate limits (429)
   * Integrado com GeminiRateLimiter para throttling
   */
  _makeApiCall(prompt, model, temperature, maxTokens) {
    const maxRetries = 5; // Aumentado de 3 para 5
    let retryCount = 0;
    let response = null;
    let responseText = '';
    
    // Aguarda slot disponível (throttling via GeminiRateLimiter)
    if (typeof GeminiRateLimiter !== 'undefined') {
      GeminiRateLimiter.waitForNextSlot();
    }
    
    while (retryCount <= maxRetries) {
      const url = `${this.API_BASE_URL}/${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.7,  // Otimizado: mais focado
          topK: 30    // Otimizado: menos variação
        }
      };

      const requestOptions = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      response = UrlFetchApp.fetch(url, requestOptions);
      const responseCode = response.getResponseCode();
      responseText = response.getContentText();

      // Tratamento específico para rate limit (429)
      if (responseCode === 429) {
        retryCount++;
        
        // Atualiza métricas se GeminiRateLimiter disponível
        if (typeof GeminiRateLimiter !== 'undefined') {
          GeminiRateLimiter.updateMetrics('rate_limits');
        }
        
        if (retryCount <= maxRetries) {
          // Backoff exponencial mais agressivo: 10s, 20s, 40s, 80s, 120s (max)
          const baseDelay = 10000; // 10 segundos base
          const calculatedDelay = baseDelay * Math.pow(2, retryCount - 1);
          const waitTime = Math.min(calculatedDelay, 120000); // Max 2 minutos
          
          Logger.log(`⏳ Rate limit (429) - Aguardando ${waitTime/1000}s antes de tentar novamente (${retryCount}/${maxRetries})...`);
          Utilities.sleep(waitTime);
          continue;
        }
        
        // Extrai tempo de retry da resposta se disponível
        let retryAfter = null;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error && errorData.error.details) {
            const retryInfo = errorData.error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
            if (retryInfo && retryInfo.retryDelay) {
              retryAfter = retryInfo.retryDelay;
            }
          }
        } catch (e) {
          // Ignora erro de parsing
        }
        
        return {
          success: false,
          error: `Rate limit excedido. ${retryAfter ? `Aguarde ${retryAfter} e tente novamente.` : 'Tente novamente mais tarde.'}`,
          errorCode: 429,
          retryAfter: retryAfter,
          model: model,
          suggestion: 'Considere usar gemini-1.5-flash que tem limites mais altos'
        };
      }

      if (responseCode !== 200) {
        return {
          success: false,
          error: `API Error ${responseCode}: ${responseText}`,
          errorCode: responseCode,
          model: model
        };
      }
      
      // Sucesso - continua para processar resposta
      break;
    }

    const data = JSON.parse(responseText);

    if (!data.candidates || data.candidates.length === 0) {
      return {
        success: false,
        error: 'Nenhuma resposta gerada pela IA',
        model: model
      };
    }

    const text = data.candidates[0].content.parts[0].text;

    return {
      success: true,
      text: text,
      model: model,
      temperature: temperature
    };
  },

  /**
   * Analisa dados ambientais e gera insights
   * OTIMIZADO: Prompts concisos e tokens reduzidos
   */
  analyzeEnvironmentalData(data, type) {
    try {
      let prompt = '';

      switch (type) {
        case 'agua':
          prompt = `ÁGUA - pH:${data.pH}, O2:${data.oxigenio}mg/L, Turbidez:${data.turbidez}NTU, Coliformes:${data.coliformes}/100mL, Temp:${data.temperatura}°C
JSON: {avaliacao,problemas,causas,recomendacoes,prioridade:baixa|média|alta}`;
          break;

        case 'solo':
          prompt = `SOLO - pH:${data.pH}, MO:${data.materia_organica}%, P:${data.fosforo}mg/dm³, K:${data.potassio}mg/dm³
JSON: {fertilidade,deficiencias,correcoes,culturas,manejo}`;
          break;

        case 'clima':
          prompt = `CLIMA - Tmin:${data.temp_min}°C, Tmax:${data.temp_max}°C, Precip:${data.precipitacao}mm, Umid:${data.umidade}%, Dias:${data.dias}
JSON: {padrao,impactos,plantio,alertas,tendencias}`;
          break;
      }

      const result = this.callGemini(prompt, { maxTokens: 800 });

      if (!result.success) return result;

      // Tenta parsear JSON
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis: analysis,
            raw_text: result.text
          };
        }
      } catch (e) {
        // Se não conseguir parsear, retorna texto bruto
      }

      return {
        success: true,
        analysis: { texto: result.text },
        raw_text: result.text
      };

    } catch (error) {
      Utils.logError('GeminiAIService.analyzeEnvironmentalData', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Identifica espécie a partir de descrição
   * OTIMIZADO: Prompt conciso para Cerrado
   */
  identifySpecies(description, type = 'flora') {
    try {
      const prompt = `CERRADO ${type.toUpperCase()}: ${description}
JSON: {especies:[{cientifico,comum}],caracteristicas,habitat,conservacao,importancia}`;

      const result = this.callGemini(prompt, { maxTokens: 700 });

      if (!result.success) return result;

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const identification = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            identification: identification,
            raw_text: result.text
          };
        }
      } catch (e) {
        // Fallback
      }

      return {
        success: true,
        identification: { texto: result.text },
        raw_text: result.text
      };

    } catch (error) {
      Utils.logError('GeminiAIService.identifySpecies', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera recomendações agroflorestais
   * @param {Object|String} parcelaData - Dados da parcela ou ID
   * @returns {Object} Recomendações geradas
   */
  getAgroforestryRecommendations(parcelaData) {
    try {
      // Validação de entrada
      if (!parcelaData) {
        return {
          success: false,
          error: 'Dados da parcela não fornecidos'
        };
      }

      // Se recebeu um ID (string), busca os dados
      if (typeof parcelaData === 'string') {
        Logger.log(`📍 Buscando dados da parcela: ${parcelaData}`);
        const result = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO, { id: parcelaData });

        if (!result.success || result.data.length === 0) {
          return {
            success: false,
            error: `Parcela não encontrada: ${parcelaData}`
          };
        }

        parcelaData = result.data[0];
        Logger.log(`✅ Parcela encontrada: ${parcelaData.nome}`);
      }

      // Se não é objeto, erro
      if (typeof parcelaData !== 'object') {
        return {
          success: false,
          error: 'Dados da parcela inválidos (deve ser objeto ou ID)'
        };
      }

      // Valores padrão para campos opcionais
      const tipo = parcelaData.tipo_sistema || parcelaData.tipo || 'Sistema Agroflorestal';
      const area = parcelaData.area_ha || parcelaData.area || 'Não informado';
      const idade = parcelaData.idade_anos || parcelaData.idade || 'Não informado';
      const especies = parcelaData.especies_principais || parcelaData.especies || 'Não informado';
      const pH = parcelaData.pH_solo || parcelaData.pH || 'Não informado';

      const prompt = `SAF CERRADO - Tipo:${tipo}, Área:${area}ha, Idade:${idade}anos, Espécies:${especies}, pH:${pH}
JSON: {especies_complementares,manejo,controle_pragas,solo,carbono}`;

      const result = this.callGemini(prompt, { maxTokens: 1000 });

      if (!result.success) return result;

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recommendations = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            recommendations: recommendations,
            raw_text: result.text,
            parcela: {
              tipo: tipo,
              area: area,
              idade: idade
            }
          };
        }
      } catch (e) {
        // Fallback
      }

      return {
        success: true,
        recommendations: { texto: result.text },
        raw_text: result.text,
        parcela: {
          tipo: tipo,
          area: area,
          idade: idade
        }
      };

    } catch (error) {
      Utils.logError('GeminiAIService.getAgroforestryRecommendations', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera relatório inteligente
   * OTIMIZADO: Prompt reduzido e tokens limitados para menor carga
   */
  generateSmartReport(dashboardData) {
    try {
      const prompt = `Analista ambiental - Reserva Araras.

DADOS: Waypoints:${dashboardData.waypoints || 0}, Fotos:${dashboardData.fotos || 0}, Trilhas:${dashboardData.trilhas || 0}, Visitantes:${dashboardData.visitantes || 0}, Parcelas SAF:${dashboardData.parcelas || 0}, Biodiversidade:${dashboardData.observacoes || 0}

Forneça em MAX 300 palavras:
1. Situação geral (1 parágrafo)
2. Conquistas principais (lista)
3. Atenção necessária (lista)
4. 3 ações prioritárias

Seja direto e prático.`;

      const result = this.callGemini(prompt, { maxTokens: 800 });

      if (!result.success) return result;

      return {
        success: true,
        report: result.text
      };

    } catch (error) {
      Utils.logError('GeminiAIService.generateSmartReport', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Responde perguntas sobre os dados
   */
  askQuestion(question, context = {}) {
    try {
      let contextText = '';
      if (Object.keys(context).length > 0) {
        contextText = '\n\nContexto dos dados:\n' + JSON.stringify(context, null, 2);
      }

      const prompt = `Você é um assistente especializado em gestão de reservas extrativistas e sistemas agroflorestais do Cerrado brasileiro.

Pergunta: ${question}${contextText}

Responda de forma clara, objetiva e prática. Se não tiver informações suficientes, seja honesto sobre isso.`;

      const result = this.callGemini(prompt, { maxTokens: 500 });

      if (!result.success) return result;

      return {
        success: true,
        answer: result.text
      };

    } catch (error) {
      Utils.logError('GeminiAIService.askQuestion', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Lista modelos disponíveis na API Gemini
   */
  listAvailableModels() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'GEMINI_API_KEY não configurada'
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${CONFIG.GEMINI_API_KEY}`;

      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      if (responseCode !== 200) {
        return {
          success: false,
          error: `API Error ${responseCode}: ${responseText}`
        };
      }

      const data = JSON.parse(responseText);
      
      // Filtra apenas modelos que suportam generateContent
      const modelsWithGenerate = data.models.filter(model => 
        model.supportedGenerationMethods && 
        model.supportedGenerationMethods.includes('generateContent')
      );

      return {
        success: true,
        models: modelsWithGenerate.map(m => ({
          name: m.name.replace('models/', ''),
          displayName: m.displayName,
          description: m.description,
          methods: m.supportedGenerationMethods
        }))
      };

    } catch (error) {
      Utils.logError('GeminiAIService.listAvailableModels', error);
      return { success: false, error: error.toString() };
    }
  }
};

/**
 * Funções expostas para o frontend
 */
function apiAnalyzeEnvironmentalDataAI(data, type) {
  return GeminiAIService.analyzeEnvironmentalData(data, type);
}

function apiIdentifySpeciesAI(description, type) {
  return GeminiAIService.identifySpecies(description, type);
}

function apiGetAgroforestryRecommendationsAI(parcelaData) {
  try {
    // Validação básica
    if (!parcelaData) {
      return {
        success: false,
        error: 'Parâmetro parcelaData é obrigatório. Forneça um ID ou objeto com dados da parcela.'
      };
    }

    return GeminiAIService.getAgroforestryRecommendations(parcelaData);
  } catch (error) {
    Logger.log('[apiGetAgroforestryRecommendationsAI] Erro: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function apiGenerateSmartReport() {
  const dashboard = SimplifiedAnalysisService.getDashboardSimple();
  if (!dashboard.success) return dashboard;
  return GeminiAIService.generateSmartReport(dashboard.metricas);
}

function apiAskQuestionAI(question, context) {
  return GeminiAIService.askQuestion(question, context);
}

function apiCheckGeminiConfig() {
  return {
    success: true,
    configured: GeminiAIService.isConfigured(),
    config: validateEnvironmentConfig()
  };
}

/**
 * Função auxiliar para testar recomendações agroflorestais
 * Pode ser chamada diretamente do Apps Script Editor
 */
function testAgroforestryRecommendations() {
  Logger.log('=== TESTE: Recomendações Agroflorestais ===\n');

  // Teste 1: Com dados completos
  Logger.log('Teste 1: Dados completos');
  const test1 = GeminiAIService.getAgroforestryRecommendations({
    tipo_sistema: 'SAF_Cerrado',
    area_ha: 2.5,
    idade_anos: 3,
    especies_principais: 'Pequi, Baru, Cagaita',
    pH_solo: 6.2
  });
  Logger.log('Resultado 1: ' + JSON.stringify(test1, null, 2));

  // Teste 2: Com dados mínimos
  Logger.log('\nTeste 2: Dados mínimos');
  const test2 = GeminiAIService.getAgroforestryRecommendations({
    tipo_sistema: 'Agrofloresta'
  });
  Logger.log('Resultado 2: ' + JSON.stringify(test2, null, 2));

  // Teste 3: Com ID de parcela (se existir)
  Logger.log('\nTeste 3: Buscar por ID');
  const parcelas = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO, {}, { limit: 1 });
  if (parcelas.success && parcelas.data.length > 0) {
    const parcelaId = parcelas.data[0].id;
    Logger.log('Testando com parcela ID: ' + parcelaId);
    const test3 = GeminiAIService.getAgroforestryRecommendations(parcelaId);
    Logger.log('Resultado 3: ' + JSON.stringify(test3, null, 2));
  } else {
    Logger.log('Nenhuma parcela encontrada para teste 3');
  }

  // Teste 4: Erro - sem dados
  Logger.log('\nTeste 4: Erro esperado (sem dados)');
  const test4 = GeminiAIService.getAgroforestryRecommendations(null);
  Logger.log('Resultado 4: ' + JSON.stringify(test4, null, 2));

  Logger.log('\n=== FIM DOS TESTES ===');

  return {
    success: true,
    message: 'Testes concluídos. Verifique os logs.',
    tests: {
      test1: test1.success,
      test2: test2.success,
      test3: parcelas.data.length > 0 ? 'executado' : 'pulado',
      test4: !test4.success // Deve falhar
    }
  };
}

/**
 * Função auxiliar para obter recomendações de forma simplificada
 * Uso: getRecommendations('ID_da_parcela')
 * ou: getRecommendations({ tipo_sistema: 'SAF', area_ha: 2 })
 */
function getRecommendations(parcelaIdOrData) {
  return apiGetAgroforestryRecommendationsAI(parcelaIdOrData);
}
