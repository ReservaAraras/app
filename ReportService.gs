/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT SERVICE - Relatórios e Análises Avançadas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Baseado em base-1.txt e base-2.txt
 * Adaptado para Reserva Araras v3.1
 *
 * IMPACTO: Alto | CUSTO: Médio
 */

const ReportService = {

  /**
   * Gera relatório completo do sistema
   */
  generateFullReport() {
    try {
      const stats = this.getSystemStatistics();
      const health = this.getEnvironmentalHealth();
      const carbon = this.getCarbonSummary();

      return {
        success: true,
        timestamp: new Date(),
        statistics: stats,
        environmentalHealth: health,
        carbonSequestration: carbon,
        summary: this.generateSummaryText(stats, health, carbon)
      };
    } catch (error) {
      Utils.logError('ReportService.generateFullReport', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Estatísticas gerais do sistema
   */
  getSystemStatistics() {
    const waypoints = DatabaseService.read(CONFIG.SHEETS.WAYPOINTS);
    const fotos = DatabaseService.read(CONFIG.SHEETS.FOTOS);
    const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
    const visitantes = DatabaseService.read(CONFIG.SHEETS.VISITANTES);
    const parcelas = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO);
    const biodiversidade = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);

    return {
      waypoints: waypoints.success ? waypoints.data.length : 0,
      fotos: fotos.success ? fotos.data.length : 0,
      trilhas: trilhas.success ? trilhas.data.length : 0,
      visitantes: visitantes.success ? visitantes.data.length : 0,
      parcelas: parcelas.success ? parcelas.data.length : 0,
      especies_observadas: biodiversidade.success ?
        new Set(biodiversidade.data.map(b => b.especie_cientifica)).size : 0
    };
  },

  /**
   * Saúde ambiental por área
   */
  getEnvironmentalHealth() {
    try {
      const agua = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_AGUA);
      const solo = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_SOLO);

      const health = {
        agua: { total: 0, boa: 0, ruim: 0 },
        solo: { total: 0, fertil: 0, pobre: 0 }
      };

      // Análise de água
      if (agua.success) {
        health.agua.total = agua.data.length;
        agua.data.forEach(a => {
          const iqa = this.calculateSimpleIQA(a);
          if (iqa >= 52) health.agua.boa++;
          else health.agua.ruim++;
        });
      }

      // Análise de solo
      if (solo.success) {
        health.solo.total = solo.data.length;
        solo.data.forEach(s => {
          const pH = parseFloat(s.pH);
          const mo = parseFloat(s.materia_organica);
          if (pH >= 6.0 && pH <= 7.0 && mo >= 2.5) {
            health.solo.fertil++;
          } else {
            health.solo.pobre++;
          }
        });
      }

      return health;
    } catch (error) {
      return { agua: {}, solo: {} };
    }
  },

  /**
   * Resumo de carbono
   */
  getCarbonSummary() {
    try {
      const parcelas = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO);

      if (!parcelas.success || parcelas.data.length === 0) {
        return { total: 0, parcelas: 0 };
      }

      let totalCarbono = 0;

      parcelas.data.forEach(p => {
        const tipo = p.tipo_sistema || 'SAF_Cerrado';
        const area = parseFloat(p.area_ha) || 0;
        const idade = parseFloat(p.idade_anos) || 1;

        const taxas = {
          'SAF_Cerrado': 8.5,
          'ILPF': 5.2,
          'Agrofloresta_Diversa': 12.3,
          'Recuperacao_Pastagem': 3.8
        };

        const taxa = taxas[tipo] || 5.0;
        const carbono = taxa * area * idade * 3.67; // CO2e
        totalCarbono += carbono;
      });

      return {
        total: totalCarbono.toFixed(2),
        parcelas: parcelas.data.length,
        media_por_parcela: (totalCarbono / parcelas.data.length).toFixed(2)
      };
    } catch (error) {
      return { total: 0, parcelas: 0 };
    }
  },

  /**
   * Calcula IQA simplificado
   */
  calculateSimpleIQA(medicao) {
    let iqa = 100;

    const pH = parseFloat(medicao.pH);
    if (pH < 6.0 || pH > 9.0) iqa -= 20;

    const oxigenio = parseFloat(medicao.oxigenio_dissolvido);
    if (oxigenio < 5.0) iqa -= 20;

    const turbidez = parseFloat(medicao.turbidez);
    if (turbidez > 100) iqa -= 15;

    const coliformes = parseFloat(medicao.coliformes_termotolerantes);
    if (coliformes > 1000) iqa -= 20;

    return Math.max(0, iqa);
  },

  /**
   * Gera texto de resumo
   */
  generateSummaryText(stats, health, carbon) {
    return `
RELATÓRIO RESERVA ARARAS

Sistema possui ${stats.waypoints} waypoints cadastrados, ${stats.fotos} fotos registradas e ${stats.trilhas} trilhas mapeadas.

Biodiversidade: ${stats.especies_observadas} espécies observadas.

Qualidade Ambiental:
- Água: ${health.agua.boa}/${health.agua.total} medições com qualidade boa
- Solo: ${health.solo.fertil}/${health.solo.total} medições com solo fértil

Sequestro de Carbono:
- Total: ${carbon.total} tCO2e
- ${carbon.parcelas} parcelas agroflorestais
- Média: ${carbon.media_por_parcela} tCO2e por parcela

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();
  },

  /**
   * Exporta relatório para PDF (via Google Docs)
   */
  exportToPDF(reportData) {
    try {
      // Criar documento temporário
      const doc = DocumentApp.create('Relatório Reserva Araras - ' + new Date().toISOString());
      const body = doc.getBody();

      // Título
      body.appendParagraph('RELATÓRIO RESERVA ARARAS')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);

      // Conteúdo
      body.appendParagraph(reportData.summary);

      // Salvar e converter para PDF
      doc.saveAndClose();

      const docFile = DriveApp.getFileById(doc.getId());
      const pdfBlob = docFile.getAs('application/pdf');

      // Obter ou criar pasta de destino
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (e) {
        // Se pasta não existe, usa pasta raiz
        folder = DriveApp.getRootFolder();
      }

      // Salvar PDF no Drive
      const pdfFile = folder.createFile(pdfBlob);
      pdfFile.setName('Relatorio_RESERVA_' + new Date().toISOString().split('T')[0] + '.pdf');
      pdfFile.setDescription('Relatório gerado automaticamente pelo sistema Reserva Araras');

      // Deletar documento temporário
      docFile.setTrashed(true);

      return {
        success: true,
        pdfUrl: pdfFile.getUrl(),
        pdfId: pdfFile.getId(),
        pdfName: pdfFile.getName()
      };
    } catch (error) {
      Utils.logError('ReportService.exportToPDF', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Exporta dados para PDF
   */
  exportToPDF(data, reportType, options) {
    try {
      options = options || {};
      
      // Primeiro cria um documento temporário do Google Docs
      var docName = 'Relatorio_' + reportType + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
      var doc = DocumentApp.create(docName);
      var body = doc.getBody();
      
      // Adiciona cabeçalho
      var header = body.appendParagraph('Relatório: ' + (options.title || reportType));
      header.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      
      body.appendParagraph('Data de geração: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
      body.appendParagraph('');
      
      // Adiciona dados em tabela
      if (data && data.length > 0) {
        var headers = Object.keys(data[0]);
        var numCols = headers.length;
        var numRows = data.length + 1; // +1 para cabeçalho
        
        var table = body.appendTable();
        
        // Cabeçalho da tabela
        var headerRow = table.appendTableRow();
        headers.forEach(function(header) {
          var cell = headerRow.appendTableCell(header);
          cell.setBackgroundColor('#4CAF50');
          cell.getChild(0).asParagraph().setForegroundColor('#FFFFFF').setBold(true);
        });
        
        // Dados
        data.forEach(function(row) {
          var dataRow = table.appendTableRow();
          headers.forEach(function(header) {
            var value = row[header] || '';
            dataRow.appendTableCell(String(value));
          });
        });
      } else {
        body.appendParagraph('Nenhum dado disponível para o período selecionado.');
      }
      
      // Salva e fecha o documento
      doc.saveAndClose();
      
      // Converte para PDF
      var docFile = DriveApp.getFileById(doc.getId());
      var pdfBlob = docFile.getAs('application/pdf');
      
      // Cria o PDF na pasta correta
      var folder = getFolderOrCreate('Relatorios');
      var pdfFile = folder.createFile(pdfBlob);
      pdfFile.setName(docName + '.pdf');
      
      // Remove o documento temporário
      docFile.setTrashed(true);
      
      Logger.log('✅ PDF criado: ' + pdfFile.getName());
      
      return {
        success: true,
        fileId: pdfFile.getId(),
        fileName: pdfFile.getName(),
        url: pdfFile.getUrl(),
        mimeType: 'application/pdf'
      };
      
    } catch (error) {
      Logger.log('❌ ERRO em ReportService.exportToPDF: ' + error);
      Logger.log('Stack: ' + error.stack);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Obtém ou cria uma pasta no Drive
   */
  getFolderOrCreate(folderName) {
    var folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    }
    
    // Cria a pasta na raiz do Drive
    return DriveApp.createFolder(folderName);
  },

  /**
   * API para exportar relatório em PDF
   */
  apiExportReportToPDF(reportType, startDate, endDate, filters) {
    try {
      // Busca dados
      var data = queryDataByDateRange(reportType, startDate, endDate, filters);
      
      // Exporta para PDF
      var result = exportToPDF(data, reportType, {
        title: getTitleByReportType(reportType),
        startDate: startDate,
        endDate: endDate
      });
      
      return result;
      
    } catch (error) {
      Logger.log('❌ Erro em apiExportReportToPDF: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Obtém título legível por tipo de relatório
   */
  getTitleByReportType(reportType) {
    var titles = {
      'phytoplankton_sampling': 'Amostragem de Fitoplâncton',
      'zooplankton_sampling': 'Amostragem de Zooplâncton',
      'physicochemical_analysis': 'Análise Físico-Química',
      'general_observation': 'Observações Gerais',
      'ichthyofauna_sampling': 'Registro de Ictiofauna',
      'macrophytes_assessment': 'Macrófitas Aquáticas',
      'limnology_measurement': 'Monitoramento Limnológico',
      'benthic_sampling': 'Amostragem Bentônica'
    };
    
    return titles[reportType] || reportType;
  }
};

// Funções expostas
function apiGenerateFullReport() {
  return ReportService.generateFullReport();
}

function apiExportReportToPDF() {
  const report = ReportService.generateFullReport();
  if (!report.success) return report;
  return ReportService.exportToPDF(report);
}
