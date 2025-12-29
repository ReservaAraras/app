/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE DATA - Dados de Exemplo para Testes
 * ═══════════════════════════════════════════════════════════════════════════
 * Execute createExampleData() para popular o sistema com dados de teste
 */

function createExampleData() {
  try {
    Logger.log('Criando dados de exemplo...');

    // Limpa dados existentes (opcional)
    // clearAllData();

    createAgroforestryExamples();

    createEnvironmentalExamples();

    createTherapyExamples();

    createEcoturismExamples();

    Logger.log('✅ Dados de exemplo criados com sucesso!');

    // Tenta mostrar alerta se estiver em contexto de planilha
    try {
      SpreadsheetApp.getUi().alert('✅ Dados de exemplo criados com sucesso!');
    } catch (e) {
      // Ignora se não tiver UI
    }

    return { success: true, message: 'Dados de exemplo criados!' };

  } catch (error) {
    Utils.logError('createExampleData', error);
    Logger.log('❌ Erro ao criar dados: ' + error);

    // Tenta mostrar alerta se estiver em contexto de planilha
    try {
      SpreadsheetApp.getUi().alert('❌ Erro ao criar dados: ' + error);
    } catch (e) {
      // Ignora se não tiver UI
    }

    return { success: false, error: error.toString() };
  }
}

/**
 * Cria exemplos de agrofloresta
 */
function createAgroforestryExamples() {
  Logger.log('Criando parcelas agroflorestais...');

  // Parcela 1 - SAF Cerrado
  const parcela1 = DatabaseService.create(CONFIG.SHEETS.PARCELAS_AGRO, {
    nome: 'SAF Araras 1',
    tipo_sistema: 'SAF_Cerrado',
    area_ha: 2.5,
    idade_anos: 3,
    custo_implantacao: 15000,
    custo_manutencao_anual: 2000,
    localizacao: 'Área Norte',
    responsavel: 'João Silva'
  });

  // Parcela 2 - ILPF
  const parcela2 = DatabaseService.create(CONFIG.SHEETS.PARCELAS_AGRO, {
    nome: 'ILPF Cerrado',
    tipo_sistema: 'ILPF',
    area_ha: 5.0,
    idade_anos: 5,
    custo_implantacao: 25000,
    custo_manutencao_anual: 3500,
    localizacao: 'Área Sul',
    responsavel: 'Maria Santos'
  });

  // Produção da Parcela 1
  if (parcela1.success) {
    const parcelaId = parcela1.data.id;

    DatabaseService.create(CONFIG.SHEETS.PRODUCAO_AGRO, {
      parcela_id: parcelaId,
      data: new Date(2024, 9, 15),
      produto: 'Banana',
      quantidade_kg: 150,
      valor_reais: 450
    });

    DatabaseService.create(CONFIG.SHEETS.PRODUCAO_AGRO, {
      parcela_id: parcelaId,
      data: new Date(2024, 8, 20),
      produto: 'Mandioca',
      quantidade_kg: 200,
      valor_reais: 300
    });

    DatabaseService.create(CONFIG.SHEETS.PRODUCAO_AGRO, {
      parcela_id: parcelaId,
      data: new Date(2024, 7, 10),
      produto: 'Abacaxi',
      quantidade_kg: 80,
      valor_reais: 320
    });
  }

  Logger.log('Parcelas agroflorestais criadas!');
}

/**
 * Cria exemplos ambientais
 */
