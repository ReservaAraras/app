/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DAS CORREÇÕES DE MÉDIA PRIORIDADE
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Testa as correções de MÉDIA prioridade
 */
function testarCorrecoesMedia() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🟡 TESTANDO CORREÇÕES DE MÉDIA PRIORIDADE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const resultados = {
    validacaoTipos: testarValidacaoTipos(),
    validacaoLimites: testarValidacaoLimites(),
    validacaoFormatos: testarValidacaoFormatos(),
    geracaoDados: testarGeracaoDados()
  };
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Validação de Tipos:', resultados.validacaoTipos.success ? 'PASSOU' : 'FALHOU');
  console.log('✅ Validação de Limites:', resultados.validacaoLimites.success ? 'PASSOU' : 'FALHOU');
  console.log('✅ Validação de Formatos:', resultados.validacaoFormatos.success ? 'PASSOU' : 'FALHOU');
  console.log('✅ Geração de Dados:', resultados.geracaoDados.success ? 'PASSOU' : 'FALHOU');
  
  const total = Object.values(resultados).filter(r => r.success).length;
  const taxa = (total / 4 * 100).toFixed(1);
  
  console.log('\n📈 Taxa de Sucesso:', taxa + '%');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  return {
    success: total === 4,
    taxa: taxa,
    detalhes: resultados
  };
}

/**
 * Teste 1: Validação de Tipos de Dados
 */
