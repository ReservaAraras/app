/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEMA REGISTRY - Triangulação Backend ↔ Frontend ↔ Planilhas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 1/3: Sistema centralizado de schemas que garante:
 * - Consistência entre estrutura das planilhas e código
 * - Validação automática de dados
 * - Geração de dados sintéticos baseados em estudos científicos
 * - Documentação automática de campos
 * 
 * Referências Científicas:
 * - CONAMA 357/2005 (Qualidade da Água)
 * - EMBRAPA (Solos do Cerrado)
 * - ICMBio (Biodiversidade)
 * - IPCC AR6 (Carbono)
 * - OMS (Terapias na Natureza)
 * 
 * @version 1.0.0
 * @date 2025-12-27
 */

const SchemaRegistry = {

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * SCHEMAS DE DADOS - Fonte única de verdade
   * ═══════════════════════════════════════════════════════════════════════
   */
  
  SCHEMAS: {
    
    // ─────────────────────────────────────────────────────────────────────
    // QUALIDADE DA ÁGUA - Baseado em CONAMA 357/2005
    // ─────────────────────────────────────────────────────────────────────
    QUALIDADE_AGUA: {
      sheetName: 'QualidadeAgua',
      displayName: 'Qualidade da Água',
      icon: '💧',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true, label: 'Data da Coleta' },
        local: { type: 'string', required: true, label: 'Ponto de Coleta' },
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        pH: { 
          type: 'number', required: true, min: 0, max: 14, 
          label: 'pH',
          reference: 'CONAMA 357/2005: Classe 1 = 6.0-9.0',
          synthetic: { mean: 7.2, std: 0.8, distribution: 'normal' }
        },
        oxigenio_dissolvido: { 
          type: 'number', required: true, min: 0, max: 20, unit: 'mg/L',
          label: 'Oxigênio Dissolvido',
          reference: 'CONAMA: Classe 1 ≥ 6 mg/L',
          synthetic: { mean: 7.5, std: 1.2, distribution: 'normal' }
        },
        turbidez: { 
          type: 'number', required: true, min: 0, max: 1000, unit: 'NTU',
          label: 'Turbidez',
          reference: 'CONAMA: Classe 1 ≤ 40 NTU',
          synthetic: { mean: 15, std: 12, distribution: 'lognormal' }
        },
        temperatura: { 
          type: 'number', required: true, min: 0, max: 45, unit: '°C',
          label: 'Temperatura',
          synthetic: { mean: 24, std: 3, distribution: 'normal' }
        },
        nitrogenio_total: { 
          type: 'number', min: 0, max: 50, unit: 'mg/L',
          label: 'Nitrogênio Total',
          reference: 'CONAMA: Classe 1 ≤ 1.27 mg/L (lêntico)',
          synthetic: { mean: 0.8, std: 0.4, distribution: 'lognormal' }
        },
        fosforo_total: { 
          type: 'number', min: 0, max: 10, unit: 'mg/L',
          label: 'Fósforo Total',
          reference: 'CONAMA: Classe 1 ≤ 0.02 mg/L (lêntico)',
          synthetic: { mean: 0.015, std: 0.008, distribution: 'lognormal' }
        },
        coliformes_termotolerantes: { 
          type: 'number', min: 0, unit: 'NMP/100mL',
          label: 'Coliformes Termotolerantes',
          reference: 'CONAMA: Classe 1 ≤ 200 NMP/100mL',
          synthetic: { mean: 120, std: 80, distribution: 'lognormal' }
        },
        condutividade: { 
          type: 'number', min: 0, unit: 'µS/cm',
          label: 'Condutividade Elétrica',
          synthetic: { mean: 85, std: 25, distribution: 'normal' }
        },
        responsavel: { type: 'string', required: true, label: 'Responsável' },
        observacoes: { type: 'text', label: 'Observações' }
      },
      indexes: ['data', 'local'],
      validators: ['validateWaterQuality']
    },

    // ─────────────────────────────────────────────────────────────────────
    // QUALIDADE DO SOLO - Baseado em EMBRAPA/IAC
    // ─────────────────────────────────────────────────────────────────────
    QUALIDADE_SOLO: {
      sheetName: 'QualidadeSolo',
      displayName: 'Qualidade do Solo',
      icon: '🌱',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true, label: 'Data da Coleta' },
        local: { type: 'string', required: true, label: 'Ponto de Coleta' },
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        pH: { 
          type: 'number', required: true, min: 3, max: 10,
          label: 'pH em CaCl₂',
          reference: 'EMBRAPA: Cerrado típico 4.5-5.5, ideal 5.5-6.5',
          synthetic: { mean: 5.2, std: 0.6, distribution: 'normal' }
        },
        materia_organica: { 
          type: 'number', min: 0, max: 15, unit: '%',
          label: 'Matéria Orgânica',
          reference: 'EMBRAPA: Cerrado 1.5-3.5%, SAF maduro 4-8%',
          synthetic: { mean: 2.8, std: 1.2, distribution: 'normal' }
        },
        fosforo: { 
          type: 'number', min: 0, max: 100, unit: 'mg/dm³',
          label: 'Fósforo (Mehlich-1)',
          reference: 'IAC: Baixo <6, Médio 6-12, Alto >12',
          synthetic: { mean: 4.5, std: 3.2, distribution: 'lognormal' }
        },
        potassio: { 
          type: 'number', min: 0, max: 500, unit: 'mg/dm³',
          label: 'Potássio',
          reference: 'IAC: Baixo <40, Médio 40-80, Alto >80',
          synthetic: { mean: 45, std: 25, distribution: 'lognormal' }
        },
        calcio: { 
          type: 'number', min: 0, max: 20, unit: 'cmolc/dm³',
          label: 'Cálcio',
          synthetic: { mean: 1.2, std: 0.8, distribution: 'lognormal' }
        },
        magnesio: { 
          type: 'number', min: 0, max: 10, unit: 'cmolc/dm³',
          label: 'Magnésio',
          synthetic: { mean: 0.5, std: 0.3, distribution: 'lognormal' }
        },
        aluminio: { 
          type: 'number', min: 0, max: 5, unit: 'cmolc/dm³',
          label: 'Alumínio Trocável',
          reference: 'Cerrado: tipicamente 0.5-2.0 cmolc/dm³',
          synthetic: { mean: 0.8, std: 0.5, distribution: 'lognormal' }
        },
        ctc: { 
          type: 'number', min: 0, max: 30, unit: 'cmolc/dm³',
          label: 'CTC (pH 7.0)',
          synthetic: { mean: 6.5, std: 2.5, distribution: 'normal' }
        },
        saturacao_bases: { 
          type: 'number', min: 0, max: 100, unit: '%',
          label: 'Saturação por Bases (V%)',
          reference: 'Cerrado nativo: 10-30%, SAF: 40-60%',
          synthetic: { mean: 25, std: 15, distribution: 'normal' }
        },
        textura: { 
          type: 'enum', 
          values: ['Arenosa', 'Média', 'Argilosa', 'Muito Argilosa'],
          label: 'Classe Textural'
        },
        profundidade_cm: { type: 'number', min: 0, max: 200, unit: 'cm' },
        responsavel: { type: 'string', required: true },
        observacoes: { type: 'text' }
      },
      indexes: ['data', 'local'],
      validators: ['validateSoilQuality']
    },

    // ─────────────────────────────────────────────────────────────────────
    // BIODIVERSIDADE - Baseado em ICMBio/IBGE
    // ─────────────────────────────────────────────────────────────────────
    BIODIVERSIDADE: {
      sheetName: 'Biodiversidade',
      displayName: 'Biodiversidade',
      icon: '🦋',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true, label: 'Data da Observação' },
        local: { type: 'string', required: true, label: 'Local' },
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        tipo_observacao: { 
          type: 'enum',
          values: ['Visual', 'Auditiva', 'Vestígio', 'Armadilha', 'Camera Trap'],
          required: true
        },
        especie_cientifica: { type: 'string', required: true, label: 'Nome Científico' },
        especie_comum: { type: 'string', label: 'Nome Popular' },
        familia: { type: 'string', label: 'Família' },
        quantidade: { 
          type: 'number', min: 1, default: 1,
          label: 'Quantidade de Indivíduos',
          synthetic: { mean: 3, std: 4, distribution: 'poisson' }
        },
        comportamento: { type: 'text', label: 'Comportamento Observado' },
        habitat: { 
          type: 'enum',
          values: ['Cerrado Típico', 'Cerradão', 'Mata de Galeria', 'Vereda', 'Campo Limpo', 'SAF'],
          label: 'Habitat'
        },
        status_conservacao: { 
          type: 'enum',
          values: ['LC', 'NT', 'VU', 'EN', 'CR', 'DD', 'NE'],
          label: 'Status IUCN',
          reference: 'LC=Pouco Preocupante, VU=Vulnerável, EN=Em Perigo, CR=Criticamente Em Perigo'
        },
        foto_id: { type: 'string', label: 'ID da Foto' },
        observador: { type: 'string', required: true },
        observacoes: { type: 'text' }
      },
      indexes: ['data', 'especie_cientifica', 'local'],
      validators: ['validateBiodiversity']
    },

    // ─────────────────────────────────────────────────────────────────────
    // DADOS CLIMÁTICOS - Baseado em INMET/IPCC
    // ─────────────────────────────────────────────────────────────────────
    DADOS_CLIMA: {
      sheetName: 'DadosClimaticos',
      displayName: 'Dados Climáticos',
      icon: '🌤️',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true },
        temperatura_min: { 
          type: 'number', min: -10, max: 50, unit: '°C',
          label: 'Temperatura Mínima',
          reference: 'Cerrado GO: média anual 18-22°C',
          synthetic: { mean: 18, std: 3, distribution: 'normal' }
        },
        temperatura_max: { 
          type: 'number', min: -10, max: 50, unit: '°C',
          label: 'Temperatura Máxima',
          synthetic: { mean: 32, std: 4, distribution: 'normal' }
        },
        temperatura_media: { 
          type: 'number', min: -10, max: 50, unit: '°C',
          synthetic: { mean: 25, std: 3, distribution: 'normal' }
        },
        umidade: { 
          type: 'number', min: 0, max: 100, unit: '%',
          label: 'Umidade Relativa',
          reference: 'Cerrado: seca 20-40%, chuvas 70-90%',
          synthetic: { mean: 55, std: 20, distribution: 'normal' }
        },
        precipitacao: { 
          type: 'number', min: 0, max: 300, unit: 'mm',
          label: 'Precipitação',
          reference: 'Cerrado GO: 1200-1800mm/ano, concentrada out-mar',
          synthetic: { mean: 4.5, std: 12, distribution: 'exponential' }
        },
        vento_velocidade: { 
          type: 'number', min: 0, max: 150, unit: 'km/h',
          synthetic: { mean: 8, std: 5, distribution: 'lognormal' }
        },
        pressao: { 
          type: 'number', min: 900, max: 1100, unit: 'hPa',
          synthetic: { mean: 1013, std: 5, distribution: 'normal' }
        },
        radiacao_solar: { 
          type: 'number', min: 0, max: 1500, unit: 'W/m²',
          synthetic: { mean: 450, std: 200, distribution: 'normal' }
        },
        estacao: { type: 'string', label: 'Estação Meteorológica' },
        observacoes: { type: 'text' }
      },
      indexes: ['data'],
      validators: ['validateClimate']
    },

    // ─────────────────────────────────────────────────────────────────────
    // SEQUESTRO DE CARBONO - Baseado em IPCC AR6 / EMBRAPA
    // ─────────────────────────────────────────────────────────────────────
    CARBONO: {
      sheetName: 'SequestrosCarbono',
      displayName: 'Sequestro de Carbono',
      icon: '🌳',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true },
        area_id: { type: 'string', required: true },
        area_nome: { type: 'string', required: true },
        tipo_vegetacao: { 
          type: 'enum',
          values: ['Cerrado Típico', 'Cerradão', 'Mata de Galeria', 'SAF Jovem', 'SAF Maduro', 'Reflorestamento'],
          required: true
        },
        biomassa_aerea: { 
          type: 'number', min: 0, max: 500, unit: 'Mg/ha',
          label: 'Biomassa Aérea',
          reference: 'IPCC: Cerrado 20-80 Mg/ha, SAF maduro 80-150 Mg/ha',
          synthetic: { mean: 45, std: 25, distribution: 'lognormal' }
        },
        biomassa_subterranea: { 
          type: 'number', min: 0, max: 200, unit: 'Mg/ha',
          label: 'Biomassa Subterrânea',
          reference: 'Razão raiz/parte aérea Cerrado: 0.4-0.8',
          synthetic: { mean: 22, std: 12, distribution: 'lognormal' }
        },
        area_ha: { type: 'number', required: true, min: 0, unit: 'ha' },
        idade_anos: { type: 'number', min: 0, max: 200, unit: 'anos' },
        carbono_total: { 
          type: 'number', min: 0, unit: 'MgC/ha',
          label: 'Carbono Total',
          reference: 'Fator conversão biomassa→C: 0.47 (IPCC)',
          synthetic: { mean: 32, std: 18, distribution: 'lognormal' }
        },
        co2_equivalente: { 
          type: 'number', min: 0, unit: 'MgCO2e/ha',
          label: 'CO₂ Equivalente',
          reference: 'Fator C→CO2: 3.67',
          synthetic: { mean: 117, std: 66, distribution: 'lognormal' }
        },
        metodologia: { 
          type: 'enum',
          values: ['Alometria', 'Inventário Florestal', 'Sensoriamento Remoto', 'Estimativa'],
          label: 'Metodologia'
        },
        responsavel: { type: 'string', required: true },
        observacoes: { type: 'text' }
      },
      indexes: ['data', 'area_id', 'tipo_vegetacao'],
      validators: ['validateCarbon']
    },

    // ─────────────────────────────────────────────────────────────────────
    // SESSÕES DE TERAPIA - Baseado em OMS/Bratman et al.
    // ─────────────────────────────────────────────────────────────────────
    SESSOES_TERAPIA: {
      sheetName: 'SessoesTerapia',
      displayName: 'Sessões de Terapia',
      icon: '🧘',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        participante_id: { type: 'string', required: true, foreignKey: 'ParticipantesTerapia' },
        data: { type: 'date', required: true },
        hora_inicio: { type: 'time', required: true },
        hora_fim: { type: 'time' },
        duracao_minutos: { 
          type: 'number', min: 15, max: 480, unit: 'min',
          reference: 'OMS: mínimo 120min/semana em natureza',
          synthetic: { mean: 90, std: 30, distribution: 'normal' }
        },
        tipo_terapia: { 
          type: 'enum',
          values: ['Banho de Floresta', 'Meditação', 'Caminhada', 'Yoga', 'Observação', 'Horta', 'Hidroterapia'],
          required: true
        },
        local: { type: 'string', required: true },
        trilha_id: { type: 'string', foreignKey: 'Trilhas' },
        terapeuta: { type: 'string', required: true },
        satisfacao: { 
          type: 'number', min: 1, max: 10,
          label: 'Satisfação (1-10)',
          synthetic: { mean: 8.2, std: 1.2, distribution: 'normal' }
        },
        humor_antes: { 
          type: 'number', min: 1, max: 10,
          label: 'Humor Antes (1-10)',
          reference: 'Bratman et al. 2019: melhoria média 15-25%',
          synthetic: { mean: 5.5, std: 1.8, distribution: 'normal' }
        },
        humor_depois: { 
          type: 'number', min: 1, max: 10,
          label: 'Humor Depois (1-10)',
          synthetic: { mean: 7.8, std: 1.2, distribution: 'normal' }
        },
        observacoes_terapeuta: { type: 'text' },
        observacoes_participante: { type: 'text' }
      },
      indexes: ['data', 'participante_id', 'tipo_terapia'],
      validators: ['validateTherapySession']
    },

    // ─────────────────────────────────────────────────────────────────────
    // PARCELAS AGROFLORESTAIS - Baseado em EMBRAPA/IPCC
    // ─────────────────────────────────────────────────────────────────────
    PARCELAS_AGRO: {
      sheetName: 'ParcelasAgroflorestais',
      displayName: 'Parcelas Agroflorestais',
      icon: '🌳',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        nome: { type: 'string', required: true, minLength: 2, maxLength: 100, label: 'Nome da Parcela' },
        tipo_sistema: { 
          type: 'enum',
          values: ['SAF_Cerrado', 'SAF_Diversa', 'ILPF', 'Silvipastoril', 'Agrossilvipastoril', 'Reflorestamento', 'Restauração'],
          required: true,
          label: 'Tipo de Sistema',
          reference: 'EMBRAPA: Classificação de Sistemas Agroflorestais'
        },
        area_ha: { 
          type: 'number', required: true, min: 0.01, max: 10000, unit: 'ha',
          label: 'Área',
          synthetic: { mean: 5.5, std: 4.2, distribution: 'lognormal' }
        },
        idade_anos: { 
          type: 'number', min: 0, max: 100, unit: 'anos',
          label: 'Idade do Sistema',
          synthetic: { mean: 4, std: 3, distribution: 'lognormal' }
        },
        custo_implantacao: { 
          type: 'number', min: 0, unit: 'R$',
          label: 'Custo de Implantação',
          reference: 'EMBRAPA: R$ 3.000-15.000/ha para SAF',
          synthetic: { mean: 8000, std: 4000, distribution: 'lognormal' }
        },
        custo_manutencao_anual: { 
          type: 'number', min: 0, unit: 'R$/ano',
          label: 'Custo de Manutenção Anual',
          synthetic: { mean: 2500, std: 1200, distribution: 'lognormal' }
        },
        localizacao: { type: 'string', label: 'Localização/Descrição' },
        responsavel: { type: 'string', required: true, label: 'Responsável' },
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        diversidade_especies: { 
          type: 'number', min: 1, max: 200,
          label: 'Número de Espécies',
          synthetic: { mean: 15, std: 8, distribution: 'poisson' }
        },
        coordenadas: { type: 'string', label: 'Coordenadas (texto)' },
        observacoes: { type: 'text', label: 'Observações' },
        status: { 
          type: 'enum',
          values: ['Ativo', 'Em Implantação', 'Inativo', 'Abandonado'],
          default: 'Ativo',
          label: 'Status'
        }
      },
      indexes: ['nome', 'tipo_sistema', 'status'],
      validators: ['validateParcelaAgro']
    },

    // ─────────────────────────────────────────────────────────────────────
    // PRODUÇÃO AGROFLORESTAL - Baseado em EMBRAPA
    // ─────────────────────────────────────────────────────────────────────
    PRODUCAO_AGRO: {
      sheetName: 'ProducaoAgroflorestal',
      displayName: 'Produção Agroflorestal',
      icon: '🥬',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        parcela_id: { type: 'string', required: true, foreignKey: 'ParcelasAgroflorestais', label: 'Parcela' },
        data: { type: 'date', required: true, label: 'Data da Colheita' },
        produto: { type: 'string', required: true, minLength: 2, label: 'Produto' },
        quantidade_kg: { 
          type: 'number', required: true, min: 0, unit: 'kg',
          label: 'Quantidade',
          synthetic: { mean: 150, std: 120, distribution: 'lognormal' }
        },
        valor_reais: { 
          type: 'number', min: 0, unit: 'R$',
          label: 'Valor Total',
          synthetic: { mean: 450, std: 350, distribution: 'lognormal' }
        },
        qualidade: { 
          type: 'enum',
          values: ['Excelente', 'Boa', 'Regular', 'Baixa'],
          label: 'Qualidade'
        },
        destino: { 
          type: 'enum',
          values: ['Venda Direta', 'Feira', 'Cooperativa', 'Agroindústria', 'Consumo Próprio', 'Doação'],
          label: 'Destino'
        },
        observacoes: { type: 'text', label: 'Observações' }
      },
      indexes: ['parcela_id', 'data', 'produto'],
      validators: ['validateProducaoAgro']
    },

    // ─────────────────────────────────────────────────────────────────────
    // ORÇAMENTO AGROFLORESTAL - Gestão Financeira
    // ─────────────────────────────────────────────────────────────────────
    ORCAMENTO_AGRO: {
      sheetName: 'ORCAMENTO_AGRO_RA',
      displayName: 'Orçamento Agroflorestal',
      icon: '💰',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        ano: { type: 'number', required: true, min: 2020, max: 2100, label: 'Ano' },
        Categoria: { 
          type: 'enum',
          values: ['Manutenção', 'Restauração', 'Implantação', 'Monitoramento', 'Reserva'],
          required: true,
          label: 'Categoria'
        },
        Alocado: { 
          type: 'number', required: true, min: 0, unit: 'R$',
          label: 'Valor Alocado',
          synthetic: { mean: 30000, std: 15000, distribution: 'lognormal' }
        },
        Utilizado: { 
          type: 'number', min: 0, unit: 'R$',
          label: 'Valor Utilizado',
          synthetic: { mean: 20000, std: 12000, distribution: 'lognormal' }
        },
        parcela_id: { type: 'string', foreignKey: 'ParcelasAgroflorestais', label: 'Parcela (opcional)' },
        descricao: { type: 'text', label: 'Descrição' },
        responsavel: { type: 'string', label: 'Responsável' },
        data_atualizacao: { type: 'datetime', label: 'Última Atualização' }
      },
      indexes: ['ano', 'Categoria', 'parcela_id'],
      validators: ['validateOrcamentoAgro']
    },

    // ─────────────────────────────────────────────────────────────────────
    // REALOCAÇÃO DE ORÇAMENTO - Log de Movimentações
    // ─────────────────────────────────────────────────────────────────────
    REALOCACAO_LOG: {
      sheetName: 'REALOCACAO_LOG_RA',
      displayName: 'Log de Realocações',
      icon: '📋',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        Parcela_ID: { type: 'string', required: true, foreignKey: 'ParcelasAgroflorestais', label: 'Parcela' },
        De_Categoria: { 
          type: 'enum',
          values: ['Manutenção', 'Restauração', 'Implantação', 'Monitoramento', 'Reserva'],
          required: true,
          label: 'Categoria Origem'
        },
        Para_Categoria: { 
          type: 'enum',
          values: ['Manutenção', 'Restauração', 'Implantação', 'Monitoramento', 'Reserva'],
          required: true,
          label: 'Categoria Destino'
        },
        Valor: { 
          type: 'number', required: true, min: 0.01, unit: 'R$',
          label: 'Valor Realocado'
        },
        Data: { type: 'datetime', required: true, label: 'Data da Realocação' },
        Usuario: { type: 'string', required: true, label: 'Usuário' },
        justificativa: { type: 'text', label: 'Justificativa' }
      },
      indexes: ['Parcela_ID', 'Data', 'De_Categoria'],
      validators: ['validateRealocacao']
    },

    // ─────────────────────────────────────────────────────────────────────
    // AMOSTRAGEM BENTÔNICA - Organismos do Fundo Aquático
    // ─────────────────────────────────────────────────────────────────────
    AMOSTRAGEM_BENTONICA: {
      sheetName: 'AmostragemBentonica',
      displayName: 'Amostragem Bentônica',
      icon: '🦀',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        data: { type: 'date', required: true, label: 'Data da Coleta' },
        hora: { type: 'time', required: true, label: 'Hora' },
        local: { type: 'string', required: true, minLength: 2, label: 'Local da Coleta' },
        latitude: { type: 'number', required: true, min: -90, max: 90 },
        longitude: { type: 'number', required: true, min: -180, max: 180 },
        metodo_coleta: { 
          type: 'enum',
          values: ['draga_ekman', 'draga_petersen', 'pegador_van_veen', 'corer', 'rede_surber', 'coleta_manual'],
          required: true,
          label: 'Método de Coleta'
        },
        profundidade: { 
          type: 'number', required: true, min: 0, max: 100, unit: 'm',
          label: 'Profundidade',
          synthetic: { mean: 5, std: 3, distribution: 'lognormal' }
        },
        area_amostrada: { 
          type: 'number', required: true, min: 0.01, max: 10, unit: 'm²',
          label: 'Área Amostrada',
          synthetic: { mean: 0.25, std: 0.1, distribution: 'normal' }
        },
        tipo_substrato: { 
          type: 'enum',
          values: ['argila', 'silte', 'areia_fina', 'areia_media', 'areia_grossa', 'cascalho', 'pedras', 'materia_organica', 'misto'],
          required: true,
          label: 'Tipo de Substrato'
        },
        grupos_taxonomicos: { type: 'string', required: true, label: 'Grupos Taxonômicos' },
        numero_grupos: { type: 'number', min: 1, label: 'Número de Grupos' },
        abundancia_total: { 
          type: 'number', required: true, min: 0, unit: 'ind/m²',
          label: 'Abundância Total',
          synthetic: { mean: 450, std: 300, distribution: 'lognormal' }
        },
        riqueza_taxa: { 
          type: 'number', min: 0,
          label: 'Riqueza de Taxa',
          synthetic: { mean: 12, std: 5, distribution: 'poisson' }
        },
        temperatura: { type: 'number', min: 0, max: 50, unit: '°C', label: 'Temperatura' },
        oxigenio: { type: 'number', min: 0, max: 20, unit: 'mg/L', label: 'Oxigênio Dissolvido' },
        ph: { type: 'number', min: 0, max: 14, label: 'pH' },
        condicao_substrato: { 
          type: 'enum',
          values: ['limpo', 'pouca_materia_organica', 'muita_materia_organica', 'anoxia', 'contaminado'],
          label: 'Condição do Substrato'
        },
        observacoes: { type: 'text', label: 'Observações' },
        responsavel: { type: 'string', label: 'Responsável' }
      },
      indexes: ['data', 'local', 'tipo_substrato'],
      validators: ['validateAmostragemBentonica']
    },

    // ─────────────────────────────────────────────────────────────────────
    // AVISTAMENTOS CIDADÃOS - Ciência Cidadã (BiodiversityService)
    // ─────────────────────────────────────────────────────────────────────
    AVISTAMENTOS_CIDADAO: {
      sheetName: 'AVISTAMENTOS_CIDADAO_RA',
      displayName: 'Avistamentos Cidadãos',
      icon: '👁️',
      fields: {
        id: { type: 'string', required: true, auto: true },
        data_hora: { type: 'datetime', required: true, label: 'Data/Hora' },
        especie: { type: 'string', required: true, minLength: 2, label: 'Espécie' },
        tipo: { 
          type: 'enum',
          values: ['fauna', 'flora'],
          required: true,
          label: 'Tipo'
        },
        comportamento: { type: 'string', required: true, label: 'Comportamento' },
        latitude: { type: 'number', min: -90, max: 90 },
        longitude: { type: 'number', min: -180, max: 180 },
        observador_id: { type: 'string', label: 'ID do Observador' },
        observador_nome: { type: 'string', required: true, label: 'Nome do Observador' },
        tour_id: { type: 'string', label: 'ID do Tour' },
        trilha_id: { type: 'string', foreignKey: 'Trilhas', label: 'Trilha' },
        foto_url: { type: 'string', label: 'URL da Foto' },
        notas: { type: 'text', label: 'Notas' },
        quantidade: { 
          type: 'number', min: 1, default: 1,
          label: 'Quantidade',
          synthetic: { mean: 2, std: 3, distribution: 'poisson' }
        },
        confianca: { 
          type: 'number', min: 0, max: 100,
          label: 'Confiança (%)',
          synthetic: { mean: 70, std: 15, distribution: 'normal' }
        },
        validado: { type: 'boolean', default: false, label: 'Validado' },
        validado_por: { type: 'string', label: 'Validado Por' },
        validado_em: { type: 'datetime', label: 'Data Validação' },
        fonte: { 
          type: 'enum',
          values: ['App', 'Web', 'Guia', 'Pesquisador'],
          default: 'App',
          label: 'Fonte'
        },
        created_at: { type: 'datetime', auto: true }
      },
      indexes: ['especie', 'data_hora', 'tipo', 'observador_id'],
      validators: ['validateAvistamentoCidadao']
    },

    // ─────────────────────────────────────────────────────────────────────
    // USUÁRIOS - Sistema de Autenticação
    // ─────────────────────────────────────────────────────────────────────
    USUARIOS: {
      sheetName: 'Usuarios',
      displayName: 'Usuários',
      icon: '👤',
      fields: {
        id: { type: 'string', required: true, auto: true },
        timestamp: { type: 'datetime', required: true, auto: true },
        nome: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        email: { type: 'email', required: true, unique: true },
        senha: { type: 'string', required: true, minLength: 6, sensitive: true },
        telefone: { type: 'phone' },
        tipo_usuario: { 
          type: 'enum',
          values: ['Administrador', 'Terapeuta', 'Tecnico', 'Visitante'],
          required: true,
          default: 'Visitante'
        },
        cargo: { type: 'string' },
        permissao: { type: 'string' },
        data_criacao: { type: 'datetime', auto: true },
        ultimo_acesso: { type: 'datetime' },
        ativo: { type: 'boolean', default: true },
        observacoes: { type: 'text' }
      },
      indexes: ['email', 'tipo_usuario'],
      validators: ['validateUser'],
      sensitive: true
    }
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * MÉTODOS DE ACESSO AO SCHEMA
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Obtém schema por nome
   */
  getSchema: function(schemaName) {
    return this.SCHEMAS[schemaName] || null;
  },

  /**
   * Obtém schema pelo nome da planilha
   */
  getSchemaBySheetName: function(sheetName) {
    for (const [key, schema] of Object.entries(this.SCHEMAS)) {
      if (schema.sheetName === sheetName) {
        return { key, ...schema };
      }
    }
    return null;
  },

  /**
   * Obtém headers para uma planilha
   */
  getHeaders: function(schemaName) {
    const schema = this.getSchema(schemaName);
    if (!schema) return [];
    return Object.keys(schema.fields);
  },

  /**
   * Obtém campos obrigatórios
   */
  getRequiredFields: function(schemaName) {
    const schema = this.getSchema(schemaName);
    if (!schema) return [];
    return Object.entries(schema.fields)
      .filter(([_, field]) => field.required && !field.auto)
      .map(([name, _]) => name);
  },

  /**
   * Lista todos os schemas disponíveis
   */
  listSchemas: function() {
    return Object.entries(this.SCHEMAS).map(([key, schema]) => ({
      key,
      sheetName: schema.sheetName,
      displayName: schema.displayName,
      icon: schema.icon,
      fieldCount: Object.keys(schema.fields).length
    }));
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * VALIDAÇÃO DE DADOS
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Valida dados contra o schema
   */
  validate: function(schemaName, data) {
    const schema = this.getSchema(schemaName);
    if (!schema) {
      return { valid: false, errors: [`Schema '${schemaName}' não encontrado`] };
    }

    const errors = [];
    const warnings = [];

    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      const value = data[fieldName];

      // Pula campos automáticos
      if (fieldDef.auto) continue;

      // Verifica obrigatórios
      if (fieldDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`Campo obrigatório: ${fieldDef.label || fieldName}`);
        continue;
      }

      // Se não tem valor e não é obrigatório, pula
      if (value === undefined || value === null || value === '') continue;

      // Validação por tipo
      switch (fieldDef.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${fieldDef.label || fieldName}: deve ser número`);
          } else {
            const num = Number(value);
            if (fieldDef.min !== undefined && num < fieldDef.min) {
              errors.push(`${fieldDef.label || fieldName}: mínimo ${fieldDef.min}`);
            }
            if (fieldDef.max !== undefined && num > fieldDef.max) {
              errors.push(`${fieldDef.label || fieldName}: máximo ${fieldDef.max}`);
            }
          }
          break;

        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${fieldDef.label || fieldName}: email inválido`);
          }
          break;

        case 'enum':
          if (!fieldDef.values.includes(value)) {
            errors.push(`${fieldDef.label || fieldName}: valor inválido. Use: ${fieldDef.values.join(', ')}`);
          }
          break;

        case 'string':
          if (fieldDef.minLength && value.length < fieldDef.minLength) {
            errors.push(`${fieldDef.label || fieldName}: mínimo ${fieldDef.minLength} caracteres`);
          }
          if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
            errors.push(`${fieldDef.label || fieldName}: máximo ${fieldDef.maxLength} caracteres`);
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Sanitiza dados conforme o schema
   */
  sanitize: function(schemaName, data) {
    const schema = this.getSchema(schemaName);
    if (!schema) return data;

    const sanitized = {};

    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      let value = data[fieldName];

      // Campos automáticos
      if (fieldDef.auto) {
        if (fieldName === 'id' && !value) {
          sanitized[fieldName] = Utilities.getUuid();
        } else if (fieldName === 'timestamp' && !value) {
          sanitized[fieldName] = new Date();
        } else if (value) {
          sanitized[fieldName] = value;
        }
        continue;
      }

      // Valor padrão
      if ((value === undefined || value === null || value === '') && fieldDef.default !== undefined) {
        value = fieldDef.default;
      }

      // Conversão de tipo
      if (value !== undefined && value !== null && value !== '') {
        switch (fieldDef.type) {
          case 'number':
            sanitized[fieldName] = Number(value);
            break;
          case 'boolean':
            sanitized[fieldName] = value === true || value === 'true' || value === 1;
            break;
          case 'date':
            sanitized[fieldName] = value instanceof Date ? value : new Date(value);
            break;
          default:
            sanitized[fieldName] = value;
        }
      } else {
        sanitized[fieldName] = '';
      }
    }

    return sanitized;
  },

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * GERAÇÃO DE DADOS SINTÉTICOS - Baseados em Estudos Científicos
   * ═══════════════════════════════════════════════════════════════════════
   */

  /**
   * Gera valor sintético baseado na distribuição definida no schema
   */
  _generateSyntheticValue: function(fieldDef) {
    if (!fieldDef.synthetic) return null;

    const { mean, std, distribution } = fieldDef.synthetic;

    switch (distribution) {
      case 'normal':
        return this._normalRandom(mean, std);
      
      case 'lognormal':
        const normalVal = this._normalRandom(0, 1);
        return Math.exp(Math.log(mean) + std * normalVal / mean);
      
      case 'exponential':
        return -mean * Math.log(Math.random());
      
      case 'poisson':
        return this._poissonRandom(mean);
      
      default:
        return mean;
    }
  },

  /**
   * Distribuição normal (Box-Muller)
   */
  _normalRandom: function(mean, std) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z;
  },

  /**
   * Distribuição de Poisson
   */
  _poissonRandom: function(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  },

  /**
   * Gera um registro sintético completo
   */
  generateSyntheticRecord: function(schemaName, overrides = {}) {
    const schema = this.getSchema(schemaName);
    if (!schema) return null;

    const record = {};

    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      // Usa override se fornecido
      if (overrides[fieldName] !== undefined) {
        record[fieldName] = overrides[fieldName];
        continue;
      }

      // Campos automáticos
      if (fieldDef.auto) {
        if (fieldName === 'id') {
          record[fieldName] = Utilities.getUuid();
        } else if (fieldName === 'timestamp') {
          record[fieldName] = new Date();
        }
        continue;
      }

      // Gera valor sintético se disponível
      if (fieldDef.synthetic) {
        let value = this._generateSyntheticValue(fieldDef);
        
        // Aplica limites
        if (fieldDef.min !== undefined) value = Math.max(fieldDef.min, value);
        if (fieldDef.max !== undefined) value = Math.min(fieldDef.max, value);
        
        // Arredonda números
        if (fieldDef.type === 'number') {
          value = Math.round(value * 100) / 100;
        }
        
        record[fieldName] = value;
        continue;
      }

      // Enum: escolhe aleatório
      if (fieldDef.type === 'enum' && fieldDef.values) {
        record[fieldName] = fieldDef.values[Math.floor(Math.random() * fieldDef.values.length)];
        continue;
      }

      // Valor padrão
      if (fieldDef.default !== undefined) {
        record[fieldName] = fieldDef.default;
      }
    }

    return record;
  },

  /**
   * Gera múltiplos registros sintéticos
   */
  generateSyntheticDataset: function(schemaName, count, options = {}) {
    const records = [];
    const baseDate = options.startDate || new Date();
    
    for (let i = 0; i < count; i++) {
      const overrides = { ...options.overrides };
      
      // Distribui datas se solicitado
      if (options.distributeOverDays) {
        const dayOffset = Math.floor(i / (count / options.distributeOverDays));
        const date = new Date(baseDate);
        date.setDate(date.getDate() - dayOffset);
        overrides.data = date;
      }
      
      const record = this.generateSyntheticRecord(schemaName, overrides);
      if (record) records.push(record);
    }
    
    return records;
  }
};


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API FUNCTIONS - Expostas para Frontend
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Obtém schema para uso no frontend
 */