function createEnvironmentalExamples() {
  Logger.log('Criando dados ambientais...');

  // Qualidade da Água
  DatabaseService.create(CONFIG.SHEETS.QUALIDADE_AGUA, {
    data: new Date(),
    local: 'Rio Araras - Ponto 1',
    pH: 7.2,
    oxigenio_dissolvido: 6.5,
    turbidez: 45,
    temperatura: 24,
    nitrogenio_total: 0.8,
    fosforo_total: 0.05,
    coliformes_termotolerantes: 500,
    solidos_totais: 80,
    condutividade: 120
  });

  DatabaseService.create(CONFIG.SHEETS.QUALIDADE_AGUA, {
    data: new Date(2024, 9, 1),
    local: 'Córrego das Araras',
    pH: 6.8,
    oxigenio_dissolvido: 7.2,
    turbidez: 30,
    temperatura: 23,
    nitrogenio_total: 0.6,
    fosforo_total: 0.03,
    coliformes_termotolerantes: 300,
    solidos_totais: 60,
    condutividade: 100
  });

  // Qualidade do Solo
  DatabaseService.create(CONFIG.SHEETS.QUALIDADE_SOLO, {
    data: new Date(),
    local: 'Parcela SAF 1',
    pH: 6.5,
    materia_organica: 3.2,
    fosforo: 18,
    potassio: 95,
    calcio: 3.5,
    magnesio: 1.2,
    aluminio: 0.1
  });

  DatabaseService.create(CONFIG.SHEETS.QUALIDADE_SOLO, {
    data: new Date(2024, 8, 15),
    local: 'Área de Recuperação',
    pH: 5.8,
    materia_organica: 2.1,
    fosforo: 8,
    potassio: 45,
    calcio: 2.0,
    magnesio: 0.7,
    aluminio: 0.3
  });

  // Dados Climáticos (últimos 30 dias)
  for (let i = 0; i < 30; i++) {
    const data = new Date();
    data.setDate(data.getDate() - i);

    DatabaseService.create(CONFIG.SHEETS.DADOS_CLIMA, {
      data: data,
      temperatura_min: 18 + Math.random() * 4,
      temperatura_max: 28 + Math.random() * 6,
      precipitacao: Math.random() < 0.3 ? Math.random() * 50 : 0,
      umidade: 60 + Math.random() * 20
    });
  }

  Logger.log('Dados ambientais criados!');
}

/**
 * Cria exemplos de terapia
 */
function createTherapyExamples() {
  Logger.log('Criando dados de terapia...');

  // Participante 1
  const part1 = DatabaseService.create(CONFIG.SHEETS.PARTICIPANTES, {
    nome: 'Ana Costa',
    data_inicio: new Date(2024, 6, 1),
    idade: 35,
    condicao: 'Ansiedade'
  });

  if (part1.success) {
    const partId = part1.data.id;

    // Avaliações ao longo do tempo
    const avaliacoes = [
      { dias: 0, ansiedade: 8, depressao: 6, estresse: 7, bemestar: 3, conexao: 4 },
      { dias: 15, ansiedade: 7, depressao: 5, estresse: 6, bemestar: 4, conexao: 5 },
      { dias: 30, ansiedade: 6, depressao: 4, estresse: 5, bemestar: 6, conexao: 6 },
      { dias: 45, ansiedade: 5, depressao: 3, estresse: 4, bemestar: 7, conexao: 7 },
      { dias: 60, ansiedade: 4, depressao: 3, estresse: 3, bemestar: 8, conexao: 8 }
    ];

    avaliacoes.forEach(av => {
      const dataAv = new Date(2024, 6, 1);
      dataAv.setDate(dataAv.getDate() + av.dias);

      DatabaseService.create(CONFIG.SHEETS.AVALIACOES_TERAPIA, {
        participante_id: partId,
        data: dataAv,
        escala_ansiedade: av.ansiedade,
        escala_depressao: av.depressao,
        escala_estresse: av.estresse,
        escala_bemestar: av.bemestar,
        conexao_natureza: av.conexao
      });
    });

    // Sessões
    const sessoes = [
      { dias: 2, tipo: 'Caminhada Terapêutica', duracao: 60, satisfacao: 8 },
      { dias: 9, tipo: 'Meditação na Natureza', duracao: 45, satisfacao: 9 },
      { dias: 16, tipo: 'Caminhada Terapêutica', duracao: 60, satisfacao: 8 },
      { dias: 23, tipo: 'Terapia Florestal', duracao: 90, satisfacao: 9 },
      { dias: 30, tipo: 'Caminhada Terapêutica', duracao: 60, satisfacao: 9 },
      { dias: 37, tipo: 'Meditação na Natureza', duracao: 45, satisfacao: 10 },
      { dias: 44, tipo: 'Terapia Florestal', duracao: 90, satisfacao: 10 }
    ];

    sessoes.forEach(s => {
      const dataSessao = new Date(2024, 6, 1);
      dataSessao.setDate(dataSessao.getDate() + s.dias);

      DatabaseService.create(CONFIG.SHEETS.SESSOES, {
        participante_id: partId,
        data: dataSessao,
        tipo_terapia: s.tipo,
        duracao_minutos: s.duracao,
        satisfacao: s.satisfacao,
        local: 'Trilha das Araras'
      });
    });
  }

  // Participante 2
  const part2 = DatabaseService.create(CONFIG.SHEETS.PARTICIPANTES, {
    nome: 'Carlos Oliveira',
    data_inicio: new Date(2024, 7, 15),
    idade: 42,
    condicao: 'Estresse'
  });

  if (part2.success) {
    const partId = part2.data.id;

    DatabaseService.create(CONFIG.SHEETS.AVALIACOES_TERAPIA, {
      participante_id: partId,
      data: new Date(2024, 7, 15),
      escala_ansiedade: 6,
      escala_depressao: 4,
      escala_estresse: 9,
      escala_bemestar: 4,
      conexao_natureza: 3
    });

    DatabaseService.create(CONFIG.SHEETS.AVALIACOES_TERAPIA, {
      participante_id: partId,
      data: new Date(2024, 8, 15),
      escala_ansiedade: 5,
      escala_depressao: 3,
      escala_estresse: 7,
      escala_bemestar: 6,
      conexao_natureza: 6
    });
  }

  Logger.log('Dados de terapia criados!');
}

