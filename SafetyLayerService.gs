/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAFETY LAYER SERVICE - Camada de Segurança Rígida
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Implementa verificação de fatos rígida (Hard-Coded Safety Layer) conforme
 * seção 6.3 do documento de arquitetura.
 * 
 * Funcionalidades:
 * - Blacklist de espécies tóxicas/perigosas
 * - Verificação de segurança hídrica (turbidez, correnteza, nível)
 * - Interceptação de respostas perigosas da IA
 * - Alertas de segurança para fauna perigosa
 * - Validação de recomendações de consumo/uso
 * 
 * REGRA CRÍTICA: Esta camada tem PRIORIDADE sobre qualquer resposta da IA.
 * Se a IA sugerir algo perigoso, o script intercepta e substitui.
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Blacklist de Plantas Tóxicas do Cerrado
 * Fonte: Flora do Brasil, Lorenzi (Plantas Daninhas)
 */
const TOXIC_PLANTS = {
  // Altamente tóxicas - NUNCA consumir
  'Dieffenbachia seguine': {
    nomePopular: ['Comigo-ninguém-pode', 'Aninga-do-Pará'],
    toxicidade: 'ALTA',
    partesToxicas: ['todas'],
    sintomas: 'Edema de glote, asfixia, queimação intensa',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Ricinus communis': {
    nomePopular: ['Mamona', 'Carrapateira'],
    toxicidade: 'ALTA',
    partesToxicas: ['sementes'],
    sintomas: 'Náusea, vômito, diarreia severa, pode ser fatal',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Nerium oleander': {
    nomePopular: ['Espirradeira', 'Oleandro'],
    toxicidade: 'ALTA',
    partesToxicas: ['todas'],
    sintomas: 'Arritmia cardíaca, pode ser fatal',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Jatropha curcas': {
    nomePopular: ['Pinhão-manso', 'Pinhão-de-purga'],
    toxicidade: 'ALTA',
    partesToxicas: ['sementes', 'látex'],
    sintomas: 'Gastroenterite severa, desidratação',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Manihot esculenta': {
    nomePopular: ['Mandioca-brava', 'Mandioca-amarga'],
    toxicidade: 'ALTA',
    partesToxicas: ['raiz crua'],
    sintomas: 'Liberação de cianeto, pode ser fatal',
    acao: 'ALERTAR_PREPARO',
    nota: 'Segura após processamento adequado (pubagem)'
  },
  'Palicourea rigida': {
    nomePopular: ['Erva-de-rato', 'Cafezinho'],
    toxicidade: 'ALTA',
    partesToxicas: ['todas'],
    sintomas: 'Contém monofluoracetato, fatal para humanos e animais',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Asclepias curassavica': {
    nomePopular: ['Oficial-de-sala', 'Erva-de-rato'],
    toxicidade: 'ALTA',
    partesToxicas: ['todas', 'látex'],
    sintomas: 'Cardiotoxicidade, vômitos',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Thevetia peruviana': {
    nomePopular: ['Chapéu-de-napoleão', 'Jorro-jorro'],
    toxicidade: 'ALTA',
    partesToxicas: ['todas', 'especialmente sementes'],
    sintomas: 'Arritmia cardíaca grave, pode ser fatal',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Lantana camara': {
    nomePopular: ['Lantana', 'Camará'],
    toxicidade: 'MEDIA',
    partesToxicas: ['frutos verdes', 'folhas'],
    sintomas: 'Fotossensibilização, lesões hepáticas',
    acao: 'BLOQUEAR_CONSUMO'
  },
  'Solanum americanum': {
    nomePopular: ['Maria-pretinha', 'Erva-moura'],
    toxicidade: 'MEDIA',
    partesToxicas: ['frutos verdes', 'folhas'],
    sintomas: 'Solanina causa náusea, vômito, diarreia',
    acao: 'ALERTAR_PREPARO',
    nota: 'Frutos maduros (pretos) são comestíveis em pequenas quantidades'
  }
};

