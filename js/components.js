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

/**
 * Gera o HTML da visão "Fechamento" (#fechamento)
 */
function renderViewFechamento() {
    return `
        <section id="view-fechamento" class="view-section">
            <div class="card-resumo">
                <h3>Resumo</h3>
                <div class="grid-resumo">
                    <div class="resumo-item">
                        <span>Total gasto pelo grupo</span>
                        <strong>R$ 760,00</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Custo médio por pessoa</span>
                        <strong>R$ 190,00</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Despesas registradas</span>
                        <strong>4</strong>
                    </div>
                </div>
            </div>

            <div class="card-tabela">
                <h3>Saldo de cada membro</h3>
                <table class="tabela-saldos">
                    <thead>
                        <tr><th>Membro</th><th>Pagou</th><th>Consumiu</th><th>Saldo</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Júlia</td><td>R$ 400,00</td><td>R$ 145,00</td><td class="positivo">+ R$ 255,00</td></tr>
                        <tr><td>Gabriel</td><td>R$ 180,00</td><td>R$ 215,00</td><td class="negativo">- R$ 35,00</td></tr>
                        <tr class="linha-destaque"><td>Mariana (você)</td><td>R$ 120,00</td><td>R$ 185,00</td><td class="negativo">- R$ 65,00</td></tr>
                        <tr><td>Lucas</td><td>R$ 60,00</td><td>R$ 215,00</td><td class="negativo">- R$ 155,00</td></tr>
                        <tr class="linha-total"><td>Total</td><td>R$ 760,00</td><td>R$ 760,00</td><td>R$ 0,00</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="card-transferencias">
                <h3>Transferências para quitar</h3>
                <p class="texto-suave">O menor número de Pix para todo mundo ficar zerado</p>
                
                <div class="transferencia-item">
                    <span>Lucas paga <strong>R$ 155,00</strong> para Júlia</span>
                    <span class="badge-pago">Pago em 16/09</span>
                    <button class="btn-outline-sm">Desfazer</button>
                </div>

                <div class="transferencia-item destaque">
                    <span>Você paga <strong>R$ 65,00</strong> para Júlia</span>
                    <span class="badge-pendente">Pendente</span>
                    <div class="pix-box">
                        <div class="qr-code-placeholder">QR Code</div>
                        <div class="pix-info">
                            <span>Chave Pix da Júlia (e-mail)</span>
                            <div class="pix-chave">
                                <input type="text" value="julia.santos@email.com" readonly>
                                <button class="btn-outline-sm">Copiar chave</button>
                            </div>
                            <button class="btn-primary" style="margin-top:8px; width:fit-content;">Marcar como pago</button>
                        </div>
                    </div>
                </div>

                <div class="transferencia-item">
                    <span>Gabriel paga <strong>R$ 35,00</strong> para Júlia</span>
                    <span class="badge-pendente">Pendente</span>
                    <button class="btn-outline-sm">Marcar como pago</button>
                </div>
            </div>
        </section>
    `;
}

/**
 * Gera o HTML da visão "Perfil" (#perfil)
 */
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
    return `
        <div class="rs-section">
            <h3 class="rs-title">Acerto de contas</h3>
            <p class="rs-subtitle">Quitado <strong>R$ 155,00</strong> de R$ 255,00</p>
            <div style="width: 100%; height: 6px; background: var(--cor-borda); border-radius: 3px; margin-bottom: 24px;">
                <div style="width: 60%; height: 100%; background: var(--cor-primaria); border-radius: 3px;"></div>
            </div>
            <p class="rs-subtitle" style="margin-top: -16px; margin-bottom: 24px; font-size: 0.8rem;">1 de 3 pagamentos confirmados</p>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Lucas → Júlia</span><span class="badge-pago">Pago</span></div>
            </div>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Você → Júlia</span><span class="badge-pendente">Pendente</span></div>
            </div>
            <div class="rs-card-pendencia">
                <div class="rs-pendencia-header"><span class="rs-pendencia-nome">Gabriel → Júlia</span><span class="badge-pendente">Pendente</span></div>
            </div>
            <button class="rs-btn-outline" style="margin-top: 24px;" onclick="window.location.hash='#grupo/g1'">Voltar ao grupo</button>
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