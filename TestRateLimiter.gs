/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DO RATE LIMITER COM ANÁLISES GEMINI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este arquivo replica os testes que falharam originalmente por rate limit,
 * agora usando o sistema de queue com throttling.
 *
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Executa os testes de análise que originalmente falharam por rate limit
 * Usa o sistema de queue para espaçar as requisições automaticamente
 */
function runRateLimitedAnalysisTests() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE COM RATE LIMITER - ANÁLISES GEMINI AI');
  Logger.log(`    Data: ${new Date().toLocaleString('pt-BR')}`);
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Verifica configuração
  const isConfigured = GeminiAIService.isConfigured();
  Logger.log(`\n🔧 Gemini API Configurada: ${isConfigured ? 'SIM ✅' : 'NÃO ❌'}`);
  
  if (!isConfigured) {
    Logger.log('❌ Configure a GEMINI_API_KEY antes de executar os testes');
    return { success: false, error: 'API não configurada' };
  }
  
  // Verifica status do rate limiter
  const rateLimiterStatus = GeminiRateLimiter.checkStatus();
  Logger.log(`\n📊 Status do Rate Limiter:`);
  Logger.log(`   - Pode requisitar: ${rateLimiterStatus.canRequest ? 'SIM' : `NÃO (aguardar ${rateLimiterStatus.waitTimeSec}s)`}`);
  Logger.log(`   - Delay mínimo: ${rateLimiterStatus.config.minDelaySeconds}s`);
  Logger.log(`   - Max req/min: ${rateLimiterStatus.config.maxRequestsPerMinute}`);
  
  const results = {
    agua: [],
    solo: [],
    clima: [],
    especies: [],
    agrofloresta: [],
    relatorio: null
  };
  
  let passed = 0;
  let failed = 0;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ANÁLISE DE DADOS AMBIENTAIS - ÁGUA
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n📊 1. ANÁLISE DE DADOS AMBIENTAIS - ÁGUA');
  Logger.log('─────────────────────────────────────────');
  
  const testesAgua = [
    {
      nome: 'Nascente principal - condições ideais',
      data: { pH: 7.0, oxigenio: 8.5, turbidez: 2, coliformes: 50, temperatura: 22 }
    },
    {
      nome: 'Córrego após área agrícola',
      data: { pH: 6.2, oxigenio: 5.5, turbidez: 45, coliformes: 800, temperatura: 26 }
    }
  ];
  
  for (const teste of testesAgua) {
    Logger.log(`\n  💧 Teste: ${teste.nome}`);
    const result = GeminiAIService.analyzeEnvironmentalData(teste.data, 'agua');
    
    if (result.success) {
      passed++;
      Logger.log(`     ✅ Análise concluída`);
      results.agua.push({ nome: teste.nome, success: true, analysis: result.analysis });
    } else {
      failed++;
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.agua.push({ nome: teste.nome, success: false, error: result.error });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ANÁLISE DE DADOS AMBIENTAIS - SOLO
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n🌍 2. ANÁLISE DE DADOS AMBIENTAIS - SOLO');
  Logger.log('─────────────────────────────────────────');
  
  const testesSolo = [
    {
      nome: 'Solo de cerrado nativo preservado',
      data: { pH: 5.2, materia_organica: 4.5, fosforo: 3, potassio: 45 }
    },
    {
      nome: 'Parcela SAF com 5 anos',
      data: { pH: 6.0, materia_organica: 6.2, fosforo: 12, potassio: 85 }
    }
  ];
  
  for (const teste of testesSolo) {
    Logger.log(`\n  🌍 Teste: ${teste.nome}`);
    const result = GeminiAIService.analyzeEnvironmentalData(teste.data, 'solo');
    
    if (result.success) {
      passed++;
      Logger.log(`     ✅ Análise concluída`);
      results.solo.push({ nome: teste.nome, success: true, analysis: result.analysis });
    } else {
      failed++;
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.solo.push({ nome: teste.nome, success: false, error: result.error });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ANÁLISE CLIMÁTICA
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n🌤️ 3. ANÁLISE CLIMÁTICA');
  Logger.log('─────────────────────────────────────────');
  
  Logger.log(`\n  🌤️ Teste: Período seco típico (junho-agosto)`);
  const climaData = { temp_min: 12, temp_max: 32, precipitacao: 15, umidade: 35, dias: 30 };
  const climaResult = GeminiAIService.analyzeEnvironmentalData(climaData, 'clima');
  
  if (climaResult.success) {
    passed++;
    Logger.log(`     ✅ Análise concluída`);
    results.clima.push({ success: true, analysis: climaResult.analysis });
  } else {
    failed++;
    Logger.log(`     ❌ Falha: ${climaResult.error}`);
    results.clima.push({ success: false, error: climaResult.error });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 4. IDENTIFICAÇÃO DE ESPÉCIES
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n🦋 4. IDENTIFICAÇÃO DE ESPÉCIES');
  Logger.log('─────────────────────────────────────────');
  
  const testesEspecies = [
    { tipo: 'flora', descricao: 'Caryocar brasiliense (Pequi) - árvore frutífera do cerrado' },
    { tipo: 'fauna', descricao: 'Chrysocyon brachyurus (Lobo-guará) - canídeo de pernas longas' }
  ];
  
  for (const teste of testesEspecies) {
    Logger.log(`\n  🔍 Teste ${teste.tipo}: ${teste.descricao.substring(0, 40)}...`);
    const result = GeminiAIService.identifySpecies(teste.descricao, teste.tipo);
    
    if (result.success) {
      passed++;
      Logger.log(`     ✅ Identificação concluída`);
      results.especies.push({ tipo: teste.tipo, success: true, identification: result.identification });
    } else {
      failed++;
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.especies.push({ tipo: teste.tipo, success: false, error: result.error });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RECOMENDAÇÕES AGROFLORESTAIS
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n🌱 5. RECOMENDAÇÕES AGROFLORESTAIS');
  Logger.log('─────────────────────────────────────────');
  
  const testesAgro = [
    {
      nome: 'Parcela Nascente',
      data: { tipo_sistema: 'SAF_Cerrado', area_ha: 2.5, idade_anos: 3, especies_principais: 'Pequi, Baru', pH_solo: 6.2 }
    },
    {
      nome: 'Parcela Demonstrativa',
      data: { tipo_sistema: 'Agrofloresta_Sucessional', area_ha: 1.0, idade_anos: 7, especies_principais: 'Café, Banana, Ipê', pH_solo: 5.8 }
    }
  ];
  
  for (const teste of testesAgro) {
    Logger.log(`\n  🌿 Teste: ${teste.nome}`);
    Logger.log(`     Tipo: ${teste.data.tipo_sistema}, Idade: ${teste.data.idade_anos} anos`);
    const result = GeminiAIService.getAgroforestryRecommendations(teste.data);
    
    if (result.success) {
      passed++;
      Logger.log(`     ✅ Recomendações geradas`);
      results.agrofloresta.push({ nome: teste.nome, success: true, recommendations: result.recommendations });
    } else {
      failed++;
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.agrofloresta.push({ nome: teste.nome, success: false, error: result.error });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RELATÓRIO INTELIGENTE
  // ═══════════════════════════════════════════════════════════════════════════
  Logger.log('\n\n📝 6. RELATÓRIO INTELIGENTE');
  Logger.log('─────────────────────────────────────────');
  
  Logger.log(`\n  📝 Gerando relatório com dados simulados...`);
  const dashboardData = {
    waypoints: 45,
    fotos: 128,
    trilhas: 8,
    visitantes: 234,
    parcelas: 12,
    observacoes: 89
  };
  
  const relatorioResult = GeminiAIService.generateSmartReport(dashboardData);
  
  if (relatorioResult.success) {
    passed++;
    Logger.log(`     ✅ Relatório gerado`);
    Logger.log(`     Preview: ${relatorioResult.report.substring(0, 100)}...`);
    results.relatorio = { success: true, report: relatorioResult.report };
  } else {
    failed++;
    Logger.log(`     ❌ Falha: ${relatorioResult.error}`);
    results.relatorio = { success: false, error: relatorioResult.error };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESUMO
  // ═══════════════════════════════════════════════════════════════════════════
  const total = passed + failed;
  const successRate = Math.round((passed / total) * 100);
  
  Logger.log('\n\n═══════════════════════════════════════════════════════════════');
  Logger.log('                    RESUMO DOS TESTES');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(`Total de testes: ${total}`);
  Logger.log(`✅ Passou: ${passed}`);
  Logger.log(`❌ Falhou: ${failed}`);
  Logger.log(`Taxa de sucesso: ${successRate}%`);
  
  // Métricas do rate limiter
  const metrics = GeminiRateLimiter.getMetrics();
  Logger.log(`\n📊 Métricas do Rate Limiter:`);
  Logger.log(`   - Requisições: ${metrics.requests || 0}`);
  Logger.log(`   - Rate limits encontrados: ${metrics.rate_limits || 0}`);
  Logger.log(`   - Cache hits: ${metrics.cache_hits || 0}`);
  Logger.log(`   - Erros: ${metrics.errors || 0}`);
  
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: failed === 0,
    summary: {
      total,
      passed,
      failed,
      successRate
    },
    results,
    metrics
  };
}


/**
 * Versão em queue dos testes (processa todos sequencialmente com pausas maiores)
 * Recomendado para evitar completamente rate limits
 */
function runAnalysisTestsWithQueue() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE COM QUEUE - TODAS AS ANÁLISES');
  Logger.log(`    Data: ${new Date().toLocaleString('pt-BR')}`);
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  // Monta lista de requisições
  const requests = [
    // Água
    {
      id: 'agua_nascente',
      prompt: `Analise os seguintes dados de qualidade da água: pH: 7.0, Oxigênio: 8.5 mg/L, Turbidez: 2 NTU. Forneça avaliação, problemas, causas, recomendações. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    {
      id: 'agua_corrego',
      prompt: `Analise os seguintes dados de qualidade da água: pH: 6.2, Oxigênio: 5.5 mg/L, Turbidez: 45 NTU, Coliformes: 800. Forneça avaliação, problemas, causas, recomendações. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    // Solo
    {
      id: 'solo_cerrado',
      prompt: `Analise dados de solo: pH 5.2, Matéria Orgânica 4.5%, Fósforo 3 mg/dm³. Forneça fertilidade, deficiências, correções, culturas recomendadas. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    {
      id: 'solo_saf',
      prompt: `Analise dados de solo em SAF: pH 6.0, Matéria Orgânica 6.2%, Fósforo 12 mg/dm³. Forneça fertilidade, deficiências, correções. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    // Clima
    {
      id: 'clima_seco',
      prompt: `Analise dados climáticos do período seco: Temp 12-32°C, Precipitação 15mm, Umidade 35%. Forneça impactos na agricultura e recomendações. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    // Espécies
    {
      id: 'especie_pequi',
      prompt: `Identifique a espécie Caryocar brasiliense (Pequi) do Cerrado. Forneça características, habitat, conservação, importância ecológica. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    {
      id: 'especie_lobo',
      prompt: `Identifique Chrysocyon brachyurus (Lobo-guará). Forneça características, habitat, conservação, importância ecológica. Responda em JSON.`,
      options: { maxTokens: 1000 }
    },
    // Agrofloresta
    {
      id: 'agro_nascente',
      prompt: `Recomendações para SAF Cerrado: 2.5ha, 3 anos, Pequi e Baru, pH 6.2. Forneça espécies complementares, manejo, controle pragas. Responda em JSON.`,
      options: { maxTokens: 1500 }
    },
    // Relatório
    {
      id: 'relatorio_dashboard',
      prompt: `Gere relatório executivo para reserva: 45 waypoints, 128 fotos, 8 trilhas, 234 visitantes, 12 parcelas SAF, 89 observações biodiversidade. Máximo 500 palavras.`,
      options: { maxTokens: 1500 }
    }
  ];
  
  Logger.log(`\n📋 Total de requisições: ${requests.length}`);
  Logger.log(`⏱️ Tempo estimado: ~${Math.ceil(requests.length * 10 / 60)} minutos`);
  Logger.log(`   (com delays de 6s entre requisições)\n`);
  
  // Processa em chunks para maior segurança
  const result = GeminiRequestQueue.processInChunks(requests, 3, 45000); // Chunks de 3, 45s entre chunks
  
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('                    RESUMO FINAL');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(`Total: ${result.summary.total}`);
  Logger.log(`✅ Sucesso: ${result.summary.successful}`);
  Logger.log(`❌ Falha: ${result.summary.failed}`);
  Logger.log(`Taxa de sucesso: ${result.summary.successRate}%`);
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  return result;
}


/**
 * Teste rápido do rate limiter (apenas 2 requisições)
 */
function quickRateLimiterTest() {
  Logger.log('🧪 Teste rápido do Rate Limiter...\n');
  
  // Reseta para começar limpo
  GeminiRateLimiter.reset();
  
  // Teste 1
  Logger.log('📤 Requisição 1...');
  const r1 = callGeminiWithRateLimit('Responda apenas: "OK 1"', { maxTokens: 10 });
  Logger.log(`   Resultado: ${r1.success ? '✅' : '❌'} | Cache: ${r1.fromCache || false} | Tempo: ${r1.processingTime}ms`);
  
  // Teste 2
  Logger.log('📤 Requisição 2...');
  const r2 = callGeminiWithRateLimit('Responda apenas: "OK 2"', { maxTokens: 10 });
  Logger.log(`   Resultado: ${r2.success ? '✅' : '❌'} | Cache: ${r2.fromCache || false} | Tempo: ${r2.processingTime}ms`);
  
  // Métricas
  const metrics = GeminiRateLimiter.getMetrics();
  Logger.log(`\n📊 Métricas: Requisições=${metrics.requests}, Rate Limits=${metrics.rate_limits}, Cache Hits=${metrics.cache_hits}`);
  
  return { r1, r2, metrics };
}