function testarValidacaoTipos() {
  console.log('🧪 TESTE 1: Validação de Tipos de Dados');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    // Teste 1.1: Número inválido (string)
    console.log('  📝 Teste 1.1: Tentando criar waypoint com latitude inválida...');
    const result1 = createWaypoint({
      nome: 'Teste Validação',
      latitude: 'texto_invalido', // Deveria ser número
      longitude: -47.9292,
      categoria: 'teste'
    });
    
    if (result1.success) {
      throw new Error('Validação FALHOU: aceitou latitude como string');
    }
    
    console.log('  ✅ Validação rejeitou latitude inválida');
    
    // Teste 1.2: Número válido
    console.log('  📝 Teste 1.2: Criando waypoint com dados válidos...');
    const result2 = createWaypoint({
      nome: 'Teste Validação OK',
      latitude: -15.7801,
      longitude: -47.9292,
      categoria: 'teste'
    });
    
    if (!result2.success) {
      throw new Error('Validação FALHOU: rejeitou dados válidos - ' + result2.error);
    }
    
    console.log('  ✅ Validação aceitou dados válidos');
    
    // Limpar
    if (result2.id) {
      deleteWaypoint(result2.id);
    }
    
    console.log('  🎉 Teste de Validação de Tipos: PASSOU!\n');
    return { success: true };
    
  } catch (error) {
    console.log('  ❌ Teste de Validação de Tipos: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste 2: Validação de Limites de Valores
 */
function testarValidacaoLimites() {
  console.log('🧪 TESTE 2: Validação de Limites de Valores');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    // Teste 2.1: pH fora do limite
    console.log('  📝 Teste 2.1: Tentando criar análise de água com pH inválido...');
    const result1 = createQualidadeAgua({
      data: new Date(),
      local: 'Teste',
      pH: 20, // Fora do limite (0-14)
      temperatura: 25
    });
    
    if (result1.success) {
      throw new Error('Validação FALHOU: aceitou pH = 20 (limite é 0-14)');
    }
    
    console.log('  ✅ Validação rejeitou pH fora do limite');
    
    // Teste 2.2: pH válido
    console.log('  📝 Teste 2.2: Criando análise com pH válido...');
    const result2 = createQualidadeAgua({
      data: new Date(),
      local: 'Teste Validação',
      pH: 7.2, // Válido
      temperatura: 25
    });
    
    if (!result2.success) {
      throw new Error('Validação FALHOU: rejeitou pH válido - ' + result2.error);
    }
    
    console.log('  ✅ Validação aceitou pH válido');
    
    // Limpar
    if (result2.id) {
      deleteQualidadeAgua(result2.id);
    }
    
    console.log('  🎉 Teste de Validação de Limites: PASSOU!\n');
    return { success: true };
    
  } catch (error) {
    console.log('  ❌ Teste de Validação de Limites: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste 3: Validação de Formatos
 */
function testarValidacaoFormatos() {
  console.log('🧪 TESTE 3: Validação de Formatos');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    // Teste 3.1: Data inválida
    console.log('  📝 Teste 3.1: Tentando criar visitante com data inválida...');
    const result1 = createVisitante({
      nome: 'Teste Validação',
      data_visita: 'data_invalida', // Deveria ser data
      tamanho_grupo: 5
    });
    
    if (result1.success) {
      throw new Error('Validação FALHOU: aceitou data inválida');
    }
    
    console.log('  ✅ Validação rejeitou data inválida');
    
    // Teste 3.2: Data válida
    console.log('  📝 Teste 3.2: Criando visitante com data válida...');
    const result2 = createVisitante({
      nome: 'Teste Validação OK',
      data_visita: new Date(),
      tamanho_grupo: 5
    });
    
    if (!result2.success) {
      throw new Error('Validação FALHOU: rejeitou data válida - ' + result2.error);
    }
    
    console.log('  ✅ Validação aceitou data válida');
    
    // Limpar
    if (result2.id) {
      deleteVisitante(result2.id);
    }
    
    console.log('  🎉 Teste de Validação de Formatos: PASSOU!\n');
    return { success: true };
    
  } catch (error) {
    console.log('  ❌ Teste de Validação de Formatos: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste 4: Geração de Dados Completa
 */
function testarGeracaoDados() {
  console.log('🧪 TESTE 4: Geração de Dados Completa');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    console.log('  📝 Gerando dados de teste...');
    
    const results = DataGenerator.generateAll();
    
    // Verificar se todos os tipos foram gerados
    const tipos = ['waypoints', 'fotos', 'qualidadeAgua', 'qualidadeSolo', 
                   'biodiversidade', 'producao', 'terapia', 'visitantes'];
    
    let totalGerado = 0;
    let totalEsperado = 0;
    
    const esperados = {
      waypoints: 10,
      fotos: 5,
      qualidadeAgua: 8,
      qualidadeSolo: 8,
      biodiversidade: 15,
      producao: 12,
      terapia: 6,
      visitantes: 20
    };
    
    console.log('\n  📊 Resultados por tipo:');
    tipos.forEach(tipo => {
      const gerado = results[tipo] ? results[tipo].length : 0;
      const esperado = esperados[tipo];
      totalGerado += gerado;
      totalEsperado += esperado;
      
      const status = gerado === esperado ? '✅' : '⚠️';
      console.log(`    ${status} ${tipo}: ${gerado}/${esperado}`);
    });
    
    const taxa = (totalGerado / totalEsperado * 100).toFixed(1);
    console.log(`\n  📈 Taxa de Sucesso: ${taxa}% (${totalGerado}/${totalEsperado})`);
    
    if (taxa < 90) {
      throw new Error(`Taxa de sucesso muito baixa: ${taxa}%`);
    }
    
    console.log('  🎉 Teste de Geração de Dados: PASSOU!\n');
    return { success: true, taxa: taxa, gerado: totalGerado, esperado: totalEsperado };
    
  } catch (error) {
    console.log('  ❌ Teste de Geração de Dados: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    return { success: false, error: error.toString() };
  }
}

/**
 * Testes rápidos individuais
 */
function testeRapidoValidacoes() {
  const r1 = testarValidacaoTipos();
  const r2 = testarValidacaoLimites();
  const r3 = testarValidacaoFormatos();
  
  const total = [r1, r2, r3].filter(r => r.success).length;
  console.log(`\n📊 Validações: ${total}/3 passaram`);
  
  return { success: total === 3 };
}

function testeRapidoGeracao() {
  return testarGeracaoDados();
}
