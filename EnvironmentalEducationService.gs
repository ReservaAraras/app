/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE EDUCAÇÃO AMBIENTAL INTERATIVA
 * ═══════════════════════════════════════════════════════════════════════════
 * P06 - Trilhas de Aprendizado, Quizzes e Biblioteca de Espécies
 * 
 * Funcionalidades:
 * - Trilhas de aprendizado progressivas
 * - Quizzes adaptativos por nível
 * - Biblioteca digital de espécies (200+)
 * - Sistema de certificação com QR Code
 * - Integração com gamificação (P05)
 * - Conteúdo gerado por IA
 * 
 * @version 3.2.0
 * @date 2025-12-26
 */

/**
 * Schema de dados para planilha EDUCACAO_AMBIENTAL_RA
 */
const SCHEMA_EDUCACAO = {
  ID_Usuario: { type: 'string', required: true },
  Nome_Usuario: { type: 'string' },
  Data_Inicio: { type: 'datetime', required: true },
  Nivel_Conhecimento: { type: 'enum', values: ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'] },
  Pontos_Educacao: { type: 'integer', min: 0, default: 0 },
  Trilhas_Iniciadas_JSON: { type: 'text' },
  Trilhas_Concluidas_JSON: { type: 'text' },
  Total_Trilhas_Concluidas: { type: 'integer', min: 0, default: 0 },
  Modulos_Concluidos: { type: 'integer', min: 0, default: 0 },
  Quizzes_Respondidos: { type: 'integer', min: 0, default: 0 },
  Quizzes_Aprovados: { type: 'integer', min: 0, default: 0 },
  Taxa_Acerto_percent: { type: 'float', range: [0, 100] },
  Especies_Aprendidas_JSON: { type: 'text' },
  Total_Especies_Aprendidas: { type: 'integer', min: 0, default: 0 },
  Certificados_JSON: { type: 'text' },
  Total_Certificados: { type: 'integer', min: 0, default: 0 },
  Tempo_Total_Aprendizado_min: { type: 'integer', min: 0, default: 0 },
  Ultimo_Acesso: { type: 'datetime' }
};

/**
 * Headers da planilha EDUCACAO_AMBIENTAL_RA
 */
const EDUCACAO_HEADERS = [
  'ID_Usuario', 'Nome_Usuario', 'Data_Inicio', 'Nivel_Conhecimento', 'Pontos_Educacao',
  'Trilhas_Iniciadas_JSON', 'Trilhas_Concluidas_JSON', 'Total_Trilhas_Concluidas',
  'Modulos_Concluidos', 'Quizzes_Respondidos', 'Quizzes_Aprovados', 'Taxa_Acerto_percent',
  'Especies_Aprendidas_JSON', 'Total_Especies_Aprendidas', 'Certificados_JSON',
  'Total_Certificados', 'Tempo_Total_Aprendizado_min', 'Ultimo_Acesso'
];


/**
 * Sistema de Educação Ambiental
 * @namespace EnvironmentalEducationService
 */
const EnvironmentalEducationService = {
  
  SHEET_NAME: 'EDUCACAO_AMBIENTAL_RA',
  
  /**
   * Trilhas de aprendizado disponíveis
   */
  TRILHAS: {
    BASICA: {
      id: 'TRILHA_BASICA',
      titulo: 'Introdução ao Cerrado',
      descricao: 'Conheça o bioma Cerrado e sua importância para a biodiversidade brasileira',
      icone: '🌱',
      nivel: 'Iniciante',
      duracao_min: 30,
      pontos: 100,
      modulos: [
        { id: 'M1_1', titulo: 'O que é o Cerrado?', duracao: 5, tipo: 'texto' },
        { id: 'M1_2', titulo: 'Clima e Geografia', duracao: 5, tipo: 'texto' },
        { id: 'M1_3', titulo: 'Vegetação Típica', duracao: 8, tipo: 'interativo' },
        { id: 'M1_4', titulo: 'Fauna do Cerrado', duracao: 7, tipo: 'galeria' },
        { id: 'M1_5', titulo: 'Quiz Final', duracao: 5, tipo: 'quiz' }
      ]
    },
    BIODIVERSIDADE: {
      id: 'TRILHA_BIODIVERSIDADE',
      titulo: 'Biodiversidade da Reserva',
      descricao: 'Explore a fauna e flora nativas da Reserva Araras',
      icone: '🦋',
      nivel: 'Intermediário',
      duracao_min: 60,
      pontos: 200,
      prerequisito: 'TRILHA_BASICA',
      modulos: [
        { id: 'M2_1', titulo: 'Aves do Cerrado', duracao: 10, tipo: 'galeria' },
        { id: 'M2_2', titulo: 'Mamíferos Nativos', duracao: 10, tipo: 'galeria' },
        { id: 'M2_3', titulo: 'Répteis e Anfíbios', duracao: 8, tipo: 'interativo' },
        { id: 'M2_4', titulo: 'Insetos Polinizadores', duracao: 7, tipo: 'texto' },
        { id: 'M2_5', titulo: 'Árvores Nativas', duracao: 10, tipo: 'galeria' },
        { id: 'M2_6', titulo: 'Plantas Medicinais', duracao: 8, tipo: 'interativo' },
        { id: 'M2_7', titulo: 'Espécies Ameaçadas', duracao: 5, tipo: 'texto' },
        { id: 'M2_8', titulo: 'Quiz Final', duracao: 7, tipo: 'quiz' }
      ]
    },
    CONSERVACAO: {
      id: 'TRILHA_CONSERVACAO',
      titulo: 'Práticas de Conservação',
      descricao: 'Aprenda técnicas sustentáveis e como contribuir para a preservação',
      icone: '🌿',
      nivel: 'Intermediário',
      duracao_min: 45,
      pontos: 180,
      prerequisito: 'TRILHA_BASICA',
      modulos: [
        { id: 'M3_1', titulo: 'Por que Conservar?', duracao: 6, tipo: 'texto' },
        { id: 'M3_2', titulo: 'Corredores Ecológicos', duracao: 8, tipo: 'interativo' },
        { id: 'M3_3', titulo: 'Restauração Florestal', duracao: 10, tipo: 'video' },
        { id: 'M3_4', titulo: 'Agrofloresta', duracao: 8, tipo: 'interativo' },
        { id: 'M3_5', titulo: 'Como Você Pode Ajudar', duracao: 6, tipo: 'texto' },
        { id: 'M3_6', titulo: 'Quiz Final', duracao: 7, tipo: 'quiz' }
      ]
    },
    AVANCADA: {
      id: 'TRILHA_AVANCADA',
      titulo: 'Ecologia e Restauração',
      descricao: 'Aprofunde seus conhecimentos em ecologia e técnicas de restauração',
      icone: '🔬',
      nivel: 'Avançado',
      duracao_min: 90,
      pontos: 350,
      prerequisito: 'TRILHA_CONSERVACAO',
      modulos: [
        { id: 'M4_1', titulo: 'Sucessão Ecológica', duracao: 10, tipo: 'texto' },
        { id: 'M4_2', titulo: 'Índices de Biodiversidade', duracao: 8, tipo: 'interativo' },
        { id: 'M4_3', titulo: 'Monitoramento Ambiental', duracao: 10, tipo: 'video' },
        { id: 'M4_4', titulo: 'Sequestro de Carbono', duracao: 8, tipo: 'texto' },
        { id: 'M4_5', titulo: 'Serviços Ecossistêmicos', duracao: 10, tipo: 'interativo' },
        { id: 'M4_6', titulo: 'Técnicas de Plantio', duracao: 12, tipo: 'video' },
        { id: 'M4_7', titulo: 'Manejo de SAFs', duracao: 10, tipo: 'interativo' },
        { id: 'M4_8', titulo: 'Mudanças Climáticas', duracao: 8, tipo: 'texto' },
        { id: 'M4_9', titulo: 'Projeto Prático', duracao: 10, tipo: 'projeto' },
        { id: 'M4_10', titulo: 'Avaliação Final', duracao: 10, tipo: 'quiz' }
      ]
    }
  },

  /**
   * Banco de perguntas para quizzes
   */
  QUIZ_QUESTIONS: {
    iniciante: [
      { id: 'Q1', pergunta: 'Qual é o segundo maior bioma brasileiro?', opcoes: ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Caatinga'], correta: 1, explicacao: 'O Cerrado é o segundo maior bioma do Brasil, ocupando cerca de 24% do território nacional.' },
      { id: 'Q2', pergunta: 'Qual ave é símbolo do Cerrado?', opcoes: ['Tucano', 'Arara-canindé', 'Papagaio', 'Beija-flor'], correta: 1, explicacao: 'A Arara-canindé (Ara ararauna) é uma das aves mais emblemáticas do Cerrado.' },
      { id: 'Q3', pergunta: 'O Cerrado é conhecido como:', opcoes: ['Pulmão do mundo', 'Berço das águas', 'Floresta tropical', 'Deserto verde'], correta: 1, explicacao: 'O Cerrado é chamado de "berço das águas" pois abriga nascentes de importantes bacias hidrográficas.' },
      { id: 'Q4', pergunta: 'Qual fruto é típico do Cerrado?', opcoes: ['Açaí', 'Pequi', 'Cupuaçu', 'Graviola'], correta: 1, explicacao: 'O Pequi (Caryocar brasiliense) é um fruto típico e muito utilizado na culinária do Cerrado.' },
      { id: 'Q5', pergunta: 'Qual mamífero é símbolo da fauna do Cerrado?', opcoes: ['Onça-pintada', 'Lobo-guará', 'Capivara', 'Tatu'], correta: 1, explicacao: 'O Lobo-guará (Chrysocyon brachyurus) é o maior canídeo da América do Sul e símbolo do Cerrado.' }
    ],
    intermediario: [
      { id: 'Q6', pergunta: 'Qual é a porcentagem aproximada do Cerrado já desmatado?', opcoes: ['20%', '35%', '50%', '70%'], correta: 2, explicacao: 'Aproximadamente 50% do Cerrado original já foi convertido para agricultura e pecuária.' },
      { id: 'Q7', pergunta: 'O que é um corredor ecológico?', opcoes: ['Trilha para visitantes', 'Área de conexão entre fragmentos', 'Zona de plantio', 'Reserva legal'], correta: 1, explicacao: 'Corredores ecológicos são faixas de vegetação que conectam fragmentos florestais, permitindo o fluxo de fauna e flora.' },
      { id: 'Q8', pergunta: 'Qual índice mede a diversidade de espécies?', opcoes: ['PIB', 'Shannon', 'IPCA', 'Gini'], correta: 1, explicacao: 'O Índice de Shannon é amplamente usado para medir a diversidade de espécies em um ecossistema.' },
      { id: 'Q9', pergunta: 'O que significa SAF?', opcoes: ['Sistema Agrícola Federal', 'Sistema Agroflorestal', 'Setor Ambiental Florestal', 'Serviço de Apoio Florestal'], correta: 1, explicacao: 'SAF significa Sistema Agroflorestal, que combina árvores com cultivos agrícolas.' },
      { id: 'Q10', pergunta: 'Qual é a principal ameaça ao Cerrado?', opcoes: ['Poluição', 'Expansão agrícola', 'Caça', 'Mineração'], correta: 1, explicacao: 'A expansão da fronteira agrícola é a principal causa de desmatamento no Cerrado.' }
    ],
    avancado: [
      { id: 'Q11', pergunta: 'Quanto CO2 uma árvore adulta sequestra por ano em média?', opcoes: ['5 kg', '22 kg', '100 kg', '500 kg'], correta: 1, explicacao: 'Uma árvore adulta sequestra em média 22 kg de CO2 por ano, variando conforme a espécie.' },
      { id: 'Q12', pergunta: 'O que é sucessão ecológica?', opcoes: ['Herança genética', 'Processo de mudança na comunidade', 'Migração de espécies', 'Extinção natural'], correta: 1, explicacao: 'Sucessão ecológica é o processo de mudança na estrutura de uma comunidade ao longo do tempo.' },
      { id: 'Q13', pergunta: 'Qual resolução CONAMA define padrões de qualidade da água?', opcoes: ['CONAMA 237', 'CONAMA 357', 'CONAMA 420', 'CONAMA 001'], correta: 1, explicacao: 'A Resolução CONAMA 357/2005 estabelece a classificação dos corpos de água e padrões de qualidade.' },
      { id: 'Q14', pergunta: 'O que são serviços ecossistêmicos?', opcoes: ['Taxas ambientais', 'Benefícios da natureza', 'Multas por desmatamento', 'Licenças ambientais'], correta: 1, explicacao: 'Serviços ecossistêmicos são os benefícios que os ecossistemas proporcionam à humanidade.' },
      { id: 'Q15', pergunta: 'Qual é o período ideal para plantio no Cerrado?', opcoes: ['Seca (maio-set)', 'Início das chuvas (out-nov)', 'Pico das chuvas (jan-fev)', 'Qualquer época'], correta: 1, explicacao: 'O início da estação chuvosa (outubro-novembro) é ideal para plantio, garantindo água para estabelecimento.' }
    ]
  },

  /**
   * Biblioteca de espécies
   */
  ESPECIES_BIBLIOTECA: [
    // Aves
    { id: 'ESP001', nome_cientifico: 'Ara ararauna', nome_popular: 'Arara-canindé', grupo: 'Aves', familia: 'Psittacidae', status_iucn: 'LC', descricao: 'Ave de grande porte com plumagem azul e amarela, símbolo do Cerrado.', curiosidade: 'Pode viver até 60 anos e forma casais para toda a vida.' },
    { id: 'ESP002', nome_cientifico: 'Ramphastos toco', nome_popular: 'Tucano-toco', grupo: 'Aves', familia: 'Ramphastidae', status_iucn: 'LC', descricao: 'Maior espécie de tucano, com bico laranja característico.', curiosidade: 'O bico ajuda na termorregulação corporal.' },
    { id: 'ESP003', nome_cientifico: 'Cariama cristata', nome_popular: 'Seriema', grupo: 'Aves', familia: 'Cariamidae', status_iucn: 'LC', descricao: 'Ave terrestre com crista característica e canto potente.', curiosidade: 'Mata serpentes batendo-as contra pedras.' },
    // Mamíferos
    { id: 'ESP004', nome_cientifico: 'Chrysocyon brachyurus', nome_popular: 'Lobo-guará', grupo: 'Mamíferos', familia: 'Canidae', status_iucn: 'NT', descricao: 'Maior canídeo da América do Sul, com pernas longas e pelagem avermelhada.', curiosidade: 'É onívoro e dispersor de sementes da lobeira.' },
    { id: 'ESP005', nome_cientifico: 'Myrmecophaga tridactyla', nome_popular: 'Tamanduá-bandeira', grupo: 'Mamíferos', familia: 'Myrmecophagidae', status_iucn: 'VU', descricao: 'Mamífero especializado em comer formigas e cupins.', curiosidade: 'Sua língua pode medir até 60 cm.' },
    { id: 'ESP006', nome_cientifico: 'Tapirus terrestris', nome_popular: 'Anta', grupo: 'Mamíferos', familia: 'Tapiridae', status_iucn: 'VU', descricao: 'Maior mamífero terrestre da América do Sul.', curiosidade: 'É chamada de "jardineira da floresta" por dispersar sementes.' },
    { id: 'ESP007', nome_cientifico: 'Panthera onca', nome_popular: 'Onça-pintada', grupo: 'Mamíferos', familia: 'Felidae', status_iucn: 'NT', descricao: 'Maior felino das Américas, predador de topo.', curiosidade: 'Cada indivíduo tem um padrão único de manchas.' },
    // Répteis
    { id: 'ESP008', nome_cientifico: 'Caiman latirostris', nome_popular: 'Jacaré-de-papo-amarelo', grupo: 'Répteis', familia: 'Alligatoridae', status_iucn: 'LC', descricao: 'Jacaré de médio porte encontrado em áreas úmidas.', curiosidade: 'Pode regular a temperatura corporal mudando de cor.' },
    // Árvores
    { id: 'ESP009', nome_cientifico: 'Caryocar brasiliense', nome_popular: 'Pequi', grupo: 'Árvores', familia: 'Caryocaraceae', status_iucn: 'LC', descricao: 'Árvore símbolo do Cerrado, produz fruto muito apreciado.', curiosidade: 'O fruto tem espinhos internos que protegem a semente.' },
    { id: 'ESP010', nome_cientifico: 'Dipteryx alata', nome_popular: 'Baru', grupo: 'Árvores', familia: 'Fabaceae', status_iucn: 'LC', descricao: 'Árvore que produz castanha nutritiva e saborosa.', curiosidade: 'A castanha de baru tem mais proteína que a castanha-do-pará.' },
    { id: 'ESP011', nome_cientifico: 'Mauritia flexuosa', nome_popular: 'Buriti', grupo: 'Árvores', familia: 'Arecaceae', status_iucn: 'LC', descricao: 'Palmeira das veredas, indicadora de água.', curiosidade: 'Seu fruto é rico em vitamina A e usado em cosméticos.' },
    { id: 'ESP012', nome_cientifico: 'Hymenaea stigonocarpa', nome_popular: 'Jatobá-do-cerrado', grupo: 'Árvores', familia: 'Fabaceae', status_iucn: 'LC', descricao: 'Árvore de grande porte com frutos comestíveis.', curiosidade: 'A resina era usada pelos indígenas como verniz.' }
  ],

  /**
   * Inicializa a planilha de educação
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(EDUCACAO_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, EDUCACAO_HEADERS.length);
        headerRange.setBackground('#1565C0');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        
        Logger.log(`[EnvironmentalEducationService] Planilha ${this.SHEET_NAME} criada`);
      }
      
      return { success: true, sheetName: this.SHEET_NAME };
    } catch (error) {
      Logger.log(`[EnvironmentalEducationService] Erro ao inicializar: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Registra ou obtém progresso do usuário
   * @param {string} userId - ID do usuário
   * @param {string} nome - Nome do usuário
   * @returns {object} Progresso do usuário
   */
  getOrCreateProgress: function(userId, nome = '') {
    try {
      this.initializeSheet();
      
      let user = this._getUserProgress(userId);
      
      if (!user) {
        // Cria novo registro
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(this.SHEET_NAME);
        
        const row = [
          userId, nome, new Date(), 'Iniciante', 0,
          '[]', '[]', 0, 0, 0, 0, 0,
          '[]', 0, '[]', 0, 0, new Date()
        ];
        
        sheet.appendRow(row);
        
        user = {
          id: userId,
          nome: nome,
          nivel: 'Iniciante',
          pontos: 0,
          trilhas_iniciadas: [],
          trilhas_concluidas: [],
          modulos_concluidos: 0,
          quizzes_respondidos: 0,
          taxa_acerto: 0,
          especies_aprendidas: [],
          certificados: [],
          tempo_total: 0
        };
      }
      
      return { success: true, progresso: user };
      
    } catch (error) {
      Logger.log(`[getOrCreateProgress] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém progresso do usuário
   * @private
   */
  _getUserProgress: function(userId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
          return {
            row_index: i + 1,
            id: data[i][0],
            nome: data[i][1],
            data_inicio: data[i][2],
            nivel: data[i][3] || 'Iniciante',
            pontos: data[i][4] || 0,
            trilhas_iniciadas: JSON.parse(data[i][5] || '[]'),
            trilhas_concluidas: JSON.parse(data[i][6] || '[]'),
            total_trilhas: data[i][7] || 0,
            modulos_concluidos: data[i][8] || 0,
            quizzes_respondidos: data[i][9] || 0,
            quizzes_aprovados: data[i][10] || 0,
            taxa_acerto: data[i][11] || 0,
            especies_aprendidas: JSON.parse(data[i][12] || '[]'),
            total_especies: data[i][13] || 0,
            certificados: JSON.parse(data[i][14] || '[]'),
            total_certificados: data[i][15] || 0,
            tempo_total: data[i][16] || 0,
            ultimo_acesso: data[i][17]
          };
        }
      }
      
      return null;
    } catch (error) {
      Logger.log(`[_getUserProgress] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Salva progresso do usuário
   * @private
   */
  _saveUserProgress: function(user) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!user.row_index) return;
      
      const row = user.row_index;
      
      sheet.getRange(row, 4).setValue(user.nivel);
      sheet.getRange(row, 5).setValue(user.pontos);
      sheet.getRange(row, 6).setValue(JSON.stringify(user.trilhas_iniciadas));
      sheet.getRange(row, 7).setValue(JSON.stringify(user.trilhas_concluidas));
      sheet.getRange(row, 8).setValue(user.trilhas_concluidas.length);
      sheet.getRange(row, 9).setValue(user.modulos_concluidos);
      sheet.getRange(row, 10).setValue(user.quizzes_respondidos);
      sheet.getRange(row, 11).setValue(user.quizzes_aprovados);
      sheet.getRange(row, 12).setValue(user.taxa_acerto);
      sheet.getRange(row, 13).setValue(JSON.stringify(user.especies_aprendidas));
      sheet.getRange(row, 14).setValue(user.especies_aprendidas.length);
      sheet.getRange(row, 15).setValue(JSON.stringify(user.certificados));
      sheet.getRange(row, 16).setValue(user.certificados.length);
      sheet.getRange(row, 17).setValue(user.tempo_total);
      sheet.getRange(row, 18).setValue(new Date());
      
    } catch (error) {
      Logger.log(`[_saveUserProgress] Erro: ${error}`);
    }
  },

  /**
   * Obtém trilhas disponíveis para o usuário
   * @param {string} userId - ID do usuário
   * @returns {object} Trilhas com status de disponibilidade
   */
  getTrilhas: function(userId) {
    try {
      const user = this._getUserProgress(userId);
      const trilhasConcluidas = user ? user.trilhas_concluidas : [];
      const trilhasIniciadas = user ? user.trilhas_iniciadas : [];
      
      const trilhas = [];
      
      for (const [key, trilha] of Object.entries(this.TRILHAS)) {
        const concluida = trilhasConcluidas.includes(trilha.id);
        const iniciada = trilhasIniciadas.find(t => t.id === trilha.id);
        
        // Verifica pré-requisito
        let disponivel = true;
        if (trilha.prerequisito && !trilhasConcluidas.includes(trilha.prerequisito)) {
          disponivel = false;
        }
        
        trilhas.push({
          ...trilha,
          total_modulos: trilha.modulos.length,
          disponivel: disponivel,
          iniciada: !!iniciada,
          concluida: concluida,
          progresso: iniciada ? iniciada.modulos_concluidos : 0,
          progresso_percent: iniciada ? 
            Math.round((iniciada.modulos_concluidos / trilha.modulos.length) * 100) : 0
        });
      }
      
      return { success: true, trilhas: trilhas };
      
    } catch (error) {
      Logger.log(`[getTrilhas] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Inicia uma trilha de aprendizado
   * @param {string} userId - ID do usuário
   * @param {string} trilhaId - ID da trilha
   * @returns {object} Resultado
   */
  iniciarTrilha: function(userId, trilhaId) {
    try {
      const user = this._getUserProgress(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      // Encontra a trilha
      let trilha = null;
      for (const t of Object.values(this.TRILHAS)) {
        if (t.id === trilhaId) {
          trilha = t;
          break;
        }
      }
      
      if (!trilha) {
        return { success: false, error: 'Trilha não encontrada' };
      }
      
      // Verifica pré-requisito
      if (trilha.prerequisito && !user.trilhas_concluidas.includes(trilha.prerequisito)) {
        return { success: false, error: 'Pré-requisito não concluído' };
      }
      
      // Verifica se já iniciou
      if (user.trilhas_iniciadas.find(t => t.id === trilhaId)) {
        return { success: true, message: 'Trilha já iniciada', trilha: trilha };
      }
      
      // Adiciona às trilhas iniciadas
      user.trilhas_iniciadas.push({
        id: trilhaId,
        data_inicio: new Date().toISOString(),
        modulos_concluidos: 0,
        ultimo_modulo: null
      });
      
      this._saveUserProgress(user);
      
      // Integração com gamificação
      this._rewardAction(userId, 'iniciar_trilha', { trilha: trilhaId });
      
      return {
        success: true,
        message: 'Trilha iniciada!',
        trilha: trilha,
        primeiro_modulo: trilha.modulos[0]
      };
      
    } catch (error) {
      Logger.log(`[iniciarTrilha] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Conclui um módulo da trilha
   * @param {string} userId - ID do usuário
   * @param {string} trilhaId - ID da trilha
   * @param {string} moduloId - ID do módulo
   * @param {number} tempoGasto - Tempo gasto em minutos
   * @returns {object} Resultado
   */
  concluirModulo: function(userId, trilhaId, moduloId, tempoGasto = 0) {
    try {
      const user = this._getUserProgress(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      // Encontra a trilha iniciada
      const trilhaIniciada = user.trilhas_iniciadas.find(t => t.id === trilhaId);
      if (!trilhaIniciada) {
        return { success: false, error: 'Trilha não iniciada' };
      }
      
      // Encontra a trilha completa
      let trilha = null;
      for (const t of Object.values(this.TRILHAS)) {
        if (t.id === trilhaId) {
          trilha = t;
          break;
        }
      }
      
      // Atualiza progresso
      trilhaIniciada.modulos_concluidos++;
      trilhaIniciada.ultimo_modulo = moduloId;
      user.modulos_concluidos++;
      user.tempo_total += tempoGasto;
      user.pontos += 10; // Pontos por módulo
      
      // Verifica se concluiu a trilha
      let trilhaConcluida = false;
      if (trilhaIniciada.modulos_concluidos >= trilha.modulos.length) {
        trilhaConcluida = true;
        user.trilhas_concluidas.push(trilhaId);
        user.pontos += trilha.pontos;
        
        // Remove das iniciadas
        user.trilhas_iniciadas = user.trilhas_iniciadas.filter(t => t.id !== trilhaId);
        
        // Atualiza nível de conhecimento
        this._updateKnowledgeLevel(user);
        
        // Gera certificado
        const certificado = this._generateCertificate(user, trilha);
        user.certificados.push(certificado);
      }
      
      this._saveUserProgress(user);
      
      // Integração com gamificação
      this._rewardAction(userId, 'concluir_modulo', { trilha: trilhaId, modulo: moduloId });
      
      if (trilhaConcluida) {
        this._rewardAction(userId, 'concluir_trilha', { trilha: trilhaId, pontos: trilha.pontos });
      }
      
      return {
        success: true,
        modulo_concluido: moduloId,
        trilha_concluida: trilhaConcluida,
        progresso: trilhaIniciada.modulos_concluidos,
        total_modulos: trilha.modulos.length,
        pontos_ganhos: trilhaConcluida ? trilha.pontos + 10 : 10,
        proximo_modulo: !trilhaConcluida ? trilha.modulos[trilhaIniciada.modulos_concluidos] : null,
        certificado: trilhaConcluida ? user.certificados[user.certificados.length - 1] : null
      };
      
    } catch (error) {
      Logger.log(`[concluirModulo] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera quiz adaptativo
   * @param {string} userId - ID do usuário
   * @param {string} nivel - Nível do quiz (opcional)
   * @param {number} quantidade - Número de perguntas
   * @returns {object} Quiz gerado
   */
  generateQuiz: function(userId, nivel = null, quantidade = 5) {
    try {
      const user = this._getUserProgress(userId);
      const userNivel = nivel || (user ? this._mapNivelToQuiz(user.nivel) : 'iniciante');
      
      const questoes = this.QUIZ_QUESTIONS[userNivel] || this.QUIZ_QUESTIONS.iniciante;
      
      // Embaralha e seleciona
      const shuffled = [...questoes].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(quantidade, questoes.length));
      
      // Remove resposta correta para enviar ao cliente
      const quizQuestions = selected.map(q => ({
        id: q.id,
        pergunta: q.pergunta,
        opcoes: q.opcoes
      }));
      
      return {
        success: true,
        quiz: {
          id: `QUIZ_${Date.now()}`,
          nivel: userNivel,
          total_questoes: quizQuestions.length,
          tempo_limite_seg: 300,
          nota_aprovacao: 70,
          questoes: quizQuestions
        }
      };
      
    } catch (error) {
      Logger.log(`[generateQuiz] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Avalia respostas do quiz
   * @param {string} userId - ID do usuário
   * @param {Array} respostas - Array de {questionId, resposta}
   * @returns {object} Resultado do quiz
   */
  evaluateQuiz: function(userId, respostas) {
    try {
      const user = this._getUserProgress(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      let acertos = 0;
      const resultados = [];
      
      // Junta todas as questões
      const todasQuestoes = [
        ...this.QUIZ_QUESTIONS.iniciante,
        ...this.QUIZ_QUESTIONS.intermediario,
        ...this.QUIZ_QUESTIONS.avancado
      ];
      
      respostas.forEach(r => {
        const questao = todasQuestoes.find(q => q.id === r.questionId);
        if (questao) {
          const correto = r.resposta === questao.correta;
          if (correto) acertos++;
          
          resultados.push({
            questionId: r.questionId,
            correto: correto,
            resposta_usuario: r.resposta,
            resposta_correta: questao.correta,
            explicacao: questao.explicacao
          });
        }
      });
      
      const taxa = (acertos / respostas.length) * 100;
      const aprovado = taxa >= 70;
      const pontosGanhos = aprovado ? 50 : Math.round(acertos * 5);
      
      // Atualiza estatísticas
      user.quizzes_respondidos++;
      if (aprovado) user.quizzes_aprovados++;
      user.pontos += pontosGanhos;
      
      // Recalcula taxa de acerto média
      const totalRespostas = user.quizzes_respondidos * 5; // Estimativa
      user.taxa_acerto = ((user.taxa_acerto * (totalRespostas - respostas.length)) + (taxa * respostas.length)) / totalRespostas;
      
      this._saveUserProgress(user);
      
      // Integração com gamificação
      this._rewardAction(userId, 'quiz_respondido', { acertos, total: respostas.length, aprovado });
      
      return {
        success: true,
        acertos: acertos,
        total: respostas.length,
        taxa_acerto: taxa.toFixed(1),
        aprovado: aprovado,
        pontos_ganhos: pontosGanhos,
        resultados: resultados
      };
      
    } catch (error) {
      Logger.log(`[evaluateQuiz] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém biblioteca de espécies
   * @param {object} filtros - Filtros opcionais (grupo, familia, status_iucn)
   * @returns {Array} Lista de espécies
   */
  getEspecies: function(filtros = {}) {
    try {
      let especies = [...this.ESPECIES_BIBLIOTECA];
      
      if (filtros.grupo) {
        especies = especies.filter(e => e.grupo === filtros.grupo);
      }
      if (filtros.familia) {
        especies = especies.filter(e => e.familia === filtros.familia);
      }
      if (filtros.status_iucn) {
        especies = especies.filter(e => e.status_iucn === filtros.status_iucn);
      }
      if (filtros.busca) {
        const termo = filtros.busca.toLowerCase();
        especies = especies.filter(e => 
          e.nome_popular.toLowerCase().includes(termo) ||
          e.nome_cientifico.toLowerCase().includes(termo)
        );
      }
      
      return {
        success: true,
        total: especies.length,
        especies: especies
      };
      
    } catch (error) {
      Logger.log(`[getEspecies] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obtém detalhes de uma espécie
   * @param {string} especieId - ID da espécie
   * @returns {object} Detalhes da espécie
   */
  getEspecieDetails: function(especieId) {
    try {
      const especie = this.ESPECIES_BIBLIOTECA.find(e => e.id === especieId);
      
      if (!especie) {
        return { success: false, error: 'Espécie não encontrada' };
      }
      
      // Gera conteúdo adicional com IA se disponível
      let conteudoIA = null;
      if (typeof GeminiAIService !== 'undefined') {
        conteudoIA = this._generateSpeciesContent(especie);
      }
      
      return {
        success: true,
        especie: {
          ...especie,
          conteudo_ia: conteudoIA
        }
      };
      
    } catch (error) {
      Logger.log(`[getEspecieDetails] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Marca espécie como aprendida
   * @param {string} userId - ID do usuário
   * @param {string} especieId - ID da espécie
   * @returns {object} Resultado
   */
  marcarEspecieAprendida: function(userId, especieId) {
    try {
      const user = this._getUserProgress(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      if (!user.especies_aprendidas.includes(especieId)) {
        user.especies_aprendidas.push(especieId);
        user.pontos += 5;
        this._saveUserProgress(user);
        
        this._rewardAction(userId, 'especie_aprendida', { especie: especieId });
      }
      
      return {
        success: true,
        total_especies: user.especies_aprendidas.length,
        pontos_ganhos: 5
      };
      
    } catch (error) {
      Logger.log(`[marcarEspecieAprendida] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera certificado de conclusão
   * @private
   */
  _generateCertificate: function(user, trilha) {
    const certId = `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    return {
      id: certId,
      usuario: user.nome || user.id,
      trilha: trilha.titulo,
      nivel: trilha.nivel,
      data_conclusao: new Date().toISOString(),
      pontos_obtidos: trilha.pontos,
      qr_code_data: `https://reservaararas.org/certificado/${certId}`,
      valido: true
    };
  },
  
  /**
   * Atualiza nível de conhecimento
   * @private
   */
  _updateKnowledgeLevel: function(user) {
    const totalTrilhas = user.trilhas_concluidas.length;
    const taxaAcerto = user.taxa_acerto;
    
    if (totalTrilhas >= 4 && taxaAcerto >= 85) {
      user.nivel = 'Especialista';
    } else if (totalTrilhas >= 3 && taxaAcerto >= 75) {
      user.nivel = 'Avançado';
    } else if (totalTrilhas >= 2 && taxaAcerto >= 60) {
      user.nivel = 'Intermediário';
    } else {
      user.nivel = 'Iniciante';
    }
  },
  
  /**
   * Mapeia nível de conhecimento para nível de quiz
   * @private
   */
  _mapNivelToQuiz: function(nivel) {
    const map = {
      'Iniciante': 'iniciante',
      'Intermediário': 'intermediario',
      'Avançado': 'avancado',
      'Especialista': 'avancado'
    };
    return map[nivel] || 'iniciante';
  },
  
  /**
   * Gera conteúdo sobre espécie com IA
   * @private
   */
  _generateSpeciesContent: function(especie) {
    try {
      if (typeof GeminiAIService === 'undefined') return null;
      
      const prompt = `
Gere um texto educativo curto (3-4 parágrafos) sobre ${especie.nome_popular} (${especie.nome_cientifico}) para visitantes de uma reserva no Cerrado brasileiro. Inclua:
1. Características principais
2. Habitat e comportamento
3. Importância ecológica
4. Curiosidades interessantes

Formato: texto corrido, linguagem acessível.
`;
      
      const response = GeminiAIService.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response && response.candidates && response.candidates[0]) {
        return response.candidates[0].content.parts[0].text;
      }
      
      return null;
    } catch (error) {
      Logger.log(`[_generateSpeciesContent] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Integração com sistema de gamificação
   * @private
   */
  _rewardAction: function(userId, actionType, metadata) {
    try {
      if (typeof GamificationEngine !== 'undefined') {
        const actionMap = {
          'iniciar_trilha': 'login_diario',
          'concluir_modulo': 'observacao_biodiversidade',
          'concluir_trilha': 'missao_semanal',
          'quiz_respondido': 'observacao_biodiversidade',
          'especie_aprendida': 'observacao_biodiversidade'
        };
        
        const gamificationAction = actionMap[actionType] || 'login_diario';
        GamificationEngine.registerAction(userId, gamificationAction, metadata);
      }
    } catch (error) {
      Logger.log(`[_rewardAction] Erro: ${error}`);
    }
  },

  /**
   * Obtém estatísticas gerais do sistema educacional
   * @returns {object} Estatísticas
   */
  getStatistics: function() {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          total_usuarios: 0,
          trilhas_concluidas: 0,
          quizzes_respondidos: 0,
          certificados_emitidos: 0,
          tempo_total_aprendizado_horas: 0
        };
      }
      
      const data = sheet.getDataRange().getValues();
      
      let stats = {
        total_usuarios: data.length - 1,
        trilhas_concluidas: 0,
        modulos_concluidos: 0,
        quizzes_respondidos: 0,
        quizzes_aprovados: 0,
        certificados_emitidos: 0,
        tempo_total_aprendizado_min: 0,
        especies_aprendidas: 0,
        por_nivel: {},
        taxa_acerto_media: 0
      };
      
      let somaTaxas = 0;
      
      for (let i = 1; i < data.length; i++) {
        stats.trilhas_concluidas += data[i][7] || 0;
        stats.modulos_concluidos += data[i][8] || 0;
        stats.quizzes_respondidos += data[i][9] || 0;
        stats.quizzes_aprovados += data[i][10] || 0;
        stats.certificados_emitidos += data[i][15] || 0;
        stats.tempo_total_aprendizado_min += data[i][16] || 0;
        stats.especies_aprendidas += data[i][13] || 0;
        
        somaTaxas += data[i][11] || 0;
        
        const nivel = data[i][3] || 'Iniciante';
        stats.por_nivel[nivel] = (stats.por_nivel[nivel] || 0) + 1;
      }
      
      stats.tempo_total_aprendizado_horas = parseFloat((stats.tempo_total_aprendizado_min / 60).toFixed(1));
      stats.taxa_acerto_media = stats.total_usuarios > 0 ? 
        parseFloat((somaTaxas / stats.total_usuarios).toFixed(1)) : 0;
      stats.taxa_aprovacao = stats.quizzes_respondidos > 0 ?
        parseFloat(((stats.quizzes_aprovados / stats.quizzes_respondidos) * 100).toFixed(1)) : 0;
      
      return stats;
      
    } catch (error) {
      Logger.log(`[getStatistics] Erro: ${error}`);
      return null;
    }
  },
  
  /**
   * Obtém certificados do usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de certificados
   */
  getCertificados: function(userId) {
    try {
      const user = this._getUserProgress(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      return {
        success: true,
        total: user.certificados.length,
        certificados: user.certificados
      };
      
    } catch (error) {
      Logger.log(`[getCertificados] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES GLOBAIS DE API - P06 Educação Ambiental
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de educação ambiental
 * @returns {object} Resultado
 */
function apiEducacaoInit() {
  return EnvironmentalEducationService.initializeSheet();
}

/**
 * Obtém ou cria progresso do usuário
 * @param {string} userId - ID do usuário
 * @param {string} nome - Nome do usuário
 * @returns {object} Progresso
 */
function apiEducacaoProgress(userId, nome) {
  return EnvironmentalEducationService.getOrCreateProgress(userId, nome);
}

/**
 * Lista trilhas disponíveis
 * @param {string} userId - ID do usuário
 * @returns {object} Trilhas com status
 */
function apiEducacaoTrilhas(userId) {
  return EnvironmentalEducationService.getTrilhas(userId);
}

/**
 * Inicia uma trilha
 * @param {string} userId - ID do usuário
 * @param {string} trilhaId - ID da trilha
 * @returns {object} Resultado
 */
function apiEducacaoIniciarTrilha(userId, trilhaId) {
  return EnvironmentalEducationService.iniciarTrilha(userId, trilhaId);
}

/**
 * Conclui um módulo
 * @param {string} userId - ID do usuário
 * @param {string} trilhaId - ID da trilha
 * @param {string} moduloId - ID do módulo
 * @param {number} tempoGasto - Tempo em minutos
 * @returns {object} Resultado
 */
function apiEducacaoConcluirModulo(userId, trilhaId, moduloId, tempoGasto) {
  return EnvironmentalEducationService.concluirModulo(userId, trilhaId, moduloId, tempoGasto || 0);
}

/**
 * Gera quiz adaptativo
 * @param {string} userId - ID do usuário
 * @param {string} nivel - Nível opcional
 * @param {number} quantidade - Número de questões
 * @returns {object} Quiz
 */
function apiEducacaoQuiz(userId, nivel, quantidade) {
  return EnvironmentalEducationService.generateQuiz(userId, nivel, quantidade || 5);
}

/**
 * Avalia respostas do quiz
 * @param {string} userId - ID do usuário
 * @param {Array} respostas - Array de respostas
 * @returns {object} Resultado
 */
function apiEducacaoAvaliarQuiz(userId, respostas) {
  return EnvironmentalEducationService.evaluateQuiz(userId, respostas);
}

/**
 * Lista espécies da biblioteca
 * @param {object} filtros - Filtros opcionais
 * @returns {object} Lista de espécies
 */
function apiEducacaoEspecies(filtros) {
  return EnvironmentalEducationService.getEspecies(filtros || {});
}

/**
 * Obtém detalhes de uma espécie
 * @param {string} especieId - ID da espécie
 * @returns {object} Detalhes
 */
function apiEducacaoEspecieDetails(especieId) {
  return EnvironmentalEducationService.getEspecieDetails(especieId);
}

/**
 * Marca espécie como aprendida
 * @param {string} userId - ID do usuário
 * @param {string} especieId - ID da espécie
 * @returns {object} Resultado
 */
function apiEducacaoAprenderEspecie(userId, especieId) {
  return EnvironmentalEducationService.marcarEspecieAprendida(userId, especieId);
}

/**
 * Obtém certificados do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Certificados
 */
function apiEducacaoCertificados(userId) {
  return EnvironmentalEducationService.getCertificados(userId);
}

/**
 * Obtém estatísticas do sistema educacional
 * @returns {object} Estatísticas
 */
function apiEducacaoStats() {
  return EnvironmentalEducationService.getStatistics();
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT 36/30 (23/30): QUIZ EDUCACIONAL ADAPTATIVO - TRIVIA DO CERRADO
// ═══════════════════════════════════════════════════════════════════════════
// Referências:
// - Adaptive Learning Systems
// - Gamification in Education (Deterding et al., 2011)

/**
 * Tópicos de quiz disponíveis
 */
const QUIZ_TOPICS = {
  CERRADO: { id: 'CERRADO', nome: 'Cerrado Geral', icone: '🌿', descricao: 'Conhecimentos gerais sobre o bioma' },
  FAUNA: { id: 'FAUNA', nome: 'Fauna do Cerrado', icone: '🦜', descricao: 'Animais nativos e suas características' },
  FLORA: { id: 'FLORA', nome: 'Flora do Cerrado', icone: '🌳', descricao: 'Plantas, árvores e frutos típicos' },
  CONSERVACAO: { id: 'CONSERVACAO', nome: 'Conservação', icone: '♻️', descricao: 'Práticas de preservação ambiental' },
  AGROFLORESTA: { id: 'AGROFLORESTA', nome: 'Agrofloresta', icone: '🌱', descricao: 'Sistemas agroflorestais e sustentabilidade' }
};

/**
 * Bônus de pontuação
 */
const QUIZ_BONUS = {
  STREAK_3: { pontos: 10, nome: '🔥 Sequência de 3!' },
  STREAK_5: { pontos: 25, nome: '🔥🔥 Sequência de 5!' },
  STREAK_10: { pontos: 50, nome: '🔥🔥🔥 Sequência de 10!' },
  FAST_ANSWER: { pontos: 5, nome: '⚡ Resposta Rápida!' },
  PERFECT_QUIZ: { pontos: 100, nome: '🏆 Quiz Perfeito!' }
};

/**
 * Banco de perguntas expandido por tópico
 */
const TRIVIA_QUESTIONS = {
  CERRADO: [
    { id: 'TC1', pergunta: 'Qual porcentagem do território brasileiro o Cerrado ocupa?', opcoes: ['10%', '24%', '35%', '50%'], correta: 1, explicacao: 'O Cerrado ocupa cerca de 24% do território nacional, sendo o segundo maior bioma.', dificuldade: 1 },
    { id: 'TC2', pergunta: 'Por que o Cerrado é chamado de "berço das águas"?', opcoes: ['Tem muitos rios', 'Abriga nascentes de grandes bacias', 'Chove muito', 'Tem muitos lagos'], correta: 1, explicacao: 'O Cerrado abriga nascentes de 8 das 12 grandes bacias hidrográficas brasileiras.', dificuldade: 2 },
    { id: 'TC3', pergunta: 'Qual é a estação seca típica do Cerrado?', opcoes: ['Janeiro a Março', 'Abril a Junho', 'Maio a Setembro', 'Outubro a Dezembro'], correta: 2, explicacao: 'A estação seca vai de maio a setembro, com baixa umidade e risco de queimadas.', dificuldade: 1 },
    { id: 'TC4', pergunta: 'Quantas espécies de plantas o Cerrado possui aproximadamente?', opcoes: ['2.000', '5.000', '12.000', '25.000'], correta: 2, explicacao: 'O Cerrado possui cerca de 12.000 espécies de plantas, sendo 44% endêmicas.', dificuldade: 3 },
    { id: 'TC5', pergunta: 'O que são "veredas" no Cerrado?', opcoes: ['Trilhas antigas', 'Áreas com buritis e água', 'Montanhas', 'Cavernas'], correta: 1, explicacao: 'Veredas são áreas úmidas com palmeiras buriti, importantes para a fauna.', dificuldade: 2 }
  ],
  FAUNA: [
    { id: 'TF1', pergunta: 'Qual é o maior canídeo da América do Sul?', opcoes: ['Cachorro-do-mato', 'Lobo-guará', 'Raposa', 'Graxaim'], correta: 1, explicacao: 'O lobo-guará pode pesar até 30kg e tem pernas longas adaptadas ao capim alto.', dificuldade: 1 },
    { id: 'TF2', pergunta: 'Quantas formigas um tamanduá-bandeira come por dia?', opcoes: ['5.000', '15.000', '30.000', '50.000'], correta: 2, explicacao: 'O tamanduá-bandeira come cerca de 30.000 formigas e cupins diariamente.', dificuldade: 2 },
    { id: 'TF3', pergunta: 'Qual ave do Cerrado é parente dos dinossauros "terror birds"?', opcoes: ['Ema', 'Seriema', 'Tucano', 'Arara'], correta: 1, explicacao: 'A seriema é o parente vivo mais próximo dos extintos "terror birds".', dificuldade: 3 },
    { id: 'TF4', pergunta: 'Por que a arara-canindé come argila?', opcoes: ['Por fome', 'Para neutralizar toxinas', 'Por diversão', 'Para fazer ninho'], correta: 1, explicacao: 'A argila ajuda a neutralizar toxinas presentes em algumas sementes que comem.', dificuldade: 2 },
    { id: 'TF5', pergunta: 'Qual mamífero é chamado de "jardineiro da floresta"?', opcoes: ['Capivara', 'Anta', 'Veado', 'Tatu'], correta: 1, explicacao: 'A anta dispersa sementes pelo Cerrado, ajudando na regeneração florestal.', dificuldade: 2 }
  ],
  FLORA: [
    { id: 'TL1', pergunta: 'Por que não se deve morder o pequi?', opcoes: ['É venenoso', 'Tem espinhos no caroço', 'É muito duro', 'Tem gosto ruim'], correta: 1, explicacao: 'O caroço do pequi tem espinhos finos que podem machucar a boca.', dificuldade: 1 },
    { id: 'TL2', pergunta: 'Qual palmeira indica presença de água no subsolo?', opcoes: ['Coco', 'Buriti', 'Babaçu', 'Açaí'], correta: 1, explicacao: 'O buriti cresce em áreas úmidas e indica presença de lençol freático.', dificuldade: 2 },
    { id: 'TL3', pergunta: 'Em que mês o ipê-amarelo costuma florescer?', opcoes: ['Janeiro', 'Abril', 'Agosto', 'Novembro'], correta: 2, explicacao: 'O ipê-amarelo floresce no inverno seco, entre julho e setembro.', dificuldade: 2 },
    { id: 'TL4', pergunta: 'Qual fruto do Cerrado tem mais proteína que a castanha-do-pará?', opcoes: ['Pequi', 'Baru', 'Mangaba', 'Cagaita'], correta: 1, explicacao: 'A castanha de baru tem alto teor proteico e é muito nutritiva.', dificuldade: 3 },
    { id: 'TL5', pergunta: 'O que significa "Cerrado" em português antigo?', opcoes: ['Fechado/denso', 'Aberto', 'Seco', 'Verde'], correta: 0, explicacao: 'Cerrado significa "fechado" ou "denso", referindo-se à vegetação.', dificuldade: 2 }
  ],
  CONSERVACAO: [
    { id: 'TN1', pergunta: 'Qual porcentagem do Cerrado original já foi desmatada?', opcoes: ['20%', '35%', '50%', '70%'], correta: 2, explicacao: 'Cerca de 50% do Cerrado original já foi convertido para agricultura.', dificuldade: 1 },
    { id: 'TN2', pergunta: 'O que são corredores ecológicos?', opcoes: ['Trilhas para turistas', 'Conexões entre fragmentos', 'Estradas', 'Rios'], correta: 1, explicacao: 'Corredores conectam fragmentos florestais, permitindo fluxo de fauna e flora.', dificuldade: 2 },
    { id: 'TN3', pergunta: 'Quanto CO2 uma árvore adulta sequestra por ano em média?', opcoes: ['5 kg', '22 kg', '50 kg', '100 kg'], correta: 1, explicacao: 'Uma árvore adulta sequestra em média 22 kg de CO2 por ano.', dificuldade: 3 },
    { id: 'TN4', pergunta: 'Qual é a principal ameaça ao Cerrado atualmente?', opcoes: ['Caça', 'Expansão agrícola', 'Poluição', 'Turismo'], correta: 1, explicacao: 'A expansão da fronteira agrícola é a principal causa de desmatamento.', dificuldade: 1 },
    { id: 'TN5', pergunta: 'O que significa a sigla IUCN?', opcoes: ['Instituto Universal de Conservação', 'União Internacional para Conservação da Natureza', 'Índice de Uso de Carbono', 'Instituto de Unidades de Conservação'], correta: 1, explicacao: 'IUCN é a União Internacional para Conservação da Natureza.', dificuldade: 2 }
  ],
  AGROFLORESTA: [
    { id: 'TA1', pergunta: 'O que é um Sistema Agroflorestal (SAF)?', opcoes: ['Monocultura', 'Combinação de árvores e cultivos', 'Floresta intocada', 'Pasto'], correta: 1, explicacao: 'SAF combina árvores, cultivos agrícolas e/ou animais na mesma área.', dificuldade: 1 },
    { id: 'TA2', pergunta: 'Qual é um benefício dos SAFs para o solo?', opcoes: ['Compactação', 'Erosão', 'Ciclagem de nutrientes', 'Salinização'], correta: 2, explicacao: 'SAFs melhoram a ciclagem de nutrientes e a estrutura do solo.', dificuldade: 2 },
    { id: 'TA3', pergunta: 'Qual é a melhor época para plantio no Cerrado?', opcoes: ['Seca (maio-set)', 'Início das chuvas (out-nov)', 'Pico das chuvas (jan)', 'Qualquer época'], correta: 1, explicacao: 'O início das chuvas garante água para estabelecimento das mudas.', dificuldade: 2 },
    { id: 'TA4', pergunta: 'O que são espécies pioneiras em um SAF?', opcoes: ['As mais caras', 'As primeiras a crescer', 'As mais bonitas', 'As comestíveis'], correta: 1, explicacao: 'Pioneiras crescem rápido e preparam o ambiente para outras espécies.', dificuldade: 2 },
    { id: 'TA5', pergunta: 'Qual prática de SAF ajuda no sequestro de carbono?', opcoes: ['Queimadas', 'Plantio de árvores', 'Uso de agrotóxicos', 'Monocultura'], correta: 1, explicacao: 'Árvores em SAFs sequestram carbono enquanto produzem alimentos.', dificuldade: 1 }
  ]
};

// Adiciona ao EnvironmentalEducationService
EnvironmentalEducationService.QUIZ_TOPICS = QUIZ_TOPICS;
EnvironmentalEducationService.QUIZ_BONUS = QUIZ_BONUS;
EnvironmentalEducationService.TRIVIA_QUESTIONS = TRIVIA_QUESTIONS;


/**
 * Inicia uma sessão de trivia por tópico
 * @param {string} userId - ID do usuário
 * @param {string} tema - Tópico do quiz (CERRADO, FAUNA, FLORA, CONSERVACAO, AGROFLORESTA)
 * @returns {object} Sessão de quiz iniciada
 */
EnvironmentalEducationService.startTrivia = function(userId, tema = 'CERRADO') {
  try {
    const topic = this.QUIZ_TOPICS[tema] || this.QUIZ_TOPICS.CERRADO;
    const questions = this.TRIVIA_QUESTIONS[tema] || this.TRIVIA_QUESTIONS.CERRADO;
    
    // Embaralha e seleciona 5 perguntas
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    const quizId = `TRIVIA_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Salva sessão na planilha
    this._saveQuizSession(quizId, userId, tema, selected);
    
    // Retorna perguntas sem resposta correta
    const questoesCliente = selected.map((q, idx) => ({
      id: q.id,
      numero: idx + 1,
      pergunta: q.pergunta,
      opcoes: q.opcoes,
      dificuldade: q.dificuldade
    }));
    
    return {
      success: true,
      quiz: {
        id: quizId,
        tema: topic,
        total_questoes: questoesCliente.length,
        tempo_limite_seg: 180, // 3 minutos
        questoes: questoesCliente
      }
    };
  } catch (error) {
    Logger.log(`[startTrivia] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Responde uma pergunta do quiz com cálculo de bônus
 * @param {string} userId - ID do usuário
 * @param {string} quizId - ID do quiz
 * @param {string} questionId - ID da pergunta
 * @param {number} resposta - Índice da resposta (0-3)
 * @param {number} tempoSeg - Tempo de resposta em segundos
 * @returns {object} Resultado da resposta
 */
EnvironmentalEducationService.answerQuestion = function(userId, quizId, questionId, resposta, tempoSeg = 30) {
  try {
    // Busca sessão do quiz
    const session = this._getQuizSession(quizId);
    if (!session) {
      return { success: false, error: 'Sessão de quiz não encontrada' };
    }
    
    if (session.userId !== userId) {
      return { success: false, error: 'Quiz pertence a outro usuário' };
    }
    
    // Encontra a pergunta
    const questoes = JSON.parse(session.questoes);
    const questao = questoes.find(q => q.id === questionId);
    if (!questao) {
      return { success: false, error: 'Pergunta não encontrada' };
    }
    
    const correto = resposta === questao.correta;
    let pontosBase = correto ? 10 * questao.dificuldade : 0;
    let bonus = [];
    
    // Atualiza streak
    let streak = session.streak || 0;
    if (correto) {
      streak++;
      
      // Bônus de resposta rápida (< 10 segundos)
      if (tempoSeg < 10) {
        pontosBase += this.QUIZ_BONUS.FAST_ANSWER.pontos;
        bonus.push(this.QUIZ_BONUS.FAST_ANSWER);
      }
      
      // Bônus de sequência
      if (streak === 3) {
        pontosBase += this.QUIZ_BONUS.STREAK_3.pontos;
        bonus.push(this.QUIZ_BONUS.STREAK_3);
      } else if (streak === 5) {
        pontosBase += this.QUIZ_BONUS.STREAK_5.pontos;
        bonus.push(this.QUIZ_BONUS.STREAK_5);
      } else if (streak === 10) {
        pontosBase += this.QUIZ_BONUS.STREAK_10.pontos;
        bonus.push(this.QUIZ_BONUS.STREAK_10);
      }
    } else {
      streak = 0;
    }
    
    // Atualiza sessão
    const respostas = JSON.parse(session.respostas || '[]');
    respostas.push({
      questionId,
      resposta,
      correto,
      tempoSeg,
      pontos: pontosBase
    });
    
    const acertos = respostas.filter(r => r.correto).length;
    const totalRespondidas = respostas.length;
    const totalQuestoes = questoes.length;
    const quizCompleto = totalRespondidas >= totalQuestoes;
    
    // Bônus de quiz perfeito
    if (quizCompleto && acertos === totalQuestoes) {
      pontosBase += this.QUIZ_BONUS.PERFECT_QUIZ.pontos;
      bonus.push(this.QUIZ_BONUS.PERFECT_QUIZ);
    }
    
    // Calcula pontos totais da sessão
    const pontosTotais = respostas.reduce((sum, r) => sum + r.pontos, 0) + (quizCompleto && acertos === totalQuestoes ? this.QUIZ_BONUS.PERFECT_QUIZ.pontos : 0);
    
    this._updateQuizSession(quizId, {
      respostas: JSON.stringify(respostas),
      streak,
      acertos,
      pontos: pontosTotais,
      completo: quizCompleto
    });
    
    // Se quiz completo, atualiza estatísticas do usuário
    if (quizCompleto) {
      this._updateUserQuizStats(userId, acertos, totalQuestoes, pontosTotais);
    }
    
    return {
      success: true,
      correto,
      resposta_correta: questao.correta,
      explicacao: questao.explicacao,
      pontos_ganhos: pontosBase,
      bonus,
      streak,
      progresso: {
        respondidas: totalRespondidas,
        total: totalQuestoes,
        acertos,
        pontos_acumulados: pontosTotais
      },
      quiz_completo: quizCompleto,
      resultado_final: quizCompleto ? {
        acertos,
        total: totalQuestoes,
        taxa_acerto: ((acertos / totalQuestoes) * 100).toFixed(1),
        pontos_totais: pontosTotais,
        aprovado: (acertos / totalQuestoes) >= 0.7
      } : null
    };
  } catch (error) {
    Logger.log(`[answerQuestion] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém leaderboard de quiz
 * @param {string} tipo - Tipo: 'semanal', 'mensal', 'geral'
 * @param {number} limite - Número de posições
 * @returns {object} Leaderboard
 */
EnvironmentalEducationService.getQuizLeaderboard = function(tipo = 'geral', limite = 10) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('QUIZ_SESSOES_RA');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, tipo, leaderboard: [] };
    }
    
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    
    // Filtra por período
    const filteredData = data.slice(1).filter(row => {
      if (!row[6]) return false; // Não completo
      const dataQuiz = new Date(row[2]);
      
      if (tipo === 'semanal') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataQuiz >= weekAgo;
      } else if (tipo === 'mensal') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return dataQuiz >= monthAgo;
      }
      return true; // geral
    });
    
    // Agrupa por usuário e soma pontos
    const userScores = {};
    filteredData.forEach(row => {
      const oderId = row[1];
      const pontos = row[8] || 0;
      const acertos = row[7] || 0;
      
      if (!userScores[oderId]) {
        userScores[oderId] = { userId: oderId, pontos: 0, quizzes: 0, acertos: 0 };
      }
      userScores[oderId].pontos += pontos;
      userScores[oderId].quizzes++;
      userScores[oderId].acertos += acertos;
    });
    
    // Ordena e limita
    const leaderboard = Object.values(userScores)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, limite)
      .map((user, idx) => ({
        posicao: idx + 1,
        userId: user.userId,
        pontos: user.pontos,
        quizzes_completos: user.quizzes,
        taxa_acerto: user.quizzes > 0 ? ((user.acertos / (user.quizzes * 5)) * 100).toFixed(1) : 0,
        medalha: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''
      }));
    
    return {
      success: true,
      tipo,
      periodo: tipo === 'semanal' ? 'Últimos 7 dias' : tipo === 'mensal' ? 'Últimos 30 dias' : 'Todos os tempos',
      leaderboard
    };
  } catch (error) {
    Logger.log(`[getQuizLeaderboard] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

/**
 * Obtém estatísticas de quiz do usuário
 * @param {string} userId - ID do usuário
 * @returns {object} Estatísticas
 */
EnvironmentalEducationService.getUserQuizStats = function(userId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('QUIZ_SESSOES_RA');
    
    const stats = {
      total_quizzes: 0,
      quizzes_completos: 0,
      total_acertos: 0,
      total_perguntas: 0,
      pontos_totais: 0,
      melhor_streak: 0,
      quizzes_perfeitos: 0,
      por_tema: {},
      nivel_quiz: 'Iniciante'
    };
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, userId, stats };
    }
    
    const data = sheet.getDataRange().getValues();
    
    data.slice(1).forEach(row => {
      if (row[1] !== userId) return;
      
      stats.total_quizzes++;
      if (row[6]) { // completo
        stats.quizzes_completos++;
        stats.total_acertos += row[7] || 0;
        stats.total_perguntas += 5;
        stats.pontos_totais += row[8] || 0;
        
        if (row[7] === 5) stats.quizzes_perfeitos++;
        
        const tema = row[3];
        if (!stats.por_tema[tema]) {
          stats.por_tema[tema] = { quizzes: 0, acertos: 0, pontos: 0 };
        }
        stats.por_tema[tema].quizzes++;
        stats.por_tema[tema].acertos += row[7] || 0;
        stats.por_tema[tema].pontos += row[8] || 0;
      }
      
      const streak = row[5] || 0;
      if (streak > stats.melhor_streak) stats.melhor_streak = streak;
    });
    
    // Calcula taxa de acerto
    stats.taxa_acerto = stats.total_perguntas > 0 
      ? ((stats.total_acertos / stats.total_perguntas) * 100).toFixed(1) 
      : 0;
    
    // Determina nível
    if (stats.pontos_totais >= 1000) stats.nivel_quiz = 'Mestre do Cerrado';
    else if (stats.pontos_totais >= 500) stats.nivel_quiz = 'Especialista';
    else if (stats.pontos_totais >= 200) stats.nivel_quiz = 'Conhecedor';
    else if (stats.pontos_totais >= 50) stats.nivel_quiz = 'Aprendiz';
    
    return { success: true, userId, stats };
  } catch (error) {
    Logger.log(`[getUserQuizStats] Erro: ${error}`);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES PARA QUIZ SESSIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa planilha de sessões de quiz
 * @private
 */
EnvironmentalEducationService._initQuizSessionSheet = function() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('QUIZ_SESSOES_RA');
  
  if (!sheet) {
    sheet = ss.insertSheet('QUIZ_SESSOES_RA');
    const headers = ['Quiz_ID', 'User_ID', 'Data_Inicio', 'Tema', 'Questoes_JSON', 'Streak', 'Completo', 'Acertos', 'Pontos', 'Respostas_JSON'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4CAF50').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
};

/**
 * Salva sessão de quiz
 * @private
 */
EnvironmentalEducationService._saveQuizSession = function(quizId, userId, tema, questoes) {
  const sheet = this._initQuizSessionSheet();
  sheet.appendRow([quizId, userId, new Date(), tema, JSON.stringify(questoes), 0, false, 0, 0, '[]']);
};

/**
 * Obtém sessão de quiz
 * @private
 */
EnvironmentalEducationService._getQuizSession = function(quizId) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('QUIZ_SESSOES_RA');
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === quizId) {
      return {
        row: i + 1,
        quizId: data[i][0],
        userId: data[i][1],
        dataInicio: data[i][2],
        tema: data[i][3],
        questoes: data[i][4],
        streak: data[i][5],
        completo: data[i][6],
        acertos: data[i][7],
        pontos: data[i][8],
        respostas: data[i][9]
      };
    }
  }
  return null;
};

/**
 * Atualiza sessão de quiz
 * @private
 */
EnvironmentalEducationService._updateQuizSession = function(quizId, updates) {
  const session = this._getQuizSession(quizId);
  if (!session) return;
  
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('QUIZ_SESSOES_RA');
  
  if (updates.respostas !== undefined) sheet.getRange(session.row, 10).setValue(updates.respostas);
  if (updates.streak !== undefined) sheet.getRange(session.row, 6).setValue(updates.streak);
  if (updates.completo !== undefined) sheet.getRange(session.row, 7).setValue(updates.completo);
  if (updates.acertos !== undefined) sheet.getRange(session.row, 8).setValue(updates.acertos);
  if (updates.pontos !== undefined) sheet.getRange(session.row, 9).setValue(updates.pontos);
};

/**
 * Atualiza estatísticas de quiz do usuário
 * @private
 */
EnvironmentalEducationService._updateUserQuizStats = function(userId, acertos, total, pontos) {
  try {
    const user = this._getUserProgress(userId);
    if (!user) return;
    
    user.quizzes_respondidos++;
    if ((acertos / total) >= 0.7) user.quizzes_aprovados++;
    user.pontos += pontos;
    
    // Recalcula taxa de acerto
    const totalAcertos = (user.taxa_acerto / 100) * ((user.quizzes_respondidos - 1) * 5) + acertos;
    user.taxa_acerto = (totalAcertos / (user.quizzes_respondidos * 5)) * 100;
    
    this._saveUserProgress(user);
    this._rewardAction(userId, 'quiz_respondido', { acertos, total, pontos });
  } catch (error) {
    Logger.log(`[_updateUserQuizStats] Erro: ${error}`);
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS - QUIZ TRIVIA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicia trivia por tema
 */
function apiQuizStartTrivia(userId, tema) {
  return EnvironmentalEducationService.startTrivia(userId, tema);
}

/**
 * Responde pergunta do quiz
 */
function apiQuizAnswerQuestion(userId, quizId, questionId, resposta, tempoSeg) {
  return EnvironmentalEducationService.answerQuestion(userId, quizId, questionId, resposta, tempoSeg);
}

/**
 * Obtém leaderboard
 */
function apiQuizGetLeaderboard(tipo, limite) {
  return EnvironmentalEducationService.getQuizLeaderboard(tipo, limite);
}

/**
 * Obtém estatísticas do usuário
 */
function apiQuizGetUserStats(userId) {
  return EnvironmentalEducationService.getUserQuizStats(userId);
}

/**
 * Lista tópicos disponíveis
 */
function apiQuizGetTopics() {
  return {
    success: true,
    topics: Object.values(QUIZ_TOPICS)
  };
}
