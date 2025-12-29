/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEARCH SERVICE - Busca Inteligente e Rápida
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema de busca unificada com ranking de relevância
 *
 * IMPACTO: Alto | CUSTO: Baixo
 */

const SearchService = {

  /**
   * Busca global (waypoints, fotos, trilhas, observações)
   */
  globalSearch(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        return { success: false, error: 'Query muito curta (mínimo 2 caracteres)' };
      }

      const q = query.toLowerCase().trim();
      const maxResults = options.maxResults || 50;

      const results = {
        waypoints: [],
        fotos: [],
        trilhas: [],
        observacoes: [],
        total: 0
      };

      if (!options.type || options.type === 'waypoints') {
        const waypoints = DatabaseService.read(CONFIG.SHEETS.WAYPOINTS);
        if (waypoints.success) {
          results.waypoints = this.searchInData(waypoints.data, q, ['nome', 'descricao', 'categoria', 'observacoes']);
        }
      }

      if (!options.type || options.type === 'fotos') {
        const fotos = DatabaseService.read(CONFIG.SHEETS.FOTOS);
        if (fotos.success) {
          results.fotos = this.searchInData(fotos.data, q, ['nome_arquivo', 'descricao', 'categoria', 'tags']);
        }
      }

      if (!options.type || options.type === 'trilhas') {
        const trilhas = DatabaseService.read(CONFIG.SHEETS.TRILHAS);
        if (trilhas.success) {
          results.trilhas = this.searchInData(trilhas.data, q, ['nome', 'descricao', 'tipo']);
        }
      }

      if (!options.type || options.type === 'observacoes') {
        const obs = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);
        if (obs.success) {
          results.observacoes = this.searchInData(obs.data, q, ['especie_cientifica', 'especie_comum', 'observacoes']);
        }
      }

      // Calcula total
      results.total = results.waypoints.length + results.fotos.length +
                      results.trilhas.length + results.observacoes.length;

      // Limita resultados
      if (results.total > maxResults) {
        const perType = Math.ceil(maxResults / 4);
        results.waypoints = results.waypoints.slice(0, perType);
        results.fotos = results.fotos.slice(0, perType);
        results.trilhas = results.trilhas.slice(0, perType);
        results.observacoes = results.observacoes.slice(0, perType);
      }

      return {
        success: true,
        query: query,
        results: results,
        total: results.total
      };

    } catch (error) {
      Utils.logError('SearchService.globalSearch', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Busca em array de dados
   */
  searchInData(data, query, fields) {
    return data.filter(item => {
      return fields.some(field => {
        const value = (item[field] || '').toString().toLowerCase();
        return value.includes(query);
      });
    }).map(item => {
      // Calcula score de relevância
      let score = 0;
      fields.forEach(field => {
        const value = (item[field] || '').toString().toLowerCase();
        if (value === query) score += 10; // Match exato
        else if (value.startsWith(query)) score += 5; // Começa com
        else if (value.includes(query)) score += 1; // Contém
      });
      return { ...item, _searchScore: score };
    }).sort((a, b) => b._searchScore - a._searchScore);
  },

  /**
   * Busca por proximidade geográfica
   */
  searchNearby(latitude, longitude, radiusKm = 1, type = null) {
    try {
      const results = {
        waypoints: [],
        observacoes: [],
        total: 0
      };

      if (!type || type === 'waypoints') {
        const nearby = GPSService.findNearbyWaypoints(latitude, longitude, radiusKm);
        if (nearby.success) {
          results.waypoints = nearby.data;
        }
      }

      if (!type || type === 'observacoes') {
        const obs = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);
        if (obs.success) {
          results.observacoes = obs.data.filter(o => {
            if (!o.latitude || !o.longitude) return false;
            const distance = GPSService.calculateDistance(
              latitude, longitude,
              parseFloat(o.latitude), parseFloat(o.longitude)
            );
            return distance <= radiusKm;
          }).map(o => {
            const distance = GPSService.calculateDistance(
              latitude, longitude,
              parseFloat(o.latitude), parseFloat(o.longitude)
            );
            return { ...o, distancia_km: distance.toFixed(2) };
          }).sort((a, b) => parseFloat(a.distancia_km) - parseFloat(b.distancia_km));
        }
      }

      results.total = results.waypoints.length + results.observacoes.length;

      return {
        success: true,
        center: { latitude, longitude },
        radius_km: radiusKm,
        results: results,
        total: results.total
      };

    } catch (error) {
      Utils.logError('SearchService.searchNearby', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Busca por data
   */
  searchByDate(startDate, endDate, type = null) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const results = {
        waypoints: [],
        fotos: [],
        observacoes: [],
        total: 0
      };

      if (!type || type === 'waypoints') {
        const waypoints = DatabaseService.read('Waypoints');
        if (waypoints.success) {
          results.waypoints = waypoints.data.filter(w => {
            const date = new Date(w.data_criacao);
            return date >= start && date <= end;
          });
        }
      }

      if (!type || type === 'fotos') {
        const fotos = DatabaseService.read('Fotos');
        if (fotos.success) {
          results.fotos = fotos.data.filter(f => {
            const date = new Date(f.data_upload);
            return date >= start && date <= end;
          });
        }
      }

      if (!type || type === 'observacoes') {
        const obs = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);
        if (obs.success) {
          results.observacoes = obs.data.filter(o => {
            const date = new Date(o.data_observacao);
            return date >= start && date <= end;
          });
        }
      }

      results.total = results.waypoints.length + results.fotos.length + results.observacoes.length;

      return {
        success: true,
        period: { start: startDate, end: endDate },
        results: results,
        total: results.total
      };

    } catch (error) {
      Utils.logError('SearchService.searchByDate', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Sugestões de busca (autocomplete)
   */
  getSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const q = query.toLowerCase();
      const suggestions = new Set();

      const waypoints = DatabaseService.read(CONFIG.SHEETS.WAYPOINTS);
      if (waypoints.success) {
        waypoints.data.forEach(w => {
          if (w.nome && w.nome.toLowerCase().includes(q)) {
            suggestions.add(w.nome);
          }
          if (w.categoria && w.categoria.toLowerCase().includes(q)) {
            suggestions.add(w.categoria);
          }
        });
      }

      const obs = DatabaseService.read(CONFIG.SHEETS.BIODIVERSIDADE);
      if (obs.success) {
        obs.data.forEach(o => {
          if (o.especie_comum && o.especie_comum.toLowerCase().includes(q)) {
            suggestions.add(o.especie_comum);
          }
          if (o.especie_cientifica && o.especie_cientifica.toLowerCase().includes(q)) {
            suggestions.add(o.especie_cientifica);
          }
        });
      }

      return {
        success: true,
        suggestions: Array.from(suggestions).slice(0, limit)
      };

    } catch (error) {
      Utils.logError('SearchService.getSuggestions', error);
      return { success: false, error: error.toString() };
    }
  }
};

// Funções expostas
function apiGlobalSearch(query, options) {
  return SearchService.globalSearch(query, options);
}

function apiSearchNearby(latitude, longitude, radiusKm, type) {
  return SearchService.searchNearby(latitude, longitude, radiusKm, type);
}

function apiSearchByDate(startDate, endDate, type) {
  return SearchService.searchByDate(startDate, endDate, type);
}

function apiGetSearchSuggestions(query, limit) {
  return SearchService.getSuggestions(query, limit);
}
