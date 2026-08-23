// script.js - usando Dexie (IndexedDB)
import db from './db.js';

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentCategory = ''; // filtro de categoria
let allProducts = [];
let filteredProducts = [];
let chatAtual = null;

// ===== DOM ELEMENTOS =====
const authModal = document.getElementById('authModal');
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
const closeAuthModal = document.getElementById('closeAuthModal');
const closeAuthModal2 = document.getElementById('closeAuthModal2');

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

const userInfoLoggedIn = document.getElementById('userInfoLoggedIn');
const userInfoLoggedOut = document.getElementById('userInfoLoggedOut');
const btnLoginHeader = document.getElementById('btnLoginHeader');
const btnRegisterHeader = document.getElementById('btnRegisterHeader');

const listaEl = document.getElementById('listaAnuncios');
const meusAnunciosEl = document.getElementById('meusAnuncios');
const searchText = document.getElementById('searchText');
const searchCidade = document.getElementById('searchCidade');
const searchEstado = document.getElementById('searchEstado');
const searchStatus = document.getElementById('searchStatus');
const btnSearch = document.getElementById('btnSearch');
const categoriesBar = document.getElementById('categoriesBar');

// Formulário de novo anúncio
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

// Modais
const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatTitle = document.getElementById('chatTitle');
const toastEl = document.getElementById('toast');

// Admin
const adminTotalUsers = document.getElementById('adminTotalUsers');
const adminTotalProducts = document.getElementById('adminTotalProducts');
const adminTotalCoins = document.getElementById('adminTotalCoins');
const adminTotalFees = document.getElementById('adminTotalFees');
const adminProductList = document.getElementById('adminProductList');

// Games
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

// Avaliação
const priceEvaluationGrid = document.getElementById('priceEvaluationGrid');
const categoryEvaluationGrid = document.getElementById('categoryEvaluationGrid');

// ===== FUNÇÕES AUXILIARES =====
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

// ===== CATEGORIAS COM EMOJIS =====
const categoriasMap = {
    'Eletrônicos': { emoji: '📱', label: 'Eletrônicos' },
    'Livros': { emoji: '📚', label: 'Livros' },
    'Games': { emoji: '🎮', label: 'Games' },
    'Roupas': { emoji: '👕', label: 'Roupas' },
    'Esportes': { emoji: '⚽', label: 'Esportes' },
    'Casa e Decoração': { emoji: '🏠', label: 'Casa' },
    'Instrumentos Musicais': { emoji: '🎸', label: 'Música' },
    'Colecionáveis': { emoji: '🏷️', label: 'Colecionáveis' },
    'Brinquedos': { emoji: '🧸', label: 'Brinquedos' },
    'Acessórios': { emoji: '⌚', label: 'Acessórios' }
};

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
async function loginUser(email, senha) {
    loginError.classList.remove('show');
    const user = await db.usuarios.where('email').equals(email).first();
    if (!user || user.senha !== senha) {
        const userByCpf = await db.usuarios.where('cpf').equals(email).first();
        if (!userByCpf || userByCpf.senha !== senha) {
            loginError.textContent = '❌ E-mail/CPF ou senha incorretos';
            loginError.classList.add('show');
            return false;
        }
        currentUser = userByCpf;
    } else {
        currentUser = user;
    }
    localStorage.setItem('currentUser', JSON.stringify({ email: currentUser.email }));
    atualizarHeader();
    fecharAuthModal();
    await carregarProdutos();
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
    calcularAvaliacaoPreco();
    atualizarBadge();
    atualizarMoedas();
    if (currentUser) {
        localInput.value = `${currentUser.cidade}/${currentUser.estado}`;
    }
    verificarBonusDiario();
    showToast(`👋 Bem-vindo(a), ${currentUser.nome}!`);
    return true;
}

