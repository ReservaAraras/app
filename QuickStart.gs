/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK START - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Script de inicialização rápida para testes e validação
 * 
 * @version 1.0.0
 * @date 2024-11-08
 */

/**
 * Função principal de ajuda - mostra todas as opções disponíveis
 */
function ajuda() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║                                                               ║');
  Logger.log('║        🌳 RESERVA ARARAS - SISTEMA DE TESTES                 ║');
  Logger.log('║                                                               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('\n');
  
  Logger.log('📋 COMANDOS DISPONÍVEIS:\n');
  
  Logger.log('🚀 INICIALIZAÇÃO:');
  Logger.log('   iniciar()                    - Inicializa o sistema completo');
  Logger.log('   verificarSistema()           - Verifica configuração e status\n');
  
  Logger.log('🧪 TESTES:');
  Logger.log('   testarTudo()                 - Executa TODOS os testes');
  Logger.log('   testarCRUD()                 - Testa operações CRUD');
  Logger.log('   testarNavegacao()            - Testa navegação');
  Logger.log('   testarServicos()             - Testa serviços backend\n');
  
  Logger.log('🎲 DADOS DE TESTE:');
  Logger.log('   gerarDados()                 - Gera dados de teste');
  Logger.log('   limparDados()                - Remove dados de teste');
  Logger.log('   verEstatisticas()            - Mostra estatísticas\n');
  
  Logger.log('📊 DASHBOARDS:');
  Logger.log('   abrirDashboard()             - Abre dashboard de testes');
  Logger.log('   abrirValidadorNavegacao()    - Abre validador de navegação\n');
  
  Logger.log('📚 DOCUMENTAÇÃO:');
  Logger.log('   verGuia()                    - Mostra link para guia completo');
  Logger.log('   verResumo()                  - Mostra resumo das ferramentas\n');
  
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  Logger.log('💡 DICA: Execute iniciar() para começar!\n');
}

/**
 * Inicializa o sistema completo
 */
function iniciar() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🚀 INICIALIZANDO SISTEMA RESERVA ARARAS                     ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // 1. Verificar configuração
  Logger.log('1️⃣ Verificando configuração...');
  const config = validateEnvironmentConfig();
  
  if (!config.valid) {
    Logger.log('   ⚠️  Configuração incompleta!');
    Logger.log('   Campos faltando: ' + config.missing.join(', '));
    Logger.log('\n   Execute: configurar() para configurar\n');
    return false;
  }
  Logger.log('   ✅ Configuração OK\n');
  
  // 2. Verificar planilhas
  Logger.log('2️⃣ Verificando planilhas...');
  try {
    const ss = getSpreadsheet();
    Logger.log('   ✅ Spreadsheet: ' + ss.getName() + '\n');
  } catch (e) {
    Logger.log('   ❌ Erro ao acessar Spreadsheet: ' + e.toString() + '\n');
    return false;
  }
  
  // 3. Verificar dados
  Logger.log('3️⃣ Verificando dados...');
  const stats = getTestStatistics();
  if (stats.success) {
    Logger.log('   ✅ Total de registros: ' + stats.total + '\n');
  } else {
    Logger.log('   ⚠️  Erro ao obter estatísticas\n');
  }
  
  // 4. Resumo
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  ✅ SISTEMA INICIALIZADO COM SUCESSO!                        ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  Logger.log('📋 PRÓXIMOS PASSOS:\n');
  Logger.log('   • Execute: gerarDados() para criar dados de teste');
  Logger.log('   • Execute: testarTudo() para validar o sistema');
  Logger.log('   • Execute: abrirDashboard() para interface visual\n');
  
  return true;
}

/**
 * Verifica status do sistema
 */
