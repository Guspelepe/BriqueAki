// db.js - Configuração do Dexie (IndexedDB)
import Dexie from 'dexie';

const db = new Dexie('TrocaTudoDB');

db.version(2).stores({
    usuarios: '++id, email, cpf, nome, codigoIndicacao, indicadoPor',
    produtos: '++id, titulo, categoria, status, dono, precoMoedas, tipoTroca',
    trocas: '++id, produtoId, solicitante, dono, status, tipo, servicoDescricao, mensagem, dataEntrega, dataRecebimento, avaliado',
    notificacoes: '++id, para, de, lida, tipo',
    chats: '++id, produtoId, usuario1, usuario2',
    adminFees: '++id',
    avaliacoes: '++id, produtoId, de, para, notaProduto, notaVendedor, comentario, data',
    indicacoes: '++id, codigo, criadoPor, usadoPor, bonusRecebido, dataUso'
});

// ============================================================
// DADOS PARA POPULAÇÃO
// ============================================================
const usuariosIniciais = [
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
        totalTaxas: 0,
        codigoIndicacao: 'ADMIN2024',
        indicadoPor: null
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
        moedas: 100,
        totalGanho: 0,
        totalTaxas: 0,
        codigoIndicacao: 'DEMO123',
        indicadoPor: null
    }
];

const produtosIniciais = [
    { titulo: 'Fone Bluetooth', descricao: 'Fone com cancelamento de ruído, bateria dura 4h.', categoria: 'Eletrônicos', local: 'São Paulo/SP', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Smartwatch ou jogos de PS4', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { titulo: 'Teclado Mecânico Switch Blue', descricao: 'Teclado com LED RGB, ótimo para digitação e jogos.', categoria: 'Eletrônicos', local: 'Rio de Janeiro/RJ', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Mouse gamer sem fio', status: 'disponivel', condicao: 'usado', precoMoedas: 150, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { titulo: 'Serviço de Design Gráfico', descricao: 'Criação de logos e identidade visual. 3 opções de layout.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Hardware de computador', status: 'disponivel', condicao: 'novo', precoMoedas: 200, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { titulo: 'Monitor 24 Polegadas', descricao: 'Monitor Full HD, taxa de atualização de 75Hz.', categoria: 'Eletrônicos', local: 'Belo Horizonte/MG', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Placa de vídeo antiga', status: 'disponivel', condicao: 'seminovo', precoMoedas: 400, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { titulo: 'Aula de Violão Online', descricao: 'Aulas particulares de violão via Zoom. 4 aulas de 1h.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Instrumentos musicais', status: 'disponivel', condicao: 'novo', precoMoedas: 150, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
];

async function popularBanco() {
    try {
        const countProdutos = await db.produtos.count();
        const countUsuarios = await db.usuarios.count();

        if (countProdutos > 0 && countUsuarios > 0) {
            return;
        }

        await db.transaction('rw', db.usuarios, db.produtos, async () => {
            if (countUsuarios === 0) {
                await db.usuarios.bulkAdd(usuariosIniciais);
            }
            if (countProdutos === 0) {
                await db.produtos.bulkAdd(produtosIniciais);
            }
        });
    } catch (error) {
        console.error('Erro ao popular banco:', error);
    }
}

db.open()
    .then(async () => {
        await popularBanco();
    })
    .catch(err => {
        console.error('Erro ao abrir banco:', err);
    });

export default db;