/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXEMPLOS PRÁTICOS DE USO DO CRUD
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Exemplo 1: Cadastro Completo de Trilha com Waypoints
 */
function exemplo1_TrilhaComWaypoints() {
  Logger.log('📍 Exemplo 1: Cadastro de Trilha com Waypoints\n');

  // 1. Cria a trilha
  const trilha = createTrilha({
    nome: 'Trilha do Cerrado',
    descricao: 'Trilha interpretativa pelo cerrado nativo',
    distancia_km: 3.5,
    largura_m: 1.5,
    tempo_visita_horas: 1.5,
    dificuldade: 'fácil',
    elevacao_m: 50,
    tipo_terreno: 'terra batida',
    pontos_interesse: 'Flora nativa, mirante, nascente',
    melhor_epoca: 'abril a setembro',
    latitude_inicio: -15.234567,
    longitude_inicio: -47.876543,
    status: 'ativo'
  });

  Logger.log('✅ Trilha criada: ' + trilha.id);

  // 2. Adiciona waypoints ao longo da trilha
  const waypoints = [
    {
      nome: 'Início da Trilha',
      descricao: 'Ponto de partida com placa informativa',
      latitude: -15.234567,
      longitude: -47.876543,
      categoria: 'inicio',
      trilha_id: trilha.id
    },
    {
      nome: 'Mirante do Cerrado',
      descricao: 'Vista panorâmica da reserva',
      latitude: -15.235000,
      longitude: -47.877000,
      categoria: 'mirante',
      trilha_id: trilha.id
    },
    {
      nome: 'Nascente',
      descricao: 'Nascente de água cristalina',
      latitude: -15.235500,
      longitude: -47.877500,
      categoria: 'agua',
      trilha_id: trilha.id
    }
  ];

  waypoints.forEach(wp => {
    const result = createWaypoint(wp);
    Logger.log('  ✅ Waypoint criado: ' + result.data.nome);
  });

  Logger.log('\n🎉 Trilha completa cadastrada com ' + waypoints.length + ' waypoints!');

  return { trilha: trilha, waypoints: waypoints.length };
}

/**
 * Exemplo 2: Monitoramento de Qualidade da Água com Análise
 */
function exemplo2_MonitoramentoAgua() {
  Logger.log('🌊 Exemplo 2: Monitoramento de Qualidade da Água\n');

  // 1. Registra medição
  const medicao = createQualidadeAgua({
    data: new Date(),
    local: 'Rio São Mateus - Ponto 1',
    latitude: -15.240000,
    longitude: -47.880000,
    pH: 7.2,
    oxigenio_dissolvido: 6.8,
    turbidez: 35,
    temperatura: 23,
    nitrogenio_total: 0.8,
    fosforo_total: 0.05,
    coliformes_termotolerantes: 450,
    solidos_totais: 120,
    condutividade: 85,
    responsavel: 'Equipe Ambiental'
  });

  Logger.log('✅ Medição registrada: ' + medicao.id);

  // 2. Analisa qualidade
  const analise = EnvironmentalService.calculateWaterQualityIndex(medicao.id);

  Logger.log('\n📊 Análise de Qualidade:');
  Logger.log('  IQA: ' + analise.iqa.valor);
  Logger.log('  Classificação: ' + analise.iqa.classificacao);
  Logger.log('  Conforme CONAMA 357: ' + (analise.conformidade.conama357 ? 'SIM' : 'NÃO'));

  if (analise.recomendacoes.length > 0) {
    Logger.log('\n💡 Recomendações:');
    analise.recomendacoes.forEach(rec => Logger.log('  - ' + rec));
  }

  return analise;
}

/**
 * Exemplo 3: Programa de Terapia com Natureza
 */
