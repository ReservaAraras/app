/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE DEMO - Demonstracao Completa dos Recursos Enterprise
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este arquivo demonstra o uso integrado de todos os componentes enterprise
 * 
 * @version 1.0.0
 * @enterprise
 */

/**
 * DEMO 1: Dashboard Enterprise Completo
 * Execute esta funcao para ver todos os componentes em acao
 */
function demo1_DashboardCompleto() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  🏢 DASHBOARD ENTERPRISE - SISTEMA RESERVA ARARAS            ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('\n');
  
  // 1. Health Check
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('1. VERIFICACAO DE SAUDE DO SISTEMA');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const health = EnterpriseHealthCheck.checkAll();
  Logger.log('Status Geral: ' + health.status.toUpperCase());
  Logger.log('Checks Executados: ' + health.summary.total);
  Logger.log('Healthy: ' + health.summary.healthy);
  Logger.log('Unhealthy: ' + health.summary.unhealthy);
  Logger.log('\n');
  
  // 2. Metricas
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('2. METRICAS DE PERFORMANCE');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const metrics = EnterpriseMetrics.getAllMetrics();
  Logger.log('Timestamp: ' + metrics.timestamp);
  Logger.log('Counters: ' + Object.keys(metrics.counters).length);
  Logger.log('Gauges: ' + Object.keys(metrics.gauges).length);
  Logger.log('Histograms: ' + Object.keys(metrics.histograms).length);
  Logger.log('\n');
  
  // 3. Configuracao do Logger
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('3. CONFIGURACAO DE LOGGING');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const context = EnterpriseLogger.getContext();
  Logger.log('Request ID: ' + (context.requestId || 'Nenhum'));
  Logger.log('User ID: ' + (context.userId || 'Nenhum'));
  Logger.log('\n');
  
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║  ✅ DASHBOARD CONCLUIDO                                      ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('\n');
}

/**
 * DEMO 2: Operacao com Logging Completo
 * Demonstra logging estruturado com contexto
 */
function demo2_LoggingEstruturado() {
  Logger.log('\n🔹 DEMO: Logging Estruturado\n');
  
  // Inicia request com contexto
  EnterpriseLogger.startRequest({
    userId: 'user_demo_123',
    sessionId: 'sess_abc789',
    metadata: { 
      source: 'demo',
      version: '1.0.0'
    }
  });
  
  // Logs de diferentes niveis
  EnterpriseLogger.debug('Debug info', { step: 1 });
  EnterpriseLogger.info('Processamento iniciado', { records: 100 });
  EnterpriseLogger.warn('Atencao: limite quase atingido', { current: 95, max: 100 });
  
  // Simula erro
  try {
    throw new Error('Erro simulado para demonstracao');
  } catch (error) {
    EnterpriseLogger.error('Erro capturado', { operation: 'demo' }, error);
  }
  
  // Finaliza request (automaticamente loga tempo decorrido)
  EnterpriseLogger.endRequest();
  
  Logger.log('\n✅ Logging concluido - verifique os logs acima\n');
}

/**
 * DEMO 3: Error Handling com Validacao
 * Demonstra validacoes e tratamento de erros
 */
function demo3_ErrorHandling() {
  Logger.log('\n🔹 DEMO: Error Handling\n');
  
  const EH = EnterpriseErrorHandler;
  
  // Exemplo 1: Validacao simples
  try {
    const userData = { 
      email: 'teste@example.com',
      age: 15
    };
    
    EH.assertRequired(userData.nome, 'nome');
    
  } catch (error) {
    const response = EH.handleError(error);
    Logger.log('Erro 1: ' + JSON.stringify(response, null, 2));
  }
  
  // Exemplo 2: Validacao de regra de negocio
  try {
    const order = { items: [] };
    
    EH.assert(
      order.items.length > 0,
      'Pedido deve ter pelo menos 1 item',
      { itemCount: order.items.length }
    );
    
  } catch (error) {
    const response = EH.handleError(error);
    Logger.log('\nErro 2: ' + JSON.stringify(response, null, 2));
  }
  
  // Exemplo 3: Safe execution
  Logger.log('\nExemplo 3: Safe execution\n');
  
  const result = EH.safeExecute(function() {
    return { success: true, data: 'Dados processados' };
  });
  
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  
  Logger.log('\n✅ Error handling concluido\n');
}

