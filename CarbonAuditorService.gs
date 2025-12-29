/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CARBON AUDITOR SERVICE - Auditor de Carbono
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Prompt 9 do documento: Estimativa de serviços ecossistêmicos.
 * Recebe dados de crescimento do AgroBot e calcula sequestro de carbono.
 * 
 * Funcionalidades:
 * - Cálculo de sequestro de carbono por parcela
 * - Equações alométricas específicas do Cerrado
 * - Estimativa de biomassa acima e abaixo do solo
 * - Conversão para créditos de carbono
 * - Relatórios para o Executivo (DashboardBot)
 * - Projeções de sequestro futuro
 * 
 * Referências:
 * - IPCC Guidelines for National Greenhouse Gas Inventories
 * - Equações alométricas do Cerrado (Rezende et al., 2006)
 * - Protocolo Verra VCS para projetos florestais
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Constantes de Conversão
 */
const CARBON_CONSTANTS = {
  // Fração de carbono na biomassa seca (IPCC default)
  CARBON_FRACTION: 0.47,
  
  // Conversão de C para CO2 (peso molecular)
  C_TO_CO2: 44 / 12, // ≈ 3.67
  
  // Razão raiz/parte aérea para Cerrado (IPCC)
  ROOT_SHOOT_RATIO: 0.28,
  
  // Densidade média da madeira do Cerrado (g/cm³)
  WOOD_DENSITY_DEFAULT: 0.6,
  
  // Preço médio do crédito de carbono (USD/tCO2)
  CARBON_CREDIT_PRICE: 15,
  
  // Taxa de câmbio aproximada
  USD_TO_BRL: 5.0
};

/**
 * Equações Alométricas para Espécies do Cerrado
 * Formato: biomassa (kg) = a * DAP^b * H^c
 * DAP = Diâmetro à Altura do Peito (cm)
 * H = Altura (m)
 */
const ALLOMETRIC_EQUATIONS = {
  // Equação geral para Cerrado sentido restrito
  cerrado_geral: {
    id: 'cerrado_geral',
    nome: 'Cerrado Geral',
    formula: 'B = 0.0673 * (ρ * DAP² * H)^0.976',
    params: { a: 0.0673, b: 0.976 },
    fonte: 'Chave et al. (2014) - Pantropical'
  },
  
  // Cerradão (formação mais densa)
  cerradao: {
    id: 'cerradao',
    nome: 'Cerradão',
    formula: 'B = 0.0509 * ρ * DAP² * H',
    params: { a: 0.0509 },
    fonte: 'Rezende et al. (2006)'
  },
  
  // Mata de Galeria
  mata_galeria: {
    id: 'mata_galeria',
    nome: 'Mata de Galeria',
    formula: 'B = 0.0842 * DAP^2.3847',
    params: { a: 0.0842, b: 2.3847 },
    fonte: 'Scolforo et al. (2008)'
  },
  
  // Palmeiras (Buriti, etc)
  palmeiras: {
    id: 'palmeiras',
    nome: 'Palmeiras',
    formula: 'B = 6.67 + 12.78 * H',
    params: { a: 6.67, b: 12.78 },
    fonte: 'Saldarriaga et al. (1988)'
  },
  
  // SAF - Sistema Agroflorestal
  saf: {
    id: 'saf',
    nome: 'Sistema Agroflorestal',
    formula: 'B = 0.0625 * DAP^2.5',
    params: { a: 0.0625, b: 2.5 },
    fonte: 'Adaptado para SAFs do Cerrado'
  }
};

/**
 * Fatores de Emissão Evitada
 */
const AVOIDED_EMISSIONS = {
  // Emissões evitadas por não desmatar (tCO2/ha/ano)
  desmatamento_evitado: 150,
  
  // Emissões evitadas por não queimar (tCO2/ha/evento)
  queimada_evitada: 8,
  
  // Emissões de referência para pastagem degradada
  pastagem_degradada: 2
};

/**
 * Schema da planilha CARBONO_RA
 */
