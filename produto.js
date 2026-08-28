// produto.js - Integrado ao IndexedDB (db.js)

let currentUser = null;
let allProducts = [];

// ============================================================
// FUNÇÕES AUXILIARES (copiadas do script.js para manter consistência)
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
// AUTENTICAÇÃO (usando IndexedDB)
// ============================================================
async function restaurarSessao() {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const usuarios = await db.usuarios.toArray();
        const user = usuarios.find(u => u.email === data.email);
        if (user) {
            currentUser = user;
            atualizarHeader();
            return user;
        }
    } catch (e) { console.error('Erro ao restaurar sessão:', e); }
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
        db.notificacoes.toArray().then(notifs => {
            const naoLidas = notifs.filter(n => n.para === currentUser.email && !n.lida);
            if (notifBadge) {
                notifBadge.textContent = naoLidas.length;
                notifBadge.style.display = naoLidas.length > 0 ? 'inline' : 'none';
            }
        });
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (notifBadge) { notifBadge.textContent = '0'; notifBadge.style.display = 'none'; }
    }
}

// ============================================================
// CARREGAR PRODUTO (com IndexedDB)
// ============================================================
async function carregarProduto() {
    const container = document.getElementById('productDetailContainer');
    if (!container) {
        console.error('Elemento #productDetailContainer não encontrado.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id || isNaN(id)) {
        container.innerHTML = `<div class="error-msg">❌ Produto não encontrado (ID inválido).</div>`;
        return;
    }

    try {
        // Busca o produto no IndexedDB
        const produto = await db.produtos.get(id);
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

        // Adicionar evento de clique nas miniaturas
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
// FUNÇÕES GLOBAIS (solicitar troca e abrir chat)
// ============================================================
window.solicitarTroca = async function(id) {
    if (!currentUser) { showToast('🔒 Faça login para solicitar troca.'); return; }
    const produto = await db.produtos.get(id);
    if (!produto) return;
    if (produto.dono === currentUser.email) { showToast('❌ Você não pode trocar com você mesmo.'); return; }
    if (produto.status === 'vendido' || produto.status === 'cancelado') { showToast('❌ Este produto não está mais disponível.'); return; }

    const trocas = await db.trocas.toArray();
    const trocaExistente = trocas.find(t => t.produtoId === id && (t.status === 'pendente' || t.status === 'aceita'));
    if (trocaExistente) { showToast('⚠️ Já existe uma troca em andamento para este produto.'); return; }

    const mensagem = prompt('💬 Envie uma mensagem para o vendedor:\n\nDescreva o que você oferece em troca:');
    if (mensagem === null) return;
    if (!mensagem.trim()) { showToast('❌ Por favor, digite uma mensagem.'); return; }

    const novaTroca = {
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
    await db.trocas.add(novaTroca);

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
    window.location.href = 'index.html?tab=minhasTrocas';
};

window.abrirChatProduto = function(produtoId, dono) {
    if (!currentUser) { showToast('🔒 Faça login para usar o chat.'); return; }
    window.location.href = `index.html?tab=chats&chat=${produtoId}&with=${encodeURIComponent(dono)}`;
};

// ============================================================
// FUNÇÕES PARA O CHAT E AVALIAÇÃO (copiadas do script.js para manter compatibilidade)
// ============================================================
// Como o produto.html inclui os modais de chat e avaliação, precisamos
// das funções globais que são chamadas nos botões. Vamos importá-las do script.js?
// Para não duplicar código, podemos definir stubs que delegam para o script.js
// se ele já estiver carregado, mas como o script.js não está carregado aqui,
// vamos redefinir as funções básicas.

// Funções de chat (simplificadas)
let chatIdAtual = null;

window.fecharChat = function() {
    const modal = document.getElementById('chatModal');
    if (modal) modal.classList.remove('active');
    chatIdAtual = null;
};

window.combinarLocal = async function() {
    const input = document.getElementById('chatLocalInput');
    if (!input || !chatIdAtual) return;
    const local = input.value.trim();
    if (!local) return;
    try {
        const chat = await db.chats.get(chatIdAtual);
        if (!chat) return;
        chat.localCombinado = local;
        chat.localAceito = false;
        chat.mensagens.push({ id: Date.now(), de: currentUser.email, texto: `📍 Local combinado para entrega: ${local}`, data: new Date().toISOString() });
        await db.chats.put(chat);
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({
            para: outro,
            de: currentUser.email,
            produtoId: chat.produtoId,
            produtoTitulo: 'Local combinado',
            mensagem: `${currentUser.nome} sugeriu um local de entrega: ${local}`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'local_combinado'
        });
        showToast('📍 Local sugerido!');
        input.value = '';
        // Reabrir o chat com o mesmo ID
        abrirChatExistente(chatIdAtual, chat.produtoId);
    } catch (e) { console.error(e); showToast('❌ Erro ao combinar local.'); }
};

window.enviarMensagem = async function() {
    const input = document.getElementById('chatInput');
    if (!input || !chatIdAtual) return;
    const texto = input.value.trim();
    if (!texto) return;
    try {
        const chat = await db.chats.get(chatIdAtual);
        if (!chat) return;
        chat.mensagens.push({ id: Date.now(), de: currentUser.email, texto: texto, data: new Date().toISOString() });
        await db.chats.put(chat);
        input.value = '';
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({
            para: outro,
            de: currentUser.email,
            produtoId: chat.produtoId,
            produtoTitulo: 'Chat',
            mensagem: `Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'chat'
        });
        abrirChatExistente(chatIdAtual, chat.produtoId);
    } catch (e) { console.error(e); showToast('❌ Erro ao enviar mensagem.'); }
};

async function abrirChatExistente(chatId, produtoId) {
    const modal = document.getElementById('chatModal');
    const messages = document.getElementById('chatMessages');
    const title = document.getElementById('chatTitle');
    if (!modal || !messages || !title) return;
    const chat = await db.chats.get(chatId);
    if (!chat) return;
    const produto = await db.produtos.get(produtoId);
    title.textContent = `Conversa sobre: ${produto ? produto.titulo : 'Produto'}`;
    let localSection = '';
    if (chat.localCombinado) {
        localSection = `<div class="chat-local-combinado ${chat.localAceito ? 'aceito' : ''}">📍 Local combinado: ${escapeHtml(chat.localCombinado)} ${chat.localAceito ? '✅ Aceito' : '<button onclick="aceitarLocalCombinado(' + chatId + ')">✅ Aceitar local</button>'}</div>`;
    }
    messages.innerHTML = localSection + chat.mensagens.map(msg => {
        const isMe = msg.de === currentUser.email;
        const data = new Date(msg.data).toLocaleDateString('pt-BR');
        const hora = new Date(msg.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `<div class="chat-message ${isMe ? 'me' : 'other'}"><strong>${isMe ? 'Você' : escapeHtml(msg.de)}</strong><br />${escapeHtml(msg.texto)}<span class="msg-date">${data} ${hora}</span></div>`;
    }).join('');
    messages.scrollTop = messages.scrollHeight;
    modal.classList.add('active');
    chatIdAtual = chatId;
}

window.aceitarLocalCombinado = async function(chatId) {
    try {
        const chat = await db.chats.get(chatId);
        if (!chat) return;
        chat.localAceito = true;
        await db.chats.put(chat);
        showToast('✅ Local aceito!');
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        await db.notificacoes.add({
            para: outro,
            de: currentUser.email,
            produtoId: chat.produtoId,
            produtoTitulo: 'Local aceito',
            mensagem: `${currentUser.nome} aceitou o local combinado: ${chat.localCombinado}`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'local_aceito'
        });
        abrirChatExistente(chatId, chat.produtoId);
    } catch (e) { console.error(e); showToast('❌ Erro ao aceitar local.'); }
};

// Avaliação
window.fecharAvaliacaoModal = function() {
    const modal = document.getElementById('avaliacaoModal');
    if (modal) modal.classList.remove('active');
};

// ============================================================
// EVENTOS DE LOGIN/REGISTER (usando db.js)
// ============================================================
function abrirAuthModal(tipo) {
    const authModal = document.getElementById('authModal');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
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
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
}

function fecharAuthModal() {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    authModal.classList.remove('active');
    authModal.classList.add('hidden');
}

async function loginUser(email, senha) {
    const loginError = document.getElementById('loginError');
    if (!loginError) return;
    loginError.classList.remove('show');
    const usuarios = await db.usuarios.toArray();
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    if (!user) {
        const userByCpf = usuarios.find(u => u.cpf === email && u.senha === senha);
        if (!userByCpf) {
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
    // Recarregar a página para mostrar os detalhes com o usuário logado
    window.location.reload();
    return true;
}

async function registerUser() {
    const registerError = document.getElementById('registerError');
    if (!registerError) return;
    registerError.classList.remove('show');
    const regNome = document.getElementById('regNome');
    const regCpf = document.getElementById('regCpf');
    const regEmail = document.getElementById('regEmail');
    const regTelefone = document.getElementById('regTelefone');
    const regCidade = document.getElementById('regCidade');
    const regEstado = document.getElementById('regEstado');
    const regSenha = document.getElementById('regSenha');
    const regCodigoIndicacao = document.getElementById('regCodigoIndicacao');
    const nome = regNome.value.trim();
    const cpf = regCpf.value.trim();
    const email = regEmail.value.trim();
    const telefone = regTelefone.value.trim();
    const cidade = regCidade.value.trim();
    const estado = regEstado.value;
    const senha = regSenha.value;
    const codigoIndicacao = regCodigoIndicacao.value.trim().toUpperCase();

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

    const usuarios = await db.usuarios.toArray();
    if (usuarios.find(u => u.email === email)) {
        registerError.textContent = '❌ Este e-mail já está cadastrado.';
        registerError.classList.add('show');
        return;
    }
    if (usuarios.find(u => u.cpf === cpf)) {
        registerError.textContent = '❌ Este CPF já está cadastrado.';
        registerError.classList.add('show');
        return;
    }

    let indicadoPor = null;
    let bonusIndicacao = 0;
    if (codigoIndicacao) {
        const indicador = usuarios.find(u => u.codigoIndicacao === codigoIndicacao);
        if (indicador) {
            indicadoPor = indicador.email;
            bonusIndicacao = 20;
            await db.indicacoes.add({
                codigo: codigoIndicacao,
                criadoPor: indicador.email,
                usadoPor: email,
                bonusRecebido: 20,
                dataUso: new Date().toISOString()
            });
            indicador.moedas += 20;
            await db.usuarios.put(indicador);
            showToast(`🎉 Código válido! Você ganhou 20 moedas extras e seu amigo também!`);
        } else {
            registerError.textContent = '❌ Código de indicação inválido.';
            registerError.classList.add('show');
            return;
        }
    }

    function gerarCodigoIndicacao(nome) {
        const prefix = nome.substring(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${random}`;
    }
    let codigoGerado = gerarCodigoIndicacao(nome);
    let codigoExiste = usuarios.find(u => u.codigoIndicacao === codigoGerado);
    let tentativas = 0;
    while (codigoExiste && tentativas < 10) {
        codigoGerado = gerarCodigoIndicacao(nome + Math.random().toString(36).substring(2, 4));
        codigoExiste = usuarios.find(u => u.codigoIndicacao === codigoGerado);
        tentativas++;
    }

    const novoUsuario = {
        nome,
        cpf,
        email,
        telefone,
        cidade,
        estado,
        senha,
        isAdmin: false,
        moedas: 0 + bonusIndicacao,
        totalGanho: 0,
        totalTaxas: 0,
        codigoIndicacao: codigoGerado,
        indicadoPor: indicadoPor
    };
    await db.usuarios.add(novoUsuario);
    showToast(`✅ Conta criada! Você ganhou ${bonusIndicacao > 0 ? bonusIndicacao + ' moedas de bônus!' : '0 moedas!'} Seu código: ${codigoGerado}`);
    regNome.value = '';
    regCpf.value = '';
    regEmail.value = '';
    regTelefone.value = '';
    regCidade.value = '';
    regEstado.value = '';
    regSenha.value = '';
    regCodigoIndicacao.value = '';
    // Mostrar login
    document.getElementById('loginBox').classList.remove('hidden');
    document.getElementById('registerBox').classList.add('hidden');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
    // Configurar eventos de login/register
    document.getElementById('btnLogin')?.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const senha = document.getElementById('loginSenha').value;
        loginUser(email, senha);
    });
    document.getElementById('btnRegister')?.addEventListener('click', registerUser);
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        atualizarHeader();
        window.location.reload();
    });
    document.getElementById('btnNotifications')?.addEventListener('click', () => {
        showToast('🔔 Notificações: verifique no índice.');
    });

    // Restaurar sessão e carregar produto
    await restaurarSessao();
    await carregarProduto();
}

init();