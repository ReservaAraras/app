/**
 * Teste para verificar se o modelo Gemini está configurado corretamente
 */

function testarModeloGemini() {
    Logger.log('TESTE: Configuração do Modelo Gemini');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // 1. Verificar configuração
  Logger.log('1️⃣ Verificando configuração da API...');
  const isConfigured = GeminiAIService.isConfigured();
  Logger.log(`   ${isConfigured ? '✅' : '❌'} API Key: ${isConfigured ? 'Configurada' : 'NÃO configurada'}`);
  Logger.log(`   ✅ Modelo padrão: ${GeminiAIService.DEFAULT_MODEL}`);
  Logger.log(`   ✅ Temperatura: ${CONFIG.GEMINI_TEMPERATURE}\n`);
  
  if (!isConfigured) {
    Logger.log('❌ Configure a GEMINI_API_KEY primeiro!');
    Logger.log('   Use: saveEnvironmentConfig({ GEMINI_API_KEY: "sua-chave" })\n');
    return;
  }
  
  // 2. Testar validação de modelo
  Logger.log('2️⃣ Testando validação de modelos...');
  const testModels = [
    'gemini-2.0-flash-exp',  // Inválido
    'gemini-1.5-flash',      // Válido
    null,                     // Deve usar padrão
    'gemini-1.5-pro'         // Válido
  ];
  
  testModels.forEach(model => {
    const validated = GeminiAIService.validateModel(model);
    Logger.log(`   ${model || 'null'} → ${validated}`);
  });
  Logger.log('');
  
  // 3. Testar chamada real
  Logger.log('3️⃣ Testando chamada à API...');
  const result = GeminiAIService.callGemini(
    'Responda apenas: OK',
    { maxTokens: 10 }
  );
  
  if (result.success) {
    Logger.log(`   ✅ Sucesso!`);
    Logger.log(`   📝 Modelo usado: ${result.model}`);
    Logger.log(`   💬 Resposta: ${result.text.substring(0, 50)}...`);
    if (result.warning) {
      Logger.log(`   ⚠️  ${result.warning}`);
    }
  } else {
    Logger.log(`   ❌ Erro: ${result.error}`);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('FIM DO TESTE');
    
  return result;
}

/**
 * Teste específico para recomendações agroflorestais
 */
function testarRecomendacoesAgroflorestais() {
    Logger.log('TESTE: Recomendações Agroflorestais com Modelo Correto');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const dadosTeste = {
    tipo_sistema: 'SAF_Cerrado',
    area_ha: 2.5,
    idade_anos: 3,
    especies_principais: 'Pequi, Baru, Cagaita',
    pH_solo: 6.2
  };
  
  Logger.log('📊 Dados de teste:');
  Logger.log(JSON.stringify(dadosTeste, null, 2));
  Logger.log('');
  
  Logger.log('🔄 Chamando API...');
  const result = GeminiAIService.getAgroforestryRecommendations(dadosTeste);
  
  if (result.success) {
    Logger.log('✅ Sucesso!');
    Logger.log(`📝 Modelo usado: ${result.model || 'padrão'}`);
    Logger.log('\n📋 Recomendações:');
    Logger.log(JSON.stringify(result.recommendations, null, 2));
  } else {
    Logger.log('❌ Erro:');
    Logger.log(result.error);
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  
  return result;
}
