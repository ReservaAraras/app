/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NORMAL DISTRIBUTION DATA GENERATOR - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Gerador de dados sintéticos com distribuição normal (curva de Gauss)
 * Adiciona 2 linhas por planilha com valores que expressam melhor a curva normal
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

const NormalDistributionGenerator = {
  
  /**
   * Gera número aleatório com distribuição normal usando Box-Muller transform
   * @param {number} mean - Média da distribuição
   * @param {number} stdDev - Desvio padrão
   * @returns {number} Valor com distribuição normal
   */
  gaussianRandom: function(mean, stdDev) {
    let u1 = Math.random();
    let u2 = Math.random();
    
    // Evita log(0)
    while (u1 === 0) u1 = Math.random();
    
    // Box-Muller transform
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    return z0 * stdDev + mean;
  },
  
  /**
   * Gera valor normal limitado a um intervalo
   * @param {number} mean - Média
   * @param {number} stdDev - Desvio padrão
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @returns {number} Valor normalizado dentro do intervalo
   */
  boundedGaussian: function(mean, stdDev, min, max) {
    let value = this.gaussianRandom(mean, stdDev);
    // Limita ao intervalo
    return Math.max(min, Math.min(max, value));
  },
  
  /**
   * Gera inteiro com distribuição normal
   */
  gaussianInt: function(mean, stdDev, min, max) {
    return Math.round(this.boundedGaussian(mean, stdDev, min, max));
  },

  /**
   * Adiciona 2 linhas em todas as planilhas com dados de distribuição normal
   */
  addNormalDataToAllSheets: function() {
    Logger.log('═══════════════════════════════════════════════════════════════');
    Logger.log('📊 ADICIONANDO DADOS COM DISTRIBUIÇÃO NORMAL');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    const results = {
      waypoints: this.addWaypointsNormal(),
      fotos: this.addFotosNormal(),
      qualidadeAgua: this.addQualidadeAguaNormal(),
      qualidadeSolo: this.addQualidadeSoloNormal(),
      biodiversidade: this.addBiodiversidadeNormal(),
      producao: this.addProducaoNormal(),
      terapia: this.addTerapiaNormal(),
      visitantes: this.addVisitantesNormal(),
      carbono: this.addCarbonoNormal(),
      trilhas: this.addTrilhasNormal()
    };
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log('✅ DADOS NORMAIS ADICIONADOS COM SUCESSO');
    Logger.log('═══════════════════════════════════════════════════════════════\n');
    
    let total = 0;
    Object.keys(results).forEach(key => {
      const count = results[key] ? results[key].length : 0;
      Logger.log(`  ${key}: ${count} registros`);
      total += count;
    });
    Logger.log(`\n  TOTAL: ${total} registros adicionados`);
    
    return results;
  },

  /**
   * Waypoints - 2 linhas com coordenadas normalmente distribuídas
   */
  addWaypointsNormal: function() {
    Logger.log('📍 Adicionando waypoints com distribuição normal...');
    
    // Centro da reserva e desvio padrão para coordenadas
    const latMean = -13.42;
    const lonMean = -46.35;
    const coordStdDev = 0.02;
    
    const waypoints = [
      {
        nome: 'Ponto Mediano Norte',
        categoria: 'ponto_observacao',
        latitude: this.boundedGaussian(latMean, coordStdDev, -13.5, -13.3),
        longitude: this.boundedGaussian(lonMean, coordStdDev, -46.5, -46.2),
        altitude: this.gaussianInt(850, 50, 700, 1000),
        descricao: 'Ponto com coordenadas na média da distribuição espacial',
        observacoes: 'Dados sintéticos - distribuição normal - ' + new Date().toISOString()
      },
      {
        nome: 'Ponto Mediano Sul',
        categoria: 'mirante',
        latitude: this.boundedGaussian(latMean, coordStdDev, -13.5, -13.3),
        longitude: this.boundedGaussian(lonMean, coordStdDev, -46.5, -46.2),
        altitude: this.gaussianInt(850, 50, 700, 1000),
        descricao: 'Ponto representativo da tendência central',
        observacoes: 'Dados sintéticos - distribuição normal - ' + new Date().toISOString()
      }
    ];
    
    const saved = [];
    waypoints.forEach(wp => {
      const result = DatabaseService.create('Waypoints', wp);
      if (result.success) {
        saved.push(wp);
        Logger.log(`  ✅ ${wp.nome} (lat: ${wp.latitude.toFixed(4)}, alt: ${wp.altitude}m)`);
      }
    });
    
    return saved;
  },

  /**
   * Fotos - 2 linhas com tamanhos normalmente distribuídos
   */
  addFotosNormal: function() {
    Logger.log('\n📷 Adicionando fotos com distribuição normal...');
    
    const fotos = [
      {
        nome_arquivo: `foto_normal_${Date.now()}_1.jpg`,
        titulo: 'Registro Típico da Reserva',
        categoria: 'paisagem',
        latitude: this.boundedGaussian(-13.42, 0.02, -13.5, -13.3),
        longitude: this.boundedGaussian(-46.35, 0.02, -46.5, -46.2),
        data: new Date(),
        tags: 'normal,sintetico,paisagem',
        descricao: 'Foto com características medianas típicas',
        tamanho_bytes: this.gaussianInt(2500000, 500000, 500000, 5000000),
        largura: this.gaussianInt(4000, 500, 2000, 6000),
        altura: this.gaussianInt(3000, 400, 1500, 4500)
      },
      {
        nome_arquivo: `foto_normal_${Date.now()}_2.jpg`,
        titulo: 'Captura Representativa',
        categoria: 'fauna',
        latitude: this.boundedGaussian(-13.42, 0.02, -13.5, -13.3),
        longitude: this.boundedGaussian(-46.35, 0.02, -46.5, -46.2),
        data: new Date(),
        tags: 'normal,sintetico,fauna',
        descricao: 'Imagem com dimensões na média estatística',
        tamanho_bytes: this.gaussianInt(2500000, 500000, 500000, 5000000),
        largura: this.gaussianInt(4000, 500, 2000, 6000),
        altura: this.gaussianInt(3000, 400, 1500, 4500)
      }
    ];
    
    const saved = [];
    fotos.forEach(f => {
      const result = DatabaseService.create('Fotos', f);
      if (result.success) {
        saved.push(f);
        Logger.log(`  ✅ ${f.titulo} (${(f.tamanho_bytes/1000000).toFixed(1)}MB, ${f.largura}x${f.altura})`);
      }
    });
    
    return saved;
  },

  /**
   * Qualidade da Água - 2 linhas com parâmetros normalmente distribuídos
   * Baseado em valores típicos de águas naturais
   */
  addQualidadeAguaNormal: function() {
    Logger.log('\n💧 Adicionando análises de água com distribuição normal...');
    
    const analises = [
      {
        local: 'Ponto Amostral Médio A',
        data: new Date(),
        pH: this.boundedGaussian(7.0, 0.5, 6.0, 8.5),
        turbidez: this.boundedGaussian(15, 5, 0, 40),
        oxigenio_dissolvido: this.boundedGaussian(7.5, 1.0, 5.0, 10.0),
        temperatura: this.boundedGaussian(22, 3, 15, 30),
        condutividade: this.boundedGaussian(100, 25, 30, 200),
        nitrogenio_total: this.boundedGaussian(1.5, 0.5, 0.1, 5.0),
        fosforo_total: this.boundedGaussian(0.05, 0.02, 0.01, 0.15),
        dbo: this.boundedGaussian(3, 1, 1, 8),
        observacoes: 'Amostra com valores na tendência central - distribuição normal'
      },
      {
        local: 'Ponto Amostral Médio B',
        data: new Date(),
        pH: this.boundedGaussian(7.0, 0.5, 6.0, 8.5),
        turbidez: this.boundedGaussian(15, 5, 0, 40),
        oxigenio_dissolvido: this.boundedGaussian(7.5, 1.0, 5.0, 10.0),
        temperatura: this.boundedGaussian(22, 3, 15, 30),
        condutividade: this.boundedGaussian(100, 25, 30, 200),
        nitrogenio_total: this.boundedGaussian(1.5, 0.5, 0.1, 5.0),
        fosforo_total: this.boundedGaussian(0.05, 0.02, 0.01, 0.15),
        dbo: this.boundedGaussian(3, 1, 1, 8),
        observacoes: 'Amostra representativa da média populacional - distribuição normal'
      }
    ];
    
    const saved = [];
    analises.forEach(a => {
      const result = DatabaseService.create('QualidadeAgua', a);
      if (result.success) {
        saved.push(a);
        Logger.log(`  ✅ ${a.local} (pH: ${a.pH.toFixed(2)}, OD: ${a.oxigenio_dissolvido.toFixed(1)}mg/L)`);
      }
    });
    
    return saved;
  },

  /**
   * Qualidade do Solo - 2 linhas com parâmetros normalmente distribuídos
   */
  addQualidadeSoloNormal: function() {
    Logger.log('\n🌱 Adicionando análises de solo com distribuição normal...');
    
    const analises = [
      {
        local: 'Parcela Referência 1',
        data: new Date(),
        profundidade_cm: this.gaussianInt(20, 5, 5, 40),
        pH: this.boundedGaussian(6.0, 0.5, 4.5, 7.5),
        materia_organica: this.boundedGaussian(3.5, 1.0, 1.0, 8.0),
        nitrogenio: this.boundedGaussian(50, 15, 10, 100),
        fosforo: this.boundedGaussian(25, 8, 5, 60),
        potassio: this.boundedGaussian(100, 30, 30, 200),
        calcio: this.boundedGaussian(2.5, 0.8, 0.5, 5.0),
        magnesio: this.boundedGaussian(1.0, 0.3, 0.2, 2.0),
        ctc: this.boundedGaussian(8, 2, 3, 15),
        saturacao_bases: this.boundedGaussian(50, 15, 20, 80),
        observacoes: 'Solo com características medianas do Cerrado - distribuição normal'
      },
      {
        local: 'Parcela Referência 2',
        data: new Date(),
        profundidade_cm: this.gaussianInt(20, 5, 5, 40),
        pH: this.boundedGaussian(6.0, 0.5, 4.5, 7.5),
        materia_organica: this.boundedGaussian(3.5, 1.0, 1.0, 8.0),
        nitrogenio: this.boundedGaussian(50, 15, 10, 100),
        fosforo: this.boundedGaussian(25, 8, 5, 60),
        potassio: this.boundedGaussian(100, 30, 30, 200),
        calcio: this.boundedGaussian(2.5, 0.8, 0.5, 5.0),
        magnesio: this.boundedGaussian(1.0, 0.3, 0.2, 2.0),
        ctc: this.boundedGaussian(8, 2, 3, 15),
        saturacao_bases: this.boundedGaussian(50, 15, 20, 80),
        observacoes: 'Amostra típica representativa - distribuição normal'
      }
    ];
    
    const saved = [];
    analises.forEach(a => {
      const result = DatabaseService.create('QualidadeSolo', a);
      if (result.success) {
        saved.push(a);
        Logger.log(`  ✅ ${a.local} (pH: ${a.pH.toFixed(2)}, MO: ${a.materia_organica.toFixed(1)}%)`);
      }
    });
    
    return saved;
  },

  /**
   * Biodiversidade - 2 linhas com quantidades normalmente distribuídas
   */
  addBiodiversidadeNormal: function() {
    Logger.log('\n🦜 Adicionando observações de biodiversidade com distribuição normal...');
    
    const observacoes = [
      {
        data: new Date(),
        local: 'Transecto Padrão A',
        tipo_observacao: 'Fauna',
        tipo: 'Fauna',
        especie: 'Ara ararauna',
        nome_popular: 'Arara-canindé',
        quantidade: this.gaussianInt(5, 2, 1, 15),
        comportamento: 'Alimentação',
        habitat: 'Cerrado',
        status_conservacao: 'Pouco preocupante',
        observacoes: 'Avistamento com contagem típica - distribuição normal'
      },
      {
        data: new Date(),
        local: 'Transecto Padrão B',
        tipo_observacao: 'Flora',
        tipo: 'Flora',
        especie: 'Caryocar brasiliense',
        nome_popular: 'Pequi',
        quantidade: this.gaussianInt(8, 3, 1, 20),
        comportamento: '',
        habitat: 'Cerrado sensu stricto',
        status_conservacao: 'Pouco preocupante',
        observacoes: 'Contagem representativa da densidade média - distribuição normal'
      }
    ];
    
    const saved = [];
    observacoes.forEach(o => {
      const result = DatabaseService.create('Biodiversidade', o);
      if (result.success) {
        saved.push(o);
        Logger.log(`  ✅ ${o.nome_popular} - ${o.quantidade} indivíduos`);
      }
    });
    
    return saved;
  },

  /**
   * Produção Agroflorestal - 2 linhas com produtividade normalmente distribuída
   */
  addProducaoNormal: function() {
    Logger.log('\n🌾 Adicionando produção com distribuição normal...');
    
    const producoes = [
      {
        parcela_id: 'PARCELA_MEDIA_1',
        produto: 'Pequi',
        quantidade_kg: this.boundedGaussian(45, 15, 10, 100),
        data_colheita: new Date(),
        qualidade: 'Boa',
        valor_reais: this.boundedGaussian(180, 50, 50, 400),
        observacoes: 'Produção na média esperada para a safra - distribuição normal'
      },
      {
        parcela_id: 'PARCELA_MEDIA_2',
        produto: 'Baru',
        quantidade_kg: this.boundedGaussian(30, 10, 5, 70),
        data_colheita: new Date(),
        qualidade: 'Boa',
        valor_reais: this.boundedGaussian(250, 70, 80, 500),
        observacoes: 'Colheita típica representativa - distribuição normal'
      }
    ];
    
    const saved = [];
    producoes.forEach(p => {
      const result = DatabaseService.create('ProducaoAgroflorestal', p);
      if (result.success) {
        saved.push(p);
        Logger.log(`  ✅ ${p.produto}: ${p.quantidade_kg.toFixed(1)}kg (R$ ${p.valor_reais.toFixed(2)})`);
      }
    });
    
    return saved;
  },

  /**
   * Terapia - 2 linhas com escalas normalmente distribuídas
   */
  addTerapiaNormal: function() {
    Logger.log('\n💚 Adicionando sessões terapêuticas com distribuição normal...');
    
    const sessoes = [
      {
        participante_id: 'PART_MEDIO_1',
        data: new Date(),
        tipo_terapia: 'Banho de floresta',
        duracao: this.gaussianInt(60, 15, 30, 120),
        humor_antes: this.gaussianInt(5, 1.5, 1, 10),
        humor_depois: this.gaussianInt(7, 1, 4, 10),
        nivel_estresse_antes: this.gaussianInt(6, 1.5, 1, 10),
        nivel_estresse_depois: this.gaussianInt(3, 1, 1, 7),
        satisfacao: this.gaussianInt(8, 1, 5, 10),
        observacoes: 'Sessão com resultados típicos - distribuição normal'
      },
      {
        participante_id: 'PART_MEDIO_2',
        data: new Date(),
        tipo_terapia: 'Meditação na natureza',
        duracao: this.gaussianInt(60, 15, 30, 120),
        humor_antes: this.gaussianInt(5, 1.5, 1, 10),
        humor_depois: this.gaussianInt(7, 1, 4, 10),
        nivel_estresse_antes: this.gaussianInt(6, 1.5, 1, 10),
        nivel_estresse_depois: this.gaussianInt(3, 1, 1, 7),
        satisfacao: this.gaussianInt(8, 1, 5, 10),
        observacoes: 'Resposta terapêutica na média esperada - distribuição normal'
      }
    ];
    
    const saved = [];
    sessoes.forEach(s => {
      const result = DatabaseService.create('SessoesTerapia', s);
      if (result.success) {
        saved.push(s);
        Logger.log(`  ✅ ${s.tipo_terapia} (${s.duracao}min, satisfação: ${s.satisfacao}/10)`);
      }
    });
    
    return saved;
  },

  /**
   * Visitantes - 2 linhas com dados demográficos normalmente distribuídos
   */
  addVisitantesNormal: function() {
    Logger.log('\n👤 Adicionando visitantes com distribuição normal...');
    
    const visitantes = [
      {
        nome: 'Visitante Típico A',
        email: 'visitante.tipico.a@example.com',
        telefone: '(61) 99999-0001',
        cidade: 'Brasília',
        estado: 'DF',
        data_visita: new Date(),
        tamanho_grupo: this.gaussianInt(4, 2, 1, 12),
        idade: this.gaussianInt(35, 10, 18, 70),
        motivo: 'Turismo',
        avaliacao: this.gaussianInt(8, 1, 5, 10),
        observacoes: 'Perfil demográfico típico - distribuição normal'
      },
      {
        nome: 'Visitante Típico B',
        email: 'visitante.tipico.b@example.com',
        telefone: '(62) 99999-0002',
        cidade: 'Goiânia',
        estado: 'GO',
        data_visita: new Date(),
        tamanho_grupo: this.gaussianInt(4, 2, 1, 12),
        idade: this.gaussianInt(35, 10, 18, 70),
        motivo: 'Educação',
        avaliacao: this.gaussianInt(8, 1, 5, 10),
        observacoes: 'Visitante representativo da média - distribuição normal'
      }
    ];
    
    const saved = [];
    visitantes.forEach(v => {
      const result = DatabaseService.create('Visitantes', v);
      if (result.success) {
        saved.push(v);
        Logger.log(`  ✅ ${v.nome} (grupo: ${v.tamanho_grupo}, idade: ${v.idade})`);
      }
    });
    
    return saved;
  },

  /**
   * Carbono - 2 linhas com sequestro normalmente distribuído
   */
  addCarbonoNormal: function() {
    Logger.log('\n🌿 Adicionando dados de carbono com distribuição normal...');
    
    const registros = [
      {
        data: new Date(),
        area_nome: 'Parcela Carbono Média 1',
        tipo_vegetacao: 'Cerrado sensu stricto',
        area_ha: this.boundedGaussian(5, 1.5, 1, 15),
        biomassa_aerea: this.boundedGaussian(45, 12, 15, 90),
        biomassa_subterranea: this.boundedGaussian(25, 8, 8, 50),
        carbono_total: this.boundedGaussian(35, 10, 10, 70),
        co2_equivalente: this.boundedGaussian(128, 35, 40, 250),
        metodologia: 'Inventário florestal',
        observacoes: 'Estoque de carbono típico do bioma - distribuição normal'
      },
      {
        data: new Date(),
        area_nome: 'Parcela Carbono Média 2',
        tipo_vegetacao: 'Mata de galeria',
        area_ha: this.boundedGaussian(3, 1, 0.5, 8),
        biomassa_aerea: this.boundedGaussian(120, 30, 50, 200),
        biomassa_subterranea: this.boundedGaussian(40, 12, 15, 80),
        carbono_total: this.boundedGaussian(80, 20, 30, 140),
        co2_equivalente: this.boundedGaussian(293, 75, 110, 510),
        metodologia: 'Inventário florestal',
        observacoes: 'Sequestro representativo da formação - distribuição normal'
      }
    ];
    
    const saved = [];
    registros.forEach(r => {
      try {
        const result = DatabaseService.create('Carbono', r);
        if (result && result.success) {
          saved.push(r);
          Logger.log(`  ✅ ${r.area_nome} (${r.carbono_total.toFixed(1)} tC/ha)`);
        }
      } catch (e) {
        Logger.log(`  ⚠️ Carbono: planilha pode não existir`);
      }
    });
    
    return saved;
  },

  /**
   * Trilhas - 2 linhas com características normalmente distribuídas
   */
  addTrilhasNormal: function() {
    Logger.log('\n🥾 Adicionando trilhas com distribuição normal...');
    
    const trilhas = [
      {
        nome: 'Trilha Padrão A',
        descricao: 'Trilha com características típicas da reserva',
        distancia_km: this.boundedGaussian(3.5, 1.2, 0.5, 8),
        tempo_visita_horas: this.boundedGaussian(2.5, 0.8, 0.5, 5),
        dificuldade: 'Moderada',
        elevacao_m: this.gaussianInt(150, 50, 30, 350),
        tipo_terreno: 'Misto',
        latitude_inicio: this.boundedGaussian(-13.42, 0.02, -13.5, -13.3),
        longitude_inicio: this.boundedGaussian(-46.35, 0.02, -46.5, -46.2),
        status: 'Ativa',
        observacoes: 'Trilha representativa da média - distribuição normal'
      },
      {
        nome: 'Trilha Padrão B',
        descricao: 'Percurso com métricas na tendência central',
        distancia_km: this.boundedGaussian(3.5, 1.2, 0.5, 8),
        tempo_visita_horas: this.boundedGaussian(2.5, 0.8, 0.5, 5),
        dificuldade: 'Moderada',
        elevacao_m: this.gaussianInt(150, 50, 30, 350),
        tipo_terreno: 'Misto',
        latitude_inicio: this.boundedGaussian(-13.42, 0.02, -13.5, -13.3),
        longitude_inicio: this.boundedGaussian(-46.35, 0.02, -46.5, -46.2),
        status: 'Ativa',
        observacoes: 'Características típicas do sistema de trilhas - distribuição normal'
      }
    ];
    
    const saved = [];
    trilhas.forEach(t => {
      try {
        const result = DatabaseService.create('Trilhas', t);
        if (result && result.success) {
          saved.push(t);
          Logger.log(`  ✅ ${t.nome} (${t.distancia_km.toFixed(1)}km, ${t.elevacao_m}m desnível)`);
        }
      } catch (e) {
        Logger.log(`  ⚠️ Trilhas: planilha pode não existir`);
      }
    });
    
    return saved;
  }
};

/**
 * Função de atalho para executar a geração de dados normais
 */
function addNormalDistributionData() {
  return NormalDistributionGenerator.addNormalDataToAllSheets();
}

/**
 * Função para adicionar dados normais a uma planilha específica
 * @param {string} sheetName - Nome da planilha
 */
function addNormalDataToSheet(sheetName) {
  const methodMap = {
    'Waypoints': 'addWaypointsNormal',
    'Fotos': 'addFotosNormal',
    'QualidadeAgua': 'addQualidadeAguaNormal',
    'QualidadeSolo': 'addQualidadeSoloNormal',
    'Biodiversidade': 'addBiodiversidadeNormal',
    'ProducaoAgroflorestal': 'addProducaoNormal',
    'SessoesTerapia': 'addTerapiaNormal',
    'Visitantes': 'addVisitantesNormal',
    'Carbono': 'addCarbonoNormal',
    'Trilhas': 'addTrilhasNormal'
  };
  
  const method = methodMap[sheetName];
  if (method && NormalDistributionGenerator[method]) {
    return NormalDistributionGenerator[method]();
  }
  
  return { success: false, error: 'Planilha não suportada: ' + sheetName };
}
