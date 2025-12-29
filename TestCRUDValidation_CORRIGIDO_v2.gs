/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES DE VALIDAÇÃO DO CRUD E LÓGICA DE NEGÓCIO - VERSÃO CORRIGIDA v2
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo completo
 * 2. Substitua o conteúdo do arquivo TestCRUDValidation.gs
 * 3. Execute: runAllCRUDTests()
 * 
 * NOTA: Este arquivo NÃO declara ValidationService (já existe no projeto)
 */

/**
 * Teste 1: Criar Waypoint
 */
function testCreateWaypoint() {
  Logger.log('\n🧪 Teste 1: Criar Waypoint\n');
  
  try {
    const testData = {
      nome: 'Teste Waypoint ' + new Date().getTime(),
      categoria: 'teste',
      latitude: -15.0,
      longitude: -47.8,
      altitude: 850,
      descricao: 'Waypoint de teste'
    };
    
    const result = DatabaseService.create('Waypoints', testData);
    
    if (result.success) {
      Logger.log('✅ PASSOU: Waypoint criado com sucesso (ID: ' + result.id + ')');
      
      // Limpa depois
      DatabaseService.delete('Waypoints', result.id);
      
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 2: Atualizar Waypoint
 */
function testUpdateWaypoint() {
  Logger.log('\n🧪 Teste 2: Atualizar Waypoint\n');
  
  try {
    // Cria waypoint
    const testData = {
      nome: 'Teste Update ' + new Date().getTime(),
      categoria: 'teste',
      latitude: -15.0,
      longitude: -47.8
    };
    
    const created = DatabaseService.create('Waypoints', testData);
    
    if (!created.success) {
      Logger.log('❌ FALHOU: Não conseguiu criar waypoint');
      return { success: false };
    }
    
    // Atualiza
    const updated = DatabaseService.update('Waypoints', created.id, {
      descricao: 'Atualizado em ' + new Date()
    });
    
    // Limpa
    DatabaseService.delete('Waypoints', created.id);
    
    if (updated.success) {
      Logger.log('✅ PASSOU: Waypoint atualizado com sucesso');
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + updated.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 3: Ler com Filtros
 */
function testReadWithFilters() {
  Logger.log('\n🧪 Teste 3: Ler com Filtros\n');
  
  try {
    const result = DatabaseService.read('Waypoints', { categoria: 'teste' }, { limit: 10 });
    
    if (result.success) {
      Logger.log('✅ PASSOU: Leitura com filtros funcionou');
      Logger.log('   Registros encontrados: ' + result.count);
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 4: Deletar Waypoint
 */
function testDeleteWaypoint() {
  Logger.log('\n🧪 Teste 4: Deletar Waypoint\n');
  
  try {
    // Cria waypoint
    const testData = {
      nome: 'Teste Delete ' + new Date().getTime(),
      categoria: 'teste',
      latitude: -15.0,
      longitude: -47.8
    };
    
    const created = DatabaseService.create('Waypoints', testData);
    
    if (!created.success) {
      Logger.log('❌ FALHOU: Não conseguiu criar waypoint');
      return { success: false };
    }
    
    // Deleta
    const deleted = DatabaseService.delete('Waypoints', created.id);
    
    if (deleted.success) {
      Logger.log('✅ PASSOU: Waypoint deletado com sucesso');
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + deleted.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 5: Validar Campos Obrigatórios
 */
function testRequiredFields() {
  Logger.log('\n🧪 Teste 5: Validar Campos Obrigatórios\n');
  
  try {
    // Tenta criar sem campos obrigatórios
    const result = DatabaseService.create('Waypoints', {
      // Faltando: nome, latitude, longitude, categoria
      descricao: 'Teste'
    });
    
    if (!result.success) {
      Logger.log('✅ PASSOU: Validação de campos obrigatórios funcionou');
      Logger.log('   Erro esperado: ' + result.error);
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: Deveria ter rejeitado dados incompletos');
      // Limpa se criou
      DatabaseService.delete('Waypoints', result.id);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 6: Criar Parcela
 */
function testCreateParcela() {
  Logger.log('\n🧪 Teste 6: Criar Parcela\n');
  
  try {
    const testData = {
      nome: 'Parcela Teste ' + new Date().getTime(),
      tipo_sistema: 'SAF_Cerrado',
      area_ha: 2.5,
      data_implantacao: new Date()
    };
    
    const result = DatabaseService.create('ParcelasAgroflorestais', testData);
    
    if (result.success) {
      Logger.log('✅ PASSOU: Parcela criada com sucesso (ID: ' + result.id + ')');
      DatabaseService.delete('ParcelasAgroflorestais', result.id);
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 7: Criar Qualidade Água
 */
function testCreateQualidadeAgua() {
  Logger.log('\n🧪 Teste 7: Criar Qualidade Água\n');
  
  try {
    const testData = {
      data: new Date(),
      local: 'Rio Teste',
      pH: 7.2,
      temperatura: 24.5,
      oxigenio: 8.5
    };
    
    const result = DatabaseService.create('QualidadeAgua', testData);
    
    if (result.success) {
      Logger.log('✅ PASSOU: Qualidade água criada com sucesso (ID: ' + result.id + ')');
      DatabaseService.delete('QualidadeAgua', result.id);
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 8: Criar Visitante
 */
function testCreateVisitante() {
  Logger.log('\n🧪 Teste 8: Criar Visitante\n');
  
  try {
    const testData = {
      nome: 'Visitante Teste ' + new Date().getTime(),
      data_visita: new Date(),
      tipo_visita: 'Ecoturismo',
      grupo_tamanho: 5
    };
    
    const result = DatabaseService.create('Visitantes', testData);
    
    if (result.success) {
      Logger.log('✅ PASSOU: Visitante criado com sucesso (ID: ' + result.id + ')');
      DatabaseService.delete('Visitantes', result.id);
      return { success: true };
    } else {
      Logger.log('❌ FALHOU: ' + result.error);
      return { success: false };
    }
  } catch (error) {
    Logger.log('❌ ERRO: ' + error);
    return { success: false };
  }
}

/**
 * Teste 9: Validar Regras de Negócio Científicas
 */
function testScientificValidations() {
  Logger.log('\n🧪 Teste 9: Validar Regras de Negócio Científicas\n');
  let allPassed = true;

  // Teste 1: Qualidade da Água com pH inválido
  const invalidPh = ValidationService.validateFormData('qualidadeAgua', { pH: 15, local: 'Teste' });
  if (!invalidPh.valid && invalidPh.errors.some(e => e.includes('pH'))) {
    Logger.log('✅ PASSOU: Validação de pH inválido (maior que 14)');
  } else {
    Logger.log('❌ FALHOU: Validação de pH inválido (maior que 14)');
    Logger.log('   Resultado: ' + JSON.stringify(invalidPh));
    allPassed = false;
  }

  // Teste 2: Qualidade da Água com temperatura inválida
  const invalidTemp = ValidationService.validateFormData('qualidadeAgua', { temperatura: 60, local: 'Teste' });
  if (!invalidTemp.valid && invalidTemp.errors.some(e => e.includes('Temperatura'))) {
    Logger.log('✅ PASSOU: Validação de temperatura inválida');
  } else {
    Logger.log('❌ FALHOU: Validação de temperatura inválida');
    Logger.log('   Resultado: ' + JSON.stringify(invalidTemp));
    allPassed = false;
  }

  // Teste 3: Parcela com tipo de sistema inválido
  const invalidParcela = ValidationService.validateFormData('parcela', { 
    nome: 'Teste',
    tipo_sistema: 'Inexistente' 
  });
  if (!invalidParcela.valid && invalidParcela.errors.some(e => e.includes('Tipo de sistema'))) {
    Logger.log('✅ PASSOU: Validação de tipo de sistema de parcela');
  } else {
    Logger.log('❌ FALHOU: Validação de tipo de sistema de parcela');
    Logger.log('   Resultado: ' + JSON.stringify(invalidParcela));
    allPassed = false;
  }

  // Teste 4: Coordenadas fora da reserva
  const outsideCoords = ValidationService.validateGPS(-10, -40);
  if (!outsideCoords.valid && outsideCoords.errors.some(e => e.includes('fora dos limites'))) {
    Logger.log('✅ PASSOU: Validação de coordenadas fora da reserva');
  } else {
    Logger.log('❌ FALHOU: Validação de coordenadas fora da reserva');
    Logger.log('   Resultado: ' + JSON.stringify(outsideCoords));
    allPassed = false;
  }

  return { success: allPassed };
}

/**
 * Executa todos os testes
 */
function runAllCRUDTests() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   🧪 SUITE DE TESTES DE VALIDAÇÃO E NEGÓCIO         ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  const tests = [
    { name: 'Criar Waypoint', fn: testCreateWaypoint },
    { name: 'Atualizar Waypoint', fn: testUpdateWaypoint },
    { name: 'Ler com Filtros', fn: testReadWithFilters },
    { name: 'Deletar Waypoint', fn: testDeleteWaypoint },
    { name: 'Validar Campos Obrigatórios', fn: testRequiredFields },
    { name: 'Criar Parcela', fn: testCreateParcela },
    { name: 'Criar Qualidade Água', fn: testCreateQualidadeAgua },
    { name: 'Criar Visitante', fn: testCreateVisitante },
    { name: 'Validações Científicas', fn: testScientificValidations }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      const result = test.fn();
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      Logger.log('❌ ERRO CRÍTICO no teste "' + test.name + '": ' + error);
      failed++;
    }
    Logger.log('\n' + '─'.repeat(60) + '\n');
  });

  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   📊 RESULTADO DOS TESTES                             ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('✅ Testes Passados: ' + passed);
  Logger.log('❌ Testes Falhados: ' + failed);
  Logger.log('📈 Taxa de Sucesso: ' + Math.round((passed / tests.length) * 100) + '%');

  if (failed === 0) {
    Logger.log('\n🎉 TODOS OS TESTES PASSARAM! CRUD e regras de negócio validados.');
  } else {
    Logger.log('\n⚠️  Alguns testes falharam. Revise os logs acima.');
  }
  
  return {
    total: tests.length,
    passed: passed,
    failed: failed,
    successRate: Math.round((passed / tests.length) * 100)
  };
}

/**
 * Limpa dados de teste
 */
function cleanupTestData() {
  Logger.log('🧹 Limpando dados de teste...');
  
  try {
    // Remove waypoints de teste
    const waypoints = DatabaseService.read('Waypoints', {}, { limit: 1000 });
    if (waypoints.success) {
      let cleaned = 0;
      waypoints.data.forEach(wp => {
        if (wp.nome && wp.nome.includes('Teste')) {
          DatabaseService.delete('Waypoints', wp.id);
          cleaned++;
        }
      });
      Logger.log('✅ Limpeza concluída: ' + cleaned + ' registros removidos');
    }
  } catch (error) {
    Logger.log('❌ Erro na limpeza: ' + error);
  }
}
