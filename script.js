// script.js - 100% localStorage

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentCategory = '';
let allProducts = [];
let avaliacaoParaTrocaId = null;
let userLat = null;
let userLng = null;
let chatIdAtual = null;

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

// Funções de persistência
function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(key) {
    const data = getData(key);
    return data.length > 0 ? Math.max(...data.map(d => d.id || 0)) + 1 : 1;
}

// ============================================================
// DADOS PARA POPULAÇÃO
// ============================================================
const usuariosIniciais = [
    { id: 1, nome: 'Administrador', cpf: '000.000.000-00', email: 'adm@adm.com', telefone: '(00) 00000-0000', cidade: 'Admin', estado: 'AD', senha: '123456', isAdmin: true, moedas: 99999, totalGanho: 0, totalTaxas: 0, codigoIndicacao: 'ADMIN2024', indicadoPor: null },
    { id: 2, nome: 'Usuário Demo', cpf: '123.456.789-00', email: 'demo@trocatudo.com', telefone: '(11) 99999-9999', cidade: 'São Paulo', estado: 'SP', senha: '123456', isAdmin: false, moedas: 0, totalGanho: 0, totalTaxas: 0, codigoIndicacao: 'DEMO123', indicadoPor: null },
    { id: 3, nome: 'Usuário Demo 2', cpf: '987.654.321-00', email: 'demo2@trocatudo.com', telefone: '(21) 98888-8888', cidade: 'Rio de Janeiro', estado: 'RJ', senha: '123456', isAdmin: false, moedas: 0, totalGanho: 0, totalTaxas: 0, codigoIndicacao: 'DEMO456', indicadoPor: null }
];

