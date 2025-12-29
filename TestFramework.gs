/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST FRAMEWORK - Assertions e Utilities para Testes
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Framework de testes inspirado em Jest/Mocha para Google Apps Script.
 * Fornece assertions robustas, mocking e relatórios detalhados.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Classe Assert - Assertions para testes
 */
const Assert = {
  _assertionCount: 0,
  _failedAssertions: [],
  
  /**
   * Reseta contadores
   */
  reset() {
    this._assertionCount = 0;
    this._failedAssertions = [];
  },
  
  /**
   * Retorna estatísticas
   */
  getStats() {
    return {
      total: this._assertionCount,
      passed: this._assertionCount - this._failedAssertions.length,
      failed: this._failedAssertions.length,
      failures: this._failedAssertions
    };
  },
  
  /**
   * Verifica igualdade estrita
   */
  equals(actual, expected, message = '') {
    this._assertionCount++;
    if (actual !== expected) {
      const error = `${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica igualdade profunda (objetos/arrays)
   */
  deepEquals(actual, expected, message = '') {
    this._assertionCount++;
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      const error = `${message || 'Deep equality failed'}: expected ${expectedStr}, got ${actualStr}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é truthy
   */
  isTrue(value, message = '') {
    this._assertionCount++;
    if (!value) {
      const error = `${message || 'Expected truthy value'}: got ${JSON.stringify(value)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é falsy
   */
  isFalse(value, message = '') {
    this._assertionCount++;
    if (value) {
      const error = `${message || 'Expected falsy value'}: got ${JSON.stringify(value)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é null
   */
  isNull(value, message = '') {
    this._assertionCount++;
    if (value !== null) {
      const error = `${message || 'Expected null'}: got ${JSON.stringify(value)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor não é null
   */
  isNotNull(value, message = '') {
    this._assertionCount++;
    if (value === null) {
      const error = message || 'Expected non-null value';
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é undefined
   */
  isUndefined(value, message = '') {
    this._assertionCount++;
    if (value !== undefined) {
      const error = `${message || 'Expected undefined'}: got ${JSON.stringify(value)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor está definido
   */
  isDefined(value, message = '') {
    this._assertionCount++;
    if (value === undefined) {
      const error = message || 'Expected defined value';
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica tipo do valor
   */
  isType(value, expectedType, message = '') {
    this._assertionCount++;
    const actualType = typeof value;
    if (actualType !== expectedType) {
      const error = `${message || 'Type mismatch'}: expected ${expectedType}, got ${actualType}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se é array
   */
  isArray(value, message = '') {
    this._assertionCount++;
    if (!Array.isArray(value)) {
      const error = `${message || 'Expected array'}: got ${typeof value}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se é objeto
   */
  isObject(value, message = '') {
    this._assertionCount++;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      const error = `${message || 'Expected object'}: got ${typeof value}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se array contém elemento
   */
  contains(array, element, message = '') {
    this._assertionCount++;
    if (!Array.isArray(array) || !array.includes(element)) {
      const error = `${message || 'Array does not contain element'}: ${JSON.stringify(element)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se objeto tem propriedade
   */
  hasProperty(obj, property, message = '') {
    this._assertionCount++;
    if (!obj || !obj.hasOwnProperty(property)) {
      const error = `${message || 'Object missing property'}: ${property}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se string contém substring
   */
  stringContains(str, substring, message = '') {
    this._assertionCount++;
    if (typeof str !== 'string' || !str.includes(substring)) {
      const error = `${message || 'String does not contain'}: "${substring}"`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se número está em range
   */
  inRange(value, min, max, message = '') {
    this._assertionCount++;
    if (typeof value !== 'number' || value < min || value > max) {
      const error = `${message || 'Value out of range'}: ${value} not in [${min}, ${max}]`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é maior que
   */
  greaterThan(value, threshold, message = '') {
    this._assertionCount++;
    if (value <= threshold) {
      const error = `${message || 'Value not greater'}: ${value} <= ${threshold}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se valor é menor que
   */
  lessThan(value, threshold, message = '') {
    this._assertionCount++;
    if (value >= threshold) {
      const error = `${message || 'Value not less'}: ${value} >= ${threshold}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se array tem tamanho específico
   */
  hasLength(array, length, message = '') {
    this._assertionCount++;
    if (!Array.isArray(array) || array.length !== length) {
      const error = `${message || 'Length mismatch'}: expected ${length}, got ${array?.length}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica se função lança erro
   */
  throws(fn, expectedError = null, message = '') {
    this._assertionCount++;
    try {
      fn();
      const error = message || 'Expected function to throw';
      this._failedAssertions.push(error);
      throw new Error(error);
    } catch (e) {
      if (expectedError && !e.message.includes(expectedError)) {
        const error = `${message || 'Wrong error'}: expected "${expectedError}", got "${e.message}"`;
        this._failedAssertions.push(error);
        throw new Error(error);
      }
      return true;
    }
  },
  
  /**
   * Verifica se função não lança erro
   */
  doesNotThrow(fn, message = '') {
    this._assertionCount++;
    try {
      fn();
      return true;
    } catch (e) {
      const error = `${message || 'Unexpected error'}: ${e.message}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
  },
  
  /**
   * Verifica resposta de sucesso padrão do sistema
   */
  isSuccessResponse(response, message = '') {
    this._assertionCount++;
    if (!response || response.success !== true) {
      const error = `${message || 'Expected success response'}: got ${JSON.stringify(response)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  },
  
  /**
   * Verifica resposta de erro padrão do sistema
   */
  isErrorResponse(response, message = '') {
    this._assertionCount++;
    if (!response || response.success !== false) {
      const error = `${message || 'Expected error response'}: got ${JSON.stringify(response)}`;
      this._failedAssertions.push(error);
      throw new Error(error);
    }
    return true;
  }
};

/**
 * Test Runner com suporte a describe/it
 */
const TestRunner = {
  _suites: [],
  _currentSuite: null,
  _results: [],
  
  /**
   * Define uma suite de testes
   */
  describe(name, fn) {
    const suite = { name, tests: [], beforeEach: null, afterEach: null };
    this._currentSuite = suite;
    this._suites.push(suite);
    fn();
    this._currentSuite = null;
  },
  
  /**
   * Define um teste individual
   */
  it(name, fn) {
    if (this._currentSuite) {
      this._currentSuite.tests.push({ name, fn });
    }
  },
  
  /**
   * Hook executado antes de cada teste
   */
  beforeEach(fn) {
    if (this._currentSuite) {
      this._currentSuite.beforeEach = fn;
    }
  },
  
  /**
   * Hook executado após cada teste
   */
  afterEach(fn) {
    if (this._currentSuite) {
      this._currentSuite.afterEach = fn;
    }
  },
  
  /**
   * Executa todas as suites
   */
  run() {
    this._results = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalAssertions = 0;
    
    Logger.log('\n🧪 TEST RUNNER - Executando Suites\n');
    Logger.log('═'.repeat(70));
    
    for (const suite of this._suites) {
      Logger.log(`\n📦 ${suite.name}`);
      Logger.log('─'.repeat(50));
      
      for (const test of suite.tests) {
        Assert.reset();
        const startTime = new Date();
        
        try {
          if (suite.beforeEach) suite.beforeEach();
          test.fn();
          if (suite.afterEach) suite.afterEach();
          
          const stats = Assert.getStats();
          totalAssertions += stats.total;
          totalPassed++;
          
          const duration = new Date() - startTime;
          Logger.log(`  ✅ ${test.name} (${stats.total} assertions, ${duration}ms)`);
          
          this._results.push({
            suite: suite.name,
            test: test.name,
            passed: true,
            assertions: stats.total,
            duration
          });
          
        } catch (error) {
          const stats = Assert.getStats();
          totalAssertions += stats.total;
          totalFailed++;
          
          const duration = new Date() - startTime;
          Logger.log(`  ❌ ${test.name}`);
          Logger.log(`     Error: ${error.message}`);
          
          this._results.push({
            suite: suite.name,
            test: test.name,
            passed: false,
            error: error.message,
            assertions: stats.total,
            duration
          });
        }
      }
    }
    
    // Resumo
    Logger.log('\n' + '═'.repeat(70));
    Logger.log('📊 RESUMO');
    Logger.log('─'.repeat(70));
    Logger.log(`  Suites: ${this._suites.length}`);
    Logger.log(`  Testes: ${totalPassed + totalFailed}`);
    Logger.log(`  ✅ Passou: ${totalPassed}`);
    Logger.log(`  ❌ Falhou: ${totalFailed}`);
    Logger.log(`  📝 Assertions: ${totalAssertions}`);
    Logger.log(`  📈 Taxa: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    Logger.log('═'.repeat(70));
    
    // Limpa suites para próxima execução
    this._suites = [];
    
    return {
      suites: this._suites.length,
      passed: totalPassed,
      failed: totalFailed,
      assertions: totalAssertions,
      results: this._results
    };
  }
};

/**
 * Mock Factory para simular dependências
 */
const MockFactory = {
  /**
   * Cria mock de função
   */
  fn(returnValue = undefined) {
    const mock = function(...args) {
      mock.calls.push(args);
      mock.callCount++;
      return typeof returnValue === 'function' ? returnValue(...args) : returnValue;
    };
    mock.calls = [];
    mock.callCount = 0;
    mock.reset = () => { mock.calls = []; mock.callCount = 0; };
    return mock;
  },
  
  /**
   * Cria mock de objeto
   */
  object(template = {}) {
    const mock = {};
    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'function') {
        mock[key] = this.fn(value);
      } else {
        mock[key] = value;
      }
    }
    return mock;
  },
  
  /**
   * Mock de DatabaseService para testes isolados
   */
  databaseService() {
    const data = {};
    return {
      create: this.fn((sheet, record) => {
        if (!data[sheet]) data[sheet] = [];
        const id = `mock_${Date.now()}`;
        data[sheet].push({ ...record, id });
        return { success: true, id, data: { ...record, id } };
      }),
      read: this.fn((sheet, filter) => {
        return { success: true, data: data[sheet] || [] };
      }),
      readById: this.fn((sheet, id) => {
        const records = data[sheet] || [];
        const record = records.find(r => r.id === id);
        return record ? { success: true, data: record } : { success: false };
      }),
      update: this.fn((sheet, id, updates) => {
        return { success: true, data: { id, ...updates } };
      }),
      delete: this.fn((sheet, id) => {
        return { success: true };
      }),
      _data: data
    };
  }
};

// Aliases globais para sintaxe mais limpa
const describe = TestRunner.describe.bind(TestRunner);
const it = TestRunner.it.bind(TestRunner);
const beforeEach = TestRunner.beforeEach.bind(TestRunner);
const afterEach = TestRunner.afterEach.bind(TestRunner);
const expect = Assert;
