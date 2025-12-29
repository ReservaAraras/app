/**
 * DIAGNOSTICO COMPLETO DA API GEMINI
 * Execute testGeminiDiagnostico() para verificar problemas
 */

function testGeminiDiagnostico() {
  Logger.log('\n============================================================');
  Logger.log('DIAGNOSTICO GEMINI API');
  Logger.log('============================================================\n');
  
  // 1. Verifica se API Key esta configurada
  Logger.log('1. Verificando API Key...');
  const apiKey = CONFIG.GEMINI_API_KEY;
  
  if (!apiKey) {
    Logger.log('   ERRO: GEMINI_API_KEY nao configurada');
    Logger.log('\n   SOLUCAO:');
    Logger.log('   1. Acesse: https://makersuite.google.com/app/apikey');
    Logger.log('   2. Crie uma API key');
    Logger.log('   3. Execute:');
    Logger.log('      saveEnvironmentConfig({ GEMINI_API_KEY: "sua_api_key" });\n');
    return {
      success: false,
      error: 'API Key nao configurada'
    };
  }
  
  Logger.log('   OK: API Key configurada (***' + apiKey.slice(-4) + ')');
  
  // 2. Verifica conectividade com a API
  Logger.log('\n2. Verificando conectividade...');
  
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  
  try {
    const testUrl = baseUrl + '?key=' + apiKey;
    const response = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      Logger.log('   OK: API acessivel');
      
      // Lista modelos disponiveis
      const data = JSON.parse(response.getContentText());
      if (data.models && data.models.length > 0) {
        Logger.log('\n   Modelos disponiveis:');
        data.models.forEach(function(model) {
          if (model.name.includes('gemini')) {
            const modelName = model.name.replace('models/', '');
            Logger.log('      - ' + modelName);
          }
        });
      }
    } else if (responseCode === 403) {
      Logger.log('   ERRO: API Key invalida ou sem permissoes');
      Logger.log('   Codigo: 403 Forbidden');
      Logger.log('\n   SOLUCAO:');
      Logger.log('   1. Verifique se a API key esta correta');
      Logger.log('   2. Acesse https://makersuite.google.com/');
      Logger.log('   3. Gere uma nova API key\n');
      return {
        success: false,
        error: 'API Key invalida (403)',
        code: responseCode
      };
    } else if (responseCode === 429) {
      Logger.log('   ERRO: Rate limit excedido');
      Logger.log('   Aguarde alguns minutos e tente novamente\n');
      return {
        success: false,
        error: 'Rate limit excedido (429)',
        code: responseCode
      };
    } else {
      Logger.log('   ERRO: Resposta inesperada');
      Logger.log('   Codigo: ' + responseCode);
      Logger.log('   Resposta: ' + response.getContentText().substring(0, 200));
      return {
        success: false,
        error: 'Erro HTTP ' + responseCode,
        code: responseCode
      };
    }
  } catch (error) {
    Logger.log('   ERRO: Nao foi possivel conectar a API');
    Logger.log('   ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
  
  // 3. Testa chamada simples
  Logger.log('\n3. Testando chamada de geracao...');
  
  const testModel = 'gemini-1.5-flash-latest';
  const testUrl = baseUrl + '/' + testModel + ':generateContent?key=' + apiKey;
  
  const testPayload = {
    contents: [{
      parts: [{
        text: 'Diga apenas "OK" se voce esta funcionando.'
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 10
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        Logger.log('   OK: Resposta recebida: ' + text);
      } else {
        Logger.log('   AVISO: Resposta vazia');
      }
    } else if (responseCode === 404) {
      Logger.log('   ERRO: Modelo nao encontrado (404)');
      Logger.log('\n   SOLUCAO:');
      Logger.log('   O modelo ' + testModel + ' pode nao estar disponivel');
      Logger.log('   Modelos alternativos:');
      Logger.log('   - gemini-pro');
      Logger.log('   - gemini-1.5-pro-latest');
      Logger.log('   - gemini-1.0-pro-latest\n');
      return {
        success: false,
        error: 'Modelo nao encontrado (404)',
        suggestion: 'Tente gemini-pro ou gemini-1.5-pro-latest'
      };
    } else if (responseCode === 429) {
      Logger.log('   ERRO: Rate limit excedido');
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error && errorData.error.message) {
          Logger.log('   Mensagem: ' + errorData.error.message);
        }
      } catch (e) {
        // Ignora
      }
      
      Logger.log('\n   SOLUCAO:');
      Logger.log('   1. Aguarde alguns minutos');
      Logger.log('   2. Limite: 15 requisicoes/minuto (free tier)');
      Logger.log('   3. Considere upgrade: https://ai.google.dev/pricing\n');
      return {
        success: false,
        error: 'Rate limit excedido (429)'
      };
    } else {
      Logger.log('   ERRO: ' + responseCode);
      Logger.log('   Resposta: ' + responseText.substring(0, 300));
      return {
        success: false,
        error: 'Erro HTTP ' + responseCode,
        response: responseText.substring(0, 300)
      };
    }
  } catch (error) {
    Logger.log('   ERRO: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
  
  // 4. Resumo
  Logger.log('\n============================================================');
  Logger.log('RESULTADO DO DIAGNOSTICO');
  Logger.log('============================================================');
  Logger.log('Status: FUNCIONANDO');
  Logger.log('API Key: OK');
  Logger.log('Conectividade: OK');
  Logger.log('Geracao: OK\n');
  
  return {
    success: true,
    message: 'Gemini API funcionando corretamente'
  };
}

function testGeminiSimples() {
  Logger.log('\nTESTE SIMPLES GEMINI\n');
  
  if (!CONFIG.GEMINI_API_KEY) {
    Logger.log('ERRO: API Key nao configurada\n');
    Logger.log('Configure primeiro:');
    Logger.log('saveEnvironmentConfig({ GEMINI_API_KEY: "sua_chave" });\n');
    return;
  }
  
  Logger.log('Testando com gemini-pro (modelo mais estavel)...\n');
  
  const result = GeminiAIService.callGemini(
    'Responda apenas "OK" se voce esta funcionando.', 
    { 
      model: 'gemini-pro',
      temperature: 0.1,
      maxTokens: 10,
      enableFallback: true
    }
  );
  
  Logger.log('Resultado:');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('\nSUCESSO: Gemini esta funcionando!');
    Logger.log('Resposta: ' + result.text);
  } else {
    Logger.log('\nERRO: ' + result.error);
    
    if (result.error.includes('404')) {
      Logger.log('\nDICA: Modelo nao encontrado');
      Logger.log('Execute testGeminiDiagnostico() para ver modelos disponiveis');
    } else if (result.error.includes('429')) {
      Logger.log('\nDICA: Rate limit excedido');
      Logger.log('Aguarde alguns minutos ou considere upgrade');
    } else if (result.error.includes('403')) {
      Logger.log('\nDICA: API Key invalida');
      Logger.log('Verifique a chave em https://makersuite.google.com/');
    }
  }
  
  return result;
}

function listarModelosGemini() {
  Logger.log('\nLISTANDO MODELOS GEMINI DISPONIVEIS\n');
  
  if (!CONFIG.GEMINI_API_KEY) {
    Logger.log('ERRO: API Key nao configurada\n');
    return;
  }
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + CONFIG.GEMINI_API_KEY;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      Logger.log('ERRO: ' + response.getResponseCode());
      Logger.log(response.getContentText());
      return;
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (!data.models || data.models.length === 0) {
      Logger.log('Nenhum modelo encontrado\n');
      return;
    }
    
    Logger.log('Modelos disponiveis:\n');
    
    data.models.forEach(function(model) {
      const name = model.name.replace('models/', '');
      if (name.includes('gemini')) {
        Logger.log('- ' + name);
        if (model.description) {
          Logger.log('  ' + model.description);
        }
        Logger.log('');
      }
    });
    
  } catch (error) {
    Logger.log('ERRO: ' + error.toString());
  }
}
