/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIG CONSTANTS - Constantes Científicas e Thresholds
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Constantes científicas baseadas em literatura (IPCC, Embrapa, CONAMA, WHO).
 * Separado do Config.gs para facilitar manutenção e referência.
 * 
 * @author Reserva Araras
 * @version 1.0.0
 */

/**
 * Constantes científicas do sistema
 * Referenciadas via CONFIG.CONSTANTS
 */
const SCIENTIFIC_CONSTANTS = {
  
  // ═══════════════════════════════════════════════════════════════════════
  // SEQUESTRO DE CARBONO (tCO2e/ha/ano)
  // Fonte: IPCC, Embrapa
  // ═══════════════════════════════════════════════════════════════════════
  CARBON_SEQUESTRATION: {
    'SAF_Cerrado': 8.5,
    'ILPF': 5.2,
    'Agrofloresta_Diversa': 12.3,
    'Recuperacao_Pastagem': 3.8,
    'Cerrado_Nativo': 2.5,
    'Monocultura': 1.2
  },

  // Conversão carbono
  CARBON_TO_CO2: 3.67,
  CARBON_FRACTION_BIOMASS: 0.47,

  // ═══════════════════════════════════════════════════════════════════════
  // RAZÃO RAIZ/PARTE AÉREA (Root-to-Shoot Ratio)
  // Fonte: IPCC / Mokany et al.
  // ═══════════════════════════════════════════════════════════════════════
  ROOT_SHOOT_RATIOS: {
    'SAF_Cerrado': 0.30,
    'ILPF': 0.28,
    'Agrofloresta_Diversa': 0.35,
    'Recuperacao_Pastagem': 0.50,
    'Cerrado_Nativo': 0.58,
    'Monocultura': 0.20
  },
  ROOT_SHOOT_DEFAULT: 0.24,

  // ═══════════════════════════════════════════════════════════════════════
  // ÍNDICE DE QUALIDADE DA ÁGUA (IQA)
  // Pesos para cálculo do índice
  // ═══════════════════════════════════════════════════════════════════════
  IQA_WEIGHTS: {
    pH: 0.12,
    turbidez: 0.08,
    oxigenio: 0.17,
    coliformes: 0.15,
    nitrogenio: 0.10,
    fosforo: 0.10,
    temperatura: 0.10,
    solidos: 0.08,
    condutividade: 0.10
  }
};

/**
 * Thresholds baseados em normas (CONAMA, WHO, etc)
 * Referenciados via CONFIG.THRESHOLDS
 */
const REGULATORY_THRESHOLDS = {
  
  // ═══════════════════════════════════════════════════════════════════════
  // QUALIDADE DA ÁGUA
  // Fonte: CONAMA 357/2005
  // ═══════════════════════════════════════════════════════════════════════
  AGUA: {
    pH_MIN: 6.0,
    pH_MAX: 9.0,
    OXIGENIO_MIN: 5.0,      // mg/L
    TURBIDEZ_MAX: 100,      // NTU
    COLIFORMES_MAX: 1000    // NMP/100mL
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUALIDADE DO SOLO
  // ═══════════════════════════════════════════════════════════════════════
  SOLO: {
    pH_IDEAL_MIN: 6.0,
    pH_IDEAL_MAX: 7.0,
    MATERIA_ORGANICA_MIN: 2.5  // %
  }
};

/**
 * Prioridades climáticas COP28 & UN
 */
const CLIMATE_PRIORITIES = {
  MITIGATION_TARGETS: {
    carbonSequestration: '1.5°C pathway alignment',
    emissionReduction: 'Net-zero by 2050'
  },
  ADAPTATION_GOALS: {
    resilience: 'Global Goal on Adaptation',
    vulnerability: 'Reduce by 50% by 2030'
  },
  FINANCE_MECHANISMS: [
    'Green Climate Fund',
    'Adaptation Fund',
    'Loss & Damage Fund',
    'Carbon Markets (Article 6)'
  ],
  SDG_ALIGNMENT: {
    primary: ['ODS 13', 'ODS 15'],
    secondary: ['ODS 1', 'ODS 2', 'ODS 5', 'ODS 6', 'ODS 8', 'ODS 12']
  }
};

/**
 * Contexto específico da Reserva Recanto das Araras
 */
const RESERVA_CONTEXT = {
  nome: 'Reserva Recanto das Araras de Terra Ronca',
  estado: 'Goiás',
  municipio: 'São Domingos',
  bioma: 'Cerrado',
  coordenadas: { latitude: -13.4, longitude: -46.3 },
  caracteristicas: {
    vegetacao: ['Cerrado sentido restrito', 'Cerradão', 'Mata de galeria', 'Veredas'],
    fauna_emblematica: ['Arara-canindé', 'Lobo-guará', 'Tamanduá-bandeira'],
    especies_nativas_prioritarias: [
      'Pequi (Caryocar brasiliense)',
      'Baru (Dipteryx alata)',
      'Cagaita (Eugenia dysenterica)',
      'Buriti (Mauritia flexuosa)',
      'Jatobá-do-cerrado (Hymenaea stigonocarpa)'
    ]
  }
};
