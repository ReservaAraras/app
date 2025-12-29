/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM HELPER TESTS - Testes Unitários
 * ═══════════════════════════════════════════════════════════════════════════
 */

function runFormHelperTests() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 TESTES DO FORM HELPER');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  var tests = [
    testFormHelperCreation,
    testFieldValidationRequired,
    testFieldValidationNumber,
    testFieldValidationGPS,
    testFieldValidationEmail,
    testFieldValidationDate,
    testFormHelperToJSON,
    testFormHelperReset
  ];
  
  var passed = 0;
  var failed = 0;
  
  tests.forEach(function(test) {
    try {
      test();
      Logger.log('✅ ' + test.name);
      passed++;
    } catch (error) {
      Logger.log('❌ ' + test.name + ': ' + error);
      failed++;
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('📊 RESULTADO: ' + passed + '/' + tests.length + ' testes passaram');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  return {
    total: tests.length,
    passed: passed,
    failed: failed,
    success: failed === 0
  };
}

function testFormHelperCreation() {
  var form = FormHelper.create({
    fields: {
      nome: { type: 'string', required: true, label: 'Nome' }
    }
  });
  
  if (!form) throw 'Falha ao criar FormHelper';
  if (typeof form.validate !== 'function') throw 'Método validate não existe';
}

function testFieldValidationRequired() {
  var form = FormHelper.create();
  form.defineFields({
    nome: { required: true, label: 'Nome' }
  });
  
  // Teste 1: Campo vazio deve falhar
  form.setData({ nome: '' });
  var result1 = form.validate();
  if (result1.valid) throw 'Campo vazio passou na validação required';
  
  // Teste 2: Campo preenchido deve passar
  form.setData({ nome: 'Teste' });
  var result2 = form.validate();
  if (!result2.valid) throw 'Campo preenchido falhou na validação required';
}

function testFieldValidationNumber() {
  var form = FormHelper.create();
  form.defineFields({
    pH: { type: 'number', required: true, label: 'pH', min: 0, max: 14 }
  });
  
  // Teste 1: String deve falhar
  form.setData({ pH: 'abc' });
  var result1 = form.validate();
  if (result1.valid) throw 'String passou como número';
  
  // Teste 2: Número fora do limite deve falhar
  form.setData({ pH: 20 });
  var result2 = form.validate();
  if (result2.valid) throw 'Número fora do limite passou';
  
  // Teste 3: Número válido deve passar
  form.setData({ pH: 7 });
  var result3 = form.validate();
  if (!result3.valid) throw 'Número válido falhou: ' + JSON.stringify(result3.errors);
}

function testFieldValidationGPS() {
  var form = FormHelper.create();
  form.defineFields({
    latitude: { type: 'number', required: true },
    longitude: { type: 'number', required: true }
  });
  
  // Teste 1: Coordenadas inválidas
  form.setData({ latitude: 100, longitude: 200 });
  var gpsResult1 = form.validateGPS();
  if (gpsResult1.valid) throw 'Coordenadas inválidas passaram';
  
  // Teste 2: Coordenadas válidas
  form.setData({ latitude: -15.5, longitude: -47.8 });
  var gpsResult2 = form.validateGPS();
  if (!gpsResult2.valid) throw 'Coordenadas válidas falharam';
}

function testFieldValidationEmail() {
  // Teste 1: Email inválido
  var result1 = FormHelper.validateEmail('invalid-email', 'Email');
  if (result1.valid) throw 'Email inválido passou';
  
  // Teste 2: Email válido
  var result2 = FormHelper.validateEmail('teste@example.com', 'Email');
  if (!result2.valid) throw 'Email válido falhou';
}

function testFieldValidationDate() {
  // Teste 1: Data inválida
  var result1 = FormHelper.validateDate('data-invalida', 'Data');
  if (result1.valid) throw 'Data inválida passou';
  
  // Teste 2: Data válida
  var result2 = FormHelper.validateDate('2024-01-15', 'Data');
  if (!result2.valid) throw 'Data válida falhou';
}

function testFormHelperToJSON() {
  var form = FormHelper.create();
  form.setData({ nome: 'Teste', valor: 123 });
  
  var json = form.toJSON();
  var parsed = JSON.parse(json);
  
  if (parsed.nome !== 'Teste') throw 'JSON não preservou nome';
  if (parsed.valor !== 123) throw 'JSON não preservou valor';
}

function testFormHelperReset() {
  var form = FormHelper.create();
  form.setData({ nome: 'Teste' });
  form.reset();
  
  if (form.hasChanges()) throw 'Reset não limpou isDirty';
  if (Object.keys(form.data).length > 0) throw 'Reset não limpou dados';
}
