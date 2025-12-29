/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE RASTREAMENTO DE CARBONO E CRÉDITOS
 * ═══════════════════════════════════════════════════════════════════════════
 * P30 - Carbon Tracking System for VCS/Gold Standard Credits
 * 
 * Funcionalidades:
 * - Medição de biomassa (equações alométricas)
 * - Cálculo de carbono estocado
 * - Monitoramento de incremento anual
 * - Geração de relatórios VCS
 * - Rastreabilidade de créditos
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const PARCELAS_CARBONO_HEADERS = [
  'ID_Parcela', 'Nome', 'Area_ha', 'Tipo_Vegetacao', 'Latitude', 'Longitude',
  'Data_Estabelecimento', 'Metodologia', 'Status', 'Ultima_Medicao'
];

const MEDICOES_CARBONO_HEADERS = [
  'ID_Medicao', 'ID_Parcela', 'Data', 'Especie', 'DAP_cm', 'Altura_m',
  'Biomassa_kg', 'Carbono_kg', 'CO2e_kg', 'Estrato', 'Observacoes'
];

const CREDITOS_CARBONO_HEADERS = [
  'ID_Credito', 'Ano', 'Trimestre', 'Carbono_Total_ton', 'Creditos_Gerados',
  'Valor_Unitario_BRL', 'Valor_Total_BRL', 'Status', 'Certificacao', 'Hash_Verificacao'
];

/**
 * Sistema de Rastreamento de Carbono
 * @namespace CarbonTracking
 */