/**
 * Cria exemplos de ecoturismo
 */
function createEcoturismExamples() {
  Logger.log('Criando dados de ecoturismo...');

  // Trilhas
  const trilha1 = DatabaseService.create(CONFIG.SHEETS.TRILHAS, {
    nome: 'Trilha das Araras',
    distancia_km: 3.5,
    largura_m: 2,
    tempo_visita_horas: 2,
    dificuldade: 'Média',
    pontos_interesse: 'Mirante, Cachoeira, Observação de Aves'
  });

  const trilha2 = DatabaseService.create(CONFIG.SHEETS.TRILHAS, {
    nome: 'Trilha do Cerrado',
    distancia_km: 5.0,
    largura_m: 1.5,
    tempo_visita_horas: 3,
    dificuldade: 'Difícil',
    pontos_interesse: 'Flora nativa, Formações rochosas'
  });

  // Visitantes e Avaliações
  if (trilha1.success) {
    const trilhaId = trilha1.data.id;

    const visitantes = [
      { nome: 'Pedro Santos', origem: 'Brasília', grupo: 4, nota: 10 },
      { nome: 'Julia Lima', origem: 'Goiânia', grupo: 2, nota: 9 },
      { nome: 'Roberto Alves', origem: 'São Paulo', grupo: 6, nota: 8 },
      { nome: 'Fernanda Costa', origem: 'Brasília', grupo: 3, nota: 10 },
      { nome: 'Marcos Silva', origem: 'Anápolis', grupo: 2, nota: 9 },
      { nome: 'Carla Souza', origem: 'Goiânia', grupo: 5, nota: 7 },
      { nome: 'Paulo Mendes', origem: 'Brasília', grupo: 4, nota: 10 },
      { nome: 'Lucia Rocha', origem: 'São Paulo', grupo: 2, nota: 9 },
      { nome: 'André Martins', origem: 'Goiânia', grupo: 3, nota: 8 },
      { nome: 'Beatriz Dias', origem: 'Brasília', grupo: 4, nota: 10 }
    ];

    visitantes.forEach((v, i) => {
      const dataVisita = new Date();
      dataVisita.setDate(dataVisita.getDate() - (i * 3));

      const visitante = DatabaseService.create(CONFIG.SHEETS.VISITANTES, {
        data: dataVisita,
        nome: v.nome,
        origem: v.origem,
        tamanho_grupo: v.grupo,
        trilha_id: trilhaId
      });

      if (visitante.success) {
        DatabaseService.create(CONFIG.SHEETS.AVALIACOES, {
          visitante_id: visitante.data.id,
          data: dataVisita,
          nota: v.nota,
          comentario: 'Experiência incrível!'
        });
      }
    });
  }

  Logger.log('Dados de ecoturismo criados!');
}

/**
 * Limpa todos os dados (use com cuidado!)
 */
function clearAllData() {
  const sheets = Object.values(CONFIG.SHEETS);

  sheets.forEach(sheetName => {
    try {
      const sheet = getSheet(sheetName);
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } catch (error) {
      Logger.log(`Erro ao limpar ${sheetName}: ${error}`);
    }
  });

  Logger.log('Dados limpos!');
}
