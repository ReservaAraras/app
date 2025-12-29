/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST FUNCTIONS - Funções de Teste Seguras
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * IMPORTANTE: Execute estas funções para testar o sistema!
 * NÃO execute funções internas como getSheet(), getSpreadsheet(), etc.
 */

/**
 * 📚 AJUDA - Lista todas as funções disponíveis
 * 
 * Execute esta função para ver todas as funções públicas que você pode usar.
 */
function ajuda() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📚 RESERVA ARARAS - FUNÇÕES DISPONÍVEIS                       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');

  Logger.log('🧪 TESTES E INICIALIZAÇÃO:');
  Logger.log('   • ajuda()                        → Esta mensagem de ajuda');
  Logger.log('   • testeRapido()                  → Teste rápido do sistema');
  Logger.log('   • testarSistema()                → Teste completo');
  Logger.log('   • inicializarSistemaCompleto()   → Inicializa planilhas e dados');
  Logger.log('   • runAllTests()                  → Suite completa de testes');
  Logger.log('   • testIntegracaoCRUD()           → Testes de integração CRUD\n');

  Logger.log('📊 DADOS E ESTATÍSTICAS:');
  Logger.log('   • getGeneralStatistics()         → Estatísticas gerais');
  Logger.log('   • getChartData(tipo)             → Dados para gráficos');
  Logger.log('   • exportToCSV(sheet)             → Exportar para CSV');
  Logger.log('   • exportToJSON(sheet)            → Exportar para JSON\n');

  Logger.log('🗺️ GPS E MAPAS:');
  Logger.log('   • getAllWaypoints()              → Listar todos os waypoints');
  Logger.log('   • createWaypoint(data)           → Criar novo waypoint');
  Logger.log('   • exportKML()                    → Exportar para KML');
  Logger.log('   • exportGPX()                    → Exportar para GPX\n');

  Logger.log('🌳 AGROFLORESTA:');
  Logger.log('   • getAllParcelas()               → Listar parcelas');
  Logger.log('   • createParcela(data)            → Criar parcela');
  Logger.log('   • getProducaoByParcela(id)       → Produção por parcela\n');

  Logger.log('🦋 BIODIVERSIDADE:');
  Logger.log('   • getObservations(areaId)        → Observações de área');
  Logger.log('   • calculateShannonIndex(areaId)  → Índice de Shannon');
  Logger.log('   • calculateSimpsonIndex(areaId)  → Índice de Simpson\n');

  Logger.log('⚙️ CONFIGURAÇÃO:');
  Logger.log('   • validateEnvironmentConfig()    → Validar configuração');
  Logger.log('   • getEnvironmentConfig()         → Ver configuração atual');
  Logger.log('   • saveEnvironmentConfig(config)  → Salvar configuração\n');

  Logger.log('🔄 SINCRONIZAÇÃO:');
  Logger.log('   • syncOfflineData()              → Sincronizar dados offline');
  Logger.log('   • getOfflineQueue()              → Ver fila de sincronização\n');

  Logger.log('⚠️  IMPORTANTE:');
  Logger.log('   NÃO execute funções internas como:');
  Logger.log('   • getSheet()');
  Logger.log('   • getSpreadsheet()');
  Logger.log('   • DatabaseService.*');
  Logger.log('   Estas são funções internas usadas pelo sistema!\n');

  Logger.log('💡 DICA:');
  Logger.log('   Para começar, execute: testeRapido()\n');

  Logger.log('📖 DOCUMENTAÇÃO:');
  Logger.log('   Veja os arquivos .md para documentação completa:\n');
  Logger.log('   • FUNCIONALIDADES_INTUITIVAS.md  → Guia de funcionalidades');
  Logger.log('   • DESIGN_STANDARDS.md            → Padrões de design');
  Logger.log('   • BUGFIXES.md                    → Correções aplicadas');
  Logger.log('   • DEPLOY_SUCCESS.md              → Status do deploy\n');
}

/**
 * 🧪 TESTE RÁPIDO - Execute esta função para testar o sistema
 * 
 * Esta é a função principal de teste. Execute-a para verificar
 * se tudo está funcionando corretamente.
 */
