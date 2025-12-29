/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - ANÁLISE DE SERVIÇOS ECOSSISTÊMICOS E VALORAÇÃO
 * ═══════════════════════════════════════════════════════════════════════════
 * P25 - Quantificação e Valoração Econômica de Serviços Ecossistêmicos
 * 
 * Funcionalidades:
 * - Cálculo de sequestro de carbono (ton CO₂/ano)
 * - Valoração de água produzida
 * - Valor econômico de polinização
 * - Valor de turismo ecológico
 * - Relatório de impacto econômico
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const SERVICOS_HEADERS = [
  'ID_Avaliacao', 'Data_Avaliacao', 'Area_ha', 'Tipo_Cobertura',
  'Carbono_ton', 'Valor_Carbono_BRL', 'Agua_m3', 'Valor_Agua_BRL',
  'Polinizacao_BRL', 'Turismo_BRL', 'Biodiversidade_BRL', 'Solo_BRL',
  'Valor_Total_BRL', 'Metodologia', 'Observacoes'
];

/**
 * Sistema de Valoração de Serviços Ecossistêmicos
 * @namespace EcosystemServices
 */
const EcosystemServices = {
  
  SHEET_SERVICOS: 'SERVICOS_ECOSSISTEMICOS_RA',
  
  /**
   * Valores de referência para valoração (R$/unidade)
   * Baseados em literatura científica e mercado
   */
  VALORES_REFERENCIA: {
    // Carbono (R$/ton CO2e) - Mercado voluntário 2024
    carbono: {
      mercado_voluntario: 150,
      social_cost: 280,
      vcs_gold_standard: 200
    },
    
    // Água (R$/m³) - Cobrança pelo uso da água
    agua: {
      captacao: 0.02,
      consumo: 0.03,
      producao_nascente: 2.50,
      regulacao_hidrica: 1.80
    },
    
    // Polinização (R$/ha/ano) - Por tipo de cultura
    polinizacao: {
      frutiferas: 2500,
      hortalicas: 1800,
      graos: 800,
      nativas: 500
    },
    
    // Turismo (R$/visitante)
    turismo: {
      entrada: 50,
      trilha_guiada: 120,
      observacao_aves: 200,
      fotografia: 150
    },
    
    // Biodiversidade (R$/ha/ano) - Valor de existência
    biodiversidade: {
      alta_diversidade: 1200,
      media_diversidade: 600,
      baixa_diversidade: 200
    },
    
    // Solo (R$/ha/ano) - Controle de erosão
    solo: {
      protecao_erosao: 450,
      ciclagem_nutrientes: 380,
      formacao_solo: 120
    }
  },

  /**
   * Taxas de sequestro de carbono por tipo de cobertura (ton CO2/ha/ano)
   */
  TAXAS_CARBONO: {
    'Cerrado Nativo': 2.5,
    'Cerradão': 4.2,
    'Mata de Galeria': 6.8,
    'Vereda': 3.5,
    'SAF Diversificado': 8.5,
    'Reflorestamento': 12.0,
    'Pastagem Degradada': 0.5,
    'Área em Recuperação': 5.5
  },
  
  /**
   * Produção de água por tipo de cobertura (m³/ha/ano)
   */
  PRODUCAO_AGUA: {
    'Cerrado Nativo': 800,
    'Cerradão': 1200,
    'Mata de Galeria': 2500,
    'Vereda': 3500,
    'SAF Diversificado': 600,
    'Reflorestamento': 400,
    'Pastagem Degradada': 200,
    'Área em Recuperação': 500
  },

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet = ss.getSheetByName(this.SHEET_SERVICOS);
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_SERVICOS);
        sheet.appendRow(SERVICOS_HEADERS);
        const headerRange = sheet.getRange(1, 1, 1, SERVICOS_HEADERS.length);
        headerRange.setBackground('#00796B');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheet: this.SHEET_SERVICOS };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de sequestro de carbono
   */
  calculateCarbonValue: function(areaHa, tipoCobertura, metodologia = 'mercado_voluntario') {
    try {
      const taxaSequestro = this.TAXAS_CARBONO[tipoCobertura] || 2.5;
      const carbonoAnual = areaHa * taxaSequestro;
      const valorTon = this.VALORES_REFERENCIA.carbono[metodologia] || 150;
      const valorTotal = carbonoAnual * valorTon;
      
      return {
        success: true,
        area_ha: areaHa,
        tipo_cobertura: tipoCobertura,
        taxa_sequestro_ton_ha_ano: taxaSequestro,
        carbono_sequestrado_ton_ano: Math.round(carbonoAnual * 100) / 100,
        valor_ton_BRL: valorTon,
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        metodologia: metodologia,
        equivalente_carros: Math.round(carbonoAnual / 4.6), // 4.6 ton CO2/carro/ano
        equivalente_arvores: Math.round(carbonoAnual / 0.022) // 22kg CO2/árvore/ano
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de produção de água
   */
  calculateWaterValue: function(areaHa, tipoCobertura, tipoValoracao = 'producao_nascente') {
    try {
      const producaoAgua = this.PRODUCAO_AGUA[tipoCobertura] || 800;
      const aguaAnual = areaHa * producaoAgua;
      const valorM3 = this.VALORES_REFERENCIA.agua[tipoValoracao] || 2.50;
      const valorTotal = aguaAnual * valorM3;
      
      return {
        success: true,
        area_ha: areaHa,
        tipo_cobertura: tipoCobertura,
        producao_m3_ha_ano: producaoAgua,
        agua_produzida_m3_ano: Math.round(aguaAnual),
        valor_m3_BRL: valorM3,
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        tipo_valoracao: tipoValoracao,
        equivalente_pessoas: Math.round(aguaAnual / 110 / 365), // 110L/pessoa/dia
        equivalente_piscinas: Math.round(aguaAnual / 50000) // 50m³/piscina
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de polinização
   */
  calculatePollinationValue: function(areaHa, tipoCultura = 'nativas') {
    try {
      const valorHa = this.VALORES_REFERENCIA.polinizacao[tipoCultura] || 500;
      const valorTotal = areaHa * valorHa;
      
      // Estima número de colmeias equivalentes
      const colmeiasEquiv = Math.round(areaHa * 2); // ~2 colmeias/ha
      
      return {
        success: true,
        area_ha: areaHa,
        tipo_cultura: tipoCultura,
        valor_ha_ano_BRL: valorHa,
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        colmeias_equivalentes: colmeiasEquiv,
        producao_mel_estimada_kg: colmeiasEquiv * 25, // 25kg/colmeia/ano
        especies_polinizadoras_estimadas: Math.round(areaHa * 0.5) + 10
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de turismo ecológico
   */
  calculateTourismValue: function(visitantesAno, tiposAtividades = ['entrada']) {
    try {
      let valorTotal = 0;
      const detalhes = [];
      
      tiposAtividades.forEach(atividade => {
        const valorUnit = this.VALORES_REFERENCIA.turismo[atividade] || 50;
        const valor = visitantesAno * valorUnit;
        valorTotal += valor;
        detalhes.push({
          atividade: atividade,
          valor_unitario: valorUnit,
          valor_total: valor
        });
      });
      
      return {
        success: true,
        visitantes_ano: visitantesAno,
        atividades: detalhes,
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        valor_medio_visitante: Math.round(valorTotal / visitantesAno * 100) / 100,
        empregos_diretos_estimados: Math.round(visitantesAno / 500),
        empregos_indiretos_estimados: Math.round(visitantesAno / 200)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de biodiversidade
   */
  calculateBiodiversityValue: function(areaHa, nivelDiversidade = 'media_diversidade') {
    try {
      const valorHa = this.VALORES_REFERENCIA.biodiversidade[nivelDiversidade] || 600;
      const valorTotal = areaHa * valorHa;
      
      // Estima riqueza de espécies baseado no nível
      const multiplicador = nivelDiversidade === 'alta_diversidade' ? 1.5 : 
                           nivelDiversidade === 'media_diversidade' ? 1.0 : 0.5;
      
      return {
        success: true,
        area_ha: areaHa,
        nivel_diversidade: nivelDiversidade,
        valor_ha_ano_BRL: valorHa,
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        especies_estimadas: {
          plantas: Math.round(areaHa * 15 * multiplicador),
          aves: Math.round(areaHa * 2 * multiplicador),
          mamiferos: Math.round(areaHa * 0.5 * multiplicador),
          insetos: Math.round(areaHa * 50 * multiplicador)
        },
        valor_existencia: 'Valor intrínseco da biodiversidade',
        valor_opcao: 'Potencial para bioprospecção e novos usos'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula valor de proteção do solo
   */
  calculateSoilValue: function(areaHa, tipoCobertura) {
    try {
      const valores = this.VALORES_REFERENCIA.solo;
      
      // Fator de proteção por tipo de cobertura
      const fatores = {
        'Cerrado Nativo': 0.9,
        'Cerradão': 1.0,
        'Mata de Galeria': 1.0,
        'Vereda': 0.8,
        'SAF Diversificado': 0.85,
        'Reflorestamento': 0.7,
        'Pastagem Degradada': 0.2,
        'Área em Recuperação': 0.5
      };
      
      const fator = fatores[tipoCobertura] || 0.5;
      
      const valorErosao = areaHa * valores.protecao_erosao * fator;
      const valorCiclagem = areaHa * valores.ciclagem_nutrientes * fator;
      const valorFormacao = areaHa * valores.formacao_solo * fator;
      const valorTotal = valorErosao + valorCiclagem + valorFormacao;
      
      return {
        success: true,
        area_ha: areaHa,
        tipo_cobertura: tipoCobertura,
        fator_protecao: fator,
        valores: {
          protecao_erosao_BRL: Math.round(valorErosao * 100) / 100,
          ciclagem_nutrientes_BRL: Math.round(valorCiclagem * 100) / 100,
          formacao_solo_BRL: Math.round(valorFormacao * 100) / 100
        },
        valor_total_BRL: Math.round(valorTotal * 100) / 100,
        erosao_evitada_ton_ano: Math.round(areaHa * 15 * fator), // ~15 ton/ha em área desprotegida
        sedimentos_retidos_ton: Math.round(areaHa * 8 * fator)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Avaliação completa de serviços ecossistêmicos
   */
  fullAssessment: function(params) {
    try {
      this.initializeSheet();
      
      const {
        area_ha = 100,
        tipo_cobertura = 'Cerrado Nativo',
        visitantes_ano = 1000,
        nivel_diversidade = 'media_diversidade',
        metodologia_carbono = 'mercado_voluntario'
      } = params;
      
      // Calcula cada serviço
      const carbono = this.calculateCarbonValue(area_ha, tipo_cobertura, metodologia_carbono);
      const agua = this.calculateWaterValue(area_ha, tipo_cobertura);
      const polinizacao = this.calculatePollinationValue(area_ha);
      const turismo = this.calculateTourismValue(visitantes_ano, ['entrada', 'trilha_guiada']);
      const biodiversidade = this.calculateBiodiversityValue(area_ha, nivel_diversidade);
      const solo = this.calculateSoilValue(area_ha, tipo_cobertura);
      
      // Valor total
      const valorTotal = 
        (carbono.valor_total_BRL || 0) +
        (agua.valor_total_BRL || 0) +
        (polinizacao.valor_total_BRL || 0) +
        (turismo.valor_total_BRL || 0) +
        (biodiversidade.valor_total_BRL || 0) +
        (solo.valor_total_BRL || 0);
      
      // Salva avaliação
      const avaliacaoId = this._saveAssessment({
        area_ha,
        tipo_cobertura,
        carbono: carbono.carbono_sequestrado_ton_ano,
        valor_carbono: carbono.valor_total_BRL,
        agua: agua.agua_produzida_m3_ano,
        valor_agua: agua.valor_total_BRL,
        valor_polinizacao: polinizacao.valor_total_BRL,
        valor_turismo: turismo.valor_total_BRL,
        valor_biodiversidade: biodiversidade.valor_total_BRL,
        valor_solo: solo.valor_total_BRL,
        valor_total: valorTotal,
        metodologia: metodologia_carbono
      });
      
      return {
        success: true,
        avaliacao_id: avaliacaoId,
        parametros: {
          area_ha,
          tipo_cobertura,
          visitantes_ano,
          nivel_diversidade
        },
        servicos: {
          carbono: carbono,
          agua: agua,
          polinizacao: polinizacao,
          turismo: turismo,
          biodiversidade: biodiversidade,
          solo: solo
        },
        resumo: {
          valor_total_anual_BRL: Math.round(valorTotal * 100) / 100,
          valor_por_hectare_BRL: Math.round(valorTotal / area_ha * 100) / 100,
          distribuicao_percentual: {
            carbono: Math.round(carbono.valor_total_BRL / valorTotal * 100),
            agua: Math.round(agua.valor_total_BRL / valorTotal * 100),
            polinizacao: Math.round(polinizacao.valor_total_BRL / valorTotal * 100),
            turismo: Math.round(turismo.valor_total_BRL / valorTotal * 100),
            biodiversidade: Math.round(biodiversidade.valor_total_BRL / valorTotal * 100),
            solo: Math.round(solo.valor_total_BRL / valorTotal * 100)
          }
        },
        comparativos: this._generateComparisons(valorTotal, area_ha)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Salva avaliação na planilha
   * @private
   */
  _saveAssessment: function(data) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SERVICOS);
      
      const avaliacaoId = `SE-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        avaliacaoId,
        new Date().toISOString().split('T')[0],
        data.area_ha,
        data.tipo_cobertura,
        data.carbono,
        data.valor_carbono,
        data.agua,
        data.valor_agua,
        data.valor_polinizacao,
        data.valor_turismo,
        data.valor_biodiversidade,
        data.valor_solo,
        data.valor_total,
        data.metodologia,
        ''
      ];
      
      sheet.appendRow(row);
      return avaliacaoId;
    } catch (error) {
      Logger.log(`[_saveAssessment] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Gera comparativos para contextualização
   * @private
   */
  _generateComparisons: function(valorTotal, areaHa) {
    return {
      salarios_minimos: Math.round(valorTotal / 1412), // SM 2024
      cestas_basicas: Math.round(valorTotal / 750),
      valor_terra_nua_equiv_ha: Math.round(valorTotal / areaHa / 15000 * 100) / 100, // ~R$15k/ha terra nua
      anos_retorno_investimento: Math.round(15000 * areaHa / valorTotal * 10) / 10,
      equivalente_PIB_municipal_pequeno: (valorTotal / 50000000 * 100).toFixed(2) + '%'
    };
  },

  /**
   * Simula cenários de uso da terra
   */
  simulateScenarios: function(areaHa) {
    try {
      const cenarios = [
        { nome: 'Conservação (Cerrado Nativo)', tipo: 'Cerrado Nativo', diversidade: 'alta_diversidade' },
        { nome: 'SAF Diversificado', tipo: 'SAF Diversificado', diversidade: 'media_diversidade' },
        { nome: 'Reflorestamento', tipo: 'Reflorestamento', diversidade: 'media_diversidade' },
        { nome: 'Pastagem Degradada', tipo: 'Pastagem Degradada', diversidade: 'baixa_diversidade' },
        { nome: 'Área em Recuperação', tipo: 'Área em Recuperação', diversidade: 'media_diversidade' }
      ];
      
      const resultados = cenarios.map(cenario => {
        const avaliacao = this.fullAssessment({
          area_ha: areaHa,
          tipo_cobertura: cenario.tipo,
          visitantes_ano: cenario.tipo === 'Cerrado Nativo' ? 1500 : 500,
          nivel_diversidade: cenario.diversidade,
          metodologia_carbono: 'mercado_voluntario'
        });
        
        return {
          cenario: cenario.nome,
          valor_total_BRL: avaliacao.resumo?.valor_total_anual_BRL || 0,
          valor_por_ha_BRL: avaliacao.resumo?.valor_por_hectare_BRL || 0,
          carbono_ton: avaliacao.servicos?.carbono?.carbono_sequestrado_ton_ano || 0,
          agua_m3: avaliacao.servicos?.agua?.agua_produzida_m3_ano || 0
        };
      });
      
      // Ordena por valor total
      resultados.sort((a, b) => b.valor_total_BRL - a.valor_total_BRL);
      
      const melhorCenario = resultados[0];
      const piorCenario = resultados[resultados.length - 1];
      
      return {
        success: true,
        area_ha: areaHa,
        cenarios: resultados,
        analise: {
          melhor_cenario: melhorCenario.cenario,
          pior_cenario: piorCenario.cenario,
          diferenca_valor_BRL: melhorCenario.valor_total_BRL - piorCenario.valor_total_BRL,
          ganho_percentual: Math.round((melhorCenario.valor_total_BRL / piorCenario.valor_total_BRL - 1) * 100)
        },
        recomendacao: `Manter ou converter para ${melhorCenario.cenario} pode gerar até R$ ${melhorCenario.valor_total_BRL.toLocaleString('pt-BR')} em serviços ecossistêmicos por ano.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório de impacto econômico
   */
  generateImpactReport: function(params) {
    try {
      const avaliacao = this.fullAssessment(params);
      if (!avaliacao.success) return avaliacao;
      
      const cenarios = this.simulateScenarios(params.area_ha || 100);
      
      return {
        success: true,
        titulo: 'Relatório de Valoração de Serviços Ecossistêmicos',
        data_geracao: new Date().toISOString(),
        local: 'Reserva Recanto das Araras de Terra Ronca - GO',
        
        sumario_executivo: {
          area_avaliada_ha: params.area_ha,
          valor_total_anual: avaliacao.resumo.valor_total_anual_BRL,
          principal_servico: this._getPrincipalService(avaliacao.resumo.distribuicao_percentual),
          potencial_creditos_carbono: avaliacao.servicos.carbono.carbono_sequestrado_ton_ano
        },
        
        detalhamento: avaliacao.servicos,
        distribuicao: avaliacao.resumo.distribuicao_percentual,
        comparativos: avaliacao.comparativos,
        cenarios_alternativos: cenarios.cenarios,
        
        recomendacoes: [
          {
            prioridade: 'Alta',
            acao: 'Certificação de créditos de carbono (VCS/Gold Standard)',
            potencial_BRL: avaliacao.servicos.carbono.valor_total_BRL * 1.3
          },
          {
            prioridade: 'Alta',
            acao: 'Programa de Pagamento por Serviços Ambientais (PSA)',
            potencial_BRL: avaliacao.servicos.agua.valor_total_BRL
          },
          {
            prioridade: 'Media',
            acao: 'Expansão do ecoturismo com observação de aves',
            potencial_BRL: avaliacao.servicos.turismo.valor_total_BRL * 2
          },
          {
            prioridade: 'Media',
            acao: 'Parceria com apicultores para polinização',
            potencial_BRL: avaliacao.servicos.polinizacao.valor_total_BRL * 1.5
          }
        ],
        
        metodologia: {
          carbono: 'IPCC Guidelines + Mercado Voluntário',
          agua: 'Método de Custo de Reposição',
          polinizacao: 'Valor de Produção Dependente',
          turismo: 'Método de Custo de Viagem',
          biodiversidade: 'Valor de Existência (Contingente)',
          solo: 'Custo de Reposição de Nutrientes'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Identifica principal serviço
   * @private
   */
  _getPrincipalService: function(distribuicao) {
    const servicos = Object.entries(distribuicao);
    servicos.sort((a, b) => b[1] - a[1]);
    return servicos[0][0];
  },

  /**
   * Lista avaliações anteriores
   */
  listAssessments: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_SERVICOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, assessments: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const assessments = [];
      
      for (let i = 1; i < data.length; i++) {
        assessments.push({
          id: data[i][0],
          data: data[i][1],
          area_ha: data[i][2],
          tipo_cobertura: data[i][3],
          valor_total_BRL: data[i][12]
        });
      }
      
      return { success: true, assessments: assessments, count: assessments.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Serviços Ecossistêmicos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de serviços ecossistêmicos
 */
function apiServicosInit() {
  return EcosystemServices.initializeSheet();
}

/**
 * Calcula valor de carbono
 */
function apiServicosCarbono(areaHa, tipoCobertura, metodologia) {
  return EcosystemServices.calculateCarbonValue(
    areaHa || 100, 
    tipoCobertura || 'Cerrado Nativo',
    metodologia || 'mercado_voluntario'
  );
}

/**
 * Calcula valor de água
 */
function apiServicosAgua(areaHa, tipoCobertura) {
  return EcosystemServices.calculateWaterValue(
    areaHa || 100,
    tipoCobertura || 'Cerrado Nativo'
  );
}

/**
 * Calcula valor de polinização
 */
function apiServicosPolinizacao(areaHa, tipoCultura) {
  return EcosystemServices.calculatePollinationValue(
    areaHa || 100,
    tipoCultura || 'nativas'
  );
}

/**
 * Calcula valor de turismo
 */
function apiServicosTurismo(visitantesAno, atividades) {
  return EcosystemServices.calculateTourismValue(
    visitantesAno || 1000,
    atividades || ['entrada']
  );
}

/**
 * Avaliação completa de serviços ecossistêmicos
 */
function apiServicosAvaliacao(params) {
  return EcosystemServices.fullAssessment(params || {});
}

/**
 * Simula cenários de uso da terra
 */
function apiServicosCenarios(areaHa) {
  return EcosystemServices.simulateScenarios(areaHa || 100);
}

/**
 * Gera relatório de impacto econômico
 */
function apiServicosRelatorio(params) {
  return EcosystemServices.generateImpactReport(params || {});
}

/**
 * Lista avaliações anteriores
 */
function apiServicosListar() {
  return EcosystemServices.listAssessments();
}

/**
 * Obtém tipos de cobertura disponíveis
 */
function apiServicosTiposCobertura() {
  return {
    success: true,
    tipos: Object.keys(EcosystemServices.TAXAS_CARBONO),
    valores_referencia: EcosystemServices.VALORES_REFERENCIA
  };
}