function apiGetSchema(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: `Schema '${schemaName}' não encontrado` };
  }
  
  // Remove informações sensíveis
  const safeSchema = JSON.parse(JSON.stringify(schema));
  for (const [fieldName, fieldDef] of Object.entries(safeSchema.fields)) {
    if (fieldDef.sensitive) {
      delete safeSchema.fields[fieldName].synthetic;
    }
  }
  
  return { success: true, schema: safeSchema };
}

/**
 * Lista todos os schemas disponíveis
 */
function apiListSchemas() {
  return { 
    success: true, 
    schemas: SchemaRegistry.listSchemas() 
  };
}

/**
 * Valida dados contra schema
 */
function apiValidateData(schemaName, data) {
  return SchemaRegistry.validate(schemaName, data);
}

/**
 * Cria registro com validação automática via schema
 */
function apiCreateWithSchema(schemaName, data) {
  // Valida
  const validation = SchemaRegistry.validate(schemaName, data);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  // Sanitiza
  const sanitized = SchemaRegistry.sanitize(schemaName, data);
  
  // Obtém nome da planilha
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  // Cria via SheetsService
  return SheetsService.create(schema.sheetName, sanitized);
}

/**
 * Gera dados sintéticos para testes/demonstração
 */
function apiGenerateSyntheticData(schemaName, count, options) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: `Schema '${schemaName}' não encontrado` };
  }
  
  const records = SchemaRegistry.generateSyntheticDataset(schemaName, count || 10, options || {});
  
  return {
    success: true,
    count: records.length,
    records: records,
    schema: schema.displayName
  };
}

