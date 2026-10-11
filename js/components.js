function renderViewGrupos() {
    const grupos = appState.grupos;
    
    const cardsHTML = grupos.map(g => {
        const classeSaldo = g.saldoUsuario >= 0 ? 'positivo' : 'negativo';
        const textoSaldo = g.saldoUsuario >= 0 
            ? `Você recebe<br><strong class="${classeSaldo}">${formatarMoeda(g.saldoUsuario)}</strong>`
            : `Você deve<br><strong class="${classeSaldo}">${formatarMoeda(Math.abs(g.saldoUsuario))}</strong>`;

        return `
            <div class="card-grupo" onclick="window.location.hash = '#grupo/${g.id}'">
                <div class="card-grupo-header">
                    <div class="avatar-grupo" style="background:${g.corFundo}; color:${g.corTexto};">${g.iniciais}</div>
                    <div class="card-grupo-info">
                        <h4>${g.nome}</h4>
                        <span>${g.membros.length} participantes</span>
                    </div>
                </div>
                <div class="card-grupo-saldo">
                    ${textoSaldo}
                </div>
            </div>
        `;
    }).join('');

    return `
        <section id="view-grupos" class="view-section">
            <h3>Grupos ativos (${grupos.length})</h3>
            <div class="grid-cards">
                ${cardsHTML}
            </div>

            <h3 style="margin-top: 32px;">Novo grupo</h3>
            <div class="grid-forms">
                <div class="card-form">
                    <h4>Criar um grupo</h4>
                    <label>Nome do grupo</label>
                    <input type="text" placeholder="Ex.: Viagem de fim de ano">
                    <label>Descrição (opcional)</label>
                    <textarea placeholder="Para que é esse grupo?"></textarea>
                    <button class="btn-primary" style="margin-top:16px; width: fit-content;">Criar grupo</button>
                </div>
                <div class="card-form">
                    <h4>Entrar com código</h4>
                    <p class="texto-suave">Peça o código de convite para quem criou o grupo.</p>
                    <label>Código de convite</label>
                    <input type="text" placeholder="EX.: K7P2QX">
                    <button class="btn-outline" style="margin-top:16px; width: fit-content;">Entrar no grupo</button>
                </div>
            </div>
        </section>
    `;
}

/**
 * Gera o HTML da visão "Detalhes do Grupo" (#grupo/:id)
 */
function renderViewGrupoAtivo(grupoId) {
    const grupo = appState.grupos.find(g => g.id === grupoId);
    if (!grupo) return '<p>Grupo não encontrado.</p>';

    const despesas = appState.despesas[grupoId] || [];
    
    const listaDespesasHTML = despesas.map(d => {
        const tagsParticipantes = d.participantes.map(p => 
            `<span class="tag-participante ${p === 'Você' ? 'ativo' : ''}">${p}</span>`
        ).join('');

        const badgeNaoEnvolvido = d.naoEnvolvido 
            ? `<span class="badge-nao-envolvido">não envolvido</span>` 
            : '';

        return `
            <div class="card-despesa ${d.naoEnvolvido ? 'despesa-nao-envolvido' : ''}">
                <div class="despesa-data">
                    <strong>${d.data.split(' ')[0]}</strong>
                    <span>${d.data.split(' ')[1]}</span>
                </div>
                <div class="despesa-info">
                    <h4>${d.descricao}</h4>
                    <span class="despesa-meta">${d.categoria} · pago por <strong>${d.pagoPor}</strong></span>
                    <div class="despesa-participantes">${tagsParticipantes}</div>
                </div>
                <div class="despesa-valor">
                    <strong>${formatarMoeda(d.valorTotal)}</strong>
                    ${badgeNaoEnvolvido}
                </div>
            </div>
        `;
    }).join('');

    return `
        <section id="view-grupo" class="view-section">
            <div class="grupo-header">
                <div class="avatar-grupo" style="background:${grupo.corFundo}; color:${grupo.corTexto}; width:48px; height:48px; font-size:1.2rem;">${grupo.iniciais}</div>
                <div>
                    <h2>${grupo.nome}</h2>
                    <span class="texto-suave">${grupo.membros.length} membros · código de convite K7P2QX</span>
                </div>
            </div>

            <div class="despesas-header">
                <h3>Despesas</h3>
                <span class="texto-suave">${despesas.length} despesas · total ${formatarMoeda(despesas.reduce((acc, d) => acc + d.valorTotal, 0))}</span>
            </div>

            <div class="lista-despesas">
                ${listaDespesasHTML}
            </div>
        </section>
    `;
}
// components.js — Substituir a função renderViewFechamento

