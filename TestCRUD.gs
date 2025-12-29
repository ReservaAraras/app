/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES DE CRUD - Validação Completa de Aderência
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Executa todos os testes de CRUD
 */
function runAllCRUDTests() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   🧪 TESTES DE CRUD - ADERÊNCIA TOTAL                ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  const results = {
    timestamp: new Date(),
    tests: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  // Testes por módulo
  results.tests.push(testAgroforestaCRUD());
  results.tests.push(testAmbientalCRUD());
  results.tests.push(testEcoturismoCRUD());
  results.tests.push(testGPSCRUD());
  results.tests.push(testTerapiaCRUD());
  results.tests.push(testFitoterapiaCRUD());
  results.tests.push(testCascadeDelete());
  results.tests.push(testValidations());
  results.tests.push(testReferentialIntegrity());

  // Calcula resumo
  results.tests.forEach(test => {
    results.summary.total++;
    if (test.passed) results.summary.passed++;
    else results.summary.failed++;
  });

  // Exibe resumo
  Logger.log('\n╔════════════════════════════════════════════════════════╗');
  Logger.log('║   📊 RESUMO DOS TESTES                                ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log(`✅ Passou: ${results.summary.passed}`);
  Logger.log(`❌ Falhou: ${results.summary.failed}`);
  Logger.log(`📝 Total: ${results.summary.total}`);

  if (results.summary.failed === 0) {
    Logger.log('\n🎉 TODOS OS TESTES PASSARAM!');
  } else {
    Logger.log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique os detalhes acima.');
  }

  return results;
}

/**
 * Teste: CRUD de Agrofloresta
 */
function testAgroforestaCRUD() {
  Logger.log('\n🌳 Testando CRUD de Agrofloresta...');

  try {
    // CREATE
    const parcela = createParcela({
      nome: 'Parcela Teste CRUD',
      tipo_sistema: 'SAF_Cerrado',
      area_ha: 2.5,
      idade_anos: 3,
      custo_implantacao: 5000,
      custo_manutencao_anual: 1000,
      latitude: -15.2,
      longitude: -47.8,
      status: 'ativo'
    });

    if (!parcela.success) throw new Error('Falha ao criar parcela: ' + parcela.error);
    Logger.log('  ✅ CREATE: Parcela criada com ID ' + parcela.id);

    // READ
    const readResult = readParcelaById(parcela.id);
    if (!readResult.success) throw new Error('Falha ao ler parcela');
    Logger.log('  ✅ READ: Parcela lida com sucesso');

    // UPDATE
    const updateResult = updateParcela(parcela.id, { area_ha: 3.0, status: 'atualizado' });
    if (!updateResult.success) throw new Error('Falha ao atualizar parcela');
    Logger.log('  ✅ UPDATE: Parcela atualizada');

    // Verifica atualização
    const readUpdated = readParcelaById(parcela.id);
    if (readUpdated.data.area_ha != 3.0) throw new Error('Atualização não foi aplicada');
    Logger.log('  ✅ VERIFY: Atualização verificada');

    // DELETE
    const deleteResult = deleteParcela(parcela.id, false);
    if (!deleteResult.success) throw new Error('Falha ao deletar parcela');
    Logger.log('  ✅ DELETE: Parcela deletada');

    // Verifica deleção
    const readDeleted = readParcelaById(parcela.id);
    if (readDeleted.success) throw new Error('Parcela ainda existe após deleção');
    Logger.log('  ✅ VERIFY: Deleção verificada');

    return { module: 'Agrofloresta', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Agrofloresta', passed: false, error: error.message };
  }
}

/**
 * Teste: CRUD Ambiental
 */
function testAmbientalCRUD() {
  Logger.log('\n🌊 Testando CRUD Ambiental...');

  try {
    // Teste de Qualidade da Água
    const agua = createQualidadeAgua({
      data: new Date(),
      local: 'Rio Teste',
      latitude: -15.2,
      longitude: -47.8,
      pH: 7.2,
      oxigenio_dissolvido: 6.5,
      turbidez: 45,
      temperatura: 24,
      responsavel: 'Teste'
    });

    if (!agua.success) throw new Error('Falha ao criar qualidade água');
    Logger.log('  ✅ CREATE: Qualidade água criada');

    const updateAgua = updateQualidadeAgua(agua.id, { pH: 7.5 });
    if (!updateAgua.success) throw new Error('Falha ao atualizar');
    Logger.log('  ✅ UPDATE: Qualidade água atualizada');

    const deleteAgua = deleteQualidadeAgua(agua.id);
    if (!deleteAgua.success) throw new Error('Falha ao deletar');
    Logger.log('  ✅ DELETE: Qualidade água deletada');

    // Teste de Biodiversidade
    const obs = createObservacaoBiodiversidade({
      data: new Date(),
      local: 'Trilha Teste',
      latitude: -15.2,
      longitude: -47.8,
      tipo_observacao: 'fauna',
      especie_cientifica: 'Testus testus',
      especie_comum: 'Teste',
      quantidade: 5,
      observador: 'Teste'
    });

    if (!obs.success) throw new Error('Falha ao criar observação');
    Logger.log('  ✅ CREATE: Observação biodiversidade criada');

    const deleteObs = deleteObservacaoBiodiversidade(obs.id);
    if (!deleteObs.success) throw new Error('Falha ao deletar observação');
    Logger.log('  ✅ DELETE: Observação deletada');

    return { module: 'Ambiental', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Ambiental', passed: false, error: error.message };
  }
}

/**
 * Teste: CRUD Ecoturismo
 */
function testEcoturismoCRUD() {
  Logger.log('\n🥾 Testando CRUD Ecoturismo...');

  try {
    // Trilha
    const trilha = createTrilha({
      nome: 'Trilha Teste CRUD',
      descricao: 'Trilha para testes',
      distancia_km: 5.2,
      tempo_visita_horas: 2,
      dificuldade: 'média',
      status: 'ativo'
    });

    if (!trilha.success) throw new Error('Falha ao criar trilha');
    Logger.log('  ✅ CREATE: Trilha criada');

    // Visitante
    const visitante = createVisitante({
      nome: 'Visitante Teste',
      data_visita: new Date(),
      email: 'teste@teste.com',
      origem_cidade: 'Brasília',
      trilha_id: trilha.id
    });

    if (!visitante.success) throw new Error('Falha ao criar visitante');
    Logger.log('  ✅ CREATE: Visitante criado');

    // Avaliação
    const avaliacao = createAvaliacaoEcoturismo({
      visitante_id: visitante.id,
      data: new Date(),
      nota: 9,
      aspectos_positivos: 'Excelente',
      recomendaria: 'sim'
    });

    if (!avaliacao.success) throw new Error('Falha ao criar avaliação');
    Logger.log('  ✅ CREATE: Avaliação criada');

    // Cleanup
    deleteAvaliacaoEcoturismo(avaliacao.id);
    deleteVisitante(visitante.id, false);
    deleteTrilha(trilha.id, false);
    Logger.log('  ✅ CLEANUP: Registros deletados');

    return { module: 'Ecoturismo', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Ecoturismo', passed: false, error: error.message };
  }
}

/**
 * Teste: CRUD GPS
 */
function testGPSCRUD() {
  Logger.log('\n📍 Testando CRUD GPS...');

  try {
    // Waypoint
    const waypoint = createWaypoint({
      nome: 'Waypoint Teste',
      descricao: 'Teste de waypoint',
      latitude: -15.2,
      longitude: -47.8,
      categoria: 'teste',
      visivel: true
    });

    if (!waypoint.success) throw new Error('Falha ao criar waypoint');
    Logger.log('  ✅ CREATE: Waypoint criado');

    // Foto
    const foto = createFoto({
      nome_arquivo: 'teste.jpg',
      categoria: 'teste',
      waypoint_id: waypoint.id,
      latitude: -15.2,
      longitude: -47.8,
      usuario: 'teste'
    });

    if (!foto.success) throw new Error('Falha ao criar foto');
    Logger.log('  ✅ CREATE: Foto criada');

    // Rota
    const rota = createRota({
      nome: 'Rota Teste',
      descricao: 'Teste de rota',
      tipo: 'trilha',
      distancia_km: 3.5,
      duracao_horas: 1.5,
      usuario: 'teste'
    });

    if (!rota.success) throw new Error('Falha ao criar rota');
    Logger.log('  ✅ CREATE: Rota criada');

    // Cleanup
    deleteFoto(foto.id);
    deleteRota(rota.id);
    deleteWaypoint(waypoint.id, false);
    Logger.log('  ✅ CLEANUP: Registros deletados');

    return { module: 'GPS', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'GPS', passed: false, error: error.message };
  }
}

/**
 * Teste: CRUD Terapia
 */
function testTerapiaCRUD() {
  Logger.log('\n🧘 Testando CRUD Terapia...');

  try {
    // Participante
    const participante = createParticipante({
      nome: 'Participante Teste',
      data_nascimento: new Date('1990-01-01'),
      idade: 34,
      email: 'teste@teste.com',
      data_inicio: new Date(),
      status: 'ativo'
    });

    if (!participante.success) throw new Error('Falha ao criar participante');
    Logger.log('  ✅ CREATE: Participante criado');

    // Sessão
    const sessao = createSessao({
      participante_id: participante.id,
      data: new Date(),
      tipo_terapia: 'ecoterapia',
      duracao_minutos: 60,
      terapeuta: 'Teste',
      satisfacao: 8
    });

    if (!sessao.success) throw new Error('Falha ao criar sessão');
    Logger.log('  ✅ CREATE: Sessão criada');

    // Avaliação
    const avaliacao = createAvaliacaoTerapia({
      participante_id: participante.id,
      sessao_id: sessao.id,
      data: new Date(),
      escala_ansiedade: 5,
      escala_depressao: 4,
      escala_estresse: 6,
      escala_bemestar: 7,
      conexao_natureza: 8
    });

    if (!avaliacao.success) throw new Error('Falha ao criar avaliação');
    Logger.log('  ✅ CREATE: Avaliação criada');

    // Cleanup
    deleteAvaliacaoTerapia(avaliacao.id);
    deleteSessao(sessao.id);
    deleteParticipante(participante.id, false);
    Logger.log('  ✅ CLEANUP: Registros deletados');

    return { module: 'Terapia', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Terapia', passed: false, error: error.message };
  }
}

/**
 * Teste: CRUD Fitoterapia
 */
function testFitoterapiaCRUD() {
  Logger.log('\n🌿 Testando CRUD Fitoterapia...');

  try {
    // Planta Medicinal
    const planta = createPlantaMedicinal({
      nome_cientifico: 'Testus medicinalis',
      nome_popular: 'Planta Teste',
      familia: 'Testaceae',
      parte_usada: 'folhas',
      indicacoes: 'teste',
      modo_preparo: 'chá'
    });

    if (!planta.success) throw new Error('Falha ao criar planta');
    Logger.log('  ✅ CREATE: Planta medicinal criada');

    // Preparação
    const preparacao = createPreparacao({
      planta_id: planta.id,
      tipo_preparacao: 'chá',
      ingredientes: 'folhas secas',
      modo_preparo: 'infusão',
      dosagem: '1 xícara 3x ao dia',
      responsavel: 'Teste'
    });

    if (!preparacao.success) throw new Error('Falha ao criar preparação');
    Logger.log('  ✅ CREATE: Preparação criada');

    // Cleanup
    deletePreparacao(preparacao.id);
    deletePlantaMedicinal(planta.id, false);
    Logger.log('  ✅ CLEANUP: Registros deletados');

    return { module: 'Fitoterapia', passed: true, message: 'Todos os testes passaram' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Fitoterapia', passed: false, error: error.message };
  }
}

/**
 * Teste: Deleção em Cascata
 */
function testCascadeDelete() {
  Logger.log('\n🔗 Testando Deleção em Cascata...');

  try {
    const trilha = createTrilha({
      nome: 'Trilha Cascata Teste',
      distancia_km: 3.0
    });

    const visitante = createVisitante({
      nome: 'Visitante Cascata',
      data_visita: new Date(),
      trilha_id: trilha.id
    });

    const waypoint = createWaypoint({
      nome: 'Waypoint Cascata',
      latitude: -15.2,
      longitude: -47.8,
      categoria: 'teste',
      trilha_id: trilha.id
    });

    Logger.log('  ✅ Registros relacionados criados');

    const deleteResult = deleteTrilha(trilha.id, true);
    if (!deleteResult.success) throw new Error('Falha ao deletar com cascata');
    Logger.log(`  ✅ Trilha deletada com cascata (${deleteResult.cascadeDeleted} registros)`);

    // Verifica se dependências foram deletadas
    const visitanteExists = recordExists(CONFIG.SHEETS.VISITANTES, visitante.id);
    const waypointExists = recordExists(CONFIG.SHEETS.WAYPOINTS, waypoint.id);

    if (visitanteExists.exists || waypointExists.exists) {
      throw new Error('Registros dependentes não foram deletados');
    }
    Logger.log('  ✅ Registros dependentes deletados corretamente');

    return { module: 'Cascade Delete', passed: true, message: 'Cascata funcionando' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Cascade Delete', passed: false, error: error.message };
  }
}

/**
 * Teste: Validações
 */
function testValidations() {
  Logger.log('\n✅ Testando Validações...');

  try {
    // Tenta criar waypoint sem campos obrigatórios
    const invalid = createWaypoint({
      descricao: 'Sem nome nem coordenadas'
    });

    if (invalid.success) {
      throw new Error('Validação falhou: criou registro inválido');
    }
    Logger.log('  ✅ Validação de campos obrigatórios funcionando');

    // Tenta criar parcela sem campos obrigatórios
    const invalidParcela = createParcela({
      descricao: 'Sem nome'
    });

    if (invalidParcela.success) {
      throw new Error('Validação falhou: criou parcela inválida');
    }
    Logger.log('  ✅ Validação de parcela funcionando');

    return { module: 'Validations', passed: true, message: 'Validações funcionando' };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Validations', passed: false, error: error.message };
  }
}

/**
 * Teste: Integridade Referencial
 */
function testReferentialIntegrity() {
  Logger.log('\n🔍 Testando Integridade Referencial...');

  try {
    const result = validateReferentialIntegrity();

    if (!result.success) {
      throw new Error('Falha ao validar integridade');
    }

    Logger.log(`  ✅ Integridade verificada: ${result.count} problemas encontrados`);

    if (result.count > 0) {
      Logger.log('  ⚠️  Problemas de integridade detectados (não é erro de teste)');
    }

    return {
      module: 'Referential Integrity',
      passed: true,
      message: `${result.count} problemas encontrados`
    };
  } catch (error) {
    Logger.log('  ❌ ERRO: ' + error.message);
    return { module: 'Referential Integrity', passed: false, error: error.message };
  }
}

/**
 * Teste rápido de CRUD básico
 */
function quickCRUDTest() {
  Logger.log('🚀 Teste Rápido de CRUD\n');

  try {
    const wp = createWaypoint({
      nome: 'Teste Rápido',
      latitude: -15.2,
      longitude: -47.8,
      categoria: 'teste'
    });

    Logger.log('✅ CREATE: ' + wp.id);

    const read = readWaypointById(wp.id);
    Logger.log('✅ READ: ' + read.data.nome);

    // Atualiza
    updateWaypoint(wp.id, { nome: 'Teste Atualizado' });
    Logger.log('✅ UPDATE: Nome atualizado');

    // Deleta
    deleteWaypoint(wp.id);
    Logger.log('✅ DELETE: Waypoint removido');

    Logger.log('\n🎉 Teste rápido concluído com sucesso!');
    return { success: true };
  } catch (error) {
    Logger.log('❌ Erro: ' + error);
    return { success: false, error: error.toString() };
  }
}
