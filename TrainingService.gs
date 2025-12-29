/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - PLANO DE TREINAMENTO E CAPACITAÇÃO
 * ═══════════════════════════════════════════════════════════════════════════
 * P36 - Training and Certification System
 * 
 * Módulos:
 * - Módulo 1: Fundamentos (4h)
 * - Módulo 2: IoT e Sensores (3h)
 * - Módulo 3: Análises Avançadas (4h)
 * - Módulo 4: Gestão (2h)
 * 
 * Carga horária total: 13 horas
 * Certificação ao final
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const TREINAMENTO_HEADERS = [
  'ID_Inscricao', 'Usuario_Email', 'Usuario_Nome', 'Modulo', 'Status',
  'Data_Inicio', 'Data_Conclusao', 'Nota_Avaliacao', 'Certificado_ID'
];

const CERTIFICADOS_HEADERS = [
  'ID_Certificado', 'Usuario_Email', 'Usuario_Nome', 'Modulos_Concluidos',
  'Carga_Horaria', 'Nota_Final', 'Data_Emissao', 'Validade', 'Hash'
];

/**
 * Sistema de Treinamento
 * @namespace Training
 */
const Training = {
  
  SHEET_TREINAMENTO: 'TREINAMENTO_RA',
  SHEET_CERTIFICADOS: 'CERTIFICADOS_RA',
  
  /**
   * Módulos de treinamento
   */
  MODULOS: {
    M1: {
      codigo: 'M1',
      nome: 'Fundamentos do Sistema',
      descricao: 'Visão geral, navegação e cadastro de observações',
      carga_horaria: 4,
      icone: '📚',
      cor: '#2196F3',
      topicos: [
        'Visão geral do sistema Reserva Araras',
        'Navegação e interface do usuário',
        'Cadastro de observações de biodiversidade',
        'Consulta e exportação de dados',
        'Boas práticas de registro'
      ],
      prerequisitos: [],
      avaliacao: {
        questoes: 10,
        nota_minima: 70
      }
    },
    M2: {
      codigo: 'M2',
      nome: 'IoT e Sensores',
      descricao: 'Dashboard IoT, interpretação de dados e alertas',
      carga_horaria: 3,
      icone: '📡',
      cor: '#FF9800',
      topicos: [
        'Dashboard IoT consolidado',
        'Interpretação de dados de sensores',
        'Qualidade do ar e IQA',
        'Umidade do solo e irrigação',
        'Resposta a alertas',
        'Manutenção básica de sensores'
      ],
      prerequisitos: ['M1'],
      avaliacao: {
        questoes: 8,
        nota_minima: 70
      }
    },
    M3: {
      codigo: 'M3',
      nome: 'Análises Avançadas',
      descricao: 'Relatórios científicos, análises estatísticas e IA',
      carga_horaria: 4,
      icone: '📊',
      cor: '#4CAF50',
      topicos: [
        'Geração de relatórios científicos',
        'Análises estatísticas de biodiversidade',
        'Interpretação de resultados de IA',
        'Modelos de ocupação e população',
        'Análise de conectividade de habitat',
        'Serviços ecossistêmicos e valoração',
        'Tomada de decisão baseada em dados'
      ],
      prerequisitos: ['M1', 'M2'],
      avaliacao: {
        questoes: 12,
        nota_minima: 75
      }
    },
    M4: {
      codigo: 'M4',
      nome: 'Gestão e Administração',
      descricao: 'Dashboard executivo, KPIs e planejamento estratégico',
      carga_horaria: 2,
      icone: '📋',
      cor: '#9C27B0',
      topicos: [
        'Dashboard executivo e KPIs',
        'Métricas de desempenho',
        'Planejamento estratégico',
        'Recomendações de manejo',
        'Gestão de usuários e permissões',
        'Backup e recuperação'
      ],
      prerequisitos: ['M1'],
      avaliacao: {
        questoes: 8,
        nota_minima: 70
      }
    }
  },

  /**
   * Questões de avaliação por módulo
   */
  QUESTOES: {
    M1: [
      { pergunta: 'Qual é o principal objetivo do sistema Reserva Araras?', opcoes: ['Gestão financeira', 'Monitoramento ambiental integrado', 'Controle de estoque', 'Vendas online'], correta: 1 },
      { pergunta: 'Como acessar o Dashboard Executivo?', opcoes: ['Menu principal', 'Configurações', 'Ajuda', 'Não existe'], correta: 0 },
      { pergunta: 'Qual informação é obrigatória ao registrar uma observação?', opcoes: ['Foto', 'Espécie e localização', 'Temperatura', 'Nome do observador'], correta: 1 },
      { pergunta: 'O que significa a sigla RBAC?', opcoes: ['Remote Backup Access Control', 'Role-Based Access Control', 'Real-time Biodiversity Analysis Center', 'Reserve Backup And Copy'], correta: 1 },
      { pergunta: 'Qual formato é usado para exportar dados para GBIF?', opcoes: ['CSV', 'Darwin Core', 'JSON', 'XML'], correta: 1 }
    ],
    M2: [
      { pergunta: 'O que significa IQA?', opcoes: ['Índice de Qualidade Ambiental', 'Índice de Qualidade do Ar', 'Indicador Quantitativo de Análise', 'Índice de Queimadas Ativas'], correta: 1 },
      { pergunta: 'Qual sensor monitora a umidade do solo?', opcoes: ['Pluviômetro', 'Anemômetro', 'Sensor capacitivo', 'Termômetro'], correta: 2 },
      { pergunta: 'O que fazer quando um alerta crítico é disparado?', opcoes: ['Ignorar', 'Verificar imediatamente', 'Esperar 24h', 'Desligar o sensor'], correta: 1 },
      { pergunta: 'Qual é a frequência ideal de leitura dos sensores?', opcoes: ['1 vez por dia', 'A cada hora', 'Conforme configurado', '1 vez por semana'], correta: 2 }
    ],
    M3: [
      { pergunta: 'O que é um modelo de ocupação?', opcoes: ['Mapa de uso do solo', 'Estimativa de presença de espécie corrigida por detectabilidade', 'Calendário de eventos', 'Plano de manejo'], correta: 1 },
      { pergunta: 'Qual método é usado para estimar população com câmeras trap?', opcoes: ['Contagem direta', 'Lincoln-Petersen', 'Amostragem aleatória', 'Censo total'], correta: 1 },
      { pergunta: 'O que são serviços ecossistêmicos?', opcoes: ['Serviços de manutenção', 'Benefícios que a natureza provê à sociedade', 'Taxas ambientais', 'Licenças de operação'], correta: 1 },
      { pergunta: 'Qual índice mede conectividade de habitat?', opcoes: ['IQA', 'IIC/PC', 'NPS', 'RPO'], correta: 1 }
    ],
    M4: [
      { pergunta: 'O que é RPO em backup?', opcoes: ['Recovery Point Objective', 'Remote Process Operation', 'Real-time Performance Output', 'Reserve Protection Order'], correta: 0 },
      { pergunta: 'Qual papel tem acesso total ao sistema?', opcoes: ['Monitor', 'Pesquisador', 'Admin', 'Visitante'], correta: 2 },
      { pergunta: 'Com que frequência deve ser feito backup?', opcoes: ['Mensal', 'Semanal', 'Diário', 'Anual'], correta: 2 },
      { pergunta: 'O que é NPS?', opcoes: ['Net Promoter Score', 'National Park Service', 'Network Protocol System', 'Natural Protection Standard'], correta: 0 }
    ]
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet1 = ss.getSheetByName(this.SHEET_TREINAMENTO);
      if (!sheet1) {
        sheet1 = ss.insertSheet(this.SHEET_TREINAMENTO);
        sheet1.appendRow(TREINAMENTO_HEADERS);
        this._formatHeader(sheet1, TREINAMENTO_HEADERS.length, '#1565C0');
      }
      
      let sheet2 = ss.getSheetByName(this.SHEET_CERTIFICADOS);
      if (!sheet2) {
        sheet2 = ss.insertSheet(this.SHEET_CERTIFICADOS);
        sheet2.appendRow(CERTIFICADOS_HEADERS);
        this._formatHeader(sheet2, CERTIFICADOS_HEADERS.length, '#0D47A1');
      }
      
      return { success: true };
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
   * Lista módulos disponíveis
   */
  listModules: function() {
    const modulos = Object.values(this.MODULOS).map(m => ({
      ...m,
      carga_horaria_formatada: `${m.carga_horaria}h`
    }));
    
    const cargaTotal = modulos.reduce((sum, m) => sum + m.carga_horaria, 0);
    
    return {
      success: true,
      modulos: modulos,
      total_modulos: modulos.length,
      carga_horaria_total: cargaTotal,
      certificacao: {
        nome: 'Certificado de Capacitação - Reserva Araras',
        carga_horaria: cargaTotal,
        validade_anos: 1
      }
    };
  },

  /**
   * Obtém progresso do usuário
   */
  getUserProgress: function(email) {
    try {
      this.initializeSheets();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_TREINAMENTO);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { 
          success: true, 
          email: email,
          inscricoes: [],
          modulos_concluidos: 0,
          carga_horaria_concluida: 0,
          progresso_percentual: 0
        };
      }
      
      const data = sheet.getDataRange().getValues();
      const inscricoes = [];
      let cargaConcluida = 0;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          const modulo = this.MODULOS[data[i][3]];
          inscricoes.push({
            id: data[i][0],
            modulo: data[i][3],
            modulo_nome: modulo?.nome || data[i][3],
            status: data[i][4],
            data_inicio: data[i][5],
            data_conclusao: data[i][6],
            nota: data[i][7]
          });
          
          if (data[i][4] === 'Concluído' && modulo) {
            cargaConcluida += modulo.carga_horaria;
          }
        }
      }
      
      const totalModulos = Object.keys(this.MODULOS).length;
      const modulosConcluidos = inscricoes.filter(i => i.status === 'Concluído').length;
      const cargaTotal = Object.values(this.MODULOS).reduce((sum, m) => sum + m.carga_horaria, 0);
      
      return {
        success: true,
        email: email,
        inscricoes: inscricoes,
        modulos_concluidos: modulosConcluidos,
        modulos_total: totalModulos,
        carga_horaria_concluida: cargaConcluida,
        carga_horaria_total: cargaTotal,
        progresso_percentual: Math.round((modulosConcluidos / totalModulos) * 100)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Inscreve usuário em módulo
   */
  enrollModule: function(email, nome, moduloCodigo) {
    try {
      this.initializeSheets();
      
      const modulo = this.MODULOS[moduloCodigo];
      if (!modulo) {
        return { success: false, error: 'Módulo não encontrado' };
      }
      
      // Verifica pré-requisitos
      const progress = this.getUserProgress(email);
      const concluidos = progress.inscricoes?.filter(i => i.status === 'Concluído').map(i => i.modulo) || [];
      
      for (const prereq of modulo.prerequisitos) {
        if (!concluidos.includes(prereq)) {
          const prereqModulo = this.MODULOS[prereq];
          return { 
            success: false, 
            error: `Pré-requisito não atendido: ${prereqModulo?.nome || prereq}` 
          };
        }
      }
      
      // Verifica se já está inscrito
      const jaInscrito = progress.inscricoes?.find(i => i.modulo === moduloCodigo);
      if (jaInscrito) {
        return { success: false, error: 'Já inscrito neste módulo', inscricao: jaInscrito };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_TREINAMENTO);
      
      const inscricaoId = `INS-${Date.now().toString(36).toUpperCase()}`;
      
      sheet.appendRow([
        inscricaoId,
        email,
        nome,
        moduloCodigo,
        'Em andamento',
        new Date().toISOString(),
        null,
        null,
        null
      ]);
      
      return {
        success: true,
        inscricao_id: inscricaoId,
        modulo: modulo.nome,
        carga_horaria: modulo.carga_horaria
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém avaliação do módulo
   */
  getModuleQuiz: function(moduloCodigo) {
    const modulo = this.MODULOS[moduloCodigo];
    if (!modulo) {
      return { success: false, error: 'Módulo não encontrado' };
    }
    
    const questoes = this.QUESTOES[moduloCodigo] || [];
    
    // Embaralha questões e seleciona quantidade definida
    const shuffled = [...questoes].sort(() => Math.random() - 0.5);
    const selecionadas = shuffled.slice(0, modulo.avaliacao.questoes);
    
    // Remove resposta correta para enviar ao cliente
    const questoesSemResposta = selecionadas.map((q, idx) => ({
      numero: idx + 1,
      pergunta: q.pergunta,
      opcoes: q.opcoes
    }));
    
    return {
      success: true,
      modulo: moduloCodigo,
      modulo_nome: modulo.nome,
      total_questoes: questoesSemResposta.length,
      nota_minima: modulo.avaliacao.nota_minima,
      questoes: questoesSemResposta,
      _gabarito: selecionadas.map(q => q.correta) // Para verificação
    };
  },

  /**
   * Submete avaliação
   */
  submitQuiz: function(email, moduloCodigo, respostas) {
    try {
      const modulo = this.MODULOS[moduloCodigo];
      if (!modulo) {
        return { success: false, error: 'Módulo não encontrado' };
      }
      
      const questoes = this.QUESTOES[moduloCodigo] || [];
      
      // Calcula nota
      let acertos = 0;
      const totalQuestoes = Math.min(respostas.length, questoes.length);
      
      for (let i = 0; i < totalQuestoes; i++) {
        if (respostas[i] === questoes[i].correta) {
          acertos++;
        }
      }
      
      const nota = Math.round((acertos / totalQuestoes) * 100);
      const aprovado = nota >= modulo.avaliacao.nota_minima;
      
      // Atualiza inscrição
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_TREINAMENTO);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email && data[i][3] === moduloCodigo && data[i][4] === 'Em andamento') {
          sheet.getRange(i + 1, 5).setValue(aprovado ? 'Concluído' : 'Reprovado');
          sheet.getRange(i + 1, 7).setValue(new Date().toISOString());
          sheet.getRange(i + 1, 8).setValue(nota);
          break;
        }
      }
      
      // Verifica se completou todos os módulos
      let certificadoId = null;
      if (aprovado) {
        const progress = this.getUserProgress(email);
        if (progress.modulos_concluidos === Object.keys(this.MODULOS).length) {
          const certResult = this._emitCertificate(email, progress);
          if (certResult.success) {
            certificadoId = certResult.certificado_id;
          }
        }
      }
      
      return {
        success: true,
        modulo: modulo.nome,
        acertos: acertos,
        total: totalQuestoes,
        nota: nota,
        nota_minima: modulo.avaliacao.nota_minima,
        aprovado: aprovado,
        certificado_id: certificadoId,
        mensagem: aprovado 
          ? `Parabéns! Você foi aprovado com ${nota}%!` 
          : `Nota ${nota}% abaixo do mínimo (${modulo.avaliacao.nota_minima}%). Tente novamente.`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Emite certificado
   * @private
   */
  _emitCertificate: function(email, progress) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CERTIFICADOS);
      
      // Verifica se já tem certificado
      if (sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][1] === email) {
            return { success: true, certificado_id: data[i][0], ja_emitido: true };
          }
        }
      }
      
      const certificadoId = `CERT-${Date.now().toString(36).toUpperCase()}`;
      const cargaTotal = Object.values(this.MODULOS).reduce((sum, m) => sum + m.carga_horaria, 0);
      
      // Calcula nota média
      const notas = progress.inscricoes.filter(i => i.nota).map(i => i.nota);
      const notaMedia = notas.length > 0 ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
      
      // Gera hash de verificação
      const hashData = `${certificadoId}-${email}-${cargaTotal}-${Date.now()}`;
      let hash = 0;
      for (let i = 0; i < hashData.length; i++) {
        hash = ((hash << 5) - hash) + hashData.charCodeAt(i);
        hash = hash & hash;
      }
      const hashStr = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
      
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      
      sheet.appendRow([
        certificadoId,
        email,
        progress.inscricoes[0]?.nome || email.split('@')[0],
        Object.keys(this.MODULOS).length,
        cargaTotal,
        notaMedia,
        new Date().toISOString(),
        validade.toISOString(),
        hashStr
      ]);
      
      return { success: true, certificado_id: certificadoId, hash: hashStr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém certificado do usuário
   */
  getCertificate: function(email) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CERTIFICADOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Certificado não encontrado' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          return {
            success: true,
            certificado: {
              id: data[i][0],
              email: data[i][1],
              nome: data[i][2],
              modulos_concluidos: data[i][3],
              carga_horaria: data[i][4],
              nota_final: data[i][5],
              data_emissao: data[i][6],
              validade: data[i][7],
              hash: data[i][8],
              valido: new Date(data[i][7]) > new Date()
            }
          };
        }
      }
      
      return { success: false, error: 'Certificado não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Verifica certificado por hash
   */
  verifyCertificate: function(hash) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_CERTIFICADOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, valido: false, error: 'Certificado não encontrado' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][8] === hash) {
          const validade = new Date(data[i][7]);
          const valido = validade > new Date();
          
          return {
            success: true,
            valido: valido,
            certificado: {
              id: data[i][0],
              nome: data[i][2],
              carga_horaria: data[i][4],
              data_emissao: data[i][6],
              validade: data[i][7],
              status: valido ? 'Válido' : 'Expirado'
            }
          };
        }
      }
      
      return { success: false, valido: false, error: 'Certificado não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas de treinamento
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const treinamentoSheet = ss.getSheetByName(this.SHEET_TREINAMENTO);
      const certificadosSheet = ss.getSheetByName(this.SHEET_CERTIFICADOS);
      
      const stats = {
        total_inscricoes: 0,
        inscricoes_concluidas: 0,
        inscricoes_em_andamento: 0,
        total_certificados: 0,
        por_modulo: {},
        nota_media_geral: 0
      };
      
      if (treinamentoSheet && treinamentoSheet.getLastRow() > 1) {
        const data = treinamentoSheet.getDataRange().getValues().slice(1);
        stats.total_inscricoes = data.length;
        stats.inscricoes_concluidas = data.filter(r => r[4] === 'Concluído').length;
        stats.inscricoes_em_andamento = data.filter(r => r[4] === 'Em andamento').length;
        
        // Por módulo
        Object.keys(this.MODULOS).forEach(m => {
          const moduloData = data.filter(r => r[3] === m);
          stats.por_modulo[m] = {
            inscricoes: moduloData.length,
            concluidos: moduloData.filter(r => r[4] === 'Concluído').length
          };
        });
        
        // Nota média
        const notas = data.filter(r => r[7]).map(r => r[7]);
        if (notas.length > 0) {
          stats.nota_media_geral = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
        }
      }
      
      if (certificadosSheet && certificadosSheet.getLastRow() > 1) {
        stats.total_certificados = certificadosSheet.getLastRow() - 1;
      }
      
      return { success: true, estatisticas: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Treinamento
// ═══════════════════════════════════════════════════════════════════════════

function apiTreinamentoInit() {
  return Training.initializeSheets();
}

function apiTreinamentoListarModulos() {
  return Training.listModules();
}

function apiTreinamentoProgresso(email) {
  return Training.getUserProgress(email);
}

function apiTreinamentoInscrever(email, nome, moduloCodigo) {
  return Training.enrollModule(email, nome, moduloCodigo);
}

function apiTreinamentoQuiz(moduloCodigo) {
  return Training.getModuleQuiz(moduloCodigo);
}

function apiTreinamentoSubmeterQuiz(email, moduloCodigo, respostas) {
  return Training.submitQuiz(email, moduloCodigo, respostas);
}

function apiTreinamentoCertificado(email) {
  return Training.getCertificate(email);
}

function apiTreinamentoVerificarCertificado(hash) {
  return Training.verifyCertificate(hash);
}

function apiTreinamentoEstatisticas() {
  return Training.getStatistics();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 9/43 - Team Performance and Training Oversight
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuração de certificações obrigatórias por função
 */
const REQUIRED_CERTIFICATIONS = {
  TRILHEIRO: {
    modulos_obrigatorios: ['M1', 'M2'],
    certificacoes_especiais: ['Segurança contra Incêndios', 'Primeiros Socorros'],
    validade_meses: 12
  },
  AMBIENTALISTA: {
    modulos_obrigatorios: ['M1', 'M2', 'M3'],
    certificacoes_especiais: ['Segurança contra Incêndios', 'Manejo de Fauna'],
    validade_meses: 12
  },
  PESQUISADOR: {
    modulos_obrigatorios: ['M1', 'M2', 'M3'],
    certificacoes_especiais: ['Ética em Pesquisa'],
    validade_meses: 24
  },
  GESTOR: {
    modulos_obrigatorios: ['M1', 'M4'],
    certificacoes_especiais: [],
    validade_meses: 12
  }
};

/**
 * Extensão do Training para gestão de equipe (Prompt 9/43)
 */
const TeamTrainingManager = {

  /**
   * Audita certificações expiradas de todos os usuários
   * @returns {Object} Lista de certificações expiradas
   */
  auditExpiredCertifications: function() {
    try {
      const ss = getSpreadsheet();
      const certSheet = ss.getSheetByName(Training.SHEET_CERTIFICADOS);
      const usersSheet = ss.getSheetByName(CONFIG.SHEETS.USUARIOS_RBAC_RA);
      
      const expired = [];
      const expiringSoon = []; // Próximos 30 dias
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(em30Dias.getDate() + 30);

      if (certSheet && certSheet.getLastRow() > 1) {
        const certData = certSheet.getDataRange().getValues().slice(1);
        
        certData.forEach(row => {
          const validade = new Date(row[7]);
          const email = row[1];
          const nome = row[2];
          const certId = row[0];
          
          if (validade < hoje) {
            expired.push({
              certificado_id: certId,
              email: email,
              nome: nome,
              data_emissao: row[6],
              validade: row[7],
              dias_expirado: Math.floor((hoje - validade) / (1000 * 60 * 60 * 24)),
              status: 'Expirado'
            });
          } else if (validade < em30Dias) {
            expiringSoon.push({
              certificado_id: certId,
              email: email,
              nome: nome,
              validade: row[7],
              dias_restantes: Math.floor((validade - hoje) / (1000 * 60 * 60 * 24)),
              status: 'Expirando em breve'
            });
          }
        });
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        resumo: {
          total_expirados: expired.length,
          expirando_30_dias: expiringSoon.length,
          acao_necessaria: expired.length > 0
        },
        certificados_expirados: expired,
        certificados_expirando: expiringSoon
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Identifica membros com módulos incompletos
   * @param {string} moduloEspecifico - Filtrar por módulo específico (opcional)
   * @returns {Object} Lista de usuários com módulos incompletos
   */
  identifyIncompleteModules: function(moduloEspecifico) {
    try {
      const ss = getSpreadsheet();
      const treinamentoSheet = ss.getSheetByName(Training.SHEET_TREINAMENTO);
      const usersSheet = ss.getSheetByName(CONFIG.SHEETS.USUARIOS_RBAC_RA);
      
      const incompletos = [];
      const todosModulos = Object.keys(Training.MODULOS);
      
      // Obtém todos os usuários do sistema
      const usuarios = {};
      if (usersSheet && usersSheet.getLastRow() > 1) {
        const userData = usersSheet.getDataRange().getValues().slice(1);
        userData.forEach(row => {
          if (row[1] && row[3]) { // email e role
            usuarios[row[1]] = {
              email: row[1],
              nome: row[2] || row[1].split('@')[0],
              role: row[3],
              modulos_concluidos: [],
              modulos_em_andamento: [],
              modulos_faltantes: [...todosModulos]
            };
          }
        });
      }

      // Processa inscrições de treinamento
      if (treinamentoSheet && treinamentoSheet.getLastRow() > 1) {
        const treinamentoData = treinamentoSheet.getDataRange().getValues().slice(1);
        
        treinamentoData.forEach(row => {
          const email = row[1];
          const modulo = row[3];
          const status = row[4];
          
          if (usuarios[email]) {
            // Remove dos faltantes
            const idx = usuarios[email].modulos_faltantes.indexOf(modulo);
            if (idx > -1) {
              usuarios[email].modulos_faltantes.splice(idx, 1);
            }
            
            if (status === 'Concluído') {
              usuarios[email].modulos_concluidos.push(modulo);
            } else if (status === 'Em andamento') {
              usuarios[email].modulos_em_andamento.push(modulo);
            }
          }
        });
      }

      // Filtra usuários com módulos incompletos
      Object.values(usuarios).forEach(user => {
        const temIncompleto = user.modulos_faltantes.length > 0 || user.modulos_em_andamento.length > 0;
        
        if (temIncompleto) {
          // Verifica requisitos obrigatórios por função
          const requisitos = REQUIRED_CERTIFICATIONS[user.role];
          let modulosObrigatoriosFaltantes = [];
          
          if (requisitos) {
            modulosObrigatoriosFaltantes = requisitos.modulos_obrigatorios.filter(
              m => !user.modulos_concluidos.includes(m)
            );
          }

          // Filtra por módulo específico se solicitado
          if (moduloEspecifico) {
            if (user.modulos_faltantes.includes(moduloEspecifico) || 
                user.modulos_em_andamento.includes(moduloEspecifico)) {
              incompletos.push({
                ...user,
                modulos_obrigatorios_faltantes: modulosObrigatoriosFaltantes,
                prioridade: modulosObrigatoriosFaltantes.length > 0 ? 'Alta' : 'Normal'
              });
            }
          } else {
            incompletos.push({
              ...user,
              modulos_obrigatorios_faltantes: modulosObrigatoriosFaltantes,
              prioridade: modulosObrigatoriosFaltantes.length > 0 ? 'Alta' : 'Normal'
            });
          }
        }
      });

      // Ordena por prioridade
      incompletos.sort((a, b) => {
        if (a.prioridade === 'Alta' && b.prioridade !== 'Alta') return -1;
        if (a.prioridade !== 'Alta' && b.prioridade === 'Alta') return 1;
        return b.modulos_faltantes.length - a.modulos_faltantes.length;
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        filtro_modulo: moduloEspecifico || 'Todos',
        resumo: {
          total_usuarios: Object.keys(usuarios).length,
          usuarios_incompletos: incompletos.length,
          alta_prioridade: incompletos.filter(u => u.prioridade === 'Alta').length
        },
        usuarios: incompletos
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Agenda sessões de reciclagem para funções específicas
   * @param {Array} roles - Funções a incluir (ex: ['TRILHEIRO', 'AMBIENTALISTA'])
   * @param {string} tipoSessao - Tipo de sessão (ex: 'Segurança contra Incêndios')
   * @returns {Object} Sessões agendadas
   */
  scheduleRefresherSessions: function(roles, tipoSessao) {
    try {
      const ss = getSpreadsheet();
      const usersSheet = ss.getSheetByName(CONFIG.SHEETS.USUARIOS_RBAC_RA);
      
      if (!roles || roles.length === 0) {
        roles = ['TRILHEIRO', 'AMBIENTALISTA'];
      }
      
      if (!tipoSessao) {
        tipoSessao = 'Reciclagem Geral';
      }

      const usuariosParaSessao = [];
      
      // Identifica usuários das funções especificadas
      if (usersSheet && usersSheet.getLastRow() > 1) {
        const userData = usersSheet.getDataRange().getValues().slice(1);
        
        userData.forEach(row => {
          const email = row[1];
          const nome = row[2] || email.split('@')[0];
          const role = row[3];
          
          if (roles.includes(role)) {
            usuariosParaSessao.push({
              email: email,
              nome: nome,
              role: role
            });
          }
        });
      }

      // Cria registro de sessão agendada
      let sessaoSheet = ss.getSheetByName('SESSOES_RECICLAGEM_RA');
      if (!sessaoSheet) {
        sessaoSheet = ss.insertSheet('SESSOES_RECICLAGEM_RA');
        sessaoSheet.appendRow([
          'ID_Sessao', 'Tipo', 'Roles', 'Data_Agendada', 'Status', 
          'Participantes', 'Criado_Em', 'Criado_Por'
        ]);
      }

      const sessaoId = `RECICL-${Date.now().toString(36).toUpperCase()}`;
      const dataAgendada = new Date();
      dataAgendada.setDate(dataAgendada.getDate() + 7); // Agenda para 7 dias

      sessaoSheet.appendRow([
        sessaoId,
        tipoSessao,
        roles.join(', '),
        dataAgendada.toISOString(),
        'Agendada',
        usuariosParaSessao.length,
        new Date().toISOString(),
        Session.getActiveUser().getEmail() || 'sistema'
      ]);

      // Registra convites individuais
      let convitesSheet = ss.getSheetByName('CONVITES_RECICLAGEM_RA');
      if (!convitesSheet) {
        convitesSheet = ss.insertSheet('CONVITES_RECICLAGEM_RA');
        convitesSheet.appendRow([
          'ID_Convite', 'Sessao_ID', 'Email', 'Nome', 'Role', 
          'Status', 'Data_Envio', 'Data_Confirmacao'
        ]);
      }

      usuariosParaSessao.forEach(user => {
        const conviteId = `CONV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4)}`;
        convitesSheet.appendRow([
          conviteId,
          sessaoId,
          user.email,
          user.nome,
          user.role,
          'Pendente',
          new Date().toISOString(),
          null
        ]);
      });

      return {
        success: true,
        sessao: {
          id: sessaoId,
          tipo: tipoSessao,
          roles: roles,
          data_agendada: dataAgendada.toISOString(),
          status: 'Agendada'
        },
        participantes: {
          total: usuariosParaSessao.length,
          lista: usuariosParaSessao
        },
        mensagem: `Sessão de ${tipoSessao} agendada para ${dataAgendada.toLocaleDateString('pt-BR')} com ${usuariosParaSessao.length} participante(s)`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório completo de desempenho da equipe
   * @returns {Object} Relatório consolidado
   */
  generateTeamPerformanceReport: function() {
    try {
      const expired = this.auditExpiredCertifications();
      const incomplete = this.identifyIncompleteModules();
      const stats = Training.getStatistics();

      // Análise por função
      const ss = getSpreadsheet();
      const usersSheet = ss.getSheetByName(CONFIG.SHEETS.USUARIOS_RBAC_RA);
      const porFuncao = {};

      if (usersSheet && usersSheet.getLastRow() > 1) {
        const userData = usersSheet.getDataRange().getValues().slice(1);
        userData.forEach(row => {
          const role = row[3];
          if (role) {
            if (!porFuncao[role]) {
              porFuncao[role] = { total: 0, completos: 0, incompletos: 0 };
            }
            porFuncao[role].total++;
          }
        });
      }

      // Conta completos/incompletos por função
      incomplete.usuarios?.forEach(user => {
        if (porFuncao[user.role]) {
          porFuncao[user.role].incompletos++;
        }
      });

      Object.keys(porFuncao).forEach(role => {
        porFuncao[role].completos = porFuncao[role].total - porFuncao[role].incompletos;
        porFuncao[role].taxa_conclusao = porFuncao[role].total > 0 
          ? Math.round((porFuncao[role].completos / porFuncao[role].total) * 100) 
          : 0;
      });

      return {
        success: true,
        titulo: 'Relatório de Desempenho e Treinamento da Equipe',
        data_geracao: new Date().toISOString(),
        
        sumario_executivo: {
          total_inscricoes: stats.estatisticas?.total_inscricoes || 0,
          taxa_conclusao_geral: stats.estatisticas?.total_inscricoes > 0 
            ? Math.round((stats.estatisticas.inscricoes_concluidas / stats.estatisticas.total_inscricoes) * 100) 
            : 0,
          certificados_emitidos: stats.estatisticas?.total_certificados || 0,
          certificados_expirados: expired.resumo?.total_expirados || 0,
          usuarios_com_pendencias: incomplete.resumo?.usuarios_incompletos || 0,
          nota_media: stats.estatisticas?.nota_media_geral || 0
        },

        certificacoes: {
          expiradas: expired.certificados_expirados || [],
          expirando_30_dias: expired.certificados_expirando || []
        },

        modulos_incompletos: {
          alta_prioridade: incomplete.usuarios?.filter(u => u.prioridade === 'Alta') || [],
          total: incomplete.usuarios || []
        },

        analise_por_funcao: porFuncao,

        acoes_recomendadas: this._generateTrainingRecommendations(expired, incomplete, porFuncao)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera recomendações de treinamento
   * @private
   */
  _generateTrainingRecommendations: function(expired, incomplete, porFuncao) {
    const recomendacoes = [];

    if ((expired.resumo?.total_expirados || 0) > 0) {
      recomendacoes.push({
        prioridade: 'Alta',
        area: 'Certificações',
        acao: `Renovar ${expired.resumo.total_expirados} certificado(s) expirado(s) imediatamente`,
        impacto: 'Conformidade e segurança operacional'
      });
    }

    if ((expired.resumo?.expirando_30_dias || 0) > 0) {
      recomendacoes.push({
        prioridade: 'Média',
        area: 'Certificações',
        acao: `Agendar renovação de ${expired.resumo.expirando_30_dias} certificado(s) que expiram em 30 dias`,
        impacto: 'Prevenção de gaps de certificação'
      });
    }

    const altaPrioridade = incomplete.usuarios?.filter(u => u.prioridade === 'Alta').length || 0;
    if (altaPrioridade > 0) {
      recomendacoes.push({
        prioridade: 'Alta',
        area: 'Treinamento',
        acao: `${altaPrioridade} colaborador(es) com módulos obrigatórios pendentes`,
        impacto: 'Qualificação mínima para função'
      });
    }

    // Verifica funções com baixa taxa de conclusão
    Object.entries(porFuncao).forEach(([role, data]) => {
      if (data.taxa_conclusao < 50 && data.total >= 2) {
        recomendacoes.push({
          prioridade: 'Média',
          area: 'Capacitação',
          acao: `Função ${role} com apenas ${data.taxa_conclusao}% de conclusão de treinamentos`,
          impacto: 'Qualidade operacional'
        });
      }
    });

    return recomendacoes;
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Team Training Management (Prompt 9/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Audita certificações expiradas (Prompt 9/43)
 */
function apiTreinamentoAuditarExpirados() {
  return TeamTrainingManager.auditExpiredCertifications();
}

/**
 * Identifica módulos incompletos (Prompt 9/43)
 */
function apiTreinamentoModulosIncompletos(moduloEspecifico) {
  return TeamTrainingManager.identifyIncompleteModules(moduloEspecifico);
}

/**
 * Agenda sessões de reciclagem (Prompt 9/43)
 */
function apiTreinamentoAgendarReciclagem(roles, tipoSessao) {
  const rolesArray = Array.isArray(roles) ? roles : (roles ? [roles] : ['TRILHEIRO', 'AMBIENTALISTA']);
  return TeamTrainingManager.scheduleRefresherSessions(rolesArray, tipoSessao);
}

/**
 * Gera relatório de desempenho da equipe (Prompt 9/43)
 */
function apiTreinamentoRelatorioEquipe() {
  return TeamTrainingManager.generateTeamPerformanceReport();
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - Prompt 9/43
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa funcionalidades de gestão de treinamento da equipe (Prompt 9/43)
 */
function testTeamPerformanceTraining() {
  const results = {
    timestamp: new Date().toISOString(),
    prompt: '9/43 - Team Performance and Training Oversight',
    tests: []
  };

  // Test 1: auditExpiredCertifications
  try {
    const expired = TeamTrainingManager.auditExpiredCertifications();
    results.tests.push({
      name: 'auditExpiredCertifications',
      status: expired.success !== undefined ? 'PASS' : 'FAIL',
      details: {
        success: expired.success,
        total_expirados: expired.resumo?.total_expirados,
        expirando_30_dias: expired.resumo?.expirando_30_dias
      }
    });
  } catch (e) {
    results.tests.push({ name: 'auditExpiredCertifications', status: 'ERROR', error: e.message });
  }

  // Test 2: identifyIncompleteModules
  try {
    const incomplete = TeamTrainingManager.identifyIncompleteModules();
    results.tests.push({
      name: 'identifyIncompleteModules',
      status: incomplete.success !== undefined ? 'PASS' : 'FAIL',
      details: {
        success: incomplete.success,
        total_usuarios: incomplete.resumo?.total_usuarios,
        usuarios_incompletos: incomplete.resumo?.usuarios_incompletos
      }
    });
  } catch (e) {
    results.tests.push({ name: 'identifyIncompleteModules', status: 'ERROR', error: e.message });
  }

  // Test 3: identifyIncompleteModules with filter
  try {
    const incompleteM1 = TeamTrainingManager.identifyIncompleteModules('M1');
    results.tests.push({
      name: 'identifyIncompleteModules (filtered)',
      status: incompleteM1.success !== undefined && incompleteM1.filtro_modulo === 'M1' ? 'PASS' : 'FAIL',
      details: {
        success: incompleteM1.success,
        filtro: incompleteM1.filtro_modulo
      }
    });
  } catch (e) {
    results.tests.push({ name: 'identifyIncompleteModules (filtered)', status: 'ERROR', error: e.message });
  }

  // Test 4: scheduleRefresherSessions
  try {
    const sessao = TeamTrainingManager.scheduleRefresherSessions(['TRILHEIRO'], 'Segurança contra Incêndios');
    results.tests.push({
      name: 'scheduleRefresherSessions',
      status: sessao.success && sessao.sessao?.id ? 'PASS' : 'FAIL',
      details: {
        success: sessao.success,
        sessao_id: sessao.sessao?.id,
        tipo: sessao.sessao?.tipo,
        participantes: sessao.participantes?.total
      }
    });
  } catch (e) {
    results.tests.push({ name: 'scheduleRefresherSessions', status: 'ERROR', error: e.message });
  }

  // Test 5: generateTeamPerformanceReport
  try {
    const report = TeamTrainingManager.generateTeamPerformanceReport();
    results.tests.push({
      name: 'generateTeamPerformanceReport',
      status: report.success && report.sumario_executivo ? 'PASS' : 'FAIL',
      details: {
        success: report.success,
        titulo: report.titulo,
        has_sumario: !!report.sumario_executivo,
        has_recomendacoes: !!report.acoes_recomendadas
      }
    });
  } catch (e) {
    results.tests.push({ name: 'generateTeamPerformanceReport', status: 'ERROR', error: e.message });
  }

  // Test 6: API Functions
  try {
    const apiExpired = apiTreinamentoAuditarExpirados();
    const apiIncomplete = apiTreinamentoModulosIncompletos();
    const apiReport = apiTreinamentoRelatorioEquipe();
    results.tests.push({
      name: 'API Functions',
      status: apiExpired !== undefined && apiIncomplete !== undefined && apiReport !== undefined ? 'PASS' : 'FAIL',
      details: {
        apiTreinamentoAuditarExpirados: !!apiExpired,
        apiTreinamentoModulosIncompletos: !!apiIncomplete,
        apiTreinamentoRelatorioEquipe: !!apiReport
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
  Logger.log('TEST RESULTS - Prompt 9/43: Team Performance and Training');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(JSON.stringify(results, null, 2));
  
  return results;
}
