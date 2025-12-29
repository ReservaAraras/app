/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHOTO SERVICE - Gestão de Fotos com Google Drive
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo para upload, gestão e vinculação de fotos com waypoints
 * Nomenclatura inteligente: usuario_data_hora_categoria_descricao.jpg
 */

const PhotoService = {

  /**
   * Upload de foto para o Google Drive
   * @param {Blob} fileBlob - Arquivo da foto
   * @param {Object} metadata - Metadados da foto
   * @returns {Object} Resultado com ID e URL da foto
   */
  uploadPhoto(fileBlob, metadata) {
    try {
      if (!fileBlob) {
        return { success: false, error: 'Arquivo não fornecido' };
      }
      if (!metadata) {
        return { success: false, error: 'Metadados não fornecidos' };
      }
      
      // Usa pasta específica de fotos (PHOTOS_FOLDER_ID) ou fallback para DRIVE_FOLDER_ID
      const folderId = CONFIG.PHOTOS_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID;
      if (!folderId) {
        return { success: false, error: 'Pasta de fotos não configurada (PHOTOS_FOLDER_ID ou DRIVE_FOLDER_ID)' };
      }

      const folder = DriveApp.getFolderById(folderId);

      // Gera nome inteligente do arquivo
      const fileName = this.generatePhotoName(metadata);

      // Upload para o Drive
      const file = folder.createFile(fileBlob);
      file.setName(fileName);
      file.setDescription(metadata.descricao || '');

      // Torna público (opcional)
      if (metadata.publico) {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }

      // Salva metadados na planilha
      const photoData = {
        nome_arquivo: fileName,
        drive_id: file.getId(),
        drive_url: file.getUrl(),
        tipo: metadata.tipo || 'waypoint',
        categoria: metadata.categoria || 'geral',
        latitude: metadata.latitude || '',
        longitude: metadata.longitude || '',
        waypoint_id: metadata.waypoint_id || '',
        trilha_id: metadata.trilha_id || '',
        descricao: metadata.descricao || '',
        tags: metadata.tags || '',
        usuario: Session.getActiveUser().getEmail(),
        data_upload: new Date(),
        tamanho_bytes: fileBlob.getBytes().length,
        largura: metadata.largura || '',
        altura: metadata.altura || '',
        observacoes: metadata.observacoes || ''
      };

      const result = SheetsService.create(CONFIG.SHEETS.FOTOS, photoData);

      return {
        success: true,
        photoId: result.data.id,
        driveId: file.getId(),
        driveUrl: file.getUrl(),
        fileName: fileName,
        message: 'Foto enviada com sucesso'
      };

    } catch (error) {
      Utils.logError('PhotoService.uploadPhoto', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Gera nome inteligente para a foto
   * Formato: usuario_YYYYMMDD_HHMMSS_categoria_descricao.ext
   */
  generatePhotoName(metadata) {
    const now = new Date();
    const user = Session.getActiveUser().getEmail().split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    const dateTime = `${year}${month}${day}_${hour}${minute}${second}`;
    const categoria = (metadata.categoria || 'geral').replace(/[^a-zA-Z0-9]/g, '_');
    const descricao = (metadata.descricao || 'foto').substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');

    // Coordenadas se disponíveis
    let coords = '';
    if (metadata.latitude && metadata.longitude) {
      const lat = parseFloat(metadata.latitude).toFixed(4).replace('.', '').replace('-', 'S');
      const lon = parseFloat(metadata.longitude).toFixed(4).replace('.', '').replace('-', 'W');
      coords = `_${lat}_${lon}`;
    }

    const ext = metadata.extensao || 'jpg';

    return `${user}_${dateTime}_${categoria}_${descricao}${coords}.${ext}`;
  },

  /**
   * Upload múltiplo de fotos
   */
  uploadMultiplePhotos(files, commonMetadata) {
    try {
      const results = [];

      files.forEach((file, index) => {
        const metadata = {
          ...commonMetadata,
          descricao: `${commonMetadata.descricao || 'foto'}_${index + 1}`
        };

        const result = this.uploadPhoto(file, metadata);
        results.push(result);
      });

      const successful = results.filter(r => r.success).length;

      return {
        success: true,
        total: files.length,
        successful: successful,
        failed: files.length - successful,
        results: results
      };

    } catch (error) {
      Utils.logError('PhotoService.uploadMultiplePhotos', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Vincula foto a um waypoint
   */
  linkPhotoToWaypoint(photoId, waypointId) {
    try {
      SheetsService.update(CONFIG.SHEETS.FOTOS, photoId, { waypoint_id: waypointId });

      const waypoint = SheetsService.read(CONFIG.SHEETS.WAYPOINTS, { filter: { id: waypointId } });
      if (waypoint.success && waypoint.data.length > 0) {
        const currentPhotos = waypoint.data[0].foto_ids || '';
        const photoIds = currentPhotos ? currentPhotos.split(',') : [];
        if (!photoIds.includes(photoId)) {
          photoIds.push(photoId);
          SheetsService.update(CONFIG.SHEETS.WAYPOINTS, waypointId, { foto_ids: photoIds.join(',') });
        }
      }

      return { success: true, message: 'Foto vinculada ao waypoint' };

    } catch (error) {
      Utils.logError('PhotoService.linkPhotoToWaypoint', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém fotos de um waypoint
   */
  getWaypointPhotos(waypointId) {
    try {
      const photos = SheetsService.read(CONFIG.SHEETS.FOTOS, { filter: { waypoint_id: waypointId } });
      return photos;
    } catch (error) {
      Utils.logError('PhotoService.getWaypointPhotos', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém fotos de uma trilha
   */
  getTrailPhotos(trilhaId) {
    try {
      const photos = SheetsService.read(CONFIG.SHEETS.FOTOS, { filter: { trilha_id: trilhaId } });
      return photos;
    } catch (error) {
      Utils.logError('PhotoService.getTrailPhotos', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Deleta foto (do Drive e da planilha)
   */
  deletePhoto(photoId) {
    try {
      const photo = SheetsService.read(CONFIG.SHEETS.FOTOS, { filter: { id: photoId } });
      if (!photo.success || photo.data.length === 0) {
        return { success: false, error: 'Foto não encontrada' };
      }

      const photoData = photo.data[0];

      try {
        const file = DriveApp.getFileById(photoData.drive_id);
        file.setTrashed(true);
      } catch (e) {
        Logger.log('Erro ao deletar do Drive: ' + e);
      }

      SheetsService.delete(CONFIG.SHEETS.FOTOS, photoId);

      return { success: true, message: 'Foto deletada' };

    } catch (error) {
      Utils.logError('PhotoService.deletePhoto', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Busca fotos por categoria
   */
  searchByCategory(categoria) {
    try {
      return SheetsService.read(CONFIG.SHEETS.FOTOS, { filter: { categoria: categoria } });
    } catch (error) {
      Utils.logError('PhotoService.searchByCategory', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Busca fotos por tags
   */
  searchByTags(tags) {
    try {
      const allPhotos = SheetsService.read(CONFIG.SHEETS.FOTOS);
      if (!allPhotos.success) return allPhotos;

      const filtered = allPhotos.data.filter(photo => {
        const photoTags = (photo.tags || '').toLowerCase();
        return tags.some(tag => photoTags.includes(tag.toLowerCase()));
      });

      return { success: true, data: filtered, count: filtered.length };

    } catch (error) {
      Utils.logError('PhotoService.searchByTags', error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * Obtém estatísticas de fotos
   */
  getPhotoStats() {
    try {
      const photos = SheetsService.read(CONFIG.SHEETS.FOTOS);
      if (!photos.success) return photos;

      const stats = {
        total: photos.data.length,
        porCategoria: {},
        porUsuario: {},
        tamanhoTotal: 0,
        maisRecentes: []
      };

      photos.data.forEach(photo => {
        // Por categoria
        const cat = photo.categoria || 'sem_categoria';
        stats.porCategoria[cat] = (stats.porCategoria[cat] || 0) + 1;

        // Por usuário
        const user = photo.usuario || 'desconhecido';
        stats.porUsuario[user] = (stats.porUsuario[user] || 0) + 1;

        // Tamanho total
        stats.tamanhoTotal += parseInt(photo.tamanho_bytes || 0);
      });

      // Mais recentes
      stats.maisRecentes = photos.data
        .sort((a, b) => new Date(b.data_upload) - new Date(a.data_upload))
        .slice(0, 10);

      return { success: true, stats: stats };

    } catch (error) {
      Utils.logError('PhotoService.getPhotoStats', error);
      return { success: false, error: error.toString() };
    }
  }
};

/**
 * Funções expostas para o frontend
 */
function apiUploadPhoto(fileBlob, metadata) {
  return PhotoService.uploadPhoto(fileBlob, metadata);
}

function apiLinkPhotoToWaypoint(photoId, waypointId) {
  return PhotoService.linkPhotoToWaypoint(photoId, waypointId);
}

function apiGetWaypointPhotos(waypointId) {
  return PhotoService.getWaypointPhotos(waypointId);
}

function apiGetTrailPhotos(trilhaId) {
  return PhotoService.getTrailPhotos(trilhaId);
}

function apiDeletePhoto(photoId) {
  return PhotoService.deletePhoto(photoId);
}

function apiGetPhotoStats() {
  return PhotoService.getPhotoStats();
}