function verificarSistema() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🔍 VERIFICANDO SISTEMA                                      ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const checks = [];
  
  // Configuração
  Logger.log('📋 CONFIGURAÇÃO:');
  const config = getEnvironmentConfig();
  checks.push({ name: 'SPREADSHEET_ID', status: !!config.SPREADSHEET_ID });
  checks.push({ name: 'DRIVE_FOLDER_ID', status: !!config.DRIVE_FOLDER_ID });
  checks.push({ name: 'GEMINI_API_KEY', status: !!config.GEMINI_API_KEY });
  
  checks.forEach(check => {
    Logger.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
  });
  Logger.log('');
  
  // Planilhas
  Logger.log('📊 PLANILHAS:');
  const sheets = [
    'Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo',
    'Biodiversidade', 'ProducaoAgroflorestal', 'SessoesTerapia', 'Visitantes'
  ];
  
  sheets.forEach(sheetName => {
    try {
      const sheet = getSheet(sheetName);
      const count = sheet.getLastRow() - 1;
      Logger.log(`   ✅ ${sheetName}: ${count} registros`);
    } catch (e) {
      Logger.log(`   ❌ ${sheetName}: Erro`);
    }
  });
  Logger.log('');
  
  // Serviços
  Logger.log('⚙️  SERVIÇOS:');
  const services = [
    { name: 'DatabaseService', test: () => !!DatabaseService },
    { name: 'ValidationService', test: () => !!ValidationService },
    { name: 'ExportService', test: () => !!ExportService },
    { name: 'StatisticsService', test: () => !!StatisticsService }
  ];
  
  services.forEach(service => {
    try {
      const status = service.test();
      Logger.log(`   ${status ? '✅' : '❌'} ${service.name}`);
    } catch (e) {
      Logger.log(`   ❌ ${service.name}: Erro`);
    }
  });
  Logger.log('');
  
  // Resumo
  const allOk = checks.every(c => c.status);
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  if (allOk) {
    Logger.log('║  ✅ SISTEMA OK - PRONTO PARA USO                            ║');
  } else {
    Logger.log('║  ⚠️  SISTEMA COM PROBLEMAS - VERIFICAR ACIMA                ║');
  }
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

/**
 * Testa tudo
 */
function testarTudo() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧪 EXECUTANDO TODOS OS TESTES                               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return runFullTestSuite();
}

/**
 * Testa apenas CRUD
 */
function testarCRUD() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  💾 TESTANDO OPERAÇÕES CRUD                                  ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const forms = ['waypoint', 'foto', 'agua', 'solo', 'biodiversidade', 'producao', 'terapia', 'visitante'];
  const results = { passed: 0, failed: 0 };
  
  forms.forEach(formId => {
    const result = testFormCRUD(formId);
    if (result.success) {
      results.passed++;
      Logger.log(`✅ ${formId}`);
    } else {
      results.failed++;
      Logger.log(`❌ ${formId}: ${result.error}`);
    }
  });
  
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log(`║  Passou: ${results.passed}/${forms.length} | Falhou: ${results.failed}/${forms.length}`);
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return results;
}

/**
 * Testa navegação
 */
function testarNavegacao() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🧭 TESTANDO NAVEGAÇÃO                                       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  Logger.log('💡 Para testes completos de navegação, use:');
  Logger.log('   abrirValidadorNavegacao()\n');
  
  const navs = ['home', 'map', 'export', 'stats'];
  const results = { passed: 0, failed: 0 };
  
  navs.forEach(navId => {
    const result = testNavigation(navId);
    if (result.success) {
      results.passed++;
      Logger.log(`✅ ${navId}`);
    } else {
      results.failed++;
      Logger.log(`❌ ${navId}: ${result.error}`);
    }
  });
  
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log(`║  Passou: ${results.passed}/${navs.length} | Falhou: ${results.failed}/${navs.length}`);
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return results;
}

/**
 * Testa serviços
 */
function testarServicos() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  ⚙️  TESTANDO SERVIÇOS                                       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const services = ['database', 'validation', 'export', 'statistics'];
  const results = { passed: 0, failed: 0 };
  
  services.forEach(serviceId => {
    const result = testService(serviceId);
    if (result.success) {
      results.passed++;
      Logger.log(`✅ ${serviceId}`);
    } else {
      results.failed++;
      Logger.log(`❌ ${serviceId}: ${result.error}`);
    }
  });
  
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log(`║  Passou: ${results.passed}/${services.length} | Falhou: ${results.failed}/${services.length}`);
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return results;
}

/**
 * Gera dados de teste
 */
function gerarDados() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🎲 GERANDO DADOS DE TESTE                                   ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return generateTestData();
}

/**
 * Limpa dados de teste
 */
function limparDados() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🗑️  LIMPANDO DADOS DE TESTE                                 ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return clearTestData();
}

/**
 * Ver estatísticas
 */
function verEstatisticas() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📊 ESTATÍSTICAS DO SISTEMA                                  ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const stats = getTestStatistics();
  
  if (!stats.success) {
    Logger.log('❌ Erro ao obter estatísticas: ' + stats.error + '\n');
    return;
  }
  
  Object.keys(stats.stats).forEach(sheet => {
    Logger.log(`   ${sheet}: ${stats.stats[sheet]} registros`);
  });
  
  Logger.log(`\n   TOTAL: ${stats.total} registros\n`);
  
  return stats;
}

/**
 * Abre dashboard de testes
 */
function abrirDashboard() {
  Logger.log('\n📊 Abrindo Dashboard de Testes...\n');
  return openTestDashboard();
}

