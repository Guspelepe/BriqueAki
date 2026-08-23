// ============================================================
//  BANCO DE DADOS EM TXT (localStorage)
// ============================================================

const DB_KEY = 'trocas_db_v7';
let currentUser = null;
let currentUserData = null;
let produtoModalAtual = null;
let chatAtual = null;

function getDefaultDB() {
    return {
        usuarios: [
            {
                id: 1,
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
                id: 2,
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
        ],
        produtos: [
            { 
                id: 3, 
                titulo: 'Violão Yamaha', 
                descricao: 'Violão iniciante, cordas novas. Ótimo para quem está começando.', 
                categoria: 'Outros',
                local: 'São Paulo/SP',
                dono: 'demo@trocatudo.com',
                fotos: [],
                trocaDesejada: 'Um violão mais avançado ou teclado',
                status: 'disponivel',
                condicao: 'seminovo',
                precoMoedas: 150,
                data: new Date().toISOString()
            },
            { 
                id: 4, 
                titulo: 'Mochila Impermeável 40L', 
                descricao: 'Mochila nova, nunca usada. Perfeita para viagens.', 
                categoria: 'Outros',
                local: 'Rio de Janeiro/RJ',
                dono: 'demo@trocatudo.com',
                fotos: [],
                trocaDesejada: 'Mochila menor ou livros',
                status: 'disponivel',
                condicao: 'novo',
                precoMoedas: 80,
                data: new Date().toISOString()
            },
            { 
                id: 5, 
                titulo: 'Livro - O Hobbit', 
                descricao: 'Edição ilustrada, capa dura, em excelente estado.', 
                categoria: 'Livros',
                local: 'Curitiba/PR',
                dono: 'demo@trocatudo.com',
                fotos: [],
                trocaDesejada: 'Livros de fantasia',
                status: 'disponivel',
                condicao: 'usado',
                precoMoedas: 40,
                data: new Date().toISOString()
            },
        ],
        trocas: [],
        notificacoes: [],
        chats: [],
        adminFees: 0,
        nextId: 6
    };
}

function loadDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.chats) parsed.chats = [];
            if (!parsed.adminFees) parsed.adminFees = 0;
            const adminExists = parsed.usuarios.some(u => u.email === 'adm@adm.com');
            if (!adminExists) {
                parsed.usuarios.push({
                    id: parsed.nextId++,
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
                });
            }
            const demoExists = parsed.usuarios.some(u => u.email === 'demo@trocatudo.com');
            if (!demoExists) {
                parsed.usuarios.push({
                    id: parsed.nextId++,
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
                });
            }
            parsed.usuarios.forEach(u => {
                if (u.moedas === undefined) u.moedas = 100;
                if (u.totalGanho === undefined) u.totalGanho = 0;
                if (u.totalTaxas === undefined) u.totalTaxas = 0;
            });
            parsed.produtos.forEach(p => {
                if (!p.condicao) p.condicao = 'usado';
            });
            return parsed;
        } catch (e) {
            return getDefaultDB();
        }
    }
    return getDefaultDB();
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let db = loadDB();
saveDB(db);

// ======== ELEMENTOS DOM ========
const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const loginEmail = document.getElementById('loginEmail');
const loginSenha = document.getElementById('loginSenha');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

const regNome = document.getElementById('regNome');
const regCpf = document.getElementById('regCpf');
const regEmail = document.getElementById('regEmail');
const regTelefone = document.getElementById('regTelefone');
const regCidade = document.getElementById('regCidade');
const regEstado = document.getElementById('regEstado');
const regSenha = document.getElementById('regSenha');

const displayName = document.getElementById('displayName');
const coinsDisplay = document.getElementById('coinsDisplay');
const btnLogout = document.getElementById('btnLogout');
const btnNotifications = document.getElementById('btnNotifications');
const notificationsPanel = document.getElementById('notificationsPanel');
const notificationsList = document.getElementById('notificationsList');
const notifBadge = document.getElementById('notifBadge');

const listaEl = document.getElementById('listaAnuncios');
const meusAnunciosEl = document.getElementById('meusAnuncios');
const tituloInput = document.getElementById('tituloProduto');
const descInput = document.getElementById('descricaoProduto');
const categoriaInput = document.getElementById('categoriaProduto');
const localInput = document.getElementById('localProduto');
const fotoInput = document.getElementById('fotoProduto');
const trocaDesejadaInput = document.getElementById('trocaDesejada');
const precoMoedasInput = document.getElementById('precoMoedas');
const condicaoInput = document.getElementById('condicaoProduto');
const statusInput = document.getElementById('statusProduto');
const btnPublicar = document.getElementById('btnPublicar');

const searchText = document.getElementById('searchText');
const searchCidade = document.getElementById('searchCidade');
const searchEstado = document.getElementById('searchEstado');
const searchCategory = document.getElementById('searchCategory');
const searchStatus = document.getElementById('searchStatus');
const btnSearch = document.getElementById('btnSearch');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatTitle = document.getElementById('chatTitle');
const toastEl = document.getElementById('toast');

const adminTotalUsers = document.getElementById('adminTotalUsers');
const adminTotalProducts = document.getElementById('adminTotalProducts');
const adminTotalCoins = document.getElementById('adminTotalCoins');
const adminTotalFees = document.getElementById('adminTotalFees');
const adminProductList = document.getElementById('adminProductList');

const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');
const btnGirar = document.getElementById('btnGirar');
const slotReward = document.getElementById('slotReward');
const btnDailyBonus = document.getElementById('btnDailyBonus');
const dailyBonusStatus = document.getElementById('dailyBonusStatus');
const coinBalanceDisplay = document.getElementById('coinBalanceDisplay');
const totalCoinsEarned = document.getElementById('totalCoinsEarned');
const totalFeesPaid = document.getElementById('totalFeesPaid');