const CARBON_SCHEMA = {
  sheetName: 'CARBONO_RA',
  headers: [
    'ID_Medicao', 'ID_Parcela', 'Data_Medicao', 'Tipo_Vegetacao',
    'Area_ha', 'Num_Arvores', 'DAP_Medio_cm', 'Altura_Media_m',
    'Biomassa_Total_kg', 'Carbono_Total_kg', 'CO2_Sequestrado_kg',
    'CO2_por_ha_kg', 'Creditos_Estimados', 'Valor_USD', 'Valor_BRL',
    'Observacoes'
  ]
};

/**
 * Auditor de Carbono
 * @namespace CarbonAuditorService
 */
const CarbonAuditorService = {

  BOT_NAME: 'Auditor de Carbono',
  
  /**
   * Inicializa planilha
   */
  initializeSheet() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(CARBON_SCHEMA.sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(CARBON_SCHEMA.sheetName);
        sheet.appendRow(CARBON_SCHEMA.headers);
        
        const headerRange = sheet.getRange(1, 1, 1, CARBON_SCHEMA.headers.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheetName: CARBON_SCHEMA.sheetName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula biomassa de uma árvore individual
   * @param {number} dap - Diâmetro à altura do peito (cm)
   * @param {number} altura - Altura da árvore (m)
   * @param {string} tipoVegetacao - Tipo de vegetação
   * @param {number} densidade - Densidade da madeira (g/cm³)
   * @returns {object} Biomassa calculada
   */
  calcularBiomassaArvore(dap, altura, tipoVegetacao = 'cerrado_geral', densidade = null) {
    const eq = ALLOMETRIC_EQUATIONS[tipoVegetacao] || ALLOMETRIC_EQUATIONS.cerrado_geral;
    const rho = densidade || CARBON_CONSTANTS.WOOD_DENSITY_DEFAULT;
    
    let biomassaAerea = 0;
    
    // Aplica equação alométrica apropriada
    switch (tipoVegetacao) {
      case 'cerrado_geral':
        // B = 0.0673 * (ρ * DAP² * H)^0.976
        biomassaAerea = eq.params.a * Math.pow(rho * dap * dap * altura, eq.params.b);
        break;
        
      case 'cerradao':
        // B = 0.0509 * ρ * DAP² * H
        biomassaAerea = eq.params.a * rho * dap * dap * altura;
        break;
        
      case 'mata_galeria':
        // B = 0.0842 * DAP^2.3847
        biomassaAerea = eq.params.a * Math.pow(dap, eq.params.b);
        break;
        
      case 'palmeiras':
        // B = 6.67 + 12.78 * H
        biomassaAerea = eq.params.a + eq.params.b * altura;
        break;
        
      case 'saf':
        // B = 0.0625 * DAP^2.5
        biomassaAerea = eq.params.a * Math.pow(dap, eq.params.b);
        break;
        
      default:
        // Equação geral
        biomassaAerea = 0.0673 * Math.pow(rho * dap * dap * altura, 0.976);
    }
    
    // Biomassa abaixo do solo (raízes)
    const biomassaRaizes = biomassaAerea * CARBON_CONSTANTS.ROOT_SHOOT_RATIO;
    
    // Biomassa total
    const biomassaTotal = biomassaAerea + biomassaRaizes;
    
    // Carbono
    const carbono = biomassaTotal * CARBON_CONSTANTS.CARBON_FRACTION;
    
    // CO2 equivalente
    const co2 = carbono * CARBON_CONSTANTS.C_TO_CO2;
    
    return {
      dap,
      altura,
      tipoVegetacao,
      equacaoUsada: eq.nome,
      biomassaAerea: Math.round(biomassaAerea * 100) / 100,
      biomassaRaizes: Math.round(biomassaRaizes * 100) / 100,
      biomassaTotal: Math.round(biomassaTotal * 100) / 100,
      carbono: Math.round(carbono * 100) / 100,
      co2Sequestrado: Math.round(co2 * 100) / 100,
      unidades: {
        biomassa: 'kg',
        carbono: 'kg',
        co2: 'kg'
      }
    };
  },

  /**
   * Calcula carbono de uma parcela inteira
   * @param {object} parcelaData - Dados da parcela
   * @returns {object} Resultado do cálculo
   */
  calcularCarbonoParcela(parcelaData) {
    const {
      idParcela,
      areaHa,
      tipoVegetacao = 'cerrado_geral',
      arvores = [],        // Array de {dap, altura}
      dapMedio = null,     // Alternativa: usar médias
      alturaMedio = null,
      numArvores = null,
      densidade = null
    } = parcelaData;
    
    let biomassaTotal = 0;
    let carbonoTotal = 0;
    let co2Total = 0;
    
    // Se tem dados individuais de árvores
    if (arvores.length > 0) {
      for (const arvore of arvores) {
        const calc = this.calcularBiomassaArvore(
          arvore.dap, 
          arvore.altura, 
          tipoVegetacao,
          densidade
        );
        biomassaTotal += calc.biomassaTotal;
        carbonoTotal += calc.carbono;
        co2Total += calc.co2Sequestrado;
      }
    } 
    // Se tem médias
    else if (dapMedio && alturaMedio && numArvores) {
      const calcMedia = this.calcularBiomassaArvore(
        dapMedio, 
        alturaMedio, 
        tipoVegetacao,
        densidade
      );
      biomassaTotal = calcMedia.biomassaTotal * numArvores;
      carbonoTotal = calcMedia.carbono * numArvores;
      co2Total = calcMedia.co2Sequestrado * numArvores;
    }
    
    // Converte para toneladas
    const co2Toneladas = co2Total / 1000;
    const co2PorHa = areaHa > 0 ? co2Toneladas / areaHa : 0;
    
    // Estima créditos de carbono
    const creditosEstimados = co2Toneladas; // 1 crédito = 1 tCO2
    const valorUSD = creditosEstimados * CARBON_CONSTANTS.CARBON_CREDIT_PRICE;
    const valorBRL = valorUSD * CARBON_CONSTANTS.USD_TO_BRL;
    
    const resultado = {
      idParcela,
      areaHa,
      tipoVegetacao,
      numArvores: arvores.length || numArvores,
      dapMedio: dapMedio || (arvores.length > 0 ? 
        arvores.reduce((s, a) => s + a.dap, 0) / arvores.length : null),
      alturaMedio: alturaMedio || (arvores.length > 0 ? 
        arvores.reduce((s, a) => s + a.altura, 0) / arvores.length : null),
      biomassaTotal: {
        valor: Math.round(biomassaTotal),
        unidade: 'kg'
      },
      carbonoTotal: {
        valor: Math.round(carbonoTotal),
        unidade: 'kg'
      },
      co2Sequestrado: {
        total: Math.round(co2Total),
        toneladas: Math.round(co2Toneladas * 100) / 100,
        porHectare: Math.round(co2PorHa * 100) / 100,
        unidade: 'tCO2'
      },
      creditosCarbono: {
        quantidade: Math.round(creditosEstimados * 100) / 100,
        valorUSD: Math.round(valorUSD * 100) / 100,
        valorBRL: Math.round(valorBRL * 100) / 100
      },
      dataMedicao: new Date().toISOString()
    };
    
    // Salva na planilha
    this._salvarMedicao(resultado);
    
    return {
      success: true,
      resultado
    };
  },

  /**
   * Calcula sequestro anual estimado
   * @param {string} tipoVegetacao - Tipo de vegetação
   * @param {number} areaHa - Área em hectares
   * @param {number} idadeAnos - Idade do plantio/regeneração
   * @returns {object} Estimativa de sequestro anual
   */
  estimarSequestroAnual(tipoVegetacao, areaHa, idadeAnos = 10) {
    // Taxas médias de sequestro por tipo de vegetação (tCO2/ha/ano)
    const taxasSequestro = {
      cerrado_geral: 3.5,
      cerradao: 8.0,
      mata_galeria: 12.0,
      palmeiras: 4.0,
      saf: 10.0,
      regeneracao: 6.0,
      pastagem_degradada: 0.5
    };
    
    const taxa = taxasSequestro[tipoVegetacao] || taxasSequestro.cerrado_geral;
    
    // Ajuste por idade (curva de crescimento sigmoide simplificada)
    let fatorIdade = 1;
    if (idadeAnos < 5) {
      fatorIdade = 0.5 + (idadeAnos / 10); // Crescimento inicial
    } else if (idadeAnos > 30) {
      fatorIdade = 0.8; // Maturidade - sequestro reduzido
    }
    
    const sequestroAnual = taxa * areaHa * fatorIdade;
    const creditosAnuais = sequestroAnual;
    const valorAnualUSD = creditosAnuais * CARBON_CONSTANTS.CARBON_CREDIT_PRICE;
    const valorAnualBRL = valorAnualUSD * CARBON_CONSTANTS.USD_TO_BRL;
    
    return {
      success: true,
      tipoVegetacao,
      areaHa,
      idadeAnos,
      taxaBase: taxa,
      fatorIdade: Math.round(fatorIdade * 100) / 100,
      sequestroAnual: {
        valor: Math.round(sequestroAnual * 100) / 100,
        unidade: 'tCO2/ano'
      },
      creditosAnuais: Math.round(creditosAnuais * 100) / 100,
      valorAnual: {
        usd: Math.round(valorAnualUSD * 100) / 100,
        brl: Math.round(valorAnualBRL * 100) / 100
      },
      projecao10Anos: {
        co2Total: Math.round(sequestroAnual * 10 * 100) / 100,
        valorTotalBRL: Math.round(valorAnualBRL * 10 * 100) / 100
      }
    };
  },

  /**
   * Calcula emissões evitadas
   * @param {string} tipoAcao - Tipo de ação (desmatamento_evitado, queimada_evitada)
   * @param {number} areaHa - Área em hectares
   * @returns {object} Emissões evitadas
   */
  calcularEmissoesEvitadas(tipoAcao, areaHa) {
    const fator = AVOIDED_EMISSIONS[tipoAcao];
    
    if (!fator) {
      return { 
        success: false, 
        error: 'Tipo de ação não reconhecido',
        tiposDisponiveis: Object.keys(AVOIDED_EMISSIONS)
      };
    }
    
    const emissoesEvitadas = fator * areaHa;
    const creditosEvitados = emissoesEvitadas;
    const valorUSD = creditosEvitados * CARBON_CONSTANTS.CARBON_CREDIT_PRICE;
    const valorBRL = valorUSD * CARBON_CONSTANTS.USD_TO_BRL;
    
    return {
      success: true,
      tipoAcao,
      areaHa,
      fatorEmissao: fator,
      emissoesEvitadas: {
        valor: Math.round(emissoesEvitadas * 100) / 100,
        unidade: 'tCO2'
      },
      creditosEvitados: Math.round(creditosEvitados * 100) / 100,
      valor: {
        usd: Math.round(valorUSD * 100) / 100,
        brl: Math.round(valorBRL * 100) / 100
      }
    };
  },

  /**
   * Salva medição na planilha (método privado)
   * @param {object} resultado - Resultado do cálculo
   * @private
   */
  _salvarMedicao(resultado) {
    try {
      this.initializeSheet();
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CARBON_SCHEMA.sheetName);
      
      if (!sheet) return;
      
      const idMedicao = `CARB_${Date.now()}`;
      
      const row = [
        idMedicao,
        resultado.idParcela || '',
        resultado.dataMedicao || new Date().toISOString(),
        resultado.tipoVegetacao || '',
        resultado.areaHa || 0,
        resultado.numArvores || 0,
        resultado.dapMedio || 0,
        resultado.alturaMedio || 0,
        resultado.biomassaTotal?.valor || 0,
        resultado.carbonoTotal?.valor || 0,
        resultado.co2Sequestrado?.total || 0,
        resultado.co2Sequestrado?.porHectare || 0,
        resultado.creditosCarbono?.quantidade || 0,
        resultado.creditosCarbono?.valorUSD || 0,
        resultado.creditosCarbono?.valorBRL || 0,
        resultado.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
    } catch (error) {
      console.error('Erro ao salvar medição de carbono:', error);
    }
  },

  /**
   * Calcula carbono total da reserva
   * @returns {object} Totais consolidados
   */
  calcularCarbonoReservaTotal() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CARBON_SCHEMA.sheetName);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          success: false,
          error: 'Sem dados de carbono registrados'
        };
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Índices das colunas
      const idx = {
        area: headers.indexOf('Area_ha'),
        biomassa: headers.indexOf('Biomassa_Total_kg'),
        carbono: headers.indexOf('Carbono_Total_kg'),
        co2: headers.indexOf('CO2_Sequestrado_kg'),
        creditos: headers.indexOf('Creditos_Estimados'),
        valorBRL: headers.indexOf('Valor_BRL')
      };
      
      let totais = {
        areaTotal: 0,
        biomassaTotal: 0,
        carbonoTotal: 0,
        co2Total: 0,
        creditosTotal: 0,
        valorTotalBRL: 0,
        numMedicoes: 0
      };
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        totais.areaTotal += parseFloat(row[idx.area]) || 0;
        totais.biomassaTotal += parseFloat(row[idx.biomassa]) || 0;
        totais.carbonoTotal += parseFloat(row[idx.carbono]) || 0;
        totais.co2Total += parseFloat(row[idx.co2]) || 0;
        totais.creditosTotal += parseFloat(row[idx.creditos]) || 0;
        totais.valorTotalBRL += parseFloat(row[idx.valorBRL]) || 0;
        totais.numMedicoes++;
      }
      
      // Converte para toneladas
      const co2Toneladas = totais.co2Total / 1000;
      
      return {
        success: true,
        reserva: 'Reserva Araras',
        dataCalculo: new Date().toISOString(),
        totais: {
          areaMonitorada: {
            valor: Math.round(totais.areaTotal * 100) / 100,
            unidade: 'ha'
          },
          biomassaTotal: {
            valor: Math.round(totais.biomassaTotal),
            unidade: 'kg'
          },
          carbonoEstocado: {
            valor: Math.round(totais.carbonoTotal),
            unidade: 'kg'
          },
          co2Sequestrado: {
            kg: Math.round(totais.co2Total),
            toneladas: Math.round(co2Toneladas * 100) / 100,
            unidade: 'tCO2'
          },
          creditosCarbono: {
            quantidade: Math.round(totais.creditosTotal * 100) / 100,
            valorBRL: Math.round(totais.valorTotalBRL * 100) / 100
          }
        },
        numMedicoes: totais.numMedicoes,
        mediaPorHectare: totais.areaTotal > 0 ? {
          co2: Math.round((co2Toneladas / totais.areaTotal) * 100) / 100,
          unidade: 'tCO2/ha'
        } : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório executivo para o DashboardBot
   * @returns {object} Relatório formatado
   */
  gerarRelatorioExecutivo() {
    const totais = this.calcularCarbonoReservaTotal();
    
    if (!totais.success) {
      return totais;
    }
    
    // Busca dados de parcelas para contexto
    let parcelasInfo = [];
    try {
      const ss = getSpreadsheet();
      const parcelasSheet = ss.getSheetByName('PARCELAS_AGRO');
      if (parcelasSheet && parcelasSheet.getLastRow() > 1) {
        const parcelasData = parcelasSheet.getDataRange().getValues();
        parcelasInfo = parcelasData.slice(1).map(row => ({
          id: row[0],
          nome: row[1],
          area: row[2]
        })).slice(0, 5); // Top 5
      }
    } catch (e) { /* Ignora se não existir */ }
    
    return {
      success: true,
      tipo: 'RELATORIO_EXECUTIVO_CARBONO',
      titulo: '📊 Relatório de Carbono - Reserva Araras',
      dataGeracao: new Date().toISOString(),
      
      resumoExecutivo: {
        destaque: `A Reserva Araras possui ${totais.totais.co2Sequestrado.toneladas} tCO2 sequestradas`,
        valorPotencial: `R$ ${totais.totais.creditosCarbono.valorBRL.toLocaleString('pt-BR')}`,
        areaMonitorada: `${totais.totais.areaMonitorada.valor} hectares`
      },
      
      metricas: {
        sequestro: totais.totais.co2Sequestrado,
        estoque: totais.totais.carbonoEstocado,
        biomassa: totais.totais.biomassaTotal,
        creditos: totais.totais.creditosCarbono,
        eficiencia: totais.mediaPorHectare
      },
      
      comparativos: {
        equivalenteCarros: Math.round(totais.totais.co2Sequestrado.toneladas / 4.6), // 4.6 tCO2/carro/ano
        equivalenteArvores: Math.round(totais.totais.co2Sequestrado.toneladas / 0.022), // 22kg CO2/árvore/ano
        equivalenteVoos: Math.round(totais.totais.co2Sequestrado.toneladas / 0.9) // 0.9 tCO2/voo SP-NY
      },
      
      recomendacoes: [
        'Expandir monitoramento para áreas de regeneração natural',
        'Considerar certificação VCS/Verra para créditos de carbono',
        'Implementar medições semestrais para tracking de crescimento',
        'Integrar dados de biomassa com inventário florestal'
      ],
      
      parcelasMonitoradas: parcelasInfo,
      numMedicoes: totais.numMedicoes
    };
  },

  /**
   * Processa mensagem do chatbot
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto da conversa
   * @returns {object} Resposta formatada
   */
  processMessage(message, context = {}) {
    const msgLower = message.toLowerCase();
    
    // Detecta intenção
    if (msgLower.includes('relatório') || msgLower.includes('relatorio') || msgLower.includes('executivo')) {
      const relatorio = this.gerarRelatorioExecutivo();
      if (relatorio.success) {
        return {
          success: true,
          response: this._formatarRespostaRelatorio(relatorio),
          data: relatorio
        };
      }
      return {
        success: false,
        response: '📊 Ainda não há dados suficientes para gerar o relatório de carbono. Registre algumas medições primeiro.'
      };
    }
    
    if (msgLower.includes('total') || msgLower.includes('reserva')) {
      const totais = this.calcularCarbonoReservaTotal();
      if (totais.success) {
        return {
          success: true,
          response: this._formatarRespostaTotais(totais),
          data: totais
        };
      }
    }
    
    if (msgLower.includes('sequestro') || msgLower.includes('anual')) {
      // Extrai parâmetros da mensagem
      const areaMatch = msgLower.match(/(\d+)\s*(ha|hectare)/);
      const area = areaMatch ? parseFloat(areaMatch[1]) : 10;
      
      const estimativa = this.estimarSequestroAnual('cerrado_geral', area, 10);
      return {
        success: true,
        response: this._formatarRespostaSequestro(estimativa),
        data: estimativa
      };
    }
    
    if (msgLower.includes('emiss') && (msgLower.includes('evitad') || msgLower.includes('desmat'))) {
      const areaMatch = msgLower.match(/(\d+)\s*(ha|hectare)/);
      const area = areaMatch ? parseFloat(areaMatch[1]) : 10;
      
      const evitadas = this.calcularEmissoesEvitadas('desmatamento_evitado', area);
      return {
        success: true,
        response: this._formatarRespostaEvitadas(evitadas),
        data: evitadas
      };
    }
    
    // Resposta padrão
    return {
      success: true,
      response: `🌳 **Auditor de Carbono**

Posso ajudar você com:
• **Relatório executivo** - Visão geral do carbono da reserva
• **Total da reserva** - Carbono total sequestrado
• **Sequestro anual** - Estimativa por área (ex: "sequestro anual 50 ha")
• **Emissões evitadas** - Cálculo de desmatamento evitado

Como posso ajudar?`
    };
  },

  /**
   * Formata resposta do relatório executivo
   * @private
   */
  _formatarRespostaRelatorio(relatorio) {
    const r = relatorio;
    return `📊 **${r.titulo}**

**Resumo Executivo:**
• ${r.resumoExecutivo.destaque}
• Valor potencial em créditos: ${r.resumoExecutivo.valorPotencial}
• Área monitorada: ${r.resumoExecutivo.areaMonitorada}

**Equivalências Ambientais:**
🚗 ${r.comparativos.equivalenteCarros} carros/ano neutralizados
🌲 ${r.comparativos.equivalenteArvores} árvores equivalentes
✈️ ${r.comparativos.equivalenteVoos} voos SP-NY compensados

**Recomendações:**
${r.recomendacoes.map(rec => `• ${rec}`).join('\n')}

_Baseado em ${r.numMedicoes} medições registradas._`;
  },

  /**
   * Formata resposta de totais
   * @private
   */
  _formatarRespostaTotais(totais) {
    const t = totais.totais;
    return `🌳 **Carbono Total - Reserva Araras**

**Estoque de Carbono:**
• CO₂ sequestrado: ${t.co2Sequestrado.toneladas} tCO₂
• Carbono estocado: ${Math.round(t.carbonoEstocado.valor/1000)} toneladas
• Biomassa total: ${Math.round(t.biomassaTotal.valor/1000)} toneladas

**Valor em Créditos:**
• ${t.creditosCarbono.quantidade} créditos
• R$ ${t.creditosCarbono.valorBRL.toLocaleString('pt-BR')}

**Eficiência:**
• ${totais.mediaPorHectare?.co2 || 0} tCO₂/ha
• Área monitorada: ${t.areaMonitorada.valor} ha`;
  },

  /**
   * Formata resposta de sequestro anual
   * @private
   */
  _formatarRespostaSequestro(est) {
    return `🌱 **Estimativa de Sequestro Anual**

**Parâmetros:**
• Tipo: ${est.tipoVegetacao}
• Área: ${est.areaHa} ha
• Idade: ${est.idadeAnos} anos

**Sequestro Estimado:**
• ${est.sequestroAnual.valor} ${est.sequestroAnual.unidade}
• ${est.creditosAnuais} créditos/ano
• R$ ${est.valorAnual.brl.toLocaleString('pt-BR')}/ano

**Projeção 10 anos:**
• ${est.projecao10Anos.co2Total} tCO₂
• R$ ${est.projecao10Anos.valorTotalBRL.toLocaleString('pt-BR')}`;
  },

  /**
   * Formata resposta de emissões evitadas
   * @private
   */
  _formatarRespostaEvitadas(ev) {
    return `🛡️ **Emissões Evitadas**

**Ação:** ${ev.tipoAcao.replace(/_/g, ' ')}
**Área protegida:** ${ev.areaHa} ha

**Impacto:**
• ${ev.emissoesEvitadas.valor} ${ev.emissoesEvitadas.unidade} evitadas
• ${ev.creditosEvitados} créditos potenciais
• R$ ${ev.valor.brl.toLocaleString('pt-BR')} em valor

_Ao proteger esta área, você evita a emissão de ${ev.emissoesEvitadas.valor} toneladas de CO₂._`;
  }
}; // Fim do CarbonAuditorService

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Calcula carbono de uma parcela
 * @param {object} parcelaData - Dados da parcela
 * @returns {object} Resultado do cálculo
 */
