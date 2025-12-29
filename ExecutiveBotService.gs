/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE BOT SERVICE - O Executivo (DashboardBot)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Prompt 13 do documento: Síntese para tomada de decisão.
 * Consumidor final de todos os dados gerados pelo ecossistema de chatbots.
 * 
 * Funcionalidades:
 * - Agregação de logs de interação de todos os bots
 * - Consolidação de métricas de biodiversidade
 * - Análise de satisfação e bem-estar
 * - Métricas de carbono e serviços ecossistêmicos
 * - Alertas e anomalias do sistema
 * - Relatórios executivos concisos para gestores
 * 
 * Integra dados de:
 * - TherapySessionService (bem-estar)
 * - CarbonAuditorService (carbono)
 * - BiodiversityService (biodiversidade)
 * - IoT/Sensores (monitoramento)
 * - Chatbot interactions (engajamento)
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Configuração do Executive Bot
 */
const EXECUTIVE_CONFIG = {
  botName: 'Executivo',
  persona: 'Analítico, conciso, orientado a dados e decisões',
  temperatura: 0.3, // Baixa - prioriza precisão
  
  // Períodos de análise
  periodos: {
    DIARIO: 1,
    SEMANAL: 7,
    MENSAL: 30,
    TRIMESTRAL: 90
  },
  
  // Thresholds para alertas
  alertas: {
    taxaSucessoTerapiaMin: 60,
    deltaHumorMin: 0,
    interacoesMinDiarias: 5,
    biodiversidadeNovasEspecies: 1
  }
};

/**
 * Executive Bot Service
 * @namespace ExecutiveBotService
 */