/**
 * Popula planilha com dados sintéticos
 */
function apiPopulateWithSyntheticData(schemaName, count, options) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: `Schema '${schemaName}' não encontrado` };
  }
  
  const records = SchemaRegistry.generateSyntheticDataset(schemaName, count || 10, options || {});
  
  let created = 0;
  let errors = [];
  
  for (const record of records) {
    const result = SheetsService.create(schema.sheetName, record);
    if (result.success) {
      created++;
    } else {
      errors.push(result.error);
    }
  }
  
  return {
    success: true,
    created,
    total: records.length,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined
  };
}

/**
 * Obtém metadados de campo para formulários dinâmicos
 */
function apiGetFormMetadata(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  const fields = [];
  
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    // Pula campos automáticos e sensíveis
    if (fieldDef.auto || fieldDef.sensitive) continue;
    
    fields.push({
      name: fieldName,
      label: fieldDef.label || fieldName,
      type: fieldDef.type,
      required: fieldDef.required || false,
      min: fieldDef.min,
      max: fieldDef.max,
      unit: fieldDef.unit,
      values: fieldDef.values,
      default: fieldDef.default,
      reference: fieldDef.reference
    });
  }
  
  return {
    success: true,
    displayName: schema.displayName,
    icon: schema.icon,
    fields
  };
}