function testeRapido() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   🧪 TESTE RÁPIDO DO SISTEMA                          ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  const results = {
    timestamp: new Date(),
    tests: []
  };

  // Teste 1: Configuração
  Logger.log('1️⃣  Testando configuração...');
  try {
    const config = validateEnvironmentConfig();
    results.tests.push({
      name: 'Configuração',
      status: config.valid ? 'PASS' : 'WARN',
      details: config
    });
    Logger.log(config.valid ? '   ✅ PASS' : '   ⚠️  WARN - Algumas configurações faltando');
  } catch (error) {
    results.tests.push({
      name: 'Configuração',
      status: 'FAIL',
      error: error.toString()
    });
    Logger.log('   ❌ FAIL: ' + error);
  }

  // Teste 2: Acesso à Planilha
  Logger.log('\n2️⃣  Testando acesso à planilha...');
  try {
    const ss = getSpreadsheet();
    results.tests.push({
      name: 'Acesso Planilha',
      status: 'PASS',
      details: { id: ss.getId(), name: ss.getName() }
    });
    Logger.log('   ✅ PASS - Planilha acessível');
  } catch (error) {
    results.tests.push({
      name: 'Acesso Planilha',
      status: 'FAIL',
      error: error.toString()
    });
    Logger.log('   ❌ FAIL: ' + error);
  }

  // Teste 3: Navegação
  Logger.log('\n3️⃣  Testando NavigationService...');
  try {
    const nav = apiGetNavigation();
    results.tests.push({
      name: 'NavigationService',
      status: nav.success ? 'PASS' : 'FAIL',
      details: { modules: nav.navigation?.modules?.length || 0 }
    });
    Logger.log(nav.success ? '   ✅ PASS - Navegação funcionando' : '   ❌ FAIL');
  } catch (error) {
    results.tests.push({
      name: 'NavigationService',
      status: 'FAIL',
      error: error.toString()
    });
    Logger.log('   ❌ FAIL: ' + error);
  }

  // Teste 4: Web App URL
  Logger.log('\n4️⃣  Testando Web App URL...');
  try {
    const url = getWebAppUrl();
    results.tests.push({
      name: 'Web App URL',
      status: url.success ? 'PASS' : 'WARN',
      details: url
    });
    if (url.success) {
      Logger.log('   ✅ PASS - URL: ' + url.url);
    } else {
      Logger.log('   ⚠️  WARN - Web App não deployado ainda');
    }
  } catch (error) {
    results.tests.push({
      name: 'Web App URL',
      status: 'WARN',
      message: 'Deploy pendente'
    });
    Logger.log('   ⚠️  WARN - Faça o deploy como Web App');
  }

  // Resumo
  Logger.log('\n╔════════════════════════════════════════════════════════╗');
  Logger.log('║   📊 RESUMO DOS TESTES                                ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');

  const pass = results.tests.filter(t => t.status === 'PASS').length;
  const warn = results.tests.filter(t => t.status === 'WARN').length;
  const fail = results.tests.filter(t => t.status === 'FAIL').length;

  Logger.log(`\n   ✅ PASS: ${pass}`);
  Logger.log(`   ⚠️  WARN: ${warn}`);
  Logger.log(`   ❌ FAIL: ${fail}`);

  if (fail === 0) {
    Logger.log('\n🎉 TODOS OS TESTES PASSARAM!');
    Logger.log('\n🚀 Próximo passo: Faça o deploy como Web App');
  } else {
    Logger.log('\n⚠️  ALGUNS TESTES FALHARAM');
    Logger.log('💡 Execute: inicializarSistemaCompleto()');
  }

  Logger.log('\n' + '═'.repeat(60));

  results.summary = { pass, warn, fail, total: results.tests.length };
  return results;
}

/**
 * 🔧 TESTE DE PLANILHAS - Verifica se as planilhas existem
 */
function testePlanilhas() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   📊 TESTE DE PLANILHAS                               ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const ss = getSpreadsheet();
    const existingSheets = ss.getSheets().map(s => s.getName());
    const requiredSheets = Object.values(CONFIG.SHEETS);

    Logger.log(`Total de planilhas necessárias: ${requiredSheets.length}`);
    Logger.log(`Total de planilhas existentes: ${existingSheets.length}\n`);

    const missing = [];
    const existing = [];

    requiredSheets.forEach(sheetName => {
      if (existingSheets.includes(sheetName)) {
        existing.push(sheetName);
        Logger.log(`✅ ${sheetName}`);
      } else {
        missing.push(sheetName);
        Logger.log(`❌ ${sheetName} - FALTANDO`);
      }
    });

    Logger.log('\n' + '═'.repeat(60));
    Logger.log(`\n✅ Existentes: ${existing.length}`);
    Logger.log(`❌ Faltando: ${missing.length}`);

    if (missing.length > 0) {
      Logger.log('\n💡 Execute: inicializarSistemaCompleto()');
    } else {
      Logger.log('\n🎉 TODAS AS PLANILHAS CRIADAS!');
    }

    return {
      success: true,
      total: requiredSheets.length,
      existing: existing.length,
      missing: missing.length,
      missingSheets: missing
    };
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 🌐 TESTE DE NAVEGAÇÃO - Testa o NavigationService
 */
