/**
 * Alterna a seleção de um participante.
 * Chamado ao clicar em um botão de participante.
 */
function toggleParticipante(botao) {
    botao.classList.toggle('selecionado');
    // Atualiza o resumo da divisão
    const grupoId = window.location.hash.split('/')[1];
    atualizarDivisao(grupoId);
}

/**
 * Marca ou desmarca todos os participantes de uma vez.
 * Se todos estiverem marcados, desmarca todos. Caso contrário, marca todos.
 */
function toggleTodosParticipantes(grupoId) {
    const botoes = document.querySelectorAll('.btn-participante');
    const todosSelecionados = Array.from(botoes).every(b => b.classList.contains('selecionado'));

    botoes.forEach(b => {
        if (todosSelecionados) {
            b.classList.remove('selecionado');
        } else {
            b.classList.add('selecionado');
        }
    });

    atualizarDivisao(grupoId);
}

/**
 * Atualiza o texto do resumo da divisão em tempo real.
 * Calcula: valor total / número de participantes selecionados.
 */
function atualizarDivisao(grupoId) {
    const inputValor = document.getElementById('valor');
    const participantesSelecionados = document.querySelectorAll('.btn-participante.selecionado');
    const textoDivisao = document.getElementById('texto-divisao');
    const valorPorPessoa = document.getElementById('valor-por-pessoa');

    if (!inputValor || !textoDivisao || !valorPorPessoa) return;

    const valor = parseFloat(inputValor.value) || 0;
    const qtd = participantesSelecionados.length;

    const formatar = (v) => new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(v);

    if (qtd === 0) {
        textoDivisao.textContent = `${formatar(valor)} dividido entre 0 pessoas`;
        valorPorPessoa.textContent = `R$ 0,00 cada`;
        valorPorPessoa.style.color = '#D32F2F';
    } else {
        const porPessoa = valor / qtd;
        textoDivisao.textContent = `${formatar(valor)} dividido entre ${qtd} ${qtd === 1 ? 'pessoa' : 'pessoas'}`;
        valorPorPessoa.textContent = `${formatar(porPessoa)} cada`;
        valorPorPessoa.style.color = 'var(--cor-primaria)';
    }
}

/**
 * Salva a despesa (simulado).
 * Na F2 vai enviar para o backend.
 */
function salvarDespesa(event, grupoId) {
    event.preventDefault();

    // Coleta os dados do formulário
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const data = document.getElementById('data').value;
    const categoria = document.getElementById('categoria').value;
    const pagadorId = document.getElementById('pagador').value;
    
    const participantesSelecionados = Array.from(
        document.querySelectorAll('.btn-participante.selecionado')
    ).map(b => b.getAttribute('data-membro-id'));

    // valida
    if (participantesSelecionados.length === 0) {
        alert('Selecione pelo menos um participante.');
        return;
    }

    if (!valor || valor <= 0) {
        alert('Informe um valor válido.');
        return;
    }

    // Busca o grupo e os nomes
    const grupo = appState.grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const pagador = grupo.membros.find(m => m.id === pagadorId);
    const nomesParticipantes = participantesSelecionados.map(id => {
        const m = grupo.membros.find(mem => mem.id === id);
        return m && m.id === appState.usuarioLogado.id ? 'Você' : (m ? m.nome : '');
    });

    // Cria o objeto da despesa
    const novaDespesa = {
        id: 'd' + Date.now(),
        data: formatarData(data),
        categoria: categoria,
        descricao: descricao,
        valorTotal: valor,
        pagoPor: pagador && pagador.id === appState.usuarioLogado.id ? 'Você' : (pagador ? pagador.nome : ''),
        participantes: nomesParticipantes,
        naoEnvolvido: !nomesParticipantes.includes('Você')
    };

    // Adiciona ao estado
    if (!appState.despesas[grupoId]) {
        appState.despesas[grupoId] = [];
    }
    appState.despesas[grupoId].unshift(novaDespesa); // Adiciona no início

    // Redireciona de volta para o grupo
    window.location.hash = `#grupo/${grupoId}`;
}

/**
 * Formata data de YYYY-MM-DD para DD MM
 */
function formatarData(dataISO) {
    if (!dataISO) return '';
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
                   'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia} ${meses[parseInt(mes) - 1]}`;
}

function marcarComoPago(grupoId, transferenciaId) {
    const fechamento = appState.fechamentos[grupoId];
    if (!fechamento) return;

    const transferencia = fechamento.transferencias.find(t => t.id === transferenciaId);
    if (!transferencia) return;

    // Atualiza o status
    transferencia.status = 'pago';
    
    // Data de hoje
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    transferencia.dataPagamento = `${dia}/${mes}`;

    renderizarApp();
}

function desfazerPagamento(grupoId, transferenciaId) {
    const fechamento = appState.fechamentos[grupoId];
    if (!fechamento) return;

    const transferencia = fechamento.transferencias.find(t => t.id === transferenciaId);
    if (!transferencia) return;

    transferencia.status = 'pendente';
    delete transferencia.dataPagamento;

    renderizarApp();
}

function copiarChavePix(chave, botao) {
    // Tenta usar a API moderna de clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(chave).then(() => {
            exibirFeedbackCopiar(botao);
        }).catch(() => {
            // Fallback para navegadores mais antigos
            copiarChaveFallback(chave, botao);
        });
    } else {
        copiarChaveFallback(chave, botao);
    }
}

