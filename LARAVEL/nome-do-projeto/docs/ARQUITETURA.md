# Guia da Estrutura do Código SGPJ

Este documento explica onde cada parte do painel SGPJ em Laravel está localizada, quais responsabilidades possui e como os arquivos se relacionam. Use-o como mapa para navegar no projeto e localizar rapidamente pontos de manutenção.

## Visão geral do repositório

- `README.md` (raiz): instruções gerais do repositório.
- `LARAVEL/nome-do-projeto/`: instalação completa do Laravel 10 que serve a interface SGPJ.

Dentro da pasta `nome-do-projeto` a estrutura segue o padrão do framework:

| Diretório / Arquivo | Função principal |
| --- | --- |
| `app/` | Código backend (kernels, middlewares, providers). |
| `bootstrap/` | Inicialização do framework e cache de autoload. |
| `config/` | Arquivos de configuração do Laravel (app, auth, queue, etc.). |
| `database/` | Migrations, factories e seeders padrão. |
| `public/` | Raiz pública com os assets do SGPJ (CSS, JS, dados simulados). |
| `resources/` | Views Blade (`sgpj.blade.php`, `sgpj-detalhe.blade.php`) e assets do Vite. |
| `routes/` | Declaração das rotas web e APIs. |
| `storage/` | Arquivos gerados em tempo de execução (logs, cache, uploads). |
| `tests/` | Testes unitários e de feature padrão do Laravel. |

## Rotas e fluxo de navegação

- `routes/web.php`: expõe duas rotas. A raiz (`/`) renderiza o dashboard principal (`sgpj`). A rota `/processos/{processo}` abre a página de detalhes de um processo específico (`sgpj-detalhe`). Ambas utilizam helpers `name()` para permitir geração de URLs nas views.
- `routes/api.php`: expõe a API utilizada pelo dashboard (`/api/processos`), conectando o front-end ao banco de dados real.

## Views Blade

### `resources/views/sgpj.blade.php`

- Monta o HTML completo do dashboard.
- Calcula dinamicamente a base para carregar CSS/JS/dados a partir do host e caminho atual (compatível com subdiretórios).
- Inclui os elementos de login, filtros, quadros do CRM, listagem, popovers de exportação, menus de contexto e botões de alternância de visualização.
- Injeta atributos `data-*` utilizados pelo JavaScript (`data-processes-url`, `data-detail-url-template`, etc.).

### `resources/views/sgpj-detalhe.blade.php`

- Renderiza a tela de detalhes do processo.
- Recebe o `processoId` via rota e o expõe em `data-processo-id`.
- Reutiliza as mesmas fontes, estilos e scripts do dashboard, exibindo cards resumidos, formulários editáveis e painel de anexos.
- Possui link de retorno para o dashboard usando a rota nomeada `sgpj.dashboard`.

## Assets públicos (`public/`)

### Folhas de estilo

- `styles.css`: stylesheet principal com layout responsivo, cores temáticas, animações, espaçamento dos cards, temas claro/escuro e estilos do detalhe (cards-resumo, formulário, anexos). Também define classes utilitárias como `status-chip--pendente`, `status-chip--perdido`, `status-chip--finalizado`.

### Scripts

- `script.js`: núcleo do front-end.
  - Define colunas do funil, opções de status e responsáveis.
  - Mantém as credenciais permitidas e gerencia autenticação/localStorage.
  - Controla tema, drawer lateral, filtros (status, responsável, busca, ordenação e valor), alternância quadro/lista e contadores.
  - Consome a API `/api/processos` e renderiza cards e linhas da tabela a partir dos dados do banco.
  - Implementa exportação para Excel, popover de configuração, menus dos cards (editar/mover/excluir com confirmação), atribuição de responsável e drag-and-drop entre colunas.
  - Sincroniza a visualização detalhada salvando o processo atual em `sessionStorage`/`localStorage` antes de abrir `/processos/{id}`.
- `detalhes.js`: controla a página de detalhes.
  - Recupera o processo selecionado a partir do armazenamento local ou via `fetch` da API.
  - Atualiza chips de status, resumo, formulário editável e notas, persistindo alterações em `localStorage`.
  - Gerencia anexos simulados (upload para memória local, listagem e exclusão) e mantém data/hora de atualização.
  - Usa o mesmo dicionário de status do dashboard para manter consistência visual.

