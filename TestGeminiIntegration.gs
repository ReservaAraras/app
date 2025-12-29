/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DE INTEGRAÇÃO GEMINI AI - CASOS DE USO MULTI-PERFIL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testes profissionais para validar funcionalidades Gemini AI
 * explorando inter-relações entre perfis de usuário:
 * - APOIADOR, SANITARISTA, AMBIENTALISTA, TRILHEIRO, ECOTURISTA
 * 
 * @version 1.0.0
 * @date 2025-12-27
 */

const TestGeminiIntegration = {
  
  /**
   * Perfis de usuário para teste
   */
  PERFIS: {
    APOIADOR: { nome: 'João Apoiador', nivel: 'executivo', foco: 'impacto' },
    SANITARISTA: { nome: 'Dra. Lucia Barros', nivel: 'tecnico', foco: 'qualidade_agua' },
    AMBIENTALISTA: { nome: 'Carlos Silva', nivel: 'cientifico', foco: 'biodiversidade' },
    TRILHEIRO: { nome: 'Marcos Trekking', nivel: 'pratico', foco: 'navegacao' },
    ECOTURISTA: { nome: 'Ana Turista', nivel: 'iniciante', foco: 'experiencia' }
  },

  /**
   * Executa todos os testes de integração
   */
  runAllTests: function() {
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('🧪 INICIANDO TESTES DE INTEGRAÇÃO GEMINI AI');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    const resultados = {
      total: 0,
      sucesso: 0,
      falha: 0,
      testes: []
    };
    
    // Verifica configuração
    const configOk = this._testConfiguracao(resultados);
    if (!configOk) {
      Logger.log('\n❌ GEMINI_API_KEY não configurada. Testes abortados.');
      return resultados;
    }
    
    // Testes por caso de uso
    this._testCasoUso1_IdentificacaoEspecie(resultados);
    this._testCasoUso2_AlertaAmbiental(resultados);
    this._testCasoUso3_ChatbotMultiPerfil(resultados);
    this._testCasoUso4_RecomendacaoAgroflorestal(resultados);
    this._testCasoUso5_RelatorioInteligente(resultados);
    this._testCasoUso6_PerguntaContextual(resultados);
    
    // Resumo
    this._gerarResumo(resultados);
    
    return resultados;
  },

  /**
   * Testa configuração do Gemini
   */
  _testConfiguracao: function(resultados) {
    Logger.log('📋 Teste 0: Verificando configuração Gemini...');
    resultados.total++;
    
    try {
      const config = apiCheckGeminiConfig();
      
      if (config.success && config.configured) {
        Logger.log('   ✅ GEMINI_API_KEY configurada');
        resultados.sucesso++;
        resultados.testes.push({ nome: 'Configuração Gemini', status: 'OK' });
        return true;
      } else {
        Logger.log('   ❌ GEMINI_API_KEY não encontrada');
        Logger.log('   💡 Configure em: Propriedades do Script > GEMINI_API_KEY');
        resultados.falha++;
        resultados.testes.push({ nome: 'Configuração Gemini', status: 'FALHA', erro: 'API Key não configurada' });
        return false;
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ nome: 'Configuração Gemini', status: 'ERRO', erro: error.toString() });
      return false;
    }
  },

  /**
   * CASO DE USO 1: Identificação de Espécie Colaborativo
   * Perfis: ECOTURISTA → TRILHEIRO → AMBIENTALISTA
   */
  _testCasoUso1_IdentificacaoEspecie: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('🦜 CASO DE USO 1: Identificação de Espécie Colaborativo');
    Logger.log('   Perfis: ECOTURISTA → TRILHEIRO → AMBIENTALISTA');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    // Teste 1.1: TRILHEIRO identifica espécie por descrição
    Logger.log('📋 Teste 1.1: TRILHEIRO identifica espécie por descrição...');
    resultados.total++;
    
    try {
      const descricao = 'Ave grande, azul e amarela, bico curvo preto, vista na copa das árvores próximo à nascente';
      const resultado = apiIdentifySpeciesAI(descricao, 'fauna');
      
      if (resultado.success) {
        Logger.log('   ✅ Identificação realizada com sucesso');
        Logger.log('   📊 Resposta: ' + (resultado.identification?.especies?.[0] || resultado.raw_text?.substring(0, 100)));
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Identificação Espécie (TRILHEIRO)', 
          status: 'OK',
          perfil: 'TRILHEIRO'
        });
      } else {
        throw new Error(resultado.error || 'Falha na identificação');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Identificação Espécie (TRILHEIRO)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'TRILHEIRO'
      });
    }
    
    // Teste 1.2: AMBIENTALISTA solicita análise ecológica
    Logger.log('\n📋 Teste 1.2: AMBIENTALISTA solicita análise ecológica...');
    resultados.total++;
    
    try {
      const pergunta = 'Qual a importância ecológica da Arara-canindé (Ara ararauna) para o Cerrado?';
      const contexto = { zona: 'Nascente Principal', bioma: 'Cerrado' };
      const resultado = apiAskQuestionAI(pergunta, contexto);
      
      if (resultado.success && resultado.answer) {
        Logger.log('   ✅ Análise ecológica gerada');
        Logger.log('   📊 Resposta: ' + resultado.answer.substring(0, 150) + '...');
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Análise Ecológica (AMBIENTALISTA)', 
          status: 'OK',
          perfil: 'AMBIENTALISTA'
        });
      } else {
        throw new Error(resultado.error || 'Falha na análise');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Análise Ecológica (AMBIENTALISTA)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'AMBIENTALISTA'
      });
    }
  },

  /**
   * CASO DE USO 2: Alerta Ambiental Integrado
   * Perfis: SANITARISTA → AMBIENTALISTA → TRILHEIRO
   */
  _testCasoUso2_AlertaAmbiental: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('💧 CASO DE USO 2: Alerta Ambiental Integrado');
    Logger.log('   Perfis: SANITARISTA → AMBIENTALISTA → TRILHEIRO');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    // Teste 2.1: SANITARISTA analisa qualidade da água
    Logger.log('📋 Teste 2.1: SANITARISTA analisa qualidade da água...');
    resultados.total++;
    
    try {
      const dadosAgua = {
        pH: 4.2,           // Muito ácido - alerta!
        oxigenio: 3.5,     // Baixo
        turbidez: 45,      // Elevada
        coliformes: 2400,  // Alto
        temperatura: 28
      };
      
      const resultado = apiAnalyzeEnvironmentalDataAI(dadosAgua, 'agua');
      
      if (resultado.success) {
        Logger.log('   ✅ Análise de água realizada');
        const prioridade = resultado.analysis?.prioridade || 'não definida';
        Logger.log('   📊 Prioridade detectada: ' + prioridade);
        Logger.log('   📊 Avaliação: ' + (resultado.analysis?.avaliacao || resultado.raw_text?.substring(0, 100)));
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Análise Água (SANITARISTA)', 
          status: 'OK',
          perfil: 'SANITARISTA',
          dados: { prioridade }
        });
      } else {
        throw new Error(resultado.error || 'Falha na análise');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Análise Água (SANITARISTA)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'SANITARISTA'
      });
    }
    
    // Teste 2.2: AMBIENTALISTA consulta impacto na fauna
    Logger.log('\n📋 Teste 2.2: AMBIENTALISTA consulta impacto na fauna...');
    resultados.total++;
    
    try {
      const pergunta = 'Quais espécies de peixes do Cerrado são mais sensíveis a pH abaixo de 5 e baixo oxigênio dissolvido?';
      const resultado = apiAskQuestionAI(pergunta, { tipo: 'impacto_fauna' });
      
      if (resultado.success && resultado.answer) {
        Logger.log('   ✅ Consulta de impacto realizada');
        Logger.log('   📊 Resposta: ' + resultado.answer.substring(0, 150) + '...');
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Impacto Fauna (AMBIENTALISTA)', 
          status: 'OK',
          perfil: 'AMBIENTALISTA'
        });
      } else {
        throw new Error(resultado.error || 'Falha na consulta');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Impacto Fauna (AMBIENTALISTA)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'AMBIENTALISTA'
      });
    }
  },

  /**
   * CASO DE USO 3: Chatbot Multi-Perfil
   * Testa adaptação de respostas por perfil
   */
  _testCasoUso3_ChatbotMultiPerfil: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('🤖 CASO DE USO 3: Chatbot Educacional Multi-Perfil');
    Logger.log('   Testa adaptação de respostas por nível de conhecimento');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    // Teste 3.1: ECOTURISTA pergunta sobre lobo-guará
    Logger.log('📋 Teste 3.1: ECOTURISTA pergunta sobre lobo-guará...');
    resultados.total++;
    
    try {
      const resultado = apiChatbotMessage('Fale sobre o lobo-guará', { 
        nivel: 'Iniciante',
        perfil: 'ECOTURISTA'
      });
      
      if (resultado.success && resultado.response) {
        Logger.log('   ✅ Resposta do chatbot recebida');
        Logger.log('   📊 Tipo: ' + resultado.response.type);
        Logger.log('   📊 Texto: ' + resultado.response.text?.substring(0, 150) + '...');
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Chatbot (ECOTURISTA)', 
          status: 'OK',
          perfil: 'ECOTURISTA'
        });
      } else {
        throw new Error(resultado.error || 'Falha no chatbot');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Chatbot (ECOTURISTA)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'ECOTURISTA'
      });
    }
    
    // Teste 3.2: Quiz interativo
    Logger.log('\n📋 Teste 3.2: Quiz interativo do chatbot...');
    resultados.total++;
    
    try {
      const resultado = apiChatbotMessage('Quero fazer um quiz', {});
      
      if (resultado.success && resultado.response?.type === 'quiz') {
        Logger.log('   ✅ Quiz iniciado com sucesso');
        Logger.log('   📊 Pergunta: ' + resultado.response.text?.substring(0, 100) + '...');
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Quiz Chatbot', 
          status: 'OK'
        });
      } else {
        throw new Error('Quiz não iniciado corretamente');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Quiz Chatbot', 
        status: 'FALHA', 
        erro: error.toString()
      });
    }
  },

  /**
   * CASO DE USO 4: Recomendação Agroflorestal
   * Perfil: AMBIENTALISTA
   */
  _testCasoUso4_RecomendacaoAgroflorestal: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('🌱 CASO DE USO 4: Recomendação Agroflorestal');
    Logger.log('   Perfil: AMBIENTALISTA');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    Logger.log('📋 Teste 4.1: Gerar recomendações para parcela SAF...');
    resultados.total++;
    
    try {
      const dadosParcela = {
        tipo_sistema: 'SAF_Cerrado',
        area_ha: 2.5,
        idade_anos: 3,
        especies_principais: 'Pequi, Baru, Cagaita, Jatobá',
        pH_solo: 5.8
      };
      
      const resultado = apiGetAgroforestryRecommendationsAI(dadosParcela);
      
      if (resultado.success) {
        Logger.log('   ✅ Recomendações geradas com sucesso');
        Logger.log('   📊 Parcela: ' + resultado.parcela?.tipo + ' - ' + resultado.parcela?.area + ' ha');
        
        if (resultado.recommendations) {
          const rec = resultado.recommendations;
          Logger.log('   📊 Espécies complementares: ' + (rec.especies_complementares || 'N/A'));
          Logger.log('   📊 Carbono: ' + (rec.carbono?.substring(0, 80) || 'N/A'));
        }
        
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Recomendação SAF (AMBIENTALISTA)', 
          status: 'OK',
          perfil: 'AMBIENTALISTA'
        });
      } else {
        throw new Error(resultado.error || 'Falha nas recomendações');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Recomendação SAF (AMBIENTALISTA)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'AMBIENTALISTA'
      });
    }
  },

  /**
   * CASO DE USO 5: Relatório Inteligente
   * Perfil: APOIADOR
   */
  _testCasoUso5_RelatorioInteligente: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('📊 CASO DE USO 5: Relatório Inteligente para APOIADOR');
    Logger.log('   Perfil: APOIADOR');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    Logger.log('📋 Teste 5.1: Gerar relatório executivo...');
    resultados.total++;
    
    try {
      const resultado = apiGenerateSmartReport();
      
      if (resultado.success && resultado.report) {
        Logger.log('   ✅ Relatório gerado com sucesso');
        Logger.log('   📊 Prévia: ' + resultado.report.substring(0, 200) + '...');
        resultados.sucesso++;
        resultados.testes.push({ 
          nome: 'Relatório Executivo (APOIADOR)', 
          status: 'OK',
          perfil: 'APOIADOR'
        });
      } else {
        throw new Error(resultado.error || 'Falha no relatório');
      }
    } catch (error) {
      Logger.log('   ❌ Erro: ' + error);
      resultados.falha++;
      resultados.testes.push({ 
        nome: 'Relatório Executivo (APOIADOR)', 
        status: 'FALHA', 
        erro: error.toString(),
        perfil: 'APOIADOR'
      });
    }
  },

  /**
   * CASO DE USO 6: Pergunta Contextual
   * Todos os perfis
   */
  _testCasoUso6_PerguntaContextual: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('❓ CASO DE USO 6: Perguntas Contextuais por Perfil');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    const perguntas = [
      { perfil: 'TRILHEIRO', pergunta: 'Qual a melhor época para observar araras na Trilha da Nascente?' },
      { perfil: 'SANITARISTA', pergunta: 'Quais parâmetros de água indicam contaminação por agrotóxicos?' },
      { perfil: 'APOIADOR', pergunta: 'Quanto CO2 uma árvore de Pequi sequestra por ano?' }
    ];
    
    perguntas.forEach((item, index) => {
      Logger.log(`\n📋 Teste 6.${index + 1}: Pergunta do ${item.perfil}...`);
      resultados.total++;
      
      try {
        const resultado = apiAskQuestionAI(item.pergunta, { perfil: item.perfil });
        
        if (resultado.success && resultado.answer) {
          Logger.log('   ✅ Resposta recebida');
          Logger.log('   📊 Resposta: ' + resultado.answer.substring(0, 120) + '...');
          resultados.sucesso++;
          resultados.testes.push({ 
            nome: `Pergunta Contextual (${item.perfil})`, 
            status: 'OK',
            perfil: item.perfil
          });
        } else {
          throw new Error(resultado.error || 'Sem resposta');
        }
      } catch (error) {
        Logger.log('   ❌ Erro: ' + error);
        resultados.falha++;
        resultados.testes.push({ 
          nome: `Pergunta Contextual (${item.perfil})`, 
          status: 'FALHA', 
          erro: error.toString(),
          perfil: item.perfil
        });
      }
    });
  },

  /**
   * Gera resumo dos testes
   */
  _gerarResumo: function(resultados) {
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('📊 RESUMO DOS TESTES DE INTEGRAÇÃO GEMINI AI');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    Logger.log(`Total de testes: ${resultados.total}`);
    Logger.log(`✅ Sucesso: ${resultados.sucesso}`);
    Logger.log(`❌ Falha: ${resultados.falha}`);
    Logger.log(`📈 Taxa de sucesso: ${((resultados.sucesso / resultados.total) * 100).toFixed(1)}%`);
    
    // Resumo por perfil
    Logger.log('\n📋 Resultados por Perfil:');
    const porPerfil = {};
    resultados.testes.forEach(t => {
      const perfil = t.perfil || 'GERAL';
      if (!porPerfil[perfil]) porPerfil[perfil] = { ok: 0, falha: 0 };
      if (t.status === 'OK') porPerfil[perfil].ok++;
      else porPerfil[perfil].falha++;
    });
    
    Object.entries(porPerfil).forEach(([perfil, stats]) => {
      const emoji = stats.falha === 0 ? '✅' : '⚠️';
      Logger.log(`   ${emoji} ${perfil}: ${stats.ok} OK, ${stats.falha} falhas`);
    });
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('🏁 TESTES FINALIZADOS');
    Logger.log('═══════════════════════════════════════════════════════════════');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES EXPOSTAS PARA EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Executa todos os testes de integração Gemini
 * Pode ser chamado diretamente do Editor do Apps Script
 */
function runGeminiIntegrationTests() {
  return TestGeminiIntegration.runAllTests();
}

/**
 * Teste rápido de conectividade Gemini
 */
function testGeminiQuick() {
  Logger.log('🔍 Teste rápido de conectividade Gemini...\n');
  
  const config = apiCheckGeminiConfig();
  Logger.log('Configuração: ' + JSON.stringify(config, null, 2));
  
  if (config.configured) {
    Logger.log('\n📝 Testando chamada simples...');
    const resultado = apiAskQuestionAI('Olá, você está funcionando?', {});
    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));
  }
  
  return config;
}

/**
 * Lista modelos Gemini disponíveis
 */
function listGeminiModels() {
  Logger.log('📋 Listando modelos Gemini disponíveis...\n');
  
  const resultado = GeminiAIService.listAvailableModels();
  
  if (resultado.success) {
    resultado.models.forEach(model => {
      Logger.log(`• ${model.name}: ${model.displayName}`);
    });
  } else {
    Logger.log('Erro: ' + resultado.error);
  }
  
  return resultado;
}