const CarbonTracking = {
  
  SHEET_PARCELAS: 'PARCELAS_CARBONO_RA',
  SHEET_MEDICOES: 'MEDICOES_CARBONO_RA',
  SHEET_CREDITOS: 'CREDITOS_CARBONO_RA',
  
  /**
   * Equações alométricas por tipo de vegetação (Cerrado)
   * Fonte: Rezende et al. 2006, Scolforo et al. 2008
   */
  EQUACOES_ALOMETRICAS: {
    'Cerrado_Stricto': {
      // Biomassa = exp(a + b*ln(DAP) + c*ln(H))
      a: -2.5356,
      b: 2.4349,
      c: 0.0,
      descricao: 'Cerrado sentido restrito'
    },
    'Cerradao': {
      a: -2.0773,
      b: 2.3323,
      c: 0.0,
      descricao: 'Cerradão'
    },
    'Mata_Galeria': {
      a: -1.9968,
      b: 2.2576,
      c: 0.5,
      descricao: 'Mata de galeria'
    },
    'SAF': {
      a: -2.289,
      b: 2.134,
      c: 0.6,
      descricao: 'Sistema Agroflorestal'
    },
    'Regeneracao': {
      a: -2.8,
      b: 2.5,
      c: 0.0,
      descricao: 'Área em regeneração'
    }
  },

  /**
   * Fatores de conversão
   */
  FATORES: {
    CARBONO_BIOMASSA: 0.47,  // Fração de carbono na biomassa
    CO2_CARBONO: 3.67,       // Conversão C para CO2
    RAIZ_PARTE_AEREA: 0.24,  // Razão raiz/parte aérea
    PRECO_CREDITO_BRL: 150   // Preço médio por crédito (tCO2e)
  },
  
  /**
   * Certificações suportadas
   */
  CERTIFICACOES: {
    'VCS': { nome: 'Verified Carbon Standard', multiplicador: 1.0 },
    'GS': { nome: 'Gold Standard', multiplicador: 1.15 },
    'VCS_CCB': { nome: 'VCS + CCB (Climate, Community & Biodiversity)', multiplicador: 1.25 }
  },

  /**
   * Configuração para Relatórios VCS/Gold Standard
   * Prompt 14/30: Transparência e Acesso ao Relatório de Auditoria
   */
  VCS_REPORT_CONFIG: {
    // Fatores de vazamento (leakage) - VCS AFOLU Requirements
    LEAKAGE_FACTORS: {
      market_leakage: 0.05,      // 5% desconto por vazamento de mercado
      activity_shifting: 0.02,   // 2% desconto por deslocamento de atividade
      total_discount: 0.07       // 7% total
    },
    
    // Buffer de permanência - VCS AFOLU Non-Permanence Risk Tool
    PERMANENCE_BUFFER: {
      fire_risk: 0.05,           // 5% risco de incêndio (Cerrado)
      pest_risk: 0.02,           // 2% risco de pragas
      deforestation_risk: 0.03,  // 3% risco de desmatamento ilegal
      total_buffer: 0.10         // 10% buffer total
    },
    
    // Período de compromisso do projeto
    COMMITMENT_PERIOD_YEARS: 30,
    
    // Metodologia aplicada
    METHODOLOGY: {
      standard: 'VCS VM0007',
      version: '1.6',
      scope: 'AFOLU - ARR (Afforestation, Reforestation and Revegetation)',
      applicability: 'Projetos de reflorestamento e revegetação em áreas degradadas'
    },
    
    // Papéis com acesso ao relatório completo
    ALLOWED_ROLES: ['Admin', 'Gestor', 'Apoiador', 'Ambientalista']
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      const sheets = [
        { name: this.SHEET_PARCELAS, headers: PARCELAS_CARBONO_HEADERS, color: '#2E7D32' },
        { name: this.SHEET_MEDICOES, headers: MEDICOES_CARBONO_HEADERS, color: '#388E3C' },
        { name: this.SHEET_CREDITOS, headers: CREDITOS_CARBONO_HEADERS, color: '#43A047' }
      ];
      
      sheets.forEach(s => {
        let sheet = ss.getSheetByName(s.name);
        if (!sheet) {
          sheet = ss.insertSheet(s.name);
          sheet.appendRow(s.headers);
          const headerRange = sheet.getRange(1, 1, 1, s.headers.length);
          headerRange.setBackground(s.color);
          headerRange.setFontColor('#FFFFFF');
          headerRange.setFontWeight('bold');
          sheet.setFrozenRows(1);
        }
      });
      
      return { success: true, sheets: sheets.map(s => s.name) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra parcela de monitoramento
   */
  registerPlot: function(plotData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PARCELAS);
      
      const plotId = `PC-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        plotId,
        plotData.nome || `Parcela ${plotId}`,
        plotData.area_ha || 0.25,
        plotData.tipo_vegetacao || 'Cerrado_Stricto',
        plotData.latitude || -13.4,
        plotData.longitude || -46.3,
        plotData.data_estabelecimento || new Date().toISOString().split('T')[0],
        plotData.metodologia || 'VCS VM0007',
        'Ativa',
        null
      ];
      
      sheet.appendRow(row);
      
      return { success: true, plot_id: plotId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista parcelas
   */
  listPlots: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PARCELAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, plots: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const plots = [];
      
      for (let i = 1; i < data.length; i++) {
        plots.push({
          id: data[i][0],
          nome: data[i][1],
          area_ha: data[i][2],
          tipo_vegetacao: data[i][3],
          latitude: data[i][4],
          longitude: data[i][5],
          data_estabelecimento: data[i][6],
          metodologia: data[i][7],
          status: data[i][8],
          ultima_medicao: data[i][9]
        });
      }
      
      return { success: true, plots: plots, count: plots.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra medição de árvore individual
   */
  registerMeasurement: function(measurementData) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_MEDICOES);
      
      const measurementId = `MC-${Date.now().toString(36).toUpperCase()}`;
      
      // Calcula biomassa usando equação alométrica
      const tipoVeg = measurementData.tipo_vegetacao || 'Cerrado_Stricto';
      const eq = this.EQUACOES_ALOMETRICAS[tipoVeg] || this.EQUACOES_ALOMETRICAS['Cerrado_Stricto'];
      
      const dap = measurementData.dap_cm || 10;
      const altura = measurementData.altura_m || 5;
      
      // Biomassa acima do solo (kg)
      const lnBiomassa = eq.a + eq.b * Math.log(dap) + eq.c * Math.log(altura);
      const biomassaAcima = Math.exp(lnBiomassa);
      
      // Biomassa total (inclui raízes)
      const biomassaTotal = biomassaAcima * (1 + this.FATORES.RAIZ_PARTE_AEREA);
      
      // Carbono (kg)
      const carbono = biomassaTotal * this.FATORES.CARBONO_BIOMASSA;
      
      // CO2 equivalente (kg)
      const co2e = carbono * this.FATORES.CO2_CARBONO;
      
      const row = [
        measurementId,
        measurementData.parcela_id || '',
        measurementData.data || new Date().toISOString().split('T')[0],
        measurementData.especie || 'Não identificada',
        dap,
        altura,
        Math.round(biomassaTotal * 100) / 100,
        Math.round(carbono * 100) / 100,
        Math.round(co2e * 100) / 100,
        measurementData.estrato || 'Arbóreo',
        measurementData.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
      // Atualiza última medição da parcela
      if (measurementData.parcela_id) {
        this._updatePlotLastMeasurement(measurementData.parcela_id);
      }
      
      return { 
        success: true, 
        measurement_id: measurementId,
        biomassa_kg: Math.round(biomassaTotal * 100) / 100,
        carbono_kg: Math.round(carbono * 100) / 100,
        co2e_kg: Math.round(co2e * 100) / 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza última medição da parcela
   * @private
   */
  _updatePlotLastMeasurement: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_PARCELAS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === parcelaId) {
          sheet.getRange(i + 1, 10).setValue(new Date().toISOString().split('T')[0]);
          break;
        }
      }
    } catch (error) {
      Logger.log(`[_updatePlotLastMeasurement] Erro: ${error}`);
    }
  },

  /**
   * Calcula estoque total de carbono
   */
  calculateTotalStock: function(parcelaId = null) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_MEDICOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, total_carbono_kg: 0, total_co2e_kg: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      let totalCarbono = 0;
      let totalCO2e = 0;
      let countMedicoes = 0;
      const especiesSet = new Set();
      
      for (let i = 1; i < data.length; i++) {
        if (parcelaId && data[i][1] !== parcelaId) continue;
        
        totalCarbono += data[i][7] || 0;
        totalCO2e += data[i][8] || 0;
        countMedicoes++;
        if (data[i][3]) especiesSet.add(data[i][3]);
      }
      
      return {
        success: true,
        parcela_id: parcelaId || 'Todas',
        total_carbono_kg: Math.round(totalCarbono * 100) / 100,
        total_carbono_ton: Math.round(totalCarbono / 1000 * 100) / 100,
        total_co2e_kg: Math.round(totalCO2e * 100) / 100,
        total_co2e_ton: Math.round(totalCO2e / 1000 * 100) / 100,
        medicoes: countMedicoes,
        especies: especiesSet.size
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula incremento de carbono entre períodos
   */
  calculateIncrement: function(parcelaId, dataInicio, dataFim) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_MEDICOES);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Sem medições registradas' };
      }
      
      const data = sheet.getDataRange().getValues();
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      let carbonoInicio = 0;
      let carbonoFim = 0;
      let medicoesInicio = 0;
      let medicoesFim = 0;
      
      for (let i = 1; i < data.length; i++) {
        if (parcelaId && data[i][1] !== parcelaId) continue;
        
        const dataMedicao = new Date(data[i][2]);
        const carbono = data[i][7] || 0;
        
        // Medições próximas ao início
        if (Math.abs(dataMedicao - inicio) < 30 * 24 * 60 * 60 * 1000) {
          carbonoInicio += carbono;
          medicoesInicio++;
        }
        
        // Medições próximas ao fim
        if (Math.abs(dataMedicao - fim) < 30 * 24 * 60 * 60 * 1000) {
          carbonoFim += carbono;
          medicoesFim++;
        }
      }
      
      const incremento = carbonoFim - carbonoInicio;
      const diasPeriodo = (fim - inicio) / (24 * 60 * 60 * 1000);
      const incrementoAnual = incremento * (365 / diasPeriodo);
      
      return {
        success: true,
        parcela_id: parcelaId || 'Todas',
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
          dias: Math.round(diasPeriodo)
        },
        carbono_inicio_kg: Math.round(carbonoInicio * 100) / 100,
        carbono_fim_kg: Math.round(carbonoFim * 100) / 100,
        incremento_kg: Math.round(incremento * 100) / 100,
        incremento_anual_kg: Math.round(incrementoAnual * 100) / 100,
        incremento_anual_ton: Math.round(incrementoAnual / 1000 * 100) / 100,
        taxa_sequestro_ton_co2_ano: Math.round(incrementoAnual / 1000 * this.FATORES.CO2_CARBONO * 100) / 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera créditos de carbono
   */
  generateCredits: function(ano, trimestre, certificacao = 'VCS') {
    try {
      this.initializeSheets();
      
      // Calcula estoque total
      const stockResult = this.calculateTotalStock();
      if (!stockResult.success) return stockResult;
      
      const cert = this.CERTIFICACOES[certificacao] || this.CERTIFICACOES['VCS'];
      
      // Créditos = CO2e em toneladas * multiplicador da certificação
      const creditosBase = stockResult.total_co2e_ton;
      const creditosGerados = Math.round(creditosBase * cert.multiplicador * 100) / 100;
      
      const valorUnitario = this.FATORES.PRECO_CREDITO_BRL;
      const valorTotal = Math.round(creditosGerados * valorUnitario * 100) / 100;
      
      // Gera hash de verificação (simplificado)
      const hashData = `${ano}-${trimestre}-${creditosGerados}-${Date.now()}`;
      const hash = this._simpleHash(hashData);
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CREDITOS);
      
      const creditId = `CR-${ano}Q${trimestre}-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        creditId,
        ano,
        trimestre,
        stockResult.total_carbono_ton,
        creditosGerados,
        valorUnitario,
        valorTotal,
        'Pendente',
        certificacao,
        hash
      ];
      
      sheet.appendRow(row);
      
      return {
        success: true,
        credit_id: creditId,
        ano: ano,
        trimestre: trimestre,
        carbono_total_ton: stockResult.total_carbono_ton,
        creditos_gerados: creditosGerados,
        certificacao: cert.nome,
        valor_unitario_brl: valorUnitario,
        valor_total_brl: valorTotal,
        hash_verificacao: hash
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Hash simples para verificação
   * @private
   */
  _simpleHash: function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  },

  /**
   * Lista créditos gerados
   */
  listCredits: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CREDITOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, credits: [], count: 0, total_valor: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const credits = [];
      let totalValor = 0;
      let totalCreditos = 0;
      
      for (let i = 1; i < data.length; i++) {
        const credit = {
          id: data[i][0],
          ano: data[i][1],
          trimestre: data[i][2],
          carbono_ton: data[i][3],
          creditos: data[i][4],
          valor_unitario: data[i][5],
          valor_total: data[i][6],
          status: data[i][7],
          certificacao: data[i][8],
          hash: data[i][9]
        };
        
        if (filters.ano && credit.ano !== filters.ano) continue;
        if (filters.status && credit.status !== filters.status) continue;
        
        credits.push(credit);
        totalValor += credit.valor_total || 0;
        totalCreditos += credit.creditos || 0;
      }
      
      return { 
        success: true, 
        credits: credits, 
        count: credits.length,
        total_creditos: Math.round(totalCreditos * 100) / 100,
        total_valor_brl: Math.round(totalValor * 100) / 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório VCS
   */
  generateVCSReport: function(ano) {
    try {
      const plotsResult = this.listPlots();
      const stockResult = this.calculateTotalStock();
      const creditsResult = this.listCredits({ ano: ano });
      
      // Calcula área total
      let areaTotal = 0;
      if (plotsResult.success) {
        plotsResult.plots.forEach(p => areaTotal += p.area_ha || 0);
      }
      
      const report = {
        success: true,
        titulo: `Relatório VCS - Reserva Araras ${ano}`,
        data_geracao: new Date().toISOString(),
        
        projeto: {
          nome: 'Reserva Recanto das Araras de Terra Ronca',
          localizacao: 'São Domingos, Goiás, Brasil',
          bioma: 'Cerrado',
          area_total_ha: areaTotal,
          parcelas_monitoradas: plotsResult.count || 0
        },
        
        estoque_carbono: {
          carbono_total_ton: stockResult.total_carbono_ton || 0,
          co2e_total_ton: stockResult.total_co2e_ton || 0,
          medicoes_realizadas: stockResult.medicoes || 0,
          especies_catalogadas: stockResult.especies || 0
        },
        
        creditos: {
          ano: ano,
          creditos_gerados: creditsResult.total_creditos || 0,
          valor_total_brl: creditsResult.total_valor_brl || 0,
          registros: creditsResult.count || 0
        },
        
        metodologia: {
          padrao: 'VCS VM0007',
          equacoes: 'Rezende et al. 2006, Scolforo et al. 2008',
          fator_carbono: this.FATORES.CARBONO_BIOMASSA,
          fator_co2: this.FATORES.CO2_CARBONO
        },
        
        certificacao: {
          tipo: 'VCS + CCB',
          status: 'Em validação',
          auditor: 'Pendente'
        }
      };
      
      return report;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas gerais
   */
  getStatistics: function() {
    try {
      const plotsResult = this.listPlots();
      const stockResult = this.calculateTotalStock();
      const creditsResult = this.listCredits();
      
      let areaTotal = 0;
      if (plotsResult.success) {
        plotsResult.plots.forEach(p => areaTotal += p.area_ha || 0);
      }
      
      // Valor potencial de créditos
      const valorPotencial = (stockResult.total_co2e_ton || 0) * this.FATORES.PRECO_CREDITO_BRL;
      
      return {
        success: true,
        parcelas: plotsResult.count || 0,
        area_total_ha: Math.round(areaTotal * 100) / 100,
        medicoes: stockResult.medicoes || 0,
        especies: stockResult.especies || 0,
        carbono_total_ton: stockResult.total_carbono_ton || 0,
        co2e_total_ton: stockResult.total_co2e_ton || 0,
        creditos_gerados: creditsResult.total_creditos || 0,
        valor_creditos_brl: creditsResult.total_valor_brl || 0,
        valor_potencial_brl: Math.round(valorPotencial * 100) / 100,
        preco_credito_brl: this.FATORES.PRECO_CREDITO_BRL
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém equações alométricas disponíveis
   */
  getEquations: function() {
    return {
      success: true,
      equacoes: Object.entries(this.EQUACOES_ALOMETRICAS).map(([key, eq]) => ({
        tipo: key,
        descricao: eq.descricao,
        parametros: { a: eq.a, b: eq.b, c: eq.c }
      })),
      certificacoes: Object.entries(this.CERTIFICACOES).map(([key, cert]) => ({
        codigo: key,
        nome: cert.nome,
        multiplicador: cert.multiplicador
      }))
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMPT 14/30: RELATÓRIO VCS COMPLETO COM VAZAMENTO E PERMANÊNCIA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifica acesso ao relatório VCS completo
   * @private
   */
  _checkReportAccess: function(userEmail, reportType) {
    try {
      const allowedRoles = this.VCS_REPORT_CONFIG.ALLOWED_ROLES;
      
      // Tenta obter papel via RBAC
      let userRole = 'Visitante';
      if (typeof RBAC !== 'undefined' && RBAC._getUserByEmail) {
        const user = RBAC._getUserByEmail(userEmail);
        userRole = user?.role || 'Visitante';
      }
      
      const allowed = allowedRoles.includes(userRole);
      
      // Registra tentativa de acesso
      this._logAccessAttempt(userEmail, reportType, allowed, userRole);
      
      return { 
        allowed: allowed, 
        role: userRole,
        message: allowed ? 'Acesso autorizado' : `Papel '${userRole}' não tem permissão para relatório completo`
      };
    } catch (error) {
      Logger.log(`[_checkReportAccess] Erro: ${error}`);
      return { allowed: false, role: 'Desconhecido', error: error.message };
    }
  },

  /**
   * Registra tentativa de acesso para auditoria
   * @private
   */
  _logAccessAttempt: function(userEmail, reportType, allowed, userRole) {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName('AUDIT_LOG_RA');
      
      if (!sheet) {
        sheet = ss.insertSheet('AUDIT_LOG_RA');
        sheet.appendRow(['Timestamp', 'Usuario', 'Papel', 'Acao', 'Recurso', 'Resultado', 'Detalhes']);
        sheet.getRange(1, 1, 1, 7).setBackground('#1565C0').setFontColor('#FFFFFF').setFontWeight('bold');
      }
      
      sheet.appendRow([
        new Date().toISOString(),
        userEmail || 'Anônimo',
        userRole || 'N/A',
        'ACCESS_REPORT',
        reportType,
        allowed ? 'PERMITIDO' : 'NEGADO',
        JSON.stringify({ tipo: reportType, timestamp: Date.now() })
      ]);
    } catch (error) {
      Logger.log(`[_logAccessAttempt] Erro ao registrar: ${error}`);
    }
  },

  /**
   * Calcula desconto por vazamento (leakage)
   * @private
   */
  _calculateLeakage: function(carbonStock) {
    const factors = this.VCS_REPORT_CONFIG.LEAKAGE_FACTORS;
    
    const marketLeakage = carbonStock * factors.market_leakage;
    const activityShifting = carbonStock * factors.activity_shifting;
    const totalDiscount = carbonStock * factors.total_discount;
    const netCarbon = carbonStock - totalDiscount;
    
    return {
      carbono_bruto_ton: Math.round(carbonStock * 100) / 100,
      vazamento_mercado: {
        descricao: 'Deslocamento de atividades econômicas para outras áreas',
        fator: factors.market_leakage,
        desconto_ton: Math.round(marketLeakage * 100) / 100,
        mitigacao: 'Programa de alternativas econômicas sustentáveis para comunidades locais'
      },
      vazamento_atividade: {
        descricao: 'Deslocamento de uso da terra para áreas adjacentes',
        fator: factors.activity_shifting,
        desconto_ton: Math.round(activityShifting * 100) / 100,
        mitigacao: 'Monitoramento por satélite de áreas adjacentes ao projeto'
      },
      desconto_total_ton: Math.round(totalDiscount * 100) / 100,
      fator_desconto_total: factors.total_discount,
      carbono_liquido_ton: Math.round(netCarbon * 100) / 100
    };
  },

  /**
   * Calcula buffer de permanência
   * @private
   */
  _calculatePermanenceBuffer: function(carbonStock) {
    const buffer = this.VCS_REPORT_CONFIG.PERMANENCE_BUFFER;
    
    const fireBuffer = carbonStock * buffer.fire_risk;
    const pestBuffer = carbonStock * buffer.pest_risk;
    const deforestationBuffer = carbonStock * buffer.deforestation_risk;
    const totalBuffer = carbonStock * buffer.total_buffer;
    const availableCredits = carbonStock - totalBuffer;
    
    return {
      carbono_entrada_ton: Math.round(carbonStock * 100) / 100,
      riscos: [
        {
          tipo: 'Incêndio',
          descricao: 'Risco de incêndios florestais no bioma Cerrado',
          probabilidade: 'Média',
          fator_buffer: buffer.fire_risk,
          buffer_ton: Math.round(fireBuffer * 100) / 100,
          mitigacao: 'Aceiros, brigada de incêndio, monitoramento por satélite'
        },
        {
          tipo: 'Pragas e Doenças',
          descricao: 'Risco de infestação por pragas ou doenças florestais',
          probabilidade: 'Baixa',
          fator_buffer: buffer.pest_risk,
          buffer_ton: Math.round(pestBuffer * 100) / 100,
          mitigacao: 'Monitoramento fitossanitário, diversidade de espécies'
        },
        {
          tipo: 'Desmatamento Ilegal',
          descricao: 'Risco de invasão e desmatamento ilegal',
          probabilidade: 'Baixa',
          fator_buffer: buffer.deforestation_risk,
          buffer_ton: Math.round(deforestationBuffer * 100) / 100,
          mitigacao: 'Vigilância, cercamento, parceria com órgãos ambientais'
        }
      ],
      buffer_total_ton: Math.round(totalBuffer * 100) / 100,
      fator_buffer_total: buffer.total_buffer,
      periodo_compromisso_anos: this.VCS_REPORT_CONFIG.COMMITMENT_PERIOD_YEARS,
      plano_monitoramento: {
        frequencia: 'Anual',
        proxima_verificacao: this._getNextVerificationDate(),
        responsavel: 'Equipe Técnica Reserva Araras',
        metodologia: 'Inventário florestal + sensoriamento remoto'
      },
      creditos_disponiveis_ton: Math.round(availableCredits * 100) / 100
    };
  },

  /**
   * Calcula próxima data de verificação
   * @private
   */
  _getNextVerificationDate: function() {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 15); // 15 de janeiro do próximo ano
    return nextYear.toISOString().split('T')[0];
  },

  /**
   * Gera hash SHA-256 para verificação de integridade
   * @private
   */
  _generateReportHash: function(reportData) {
    try {
      const dataString = JSON.stringify({
        projeto: reportData.projeto?.nome || 'N/A',
        ano: reportData.estoque_carbono?.ano_referencia || 0,
        carbono: reportData.estoque_carbono?.carbono_bruto_ton || 0,
        creditos: reportData.creditos?.creditos_liquidos || 0,
        timestamp: reportData.generated_at
      });
      
      const digest = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256, 
        dataString
      );
      
      return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('').toUpperCase();
    } catch (error) {
      Logger.log(`[_generateReportHash] Erro: ${error}`);
      return this._simpleHash(JSON.stringify(reportData));
    }
  },

  /**
   * Gera relatório VCS completo com vazamento e permanência
   * Requer papel APOIADOR ou superior
   */
  generateVCSReportComplete: function(ano, userEmail) {
    try {
      // 1. Verificar acesso
      const email = userEmail || Session.getActiveUser().getEmail();
      const access = this._checkReportAccess(email, 'VCS_COMPLETE');
      
      if (!access.allowed) {
        return {
          success: false,
          error: 'Acesso negado',
          message: access.message,
          papel_atual: access.role,
          papeis_permitidos: this.VCS_REPORT_CONFIG.ALLOWED_ROLES,
          alternativa: 'Use apiCarbonRelatorioVCSResumido() para versão pública'
        };
      }
      
      // 2. Coletar dados base
      const plotsResult = this.listPlots();
      const stockResult = this.calculateTotalStock();
      const creditsResult = this.listCredits({ ano: ano });
      
      // Calcula área total
      let areaTotal = 0;
      let parcelasPorTipo = {};
      if (plotsResult.success && plotsResult.plots) {
        plotsResult.plots.forEach(p => {
          areaTotal += p.area_ha || 0;
          const tipo = p.tipo_vegetacao || 'Outros';
          parcelasPorTipo[tipo] = (parcelasPorTipo[tipo] || 0) + 1;
        });
      }
      
      const co2eBruto = stockResult.total_co2e_ton || 0;
      
      // 3. Calcular vazamento
      const leakage = this._calculateLeakage(co2eBruto);
      
      // 4. Calcular buffer de permanência (sobre carbono líquido após vazamento)
      const permanence = this._calculatePermanenceBuffer(leakage.carbono_liquido_ton);
      
      // 5. Calcular créditos finais
      const creditosLiquidos = permanence.creditos_disponiveis_ton;
      const valorTotal = creditosLiquidos * this.FATORES.PRECO_CREDITO_BRL;
      
      // 6. Montar relatório completo
      const report = {
        success: true,
        report_id: `VCS-${ano}-${Date.now().toString(36).toUpperCase()}`,
        generated_at: new Date().toISOString(),
        tipo_relatorio: 'VCS_COMPLETO',
        
        // 1. Informações do Projeto
        projeto: {
          nome: 'Reserva Recanto das Araras de Terra Ronca',
          id_vcs: 'VCS-BR-ARARAS-001',
          localizacao: {
            municipio: 'São Domingos',
            estado: 'Goiás',
            pais: 'Brasil',
            coordenadas: { latitude: -13.4, longitude: -46.3 }
          },
          bioma: 'Cerrado',
          fitofisionomias: Object.keys(parcelasPorTipo),
          area_projeto_ha: Math.round(areaTotal * 100) / 100,
          data_inicio: '2020-01-01',
          periodo_credito: {
            inicio: 2020,
            fim: 2020 + this.VCS_REPORT_CONFIG.COMMITMENT_PERIOD_YEARS,
            anos: this.VCS_REPORT_CONFIG.COMMITMENT_PERIOD_YEARS
          }
        },
        
        // 2. Metodologia
        metodologia: {
          padrao: this.VCS_REPORT_CONFIG.METHODOLOGY.standard,
          versao: this.VCS_REPORT_CONFIG.METHODOLOGY.version,
          escopo: this.VCS_REPORT_CONFIG.METHODOLOGY.scope,
          aplicabilidade: this.VCS_REPORT_CONFIG.METHODOLOGY.applicability,
          equacoes_alometricas: Object.entries(this.EQUACOES_ALOMETRICAS).map(([tipo, eq]) => ({
            tipo_vegetacao: tipo,
            descricao: eq.descricao,
            formula: `Biomassa = exp(${eq.a} + ${eq.b}*ln(DAP) + ${eq.c}*ln(H))`,
            referencia: tipo === 'Cerrado_Stricto' || tipo === 'Cerradao' 
              ? 'Rezende et al. 2006' 
              : 'Scolforo et al. 2008'
          })),
          fatores_conversao: {
            carbono_biomassa: {
              valor: this.FATORES.CARBONO_BIOMASSA,
              descricao: 'Fração de carbono na biomassa seca',
              referencia: 'IPCC 2006 Guidelines'
            },
            co2_carbono: {
              valor: this.FATORES.CO2_CARBONO,
              descricao: 'Conversão de C para CO2 equivalente',
              referencia: 'Peso molecular CO2/C = 44/12'
            },
            raiz_parte_aerea: {
              valor: this.FATORES.RAIZ_PARTE_AEREA,
              descricao: 'Razão raiz/parte aérea para Cerrado',
              referencia: 'Mokany et al. 2006'
            }
          },
          referencias_cientificas: [
            'Rezende, A.V. et al. (2006). Comparação de modelos matemáticos para estimativa do volume, biomassa e estoque de carbono da vegetação lenhosa de um cerrado sensu stricto em Brasília, DF.',
            'Scolforo, J.R.S. et al. (2008). Equações para estimar o volume de madeira das principais espécies nativas do cerrado.',
            'IPCC (2006). Guidelines for National Greenhouse Gas Inventories. Volume 4: Agriculture, Forestry and Other Land Use.',
            'Mokany, K. et al. (2006). Critical analysis of root:shoot ratios in terrestrial biomes. Global Change Biology.'
          ]
        },
        
        // 3. Estoque de Carbono
        estoque_carbono: {
          ano_referencia: ano,
          parcelas_monitoradas: plotsResult.count || 0,
          parcelas_por_tipo: parcelasPorTipo,
          medicoes_realizadas: stockResult.medicoes || 0,
          carbono_bruto_ton: stockResult.total_carbono_ton || 0,
          co2e_bruto_ton: co2eBruto,
          especies_catalogadas: stockResult.especies || 0
        },
        
        // 4. Avaliação de Vazamento (Leakage)
        avaliacao_vazamento: leakage,
        
        // 5. Análise de Permanência
        analise_permanencia: permanence,
        
        // 6. Créditos Gerados
        creditos: {
          ano: ano,
          creditos_brutos_ton: Math.round(co2eBruto * 100) / 100,
          desconto_vazamento_ton: leakage.desconto_total_ton,
          buffer_permanencia_ton: permanence.buffer_total_ton,
          creditos_liquidos_ton: Math.round(creditosLiquidos * 100) / 100,
          valor_unitario_brl: this.FATORES.PRECO_CREDITO_BRL,
          valor_total_brl: Math.round(valorTotal * 100) / 100,
          certificacao: 'VCS + CCB',
          registros_historicos: creditsResult.count || 0
        },
        
        // 7. Certificação
        certificacao: {
          tipo: 'VCS + CCB (Climate, Community & Biodiversity)',
          status: 'Em validação',
          auditor: 'Pendente designação',
          proxima_auditoria: this._getNextVerificationDate(),
          documentos_suporte: [
            'Project Description Document (PDD)',
            'Monitoring Report',
            'Validation Report',
            'Verification Report'
          ]
        },
        
        // 8. Acesso e Auditoria
        acesso: {
          solicitante: email,
          papel: access.role,
          data_acesso: new Date().toISOString(),
          tipo_acesso: 'RELATORIO_COMPLETO'
        }
      };
      
      // 7. Gerar hash de verificação
      report.hash_verificacao = this._generateReportHash(report);
      
      return report;
    } catch (error) {
      Logger.log(`[generateVCSReportComplete] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório VCS resumido (público)
   * Não requer autenticação especial
   */
  generateVCSReportSummary: function(ano) {
    try {
      const stockResult = this.calculateTotalStock();
      const plotsResult = this.listPlots();
      
      let areaTotal = 0;
      if (plotsResult.success && plotsResult.plots) {
        plotsResult.plots.forEach(p => areaTotal += p.area_ha || 0);
      }
      
      // Aplica descontos para mostrar valores líquidos
      const co2eBruto = stockResult.total_co2e_ton || 0;
      const leakageDiscount = co2eBruto * this.VCS_REPORT_CONFIG.LEAKAGE_FACTORS.total_discount;
      const permanenceBuffer = (co2eBruto - leakageDiscount) * this.VCS_REPORT_CONFIG.PERMANENCE_BUFFER.total_buffer;
      const creditosLiquidos = co2eBruto - leakageDiscount - permanenceBuffer;
      
      return {
        success: true,
        tipo_relatorio: 'VCS_RESUMIDO',
        titulo: `Resumo de Impacto Ambiental - Reserva Araras ${ano}`,
        data_geracao: new Date().toISOString(),
        
        projeto: {
          nome: 'Reserva Recanto das Araras de Terra Ronca',
          bioma: 'Cerrado',
          localizacao: 'São Domingos, Goiás, Brasil'
        },
        
        impacto: {
          area_protegida_ha: Math.round(areaTotal * 100) / 100,
          parcelas_monitoradas: plotsResult.count || 0,
          especies_catalogadas: stockResult.especies || 0,
          carbono_sequestrado_ton: Math.round(creditosLiquidos * 100) / 100,
          equivalente_arvores: Math.round(creditosLiquidos * 45) // ~45 árvores por tCO2
        },
        
        certificacao: {
          padrao: 'VCS + CCB',
          status: 'Em validação'
        },
        
        nota: 'Para relatório completo com metodologia e análise de riscos, solicite acesso como APOIADOR.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Rastreamento de Carbono
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de carbono
 */
function apiCarbonInit() {
  return CarbonTracking.initializeSheets();
}

/**
 * Registra parcela de monitoramento
 */
function apiCarbonRegistrarParcela(plotData) {
  return CarbonTracking.registerPlot(plotData);
}

/**
 * Lista parcelas
 */
function apiCarbonListarParcelas() {
  return CarbonTracking.listPlots();
}

/**
 * Registra medição de árvore
 */
function apiCarbonRegistrarMedicao(measurementData) {
  return CarbonTracking.registerMeasurement(measurementData);
}

/**
 * Calcula estoque total de carbono
 */
function apiCarbonEstoqueTotal(parcelaId) {
  return CarbonTracking.calculateTotalStock(parcelaId || null);
}

/**
 * Calcula incremento de carbono
 */
function apiCarbonIncremento(parcelaId, dataInicio, dataFim) {
  return CarbonTracking.calculateIncrement(parcelaId, dataInicio, dataFim);
}

/**
 * Gera créditos de carbono
 */
function apiCarbonGerarCreditos(ano, trimestre, certificacao) {
  return CarbonTracking.generateCredits(ano, trimestre, certificacao || 'VCS');
}

/**
 * Lista créditos gerados
 */
function apiCarbonListarCreditos(filters) {
  return CarbonTracking.listCredits(filters || {});
}

/**
 * Gera relatório VCS (mantido para compatibilidade)
 */
function apiCarbonRelatorioVCS(ano) {
  return CarbonTracking.generateVCSReport(ano || new Date().getFullYear());
}

/**
 * Gera relatório VCS completo com vazamento e permanência
 * Requer papel APOIADOR ou superior
 * Prompt 14/30: Transparência e Acesso ao Relatório de Auditoria
 */
function apiCarbonRelatorioVCSCompleto(ano, userEmail) {
  return CarbonTracking.generateVCSReportComplete(
    ano || new Date().getFullYear(),
    userEmail || Session.getActiveUser().getEmail()
  );
}

/**
 * Gera relatório VCS resumido (público)
 * Não requer autenticação especial
 */
function apiCarbonRelatorioVCSResumido(ano) {
  return CarbonTracking.generateVCSReportSummary(ano || new Date().getFullYear());
}

/**
 * Obtém estatísticas
 */
function apiCarbonEstatisticas() {
  return CarbonTracking.getStatistics();
}

/**
 * Obtém equações alométricas
 */
function apiCarbonEquacoes() {
  return CarbonTracking.getEquations();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 22/30: MEDIÇÃO E CÁLCULO DE ESTOQUE DE CARBONO APRIMORADO
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Rezende et al. (2006) - Equações para Cerrado
// - Scolforo et al. (2008) - Equações para SAF
// - IPCC (2006) - Fatores de conversão

/**
 * Equações alométricas específicas por espécie do Cerrado
 * Fonte: Literatura científica brasileira
 */
const ESPECIES_EQUACOES = {
  // Espécies arbóreas do Cerrado com equações específicas
  'Caryocar brasiliense': { a: -2.45, b: 2.38, c: 0.1, nome: 'Pequi' },
  'Dipteryx alata': { a: -2.30, b: 2.42, c: 0.15, nome: 'Baru' },
  'Qualea grandiflora': { a: -2.55, b: 2.45, c: 0.0, nome: 'Pau-terra-grande' },
  'Qualea parviflora': { a: -2.60, b: 2.40, c: 0.0, nome: 'Pau-terra-pequeno' },
  'Bowdichia virgilioides': { a: -2.35, b: 2.50, c: 0.1, nome: 'Sucupira-preta' },
  'Pterodon pubescens': { a: -2.40, b: 2.48, c: 0.05, nome: 'Sucupira-branca' },
  'Hymenaea stigonocarpa': { a: -2.25, b: 2.35, c: 0.2, nome: 'Jatobá-do-cerrado' },
  'Stryphnodendron adstringens': { a: -2.70, b: 2.55, c: 0.0, nome: 'Barbatimão' },
  'Hancornia speciosa': { a: -2.80, b: 2.30, c: 0.0, nome: 'Mangaba' },
  'Eugenia dysenterica': { a: -2.75, b: 2.35, c: 0.0, nome: 'Cagaita' }
};

/**
 * Limites de validação para dados de campo
 */
const LIMITES_VALIDACAO = {
  DAP: { min: 1, max: 300, alerta: 100, unidade: 'cm' },
  ALTURA: { min: 0.5, max: 60, alerta: 40, unidade: 'm' },
  BIOMASSA: { min: 0.1, max: 50000, alerta: 10000, unidade: 'kg' }
};

// Adiciona ao CarbonTracking
CarbonTracking.ESPECIES_EQUACOES = ESPECIES_EQUACOES;
CarbonTracking.LIMITES_VALIDACAO = LIMITES_VALIDACAO;

/**
 * Valida dados de medição
 * @private
 */
CarbonTracking._validateMeasurement = function(medicao) {
  const erros = [];
  const alertas = [];
  
  // Valida DAP
  const dap = parseFloat(medicao.dap_cm);
  if (isNaN(dap) || dap < LIMITES_VALIDACAO.DAP.min) {
    erros.push(`DAP inválido: ${medicao.dap_cm}. Mínimo: ${LIMITES_VALIDACAO.DAP.min} cm`);
  } else if (dap > LIMITES_VALIDACAO.DAP.max) {
    erros.push(`DAP excede limite máximo: ${dap} cm > ${LIMITES_VALIDACAO.DAP.max} cm`);
  } else if (dap > LIMITES_VALIDACAO.DAP.alerta) {
    alertas.push(`DAP atípico (outlier): ${dap} cm - verificar medição`);
  }
  
  // Valida Altura
  const altura = parseFloat(medicao.altura_m);
  if (isNaN(altura) || altura < LIMITES_VALIDACAO.ALTURA.min) {
    erros.push(`Altura inválida: ${medicao.altura_m}. Mínimo: ${LIMITES_VALIDACAO.ALTURA.min} m`);
  } else if (altura > LIMITES_VALIDACAO.ALTURA.max) {
    erros.push(`Altura excede limite máximo: ${altura} m > ${LIMITES_VALIDACAO.ALTURA.max} m`);
  } else if (altura > LIMITES_VALIDACAO.ALTURA.alerta) {
    alertas.push(`Altura atípica (outlier): ${altura} m - verificar medição`);
  }
  
  // Valida relação DAP/Altura (heurística)
  if (!isNaN(dap) && !isNaN(altura) && dap > 0 && altura > 0) {
    const razao = altura / (dap / 100); // altura / DAP em metros
    if (razao > 100 || razao < 5) {
      alertas.push(`Relação altura/DAP atípica: ${razao.toFixed(1)} - verificar medição`);
    }
  }
  
  return {
    valido: erros.length === 0,
    erros: erros,
    alertas: alertas
  };
};

/**
 * Seleciona equação alométrica apropriada
 * @private
 */
CarbonTracking._selectEquation = function(especie, tipoVegetacao) {
  // 1. Tenta equação específica da espécie
  if (especie && ESPECIES_EQUACOES[especie]) {
    return {
      equacao: ESPECIES_EQUACOES[especie],
      fonte: 'especie_especifica',
      nome: ESPECIES_EQUACOES[especie].nome
    };
  }
  
  // 2. Usa equação do tipo de vegetação
  const tipoNormalizado = tipoVegetacao || 'Cerrado_Stricto';
  const eqTipo = this.EQUACOES_ALOMETRICAS[tipoNormalizado];
  
  if (eqTipo) {
    return {
      equacao: eqTipo,
      fonte: 'tipo_vegetacao',
      nome: eqTipo.descricao
    };
  }
  
  // 3. Fallback para Cerrado genérico
  return {
    equacao: this.EQUACOES_ALOMETRICAS['Cerrado_Stricto'],
    fonte: 'padrao',
    nome: 'Cerrado (padrão)'
  };
};

/**
 * Calcula biomassa usando equação alométrica
 * @private
 */
CarbonTracking._calculateBiomass = function(dap, altura, equacao) {
  // Biomassa acima do solo (kg)
  const lnBiomassa = equacao.a + equacao.b * Math.log(dap) + equacao.c * Math.log(altura);
  const biomassaAcima = Math.exp(lnBiomassa);
  
  // Biomassa total (inclui raízes)
  const biomassaTotal = biomassaAcima * (1 + this.FATORES.RAIZ_PARTE_AEREA);
  
  // Carbono (kg)
  const carbono = biomassaTotal * this.FATORES.CARBONO_BIOMASSA;
  
  // CO2 equivalente (kg)
  const co2e = carbono * this.FATORES.CO2_CARBONO;
  
  return {
    biomassa_acima_kg: Math.round(biomassaAcima * 100) / 100,
    biomassa_total_kg: Math.round(biomassaTotal * 100) / 100,
    carbono_kg: Math.round(carbono * 100) / 100,
    co2e_kg: Math.round(co2e * 100) / 100
  };
};

/**
 * Registra medições em lote
 * Prompt 22/30: Registro de múltiplas árvores
 */
CarbonTracking.registerBatchMeasurements = function(batchData) {
  try {
    this.initializeSheets();
    
    const parcelaId = batchData.parcela_id;
    const campanha = batchData.campanha || `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
    const data = batchData.data || new Date().toISOString().split('T')[0];
    const responsavel = batchData.responsavel || 'Sistema';
    const medicoes = batchData.medicoes || [];
    
    if (!parcelaId) {
      return { success: false, error: 'parcela_id é obrigatório' };
    }
    
    if (medicoes.length === 0) {
      return { success: false, error: 'Nenhuma medição fornecida' };
    }
    
    // Obtém tipo de vegetação da parcela
    const plotsResult = this.listPlots();
    const parcela = plotsResult.plots?.find(p => p.id === parcelaId);
    const tipoVegetacao = parcela?.tipo_vegetacao || 'Cerrado_Stricto';
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_MEDICOES);
    
    const resultados = {
      success: true,
      parcela_id: parcelaId,
      campanha: campanha,
      data: data,
      responsavel: responsavel,
      tipo_vegetacao: tipoVegetacao,
      processadas: 0,
      erros: 0,
      alertas: [],
      totais: {
        biomassa_kg: 0,
        carbono_kg: 0,
        co2e_kg: 0
      },
      por_especie: {},
      medicoes_registradas: []
    };
    
    for (const medicao of medicoes) {
      // Valida medição
      const validacao = this._validateMeasurement(medicao);
      
      if (!validacao.valido) {
        resultados.erros++;
        resultados.alertas.push({
          tipo: 'ERRO',
          medicao: medicao,
          mensagens: validacao.erros
        });
        continue;
      }
      
      if (validacao.alertas.length > 0) {
        resultados.alertas.push({
          tipo: 'ALERTA',
          medicao: medicao,
          mensagens: validacao.alertas
        });
      }
      
      // Seleciona equação
      const eqInfo = this._selectEquation(medicao.especie, tipoVegetacao);
      
      // Calcula biomassa
      const dap = parseFloat(medicao.dap_cm);
      const altura = parseFloat(medicao.altura_m);
      const calculo = this._calculateBiomass(dap, altura, eqInfo.equacao);
      
      // Gera ID
      const measurementId = `MC-${Date.now().toString(36).toUpperCase()}-${resultados.processadas}`;
      
      // Registra na planilha
      const row = [
        measurementId,
        parcelaId,
        data,
        medicao.especie || 'Não identificada',
        dap,
        altura,
        calculo.biomassa_total_kg,
        calculo.carbono_kg,
        calculo.co2e_kg,
        medicao.estrato || 'Arbóreo',
        `[${campanha}] ${medicao.observacoes || ''} | Eq: ${eqInfo.nome}`
      ];
      
      sheet.appendRow(row);
      
      // Atualiza totais
      resultados.totais.biomassa_kg += calculo.biomassa_total_kg;
      resultados.totais.carbono_kg += calculo.carbono_kg;
      resultados.totais.co2e_kg += calculo.co2e_kg;
      
      // Agrupa por espécie
      const especie = medicao.especie || 'Não identificada';
      if (!resultados.por_especie[especie]) {
        resultados.por_especie[especie] = { count: 0, biomassa_kg: 0, carbono_kg: 0 };
      }
      resultados.por_especie[especie].count++;
      resultados.por_especie[especie].biomassa_kg += calculo.biomassa_total_kg;
      resultados.por_especie[especie].carbono_kg += calculo.carbono_kg;
      
      resultados.medicoes_registradas.push({
        id: measurementId,
        especie: especie,
        dap_cm: dap,
        altura_m: altura,
        biomassa_kg: calculo.biomassa_total_kg,
        carbono_kg: calculo.carbono_kg,
        equacao_usada: eqInfo.nome
      });
      
      resultados.processadas++;
    }
    
    // Arredonda totais
    resultados.totais.biomassa_kg = Math.round(resultados.totais.biomassa_kg * 100) / 100;
    resultados.totais.carbono_kg = Math.round(resultados.totais.carbono_kg * 100) / 100;
    resultados.totais.co2e_kg = Math.round(resultados.totais.co2e_kg * 100) / 100;
    resultados.totais.carbono_ton = Math.round(resultados.totais.carbono_kg / 1000 * 100) / 100;
    resultados.totais.co2e_ton = Math.round(resultados.totais.co2e_kg / 1000 * 100) / 100;
    
    // Atualiza última medição da parcela
    this._updatePlotLastMeasurement(parcelaId);
    
    // Atualiza estoque da parcela
    this.updatePlotStock(parcelaId);
    
    return resultados;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza estoque total de carbono da parcela
 * Prompt 22/30: Atualização de estoque
 */
CarbonTracking.updatePlotStock = function(parcelaId) {
  try {
    const stockResult = this.calculateTotalStock(parcelaId);
    
    if (!stockResult.success) {
      return stockResult;
    }
    
    // Registra histórico de estoque (opcional - em planilha separada)
    const ss = getSpreadsheet();
    let histSheet = ss.getSheetByName('HISTORICO_ESTOQUE_RA');
    
    if (!histSheet) {
      histSheet = ss.insertSheet('HISTORICO_ESTOQUE_RA');
      histSheet.appendRow(['Data', 'Parcela_ID', 'Carbono_kg', 'CO2e_kg', 'Medicoes']);
      histSheet.getRange(1, 1, 1, 5).setBackground('#4CAF50').setFontColor('#FFFFFF').setFontWeight('bold');
    }
    
    histSheet.appendRow([
      new Date().toISOString().split('T')[0],
      parcelaId,
      stockResult.total_carbono_kg,
      stockResult.total_co2e_kg,
      stockResult.medicoes
    ]);
    
    return {
      success: true,
      parcela_id: parcelaId,
      estoque_atualizado: {
        carbono_kg: stockResult.total_carbono_kg,
        carbono_ton: stockResult.total_carbono_ton,
        co2e_kg: stockResult.total_co2e_kg,
        co2e_ton: stockResult.total_co2e_ton
      },
      medicoes: stockResult.medicoes,
      especies: stockResult.especies,
      data_atualizacao: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Calcula Incremento Médio Anual (IMA) de carbono
 * Prompt 22/30: Cálculo de IMA
 */
CarbonTracking.calculatePlotIMA = function(parcelaId) {
  try {
    const ss = getSpreadsheet();
    const histSheet = ss.getSheetByName('HISTORICO_ESTOQUE_RA');
    
    if (!histSheet || histSheet.getLastRow() < 2) {
      return { success: false, error: 'Histórico insuficiente para calcular IMA' };
    }
    
    const data = histSheet.getDataRange().getValues();
    const registros = [];
    
    for (let i = 1; i < data.length; i++) {
      if (!parcelaId || data[i][1] === parcelaId) {
        registros.push({
          data: new Date(data[i][0]),
          parcela_id: data[i][1],
          carbono_kg: parseFloat(data[i][2]) || 0
        });
      }
    }
    
    if (registros.length < 2) {
      return { success: false, error: 'Mínimo de 2 registros necessários para calcular IMA' };
    }
    
    // Ordena por data
    registros.sort((a, b) => a.data - b.data);
    
    const primeiro = registros[0];
    const ultimo = registros[registros.length - 1];
    
    const diasTotal = (ultimo.data - primeiro.data) / (1000 * 60 * 60 * 24);
    const anosTotal = diasTotal / 365;
    
    if (anosTotal < 0.1) {
      return { success: false, error: 'Período muito curto para calcular IMA (mínimo ~1 mês)' };
    }
    
    const incrementoTotal = ultimo.carbono_kg - primeiro.carbono_kg;
    const imaKg = incrementoTotal / anosTotal;
    const imaTon = imaKg / 1000;
    const imaCO2e = imaTon * this.FATORES.CO2_CARBONO;
    
    return {
      success: true,
      parcela_id: parcelaId || 'Todas',
      periodo: {
        inicio: primeiro.data.toISOString().split('T')[0],
        fim: ultimo.data.toISOString().split('T')[0],
        dias: Math.round(diasTotal),
        anos: Math.round(anosTotal * 100) / 100
      },
      estoque: {
        inicial_kg: Math.round(primeiro.carbono_kg * 100) / 100,
        final_kg: Math.round(ultimo.carbono_kg * 100) / 100,
        incremento_total_kg: Math.round(incrementoTotal * 100) / 100
      },
      ima: {
        carbono_kg_ano: Math.round(imaKg * 100) / 100,
        carbono_ton_ano: Math.round(imaTon * 100) / 100,
        co2e_ton_ano: Math.round(imaCO2e * 100) / 100,
        interpretacao: imaKg > 0 ? 'Sequestro positivo' : 'Perda de carbono'
      },
      registros_analisados: registros.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Gera relatório de campanha de medição
 * Prompt 22/30: Relatório de medição
 */
CarbonTracking.generateMeasurementReport = function(parcelaId, campanha) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(this.SHEET_MEDICOES);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'Sem medições registradas' };
    }
    
    const data = sheet.getDataRange().getValues();
    const medicoes = [];
    const especiesSet = new Set();
    const estratosSet = new Set();
    
    let totalBiomassa = 0;
    let totalCarbono = 0;
    let totalCO2e = 0;
    let somaDAP = 0;
    let somaAltura = 0;
    
    for (let i = 1; i < data.length; i++) {
      const parcelaMatch = !parcelaId || data[i][1] === parcelaId;
      const campanhaMatch = !campanha || (data[i][10] && data[i][10].includes(campanha));
      
      if (parcelaMatch && campanhaMatch) {
        const med = {
          id: data[i][0],
          parcela_id: data[i][1],
          data: data[i][2],
          especie: data[i][3],
          dap_cm: parseFloat(data[i][4]) || 0,
          altura_m: parseFloat(data[i][5]) || 0,
          biomassa_kg: parseFloat(data[i][6]) || 0,
          carbono_kg: parseFloat(data[i][7]) || 0,
          co2e_kg: parseFloat(data[i][8]) || 0,
          estrato: data[i][9],
          observacoes: data[i][10]
        };
        
        medicoes.push(med);
        especiesSet.add(med.especie);
        estratosSet.add(med.estrato);
        
        totalBiomassa += med.biomassa_kg;
        totalCarbono += med.carbono_kg;
        totalCO2e += med.co2e_kg;
        somaDAP += med.dap_cm;
        somaAltura += med.altura_m;
      }
    }
    
    if (medicoes.length === 0) {
      return { success: false, error: 'Nenhuma medição encontrada para os filtros especificados' };
    }
    
    // Estatísticas por espécie
    const porEspecie = {};
    medicoes.forEach(m => {
      if (!porEspecie[m.especie]) {
        porEspecie[m.especie] = { count: 0, biomassa_kg: 0, carbono_kg: 0, dap_soma: 0, altura_soma: 0 };
      }
      porEspecie[m.especie].count++;
      porEspecie[m.especie].biomassa_kg += m.biomassa_kg;
      porEspecie[m.especie].carbono_kg += m.carbono_kg;
      porEspecie[m.especie].dap_soma += m.dap_cm;
      porEspecie[m.especie].altura_soma += m.altura_m;
    });
    
    const estatisticasEspecie = Object.entries(porEspecie).map(([especie, stats]) => ({
      especie: especie,
      individuos: stats.count,
      biomassa_kg: Math.round(stats.biomassa_kg * 100) / 100,
      carbono_kg: Math.round(stats.carbono_kg * 100) / 100,
      dap_medio_cm: Math.round(stats.dap_soma / stats.count * 10) / 10,
      altura_media_m: Math.round(stats.altura_soma / stats.count * 10) / 10
    })).sort((a, b) => b.carbono_kg - a.carbono_kg);
    
    return {
      success: true,
      relatorio: {
        titulo: `Relatório de Medição - ${campanha || 'Todas as campanhas'}`,
        parcela_id: parcelaId || 'Todas',
        campanha: campanha || 'Todas',
        data_geracao: new Date().toISOString(),
        
        resumo: {
          total_medicoes: medicoes.length,
          total_especies: especiesSet.size,
          total_estratos: estratosSet.size,
          dap_medio_cm: Math.round(somaDAP / medicoes.length * 10) / 10,
          altura_media_m: Math.round(somaAltura / medicoes.length * 10) / 10
        },
        
        totais: {
          biomassa_kg: Math.round(totalBiomassa * 100) / 100,
          biomassa_ton: Math.round(totalBiomassa / 1000 * 100) / 100,
          carbono_kg: Math.round(totalCarbono * 100) / 100,
          carbono_ton: Math.round(totalCarbono / 1000 * 100) / 100,
          co2e_kg: Math.round(totalCO2e * 100) / 100,
          co2e_ton: Math.round(totalCO2e / 1000 * 100) / 100
        },
        
        por_especie: estatisticasEspecie,
        
        especies_lista: Array.from(especiesSet),
        estratos_lista: Array.from(estratosSet),
        
        metodologia: {
          equacoes: 'Rezende et al. (2006), Scolforo et al. (2008)',
          fator_carbono: this.FATORES.CARBONO_BIOMASSA,
          fator_co2: this.FATORES.CO2_CARBONO,
          fator_raiz: this.FATORES.RAIZ_PARTE_AEREA
        }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtém equações disponíveis (incluindo por espécie)
 */
CarbonTracking.getAllEquations = function() {
  return {
    success: true,
    por_tipo_vegetacao: Object.entries(this.EQUACOES_ALOMETRICAS).map(([tipo, eq]) => ({
      tipo: tipo,
      descricao: eq.descricao,
      parametros: { a: eq.a, b: eq.b, c: eq.c },
      formula: `Biomassa = exp(${eq.a} + ${eq.b}*ln(DAP) + ${eq.c}*ln(H))`
    })),
    por_especie: Object.entries(ESPECIES_EQUACOES).map(([cientifico, eq]) => ({
      especie_cientifica: cientifico,
      nome_comum: eq.nome,
      parametros: { a: eq.a, b: eq.b, c: eq.c },
      formula: `Biomassa = exp(${eq.a} + ${eq.b}*ln(DAP) + ${eq.c}*ln(H))`
    })),
    limites_validacao: LIMITES_VALIDACAO,
    fatores_conversao: this.FATORES
  };
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 22/30: APIs de Medição de Carbono Aprimoradas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Registra medições em lote
 * @param {object} batchData - { parcela_id, campanha, data, responsavel, medicoes: [...] }
 */
function apiCarbonRegistrarMedicaoLote(batchData) {
  return CarbonTracking.registerBatchMeasurements(batchData);
}

/**
 * Valida dados de medição antes de inserir
 * @param {object} medicao - { dap_cm, altura_m, especie }
 */
function apiCarbonValidarMedicao(medicao) {
  return CarbonTracking._validateMeasurement(medicao);
}

/**
 * Atualiza estoque de carbono da parcela
 * @param {string} parcelaId - ID da parcela
 */
function apiCarbonAtualizarEstoqueParcela(parcelaId) {
  return CarbonTracking.updatePlotStock(parcelaId);
}

/**
 * Calcula Incremento Médio Anual (IMA)
 * @param {string} parcelaId - ID da parcela (opcional)
 */
function apiCarbonCalcularIMA(parcelaId) {
  return CarbonTracking.calculatePlotIMA(parcelaId || null);
}

/**
 * Gera relatório de campanha de medição
 * @param {string} parcelaId - ID da parcela (opcional)
 * @param {string} campanha - Identificador da campanha (opcional)
 */
function apiCarbonRelatorioCampanha(parcelaId, campanha) {
  return CarbonTracking.generateMeasurementReport(parcelaId || null, campanha || null);
}

/**
 * Obtém todas as equações alométricas disponíveis
 */
function apiCarbonTodasEquacoes() {
  return CarbonTracking.getAllEquations();
}