/**
 * Gera o HTML da visão "Fechamento" completa.
 * Inclui demonstrativo, tabela de saldos, transferências e módulo Pix.
 */
function renderViewFechamento(grupoId = 'g1') {
    const grupo = appState.grupos.find(g => g.id === grupoId);
    const fechamento = appState.fechamentos[grupoId];
    
    if (!grupo || !fechamento) {
        return '<p>Fechamento não disponível.</p>';
    }

    // ===== 1. Calcular status geral =====
    const totalTransferencias = fechamento.transferencias.length;
    const transferenciasPagas = fechamento.transferencias.filter(t => t.status === 'pago').length;
    const valorQuitado = fechamento.transferencias
        .filter(t => t.status === 'pago')
        .reduce((acc, t) => acc + t.valor, 0);
    const valorTotal = fechamento.transferencias.reduce((acc, t) => acc + t.valor, 0);
    const percentualQuitado = valorTotal > 0 ? (valorQuitado / valorTotal) * 100 : 0;

    // ===== 2. Gerar linhas da tabela de saldos =====
    const linhasSaldos = fechamento.membros.map(m => {
        const classeSaldo = m.saldo >= 0 ? 'positivo' : 'negativo';
        const sinal = m.saldo >= 0 ? '+' : '-';
        const nomeExibicao = m.isVoce ? `${m.nome} (você)` : m.nome;
        const classeLinha = m.isVoce ? 'linha-destaque' : '';

        return `
            <tr class="${classeLinha}">
                <td>${nomeExibicao}</td>
                <td>${formatarMoeda(m.pagou)}</td>
                <td>${formatarMoeda(m.consumiu)}</td>
                <td class="${classeSaldo}">${sinal} ${formatarMoeda(Math.abs(m.saldo))}</td>
            </tr>
        `;
    }).join('');

    // ===== 3. Gerar lista de transferências =====
    const listaTransferencias = fechamento.transferencias.map(t => {
        return renderTransferencia(t, grupoId);
    }).join('');

    // ===== 4. Botão "Encerrar grupo" =====
    const podeEncerrar = transferenciasPagas === totalTransferencias;
    const btnEncerrar = podeEncerrar
        ? `<button class="btn-primary" onclick="alert('Grupo encerrado! (Simulação)')">Encerrar grupo</button>`
        : `<button class="btn-primary" disabled 
                   title="Disponível quando todos os pagamentos forem confirmados"
                   style="opacity: 0.4; cursor: not-allowed;">
               Encerrar grupo
           </button>`;

    return `
        <section id="view-fechamento" class="view-section">
            
            <!-- Header com status de acerto -->
            <div class="fechamento-header">
                <div>
                    <h2>Fechamento de conta</h2>
                    <div class="badge-status-fechamento ${podeEncerrar ? 'concluido' : 'em-andamento'}">
                        ${podeEncerrar 
                            ? '✓ Todos os pagamentos confirmados' 
                            : `Em acerto · ${transferenciasPagas} de ${totalTransferencias} pagamentos`}
                    </div>
                </div>
                <div class="fechamento-progresso">
                    <div class="rs-progress-bar" style="margin-bottom: 0;">
                        <div class="rs-progress-fill" style="width: ${percentualQuitado}%;"></div>
                    </div>
                    <span class="texto-suave" style="font-size: 0.8rem; margin-top: 4px; display: block;">
                        ${formatarMoeda(valorQuitado)} de ${formatarMoeda(valorTotal)} quitado
                    </span>
                </div>
            </div>

            <!-- Resumo -->
            <div class="card-resumo">
                <h3>Resumo</h3>
                <div class="grid-resumo">
                    <div class="resumo-item">
                        <span>Total gasto pelo grupo</span>
                        <strong>${formatarMoeda(fechamento.totalGasto)}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Custo médio por pessoa</span>
                        <strong>${formatarMoeda(fechamento.custoMedio)}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Despesas registradas</span>
                        <strong>${fechamento.qtdDespesas}</strong>
                    </div>
                </div>
            </div>

            <!-- Tabela de Saldos -->
            <div class="card-tabela">
                <h3>Saldo de cada membro</h3>
                <table class="tabela-saldos">
                    <thead>
                        <tr>
                            <th>Membro</th>
                            <th>Pagou</th>
                            <th>Consumiu</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasSaldos}
                        <tr class="linha-total">
                            <td>Total</td>
                            <td>${formatarMoeda(fechamento.totalGasto)}</td>
                            <td>${formatarMoeda(fechamento.totalGasto)}</td>
                            <td>R$ 0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Transferências para quitar -->
            <div class="card-transferencias">
                <h3>Transferências para quitar</h3>
                <p class="texto-suave" style="margin-bottom: 20px;">
                    O menor número de Pix para todo mundo ficar zerado
                </p>
                <div class="lista-transferencias">
                    ${listaTransferencias}
                </div>
            </div>

            <!-- Botão Encerrar Grupo -->
            <div class="card-encerrar-grupo">
                ${btnEncerrar}
                <p class="texto-suave" style="font-size: 0.85rem; margin-top: 8px;">
                    ${podeEncerrar 
                        ? 'Todos os pagamentos foram confirmados. Você pode encerrar o grupo.' 
                        : 'Disponível quando todos os pagamentos forem confirmados.'}
                </p>
            </div>

        </section>
    `;
}