function apiCarbonCalculate(parcelaData) {
  return CarbonAuditorService.calcularCarbonoParcela(parcelaData);
}

/**
 * API: Estima sequestro anual
 * @param {string} tipoVegetacao - Tipo de vegetação
 * @param {number} areaHa - Área em hectares
 * @param {number} idadeAnos - Idade do plantio
 * @returns {object} Estimativa
 */
function apiCarbonEstimate(tipoVegetacao, areaHa, idadeAnos) {
  return CarbonAuditorService.estimarSequestroAnual(tipoVegetacao, areaHa, idadeAnos);
}

/**
 * API: Calcula emissões evitadas
 * @param {string} tipoAcao - Tipo de ação
 * @param {number} areaHa - Área em hectares
 * @returns {object} Emissões evitadas
 */
function apiCarbonAvoided(tipoAcao, areaHa) {
  return CarbonAuditorService.calcularEmissoesEvitadas(tipoAcao, areaHa);
}

/**
 * API: Obtém totais da reserva
 * @returns {object} Totais consolidados
 */
function apiCarbonTotals() {
  return CarbonAuditorService.calcularCarbonoReservaTotal();
}

/**
 * API: Gera relatório executivo
 * @returns {object} Relatório formatado
 */
function apiCarbonReport() {
  return CarbonAuditorService.gerarRelatorioExecutivo();
}

/**
 * API: Processa mensagem do chatbot
 * @param {string} message - Mensagem do usuário
 * @param {object} context - Contexto
 * @returns {object} Resposta
 */
function apiCarbonChat(message, context) {
  return CarbonAuditorService.processMessage(message, context);
}

/**
 * API: Calcula biomassa de árvore individual
 * @param {number} dap - DAP em cm
 * @param {number} altura - Altura em m
 * @param {string} tipo - Tipo de vegetação
 * @returns {object} Biomassa calculada
 */
function apiCarbonTree(dap, altura, tipo) {
  return CarbonAuditorService.calcularBiomassaArvore(dap, altura, tipo);
}

/**
 * API: Inicializa planilha de carbono - CarbonAuditor version
 * NOTA: apiCarbonInit() principal está em CarbonTrackingService.gs
 * @returns {object} Status
 */
function apiCarbonAuditorInit() {
  return CarbonAuditorService.initializeSheet();
}
