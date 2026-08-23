
// db.js - Configuração do Dexie (IndexedDB) com imagens
import Dexie from 'dexie';

const db = new Dexie('TrocaTudoDB');

// Versão 3 para incluir imagens (força recriação)
db.version(3).stores({
    usuarios: '++id, email, cpf, nome',
    produtos: '++id, titulo, categoria, status, dono, precoMoedas',
    trocas: '++id, produtoId, solicitante, dono, status',
    notificacoes: '++id, para, de, lida, tipo',
    chats: '++id, produtoId, usuario1, usuario2',
    adminFees: '++id'
});

// Função para gerar nome do arquivo a partir do título
function gerarCaminhoImagem(titulo) {
    // Remove acentos e caracteres especiais, substitui espaços por _
    const nome = titulo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-zA-Z0-9 ]/g, '')    // remove caracteres especiais
        .replace(/\s+/g, '_')             // espaços -> _
        .toLowerCase();
    return `src/${nome}.jpg`;
}

async function popularBanco() {
    const count = await db.produtos.count();
    if (count > 0) {
        console.log(`Banco já populado com ${count} produtos. Ignorando inserção.`);
        return;
    }

    console.log('Populando banco com dados iniciais e imagens...');

    // --- Usuários ---
    await db.usuarios.bulkAdd([
        {
            nome: 'Administrador',
            cpf: '000.000.000-00',
            email: 'adm@adm.com',
            telefone: '(00) 00000-0000',
            cidade: 'Admin',
            estado: 'AD',
            senha: '123456',
            isAdmin: true,
            moedas: 99999,
            totalGanho: 0,
            totalTaxas: 0
        },
        {
            nome: 'Usuário Demo',
            cpf: '123.456.789-00',
            email: 'demo@trocatudo.com',
            telefone: '(11) 99999-9999',
            cidade: 'São Paulo',
            estado: 'SP',
            senha: '123456',
            isAdmin: false,
            moedas: 1000,
            totalGanho: 0,
            totalTaxas: 0
        }
    ]);

    // --- Produtos (todas as categorias) ---
    const produtos = [
        // ========== ELETRÔNICOS ==========
        { titulo: 'Fone Bluetooth', descricao: 'Fone com cancelamento de ruído, bateria dura 4h.', categoria: 'Eletrônicos', local: 'São Paulo/SP', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Smartwatch ou jogos de PS4', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Teclado Mecânico Switch Blue', descricao: 'Teclado com LED RGB, ótimo para digitação e jogos.', categoria: 'Eletrônicos', local: 'Rio de Janeiro/RJ', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Mouse gamer sem fio', status: 'disponivel', condicao: 'usado', precoMoedas: 150, data: new Date().toISOString(), vendido: false },
        { titulo: 'Mouse Gamer 7200 DPI', descricao: 'Mouse ergonômico com pesos ajustáveis.', categoria: 'Eletrônicos', local: 'Curitiba/PR', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Headset com microfone', status: 'disponivel', condicao: 'novo', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'Monitor 24 Polegadas', descricao: 'Monitor Full HD, taxa de atualização de 75Hz.', categoria: 'Eletrônicos', local: 'Belo Horizonte/MG', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Placa de vídeo antiga', status: 'disponivel', condicao: 'seminovo', precoMoedas: 400, data: new Date().toISOString(), vendido: false },
        { titulo: 'Caixa de Som Portátil', descricao: 'Caixa de som à prova d\'água, excelente volume.', categoria: 'Eletrônicos', local: 'Porto Alegre/RS', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Fone de ouvido esportivo', status: 'disponivel', condicao: 'usado', precoMoedas: 80, data: new Date().toISOString(), vendido: false },
        { titulo: 'Powerbank 10000mAh', descricao: 'Carregador portátil rápido, acompanha cabo tipo C.', categoria: 'Eletrônicos', local: 'Salvador/BA', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Mochila pequena', status: 'disponivel', condicao: 'novo', precoMoedas: 70, data: new Date().toISOString(), vendido: false },
        { titulo: 'Câmera Digital Antiga', descricao: 'Câmera de 12MP, estilo retrô, funciona a pilha.', categoria: 'Eletrônicos', local: 'Recife/PE', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Itens de decoração vintage', status: 'disponivel', condicao: 'usado', precoMoedas: 100, data: new Date().toISOString(), vendido: false },
        { titulo: 'Smartwatch Básico', descricao: 'Mede batimentos, conta passos e recebe notificações.', categoria: 'Eletrônicos', local: 'Brasília/DF', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Roupas esportivas', status: 'disponivel', condicao: 'seminovo', precoMoedas: 110, data: new Date().toISOString(), vendido: false },
        { titulo: 'Tablet 7 Polegadas', descricao: 'Tablet antigo, bom para ler PDFs e e-books.', categoria: 'Eletrônicos', local: 'Fortaleza/CE', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Kindle de qualquer geração', status: 'disponivel', condicao: 'usado', precoMoedas: 180, data: new Date().toISOString(), vendido: false },
        { titulo: 'Roteador Wi-Fi Dual Band', descricao: 'Roteador potente para casas grandes.', categoria: 'Eletrônicos', local: 'Manaus/AM', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Jogos de tabuleiro', status: 'disponivel', condicao: 'novo', precoMoedas: 130, data: new Date().toISOString(), vendido: false },

        // ========== LIVROS ==========
        { titulo: 'O Senhor dos Anéis - Volume Único', descricao: 'Capa dura, sem amassados nas páginas.', categoria: 'Livros', local: 'São Paulo/SP', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Livros de ficção científica', status: 'disponivel', condicao: 'seminovo', precoMoedas: 80, data: new Date().toISOString(), vendido: false },
        { titulo: 'Harry Potter e a Pedra Filosofal', descricao: 'Primeira edição nacional, folhas amareladas.', categoria: 'Livros', local: 'Rio de Janeiro/RJ', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Outros livros da saga', status: 'disponivel', condicao: 'usado', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Livro 1984 - George Orwell', descricao: 'Clássico da distopia, edição de bolso.', categoria: 'Livros', local: 'Curitiba/PR', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Revolução dos Bichos', status: 'disponivel', condicao: 'seminovo', precoMoedas: 30, data: new Date().toISOString(), vendido: false },
        { titulo: 'O Pequeno Príncipe', descricao: 'Edição de luxo com aquarelas originais.', categoria: 'Livros', local: 'Belo Horizonte/MG', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Mangás diversos', status: 'disponivel', condicao: 'novo', precoMoedas: 45, data: new Date().toISOString(), vendido: false },
        { titulo: 'Dom Casmurro', descricao: 'Edição comentada para vestibulares.', categoria: 'Livros', local: 'Porto Alegre/RS', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Material escolar ou cadernos', status: 'disponivel', condicao: 'usado', precoMoedas: 25, data: new Date().toISOString(), vendido: false },
        { titulo: 'Mangá Naruto Vol 1 ao 5', descricao: 'Lote com os 5 primeiros volumes do mangá.', categoria: 'Livros', local: 'Salvador/BA', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Action figures de anime', status: 'disponivel', condicao: 'seminovo', precoMoedas: 70, data: new Date().toISOString(), vendido: false },
        { titulo: 'A Menina que Roubava Livros', descricao: 'Livro emocionante, lido apenas uma vez.', categoria: 'Livros', local: 'Recife/PE', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Jogos Vorazes', status: 'disponivel', condicao: 'seminovo', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Jogos Vorazes - Trilogia', descricao: 'Box completo com os 3 livros.', categoria: 'Livros', local: 'Brasília/DF', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Box de séries de fantasia', status: 'disponivel', condicao: 'usado', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'O Ladrão de Raios (Percy Jackson)', descricao: 'Capa nova, ótimo estado.', categoria: 'Livros', local: 'Fortaleza/CE', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Mangás de ação', status: 'disponivel', condicao: 'novo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Box Crônicas de Nárnia', descricao: 'Volume único encadernado.', categoria: 'Livros', local: 'Manaus/AM', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Harry Potter ilustrado', status: 'disponivel', condicao: 'seminovo', precoMoedas: 85, data: new Date().toISOString(), vendido: false },

        // ========== GAMES ==========
        { titulo: 'Jogo God of War (PS4)', descricao: 'Mídia física, caixa e disco sem riscos.', categoria: 'Games', local: 'São Paulo/SP', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'The Last of Us Part 2', status: 'disponivel', condicao: 'seminovo', precoMoedas: 100, data: new Date().toISOString(), vendido: false },
        { titulo: 'Mario Kart 8 Deluxe (Switch)', descricao: 'Cartucho em perfeito estado, com caixinha.', categoria: 'Games', local: 'Rio de Janeiro/RJ', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Zelda Breath of the Wild', status: 'disponivel', condicao: 'seminovo', precoMoedas: 200, data: new Date().toISOString(), vendido: false },
        { titulo: 'Controle Xbox One Original', descricao: 'Controle sem fio branco, analógicos inteiros.', categoria: 'Games', local: 'Curitiba/PR', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Jogos de Xbox', status: 'disponivel', condicao: 'usado', precoMoedas: 150, data: new Date().toISOString(), vendido: false },
        { titulo: 'Headset Gamer', descricao: 'Fones acolchoados, microfone retrátil.', categoria: 'Games', local: 'Belo Horizonte/MG', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Mousepad grande e teclado', status: 'disponivel', condicao: 'novo', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Nintendo DS Lite Prata', descricao: 'Console antigo, funciona bem, sem carregador.', categoria: 'Games', local: 'Porto Alegre/RS', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Gameboy ou jogos retrô', status: 'disponivel', condicao: 'usado', precoMoedas: 250, data: new Date().toISOString(), vendido: false },
        { titulo: 'Jogo de Tabuleiro Catan', descricao: 'Completo, nenhuma peça faltando. Jogado 2 vezes.', categoria: 'Games', local: 'Salvador/BA', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Dixit ou Ticket to Ride', status: 'disponivel', condicao: 'seminovo', precoMoedas: 180, data: new Date().toISOString(), vendido: false },
        { titulo: 'Cartucho Pokémon Ruby (GBA)', descricao: 'Cartucho original, bateria interna trocada.', categoria: 'Games', local: 'Recife/PE', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Outros jogos de GBA', status: 'disponivel', condicao: 'usado', precoMoedas: 140, data: new Date().toISOString(), vendido: false },
        { titulo: 'Capa de Silicone para Controle PS5', descricao: 'Capa preta antiaderente.', categoria: 'Games', local: 'Brasília/DF', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Cabo USB-C longo', status: 'disponivel', condicao: 'novo', precoMoedas: 30, data: new Date().toISOString(), vendido: false },
        { titulo: 'Mousepad Gamer Gigante', descricao: 'Tamanho 90x40cm, bordas costuradas.', categoria: 'Games', local: 'Fortaleza/CE', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Decoração para quarto', status: 'disponivel', condicao: 'novo', precoMoedas: 50, data: new Date().toISOString(), vendido: false },
        { titulo: 'Volante para PC USB', descricao: 'Volante básico com pedais.', categoria: 'Games', local: 'Manaus/AM', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Controle de PS3 ou PC', status: 'disponivel', condicao: 'usado', precoMoedas: 110, data: new Date().toISOString(), vendido: false },

        // ========== ROUPAS ==========
        { titulo: 'Jaqueta Jeans Vintage', descricao: 'Jaqueta tamanho M, estilo anos 90.', categoria: 'Roupas', local: 'São Paulo/SP', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Coturno ou bota', status: 'disponivel', condicao: 'usado', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'Moletom Canguru Preto', descricao: 'Moletom muito quente, tamanho G.', categoria: 'Roupas', local: 'Rio de Janeiro/RJ', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Calça de moletom', status: 'disponivel', condicao: 'seminovo', precoMoedas: 60, data: new Date().toISOString(), vendido: false },
        { titulo: 'Tênis de Corrida Esportivo', descricao: 'Tamanho 40, usado apenas 2 vezes em esteira.', categoria: 'Roupas', local: 'Curitiba/PR', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Tênis casual tamanho 40', status: 'disponivel', condicao: 'seminovo', precoMoedas: 130, data: new Date().toISOString(), vendido: false },
        { titulo: 'Bota de Couro Marrom', descricao: 'Bota tamanho 38, solado tratorado.', categoria: 'Roupas', local: 'Belo Horizonte/MG', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Bolsa ou mochila de couro', status: 'disponivel', condicao: 'usado', precoMoedas: 110, data: new Date().toISOString(), vendido: false },
        { titulo: 'Camisa Xadrez Flanelada', descricao: 'Perfeita para o frio, tamanho M.', categoria: 'Roupas', local: 'Porto Alegre/RS', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Camisetas de banda', status: 'disponivel', condicao: 'novo', precoMoedas: 70, data: new Date().toISOString(), vendido: false },
        { titulo: 'Calça Jogger Preta', descricao: 'Calça unissex, elástico na barra, tam G.', categoria: 'Roupas', local: 'Salvador/BA', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Bermudas jeans', status: 'disponivel', condicao: 'seminovo', precoMoedas: 55, data: new Date().toISOString(), vendido: false },
        { titulo: 'Casaco Sobretudo de Inverno', descricao: 'Casaco de lã batida, muito elegante.', categoria: 'Roupas', local: 'Recife/PE', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Relógio de pulso', status: 'disponivel', condicao: 'usado', precoMoedas: 150, data: new Date().toISOString(), vendido: false },
        { titulo: 'Chapéu Bucket Hat', descricao: 'Chapéu dupla face, preto e amarelo.', categoria: 'Roupas', local: 'Brasília/DF', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Boné de aba reta', status: 'disponivel', condicao: 'novo', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Camiseta Banda Rock', descricao: 'Camiseta preta do Pink Floyd, tamanho P.', categoria: 'Roupas', local: 'Fortaleza/CE', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Discos de vinil', status: 'disponivel', condicao: 'seminovo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Vestido Longo Florido', descricao: 'Vestido de verão, tecido leve, tamanho M.', categoria: 'Roupas', local: 'Manaus/AM', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Óculos de sol femininos', status: 'disponivel', condicao: 'novo', precoMoedas: 80, data: new Date().toISOString(), vendido: false },

        // ========== ESPORTES ==========
        { titulo: 'Bola de Basquete Oficial', descricao: 'Bola tamanho 7, precisa encher um pouco.', categoria: 'Esportes', local: 'São Paulo/SP', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Luvas de boxe', status: 'disponivel', condicao: 'usado', precoMoedas: 60, data: new Date().toISOString(), vendido: false },
        { titulo: 'Raquete de Tênis', descricao: 'Raquete leve, cordas em bom estado, com capa.', categoria: 'Esportes', local: 'Rio de Janeiro/RJ', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Skate ou patins', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Skate Montado Iniciante', descricao: 'Shape maple, lixa emborrachada.', categoria: 'Esportes', local: 'Curitiba/PR', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Peças de skate (rodinhas)', status: 'disponivel', condicao: 'usado', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'Patins Inline Tam 39', descricao: 'Patins preto, rolamentos ABEC 7.', categoria: 'Esportes', local: 'Belo Horizonte/MG', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Bicicleta antiga', status: 'disponivel', condicao: 'seminovo', precoMoedas: 150, data: new Date().toISOString(), vendido: false },
        { titulo: 'Corda de Pular Crossfit', descricao: 'Corda de aço com rolamento rápido.', categoria: 'Esportes', local: 'Porto Alegre/RS', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Garrafa de água térmica', status: 'disponivel', condicao: 'novo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Luvas de Goleiro', descricao: 'Tamanho adulto, palmas intactas.', categoria: 'Esportes', local: 'Salvador/BA', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Bola de futsal', status: 'disponivel', condicao: 'seminovo', precoMoedas: 55, data: new Date().toISOString(), vendido: false },
        { titulo: 'Capacete de Ciclismo', descricao: 'Capacete aerodinâmico, tamanho ajustável.', categoria: 'Esportes', local: 'Recife/PE', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Acessórios de bicicleta', status: 'disponivel', condicao: 'novo', precoMoedas: 70, data: new Date().toISOString(), vendido: false },
        { titulo: 'Óculos de Natação', descricao: 'Lentes antiembaçantes e proteção UV.', categoria: 'Esportes', local: 'Brasília/DF', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Touca e prancha de natação', status: 'disponivel', condicao: 'novo', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Kimono de Judô', descricao: 'Tamanho A2, faixa branca inclusa.', categoria: 'Esportes', local: 'Fortaleza/CE', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Artigos de artes marciais', status: 'disponivel', condicao: 'usado', precoMoedas: 85, data: new Date().toISOString(), vendido: false },
        { titulo: 'Prancha de Bodyboard', descricao: 'Prancha amarela, com leash de segurança.', categoria: 'Esportes', local: 'Manaus/AM', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Nadadeiras/Pé de pato', status: 'disponivel', condicao: 'seminovo', precoMoedas: 110, data: new Date().toISOString(), vendido: false },

        // ========== CASA E DECORAÇÃO ==========
        { titulo: 'Quadro Decorativo Abstrato', descricao: 'Moldura preta, tamanho 50x70cm.', categoria: 'Casa e Decoração', local: 'São Paulo/SP', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Espelho de parede', status: 'disponivel', condicao: 'novo', precoMoedas: 60, data: new Date().toISOString(), vendido: false },
        { titulo: 'Luminária de Mesa Articulada', descricao: 'Estilo Pixar, cor vermelha.', categoria: 'Casa e Decoração', local: 'Rio de Janeiro/RJ', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Livros de design', status: 'disponivel', condicao: 'seminovo', precoMoedas: 45, data: new Date().toISOString(), vendido: false },
        { titulo: 'Almofada Geek Pac-Man', descricao: 'Almofada de pelúcia super macia.', categoria: 'Casa e Decoração', local: 'Curitiba/PR', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Itens colecionáveis', status: 'disponivel', condicao: 'novo', precoMoedas: 30, data: new Date().toISOString(), vendido: false },
        { titulo: 'Vaso de Planta de Cerâmica', descricao: 'Vaso artesanal pintado à mão.', categoria: 'Casa e Decoração', local: 'Belo Horizonte/MG', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Mudas de plantas ou suculentas', status: 'disponivel', condicao: 'seminovo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Relógio de Parede Vintage', descricao: 'Relógio de madeira estilo estação de trem.', categoria: 'Casa e Decoração', local: 'Porto Alegre/RS', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Quadros antigos', status: 'disponivel', condicao: 'usado', precoMoedas: 80, data: new Date().toISOString(), vendido: false },
        { titulo: 'Tapete Felpudo Branco', descricao: 'Tamanho 1,50 x 2,00m, recém lavado.', categoria: 'Casa e Decoração', local: 'Salvador/BA', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Cortinas blackout', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Caneca Térmica de Inox', descricao: 'Mantém café quente por até 4 horas.', categoria: 'Casa e Decoração', local: 'Recife/PE', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Garrafa de água squeeze', status: 'disponivel', condicao: 'novo', precoMoedas: 50, data: new Date().toISOString(), vendido: false },
        { titulo: 'Organizador de Mesa MDF', descricao: 'Com gavetas e porta-canetas.', categoria: 'Casa e Decoração', local: 'Brasília/DF', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Material de papelaria', status: 'disponivel', condicao: 'usado', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Cadeira de Escritório', descricao: 'Cadeira giratória simples, assento acolchoado.', categoria: 'Casa e Decoração', local: 'Fortaleza/CE', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Mesa escrivaninha pequena', status: 'disponivel', condicao: 'usado', precoMoedas: 150, data: new Date().toISOString(), vendido: false },
        { titulo: 'Espelho Redondo com Alça', descricao: 'Espelho estilo Adnet, couro marrom.', categoria: 'Casa e Decoração', local: 'Manaus/AM', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Luminária de teto', status: 'disponivel', condicao: 'novo', precoMoedas: 90, data: new Date().toISOString(), vendido: false },

        // ========== INSTRUMENTOS MUSICAIS ==========
        { titulo: 'Violão Clássico Nylon', descricao: 'Ideal para iniciantes. Acompanha capa macia.', categoria: 'Instrumentos Musicais', local: 'São Paulo/SP', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Teclado musical básico', status: 'disponivel', condicao: 'seminovo', precoMoedas: 180, data: new Date().toISOString(), vendido: false },
        { titulo: 'Teclado Arranjador Casio', descricao: 'Teclado com 61 teclas e vários timbres.', categoria: 'Instrumentos Musicais', local: 'Rio de Janeiro/RJ', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Guitarra ou contrabaixo', status: 'disponivel', condicao: 'usado', precoMoedas: 250, data: new Date().toISOString(), vendido: false },
        { titulo: 'Ukulele Soprano', descricao: 'Madeira maciça, cordas Aquila.', categoria: 'Instrumentos Musicais', local: 'Curitiba/PR', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Pedal de guitarra', status: 'disponivel', condicao: 'seminovo', precoMoedas: 110, data: new Date().toISOString(), vendido: false },
        { titulo: 'Flauta Doce Germânica', descricao: 'Flauta de resina, cor marfim.', categoria: 'Instrumentos Musicais', local: 'Belo Horizonte/MG', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Gaita de boca', status: 'disponivel', condicao: 'novo', precoMoedas: 25, data: new Date().toISOString(), vendido: false },
        { titulo: 'Guitarra Strato Iniciante', descricao: 'Cor preta, captadores funcionando bem.', categoria: 'Instrumentos Musicais', local: 'Porto Alegre/RS', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Amplificador pequeno', status: 'disponivel', condicao: 'usado', precoMoedas: 220, data: new Date().toISOString(), vendido: false },
        { titulo: 'Pedal de Efeito Delay', descricao: 'Pedal analógico para guitarra, caixa de metal.', categoria: 'Instrumentos Musicais', local: 'Salvador/BA', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Pedal de distorção ou cabos', status: 'disponivel', condicao: 'seminovo', precoMoedas: 140, data: new Date().toISOString(), vendido: false },
        { titulo: 'Contrabaixo 4 Cordas', descricao: 'Baixo passivo vermelho, precisando trocar cordas.', categoria: 'Instrumentos Musicais', local: 'Recife/PE', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Interface de áudio USB', status: 'disponivel', condicao: 'usado', precoMoedas: 200, data: new Date().toISOString(), vendido: false },
        { titulo: 'Pandeiro de Couro', descricao: 'Pandeiro 10 polegadas, pele animal.', categoria: 'Instrumentos Musicais', local: 'Brasília/DF', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Acessórios de percussão', status: 'disponivel', condicao: 'seminovo', precoMoedas: 60, data: new Date().toISOString(), vendido: false },
        { titulo: 'Gaita de Boca em Dó', descricao: 'Gaita diatônica com estojo de acrílico.', categoria: 'Instrumentos Musicais', local: 'Fortaleza/CE', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Livros de teoria musical', status: 'disponivel', condicao: 'novo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Suporte de Chão para Violão', descricao: 'Suporte metálico retrátil.', categoria: 'Instrumentos Musicais', local: 'Manaus/AM', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Afinador digital e palhetas', status: 'disponivel', condicao: 'seminovo', precoMoedas: 35, data: new Date().toISOString(), vendido: false },

        // ========== COLECIONÁVEIS ==========
        { titulo: 'Funko Pop Batman Original', descricao: 'Na caixa, sem detalhes.', categoria: 'Colecionáveis', local: 'São Paulo/SP', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Funko Pop do Homem-Aranha', status: 'disponivel', condicao: 'novo', precoMoedas: 80, data: new Date().toISOString(), vendido: false },
        { titulo: 'Lote Cartas Pokémon', descricao: '50 cartas comuns e incomuns, sem repetidas.', categoria: 'Colecionáveis', local: 'Rio de Janeiro/RJ', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Cartas Pokémon raras ou holográficas', status: 'disponivel', condicao: 'usado', precoMoedas: 45, data: new Date().toISOString(), vendido: false },
        { titulo: 'Moedas Antigas Brasileiras', descricao: 'Lote com 20 cruzeiros e cruzados.', categoria: 'Colecionáveis', local: 'Curitiba/PR', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Cédulas estrangeiras', status: 'disponivel', condicao: 'usado', precoMoedas: 50, data: new Date().toISOString(), vendido: false },
        { titulo: 'Miniatura de Carro 1 18 Fusca ', descricao: 'Réplica de metal, abre portas e capô.', categoria: 'Colecionáveis', local: 'Belo Horizonte/MG', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Outras miniaturas 1:18', status: 'disponivel', condicao: 'seminovo', precoMoedas: 100, data: new Date().toISOString(), vendido: false },
        { titulo: 'Action Figure Goku Dragon Ball', descricao: 'Figura articulada de 15cm.', categoria: 'Colecionáveis', local: 'Porto Alegre/RS', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Mangás raros', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Álbum de Selos Incompleto', descricao: 'Álbum vintage com cerca de 100 selos mundiais.', categoria: 'Colecionáveis', local: 'Salvador/BA', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Livros de história', status: 'disponivel', condicao: 'usado', precoMoedas: 70, data: new Date().toISOString(), vendido: false },
        { titulo: 'Quadrinho Homem-Aranha Anos 90', descricao: 'Edição especial formatinho Abril.', categoria: 'Colecionáveis', local: 'Recife/PE', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Quadrinhos do Batman', status: 'disponivel', condicao: 'usado', precoMoedas: 30, data: new Date().toISOString(), vendido: false },
        { titulo: 'Vinil The Dark Side of The Moon', descricao: 'Disco de vinil nacional antigo, com encarte.', categoria: 'Colecionáveis', local: 'Brasília/DF', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Toca discos ou outros vinis de rock', status: 'disponivel', condicao: 'seminovo', precoMoedas: 160, data: new Date().toISOString(), vendido: false },
        { titulo: 'Fita K7 Rock Nacional', descricao: 'Legião Urbana e Paralamas. Fitas originais.', categoria: 'Colecionáveis', local: 'Fortaleza/CE', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Walkman antigo', status: 'disponivel', condicao: 'usado', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Chaveiro Vintage Câmera', descricao: 'Chaveiro de metal pesado em formato de câmera.', categoria: 'Colecionáveis', local: 'Manaus/AM', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Broches ou pins de mochila', status: 'disponivel', condicao: 'novo', precoMoedas: 25, data: new Date().toISOString(), vendido: false },

        // ========== BRINQUEDOS ==========
        { titulo: 'Caixa Lego Clássico Mista', descricao: 'Caixa com mais de 300 peças sortidas.', categoria: 'Brinquedos', local: 'São Paulo/SP', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Jogos de videogame infantis', status: 'disponivel', condicao: 'usado', precoMoedas: 100, data: new Date().toISOString(), vendido: false },
        { titulo: 'Quebra-cabeça 1000 Peças Paisagem', descricao: 'Montado apenas 1 vez, não falta nenhuma peça.', categoria: 'Brinquedos', local: 'Rio de Janeiro/RJ', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Livros de colorir adultos', status: 'disponivel', condicao: 'seminovo', precoMoedas: 45, data: new Date().toISOString(), vendido: false },
        { titulo: 'Jogo Cara a Cara', descricao: 'Jogo clássico da Estrela, na caixa.', categoria: 'Brinquedos', local: 'Curitiba/PR', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Banco Imobiliário', status: 'disponivel', condicao: 'usado', precoMoedas: 50, data: new Date().toISOString(), vendido: false },
        { titulo: 'Carrinho de Controle Remoto', descricao: 'Carrinho off-road, usa pilhas AA.', categoria: 'Brinquedos', local: 'Belo Horizonte/MG', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Pista de carrinhos', status: 'disponivel', condicao: 'seminovo', precoMoedas: 75, data: new Date().toISOString(), vendido: false },
        { titulo: 'Boneca de Pano Artesanal', descricao: 'Boneca feita à mão, 30cm de altura.', categoria: 'Brinquedos', local: 'Porto Alegre/RS', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Urso de pelúcia', status: 'disponivel', condicao: 'novo', precoMoedas: 60, data: new Date().toISOString(), vendido: false },
        { titulo: 'Beyblade Metal Fusion', descricao: 'Acompanha lançador e corda.', categoria: 'Brinquedos', local: 'Salvador/BA', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Arena de Beyblade', status: 'disponivel', condicao: 'usado', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Cubo Mágico Profissional', descricao: 'Cubo 3x3x3 magnético, desliza super rápido.', categoria: 'Brinquedos', local: 'Recife/PE', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Outros quebra-cabeças lógicos', status: 'disponivel', condicao: 'novo', precoMoedas: 55, data: new Date().toISOString(), vendido: false },
        { titulo: 'Pista Hot Wheels Looping', descricao: 'Pista de acrobacias, inclui 2 carrinhos.', categoria: 'Brinquedos', local: 'Brasília/DF', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Carrinhos Hot Wheels soltos', status: 'disponivel', condicao: 'seminovo', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'Jogo de Cartas Uno Original', descricao: 'Cartas plastificadas, sem dobras.', categoria: 'Brinquedos', local: 'Fortaleza/CE', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Dobble ou jogos rápidos de cartas', status: 'disponivel', condicao: 'usado', precoMoedas: 25, data: new Date().toISOString(), vendido: false },
        { titulo: 'Lançador Nerf Elite', descricao: 'Arminha que dispara dardos de espuma. (Acompanha 10 dardos)', categoria: 'Brinquedos', local: 'Manaus/AM', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Óculos de proteção infantil', status: 'disponivel', condicao: 'seminovo', precoMoedas: 70, data: new Date().toISOString(), vendido: false },

        // ========== ACESSÓRIOS ==========
        { titulo: 'Relógio de Pulso Analógico', descricao: 'Pulseira de couro sintético, bateria nova.', categoria: 'Acessórios', local: 'São Paulo/SP', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Carteira de couro', status: 'disponivel', condicao: 'seminovo', precoMoedas: 65, data: new Date().toISOString(), vendido: false },
        { titulo: 'Óculos de Sol Polarizado', descricao: 'Armação tartaruga, lentes escuras.', categoria: 'Acessórios', local: 'Rio de Janeiro/RJ', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Boné de marca', status: 'disponivel', condicao: 'usado', precoMoedas: 45, data: new Date().toISOString(), vendido: false },
        { titulo: 'Mochila para Notebook', descricao: 'Mochila reforçada preta, cabe note de 15.6".', categoria: 'Acessórios', local: 'Curitiba/PR', dono: 'carlos.m@email.com', fotos: [], trocaDesejada: 'Bolsa carteiro', status: 'disponivel', condicao: 'seminovo', precoMoedas: 90, data: new Date().toISOString(), vendido: false },
        { titulo: 'Carteira de Couro Preta', descricao: 'Carteira fina (slim) para cartões e CNH.', categoria: 'Acessórios', local: 'Belo Horizonte/MG', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Cinto de couro', status: 'disponivel', condicao: 'novo', precoMoedas: 55, data: new Date().toISOString(), vendido: false },
        { titulo: 'Corrente de Prata Masculina', descricao: 'Corrente modelo grumet fina.', categoria: 'Acessórios', local: 'Porto Alegre/RS', dono: 'lucas.d@email.com', fotos: [], trocaDesejada: 'Relógio G-Shock', status: 'disponivel', condicao: 'usado', precoMoedas: 120, data: new Date().toISOString(), vendido: false },
        { titulo: 'Pulseira Inteligente Mi Band 4', descricao: 'Acompanha carregador, tela com riscos leves.', categoria: 'Acessórios', local: 'Salvador/BA', dono: 'ana.lu@email.com', fotos: [], trocaDesejada: 'Fone sem fio', status: 'disponivel', condicao: 'usado', precoMoedas: 75, data: new Date().toISOString(), vendido: false },
        { titulo: 'Boné Aba Reta Preto', descricao: 'Boné tamanho ajustável, liso sem estampa.', categoria: 'Acessórios', local: 'Recife/PE', dono: 'joao.v@email.com', fotos: [], trocaDesejada: 'Touca/Gorro de inverno', status: 'disponivel', condicao: 'novo', precoMoedas: 35, data: new Date().toISOString(), vendido: false },
        { titulo: 'Bolsa Transversal Esportiva', descricao: 'Pochete/shoulder bag para guardar celular e chaves.', categoria: 'Acessórios', local: 'Brasília/DF', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Garrafa térmica pequena', status: 'disponivel', condicao: 'seminovo', precoMoedas: 40, data: new Date().toISOString(), vendido: false },
        { titulo: 'Cinto Reversível Preto/Marrom', descricao: 'Fivela giratória, tamanho 100cm.', categoria: 'Acessórios', local: 'Fortaleza/CE', dono: 'maria.s@email.com', fotos: [], trocaDesejada: 'Gravata ou suspensório', status: 'disponivel', condicao: 'novo', precoMoedas: 50, data: new Date().toISOString(), vendido: false },
        { titulo: 'Guarda-chuva Reforçado', descricao: 'Tamanho grande (portaria), estrutura dupla de vento.', categoria: 'Acessórios', local: 'Manaus/AM', dono: 'pedro@email.com', fotos: [], trocaDesejada: 'Capa de chuva impermeável', status: 'disponivel', condicao: 'seminovo', precoMoedas: 60, data: new Date().toISOString(), vendido: false }
    ];

    console.log('✅ Banco populado com sucesso!');
    // Criar array completo com fotos
    const produtosComFotos = produtos.map(p => ({
        ...p,
        fotos: [gerarCaminhoImagem(p.titulo)],
        data: new Date().toISOString(),
        vendido: false
    }));

    await db.produtos.bulkAdd(produtosComFotos);
    console.log('✅ Banco populado com sucesso!');
}

db.open()
    .then(async () => {
        console.log('📀 Banco de dados conectado.');
        await popularBanco();
    })
    .catch(err => console.error('❌ Erro ao abrir banco:', err));

export default db;