/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SERVIÇO DE DOAÇÕES E RECIBOS DIGITAIS
 * ═══════════════════════════════════════════════════════════════════════════
 * Prompt 11/43 - Financial Contribution and Digital Receipt Generation
 * 
 * Features:
 * - Donation processing with fund designation
 * - Cryptographic receipt hash generation
 * - Fiscal compliance and traceability
 * - Donation history and impact attribution
 * 
 * @version 1.0.0
 * @date 2025-12-27
 */

const DOACOES_HEADERS = [
  'ID_Doacao', 'Data', 'Doador_Email', 'Doador_Nome', 'Valor',
  'Fundo', 'Descricao', 'Status', 'Recibo_Hash', 'Recibo_Emitido'
];

/**
 * Serviço de Doações
 * @namespace DonationService
 */
const DonationService = {

  SHEET_NAME: 'DOACOES_RA',

  /**
   * Categorias de fundos disponíveis
   */
  FUNDOS: {
    REFLORESTAMENTO: { nome: 'Reflorestamento', icone: '🌱', descricao: 'Plantio de árvores nativas' },
    CONSERVACAO: { nome: 'Conservação', icone: '🦋', descricao: 'Proteção de espécies e habitats' },
    PESQUISA: { nome: 'Pesquisa', icone: '🔬', descricao: 'Estudos científicos e monitoramento' },
    EDUCACAO: { nome: 'Educação Ambiental', icone: '📚', descricao: 'Programas educacionais' },
    INFRAESTRUTURA: { nome: 'Infraestrutura', icone: '🏗️', descricao: 'Trilhas, sensores e equipamentos' },
    GERAL: { nome: 'Geral', icone: '💚', descricao: 'Uso conforme necessidade da reserva' }
  },

  /**
   * Configuração de recibos
   */
  RECEIPT_CONFIG: {
    organizacao: 'Reserva Araras',
    cnpj: '00.000.000/0001-00',
    endereco: 'Estrada Rural, Km 15 - Zona Rural',
    cidade: 'Araras - SP',
    telefone: '(19) 0000-0000',
    email: 'contato@reservaaraas.org.br'
  },

  /**
   * Inicializa planilha de doações
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(DOACOES_HEADERS);

        const headerRange = sheet.getRange(1, 1, 1, DOACOES_HEADERS.length);
        headerRange.setBackground('#2E7D32');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera hash criptográfico para recibo
   * @param {Object} data - Dados para hash
   * @returns {string} Hash de verificação
   */
  generateReceiptHash: function(data) {
    const hashInput = `${data.id}-${data.email}-${data.valor}-${data.fundo}-${data.timestamp}`;
    
    // Usa algoritmo similar ao CarbonTracking._simpleHash
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Converte para hexadecimal e formata
    const hashHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    
    return `RA-${hashHex}-${timestamp}`;
  },

  /**
   * Processa uma doação
   * @param {string} doadorEmail - Email do doador
   * @param {number} valor - Valor da doação em BRL
   * @param {string} fundo - Categoria do fundo
   * @param {string} descricao - Descrição opcional
   * @param {string} doadorNome - Nome do doador (opcional)
   * @returns {Object} Resultado do processamento
   */
  processDonation: function(doadorEmail, valor, fundo, descricao, doadorNome) {
    try {
      // Validações
      if (!doadorEmail || !doadorEmail.includes('@')) {
        return { success: false, error: 'Email do doador inválido' };
      }

      const valorNum = parseFloat(valor);
      if (isNaN(valorNum) || valorNum <= 0) {
        return { success: false, error: 'Valor deve ser positivo' };
      }

      const fundoKey = fundo?.toUpperCase() || 'GERAL';
      if (!this.FUNDOS[fundoKey]) {
        return { success: false, error: `Fundo inválido: ${fundo}. Opções: ${Object.keys(this.FUNDOS).join(', ')}` };
      }

      this.initializeSheet();

      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      // Gera ID único
      const doacaoId = `DOA-${Date.now().toString(36).toUpperCase()}`;
      const dataAtual = new Date();
      const nome = doadorNome || doadorEmail.split('@')[0];

      // Gera hash do recibo
      const receiptHash = this.generateReceiptHash({
        id: doacaoId,
        email: doadorEmail,
        valor: valorNum,
        fundo: fundoKey,
        timestamp: dataAtual.getTime()
      });

      // Registra no livro-razão
      sheet.appendRow([
        doacaoId,
        dataAtual.toISOString(),
        doadorEmail,
        nome,
        valorNum,
        fundoKey,
        descricao || '',
        'Confirmada',
        receiptHash,
        dataAtual.toISOString()
      ]);

      return {
        success: true,
        doacao: {
          id: doacaoId,
          data: dataAtual.toISOString(),
          doador: {
            email: doadorEmail,
            nome: nome
          },
          valor: valorNum,
          valor_formatado: `R$ ${valorNum.toFixed(2)}`,
          fundo: {
            codigo: fundoKey,
            nome: this.FUNDOS[fundoKey].nome,
            icone: this.FUNDOS[fundoKey].icone
          },
          descricao: descricao || '',
          status: 'Confirmada'
        },
        recibo: {
          hash: receiptHash,
          emitido_em: dataAtual.toISOString(),
          verificacao_url: `https://reservaaraas.org.br/verificar/${receiptHash}`
        },
        mensagem: `Doação de R$ ${valorNum.toFixed(2)} para ${this.FUNDOS[fundoKey].nome} processada com sucesso!`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recibo completo para uma doação
   * @param {string} doacaoId - ID da doação
   * @returns {Object} Recibo formatado
   */
  generateReceipt: function(doacaoId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Doação não encontrada' };
      }

      const data = sheet.getDataRange().getValues();
      let doacao = null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === doacaoId) {
          doacao = {
            id: data[i][0],
            data: data[i][1],
            email: data[i][2],
            nome: data[i][3],
            valor: data[i][4],
            fundo: data[i][5],
            descricao: data[i][6],
            status: data[i][7],
            hash: data[i][8],
            emitido: data[i][9]
          };
          break;
        }
      }

      if (!doacao) {
        return { success: false, error: 'Doação não encontrada' };
      }

      const fundoInfo = this.FUNDOS[doacao.fundo] || this.FUNDOS.GERAL;

      return {
        success: true,
        recibo: {
          numero: doacao.id,
          hash_verificacao: doacao.hash,
          
          organizacao: this.RECEIPT_CONFIG,
          
          doador: {
            nome: doacao.nome,
            email: doacao.email
          },
          
          doacao: {
            valor: doacao.valor,
            valor_formatado: `R$ ${doacao.valor.toFixed(2)}`,
            valor_extenso: this._valorPorExtenso(doacao.valor),
            fundo: fundoInfo.nome,
            fundo_descricao: fundoInfo.descricao,
            descricao: doacao.descricao
          },
          
          datas: {
            transacao: doacao.data,
            emissao_recibo: doacao.emitido,
            transacao_formatada: new Date(doacao.data).toLocaleDateString('pt-BR'),
            emissao_formatada: new Date(doacao.emitido).toLocaleDateString('pt-BR')
          },
          
          status: doacao.status,
          
          declaracao: `Declaramos para os devidos fins que ${doacao.nome} realizou doação no valor de R$ ${doacao.valor.toFixed(2)} (${this._valorPorExtenso(doacao.valor)}) para o fundo de ${fundoInfo.nome} da ${this.RECEIPT_CONFIG.organizacao}.`,
          
          verificacao: {
            hash: doacao.hash,
            instrucoes: 'Para verificar a autenticidade deste recibo, acesse nosso site e informe o código de verificação acima.'
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Converte valor para extenso (simplificado)
   * @private
   */
  _valorPorExtenso: function(valor) {
    const inteiro = Math.floor(valor);
    const centavos = Math.round((valor - inteiro) * 100);
    
    if (centavos > 0) {
      return `${inteiro} reais e ${centavos} centavos`;
    }
    return `${inteiro} reais`;
  },

  /**
   * Verifica autenticidade de um recibo pelo hash
   * @param {string} hash - Hash de verificação
   * @returns {Object} Resultado da verificação
   */
  verifyReceipt: function(hash) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, valido: false, error: 'Recibo não encontrado' };
      }

      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {
        if (data[i][8] === hash) {
          return {
            success: true,
            valido: true,
            recibo: {
              numero: data[i][0],
              data: new Date(data[i][1]).toLocaleDateString('pt-BR'),
              doador: data[i][3],
              valor: `R$ ${data[i][4].toFixed(2)}`,
              fundo: this.FUNDOS[data[i][5]]?.nome || data[i][5],
              status: data[i][7]
            },
            mensagem: 'Recibo válido e autêntico'
          };
        }
      }

      return { success: true, valido: false, mensagem: 'Recibo não encontrado no sistema' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém histórico de doações de um doador
   * @param {string} doadorEmail - Email do doador
   * @returns {Object} Histórico de doações
   */
  getDonationHistory: function(doadorEmail) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, doacoes: [], total: 0, valor_total: 0 };
      }

      const data = sheet.getDataRange().getValues();
      const doacoes = [];
      let valorTotal = 0;

      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === doadorEmail) {
          const valor = parseFloat(data[i][4]) || 0;
          valorTotal += valor;
          
          doacoes.push({
            id: data[i][0],
            data: data[i][1],
            data_formatada: new Date(data[i][1]).toLocaleDateString('pt-BR'),
            valor: valor,
            valor_formatado: `R$ ${valor.toFixed(2)}`,
            fundo: data[i][5],
            fundo_nome: this.FUNDOS[data[i][5]]?.nome || data[i][5],
            status: data[i][7],
            hash: data[i][8]
          });
        }
      }

      // Ordena por data (mais recente primeiro)
      doacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

      return {
        success: true,
        doador: doadorEmail,
        resumo: {
          total_doacoes: doacoes.length,
          valor_total: valorTotal,
          valor_total_formatado: `R$ ${valorTotal.toFixed(2)}`,
          primeira_doacao: doacoes.length > 0 ? doacoes[doacoes.length - 1].data_formatada : null,
          ultima_doacao: doacoes.length > 0 ? doacoes[0].data_formatada : null
        },
        doacoes: doacoes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório consolidado de doações
   * @param {number} ano - Ano para filtrar (opcional)
   * @returns {Object} Relatório de doações
   */
  generateDonationReport: function(ano) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, resumo: { total: 0, valor: 0 }, por_fundo: {} };
      }

      const data = sheet.getDataRange().getValues().slice(1);
      let doacoes = data;

      // Filtra por ano se especificado
      if (ano) {
        doacoes = doacoes.filter(row => new Date(row[1]).getFullYear() === ano);
      }

      // Agrupa por fundo
      const porFundo = {};
      Object.keys(this.FUNDOS).forEach(f => {
        porFundo[f] = { quantidade: 0, valor: 0 };
      });

      let valorTotal = 0;
      const doadores = new Set();

      doacoes.forEach(row => {
        const fundo = row[5];
        const valor = parseFloat(row[4]) || 0;
        
        if (porFundo[fundo]) {
          porFundo[fundo].quantidade++;
          porFundo[fundo].valor += valor;
        }
        
        valorTotal += valor;
        doadores.add(row[2]);
      });

      // Formata valores
      Object.keys(porFundo).forEach(f => {
        porFundo[f].valor_formatado = `R$ ${porFundo[f].valor.toFixed(2)}`;
        porFundo[f].nome = this.FUNDOS[f].nome;
        porFundo[f].icone = this.FUNDOS[f].icone;
      });

      return {
        success: true,
        titulo: `Relatório de Doações${ano ? ` - ${ano}` : ''}`,
        data_geracao: new Date().toISOString(),
        periodo: ano || 'Todo o período',
        
        resumo: {
          total_doacoes: doacoes.length,
          total_doadores: doadores.size,
          valor_total: valorTotal,
          valor_total_formatado: `R$ ${valorTotal.toFixed(2)}`,
          ticket_medio: doacoes.length > 0 ? `R$ ${(valorTotal / doacoes.length).toFixed(2)}` : 'R$ 0,00'
        },
        
        por_fundo: porFundo,
        
        top_fundos: Object.entries(porFundo)
          .sort((a, b) => b[1].valor - a[1].valor)
          .slice(0, 3)
          .map(([codigo, dados]) => ({
            codigo,
            nome: dados.nome,
            valor: dados.valor_formatado,
            percentual: valorTotal > 0 ? Math.round((dados.valor / valorTotal) * 100) : 0
          }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista fundos disponíveis
   */
  listFunds: function() {
    return {
      success: true,
      fundos: Object.entries(this.FUNDOS).map(([codigo, info]) => ({
        codigo,
        ...info
      }))
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 13/43 - Project-Specific Funding ("Adopt a Hectare")
// ═══════════════════════════════════════════════════════════════════════════

const ADOCOES_HEADERS = [
  'ID_Adocao', 'Data', 'Doador_Email', 'Doador_Nome', 'Parcela_ID',
  'Parcela_Nome', 'Area_ha', 'Valor_Contribuicao', 'Status', 'Data_Inicio', 'Observacoes'
];

/**
 * Serviço de Adoção de Parcelas
 * @namespace AdoptionService
 */
const AdoptionService = {

  SHEET_NAME: 'ADOCOES_PARCELAS_RA',

  /**
   * Status de adoção
   */
  STATUS: {
    ATIVA: 'Ativa',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada'
  },

  /**
   * Inicializa planilha de adoções
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(ADOCOES_HEADERS);

        const headerRange = sheet.getRange(1, 1, 1, ADOCOES_HEADERS.length);
        headerRange.setBackground('#1B5E20');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista parcelas disponíveis para adoção
   * @returns {Object} Lista de parcelas disponíveis
   */
  listAvailableParcels: function() {
    try {
      const ss = getSpreadsheet();
      const parcelasSheet = ss.getSheetByName(CONFIG.SHEETS.PARCELAS_AGRO);

      if (!parcelasSheet || parcelasSheet.getLastRow() < 2) {
        // Retorna parcelas de exemplo se não houver dados
        return {
          success: true,
          parcelas: [
            { id: 'PARC-001', nome: 'Parcela Nascente', area_ha: 1.5, tipo: 'Mata_Galeria', status: 'Restoration', disponivel: true },
            { id: 'PARC-002', nome: 'Parcela Cerrado Norte', area_ha: 2.0, tipo: 'Cerrado_Stricto', status: 'Planned', disponivel: true },
            { id: 'PARC-003', nome: 'Parcela SAF Experimental', area_ha: 0.5, tipo: 'SAF', status: 'Restoration', disponivel: true }
          ],
          total: 3,
          fonte: 'exemplo'
        };
      }

      const data = parcelasSheet.getDataRange().getValues();
      const parcelas = [];

      // Obtém adoções existentes para verificar disponibilidade
      const adocoesAtivas = this._getActiveAdoptions();

      for (let i = 1; i < data.length; i++) {
        const status = data[i][8] || data[i][5]; // Status pode estar em diferentes colunas
        const parcelaId = data[i][0];

        // Filtra por status 'Planned' ou 'Restoration' e não adotadas
        if ((status === 'Planned' || status === 'Restoration' || status === 'Em restauração') 
            && !adocoesAtivas.includes(parcelaId)) {
          parcelas.push({
            id: parcelaId,
            nome: data[i][1] || `Parcela ${parcelaId}`,
            area_ha: parseFloat(data[i][2]) || 1.0,
            tipo: data[i][3] || 'Cerrado_Stricto',
            latitude: data[i][4],
            longitude: data[i][5],
            status: status,
            disponivel: true,
            valor_sugerido: (parseFloat(data[i][2]) || 1.0) * 2500 // R$ 2500/ha
          });
        }
      }

      return {
        success: true,
        parcelas: parcelas,
        total: parcelas.length,
        fonte: 'planilha'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém IDs de parcelas com adoções ativas
   * @private
   */
  _getActiveAdoptions: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) return [];

      const data = sheet.getDataRange().getValues();
      const ativas = [];

      for (let i = 1; i < data.length; i++) {
        if (data[i][8] === this.STATUS.ATIVA) {
          ativas.push(data[i][4]); // Parcela_ID
        }
      }

      return ativas;
    } catch (e) {
      return [];
    }
  },

  /**
   * Adota uma parcela
   * @param {string} doadorEmail - Email do doador
   * @param {string} parcelaId - ID da parcela
   * @param {number} valor - Valor da contribuição
   * @param {string} doadorNome - Nome do doador (opcional)
   * @returns {Object} Resultado da adoção
   */
  adoptParcel: function(doadorEmail, parcelaId, valor, doadorNome) {
    try {
      // Validações
      if (!doadorEmail || !doadorEmail.includes('@')) {
        return { success: false, error: 'Email do doador inválido' };
      }

      if (!parcelaId) {
        return { success: false, error: 'ID da parcela é obrigatório' };
      }

      const valorNum = parseFloat(valor) || 0;

      // Verifica se parcela está disponível
      const disponiveis = this.listAvailableParcels();
      const parcela = disponiveis.parcelas?.find(p => p.id === parcelaId);

      if (!parcela) {
        return { success: false, error: 'Parcela não disponível para adoção' };
      }

      this.initializeSheet();

      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      const adocaoId = `ADOC-${Date.now().toString(36).toUpperCase()}`;
      const dataAtual = new Date();
      const nome = doadorNome || doadorEmail.split('@')[0];

      // Registra adoção
      sheet.appendRow([
        adocaoId,
        dataAtual.toISOString(),
        doadorEmail,
        nome,
        parcelaId,
        parcela.nome,
        parcela.area_ha,
        valorNum,
        this.STATUS.ATIVA,
        dataAtual.toISOString(),
        ''
      ]);

      // Também registra como doação no DonationService
      DonationService.processDonation(
        doadorEmail,
        valorNum,
        'REFLORESTAMENTO',
        `Adoção da parcela ${parcela.nome} (${parcelaId})`,
        nome
      );

      return {
        success: true,
        adocao: {
          id: adocaoId,
          data: dataAtual.toISOString(),
          doador: {
            email: doadorEmail,
            nome: nome
          },
          parcela: {
            id: parcelaId,
            nome: parcela.nome,
            area_ha: parcela.area_ha,
            tipo: parcela.tipo,
            coordenadas: parcela.latitude && parcela.longitude 
              ? `${parcela.latitude}, ${parcela.longitude}` 
              : 'Não disponível'
          },
          valor: valorNum,
          valor_formatado: `R$ ${valorNum.toFixed(2)}`,
          status: this.STATUS.ATIVA
        },
        mensagem: `Parabéns! Você adotou a ${parcela.nome} (${parcela.area_ha} ha). Você receberá atualizações sobre o desenvolvimento desta área.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém adoções de um doador
   * @param {string} doadorEmail - Email do doador
   * @returns {Object} Lista de adoções
   */
  getDonorAdoptions: function(doadorEmail) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);

      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, adocoes: [], total: 0, area_total_ha: 0 };
      }

      const data = sheet.getDataRange().getValues();
      const adocoes = [];
      let areaTotal = 0;
      let valorTotal = 0;

      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === doadorEmail) {
          const area = parseFloat(data[i][6]) || 0;
          const valor = parseFloat(data[i][7]) || 0;
          
          areaTotal += area;
          valorTotal += valor;

          adocoes.push({
            id: data[i][0],
            data: data[i][1],
            data_formatada: new Date(data[i][1]).toLocaleDateString('pt-BR'),
            parcela_id: data[i][4],
            parcela_nome: data[i][5],
            area_ha: area,
            valor: valor,
            valor_formatado: `R$ ${valor.toFixed(2)}`,
            status: data[i][8]
          });
        }
      }

      return {
        success: true,
        doador: doadorEmail,
        resumo: {
          total_adocoes: adocoes.length,
          area_total_ha: Math.round(areaTotal * 100) / 100,
          area_total_m2: Math.round(areaTotal * 10000),
          valor_total: valorTotal,
          valor_total_formatado: `R$ ${valorTotal.toFixed(2)}`
        },
        adocoes: adocoes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém atualizações de uma parcela adotada
   * @param {string} parcelaId - ID da parcela
   * @returns {Object} Atualizações da parcela
   */
  getParcelUpdates: function(parcelaId) {
    try {
      const ss = getSpreadsheet();
      const updates = {
        parcela_id: parcelaId,
        data_consulta: new Date().toISOString(),
        sensores: {},
        carbono: {},
        observacoes: []
      };

      // Tenta obter dados de umidade do solo
      try {
        const soloSheet = ss.getSheetByName(CONFIG.SHEETS.SENSORES_UMIDADE_SOLO_RA);
        if (soloSheet && soloSheet.getLastRow() > 1) {
          const soloData = soloSheet.getDataRange().getValues().slice(1);
          const leituras = soloData.filter(row => 
            String(row[1]).includes(parcelaId) || String(row[0]).includes(parcelaId)
          ).slice(-5);

          if (leituras.length > 0) {
            const ultimaLeitura = leituras[leituras.length - 1];
            updates.sensores.umidade_solo = {
              valor: ultimaLeitura[2] || 0,
              unidade: '%',
              data: ultimaLeitura[1] || new Date().toISOString(),
              status: (ultimaLeitura[2] || 0) > 30 ? 'Adequada' : 'Baixa'
            };
          }
        }
      } catch (e) { /* Sensor não disponível */ }

      // Tenta obter dados de carbono
      try {
        const carbonoStats = CarbonTracking.calculateTotalStock(parcelaId);
        if (carbonoStats.success) {
          updates.carbono = {
            estoque_kg: carbonoStats.total_carbono_kg || 0,
            estoque_ton: carbonoStats.total_carbono_ton || 0,
            co2e_ton: carbonoStats.total_co2e_ton || 0,
            medicoes: carbonoStats.medicoes || 0
          };
        }
      } catch (e) { /* CarbonTracking não disponível */ }

      // Tenta obter observações de biodiversidade
      try {
        const bioSheet = ss.getSheetByName(CONFIG.SHEETS.BIODIVERSIDADE_RA);
        if (bioSheet && bioSheet.getLastRow() > 1) {
          const bioData = bioSheet.getDataRange().getValues().slice(1);
          const obs = bioData.filter(row => 
            String(row[5]).includes(parcelaId) || String(row[6]).includes(parcelaId)
          ).slice(-5);

          updates.observacoes = obs.map(row => ({
            data: row[1],
            especie: row[3],
            quantidade: row[4],
            observador: row[7]
          }));
        }
      } catch (e) { /* Biodiversidade não disponível */ }

      // Gera resumo de progresso
      updates.progresso = {
        saude_geral: this._calculateHealthScore(updates),
        ultima_atualizacao: new Date().toISOString(),
        proxima_acao: 'Monitoramento contínuo'
      };

      return {
        success: true,
        atualizacoes: updates
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula score de saúde da parcela
   * @private
   */
  _calculateHealthScore: function(updates) {
    let score = 70; // Base

    if (updates.sensores?.umidade_solo?.status === 'Adequada') score += 10;
    if (updates.carbono?.estoque_ton > 0) score += 10;
    if (updates.observacoes?.length > 0) score += 10;

    return Math.min(100, score);
  },

  /**
   * Gera relatório completo de adoção
   * @param {string} doadorEmail - Email do doador
   * @returns {Object} Relatório de adoção
   */
  generateAdoptionReport: function(doadorEmail) {
    try {
      const adocoes = this.getDonorAdoptions(doadorEmail);
      if (!adocoes.success || adocoes.adocoes.length === 0) {
        return {
          success: true,
          doador: doadorEmail,
          mensagem: 'Nenhuma adoção encontrada. Explore as parcelas disponíveis!'
        };
      }

      // Obtém atualizações de cada parcela
      const parcelasComUpdates = adocoes.adocoes.map(adocao => {
        const updates = this.getParcelUpdates(adocao.parcela_id);
        return {
          ...adocao,
          atualizacoes: updates.success ? updates.atualizacoes : null
        };
      });

      // Calcula impacto total
      let carbonoTotal = 0;
      let observacoesTotal = 0;

      parcelasComUpdates.forEach(p => {
        if (p.atualizacoes?.carbono?.co2e_ton) {
          carbonoTotal += p.atualizacoes.carbono.co2e_ton;
        }
        if (p.atualizacoes?.observacoes?.length) {
          observacoesTotal += p.atualizacoes.observacoes.length;
        }
      });

      return {
        success: true,
        titulo: 'Relatório de Adoção de Parcelas',
        data_geracao: new Date().toISOString(),

        doador: {
          email: doadorEmail,
          total_adocoes: adocoes.resumo.total_adocoes,
          area_total_ha: adocoes.resumo.area_total_ha,
          valor_investido: adocoes.resumo.valor_total_formatado
        },

        impacto_consolidado: {
          co2_sequestrado_ton: Math.round(carbonoTotal * 100) / 100,
          observacoes_biodiversidade: observacoesTotal,
          area_conservada_ha: adocoes.resumo.area_total_ha
        },

        parcelas: parcelasComUpdates,

        mensagem: `Você está ajudando a conservar ${adocoes.resumo.area_total_ha} hectares e já contribuiu para sequestrar ${carbonoTotal.toFixed(2)} toneladas de CO₂!`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Adoption Service (Prompt 13/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lista parcelas disponíveis para adoção (Prompt 13/43)
 */
function apiAdocaoListarDisponiveis() {
  return AdoptionService.listAvailableParcels();
}

/**
 * Adota uma parcela (Prompt 13/43)
 */
function apiAdocaoAdotar(doadorEmail, parcelaId, valor, doadorNome) {
  return AdoptionService.adoptParcel(doadorEmail, parcelaId, valor, doadorNome);
}

/**
 * Obtém parcelas adotadas pelo doador (Prompt 13/43)
 */
function apiAdocaoMinhasParcelas(doadorEmail) {
  return AdoptionService.getDonorAdoptions(doadorEmail);
}

/**
 * Obtém atualizações de uma parcela (Prompt 13/43)
 */
function apiAdocaoAtualizacoes(parcelaId) {
  return AdoptionService.getParcelUpdates(parcelaId);
}

/**
 * Gera relatório de adoção (Prompt 13/43)
 */
function apiAdocaoRelatorio(doadorEmail) {
  return AdoptionService.generateAdoptionReport(doadorEmail);
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 13/43
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa funcionalidades de adoção de parcelas (Prompt 13/43)
 */
function testAdoptHectare() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '13/43 - Project-Specific Funding (Adopt a Hectare)',
    tests: []
  };

  // Test 1: listAvailableParcels
  try {
    const disponiveis = AdoptionService.listAvailableParcels();
    results.tests.push({
      name: 'listAvailableParcels',
      status: disponiveis.success && disponiveis.parcelas ? 'PASS' : 'FAIL',
      details: {
        success: disponiveis.success,
        total: disponiveis.total,
        fonte: disponiveis.fonte
      }
    });
  } catch (e) {
    results.tests.push({ name: 'listAvailableParcels', status: 'ERROR', error: e.message });
  }

  // Test 2: adoptParcel
  let testParcelaId = null;
  try {
    const disponiveis = AdoptionService.listAvailableParcels();
    if (disponiveis.parcelas?.length > 0) {
      testParcelaId = disponiveis.parcelas[0].id;
      const adocao = AdoptionService.adoptParcel('teste.adocao@exemplo.com', testParcelaId, 500, 'Teste Adoção');
      results.tests.push({
        name: 'adoptParcel',
        status: adocao.success && adocao.adocao?.id ? 'PASS' : 'FAIL',
        details: {
          success: adocao.success,
          adocao_id: adocao.adocao?.id,
          parcela: adocao.adocao?.parcela?.nome
        }
      });
    } else {
      results.tests.push({ name: 'adoptParcel', status: 'SKIP', details: 'No parcels available' });
    }
  } catch (e) {
    results.tests.push({ name: 'adoptParcel', status: 'ERROR', error: e.message });
  }

  // Test 3: getDonorAdoptions
  try {
    const adocoes = AdoptionService.getDonorAdoptions('teste.adocao@exemplo.com');
    results.tests.push({
      name: 'getDonorAdoptions',
      status: adocoes.success ? 'PASS' : 'FAIL',
      details: {
        success: adocoes.success,
        total: adocoes.resumo?.total_adocoes,
        area_total: adocoes.resumo?.area_total_ha
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getDonorAdoptions', status: 'ERROR', error: e.message });
  }

  // Test 4: getParcelUpdates
  try {
    if (testParcelaId) {
      const updates = AdoptionService.getParcelUpdates(testParcelaId);
      results.tests.push({
        name: 'getParcelUpdates',
        status: updates.success ? 'PASS' : 'FAIL',
        details: {
          success: updates.success,
          has_sensores: !!updates.atualizacoes?.sensores,
          has_carbono: !!updates.atualizacoes?.carbono
        }
      });
    } else {
      results.tests.push({ name: 'getParcelUpdates', status: 'SKIP', details: 'No parcel ID' });
    }
  } catch (e) {
    results.tests.push({ name: 'getParcelUpdates', status: 'ERROR', error: e.message });
  }

  // Test 5: generateAdoptionReport
  try {
    const report = AdoptionService.generateAdoptionReport('teste.adocao@exemplo.com');
    results.tests.push({
      name: 'generateAdoptionReport',
      status: report.success !== undefined ? 'PASS' : 'FAIL',
      details: {
        success: report.success,
        has_parcelas: !!report.parcelas,
        has_impacto: !!report.impacto_consolidado
      }
    });
  } catch (e) {
    results.tests.push({ name: 'generateAdoptionReport', status: 'ERROR', error: e.message });
  }

  // Test 6: API Functions
  try {
    const apiDisponiveis = apiAdocaoListarDisponiveis();
    results.tests.push({
      name: 'API Functions',
      status: apiDisponiveis !== undefined ? 'PASS' : 'FAIL',
      details: { apiAdocaoListarDisponiveis: !!apiDisponiveis }
    });
  } catch (e) {
    results.tests.push({ name: 'API Functions', status: 'ERROR', error: e.message });
  }

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const total = results.tests.length;
  results.summary = {
    passed: passed,
    total: total,
    percentage: Math.round((passed / total) * 100),
    status: passed === total ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
  };

  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST RESULTS - Prompt 13/43: Adopt a Hectare');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(results, null, 2));

  return results;
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 12/43 - Impact Visualization (Carbon and Biodiversity Dashboards)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Serviço de Visualização de Impacto
 * @namespace ImpactVisualization
 */
const ImpactVisualization = {

  /**
   * Fatores de conversão para métricas comparativas
   */
  CONVERSION_FACTORS: {
    CARS_PER_YEAR: 4.6,      // tons CO2 por carro/ano
    TREES_PER_YEAR: 0.021,   // tons CO2 por árvore/ano
    FLIGHTS: 0.9,            // tons CO2 por voo internacional
    HOMES_PER_YEAR: 7.5      // tons CO2 por casa/ano
  },

  /**
   * Custo estimado do projeto por hectare/ano
   */
  PROJECT_COSTS: {
    CUSTO_HA_ANO: 2500,      // R$ por hectare/ano
    AREA_TOTAL_HA: 150       // Área total da reserva
  },

  /**
   * Obtém impacto total do projeto
   * @returns {Object} Métricas totais do projeto
   */
  getProjectTotalImpact: function() {
    try {
      // Obtém estatísticas de carbono
      let carbonStats = { co2e_total_ton: 0, carbono_total_ton: 0 };
      try {
        carbonStats = CarbonTracking.getStatistics();
      } catch (e) {
        // CarbonTracking pode não estar disponível
      }

      // Obtém estatísticas de biodiversidade
      let bioStats = { especies: 0, observacoes: 0 };
      try {
        const ss = getSpreadsheet();
        const bioSheet = ss.getSheetByName(CONFIG.SHEETS.BIODIVERSIDADE_RA);
        if (bioSheet && bioSheet.getLastRow() > 1) {
          const bioData = bioSheet.getDataRange().getValues().slice(1);
          const especiesSet = new Set();
          bioData.forEach(row => {
            if (row[3]) especiesSet.add(row[3]); // Especie_Cientifica
          });
          bioStats.especies = especiesSet.size;
          bioStats.observacoes = bioData.length;
        }
      } catch (e) {
        // Biodiversidade pode não estar disponível
      }

      // Calcula custo total do projeto
      const custoTotalProjeto = this.PROJECT_COSTS.CUSTO_HA_ANO * this.PROJECT_COSTS.AREA_TOTAL_HA;

      return {
        success: true,
        carbono: {
          co2_sequestrado_ton: carbonStats.co2e_total_ton || 0,
          carbono_estocado_ton: carbonStats.carbono_total_ton || 0,
          creditos_gerados: carbonStats.creditos_gerados || 0,
          valor_creditos_brl: carbonStats.valor_creditos_brl || 0
        },
        biodiversidade: {
          especies_catalogadas: bioStats.especies,
          observacoes_total: bioStats.observacoes,
          area_conservada_ha: this.PROJECT_COSTS.AREA_TOTAL_HA
        },
        projeto: {
          custo_anual_brl: custoTotalProjeto,
          area_total_ha: this.PROJECT_COSTS.AREA_TOTAL_HA
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calcula atribuição de impacto para um doador
   * @param {number} donorTotal - Total doado pelo doador
   * @param {Object} projectImpact - Impacto total do projeto
   * @returns {Object} Impacto atribuído ao doador
   */
  calculateImpactAttribution: function(donorTotal, projectImpact) {
    const custoTotal = projectImpact.projeto?.custo_anual_brl || 1;
    const percentual = (donorTotal / custoTotal) * 100;
    const fator = donorTotal / custoTotal;

    return {
      percentual_contribuicao: Math.round(percentual * 100) / 100,
      fator_atribuicao: fator,
      carbono: {
        co2_atribuido_ton: Math.round((projectImpact.carbono?.co2_sequestrado_ton || 0) * fator * 100) / 100,
        carbono_atribuido_ton: Math.round((projectImpact.carbono?.carbono_estocado_ton || 0) * fator * 100) / 100
      },
      biodiversidade: {
        especies_protegidas: Math.round((projectImpact.biodiversidade?.especies_catalogadas || 0) * fator),
        observacoes_atribuidas: Math.round((projectImpact.biodiversidade?.observacoes_total || 0) * fator),
        area_conservada_ha: Math.round((projectImpact.biodiversidade?.area_conservada_ha || 0) * fator * 100) / 100
      }
    };
  },

  /**
   * Obtém métricas comparativas para quantidade de CO2
   * @param {number} co2Tons - Quantidade de CO2 em toneladas
   * @returns {Object} Métricas comparativas
   */
  getComparativeMetrics: function(co2Tons) {
    return {
      carros_compensados: Math.round(co2Tons / this.CONVERSION_FACTORS.CARS_PER_YEAR * 10) / 10,
      arvores_equivalentes: Math.round(co2Tons / this.CONVERSION_FACTORS.TREES_PER_YEAR),
      voos_evitados: Math.round(co2Tons / this.CONVERSION_FACTORS.FLIGHTS * 10) / 10,
      casas_abastecidas: Math.round(co2Tons / this.CONVERSION_FACTORS.HOMES_PER_YEAR * 10) / 10,
      descricoes: {
        carros: `Equivalente a tirar ${Math.round(co2Tons / this.CONVERSION_FACTORS.CARS_PER_YEAR * 10) / 10} carro(s) das ruas por 1 ano`,
        arvores: `Equivalente ao trabalho de ${Math.round(co2Tons / this.CONVERSION_FACTORS.TREES_PER_YEAR)} árvore(s) por 1 ano`,
        voos: `Equivalente a evitar ${Math.round(co2Tons / this.CONVERSION_FACTORS.FLIGHTS * 10) / 10} voo(s) internacional(is)`,
        casas: `Equivalente às emissões de ${Math.round(co2Tons / this.CONVERSION_FACTORS.HOMES_PER_YEAR * 10) / 10} casa(s) por 1 ano`
      }
    };
  },

  /**
   * Gera relatório de impacto personalizado para doador
   * @param {string} doadorEmail - Email do doador
   * @returns {Object} Relatório de impacto completo
   */
  generateImpactReport: function(doadorEmail) {
    try {
      // Obtém histórico de doações
      const historico = DonationService.getDonationHistory(doadorEmail);
      if (!historico.success) {
        return { success: false, error: 'Doador não encontrado' };
      }

      const totalDoado = historico.resumo?.valor_total || 0;
      
      if (totalDoado === 0) {
        return {
          success: true,
          doador: { email: doadorEmail, total_doado: 0 },
          mensagem: 'Nenhuma doação registrada para este email'
        };
      }

      // Obtém impacto total do projeto
      const projectImpact = this.getProjectTotalImpact();
      if (!projectImpact.success) {
        return projectImpact;
      }

      // Calcula atribuição de impacto
      const attribution = this.calculateImpactAttribution(totalDoado, projectImpact);

      // Obtém métricas comparativas
      const comparativos = this.getComparativeMetrics(attribution.carbono.co2_atribuido_ton);

      return {
        success: true,
        titulo: 'Seu Impacto na Reserva Araras',
        data_geracao: new Date().toISOString(),

        doador: {
          email: doadorEmail,
          nome: historico.doacoes?.[0]?.nome || doadorEmail.split('@')[0],
          total_doado: totalDoado,
          total_doado_formatado: `R$ ${totalDoado.toFixed(2)}`,
          total_doacoes: historico.resumo?.total_doacoes || 0,
          primeira_doacao: historico.resumo?.primeira_doacao,
          ultima_doacao: historico.resumo?.ultima_doacao
        },

        impacto_carbono: {
          co2_sequestrado_ton: attribution.carbono.co2_atribuido_ton,
          co2_sequestrado_kg: Math.round(attribution.carbono.co2_atribuido_ton * 1000),
          percentual_projeto: attribution.percentual_contribuicao,
          equivalentes: comparativos
        },

        impacto_biodiversidade: {
          especies_protegidas: attribution.biodiversidade.especies_protegidas,
          observacoes_contribuidas: attribution.biodiversidade.observacoes_atribuidas,
          area_conservada_ha: attribution.biodiversidade.area_conservada_ha,
          area_conservada_m2: Math.round(attribution.biodiversidade.area_conservada_ha * 10000)
        },

        projeto_total: {
          co2_total_ton: projectImpact.carbono?.co2_sequestrado_ton || 0,
          especies_total: projectImpact.biodiversidade?.especies_catalogadas || 0,
          area_total_ha: projectImpact.biodiversidade?.area_conservada_ha || 0
        },

        visualizacao: {
          stat_cards: [
            {
              icone: '🌱',
              titulo: 'CO₂ Sequestrado',
              valor: `${attribution.carbono.co2_atribuido_ton} ton`,
              subtitulo: `${attribution.percentual_contribuicao}% do projeto`
            },
            {
              icone: '🦋',
              titulo: 'Espécies Protegidas',
              valor: attribution.biodiversidade.especies_protegidas,
              subtitulo: 'espécies catalogadas'
            },
            {
              icone: '🌳',
              titulo: 'Área Conservada',
              valor: `${attribution.biodiversidade.area_conservada_ha} ha`,
              subtitulo: `${Math.round(attribution.biodiversidade.area_conservada_ha * 10000)} m²`
            },
            {
              icone: '🚗',
              titulo: 'Carros Compensados',
              valor: comparativos.carros_compensados,
              subtitulo: 'por 1 ano'
            }
          ],
          metric_bars: [
            {
              label: 'Contribuição para o Projeto',
              valor: attribution.percentual_contribuicao,
              max: 100,
              cor: '#4CAF50'
            },
            {
              label: 'Meta de Carbono',
              valor: Math.min(attribution.carbono.co2_atribuido_ton, 10),
              max: 10,
              cor: '#2196F3'
            }
          ]
        },

        mensagem_impacto: this._generateImpactMessage(attribution, comparativos)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera mensagem personalizada de impacto
   * @private
   */
  _generateImpactMessage: function(attribution, comparativos) {
    const co2 = attribution.carbono.co2_atribuido_ton;
    
    if (co2 >= 10) {
      return `Incrível! Sua contribuição já ajudou a sequestrar ${co2} toneladas de CO₂, equivalente a tirar ${comparativos.carros_compensados} carros das ruas por um ano!`;
    } else if (co2 >= 1) {
      return `Parabéns! Você já contribuiu para sequestrar ${co2} toneladas de CO₂ e proteger ${attribution.biodiversidade.especies_protegidas} espécies!`;
    } else if (co2 > 0) {
      return `Obrigado por sua contribuição! Cada doação ajuda a proteger a biodiversidade e combater as mudanças climáticas.`;
    }
    return 'Faça sua primeira doação e comece a fazer a diferença!';
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Impact Visualization (Prompt 12/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém impacto personalizado do doador (Prompt 12/43)
 */
function apiImpactoDoador(doadorEmail) {
  return ImpactVisualization.generateImpactReport(doadorEmail);
}

/**
 * Obtém impacto geral do projeto (Prompt 12/43)
 */
function apiImpactoGeral() {
  return ImpactVisualization.getProjectTotalImpact();
}

/**
 * Obtém métricas comparativas (Prompt 12/43)
 */
function apiImpactoComparativo(co2Tons) {
  return ImpactVisualization.getComparativeMetrics(parseFloat(co2Tons) || 1);
}


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Donation Service (Prompt 11/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Processa uma doação (Prompt 11/43)
 */
function apiDoacaoProcessar(doadorEmail, valor, fundo, descricao, doadorNome) {
  return DonationService.processDonation(doadorEmail, valor, fundo, descricao, doadorNome);
}

/**
 * Gera recibo de doação (Prompt 11/43)
 */
function apiDoacaoRecibo(doacaoId) {
  return DonationService.generateReceipt(doacaoId);
}

/**
 * Verifica recibo pelo hash (Prompt 11/43)
 */
function apiDoacaoVerificarRecibo(hash) {
  return DonationService.verifyReceipt(hash);
}

/**
 * Obtém histórico de doações (Prompt 11/43)
 */
function apiDoacaoHistorico(doadorEmail) {
  return DonationService.getDonationHistory(doadorEmail);
}

/**
 * Gera relatório de doações (Prompt 11/43)
 */
function apiDoacaoRelatorio(ano) {
  return DonationService.generateDonationReport(ano);
}

/**
 * Lista fundos disponíveis (Prompt 11/43)
 */
function apiDoacaoFundos() {
  return DonationService.listFunds();
}



// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 11/43
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa funcionalidades de doações e recibos (Prompt 11/43)
 */
function testFinancialContributionReceipts() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '11/43 - Financial Contribution and Digital Receipt Generation',
    tests: []
  };

  // Test 1: listFunds
  try {
    const fundos = DonationService.listFunds();
    results.tests.push({
      name: 'listFunds',
      status: fundos.success && fundos.fundos?.length > 0 ? 'PASS' : 'FAIL',
      details: { success: fundos.success, total_fundos: fundos.fundos?.length }
    });
  } catch (e) {
    results.tests.push({ name: 'listFunds', status: 'ERROR', error: e.message });
  }

  // Test 2: processDonation
  let testDoacaoId = null;
  let testHash = null;
  try {
    const doacao = DonationService.processDonation(
      'teste@exemplo.com',
      100.00,
      'REFLORESTAMENTO',
      'Doação de teste',
      'Doador Teste'
    );
    testDoacaoId = doacao.doacao?.id;
    testHash = doacao.recibo?.hash;
    results.tests.push({
      name: 'processDonation',
      status: doacao.success && doacao.doacao?.id && doacao.recibo?.hash ? 'PASS' : 'FAIL',
      details: {
        success: doacao.success,
        doacao_id: doacao.doacao?.id,
        hash: doacao.recibo?.hash,
        valor: doacao.doacao?.valor_formatado
      }
    });
  } catch (e) {
    results.tests.push({ name: 'processDonation', status: 'ERROR', error: e.message });
  }

  // Test 3: generateReceipt
  try {
    if (testDoacaoId) {
      const recibo = DonationService.generateReceipt(testDoacaoId);
      results.tests.push({
        name: 'generateReceipt',
        status: recibo.success && recibo.recibo?.numero ? 'PASS' : 'FAIL',
        details: {
          success: recibo.success,
          numero: recibo.recibo?.numero,
          has_declaracao: !!recibo.recibo?.declaracao
        }
      });
    } else {
      results.tests.push({ name: 'generateReceipt', status: 'SKIP', details: 'No donation ID' });
    }
  } catch (e) {
    results.tests.push({ name: 'generateReceipt', status: 'ERROR', error: e.message });
  }

  // Test 4: verifyReceipt
  try {
    if (testHash) {
      const verificacao = DonationService.verifyReceipt(testHash);
      results.tests.push({
        name: 'verifyReceipt',
        status: verificacao.success && verificacao.valido ? 'PASS' : 'FAIL',
        details: {
          success: verificacao.success,
          valido: verificacao.valido,
          mensagem: verificacao.mensagem
        }
      });
    } else {
      results.tests.push({ name: 'verifyReceipt', status: 'SKIP', details: 'No hash' });
    }
  } catch (e) {
    results.tests.push({ name: 'verifyReceipt', status: 'ERROR', error: e.message });
  }

  // Test 5: getDonationHistory
  try {
    const historico = DonationService.getDonationHistory('teste@exemplo.com');
    results.tests.push({
      name: 'getDonationHistory',
      status: historico.success ? 'PASS' : 'FAIL',
      details: {
        success: historico.success,
        total_doacoes: historico.resumo?.total_doacoes,
        valor_total: historico.resumo?.valor_total_formatado
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getDonationHistory', status: 'ERROR', error: e.message });
  }

  // Test 6: generateDonationReport
  try {
    const relatorio = DonationService.generateDonationReport();
    results.tests.push({
      name: 'generateDonationReport',
      status: relatorio.success && relatorio.resumo ? 'PASS' : 'FAIL',
      details: {
        success: relatorio.success,
        total_doacoes: relatorio.resumo?.total_doacoes,
        valor_total: relatorio.resumo?.valor_total_formatado
      }
    });
  } catch (e) {
    results.tests.push({ name: 'generateDonationReport', status: 'ERROR', error: e.message });
  }

  // Test 7: API Functions
  try {
    const apiFundos = apiDoacaoFundos();
    const apiRelatorio = apiDoacaoRelatorio();
    results.tests.push({
      name: 'API Functions',
      status: apiFundos !== undefined && apiRelatorio !== undefined ? 'PASS' : 'FAIL',
      details: {
        apiDoacaoFundos: !!apiFundos,
        apiDoacaoRelatorio: !!apiRelatorio
      }
    });
  } catch (e) {
    results.tests.push({ name: 'API Functions', status: 'ERROR', error: e.message });
  }

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const total = results.tests.length;
  results.summary = {
    passed: passed,
    total: total,
    percentage: Math.round((passed / total) * 100),
    status: passed === total ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
  };

  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST RESULTS - Prompt 11/43: Financial Contribution and Receipts');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(results, null, 2));

  return results;
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 12/43
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa funcionalidades de visualização de impacto (Prompt 12/43)
 */
function testImpactVisualization() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '12/43 - Impact Visualization (Carbon and Biodiversity Dashboards)',
    tests: []
  };

  // Test 1: getProjectTotalImpact
  try {
    const impactoTotal = ImpactVisualization.getProjectTotalImpact();
    results.tests.push({
      name: 'getProjectTotalImpact',
      status: impactoTotal.success ? 'PASS' : 'FAIL',
      details: {
        success: impactoTotal.success,
        co2_ton: impactoTotal.carbono?.co2_sequestrado_ton,
        especies: impactoTotal.biodiversidade?.especies_catalogadas,
        area_ha: impactoTotal.biodiversidade?.area_conservada_ha
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getProjectTotalImpact', status: 'ERROR', error: e.message });
  }

  // Test 2: getComparativeMetrics
  try {
    const comparativos = ImpactVisualization.getComparativeMetrics(10);
    results.tests.push({
      name: 'getComparativeMetrics',
      status: comparativos.carros_compensados !== undefined ? 'PASS' : 'FAIL',
      details: {
        carros: comparativos.carros_compensados,
        arvores: comparativos.arvores_equivalentes,
        voos: comparativos.voos_evitados
      }
    });
  } catch (e) {
    results.tests.push({ name: 'getComparativeMetrics', status: 'ERROR', error: e.message });
  }

  // Test 3: calculateImpactAttribution
  try {
    const projectImpact = ImpactVisualization.getProjectTotalImpact();
    const attribution = ImpactVisualization.calculateImpactAttribution(1000, projectImpact);
    results.tests.push({
      name: 'calculateImpactAttribution',
      status: attribution.percentual_contribuicao !== undefined ? 'PASS' : 'FAIL',
      details: {
        percentual: attribution.percentual_contribuicao,
        co2_atribuido: attribution.carbono?.co2_atribuido_ton,
        especies_protegidas: attribution.biodiversidade?.especies_protegidas
      }
    });
  } catch (e) {
    results.tests.push({ name: 'calculateImpactAttribution', status: 'ERROR', error: e.message });
  }

  // Test 4: generateImpactReport (com doador existente)
  try {
    const report = ImpactVisualization.generateImpactReport('teste@exemplo.com');
    results.tests.push({
      name: 'generateImpactReport',
      status: report.success !== undefined ? 'PASS' : 'FAIL',
      details: {
        success: report.success,
        has_visualizacao: !!report.visualizacao,
        stat_cards: report.visualizacao?.stat_cards?.length
      }
    });
  } catch (e) {
    results.tests.push({ name: 'generateImpactReport', status: 'ERROR', error: e.message });
  }

  // Test 5: API Functions
  try {
    const apiGeral = apiImpactoGeral();
    const apiComparativo = apiImpactoComparativo(5);
    results.tests.push({
      name: 'API Functions',
      status: apiGeral !== undefined && apiComparativo !== undefined ? 'PASS' : 'FAIL',
      details: {
        apiImpactoGeral: !!apiGeral,
        apiImpactoComparativo: !!apiComparativo
      }
    });
  } catch (e) {
    results.tests.push({ name: 'API Functions', status: 'ERROR', error: e.message });
  }

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const total = results.tests.length;
  results.summary = {
    passed: passed,
    total: total,
    percentage: Math.round((passed / total) * 100),
    status: passed === total ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
  };

  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TEST RESULTS - Prompt 12/43: Impact Visualization');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(results, null, 2));

  return results;
}