// gera o HTML de um item de transferência, pago ou pendente, quando o usario é devedor exibe o modulo pix
 
function renderTransferencia(t, grupoId) {
    const isPago = t.status === 'pago';
    const usuarioLogado = appState.usuarioLogado;
    const isDevedor = t.devedorId === usuarioLogado.id;
    const textoDevedor = isDevedor ? 'Você' : t.devedorNome;

    // Status badge
    const badge = isPago
        ? `<span class="badge-pago">Pago em ${t.dataPagamento}</span>`
        : `<span class="badge-pendente">Pendente</span>`;

    const acao = isPago
        ? `<button class="btn-outline-sm" onclick="desfazerPagamento('${grupoId}', '${t.id}')">Desfazer</button>`
        : `<button class="btn-primary" style="width: fit-content; padding: 8px 16px; font-size: 0.85rem;" 
                   onclick="marcarComoPago('${grupoId}', '${t.id}')">
               Marcar como pago
           </button>`;

    // Só aparece para o devedor em transferencias pendentes
    const moduloPix = (!isPago && isDevedor) ? `
        <div class="pix-box">
            <div class="qr-code-container">
                <div class="qr-code-placeholder">
                    <!-- QR Code simulado via SVG -->
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white"/>
                        <!-- Padrões de posição (cantos) -->
                        <rect x="5" y="5" width="20" height="20" fill="black"/>
                        <rect x="8" y="8" width="14" height="14" fill="white"/>
                        <rect x="11" y="11" width="8" height="8" fill="black"/>
                        
                        <rect x="75" y="5" width="20" height="20" fill="black"/>
                        <rect x="78" y="8" width="14" height="14" fill="white"/>
                        <rect x="81" y="11" width="8" height="8" fill="black"/>
                        
                        <rect x="5" y="75" width="20" height="20" fill="black"/>
                        <rect x="8" y="78" width="14" height="14" fill="white"/>
                        <rect x="11" y="81" width="8" height="8" fill="black"/>
                        
                        <!-- Dados simulados -->
                        <rect x="30" y="10" width="5" height="5" fill="black"/>
                        <rect x="40" y="15" width="5" height="5" fill="black"/>
                        <rect x="50" y="10" width="5" height="5" fill="black"/>
                        <rect x="30" y="25" width="5" height="5" fill="black"/>
                        <rect x="45" y="30" width="5" height="5" fill="black"/>
                        <rect x="60" y="20" width="5" height="5" fill="black"/>
                        <rect x="10" y="40" width="5" height="5" fill="black"/>
                        <rect x="20" y="50" width="5" height="5" fill="black"/>
                        <rect x="30" y="45" width="5" height="5" fill="black"/>
                        <rect x="40" y="55" width="5" height="5" fill="black"/>
                        <rect x="55" y="40" width="5" height="5" fill="black"/>
                        <rect x="65" y="50" width="5" height="5" fill="black"/>
                        <rect x="75" y="45" width="5" height="5" fill="black"/>
                        <rect x="85" y="55" width="5" height="5" fill="black"/>
                        <rect x="35" y="70" width="5" height="5" fill="black"/>
                        <rect x="45" y="80" width="5" height="5" fill="black"/>
                        <rect x="55" y="75" width="5" height="5" fill="black"/>
                        <rect x="65" y="85" width="5" height="5" fill="black"/>
                        <rect x="80" y="70" width="5" height="5" fill="black"/>
                        <rect x="85" y="85" width="5" height="5" fill="black"/>
                    </svg>
                </div>
                <span class="qr-legenda">QR Code estático</span>
            </div>
            
            <div class="pix-info">
                <span class="pix-info-label">Chave Pix de ${t.credorNome} (${t.tipoChavePix})</span>
                <div class="pix-chave">
                    <input type="text" value="${t.chavePixCredor}" readonly id="pix-chave-${t.id}">
                    <button class="btn-outline-sm" onclick="copiarChavePix('${t.chavePixCredor}', this)">
                        Copiar chave
                    </button>
                </div>
                <button class="btn-primary" style="margin-top: 8px; width: fit-content; padding: 8px 16px; font-size: 0.85rem;"
                        onclick="marcarComoPago('${grupoId}', '${t.id}')">
                    Marcar como pago
                </button>
            </div>
        </div>
    ` : '';

    return `
        <div class="transferencia-item ${isPago ? 'paga' : ''} ${!isPago && isDevedor ? 'destaque' : ''}">
            <div class="transferencia-header">
                <span class="transferencia-texto">
                    <strong>${textoDevedor}</strong> paga 
                    <strong>${formatarMoeda(t.valor)}</strong> para 
                    <strong>${t.credorNome}</strong>
                </span>
                <div class="transferencia-acoes">
                    ${badge}
                    ${acao}
                </div>
            </div>
            ${moduloPix}
        </div>
    `;
}

