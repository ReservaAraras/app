/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WELCOME - Mensagem de Boas-Vindas e Orientação
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * 👋 BEM-VINDO - Primeira função a executar
 * 
 * Execute esta função para começar a usar o sistema Reserva Araras.
 * Ela mostrará um guia rápido e testará a configuração.
 */
function bemVindo() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║                                                               ║');
  Logger.log('║       🌳 BEM-VINDO AO SISTEMA RESERVA ARARAS 🌳                ║');
  Logger.log('║                                                               ║');
  Logger.log('║   Sistema Integrado de Gestão Ambiental e Agroflorestal     ║');
  Logger.log('║                                                               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');

  Logger.log('📋 PRIMEIROS PASSOS:\n');
  
  Logger.log('1️⃣  CONFIGURAÇÃO INICIAL');
  Logger.log('   Execute: inicializarSistemaCompleto()');
  Logger.log('   Isso criará todas as planilhas necessárias.\n');
  
  Logger.log('2️⃣  TESTAR O SISTEMA');
  Logger.log('   Execute: testeRapido()');
  Logger.log('   Verifica se tudo está funcionando.\n');
  
  Logger.log('3️⃣  EXPLORAR FUNCIONALIDADES');
  Logger.log('   Execute: ajuda()');
  Logger.log('   Lista todas as funções disponíveis.\n');

  Logger.log('🎯 AÇÕES RÁPIDAS:\n');
  
  Logger.log('📊 Ver Estatísticas:');
  Logger.log('   getGeneralStatistics()\n');
  
  Logger.log('🗺️  Ver Waypoints:');
  Logger.log('   getAllWaypoints()\n');
  
  Logger.log('🌳 Ver Parcelas:');
  Logger.log('   getAllParcelas()\n');
  
  Logger.log('📥 Exportar Dados:');
  Logger.log('   exportToCSV("Waypoints")');
  Logger.log('   exportToJSON("Parcelas_Agro")\n');

  Logger.log('⚠️  IMPORTANTE:\n');
  Logger.log('   ❌ NÃO execute funções internas como:');
  Logger.log('      • getSheet()');
  Logger.log('      • getSpreadsheet()');
  Logger.log('      • DatabaseService.*\n');
  
  Logger.log('   ✅ Execute apenas funções públicas listadas em ajuda()\n');

  Logger.log('📚 DOCUMENTAÇÃO:\n');
  Logger.log('   • FUNCIONALIDADES_INTUITIVAS.md  → Guia completo');
  Logger.log('   • DESIGN_STANDARDS.md            → Padrões de design');
  Logger.log('   • BUGFIXES.md                    → Correções aplicadas\n');

  Logger.log('🚀 PRONTO PARA COMEÇAR?\n');
  Logger.log('   Execute agora: inicializarSistemaCompleto()\n');

  // Verificar configuração
  Logger.log('🔍 Verificando configuração...\n');
  
  try {
    const config = validateEnvironmentConfig();
    
    if (config.valid) {
      Logger.log('✅ Configuração OK!\n');
      Logger.log('   Você pode começar a usar o sistema.\n');
      Logger.log('   Próximo passo: testeRapido()\n');
    } else {
      Logger.log('⚠️  Configuração incompleta:\n');
      config.missing.forEach(item => {
        Logger.log(`   ❌ ${item}`);
      });
      Logger.log('\n   Configure as variáveis faltantes antes de continuar.\n');
      Logger.log('   Veja: saveEnvironmentConfig()\n');
    }
  } catch (error) {
    Logger.log('⚠️  Não foi possível verificar a configuração.\n');
    Logger.log('   Execute: validateEnvironmentConfig()\n');
  }

  Logger.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * 🆘 AJUDA RÁPIDA - Quando estiver perdido
 */
function socorro() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🆘 AJUDA RÁPIDA - RESERVA ARARAS                              ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');

  Logger.log('❓ PROBLEMAS COMUNS:\n');

  Logger.log('1. "Nome da planilha não fornecido"');
  Logger.log('   → Você executou uma função interna por engano');
  Logger.log('   → Execute: ajuda() para ver funções corretas\n');

  Logger.log('2. "Spreadsheet não encontrado"');
  Logger.log('   → Configure o SPREADSHEET_ID');
  Logger.log('   → Execute: saveEnvironmentConfig({...})\n');

  Logger.log('3. "Planilha não existe"');
  Logger.log('   → Execute: inicializarSistemaCompleto()');
  Logger.log('   → Isso criará todas as planilhas\n');

  Logger.log('4. "Erro ao sincronizar"');
  Logger.log('   → Verifique conexão com internet');
  Logger.log('   → Execute: syncOfflineData()\n');

  Logger.log('5. "Teste falhou"');
  Logger.log('   → Veja os logs detalhados');
  Logger.log('   → Execute: testIntegracaoCRUD()\n');

  Logger.log('📞 FUNÇÕES DE DIAGNÓSTICO:\n');
  Logger.log('   • validateEnvironmentConfig()  → Verifica configuração');
  Logger.log('   • testeRapido()                → Teste rápido');
  Logger.log('   • runAllTests()                → Teste completo\n');

  Logger.log('📚 DOCUMENTAÇÃO COMPLETA:\n');
  Logger.log('   Execute: ajuda()\n');

  Logger.log('💡 DICA:');
  Logger.log('   Se ainda estiver com problemas, execute:');
  Logger.log('   inicializarSistemaCompleto()\n');
}