const ExecutiveBotService = {

  BOT_NAME: 'Executivo',

  /**
   * Gera relatório executivo completo
   * @param {string} periodo - Período de análise (DIARIO, SEMANAL, MENSAL)
   * @returns {object} Relatório consolidado
   */
  gerarRelatorioCompleto(periodo = 'SEMANAL') {
    const dias = EXECUTIVE_CONFIG.periodos[periodo] || 7;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    const relatorio = {
      tipo: 'RELATORIO_EXECUTIVO_CONSOLIDADO',
      titulo: `📊 Painel Executivo - Reserva Araras`,
      periodo: periodo,
      dataGeracao: new Date().toISOString(),
      diasAnalisados: dias,
      
      // Seções do relatório
      resumoGeral: {},
      bemEstar: {},
      carbono: {},
      biodiversidade: {},
      engajamento: {},
      alertas: [],
      recomendacoes: []
    };
    
    // Coleta dados de cada serviço
    relatorio.bemEstar = this._coletarDadosBemEstar();
    relatorio.carbono = this._coletarDadosCarbono();
    relatorio.biodiversidade = this._coletarDadosBiodiversidade();
    relatorio.engajamento = this._coletarDadosEngajamento(dataLimite);
    
    // Gera resumo e alertas
    relatorio.resumoGeral = this._gerarResumoGeral(relatorio);
    relatorio.alertas = this._identificarAlertas(relatorio);
    relatorio.recomendacoes = this._gerarRecomendacoes(relatorio);
    
    return { success: true, relatorio };
  },

  /**
   * Coleta dados de bem-estar/terapia
   * @private
   */
  _coletarDadosBemEstar() {
    try {
      // Tenta usar TherapySessionService
      if (typeof TherapySessionService !== 'undefined') {
        const analise = TherapySessionService.analisarEficacia();
        if (analise.success) {
          return {
            disponivel: true,
            totalSessoes: analise.resumo.totalSessoes,
            taxaSucesso: analise.resumo.taxaSucesso,
            deltaMedio: analise.resumo.deltaMedioGeral,
            sessoesComMelhora: analise.resumo.sessoesComMelhora,
            tipoMaisEficaz: analise.ranking?.tiposMaisEficazes?.[0]?.[0] || 'N/A'
          };
        }
      }
      return { disponivel: false, motivo: 'Serviço não disponível' };
    } catch (e) {
      return { disponivel: false, motivo: e.message };
    }
  },

  /**
   * Coleta dados de carbono
   * @private
   */
  _coletarDadosCarbono() {
    try {
      if (typeof CarbonAuditorService !== 'undefined') {
        const totais = CarbonAuditorService.calcularCarbonoReservaTotal();
        if (totais.success) {
          return {
            disponivel: true,
            co2Sequestrado: totais.totais.co2Sequestrado.toneladas,
            creditosCarbono: totais.totais.creditosCarbono.quantidade,
            valorBRL: totais.totais.creditosCarbono.valorBRL,
            areaMonitorada: totais.totais.areaMonitorada.valor,
            numMedicoes: totais.numMedicoes
          };
        }
      }
      return { disponivel: false, motivo: 'Serviço não disponível' };
    } catch (e) {
      return { disponivel: false, motivo: e.message };
    }
  },

  /**
   * Coleta dados de biodiversidade
   * @private
   */
  _coletarDadosBiodiversidade() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('BIODIVERSIDADE_RA');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { disponivel: false, motivo: 'Sem dados' };
      }
      
      const data = sheet.getDataRange().getValues();
      const totalEspecies = data.length - 1;
      
      // Conta por categoria (assumindo coluna de classe/categoria)
      const categorias = {};
      for (let i = 1; i < data.length; i++) {
        const cat = data[i][2] || 'Outros'; // Ajustar índice conforme schema
        categorias[cat] = (categorias[cat] || 0) + 1;
      }
      
      return {
        disponivel: true,
        totalEspecies,
        categorias,
        ultimoRegistro: data[data.length - 1][0] || 'N/A'
      };
    } catch (e) {
      return { disponivel: false, motivo: e.message };
    }
  },

  /**
   * Coleta dados de engajamento (interações chatbot)
   * @private
   */
  _coletarDadosEngajamento(dataLimite) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('CHATBOT_INTERACOES_RA');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { disponivel: false, motivo: 'Sem dados de interações' };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idxData = headers.indexOf('Data') !== -1 ? headers.indexOf('Data') : 0;
      const idxBot = headers.indexOf('Bot') !== -1 ? headers.indexOf('Bot') : 1;
      
      let totalInteracoes = 0;
      let interacoesPeriodo = 0;
      const porBot = {};
      
      for (let i = 1; i < data.length; i++) {
        totalInteracoes++;
        const dataReg = new Date(data[i][idxData]);
        const bot = data[i][idxBot] || 'Geral';
        
        porBot[bot] = (porBot[bot] || 0) + 1;
        
        if (dataReg >= dataLimite) {
          interacoesPeriodo++;
        }
      }
      
      // Bot mais usado
      const botMaisUsado = Object.entries(porBot)
        .sort((a, b) => b[1] - a[1])[0];
      
      return {
        disponivel: true,
        totalHistorico: totalInteracoes,
        noPeriodo: interacoesPeriodo,
        porBot,
        botMaisUsado: botMaisUsado ? botMaisUsado[0] : 'N/A',
        mediaDiaria: Math.round(interacoesPeriodo / 7 * 10) / 10
      };
    } catch (e) {
      return { disponivel: false, motivo: e.message };
    }
  },

  /**
   * Gera resumo geral consolidado
   * @private
   */
  _gerarResumoGeral(relatorio) {
    const destaques = [];
    
    // Bem-estar
    if (relatorio.bemEstar.disponivel) {
      destaques.push(`${relatorio.bemEstar.totalSessoes} sessões terapêuticas (${relatorio.bemEstar.taxaSucesso}% sucesso)`);
    }
    
    // Carbono
    if (relatorio.carbono.disponivel) {
      destaques.push(`${relatorio.carbono.co2Sequestrado} tCO₂ sequestradas (R$ ${relatorio.carbono.valorBRL?.toLocaleString('pt-BR') || 0})`);
    }
    
    // Biodiversidade
    if (relatorio.biodiversidade.disponivel) {
      destaques.push(`${relatorio.biodiversidade.totalEspecies} espécies catalogadas`);
    }
    
    // Engajamento
    if (relatorio.engajamento.disponivel) {
      destaques.push(`${relatorio.engajamento.noPeriodo} interações no período`);
    }
    
    return {
      dataAnalise: new Date().toISOString(),
      statusGeral: this._calcularStatusGeral(relatorio),
      destaques,
      servicosAtivos: [
        relatorio.bemEstar.disponivel ? 'Terapia' : null,
        relatorio.carbono.disponivel ? 'Carbono' : null,
        relatorio.biodiversidade.disponivel ? 'Biodiversidade' : null,
        relatorio.engajamento.disponivel ? 'Chatbots' : null
      ].filter(Boolean)
    };
  },

  /**
   * Calcula status geral do sistema
   * @private
   */
  _calcularStatusGeral(relatorio) {
    let pontos = 0;
    let total = 0;
    
    if (relatorio.bemEstar.disponivel) {
      total += 2;
      if (relatorio.bemEstar.taxaSucesso >= 70) pontos += 2;
      else if (relatorio.bemEstar.taxaSucesso >= 50) pontos += 1;
    }
    
    if (relatorio.carbono.disponivel) {
      total += 1;
      if (relatorio.carbono.numMedicoes > 0) pontos += 1;
    }
    
    if (relatorio.engajamento.disponivel) {
      total += 1;
      if (relatorio.engajamento.mediaDiaria >= 5) pontos += 1;
    }
    
    if (total === 0) return 'INDETERMINADO';
    
    const percentual = (pontos / total) * 100;
    if (percentual >= 80) return 'EXCELENTE';
    if (percentual >= 60) return 'BOM';
    if (percentual >= 40) return 'REGULAR';
    return 'ATENÇÃO';
  },

  /**
   * Identifica alertas e anomalias
   * @private
   */
  _identificarAlertas(relatorio) {
    const alertas = [];
    
    // Alertas de bem-estar
    if (relatorio.bemEstar.disponivel) {
      if (relatorio.bemEstar.taxaSucesso < EXECUTIVE_CONFIG.alertas.taxaSucessoTerapiaMin) {
        alertas.push({
          tipo: 'ATENCAO',
          area: 'Bem-estar',
          mensagem: `Taxa de sucesso terapêutico abaixo do ideal (${relatorio.bemEstar.taxaSucesso}%)`,
          acao: 'Revisar protocolos e capacitação de facilitadores'
        });
      }
      if (relatorio.bemEstar.deltaMedio < EXECUTIVE_CONFIG.alertas.deltaHumorMin) {
        alertas.push({
          tipo: 'CRITICO',
          area: 'Bem-estar',
          mensagem: 'Delta de humor negativo - sessões podem estar causando desconforto',
          acao: 'Investigar imediatamente e ajustar abordagem'
        });
      }
    }
    
    // Alertas de engajamento
    if (relatorio.engajamento.disponivel) {
      if (relatorio.engajamento.mediaDiaria < EXECUTIVE_CONFIG.alertas.interacoesMinDiarias) {
        alertas.push({
          tipo: 'INFO',
          area: 'Engajamento',
          mensagem: `Baixo volume de interações (${relatorio.engajamento.mediaDiaria}/dia)`,
          acao: 'Considerar campanhas de divulgação dos chatbots'
        });
      }
    }
    
    // Alertas de dados
    if (!relatorio.bemEstar.disponivel && !relatorio.carbono.disponivel) {
      alertas.push({
        tipo: 'ATENCAO',
        area: 'Sistema',
        mensagem: 'Serviços principais indisponíveis',
        acao: 'Verificar configuração e inicialização dos serviços'
      });
    }
    
    return alertas;
  },

  /**
   * Gera recomendações baseadas nos dados
   * @private
   */
  _gerarRecomendacoes(relatorio) {
    const recomendacoes = [];
    
    // Recomendações de bem-estar
    if (relatorio.bemEstar.disponivel && relatorio.bemEstar.tipoMaisEficaz) {
      recomendacoes.push({
        area: 'Bem-estar',
        prioridade: 'ALTA',
        recomendacao: `Priorizar sessões de ${relatorio.bemEstar.tipoMaisEficaz} (maior eficácia comprovada)`
      });
    }
    
    // Recomendações de carbono
    if (relatorio.carbono.disponivel && relatorio.carbono.numMedicoes < 10) {
      recomendacoes.push({
        area: 'Carbono',
        prioridade: 'MEDIA',
        recomendacao: 'Expandir medições de carbono para mais parcelas'
      });
    }
    
    // Recomendações de engajamento
    if (relatorio.engajamento.disponivel && relatorio.engajamento.botMaisUsado) {
      recomendacoes.push({
        area: 'Engajamento',
        prioridade: 'BAIXA',
        recomendacao: `${relatorio.engajamento.botMaisUsado} é o mais utilizado - considerar melhorias prioritárias`
      });
    }
    
    // Recomendação geral
    recomendacoes.push({
      area: 'Geral',
      prioridade: 'MEDIA',
      recomendacao: 'Manter coleta consistente de dados para análises mais precisas'
    });
    
    return recomendacoes;
  },

  /**
   * Processa mensagem do chatbot executivo
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto
   * @returns {object} Resposta
   */
  processMessage(message, context = {}) {
    const msgLower = message.toLowerCase();
    
    // Relatório completo
    if (msgLower.includes('relatório') || msgLower.includes('relatorio') || 
        msgLower.includes('painel') || msgLower.includes('dashboard')) {
      
      let periodo = 'SEMANAL';
      if (msgLower.includes('diário') || msgLower.includes('diario') || msgLower.includes('hoje')) {
        periodo = 'DIARIO';
      } else if (msgLower.includes('mensal') || msgLower.includes('mês') || msgLower.includes('mes')) {
        periodo = 'MENSAL';
      } else if (msgLower.includes('trimest')) {
        periodo = 'TRIMESTRAL';
      }
      
      const resultado = this.gerarRelatorioCompleto(periodo);
      return {
        success: true,
        response: this._formatarRelatorioCompleto(resultado.relatorio),
        data: resultado.relatorio
      };
    }
    
    // Alertas
    if (msgLower.includes('alerta') || msgLower.includes('problema') || msgLower.includes('atenção')) {
      const resultado = this.gerarRelatorioCompleto('SEMANAL');
      return {
        success: true,
        response: this._formatarAlertas(resultado.relatorio.alertas),
        data: resultado.relatorio.alertas
      };
    }
    
    // Bem-estar específico
    if (msgLower.includes('terapia') || msgLower.includes('bem-estar') || msgLower.includes('sessões')) {
      const dados = this._coletarDadosBemEstar();
      return {
        success: true,
        response: this._formatarBemEstar(dados),
        data: dados
      };
    }
    
    // Carbono específico
    if (msgLower.includes('carbono') || msgLower.includes('co2') || msgLower.includes('sequestro')) {
      const dados = this._coletarDadosCarbono();
      return {
        success: true,
        response: this._formatarCarbono(dados),
        data: dados
      };
    }
    
    // Resposta padrão
    return {
      success: true,
      response: this._respostaPadrao()
    };
  },

  /**
   * Formata relatório completo para exibição
   * @private
   */
  _formatarRelatorioCompleto(rel) {
    let texto = `📊 **${rel.titulo}**
_Período: ${rel.periodo} (${rel.diasAnalisados} dias)_

**Status Geral:** ${rel.resumoGeral.statusGeral}

**Destaques:**
${rel.resumoGeral.destaques.map(d => `• ${d}`).join('\n')}

`;

    // Bem-estar
    if (rel.bemEstar.disponivel) {
      texto += `**🧘 Bem-Estar:**
• ${rel.bemEstar.totalSessoes} sessões realizadas
• Taxa de sucesso: ${rel.bemEstar.taxaSucesso}%
• Melhora média: +${rel.bemEstar.deltaMedio} pontos

`;
    }

    // Carbono
    if (rel.carbono.disponivel) {
      texto += `**🌳 Carbono:**
• ${rel.carbono.co2Sequestrado} tCO₂ sequestradas
• ${rel.carbono.creditosCarbono} créditos de carbono
• Valor: R$ ${rel.carbono.valorBRL?.toLocaleString('pt-BR') || 0}

`;
    }

    // Engajamento
    if (rel.engajamento.disponivel) {
      texto += `**💬 Engajamento:**
• ${rel.engajamento.noPeriodo} interações no período
• Média: ${rel.engajamento.mediaDiaria}/dia
• Bot mais usado: ${rel.engajamento.botMaisUsado}

`;
    }

    // Alertas
    if (rel.alertas.length > 0) {
      texto += `**⚠️ Alertas:**
${rel.alertas.map(a => `• [${a.tipo}] ${a.mensagem}`).join('\n')}

`;
    }

    // Recomendações
    if (rel.recomendacoes.length > 0) {
      texto += `**💡 Recomendações:**
${rel.recomendacoes.slice(0, 3).map(r => `• ${r.recomendacao}`).join('\n')}`;
    }

    return texto;
  },

  /**
   * Formata alertas
   * @private
   */
  _formatarAlertas(alertas) {
    if (alertas.length === 0) {
      return `✅ **Nenhum alerta ativo**

Todos os sistemas estão operando dentro dos parâmetros esperados.`;
    }

    let texto = `⚠️ **Alertas Ativos (${alertas.length})**\n\n`;
    
    for (const alerta of alertas) {
      const icone = alerta.tipo === 'CRITICO' ? '🔴' : 
                    alerta.tipo === 'ATENCAO' ? '🟡' : '🔵';
      texto += `${icone} **${alerta.area}** - ${alerta.tipo}
${alerta.mensagem}
_Ação: ${alerta.acao}_

`;
    }

    return texto;
  },

  /**
   * Formata dados de bem-estar
   * @private
   */
  _formatarBemEstar(dados) {
    if (!dados.disponivel) {
      return `🧘 **Bem-Estar**\n\n_${dados.motivo}_`;
    }

    return `🧘 **Relatório de Bem-Estar**

• **Total de sessões:** ${dados.totalSessoes}
• **Taxa de sucesso:** ${dados.taxaSucesso}%
• **Melhora média:** +${dados.deltaMedio} pontos de humor
• **Sessões com melhora:** ${dados.sessoesComMelhora}
• **Tipo mais eficaz:** ${dados.tipoMaisEficaz}

_Dados baseados em sessões completadas com registro de humor._`;
  },

  /**
   * Formata dados de carbono
   * @private
   */
  _formatarCarbono(dados) {
    if (!dados.disponivel) {
      return `🌳 **Carbono**\n\n_${dados.motivo}_`;
    }

    return `🌳 **Relatório de Carbono**

• **CO₂ sequestrado:** ${dados.co2Sequestrado} toneladas
• **Créditos de carbono:** ${dados.creditosCarbono}
• **Valor potencial:** R$ ${dados.valorBRL?.toLocaleString('pt-BR') || 0}
• **Área monitorada:** ${dados.areaMonitorada} ha
• **Medições realizadas:** ${dados.numMedicoes}

_Cálculos baseados em equações alométricas do Cerrado._`;
  },

  /**
   * Resposta padrão do bot
   * @private
   */
  _respostaPadrao() {
    return `📊 **Executivo - Painel de Gestão**

Sou o bot executivo da Reserva Araras. Posso fornecer:

• **Relatório completo** - Visão consolidada de todos os sistemas
• **Alertas** - Problemas e anomalias detectadas
• **Bem-estar** - Métricas de sessões terapêuticas
• **Carbono** - Dados de sequestro e créditos

Exemplos:
_"Mostre o relatório semanal"_
_"Quais são os alertas?"_
_"Como está o bem-estar?"_
_"Relatório de carbono"_`;
  },

  /**
   * Gera resumo rápido para notificações
   * @returns {object} Resumo compacto
   */
  gerarResumoRapido() {
    const rel = this.gerarRelatorioCompleto('DIARIO').relatorio;
    
    return {
      status: rel.resumoGeral.statusGeral,
      alertasCriticos: rel.alertas.filter(a => a.tipo === 'CRITICO').length,
      destaque: rel.resumoGeral.destaques[0] || 'Sistema operacional',
      dataHora: new Date().toISOString()
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════

/** API: Relatório executivo completo */
function apiExecutiveReport(periodo) {
  return ExecutiveBotService.gerarRelatorioCompleto(periodo);
}

/** API: Processa mensagem do chatbot */
function apiExecutiveChat(message, context) {
  return ExecutiveBotService.processMessage(message, context);
}

/** API: Resumo rápido para notificações */
function apiExecutiveSummary() {
  return ExecutiveBotService.gerarResumoRapido();
}

/** API: Apenas alertas */
function apiExecutiveAlerts() {
  const rel = ExecutiveBotService.gerarRelatorioCompleto('SEMANAL').relatorio;
  return { success: true, alertas: rel.alertas };
}

/** API: Métricas de bem-estar */
function apiExecutiveWellbeing() {
  return ExecutiveBotService._coletarDadosBemEstar();
}

/** API: Métricas de carbono */
function apiExecutiveCarbon() {
  return ExecutiveBotService._coletarDadosCarbono();
}

/** API: Métricas de engajamento */
function apiExecutiveEngagement() {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 7);
  return ExecutiveBotService._coletarDadosEngajamento(dataLimite);
}
