/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - DOCUMENTAÇÃO TÉCNICA E API REFERENCE
 * ═══════════════════════════════════════════════════════════════════════════
 * P35 - Technical Documentation and API Reference System
 * 
 * Funcionalidades:
 * - Documentação de todos os sistemas
 * - API Reference completa
 * - Guias de uso
 * - Tutoriais interativos
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

/**
 * Serviço de Documentação
 * @namespace Documentation
 */
const Documentation = {
  
  /**
   * Catálogo de todos os sistemas implementados
   */
  SISTEMAS: {
    // Biodiversidade e Monitoramento
    P01: { nome: 'Biodiversidade com IA', categoria: 'Biodiversidade', apis: ['apiBiodiversidade*'] },
    P02: { nome: 'Sucessão Ecológica', categoria: 'Conservação', apis: ['apiSucessao*'] },
    P03: { nome: 'Alertas Ecológicos', categoria: 'Conservação', apis: ['apiAlertas*'] },
    P04: { nome: 'Corredores Ecológicos', categoria: 'Conservação', apis: ['apiCorredores*'] },
    P05: { nome: 'Gamificação', categoria: 'Engajamento', apis: ['apiGamificacao*'] },
    P06: { nome: 'Educação Ambiental', categoria: 'Engajamento', apis: ['apiEducacao*'] },
    P07: { nome: 'Câmeras Trap', categoria: 'Biodiversidade', apis: ['apiCameraTrap*'] },
    P08: { nome: 'Heatmap Biodiversidade', categoria: 'Biodiversidade', apis: ['apiHeatmap*'] },
    P09: { nome: 'Redes Tróficas', categoria: 'Biodiversidade', apis: ['apiTrofico*'] },
    P10: { nome: 'Espécies Invasoras', categoria: 'Conservação', apis: ['apiInvasoras*'] },
    
    // Clima e Predição
    P11: { nome: 'Mudanças Climáticas', categoria: 'Clima', apis: ['apiClima*'] },
    P12: { nome: 'Eventos Extremos', categoria: 'Clima', apis: ['apiEventos*'] },
    P13: { nome: 'Otimização de Plantio', categoria: 'Agrofloresta', apis: ['apiPlantio*'] },
    P14: { nome: 'Análise de Sentimento', categoria: 'Engajamento', apis: ['apiSentimento*'] },
    P15: { nome: 'Chatbot Educacional', categoria: 'Engajamento', apis: ['apiChatbot*'] },
    P16: { nome: 'Relatórios Científicos', categoria: 'Análises', apis: ['apiRelatorios*'] },
    P17: { nome: 'Recomendações de Manejo', categoria: 'Gestão', apis: ['apiManejo*'] },
    
    // IoT e Sensores
    P18: { nome: 'Qualidade do Ar', categoria: 'IoT', apis: ['apiQualidadeAr*'] },
    P19: { nome: 'Umidade do Solo', categoria: 'IoT', apis: ['apiUmidadeSolo*'] },
    P20: { nome: 'Estação Meteorológica', categoria: 'IoT', apis: ['apiMeteo*'] },
    P21: { nome: 'Nível de Água', categoria: 'IoT', apis: ['apiNivelAgua*'] },
    P22: { nome: 'IoT Consolidado', categoria: 'IoT', apis: ['apiIoT*'] },
    
    // Análises Avançadas
    P23: { nome: 'Conectividade de Habitat', categoria: 'Conservação', apis: ['apiHabitat*'] },
    P24: { nome: 'Fenologia', categoria: 'Biodiversidade', apis: ['apiFenologia*'] },
    P25: { nome: 'Serviços Ecossistêmicos', categoria: 'Conservação', apis: ['apiEcossistema*'] },
    P26: { nome: 'Doenças em Plantas', categoria: 'Fitossanidade', apis: ['apiDoencas*'] },
    P27: { nome: 'Regeneração Natural', categoria: 'Conservação', apis: ['apiRegeneracao*'] },
    P28: { nome: 'Banco de Sementes', categoria: 'Conservação', apis: ['apiSementes*'] },
    P29: { nome: 'Câmeras Trap Avançado', categoria: 'Biodiversidade', apis: ['apiCameraTrapAdv*'] },
    P30: { nome: 'Carbono e Créditos', categoria: 'Carbono', apis: ['apiCarbon*'] },
    
    // Sistema e Integração
    P31: { nome: 'Integrações Externas', categoria: 'Sistema', apis: ['apiIntegracao*'] },
    P32: { nome: 'Backup e Recuperação', categoria: 'Sistema', apis: ['apiBackup*'] },
    P33: { nome: 'Dashboard Executivo', categoria: 'Gestão', apis: ['apiExecutivo*'] },
    P34: { nome: 'RBAC', categoria: 'Sistema', apis: ['apiRBAC*'] },
    P35: { nome: 'Documentação', categoria: 'Sistema', apis: ['apiDoc*'] }
  },

  /**
   * Categorias de documentação
   */
  CATEGORIAS: {
    Biodiversidade: { icone: '🦋', cor: '#4CAF50', descricao: 'Monitoramento de fauna e flora' },
    Conservação: { icone: '🌳', cor: '#2E7D32', descricao: 'Gestão de áreas protegidas' },
    Clima: { icone: '🌤️', cor: '#03A9F4', descricao: 'Monitoramento climático e predições' },
    IoT: { icone: '📡', cor: '#FF9800', descricao: 'Sensores e dispositivos conectados' },
    Engajamento: { icone: '👥', cor: '#9C27B0', descricao: 'Interação com visitantes e comunidade' },
    Análises: { icone: '📊', cor: '#3F51B5', descricao: 'Análises estatísticas e relatórios' },
    Gestão: { icone: '📋', cor: '#607D8B', descricao: 'Ferramentas de gestão' },
    Sistema: { icone: '⚙️', cor: '#795548', descricao: 'Infraestrutura e configuração' },
    Agrofloresta: { icone: '🌾', cor: '#8BC34A', descricao: 'Sistemas agroflorestais' },
    Fitossanidade: { icone: '🌿', cor: '#009688', descricao: 'Saúde das plantas' },
    Carbono: { icone: '🌱', cor: '#4CAF50', descricao: 'Sequestro e créditos de carbono' }
  },

  /**
   * Obtém documentação de todos os sistemas
   */
  getAllSystems: function() {
    const sistemas = [];
    
    Object.entries(this.SISTEMAS).forEach(([codigo, sistema]) => {
      const categoria = this.CATEGORIAS[sistema.categoria] || {};
      sistemas.push({
        codigo: codigo,
        nome: sistema.nome,
        categoria: sistema.categoria,
        categoria_icone: categoria.icone || '📦',
        categoria_cor: categoria.cor || '#607D8B',
        apis: sistema.apis
      });
    });
    
    return {
      success: true,
      total_sistemas: sistemas.length,
      sistemas: sistemas,
      categorias: Object.entries(this.CATEGORIAS).map(([nome, cat]) => ({
        nome,
        ...cat,
        sistemas: sistemas.filter(s => s.categoria === nome).length
      }))
    };
  },

  /**
   * Obtém documentação de um sistema específico
   */
  getSystemDoc: function(codigo) {
    const sistema = this.SISTEMAS[codigo];
    if (!sistema) {
      return { success: false, error: 'Sistema não encontrado' };
    }
    
    const categoria = this.CATEGORIAS[sistema.categoria] || {};
    
    // Gera documentação detalhada
    const doc = {
      codigo: codigo,
      nome: sistema.nome,
      categoria: sistema.categoria,
      categoria_info: categoria,
      
      descricao: this._getSystemDescription(codigo),
      funcionalidades: this._getSystemFeatures(codigo),
      apis: this._getSystemAPIs(codigo),
      schemas: this._getSystemSchemas(codigo),
      exemplos: this._getSystemExamples(codigo)
    };
    
    return { success: true, documentacao: doc };
  },

  /**
   * Obtém descrição do sistema
   * @private
   */
  _getSystemDescription: function(codigo) {
    const descricoes = {
      P01: 'Sistema de monitoramento de biodiversidade com identificação automática de espécies usando Gemini AI.',
      P02: 'Análise preditiva de sucessão ecológica com modelos de transição de estados.',
      P03: 'Sistema de alertas ecológicos em tempo real com notificações automáticas.',
      P04: 'Mapeamento e análise de corredores ecológicos para conectividade de habitat.',
      P05: 'Sistema de gamificação para engajamento de visitantes e voluntários.',
      P06: 'Plataforma de educação ambiental com conteúdo interativo.',
      P07: 'Monitoramento de fauna com armadilhas fotográficas.',
      P08: 'Mapa de calor de biodiversidade com análise espacial.',
      P09: 'Análise de redes tróficas e interações ecológicas.',
      P10: 'Predição e monitoramento de espécies invasoras.',
      P11: 'Modelagem de mudanças climáticas e impactos locais.',
      P12: 'Predição de eventos climáticos extremos.',
      P13: 'Otimização de plantio com machine learning.',
      P14: 'Análise de sentimento de feedback de visitantes.',
      P15: 'Chatbot educacional com IA para atendimento.',
      P16: 'Geração automática de relatórios científicos.',
      P17: 'Recomendações de manejo baseadas em IA.',
      P18: 'Monitoramento de qualidade do ar com sensores IoT.',
      P19: 'Monitoramento de umidade do solo.',
      P20: 'Estação meteorológica automatizada.',
      P21: 'Monitoramento de nível de água em corpos hídricos.',
      P22: 'Dashboard consolidado de todos os sensores IoT.',
      P23: 'Análise de conectividade de habitat com teoria de grafos.',
      P24: 'Predição fenológica de espécies do Cerrado.',
      P25: 'Valoração de serviços ecossistêmicos.',
      P26: 'Detecção de doenças em plantas com visão computacional.',
      P27: 'Monitoramento de regeneração natural em parcelas permanentes.',
      P28: 'Análise de banco de sementes do solo.',
      P29: 'Análise avançada de câmeras trap com ocupação e população.',
      P30: 'Rastreamento de carbono e geração de créditos VCS.',
      P31: 'Integração com APIs externas (iNaturalist, GBIF, etc).',
      P32: 'Sistema de backup automático e recuperação de desastres.',
      P33: 'Dashboard executivo com KPIs consolidados.',
      P34: 'Controle de acesso baseado em papéis (RBAC).',
      P35: 'Documentação técnica e API reference.'
    };
    
    return descricoes[codigo] || 'Documentação em desenvolvimento.';
  },

  /**
   * Obtém funcionalidades do sistema
   * @private
   */
  _getSystemFeatures: function(codigo) {
    const features = {
      P01: ['Registro de observações', 'Identificação por IA', 'Análise de padrões', 'Alertas de conservação'],
      P02: ['Análise de estágios', 'Predição de transições', 'Indicadores de sucessão', 'Recomendações'],
      P03: ['Alertas em tempo real', 'Classificação de severidade', 'Notificações', 'Histórico'],
      P07: ['Registro de capturas', 'Identificação de espécies', 'Padrões de atividade', 'Estatísticas'],
      P18: ['Leitura de sensores', 'Cálculo de IQA', 'Alertas de qualidade', 'Histórico'],
      P22: ['Dashboard unificado', 'Alertas consolidados', 'Análise de tendências', 'Exportação'],
      P23: ['Análise de fragmentos', 'Índices de conectividade', 'Stepping stones', 'Priorização'],
      P24: ['Observações fenológicas', 'Predição de floração', 'Alertas de polinização', 'Calendário'],
      P25: ['Valoração de serviços', 'Simulação de cenários', 'Relatórios de valor', 'Comparativos'],
      P26: ['Detecção por imagem', 'Catálogo de doenças', 'Alertas de surto', 'Recomendações'],
      P27: ['Parcelas permanentes', 'Censos de regeneração', 'Análise de diversidade', 'Predição'],
      P28: ['Coleta de amostras', 'Germinação', 'Análise de viabilidade', 'Potencial de regeneração'],
      P29: ['Padrões de atividade', 'Modelos de ocupação', 'Estimativa populacional', 'Interações'],
      P30: ['Medição de biomassa', 'Cálculo de carbono', 'Geração de créditos', 'Relatórios VCS'],
      P31: ['iNaturalist', 'GBIF', 'OpenWeather', 'INPE', 'MapBiomas', 'Darwin Core'],
      P32: ['Backup automático', 'Recuperação', 'Teste de integridade', 'Limpeza'],
      P33: ['KPIs consolidados', 'Alertas prioritários', 'Relatório executivo', 'Tendências'],
      P34: ['Gestão de usuários', 'Papéis e permissões', 'Auditoria', 'Controle de acesso'],
      P35: ['Catálogo de sistemas', 'API Reference', 'Guias de uso', 'Exemplos']
    };
    
    return features[codigo] || ['Funcionalidades em documentação'];
  },

  /**
   * Obtém APIs do sistema
   * @private
   */
  _getSystemAPIs: function(codigo) {
    const apiDocs = {
      P29: [
        { nome: 'apiCameraTrapAdvInit', metodo: 'GET', descricao: 'Inicializa sistema', params: [] },
        { nome: 'apiCameraTrapAdvRegistrar', metodo: 'POST', descricao: 'Registra captura', params: ['captureData'] },
        { nome: 'apiCameraTrapAdvListar', metodo: 'GET', descricao: 'Lista capturas', params: ['filters'] },
        { nome: 'apiCameraTrapAdvAtividade', metodo: 'GET', descricao: 'Analisa atividade', params: ['especie'] },
        { nome: 'apiCameraTrapAdvOcupacao', metodo: 'GET', descricao: 'Estima ocupação', params: ['especie'] },
        { nome: 'apiCameraTrapAdvPopulacao', metodo: 'GET', descricao: 'Estima população', params: ['especie'] }
      ],
      P30: [
        { nome: 'apiCarbonInit', metodo: 'GET', descricao: 'Inicializa sistema', params: [] },
        { nome: 'apiCarbonRegistrarParcela', metodo: 'POST', descricao: 'Registra parcela', params: ['plotData'] },
        { nome: 'apiCarbonRegistrarMedicao', metodo: 'POST', descricao: 'Registra medição', params: ['measurementData'] },
        { nome: 'apiCarbonEstoqueTotal', metodo: 'GET', descricao: 'Calcula estoque', params: ['parcelaId'] },
        { nome: 'apiCarbonGerarCreditos', metodo: 'POST', descricao: 'Gera créditos', params: ['ano', 'trimestre', 'certificacao'] },
        { nome: 'apiCarbonRelatorioVCS', metodo: 'GET', descricao: 'Gera relatório VCS', params: ['ano'] }
      ],
      P33: [
        { nome: 'apiExecutivoKPIs', metodo: 'GET', descricao: 'Obtém todos os KPIs', params: [] },
        { nome: 'apiExecutivoAlertas', metodo: 'GET', descricao: 'Obtém alertas prioritários', params: [] },
        { nome: 'apiExecutivoRelatorio', metodo: 'GET', descricao: 'Gera relatório executivo', params: [] }
      ],
      P34: [
        { nome: 'apiRBACUsuarioAtual', metodo: 'GET', descricao: 'Obtém usuário atual', params: [] },
        { nome: 'apiRBACRegistrarUsuario', metodo: 'POST', descricao: 'Registra usuário', params: ['userData'] },
        { nome: 'apiRBACAtualizarRole', metodo: 'PUT', descricao: 'Atualiza role', params: ['email', 'newRole'] },
        { nome: 'apiRBACListarUsuarios', metodo: 'GET', descricao: 'Lista usuários', params: [] },
        { nome: 'apiRBACAuditLog', metodo: 'GET', descricao: 'Obtém logs', params: ['limit'] }
      ]
    };
    
    return apiDocs[codigo] || [];
  },

  /**
   * Obtém schemas do sistema
   * @private
   */
  _getSystemSchemas: function(codigo) {
    const schemas = {
      P29: {
        Captura: {
          campos: ['ID_Captura', 'ID_Camera', 'Data_Hora', 'Especie', 'Quantidade', 'Comportamento', 'Fase_Lunar']
        }
      },
      P30: {
        Parcela: {
          campos: ['ID_Parcela', 'Nome', 'Area_ha', 'Tipo_Vegetacao', 'Latitude', 'Longitude']
        },
        Medicao: {
          campos: ['ID_Medicao', 'ID_Parcela', 'Especie', 'DAP_cm', 'Altura_m', 'Biomassa_kg', 'Carbono_kg']
        }
      },
      P34: {
        Usuario: {
          campos: ['ID_Usuario', 'Email', 'Nome', 'Role', 'Status', 'Data_Criacao', 'Ultimo_Acesso']
        }
      }
    };
    
    return schemas[codigo] || {};
  },

  /**
   * Obtém exemplos do sistema
   * @private
   */
  _getSystemExamples: function(codigo) {
    const exemplos = {
      P30: [
        {
          titulo: 'Registrar medição de árvore',
          codigo: `apiCarbonRegistrarMedicao({
  parcela_id: 'PC-ABC123',
  especie: 'Caryocar brasiliense',
  dap_cm: 35.5,
  altura_m: 12
});`
        }
      ],
      P34: [
        {
          titulo: 'Verificar permissão',
          codigo: `apiRBACVerificarPermissao('write:observations');
// Retorna: { success: true, has_permission: true }`
        }
      ]
    };
    
    return exemplos[codigo] || [];
  },

  /**
   * Obtém guia de início rápido
   */
  getQuickStartGuide: function() {
    return {
      success: true,
      guia: {
        titulo: 'Guia de Início Rápido - Reserva Araras',
        passos: [
          {
            numero: 1,
            titulo: 'Acesse o Sistema',
            descricao: 'Abra a planilha Google Sheets e acesse o menu Reserva Araras.',
            icone: '🔑'
          },
          {
            numero: 2,
            titulo: 'Verifique seu Perfil',
            descricao: 'Acesse o Dashboard RBAC para ver suas permissões.',
            icone: '👤'
          },
          {
            numero: 3,
            titulo: 'Explore os Dashboards',
            descricao: 'Navegue pelos diferentes dashboards disponíveis.',
            icone: '📊'
          },
          {
            numero: 4,
            titulo: 'Registre Observações',
            descricao: 'Use os formulários para registrar dados de campo.',
            icone: '📝'
          },
          {
            numero: 5,
            titulo: 'Analise os Dados',
            descricao: 'Utilize as ferramentas de análise e relatórios.',
            icone: '📈'
          }
        ],
        dicas: [
          'Use o Dashboard Executivo para uma visão geral',
          'Configure alertas para ser notificado de eventos importantes',
          'Faça backups regulares dos dados',
          'Consulte a documentação para dúvidas específicas'
        ]
      }
    };
  },

  /**
   * Obtém FAQ
   */
  getFAQ: function() {
    return {
      success: true,
      faq: [
        {
          pergunta: 'Como faço para registrar uma observação de biodiversidade?',
          resposta: 'Acesse o formulário de Biodiversidade, preencha os campos obrigatórios (espécie, localização) e clique em Salvar. A IA irá auxiliar na identificação.'
        },
        {
          pergunta: 'Como interpreto os alertas ecológicos?',
          resposta: 'Os alertas são classificados por severidade (Crítico, Alto, Médio, Baixo). Alertas críticos requerem ação imediata.'
        },
        {
          pergunta: 'Como faço backup dos dados?',
          resposta: 'Acesse o Dashboard de Backup e clique em "Criar Backup Agora". Backups automáticos são executados diariamente às 3h.'
        },
        {
          pergunta: 'Como exporto dados para outras plataformas?',
          resposta: 'Use o Dashboard de Integrações para exportar no formato Darwin Core, compatível com GBIF e SiBBr.'
        },
        {
          pergunta: 'Como solicito acesso a funcionalidades restritas?',
          resposta: 'Entre em contato com o administrador do sistema para solicitar alteração de permissões.'
        },
        {
          pergunta: 'Os dados são seguros?',
          resposta: 'Sim. O sistema usa autenticação Google, controle de acesso RBAC e backups automáticos.'
        }
      ]
    };
  },

  /**
   * Obtém estatísticas da documentação
   */
  getStatistics: function() {
    const sistemas = Object.keys(this.SISTEMAS).length;
    const categorias = Object.keys(this.CATEGORIAS).length;
    
    // Conta APIs documentadas
    let totalAPIs = 0;
    Object.values(this.SISTEMAS).forEach(s => {
      totalAPIs += s.apis.length;
    });
    
    return {
      success: true,
      estatisticas: {
        total_sistemas: sistemas,
        total_categorias: categorias,
        total_apis: totalAPIs,
        versao: '3.2.0',
        ultima_atualizacao: '2025-12-26'
      }
    };
  },

  /**
   * Busca na documentação
   */
  search: function(query) {
    if (!query || query.length < 2) {
      return { success: false, error: 'Query muito curta' };
    }
    
    const queryLower = query.toLowerCase();
    const resultados = [];
    
    Object.entries(this.SISTEMAS).forEach(([codigo, sistema]) => {
      const descricao = this._getSystemDescription(codigo);
      const features = this._getSystemFeatures(codigo);
      
      // Busca no nome
      if (sistema.nome.toLowerCase().includes(queryLower)) {
        resultados.push({ tipo: 'Sistema', codigo, nome: sistema.nome, match: 'nome' });
      }
      // Busca na descrição
      else if (descricao.toLowerCase().includes(queryLower)) {
        resultados.push({ tipo: 'Sistema', codigo, nome: sistema.nome, match: 'descrição' });
      }
      // Busca nas funcionalidades
      else if (features.some(f => f.toLowerCase().includes(queryLower))) {
        resultados.push({ tipo: 'Sistema', codigo, nome: sistema.nome, match: 'funcionalidade' });
      }
    });
    
    return {
      success: true,
      query: query,
      resultados: resultados,
      total: resultados.length
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Documentação
// ═══════════════════════════════════════════════════════════════════════════

function apiDocListarSistemas() {
  return Documentation.getAllSystems();
}

function apiDocSistema(codigo) {
  return Documentation.getSystemDoc(codigo);
}

function apiDocQuickStart() {
  return Documentation.getQuickStartGuide();
}

function apiDocFAQ() {
  return Documentation.getFAQ();
}

function apiDocEstatisticas() {
  return Documentation.getStatistics();
}

function apiDocBuscar(query) {
  return Documentation.search(query);
}