const priceEvaluationGrid = document.getElementById('priceEvaluationGrid');
const categoryEvaluationGrid = document.getElementById('categoryEvaluationGrid');

// ======== FUNÇÕES AUXILIARES ========
function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

function formatCpf(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 3) return value;
    if (value.length <= 6) return value.replace(/(\d{3})(\d+)/, '$1.$2');
    if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

function formatPhone(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 2) return value;
    if (value.length <= 6) return value.replace(/(\d{2})(\d+)/, '($1) $2');
    if (value.length <= 10) return value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return value.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

function isValidCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    return true;
}

function getStatusClass(status) {
    const classes = {
        'disponivel': 'status-disponivel',
        'negociacao': 'status-negociacao',
        'vendido': 'status-vendido',
        'cancelado': 'status-cancelado'
    };
    return classes[status] || 'status-disponivel';
}

function getStatusLabel(status) {
    const labels = {
        'disponivel': 'Disponível',
        'negociacao': 'Em negociação',
        'vendido': 'Vendido',
        'cancelado': 'Cancelado'
    };
    return labels[status] || 'Disponível';
}

function getCondicaoClass(condicao) {
    const classes = {
        'novo': 'condition-novo',
        'lacrado': 'condition-lacrado',
        'seminovo': 'condition-seminovo',
        'usado': 'condition-usado',
        'ruim': 'condition-ruim'
    };
    return classes[condicao] || 'condition-usado';
}

function getCondicaoLabel(condicao) {
    const labels = {
        'novo': '🆕 Novo',
        'lacrado': '📦 Lacrado',
        'seminovo': '✨ Seminovo',
        'usado': '👍 Usado - Boas condições',
        'ruim': '⚠️ Usado - Precisa de reparos'
    };
    return labels[condicao] || 'Usado';
}

function getNotificacoesNaoLidas() {
    return db.notificacoes.filter(n => !n.lida && n.para === currentUser.email);
}

function atualizarBadge() {
    const count = getNotificacoesNaoLidas().length;
    notifBadge.textContent = count;
    notifBadge.style.display = count > 0 ? 'inline' : 'none';
}

function atualizarMoedas() {
    if (currentUser) {
        coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
        coinBalanceDisplay.textContent = currentUser.moedas;
        totalCoinsEarned.textContent = currentUser.totalGanho || 0;
        totalFeesPaid.textContent = currentUser.totalTaxas || 0;
    }
}

function getChat(produtoId, usuario1, usuario2) {
    let chat = db.chats.find(c => 
        c.produtoId === produtoId && 
        ((c.usuario1 === usuario1 && c.usuario2 === usuario2) || 
         (c.usuario1 === usuario2 && c.usuario2 === usuario1))
    );
    if (!chat) {
        chat = {
            id: db.nextId++,
            produtoId: produtoId,
            usuario1: usuario1,
            usuario2: usuario2,
            mensagens: [],
            data: new Date().toISOString()
        };
        db.chats.push(chat);
        saveDB(db);
    }
    return chat;
}

// ======== AVALIAÇÃO DE PREÇO ========
function calcularAvaliacaoPreco() {
    const produtos = db.produtos || [];
    const condicoes = ['novo', 'lacrado', 'seminovo', 'usado', 'ruim'];
    const condicoesLabels = {
        'novo': '🆕 Novo',
        'lacrado': '📦 Lacrado',
        'seminovo': '✨ Seminovo',
        'usado': '👍 Usado - Boas condições',
        'ruim': '⚠️ Usado - Precisa de reparos'
    };

    // Avaliação por condição
    const evalPorCondicao = {};
    condicoes.forEach(c => {
        const produtosCondicao = produtos.filter(p => p.condicao === c && p.status !== 'vendido');
        if (produtosCondicao.length > 0) {
            const soma = produtosCondicao.reduce((acc, p) => acc + p.precoMoedas, 0);
            const media = Math.round(soma / produtosCondicao.length);
            const min = Math.min(...produtosCondicao.map(p => p.precoMoedas));
            const max = Math.max(...produtosCondicao.map(p => p.precoMoedas));
            evalPorCondicao[c] = { media, min, max, total: produtosCondicao.length };
        } else {
            evalPorCondicao[c] = { media: 0, min: 0, max: 0, total: 0 };
        }
    });

    // Avaliação por categoria
    const categorias = [...new Set(produtos.filter(p => p.status !== 'vendido').map(p => p.categoria))];
    const evalPorCategoria = {};
    categorias.forEach(cat => {
        const produtosCat = produtos.filter(p => p.categoria === cat && p.status !== 'vendido');
        if (produtosCat.length > 0) {
            const soma = produtosCat.reduce((acc, p) => acc + p.precoMoedas, 0);
            const media = Math.round(soma / produtosCat.length);
            const min = Math.min(...produtosCat.map(p => p.precoMoedas));
            const max = Math.max(...produtosCat.map(p => p.precoMoedas));
            evalPorCategoria[cat] = { media, min, max, total: produtosCat.length };
        }
    });

    // Renderizar avaliação por condição
    priceEvaluationGrid.innerHTML = condicoes.map(c => {
        const data = evalPorCondicao[c];
        if (data.total === 0) {
            return `
                <div class="eval-item">
                    <div class="product-name">${condicoesLabels[c]}</div>
                    <div class="product-condition">Sem produtos</div>
                </div>
            `;
        }
        return `
            <div class="eval-item">
                <div class="product-name">${condicoesLabels[c]}</div>
                <div class="product-price">🪙 ${data.media}</div>
                <div class="product-condition">${data.total} produto(s)</div>
                <div class="eval-range">💰 ${data.min} - ${data.max}</div>
            </div>
        `;
    }).join('');

    // Renderizar avaliação por categoria
    categoryEvaluationGrid.innerHTML = categorias.map(cat => {
        const data = evalPorCategoria[cat];
        if (!data || data.total === 0) {
            return `
                <div class="eval-item">
                    <div class="product-name">${cat}</div>
                    <div class="product-condition">Sem produtos</div>
                </div>
            `;
        }
        return `
            <div class="eval-item">
                <div class="product-name">${cat}</div>
                <div class="product-price">🪙 ${data.media}</div>
                <div class="product-condition">${data.total} produto(s)</div>
                <div class="eval-range">💰 ${data.min} - ${data.max}</div>
            </div>
        `;
    }).join('');
}

