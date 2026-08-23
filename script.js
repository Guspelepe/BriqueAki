// script.js - usando Dexie (IndexedDB)
import db from './db.js';

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentCategory = '';
let allProducts = [];
let filteredProducts = [];

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
const btnSearch = document.getElementById('btnSearch');
const categoriesBar = document.getElementById('categoriesBar');

const btnGirar = document.getElementById('btnGirar');
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');
const slotReward = document.getElementById('slotReward');
const btnDailyBonus = document.getElementById('btnDailyBonus');
const dailyBonusStatus = document.getElementById('dailyBonusStatus');
const coinBalanceDisplay = document.getElementById('coinBalanceDisplay');
const totalCoinsEarned = document.getElementById('totalCoinsEarned');
const totalFeesPaid = document.getElementById('totalFeesPaid');

const tituloProduto = document.getElementById('tituloProduto');
const descricaoProduto = document.getElementById('descricaoProduto');
const categoriaProduto = document.getElementById('categoriaProduto');
const localProduto = document.getElementById('localProduto');
const fotoProduto = document.getElementById('fotoProduto');
const trocaDesejada = document.getElementById('trocaDesejada');
const precoMoedas = document.getElementById('precoMoedas');
const condicaoProduto = document.getElementById('condicaoProduto');
const statusProduto = document.getElementById('statusProduto');
const btnPublicar = document.getElementById('btnPublicar');

const toastEl = document.getElementById('toast');

// ============================================================
// FUNÇÕES PARA GERAR CAMINHO DA IMAGEM
// ============================================================

function getCaminhoImagem(titulo) {
    if (!titulo) return null;
    // Codifica caracteres especiais para URL (espaços, acentos, etc.)
    return `src/${encodeURIComponent(titulo)}.jpg`;
}

