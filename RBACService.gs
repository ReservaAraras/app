/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE PERMISSÕES E CONTROLE DE ACESSO (RBAC)
 * ═══════════════════════════════════════════════════════════════════════════
 * P34 - Role-Based Access Control System
 * 
 * Funcionalidades:
 * - Gestão de papéis (roles)
 * - Controle de permissões granular
 * - Auditoria de acessos
 * - Autenticação de usuários
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const USUARIOS_RBAC_HEADERS = [
  'ID_Usuario', 'Email', 'Nome', 'Role', 'Status', 'Data_Criacao',
  'Ultimo_Acesso', 'Criado_Por', 'Observacoes'
];

const AUDIT_LOG_HEADERS = [
  'ID_Log', 'Data_Hora', 'Usuario', 'Acao', 'Recurso', 'Detalhes',
  'IP', 'Status', 'Role'
];

/**
 * Sistema RBAC
 * @namespace RBAC
 */
const RBAC = {
  
  SHEET_USUARIOS: 'USUARIOS_RBAC_RA',
  SHEET_AUDIT: 'AUDIT_LOG_RA',
  
  /**
   * Limiares de segurança para detecção de anomalias
   */
  SECURITY_THRESHOLDS: {
    MAX_FAILED_ATTEMPTS_24H: 5,        // Máximo de tentativas falhas em 24h antes de marcar como suspeito
    RAPID_ROLE_CHANGE_HOURS: 24,       // Intervalo mínimo entre alterações de role (horas)
    ANOMALY_FREQUENCY_MULTIPLIER: 3,   // Multiplicador para detectar atividade anômala
    INACTIVE_DAYS_THRESHOLD: 90,       // Dias sem acesso para considerar usuário inativo
    ATYPICAL_HOUR_START: 0,            // Início do horário atípico (00:00)
    ATYPICAL_HOUR_END: 5               // Fim do horário atípico (05:00)
  },
  
  /**
   * Recursos sensíveis que requerem monitoramento especial
   */
  SENSITIVE_RESOURCES: [
    'write:system',
    'delete:all',
    'users:admin',
    'backup:restore',
    'config:modify',
    'rbac:modify',
    'audit:delete'
  ],

  /**
   * Configuração de Onboarding - Prompt 6/43
   */
  ONBOARDING_CONFIG: {
    INVITE_EXPIRY_DAYS: 7,
    TOKEN_LENGTH: 32,
    STATUS: {
      PENDING: 'Pendente',
      ACTIVE: 'Ativo',
      EXPIRED: 'Expirado',
      CANCELLED: 'Cancelado'
    }
  },

  /**
   * Mapeamento de Escopo por Role - Prompt 6/43
   */
  ROLE_SCOPE_MAP: {
    Admin: {
      modulos: ['*'],
      planilhas: ['*'],
      acoes: ['*'],
      descricao_acesso: 'Acesso total a todos os módulos e funcionalidades'
    },
    Gestor: {
      modulos: ['biodiversidade', 'conservacao', 'iot', 'relatorios', 'usuarios', 'backup', 'dashboard'],
      planilhas: ['BIODIVERSIDADE_RA', 'ALERTAS_ECOLOGICOS_RA', 'USUARIOS_RBAC_RA', 'AUDIT_LOG_RA', 'BACKUP_LOG_RA'],
      acoes: ['read', 'write', 'delete:own', 'export', 'users:view', 'reports:generate'],
      descricao_acesso: 'Gestão operacional e relatórios'
    },
    Pesquisador: {
      modulos: ['biodiversidade', 'conservacao', 'carbono', 'relatorios', 'analise'],
      planilhas: ['BIODIVERSIDADE_RA', 'SUCESSAO_ECOLOGICA_RA', 'PARCELAS_CARBONO_RA', 'MEDICOES_CARBONO_RA', 'RELATORIOS_CIENTIFICOS_RA'],
      acoes: ['read', 'write:observations', 'write:analysis', 'export'],
      descricao_acesso: 'Pesquisa científica e análise de dados'
    },
    Monitor: {
      modulos: ['biodiversidade', 'trilhas', 'gps', 'alertas', 'fotos'],
      planilhas: ['BIODIVERSIDADE_RA', 'GPS_POINTS', 'TRILHAS', 'ALERTAS_ECOLOGICOS_RA', 'FOTOS'],
      acoes: ['read:dashboard', 'read:own', 'write:observations', 'write:photos'],
      descricao_acesso: 'Monitoramento de campo e registro de observações'
    },
    Trilheiro: {
      modulos: ['visitantes', 'trilhas', 'gps', 'eventos'],
      planilhas: ['VISITANTES', 'TRILHAS', 'GPS_POINTS', 'WAYPOINTS'],
      acoes: ['read', 'write:observations', 'read:events'],
      descricao_acesso: 'Guia de trilhas e atendimento a visitantes'
    },
    Voluntario: {
      modulos: ['biodiversidade', 'eventos', 'gamificacao'],
      planilhas: ['BIODIVERSIDADE_RA', 'GAMIFICACAO_RA'],
      acoes: ['read:public', 'write:observations', 'read:events'],
      descricao_acesso: 'Participação em atividades voluntárias'
    },
    Visitante: {
      modulos: ['public', 'trilhas'],
      planilhas: [],
      acoes: ['read:public'],
      descricao_acesso: 'Acesso somente leitura a informações públicas'
    }
  },
  
  /**
   * Definição de Papéis e Permissões
   */
  ROLES: {
    Admin: {
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      nivel: 100,
      permissoes: ['*'],
      cor: '#D32F2F'
    },
    Gestor: {
      nome: 'Gestor',
      descricao: 'Gestão de dados e relatórios',
      nivel: 80,
      permissoes: [
        'read:all', 'write:all', 'delete:own',
        'export:data', 'reports:generate', 'users:view'
      ],
      cor: '#1976D2'
    },
    Pesquisador: {
      nome: 'Pesquisador',
      descricao: 'Acesso a dados científicos',
      nivel: 60,
      permissoes: [
        'read:all', 'write:observations', 'write:analysis',
        'export:data', 'reports:view'
      ],
      cor: '#388E3C'
    },
    Monitor: {
      nome: 'Monitor de Campo',
      descricao: 'Registro de observações',
      nivel: 40,
      permissoes: [
        'read:dashboard', 'read:own', 'write:observations',
        'read:alerts', 'write:photos'
      ],
      cor: '#F57C00'
    },
    Trilheiro: {
      nome: 'Trilheiro',
      descricao: 'Guia de trilhas e visitantes',
      nivel: 30,
      permissoes: [
        'read:dashboard', 'read:trilhas', 'read:visitantes',
        'write:observations', 'read:events', 'read:gps'
      ],
      cor: '#795548'
    },
    Voluntario: {
      nome: 'Voluntário',
      descricao: 'Participação em atividades',
      nivel: 20,
      permissoes: [
        'read:public', 'write:observations', 'read:events'
      ],
      cor: '#7B1FA2'
    },
    Visitante: {
      nome: 'Visitante',
      descricao: 'Acesso somente leitura',
      nivel: 10,
      permissoes: ['read:public'],
      cor: '#607D8B'
    }
  },

  /**
   * Recursos do sistema
   */
  RECURSOS: {
    dashboard: 'Dashboard',
    biodiversidade: 'Biodiversidade',
    conservacao: 'Conservação',
    iot: 'IoT/Sensores',
    relatorios: 'Relatórios',
    usuarios: 'Usuários',
    configuracoes: 'Configurações',
    backup: 'Backup',
    integracao: 'Integrações'
  },

  /**
   * Inicializa planilhas
   */
  initializeSheets: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet1 = ss.getSheetByName(this.SHEET_USUARIOS);
      if (!sheet1) {
        sheet1 = ss.insertSheet(this.SHEET_USUARIOS);
        sheet1.appendRow(USUARIOS_RBAC_HEADERS);
        this._formatHeader(sheet1, USUARIOS_RBAC_HEADERS.length, '#5D4037');
        
        // Cria usuário admin padrão
        const adminEmail = Session.getActiveUser().getEmail();
        if (adminEmail) {
          sheet1.appendRow([
            `USR-${Date.now().toString(36).toUpperCase()}`,
            adminEmail,
            'Administrador',
            'Admin',
            'Ativo',
            new Date().toISOString(),
            new Date().toISOString(),
            'Sistema',
            'Usuário admin criado automaticamente'
          ]);
        }
      }
      
      let sheet2 = ss.getSheetByName(this.SHEET_AUDIT);
      if (!sheet2) {
        sheet2 = ss.insertSheet(this.SHEET_AUDIT);
        sheet2.appendRow(AUDIT_LOG_HEADERS);
        this._formatHeader(sheet2, AUDIT_LOG_HEADERS.length, '#455A64');
      }
      
      return { success: true, sheets: [this.SHEET_USUARIOS, this.SHEET_AUDIT] };
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
   * Obtém usuário atual
   */
  getCurrentUser: function() {
    try {
      const email = Session.getActiveUser().getEmail();
      if (!email) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      const user = this._getUserByEmail(email);
      if (!user) {
        // Retorna como visitante se não cadastrado
        return {
          success: true,
          usuario: {
            email: email,
            nome: email.split('@')[0],
            role: 'Visitante',
            status: 'Não cadastrado'
          },
          role_info: this.ROLES['Visitante'],
          permissoes: this.ROLES['Visitante'].permissoes
        };
      }
      
      const roleInfo = this.ROLES[user.role] || this.ROLES['Visitante'];
      
      // Atualiza último acesso
      this._updateLastAccess(email);
      
      return {
        success: true,
        usuario: user,
        role_info: roleInfo,
        permissoes: roleInfo.permissoes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Busca usuário por email
   * @private
   */
  _getUserByEmail: function(email) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          return {
            id: data[i][0],
            email: data[i][1],
            nome: data[i][2],
            role: data[i][3],
            status: data[i][4],
            data_criacao: data[i][5],
            ultimo_acesso: data[i][6]
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Atualiza último acesso
   * @private
   */
  _updateLastAccess: function(email) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          sheet.getRange(i + 1, 7).setValue(new Date().toISOString());
          break;
        }
      }
    } catch (e) {
      Logger.log(`[_updateLastAccess] Erro: ${e}`);
    }
  },

  /**
   * Verifica se usuário tem permissão
   */
  checkPermission: function(email, permission) {
    try {
      const user = this._getUserByEmail(email);
      const role = user?.role || 'Visitante';
      const roleInfo = this.ROLES[role];
      
      if (!roleInfo) return false;
      
      // Admin tem todas as permissões
      if (roleInfo.permissoes.includes('*')) return true;
      
      // Verifica permissão específica
      if (roleInfo.permissoes.includes(permission)) return true;
      
      // Verifica permissões com wildcard (ex: read:all inclui read:dashboard)
      const [action, resource] = permission.split(':');
      if (roleInfo.permissoes.includes(`${action}:all`)) return true;
      
      return false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Registra usuário
   */
  registerUser: function(userData) {
    try {
      this.initializeSheets();
      
      // Verifica se usuário atual é admin ou gestor
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRole = this.ROLES[currentUser.usuario.role];
      if (!currentRole || currentRole.nivel < 80) {
        return { success: false, error: 'Sem permissão para criar usuários' };
      }
      
      // Verifica se email já existe
      if (this._getUserByEmail(userData.email)) {
        return { success: false, error: 'Email já cadastrado' };
      }
      
      // Valida role
      if (!this.ROLES[userData.role]) {
        return { success: false, error: 'Role inválido' };
      }
      
      // Não permite criar usuário com nível maior que o próprio
      if (this.ROLES[userData.role].nivel > currentRole.nivel) {
        return { success: false, error: 'Não é possível criar usuário com nível superior ao seu' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      const userId = `USR-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        userId,
        userData.email,
        userData.nome || userData.email.split('@')[0],
        userData.role,
        'Ativo',
        new Date().toISOString(),
        null,
        currentUser.usuario.email,
        userData.observacoes || ''
      ];
      
      sheet.appendRow(row);
      
      // Log de auditoria
      this._logAudit(currentUser.usuario.email, 'CREATE_USER', 'usuarios', `Criou usuário ${userData.email} com role ${userData.role}`);
      
      return { success: true, user_id: userId, email: userData.email, role: userData.role };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza role de usuário
   */
  updateUserRole: function(email, newRole) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRoleInfo = this.ROLES[currentUser.usuario.role];
      if (!currentRoleInfo || currentRoleInfo.nivel < 80) {
        return { success: false, error: 'Sem permissão para alterar roles' };
      }
      
      if (!this.ROLES[newRole]) {
        return { success: false, error: 'Role inválido' };
      }
      
      if (this.ROLES[newRole].nivel > currentRoleInfo.nivel) {
        return { success: false, error: 'Não é possível atribuir role superior ao seu' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          const oldRole = data[i][3];
          sheet.getRange(i + 1, 4).setValue(newRole);
          
          this._logAudit(currentUser.usuario.email, 'UPDATE_ROLE', 'usuarios', `Alterou role de ${email}: ${oldRole} -> ${newRole}`);
          
          return { success: true, email: email, old_role: oldRole, new_role: newRole };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Desativa usuário
   */
  deactivateUser: function(email) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRoleInfo = this.ROLES[currentUser.usuario.role];
      if (!currentRoleInfo || currentRoleInfo.nivel < 80) {
        return { success: false, error: 'Sem permissão para desativar usuários' };
      }
      
      // Não pode desativar a si mesmo
      if (email === currentUser.usuario.email) {
        return { success: false, error: 'Não é possível desativar seu próprio usuário' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          sheet.getRange(i + 1, 5).setValue('Inativo');
          
          this._logAudit(currentUser.usuario.email, 'DEACTIVATE_USER', 'usuarios', `Desativou usuário ${email}`);
          
          return { success: true, email: email, status: 'Inativo' };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista todos os usuários
   */
  listUsers: function() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      // Verifica permissão
      if (!this.checkPermission(currentUser.usuario.email, 'users:view') && 
          !this.checkPermission(currentUser.usuario.email, 'read:all')) {
        return { success: false, error: 'Sem permissão para visualizar usuários' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, users: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const users = [];
      
      for (let i = 1; i < data.length; i++) {
        const roleInfo = this.ROLES[data[i][3]] || {};
        users.push({
          id: data[i][0],
          email: data[i][1],
          nome: data[i][2],
          role: data[i][3],
          role_nome: roleInfo.nome || data[i][3],
          role_cor: roleInfo.cor || '#607D8B',
          status: data[i][4],
          data_criacao: data[i][5],
          ultimo_acesso: data[i][6]
        });
      }
      
      return { success: true, users: users, count: users.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra log de auditoria
   * @private
   */
  _logAudit: function(usuario, acao, recurso, detalhes, status = 'SUCESSO') {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AUDIT);
      
      const user = this._getUserByEmail(usuario);
      
      sheet.appendRow([
        `AUD-${Date.now().toString(36).toUpperCase()}`,
        new Date().toISOString(),
        usuario,
        acao,
        recurso,
        detalhes,
        '', // IP não disponível em GAS
        status,
        user?.role || 'Desconhecido'
      ]);
    } catch (e) {
      Logger.log(`[_logAudit] Erro: ${e}`);
    }
  },

  /**
   * Registra acesso a recurso
   */
  logAccess: function(recurso, acao, detalhes) {
    try {
      const currentUser = this.getCurrentUser();
      const email = currentUser.usuario?.email || 'Anônimo';
      
      this._logAudit(email, acao, recurso, detalhes);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém log de auditoria
   */
  getAuditLog: function(limit = 100) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      // Apenas admin e gestor podem ver logs
      const roleInfo = this.ROLES[currentUser.usuario.role];
      if (!roleInfo || roleInfo.nivel < 80) {
        return { success: false, error: 'Sem permissão para visualizar logs' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AUDIT);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, logs: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      const logs = [];
      
      for (let i = Math.max(1, data.length - limit); i < data.length; i++) {
        logs.push({
          id: data[i][0],
          data_hora: data[i][1],
          usuario: data[i][2],
          acao: data[i][3],
          recurso: data[i][4],
          detalhes: data[i][5],
          status: data[i][7],
          role: data[i][8]
        });
      }
      
      logs.reverse();
      
      return { success: true, logs: logs, count: logs.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Lista roles disponíveis
   */
  listRoles: function() {
    return {
      success: true,
      roles: Object.entries(this.ROLES).map(([key, role]) => ({
        codigo: key,
        nome: role.nome,
        descricao: role.descricao,
        nivel: role.nivel,
        cor: role.cor,
        permissoes: role.permissoes
      })),
      recursos: this.RECURSOS
    };
  },

  /**
   * Obtém estatísticas
   */
  getStatistics: function() {
    try {
      const usersResult = this.listUsers();
      const users = usersResult.users || [];
      
      const stats = {
        total_usuarios: users.length,
        usuarios_ativos: users.filter(u => u.status === 'Ativo').length,
        usuarios_inativos: users.filter(u => u.status === 'Inativo').length,
        por_role: {}
      };
      
      users.forEach(u => {
        if (!stats.por_role[u.role]) stats.por_role[u.role] = 0;
        stats.por_role[u.role]++;
      });
      
      // Conta logs recentes
      const ss = getSpreadsheet();
      const auditSheet = ss.getSheetByName(this.SHEET_AUDIT);
      stats.total_logs = auditSheet ? Math.max(0, auditSheet.getLastRow() - 1) : 0;
      
      return { success: true, estatisticas: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // USER ONBOARDING FUNCTIONS - Prompt 6/43
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Gera token único para onboarding
   * @private
   */
  _generateOnboardingToken: function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < this.ONBOARDING_CONFIG.TOKEN_LENGTH; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  /**
   * Obtém detalhes do escopo de um role
   * @param {string} role - Nome do role
   * @returns {object} Detalhes do escopo
   */
  getRoleScopeDetails: function(role) {
    if (!this.ROLES[role]) {
      return { success: false, error: `Role '${role}' não encontrado` };
    }
    
    const roleInfo = this.ROLES[role];
    const scopeInfo = this.ROLE_SCOPE_MAP[role] || {
      modulos: [],
      planilhas: [],
      acoes: [],
      descricao_acesso: 'Escopo não definido'
    };
    
    return {
      success: true,
      role: role,
      role_info: {
        nome: roleInfo.nome,
        descricao: roleInfo.descricao,
        nivel: roleInfo.nivel,
        cor: roleInfo.cor,
        permissoes: roleInfo.permissoes
      },
      scope: {
        modulos: scopeInfo.modulos,
        planilhas: scopeInfo.planilhas,
        acoes: scopeInfo.acoes,
        descricao_acesso: scopeInfo.descricao_acesso
      }
    };
  },

  /**
   * Realiza onboarding completo de novo usuário
   * @param {object} userData - Dados do usuário
   * @returns {object} Resultado do onboarding
   */
  onboardUser: function(userData) {
    try {
      this.initializeSheets();
      
      // Verifica permissão do usuário atual
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRole = this.ROLES[currentUser.usuario.role];
      if (!currentRole || currentRole.nivel < 80) {
        return { success: false, error: 'Sem permissão para realizar onboarding de usuários' };
      }
      
      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        return { success: false, error: 'Email inválido' };
      }
      
      // Verifica se email já existe
      if (this._getUserByEmail(userData.email)) {
        return { success: false, error: 'Email já cadastrado no sistema' };
      }
      
      // Valida role
      if (!this.ROLES[userData.role]) {
        const rolesDisponiveis = Object.keys(this.ROLES).join(', ');
        return { success: false, error: `Role inválido. Roles disponíveis: ${rolesDisponiveis}` };
      }
      
      // Não permite criar usuário com nível maior que o próprio
      if (this.ROLES[userData.role].nivel > currentRole.nivel) {
        return { success: false, error: 'Não é possível criar usuário com nível superior ao seu' };
      }
      
      // Gera token e calcula expiração
      const token = this._generateOnboardingToken();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.ONBOARDING_CONFIG.INVITE_EXPIRY_DAYS);
      
      // Obtém escopo do role
      const scopeDetails = this.getRoleScopeDetails(userData.role);
      const scope = scopeDetails.success ? scopeDetails.scope : {};
      
      // Adiciona módulos extras se especificados
      if (userData.modulos_extras && Array.isArray(userData.modulos_extras)) {
        scope.modulos = [...new Set([...scope.modulos, ...userData.modulos_extras])];
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      const userId = `USR-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        userId,
        userData.email,
        userData.nome || userData.email.split('@')[0],
        userData.role,
        this.ONBOARDING_CONFIG.STATUS.PENDING,
        new Date().toISOString(),
        null, // ultimo_acesso
        currentUser.usuario.email,
        JSON.stringify({
          observacoes: userData.observacoes || '',
          onboarding_token: token,
          onboarding_expiry: expiryDate.toISOString(),
          modulos_acesso: scope.modulos
        })
      ];
      
      sheet.appendRow(row);
      
      // Log de auditoria
      this._logAudit(
        currentUser.usuario.email, 
        'ONBOARD_USER', 
        'usuarios', 
        `Onboarding de ${userData.email} com role ${userData.role}`
      );
      
      // Prepara dados de boas-vindas
      const welcomeData = {
        nome: userData.nome || userData.email.split('@')[0],
        email: userData.email,
        role_nome: this.ROLES[userData.role].nome,
        role_descricao: this.ROLES[userData.role].descricao,
        modulos_acesso: scope.modulos.filter(m => m !== '*'),
        cor_role: this.ROLES[userData.role].cor,
        criado_por: currentUser.usuario.nome || currentUser.usuario.email
      };
      
      return {
        success: true,
        user_id: userId,
        email: userData.email,
        role: userData.role,
        onboarding_status: this.ONBOARDING_CONFIG.STATUS.PENDING,
        onboarding_expiry: expiryDate.toISOString(),
        dias_para_expirar: this.ONBOARDING_CONFIG.INVITE_EXPIRY_DAYS,
        scope: scope,
        welcome_data: welcomeData
      };
    } catch (error) {
      Logger.log(`[onboardUser] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém status do onboarding de um usuário
   * @param {string} email - Email do usuário
   * @returns {object} Status do onboarding
   */
  getOnboardingStatus: function(email) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          const status = data[i][4];
          let metadata = {};
          
          try {
            metadata = JSON.parse(data[i][8] || '{}');
          } catch (e) {
            metadata = { observacoes: data[i][8] };
          }
          
          const expiryDate = metadata.onboarding_expiry ? new Date(metadata.onboarding_expiry) : null;
          const now = new Date();
          const isExpired = expiryDate && now > expiryDate && status === this.ONBOARDING_CONFIG.STATUS.PENDING;
          
          // Atualiza status se expirou
          if (isExpired) {
            sheet.getRange(i + 1, 5).setValue(this.ONBOARDING_CONFIG.STATUS.EXPIRED);
          }
          
          const diasRestantes = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;
          
          return {
            success: true,
            email: email,
            nome: data[i][2],
            role: data[i][3],
            status: isExpired ? this.ONBOARDING_CONFIG.STATUS.EXPIRED : status,
            data_criacao: data[i][5],
            ultimo_acesso: data[i][6],
            onboarding_expiry: metadata.onboarding_expiry || null,
            dias_restantes: diasRestantes > 0 ? diasRestantes : 0,
            expirado: isExpired || diasRestantes <= 0
          };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      Logger.log(`[getOnboardingStatus] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reenvia convite de onboarding
   * @param {string} email - Email do usuário
   * @returns {object} Resultado da operação
   */
  resendOnboardingInvite: function(email) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRole = this.ROLES[currentUser.usuario.role];
      if (!currentRole || currentRole.nivel < 80) {
        return { success: false, error: 'Sem permissão para reenviar convites' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          const status = data[i][4];
          
          // Só pode reenviar para pendentes ou expirados
          if (status !== this.ONBOARDING_CONFIG.STATUS.PENDING && 
              status !== this.ONBOARDING_CONFIG.STATUS.EXPIRED) {
            return { success: false, error: `Não é possível reenviar convite para usuário com status '${status}'` };
          }
          
          // Gera novo token e expiração
          const newToken = this._generateOnboardingToken();
          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + this.ONBOARDING_CONFIG.INVITE_EXPIRY_DAYS);
          
          // Atualiza metadata
          let metadata = {};
          try {
            metadata = JSON.parse(data[i][8] || '{}');
          } catch (e) {
            metadata = { observacoes: data[i][8] };
          }
          
          metadata.onboarding_token = newToken;
          metadata.onboarding_expiry = newExpiry.toISOString();
          metadata.reenvios = (metadata.reenvios || 0) + 1;
          metadata.ultimo_reenvio = new Date().toISOString();
          
          // Atualiza planilha
          sheet.getRange(i + 1, 5).setValue(this.ONBOARDING_CONFIG.STATUS.PENDING);
          sheet.getRange(i + 1, 9).setValue(JSON.stringify(metadata));
          
          // Log de auditoria
          this._logAudit(
            currentUser.usuario.email,
            'RESEND_INVITE',
            'usuarios',
            `Reenviou convite para ${email}`
          );
          
          return {
            success: true,
            email: email,
            new_expiry: newExpiry.toISOString(),
            dias_para_expirar: this.ONBOARDING_CONFIG.INVITE_EXPIRY_DAYS,
            reenvios_total: metadata.reenvios
          };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      Logger.log(`[resendOnboardingInvite] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Completa o processo de onboarding
   * @param {string} email - Email do usuário
   * @param {string} token - Token de ativação
   * @returns {object} Resultado da ativação
   */
  completeOnboarding: function(email, token) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          const status = data[i][4];
          
          if (status === this.ONBOARDING_CONFIG.STATUS.ACTIVE) {
            return { success: false, error: 'Usuário já está ativo' };
          }
          
          let metadata = {};
          try {
            metadata = JSON.parse(data[i][8] || '{}');
          } catch (e) {
            return { success: false, error: 'Dados de onboarding inválidos' };
          }
          
          // Verifica token
          if (metadata.onboarding_token !== token) {
            return { success: false, error: 'Token de ativação inválido' };
          }
          
          // Verifica expiração
          const expiryDate = new Date(metadata.onboarding_expiry);
          if (new Date() > expiryDate) {
            sheet.getRange(i + 1, 5).setValue(this.ONBOARDING_CONFIG.STATUS.EXPIRED);
            return { success: false, error: 'Token expirado. Solicite um novo convite.' };
          }
          
          // Ativa usuário
          sheet.getRange(i + 1, 5).setValue(this.ONBOARDING_CONFIG.STATUS.ACTIVE);
          sheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // ultimo_acesso
          
          // Limpa token
          delete metadata.onboarding_token;
          metadata.ativado_em = new Date().toISOString();
          sheet.getRange(i + 1, 9).setValue(JSON.stringify(metadata));
          
          // Log de auditoria
          this._logAudit(email, 'COMPLETE_ONBOARDING', 'usuarios', `Onboarding completado para ${email}`);
          
          return {
            success: true,
            email: email,
            nome: data[i][2],
            role: data[i][3],
            status: this.ONBOARDING_CONFIG.STATUS.ACTIVE,
            ativado_em: new Date().toISOString()
          };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      Logger.log(`[completeOnboarding] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera dados de boas-vindas para um usuário
   * @param {string} userId - ID do usuário
   * @returns {object} Dados para email de boas-vindas
   */
  generateWelcomeData: function(userId) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
          const role = data[i][3];
          const roleInfo = this.ROLES[role] || {};
          const scopeInfo = this.ROLE_SCOPE_MAP[role] || {};
          
          return {
            success: true,
            welcome_data: {
              user_id: userId,
              nome: data[i][2],
              email: data[i][1],
              role: role,
              role_nome: roleInfo.nome || role,
              role_descricao: roleInfo.descricao || '',
              role_cor: roleInfo.cor || '#607D8B',
              modulos_acesso: (scopeInfo.modulos || []).filter(m => m !== '*'),
              descricao_acesso: scopeInfo.descricao_acesso || '',
              data_criacao: data[i][5],
              criado_por: data[i][7],
              reserva_nome: 'Reserva Recanto das Araras de Terra Ronca',
              reserva_local: 'São Domingos - Goiás'
            }
          };
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      Logger.log(`[generateWelcomeData] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gera relatório de onboarding
   * @returns {object} Relatório completo
   */
  getOnboardingReport: function() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser.success) return currentUser;
      
      const currentRole = this.ROLES[currentUser.usuario.role];
      if (!currentRole || currentRole.nivel < 80) {
        return { success: false, error: 'Sem permissão para visualizar relatório de onboarding' };
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_USUARIOS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return {
          success: true,
          relatorio: {
            timestamp: new Date().toISOString(),
            resumo: { total_usuarios: 0, pendentes: 0, ativos: 0, expirados: 0 },
            pendentes: [],
            expirados: [],
            ultimos_onboardings: []
          }
        };
      }
      
      const data = sheet.getDataRange().getValues().slice(1);
      const now = new Date();
      
      const pendentes = [];
      const expirados = [];
      const ultimos = [];
      let totalAtivos = 0;
      let totalPendentes = 0;
      let totalExpirados = 0;
      
      data.forEach(row => {
        const status = row[4];
        let metadata = {};
        
        try {
          metadata = JSON.parse(row[8] || '{}');
        } catch (e) {
          metadata = {};
        }
        
        const expiryDate = metadata.onboarding_expiry ? new Date(metadata.onboarding_expiry) : null;
        const isExpired = expiryDate && now > expiryDate && status === this.ONBOARDING_CONFIG.STATUS.PENDING;
        
        if (status === this.ONBOARDING_CONFIG.STATUS.ACTIVE) {
          totalAtivos++;
        } else if (status === this.ONBOARDING_CONFIG.STATUS.EXPIRED || isExpired) {
          totalExpirados++;
          expirados.push({
            email: row[1],
            nome: row[2],
            role: row[3],
            expirou_em: metadata.onboarding_expiry || 'N/A',
            criado_por: row[7]
          });
        } else if (status === this.ONBOARDING_CONFIG.STATUS.PENDING) {
          totalPendentes++;
          const diasRestantes = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
          pendentes.push({
            email: row[1],
            nome: row[2],
            role: row[3],
            dias_restantes: Math.max(0, diasRestantes),
            expira_em: metadata.onboarding_expiry || 'N/A',
            criado_por: row[7]
          });
        }
        
        // Últimos onboardings (últimos 30 dias)
        const dataCriacao = new Date(row[5]);
        const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        if (dataCriacao >= trintaDiasAtras) {
          ultimos.push({
            email: row[1],
            nome: row[2],
            role: row[3],
            status: isExpired ? this.ONBOARDING_CONFIG.STATUS.EXPIRED : status,
            data: row[5],
            criado_por: row[7]
          });
        }
      });
      
      // Ordena
      pendentes.sort((a, b) => a.dias_restantes - b.dias_restantes);
      ultimos.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return {
        success: true,
        relatorio: {
          timestamp: new Date().toISOString(),
          resumo: {
            total_usuarios: data.length,
            pendentes: totalPendentes,
            ativos: totalAtivos,
            expirados: totalExpirados,
            taxa_conversao: data.length > 0 ? Math.round((totalAtivos / data.length) * 100) : 0
          },
          pendentes: pendentes.slice(0, 20),
          expirados: expirados.slice(0, 20),
          ultimos_onboardings: ultimos.slice(0, 20)
        }
      };
    } catch (error) {
      Logger.log(`[getOnboardingReport] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY AUDIT FUNCTIONS - Prompt 2/43
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Recupera logs de auditoria para análise
   * @param {number} limit - Número máximo de logs a recuperar (max 1000)
   * @returns {object} Logs recuperados
   * @private
   */
  _retrieveAuditLogs: function(limit = 1000) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_AUDIT);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, logs: [], count: 0 };
      }
      
      const effectiveLimit = Math.min(limit, 1000);
      const data = sheet.getDataRange().getValues();
      const logs = [];
      
      // Pega os últimos 'limit' registros
      const startRow = Math.max(1, data.length - effectiveLimit);
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        logs.push({
          id: row[0] || '',
          data_hora: row[1] || '',
          usuario: row[2] || '',
          acao: row[3] || '',
          recurso: row[4] || '',
          detalhes: row[5] || '',
          ip: row[6] || '',
          status: row[7] || 'SUCESSO',
          role: row[8] || 'Desconhecido'
        });
      }
      
      return { 
        success: true, 
        logs: logs, 
        count: logs.length,
        periodo: {
          inicio: logs.length > 0 ? logs[0].data_hora : null,
          fim: logs.length > 0 ? logs[logs.length - 1].data_hora : null
        }
      };
    } catch (error) {
      Logger.log(`[_retrieveAuditLogs] Erro: ${error}`);
      return { success: false, logs: [], count: 0, error: error.message };
    }
  },

  /**
   * Detecta tentativas de acesso não autorizado
   * @param {Array} logs - Lista de logs de auditoria
   * @returns {object} Análise de acessos não autorizados
   * @private
   */
  _detectUnauthorizedAccess: function(logs) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const failedAttempts = [];
    const userFailures = {};
    const sensitiveAttempts = [];
    
    logs.forEach(log => {
      // Identifica falhas e negações
      if (log.status === 'FALHA' || log.status === 'NEGADO') {
        failedAttempts.push(log);
        
        // Conta falhas por usuário nas últimas 24h
        const logDate = new Date(log.data_hora);
        if (logDate >= oneDayAgo) {
          if (!userFailures[log.usuario]) {
            userFailures[log.usuario] = { count: 0, attempts: [] };
          }
          userFailures[log.usuario].count++;
          userFailures[log.usuario].attempts.push(log);
        }
      }
      
      // Identifica tentativas em recursos sensíveis
      const recursoAcao = `${log.acao}:${log.recurso}`.toLowerCase();
      const isSensitive = this.SENSITIVE_RESOURCES.some(sr => 
        recursoAcao.includes(sr.toLowerCase()) || 
        log.recurso === sr ||
        log.acao === sr
      );
      
      if (isSensitive && (log.status === 'FALHA' || log.status === 'NEGADO')) {
        sensitiveAttempts.push({
          usuario: log.usuario,
          recurso: log.recurso,
          acao: log.acao,
          role_usuario: log.role,
          data_hora: log.data_hora,
          status: log.status
        });
      }
    });
    
    // Identifica usuários suspeitos
    const usuariosSuspeitos = [];
    Object.entries(userFailures).forEach(([email, data]) => {
      if (data.count > this.SECURITY_THRESHOLDS.MAX_FAILED_ATTEMPTS_24H) {
        usuariosSuspeitos.push({
          email: email,
          tentativas_falhas_24h: data.count,
          ultima_tentativa: data.attempts[data.attempts.length - 1]?.data_hora,
          nivel_suspeita: data.count > 10 ? 'ALTO' : (data.count > 7 ? 'MEDIO' : 'BAIXO')
        });
      }
    });
    
    // Ordena por data decrescente
    failedAttempts.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    
    return {
      total: failedAttempts.length,
      usuarios_suspeitos: usuariosSuspeitos,
      tentativas_recursos_sensiveis: sensitiveAttempts,
      ultimas_falhas: failedAttempts.slice(0, 50)
    };
  },

  /**
   * Detecta padrões de escalonamento de privilégios
   * @param {Array} logs - Lista de logs de auditoria
   * @param {Array} users - Lista de usuários
   * @returns {object} Análise de escalonamento
   * @private
   */
  _detectPrivilegeEscalation: function(logs, users) {
    const escalonamentosRapidos = [];
    const escalonamentosIrregulares = [];
    const usuariosRisco = [];
    
    // Filtra logs de alteração de role
    const roleChanges = logs.filter(log => 
      log.acao === 'UPDATE_ROLE' || log.acao === 'CREATE_USER'
    );
    
    // Agrupa alterações por usuário
    const changesByUser = {};
    roleChanges.forEach(log => {
      // Extrai email do usuário afetado dos detalhes
      const match = log.detalhes.match(/(?:usuário|role de)\s+(\S+@\S+)/i);
      const targetEmail = match ? match[1] : null;
      
      if (targetEmail) {
        if (!changesByUser[targetEmail]) {
          changesByUser[targetEmail] = [];
        }
        changesByUser[targetEmail].push(log);
      }
    });
    
    // Detecta escalonamentos rápidos
    Object.entries(changesByUser).forEach(([email, changes]) => {
      changes.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      
      for (let i = 1; i < changes.length; i++) {
        const prev = new Date(changes[i - 1].data_hora);
        const curr = new Date(changes[i].data_hora);
        const diffHours = (curr - prev) / (1000 * 60 * 60);
        
        if (diffHours < this.SECURITY_THRESHOLDS.RAPID_ROLE_CHANGE_HOURS) {
          escalonamentosRapidos.push({
            usuario: email,
            alteracao_anterior: changes[i - 1].detalhes,
            alteracao_atual: changes[i].detalhes,
            intervalo_horas: Math.round(diffHours * 10) / 10,
            alterado_por: changes[i].usuario
          });
        }
      }
    });
    
    // Verifica escalonamentos irregulares (role superior ao criador)
    users.forEach(user => {
      if (user.criado_por && this.ROLES[user.role]) {
        const criador = users.find(u => u.email === user.criado_por);
        if (criador && this.ROLES[criador.role]) {
          const nivelUsuario = this.ROLES[user.role].nivel;
          const nivelCriador = this.ROLES[criador.role].nivel;
          
          if (nivelUsuario > nivelCriador) {
            escalonamentosIrregulares.push({
              usuario: user.email,
              role_usuario: user.role,
              nivel_usuario: nivelUsuario,
              criado_por: criador.email,
              role_criador: criador.role,
              nivel_criador: nivelCriador
            });
          }
        }
      }
    });
    
    // Calcula pontuação de risco por usuário
    users.forEach(user => {
      let risco = 0;
      const fatores = [];
      
      // Fator: alterações rápidas
      const rapidChanges = escalonamentosRapidos.filter(e => e.usuario === user.email);
      if (rapidChanges.length > 0) {
        risco += 30;
        fatores.push(`${rapidChanges.length} alteração(ões) rápida(s) de role`);
      }
      
      // Fator: escalonamento irregular
      const irregular = escalonamentosIrregulares.find(e => e.usuario === user.email);
      if (irregular) {
        risco += 40;
        fatores.push('Role superior ao do criador');
      }
      
      // Fator: role de alto nível
      if (this.ROLES[user.role] && this.ROLES[user.role].nivel >= 80) {
        risco += 10;
        fatores.push('Role de alto privilégio');
      }
      
      if (risco > 0) {
        usuariosRisco.push({
          email: user.email,
          role: user.role,
          pontuacao_risco: Math.min(100, risco),
          fatores: fatores
        });
      }
    });
    
    usuariosRisco.sort((a, b) => b.pontuacao_risco - a.pontuacao_risco);
    
    return {
      total: escalonamentosRapidos.length + escalonamentosIrregulares.length,
      escalonamentos_rapidos: escalonamentosRapidos,
      escalonamentos_irregulares: escalonamentosIrregulares,
      usuarios_risco: usuariosRisco
    };
  },

  /**
   * Valida consistência das atribuições de role
   * @param {Array} users - Lista de usuários
   * @returns {object} Inconsistências encontradas
   * @private
   */
  _validateRoleConsistency: function(users) {
    const rolesInvalidos = [];
    const permissionCreep = [];
    
    users.forEach(user => {
      // Verifica se role existe
      if (!user.role || !this.ROLES[user.role]) {
        rolesInvalidos.push({
          usuario: user.email,
          role_atual: user.role || 'undefined',
          mensagem: `Role '${user.role}' não existe nas definições de ROLES`
        });
      }
    });
    
    return {
      total: rolesInvalidos.length + permissionCreep.length,
      roles_invalidos: rolesInvalidos,
      permission_creep: permissionCreep
    };
  },

  /**
   * Analisa padrões de comportamento dos usuários
   * @param {Array} logs - Lista de logs de auditoria
   * @param {Array} users - Lista de usuários
   * @returns {object} Análise de comportamento
   * @private
   */
  _analyzePatternBehavior: function(logs, users) {
    const now = new Date();
    const atividadeAnomala = [];
    const horariosAtipicos = [];
    const usuariosInativos = [];
    
    // Calcula frequência de acessos por usuário
    const accessByUser = {};
    logs.forEach(log => {
      if (!accessByUser[log.usuario]) {
        accessByUser[log.usuario] = { total: 0, last7days: 0, dates: [] };
      }
      accessByUser[log.usuario].total++;
      accessByUser[log.usuario].dates.push(new Date(log.data_hora));
      
      const logDate = new Date(log.data_hora);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (logDate >= sevenDaysAgo) {
        accessByUser[log.usuario].last7days++;
      }
    });
    
    // Detecta atividade anômala
    Object.entries(accessByUser).forEach(([email, data]) => {
      const avgDaily = data.total / 30; // Média diária aproximada
      const recentDaily = data.last7days / 7;
      
      if (recentDaily > avgDaily * this.SECURITY_THRESHOLDS.ANOMALY_FREQUENCY_MULTIPLIER && avgDaily > 0) {
        atividadeAnomala.push({
          usuario: email,
          media_historica: Math.round(avgDaily * 10) / 10,
          media_recente: Math.round(recentDaily * 10) / 10,
          multiplicador: Math.round((recentDaily / avgDaily) * 10) / 10
        });
      }
    });
    
    // Detecta horários atípicos
    logs.forEach(log => {
      const logDate = new Date(log.data_hora);
      const hour = logDate.getHours();
      
      if (hour >= this.SECURITY_THRESHOLDS.ATYPICAL_HOUR_START && 
          hour < this.SECURITY_THRESHOLDS.ATYPICAL_HOUR_END) {
        horariosAtipicos.push({
          usuario: log.usuario,
          data_hora: log.data_hora,
          hora: hour,
          acao: log.acao,
          recurso: log.recurso
        });
      }
    });
    
    // Detecta usuários inativos
    const inactiveThreshold = new Date(now.getTime() - this.SECURITY_THRESHOLDS.INACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000);
    
    users.forEach(user => {
      if (user.status === 'Ativo') {
        const lastAccess = user.ultimo_acesso ? new Date(user.ultimo_acesso) : null;
        
        if (!lastAccess || lastAccess < inactiveThreshold) {
          const diasInativo = lastAccess 
            ? Math.floor((now - lastAccess) / (1000 * 60 * 60 * 24))
            : 'Nunca acessou';
          
          usuariosInativos.push({
            usuario: user.email,
            role: user.role,
            ultimo_acesso: user.ultimo_acesso || 'Nunca',
            dias_inativo: diasInativo,
            status: user.status
          });
        }
      }
    });
    
    return {
      total: atividadeAnomala.length + horariosAtipicos.length + usuariosInativos.length,
      atividade_anomala: atividadeAnomala,
      horarios_atipicos: horariosAtipicos.slice(0, 50),
      usuarios_inativos: usuariosInativos
    };
  },

  /**
   * Calcula pontuação de segurança
   * @param {object} findings - Descobertas da auditoria
   * @returns {number} Pontuação de 0-100
   * @private
   */
  _calculateSecurityScore: function(findings) {
    let score = 100;
    
    // Penalidades por acessos não autorizados
    if (findings.acessos_nao_autorizados) {
      score -= Math.min(20, findings.acessos_nao_autorizados.usuarios_suspeitos.length * 10);
      score -= Math.min(15, findings.acessos_nao_autorizados.tentativas_recursos_sensiveis.length * 5);
    }
    
    // Penalidades por escalonamentos
    if (findings.escalonamentos) {
      score -= Math.min(20, findings.escalonamentos.escalonamentos_rapidos.length * 10);
      score -= Math.min(15, findings.escalonamentos.escalonamentos_irregulares.length * 15);
    }
    
    // Penalidades por inconsistências
    if (findings.inconsistencias_roles) {
      score -= Math.min(15, findings.inconsistencias_roles.roles_invalidos.length * 5);
    }
    
    // Penalidades por anomalias
    if (findings.anomalias_comportamento) {
      score -= Math.min(10, findings.anomalias_comportamento.atividade_anomala.length * 5);
      score -= Math.min(5, findings.anomalias_comportamento.usuarios_inativos.length * 1);
    }
    
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Gera recomendações baseadas nas descobertas
   * @param {object} findings - Descobertas da auditoria
   * @returns {Array} Lista de recomendações
   * @private
   */
  _generateRecommendations: function(findings) {
    const recomendacoes = [];
    
    // Recomendações para acessos não autorizados
    if (findings.acessos_nao_autorizados?.usuarios_suspeitos?.length > 0) {
      recomendacoes.push({
        tipo: 'CRITICO',
        categoria: 'Acesso',
        descricao: `${findings.acessos_nao_autorizados.usuarios_suspeitos.length} usuário(s) com múltiplas tentativas de acesso falhas`,
        acao_sugerida: 'Investigar imediatamente e considerar bloqueio temporário das contas suspeitas'
      });
    }
    
    if (findings.acessos_nao_autorizados?.tentativas_recursos_sensiveis?.length > 0) {
      recomendacoes.push({
        tipo: 'ALTO',
        categoria: 'Segurança',
        descricao: `${findings.acessos_nao_autorizados.tentativas_recursos_sensiveis.length} tentativa(s) de acesso a recursos sensíveis`,
        acao_sugerida: 'Revisar logs detalhados e verificar se há comprometimento de credenciais'
      });
    }
    
    // Recomendações para escalonamentos
    if (findings.escalonamentos?.escalonamentos_irregulares?.length > 0) {
      recomendacoes.push({
        tipo: 'ALTO',
        categoria: 'Privilégios',
        descricao: `${findings.escalonamentos.escalonamentos_irregulares.length} usuário(s) com role superior ao do criador`,
        acao_sugerida: 'Revisar e corrigir atribuições de role irregulares'
      });
    }
    
    if (findings.escalonamentos?.escalonamentos_rapidos?.length > 0) {
      recomendacoes.push({
        tipo: 'MEDIO',
        categoria: 'Privilégios',
        descricao: `${findings.escalonamentos.escalonamentos_rapidos.length} alteração(ões) rápida(s) de role detectada(s)`,
        acao_sugerida: 'Verificar se alterações foram autorizadas e documentadas'
      });
    }
    
    // Recomendações para inconsistências
    if (findings.inconsistencias_roles?.roles_invalidos?.length > 0) {
      recomendacoes.push({
        tipo: 'ALTO',
        categoria: 'Configuração',
        descricao: `${findings.inconsistencias_roles.roles_invalidos.length} usuário(s) com role inválido`,
        acao_sugerida: 'Corrigir atribuições de role para valores válidos definidos em ROLES'
      });
    }
    
    // Recomendações para anomalias
    if (findings.anomalias_comportamento?.usuarios_inativos?.length > 0) {
      recomendacoes.push({
        tipo: 'BAIXO',
        categoria: 'Manutenção',
        descricao: `${findings.anomalias_comportamento.usuarios_inativos.length} usuário(s) ativo(s) sem acesso há mais de 90 dias`,
        acao_sugerida: 'Considerar desativação de contas inativas para reduzir superfície de ataque'
      });
    }
    
    if (findings.anomalias_comportamento?.atividade_anomala?.length > 0) {
      recomendacoes.push({
        tipo: 'MEDIO',
        categoria: 'Comportamento',
        descricao: `${findings.anomalias_comportamento.atividade_anomala.length} usuário(s) com atividade anormalmente alta`,
        acao_sugerida: 'Verificar se atividade é legítima ou indica uso automatizado/comprometimento'
      });
    }
    
    // Se não há problemas
    if (recomendacoes.length === 0) {
      recomendacoes.push({
        tipo: 'INFO',
        categoria: 'Geral',
        descricao: 'Nenhuma anomalia significativa detectada',
        acao_sugerida: 'Manter monitoramento contínuo e executar auditorias periódicas'
      });
    }
    
    return recomendacoes;
  },

  /**
   * Executa auditoria completa de segurança
   * @param {number} limit - Número máximo de logs a analisar (max 1000)
   * @returns {object} Relatório completo de auditoria
   */
  runSecurityAudit: function(limit = 1000) {
    try {
      const startTime = Date.now();
      
      // 1. Recupera logs
      const logsResult = this._retrieveAuditLogs(limit);
      if (!logsResult.success) {
        return { success: false, error: logsResult.error };
      }
      
      // 2. Recupera usuários
      const usersResult = this.listUsers();
      const users = usersResult.users || [];
      
      // 3. Executa análises
      const acessosNaoAutorizados = this._detectUnauthorizedAccess(logsResult.logs);
      const escalonamentos = this._detectPrivilegeEscalation(logsResult.logs, users);
      const inconsistenciasRoles = this._validateRoleConsistency(users);
      const anomaliasComportamento = this._analyzePatternBehavior(logsResult.logs, users);
      
      // 4. Monta findings
      const findings = {
        acessos_nao_autorizados: acessosNaoAutorizados,
        escalonamentos: escalonamentos,
        inconsistencias_roles: inconsistenciasRoles,
        anomalias_comportamento: anomaliasComportamento
      };
      
      // 5. Calcula pontuação
      const pontuacao = this._calculateSecurityScore(findings);
      
      // 6. Determina status
      let status = 'SEGURO';
      if (pontuacao < 50) {
        status = 'CRITICO';
      } else if (pontuacao < 80) {
        status = 'ATENCAO';
      }
      
      // 7. Gera recomendações
      const recomendacoes = this._generateRecommendations(findings);
      
      // 8. Monta relatório final
      const processingTime = Date.now() - startTime;
      
      const auditoria = {
        timestamp: new Date().toISOString(),
        status_seguranca: status,
        pontuacao_seguranca: pontuacao,
        
        resumo: {
          total_logs_analisados: logsResult.count,
          periodo_analise: logsResult.periodo,
          usuarios_analisados: users.length,
          total_anomalias: acessosNaoAutorizados.total + escalonamentos.total + 
                          inconsistenciasRoles.total + anomaliasComportamento.total,
          tempo_processamento_ms: processingTime
        },
        
        acessos_nao_autorizados: acessosNaoAutorizados,
        escalonamentos: escalonamentos,
        inconsistencias_roles: inconsistenciasRoles,
        anomalias_comportamento: anomaliasComportamento,
        
        recomendacoes: recomendacoes
      };
      
      // Log da auditoria
      this._logAudit(
        Session.getActiveUser().getEmail() || 'Sistema',
        'SECURITY_AUDIT',
        'sistema',
        `Auditoria de segurança executada. Score: ${pontuacao}, Status: ${status}`
      );
      
      return { success: true, auditoria: auditoria };
    } catch (error) {
      Logger.log(`[runSecurityAudit] Erro: ${error}`);
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - RBAC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema RBAC
 */
function apiRBACInit() {
  return RBAC.initializeSheets();
}

/**
 * Obtém usuário atual
 */
function apiRBACUsuarioAtual() {
  return RBAC.getCurrentUser();
}

/**
 * Verifica permissão
 */
function apiRBACVerificarPermissao(permission) {
  const user = RBAC.getCurrentUser();
  if (!user.success) return { success: false, has_permission: false };
  return { 
    success: true, 
    has_permission: RBAC.checkPermission(user.usuario.email, permission) 
  };
}

/**
 * Registra usuário
 */
function apiRBACRegistrarUsuario(userData) {
  return RBAC.registerUser(userData);
}

/**
 * Atualiza role de usuário
 */
function apiRBACAtualizarRole(email, newRole) {
  return RBAC.updateUserRole(email, newRole);
}

/**
 * Desativa usuário
 */
function apiRBACDesativarUsuario(email) {
  return RBAC.deactivateUser(email);
}

/**
 * Lista usuários
 */
function apiRBACListarUsuarios() {
  return RBAC.listUsers();
}

/**
 * Lista roles
 */
function apiRBACListarRoles() {
  return RBAC.listRoles();
}

/**
 * Obtém log de auditoria
 */
function apiRBACAuditLog(limit) {
  return RBAC.getAuditLog(limit || 100);
}

/**
 * Registra acesso
 */
function apiRBACLogAccess(recurso, acao, detalhes) {
  return RBAC.logAccess(recurso, acao, detalhes);
}

/**
 * Obtém estatísticas
 */
function apiRBACEstatisticas() {
  return RBAC.getStatistics();
}

/**
 * Executa auditoria de segurança
 * @param {number} limit - Número máximo de logs a analisar (max 1000)
 */
function apiRBACSecurityAudit(limit) {
  return RBAC.runSecurityAudit(limit || 1000);
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS - RBAC Security Audit
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Função de teste manual para auditoria de segurança
 * Execute esta função no editor do Apps Script para validar a implementação
 */
function testSecurityAudit() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('TESTE DE AUDITORIA DE SEGURANÇA RBAC - Prompt 2/43');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  try {
    // 1. Inicializa planilhas se necessário
    Logger.log('\n[1] Inicializando planilhas RBAC...');
    const initResult = RBAC.initializeSheets();
    Logger.log(`    Resultado: ${initResult.success ? 'OK' : 'ERRO - ' + initResult.error}`);
    
    // 2. Executa auditoria
    Logger.log('\n[2] Executando auditoria de segurança...');
    const startTime = Date.now();
    const result = RBAC.runSecurityAudit(500);
    const elapsed = Date.now() - startTime;
    
    if (!result.success) {
      Logger.log(`    ERRO: ${result.error}`);
      return result;
    }
    
    const audit = result.auditoria;
    
    // 3. Exibe resumo
    Logger.log('\n[3] RESUMO DA AUDITORIA:');
    Logger.log(`    Status: ${audit.status_seguranca}`);
    Logger.log(`    Pontuação: ${audit.pontuacao_seguranca}/100`);
    Logger.log(`    Logs analisados: ${audit.resumo.total_logs_analisados}`);
    Logger.log(`    Usuários analisados: ${audit.resumo.usuarios_analisados}`);
    Logger.log(`    Total de anomalias: ${audit.resumo.total_anomalias}`);
    Logger.log(`    Tempo de processamento: ${elapsed}ms`);
    
    // 4. Detalhes por categoria
    Logger.log('\n[4] DETALHES POR CATEGORIA:');
    
    Logger.log(`\n    4.1 Acessos Não Autorizados:`);
    Logger.log(`        - Total de falhas: ${audit.acessos_nao_autorizados.total}`);
    Logger.log(`        - Usuários suspeitos: ${audit.acessos_nao_autorizados.usuarios_suspeitos.length}`);
    Logger.log(`        - Tentativas em recursos sensíveis: ${audit.acessos_nao_autorizados.tentativas_recursos_sensiveis.length}`);
    
    Logger.log(`\n    4.2 Escalonamento de Privilégios:`);
    Logger.log(`        - Total: ${audit.escalonamentos.total}`);
    Logger.log(`        - Escalonamentos rápidos: ${audit.escalonamentos.escalonamentos_rapidos.length}`);
    Logger.log(`        - Escalonamentos irregulares: ${audit.escalonamentos.escalonamentos_irregulares.length}`);
    Logger.log(`        - Usuários em risco: ${audit.escalonamentos.usuarios_risco.length}`);
    
    Logger.log(`\n    4.3 Inconsistências de Roles:`);
    Logger.log(`        - Total: ${audit.inconsistencias_roles.total}`);
    Logger.log(`        - Roles inválidos: ${audit.inconsistencias_roles.roles_invalidos.length}`);
    
    Logger.log(`\n    4.4 Anomalias de Comportamento:`);
    Logger.log(`        - Total: ${audit.anomalias_comportamento.total}`);
    Logger.log(`        - Atividade anômala: ${audit.anomalias_comportamento.atividade_anomala.length}`);
    Logger.log(`        - Horários atípicos: ${audit.anomalias_comportamento.horarios_atipicos.length}`);
    Logger.log(`        - Usuários inativos: ${audit.anomalias_comportamento.usuarios_inativos.length}`);
    
    // 5. Recomendações
    Logger.log('\n[5] RECOMENDAÇÕES:');
    audit.recomendacoes.forEach((rec, i) => {
      Logger.log(`\n    ${i + 1}. [${rec.tipo}] ${rec.categoria}`);
      Logger.log(`       ${rec.descricao}`);
      Logger.log(`       Ação: ${rec.acao_sugerida}`);
    });
    
    // 6. Validação de campos obrigatórios
    Logger.log('\n[6] VALIDAÇÃO DE CAMPOS:');
    const camposObrigatorios = [
      'timestamp', 'status_seguranca', 'pontuacao_seguranca', 'resumo',
      'acessos_nao_autorizados', 'escalonamentos', 'inconsistencias_roles',
      'anomalias_comportamento', 'recomendacoes'
    ];
    
    let todosPresentes = true;
    camposObrigatorios.forEach(campo => {
      const presente = audit.hasOwnProperty(campo);
      if (!presente) todosPresentes = false;
      Logger.log(`    ${campo}: ${presente ? '✓' : '✗'}`);
    });
    
    Logger.log('\n═══════════════════════════════════════════════════════════════');
    Logger.log(`RESULTADO FINAL: ${todosPresentes ? 'TODOS OS CAMPOS PRESENTES ✓' : 'CAMPOS FALTANDO ✗'}`);
    Logger.log('═══════════════════════════════════════════════════════════════');
    
    return result;
  } catch (error) {
    Logger.log(`\nERRO CRÍTICO: ${error.message}`);
    Logger.log(error.stack);
    return { success: false, error: error.message };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - User Onboarding (Prompt 6/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * API: Realiza onboarding de novo usuário
 * @param {object} userData - Dados do usuário
 */
function apiRBACOnboardUser(userData) {
  return RBAC.onboardUser(userData);
}

/**
 * API: Obtém status do onboarding
 * @param {string} email - Email do usuário
 */
function apiRBACGetOnboardingStatus(email) {
  return RBAC.getOnboardingStatus(email);
}

/**
 * API: Reenvia convite de onboarding
 * @param {string} email - Email do usuário
 */
function apiRBACResendInvite(email) {
  return RBAC.resendOnboardingInvite(email);
}

/**
 * API: Completa o onboarding
 * @param {string} email - Email do usuário
 * @param {string} token - Token de ativação
 */
function apiRBACCompleteOnboarding(email, token) {
  return RBAC.completeOnboarding(email, token);
}

/**
 * API: Obtém detalhes do escopo de um role
 * @param {string} role - Nome do role
 */
function apiRBACGetRoleScope(role) {
  return RBAC.getRoleScopeDetails(role);
}

/**
 * API: Obtém relatório de onboarding
 */
function apiRBACOnboardingReport() {
  return RBAC.getOnboardingReport();
}

/**
 * API: Gera dados de boas-vindas
 * @param {string} userId - ID do usuário
 */
function apiRBACWelcomeData(userId) {
  return RBAC.generateWelcomeData(userId);
}


// ═══════════════════════════════════════════════════════════════════════════
// TEST FUNCTION - User Onboarding (Prompt 6/43)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Testa todas as funções de onboarding de usuários
 * Execute: testUserOnboarding()
 */
function testUserOnboarding() {
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log('👤 TESTE: User Onboarding e Role Assignment (Prompt 6/43)');
  Logger.log('═══════════════════════════════════════════════════════════════');
  
  const resultados = {
    total: 0,
    sucesso: 0,
    falha: 0,
    testes: []
  };
  
  // Teste 1: Estrutura ROLE_SCOPE_MAP
  Logger.log('\n📋 Teste 1: Verificando estrutura ROLE_SCOPE_MAP...');
  resultados.total++;
  try {
    const scopeMap = RBAC.ROLE_SCOPE_MAP;
    const rolesEsperados = ['Admin', 'Gestor', 'Pesquisador', 'Monitor', 'Trilheiro', 'Voluntario', 'Visitante'];
    const rolesPresentes = Object.keys(scopeMap);
    
    const todosPresentes = rolesEsperados.every(r => rolesPresentes.includes(r));
    
    if (todosPresentes) {
      Logger.log('   ✅ ROLE_SCOPE_MAP configurado corretamente');
      Logger.log(`   📊 Roles mapeados: ${rolesPresentes.length}`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'ROLE_SCOPE_MAP', status: 'OK' });
    } else {
      throw new Error('Roles faltando no mapeamento');
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'ROLE_SCOPE_MAP', status: 'FALHA', erro: e.message });
  }
  
  // Teste 2: Estrutura ONBOARDING_CONFIG
  Logger.log('\n📋 Teste 2: Verificando estrutura ONBOARDING_CONFIG...');
  resultados.total++;
  try {
    const config = RBAC.ONBOARDING_CONFIG;
    
    if (config.INVITE_EXPIRY_DAYS && config.TOKEN_LENGTH && config.STATUS) {
      Logger.log('   ✅ ONBOARDING_CONFIG configurado corretamente');
      Logger.log(`   📊 Expiração: ${config.INVITE_EXPIRY_DAYS} dias`);
      Logger.log(`   📊 Token length: ${config.TOKEN_LENGTH}`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'ONBOARDING_CONFIG', status: 'OK' });
    } else {
      throw new Error('Configuração incompleta');
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'ONBOARDING_CONFIG', status: 'FALHA', erro: e.message });
  }
  
  // Teste 3: Role Trilheiro
  Logger.log('\n📋 Teste 3: Verificando role Trilheiro...');
  resultados.total++;
  try {
    const trilheiro = RBAC.ROLES.Trilheiro;
    
    if (trilheiro && trilheiro.nome && trilheiro.nivel === 30) {
      Logger.log('   ✅ Role Trilheiro configurado corretamente');
      Logger.log(`   📊 Nome: ${trilheiro.nome}`);
      Logger.log(`   📊 Nível: ${trilheiro.nivel}`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'Role Trilheiro', status: 'OK' });
    } else {
      throw new Error('Role Trilheiro não configurado corretamente');
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'Role Trilheiro', status: 'FALHA', erro: e.message });
  }
  
  // Teste 4: getRoleScopeDetails
  Logger.log('\n📋 Teste 4: Testando getRoleScopeDetails()...');
  resultados.total++;
  try {
    const result = RBAC.getRoleScopeDetails('Trilheiro');
    
    if (result.success && result.scope && result.scope.modulos) {
      Logger.log('   ✅ getRoleScopeDetails executou com sucesso');
      Logger.log(`   📊 Role: ${result.role}`);
      Logger.log(`   📊 Módulos: ${result.scope.modulos.join(', ')}`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'getRoleScopeDetails', status: 'OK' });
    } else {
      throw new Error(result.error || 'Resultado inválido');
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'getRoleScopeDetails', status: 'FALHA', erro: e.message });
  }
  
  // Teste 5: getOnboardingReport
  Logger.log('\n📋 Teste 5: Testando getOnboardingReport()...');
  resultados.total++;
  try {
    const result = RBAC.getOnboardingReport();
    
    if (result.success && result.relatorio) {
      Logger.log('   ✅ getOnboardingReport executou com sucesso');
      Logger.log(`   📊 Total usuários: ${result.relatorio.resumo.total_usuarios}`);
      Logger.log(`   📊 Pendentes: ${result.relatorio.resumo.pendentes}`);
      Logger.log(`   📊 Ativos: ${result.relatorio.resumo.ativos}`);
      Logger.log(`   📊 Taxa conversão: ${result.relatorio.resumo.taxa_conversao}%`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'getOnboardingReport', status: 'OK' });
    } else {
      throw new Error(result.error || 'Resultado inválido');
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'getOnboardingReport', status: 'FALHA', erro: e.message });
  }
  
  // Teste 6: API Functions
  Logger.log('\n📋 Teste 6: Verificando API Functions...');
  resultados.total++;
  try {
    const apiFunctions = [
      'apiRBACOnboardUser',
      'apiRBACGetOnboardingStatus',
      'apiRBACResendInvite',
      'apiRBACCompleteOnboarding',
      'apiRBACGetRoleScope',
      'apiRBACOnboardingReport',
      'apiRBACWelcomeData'
    ];
    
    const funcionando = apiFunctions.filter(fn => typeof globalThis[fn] === 'function');
    
    if (funcionando.length === apiFunctions.length) {
      Logger.log('   ✅ Todas as API functions estão disponíveis');
      Logger.log(`   📊 Functions: ${funcionando.length}`);
      resultados.sucesso++;
      resultados.testes.push({ nome: 'API Functions', status: 'OK' });
    } else {
      const faltando = apiFunctions.filter(fn => !funcionando.includes(fn));
      throw new Error(`Functions faltando: ${faltando.join(', ')}`);
    }
  } catch (e) {
    Logger.log(`   ❌ Erro: ${e.message}`);
    resultados.falha++;
    resultados.testes.push({ nome: 'API Functions', status: 'FALHA', erro: e.message });
  }
  
  // Resumo final
  Logger.log('\n═══════════════════════════════════════════════════════════════');
  Logger.log('📊 RESUMO DOS TESTES');
  Logger.log('═══════════════════════════════════════════════════════════════');
  Logger.log(`   Total de testes: ${resultados.total}`);
  Logger.log(`   ✅ Sucesso: ${resultados.sucesso}`);
  Logger.log(`   ❌ Falha: ${resultados.falha}`);
  Logger.log(`   📈 Taxa de sucesso: ${Math.round((resultados.sucesso / resultados.total) * 100)}%`);
  
  if (resultados.falha === 0) {
    Logger.log('\n🎉 TODOS OS TESTES PASSARAM! Prompt 6/43 implementado com sucesso.');
  } else {
    Logger.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.');
  }
  
  return resultados;
}
