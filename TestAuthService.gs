/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES PARA AUTHSERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Testa criação de usuário
 */
function testCreateUser() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 TESTE: Criar Usuário                                     ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const testUser = {
    nome: 'Usuário Teste',
    email: 'teste_' + Date.now() + '@example.com',
    senha: 'senha123',
    tipo: 'VISITANTE'
  };
  
  Logger.log('Criando usuário...');
  const result = AuthService.createUser(testUser);
  
  Logger.log('\nResultado:');
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('\n✅ Usuário criado com sucesso!');
    
    // Cleanup - deletar usuário de teste
    if (result.userId) {
      Logger.log('\nLimpando usuário de teste...');
      DatabaseService.delete('Usuarios', result.userId);
      Logger.log('✅ Cleanup concluído');
    }
  } else {
    Logger.log('\n❌ Falha ao criar usuário: ' + result.message);
  }
  
  return result;
}

/**
 * Testa autenticação
 */
function testAuthenticate() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 TESTE: Autenticação                                      ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Primeiro criar um usuário para testar
  const testUser = {
    nome: 'Usuário Auth Teste',
    email: 'auth_' + Date.now() + '@example.com',
    senha: 'senha123',
    tipo: 'VISITANTE'
  };
  
  Logger.log('1️⃣ Criando usuário de teste...');
  const createResult = AuthService.createUser(testUser);
  
  if (!createResult.success) {
    Logger.log('❌ Falha ao criar usuário: ' + createResult.message);
    return createResult;
  }
  
  Logger.log('✅ Usuário criado: ' + createResult.userId);
  
  // Testar autenticação
  Logger.log('\n2️⃣ Testando autenticação...');
  const authResult = AuthService.authenticate(testUser.email, testUser.senha);
  
  Logger.log('\nResultado:');
  Logger.log(JSON.stringify(authResult, null, 2));
  
  if (authResult.success) {
    Logger.log('\n✅ Autenticação bem-sucedida!');
    Logger.log('Token: ' + authResult.token);
  } else {
    Logger.log('\n❌ Falha na autenticação: ' + authResult.message);
  }
  
  // Cleanup
  Logger.log('\n3️⃣ Limpando usuário de teste...');
  DatabaseService.delete('Usuarios', createResult.userId);
  Logger.log('✅ Cleanup concluído');
  
  return authResult;
}

/**
 * Testa validação de senha incorreta
 */
function testWrongPassword() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 TESTE: Senha Incorreta                                   ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Criar usuário
  const testUser = {
    nome: 'Usuário Senha Teste',
    email: 'pwd_' + Date.now() + '@example.com',
    senha: 'senha123',
    tipo: 'VISITANTE'
  };
  
  Logger.log('1️⃣ Criando usuário de teste...');
  const createResult = AuthService.createUser(testUser);
  
  if (!createResult.success) {
    Logger.log('❌ Falha ao criar usuário: ' + createResult.message);
    return createResult;
  }
  
  // Testar com senha errada
  Logger.log('\n2️⃣ Testando com senha incorreta...');
  const authResult = AuthService.authenticate(testUser.email, 'senhaErrada123');
  
  if (!authResult.success && authResult.message === 'Senha incorreta') {
    Logger.log('✅ Validação funcionando corretamente!');
  } else {
    Logger.log('❌ Validação de senha não funcionou como esperado');
  }
  
  // Cleanup
  Logger.log('\n3️⃣ Limpando usuário de teste...');
  DatabaseService.delete('Usuarios', createResult.userId);
  Logger.log('✅ Cleanup concluído');
  
  return authResult;
}

/**
 * Testa todos os tipos de usuário
 */
function testAllUserTypes() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 TESTE: Todos os Tipos de Usuário                        ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const tipos = Object.values(AuthService.USER_TYPES);
  const results = [];
  const createdIds = [];
  
  Logger.log(`Testando ${tipos.length} tipos de usuário:\n`);
  
  tipos.forEach((tipo, index) => {
    Logger.log(`${index + 1}/${tipos.length} Testando tipo: ${tipo}`);
    
    const testUser = {
      nome: `Usuário ${tipo}`,
      email: `${tipo.toLowerCase()}_${Date.now()}@example.com`,
      senha: 'senha123',
      tipo: tipo
    };
    
    const result = AuthService.createUser(testUser);
    results.push({ tipo: tipo, result: result });
    
    if (result.success) {
      Logger.log(`  ✅ ${tipo} criado com sucesso`);
      createdIds.push(result.userId);
    } else {
      Logger.log(`  ❌ ${tipo} falhou: ${result.message}`);
    }
  });
  
  // Cleanup
  Logger.log('\n🧹 Limpando usuários de teste...');
  createdIds.forEach(id => {
    DatabaseService.delete('Usuarios', id);
  });
  Logger.log(`✅ ${createdIds.length} usuários removidos`);
  
  // Resumo
  const passed = results.filter(r => r.result.success).length;
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log(`║  RESUMO: ${passed}/${tipos.length} tipos testados com sucesso`);
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  
  return {
    passed: passed,
    total: tipos.length,
    results: results
  };
}

/**
 * Executa todos os testes do AuthService
 */
function runAllAuthTests() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 BATERIA COMPLETA DE TESTES - AUTH SERVICE               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const tests = [
    { name: 'Criar Usuário', fn: testCreateUser },
    { name: 'Autenticação', fn: testAuthenticate },
    { name: 'Senha Incorreta', fn: testWrongPassword },
    { name: 'Tipos de Usuário', fn: testAllUserTypes }
  ];
  
  const results = [];
  let passed = 0;
  
  tests.forEach((test, index) => {
    try {
      Logger.log(`\n${'='.repeat(65)}`);
      Logger.log(`TESTE ${index + 1}/${tests.length}: ${test.name}`);
      Logger.log('='.repeat(65));
      
      const result = test.fn();
      
      if (result && (result.success || (result.passed !== undefined && result.passed > 0))) {
        passed++;
        results.push({ test: test.name, status: 'PASSOU', result: result });
      } else {
        results.push({ test: test.name, status: 'FALHOU', result: result });
      }
    } catch (error) {
      Logger.log(`❌ ERRO no teste ${test.name}: ${error}`);
      results.push({ test: test.name, status: 'ERRO', error: error.toString() });
    }
  });
  
  // Resumo final
  Logger.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📊 RESUMO FINAL - AUTH SERVICE                              ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  Logger.log(`Total de testes: ${tests.length}`);
  Logger.log(`✅ Passaram: ${passed} (${(passed/tests.length*100).toFixed(1)}%)`);
  Logger.log(`❌ Falharam: ${tests.length - passed} (${((tests.length-passed)/tests.length*100).toFixed(1)}%)\n`);
  
  results.forEach((r, i) => {
    const symbol = r.status === 'PASSOU' ? '✅' : r.status === 'ERRO' ? '⚠️' : '❌';
    Logger.log(`${symbol} ${i + 1}. ${r.test}: ${r.status}`);
  });
  
  Logger.log('\n' + '═'.repeat(65) + '\n');
  
  return {
    total: tests.length,
    passed: passed,
    failed: tests.length - passed,
    rate: (passed/tests.length*100).toFixed(1) + '%',
    results: results
  };
}
