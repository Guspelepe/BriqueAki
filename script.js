// script.js - usando Dexie (IndexedDB)
import db from './db.js';

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentCategory = '';
let allProducts = [];
let filteredProducts = [];
let avaliacaoParaTrocaId = null;

// ===== DOM ELEMENTOS =====
const authModal = document.getElementById('authModal');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const loginEmail = document.getElementById('loginEmail');
const loginSenha = document.getElementById('loginSenha');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

const regNome = document.getElementById('regNome');
const regCpf = document.getElementById('regCpf');
const regEmail = document.getElementById('regEmail');
const regTelefone = document.getElementById('regTelefone');
const regCidade = document.getElementById('regCidade');
const regEstado = document.getElementById('regEstado');
const regSenha = document.getElementById('regSenha');
const regCodigoIndicacao = document.getElementById('regCodigoIndicacao');

const displayName = document.getElementById('displayName');
const coinsDisplay = document.getElementById('coinsDisplay');
const btnLogout = document.getElementById('btnLogout');
const btnNotifications = document.getElementById('btnNotifications');
const notificationsPanel = document.getElementById('notificationsPanel');
const notificationsList = document.getElementById('notificationsList');
const notifBadge = document.getElementById('notifBadge');

const userInfoLoggedIn = document.getElementById('userInfoLoggedIn');
const userInfoLoggedOut = document.getElementById('userInfoLoggedOut');

const listaEl = document.getElementById('listaAnuncios');
const meusAnunciosEl = document.getElementById('meusAnuncios');
const searchText = document.getElementById('searchText');
const searchCidade = document.getElementById('searchCidade');
const searchEstado = document.getElementById('searchEstado');
const btnSearch = document.getElementById('btnSearch');
const categoriesBar = document.getElementById('categoriesBar');

const tituloProduto = document.getElementById('tituloProduto');
const descricaoProduto = document.getElementById('descricaoProduto');
const categoriaProduto = document.getElementById('categoriaProduto');
const localProduto = document.getElementById('localProduto');
const fotoProduto = document.getElementById('fotoProduto');
const trocaDesejada = document.getElementById('trocaDesejada');
const precoMoedas = document.getElementById('precoMoedas');
const condicaoProduto = document.getElementById('condicaoProduto');
const statusProduto = document.getElementById('statusProduto');
const tipoTrocaProduto = document.getElementById('tipoTrocaProduto');
const btnPublicar = document.getElementById('btnPublicar');

const minhasTrocasList = document.getElementById('minhasTrocasList');
const avaliacoesList = document.getElementById('avaliacoesList');
const meuCodigoIndicacao = document.getElementById('meuCodigoIndicacao');
const inputUsarCodigo = document.getElementById('inputUsarCodigo');
const btnUsarCodigo = document.getElementById('btnUsarCodigo');
const indicadosList = document.getElementById('indicadosList');

const toastEl = document.getElementById('toast');

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

function getTrocaStatusLabel(status) {
    const labels = {
        'pendente': 'Pendente',
        'aceita': 'Aceita',
        'entregue': 'Entregue',
        'recebido': 'Recebido',
        'concluida': 'Concluída',
        'cancelada': 'Cancelada'
    };
    return labels[status] || status;
}

function getTrocaStatusClass(status) {
    const classes = {
        'pendente': 'troca-status-pendente',
        'aceita': 'troca-status-aceita',
        'entregue': 'troca-status-entregue',
        'recebido': 'troca-status-recebido',
        'concluida': 'troca-status-concluida',
        'cancelada': 'troca-status-cancelada'
    };
    return classes[status] || 'troca-status-pendente';
}

// ============================================================
// FUNÇÕES PARA GERAR CAMINHO DA IMAGEM
// ============================================================
function getCaminhoImagem(titulo) {
    if (!titulo) return null;
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

// ===== CATEGORIAS =====
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
    'Acessórios': { emoji: '⌚', label: 'Acessórios' },
    'Serviços': { emoji: '🛠️', label: 'Serviços' }
};

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
    renderMinhasTrocas();
    renderAvaliacoes();
    atualizarBadge();
    atualizarMoedas();
    if (currentUser && localProduto) {
        localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
    }
    renderChats();
    atualizarIndicacao();
    showToast(`👋 Bem-vindo(a), ${currentUser.nome}!`);
    return true;
}