// ======== AUTENTICAÇÃO ========
function loginUser(email, senha) {
    loginError.classList.remove('show');
    const user = db.usuarios.find(u => 
        (u.email === email || u.cpf === email) && u.senha === senha
    );
    if (!user) {
        loginError.textContent = '❌ E-mail/CPF ou senha incorretos';
        loginError.classList.add('show');
        return false;
    }
    currentUser = user;
    currentUserData = user;
    localStorage.setItem('currentUser', JSON.stringify({ email: user.email }));
    showApp();
    showToast(`👋 Bem-vindo(a), ${user.nome}!`);
    return true;
}

function registerUser() {
    registerError.classList.remove('show');
    const nome = regNome.value.trim();
    const cpf = regCpf.value.trim();
    const email = regEmail.value.trim();
    const telefone = regTelefone.value.trim();
    const cidade = regCidade.value.trim();
    const estado = regEstado.value;
    const senha = regSenha.value;

    if (!nome || !cpf || !email || !telefone || !cidade || !estado || !senha) {
        registerError.textContent = '❌ Preencha todos os campos obrigatórios (*)';
        registerError.classList.add('show');
        return;
    }
    if (!isValidCpf(cpf)) {
        registerError.textContent = '❌ CPF inválido. Digite um CPF válido.';
        registerError.classList.add('show');
        return;
    }
    if (senha.length < 6) {
        registerError.textContent = '❌ A senha deve ter pelo menos 6 caracteres.';
        registerError.classList.add('show');
        return;
    }
    if (db.usuarios.some(u => u.email === email)) {
        registerError.textContent = '❌ Este e-mail já está cadastrado.';
        registerError.classList.add('show');
        return;
    }
    if (db.usuarios.some(u => u.cpf === cpf)) {
        registerError.textContent = '❌ Este CPF já está cadastrado.';
        registerError.classList.add('show');
        return;
    }

    const newUser = {
        id: db.nextId++,
        nome,
        cpf,
        email,
        telefone,
        cidade,
        estado,
        senha,
        isAdmin: false,
        moedas: 100,
        totalGanho: 0,
        totalTaxas: 0
    };
    db.usuarios.push(newUser);
    saveDB(db);
    showToast('✅ Conta criada com sucesso! Você ganhou 100 moedas de boas-vindas!');
    regNome.value = '';
    regCpf.value = '';
    regEmail.value = '';
    regTelefone.value = '';
    regCidade.value = '';
    regEstado.value = '';
    regSenha.value = '';
    showLoginBox();
}

function logoutUser() {
    currentUser = null;
    currentUserData = null;
    localStorage.removeItem('currentUser');
    notificationsPanel.classList.remove('active');
    productModal.classList.remove('active');
    chatModal.classList.remove('active');
    authContainer.style.display = 'flex';
    mainApp.classList.remove('active');
    showToast('👋 Você saiu.');
}

function showApp() {
    authContainer.style.display = 'none';
    mainApp.classList.add('active');
    displayName.textContent = currentUser.nome;
    atualizarMoedas();
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
    calcularAvaliacaoPreco();
    atualizarBadge();
    if (currentUser) {
        localInput.value = `${currentUser.cidade}/${currentUser.estado}`;
    }
    verificarBonusDiario();
}

function showLoginBox() {
    loginBox.classList.remove('hidden');
    registerBox.classList.add('hidden');
}

function showRegisterBox() {
    loginBox.classList.add('hidden');
    registerBox.classList.remove('hidden');
}

function checkSession() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const user = db.usuarios.find(u => u.email === data.email);
            if (user) {
                currentUser = user;
                currentUserData = user;
                showApp();
                return true;
            }
        } catch (e) {}
    }
    return false;
}

// ======== BÔNUS DIÁRIO ========
function verificarBonusDiario() {
    const hoje = new Date().toDateString();
    const ultimoBonus = localStorage.getItem('dailyBonus_' + currentUser.email);
    if (ultimoBonus === hoje) {
        dailyBonusStatus.innerHTML = '✅ Bônus já coletado hoje! Volte amanhã.';
        btnDailyBonus.disabled = true;
    } else {
        dailyBonusStatus.innerHTML = '🎁 Clique no botão para coletar seu bônus diário!';
        btnDailyBonus.disabled = false;
    }
}

