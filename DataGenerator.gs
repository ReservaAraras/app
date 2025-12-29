/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA GENERATOR - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Gerador automático de dados de teste para validação do sistema
 * 
 * @version 1.0.0
 * @date 2024-11-08
 */

const DataGenerator = {
  
  /**
   * Gera dados de teste para todas as entidades
   */
  generateAll: function() {
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🎲 GERANDO DADOS DE TESTE');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    const results = {
      waypoints: this.generateWaypoints(10),
      fotos: this.generateFotos(5),
      qualidadeAgua: this.generateQualidadeAgua(8),
      qualidadeSolo: this.generateQualidadeSolo(8),
      biodiversidade: this.generateBiodiversidade(15),
      producao: this.generateProducao(12),
      terapia: this.generateTerapia(6),
      visitantes: this.generateVisitantes(20)
    };
    
    Logger.log('\n═══════════════════════════════════════════════════════════');
    Logger.log('✅ DADOS GERADOS COM SUCESSO');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    Object.keys(results).forEach(key => {
      Logger.log(`${key}: ${results[key].length} registros`);
    });
    
    return results;
  },

  /**
   * Gera waypoints de teste
   */
  generateWaypoints: function(count) {
    Logger.log(`📍 Gerando ${count} waypoints...`);
    
    const categorias = ['cachoeira', 'mirante', 'inicio', 'trilha', 'area_descanso', 'ponto_observacao'];
    const nomes = [
      'Cachoeira Principal', 'Mirante do Vale', 'Início da Trilha',
      'Ponto de Observação', 'Área de Descanso', 'Bifurcação Norte',
      'Ponte de Madeira', 'Gruta das Araras', 'Nascente Cristalina',
      'Platô do Cerrado'
    ];
    
    const waypoints = [];
    const baseLatitude = -13.4;
    const baseLongitude = -46.3;
    
    for (let i = 0; i < count; i++) {
      const waypoint = {
        nome: nomes[i % nomes.length] + (i >= nomes.length ? ` ${Math.floor(i/nomes.length) + 1}` : ''),
        categoria: categorias[Math.floor(Math.random() * categorias.length)],
        latitude: baseLatitude + (Math.random() - 0.5) * 0.1,
        longitude: baseLongitude + (Math.random() - 0.5) * 0.1,
        altitude: 800 + Math.floor(Math.random() * 200),
        descricao: 'Ponto de interesse gerado automaticamente para testes',
        observacoes: 'Dados de teste - ' + new Date().toISOString()
      };
      
      const result = DatabaseService.create('Waypoints', waypoint);
      if (result.success) {
        waypoints.push(waypoint);
        Logger.log(`  ✅ ${waypoint.nome}`);
      } else {
        Logger.log(`  ❌ ${waypoint.nome}: ${result.error}`);
      }
    }
    
    return waypoints;
  },

  /**
   * Gera registros fotográficos de teste
   */
  generateFotos: function(count) {
    Logger.log(`\n📷 Gerando ${count} registros fotográficos...`);
    
    const categorias = ['fauna', 'flora', 'paisagem', 'infraestrutura', 'atividade'];
    const titulos = [
      'Arara-canindé em voo',
      'Pequizeiro florido',
      'Vista do mirante',
      'Trilha principal',
      'Grupo de visitantes'
    ];
    
    const fotos = [];
    const baseLatitude = -13.4;
    const baseLongitude = -46.3;
    
    for (let i = 0; i < count; i++) {
      const categoria = categorias[Math.floor(Math.random() * categorias.length)];
      const foto = {
        id: `FOTO_${Date.now()}_${i}`,
        timestamp: new Date(),
        nome_arquivo: `foto_teste_${Date.now()}_${i}.jpg`, // OBRIGATÓRIO
        titulo: titulos[i % titulos.length],
        categoria: categoria, // OBRIGATÓRIO
        latitude: baseLatitude + (Math.random() - 0.5) * 0.1,
        longitude: baseLongitude + (Math.random() - 0.5) * 0.1,
        data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tags: ['teste', 'automatico', categoria].join(','),
        descricao: 'Foto de teste gerada automaticamente',
        tamanho_bytes: Math.floor(Math.random() * 5000000) + 100000,
        url: `https://example.com/foto_${i}.jpg`
      };
      
      const result = DatabaseService.create('Fotos', foto);
      if (result.success) {
        fotos.push(foto);
        Logger.log(`  ✅ ${foto.titulo}`);
      } else {
        Logger.log(`  ❌ ${foto.titulo}: ${result.error}`);
      }
    }
    
    return fotos;
  },

  /**
   * Gera dados de qualidade da água
   */
  generateQualidadeAgua: function(count) {
    Logger.log(`\n💧 Gerando ${count} análises de água...`);
    
    const locais = ['Nascente Principal', 'Córrego das Araras', 'Lago Central', 'Rio Terra Ronca'];
    const analises = [];
    
    for (let i = 0; i < count; i++) {
      const local = locais[Math.floor(Math.random() * locais.length)];
      const dataAnalise = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const pHValue = 6.0 + Math.random() * 2.5;
      
      const analise = {
        id: `AGUA_${Date.now()}_${i}`,
        timestamp: new Date(),
        local: local, // OBRIGATÓRIO
        data: dataAnalise, // OBRIGATÓRIO
        pH: pHValue, // OBRIGATÓRIO (campo com letra maiúscula no meio)
        turbidez: Math.random() * 50,
        oxigenio_dissolvido: 5.0 + Math.random() * 5,
        temperatura: 18 + Math.random() * 10,
        condutividade: 50 + Math.random() * 150,
        observacoes: 'Análise de teste'
      };
      
      const result = DatabaseService.create('QualidadeAgua', analise);
      if (result.success) {
        analises.push(analise);
        Logger.log(`  ✅ ${analise.local} - pH: ${analise.pH.toFixed(2)}`);
      } else {
        Logger.log(`  ❌ ${analise.local}: ${result.error}`);
      }
    }
    
    return analises;
  },

  /**
   * Gera dados de qualidade do solo
   */
  generateQualidadeSolo: function(count) {
    Logger.log(`\n🌱 Gerando ${count} análises de solo...`);
    
    const locais = ['Parcela A1', 'Parcela A2', 'Parcela B1', 'Parcela B2', 'Área de Recuperação'];
    const analises = [];
    
    for (let i = 0; i < count; i++) {
      const local = locais[Math.floor(Math.random() * locais.length)];
      const dataAnalise = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const pHValue = 5.5 + Math.random() * 2;
      
      const analise = {
        id: `SOLO_${Date.now()}_${i}`,
        timestamp: new Date(),
        local: local, // OBRIGATÓRIO
        data: dataAnalise, // OBRIGATÓRIO
        profundidade: 10 + Math.floor(Math.random() * 30),
        pH: pHValue, // OBRIGATÓRIO (campo com letra maiúscula no meio)
        materia_organica: 2.0 + Math.random() * 4,
        nitrogenio: 20 + Math.random() * 80,
        fosforo: 10 + Math.random() * 40,
        potassio: 50 + Math.random() * 150,
        observacoes: 'Análise de teste'
      };
      
      const result = DatabaseService.create('QualidadeSolo', analise);
      if (result.success) {
        analises.push(analise);
        Logger.log(`  ✅ ${analise.local} - pH: ${analise.pH.toFixed(2)}`);
      } else {
        Logger.log(`  ❌ ${analise.local}: ${result.error}`);
      }
    }
    
    return analises;
  },

  /**
   * Gera observações de biodiversidade
   */
  generateBiodiversidade: function(count) {
    Logger.log(`\n🦜 Gerando ${count} observações de biodiversidade...`);
    
    const fauna = [
      { especie: 'Ara ararauna', nome_popular: 'Arara-canindé' },
      { especie: 'Chrysocyon brachyurus', nome_popular: 'Lobo-guará' },
      { especie: 'Myrmecophaga tridactyla', nome_popular: 'Tamanduá-bandeira' },
      { especie: 'Rhea americana', nome_popular: 'Ema' }
    ];
    
    const flora = [
      { especie: 'Caryocar brasiliense', nome_popular: 'Pequi' },
      { especie: 'Dipteryx alata', nome_popular: 'Baru' },
      { especie: 'Eugenia dysenterica', nome_popular: 'Cagaita' },
      { especie: 'Mauritia flexuosa', nome_popular: 'Buriti' }
    ];
    
    const observacoes = [];
    
    for (let i = 0; i < count; i++) {
      const isFauna = Math.random() > 0.5;
      const especies = isFauna ? fauna : flora;
      const especie = especies[Math.floor(Math.random() * especies.length)];
      
      const locais = ['Trilha Principal', 'Mirante do Vale', 'Mata de Galeria', 'Vereda do Buritizal'];
      
      const local = locais[Math.floor(Math.random() * locais.length)];
      const tipo = isFauna ? 'Fauna' : 'Flora';
      const dataObs = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const obs = {
        id: `BIO_${Date.now()}_${i}`,
        timestamp: new Date(),
        data: dataObs, // OBRIGATÓRIO
        local: local, // OBRIGATÓRIO
        tipo_observacao: tipo, // OBRIGATÓRIO
        tipo: tipo,
        categoria: tipo,
        especie: especie.especie,
        nome_popular: especie.nome_popular,
        quantidade: Math.floor(Math.random() * 10) + 1,
        comportamento: isFauna ? ['Alimentação', 'Descanso', 'Deslocamento'][Math.floor(Math.random() * 3)] : '',
        habitat: ['Cerrado', 'Mata de galeria', 'Vereda'][Math.floor(Math.random() * 3)],
        observacoes: 'Observação de teste'
      };
      
      const result = DatabaseService.create('Biodiversidade', obs);
      if (result.success) {
        observacoes.push(obs);
        Logger.log(`  ✅ ${obs.nome_popular} (${obs.tipo})`);
      } else {
        Logger.log(`  ❌ ${obs.nome_popular}: ${result.error}`);
      }
    }
    
    return observacoes;
  },

  /**
   * Gera dados de produção agroflorestal
   */
  generateProducao: function(count) {
    Logger.log(`\n🌾 Gerando ${count} registros de produção...`);
    
    const produtos = [
      { nome: 'Pequi', unidade: 'kg' },
      { nome: 'Baru', unidade: 'kg' },
      { nome: 'Cagaita', unidade: 'kg' },
      { nome: 'Mel', unidade: 'kg' },
      { nome: 'Polpa de Buriti', unidade: 'kg' }
    ];
    
    const producoes = [];
    
    for (let i = 0; i < count; i++) {
      const produto = produtos[Math.floor(Math.random() * produtos.length)];
      const quantidade_val = Math.floor(Math.random() * 100) + 10;
      
      const parcelaId = `PARCELA_${['A1', 'A2', 'B1', 'B2'][Math.floor(Math.random() * 4)]}_TEST`;
      
      const prod = {
        id: `PROD_${Date.now()}_${i}`,
        timestamp: new Date(),
        parcela_id: parcelaId, // OBRIGATÓRIO
        produto: produto.nome, // OBRIGATÓRIO
        quantidade_kg: quantidade_val, // OBRIGATÓRIO
        quantidade: quantidade_val,
        unidade: produto.unidade,
        area: 'Parcela ' + ['A1', 'A2', 'B1', 'B2'][Math.floor(Math.random() * 4)],
        data_colheita: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        qualidade: ['Excelente', 'Boa', 'Regular'][Math.floor(Math.random() * 3)],
        observacoes: 'Produção de teste'
      };
      
      const result = DatabaseService.create('ProducaoAgroflorestal', prod);
      if (result.success) {
        producoes.push(prod);
        Logger.log(`  ✅ ${prod.produto}: ${prod.quantidade_kg}${prod.unidade}`);
      } else {
        Logger.log(`  ❌ ${prod.produto}: ${result.error}`);
      }
    }
    
    return producoes;
  },

  /**
   * Gera avaliações terapêuticas
   */
  generateTerapia: function(count) {
    Logger.log(`\n💚 Gerando ${count} avaliações terapêuticas...`);
    
    const participantes = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'];
    const atividades = ['Caminhada contemplativa', 'Meditação na natureza', 'Observação de aves', 'Banho de floresta'];
    
    const avaliacoes = [];
    
    for (let i = 0; i < count; i++) {
      const participante_nome = participantes[Math.floor(Math.random() * participantes.length)];
      
      const participanteId = `PART_${participante_nome.replace(' ', '_').toUpperCase()}_TEST`;
      const dataSessao = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const tipoTerapia = atividades[Math.floor(Math.random() * atividades.length)];
      
      const aval = {
        id: `TERAPIA_${Date.now()}_${i}`,
        timestamp: new Date(),
        participante_id: participanteId, // OBRIGATÓRIO
        participante: participante_nome,
        data: dataSessao, // OBRIGATÓRIO
        tipo_terapia: tipoTerapia, // OBRIGATÓRIO
        duracao: 30 + Math.floor(Math.random() * 90),
        atividade: atividades[Math.floor(Math.random() * atividades.length)],
        humor_inicial: ['Muito Positivo', 'Positivo', 'Neutro', 'Negativo'][Math.floor(Math.random() * 4)],
        humor_final: ['Muito Positivo', 'Positivo'][Math.floor(Math.random() * 2)],
        observacoes: 'Sessão de teste'
      };
      
      const result = DatabaseService.create('SessoesTerapia', aval);
      if (result.success) {
        avaliacoes.push(aval);
        Logger.log(`  ✅ ${aval.participante} - ${aval.atividade}`);
      } else {
        Logger.log(`  ❌ ${aval.participante}: ${result.error}`);
      }
    }
    
    return avaliacoes;
  },

  /**
   * Gera cadastros de visitantes
   */
  generateVisitantes: function(count) {
    Logger.log(`\n👤 Gerando ${count} visitantes...`);
    
    const nomes = [
      'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa',
      'Carlos Ferreira', 'Juliana Lima', 'Roberto Alves', 'Fernanda Souza',
      'Lucas Martins', 'Beatriz Rocha', 'Rafael Dias', 'Camila Ribeiro',
      'Thiago Mendes', 'Larissa Cardoso', 'Felipe Barbosa', 'Gabriela Pinto',
      'Marcelo Castro', 'Patricia Gomes', 'André Moreira', 'Renata Freitas'
    ];
    
    const cidades = ['Brasília', 'Goiânia', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
    const motivos = ['Turismo', 'Pesquisa', 'Educação', 'Trabalho'];
    
    const visitantes = [];
    
    for (let i = 0; i < count; i++) {
      const nome = nomes[i % nomes.length];
      const vis = {
        nome: nome,
        email: nome.toLowerCase().replace(' ', '.') + '@example.com',
        telefone: `(61) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        cidade: cidades[Math.floor(Math.random() * cidades.length)],
        data_visita: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        motivo: motivos[Math.floor(Math.random() * motivos.length)],
        observacoes: 'Visitante de teste'
      };
      
      const result = DatabaseService.create('Visitantes', vis);
      if (result.success) {
        visitantes.push(vis);
        Logger.log(`  ✅ ${vis.nome} - ${vis.cidade}`);
      } else {
        Logger.log(`  ❌ ${vis.nome}: ${result.error}`);
      }
    }
    
    return visitantes;
  },

  /**
   * Limpa todos os dados de teste
   */
  clearTestData: function() {
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🗑️ LIMPANDO DADOS DE TESTE');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    const sheets = [
      'Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo',
      'Biodiversidade', 'ProducaoAgroflorestal', 'SessoesTerapia', 'Visitantes'
    ];
    
    sheets.forEach(sheetName => {
      try {
        const sheet = getSheet(sheetName);
        const lastRow = sheet.getLastRow();
        
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
          Logger.log(`✅ ${sheetName}: ${lastRow - 1} registros removidos`);
        } else {
          Logger.log(`ℹ️ ${sheetName}: Nenhum registro para remover`);
        }
      } catch (e) {
        Logger.log(`❌ ${sheetName}: ${e.toString()}`);
      }
    });
    
    Logger.log('\n═══════════════════════════════════════════════════════════');
    Logger.log('✅ LIMPEZA CONCLUÍDA');
    Logger.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * Funções de atalho
 */
function generateTestData() {
  return DataGenerator.generateAll();
}

function clearTestData() {
  return DataGenerator.clearTestData();
}