// ============================================================
// FUNÇÃO DE REGISTRO - ALTERADA (CÓDIGO OPCIONAL + GERADO)
// ============================================================
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
    const codigoIndicacao = regCodigoIndicacao.value.trim().toUpperCase();

    // Validações dos campos obrigatórios
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
    
    // Verifica se e-mail já existe
    const existing = await db.usuarios.where('email').equals(email).first();
    if (existing) {
        registerError.textContent = '❌ Este e-mail já está cadastrado.';
        registerError.classList.add('show');
        return;
    }
    
    // Verifica se CPF já existe
    const existingCpf = await db.usuarios.where('cpf').equals(cpf).first();
    if (existingCpf) {
        registerError.textContent = '❌ Este CPF já está cadastrado.';
        registerError.classList.add('show');
        return;
    }

    // ============================================================
    // Código de indicação é OPCIONAL
    // ============================================================
    let indicadoPor = null;
    let bonusIndicacao = 0;

    // Só processa o código se o usuário digitou algo
    if (codigoIndicacao) {
        const indicador = await db.usuarios.where('codigoIndicacao').equals(codigoIndicacao).first();
        if (indicador) {
            indicadoPor = indicador.email;
            bonusIndicacao = 20;
            
            // Registra a indicação
            await db.indicacoes.add({
                codigo: codigoIndicacao,
                criadoPor: indicador.email,
                usadoPor: email,
                bonusRecebido: 20,
                dataUso: new Date().toISOString()
            });
            
            // Bônus para o indicador
            indicador.moedas += 20;
            await db.usuarios.update(indicador.id, indicador);
            showToast(`🎉 Código válido! Você ganhou 20 moedas extras e seu amigo também!`);
        } else {
            registerError.textContent = '❌ Código de indicação inválido.';
            registerError.classList.add('show');
            return;
        }
    }

    // ============================================================
    // GERA CÓDIGO ALEATÓRIO PARA O NOVO USUÁRIO
    // ============================================================
    function gerarCodigoIndicacao(nome) {
        const prefix = nome.substring(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${random}`;
    }

    let codigoGerado = gerarCodigoIndicacao(nome);
    
    // Verifica se o código gerado já existe (para evitar duplicidade)
    let codigoExiste = await db.usuarios.where('codigoIndicacao').equals(codigoGerado).first();
    let tentativas = 0;
    while (codigoExiste && tentativas < 10) {
        codigoGerado = gerarCodigoIndicacao(nome + Math.random().toString(36).substring(2, 4));
        codigoExiste = await db.usuarios.where('codigoIndicacao').equals(codigoGerado).first();
        tentativas++;
    }

    // Cria o novo usuário
    await db.usuarios.add({
        nome, 
        cpf, 
        email, 
        telefone, 
        cidade, 
        estado, 
        senha,
        isAdmin: false,
        moedas: 100 + bonusIndicacao,
        totalGanho: 0,
        totalTaxas: 0,
        codigoIndicacao: codigoGerado,
        indicadoPor: indicadoPor
    });

    showToast(`✅ Conta criada! Você ganhou ${100 + bonusIndicacao} moedas! Seu código: ${codigoGerado}`);
    
    // Limpa o formulário
    regNome.value = '';
    regCpf.value = '';
    regEmail.value = '';
    regTelefone.value = '';
    regCidade.value = '';
    regEstado.value = '';
    regSenha.value = '';
    regCodigoIndicacao.value = '';
    
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
    renderMinhasTrocas();
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
        const adminBtn = document.getElementById('tabAdminBtn');
        if (adminBtn) {
            adminBtn.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
        }
        atualizarIndicacao();
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (notifBadge) {
            notifBadge.textContent = '0';
            notifBadge.style.display = 'none';
        }
        const adminBtn = document.getElementById('tabAdminBtn');
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

function atualizarMoedas() {
    if (currentUser) {
        if (coinsDisplay) coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
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
// INDICAÇÃO
// ============================================================
async function atualizarIndicacao() {
    if (!currentUser) return;
    
    if (meuCodigoIndicacao) {
        meuCodigoIndicacao.textContent = currentUser.codigoIndicacao || 'Gerar código...';
    }

    if (indicadosList) {
        const indicados = await db.usuarios.where('indicadoPor').equals(currentUser.email).toArray();
        if (indicados.length === 0) {
            indicadosList.innerHTML = '<p style="color:#94a3b8;">Nenhuma pessoa indicada ainda.</p>';
        } else {
            indicadosList.innerHTML = indicados.map(u => `
                <div style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                    ${escapeHtml(u.nome)} - ${escapeHtml(u.email)}
                </div>
            `).join('');
        }
    }
}

window.copiarCodigo = function() {
    if (!currentUser || !meuCodigoIndicacao) return;
    const codigo = meuCodigoIndicacao.textContent;
    navigator.clipboard.writeText(codigo).then(() => {
        showToast('📋 Código copiado!');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = codigo;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('📋 Código copiado!');
    });
};

// ============================================================
// CARREGAR PRODUTOS
// ============================================================
async function carregarProdutos() {
    try {
        allProducts = await db.produtos.toArray();
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
// RENDERIZAR ANÚNCIOS
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
    
    produtos = produtos.filter(p => p.status !== 'vendido' && p.status !== 'cancelado');
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
        const fotoHtml = gerarImagemHtml(p);
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        const tipoTrocaLabel = p.tipoTroca === 'servico' ? '🛠️ Serviço' : 
                               p.tipoTroca === 'ambos' ? '📦🛠️ Produto/Serviço' : '📦 Produto';
        
        return `
            <div class="card" onclick="abrirModalProduto(${p.id})">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="owner">${escapeHtml(p.dono)}</div>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div style="font-size:0.8rem;color:#64748b;margin:4px 0;">${tipoTrocaLabel}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                ${p.trocaDesejada ? `<div style="font-size:0.85rem;color:#475569;margin-bottom:10px;">Quer: ${escapeHtml(p.trocaDesejada)}</div>` : ''}
                <div class="actions" onclick="event.stopPropagation();">
                    ${!isOwner && currentUser && p.status !== 'vendido' ? `
                        <button class="btn-trocar" onclick="solicitarTroca(${p.id})">Trocar</button>
                    ` : ''}
                    ${podeExcluir ? `<button class="btn-excluir" onclick="excluirAnuncio(${p.id})">Excluir</button>` : ''}
                    ${currentUser && !isOwner ? `<button class="btn-chat" onclick="abrirChat(${p.id}, '${p.dono}')">Chat</button>` : ''}
                    ${!currentUser ? `<span style="font-size:0.75rem;color:#94a3b8;">Faça login</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// RENDERIZAR MEUS ANÚNCIOS
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
        const fotoHtml = gerarImagemHtml(p);
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
    db.adminFees.toArray().then(fees => {
        const totalFees = fees.reduce((acc, f) => acc + (f.valor || 0), 0);
        document.getElementById('adminTotalFees').textContent = totalFees;
    });
    db.trocas.toArray().then(trocas => {
        document.getElementById('adminTotalTrocas').textContent = trocas.length;
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
// FUNÇÕES DE TROCA
// ============================================================
window.solicitarTroca = async function(id) {
    if (!currentUser) {
        showToast('🔒 Faça login para solicitar troca.');
        return;
    }
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) {
        showToast('❌ Você não pode trocar com você mesmo.');
        return;
    }
    if (produto.status === 'vendido' || produto.status === 'cancelado') {
        showToast('❌ Este produto não está mais disponível.');
        return;
    }

    const trocaExistente = await db.trocas
        .where('produtoId').equals(id)
        .filter(t => t.status === 'pendente' || t.status === 'aceita')
        .first();
    if (trocaExistente) {
        showToast('⚠️ Já existe uma troca em andamento para este produto.');
        return;
    }

    const mensagem = prompt('💬 Envie uma mensagem para o vendedor:\n\nDescreva o que você oferece em troca:');
    if (mensagem === null) return;
    if (!mensagem.trim()) {
        showToast('❌ Por favor, digite uma mensagem.');
        return;
    }

    await db.trocas.add({
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        solicitante: currentUser.email,
        dono: produto.dono,
        status: 'pendente',
        tipo: produto.tipoTroca || 'produto',
        mensagem: mensagem.trim(),
        data: new Date().toISOString(),
        dataEntrega: null,
        dataRecebimento: null,
        avaliado: false
    });

    await db.notificacoes.add({
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer trocar "${produto.titulo}"\n\nMensagem: ${mensagem.trim()}`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao_troca'
    });

    showToast(`✅ Solicitação enviada para ${produto.dono}!`);
    atualizarBadge();
    renderMinhasTrocas();
};