function coletarBonusDiario() {
    if (!currentUser) {
        showToast('⚠️ Faça login primeiro.');
        return;
    }
    const hoje = new Date().toDateString();
    const ultimoBonus = localStorage.getItem('dailyBonus_' + currentUser.email);
    if (ultimoBonus === hoje) {
        showToast('⚠️ Você já coletou o bônus hoje!');
        return;
    }
    
    const bonus = Math.floor(Math.random() * 30) + 20;
    currentUser.moedas += bonus;
    currentUser.totalGanho = (currentUser.totalGanho || 0) + bonus;
    localStorage.setItem('dailyBonus_' + currentUser.email, hoje);
    saveDB(db);
    atualizarMoedas();
    verificarBonusDiario();
    showToast(`🎉 Você ganhou ${bonus} moedas no bônus diário!`);
}

// ======== CAÇA-NÍQUEL ========
const slotEmojis = ['🍒', '🍋', '🍊', '🍉', '🍇', '⭐', '💎', '7️⃣'];
let slotSpinning = false;

function girarSlot() {
    if (!currentUser) {
        showToast('⚠️ Faça login para jogar.');
        return;
    }
    if (slotSpinning) return;
    if (currentUser.moedas < 5) {
        showToast('⚠️ Você precisa de 5 moedas para girar.');
        return;
    }

    slotSpinning = true;
    btnGirar.disabled = true;
    
    currentUser.moedas -= 5;
    saveDB(db);
    atualizarMoedas();

    let spins = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
        slot1.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        slot2.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        slot3.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        spins++;
        if (spins >= maxSpins) {
            clearInterval(interval);
            const result1 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
            const result2 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
            const result3 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
            slot1.textContent = result1;
            slot2.textContent = result2;
            slot3.textContent = result3;
            
            let reward = 0;
            if (result1 === result2 && result2 === result3) {
                if (result1 === '7️⃣') reward = 100;
                else if (result1 === '💎') reward = 75;
                else if (result1 === '⭐') reward = 50;
                else reward = 30;
            } else if (result1 === result2 || result2 === result3 || result1 === result3) {
                reward = 10;
            }
            
            if (reward > 0) {
                currentUser.moedas += reward;
                currentUser.totalGanho = (currentUser.totalGanho || 0) + reward;
                saveDB(db);
                atualizarMoedas();
                slotReward.textContent = `🎉 Ganhou ${reward} moedas!`;
                showToast(`🎉 Você ganhou ${reward} moedas!`);
            } else {
                slotReward.textContent = '😅 Tente novamente!';
            }
            
            slotSpinning = false;
            btnGirar.disabled = false;
        }
    }, 80);
}

// ======== CRUD PRODUTOS ========
function publicarAnuncio() {
    if (!currentUser) {
        showToast('⚠️ Você precisa estar logado.');
        return;
    }
    const titulo = tituloInput.value.trim();
    const descricao = descInput.value.trim();
    const categoria = categoriaInput.value;
    const local = localInput.value.trim();
    const trocaDesejada = trocaDesejadaInput.value.trim();
    const precoMoedas = parseInt(precoMoedasInput.value);
    const condicao = condicaoInput.value;
    const status = statusInput.value;

    if (!titulo || !descricao || !local) {
        showToast('⚠️ Preencha título, descrição e local.');
        return;
    }
    if (!precoMoedas || precoMoedas < 1) {
        showToast('⚠️ Defina um valor em moedas válido (mínimo 1).');
        return;
    }

    let fotos = [];
    if (fotoInput.files && fotoInput.files.length > 0) {
        let carregadas = 0;
        for (let i = 0; i < fotoInput.files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotos.push(e.target.result);
                carregadas++;
                if (carregadas === fotoInput.files.length) {
                    salvarProduto(titulo, descricao, categoria, local, trocaDesejada, fotos, precoMoedas, condicao, status);
                }
            };
            reader.readAsDataURL(fotoInput.files[i]);
        }
    } else {
        salvarProduto(titulo, descricao, categoria, local, trocaDesejada, [], precoMoedas, condicao, status);
    }
}

function salvarProduto(titulo, descricao, categoria, local, trocaDesejada, fotos, precoMoedas, condicao, status) {
    db.produtos.push({
        id: db.nextId++,
        titulo,
        descricao,
        categoria,
        local,
        trocaDesejada,
        fotos: fotos,
        dono: currentUser.email,
        status: status || 'disponivel',
        condicao: condicao || 'usado',
        precoMoedas: precoMoedas,
        data: new Date().toISOString(),
        vendido: false
    });
    saveDB(db);
    tituloInput.value = '';
    descInput.value = '';
    localInput.value = `${currentUser.cidade}/${currentUser.estado}`;
    trocaDesejadaInput.value = '';
    precoMoedasInput.value = '';
    fotoInput.value = '';
    renderizarAnuncios();
    renderMeusAnuncios();
    calcularAvaliacaoPreco();
    showToast('✅ Produto publicado!');
}

function excluirAnuncio(id) {
    const index = db.produtos.findIndex(p => p.id === id);
    if (index === -1) return;
    if (db.produtos[index].dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('❌ Você só pode excluir seus próprios anúncios.');
        return;
    }
    db.produtos.splice(index, 1);
    saveDB(db);
    renderizarAnuncios();
    renderMeusAnuncios();
    calcularAvaliacaoPreco();
    showToast('🗑️ Anúncio removido.');
}

function atualizarStatus(id, novoStatus) {
    const produto = db.produtos.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('❌ Você só pode alterar status dos seus anúncios.');
        return;
    }
    produto.status = novoStatus;
    saveDB(db);
    renderizarAnuncios();
    renderMeusAnuncios();
    showToast(`✅ Status atualizado para ${getStatusLabel(novoStatus)}`);
}

