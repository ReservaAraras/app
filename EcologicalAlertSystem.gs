/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE ALERTAS ECOLÓGICOS EM TEMPO REAL
 * ═══════════════════════════════════════════════════════════════════════════
 * P03 - Sistema de Alertas Ecológicos em Tempo Real com Notificações Inteligentes
 * 
 * Funcionalidades:
 * - Detecção automática de anomalias ecológicas
 * - Monitoramento de qualidade de água, solo e biodiversidade
 * - Alertas por severidade (Crítico, Alto, Médio, Baixo, Informativo)
 * - Notificações via Email e Push
 * - Análise de causa provável com IA
 * - Recomendações de ação imediata
 * - Histórico e rastreamento de alertas
 * 
 * @version 3.2.0
 * @date 2025-12-25
 */

/**
 * Schema de dados para planilha ALERTAS_ECOLOGICOS_RA
 */
const SCHEMA_ALERTAS = {
  ID_Alerta: { type: 'string', required: true, unique: true },
  Timestamp_Criacao: { type: 'datetime', required: true },
  Timestamp_Deteccao: { type: 'datetime', required: true },
  Tipo_Alerta: { type: 'enum', values: ['Biodiversidade', 'Qualidade_Agua', 'Qualidade_Solo', 'Clima_Extremo', 'Especie_Invasora', 'Praga_Doenca', 'Incendio', 'Desmatamento', 'Poluicao', 'Oportunidade_Conservacao'] },
  Categoria: { type: 'enum', values: ['Crítico', 'Alto', 'Médio', 'Baixo', 'Informativo'] },
  Severidade_Score: { type: 'integer', range: [1, 10] },
  Urgencia: { type: 'enum', values: ['Imediata', '24h', '7dias', '30dias', 'Monitorar'] },
  ID_Parcela: { type: 'string' },
  Zona_Afetada: { type: 'string' },
  Latitude: { type: 'float' },
  Longitude: { type: 'float' },
  Area_Impactada_ha: { type: 'float' },
  Titulo_Alerta: { type: 'string', required: true },
  Descricao_Detalhada: { type: 'text', required: true },
  Indicador_Afetado: { type: 'string' },
  Valor_Atual: { type: 'string' },
  Valor_Esperado: { type: 'string' },
  Desvio_Percentual: { type: 'float' },
  IA_Causa_Provavel: { type: 'text' },
  IA_Impacto_Estimado: { type: 'text' },
  IA_Recomendacoes_Imediatas: { type: 'array' },
  IA_Plano_Acao_Sugerido: { type: 'text' },
  IA_Especies_Afetadas: { type: 'array' },
  IA_Confianca_Analise: { type: 'float' },
  Notificacao_Enviada: { type: 'boolean' },
  Canais_Notificacao: { type: 'array' },
  Destinatarios: { type: 'array' },
  Timestamp_Notificacao: { type: 'datetime' },
  Status: { type: 'enum', values: ['Novo', 'Notificado', 'Em_Analise', 'Em_Acao', 'Resolvido', 'Falso_Positivo', 'Arquivado'] },
  ID_Responsavel: { type: 'string' },
  Timestamp_Resolucao: { type: 'datetime' },
  Acao_Tomada: { type: 'text' },
  Resultado_Intervencao: { type: 'text' },
  Feedback_Precisao: { type: 'enum', values: ['Preciso', 'Parcialmente_Preciso', 'Impreciso'] }
};

/**
 * Headers da planilha ALERTAS_ECOLOGICOS_RA
 */
const ALERTAS_HEADERS = [
  'ID_Alerta', 'Timestamp_Criacao', 'Timestamp_Deteccao', 'Tipo_Alerta', 'Categoria',
  'Severidade_Score', 'Urgencia', 'ID_Parcela', 'Zona_Afetada', 'Latitude', 'Longitude',
  'Area_Impactada_ha', 'Titulo_Alerta', 'Descricao_Detalhada', 'Indicador_Afetado',
  'Valor_Atual', 'Valor_Esperado', 'Desvio_Percentual', 'IA_Causa_Provavel',
  'IA_Impacto_Estimado', 'IA_Recomendacoes_Imediatas', 'IA_Plano_Acao_Sugerido',
  'IA_Especies_Afetadas', 'IA_Confianca_Analise', 'Notificacao_Enviada',
  'Canais_Notificacao', 'Destinatarios', 'Timestamp_Notificacao', 'Status',
  'ID_Responsavel', 'Timestamp_Resolucao', 'Acao_Tomada', 'Resultado_Intervencao',
  'Feedback_Precisao', 'Fonte_Dados', 'Modelo_Deteccao'
];


/**
 * Sistema de Alertas Ecológicos em Tempo Real
 * @namespace EcologicalAlertSystem
 */