window.responderTroca = async function(trocaId, resposta) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;

    if (resposta === 'aceitar') {
        await db.trocas.update(trocaId, { status: 'aceita' });
        await db.produtos.update(troca.produtoId, { status: 'negociacao' });
        
        await db.notificacoes.add({
            para: troca.solicitante,
            de: currentUser.email,
            produtoId: troca.produtoId,
            produtoTitulo: troca.produtoTitulo,
            mensagem: `${currentUser.nome} aceitou sua troca por "${troca.produtoTitulo}"! Entre em contato pelo chat para combinar a entrega.`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'troca_aceita'
        });
        showToast('✅ Troca aceita!');
    } else {
        await db.trocas.update(trocaId, { status: 'cancelada' });
        await db.notificacoes.add({
            para: troca.solicitante,
            de: currentUser.email,
            produtoId: troca.produtoId,
            produtoTitulo: troca.produtoTitulo,
            mensagem: `${currentUser.nome} recusou sua troca por "${troca.produtoTitulo}".`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'troca_recusada'
        });
        showToast('❌ Troca recusada.');
    }
    await carregarProdutos();
    renderMinhasTrocas();
    renderizarAnuncios();
    atualizarBadge();
};

window.marcarEntregue = async function(trocaId) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;

    await db.trocas.update(trocaId, { 
        status: 'entregue',
        dataEntrega: new Date().toISOString()
    });

    await db.notificacoes.add({
        para: troca.solicitante,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `${currentUser.nome} marcou o produto como ENTREGUE. Confirme o recebimento para concluir a troca!`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'entrega_realizada'
    });

    showToast('📦 Produto marcado como entregue!');
    renderMinhasTrocas();
    atualizarBadge();
};