function exemplo3_ProgramaTerapia() {
  Logger.log('🧘 Exemplo 3: Programa de Terapia com Natureza\n');

  // 1. Cadastra participante
  const participante = createParticipante({
    nome: 'Maria Silva',
    data_nascimento: new Date('1980-03-15'),
    idade: 44,
    genero: 'feminino',
    email: 'maria@email.com',
    telefone: '(61) 98765-4321',
    cidade: 'Brasília',
    estado: 'DF',
    data_inicio: new Date(),
    condicao_principal: 'ansiedade',
    condicoes_secundarias: 'insônia',
    status: 'ativo'
  });

  Logger.log('✅ Participante cadastrado: ' + participante.id);

  // 2. Registra avaliação inicial
  const avaliacaoInicial = createAvaliacaoTerapia({
    participante_id: participante.id,
    data: new Date(),
    escala_ansiedade: 8,
    escala_depressao: 6,
    escala_estresse: 9,
    escala_bemestar: 4,
    conexao_natureza: 3,
    qualidade_sono: 3,
    nivel_energia: 4,
    avaliador: 'Dr. Pedro Santos'
  });

  Logger.log('✅ Avaliação inicial registrada');

  // 3. Simula 4 sessões de terapia
  const sessoes = [];
  for (let i = 1; i <= 4; i++) {
    const data = new Date();
    data.setDate(data.getDate() - (30 - i * 7)); // Sessões semanais

    const sessao = createSessao({
      participante_id: participante.id,
      data: data,
      tipo_terapia: 'ecoterapia',
      local: 'Trilha do Cerrado',
      duracao_minutos: 90,
      terapeuta: 'Dr. Pedro Santos',
      atividades: 'Caminhada contemplativa, exercícios de respiração',
      satisfacao: 7 + i, // Satisfação crescente
      humor_antes: 5,
      humor_depois: 7 + i
    });

    sessoes.push(sessao);
    Logger.log(`  ✅ Sessão ${i} registrada`);
  }

  // 4. Registra avaliação final
  const avaliacaoFinal = createAvaliacaoTerapia({
    participante_id: participante.id,
    data: new Date(),
    escala_ansiedade: 4,
    escala_depressao: 3,
    escala_estresse: 5,
    escala_bemestar: 8,
    conexao_natureza: 9,
    qualidade_sono: 7,
    nivel_energia: 8,
    avaliador: 'Dr. Pedro Santos'
  });

  Logger.log('✅ Avaliação final registrada');

  // 5. Analisa progresso
  const progresso = TherapyService.calculateWellbeingIndex(participante.id);

  Logger.log('\n📊 Análise de Progresso:');
  Logger.log('  Índice Inicial: ' + progresso.indices.inicial);
  Logger.log('  Índice Final: ' + progresso.indices.final);
  Logger.log('  Melhoria: ' + progresso.indices.melhoria + ' pontos');
  Logger.log('  Classificação: ' + progresso.classificacao);

  Logger.log('\n📈 Evolução:');
  Logger.log('  Ansiedade: ' + progresso.evolucao.ansiedade.inicial + ' → ' + progresso.evolucao.ansiedade.final);
  Logger.log('  Bem-estar: ' + progresso.evolucao.bemestar.inicial + ' → ' + progresso.evolucao.bemestar.final);

  return progresso;
}

/**
 * Exemplo 4: Sistema Agroflorestal com Análise de Carbono
 */
function exemplo4_SistemaAgroflorestal() {
  Logger.log('🌳 Exemplo 4: Sistema Agroflorestal\n');

  // 1. Cadastra parcela
  const parcela = createParcela({
    nome: 'SAF Cerrado - Parcela 1',
    tipo_sistema: 'SAF_Cerrado',
    area_ha: 2.5,
    idade_anos: 5,
    custo_implantacao: 8000,
    custo_manutencao_anual: 1500,
    localizacao: 'Setor Norte',
    responsavel: 'João Oliveira',
    latitude: -15.250000,
    longitude: -47.890000,
    status: 'produtivo'
  });

  Logger.log('✅ Parcela cadastrada: ' + parcela.id);

  // 2. Registra produções
  const produtos = [
    { produto: 'Pequi', quantidade_kg: 150, valor_reais: 750 },
    { produto: 'Baru', quantidade_kg: 80, valor_reais: 640 },
    { produto: 'Jatobá', quantidade_kg: 45, valor_reais: 270 }
  ];

  produtos.forEach(prod => {
    const producao = createProducao({
      parcela_id: parcela.id,
      data: new Date(),
      produto: prod.produto,
      quantidade_kg: prod.quantidade_kg,
      valor_reais: prod.valor_reais,
      qualidade: 'boa',
      destino: 'comercialização'
    });
    Logger.log(`  ✅ Produção registrada: ${prod.produto} - ${prod.quantidade_kg}kg`);
  });

  // 3. Calcula sequestro de carbono
  const carbono = AgroforestryService.calculateCarbonSequestration(parcela.id);

  Logger.log('\n🌍 Sequestro de Carbono:');
  Logger.log('  Carbono Total: ' + carbono.carbono.carbonoTotal + ' tC');
  Logger.log('  CO2 Equivalente: ' + carbono.carbono.co2Equivalente + ' tCO2e');
  Logger.log('  Sequestro Anual: ' + carbono.carbono.sequestroAnual + ' tCO2e/ano');
  Logger.log('\n💡 Equivalências:');
  Logger.log('  Carros: ' + carbono.comparacao.equivalenteCarros + ' carros/ano');
  Logger.log('  Árvores: ' + carbono.comparacao.equivalenteArvores + ' árvores');

  // 4. Análise econômica
  const economia = AgroforestryService.analyzeEconomicViability(parcela.id);

  Logger.log('\n💰 Viabilidade Econômica:');
  Logger.log('  ROI: ' + economia.indicadores.roi);
  Logger.log('  Payback: ' + economia.indicadores.payback);
  Logger.log('  Viável: ' + (economia.indicadores.viavel ? 'SIM' : 'NÃO'));

  return { carbono: carbono, economia: economia };
}