// ======== COMPRA COM MOEDAS ========
function comprarComMoedas(produtoId) {
    if (!currentUser) {
        showToast('⚠️ Faça login para comprar.');
        return;
    }
    const produto = db.produtos.find(p => p.id === produtoId);
    if (!produto) {
        showToast('❌ Produto não encontrado.');
        return;
    }
    if (produto.dono === currentUser.email) {
        showToast('❌ Você não pode comprar seu próprio produto.');
        return;
    }
    if (produto.status === 'vendido') {
        showToast('❌ Este produto já foi vendido.');
        return;
    }
    
    const preco = produto.precoMoedas;
    const taxa = Math.floor(preco * 0.15);
    const valorFinal = preco - taxa;
    
    if (currentUser.moedas < preco) {
        showToast(`⚠️ Você precisa de ${preco} moedas. Você tem ${currentUser.moedas}.`);
        return;
    }

    if (!confirm(`Confirmar compra de "${produto.titulo}" por ${preco} moedas?\nTaxa administrativa: ${taxa} moedas (15%)\nO vendedor receberá: ${valorFinal} moedas`)) {
        return;
    }

    currentUser.moedas -= preco;
    const vendedor = db.usuarios.find(u => u.email === produto.dono);
    if (vendedor) {
        vendedor.moedas += valorFinal;
        vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal;
        vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa;
    }
    db.adminFees = (db.adminFees || 0) + taxa;
    produto.status = 'vendido';
    produto.vendido = true;

    db.notificacoes.push({
        id: db.nextId++,
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `💰 ${currentUser.nome} comprou "${produto.titulo}" por ${preco} moedas! Você recebeu ${valorFinal} moedas (${taxa} de taxa).`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'compra'
    });

    getChat(produto.id, currentUser.email, produto.dono);

    saveDB(db);
    atualizarMoedas();
    renderizarAnuncios();
    renderMeusAnuncios();
    calcularAvaliacaoPreco();
    atualizarBadge();
    showToast(`✅ Compra realizada! Você pagou ${preco} moedas. Chat disponível para combinar a entrega.`);
}