function gerarImagemHtml(produto, classe = 'product-image') {
    if (!produto || !produto.titulo) {
        return `<div class="no-image">📷 Sem foto</div>`;
    }
    const caminho = getCaminhoImagem(produto.titulo);
    const titulo = escapeHtml(produto.titulo);
    return `
        <img src="${caminho}" alt="${titulo}" class="${classe}" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.no-image').style.display='flex';" />
        <div class="no-image" style="display:none;">📷 Sem foto</div>
    `;
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function showToast(msg) {
    if (!toastEl) return;
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
        'novo': 'Novo',
        'lacrado': 'Lacrado',
        'seminovo': 'Seminovo',
        'usado': 'Usado - Boas condições',
        'ruim': 'Usado - Precisa de reparos'
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

// ===== RENDERIZAR BARRA DE CATEGORIAS =====
function renderCategories() {
    if (!categoriesBar) return;
    categoriesBar.innerHTML = `
        <div class="category-item ${currentCategory === '' ? 'active' : ''}" data-category="">
            <span class="emoji">🌟</span>
            <span class="label">todos</span>
        </div>
    `;
    Object.keys(categoriasMap).forEach(cat => {
        const { emoji, label } = categoriasMap[cat];
        const active = currentCategory === cat ? 'active' : '';
        categoriesBar.innerHTML += `
            <div class="category-item ${active}" data-category="${cat}">
                <span class="emoji">${emoji}</span>
                <span class="label">${label.toLowerCase()}</span>
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

// ============================================================
// AUTENTICAÇÃO
// ============================================================

async function loginUser(email, senha) {
    if (!loginError) return;
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
    if (currentUser && localProduto) {
        localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
    }
    verificarBonusDiario();
    showToast(`👋 Bem-vindo(a), ${currentUser.nome}!`);
    return true;
}

async function registerUser() {
    if (!registerError) return;
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
    if (cpf.replace(/\D/g, '').length !== 11) {
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
    if (notificationsPanel) notificationsPanel.classList.remove('active');
    const prodModal = document.getElementById('productModal');
    const chatModal = document.getElementById('chatModal');
    if (prodModal) prodModal.classList.remove('active');
    if (chatModal) chatModal.classList.remove('active');
    atualizarHeader();
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
    showToast('👋 Você saiu.');
}

function atualizarHeader() {
    if (currentUser) {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'flex';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'none';
        if (displayName) displayName.textContent = currentUser.nome;
        atualizarMoedas();
        atualizarBadge();
        if (localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (notifBadge) {
            notifBadge.textContent = '0';
            notifBadge.style.display = 'none';
        }
    }
}

function atualizarMoedas() {
    if (currentUser) {
        if (coinsDisplay) coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
        if (coinBalanceDisplay) coinBalanceDisplay.textContent = currentUser.moedas;
        if (totalCoinsEarned) totalCoinsEarned.textContent = currentUser.totalGanho || 0;
        if (totalFeesPaid) totalFeesPaid.textContent = currentUser.totalTaxas || 0;
    }
}

function atualizarBadge() {
    if (!currentUser) {
        if (notifBadge) {
            notifBadge.textContent = '0';
            notifBadge.style.display = 'none';
        }
        return;
    }
    db.notificacoes.where('para').equals(currentUser.email).and(n => !n.lida).count().then(count => {
        if (notifBadge) {
            notifBadge.textContent = count;
            notifBadge.style.display = count > 0 ? 'inline' : 'none';
        }
    });
}

// ============================================================
// CARREGAR PRODUTOS
// ============================================================

async function carregarProdutos() {
    try {
        allProducts = await db.produtos.toArray();
        console.log(`📦 ${allProducts.length} produtos carregados.`);
        if (allProducts.length === 0) {
            showToast('⚠️ Nenhum produto encontrado. Verifique o banco.');
        }
        return allProducts;
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        allProducts = [];
        return [];
    }
}

function ordenarProdutos(produtos) {
    const arr = [...produtos];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================
// RENDERIZAR ANÚNCIOS (COM IMAGENS)
// ============================================================

function renderizarAnuncios() {
    if (!listaEl) return;
    let produtos = [...allProducts];
    
    if (currentCategory) {
        produtos = produtos.filter(p => p.categoria === currentCategory);
    }
    
    const search = searchText ? searchText.value.toLowerCase().trim() : '';
    if (search) {
        produtos = produtos.filter(p => 
            p.titulo.toLowerCase().includes(search) || 
            p.descricao.toLowerCase().includes(search)
        );
    }
    const cidade = searchCidade ? searchCidade.value.toLowerCase().trim() : '';
    if (cidade) {
        produtos = produtos.filter(p => p.local.toLowerCase().includes(cidade));
    }
    const estado = searchEstado ? searchEstado.value : '';
    if (estado) {
        produtos = produtos.filter(p => p.local.includes(estado));
    }
    
    produtos = ordenarProdutos(produtos);
    filteredProducts = produtos;

    if (produtos.length === 0) {
        listaEl.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:50px 20px; color:#64748b;">
                <p>📭 Nenhum produto encontrado.</p>
            </div>
        `;
        return;
    }

    listaEl.innerHTML = produtos.map(p => {
        const isOwner = currentUser && (p.dono === currentUser.email);
        const podeExcluir = isOwner || (currentUser && currentUser.isAdmin);
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        const imagemHtml = gerarImagemHtml(p);
        
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${imagemHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="owner">${escapeHtml(p.dono)}</div>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                ${p.trocaDesejada ? `<div style="font-size:0.85rem;color:#475569;margin-bottom:10px;">Quer: ${escapeHtml(p.trocaDesejada)}</div>` : ''}
                <div class="actions" onclick="event.stopPropagation();">
                    ${!isOwner && currentUser && p.status !== 'vendido' ? `
                        <button class="btn-trocar" onclick="solicitarTroca(${p.id})">Troca</button>
                        <button class="btn-coin" onclick="comprarComMoedas(${p.id})">🪙 Comprar</button>
                    ` : ''}
                    ${podeExcluir ? `<button class="btn-excluir" onclick="excluirAnuncio(${p.id})">Excluir</button>` : ''}
                    ${currentUser ? `<button class="btn-chat" onclick="abrirChat(${p.id}, '${p.dono}')">Chat</button>` : ''}
                    ${!currentUser ? `<span style="font-size:0.75rem;color:#94a3b8;">Faça login</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// RENDERIZAR MEUS ANÚNCIOS (COM IMAGENS)
// ============================================================

function renderMeusAnuncios() {
    if (!meusAnunciosEl) return;
    if (!currentUser) {
        meusAnunciosEl.innerHTML = '<div class="empty-state"><p>Faça login para ver seus anúncios.</p></div>';
        return;
    }
    const meus = allProducts.filter(p => p.dono === currentUser.email);
    if (meus.length === 0) {
        meusAnunciosEl.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <p>Você ainda não publicou nenhum anúncio.</p>
                <p style="font-size:0.9rem;margin-top:6px;">Vá para a aba "Novo Anúncio" para começar!</p>
            </div>
        `;
        return;
    }
    meusAnunciosEl.innerHTML = meus.map(p => {
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        const imagemHtml = gerarImagemHtml(p);
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${imagemHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                <div class="actions" onclick="event.stopPropagation();">
                    <button class="btn-excluir" onclick="excluirAnuncio(${p.id})">Excluir</button>
                    <button class="btn-chat" onclick="abrirChat(${p.id}, '${p.dono}')">Chat</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// ADMIN
// ============================================================

function renderAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) {
        const tabAdmin = document.getElementById('tabAdmin');
        if (tabAdmin) tabAdmin.style.display = 'none';
        return;
    }
    const tabAdmin = document.getElementById('tabAdmin');
    if (tabAdmin) tabAdmin.style.display = 'block';
    
    db.usuarios.count().then(totalUsers => {
        document.getElementById('adminTotalUsers').textContent = totalUsers;
    });
    document.getElementById('adminTotalProducts').textContent = allProducts.length;
    db.usuarios.toArray().then(users => {
        const totalCoins = users.reduce((acc, u) => acc + (u.moedas || 0), 0);
        document.getElementById('adminTotalCoins').textContent = totalCoins;
    });
    // Admin fees (simplificado)
    db.adminFees.toArray().then(fees => {
        const totalFees = fees.reduce((acc, f) => acc + (f.valor || 0), 0);
        document.getElementById('adminTotalFees').textContent = totalFees;
    });

    const list = document.getElementById('adminProductList');
    if (list) {
        list.innerHTML = allProducts.map(p => `
            <tr>
                <td>${escapeHtml(p.titulo)}</td>
                <td>${escapeHtml(p.dono)}</td>
                <td>🪙 ${p.precoMoedas}</td>
                <td><span class="condition-badge ${getCondicaoClass(p.condicao)}">${getCondicaoLabel(p.condicao)}</span></td>
                <td><span class="status-badge ${getStatusClass(p.status)}">${getStatusLabel(p.status)}</span></td>
                <td><button class="btn-excluir" onclick="excluirAnuncio(${p.id});renderAdminPanel();" style="padding:4px 12px;font-size:0.75rem;">Excluir</button></td>
            </tr>
        `).join('');
    }
}

// ============================================================
// AVALIAÇÃO DE PREÇO
// ============================================================

function calcularAvaliacaoPreco() {
    const produtos = allProducts.filter(p => p.status !== 'vendido');
    const condicoes = ['novo', 'lacrado', 'seminovo', 'usado', 'ruim'];
    const condicoesLabels = {
        'novo': 'Novo',
        'lacrado': 'Lacrado',
        'seminovo': 'Seminovo',
        'usado': 'Usado - Boas condições',
        'ruim': 'Usado - Precisa de reparos'
    };
    const grid = document.getElementById('priceEvaluationGrid');
    if (!grid) return;
    grid.innerHTML = condicoes.map(c => {
        const p = produtos.filter(p => p.condicao === c);
        if (p.length === 0) {
            return `<div class="eval-item"><div class="product-name">${condicoesLabels[c]}</div><div class="product-condition">Sem produtos</div></div>`;
        }
        const soma = p.reduce((acc, item) => acc + item.precoMoedas, 0);
        const media = Math.round(soma / p.length);
        const min = Math.min(...p.map(item => item.precoMoedas));
        const max = Math.max(...p.map(item => item.precoMoedas));
        return `
            <div class="eval-item">
                <div class="product-name">${condicoesLabels[c]}</div>
                <div class="product-price">🪙 ${media}</div>
                <div class="product-condition">${p.length} produto(s)</div>
                <div class="eval-range">💰 ${min} - ${max}</div>
            </div>
        `;
    }).join('');

    // Avaliação por categoria
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    const catGrid = document.getElementById('categoryEvaluationGrid');
    if (!catGrid) return;
    catGrid.innerHTML = categorias.map(cat => {
        const p = produtos.filter(p => p.categoria === cat);
        if (p.length === 0) return '';
        const soma = p.reduce((acc, item) => acc + item.precoMoedas, 0);
        const media = Math.round(soma / p.length);
        const min = Math.min(...p.map(item => item.precoMoedas));
        const max = Math.max(...p.map(item => item.precoMoedas));
        return `
            <div class="eval-item">
                <div class="product-name">${cat}</div>
                <div class="product-price">🪙 ${media}</div>
                <div class="product-condition">${p.length} produto(s)</div>
                <div class="eval-range">💰 ${min} - ${max}</div>
            </div>
        `;
    }).join('');
}

// ============================================================
// FUNÇÕES DE INTERAÇÃO (Troca, Compra, Chat, etc.)
// ============================================================

window.solicitarTroca = function(id) {
    if (!currentUser) {
        showToast('Faça login para solicitar troca.');
        return;
    }
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) {
        showToast('Você não pode trocar com você mesmo.');
        return;
    }
    if (produto.status === 'vendido') {
        showToast('Este produto já foi vendido.');
        return;
    }
    db.notificacoes.add({
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer trocar "${produto.titulo}"`,
        trocaDesejada: produto.trocaDesejada || 'Não especificado',
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao'
    }).then(() => {
        showToast(`Solicitação enviada para ${produto.dono}!`);
        atualizarBadge();
    });
};

window.excluirAnuncio = function(id) {
    if (!currentUser) return;
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('Você só pode excluir seus próprios anúncios.');
        return;
    }
    db.produtos.delete(id).then(() => {
        showToast('Anúncio removido.');
        carregarProdutos().then(() => {
            renderizarAnuncios();
            renderMeusAnuncios();
            renderAdminPanel();
            calcularAvaliacaoPreco();
        });
    });
};

window.responderTroca = function(notifId, resposta) {
    db.notificacoes.update(notifId, { lida: true }).then(() => {
        db.notificacoes.where('id').equals(notifId).first().then(notif => {
            if (!notif) return;
            const mensagem = resposta === 'aceitar' 
                ? `${currentUser.nome} aceitou sua troca por "${notif.produtoTitulo}"! Chat disponível.`
                : `${currentUser.nome} recusou sua troca por "${notif.produtoTitulo}".`;
            db.notificacoes.add({
                para: notif.de,
                de: currentUser.email,
                produtoId: notif.produtoId,
                produtoTitulo: notif.produtoTitulo,
                mensagem: mensagem,
                data: new Date().toISOString(),
                lida: false,
                tipo: 'resposta'
            }).then(() => {
                if (resposta === 'aceitar') {
                    db.produtos.update(notif.produtoId, { status: 'negociacao' }).then(() => {
                        carregarProdutos().then(() => renderizarAnuncios());
                    });
                    abrirChat(notif.produtoId, notif.de);
                }
                atualizarBadge();
                renderNotificacoes();
                showToast(resposta === 'aceitar' ? 'Troca aceita! Chat disponível.' : 'Troca recusada.');
            });
        });
    });
};

window.abrirModalProduto = function(id) {
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    const modal = document.getElementById('productModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;
    
    const isOwner = currentUser && (produto.dono === currentUser.email);
    const podeExcluir = isOwner || (currentUser && currentUser.isAdmin);
    const statusLabel = getStatusLabel(produto.status);
    const statusClass = getStatusClass(produto.status);
    const condicaoLabel = getCondicaoLabel(produto.condicao);
    const condicaoClass = getCondicaoClass(produto.condicao);
    const imagemHtml = gerarImagemHtml(produto, 'product-image-full');
    
    body.innerHTML = `
        ${imagemHtml}
        <h2>${escapeHtml(produto.titulo)}</h2>
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <span class="condition-badge ${condicaoClass}" style="margin-left:10px;">${condicaoLabel}</span>
        <div style="font-size:1.2rem;font-weight:700;color:#facc15;background:#0f172a;padding:4px 16px;border-radius:20px;display:inline-block;margin:10px 0;">
            🪙 ${produto.precoMoedas}
        </div>
        <div class="product-detail">
            <div class="label">Anunciante</div>
            <div class="value">${escapeHtml(produto.dono)}</div>
            <div class="label">Local</div>
            <div class="value">${escapeHtml(produto.local || 'Não informado')}</div>
            <div class="label">Descrição</div>
            <div class="value" style="white-space:pre-wrap;">${escapeHtml(produto.descricao)}</div>
            ${produto.trocaDesejada ? `<div class="label">Quer em troca</div><div class="value">${escapeHtml(produto.trocaDesejada)}</div>` : ''}
            <div class="label">Anunciado em</div>
            <div class="value">${new Date(produto.data).toLocaleDateString('pt-BR')}</div>
        </div>
        <div class="actions-modal">
            ${!isOwner && currentUser && produto.status !== 'vendido' ? `
                <button class="btn-trocar" onclick="solicitarTroca(${produto.id});fecharModal();">Troca</button>
                <button class="btn-coin" onclick="comprarComMoedas(${produto.id});fecharModal();">🪙 Comprar (${produto.precoMoedas})</button>
            ` : ''}
            ${podeExcluir ? `<button class="btn-excluir" onclick="excluirAnuncio(${produto.id});fecharModal();">Excluir</button>` : ''}
            ${!currentUser ? `<span style="color:#94a3b8;">Faça login para interagir</span>` : ''}
            ${currentUser ? `<button class="btn-chat" onclick="abrirChat(${produto.id}, '${produto.dono}');fecharModal();">Chat</button>` : ''}
        </div>
    `;
    modal.classList.add('active');
};

window.fecharModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
};

window.abrirChat = function(produtoId, outroUsuario) {
    if (!currentUser) {
        showToast('Faça login para usar o chat.');
        return;
    }
    db.chats.where('produtoId').equals(produtoId).filter(c => 
        (c.usuario1 === currentUser.email && c.usuario2 === outroUsuario) ||
        (c.usuario1 === outroUsuario && c.usuario2 === currentUser.email)
    ).first().then(chat => {
        if (!chat) {
            db.chats.add({
                produtoId: produtoId,
                usuario1: currentUser.email,
                usuario2: outroUsuario,
                mensagens: [],
                data: new Date().toISOString()
            }).then(id => {
                abrirChatExistente(id, produtoId);
            });
        } else {
            abrirChatExistente(chat.id, produtoId);
        }
    });
};

function abrirChatExistente(chatId, produtoId) {
    const modal = document.getElementById('chatModal');
    const messages = document.getElementById('chatMessages');
    const title = document.getElementById('chatTitle');
    if (!modal || !messages || !title) return;
    db.chats.get(chatId).then(chat => {
        const produto = allProducts.find(p => p.id === produtoId);
        title.textContent = `Conversa sobre: ${produto ? produto.titulo : 'Produto'}`;
        messages.innerHTML = chat.mensagens.map(msg => {
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
        messages.scrollTop = messages.scrollHeight;
        modal.classList.add('active');
        window._chatId = chatId;
    });
}

window.fecharChat = function() {
    const modal = document.getElementById('chatModal');
    if (modal) modal.classList.remove('active');
    window._chatId = null;
};

window.enviarMensagem = function() {
    const input = document.getElementById('chatInput');
    if (!input || !window._chatId) return;
    const texto = input.value.trim();
    if (!texto) return;
    const chatId = window._chatId;
    db.chats.get(chatId).then(chat => {
        if (!chat) return;
        const novaMsg = {
            id: Date.now(),
            de: currentUser.email,
            texto: texto,
            data: new Date().toISOString()
        };
        chat.mensagens.push(novaMsg);
        db.chats.update(chatId, { mensagens: chat.mensagens }).then(() => {
            input.value = '';
            const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
            db.notificacoes.add({
                para: outro,
                de: currentUser.email,
                produtoId: chat.produtoId,
                produtoTitulo: 'Chat',
                mensagem: `Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
                data: new Date().toISOString(),
                lida: false,
                tipo: 'chat'
            }).then(() => {
                atualizarBadge();
                abrirChatExistente(chatId, chat.produtoId);
            });
        });
    });
};

window.atualizarStatus = function(id, novoStatus) {
    if (!currentUser) return;
    db.produtos.update(id, { status: novoStatus }).then(() => {
        showToast(`Status atualizado para ${getStatusLabel(novoStatus)}`);
        carregarProdutos().then(() => {
            renderizarAnuncios();
            renderMeusAnuncios();
        });
    });
};

window.comprarComMoedas = function(id) {
    if (!currentUser) {
        showToast('Faça login para comprar.');
        return;
    }
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) {
        showToast('Você não pode comprar seu próprio produto.');
        return;
    }
    if (produto.status === 'vendido') {
        showToast('Este produto já foi vendido.');
        return;
    }
    const preco = produto.precoMoedas;
    const taxa = Math.floor(preco * 0.15);
    const valorFinal = preco - taxa;
    if (currentUser.moedas < preco) {
        showToast(`Você precisa de ${preco} moedas. Você tem ${currentUser.moedas}.`);
        return;
    }
    if (!confirm(`Confirmar compra de "${produto.titulo}" por ${preco} moedas?\nTaxa: ${taxa} moedas (15%)\nVendedor recebe: ${valorFinal} moedas`)) return;
    // Processar compra
    currentUser.moedas -= preco;
    db.usuarios.update(currentUser.id, currentUser);
    db.usuarios.where('email').equals(produto.dono).first().then(vendedor => {
        if (vendedor) {
            vendedor.moedas += valorFinal;
            vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal;
            vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa;
            db.usuarios.update(vendedor.id, vendedor);
        }
        // Registrar taxa
        db.adminFees.add({ valor: taxa, data: new Date().toISOString() });
        // Atualizar produto
        db.produtos.update(id, { status: 'vendido', vendido: true });
        // Notificar vendedor
        db.notificacoes.add({
            para: produto.dono,
            de: currentUser.email,
            produtoId: produto.id,
            produtoTitulo: produto.titulo,
            mensagem: `${currentUser.nome} comprou "${produto.titulo}" por ${preco} moedas! Você recebeu ${valorFinal} moedas (${taxa} de taxa).`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'compra'
        }).then(() => {
            atualizarMoedas();
            carregarProdutos().then(() => {
                renderizarAnuncios();
                renderMeusAnuncios();
                renderAdminPanel();
                calcularAvaliacaoPreco();
                atualizarBadge();
                showToast(`Compra realizada! Você pagou ${preco} moedas. Chat disponível.`);
            });
        });
    });
};

// ============================================================
// NOTIFICAÇÕES
// ============================================================

function renderNotificacoes() {
    if (!notificationsList || !currentUser) return;
    db.notificacoes.where('para').equals(currentUser.email).toArray().then(notifs => {
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
                    <button class="btn-aceitar" onclick="responderTroca(${n.id}, 'aceitar')">Aceitar</button>
                    <button class="btn-recusar" onclick="responderTroca(${n.id}, 'recusar')">Recusar</button>
                `;
            }
            if (n.tipo === 'chat' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">Responder</button>`;
            }
            if (n.tipo === 'resposta' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">Abrir Chat</button>`;
            }
            if (n.tipo === 'compra' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">Chat</button>`;
            }
            return `
                <div class="notification-item" style="${n.lida ? 'opacity:0.6;' : ''}">
                    <div class="notif-text">
                        <strong>${escapeHtml(n.de)}</strong><br />
                        ${escapeHtml(n.mensagem)}
                    </div>
                    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;">
                        <span class="notif-date">${data} ${hora}</span>
                        ${botoes}
                    </div>
                </div>
            `;
        }).join('');
    });
}

