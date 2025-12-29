/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNOSTICO DE INCLUDES - Identifica chamadas com parametros invalidos
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Testa todas as paginas HTML para identificar problemas de include
 */
function diagnosticarIncludes() {
  EnterpriseLogger.info('Iniciando diagnostico de includes');
  
  const paginas = [
    'Index',
    'MobileAppNew',
    'MobileExportInterface',
    'Plan',
    'TestDashboard'
  ];
  
  const resultados = [];
  
  paginas.forEach(function(pagina) {
    EnterpriseLogger.info('Testando pagina: ' + pagina);
    
    try {
      const template = HtmlService.createTemplateFromFile(pagina);
      const html = template.evaluate().getContent();
      
      resultados.push({
        pagina: pagina,
        status: 'OK',
        tamanho: html.length
      });
      
      EnterpriseLogger.info('Pagina OK: ' + pagina, {
        tamanho: html.length
      });
      
    } catch (error) {
      resultados.push({
        pagina: pagina,
        status: 'ERRO',
        erro: error.toString()
      });
      
      EnterpriseLogger.error('Erro na pagina: ' + pagina, {}, error);
    }
  });
  
  // Resumo
  Logger.log('\n═══════════════════════════════════════════════════════');
  Logger.log('DIAGNOSTICO DE INCLUDES - RESUMO');
  Logger.log('═══════════════════════════════════════════════════════\n');
  
  resultados.forEach(function(r) {
    const icon = r.status === 'OK' ? '✅' : '❌';
    Logger.log(icon + ' ' + r.pagina + ': ' + r.status);
    if (r.erro) {
      Logger.log('   Erro: ' + r.erro);
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════\n');
  
  return resultados;
}

/**
 * Identifica qual template esta causando o erro de include
 */
function identificarErroInclude() {
  Logger.log('\n🔍 IDENTIFICANDO ERRO DE INCLUDE...\n');
  
  // Testa doGet com Index
  Logger.log('1. Testando doGet() com Index...');
  try {
    const result = doGet({ parameter: { page: 'main' } });
    Logger.log('✅ Index carregado com sucesso');
  } catch (error) {
    Logger.log('❌ Erro ao carregar Index: ' + error);
  }
  
  // Testa doGet com MobileExportInterface
  Logger.log('\n2. Testando doGet() com MobileExportInterface...');
  try {
    const result = doGet({ parameter: { page: 'export' } });
    Logger.log('✅ MobileExportInterface carregado com sucesso');
  } catch (error) {
    Logger.log('❌ Erro ao carregar MobileExportInterface: ' + error);
  }
  
  // Testa templates individuais
  Logger.log('\n3. Testando templates individuais...');
  diagnosticarIncludes();
  
  Logger.log('\n✅ Diagnostico concluido\n');
}

/**
 * Monitora chamadas a include() e includeScript()
 */
function monitorarIncludes() {
  Logger.log('\n📊 MONITORAMENTO DE INCLUDES\n');
  Logger.log('Esta funcao deve ser executada ANTES de carregar as paginas\n');
  Logger.log('Instrucoes:');
  Logger.log('1. Execute: monitorarIncludes()');
  Logger.log('2. Depois execute: identificarErroInclude()');
  Logger.log('3. Verifique os logs para encontrar o include com undefined\n');
}