/**
 * Sincroniza estrutura da planilha com schema
 */
function apiSyncSheetWithSchema(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  const headers = SchemaRegistry.getHeaders(schemaName);
  const sheet = SheetsService.getOrCreateSheet(schema.sheetName, headers);
  
  return {
    success: true,
    sheetName: schema.sheetName,
    headers: headers,
    message: `Planilha '${schema.sheetName}' sincronizada com ${headers.length} colunas`
  };
}

/**
 * Inicializa todas as planilhas baseadas nos schemas
 */
function apiInitializeAllSchemas() {
  const results = [];
  
  for (const [schemaName, schema] of Object.entries(SchemaRegistry.SCHEMAS)) {
    const headers = SchemaRegistry.getHeaders(schemaName);
    SheetsService.getOrCreateSheet(schema.sheetName, headers);
    results.push({
      schema: schemaName,
      sheet: schema.sheetName,
      fields: headers.length
    });
  }
  
  return {
    success: true,
    initialized: results.length,
    schemas: results
  };
}


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API FUNCTIONS - Administração e Diagnóstico (Intervenção 3/3)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Obtém detalhes completos de um schema para o dashboard admin
 */
function apiGetSchemaDetails(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: `Schema '${schemaName}' não encontrado` };
  }
  
  const fields = [];
  
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    fields.push({
      name: fieldName,
      label: fieldDef.label || fieldName,
      type: fieldDef.type,
      required: fieldDef.required || false,
      auto: fieldDef.auto || false,
      min: fieldDef.min,
      max: fieldDef.max,
      unit: fieldDef.unit,
      values: fieldDef.values,
      default: fieldDef.default,
      reference: fieldDef.reference,
      hasSynthetic: !!fieldDef.synthetic
    });
  }
  
  // Verifica se planilha existe e conta registros
  let sheetInfo = { exists: false, rows: 0 };
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(schema.sheetName);
    if (sheet) {
      sheetInfo.exists = true;
      sheetInfo.rows = Math.max(0, sheet.getLastRow() - 1);
    }
  } catch (e) {
    // Silencioso
  }
  
  return {
    success: true,
    displayName: schema.displayName,
    icon: schema.icon,
    sheetName: schema.sheetName,
    fields: fields,
    sheetExists: sheetInfo.exists,
    recordCount: sheetInfo.rows,
    indexes: schema.indexes || [],
    validators: schema.validators || []
  };
}