// ======== TROCAS ========
function solicitarTroca(id) {
    if (!currentUser) {
        showToast('⚠️ Faça login para solicitar troca.');
        return;
    }
    const produto = db.produtos.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) {
        showToast('❌ Você não pode trocar com você mesmo.');
        return;
    }
    if (produto.status === 'vendido') {
        showToast('❌ Este produto já foi vendido.');
        return;
    }

    const notificacao = {
        id: db.nextId++,
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer trocar "${produto.titulo}"`,
        trocaDesejada: produto.trocaDesejada || 'Não especificado',
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao'
    };
    db.notificacoes.push(notificacao);
    
    db.trocas.push({
        id: db.nextId++,
        solicitante: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        dono: produto.dono,
        data: new Date().toISOString(),
        status: 'pendente'
    });
    saveDB(db);
    atualizarBadge();
    showToast(`📩 Solicitação enviada para ${produto.dono}!`);
}

function responderTroca(notifId, resposta) {
    const notif = db.notificacoes.find(n => n.id === notifId);
    if (!notif) return;
    notif.lida = true;
    
    const mensagemResposta = resposta === 'aceitar' 
        ? `${currentUser.nome} aceitou sua troca por "${notif.produtoTitulo}"! 💬 Clique em "Chat" para conversar.`
        : `${currentUser.nome} recusou sua troca por "${notif.produtoTitulo}".`;
    
    db.notificacoes.push({
        id: db.nextId++,
        para: notif.de,
        de: currentUser.email,
        produtoId: notif.produtoId,
        produtoTitulo: notif.produtoTitulo,
        mensagem: mensagemResposta,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'resposta'
    });

    if (resposta === 'aceitar') {
        getChat(notif.produtoId, notif.de, currentUser.email);
        const produto = db.produtos.find(p => p.id === notif.produtoId);
        if (produto && produto.status === 'disponivel') {
            produto.status = 'negociacao';
        }
    }
    
    saveDB(db);
    atualizarBadge();
    renderNotificacoes();
    showToast(resposta === 'aceitar' ? '✅ Troca aceita! Chat disponível.' : '❌ Troca recusada.');
}

// ======== CHAT ========
function abrirChat(produtoId, outroUsuario) {
    if (!currentUser) {
        showToast('⚠️ Faça login para usar o chat.');
        return;
    }
    chatAtual = getChat(produtoId, currentUser.email, outroUsuario);
    const produto = db.produtos.find(p => p.id === produtoId);
    chatTitle.textContent = `💬 Conversa sobre: ${produto ? produto.titulo : 'Produto'}`;
    renderChat();
    chatModal.classList.add('active');
}

function renderChat() {
    if (!chatAtual) return;
    chatMessages.innerHTML = chatAtual.mensagens.map(msg => {
        const isMe = msg.de === currentUser.email;
        const data = new Date(msg.data).toLocaleDateString('pt-BR');
        const hora = new Date(msg.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="chat-message ${isMe ? 'me' : 'other'}">
                <strong>${isMe ? 'Você' : escapeHtml(msg.de)}</strong><br />
                ${escapeHtml(msg.texto)}
                <span class="msg-date">${data} ${hora}</span>
            </div>
        `;
    }).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function enviarMensagem() {
    const texto = chatInput.value.trim();
    if (!texto || !chatAtual) return;
    
    chatAtual.mensagens.push({
        id: db.nextId++,
        de: currentUser.email,
        texto: texto,
        data: new Date().toISOString()
    });
    
    const outro = chatAtual.usuario1 === currentUser.email ? chatAtual.usuario2 : chatAtual.usuario1;
    db.notificacoes.push({
        id: db.nextId++,
        para: outro,
        de: currentUser.email,
        produtoId: chatAtual.produtoId,
        produtoTitulo: 'Chat',
        mensagem: `💬 Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'chat'
    });
    
    saveDB(db);
    chatInput.value = '';
    renderChat();
    atualizarBadge();
}

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensagem();
});

function fecharChat() {
    chatModal.classList.remove('active');
    chatAtual = null;
}

// ======== MODAL PRODUTO ========
function abrirModalProduto(id) {
    const produto = db.produtos.find(p => p.id === id);
    if (!produto) return;
    produtoModalAtual = produto;
    
    const isOwner = currentUser && (produto.dono === currentUser.email);
    const podeExcluir = isOwner || (currentUser && currentUser.isAdmin);
    
    const fotosHtml = produto.fotos && produto.fotos.length > 0 ? 
        produto.fotos.map(f => `<img src="${f}" alt="Foto" onclick="this.parentElement.parentElement.querySelector('.product-image-full').src=this.src" />`).join('') :
        '<div style="color:#94a3b8;padding:20px;">📷 Nenhuma foto</div>';
    
    const fotoPrincipal = produto.fotos && produto.fotos.length > 0 ? 
        produto.fotos[0] : '';
    
    const statusLabel = getStatusLabel(produto.status);
    const statusClass = getStatusClass(produto.status);
    const condicaoLabel = getCondicaoLabel(produto.condicao);
    const condicaoClass = getCondicaoClass(produto.condicao);
    
    const statusOptions = ['disponivel', 'negociacao', 'vendido', 'cancelado'].map(s => 
        `<option value="${s}" ${s === produto.status ? 'selected' : ''}>${getStatusLabel(s)}</option>`
    ).join('');

    const taxa = Math.floor(produto.precoMoedas * 0.15);
    const valorVendedor = produto.precoMoedas - taxa;
    
    // Avaliação de preço para este produto
    const produtosMesmaCondicao = db.produtos.filter(p => p.condicao === produto.condicao && p.status !== 'vendido' && p.id !== produto.id);
    let avaliacaoTexto = '';
    if (produtosMesmaCondicao.length > 0) {
        const soma = produtosMesmaCondicao.reduce((acc, p) => acc + p.precoMoedas, 0);
        const media = Math.round(soma / produtosMesmaCondicao.length);
        const min = Math.min(...produtosMesmaCondicao.map(p => p.precoMoedas));
        const max = Math.max(...produtosMesmaCondicao.map(p => p.precoMoedas));
        const comparacao = produto.precoMoedas > media ? 'acima' : produto.precoMoedas < media ? 'abaixo' : 'na';
        avaliacaoTexto = `📊 Este preço está ${comparacao} da média (${media} moedas) para produtos na mesma condição. Faixa: ${min} - ${max}`;
    }
    
    modalBody.innerHTML = `
        ${fotoPrincipal ? `<img src="${fotoPrincipal}" class="product-image-full" id="mainImage" />` : '<div class="product-image-full" style="display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:1.2rem;">📷 Sem foto principal</div>'}
        <div class="product-gallery">${fotosHtml}</div>
        
        <h2 style="margin-top:15px;">${escapeHtml(produto.titulo)}</h2>
        <span class="category">${escapeHtml(produto.categoria || 'Outros')}</span>
        <span class="condition-badge ${condicaoClass}" style="margin-left:10px;">${condicaoLabel}</span>
        <span class="status-badge ${statusClass}" style="margin-left:10px;">${statusLabel}</span>
        <div style="font-size:1.2rem;font-weight:700;color:#facc15;background:#0f172a;padding:4px 16px;border-radius:20px;display:inline-block;margin:10px 0;">
            🪙 ${produto.precoMoedas}
        </div>
        <div style="font-size:0.8rem;color:#64748b;margin-bottom:10px;">
            💰 Taxa administrativa (15%): ${taxa} • Vendedor recebe: ${valorVendedor}
        </div>
        ${avaliacaoTexto ? `<div style="font-size:0.85rem;color:#475569;background:#f1f5f9;padding:8px 12px;border-radius:8px;margin-bottom:10px;">${avaliacaoTexto}</div>` : ''}
        
        ${isOwner ? `
            <div style="margin:10px 0;">
                <label style="font-size:0.8rem;font-weight:600;color:#475569;">Alterar status:</label>
                <select class="status-select" onchange="atualizarStatus(${produto.id}, this.value)">
                    ${statusOptions}
                </select>
            </div>
        ` : ''}
        
        <div class="product-detail">
            <div class="label">👤 Anunciante</div>
            <div class="value">${escapeHtml(produto.dono)}</div>
            
            <div class="label">📍 Local</div>
            <div class="value">${escapeHtml(produto.local || 'Não informado')}</div>
            
            <div class="label">📝 Descrição</div>
            <div class="value" style="white-space:pre-wrap;">${escapeHtml(produto.descricao)}</div>
            
            ${produto.trocaDesejada ? `
                <div class="label">🔄 Deseja em troca</div>
                <div class="value">${escapeHtml(produto.trocaDesejada)}</div>
            ` : ''}
            
            <div class="label">📅 Anunciado em</div>
            <div class="value">${new Date(produto.data).toLocaleDateString('pt-BR')}</div>
        </div>
        
        <div class="actions-modal">
            ${!isOwner && currentUser && produto.status !== 'vendido' ? `
                <button class="btn-trocar" onclick="solicitarTroca(${produto.id});fecharModal();">🔄 Oferecer Troca</button>
                <button class="btn-coin" onclick="comprarComMoedas(${produto.id});fecharModal();">🪙 Comprar (${produto.precoMoedas})</button>
            ` : ''}
            ${podeExcluir ? `<button class="btn-excluir" onclick="excluirAnuncio(${produto.id});fecharModal();">🗑️ Excluir</button>` : ''}
            ${!currentUser ? `<span style="color:#94a3b8;">🔒 Faça login para interagir</span>` : ''}
            ${currentUser ? `<button class="btn-chat" onclick="abrirChat(${produto.id}, '${produto.dono}');fecharModal();">💬 Chat</button>` : ''}
        </div>
    `;
    
    productModal.classList.add('active');
}

function fecharModal() {
    productModal.classList.remove('active');
    produtoModalAtual = null;
}

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) fecharModal();
});
chatModal.addEventListener('click', (e) => {
    if (e.target === chatModal) fecharChat();
});

// ======== RENDERIZAR ========
function renderizarAnuncios() {
    let produtos = db.produtos || [];
    
    const search = searchText.value.toLowerCase().trim();
    const cidade = searchCidade.value.toLowerCase().trim();
    const estado = searchEstado.value;
    const category = searchCategory.value;
    const status = searchStatus.value;
    
    if (search) {
        produtos = produtos.filter(p => 
            p.titulo.toLowerCase().includes(search) || 
            p.descricao.toLowerCase().includes(search)
        );
    }
    if (cidade) {
        produtos = produtos.filter(p => 
            p.local.toLowerCase().includes(cidade)
        );
    }
    if (estado) {
        produtos = produtos.filter(p => 
            p.local.includes(estado)
        );
    }
    if (category) {
        produtos = produtos.filter(p => p.categoria === category);
    }
    if (status) {
        produtos = produtos.filter(p => p.status === status);
    }

    if (produtos.length === 0) {
        listaEl.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <p>📭 Nenhum produto encontrado.</p>
            </div>
        `;
        return;
    }

    listaEl.innerHTML = produtos.map(p => {
        const isOwner = currentUser && (p.dono === currentUser.email);
        const podeExcluir = isOwner || (currentUser && currentUser.isAdmin);
        const fotoHtml = p.fotos && p.fotos.length > 0 ? 
            `<img src="${p.fotos[0]}" alt="${p.titulo}" class="product-image" />` :
            `<div class="no-image">📷 Sem foto</div>`;
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category">${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="owner">👤 ${escapeHtml(p.dono)}</div>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                ${p.trocaDesejada ? `<div style="font-size:0.85rem;color:#475569;margin-bottom:10px;">🔄 Quer: ${escapeHtml(p.trocaDesejada)}</div>` : ''}
                <div class="actions" onclick="event.stopPropagation();">
                    ${!isOwner && currentUser && p.status !== 'vendido' ? `
                        <button class="btn-trocar" onclick="solicitarTroca(${p.id})">🔄 Troca</button>
                        <button class="btn-coin" onclick="comprarComMoedas(${p.id})">🪙 Comprar</button>
                    ` : ''}
                    ${podeExcluir ? `<button class="btn-excluir" onclick="excluirAnuncio(${p.id})">🗑️ Excluir</button>` : ''}
                    ${currentUser ? `<button class="btn-chat" onclick="abrirChat(${p.id}, '${p.dono}')">💬 Chat</button>` : ''}
                    ${!currentUser ? `<span style="font-size:0.75rem;color:#94a3b8;">🔒 Faça login</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderMeusAnuncios() {
    if (!currentUser) {
        meusAnunciosEl.innerHTML = '<div class="empty-state"><p>Faça login para ver seus anúncios.</p></div>';
        return;
    }
    const meus = db.produtos.filter(p => p.dono === currentUser.email);
    if (meus.length === 0) {
        meusAnunciosEl.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <p>📭 Você ainda não publicou nenhum anúncio.</p>
                <p style="font-size:0.9rem;margin-top:6px;">Vá para a aba "Novo Anúncio" para começar!</p>
            </div>
        `;
        return;
    }

    meusAnunciosEl.innerHTML = meus.map(p => {
        const fotoHtml = p.fotos && p.fotos.length > 0 ? 
            `<img src="${p.fotos[0]}" alt="${p.titulo}" class="product-image" />` :
            `<div class="no-image">📷 Sem foto</div>`;
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category">${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                <div class="actions" onclick="event.stopPropagation();">
                    <button class="btn-excluir" onclick="excluirAnuncio(${p.id})">🗑️ Excluir</button>
                    <button class="btn-chat" onclick="abrirChat(${p.id}, '${p.dono}')">💬 Chat</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderNotificacoes() {
    if (!currentUser) return;
    const notifs = db.notificacoes.filter(n => n.para === currentUser.email);
    
    if (notifs.length === 0) {
        notificationsList.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;">📭 Nenhuma notificação</div>';
        return;
    }

    notificationsList.innerHTML = notifs.sort((a, b) => new Date(b.data) - new Date(a.data)).map(n => {
        const data = new Date(n.data).toLocaleDateString('pt-BR');
        const hora = new Date(n.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        let botoes = '';
        if (n.tipo === 'solicitacao' && !n.lida) {
            botoes = `
                <button class="btn-aceitar" onclick="responderTroca(${n.id}, 'aceitar')">✓ Aceitar</button>
                <button class="btn-recusar" onclick="responderTroca(${n.id}, 'recusar')">✗ Recusar</button>
            `;
        }
        if (n.tipo === 'chat' && !n.lida) {
            botoes = `
                <button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">💬 Responder</button>
            `;
        }
        if (n.tipo === 'resposta' && !n.lida) {
            botoes = `
                <button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">💬 Abrir Chat</button>
            `;
        }
        if (n.tipo === 'compra' && !n.lida) {
            botoes = `
                <button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">💬 Chat</button>
            `;
        }
        
        const icone = n.tipo === 'solicitacao' ? '🔄' : n.tipo === 'chat' ? '💬' : n.tipo === 'compra' ? '💰' : '📩';
        
        return `
            <div class="notification-item" style="${n.lida ? 'opacity:0.6;' : ''}">
                <div class="notif-text">
                    <strong>${icone} ${escapeHtml(n.de)}</strong><br />
                    ${escapeHtml(n.mensagem)}
                    ${n.trocaDesejada ? `<br /><span style="font-size:0.8rem;color:#475569;">🔄 Deseja: ${escapeHtml(n.trocaDesejada)}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;">
                    <span class="notif-date">${data} ${hora}</span>
                    ${botoes}
                </div>
            </div>
        `;
    }).join('');
}

// ======== ADMIN ========
function renderAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) {
        document.getElementById('tabAdmin').style.display = 'none';
        return;
    }
    document.getElementById('tabAdmin').style.display = 'block';
    
    const totalUsers = db.usuarios.length;
    const totalProducts = db.produtos.length;
    const totalCoins = db.usuarios.reduce((acc, u) => acc + (u.moedas || 0), 0);
    const totalFees = db.adminFees || 0;
    
    adminTotalUsers.textContent = totalUsers;
    adminTotalProducts.textContent = totalProducts;
    adminTotalCoins.textContent = totalCoins;
    adminTotalFees.textContent = totalFees;

    adminProductList.innerHTML = db.produtos.map(p => `
        <tr>
            <td style="padding:8px;">${escapeHtml(p.titulo)}</td>
            <td style="padding:8px;">${escapeHtml(p.dono)}</td>
            <td style="padding:8px;">🪙 ${p.precoMoedas}</td>
            <td style="padding:8px;"><span class="condition-badge ${getCondicaoClass(p.condicao)}" style="font-size:0.7rem;">${getCondicaoLabel(p.condicao)}</span></td>
            <td style="padding:8px;"><span class="status-badge ${getStatusClass(p.status)}">${getStatusLabel(p.status)}</span></td>
            <td style="padding:8px;">
                <button class="btn-excluir" onclick="excluirAnuncio(${p.id});renderAdminPanel();" style="padding:4px 12px;font-size:0.75rem;">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// ======== TABS ========
function switchTab(tabId) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
    if (tabId === 'tabMeusAnuncios') {
        renderMeusAnuncios();
    }
    if (tabId === 'tabAdmin') {
        renderAdminPanel();
    }
    if (tabId === 'tabGames') {
        atualizarMoedas();
        verificarBonusDiario();
    }
    if (tabId === 'tabAvaliacao') {
        calcularAvaliacaoPreco();
    }
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// ======== MASCARAS ========
regCpf.addEventListener('input', function() {
    this.value = formatCpf(this.value);
});
regTelefone.addEventListener('input', function() {
    this.value = formatPhone(this.value);
});

// ======== EVENTOS ========
btnLogin.addEventListener('click', () => {
    loginUser(loginEmail.value.trim(), loginSenha.value);
});

loginEmail.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin.click(); });
loginSenha.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin.click(); });

btnRegister.addEventListener('click', registerUser);
showRegister.addEventListener('click', showRegisterBox);
showLogin.addEventListener('click', showLoginBox);
btnLogout.addEventListener('click', logoutUser);
btnPublicar.addEventListener('click', publicarAnuncio);

btnNotifications.addEventListener('click', () => {
    notificationsPanel.classList.toggle('active');
    if (notificationsPanel.classList.contains('active')) {
        renderNotificacoes();
        db.notificacoes.forEach(n => {
            if (n.para === currentUser.email) n.lida = true;
        });
        saveDB(db);
        atualizarBadge();
    }
});

btnSearch.addEventListener('click', () => renderizarAnuncios());
searchText.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
searchCidade.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
searchEstado.addEventListener('change', () => renderizarAnuncios());
searchCategory.addEventListener('change', () => renderizarAnuncios());
searchStatus.addEventListener('change', () => renderizarAnuncios());

document.addEventListener('click', (e) => {
    if (!e.target.closest('#notificationsPanel') && !e.target.closest('#btnNotifications')) {
        notificationsPanel.classList.remove('active');
    }
});

// ======== GAMES ========
btnGirar.addEventListener('click', girarSlot);
btnDailyBonus.addEventListener('click', coletarBonusDiario);

// ======== INICIALIZAÇÃO ========
// Torna funções globais para uso no HTML (onclick)
window.solicitarTroca = solicitarTroca;
window.excluirAnuncio = excluirAnuncio;
window.responderTroca = responderTroca;
window.abrirModalProduto = abrirModalProduto;
window.fecharModal = fecharModal;
window.abrirChat = abrirChat;
window.fecharChat = fecharChat;
window.enviarMensagem = enviarMensagem;
window.atualizarStatus = atualizarStatus;
window.comprarComMoedas = comprarComMoedas;

if (!checkSession()) {
    authContainer.style.display = 'flex';
    mainApp.classList.remove('active');
    showLoginBox();
}

console.log('🔄 TrocaTudo v7 carregado!');
console.log('👥 Usuários:', db.usuarios.length);
console.log('📦 Produtos:', db.produtos.length);
console.log('🎮 Conta Demo: demo@trocatudo.com / 123456');
console.log('💰 Sistema de moedas e avaliação de preço ativo!');