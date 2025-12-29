/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVA ARARAS - DETECÇÃO DE DOENÇAS EM PLANTAS COM IA
 * ═══════════════════════════════════════════════════════════════════════════
 * P26 - Sistema de Detecção de Doenças e Pragas usando Gemini Vision
 * 
 * Funcionalidades:
 * - Detecção automática de doenças via análise de imagem
 * - Identificação de pragas
 * - Recomendações de tratamento
 * - Alertas de surtos
 * - Integração com P01 (biodiversidade)
 * 
 * @version 1.0.0
 * @date 2025-12-26
 */

const DOENCAS_HEADERS = [
  'ID_Diagnostico', 'Data', 'Especie_Planta', 'Doenca_Detectada', 'Confianca',
  'Severidade', 'Parte_Afetada', 'Latitude', 'Longitude', 'Tratamento_Recomendado',
  'Status', 'Foto_ID', 'Observador', 'Notas'
];

/**
 * Sistema de Detecção de Doenças em Plantas
 * @namespace PlantDiseaseDetection
 */
const PlantDiseaseDetection = {
  
  SHEET_DOENCAS: 'DOENCAS_PLANTAS_RA',
  
  /**
   * Catálogo de doenças comuns no Cerrado
   */
  DOENCAS_CATALOGO: {
    'Ferrugem': {
      sintomas: ['pústulas alaranjadas', 'manchas amarelas', 'desfolha precoce'],
      agente: 'Fungos (Puccinia spp., Uromyces spp.)',
      severidade_tipica: 'Media',
      tratamento: ['Fungicidas cúpricos', 'Remoção de folhas afetadas', 'Melhorar circulação de ar'],
      prevencao: ['Evitar molhamento foliar', 'Espaçamento adequado', 'Variedades resistentes']
    },
    'Antracnose': {
      sintomas: ['manchas escuras deprimidas', 'lesões em frutos', 'morte de ponteiros'],
      agente: 'Fungos (Colletotrichum spp.)',
      severidade_tipica: 'Alta',
      tratamento: ['Fungicidas sistêmicos', 'Poda de partes afetadas', 'Calda bordalesa'],
      prevencao: ['Drenagem adequada', 'Evitar ferimentos', 'Rotação de culturas']
    },
    'Oídio': {
      sintomas: ['pó branco nas folhas', 'deformação foliar', 'queda prematura'],
      agente: 'Fungos (Erysiphe spp., Oidium spp.)',
      severidade_tipica: 'Media',
      tratamento: ['Enxofre', 'Bicarbonato de sódio', 'Fungicidas específicos'],
      prevencao: ['Boa ventilação', 'Evitar excesso de nitrogênio', 'Irrigação por gotejamento']
    },
    'Míldio': {
      sintomas: ['manchas amarelas na face superior', 'mofo cinza na face inferior', 'necrose'],
      agente: 'Oomicetos (Peronospora spp., Plasmopara spp.)',
      severidade_tipica: 'Alta',
      tratamento: ['Fungicidas cúpricos', 'Metalaxyl', 'Remoção de plantas doentes'],
      prevencao: ['Evitar alta umidade', 'Espaçamento adequado', 'Drenagem']
    },
    'Manchas Foliares': {
      sintomas: ['manchas circulares', 'halos amarelos', 'coalescência de lesões'],
      agente: 'Diversos fungos e bactérias',
      severidade_tipica: 'Baixa',
      tratamento: ['Fungicidas de contato', 'Remoção de folhas', 'Adubação equilibrada'],
      prevencao: ['Evitar molhamento prolongado', 'Nutrição adequada', 'Limpeza de restos']
    },
    'Podridão Radicular': {
      sintomas: ['murcha', 'amarelecimento', 'raízes escurecidas', 'morte súbita'],
      agente: 'Fungos de solo (Fusarium, Phytophthora, Rhizoctonia)',
      severidade_tipica: 'Alta',
      tratamento: ['Fungicidas de solo', 'Solarização', 'Trichoderma'],
      prevencao: ['Drenagem', 'Evitar encharcamento', 'Substrato tratado']
    }
  },

  /**
   * Catálogo de pragas comuns
   */
  PRAGAS_CATALOGO: {
    'Pulgões': {
      sintomas: ['folhas enroladas', 'melado', 'fumagina', 'deformação'],
      tipo: 'Inseto sugador',
      severidade_tipica: 'Media',
      tratamento: ['Óleo de neem', 'Sabão inseticida', 'Inseticidas sistêmicos'],
      controle_biologico: ['Joaninhas', 'Crisopídeos', 'Vespas parasitoides']
    },
    'Cochonilhas': {
      sintomas: ['escamas nas folhas/caules', 'melado', 'amarelecimento'],
      tipo: 'Inseto sugador',
      severidade_tipica: 'Media',
      tratamento: ['Óleo mineral', 'Remoção manual', 'Inseticidas de contato'],
      controle_biologico: ['Joaninhas', 'Vespas parasitoides']
    },
    'Lagartas': {
      sintomas: ['folhas roídas', 'desfolha', 'excrementos', 'teias'],
      tipo: 'Inseto mastigador',
      severidade_tipica: 'Alta',
      tratamento: ['Bacillus thuringiensis (Bt)', 'Spinosad', 'Catação manual'],
      controle_biologico: ['Vespas', 'Pássaros', 'Trichogramma']
    },
    'Ácaros': {
      sintomas: ['pontuações prateadas', 'teias finas', 'bronzeamento'],
      tipo: 'Aracnídeo',
      severidade_tipica: 'Media',
      tratamento: ['Acaricidas', 'Óleo de neem', 'Enxofre'],
      controle_biologico: ['Ácaros predadores (Phytoseiulus)']
    },
    'Formigas Cortadeiras': {
      sintomas: ['corte de folhas', 'desfolha severa', 'trilhas visíveis'],
      tipo: 'Inseto social',
      severidade_tipica: 'Alta',
      tratamento: ['Iscas granuladas', 'Termonebulização', 'Pó seco'],
      controle_biologico: ['Fungos entomopatogênicos']
    },
    'Broca': {
      sintomas: ['galerias no caule', 'serragem', 'murcha de ramos'],
      tipo: 'Inseto perfurador',
      severidade_tipica: 'Alta',
      tratamento: ['Poda de partes afetadas', 'Inseticidas sistêmicos', 'Pasta bordalesa'],
      controle_biologico: ['Parasitoides', 'Nematoides entomopatogênicos']
    }
  },

  /**
   * Deficiências nutricionais
   */
  DEFICIENCIAS: {
    'Nitrogênio': {
      sintomas: ['amarelecimento geral', 'folhas velhas afetadas primeiro', 'crescimento reduzido'],
      correcao: ['Adubação nitrogenada', 'Ureia', 'Sulfato de amônio', 'Compostagem']
    },
    'Fósforo': {
      sintomas: ['folhas arroxeadas', 'crescimento lento', 'raízes fracas'],
      correcao: ['Superfosfato', 'Fosfato natural', 'Farinha de ossos']
    },
    'Potássio': {
      sintomas: ['bordas das folhas secas', 'manchas marrons', 'frutos pequenos'],
      correcao: ['Cloreto de potássio', 'Sulfato de potássio', 'Cinzas']
    },
    'Ferro': {
      sintomas: ['clorose internerval', 'folhas novas amarelas', 'nervuras verdes'],
      correcao: ['Quelato de ferro', 'Sulfato ferroso', 'Correção de pH']
    },
    'Magnésio': {
      sintomas: ['clorose entre nervuras', 'folhas velhas primeiro', 'queda prematura'],
      correcao: ['Sulfato de magnésio', 'Calcário dolomítico']
    }
  },

  /**
   * Inicializa planilha
   */
  initializeSheet: function() {
    try {
      const ss = getSpreadsheet();
      
      let sheet = ss.getSheetByName(this.SHEET_DOENCAS);
      if (!sheet) {
        sheet = ss.insertSheet(this.SHEET_DOENCAS);
        sheet.appendRow(DOENCAS_HEADERS);
        const headerRange = sheet.getRange(1, 1, 1, DOENCAS_HEADERS.length);
        headerRange.setBackground('#D32F2F');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      
      return { success: true, sheet: this.SHEET_DOENCAS };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Analisa imagem de planta usando Gemini Vision
   */
  analyzeImage: function(imageBase64, plantInfo = {}) {
    try {
      const apiKey = CONFIG.GEMINI_API_KEY;
      if (!apiKey) {
        return this._analyzeWithoutAI(plantInfo);
      }
      
      const prompt = `Você é um fitopatologista especialista em doenças de plantas do Cerrado brasileiro.

Analise esta imagem de planta e identifique:
1. Se há sinais de doença, praga ou deficiência nutricional
2. Qual o diagnóstico mais provável
3. Severidade (Baixa, Media, Alta, Critica)
4. Parte da planta afetada
5. Tratamento recomendado

${plantInfo.especie ? `Espécie informada: ${plantInfo.especie}` : ''}
${plantInfo.sintomas ? `Sintomas relatados: ${plantInfo.sintomas}` : ''}

Responda em JSON:
{
  "diagnostico": {
    "tipo": "doenca|praga|deficiencia|saudavel",
    "nome": "nome do problema ou 'Planta Saudável'",
    "confianca": 0.0-1.0,
    "severidade": "Baixa|Media|Alta|Critica",
    "parte_afetada": "folhas|caule|raiz|fruto|flor"
  },
  "sintomas_observados": ["sintoma1", "sintoma2"],
  "agente_causador": "descrição do agente",
  "tratamento": {
    "imediato": ["ação1", "ação2"],
    "preventivo": ["ação1", "ação2"]
  },
  "observacoes": "notas adicionais"
}`;

      const response = UrlFetchApp.fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64
                  }
                }
              ]
            }],
            generationConfig: { temperature: 0.2 }
          }),
          muteHttpExceptions: true
        }
      );
      
      const result = JSON.parse(response.getContentText());
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extrai JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Enriquece com dados do catálogo
        const enriched = this._enrichDiagnosis(analysis);
        
        return {
          success: true,
          ai_powered: true,
          analysis: enriched
        };
      }
      
      return this._analyzeWithoutAI(plantInfo);
    } catch (error) {
      Logger.log(`[analyzeImage] Erro: ${error}`);
      return this._analyzeWithoutAI(plantInfo);
    }
  },

  /**
   * Análise sem IA (baseada em sintomas informados)
   * @private
   */
  _analyzeWithoutAI: function(plantInfo) {
    const sintomas = (plantInfo.sintomas || '').toLowerCase();
    let diagnostico = null;
    
    // Tenta identificar por sintomas
    for (const [doenca, info] of Object.entries(this.DOENCAS_CATALOGO)) {
      for (const sintoma of info.sintomas) {
        if (sintomas.includes(sintoma.toLowerCase())) {
          diagnostico = {
            tipo: 'doenca',
            nome: doenca,
            confianca: 0.6,
            severidade: info.severidade_tipica,
            parte_afetada: 'folhas'
          };
          break;
        }
      }
      if (diagnostico) break;
    }
    
    if (!diagnostico) {
      for (const [praga, info] of Object.entries(this.PRAGAS_CATALOGO)) {
        for (const sintoma of info.sintomas) {
          if (sintomas.includes(sintoma.toLowerCase())) {
            diagnostico = {
              tipo: 'praga',
              nome: praga,
              confianca: 0.6,
              severidade: info.severidade_tipica,
              parte_afetada: 'folhas'
            };
            break;
          }
        }
        if (diagnostico) break;
      }
    }
    
    if (!diagnostico) {
      diagnostico = {
        tipo: 'indefinido',
        nome: 'Análise manual necessária',
        confianca: 0.3,
        severidade: 'Media',
        parte_afetada: 'indefinido'
      };
    }
    
    return {
      success: true,
      ai_powered: false,
      analysis: this._enrichDiagnosis({ diagnostico }),
      nota: 'Análise baseada em sintomas informados. Para melhor precisão, configure a API Gemini.'
    };
  },

  /**
   * Enriquece diagnóstico com dados do catálogo
   * @private
   */
  _enrichDiagnosis: function(analysis) {
    const diag = analysis.diagnostico;
    let catalogInfo = null;
    
    if (diag.tipo === 'doenca' && this.DOENCAS_CATALOGO[diag.nome]) {
      catalogInfo = this.DOENCAS_CATALOGO[diag.nome];
    } else if (diag.tipo === 'praga' && this.PRAGAS_CATALOGO[diag.nome]) {
      catalogInfo = this.PRAGAS_CATALOGO[diag.nome];
    } else if (diag.tipo === 'deficiencia' && this.DEFICIENCIAS[diag.nome]) {
      catalogInfo = this.DEFICIENCIAS[diag.nome];
    }
    
    return {
      ...analysis,
      catalogo: catalogInfo,
      urgencia: this._calculateUrgency(diag.severidade, diag.confianca)
    };
  },

  /**
   * Calcula urgência de ação
   * @private
   */
  _calculateUrgency: function(severidade, confianca) {
    const severidadeScore = { 'Baixa': 1, 'Media': 2, 'Alta': 3, 'Critica': 4 };
    const score = (severidadeScore[severidade] || 2) * (confianca || 0.5);
    
    if (score >= 3) return { nivel: 'Urgente', cor: '#F44336', acao: 'Ação imediata necessária' };
    if (score >= 2) return { nivel: 'Alto', cor: '#FF9800', acao: 'Tratar em até 3 dias' };
    if (score >= 1) return { nivel: 'Moderado', cor: '#FFC107', acao: 'Monitorar e tratar em 1 semana' };
    return { nivel: 'Baixo', cor: '#4CAF50', acao: 'Monitoramento preventivo' };
  },

  /**
   * Registra diagnóstico
   */
  registerDiagnosis: function(diagData) {
    try {
      this.initializeSheet();
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_DOENCAS);
      
      const diagId = `DIAG-${Date.now().toString(36).toUpperCase()}`;
      
      const row = [
        diagId,
        new Date().toISOString().split('T')[0],
        diagData.especie || '',
        diagData.doenca || '',
        diagData.confianca || 0,
        diagData.severidade || 'Media',
        diagData.parte_afetada || '',
        diagData.latitude || -13.4,
        diagData.longitude || -46.3,
        diagData.tratamento || '',
        'Pendente',
        diagData.foto_id || '',
        diagData.observador || 'Sistema',
        diagData.notas || ''
      ];
      
      sheet.appendRow(row);
      
      // Verifica se deve gerar alerta de surto
      const alertaSurto = this._checkOutbreakAlert(diagData.doenca);
      
      return { 
        success: true, 
        diagnosis_id: diagId,
        alerta_surto: alertaSurto
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Verifica se há surto (múltiplos casos recentes)
   * @private
   */
  _checkOutbreakAlert: function(doenca) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_DOENCAS);
      
      if (!sheet || sheet.getLastRow() < 2) return null;
      
      const data = sheet.getDataRange().getValues();
      const hoje = new Date();
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      let casosRecentes = 0;
      for (let i = 1; i < data.length; i++) {
        const dataReg = new Date(data[i][1]);
        if (data[i][3] === doenca && dataReg >= seteDiasAtras) {
          casosRecentes++;
        }
      }
      
      if (casosRecentes >= 3) {
        return {
          alerta: true,
          doenca: doenca,
          casos_7_dias: casosRecentes,
          mensagem: `ALERTA DE SURTO: ${casosRecentes} casos de ${doenca} nos últimos 7 dias!`,
          acao_recomendada: 'Inspeção geral da área e tratamento preventivo'
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Lista diagnósticos
   */
  listDiagnoses: function(filters = {}) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_DOENCAS);
      
      if (!sheet || sheet.getLastRow() < 2) {
        return { success: true, diagnoses: [], count: 0 };
      }
      
      const data = sheet.getDataRange().getValues();
      let diagnoses = [];
      
      for (let i = 1; i < data.length; i++) {
        const diag = {
          id: data[i][0],
          data: data[i][1],
          especie: data[i][2],
          doenca: data[i][3],
          confianca: data[i][4],
          severidade: data[i][5],
          parte_afetada: data[i][6],
          status: data[i][10]
        };
        
        // Aplica filtros
        if (filters.status && diag.status !== filters.status) continue;
        if (filters.severidade && diag.severidade !== filters.severidade) continue;
        
        diagnoses.push(diag);
      }
      
      // Ordena por data (mais recente primeiro)
      diagnoses.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return { success: true, diagnoses: diagnoses, count: diagnoses.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém estatísticas de doenças
   */
  getStatistics: function() {
    try {
      const diagResult = this.listDiagnoses();
      if (!diagResult.success) return diagResult;
      
      const diagnoses = diagResult.diagnoses;
      
      // Contagem por doença
      const porDoenca = {};
      const porSeveridade = { Baixa: 0, Media: 0, Alta: 0, Critica: 0 };
      const porStatus = { Pendente: 0, 'Em Tratamento': 0, Resolvido: 0 };
      
      diagnoses.forEach(d => {
        porDoenca[d.doenca] = (porDoenca[d.doenca] || 0) + 1;
        if (porSeveridade[d.severidade] !== undefined) porSeveridade[d.severidade]++;
        if (porStatus[d.status] !== undefined) porStatus[d.status]++;
      });
      
      // Top 5 doenças
      const topDoencas = Object.entries(porDoenca)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nome, count]) => ({ nome, count }));
      
      // Casos últimos 30 dias
      const hoje = new Date();
      const trintaDias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      const casosRecentes = diagnoses.filter(d => new Date(d.data) >= trintaDias).length;
      
      return {
        success: true,
        total_diagnosticos: diagnoses.length,
        casos_30_dias: casosRecentes,
        por_severidade: porSeveridade,
        por_status: porStatus,
        top_doencas: topDoencas,
        taxa_resolucao: diagnoses.length > 0 
          ? Math.round(porStatus.Resolvido / diagnoses.length * 100) 
          : 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualiza status de diagnóstico
   */
  updateStatus: function(diagId, novoStatus) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(this.SHEET_DOENCAS);
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === diagId) {
          sheet.getRange(i + 1, 11).setValue(novoStatus);
          return { success: true, diagnosis_id: diagId, novo_status: novoStatus };
        }
      }
      
      return { success: false, error: 'Diagnóstico não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtém catálogo de doenças
   */
  getCatalog: function() {
    return {
      success: true,
      doencas: Object.entries(this.DOENCAS_CATALOGO).map(([nome, info]) => ({
        nome,
        ...info
      })),
      pragas: Object.entries(this.PRAGAS_CATALOGO).map(([nome, info]) => ({
        nome,
        ...info
      })),
      deficiencias: Object.entries(this.DEFICIENCIAS).map(([nome, info]) => ({
        nome,
        ...info
      }))
    };
  },

  /**
   * Busca tratamento para doença específica
   */
  getTreatment: function(nomeProblema) {
    try {
      // Busca em doenças
      if (this.DOENCAS_CATALOGO[nomeProblema]) {
        const info = this.DOENCAS_CATALOGO[nomeProblema];
        return {
          success: true,
          tipo: 'doenca',
          nome: nomeProblema,
          agente: info.agente,
          tratamento: info.tratamento,
          prevencao: info.prevencao
        };
      }
      
      // Busca em pragas
      if (this.PRAGAS_CATALOGO[nomeProblema]) {
        const info = this.PRAGAS_CATALOGO[nomeProblema];
        return {
          success: true,
          tipo: 'praga',
          nome: nomeProblema,
          tipo_praga: info.tipo,
          tratamento: info.tratamento,
          controle_biologico: info.controle_biologico
        };
      }
      
      // Busca em deficiências
      if (this.DEFICIENCIAS[nomeProblema]) {
        const info = this.DEFICIENCIAS[nomeProblema];
        return {
          success: true,
          tipo: 'deficiencia',
          nome: nomeProblema,
          sintomas: info.sintomas,
          correcao: info.correcao
        };
      }
      
      return { success: false, error: 'Problema não encontrado no catálogo' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Detecção de Doenças em Plantas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inicializa sistema de detecção de doenças
 */
function apiDoencasInit() {
  return PlantDiseaseDetection.initializeSheet();
}

/**
 * Analisa imagem de planta
 */
function apiDoencasAnalisar(imageBase64, plantInfo) {
  return PlantDiseaseDetection.analyzeImage(imageBase64, plantInfo || {});
}

/**
 * Registra diagnóstico
 */
function apiDoencasRegistrar(diagData) {
  return PlantDiseaseDetection.registerDiagnosis(diagData);
}

/**
 * Lista diagnósticos
 */
function apiDoencasListar(filters) {
  return PlantDiseaseDetection.listDiagnoses(filters || {});
}

/**
 * Obtém estatísticas
 */
function apiDoencasEstatisticas() {
  return PlantDiseaseDetection.getStatistics();
}

/**
 * Atualiza status de diagnóstico
 */
function apiDoencasAtualizarStatus(diagId, novoStatus) {
  return PlantDiseaseDetection.updateStatus(diagId, novoStatus);
}

/**
 * Obtém catálogo de doenças e pragas
 */
function apiDoencasCatalogo() {
  return PlantDiseaseDetection.getCatalog();
}

/**
 * Busca tratamento específico
 */
function apiDoencasTratamento(nomeProblema) {
  return PlantDiseaseDetection.getTreatment(nomeProblema);
}

/**
 * Análise rápida por sintomas (sem imagem)
 */
function apiDoencasAnalisarSintomas(sintomas, especie) {
  return PlantDiseaseDetection.analyzeImage(null, { 
    sintomas: sintomas, 
    especie: especie 
  });
}
