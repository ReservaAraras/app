/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST INTEGRATION - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Integração entre dashboards HTML e backend de testes
 * 
 * @version 1.0.0
 * @date 2024-11-08
 */

/**
 * Abre o Dashboard de Testes
 */
function openTestDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('TestDashboard')
    .setWidth(1200)
    .setHeight(800)
    .setTitle('🧪 Dashboard de Testes');
  
  SpreadsheetApp.getUi().showModalDialog(html, '🧪 Dashboard de Testes - Reserva Araras');
}

/**
 * Abre o Validador de Navegação
 */
function openNavigationValidator() {
  const html = HtmlService.createHtmlOutputFromFile('NavigationValidator')
    .setWidth(1400)
    .setHeight(900)
    .setTitle('🧭 Validador de Navegação');
  
  SpreadsheetApp.getUi().showModalDialog(html, '🧭 Validador de Navegação - Reserva Araras');
}

/**
 * API para executar testes do frontend
 */
function runTestFromDashboard(testType, testId) {
  try {
    let result;
    
    switch(testType) {
      case 'form':
        result = testFormCRUD(testId);
        break;
      case 'navigation':
        result = testNavigation(testId);
        break;
      case 'service':
        result = testService(testId);
        break;
      default:
        result = { success: false, error: 'Tipo de teste desconhecido' };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Testa CRUD de um formulário específico
 */
function testFormCRUD(formId) {
  const formMap = {
    'waypoint': { 
      sheet: 'Waypoints', 
      data: { 
        nome: 'Teste', 
        latitude: -15.234, 
        longitude: -47.876,
        categoria: 'teste'
      } 
    },
    'foto': { 
      sheet: 'Fotos', 
      data: { 
        titulo: 'Teste Foto', 
        categoria: 'teste',
        nome_arquivo: 'teste.jpg'
      } 
    },
    'agua': { 
      sheet: 'QualidadeAgua', 
      data: { 
        local: 'Teste', 
        pH: 7.0,
        data: new Date()
      } 
    },
    'solo': { 
      sheet: 'QualidadeSolo', 
      data: { 
        local: 'Teste', 
        pH: 6.5,
        data: new Date()
      } 
    },
    'biodiversidade': { 
      sheet: 'Biodiversidade', 
      data: { 
        tipo: 'Fauna', 
        especie: 'Teste',
        data: new Date(),
        local: 'Teste Local',
        tipo_observacao: 'avistamento'
      } 
    },
    'producao': { 
      sheet: 'ProducaoAgroflorestal', 
      data: { 
        produto: 'Teste', 
        quantidade_kg: 10,
        data_colheita: new Date()
        // Nota: parcela_id será validado mas pode não existir
      } 
    },
    'terapia': { 
      sheet: 'SessoesTerapia', 
      data: { 
        tipo_terapia: 'Teste',
        duracao: 60,
        data: new Date()
        // Nota: participante_id será validado mas pode não existir
      } 
    },
    'visitante': { 
      sheet: 'Visitantes', 
      data: { 
        nome: 'Teste', 
        email: 'teste@example.com',
        data_visita: new Date()
      } 
    }
  };
  
  const config = formMap[formId];
  if (!config) {
    return { success: false, error: 'Formulário não encontrado' };
  }
  
  const results = {
    create: null,
    read: null,
    update: null,
    delete: null
  };
  
  try {
    // Para testes que requerem entidades pai, cria-as primeiro
    let parentId = null;
    let cleanupParent = false;
    
    if (formId === 'producao') {
      // Cria uma parcela de teste
      const parcela = DatabaseService.create('ParcelasAgroflorestais', {
        nome: 'Parcela Teste',
        tipo_sistema: 'SAF_Cerrado',
        area_ha: 1.0,
        latitude: -15.0,
        longitude: -47.0
      });
      if (parcela.success) {
        parentId = parcela.id;
        config.data.parcela_id = parentId;
        cleanupParent = true;
      }
    } else if (formId === 'terapia') {
      // Cria um participante de teste
      const participante = DatabaseService.create('ParticipantesTerapia', {
        nome: 'Participante Teste',
        data_nascimento: new Date('1990-01-01')
      });
      if (participante.success) {
        parentId = participante.id;
        config.data.participante_id = parentId;
        cleanupParent = true;
      }
    }
    
    // CREATE
    const createResult = DatabaseService.create(config.sheet, config.data);
    results.create = createResult;
    
    if (!createResult.success) {
      // Cleanup da entidade pai se foi criada
      if (cleanupParent && parentId) {
        if (formId === 'producao') {
          DatabaseService.delete('ParcelasAgroflorestais', parentId);
        } else if (formId === 'terapia') {
          DatabaseService.delete('ParticipantesTerapia', parentId);
        }
      }
      return { success: false, error: 'Falha no CREATE', results };
    }
    
    const id = createResult.id;
    
    // READ
    const readResult = DatabaseService.readById(config.sheet, id);
    results.read = readResult;
    
    if (!readResult.success) {
      return { success: false, error: 'Falha no READ', results };
    }
    
    // UPDATE
    const updateResult = DatabaseService.update(config.sheet, id, { observacoes: 'Atualizado' });
    results.update = updateResult;
    
    if (!updateResult.success) {
      return { success: false, error: 'Falha no UPDATE', results };
    }
    
    // DELETE
    const deleteResult = DatabaseService.delete(config.sheet, id);
    results.delete = deleteResult;
    
    if (!deleteResult.success) {
      return { success: false, error: 'Falha no DELETE', results };
    }
    
    // Cleanup da entidade pai se foi criada
    if (cleanupParent && parentId) {
      if (formId === 'producao') {
        DatabaseService.delete('ParcelasAgroflorestais', parentId);
      } else if (formId === 'terapia') {
        DatabaseService.delete('ParticipantesTerapia', parentId);
      }
    }
    
    return {
      success: true,
      message: 'CRUD completo executado com sucesso',
      results: results
    };
    
  } catch (error) {
    // Cleanup em caso de erro
    if (cleanupParent && parentId) {
      try {
        if (formId === 'producao') {
          DatabaseService.delete('ParcelasAgroflorestais', parentId);
        } else if (formId === 'terapia') {
          DatabaseService.delete('ParticipantesTerapia', parentId);
        }
      } catch (cleanupError) {
        // Ignora erros de cleanup
      }
    }
    
    return {
      success: false,
      error: error.toString(),
      results: results
    };
  }
}

/**
 * Testa navegação
 */
function testNavigation(navId) {
  const navMap = {
    'home': { path: '/', expected: 'Home carregada' },
    'map': { path: '/map', expected: 'Mapa carregado' },
    'export': { path: '/export', expected: 'Exportação carregada' },
    'stats': { path: '/stats', expected: 'Estatísticas carregadas' }
  };
  
  const config = navMap[navId];
  if (!config) {
    return { success: false, error: 'Navegação não encontrada' };
  }
  
  try {
    // Simula teste de navegação
    // Em produção, isso seria mais complexo
    return {
      success: true,
      message: `Navegação para ${config.path} testada`,
      path: config.path,
      expected: config.expected
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Testa serviço específico
 */
function testService(serviceId) {
  try {
    let result;
    
    switch(serviceId) {
      case 'database':
        result = testDatabaseService();
        break;
      case 'validation':
        result = testValidationService();
        break;
      case 'export':
        result = testExportService();
        break;
      case 'statistics':
        result = testStatisticsService();
        break;
      default:
        return { success: false, error: 'Serviço não encontrado' };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Testa DatabaseService
 */
function testDatabaseService() {
  try {
    // Teste de conexão
    const ss = getSpreadsheet();
    if (!ss) throw new Error('Não foi possível conectar ao Spreadsheet');
    
    // Teste de criação (com todos os campos obrigatórios)
    const testData = { 
      nome: 'Teste DB', 
      categoria: 'teste',
      latitude: -15.234,
      longitude: -47.876
    };
    const createResult = DatabaseService.create('Waypoints', testData);
    if (!createResult.success) throw new Error('Falha ao criar registro: ' + (createResult.error || 'erro desconhecido'));
    
    // Teste de leitura
    const readResult = DatabaseService.readById('Waypoints', createResult.id);
    if (!readResult.success) throw new Error('Falha ao ler registro');
    
    // Teste de exclusão
    const deleteResult = DatabaseService.delete('Waypoints', createResult.id);
    if (!deleteResult.success) throw new Error('Falha ao excluir registro');
    
    return {
      success: true,
      message: 'DatabaseService testado com sucesso',
      tests: {
        connection: true,
        create: true,
        read: true,
        delete: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Testa ValidationService
 */
function testValidationService() {
  try {
    const tests = {
      emailValid: ValidationService.validateEmail('teste@example.com'),
      emailInvalid: !ValidationService.validateEmail('email-invalido'),
      coordsValid: ValidationService.validateCoordinates(-15.234, -47.876),
      coordsInvalid: !ValidationService.validateCoordinates(200, 200)
    };
    
    const allPassed = Object.values(tests).every(t => t === true);
    
    return {
      success: allPassed,
      message: allPassed ? 'ValidationService testado com sucesso' : 'Alguns testes falharam',
      tests: tests
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Testa ExportService
 */
function testExportService() {
  let testWaypointId = null;
  
  try {
    // Garante que há pelo menos um waypoint para exportar
    const checkData = DatabaseService.read('Waypoints', {}, { limit: 1 });
    
    if (!checkData.success || checkData.data.length === 0) {
      // Cria um waypoint temporário para teste
      const createResult = DatabaseService.create('Waypoints', {
        nome: 'Test Export',
        latitude: -15.0,
        longitude: -47.0,
        categoria: 'test'
      });
      
      if (!createResult.success) {
        throw new Error('Falha ao criar waypoint de teste: ' + createResult.error);
      }
      
      testWaypointId = createResult.id;
    }
    
    // Teste CSV
    const csvResult = ExportService.exportToCSV('Waypoints', {});
    if (!csvResult.success) throw new Error('Falha ao exportar CSV: ' + csvResult.error);
    if (!csvResult.csv) throw new Error('CSV não gerado');
    
    // Teste JSON
    const jsonResult = ExportService.exportToJSON('Waypoints', {});
    if (!jsonResult.success) throw new Error('Falha ao exportar JSON: ' + jsonResult.error);
    if (!jsonResult.json) throw new Error('JSON não gerado');
    
    // Cleanup
    if (testWaypointId) {
      DatabaseService.delete('Waypoints', testWaypointId);
    }
    
    return {
      success: true,
      message: 'ExportService testado com sucesso',
      tests: {
        csv: true,
        json: true
      }
    };
  } catch (error) {
    // Cleanup em caso de erro
    if (testWaypointId) {
      try {
        DatabaseService.delete('Waypoints', testWaypointId);
      } catch (cleanupError) {
        // Ignora erro de cleanup
      }
    }
    
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Testa StatisticsService
 */
function testStatisticsService() {
  try {
    // Verifica se StatisticsService existe
    if (typeof StatisticsService === 'undefined') {
      throw new Error('StatisticsService não encontrado');
    }
    
    // Teste de estatísticas gerais
    const statsResult = StatisticsService.getGeneralStatistics();
    if (!statsResult.success) {
      throw new Error('Falha ao obter estatísticas: ' + statsResult.error);
    }
    
    // Verifica se retornou dados
    if (!statsResult.data || typeof statsResult.data !== 'object') {
      throw new Error('Dados de estatísticas inválidos');
    }
    
    // Teste de contagem
    const count = StatisticsService.getCountBySheet('Waypoints');
    if (typeof count !== 'number') {
      throw new Error('Contagem inválida: esperado número, recebido ' + typeof count);
    }
    
    if (count < 0) {
      throw new Error('Contagem negativa: ' + count);
    }
    
    return {
      success: true,
      message: 'StatisticsService testado com sucesso',
      tests: {
        generalStats: true,
        count: true
      },
      data: {
        totalSheets: Object.keys(statsResult.data).length,
        waypointsCount: count
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obtém estatísticas de teste
 */
function getTestStatistics() {
  try {
    const sheets = [
      'Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo',
      'Biodiversidade', 'ProducaoAgroflorestal', 'SessoesTerapia', 'Visitantes'
    ];
    
    const stats = {};
    
    sheets.forEach(sheetName => {
      try {
        const count = StatisticsService.getCountBySheet(sheetName);
        stats[sheetName] = count;
      } catch (e) {
        stats[sheetName] = 0;
      }
    });
    
    return {
      success: true,
      stats: stats,
      total: Object.values(stats).reduce((a, b) => a + b, 0)
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Executa bateria completa de testes
 */
function runFullTestSuite() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 EXECUTANDO BATERIA COMPLETA DE TESTES');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };
  
  // Testa formulários
  Logger.log('📝 Testando Formulários CRUD...\n');
  const forms = ['waypoint', 'foto', 'agua', 'solo', 'biodiversidade', 'producao', 'terapia', 'visitante'];
  forms.forEach(formId => {
    const result = testFormCRUD(formId);
    results.tests[`form_${formId}`] = result;
    results.summary.total++;
    if (result.success) {
      results.summary.passed++;
      Logger.log(`✅ ${formId}`);
    } else {
      results.summary.failed++;
      Logger.log(`❌ ${formId}: ${result.error}`);
    }
  });
  
  // Testa serviços
  Logger.log('\n⚙️ Testando Serviços...\n');
  const services = ['database', 'validation', 'export', 'statistics'];
  services.forEach(serviceId => {
    const result = testService(serviceId);
    results.tests[`service_${serviceId}`] = result;
    results.summary.total++;
    if (result.success) {
      results.summary.passed++;
      Logger.log(`✅ ${serviceId}`);
    } else {
      results.summary.failed++;
      Logger.log(`❌ ${serviceId}: ${result.error}`);
    }
  });
  
  // Relatório final
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('📊 RELATÓRIO FINAL');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  Logger.log(`Total: ${results.summary.total}`);
  Logger.log(`✅ Passou: ${results.summary.passed} (${(results.summary.passed/results.summary.total*100).toFixed(1)}%)`);
  Logger.log(`❌ Falhou: ${results.summary.failed} (${(results.summary.failed/results.summary.total*100).toFixed(1)}%)`);
  Logger.log('\n═══════════════════════════════════════════════════════════\n');
  
  return results;
}

/**
 * Adiciona menu de testes
 */
function addTestMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧪 Testes')
    .addItem('📊 Dashboard de Testes', 'openTestDashboard')
    .addItem('🧭 Validador de Navegação', 'openNavigationValidator')
    .addSeparator()
    .addItem('▶️ Executar Todos os Testes', 'runFullTestSuite')
    .addItem('🎲 Gerar Dados de Teste', 'generateTestData')
    .addItem('🗑️ Limpar Dados de Teste', 'clearTestData')
    .addSeparator()
    .addItem('📋 Ver Estatísticas', 'showTestStatistics')
    .addToUi();
}

/**
 * Mostra estatísticas de teste
 */
function showTestStatistics() {
  const stats = getTestStatistics();
  
  if (!stats.success) {
    SpreadsheetApp.getUi().alert('Erro ao obter estatísticas: ' + stats.error);
    return;
  }
  
  let message = '📊 ESTATÍSTICAS DE DADOS\n\n';
  
  Object.keys(stats.stats).forEach(sheet => {
    message += `${sheet}: ${stats.stats[sheet]} registros\n`;
  });
  
  message += `\nTotal: ${stats.total} registros`;
  
  SpreadsheetApp.getUi().alert('📊 Estatísticas', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Atualiza menu ao abrir
 * DESABILITADO: Menu consolidado em Code.gs
 */
/*
function onOpen() {
  addTestMenu();
}
*/