/**
 * Fauna Perigosa do Cerrado
 */
const DANGEROUS_FAUNA = {
  // Serpentes peçonhentas
  'Bothrops moojeni': {
    nomePopular: ['Jararaca', 'Caiçaca'],
    perigo: 'ALTO',
    tipo: 'serpente_peconhenta',
    acao: 'MANTER_DISTANCIA',
    distanciaSegura: '3 metros',
    primeirosocorros: 'Imobilizar membro, NÃO fazer torniquete, buscar atendimento URGENTE'
  },
  'Bothrops alternatus': {
    nomePopular: ['Urutu', 'Cruzeira'],
    perigo: 'ALTO',
    tipo: 'serpente_peconhenta',
    acao: 'MANTER_DISTANCIA',
    distanciaSegura: '3 metros'
  },
  'Crotalus durissus': {
    nomePopular: ['Cascavel'],
    perigo: 'ALTO',
    tipo: 'serpente_peconhenta',
    acao: 'MANTER_DISTANCIA',
    distanciaSegura: '3 metros'
  },
  'Micrurus frontalis': {
    nomePopular: ['Coral-verdadeira'],
    perigo: 'ALTO',
    tipo: 'serpente_peconhenta',
    acao: 'NAO_TOCAR',
    nota: 'Veneno neurotóxico potente'
  },
  // Aracnídeos
  'Phoneutria nigriventer': {
    nomePopular: ['Aranha-armadeira'],
    perigo: 'ALTO',
    tipo: 'aracnideo',
    acao: 'NAO_TOCAR',
    primeirosocorros: 'Compressas frias, buscar atendimento'
  },
  'Loxosceles sp.': {
    nomePopular: ['Aranha-marrom'],
    perigo: 'ALTO',
    tipo: 'aracnideo',
    acao: 'NAO_TOCAR',
    nota: 'Veneno necrosante'
  },
  'Tityus serrulatus': {
    nomePopular: ['Escorpião-amarelo'],
    perigo: 'ALTO',
    tipo: 'aracnideo',
    acao: 'NAO_TOCAR',
    primeirosocorros: 'Compressas frias, buscar atendimento URGENTE para crianças'
  },
  // Insetos
  'Apis mellifera': {
    nomePopular: ['Abelha-africanizada'],
    perigo: 'MEDIO',
    tipo: 'inseto',
    acao: 'EVITAR_APROXIMACAO',
    nota: 'Perigoso em enxames. Alérgicos: risco de anafilaxia'
  },
  'Paraponera clavata': {
    nomePopular: ['Tocandira', 'Formiga-cabo-verde'],
    perigo: 'MEDIO',
    tipo: 'inseto',
    acao: 'NAO_TOCAR',
    nota: 'Picada extremamente dolorosa'
  }
};

/**
 * Limites de Segurança Hídrica
 */
const WATER_SAFETY_LIMITS = {
  turbidez: {
    limite: 50,
    unidade: 'NTU',
    acaoExcedido: 'BLOQUEAR_IMERSAO',
    mensagem: 'Turbidez elevada - imersão não recomendada'
  },
  correnteza: {
    limite: 0.5,
    unidade: 'm/s',
    acaoExcedido: 'BLOQUEAR_IMERSAO',
    mensagem: 'Correnteza forte - risco de afogamento'
  },
  nivelAgua: {
    limiteAlto: 2.5,
    limiteBaixo: 0.3,
    unidade: 'm',
    acaoExcedido: 'BLOQUEAR_IMERSAO',
    mensagem: 'Nível da água fora dos parâmetros seguros'
  },
  temperatura: {
    limiteMin: 15,
    limiteMax: 35,
    unidade: '°C',
    acaoExcedido: 'ALERTAR',
    mensagem: 'Temperatura da água pode causar desconforto'
  },
  coliformes: {
    limite: 1000,
    unidade: 'NMP/100ml',
    acaoExcedido: 'BLOQUEAR_IMERSAO',
    mensagem: 'Contaminação bacteriana - não entrar na água'
  },
  ph: {
    limiteMin: 6.0,
    limiteMax: 9.0,
    acaoExcedido: 'ALERTAR',
    mensagem: 'pH fora da faixa ideal'
  }
};

