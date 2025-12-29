/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES - CRUD Factory
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testes unitários e de integração para o CRUDFactory.
 * Usa o TestFramework com assertions robustas.
 */

/**
 * Executa todos os testes do CRUDFactory
 */
function runCRUDFactoryTests() {
  
  // ═══════════════════════════════════════════════════════════════════════
  // TESTES UNITÁRIOS - CRUD_ENTITIES Registry
  // ═══════════════════════════════════════════════════════════════════════
  
  TestRunner.describe('CRUD_ENTITIES Registry', function() {
    
    TestRunner.it('deve ter todas as entidades de Agrofloresta', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'Parcela', 'Parcela deve existir');
      Assert.hasProperty(CRUD_ENTITIES, 'Producao', 'Producao deve existir');
      Assert.hasProperty(CRUD_ENTITIES, 'EspecieAgro', 'EspecieAgro deve existir');
      Assert.equals(CRUD_ENTITIES.Parcela, 'PARCELAS_AGRO');
      Assert.equals(CRUD_ENTITIES.Producao, 'PRODUCAO_AGRO');
    });
    
    TestRunner.it('deve ter todas as entidades Ambientais', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'DadoClimatico');
      Assert.hasProperty(CRUD_ENTITIES, 'QualidadeAgua');
      Assert.hasProperty(CRUD_ENTITIES, 'QualidadeSolo');
      Assert.hasProperty(CRUD_ENTITIES, 'Biodiversidade');
      Assert.hasProperty(CRUD_ENTITIES, 'Carbono');
    });
    
    TestRunner.it('deve ter todas as entidades de Ecoturismo', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'Visitante');
      Assert.hasProperty(CRUD_ENTITIES, 'Trilha');
      Assert.hasProperty(CRUD_ENTITIES, 'AvaliacaoEcoturismo');
    });
    
    TestRunner.it('deve ter todas as entidades de GPS', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'GPSPoint');
      Assert.hasProperty(CRUD_ENTITIES, 'Waypoint');
      Assert.hasProperty(CRUD_ENTITIES, 'Rota');
      Assert.hasProperty(CRUD_ENTITIES, 'Foto');
    });
    
    TestRunner.it('deve ter todas as entidades de Terapia', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'Participante');
      Assert.hasProperty(CRUD_ENTITIES, 'Sessao');
      Assert.hasProperty(CRUD_ENTITIES, 'AvaliacaoTerapia');
    });
    
    TestRunner.it('deve ter todas as entidades de Sistema', function() {
      Assert.hasProperty(CRUD_ENTITIES, 'Usuario');
      Assert.hasProperty(CRUD_ENTITIES, 'Log');
      Assert.hasProperty(CRUD_ENTITIES, 'Configuracao');
    });
    
    TestRunner.it('deve ter 22 entidades no total', function() {
      const count = Object.keys(CRUD_ENTITIES).length;
      Assert.equals(count, 22, 'Deve ter 22 entidades');
    });
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // TESTES UNITÁRIOS - getCRUD Function
  // ═══════════════════════════════════════════════════════════════════════
  
  TestRunner.describe('getCRUD Function', function() {
    
    TestRunner.it('deve retornar objeto com todas as operações CRUD', function() {
      const crud = getCRUD('Parcela');
      
      Assert.isObject(crud, 'Deve retornar objeto');
      Assert.hasProperty(crud, 'create');
      Assert.hasProperty(crud, 'read');
      Assert.hasProperty(crud, 'readAll');
      Assert.hasProperty(crud, 'readById');
      Assert.hasProperty(crud, 'update');
      Assert.hasProperty(crud, 'delete');
      Assert.hasProperty(crud, 'count');
      Assert.hasProperty(crud, 'exists');
      Assert.hasProperty(crud, 'upsert');
    });
    
    TestRunner.it('deve retornar funções para cada operação', function() {
      const crud = getCRUD('Visitante');
      
      Assert.isType(crud.create, 'function');
      Assert.isType(crud.read, 'function');
      Assert.isType(crud.readAll, 'function');
      Assert.isType(crud.readById, 'function');
      Assert.isType(crud.update, 'function');
      Assert.isType(crud.delete, 'function');
    });
    
    TestRunner.it('deve lançar erro para entidade inexistente', function() {
      Assert.throws(
        () => getCRUD('EntidadeInexistente'),
        'não registrada',
        'Deve lançar erro para entidade inválida'
      );
    });
    
    TestRunner.it('deve usar cache para mesma entidade', function() {
      const crud1 = getCRUD('Trilha');
      const crud2 = getCRUD('Trilha');
      Assert.equals(crud1, crud2, 'Deve retornar mesma instância do cache');
    });
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // TESTES UNITÁRIOS - executeCRUD Function
  // ═══════════════════════════════════════════════════════════════════════
  
  TestRunner.describe('executeCRUD Function', function() {
    
    TestRunner.it('deve retornar erro para operação inválida', function() {
      const result = executeCRUD('Parcela', 'operacaoInvalida', {});
      
      Assert.isObject(result);
      Assert.equals(result.success, false);
      Assert.stringContains(result.error, 'inválida');
    });
    
    TestRunner.it('deve retornar erro para entidade inválida', function() {
      const result = executeCRUD('EntidadeInvalida', 'read', {});
      
      Assert.isObject(result);
      Assert.equals(result.success, false);
    });
    
    TestRunner.it('deve aceitar todas as operações válidas', function() {
      const validOperations = ['create', 'read', 'readAll', 'readById', 'update', 'delete', 'count', 'exists', 'upsert'];
      
      validOperations.forEach(op => {
        Assert.doesNotThrow(
          () => executeCRUD('Log', op, { id: 'test', data: {}, filter: {}, updates: {} }),
          `Operação ${op} deve ser válida`
        );
      });
    });
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // TESTES DE COMPATIBILIDADE - Funções Legadas
  // ═══════════════════════════════════════════════════════════════════════
  
  TestRunner.describe('Funções Legadas - Compatibilidade', function() {
    
    TestRunner.it('funções de Parcela devem existir', function() {
      Assert.isType(createParcela, 'function');
      Assert.isType(readParcelas, 'function');
      Assert.isType(readAllParcelas, 'function');
      Assert.isType(readParcelaById, 'function');
      Assert.isType(updateParcela, 'function');
      Assert.isType(deleteParcela, 'function');
    });
    
    TestRunner.it('funções de Biodiversidade devem existir', function() {
      Assert.isType(createBiodiversidade, 'function');
      Assert.isType(createObservacaoBiodiversidade, 'function');
      Assert.isType(readObservacoesBiodiversidade, 'function');
      Assert.isType(readBiodiversidadeById, 'function');
      Assert.isType(updateBiodiversidade, 'function');
      Assert.isType(deleteBiodiversidade, 'function');
    });
    
    TestRunner.it('funções de Visitante devem existir', function() {
      Assert.isType(createVisitante, 'function');
      Assert.isType(readVisitantes, 'function');
      Assert.isType(readVisitanteById, 'function');
      Assert.isType(updateVisitante, 'function');
      Assert.isType(deleteVisitante, 'function');
    });
    
    TestRunner.it('funções de Waypoint devem existir', function() {
      Assert.isType(createWaypoint, 'function');
      Assert.isType(readWaypoints, 'function');
      Assert.isType(readWaypointById, 'function');
      Assert.isType(updateWaypoint, 'function');
      Assert.isType(deleteWaypoint, 'function');
    });
    
    TestRunner.it('funções auxiliares devem existir', function() {
      Assert.isType(countRecords, 'function');
      Assert.isType(recordExists, 'function');
      Assert.isType(upsertRecord, 'function');
    });
    
    TestRunner.it('funções de API Agrofloresta devem existir', function() {
      Assert.isType(apiCalculateCarbonSequestration, 'function');
      Assert.isType(apiAnalyzeProductivity, 'function');
      Assert.isType(apiAnalyzeEconomicViability, 'function');
      Assert.isType(apiAnalyzeBiodiversityImpact, 'function');
    });
  });
  
  // Executa todos os testes
  return TestRunner.run();
}

/**
 * Teste rápido do CRUDFactory
 */
function quickTestCRUDFactory() {
  Logger.log('🚀 Quick Test - CRUDFactory\n');
  
  // Teste 1: Registry
  const entityCount = Object.keys(CRUD_ENTITIES).length;
  Logger.log(`✅ CRUD_ENTITIES tem ${entityCount} entidades`);
  
  // Teste 2: getCRUD
  const crud = getCRUD('Parcela');
  const hasAllMethods = ['create', 'read', 'update', 'delete'].every(m => typeof crud[m] === 'function');
  Logger.log(`✅ getCRUD retorna objeto com métodos: ${hasAllMethods}`);
  
  // Teste 3: Funções legadas
  const legacyExists = typeof createParcela === 'function' && typeof readParcelas === 'function';
  Logger.log(`✅ Funções legadas existem: ${legacyExists}`);
  
  // Teste 4: executeCRUD com operação inválida
  const errorResult = executeCRUD('Parcela', 'invalid', {});
  Logger.log(`✅ executeCRUD retorna erro para operação inválida: ${errorResult.success === false}`);
  
  Logger.log('\n📊 Quick Test concluído!');
  
  return { success: true, tests: 4 };
}