function copiarChaveFallback(chave, botao) {
    const textarea = document.createElement('textarea');
    textarea.value = chave;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        exibirFeedbackCopiar(botao);
    } catch (e) {
        alert('Não foi possível copiar. Chave: ' + chave);
    }
    document.body.removeChild(textarea);
}

function exibirFeedbackCopiar(botao) {
    const textoOriginal = botao.textContent;
    botao.textContent = '✓ Copiado!';
    botao.style.background = '#E0F2F1';
    botao.style.color = 'var(--cor-primaria)';
    botao.style.borderColor = 'var(--cor-primaria)';

    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.style.background = '';
        botao.style.color = '';
        botao.style.borderColor = '';
    }, 2000);
}

function criarGrupo(event) {
    event.preventDefault();

    const inputNome = document.getElementById('nome-novo-grupo');
    const inputDescricao = document.getElementById('descricao-novo-grupo');
    if (!inputNome) return;

    const nome = inputNome.value.trim();
    const descricao = inputDescricao ? inputDescricao.value.trim() : '';

    if (!nome) {
        alert('Informe o nome do grupo.');
        return;
    }

    const palavras = nome.split(/\s+/).filter(Boolean);
    const iniciais = palavras.length === 1 
        ? palavras[0].substring(0, 2).toUpperCase() 
        : (palavras[0][0] + palavras[1][0]).toUpperCase();

    const paletas = [
        { fundo: '#FFF3E0', texto: '#E65100' },
        { fundo: '#E3F2FD', texto: '#1565C0' },
        { fundo: '#F3E5F5', texto: '#6A1B9A' },
        { fundo: '#E8F5E9', texto: '#2E7D32' },
        { fundo: '#FCE4EC', texto: '#C2185B' }
    ];
    const paleta = paletas[appState.grupos.length % paletas.length];

    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigoConvite = '';
    for (let i = 0; i < 6; i++) {
        codigoConvite += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    const novoId = 'g' + Date.now();
    const novoGrupo = {
        id: novoId,
        nome: nome,
        descricao: descricao,
        codigoConvite: codigoConvite,
        iniciais: iniciais,
        corFundo: paleta.fundo,
        corTexto: paleta.texto,
        membros: [
            {
                id: appState.usuarioLogado.id,
                nome: appState.usuarioLogado.nome,
                iniciais: appState.usuarioLogado.iniciais,
                corFundo: '#E0F2F1',
                corTexto: '#0B6E61'
            }
        ],
        saldoUsuario: 0.00
    };

    appState.grupos.unshift(novoGrupo);
    appState.despesas[novoId] = [];

    window.location.hash = `#grupo/${novoId}`;
}

function entrarComCodigo(event) {
    event.preventDefault();

    const inputCodigo = document.getElementById('codigo-convite-input');
    const containerFeedback = document.getElementById('feedback-entrar-codigo');
    if (!inputCodigo) return;

    const codigo = inputCodigo.value.trim().toUpperCase();

    function exibirFeedback(mensagem, sucesso) {
        if (!containerFeedback) {
            alert(mensagem);
            return;
        }
        containerFeedback.style.display = 'block';
        containerFeedback.style.background = sucesso ? '#E0F2F1' : '#FFEBEE';
        containerFeedback.style.color = sucesso ? '#0B6E61' : '#C62828';
        containerFeedback.style.border = `1px solid ${sucesso ? '#B2DFDB' : '#FFCDD2'}`;
        containerFeedback.textContent = mensagem;
    }

    if (!codigo || codigo.length < 4) {
        exibirFeedback('Código inválido. Digite ao menos 4 caracteres.', false);
        return;
    }

    let grupo = appState.grupos.find(g => (g.codigoConvite || '').toUpperCase() === codigo);

    if (grupo) {
        const usuarioJaNoGrupo = grupo.membros.some(m => m.id === appState.usuarioLogado.id);
        if (!usuarioJaNoGrupo) {
            grupo.membros.push({
                id: appState.usuarioLogado.id,
                nome: appState.usuarioLogado.nome,
                iniciais: appState.usuarioLogado.iniciais,
                corFundo: '#E0F2F1',
                corTexto: '#0B6E61'
            });
        }
        exibirFeedback(`✓ Você entrou no grupo "${grupo.nome}". Redirecionando...`, true);
        setTimeout(() => {
            window.location.hash = `#grupo/${grupo.id}`;
        }, 800);
        return;
    }

    const novoId = 'g' + Date.now();
    const novoGrupo = {
        id: novoId,
        nome: `Grupo (${codigo})`,
        descricao: 'Grupo adicionado por código de convite',
        codigoConvite: codigo,
        iniciais: codigo.substring(0, 2),
        corFundo: '#E8F5E9',
        corTexto: '#2E7D32',
        membros: [
            { id: 'u99', nome: 'Organizador', iniciais: 'OG', corFundo: '#FFF3E0', corTexto: '#E65100' },
            {
                id: appState.usuarioLogado.id,
                nome: appState.usuarioLogado.nome,
                iniciais: appState.usuarioLogado.iniciais,
                corFundo: '#E0F2F1',
                corTexto: '#0B6E61'
            }
        ],
        saldoUsuario: 0.00
    };

    appState.grupos.unshift(novoGrupo);
    appState.despesas[novoId] = [];

    exibirFeedback(`✓ Você entrou no grupo "${novoGrupo.nome}". Redirecionando...`, true);
    setTimeout(() => {
        window.location.hash = `#grupo/${novoId}`;
    }, 800);
}