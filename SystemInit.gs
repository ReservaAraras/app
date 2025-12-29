/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYSTEM INIT - Inicialização e Testes do Sistema
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Funções de inicialização, testes e criação de dados de exemplo.
 * Extraído do Code.gs para melhor organização.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Inicializa sistema completo
 * @returns {Object} Resultado da inicialização
 */
function inicializarSistemaCompleto() {
  Logger.log('Iniciando sistema RESEX Araras...');
  
  try {
    // Verifica configuração
    const validation = validateEnvironmentConfig();
    if (!validation.valid) {
      Logger.log('⚠ Configuração incompleta. Campos faltando: ' + validation.missing.join(', '));
      Logger.log('Execute: saveEnvironmentConfig({ ... }) para configurar');
    }
    
    // Cria planilhas necessárias
    const sheets = Object.values(CONFIG.SHEETS);
    Logger.log(`Verificando ${sheets.length} planilhas...`);
    
    let created = 0;
    let errors = 0;
    
    sheets.forEach(sheetName => {
      try {
        getSheet(sheetName);
        Logger.log(`✓ ${sheetName}`);
        created++;
      } catch (error) {
        Logger.log(`✗ Erro em ${sheetName}: ${error}`);
        errors++;
      }
    });
    
    Logger.log('\n✓ Sistema inicializado com sucesso!');
    Logger.log(`  Planilhas verificadas: ${created}`);
    Logger.log(`  Erros: ${errors}`);
    Logger.log('\nPróximos passos:');
    Logger.log('1. Execute: testarSistema() para validar');
    Logger.log('2. Faça deploy como Web App');
    Logger.log('3. Acesse no Samsung S20 + Lemur Browser');
    
    return { success: true, message: 'Sistema inicializado', sheets: created, errors: errors };
  } catch (error) {
    Logger.log('✗ Erro na inicialização: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste rápido do sistema
 * @returns {Object} Resultados dos testes
 */
function testarSistema() {
  Logger.log('TESTE DO SISTEMA RESEX ARARAS');
  
  const testes = [];
  
  // 1. Teste de configuração
  testes.push(_testarConfiguracao());
  
  // 2. Teste de acesso ao Spreadsheet
  testes.push(_testarSpreadsheet());
  
  // 3-6. Teste CRUD de waypoint
  const crudTests = _testarCRUDWaypoint();
  testes.push(...crudTests);
  
  // 7. Teste de otimização mobile
  testes.push(_testarMobileOptimization());
  
  // 8. Teste de exportação
  testes.push(_testarExportacao());
  
  // Resumo
  _imprimirResumoTestes(testes);
  
  const sucessos = testes.filter(t => t.resultado === 'OK').length;
  const falhas = testes.filter(t => t.resultado === 'FALHA').length;
  const erros = testes.filter(t => t.resultado === 'ERRO').length;
  
  return {
    success: erros === 0 && falhas === 0,
    testes: testes,
    resumo: { total: testes.length, sucessos, falhas, erros }
  };
}

/**
 * Cria dados de exemplo para testes
 * @returns {Object} Resultado da criação
 */
function criarDadosExemplo() {
  try {
    const exemplos = {
      waypoints: [
        { nome: 'Cachoeira Principal', categoria: 'cachoeira', latitude: -15.234, longitude: -47.876, altitude: 850 },
        { nome: 'Mirante do Vale', categoria: 'mirante', latitude: -15.235, longitude: -47.877, altitude: 920 },
        { nome: 'Início da Trilha', categoria: 'inicio', latitude: -15.233, longitude: -47.875, altitude: 800 }
      ],
      trilhas: [
        { nome: 'Trilha das Araras', distancia_km: 3.5, dificuldade: 'média', tempo_estimado: '2h' },
        { nome: 'Trilha do Cerrado', distancia_km: 5.2, dificuldade: 'fácil', tempo_estimado: '3h' }
      ]
    };
    
    let criados = 0;
    const erros = [];
    
    // Cria waypoints
    exemplos.waypoints.forEach(wp => {
      const result = DatabaseService.create('Waypoints', wp);
      result.success ? criados++ : erros.push(`Waypoint ${wp.nome}: ${result.error}`);
    });
    
    // Cria trilhas
    exemplos.trilhas.forEach(trilha => {
      const result = DatabaseService.create('Trilhas', trilha);
      result.success ? criados++ : erros.push(`Trilha ${trilha.nome}: ${result.error}`);
    });
    
    Logger.log(`✓ Criados ${criados} registros de exemplo`);
    if (erros.length > 0) Logger.log(`✗ Erros: ${erros.join(', ')}`);
    
    return { success: erros.length === 0, criados, erros };
  } catch (error) {
    return { success: false, error: error.toString(), criados: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS DE TESTE PRIVADOS
// ═══════════════════════════════════════════════════════════════════════════

function _testarConfiguracao() {
  Logger.log('\n1. Testando configuração...');
  try {
    const config = getEnvironmentConfig();
    Logger.log(config ? '✓ Configuração OK' : '✗ Configuração falhou');
    return { teste: 'Configuração', resultado: config ? 'OK' : 'FALHA', detalhes: config };
  } catch (error) {
    Logger.log('✗ Erro na configuração: ' + error);
    return { teste: 'Configuração', resultado: 'ERRO', detalhes: error.toString() };
  }
}

function _testarSpreadsheet() {
  Logger.log('\n2. Testando acesso ao Spreadsheet...');
  try {
    const ss = getSpreadsheet();
    Logger.log('✓ Spreadsheet OK: ' + ss.getName());
    return { teste: 'Spreadsheet', resultado: 'OK', detalhes: ss.getName() };
  } catch (error) {
    Logger.log('✗ Erro no Spreadsheet: ' + error);
    return { teste: 'Spreadsheet', resultado: 'ERRO', detalhes: error.toString() };
  }
}

function _testarCRUDWaypoint() {
  const testes = [];
  Logger.log('\n3. Testando CRUD de waypoint...');
  
  try {
    const testWaypoint = {
      nome: 'Teste Sistema ' + Date.now(),
      categoria: 'teste',
      latitude: -15.234567,
      longitude: -47.876543,
      altitude: 850,
      descricao: 'Waypoint de teste do sistema'
    };
    
    // Create
    const createResult = DatabaseService.create('Waypoints', testWaypoint);
    testes.push({ teste: 'Criar Waypoint', resultado: createResult.success ? 'OK' : 'FALHA', detalhes: createResult });
    Logger.log(createResult.success ? '✓ Waypoint criado: ' + createResult.id : '✗ Erro ao criar');
    
    if (createResult.success) {
      // Read
      const readResult = DatabaseService.readById('Waypoints', createResult.id);
      testes.push({ teste: 'Ler Waypoint', resultado: readResult.success ? 'OK' : 'FALHA', detalhes: readResult });
      Logger.log(readResult.success ? '✓ Leitura OK' : '✗ Erro na leitura');
      
      // Update
      const updateResult = DatabaseService.update('Waypoints', createResult.id, { descricao: 'Atualizado em ' + new Date() });
      testes.push({ teste: 'Atualizar Waypoint', resultado: updateResult.success ? 'OK' : 'FALHA', detalhes: updateResult });
      Logger.log(updateResult.success ? '✓ Atualização OK' : '✗ Erro na atualização');
      
      // Delete
      const deleteResult = DatabaseService.delete('Waypoints', createResult.id);
      testes.push({ teste: 'Excluir Waypoint', resultado: deleteResult.success ? 'OK' : 'FALHA', detalhes: deleteResult });
      Logger.log(deleteResult.success ? '✓ Exclusão OK' : '✗ Erro na exclusão');
    }
  } catch (error) {
    testes.push({ teste: 'CRUD Waypoint', resultado: 'ERRO', detalhes: error.toString() });
    Logger.log('✗ Erro no teste CRUD: ' + error);
  }
  
  return testes;
}

function _testarMobileOptimization() {
  Logger.log('\n7. Testando otimização mobile...');
  try {
    const stats = MobileOptimization.getQuickStats();
    Logger.log(stats.success ? '✓ Estatísticas OK' : '✗ Erro nas estatísticas');
    return { teste: 'Estatísticas Mobile', resultado: stats.success ? 'OK' : 'FALHA', detalhes: stats };
  } catch (error) {
    Logger.log('✗ Erro na otimização mobile: ' + error);
    return { teste: 'Otimização Mobile', resultado: 'ERRO', detalhes: error.toString() };
  }
}

function _testarExportacao() {
  Logger.log('\n8. Testando exportação...');
  try {
    const exportResult = MobileOptimization.exportCSVOptimized('Waypoints', {});
    Logger.log(exportResult.success ? '✓ Exportação OK' : '✗ Erro na exportação');
    return { 
      teste: 'Exportação CSV', 
      resultado: exportResult.success ? 'OK' : 'FALHA', 
      detalhes: { filename: exportResult.filename, rows: exportResult.rows, size: exportResult.size }
    };
  } catch (error) {
    Logger.log('✗ Erro na exportação: ' + error);
    return { teste: 'Exportação', resultado: 'ERRO', detalhes: error.toString() };
  }
}

function _imprimirResumoTestes(testes) {
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('RESUMO DOS TESTES');
  
  const sucessos = testes.filter(t => t.resultado === 'OK').length;
  const falhas = testes.filter(t => t.resultado === 'FALHA').length;
  const erros = testes.filter(t => t.resultado === 'ERRO').length;
  
  Logger.log(`Total de testes: ${testes.length}`);
  Logger.log(`✓ Sucessos: ${sucessos}`);
  Logger.log(`✗ Falhas: ${falhas}`);
  Logger.log(`⚠ Erros: ${erros}`);
  
  testes.forEach(t => {
    const icon = t.resultado === 'OK' ? '✓' : '✗';
    Logger.log(`${icon} ${t.teste}: ${t.resultado}`);
  });
  
  Logger.log('═══════════════════════════════════════════════════════════');
}
