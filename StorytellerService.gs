/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STORYTELLER SERVICE - O Contador de Histórias do Cerrado
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Prompt 4 do documento: Narrativa cultural e folclórica.
 * 
 * Funcionalidades:
 * - Lendas e mitos do Cerrado
 * - Usos tradicionais indígenas e quilombolas
 * - Histórias das espécies locais
 * - Sabedoria ancestral sobre a natureza
 * - Conexão cultural com o território
 * 
 * @version 1.0.0
 * @date 2025-12-28
 */

/**
 * Serviço do Contador de Histórias
 * @namespace StorytellerService
 */
const StorytellerService = {

  BOT_NAME: 'Cauê',
  BOT_DESCRIPTION: 'O Contador de Histórias do Cerrado',
  
  /**
   * Configuração do bot
   */
  CONFIG: {
    temperature: 0.8,  // Alta criatividade para narrativas
    maxTokens: 800,
    persona: `Você é Cauê, um contador de histórias do Cerrado. 
Sua voz é calorosa, sábia e envolvente. Você conhece as lendas, 
os mitos e a sabedoria ancestral dos povos do Cerrado.
Use linguagem poética mas acessível. Inclua detalhes sensoriais.
Sempre conecte as histórias com lições sobre a natureza e a vida.`
  },

  /**
   * Biblioteca de Lendas do Cerrado
   */
  LEGENDS: {
    
    // ═══════════════════════════════════════════════════════════════════════
    // LENDAS DE ANIMAIS
    // ═══════════════════════════════════════════════════════════════════════
    
    lobo_guara: {
      id: 'lobo_guara',
      titulo: 'O Lobo-Guará e a Fruta do Amor',
      especie: 'Chrysocyon brachyurus',
      tipo: 'lenda',
      origem: 'Tradição oral do Cerrado',
      historia: `🐺 **O Lobo-Guará e a Fruta do Amor**

Conta a lenda que, há muito tempo, o Lobo-Guará era um animal comum, de pernas curtas como os outros canídeos. Vivia triste e solitário, pois não conseguia ver acima do capim alto do Cerrado para encontrar uma companheira.

Um dia, encontrou uma velha curandeira perdida na savana. Mesmo com fome, o lobo a guiou até sua aldeia, caminhando a noite toda. Em gratidão, a anciã lhe deu um presente:

*"Coma desta fruta todas as noites de lua cheia, e seu desejo mais profundo será atendido."*

Era a **lobeira** — a fruta-do-lobo.

O lobo comeu fielmente, e suas pernas começaram a crescer, longas e elegantes, até que ele pudesse ver por cima de todo o capim. Finalmente avistou sua companheira, do outro lado do campo.

Desde então, o Lobo-Guará come a lobeira não por fome, mas por gratidão. E dizem que quem come a fruta com o coração puro também encontra o amor verdadeiro.

🌿 *Por isso o Lobo-Guará é o maior dispersor de sementes da lobeira — ele planta amor por onde passa.*`,
      licao: 'A gratidão e a paciência transformam nossa natureza e nos conectam ao que buscamos.',
      elementos: ['lobeira', 'lua cheia', 'transformação', 'amor']
    },

    seriema: {
      id: 'seriema',
      titulo: 'A Seriema e o Segredo do Fogo',
      especie: 'Cariama cristata',
      tipo: 'mito',
      origem: 'Povos indígenas do Cerrado Central',
      historia: `🔥 **A Seriema e o Segredo do Fogo**

No tempo em que os animais falavam, apenas a Onça possuía o fogo. Ela o guardava com ciúme, e todos os outros animais comiam carne crua e tremiam de frio nas noites do Cerrado.

Os animais fizeram um conselho. Quem seria corajoso o bastante para roubar o fogo da Onça?

O Sapo tentou, mas era lento demais.
O Veado tentou, mas tinha medo demais.
O Gavião tentou, mas a Onça o viu chegando.

Então a Seriema se ofereceu. *"Eu não voo alto, mas corro rápido. E tenho um plano."*

A Seriema foi até a Onça e começou a cantar seu canto estridente ao amanhecer. A Onça, irritada, correu atrás dela. A Seriema corria em zigue-zague, sempre cantando, até que a Onça se cansou e dormiu.

Enquanto a Onça dormia, a Seriema pegou uma brasa com o bico e correu. Correu tanto que suas pernas ficaram longas e fortes. Quando a brasa queimou seu bico, ela a jogou para o Gavião, que a levou para todos os animais.

🦅 *Por isso a Seriema tem pernas tão fortes para correr, e canta ao amanhecer — ela ainda comemora a vitória sobre a Onça.*`,
      licao: 'A inteligência e a persistência vencem a força bruta. Cada um contribui com seus dons.',
      elementos: ['fogo', 'coragem', 'cooperação', 'amanhecer']
    },

    arara: {
      id: 'arara',
      titulo: 'As Araras e o Arco-Íris',
      especie: 'Ara ararauna',
      tipo: 'lenda',
      origem: 'Tradição Karajá',
      historia: `🌈 **As Araras e o Arco-Íris**

Dizem os Karajá que, no princípio, todas as araras eram brancas como nuvens. Viviam felizes, mas o mundo era cinzento e triste.

Um dia, o Grande Espírito decidiu pintar o céu após a chuva. Criou o arco-íris — faixas de cores que ninguém jamais tinha visto. As araras, curiosas, voaram até ele.

*"Podemos tocar?"* — perguntaram.

*"Podem"* — disse o Grande Espírito — *"mas as cores ficarão em vocês para sempre."*

As araras não se importaram. Mergulharam no arco-íris, rolando nas cores. Algumas se cobriram de azul e amarelo. Outras, de vermelho e verde. Algumas pegaram todas as cores de uma vez.

Quando voltaram à terra, o mundo inteiro se maravilhou. As araras tinham trazido as cores do céu para o Cerrado.

🦜 *Por isso as araras são tão coloridas — elas carregam pedaços do arco-íris. E por isso voam em casais: estão sempre buscando juntas o próximo arco-íris para visitar.*`,
      licao: 'A curiosidade e a coragem de tocar o desconhecido nos transformam e embelezam o mundo.',
      elementos: ['cores', 'arco-íris', 'curiosidade', 'transformação']
    },

    tamandua: {
      id: 'tamandua',
      titulo: 'O Tamanduá e a Paciência Infinita',
      especie: 'Myrmecophaga tridactyla',
      tipo: 'fábula',
      origem: 'Sabedoria popular do Cerrado',
      historia: `🐜 **O Tamanduá e a Paciência Infinita**

O Tamanduá-Bandeira era o animal mais impaciente do Cerrado. Queria tudo rápido: comer rápido, andar rápido, viver rápido.

Um dia, desafiou a Formiga: *"Aposto que como todo seu formigueiro em um dia!"*

A Formiga, sábia, respondeu: *"Aceito. Mas se não conseguir, terá que aprender nossa lição."*

O Tamanduá atacou o formigueiro com fúria. Mas as formigas eram milhares, e ele se cansou. Tentou cavar mais fundo, mas suas garras doíam. Tentou comer mais rápido, mas sua língua secou.

No fim do dia, o formigueiro ainda estava cheio.

*"Qual é a lição?"* — perguntou o Tamanduá, exausto.

*"Nós construímos este formigueiro grão por grão, durante gerações. Você quer destruir em um dia o que levou anos para criar. A verdadeira força está na paciência."*

Desde então, o Tamanduá come devagar. Sua língua entra e sai 150 vezes por minuto, mas ele nunca destrói um formigueiro inteiro. Come um pouco de cada um, deixando que se recuperem.

🌿 *O Tamanduá aprendeu: quem tem paciência, nunca passa fome. Quem respeita o tempo das coisas, sempre terá abundância.*`,
      licao: 'A paciência e o respeito pelos ciclos naturais garantem a sustentabilidade e a abundância.',
      elementos: ['paciência', 'sustentabilidade', 'respeito', 'abundância']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LENDAS DE PLANTAS
    // ═══════════════════════════════════════════════════════════════════════
    
    pequi: {
      id: 'pequi',
      titulo: 'O Pequi e os Espinhos do Amor',
      especie: 'Caryocar brasiliense',
      tipo: 'lenda',
      origem: 'Tradição Goiana',
      historia: `💛 **O Pequi e os Espinhos do Amor**

Conta-se que o Pequi nasceu de um amor proibido.

Uma jovem indígena se apaixonou por um guerreiro de uma tribo inimiga. Eles se encontravam em segredo, sob uma árvore no coração do Cerrado.

Quando as tribos descobriram, decidiram separá-los para sempre. Na noite antes da separação, os dois amantes choraram abraçados sob a árvore.

Suas lágrimas, misturadas, caíram na terra. E da terra nasceu o Pequi.

O fruto é amarelo como o sol que iluminava seus encontros. É perfumado como o amor deles. Mas tem espinhos escondidos dentro — como a dor de quem ama e é separado.

*"Quem morder o pequi sem cuidado, sentirá os espinhos"* — dizem os mais velhos — *"assim como quem ama sem respeito, sentirá a dor."*

🌳 *Por isso o Pequi deve ser comido com delicadeza, roendo devagar, nunca mordendo. É uma lição de paciência no amor.*

E dizem que casais que comem pequi juntos, com cuidado e carinho, terão um amor que sobrevive a qualquer separação.`,
      licao: 'O amor verdadeiro requer cuidado, paciência e respeito. A pressa machuca.',
      elementos: ['amor', 'paciência', 'cuidado', 'espinhos']
    },

    buriti: {
      id: 'buriti',
      titulo: 'O Buriti - A Árvore da Vida',
      especie: 'Mauritia flexuosa',
      tipo: 'mito',
      origem: 'Povos das Veredas',
      historia: `🌴 **O Buriti - A Árvore da Vida**

No tempo antigo, houve uma grande seca. Os rios secaram, os animais morriam, e o povo não tinha água nem comida.

Uma anciã sonhou com uma palmeira que não existia. No sonho, a palmeira dizia: *"Plante-me onde a água se esconde, e eu cuidarei do seu povo para sempre."*

A anciã caminhou dias até encontrar um lugar onde a terra era úmida mesmo na seca. Ali, plantou uma semente que encontrou em seu sonho.

Da semente nasceu o Buriti.

A palmeira cresceu e suas raízes encontraram a água subterrânea, trazendo-a à superfície. Onde havia um Buriti, havia água. Os animais vieram beber. Os peixes voltaram. O povo teve comida.

Do Buriti, o povo aprendeu a usar tudo:
- 🍊 Os frutos para comer e fazer óleo
- 🧵 As fibras para tecer redes e cestos
- 🏠 As folhas para cobrir casas
- 💧 O tronco para guardar água

🌿 *Por isso o Buriti é chamado de "Árvore da Vida". Onde ele cresce, a vida floresce ao redor. Ele é o guardião das águas do Cerrado.*`,
      licao: 'Quem cuida da água, cuida de toda a vida. Uma única árvore pode sustentar um ecossistema inteiro.',
      elementos: ['água', 'vida', 'generosidade', 'sustento']
    },

    ipê: {
      id: 'ipe',
      titulo: 'O Ipê e a Promessa da Primavera',
      especie: 'Handroanthus spp.',
      tipo: 'lenda',
      origem: 'Tradição do Brasil Central',
      historia: `💜 **O Ipê e a Promessa da Primavera**

Dizem que o Ipê foi a primeira árvore a florescer depois do grande dilúvio.

Quando as águas baixaram, a terra estava cinzenta e triste. Os animais e pessoas tinham perdido a esperança. Nenhuma planta florescia.

O Ipê, então apenas um galho seco, fez uma promessa ao Criador:

*"Se me deres força para florescer, prometo ser o primeiro a anunciar que a vida voltou. E farei isso todos os anos, para que ninguém esqueça que após a tempestade vem a renovação."*

O Criador aceitou. E o Ipê floresceu — não com folhas verdes, mas com flores. Milhares de flores amarelas, roxas, brancas e rosas cobriram seus galhos secos.

Os animais viram as cores de longe e vieram. As pessoas viram e choraram de alegria. A esperança renasceu.

🌸 *Por isso o Ipê floresce no fim da seca, quando tudo parece morto. Ele perde todas as folhas primeiro — fica completamente nu — para então explodir em flores.*

É a árvore que nos lembra: às vezes precisamos nos despir do velho para florescer no novo. A beleza mais intensa vem depois do momento mais difícil.`,
      licao: 'Após os momentos mais difíceis, vem a renovação mais bela. A esperança floresce onde menos se espera.',
      elementos: ['esperança', 'renovação', 'beleza', 'promessa']
    },

    jatoba: {
      id: 'jatoba',
      titulo: 'O Jatobá e a Memória dos Ancestrais',
      especie: 'Hymenaea courbaril',
      tipo: 'tradição',
      origem: 'Comunidades Quilombolas',
      historia: `🌳 **O Jatobá e a Memória dos Ancestrais**

Os quilombolas do Cerrado dizem que o Jatobá é a árvore dos ancestrais.

Quando os primeiros africanos escravizados fugiram para o Cerrado e fundaram quilombos, encontraram o Jatobá. A árvore era tão grande e antiga que parecia ter estado ali desde o início do mundo.

Sob o Jatobá, os quilombolas faziam suas reuniões. Contavam histórias da África. Planejavam a resistência. Celebravam a liberdade conquistada.

A resina do Jatobá — o jutaicica — era usada como remédio e como incenso nas cerimônias. Seu cheiro forte afastava os maus espíritos e trazia a proteção dos ancestrais.

*"O Jatobá vive 500 anos"* — dizem os mais velhos — *"Ele viu nossos avós chegarem, viu nossos pais nascerem, e verá nossos netos crescerem. Ele é nossa memória viva."*

🕯️ *Por isso, até hoje, muitos quilombos têm um Jatobá sagrado no centro. Não se corta um Jatobá antigo — seria como cortar a conexão com os ancestrais.*

Quando você encontrar um Jatobá centenário, pare e escute. Dizem que, no silêncio, você pode ouvir as vozes de todos que já descansaram sob seus galhos.`,
      licao: 'Os ancestrais vivem através da natureza. Preservar as árvores antigas é preservar nossa memória coletiva.',
      elementos: ['ancestralidade', 'memória', 'resistência', 'sagrado']
    }
  },

  /**
   * Usos Tradicionais - Etnobotânica e Sabedoria Popular
   */
  TRADITIONAL_USES: {
    
    pequi_uso: {
      especie: 'Caryocar brasiliense',
      nome_popular: 'Pequi',
      usos: [
        { tipo: 'alimentar', descricao: 'Fruto cozido com arroz, frango; óleo para culinária' },
        { tipo: 'medicinal', descricao: 'Óleo para problemas respiratórios, anti-inflamatório' },
        { tipo: 'cosmético', descricao: 'Óleo para cabelos e pele ressecada' },
        { tipo: 'cultural', descricao: 'Símbolo da culinária goiana, festas do pequi' }
      ],
      sabedoria: 'Nunca morda o pequi — roe devagar. Os espinhos ensinam paciência.'
    },
    
    buriti_uso: {
      especie: 'Mauritia flexuosa',
      nome_popular: 'Buriti',
      usos: [
        { tipo: 'alimentar', descricao: 'Fruto in natura, doces, sorvetes, óleo rico em vitamina A' },
        { tipo: 'artesanal', descricao: 'Fibra para cestos, esteiras, bolsas, cordas' },
        { tipo: 'construção', descricao: 'Folhas para cobertura, tronco para estruturas' },
        { tipo: 'medicinal', descricao: 'Óleo cicatrizante, protetor solar natural' }
      ],
      sabedoria: 'Onde tem buriti, tem água. Siga os buritis e nunca passará sede.'
    },
    
    barbatimao_uso: {
      especie: 'Stryphnodendron adstringens',
      nome_popular: 'Barbatimão',
      usos: [
        { tipo: 'medicinal', descricao: 'Casca para cicatrização, anti-inflamatório, antisséptico' },
        { tipo: 'tradicional', descricao: 'Banhos de assento, tratamento de feridas' }
      ],
      sabedoria: 'O barbatimão fecha feridas do corpo. O perdão fecha feridas da alma.'
    },
    
    sucupira_uso: {
      especie: 'Pterodon emarginatus',
      nome_popular: 'Sucupira',
      usos: [
        { tipo: 'medicinal', descricao: 'Sementes para dores articulares, reumatismo, garganta' },
        { tipo: 'madeira', descricao: 'Madeira nobre, resistente, para móveis e construção' }
      ],
      sabedoria: 'A sucupira é amarga, mas cura. Nem todo remédio é doce.'
    },
    
    mangaba_uso: {
      especie: 'Hancornia speciosa',
      nome_popular: 'Mangaba',
      usos: [
        { tipo: 'alimentar', descricao: 'Fruto doce para consumo in natura, sucos, sorvetes' },
        { tipo: 'medicinal', descricao: 'Látex para problemas digestivos' },
        { tipo: 'econômico', descricao: 'Fonte de renda para comunidades tradicionais' }
      ],
      sabedoria: 'A mangaba só amadurece quando cai. Não force o tempo das coisas.'
    }
  },

  /**
   * Sabedorias do Cerrado - Provérbios e Ensinamentos
   */
  WISDOMS: [
    {
      texto: 'O fogo que destrói é o mesmo que renova. Depende de quem o controla.',
      tema: 'transformação',
      contexto: 'Sobre as queimadas naturais que renovam o Cerrado'
    },
    {
      texto: 'A árvore que dá mais frutos é a que tem raízes mais profundas.',
      tema: 'fundamento',
      contexto: 'Sobre a importância das raízes no Cerrado de solos pobres'
    },
    {
      texto: 'O Cerrado guarda água no subsolo como o sábio guarda conhecimento: para os tempos de seca.',
      tema: 'previdência',
      contexto: 'Sobre os aquíferos sob o Cerrado'
    },
    {
      texto: 'Quem conhece o Cerrado de cima vê feiura. Quem conhece de dentro vê riqueza.',
      tema: 'profundidade',
      contexto: 'Sobre a biodiversidade escondida do bioma'
    },
    {
      texto: 'A seriema canta ao amanhecer para lembrar que todo dia é uma nova chance.',
      tema: 'renovação',
      contexto: 'Sobre o canto característico da seriema'
    },
    {
      texto: 'O pequi ensina: as melhores coisas da vida exigem paciência e cuidado.',
      tema: 'paciência',
      contexto: 'Sobre a forma correta de comer o pequi'
    },
    {
      texto: 'Onde o buriti cresce, a vida se multiplica. Seja um buriti na vida dos outros.',
      tema: 'generosidade',
      contexto: 'Sobre o papel ecológico do buriti'
    },
    {
      texto: 'O lobo-guará caminha sozinho, mas planta florestas por onde passa.',
      tema: 'propósito',
      contexto: 'Sobre a dispersão de sementes pelo lobo-guará'
    },
    {
      texto: 'A casca grossa do Cerrado protege um coração que pulsa verde.',
      tema: 'resiliência',
      contexto: 'Sobre as adaptações das plantas ao fogo'
    },
    {
      texto: 'Não existe árvore inútil no Cerrado. Cada uma tem seu papel, mesmo as tortas.',
      tema: 'valor',
      contexto: 'Sobre a importância de cada espécie no ecossistema'
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS PRINCIPAIS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Conta uma história sobre uma espécie
   * @param {string} speciesId - ID da espécie ou nome
   */
  tellStory(speciesId) {
    // Busca na biblioteca de lendas
    const legend = this.LEGENDS[speciesId];
    
    if (legend) {
      return {
        success: true,
        response: {
          text: `📖 *${this.BOT_NAME} se acomoda e começa a contar...*\n\n` +
                `${legend.historia}\n\n` +
                `---\n\n` +
                `💡 **Lição:** ${legend.licao}\n\n` +
                `📚 *Origem: ${legend.origem}*`,
          type: 'story',
          legend: {
            id: legend.id,
            titulo: legend.titulo,
            especie: legend.especie,
            tipo: legend.tipo
          }
        }
      };
    }
    
    // Busca por nome da espécie nas lendas
    for (const [id, leg] of Object.entries(this.LEGENDS)) {
      if (leg.especie.toLowerCase().includes(speciesId.toLowerCase()) ||
          leg.titulo.toLowerCase().includes(speciesId.toLowerCase())) {
        return this.tellStory(id);
      }
    }
    
    return {
      success: false,
      response: {
        text: `📖 *${this.BOT_NAME} coça a cabeça...*\n\n` +
              `Hmm, não conheço uma história específica sobre "${speciesId}".\n\n` +
              `Mas posso contar sobre:\n` +
              Object.values(this.LEGENDS).map(l => `• ${l.titulo}`).join('\n') +
              `\n\nQual você gostaria de ouvir?`,
        type: 'story_not_found'
      }
    };
  },

  /**
   * Conta sobre usos tradicionais de uma planta
   * @param {string} plantId - ID ou nome da planta
   */
  tellTraditionalUse(plantId) {
    // Busca nos usos tradicionais
    const useKey = Object.keys(this.TRADITIONAL_USES).find(key => 
      key.includes(plantId.toLowerCase()) ||
      this.TRADITIONAL_USES[key].nome_popular.toLowerCase().includes(plantId.toLowerCase()) ||
      this.TRADITIONAL_USES[key].especie.toLowerCase().includes(plantId.toLowerCase())
    );
    
    if (useKey) {
      const use = this.TRADITIONAL_USES[useKey];
      const usosFormatados = use.usos.map(u => 
        `**${u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1)}:** ${u.descricao}`
      ).join('\n');
      
      return {
        success: true,
        response: {
          text: `🌿 **${use.nome_popular}** (*${use.especie}*)\n\n` +
                `*${this.BOT_NAME} compartilha a sabedoria dos antigos...*\n\n` +
                `**Usos Tradicionais:**\n${usosFormatados}\n\n` +
                `---\n\n` +
                `💬 **Sabedoria Popular:**\n*"${use.sabedoria}"*`,
          type: 'traditional_use',
          plant: use
        }
      };
    }
    
    return {
      success: false,
      response: {
        text: `🌿 Não encontrei informações sobre usos tradicionais de "${plantId}".\n\n` +
              `Conheço os usos de:\n` +
              Object.values(this.TRADITIONAL_USES).map(u => `• ${u.nome_popular}`).join('\n'),
        type: 'use_not_found'
      }
    };
  },

  /**
   * Compartilha uma sabedoria do Cerrado
   * @param {string} tema - Tema opcional (transformação, paciência, etc)
   */
  shareWisdom(tema = null) {
    let sabedorias = this.WISDOMS;
    
    if (tema) {
      sabedorias = this.WISDOMS.filter(s => 
        s.tema.toLowerCase().includes(tema.toLowerCase()) ||
        s.contexto.toLowerCase().includes(tema.toLowerCase())
      );
      
      if (sabedorias.length === 0) {
        sabedorias = this.WISDOMS; // Fallback para todas
      }
    }
    
    const sabedoria = sabedorias[Math.floor(Math.random() * sabedorias.length)];
    
    return {
      success: true,
      response: {
        text: `🌿 *${this.BOT_NAME} olha para o horizonte e diz...*\n\n` +
              `**"${sabedoria.texto}"**\n\n` +
              `*${sabedoria.contexto}*`,
        type: 'wisdom',
        wisdom: sabedoria
      }
    };
  },

  /**
   * Lista todas as histórias disponíveis
   */
  listStories() {
    const stories = Object.values(this.LEGENDS).map(l => ({
      id: l.id,
      titulo: l.titulo,
      tipo: l.tipo,
      especie: l.especie
    }));
    
    return {
      success: true,
      stories,
      response: {
        text: `📚 **Histórias do Cerrado**\n\n` +
              `*${this.BOT_NAME} abre seu livro de histórias...*\n\n` +
              `**Lendas de Animais:**\n` +
              stories.filter(s => ['lobo_guara', 'seriema', 'arara', 'tamandua'].includes(s.id))
                .map(s => `• ${s.titulo}`).join('\n') +
              `\n\n**Lendas de Plantas:**\n` +
              stories.filter(s => ['pequi', 'buriti', 'ipe', 'jatoba'].includes(s.id))
                .map(s => `• ${s.titulo}`).join('\n') +
              `\n\nQual história você quer ouvir?`,
        type: 'story_list'
      }
    };
  },

  /**
   * Gera história com IA baseada em espécie/local
   * @param {string} subject - Espécie ou local
   * @param {string} context - Contexto adicional
   */
  generateStoryWithAI(subject, context = '') {
    if (typeof GeminiAIService === 'undefined' || !GeminiAIService.isConfigured()) {
      // Fallback: retorna história existente mais próxima
      return this.tellStory(subject);
    }
    
    const prompt = `${this.CONFIG.persona}

Crie uma história curta (máximo 300 palavras) sobre "${subject}" no contexto do Cerrado brasileiro.
${context ? `Contexto adicional: ${context}` : ''}

A história deve:
1. Ter elementos mágicos ou míticos
2. Incluir uma lição sobre natureza ou vida
3. Mencionar características reais da espécie/local
4. Usar linguagem poética e envolvente
5. Terminar com uma sabedoria ou provérbio

Formato:
[Emoji] **Título da História**
[História]
💡 **Lição:** [lição]`;

    try {
      const result = GeminiAIService.callGemini(prompt, {
        maxTokens: this.CONFIG.maxTokens,
        temperature: this.CONFIG.temperature
      });
      
      if (result.success) {
        return {
          success: true,
          response: {
            text: `📖 *${this.BOT_NAME} fecha os olhos e uma nova história surge...*\n\n` +
                  result.text,
            type: 'ai_story',
            generated: true
          }
        };
      }
    } catch (e) {
      Logger.log(`[generateStoryWithAI] Erro: ${e}`);
    }
    
    return this.tellStory(subject);
  },

  /**
   * Processa mensagem para o Contador de Histórias
   * @param {string} message - Mensagem do usuário
   * @param {object} context - Contexto
   */
  processMessage(message, context = {}) {
    const lower = message.toLowerCase();
    
    // Detecta intenção
    if (lower.includes('história') || lower.includes('lenda') || lower.includes('conte')) {
      // Busca espécie mencionada
      for (const [id, legend] of Object.entries(this.LEGENDS)) {
        if (lower.includes(id.replace('_', ' ')) || 
            lower.includes(legend.titulo.toLowerCase().split(' ').slice(-1)[0])) {
          return this.tellStory(id);
        }
      }
      // Lista histórias se não encontrou específica
      return this.listStories();
    }
    
    if (lower.includes('uso') || lower.includes('tradicional') || lower.includes('remédio')) {
      for (const [key, use] of Object.entries(this.TRADITIONAL_USES)) {
        if (lower.includes(use.nome_popular.toLowerCase())) {
          return this.tellTraditionalUse(use.nome_popular);
        }
      }
    }
    
    if (lower.includes('sabedoria') || lower.includes('provérbio') || lower.includes('ensinamento')) {
      return this.shareWisdom();
    }
    
    // Resposta padrão
    return {
      success: true,
      response: {
        text: `📖 *${this.BOT_NAME}, o Contador de Histórias, faz uma reverência...*\n\n` +
              `Olá! Sou guardião das histórias do Cerrado.\n\n` +
              `Posso compartilhar:\n` +
              `• 🐺 Lendas de animais (lobo-guará, seriema, arara...)\n` +
              `• 🌳 Histórias de plantas (pequi, buriti, ipê...)\n` +
              `• 🌿 Usos tradicionais e sabedoria popular\n` +
              `• 💬 Provérbios e ensinamentos do Cerrado\n\n` +
              `O que você gostaria de ouvir?`,
        type: 'greeting',
        suggestions: ['Conte sobre o lobo-guará', 'História do pequi', 'Uma sabedoria do Cerrado']
      }
    };
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Storyteller Service
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Conta uma história sobre espécie/local
 * @param {string} speciesId - ID ou nome da espécie
 */
function apiStorytellerTell(speciesId) {
  return StorytellerService.tellStory(speciesId);
}

/**
 * Conta sobre usos tradicionais
 * @param {string} plantId - ID ou nome da planta
 */
function apiStorytellerTraditionalUse(plantId) {
  return StorytellerService.tellTraditionalUse(plantId);
}

/**
 * Compartilha sabedoria do Cerrado
 * @param {string} tema - Tema opcional
 */
function apiStorytellerWisdom(tema) {
  return StorytellerService.shareWisdom(tema);
}

/**
 * Lista todas as histórias disponíveis
 */
function apiStorytellerList() {
  return StorytellerService.listStories();
}

/**
 * Gera história com IA
 * @param {string} subject - Assunto
 * @param {string} context - Contexto adicional
 */
function apiStorytellerGenerate(subject, context) {
  return StorytellerService.generateStoryWithAI(subject, context);
}

/**
 * Processa mensagem para o Contador de Histórias
 * @param {string} message - Mensagem
 * @param {object} context - Contexto
 */
function apiStorytellerMessage(message, context) {
  return StorytellerService.processMessage(message, context || {});
}

/**
 * Integração com BioBot - adiciona camada cultural à identificação
 * @param {string} speciesName - Nome da espécie identificada
 */
function apiStorytellerEnrichSpecies(speciesName) {
  // Tenta encontrar história
  const storyResult = StorytellerService.tellStory(speciesName);
  
  // Tenta encontrar usos tradicionais
  const useResult = StorytellerService.tellTraditionalUse(speciesName);
  
  // Busca sabedoria relacionada
  const wisdomResult = StorytellerService.shareWisdom(speciesName);
  
  const enrichments = [];
  
  if (storyResult.success && storyResult.response.type === 'story') {
    enrichments.push({
      type: 'legend',
      title: storyResult.response.legend.titulo,
      preview: storyResult.response.text.substring(0, 200) + '...'
    });
  }
  
  if (useResult.success && useResult.response.type === 'traditional_use') {
    enrichments.push({
      type: 'traditional_use',
      plant: useResult.response.plant.nome_popular,
      uses: useResult.response.plant.usos.map(u => u.tipo)
    });
  }
  
  return {
    success: true,
    speciesName,
    hasStory: storyResult.success && storyResult.response.type === 'story',
    hasTraditionalUse: useResult.success && useResult.response.type === 'traditional_use',
    enrichments,
    wisdom: wisdomResult.response.wisdom
  };
}

/**
 * Obtém história aleatória
 */
function apiStorytellerRandom() {
  const legends = Object.keys(StorytellerService.LEGENDS);
  const randomId = legends[Math.floor(Math.random() * legends.length)];
  return StorytellerService.tellStory(randomId);
}