/**
 * DEMO 4: Metricas e Performance
 * Demonstra coleta de metricas
 */
function demo4_Metricas() {
  Logger.log('\n🔹 DEMO: Metricas e Performance\n');
  
  // Contadores
  EnterpriseMetrics.incrementCounter('demo_requests', 1);
  EnterpriseMetrics.incrementCounter('demo_requests', 1);
  EnterpriseMetrics.incrementCounter('demo_errors', 1);
  
  // Gauges
  EnterpriseMetrics.setGauge('demo_active_users', 42);
  EnterpriseMetrics.setGauge('demo_queue_size', 15);
  
  // Medicao de tempo
  const result = EnterpriseMetrics.measureTime('demo_operation', function() {
    Utilities.sleep(100); // Simula operacao
    return { processed: 100 };
  });
  
  Logger.log('Operacao concluida: ' + JSON.stringify(result));
  
  // Exibe relatorio
  Logger.log('\n' + EnterpriseMetrics.generateReport());
  
  Logger.log('\n✅ Metricas concluidas\n');
}

/**
 * DEMO 5: Operacao Completa Enterprise
 * Demonstra integracao de todos os componentes
 */
function demo5_OperacaoCompleta() {
  Logger.log('\n🔹 DEMO: Operacao Enterprise Completa\n');
  
  const requestId = EnterpriseLogger.startRequest({
    userId: 'user_enterprise',
    metadata: { operation: 'create_waypoint' }
  });
  
  EnterpriseLogger.info('Iniciando operacao enterprise', {
    requestId: requestId
  });
  
  // Incrementa metricas
  EnterpriseMetrics.incrementCounter('operations_total', 1, {
    type: 'waypoint_create'
  });
  
  try {
    // Validacao
    const waypointData = {
      nome: 'Ponto Demo',
      latitude: -15.234,
      longitude: -47.876,
      categoria: 'demo'
    };
    
    EnterpriseErrorHandler.assertRequired(waypointData.nome, 'nome');
    EnterpriseErrorHandler.assertRequired(waypointData.latitude, 'latitude');
    EnterpriseErrorHandler.assertRequired(waypointData.longitude, 'longitude');
    
    // Operacao com medicao de tempo
    const result = EnterpriseMetrics.measureTime('waypoint_create', function() {
      
      EnterpriseLogger.info('Validacao concluida', {
        waypoint: waypointData.nome
      });
      
      // Simula salvamento
      Utilities.sleep(50);
      
      return {
        id: 'wp_' + Date.now(),
        data: waypointData,
        createdAt: new Date().toISOString()
      };
    });
    
    // Sucesso
    EnterpriseMetrics.incrementCounter('operations_success', 1);
    
    EnterpriseLogger.info('Operacao concluida com sucesso', {
      waypointId: result.id,
      nome: result.data.nome
    });
    
    Logger.log('\nResultado:\n' + JSON.stringify(result, null, 2));
    
  } catch (error) {
    // Erro
    EnterpriseMetrics.incrementCounter('operations_error', 1);
    
    EnterpriseLogger.error('Erro na operacao', {
      operation: 'waypoint_create'
    }, error);
    
    return EnterpriseErrorHandler.handleError(error);
    
  } finally {
    EnterpriseLogger.endRequest();
  }
  
  Logger.log('\n✅ Operacao enterprise concluida\n');
}

/**
 * DEMO 6: Health Checks Customizados
 * Demonstra criacao de health checks
 */
