/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIG MANAGER - Gerenciamento de Configurações e Feature Flags
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Gerencia configurações dinâmicas, feature flags e histórico de alterações.
 * Extraído do Config.gs para melhor organização.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Namespace para gerenciamento de configurações e feature flags
 * @namespace ConfigManager
 */
const ConfigManager = {
  
  HISTORY_SHEET: 'CONFIG_HISTORY_RA',
  HISTORY_HEADERS: ['Timestamp', 'Usuario', 'Tipo', 'Chave', 'Valor_Anterior', 'Valor_Novo', 'Motivo'],
  
  CARBON_LIMITS: { MIN: 0.5, MAX: 20.0 },
  
  VALID_CARBON_TYPES: [
    'SAF_Cerrado', 'ILPF', 'Agrofloresta_Diversa', 
    'Recuperacao_Pastagem', 'Cerrado_Nativo', 'Monocultura'
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // HISTÓRICO
  // ═══════════════════════════════════════════════════════════════════════

  _initHistorySheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.HISTORY_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.HISTORY_SHEET);
        sheet.appendRow(this.HISTORY_HEADERS);
        sheet.getRange(1, 1, 1, this.HISTORY_HEADERS.length)
          .setBackground('#4A148C')
          .setFontColor('#FFFFFF')
          .setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      return sheet;
    } catch (error) {
      Logger.log(`[ConfigManager._initHistorySheet] Erro: ${error}`);
      return null;
    }
  },

  _logConfigChange: function(tipo, chave, valorAnterior, valorNovo, motivo) {
    try {
      const sheet = this._initHistorySheet();
      if (!sheet) return false;
      
      sheet.appendRow([
        new Date().toISOString(),
        Session.getActiveUser().getEmail() || 'sistema',
        tipo,
        chave,
        JSON.stringify(valorAnterior),
        JSON.stringify(valorNovo),
        motivo || ''
      ]);
      return true;
    } catch (error) {
      Logger.log(`[ConfigManager._logConfigChange] Erro: ${error}`);
      return false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TAXAS DE CARBONO
  // ═══════════════════════════════════════════════════════════════════════

  getCarbonRates: function() {
    return {
      success: true,
      taxas: CONFIG.CONSTANTS.CARBON_SEQUESTRATION,
      unidade: 'tCO2e/ha/ano',
      fonte: 'IPCC, Embrapa',
      tipos_validos: this.VALID_CARBON_TYPES
    };
  },

  updateCarbonRate: function(tipo, valor, motivo) {
    try {
      if (!this.VALID_CARBON_TYPES.includes(tipo)) {
        return { success: false, error: `Tipo inválido: ${tipo}` };
      }
      
      const valorNum = parseFloat(valor);
      if (isNaN(valorNum) || valorNum < this.CARBON_LIMITS.MIN || valorNum > this.CARBON_LIMITS.MAX) {
        return { success: false, error: `Valor deve estar entre ${this.CARBON_LIMITS.MIN} e ${this.CARBON_LIMITS.MAX}` };
      }
      
      const valorAnterior = CONFIG.CONSTANTS.CARBON_SEQUESTRATION[tipo];
      CONFIG.CONSTANTS.CARBON_SEQUESTRATION[tipo] = valorNum;
      
      // Persiste
      const props = PropertiesService.getScriptProperties();
      const carbonRates = JSON.parse(props.getProperty('CARBON_RATES') || '{}');
      carbonRates[tipo] = valorNum;
      props.setProperty('CARBON_RATES', JSON.stringify(carbonRates));
      
      this._logConfigChange('CONSTANT', `CARBON_SEQUESTRATION.${tipo}`, valorAnterior, valorNum, motivo);
      
      return { success: true, tipo, valor_anterior: valorAnterior, valor_novo: valorNum, timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════════════════

  getFeatureFlags: function() {
    const props = PropertiesService.getScriptProperties();
    const persistedFlags = JSON.parse(props.getProperty('FEATURE_FLAGS') || '{}');
    const flags = JSON.parse(JSON.stringify(CONFIG.FEATURE_FLAGS));
    
    // Aplica valores persistidos
    if (persistedFlags.maintenance_mode !== undefined) flags.maintenance_mode = persistedFlags.maintenance_mode;
    if (persistedFlags.maintenance_message) flags.maintenance_message = persistedFlags.maintenance_message;
    
    if (persistedFlags.modules) {
      Object.keys(persistedFlags.modules).forEach(mod => {
        if (flags.modules[mod]) flags.modules[mod].enabled = persistedFlags.modules[mod].enabled;
      });
    }
    if (persistedFlags.experimental) {
      Object.keys(persistedFlags.experimental).forEach(exp => {
        if (flags.experimental[exp]) flags.experimental[exp].enabled = persistedFlags.experimental[exp].enabled;
      });
    }
    
    return { success: true, flags, timestamp: new Date().toISOString() };
  },

  setFeatureFlag: function(flag, enabled, motivo) {
    try {
      const props = PropertiesService.getScriptProperties();
      const persistedFlags = JSON.parse(props.getProperty('FEATURE_FLAGS') || '{}');
      
      let valorAnterior = null, categoria = null;
      
      if (CONFIG.FEATURE_FLAGS.modules[flag]) {
        categoria = 'modules';
        valorAnterior = CONFIG.FEATURE_FLAGS.modules[flag].enabled;
        if (!persistedFlags.modules) persistedFlags.modules = {};
        persistedFlags.modules[flag] = { enabled: !!enabled };
        CONFIG.FEATURE_FLAGS.modules[flag].enabled = !!enabled;
      } else if (CONFIG.FEATURE_FLAGS.experimental[flag]) {
        categoria = 'experimental';
        valorAnterior = CONFIG.FEATURE_FLAGS.experimental[flag].enabled;
        if (!persistedFlags.experimental) persistedFlags.experimental = {};
        persistedFlags.experimental[flag] = { enabled: !!enabled };
        CONFIG.FEATURE_FLAGS.experimental[flag].enabled = !!enabled;
      } else {
        return { success: false, error: `Flag não encontrada: ${flag}` };
      }
      
      props.setProperty('FEATURE_FLAGS', JSON.stringify(persistedFlags));
      this._logConfigChange('FLAG', `${categoria}.${flag}`, valorAnterior, enabled, motivo);
      
      return { success: true, flag, categoria, enabled: !!enabled, valor_anterior: valorAnterior, timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODO DE MANUTENÇÃO
  // ═══════════════════════════════════════════════════════════════════════

  setMaintenanceMode: function(enabled, message) {
    try {
      const props = PropertiesService.getScriptProperties();
      const persistedFlags = JSON.parse(props.getProperty('FEATURE_FLAGS') || '{}');
      const valorAnterior = persistedFlags.maintenance_mode || false;
      
      persistedFlags.maintenance_mode = !!enabled;
      persistedFlags.maintenance_message = message || '';
      persistedFlags.maintenance_start = enabled ? new Date().toISOString() : null;
      
      CONFIG.FEATURE_FLAGS.maintenance_mode = !!enabled;
      CONFIG.FEATURE_FLAGS.maintenance_message = message || '';
      CONFIG.FEATURE_FLAGS.maintenance_start = persistedFlags.maintenance_start;
      
      props.setProperty('FEATURE_FLAGS', JSON.stringify(persistedFlags));
      this._logConfigChange('CONFIG', 'maintenance_mode', valorAnterior, enabled, message);
      
      return { success: true, maintenance_mode: !!enabled, message: message || '', timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  isMaintenanceMode: function() {
    const props = PropertiesService.getScriptProperties();
    const persistedFlags = JSON.parse(props.getProperty('FEATURE_FLAGS') || '{}');
    return {
      maintenance_mode: persistedFlags.maintenance_mode || false,
      message: persistedFlags.maintenance_message || '',
      since: persistedFlags.maintenance_start || null
    };
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDAÇÃO E RELATÓRIOS
  // ═══════════════════════════════════════════════════════════════════════

  validateConfig: function() {
    const validacao = { status: 'OK', avisos: [], erros: [], configuracoes_verificadas: 0 };
    
    try {
      validacao.configuracoes_verificadas++;
      if (!CONFIG.SPREADSHEET_ID) { validacao.erros.push('SPREADSHEET_ID não configurado'); validacao.status = 'ERRO'; }
      
      validacao.configuracoes_verificadas++;
      if (!CONFIG.DRIVE_FOLDER_ID) { validacao.avisos.push('DRIVE_FOLDER_ID não configurado'); if (validacao.status === 'OK') validacao.status = 'AVISO'; }
      
      validacao.configuracoes_verificadas++;
      if (!CONFIG.GEMINI_API_KEY) { validacao.avisos.push('GEMINI_API_KEY não configurada'); if (validacao.status === 'OK') validacao.status = 'AVISO'; }
      
      validacao.configuracoes_verificadas++;
      Object.entries(CONFIG.CONSTANTS.CARBON_SEQUESTRATION).forEach(([tipo, valor]) => {
        if (valor < this.CARBON_LIMITS.MIN || valor > this.CARBON_LIMITS.MAX) {
          validacao.avisos.push(`Taxa de carbono ${tipo} fora dos limites`);
          if (validacao.status === 'OK') validacao.status = 'AVISO';
        }
      });
      
      validacao.configuracoes_verificadas++;
      const manutencao = this.isMaintenanceMode();
      if (manutencao.maintenance_mode) {
        validacao.avisos.push(`Sistema em manutenção desde ${manutencao.since}`);
        if (validacao.status === 'OK') validacao.status = 'MANUTENCAO';
      }
    } catch (error) {
      validacao.erros.push(`Erro: ${error.message}`);
      validacao.status = 'ERRO';
    }
    
    return { success: true, validacao, timestamp: new Date().toISOString() };
  },

  getConfigHistory: function(limite) {
    try {
      const sheet = this._initHistorySheet();
      if (!sheet || sheet.getLastRow() < 2) return { success: true, historico: [], total: 0 };
      
      const data = sheet.getDataRange().getValues().slice(1);
      const lim = limite || 50;
      
      const historico = data
        .map(row => ({ timestamp: row[0], usuario: row[1], tipo: row[2], chave: row[3], valor_anterior: row[4], valor_novo: row[5], motivo: row[6] }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, lim);
      
      return { success: true, historico, total: data.length, limite_aplicado: lim };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getConfigReport: function() {
    try {
      const startTime = Date.now();
      const validacao = this.validateConfig();
      const flags = this.getFeatureFlags();
      const historico = this.getConfigHistory(10);
      const manutencao = this.isMaintenanceMode();
      const envConfig = getEnvironmentConfig();
      
      return {
        success: true,
        relatorio: {
          timestamp: new Date().toISOString(),
          versao_sistema: CONFIG.VERSION,
          app_name: CONFIG.APP_NAME,
          status_geral: manutencao.maintenance_mode ? 'MANUTENCAO' : validacao.validacao.status,
          maintenance_mode: manutencao,
          constantes_carbono: { taxas: CONFIG.CONSTANTS.CARBON_SEQUESTRATION, unidade: 'tCO2e/ha/ano', limites: this.CARBON_LIMITS },
          feature_flags: flags.success ? flags.flags : null,
          configuracoes_ambiente: {
            SPREADSHEET_ID: envConfig?.SPREADSHEET_ID ? '***configurado***' : 'NÃO CONFIGURADO',
            DRIVE_FOLDER_ID: envConfig?.DRIVE_FOLDER_ID ? '***configurado***' : 'NÃO CONFIGURADO',
            GEMINI_API_KEY: envConfig?.GEMINI_API_KEY ? '***configurado***' : 'NÃO CONFIGURADO'
          },
          limites_sistema: CONFIG.LIMITS,
          contexto_reserva: { nome: CONFIG.RESERVA_CONTEXT.nome, bioma: CONFIG.RESERVA_CONTEXT.bioma },
          validacao: validacao.validacao,
          alteracoes_recentes: historico.success ? historico.historico : [],
          tempo_processamento_ms: Date.now() - startTime
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
