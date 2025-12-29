/**
 * ═══════════════════════════════════════════════════════════════════════════
 * POPULATE ALL SHEETS - Reserva Araras
 * ═══════════════════════════════════════════════════════════════════════════
 * Popula TODAS as abas do CRUD com pelo menos 5 registros cada
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

const PopulateAllSheets = {

  /**
   * Função principal - Popula todas as planilhas
   */
  populateAll: function() {
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🚀 POPULANDO TODAS AS PLANILHAS DO SISTEMA');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    const results = {};
    
    // Agrofloresta
    results.parcelas = this.populateParcelas();
    results.producao = this.populateProducao();
    results.especiesAgro = this.populateEspeciesAgro();
    
    // Monitoramento Ambiental
    results.dadosClima = this.populateDadosClimaticos();
    results.qualidadeAgua = this.populateQualidadeAgua();
    results.qualidadeSolo = this.populateQualidadeSolo();
    results.biodiversidade = this.populateBiodiversidade();
    results.carbono = this.populateCarbono();
    
    // Ecoturismo
    results.visitantes = this.populateVisitantes();
    results.trilhas = this.populateTrilhas();
    results.avaliacoes = this.populateAvaliacoesEcoturismo();
    
    // GPS e Waypoints
    results.gpsPoints = this.populateGPSPoints();
    results.waypoints = this.populateWaypoints();
    results.rotas = this.populateRotas();
    results.fotos = this.populateFotos();
    
    // Terapias
    results.participantes = this.populateParticipantes();
    results.sessoes = this.populateSessoes();
    results.avaliacoesTerapia = this.populateAvaliacoesTerapia();
    
    // Fitoterapia
    results.plantasMedicinais = this.populatePlantasMedicinais();
    results.preparacoes = this.populatePreparacoes();
    
    // Sistema
    results.usuarios = this.populateUsuarios();
    
    this.printSummary(results);
    return results;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGROFLORESTA
  // ═══════════════════════════════════════════════════════════════════════════

  populateParcelas: function() {
    Logger.log('🌳 Populando ParcelasAgroflorestais...');
    const data = [
      { nome: 'Parcela Cerrado Norte', tipo_sistema: 'SAF Sucessional', area_ha: 2.5, idade_anos: 5, custo_implantacao: 15000, custo_manutencao_anual: 3000, localizacao: 'Setor Norte', responsavel: 'João Silva', latitude: -13.4521, longitude: -46.3215, observacoes: 'Sistema maduro', status: 'Ativo' },
      { nome: 'Parcela Mata Ciliar', tipo_sistema: 'Agrossilvipastoril', area_ha: 3.2, idade_anos: 3, custo_implantacao: 18000, custo_manutencao_anual: 4000, localizacao: 'Margem Rio', responsavel: 'Maria Santos', latitude: -13.4612, longitude: -46.3301, observacoes: 'Recuperação APP', status: 'Ativo' },
      { nome: 'Parcela Experimental A', tipo_sistema: 'SAF Biodiverso', area_ha: 1.8, idade_anos: 7, custo_implantacao: 12000, custo_manutencao_anual: 2500, localizacao: 'Centro', responsavel: 'Pedro Oliveira', latitude: -13.4489, longitude: -46.3178, observacoes: 'Alta produtividade', status: 'Ativo' },
      { nome: 'Parcela Frutíferas', tipo_sistema: 'Pomar Agroflorestal', area_ha: 2.0, idade_anos: 4, custo_implantacao: 20000, custo_manutencao_anual: 5000, localizacao: 'Setor Sul', responsavel: 'Ana Costa', latitude: -13.4701, longitude: -46.3412, observacoes: 'Foco em frutas nativas', status: 'Ativo' },
      { nome: 'Parcela Recuperação', tipo_sistema: 'Restauração Ecológica', area_ha: 4.5, idade_anos: 2, custo_implantacao: 25000, custo_manutencao_anual: 6000, localizacao: 'Área Degradada', responsavel: 'Carlos Ferreira', latitude: -13.4555, longitude: -46.3289, observacoes: 'Área em recuperação', status: 'Em implantação' }
    ];
    return this._insertRecords(CONFIG.SHEETS.PARCELAS_AGRO, data);
  },

  populateProducao: function() {
    Logger.log('🌾 Populando ProducaoAgroflorestal...');
    const data = [
      { parcela_id: 'PARCELA_001', data: new Date('2025-10-15'), produto: 'Pequi', quantidade_kg: 150, valor_reais: 750, qualidade: 'Excelente', destino: 'Feira Local', observacoes: 'Safra abundante' },
      { parcela_id: 'PARCELA_001', data: new Date('2025-09-20'), produto: 'Baru', quantidade_kg: 80, valor_reais: 640, qualidade: 'Boa', destino: 'Cooperativa', observacoes: 'Colheita manual' },
      { parcela_id: 'PARCELA_002', data: new Date('2025-11-05'), produto: 'Mel', quantidade_kg: 25, valor_reais: 500, qualidade: 'Premium', destino: 'Venda Direta', observacoes: 'Mel silvestre' },
      { parcela_id: 'PARCELA_003', data: new Date('2025-08-10'), produto: 'Cagaita', quantidade_kg: 60, valor_reais: 180, qualidade: 'Boa', destino: 'Processamento', observacoes: 'Para polpa' },
      { parcela_id: 'PARCELA_004', data: new Date('2025-12-01'), produto: 'Buriti', quantidade_kg: 200, valor_reais: 400, qualidade: 'Regular', destino: 'Indústria', observacoes: 'Óleo e polpa' }
    ];
    return this._insertRecords(CONFIG.SHEETS.PRODUCAO_AGRO, data);
  },

  populateEspeciesAgro: function() {
    Logger.log('🌿 Populando EspeciesAgroflorestais...');
    const data = [
      { nome_cientifico: 'Caryocar brasiliense', nome_comum: 'Pequi', familia: 'Caryocaraceae', tipo: 'Arbórea', uso: 'Alimentício/Medicinal', origem: 'Nativa', observacoes: 'Espécie símbolo do Cerrado' },
      { nome_cientifico: 'Dipteryx alata', nome_comum: 'Baru', familia: 'Fabaceae', tipo: 'Arbórea', uso: 'Alimentício', origem: 'Nativa', observacoes: 'Castanha muito nutritiva' },
      { nome_cientifico: 'Eugenia dysenterica', nome_comum: 'Cagaita', familia: 'Myrtaceae', tipo: 'Arbórea', uso: 'Alimentício', origem: 'Nativa', observacoes: 'Fruto para sucos e geleias' },
      { nome_cientifico: 'Mauritia flexuosa', nome_comum: 'Buriti', familia: 'Arecaceae', tipo: 'Palmeira', uso: 'Alimentício/Artesanato', origem: 'Nativa', observacoes: 'Palmeira das veredas' },
      { nome_cientifico: 'Hancornia speciosa', nome_comum: 'Mangaba', familia: 'Apocynaceae', tipo: 'Arbórea', uso: 'Alimentício', origem: 'Nativa', observacoes: 'Fruto para sorvetes' }
    ];
    return this._insertRecords(CONFIG.SHEETS.ESPECIES_AGRO, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONITORAMENTO AMBIENTAL
  // ═══════════════════════════════════════════════════════════════════════════

  populateDadosClimaticos: function() {
    Logger.log('🌡️ Populando DadosClimaticos...');
    const data = [
      { data: new Date('2025-12-20'), temperatura_min: 18.5, temperatura_max: 32.1, temperatura_media: 25.3, umidade: 65, precipitacao: 12.5, vento_velocidade: 8.2, vento_direcao: 'NE', pressao: 1013, radiacao_solar: 850, estacao: 'Estação Central', observacoes: 'Dia típico de verão' },
      { data: new Date('2025-12-21'), temperatura_min: 19.2, temperatura_max: 33.5, temperatura_media: 26.4, umidade: 58, precipitacao: 0, vento_velocidade: 5.1, vento_direcao: 'N', pressao: 1015, radiacao_solar: 920, estacao: 'Estação Central', observacoes: 'Dia ensolarado' },
      { data: new Date('2025-12-22'), temperatura_min: 20.1, temperatura_max: 29.8, temperatura_media: 24.9, umidade: 78, precipitacao: 45.2, vento_velocidade: 12.3, vento_direcao: 'SE', pressao: 1008, radiacao_solar: 450, estacao: 'Estação Central', observacoes: 'Chuva forte à tarde' },
      { data: new Date('2025-12-23'), temperatura_min: 17.8, temperatura_max: 28.5, temperatura_media: 23.2, umidade: 82, precipitacao: 8.1, vento_velocidade: 6.5, vento_direcao: 'E', pressao: 1010, radiacao_solar: 620, estacao: 'Estação Central', observacoes: 'Parcialmente nublado' },
      { data: new Date('2025-12-24'), temperatura_min: 18.9, temperatura_max: 31.2, temperatura_media: 25.1, umidade: 68, precipitacao: 2.3, vento_velocidade: 7.8, vento_direcao: 'NE', pressao: 1012, radiacao_solar: 780, estacao: 'Estação Central', observacoes: 'Garoa matinal' }
    ];
    return this._insertRecords(CONFIG.SHEETS.DADOS_CLIMA, data);
  },

  populateQualidadeAgua: function() {
    Logger.log('💧 Populando QualidadeAgua...');
    const data = [
      { data: new Date('2025-12-15'), local: 'Nascente Principal', latitude: -13.4521, longitude: -46.3215, pH: 6.8, oxigenio_dissolvido: 8.5, turbidez: 2.1, temperatura: 22.5, nitrogenio_total: 0.8, fosforo_total: 0.05, coliformes_termotolerantes: 50, solidos_totais: 120, condutividade: 85, dbo: 1.2, dqo: 3.5, responsavel: 'Maria Santos', observacoes: 'Água cristalina' },
      { data: new Date('2025-12-16'), local: 'Córrego das Araras', latitude: -13.4612, longitude: -46.3301, pH: 7.1, oxigenio_dissolvido: 7.8, turbidez: 5.3, temperatura: 24.1, nitrogenio_total: 1.2, fosforo_total: 0.08, coliformes_termotolerantes: 120, solidos_totais: 180, condutividade: 95, dbo: 2.1, dqo: 5.2, responsavel: 'João Silva', observacoes: 'Leve turbidez após chuva' },
      { data: new Date('2025-12-17'), local: 'Lago Central', latitude: -13.4489, longitude: -46.3178, pH: 7.5, oxigenio_dissolvido: 6.5, turbidez: 8.2, temperatura: 26.3, nitrogenio_total: 2.1, fosforo_total: 0.15, coliformes_termotolerantes: 200, solidos_totais: 250, condutividade: 120, dbo: 3.5, dqo: 8.1, responsavel: 'Pedro Oliveira', observacoes: 'Monitorar eutrofização' },
      { data: new Date('2025-12-18'), local: 'Rio Terra Ronca', latitude: -13.4701, longitude: -46.3412, pH: 6.9, oxigenio_dissolvido: 9.2, turbidez: 3.5, temperatura: 21.8, nitrogenio_total: 0.6, fosforo_total: 0.03, coliformes_termotolerantes: 30, solidos_totais: 95, condutividade: 72, dbo: 0.8, dqo: 2.1, responsavel: 'Ana Costa', observacoes: 'Excelente qualidade' },
      { data: new Date('2025-12-19'), local: 'Vereda do Buritizal', latitude: -13.4555, longitude: -46.3289, pH: 5.8, oxigenio_dissolvido: 5.5, turbidez: 15.2, temperatura: 25.5, nitrogenio_total: 3.5, fosforo_total: 0.25, coliformes_termotolerantes: 350, solidos_totais: 320, condutividade: 145, dbo: 4.8, dqo: 12.5, responsavel: 'Carlos Ferreira', observacoes: 'Água ácida típica de vereda' }
    ];
    return this._insertRecords(CONFIG.SHEETS.QUALIDADE_AGUA, data);
  },

  populateQualidadeSolo: function() {
    Logger.log('🌱 Populando QualidadeSolo...');
    const data = [
      { data: new Date('2025-11-10'), local: 'Parcela A1', latitude: -13.4521, longitude: -46.3215, pH: 5.5, materia_organica: 3.2, fosforo: 12, potassio: 85, calcio: 2.1, magnesio: 0.8, aluminio: 0.3, ctc: 8.5, saturacao_bases: 45, textura: 'Franco-arenoso', profundidade_cm: 20, responsavel: 'João Silva', observacoes: 'Solo típico de cerrado' },
      { data: new Date('2025-11-11'), local: 'Parcela A2', latitude: -13.4612, longitude: -46.3301, pH: 6.2, materia_organica: 4.5, fosforo: 18, potassio: 120, calcio: 3.5, magnesio: 1.2, aluminio: 0.1, ctc: 12.3, saturacao_bases: 62, textura: 'Franco-argiloso', profundidade_cm: 20, responsavel: 'Maria Santos', observacoes: 'Solo corrigido' },
      { data: new Date('2025-11-12'), local: 'Parcela B1', latitude: -13.4489, longitude: -46.3178, pH: 5.8, materia_organica: 5.1, fosforo: 25, potassio: 150, calcio: 4.2, magnesio: 1.5, aluminio: 0.2, ctc: 15.1, saturacao_bases: 58, textura: 'Argiloso', profundidade_cm: 30, responsavel: 'Pedro Oliveira', observacoes: 'Alta matéria orgânica' },
      { data: new Date('2025-11-13'), local: 'Parcela B2', latitude: -13.4701, longitude: -46.3412, pH: 5.2, materia_organica: 2.8, fosforo: 8, potassio: 65, calcio: 1.5, magnesio: 0.5, aluminio: 0.5, ctc: 6.8, saturacao_bases: 35, textura: 'Arenoso', profundidade_cm: 20, responsavel: 'Ana Costa', observacoes: 'Necessita correção' },
      { data: new Date('2025-11-14'), local: 'Área Recuperação', latitude: -13.4555, longitude: -46.3289, pH: 4.8, materia_organica: 1.5, fosforo: 5, potassio: 45, calcio: 0.8, magnesio: 0.3, aluminio: 0.8, ctc: 4.5, saturacao_bases: 25, textura: 'Franco-arenoso', profundidade_cm: 15, responsavel: 'Carlos Ferreira', observacoes: 'Solo degradado em recuperação' }
    ];
    return this._insertRecords(CONFIG.SHEETS.QUALIDADE_SOLO, data);
  },

  populateBiodiversidade: function() {
    Logger.log('🦜 Populando Biodiversidade...');
    const data = [
      { data: new Date('2025-12-10'), local: 'Trilha Principal', latitude: -13.4521, longitude: -46.3215, tipo_observacao: 'Fauna', especie_cientifica: 'Ara ararauna', especie_comum: 'Arara-canindé', familia: 'Psittacidae', quantidade: 4, comportamento: 'Alimentação', habitat: 'Cerrado', status_conservacao: 'Pouco preocupante', foto_id: 'FOTO_001', observador: 'João Silva', observacoes: 'Grupo alimentando-se de pequi' },
      { data: new Date('2025-12-11'), local: 'Mirante do Vale', latitude: -13.4612, longitude: -46.3301, tipo_observacao: 'Fauna', especie_cientifica: 'Chrysocyon brachyurus', especie_comum: 'Lobo-guará', familia: 'Canidae', quantidade: 1, comportamento: 'Deslocamento', habitat: 'Campo limpo', status_conservacao: 'Vulnerável', foto_id: 'FOTO_002', observador: 'Maria Santos', observacoes: 'Avistamento ao entardecer' },
      { data: new Date('2025-12-12'), local: 'Mata de Galeria', latitude: -13.4489, longitude: -46.3178, tipo_observacao: 'Flora', especie_cientifica: 'Caryocar brasiliense', especie_comum: 'Pequi', familia: 'Caryocaraceae', quantidade: 15, comportamento: '', habitat: 'Cerrado stricto sensu', status_conservacao: 'Pouco preocupante', foto_id: 'FOTO_003', observador: 'Pedro Oliveira', observacoes: 'Árvores em frutificação' },
      { data: new Date('2025-12-13'), local: 'Vereda do Buritizal', latitude: -13.4701, longitude: -46.3412, tipo_observacao: 'Fauna', especie_cientifica: 'Myrmecophaga tridactyla', especie_comum: 'Tamanduá-bandeira', familia: 'Myrmecophagidae', quantidade: 1, comportamento: 'Forrageamento', habitat: 'Vereda', status_conservacao: 'Vulnerável', foto_id: 'FOTO_004', observador: 'Ana Costa', observacoes: 'Buscando cupins' },
      { data: new Date('2025-12-14'), local: 'Campo Rupestre', latitude: -13.4555, longitude: -46.3289, tipo_observacao: 'Flora', especie_cientifica: 'Vellozia squamata', especie_comum: 'Canela-de-ema', familia: 'Velloziaceae', quantidade: 50, comportamento: '', habitat: 'Campo rupestre', status_conservacao: 'Pouco preocupante', foto_id: 'FOTO_005', observador: 'Carlos Ferreira', observacoes: 'População densa em floração' }
    ];
    return this._insertRecords(CONFIG.SHEETS.BIODIVERSIDADE, data);
  },

  populateCarbono: function() {
    Logger.log('🌲 Populando SequestrosCarbono...');
    const data = [
      { data: new Date('2025-06-15'), area_id: 'AREA_001', area_nome: 'Mata Ciliar Norte', tipo_vegetacao: 'Mata de Galeria', biomassa_aerea: 185.5, biomassa_subterranea: 55.6, area_ha: 12.5, idade_anos: 25, carbono_total: 120.5, co2_equivalente: 442.2, metodologia: 'IPCC 2006', responsavel: 'João Silva', observacoes: 'Floresta madura' },
      { data: new Date('2025-06-16'), area_id: 'AREA_002', area_nome: 'SAF Parcela A', tipo_vegetacao: 'Sistema Agroflorestal', biomassa_aerea: 85.2, biomassa_subterranea: 25.5, area_ha: 3.2, idade_anos: 8, carbono_total: 55.3, co2_equivalente: 203.0, metodologia: 'IPCC 2006', responsavel: 'Maria Santos', observacoes: 'SAF em desenvolvimento' },
      { data: new Date('2025-06-17'), area_id: 'AREA_003', area_nome: 'Cerrado Preservado', tipo_vegetacao: 'Cerrado stricto sensu', biomassa_aerea: 45.8, biomassa_subterranea: 68.7, area_ha: 50.0, idade_anos: 50, carbono_total: 57.2, co2_equivalente: 210.0, metodologia: 'IPCC 2006', responsavel: 'Pedro Oliveira', observacoes: 'Alta biomassa subterrânea' },
      { data: new Date('2025-06-18'), area_id: 'AREA_004', area_nome: 'Área Restauração', tipo_vegetacao: 'Restauração Ecológica', biomassa_aerea: 25.1, biomassa_subterranea: 7.5, area_ha: 5.5, idade_anos: 3, carbono_total: 16.3, co2_equivalente: 59.8, metodologia: 'IPCC 2006', responsavel: 'Ana Costa', observacoes: 'Área em recuperação' },
      { data: new Date('2025-06-19'), area_id: 'AREA_005', area_nome: 'Vereda Protegida', tipo_vegetacao: 'Vereda', biomassa_aerea: 35.2, biomassa_subterranea: 42.3, area_ha: 8.0, idade_anos: 40, carbono_total: 38.7, co2_equivalente: 142.1, metodologia: 'IPCC 2006', responsavel: 'Carlos Ferreira', observacoes: 'Área úmida preservada' }
    ];
    return this._insertRecords(CONFIG.SHEETS.CARBONO, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOTURISMO
  // ═══════════════════════════════════════════════════════════════════════════

  populateVisitantes: function() {
    Logger.log('👤 Populando Visitantes...');
    const data = [
      { data_visita: new Date('2025-12-20'), nome: 'Roberto Almeida', email: 'roberto.almeida@email.com', telefone: '(61) 99123-4567', origem_cidade: 'Brasília', origem_estado: 'DF', origem_pais: 'Brasil', tamanho_grupo: 4, faixa_etaria: '30-45', proposito: 'Turismo', trilha_id: 'TRILHA_001', guia: 'João Silva', observacoes: 'Família com crianças' },
      { data_visita: new Date('2025-12-21'), nome: 'Fernanda Lima', email: 'fernanda.lima@email.com', telefone: '(62) 98765-4321', origem_cidade: 'Goiânia', origem_estado: 'GO', origem_pais: 'Brasil', tamanho_grupo: 2, faixa_etaria: '25-35', proposito: 'Pesquisa', trilha_id: 'TRILHA_002', guia: 'Maria Santos', observacoes: 'Pesquisadora de biodiversidade' },
      { data_visita: new Date('2025-12-22'), nome: 'Carlos Mendes', email: 'carlos.mendes@email.com', telefone: '(11) 97654-3210', origem_cidade: 'São Paulo', origem_estado: 'SP', origem_pais: 'Brasil', tamanho_grupo: 8, faixa_etaria: '18-25', proposito: 'Educação', trilha_id: 'TRILHA_001', guia: 'Pedro Oliveira', observacoes: 'Grupo de estudantes' },
      { data_visita: new Date('2025-12-23'), nome: 'Ana Beatriz', email: 'ana.beatriz@email.com', telefone: '(31) 96543-2109', origem_cidade: 'Belo Horizonte', origem_estado: 'MG', origem_pais: 'Brasil', tamanho_grupo: 3, faixa_etaria: '45-60', proposito: 'Turismo', trilha_id: 'TRILHA_003', guia: 'Ana Costa', observacoes: 'Observadores de aves' },
      { data_visita: new Date('2025-12-24'), nome: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', telefone: '(21) 95432-1098', origem_cidade: 'Rio de Janeiro', origem_estado: 'RJ', origem_pais: 'Brasil', tamanho_grupo: 6, faixa_etaria: '35-50', proposito: 'Turismo', trilha_id: 'TRILHA_002', guia: 'Carlos Ferreira', observacoes: 'Grupo de amigos' }
    ];
    return this._insertRecords(CONFIG.SHEETS.VISITANTES, data);
  },

  populateTrilhas: function() {
    Logger.log('🥾 Populando Trilhas...');
    const data = [
      { nome: 'Trilha das Araras', descricao: 'Trilha principal com avistamento de araras', distancia_km: 3.5, largura_m: 1.5, tempo_visita_horas: 2.5, dificuldade: 'Moderada', elevacao_m: 150, tipo_terreno: 'Misto', pontos_interesse: 'Mirante, Cachoeira, Ninho de araras', infraestrutura: 'Sinalização, Bancos', melhor_epoca: 'Maio a Setembro', restricoes: 'Não permitido animais', latitude_inicio: -13.4521, longitude_inicio: -46.3215, status: 'Aberta', observacoes: 'Trilha mais popular' },
      { nome: 'Trilha da Cachoeira', descricao: 'Acesso à cachoeira principal da reserva', distancia_km: 2.0, largura_m: 2.0, tempo_visita_horas: 1.5, dificuldade: 'Fácil', elevacao_m: 80, tipo_terreno: 'Pedregoso', pontos_interesse: 'Cachoeira, Poço para banho', infraestrutura: 'Corrimão, Escadas', melhor_epoca: 'Ano todo', restricoes: 'Cuidado com pedras escorregadias', latitude_inicio: -13.4612, longitude_inicio: -46.3301, status: 'Aberta', observacoes: 'Ideal para famílias' },
      { nome: 'Trilha do Cerrado', descricao: 'Imersão no cerrado stricto sensu', distancia_km: 5.0, largura_m: 1.2, tempo_visita_horas: 4.0, dificuldade: 'Difícil', elevacao_m: 250, tipo_terreno: 'Arenoso', pontos_interesse: 'Pequizeiros, Campo rupestre', infraestrutura: 'Sinalização básica', melhor_epoca: 'Abril a Outubro', restricoes: 'Necessário guia', latitude_inicio: -13.4489, longitude_inicio: -46.3178, status: 'Aberta', observacoes: 'Para aventureiros' },
      { nome: 'Trilha da Vereda', descricao: 'Caminhada pela vereda do buritizal', distancia_km: 2.8, largura_m: 1.0, tempo_visita_horas: 2.0, dificuldade: 'Moderada', elevacao_m: 50, tipo_terreno: 'Úmido', pontos_interesse: 'Buritizal, Fauna aquática', infraestrutura: 'Passarelas de madeira', melhor_epoca: 'Junho a Novembro', restricoes: 'Evitar época de chuvas', latitude_inicio: -13.4701, longitude_inicio: -46.3412, status: 'Aberta', observacoes: 'Paisagem única' },
      { nome: 'Trilha Noturna', descricao: 'Observação de fauna noturna', distancia_km: 1.5, largura_m: 1.8, tempo_visita_horas: 2.0, dificuldade: 'Fácil', elevacao_m: 30, tipo_terreno: 'Plano', pontos_interesse: 'Fauna noturna, Céu estrelado', infraestrutura: 'Iluminação solar', melhor_epoca: 'Ano todo', restricoes: 'Apenas com guia, grupos pequenos', latitude_inicio: -13.4555, longitude_inicio: -46.3289, status: 'Aberta', observacoes: 'Experiência única' }
    ];
    return this._insertRecords(CONFIG.SHEETS.TRILHAS, data);
  },

  populateAvaliacoesEcoturismo: function() {
    Logger.log('⭐ Populando AvaliacoesEcoturismo...');
    const data = [
      { visitante_id: 'VIS_001', data: new Date('2025-12-20'), nota: 5, aspectos_positivos: 'Natureza preservada, guia excelente', aspectos_negativos: 'Nenhum', sugestoes: 'Mais pontos de descanso', recomendaria: 'Sim', comentario: 'Experiência incrível!', respondido_por: 'Equipe' },
      { visitante_id: 'VIS_002', data: new Date('2025-12-21'), nota: 4, aspectos_positivos: 'Biodiversidade impressionante', aspectos_negativos: 'Trilha um pouco longa', sugestoes: 'Opção de trilha mais curta', recomendaria: 'Sim', comentario: 'Muito bom para pesquisa', respondido_por: 'Equipe' },
      { visitante_id: 'VIS_003', data: new Date('2025-12-22'), nota: 5, aspectos_positivos: 'Ótimo para educação ambiental', aspectos_negativos: 'Nenhum', sugestoes: 'Material didático para levar', recomendaria: 'Sim', comentario: 'Alunos adoraram!', respondido_por: 'Equipe' },
      { visitante_id: 'VIS_004', data: new Date('2025-12-23'), nota: 5, aspectos_positivos: 'Avistamos muitas aves', aspectos_negativos: 'Nenhum', sugestoes: 'Binóculos para empréstimo', recomendaria: 'Sim', comentario: 'Paraíso para birdwatchers', respondido_por: 'Equipe' },
      { visitante_id: 'VIS_005', data: new Date('2025-12-24'), nota: 4, aspectos_positivos: 'Paisagens lindas', aspectos_negativos: 'Calor intenso', sugestoes: 'Mais sombra no percurso', recomendaria: 'Sim', comentario: 'Vale muito a pena', respondido_por: 'Equipe' }
    ];
    return this._insertRecords(CONFIG.SHEETS.AVALIACOES, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GPS E WAYPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  populateGPSPoints: function() {
    Logger.log('📍 Populando GPSPoints...');
    const data = [
      { tipo: 'Waypoint', nome: 'Entrada Principal', descricao: 'Portão de entrada da reserva', latitude: -13.4500, longitude: -46.3200, altitude: 850, precisao: 3.5, categoria: 'Infraestrutura', trilha_id: 'TRILHA_001', foto_id: 'FOTO_001', usuario: 'admin', data_coleta: new Date('2025-01-15'), observacoes: 'Ponto de referência principal' },
      { tipo: 'Waypoint', nome: 'Cachoeira Grande', descricao: 'Queda principal de 25m', latitude: -13.4612, longitude: -46.3301, altitude: 780, precisao: 2.8, categoria: 'Atrativo', trilha_id: 'TRILHA_002', foto_id: 'FOTO_002', usuario: 'admin', data_coleta: new Date('2025-01-16'), observacoes: 'Melhor horário: manhã' },
      { tipo: 'Track', nome: 'Mirante do Vale', descricao: 'Vista panorâmica do vale', latitude: -13.4489, longitude: -46.3178, altitude: 920, precisao: 4.1, categoria: 'Mirante', trilha_id: 'TRILHA_003', foto_id: 'FOTO_003', usuario: 'admin', data_coleta: new Date('2025-01-17'), observacoes: 'Pôr do sol espetacular' },
      { tipo: 'Waypoint', nome: 'Área de Camping', descricao: 'Local para acampamento', latitude: -13.4555, longitude: -46.3289, altitude: 860, precisao: 3.2, categoria: 'Infraestrutura', trilha_id: 'TRILHA_001', foto_id: 'FOTO_004', usuario: 'admin', data_coleta: new Date('2025-01-18'), observacoes: 'Capacidade: 20 barracas' },
      { tipo: 'POI', nome: 'Ninho de Araras', descricao: 'Local de nidificação', latitude: -13.4521, longitude: -46.3215, altitude: 870, precisao: 5.0, categoria: 'Fauna', trilha_id: 'TRILHA_001', foto_id: 'FOTO_005', usuario: 'admin', data_coleta: new Date('2025-01-19'), observacoes: 'Observar à distância' }
    ];
    return this._insertRecords(CONFIG.SHEETS.GPS_POINTS, data);
  },

  populateWaypoints: function() {
    Logger.log('🗺️ Populando Waypoints...');
    const data = [
      { nome: 'Centro de Visitantes', descricao: 'Recepção e informações', latitude: -13.4500, longitude: -46.3200, altitude: 850, categoria: 'Infraestrutura', icone: 'building', cor: '#4CAF50', trilha_id: 'TRILHA_001', foto_ids: 'FOTO_001,FOTO_002', usuario: 'admin', data_criacao: new Date('2025-01-10'), visivel: true, observacoes: 'Ponto inicial' },
      { nome: 'Bifurcação Norte', descricao: 'Divisão trilhas Norte/Sul', latitude: -13.4521, longitude: -46.3215, altitude: 865, categoria: 'Navegação', icone: 'fork', cor: '#2196F3', trilha_id: 'TRILHA_001', foto_ids: 'FOTO_003', usuario: 'admin', data_criacao: new Date('2025-01-11'), visivel: true, observacoes: 'Sinalização clara' },
      { nome: 'Ponte de Madeira', descricao: 'Travessia do córrego', latitude: -13.4612, longitude: -46.3301, altitude: 790, categoria: 'Infraestrutura', icone: 'bridge', cor: '#795548', trilha_id: 'TRILHA_002', foto_ids: 'FOTO_004', usuario: 'admin', data_criacao: new Date('2025-01-12'), visivel: true, observacoes: 'Capacidade: 10 pessoas' },
      { nome: 'Área de Descanso', descricao: 'Bancos e sombra', latitude: -13.4489, longitude: -46.3178, altitude: 880, categoria: 'Descanso', icone: 'bench', cor: '#FF9800', trilha_id: 'TRILHA_003', foto_ids: 'FOTO_005', usuario: 'admin', data_criacao: new Date('2025-01-13'), visivel: true, observacoes: 'Água potável disponível' },
      { nome: 'Ponto de Observação', descricao: 'Observação de fauna', latitude: -13.4555, longitude: -46.3289, altitude: 900, categoria: 'Observação', icone: 'binoculars', cor: '#9C27B0', trilha_id: 'TRILHA_001', foto_ids: 'FOTO_006', usuario: 'admin', data_criacao: new Date('2025-01-14'), visivel: true, observacoes: 'Silêncio recomendado' }
    ];
    return this._insertRecords(CONFIG.SHEETS.WAYPOINTS, data);
  },

  populateRotas: function() {
    Logger.log('🛤️ Populando Rotas...');
    const data = [
      { nome: 'Rota Completa', descricao: 'Circuito completo da reserva', tipo: 'Circular', distancia_km: 8.5, duracao_horas: 5.0, dificuldade: 'Difícil', pontos_gps: '[-13.45,-46.32],[-13.46,-46.33],[-13.45,-46.31]', waypoints_ids: 'WP_001,WP_002,WP_003', elevacao_ganho: 350, elevacao_perda: 350, usuario: 'admin', data_criacao: new Date('2025-02-01'), publica: true, observacoes: 'Para experientes' },
      { nome: 'Rota Família', descricao: 'Percurso fácil para famílias', tipo: 'Ida e volta', distancia_km: 3.0, duracao_horas: 2.0, dificuldade: 'Fácil', pontos_gps: '[-13.45,-46.32],[-13.46,-46.33]', waypoints_ids: 'WP_001,WP_003', elevacao_ganho: 80, elevacao_perda: 80, usuario: 'admin', data_criacao: new Date('2025-02-02'), publica: true, observacoes: 'Ideal para crianças' },
      { nome: 'Rota Cachoeiras', descricao: 'Visita às principais cachoeiras', tipo: 'Linear', distancia_km: 4.5, duracao_horas: 3.0, dificuldade: 'Moderada', pontos_gps: '[-13.45,-46.32],[-13.46,-46.33],[-13.47,-46.34]', waypoints_ids: 'WP_002,WP_004', elevacao_ganho: 150, elevacao_perda: 200, usuario: 'admin', data_criacao: new Date('2025-02-03'), publica: true, observacoes: 'Levar roupa de banho' },
      { nome: 'Rota Observação', descricao: 'Foco em observação de fauna', tipo: 'Circular', distancia_km: 2.5, duracao_horas: 3.0, dificuldade: 'Fácil', pontos_gps: '[-13.45,-46.32],[-13.45,-46.31]', waypoints_ids: 'WP_005', elevacao_ganho: 50, elevacao_perda: 50, usuario: 'admin', data_criacao: new Date('2025-02-04'), publica: true, observacoes: 'Melhor ao amanhecer' },
      { nome: 'Rota Cerrado', descricao: 'Imersão no cerrado nativo', tipo: 'Linear', distancia_km: 6.0, duracao_horas: 4.0, dificuldade: 'Moderada', pontos_gps: '[-13.44,-46.31],[-13.45,-46.32],[-13.46,-46.33]', waypoints_ids: 'WP_001,WP_002,WP_003,WP_004', elevacao_ganho: 200, elevacao_perda: 150, usuario: 'admin', data_criacao: new Date('2025-02-05'), publica: true, observacoes: 'Flora típica do cerrado' }
    ];
    return this._insertRecords(CONFIG.SHEETS.ROTAS, data);
  },

  populateFotos: function() {
    Logger.log('📷 Populando Fotos...');
    const data = [
      { nome_arquivo: 'arara_caninde_001.jpg', drive_id: 'DRIVE_001', drive_url: 'https://drive.google.com/file/d/DRIVE_001', tipo: 'JPEG', categoria: 'Fauna', latitude: -13.4521, longitude: -46.3215, waypoint_id: 'WP_001', trilha_id: 'TRILHA_001', descricao: 'Arara-canindé em voo', tags: 'arara,fauna,cerrado', usuario: 'João Silva', data_upload: new Date('2025-12-10'), tamanho_bytes: 2500000, largura: 4000, altura: 3000, observacoes: 'Foto premiada' },
      { nome_arquivo: 'cachoeira_principal.jpg', drive_id: 'DRIVE_002', drive_url: 'https://drive.google.com/file/d/DRIVE_002', tipo: 'JPEG', categoria: 'Paisagem', latitude: -13.4612, longitude: -46.3301, waypoint_id: 'WP_002', trilha_id: 'TRILHA_002', descricao: 'Cachoeira principal 25m', tags: 'cachoeira,água,paisagem', usuario: 'Maria Santos', data_upload: new Date('2025-12-11'), tamanho_bytes: 3200000, largura: 4500, altura: 3000, observacoes: 'Época de cheia' },
      { nome_arquivo: 'pequizeiro_florido.jpg', drive_id: 'DRIVE_003', drive_url: 'https://drive.google.com/file/d/DRIVE_003', tipo: 'JPEG', categoria: 'Flora', latitude: -13.4489, longitude: -46.3178, waypoint_id: 'WP_003', trilha_id: 'TRILHA_003', descricao: 'Pequizeiro em floração', tags: 'pequi,flora,cerrado', usuario: 'Pedro Oliveira', data_upload: new Date('2025-12-12'), tamanho_bytes: 1800000, largura: 3500, altura: 2500, observacoes: 'Setembro' },
      { nome_arquivo: 'lobo_guara.jpg', drive_id: 'DRIVE_004', drive_url: 'https://drive.google.com/file/d/DRIVE_004', tipo: 'JPEG', categoria: 'Fauna', latitude: -13.4555, longitude: -46.3289, waypoint_id: 'WP_004', trilha_id: 'TRILHA_001', descricao: 'Lobo-guará ao entardecer', tags: 'lobo-guará,fauna,cerrado', usuario: 'Ana Costa', data_upload: new Date('2025-12-13'), tamanho_bytes: 2100000, largura: 4000, altura: 2800, observacoes: 'Registro raro' },
      { nome_arquivo: 'vista_mirante.jpg', drive_id: 'DRIVE_005', drive_url: 'https://drive.google.com/file/d/DRIVE_005', tipo: 'JPEG', categoria: 'Paisagem', latitude: -13.4701, longitude: -46.3412, waypoint_id: 'WP_005', trilha_id: 'TRILHA_003', descricao: 'Vista panorâmica do mirante', tags: 'mirante,paisagem,pôr-do-sol', usuario: 'Carlos Ferreira', data_upload: new Date('2025-12-14'), tamanho_bytes: 4500000, largura: 6000, altura: 4000, observacoes: 'Pôr do sol' }
    ];
    return this._insertRecords(CONFIG.SHEETS.FOTOS, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TERAPIAS
  // ═══════════════════════════════════════════════════════════════════════════

  populateParticipantes: function() {
    Logger.log('💚 Populando ParticipantesTerapia...');
    const data = [
      { nome: 'Mariana Silva', data_nascimento: new Date('1985-03-15'), idade: 39, genero: 'Feminino', email: 'mariana.silva@email.com', telefone: '(61) 99111-2222', endereco: 'Rua das Flores, 123', cidade: 'Brasília', estado: 'DF', data_inicio: new Date('2025-06-01'), condicao_principal: 'Ansiedade', condicoes_secundarias: 'Insônia', medicamentos: 'Nenhum', alergias: 'Nenhuma', contato_emergencia: 'João Silva', telefone_emergencia: '(61) 99333-4444', status: 'Ativo', observacoes: 'Primeira experiência com ecoterapia' },
      { nome: 'Ricardo Santos', data_nascimento: new Date('1978-07-22'), idade: 46, genero: 'Masculino', email: 'ricardo.santos@email.com', telefone: '(62) 98222-3333', endereco: 'Av. Central, 456', cidade: 'Goiânia', estado: 'GO', data_inicio: new Date('2025-05-15'), condicao_principal: 'Estresse', condicoes_secundarias: 'Hipertensão leve', medicamentos: 'Anti-hipertensivo', alergias: 'Pólen', contato_emergencia: 'Ana Santos', telefone_emergencia: '(62) 98444-5555', status: 'Ativo', observacoes: 'Executivo em burnout' },
      { nome: 'Juliana Costa', data_nascimento: new Date('1992-11-08'), idade: 32, genero: 'Feminino', email: 'juliana.costa@email.com', telefone: '(11) 97333-4444', endereco: 'Rua Verde, 789', cidade: 'São Paulo', estado: 'SP', data_inicio: new Date('2025-07-01'), condicao_principal: 'Depressão leve', condicoes_secundarias: 'Nenhuma', medicamentos: 'Antidepressivo', alergias: 'Nenhuma', contato_emergencia: 'Pedro Costa', telefone_emergencia: '(11) 97555-6666', status: 'Ativo', observacoes: 'Responde bem à natureza' },
      { nome: 'Fernando Oliveira', data_nascimento: new Date('1965-02-28'), idade: 59, genero: 'Masculino', email: 'fernando.oliveira@email.com', telefone: '(31) 96444-5555', endereco: 'Praça da Paz, 101', cidade: 'Belo Horizonte', estado: 'MG', data_inicio: new Date('2025-04-10'), condicao_principal: 'Recuperação pós-cirúrgica', condicoes_secundarias: 'Diabetes tipo 2', medicamentos: 'Metformina', alergias: 'Dipirona', contato_emergencia: 'Maria Oliveira', telefone_emergencia: '(31) 96666-7777', status: 'Ativo', observacoes: 'Reabilitação física' },
      { nome: 'Beatriz Lima', data_nascimento: new Date('2000-09-12'), idade: 24, genero: 'Feminino', email: 'beatriz.lima@email.com', telefone: '(21) 95555-6666', endereco: 'Rua do Sol, 202', cidade: 'Rio de Janeiro', estado: 'RJ', data_inicio: new Date('2025-08-01'), condicao_principal: 'TDAH', condicoes_secundarias: 'Ansiedade social', medicamentos: 'Ritalina', alergias: 'Nenhuma', contato_emergencia: 'Carlos Lima', telefone_emergencia: '(21) 95777-8888', status: 'Ativo', observacoes: 'Estudante universitária' }
    ];
    return this._insertRecords(CONFIG.SHEETS.PARTICIPANTES, data);
  },

  populateSessoes: function() {
    Logger.log('🧘 Populando SessoesTerapia...');
    const data = [
      { participante_id: 'PART_001', data: new Date('2025-12-15'), hora_inicio: '08:00', hora_fim: '10:00', duracao_minutos: 120, tipo_terapia: 'Banho de Floresta', local: 'Trilha das Araras', trilha_id: 'TRILHA_001', terapeuta: 'Dr. Paulo Mendes', atividades: 'Caminhada contemplativa, meditação', clima: 'Ensolarado', temperatura: 25, satisfacao: 5, humor_antes: 'Ansioso', humor_depois: 'Calmo', observacoes_terapeuta: 'Excelente resposta', observacoes_participante: 'Me senti renovada' },
      { participante_id: 'PART_002', data: new Date('2025-12-16'), hora_inicio: '07:00', hora_fim: '09:30', duracao_minutos: 150, tipo_terapia: 'Ecoterapia', local: 'Mirante do Vale', trilha_id: 'TRILHA_003', terapeuta: 'Dra. Carla Souza', atividades: 'Observação de aves, respiração consciente', clima: 'Parcialmente nublado', temperatura: 23, satisfacao: 5, humor_antes: 'Estressado', humor_depois: 'Relaxado', observacoes_terapeuta: 'Progresso significativo', observacoes_participante: 'Melhor que esperava' },
      { participante_id: 'PART_003', data: new Date('2025-12-17'), hora_inicio: '16:00', hora_fim: '18:00', duracao_minutos: 120, tipo_terapia: 'Terapia na Natureza', local: 'Vereda do Buritizal', trilha_id: 'TRILHA_004', terapeuta: 'Dr. Paulo Mendes', atividades: 'Caminhada lenta, journaling', clima: 'Ensolarado', temperatura: 28, satisfacao: 4, humor_antes: 'Triste', humor_depois: 'Esperançosa', observacoes_terapeuta: 'Abertura emocional', observacoes_participante: 'Chorei mas foi bom' },
      { participante_id: 'PART_004', data: new Date('2025-12-18'), hora_inicio: '09:00', hora_fim: '11:00', duracao_minutos: 120, tipo_terapia: 'Reabilitação ao Ar Livre', local: 'Trilha Família', trilha_id: 'TRILHA_002', terapeuta: 'Fisio. Ana Ribeiro', atividades: 'Caminhada leve, alongamento', clima: 'Nublado', temperatura: 22, satisfacao: 5, humor_antes: 'Cansado', humor_depois: 'Energizado', observacoes_terapeuta: 'Mobilidade melhorou', observacoes_participante: 'Consegui andar mais' },
      { participante_id: 'PART_005', data: new Date('2025-12-19'), hora_inicio: '06:30', hora_fim: '08:30', duracao_minutos: 120, tipo_terapia: 'Mindfulness na Natureza', local: 'Área de Camping', trilha_id: 'TRILHA_001', terapeuta: 'Dra. Carla Souza', atividades: 'Meditação guiada, grounding', clima: 'Ensolarado', temperatura: 24, satisfacao: 5, humor_antes: 'Agitada', humor_depois: 'Focada', observacoes_terapeuta: 'Boa concentração', observacoes_participante: 'Consegui me concentrar' }
    ];
    return this._insertRecords(CONFIG.SHEETS.SESSOES, data);
  },

  populateAvaliacoesTerapia: function() {
    Logger.log('📊 Populando AvaliacoesTerapeuticas...');
    const data = [
      { participante_id: 'PART_001', sessao_id: 'SESS_001', data: new Date('2025-12-15'), escala_ansiedade: 3, escala_depressao: 2, escala_estresse: 3, escala_bemestar: 8, conexao_natureza: 9, qualidade_sono: 7, nivel_energia: 8, dor_fisica: 1, concentracao: 7, relacionamentos: 8, avaliador: 'Dr. Paulo Mendes', observacoes: 'Melhora significativa após sessão' },
      { participante_id: 'PART_002', sessao_id: 'SESS_002', data: new Date('2025-12-16'), escala_ansiedade: 4, escala_depressao: 2, escala_estresse: 4, escala_bemestar: 7, conexao_natureza: 8, qualidade_sono: 6, nivel_energia: 7, dor_fisica: 2, concentracao: 6, relacionamentos: 7, avaliador: 'Dra. Carla Souza', observacoes: 'Estresse ocupacional em redução' },
      { participante_id: 'PART_003', sessao_id: 'SESS_003', data: new Date('2025-12-17'), escala_ansiedade: 5, escala_depressao: 4, escala_estresse: 4, escala_bemestar: 6, conexao_natureza: 7, qualidade_sono: 5, nivel_energia: 5, dor_fisica: 1, concentracao: 5, relacionamentos: 6, avaliador: 'Dr. Paulo Mendes', observacoes: 'Processo emocional em andamento' },
      { participante_id: 'PART_004', sessao_id: 'SESS_004', data: new Date('2025-12-18'), escala_ansiedade: 2, escala_depressao: 2, escala_estresse: 2, escala_bemestar: 8, conexao_natureza: 8, qualidade_sono: 7, nivel_energia: 7, dor_fisica: 4, concentracao: 8, relacionamentos: 8, avaliador: 'Fisio. Ana Ribeiro', observacoes: 'Reabilitação progredindo bem' },
      { participante_id: 'PART_005', sessao_id: 'SESS_005', data: new Date('2025-12-19'), escala_ansiedade: 4, escala_depressao: 2, escala_estresse: 3, escala_bemestar: 7, conexao_natureza: 9, qualidade_sono: 6, nivel_energia: 8, dor_fisica: 0, concentracao: 7, relacionamentos: 7, avaliador: 'Dra. Carla Souza', observacoes: 'TDAH bem controlado com natureza' }
    ];
    return this._insertRecords(CONFIG.SHEETS.AVALIACOES_TERAPIA, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FITOTERAPIA
  // ═══════════════════════════════════════════════════════════════════════════

  populatePlantasMedicinais: function() {
    Logger.log('🌿 Populando PlantasMedicinais...');
    const data = [
      { nome_cientifico: 'Stryphnodendron adstringens', nome_popular: 'Barbatimão', familia: 'Fabaceae', parte_usada: 'Casca', principios_ativos: 'Taninos, flavonoides', indicacoes: 'Cicatrizante, anti-inflamatório', contraindicacoes: 'Gestantes', modo_preparo: 'Decocção', dosagem: '3x ao dia', interacoes: 'Nenhuma conhecida', toxicidade: 'Baixa', evidencias_cientificas: 'Comprovada', referencias: 'Lorenzi & Matos, 2008', local_coleta: 'Cerrado', epoca_coleta: 'Ano todo', status_conservacao: 'Pouco preocupante', foto_ids: 'FOTO_PM_001', observacoes: 'Uso tradicional consolidado' },
      { nome_cientifico: 'Copaifera langsdorffii', nome_popular: 'Copaíba', familia: 'Fabaceae', parte_usada: 'Óleo-resina', principios_ativos: 'Sesquiterpenos, diterpenos', indicacoes: 'Anti-inflamatório, cicatrizante', contraindicacoes: 'Gestantes, lactantes', modo_preparo: 'Uso tópico ou interno', dosagem: '3-5 gotas', interacoes: 'Anticoagulantes', toxicidade: 'Moderada em excesso', evidencias_cientificas: 'Comprovada', referencias: 'Veiga Jr. et al., 2007', local_coleta: 'Mata de galeria', epoca_coleta: 'Seca', status_conservacao: 'Pouco preocupante', foto_ids: 'FOTO_PM_002', observacoes: 'Extração sustentável' },
      { nome_cientifico: 'Baccharis trimera', nome_popular: 'Carqueja', familia: 'Asteraceae', parte_usada: 'Partes aéreas', principios_ativos: 'Flavonoides, lactonas', indicacoes: 'Digestivo, hepatoprotetor', contraindicacoes: 'Hipotensão', modo_preparo: 'Infusão', dosagem: '2-3x ao dia', interacoes: 'Anti-hipertensivos', toxicidade: 'Baixa', evidencias_cientificas: 'Parcial', referencias: 'Simões et al., 2010', local_coleta: 'Campo limpo', epoca_coleta: 'Floração', status_conservacao: 'Pouco preocupante', foto_ids: 'FOTO_PM_003', observacoes: 'Sabor amargo característico' },
      { nome_cientifico: 'Pfaffia glomerata', nome_popular: 'Ginseng brasileiro', familia: 'Amaranthaceae', parte_usada: 'Raiz', principios_ativos: 'Saponinas, ecdisteroides', indicacoes: 'Adaptógeno, energético', contraindicacoes: 'Hipertensão', modo_preparo: 'Decocção ou cápsulas', dosagem: '1-2x ao dia', interacoes: 'Estimulantes', toxicidade: 'Baixa', evidencias_cientificas: 'Parcial', referencias: 'Rates & Gosmann, 2002', local_coleta: 'Cerrado', epoca_coleta: 'Seca', status_conservacao: 'Vulnerável', foto_ids: 'FOTO_PM_004', observacoes: 'Coleta controlada' },
      { nome_cientifico: 'Lippia alba', nome_popular: 'Erva-cidreira brasileira', familia: 'Verbenaceae', parte_usada: 'Folhas', principios_ativos: 'Citral, limoneno', indicacoes: 'Calmante, digestivo', contraindicacoes: 'Nenhuma conhecida', modo_preparo: 'Infusão', dosagem: '3x ao dia', interacoes: 'Sedativos', toxicidade: 'Muito baixa', evidencias_cientificas: 'Comprovada', referencias: 'Pascual et al., 2001', local_coleta: 'Horta medicinal', epoca_coleta: 'Ano todo', status_conservacao: 'Pouco preocupante', foto_ids: 'FOTO_PM_005', observacoes: 'Cultivo fácil' }
    ];
    return this._insertRecords(CONFIG.SHEETS.PLANTAS_MEDICINAIS, data);
  },

  populatePreparacoes: function() {
    Logger.log('⚗️ Populando PreparacoesFitoterapicas...');
    const data = [
      { planta_id: 'PM_001', tipo_preparacao: 'Tintura', ingredientes: 'Casca de barbatimão, álcool 70%', modo_preparo: 'Maceração por 15 dias', dosagem: '30 gotas 3x/dia', via_administracao: 'Oral', duracao_tratamento: '30 dias', indicacoes: 'Gastrite, úlceras', contraindicacoes: 'Gestantes', efeitos_colaterais: 'Constipação em excesso', data_preparacao: new Date('2025-11-01'), validade: new Date('2026-11-01'), lote: 'BARB-2025-001', responsavel: 'Farm. Maria Silva', observacoes: 'Armazenar em local fresco' },
      { planta_id: 'PM_002', tipo_preparacao: 'Óleo', ingredientes: 'Óleo-resina de copaíba puro', modo_preparo: 'Extração direta', dosagem: '5 gotas 2x/dia', via_administracao: 'Oral ou tópico', duracao_tratamento: '15 dias', indicacoes: 'Inflamações, feridas', contraindicacoes: 'Gestantes, crianças', efeitos_colaterais: 'Náusea em excesso', data_preparacao: new Date('2025-10-15'), validade: new Date('2027-10-15'), lote: 'COP-2025-001', responsavel: 'Farm. João Santos', observacoes: 'Uso interno com cautela' },
      { planta_id: 'PM_003', tipo_preparacao: 'Chá', ingredientes: 'Carqueja seca 10g, água 500ml', modo_preparo: 'Infusão por 10 minutos', dosagem: '1 xícara 3x/dia', via_administracao: 'Oral', duracao_tratamento: '21 dias', indicacoes: 'Problemas digestivos', contraindicacoes: 'Hipotensão', efeitos_colaterais: 'Nenhum relatado', data_preparacao: new Date('2025-12-01'), validade: new Date('2025-12-08'), lote: 'CARQ-2025-012', responsavel: 'Farm. Maria Silva', observacoes: 'Preparar na hora' },
      { planta_id: 'PM_004', tipo_preparacao: 'Cápsula', ingredientes: 'Pó de raiz de ginseng brasileiro 500mg', modo_preparo: 'Encapsulamento', dosagem: '1 cápsula 2x/dia', via_administracao: 'Oral', duracao_tratamento: '60 dias', indicacoes: 'Fadiga, estresse', contraindicacoes: 'Hipertensão', efeitos_colaterais: 'Insônia se tomado à noite', data_preparacao: new Date('2025-09-01'), validade: new Date('2026-09-01'), lote: 'GINS-2025-003', responsavel: 'Farm. João Santos', observacoes: 'Tomar pela manhã' },
      { planta_id: 'PM_005', tipo_preparacao: 'Chá', ingredientes: 'Folhas frescas de erva-cidreira 5g, água 250ml', modo_preparo: 'Infusão por 5 minutos', dosagem: '1 xícara antes de dormir', via_administracao: 'Oral', duracao_tratamento: 'Contínuo', indicacoes: 'Insônia, ansiedade', contraindicacoes: 'Nenhuma', efeitos_colaterais: 'Sonolência', data_preparacao: new Date('2025-12-20'), validade: new Date('2025-12-21'), lote: 'ECID-2025-050', responsavel: 'Farm. Maria Silva', observacoes: 'Usar folhas frescas' }
    ];
    return this._insertRecords(CONFIG.SHEETS.PREPARACOES, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SISTEMA
  // ═══════════════════════════════════════════════════════════════════════════

  populateUsuarios: function() {
    Logger.log('👥 Populando Usuarios...');
    const data = [
      { nome: 'Administrador Sistema', email: 'admin@reservaaraas.org', telefone: '(61) 99000-0001', tipo_usuario: 'admin', cargo: 'Administrador', permissao: 'full', data_criacao: new Date('2025-01-01'), ultimo_acesso: new Date('2025-12-28'), ativo: true, observacoes: 'Conta principal' },
      { nome: 'João Silva', email: 'joao.silva@reservaaraas.org', telefone: '(61) 99000-0002', tipo_usuario: 'researcher', cargo: 'Pesquisador', permissao: 'write', data_criacao: new Date('2025-02-15'), ultimo_acesso: new Date('2025-12-27'), ativo: true, observacoes: 'Especialista em biodiversidade' },
      { nome: 'Maria Santos', email: 'maria.santos@reservaaraas.org', telefone: '(61) 99000-0003', tipo_usuario: 'guide', cargo: 'Guia', permissao: 'write', data_criacao: new Date('2025-03-01'), ultimo_acesso: new Date('2025-12-26'), ativo: true, observacoes: 'Guia certificada' },
      { nome: 'Pedro Oliveira', email: 'pedro.oliveira@reservaaraas.org', telefone: '(61) 99000-0004', tipo_usuario: 'researcher', cargo: 'Biólogo', permissao: 'write', data_criacao: new Date('2025-03-15'), ultimo_acesso: new Date('2025-12-25'), ativo: true, observacoes: 'Especialista em fauna' },
      { nome: 'Ana Costa', email: 'ana.costa@reservaaraas.org', telefone: '(61) 99000-0005', tipo_usuario: 'visitor', cargo: 'Voluntária', permissao: 'read', data_criacao: new Date('2025-06-01'), ultimo_acesso: new Date('2025-12-20'), ativo: true, observacoes: 'Voluntária ativa' }
    ];
    return this._insertRecords(CONFIG.SHEETS.USUARIOS, data);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════════════════════

  _insertRecords: function(sheetName, records) {
    const results = [];
    records.forEach((record, index) => {
      try {
        // Adiciona ID e timestamp se não existirem
        if (!record.id) {
          record.id = `${sheetName.substring(0, 4).toUpperCase()}_${Date.now()}_${index}`;
        }
        if (!record.timestamp) {
          record.timestamp = new Date();
        }
        
        const result = DatabaseService.create(sheetName, record);
        if (result.success) {
          results.push(record);
          Logger.log(`  ✅ Registro ${index + 1} inserido`);
        } else {
          Logger.log(`  ❌ Erro no registro ${index + 1}: ${result.error}`);
        }
      } catch (e) {
        Logger.log(`  ❌ Exceção no registro ${index + 1}: ${e.toString()}`);
      }
    });
    return results;
  },

  printSummary: function(results) {
    Logger.log('\n═══════════════════════════════════════════════════════════');
    Logger.log('📊 RESUMO DA POPULAÇÃO DE DADOS');
    Logger.log('═══════════════════════════════════════════════════════════\n');
    
    let total = 0;
    Object.keys(results).forEach(key => {
      const count = results[key] ? results[key].length : 0;
      total += count;
      Logger.log(`${key}: ${count} registros`);
    });
    
    Logger.log(`\n🎯 TOTAL: ${total} registros inseridos`);
    Logger.log('═══════════════════════════════════════════════════════════\n');
  }
};

/**
 * Função de atalho para executar a população
 */
function populateAllSheets() {
  return PopulateAllSheets.populateAll();
}

/**
 * Função para popular apenas uma planilha específica
 */
function populateSheet(sheetType) {
  const methodMap = {
    'parcelas': 'populateParcelas',
    'producao': 'populateProducao',
    'especiesAgro': 'populateEspeciesAgro',
    'dadosClima': 'populateDadosClimaticos',
    'qualidadeAgua': 'populateQualidadeAgua',
    'qualidadeSolo': 'populateQualidadeSolo',
    'biodiversidade': 'populateBiodiversidade',
    'carbono': 'populateCarbono',
    'visitantes': 'populateVisitantes',
    'trilhas': 'populateTrilhas',
    'avaliacoes': 'populateAvaliacoesEcoturismo',
    'gpsPoints': 'populateGPSPoints',
    'waypoints': 'populateWaypoints',
    'rotas': 'populateRotas',
    'fotos': 'populateFotos',
    'participantes': 'populateParticipantes',
    'sessoes': 'populateSessoes',
    'avaliacoesTerapia': 'populateAvaliacoesTerapia',
    'plantasMedicinais': 'populatePlantasMedicinais',
    'preparacoes': 'populatePreparacoes',
    'usuarios': 'populateUsuarios'
  };
  
  const method = methodMap[sheetType];
  if (method && PopulateAllSheets[method]) {
    return PopulateAllSheets[method]();
  }
  return { error: `Tipo de planilha não encontrado: ${sheetType}` };
}
