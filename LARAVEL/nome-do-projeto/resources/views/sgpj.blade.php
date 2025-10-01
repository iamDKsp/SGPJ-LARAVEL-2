<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SGPJ</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body data-detail-template="/processos/{id}" data-processes-url="/processos.json">
    <div class="login-screen" id="login-screen" aria-labelledby="login-title">
      <section class="login-card" role="dialog" aria-modal="true">
        <header class="login-card__header">
          <div class="login-brand">SGPJ</div>
          <h1 class="login-title" id="login-title">Sejam Bem-vindos Futuros Milionarios!</h1>
          <p class="login-subtitle">Acesse o painel com o seu Usuário.</p>
        </header>
        <form class="login-form" id="login-form" novalidate>
          <label class="login-field" for="login-username">
            <span>Usuário</span>
            <input
              type="text"
              id="login-username"
              name="username"
              autocomplete="username"
              placeholder="Digite Usuário"
              required
            />
          </label>
          <label class="login-field" for="login-password">
            <span>Senha</span>
            <input
              type="password"
              id="login-password"
              name="password"
              autocomplete="current-password"
              placeholder="Digite Senha"
              required
            />
          </label>
          <label class="login-remember" for="login-remember">
            <input type="checkbox" id="login-remember" name="remember" />
            <span>Lembrar-me neste dispositivo</span>
          </label>
          <button class="login-submit" type="submit">Entrar</button>
          <p class="login-hint">Usuários autorizados: Tarcisio · Lucas · bruno@sgpj.com · rafael@sgpj.com · renan@spgj.com</p>
          <p class="login-error" id="login-error" role="alert" aria-live="polite"></p>
        </form>
      </section>
    </div>

    <div class="app-shell" id="app-shell" hidden>
      <header class="app-header">
        <div class="header-left">
          <button
            class="icon-button"
            type="button"
            aria-label="Alternar menu"
            data-drawer-toggle
            aria-expanded="false"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div class="product-logo" aria-hidden="true">P</div>
          <div class="header-title-group">
            <span class="header-eyebrow">SGPJ</span>
            <h1 class="header-title">Causas</h1>
            <span class="header-subtitle">DASHBOARDS</span>
          </div>
          <span class="header-user" id="logged-user" hidden>Olá, <strong></strong></span>
          <span class="header-chip" id="total-processos">0 processos</span>
        </div>
        <div class="header-actions">
          <button
            class="icon-button"
            type="button"
            aria-label="Visualização em lista"
            data-view-toggle="list"
            aria-pressed="false"
          >
            <span aria-hidden="true">☷</span>
          </button>
          <button
            class="icon-button is-active"
            type="button"
            aria-label="Visualização em quadro"
            data-view-toggle="board"
            aria-pressed="true"
          >
            <span aria-hidden="true">▦</span>
          </button>
          <button class="icon-button icon-button--reload" type="button" aria-label="Recarregar dados" data-reload>
            <span aria-hidden="true">⟲</span>
          </button>
        </div>
      </header>

      <section class="board-toolbar" aria-label="Opções da visualização">
        <div class="toolbar-tabs" role="tablist" aria-label="Filtros rápidos">
          <button class="tab is-active" role="tab" aria-selected="true">CRM</button>
          <button class="tab" role="tab" aria-selected="false">DASHBOARDS</button>
          <button class="tab" role="tab" aria-selected="false">TAREFAS</button>
        </div>
        <div class="toolbar-actions">
          <button
            class="icon-button"
            type="button"
            aria-label="Exportar processos em Excel"
            data-export
          >
            <span aria-hidden="true">⤓</span>
          </button>
          <div class="toolbar-actions__settings">
            <button
              class="icon-button"
              type="button"
              aria-label="Configurações de exportação"
              data-export-settings
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span aria-hidden="true">⚙</span>
            </button>
            <div
              class="export-popover"
              id="export-popover"
              role="dialog"
              aria-modal="false"
              hidden
            >
              <div class="export-popover__header">
                <h3 class="export-popover__title">Configurações</h3>
                <button
                  class="icon-button export-popover__close"
                  type="button"
                  aria-label="Fechar configurações de exportação"
                  data-export-close
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
              <div class="export-popover__content">
                <fieldset class="export-popover__group">
                  <legend>Ordenar valores</legend>
                  <label class="export-popover__option">
                    <input type="radio" name="export-order" value="valor-desc" checked />
                    Do maior para o menor
                  </label>
                  <label class="export-popover__option">
                    <input type="radio" name="export-order" value="valor-asc" />
                    Do menor valor para o maior valor
                  </label>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="filters" aria-label="Filtros do quadro">
        <label class="filter">
          <span class="filter-label">Funil</span>
          <select id="pipeline-filter">
            <option value="all">Todos os funis</option>
            <option value="funil-os" selected>Funil OS</option>
          </select>
        </label>
        <label class="filter">
          <span class="filter-label">Status</span>
          <select id="status-filter">
            <option value="all">Todos os status</option>
          </select>
        </label>
        <label class="filter">
          <span class="filter-label">Responsável</span>
          <select id="responsavel-filter">
            <option value="all">Todos os responsáveis</option>
          </select>
        </label>
        <label class="filter">
          <span class="filter-label">Ordenar</span>
          <select id="sort-filter">
            <option value="recent">Criados por último</option>
            <option value="valor-desc">Maior valor</option>
            <option value="valor-asc">Menor valor</option>
            <option value="alfabetico">Ordem alfabética</option>
          </select>
        </label>
        <label class="filter filter--search">
          <span class="filter-label">Buscar</span>
          <input
            id="search-input"
            type="search"
            placeholder="Procurar por cliente, CPF/CNPJ ou nº do processo"
            autocomplete="off"
          />
        </label>
        <button class="ghost-button" type="button" id="clear-filters">Limpar filtros</button>
      </section>

      <main class="board" id="board-view" aria-label="Quadro de processos">
        <section class="board-column" data-column="em-atendimento">
          <header class="column-header">
            <div class="column-title">
              <span class="column-dot" aria-hidden="true"></span>
              <h2>Recebidos</h2>
            </div>
            <span class="column-count" data-count>0</span>
          </header>
          <div class="column-cards" role="list"></div>
        </section>

        <section class="board-column" data-column="orcamento-proposta">
          <header class="column-header">
            <div class="column-title">
              <span class="column-dot" aria-hidden="true"></span>
              <h2>Em progresso</h2>
            </div>
            <span class="column-count" data-count>0</span>
          </header>
          <div class="column-cards" role="list"></div>
        </section>

        <section class="board-column" data-column="orcamento-aprovado">
          <header class="column-header">
            <div class="column-title">
              <span class="column-dot" aria-hidden="true"></span>
              <h2>Veredito</h2>
            </div>
            <span class="column-count" data-count>0</span>
          </header>
          <div class="column-cards" role="list"></div>
        </section>

        <section class="board-column" data-column="aguardando">
          <header class="column-header">
            <div class="column-title">
              <span class="column-dot" aria-hidden="true"></span>
              <h2>Aguardando Juiz</h2>
            </div>
            <span class="column-count" data-count>0</span>
          </header>
          <div class="column-cards" role="list"></div>
        </section>

        <section class="board-column" data-column="finalizados">
          <header class="column-header">
            <div class="column-title">
              <span class="column-dot" aria-hidden="true"></span>
              <h2>Concluídos</h2>
            </div>
            <span class="column-count" data-count>0</span>
          </header>
          <div class="column-cards" role="list"></div>
        </section>
      </main>

      <section class="board-list" id="board-list" aria-label="Lista de processos" hidden></section>

      <button class="help-button" type="button">
        <span aria-hidden="true">?</span>
        <span>Ajuda</span>
      </button>
    </div>

    <div class="drawer-overlay" id="drawer-overlay" hidden></div>
    <aside class="side-drawer" id="side-drawer" aria-hidden="true">
      <div class="side-drawer__header">
        <span class="side-drawer__title">Menu</span>
        <button class="icon-button side-drawer__close" type="button" id="drawer-close" aria-label="Fechar menu">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <nav class="side-drawer__nav" aria-label="Menu principal">
        <ul class="side-drawer__list">
          <li>
            <button class="side-drawer__link" type="button" data-drawer-action="home">Início</button>
          </li>
          <li>
            <button class="side-drawer__link" type="button" data-drawer-action="report">Reporte um erro</button>
          </li>
          <li>
            <button
              class="side-drawer__link"
              type="button"
              data-drawer-action="settings"
              aria-controls="drawer-settings"
              aria-expanded="false"
            >
              Configurações
            </button>
          </li>
          <li>
            <button class="side-drawer__link" type="button" data-drawer-action="about">Sobre nós</button>
          </li>
          <li>
            <button class="side-drawer__link" type="button" data-drawer-action="logout">Sair</button>
          </li>
        </ul>
      </nav>
      <div class="side-drawer__settings" id="drawer-settings" hidden aria-hidden="true">
        <span class="side-drawer__settings-title">Preferências</span>
        <div class="settings-toggle">
          <div class="settings-toggle__text">
            <label class="settings-toggle__title" for="theme-toggle" id="theme-toggle-label">Modo escuro</label>
            <p class="settings-toggle__description" id="theme-toggle-description">
              Ativa uma paleta escura em todo o painel.
            </p>
          </div>
          <div class="settings-toggle__control">
            <input
              type="checkbox"
              class="switch__input"
              id="theme-toggle"
              role="switch"
              aria-labelledby="theme-toggle-label"
              aria-describedby="theme-toggle-description"
              aria-checked="false"
            />
            <span class="switch" aria-hidden="true">
              <span class="switch__thumb"></span>
            </span>
          </div>
        </div>
      </div>
    </aside>

    <script src="/processos-data.js" defer></script>
    <script src="/script.js" defer></script>
  </body>
</html>