const produtosIniciais = [
    { id: 1, titulo: 'Fone Bluetooth', descricao: 'Fone com cancelamento de ruído, bateria dura 4h.', categoria: 'Eletrônicos', local: 'São Paulo/SP', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Smartwatch ou jogos de PS4', status: 'disponivel', condicao: 'seminovo', precoMoedas: 120, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { id: 2, titulo: 'Teclado Mecânico Switch Blue', descricao: 'Teclado com LED RGB, ótimo para digitação e jogos.', categoria: 'Eletrônicos', local: 'Rio de Janeiro/RJ', dono: 'demo2@trocatudo.com', fotos: [], trocaDesejada: 'Mouse gamer sem fio', status: 'disponivel', condicao: 'usado', precoMoedas: 150, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { id: 3, titulo: 'Serviço de Design Gráfico', descricao: 'Criação de logos e identidade visual. 3 opções de layout.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Hardware de computador', status: 'disponivel', condicao: 'novo', precoMoedas: 200, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { id: 4, titulo: 'Monitor 24 Polegadas', descricao: 'Monitor Full HD, taxa de atualização de 75Hz.', categoria: 'Eletrônicos', local: 'Belo Horizonte/MG', dono: 'demo2@trocatudo.com', fotos: [], trocaDesejada: 'Placa de vídeo antiga', status: 'disponivel', condicao: 'seminovo', precoMoedas: 400, tipoTroca: 'produto', data: new Date().toISOString(), vendido: false },
    { id: 5, titulo: 'Aula de Violão Online', descricao: 'Aulas particulares de violão via Zoom. 4 aulas de 1h.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Instrumentos musicais', status: 'disponivel', condicao: 'novo', precoMoedas: 150, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { id: 6, titulo: 'Consultoria de Marketing Digital', descricao: 'Estratégias para redes sociais, SEO e tráfego pago. 2 horas de consultoria.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Notebook ou tablet', status: 'disponivel', condicao: 'novo', precoMoedas: 180, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { id: 7, titulo: 'Reformas e Reparos Residenciais', descricao: 'Serviços de pintura, elétrica e pequenos reparos. Orçamento gratuito.', categoria: 'Serviços', local: 'São Paulo/SP', dono: 'demo2@trocatudo.com', fotos: [], trocaDesejada: 'Ferramentas elétricas', status: 'disponivel', condicao: 'novo', precoMoedas: 250, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { id: 8, titulo: 'Aulas de Inglês Particulares', descricao: 'Aulas online ou presenciais. Do básico ao avançado. 5 aulas de 1h.', categoria: 'Serviços', local: 'Remoto', dono: 'demo@trocatudo.com', fotos: [], trocaDesejada: 'Livros de inglês ou tecnologia', status: 'disponivel', condicao: 'novo', precoMoedas: 220, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false },
    { id: 9, titulo: 'Design e Impressão 3D', descricao: 'Criação de peças personalizadas em impressão 3D. Entrega em até 5 dias.', categoria: 'Serviços', local: 'Curitiba/PR', dono: 'demo2@trocatudo.com', fotos: [], trocaDesejada: 'Peças de computador ou consertos', status: 'disponivel', condicao: 'novo', precoMoedas: 300, tipoTroca: 'servico', data: new Date().toISOString(), vendido: false }
];

// ============================================================
// INICIALIZAÇÃO DO BANCO
// ============================================================
function popularBanco() {
    if (getData(DB_KEYS.usuarios).length === 0) {
        setData(DB_KEYS.usuarios, usuariosIniciais);
    }
    if (getData(DB_KEYS.produtos).length === 0) {
        setData(DB_KEYS.produtos, produtosIniciais);
    }
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

function getStatusClass(status) {
    const classes = { 'disponivel': 'status-disponivel', 'negociacao': 'status-negociacao', 'vendido': 'status-vendido', 'cancelado': 'status-cancelado' };
    return classes[status] || 'status-disponivel';
}

function getStatusLabel(status) {
    const labels = { 'disponivel': 'Disponível', 'negociacao': 'Em negociação', 'vendido': 'Vendido', 'cancelado': 'Cancelado' };
    return labels[status] || 'Disponível';
}

function getCondicaoClass(condicao) {
    const classes = { 'novo': 'condition-novo', 'lacrado': 'condition-lacrado', 'seminovo': 'condition-seminovo', 'usado': 'condition-usado', 'ruim': 'condition-ruim' };
    return classes[condicao] || 'condition-usado';
}

function getCondicaoLabel(condicao) {
    const labels = { 'novo': 'Novo', 'lacrado': 'Lacrado', 'seminovo': 'Seminovo', 'usado': 'Usado - Boas condições', 'ruim': 'Usado - Precisa de reparos' };
    return labels[condicao] || 'Usado';
}

function getTrocaStatusLabel(status) {
    const labels = { 'pendente': 'Pendente', 'aceita': 'Aceita', 'entregue': 'Entregue', 'recebido': 'Recebido', 'concluida': 'Concluída', 'cancelada': 'Cancelada' };
    return labels[status] || status;
}

function getTrocaStatusClass(status) {
    const classes = { 'pendente': 'troca-status-pendente', 'aceita': 'troca-status-aceita', 'entregue': 'troca-status-entregue', 'recebido': 'troca-status-recebido', 'concluida': 'troca-status-concluida', 'cancelada': 'troca-status-cancelada' };
    return classes[status] || 'troca-status-pendente';
}

// ============================================================
// FUNÇÕES PARA IMAGENS
// ============================================================
function getCaminhoImagem(titulo) {
    if (!titulo) return null;
    return `src/${encodeURIComponent(titulo)}.jpg`;
}

function gerarImagemHtml(produto, classe = 'product-image') {
    if (!produto || !produto.titulo) return `<div class="no-image">📷 Sem foto</div>`;
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
// LOCALIZAÇÃO COM GOOGLE MAPS
// ============================================================
function initGoogleMaps() {
    // Substitua SUA_API_KEY pela sua chave do Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function obterLocalizacao() {
    if (!navigator.geolocation) {
        showToast('❌ Seu navegador não suporta geolocalização.');
        return;
    }
    
    showToast('📍 Obtendo sua localização...');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
            localStorage.setItem('userLocation', JSON.stringify({ lat: userLat, lng: userLng }));
            showToast('✅ Localização obtida! Produtos próximos serão exibidos.');
            
            if (typeof google !== 'undefined' && google.maps) {
                mostrarMapaGoogle(userLat, userLng);
            }
            
            renderizarAnuncios();
        },
        (error) => {
            console.error('Erro ao obter localização:', error);
            showToast('❌ Não foi possível obter sua localização. Verifique as permissões.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

function mostrarMapaGoogle(lat, lng) {
    const mapaModal = document.createElement('div');
    mapaModal.id = 'mapaModal';
    mapaModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    mapaModal.innerHTML = `
        <div style="background:white;border-radius:20px;padding:20px;width:90%;max-width:600px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3>📍 Sua Localização</h3>
                <button onclick="fecharMapa()" style="background:#ef4444;color:white;border:none;border-radius:50%;width:35px;height:35px;font-size:16px;cursor:pointer;">✕</button>
            </div>
            <div id="googleMap" style="width:100%;height:400px;border-radius:12px;"></div>
        </div>
    `;
    document.body.appendChild(mapaModal);
    
    const map = new google.maps.Map(document.getElementById('googleMap'), {
        center: { lat: lat, lng: lng },
        zoom: 14
    });
    
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: 'Você está aqui!'
    });
}

window.fecharMapa = function() {
    const mapaModal = document.getElementById('mapaModal');
    if (mapaModal) mapaModal.remove();
};

function carregarLocalizacaoSalva() {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
        try {
            const loc = JSON.parse(saved);
            userLat = loc.lat;
            userLng = loc.lng;
        } catch (e) {}
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ============================================================
// COORDENADAS APROXIMADAS (fallback quando o produto não tem lat/lng)
// ============================================================
// Coordenadas das capitais de cada estado, usadas como aproximação
// quando o anúncio não tem lat/lng próprios (ex: produtos de exemplo,
// ou publicados sem geolocalização ativada).
const CAPITAIS_UF = {
    'AC': { lat: -9.9750, lng: -67.8243 }, 'AL': { lat: -9.6498, lng: -35.7089 },
    'AP': { lat: 0.0349, lng: -51.0694 }, 'AM': { lat: -3.1190, lng: -60.0217 },
    'BA': { lat: -12.9777, lng: -38.5016 }, 'CE': { lat: -3.7172, lng: -38.5433 },
    'DF': { lat: -15.7939, lng: -47.8828 }, 'ES': { lat: -20.3155, lng: -40.3128 },
    'GO': { lat: -16.6869, lng: -49.2648 }, 'MA': { lat: -2.5307, lng: -44.3068 },
    'MT': { lat: -15.6014, lng: -56.0979 }, 'MS': { lat: -20.4697, lng: -54.6201 },
    'MG': { lat: -19.9167, lng: -43.9345 }, 'PA': { lat: -1.4558, lng: -48.4902 },
    'PB': { lat: -7.1195, lng: -34.8450 }, 'PR': { lat: -25.4284, lng: -49.2733 },
    'PE': { lat: -8.0476, lng: -34.8770 }, 'PI': { lat: -5.0892, lng: -42.8019 },
    'RJ': { lat: -22.9068, lng: -43.1729 }, 'RN': { lat: -5.7945, lng: -35.2110 },
    'RS': { lat: -30.0346, lng: -51.2177 }, 'RO': { lat: -8.7619, lng: -63.9039 },
    'RR': { lat: 2.8235, lng: -60.6758 }, 'SC': { lat: -27.5954, lng: -48.5480 },
    'SP': { lat: -23.5505, lng: -46.6333 }, 'SE': { lat: -10.9472, lng: -37.0731 },
    'TO': { lat: -10.1689, lng: -48.3317 }
};

// Algumas cidades grandes (não-capitais) que aparecem nos anúncios de exemplo.
const CIDADES_COORDS = {
    'sao paulo': { lat: -23.5505, lng: -46.6333 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'belo horizonte': { lat: -19.9167, lng: -43.9345 },
    'curitiba': { lat: -25.4284, lng: -49.2733 }
};

function removerAcentos(texto) {
    return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Retorna { lat, lng } para um produto, usando (em ordem de prioridade):
// 1) lat/lng próprios do produto, 2) a cidade extraída de "local", 3) a capital do estado extraído de "local".
// Serviços remotos (local contém "remoto") não têm localização física, então retorna null de propósito.
function obterCoordenadasProduto(produto) {
    if (produto.lat && produto.lng) return { lat: produto.lat, lng: produto.lng };
    if (!produto.local) return null;

    const localNorm = removerAcentos(produto.local);
    if (localNorm.includes('remoto')) return null;

    const partes = produto.local.split('/');
    const cidade = removerAcentos(partes[0]);
    if (CIDADES_COORDS[cidade]) return CIDADES_COORDS[cidade];

    const uf = (partes[1] || '').trim().toUpperCase();
    if (CAPITAIS_UF[uf]) return CAPITAIS_UF[uf];

    return null;
}

function isProdutoRemoto(produto) {
    return removerAcentos(produto.local).includes('remoto');
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
async function loginUser(email, senha) {
    const loginError = document.getElementById('loginError');
    if (!loginError) return;
    loginError.classList.remove('show');
    
    const usuarios = getData(DB_KEYS.usuarios);
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
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
    renderMinhasTrocas();
    renderAvaliacoes();
    atualizarBadge();
    atualizarMoedas();
    const localProduto = document.getElementById('localProduto');
    if (currentUser && localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
    renderChats();
    atualizarIndicacao();
    showToast(`👋 Bem-vindo(a), ${currentUser.nome}!`);
    return true;
}

// ============================================================
// FUNÇÃO DE REGISTRO
// ============================================================
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
    
    const usuarios = getData(DB_KEYS.usuarios);
    const existing = usuarios.find(u => u.email === email);
    if (existing) {
        registerError.textContent = '❌ Este e-mail já está cadastrado.';
        registerError.classList.add('show');
        return;
    }
    
    const existingCpf = usuarios.find(u => u.cpf === cpf);
    if (existingCpf) {
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
            
            const indicacoes = getData(DB_KEYS.indicacoes);
            indicacoes.push({ id: getNextId(DB_KEYS.indicacoes), codigo: codigoIndicacao, criadoPor: indicador.email, usadoPor: email, bonusRecebido: 20, dataUso: new Date().toISOString() });
            setData(DB_KEYS.indicacoes, indicacoes);
            
            indicador.moedas += 20;
            const userIndex = usuarios.findIndex(u => u.id === indicador.id);
            if (userIndex !== -1) {
                usuarios[userIndex] = indicador;
                setData(DB_KEYS.usuarios, usuarios);
            }
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
        id: getNextId(DB_KEYS.usuarios),
        nome, cpf, email, telefone, cidade, estado, senha,
        isAdmin: false,
        moedas: 0 + bonusIndicacao,
        totalGanho: 0,
        totalTaxas: 0,
        codigoIndicacao: codigoGerado,
        indicadoPor: indicadoPor
    };
    
    usuarios.push(novoUsuario);
    setData(DB_KEYS.usuarios, usuarios);
    
    showToast(`✅ Conta criada! Você ganhou ${bonusIndicacao > 0 ? bonusIndicacao + ' moedas de bônus!' : '0 moedas!'} Seu código: ${codigoGerado}`);
    
    regNome.value = ''; regCpf.value = ''; regEmail.value = ''; regTelefone.value = ''; regCidade.value = ''; regEstado.value = ''; regSenha.value = ''; regCodigoIndicacao.value = '';
    showLoginBox();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    const notificationsPanel = document.getElementById('notificationsPanel');
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
    const userInfoLoggedIn = document.getElementById('userInfoLoggedIn');
    const userInfoLoggedOut = document.getElementById('userInfoLoggedOut');
    const displayName = document.getElementById('displayName');
    const coinsDisplay = document.getElementById('coinsDisplay');
    const notifBadge = document.getElementById('notifBadge');
    const adminBtn = document.getElementById('tabAdminBtn');

    if (currentUser) {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'flex';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'none';
        if (displayName) displayName.textContent = currentUser.nome;
        atualizarMoedas();
        atualizarBadge();
        const localProduto = document.getElementById('localProduto');
        if (localProduto) localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
        if (adminBtn) adminBtn.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
        atualizarIndicacao();
    } else {
        if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        if (userInfoLoggedOut) userInfoLoggedOut.style.display = 'flex';
        if (coinsDisplay) coinsDisplay.textContent = '🪙 0';
        if (notifBadge) { notifBadge.textContent = '0'; notifBadge.style.display = 'none'; }
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

function atualizarMoedas() {
    const coinsDisplay = document.getElementById('coinsDisplay');
    if (currentUser && coinsDisplay) coinsDisplay.textContent = `🪙 ${currentUser.moedas}`;
}

function atualizarBadge() {
    const notifBadge = document.getElementById('notifBadge');
    if (!currentUser) { if (notifBadge) { notifBadge.textContent = '0'; notifBadge.style.display = 'none'; } return; }
    const notificacoes = getData(DB_KEYS.notificacoes).filter(n => n.para === currentUser.email && !n.lida);
    if (notifBadge) { notifBadge.textContent = notificacoes.length; notifBadge.style.display = notificacoes.length > 0 ? 'inline' : 'none'; }
}

// ============================================================
// INDICAÇÃO
// ============================================================
async function atualizarIndicacao() {
    if (!currentUser) return;
    const meuCodigoIndicacao = document.getElementById('meuCodigoIndicacao');
    const indicadosList = document.getElementById('indicadosList');
    if (meuCodigoIndicacao) meuCodigoIndicacao.textContent = currentUser.codigoIndicacao || 'Gerar código...';
    if (indicadosList) {
        const usuarios = getData(DB_KEYS.usuarios);
        const indicados = usuarios.filter(u => u.indicadoPor === currentUser.email);
        if (indicados.length === 0) indicadosList.innerHTML = '<p style="color:#94a3b8;">Nenhuma pessoa indicada ainda.</p>';
        else indicadosList.innerHTML = indicados.map(u => `<div style="padding:8px 0; border-bottom:1px solid #e2e8f0;">${escapeHtml(u.nome)} - ${escapeHtml(u.email)}</div>`).join('');
    }
}

window.copiarCodigo = function() {
    if (!currentUser) return;
    const meuCodigoIndicacao = document.getElementById('meuCodigoIndicacao');
    if (!meuCodigoIndicacao) return;
    const codigo = meuCodigoIndicacao.textContent;
    navigator.clipboard.writeText(codigo).then(() => showToast('📋 Código copiado!')).catch(() => {
        const input = document.createElement('input'); input.value = codigo; document.body.appendChild(input); input.select(); document.execCommand('copy'); document.body.removeChild(input); showToast('📋 Código copiado!');
    });
};

// ============================================================
// CARREGAR PRODUTOS
// ============================================================
function carregarProdutos() {
    allProducts = getData(DB_KEYS.produtos);
    return allProducts;
}

function ordenarProdutos(produtos) {
    const arr = [...produtos];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
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
    const searchCidade = document.getElementById('searchCidade');
    const searchEstado = document.getElementById('searchEstado');
    
    const search = searchText ? searchText.value.toLowerCase().trim() : '';
    if (search) produtos = produtos.filter(p => p.titulo.toLowerCase().includes(search) || p.descricao.toLowerCase().includes(search));
    
    const cidade = searchCidade ? searchCidade.value.toLowerCase().trim() : '';
    if (cidade) produtos = produtos.filter(p => p.local.toLowerCase().includes(cidade));
    
    const estado = searchEstado ? searchEstado.value : '';
    if (estado) produtos = produtos.filter(p => p.local.includes(estado));

    const searchRaio = document.getElementById('searchRaio');
    const raioKm = searchRaio ? parseInt(searchRaio.value) : 0;

    if (userLat && userLng) {
        produtos.forEach(p => {
            const coords = obterCoordenadasProduto(p);
            p.distancia = coords ? calcularDistancia(userLat, userLng, coords.lat, coords.lng) : null;
        });
        produtos.sort((a, b) => {
            if (a.distancia === null && b.distancia === null) return 0;
            if (a.distancia === null) return 1;
            if (b.distancia === null) return -1;
            return a.distancia - b.distancia;
        });

        if (raioKm > 0) {
            produtos = produtos.filter(p => isProdutoRemoto(p) || (p.distancia !== null && p.distancia <= raioKm));
        }
    } else {
        if (raioKm > 0) { showToast('📍 Ative sua localização para filtrar por distância.'); }
        produtos = ordenarProdutos(produtos);
    }
    
    produtos = produtos.filter(p => p.status !== 'vendido' && p.status !== 'cancelado');

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
                <div class="owner">${escapeHtml(p.dono)}</div>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                ${distanciaText ? `<div class="distancia-text">${distanciaText}</div>` : ''}
                <div style="font-size:0.8rem;color:#64748b;margin:4px 0;">${tipoTrocaLabel}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                ${p.trocaDesejada ? `<div style="font-size:0.85rem;color:#475569;margin-bottom:10px;">Quer: ${escapeHtml(p.trocaDesejada)}</div>` : ''}
                <div class="actions">
                    ${!isOwner && currentUser && p.status !== 'vendido' ? `<button class="btn-trocar" data-action="trocar" data-id="${p.id}">Trocar</button>` : ''}
                    ${podeExcluir ? `<button class="btn-excluir" data-action="excluir" data-id="${p.id}">Excluir</button>` : ''}
                    ${currentUser && !isOwner ? `<button class="btn-chat" data-action="chat" data-id="${p.id}" data-dono="${p.dono}">Chat</button>` : ''}
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
    const meusAnunciosEl = document.getElementById('meusAnuncios');
    if (!meusAnunciosEl) return;
    if (!currentUser) { meusAnunciosEl.innerHTML = '<div class="empty-state"><p>Faça login para ver seus anúncios.</p></div>'; return; }
    const meus = allProducts.filter(p => p.dono === currentUser.email);
    if (meus.length === 0) { meusAnunciosEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>Você ainda não publicou nenhum anúncio.</p><p style="font-size:0.9rem;margin-top:6px;">Vá para a aba "Novo Anúncio" para começar!</p></div>`; return; }
    meusAnunciosEl.innerHTML = meus.map(p => {
        const fotoHtml = gerarImagemHtml(p);
        const statusLabel = getStatusLabel(p.status);
        const statusClass = getStatusClass(p.status);
        const condicaoLabel = getCondicaoLabel(p.condicao);
        const condicaoClass = getCondicaoClass(p.condicao);
        const catEmoji = categoriasMap[p.categoria]?.emoji || '📦';
        return `
            <div class="card" data-produto-id="${p.id}">
                ${fotoHtml}
                <span class="status-badge ${statusClass}">${statusLabel}</span>
                <span class="condition-badge ${condicaoClass}">${condicaoLabel}</span>
                <span class="category-tag">${catEmoji} ${escapeHtml(p.categoria || 'Outros')}</span>
                <div class="price">🪙 ${p.precoMoedas}</div>
                <h3>${escapeHtml(p.titulo)}</h3>
                <div class="location">📍 ${escapeHtml(p.local || 'Local não informado')}</div>
                <div class="desc">${escapeHtml(p.descricao.substring(0, 80))}${p.descricao.length > 80 ? '...' : ''}</div>
                <div class="actions">
                    <button class="btn-excluir" data-action="excluir" data-id="${p.id}">Excluir</button>
                    <button class="btn-chat" data-action="chat" data-id="${p.id}" data-dono="${p.dono}">Chat</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// ADMIN
// ============================================================
function renderAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) { const tabAdmin = document.getElementById('tab-admin'); if (tabAdmin) tabAdmin.style.display = 'none'; return; }
    const tabAdmin = document.getElementById('tab-admin');
    if (tabAdmin) tabAdmin.style.display = 'block';
    
    const usuarios = getData(DB_KEYS.usuarios);
    document.getElementById('adminTotalUsers').textContent = usuarios.length;
    document.getElementById('adminTotalProducts').textContent = allProducts.length;
    const totalCoins = usuarios.reduce((acc, u) => acc + (u.moedas || 0), 0);
    document.getElementById('adminTotalCoins').textContent = totalCoins;
    const fees = getData(DB_KEYS.adminFees);
    const totalFees = fees.reduce((acc, f) => acc + (f.valor || 0), 0);
    document.getElementById('adminTotalFees').textContent = totalFees;
    const trocas = getData(DB_KEYS.trocas);
    document.getElementById('adminTotalTrocas').textContent = trocas.length;

    const list = document.getElementById('adminProductList');
    if (list) {
        list.innerHTML = allProducts.map(p => `
            <tr>
                <td>${escapeHtml(p.titulo)}</td>
                <td>${escapeHtml(p.dono)}</td>
                <td>🪙 ${p.precoMoedas}</td>
                <td><span class="condition-badge ${getCondicaoClass(p.condicao)}">${getCondicaoLabel(p.condicao)}</span></td>
                <td><span class="status-badge ${getStatusClass(p.status)}">${getStatusLabel(p.status)}</span></td>
                <td><button class="btn-excluir" data-action="excluir" data-id="${p.id}" style="padding:4px 12px;font-size:0.75rem;">Excluir</button></td>
            </tr>
        `).join('');
    }
}

// ============================================================
// FUNÇÕES DE TROCA
// ============================================================
async function solicitarTroca(id) {
    if (!currentUser) { showToast('🔒 Faça login para solicitar troca.'); return; }
    const produto = allProducts.find(p => p.id === id);
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
    atualizarBadge();
    renderMinhasTrocas();
}

async function responderTroca(trocaId, resposta) {
    const trocas = getData(DB_KEYS.trocas);
    const trocaIndex = trocas.findIndex(t => t.id === trocaId);
    if (trocaIndex === -1) return;
    const troca = trocas[trocaIndex];

    if (resposta === 'aceitar') {
        trocas[trocaIndex].status = 'aceita';
        setData(DB_KEYS.trocas, trocas);
        
        const produtos = getData(DB_KEYS.produtos);
        const prodIndex = produtos.findIndex(p => p.id === troca.produtoId);
        if (prodIndex !== -1) {
            produtos[prodIndex].status = 'negociacao';
            setData(DB_KEYS.produtos, produtos);
            allProducts = produtos;
        }
        
        const notificacoes = getData(DB_KEYS.notificacoes);
        notificacoes.push({
            id: getNextId(DB_KEYS.notificacoes),
            para: troca.solicitante,
            de: currentUser.email,
            produtoId: troca.produtoId,
            produtoTitulo: troca.produtoTitulo,
            mensagem: `${currentUser.nome} aceitou sua troca por "${troca.produtoTitulo}"! Entre em contato pelo chat para combinar a entrega.`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'troca_aceita'
        });
        setData(DB_KEYS.notificacoes, notificacoes);
        showToast('✅ Troca aceita!');
    } else {
        trocas[trocaIndex].status = 'cancelada';
        setData(DB_KEYS.trocas, trocas);
        
        const notificacoes = getData(DB_KEYS.notificacoes);
        notificacoes.push({
            id: getNextId(DB_KEYS.notificacoes),
            para: troca.solicitante,
            de: currentUser.email,
            produtoId: troca.produtoId,
            produtoTitulo: troca.produtoTitulo,
            mensagem: `${currentUser.nome} recusou sua troca por "${troca.produtoTitulo}".`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'troca_recusada'
        });
        setData(DB_KEYS.notificacoes, notificacoes);
        showToast('❌ Troca recusada.');
    }
    
    renderMinhasTrocas();
    renderizarAnuncios();
    atualizarBadge();
}

async function marcarEntregue(trocaId) {
    const trocas = getData(DB_KEYS.trocas);
    const trocaIndex = trocas.findIndex(t => t.id === trocaId);
    if (trocaIndex === -1) return;
    const troca = trocas[trocaIndex];

    trocas[trocaIndex].status = 'entregue';
    trocas[trocaIndex].dataEntrega = new Date().toISOString();
    setData(DB_KEYS.trocas, trocas);

    const notificacoes = getData(DB_KEYS.notificacoes);
    notificacoes.push({
        id: getNextId(DB_KEYS.notificacoes),
        para: troca.solicitante,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `${currentUser.nome} marcou o produto como ENTREGUE. Confirme o recebimento para concluir a troca!`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'entrega_realizada'
    });
    setData(DB_KEYS.notificacoes, notificacoes);

    showToast('📦 Produto marcado como entregue!');
    renderMinhasTrocas();
    atualizarBadge();
}

async function marcarRecebido(trocaId) {
    const trocas = getData(DB_KEYS.trocas);
    const trocaIndex = trocas.findIndex(t => t.id === trocaId);
    if (trocaIndex === -1) return;
    const troca = trocas[trocaIndex];

    trocas[trocaIndex].status = 'concluida';
    trocas[trocaIndex].dataRecebimento = new Date().toISOString();
    setData(DB_KEYS.trocas, trocas);

    const produtos = getData(DB_KEYS.produtos);
    const prodIndex = produtos.findIndex(p => p.id === troca.produtoId);
    if (prodIndex !== -1) {
        const produto = produtos[prodIndex];
        const preco = produto.precoMoedas;
        const taxa = Math.floor(preco * 0.15);
        const valorFinal = preco - taxa;

        const usuarios = getData(DB_KEYS.usuarios);
        const compradorIndex = usuarios.findIndex(u => u.email === troca.solicitante);
        if (compradorIndex !== -1) {
            usuarios[compradorIndex].moedas = Math.max(0, usuarios[compradorIndex].moedas - preco);
        }
        const vendedorIndex = usuarios.findIndex(u => u.email === troca.dono);
        if (vendedorIndex !== -1) {
            usuarios[vendedorIndex].moedas += valorFinal;
            usuarios[vendedorIndex].totalGanho = (usuarios[vendedorIndex].totalGanho || 0) + valorFinal;
            usuarios[vendedorIndex].totalTaxas = (usuarios[vendedorIndex].totalTaxas || 0) + taxa;
        }
        setData(DB_KEYS.usuarios, usuarios);

        const fees = getData(DB_KEYS.adminFees);
        fees.push({ id: getNextId(DB_KEYS.adminFees), valor: taxa, data: new Date().toISOString() });
        setData(DB_KEYS.adminFees, fees);

        produtos[prodIndex].status = 'vendido';
        produtos[prodIndex].vendido = true;
        setData(DB_KEYS.produtos, produtos);
        allProducts = produtos;
    }

    const notificacoes = getData(DB_KEYS.notificacoes);
    notificacoes.push({
        id: getNextId(DB_KEYS.notificacoes),
        para: troca.dono,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `✅ ${currentUser.nome} confirmou o recebimento! A troca foi concluída com sucesso.`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'troca_concluida'
    });
    setData(DB_KEYS.notificacoes, notificacoes);

    showToast('✅ Troca concluída com sucesso!');
    renderMinhasTrocas();
    renderizarAnuncios();
    atualizarMoedas();
    atualizarBadge();
    
    abrirAvaliacaoModal(trocaId);
}

// ============================================================
// MINHAS TROCAS
// ============================================================
async function renderMinhasTrocas() {
    const minhasTrocasList = document.getElementById('minhasTrocasList');
    if (!minhasTrocasList) return;
    if (!currentUser) { minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Faça login para ver suas trocas.</p>'; return; }

    const trocas = getData(DB_KEYS.trocas).filter(t => t.solicitante === currentUser.email || t.dono === currentUser.email);
    if (trocas.length === 0) { minhasTrocasList.innerHTML = '<p style="color:#94a3b8;">Você ainda não tem trocas.</p>'; return; }

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
            <div class="troca-item" data-troca-id="${t.id}">
                <div class="troca-info">
                    <div class="produto-nome">📦 ${escapeHtml(t.produtoTitulo)}</div>
                    <div style="font-size:0.85rem;color:#64748b;">${isSolicitante ? 'Você quer' : 'Você recebeu'} de ${escapeHtml(outroUsuario)}</div>
                    <div style="font-size:0.85rem;color:#64748b;margin-top:4px;">💬 ${escapeHtml(t.mensagem)}</div>
                    ${t.localCombinado ? `<div style="font-size:0.85rem;color:#16a34a;margin-top:4px;">📍 Local combinado: ${escapeHtml(t.localCombinado)}</div>` : ''}
                    <span class="troca-status ${statusClass}">${statusLabel}</span>
                    ${t.dataEntrega ? `<div style="font-size:0.75rem;color:#94a3b8;">Entregue em: ${new Date(t.dataEntrega).toLocaleDateString('pt-BR')}</div>` : ''}
                    ${t.dataRecebimento ? `<div style="font-size:0.75rem;color:#94a3b8;">Recebido em: ${new Date(t.dataRecebimento).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
                <div class="troca-actions">
                    ${podeAceitar ? `<button class="btn-aceitar-troca" data-action="aceitar-troca" data-id="${t.id}">✅ Aceitar</button><button class="btn-recusar-troca" data-action="recusar-troca" data-id="${t.id}">❌ Recusar</button>` : ''}
                    ${podeEntregar ? `<button class="btn-entregar" data-action="marcar-entregue" data-id="${t.id}">📦 Marcar Entregue</button>` : ''}
                    ${podeReceber ? `<button class="btn-receber" data-action="marcar-recebido" data-id="${t.id}">✅ Confirmar Recebimento</button>` : ''}
                    ${podeAvaliar ? `<button class="btn-avaliar" data-action="avaliar" data-id="${t.id}">⭐ Avaliar</button>` : ''}
                    <button class="btn-chat" data-action="chat" data-id="${t.produtoId}" data-dono="${outroUsuario}">💬 Chat</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// AVALIAÇÕES (somente após troca concluída)
// ============================================================
function abrirAvaliacaoModal(trocaId) {
    avaliacaoParaTrocaId = trocaId;
    const modal = document.getElementById('avaliacaoModal');
    if (modal) modal.classList.add('active');
    document.getElementById('btnEnviarAvaliacao').onclick = () => enviarAvaliacao(trocaId);
}

function fecharAvaliacaoModal() {
    const modal = document.getElementById('avaliacaoModal');
    if (modal) modal.classList.remove('active');
    avaliacaoParaTrocaId = null;
}

async function enviarAvaliacao(trocaId) {
    const trocas = getData(DB_KEYS.trocas);
    const troca = trocas.find(t => t.id === trocaId);
    if (!troca) return;
    
    const notaProduto = parseInt(document.getElementById('notaProduto').value);
    const notaVendedor = parseInt(document.getElementById('notaVendedor').value);
    const comentario = document.getElementById('comentarioAvaliacao').value.trim();

    const avaliacoes = getData(DB_KEYS.avaliacoes);
    avaliacoes.push({
        id: getNextId(DB_KEYS.avaliacoes),
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        de: currentUser.email,
        para: troca.dono,
        notaProduto: notaProduto,
        notaVendedor: notaVendedor,
        comentario: comentario,
        data: new Date().toISOString()
    });
    setData(DB_KEYS.avaliacoes, avaliacoes);

    const trocaIndex = trocas.findIndex(t => t.id === trocaId);
    if (trocaIndex !== -1) {
        trocas[trocaIndex].avaliado = true;
        setData(DB_KEYS.trocas, trocas);
    }

    const notificacoes = getData(DB_KEYS.notificacoes);
    notificacoes.push({
        id: getNextId(DB_KEYS.notificacoes),
        para: troca.dono,
        de: currentUser.email,
        produtoId: troca.produtoId,
        produtoTitulo: troca.produtoTitulo,
        mensagem: `${currentUser.nome} avaliou a troca de "${troca.produtoTitulo}"! Produto: ${notaProduto}⭐ Vendedor: ${notaVendedor}⭐`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'avaliacao'
    });
    setData(DB_KEYS.notificacoes, notificacoes);

    fecharAvaliacaoModal();
    showToast('⭐ Avaliação enviada! Obrigado!');
    renderAvaliacoes();
    atualizarBadge();
}

async function renderAvaliacoes() {
    const avaliacoesList = document.getElementById('avaliacoesList');
    if (!avaliacoesList) return;
    const avaliacoes = getData(DB_KEYS.avaliacoes);
    if (avaliacoes.length === 0) { avaliacoesList.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;text-align:center;">Nenhuma avaliação ainda.</p>'; return; }
    avaliacoesList.innerHTML = avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data)).map(a => {
        const starsProduto = '⭐'.repeat(a.notaProduto) + '☆'.repeat(5 - a.notaProduto);
        const starsVendedor = '⭐'.repeat(a.notaVendedor) + '☆'.repeat(5 - a.notaVendedor);
        const data = new Date(a.data).toLocaleDateString('pt-BR');
        return `<div class="avaliacao-item"><div style="font-weight:600;">📦 ${escapeHtml(a.produtoTitulo)}</div><div style="font-size:0.85rem;color:#64748b;">${escapeHtml(a.de)} → ${escapeHtml(a.para)}</div><div class="stars">Produto: ${starsProduto}</div><div class="stars">Vendedor: ${starsVendedor}</div>${a.comentario ? `<div class="avaliacao-comentario">"${escapeHtml(a.comentario)}"</div>` : ''}<div class="avaliacao-data">${data}</div></div>`;
    }).join('');
}

// ============================================================
// EXCLUIR ANÚNCIO
// ============================================================
async function excluirAnuncio(id) {
    if (!currentUser) return;
    const produto = allProducts.find(p => p.id === id);
    if (!produto) return;
    if (produto.dono !== currentUser.email && !currentUser.isAdmin) { showToast('Você só pode excluir seus próprios anúncios.'); return; }
    if (!confirm(`Tem certeza que deseja excluir "${produto.titulo}"?`)) return;
    
    const produtos = getData(DB_KEYS.produtos).filter(p => p.id !== id);
    setData(DB_KEYS.produtos, produtos);
    allProducts = produtos;
    
    showToast('Anúncio removido.');
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
}

// ============================================================
// CHAT
// ============================================================
async function abrirChat(produtoId, outroUsuario) {
    if (!currentUser) { showToast('Faça login para usar o chat.'); return; }
    
    const chats = getData(DB_KEYS.chats);
    let chat = chats.find(c => c.produtoId === produtoId && ((c.usuario1 === currentUser.email && c.usuario2 === outroUsuario) || (c.usuario1 === outroUsuario && c.usuario2 === currentUser.email)));
    
    if (!chat) {
        const novoChat = {
            id: getNextId(DB_KEYS.chats),
            produtoId: produtoId,
            usuario1: currentUser.email,
            usuario2: outroUsuario,
            mensagens: [],
            data: new Date().toISOString(),
            localCombinado: null,
            localAceito: false
        };
        chats.push(novoChat);
        setData(DB_KEYS.chats, chats);
        abrirChatExistente(novoChat.id, produtoId);
    } else {
        abrirChatExistente(chat.id, produtoId);
    }
}

function abrirChatExistente(chatId, produtoId) {
    const modal = document.getElementById('chatModal');
    const messages = document.getElementById('chatMessages');
    const title = document.getElementById('chatTitle');
    if (!modal || !messages || !title) return;
    
    const chats = getData(DB_KEYS.chats);
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    const produto = allProducts.find(p => p.id === produtoId);
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

function fecharChat() { const modal = document.getElementById('chatModal'); if (modal) modal.classList.remove('active'); chatIdAtual = null; }

async function aceitarLocalCombinado(chatId) {
    try {
        const chats = getData(DB_KEYS.chats);
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            chats[chatIndex].localAceito = true;
            setData(DB_KEYS.chats, chats);
        }
        showToast('✅ Local aceito!');
        const chat = chats[chatIndex];
        abrirChatExistente(chatId, chat.produtoId);
        
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        const notificacoes = getData(DB_KEYS.notificacoes);
        notificacoes.push({
            id: getNextId(DB_KEYS.notificacoes),
            para: outro,
            de: currentUser.email,
            produtoId: chat.produtoId,
            produtoTitulo: 'Local aceito',
            mensagem: `${currentUser.nome} aceitou o local combinado: ${chat.localCombinado}`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'local_aceito'
        });
        setData(DB_KEYS.notificacoes, notificacoes);
        atualizarBadge();
    } catch (error) { console.error('Erro ao aceitar local:', error); showToast('❌ Erro ao aceitar local.'); }
}

async function combinarLocal() {
    const inputLocal = document.getElementById('chatLocalInput');
    if (!inputLocal || !chatIdAtual) return;
    const local = inputLocal.value.trim();
    if (!local) return;
    
    try {
        const chats = getData(DB_KEYS.chats);
        const chatIndex = chats.findIndex(c => c.id === chatIdAtual);
        if (chatIndex !== -1) {
            chats[chatIndex].localCombinado = local;
            chats[chatIndex].localAceito = false;
            
            const novaMsg = { id: Date.now(), de: currentUser.email, texto: `📍 Local combinado para entrega: ${local}`, data: new Date().toISOString() };
            chats[chatIndex].mensagens.push(novaMsg);
            setData(DB_KEYS.chats, chats);
        }
        
        const chat = chats[chatIndex];
        const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
        
        const notificacoes = getData(DB_KEYS.notificacoes);
        notificacoes.push({
            id: getNextId(DB_KEYS.notificacoes),
            para: outro,
            de: currentUser.email,
            produtoId: chat.produtoId,
            produtoTitulo: 'Local combinado',
            mensagem: `${currentUser.nome} sugeriu um local de entrega: ${local}`,
            data: new Date().toISOString(),
            lida: false,
            tipo: 'local_combinado'
        });
        setData(DB_KEYS.notificacoes, notificacoes);
        
        showToast('📍 Local sugerido!');
        inputLocal.value = '';
        abrirChatExistente(chatIdAtual, chat.produtoId);
        atualizarBadge();
    } catch (error) { console.error('Erro ao combinar local:', error); showToast('❌ Erro ao combinar local.'); }
}

async function enviarMensagem() {
    const input = document.getElementById('chatInput');
    if (!input || !chatIdAtual) return;
    const texto = input.value.trim();
    if (!texto) return;
    
    const chats = getData(DB_KEYS.chats);
    const chatIndex = chats.findIndex(c => c.id === chatIdAtual);
    if (chatIndex === -1) return;
    
    const novaMsg = { id: Date.now(), de: currentUser.email, texto: texto, data: new Date().toISOString() };
    chats[chatIndex].mensagens.push(novaMsg);
    setData(DB_KEYS.chats, chats);
    
    input.value = '';
    const chat = chats[chatIndex];
    const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
    
    const notificacoes = getData(DB_KEYS.notificacoes);
    notificacoes.push({
        id: getNextId(DB_KEYS.notificacoes),
        para: outro,
        de: currentUser.email,
        produtoId: chat.produtoId,
        produtoTitulo: 'Chat',
        mensagem: `Nova mensagem de ${currentUser.nome}: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
        data: new Date().toISOString(),
        lida: false,
        tipo: 'chat'
    });
    setData(DB_KEYS.notificacoes, notificacoes);
    
    atualizarBadge();
    abrirChatExistente(chatIdAtual, chat.produtoId);
}

// ============================================================
// RENDERIZAR CHATS
// ============================================================
async function renderChats() {
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    if (!currentUser) { container.innerHTML = `<div class="chat-list-empty"><span class="emoji">🔒</span><p>Faça login para ver suas conversas.</p></div>`; return; }
    
    try {
        const chats = getData(DB_KEYS.chats).filter(c => c.usuario1 === currentUser.email || c.usuario2 === currentUser.email);
        if (chats.length === 0) { container.innerHTML = `<div class="chat-list-empty"><span class="emoji">💬</span><p>Você ainda não tem conversas.</p></div>`; return; }
        
        chats.sort((a, b) => { const aLast = a.mensagens.length > 0 ? new Date(a.mensagens[a.mensagens.length - 1].data) : new Date(a.data); const bLast = b.mensagens.length > 0 ? new Date(b.mensagens[b.mensagens.length - 1].data) : new Date(b.data); return bLast - aLast; });
        
        let html = '';
        for (const chat of chats) {
            const outro = chat.usuario1 === currentUser.email ? chat.usuario2 : chat.usuario1;
            const ultimaMsg = chat.mensagens.length > 0 ? chat.mensagens[chat.mensagens.length - 1] : null;
            const dataMsg = ultimaMsg ? new Date(ultimaMsg.data) : new Date(chat.data);
            const dataFormatada = dataMsg.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const produto = allProducts.find(p => p.id === chat.produtoId);
            const nomeProduto = produto ? produto.titulo : 'Produto desconhecido';
            html += `<div class="chat-list-item" data-chat-id="${chat.id}" data-produto-id="${chat.produtoId}" data-outro="${outro}"><div class="chat-info"><div class="chat-with">👤 ${escapeHtml(outro)}</div><div class="chat-product">📦 ${escapeHtml(nomeProduto)}</div>${chat.localCombinado ? `<div class="chat-local-status">📍 ${escapeHtml(chat.localCombinado)} ${chat.localAceito ? '✅' : '⏳'}</div>` : ''}${ultimaMsg ? `<div class="chat-last-msg">${escapeHtml(ultimaMsg.texto)}</div>` : ''}</div><div class="chat-date">${dataFormatada}</div></div>`;
        }
        container.innerHTML = html;
    } catch (error) { console.error('Erro ao carregar chats:', error); container.innerHTML = `<div class="error-msg">❌ Erro ao carregar conversas.</div>`; }
}

// ============================================================
// NOTIFICAÇÕES
// ============================================================
function renderNotificacoes() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList || !currentUser) return;
    
    const notifs = getData(DB_KEYS.notificacoes).filter(n => n.para === currentUser.email);
    if (notifs.length === 0) { notificationsList.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;">📭 Nenhuma notificação</div>'; return; }
    
    notificationsList.innerHTML = notifs.sort((a, b) => new Date(b.data) - new Date(a.data)).map(n => {
        const data = new Date(n.data).toLocaleDateString('pt-BR');
        const hora = new Date(n.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        let botoes = '';
        if (n.tipo === 'solicitacao_troca' && !n.lida) botoes = `<button class="btn-aceitar" onclick="showTab('minhasTrocas')">Ver Trocas</button>`;
        if (n.tipo === 'troca_aceita' && !n.lida) botoes = `<button class="btn-chat-notif" onclick="showTab('minhasTrocas')">Ver Trocas</button>`;
        if (n.tipo === 'chat' && !n.lida) botoes = `<button class="btn-chat-notif" onclick="abrirChat(${n.produtoId}, '${n.de}')">Responder</button>`;
        if (n.tipo === 'avaliacao' && !n.lida) botoes = `<button class="btn-chat-notif" onclick="showTab('avaliacao')">Ver Avaliações</button>`;
        if (n.tipo === 'local_combinado' && !n.lida) botoes = `<button class="btn-chat-notif" onclick="showTab('chats')">Ver Chat</button>`;
        if (n.tipo === 'local_aceito' && !n.lida) botoes = `<button class="btn-chat-notif" onclick="showTab('chats')">Ver Chat</button>`;
        return `<div class="notification-item" style="${n.lida ? 'opacity:0.6;' : ''}"><div class="notif-text"><strong>${escapeHtml(n.de)}</strong><br />${escapeHtml(n.mensagem).replace(/\n/g, '<br>')}</div><div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px;"><span class="notif-date">${data} ${hora}</span>${botoes}</div></div>`;
    }).join('');
}

function toggleNotifications() {
    if (!currentUser) { showToast('Faça login para ver notificações.'); return; }
    const notificationsPanel = document.getElementById('notificationsPanel');
    if (!notificationsPanel) return;
    notificationsPanel.classList.toggle('active');
    if (notificationsPanel.classList.contains('active')) { renderNotificacoes(); const notifs = getData(DB_KEYS.notificacoes).map(n => n.para === currentUser.email ? {...n, lida: true} : n); setData(DB_KEYS.notificacoes, notifs); atualizarBadge(); }
}

// ============================================================
// PUBLICAR ANÚNCIO
// ============================================================
function publicarAnuncio() {
    if (!currentUser) { showToast('Você precisa estar logado para publicar.'); return; }
    
    const tituloProduto = document.getElementById('tituloProduto');
    const descricaoProduto = document.getElementById('descricaoProduto');
    const categoriaProduto = document.getElementById('categoriaProduto');
    const localProduto = document.getElementById('localProduto');
    const trocaDesejada = document.getElementById('trocaDesejada');
    const precoMoedas = document.getElementById('precoMoedas');
    const condicaoProduto = document.getElementById('condicaoProduto');
    const statusProduto = document.getElementById('statusProduto');
    const tipoTrocaProduto = document.getElementById('tipoTrocaProduto');
    
    const titulo = tituloProduto?.value?.trim() || '';
    const descricao = descricaoProduto?.value?.trim() || '';
    const categoria = categoriaProduto?.value || '';
    const local = localProduto?.value?.trim() || '';
    const troca = trocaDesejada?.value?.trim() || '';
    const preco = parseInt(precoMoedas?.value || '0');
    const condicao = condicaoProduto?.value || 'usado';
    const status = statusProduto?.value || 'disponivel';
    const tipoTroca = tipoTrocaProduto?.value || 'produto';

    if (!titulo || !descricao || !local) { showToast('Preencha título, descrição e local.'); return; }
    if (!preco || preco < 1) { showToast('Defina um valor em moedas válido (mínimo 1).'); return; }

    const novosProdutos = getData(DB_KEYS.produtos);
    novosProdutos.push({
        id: getNextId(DB_KEYS.produtos),
        titulo, descricao, categoria, local,
        trocaDesejada: troca,
        fotos: [],
        dono: currentUser.email,
        status: status,
        condicao: condicao,
        precoMoedas: preco,
        tipoTroca: tipoTroca,
        data: new Date().toISOString(),
        vendido: false,
        lat: userLat,
        lng: userLng
    });
    setData(DB_KEYS.produtos, novosProdutos);
    allProducts = novosProdutos;
    
    showToast('✅ Anúncio publicado!');
    tituloProduto.value = '';
    descricaoProduto.value = '';
    localProduto.value = `${currentUser.cidade}/${currentUser.estado}`;
    trocaDesejada.value = '';
    precoMoedas.value = '';
    
    renderizarAnuncios();
    renderMeusAnuncios();
    renderAdminPanel();
}

// ============================================================
// NAVEGAÇÃO COM ABAS
// ============================================================
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn-header').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('.tab-btn-header').forEach(btn => { if (btn.dataset.tab === tabName) btn.classList.add('active'); });
    if (tabName === 'meusAnuncios') renderMeusAnuncios();
    if (tabName === 'admin') renderAdminPanel();
    if (tabName === 'minhasTrocas') renderMinhasTrocas();
    if (tabName === 'avaliacao') renderAvaliacoes();
    if (tabName === 'chats') renderChats();
    if (tabName === 'indicacao') atualizarIndicacao();
}

// ============================================================
// CONTROLE DO MODAL DE LOGIN
// ============================================================
function abrirAuthModal(tipo) {
    const authModal = document.getElementById('authModal');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    if (!authModal) return;
    authModal.classList.remove('hidden');
    authModal.classList.add('active');
    if (tipo === 'login') { loginBox.classList.remove('hidden'); registerBox.classList.add('hidden'); }
    else if (tipo === 'register') { loginBox.classList.add('hidden'); registerBox.classList.remove('hidden'); }
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
}

function fecharAuthModal() {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    authModal.classList.remove('active');
    authModal.classList.add('hidden');
}

function showLoginBox() {
    document.getElementById('loginBox').classList.remove('hidden');
    document.getElementById('registerBox').classList.add('hidden');
    document.getElementById('loginError').classList.remove('show');
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
            case 'trocar': await solicitarTroca(id); break;
            case 'excluir': await excluirAnuncio(id); break;
            case 'chat': const dono = btn.dataset.dono; await abrirChat(id, dono); break;
            case 'aceitar-troca': await responderTroca(id, 'aceitar'); break;
            case 'recusar-troca': await responderTroca(id, 'recusar'); break;
            case 'marcar-entregue': await marcarEntregue(id); break;
            case 'marcar-recebido': await marcarRecebido(id); break;
            case 'avaliar': abrirAvaliacaoModal(id); break;
        }
    });
    
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.card');
        if (card && !e.target.closest('button')) {
            const produtoId = card.dataset.produtoId;
            if (produtoId) window.location.href = `produto.html?id=${produtoId}`;
        }
    });
    
    document.addEventListener('click', function(e) {
        const chatItem = e.target.closest('.chat-list-item');
        if (chatItem && !e.target.closest('button')) {
            const produtoId = chatItem.dataset.produtoId;
            const outro = chatItem.dataset.outro;
            if (produtoId && outro) abrirChat(parseInt(produtoId), outro);
        }
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) btnLogin.addEventListener('click', () => loginUser(document.getElementById('loginEmail').value.trim(), document.getElementById('loginSenha').value));
    document.getElementById('loginEmail')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    document.getElementById('loginSenha')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnLogin?.click(); });
    const btnRegister = document.getElementById('btnRegister');
    if (btnRegister) btnRegister.addEventListener('click', registerUser);
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    const btnPublicar = document.getElementById('btnPublicar');
    if (btnPublicar) btnPublicar.addEventListener('click', publicarAnuncio);
    const btnNotifications = document.getElementById('btnNotifications');
    if (btnNotifications) btnNotifications.addEventListener('click', toggleNotifications);
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) btnSearch.addEventListener('click', renderizarAnuncios);
    document.getElementById('searchText')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    const btnLocalizar = document.getElementById('btnLocalizar');
    if (btnLocalizar) btnLocalizar.addEventListener('click', obterLocalizacao);
    const searchRaio = document.getElementById('searchRaio');
    if (searchRaio) searchRaio.addEventListener('change', renderizarAnuncios);
    const searchEstadoEl = document.getElementById('searchEstado');
    if (searchEstadoEl) searchEstadoEl.addEventListener('change', renderizarAnuncios);
    document.getElementById('searchCidade')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') renderizarAnuncios(); });
    const btnUsarCodigo = document.getElementById('btnUsarCodigo');
    if (btnUsarCodigo) {
        btnUsarCodigo.addEventListener('click', async () => {
            if (!currentUser) { showToast('Faça login para usar um código.'); return; }
            const inputUsarCodigo = document.getElementById('inputUsarCodigo');
            const codigo = inputUsarCodigo.value.trim().toUpperCase();
            if (!codigo) { showToast('Digite um código.'); return; }
            if (codigo === currentUser.codigoIndicacao) { showToast('❌ Você não pode usar seu próprio código.'); return; }
            const usuarios = getData(DB_KEYS.usuarios);
            const indicador = usuarios.find(u => u.codigoIndicacao === codigo);
            if (!indicador) { showToast('❌ Código inválido.'); return; }
            if (currentUser.indicadoPor) { showToast('❌ Você já usou um código de indicação.'); return; }
            const indicacoes = getData(DB_KEYS.indicacoes);
            const usado = indicacoes.find(i => i.usadoPor === currentUser.email);
            if (usado) { showToast('❌ Você já usou um código de indicação.'); return; }
            
            currentUser.indicadoPor = indicador.email;
            currentUser.moedas += 20;
            indicador.moedas += 20;
            
            const userIndex = usuarios.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) { usuarios[userIndex] = currentUser; }
            const indIndex = usuarios.findIndex(u => u.id === indicador.id);
            if (indIndex !== -1) { usuarios[indIndex] = indicador; }
            setData(DB_KEYS.usuarios, usuarios);
            
            indicacoes.push({ id: getNextId(DB_KEYS.indicacoes), codigo: codigo, criadoPor: indicador.email, usadoPor: currentUser.email, bonusRecebido: 20, dataUso: new Date().toISOString() });
            setData(DB_KEYS.indicacoes, indicacoes);
            
            showToast(`🎉 Código válido! Você e ${indicador.nome} ganharam 20 moedas!`);
            atualizarMoedas();
            atualizarIndicacao();
            inputUsarCodigo.value = '';
        });
    }
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) fecharAuthModal(); });
    const avaliacaoModal = document.getElementById('avaliacaoModal');
    if (avaliacaoModal) avaliacaoModal.addEventListener('click', (e) => { if (e.target === avaliacaoModal) fecharAvaliacaoModal(); });
    const btnEnviarAvaliacao = document.getElementById('btnEnviarAvaliacao');
    if (btnEnviarAvaliacao) btnEnviarAvaliacao.addEventListener('click', () => { if (avaliacaoParaTrocaId) enviarAvaliacao(avaliacaoParaTrocaId); });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
    // Liga os botões e listeners PRIMEIRO, antes de qualquer renderização.
    // Assim, mesmo que uma renderização falhe, os botões continuam funcionando.
    setupEventDelegation();
    setupEventListeners();

    popularBanco();
    try { carregarLocalizacaoSalva(); } catch (e) { console.error('Erro em carregarLocalizacaoSalva:', e); }
    try { carregarProdutos(); } catch (e) { console.error('Erro em carregarProdutos:', e); }
    try { renderCategories(); } catch (e) { console.error('Erro em renderCategories:', e); }
    try { renderizarAnuncios(); } catch (e) { console.error('Erro em renderizarAnuncios:', e); }
    try { initGoogleMaps(); } catch (e) { console.error('Erro em initGoogleMaps:', e); }
    
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const usuarios = getData(DB_KEYS.usuarios);
            const user = usuarios.find(u => u.email === data.email);
            if (user) { currentUser = user; atualizarHeader(); renderMeusAnuncios(); renderAdminPanel(); renderMinhasTrocas(); renderAvaliacoes(); atualizarBadge(); renderChats(); atualizarIndicacao(); }
        } catch (e) { console.error('Erro ao restaurar sessão:', e); }
    }
    
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
        const map = { 'anuncios': 'anuncios', 'meusAnuncios': 'meusAnuncios', 'novoAnuncio': 'novoAnuncio', 'minhasTrocas': 'minhasTrocas', 'avaliacao': 'avaliacao', 'chats': 'chats', 'indicacao': 'indicacao', 'admin': 'admin' };
        const target = map[tabParam.toLowerCase()];
        if (target) showTab(target);
    }
    console.log('✅ Inicialização concluída.');
}

// Expõe funções globais
window.showTab = showTab;
window.abrirAuthModal = abrirAuthModal;
window.fecharAuthModal = fecharAuthModal;
window.copiarCodigo = copiarCodigo;
window.fecharChat = fecharChat;
window.aceitarLocalCombinado = aceitarLocalCombinado;
window.combinarLocal = combinarLocal;
window.enviarMensagem = enviarMensagem;
window.fecharAvaliacaoModal = fecharAvaliacaoModal;
window.abrirAvaliacaoModal = abrirAvaliacaoModal;
window.fecharMapa = fecharMapa;

init();