/**
 * Verifica se planilha de um schema existe
 */
function apiCheckSheetExists(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { exists: false, error: 'Schema não encontrado' };
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(schema.sheetName);
    
    if (sheet) {
      return {
        exists: true,
        rows: Math.max(0, sheet.getLastRow() - 1),
        columns: sheet.getLastColumn()
      };
    }
    
    return { exists: false, rows: 0 };
  } catch (e) {
    return { exists: false, error: e.toString() };
  }
}

/**
 * Executa diagnóstico completo de todos os schemas
 */
function apiRunSchemaDiagnostic() {
  const diagnostics = [];
  let syncedCount = 0;
  let totalRecords = 0;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  diagnostics.push({
    status: 'info',
    message: `Iniciando diagnóstico de ${Object.keys(SchemaRegistry.SCHEMAS).length} schemas...`
  });
  
  for (const [schemaName, schema] of Object.entries(SchemaRegistry.SCHEMAS)) {
    const sheet = ss.getSheetByName(schema.sheetName);
    
    if (!sheet) {
      diagnostics.push({
        status: 'warning',
        message: `${schema.icon} ${schema.displayName}: Planilha '${schema.sheetName}' não existe`
      });
      continue;
    }
    
    // Verifica headers
    const expectedHeaders = Object.keys(schema.fields);
    const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(h => h);
    
    const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
    const extraHeaders = actualHeaders.filter(h => !expectedHeaders.includes(h));
    
    if (missingHeaders.length > 0) {
      diagnostics.push({
        status: 'warning',
        message: `${schema.icon} ${schema.displayName}: Colunas faltando: ${missingHeaders.join(', ')}`
      });
    } else if (extraHeaders.length > 0) {
      diagnostics.push({
        status: 'info',
        message: `${schema.icon} ${schema.displayName}: Colunas extras: ${extraHeaders.join(', ')}`
      });
      syncedCount++;
    } else {
      const rows = Math.max(0, sheet.getLastRow() - 1);
      totalRecords += rows;
      syncedCount++;
      diagnostics.push({
        status: 'success',
        message: `${schema.icon} ${schema.displayName}: OK (${rows} registros)`
      });
    }
  }
  
  // Resumo
  diagnostics.push({
    status: 'info',
    message: `─────────────────────────────────`
  });
  diagnostics.push({
    status: syncedCount === Object.keys(SchemaRegistry.SCHEMAS).length ? 'success' : 'warning',
    message: `Resumo: ${syncedCount}/${Object.keys(SchemaRegistry.SCHEMAS).length} schemas sincronizados, ${totalRecords} registros totais`
  });
  
  return {
    success: true,
    diagnostics: diagnostics,
    syncedCount: syncedCount,
    totalSchemas: Object.keys(SchemaRegistry.SCHEMAS).length,
    totalRecords: totalRecords
  };
}