function toggleNotifications() {
    if (!currentUser) {
        showToast('Faça login para ver notificações.');
        return;
    }
    if (!notificationsPanel) return;
    notificationsPanel.classList.toggle('active');
    if (notificationsPanel.classList.contains('active')) {
        renderNotificacoes();
        db.notificacoes.where('para').equals(currentUser.email).modify({ lida: true }).then(() => {
            atualizarBadge();
        });
    }
}

// ============================================================
// GAMES
// ============================================================

const slotEmojis = ['🍒', '🍋', '🍊', '🍉', '🍇', '⭐', '💎', '7️⃣'];
let slotSpinning = false;

function verificarBonusDiario() {
    if (!currentUser) {
        if (dailyBonusStatus) dailyBonusStatus.innerHTML = 'Faça login para coletar bônus diário.';
        if (btnDailyBonus) btnDailyBonus.disabled = true;
        return;
    }
    const hoje = new Date().toDateString();
    const ultimoBonus = localStorage.getItem('dailyBonus_' + currentUser.email);
    if (ultimoBonus === hoje) {
        if (dailyBonusStatus) dailyBonusStatus.innerHTML = 'Bônus já coletado hoje! Volte amanhã.';
        if (btnDailyBonus) btnDailyBonus.disabled = true;
    } else {
        if (dailyBonusStatus) dailyBonusStatus.innerHTML = 'Clique no botão para coletar seu bônus diário!';
        if (btnDailyBonus) btnDailyBonus.disabled = false;
    }
}

