// produto.js - 100% localStorage

let currentUser = null;
let allProducts = [];

// ===== BANCO DE DADOS (localStorage) =====
const DB_KEYS = {
    usuarios: 'trocatudo_usuarios',
    produtos: 'trocatudo_produtos',
    trocas: 'trocatudo_trocas',
    notificacoes: 'trocatudo_notificacoes',
    chats: 'trocatudo_chats',
    adminFees: 'trocatudo_adminFees',
    avaliacoes: 'trocatudo_avaliacoes',
    indicacoes: 'trocatudo_indicacoes'
};

function getData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(key) {
    const data = getData(key);
    return data.length > 0 ? Math.max(...data.map(d => d.id || 0)) + 1 : 1;
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function showToast(msg) {
    const toastEl = document.getElementById('toast');
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

function getStatusLabel(status) {
    const labels = { 'disponivel': 'Disponível', 'negociacao': 'Em negociação', 'vendido': 'Vendido', 'cancelado': 'Cancelado' };
    return labels[status] || 'Disponível';
}

function getStatusClass(status) {
    const classes = { 'disponivel': 'status-disponivel', 'negociacao': 'status-negociacao', 'vendido': 'status-vendido', 'cancelado': 'status-cancelado' };
    return classes[status] || 'status-disponivel';
}

function getCondicaoLabel(condicao) {
    const labels = { 'novo': 'Novo', 'lacrado': 'Lacrado', 'seminovo': 'Seminovo', 'usado': 'Usado - Boas condições', 'ruim': 'Usado - Precisa de reparos' };
    return labels[condicao] || 'Usado';
}

function getCondicaoClass(condicao) {
    const classes = { 'novo': 'condition-novo', 'lacrado': 'condition-lacrado', 'seminovo': 'condition-seminovo', 'usado': 'condition-usado', 'ruim': 'condition-ruim' };
    return classes[condicao] || 'condition-usado';
}

function getCaminhoImagem(titulo) {
    if (!titulo) return null;
    return `src/${encodeURIComponent(titulo)}.jpg`;
}

function gerarImagemPrincipal(produto) {
    if (produto.fotos && produto.fotos.length > 0) return produto.fotos[0];
    const caminho = getCaminhoImagem(produto.titulo);
    if (caminho) return caminho;
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f1f5f9%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22%3E📷 Sem foto%3C/text%3E%3C/svg%3E';
}

function gerarMiniaturas(produto) {
    if (produto.fotos && produto.fotos.length > 0) {
        return produto.fotos.map(f => `<img src="${f}" alt="Miniatura" onclick="document.getElementById('mainImage').src=this.src" />`).join('');
    }
    const caminho = getCaminhoImagem(produto.titulo);
    if (caminho) {
        return `<img src="${caminho}" alt="Miniatura" onclick="document.getElementById('mainImage').src=this.src" onerror="this.style.display='none'" />`;
    }
    return `<div style="color:#94a3b8;font-size:0.8rem;">📷 Sem foto</div>`;
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
async function restaurarSessao() {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const usuarios = getData(DB_KEYS.usuarios);
        const user = usuarios.find(u => u.email === data.email);
        if (user) {
            currentUser = user;
            atualizarHeader();
            return user;
        }
    } catch (e) {}
    return null;
}

function atualizarHeader() {
    const userInfoLoggedIn = document.getElementById('userInfoLoggedIn');
    const userInfoLoggedOut = document.getElementById('userInfoLoggedOut');
    const displayName = document.getElementById('displayName');
    const coinsDisplay = document.getElementById('coinsDisplay');
    const notifBadge = document.getElementById('notifBadge');

    if (currentUser) {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'flex';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'none';
        if (displayName) displayName.textContent = currentUser.nome;
        if (coinsDisplay) coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
        const notificacoes = getData(DB_KEYS.notificacoes).filter(n => n.para === currentUser.email && !n.lida);
        if (notifBadge) { notifBadge.textContent = notificacoes.length; notifBadge.style.display = notificacoes.length > 0 ? 'inline' : 'none'; }
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (notifBadge) { notifBadge.textContent = '0'; notifBadge.style.display = 'none'; }
    }
}

// ============================================================
// CARREGAR PRODUTO
// ============================================================
async function carregarProduto() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id || isNaN(id)) {
        container.innerHTML = `<div class="error-msg">❌ Produto não encontrado.</div>`;
        return;
    }

    try {
        const produtos = getData(DB_KEYS.produtos);
        const produto = produtos.find(p => p.id === id);
        if (!produto) {
            container.innerHTML = `<div class="error-msg">❌ Produto não encontrado.</div>`;
            return;
        }

        document.title = `${produto.titulo} - TrocaTudo`;

        const imagemPrincipal = gerarImagemPrincipal(produto);
        const miniaturasHtml = gerarMiniaturas(produto);

        const statusLabel = getStatusLabel(produto.status);
        const statusClass = getStatusClass(produto.status);
        const condicaoLabel = getCondicaoLabel(produto.condicao);
        const condicaoClass = getCondicaoClass(produto.condicao);
        const dataPublicacao = new Date(produto.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

        const tipoTrocaLabel = produto.tipoTroca === 'servico' ? '🛠️ Serviço' : produto.tipoTroca === 'ambos' ? '📦🛠️ Produto ou Serviço' : '📦 Produto';
        
        const isOwner = currentUser && (produto.dono === currentUser.email);

        container.innerHTML = `
            <div class="product-detail-page">
                <div class="gallery">
                    <div class="image-container">
                        <img src="${imagemPrincipal}" alt="${escapeHtml(produto.titulo)}" id="mainImage"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f1f5f9%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22%3E📷 Sem foto%3C/text%3E%3C/svg%3E'" />
                    </div>
                    <div class="thumbnails">${miniaturasHtml}</div>
                </div>

                <div class="info">
                    <h1>${escapeHtml(produto.titulo)}</h1>
                    <div style="font-size:0.9rem;color:#64748b;">${tipoTrocaLabel}</div>
                    <span class="price-coins">💰 <strong>${produto.precoMoedas}</strong> moedas</span>
                    <div class="badges">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                        <span class="category-tag">${escapeHtml(produto.categoria || 'Outros')}</span>
                    </div>
                    ${produto.trocaDesejada ? `<div class="trade-wanted"><div class="text">Deseja em troca: <span>${escapeHtml(produto.trocaDesejada)}</span></div></div>` : ''}
                    <div class="meta">
                        <div class="meta-item"><span class="label">Vendedor</span><span class="value">${escapeHtml(produto.dono)}</span></div>
                        <div class="meta-item"><span class="label">Local</span><span class="value">${escapeHtml(produto.local || 'Não informado')}</span></div>
                        <div class="meta-item"><span class="label">Publicado em</span><span class="value">${dataPublicacao}</span></div>
                    </div>
                    <div class="description"><strong>Descrição</strong><p>${escapeHtml(produto.descricao)}</p></div>
                    <div class="actions">
                        ${!isOwner && currentUser && produto.status === 'disponivel' ? `<button class="btn-buy" onclick="solicitarTroca(${produto.id})">🔄 Solicitar Troca</button>` : ''}
                        ${currentUser && !isOwner ? `<button class="btn-chat" onclick="abrirChatProduto(${produto.id}, '${produto.dono}')">💬 Falar com vendedor</button>` : ''}
                        ${!currentUser ? `<button class="btn-buy" onclick="window.location.href='index.html'">🔒 Faça login</button>` : ''}
                        <button class="btn-back" onclick="window.location.href='index.html'">← Voltar</button>
                    </div>
                </div>
            </div>
        `;

        container.querySelectorAll('.thumbnails img').forEach(img => {
            img.addEventListener('click', function() {
                const main = document.getElementById('mainImage');
                if (main) main.src = this.src;
            });
        });

    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        container.innerHTML = `<div class="error-msg">❌ Erro ao carregar produto: ${error.message}</div>`;
    }
}

// ============================================================
// FUNÇÕES GLOBAIS
// ============================================================
window.solicitarTroca = async function(id) {
    if (!currentUser) { showToast('🔒 Faça login para solicitar troca.'); return; }
    const produtos = getData(DB_KEYS.produtos);
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono === currentUser.email) { showToast('❌ Você não pode trocar com você mesmo.'); return; }
    if (produto.status === 'vendido' || produto.status === 'cancelado') { showToast('❌ Este produto não está mais disponível.'); return; }

    const trocas = getData(DB_KEYS.trocas);
    const trocaExistente = trocas.find(t => t.produtoId === id && (t.status === 'pendente' || t.status === 'aceita'));
    if (trocaExistente) { showToast('⚠️ Já existe uma troca em andamento para este produto.'); return; }

    const mensagem = prompt('💬 Envie uma mensagem para o vendedor:\n\nDescreva o que você oferece em troca:');
    if (mensagem === null) return;
    if (!mensagem.trim()) { showToast('❌ Por favor, digite uma mensagem.'); return; }

    const novaTroca = {
        id: getNextId(DB_KEYS.trocas),
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
        avaliado: false,
        localCombinado: null
    };
    trocas.push(novaTroca);
    setData(DB_KEYS.trocas, trocas);

    const notificacoes = getData(DB_KEYS.notificacoes);
    notificacoes.push({
        id: getNextId(DB_KEYS.notificacoes),
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer trocar "${produto.titulo}"\n\nMensagem: ${mensagem.trim()}`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao_troca'
    });
    setData(DB_KEYS.notificacoes, notificacoes);

    showToast(`✅ Solicitação enviada para ${produto.dono}!`);
    window.location.href = 'index.html?tab=minhasTrocas';
};

window.abrirChatProduto = function(produtoId, dono) {
    if (!currentUser) { showToast('🔒 Faça login para usar o chat.'); return; }
    window.location.href = `index.html?tab=chats&chat=${produtoId}&with=${encodeURIComponent(dono)}`;
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
    await restaurarSessao();
    await carregarProduto();
}

init();