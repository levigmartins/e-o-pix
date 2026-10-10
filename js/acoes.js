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