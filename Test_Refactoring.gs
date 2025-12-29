/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DE VERIFICAÇÃO - REFACTORING (CACHE & VALIDATION)
 * ═══════════════════════════════════════════════════════════════════════════
 */

function verifyRefactoring() {
  Logger.log('🚀 Iniciando verificação de refatoração...\n');
  
  verifyAppCache();
  verifyValidationService();
  verifyFormValidationService();
  
  Logger.log('\n✅ FIM DA VERIFICAÇÃO');
}

/**
 * 1. Verifica AppCache
 */
function verifyAppCache() {
  Logger.log('1️⃣ Testando AppCache...');
  
  // Teste Set/Get
  AppCache.put('test_key', { foo: 'bar' }, 60);
  const val = AppCache.get('test_key');
  logCheck('Set/Get Cache', val && val.foo === 'bar');
  
  // Teste Fetcher
  const fetched = AppCache.get('fetch_test', () => 'fetched_val', 60);
  logCheck('Cache Fetch', fetched === 'fetched_val');
  
  // Teste Stats
  const stats = AppCache.getStats();
  logCheck('Cache Stats', stats.l1_items >= 2);
  
  // Teste Legacy via CacheManager
  const leg = CacheManager.get('leg_key', () => 'legacy_works');
  logCheck('Legacy CacheManager Delegation', leg === 'legacy_works');
}

/**
 * 2. Verifica ValidationService (Pure Functions)
 */
function verifyValidationService() {
  Logger.log('\n2️⃣ Testando ValidationService (Pure Functions)...');
  
  logCheck('isValidEmail (valid)', ValidationService.isValidEmail('test@example.com'));
  logCheck('isValidEmail (invalid)', !ValidationService.isValidEmail('test.com'));
  
  logCheck('isValidCoordinates (valid)', ValidationService.isValidCoordinates(-15, -47));
  logCheck('isValidCoordinates (invalid)', !ValidationService.isValidCoordinates(91, 0));
  
  logCheck('isWithinRange', ValidationService.isWithinRange(5, 0, 10));
}

/**
 * 3. Verifica FormValidationService (Integration)
 */
function verifyFormValidationService() {
  Logger.log('\n3️⃣ Testando FormValidationService (Integração)...');
  
  const rules = FormValidation.RULES;
  
  // Teste regra Email (deve usar ValidationService internamente)
  logCheck('Regra Form: Email', rules.email.validate('a@b.com'));
  
  // Teste regra GPS
  logCheck('Regra Form: GPS', rules.gps_lat.validate(-10));
  
  // Teste regra Min
  logCheck('Regra Form: Min', rules.min.validate(10, 5));
}

function logCheck(name, passed) {
  Logger.log(`  ${passed ? '✅' : '❌'} ${name}`);
}