/**
 * Palavras-chave que indicam intenção de consumo
 */
const CONSUMPTION_KEYWORDS = [
  'comer', 'comestível', 'comestivel', 'consumir', 'ingerir',
  'beber', 'chá', 'cha', 'infusão', 'infusao',
  'medicinal', 'remédio', 'remedio', 'curar', 'tratar',
  'mastigar', 'engolir', 'preparar para comer'
];

/**
 * Safety Layer Service
 * @namespace SafetyLayerService
 */
const SafetyLayerService = {

  /**
   * Verifica se uma espécie é tóxica
   * @param {string} nomeEspecie - Nome científico ou popular
   * @returns {object} Resultado da verificação
   */
  verificarToxicidadePlanta(nomeEspecie) {
    const nomeLower = nomeEspecie.toLowerCase();
    
    // Busca por nome científico
    for (const [nomeCientifico, dados] of Object.entries(TOXIC_PLANTS)) {
      if (nomeCientifico.toLowerCase() === nomeLower) {
        return {
          isToxica: true,
          especie: nomeCientifico,
          ...dados
        };
      }
      
      // Busca por nome popular
      if (dados.nomePopular.some(np => np.toLowerCase() === nomeLower)) {
        return {
          isToxica: true,
          especie: nomeCientifico,
          ...dados
        };
      }
    }
    
    return { isToxica: false, especie: nomeEspecie };
  },

  /**
   * Verifica se um animal é perigoso
   * @param {string} nomeEspecie - Nome científico ou popular
   * @returns {object} Resultado da verificação
   */
  verificarPericulosidadeFauna(nomeEspecie) {
    const nomeLower = nomeEspecie.toLowerCase();
    
    for (const [nomeCientifico, dados] of Object.entries(DANGEROUS_FAUNA)) {
      if (nomeCientifico.toLowerCase() === nomeLower) {
        return {
          isPerigoso: true,
          especie: nomeCientifico,
          ...dados
        };
      }
      
      if (dados.nomePopular.some(np => np.toLowerCase().includes(nomeLower) || 
                                       nomeLower.includes(np.toLowerCase()))) {
        return {
          isPerigoso: true,
          especie: nomeCientifico,
          ...dados
        };
      }
    }
    
    return { isPerigoso: false, especie: nomeEspecie };
  },

  /**
   * Verifica segurança da água para imersão
   * @param {object} dadosAgua - Dados de qualidade da água
   * @returns {object} Resultado da verificação
   */
  verificarSegurancaHidrica(dadosAgua) {
    const alertas = [];
    const bloqueios = [];
    
    // Turbidez
    if (dadosAgua.turbidez > WATER_SAFETY_LIMITS.turbidez.limite) {
      bloqueios.push({
        parametro: 'turbidez',
        valor: dadosAgua.turbidez,
        limite: WATER_SAFETY_LIMITS.turbidez.limite,
        mensagem: WATER_SAFETY_LIMITS.turbidez.mensagem
      });
    }
    
    // Correnteza
    if (dadosAgua.correnteza > WATER_SAFETY_LIMITS.correnteza.limite) {
      bloqueios.push({
        parametro: 'correnteza',
        valor: dadosAgua.correnteza,
        limite: WATER_SAFETY_LIMITS.correnteza.limite,
        mensagem: WATER_SAFETY_LIMITS.correnteza.mensagem
      });
    }
    
    // Nível da água
    if (dadosAgua.nivel > WATER_SAFETY_LIMITS.nivelAgua.limiteAlto ||
        dadosAgua.nivel < WATER_SAFETY_LIMITS.nivelAgua.limiteBaixo) {
      bloqueios.push({
        parametro: 'nivel',
        valor: dadosAgua.nivel,
        mensagem: WATER_SAFETY_LIMITS.nivelAgua.mensagem
      });
    }
    
    // Coliformes
    if (dadosAgua.coliformes > WATER_SAFETY_LIMITS.coliformes.limite) {
      bloqueios.push({
        parametro: 'coliformes',
        valor: dadosAgua.coliformes,
        limite: WATER_SAFETY_LIMITS.coliformes.limite,
        mensagem: WATER_SAFETY_LIMITS.coliformes.mensagem
      });
    }
    
    // Temperatura (alerta, não bloqueio)
    if (dadosAgua.temperatura < WATER_SAFETY_LIMITS.temperatura.limiteMin ||
        dadosAgua.temperatura > WATER_SAFETY_LIMITS.temperatura.limiteMax) {
      alertas.push({
        parametro: 'temperatura',
        valor: dadosAgua.temperatura,
        mensagem: WATER_SAFETY_LIMITS.temperatura.mensagem
      });
    }
    
    // pH (alerta)
    if (dadosAgua.ph < WATER_SAFETY_LIMITS.ph.limiteMin ||
        dadosAgua.ph > WATER_SAFETY_LIMITS.ph.limiteMax) {
      alertas.push({
        parametro: 'ph',
        valor: dadosAgua.ph,
        mensagem: WATER_SAFETY_LIMITS.ph.mensagem
      });
    }
    
    const seguro = bloqueios.length === 0;
    
    return {
      seguroParaImersao: seguro,
      bloqueios,
      alertas,
      recomendacao: seguro ? 
        (alertas.length > 0 ? 'IMERSAO_COM_CAUTELA' : 'IMERSAO_LIBERADA') :
        'IMERSAO_BLOQUEADA'
    };
  },

  /**
   * Detecta intenção de consumo na mensagem
   * @param {string} mensagem - Mensagem do usuário
   * @returns {boolean} True se detectar intenção de consumo
   */
  detectarIntencaoConsumo(mensagem) {
    const msgLower = mensagem.toLowerCase();
    return CONSUMPTION_KEYWORDS.some(kw => msgLower.includes(kw));
  },

  /**
   * Intercepta e valida resposta da IA antes de enviar ao usuário
   * @param {string} respostaIA - Resposta gerada pela IA
   * @param {string} mensagemOriginal - Mensagem original do usuário
   * @param {object} contexto - Contexto adicional
   * @returns {object} Resposta validada ou substituída
   */
  interceptarResposta(respostaIA, mensagemOriginal, contexto = {}) {
    const resultado = {
      respostaOriginal: respostaIA,
      respostaFinal: respostaIA,
      foiInterceptada: false,
      motivoIntercepcao: null,
      alertasAdicionados: []
    };
    
    // Verifica se há menção a plantas tóxicas
    for (const [nomeCientifico, dados] of Object.entries(TOXIC_PLANTS)) {
      const todosNomes = [nomeCientifico, ...dados.nomePopular];
      
      for (const nome of todosNomes) {
        if (respostaIA.toLowerCase().includes(nome.toLowerCase())) {
          // Se detectar intenção de consumo + planta tóxica = INTERCEPTAR
          if (this.detectarIntencaoConsumo(mensagemOriginal) || 
              this.detectarIntencaoConsumo(respostaIA)) {
            
            if (dados.acao === 'BLOQUEAR_CONSUMO') {
              resultado.foiInterceptada = true;
              resultado.motivoIntercepcao = 'PLANTA_TOXICA';
              resultado.respostaFinal = this._gerarAlertaToxicidade(nomeCientifico, dados);
              return resultado;
            } else if (dados.acao === 'ALERTAR_PREPARO') {
              resultado.alertasAdicionados.push(
                this._gerarAlertaPreparo(nomeCientifico, dados)
              );
            }
          }
        }
      }
    }
    
    // Verifica menção a fauna perigosa
    for (const [nomeCientifico, dados] of Object.entries(DANGEROUS_FAUNA)) {
      const todosNomes = [nomeCientifico, ...dados.nomePopular];
      
      for (const nome of todosNomes) {
        if (respostaIA.toLowerCase().includes(nome.toLowerCase())) {
          resultado.alertasAdicionados.push(
            this._gerarAlertaFauna(nomeCientifico, dados)
          );
        }
      }
    }
    
    // Adiciona alertas à resposta se houver
    if (resultado.alertasAdicionados.length > 0) {
      resultado.respostaFinal = respostaIA + '\n\n' + 
        resultado.alertasAdicionados.join('\n\n');
    }
    
    return resultado;
  },

  /**
   * Gera alerta de toxicidade
   * @private
   */
  _gerarAlertaToxicidade(nomeCientifico, dados) {
    return `⚠️ **ALERTA DE SEGURANÇA - PLANTA TÓXICA**

🚫 **${dados.nomePopular[0]}** (${nomeCientifico}) é uma planta **TÓXICA**.

**Nível de toxicidade:** ${dados.toxicidade}
**Partes tóxicas:** ${dados.partesToxicas.join(', ')}
**Sintomas de intoxicação:** ${dados.sintomas}

❌ **NÃO CONSUMA** esta planta de nenhuma forma.
❌ **NÃO PREPARE** chás, infusões ou qualquer preparação.

**Em caso de ingestão acidental:**
📞 CIATOX: 0800-722-6001
📞 SAMU: 192

_Esta mensagem foi gerada automaticamente pelo sistema de segurança da Reserva Araras._`;
  },

  /**
   * Gera alerta de preparo especial
   * @private
   */
  _gerarAlertaPreparo(nomeCientifico, dados) {
    return `⚠️ **ATENÇÃO - PREPARO ESPECIAL NECESSÁRIO**

A planta **${dados.nomePopular[0]}** (${nomeCientifico}) requer preparo adequado.

**Toxicidade:** ${dados.toxicidade}
**Nota:** ${dados.nota || 'Consulte especialista antes do consumo.'}

⚠️ O consumo sem preparo adequado pode causar: ${dados.sintomas}`;
  },

  /**
   * Gera alerta de fauna perigosa
   * @private
   */
  _gerarAlertaFauna(nomeCientifico, dados) {
    let alerta = `⚠️ **FAUNA PERIGOSA - ${dados.nomePopular[0].toUpperCase()}**

**Espécie:** ${nomeCientifico}
**Nível de perigo:** ${dados.perigo}
**Tipo:** ${dados.tipo.replace('_', ' ')}
**Ação recomendada:** ${dados.acao.replace('_', ' ')}`;

    if (dados.distanciaSegura) {
      alerta += `\n**Distância segura:** ${dados.distanciaSegura}`;
    }
    
    if (dados.primeirosocorros) {
      alerta += `\n\n**Primeiros socorros:** ${dados.primeirosocorros}`;
    }
    
    if (dados.nota) {
      alerta += `\n\n_${dados.nota}_`;
    }
    
    return alerta;
  },

  /**
   * Valida recomendação de hidroterapia
   * @param {string} localId - ID do local/ponto de água
   * @returns {object} Validação
   */
  validarHidroterapia(localId) {
    try {
      // Busca dados mais recentes de qualidade da água
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('QUALIDADE_AGUA');
      
      if (!sheet) {
        return {
          permitido: false,
          motivo: 'Dados de qualidade da água não disponíveis',
          recomendacao: 'CONTEMPLACAO_APENAS'
        };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Encontra índices
      const idx = {
        local: headers.indexOf('Local') !== -1 ? headers.indexOf('Local') : 0,
        turbidez: headers.indexOf('Turbidez_NTU'),
        ph: headers.indexOf('pH'),
        temperatura: headers.indexOf('Temperatura_C'),
        data: headers.indexOf('Data')
      };
      
      // Busca dados mais recentes do local
      let dadosMaisRecentes = null;
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][idx.local] === localId || !localId) {
          dadosMaisRecentes = {
            turbidez: parseFloat(data[i][idx.turbidez]) || 0,
            ph: parseFloat(data[i][idx.ph]) || 7,
            temperatura: parseFloat(data[i][idx.temperatura]) || 25,
            correnteza: 0.3, // Default se não disponível
            nivel: 1.0,
            coliformes: 0
          };
          break;
        }
      }
      
      if (!dadosMaisRecentes) {
        return {
          permitido: false,
          motivo: 'Sem dados recentes para este local',
          recomendacao: 'CONTEMPLACAO_APENAS'
        };
      }
      
      const verificacao = this.verificarSegurancaHidrica(dadosMaisRecentes);
      
      return {
        permitido: verificacao.seguroParaImersao,
        verificacao,
        recomendacao: verificacao.recomendacao,
        dados: dadosMaisRecentes
      };
      
    } catch (error) {
      return {
        permitido: false,
        motivo: 'Erro ao verificar segurança: ' + error.message,
        recomendacao: 'CONTEMPLACAO_APENAS'
      };
    }
  },

  /**
   * Gera mensagem de segurança para bloqueio de hidroterapia
   * @param {object} verificacao - Resultado da verificação
   * @returns {string} Mensagem formatada
   */
  gerarMensagemBloqueioHidrico(verificacao) {
    let msg = `🚫 **IMERSÃO NÃO RECOMENDADA**

Por questões de segurança, a imersão na água não está liberada neste momento.

**Motivos:**\n`;

    for (const bloqueio of verificacao.bloqueios) {
      msg += `• ${bloqueio.mensagem} (${bloqueio.parametro}: ${bloqueio.valor})\n`;
    }

    msg += `
**Alternativas seguras:**
🧘 Contemplação visual da água
🎧 Meditação com sons da natureza
🚶 Caminhada na margem

_A segurança é nossa prioridade. Aguarde condições favoráveis._`;

    return msg;
  },

  /**
   * Lista todas as espécies tóxicas cadastradas
   * @returns {array} Lista de espécies
   */
  listarPlantasToxicas() {
    return Object.entries(TOXIC_PLANTS).map(([nome, dados]) => ({
      nomeCientifico: nome,
      nomePopular: dados.nomePopular,
      toxicidade: dados.toxicidade
    }));
  },

  /**
   * Lista toda fauna perigosa cadastrada
   * @returns {array} Lista de espécies
   */
  listarFaunaPerigosa() {
    return Object.entries(DANGEROUS_FAUNA).map(([nome, dados]) => ({
      nomeCientifico: nome,
      nomePopular: dados.nomePopular,
      perigo: dados.perigo,
      tipo: dados.tipo
    }));
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Verifica toxicidade de planta
 */
function apiSafetyCheckPlant(nomeEspecie) {
  return SafetyLayerService.verificarToxicidadePlanta(nomeEspecie);
}

/**
 * API: Verifica periculosidade de fauna
 */
function apiSafetyCheckFauna(nomeEspecie) {
  return SafetyLayerService.verificarPericulosidadeFauna(nomeEspecie);
}

/**
 * API: Verifica segurança hídrica
 */
function apiSafetyCheckWater(dadosAgua) {
  return SafetyLayerService.verificarSegurancaHidrica(dadosAgua);
}

/**
 * API: Intercepta resposta da IA
 */
function apiSafetyIntercept(respostaIA, mensagemOriginal, contexto) {
  return SafetyLayerService.interceptarResposta(respostaIA, mensagemOriginal, contexto);
}

/**
 * API: Valida hidroterapia para local
 */
function apiSafetyValidateHydro(localId) {
  return SafetyLayerService.validarHidroterapia(localId);
}

/**
 * API: Lista plantas tóxicas
 */
function apiSafetyListToxicPlants() {
  return SafetyLayerService.listarPlantasToxicas();
}

/**
 * API: Lista fauna perigosa
 */
function apiSafetyListDangerousFauna() {
  return SafetyLayerService.listarFaunaPerigosa();
}