/**
 * Valida integridade de dados de uma planilha contra seu schema
 */
function apiValidateSheetData(schemaName, options) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(schema.sheetName);
  
  if (!sheet) {
    return { success: false, error: 'Planilha não encontrada' };
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: true, valid: 0, invalid: 0, errors: [] };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  let validCount = 0;
  let invalidCount = 0;
  const errors = [];
  const limit = options?.limit || 100;
  
  for (let i = 0; i < data.length && errors.length < limit; i++) {
    const row = data[i];
    const record = {};
    
    headers.forEach((h, idx) => {
      record[h] = row[idx];
    });
    
    const validation = SchemaRegistry.validate(schemaName, record);
    
    if (validation.valid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push({
        row: i + 2,
        id: record.id || `Linha ${i + 2}`,
        errors: validation.errors
      });
    }
  }
  
  return {
    success: true,
    valid: validCount,
    invalid: invalidCount,
    total: data.length,
    errors: errors
  };
}

/**
 * Exporta schema como JSON para documentação
 */
function apiExportSchemaAsJSON(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  // Remove funções e dados sensíveis
  const exportable = {
    name: schemaName,
    displayName: schema.displayName,
    icon: schema.icon,
    sheetName: schema.sheetName,
    fields: {},
    indexes: schema.indexes,
    validators: schema.validators
  };
  
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (!fieldDef.sensitive) {
      exportable.fields[fieldName] = {
        type: fieldDef.type,
        label: fieldDef.label,
        required: fieldDef.required,
        min: fieldDef.min,
        max: fieldDef.max,
        unit: fieldDef.unit,
        values: fieldDef.values,
        reference: fieldDef.reference
      };
    }
  }
  
  return {
    success: true,
    json: JSON.stringify(exportable, null, 2),
    schema: exportable
  };
}