window.marcarRecebido = async function(trocaId) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;

    await db.trocas.update(trocaId, { 
        status: 'recebido',
        dataRecebimento: new Date().toISOString()
    });

    await db.trocas.update(trocaId, { status: 'concluida' });

    const produto = await db.produtos.get(troca.produtoId);
    if (produto) {
        const preco = produto.precoMoedas;
        const taxa = Math.floor(preco * 0.15);
        const valorFinal = preco - taxa;

        const comprador = await db.usuarios.where('email').equals(troca.solicitante).first();
        if (comprador) {
            comprador.moedas -= preco;
            await db.usuarios.update(comprador.id, comprador);
        }

        const vendedor = await db.usuarios.where('email').equals(troca.dono).first();
        if (vendedor) {
            vendedor.moedas += valorFinal;
            vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal;
            vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa;
            await db.usuarios.update(vendedor.id, vendedor);
        }

        await db.adminFees.add({ valor: taxa, data: new Date().toISOString() });
        await db.produtos.update(troca.produtoId, { status: 'vendido', vendido: true });
    }

    await db.notificacoes.add({
        para: troca.dono,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `✅ ${currentUser.nome} confirmou o recebimento! A troca foi concluída com sucesso.`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'troca_concluida'
    });

    showToast('✅ Troca concluída com sucesso!');
    await carregarProdutos();
    renderMinhasTrocas();
    renderizarAnuncios();
    atualizarMoedas();
    atualizarBadge();
    
    abrirAvaliacaoModal(trocaId);
};