/**
 * 🎓 TUTORIAL INTERATIVO
 */
function tutorial() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🎓 TUTORIAL INTERATIVO - RESERVA ARARAS                       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');

  Logger.log('📖 LIÇÃO 1: INICIALIZAÇÃO\n');
  Logger.log('   O sistema precisa ser inicializado antes do primeiro uso.\n');
  Logger.log('   Execute agora:');
  Logger.log('   inicializarSistemaCompleto()\n');
  Logger.log('   Isso criará:\n');
  Logger.log('   • 20+ planilhas para diferentes módulos');
  Logger.log('   • Estrutura de dados completa');
  Logger.log('   • Dados de exemplo (opcional)\n');

  Logger.log('📖 LIÇÃO 2: TESTANDO\n');
  Logger.log('   Após inicializar, teste se tudo está OK.\n');
  Logger.log('   Execute:');
  Logger.log('   testeRapido()\n');
  Logger.log('   Isso verificará:\n');
  Logger.log('   • Configuração');
  Logger.log('   • Planilhas');
  Logger.log('   • Navegação');
  Logger.log('   • CRUD básico\n');

  Logger.log('📖 LIÇÃO 3: CRIANDO DADOS\n');
  Logger.log('   Agora você pode criar registros.\n');
  Logger.log('   Exemplo - Criar waypoint:');
  Logger.log('   createWaypoint({');
  Logger.log('     nome: "Ponto de Observação",');
  Logger.log('     latitude: -15.7801,');
  Logger.log('     longitude: -47.9292,');
  Logger.log('     tipo: "observacao"');
  Logger.log('   })\n');

  Logger.log('📖 LIÇÃO 4: CONSULTANDO DADOS\n');
  Logger.log('   Veja os dados criados.\n');
  Logger.log('   Execute:');
  Logger.log('   getAllWaypoints()');
  Logger.log('   getAllParcelas()');
  Logger.log('   getGeneralStatistics()\n');

  Logger.log('📖 LIÇÃO 5: EXPORTANDO\n');
  Logger.log('   Exporte dados para análise externa.\n');
  Logger.log('   Execute:');
  Logger.log('   exportToCSV("Waypoints")');
  Logger.log('   exportToJSON("Parcelas_Agro")');
  Logger.log('   exportKML()');
  Logger.log('   exportGPX()\n');

  Logger.log('🎯 PRÓXIMOS PASSOS:\n');
  Logger.log('   1. Execute: inicializarSistemaCompleto()');
  Logger.log('   2. Execute: testeRapido()');
  Logger.log('   3. Explore: ajuda()\n');

  Logger.log('💡 DICA:');
  Logger.log('   Salve estas funções nos seus favoritos:');
  Logger.log('   • bemVindo()');
  Logger.log('   • ajuda()');
  Logger.log('   • socorro()\n');
}

/**
 * 📊 STATUS DO SISTEMA
 */
function statusSistema() {
  Logger.log('\n╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  📊 STATUS DO SISTEMA - RESERVA ARARAS                         ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    // Configuração
    Logger.log('⚙️  CONFIGURAÇÃO:');
    const config = validateEnvironmentConfig();
    Logger.log(`   Status: ${config.valid ? '✅ OK' : '⚠️  Incompleta'}`);
    if (!config.valid) {
      Logger.log(`   Faltando: ${config.missing.join(', ')}`);
    }
    Logger.log('');

    // Planilhas
    Logger.log('📋 PLANILHAS:');
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheets = ss.getSheets();
      Logger.log(`   Total: ${sheets.length} planilhas`);
      Logger.log(`   Esperado: ~20 planilhas`);
      Logger.log(`   Status: ${sheets.length >= 15 ? '✅ OK' : '⚠️  Incompleto'}`);
    } catch (e) {
      Logger.log('   Status: ❌ Erro ao acessar');
    }
    Logger.log('');

    // Estatísticas
    Logger.log('📊 DADOS:');
    try {
      const stats = getGeneralStatistics();
      if (stats.success) {
        Logger.log(`   Waypoints: ${stats.data.waypoints || 0}`);
        Logger.log(`   Parcelas: ${stats.data.parcelas || 0}`);
        Logger.log(`   Fotos: ${stats.data.fotos || 0}`);
        Logger.log('   Status: ✅ OK');
      }
    } catch (e) {
      Logger.log('   Status: ⚠️  Não disponível');
    }
    Logger.log('');

    // Testes
    Logger.log('🧪 TESTES:');
    Logger.log('   Execute: testeRapido()');
    Logger.log('   Para verificar funcionalidades\n');

  } catch (error) {
    Logger.log('❌ Erro ao verificar status:\n');
    Logger.log(`   ${error.message}\n`);
  }

  Logger.log('═══════════════════════════════════════════════════════════════\n');
}
