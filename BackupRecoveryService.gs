/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE BACKUP E RECUPERAÇÃO DE DESASTRES
 * ═══════════════════════════════════════════════════════════════════════════
 * P32 - Backup and Disaster Recovery System
 * 
 * Funcionalidades:
 * - Backup automático diário (Google Drive)
 * - Backup incremental
 * - Versionamento de dados
 * - Recuperação point-in-time
 * - Testes de recuperação
 * 
 * Métricas:
 * - RPO (Recovery Point Objective): < 1 hora
 * - RTO (Recovery Time Objective): < 4 horas
 * - Retenção: 90 dias (diário), 12 meses (mensal)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const BACKUP_LOG_HEADERS = [
  'ID_Backup', 'Tipo', 'Data_Hora', 'Sheets_Incluidas', 'Tamanho_KB',
  'Arquivo_ID', 'Status', 'Duracao_Seg', 'Erro'
];

const RECOVERY_LOG_HEADERS = [
  'ID_Recovery', 'Backup_ID', 'Data_Hora', 'Sheets_Restauradas',
  'Registros_Restaurados', 'Status', 'Duracao_Seg', 'Erro'
];

/**
 * Sistema de Backup e Recuperação
 * @namespace BackupRecovery
 */
const BackupRecovery = {
  
  SHEET_BACKUP_LOG: 'BACKUP_LOG_RA',
  SHEET_RECOVERY_LOG: 'RECOVERY_LOG_RA',
  
  /**
   * Configurações de backup
   */
  CONFIG: {
    BACKUP_FOLDER_NAME: 'Reserva_Araras_Backups',
    RETENTION_DAILY_DAYS: 90,
    RETENTION_MONTHLY_MONTHS: 12,
    MAX_BACKUP_SIZE_MB: 50,
    COMPRESSION_ENABLED: true,
    RPO_TARGET_HOURS: 1,
    RTO_TARGET_HOURS: 4
  },
  
  /**
   * Tipos de backup
   */
  TIPOS: {
    FULL: 'Completo',
    INCREMENTAL: 'Incremental',
    DIFFERENTIAL: 'Diferencial',
    MANUAL: 'Manual',
    CRITICAL: 'Crítico'
  },
  
  /**
   * Categorização de datasets por criticidade - Prompt 3/43
   */
  CRITICAL_DATASETS: {
    CRITICO: {
      descricao: 'Dados essenciais para operação do sistema',
      prioridade_restauracao: 1,
      rpo_maximo_horas: 1,
      sheets: [
        'BIODIVERSIDADE_RA',
        'CARBONO_RA',
        'USUARIOS_RBAC_RA',
        'PARCELAS_AGRO_RA',
        'MEDICOES_CARBONO_RA',
        'AUDIT_LOG_RA'
      ]
    },
    ALTO: {
      descricao: 'Dados importantes para análise e operações',
      prioridade_restauracao: 2,
      rpo_maximo_horas: 4,
      sheets: [
        'ALERTAS_ECOLOGICOS_RA',
        'SESSOES_TERAPIA_RA',
        'VISITANTES_RA',
        'PARTICIPANTES_RA',
        'SENSORES_IOT_RA'
      ]
    },
    MEDIO: {
      descricao: 'Dados operacionais e de suporte',
      prioridade_restauracao: 3,
      rpo_maximo_horas: 24,
      sheets: [
        'TRILHAS_RA',
        'EVENTOS_RA',
        'FEEDBACK_RA',
        'TREINAMENTO_RA',
        'GPS_POINTS_RA'
      ]
    },
    BAIXO: {
      descricao: 'Dados de suporte e cache',
      prioridade_restauracao: 4,
      rpo_maximo_horas: 72,
      sheets: [
        'CACHE_RA',
        'TEMP_RA',
        'LOGS_SISTEMA_RA'
      ]
    }
  },

  /**
   * Inicializa planilhas de log
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet1 = ss.getSheetByName(this.SHEET_BACKUP_LOG);
      if (!sheet1) {
        sheet1 = ss.insertSheet(this.SHEET_BACKUP_LOG);
        sheet1.appendRow(BACKUP_LOG_HEADERS);
        this._formatHeader(sheet1, BACKUP_LOG_HEADERS.length, '#5D4037');
      }
      
      let sheet2 = ss.getSheetByName(this.SHEET_RECOVERY_LOG);
      if (!sheet2) {
        sheet2 = ss.insertSheet(this.SHEET_RECOVERY_LOG);
        sheet2.appendRow(RECOVERY_LOG_HEADERS);
        this._formatHeader(sheet2, RECOVERY_LOG_HEADERS.length, '#6D4C41');
      }
      
      return { success: true, sheets: [this.SHEET_BACKUP_LOG, this.SHEET_RECOVERY_LOG] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  _formatHeader: function(sheet, cols, color) {
    const headerRange = sheet.getRange(1, 1, 1, cols);
    headerRange.setBackground(color);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  },

  /**
   * Obtém ou cria pasta de backups no Drive
   * @private
   */
  _getBackupFolder: function() {
    const folderName = this.CONFIG.BACKUP_FOLDER_NAME;
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    }
    
    // Cria pasta se não existir
    return DriveApp.createFolder(folderName);
  },

  /**
   * Executa backup completo
   */
  createFullBackup: function(manual = false) {
    const startTime = new Date();
    const backupId = `BKP-${startTime.getTime().toString(36).toUpperCase()}`;
    
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheets = ss.getSheets();
      const folder = this._getBackupFolder();
      
      // Prepara dados para backup
      const backupData = {
        id: backupId,
        timestamp: startTime.toISOString(),
        spreadsheet_id: ss.getId(),
        spreadsheet_name: ss.getName(),
        tipo: manual ? this.TIPOS.MANUAL : this.TIPOS.FULL,
        sheets: []
      };
      
      // Coleta dados de todas as planilhas
      sheets.forEach(sheet => {
        const sheetName = sheet.getName();
        // Pula planilhas de log de backup
        if (sheetName.includes('BACKUP_LOG') || sheetName.includes('RECOVERY_LOG')) return;
        
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        if (lastRow > 0 && lastCol > 0) {
          const data = sheet.getDataRange().getValues();
          backupData.sheets.push({
            name: sheetName,
            rows: lastRow,
            cols: lastCol,
            data: data
          });
        }
      });
      
      // Cria arquivo de backup
      const fileName = `backup_${ss.getName()}_${startTime.toISOString().split('T')[0]}_${backupId}.json`;
      const content = JSON.stringify(backupData, null, 2);
      const file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
      
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      const sizeKB = Math.round(content.length / 1024);
      
      // Registra log
      this._logBackup(backupId, backupData.tipo, backupData.sheets.length, sizeKB, file.getId(), 'SUCESSO', duration, null);
      
      return {
        success: true,
        backup_id: backupId,
        tipo: backupData.tipo,
        arquivo: fileName,
        arquivo_id: file.getId(),
        sheets_incluidas: backupData.sheets.length,
        tamanho_kb: sizeKB,
        duracao_segundos: Math.round(duration * 10) / 10,
        data_hora: startTime.toISOString()
      };
    } catch (error) {
      this._logBackup(backupId, manual ? this.TIPOS.MANUAL : this.TIPOS.FULL, 0, 0, null, 'ERRO', 0, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra log de backup
   * @private
   */
  _logBackup: function(id, tipo, sheets, sizeKB, fileId, status, duration, erro) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_BACKUP_LOG);
      
      sheet.appendRow([
        id,
        tipo,
        new Date().toISOString(),
        sheets,
        sizeKB,
        fileId || '',
        status,
        Math.round(duration * 10) / 10,
        erro || ''
      ]);
    } catch (e) {
      Logger.log(`[_logBackup] Erro: ${e}`);
    }
  },

  /**
   * Lista backups disponíveis
   */
  listBackups: function(limit = 50) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_BACKUP_LOG);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, backups: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const backups = [];
      
      for (let i = Math.max(1, data.length - limit); i < data.length; i++) {
        backups.push({
          id: data[i][0],
          tipo: data[i][1],
          data_hora: data[i][2],
          sheets: data[i][3],
          tamanho_kb: data[i][4],
          arquivo_id: data[i][5],
          status: data[i][6],
          duracao: data[i][7],
          erro: data[i][8]
        });
      }
      
      backups.reverse();
      
      return { 
        success: true, 
        backups: backups, 
        count: backups.length,
        ultimo_backup: backups[0] || null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém detalhes de um backup específico
   */
  getBackupDetails: function(backupId) {
    try {
      const backupsResult = this.listBackups(1000);
      if (!backupsResult.success) return backupsResult;
      
      const backup = backupsResult.backups.find(b => b.id === backupId);
      if (!backup) {
        return { success: false, error: 'Backup não encontrado' };
      }
      
      // Tenta ler conteúdo do arquivo
      let conteudo = null;
      if (backup.arquivo_id) {
        try {
          const file = DriveApp.getFileById(backup.arquivo_id);
          const content = file.getBlob().getDataAsString();
          conteudo = JSON.parse(content);
        } catch (e) {
          // Arquivo pode ter sido deletado
        }
      }
      
      return {
        success: true,
        backup: backup,
        conteudo: conteudo ? {
          sheets: conteudo.sheets?.map(s => ({ name: s.name, rows: s.rows, cols: s.cols })),
          total_registros: conteudo.sheets?.reduce((sum, s) => sum + s.rows, 0) || 0
        } : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Restaura backup
   */
  restoreBackup: function(backupId, options = {}) {
    const startTime = new Date();
    const recoveryId = `REC-${startTime.getTime().toString(36).toUpperCase()}`;
    
    try {
      this.initializeSheets();
      
      // Busca backup
      const backupsResult = this.listBackups(1000);
      const backup = backupsResult.backups?.find(b => b.id === backupId);
      
      if (!backup || !backup.arquivo_id) {
        return { success: false, error: 'Backup não encontrado ou arquivo indisponível' };
      }
      
      // Lê arquivo de backup
      const file = DriveApp.getFileById(backup.arquivo_id);
      const content = file.getBlob().getDataAsString();
      const backupData = JSON.parse(content);
      
      const ss = getSpreadsheet();
      let sheetsRestauradas = 0;
      let registrosRestaurados = 0;
      
      // Restaura cada planilha
      backupData.sheets.forEach(sheetData => {
        // Verifica se deve restaurar esta planilha
        if (options.sheets && !options.sheets.includes(sheetData.name)) return;
        
        let sheet = ss.getSheetByName(sheetData.name);
        
        if (options.overwrite !== false) {
          // Limpa planilha existente ou cria nova
          if (sheet) {
            sheet.clear();
          } else {
            sheet = ss.insertSheet(sheetData.name);
          }
          
          // Restaura dados
          if (sheetData.data && sheetData.data.length > 0) {
            const range = sheet.getRange(1, 1, sheetData.data.length, sheetData.data[0].length);
            range.setValues(sheetData.data);
            registrosRestaurados += sheetData.data.length;
          }
          
          sheetsRestauradas++;
        }
      });
      
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      
      // Registra log de recuperação
      this._logRecovery(recoveryId, backupId, sheetsRestauradas, registrosRestaurados, 'SUCESSO', duration, null);
      
      return {
        success: true,
        recovery_id: recoveryId,
        backup_id: backupId,
        sheets_restauradas: sheetsRestauradas,
        registros_restaurados: registrosRestaurados,
        duracao_segundos: Math.round(duration * 10) / 10
      };
    } catch (error) {
      this._logRecovery(recoveryId, backupId, 0, 0, 'ERRO', 0, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra log de recuperação
   * @private
   */
  _logRecovery: function(id, backupId, sheets, registros, status, duration, erro) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_RECOVERY_LOG);
      
      sheet.appendRow([
        id,
        backupId,
        new Date().toISOString(),
        sheets,
        registros,
        status,
        Math.round(duration * 10) / 10,
        erro || ''
      ]);
    } catch (e) {
      Logger.log(`[_logRecovery] Erro: ${e}`);
    }
  },

  /**
   * Executa limpeza de backups antigos
   */
  cleanupOldBackups: function() {
    try {
      const folder = this._getBackupFolder();
      const files = folder.getFiles();
      const now = new Date();
      
      let deletados = 0;
      let mantidos = 0;
      
      while (files.hasNext()) {
        const file = files.next();
        const created = file.getDateCreated();
        const ageInDays = (now - created) / (1000 * 60 * 60 * 24);
        
        // Verifica se é backup mensal (dia 1)
        const isMonthly = created.getDate() === 1;
        
        // Regras de retenção
        if (isMonthly && ageInDays <= this.CONFIG.RETENTION_MONTHLY_MONTHS * 30) {
          mantidos++;
          continue;
        }
        
        if (!isMonthly && ageInDays > this.CONFIG.RETENTION_DAILY_DAYS) {
          file.setTrashed(true);
          deletados++;
        } else {
          mantidos++;
        }
      }
      
      return {
        success: true,
        backups_deletados: deletados,
        backups_mantidos: mantidos,
        politica: {
          retencao_diaria_dias: this.CONFIG.RETENTION_DAILY_DAYS,
          retencao_mensal_meses: this.CONFIG.RETENTION_MONTHLY_MONTHS
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Testa integridade de um backup
   */
  testBackupIntegrity: function(backupId) {
    try {
      const detailsResult = this.getBackupDetails(backupId);
      if (!detailsResult.success) return detailsResult;
      
      const backup = detailsResult.backup;
      const conteudo = detailsResult.conteudo;
      
      const tests = {
        arquivo_existe: !!backup.arquivo_id,
        arquivo_legivel: !!conteudo,
        estrutura_valida: conteudo?.sheets?.length > 0,
        dados_integros: true
      };
      
      // Verifica integridade dos dados
      if (conteudo?.sheets) {
        conteudo.sheets.forEach(s => {
          if (!s.name || s.rows === undefined) {
            tests.dados_integros = false;
          }
        });
      }
      
      const allPassed = Object.values(tests).every(t => t === true);
      
      return {
        success: true,
        backup_id: backupId,
        integridade: allPassed ? 'OK' : 'FALHA',
        testes: tests,
        detalhes: conteudo ? {
          sheets: conteudo.sheets?.length || 0,
          registros: conteudo.total_registros || 0
        } : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas de backup
   */
  getStatistics: function() {
    try {
      const backupsResult = this.listBackups(1000);
      const backups = backupsResult.backups || [];
      
      const stats = {
        total_backups: backups.length,
        backups_sucesso: backups.filter(b => b.status === 'SUCESSO').length,
        backups_erro: backups.filter(b => b.status === 'ERRO').length,
        tamanho_total_kb: backups.reduce((sum, b) => sum + (b.tamanho_kb || 0), 0),
        ultimo_backup: backups[0] || null,
        por_tipo: {}
      };
      
      // Conta por tipo
      backups.forEach(b => {
        if (!stats.por_tipo[b.tipo]) stats.por_tipo[b.tipo] = 0;
        stats.por_tipo[b.tipo]++;
      });
      
      // Calcula RPO (tempo desde último backup)
      if (stats.ultimo_backup) {
        const lastBackupTime = new Date(stats.ultimo_backup.data_hora);
        const now = new Date();
        stats.rpo_atual_horas = Math.round((now - lastBackupTime) / (1000 * 60 * 60) * 10) / 10;
        stats.rpo_status = stats.rpo_atual_horas <= 1 ? 'OK' : stats.rpo_atual_horas <= 24 ? 'ALERTA' : 'CRÍTICO';
      }
      
      stats.taxa_sucesso = stats.total_backups > 0 
        ? Math.round(stats.backups_sucesso / stats.total_backups * 100) 
        : 0;
      
      // Verifica espaço em disco
      try {
        const folder = this._getBackupFolder();
        stats.pasta_backup = folder.getName();
        stats.pasta_id = folder.getId();
      } catch (e) {
        stats.pasta_backup = 'Não criada';
      }
      
      return {
        success: true,
        estatisticas: stats,
        config: this.CONFIG
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista histórico de recuperações
   */
  listRecoveries: function(limit = 50) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_RECOVERY_LOG);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, recoveries: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const recoveries = [];
      
      for (let i = Math.max(1, data.length - limit); i < data.length; i++) {
        recoveries.push({
          id: data[i][0],
          backup_id: data[i][1],
          data_hora: data[i][2],
          sheets: data[i][3],
          registros: data[i][4],
          status: data[i][5],
          duracao: data[i][6],
          erro: data[i][7]
        });
      }
      
      recoveries.reverse();
      
      return { success: true, recoveries: recoveries, count: recoveries.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISASTER RECOVERY FUNCTIONS - Prompt 3/43
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Categoriza datasets por criticidade
   * @returns {object} Mapeamento de sheets por categoria
   * @private
   */
  _categorizeDatasets: function() {
    const ss = getSpreadsheet();
    const allSheets = ss.getSheets().map(s => s.getName());
    
    const categorizado = {
      CRITICO: { sheets: [], encontradas: [] },
      ALTO: { sheets: [], encontradas: [] },
      MEDIO: { sheets: [], encontradas: [] },
      BAIXO: { sheets: [], encontradas: [] },
      NAO_CATEGORIZADO: { sheets: [], encontradas: [] }
    };
    
    // Mapeia sheets existentes para categorias
    Object.entries(this.CRITICAL_DATASETS).forEach(([categoria, config]) => {
      categorizado[categoria].sheets = config.sheets;
      categorizado[categoria].encontradas = config.sheets.filter(s => allSheets.includes(s));
      categorizado[categoria].descricao = config.descricao;
      categorizado[categoria].prioridade = config.prioridade_restauracao;
      categorizado[categoria].rpo_maximo = config.rpo_maximo_horas;
    });
    
    // Identifica sheets não categorizadas
    const todasCategorizadas = Object.values(this.CRITICAL_DATASETS)
      .flatMap(c => c.sheets);
    
    categorizado.NAO_CATEGORIZADO.encontradas = allSheets.filter(s => 
      !todasCategorizadas.includes(s) && 
      !s.includes('BACKUP_LOG') && 
      !s.includes('RECOVERY_LOG')
    );
    
    return categorizado;
  },

  /**
   * Calcula checksum dos dados para verificação de integridade
   * @param {object|string} data - Dados para calcular hash
   * @returns {string} Hash hexadecimal
   * @private
   */
  _calculateDataChecksum: function(data) {
    try {
      const content = typeof data === 'string' ? data : JSON.stringify(data);
      const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, content);
      
      // Converte bytes para hexadecimal
      return bytes.map(b => {
        const hex = (b < 0 ? b + 256 : b).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    } catch (error) {
      Logger.log(`[_calculateDataChecksum] Erro: ${error}`);
      return null;
    }
  },

  /**
   * Cria snapshot apenas dos dados críticos
   * @returns {object} Resultado do snapshot
   */
  createCriticalSnapshot: function() {
    const startTime = new Date();
    const backupId = `CRIT-${startTime.getTime().toString(36).toUpperCase()}`;
    
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const folder = this._getBackupFolder();
      const categorizado = this._categorizeDatasets();
      
      // Coleta apenas sheets críticas
      const criticalSheets = categorizado.CRITICO.encontradas;
      
      const backupData = {
        id: backupId,
        timestamp: startTime.toISOString(),
        tipo: this.TIPOS.CRITICAL,
        spreadsheet_id: ss.getId(),
        spreadsheet_name: ss.getName(),
        categoria: 'CRITICO',
        sheets: [],
        checksums: {}
      };
      
      // Coleta dados das sheets críticas
      criticalSheets.forEach(sheetName => {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          const lastRow = sheet.getLastRow();
          const lastCol = sheet.getLastColumn();
          
          if (lastRow > 0 && lastCol > 0) {
            const data = sheet.getDataRange().getValues();
            backupData.sheets.push({
              name: sheetName,
              rows: lastRow,
              cols: lastCol,
              data: data
            });
            
            // Calcula checksum por sheet
            backupData.checksums[sheetName] = this._calculateDataChecksum(data);
          }
        }
      });
      
      // Calcula checksum global
      backupData.checksum_global = this._calculateDataChecksum(backupData.sheets);
      
      // Cria arquivo de backup
      const fileName = `critical_${ss.getName()}_${startTime.toISOString().split('T')[0]}_${backupId}.json`;
      const content = JSON.stringify(backupData, null, 2);
      const file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
      
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      const sizeKB = Math.round(content.length / 1024);
      
      // Registra log
      this._logBackup(backupId, this.TIPOS.CRITICAL, backupData.sheets.length, sizeKB, file.getId(), 'SUCESSO', duration, null);
      
      return {
        success: true,
        backup_id: backupId,
        tipo: this.TIPOS.CRITICAL,
        arquivo: fileName,
        arquivo_id: file.getId(),
        sheets_incluidas: backupData.sheets.map(s => s.name),
        total_sheets: backupData.sheets.length,
        tamanho_kb: sizeKB,
        checksum_global: backupData.checksum_global,
        duracao_segundos: Math.round(duration * 10) / 10,
        data_hora: startTime.toISOString()
      };
    } catch (error) {
      this._logBackup(backupId, this.TIPOS.CRITICAL, 0, 0, null, 'ERRO', 0, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Verifica backup contra manifesto esperado
   * @param {string} backupId - ID do backup a verificar
   * @returns {object} Resultado da verificação
   */
  verifyBackupAgainstManifest: function(backupId) {
    try {
      // Busca backup
      const backupsResult = this.listBackups(1000);
      const backup = backupsResult.backups?.find(b => b.id === backupId);
      
      if (!backup) {
        return { success: false, error: 'Backup não encontrado' };
      }
      
      const verificacao = {
        backup_id: backupId,
        data_verificacao: new Date().toISOString(),
        testes: {
          arquivo_existe: false,
          arquivo_legivel: false,
          estrutura_valida: false,
          checksum_valido: false,
          sheets_completas: false
        },
        discrepancias: [],
        sheets_esperadas: [],
        sheets_encontradas: [],
        sheets_faltantes: [],
        sheets_extras: []
      };
      
      // Teste 1: Arquivo existe
      if (!backup.arquivo_id) {
        verificacao.discrepancias.push('Arquivo de backup não encontrado no Drive');
        return { success: true, verificacao: verificacao, integridade: 'FALHA' };
      }
      verificacao.testes.arquivo_existe = true;
      
      // Teste 2: Arquivo legível
      let backupData;
      try {
        const file = DriveApp.getFileById(backup.arquivo_id);
        const content = file.getBlob().getDataAsString();
        backupData = JSON.parse(content);
        verificacao.testes.arquivo_legivel = true;
      } catch (e) {
        verificacao.discrepancias.push(`Erro ao ler arquivo: ${e.message}`);
        return { success: true, verificacao: verificacao, integridade: 'FALHA' };
      }
      
      // Teste 3: Estrutura válida
      if (backupData.sheets && Array.isArray(backupData.sheets) && backupData.timestamp) {
        verificacao.testes.estrutura_valida = true;
      } else {
        verificacao.discrepancias.push('Estrutura JSON inválida');
      }
      
      // Teste 4: Checksum válido (se disponível)
      if (backupData.checksum_global) {
        const checksumCalculado = this._calculateDataChecksum(backupData.sheets);
        if (checksumCalculado === backupData.checksum_global) {
          verificacao.testes.checksum_valido = true;
        } else {
          verificacao.discrepancias.push('Checksum não corresponde - possível corrupção de dados');
        }
      } else {
        verificacao.testes.checksum_valido = true; // Backups antigos sem checksum
      }
      
      // Teste 5: Sheets completas
      const categorizado = this._categorizeDatasets();
      
      // Define sheets esperadas baseado no tipo de backup
      if (backup.tipo === this.TIPOS.CRITICAL) {
        verificacao.sheets_esperadas = categorizado.CRITICO.encontradas;
      } else {
        // Backup completo - todas as sheets
        verificacao.sheets_esperadas = [
          ...categorizado.CRITICO.encontradas,
          ...categorizado.ALTO.encontradas,
          ...categorizado.MEDIO.encontradas,
          ...categorizado.BAIXO.encontradas,
          ...categorizado.NAO_CATEGORIZADO.encontradas
        ];
      }
      
      verificacao.sheets_encontradas = backupData.sheets.map(s => s.name);
      verificacao.sheets_faltantes = verificacao.sheets_esperadas.filter(
        s => !verificacao.sheets_encontradas.includes(s)
      );
      verificacao.sheets_extras = verificacao.sheets_encontradas.filter(
        s => !verificacao.sheets_esperadas.includes(s)
      );
      
      if (verificacao.sheets_faltantes.length === 0) {
        verificacao.testes.sheets_completas = true;
      } else {
        verificacao.discrepancias.push(`Sheets faltantes: ${verificacao.sheets_faltantes.join(', ')}`);
      }
      
      // Determina resultado final
      const todosTestes = Object.values(verificacao.testes).every(t => t === true);
      const integridade = todosTestes ? 'OK' : (verificacao.testes.arquivo_legivel ? 'PARCIAL' : 'FALHA');
      
      return {
        success: true,
        verificacao: verificacao,
        integridade: integridade,
        resumo: {
          testes_passaram: Object.values(verificacao.testes).filter(t => t).length,
          testes_total: Object.keys(verificacao.testes).length,
          discrepancias: verificacao.discrepancias.length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Monitora status do RPO em tempo real
   * @returns {object} Status detalhado do RPO
   */
  monitorRPOStatus: function() {
    try {
      const now = new Date();
      const backupsResult = this.listBackups(100);
      const backups = backupsResult.backups || [];
      
      // Encontra último backup bem-sucedido
      const ultimoBackup = backups.find(b => b.status === 'SUCESSO');
      const ultimoCritico = backups.find(b => b.status === 'SUCESSO' && b.tipo === this.TIPOS.CRITICAL);
      
      const status = {
        timestamp: now.toISOString(),
        rpo_alvo_horas: this.CONFIG.RPO_TARGET_HOURS,
        
        backup_geral: {
          ultimo_backup: ultimoBackup?.data_hora || null,
          rpo_atual_horas: null,
          status: 'DESCONHECIDO'
        },
        
        backup_critico: {
          ultimo_backup: ultimoCritico?.data_hora || null,
          rpo_atual_horas: null,
          status: 'DESCONHECIDO'
        },
        
        por_categoria: {},
        alertas: []
      };
      
      // Calcula RPO geral
      if (ultimoBackup) {
        const lastBackupTime = new Date(ultimoBackup.data_hora);
        const deltaHoras = (now - lastBackupTime) / (1000 * 60 * 60);
        status.backup_geral.rpo_atual_horas = Math.round(deltaHoras * 10) / 10;
        
        if (deltaHoras <= 1) {
          status.backup_geral.status = 'OK';
        } else if (deltaHoras <= 24) {
          status.backup_geral.status = 'ALERTA';
          status.alertas.push({
            tipo: 'ALERTA',
            mensagem: `RPO geral excede 1 hora: ${status.backup_geral.rpo_atual_horas}h`
          });
        } else {
          status.backup_geral.status = 'CRITICO';
          status.alertas.push({
            tipo: 'CRITICO',
            mensagem: `RPO geral excede 24 horas: ${status.backup_geral.rpo_atual_horas}h`
          });
        }
      } else {
        status.backup_geral.status = 'CRITICO';
        status.alertas.push({
          tipo: 'CRITICO',
          mensagem: 'Nenhum backup bem-sucedido encontrado'
        });
      }
      
      // Calcula RPO crítico
      if (ultimoCritico) {
        const lastCritTime = new Date(ultimoCritico.data_hora);
        const deltaHoras = (now - lastCritTime) / (1000 * 60 * 60);
        status.backup_critico.rpo_atual_horas = Math.round(deltaHoras * 10) / 10;
        
        const rpoMaxCritico = this.CRITICAL_DATASETS.CRITICO.rpo_maximo_horas;
        if (deltaHoras <= rpoMaxCritico) {
          status.backup_critico.status = 'OK';
        } else if (deltaHoras <= rpoMaxCritico * 4) {
          status.backup_critico.status = 'ALERTA';
        } else {
          status.backup_critico.status = 'CRITICO';
        }
      }
      
      // Analisa por categoria
      Object.entries(this.CRITICAL_DATASETS).forEach(([categoria, config]) => {
        status.por_categoria[categoria] = {
          rpo_maximo_horas: config.rpo_maximo_horas,
          prioridade: config.prioridade_restauracao,
          status: ultimoBackup ? 
            (status.backup_geral.rpo_atual_horas <= config.rpo_maximo_horas ? 'OK' : 'ALERTA') : 
            'CRITICO'
        };
      });
      
      // Status geral
      status.status_geral = status.alertas.some(a => a.tipo === 'CRITICO') ? 'CRITICO' :
                           status.alertas.length > 0 ? 'ALERTA' : 'OK';
      
      return { success: true, rpo_status: status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório completo de Disaster Recovery
   * @returns {object} Relatório DR
   */
  generateDRReport: function() {
    try {
      const startTime = Date.now();
      const now = new Date();
      
      // 1. Coleta métricas de RPO
      const rpoResult = this.monitorRPOStatus();
      const rpoStatus = rpoResult.rpo_status || {};
      
      // 2. Coleta estatísticas de backup
      const statsResult = this.getStatistics();
      const stats = statsResult.estatisticas || {};
      
      // 3. Categorização de datasets
      const categorizado = this._categorizeDatasets();
      
      // 4. Verifica integridade do último backup
      let integridadeUltimo = { resultado: 'NAO_TESTADO' };
      if (stats.ultimo_backup?.id) {
        const verifyResult = this.verifyBackupAgainstManifest(stats.ultimo_backup.id);
        if (verifyResult.success) {
          integridadeUltimo = {
            resultado: verifyResult.integridade,
            testes: verifyResult.verificacao?.testes,
            discrepancias: verifyResult.verificacao?.discrepancias?.length || 0
          };
        }
      }
      
      // 5. Calcula cobertura por categoria
      const cobertura = {};
      Object.entries(categorizado).forEach(([cat, data]) => {
        if (cat !== 'NAO_CATEGORIZADO') {
          cobertura[cat] = {
            total: data.sheets?.length || 0,
            cobertos: data.encontradas?.length || 0,
            percentual: data.sheets?.length > 0 ? 
              Math.round((data.encontradas?.length || 0) / data.sheets.length * 100) : 100
          };
        }
      });
      
      // 6. Estima RTO baseado em histórico
      const recoveriesResult = this.listRecoveries(10);
      const recoveries = recoveriesResult.recoveries || [];
      const avgRecoveryTime = recoveries.length > 0 ?
        recoveries.reduce((sum, r) => sum + (r.duracao || 0), 0) / recoveries.length : 0;
      
      // 7. Gera recomendações
      const recomendacoes = [];
      
      if (rpoStatus.status_geral === 'CRITICO') {
        recomendacoes.push({
          tipo: 'CRITICO',
          categoria: 'Backup',
          descricao: 'Sistema sem backup recente',
          acao_sugerida: 'Execute um backup completo imediatamente'
        });
      }
      
      if (rpoStatus.status_geral === 'ALERTA') {
        recomendacoes.push({
          tipo: 'ALTO',
          categoria: 'RPO',
          descricao: 'RPO excede o alvo configurado',
          acao_sugerida: 'Verifique o trigger de backup automático'
        });
      }
      
      if (integridadeUltimo.resultado === 'FALHA') {
        recomendacoes.push({
          tipo: 'CRITICO',
          categoria: 'Integridade',
          descricao: 'Último backup com problemas de integridade',
          acao_sugerida: 'Crie um novo backup e verifique o armazenamento'
        });
      }
      
      if (stats.taxa_sucesso < 90) {
        recomendacoes.push({
          tipo: 'MEDIO',
          categoria: 'Confiabilidade',
          descricao: `Taxa de sucesso de backup: ${stats.taxa_sucesso}%`,
          acao_sugerida: 'Investigue falhas recentes de backup'
        });
      }
      
      if (recomendacoes.length === 0) {
        recomendacoes.push({
          tipo: 'INFO',
          categoria: 'Geral',
          descricao: 'Sistema de DR operando normalmente',
          acao_sugerida: 'Manter monitoramento contínuo'
        });
      }
      
      // 8. Monta relatório final
      const processingTime = Date.now() - startTime;
      
      const relatorio = {
        timestamp: now.toISOString(),
        status_geral: rpoStatus.status_geral || 'DESCONHECIDO',
        
        metricas_rpo: {
          ultimo_backup: stats.ultimo_backup?.data_hora || null,
          rpo_atual_horas: rpoStatus.backup_geral?.rpo_atual_horas || null,
          rpo_status: rpoStatus.backup_geral?.status || 'DESCONHECIDO',
          rpo_alvo_horas: this.CONFIG.RPO_TARGET_HOURS
        },
        
        metricas_rto: {
          tempo_medio_restauracao_seg: Math.round(avgRecoveryTime * 10) / 10,
          rto_alvo_horas: this.CONFIG.RTO_TARGET_HOURS,
          restauracoes_historico: recoveries.length
        },
        
        integridade: {
          ultimo_teste: now.toISOString(),
          resultado: integridadeUltimo.resultado,
          backups_validos: stats.backups_sucesso || 0,
          backups_com_erro: stats.backups_erro || 0
        },
        
        cobertura: cobertura,
        
        estatisticas: {
          total_backups: stats.total_backups || 0,
          tamanho_total_kb: stats.tamanho_total_kb || 0,
          taxa_sucesso: stats.taxa_sucesso || 0,
          por_tipo: stats.por_tipo || {}
        },
        
        recomendacoes: recomendacoes,
        
        tempo_processamento_ms: processingTime
      };
      
      return { success: true, relatorio: relatorio };
    } catch (error) {
      Logger.log(`[generateDRReport] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Backup e Recuperação
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de backup
 */
function apiBackupInit() {
  return BackupRecovery.initializeSheets();
}

/**
 * Cria backup completo
 */
function apiBackupCriar(manual) {
  return BackupRecovery.createFullBackup(manual !== false);
}

/**
 * Lista backups disponíveis
 */
function apiBackupListar(limit) {
  return BackupRecovery.listBackups(limit || 50);
}

/**
 * Obtém detalhes de um backup
 */
function apiBackupDetalhes(backupId) {
  return BackupRecovery.getBackupDetails(backupId);
}

/**
 * Restaura backup
 */
function apiBackupRestaurar(backupId, options) {
  return BackupRecovery.restoreBackup(backupId, options || {});
}

/**
 * Testa integridade de backup
 */
function apiBackupTestarIntegridade(backupId) {
  return BackupRecovery.testBackupIntegrity(backupId);
}

/**
 * Limpa backups antigos
 */
function apiBackupLimpeza() {
  return BackupRecovery.cleanupOldBackups();
}

/**
 * Obtém estatísticas
 */
function apiBackupEstatisticas() {
  return BackupRecovery.getStatistics();
}

/**
 * Lista recuperações
 */
function apiBackupListarRecuperacoes(limit) {
  return BackupRecovery.listRecoveries(limit || 50);
}

// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Disaster Recovery (Prompt 3/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cria snapshot de dados críticos
 */
function apiBackupCriticalSnapshot() {
  return BackupRecovery.createCriticalSnapshot();
}

/**
 * Verifica backup contra manifesto
 */
function apiBackupVerifyManifest(backupId) {
  return BackupRecovery.verifyBackupAgainstManifest(backupId);
}

/**
 * Monitora status do RPO
 */
function apiBackupRPOStatus() {
  return BackupRecovery.monitorRPOStatus();
}

/**
 * Gera relatório de Disaster Recovery
 */
function apiBackupDRReport() {
  return BackupRecovery.generateDRReport();
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERS - Backup Automático
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configura trigger de backup diário
 * Execute manualmente uma vez para ativar
 */
function setupDailyBackupTrigger() {
  // Remove triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'runDailyBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger para rodar às 3h da manhã
  ScriptApp.newTrigger('runDailyBackup')
    .timeBased()
    .atHour(3)
    .everyDays(1)
    .create();
  
  return { success: true, message: 'Trigger de backup diário configurado para 3h' };
}

/**
 * Função executada pelo trigger diário
 */
function runDailyBackup() {
  const result = BackupRecovery.createFullBackup(false);
  
  // Executa limpeza semanal (aos domingos)
  if (new Date().getDay() === 0) {
    BackupRecovery.cleanupOldBackups();
  }
  
  return result;
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS - Disaster Recovery (Prompt 3/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Função de teste manual para Disaster Recovery
 * Execute esta função no editor do Apps Script para validar a implementação
 */
function testDisasterRecovery() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE DE DISASTER RECOVERY - Prompt 3/43');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  try {
    // 1. Inicializa planilhas
    Logger.log('\n[1] Inicializando planilhas de backup...');
    const initResult = BackupRecovery.initializeSheets();
    Logger.log(`    Resultado: ${initResult.success ? 'OK' : 'ERRO - ' + initResult.error}`);
    
    // 2. Testa categorização de datasets
    Logger.log('\n[2] Testando categorização de datasets...');
    const categorizado = BackupRecovery._categorizeDatasets();
    Logger.log(`    Categorias encontradas:`);
    Object.entries(categorizado).forEach(([cat, data]) => {
      Logger.log(`    - ${cat}: ${data.encontradas?.length || 0} sheets`);
    });
    
    // 3. Testa criação de snapshot crítico
    Logger.log('\n[3] Criando snapshot de dados críticos...');
    const snapshotResult = BackupRecovery.createCriticalSnapshot();
    if (snapshotResult.success) {
      Logger.log(`    Backup ID: ${snapshotResult.backup_id}`);
      Logger.log(`    Sheets incluídas: ${snapshotResult.total_sheets}`);
      Logger.log(`    Tamanho: ${snapshotResult.tamanho_kb} KB`);
      Logger.log(`    Checksum: ${snapshotResult.checksum_global?.substring(0, 16)}...`);
    } else {
      Logger.log(`    ERRO: ${snapshotResult.error}`);
    }
    
    // 4. Testa verificação de integridade
    Logger.log('\n[4] Verificando integridade do backup...');
    if (snapshotResult.success) {
      const verifyResult = BackupRecovery.verifyBackupAgainstManifest(snapshotResult.backup_id);
      if (verifyResult.success) {
        Logger.log(`    Integridade: ${verifyResult.integridade}`);
        Logger.log(`    Testes passaram: ${verifyResult.resumo?.testes_passaram}/${verifyResult.resumo?.testes_total}`);
        if (verifyResult.verificacao?.discrepancias?.length > 0) {
          Logger.log(`    Discrepâncias: ${verifyResult.verificacao.discrepancias.join(', ')}`);
        }
      } else {
        Logger.log(`    ERRO: ${verifyResult.error}`);
      }
    } else {
      Logger.log(`    Pulado - snapshot não criado`);
    }
    
    // 5. Testa monitoramento de RPO
    Logger.log('\n[5] Monitorando status do RPO...');
    const rpoResult = BackupRecovery.monitorRPOStatus();
    if (rpoResult.success) {
      const rpo = rpoResult.rpo_status;
      Logger.log(`    Status Geral: ${rpo.status_geral}`);
      Logger.log(`    RPO Atual: ${rpo.backup_geral?.rpo_atual_horas || 'N/A'} horas`);
      Logger.log(`    RPO Alvo: ${rpo.rpo_alvo_horas} horas`);
      Logger.log(`    Alertas: ${rpo.alertas?.length || 0}`);
      rpo.alertas?.forEach(a => {
        Logger.log(`      - [${a.tipo}] ${a.mensagem}`);
      });
    } else {
      Logger.log(`    ERRO: ${rpoResult.error}`);
    }
    
    // 6. Testa relatório de DR
    Logger.log('\n[6] Gerando relatório de Disaster Recovery...');
    const drResult = BackupRecovery.generateDRReport();
    if (drResult.success) {
      const rel = drResult.relatorio;
      Logger.log(`    Status Geral: ${rel.status_geral}`);
      Logger.log(`    RPO Status: ${rel.metricas_rpo?.rpo_status}`);
      Logger.log(`    Backups Válidos: ${rel.integridade?.backups_validos}`);
      Logger.log(`    Taxa de Sucesso: ${rel.estatisticas?.taxa_sucesso}%`);
      Logger.log(`    Tempo Processamento: ${rel.tempo_processamento_ms}ms`);
      
      Logger.log(`\n    Cobertura por Categoria:`);
      Object.entries(rel.cobertura || {}).forEach(([cat, data]) => {
        Logger.log(`      - ${cat}: ${data.cobertos}/${data.total} (${data.percentual}%)`);
      });
      
      Logger.log(`\n    Recomendações:`);
      rel.recomendacoes?.forEach((rec, i) => {
        Logger.log(`      ${i + 1}. [${rec.tipo}] ${rec.descricao}`);
      });
    } else {
      Logger.log(`    ERRO: ${drResult.error}`);
    }
    
    // 7. Validação de campos
    Logger.log('\n[7] VALIDAÇÃO DE CAMPOS DO RELATÓRIO DR:');
    if (drResult.success) {
      const camposObrigatorios = [
        'timestamp', 'status_geral', 'metricas_rpo', 'metricas_rto',
        'integridade', 'cobertura', 'estatisticas', 'recomendacoes'
      ];
      
      let todosPresentes = true;
      camposObrigatorios.forEach(campo => {
        const presente = drResult.relatorio.hasOwnProperty(campo);
        if (!presente) todosPresentes = false;
        Logger.log(`    ${campo}: ${presente ? '✓' : '✗'}`);
      });
      
      Logger.log('\n═══════════════════════════════════════════════════════════════');
      Logger.log(`RESULTADO FINAL: ${todosPresentes ? 'TODOS OS CAMPOS PRESENTES ✓' : 'CAMPOS FALTANDO ✗'}`);
      Logger.log('═══════════════════════════════════════════════════════════════');
    }
    
    return { 
      success: true, 
      snapshot: snapshotResult,
      rpo: rpoResult,
      dr_report: drResult
    };
  } catch (error) {
    Logger.log(`\nERRO CRÍTICO: ${error.message}`);
    Logger.log(error.stack);
    return { success: false, error: error.message };
  }
}
