/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPREHENSIVE TEST SUITE - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Suite completa de testes para validação de CRUD, navegação e serviços
 * 
 * @version 1.0.0
 * @date 2024-11-08
 */

const TestSuite = {
  results: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  },

  /**
   * Executa todos os testes do sistema
   */
  runAll: function() {
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🧪 INICIANDO SUITE COMPLETA DE TESTES');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    this.results = { total: 0, passed: 0, failed: 0, errors: [] };
    
    // 1. Testes de Configuração
    this.testConfiguration();
    
    // 2. Testes de CRUD para cada entidade
    this.testCRUDOperations();
    
    // 3. Testes de Validação
    this.testValidation();
    
    // 4. Testes de Serviços
    this.testServices();
    
    // 5. Testes de Exportação
    this.testExport();
    
    // 6. Testes de Estatísticas
    this.testStatistics();
    
    // Relatório Final
    this.printReport();
    
    return this.results;
  },

  /**
   * Testa configuração do sistema
   */
  testConfiguration: function() {
    Logger.log('\n📋 TESTANDO CONFIGURAÇÃO DO SISTEMA\n');
    
    this.test('Config: Spreadsheet ID', () => {
      const id = CONFIG.SPREADSHEET_ID;
      if (!id) throw new Error('SPREADSHEET_ID não configurado');
      return true;
    });
    
    this.test('Config: Drive Folder ID', () => {
      const id = CONFIG.DRIVE_FOLDER_ID;
      if (!id) throw new Error('DRIVE_FOLDER_ID não configurado');
      return true;
    });
    
    this.test('Config: Acesso ao Spreadsheet', () => {
      const ss = getSpreadsheet();
      if (!ss) throw new Error('Não foi possível acessar o Spreadsheet');
      return true;
    });
  },

  /**
   * Testa operações CRUD para todas as entidades
   */
  testCRUDOperations: function() {
    Logger.log('\n💾 TESTANDO OPERAÇÕES CRUD\n');
    
    const entities = [
      {
        name: 'Waypoint',
        sheet: 'Waypoints',
        data: {
          nome: 'Teste Waypoint ' + Date.now(),
          categoria: 'teste',
          latitude: -15.234567,
          longitude: -47.876543,
          altitude: 850,
          descricao: 'Waypoint de teste'
        }
      },
      {
        name: 'Visitante',
        sheet: 'Visitantes',
        data: {
          nome: 'Teste Visitante ' + Date.now(),
          email: 'teste@example.com',
          telefone: '(61) 99999-9999',
          cidade: 'Brasília',
          data_visita: new Date(),
          tipo_visita: 'educacional',
          quantidade_pessoas: 1
        }
      },
      {
        name: 'Biodiversidade',
        sheet: 'Biodiversidade',
        data: {
          tipo: 'Fauna',
          especie: 'Ara ararauna',
          nome_popular: 'Arara-canindé',
          quantidade: 2,
          data: new Date(),
          local: 'Teste Local',
          tipo_observacao: 'avistamento'
        }
      }
    ];
    
    entities.forEach(entity => {
      this.testEntityCRUD(entity);
    });
  },

  /**
   * Testa CRUD completo para uma entidade
   */
  testEntityCRUD: function(entity) {
    let createdId = null;
    
    // CREATE
    this.test(`CRUD ${entity.name}: CREATE`, () => {
      const result = DatabaseService.create(entity.sheet, entity.data);
      if (!result.success) throw new Error(result.error);
      createdId = result.id;
      return true;
    });
    
    // READ
    this.test(`CRUD ${entity.name}: READ`, () => {
      if (!createdId) throw new Error('ID não disponível');
      const result = DatabaseService.readById(entity.sheet, createdId);
      if (!result.success) throw new Error(result.error);
      if (!result.data) throw new Error('Dados não encontrados');
      return true;
    });
    
    // UPDATE
    this.test(`CRUD ${entity.name}: UPDATE`, () => {
      if (!createdId) throw new Error('ID não disponível');
      const updates = { descricao: 'Atualizado em ' + new Date() };
      const result = DatabaseService.update(entity.sheet, createdId, updates);
      if (!result.success) throw new Error(result.error);
      return true;
    });
    
    // DELETE
    this.test(`CRUD ${entity.name}: DELETE`, () => {
      if (!createdId) throw new Error('ID não disponível');
      const result = DatabaseService.delete(entity.sheet, createdId);
      if (!result.success) throw new Error(result.error);
      return true;
    });
  },

  /**
   * Testa validação de dados
   */
  testValidation: function() {
    Logger.log('\n✓ TESTANDO VALIDAÇÃO DE DADOS\n');
    
    this.test('Validação: Email válido', () => {
      const valid = ValidationService.validateEmail('teste@example.com');
      if (!valid) throw new Error('Email válido rejeitado');
      return true;
    });
    
    this.test('Validação: Email inválido', () => {
      const invalid = ValidationService.validateEmail('email-invalido');
      if (invalid) throw new Error('Email inválido aceito');
      return true;
    });
    
    this.test('Validação: Coordenadas válidas', () => {
      const valid = ValidationService.validateCoordinates(-15.234, -47.876);
      if (!valid) throw new Error('Coordenadas válidas rejeitadas');
      return true;
    });
    
    this.test('Validação: Coordenadas inválidas', () => {
      const invalid = ValidationService.validateCoordinates(200, 200);
      if (invalid) throw new Error('Coordenadas inválidas aceitas');
      return true;
    });
  },

  /**
   * Testa serviços especializados
   */
  testServices: function() {
    Logger.log('\n⚙️ TESTANDO SERVIÇOS ESPECIALIZADOS\n');
    
    this.test('Serviço: Estatísticas Gerais', () => {
      const stats = StatisticsService.getGeneralStatistics();
      if (!stats.success) throw new Error(stats.error);
      if (!stats.data) throw new Error('Dados de estatísticas não retornados');
      return true;
    });
    
    this.test('Serviço: GPS - Validar Coordenadas', () => {
      const valid = ValidationService.validateCoordinates(-15.234, -47.876);
      if (!valid) throw new Error('Coordenadas válidas rejeitadas');
      return true;
    });
    
    this.test('Serviço: GPS - Calcular Distância', () => {
      const dist = GPSService.calculateDistance(
        -15.234, -47.876,
        -15.235, -47.877
      );
      if (typeof dist !== 'number') throw new Error('Distância não calculada');
      if (dist < 0) throw new Error('Distância negativa');
      return true;
    });
  },

  /**
   * Testa funcionalidades de exportação
   */
  testExport: function() {
    Logger.log('\n📤 TESTANDO EXPORTAÇÃO DE DADOS\n');
    
    this.test('Exportação: CSV', () => {
      // Garante que há pelo menos um waypoint
      const checkData = DatabaseService.read('Waypoints', {}, { limit: 1 });
      if (!checkData.success || checkData.data.length === 0) {
        // Cria um waypoint de teste
        DatabaseService.create('Waypoints', {
          nome: 'Test CSV Export',
          categoria: 'test',
          latitude: -15.0,
          longitude: -47.0
        });
      }
      
      const result = ExportService.exportToCSV('Waypoints', {});
      if (!result.success) throw new Error(result.error);
      if (!result.csv) throw new Error('CSV não gerado');
      return true;
    });
    
    this.test('Exportação: JSON', () => {
      const result = ExportService.exportToJSON('Waypoints', {});
      if (!result.success) throw new Error(result.error);
      if (!result.json) throw new Error('JSON não gerado');
      return true;
    });
  },

  /**
   * Testa cálculos estatísticos
   */
  testStatistics: function() {
    Logger.log('\n📊 TESTANDO CÁLCULOS ESTATÍSTICOS\n');
    
    this.test('Estatística: Contagem por Planilha', () => {
      const count = StatisticsService.getCountBySheet('Waypoints');
      if (typeof count !== 'number') throw new Error('Contagem inválida');
      if (count < 0) throw new Error('Contagem negativa');
      return true;
    });
    
    this.test('Estatística: Resumo por Campo', () => {
      const summary = StatisticsService.summarizeByField('Waypoints', 'categoria');
      if (!summary) throw new Error('Resumo não gerado');
      return true;
    });
  },

  /**
   * Executa um teste individual
   */
  test: function(name, testFn) {
    this.results.total++;
    
    try {
      const result = testFn();
      if (result) {
        this.results.passed++;
        Logger.log(`✅ ${name}`);
      } else {
        this.results.failed++;
        this.results.errors.push({ test: name, error: 'Teste retornou false' });
        Logger.log(`❌ ${name}: Teste retornou false`);
      }
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ test: name, error: error.toString() });
      Logger.log(`❌ ${name}: ${error.toString()}`);
    }
  },

  /**
   * Imprime relatório final
   */
  printReport: function() {
    Logger.log('\n═══════════════════════════════════════════════════════════');
    Logger.log('📊 RELATÓRIO FINAL DE TESTES');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    Logger.log(`Total de Testes: ${this.results.total}`);
    Logger.log(`✅ Passou: ${this.results.passed} (${(this.results.passed/this.results.total*100).toFixed(1)}%)`);
    Logger.log(`❌ Falhou: ${this.results.failed} (${(this.results.failed/this.results.total*100).toFixed(1)}%)`);
    
    if (this.results.errors.length > 0) {
      Logger.log('\n❌ ERROS DETECTADOS:\n');
      this.results.errors.forEach((err, i) => {
        Logger.log(`${i+1}. ${err.test}`);
        Logger.log(`   ${err.error}\n`);
      });
    }
    
    Logger.log('\n═══════════════════════════════════════════════════════════');
    
    const success = this.results.failed === 0;
    if (success) {
      Logger.log('✅ TODOS OS TESTES PASSARAM!');
    } else {
      Logger.log('⚠️ ALGUNS TESTES FALHARAM - REVISAR ERROS ACIMA');
    }
    Logger.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * Função de atalho para executar todos os testes
 */
function runComprehensiveTests() {
  return TestSuite.runAll();
}

/**
 * Testa população de dados de exemplo
 */
function testDataPopulation() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📊 TESTANDO POPULAÇÃO DE DADOS');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  const testData = {
    waypoints: [
      { nome: 'Cachoeira Principal', categoria: 'cachoeira', latitude: -15.234, longitude: -47.876, altitude: 850 },
      { nome: 'Mirante do Vale', categoria: 'mirante', latitude: -15.235, longitude: -47.877, altitude: 920 },
      { nome: 'Início da Trilha', categoria: 'inicio', latitude: -15.233, longitude: -47.875, altitude: 800 }
    ],
    visitantes: [
      { 
        nome: 'João Silva', 
        email: 'joao@example.com', 
        telefone: '(61) 99999-1111', 
        cidade: 'Brasília',
        data_visita: new Date(),
        tipo_visita: 'educacional',
        quantidade_pessoas: 2
      },
      { 
        nome: 'Maria Santos', 
        email: 'maria@example.com', 
        telefone: '(61) 99999-2222', 
        cidade: 'Goiânia',
        data_visita: new Date(),
        tipo_visita: 'lazer',
        quantidade_pessoas: 4
      }
    ],
    biodiversidade: [
      { 
        tipo: 'Fauna', 
        especie: 'Ara ararauna', 
        nome_popular: 'Arara-canindé', 
        quantidade: 2,
        data: new Date(),
        local: 'Trilha Principal',
        tipo_observacao: 'avistamento'
      },
      { 
        tipo: 'Fauna', 
        especie: 'Chrysocyon brachyurus', 
        nome_popular: 'Lobo-guará', 
        quantidade: 1,
        data: new Date(),
        local: 'Cerrado',
        tipo_observacao: 'avistamento'
      },
      { 
        tipo: 'Flora', 
        especie: 'Caryocar brasiliense', 
        nome_popular: 'Pequi', 
        quantidade: 15,
        data: new Date(),
        local: 'Parcela 1',
        tipo_observacao: 'censo'
      }
    ]
  };
  
  let created = 0;
  let errors = [];
  
  // Popula Waypoints
  Logger.log('📍 Populando Waypoints...');
  testData.waypoints.forEach(wp => {
    try {
      const result = DatabaseService.create('Waypoints', wp);
      if (result.success) {
        created++;
        Logger.log(`  ✅ ${wp.nome}`);
      } else {
        errors.push(`Waypoint ${wp.nome}: ${result.error}`);
        Logger.log(`  ❌ ${wp.nome}: ${result.error}`);
      }
    } catch (e) {
      errors.push(`Waypoint ${wp.nome}: ${e.toString()}`);
      Logger.log(`  ❌ ${wp.nome}: ${e.toString()}`);
    }
  });
  
  // Popula Visitantes
  Logger.log('\n👤 Populando Visitantes...');
  testData.visitantes.forEach(vis => {
    try {
      const result = DatabaseService.create('Visitantes', vis);
      if (result.success) {
        created++;
        Logger.log(`  ✅ ${vis.nome}`);
      } else {
        errors.push(`Visitante ${vis.nome}: ${result.error}`);
        Logger.log(`  ❌ ${vis.nome}: ${result.error}`);
      }
    } catch (e) {
      errors.push(`Visitante ${vis.nome}: ${e.toString()}`);
      Logger.log(`  ❌ ${vis.nome}: ${e.toString()}`);
    }
  });
  
  // Popula Biodiversidade
  Logger.log('\n🦜 Populando Biodiversidade...');
  testData.biodiversidade.forEach(bio => {
    try {
      const result = DatabaseService.create('Biodiversidade', bio);
      if (result.success) {
        created++;
        Logger.log(`  ✅ ${bio.nome_popular}`);
      } else {
        errors.push(`Biodiversidade ${bio.nome_popular}: ${result.error}`);
        Logger.log(`  ❌ ${bio.nome_popular}: ${result.error}`);
      }
    } catch (e) {
      errors.push(`Biodiversidade ${bio.nome_popular}: ${e.toString()}`);
      Logger.log(`  ❌ ${bio.nome_popular}: ${e.toString()}`);
    }
  });
  
  // Relatório
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('📊 RELATÓRIO DE POPULAÇÃO');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  Logger.log(`✅ Registros criados: ${created}`);
  Logger.log(`❌ Erros: ${errors.length}`);
  
  if (errors.length > 0) {
    Logger.log('\n❌ ERROS:\n');
    errors.forEach(err => Logger.log(`  - ${err}`));
  }
  
  Logger.log('\n═══════════════════════════════════════════════════════════\n');
  
  return {
    success: errors.length === 0,
    created: created,
    errors: errors
  };
}
