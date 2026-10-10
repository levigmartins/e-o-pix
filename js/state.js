/**
 * Simulacao de estado da aplicacao. Na Fase 1, os dados sao hardcode.
 * Na F2, vai ser substituido por dados vindo do backend
 */
const appState = {
    usuarioLogado: {
        id: 'u1',
        nome: 'Mariana Costa',
        email: 'mariana.costa@ufv.br',
        iniciais: 'MC',
        chavePix: 'mariana.costa@ufv.br'
    },
    grupos: [
        {
            id: 'g1',
            nome: 'Viagem Ouro Preto',
            descricao: 'Viagem de fim de ano',
            iniciais: 'VO',
            corFundo: '#FFF3E0',
            corTexto: '#E65100',
            membros: [
                { id: 'u1', nome: 'Mariana', iniciais: 'MC', corFundo: '#E0F2F1', corTexto: '#0B6E61' },
                { id: 'u2', nome: 'Júlia', iniciais: 'JS', corFundo: '#FCE4EC', corTexto: '#C2185B' },
                { id: 'u3', nome: 'Gabriel', iniciais: 'GA', corFundo: '#E3F2FD', corTexto: '#1565C0' },
                { id: 'u4', nome: 'Lucas', iniciais: 'LU', corFundo: '#FFF3E0', corTexto: '#E65100' }
            ],
            saldoUsuario: -65.00
        },
        {
            id: 'g2',
            nome: 'República Casa 12',
            descricao: 'Despesas da casa',
            iniciais: 'RC',
            corFundo: '#E3F2FD',
            corTexto: '#1565C0',
            membros: [
                { id: 'u1', nome: 'Mariana', iniciais: 'MC' },
                { id: 'u2', nome: 'Júlia', iniciais: 'JS' },
                { id: 'u5', nome: 'Pedro', iniciais: 'PE' }
            ],
            saldoUsuario: 38.40 
        },
        {
            id: 'g3',
            nome: 'Churrasco do 5º período',
            descricao: 'Confraternização',
            iniciais: 'CH',
            corFundo: '#F3E5F5',
            corTexto: '#6A1B9A',
            membros: [
                { id: 'u1', nome: 'Mariana', iniciais: 'MC' },
                { id: 'u3', nome: 'Gabriel', iniciais: 'GA' },
                { id: 'u4', nome: 'Lucas', iniciais: 'LU' }
            ],
            saldoUsuario: -22.00
        }
    ],
    grupoAtivoId: null, // Definido ao entrar em #grupo/:id
    despesas: {
        'g1': [
            { id: 'd1', data: '14 set', categoria: 'Hospedagem', descricao: 'Pousada Recanto', valorTotal: 400.00, pagoPor: 'Júlia', participantes: ['Você', 'Lucas', 'Gabriel', 'Júlia'], naoEnvolvido: false },
            { id: 'd2', data: '14 set', categoria: 'Bebidas', descricao: 'Cerveja e petiscos', valorTotal: 60.00, pagoPor: 'Lucas', participantes: ['Lucas', 'Gabriel'], naoEnvolvido: true },
            { id: 'd3', data: '13 set', categoria: 'Transporte', descricao: 'Gasolina (ida)', valorTotal: 120.00, pagoPor: 'Você', participantes: ['Você', 'Lucas', 'Gabriel'], naoEnvolvido: false },
            { id: 'd4', data: '13 set', categoria: 'Alimentação', descricao: 'Supermercado', valorTotal: 180.00, pagoPor: 'Gabriel', participantes: ['Você', 'Lucas', 'Gabriel', 'Júlia'], naoEnvolvido: false }
        ]
    }
};

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

appState.fechamentos = {
    'g1': {
        totalGasto: 760.00,
        custoMedio: 190.00,
        qtdDespesas: 4,
        membros: [
            { id: 'u2', nome: 'Júlia', iniciais: 'JS', corFundo: '#FCE4EC', corTexto: '#C2185B', pagou: 400.00, consumiu: 145.00, saldo: 255.00 },
            { id: 'u3', nome: 'Gabriel', iniciais: 'GA', corFundo: '#E3F2FD', corTexto: '#1565C0', pagou: 180.00, consumiu: 215.00, saldo: -35.00 },
            { id: 'u1', nome: 'Mariana', iniciais: 'MC', corFundo: '#E0F2F1', corTexto: '#0B6E61', pagou: 120.00, consumiu: 185.00, saldo: -65.00, isVoce: true },
            { id: 'u4', nome: 'Lucas', iniciais: 'LU', corFundo: '#FFF3E0', corTexto: '#E65100', pagou: 60.00, consumiu: 215.00, saldo: -155.00 }
        ],
        transferencias: [
            {
                id: 't1',
                devedorId: 'u4',
                devedorNome: 'Lucas',
                credorId: 'u2',
                credorNome: 'Júlia',
                valor: 155.00,
                status: 'pago',
                dataPagamento: '16/09'
            },
            {
                id: 't2',
                devedorId: 'u1',
                devedorNome: 'Mariana',
                credorId: 'u2',
                credorNome: 'Júlia',
                valor: 65.00,
                status: 'pendente',
                chavePixCredor: 'julia.santos@email.com',
                tipoChavePix: 'e-mail'
            },
            {
                id: 't3',
                devedorId: 'u3',
                devedorNome: 'Gabriel',
                credorId: 'u2',
                credorNome: 'Júlia',
                valor: 35.00,
                status: 'pendente',
                chavePixCredor: 'julia.santos@email.com',
                tipoChavePix: 'e-mail'
            }
        ]
    }
};