/**
 * Exemplo 5: Gestão de Visitantes e NPS
 */
function exemplo5_GestaoVisitantes() {
  Logger.log('🥾 Exemplo 5: Gestão de Visitantes e NPS\n');

  // 1. Busca trilhas disponíveis
  const trilhas = readTrilhas({ status: 'ativo' });
  Logger.log('📍 Trilhas disponíveis: ' + trilhas.count);

  if (trilhas.count === 0) {
    Logger.log('⚠️  Nenhuma trilha cadastrada. Execute exemplo1_TrilhaComWaypoints() primeiro.');
    return;
  }

  const trilha = trilhas.data[0];

  // 2. Simula cadastro de visitantes
  const visitantes = [
    { nome: 'Carlos Santos', origem: 'Brasília-DF', nota: 9 },
    { nome: 'Ana Paula', origem: 'Goiânia-GO', nota: 10 },
    { nome: 'Roberto Lima', origem: 'São Paulo-SP', nota: 8 },
    { nome: 'Juliana Costa', origem: 'Brasília-DF', nota: 9 },
    { nome: 'Pedro Alves', origem: 'Anápolis-GO', nota: 6 }
  ];

  visitantes.forEach(v => {
    const visitante = createVisitante({
      nome: v.nome,
      data_visita: new Date(),
      origem_cidade: v.origem.split('-')[0],
      origem_estado: v.origem.split('-')[1],
      tamanho_grupo: Math.floor(Math.random() * 4) + 1,
      trilha_id: trilha.id
    });

    createAvaliacaoEcoturismo({
      visitante_id: visitante.id,
      data: new Date(),
      nota: v.nota,
      aspectos_positivos: 'Trilha bem sinalizada',
      recomendaria: v.nota >= 7 ? 'sim' : 'não'
    });

    Logger.log(`  ✅ Visitante: ${v.nome} - Nota: ${v.nota}`);
  });

  // 3. Calcula NPS
  const nps = EcoturismService.calculateNPS();

  Logger.log('\n📊 Net Promoter Score (NPS):');
  Logger.log('  NPS: ' + nps.nps);
  Logger.log('  Classificação: ' + nps.classificacao);
  Logger.log('  Nota Média: ' + nps.notaMedia);
  Logger.log('\n📈 Distribuição:');
  Logger.log('  Promotores (9-10): ' + nps.distribuicao.promotores.percentual);
  Logger.log('  Neutros (7-8): ' + nps.distribuicao.neutros.percentual);
  Logger.log('  Detratores (0-6): ' + nps.distribuicao.detratores.percentual);

  // 4. Analisa capacidade da trilha
  const capacidade = EcoturismService.analyzeTrailCapacity(trilha.id);

  Logger.log('\n🚶 Capacidade de Carga:');
  Logger.log('  Capacidade Efetiva: ' + capacidade.capacidades.efetiva + ' visitantes/dia');
  Logger.log('  Visitação Atual: ' + capacidade.visitacao.atual);
  Logger.log('  Utilização: ' + capacidade.visitacao.utilizacao);
  Logger.log('  Status: ' + capacidade.visitacao.status);

  return { nps: nps, capacidade: capacidade };
}

/**
 * Exemplo 6: Busca e Filtros Avançados
 */