// ============================================================
// MINHAS TROCAS
// ============================================================
async function renderMinhasTrocas() {
    if (!minhasTrocasList) return;
    if (!currentUser) {
        minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Faça login para ver suas trocas.</p>';
        return;
    }

    const trocas = await db.trocas
        .filter(t => t.solicitante === currentUser.email || t.dono === currentUser.email)
        .toArray();

    if (trocas.length === 0) {
        minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Você ainda não tem trocas.</p>';
        return;
    }

    minhasTrocasList.innerHTML = trocas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(t => {
        const isSolicitante = t.solicitante === currentUser.email;
        const outroUsuario = isSolicitante ? t.dono : t.solicitante;
        const statusLabel = getTrocaStatusLabel(t.status);
        const statusClass = getTrocaStatusClass(t.status);
        const podeAceitar = t.status === 'pendente' && t.dono === currentUser.email;
        const podeEntregar = t.status === 'aceita' && t.dono === currentUser.email;
        const podeReceber = t.status === 'entregue' && t.solicitante === currentUser.email;
        const podeAvaliar = t.status === 'concluida' && !t.avaliado;

        return `
            <div class="troca-item">
                <div class="troca-info">
                    <div class="produto-nome">📦 ${escapeHtml(t.produtoTitulo)}</div>
                    <div style="font-size:0.85rem;color:#64748b;">
                        ${isSolicitante ? 'Você quer' : 'Você recebeu'} de ${escapeHtml(outroUsuario)}
                    </div>
                    <div style="font-size:0.85rem;color:#64748b;margin-top:4px;">
                        💬 ${escapeHtml(t.mensagem)}
                    </div>
                    <span class="troca-status ${statusClass}">${statusLabel}</span>
                    ${t.dataEntrega ? `<div style="font-size:0.75rem;color:#94a3b8;">Entregue em: ${new Date(t.dataEntrega).toLocaleDateString('pt-BR')}</div>` : ''}
                    ${t.dataRecebimento ? `<div style="font-size:0.75rem;color:#94a3b8;">Recebido em: ${new Date(t.dataRecebimento).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
                <div class="troca-actions">
                    ${podeAceitar ? `
                        <button class="btn-aceitar-troca" onclick="responderTroca(${t.id}, 'aceitar')">✅ Aceitar</button>
                        <button class="btn-recusar-troca" onclick="responderTroca(${t.id}, 'recusar')">❌ Recusar</button>
                    ` : ''}
                    ${podeEntregar ? `
                        <button class="btn-entregar" onclick="marcarEntregue(${t.id})">📦 Marcar Entregue</button>
                    ` : ''}
                    ${podeReceber ? `
                        <button class="btn-receber" onclick="marcarRecebido(${t.id})">✅ Confirmar Recebimento</button>
                    ` : ''}
                    ${podeAvaliar ? `
                        <button class="btn-avaliar" onclick="abrirAvaliacaoModal(${t.id})">⭐ Avaliar</button>
                    ` : ''}
                    <button class="btn-chat" onclick="abrirChat(${t.produtoId}, '${outroUsuario}')">💬 Chat</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// AVALIAÇÕES
// ============================================================
window.abrirAvaliacaoModal = function(trocaId) {
    avaliacaoParaTrocaId = trocaId;
    const modal = document.getElementById('avaliacaoModal');
    if (modal) modal.classList.add('active');
    document.getElementById('btnEnviarAvaliacao').onclick = () => enviarAvaliacao(trocaId);
};

window.fecharAvaliacaoModal = function() {
    const modal = document.getElementById('avaliacaoModal');
    if (modal) modal.classList.remove('active');
    avaliacaoParaTrocaId = null;
};

async function enviarAvaliacao(trocaId) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;

    const notaProduto = parseInt(document.getElementById('notaProduto').value);
    const notaVendedor = parseInt(document.getElementById('notaVendedor').value);
    const comentario = document.getElementById('comentarioAvaliacao').value.trim();

    await db.avaliacoes.add({
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        de: currentUser.email,
        para: troca.dono,
        notaProduto: notaProduto,
        notaVendedor: notaVendedor,
        comentario: comentario,
        data: new Date().toISOString()
    });

    await db.trocas.update(trocaId, { avaliado: true });

    await db.notificacoes.add({
        para: troca.dono,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `${currentUser.nome} avaliou a troca de "${troca.produtoTitulo}"! Produto: ${notaProduto}⭐ Vendedor: ${notaVendedor}⭐`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'avaliacao'
    });

    fecharAvaliacaoModal();
    showToast('⭐ Avaliação enviada! Obrigado!');
    renderAvaliacoes();
    atualizarBadge();
}

async function renderAvaliacoes() {
    if (!avaliacoesList) return;
    
    const avaliacoes = await db.avaliacoes.toArray();
    
    if (avaliacoes.length === 0) {
        avaliacoesList.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;text-align:center;">Nenhuma avaliação ainda.</p>';
        return;
    }

    avaliacoesList.innerHTML = avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data)).map(a => {
        const starsProduto = '⭐'.repeat(a.notaProduto) + '☆'.repeat(5 - a.notaProduto);
        const starsVendedor = '⭐'.repeat(a.notaVendedor) + '☆'.repeat(5 - a.notaVendedor);
        const data = new Date(a.data).toLocaleDateString('pt-BR');
        
        return `
            <div class="avaliacao-item">
                <div style="font-weight:600;">📦 ${escapeHtml(a.produtoTitulo)}</div>
                <div style="font-size:0.85rem;color:#64748b;">${escapeHtml(a.de)} → ${escapeHtml(a.para)}</div>
                <div class="stars">Produto: ${starsProduto}</div>
                <div class="stars">Vendedor: ${starsVendedor}</div>
                ${a.comentario ? `<div class="avaliacao-comentario">"${escapeHtml(a.comentario)}"</div>` : ''}
                <div class="avaliacao-data">${data}</div>
            </div>
        `;
    }).join('');
}

// ============================================================
// MODAL DE PRODUTO
// ============================================================
window.abrirModalProduto = function(id) {
    window.location.href = `produto.html?id=${id}`;
};
window.fecharModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
};

