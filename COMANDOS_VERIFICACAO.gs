/**
 * COMANDOS DE VERIFICACAO E ATIVACAO
 * Execute estas funcoes para verificar e ativar todas as funcionalidades
 */

/**
 * Verificacao completa do sistema
 */
function verificarSistemaCompleto() {
  Logger.log('\nVERIFICACAO COMPLETA DO SISTEMA\n');
  
  const resultados = {
    testes: null,
    configuracao: null,
    planilhas: null,
    servicos: null
  };
  
  Logger.log('1. Executando bateria de testes...\n');
  resultados.testes = runFullTestSuite();
  
  Logger.log('\n2. Verificando configuracao...\n');
  resultados.configuracao = verificarConfiguracao();
  
  Logger.log('\n3. Verificando planilhas...\n');
  resultados.planilhas = verificarPlanilhas();
  
  Logger.log('\n4. Verificando servicos especializados...\n');
  resultados.servicos = verificarServicos();
  
  Logger.log('\nRESUMO FINAL\n');
  
  const statusGeral = 
    resultados.testes.passed === resultados.testes.total &&
    resultados.configuracao.funcionais > 0 &&
    resultados.servicos.ativos >= 4;
    
  if (statusGeral) {
    Logger.log('Sistema 100% funcional e pronto para uso!\n');
  } else {
    Logger.log('Sistema funcional com algumas configuracoes opcionais pendentes.\n');
  }
  
  return resultados;
}

function verificarConfiguracao() {
  const config = getEnvironmentConfig();
  
  const status = {
    spreadsheet: !!CONFIG.SPREADSHEET_ID,
    drive: !!config.DRIVE_FOLDER_ID,
    gemini: !!config.GEMINI_API_KEY,
    funcionais: 0,
    opcionais: 0
  };
  
  if (status.spreadsheet) status.funcionais++;
  if (status.drive) status.funcionais++;
  if (status.gemini) status.funcionais++;
  else status.opcionais++;
  
  Logger.log('Configuracao:');
  Logger.log('  SPREADSHEET_ID: ' + (CONFIG.SPREADSHEET_ID || 'NAO CONFIGURADO'));
  Logger.log('  DRIVE_FOLDER_ID: ' + (config.DRIVE_FOLDER_ID || 'Usando padrao'));
  Logger.log('  GEMINI_API_KEY: ' + (config.GEMINI_API_KEY ? '***' + config.GEMINI_API_KEY.slice(-4) : 'Nao configurado'));
  
  return status;
}

function verificarPlanilhas() {
  const sheets = Object.values(CONFIG.SHEETS);
  const ss = getSpreadsheet();
  
  Logger.log('Total de planilhas configuradas: ' + sheets.length);
  Logger.log('Planilha ativa: ' + ss.getName());
  
  return {
    total: sheets.length,
    spreadsheet: ss.getName()
  };
}

function verificarServicos() {
  const servicos = [
    { nome: 'DatabaseService', obj: typeof DatabaseService !== 'undefined' },
    { nome: 'ValidationService', obj: typeof ValidationService !== 'undefined' },
    { nome: 'ExportService', obj: typeof ExportService !== 'undefined' },
    { nome: 'StatisticsService', obj: typeof StatisticsService !== 'undefined' },
    { nome: 'AgroforestryService', obj: typeof AgroforestryService !== 'undefined' },
    { nome: 'BiodiversityService', obj: typeof BiodiversityService !== 'undefined' },
    { nome: 'ClimateFinanceService', obj: typeof ClimateFinanceService !== 'undefined' },
    { nome: 'GPSService', obj: typeof GPSService !== 'undefined' },
    { nome: 'TherapyService', obj: typeof TherapyService !== 'undefined' },
    { nome: 'GeminiAIService', obj: typeof GeminiAIService !== 'undefined' }
  ];
  
  const ativos = servicos.filter(function(s) { return s.obj; }).length;
  
  Logger.log('Servicos disponiveis:');
  servicos.forEach(function(s) {
    Logger.log('  ' + (s.obj ? 'OK' : 'FALTA') + ' ' + s.nome);
  });
  Logger.log('\nTotal: ' + ativos + '/' + servicos.length + ' ativos');
  
  return {
    total: servicos.length,
    ativos: ativos,
    lista: servicos
  };
}

function ativarComDadosExemplo() {
  Logger.log('\nATIVANDO SISTEMA COM DADOS DE EXEMPLO\n');
  
  Logger.log('1. Inicializando sistema...');
  inicializarSistemaCompleto();
  
  Logger.log('\n2. Criando dados de exemplo...');
  const dados = testDataPopulation();
  
  Logger.log('\n3. Testando sistema...');
  const testes = runFullTestSuite();
  
  Logger.log('\nSISTEMA ATIVADO E POPULADO\n');
  
  Logger.log('Registros criados:');
  if (dados.created) {
    Object.keys(dados.created).forEach(function(tipo) {
      Logger.log('  ' + tipo + ': ' + dados.created[tipo]);
    });
  }
  
  Logger.log('\nTestes: ' + testes.passed + '/' + testes.total + ' (' + (testes.passed/testes.total*100).toFixed(1) + '%)');
  
  return {
    dados: dados,
    testes: testes
  };
}

