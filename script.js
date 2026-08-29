// script.js - COMPLETO com chat lateral, solicitações de troca/compra, badges, histórico e logs

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentCategory = '';
let allProducts = [];
let avaliacaoParaTrocaId = null;
let userLat = null;
let userLng = null;
let chatIdAtual = null;
let chatPanelOpen = false;
let currentChatId = null;

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

function getStatusClass(status) { const classes = { 'disponivel': 'status-disponivel', 'negociacao': 'status-negociacao', 'vendido': 'status-vendido', 'cancelado': 'status-cancelado' }; return classes[status] || 'status-disponivel'; }
function getStatusLabel(status) { const labels = { 'disponivel': 'Disponível', 'negociacao': 'Em negociação', 'vendido': 'Vendido', 'cancelado': 'Cancelado' }; return labels[status] || 'Disponível'; }
function getCondicaoClass(condicao) { const classes = { 'novo': 'condition-novo', 'lacrado': 'condition-lacrado', 'seminovo': 'condition-seminovo', 'usado': 'condition-usado', 'ruim': 'condition-ruim' }; return classes[condicao] || 'condition-usado'; }
function getCondicaoLabel(condicao) { const labels = { 'novo': 'Novo', 'lacrado': 'Lacrado', 'seminovo': 'Seminovo', 'usado': 'Usado - Boas condições', 'ruim': 'Usado - Precisa de reparos' }; return labels[condicao] || 'Usado'; }
function getTrocaStatusLabel(status) { const labels = { 'pendente': 'Pendente', 'aceita': 'Aceita', 'entregue': 'Entregue', 'recebido': 'Recebido', 'concluida': 'Concluída', 'cancelada': 'Cancelada' }; return labels[status] || status; }
function getTrocaStatusClass(status) { const classes = { 'pendente': 'troca-status-pendente', 'aceita': 'troca-status-aceita', 'entregue': 'troca-status-entregue', 'recebido': 'troca-status-recebido', 'concluida': 'troca-status-concluida', 'cancelada': 'troca-status-cancelada' }; return classes[status] || 'troca-status-pendente'; }
function getCaminhoImagem(titulo) { if (!titulo) return null; return `src/${encodeURIComponent(titulo)}.jpg`; }
function gerarImagemHtml(produto, classe = 'product-image') { if (!produto || !produto.titulo) return `<div class="no-image">📷 Sem foto</div>`; const caminho = getCaminhoImagem(produto.titulo); const titulo = escapeHtml(produto.titulo); return `<img src="${caminho}" alt="${titulo}" class="${classe}" onerror="this.style.display='none'; this.parentElement.querySelector('.no-image').style.display='flex';" /><div class="no-image" style="display:none;">📷 Sem foto</div>`; }

// ===== CATEGORIAS =====
const categoriasMap = { 'Eletrônicos': { emoji: '📱', label: 'Eletrônicos' }, 'Livros': { emoji: '📚', label: 'Livros' }, 'Games': { emoji: '🎮', label: 'Games' }, 'Roupas': { emoji: '👕', label: 'Roupas' }, 'Esportes': { emoji: '⚽', label: 'Esportes' }, 'Casa e Decoração': { emoji: '🏠', label: 'Casa' }, 'Instrumentos Musicais': { emoji: '🎸', label: 'Música' }, 'Colecionáveis': { emoji: '🏷️', label: 'Colecionáveis' }, 'Brinquedos': { emoji: '🧸', label: 'Brinquedos' }, 'Acessórios': { emoji: '⌚', label: 'Acessórios' }, 'Serviços': { emoji: '🛠️', label: 'Serviços' } };

