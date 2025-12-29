/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES - Input Validators
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testes para o módulo InputValidators.
 */

/**
 * Executa todos os testes de InputValidators
 */
function runInputValidatorsTests() {
  
  TestRunner.describe('InputValidators - Tipos Básicos', function() {
    
    TestRunner.it('isNonEmptyString deve validar strings', function() {
      Assert.isTrue(InputValidators.isNonEmptyString('teste').valid);
      Assert.isTrue(InputValidators.isNonEmptyString('  texto  ').valid);
      Assert.isFalse(InputValidators.isNonEmptyString('').valid);
      Assert.isFalse(InputValidators.isNonEmptyString('   ').valid);
      Assert.isFalse(InputValidators.isNonEmptyString(null).valid);
      Assert.isFalse(InputValidators.isNonEmptyString(123).valid);
    });
    
    TestRunner.it('isStringLength deve validar tamanho', function() {
      Assert.isTrue(InputValidators.isStringLength('abc', 2, 5).valid);
      Assert.isFalse(InputValidators.isStringLength('a', 2, 5).valid);
      Assert.isFalse(InputValidators.isStringLength('abcdef', 2, 5).valid);
      Assert.isTrue(InputValidators.isStringLength('ab', 2).valid);
      Assert.isFalse(InputValidators.isStringLength('a', 2).valid);
    });
    
    TestRunner.it('isNumber deve validar números', function() {
      Assert.isTrue(InputValidators.isNumber(123).valid);
      Assert.isTrue(InputValidators.isNumber('123').valid);
      Assert.isTrue(InputValidators.isNumber(12.5).valid);
      Assert.isTrue(InputValidators.isNumber(-10).valid);
      Assert.isFalse(InputValidators.isNumber('abc').valid);
      Assert.isFalse(InputValidators.isNumber(NaN).valid);
    });
    
    TestRunner.it('isNumberInRange deve validar range', function() {
      Assert.isTrue(InputValidators.isNumberInRange(5, 0, 10).valid);
      Assert.isTrue(InputValidators.isNumberInRange(0, 0, 10).valid);
      Assert.isTrue(InputValidators.isNumberInRange(10, 0, 10).valid);
      Assert.isFalse(InputValidators.isNumberInRange(-1, 0, 10).valid);
      Assert.isFalse(InputValidators.isNumberInRange(11, 0, 10).valid);
    });
    
    TestRunner.it('isPositiveInteger deve validar inteiros positivos', function() {
      Assert.isTrue(InputValidators.isPositiveInteger(1).valid);
      Assert.isTrue(InputValidators.isPositiveInteger(100).valid);
      Assert.isFalse(InputValidators.isPositiveInteger(0).valid);
      Assert.isFalse(InputValidators.isPositiveInteger(-1).valid);
      Assert.isFalse(InputValidators.isPositiveInteger(1.5).valid);
    });
  });
  
  TestRunner.describe('InputValidators - Formatos', function() {
    
    TestRunner.it('isEmail deve validar emails', function() {
      Assert.isTrue(InputValidators.isEmail('test@example.com').valid);
      Assert.isTrue(InputValidators.isEmail('user.name@domain.org').valid);
      Assert.isFalse(InputValidators.isEmail('invalid').valid);
      Assert.isFalse(InputValidators.isEmail('@domain.com').valid);
      Assert.isFalse(InputValidators.isEmail('user@').valid);
    });
    
    TestRunner.it('isPhoneBR deve validar telefones brasileiros', function() {
      Assert.isTrue(InputValidators.isPhoneBR('11999998888').valid);
      Assert.isTrue(InputValidators.isPhoneBR('1199998888').valid);
      Assert.isTrue(InputValidators.isPhoneBR('(11) 99999-8888').valid);
      Assert.isFalse(InputValidators.isPhoneBR('123').valid);
      Assert.isFalse(InputValidators.isPhoneBR('123456789012').valid);
    });
    
    TestRunner.it('isCPF deve validar CPFs', function() {
      // CPFs válidos de teste
      Assert.isTrue(InputValidators.isCPF('52998224725').valid);
      Assert.isFalse(InputValidators.isCPF('11111111111').valid);
      Assert.isFalse(InputValidators.isCPF('12345678901').valid);
      Assert.isFalse(InputValidators.isCPF('123').valid);
    });
    
    TestRunner.it('isDate deve validar datas', function() {
      Assert.isTrue(InputValidators.isDate('2024-06-15').valid);
      Assert.isTrue(InputValidators.isDate(new Date()).valid);
      Assert.isFalse(InputValidators.isDate('invalid').valid);
      Assert.isFalse(InputValidators.isDate('').valid);
    });
    
    TestRunner.it('isURL deve validar URLs', function() {
      Assert.isTrue(InputValidators.isURL('https://example.com').valid);
      Assert.isTrue(InputValidators.isURL('http://test.org/path').valid);
      Assert.isTrue(InputValidators.isURL('').valid); // Opcional
      Assert.isFalse(InputValidators.isURL('not-a-url').valid);
    });
  });
  
  TestRunner.describe('InputValidators - Geográficos', function() {
    
    TestRunner.it('isLatitude deve validar latitudes', function() {
      Assert.isTrue(InputValidators.isLatitude(0).valid);
      Assert.isTrue(InputValidators.isLatitude(-15.234).valid);
      Assert.isTrue(InputValidators.isLatitude(90).valid);
      Assert.isTrue(InputValidators.isLatitude(-90).valid);
      Assert.isFalse(InputValidators.isLatitude(91).valid);
      Assert.isFalse(InputValidators.isLatitude(-91).valid);
    });
    
    TestRunner.it('isLongitude deve validar longitudes', function() {
      Assert.isTrue(InputValidators.isLongitude(0).valid);
      Assert.isTrue(InputValidators.isLongitude(-47.876).valid);
      Assert.isTrue(InputValidators.isLongitude(180).valid);
      Assert.isTrue(InputValidators.isLongitude(-180).valid);
      Assert.isFalse(InputValidators.isLongitude(181).valid);
      Assert.isFalse(InputValidators.isLongitude(-181).valid);
    });
    
    TestRunner.it('isGPSCoordinates deve validar coordenadas', function() {
      Assert.isTrue(InputValidators.isGPSCoordinates(-15.234, -47.876).valid);
      Assert.isFalse(InputValidators.isGPSCoordinates(91, -47).valid);
      Assert.isFalse(InputValidators.isGPSCoordinates(-15, 181).valid);
    });
    
    TestRunner.it('isAltitude deve validar altitudes', function() {
      Assert.isTrue(InputValidators.isAltitude(850).valid);
      Assert.isTrue(InputValidators.isAltitude(0).valid);
      Assert.isFalse(InputValidators.isAltitude(-600).valid);
      Assert.isFalse(InputValidators.isAltitude(10000).valid);
    });
  });
  
  TestRunner.describe('InputValidators - Enum', function() {
    
    TestRunner.it('isOneOf deve validar opções', function() {
      Assert.isTrue(InputValidators.isOneOf('a', ['a', 'b', 'c']).valid);
      Assert.isFalse(InputValidators.isOneOf('d', ['a', 'b', 'c']).valid);
    });
    
    TestRunner.it('isWaypointCategory deve validar categorias', function() {
      Assert.isTrue(InputValidators.isWaypointCategory('cachoeira').valid);
      Assert.isTrue(InputValidators.isWaypointCategory('mirante').valid);
      Assert.isFalse(InputValidators.isWaypointCategory('invalido').valid);
    });
    
    TestRunner.it('isTrailDifficulty deve validar dificuldades', function() {
      Assert.isTrue(InputValidators.isTrailDifficulty('fácil').valid);
      Assert.isTrue(InputValidators.isTrailDifficulty('difícil').valid);
      Assert.isFalse(InputValidators.isTrailDifficulty('extremo').valid);
    });
  });
  
  TestRunner.describe('InputValidators - Sanitização', function() {
    
    TestRunner.it('sanitizeString deve remover caracteres perigosos', function() {
      Assert.equals(InputValidators.sanitizeString('<script>alert(1)</script>'), 'scriptalert(1)/script');
      Assert.equals(InputValidators.sanitizeString('  texto  '), 'texto');
      Assert.equals(InputValidators.sanitizeString('normal'), 'normal');
    });
    
    TestRunner.it('sanitizeObject deve sanitizar recursivamente', function() {
      const input = { nome: '<b>teste</b>', nested: { valor: '<script>' } };
      const result = InputValidators.sanitizeObject(input);
      Assert.isFalse(result.nome.includes('<'));
      Assert.isFalse(result.nested.valor.includes('<'));
    });
  });
  
  TestRunner.describe('InputValidators - Schema Validation', function() {
    
    TestRunner.it('validateSchema deve validar waypoint válido', function() {
      const data = {
        nome: 'Cachoeira Principal',
        categoria: 'cachoeira',
        latitude: -15.234,
        longitude: -47.876
      };
      const result = InputValidators.validateSchema(data, ValidationSchemas.waypoint);
      Assert.isTrue(result.valid);
      Assert.equals(result.errors.length, 0);
    });
    
    TestRunner.it('validateSchema deve rejeitar waypoint inválido', function() {
      const data = {
        nome: 'AB', // muito curto
        categoria: 'invalida',
        latitude: 100, // fora do range
        longitude: -47.876
      };
      const result = InputValidators.validateSchema(data, ValidationSchemas.waypoint);
      Assert.isFalse(result.valid);
      Assert.greaterThan(result.errors.length, 0);
    });
    
    TestRunner.it('validateSchema deve validar campos obrigatórios', function() {
      const data = { descricao: 'Apenas descrição' };
      const result = InputValidators.validateSchema(data, ValidationSchemas.waypoint);
      Assert.isFalse(result.valid);
      Assert.greaterThan(result.errors.length, 0);
    });
    
    TestRunner.it('validateSchema deve validar trilha', function() {
      const data = {
        nome: 'Trilha das Araras',
        distancia_km: 3.5,
        dificuldade: 'média',
        duracao_horas: 2
      };
      const result = InputValidators.validateSchema(data, ValidationSchemas.trilha);
      Assert.isTrue(result.valid);
    });
    
    TestRunner.it('validateSchema deve validar qualidade da água', function() {
      const data = {
        local: 'Rio Principal',
        data_coleta: new Date(),
        pH: 7.2,
        temperatura: 22,
        oxigenio_dissolvido: 8.5
      };
      const result = InputValidators.validateSchema(data, ValidationSchemas.qualidadeAgua);
      Assert.isTrue(result.valid);
    });
  });
  
  return TestRunner.run();
}

