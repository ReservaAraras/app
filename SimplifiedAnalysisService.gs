/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SIMPLIFIED ANALYSIS SERVICE - Análises Otimizadas (Máx 7 Variáveis)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema otimizado para limites do Google Apps Script gratuito
 * Todas as análises limitadas a 7 variáveis/sujeitos/objetos
 *
 * PRINCÍPIO: Simplicidade + Eficiência = Melhor Performance
 */

const SimplifiedAnalysisService = {

  /**
   * ANÁLISE 1: Carbono Simplificado (5 variáveis)
   * Variáveis: tipo, área, idade, biomassa, co2
   */
  analyzeCarbonSimple(parcelaId) {
    try {
      const parcela = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO, { filter: { id: parcelaId } });
      if (!parcela.success || parcela.data.length === 0) {
        return { success: false, error: 'Parcela não encontrada' };
      }

      const p = parcela.data[0];

      // 5 VARIÁVEIS ESSENCIAIS
      const tipo = p.tipo_sistema || 'SAF_Cerrado';
      const area = parseFloat(p.area_ha) || 0;
      const idade = parseFloat(p.idade_anos) || 1;

      // Taxas simplificadas (5 tipos)
      const taxas = {
        'SAF_Cerrado': 8.5,
        'ILPF': 5.2,
        'Agrofloresta_Diversa': 12.3,
        'Recuperacao_Pastagem': 3.8,
        'Cerrado_Nativo': 2.5
      };

      const taxa = taxas[tipo] || 5.0;
      const biomassa = taxa * area * idade;
      const co2 = biomassa * 3.67;

      return {
        success: true,
        vars: {
          tipo,
          area: area.toFixed(2),
          idade,
          biomassa: biomassa.toFixed(2),
          co2: co2.toFixed(2)
        },
        resumo: `${tipo}: ${co2.toFixed(1)} tCO2e em ${area}ha`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeCarbonSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 2: Água Simplificada (6 variáveis)
   * Variáveis: pH, oxigenio, turbidez, temperatura, coliformes, iqa
   */
  analyzeWaterSimple(medicaoId) {
    try {
      const medicao = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_AGUA, { filter: { id: medicaoId } });
      if (!medicao.success || medicao.data.length === 0) {
        return { success: false, error: 'Medição não encontrada' };
      }

      const m = medicao.data[0];

      // 6 VARIÁVEIS ESSENCIAIS
      const pH = parseFloat(m.pH) || 7.0;
      const oxigenio = parseFloat(m.oxigenio_dissolvido) || 5.0;
      const turbidez = parseFloat(m.turbidez) || 50;
      const temperatura = parseFloat(m.temperatura) || 25;
      const coliformes = parseFloat(m.coliformes_termotolerantes) || 100;

      // IQA Simplificado
      let iqa = 100;
      if (pH < 6.0 || pH > 9.0) iqa -= 20;
      if (oxigenio < 5.0) iqa -= 20;
      if (turbidez > 100) iqa -= 15;
      if (coliformes > 1000) iqa -= 20;
      iqa = Math.max(0, iqa);

      const classificacao = iqa >= 80 ? 'Ótima' : iqa >= 52 ? 'Boa' : iqa >= 37 ? 'Aceitável' : 'Ruim';

      return {
        success: true,
        vars: {
          pH: pH.toFixed(1),
          oxigenio: oxigenio.toFixed(1),
          turbidez: turbidez.toFixed(0),
          temperatura: temperatura.toFixed(1),
          coliformes: coliformes.toFixed(0),
          iqa: iqa.toFixed(0)
        },
        classificacao,
        resumo: `IQA: ${iqa.toFixed(0)} (${classificacao})`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeWaterSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 3: Solo Simplificado (5 variáveis)
   * Variáveis: pH, materia_organica, fosforo, potassio, fertilidade
   */
  analyzeSoilSimple(medicaoId) {
    try {
      const medicao = DatabaseService.read(CONFIG.SHEETS.QUALIDADE_SOLO, { filter: { id: medicaoId } });
      if (!medicao.success || medicao.data.length === 0) {
        return { success: false, error: 'Medição não encontrada' };
      }

      const s = medicao.data[0];

      // 5 VARIÁVEIS ESSENCIAIS
      const pH = parseFloat(s.pH) || 6.0;
      const mo = parseFloat(s.materia_organica) || 2.0;
      const p = parseFloat(s.fosforo) || 10;
      const k = parseFloat(s.potassio) || 50;

      // Índice de Fertilidade Simplificado (0-100)
      let fertilidade = 0;
      if (pH >= 6.0 && pH <= 7.0) fertilidade += 25;
      if (mo >= 2.5) fertilidade += 25;
      if (p >= 15) fertilidade += 25;
      if (k >= 80) fertilidade += 25;

      const classificacao = fertilidade >= 75 ? 'Alta' : fertilidade >= 50 ? 'Média' : 'Baixa';

      return {
        success: true,
        vars: {
          pH: pH.toFixed(1),
          materia_organica: mo.toFixed(1),
          fosforo: p.toFixed(0),
          potassio: k.toFixed(0),
          fertilidade: fertilidade
        },
        classificacao,
        resumo: `Fertilidade: ${fertilidade} (${classificacao})`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeSoilSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 4: Clima Simplificado (5 variáveis)
   * Variáveis: temp_min, temp_max, precipitacao, umidade, dias
   */
  analyzeClimateSimple(dias = 7) {
    try {
      const result = DatabaseService.read(CONFIG.SHEETS.DADOS_CLIMA);
      if (!result.success || result.data.length === 0) {
        return { success: false, error: 'Sem dados climáticos' };
      }

      // Últimos N dias
      const dados = result.data.slice(-dias);

      // 5 VARIÁVEIS ESSENCIAIS
      const temps_min = dados.map(d => parseFloat(d.temperatura_min) || 0);
      const temps_max = dados.map(d => parseFloat(d.temperatura_max) || 0);
      const precips = dados.map(d => parseFloat(d.precipitacao) || 0);
      const umids = dados.map(d => parseFloat(d.umidade) || 0);

      const temp_min = Utils.average(temps_min);
      const temp_max = Utils.average(temps_max);
      const precipitacao = precips.reduce((a, b) => a + b, 0);
      const umidade = Utils.average(umids);

      return {
        success: true,
        vars: {
          temp_min: temp_min.toFixed(1),
          temp_max: temp_max.toFixed(1),
          precipitacao: precipitacao.toFixed(1),
          umidade: umidade.toFixed(0),
          dias: dias
        },
        resumo: `${dias} dias: ${temp_min.toFixed(1)}°C a ${temp_max.toFixed(1)}°C, ${precipitacao.toFixed(0)}mm`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeClimateSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 5: Bem-Estar Simplificado (5 variáveis)
   * Variáveis: ansiedade, depressao, estresse, bemestar, melhoria
   */
  analyzeWellbeingSimple(participanteId) {
    try {
      const avaliacoes = DatabaseService.read(CONFIG.SHEETS.AVALIACOES_TERAPIA,
        { filter: { participante_id: participanteId } });

      if (!avaliacoes.success || avaliacoes.data.length === 0) {
        return { success: false, error: 'Sem avaliações' };
      }

      const dados = avaliacoes.data.sort((a, b) => new Date(a.data) - new Date(b.data));
      const primeira = dados[0];
      const ultima = dados[dados.length - 1];

      // 5 VARIÁVEIS ESSENCIAIS
      const ansiedade = parseFloat(ultima.escala_ansiedade) || 0;
      const depressao = parseFloat(ultima.escala_depressao) || 0;
      const estresse = parseFloat(ultima.escala_estresse) || 0;
      const bemestar = parseFloat(ultima.escala_bemestar) || 0;

      // Melhoria (comparação primeira vs última)
      const ansiedade_inicial = parseFloat(primeira.escala_ansiedade) || 0;
      const melhoria = ansiedade_inicial - ansiedade;

      const status = melhoria > 2 ? 'Ótima' : melhoria > 0 ? 'Boa' : 'Estável';

      return {
        success: true,
        vars: {
          ansiedade: ansiedade.toFixed(1),
          depressao: depressao.toFixed(1),
          estresse: estresse.toFixed(1),
          bemestar: bemestar.toFixed(1),
          melhoria: melhoria.toFixed(1)
        },
        status,
        resumo: `Melhoria: ${melhoria.toFixed(1)} pontos (${status})`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeWellbeingSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 6: Ecoturismo Simplificado (4 variáveis)
   * Variáveis: visitantes, nota_media, nps, satisfacao
   */
  analyzeEcoturismSimple(periodo = 30) {
    try {
      const visitantes = DatabaseService.read(CONFIG.SHEETS.VISITANTES);
      const avaliacoes = DatabaseService.read(CONFIG.SHEETS.AVALIACOES);

      if (!visitantes.success || !avaliacoes.success) {
        return { success: false, error: 'Erro ao carregar dados' };
      }

      // Filtrar período
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - periodo);

      const visitas = visitantes.data.filter(v => new Date(v.data_visita) >= dataLimite);
      const notas = avaliacoes.data
        .filter(a => new Date(a.data) >= dataLimite)
        .map(a => parseFloat(a.nota) || 0);

      // 4 VARIÁVEIS ESSENCIAIS
      const total_visitantes = visitas.length;
      const nota_media = notas.length > 0 ? Utils.average(notas) : 0;

      // NPS Simplificado
      const promotores = notas.filter(n => n >= 9).length;
      const detratores = notas.filter(n => n < 7).length;
      const nps = notas.length > 0 ? ((promotores - detratores) / notas.length) * 100 : 0;

      const satisfacao = nota_media >= 8 ? 'Alta' : nota_media >= 6 ? 'Média' : 'Baixa';

      return {
        success: true,
        vars: {
          visitantes: total_visitantes,
          nota_media: nota_media.toFixed(1),
          nps: nps.toFixed(0),
          satisfacao
        },
        resumo: `${total_visitantes} visitantes, NPS: ${nps.toFixed(0)}`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeEcoturismSimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ANÁLISE 7: Biodiversidade Simplificada (6 variáveis)
   * Variáveis: especies_flora, especies_fauna, observacoes, riqueza, diversidade, status
   */
  analyzeBiodiversitySimple(areaId) {
    try {
      const obs = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE,
        { filter: { local: areaId } });

      if (!obs.success || obs.data.length === 0) {
        return { success: false, error: 'Sem observações' };
      }

      // 6 VARIÁVEIS ESSENCIAIS
      const flora = obs.data.filter(o => o.tipo_observacao === 'flora');
      const fauna = obs.data.filter(o => o.tipo_observacao === 'fauna');

      const especies_flora = new Set(flora.map(o => o.especie_cientifica)).size;
      const especies_fauna = new Set(fauna.map(o => o.especie_cientifica)).size;
      const observacoes = obs.data.length;
      const riqueza = especies_flora + especies_fauna;

      // Índice de Diversidade Simplificado (Shannon simplificado)
      const diversidade = Math.log(riqueza + 1) * 10;

      const status = riqueza >= 30 ? 'Alta' : riqueza >= 15 ? 'Média' : 'Baixa';

      return {
        success: true,
        vars: {
          especies_flora,
          especies_fauna,
          observacoes,
          riqueza,
          diversidade: diversidade.toFixed(1),
          status
        },
        resumo: `${riqueza} espécies (${status})`
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.analyzeBiodiversitySimple', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * DASHBOARD SIMPLIFICADO - Máximo 7 métricas principais
   */
  getDashboardSimple() {
    try {
      // 7 MÉTRICAS ESSENCIAIS
      const waypoints = DatabaseService.read(CONFIG.SHEETS.WAYPOINTS);
      const fotos = DatabaseService.read(CONFIG.SHEETS.FOTOS);
      const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
      const visitantes = DatabaseService.read(CONFIG.SHEETS.VISITANTES);
      const parcelas = DatabaseService.read(CONFIG.SHEETS.PARCELAS_AGRO);
      const participantes = DatabaseService.read(CONFIG.SHEETS.PARTICIPANTES);
      const observacoes = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);

      return {
        success: true,
        metricas: {
          waypoints: waypoints.success ? waypoints.data.length : 0,
          fotos: fotos.success ? fotos.data.length : 0,
          trilhas: trilhas.success ? trilhas.data.length : 0,
          visitantes: visitantes.success ? visitantes.data.length : 0,
          parcelas: parcelas.success ? parcelas.data.length : 0,
          participantes: participantes.success ? participantes.data.length : 0,
          observacoes: observacoes.success ? observacoes.data.length : 0
        }
      };
    } catch (error) {
      Utils.logError('SimplifiedAnalysisService.getDashboardSimple', error);
      return { success: false, error: error.toString() };
    }
  }
};

/**
 * Funções expostas para o frontend
 */
function apiAnalyzeCarbonSimple(parcelaId) {
  return SimplifiedAnalysisService.analyzeCarbonSimple(parcelaId);
}

function apiAnalyzeWaterSimple(medicaoId) {
  return SimplifiedAnalysisService.analyzeWaterSimple(medicaoId);
}

function apiAnalyzeSoilSimple(medicaoId) {
  return SimplifiedAnalysisService.analyzeSoilSimple(medicaoId);
}

function apiAnalyzeClimateSimple(dias) {
  return SimplifiedAnalysisService.analyzeClimateSimple(dias);
}

function apiAnalyzeWellbeingSimple(participanteId) {
  return SimplifiedAnalysisService.analyzeWellbeingSimple(participanteId);
}

function apiAnalyzeEcoturismSimple(periodo) {
  return SimplifiedAnalysisService.analyzeEcoturismSimple(periodo);
}

function apiAnalyzeBiodiversitySimple(areaId) {
  return SimplifiedAnalysisService.analyzeBiodiversitySimple(areaId);
}

function apiGetDashboardSimple() {
  return SimplifiedAnalysisService.getDashboardSimple();
}
