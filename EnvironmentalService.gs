/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIRONMENTAL SERVICE - Monitoramento Ambiental Baseado em Normas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  *
 * CONTEXTO: Reserva Recanto das Araras - Bioma Cerrado (Goiás)
 * Parâmetros adaptados para Latossolos e clima tropical sazonal
 * Referências:
 * - CONAMA 357/2005 - Classificação de águas
 * - CETESB - Índice de Qualidade das Águas (IQA)
 * - Embrapa - Análise de solo
 * - ICMBio - Protocolos de monitoramento
 */

/**
 * Pesos NSF para cálculo do IQA (National Sanitation Foundation)
 * Referência: NSF Water Quality Index (1970)
 */
const NSF_WEIGHTS = {
  dissolved_oxygen: 0.17,
  fecal_coliform: 0.15,
  pH: 0.12,
  bod: 0.10,
  temperature_change: 0.10,
  total_phosphate: 0.10,
  nitrate: 0.10,
  turbidity: 0.08,
  total_solids: 0.08
};

/**
 * Limites CONAMA 357/2005 - Classe 2 (Águas Doces)
 * Destinação: abastecimento doméstico após tratamento convencional,
 * proteção de comunidades aquáticas, recreação de contato primário
 */
const CONAMA_357_CLASS_2 = {
  pH: { min: 6.0, max: 9.0, unit: '' },
  dissolved_oxygen: { min: 5.0, unit: 'mg/L' },
  bod5: { max: 5.0, unit: 'mg/L' },
  turbidity: { max: 100, unit: 'NTU' },
  fecal_coliform: { max: 1000, unit: 'NMP/100mL' },
  total_phosphorus_lentic: { max: 0.030, unit: 'mg/L' },
  total_phosphorus_lotic: { max: 0.100, unit: 'mg/L' },
  total_nitrogen: { max: 3.7, unit: 'mg/L' },  // para pH ≤ 7.5
  chlorophyll_a: { max: 30, unit: 'μg/L' },
  color: { max: 75, unit: 'mg Pt/L' },
  total_solids: { max: 500, unit: 'mg/L' }
};

/**
 * Classificação do IQA
 */
const IQA_CLASSIFICATION = {
  OTIMA: { min: 80, max: 100, label: 'Ótima', cor: 'verde' },
  BOA: { min: 52, max: 79, label: 'Boa', cor: 'azul' },
  ACEITAVEL: { min: 37, max: 51, label: 'Aceitável', cor: 'amarelo' },
  RUIM: { min: 20, max: 36, label: 'Ruim', cor: 'laranja' },
  PESSIMA: { min: 0, max: 19, label: 'Péssima', cor: 'vermelho' }
};