function exemplo6_BuscaAvancada() {
  Logger.log('🔍 Exemplo 6: Busca e Filtros Avançados\n');

  // 1. Busca global
  const busca = SearchService.globalSearch('cerrado');
  Logger.log('🔎 Busca por "cerrado":');
  Logger.log('  Total de resultados: ' + busca.total);
  Logger.log('  Waypoints: ' + busca.results.waypoints.length);
  Logger.log('  Trilhas: ' + busca.results.trilhas.length);
  Logger.log('  Fotos: ' + busca.results.fotos.length);

  // 2. Busca por proximidade
  const proximos = SearchService.searchNearby(-15.234567, -47.876543, 1);
  Logger.log('\n📍 Pontos próximos (raio 1km):');
  Logger.log('  Waypoints: ' + proximos.results.waypoints.length);
  Logger.log('  Observações: ' + proximos.results.observacoes.length);

  // 3. Filtros avançados
  const waypointsFiltrados = readWaypoints(
    { categoria: 'mirante' },
    { sortBy: 'nome', sortOrder: 'asc', limit: 5 }
  );
  Logger.log('\n🏔️  Mirantes (ordenados por nome):');
  waypointsFiltrados.data.forEach(wp => {
    Logger.log('  - ' + wp.nome);
  });

  // 4. Busca por data
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 30);
  const porData = SearchService.searchByDate(dataInicio, new Date());
  Logger.log('\n📅 Registros dos últimos 30 dias:');
  Logger.log('  Total: ' + porData.total);

  return { busca: busca, proximos: proximos };
}

/**
 * Exemplo 7: Estatísticas e Relatórios
 */
function exemplo7_EstatisticasRelatorios() {
  Logger.log('📊 Exemplo 7: Estatísticas e Relatórios\n');

  // 1. Estatísticas gerais
  const stats = getSystemStatistics();

  Logger.log('📈 Estatísticas do Sistema:');
  Logger.log('\n🌳 Agrofloresta:');
  Logger.log('  Parcelas: ' + stats.statistics.agrofloresta.parcelas);
  Logger.log('  Produções: ' + stats.statistics.agrofloresta.producoes);
  Logger.log('  Espécies: ' + stats.statistics.agrofloresta.especies);

  Logger.log('\n🌊 Ambiental:');
  Logger.log('  Dados Climáticos: ' + stats.statistics.ambiental.dadosClimaticos);
  Logger.log('  Qualidade Água: ' + stats.statistics.ambiental.qualidadeAgua);
  Logger.log('  Biodiversidade: ' + stats.statistics.ambiental.biodiversidade);

  Logger.log('\n🥾 Ecoturismo:');
  Logger.log('  Visitantes: ' + stats.statistics.ecoturismo.visitantes);
  Logger.log('  Trilhas: ' + stats.statistics.ecoturismo.trilhas);
  Logger.log('  Avaliações: ' + stats.statistics.ecoturismo.avaliacoes);

  Logger.log('\n📍 GPS:');
  Logger.log('  Waypoints: ' + stats.statistics.gps.waypoints);
  Logger.log('  Fotos: ' + stats.statistics.gps.fotos);
  Logger.log('  Rotas: ' + stats.statistics.gps.rotas);

  Logger.log('\n🧘 Terapia:');
  Logger.log('  Participantes: ' + stats.statistics.terapia.participantes);
  Logger.log('  Sessões: ' + stats.statistics.terapia.sessoes);

  Logger.log('\n📝 Totais:');
  Logger.log('  Registros: ' + stats.statistics.totais.registros);
  Logger.log('  Módulos: ' + stats.statistics.totais.modulos);

  // 2. Valida integridade
  const integridade = validateReferentialIntegrity();
  Logger.log('\n🔍 Integridade Referencial:');
  Logger.log('  Válida: ' + (integridade.valid ? 'SIM' : 'NÃO'));
  Logger.log('  Problemas: ' + integridade.count);

  return stats;
}

/**
 * Executa todos os exemplos em sequência
 */
function executarTodosExemplos() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   🎯 EXEMPLOS PRÁTICOS DE USO DO CRUD                ║');
  Logger.log('╚════════════════════════════════════════════════════════╝\n');

  exemplo1_TrilhaComWaypoints();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo2_MonitoramentoAgua();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo3_ProgramaTerapia();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo4_SistemaAgroflorestal();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo5_GestaoVisitantes();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo6_BuscaAvancada();
  Logger.log('\n' + '─'.repeat(60) + '\n');

  exemplo7_EstatisticasRelatorios();

  Logger.log('\n╔════════════════════════════════════════════════════════╗');
  Logger.log('║   ✅ TODOS OS EXEMPLOS EXECUTADOS                     ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
}
