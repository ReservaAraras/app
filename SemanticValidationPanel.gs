/**
 * Abre o painel de validação semântica
 */
function showValidationPanel() {
  const html = HtmlService.createHtmlOutputFromFile('SemanticValidationPanel_UI')
    .setWidth(1000)
    .setHeight(700)
    .setTitle('🔍 Validação Semântica');
  
  SpreadsheetApp.getUi().showModalDialog(html, '🔍 Painel de Validação Semântica');
}

/**
 * Obtém todos os schemas para o painel
 */
function apiGetSchemasForPanel() {
  try {
    const schemas = semanticMapper.getAllSchemas();
    const report = semanticMapper.generateValidationReport();
    
    return {
      success: true,
      schemas: schemas,
      report: report
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Valida dados contra um schema específico
 */
function validateDataAgainstSchema(entityName, data) {
  try {
    return ValidationService.validateWithSchema(entityName, data);
  } catch (e) {
    return {
      valid: false,
      error: e.message
    };
  }
}

/**
 * Registra schema de exemplo
 */
function registerExampleSchemas() {
  try {
    // Schema de Waypoint
    semanticMapper.registerSchema({
      name: 'Waypoint',
      version: '1.0',
      fields: {
        nome: {
          type: 'string',
          required: true,
          validation: { minLength: 3, maxLength: 100 }
        },
        latitude: {
          type: 'number',
          required: true,
          validation: { min: -90, max: 90 }
        },
        longitude: {
          type: 'number',
          required: true,
          validation: { min: -180, max: 180 }
        },
        categoria: {
          type: 'string',
          required: true,
          validation: { 
            enum: ['cachoeira', 'mirante', 'atração', 'agua', 'flora', 'fauna'] 
          }
        },
        altitude: {
          type: 'number',
          required: false,
          validation: { min: 0, max: 9000 }
        },
        trilha_id: {
          type: 'string',
          required: false,
          relationship: {
            from: 'waypoint_id',
            to: 'Trilha',
            type: 'many-to-one',
            description: 'Waypoint pertence a uma trilha'
          }
        }
      },
      businessRules: [
        'Coordenadas devem estar dentro da área da reserva',
        'Categoria deve ser consistente com o tipo de ponto',
        'Waypoints de cachoeira devem ter altitude informada'
      ]
    });

    // Schema de Observação de Biodiversidade
    semanticMapper.registerSchema({
      name: 'ObservacaoBiodiversidade',
      version: '1.0',
      fields: {
        especie_cientifica: {
          type: 'string',
          required: false,
          validation: { pattern: '^[A-Z][a-z]+ [a-z]+$' }
        },
        especie_comum: {
          type: 'string',
          required: false
        },
        tipo_observacao: {
          type: 'string',
          required: true,
          validation: { enum: ['flora', 'fauna'] }
        },
        quantidade: {
          type: 'number',
          required: false,
          validation: { min: 1 }
        },
        data: {
          type: 'object',
          required: true
        },
        local: {
          type: 'string',
          required: true
        },
        waypoint_id: {
          type: 'string',
          required: false,
          relationship: {
            from: 'observacao_id',
            to: 'Waypoint',
            type: 'many-to-one',
            description: 'Observação feita em um waypoint'
          }
        }
      },
      businessRules: [
        'Deve informar nome científico OU nome comum',
        'Nome científico deve ser validado via GBIF API',
        'Quantidade deve ser informada para avistamentos',
        'Local deve corresponder a um waypoint existente'
      ]
    });

    // Schema de Qualidade da Água
    semanticMapper.registerSchema({
      name: 'QualidadeAgua',
      version: '1.0',
      fields: {
        local: {
          type: 'string',
          required: true
        },
        pH: {
          type: 'number',
          required: false,
          validation: { min: 0, max: 14 }
        },
        oxigenio_dissolvido: {
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        turbidez: {
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        temperatura: {
          type: 'number',
          required: false,
          validation: { min: -10, max: 50 }
        },
        data: {
          type: 'object',
          required: true
        }
      },
      businessRules: [
        'pH deve estar entre 6.0 e 9.0 (CONAMA 357/2005)',
        'Oxigênio dissolvido mínimo: 5.0 mg/L',
        'Turbidez máxima: 100 NTU',
        'Temperatura típica: 10-35°C'
      ]
    });

    return {
      success: true,
      message: 'Schemas de exemplo registrados com sucesso',
      count: 3
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}