async function registerUser() {
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
        registerError.textContent = '❌ CPF inválido.';
        registerError.classList.add('show');
        return;
    }
    if (senha.length < 6) {
        registerError.textContent = '❌ A senha deve ter pelo menos 6 caracteres.';
        registerError.classList.add('show');
        return;
    }
    const existing = await db.usuarios.where('email').equals(email).first();
    if (existing) {
        registerError.textContent = '❌ Este e-mail já está cadastrado.';
        registerError.classList.add('show');
        return;
    }
    const existingCpf = await db.usuarios.where('cpf').equals(cpf).first();
    if (existingCpf) {
        registerError.textContent = '❌ Este CPF já está cadastrado.';
        registerError.classList.add('show');
        return;
    }

    await db.usuarios.add({
        nome, cpf, email, telefone, cidade, estado, senha,
        isAdmin: false,
        moedas: 100,
        totalGanho: 0,
        totalTaxas: 0
    });
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
    localStorage.removeItem('currentUser');
    notificationsPanel.classList.remove('active');
    productModal.classList.remove('active');
    chatModal.classList.remove('active');
    atualizarHeader();
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
    showToast('👋 Você saiu.');
}

function atualizarHeader() {
    if (currentUser) {
        userInfoLoggedIn.style.display = 'flex';
        userInfoLoggedOut.style.display = 'none';
        displayName.textContent = currentUser.nome;
        atualizarMoedas();
        atualizarBadge();
        if (localInput) localInput.value = `${currentUser.cidade}/${currentUser.estado}`;
    } else {
        userInfoLoggedIn.style.display = 'none';
        userInfoLoggedOut.style.display = 'flex';
        coinsDisplay.textContent = '🪙 0';
        notifBadge.textContent = '0';
        notifBadge.style.display = 'none';
    }
}

function atualizarMoedas() {
    if (currentUser) {
        coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
        if (coinBalanceDisplay) coinBalanceDisplay.textContent = currentUser.moedas;
        if (totalCoinsEarned) totalCoinsEarned.textContent = currentUser.totalGanho || 0;
        if (totalFeesPaid) totalFeesPaid.textContent = currentUser.totalTaxas || 0;
    }
}

function atualizarBadge() {
    if (!currentUser) {
        notifBadge.textContent = '0';
        notifBadge.style.display = 'none';
        return;
    }
    db.notificacoes.where('para').equals(currentUser.email).and(n => !n.lida).count().then(count => {
        notifBadge.textContent = count;
        notifBadge.style.display = count > 0 ? 'inline' : 'none';
    });
}

// ===== MODAL DE AUTENTICAÇÃO =====
function abrirAuthModal(tipo) {
    authModal.classList.add('active');
    if (tipo === 'login') {
        loginBox.classList.remove('hidden');
        registerBox.classList.add('hidden');
        loginError.classList.remove('show');
    } else {
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
        registerError.classList.remove('show');
    }
}
function fecharAuthModal() {
    authModal.classList.remove('active');
}
function showLoginBox() {
    loginBox.classList.remove('hidden');
    registerBox.classList.add('hidden');
    loginError.classList.remove('show');
}
function showRegisterBox() {
    loginBox.classList.add('hidden');
    registerBox.classList.remove('hidden');
    registerError.classList.remove('show');
}

// ===== BARRA DE CATEGORIAS =====
function renderCategories() {
    categoriesBar.innerHTML = `
        <div class="category-item ${currentCategory === '' ? 'active' : ''}" data-category="">
            <span class="emoji">🌟</span>
            <span class="label">Todos</span>
        </div>
    `;
    Object.keys(categoriasMap).forEach(cat => {
        const { emoji, label } = categoriasMap[cat];
        const active = currentCategory === cat ? 'active' : '';
        categoriesBar.innerHTML += `
            <div class="category-item ${active}" data-category="${cat}">
                <span class="emoji">${emoji}</span>
                <span class="label">${label}</span>
            </div>
        `;
    });
    categoriesBar.querySelectorAll('.category-item').forEach(el => {
        el.addEventListener('click', () => {
            const cat = el.dataset.category;
            currentCategory = cat;
            categoriesBar.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            el.classList.add('active');
            renderizarAnuncios();
        });
    });
}

