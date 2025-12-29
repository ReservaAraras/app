/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRUD APIs - Funções de Estatísticas e Validação
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * NOTA: As funções CRUD individuais foram movidas para CRUDFactory.gs
 * Este arquivo mantém apenas funções de estatísticas e validação.
 * 
 * @see CRUDFactory.gs para operações CRUD
 */

/**
 * Estatísticas gerais do sistema
 * @returns {Object} Estatísticas de todos os módulos
 */
function getSystemStatistics() {
  try {
    const modules = {
      agrofloresta: ['PARCELAS_AGRO', 'PRODUCAO_AGRO', 'ESPECIES_AGRO'],
      ambiental: ['DADOS_CLIMA', 'QUALIDADE_AGUA', 'QUALIDADE_SOLO', 'BIODIVERSIDADE', 'CARBONO'],
      ecoturismo: ['VISITANTES', 'TRILHAS', 'AVALIACOES'],
      gps: ['GPS_POINTS', 'WAYPOINTS', 'ROTAS', 'FOTOS'],
      terapia: ['PARTICIPANTES', 'SESSOES', 'AVALIACOES_TERAPIA'],
      fitoterapia: ['PLANTAS_MEDICINAIS', 'PREPARACOES'],
      sistema: ['USUARIOS', 'LOGS']
    };

    const stats = {};
    let totalRegistros = 0;

    for (const [moduleName, sheets] of Object.entries(modules)) {
      stats[moduleName] = {};
      for (const sheetKey of sheets) {
        const sheetName = CONFIG.SHEETS[sheetKey];
        if (sheetName) {
          const count = DatabaseService.count(sheetName).count || 0;
          const fieldName = sheetKey.toLowerCase().replace('_agro', '').replace('_terapia', '');
          stats[moduleName][fieldName] = count;
          totalRegistros += count;
        }
      }
    }

    stats.totais = {
      registros: totalRegistros,
      modulos: Object.keys(modules).length
    };

    return {
      success: true,
      timestamp: new Date(),
      statistics: stats
    };
  } catch (error) {
    Utils.logError('getSystemStatistics', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Valida integridade referencial entre entidades
 * @returns {Object} Resultado da validação com issues encontradas
 */
function validateReferentialIntegrity() {
  try {
    const issues = [];
    
    const validations = [
      {
        source: 'PRODUCAO_AGRO',
        foreignKey: 'parcela_id',
        target: 'PARCELAS_AGRO',
        message: 'Produção referencia parcela inexistente'
      },
      {
        source: 'VISITANTES',
        foreignKey: 'trilha_id',
        target: 'TRILHAS',
        message: 'Visitante referencia trilha inexistente'
      }
    ];

    for (const validation of validations) {
      const sourceData = DatabaseService.read(CONFIG.SHEETS[validation.source]);
      if (sourceData.success) {
        for (const record of sourceData.data) {
          const fkValue = record[validation.foreignKey];
          if (fkValue) {
            const exists = DatabaseService.exists(CONFIG.SHEETS[validation.target], fkValue);
            if (!exists.exists) {
              issues.push({
                type: 'orphan',
                sheet: validation.source,
                id: record.id,
                message: `${validation.message}: ${fkValue}`
              });
            }
          }
        }
      }
    }

    return {
      success: true,
      valid: issues.length === 0,
      issues: issues,
      count: issues.length
    };
  } catch (error) {
    Utils.logError('validateReferentialIntegrity', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtém resumo de saúde dos dados
 * @returns {Object} Métricas de saúde dos dados
 */
function getDataHealthSummary() {
  try {
    const stats = getSystemStatistics();
    const integrity = validateReferentialIntegrity();
    
    return {
      success: true,
      timestamp: new Date(),
      statistics: stats.statistics,
      integrity: {
        valid: integrity.valid,
        issueCount: integrity.count
      },
      health: integrity.valid ? 'healthy' : 'needs_attention'
    };
  } catch (error) {
    Utils.logError('getDataHealthSummary', error);
    return { success: false, error: error.toString() };
  }
}