function renderCategories() {
    const categoriesBar = document.getElementById('categoriesBar');
    if (!categoriesBar) return;
    categoriesBar.innerHTML = `<div class="category-item ${currentCategory === '' ? 'active' : ''}" data-category=""><span class="emoji">🌟</span><span class="label">todos</span></div>`;
    Object.keys(categoriasMap).forEach(cat => {
        const { emoji, label } = categoriasMap[cat];
        const active = currentCategory === cat ? 'active' : '';
        categoriesBar.innerHTML += `<div class="category-item ${active}" data-category="${cat}"><span class="emoji">${emoji}</span><span class="label">${label.toLowerCase()}</span></div>`;
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
// LOCALIZAÇÃO
// ============================================================
function initGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true; script.defer = true;
    document.head.appendChild(script);
}

function obterLocalizacao() {
    if (!navigator.geolocation) { showToast('❌ Seu navegador não suporta geolocalização.'); return; }
    showToast('📍 Obtendo sua localização...');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
            localStorage.setItem('userLocation', JSON.stringify({ lat: userLat, lng: userLng }));
            showToast('✅ Localização obtida! Produtos próximos serão exibidos.');
            if (typeof google !== 'undefined' && google.maps) mostrarMapaGoogle(userLat, userLng);
            renderizarAnuncios();
        },
        (error) => { console.error('Erro ao obter localização:', error); showToast('❌ Não foi possível obter sua localização. Verifique as permissões.'); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

function mostrarMapaGoogle(lat, lng) {
    const mapaModal = document.createElement('div');
    mapaModal.id = 'mapaModal';
    mapaModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    mapaModal.innerHTML = `<div style="background:white;border-radius:20px;padding:20px;width:90%;max-width:600px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;"><h3>📍 Sua Localização</h3><button onclick="fecharMapa()" style="background:#ef4444;color:white;border:none;border-radius:50%;width:35px;height:35px;font-size:16px;cursor:pointer;">✕</button></div><div id="googleMap" style="width:100%;height:400px;border-radius:12px;"></div></div>`;
    document.body.appendChild(mapaModal);
    const map = new google.maps.Map(document.getElementById('googleMap'), { center: { lat: lat, lng: lng }, zoom: 14 });
    new google.maps.Marker({ position: { lat: lat, lng: lng }, map: map, title: 'Você está aqui!' });
}

window.fecharMapa = function() { const mapaModal = document.getElementById('mapaModal'); if (mapaModal) mapaModal.remove(); };

function carregarLocalizacaoSalva() {
    const saved = localStorage.getItem('userLocation');
    if (saved) { try { const loc = JSON.parse(saved); userLat = loc.lat; userLng = loc.lng; } catch (e) {} }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;
}

const CAPITAIS_UF = { 'AC': { lat: -9.9750, lng: -67.8243 }, 'AL': { lat: -9.6498, lng: -35.7089 }, 'AP': { lat: 0.0349, lng: -51.0694 }, 'AM': { lat: -3.1190, lng: -60.0217 }, 'BA': { lat: -12.9777, lng: -38.5016 }, 'CE': { lat: -3.7172, lng: -38.5433 }, 'DF': { lat: -15.7939, lng: -47.8828 }, 'ES': { lat: -20.3155, lng: -40.3128 }, 'GO': { lat: -16.6869, lng: -49.2648 }, 'MA': { lat: -2.5307, lng: -44.3068 }, 'MT': { lat: -15.6014, lng: -56.0979 }, 'MS': { lat: -20.4697, lng: -54.6201 }, 'MG': { lat: -19.9167, lng: -43.9345 }, 'PA': { lat: -1.4558, lng: -48.4902 }, 'PB': { lat: -7.1195, lng: -34.8450 }, 'PR': { lat: -25.4284, lng: -49.2733 }, 'PE': { lat: -8.0476, lng: -34.8770 }, 'PI': { lat: -5.0892, lng: -42.8019 }, 'RJ': { lat: -22.9068, lng: -43.1729 }, 'RN': { lat: -5.7945, lng: -35.2110 }, 'RS': { lat: -30.0346, lng: -51.2177 }, 'RO': { lat: -8.7619, lng: -63.9039 }, 'RR': { lat: 2.8235, lng: -60.6758 }, 'SC': { lat: -27.5954, lng: -48.5480 }, 'SP': { lat: -23.5505, lng: -46.6333 }, 'SE': { lat: -10.9472, lng: -37.0731 }, 'TO': { lat: -10.1689, lng: -48.3317 } };
const CIDADES_COORDS = { 'sao paulo': { lat: -23.5505, lng: -46.6333 }, 'rio de janeiro': { lat: -22.9068, lng: -43.1729 }, 'belo horizonte': { lat: -19.9167, lng: -43.9345 }, 'curitiba': { lat: -25.4284, lng: -49.2733 } };

function removerAcentos(texto) { return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function obterCoordenadasProduto(produto) {
    if (produto.lat && produto.lng) return { lat: produto.lat, lng: produto.lng };
    if (!produto.local) return null;
    const localNorm = removerAcentos(produto.local);
    if (localNorm.includes('remoto')) return null;
    const partes = produto.local.split('/'); const cidade = removerAcentos(partes[0]);
    if (CIDADES_COORDS[cidade]) return CIDADES_COORDS[cidade];
    const uf = (partes[1] || '').trim().toUpperCase();
    if (CAPITAIS_UF[uf]) return CAPITAIS_UF[uf];
    return null;
}
function isProdutoRemoto(produto) { return removerAcentos(produto.local).includes('remoto'); }

window.limparLocalStorage = function() {
    if(confirm('Isso vai apagar todos os dados locais (usuários, produtos, trocas). Deseja continuar?')) {
        localStorage.clear(); window.location.reload();
    }
};

// ============================================================
// CARREGAR DADOS DO INDEXEDDB
// ============================================================
async function loadProducts() {
    try {
        if (typeof db !== 'undefined') {
            allProducts = await db.produtos.toArray();
            console.log('📦 Produtos carregados:', allProducts.length);
        } else {
            allProducts = [];
            console.error('Erro: Banco de dados "db" não encontrado. Verifique se o db.js foi carregado.');
        }
    } catch (e) {
        console.error('Erro ao carregar produtos do IndexedDB:', e);
    }
    return allProducts;
}

// ============================================================
// RENDERIZAR ANÚNCIOS
// ============================================================
function renderizarAnuncios() {
    const listaEl = document.getElementById('listaAnuncios');
    if (!listaEl) return;
    let produtos = [...allProducts];

    if (currentCategory) produtos = produtos.filter(p => p.categoria === currentCategory);
    const searchText = document.getElementById('searchText');
    const search = searchText ? searchText.value.toLowerCase().trim() : '';
    if (search) produtos = produtos.filter(p => p.titulo.toLowerCase().includes(search) || p.descricao.toLowerCase().includes(search));
    const searchCidade = document.getElementById('searchCidade');
    const cidade = searchCidade ? searchCidade.value.toLowerCase().trim() : '';
    if (cidade) produtos = produtos.filter(p => p.local.toLowerCase().includes(cidade));
    const searchEstado = document.getElementById('searchEstado');
    const estado = searchEstado ? searchEstado.value : '';
    if (estado) produtos = produtos.filter(p => p.local.includes(estado));

    const searchRaio = document.getElementById('searchRaio');
    const raioKm = searchRaio ? parseInt(searchRaio.value) : 0;

    if (userLat && userLng) {
        produtos.forEach(p => { const coords = obterCoordenadasProduto(p); p.distancia = coords ? calcularDistancia(userLat, userLng, coords.lat, coords.lng) : null; });
        if (raioKm > 0) produtos = produtos.filter(p => isProdutoRemoto(p) || (p.distancia !== null && p.distancia <= raioKm));
        produtos.sort((a, b) => { if (a.distancia === null && b.distancia === null) return 0; if (a.distancia === null) return 1; if (b.distancia === null) return -1; return a.distancia - b.distancia; });
    } else {
        if (raioKm > 0) showToast('📍 Ative sua localização para filtrar por distância.');
        produtos = ordenarProdutos(produtos);
    }

    produtos = produtos.filter(p => p && p.titulo);

    if (produtos.length === 0) {
        const msgRaio = (userLat && raioKm > 0) ? `📭 Nenhum produto encontrado em até ${raioKm} km.` : '📭 Nenhum produto encontrado.';
        listaEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:50px 20px; color:#64748b;"><p>${msgRaio}</p></div>`;
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
        const tipoTrocaLabel = p.tipoTroca === 'servico' ? '🛠️ Serviço' : p.tipoTroca === 'ambos' ? '📦🛠️ Produto/Serviço' : '📦 Produto';
        const distanciaText = (p.distancia !== null && p.distancia !== undefined) ? `📍 ${p.distancia.toFixed(1)} km de você` : '';
        return `
            <div class="card" data-produto-id="${p.id}">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="owner">${escapeHtml(p.dono || 'Desconhecido')}</div>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                ${distanciaText ? `<div class="distancia-text">${distanciaText}</div>` : ''}
                <div style="font-size:0.8rem;color:#64748b;margin:4px 0;">${tipoTrocaLabel}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                ${p.trocaDesejada ? `<div style="font-size:0.85rem;color:#475569;margin-bottom:10px;">Quer: ${escapeHtml(p.trocaDesejada)}</div>` : ''}
                <div class="actions">
                    ${!isOwner && currentUser && p.status !== 'vendido' ? `<button class="btn-chat" data-action="chat" data-id="${p.id}" data-dono="${p.dono}">💬 Falar com vendedor</button>` : ''}
                    ${podeExcluir ? `<button class="btn-excluir" data-action="excluir" data-id="${p.id}">Excluir</button>` : ''}
                    ${!currentUser ? `<span style="font-size:0.75rem;color:#94a3b8;">Faça login</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function ordenarProdutos(produtos) {
    const arr = [...produtos];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
}

// ============================================================
// RENDERIZAR MEUS ANÚNCIOS
// ============================================================
function renderMeusAnuncios() {
    const meusAnunciosEl = document.getElementById('meusAnuncios');
    if (!meusAnunciosEl) return;
    if (!currentUser) { meusAnunciosEl.innerHTML = '<div class="empty-state"><p>Faça login para ver seus anúncios.</p></div>'; return; }
    const meus = allProducts.filter(p => p.dono === currentUser.email);
    if (meus.length === 0) { meusAnunciosEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>Você ainda não publicou nenhum anúncio.</p><p style="font-size:0.9rem;margin-top:6px;">Vá para a aba "Novo Anúncio" para começar!</p></div>`; return; }
    meusAnunciosEl.innerHTML = meus.map(p => {
        const fotoHtml = gerarImagemHtml(p); const statusLabel = getStatusLabel(p.status); const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao); const condicaoClass = getCondicaoClass(p.condicao);
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        return `<div class="card" data-produto-id="${p.id}">${fotoHtml}<span class="status-badge ${statusClass}">${statusLabel}</span><span class="condition-badge ${condicaoClass}">${condicaoLabel}</span><span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span><div class="price">🪙 ${p.precoMoedas}</div><h3>${escapeHtml(p.titulo)}</h3><div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div><div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div><div class="actions"><button class="btn-excluir" data-action="excluir" data-id="${p.id}">Excluir</button><button class="btn-chat" data-action="chat" data-id="${p.id}" data-dono="${p.dono}">Chat</button></div></div>`;
    }).join('');
}

// ============================================================
// ADMIN
// ============================================================
async function renderAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) { const tabAdmin = document.getElementById('tab-admin'); if (tabAdmin) tabAdmin.style.display = 'none'; return; }
    const tabAdmin = document.getElementById('tab-admin'); if (tabAdmin) tabAdmin.style.display = 'block';
    const usuarios = await db.usuarios.toArray();
    document.getElementById('adminTotalUsers').textContent = usuarios.length;
    document.getElementById('adminTotalProducts').textContent = allProducts.length;
    const totalCoins = usuarios.reduce((acc, u) => acc + (u.moedas || 0), 0); document.getElementById('adminTotalCoins').textContent = totalCoins;
    const fees = await db.adminFees.toArray(); const totalFees = fees.reduce((acc, f) => acc + (f.valor || 0), 0); document.getElementById('adminTotalFees').textContent = totalFees;
    const trocas = await db.trocas.toArray();
    document.getElementById('adminTotalTrocas').textContent = trocas.length;
    const list = document.getElementById('adminProductList');
    if (list) list.innerHTML = allProducts.map(p => `<tr><td>${escapeHtml(p.titulo)}</td><td>${escapeHtml(p.dono || 'Sem dono')}</td><td>🪙 ${p.precoMoedas}</td><td><span class="condition-badge ${getCondicaoClass(p.condicao)}">${getCondicaoLabel(p.condicao)}</span></td><td><span class="status-badge ${getStatusClass(p.status)}">${getStatusLabel(p.status)}</span></td><td><button class="btn-excluir" data-action="excluir" data-id="${p.id}" style="padding:4px 12px;font-size:0.75rem;">Excluir</button></td></tr>`).join('');

    // ===== HISTÓRICO DE TROCAS (ADMIN) =====
    const historicoContainer = document.getElementById('historicoContainer');
    if (!historicoContainer) return;

    const trocasArray = await db.trocas.toArray();

    // Função para buscar nome do usuário pelo email
    function getNomeUsuario(email) {
        const user = usuarios.find(u => u.email === email);
        return user ? user.nome : email;
    }

    if (trocasArray.length === 0) {
        historicoContainer.innerHTML = `<p style="color:#94a3b8;">Nenhuma troca registrada ainda.</p>`;
        return;
    }

    // Criar uma lista de eventos mais detalhados
    const eventosDetalhados = [];

    trocasArray.forEach(t => {
        // Evento: criação da troca
        eventosDetalhados.push({
            data: new Date(t.data),
            tipo: 'criacao',
            descricao: `${getNomeUsuario(t.solicitante)} solicitou ${t.tipo === 'compra' ? 'compra' : 'troca'} de "${t.produtoTitulo}" para ${getNomeUsuario(t.dono)}`,
            usuario: t.solicitante,
            produto: t.produtoTitulo,
            status: t.status
        });

        // Eventos da troca (se houver)
        if (t.eventos && t.eventos.length > 0) {
            t.eventos.forEach(e => {
                const tipoLabel = {
                    'chat': '💬 Chat iniciado',
                    'local': '📍 Local sugerido',
                    'aceite': '✅ Solicitação aceita',
                    'recusada': '❌ Solicitação recusada',
                    'concluida': '🎉 Troca concluída',
                    'confirmacao': '✅ Confirmação'
                }[e.tipo] || e.tipo;

                eventosDetalhados.push({
                    data: new Date(e.data),
                    tipo: e.tipo,
                    descricao: `${getNomeUsuario(e.usuario)} — ${tipoLabel}: ${e.descricao}`,
                    usuario: e.usuario,
                    produto: t.produtoTitulo,
                    status: t.status
                });
            });
        }

        // Se não tiver eventos, adicionar o status atual
        if (!t.eventos || t.eventos.length === 0) {
            const statusLabel = {
                'pendente': '⏳ Pendente',
                'aceita': '✅ Aceita',
                'entregue': '📦 Entregue',
                'recebido': '📥 Recebido',
                'concluida': '🎉 Concluída',
                'cancelada': '❌ Cancelada'
            }[t.status] || t.status;

            eventosDetalhados.push({
                data: new Date(t.data),
                tipo: 'status',
                descricao: `Status atual: ${statusLabel} — ${getNomeUsuario(t.solicitante)} ↔ ${getNomeUsuario(t.dono)}`,
                usuario: t.solicitante,
                produto: t.produtoTitulo,
                status: t.status
            });
        }
    });

    // Ordenar por data (mais recente primeiro)
    eventosDetalhados.sort((a, b) => b.data - a.data);

    if (eventosDetalhados.length === 0) {
        historicoContainer.innerHTML = `<p style="color:#94a3b8;">Nenhum evento registrado ainda.</p>`;
        return;
    }

    // Cores por tipo
    const tipoClass = {
        'criacao': 'tipo-aceite',
        'chat': 'tipo-chat',
        'local': 'tipo-local',
        'aceite': 'tipo-aceite',
        'recusada': 'tipo-recusada',
        'concluida': 'tipo-concluida',
        'status': 'tipo-status'
    };

    historicoContainer.innerHTML = `
        <h3 style="margin:20px 0 10px;">📜 Histórico Completo de Atividades</h3>
        <div class="historico-timeline">
            ${eventosDetalhados.map(e => {
                const dataStr = e.data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const classe = tipoClass[e.tipo] || '';
                const statusBadge = e.status ? `<span class="status-badge ${getStatusClass(e.status)}" style="font-size:0.6rem;margin-left:8px;">${getStatusLabel(e.status)}</span>` : '';
                return `
                    <div class="historico-item ${classe}">
                        <div class="data">${dataStr}</div>
                        <div class="descricao">
                            <span class="usuario">${escapeHtml(e.descricao)}</span>
                            ${statusBadge}
                        </div>
                        <div style="font-size:0.75rem;color:#94a3b8;">📦 ${escapeHtml(e.produto)}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ============================================================
// FUNÇÕES DE SOLICITAÇÃO (TROCA E COMPRA VIA CHAT)
// ============================================================
async function solicitarTrocaViaChat(produtoId, donoEmail) {
    if (!currentUser) { showToast('Faça login primeiro.'); return; }
    if (currentUser.email === donoEmail) { showToast('Você não pode solicitar troca do seu próprio produto.'); return; }

    // Buscar todos os produtos do usuário (para oferecer em troca)
    const meusProdutos = allProducts.filter(p => p.dono === currentUser.email && p.status === 'disponivel');
    if (meusProdutos.length === 0) {
        showToast('❌ Você não tem nenhum produto disponível para oferecer em troca. Crie um anúncio primeiro.');
        return;
    }

    // Mostrar lista de produtos do usuário para escolher qual oferecer
    let opcoes = meusProdutos.map((p, i) => `${i+1}. ${p.titulo} (${p.precoMoedas} moedas)`).join('\n');
    const escolha = prompt(`Qual produto você deseja oferecer em troca?\n${opcoes}\n\nDigite o número do produto:`);
    if (!escolha) return;
    const index = parseInt(escolha) - 1;
    if (isNaN(index) || index < 0 || index >= meusProdutos.length) {
        showToast('❌ Escolha inválida.');
        return;
    }
    const produtoOferecido = meusProdutos[index];

    // Mensagem personalizada
    const mensagem = prompt('💬 Envie uma mensagem para o vendedor (opcional):');
    const textoMensagem = mensagem ? mensagem.trim() : '';

    // Criar solicitação de troca
    const novaTroca = {
        produtoId: produtoId,
        produtoTitulo: allProducts.find(p => p.id === produtoId)?.titulo || 'Produto',
        solicitante: currentUser.email,
        dono: donoEmail,
        status: 'pendente',
        tipo: 'troca',
        mensagem: textoMensagem || 'Oferecendo troca',
        data: new Date().toISOString(),
        dataEntrega: null,
        dataRecebimento: null,
        avaliado: false,
        localCombinado: null,
        produtoOferecidoId: produtoOferecido.id,
        produtoOferecidoTitulo: produtoOferecido.titulo,
        valorMoedas: produtoOferecido.precoMoedas
    };
    const id = await db.trocas.add(novaTroca);
    console.log('✅ Solicitação de troca criada:', id);

    // Registrar evento
    await adicionarEventoTroca(id, 'chat', `${currentUser.email} solicitou troca oferecendo ${produtoOferecido.titulo}`, currentUser.email);

    // Notificar o dono
    await db.notificacoes.add({
        para: donoEmail,
        de: currentUser.email,
        produtoId: produtoId,
        produtoTitulo: novaTroca.produtoTitulo,
        mensagem: `${currentUser.nome} quer trocar "${novaTroca.produtoTitulo}" pelo seu produto "${produtoOferecido.titulo}". ${textoMensagem ? 'Mensagem: '+textoMensagem : ''}`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao_troca'
    });

    showToast('✅ Solicitação de troca enviada!');
    await renderMinhasTrocas();
    await atualizarBadges();
}

async function solicitarCompraViaChat(produtoId, donoEmail) {
    if (!currentUser) { showToast('Faça login primeiro.'); return; }
    if (currentUser.email === donoEmail) { showToast('Você não pode comprar seu próprio produto.'); return; }

    const produto = allProducts.find(p => p.id === produtoId);
    if (!produto) { showToast('Produto não encontrado.'); return; }
    if (produto.status !== 'disponivel') { showToast('Este produto não está mais disponível.'); return; }

    const preco = produto.precoMoedas;
    if (currentUser.moedas < preco) {
        showToast(`❌ Você não tem moedas suficientes. Você tem 🪙${currentUser.moedas}, necessário 🪙${preco}.`);
        return;
    }

    const confirmar = confirm(`Deseja comprar "${produto.titulo}" por 🪙${preco} moedas?`);
    if (!confirmar) return;

    // Criar solicitação de compra
    const novaTroca = {
        produtoId: produtoId,
        produtoTitulo: produto.titulo,
        solicitante: currentUser.email,
        dono: donoEmail,
        status: 'pendente',
        tipo: 'compra',
        mensagem: `Comprando por ${preco} moedas`,
        data: new Date().toISOString(),
        dataEntrega: null,
        dataRecebimento: null,
        avaliado: false,
        localCombinado: null,
        valorMoedas: preco,
        produtoOferecidoId: null,
        produtoOferecidoTitulo: null
    };
    const id = await db.trocas.add(novaTroca);
    console.log('✅ Solicitação de compra criada:', id);

    // Registrar evento
    await adicionarEventoTroca(id, 'chat', `${currentUser.email} solicitou compra por ${preco} moedas`, currentUser.email);

    // Notificar o dono
    await db.notificacoes.add({
        para: donoEmail,
        de: currentUser.email,
        produtoId: produtoId,
        produtoTitulo: produto.titulo,
        mensagem: `${currentUser.nome} quer comprar seu produto "${produto.titulo}" por 🪙${preco} moedas.`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'solicitacao_compra'
    });

    showToast('✅ Solicitação de compra enviada!');
    await renderMinhasTrocas();
    await atualizarBadges();
}

// ============================================================
// FUNÇÕES DE RESPOSTA À SOLICITAÇÃO
// ============================================================
async function responderSolicitacao(trocaId, resposta) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) { showToast('Troca não encontrada.'); return; }

    if (resposta === 'aceitar') {
        troca.status = 'aceita';
        await db.trocas.put(troca);
        await adicionarEventoTroca(trocaId, 'aceite', `${currentUser.email} aceitou a solicitação`, currentUser.email);

        // Se for compra, já transferir as moedas
        if (troca.tipo === 'compra') {
            const comprador = await db.usuarios.where('email').equals(troca.solicitante).first();
            const vendedor = await db.usuarios.where('email').equals(troca.dono).first();
            const preco = troca.valorMoedas || 0;
            if (comprador && vendedor && comprador.moedas >= preco) {
                const taxa = Math.floor(preco * 0.15);
                const valorFinal = preco - taxa;
                comprador.moedas -= preco;
                vendedor.moedas += valorFinal;
                await db.usuarios.put(comprador);
                await db.usuarios.put(vendedor);
                await db.adminFees.add({ valor: taxa, data: new Date().toISOString() });
                // Atualizar o produto para vendido
                const produto = await db.produtos.get(troca.produtoId);
                if (produto) {
                    produto.status = 'vendido';
                    produto.vendido = true;
                    await db.produtos.put(produto);
                    await loadProducts();
                }
                troca.status = 'concluida';
                troca.dataRecebimento = new Date().toISOString();
                await db.trocas.put(troca);
                await adicionarEventoTroca(trocaId, 'concluida', `Compra concluída por ${preco} moedas`, currentUser.email);
                showToast('✅ Compra concluída! Moedas transferidas.');
                await renderMinhasTrocas();
                await atualizarBadges();
                await atualizarMoedas();
                return;
            } else {
                showToast('❌ Erro na transferência de moedas.');
                return;
            }
        }

        // Se for troca, notificar
        if (troca.tipo === 'troca') {
            await db.notificacoes.add({
                para: troca.solicitante,
                de: currentUser.email,
                produtoId: troca.produtoId,
                produtoTitulo: troca.produtoTitulo,
                mensagem: `${currentUser.nome} aceitou sua troca! Entre em contato pelo chat para combinar a entrega.`,
                data: new Date().toISOString(),
                lida: false,
                tipo: 'troca_aceita'
            });
            showToast('✅ Troca aceita!');
        }
    } else {
        // Recusar
        troca.status = 'cancelada';
        await db.trocas.put(troca);
        await adicionarEventoTroca(trocaId, 'recusada', `${currentUser.email} recusou a solicitação`, currentUser.email);
        await db.notificacoes.add({
            para: troca.solicitante,
            de: currentUser.email,
            produtoId: troca.produtoId,
            produtoTitulo: troca.produtoTitulo,
            mensagem: `${currentUser.nome} recusou sua solicitação.`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'troca_recusada'
        });
        showToast('❌ Solicitação recusada.');
    }

    await renderMinhasTrocas();
    await atualizarBadges();
}

async function adicionarEventoTroca(trocaId, tipo, descricao, usuario) {
    console.log('📝 Adicionar evento à troca:', trocaId, tipo, descricao);
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;
    if (!troca.eventos) troca.eventos = [];
    troca.eventos.push({
        data: new Date().toISOString(),
        tipo: tipo,
        descricao: descricao,
        usuario: usuario
    });
    await db.trocas.put(troca);
    console.log('✅ Evento adicionado');
}

// ============================================================
// MINHAS TROCAS
// ============================================================
async function renderMinhasTrocas() {
    const minhasTrocasList = document.getElementById('minhasTrocasList');
    if (!minhasTrocasList) return;
    if (!currentUser) {
        minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Faça login para ver suas trocas.</p>';
        return;
    }
    console.log('🔍 Buscando trocas para o usuário:', currentUser.email);
    try {
        const trocas = await db.trocas.toArray();
        console.log('📋 Todas as trocas:', trocas);
        const minhas = trocas.filter(t => t.solicitante === currentUser.email || t.dono === currentUser.email);
        console.log('✅ Trocas encontradas para o usuário:', minhas);
        if (minhas.length === 0) {
            minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Você ainda não tem trocas.</p>';
            return;
        }
        minhasTrocasList.innerHTML = minhas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(t => {
            const isSolicitante = t.solicitante === currentUser.email;
            const outroUsuario = isSolicitante ? t.dono : t.solicitante;
            const statusLabel = getTrocaStatusLabel(t.status);
            const statusClass = getTrocaStatusClass(t.status);
            const podeAceitar = t.status === 'pendente' && t.dono === currentUser.email;
            const podeRecusar = t.status === 'pendente' && t.dono === currentUser.email;
            const podeCancelar = t.status === 'pendente' && t.solicitante === currentUser.email;
            const tipoLabel = t.tipo === 'compra' ? '💰 Compra' : '🔄 Troca';
            const detalhes = t.tipo === 'compra' ? `Valor: 🪙${t.valorMoedas || 0}` :
                             t.produtoOferecidoTitulo ? `Oferece: ${t.produtoOferecidoTitulo}` : '';

            const produto = allProducts.find(p => p.id === t.produtoId);
            const fotoProduto = produto ? gerarImagemHtml(produto, 'troca-thumb') : '<div class="no-image" style="width:40px;height:40px;">📷</div>';

            return `<div class="troca-item" data-troca-id="${t.id}">
                <div class="troca-info">
                    <div class="produto-nome">
                        ${fotoProduto}
                        <span>${escapeHtml(t.produtoTitulo)}</span>
                    </div>
                    <div style="font-size:0.85rem;color:#64748b;">${isSolicitante ? 'Você quer' : 'Você recebeu'} de ${escapeHtml(outroUsuario)}</div>
                    <div style="font-size:0.85rem;color:#64748b;margin-top:4px;">${tipoLabel} — ${detalhes}</div>
                    <div style="font-size:0.85rem;color:#64748b;margin-top:4px;">💬 ${escapeHtml(t.mensagem)}</div>
                    ${t.localCombinado ? `<div style="font-size:0.85rem;color:#16a34a;margin-top:4px;">📍 Local combinado: ${escapeHtml(t.localCombinado)}</div>` : ''}
                    <span class="troca-status ${statusClass}">${statusLabel}</span>
                    ${t.dataEntrega ? `<div style="font-size:0.75rem;color:#94a3b8;">Entregue em: ${new Date(t.dataEntrega).toLocaleDateString('pt-BR')}</div>` : ''}
                    ${t.dataRecebimento ? `<div style="font-size:0.75rem;color:#94a3b8;">Recebido em: ${new Date(t.dataRecebimento).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
                <div class="troca-actions">
                    ${podeAceitar ? `<button class="btn-aceitar-troca" data-action="aceitar-solicitacao" data-id="${t.id}">✅ Aceitar</button>` : ''}
                    ${podeRecusar ? `<button class="btn-recusar-troca" data-action="recusar-solicitacao" data-id="${t.id}">❌ Recusar</button>` : ''}
                    ${podeCancelar ? `<button class="btn-recusar-troca" data-action="recusar-solicitacao" data-id="${t.id}">🗑️ Cancelar</button>` : ''}
                    ${t.status === 'aceita' && t.dono === currentUser.email ? `<button class="btn-entregar" data-action="marcar-entregue" data-id="${t.id}">📦 Marcar Entregue</button>` : ''}
                    ${t.status === 'entregue' && t.solicitante === currentUser.email ? `<button class="btn-receber" data-action="marcar-recebido" data-id="${t.id}">✅ Confirmar Recebimento</button>` : ''}
                    ${t.status === 'concluida' && !t.avaliado ? `<button class="btn-avaliar" data-action="avaliar" data-id="${t.id}">⭐ Avaliar</button>` : ''}
                    <button class="btn-chat" data-action="chat" data-id="${t.produtoId}" data-dono="${outroUsuario}">💬 Chat</button>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Erro ao renderizar trocas:', error);
        minhasTrocasList.innerHTML = '<p style="color:#ef4444;">Erro ao carregar trocas. Verifique o console.</p>';
    }
}

// ============================================================
// AVALIAÇÕES
// ============================================================
function abrirAvaliacaoModal(trocaId) {
    avaliacaoParaTrocaId = trocaId; const modal = document.getElementById('avaliacaoModal'); if (modal) modal.classList.add('active'); document.getElementById('btnEnviarAvaliacao').onclick = () => enviarAvaliacao(trocaId);
}
function fecharAvaliacaoModal() { const modal = document.getElementById('avaliacaoModal'); if (modal) modal.classList.remove('active'); avaliacaoParaTrocaId = null; }

async function enviarAvaliacao(trocaId) {
    const troca = await db.trocas.get(trocaId); if (!troca) return;
    const notaProduto = parseInt(document.getElementById('notaProduto').value); const notaVendedor = parseInt(document.getElementById('notaVendedor').value); const comentario = document.getElementById('comentarioAvaliacao').value.trim();
    await db.avaliacoes.add({ produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, de: currentUser.email, para: troca.dono, notaProduto: notaProduto, notaVendedor: notaVendedor, comentario: comentario, data: new Date().toISOString() });
    troca.avaliado = true; await db.trocas.put(troca);
    await db.notificacoes.add({ para: troca.dono, de: currentUser.email, produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, mensagem: `${currentUser.nome} avaliou a troca de "${troca.produtoTitulo}"! Produto: ${notaProduto}⭐ Vendedor: ${notaVendedor}⭐`, data: new Date().toISOString(), lida: false, tipo: 'avaliacao' });
    fecharAvaliacaoModal(); showToast('⭐ Avaliação enviada! Obrigado!'); renderAvaliacoes(); atualizarBadges();
}

async function renderAvaliacoes() {
    const avaliacoesList = document.getElementById('avaliacoesList'); if (!avaliacoesList) return;
    const avaliacoes = await db.avaliacoes.toArray();
    const unique = new Map();
    avaliacoes.forEach(a => { if (!unique.has(a.id)) unique.set(a.id, a); });
    const unicos = Array.from(unique.values());
    if (unicos.length === 0) { avaliacoesList.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;text-align:center;">Nenhuma avaliação ainda.</p>'; return; }
    avaliacoesList.innerHTML = unicos.sort((a, b) => new Date(b.data) - new Date(a.data)).map(a => {
        const starsProduto = '⭐'.repeat(a.notaProduto) + '☆'.repeat(5 - a.notaProduto); const starsVendedor = '⭐'.repeat(a.notaVendedor) + '☆'.repeat(5 - a.notaVendedor); const data = new Date(a.data).toLocaleDateString('pt-BR');
        return `<div class="avaliacao-item"><div style="font-weight:600;">📦 ${escapeHtml(a.produtoTitulo)}</div><div style="font-size:0.85rem;color:#64748b;">${escapeHtml(a.de)} → ${escapeHtml(a.para)}</div><div class="stars">Produto: ${starsProduto}</div><div class="stars">Vendedor: ${starsVendedor}</div>${a.comentario ? `<div class="avaliacao-comentario">"${escapeHtml(a.comentario)}"</div>` : ''}<div class="avaliacao-data">${data}</div></div>`;
    }).join('');
}

// ============================================================
// EXCLUIR ANÚNCIO
// ============================================================
async function excluirAnuncio(id) {
    if (!currentUser) return; const produto = allProducts.find(p => p.id === id); if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) { showToast('Você só pode excluir seus próprios anúncios.'); return; }
    if (!confirm(`Tem certeza que deseja excluir "${produto.titulo}"?`)) return;
    await db.produtos.delete(id);
    await loadProducts();
    showToast('Anúncio removido.'); renderizarAnuncios(); renderMeusAnuncios(); renderAdminPanel();
}

// ============================================================
// CHAT - PAINEL LATERAL
// ============================================================
async function abrirChat(produtoId, outroUsuario) {
    if (!currentUser) { showToast('Faça login para usar o chat.'); return; }
    abrirChatPanel();
    const chats = await db.chats.toArray();
    let chat = chats.find(c => c.produtoId === produtoId && ((c.usuario1 === currentUser.email && c.usuario2 === outroUsuario) || (c.usuario1 === outroUsuario && c.usuario2 === currentUser.email)));
    if (!chat) {
        const novoChat = { produtoId: produtoId, usuario1: currentUser.email, usuario2: outroUsuario, mensagens: [], data: new Date().toISOString(), localCombinado: null, localAceito: false };
        const id = await db.chats.add(novoChat);
        chat = { ...novoChat, id };
        const trocas = await db.trocas.toArray();
        const troca = trocas.find(t => t.produtoId === produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
        if (troca) {
            await adicionarEventoTroca(troca.id, 'chat', `Chat iniciado entre ${currentUser.email} e ${outroUsuario}`, currentUser.email);
        }
    }
    await carregarConversa(chat.id);
    await marcarMensagensLidas(chat.id);
}

async function carregarConversa(chatId) {
    const chat = await db.chats.get(chatId);
    if (!chat) return;
    currentChatId = chatId;
    const conversationDiv = document.getElementById('chatConversation');
    const listDiv = document.getElementById('chatListContainer');
    const title = document.getElementById('chatConvTitle');
    const messagesDiv = document.getElementById('chatMessages');
    const trocaInfo = document.getElementById('chatTrocaInfo');
    if (!conversationDiv || !messagesDiv) return;

    const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
    const produto = allProducts.find(p => p.id === chat.produtoId);
    title.textContent = `Conversa com ${escapeHtml(outro)}`;

    // Configurar botões de ação
    const btnTroca = document.getElementById('btnSolicitarTroca');
    const btnCompra = document.getElementById('btnSolicitarCompra');
    if (btnTroca && chat.produtoId) {
        btnTroca.dataset.produtoId = chat.produtoId;
        btnTroca.dataset.dono = outro;
        btnTroca.onclick = function() {
            const pid = parseInt(this.dataset.produtoId);
            const dono = this.dataset.dono;
            if (pid && dono) solicitarTrocaViaChat(pid, dono);
        };
    }
    if (btnCompra && chat.produtoId) {
        btnCompra.dataset.produtoId = chat.produtoId;
        btnCompra.dataset.dono = outro;
        btnCompra.onclick = function() {
            const pid = parseInt(this.dataset.produtoId);
            const dono = this.dataset.dono;
            if (pid && dono) solicitarCompraViaChat(pid, dono);
        };
    }
    // Esconder botões se for o dono do produto
    if (currentUser && currentUser.email === outro) {
        if (btnTroca) btnTroca.style.display = 'none';
        if (btnCompra) btnCompra.style.display = 'none';
    } else {
        if (btnTroca) btnTroca.style.display = 'inline-block';
        if (btnCompra) btnCompra.style.display = 'inline-block';
    }

    const trocas = await db.trocas.toArray();
    const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
    if (troca && troca.status === 'concluida') {
        trocaInfo.textContent = '✅ Esta troca já foi concluída.';
        trocaInfo.style.color = '#16a34a';
        if (btnTroca) btnTroca.style.display = 'none';
        if (btnCompra) btnCompra.style.display = 'none';
    } else if (troca && troca.status === 'cancelada') {
        trocaInfo.textContent = '❌ Esta troca foi cancelada.';
        trocaInfo.style.color = '#ef4444';
        if (btnTroca) btnTroca.style.display = 'none';
        if (btnCompra) btnCompra.style.display = 'none';
    } else {
        trocaInfo.textContent = '';
    }

    let localSection = '';
    if (chat.localCombinado) {
        const isSugeriu = chat.mensagens.some(m => m.de === currentUser.email && m.texto.includes('📍 Local sugerido:') && m.texto.includes(chat.localCombinado));
        const podeAceitar = !chat.localAceito && !isSugeriu;
        const aceitarBtn = podeAceitar ? `<button onclick="aceitarLocalCombinado(${chatId})">✅ Aceitar local</button>` : '';
        localSection = `<div class="chat-local-combinado ${chat.localAceito ? 'aceito' : ''}">📍 Local combinado: ${escapeHtml(chat.localCombinado)} ${chat.localAceito ? '✅ Aceito' : aceitarBtn}</div>`;
    }

    messagesDiv.innerHTML = localSection + chat.mensagens.map(msg => {
        const isMe = msg.de === currentUser.email;
        const data = new Date(msg.data).toLocaleDateString('pt-BR');
        const hora = new Date(msg.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        let content = '';
        if (msg.tipo === 'image') {
            content = `<img src="${escapeHtml(msg.texto)}" alt="Imagem" />`;
        } else {
            content = escapeHtml(msg.texto);
        }
        return `<div class="chat-message ${isMe ? 'me' : 'other'}"><strong>${isMe ? 'Você' : escapeHtml(msg.de)}</strong><br />${content}<span class="msg-date">${data} ${hora}</span></div>`;
    }).join('');

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    conversationDiv.style.display = 'flex';
    listDiv.style.display = 'none';
    renderChatList(chatId);
}

function abrirChatPanel() {
    const panel = document.getElementById('chatPanel');
    const overlay = document.getElementById('chatOverlay');
    if (!panel || !overlay) return;
    panel.classList.add('open');
    overlay.classList.add('active');
    chatPanelOpen = true;
    renderChatList();
    if (!currentChatId) {
        document.getElementById('chatConversation').style.display = 'none';
        document.getElementById('chatListContainer').style.display = 'block';
    }
}

function fecharChatPanel() {
    const panel = document.getElementById('chatPanel');
    const overlay = document.getElementById('chatOverlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    chatPanelOpen = false;
    currentChatId = null;
}

function fecharChatPorTroca(trocaId) {
    if (chatPanelOpen && currentChatId) {
        db.chats.get(currentChatId).then(chat => {
            if (chat) {
                db.trocas.toArray().then(trocas => {
                    const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
                    if (troca && troca.status === 'concluida') {
                        carregarConversa(currentChatId);
                    }
                });
            }
        });
    }
}

function voltarParaListaChat() {
    document.getElementById('chatConversation').style.display = 'none';
    document.getElementById('chatListContainer').style.display = 'block';
    currentChatId = null;
    renderChatList();
}

async function renderChatList(activeId = null) {
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    if (!currentUser) { container.innerHTML = `<div class="chat-list-empty"><span class="emoji">🔒</span><p>Faça login para ver suas conversas.</p></div>`; return; }
    try {
        const chats = await db.chats.toArray();
        const minhas = chats.filter(c => c.usuario1 === currentUser.email || c.usuario2 === currentUser.email);
        if (minhas.length === 0) { container.innerHTML = `<div class="chat-list-empty"><span class="emoji">💬</span><p>Você ainda não tem conversas.</p></div>`; return; }
        minhas.sort((a, b) => {
            const aLast = a.mensagens.length > 0 ? new Date(a.mensagens[a.mensagens.length - 1].data) : new Date(a.data);
            const bLast = b.mensagens.length > 0 ? new Date(b.mensagens[b.mensagens.length - 1].data) : new Date(b.data);
            return bLast - aLast;
        });
        let html = '';
        for (const chat of minhas) {
            const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
            const ultimaMsg = chat.mensagens.length > 0 ? chat.mensagens[chat.mensagens.length - 1] : null;
            const dataMsg = ultimaMsg ? new Date(ultimaMsg.data) : new Date(chat.data);
            const dataFormatada = dataMsg.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const produto = allProducts.find(p => p.id === chat.produtoId);
            const nomeProduto = produto ? produto.titulo : 'Produto desconhecido';
            const naoLidas = chat.mensagens.filter(m => m.de !== currentUser.email && !m.lida).length;
            const unreadBadge = naoLidas > 0 ? `<span class="chat-unread">${naoLidas}</span>` : '';
            const isActive = (activeId && activeId === chat.id) ? 'active' : '';
            html += `<div class="chat-list-item ${isActive}" data-chat-id="${chat.id}" data-produto-id="${chat.produtoId}" data-outro="${outro}">
                <div class="chat-info">
                    <div class="chat-with">👤 ${escapeHtml(outro)} ${unreadBadge}</div>
                    <div class="chat-product">📦 ${escapeHtml(nomeProduto)}</div>
                    ${chat.localCombinado ? `<div class="chat-local-status">📍 ${escapeHtml(chat.localCombinado)} ${chat.localAceito ? '✅' : '⏳'}</div>` : ''}
                    ${ultimaMsg ? `<div class="chat-last-msg">${escapeHtml(ultimaMsg.texto)}</div>` : ''}
                </div>
                <div class="chat-date">${dataFormatada}</div>
            </div>`;
        }
        container.innerHTML = html;
        container.querySelectorAll('.chat-list-item').forEach(item => {
            item.addEventListener('click', function() {
                const chatId = parseInt(this.dataset.chatId);
                if (chatId) {
                    carregarConversa(chatId);
                    marcarMensagensLidas(chatId);
                }
            });
        });
    } catch (error) { console.error('Erro ao carregar chats:', error); container.innerHTML = `<div class="error-msg">❌ Erro ao carregar conversas.</div>`; }
}

async function marcarMensagensLidas(chatId) {
    const chat = await db.chats.get(chatId);
    if (!chat) return;
    let modified = false;
    chat.mensagens.forEach(m => {
        if (m.de !== currentUser.email && !m.lida) {
            m.lida = true;
            modified = true;
        }
    });
    if (modified) {
        await db.chats.put(chat);
        atualizarBadges();
        renderChatList(chatId);
    }
}

async function enviarMensagem() {
    const input = document.getElementById('chatInput');
    if (!input || !currentChatId) return;
    const texto = input.value.trim();
    if (!texto) return;
    try {
        const chat = await db.chats.get(currentChatId);
        if (!chat) return;
        const trocas = await db.trocas.toArray();
        const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
        if (troca && (troca.status === 'concluida' || troca.status === 'cancelada')) {
            showToast('❌ Esta troca já foi finalizada. Não é possível enviar mensagens.');
            return;
        }
        const novaMsg = { id: Date.now(), de: currentUser.email, texto: texto, data: new Date().toISOString(), lida: false, tipo: 'text' };
        chat.mensagens.push(novaMsg);
        await db.chats.put(chat);
        input.value = '';
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({ para: outro, de: currentUser.email, produtoId: chat.produtoId, produtoTitulo: 'Chat', mensagem: `Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`, data: new Date().toISOString(), lida: false, tipo: 'chat' });
        carregarConversa(currentChatId);
        atualizarBadges();
    } catch (error) { console.error('Erro ao enviar mensagem:', error); showToast('❌ Erro ao enviar mensagem.'); }
}

async function enviarImagemChat(file) {
    if (!file || !currentChatId) return;
    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64 = e.target.result;
            const chat = await db.chats.get(currentChatId);
            if (!chat) return;
            const trocas = await db.trocas.toArray();
            const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
            if (troca && (troca.status === 'concluida' || troca.status === 'cancelada')) {
                showToast('❌ Esta troca já foi finalizada. Não é possível enviar imagens.');
                return;
            }
            const novaMsg = { id: Date.now(), de: currentUser.email, texto: base64, data: new Date().toISOString(), lida: false, tipo: 'image' };
            chat.mensagens.push(novaMsg);
            await db.chats.put(chat);
            const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
            await db.notificacoes.add({ para: outro, de: currentUser.email, produtoId: chat.produtoId, produtoTitulo: 'Chat', mensagem: `${currentUser.nome} enviou uma imagem`, data: new Date().toISOString(), lida: false, tipo: 'chat' });
            carregarConversa(currentChatId);
            atualizarBadges();
        };
        reader.readAsDataURL(file);
    } catch (error) { console.error('Erro ao enviar imagem:', error); showToast('❌ Erro ao enviar imagem.'); }
}

// ============================================================
// NOTIFICAÇÕES
// ============================================================
function renderNotificacoes() {
    const notificationsList = document.getElementById('notificationsList'); if (!notificationsList || !currentUser) return;
    db.notificacoes.toArray().then(notifs => {
        const minhas = notifs.filter(n => n.para === currentUser.email);
        if (minhas.length === 0) { notificationsList.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;">📭 Nenhuma notificação</div>'; return; }
        notificationsList.innerHTML = minhas.sort((a, b) => new Date(b.data) - new Date(a.data)).map(n => {
            const data = new Date(n.data).toLocaleDateString('pt-BR');
            const hora = new Date(n.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            let link = '#';
            let linkText = 'Ver';
            if (n.tipo === 'solicitacao_troca' || n.tipo === 'troca_aceita' || n.tipo === 'troca_recusada' || n.tipo === 'entrega_realizada' || n.tipo === 'troca_concluida' || n.tipo === 'solicitacao_compra') {
                link = 'index.html?tab=minhasTrocas';
                linkText = 'Ver Trocas';
            } else if (n.tipo === 'chat' || n.tipo === 'local_combinado' || n.tipo === 'local_aceito') {
                link = `index.html?tab=chats&chat=${n.produtoId}&with=${encodeURIComponent(n.de)}`;
                linkText = 'Ver Chat';
            } else if (n.tipo === 'avaliacao') {
                link = 'index.html?tab=avaliacao';
                linkText = 'Ver Avaliações';
            }
            let botoes = `<a href="${link}" style="text-decoration:none;"><button class="btn-chat-notif">${linkText}</button></a>`;
            return `<div class="notification-item" style="${n.lida ? 'opacity:0.6;' : ''}">
                <div class="notif-text" onclick="window.location.href='${link}'">${escapeHtml(n.de)}<br />${escapeHtml(n.mensagem).replace(/\n/g, '<br>')}</div>
                <div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;">
                    <span class="notif-date">${data} ${hora}</span>
                    ${botoes}
                </div>
            </div>`;
        }).join('');
    });
}

function toggleNotifications() {
    if (!currentUser) { showToast('Faça login para ver notificações.'); return; }
    const panel = document.getElementById('notificationsPanel');
    const overlay = document.getElementById('notificationsOverlay');
    if (!panel || !overlay) return;
    panel.classList.toggle('open');
    overlay.classList.toggle('active');
    if (panel.classList.contains('open')) {
        renderNotificacoes();
        db.notificacoes.toArray().then(notifs => {
            const updated = notifs.map(n => n.para === currentUser.email ? {...n, lida: true} : n);
            db.notificacoes.bulkPut(updated).then(() => atualizarBadges());
        });
    }
}

function fecharNotificacoes() {
    const panel = document.getElementById('notificationsPanel');
    const overlay = document.getElementById('notificationsOverlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// ============================================================
// BADGES
// ============================================================
async function atualizarBadges() {
    if (!currentUser) return;
    const notifBadge = document.getElementById('notifBadge');
    const notificacoes = await db.notificacoes.toArray();
    const naoLidasNotif = notificacoes.filter(n => n.para === currentUser.email && !n.lida);
    if (notifBadge) {
        notifBadge.textContent = naoLidasNotif.length;
        notifBadge.style.display = naoLidasNotif.length > 0 ? 'inline' : 'none';
    }

    const chatBadge = document.getElementById('chatBadge');
    const chats = await db.chats.toArray();
    let totalNaoLidasChat = 0;
    chats.forEach(c => {
        if (c.usuario1 === currentUser.email || c.usuario2 === currentUser.email) {
            const naoLidas = c.mensagens.filter(m => m.de !== currentUser.email && !m.lida).length;
            totalNaoLidasChat += naoLidas;
        }
    });
    if (chatBadge) {
        chatBadge.textContent = totalNaoLidasChat;
        chatBadge.style.display = totalNaoLidasChat > 0 ? 'inline' : 'none';
    }

    const trocasBadge = document.getElementById('trocasBadge');
    const trocas = await db.trocas.toArray();
    const minhasTrocas = trocas.filter(t => t.solicitante === currentUser.email || t.dono === currentUser.email);
    const pendentes = minhasTrocas.filter(t => t.status === 'pendente' || t.status === 'aceita');
    if (trocasBadge) {
        trocasBadge.textContent = pendentes.length;
        trocasBadge.style.display = pendentes.length > 0 ? 'inline' : 'none';
    }
}

// ============================================================
// PUBLICAR ANÚNCIO
// ============================================================
async function publicarAnuncio() {
    if (!currentUser) { showToast('Você precisa estar logado para publicar.'); return; }
    const tituloProduto = document.getElementById('tituloProduto'); const descricaoProduto = document.getElementById('descricaoProduto'); const categoriaProduto = document.getElementById('categoriaProduto'); const localProduto = document.getElementById('localProduto'); const trocaDesejada = document.getElementById('trocaDesejada'); const precoMoedas = document.getElementById('precoMoedas'); const condicaoProduto = document.getElementById('condicaoProduto'); const statusProduto = document.getElementById('statusProduto'); const tipoTrocaProduto = document.getElementById('tipoTrocaProduto');
    const titulo = tituloProduto?.value?.trim() || ''; const descricao = descricaoProduto?.value?.trim() || ''; const categoria = categoriaProduto?.value || ''; const local = localProduto?.value?.trim() || ''; const troca = trocaDesejada?.value?.trim() || ''; const preco = parseInt(precoMoedas?.value || '0'); const condicao = condicaoProduto?.value || 'usado'; const status = statusProduto?.value || 'disponivel'; const tipoTroca = tipoTrocaProduto?.value || 'produto';
    if (!titulo || !descricao || !local) { showToast('Preencha título, descrição e local.'); return; } if (!preco || preco < 1) { showToast('Defina um valor em moedas válido (mínimo 1).'); return; }
    await db.produtos.add({ titulo, descricao, categoria, local, trocaDesejada: troca, fotos: [], dono: currentUser.email, status: status, condicao: condicao, precoMoedas: preco, tipoTroca: tipoTroca, data: new Date().toISOString(), vendido: false, lat: userLat, lng: userLng });
    await loadProducts();
    showToast('✅ Anúncio publicado!'); tituloProduto.value = ''; descricaoProduto.value = ''; localProduto.value = `${currentUser.cidade}/${currentUser.estado}`; trocaDesejada.value = ''; precoMoedas.value = ''; renderizarAnuncios(); renderMeusAnuncios(); renderAdminPanel();
}

// ============================================================
// NAVEGAÇÃO COM ABAS
// ============================================================
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn-header').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.tab-btn-header').forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });

    const filtersRow = document.getElementById('filtersRow');
    const categoriesBar = document.getElementById('categoriesBar');
    if (tabName === 'anuncios') {
        if (filtersRow) filtersRow.classList.remove('hidden');
        if (categoriesBar) categoriesBar.style.display = 'flex';
    } else {
        if (filtersRow) filtersRow.classList.add('hidden');
        if (categoriesBar) categoriesBar.style.display = 'none';
    }

    if (tabName === 'meusAnuncios') renderMeusAnuncios();
    if (tabName === 'admin') renderAdminPanel();
    if (tabName === 'minhasTrocas') renderMinhasTrocas();
    if (tabName === 'avaliacao') renderAvaliacoes();
    if (tabName === 'chats') {
        abrirChatPanel();
    }
    if (tabName === 'indicacao') atualizarIndicacao();
}

// ============================================================
// CONTROLE DO MODAL DE LOGIN
// ============================================================
function abrirAuthModal(tipo) { const authModal = document.getElementById('authModal'); const loginBox = document.getElementById('loginBox'); const registerBox = document.getElementById('registerBox'); if (!authModal) return; authModal.classList.remove('hidden'); authModal.classList.add('active'); if (tipo === 'login') { loginBox.classList.remove('hidden'); registerBox.classList.add('hidden'); } else if (tipo === 'register') { loginBox.classList.add('hidden'); registerBox.classList.remove('hidden'); } document.getElementById('loginError').classList.remove('show'); document.getElementById('registerError').classList.remove('show'); }
function fecharAuthModal() { const authModal = document.getElementById('authModal'); if (!authModal) return; authModal.classList.remove('active'); authModal.classList.add('hidden'); }
function showLoginBox() { document.getElementById('loginBox').classList.remove('hidden'); document.getElementById('registerBox').classList.add('hidden'); document.getElementById('loginError').classList.remove('show'); }

// ============================================================
// INDICAÇÃO
// ============================================================
async function atualizarIndicacao() { if (!currentUser) return; const meuCodigoIndicacao = document.getElementById('meuCodigoIndicacao'); const indicadosList = document.getElementById('indicadosList'); if (meuCodigoIndicacao) meuCodigoIndicacao.textContent = currentUser.codigoIndicacao || 'Gerar código...'; if (indicadosList) { const usuarios = await db.usuarios.toArray(); const indicados = usuarios.filter(u => u.indicadoPor === currentUser.email); if (indicados.length === 0) indicadosList.innerHTML = '<p style="color:#94a3b8;">Nenhuma pessoa indicada ainda.</p>'; else indicadosList.innerHTML = indicados.map(u => `<div style="padding:8px 0; border-bottom:1px solid #e2e8f0;">${escapeHtml(u.nome)} - ${escapeHtml(u.email)}</div>`).join(''); } }
window.copiarCodigo = function() { if (!currentUser) return; const meuCodigoIndicacao = document.getElementById('meuCodigoIndicacao'); if (!meuCodigoIndicacao) return; const codigo = meuCodigoIndicacao.textContent; navigator.clipboard.writeText(codigo).then(() => showToast('📋 Código copiado!')).catch(() => { const input = document.createElement('input'); input.value = codigo; document.body.appendChild(input); input.select(); document.execCommand('copy'); document.body.removeChild(input); showToast('📋 Código copiado!'); }); };

// ============================================================
// AUTENTICAÇÃO
// ============================================================
async function loginUser(email, senha) { const loginError = document.getElementById('loginError'); if (!loginError) return; loginError.classList.remove('show'); const usuarios = await db.usuarios.toArray(); const user = usuarios.find(u => u.email === email && u.senha === senha); if (!user) { const userByCpf = usuarios.find(u => u.cpf === email && u.senha === senha); if (!userByCpf) { loginError.textContent = '❌ E-mail/CPF ou senha incorretos'; loginError.classList.add('show'); return false; } currentUser = userByCpf; } else { currentUser = user; } localStorage.setItem('currentUser', JSON.stringify({ email: currentUser.email })); atualizarHeader(); fecharAuthModal(); renderizarAnuncios(); renderMeusAnuncios(); renderAdminPanel(); renderMinhasTrocas(); renderAvaliacoes(); atualizarBadges(); atualizarMoedas(); const localProduto = document.getElementById('localProduto'); if (currentUser && localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`; atualizarIndicacao(); showToast(`👋 Bem-vindo(a), ${currentUser.nome}!`); return true; }

async function registerUser() { const registerError = document.getElementById('registerError'); if (!registerError) return; registerError.classList.remove('show'); const regNome = document.getElementById('regNome'); const regCpf = document.getElementById('regCpf'); const regEmail = document.getElementById('regEmail'); const regTelefone = document.getElementById('regTelefone'); const regCidade = document.getElementById('regCidade'); const regEstado = document.getElementById('regEstado'); const regSenha = document.getElementById('regSenha'); const regCodigoIndicacao = document.getElementById('regCodigoIndicacao'); const nome = regNome.value.trim(); const cpf = regCpf.value.trim(); const email = regEmail.value.trim(); const telefone = regTelefone.value.trim(); const cidade = regCidade.value.trim(); const estado = regEstado.value; const senha = regSenha.value; const codigoIndicacao = regCodigoIndicacao.value.trim().toUpperCase(); if (!nome || !cpf || !email || !telefone || !cidade || !estado || !senha) { registerError.textContent = '❌ Preencha todos os campos obrigatórios (*)'; registerError.classList.add('show'); return; } if (cpf.replace(/\D/g, '').length !== 11) { registerError.textContent = '❌ CPF inválido.'; registerError.classList.add('show'); return; } if (senha.length < 6) { registerError.textContent = '❌ A senha deve ter pelo menos 6 caracteres.'; registerError.classList.add('show'); return; } const usuarios = await db.usuarios.toArray(); const existing = usuarios.find(u => u.email === email); if (existing) { registerError.textContent = '❌ Este e-mail já está cadastrado.'; registerError.classList.add('show'); return; } const existingCpf = usuarios.find(u => u.cpf === cpf); if (existingCpf) { registerError.textContent = '❌ Este CPF já está cadastrado.'; registerError.classList.add('show'); return; } let indicadoPor = null; let bonusIndicacao = 0; if (codigoIndicacao) { const indicador = usuarios.find(u => u.codigoIndicacao === codigoIndicacao); if (indicador) { indicadoPor = indicador.email; bonusIndicacao = 20; await db.indicacoes.add({ codigo: codigoIndicacao, criadoPor: indicador.email, usadoPor: email, bonusRecebido: 20, dataUso: new Date().toISOString() }); indicador.moedas += 20; await db.usuarios.put(indicador); showToast(`🎉 Código válido! Você ganhou 20 moedas extras e seu amigo também!`); } else { registerError.textContent = '❌ Código de indicação inválido.'; registerError.classList.add('show'); return; } } function gerarCodigoIndicacao(nome) { const prefix = nome.substring(0, 3).toUpperCase(); const random = Math.random().toString(36).substring(2, 6).toUpperCase(); return `${prefix}${random}`; } let codigoGerado = gerarCodigoIndicacao(nome); let codigoExiste = usuarios.find(u => u.codigoIndicacao === codigoGerado); let tentativas = 0; while (codigoExiste && tentativas < 10) { codigoGerado = gerarCodigoIndicacao(nome + Math.random().toString(36).substring(2, 4)); codigoExiste = usuarios.find(u => u.codigoIndicacao === codigoGerado); tentativas++; } const novoUsuario = { nome, cpf, email, telefone, cidade, estado, senha, isAdmin: false, moedas: 0 + bonusIndicacao, totalGanho: 0, totalTaxas: 0, codigoIndicacao: codigoGerado, indicadoPor: indicadoPor }; await db.usuarios.add(novoUsuario); showToast(`✅ Conta criada! Você ganhou ${bonusIndicacao > 0 ? bonusIndicacao + ' moedas de bônus!' : '0 moedas!'} Seu código: ${codigoGerado}`); regNome.value = ''; regCpf.value = ''; regEmail.value = ''; regTelefone.value = ''; regCidade.value = ''; regEstado.value = ''; regSenha.value = ''; regCodigoIndicacao.value = ''; showLoginBox(); }

function logoutUser() { currentUser = null; localStorage.removeItem('currentUser'); const notificationsPanel = document.getElementById('notificationsPanel'); if (notificationsPanel) notificationsPanel.classList.remove('open'); const chatPanel = document.getElementById('chatPanel'); if (chatPanel) chatPanel.classList.remove('open'); const chatOverlay = document.getElementById('chatOverlay'); if (chatOverlay) chatOverlay.classList.remove('active'); atualizarHeader(); renderizarAnuncios(); renderMeusAnuncios(); renderAdminPanel(); renderMinhasTrocas(); showToast('👋 Você saiu.'); }

function atualizarHeader() {
    const userInfoLoggedIn = document.getElementById('userInfoLoggedIn');
    const userInfoLoggedOut = document.getElementById('userInfoLoggedOut');
    const displayName = document.getElementById('displayName');
    const coinsDisplay = document.getElementById('coinsDisplay');
    const adminBtn = document.getElementById('tabAdminBtn');
    if (currentUser) {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'flex';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'none';
        if (displayName) displayName.textContent = currentUser.nome;
        atualizarMoedas();
        atualizarBadges();
        const localProduto = document.getElementById('localProduto');
        if (localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
        if (adminBtn) adminBtn.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
        atualizarIndicacao();
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}
function atualizarMoedas() { const coinsDisplay = document.getElementById('coinsDisplay'); if (currentUser && coinsDisplay) coinsDisplay.textContent = `🪙 ${currentUser.moedas}`; }

// ============================================================
// CARREGAR PRODUTOS (inicial)
// ============================================================
async function carregarProdutos() { return await loadProducts(); }

// ============================================================
// FUNÇÕES DE LOCAL
// ============================================================
async function combinarLocal() {
    const inputLocal = document.getElementById('chatLocalInput');
    if (!inputLocal || !currentChatId) return;
    const local = inputLocal.value.trim();
    if (!local) return;
    try {
        const chat = await db.chats.get(currentChatId);
        if (!chat) return;
        chat.localCombinado = local;
        chat.localAceito = false;
        chat.mensagens.push({ id: Date.now(), de: currentUser.email, texto: `📍 Local sugerido: ${local}`, data: new Date().toISOString(), lida: false, tipo: 'text' });
        await db.chats.put(chat);
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({ para: outro, de: currentUser.email, produtoId: chat.produtoId, produtoTitulo: 'Local combinado', mensagem: `${currentUser.nome} sugeriu um local de entrega: ${local}`, data: new Date().toISOString(), lida: false, tipo: 'local_combinado' });
        
        const trocas = await db.trocas.toArray();
        const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
        if (troca) {
            await adicionarEventoTroca(troca.id, 'local', `Local sugerido: ${local}`, currentUser.email);
            troca.localCombinado = local;
            await db.trocas.put(troca);
        }

        showToast('📍 Local sugerido!');
        inputLocal.value = '';
        carregarConversa(currentChatId);
        atualizarBadges();
    } catch (error) { console.error('Erro ao combinar local:', error); showToast('❌ Erro ao combinar local.'); }
}

async function aceitarLocalCombinado(chatId) {
    try {
        const chat = await db.chats.get(chatId);
        if (!chat) return;
        chat.localAceito = true;
        await db.chats.put(chat);
        showToast('✅ Local aceito!');
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({ para: outro, de: currentUser.email, produtoId: chat.produtoId, produtoTitulo: 'Local aceito', mensagem: `${currentUser.nome} aceitou o local combinado: ${chat.localCombinado}`, data: new Date().toISOString(), lida: false, tipo: 'local_aceito' });
        
        const trocas = await db.trocas.toArray();
        const troca = trocas.find(t => t.produtoId === chat.produtoId && (t.solicitante === currentUser.email || t.dono === currentUser.email));
        if (troca) {
            await adicionarEventoTroca(troca.id, 'aceite', `Local aceito: ${chat.localCombinado}`, currentUser.email);
            troca.localCombinado = chat.localCombinado;
            await db.trocas.put(troca);
        }

        carregarConversa(chatId);
        atualizarBadges();
        await renderMinhasTrocas();
    } catch (error) { console.error('Erro ao aceitar local:', error); showToast('❌ Erro ao aceitar local.'); }
}

// ============================================================
// EVENT DELEGATION
// ============================================================
function setupEventDelegation() {
    document.addEventListener('click', async function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        e.stopPropagation();
        switch(action) {
            case 'trocar': 
                // Esta função não é mais usada diretamente (substituída pelas do chat)
                break;
            case 'excluir': 
                await excluirAnuncio(id); 
                break;
            case 'chat': 
                const dono = btn.dataset.dono; 
                await abrirChat(id, dono); 
                break;
            case 'aceitar-solicitacao': 
                await responderSolicitacao(id, 'aceitar'); 
                break;
            case 'recusar-solicitacao': 
                await responderSolicitacao(id, 'recusar'); 
                break;
            case 'aceitar-troca': 
                await responderTrocaAntiga(id, 'aceitar'); 
                break;
            case 'recusar-troca': 
                await responderTrocaAntiga(id, 'recusar'); 
                break;
            case 'marcar-entregue': 
                await marcarEntregue(id); 
                break;
            case 'marcar-recebido': 
                await marcarRecebido(id); 
                break;
            case 'avaliar': 
                abrirAvaliacaoModal(id); 
                break;
        }
    });
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.card');
        if (card && !e.target.closest('button')) {
            const produtoId = card.dataset.produtoId;
            if (produtoId) window.location.href = `produto.html?id=${produtoId}`;
        }
    });
}

// Funções antigas de troca (mantidas para compatibilidade)
async function responderTrocaAntiga(trocaId, resposta) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;
    if (resposta === 'aceitar') {
        troca.status = 'aceita';
        await db.trocas.put(troca);
        const produto = await db.produtos.get(troca.produtoId);
        if (produto) { produto.status = 'negociacao'; await db.produtos.put(produto); await loadProducts(); }
        await db.notificacoes.add({ para: troca.solicitante, de: currentUser.email, produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, mensagem: `${currentUser.nome} aceitou sua troca por "${troca.produtoTitulo}"! Entre em contato pelo chat para combinar a entrega.`, data: new Date().toISOString(), lida: false, tipo: 'troca_aceita' });
        await adicionarEventoTroca(trocaId, 'aceite', `Troca aceita por ${currentUser.email}`, currentUser.email);
        showToast('✅ Troca aceita!');
    } else {
        troca.status = 'cancelada';
        await db.trocas.put(troca);
        await db.notificacoes.add({ para: troca.solicitante, de: currentUser.email, produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, mensagem: `${currentUser.nome} recusou sua troca por "${troca.produtoTitulo}".`, data: new Date().toISOString(), lida: false, tipo: 'troca_recusada' });
        showToast('❌ Troca recusada.');
    }
    await renderMinhasTrocas();
    renderizarAnuncios();
    atualizarBadges();
}

async function marcarEntregue(trocaId) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;
    troca.status = 'entregue';
    troca.dataEntrega = new Date().toISOString();
    await db.trocas.put(troca);
    await db.notificacoes.add({ para: troca.solicitante, de: currentUser.email, produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, mensagem: `${currentUser.nome} marcou o produto como ENTREGUE. Confirme o recebimento para concluir a troca!`, data: new Date().toISOString(), lida: false, tipo: 'entrega_realizada' });
    showToast('📦 Produto marcado como entregue!');
    await renderMinhasTrocas();
    atualizarBadges();
}

async function marcarRecebido(trocaId) {
    const troca = await db.trocas.get(trocaId);
    if (!troca) return;
    troca.status = 'concluida';
    troca.dataRecebimento = new Date().toISOString();
    await db.trocas.put(troca);

    const produto = await db.produtos.get(troca.produtoId);
    if (produto) {
        const preco = produto.precoMoedas;
        const taxa = Math.floor(preco * 0.15);
        const valorFinal = preco - taxa;
        const usuarios = await db.usuarios.toArray();
        const comprador = usuarios.find(u => u.email === troca.solicitante);
        const vendedor = usuarios.find(u => u.email === troca.dono);
        if (comprador) { comprador.moedas = Math.max(0, comprador.moedas - preco); await db.usuarios.put(comprador); }
        if (vendedor) { vendedor.moedas += valorFinal; vendedor.totalGanho = (vendedor.totalGanho || 0) + valorFinal; vendedor.totalTaxas = (vendedor.totalTaxas || 0) + taxa; await db.usuarios.put(vendedor); }
        await db.adminFees.add({ valor: taxa, data: new Date().toISOString() });
        produto.status = 'vendido';
        produto.vendido = true;
        await db.produtos.put(produto);
        await loadProducts();
    }
    await db.notificacoes.add({ para: troca.dono, de: currentUser.email, produtoId: troca.produtoId, produtoTitulo: troca.produtoTitulo, mensagem: `✅ ${currentUser.nome} confirmou o recebimento! A troca foi concluída com sucesso.`, data: new Date().toISOString(), lida: false, tipo: 'troca_concluida' });
    await adicionarEventoTroca(trocaId, 'concluida', `Troca concluída por ${currentUser.email}`, currentUser.email);
    showToast('✅ Troca concluída com sucesso!');
    await renderMinhasTrocas();
    renderizarAnuncios();
    atualizarMoedas();
    atualizarBadges();
    abrirAvaliacaoModal(trocaId);
    fecharChatPorTroca(trocaId);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
    const btnLogin = document.getElementById('btnLogin'); if (btnLogin) btnLogin.addEventListener('click', () => loginUser(document.getElementById('loginEmail').value.trim(), document.getElementById('loginSenha').value));
    document.getElementById('loginEmail')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    document.getElementById('loginSenha')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    const btnRegister = document.getElementById('btnRegister'); if (btnRegister) btnRegister.addEventListener('click', registerUser);
    const btnLogout = document.getElementById('btnLogout'); if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    const btnPublicar = document.getElementById('btnPublicar'); if (btnPublicar) btnPublicar.addEventListener('click', publicarAnuncio);
    const btnNotifications = document.getElementById('btnNotifications'); if (btnNotifications) btnNotifications.addEventListener('click', toggleNotifications);
    const btnChatToggle = document.getElementById('btnChatToggle'); if (btnChatToggle) btnChatToggle.addEventListener('click', () => { if (chatPanelOpen) fecharChatPanel(); else abrirChatPanel(); });
    const btnSearch = document.getElementById('btnSearch'); if (btnSearch) btnSearch.addEventListener('click', renderizarAnuncios);
    document.getElementById('searchText')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    const btnLocalizar = document.getElementById('btnLocalizar'); if (btnLocalizar) btnLocalizar.addEventListener('click', obterLocalizacao);
    const searchRaio = document.getElementById('searchRaio'); if (searchRaio) searchRaio.addEventListener('change', renderizarAnuncios);
    const searchEstadoEl = document.getElementById('searchEstado'); if (searchEstadoEl) searchEstadoEl.addEventListener('change', renderizarAnuncios);
    document.getElementById('searchCidade')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    const btnUsarCodigo = document.getElementById('btnUsarCodigo'); if (btnUsarCodigo) { btnUsarCodigo.addEventListener('click', async () => { if (!currentUser) { showToast('Faça login para usar um código.'); return; } const inputUsarCodigo = document.getElementById('inputUsarCodigo'); const codigo = inputUsarCodigo.value.trim().toUpperCase(); if (!codigo) { showToast('Digite um código.'); return; } if (codigo === currentUser.codigoIndicacao) { showToast('❌ Você não pode usar seu próprio código.'); return; } const usuarios = await db.usuarios.toArray(); const indicador = usuarios.find(u => u.codigoIndicacao === codigo); if (!indicador) { showToast('❌ Código inválido.'); return; } if (currentUser.indicadoPor) { showToast('❌ Você já usou um código de indicação.'); return; } const indicacoes = await db.indicacoes.toArray(); const usado = indicacoes.find(i => i.usadoPor === currentUser.email); if (usado) { showToast('❌ Você já usou um código de indicação.'); return; } currentUser.indicadoPor = indicador.email; currentUser.moedas += 20; indicador.moedas += 20; await db.usuarios.put(currentUser); await db.usuarios.put(indicador); await db.indicacoes.add({ codigo: codigo, criadoPor: indicador.email, usadoPor: currentUser.email, bonusRecebido: 20, dataUso: new Date().toISOString() }); showToast(`🎉 Código válido! Você e ${indicador.nome} ganharam 20 moedas!`); atualizarMoedas(); atualizarIndicacao(); inputUsarCodigo.value = ''; }); }
    const authModal = document.getElementById('authModal'); if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) fecharAuthModal(); });
    const avaliacaoModal = document.getElementById('avaliacaoModal'); if (avaliacaoModal) avaliacaoModal.addEventListener('click', (e) => { if (e.target === avaliacaoModal) fecharAvaliacaoModal(); });
    const btnEnviarAvaliacao = document.getElementById('btnEnviarAvaliacao'); if (btnEnviarAvaliacao) btnEnviarAvaliacao.addEventListener('click', () => { if (avaliacaoParaTrocaId) enviarAvaliacao(avaliacaoParaTrocaId); });
    document.getElementById('chatOverlay')?.addEventListener('click', fecharChatPanel);
    document.getElementById('chatFileInput')?.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            enviarImagemChat(this.files[0]);
            this.value = '';
        }
    });
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
    setupEventDelegation(); setupEventListeners();
    await loadProducts();
    carregarLocalizacaoSalva();
    renderCategories(); renderizarAnuncios(); initGoogleMaps();
    const saved = localStorage.getItem('currentUser'); if (saved) { try { const data = JSON.parse(saved); const usuarios = await db.usuarios.toArray(); const user = usuarios.find(u => u.email === data.email); if (user) { currentUser = user; atualizarHeader(); renderMeusAnuncios(); renderAdminPanel(); renderMinhasTrocas(); renderAvaliacoes(); atualizarBadges(); atualizarIndicacao(); } } catch (e) { console.error('Erro ao restaurar sessão:', e); } }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
        const map = { 'anuncios': 'anuncios', 'meusAnuncios': 'meusAnuncios', 'novoAnuncio': 'novoAnuncio', 'minhasTrocas': 'minhasTrocas', 'avaliacao': 'avaliacao', 'chats': 'chats', 'indicacao': 'indicacao', 'admin': 'admin' };
        const target = map[tabParam.toLowerCase()];
        if (target) showTab(target);
        if (tabParam.toLowerCase() === 'chats') {
            const chatId = params.get('chat');
            const withUser = params.get('with');
            if (chatId && withUser) {
                setTimeout(() => abrirChat(parseInt(chatId), withUser), 500);
            } else {
                setTimeout(() => abrirChatPanel(), 300);
            }
        }
    } else {
        showTab('anuncios');
    }
    console.log('✅ Inicialização concluída (IndexedDB).');
}

// Expõe funções globais
window.showTab = showTab;
window.abrirAuthModal = abrirAuthModal;
window.fecharAuthModal = fecharAuthModal;
window.copiarCodigo = copiarCodigo;
window.fecharChatPanel = fecharChatPanel;
window.abrirChatPanel = abrirChatPanel;
window.carregarConversa = carregarConversa;
window.voltarParaListaChat = voltarParaListaChat;
window.combinarLocal = combinarLocal;
window.aceitarLocalCombinado = aceitarLocalCombinado;
window.enviarMensagem = enviarMensagem;
window.fecharAvaliacaoModal = fecharAvaliacaoModal;
window.abrirAvaliacaoModal = abrirAvaliacaoModal;
window.fecharMapa = fecharMapa;
window.limparLocalStorage = limparLocalStorage;
window.fecharNotificacoes = fecharNotificacoes;
window.toggleNotifications = toggleNotifications;

init();