function coletarBonusDiario() {
    if (!currentUser) {
        showToast('Faça login primeiro.');
        return;
    }
    const hoje = new Date().toDateString();
    const ultimoBonus = localStorage.getItem('dailyBonus_' + currentUser.email);
    if (ultimoBonus === hoje) {
        showToast('Você já coletou o bônus hoje!');
        return;
    }
    const bonus = Math.floor(Math.random() * 30) + 20;
    currentUser.moedas += bonus;
    currentUser.totalGanho = (currentUser.totalGanho || 0) + bonus;
    localStorage.setItem('dailyBonus_' + currentUser.email, hoje);
    db.usuarios.update(currentUser.id, currentUser);
    atualizarMoedas();
    verificarBonusDiario();
    showToast(`🎉 Você ganhou ${bonus} moedas no bônus diário!`);
}

function girarSlot() {
    if (!currentUser) {
        showToast('Faça login para jogar.');
        return;
    }
    if (slotSpinning) return;
    if (currentUser.moedas < 5) {
        showToast('Você precisa de 5 moedas para girar.');
        return;
    }
    if (!slot1 || !slot2 || !slot3) return;

    slotSpinning = true;
    if (btnGirar) btnGirar.disabled = true;
    
    currentUser.moedas -= 5;
    db.usuarios.update(currentUser.id, currentUser);
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
                db.usuarios.update(currentUser.id, currentUser);
                atualizarMoedas();
                if (slotReward) slotReward.textContent = `🎉 Ganhou ${reward} moedas!`;
                showToast(`🎉 Você ganhou ${reward} moedas!`);
            } else {
                if (slotReward) slotReward.textContent = 'Tente novamente!';
            }
            slotSpinning = false;
            if (btnGirar) btnGirar.disabled = false;
        }
    }, 80);
}