// Gera o HTML da visão "Perfil" (#perfil)
function renderViewPerfil() {
    return `
        <section id="view-perfil" class="view-section">
            <div class="perfil-header">
                <div class="avatar-grande">MC</div>
                <div>
                    <h2>Perfil</h2>
                    <span class="texto-suave">Membro desde março de 2025</span>
                </div>
            </div>

            <div class="card-resumo">
                <h3>Sua participação</h3>
                <div class="grid-resumo">
                    <div class="resumo-item"><span>Grupos participados</span><strong>12</strong></div>
                    <div class="resumo-item"><span>Despesas registradas</span><strong>47</strong></div>
                    <div class="resumo-item"><span>Total já dividido</span><strong>R$ 4.215,30</strong></div>
                </div>
            </div>

            <div class="card-form">
                <h3>Dados pessoais</h3>
                <div class="grid-2-col">
                    <div>
                        <label>Nome completo</label>
                        <input type="text" value="Mariana Costa">
                    </div>
                    <div>
                        <label>E-mail</label>
                        <input type="email" value="mariana.costa@ufv.br">
                    </div>
                    <div>
                        <label>Telefone</label>
                        <input type="tel" value="(31) 98765-4321">
                    </div>
                    <div>
                        <label>Chave Pix</label>
                        <input type="text" value="mariana.costa@ufv.br">
                    </div>
                </div>
                <button class="btn-primary" style="margin-top:16px; width:fit-content;">Salvar alterações</button>
            </div>

            <div class="card-tabela">
                <h3>Grupos arquivados</h3>
                <p class="texto-suave">Grupos já encerrados. Abra para ver o extrato completo.</p>
                <table class="tabela-saldos">
                    <thead>
                        <tr><th>Grupo</th><th>Encerrado em</th><th>Membros</th><th>Total</th><th></th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Calourada 2026/1</td><td>20/04/2026</td><td>9</td><td>R$ 612,00</td><td><a href="#" class="link-primario">Ver extrato</a></td></tr>
                        <tr><td>Aniversário da Bia</td><td>02/03/2026</td><td>6</td><td>R$ 348,90</td><td><a href="#" class="link-primario">Ver extrato</a></td></tr>
                        <tr><td>Viagem Capítulo</td><td>18/01/2026</td><td>5</td><td>R$ 1.120,00</td><td><a href="#" class="link-primario">Ver extrato</a></td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

// funcoes da right-sidebar

function renderRightSidebarGrupos() {
    return `
        <div class="rs-section">
            <h3 class="rs-title">Resumo geral</h3>
            <div class="rs-row"><span class="rs-label">Você deve</span><span class="rs-value negativo">R$ 87,00</span></div>
            <div class="rs-row"><span class="rs-label">Você recebe</span><span class="rs-value positivo">R$ 38,40</span></div>
            <div class="rs-divider"></div>
            <div class="rs-row destaque"><span class="rs-label">Saldo total</span><span class="rs-value negativo">- R$ 48,60</span></div>
            <div class="rs-divider"></div>
            <h3 class="rs-title" style="margin-top: 24px;">Pendências</h3>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Pagar Júlia</span></div>
                <div class="rs-pendencia-detalhe">Viagem Ouro Preto · <span class="negativo">R$ 65,00</span></div>
            </div>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Pagar Bruno</span></div>
                <div class="rs-pendencia-detalhe">Churrasco do 5º período · <span class="negativo">R$ 22,00</span></div>
            </div>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Receber de Pedro</span></div>
                <div class="rs-pendencia-detalhe">República Casa 12 · <span class="positivo">R$ 38,40</span></div>
            </div>
        </div>
    `;
}

function renderRightSidebarGrupoAtivo(grupoId) {
    const grupo = appState.grupos.find(g => g.id === grupoId);
    if (!grupo) return '';

    const membrosHTML = grupo.membros.map(m => {
        // simulação de saldos
        let saldo = 0;
        if (m.nome === 'Júlia') saldo = 255.00;
        else if (m.nome === 'Gabriel') saldo = -35.00;
        else if (m.nome === 'Mariana') saldo = -65.00;
        else if (m.nome === 'Lucas') saldo = -155.00;

        const classeSaldo = saldo >= 0 ? 'positivo' : 'negativo';
        const sinal = saldo >= 0 ? '+' : '-';
        const isVoce = m.nome === 'Mariana';

        return `
            <div class="rs-membro-row ${isVoce ? 'ativo' : ''}">
                <div class="rs-membro-info">
                    <div class="avatar-sm" style="background:${m.corFundo || '#eee'}; color:${m.corTexto || '#333'};">${m.iniciais}</div>
                    <span>${isVoce ? 'Você' : m.nome}</span>
                </div>
                <span class="rs-value ${classeSaldo}">${sinal} ${formatarMoeda(Math.abs(saldo))}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="rs-section">
            <h3 class="rs-title">Saldos do grupo</h3>
            <p class="rs-subtitle">Quanto cada um pagou menos o que consumiu</p>
            ${membrosHTML}
            <div class="rs-divider"></div>
            <div class="rs-row destaque"><span class="rs-label">Total gasto</span><span class="rs-value">R$ 760,00</span></div>
            <button class="rs-btn-outline" style="margin-top: 24px;" onclick="window.location.hash='#fechamento'">Ver fechamento</button>
        </div>
    `;
}

function renderRightSidebarFechamento() {
    const fechamento = appState.fechamentos['g1'];
    if (!fechamento) return '';

    const total = fechamento.transferencias.length;
    const pagas = fechamento.transferencias.filter(t => t.status === 'pago').length;
    const valorQuitado = fechamento.transferencias
        .filter(t => t.status === 'pago')
        .reduce((acc, t) => acc + t.valor, 0);
    const valorTotal = fechamento.transferencias.reduce((acc, t) => acc + t.valor, 0);
    const percentual = valorTotal > 0 ? (valorQuitado / valorTotal) * 100 : 0;

    const transferenciasHTML = fechamento.transferencias.map(t => {
        const isPago = t.status === 'pago';
        const textoDevedor = t.devedorId === appState.usuarioLogado.id ? 'Você' : t.devedorNome;
        const badge = isPago
            ? `<span class="badge-pago">Pago</span>`
            : `<span class="badge-pendente">Pendente</span>`;

        return `
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header">
                    <span class="rs-pendencia-nome">${textoDevedor} → ${t.credorNome}</span>
                    ${badge}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="rs-section">
            <h3 class="rs-title">Acerto de contas</h3>
            <p class="rs-subtitle">
                Quitado <strong>${formatarMoeda(valorQuitado)}</strong> de ${formatarMoeda(valorTotal)}
            </p>
            
            <div class="rs-progress-bar">
                <div class="rs-progress-fill" style="width: ${percentual}%;"></div>
            </div>
            <p class="rs-subtitle" style="margin-top: -16px; margin-bottom: 24px; font-size: 0.8rem;">
                ${pagas} de ${total} pagamentos confirmados
            </p>
            
            ${transferenciasHTML}
            
            <button class="rs-btn-outline" style="margin-top: 24px;" 
                    onclick="window.location.hash='#grupo/g1'">
                Voltar ao grupo
            </button>
        </div>
    `;
}

function renderRightSidebarPerfil() {
    return `
        <div class="rs-section">
            <h3 class="rs-title">Resumo geral</h3>
            <div class="rs-row"><span class="rs-label">Você deve</span><span class="rs-value negativo">R$ 87,00</span></div>
            <div class="rs-row"><span class="rs-label">Você recebe</span><span class="rs-value positivo">R$ 38,40</span></div>
            <div class="rs-divider"></div>
            <div class="rs-row destaque"><span class="rs-label">Saldo total</span><span class="rs-value negativo">- R$ 48,60</span></div>
            <p class="rs-subtitle" style="margin-top: 16px;">3 grupos ativos</p>
            <button class="rs-btn-outline" style="margin-top: 24px;" onclick="window.location.hash='#grupos'">Ver meus grupos</button>
        </div>
    `;
}

//Nova Despesa
function renderViewNovaDespesa(grupoId) {
    const grupo = appState.grupos.find(g => g.id === grupoId);
    if (!grupo) return '<p>Grupo não encontrado.</p>';

    const usuarioLogado = appState.usuarioLogado;

    const botoesParticipantes = grupo.membros.map(m => {
        const isVoce = m.id === usuarioLogado.id;
        const nomeExibicao = isVoce ? 'Você (Mariana)' : m.nome;
        const avatarStyle = isVoce 
            ? `background: #E0F2F1; color: var(--cor-primaria);` 
            : `background: ${m.corFundo || '#eee'}; color: ${m.corTexto || '#333'};`;

        return `
            <button type="button" 
                    class="btn-participante ${isVoce ? 'selecionado' : ''}" 
                    data-membro-id="${m.id}"
                    onclick="toggleParticipante(this)">
                <div class="avatar-participante" style="${avatarStyle}">${m.iniciais}</div>
                <span>${nomeExibicao}</span>
            </button>
        `;
    }).join('');

    const opcoesPagador = grupo.membros.map(m => {
        const isVoce = m.id === usuarioLogado.id;
        const nomeExibicao = isVoce ? `Você (Mariana)` : m.nome;
        return `<option value="${m.id}">${nomeExibicao}</option>`;
    }).join('');

    return `
        <section id="view-nova-despesa" class="view-section">
            <div class="card-nova-despesa">
                <h2>Nova despesa</h2>
                <p class="texto-suave" style="margin-bottom: 24px;">
                    Marque só quem consumiu esse item. O valor é dividido entre essas pessoas.
                </p>

                <form id="form-nova-despesa" onsubmit="salvarDespesa(event, '${grupoId}')">
                    <!-- Descrição -->
                    <div class="form-group">
                        <label for="descricao">Descrição</label>
                        <input type="text" id="descricao" name="descricao" 
                               placeholder="Pizza de sábado" required>
                    </div>

                    <!-- Linha: Valor, Data, Categoria -->
                    <div class="form-row-3">
                        <div class="form-group">
                            <label for="valor">Valor (R$)</label>
                            <input type="number" id="valor" name="valor" 
                                   step="0.01" min="0.01" 
                                   placeholder="90.00" 
                                   value="90.00"
                                   oninput="atualizarDivisao('${grupoId}')" required>
                        </div>
                        <div class="form-group">
                            <label for="data">Data</label>
                            <input type="date" id="data" name="data" required>
                        </div>
                        <div class="form-group">
                            <label for="categoria">Categoria</label>
                            <select id="categoria" name="categoria">
                                <option value="Alimentação">Alimentação</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Hospedagem">Hospedagem</option>
                                <option value="Bebidas">Bebidas</option>
                                <option value="Lazer">Lazer</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <!-- Quem pagou -->
                    <div class="form-group">
                        <label for="pagador">Quem pagou?</label>
                        <select id="pagador" name="pagador" required>
                            ${opcoesPagador}
                        </select>
                    </div>

                    <!-- Quem participou -->
                    <div class="form-group">
                        <label>Quem participou?</label>
                        <div class="grid-participantes" id="grid-participantes">
                            ${botoesParticipantes}
                        </div>
                        <button type="button" class="link-marcar-todos" 
                                onclick="toggleTodosParticipantes('${grupoId}')">
                            Marcar todos
                        </button>
                    </div>

                    <!-- Resumo da divisão (atualizado em tempo real) -->
                    <div class="resumo-divisao" id="resumo-divisao">
                        <span id="texto-divisao">R$ 90,00 dividido entre 1 pessoa</span>
                        <strong id="valor-por-pessoa">R$ 90,00 cada</strong>
                    </div>

                    <!-- Ações -->
                    <div class="form-actions">
                        <button type="button" class="btn-outline" 
                                onclick="window.location.hash='#grupo/${grupoId}'">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-primary">
                            Salvar despesa
                        </button>
                    </div>
                </form>
            </div>
        </section>
    `;
}

function renderRightSidebarNovaDespesa(grupoId) {
    return renderRightSidebarGrupoAtivo(grupoId);
}