const EcologicalAlertSystem = {
  
  /**
   * Nome da planilha de alertas
   */
  SHEET_NAME: 'ALERTAS_ECOLOGICOS_RA',
  
  /**
   * Configurações de limites críticos baseados em normas (CONAMA, WHO, etc)
   */
  THRESHOLDS: {
    // Qualidade da Água (CONAMA 357/2005)
    pH_agua: { min: 6.0, max: 9.0, critico_min: 5.0, critico_max: 10.0 },
    oxigenio_dissolvido_mg_L: { min: 5.0, critico_min: 2.0 },
    coliformes_termotolerantes: { max: 1000, critico_max: 2500 },
    turbidez_NTU: { max: 40, critico_max: 100 },
    temperatura_agua_C: { max: 30, critico_max: 35 },
    
    // Qualidade do Solo
    pH_solo: { min: 5.5, max: 7.0, critico_min: 4.5, critico_max: 8.0 },
    materia_organica_percent: { min: 2.5, critico_min: 1.5 },
    umidade_solo_percent: { min: 30, max: 80, critico_min: 15, critico_max: 95 },
    
    // Biodiversidade
    indice_shannon: { min: 2.0, critico_min: 1.0 },
    riqueza_especies: { min: 20, critico_min: 10 },
    
    // Clima
    temperatura_ar_max_C: { max: 35, critico_max: 40 },
    temperatura_ar_min_C: { min: 10, critico_min: 5 },
    precipitacao_24h_mm: { max: 80, critico_max: 120 },
    dias_sem_chuva: { max: 20, critico_max: 30 },
    umidade_ar_percent: { min: 30, critico_min: 20 },
    
    // Sucessão Ecológica
    taxa_mortalidade_percent: { max: 10, critico_max: 20 },
    cobertura_dossel_percent: { min: 40, critico_min: 20 }
  },
  
  /**
   * Mapeamento de severidade para categoria
   */
  SEVERITY_MAP: {
    10: 'Crítico',
    9: 'Crítico',
    8: 'Alto',
    7: 'Alto',
    6: 'Médio',
    5: 'Médio',
    4: 'Baixo',
    3: 'Baixo',
    2: 'Informativo',
    1: 'Informativo'
  },
  
  /**
   * Inicializa a planilha de alertas
   * @returns {object} Resultado da inicialização
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(ALERTAS_HEADERS);
        
        // Formata header
        const headerRange = sheet.getRange(1, 1, 1, ALERTAS_HEADERS.length);
        headerRange.setBackground('#D32F2F');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[EcologicalAlertSystem] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[EcologicalAlertSystem] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },

  
  /**
   * Executa varredura completa de todos os indicadores
   * @returns {object} Resultado com alertas detectados
   */
  runFullScan: function() {
    const startTime = Date.now();
    
    try {
      this.initializeSheet();
      
      const alerts = [];
      
      // 1. Verifica qualidade da água
      const waterAlerts = this._checkWaterQuality();
      alerts.push(...waterAlerts);
      
      // 2. Verifica qualidade do solo
      const soilAlerts = this._checkSoilQuality();
      alerts.push(...soilAlerts);
      
      // 3. Verifica biodiversidade
      const biodivAlerts = this._checkBiodiversity();
      alerts.push(...biodivAlerts);
      
      // 4. Verifica sucessão ecológica
      const successionAlerts = this._checkSuccession();
      alerts.push(...successionAlerts);
      
      // 5. Verifica clima (se disponível)
      const climateAlerts = this._checkClimate();
      alerts.push(...climateAlerts);
      
      // 6. Filtra alertas válidos
      const validAlerts = alerts.filter(a => a !== null && a !== undefined);
      
      // 7. Processa e salva cada alerta
      const savedAlerts = [];
      validAlerts.forEach(alert => {
        const savedId = this._saveAlert(alert);
        if (savedId) {
          alert.id = savedId;
          savedAlerts.push(alert);
        }
      });
      
      // 8. Envia notificações para alertas críticos e altos
      const criticalAlerts = savedAlerts.filter(a => 
        a.categoria === 'Crítico' || a.categoria === 'Alto'
      );
      
      if (criticalAlerts.length > 0) {
        this._sendNotifications(criticalAlerts);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        total_alerts: savedAlerts.length,
        by_category: this._groupByCategory(savedAlerts),
        by_type: this._groupByType(savedAlerts),
        critical_count: criticalAlerts.length,
        alerts: savedAlerts,
        processing_time_ms: processingTime
      };
      
    } catch (error) {
      Logger.log(`[EcologicalAlertSystem.runFullScan] Erro: ${error}`);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Verifica qualidade da água
   * @returns {Array} Lista de alertas
   */
  _checkWaterQuality: function() {
    const alerts = [];
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.QUALIDADE_AGUA);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return alerts;
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Verifica últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const timestamp = new Date(row[0]);
        
        if (timestamp < oneDayAgo) break;
        
        const local = row[1] || 'Local não especificado';
        const pH = parseFloat(row[2]);
        const od = parseFloat(row[3]);
        const turbidez = parseFloat(row[4]);
        const temperatura = parseFloat(row[5]);
        
        // Verifica pH
        if (!isNaN(pH)) {
          if (pH < this.THRESHOLDS.pH_agua.critico_min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Agua',
              severidade: 9,
              urgencia: 'Imediata',
              titulo: `pH da água muito ácido - ${local}`,
              descricao: `pH medido: ${pH}. Valor crítico abaixo de ${this.THRESHOLDS.pH_agua.critico_min}. Risco para vida aquática.`,
              indicador: 'pH_Agua',
              valor_atual: pH,
              valor_esperado: `${this.THRESHOLDS.pH_agua.min} - ${this.THRESHOLDS.pH_agua.max}`,
              zona: local,
              timestamp: timestamp
            }));
          } else if (pH > this.THRESHOLDS.pH_agua.critico_max) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Agua',
              severidade: 9,
              urgencia: 'Imediata',
              titulo: `pH da água muito alcalino - ${local}`,
              descricao: `pH medido: ${pH}. Valor crítico acima de ${this.THRESHOLDS.pH_agua.critico_max}.`,
              indicador: 'pH_Agua',
              valor_atual: pH,
              valor_esperado: `${this.THRESHOLDS.pH_agua.min} - ${this.THRESHOLDS.pH_agua.max}`,
              zona: local,
              timestamp: timestamp
            }));
          } else if (pH < this.THRESHOLDS.pH_agua.min || pH > this.THRESHOLDS.pH_agua.max) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Agua',
              severidade: 6,
              urgencia: '7dias',
              titulo: `pH da água fora do ideal - ${local}`,
              descricao: `pH medido: ${pH}. Fora da faixa ideal (${this.THRESHOLDS.pH_agua.min}-${this.THRESHOLDS.pH_agua.max}).`,
              indicador: 'pH_Agua',
              valor_atual: pH,
              valor_esperado: `${this.THRESHOLDS.pH_agua.min} - ${this.THRESHOLDS.pH_agua.max}`,
              zona: local,
              timestamp: timestamp
            }));
          }
        }
        
        // Verifica Oxigênio Dissolvido
        if (!isNaN(od)) {
          if (od < this.THRESHOLDS.oxigenio_dissolvido_mg_L.critico_min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Agua',
              severidade: 10,
              urgencia: 'Imediata',
              titulo: `Oxigênio dissolvido crítico - ${local}`,
              descricao: `OD: ${od} mg/L. CRÍTICO! Risco iminente de morte de peixes e organismos aquáticos.`,
              indicador: 'Oxigenio_Dissolvido',
              valor_atual: od,
              valor_esperado: `> ${this.THRESHOLDS.oxigenio_dissolvido_mg_L.min} mg/L`,
              zona: local,
              timestamp: timestamp
            }));
          } else if (od < this.THRESHOLDS.oxigenio_dissolvido_mg_L.min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Agua',
              severidade: 7,
              urgencia: '24h',
              titulo: `Oxigênio dissolvido baixo - ${local}`,
              descricao: `OD: ${od} mg/L. Abaixo do mínimo recomendado de ${this.THRESHOLDS.oxigenio_dissolvido_mg_L.min} mg/L.`,
              indicador: 'Oxigenio_Dissolvido',
              valor_atual: od,
              valor_esperado: `> ${this.THRESHOLDS.oxigenio_dissolvido_mg_L.min} mg/L`,
              zona: local,
              timestamp: timestamp
            }));
          }
        }
        
        // Verifica Turbidez
        if (!isNaN(turbidez) && turbidez > this.THRESHOLDS.turbidez_NTU.critico_max) {
          alerts.push(this._createAlert({
            tipo: 'Qualidade_Agua',
            severidade: 7,
            urgencia: '24h',
            titulo: `Turbidez elevada - ${local}`,
            descricao: `Turbidez: ${turbidez} NTU. Acima do limite crítico de ${this.THRESHOLDS.turbidez_NTU.critico_max} NTU.`,
            indicador: 'Turbidez',
            valor_atual: turbidez,
            valor_esperado: `< ${this.THRESHOLDS.turbidez_NTU.max} NTU`,
            zona: local,
            timestamp: timestamp
          }));
        }
      }
      
    } catch (error) {
      Logger.log(`[_checkWaterQuality] Erro: ${error}`);
    }
    
    return alerts;
  },

  
  /**
   * Verifica qualidade do solo
   * @returns {Array} Lista de alertas
   */
  _checkSoilQuality: function() {
    const alerts = [];
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.QUALIDADE_SOLO);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return alerts;
      }
      
      const data = sheet.getDataRange().getValues();
      
      // Verifica últimos 30 dias
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const timestamp = new Date(row[0]);
        
        if (timestamp < thirtyDaysAgo) break;
        
        const parcela = row[1] || 'Parcela não especificada';
        const pH = parseFloat(row[2]);
        const mo = parseFloat(row[3]);
        const umidade = parseFloat(row[4]);
        
        // Verifica pH do solo
        if (!isNaN(pH)) {
          if (pH < this.THRESHOLDS.pH_solo.critico_min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 8,
              urgencia: '7dias',
              titulo: `Solo muito ácido - ${parcela}`,
              descricao: `pH: ${pH}. Solo extremamente ácido, pode causar toxicidade por alumínio.`,
              indicador: 'pH_Solo',
              valor_atual: pH,
              valor_esperado: `${this.THRESHOLDS.pH_solo.min} - ${this.THRESHOLDS.pH_solo.max}`,
              parcela: parcela,
              timestamp: timestamp
            }));
          } else if (pH > this.THRESHOLDS.pH_solo.critico_max) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 7,
              urgencia: '7dias',
              titulo: `Solo muito alcalino - ${parcela}`,
              descricao: `pH: ${pH}. Solo alcalino pode causar deficiência de micronutrientes.`,
              indicador: 'pH_Solo',
              valor_atual: pH,
              valor_esperado: `${this.THRESHOLDS.pH_solo.min} - ${this.THRESHOLDS.pH_solo.max}`,
              parcela: parcela,
              timestamp: timestamp
            }));
          }
        }
        
        // Verifica matéria orgânica
        if (!isNaN(mo)) {
          if (mo < this.THRESHOLDS.materia_organica_percent.critico_min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 7,
              urgencia: '30dias',
              titulo: `Matéria orgânica crítica - ${parcela}`,
              descricao: `MO: ${mo}%. Solo muito empobrecido, necessita intervenção urgente.`,
              indicador: 'Materia_Organica',
              valor_atual: mo,
              valor_esperado: `> ${this.THRESHOLDS.materia_organica_percent.min}%`,
              parcela: parcela,
              timestamp: timestamp
            }));
          } else if (mo < this.THRESHOLDS.materia_organica_percent.min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 5,
              urgencia: '30dias',
              titulo: `Matéria orgânica baixa - ${parcela}`,
              descricao: `MO: ${mo}%. Abaixo do ideal, recomenda-se adubação orgânica.`,
              indicador: 'Materia_Organica',
              valor_atual: mo,
              valor_esperado: `> ${this.THRESHOLDS.materia_organica_percent.min}%`,
              parcela: parcela,
              timestamp: timestamp
            }));
          }
        }
        
        // Verifica umidade do solo
        if (!isNaN(umidade)) {
          if (umidade < this.THRESHOLDS.umidade_solo_percent.critico_min) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 8,
              urgencia: '24h',
              titulo: `Solo muito seco - ${parcela}`,
              descricao: `Umidade: ${umidade}%. Estresse hídrico severo para as plantas.`,
              indicador: 'Umidade_Solo',
              valor_atual: umidade,
              valor_esperado: `${this.THRESHOLDS.umidade_solo_percent.min} - ${this.THRESHOLDS.umidade_solo_percent.max}%`,
              parcela: parcela,
              timestamp: timestamp
            }));
          } else if (umidade > this.THRESHOLDS.umidade_solo_percent.critico_max) {
            alerts.push(this._createAlert({
              tipo: 'Qualidade_Solo',
              severidade: 6,
              urgencia: '7dias',
              titulo: `Solo encharcado - ${parcela}`,
              descricao: `Umidade: ${umidade}%. Risco de asfixia radicular e doenças fúngicas.`,
              indicador: 'Umidade_Solo',
              valor_atual: umidade,
              valor_esperado: `${this.THRESHOLDS.umidade_solo_percent.min} - ${this.THRESHOLDS.umidade_solo_percent.max}%`,
              parcela: parcela,
              timestamp: timestamp
            }));
          }
        }
      }
      
    } catch (error) {
      Logger.log(`[_checkSoilQuality] Erro: ${error}`);
    }
    
    return alerts;
  },
  
  /**
   * Verifica biodiversidade
   * @returns {Array} Lista de alertas
   */
  _checkBiodiversity: function() {
    const alerts = [];
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('BIODIVERSIDADE_RA');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return alerts;
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Últimos 7 dias
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Detecta espécies ameaçadas e invasoras
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const timestamp = new Date(row[1]);
        
        if (timestamp < sevenDaysAgo) break;
        
        const especie = row[16]; // Especie_Cientifica
        const nomePopular = row[17]; // Nome_Popular
        const zona = row[9]; // Zona_Ecologica
        const ameacada = row[32]; // Especie_Ameacada
        const iucn = row[33]; // Categoria_IUCN
        const condicao = row[21]; // Condicao_Saude
        
        // Alerta para espécies criticamente ameaçadas
        if (ameacada && iucn === 'CR') {
          alerts.push(this._createAlert({
            tipo: 'Oportunidade_Conservacao',
            severidade: 3,
            urgencia: 'Monitorar',
            titulo: `Espécie criticamente ameaçada: ${nomePopular || especie}`,
            descricao: `${especie} (IUCN: CR) detectada em ${zona}. Oportunidade única para conservação!`,
            indicador: 'Especie_CR',
            valor_atual: especie,
            zona: zona,
            timestamp: timestamp
          }));
        }
        
        // Alerta para espécies em perigo
        if (ameacada && iucn === 'EN') {
          alerts.push(this._createAlert({
            tipo: 'Oportunidade_Conservacao',
            severidade: 2,
            urgencia: 'Monitorar',
            titulo: `Espécie em perigo detectada: ${nomePopular || especie}`,
            descricao: `${especie} (IUCN: EN) observada em ${zona}. Monitorar população.`,
            indicador: 'Especie_EN',
            valor_atual: especie,
            zona: zona,
            timestamp: timestamp
          }));
        }
        
        // Alerta para espécies em condição crítica
        if (condicao === 'Crítica') {
          alerts.push(this._createAlert({
            tipo: 'Biodiversidade',
            severidade: 7,
            urgencia: '24h',
            titulo: `Espécie em condição crítica: ${nomePopular || especie}`,
            descricao: `Indivíduo de ${especie} encontrado em condição crítica em ${zona}. Avaliar necessidade de resgate.`,
            indicador: 'Condicao_Saude',
            valor_atual: 'Crítica',
            valor_esperado: 'Boa',
            zona: zona,
            timestamp: timestamp
          }));
        }
      }
      
      // Verifica índice de Shannon geral
      if (typeof BiodiversityAIService !== 'undefined') {
        const shannon = BiodiversityAIService.calculateShannonIndex();
        if (shannon && shannon.index < this.THRESHOLDS.indice_shannon.critico_min) {
          alerts.push(this._createAlert({
            tipo: 'Biodiversidade',
            severidade: 8,
            urgencia: '7dias',
            titulo: 'Diversidade ecológica crítica',
            descricao: `Índice de Shannon: ${shannon.index.toFixed(2)}. Abaixo do mínimo crítico de ${this.THRESHOLDS.indice_shannon.critico_min}.`,
            indicador: 'Indice_Shannon',
            valor_atual: shannon.index.toFixed(2),
            valor_esperado: `> ${this.THRESHOLDS.indice_shannon.min}`,
            timestamp: new Date()
          }));
        }
      }
      
    } catch (error) {
      Logger.log(`[_checkBiodiversity] Erro: ${error}`);
    }
    
    return alerts;
  },

  
  /**
   * Verifica sucessão ecológica
   * @returns {Array} Lista de alertas
   */
  _checkSuccession: function() {
    const alerts = [];
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('SUCESSAO_ECOLOGICA_RA');
      
      if (!sheet || sheet.getLastRow() < 2) {
        return alerts;
      }
      
      const data = sheet.getDataRange().getValues();
      
      // Verifica últimas análises
      for (let i = data.length - 1; i >= 1 && i > data.length - 10; i--) {
        const row = data[i];
        const parcela = row[3]; // Nome_Parcela
        const tendencia = row[28]; // Tendencia_Sucessional
        const velocidade = row[29]; // Velocidade_Sucessao
        const cobertura = parseFloat(row[10]); // Cobertura_Dossel_percent
        const timestamp = new Date(row[1]);
        
        // Alerta para tendência regressiva
        if (tendencia === 'Regressiva') {
          alerts.push(this._createAlert({
            tipo: 'Biodiversidade',
            severidade: 9,
            urgencia: 'Imediata',
            titulo: `Sucessão regressiva - ${parcela}`,
            descricao: `Sistema agroflorestal apresenta sinais de degradação. Intervenção urgente necessária para reverter tendência.`,
            indicador: 'Tendencia_Sucessional',
            valor_atual: 'Regressiva',
            valor_esperado: 'Progressiva',
            parcela: parcela,
            timestamp: timestamp
          }));
        }
        
        // Alerta para velocidade muito lenta
        if (velocidade === 'Muito Lenta' && tendencia !== 'Regressiva') {
          alerts.push(this._createAlert({
            tipo: 'Biodiversidade',
            severidade: 5,
            urgencia: '30dias',
            titulo: `Sucessão muito lenta - ${parcela}`,
            descricao: `Evolução do sistema está muito lenta. Considerar enriquecimento com espécies nativas.`,
            indicador: 'Velocidade_Sucessao',
            valor_atual: 'Muito Lenta',
            valor_esperado: 'Moderada',
            parcela: parcela,
            timestamp: timestamp
          }));
        }
        
        // Alerta para baixa cobertura de dossel
        if (!isNaN(cobertura) && cobertura < this.THRESHOLDS.cobertura_dossel_percent.critico_min) {
          alerts.push(this._createAlert({
            tipo: 'Biodiversidade',
            severidade: 7,
            urgencia: '7dias',
            titulo: `Cobertura de dossel crítica - ${parcela}`,
            descricao: `Cobertura: ${cobertura}%. Solo exposto excessivamente, risco de erosão e perda de umidade.`,
            indicador: 'Cobertura_Dossel',
            valor_atual: cobertura,
            valor_esperado: `> ${this.THRESHOLDS.cobertura_dossel_percent.min}%`,
            parcela: parcela,
            timestamp: timestamp
          }));
        }
      }
      
    } catch (error) {
      Logger.log(`[_checkSuccession] Erro: ${error}`);
    }
    
    return alerts;
  },
  
  /**
   * Verifica condições climáticas
   * @returns {Array} Lista de alertas
   */
  _checkClimate: function() {
    const alerts = [];
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEETS.DADOS_CLIMA);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return alerts;
      }
      
      const data = sheet.getDataRange().getValues();
      
      // Verifica últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const timestamp = new Date(row[0]);
        
        if (timestamp < oneDayAgo) break;
        
        const tempMax = parseFloat(row[2]);
        const tempMin = parseFloat(row[3]);
        const precipitacao = parseFloat(row[4]);
        const umidade = parseFloat(row[5]);
        
        // Temperatura máxima extrema
        if (!isNaN(tempMax) && tempMax > this.THRESHOLDS.temperatura_ar_max_C.critico_max) {
          alerts.push(this._createAlert({
            tipo: 'Clima_Extremo',
            severidade: 8,
            urgencia: 'Imediata',
            titulo: 'Temperatura extremamente alta',
            descricao: `Temperatura máxima: ${tempMax}°C. Risco de estresse térmico para plantas e animais.`,
            indicador: 'Temperatura_Max',
            valor_atual: tempMax,
            valor_esperado: `< ${this.THRESHOLDS.temperatura_ar_max_C.max}°C`,
            timestamp: timestamp
          }));
        }
        
        // Precipitação intensa
        if (!isNaN(precipitacao) && precipitacao > this.THRESHOLDS.precipitacao_24h_mm.critico_max) {
          alerts.push(this._createAlert({
            tipo: 'Clima_Extremo',
            severidade: 7,
            urgencia: '24h',
            titulo: 'Precipitação intensa',
            descricao: `Precipitação: ${precipitacao}mm em 24h. Risco de erosão e alagamento.`,
            indicador: 'Precipitacao_24h',
            valor_atual: precipitacao,
            valor_esperado: `< ${this.THRESHOLDS.precipitacao_24h_mm.max}mm`,
            timestamp: timestamp
          }));
        }
        
        // Umidade do ar muito baixa
        if (!isNaN(umidade) && umidade < this.THRESHOLDS.umidade_ar_percent.critico_min) {
          alerts.push(this._createAlert({
            tipo: 'Clima_Extremo',
            severidade: 8,
            urgencia: 'Imediata',
            titulo: 'Umidade do ar crítica',
            descricao: `Umidade: ${umidade}%. Risco elevado de incêndio e estresse hídrico.`,
            indicador: 'Umidade_Ar',
            valor_atual: umidade,
            valor_esperado: `> ${this.THRESHOLDS.umidade_ar_percent.min}%`,
            timestamp: timestamp
          }));
        }
      }
      
    } catch (error) {
      Logger.log(`[_checkClimate] Erro: ${error}`);
    }
    
    return alerts;
  },

  
  /**
   * Cria objeto de alerta padronizado
   * @param {object} data - Dados do alerta
   * @returns {object} Alerta formatado
   */
  _createAlert: function(data) {
    const categoria = this.SEVERITY_MAP[data.severidade] || 'Informativo';
    
    return {
      tipo: data.tipo,
      categoria: categoria,
      severidade: data.severidade,
      urgencia: data.urgencia,
      titulo: data.titulo,
      descricao: data.descricao,
      indicador: data.indicador,
      valor_atual: data.valor_atual,
      valor_esperado: data.valor_esperado || '',
      parcela: data.parcela || '',
      zona: data.zona || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      timestamp: data.timestamp || new Date()
    };
  },
  
  /**
   * Salva alerta na planilha
   * @param {object} alert - Dados do alerta
   * @returns {string} ID do alerta salvo
   */
  _saveAlert: function(alert) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        this.initializeSheet();
      }
      
      const id = `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Analisa com IA se disponível
      const aiAnalysis = this._analyzeWithAI(alert);
      
      const row = [
        id,                                              // ID_Alerta
        new Date(),                                      // Timestamp_Criacao
        alert.timestamp,                                 // Timestamp_Deteccao
        alert.tipo,                                      // Tipo_Alerta
        alert.categoria,                                 // Categoria
        alert.severidade,                                // Severidade_Score
        alert.urgencia,                                  // Urgencia
        alert.parcela,                                   // ID_Parcela
        alert.zona,                                      // Zona_Afetada
        alert.latitude,                                  // Latitude
        alert.longitude,                                 // Longitude
        '',                                              // Area_Impactada_ha
        alert.titulo,                                    // Titulo_Alerta
        alert.descricao,                                 // Descricao_Detalhada
        alert.indicador,                                 // Indicador_Afetado
        String(alert.valor_atual),                       // Valor_Atual
        alert.valor_esperado,                            // Valor_Esperado
        this._calculateDeviation(alert.valor_atual, alert.valor_esperado), // Desvio_Percentual
        aiAnalysis.causa_provavel || '',                 // IA_Causa_Provavel
        aiAnalysis.impacto_estimado || '',               // IA_Impacto_Estimado
        JSON.stringify(aiAnalysis.recomendacoes || []),  // IA_Recomendacoes_Imediatas
        aiAnalysis.plano_acao || '',                     // IA_Plano_Acao_Sugerido
        JSON.stringify(aiAnalysis.especies_afetadas || []), // IA_Especies_Afetadas
        aiAnalysis.confianca || 0,                       // IA_Confianca_Analise
        false,                                           // Notificacao_Enviada
        JSON.stringify(['Email']),                       // Canais_Notificacao
        JSON.stringify([]),                              // Destinatarios
        '',                                              // Timestamp_Notificacao
        'Novo',                                          // Status
        '',                                              // ID_Responsavel
        '',                                              // Timestamp_Resolucao
        '',                                              // Acao_Tomada
        '',                                              // Resultado_Intervencao
        '',                                              // Feedback_Precisao
        'Sistema Automático',                            // Fonte_Dados
        'v3.2.0'                                         // Modelo_Deteccao
      ];
      
      const targetSheet = ss.getSheetByName(this.SHEET_NAME);
      targetSheet.appendRow(row);
      
      Logger.log(`[EcologicalAlertSystem] Alerta salvo: ${id} - ${alert.titulo}`);
      return id;
      
    } catch (error) {
      Logger.log(`[_saveAlert] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Analisa alerta com IA
   * @param {object} alert - Dados do alerta
   * @returns {object} Análise da IA
   */
  _analyzeWithAI: function(alert) {
    try {
      if (typeof GeminiAIService === 'undefined' || !GeminiAIService.generateContent) {
        return this._getDefaultAnalysis(alert);
      }
      
      const prompt = `
Você é um ecólogo especialista em gestão ambiental de reservas naturais no Cerrado brasileiro.

**ALERTA DETECTADO:**
- Tipo: ${alert.tipo}
- Categoria: ${alert.categoria}
- Indicador: ${alert.indicador}
- Valor Atual: ${alert.valor_atual}
- Valor Esperado: ${alert.valor_esperado}
- Local: ${alert.zona || alert.parcela || 'Não especificado'}

**ANÁLISE REQUERIDA:**
1. Causa provável do problema
2. Impacto estimado no ecossistema
3. 3-5 recomendações de ação imediata
4. Plano de ação sugerido
5. Espécies que podem ser afetadas

**FORMATO DE RESPOSTA (JSON):**
{
  "causa_provavel": "Descrição da causa mais provável",
  "impacto_estimado": "Descrição do impacto no ecossistema",
  "recomendacoes": ["Ação 1", "Ação 2", "Ação 3"],
  "plano_acao": "Plano detalhado de intervenção",
  "especies_afetadas": ["Espécie 1", "Espécie 2"],
  "confianca": 0.85
}

Retorne APENAS o JSON.
`;
      
      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response && response.candidates && response.candidates[0]) {
        const text = response.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      return this._getDefaultAnalysis(alert);
      
    } catch (error) {
      Logger.log(`[_analyzeWithAI] Erro: ${error}`);
      return this._getDefaultAnalysis(alert);
    }
  },
  
  /**
   * Retorna análise padrão quando IA não está disponível
   */
  _getDefaultAnalysis: function(alert) {
    const analyses = {
      'Qualidade_Agua': {
        causa_provavel: 'Possível contaminação ou alteração natural do corpo d\'água',
        impacto_estimado: 'Pode afetar fauna aquática e qualidade da água para uso',
        recomendacoes: ['Coletar amostras adicionais', 'Identificar fonte de alteração', 'Monitorar parâmetros'],
        plano_acao: 'Realizar diagnóstico completo e implementar medidas corretivas',
        especies_afetadas: ['Peixes', 'Anfíbios', 'Invertebrados aquáticos'],
        confianca: 0.6
      },
      'Qualidade_Solo': {
        causa_provavel: 'Manejo inadequado ou condições naturais do solo',
        impacto_estimado: 'Pode afetar crescimento das plantas e produtividade',
        recomendacoes: ['Análise de solo completa', 'Correção de pH se necessário', 'Adubação orgânica'],
        plano_acao: 'Implementar práticas de manejo conservacionista',
        especies_afetadas: ['Espécies vegetais cultivadas', 'Microbiota do solo'],
        confianca: 0.6
      },
      'Biodiversidade': {
        causa_provavel: 'Pressão ambiental ou alteração de habitat',
        impacto_estimado: 'Pode afetar equilíbrio ecológico e serviços ecossistêmicos',
        recomendacoes: ['Intensificar monitoramento', 'Avaliar causas de estresse', 'Implementar medidas de proteção'],
        plano_acao: 'Desenvolver plano de conservação específico',
        especies_afetadas: ['Fauna e flora local'],
        confianca: 0.6
      },
      'Clima_Extremo': {
        causa_provavel: 'Evento climático extremo ou mudança climática',
        impacto_estimado: 'Pode causar estresse em plantas e animais',
        recomendacoes: ['Implementar medidas de proteção', 'Irrigação de emergência se necessário', 'Monitorar condições'],
        plano_acao: 'Ativar protocolo de resposta a eventos extremos',
        especies_afetadas: ['Todas as espécies da área'],
        confianca: 0.7
      }
    };
    
    return analyses[alert.tipo] || {
      causa_provavel: 'A ser investigado',
      impacto_estimado: 'A ser avaliado',
      recomendacoes: ['Investigar causa', 'Monitorar situação'],
      plano_acao: 'Realizar diagnóstico detalhado',
      especies_afetadas: [],
      confianca: 0.5
    };
  },

  
  /**
   * Calcula desvio percentual
   */
  _calculateDeviation: function(atual, esperado) {
    try {
      const valorAtual = parseFloat(atual);
      const match = String(esperado).match(/[\d.]+/);
      
      if (isNaN(valorAtual) || !match) return 0;
      
      const valorEsperado = parseFloat(match[0]);
      if (valorEsperado === 0) return 0;
      
      return parseFloat((((valorAtual - valorEsperado) / valorEsperado) * 100).toFixed(1));
    } catch (e) {
      return 0;
    }
  },
  
  /**
   * Agrupa alertas por categoria
   */
  _groupByCategory: function(alerts) {
    const groups = {};
    alerts.forEach(a => {
      groups[a.categoria] = (groups[a.categoria] || 0) + 1;
    });
    return groups;
  },
  
  /**
   * Agrupa alertas por tipo
   */
  _groupByType: function(alerts) {
    const groups = {};
    alerts.forEach(a => {
      groups[a.tipo] = (groups[a.tipo] || 0) + 1;
    });
    return groups;
  },
  
  /**
   * Envia notificações para alertas críticos
   * @param {Array} alerts - Lista de alertas
   */
  _sendNotifications: function(alerts) {
    if (!alerts || alerts.length === 0) return;
    
    try {
      // Agrupa alertas por categoria para email consolidado
      const critical = alerts.filter(a => a.categoria === 'Crítico');
      const high = alerts.filter(a => a.categoria === 'Alto');
      
      if (critical.length === 0 && high.length === 0) return;
      
      // Monta corpo do email
      let emailBody = `
🚨 ALERTAS ECOLÓGICOS - RESERVA ARARAS

Data: ${new Date().toLocaleString('pt-BR')}
Total de Alertas: ${alerts.length}
`;
      
      if (critical.length > 0) {
        emailBody += `\n\n🔴 ALERTAS CRÍTICOS (${critical.length}):\n`;
        critical.forEach((a, i) => {
          emailBody += `\n${i + 1}. ${a.titulo}\n   ${a.descricao}\n   Urgência: ${a.urgencia}\n`;
        });
      }
      
      if (high.length > 0) {
        emailBody += `\n\n🟠 ALERTAS ALTOS (${high.length}):\n`;
        high.forEach((a, i) => {
          emailBody += `\n${i + 1}. ${a.titulo}\n   ${a.descricao}\n   Urgência: ${a.urgencia}\n`;
        });
      }
      
      emailBody += `\n\n---\nAcesse o sistema para mais detalhes e ações.`;
      
      // Envia email
      const recipients = this._getNotificationRecipients();
      if (recipients.length > 0) {
        MailApp.sendEmail({
          to: recipients.join(','),
          subject: `🚨 [ALERTA] ${critical.length} críticos, ${high.length} altos - Reserva Araras`,
          body: emailBody
        });
        
        Logger.log(`[EcologicalAlertSystem] Notificação enviada para ${recipients.length} destinatários`);
        
        // Atualiza status dos alertas
        this._markAlertsAsNotified(alerts);
      }
      
    } catch (error) {
      Logger.log(`[_sendNotifications] Erro: ${error}`);
    }
  },
  
  /**
   * Obtém destinatários de notificações
   */
  _getNotificationRecipients: function() {
    try {
      // Tenta obter do Properties Service
      const props = PropertiesService.getScriptProperties();
      const recipients = props.getProperty('ALERT_RECIPIENTS');
      
      if (recipients) {
        return recipients.split(',').map(e => e.trim());
      }
      
      // Fallback: usuário atual
      const currentUser = Session.getActiveUser().getEmail();
      return currentUser ? [currentUser] : [];
      
    } catch (e) {
      return [];
    }
  },
  
  /**
   * Marca alertas como notificados
   */
  _markAlertsAsNotified: function(alerts) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      const alertIds = alerts.map(a => a.id);
      
      for (let i = 1; i < data.length; i++) {
        if (alertIds.includes(data[i][0])) {
          sheet.getRange(i + 1, 25).setValue(true); // Notificacao_Enviada
          sheet.getRange(i + 1, 28).setValue(new Date()); // Timestamp_Notificacao
          sheet.getRange(i + 1, 29).setValue('Notificado'); // Status
        }
      }
      
    } catch (error) {
      Logger.log(`[_markAlertsAsNotified] Erro: ${error}`);
    }
  },

  
  /**
   * Obtém alertas ativos (não resolvidos)
   * @param {object} filters - Filtros opcionais
   * @returns {Array} Lista de alertas
   */
  getActiveAlerts: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return [];
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const alerts = [];
      
      for (let i = 1; i < data.length; i++) {
        const status = data[i][28]; // Status
        
        // Filtra apenas alertas ativos
        if (['Novo', 'Notificado', 'Em_Analise', 'Em_Acao'].includes(status)) {
          const alert = {
            id: data[i][0],
            timestamp_criacao: data[i][1],
            timestamp_deteccao: data[i][2],
            tipo: data[i][3],
            categoria: data[i][4],
            severidade: data[i][5],
            urgencia: data[i][6],
            parcela: data[i][7],
            zona: data[i][8],
            titulo: data[i][12],
            descricao: data[i][13],
            indicador: data[i][14],
            valor_atual: data[i][15],
            valor_esperado: data[i][16],
            status: status,
            responsavel: data[i][29]
          };
          
          // Aplica filtros
          if (filters.categoria && alert.categoria !== filters.categoria) continue;
          if (filters.tipo && alert.tipo !== filters.tipo) continue;
          if (filters.urgencia && alert.urgencia !== filters.urgencia) continue;
          
          alerts.push(alert);
        }
      }
      
      // Ordena por severidade (maior primeiro)
      return alerts.sort((a, b) => b.severidade - a.severidade);
      
    } catch (error) {
      Logger.log(`[getActiveAlerts] Erro: ${error}`);
      return [];
    }
  },
  
  /**
   * Obtém estatísticas de alertas
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          total: 0,
          ativos: 0,
          resolvidos: 0,
          por_categoria: {},
          por_tipo: {},
          tempo_medio_resolucao_horas: 0
        };
      }
      
      const data = sheet.getDataRange().getValues();
      
      const stats = {
        total: data.length - 1,
        ativos: 0,
        resolvidos: 0,
        por_categoria: {},
        por_tipo: {},
        por_status: {},
        ultimos_7_dias: 0,
        tempo_medio_resolucao_horas: 0
      };
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let totalResolucaoTime = 0;
      let resolvidosComTempo = 0;
      
      for (let i = 1; i < data.length; i++) {
        const categoria = data[i][4];
        const tipo = data[i][3];
        const status = data[i][28];
        const timestamp = new Date(data[i][1]);
        const timestampResolucao = data[i][30];
        
        // Por categoria
        stats.por_categoria[categoria] = (stats.por_categoria[categoria] || 0) + 1;
        
        // Por tipo
        stats.por_tipo[tipo] = (stats.por_tipo[tipo] || 0) + 1;
        
        // Por status
        stats.por_status[status] = (stats.por_status[status] || 0) + 1;
        
        // Ativos vs Resolvidos
        if (['Novo', 'Notificado', 'Em_Analise', 'Em_Acao'].includes(status)) {
          stats.ativos++;
        } else if (status === 'Resolvido') {
          stats.resolvidos++;
          
          // Calcula tempo de resolução
          if (timestampResolucao) {
            const resolucao = new Date(timestampResolucao);
            const tempoHoras = (resolucao - timestamp) / (1000 * 60 * 60);
            totalResolucaoTime += tempoHoras;
            resolvidosComTempo++;
          }
        }
        
        // Últimos 7 dias
        if (timestamp > sevenDaysAgo) {
          stats.ultimos_7_dias++;
        }
      }
      
      // Tempo médio de resolução
      if (resolvidosComTempo > 0) {
        stats.tempo_medio_resolucao_horas = parseFloat((totalResolucaoTime / resolvidosComTempo).toFixed(1));
      }
      
      return stats;
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Atualiza status de um alerta
   * @param {string} alertId - ID do alerta
   * @param {string} newStatus - Novo status
   * @param {string} responsavel - ID do responsável
   * @param {string} acao - Ação tomada
   * @returns {object} Resultado
   */
  updateAlertStatus: function(alertId, newStatus, responsavel = '', acao = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === alertId) {
          sheet.getRange(i + 1, 29).setValue(newStatus); // Status
          
          if (responsavel) {
            sheet.getRange(i + 1, 30).setValue(responsavel); // ID_Responsavel
          }
          
          if (acao) {
            sheet.getRange(i + 1, 31).setValue(acao); // Acao_Tomada
          }
          
          if (newStatus === 'Resolvido') {
            sheet.getRange(i + 1, 31).setValue(new Date()); // Timestamp_Resolucao
          }
          
          return { success: true, message: 'Status atualizado' };
        }
      }
      
      return { success: false, error: 'Alerta não encontrado' };
      
    } catch (error) {
      Logger.log(`[updateAlertStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Registra feedback sobre precisão do alerta
   * @param {string} alertId - ID do alerta
   * @param {string} feedback - Feedback (Preciso, Parcialmente_Preciso, Impreciso)
   * @param {string} notas - Notas adicionais
   * @returns {object} Resultado
   */
  registerFeedback: function(alertId, feedback, notas = '') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        return { success: false, error: 'Planilha não encontrada' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === alertId) {
          sheet.getRange(i + 1, 33).setValue(feedback); // Feedback_Precisao
          
          return { success: true, message: 'Feedback registrado' };
        }
      }
      
      return { success: false, error: 'Alerta não encontrado' };
      
    } catch (error) {
      Logger.log(`[registerFeedback] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cria e salva um alerta programaticamente (API pública)
   * Usado por outros serviços como InvasiveSpeciesPredictor
   * @param {object} alertData - Dados do alerta
   * @param {string} alertData.tipo - Tipo do alerta (Especie_Invasora, Biodiversidade, etc)
   * @param {number} alertData.severidade - Score de severidade (1-10)
   * @param {string} alertData.urgencia - Urgência (Imediata, 24h, 7dias, 30dias, Monitorar)
   * @param {string} alertData.titulo - Título do alerta
   * @param {string} alertData.descricao - Descrição detalhada
   * @param {string} alertData.indicador - Indicador afetado
   * @param {string} alertData.valor_atual - Valor atual
   * @param {string} alertData.valor_esperado - Valor esperado (opcional)
   * @param {string} alertData.zona - Zona afetada (opcional)
   * @param {string} alertData.parcela - Parcela afetada (opcional)
   * @param {number} alertData.latitude - Latitude (opcional)
   * @param {number} alertData.longitude - Longitude (opcional)
   * @returns {object} Resultado com ID do alerta
   */
  createAlert: function(alertData) {
    try {
      this.initializeSheet();
      
      // Cria alerta formatado
      const alert = this._createAlert({
        tipo: alertData.tipo,
        severidade: alertData.severidade,
        urgencia: alertData.urgencia,
        titulo: alertData.titulo,
        descricao: alertData.descricao,
        indicador: alertData.indicador || '',
        valor_atual: alertData.valor_atual || '',
        valor_esperado: alertData.valor_esperado || '',
        zona: alertData.zona || '',
        parcela: alertData.parcela || '',
        latitude: alertData.latitude || '',
        longitude: alertData.longitude || '',
        timestamp: alertData.timestamp || new Date()
      });
      
      // Salva o alerta
      const alertId = this._saveAlert(alert);
      
      if (!alertId) {
        return { success: false, error: 'Falha ao salvar alerta' };
      }
      
      // Envia notificação se crítico ou alto
      if (alert.categoria === 'Crítico' || alert.categoria === 'Alto') {
        this._sendNotifications([{ ...alert, id: alertId }]);
      }
      
      return {
        success: true,
        alert_id: alertId,
        categoria: alert.categoria,
        notificacao_enviada: alert.categoria === 'Crítico' || alert.categoria === 'Alto'
      };
      
    } catch (error) {
      Logger.log(`[createAlert] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P03 Alertas Ecológicos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de alertas
 * @returns {object} Resultado
 */
function apiAlertasInit() {
  return EcologicalAlertSystem.initializeSheet();
}

/**
 * Executa varredura completa de alertas
 * @returns {object} Resultado com alertas detectados
 */
function apiAlertasScan() {
  return EcologicalAlertSystem.runFullScan();
}

/**
 * Obtém alertas ativos
 * @param {object} filters - Filtros opcionais
 * @returns {Array} Lista de alertas
 */
function apiAlertasAtivos(filters) {
  return EcologicalAlertSystem.getActiveAlerts(filters || {});
}

/**
 * Obtém estatísticas de alertas
 * @returns {object} Estatísticas
 */
function apiAlertasStats() {
  return EcologicalAlertSystem.getStatistics();
}

/**
 * Atualiza status de um alerta
 * @param {string} alertId - ID do alerta
 * @param {string} status - Novo status
 * @param {string} responsavel - Responsável
 * @param {string} acao - Ação tomada
 * @returns {object} Resultado
 */
function apiAlertasUpdateStatus(alertId, status, responsavel, acao) {
  return EcologicalAlertSystem.updateAlertStatus(alertId, status, responsavel, acao);
}

/**
 * Registra feedback sobre alerta
 * @param {string} alertId - ID do alerta
 * @param {string} feedback - Feedback
 * @param {string} notas - Notas
 * @returns {object} Resultado
 */
function apiAlertasFeedback(alertId, feedback, notas) {
  return EcologicalAlertSystem.registerFeedback(alertId, feedback, notas);
}

/**
 * Configura destinatários de notificações
 * @param {Array} emails - Lista de emails
 * @returns {object} Resultado
 */
function apiAlertasSetRecipients(emails) {
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('ALERT_RECIPIENTS', emails.join(','));
    return { success: true, message: 'Destinatários configurados' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cria um alerta programaticamente
 * @param {object} alertData - Dados do alerta
 * @returns {object} Resultado com ID do alerta
 */
function apiAlertasCreate(alertData) {
  return EcologicalAlertSystem.createAlert(alertData);
}

/**
 * Trigger para varredura automática (configurar no Apps Script)
 * Recomendado: executar a cada hora
 */
function triggerAlertScan() {
  const result = EcologicalAlertSystem.runFullScan();
  Logger.log(`[triggerAlertScan] Varredura concluída: ${result.total_alerts} alertas`);
  return result;
}
