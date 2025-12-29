/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DE CONFIGURAÇÃO - VARIÁVEIS DE AMBIENTE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script testa se as configurações estão sendo lidas corretamente
 * das variáveis de ambiente (Properties Service)
 */

/**
 * Testa se as configurações estão sendo lidas corretamente
 */
function testarConfiguracaoGemini() {
    Logger.log('TESTE DE CONFIGURAÇÃO - GEMINI AI');
    
  // 1. Testa leitura direta do Properties Service
  const props = PropertiesService.getScriptProperties();
  const apiKeyDireto = props.getProperty('GEMINI_API_KEY');
  const temperaturaDireto = props.getProperty('GEMINI_TEMPERATURE');
  
  Logger.log('\n📋 LEITURA DIRETA DO PROPERTIES SERVICE:');
  Logger.log(`   GEMINI_API_KEY: ${apiKeyDireto ? '***' + apiKeyDireto.slice(-6) : 'NÃO CONFIGURADO'}`);
  Logger.log(`   GEMINI_TEMPERATURE: ${temperaturaDireto !== null ? temperaturaDireto : 'NÃO CONFIGURADO'}`);
  
  // 2. Testa leitura via CONFIG
  Logger.log('\n⚙️ LEITURA VIA CONFIG:');
  Logger.log(`   CONFIG.GEMINI_API_KEY: ${CONFIG.GEMINI_API_KEY ? '***' + CONFIG.GEMINI_API_KEY.slice(-6) : 'NÃO CONFIGURADO'}`);
  Logger.log(`   CONFIG.GEMINI_TEMPERATURE: ${CONFIG.GEMINI_TEMPERATURE}`);
  
  // 3. Testa se o serviço Gemini está configurado
  Logger.log('\n🤖 STATUS DO SERVIÇO GEMINI:');
  Logger.log(`   Configurado: ${GeminiAIService.isConfigured() ? '✅ SIM' : '❌ NÃO'}`);
  
  // 4. Validação completa
  const validation = validateEnvironmentConfig();
  Logger.log('\n✓ VALIDAÇÃO COMPLETA:');
  Logger.log(`   Válido: ${validation.valid ? '✅ SIM' : '❌ NÃO'}`);
  if (!validation.valid) {
    Logger.log(`   Faltando: ${validation.missing.join(', ')}`);
  }
  
  // 5. Teste de temperatura = 0
  Logger.log('\n🌡️ TESTE DE TEMPERATURA:');
  if (temperaturaDireto === '0') {
    Logger.log(`   ✅ Temperatura configurada em 0 (zero) - CORRETO!`);
    Logger.log(`   ✅ CONFIG.GEMINI_TEMPERATURE retorna: ${CONFIG.GEMINI_TEMPERATURE}`);
    if (CONFIG.GEMINI_TEMPERATURE === 0) {
      Logger.log(`   ✅ Valor numérico correto (0)`);
    } else {
      Logger.log(`   ⚠️ Valor convertido: ${CONFIG.GEMINI_TEMPERATURE} (esperado: 0)`);
    }
  } else {
    Logger.log(`   ℹ️ Temperatura atual: ${CONFIG.GEMINI_TEMPERATURE}`);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE CONCLUÍDO');
    
  // Retorna resultado
  return {
    success: validation.valid,
    apiKeyConfigurada: !!CONFIG.GEMINI_API_KEY,
    temperatura: CONFIG.GEMINI_TEMPERATURE,
    geminiConfigurado: GeminiAIService.isConfigured()
  };
}

/**
 * Teste rápido de chamada ao Gemini (se configurado)
 */
function testarChamadaGemini() {
    Logger.log('TESTE DE CHAMADA - GEMINI AI');
    
  if (!GeminiAIService.isConfigured()) {
    Logger.log('❌ Gemini não configurado. Configure GEMINI_API_KEY primeiro.');
    return { success: false, error: 'Não configurado' };
  }
  
  Logger.log('✅ Gemini configurado. Fazendo chamada de teste...');
  Logger.log(`   Temperatura: ${CONFIG.GEMINI_TEMPERATURE}`);
  
  try {
    const resultado = GeminiAIService.callGemini(
      'Responda apenas com "OK" se você está funcionando.',
      {
        temperature: CONFIG.GEMINI_TEMPERATURE,
        maxTokens: 10
      }
    );
    
    if (resultado.success) {
      Logger.log('✅ SUCESSO! Resposta do Gemini:');
      Logger.log(`   ${resultado.text}`);
      Logger.log(`   Temperatura usada: ${CONFIG.GEMINI_TEMPERATURE}`);
    } else {
      Logger.log('❌ ERRO na chamada:');
      Logger.log(`   ${resultado.error}`);
    }
    
        return resultado;
    
  } catch (error) {
    Logger.log('❌ EXCEÇÃO durante chamada:');
    Logger.log(`   ${error.toString()}`);
        return { success: false, error: error.toString() };
  }
}

/**
 * Exibe todas as configurações (para debug)
 */
function exibirTodasConfiguracoes() {
  const config = getEnvironmentConfig();
  
    Logger.log('TODAS AS CONFIGURAÇÕES');
    Logger.log(`SPREADSHEET_ID: ${config.SPREADSHEET_ID || 'NÃO CONFIGURADO'}`);
  Logger.log(`DRIVE_FOLDER_ID: ${config.DRIVE_FOLDER_ID || 'NÃO CONFIGURADO'}`);
  Logger.log(`GEMINI_API_KEY: ${config.GEMINI_API_KEY ? '***' + config.GEMINI_API_KEY.slice(-6) : 'NÃO CONFIGURADO'}`);
  Logger.log(`GEMINI_TEMPERATURE: ${config.GEMINI_TEMPERATURE !== null ? config.GEMINI_TEMPERATURE : 'NÃO CONFIGURADO (padrão: 0.7)'}`);
  }

/**
 * Teste completo: Verifica se a temperatura 0 está sendo aplicada
 */
function testarTemperaturaZero() {
    Logger.log('TESTE DE TEMPERATURA = 0 (ZERO)');
    
  if (!GeminiAIService.isConfigured()) {
    Logger.log('❌ Gemini não configurado.');
    return { success: false, error: 'Não configurado' };
  }
  
  Logger.log(`✅ Temperatura configurada: ${CONFIG.GEMINI_TEMPERATURE}`);
  Logger.log('');
  Logger.log('🧪 Fazendo 3 chamadas idênticas para verificar determinismo...');
  Logger.log('   (Com temperatura 0, as respostas devem ser idênticas)');
  Logger.log('');
  
  const prompt = 'Diga apenas o número 42.';
  const respostas = [];
  
  for (let i = 1; i <= 3; i++) {
    Logger.log(`   Chamada ${i}...`);
    const resultado = GeminiAIService.callGemini(prompt, {
      temperature: CONFIG.GEMINI_TEMPERATURE,
      maxTokens: 20
    });
    
    if (resultado.success) {
      respostas.push(resultado.text.trim());
      Logger.log(`   ✅ Resposta ${i}: "${resultado.text.trim()}"`);
    } else {
      Logger.log(`   ❌ Erro: ${resultado.error}`);
      return resultado;
    }
    
    // Pequena pausa entre chamadas
    Utilities.sleep(500);
  }
  
  Logger.log('');
  Logger.log('📊 ANÁLISE DE DETERMINISMO:');
  
  const todasIguais = respostas.every(r => r === respostas[0]);
  
  if (todasIguais) {
    Logger.log('   ✅ SUCESSO! Todas as respostas são idênticas.');
    Logger.log('   ✅ Temperatura 0 está funcionando corretamente!');
    Logger.log(`   ✅ Resposta consistente: "${respostas[0]}"`);
  } else {
    Logger.log('   ⚠️ As respostas são diferentes:');
    respostas.forEach((r, i) => {
      Logger.log(`      ${i + 1}. "${r}"`);
    });
    Logger.log('   ℹ️ Isso pode indicar que a temperatura não está em 0');
    Logger.log('      ou que o prompt permite variação natural.');
  }
  
  Logger.log('');
    
  return {
    success: true,
    temperatura: CONFIG.GEMINI_TEMPERATURE,
    respostas: respostas,
    deterministica: todasIguais
  };
}

/**
 * Menu de testes - Execute este para ver todas as opções
 */
function menuTestesGemini() {
    Logger.log('MENU DE TESTES - GEMINI AI');
    Logger.log('');
  Logger.log('Execute uma das funções abaixo:');
  Logger.log('');
  Logger.log('📋 CONFIGURAÇÃO:');
  Logger.log('1. testarConfiguracaoGemini()');
  Logger.log('   → Verifica se as configurações estão corretas');
  Logger.log('');
  Logger.log('2. exibirTodasConfiguracoes()');
  Logger.log('   → Mostra todas as variáveis de ambiente');
  Logger.log('');
  Logger.log('🔍 MODELOS:');
  Logger.log('3. listarModelosGemini()');
  Logger.log('   → Lista todos os modelos disponíveis na API');
  Logger.log('');
  Logger.log('🧪 TESTES DE CHAMADA:');
  Logger.log('4. testarModeloCorreto()');
  Logger.log('   → Teste rápido com o modelo configurado');
  Logger.log('');
  Logger.log('5. testarChamadaGemini()');
  Logger.log('   → Faz uma chamada simples de teste');
  Logger.log('');
  Logger.log('6. testarTemperaturaZero()');
  Logger.log('   → Verifica se temperatura 0 está funcionando');
  Logger.log('');
    Logger.log('💡 RECOMENDAÇÃO: Execute primeiro listarModelosGemini()');
  Logger.log('   para ver os modelos disponíveis!');
  }

/**
 * Lista todos os modelos Gemini disponíveis
 */
function listarModelosGemini() {
    Logger.log('MODELOS GEMINI DISPONÍVEIS');
    
  if (!GeminiAIService.isConfigured()) {
    Logger.log('❌ Gemini não configurado.');
    return { success: false, error: 'Não configurado' };
  }
  
  Logger.log('🔍 Consultando API Gemini...');
  Logger.log('');
  
  const resultado = GeminiAIService.listAvailableModels();
  
  if (!resultado.success) {
    Logger.log(`❌ Erro: ${resultado.error}`);
    return resultado;
  }
  
  Logger.log(`✅ Encontrados ${resultado.models.length} modelos que suportam generateContent:`);
  Logger.log('');
  
  resultado.models.forEach((model, index) => {
    Logger.log(`${index + 1}. ${model.name}`);
    Logger.log(`   Nome: ${model.displayName}`);
    Logger.log(`   Descrição: ${model.description || 'N/A'}`);
    Logger.log(`   Métodos: ${model.methods.join(', ')}`);
    Logger.log('');
  });
  
    Logger.log(`💡 Modelo atual configurado: ${GeminiAIService.DEFAULT_MODEL}`);
    
  return resultado;
}

/**
 * Teste rápido com o modelo correto
 */
function testarModeloCorreto() {
    Logger.log('TESTE COM MODELO CORRETO');
    
  if (!GeminiAIService.isConfigured()) {
    Logger.log('❌ Gemini não configurado.');
    return { success: false, error: 'Não configurado' };
  }
  
  Logger.log(`✅ Modelo: ${GeminiAIService.DEFAULT_MODEL}`);
  Logger.log(`✅ Temperatura: ${CONFIG.GEMINI_TEMPERATURE}`);
  Logger.log('');
  Logger.log('🧪 Fazendo chamada de teste...');
  
  const resultado = GeminiAIService.callGemini(
    'Responda apenas: OK',
    {
      temperature: CONFIG.GEMINI_TEMPERATURE,
      maxTokens: 10
    }
  );
  
  if (resultado.success) {
    Logger.log('');
    Logger.log('✅ SUCESSO!');
    Logger.log(`   Resposta: "${resultado.text}"`);
    Logger.log(`   Modelo usado: ${resultado.model}`);
    Logger.log(`   Temperatura: ${resultado.temperature}`);
  } else {
    Logger.log('');
    Logger.log('❌ ERRO:');
    Logger.log(`   ${resultado.error}`);
  }
  
    
  return resultado;
}
