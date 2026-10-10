// Tabela de Rotas,mapeia o padrão do hash para as funções de renderização
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
        acoesHeader: (params) => `
            <button class="btn-outline">Convidar</button>
            <button class="btn-primary" onclick="window.location.hash='#grupo/${params.id}/nova-despesa'">
                + Adicionar despesa
            </button>
        `
    },
    '#grupo/:id/nova-despesa': {
        titulo: 'Nova despesa',
        breadcrumb: (params) => {
            const grupo = appState.grupos.find(g => g.id === params.id);
            return `<a href="#grupos">Meus grupos</a> / 
                    <a href="#grupo/${params.id}">${grupo ? grupo.nome : 'Grupo'}</a> / 
                    Nova despesa`;
        },
        renderView: (params) => renderViewNovaDespesa(params.id),
        renderRightSidebar: (params) => renderRightSidebarNovaDespesa(params.id),
        acoesHeader: () => ``
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


// Resolve a rota atual a partir do hash da URL
function resolverRota() {
    let hash = window.location.hash || '#grupos';

    // rota exata
    if (rotas[hash]) {
        return { rota: rotas[hash], params: {} };
    }

    // rota com 1 parametro
    const partes = hash.split('/').filter(p => p !== '');
    if (partes.length === 2) {
        const rotaBase = partes[0] + '/:id';
        if (rotas[rotaBase]) {
            return { rota: rotas[rotaBase], params: { id: partes[1] } };
        }
    }

    // rota com subrecurso
    if (partes.length === 3) {
        const rotaBase = partes[0] + '/:id/' + partes[2];
        if (rotas[rotaBase]) {
            return { rota: rotas[rotaBase], params: { id: partes[1] } };
        }
    }

    // Fallback
    return { rota: rotas['#grupos'], params: {} };
}

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
        if (hashAtual.startsWith(`#${rotaItem}`)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const inputData = document.getElementById('data');
    if (inputData && !inputData.value) {
        const hoje = new Date().toISOString().split('T')[0];
        inputData.value = hoje;
    }

    // atualiza a divisao inicial se estiver na tela de nova despesa
    if (window.location.hash.includes('nova-despesa')) {
        const grupoId = params.id;
        setTimeout(() => atualizarDivisao(grupoId), 0);
    }

    elContent.scrollTop = 0;
}

// Event listeners
window.addEventListener('hashchange', renderizarApp);

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) {
        window.location.hash = '#grupos';
    } else {
        renderizarApp();
    }

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
});