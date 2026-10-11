/**
 * Tabela de Rotas,mapeia o padrão do hash para as funções de renderização.
 */
const rotas = {
    '#grupos': {
        titulo: 'Meus grupos',
        breadcrumb: '<a href="#grupos">Meus grupos</a>',
        renderView: renderViewGrupos,
        renderRightSidebar: renderRightSidebarGrupos,
        acoesHeader: () => `<button class="btn-primary">+ Novo grupo</button>`
    },
    '#grupo/:id': {
        titulo: (params) => {
            const grupo = appState.grupos.find(g => g.id === params.id);
            return grupo ? grupo.nome : 'Grupo';
        },
        breadcrumb: (params) => {
            const grupo = appState.grupos.find(g => g.id === params.id);
            return `<a href="#grupos">Meus grupos</a> / ${grupo ? grupo.nome : 'Grupo'}`;
        },
        renderView: (params) => renderViewGrupoAtivo(params.id),
        renderRightSidebar: (params) => renderRightSidebarGrupoAtivo(params.id),
        acoesHeader: () => `
            <button class="btn-outline">Convidar</button>
            <button class="btn-primary">+ Adicionar despesa</button>
        `
    },
    '#fechamento': {
        titulo: 'Fechamento de conta',
        breadcrumb: '<a href="#grupos">Meus grupos</a> / Viagem Ouro Preto / Fechamento',
        renderView: renderViewFechamento,
        renderRightSidebar: renderRightSidebarFechamento,
        acoesHeader: () => ``
    },
    '#perfil': {
        titulo: 'Perfil',
        breadcrumb: '<a href="#perfil">Perfil</a>',
        renderView: renderViewPerfil,
        renderRightSidebar: renderRightSidebarPerfil,
        acoesHeader: () => ``
    }
};

/**
 * Resolve a rota atual a partir do hash da URL.
 * Suporta parâmetros dinâmicos como #grupo/g1.
 */
function resolverRota() {
    let hash = window.location.hash || '#grupos'; // Rota padrão

    if (rotas[hash]) {
        return { rota: rotas[hash], params: {} };
    }

    // Tenta encontrar rotas com parâmetros
    const partes = hash.split('/');
    if (partes.length === 2) {
        const rotaBase = partes[0] + '/:id';
        if (rotas[rotaBase]) {
            return { rota: rotas[rotaBase], params: { id: partes[1] } };
        }
    }

    // Vai para rota padrão se não encontrar
    return { rota: rotas['#grupos'], params: {} };
}

/**
 * Chamada sempre que o hash muda.
 */
function renderizarApp() {
    const { rota, params } = resolverRota();
    
    const elBreadcrumb = document.getElementById('breadcrumb');
    const elPageTitle = document.getElementById('page-title');
    const elHeaderActions = document.getElementById('header-actions');
    const elContent = document.getElementById('content-container');
    const elRightSidebar = document.getElementById('right-sidebar');
    const navItems = document.querySelectorAll('.nav-item');

    
    
    elPageTitle.textContent = typeof rota.titulo === 'function' ? rota.titulo(params) : rota.titulo;
    elBreadcrumb.innerHTML = typeof rota.breadcrumb === 'function' ? rota.breadcrumb(params) : rota.breadcrumb;
    elHeaderActions.innerHTML = typeof rota.acoesHeader === 'function' ? rota.acoesHeader(params) : '';

  
    elContent.innerHTML = rota.renderView(params);

    elRightSidebar.innerHTML = rota.renderRightSidebar(params);

    const hashAtual = window.location.hash || '#grupos';
    navItems.forEach(item => {
        const rotaItem = item.getAttribute('data-rota');
        // Verifica se a rota atual começa com a rota do item
        if (hashAtual.startsWith(`#${rotaItem}`)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    document.querySelectorAll('.view-section').forEach(sec => {
        sec.setAttribute('aria-hidden', 'false');
    });

    elContent.scrollTop = 0;
}


// Escuta mudanças no hash da URL
window.addEventListener('hashchange', renderizarApp);

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) {
        window.location.hash = '#grupos';
    } else {
        renderizarApp();
    }
});