// ============================================================
// PUBLICAR ANÚNCIO
// ============================================================

function publicarAnuncio() {
    if (!currentUser) {
        showToast('Você precisa estar logado para publicar.');
        return;
    }
    const titulo = tituloProduto?.value?.trim() || '';
    const descricao = descricaoProduto?.value?.trim() || '';
    const categoria = categoriaProduto?.value || '';
    const local = localProduto?.value?.trim() || '';
    const troca = trocaDesejada?.value?.trim() || '';
    const preco = parseInt(precoMoedas?.value || '0');
    const condicao = condicaoProduto?.value || 'usado';
    const status = statusProduto?.value || 'disponivel';

    if (!titulo || !descricao || !local) {
        showToast('Preencha título, descrição e local.');
        return;
    }
    if (!preco || preco < 1) {
        showToast('Defina um valor em moedas válido (mínimo 1).');
        return;
    }

    const fotos = [];
    if (fotoProduto && fotoProduto.files && fotoProduto.files.length > 0) {
        let carregadas = 0;
        for (let i = 0; i < fotoProduto.files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotos.push(e.target.result);
                carregadas++;
                if (carregadas === fotoProduto.files.length) {
                    salvarProduto(titulo, descricao, categoria, local, troca, fotos, preco, condicao, status);
                }
            };
            reader.readAsDataURL(fotoProduto.files[i]);
        }
    } else {
        salvarProduto(titulo, descricao, categoria, local, troca, [], preco, condicao, status);
    }
}

