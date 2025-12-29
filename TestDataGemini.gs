/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DADOS SINTÉTICOS PARA TESTE DE ANÁLISES COM GEMINI AI
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este arquivo contém dados de teste para validar todas as funcionalidades
 * que utilizam Gemini Flash no sistema Reserva Araras.
 * 
 * SERVIÇOS TESTADOS:
 * 1. GeminiAIService - Análises ambientais, identificação de espécies, recomendações
 * 2. BiodiversityAIService - Análise de imagens de espécies
 * 3. EcologicalSuccessionAI - Predição de sucessão ecológica
 * 4. PlantDiseaseDetection - Detecção de doenças em plantas
 * 5. InvasiveSpeciesPredictor - Predição de espécies invasoras
 * 6. EcoChatbot - Chatbot educacional
 * 7. CameraTrapService - Detecção de fauna em armadilhas fotográficas
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

const TestDataGemini = {

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DADOS PARA GeminiAIService
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Dados de qualidade da água para análise
   */
  AGUA_SAMPLES: [
    {
      id: 'AGUA_001',
      descricao: 'Nascente principal - condições ideais',
      pH: 7.2,
      oxigenio: 8.5,
      turbidez: 2.3,
      coliformes: 50,
      temperatura: 22.5,
      esperado: 'Qualidade excelente'
    },
    {
      id: 'AGUA_002',
      descricao: 'Córrego após área agrícola - contaminação moderada',
      pH: 6.1,
      oxigenio: 4.2,
      turbidez: 45.0,
      coliformes: 2500,
      temperatura: 26.8,
      esperado: 'Qualidade comprometida, necessita intervenção'
    },
    {
      id: 'AGUA_003',
      descricao: 'Lagoa de vereda - ambiente natural',
      pH: 5.8,
      oxigenio: 6.8,
      turbidez: 12.5,
      coliformes: 180,
      temperatura: 24.0,
      esperado: 'Qualidade boa, pH naturalmente ácido'
    },
    {
      id: 'AGUA_004',
      descricao: 'Ponto crítico - efluente doméstico',
      pH: 7.8,
      oxigenio: 2.1,
      turbidez: 120.0,
      coliformes: 15000,
      temperatura: 28.5,
      esperado: 'Qualidade crítica, ação urgente'
    }
  ],

  /**
   * Dados de qualidade do solo para análise
   */
  SOLO_SAMPLES: [
    {
      id: 'SOLO_001',
      descricao: 'Solo de cerrado nativo preservado',
      pH: 5.2,
      materia_organica: 4.5,
      fosforo: 3.2,
      potassio: 45,
      esperado: 'Solo típico de cerrado, baixa fertilidade natural'
    },
    {
      id: 'SOLO_002',
      descricao: 'Parcela SAF com 5 anos',
      pH: 6.1,
      materia_organica: 6.8,
      fosforo: 12.5,
      potassio: 120,
      esperado: 'Solo em recuperação, boa evolução'
    },
    {
      id: 'SOLO_003',
      descricao: 'Área degradada por pastagem',
      pH: 5.8,
      materia_organica: 1.2,
      fosforo: 2.1,
      potassio: 28,
      esperado: 'Solo degradado, necessita recuperação'
    },
    {
      id: 'SOLO_004',
      descricao: 'Horta orgânica manejada',
      pH: 6.5,
      materia_organica: 8.2,
      fosforo: 45.0,
      potassio: 180,
      esperado: 'Solo fértil, bem manejado'
    }
  ],

  /**
   * Dados climáticos para análise
   */
  CLIMA_SAMPLES: [
    {
      id: 'CLIMA_001',
      descricao: 'Período seco típico (junho-agosto)',
      temp_min: 12,
      temp_max: 32,
      precipitacao: 5,
      umidade: 35,
      dias: 30,
      esperado: 'Estação seca, risco de incêndio'
    },
    {
      id: 'CLIMA_002',
      descricao: 'Início das chuvas (setembro-outubro)',
      temp_min: 18,
      temp_max: 35,
      precipitacao: 120,
      umidade: 55,
      dias: 30,
      esperado: 'Transição, bom para plantio'
    },
    {
      id: 'CLIMA_003',
      descricao: 'Auge das chuvas (dezembro-janeiro)',
      temp_min: 20,
      temp_max: 30,
      precipitacao: 280,
      umidade: 85,
      dias: 30,
      esperado: 'Período chuvoso, atenção a erosão'
    },
    {
      id: 'CLIMA_004',
      descricao: 'Veranico atípico',
      temp_min: 22,
      temp_max: 38,
      precipitacao: 15,
      umidade: 40,
      dias: 15,
      esperado: 'Estresse hídrico, irrigação necessária'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DADOS PARA IDENTIFICAÇÃO DE ESPÉCIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Descrições de espécies para identificação
   */
  ESPECIES_DESCRICOES: [
    {
      id: 'ESP_001',
      tipo: 'flora',
      descricao: 'Árvore de médio porte com casca grossa e cortiçosa, folhas compostas, flores amarelas em cachos, fruto verde com polpa amarela oleosa e espinhos internos',
      esperado: 'Caryocar brasiliense (Pequi)'
    },
    {
      id: 'ESP_002',
      tipo: 'flora',
      descricao: 'Palmeira alta com folhas em leque, tronco coberto por bainhas foliares, frutos alaranjados em cachos densos, típica de áreas alagadas',
      esperado: 'Mauritia flexuosa (Buriti)'
    },
    {
      id: 'ESP_003',
      tipo: 'fauna',
      descricao: 'Canídeo de grande porte com pelagem avermelhada, pernas longas e finas, orelhas grandes, cauda com ponta preta, hábitos noturnos e solitários',
      esperado: 'Chrysocyon brachyurus (Lobo-guará)'
    },
    {
      id: 'ESP_004',
      tipo: 'fauna',
      descricao: 'Ave de grande porte, plumagem azul e amarela, bico curvo e forte, vive em casais, nidifica em ocos de árvores',
      esperado: 'Ara ararauna (Arara-canindé)'
    },
    {
      id: 'ESP_005',
      tipo: 'fauna',
      descricao: 'Mamífero com focinho alongado, língua comprida e pegajosa, pelagem cinza com faixa preta diagonal, cauda grande e peluda',
      esperado: 'Myrmecophaga tridactyla (Tamanduá-bandeira)'
    },
    {
      id: 'ESP_006',
      tipo: 'flora',
      descricao: 'Arbusto com folhas coriáceas, flores brancas perfumadas, frutos verdes que amadurecem amarelos, látex branco',
      esperado: 'Hancornia speciosa (Mangaba)'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DADOS PARA RECOMENDAÇÕES AGROFLORESTAIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Parcelas SAF para recomendações
   */
  PARCELAS_SAF: [
    {
      id: 'SAF_001',
      nome: 'Parcela Nascente',
      tipo_sistema: 'SAF_Cerrado',
      area_ha: 2.5,
      idade_anos: 3,
      especies_principais: 'Pequi, Baru, Cagaita, Mangaba',
      pH_solo: 5.8,
      objetivo: 'Produção de frutos nativos e restauração'
    },
    {
      id: 'SAF_002',
      nome: 'Parcela Demonstrativa',
      tipo_sistema: 'Agrofloresta_Sucessional',
      area_ha: 1.0,
      idade_anos: 7,
      especies_principais: 'Banana, Mandioca, Café, Ingá, Jatobá',
      pH_solo: 6.2,
      objetivo: 'Educação ambiental e produção diversificada'
    },
    {
      id: 'SAF_003',
      nome: 'Parcela Recuperação',
      tipo_sistema: 'Restauração_Ecológica',
      area_ha: 5.0,
      idade_anos: 1,
      especies_principais: 'Lobeira, Barbatimão, Pau-terra',
      pH_solo: 5.2,
      objetivo: 'Recuperação de área degradada'
    },
    {
      id: 'SAF_004',
      nome: 'Parcela Produtiva',
      tipo_sistema: 'SAF_Comercial',
      area_ha: 3.0,
      idade_anos: 10,
      especies_principais: 'Baru, Pequi, Caju, Manga, Citros',
      pH_solo: 6.5,
      objetivo: 'Produção comercial sustentável'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. DADOS PARA SUCESSÃO ECOLÓGICA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Parcelas para análise de sucessão
   */
  SUCESSAO_PARCELAS: [
    {
      id: 'SUC_001',
      nome: 'Área Pioneira',
      area_ha: 2.0,
      idade_anos: 2,
      estagio_atual: 'Pioneira',
      indice_shannon: 1.2,
      riqueza_especies: 15,
      biomassa_ton_ha: 25,
      cobertura_dossel: 25,
      ph_solo: 5.5,
      materia_organica: 2.0,
      precipitacao_anual: 1400
    },
    {
      id: 'SUC_002',
      nome: 'SAF Intermediário',
      area_ha: 3.5,
      idade_anos: 8,
      estagio_atual: 'Intermediária',
      indice_shannon: 2.4,
      riqueza_especies: 35,
      biomassa_ton_ha: 120,
      cobertura_dossel: 60,
      ph_solo: 6.0,
      materia_organica: 4.5,
      precipitacao_anual: 1400
    },
    {
      id: 'SUC_003',
      nome: 'Mata Ciliar Restaurada',
      area_ha: 1.5,
      idade_anos: 15,
      estagio_atual: 'Avançada',
      indice_shannon: 3.1,
      riqueza_especies: 55,
      biomassa_ton_ha: 200,
      cobertura_dossel: 85,
      ph_solo: 5.8,
      materia_organica: 6.2,
      precipitacao_anual: 1500
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. DADOS PARA DETECÇÃO DE DOENÇAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Casos de doenças para diagnóstico
   */
  DOENCAS_CASOS: [
    {
      id: 'DOE_001',
      especie: 'Caryocar brasiliense',
      sintomas: 'Manchas circulares marrons nas folhas com halo amarelo, desfolha parcial',
      parte_afetada: 'folhas',
      esperado: 'Manchas Foliares - severidade baixa'
    },
    {
      id: 'DOE_002',
      especie: 'Musa paradisiaca',
      sintomas: 'Folhas amareladas, murcha progressiva, escurecimento do pseudocaule',
      parte_afetada: 'planta inteira',
      esperado: 'Fusariose (Mal do Panamá) - severidade alta'
    },
    {
      id: 'DOE_003',
      especie: 'Coffea arabica',
      sintomas: 'Pústulas alaranjadas na face inferior das folhas, desfolha severa',
      parte_afetada: 'folhas',
      esperado: 'Ferrugem do café - severidade alta'
    },
    {
      id: 'DOE_004',
      especie: 'Manihot esculenta',
      sintomas: 'Folhas enroladas, presença de insetos pequenos verdes, melado nas folhas',
      parte_afetada: 'folhas',
      esperado: 'Pulgões - severidade média'
    },
    {
      id: 'DOE_005',
      especie: 'Citrus sinensis',
      sintomas: 'Pó branco nas folhas novas, deformação foliar',
      parte_afetada: 'folhas',
      esperado: 'Oídio - severidade média'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DADOS PARA ESPÉCIES INVASORAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Espécies para avaliação de risco de invasão
   */
  INVASORAS_CASOS: [
    {
      id: 'INV_TEST_001',
      nome_cientifico: 'Brachiaria decumbens',
      nome_comum: 'Braquiária',
      tipo: 'Planta',
      origem: 'África',
      taxa_reproducao: 'Muito_Alta',
      tolerancia: 'Ampla',
      dispersao_mecanismo: ['Vento', 'Animal', 'Humano'],
      area_infestada: 5.0,
      pontos_ocorrencia: [
        { lat: -13.45, lng: -46.32 },
        { lat: -13.46, lng: -46.31 },
        { lat: -13.44, lng: -46.33 }
      ],
      esperado: 'Risco Muito Alto'
    },
    {
      id: 'INV_TEST_002',
      nome_cientifico: 'Leucaena leucocephala',
      nome_comum: 'Leucena',
      tipo: 'Planta',
      origem: 'América Central',
      taxa_reproducao: 'Alta',
      tolerancia: 'Ampla',
      dispersao_mecanismo: ['Animal', 'Humano'],
      area_infestada: 0.5,
      pontos_ocorrencia: [
        { lat: -13.47, lng: -46.30 }
      ],
      esperado: 'Risco Alto'
    },
    {
      id: 'INV_TEST_003',
      nome_cientifico: 'Pinus elliottii',
      nome_comum: 'Pinus',
      tipo: 'Planta',
      origem: 'América do Norte',
      taxa_reproducao: 'Alta',
      tolerancia: 'Moderada',
      dispersao_mecanismo: ['Vento'],
      area_infestada: 0.2,
      pontos_ocorrencia: [
        { lat: -13.48, lng: -46.29 }
      ],
      esperado: 'Risco Alto'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. DADOS PARA CHATBOT EDUCACIONAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Perguntas para teste do chatbot
   */
  CHATBOT_PERGUNTAS: [
    {
      id: 'CHAT_001',
      pergunta: 'Olá, bom dia!',
      tipo: 'saudacao',
      esperado: 'Resposta de boas-vindas com apresentação'
    },
    {
      id: 'CHAT_002',
      pergunta: 'Quais animais posso ver na reserva?',
      tipo: 'biodiversidade',
      esperado: 'Lista de fauna com destaque para espécies emblemáticas'
    },
    {
      id: 'CHAT_003',
      pergunta: 'Me fale sobre o lobo-guará',
      tipo: 'especie',
      esperado: 'Informações detalhadas sobre Chrysocyon brachyurus'
    },
    {
      id: 'CHAT_004',
      pergunta: 'Quais trilhas vocês têm?',
      tipo: 'trilha',
      esperado: 'Lista de trilhas com distância e dificuldade'
    },
    {
      id: 'CHAT_005',
      pergunta: 'O que é agrofloresta?',
      tipo: 'agrofloresta',
      esperado: 'Explicação sobre SAF e benefícios'
    },
    {
      id: 'CHAT_006',
      pergunta: 'Como posso ajudar na conservação?',
      tipo: 'conservacao',
      esperado: 'Formas de contribuir para conservação'
    },
    {
      id: 'CHAT_007',
      pergunta: 'Quero fazer um quiz',
      tipo: 'quiz',
      esperado: 'Início de quiz interativo'
    },
    {
      id: 'CHAT_008',
      pergunta: 'Como visitar a reserva?',
      tipo: 'visita',
      esperado: 'Informações de visitação e agendamento'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. DADOS PARA RELATÓRIO INTELIGENTE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Dados de dashboard para relatório
   */
  DASHBOARD_DATA: {
    waypoints: 156,
    fotos: 423,
    trilhas: 8,
    visitantes: 1250,
    parcelas: 12,
    observacoes: 387,
    especies_identificadas: 145,
    alertas_ativos: 3,
    carbono_sequestrado_ton: 245.8
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. DADOS PARA ARMADILHAS FOTOGRÁFICAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Metadados de capturas para detecção de fauna
   */
  CAMERA_TRAP_CAPTURES: [
    {
      id: 'CAM_001',
      camera_id: 'CT_NASCENTE_01',
      timestamp: '2025-12-27T03:45:00',
      temperatura: 18,
      fase_lunar: 'Lua Cheia',
      movimento_detectado: true,
      esperado: 'Possível mamífero noturno'
    },
    {
      id: 'CAM_002',
      camera_id: 'CT_TRILHA_02',
      timestamp: '2025-12-27T14:30:00',
      temperatura: 32,
      fase_lunar: 'Lua Cheia',
      movimento_detectado: true,
      esperado: 'Possível ave ou réptil'
    },
    {
      id: 'CAM_003',
      camera_id: 'CT_VEREDA_01',
      timestamp: '2025-12-27T06:15:00',
      temperatura: 22,
      fase_lunar: 'Lua Cheia',
      movimento_detectado: true,
      esperado: 'Possível mamífero crepuscular'
    }
  ]
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE TESTE - EXECUTAR TODAS AS ANÁLISES COM GEMINI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TESTE PRINCIPAL - Executa todos os testes de análise com Gemini
 * Execute esta função para validar todas as integrações
 */
function runAllGeminiTests() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE COMPLETO DE ANÁLISES COM GEMINI AI');
  Logger.log('    Data: ' + new Date().toLocaleString('pt-BR'));
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  // Verifica configuração do Gemini
  const geminiConfigured = GeminiAIService && GeminiAIService.isConfigured();
  Logger.log(`🔧 Gemini API Configurada: ${geminiConfigured ? 'SIM ✅' : 'NÃO ❌'}\n`);
  
  if (!geminiConfigured) {
    Logger.log('⚠️ ATENÇÃO: GEMINI_API_KEY não configurada!');
    Logger.log('Configure em: Propriedades do Script > GEMINI_API_KEY\n');
  }
  
  // 1. Testes de Análise Ambiental
  Logger.log('\n📊 1. ANÁLISE DE DADOS AMBIENTAIS');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testEnvironmentalAnalysis(results));
  
  // 2. Testes de Identificação de Espécies
  Logger.log('\n🦋 2. IDENTIFICAÇÃO DE ESPÉCIES');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testSpeciesIdentification(results));
  
  // 3. Testes de Recomendações Agroflorestais
  Logger.log('\n🌱 3. RECOMENDAÇÕES AGROFLORESTAIS');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testAgroforestryRecommendations(results));
  
  // 4. Testes de Sucessão Ecológica
  Logger.log('\n🌳 4. ANÁLISE DE SUCESSÃO ECOLÓGICA');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testEcologicalSuccession(results));
  
  // 5. Testes de Detecção de Doenças
  Logger.log('\n🔬 5. DETECÇÃO DE DOENÇAS EM PLANTAS');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testPlantDiseaseDetection(results));
  
  // 6. Testes de Espécies Invasoras
  Logger.log('\n⚠️ 6. PREDIÇÃO DE ESPÉCIES INVASORAS');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testInvasiveSpecies(results));
  
  // 7. Testes do Chatbot
  Logger.log('\n🤖 7. CHATBOT EDUCACIONAL');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testChatbot(results));
  
  // 8. Teste de Relatório Inteligente
  Logger.log('\n📝 8. RELATÓRIO INTELIGENTE');
  Logger.log('─────────────────────────────────────────');
  results.details.push(testSmartReport(results));
  
  // Resumo Final
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('                    RESUMO DOS TESTES');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(`Total de testes: ${results.total}`);
  Logger.log(`✅ Passou: ${results.passed}`);
  Logger.log(`❌ Falhou: ${results.failed}`);
  Logger.log(`⏭️ Pulados: ${results.skipped}`);
  Logger.log(`Taxa de sucesso: ${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0}%`);
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  return results;
}

/**
 * Teste 1: Análise de Dados Ambientais
 */
function testEnvironmentalAnalysis(results) {
  const testResults = { name: 'Análise Ambiental', tests: [] };
  
  // INTERVENÇÃO 2/13: Validação defensiva para results
  if (!results || typeof results !== 'object') {
    results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };
  }
  
  // Teste de água
  TestDataGemini.AGUA_SAMPLES.forEach((sample, index) => {
    results.total = (results.total || 0) + 1;
    try {
      Logger.log(`\n  💧 Teste Água ${index + 1}: ${sample.descricao}`);
      const result = GeminiAIService.analyzeEnvironmentalData(sample, 'agua');
      
      if (result.success) {
        Logger.log(`     ✅ Análise concluída`);
        Logger.log(`     Resultado: ${JSON.stringify(result.analysis).substring(0, 200)}...`);
        results.passed++;
        testResults.tests.push({ id: sample.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error}`);
        results.failed++;
        testResults.tests.push({ id: sample.id, status: 'failed', error: result.error });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed++;
      testResults.tests.push({ id: sample.id, status: 'error', error: e.toString() });
    }
  });
  
  // Teste de solo (apenas 2 amostras para não exceder rate limit)
  TestDataGemini.SOLO_SAMPLES.slice(0, 2).forEach((sample, index) => {
    results.total++;
    try {
      Logger.log(`\n  🌍 Teste Solo ${index + 1}: ${sample.descricao}`);
      const result = GeminiAIService.analyzeEnvironmentalData(sample, 'solo');
      
      if (result.success) {
        Logger.log(`     ✅ Análise concluída`);
        results.passed++;
        testResults.tests.push({ id: sample.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error}`);
        results.failed++;
        testResults.tests.push({ id: sample.id, status: 'failed', error: result.error });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed++;
      testResults.tests.push({ id: sample.id, status: 'error', error: e.toString() });
    }
  });
  
  // Teste de clima (apenas 1 amostra)
  const climaSample = TestDataGemini.CLIMA_SAMPLES[0];
  results.total++;
  try {
    Logger.log(`\n  🌤️ Teste Clima: ${climaSample.descricao}`);
    const result = GeminiAIService.analyzeEnvironmentalData(climaSample, 'clima');
    
    if (result.success) {
      Logger.log(`     ✅ Análise concluída`);
      results.passed++;
      testResults.tests.push({ id: climaSample.id, status: 'passed' });
    } else {
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.failed++;
      testResults.tests.push({ id: climaSample.id, status: 'failed', error: result.error });
    }
  } catch (e) {
    Logger.log(`     ❌ Erro: ${e}`);
    results.failed++;
    testResults.tests.push({ id: climaSample.id, status: 'error', error: e.toString() });
  }
  
  return testResults;
}

/**
 * Teste 2: Identificação de Espécies
 */
function testSpeciesIdentification(results) {
  const testResults = { name: 'Identificação de Espécies', tests: [] };
  
  // Testa apenas 3 espécies para não exceder rate limit
  TestDataGemini.ESPECIES_DESCRICOES.slice(0, 3).forEach((especie, index) => {
    results.total++;
    try {
      Logger.log(`\n  🔍 Teste ${index + 1}: ${especie.tipo} - ${especie.esperado}`);
      const result = GeminiAIService.identifySpecies(especie.descricao, especie.tipo);
      
      if (result.success) {
        Logger.log(`     ✅ Identificação concluída`);
        if (result.identification && result.identification.especies) {
          Logger.log(`     Espécies sugeridas: ${JSON.stringify(result.identification.especies).substring(0, 150)}...`);
        }
        results.passed++;
        testResults.tests.push({ id: especie.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error}`);
        results.failed++;
        testResults.tests.push({ id: especie.id, status: 'failed', error: result.error });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed++;
      testResults.tests.push({ id: especie.id, status: 'error', error: e.toString() });
    }
  });
  
  return testResults;
}

/**
 * Teste 3: Recomendações Agroflorestais
 */
function testAgroforestryRecommendations(results) {
  const testResults = { name: 'Recomendações Agroflorestais', tests: [] };
  
  // Testa 2 parcelas
  TestDataGemini.PARCELAS_SAF.slice(0, 2).forEach((parcela, index) => {
    results.total++;
    try {
      Logger.log(`\n  🌿 Teste ${index + 1}: ${parcela.nome}`);
      Logger.log(`     Tipo: ${parcela.tipo_sistema}, Idade: ${parcela.idade_anos} anos`);
      
      const result = GeminiAIService.getAgroforestryRecommendations(parcela);
      
      if (result.success) {
        Logger.log(`     ✅ Recomendações geradas`);
        if (result.recommendations) {
          Logger.log(`     Preview: ${JSON.stringify(result.recommendations).substring(0, 200)}...`);
        }
        results.passed++;
        testResults.tests.push({ id: parcela.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error}`);
        results.failed++;
        testResults.tests.push({ id: parcela.id, status: 'failed', error: result.error });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed++;
      testResults.tests.push({ id: parcela.id, status: 'error', error: e.toString() });
    }
  });
  
  return testResults;
}

/**
 * Teste 4: Sucessão Ecológica
 */
function testEcologicalSuccession(results) {
  const testResults = { name: 'Sucessão Ecológica', tests: [] };
  
  // Verifica se o serviço existe
  if (typeof EcologicalSuccessionAI === 'undefined') {
    Logger.log('  ⏭️ EcologicalSuccessionAI não disponível');
    results.skipped++;
    return testResults;
  }
  
  // Testa 1 parcela
  const parcela = TestDataGemini.SUCESSAO_PARCELAS[1]; // Intermediária
  results.total++;
  try {
    Logger.log(`\n  🌳 Teste: ${parcela.nome}`);
    Logger.log(`     Estágio atual: ${parcela.estagio_atual}, Shannon: ${parcela.indice_shannon}`);
    
    const result = EcologicalSuccessionAI.analyzeSuccession(parcela.id, {});
    
    if (result.success) {
      Logger.log(`     ✅ Análise de sucessão concluída`);
      Logger.log(`     Predição 5 anos: ${result.predictions?.estagio_5anos || 'N/A'}`);
      Logger.log(`     Tendência: ${result.predictions?.tendencia || 'N/A'}`);
      results.passed++;
      testResults.tests.push({ id: parcela.id, status: 'passed' });
    } else {
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.failed++;
      testResults.tests.push({ id: parcela.id, status: 'failed', error: result.error });
    }
  } catch (e) {
    Logger.log(`     ❌ Erro: ${e}`);
    results.failed++;
    testResults.tests.push({ id: parcela.id, status: 'error', error: e.toString() });
  }
  
  return testResults;
}

/**
 * Teste 5: Detecção de Doenças
 */
function testPlantDiseaseDetection(results) {
  const testResults = { name: 'Detecção de Doenças', tests: [] };
  
  // Verifica se o serviço existe
  if (typeof PlantDiseaseDetection === 'undefined') {
    Logger.log('  ⏭️ PlantDiseaseDetection não disponível');
    results.skipped++;
    return testResults;
  }
  
  // Testa 2 casos (sem imagem, apenas sintomas)
  TestDataGemini.DOENCAS_CASOS.slice(0, 2).forEach((caso, index) => {
    results.total++;
    try {
      Logger.log(`\n  🔬 Teste ${index + 1}: ${caso.especie}`);
      Logger.log(`     Sintomas: ${caso.sintomas.substring(0, 60)}...`);
      
      const result = PlantDiseaseDetection.analyzeImage(null, {
        especie: caso.especie,
        sintomas: caso.sintomas
      });
      
      if (result.success) {
        Logger.log(`     ✅ Diagnóstico: ${result.analysis?.diagnostico?.nome || 'Indefinido'}`);
        Logger.log(`     Severidade: ${result.analysis?.diagnostico?.severidade || 'N/A'}`);
        results.passed++;
        testResults.tests.push({ id: caso.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error}`);
        results.failed++;
        testResults.tests.push({ id: caso.id, status: 'failed', error: result.error });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed++;
      testResults.tests.push({ id: caso.id, status: 'error', error: e.toString() });
    }
  });
  
  return testResults;
}

/**
 * Teste 6: Espécies Invasoras
 */
function testInvasiveSpecies(results) {
  const testResults = { name: 'Espécies Invasoras', tests: [] };
  
  // Verifica se o serviço existe
  if (typeof InvasiveSpeciesPredictor === 'undefined') {
    Logger.log('  ⏭️ InvasiveSpeciesPredictor não disponível');
    results.skipped++;
    return testResults;
  }
  
  // Testa 1 espécie
  const invasora = TestDataGemini.INVASORAS_CASOS[0];
  results.total++;
  try {
    Logger.log(`\n  ⚠️ Teste: ${invasora.nome_comum} (${invasora.nome_cientifico})`);
    
    const result = InvasiveSpeciesPredictor.assessInvasionRisk(invasora);
    
    if (result && result.risk_level) {
      Logger.log(`     ✅ Avaliação concluída`);
      Logger.log(`     Nível de Risco: ${result.risk_level}`);
      Logger.log(`     Score Invasividade: ${result.invasiveness_score}`);
      Logger.log(`     Prob. Estabelecimento: ${(result.establishment_probability * 100).toFixed(1)}%`);
      results.passed++;
      testResults.tests.push({ id: invasora.id, status: 'passed' });
    } else {
      Logger.log(`     ❌ Falha: Resultado inválido`);
      results.failed++;
      testResults.tests.push({ id: invasora.id, status: 'failed' });
    }
  } catch (e) {
    Logger.log(`     ❌ Erro: ${e}`);
    results.failed++;
    testResults.tests.push({ id: invasora.id, status: 'error', error: e.toString() });
  }
  
  return testResults;
}

/**
 * Teste 7: Chatbot Educacional
 */
function testChatbot(results) {
  const testResults = { name: 'Chatbot Educacional', tests: [] };
  
  // INTERVENÇÃO 2/13: Validação defensiva para results
  if (!results || typeof results !== 'object') {
    results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };
  }
  
  // Verifica se o serviço existe
  if (typeof EcoChatbot === 'undefined') {
    Logger.log('  ⏭️ EcoChatbot não disponível');
    results.skipped = (results.skipped || 0) + 1;
    return testResults;
  }
  
  // Testa 3 perguntas
  TestDataGemini.CHATBOT_PERGUNTAS.slice(0, 3).forEach((pergunta, index) => {
    results.total = (results.total || 0) + 1;
    try {
      Logger.log(`\n  🤖 Teste ${index + 1}: "${pergunta.pergunta}"`);
      
      const result = EcoChatbot.processMessage(pergunta.pergunta, {});
      
      if (result.success && result.response) {
        Logger.log(`     ✅ Resposta gerada`);
        Logger.log(`     Tipo: ${result.response.type || result.response.intent || 'geral'}`);
        Logger.log(`     Preview: ${(result.response.text || '').substring(0, 100)}...`);
        results.passed = (results.passed || 0) + 1;
        testResults.tests.push({ id: pergunta.id, status: 'passed' });
      } else {
        Logger.log(`     ❌ Falha: ${result.error || 'Sem resposta'}`);
        results.failed = (results.failed || 0) + 1;
        testResults.tests.push({ id: pergunta.id, status: 'failed' });
      }
    } catch (e) {
      Logger.log(`     ❌ Erro: ${e}`);
      results.failed = (results.failed || 0) + 1;
      testResults.tests.push({ id: pergunta.id, status: 'error', error: e.toString() });
    }
  });
  
  return testResults;
}

/**
 * Teste 8: Relatório Inteligente
 */
function testSmartReport(results) {
  const testResults = { name: 'Relatório Inteligente', tests: [] };
  
  // INTERVENÇÃO 2/13: Validação defensiva para results
  if (!results || typeof results !== 'object') {
    results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };
  }
  
  results.total = (results.total || 0) + 1;
  try {
    Logger.log(`\n  📝 Gerando relatório com dados do dashboard...`);
    
    const result = GeminiAIService.generateSmartReport(TestDataGemini.DASHBOARD_DATA);
    
    if (result.success && result.report) {
      Logger.log(`     ✅ Relatório gerado`);
      Logger.log(`     Preview: ${result.report.substring(0, 200)}...`);
      results.passed = (results.passed || 0) + 1;
      testResults.tests.push({ id: 'REPORT_001', status: 'passed' });
    } else {
      Logger.log(`     ❌ Falha: ${result.error}`);
      results.failed = (results.failed || 0) + 1;
      testResults.tests.push({ id: 'REPORT_001', status: 'failed', error: result.error });
    }
  } catch (e) {
    Logger.log(`     ❌ Erro: ${e}`);
    results.failed = (results.failed || 0) + 1;
    testResults.tests.push({ id: 'REPORT_001', status: 'error', error: e.toString() });
  }
  
  return testResults;
}

/**
 * Teste rápido de conectividade com Gemini
 */
function testGeminiConnection() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE DE CONECTIVIDADE GEMINI AI');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  // Verifica configuração
  const configured = GeminiAIService.isConfigured();
  Logger.log(`🔧 API Key configurada: ${configured ? 'SIM ✅' : 'NÃO ❌'}`);
  
  if (!configured) {
    Logger.log('\n⚠️ Configure GEMINI_API_KEY nas Propriedades do Script');
    return { success: false, error: 'API Key não configurada' };
  }
  
  // Teste simples
  Logger.log('\n📡 Testando conexão...');
  const result = GeminiAIService.callGemini('Responda apenas: OK', { maxTokens: 10 });
  
  if (result.success) {
    Logger.log(`✅ Conexão OK!`);
    Logger.log(`   Modelo: ${result.model}`);
    Logger.log(`   Resposta: ${result.text}`);
    
    // Lista modelos disponíveis
    Logger.log('\n📋 Listando modelos disponíveis...');
    const models = GeminiAIService.listAvailableModels();
    if (models.success) {
      Logger.log(`   Modelos encontrados: ${models.models.length}`);
      models.models.slice(0, 5).forEach(m => {
        Logger.log(`   - ${m.name}: ${m.displayName}`);
      });
    }
    
    return { success: true, model: result.model };
  } else {
    Logger.log(`❌ Falha na conexão: ${result.error}`);
    return { success: false, error: result.error };
  }
}

/**
 * Teste individual de análise de água
 */
function testWaterAnalysis() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE DE ANÁLISE DE QUALIDADE DA ÁGUA');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  TestDataGemini.AGUA_SAMPLES.forEach((sample, index) => {
    Logger.log(`\n💧 Amostra ${index + 1}: ${sample.descricao}`);
    Logger.log(`   pH: ${sample.pH} | O2: ${sample.oxigenio} mg/L | Turbidez: ${sample.turbidez} NTU`);
    Logger.log(`   Coliformes: ${sample.coliformes} NMP/100mL | Temp: ${sample.temperatura}°C`);
    Logger.log(`   Esperado: ${sample.esperado}`);
    
    const result = GeminiAIService.analyzeEnvironmentalData(sample, 'agua');
    
    if (result.success) {
      Logger.log(`   ✅ Análise: ${JSON.stringify(result.analysis, null, 2)}`);
    } else {
      Logger.log(`   ❌ Erro: ${result.error}`);
    }
    
    // Pausa para evitar rate limit
    Utilities.sleep(2000);
  });
}

/**
 * Teste individual de identificação de espécies
 */
function testSpeciesIdentificationDetailed() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('    TESTE DE IDENTIFICAÇÃO DE ESPÉCIES');
  Logger.log('═══════════════════════════════════════════════════════════════\n');
  
  TestDataGemini.ESPECIES_DESCRICOES.forEach((esp, index) => {
    Logger.log(`\n🔍 Espécie ${index + 1} (${esp.tipo})`);
    Logger.log(`   Descrição: ${esp.descricao}`);
    Logger.log(`   Esperado: ${esp.esperado}`);
    
    const result = GeminiAIService.identifySpecies(esp.descricao, esp.tipo);
    
    if (result.success) {
      Logger.log(`   ✅ Identificação: ${JSON.stringify(result.identification, null, 2)}`);
    } else {
      Logger.log(`   ❌ Erro: ${result.error}`);
    }
    
    // Pausa para evitar rate limit
    Utilities.sleep(2000);
  });
}