/**
 * Abre validador de navegação
 */
function abrirValidadorNavegacao() {
  Logger.log('\n🧭 Abrindo Validador de Navegação...\n');
  return openNavigationValidator();
}

/**
 * Mostra guia completo
 */
function verGuia() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📚 GUIA COMPLETO DE TESTES                                  ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  Logger.log('📄 Arquivo: GUIA_COMPLETO_TESTES.md\n');
  Logger.log('Este guia contém:');
  Logger.log('   • Instruções detalhadas de teste');
  Logger.log('   • Procedimentos CRUD para 8 entidades');
  Logger.log('   • Fluxos de navegação');
  Logger.log('   • Testes de validação');
  Logger.log('   • Checklist completo\n');
}

/**
 * Mostra resumo das ferramentas
 */
function verResumo() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📋 RESUMO DAS FERRAMENTAS                                   ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  Logger.log('📄 Arquivo: RESUMO_FERRAMENTAS_TESTE.md\n');
  Logger.log('Ferramentas disponíveis:');
  Logger.log('   1. TestDashboard.html - Dashboard visual');
  Logger.log('   2. NavigationValidator.html - Validador de navegação');
  Logger.log('   3. ComprehensiveTestSuite.gs - Suite de testes');
  Logger.log('   4. DataGenerator.gs - Gerador de dados');
  Logger.log('   5. TestIntegration.gs - Integração');
  Logger.log('   6. GUIA_COMPLETO_TESTES.md - Documentação\n');
}

/**
 * Configura o sistema
 */
function configurar() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  ⚙️  CONFIGURAÇÃO DO SISTEMA                                 ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  Logger.log('Para configurar o sistema, execute:\n');
  Logger.log('saveEnvironmentConfig({');
  Logger.log('  SPREADSHEET_ID: "seu_id_aqui",');
  Logger.log('  DRIVE_FOLDER_ID: "seu_id_aqui",');
  Logger.log('  GEMINI_API_KEY: "sua_chave_aqui",');
  Logger.log('  GEMINI_TEMPERATURE: "0.7"');
  Logger.log('});\n');
  
  Logger.log('Valores atuais:');
  const config = getEnvironmentConfig();
  Logger.log(`   SPREADSHEET_ID: ${config.SPREADSHEET_ID || 'NÃO CONFIGURADO'}`);
  Logger.log(`   DRIVE_FOLDER_ID: ${config.DRIVE_FOLDER_ID || 'NÃO CONFIGURADO'}`);
  Logger.log(`   GEMINI_API_KEY: ${config.GEMINI_API_KEY ? '***' + config.GEMINI_API_KEY.slice(-4) : 'NÃO CONFIGURADO'}`);
  Logger.log(`   GEMINI_TEMPERATURE: ${config.GEMINI_TEMPERATURE || '0.7 (padrão)'}\n`);
}

/**
 * Teste rápido - QuickStart version
 * NOTA: Função principal testeRapido() está em TestFunctions.gs
 */
function testeRapidoQuickStart() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  ⚡ TESTE RÁPIDO                                             ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  Logger.log('1️⃣ Testando configuração...');
  const config = validateEnvironmentConfig();
  Logger.log(`   ${config.valid ? '✅' : '❌'} Configuração\n`);
  
  Logger.log('2️⃣ Testando acesso ao Spreadsheet...');
  try {
    const ss = getSpreadsheet();
    Logger.log(`   ✅ Spreadsheet: ${ss.getName()}\n`);
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.toString()}\n`);
    return false;
  }
  
  Logger.log('3️⃣ Testando CRUD básico...');
  const crudResult = testFormCRUD('waypoint');
  Logger.log(`   ${crudResult.success ? '✅' : '❌'} CRUD Waypoint\n`);
  
  Logger.log('4️⃣ Testando validação...');
  const validResult = testService('validation');
  Logger.log(`   ${validResult.success ? '✅' : '❌'} Validação\n`);
  
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  if (config.valid && crudResult.success && validResult.success) {
    Logger.log('║  ✅ TESTE RÁPIDO PASSOU - SISTEMA OK                        ║');
  } else {
    Logger.log('║  ⚠️  TESTE RÁPIDO FALHOU - VERIFICAR ERROS                  ║');
  }
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  return config.valid && crudResult.success && validResult.success;
}

// Executa ajuda automaticamente quando o script é carregado
// DESABILITADO: Menu consolidado em Code.gs
/*
function onOpen() {
  // Adiciona menu de testes
  addTestMenu();
  
  // Mostra ajuda no log
  Logger.log('\n💡 Digite ajuda() para ver todos os comandos disponíveis\n');
}
*/