function salvarProduto(titulo, descricao, categoria, local, troca, fotos, preco, condicao, status) {
    db.produtos.add({
        titulo, descricao, categoria, local,
        trocaDesejada: troca,
        fotos: fotos,
        dono: currentUser.email,
        status: status,
        condicao: condicao,
        precoMoedas: preco,
        data: new Date().toISOString(),
        vendido: false
    }).then(() => {
        showToast('Produto publicado!');
        if (tituloProduto) tituloProduto.value = '';
        if (descricaoProduto) descricaoProduto.value = '';
        if (localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
        if (trocaDesejada) trocaDesejada.value = '';
        if (precoMoedas) precoMoedas.value = '';
        if (fotoProduto) fotoProduto.value = '';
        carregarProdutos().then(() => {
            renderizarAnuncios();
            renderMeusAnuncios();
            renderAdminPanel();
            calcularAvaliacaoPreco();
        });
    });
}

// ============================================================
// TABS
// ============================================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const content = document.getElementById(tabId);
        if (content) content.classList.add('active');
        if (tabId === 'tabMeusAnuncios') renderMeusAnuncios();
        if (tabId === 'tabAdmin') renderAdminPanel();
        if (tabId === 'tabGames') {
            atualizarMoedas();
            verificarBonusDiario();
        }
        if (tabId === 'tabAvaliacao') calcularAvaliacaoPreco();
    });
});

