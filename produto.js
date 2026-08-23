// produto.js - Carrega os detalhes do produto via ID da URL
import db from './db.js';

// ============================================================
// RESTAURAR SESSÃO DO USUÁRIO (para não deslogar)
// ============================================================

let currentUser = null;

async function restaurarSessao() {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const user = await db.usuarios.where('email').equals(data.email).first();
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
        // Atualizar badge de notificações
        db.notificacoes.where('para').equals(currentUser.email).and(n => !n.lida).count().then(count => {
            if (notifBadge) {
                notifBadge.textContent = count;
                notifBadge.style.display = count > 0 ? 'inline' : 'none';
            }
        });
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

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

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
    const labels = {
        'disponivel': 'Disponível',
        'negociacao': 'Em negociação',
        'vendido': 'Vendido',
        'cancelado': 'Cancelado'
    };
    return labels[status] || 'Disponível';
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

// ============================================================
// FUNÇÕES PARA IMAGENS (pasta src)
// ============================================================

function getCaminhoImagem(titulo) {
    if (!titulo) return null;
    return `src/${encodeURIComponent(titulo)}.jpg`;
}

function gerarImagemPrincipal(produto) {
    if (produto.fotos && produto.fotos.length > 0) {
        return produto.fotos[0];
    }
    const caminho = getCaminhoImagem(produto.titulo);
    if (caminho) return caminho;
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f1f5f9%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22%3E📷 Sem foto%3C/text%3E%3C/svg%3E';
}

function gerarMiniaturas(produto) {
    if (produto.fotos && produto.fotos.length > 0) {
        return produto.fotos.map(f => `
            <img src="${f}" alt="Miniatura" onclick="document.getElementById('mainImage').src=this.src" />
        `).join('');
    }
    const caminho = getCaminhoImagem(produto.titulo);
    if (caminho) {
        return `
            <img src="${caminho}" alt="Miniatura" onclick="document.getElementById('mainImage').src=this.src"
                 onerror="this.style.display='none'" />
        `;
    }
    return `<div style="color:#94a3b8;font-size:0.8rem;">📷 Sem foto</div>`;
}

// ============================================================
// TOAST
// ============================================================

function showToast(msg) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3500);
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
        container.innerHTML = `<div class="error-msg">❌ Produto não encontrado. ID inválido.</div>`;
        return;
    }

    try {
        const produto = await db.produtos.get(id);
        if (!produto) {
            container.innerHTML = `<div class="error-msg">❌ Produto não encontrado.</div>`;
            return;
        }

        document.title = `${produto.titulo} - TrocaTudo`;

        // Busca o vendedor
        const vendedor = await db.usuarios.where('email').equals(produto.dono).first();

        // Gera as imagens
        const imagemPrincipal = gerarImagemPrincipal(produto);
        const miniaturasHtml = gerarMiniaturas(produto);

        const statusLabel = getStatusLabel(produto.status);
        const statusClass = getStatusClass(produto.status);
        const condicaoLabel = getCondicaoLabel(produto.condicao);
        const condicaoClass = getCondicaoClass(produto.condicao);
        const dataPublicacao = new Date(produto.data).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const precoHtml = `<span class="price-coins">💰 <strong>${produto.precoMoedas}</strong> moedas</span>`;

        const trocaHtml = produto.trocaDesejada ? `
            <div class="trade-wanted">
                <div class="text">Deseja em troca: <span>${escapeHtml(produto.trocaDesejada)}</span></div>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="product-detail-page">
                <!-- Galeria -->
                <div class="gallery">
                    <div class="image-container">
                        <img src="${imagemPrincipal}" alt="${escapeHtml(produto.titulo)}" id="mainImage"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f1f5f9%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22sans-serif%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22%3E📷 Sem foto%3C/text%3E%3C/svg%3E'" />
                    </div>
                    <div class="thumbnails">
                        ${miniaturasHtml}
                    </div>
                </div>

                <!-- Informações -->
                <div class="info">
                    <h1>${escapeHtml(produto.titulo)}</h1>
                    ${precoHtml}
                    <div class="badges">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                        <span class="category-tag">${escapeHtml(produto.categoria || 'Outros')}</span>
                    </div>
                    ${trocaHtml}
                    <div class="meta">
                        <div class="meta-item">
                            <span class="label">Vendedor</span>
                            <span class="value">${escapeHtml(produto.dono)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">Local</span>
                            <span class="value">${escapeHtml(produto.local || 'Não informado')}</span>
                        </div>
                        <div class="meta-item">
                            <span class="label">Publicado em</span>
                            <span class="value">${dataPublicacao}</span>
                        </div>
                    </div>
                    <div class="description">
                        <strong>Descrição</strong>
                        <p>${escapeHtml(produto.descricao)}</p>
                    </div>
                    <div class="actions">
                        <button class="btn-buy" onclick="comprarProduto(${produto.id})">🪙 Comprar (${produto.precoMoedas})</button>
                        <button class="btn-chat" onclick="abrirChatProduto(${produto.id}, '${produto.dono}')">💬 Falar com vendedor</button>
                        <button class="btn-back" onclick="window.location.href='index.html'">← Voltar</button>
                    </div>
                </div>
            </div>
        `;

        // Evento nas miniaturas
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
// FUNÇÕES GLOBAIS PARA OS BOTÕES (com verificação de login)
// ============================================================

window.comprarProduto = async function(id) {
    if (!currentUser) {
        showToast('🔒 Faça login para comprar.');
        return;
    }
    const produto = await db.produtos.get(id);
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

    if (!confirm(`Confirmar compra de "${produto.titulo}" por ${preco} moedas?\nTaxa: ${taxa} moedas (15%)\nVendedor recebe: ${valorFinal} moedas`)) {
        return;
    }

    currentUser.moedas -= preco;
    await db.usuarios.update(currentUser.id, currentUser);

    const vendedor = await db.usuarios.where('email').equals(produto.dono).first();
    if (vendedor) {
        vendedor.moedas += valorFinal;
        vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal;
        vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa;
        await db.usuarios.update(vendedor.id, vendedor);
    }

    await db.adminFees.add({ valor: taxa, data: new Date().toISOString() });
    await db.produtos.update(id, { status: 'vendido', vendido: true });

    await db.notificacoes.add({
        para: produto.dono,
        de: currentUser.email,
        produtoId: produto.id,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} comprou "${produto.titulo}" por ${preco} moedas! Você recebeu ${valorFinal} moedas (${taxa} de taxa).`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'compra'
    });

    showToast(`✅ Compra realizada! Você pagou ${preco} moedas.`);
    setTimeout(() => window.location.reload(), 1500);
};

window.abrirChatProduto = function(produtoId, dono) {
    if (!currentUser) {
        showToast('🔒 Faça login para usar o chat.');
        return;
    }
    window.location.href = `index.html?chat=${produtoId}&with=${encodeURIComponent(dono)}`;
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

(async function init() {
    await restaurarSessao();
    await carregarProduto();
})();