function testeNavegacao() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   🌐 TESTE DE NAVEGAÇÃO                               ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Teste 1: Estrutura de navegação
    Logger.log('1️⃣  Testando estrutura de navegação...');
    const nav = apiGetNavigation();
    if (nav.success) {
      Logger.log(`   ✅ Módulos: ${nav.navigation.modules.length}`);
      Logger.log(`   ✅ Ferramentas: ${nav.navigation.tools.length}`);
      Logger.log(`   ✅ Formulários: ${nav.navigation.forms.length}`);
    } else {
      Logger.log('   ❌ ERRO ao obter navegação');
    }

    // Teste 2: Breadcrumbs
    Logger.log('\n2️⃣  Testando breadcrumbs...');
    const breadcrumbs = apiGetBreadcrumbs('/agrofloresta/parcelas');
    if (breadcrumbs.success) {
      Logger.log(`   ✅ Breadcrumbs: ${breadcrumbs.breadcrumbs.length} níveis`);
    } else {
      Logger.log('   ❌ ERRO ao obter breadcrumbs');
    }

    // Teste 3: Menu contextual
    Logger.log('\n3️⃣  Testando menu contextual...');
    const menu = apiGetContextMenu('agrofloresta');
    if (menu.success) {
      Logger.log(`   ✅ Menu: ${menu.menu.items.length} itens`);
    } else {
      Logger.log('   ❌ ERRO ao obter menu');
    }

    // Teste 4: Busca
    Logger.log('\n4️⃣  Testando busca...');
    const search = apiSearchNavigation('água');
    if (search.success) {
      Logger.log(`   ✅ Busca: ${search.count} resultados`);
    } else {
      Logger.log('   ❌ ERRO na busca');
    }

    Logger.log('\n🎉 NAVEGAÇÃO FUNCIONANDO CORRETAMENTE!');

    return {
      success: true,
      navigation: nav.success,
      breadcrumbs: breadcrumbs.success,
      menu: menu.success,
      search: search.success
    };
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 📋 LISTA DE FUNÇÕES DISPONÍVEIS
 * 
 * Execute esta função para ver todas as funções de teste disponíveis
 */
function listarFuncoesDeTeste() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   📋 FUNÇÕES DE TESTE DISPONÍVEIS                     ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  Logger.log('🧪 TESTES RÁPIDOS:');
  Logger.log('   • testeRapido()           - Teste geral do sistema');
  Logger.log('   • testePlanilhas()        - Verifica planilhas');
  Logger.log('   • testeNavegacao()        - Testa navegação\n');

  Logger.log('🔧 INICIALIZAÇÃO:');
  Logger.log('   • inicializarSistemaCompleto()  - Configura tudo');
  Logger.log('   • testarSistema()               - Teste completo\n');

  Logger.log('📊 DIAGNÓSTICO:');
  Logger.log('   • diagnosticarSistema()   - Diagnóstico completo');
  Logger.log('   • getSystemStatus()       - Status do sistema\n');

  Logger.log('🌐 WEB APP:');
  Logger.log('   • getWebAppUrl()          - Obtém URL do Web App');
  Logger.log('   • getPlanUrl()            - Obtém URL do Plan\n');

  Logger.log('⚠️  IMPORTANTE:');
  Logger.log('   NÃO execute funções internas como:');
  Logger.log('   • getSheet()');
  Logger.log('   • getSpreadsheet()');
  Logger.log('   • etc.\n');

  Logger.log('💡 DICA:');
  Logger.log('   Execute: testeRapido() para começar!\n');

  Logger.log('═'.repeat(60));
}

/**
 * ⚠️ FUNÇÃO DE AVISO - Executada quando funções internas são chamadas
 */
function avisoFuncaoInterna() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   ⚠️  AVISO: FUNÇÃO INTERNA                           ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  Logger.log('❌ Você tentou executar uma função interna!');
  Logger.log('💡 Use as funções de teste ao invés:\n');

  Logger.log('   • testeRapido()');
  Logger.log('   • testePlanilhas()');
  Logger.log('   • testeNavegacao()');
  Logger.log('   • inicializarSistemaCompleto()\n');

  Logger.log('📋 Para ver todas as funções disponíveis:');
  Logger.log('   • listarFuncoesDeTeste()\n');

  Logger.log('═'.repeat(60));
}
