/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - SISTEMA DE VALIDAÇÃO DE FORMULÁRIOS PADRONIZADO
 * ═══════════════════════════════════════════════════════════════════════════
 * P39 - Unified Form Validation System
 * 
 * Features:
 * - Server-side validation rules
 * - Form inventory and audit
 * - Validation statistics
 * - Error tracking
 * - Schema definitions
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const VALIDATION_LOG_HEADERS = [
  'ID', 'Formulario', 'Campo', 'Regra', 'Valor', 'Valido', 
  'Mensagem_Erro', 'Usuario', 'Data_Hora'
];

/**
 * Sistema de Validação de Formulários
 * @namespace FormValidation
 */
const FormValidation = {
  
  SHEET_NAME: 'VALIDACAO_LOG_RA',
  
  /**
   * Regras de validação disponíveis
   */
  RULES: {
    required: {
      nome: 'Obrigatório',
      validate: (value) => value !== null && value !== undefined && String(value).trim() !== '',
      mensagem: 'Este campo é obrigatório'
    },
    email: {
      nome: 'Email',
      validate: (value) => ValidationService.isValidEmail(value),
      mensagem: 'Digite um email válido'
    },
    gps_lat: {
      nome: 'Latitude GPS',
      validate: (value) => !value || ValidationService.isWithinRange(value, -90, 90),
      mensagem: 'Latitude deve estar entre -90 e 90'
    },
    gps_lng: {
      nome: 'Longitude GPS',
      validate: (value) => !value || ValidationService.isWithinRange(value, -180, 180),
      mensagem: 'Longitude deve estar entre -180 e 180'
    },
    date: {
      nome: 'Data',
      validate: (value) => !value || ValidationService.isValidDate(value),
      mensagem: 'Digite uma data válida'
    },
    date_past: {
      nome: 'Data Passada',
      validate: (value) => !value || (ValidationService.isValidDate(value) && new Date(value) <= new Date()),
      mensagem: 'A data deve ser no passado ou hoje'
    },
    date_future: {
      nome: 'Data Futura',
      validate: (value) => !value || (ValidationService.isValidDate(value) && new Date(value) >= new Date()),
      mensagem: 'A data deve ser no futuro ou hoje'
    },
    number: {
      nome: 'Número',
      validate: (value) => ValidationService.isValidNumber(value),
      mensagem: 'Digite um número válido'
    },
    positive: {
      nome: 'Número Positivo',
      validate: (value) => ValidationService.isValidNumber(value, true),
      mensagem: 'O valor deve ser positivo'
    },
    integer: {
      nome: 'Número Inteiro',
      validate: (value) => !value || Number.isInteger(parseFloat(value)),
      mensagem: 'Digite um número inteiro'
    },
    min: {
      nome: 'Valor Mínimo',
      validate: (value, param) => !value || parseFloat(value) >= param,
      mensagem: (param) => `O valor mínimo é ${param}`
    },
    max: {
      nome: 'Valor Máximo',
      validate: (value, param) => !value || parseFloat(value) <= param,
      mensagem: (param) => `O valor máximo é ${param}`
    },
    minLength: {
      nome: 'Tamanho Mínimo',
      validate: (value, param) => ValidationService.isValidText(value, param),
      mensagem: (param) => `Mínimo de ${param} caracteres`
    },
    maxLength: {
      nome: 'Tamanho Máximo',
      validate: (value, param) => !value || String(value).length <= param,
      mensagem: (param) => `Máximo de ${param} caracteres`
    },
    pattern: {
      nome: 'Padrão',
      validate: (value, param) => !value || new RegExp(param).test(value),
      mensagem: 'Formato inválido'
    },
    scientific_name: {
      nome: 'Nome Científico',
      validate: (value) => ValidationService.isValidScientificName(value),
      mensagem: 'Use formato: Gênero espécie (ex: Panthera onca)'
    },
    phone_br: {
      nome: 'Telefone BR',
      validate: (value) => ValidationService.isValidPhoneBR(value),
      mensagem: 'Digite um telefone válido'
    },
    cpf: {
      nome: 'CPF',
      validate: (value) => ValidationService.isValidCPF(value),
      mensagem: 'Digite um CPF válido'
    },
    url: {
      nome: 'URL',
      validate: (value) => !value || /^https?:\/\/.+/.test(value),
      mensagem: 'Digite uma URL válida (https://...)'
    },
    ph: {
      nome: 'pH',
      validate: (value) => !value || ValidationService.isWithinRange(value, 0, 14),
      mensagem: 'pH deve estar entre 0 e 14'
    },
    temperature: {
      nome: 'Temperatura',
      validate: (value) => !value || ValidationService.isWithinRange(value, -50, 60),
      mensagem: 'Temperatura deve estar entre -50°C e 60°C'
    },
    percentage: {
      nome: 'Porcentagem',
      validate: (value) => !value || ValidationService.isWithinRange(value, 0, 100),
      mensagem: 'Porcentagem deve estar entre 0 e 100'
    }
  },

  /**
   * Inventário de formulários do sistema
   */
  FORMS_INVENTORY: [
    { id: 'agua-form', arquivo: 'AguaForm.html', campos: 9, categoria: 'Monitoramento' },
    { id: 'benthic-form', arquivo: 'BenthicForm.html', campos: 13, categoria: 'Limnologia' },
    { id: 'biodiversidadeform', arquivo: 'BiodiversidadeForm.html', campos: 6, categoria: 'Biodiversidade' },
    { id: 'foto-form', arquivo: 'FotoForm.html', campos: 7, categoria: 'Mídia' },
    { id: 'observations-form', arquivo: 'GeneralObservationsForm.html', campos: 7, categoria: 'Observações' },
    { id: 'ichthyofauna-form', arquivo: 'IchthyofaunaForm.html', campos: 5, categoria: 'Limnologia' },
    { id: 'limnology-form', arquivo: 'LimnologyForm.html', campos: 13, categoria: 'Limnologia' },
    { id: 'macrophytes-form', arquivo: 'MacrophytesForm.html', campos: 11, categoria: 'Limnologia' },
    { id: 'physicochemical-form', arquivo: 'PhysicochemicalForm.html', campos: 16, categoria: 'Monitoramento' },
    { id: 'phytoplankton-form', arquivo: 'PhytoplanktonForm.html', campos: 9, categoria: 'Limnologia' },
    { id: 'producaoform', arquivo: 'ProducaoForm.html', campos: 4, categoria: 'Agrofloresta' },
    { id: 'soloform', arquivo: 'SoloForm.html', campos: 8, categoria: 'Monitoramento' },
    { id: 'terapiaform', arquivo: 'TerapiaForm.html', campos: 4, categoria: 'Terapia' },
    { id: 'visitanteform', arquivo: 'VisitanteForm.html', campos: 8, categoria: 'Ecoturismo' },
    { id: 'waypoint-form', arquivo: 'WaypointForm.html', campos: 5, categoria: 'GPS' },
    { id: 'zooplankton-form', arquivo: 'ZooplanktonForm.html', campos: 10, categoria: 'Limnologia' }
  ],

  /**
   * Schemas de validação por formulário
   */
  SCHEMAS: {
    'biodiversidadeform': {
      especie: ['required', 'minLength:3'],
      nome_cientifico: ['scientific_name'],
      latitude: ['required', 'gps_lat'],
      longitude: ['required', 'gps_lng'],
      data_observacao: ['required', 'date', 'date_past'],
      quantidade: ['positive', 'integer']
    },
    'agua-form': {
      ponto_coleta: ['required'],
      data_coleta: ['required', 'date'],
      ph: ['required', 'ph'],
      temperatura: ['temperature'],
      oxigenio_dissolvido: ['number', 'positive'],
      turbidez: ['number', 'positive'],
      condutividade: ['number', 'positive']
    },
    'soloform': {
      ponto_coleta: ['required'],
      data_coleta: ['required', 'date'],
      ph: ['required', 'ph'],
      umidade: ['percentage'],
      materia_organica: ['percentage'],
      nitrogenio: ['number', 'positive'],
      fosforo: ['number', 'positive'],
      potassio: ['number', 'positive']
    },
    'waypoint-form': {
      nome: ['required', 'minLength:3', 'maxLength:50'],
      latitude: ['required', 'gps_lat'],
      longitude: ['required', 'gps_lng'],
      altitude: ['number'],
      descricao: ['maxLength:500']
    },
    'visitanteform': {
      nome: ['required', 'minLength:3'],
      email: ['required', 'email'],
      telefone: ['phone_br'],
      data_visita: ['required', 'date'],
      num_pessoas: ['required', 'positive', 'integer', 'max:50']
    }
  },

  /**
   * Inicializa planilha de log
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      let sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_NAME);
        sheet.appendRow(VALIDATION_LOG_HEADERS);
        
        const headerRange = sheet.getRange(1, 1, 1, VALIDATION_LOG_HEADERS.length);
        headerRange.setBackground('#E91E63');
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
   * Valida um campo individual
   */
  validateField: function(value, rules) {
    const errors = [];
    
    rules.forEach(rule => {
      let ruleName = rule;
      let param = null;
      
      // Extrai parâmetro se existir (ex: min:5)
      if (rule.includes(':')) {
        [ruleName, param] = rule.split(':');
        param = parseFloat(param) || param;
      }
      
      const ruleConfig = this.RULES[ruleName];
      if (!ruleConfig) return;
      
      const isValid = ruleConfig.validate(value, param);
      
      if (!isValid) {
        const mensagem = typeof ruleConfig.mensagem === 'function' 
          ? ruleConfig.mensagem(param) 
          : ruleConfig.mensagem;
        errors.push({ regra: ruleName, mensagem });
      }
    });
    
    return {
      valido: errors.length === 0,
      erros: errors
    };
  },

  /**
   * Valida formulário completo
   */
  validateForm: function(formId, dados, usuario) {
    try {
      const schema = this.SCHEMAS[formId];
      if (!schema) {
        return { 
          success: true, 
          valido: true, 
          mensagem: 'Schema não definido, validação ignorada' 
        };
      }
      
      const resultados = {};
      let formValido = true;
      const errosTotal = [];
      
      Object.entries(schema).forEach(([campo, rules]) => {
        const valor = dados[campo];
        const resultado = this.validateField(valor, rules);
        
        resultados[campo] = resultado;
        
        if (!resultado.valido) {
          formValido = false;
          resultado.erros.forEach(erro => {
            errosTotal.push({ campo, ...erro });
            
            // Log de validação
            this._logValidation(formId, campo, erro.regra, valor, false, erro.mensagem, usuario);
          });
        }
      });
      
      return {
        success: true,
        valido: formValido,
        resultados,
        erros: errosTotal,
        total_campos: Object.keys(schema).length,
        campos_invalidos: errosTotal.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Registra log de validação
   */
  _logValidation: function(formId, campo, regra, valor, valido, mensagem, usuario) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      const id = `VAL-${Date.now().toString(36).toUpperCase()}`;
      
      sheet.appendRow([
        id,
        formId,
        campo,
        regra,
        String(valor).substring(0, 100),
        valido ? 'SIM' : 'NAO',
        mensagem || '',
        usuario || 'sistema',
        new Date().toISOString()
      ]);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém inventário de formulários
   */
  getFormsInventory: function() {
    const totalCampos = this.FORMS_INVENTORY.reduce((sum, f) => sum + f.campos, 0);
    const comSchema = this.FORMS_INVENTORY.filter(f => this.SCHEMAS[f.id]).length;
    
    // Agrupa por categoria
    const porCategoria = {};
    this.FORMS_INVENTORY.forEach(f => {
      if (!porCategoria[f.categoria]) {
        porCategoria[f.categoria] = { forms: [], campos: 0 };
      }
      porCategoria[f.categoria].forms.push(f);
      porCategoria[f.categoria].campos += f.campos;
    });
    
    return {
      success: true,
      inventario: {
        total_formularios: this.FORMS_INVENTORY.length,
        total_campos: totalCampos,
        com_schema: comSchema,
        cobertura_schema: Math.round((comSchema / this.FORMS_INVENTORY.length) * 100),
        por_categoria: porCategoria,
        formularios: this.FORMS_INVENTORY.map(f => ({
          ...f,
          tem_schema: !!this.SCHEMAS[f.id],
          regras: this.SCHEMAS[f.id] ? Object.keys(this.SCHEMAS[f.id]).length : 0
        }))
      }
    };
  },

  /**
   * Obtém regras disponíveis
   */
  getRules: function() {
    return {
      success: true,
      regras: Object.entries(this.RULES).map(([key, rule]) => ({
        codigo: key,
        nome: rule.nome,
        mensagem: typeof rule.mensagem === 'function' ? rule.mensagem('X') : rule.mensagem
      })),
      total: Object.keys(this.RULES).length
    };
  },

  /**
   * Obtém schema de um formulário
   */
  getFormSchema: function(formId) {
    const schema = this.SCHEMAS[formId];
    
    if (!schema) {
      return { success: false, error: 'Schema não encontrado para este formulário' };
    }
    
    return {
      success: true,
      form_id: formId,
      schema: Object.entries(schema).map(([campo, rules]) => ({
        campo,
        regras: rules,
        regras_detalhes: rules.map(r => {
          const [nome] = r.split(':');
          return this.RULES[nome]?.nome || nome;
        })
      })),
      total_campos: Object.keys(schema).length
    };
  },

  /**
   * Obtém estatísticas de validação
   */
  getStatistics: function() {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_NAME);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { 
          success: true, 
          stats: { 
            total_validacoes: 0,
            taxa_sucesso: 100,
            por_formulario: {},
            por_regra: {},
            erros_comuns: []
          } 
        };
      }
      
      const data = sheet.getDataRange().getValues().slice(1);
      
      const stats = {
        total_validacoes: data.length,
        validacoes_ok: data.filter(r => r[5] === 'SIM').length,
        validacoes_erro: data.filter(r => r[5] === 'NAO').length,
        por_formulario: {},
        por_regra: {},
        erros_comuns: []
      };
      
      stats.taxa_sucesso = stats.total_validacoes > 0 
        ? Math.round((stats.validacoes_ok / stats.total_validacoes) * 100) 
        : 100;
      
      // Por formulário
      data.forEach(row => {
        const form = row[1];
        if (!stats.por_formulario[form]) {
          stats.por_formulario[form] = { total: 0, erros: 0 };
        }
        stats.por_formulario[form].total++;
        if (row[5] === 'NAO') stats.por_formulario[form].erros++;
      });
      
      // Por regra
      data.filter(r => r[5] === 'NAO').forEach(row => {
        const regra = row[3];
        stats.por_regra[regra] = (stats.por_regra[regra] || 0) + 1;
      });
      
      // Erros mais comuns
      stats.erros_comuns = Object.entries(stats.por_regra)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([regra, count]) => ({ regra, count }));
      
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Validação de Formulários
// ═══════════════════════════════════════════════════════════════════════════

function apiValidacaoInit() {
  return FormValidation.initializeSheet();
}

function apiValidacaoCampo(valor, regras) {
  return FormValidation.validateField(valor, regras);
}

function apiValidacaoFormulario(formId, dados, usuario) {
  return FormValidation.validateForm(formId, dados, usuario);
}

function apiValidacaoInventario() {
  return FormValidation.getFormsInventory();
}

function apiValidacaoRegras() {
  return FormValidation.getRules();
}

function apiValidacaoSchema(formId) {
  return FormValidation.getFormSchema(formId);
}

function apiValidacaoEstatisticas() {
  return FormValidation.getStatistics();
}