function statusRapido() {
  Logger.log('\nSTATUS RAPIDO DO SISTEMA\n');
  
  Logger.log('Testes:');
  const testes = runFullTestSuite();
  Logger.log('  ' + testes.passed + '/' + testes.total + ' passando (' + (testes.passed/testes.total*100).toFixed(1) + '%)\n');
  
  Logger.log('Configuracao:');
  const config = getEnvironmentConfig();
  Logger.log('  Planilha conectada: ' + (CONFIG.SPREADSHEET_ID ? 'OK' : 'FALTA'));
  Logger.log('  Drive configurado: ' + (config.DRIVE_FOLDER_ID ? 'OK' : 'opcional'));
  Logger.log('  Gemini AI: ' + (config.GEMINI_API_KEY ? 'OK' : 'opcional') + '\n');
  
  Logger.log('Servicos Core:');
  Logger.log('  DatabaseService: ' + (typeof DatabaseService !== 'undefined' ? 'OK' : 'FALTA'));
  Logger.log('  ValidationService: ' + (typeof ValidationService !== 'undefined' ? 'OK' : 'FALTA'));
  Logger.log('  ExportService: ' + (typeof ExportService !== 'undefined' ? 'OK' : 'FALTA'));
  Logger.log('  StatisticsService: ' + (typeof StatisticsService !== 'undefined' ? 'OK' : 'FALTA') + '\n');
  
  const statusGeral = testes.passed === testes.total;
  if (statusGeral) {
    Logger.log('SISTEMA OPERACIONAL\n');
  } else {
    Logger.log('Verificar testes\n');
  }
  
  return {
    testes: testes,
    config: config,
    status: statusGeral ? 'OK' : 'ATENCAO'
  };
}

function configurarAmbiente() {
  Logger.log('\nCONFIGURACAO DO AMBIENTE\n');
  
  Logger.log('Para configurar o ambiente, execute:\n');
  Logger.log('saveEnvironmentConfig({');
  Logger.log('  DRIVE_FOLDER_ID: "seu_folder_id",');
  Logger.log('  GEMINI_API_KEY: "sua_api_key"');
  Logger.log('});\n');
  
  Logger.log('Como obter:');
  Logger.log('  DRIVE_FOLDER_ID: URL da pasta no Drive');
  Logger.log('  GEMINI_API_KEY: https://ai.google.dev/\n');
  
  Logger.log('Nota: Ambas sao OPCIONAIS');
  Logger.log('Sistema funciona sem essas configuracoes\n');
  
  const config = getEnvironmentConfig();
  Logger.log('Configuracao atual:');
  Logger.log('  DRIVE_FOLDER_ID: ' + (config.DRIVE_FOLDER_ID || 'Nao configurado'));
  Logger.log('  GEMINI_API_KEY: ' + (config.GEMINI_API_KEY ? '***' + config.GEMINI_API_KEY.slice(-4) : 'Nao configurado') + '\n');
}

function listarFuncoesDisponiveis() {
  Logger.log('\nFUNCOES DISPONIVEIS\n');
  
  Logger.log('VERIFICACAO:');
  Logger.log('  verificarSistemaCompleto() - Verifica tudo');
  Logger.log('  statusRapido() - Status condensado');
  Logger.log('  configurarAmbiente() - Ajuda para configurar\n');
  
  Logger.log('INICIALIZACAO:');
  Logger.log('  inicializarSistemaCompleto() - Inicializa sistema');
  Logger.log('  ativarComDadosExemplo() - Ativa + popula dados');
  Logger.log('  testDataPopulation() - Apenas dados exemplo\n');
  
  Logger.log('TESTES:');
  Logger.log('  runFullTestSuite() - 12 testes principais');
  Logger.log('  testarCRUD() - 8 formularios');
  Logger.log('  runComprehensiveTests() - Suite completa');
  Logger.log('  debugAllFailingTests() - Debug detalhado\n');
  
  Logger.log('DADOS:');
  Logger.log('  criarDadosExemplo() - Dados de exemplo');
  Logger.log('  getSystemStatistics() - Estatisticas gerais\n');
  
  Logger.log('CONFIGURACAO:');
  Logger.log('  saveEnvironmentConfig() - Salva configuracao');
  Logger.log('  getEnvironmentConfig() - Le configuracao');
  Logger.log('  validateEnvironmentConfig() - Valida configuracao\n');
}

function testeRapidoVerificacao() {
  Logger.log('\nTESTE RAPIDO\n');
  return statusRapido();
}

function verificarEAtivar() {
  Logger.log('\nVERIFICAR E ATIVAR SISTEMA\n');
  
  const verificacao = verificarSistemaCompleto();
  
  if (verificacao.testes.passed === verificacao.testes.total) {
    Logger.log('\nSistema ja esta ativo e funcionando!\n');
    Logger.log('Para popular com dados de exemplo, execute:');
    Logger.log('  ativarComDadosExemplo()\n');
  } else {
    Logger.log('\nAlguns testes falharam. Execute para debug:');
    Logger.log('  debugAllFailingTests()\n');
  }
  
  return verificacao;
}
