/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH SERVICE - Sistema de Autenticação
 * ═══════════════════════════════════════════════════════════════════════════
 * Gerencia autenticação de múltiplos tipos de usuários:
 * - Administrador: Acesso total (único, não pode ser criado)
 * - Terapeuta: Acesso a terapias e sessões
 * - Técnico: Acesso a dados ambientais e agroflorestais
 * - Visitante: Acesso limitado (visualização)
 * - Apoiador: Apoiador da causa ambiental
 * - Sanitarista: Profissional de saúde ambiental
 * - Ambientalista: Defensor do meio ambiente
 * - Trilheiro: Praticante de trilhas ecológicas
 * - Ecoturista: Turista ecológico
 */

/**
 * Função global para criar usuário (chamada pelo frontend)
 * @param {Object} userData - Dados do usuário {nome, email, senha, tipo}
 * @returns {Object} Resultado da criação
 */
function createUser(userData) {
  return AuthService.createUser(userData);
}

var AuthService = {
  
  /**
   * Tipos de usuários
   */
  USER_TYPES: {
    ADMIN: 'Administrador',
    THERAPIST: 'Terapeuta',
    TECHNICIAN: 'Tecnico',
    VISITOR: 'Visitante',
    APOIADOR: 'Apoiador',
    SANITARISTA: 'Sanitarista',
    AMBIENTALISTA: 'Ambientalista',
    TRILHEIRO: 'Trilheiro',
    ECOTURISTA: 'Ecoturista'
  },
  
  /**
   * Tipos permitidos para criação de conta (exclui ADMIN)
   */
  ALLOWED_REGISTRATION_TYPES: ['Apoiador', 'Sanitarista', 'Ambientalista', 'Trilheiro', 'Ecoturista'],
  
  /**
   * Permissões por tipo de usuário
   */
  PERMISSIONS: {
    Administrador: {
      read: ['*'],
      write: ['*'],
      delete: ['*'],
      export: true,
      manage_users: true
    },
    ADMIN: {
      read: ['*'],
      write: ['*'],
      delete: ['*'],
      export: true,
      manage_users: true
    },
    Terapeuta: {
      read: ['ParticipantesTerapia', 'SessoesTerapia', 'AvaliacoesTerapeuticas', 'PlantasMedicinais'],
      write: ['ParticipantesTerapia', 'SessoesTerapia', 'AvaliacoesTerapeuticas'],
      delete: ['SessoesTerapia', 'AvaliacoesTerapeuticas'],
      export: true,
      manage_users: false
    },
    Tecnico: {
      read: ['Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo', 'Biodiversidade', 
             'ParcelasAgroflorestais', 'ProducaoAgroflorestal', 'DadosClimaticos'],
      write: ['Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo', 'Biodiversidade', 
              'ParcelasAgroflorestais', 'ProducaoAgroflorestal', 'DadosClimaticos'],
      delete: ['Fotos'],
      export: true,
      manage_users: false
    },
    Visitante: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Visitantes'],
      write: ['Visitantes'],
      delete: [],
      export: false,
      manage_users: false
    },
    // Novos tipos de usuário (minúsculas)
    Apoiador: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade', 'DadosClimaticos'],
      write: [],
      delete: [],
      export: false,
      manage_users: false
    },
    Sanitarista: {
      read: ['Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo', 'DadosClimaticos'],
      write: ['QualidadeAgua', 'QualidadeSolo'],
      delete: [],
      export: true,
      manage_users: false
    },
    Ambientalista: {
      read: ['Waypoints', 'Fotos', 'Biodiversidade', 'QualidadeAgua', 'QualidadeSolo', 'DadosClimaticos', 'Trilhas'],
      write: ['Biodiversidade', 'Fotos'],
      delete: [],
      export: true,
      manage_users: false
    },
    Trilheiro: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade'],
      write: ['Trilhas', 'Fotos'],
      delete: [],
      export: false,
      manage_users: false
    },
    Ecoturista: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade', 'Visitantes'],
      write: ['Visitantes', 'Fotos'],
      delete: [],
      export: false,
      manage_users: false
    },
    // Tipos em MAIÚSCULAS (compatibilidade com frontend)
    VOLUNTARIO: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade', 'DadosClimaticos'],
      write: [],
      delete: [],
      export: false,
      manage_users: false
    },
    SANITARISTA: {
      read: ['Waypoints', 'Fotos', 'QualidadeAgua', 'QualidadeSolo', 'DadosClimaticos'],
      write: ['QualidadeAgua', 'QualidadeSolo'],
      delete: [],
      export: true,
      manage_users: false
    },
    AMBIENTALISTA: {
      read: ['Waypoints', 'Fotos', 'Biodiversidade', 'QualidadeAgua', 'QualidadeSolo', 'DadosClimaticos', 'Trilhas'],
      write: ['Biodiversidade', 'Fotos'],
      delete: [],
      export: true,
      manage_users: false
    },
    GUIA: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade', 'Visitantes'],
      write: ['Trilhas', 'Fotos', 'Visitantes'],
      delete: [],
      export: true,
      manage_users: false
    },
    ECOTURISTA: {
      read: ['Waypoints', 'Fotos', 'Trilhas', 'Biodiversidade', 'Visitantes'],
      write: ['Visitantes', 'Fotos'],
      delete: [],
      export: false,
      manage_users: false
    }
  },
  
  /**
   * Autentica usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário (armazenada na coluna observacoes)
   * @returns {Object} Resultado da autenticação
   */
  authenticate: function(email, password) {
    try {
      if (!email || !password) {
        return {
          success: false,
          message: 'Email e senha são obrigatórios'
        };
      }
      
      // Buscar usuário na base de dados
      var result = DatabaseService.read('Usuarios', {
        email: email
      });
      
      if (!result.success || !result.data || result.data.length === 0) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }
      
      var user = result.data[0];
      
      // Verificar senha - ARMAZENADA NA COLUNA OBSERVACOES
      var storedPassword = user.observacoes || user.senha;
      if (storedPassword !== password) {
        return {
          success: false,
          message: 'Senha incorreta'
        };
      }
      
      // Verificar se usuário está ativo
      if (user.ativo === false || user.ativo === 'false' || user.ativo === 'FALSE') {
        return {
          success: false,
          message: 'Usuário inativo'
        };
      }
      
      // Criar sessão
      var session = this.createSession(user);
      
      // Atualizar último acesso
      try {
        DatabaseService.update('Usuarios', user.id, { ultimo_acesso: new Date() });
      } catch (e) {
        // Ignora erro de atualização de último acesso
      }
      
      // Retornar dados do usuário (sem senha)
      return {
        success: true,
        message: 'Autenticação realizada com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo_usuario || user.tipo || 'Visitante',
          role: user.tipo_usuario || user.tipo || 'Visitante',
          label: user.tipo_usuario || user.tipo || 'Visitante',
          sessionToken: session.token,
          permissions: this.PERMISSIONS[user.tipo_usuario] || this.PERMISSIONS[user.tipo] || this.PERMISSIONS.Visitante
        }
      };
      
    } catch (error) {
      Utils.logError('AuthService.authenticate', error);
      return {
        success: false,
        message: 'Erro ao autenticar: ' + error.toString()
      };
    }
  },
  
  /**
   * Cria sessão para usuário
   * @param {Object} user - Dados do usuário
   * @returns {Object} Dados da sessão
   */
  createSession: function(user) {
    try {
      var token = Utilities.getUuid();
      var expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas
      
      var session = {
        token: token,
        userId: user.id,
        email: user.email,
        tipo: user.tipo,
        createdAt: new Date(),
        expiresAt: expiresAt
      };
      
      // Salvar sessão em cache
      var cache = CacheService.getUserCache();
      cache.put('session_' + token, JSON.stringify(session), 86400); // 24 horas
      
      return session;
      
    } catch (error) {
      Utils.logError('AuthService.createSession', error);
      return null;
    }
  },
  
  /**
   * Valida sessão
   * @param {string} token - Token da sessão
   * @returns {Object} Resultado da validação
   */
  validateSession: function(token) {
    try {
      if (!token) {
        return { success: false, message: 'Token não fornecido' };
      }
      
      var cache = CacheService.getUserCache();
      var sessionData = cache.get('session_' + token);
      
      if (!sessionData) {
        return { success: false, message: 'Sessão expirada ou inválida' };
      }
      
      var session = JSON.parse(sessionData);
      
      // Verificar expiração
      var expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        cache.remove('session_' + token);
        return { success: false, message: 'Sessão expirada' };
      }
      
      return {
        success: true,
        session: session
      };
      
    } catch (error) {
      Utils.logError('AuthService.validateSession', error);
      return {
        success: false,
        message: 'Erro ao validar sessão: ' + error.toString()
      };
    }
  },
  
  /**
   * Verifica se usuário tem permissão
   * @param {string} userType - Tipo do usuário
   * @param {string} action - Ação (read, write, delete)
   * @param {string} resource - Recurso (nome do sheet)
   * @returns {boolean} True se tem permissão
   */
  hasPermission: function(userType, action, resource) {
    try {
      var permissions = this.PERMISSIONS[userType];
      if (!permissions) return false;
      
      var allowedResources = permissions[action];
      if (!allowedResources) return false;
      
      // Administrador tem acesso total
      if (allowedResources[0] === '*') return true;
      
      // Verificar se recurso está na lista
      return allowedResources.indexOf(resource) !== -1;
      
    } catch (error) {
      Utils.logError('AuthService.hasPermission', error);
      return false;
    }
  },
  
  /**
   * Cria novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Resultado da criação
   */
  createUser: function(userData) {
    try {
      // Validar se userData foi fornecido
      if (!userData || typeof userData !== 'object') {
        return {
          success: false,
          message: 'Dados do usuário não fornecidos ou inválidos'
        };
      }
      
      // Extrair campos - aceita tanto 'tipo' quanto 'tipo_usuario'
      var nome = userData.nome;
      var email = userData.email;
      var senha = userData.senha || userData.observacoes; // Senha pode vir em 'senha' ou 'observacoes'
      var tipo = userData.tipo_usuario || userData.tipo;
      var telefone = userData.telefone || '';
      
      // Validar dados obrigatórios
      if (!nome || !email || !senha || !tipo) {
        return {
          success: false,
          message: 'Nome, email, senha e tipo são obrigatórios',
          received: {
            hasNome: !!nome,
            hasEmail: !!email,
            hasSenha: !!senha,
            hasTipo: !!tipo
          }
        };
      }
      
      // Validar email
      if (!Utils.validators.email(email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }
      
      // BLOQUEAR criação de usuário ADMIN se já existir um
      if (tipo === 'ADMIN' || tipo === 'Administrador' || tipo === this.USER_TYPES.ADMIN) {
        var existingAdmin = DatabaseService.read('Usuarios', { tipo_usuario: 'ADMIN' });
        if (existingAdmin.success && existingAdmin.data && existingAdmin.data.length > 0) {
          return {
            success: false,
            message: 'Já existe um usuário ADMIN cadastrado. Apenas um ADMIN é permitido.'
          };
        }
        // Também verificar com 'Administrador'
        var existingAdmin2 = DatabaseService.read('Usuarios', { tipo_usuario: 'Administrador' });
        if (existingAdmin2.success && existingAdmin2.data && existingAdmin2.data.length > 0) {
          return {
            success: false,
            message: 'Já existe um usuário Administrador cadastrado. Apenas um ADMIN é permitido.'
          };
        }
      }
      
      // Verificar se email já existe
      var existing = DatabaseService.read('Usuarios', {
        email: email
      });
      
      if (existing.success && existing.data && existing.data.length > 0) {
        return {
          success: false,
          message: 'Email já cadastrado'
        };
      }
      
      // Mapear tipo para cargo e permissão
      var cargoMap = {
        'VOLUNTARIO': 'Voluntário',
        'SANITARISTA': 'Sanitarista',
        'AMBIENTALISTA': 'Ambientalista',
        'GUIA': 'Guia',
        'ECOTURISTA': 'Ecoturista',
        'ADMIN': 'Administrador',
        'Administrador': 'Administrador',
        'Terapeuta': 'Terapeuta',
        'Tecnico': 'Técnico',
        'Visitante': 'Visitante'
      };
      
      var permissaoMap = {
        'VOLUNTARIO': 'read',
        'SANITARISTA': 'write',
        'AMBIENTALISTA': 'write',
        'GUIA': 'write',
        'ECOTURISTA': 'read',
        'ADMIN': 'full',
        'Administrador': 'full',
        'Terapeuta': 'write',
        'Tecnico': 'write',
        'Visitante': 'read'
      };
      
      // Gerar ID no formato USUA_timestamp_index
      var timestamp = new Date().getTime();
      var existingUsers = DatabaseService.read('Usuarios', {});
      var index = existingUsers.success ? existingUsers.data.length : 0;
      var id = 'USUA_' + timestamp + '_' + index;
      
      // Criar usuário com estrutura da planilha Usuarios
      var user = {
        id: id,
        timestamp: new Date(),
        nome: nome,
        email: email,
        telefone: telefone,
        tipo_usuario: tipo,
        cargo: cargoMap[tipo] || tipo,
        permissao: permissaoMap[tipo] || 'read',
        data_criacao: new Date(),
        ultimo_acesso: '',
        ativo: true,
        observacoes: senha // SENHA ARMAZENADA NA COLUNA OBSERVACOES
      };
      
      var result = DatabaseService.create('Usuarios', user);
      
      if (result.success) {
        return {
          success: true,
          message: 'Usuário criado com sucesso',
          userId: result.id || id
        };
      } else {
        return result;
      }
      
    } catch (error) {
      Utils.logError('AuthService.createUser', error);
      return {
        success: false,
        message: 'Erro ao criar usuário: ' + error.toString()
      };
    }
  },
  
  /**
   * Logout
   * @param {string} token - Token da sessão
   * @returns {Object} Resultado do logout
   */
  logout: function(token) {
    try {
      if (!token) {
        return { success: false, message: 'Token não fornecido' };
      }
      
      var cache = CacheService.getUserCache();
      cache.remove('session_' + token);
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
      
    } catch (error) {
      Utils.logError('AuthService.logout', error);
      return {
        success: false,
        message: 'Erro ao fazer logout: ' + error.toString()
      };
    }
  },
  
  /**
   * Inicializa usuários padrão (apenas para desenvolvimento)
   */
  initializeDefaultUsers: function() {
    try {
      var defaultUsers = [
        {
          nome: 'Administrador',
          email: 'admin@reserva.com',
          senha: 'admin123',
          tipo: 'Administrador'
        },
        {
          nome: 'Terapeuta',
          email: 'terapeuta@reserva.com',
          senha: 'terapeuta123',
          tipo: 'Terapeuta'
        },
        {
          nome: 'Técnico',
          email: 'tecnico@reserva.com',
          senha: 'tecnico123',
          tipo: 'Tecnico'
        },
        {
          nome: 'Visitante',
          email: 'visitante@reserva.com',
          senha: 'visitante123',
          tipo: 'Visitante'
        }
      ];
      
      var created = 0;
      var errors = [];
      
      for (var i = 0; i < defaultUsers.length; i++) {
        var result = this.createUser(defaultUsers[i]);
        if (result.success) {
          created++;
        } else {
          errors.push(defaultUsers[i].email + ': ' + result.message);
        }
      }
      
      return {
        success: true,
        message: created + ' usuários criados',
        created: created,
        errors: errors
      };
      
    } catch (error) {
      Utils.logError('AuthService.initializeDefaultUsers', error);
      return {
        success: false,
        message: 'Erro ao inicializar usuários: ' + error.toString()
      };
    }
  }
};