// ===== CARREGAR PRODUTOS DO INDEXEDDB =====
async function carregarProdutos() {
    allProducts = await db.produtos.toArray();
    // Se não houver produtos, aguardar um pouco e tentar novamente (população assíncrona)
    if (allProducts.length === 0) {
        // Tentar recarregar após 500ms (pode ser que o populate ainda esteja rodando)
        await new Promise(resolve => setTimeout(resolve, 500));
        allProducts = await db.produtos.toArray();
        if (allProducts.length === 0) {
            showToast('⚠️ Nenhum produto encontrado. Verifique o banco.');
        }
    }
    return allProducts;
}

// ===== ORDENAR PRODUTOS (embaralhar) =====
function ordenarProdutos(produtos) {
    // Se não logado ou sem interesses, ordem aleatória
    return shuffleArray(produtos);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ===== RENDERIZAR ANÚNCIOS =====
function renderizarAnuncios() {
    let produtos = [...allProducts];
    
    if (currentCategory) {
        produtos = produtos.filter(p => p.categoria === currentCategory);
    }
    const search = searchText.value.toLowerCase().trim();
    if (search) {
        produtos = produtos.filter(p => 
            p.titulo.toLowerCase().includes(search) || 
            p.descricao.toLowerCase().includes(search)
        );
    }
    const cidade = searchCidade.value.toLowerCase().trim();
    if (cidade) {
        produtos = produtos.filter(p => p.local.toLowerCase().includes(cidade));
    }
    const estado = searchEstado.value;
    if (estado) {
        produtos = produtos.filter(p => p.local.includes(estado));
    }
    const status = searchStatus.value;
    if (status) {
        produtos = produtos.filter(p => p.status === status);
    }
    
    produtos = ordenarProdutos(produtos);
    filteredProducts = produtos;

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
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
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

// ===== RENDERIZAR MEUS ANÚNCIOS =====
function renderMeusAnuncios() {
    if (!currentUser) {
        meusAnunciosEl.innerHTML = '<div class="empty-state"><p>Faça login para ver seus anúncios.</p></div>';
        return;
    }
    const meus = allProducts.filter(p => p.dono === currentUser.email);
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
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
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

// ===== PUBLICAR ANÚNCIO =====
async function publicarAnuncio() {
    if (!currentUser) {
        showToast('⚠️ Você precisa estar logado para publicar.');
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
        for (let i = 0; i < fotoInput.files.length; i++) {
            const reader = new FileReader();
            const promise = new Promise((resolve) => {
                reader.onload = function(e) { resolve(e.target.result); };
            });
            reader.readAsDataURL(fotoInput.files[i]);
            fotos.push(await promise);
        }
    }

    const novoProduto = {
        titulo, descricao, categoria, local, trocaDesejada, fotos,
        dono: currentUser.email,
        status: status || 'disponivel',
        condicao: condicao || 'usado',
        precoMoedas: precoMoedas,
        data: new Date().toISOString(),
        vendido: false
    };
    const id = await db.produtos.add(novoProduto);
    const produtoSalvo = { ...novoProduto, id };
    allProducts.push(produtoSalvo);
    
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

// ===== EXCLUIR ANÚNCIO =====
async function excluirAnuncio(id) {
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('❌ Você só pode excluir seus próprios anúncios.');
        return;
    }
    await db.produtos.delete(id);
    allProducts = allProducts.filter(p => p.id !== id);
    renderizarAnuncios();
    renderMeusAnuncios();
    calcularAvaliacaoPreco();
    showToast('🗑️ Anúncio removido.');
}

// ===== ATUALIZAR STATUS =====
async function atualizarStatus(id, novoStatus) {
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('❌ Você só pode alterar status dos seus anúncios.');
        return;
    }
    produto.status = novoStatus;
    await db.produtos.update(id, { status: novoStatus });
    renderizarAnuncios();
    renderMeusAnuncios();
    showToast(`✅ Status atualizado para ${getStatusLabel(novoStatus)}`);
}

// ===== COMPRA COM MOEDAS =====
async function comprarComMoedas(produtoId) {
    if (!currentUser) {
        showToast('⚠️ Faça login para comprar.');
        return;
    }
    const produto = allProducts.find(p => p.id === produtoId);
    if (!produto) { showToast('❌ Produto não encontrado.'); return; }
    if (produto.dono === currentUser.email) { showToast('❌ Você não pode comprar seu próprio produto.'); return; }
    if (produto.status === 'vendido') { showToast('❌ Este produto já foi vendido.'); return; }
    
    const preco = produto.precoMoedas;
    const taxa = Math.floor(preco * 0.15);
    const valorFinal = preco - taxa;
    if (currentUser.moedas < preco) {
        showToast(`⚠️ Você precisa de ${preco} moedas. Você tem ${currentUser.moedas}.`);
        return;
    }
    if (!confirm(`Confirmar compra de "${produto.titulo}" por ${preco} moedas?\nTaxa: ${taxa}\nVendedor recebe: ${valorFinal}`)) return;

    currentUser.moedas -= preco;
    const vendedor = await db.usuarios.where('email').equals(produto.dono).first();
    if (vendedor) {
        vendedor.moedas += valorFinal;
        vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal;
        vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa;
        await db.usuarios.update(vendedor.id, { moedas: vendedor.moedas, totalGanho: vendedor.totalGanho, totalTaxas: vendedor.totalTaxas });
    }
    // Atualizar adminFees (não temos uma tabela específica, mas podemos guardar em um registro separado)
    let adminFeeRecord = await db.adminFees.toArray();
    if (adminFeeRecord.length === 0) {
        await db.adminFees.add({ total: taxa });
    } else {
        await db.adminFees.update(adminFeeRecord[0].id, { total: adminFeeRecord[0].total + taxa });
    }
    produto.status = 'vendido';
    produto.vendido = true;
    await db.produtos.update(produtoId, { status: 'vendido', vendido: true });
    
    await db.notificacoes.add({
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `💰 ${currentUser.nome} comprou "${produto.titulo}" por ${preco} moedas! Você recebeu ${valorFinal} moedas (${taxa} de taxa).`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'compra'
    });
    
    // Atualizar arrays locais
    allProducts = await db.produtos.toArray();
    await atualizarUserLocal();
    atualizarMoedas();
    renderizarAnuncios();
    renderMeusAnuncios();
    calcularAvaliacaoPreco();
    atualizarBadge();
    showToast(`✅ Compra realizada! Você pagou ${preco} moedas. Chat disponível.`);
}

async function atualizarUserLocal() {
    const user = await db.usuarios.where('email').equals(currentUser.email).first();
    if (user) currentUser = user;
}

// ===== SOLICITAR TROCA =====
async function solicitarTroca(id) {
    if (!currentUser) {
        showToast('⚠️ Faça login para solicitar troca.');
        return;
    }
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) {
        showToast('❌ Você não pode trocar com você mesmo.');
        return;
    }
    if (produto.status === 'vendido') {
        showToast('❌ Este produto já foi vendido.');
        return;
    }

    await db.notificacoes.add({
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer trocar "${produto.titulo}"`,
        trocaDesejada: produto.trocaDesejada || 'Não especificado',
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao'
    });
    await db.trocas.add({
        solicitante: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        dono: produto.dono,
        data: new Date().toISOString(),
        status: 'pendente'
    });
    atualizarBadge();
    showToast(`📩 Solicitação enviada para ${produto.dono}!`);
}

// ===== RESPONDER TROCA =====
async function responderTroca(notifId, resposta) {
    const notif = await db.notificacoes.get(notifId);
    if (!notif) return;
    await db.notificacoes.update(notifId, { lida: true });
    
    const mensagemResposta = resposta === 'aceitar' 
        ? `${currentUser.nome} aceitou sua troca por "${notif.produtoTitulo}"! 💬 Clique em "Chat" para conversar.`
        : `${currentUser.nome} recusou sua troca por "${notif.produtoTitulo}".`;
    
    await db.notificacoes.add({
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
        const produto = allProducts.find(p => p.id === notif.produtoId);
        if (produto && produto.status === 'disponivel') {
            produto.status = 'negociacao';
            await db.produtos.update(produto.id, { status: 'negociacao' });
        }
    }
    atualizarBadge();
    renderNotificacoes();
    showToast(resposta === 'aceitar' ? '✅ Troca aceita! Chat disponível.' : '❌ Troca recusada.');
}

// ===== CHAT =====
function abrirChat(produtoId, outroUsuario) {
    if (!currentUser) {
        showToast('⚠️ Faça login para usar o chat.');
        return;
    }
    chatAtual = getChat(produtoId, currentUser.email, outroUsuario);
    const produto = allProducts.find(p => p.id === produtoId);
    chatTitle.textContent = `💬 Conversa sobre: ${produto ? produto.titulo : 'Produto'}`;
    renderChat();
    chatModal.classList.add('active');
}

function getChat(produtoId, usuario1, usuario2) {
    // Buscar chat existente
    let chat = db.chats.filter(c => c.produtoId === produtoId && 
        ((c.usuario1 === usuario1 && c.usuario2 === usuario2) || 
         (c.usuario1 === usuario2 && c.usuario2 === usuario1))).first();
    if (!chat) {
        chat = {
            produtoId: produtoId,
            usuario1: usuario1,
            usuario2: usuario2,
            mensagens: [],
            data: new Date().toISOString()
        };
        db.chats.add(chat).then(id => chat.id = id);
    }
    return chat;
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

async function enviarMensagem() {
    const texto = chatInput.value.trim();
    if (!texto || !chatAtual) return;
    
    chatAtual.mensagens.push({
        de: currentUser.email,
        texto: texto,
        data: new Date().toISOString()
    });
    await db.chats.update(chatAtual.id, { mensagens: chatAtual.mensagens });
    
    const outro = chatAtual.usuario1 === currentUser.email ? chatAtual.usuario2 : chatAtual.usuario1;
    await db.notificacoes.add({
        para: outro,
        de: currentUser.email,
        produtoId: chatAtual.produtoId,
        produtoTitulo: 'Chat',
        mensagem: `💬 Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'chat'
    });
    
    chatInput.value = '';
    renderChat();
    atualizarBadge();
}

function fecharChat() {
    chatModal.classList.remove('active');
    chatAtual = null;
}

// ===== MODAL PRODUTO =====
async function abrirModalProduto(id) {
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    
    const isOwner = currentUser && (produto.dono === currentUser.email);
    const podeExcluir = isOwner || (currentUser && currentUser.isAdmin);
    const fotosHtml = produto.fotos && produto.fotos.length > 0 ? 
        produto.fotos.map(f => `<img src="${f}" alt="Foto" onclick="this.parentElement.parentElement.querySelector('.product-image-full').src=this.src" />`).join('') :
        '<div style="color:#94a3b8;padding:20px;">📷 Nenhuma foto</div>';
    const fotoPrincipal = produto.fotos && produto.fotos.length > 0 ? produto.fotos[0] : '';
    const statusLabel = getStatusLabel(produto.status);
    const statusClass = getStatusClass(produto.status);
    const condicaoLabel = getCondicaoLabel(produto.condicao);
    const condicaoClass = getCondicaoClass(produto.condicao);
    const statusOptions = ['disponivel', 'negociacao', 'vendido', 'cancelado'].map(s => 
        `<option value="${s}" ${s === produto.status ? 'selected' : ''}>${getStatusLabel(s)}</option>`
    ).join('');
    const taxa = Math.floor(produto.precoMoedas * 0.15);
    const valorVendedor = produto.precoMoedas - taxa;
    const catEmoji = categoriasMap[produto.categoria]?.emoji || '📦';
    
    modalBody.innerHTML = `
        ${fotoPrincipal ? `<img src="${fotoPrincipal}" class="product-image-full" id="mainImage" />` : '<div class="product-image-full" style="display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:1.2rem;">📷 Sem foto principal</div>'}
        <div class="product-gallery">${fotosHtml}</div>
        <h2 style="margin-top:15px;">${catEmoji} ${escapeHtml(produto.titulo)}</h2>
        <span class="category-tag">${escapeHtml(produto.categoria || 'Outros')}</span>
        <span class="condition-badge ${condicaoClass}" style="margin-left:10px;">${condicaoLabel}</span>
        <span class="status-badge ${statusClass}" style="margin-left:10px;">${statusLabel}</span>
        <div style="font-size:1.2rem;font-weight:700;color:#facc15;background:#0f172a;padding:4px 16px;border-radius:20px;display:inline-block;margin:10px 0;">
            🪙 ${produto.precoMoedas}
        </div>
        <div style="font-size:0.8rem;color:#64748b;margin-bottom:10px;">
            💰 Taxa (15%): ${taxa} • Vendedor recebe: ${valorVendedor}
        </div>
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
}

// ===== NOTIFICAÇÕES =====
async function renderNotificacoes() {
    if (!currentUser) return;
    const notifs = await db.notificacoes.where('para').equals(currentUser.email).sortBy('data');
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

// ===== ADMIN =====
async function renderAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) {
        document.getElementById('tabAdmin').style.display = 'none';
        return;
    }
    document.getElementById('tabAdmin').style.display = 'block';
    const usuarios = await db.usuarios.toArray();
    const produtos = await db.produtos.toArray();
    const totalCoins = usuarios.reduce((acc, u) => acc + (u.moedas || 0), 0);
    const adminFeeRecord = await db.adminFees.toArray();
    const totalFees = adminFeeRecord.length > 0 ? adminFeeRecord[0].total : 0;
    
    adminTotalUsers.textContent = usuarios.length;
    adminTotalProducts.textContent = produtos.length;
    adminTotalCoins.textContent = totalCoins;
    adminTotalFees.textContent = totalFees;

    adminProductList.innerHTML = produtos.map(p => `
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

// ===== AVALIAÇÃO DE PREÇO =====
function calcularAvaliacaoPreco() {
    const produtos = allProducts;
    const condicoes = ['novo', 'lacrado', 'seminovo', 'usado', 'ruim'];
    const condicoesLabels = {
        'novo': '🆕 Novo',
        'lacrado': '📦 Lacrado',
        'seminovo': '✨ Seminovo',
        'usado': '👍 Usado - Boas condições',
        'ruim': '⚠️ Usado - Precisa de reparos'
    };
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

    priceEvaluationGrid.innerHTML = condicoes.map(c => {
        const data = evalPorCondicao[c];
        if (data.total === 0) {
            return `<div class="eval-item"><div class="product-name">${condicoesLabels[c]}</div><div class="product-condition">Sem produtos</div></div>`;
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

    categoryEvaluationGrid.innerHTML = categorias.map(cat => {
        const data = evalPorCategoria[cat];
        if (!data || data.total === 0) {
            return `<div class="eval-item"><div class="product-name">${cat}</div><div class="product-condition">Sem produtos</div></div>`;
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

// ===== GAMES =====
const slotEmojis = ['🍒', '🍋', '🍊', '🍉', '🍇', '⭐', '💎', '7️⃣'];
let slotSpinning = false;

function girarSlot() {
    if (!currentUser) { showToast('⚠️ Faça login para jogar.'); return; }
    if (slotSpinning) return;
    if (currentUser.moedas < 5) { showToast('⚠️ Você precisa de 5 moedas para girar.'); return; }
    slotSpinning = true;
    btnGirar.disabled = true;
    currentUser.moedas -= 5;
    db.usuarios.update(currentUser.id, { moedas: currentUser.moedas });
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
                db.usuarios.update(currentUser.id, { moedas: currentUser.moedas, totalGanho: currentUser.totalGanho });
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

function verificarBonusDiario() {
    if (!currentUser) {
        dailyBonusStatus.innerHTML = '🔒 Faça login para coletar bônus diário.';
        btnDailyBonus.disabled = true;
        return;
    }
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

async function coletarBonusDiario() {
    if (!currentUser) { showToast('⚠️ Faça login primeiro.'); return; }
    const hoje = new Date().toDateString();
    const ultimoBonus = localStorage.getItem('dailyBonus_' + currentUser.email);
    if (ultimoBonus === hoje) { showToast('⚠️ Você já coletou o bônus hoje!'); return; }
    const bonus = Math.floor(Math.random() * 30) + 20;
    currentUser.moedas += bonus;
    currentUser.totalGanho = (currentUser.totalGanho || 0) + bonus;
    await db.usuarios.update(currentUser.id, { moedas: currentUser.moedas, totalGanho: currentUser.totalGanho });
    localStorage.setItem('dailyBonus_' + currentUser.email, hoje);
    atualizarMoedas();
    verificarBonusDiario();
    showToast(`🎉 Você ganhou ${bonus} moedas no bônus diário!`);
}

// ===== TABS =====
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
    if (tabId === 'tabMeusAnuncios') renderMeusAnuncios();
    if (tabId === 'tabAdmin') renderAdminPanel();
    if (tabId === 'tabGames') { atualizarMoedas(); verificarBonusDiario(); }
    if (tabId === 'tabAvaliacao') calcularAvaliacaoPreco();
}

// ===== EVENT LISTENERS =====
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

btnLoginHeader.addEventListener('click', () => abrirAuthModal('login'));
btnRegisterHeader.addEventListener('click', () => abrirAuthModal('register'));

closeAuthModal.addEventListener('click', fecharAuthModal);
closeAuthModal2.addEventListener('click', fecharAuthModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) fecharAuthModal(); });

btnNotifications.addEventListener('click', async () => {
    if (!currentUser) { showToast('🔒 Faça login para ver notificações.'); return; }
    notificationsPanel.classList.toggle('active');
    if (notificationsPanel.classList.contains('active')) {
        await renderNotificacoes();
        const notifs = await db.notificacoes.where('para').equals(currentUser.email).toArray();
        for (let n of notifs) {
            if (!n.lida) {
                await db.notificacoes.update(n.id, { lida: true });
            }
        }
        atualizarBadge();
    }
});

btnSearch.addEventListener('click', renderizarAnuncios);
searchText.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
searchCidade.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
searchEstado.addEventListener('change', renderizarAnuncios);
searchStatus.addEventListener('change', renderizarAnuncios);

document.addEventListener('click', (e) => {
    if (!e.target.closest('#notificationsPanel') && !e.target.closest('#btnNotifications')) {
        notificationsPanel.classList.remove('active');
    }
});

// Games
btnGirar.addEventListener('click', girarSlot);
btnDailyBonus.addEventListener('click', coletarBonusDiario);

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Máscaras
regCpf.addEventListener('input', function() { this.value = formatCpf(this.value); });
regTelefone.addEventListener('input', function() { this.value = formatPhone(this.value); });

// ===== INICIALIZAÇÃO =====
async function init() {
    await carregarProdutos();
    renderCategories();
    renderizarAnuncios();
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const user = await db.usuarios.where('email').equals(data.email).first();
            if (user) {
                currentUser = user;
                atualizarHeader();
                renderMeusAnuncios();
                renderAdminPanel();
                calcularAvaliacaoPreco();
                atualizarBadge();
                verificarBonusDiario();
            }
        } catch (e) {}
    }
    // Expor funções globais para uso no HTML (onclick)
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
}

init();

console.log('🔄 TrocaTudo v8 carregado com Dexie!');