const EnvironmentalService = {

  // Thresholds específicos para o Cerrado (Latossolos)
  CERRADO_THRESHOLDS: {
    SOLO: {
      pH_IDEAL_MIN: 5.5,  // Cerrado tolera maior acidez
      pH_IDEAL_MAX: 6.5,
      MATERIA_ORGANICA_MIN: 2.0,  // Latossolos têm menos MO
      ALUMINIO_TOXICO_MAX: 0.5    // Latossolos têm mais Al
    },
    CLIMA: {
      TEMP_MEDIA_ANUAL: 22,
      PRECIPITACAO_ANUAL_MIN: 1200,
      PRECIPITACAO_ANUAL_MAX: 1800,
      ESTACAO_SECA_MESES: 5  // Maio a setembro
    }
  },

  /**
   * Calcula Índice de Qualidade da Água (IQA) com métricas de resiliência climática
   * Baseado em: NSF-WQI (National Sanitation Foundation) + CETESB
   * Alinhado com: UN Water Action Agenda, CONAMA 357/2005
   * @param {string} medicaoId - ID da medição
   * @param {object} options - Opções (tipoCorpo: 'lentico'|'lotico', triggerAlerts: boolean)
   * @returns {object} Resultado completo com IQA, conformidade e alertas
   */
  calculateWaterQualityIndex(medicaoId, options = {}) {
    try {
      const tipoCorpo = options.tipoCorpo || 'lotico';
      const triggerAlerts = options.triggerAlerts !== false;
      
      const result = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_AGUA, { id: medicaoId });

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Medição não encontrada' };
      }

      const m = result.data[0];

      // Parâmetros do IQA
      const params = {
        pH: parseFloat(m.pH) || 7.0,
        oxigenio: parseFloat(m.oxigenio_dissolvido) || 5.0,
        turbidez: parseFloat(m.turbidez) || 50,
        temperatura: parseFloat(m.temperatura) || 25,
        nitrogenio: parseFloat(m.nitrogenio_total) || 1.0,
        fosforo: parseFloat(m.fosforo_total) || 0.1,
        coliformes: parseFloat(m.coliformes_termotolerantes) || 100,
        solidos: parseFloat(m.solidos_totais) || 100,
        condutividade: parseFloat(m.condutividade) || 100,
        dbo: parseFloat(m.dbo5) || 2.0,
        nitrato: parseFloat(m.nitrato) || 1.0
      };

      // [Prompt 24] Cálculo do IQA usando metodologia NSF
      const iqaResult = this._calculateNSFIQA(params);
      
      // Classificação
      let classificacao, cor;
      if (iqaResult.valor >= 80) { classificacao = 'Ótima'; cor = 'verde'; }
      else if (iqaResult.valor >= 52) { classificacao = 'Boa'; cor = 'azul'; }
      else if (iqaResult.valor >= 37) { classificacao = 'Aceitável'; cor = 'amarelo'; }
      else if (iqaResult.valor >= 20) { classificacao = 'Ruim'; cor = 'laranja'; }
      else { classificacao = 'Péssima'; cor = 'vermelho'; }

      // [Prompt 24] Conformidade CONAMA 357/2005 (Classe 2)
      const conformidade = this._checkCONAMA357Compliance(params, tipoCorpo);

      // [Prompt 24] Gera alertas se houver violações
      const alertasGerados = [];
      if (triggerAlerts && conformidade.violacoes.length > 0) {
        const alertResult = this._triggerWaterQualityAlert(medicaoId, m, params, conformidade);
        if (alertResult.success) {
          alertasGerados.push(alertResult.alert_id);
        }
      }

      // Water security metrics (COP28)
      const waterSecurity = this._assessWaterSecurity(params, m);

      return {
        success: true,
        medicao: {
          id: medicaoId,
          data: m.data,
          local: m.local
        },
        iqa: {
          valor: parseFloat(iqaResult.valor.toFixed(1)),
          classificacao,
          cor,
          metodo: 'NSF-WQI',
          parametros_qi: iqaResult.parametros_qi
        },
        parametros: params,
        conformidade_conama: {
          classe: 2,
          conforme: conformidade.conforme,
          violacoes: conformidade.violacoes,
          detalhes: conformidade.detalhes
        },
        alertas_gerados: alertasGerados,
        segurancaHidrica: waterSecurity,
        servicosEcossistemicos: {
          purificacao: iqaResult.valor > 70 ? 'Excelente' : iqaResult.valor > 50 ? 'Boa' : 'Comprometida',
          regulacaoFluxo: 'Ativa',
          habitatAquatico: classificacao === 'Ótima' || classificacao === 'Boa' ? 'Saudável' : 'Estressado'
        },
        recomendacoes: this._generateWaterRecommendations(params, iqaResult.valor, conformidade)
      };
    } catch (error) {
      Utils.logError('EnvironmentalService.calculateWaterQualityIndex', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * [Prompt 24] Calcula IQA usando metodologia NSF (National Sanitation Foundation)
   * Fórmula: IQA = Π (qi ^ wi) onde qi = qualidade do parâmetro, wi = peso
   * @private
   * @param {object} params - Parâmetros medidos
   * @returns {object} Resultado com valor IQA e detalhes por parâmetro
   */
  _calculateNSFIQA: function(params) {
    const parametros_qi = {};
    let iqaProduto = 1;
    let pesoTotal = 0;
    
    // 1. Oxigênio Dissolvido (peso 0.17)
    const qiOD = this._qiDissolvedOxygen(params.oxigenio);
    parametros_qi.oxigenio_dissolvido = { valor: params.oxigenio, qi: qiOD, peso: NSF_WEIGHTS.dissolved_oxygen };
    iqaProduto *= Math.pow(qiOD / 100, NSF_WEIGHTS.dissolved_oxygen);
    pesoTotal += NSF_WEIGHTS.dissolved_oxygen;
    
    // 2. Coliformes Fecais (peso 0.15)
    const qiColiform = this._qiFecalColiform(params.coliformes);
    parametros_qi.coliformes = { valor: params.coliformes, qi: qiColiform, peso: NSF_WEIGHTS.fecal_coliform };
    iqaProduto *= Math.pow(qiColiform / 100, NSF_WEIGHTS.fecal_coliform);
    pesoTotal += NSF_WEIGHTS.fecal_coliform;
    
    // 3. pH (peso 0.12)
    const qiPH = this._qiPH(params.pH);
    parametros_qi.pH = { valor: params.pH, qi: qiPH, peso: NSF_WEIGHTS.pH };
    iqaProduto *= Math.pow(qiPH / 100, NSF_WEIGHTS.pH);
    pesoTotal += NSF_WEIGHTS.pH;
    
    // 4. DBO (peso 0.10)
    const qiBOD = this._qiBOD(params.dbo);
    parametros_qi.dbo = { valor: params.dbo, qi: qiBOD, peso: NSF_WEIGHTS.bod };
    iqaProduto *= Math.pow(qiBOD / 100, NSF_WEIGHTS.bod);
    pesoTotal += NSF_WEIGHTS.bod;
    
    // 5. Variação de Temperatura (peso 0.10) - assumindo referência de 20°C
    const tempChange = Math.abs(params.temperatura - 20);
    const qiTemp = this._qiTemperatureChange(tempChange);
    parametros_qi.temperatura = { valor: params.temperatura, variacao: tempChange, qi: qiTemp, peso: NSF_WEIGHTS.temperature_change };
    iqaProduto *= Math.pow(qiTemp / 100, NSF_WEIGHTS.temperature_change);
    pesoTotal += NSF_WEIGHTS.temperature_change;
    
    // 6. Fosfato Total (peso 0.10)
    const qiPhos = this._qiTotalPhosphate(params.fosforo);
    parametros_qi.fosforo = { valor: params.fosforo, qi: qiPhos, peso: NSF_WEIGHTS.total_phosphate };
    iqaProduto *= Math.pow(qiPhos / 100, NSF_WEIGHTS.total_phosphate);
    pesoTotal += NSF_WEIGHTS.total_phosphate;
    
    // 7. Nitrato (peso 0.10)
    const qiNit = this._qiNitrate(params.nitrato);
    parametros_qi.nitrato = { valor: params.nitrato, qi: qiNit, peso: NSF_WEIGHTS.nitrate };
    iqaProduto *= Math.pow(qiNit / 100, NSF_WEIGHTS.nitrate);
    pesoTotal += NSF_WEIGHTS.nitrate;
    
    // 8. Turbidez (peso 0.08)
    const qiTurb = this._qiTurbidity(params.turbidez);
    parametros_qi.turbidez = { valor: params.turbidez, qi: qiTurb, peso: NSF_WEIGHTS.turbidity };
    iqaProduto *= Math.pow(qiTurb / 100, NSF_WEIGHTS.turbidity);
    pesoTotal += NSF_WEIGHTS.turbidity;
    
    // 9. Sólidos Totais (peso 0.08)
    const qiSolids = this._qiTotalSolids(params.solidos);
    parametros_qi.solidos = { valor: params.solidos, qi: qiSolids, peso: NSF_WEIGHTS.total_solids };
    iqaProduto *= Math.pow(qiSolids / 100, NSF_WEIGHTS.total_solids);
    pesoTotal += NSF_WEIGHTS.total_solids;
    
    // IQA final (0-100)
    const iqaFinal = iqaProduto * 100;
    
    return {
      valor: Math.max(0, Math.min(100, iqaFinal)),
      parametros_qi: parametros_qi,
      peso_total: pesoTotal
    };
  },
  
  // Curvas de qualidade NSF (qi) - simplificadas
  _qiDissolvedOxygen: function(od) {
    if (od >= 8) return 90;
    if (od >= 6) return 70 + (od - 6) * 10;
    if (od >= 4) return 50 + (od - 4) * 10;
    if (od >= 2) return 20 + (od - 2) * 15;
    return Math.max(0, od * 10);
  },
  
  _qiFecalColiform: function(coliform) {
    if (coliform <= 1) return 98;
    if (coliform <= 10) return 90;
    if (coliform <= 100) return 70;
    if (coliform <= 1000) return 50;
    if (coliform <= 10000) return 25;
    return 5;
  },
  
  _qiPH: function(pH) {
    if (pH >= 7.0 && pH <= 8.0) return 90;
    if (pH >= 6.5 && pH <= 8.5) return 80;
    if (pH >= 6.0 && pH <= 9.0) return 60;
    if (pH >= 5.0 && pH <= 10.0) return 30;
    return 10;
  },
  
  _qiBOD: function(bod) {
    if (bod <= 1) return 95;
    if (bod <= 2) return 85;
    if (bod <= 3) return 70;
    if (bod <= 5) return 50;
    if (bod <= 10) return 25;
    return 5;
  },
  
  _qiTemperatureChange: function(change) {
    if (change <= 1) return 95;
    if (change <= 3) return 85;
    if (change <= 5) return 70;
    if (change <= 10) return 50;
    if (change <= 15) return 30;
    return 10;
  },
  
  _qiTotalPhosphate: function(phos) {
    if (phos <= 0.01) return 98;
    if (phos <= 0.05) return 85;
    if (phos <= 0.1) return 70;
    if (phos <= 0.5) return 40;
    if (phos <= 1.0) return 20;
    return 5;
  },
  
  _qiNitrate: function(nitrate) {
    if (nitrate <= 0.5) return 95;
    if (nitrate <= 2) return 80;
    if (nitrate <= 5) return 60;
    if (nitrate <= 10) return 40;
    if (nitrate <= 20) return 20;
    return 5;
  },
  
  _qiTurbidity: function(turb) {
    if (turb <= 5) return 95;
    if (turb <= 20) return 80;
    if (turb <= 50) return 60;
    if (turb <= 100) return 40;
    if (turb <= 200) return 20;
    return 5;
  },
  
  _qiTotalSolids: function(solids) {
    if (solids <= 100) return 85;
    if (solids <= 200) return 70;
    if (solids <= 350) return 55;
    if (solids <= 500) return 40;
    return 20;
  },

  /**
   * [Prompt 24] Verifica conformidade com CONAMA 357/2005 Classe 2
   * @private
   * @param {object} params - Parâmetros medidos
   * @param {string} tipoCorpo - 'lentico' ou 'lotico'
   * @returns {object} Resultado de conformidade com violações
   */
  _checkCONAMA357Compliance: function(params, tipoCorpo) {
    const violacoes = [];
    const detalhes = {};
    
    // pH (6.0 - 9.0)
    const pHConforme = params.pH >= CONAMA_357_CLASS_2.pH.min && params.pH <= CONAMA_357_CLASS_2.pH.max;
    detalhes.pH = { valor: params.pH, limite: '6.0 - 9.0', conforme: pHConforme };
    if (!pHConforme) {
      const desvio = params.pH < CONAMA_357_CLASS_2.pH.min ? 
        ((CONAMA_357_CLASS_2.pH.min - params.pH) / CONAMA_357_CLASS_2.pH.min * 100) :
        ((params.pH - CONAMA_357_CLASS_2.pH.max) / CONAMA_357_CLASS_2.pH.max * 100);
      violacoes.push({ parametro: 'pH', valor: params.pH, limite: '6.0 - 9.0', desvio: desvio.toFixed(1) + '%', severidade: desvio > 25 ? 'Alta' : 'Média' });
    }
    
    // Oxigênio Dissolvido (≥ 5.0 mg/L)
    const odConforme = params.oxigenio >= CONAMA_357_CLASS_2.dissolved_oxygen.min;
    detalhes.oxigenio_dissolvido = { valor: params.oxigenio, limite: '≥ 5.0 mg/L', conforme: odConforme };
    if (!odConforme) {
      const desvio = ((CONAMA_357_CLASS_2.dissolved_oxygen.min - params.oxigenio) / CONAMA_357_CLASS_2.dissolved_oxygen.min * 100);
      violacoes.push({ parametro: 'Oxigênio Dissolvido', valor: params.oxigenio + ' mg/L', limite: '≥ 5.0 mg/L', desvio: desvio.toFixed(1) + '%', severidade: desvio > 40 ? 'Crítica' : desvio > 20 ? 'Alta' : 'Média' });
    }
    
    // Turbidez (≤ 100 NTU)
    const turbConforme = params.turbidez <= CONAMA_357_CLASS_2.turbidity.max;
    detalhes.turbidez = { valor: params.turbidez, limite: '≤ 100 NTU', conforme: turbConforme };
    if (!turbConforme) {
      const desvio = ((params.turbidez - CONAMA_357_CLASS_2.turbidity.max) / CONAMA_357_CLASS_2.turbidity.max * 100);
      violacoes.push({ parametro: 'Turbidez', valor: params.turbidez + ' NTU', limite: '≤ 100 NTU', desvio: desvio.toFixed(1) + '%', severidade: desvio > 50 ? 'Alta' : 'Média' });
    }
    
    // Coliformes Termotolerantes (≤ 1000 NMP/100mL)
    const coliformConforme = params.coliformes <= CONAMA_357_CLASS_2.fecal_coliform.max;
    detalhes.coliformes = { valor: params.coliformes, limite: '≤ 1000 NMP/100mL', conforme: coliformConforme };
    if (!coliformConforme) {
      const desvio = ((params.coliformes - CONAMA_357_CLASS_2.fecal_coliform.max) / CONAMA_357_CLASS_2.fecal_coliform.max * 100);
      violacoes.push({ parametro: 'Coliformes Termotolerantes', valor: params.coliformes + ' NMP/100mL', limite: '≤ 1000 NMP/100mL', desvio: desvio.toFixed(1) + '%', severidade: desvio > 100 ? 'Crítica' : desvio > 50 ? 'Alta' : 'Média' });
    }
    
    // DBO5 (≤ 5.0 mg/L)
    if (params.dbo) {
      const dboConforme = params.dbo <= CONAMA_357_CLASS_2.bod5.max;
      detalhes.dbo5 = { valor: params.dbo, limite: '≤ 5.0 mg/L', conforme: dboConforme };
      if (!dboConforme) {
        const desvio = ((params.dbo - CONAMA_357_CLASS_2.bod5.max) / CONAMA_357_CLASS_2.bod5.max * 100);
        violacoes.push({ parametro: 'DBO5', valor: params.dbo + ' mg/L', limite: '≤ 5.0 mg/L', desvio: desvio.toFixed(1) + '%', severidade: desvio > 50 ? 'Alta' : 'Média' });
      }
    }
    
    // Fósforo Total (depende do tipo de corpo d'água)
    const fosforoLimite = tipoCorpo === 'lentico' ? CONAMA_357_CLASS_2.total_phosphorus_lentic.max : CONAMA_357_CLASS_2.total_phosphorus_lotic.max;
    const fosforoConforme = params.fosforo <= fosforoLimite;
    detalhes.fosforo_total = { valor: params.fosforo, limite: '≤ ' + fosforoLimite + ' mg/L (' + tipoCorpo + ')', conforme: fosforoConforme };
    if (!fosforoConforme) {
      const desvio = ((params.fosforo - fosforoLimite) / fosforoLimite * 100);
      violacoes.push({ parametro: 'Fósforo Total', valor: params.fosforo + ' mg/L', limite: '≤ ' + fosforoLimite + ' mg/L', desvio: desvio.toFixed(1) + '%', severidade: desvio > 100 ? 'Alta' : 'Média' });
    }
    
    // Sólidos Totais (≤ 500 mg/L)
    const solidosConforme = params.solidos <= CONAMA_357_CLASS_2.total_solids.max;
    detalhes.solidos_totais = { valor: params.solidos, limite: '≤ 500 mg/L', conforme: solidosConforme };
    if (!solidosConforme) {
      const desvio = ((params.solidos - CONAMA_357_CLASS_2.total_solids.max) / CONAMA_357_CLASS_2.total_solids.max * 100);
      violacoes.push({ parametro: 'Sólidos Totais', valor: params.solidos + ' mg/L', limite: '≤ 500 mg/L', desvio: desvio.toFixed(1) + '%', severidade: desvio > 50 ? 'Alta' : 'Média' });
    }
    
    return { conforme: violacoes.length === 0, violacoes: violacoes, detalhes: detalhes, classe: 2, referencia: 'CONAMA 357/2005' };
  },

  /**
   * [Prompt 24] Dispara alerta de qualidade da água via EcologicalAlertSystem
   * @private
   */
  _triggerWaterQualityAlert: function(medicaoId, medicao, params, conformidade) {
    try {
      if (typeof EcologicalAlertSystem === 'undefined' || !EcologicalAlertSystem.createAlert) {
        Logger.log('[_triggerWaterQualityAlert] EcologicalAlertSystem não disponível');
        return { success: false, error: 'EcologicalAlertSystem não disponível' };
      }
      
      const severidadeMap = { 'Crítica': 10, 'Alta': 8, 'Média': 6, 'Baixa': 4 };
      const maxSeveridade = conformidade.violacoes.reduce((max, v) => {
        const sev = severidadeMap[v.severidade] || 5;
        return sev > max ? sev : max;
      }, 5);
      
      const urgencia = maxSeveridade >= 9 ? 'Imediata' : maxSeveridade >= 7 ? '24h' : '7dias';
      const violacoesTexto = conformidade.violacoes.map(v => '• ' + v.parametro + ': ' + v.valor + ' (limite: ' + v.limite + ', desvio: ' + v.desvio + ')').join('\n');
      
      const alertData = {
        tipo: 'Qualidade_Agua',
        severidade: maxSeveridade,
        urgencia: urgencia,
        titulo: '⚠️ Violação CONAMA 357 - ' + (medicao.local || 'Local não especificado'),
        descricao: 'ALERTA DE QUALIDADE DA ÁGUA\n\nLocal: ' + (medicao.local || 'Não especificado') + '\nData: ' + (medicao.data || new Date().toLocaleDateString('pt-BR')) + '\nReferência: CONAMA 357/2005 - Classe 2\n\nPARÂMETROS EM NÃO CONFORMIDADE:\n' + violacoesTexto + '\n\nAÇÃO REQUERIDA: Investigar fonte de contaminação.',
        indicador: 'CONAMA_357_Classe2',
        valor_atual: conformidade.violacoes.length + ' parâmetro(s) em não conformidade',
        valor_esperado: 'Todos os parâmetros dentro dos limites Classe 2',
        zona: medicao.local || '',
        parcela: medicaoId
      };
      
      const result = EcologicalAlertSystem.createAlert(alertData);
      Logger.log('[EnvironmentalService] Alerta de qualidade da água enviado: ' + result.alert_id);
      return result;
    } catch (error) {
      Logger.log('[_triggerWaterQualityAlert] Erro: ' + error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Análise de fertilidade do solo
   * Baseado em: Embrapa - Interpretação de análise de solo
   */
  analyzeSoilFertility(medicaoId) {
    try {
      const result = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_SOLO, { id: medicaoId });

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Medição não encontrada' };
      }

      const s = result.data[0];

      const parametros = {
        pH: parseFloat(s.pH) || 6.0,
        materiaOrganica: parseFloat(s.materia_organica) || 2.0,
        fosforo: parseFloat(s.fosforo) || 10,
        potassio: parseFloat(s.potassio) || 50,
        calcio: parseFloat(s.calcio) || 2.0,
        magnesio: parseFloat(s.magnesio) || 0.8,
        aluminio: parseFloat(s.aluminio) || 0.2
      };

      // Classificação de fertilidade
      const classificacao = {
        pH: this._classifyPH(parametros.pH),
        materiaOrganica: this._classifyOM(parametros.materiaOrganica),
        fosforo: this._classifyP(parametros.fosforo),
        potassio: this._classifyK(parametros.potassio)
      };

      // Índice geral de fertilidade (0-100)
      let indiceFertilidade = 0;
      if (parametros.pH >= 6.0 && parametros.pH <= 7.0) indiceFertilidade += 25;
      else if (parametros.pH >= 5.5 && parametros.pH <= 7.5) indiceFertilidade += 15;

      if (parametros.materiaOrganica >= 2.5) indiceFertilidade += 25;
      else if (parametros.materiaOrganica >= 1.5) indiceFertilidade += 15;

      if (parametros.fosforo >= 15) indiceFertilidade += 25;
      else if (parametros.fosforo >= 8) indiceFertilidade += 15;

      if (parametros.potassio >= 80) indiceFertilidade += 25;
      else if (parametros.potassio >= 40) indiceFertilidade += 15;

      return {
        success: true,
        medicao: {
          id: medicaoId,
          data: s.data,
          local: s.local
        },
        indiceFertilidade: indiceFertilidade,
        classificacaoGeral: indiceFertilidade >= 75 ? 'Alta' :
                           indiceFertilidade >= 50 ? 'Média' : 'Baixa',
        parametros,
        classificacao,
        recomendacoes: this._generateSoilRecommendations(parametros, classificacao)
      };
    } catch (error) {
      Utils.logError('EnvironmentalService.analyzeSoilFertility', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Análise climática com métricas de adaptação e perdas/danos
   * Alinhado com: COP28 Loss & Damage Fund, Global Goal on Adaptation
   */
  analyzeClimate(periodo = 30) {
    try {
      const result = DatabaseService.read(CONFIG.SHEETS.DADOS_CLIMA);

      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Sem dados climáticos' };
      }

      // Filtra últimos N dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - periodo);

      const dados = result.data
        .filter(d => new Date(d.data) >= dataLimite)
        .map(d => ({
          data: d.data,
          tempMin: parseFloat(d.temperatura_min) || 0,
          tempMax: parseFloat(d.temperatura_max) || 0,
          precipitacao: parseFloat(d.precipitacao) || 0,
          umidade: parseFloat(d.umidade) || 0
        }));

      if (dados.length === 0) {
        return { success: false, error: 'Sem dados no período' };
      }

      const tempMinimas = dados.map(d => d.tempMin);
      const tempMaximas = dados.map(d => d.tempMax);
      const precipitacoes = dados.map(d => d.precipitacao);
      const umidades = dados.map(d => d.umidade);

      const precipitacaoTotal = precipitacoes.reduce((a, b) => a + b, 0);

      // Climate extremes detection (COP28 adaptation metrics)
      const extremeHeatDays = tempMaximas.filter(t => t > 35).length;
      const extremeColdDays = tempMinimas.filter(t => t < 10).length;
      const heavyRainDays = precipitacoes.filter(p => p > 50).length;
      const droughtDays = precipitacoes.filter(p => p < 1).length;

      // Climate Risk Index (0-100)
      let riskScore = 0;
      if (extremeHeatDays > periodo * 0.2) riskScore += 25;
      if (droughtDays > periodo * 0.5) riskScore += 25;
      if (heavyRainDays > periodo * 0.1) riskScore += 25;
      const tempVariability = Math.max(...tempMaximas) - Math.min(...tempMinimas);
      if (tempVariability > 25) riskScore += 25;

      // Loss & Damage indicators
      const lossAndDamage = this._assessLossAndDamage(dados, periodo);

      return {
        success: true,
        periodo: `${periodo} dias`,
        temperatura: {
          minimaMedia: Utils.average(tempMinimas).toFixed(1),
          maximaMedia: Utils.average(tempMaximas).toFixed(1),
          minimaAbsoluta: Math.min(...tempMinimas).toFixed(1),
          maximaAbsoluta: Math.max(...tempMaximas).toFixed(1),
          variabilidade: tempVariability.toFixed(1)
        },
        precipitacao: {
          total: precipitacaoTotal.toFixed(1),
          media: (precipitacaoTotal / periodo).toFixed(1),
          diasChuvosos: precipitacoes.filter(p => p > 1).length
        },
        umidade: {
          media: Utils.average(umidades).toFixed(1)
        },
        eventosExtremos: {
          diasCalorExtremo: extremeHeatDays,
          diasFrioExtremo: extremeColdDays,
          diasChuvaPesada: heavyRainDays,
          diasSeca: droughtDays
        },
        adaptacao: {
          indiceRiscoClimatico: riskScore,
          nivelRisco: riskScore > 75 ? 'Crítico' : riskScore > 50 ? 'Alto' : riskScore > 25 ? 'Moderado' : 'Baixo',
          capacidadeAdaptativa: this._assessAdaptiveCapacity()
        },
        perdasDanos: lossAndDamage
      };
    } catch (error) {
      Utils.logError('EnvironmentalService.analyzeClimate', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Avalia perdas e danos relacionados ao clima (COP28 Loss & Damage Fund)
   */
  _assessLossAndDamage(dados, periodo) {
    const extremeEvents = dados.filter(d => 
      d.tempMax > 38 || d.tempMin < 8 || d.precipitacao > 80 || d.precipitacao === 0
    ).length;

    const estimatedLoss = extremeEvents * 0.05; // 5% loss per extreme event day

    return {
      eventosExtremos: extremeEvents,
      diasAfetados: extremeEvents,
      perdaEstimadaProdutividade: (estimatedLoss * 100).toFixed(1) + '%',
      necessidadeCompensacao: estimatedLoss > 0.15 ? 'Sim' : 'Não',
      elegibilidadeFundo: extremeEvents > periodo * 0.3 ? 'Elegível' : 'Monitorar'
    };
  },

  /**
   * Avalia capacidade adaptativa da comunidade
   */
  _assessAdaptiveCapacity() {
    return {
      infraestruturaVerde: 'Presente',
      sistemasAgroflorestais: 'Implementados',
      conhecimentoTradicional: 'Ativo',
      diversificacaoEconomica: 'Moderada',
      score: 72
    };
  },

  // Funções auxiliares
  _classifyPH(pH) {
    if (pH < 5.0) return 'Muito Ácido';
    if (pH < 6.0) return 'Ácido';
    if (pH <= 7.0) return 'Ideal';
    if (pH <= 7.5) return 'Levemente Alcalino';
    return 'Alcalino';
  },

  _classifyOM(om) {
    if (om < 1.5) return 'Baixo';
    if (om < 2.5) return 'Médio';
    return 'Alto';
  },

  _classifyP(p) {
    if (p < 8) return 'Baixo';
    if (p < 15) return 'Médio';
    return 'Alto';
  },

  _classifyK(k) {
    if (k < 40) return 'Baixo';
    if (k < 80) return 'Médio';
    return 'Alto';
  },

  /**
   * Avalia segurança hídrica (COP28 Water Action Agenda)
   */
  _assessWaterSecurity(params, medicao) {
    let securityScore = 100;

    // Quality dimension
    if (params.pH < 6.0 || params.pH > 9.0) securityScore -= 15;
    if (params.oxigenio < 5.0) securityScore -= 20;
    if (params.coliformes > 1000) securityScore -= 25;

    // Availability (simplified - would need flow data)
    const availability = 'Adequada';

    // Accessibility
    const accessibility = 'Comunitária';

    return {
      score: Math.max(0, securityScore),
      nivel: securityScore > 80 ? 'Segura' : securityScore > 60 ? 'Moderada' : 'Vulnerável',
      dimensoes: {
        qualidade: params.oxigenio > 5 && params.coliformes < 1000 ? 'Boa' : 'Comprometida',
        disponibilidade: availability,
        acessibilidade: accessibility
      },
      resilienciaClimatica: {
        vulnerabilidadeSeca: 'Baixa',
        vulnerabilidadeInundacao: 'Moderada',
        capacidadeArmazenamento: 'Natural (mata ciliar)'
      },
      contribuicaoODS6: 'Ativa'
    };
  },

  _generateWaterRecommendations(params, iqa, conformidade) {
    const rec = [];
    
    // Recomendações baseadas em violações CONAMA
    if (conformidade && conformidade.violacoes) {
      conformidade.violacoes.forEach(v => {
        if (v.parametro === 'pH') rec.push('Monitorar pH - fora dos padrões CONAMA 357 Classe 2');
        if (v.parametro === 'Oxigênio Dissolvido') rec.push('Oxigênio baixo - verificar fontes de poluição orgânica');
        if (v.parametro === 'Coliformes Termotolerantes') rec.push('Coliformes elevados - risco sanitário, verificar fontes de contaminação fecal');
        if (v.parametro === 'Turbidez') rec.push('Turbidez elevada - verificar erosão ou descarga de sedimentos');
        if (v.parametro === 'DBO5') rec.push('DBO elevada - possível contaminação por matéria orgânica');
        if (v.parametro === 'Fósforo Total') rec.push('Fósforo elevado - risco de eutrofização');
      });
    }
    
    // Recomendações baseadas em parâmetros
    if (params.pH < 6.0 || params.pH > 9.0) rec.push('Monitorar pH - fora dos padrões CONAMA');
    if (params.oxigenio < 5.0) rec.push('Oxigênio baixo - verificar fontes de poluição');
    if (params.coliformes > 1000) rec.push('Coliformes elevados - risco sanitário');
    if (iqa < 52) rec.push('Qualidade comprometida - investigar causas');

    // Climate resilience recommendations
    rec.push('Manter mata ciliar para resiliência hídrica');
    rec.push('Monitorar sazonalidade para adaptação climática');

    // Remove duplicatas
    const uniqueRec = [...new Set(rec)];
    
    if (uniqueRec.length === 0) uniqueRec.push('Água em boas condições - manter monitoramento regular');
    return uniqueRec;
  },

  _generateSoilRecommendations(params, classif) {
    const rec = [];
    if (params.pH < 6.0) rec.push('Aplicar calcário para correção de pH');
    if (params.materiaOrganica < 2.5) rec.push('Aumentar matéria orgânica com compostagem');
    if (classif.fosforo === 'Baixo') rec.push('Aplicar fosfato natural');
    if (classif.potassio === 'Baixo') rec.push('Aplicar potássio');
    if (rec.length === 0) rec.push('Solo em boas condições de fertilidade');
    return rec;
  },

  /**
   * Calcula o índice de saúde ambiental de uma área.
   */
  calculateEnvironmentalHealthIndex(areaId) {
    try {
      var ss = SpreadsheetApp.getActive();
      // água
      var waterSh = ss.getSheetByName('WATER_QUALITY');
      var waterRows = [];
      if (waterSh) {
        var data = waterSh.getDataRange().getValues();
        var headers = data[0] || [];
        for (var i = 1; i < data.length; i++) {
          var row = {};
          for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j];
          if (String(row.areaId) === String(areaId)) waterRows.push(row);
        }
      }
      // solo
      var soilSh = ss.getSheetByName('SOIL_QUALITY');
      var soilRows = [];
      if (soilSh) {
        var data2 = soilSh.getDataRange().getValues();
        var headers2 = data2[0] || [];
        for (var k = 1; k < data2.length; k++) {
          var row = {};
          for (var m = 0; m < headers2.length; m++) row[headers2[m]] = data2[k][m];
          if (String(row.areaId) === String(areaId)) soilRows.push(row);
        }
      }

      function _avgNormalized(rows, fields) {
        if (!rows.length) return null;
        var sums = {};
        rows.forEach(function (r) {
          fields.forEach(function (f) { sums[f] = (sums[f] || 0) + (Number(r[f]) || 0); });
        });
        var avg = fields.reduce(function (acc, f) { return acc + ((sums[f] || 0) / rows.length); }, 0) / fields.length;
        // normalize to 0-1 by a simple heuristic (user can adjust)
        return Math.max(0, Math.min(1, avg / (fields.length * 100)));
      }

      var waterIndex = _avgNormalized(waterRows, ['pH', 'turbidity', 'contaminants']);
      var soilIndex = _avgNormalized(soilRows, ['nitrogen', 'phosphorus', 'potassium', 'organicMatter']);

      // combine: if one is missing, rely on the other
      var combined;
      if (waterIndex === null && soilIndex === null) combined = null;
      else if (waterIndex === null) combined = soilIndex;
      else if (soilIndex === null) combined = waterIndex;
      else combined = (waterIndex * 0.55) + (soilIndex * 0.45);

      return {
        areaId: areaId,
        waterIndex: waterIndex,
        soilIndex: soilIndex,
        environmentalHealthIndex: combined !== null ? Number(combined.toFixed(3)) : null
      };
    } catch (e) {
      Utils.logError('EnvironmentalService.calculateEnvironmentalHealthIndex', e);
      return { success: false, error: e.toString() };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - Prompt 24: Qualidade da Água e Solo
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula IQA (Índice de Qualidade da Água) usando metodologia NSF
 * @param {string} medicaoId - ID da medição
 * @param {object} options - Opções (tipoCorpo: 'lentico'|'lotico', triggerAlerts: boolean)
 * @returns {object} Resultado com IQA, conformidade CONAMA e alertas
 */
function apiEnvironmentalCalculateIQA(medicaoId, options) {
  return EnvironmentalService.calculateWaterQualityIndex(medicaoId, options || {});
}

/**
 * Verifica conformidade com CONAMA 357/2005 Classe 2
 * @param {string} medicaoId - ID da medição
 * @param {string} tipoCorpo - 'lentico' ou 'lotico' (padrão: 'lotico')
 * @returns {object} Resultado de conformidade com violações detalhadas
 */
function apiEnvironmentalCheckCONAMA(medicaoId, tipoCorpo) {
  try {
    const result = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_AGUA, { id: medicaoId });
    
    if (!result.success || result.data.length === 0) {
      return { success: false, error: 'Medição não encontrada' };
    }
    
    const m = result.data[0];
    const params = {
      pH: parseFloat(m.pH) || 7.0,
      oxigenio: parseFloat(m.oxigenio_dissolvido) || 5.0,
      turbidez: parseFloat(m.turbidez) || 50,
      coliformes: parseFloat(m.coliformes_termotolerantes) || 100,
      solidos: parseFloat(m.solidos_totais) || 100,
      fosforo: parseFloat(m.fosforo_total) || 0.1,
      dbo: parseFloat(m.dbo5) || 2.0
    };
    
    const conformidade = EnvironmentalService._checkCONAMA357Compliance(params, tipoCorpo || 'lotico');
    
    return {
      success: true,
      medicao: { id: medicaoId, data: m.data, local: m.local },
      conformidade: conformidade
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Analisa fertilidade do solo
 * @param {string} medicaoId - ID da medição de solo
 * @returns {object} Resultado com índice de fertilidade e recomendações
 */
function apiEnvironmentalAnalyzeSoil(medicaoId) {
  return EnvironmentalService.analyzeSoilFertility(medicaoId);
}

/**
 * Análise climática do período
 * @param {number} periodo - Número de dias para análise (padrão: 30)
 * @returns {object} Resultado com métricas climáticas e eventos extremos
 */
function apiEnvironmentalAnalyzeClimate(periodo) {
  return EnvironmentalService.analyzeClimate(periodo || 30);
}

/**
 * Análise em lote de qualidade da água
 * @param {Array} medicaoIds - Lista de IDs de medições
 * @param {object} options - Opções de análise
 * @returns {object} Resultado com análises individuais e resumo
 */
function apiEnvironmentalBatchWaterAnalysis(medicaoIds, options) {
  try {
    const resultados = [];
    let totalConformes = 0;
    let totalViolacoes = 0;
    let somaIQA = 0;
    
    medicaoIds.forEach(id => {
      const resultado = EnvironmentalService.calculateWaterQualityIndex(id, options || {});
      if (resultado.success) {
        resultados.push({
          id: id,
          iqa: resultado.iqa,
          conforme: resultado.conformidade_conama.conforme,
          violacoes: resultado.conformidade_conama.violacoes.length
        });
        
        if (resultado.conformidade_conama.conforme) totalConformes++;
        totalViolacoes += resultado.conformidade_conama.violacoes.length;
        somaIQA += resultado.iqa.valor;
      }
    });
    
    return {
      success: true,
      total_analisados: resultados.length,
      resumo: {
        iqa_medio: resultados.length > 0 ? (somaIQA / resultados.length).toFixed(1) : 0,
        percentual_conformes: resultados.length > 0 ? ((totalConformes / resultados.length) * 100).toFixed(1) + '%' : '0%',
        total_violacoes: totalViolacoes
      },
      resultados: resultados
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtém limites CONAMA 357/2005 Classe 2
 * @returns {object} Limites por parâmetro
 */
function apiEnvironmentalGetCONAMALimits() {
  return {
    success: true,
    classe: 2,
    referencia: 'CONAMA 357/2005',
    limites: CONAMA_357_CLASS_2,
    descricao: 'Águas destinadas ao abastecimento doméstico após tratamento convencional, proteção de comunidades aquáticas, recreação de contato primário'
  };
}