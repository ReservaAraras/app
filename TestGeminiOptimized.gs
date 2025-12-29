/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES GEMINI OTIMIZADOS - Máximo 320 segundos
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Versão otimizada para respeitar o limite de 6 minutos do Google Apps Script.
 * Estratégias:
 * - Máximo 5 chamadas à API por execução
 * - Delay fixo de 8 segundos entre chamadas (evita 429)
 * - Cache de respostas habilitado
 * - Testes divididos em módulos independentes
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

const TestGeminiOptimized = {

  /**
   * Configurações de tempo
   */
  CONFIG: {
    MAX_EXECUTION_TIME_MS: 320000,  // 320 segundos
    DELAY_BETWEEN_CALLS_MS: 8000,   // 8 segundos entre chamadas
    MAX_CALLS_PER_RUN: 5,           // Máximo de chamadas por execução
    RETRY_DELAY_MS: 15000           // 15 segundos se rate limit
  },

  /**
   * Contador de chamadas e tempo
   */
  _callCount: 0,
  _startTime: null,

  /**
   * Verifica se ainda há tempo para mais uma chamada
   */
  _canContinue: function() {
    if (!this._startTime) this._startTime = Date.now();
    const elapsed = Date.now() - this._startTime;
    const remaining = this.CONFIG.MAX_EXECUTION_TIME_MS - elapsed;
    
    // Precisa de pelo menos 30s para uma chamada segura
    if (remaining < 30000) {
      Logger.log(`⏱️ Tempo restante insuficiente (${Math.round(remaining/1000)}s)`);
      return false;
    }
    
    if (this._callCount >= this.CONFIG.MAX_CALLS_PER_RUN) {
      Logger.log(`📊 Limite de chamadas atingido (${this._callCount})`);
      return false;
    }
    
    return true;
  },

  /**
   * Executa uma chamada com controle de tempo e rate limit
   */
  _safeCall: function(testName, callFn) {
    if (!this._canContinue()) {
      return { skipped: true, reason: 'Limite de tempo/chamadas' };
    }

    // Delay entre chamadas (exceto primeira)
    if (this._callCount > 0) {
      Logger.log(`⏳ Aguardando ${this.CONFIG.DELAY_BETWEEN_CALLS_MS/1000}s...`);
      Utilities.sleep(this.CONFIG.DELAY_BETWEEN_CALLS_MS);
    }

    this._callCount++;
    Logger.log(`\n📍 [${this._callCount}/${this.CONFIG.MAX_CALLS_PER_RUN}] ${testName}`);

    try {
      const result = callFn();
      
      // Se rate limit, aguarda e retorna erro
      if (result && result.error && result.error.includes('429')) {
        Logger.log(`⚠️ Rate limit detectado - aguardando ${this.CONFIG.RETRY_DELAY_MS/1000}s`);
        Utilities.sleep(this.CONFIG.RETRY_DELAY_MS);
        return { success: false, error: 'Rate limit - tente novamente', rateLimited: true };
      }
      
      return result;
    } catch (e) {
      Logger.log(`❌ Erro: ${e}`);
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Reset dos contadores
   */
  _reset: function() {
    this._callCount = 0;
    this._startTime = Date.now();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTE RÁPIDO - 1 chamada apenas
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Teste mínimo de conectividade (1 chamada)
   * Tempo estimado: ~15 segundos
   */
  runQuickTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🚀 TESTE RÁPIDO GEMINI (1 chamada)');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    // Verifica configuração
    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      Logger.log('❌ GEMINI_API_KEY não configurada');
      return { success: false, error: 'API não configurada' };
    }
    Logger.log('✅ API Key configurada\n');

    const result = this._safeCall('Teste de conectividade', () => {
      return GeminiAIService.callGemini('Responda apenas: OK', { maxTokens: 10 });
    });

    if (result.success) {
      Logger.log(`✅ Resposta: ${result.text}`);
    } else {
      Logger.log(`❌ Falha: ${result.error}`);
    }

    Logger.log(`\n⏱️ Tempo total: ${Math.round((Date.now() - this._startTime)/1000)}s`);
    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTE BÁSICO - 3 chamadas
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Teste básico com 3 funcionalidades principais
   * Tempo estimado: ~60 segundos
   */
  runBasicTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🧪 TESTE BÁSICO GEMINI (3 chamadas)');
    Logger.log('    Tempo estimado: ~60 segundos');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    const results = { total: 0, passed: 0, failed: 0, tests: [] };

    // Verifica configuração
    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      Logger.log('❌ GEMINI_API_KEY não configurada');
      return { success: false, error: 'API não configurada' };
    }
    Logger.log('✅ API Key configurada\n');

    // Teste 1: Análise de água
    results.total++;
    const aguaResult = this._safeCall('Análise de Qualidade da Água', () => {
      return GeminiAIService.analyzeEnvironmentalData({
        pH: 7.2, oxigenio: 8.5, turbidez: 2.3, temperatura: 22.5
      }, 'agua');
    });
    
    if (aguaResult.success) {
      Logger.log('   ✅ Análise de água OK');
      results.passed++;
      results.tests.push({ name: 'Água', status: 'passed' });
    } else if (!aguaResult.skipped) {
      Logger.log(`   ❌ Falha: ${aguaResult.error}`);
      results.failed++;
      results.tests.push({ name: 'Água', status: 'failed', error: aguaResult.error });
    }

    // Teste 2: Identificação de espécie
    results.total++;
    const especieResult = this._safeCall('Identificação de Espécie', () => {
      return GeminiAIService.identifySpecies(
        'Ave grande azul e amarela, bico curvo, vive em casais',
        'fauna'
      );
    });
    
    if (especieResult.success) {
      Logger.log('   ✅ Identificação de espécie OK');
      results.passed++;
      results.tests.push({ name: 'Espécie', status: 'passed' });
    } else if (!especieResult.skipped) {
      Logger.log(`   ❌ Falha: ${especieResult.error}`);
      results.failed++;
      results.tests.push({ name: 'Espécie', status: 'failed', error: especieResult.error });
    }

    // Teste 3: Pergunta contextual
    results.total++;
    const perguntaResult = this._safeCall('Pergunta Contextual', () => {
      return GeminiAIService.askQuestion(
        'Qual a importância do Cerrado para a biodiversidade?',
        { bioma: 'Cerrado' }
      );
    });
    
    if (perguntaResult.success) {
      Logger.log('   ✅ Pergunta contextual OK');
      results.passed++;
      results.tests.push({ name: 'Pergunta', status: 'passed' });
    } else if (!perguntaResult.skipped) {
      Logger.log(`   ❌ Falha: ${perguntaResult.error}`);
      results.failed++;
      results.tests.push({ name: 'Pergunta', status: 'failed', error: perguntaResult.error });
    }

    // Resumo
    this._printSummary(results);
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTE COMPLETO - 5 chamadas (máximo seguro)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Teste completo com 5 funcionalidades
   * Tempo estimado: ~120 segundos
   */
  runFullTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🔬 TESTE COMPLETO GEMINI (5 chamadas)');
    Logger.log('    Tempo estimado: ~120 segundos');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    const results = { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] };

    // Verifica configuração
    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      Logger.log('❌ GEMINI_API_KEY não configurada');
      return { success: false, error: 'API não configurada' };
    }
    Logger.log('✅ API Key configurada\n');

    // Teste 1: Análise de água
    results.total++;
    const t1 = this._safeCall('1. Análise de Qualidade da Água', () => {
      return GeminiAIService.analyzeEnvironmentalData({
        pH: 6.1, oxigenio: 4.2, turbidez: 45.0, coliformes: 2500, temperatura: 26.8
      }, 'agua');
    });
    this._recordResult(results, 'Água', t1);

    // Teste 2: Análise de solo
    results.total++;
    const t2 = this._safeCall('2. Análise de Qualidade do Solo', () => {
      return GeminiAIService.analyzeEnvironmentalData({
        pH: 5.2, materia_organica: 4.5, fosforo: 3.2, potassio: 45
      }, 'solo');
    });
    this._recordResult(results, 'Solo', t2);

    // Teste 3: Identificação de espécie
    results.total++;
    const t3 = this._safeCall('3. Identificação de Espécie', () => {
      return GeminiAIService.identifySpecies(
        'Canídeo grande, pelagem avermelhada, pernas longas, orelhas grandes',
        'fauna'
      );
    });
    this._recordResult(results, 'Espécie', t3);

    // Teste 4: Recomendação agroflorestal
    results.total++;
    const t4 = this._safeCall('4. Recomendação Agroflorestal', () => {
      return GeminiAIService.getAgroforestryRecommendations({
        tipo_sistema: 'SAF_Cerrado',
        area_ha: 2.5,
        idade_anos: 3,
        especies_principais: 'Pequi, Baru, Cagaita',
        pH_solo: 5.8
      });
    });
    this._recordResult(results, 'SAF', t4);

    // Teste 5: Chatbot (se disponível)
    results.total++;
    if (typeof EcoChatbot !== 'undefined') {
      const t5 = this._safeCall('5. Chatbot Educacional', () => {
        return EcoChatbot.processMessage('Quais animais posso ver na reserva?', {});
      });
      this._recordResult(results, 'Chatbot', t5);
    } else {
      const t5 = this._safeCall('5. Pergunta Contextual', () => {
        return GeminiAIService.askQuestion('Quais são os principais animais do Cerrado?', {});
      });
      this._recordResult(results, 'Pergunta', t5);
    }

    // Resumo
    this._printSummary(results);
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTES MODULARES - Execute um por vez
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Teste apenas análise ambiental (2 chamadas)
   */
  runEnvironmentalTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('💧 TESTE AMBIENTAL (2 chamadas)');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    const results = { total: 0, passed: 0, failed: 0, tests: [] };

    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      return { success: false, error: 'API não configurada' };
    }

    // Água
    results.total++;
    const agua = this._safeCall('Análise de Água', () => {
      return GeminiAIService.analyzeEnvironmentalData({
        pH: 7.2, oxigenio: 8.5, turbidez: 2.3, temperatura: 22.5
      }, 'agua');
    });
    this._recordResult(results, 'Água', agua);

    // Solo
    results.total++;
    const solo = this._safeCall('Análise de Solo', () => {
      return GeminiAIService.analyzeEnvironmentalData({
        pH: 5.8, materia_organica: 4.5, fosforo: 12.5, potassio: 120
      }, 'solo');
    });
    this._recordResult(results, 'Solo', solo);

    this._printSummary(results);
    return results;
  },

  /**
   * Teste apenas identificação de espécies (2 chamadas)
   */
  runSpeciesTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🦋 TESTE DE ESPÉCIES (2 chamadas)');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    const results = { total: 0, passed: 0, failed: 0, tests: [] };

    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      return { success: false, error: 'API não configurada' };
    }

    // Fauna
    results.total++;
    const fauna = this._safeCall('Identificação Fauna', () => {
      return GeminiAIService.identifySpecies(
        'Ave grande azul e amarela, bico curvo forte, vive em casais',
        'fauna'
      );
    });
    this._recordResult(results, 'Fauna', fauna);

    // Flora
    results.total++;
    const flora = this._safeCall('Identificação Flora', () => {
      return GeminiAIService.identifySpecies(
        'Árvore com casca grossa, folhas compostas, fruto verde com polpa amarela',
        'flora'
      );
    });
    this._recordResult(results, 'Flora', flora);

    this._printSummary(results);
    return results;
  },

  /**
   * Teste apenas chatbot (2 chamadas)
   */
  runChatbotTest: function() {
    this._reset();
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🤖 TESTE DE CHATBOT (2 chamadas)');
    Logger.log('═══════════════════════════════════════════════════════════════\n');

    const results = { total: 0, passed: 0, failed: 0, tests: [] };

    if (!GeminiAIService || !GeminiAIService.isConfigured()) {
      return { success: false, error: 'API não configurada' };
    }

    // Pergunta 1
    results.total++;
    const p1 = this._safeCall('Pergunta sobre fauna', () => {
      if (typeof EcoChatbot !== 'undefined') {
        return EcoChatbot.processMessage('Quais animais posso ver na reserva?', {});
      }
      return GeminiAIService.askQuestion('Quais animais típicos do Cerrado?', {});
    });
    this._recordResult(results, 'Fauna', p1);

    // Pergunta 2
    results.total++;
    const p2 = this._safeCall('Pergunta sobre trilhas', () => {
      if (typeof EcoChatbot !== 'undefined') {
        return EcoChatbot.processMessage('Como são as trilhas?', {});
      }
      return GeminiAIService.askQuestion('Quais trilhas existem em reservas do Cerrado?', {});
    });
    this._recordResult(results, 'Trilhas', p2);

    this._printSummary(results);
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Registra resultado de um teste
   */
  _recordResult: function(results, name, result) {
    if (result.skipped) {
      results.skipped = (results.skipped || 0) + 1;
      results.tests.push({ name: name, status: 'skipped' });
      Logger.log(`   ⏭️ ${name}: Pulado`);
    } else if (result.success) {
      results.passed++;
      results.tests.push({ name: name, status: 'passed' });
      Logger.log(`   ✅ ${name}: OK`);
    } else {
      results.failed++;
      results.tests.push({ name: name, status: 'failed', error: result.error });
      Logger.log(`   ❌ ${name}: ${result.error}`);
    }
  },

  /**
   * Imprime resumo dos testes
   */
  _printSummary: function(results) {
    const elapsed = Math.round((Date.now() - this._startTime) / 1000);
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('                    RESUMO DOS TESTES');
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log(`Total: ${results.total}`);
    Logger.log(`✅ Passou: ${results.passed}`);
    Logger.log(`❌ Falhou: ${results.failed}`);
    if (results.skipped) Logger.log(`⏭️ Pulados: ${results.skipped}`);
    Logger.log(`📊 Taxa de sucesso: ${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(0) : 0}%`);
    Logger.log(`⏱️ Tempo total: ${elapsed}s`);
    Logger.log(`📍 Chamadas API: ${this._callCount}`);
    Logger.log('═══════════════════════════════════════════════════════════════\n');
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES EXPOSTAS - Execute diretamente no Apps Script
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Teste rápido (1 chamada, ~15s)
 * Use para verificar se a API está funcionando
 */
function testGeminiQuickOptimized() {
  return TestGeminiOptimized.runQuickTest();
}

/**
 * Teste básico (3 chamadas, ~60s)
 * Testa água, espécie e pergunta
 */
function testGeminiBasicOptimized() {
  return TestGeminiOptimized.runBasicTest();
}

/**
 * Teste completo (5 chamadas, ~120s)
 * Testa todas as funcionalidades principais
 */
function testGeminiFullOptimized() {
  return TestGeminiOptimized.runFullTest();
}

/**
 * Teste ambiental (2 chamadas, ~40s)
 * Testa apenas água e solo
 */
function testGeminiEnvironmental() {
  return TestGeminiOptimized.runEnvironmentalTest();
}

/**
 * Teste de espécies (2 chamadas, ~40s)
 * Testa identificação de fauna e flora
 */
function testGeminiSpecies() {
  return TestGeminiOptimized.runSpeciesTest();
}

/**
 * Teste de chatbot (2 chamadas, ~40s)
 * Testa perguntas ao chatbot
 */
function testGeminiChatbot() {
  return TestGeminiOptimized.runChatbotTest();
}


// ═══════════════════════════════════════════════════════════════════════════
// SUBSTITUIÇÃO DO TESTE ORIGINAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Versão otimizada do runAllGeminiTests original
 * Substitui a função que estava excedendo o tempo limite
 * 
 * IMPORTANTE: Esta função substitui runAllGeminiTests() do TestDataGemini.gs
 * Execute esta ao invés da original para evitar timeout
 */
function runAllGeminiTestsOptimized() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE COMPLETO DE ANÁLISES COM GEMINI AI (OTIMIZADO)');
  Logger.log('    Data: ' + new Date().toLocaleString('pt-BR'));
  Logger.log('    Limite: 320 segundos / 5 chamadas');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  return TestGeminiOptimized.runFullTest();
}