/**
 * Teste rápido dos validadores
 */
function quickTestInputValidators() {
  Logger.log('🧪 Quick Test - InputValidators\n');
  
  let passed = 0;
  let failed = 0;
  
  // Teste 1: String
  const t1 = InputValidators.isNonEmptyString('teste').valid;
  Logger.log(`✅ isNonEmptyString: ${t1}`);
  t1 ? passed++ : failed++;
  
  // Teste 2: Email
  const t2 = InputValidators.isEmail('test@example.com').valid;
  Logger.log(`✅ isEmail: ${t2}`);
  t2 ? passed++ : failed++;
  
  // Teste 3: Coordenadas
  const t3 = InputValidators.isGPSCoordinates(-15.234, -47.876).valid;
  Logger.log(`✅ isGPSCoordinates: ${t3}`);
  t3 ? passed++ : failed++;
  
  // Teste 4: Schema waypoint
  const t4 = InputValidators.validateSchema({
    nome: 'Teste',
    categoria: 'mirante',
    latitude: -15,
    longitude: -47
  }, ValidationSchemas.waypoint).valid;
  Logger.log(`✅ validateSchema waypoint: ${t4}`);
  t4 ? passed++ : failed++;
  
  // Teste 5: Sanitização
  const t5 = !InputValidators.sanitizeString('<script>').includes('<');
  Logger.log(`✅ sanitizeString: ${t5}`);
  t5 ? passed++ : failed++;
  
  Logger.log(`\n📊 Resultado: ${passed}/${passed + failed} passaram`);
  
  return { passed, failed, total: passed + failed };
}