/**
 * Exporta todos os schemas como documentação
 */
function apiExportAllSchemasDoc() {
  const docs = [];
  
  for (const [schemaName, schema] of Object.entries(SchemaRegistry.SCHEMAS)) {
    const result = apiExportSchemaAsJSON(schemaName);
    if (result.success) {
      docs.push(result.schema);
    }
  }
  
  return {
    success: true,
    count: docs.length,
    schemas: docs,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Compara estrutura da planilha com schema e retorna diferenças
 */
function apiCompareSheetWithSchema(schemaName) {
  const schema = SchemaRegistry.getSchema(schemaName);
  if (!schema) {
    return { success: false, error: 'Schema não encontrado' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(schema.sheetName);
  
  if (!sheet) {
    return {
      success: true,
      sheetExists: false,
      differences: [{
        type: 'missing_sheet',
        message: `Planilha '${schema.sheetName}' não existe`
      }]
    };
  }
  
  const expectedHeaders = Object.keys(schema.fields);
  const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(h => h);
  
  const differences = [];
  
  // Colunas faltando
  expectedHeaders.forEach(h => {
    if (!actualHeaders.includes(h)) {
      differences.push({
        type: 'missing_column',
        column: h,
        message: `Coluna '${h}' definida no schema mas não existe na planilha`
      });
    }
  });
  
  // Colunas extras
  actualHeaders.forEach(h => {
    if (!expectedHeaders.includes(h)) {
      differences.push({
        type: 'extra_column',
        column: h,
        message: `Coluna '${h}' existe na planilha mas não está definida no schema`
      });
    }
  });
  
  // Ordem das colunas
  let orderMismatch = false;
  for (let i = 0; i < Math.min(expectedHeaders.length, actualHeaders.length); i++) {
    if (expectedHeaders[i] !== actualHeaders[i]) {
      orderMismatch = true;
      break;
    }
  }
  
  if (orderMismatch && differences.length === 0) {
    differences.push({
      type: 'order_mismatch',
      message: 'Ordem das colunas difere do schema'
    });
  }
  
  return {
    success: true,
    sheetExists: true,
    isSync: differences.length === 0,
    expectedColumns: expectedHeaders.length,
    actualColumns: actualHeaders.length,
    differences: differences
  };
}


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDADORES ESPECÍFICOS - Agrofloresta e Biodiversidade
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Valida dados de parcela agroflorestal
 */
function validateParcelaAgro(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de área mínima para SAF
  if (data.tipo_sistema && data.tipo_sistema.includes('SAF') && data.area_ha < 0.5) {
    warnings.push('Área muito pequena para SAF. Recomendado mínimo 0.5 ha.');
  }
  
  // Validação de custo de implantação vs área
  if (data.custo_implantacao && data.area_ha) {
    const custoPorHa = data.custo_implantacao / data.area_ha;
    if (custoPorHa < 1000) {
      warnings.push(`Custo de implantação muito baixo (R$ ${custoPorHa.toFixed(0)}/ha). Verificar dados.`);
    }
    if (custoPorHa > 30000) {
      warnings.push(`Custo de implantação muito alto (R$ ${custoPorHa.toFixed(0)}/ha). Verificar dados.`);
    }
  }
  
  // Validação de coordenadas para Cerrado (aproximado)
  if (data.latitude && data.longitude) {
    if (data.latitude < -25 || data.latitude > -5) {
      warnings.push('Latitude fora da região típica do Cerrado.');
    }
    if (data.longitude < -60 || data.longitude > -40) {
      warnings.push('Longitude fora da região típica do Cerrado.');
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida dados de produção agroflorestal
 */
function validateProducaoAgro(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de valor vs quantidade
  if (data.quantidade_kg && data.valor_reais) {
    const valorPorKg = data.valor_reais / data.quantidade_kg;
    if (valorPorKg < 0.5) {
      warnings.push(`Valor por kg muito baixo (R$ ${valorPorKg.toFixed(2)}). Verificar dados.`);
    }
    if (valorPorKg > 100) {
      warnings.push(`Valor por kg muito alto (R$ ${valorPorKg.toFixed(2)}). Verificar dados.`);
    }
  }
  
  // Validação de data futura
  if (data.data && new Date(data.data) > new Date()) {
    errors.push('Data de colheita não pode ser no futuro.');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida dados de orçamento agroflorestal
 */
function validateOrcamentoAgro(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de utilizado vs alocado
  if (data.Utilizado && data.Alocado && data.Utilizado > data.Alocado) {
    warnings.push('Valor utilizado excede o valor alocado.');
  }
  
  // Validação de ano
  const anoAtual = new Date().getFullYear();
  if (data.ano && (data.ano < anoAtual - 5 || data.ano > anoAtual + 2)) {
    warnings.push(`Ano ${data.ano} está fora do período típico de planejamento.`);
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida dados de realocação de orçamento
 */
function validateRealocacao(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de categorias diferentes
  if (data.De_Categoria === data.Para_Categoria) {
    errors.push('Categoria de origem e destino devem ser diferentes.');
  }
  
  // Validação de valor mínimo
  if (data.Valor && data.Valor < 100) {
    warnings.push('Valor de realocação muito baixo. Considere agrupar realocações.');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida dados de avistamento cidadão
 */
function validateAvistamentoCidadao(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de confiança
  if (data.confianca && data.confianca < 50 && !data.foto_url) {
    warnings.push('Avistamento com baixa confiança e sem foto. Considere validação adicional.');
  }
  
  // Validação de coordenadas
  if (!data.latitude || !data.longitude) {
    warnings.push('Coordenadas GPS não informadas. Localização aproximada.');
  }
  
  // Validação de espécie
  if (data.especie && data.especie.length < 3) {
    errors.push('Nome da espécie muito curto. Forneça identificação mais detalhada.');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida dados de amostragem bentônica
 */
function validateAmostragemBentonica(data) {
  const errors = [];
  const warnings = [];
  
  // Validação de profundidade vs método
  if (data.metodo_coleta === 'rede_surber' && data.profundidade > 1) {
    warnings.push('Rede de Surber geralmente usada em águas rasas (< 1m).');
  }
  
  // Validação de abundância vs área
  if (data.abundancia_total && data.area_amostrada) {
    const densidade = data.abundancia_total / data.area_amostrada;
    if (densidade > 10000) {
      warnings.push(`Densidade muito alta (${densidade.toFixed(0)} ind/m²). Verificar dados.`);
    }
  }
  
  // Validação de oxigênio em condição de anoxia
  if (data.condicao_substrato === 'anoxia' && data.oxigenio > 2) {
    warnings.push('Condição de anoxia declarada, mas OD > 2 mg/L. Verificar consistência.');
  }
  
  // Validação de coordenadas para Cerrado
  if (data.latitude && data.longitude) {
    if (data.latitude < -25 || data.latitude > -5) {
      warnings.push('Latitude fora da região típica do Cerrado.');
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Executa validador específico por nome
 */
function runValidator(validatorName, data) {
  const validators = {
    validateParcelaAgro,
    validateProducaoAgro,
    validateOrcamentoAgro,
    validateRealocacao,
    validateAvistamentoCidadao,
    validateAmostragemBentonica
  };
  
  if (validators[validatorName]) {
    return validators[validatorName](data);
  }
  
  return { valid: true, errors: [], warnings: [] };
}
