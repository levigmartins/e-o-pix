# E o meu pix?

- **Disciplina:** INF321 - Projeto e Desenvolvimento de Sistemas para a Web
- **Instituição:** Universidade Federal de Viçosa (UFV)
- **Docente:** Prof. Dr. Lucas Francisco da Matta Vegi
- **Equipe:** Gabriel Ferreira, Levi Martins e Lucas Mombach

---

## Arquitetura Front-End 

O projeto adota uma arquitetura híbrida dividida em dois pontos de entrada:

- **`login.html` (MPA):** Página isolada para login e cadastro. Mantém o fluxo de autenticação desacoplado do layout principal.
- **`app.html` (SPA):** Aplicação de página única para a área autenticada. Utiliza roteamento por hash (`#grupos`, `#grupo/:id`, `#fechamento/:id`, `#perfil`) e renderiza visões dinâmicas dentro de uma casca central.

### Motivações
- **Eliminação de código duplicado:** Centraliza a casca de três colunas (menu lateral, painel central e barra de saldos) em um único arquivo HTML.
- **Estado centralizado:** Mantém o objeto de estado (`appState`) na memória do navegador durante a navegação.
- **Persistência de conexão para a Fase 2:** Permite manter a conexão aberta via WebSockets na etapa de backend sem interrupções por recarregamento de página.

---

## Telas Implementadas

1. **Login e Cadastro (`login.html`):** Alternância acessível entre abas de acesso e registro. Utiliza validação nativa HTML5 e atributos de preenchimento automático.
2. **Meus Grupos (`app.html#grupos`):** Listagem de grupos ativos com saldo consolidado por cartão. Formulários semânticos para criar grupo e ingressar por código de convite.
3. **Detalhes do Grupo e Nova Despesa (`app.html#grupo/:id` e `#grupo/:id/nova-despesa`):** Feed de despesas com marcador visual para itens sem participação do usuário ("não envolvido"). Formulário com divisão por participante e painel lateral com saldos parciais calculados.
4. **Fechamento de Conta (`app.html#fechamento/:id`):** Tabela de saldos por membro, transferências de quitação calculadas, módulo Pix com QR Code e chave copiável, controle de status pago/pendente e estado visual vazio para grupos sem lançamentos.
5. **Perfil do Usuário (`app.html#perfil`):** Estatísticas de participação, formulário com dados cadastrais e histórico de grupos arquivados com extrato.

## Como testar

Não é necessário instalar dependências nem rodar servidor.

1. Clone o repositório.
2. Abra o arquivo `login.html` no navegador
3. Preencha os campos de **Entrar** ou **Criar conta** e envie o formulário para acessar a aplicação.

**Observações da F1:**
- Não há autenticação real: qualquer e-mail/senha válidos (pelas regras de validação do formulário) dão acesso. O usuário logado é sempre o usuário de exemplo definido em `js/state.js`.
- Os dados são simulados e ficam apenas na memória do navegador. Ao recarregar a página, grupos, despesas e alterações de perfil voltam ao estado inicial.