### API e dados

- `GET /api/processos`: retorna todos os processos cadastrados na tabela `processos`, convertendo campos numéricos em valores formatados (ex.: `valor_causa`) e expondo status/responsáveis conforme esperado pelo front-end.
- `GET /api/processos/{identificador}`: recupera um único processo pelo `id` ou pelo número completo. Ambas as rotas dependem dos dados importados via `processos(3).sql`.

### Outros

- `detalhes.html`: versão estática da página de detalhes (mantida para referência/compatibilidade). A implementação oficial em Laravel usa a view Blade descrita anteriormente.
- `index.php`: front controller padrão do Laravel.

## Persistência no navegador

O front-end utiliza `localStorage`/`sessionStorage` para guardar preferências e estado:

| Chave | Uso |
| --- | --- |
| `sgpj-dashboard-usuario` | Usuário autenticado (nome, login lembrado). |
| `sgpj-dashboard-tema` | Tema atual (light/dark). |
| `sgpj-dashboard-processos` | Cache dos processos carregados. |
| `sgpj-dashboard-preferencias` | Opções de filtros, ordem e visualização. |
| `sgpj-detalhe-processo` | Último processo aberto (para carregar rapidamente a página de detalhes). |
| `sgpj-anexos` | Anexos simulados por processo. |
| `sgpj-detalhe-edicoes` | Edições feitas nos campos do detalhe. |

## Login e responsáveis

As credenciais aceitas pelo `script.js` são:

- `tarcisio` / `123`
- `lucas` / `123`
- `bruno@sgpj.com` / `123456789`
- `rafael@sgpj.com` / `123456789`
- `renan@spgj.com` / `123456789`

Após o login, os responsáveis disponíveis para atribuição dos cards são Rafael (R), Bruno (B) e Renan (R). O botão com ícone de perfil permite escolher o responsável; o filtro “Responsável” na barra aplica a mesma lista.

## Interações principais do dashboard

1. **Login** – valida usuário/senha, suporta “lembrar-me” e restaura sessões salvas.
2. **Drawer lateral** – alterna entre seções “CRM”, “DASHBOARDS” e “TAREFAS”, além das preferências (tema).
3. **Filtros superiores** – status, responsável, busca, ordenação por data/valor e reset.
4. **Visualizações** – botões “Quadro” e “Lista” alternam entre kanban e tabela, mantendo sincronização.
5. **Cards** – exibem processo, valor, documento, status e responsável. Menus permitem editar/mover/excluir; o ícone de olho abre o detalhe.
6. **Drag-and-drop** – arrasta cards entre colunas atualizando status visual e contadores.
7. **Exportação** – botão “Exportar” gera planilha Excel considerando filtros; botão de engrenagem abre popover de parâmetros (ordem de valor).
8. **Listagem** – oferece dropdown inline para alterar status e responsável, além de ordenação por valor crescente/decrescente.

## Página de detalhes do processo

- Mostra cabeçalho com status (chip colorido), número do processo, valor, CPF/CNPJ e responsável.
- Campos editáveis permitem ajustar título, etapa, resumo, descrição e observações, salvando automaticamente em `localStorage`.
- Painel de anexos aceita múltiplos arquivos (simulados) com pré-visualização de nome, tamanho e ações de download/remoção.
- Botão “Voltar” retorna ao dashboard preservando o processo atual em `sessionStorage`.

## Pontos de extensão

- **Integração com banco**: (já implementada) os scripts consomem a API `/api/processos`. Amplie com filtros/ordenação no backend conforme necessário.
- **Autenticação real**: conectar o formulário de login a `Auth::attempt()` e usar guard padrão.
- **Persistência de anexos**: mover lógica de anexos do `localStorage` para um storage Laravel (S3, disco local) via rotas de upload/download.
- **Testes**: adicionar testes de feature cobrindo rotas `sgpj.dashboard` e `sgpj.processo`, além de testes JavaScript com framework de sua preferência.

## Referências rápidas

- Dashboard: `resources/views/sgpj.blade.php`
- Detalhe: `resources/views/sgpj-detalhe.blade.php`
- Script principal: `public/script.js`
- Script detalhe: `public/detalhes.js`
- API de dados: `/api/processos`
- Estilos: `public/styles.css`

