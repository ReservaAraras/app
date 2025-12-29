/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NAVIGATION SERVICE - Gerenciamento de Navegação e Rotas
 * ═══════════════════════════════════════════════════════════════════════════
 * @enterprise-grade Sistema de navegação global acessível entre arquivos
 */

var NavigationService = {
  /**
   * Navega para uma rota específica
   */
  navigate: function(route) {
    try {
      // Valida se a rota existe
      const nav = this.getNavigationStructure();
      if (!nav.success) {
        return { success: false, error: 'Falha ao obter estrutura de navegação' };
      }
      
      // Verifica se a rota existe
      const routeExists = nav.navigation.main.some(item => item.id === route || item.route === route);
      
      if (!routeExists) {
        return { success: false, error: `Rota não encontrada: ${route}` };
      }
      
      return { success: true, route: route };
    } catch (error) {
      Utils.logError('NavigationService.navigate', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Estrutura de navegação completa do sistema
   */
  getNavigationStructure: function() {
    return {
      success: true,
      navigation: {
        main: [
          {
            id: 'home',
            label: 'Início',
            icon: '🏠',
            route: '/',
            component: 'IndexMobile',
            description: 'Dashboard principal do sistema'
          },
          {
            id: 'plan',
            label: 'Planejamento',
            icon: '📋',
            route: '/plan',
            component: 'Plan',
            description: 'Gestão e planejamento de atividades',
            featured: true
          },
          {
            id: 'export',
            label: 'Exportação',
            icon: '📥',
            route: '/export',
            component: 'ExportInterface',
            description: 'Exportar dados em diversos formatos'
          }
        ],
        modules: [
          {
            id: 'agrofloresta',
            label: 'Agrofloresta',
            icon: '🌳',
            color: '#2ecc71',
            description: 'Gestão de parcelas e produção',
            submodules: [
              {
                id: 'parcelas',
                label: 'Parcelas',
                icon: '📐',
                description: 'Cadastro e gestão de parcelas'
              },
              {
                id: 'producao',
                label: 'Produção',
                icon: '🌾',
                description: 'Registro de produção agroflorestal'
              },
              {
                id: 'especies',
                label: 'Espécies',
                icon: '🌱',
                description: 'Catálogo de espécies'
              },
              {
                id: 'carbono',
                label: 'Carbono',
                icon: '🌍',
                description: 'Análise de sequestro de carbono'
              }
            ]
          },
          {
            id: 'ambiental',
            label: 'Monitoramento Ambiental',
            icon: '🌊',
            color: '#3498db',
            description: 'Água, solo e biodiversidade',
            submodules: [
              {
                id: 'agua',
                label: 'Qualidade da Água',
                icon: '💧',
                description: 'Análise IQA e parâmetros'
              },
              {
                id: 'solo',
                label: 'Qualidade do Solo',
                icon: '🌱',
                description: 'Fertilidade e análises'
              },
              {
                id: 'biodiversidade',
                label: 'Biodiversidade',
                icon: '🦜',
                description: 'Observações de fauna e flora'
              },
              {
                id: 'clima',
                label: 'Dados Climáticos',
                icon: '🌤️',
                description: 'Temperatura, precipitação e umidade'
              }
            ]
          },
          {
            id: 'ecoturismo',
            label: 'Ecoturismo',
            icon: '🥾',
            color: '#f39c12',
            description: 'Trilhas e visitantes',
            submodules: [
              {
                id: 'trilhas',
                label: 'Trilhas',
                icon: '🗺️',
                description: 'Gestão de trilhas e rotas'
              },
              {
                id: 'visitantes',
                label: 'Visitantes',
                icon: '👥',
                description: 'Registro de visitantes'
              },
              {
                id: 'avaliacoes',
                label: 'Avaliações',
                icon: '⭐',
                description: 'NPS e feedback'
              },
              {
                id: 'capacidade',
                label: 'Capacidade de Carga',
                icon: '📊',
                description: 'Análise de capacidade'
              }
            ]
          },
          {
            id: 'terapia',
            label: 'Terapias com Natureza',
            icon: '🧘',
            color: '#9b59b6',
            description: 'Participantes e sessões',
            submodules: [
              {
                id: 'participantes',
                label: 'Participantes',
                icon: '👤',
                description: 'Cadastro de participantes'
              },
              {
                id: 'sessoes',
                label: 'Sessões',
                icon: '📅',
                description: 'Registro de sessões'
              },
              {
                id: 'avaliacoes',
                label: 'Avaliações',
                icon: '💚',
                description: 'Índice de bem-estar'
              },
              {
                id: 'relatorios',
                label: 'Relatórios',
                icon: '📋',
                description: 'Relatórios do programa'
              }
            ]
          },
          {
            id: 'gps',
            label: 'GPS & Mapas',
            icon: '📍',
            color: '#e74c3c',
            description: 'Waypoints e geolocalização',
            submodules: [
              {
                id: 'waypoints',
                label: 'Waypoints',
                icon: '📍',
                description: 'Pontos de interesse'
              },
              {
                id: 'rotas',
                label: 'Rotas',
                icon: '🛤️',
                description: 'Rotas e trajetos'
              },
              {
                id: 'fotos',
                label: 'Fotos Geolocalizadas',
                icon: '📸',
                description: 'Galeria com localização'
              },
              {
                id: 'mapa',
                label: 'Visualizar Mapa',
                icon: '🗺️',
                description: 'Mapa interativo'
              }
            ]
          }
        ],
        tools: [
          {
            id: 'statistics',
            label: 'Estatísticas',
            icon: '📊',
            description: 'Análises e gráficos do sistema'
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: '📄',
            description: 'Geração de relatórios'
          },
          {
            id: 'search',
            label: 'Busca',
            icon: '🔍',
            description: 'Busca avançada de dados'
          },
          {
            id: 'notifications',
            label: 'Notificações',
            icon: '🔔',
            description: 'Central de notificações'
          },
          {
            id: 'sync',
            label: 'Sincronização',
            icon: '🔄',
            description: 'Sincronizar dados offline'
          }
        ],
        forms: [
          {
            id: 'waypoint',
            label: 'Novo Waypoint',
            icon: '📍',
            template: 'form-waypoint-simple',
            sheet: 'Waypoints'
          },
          {
            id: 'foto',
            label: 'Nova Foto',
            icon: '📷',
            template: 'form-foto-simple',
            sheet: 'Fotos'
          },
          {
            id: 'agua',
            label: 'Qualidade da Água',
            icon: '💧',
            template: 'form-agua-simple',
            sheet: 'QualidadeAgua'
          },
          {
            id: 'solo',
            label: 'Qualidade do Solo',
            icon: '🌱',
            template: 'form-solo-simple',
            sheet: 'QualidadeSolo'
          },
          {
            id: 'terapia',
            label: 'Avaliação Terapêutica',
            icon: '💚',
            template: 'form-terapia-simple',
            sheet: 'AvaliacoesTerapia'
          },
          {
            id: 'biodiversidade',
            label: 'Observação de Biodiversidade',
            icon: '🦜',
            template: 'form-biodiversidade-simple',
            sheet: 'Biodiversidade'
          },
          {
            id: 'producao',
            label: 'Produção Agroflorestal',
            icon: '🌾',
            template: 'form-producao-simple',
            sheet: 'ProducaoAgroflorestal'
          }
        ],
        settings: [
          {
            id: 'profile',
            label: 'Perfil',
            icon: '👤',
            description: 'Informações do usuário'
          },
          {
            id: 'preferences',
            label: 'Preferências',
            icon: '⚙️',
            description: 'Configurações do sistema'
          },
          {
            id: 'about',
            label: 'Sobre',
            icon: 'ℹ️',
            description: 'Informações do sistema'
          },
          {
            id: 'help',
            label: 'Ajuda',
            icon: '❓',
            description: 'Central de ajuda'
          }
        ]
      }
    };
  },

  /**
   * Retorna breadcrumbs para navegação
   */
  getBreadcrumbs: function(currentPath) {
    // Validação: se currentPath não for fornecido, usar '/'
    if (!currentPath || typeof currentPath !== 'string') {
      currentPath = '/';
    }
    
    const paths = currentPath.split('/').filter(p => p);
    const breadcrumbs = [{ label: 'Início', path: '/' }];
    
    let accumulated = '';
    paths.forEach(path => {
      accumulated += '/' + path;
      breadcrumbs.push({
        label: this._pathToLabel(path),
        path: accumulated
      });
    });
    
    return { success: true, breadcrumbs: breadcrumbs };
  },

  /**
   * Converte path em label legível
   */
  _pathToLabel: function(path) {
    const labels = {
      'plan': 'Planejamento',
      'export': 'Exportação',
      'agrofloresta': 'Agrofloresta',
      'ambiental': 'Ambiental',
      'ecoturismo': 'Ecoturismo',
      'terapia': 'Terapia',
      'gps': 'GPS',
      'statistics': 'Estatísticas',
      'reports': 'Relatórios'
    };
    
    return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
  },

  /**
   * Retorna menu contextual baseado no módulo atual
   */
  getContextMenu: function(moduleId) {
    const structure = this.getNavigationStructure();
    const module = structure.navigation.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return { success: false, error: 'Módulo não encontrado' };
    }
    
    return {
      success: true,
      menu: {
        title: module.label,
        icon: module.icon,
        items: module.submodules || []
      }
    };
  },

  /**
   * Busca na estrutura de navegação
   */
  searchNavigation: function(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return {
        success: false,
        error: 'Query inválida',
        results: [],
        count: 0
      };
    }
    
    const structure = this.getNavigationStructure();
    const results = [];
    
    const searchIn = (items, category) => {
      if (!items || !Array.isArray(items)) return;
      
      items.forEach(item => {
        if (!item || !item.label) return;
        
        const labelMatch = item.label.toLowerCase().includes(query.toLowerCase());
        const descMatch = item.description && item.description.toLowerCase().includes(query.toLowerCase());
        
        if (labelMatch || descMatch) {
          results.push({
            ...item,
            category: category
          });
        }
        
        if (item.submodules && Array.isArray(item.submodules)) {
          searchIn(item.submodules, item.label);
        }
      });
    };
    
    if (structure && structure.navigation) {
      if (structure.navigation.main) searchIn(structure.navigation.main, 'Principal');
      if (structure.navigation.modules) searchIn(structure.navigation.modules, 'Módulos');
      if (structure.navigation.tools) searchIn(structure.navigation.tools, 'Ferramentas');
      if (structure.navigation.forms) searchIn(structure.navigation.forms, 'Formulários');
    }
    
    return {
      success: true,
      query: query,
      results: results,
      count: results.length
    };
  }
};

/**
 * API Endpoints
 */
function apiGetNavigation() {
  return NavigationService.getNavigationStructure();
}

function apiGetBreadcrumbs(path) {
  if (!path || typeof path !== 'string') {
    Logger.log('apiGetBreadcrumbs: path inválido - ' + JSON.stringify(path));
    return {
      success: false,
      error: 'Path inválido',
      breadcrumbs: []
    };
  }
  return NavigationService.getBreadcrumbs(path);
}

function apiGetContextMenu(moduleId) {
  return NavigationService.getContextMenu(moduleId);
}

function apiSearchNavigation(query) {
  return NavigationService.searchNavigation(query);
}
