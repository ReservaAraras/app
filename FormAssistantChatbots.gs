/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORM ASSISTANT CHATBOTS - Assistentes para Formulários
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Chatbots que auxiliam no preenchimento de formulários:
 * - Validação em tempo real
 * - Sugestões de valores
 * - Explicação de campos
 * - Interpretação de dados inseridos
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

const FormAssistantChatbots = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO DE ÁGUA
  // ═══════════════════════════════════════════════════════════════════════════
  agua: {
    id: 'form_agua',
    nome: 'AquaAssist',
    emoji: '💧',
    campos: {
      pH: { min: 0, max: 14, ideal: [6.5, 8.5], unidade: '', ajuda: 'Mede acidez/alcalinidade. Ideal: 6.5-8.5' },
      oxigenio: { min: 0, max: 20, ideal: [5, 12], unidade: 'mg/L', ajuda: 'Oxigênio dissolvido. Ideal: >5 mg/L' },
      turbidez: { min: 0, max: 1000, ideal: [0, 40], unidade: 'NTU', ajuda: 'Clareza da água. Ideal: <40 NTU' },
      temperatura: { min: 0, max: 50, ideal: [18, 28], unidade: '°C', ajuda: 'Temperatura da água' },
      coliformes: { min: 0, max: 10000, ideal: [0, 200], unidade: 'UFC/100mL', ajuda: 'Contaminação fecal. Ideal: <200' }
    },
    
    validateField(campo, valor) {
      const config = this.campos[campo];
      if (!config) return { valid: true };
      
      const v = parseFloat(valor);
      if (isNaN(v)) return { valid: false, error: 'Valor inválido' };
      if (v < config.min || v > config.max) return { valid: false, error: `Fora da faixa (${config.min}-${config.max})` };
      
      const isIdeal = v >= config.ideal[0] && v <= config.ideal[1];
      return {
        valid: true,
        status: isIdeal ? 'ideal' : (v < config.ideal[0] ? 'baixo' : 'alto'),
        message: isIdeal ? '✅ Valor ideal!' : `⚠️ Valor ${v < config.ideal[0] ? 'abaixo' : 'acima'} do ideal`
      };
    },
    
    interpretData(dados) {
      let score = 0, issues = [];
      
      if (dados.pH) {
        const v = parseFloat(dados.pH);
        if (v >= 6.5 && v <= 8.5) score += 25;
        else issues.push(`pH ${v < 6.5 ? 'ácido' : 'alcalino'}`);
      }
      if (dados.oxigenio) {
        const v = parseFloat(dados.oxigenio);
        if (v >= 5) score += 25;
        else issues.push('Baixo oxigênio (risco para fauna aquática)');
      }
      if (dados.turbidez) {
        const v = parseFloat(dados.turbidez);
        if (v <= 40) score += 25;
        else issues.push('Alta turbidez (possível erosão)');
      }
      if (dados.coliformes) {
        const v = parseFloat(dados.coliformes);
        if (v <= 200) score += 25;
        else issues.push('Contaminação bacteriana detectada');
      }
      
      return {
        score,
        qualidade: score >= 75 ? 'Excelente' : score >= 50 ? 'Boa' : score >= 25 ? 'Regular' : 'Crítica',
        issues,
        recomendacoes: issues.length > 0 ? ['Investigar fontes de contaminação', 'Monitorar frequência'] : ['Manter monitoramento regular']
      };
    },
    
    getHelp(campo) {
      return this.campos[campo]?.ajuda || 'Campo não reconhecido';
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO DE SOLO
  // ═══════════════════════════════════════════════════════════════════════════
  solo: {
    id: 'form_solo',
    nome: 'SoloAssist',
    emoji: '🌱',
    campos: {
      pH: { min: 3, max: 10, ideal: [5.5, 6.5], unidade: '', ajuda: 'pH do solo. Cerrado: naturalmente ácido (4-5)' },
      materia_organica: { min: 0, max: 20, ideal: [3, 8], unidade: '%', ajuda: 'Fundamental para fertilidade' },
      fosforo: { min: 0, max: 100, ideal: [10, 30], unidade: 'mg/dm³', ajuda: 'Nutriente para raízes' },
      potassio: { min: 0, max: 300, ideal: [60, 150], unidade: 'mg/dm³', ajuda: 'Regula metabolismo vegetal' },
      nitrogenio: { min: 0, max: 10, ideal: [0.1, 0.5], unidade: '%', ajuda: 'Essencial para crescimento' }
    },
    
    validateField(campo, valor) {
      const config = this.campos[campo];
      if (!config) return { valid: true };
      
      const v = parseFloat(valor);
      if (isNaN(v)) return { valid: false, error: 'Valor inválido' };
      if (v < config.min || v > config.max) return { valid: false, error: `Fora da faixa (${config.min}-${config.max})` };
      
      const isIdeal = v >= config.ideal[0] && v <= config.ideal[1];
      return { valid: true, status: isIdeal ? 'ideal' : (v < config.ideal[0] ? 'baixo' : 'alto') };
    },
    
    interpretData(dados) {
      let fertilidade = 0, correcoes = [];
      
      if (dados.pH) {
        const v = parseFloat(dados.pH);
        if (v < 5.5) correcoes.push('Calagem para elevar pH');
        else if (v > 6.5) correcoes.push('Adicionar enxofre para baixar pH');
      }
      if (dados.materia_organica && parseFloat(dados.materia_organica) < 3) {
        correcoes.push('Incorporar composto orgânico');
      }
      if (dados.fosforo && parseFloat(dados.fosforo) < 10) {
        correcoes.push('Adubação fosfatada (fosfato natural)');
      }
      
      fertilidade = correcoes.length === 0 ? 'Boa' : correcoes.length <= 2 ? 'Média' : 'Baixa';
      
      return {
        fertilidade,
        correcoes,
        culturas_recomendadas: dados.pH && parseFloat(dados.pH) < 5.5 
          ? ['Mandioca', 'Abacaxi', 'Espécies nativas'] 
          : ['Hortaliças', 'Frutíferas', 'SAF diversificado']
      };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO DE BIODIVERSIDADE
  // ═══════════════════════════════════════════════════════════════════════════
  biodiversidade: {
    id: 'form_biodiv',
    nome: 'BioAssist',
    emoji: '🦋',
    grupos: ['Aves', 'Mamíferos', 'Répteis', 'Anfíbios', 'Peixes', 'Invertebrados', 'Flora'],
    comportamentos: {
      fauna: ['Alimentando', 'Descansando', 'Voando', 'Nadando', 'Vocalizando', 'Reprodução', 'Locomoção'],
      flora: ['Floração', 'Frutificação', 'Brotação', 'Dormência', 'Senescência']
    },
    
    validateObservation(obs) {
      const issues = [];
      if (!obs.especie || obs.especie.length < 3) issues.push('Nome da espécie muito curto');
      if (!obs.quantidade || obs.quantidade < 1) issues.push('Quantidade deve ser >= 1');
      if (!obs.grupo || !this.grupos.includes(obs.grupo)) issues.push('Grupo taxonômico inválido');
      
      return { valid: issues.length === 0, issues };
    },
    
    suggestSpecies(descricao) {
      const lower = descricao.toLowerCase();
      const sugestoes = [];
      
      // Aves
      if (lower.includes('arara') || lower.includes('azul') || lower.includes('amarelo')) {
        sugestoes.push({ nome: 'Arara-canindé', cientifico: 'Ara ararauna', grupo: 'Aves' });
      }
      if (lower.includes('tucano') || lower.includes('bico grande')) {
        sugestoes.push({ nome: 'Tucano-toco', cientifico: 'Ramphastos toco', grupo: 'Aves' });
      }
      if (lower.includes('seriema') || lower.includes('perna longa')) {
        sugestoes.push({ nome: 'Seriema', cientifico: 'Cariama cristata', grupo: 'Aves' });
      }
      // Mamíferos
      if (lower.includes('lobo') || lower.includes('canídeo') || lower.includes('vermelho')) {
        sugestoes.push({ nome: 'Lobo-guará', cientifico: 'Chrysocyon brachyurus', grupo: 'Mamíferos' });
      }
      if (lower.includes('tamanduá') || lower.includes('formig')) {
        sugestoes.push({ nome: 'Tamanduá-bandeira', cientifico: 'Myrmecophaga tridactyla', grupo: 'Mamíferos' });
      }
      if (lower.includes('tatu') || lower.includes('casco')) {
        sugestoes.push({ nome: 'Tatu-canastra', cientifico: 'Priodontes maximus', grupo: 'Mamíferos' });
      }
      // Flora
      if (lower.includes('pequi') || lower.includes('amarelo espinho')) {
        sugestoes.push({ nome: 'Pequi', cientifico: 'Caryocar brasiliense', grupo: 'Flora' });
      }
      if (lower.includes('buriti') || lower.includes('palmeira')) {
        sugestoes.push({ nome: 'Buriti', cientifico: 'Mauritia flexuosa', grupo: 'Flora' });
      }
      
      return sugestoes;
    },
    
    getConservationStatus(especie) {
      const status = {
        'Chrysocyon brachyurus': { status: 'VU', nome: 'Vulnerável' },
        'Myrmecophaga tridactyla': { status: 'VU', nome: 'Vulnerável' },
        'Priodontes maximus': { status: 'VU', nome: 'Vulnerável' },
        'Panthera onca': { status: 'VU', nome: 'Vulnerável' },
        'Ara ararauna': { status: 'LC', nome: 'Pouco Preocupante' }
      };
      return status[especie] || { status: 'NE', nome: 'Não Avaliada' };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO DE WAYPOINT
  // ═══════════════════════════════════════════════════════════════════════════
  waypoint: {
    id: 'form_waypoint',
    nome: 'GeoAssist',
    emoji: '📍',
    
    validateCoordinates(lat, lon) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      
      // Limites aproximados da reserva (região de São Domingos, GO)
      const bounds = { latMin: -14.0, latMax: -13.0, lonMin: -47.0, lonMax: -46.0 };
      
      if (isNaN(latNum) || isNaN(lonNum)) {
        return { valid: false, error: 'Coordenadas inválidas' };
      }
      
      const inBounds = latNum >= bounds.latMin && latNum <= bounds.latMax &&
                       lonNum >= bounds.lonMin && lonNum <= bounds.lonMax;
      
      return {
        valid: true,
        inReserva: inBounds,
        warning: !inBounds ? 'Coordenadas fora da área principal da reserva' : null,
        formatted: `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`
      };
    },
    
    suggestCategory(descricao) {
      const lower = descricao.toLowerCase();
      
      if (lower.includes('água') || lower.includes('nascente') || lower.includes('rio')) return 'Recurso Hídrico';
      if (lower.includes('trilha') || lower.includes('caminho')) return 'Trilha';
      if (lower.includes('árvore') || lower.includes('planta')) return 'Ponto de Interesse Botânico';
      if (lower.includes('animal') || lower.includes('ninho')) return 'Ponto de Observação Fauna';
      if (lower.includes('mirante') || lower.includes('vista')) return 'Mirante';
      if (lower.includes('sede') || lower.includes('estrutura')) return 'Infraestrutura';
      
      return 'Ponto de Interesse Geral';
    },
    
    calculateDistance(lat1, lon1, lat2, lon2) {
      // Fórmula de Haversine
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(2);
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO SAF/AGROFLORESTA
  // ═══════════════════════════════════════════════════════════════════════════
  saf: {
    id: 'form_saf',
    nome: 'SAFAssist',
    emoji: '🌳',
    
    especies_recomendadas: {
      emergente: ['Jatobá', 'Copaíba', 'Aroeira', 'Gonçalo-alves'],
      alto: ['Pequi', 'Baru', 'Mangaba', 'Cagaita'],
      medio: ['Banana', 'Mamão', 'Café', 'Cacau'],
      baixo: ['Mandioca', 'Batata-doce', 'Abóbora', 'Feijão']
    },
    
    validateParcela(dados) {
      const issues = [];
      
      if (!dados.area || dados.area <= 0) issues.push('Área deve ser maior que 0');
      if (!dados.nome || dados.nome.length < 3) issues.push('Nome da parcela muito curto');
      
      return { valid: issues.length === 0, issues };
    },
    
    suggestEspecies(estrato, solo_pH) {
      const especies = this.especies_recomendadas[estrato] || [];
      
      // Ajusta por pH
      if (solo_pH && parseFloat(solo_pH) < 5.0) {
        return especies.filter(e => ['Mandioca', 'Pequi', 'Baru'].includes(e));
      }
      
      return especies;
    },
    
    estimateCarbonSequestration(area, idade) {
      // Estimativa simplificada: 10-15 ton CO2/ha/ano
      const taxaMedia = 12.5;
      return {
        anual: (area * taxaMedia).toFixed(1),
        acumulado: (area * taxaMedia * idade).toFixed(1),
        unidade: 'ton CO₂'
      };
    },
    
    getManagementTips(idade, estacao) {
      const tips = [];
      
      if (idade < 2) tips.push('Capina seletiva frequente', 'Coroamento das mudas');
      if (idade >= 2 && idade < 5) tips.push('Poda de formação', 'Adubação verde');
      if (idade >= 5) tips.push('Poda de produção', 'Desbaste seletivo');
      
      if (estacao === 'seca') tips.push('Cobertura morta para reter umidade');
      if (estacao === 'chuva') tips.push('Plantio de novas espécies', 'Adubação orgânica');
      
      return tips;
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSISTENTE FORMULÁRIO DE VISITANTES
  // ═══════════════════════════════════════════════════════════════════════════
  visitantes: {
    id: 'form_visitantes',
    nome: 'VisitAssist',
    emoji: '🎫',
    
    validateVisitor(dados) {
      const issues = [];
      
      if (!dados.nome || dados.nome.length < 3) issues.push('Nome muito curto');
      if (!dados.email || !dados.email.includes('@')) issues.push('Email inválido');
      if (!dados.quantidade || dados.quantidade < 1) issues.push('Quantidade inválida');
      
      return { valid: issues.length === 0, issues };
    },
    
    suggestActivity(perfil) {
      const atividades = {
        familia: ['Trilha da Nascente (fácil)', 'Observação de aves', 'Piquenique ecológico'],
        aventureiro: ['Trilha do Mirante', 'Trilha das Veredas', 'Fotografia noturna'],
        cientifico: ['Monitoramento de fauna', 'Coleta de dados', 'Workshop de identificação'],
        escolar: ['Trilha interpretativa', 'Plantio de mudas', 'Oficina de sementes'],
        corporativo: ['Team building na natureza', 'Workshop de sustentabilidade', 'Banho de floresta']
      };
      
      return atividades[perfil] || atividades.familia;
    },
    
    calculateGroupPrice(quantidade, tipo) {
      const precos = { adulto: 50, estudante: 25, crianca: 0, idoso: 25 };
      const base = precos[tipo] || 50;
      
      // Desconto para grupos
      let desconto = 0;
      if (quantidade >= 20) desconto = 0.20;
      else if (quantidade >= 10) desconto = 0.10;
      
      const total = base * quantidade * (1 - desconto);
      return { unitario: base, quantidade, desconto: desconto * 100, total };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Form Assistants
// ═══════════════════════════════════════════════════════════════════════════

/** Valida campo de formulário de água */
function apiFormAguaValidate(campo, valor) {
  return FormAssistantChatbots.agua.validateField(campo, valor);
}

/** Interpreta dados completos de água */
function apiFormAguaInterpret(dados) {
  return FormAssistantChatbots.agua.interpretData(dados);
}

/** Valida campo de formulário de solo */
function apiFormSoloValidate(campo, valor) {
  return FormAssistantChatbots.solo.validateField(campo, valor);
}

/** Interpreta dados de solo */
function apiFormSoloInterpret(dados) {
  return FormAssistantChatbots.solo.interpretData(dados);
}

/** Valida observação de biodiversidade */
function apiFormBioValidate(observacao) {
  return FormAssistantChatbots.biodiversidade.validateObservation(observacao);
}

/** Sugere espécies baseado na descrição */
function apiFormBioSuggest(descricao) {
  return { success: true, sugestoes: FormAssistantChatbots.biodiversidade.suggestSpecies(descricao) };
}

/** Valida coordenadas de waypoint */
function apiFormWaypointValidate(lat, lon) {
  return FormAssistantChatbots.waypoint.validateCoordinates(lat, lon);
}

/** Calcula distância entre dois pontos */
function apiFormWaypointDistance(lat1, lon1, lat2, lon2) {
  return { km: FormAssistantChatbots.waypoint.calculateDistance(lat1, lon1, lat2, lon2) };
}

/** Sugere espécies para SAF por estrato */
function apiFormSAFSuggest(estrato, pH) {
  return { especies: FormAssistantChatbots.saf.suggestEspecies(estrato, pH) };
}

/** Estima sequestro de carbono */
function apiFormSAFCarbon(area, idade) {
  return FormAssistantChatbots.saf.estimateCarbonSequestration(area, idade);
}

/** Sugere atividades para visitantes */
function apiFormVisitantesSuggest(perfil) {
  return { atividades: FormAssistantChatbots.visitantes.suggestActivity(perfil) };
}

/** Calcula preço para grupo */
function apiFormVisitantesPrice(quantidade, tipo) {
  return FormAssistantChatbots.visitantes.calculateGroupPrice(quantidade, tipo);
}