function demo6_HealthChecks() {
  Logger.log('\n🔹 DEMO: Health Checks\n');
  
  // Limpa checks anteriores
  EnterpriseHealthCheck.clearChecks();
  
  // Registra checks padrao
  EnterpriseHealthCheck.registerDefaultChecks();
  
  // Registra check customizado
  EnterpriseHealthCheck.registerCheck('demo_service', function() {
    return {
      healthy: true,
      message: 'Demo service OK',
      details: {
        version: '1.0.0',
        uptime: 3600
      }
    };
  }, { critical: false });
  
  // Executa e exibe relatorio
  Logger.log(EnterpriseHealthCheck.generateReport());
  
  Logger.log('\n✅ Health checks concluidos\n');
}

/**
 * DEMO 7: Circuit Breaker e Retry
 * Demonstra resiliencia com circuit breaker
 */
function demo7_CircuitBreakerRetry() {
  Logger.log('\n🔹 DEMO: Circuit Breaker e Retry\n');
  
  const EH = EnterpriseErrorHandler;
  
  // Exemplo 1: Retry com backoff
  Logger.log('Exemplo 1: Retry com exponential backoff\n');
  
  let attempts = 0;
  
  try {
    const result = EH.withRetry(function() {
      attempts++;
      Logger.log('Tentativa ' + attempts);
      
      if (attempts < 3) {
        throw new Error('Erro temporario');
      }
      
      return { success: true, attempts: attempts };
    }, {
      maxRetries: 3,
      initialDelay: 100
    });
    
    Logger.log('\nSucesso apos ' + result.attempts + ' tentativas');
    
  } catch (error) {
    Logger.log('\nFalhou apos todas as tentativas: ' + error.message);
  }
  
  // Exemplo 2: Circuit Breaker
  Logger.log('\n\nExemplo 2: Circuit Breaker\n');
  
  const breaker = EH.getCircuitBreaker('demo_api', {
    failureThreshold: 3,
    resetTimeout: 5000
  });
  
  // Simula falhas
  for (var i = 1; i <= 5; i++) {
    try {
      breaker.execute(function() {
        if (i <= 3) {
          throw new Error('API indisponivel');
        }
        return { success: true };
      });
      Logger.log('Chamada ' + i + ': Sucesso');
    } catch (error) {
      Logger.log('Chamada ' + i + ': Falhou - ' + error.message);
    }
  }
  
  Logger.log('\n✅ Circuit breaker e retry concluidos\n');
}

/**
 * EXECUTAR TODAS AS DEMOS
 * Execute esta funcao para ver todas as demonstracoes
 */
function executarTodasAsDemos() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║                                                               ║');
  Logger.log('║  🏢 ENTERPRISE FEATURES - DEMONSTRACAO COMPLETA              ║');
  Logger.log('║                                                               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  
  demo1_DashboardCompleto();
  demo2_LoggingEstruturado();
  demo3_ErrorHandling();
  demo4_Metricas();
  demo5_OperacaoCompleta();
  demo6_HealthChecks();
  demo7_CircuitBreakerRetry();
  
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════════╗');
  Logger.log('║                                                               ║');
  Logger.log('║  ✅ TODAS AS DEMOS EXECUTADAS COM SUCESSO                    ║');
  Logger.log('║                                                               ║');
  Logger.log('║  📚 Consulte ENTERPRISE_GUIDE.md para mais informacoes       ║');
  Logger.log('║                                                               ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════╝');
  Logger.log('\n');
}

/**
 * MENU FACIL - Execute funcoes individuais
 */
function menu() {
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('ENTERPRISE DEMOS - MENU');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  Logger.log('Execute qualquer funcao abaixo no Script Editor:\n');
  Logger.log('1. executarTodasAsDemos() - Executa tudo');
  Logger.log('2. demo1_DashboardCompleto() - Dashboard geral');
  Logger.log('3. demo2_LoggingEstruturado() - Logging');
  Logger.log('4. demo3_ErrorHandling() - Erros e validacao');
  Logger.log('5. demo4_Metricas() - Metricas e performance');
  Logger.log('6. demo5_OperacaoCompleta() - Operacao integrada');
  Logger.log('7. demo6_HealthChecks() - Health checks');
  Logger.log('8. demo7_CircuitBreakerRetry() - Resiliencia\n');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
}
