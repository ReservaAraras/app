/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHEET SCHEMA REGISTRY - Registro Central de Schemas de Planilhas
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTERVENÇÃO 3/13: Criação das 49 planilhas faltantes
 * 
 * Este arquivo contém:
 * 1. Schemas de todas as planilhas do sistema
 * 2. Função para criar planilhas faltantes
 * 3. Validação de integridade do banco de dados
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Registro central de schemas de todas as planilhas
 */
const SHEET_SCHEMAS = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO E SISTEMA
  // ═══════════════════════════════════════════════════════════════════════════
  
  CONFIG_HISTORY_RA: {
    headers: ['id', 'timestamp', 'config_key', 'old_value', 'new_value', 'changed_by', 'reason'],
    color: '#607D8B',
    description: 'Histórico de alterações de configuração'
  },
  
  AUDIT_LOG_RA: {
    headers: ['id', 'timestamp', 'user_email', 'action', 'entity', 'entity_id', 'old_data', 'new_data', 'ip_address', 'user_agent'],
    color: '#455A64',
    description: 'Log de auditoria do sistema'
  },
  
  USUARIOS_RBAC_RA: {
    headers: ['id', 'timestamp', 'email', 'nome', 'role', 'permissions', 'status', 'last_login', 'created_by'],
    color: '#37474F',
    description: 'Controle de acesso baseado em roles'
  },
  
  API_AUDIT_RA: {
    headers: ['id', 'timestamp', 'endpoint', 'method', 'user_email', 'request_data', 'response_status', 'response_time_ms', 'error'],
    color: '#546E7A',
    description: 'Auditoria de chamadas de API'
  },
  
  VALIDACAO_LOG_RA: {
    headers: ['id', 'timestamp', 'entity', 'record_id', 'field', 'value', 'validation_type', 'result', 'message'],
    color: '#78909C',
    description: 'Log de validações de dados'
  },
  
  A11Y_AUDIT_RA: {
    headers: ['id', 'timestamp', 'page', 'component', 'issue_type', 'severity', 'wcag_criterion', 'description', 'recommendation', 'status'],
    color: '#90A4AE',
    description: 'Auditoria de acessibilidade'
  },
  
  BACKUP_LOG_RA: {
    headers: ['id', 'timestamp', 'backup_type', 'sheets_included', 'file_id', 'file_url', 'size_bytes', 'status', 'error'],
    color: '#B0BEC5',
    description: 'Log de backups realizados'
  },
  
  RECOVERY_LOG_RA: {
    headers: ['id', 'timestamp', 'backup_id', 'sheets_restored', 'records_restored', 'status', 'restored_by', 'error'],
    color: '#CFD8DC',
    description: 'Log de recuperações de backup'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIODIVERSIDADE E ECOLOGIA
  // ═══════════════════════════════════════════════════════════════════════════
  
  BIODIVERSIDADE_RA: {
    headers: ['id', 'timestamp', 'data', 'local', 'latitude', 'longitude', 'tipo_observacao', 'especie_cientifica', 'especie_comum', 'familia', 'quantidade', 'comportamento', 'habitat', 'status_conservacao', 'foto_id', 'observador', 'validado', 'observacoes'],
    color: '#4CAF50',
    description: 'Registros de biodiversidade'
  },
  
  ALERTAS_ECOLOGICOS_RA: {
    headers: ['id', 'timestamp', 'tipo', 'severidade', 'categoria', 'titulo', 'descricao', 'latitude', 'longitude', 'area_afetada', 'acao_recomendada', 'status', 'responsavel', 'data_resolucao'],
    color: '#F44336',
    description: 'Alertas ecológicos do sistema'
  },
  
  CORREDORES_ECOLOGICOS_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo', 'largura_m', 'comprimento_km', 'area_ha', 'fragmento_origem', 'fragmento_destino', 'conectividade_score', 'vegetacao_dominante', 'status', 'observacoes'],
    color: '#8BC34A',
    description: 'Corredores ecológicos mapeados'
  },
  
  ESPECIES_INVASORAS_RA: {
    headers: ['id', 'timestamp', 'nome_cientifico', 'nome_comum', 'tipo', 'origem', 'data_deteccao', 'latitude', 'longitude', 'area_infestada_ha', 'densidade', 'impacto_nivel', 'metodo_controle', 'status_controle', 'responsavel'],
    color: '#FF5722',
    description: 'Registro de espécies invasoras'
  },
  
  INTERACOES_ECOLOGICAS_RA: {
    headers: ['id', 'timestamp', 'especie_a', 'nome_popular_a', 'especie_b', 'nome_popular_b', 'tipo_interacao', 'direcao', 'intensidade', 'frequencia', 'sazonalidade_json', 'fonte', 'confianca', 'habitat', 'periodo', 'importancia', 'notas'],
    color: '#009688',
    description: 'Interações ecológicas entre espécies'
  },
  
  HEATMAP_BIODIVERSIDADE_RA: {
    headers: ['id', 'timestamp', 'grid_id', 'latitude', 'longitude', 'riqueza_especies', 'abundancia_total', 'indice_shannon', 'indice_simpson', 'especies_ameacadas', 'periodo'],
    color: '#00BCD4',
    description: 'Dados para heatmap de biodiversidade'
  },
  
  FRAGMENTOS_HABITAT_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo_vegetacao', 'area_ha', 'perimetro_km', 'forma_index', 'isolamento_km', 'conectividade', 'qualidade_habitat', 'especies_focais', 'ameacas', 'coordenadas_json'],
    color: '#3F51B5',
    description: 'Fragmentos de habitat mapeados'
  },
  
  CONEXOES_HABITAT_RA: {
    headers: ['id', 'timestamp', 'fragmento_origem_id', 'fragmento_destino_id', 'tipo_conexao', 'distancia_km', 'qualidade', 'permeabilidade', 'uso_fauna', 'observacoes'],
    color: '#673AB7',
    description: 'Conexões entre fragmentos de habitat'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FENOLOGIA E SUCESSÃO
  // ═══════════════════════════════════════════════════════════════════════════
  
  FENOLOGIA_RA: {
    headers: ['id', 'timestamp', 'especie_id', 'especie_nome', 'data_observacao', 'latitude', 'longitude', 'fase_fenologica', 'intensidade', 'individuos_observados', 'temperatura', 'precipitacao_acumulada', 'observador', 'foto_id', 'notas'],
    color: '#E91E63',
    description: 'Observações fenológicas'
  },
  
  PREDICOES_FENOLOGIA_RA: {
    headers: ['id', 'timestamp', 'especie_id', 'fase_fenologica', 'data_prevista_inicio', 'data_prevista_pico', 'data_prevista_fim', 'confianca', 'modelo_usado', 'variaveis_input'],
    color: '#9C27B0',
    description: 'Predições de fenologia'
  },
  
  PARCELAS_PERMANENTES_RA: {
    headers: ['id', 'timestamp', 'nome', 'latitude', 'longitude', 'area_m2', 'tipo_vegetacao', 'altitude', 'declividade', 'exposicao', 'data_instalacao', 'responsavel', 'status'],
    color: '#2E7D32',
    description: 'Parcelas permanentes de monitoramento'
  },
  
  REGENERANTES_RA: {
    headers: ['id', 'timestamp', 'parcela_id', 'especie_id', 'especie_nome', 'classe_altura', 'quantidade', 'data_censo', 'observador', 'notas'],
    color: '#43A047',
    description: 'Regenerantes em parcelas'
  },
  
  CENSOS_REGENERACAO_RA: {
    headers: ['id', 'timestamp', 'parcela_id', 'data_censo', 'total_regenerantes', 'riqueza_especies', 'densidade_m2', 'altura_media_cm', 'observador', 'condicoes_clima', 'notas'],
    color: '#66BB6A',
    description: 'Censos de regeneração natural'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BANCO DE SEMENTES
  // ═══════════════════════════════════════════════════════════════════════════
  
  AMOSTRAS_BANCO_SEMENTES_RA: {
    headers: ['id', 'timestamp', 'local_coleta', 'latitude', 'longitude', 'data_coleta', 'profundidade_cm', 'area_amostra_cm2', 'peso_amostra_g', 'responsavel', 'notas'],
    color: '#795548',
    description: 'Amostras do banco de sementes'
  },
  
  GERMINACAO_SEMENTES_RA: {
    headers: ['id', 'timestamp', 'amostra_id', 'especie_id', 'especie_nome', 'sementes_germinadas', 'data_inicio', 'data_fim', 'dias_germinacao', 'taxa_germinacao', 'tratamento', 'notas'],
    color: '#8D6E63',
    description: 'Testes de germinação'
  },
  
  PLANTULAS_BANCO_RA: {
    headers: ['id', 'timestamp', 'amostra_id', 'especie_id', 'especie_nome', 'quantidade', 'altura_media_cm', 'vigor', 'data_avaliacao', 'notas'],
    color: '#A1887F',
    description: 'Plântulas emergidas do banco'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CÂMERAS TRAP E FAUNA
  // ═══════════════════════════════════════════════════════════════════════════
  
  CAMERAS_TRAP_RA: {
    headers: ['id', 'timestamp', 'nome', 'modelo', 'latitude', 'longitude', 'altitude', 'habitat', 'data_instalacao', 'status', 'bateria_pct', 'memoria_pct', 'ultima_verificacao', 'responsavel'],
    color: '#FF9800',
    description: 'Cadastro de câmeras trap'
  },
  
  CAPTURAS_CAMERA_TRAP_RA: {
    headers: ['id', 'timestamp', 'camera_id', 'data_captura', 'hora_captura', 'especie_id', 'especie_nome', 'quantidade', 'sexo', 'idade', 'comportamento', 'temperatura', 'fase_lunar', 'foto_id', 'video_id', 'validado', 'validador'],
    color: '#FFA726',
    description: 'Capturas das câmeras trap'
  },
  
  CAPTURAS_AVANCADO_RA: {
    headers: ['id', 'timestamp', 'camera_id', 'captura_id', 'ia_especie_detectada', 'ia_confianca', 'ia_bbox_json', 'marcas_individuais', 'individuo_id', 'recaptura', 'notas'],
    color: '#FFB74D',
    description: 'Análise avançada de capturas'
  },
  
  OCUPACAO_HABITAT_RA: {
    headers: ['id', 'timestamp', 'especie_id', 'camera_id', 'periodo', 'deteccoes', 'nao_deteccoes', 'ocupacao_estimada', 'detectabilidade', 'modelo', 'covars_json'],
    color: '#FFCC80',
    description: 'Modelos de ocupação de habitat'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SENSORES IoT
  // ═══════════════════════════════════════════════════════════════════════════
  
  CADASTRO_SENSORES_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo', 'modelo', 'fabricante', 'latitude', 'longitude', 'altitude', 'data_instalacao', 'intervalo_leitura_min', 'status', 'bateria_pct', 'ultima_leitura', 'responsavel'],
    color: '#2196F3',
    description: 'Cadastro geral de sensores'
  },
  
  SENSORES_QUALIDADE_AR_RA: {
    headers: ['id', 'timestamp', 'sensor_id', 'pm25', 'pm10', 'co2', 'co', 'no2', 'o3', 'temperatura', 'umidade', 'iqa', 'classificacao'],
    color: '#03A9F4',
    description: 'Leituras de qualidade do ar'
  },
  
  SENSORES_UMIDADE_SOLO_RA: {
    headers: ['id', 'timestamp', 'sensor_id', 'umidade_pct', 'temperatura_solo', 'condutividade', 'profundidade_cm', 'status'],
    color: '#00BCD4',
    description: 'Leituras de umidade do solo'
  },
  
  CADASTRO_SENSORES_SOLO_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo', 'latitude', 'longitude', 'profundidade_cm', 'tipo_solo', 'parcela_id', 'data_instalacao', 'status'],
    color: '#009688',
    description: 'Cadastro de sensores de solo'
  },
  
  CADASTRO_SENSORES_AGUA_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo', 'latitude', 'longitude', 'corpo_hidrico', 'profundidade_m', 'data_instalacao', 'status'],
    color: '#4DD0E1',
    description: 'Cadastro de sensores de água'
  },
  
  ESTACAO_METEOROLOGICA_RA: {
    headers: ['id', 'timestamp', 'sensor_id', 'temperatura', 'umidade', 'pressao', 'precipitacao', 'vento_velocidade', 'vento_direcao', 'radiacao_solar', 'uv_index'],
    color: '#FFC107',
    description: 'Dados da estação meteorológica'
  },
  
  SENSORES_NIVEL_AGUA_RA: {
    headers: ['id', 'timestamp', 'sensor_id', 'nivel_cm', 'vazao_m3s', 'temperatura', 'status', 'alerta'],
    color: '#00BCD4',
    description: 'Leituras de nível de água'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIMA E EVENTOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  CLIMA_PREDICOES_RA: {
    headers: ['id', 'timestamp', 'data_predicao', 'horizonte_dias', 'temp_min', 'temp_max', 'precipitacao', 'umidade', 'vento', 'fonte', 'confianca'],
    color: '#FFC107',
    description: 'Predições climáticas'
  },
  
  EVENTOS_EXTREMOS_RA: {
    headers: ['id', 'timestamp', 'tipo_evento', 'data_inicio', 'data_fim', 'intensidade', 'area_afetada_ha', 'danos_descricao', 'acoes_tomadas', 'custo_estimado', 'responsavel'],
    color: '#FF5722',
    description: 'Registro de eventos extremos'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CARBONO E SERVIÇOS ECOSSISTÊMICOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  PARCELAS_CARBONO_RA: {
    headers: ['id', 'timestamp', 'nome', 'latitude', 'longitude', 'area_ha', 'tipo_vegetacao', 'idade_anos', 'metodologia', 'data_instalacao', 'responsavel'],
    color: '#4CAF50',
    description: 'Parcelas de monitoramento de carbono'
  },
  
  MEDICOES_CARBONO_RA: {
    headers: ['id', 'timestamp', 'parcela_id', 'data_medicao', 'biomassa_aerea_ton', 'biomassa_subterranea_ton', 'carbono_solo_ton', 'carbono_total_ton', 'co2_equivalente_ton', 'metodologia', 'responsavel'],
    color: '#66BB6A',
    description: 'Medições de carbono'
  },
  
  CREDITOS_CARBONO_RA: {
    headers: ['id', 'timestamp', 'parcela_id', 'periodo', 'creditos_gerados', 'creditos_vendidos', 'preco_unitario', 'valor_total', 'comprador', 'certificadora', 'status'],
    color: '#81C784',
    description: 'Créditos de carbono gerados'
  },
  
  SERVICOS_ECOSSISTEMICOS_RA: {
    headers: ['id', 'timestamp', 'tipo_servico', 'area_id', 'valor_estimado', 'metodologia', 'beneficiarios', 'indicadores_json', 'periodo', 'responsavel'],
    color: '#A5D6A7',
    description: 'Valoração de serviços ecossistêmicos'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DOENÇAS E MANEJO
  // ═══════════════════════════════════════════════════════════════════════════
  
  DOENCAS_PLANTAS_RA: {
    headers: ['id', 'timestamp', 'especie_afetada', 'local', 'latitude', 'longitude', 'sintomas', 'diagnostico', 'agente_causal', 'severidade', 'area_afetada', 'tratamento', 'status', 'foto_id', 'responsavel'],
    color: '#F44336',
    description: 'Registro de doenças em plantas'
  },
  
  PLANTIO_OTIMIZADO_RA: {
    headers: ['id', 'timestamp', 'parcela_id', 'especie_id', 'especie_nome', 'quantidade', 'espacamento_m', 'data_plantio', 'origem_muda', 'sobrevivencia_pct', 'crescimento_cm', 'status', 'responsavel'],
    color: '#8BC34A',
    description: 'Plantios otimizados'
  },
  
  RECOMENDACOES_MANEJO_RA: {
    headers: ['id', 'timestamp', 'area_id', 'tipo_recomendacao', 'prioridade', 'descricao', 'justificativa', 'prazo', 'custo_estimado', 'responsavel', 'status', 'data_execucao'],
    color: '#CDDC39',
    description: 'Recomendações de manejo'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRAÇÕES E DADOS EXTERNOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  INTEGRACOES_EXTERNAS_RA: {
    headers: ['id', 'timestamp', 'nome', 'tipo', 'url_base', 'api_key_ref', 'status', 'ultima_sincronizacao', 'frequencia', 'responsavel'],
    color: '#9C27B0',
    description: 'Integrações com sistemas externos'
  },
  
  DADOS_EXTERNOS_RA: {
    headers: ['id', 'timestamp', 'integracao_id', 'tipo_dado', 'data_referencia', 'dados_json', 'processado', 'erro'],
    color: '#AB47BC',
    description: 'Dados recebidos de integrações'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EDUCAÇÃO E GAMIFICAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  
  GAMIFICACAO_RA: {
    headers: ['id', 'timestamp', 'user_id', 'user_email', 'pontos', 'nivel', 'badges_json', 'conquistas_json', 'ranking_posicao', 'ultima_atividade'],
    color: '#FF9800',
    description: 'Sistema de gamificação'
  },
  
  EDUCACAO_AMBIENTAL_RA: {
    headers: ['id', 'timestamp', 'tipo_atividade', 'titulo', 'descricao', 'publico_alvo', 'data_realizacao', 'participantes', 'duracao_horas', 'local', 'responsavel', 'materiais', 'avaliacao_media', 'fotos_ids'],
    color: '#FFC107',
    description: 'Atividades de educação ambiental'
  },
  
  FEEDBACK_VISITANTES_RA: {
    headers: ['id', 'timestamp', 'visitante_id', 'tipo_feedback', 'categoria', 'mensagem', 'sentimento', 'nota', 'respondido', 'resposta', 'data_resposta'],
    color: '#FFEB3B',
    description: 'Feedback de visitantes'
  },
  
  CHATBOT_INTERACOES_RA: {
    headers: ['id', 'timestamp', 'session_id', 'user_id', 'mensagem_usuario', 'intent_detectado', 'resposta_bot', 'satisfacao', 'escalado_humano'],
    color: '#00BCD4',
    description: 'Interações com chatbot'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RELATÓRIOS E TREINAMENTO
  // ═══════════════════════════════════════════════════════════════════════════
  
  RELATORIOS_CIENTIFICOS_RA: {
    headers: ['id', 'timestamp', 'titulo', 'tipo', 'autores', 'resumo', 'periodo_dados', 'metodologia', 'resultados_principais', 'arquivo_id', 'status', 'publicado'],
    color: '#3F51B5',
    description: 'Relatórios científicos'
  },
  
  TREINAMENTO_RA: {
    headers: ['id', 'timestamp', 'titulo', 'tipo', 'descricao', 'instrutor', 'data_realizacao', 'duracao_horas', 'participantes_ids', 'materiais_ids', 'avaliacao_media', 'certificados_emitidos'],
    color: '#673AB7',
    description: 'Treinamentos realizados'
  },
  
  CERTIFICADOS_RA: {
    headers: ['id', 'timestamp', 'treinamento_id', 'participante_id', 'participante_nome', 'data_emissao', 'codigo_verificacao', 'arquivo_id', 'status'],
    color: '#7C4DFF',
    description: 'Certificados emitidos'
  },
  
  ROADMAP_RA: {
    headers: ['id', 'timestamp', 'titulo', 'descricao', 'categoria', 'prioridade', 'status', 'data_inicio_prevista', 'data_fim_prevista', 'data_conclusao', 'responsavel', 'dependencias'],
    color: '#536DFE',
    description: 'Roadmap do projeto'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LIMNOLOGIA (Intervenção 4/13)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Fitoplancton_RA: {
    headers: ['id', 'timestamp', 'data', 'hora', 'local', 'latitude', 'longitude', 'profundidade', 'metodo_coleta', 'volume_filtrado', 'rede_abertura', 'fixador', 'temperatura_agua', 'transparencia', 'divisao', 'classe', 'ordem', 'familia', 'genero', 'especie', 'abundancia', 'densidade', 'biovolume', 'clorofila_a', 'indice_shannon', 'indice_simpson', 'dominancia', 'responsavel', 'observacoes'],
    color: '#4CAF50',
    description: 'Amostragem de fitoplâncton'
  },
  
  Zooplancton_RA: {
    headers: ['id', 'timestamp', 'data', 'hora', 'local', 'latitude', 'longitude', 'profundidade', 'metodo_coleta', 'volume_filtrado', 'rede_abertura', 'fixador', 'temperatura_agua', 'grupo', 'ordem', 'familia', 'genero', 'especie', 'estagio', 'sexo', 'abundancia', 'densidade', 'biomassa', 'comprimento_medio', 'indice_shannon', 'riqueza', 'responsavel', 'observacoes'],
    color: '#00BCD4',
    description: 'Amostragem de zooplâncton'
  },
  
  Macrofitas_RA: {
    headers: ['id', 'timestamp', 'data', 'hora', 'local', 'latitude', 'longitude', 'tipo_ambiente', 'profundidade_max', 'forma_vida', 'familia', 'genero', 'especie', 'cobertura_pct', 'abundancia', 'biomassa_fresca', 'biomassa_seca', 'altura_media', 'fenologia', 'herbivoria', 'epifitas', 'substrato', 'transparencia', 'responsavel', 'observacoes'],
    color: '#8BC34A',
    description: 'Levantamento de macrófitas aquáticas'
  },
  
  Bentos_RA: {
    headers: ['id', 'timestamp', 'data', 'hora', 'local', 'latitude', 'longitude', 'profundidade', 'metodo_coleta', 'amostrador', 'area_amostrada', 'replicas', 'substrato', 'tipo_sedimento', 'materia_organica', 'grupo', 'ordem', 'familia', 'genero', 'especie', 'abundancia', 'densidade', 'biomassa', 'grupo_funcional', 'tolerancia', 'indice_bmwp', 'indice_ibb', 'indice_shannon', 'responsavel', 'observacoes'],
    color: '#795548',
    description: 'Amostragem de macroinvertebrados bentônicos'
  },
  
  Ictiofauna_RA: {
    headers: ['id', 'timestamp', 'data', 'hora_inicio', 'hora_fim', 'local', 'latitude', 'longitude', 'tipo_ambiente', 'metodo_captura', 'esforco_amostral', 'ordem', 'familia', 'genero', 'especie', 'nome_popular', 'quantidade', 'comprimento_total', 'comprimento_padrao', 'peso', 'sexo', 'estagio_maturacao', 'conteudo_estomacal', 'guilda_trofica', 'habitat_preferencial', 'status_conservacao', 'voucher', 'foto_id', 'responsavel', 'observacoes'],
    color: '#2196F3',
    description: 'Levantamento de ictiofauna'
  },
  
  Limnologia_RA: {
    headers: ['id', 'timestamp', 'data', 'local', 'latitude', 'longitude', 'tipo_coleta', 'profundidade', 'temperatura', 'ph', 'oxigenio_dissolvido', 'condutividade', 'turbidez', 'transparencia', 'clorofila_a', 'fitoplancton_dominante', 'zooplancton_dominante', 'macrofitas_presentes', 'bentos_dominante', 'peixes_observados', 'qualidade_geral', 'indice_estado_trofico', 'responsavel', 'observacoes'],
    color: '#00BCD4',
    description: 'Monitoramento limnológico integrado'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ALERTAS E NOTIFICAÇÕES (Intervenção 9/13)
  // ═══════════════════════════════════════════════════════════════════════════
  
  Alertas_RA: {
    headers: ['id', 'timestamp', 'severidade', 'nivel', 'titulo', 'descricao', 'modulo', 'local', 'data_coleta', 'status', 'reconhecido_por', 'reconhecido_em'],
    color: '#F44336',
    description: 'Alertas do sistema de monitoramento'
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE CRIAÇÃO E GERENCIAMENTO DE PLANILHAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtém status de todas as planilhas do sistema
 * @returns {Object} Status detalhado de cada planilha
 */
function getSheetStatus() {
  const ss = getSpreadsheet();
  const existingSheets = ss.getSheets().map(s => s.getName());
  
  const status = {
    timestamp: new Date().toISOString(),
    total_schemas: Object.keys(SHEET_SCHEMAS).length,
    total_config: Object.keys(CONFIG.SHEETS).length,
    existing: [],
    missing: [],
    extra: [],
    details: {}
  };
  
  // Verifica planilhas definidas nos schemas
  Object.keys(SHEET_SCHEMAS).forEach(sheetName => {
    if (existingSheets.includes(sheetName)) {
      status.existing.push(sheetName);
      const sheet = ss.getSheetByName(sheetName);
      status.details[sheetName] = {
        exists: true,
        rows: sheet.getLastRow(),
        cols: sheet.getLastColumn(),
        hasHeaders: sheet.getLastRow() > 0
      };
    } else {
      status.missing.push(sheetName);
      status.details[sheetName] = { exists: false };
    }
  });
  
  // Verifica planilhas extras (existem mas não estão nos schemas)
  existingSheets.forEach(name => {
    if (!SHEET_SCHEMAS[name] && !name.startsWith('_')) {
      status.extra.push(name);
    }
  });
  
  status.summary = {
    existing_count: status.existing.length,
    missing_count: status.missing.length,
    extra_count: status.extra.length,
    completion_pct: Math.round((status.existing.length / Object.keys(SHEET_SCHEMAS).length) * 100)
  };
  
  return status;
}

/**
 * Cria uma planilha com headers e formatação
 * @param {string} sheetName - Nome da planilha
 * @param {boolean} force - Se true, recria mesmo se existir
 * @returns {Object} Resultado da criação
 */
function createSheetWithSchema(sheetName, force) {
  force = force || false;
  const schema = SHEET_SCHEMAS[sheetName];
  if (!schema) {
    return { success: false, error: 'Schema não encontrado para: ' + sheetName };
  }
  
  try {
    const ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // Se existe e não é forçado, apenas valida
    if (sheet && !force) {
      return { 
        success: true, 
        message: 'Planilha já existe', 
        sheetName: sheetName, 
        action: 'skipped',
        rows: sheet.getLastRow()
      };
    }
    
    // Remove se existir e for forçado
    if (sheet && force) {
      ss.deleteSheet(sheet);
    }
    
    // Cria nova planilha
    sheet = ss.insertSheet(sheetName);
    
    // Adiciona headers
    var headerRange = sheet.getRange(1, 1, 1, schema.headers.length);
    headerRange.setValues([schema.headers]);
    
    // Formata headers
    headerRange
      .setBackground(schema.color || '#4285F4')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Congela primeira linha
    sheet.setFrozenRows(1);
    
    // Ajusta largura das colunas
    for (var i = 0; i < schema.headers.length; i++) {
      var header = schema.headers[i];
      var width = header.length > 15 ? 180 : (header.length > 10 ? 140 : 100);
      sheet.setColumnWidth(i + 1, width);
    }
    
    // Adiciona nota com descrição
    if (schema.description) {
      sheet.getRange(1, 1).setNote('📋 ' + schema.description + '\n\nCriado em: ' + new Date().toLocaleString('pt-BR'));
    }
    
    Logger.log('✓ Criada: ' + sheetName + ' (' + schema.headers.length + ' colunas)');
    
    return { 
      success: true, 
      sheetName: sheetName, 
      action: 'created',
      columns: schema.headers.length,
      description: schema.description
    };
    
  } catch (error) {
    Logger.log('✗ Erro ao criar ' + sheetName + ': ' + error);
    return { success: false, sheetName: sheetName, error: error.toString() };
  }
}


/**
 * Cria todas as planilhas faltantes
 * @param {boolean} dryRun - Se true, apenas lista sem criar
 * @returns {Object} Resultado da operação
 */
function createMissingSheets(dryRun) {
  dryRun = dryRun || false;
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🚀 INTERVENÇÃO 3/13: CRIAÇÃO DE PLANILHAS FALTANTES');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  var status = getSheetStatus();
  var results = {
    timestamp: new Date().toISOString(),
    dryRun: dryRun,
    missing_count: status.missing.length,
    created: [],
    skipped: [],
    errors: []
  };
  
  if (status.missing.length === 0) {
    Logger.log('✓ Todas as planilhas já existem!');
    return { success: true, message: 'Nenhuma planilha faltante', results: results };
  }
  
  Logger.log('📋 Planilhas faltantes: ' + status.missing.length);
  Logger.log('   ' + status.missing.join(', ') + '\n');
  
  if (dryRun) {
    Logger.log('🔍 Modo DRY RUN - nenhuma planilha será criada');
    results.would_create = status.missing;
    return { success: true, dryRun: true, results: results };
  }
  
  // Cria cada planilha faltante
  for (var i = 0; i < status.missing.length; i++) {
    var sheetName = status.missing[i];
    Logger.log('[' + (i + 1) + '/' + status.missing.length + '] Criando ' + sheetName + '...');
    
    var result = createSheetWithSchema(sheetName);
    
    if (result.success) {
      if (result.action === 'created') {
        results.created.push(sheetName);
      } else {
        results.skipped.push(sheetName);
      }
    } else {
      results.errors.push({ sheet: sheetName, error: result.error });
    }
    
    // Pausa para evitar rate limiting
    if (i > 0 && i % 10 === 0) {
      Utilities.sleep(1000);
    }
  }
  
  // Resumo
  Logger.log('\n═══════════════════════════════════════════════════════════');
  Logger.log('📊 RESUMO DA CRIAÇÃO');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('✓ Criadas: ' + results.created.length);
  Logger.log('⏭ Ignoradas: ' + results.skipped.length);
  Logger.log('✗ Erros: ' + results.errors.length);
  
  if (results.errors.length > 0) {
    Logger.log('\n⚠ Erros encontrados:');
    for (var j = 0; j < results.errors.length; j++) {
      Logger.log('  - ' + results.errors[j].sheet + ': ' + results.errors[j].error);
    }
  }
  
  return { success: results.errors.length === 0, results: results };
}

/**
 * Valida integridade das planilhas existentes
 * @returns {Object} Resultado da validação
 */
function validateSheetIntegrity() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🔍 VALIDAÇÃO DE INTEGRIDADE DAS PLANILHAS');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  var ss = getSpreadsheet();
  var results = {
    timestamp: new Date().toISOString(),
    valid: [],
    invalid: [],
    warnings: []
  };
  
  var schemaNames = Object.keys(SHEET_SCHEMAS);
  for (var i = 0; i < schemaNames.length; i++) {
    var sheetName = schemaNames[i];
    var schema = SHEET_SCHEMAS[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      results.invalid.push({
        sheet: sheetName,
        issue: 'Planilha não existe',
        severity: 'critical'
      });
      continue;
    }
    
    // Verifica headers
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      results.invalid.push({
        sheet: sheetName,
        issue: 'Planilha vazia (sem headers)',
        severity: 'high'
      });
      continue;
    }
    
    var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var expectedHeaders = schema.headers;
    
    // Compara headers
    var missingHeaders = expectedHeaders.filter(function(h) { return currentHeaders.indexOf(h) === -1; });
    var extraHeaders = currentHeaders.filter(function(h) { return expectedHeaders.indexOf(h) === -1 && h !== ''; });
    
    if (missingHeaders.length > 0) {
      results.invalid.push({
        sheet: sheetName,
        issue: 'Headers faltando: ' + missingHeaders.join(', '),
        severity: 'high',
        missing: missingHeaders
      });
    } else if (extraHeaders.length > 0) {
      results.warnings.push({
        sheet: sheetName,
        issue: 'Headers extras: ' + extraHeaders.join(', '),
        severity: 'low',
        extra: extraHeaders
      });
      results.valid.push(sheetName);
    } else {
      results.valid.push(sheetName);
    }
  }
  
  // Resumo
  Logger.log('✓ Válidas: ' + results.valid.length);
  Logger.log('✗ Inválidas: ' + results.invalid.length);
  Logger.log('⚠ Avisos: ' + results.warnings.length);
  
  results.summary = {
    total: Object.keys(SHEET_SCHEMAS).length,
    valid_count: results.valid.length,
    invalid_count: results.invalid.length,
    warning_count: results.warnings.length,
    integrity_pct: Math.round((results.valid.length / Object.keys(SHEET_SCHEMAS).length) * 100)
  };
  
  return results;
}


/**
 * Repara headers de uma planilha específica
 * @param {string} sheetName - Nome da planilha
 * @returns {Object} Resultado do reparo
 */
function repairSheetHeaders(sheetName) {
  var schema = SHEET_SCHEMAS[sheetName];
  if (!schema) {
    return { success: false, error: 'Schema não encontrado: ' + sheetName };
  }
  
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createSheetWithSchema(sheetName);
    }
    
    // Backup dos dados existentes
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var existingData = [];
    var existingHeaders = [];
    
    if (lastRow > 0 && lastCol > 0) {
      existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      if (lastRow > 1) {
        existingData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      }
    }
    
    // Limpa e recria headers
    sheet.clear();
    var headerRange = sheet.getRange(1, 1, 1, schema.headers.length);
    headerRange.setValues([schema.headers]);
    headerRange
      .setBackground(schema.color || '#4285F4')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    sheet.setFrozenRows(1);
    
    // Tenta restaurar dados mapeando colunas
    if (existingData.length > 0) {
      var mappedData = existingData.map(function(row) {
        return schema.headers.map(function(header) {
          var oldIndex = existingHeaders.indexOf(header);
          return oldIndex >= 0 ? row[oldIndex] : '';
        });
      });
      
      if (mappedData.length > 0) {
        sheet.getRange(2, 1, mappedData.length, schema.headers.length).setValues(mappedData);
      }
    }
    
    Logger.log('✓ Reparada: ' + sheetName);
    return { 
      success: true, 
      sheetName: sheetName, 
      action: 'repaired',
      rows_preserved: existingData.length
    };
    
  } catch (error) {
    return { success: false, sheetName: sheetName, error: error.toString() };
  }
}

/**
 * Executa criação completa das planilhas faltantes
 * Função principal para Intervenção 3/13
 */
function executarIntervencao3() {
  Logger.log('\n');
  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║     INTERVENÇÃO 3/13 - CRIAÇÃO DE PLANILHAS FALTANTES     ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // 1. Status inicial
  Logger.log('📊 STATUS INICIAL:');
  var statusInicial = getSheetStatus();
  Logger.log('   Total de schemas: ' + statusInicial.total_schemas);
  Logger.log('   Existentes: ' + statusInicial.summary.existing_count);
  Logger.log('   Faltantes: ' + statusInicial.summary.missing_count);
  Logger.log('   Completude: ' + statusInicial.summary.completion_pct + '%\n');
  
  // 2. Criar planilhas faltantes
  var createResult = createMissingSheets(false);
  
  // 3. Validar integridade
  Logger.log('\n📋 VALIDANDO INTEGRIDADE...');
  var validationResult = validateSheetIntegrity();
  
  // 4. Status final
  Logger.log('\n📊 STATUS FINAL:');
  var statusFinal = getSheetStatus();
  Logger.log('   Existentes: ' + statusFinal.summary.existing_count);
  Logger.log('   Faltantes: ' + statusFinal.summary.missing_count);
  Logger.log('   Completude: ' + statusFinal.summary.completion_pct + '%');
  Logger.log('   Integridade: ' + validationResult.summary.integrity_pct + '%');
  
  return {
    success: createResult.results.errors.length === 0,
    statusInicial: statusInicial.summary,
    statusFinal: statusFinal.summary,
    created: createResult.results.created,
    errors: createResult.results.errors,
    validation: validationResult.summary
  };
}

/**
 * Lista todas as planilhas com seus schemas (para documentação)
 */
function listAllSheetSchemas() {
  var schemas = [];
  var schemaNames = Object.keys(SHEET_SCHEMAS);
  
  for (var i = 0; i < schemaNames.length; i++) {
    var name = schemaNames[i];
    var schema = SHEET_SCHEMAS[name];
    schemas.push({
      name: name,
      columns: schema.headers.length,
      headers: schema.headers.join(', '),
      color: schema.color,
      description: schema.description
    });
  }
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('📋 SCHEMAS DE PLANILHAS DO SISTEMA');
  Logger.log('═══════════════════════════════════════════════════════════\n');
  
  for (var j = 0; j < schemas.length; j++) {
    var s = schemas[j];
    Logger.log('📄 ' + s.name);
    Logger.log('   Descrição: ' + s.description);
    Logger.log('   Colunas (' + s.columns + '): ' + s.headers);
    Logger.log('');
  }
  
  return schemas;
}