// ============================================================
// EXCLUIR ANÚNCIO
// ============================================================
window.excluirAnuncio = function(id) {
    if (!currentUser) return;
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) {
        showToast('Você só pode excluir seus próprios anúncios.');
        return;
    }
    if (!confirm(`Tem certeza que deseja excluir "${produto.titulo}"?`)) return;
    
    db.produtos.delete(id).then(() => {
        showToast('Anúncio removido.');
        carregarProdutos().then(() => {
            renderizarAnuncios();
            renderMeusAnuncios();
            renderAdminPanel();
        });
    });
};

// ============================================================
// CHAT
// ============================================================
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

// ============================================================
// RENDERIZAR CHATS
// ============================================================
async function renderChats() {
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="chat-list-empty">
                <span class="emoji">🔒</span>
                <p>Faça login para ver suas conversas.</p>
            </div>
        `;
        return;
    }

    try {
        const chats = await db.chats
            .filter(c => c.usuario1 === currentUser.email || c.usuario2 === currentUser.email)
            .toArray();

        if (chats.length === 0) {
            container.innerHTML = `
                <div class="chat-list-empty">
                    <span class="emoji">💬</span>
                    <p>Você ainda não tem conversas.</p>
                </div>
            `;
            return;
        }

        chats.sort((a, b) => {
            const aLast = a.mensagens.length > 0 ? new Date(a.mensagens[a.mensagens.length - 1].data) : new Date(a.data);
            const bLast = b.mensagens.length > 0 ? new Date(b.mensagens[b.mensagens.length - 1].data) : new Date(b.data);
            return bLast - aLast;
        });

        let html = '';
        for (const chat of chats) {
            const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
            const ultimaMsg = chat.mensagens.length > 0 ? chat.mensagens[chat.mensagens.length - 1] : null;
            const dataMsg = ultimaMsg ? new Date(ultimaMsg.data) : new Date(chat.data);
            const dataFormatada = dataMsg.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            const produto = await db.produtos.get(chat.produtoId);
            const nomeProduto = produto ? produto.titulo : 'Produto desconhecido';

            html += `
                <div class="chat-list-item" onclick="abrirChat(${chat.produtoId}, '${outro}')">
                    <div class="chat-info">
                        <div class="chat-with">👤 ${escapeHtml(outro)}</div>
                        <div class="chat-product">📦 ${escapeHtml(nomeProduto)}</div>
                        ${ultimaMsg ? `<div class="chat-last-msg">${escapeHtml(ultimaMsg.texto)}</div>` : ''}
                    </div>
                    <div class="chat-date">${dataFormatada}</div>
                </div>
            `;
        }
        container.innerHTML = html;

    } catch (error) {
        console.error('Erro ao carregar chats:', error);
        container.innerHTML = `<div class="error-msg">❌ Erro ao carregar conversas.</div>`;
    }
}

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
            if (n.tipo === 'solicitacao_troca' && !n.lida) {
                botoes = `
                    <button class="btn-aceitar" onclick="window.location.href='index.html?tab=minhasTrocas'">Ver Trocas</button>
                `;
            }
            if (n.tipo === 'troca_aceita' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="window.location.href='index.html?tab=minhasTrocas'">Ver Trocas</button>`;
            }
            if (n.tipo === 'chat' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">Responder</button>`;
            }
            if (n.tipo === 'avaliacao' && !n.lida) {
                botoes = `<button class="btn-chat-notif" onclick="window.location.href='index.html?tab=avaliacao'">Ver Avaliações</button>`;
            }
            return `
                <div class="notification-item" style="${n.lida ? 'opacity:0.6;' : ''}">
                    <div class="notif-text">
                        <strong>${escapeHtml(n.de)}</strong><br />
                        ${escapeHtml(n.mensagem).replace(/\n/g, '<br>')}
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
    const tipoTroca = tipoTrocaProduto?.value || 'produto';

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
                    salvarProduto(titulo, descricao, categoria, local, troca, fotos, preco, condicao, status, tipoTroca);
                }
            };
            reader.readAsDataURL(fotoProduto.files[i]);
        }
    } else {
        salvarProduto(titulo, descricao, categoria, local, troca, [], preco, condicao, status, tipoTroca);
    }
}

function salvarProduto(titulo, descricao, categoria, local, troca, fotos, preco, condicao, status, tipoTroca) {
    db.produtos.add({
        titulo, descricao, categoria, local,
        trocaDesejada: troca,
        fotos: fotos,
        dono: currentUser.email,
        status: status,
        condicao: condicao,
        precoMoedas: preco,
        tipoTroca: tipoTroca,
        data: new Date().toISOString(),
        vendido: false
    }).then(() => {
        showToast('✅ Anúncio publicado!');
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
        });
    });
}

// ============================================================
// NAVEGAÇÃO COM ABAS NA HEADER
// ============================================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn-header');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');

            if (tabId === 'tabMeusAnuncios') renderMeusAnuncios();
            if (tabId === 'tabAdmin') renderAdminPanel();
            if (tabId === 'tabMinhasTrocas') renderMinhasTrocas();
            if (tabId === 'tabAvaliacao') renderAvaliacoes();
            if (tabId === 'tabChats') renderChats();
            if (tabId === 'tabIndicacao') atualizarIndicacao();
        });
    });
}

// ============================================================
// CONTROLE DO MODAL DE LOGIN
// ============================================================
window.abrirAuthModal = function(tipo) {
    if (!authModal) return;
    authModal.classList.remove('hidden');
    authModal.classList.add('active');
    if (tipo === 'login') {
        loginBox.classList.remove('hidden');
        registerBox.classList.add('hidden');
    } else if (tipo === 'register') {
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    }
    if (loginError) loginError.classList.remove('show');
    if (registerError) registerError.classList.remove('show');
};

window.fecharAuthModal = function() {
    if (!authModal) return;
    authModal.classList.remove('active');
    authModal.classList.add('hidden');
};

function showLoginBox() {
    loginBox.classList.remove('hidden');
    registerBox.classList.add('hidden');
    loginError.classList.remove('show');
}

// ============================================================
// EVENTOS
// ============================================================
function initEventListeners() {
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            loginUser(loginEmail.value.trim(), loginSenha.value);
        });
    }
    if (loginEmail) {
        loginEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnLogin?.click();
        });
    }
    if (loginSenha) {
        loginSenha.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnLogin?.click();
        });
    }

    if (btnRegister) btnRegister.addEventListener('click', registerUser);

    if (btnLogout) btnLogout.addEventListener('click', logoutUser);

    if (btnPublicar) btnPublicar.addEventListener('click', publicarAnuncio);

    if (btnNotifications) btnNotifications.addEventListener('click', toggleNotifications);

    if (btnSearch) btnSearch.addEventListener('click', renderizarAnuncios);
    if (searchText) searchText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderizarAnuncios();
    });
    if (searchCidade) searchCidade.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderizarAnuncios();
    });
    if (searchEstado) searchEstado.addEventListener('change', renderizarAnuncios);

    if (btnUsarCodigo) {
        btnUsarCodigo.addEventListener('click', async () => {
            if (!currentUser) {
                showToast('Faça login para usar um código.');
                return;
            }
            const codigo = inputUsarCodigo.value.trim().toUpperCase();
            if (!codigo) {
                showToast('Digite um código.');
                return;
            }
            if (codigo === currentUser.codigoIndicacao) {
                showToast('❌ Você não pode usar seu próprio código.');
                return;
            }
            const indicador = await db.usuarios.where('codigoIndicacao').equals(codigo).first();
            if (!indicador) {
                showToast('❌ Código inválido.');
                return;
            }
            if (currentUser.indicadoPor) {
                showToast('❌ Você já usou um código de indicação.');
                return;
            }

            const usado = await db.indicacoes.where('usadoPor').equals(currentUser.email).first();
            if (usado) {
                showToast('❌ Você já usou um código de indicação.');
                return;
            }

            currentUser.indicadoPor = indicador.email;
            currentUser.moedas += 20;
            indicador.moedas += 20;

            await db.usuarios.update(currentUser.id, currentUser);
            await db.usuarios.update(indicador.id, indicador);
            
            await db.indicacoes.add({
                codigo: codigo,
                criadoPor: indicador.email,
                usadoPor: currentUser.email,
                bonusRecebido: 20,
                dataUso: new Date().toISOString()
            });

            showToast(`🎉 Código válido! Você e ${indicador.nome} ganharam 20 moedas!`);
            atualizarMoedas();
            atualizarIndicacao();
            inputUsarCodigo.value = '';
        });
    }

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) fecharAuthModal();
        });
    }
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
                renderMinhasTrocas();
                renderAvaliacoes();
                atualizarBadge();
                renderChats();
                atualizarIndicacao();
            }
        } catch (e) {}
    }

    initTabs();
    initEventListeners();

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
        const map = {
            'anuncios': 'tabAnuncios',
            'meusAnuncios': 'tabMeusAnuncios',
            'novoAnuncio': 'tabNovoAnuncio',
            'minhasTrocas': 'tabMinhasTrocas',
            'avaliacao': 'tabAvaliacao',
            'chats': 'tabChats',
            'indicacao': 'tabIndicacao',
            'admin': 'tabAdmin'
        };
        const target = map[tabParam.toLowerCase()];
        if (target) {
            document.querySelectorAll('.tab-btn-header').forEach(b => {
                if (b.dataset.tab === target) b.click();
            });
        }
    }

    const chatId = parseInt(params.get('chat'));
    const withUser = params.get('with');
    if (chatId && withUser && currentUser) {
        setTimeout(() => abrirChat(chatId, withUser), 600);
    }

    console.log('✅ Inicialização concluída.');
}

init().catch(console.error);