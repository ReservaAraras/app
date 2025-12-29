/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTE DAS CORREÇÕES DE ALTA PRIORIDADE
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Testa as 2 correções de ALTA prioridade
 */
function testarCorrecoesAlta() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔴 TESTANDO CORREÇÕES DE ALTA PRIORIDADE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const resultados = {
    terapia: testarTerapiaCRUD(),
    gpx: testarExportacaoGPX()
  };
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Terapia CRUD:', resultados.terapia.success ? 'PASSOU' : 'FALHOU');
  console.log('✅ Exportação GPX:', resultados.gpx.success ? 'PASSOU' : 'FALHOU');
  
  const total = Object.values(resultados).filter(r => r.success).length;
  const taxa = (total / 2 * 100).toFixed(1);
  
  console.log('\n📈 Taxa de Sucesso:', taxa + '%');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  return {
    success: total === 2,
    taxa: taxa,
    detalhes: resultados
  };
}

/**
 * Teste 1: Terapia CRUD Completo
 */
function testarTerapiaCRUD() {
  console.log('🧪 TESTE 1: Terapia CRUD');
  console.log('─────────────────────────────────────────────────────────');
  
  let participanteId = null;
  
  try {
    // CREATE
    console.log('  📝 CREATE: Criando participante...');
    const created = createParticipanteTerapia({
      nome: 'Teste Correção',
      data_nascimento: '1990-01-01',
      idade: 35,
      genero: 'M',
      email_contato: 'teste.correcao@email.com',
      telefone: '(61) 99999-9999',
      condicao_principal: 'teste_alta_prioridade'
    });
    
    if (!created.success) {
      throw new Error('CREATE falhou: ' + created.error);
    }
    
    participanteId = created.id;
    console.log('  ✅ Participante criado:', participanteId);
    
    // READ BY ID (função que estava faltando)
    console.log('  📖 READ: Testando readParticipanteTerapiaById...');
    const read = readParticipanteTerapiaById(participanteId);
    
    if (!read.success) {
      throw new Error('READ falhou: ' + read.error);
    }
    
    if (!read.data || read.data.id !== participanteId) {
      throw new Error('READ retornou dados incorretos');
    }
    
    console.log('  ✅ Participante lido com sucesso');
    
    // UPDATE (função que estava faltando)
    console.log('  ✏️  UPDATE: Testando updateParticipanteTerapia...');
    const updated = updateParticipanteTerapia(participanteId, {
      condicao_principal: 'teste_atualizado'
    });
    
    if (!updated.success) {
      throw new Error('UPDATE falhou: ' + updated.error);
    }
    
    console.log('  ✅ Participante atualizado');
    
    // Verificar atualização
    const readUpdated = readParticipanteTerapiaById(participanteId);
    if (!readUpdated.success) {
      throw new Error('Falha ao ler participante atualizado: ' + readUpdated.error);
    }
    if (readUpdated.data.condicao_principal !== 'teste_atualizado') {
      throw new Error('UPDATE não foi aplicado corretamente. Valor atual: ' + readUpdated.data.condicao_principal);
    }
    
    console.log('  ✅ Atualização verificada');
    
    // DELETE
    console.log('  🗑️  DELETE: Testando deleteParticipanteTerapia...');
    const deleted = deleteParticipanteTerapia(participanteId);
    
    if (!deleted.success) {
      throw new Error('DELETE falhou: ' + deleted.error);
    }
    
    console.log('  ✅ Participante deletado');
    
    // Verificar deleção
    const readDeleted = readParticipanteTerapiaById(participanteId);
    if (readDeleted.success && readDeleted.data) {
      throw new Error('DELETE não removeu o registro');
    }
    
    console.log('  ✅ Deleção verificada');
    console.log('  🎉 Teste de Terapia CRUD: PASSOU!\n');
    
    return { success: true };
    
  } catch (error) {
    console.log('  ❌ Teste de Terapia CRUD: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    
    // Limpar se necessário
    if (participanteId) {
      try {
        deleteParticipanteTerapia(participanteId);
      } catch (e) {
        // Ignorar erro de limpeza
      }
    }
    
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste 2: Exportação GPX
 */
function testarExportacaoGPX() {
  console.log('🧪 TESTE 2: Exportação GPX');
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    console.log('  📍 Verificando waypoints disponíveis...');
    
    // Verificar se há waypoints
    const waypoints = readWaypoints();
    if (!waypoints.success || !waypoints.data || waypoints.data.length === 0) {
      console.log('  ⚠️  Nenhum waypoint encontrado, criando um para teste...');
      
      const created = createWaypoint({
        nome: 'Teste GPX',
        latitude: -15.7801,
        longitude: -47.9292,
        categoria: 'teste',
        descricao: 'Waypoint para teste de exportação GPX'
      });
      
      if (!created.success) {
        throw new Error('Não foi possível criar waypoint de teste');
      }
      
      console.log('  ✅ Waypoint de teste criado');
    } else {
      console.log('  ✅ Encontrados', waypoints.data.length, 'waypoints');
    }
    
    // Testar exportação GPX
    console.log('  📤 Exportando GPX...');
    const result = MobileOptimization.exportGPXOptimized();
    
    if (!result.success) {
      throw new Error('Exportação GPX falhou: ' + result.error);
    }
    
    console.log('  ✅ GPX exportado com sucesso');
    console.log('  📄 Arquivo:', result.filename);
    console.log('  📊 Tamanho:', result.size, 'bytes');
    console.log('  📍 Pontos:', result.points);
    
    // Verificar se o GPX foi gerado
    if (!result.gpx || result.gpx.length === 0) {
      throw new Error('GPX vazio');
    }
    
    console.log('  ✅ Conteúdo GPX válido');
    
    // Verificar se a URL de download foi criada (pode ser null se não configurado)
    if (result.downloadUrl) {
      console.log('  ✅ URL de download criada');
      console.log('  🔗', result.downloadUrl);
    } else {
      console.log('  ⚠️  URL de download não criada (DRIVE_FOLDER_ID pode não estar configurado)');
    }
    
    console.log('  🎉 Teste de Exportação GPX: PASSOU!\n');
    
    return { success: true, result: result };
    
  } catch (error) {
    console.log('  ❌ Teste de Exportação GPX: FALHOU');
    console.log('  Erro:', error.toString() + '\n');
    
    return { success: false, error: error.toString() };
  }
}

/**
 * Teste rápido individual - Terapia
 */
function testeRapidoTerapia() {
  return testarTerapiaCRUD();
}

/**
 * Teste rápido individual - GPX
 */
function testeRapidoGPX() {
  return testarExportacaoGPX();
}