// ============================================================
// EVENTOS
// ============================================================

function initEventListeners() {
    if (btnLogin) btnLogin.addEventListener('click', () => loginUser(loginEmail.value.trim(), loginSenha.value));
    if (loginEmail) loginEmail.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    if (loginSenha) loginSenha.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    if (btnRegister) btnRegister.addEventListener('click', registerUser);
    if (showRegister) showRegister.addEventListener('click', showRegisterBox);
    if (showLogin) showLogin.addEventListener('click', showLoginBox);
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    if (btnPublicar) btnPublicar.addEventListener('click', publicarAnuncio);
    if (btnLoginHeader) btnLoginHeader.addEventListener('click', () => abrirAuthModal('login'));
    if (btnRegisterHeader) btnRegisterHeader.addEventListener('click', () => abrirAuthModal('register'));
    if (closeAuthModal) closeAuthModal.addEventListener('click', fecharAuthModal);
    if (closeAuthModal2) closeAuthModal2.addEventListener('click', fecharAuthModal);
    if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) fecharAuthModal(); });
    if (btnNotifications) btnNotifications.addEventListener('click', toggleNotifications);
    if (btnSearch) btnSearch.addEventListener('click', renderizarAnuncios);
    if (searchText) searchText.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    if (searchCidade) searchCidade.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    if (searchEstado) searchEstado.addEventListener('change', renderizarAnuncios);
    if (btnGirar) btnGirar.addEventListener('click', girarSlot);
    if (btnDailyBonus) btnDailyBonus.addEventListener('click', coletarBonusDiario);
}

function abrirAuthModal(tipo) {
    if (!authModal) return;
    authModal.classList.add('active');
    if (tipo === 'login') {
        if (loginBox) loginBox.classList.remove('hidden');
        if (registerBox) registerBox.classList.add('hidden');
    } else {
        if (loginBox) loginBox.classList.add('hidden');
        if (registerBox) registerBox.classList.remove('hidden');
    }
    if (loginError) loginError.classList.remove('show');
    if (registerError) registerError.classList.remove('show');
}

function fecharAuthModal() {
    if (authModal) authModal.classList.remove('active');
}

function showLoginBox() {
    if (loginBox) loginBox.classList.remove('hidden');
    if (registerBox) registerBox.classList.add('hidden');
    if (loginError) loginError.classList.remove('show');
}

function showRegisterBox() {
    if (loginBox) loginBox.classList.add('hidden');
    if (registerBox) registerBox.classList.remove('hidden');
    if (registerError) registerError.classList.remove('show');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

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
    initEventListeners();
    console.log('✅ Inicialização concluída.');
}

init().catch(console.error);