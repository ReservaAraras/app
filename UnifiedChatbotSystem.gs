/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED CHATBOT SYSTEM - Sistema Unificado de Chatbots Especializados
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema central que gerencia chatbots especializados para cada domínio:
 * - Biodiversidade (Flora/Fauna)
 * - Ambiental (Água/Solo/Clima)
 * - Agrofloresta (SAF/Produção)
 * - Geolocalização (Waypoints/Trilhas)
 * - Ecoturismo (Visitantes/Tours)
 * - Educação Ambiental
 * - Monitoramento (IoT/Sensores)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Registro central de chatbots especializados
 * @namespace UnifiedChatbotSystem
 */
const UnifiedChatbotSystem = {
  
  /**
   * Chatbots disponíveis por domínio
   */
  CHATBOTS: {
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT BIODIVERSIDADE - Flora e Fauna
    // ═══════════════════════════════════════════════════════════════════════
    biodiversidade: {
      id: 'biodiversidade',
      nome: 'BioBot',
      emoji: '🦋',
      descricao: 'Especialista em fauna e flora do Cerrado',
      intents: {
        especie: ['espécie', 'animal', 'planta', 'ave', 'mamífero', 'réptil', 'árvore', 'identificar'],
        conservacao: ['ameaçada', 'extinto', 'conservação', 'iucn', 'proteger'],
        observacao: ['avistamento', 'registrar', 'vi', 'encontrei', 'observei'],
        estatisticas: ['quantas espécies', 'biodiversidade', 'índice', 'shannon', 'riqueza']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        // Identificação de espécies
        if (this._matchIntent(lower, this.intents.especie)) {
          return this._handleSpeciesQuery(msg, ctx);
        }
        // Conservação
        if (this._matchIntent(lower, this.intents.conservacao)) {
          return this._handleConservation(ctx);
        }
        // Registro de observação
        if (this._matchIntent(lower, this.intents.observacao)) {
          return this._handleObservation(msg, ctx);
        }
        // Estatísticas
        if (this._matchIntent(lower, this.intents.estatisticas)) {
          return this._handleStats(ctx);
        }
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) {
        return keywords.some(k => msg.includes(k));
      },
      
      _handleSpeciesQuery(msg, ctx) {
        // Usa BiodiversityService se disponível
        if (typeof BiodiversityService !== 'undefined') {
          const stats = BiodiversityService.getSpeciesCounts(ctx.areaId || 'AREA-001');
          const total = Object.keys(stats).length;
          return {
            text: `🦋 **Biodiversidade da Reserva**\n\nTemos ${total} espécies registradas!\n\nPosso te ajudar a:\n• Identificar uma espécie\n• Ver espécies ameaçadas\n• Registrar um avistamento\n\nDescreva o que você observou!`,
            type: 'species_info',
            suggestions: ['Espécies ameaçadas', 'Registrar avistamento', 'Ver estatísticas']
          };
        }
        return { text: '🦋 Descreva a espécie que você observou para eu ajudar na identificação!', type: 'species_query' };
      },
      
      _handleConservation(ctx) {
        const ameacadas = ['Lobo-guará (VU)', 'Tamanduá-bandeira (VU)', 'Onça-pintada (VU)', 'Arara-azul (VU)', 'Tatu-canastra (VU)'];
        return {
          text: `🔴 **Espécies Ameaçadas no Cerrado**\n\n${ameacadas.map(e => `• ${e}`).join('\n')}\n\nLegenda: VU=Vulnerável, EN=Em Perigo, CR=Crítico\n\nA conservação dessas espécies é nossa prioridade!`,
          type: 'conservation'
        };
      },
      
      _handleObservation(msg, ctx) {
        return {
          text: `📝 **Registrar Avistamento**\n\nÓtimo! Para registrar sua observação, preciso de:\n\n1. O que você viu? (descrição)\n2. Quantos indivíduos?\n3. Onde? (local ou coordenadas)\n4. Comportamento observado?\n\nDescreva sua observação em detalhes!`,
          type: 'observation_form',
          expectData: true
        };
      },
      
      _handleStats(ctx) {
        if (typeof BiodiversityService !== 'undefined') {
          const shannon = BiodiversityService.calculateShannonIndex(ctx.areaId || 'AREA-001');
          return {
            text: `📊 **Estatísticas de Biodiversidade**\n\n• Índice de Shannon: ${shannon}\n• Diversidade: ${shannon > 2 ? 'Alta' : shannon > 1 ? 'Média' : 'Baixa'}\n\nÍndices altos indicam ecossistema saudável!`,
            type: 'stats'
          };
        }
        return { text: '📊 Estatísticas de biodiversidade sendo calculadas...', type: 'stats_loading' };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `🦋 Sou o BioBot, especialista em biodiversidade!\n\nPosso ajudar com:\n• Identificação de espécies\n• Informações sobre conservação\n• Registro de avistamentos\n• Estatísticas ecológicas`,
          suggestions: ['Identificar espécie', 'Espécies ameaçadas', 'Registrar observação']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT AMBIENTAL - Água, Solo, Clima
    // ═══════════════════════════════════════════════════════════════════════
    ambiental: {
      id: 'ambiental',
      nome: 'EcoBot',
      emoji: '🌊',
      descricao: 'Monitoramento de água, solo e clima',
      intents: {
        agua: ['água', 'ph', 'oxigênio', 'turbidez', 'nascente', 'rio', 'córrego'],
        solo: ['solo', 'terra', 'fertilidade', 'nutrientes', 'matéria orgânica'],
        clima: ['clima', 'tempo', 'temperatura', 'chuva', 'umidade', 'previsão'],
        alerta: ['alerta', 'perigo', 'contaminação', 'problema']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.agua)) return this._handleWater(ctx);
        if (this._matchIntent(lower, this.intents.solo)) return this._handleSoil(ctx);
        if (this._matchIntent(lower, this.intents.clima)) return this._handleClimate(ctx);
        if (this._matchIntent(lower, this.intents.alerta)) return this._handleAlerts(ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleWater(ctx) {
        return {
          text: `🌊 **Qualidade da Água**\n\n📍 Parâmetros monitorados:\n• pH: Acidez/alcalinidade\n• O₂ Dissolvido: Oxigenação\n• Turbidez: Clareza\n• Coliformes: Contaminação\n\nPosso analisar dados de medições ou explicar parâmetros.\n\nO que você gostaria de saber?`,
          type: 'water_info',
          suggestions: ['Registrar medição', 'Ver últimas análises', 'Alertas de qualidade']
        };
      },
      
      _handleSoil(ctx) {
        return {
          text: `🌱 **Qualidade do Solo**\n\n📊 Indicadores principais:\n• pH: Ideal 5.5-6.5 para Cerrado\n• Matéria Orgânica: Fertilidade\n• NPK: Nutrientes essenciais\n\nSolos do Cerrado são naturalmente ácidos mas ricos em biodiversidade!`,
          type: 'soil_info',
          suggestions: ['Análise de solo', 'Correção de pH', 'Adubação verde']
        };
      },
      
      _handleClimate(ctx) {
        return {
          text: `🌤️ **Monitoramento Climático**\n\nCerrado tem duas estações bem definidas:\n• 🌧️ Chuvosa: Out-Abr\n• ☀️ Seca: Mai-Set\n\nMonitoramos: temperatura, umidade, pressão, precipitação e UV.`,
          type: 'climate_info',
          suggestions: ['Condições atuais', 'Histórico', 'Alertas climáticos']
        };
      },
      
      _handleAlerts(ctx) {
        return {
          text: `⚠️ **Sistema de Alertas Ambientais**\n\nMonitoramos continuamente:\n• Qualidade da água\n• Risco de incêndio\n• Eventos climáticos extremos\n• Espécies invasoras\n\nNenhum alerta crítico no momento.`,
          type: 'alerts'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `🌊 Sou o EcoBot, seu assistente ambiental!\n\nMonitoro:\n• 💧 Qualidade da água\n• 🌱 Saúde do solo\n• 🌤️ Condições climáticas\n• ⚠️ Alertas ambientais`,
          suggestions: ['Qualidade da água', 'Análise de solo', 'Clima atual']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT AGROFLORESTA - SAF e Produção
    // ═══════════════════════════════════════════════════════════════════════
    agrofloresta: {
      id: 'agrofloresta',
      nome: 'AgroBot',
      emoji: '🌳',
      descricao: 'Sistemas agroflorestais e produção sustentável',
      intents: {
        saf: ['saf', 'agrofloresta', 'sistema', 'consórcio', 'sintropia'],
        plantio: ['plantar', 'plantio', 'espécie', 'muda', 'semente'],
        manejo: ['manejo', 'poda', 'adubação', 'cobertura', 'capina'],
        producao: ['produção', 'colheita', 'fruto', 'rendimento'],
        carbono: ['carbono', 'sequestro', 'co2', 'crédito']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.saf)) return this._handleSAF(ctx);
        if (this._matchIntent(lower, this.intents.plantio)) return this._handlePlanting(ctx);
        if (this._matchIntent(lower, this.intents.manejo)) return this._handleManagement(ctx);
        if (this._matchIntent(lower, this.intents.producao)) return this._handleProduction(ctx);
        if (this._matchIntent(lower, this.intents.carbono)) return this._handleCarbon(ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleSAF(ctx) {
        return {
          text: `🌳 **Sistemas Agroflorestais (SAF)**\n\nNosso SAF combina:\n• 🌴 Estrato Alto: Frutíferas grandes\n• 🌿 Estrato Médio: Arbustos e palmeiras\n• 🥬 Estrato Baixo: Hortaliças e ervas\n\nBenefícios:\n✅ Sequestro de carbono\n✅ Produção diversificada\n✅ Habitat para fauna\n✅ Proteção do solo`,
          type: 'saf_info',
          suggestions: ['Espécies recomendadas', 'Iniciar SAF', 'Créditos de carbono']
        };
      },
      
      _handlePlanting(ctx) {
        const especies = ['Pequi', 'Baru', 'Cagaita', 'Mangaba', 'Jatobá', 'Buriti'];
        return {
          text: `🌱 **Espécies para SAF no Cerrado**\n\n${especies.map(e => `• ${e}`).join('\n')}\n\nQuer recomendações personalizadas para sua parcela?`,
          type: 'planting'
        };
      },
      
      _handleManagement(ctx) {
        return {
          text: `✂️ **Manejo do SAF**\n\n📅 Calendário:\n• Poda de formação: Ano 1-2\n• Adubação verde: Estação chuvosa\n• Coroamento: Mensalmente\n• Capina seletiva: Quando necessário\n\nDica: A poda gera biomassa que vira adubo!`,
          type: 'management'
        };
      },
      
      _handleProduction(ctx) {
        return {
          text: `🍎 **Produção Agroflorestal**\n\nNossa produção inclui:\n• Frutos nativos (Pequi, Mangaba)\n• Mel e derivados\n• Sementes para restauração\n• Plantas medicinais\n\nTudo com manejo sustentável!`,
          type: 'production'
        };
      },
      
      _handleCarbon(ctx) {
        return {
          text: `🌍 **Créditos de Carbono**\n\nNossos SAFs sequestram CO₂:\n• Média: 10-15 ton CO₂/ha/ano\n• Certificação: Em andamento\n\nA agrofloresta é solução climática!`,
          type: 'carbon'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `🌳 Sou o AgroBot, especialista em agrofloresta!\n\nPosso ajudar com:\n• Planejamento de SAF\n• Espécies recomendadas\n• Técnicas de manejo\n• Produção e colheita`,
          suggestions: ['O que é SAF?', 'Espécies nativas', 'Créditos de carbono']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT GEOLOCALIZAÇÃO - Waypoints e Trilhas
    // ═══════════════════════════════════════════════════════════════════════
    geolocalizacao: {
      id: 'geolocalizacao',
      nome: 'GeoBot',
      emoji: '📍',
      descricao: 'Navegação, waypoints e trilhas',
      intents: {
        waypoint: ['waypoint', 'ponto', 'marcar', 'localização', 'coordenada', 'gps'],
        trilha: ['trilha', 'percurso', 'rota', 'caminho', 'km'],
        navegacao: ['onde', 'como chego', 'direção', 'navegar', 'mapa'],
        distancia: ['distância', 'longe', 'perto', 'metros', 'quilômetros']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.waypoint)) return this._handleWaypoint(ctx);
        if (this._matchIntent(lower, this.intents.trilha)) return this._handleTrail(ctx);
        if (this._matchIntent(lower, this.intents.navegacao)) return this._handleNavigation(ctx);
        if (this._matchIntent(lower, this.intents.distancia)) return this._handleDistance(ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleWaypoint(ctx) {
        return {
          text: `📍 **Waypoints da Reserva**\n\nPontos registrados:\n• 🏠 Sede: -13.5234, -46.3789\n• 💧 Nascente Principal\n• 🌳 SAF Demonstrativo\n• 👁️ Mirante\n\nQuer registrar um novo ponto ou navegar para algum?`,
          type: 'waypoint',
          suggestions: ['Registrar ponto', 'Ver no mapa', 'Trilhas disponíveis']
        };
      },
      
      _handleTrail(ctx) {
        const trilhas = [
          {nome: 'Trilha da Nascente', km: 2.5, tempo: '1h30'},
          {nome: 'Trilha do Mirante', km: 3.8, tempo: '2h30'},
          {nome: 'Trilha das Veredas', km: 4.2, tempo: '3h'},
          {nome: 'Trilha do SAF', km: 1.5, tempo: '1h'}
        ];
        return {
          text: `🥾 **Trilhas Disponíveis**\n\n${trilhas.map(t => `• ${t.nome}: ${t.km}km (${t.tempo})`).join('\n')}\n\nTodas as trilhas são guiadas. Qual te interessa?`,
          type: 'trails'
        };
      },
      
      _handleNavigation(ctx) {
        return {
          text: `🧭 **Navegação**\n\nPara onde você quer ir?\n\nPosso:\n• Traçar rota até um waypoint\n• Mostrar trilha no mapa\n• Calcular distância e tempo\n• Dar direções passo a passo`,
          type: 'navigation'
        };
      },
      
      _handleDistance(ctx) {
        return {
          text: `📏 **Calcular Distância**\n\nInforme:\n• Ponto de partida (onde você está)\n• Destino desejado\n\nCalcularei a distância e tempo estimado!`,
          type: 'distance'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `📍 Sou o GeoBot, seu guia de navegação!\n\nPosso ajudar com:\n• Waypoints e coordenadas\n• Trilhas e percursos\n• Navegação e direções\n• Cálculo de distâncias`,
          suggestions: ['Ver waypoints', 'Trilhas', 'Onde estou?']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT ECOTURISMO - Visitantes e Tours
    // ═══════════════════════════════════════════════════════════════════════
    ecoturismo: {
      id: 'ecoturismo',
      nome: 'TourBot',
      emoji: '🎒',
      descricao: 'Visitação, tours e experiências',
      intents: {
        visita: ['visitar', 'visita', 'conhecer', 'tour', 'passeio'],
        horario: ['horário', 'hora', 'quando', 'abre', 'fecha'],
        reserva: ['reservar', 'agendar', 'marcar', 'disponibilidade'],
        preco: ['preço', 'valor', 'custo', 'quanto custa', 'ingresso']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.visita)) return this._handleVisit(ctx);
        if (this._matchIntent(lower, this.intents.horario)) return this._handleSchedule(ctx);
        if (this._matchIntent(lower, this.intents.reserva)) return this._handleBooking(ctx);
        if (this._matchIntent(lower, this.intents.preco)) return this._handlePricing(ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleVisit(ctx) {
        return {
          text: `🎒 **Visite a Reserva Araras!**\n\n📍 Localização: São Domingos, GO\n🌳 Área: 180 hectares de Cerrado\n\nExperiências:\n• 🥾 Trilhas guiadas\n• 🦜 Observação de aves\n• 📸 Fotografia de natureza\n• 🧘 Banho de floresta\n• 🌱 Workshop de SAF\n\nQuer agendar uma visita?`,
          type: 'visit',
          suggestions: ['Agendar visita', 'Ver horários', 'Trilhas disponíveis']
        };
      },
      
      _handleSchedule(ctx) {
        return {
          text: `🕐 **Horários de Funcionamento**\n\n📅 Terça a Domingo\n⏰ 8h às 17h\n\n⚠️ Segunda: fechado para manejo\n📞 Grupos +10 pessoas: agendar com antecedência`,
          type: 'schedule'
        };
      },
      
      _handleBooking(ctx) {
        return {
          text: `📅 **Agendar Visita**\n\nPara reservar, preciso saber:\n\n1. 📆 Data desejada\n2. 👥 Número de pessoas\n3. 🎯 Atividades de interesse\n4. 📧 Contato\n\nComo prefere fazer a reserva?`,
          type: 'booking',
          actions: [{label: 'Formulário online', action: 'booking_form'}]
        };
      },
      
      _handlePricing(ctx) {
        return {
          text: `💰 **Valores**\n\n🎫 Entrada + Trilha Guiada:\n• Adulto: R$ 50\n• Estudante: R$ 25\n• Criança (até 12): Grátis\n\n🌟 Pacotes especiais:\n• Dia completo: R$ 120\n• Observação de aves: R$ 80\n\n*Consulte descontos para grupos`,
          type: 'pricing'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `🎒 Sou o TourBot, seu guia de ecoturismo!\n\nPosso ajudar com:\n• Planejamento de visita\n• Horários e reservas\n• Atividades disponíveis\n• Informações práticas`,
          suggestions: ['Planejar visita', 'Horários', 'Valores']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT EDUCAÇÃO - Conteúdo Educacional
    // ═══════════════════════════════════════════════════════════════════════
    educacao: {
      id: 'educacao',
      nome: 'EduBot',
      emoji: '📚',
      descricao: 'Educação ambiental e conteúdo educativo',
      intents: {
        aprender: ['aprender', 'ensinar', 'como funciona', 'o que é', 'explique'],
        cerrado: ['cerrado', 'bioma', 'savana', 'vegetação'],
        quiz: ['quiz', 'teste', 'perguntas', 'jogar'],
        escola: ['escola', 'professor', 'aluno', 'aula', 'material']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.cerrado)) return this._handleCerrado(ctx);
        if (this._matchIntent(lower, this.intents.quiz)) return this._handleQuiz(ctx);
        if (this._matchIntent(lower, this.intents.escola)) return this._handleSchool(ctx);
        if (this._matchIntent(lower, this.intents.aprender)) return this._handleLearn(msg, ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleCerrado(ctx) {
        return {
          text: `🌿 **O Cerrado Brasileiro**\n\nO 2º maior bioma do Brasil:\n• 📏 2 milhões km² (23% do Brasil)\n• 🌡️ Clima: tropical sazonal\n• 🌳 11.000+ espécies de plantas\n• 🦋 Hotspot de biodiversidade\n\nInfelizmente, já perdemos mais de 50% da vegetação original.\n\nQuer saber mais sobre algum aspecto específico?`,
          type: 'cerrado_info',
          suggestions: ['Fauna do Cerrado', 'Flora nativa', 'Por que proteger?']
        };
      },
      
      _handleQuiz(ctx) {
        const perguntas = [
          {p: 'Qual o maior canídeo da América do Sul?', r: 'Lobo-guará'},
          {p: 'Que árvore é chamada de "árvore da vida" do Cerrado?', r: 'Buriti'},
          {p: 'Qual fruto do Cerrado tem espinhos internos?', r: 'Pequi'}
        ];
        const q = perguntas[Math.floor(Math.random() * perguntas.length)];
        return {
          text: `🎯 **Quiz do Cerrado!**\n\n**Pergunta:**\n${q.p}\n\nDigite sua resposta!`,
          type: 'quiz',
          quizData: q
        };
      },
      
      _handleSchool(ctx) {
        return {
          text: `🏫 **Programa Escola no Cerrado**\n\nRecebemos escolas para vivências educativas:\n\n📚 Atividades:\n• Trilha interpretativa\n• Oficina de identificação de espécies\n• Plantio de mudas\n• Coleta de sementes\n\n👨‍🏫 Material pedagógico incluso!\n\nInteresse em agendar para sua escola?`,
          type: 'school'
        };
      },
      
      _handleLearn(msg, ctx) {
        return {
          text: `📚 **Vamos Aprender!**\n\nSobre o que você quer aprender?\n\n🌿 **Ecologia**\n• Cerrado e seus ecossistemas\n• Biodiversidade\n• Serviços ecossistêmicos\n\n🌱 **Práticas Sustentáveis**\n• Agrofloresta\n• Restauração\n• Conservação`,
          type: 'learn'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `📚 Sou o EduBot, seu professor de educação ambiental!\n\nPosso ensinar sobre:\n• O bioma Cerrado\n• Biodiversidade local\n• Práticas sustentáveis\n• Quiz divertidos!`,
          suggestions: ['Sobre o Cerrado', 'Fazer um quiz', 'Material para escolas']
        };
      }
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CHATBOT MONITORAMENTO - IoT e Sensores
    // ═══════════════════════════════════════════════════════════════════════
    monitoramento: {
      id: 'monitoramento',
      nome: 'SensorBot',
      emoji: '📡',
      descricao: 'Dados de sensores e IoT',
      intents: {
        sensor: ['sensor', 'medição', 'dado', 'leitura', 'iot'],
        camera: ['câmera', 'armadilha', 'foto', 'flagra', 'trap'],
        tempo_real: ['tempo real', 'agora', 'atual', 'live', 'ao vivo'],
        historico: ['histórico', 'tendência', 'gráfico', 'evolução']
      },
      processMessage(msg, ctx) {
        const lower = msg.toLowerCase();
        
        if (this._matchIntent(lower, this.intents.sensor)) return this._handleSensor(ctx);
        if (this._matchIntent(lower, this.intents.camera)) return this._handleCamera(ctx);
        if (this._matchIntent(lower, this.intents.tempo_real)) return this._handleRealtime(ctx);
        if (this._matchIntent(lower, this.intents.historico)) return this._handleHistory(ctx);
        return this._handleGeneral(msg, ctx);
      },
      
      _matchIntent(msg, keywords) { return keywords.some(k => msg.includes(k)); },
      
      _handleSensor(ctx) {
        return {
          text: `📡 **Rede de Sensores**\n\nMonitoramos em tempo real:\n\n🌡️ **Clima**: Temperatura, umidade, pressão\n💧 **Água**: pH, oxigênio, turbidez\n🌱 **Solo**: Umidade, temperatura\n🔊 **Acústico**: Sons da fauna\n\nQual sensor você quer consultar?`,
          type: 'sensors',
          suggestions: ['Clima agora', 'Qualidade água', 'Umidade solo']
        };
      },
      
      _handleCamera(ctx) {
        return {
          text: `📷 **Armadilhas Fotográficas**\n\nTemos câmeras estratégicas monitorando fauna 24h:\n\n📍 Locais:\n• Bebedouro natural\n• Trilha de fauna\n• Área de alimentação\n\n🎬 Últimos registros:\n• Lobo-guará: 2 dias atrás\n• Veado: ontem\n• Aves diversas: hoje`,
          type: 'cameras'
        };
      },
      
      _handleRealtime(ctx) {
        const now = new Date();
        return {
          text: `⚡ **Dados em Tempo Real**\n\n🕐 ${now.toLocaleTimeString('pt-BR')}\n\n🌡️ Temp: 28°C\n💧 Umidade: 65%\n🌬️ Vento: 12 km/h\n☀️ UV: Moderado\n\n*Dados simulados - integração com sensores ativos`,
          type: 'realtime'
        };
      },
      
      _handleHistory(ctx) {
        return {
          text: `📈 **Dados Históricos**\n\nPosso mostrar tendências de:\n• Temperatura (últimos 30 dias)\n• Precipitação (mensal)\n• Biodiversidade (sazonal)\n• Qualidade da água\n\nQual período ou variável te interessa?`,
          type: 'history'
        };
      },
      
      _handleGeneral(msg, ctx) {
        return {
          text: `📡 Sou o SensorBot, seu olho nos dados!\n\nMonitoro:\n• Sensores climáticos\n• Qualidade da água\n• Câmeras de fauna\n• Dados históricos`,
          suggestions: ['Dados agora', 'Câmeras de fauna', 'Histórico']
        };
      }
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FUNÇÕES CENTRAIS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Processa mensagem roteando para o chatbot apropriado
   */
  processMessage(message, context = {}) {
    try {
      // INTERVENÇÃO 2/13: Validação defensiva para evitar erro de undefined
      if (message === null || message === undefined || message === '') {
        Logger.log('[UnifiedChatbot] Mensagem vazia ou undefined recebida');
        return {
          success: false,
          error: 'Mensagem não pode ser vazia',
          response: {
            text: 'Por favor, digite uma mensagem para que eu possa ajudar.',
            type: 'error',
            suggestions: ['Ajuda', 'O que você pode fazer?']
          }
        };
      }
      
      // Garante que message é string
      const safeMessage = String(message);
      const safeContext = context || {};
      
      const botId = safeContext.botId || this._detectBestBot(safeMessage);
      const bot = this.CHATBOTS[botId];
      
      if (!bot) {
        return this._handleUnknown(message, context);
      }
      
      const response = bot.processMessage(safeMessage, safeContext);
      response.bot = { id: bot.id, nome: bot.nome, emoji: bot.emoji };
      
      // Tenta enriquecer com IA se disponível
      if (!response.ai_generated && Math.random() < 0.2) {
        const aiEnhanced = this._enhanceWithAI(safeMessage, response, bot);
        if (aiEnhanced) response.aiTip = aiEnhanced;
      }
      
      return { success: true, response };
    } catch (error) {
      Logger.log(`[UnifiedChatbot] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Detecta o melhor chatbot para a mensagem
   */
  _detectBestBot(message) {
    // INTERVENÇÃO 2/13: Validação defensiva
    if (!message || typeof message !== 'string') {
      return 'educacao'; // Default seguro
    }
    
    const lower = message.toLowerCase();
    const scores = {};
    
    for (const [id, bot] of Object.entries(this.CHATBOTS)) {
      scores[id] = 0;
      for (const [intent, keywords] of Object.entries(bot.intents)) {
        for (const kw of keywords) {
          if (lower.includes(kw)) scores[id] += 2;
        }
      }
    }
    
    const bestBot = Object.entries(scores).sort((a,b) => b[1] - a[1])[0];
    return bestBot[1] > 0 ? bestBot[0] : 'educacao'; // Default: educação
  },
  
  /**
   * Tenta enriquecer resposta com IA
   */
  _enhanceWithAI(msg, response, bot) {
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) return null;
    try {
      const prompt = `${bot.emoji} ${bot.nome}: Complemente em 1 frase sobre "${msg}" no contexto de ${bot.descricao}.`;
      const result = GeminiAIService.callGemini(prompt, { maxTokens: 100 });
      return result.success ? result.text : null;
    } catch (e) { return null; }
  },
  
  /**
   * Lista todos os chatbots disponíveis
   */
  listBots() {
    return Object.entries(this.CHATBOTS).map(([id, bot]) => ({
      id, nome: bot.nome, emoji: bot.emoji, descricao: bot.descricao
    }));
  },
  
  /**
   * Resposta para bot desconhecido
   */
  _handleUnknown(msg, ctx) {
    const bots = this.listBots();
    return {
      success: true,
      response: {
        text: `🤖 Nossos assistentes especializados:\n\n${bots.map(b => `${b.emoji} **${b.nome}**: ${b.descricao}`).join('\n')}\n\nCom qual você quer conversar?`,
        suggestions: bots.map(b => b.nome)
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Sistema Unificado de Chatbots
// ═══════════════════════════════════════════════════════════════════════════

/** Processa mensagem no sistema unificado */
function apiUnifiedChatbotMessage(message, context) {
  return UnifiedChatbotSystem.processMessage(message, context || {});
}

/** Lista todos os chatbots disponíveis */
function apiUnifiedChatbotList() {
  return { success: true, bots: UnifiedChatbotSystem.listBots() };
}

/** Processa mensagem para chatbot específico */
function apiChatbotDomain(domain, message, context) {
  return UnifiedChatbotSystem.processMessage(message, { ...context, botId: domain });
}

// Shortcuts para cada domínio
function apiBioChatbot(msg, ctx) { return apiChatbotDomain('biodiversidade', msg, ctx); }
function apiEcoChatbot(msg, ctx) { return apiChatbotDomain('ambiental', msg, ctx); }
function apiAgroChatbot(msg, ctx) { return apiChatbotDomain('agrofloresta', msg, ctx); }
function apiGeoChatbot(msg, ctx) { return apiChatbotDomain('geolocalizacao', msg, ctx); }
function apiTourChatbot(msg, ctx) { return apiChatbotDomain('ecoturismo', msg, ctx); }
function apiEduChatbot(msg, ctx) { return apiChatbotDomain('educacao', msg, ctx); }
function apiSensorChatbot(msg, ctx) { return apiChatbotDomain('monitoramento', msg, ctx); }
