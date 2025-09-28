(function () {
  const columns = [
    { id: 'em-atendimento', label: 'Em atendimento' },
    { id: 'orcamento-proposta', label: 'Orçamento enviado' },
    { id: 'orcamento-aprovado', label: 'Orçamento aprovado' },
    { id: 'aguardando', label: 'Aguardando retorno' },
    { id: 'finalizados', label: 'Finalizados' }
  ];

  const STATUS_OPTIONS = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'perdido', label: 'Perdido' },
    { value: 'finalizado', label: 'Finalizado' }
  ];

  const STATUS_CLASS_PREFIX = 'status-chip--';
  const STATUS_CLASS_NAMES = STATUS_OPTIONS.map(function (option) {
    return STATUS_CLASS_PREFIX + option.value;
  });

  const moedaFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const usuariosPermitidos = {
    tarcisio: { senha: '123', nome: 'Tarcisio' },
    lucas: { senha: '123', nome: 'Lucas' }
  };

  const LOGIN_STORAGE_KEY = 'sgpj-dashboard-usuario';
  const THEME_STORAGE_KEY = 'sgpj-dashboard-tema';

  let processos = [];
  let filtrosAtivos = {
    status: 'all',
    search: '',
    sort: 'recent'
  };

  let columnElements = new Map();
  let statusFilter;
  let sortFilter;
  let searchInput;
  let clearFiltersButton;
  let totalProcessosChip;
  let loggedUserLabel;
  let loginScreen;
  let appShell;
  let loginForm;
  let loginError;
  let loginUsername;
  let loginPassword;
  let loginRemember;
  let drawerToggleButton;
  let drawerOverlay;
  let sideDrawer;
  let drawerCloseButton;
  let drawerActionButtons = [];
  let settingsPanel;
  let settingsButton;
  let themeToggle;
  let usuarioAtual = null;
  let appInitialized = false;
  let viewToggleButtons = [];
  let reloadButton;
  let boardView;
  let listView;
  let exportButton;
  let exportSettingsButton;
  let exportPopover;
  let exportPopoverClose;
  let exportOrderInputs = [];
  let exportOrder = 'valor-desc';
  let exportPopoverOpen = false;
  let viewState = { board: true, list: false };
  let temaAtual = 'light';
  let valorSortToggleButton = null;
  let cardMenuAberto = null;
  let processoEmArraste = null;
  let columnDropZones = new Map();

  document.addEventListener('DOMContentLoaded', prepararInterface);

  function prepararInterface() {
    loginScreen = document.getElementById('login-screen');
    appShell = document.getElementById('app-shell');
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');
    loginUsername = document.getElementById('login-username');
    loginPassword = document.getElementById('login-password');
    loginRemember = document.getElementById('login-remember');
    loggedUserLabel = document.getElementById('logged-user');

    drawerToggleButton = document.querySelector('[data-drawer-toggle]');
    drawerOverlay = document.getElementById('drawer-overlay');
    sideDrawer = document.getElementById('side-drawer');
    drawerCloseButton = document.getElementById('drawer-close');
    drawerActionButtons = Array.from(document.querySelectorAll('[data-drawer-action]'));
    settingsPanel = document.getElementById('drawer-settings');
    settingsButton = document.querySelector('[data-drawer-action="settings"]');
    themeToggle = document.getElementById('theme-toggle');
    viewToggleButtons = Array.from(document.querySelectorAll('[data-view-toggle]'));
    reloadButton = document.querySelector('[data-reload]');
    boardView = document.getElementById('board-view');
    listView = document.getElementById('board-list');
    exportButton = document.querySelector('[data-export]');
    exportSettingsButton = document.querySelector('[data-export-settings]');
    exportPopover = document.getElementById('export-popover');
    exportPopoverClose = exportPopover
      ? exportPopover.querySelector('[data-export-close]')
      : null;
    exportOrderInputs = exportPopover
      ? Array.from(exportPopover.querySelectorAll('input[name="export-order"]'))
      : [];

    atualizarVisibilidadeVisualizacao();
    atualizarBotoesVisualizacao();

    aplicarTema(recuperarTemaPreferido() || 'light');

    if (themeToggle) {
      themeToggle.checked = temaAtual === 'dark';
      themeToggle.addEventListener('change', function () {
        const novoTema = themeToggle.checked ? 'dark' : 'light';
        aplicarTema(novoTema);
        salvarTemaPreferido(novoTema);
      });
    }

    configurarLogin();
    configurarMenuLateral();

    const usuarioPersistido = recuperarSessao();
    if (usuarioPersistido) {
      if (loginRemember) {
        loginRemember.checked = true;
      }
      concluirLogin(usuarioPersistido, { silencioso: true });
      return;
    }

    if (loginUsername) {
      loginUsername.focus();
    }
  }

  function configurarLogin() {
    if (!loginForm) {
      inicializarAplicacao();
      return;
    }

    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const usuario = loginUsername ? loginUsername.value.trim().toLowerCase() : '';
      const senha = loginPassword ? loginPassword.value.trim().toLowerCase() : '';
      const dadosUsuario = validarCredenciais(usuario, senha);

      if (dadosUsuario) {
        const deveLembrar = loginRemember ? loginRemember.checked : false;
        if (deveLembrar) {
          armazenarSessao(dadosUsuario.username);
        } else {
          removerSessao();
        }
        concluirLogin(dadosUsuario);
        limparMensagemErroLogin();
        return;
      }

      exibirErroLogin('Usuário ou senha inválidos.');
      if (loginPassword) {
        loginPassword.value = '';
        loginPassword.focus();
      }
    });

    [loginUsername, loginPassword].forEach(function (campo) {
      if (!campo) {
        return;
      }
      campo.addEventListener('input', limparMensagemErroLogin);
    });
  }

  function validarCredenciais(usuario, senha) {
    if (!usuario || !senha) {
      return null;
    }
    const credencial = usuariosPermitidos[usuario];
    if (!credencial) {
      return null;
    }
    const senhaEsperada = (credencial.senha || '').toLowerCase();
    if (senhaEsperada !== senha.toLowerCase()) {
      return null;
    }
    return obterDadosUsuario(usuario);
  }

  function concluirLogin(dadosUsuario, opcoes) {
    if (!dadosUsuario) {
      return;
    }

    usuarioAtual = dadosUsuario;

    if (loginScreen) {
      loginScreen.classList.add('is-hidden');
      loginScreen.setAttribute('aria-hidden', 'true');
    }

    if (appShell) {
      appShell.hidden = false;
      requestAnimationFrame(function () {
        appShell.classList.add('is-visible');
      });
    }

    if (drawerToggleButton) {
      drawerToggleButton.setAttribute('aria-expanded', 'false');
    }

    if (loggedUserLabel) {
      const destaque = loggedUserLabel.querySelector('strong');
      if (destaque) {
        destaque.textContent = dadosUsuario.nome;
      } else {
        loggedUserLabel.textContent = 'Olá, ' + dadosUsuario.nome;
      }
      loggedUserLabel.hidden = false;
    }

    if (!(opcoes && opcoes.silencioso) && loginForm) {
      loginForm.reset();
    }

    inicializarAplicacao();
  }

  function armazenarSessao(usuario) {
    if (typeof window === 'undefined' || !usuario) {
      return;
    }
    try {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, usuario);
    } catch (erro) {
      console.warn('Não foi possível persistir a sessão.', erro);
    }
  }

  function recuperarSessao() {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const usuario = window.localStorage.getItem(LOGIN_STORAGE_KEY);
      return obterDadosUsuario(usuario);
    } catch (erro) {
      return null;
    }
  }

  function removerSessao() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
    } catch (erro) {
      console.warn('Não foi possível remover a sessão.', erro);
    }
  }

  function salvarTemaPreferido(tema) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, tema === 'dark' ? 'dark' : 'light');
    } catch (erro) {
      console.warn('Não foi possível salvar o tema preferido.', erro);
    }
  }

  function recuperarTemaPreferido() {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (erro) {
      return null;
    }
  }

  function limparMensagemErroLogin() {
    if (loginError) {
      loginError.textContent = '';
    }
  }

  function exibirErroLogin(mensagem) {
    if (loginError) {
      loginError.textContent = mensagem;
    }
  }

  function obterDadosUsuario(usuario) {
    if (!usuario) {
      return null;
    }
    const credencial = usuariosPermitidos[usuario];
    if (!credencial) {
      return null;
    }
    return {
      username: usuario,
      nome: credencial.nome || capitalizar(usuario)
    };
  }

  function inicializarAplicacao() {
    if (appInitialized) {
      return;
    }

    columnElements = new Map(
      Array.from(document.querySelectorAll('.board-column')).map(function (column) {
        return [column.getAttribute('data-column'), column];
      })
    );
    configurarAreasDeSoltar();

    statusFilter = document.getElementById('status-filter');
    sortFilter = document.getElementById('sort-filter');
    searchInput = document.getElementById('search-input');
    clearFiltersButton = document.getElementById('clear-filters');
    totalProcessosChip = document.getElementById('total-processos');
    boardView = boardView || document.getElementById('board-view');
    listView = listView || document.getElementById('board-list');

    carregarProcessos();
    registrarEventos();
    appInitialized = true;
    alternarVisualizacao(currentView);
  }

  function configurarMenuLateral() {
    if (drawerToggleButton) {
      drawerToggleButton.addEventListener('click', function () {
        if (sideDrawer && sideDrawer.classList.contains('is-open')) {
          fecharMenuLateral();
        } else {
          abrirMenuLateral();
        }
      });
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', fecharMenuLateral);
    }

    if (drawerCloseButton) {
      drawerCloseButton.addEventListener('click', fecharMenuLateral);
    }

    drawerActionButtons.forEach(function (botao) {
      botao.addEventListener('click', function () {
        const acao = botao.getAttribute('data-drawer-action');
        tratarAcaoMenu(acao);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sideDrawer && sideDrawer.classList.contains('is-open')) {
        fecharMenuLateral();
      }
    });
  }

  function abrirMenuLateral() {
    if (!sideDrawer) {
      return;
    }

    ocultarConfiguracoes();

    sideDrawer.classList.add('is-open');
    sideDrawer.setAttribute('aria-hidden', 'false');

    if (drawerOverlay) {
      drawerOverlay.hidden = false;
    }

    if (drawerToggleButton) {
      drawerToggleButton.setAttribute('aria-expanded', 'true');
    }

    document.body.classList.add('drawer-open');

    const primeiroLink = sideDrawer.querySelector('.side-drawer__link');
    if (primeiroLink) {
      primeiroLink.focus();
    }
  }

  function fecharMenuLateral() {
    if (!sideDrawer) {
      return;
    }

    sideDrawer.classList.remove('is-open');
    sideDrawer.setAttribute('aria-hidden', 'true');

    if (drawerOverlay) {
      drawerOverlay.hidden = true;
    }

    if (drawerToggleButton) {
      drawerToggleButton.setAttribute('aria-expanded', 'false');
      drawerToggleButton.focus();
    }

    document.body.classList.remove('drawer-open');
    ocultarConfiguracoes();
  }

  function tratarAcaoMenu(acao) {
    switch (acao) {
      case 'home':
        fecharMenuLateral();
        if (typeof window !== 'undefined') {
          const destino = window.location.pathname ? window.location.pathname.split('#')[0] : 'index.html';
          window.location.assign(destino || 'index.html');
        }
        break;
      case 'logout':
        fecharMenuLateral();
        encerrarSessao();
        break;
      case 'settings':
        alternarConfiguracoes();
        break;
      default:
        fecharMenuLateral();
        break;
    }
  }

  function alternarConfiguracoes() {
    if (!settingsPanel) {
      return;
    }

    if (settingsPanel.hasAttribute('hidden')) {
      mostrarConfiguracoes();
    } else {
      ocultarConfiguracoes();
    }
  }

  function mostrarConfiguracoes() {
    if (!settingsPanel) {
      return;
    }

    settingsPanel.removeAttribute('hidden');
    settingsPanel.setAttribute('aria-hidden', 'false');
    settingsPanel.classList.add('is-visible');

    if (settingsButton) {
      settingsButton.setAttribute('aria-expanded', 'true');
    }

    if (themeToggle) {
      themeToggle.focus();
    }
  }

  function ocultarConfiguracoes() {
    if (!settingsPanel) {
      return;
    }

    settingsPanel.setAttribute('hidden', '');
    settingsPanel.setAttribute('aria-hidden', 'true');
    settingsPanel.classList.remove('is-visible');

    if (settingsButton) {
      settingsButton.setAttribute('aria-expanded', 'false');
    }
  }

  function encerrarSessao() {
    removerSessao();
    usuarioAtual = null;

    if (appShell) {
      appShell.classList.remove('is-visible');
      appShell.hidden = true;
    }

    if (sideDrawer) {
      sideDrawer.classList.remove('is-open');
      sideDrawer.setAttribute('aria-hidden', 'true');
    }

    if (loginScreen) {
      loginScreen.classList.remove('is-hidden');
      loginScreen.removeAttribute('aria-hidden');
    }

    if (loggedUserLabel) {
      loggedUserLabel.hidden = true;
    }

    if (drawerOverlay) {
      drawerOverlay.hidden = true;
    }

    document.body.classList.remove('drawer-open');
    ocultarConfiguracoes();

    if (drawerToggleButton) {
      drawerToggleButton.setAttribute('aria-expanded', 'false');
    }

    if (loginForm) {
      loginForm.reset();
    }

    limparMensagemErroLogin();

    if (loginUsername) {
      loginUsername.focus();
    }
  }

  function aplicarTema(tema) {
    temaAtual = tema === 'dark' ? 'dark' : 'light';

    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (root) {
      root.style.colorScheme = temaAtual === 'dark' ? 'dark' : 'light';
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('theme-dark', temaAtual === 'dark');
    }

    if (themeToggle) {
      const ativo = temaAtual === 'dark';
      themeToggle.checked = ativo;
      themeToggle.setAttribute('aria-checked', ativo ? 'true' : 'false');
    }
  }

  function carregarProcessos() {
    fetch('./processos.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Não foi possível carregar os processos.');
        }
        return response.json();
      })
      .then(function (dados) {
        prepararProcessos(dados);
      })
      .catch(function (erro) {
        console.warn('Falha ao obter processos via fetch, tentando dados incorporados.', erro);
        const dadosIncorporados = obterDadosIncorporados();
        if (dadosIncorporados) {
          prepararProcessos(dadosIncorporados);
          return;
        }
        exibirMensagemErro('Não foi possível carregar os processos.');
      });

  }

  function obterDadosIncorporados() {
    if (typeof window !== 'undefined' && Array.isArray(window.PROCESSOS_DATA)) {
      return window.PROCESSOS_DATA;
    }
    return null;
  }

  function prepararProcessos(dados) {
    if (!Array.isArray(dados)) {
      exibirMensagemErro('Não foi possível carregar os processos.');
      return;
    }

    processos = dados.map(function (processo, index) {
      const statusNormalizado = normalizarStatus(processo.status);
      const baseProcesso = Object.assign({}, processo, { status: statusNormalizado });
      const valorNumerico = parseCurrency(processo.valor_causa);
      const etapa = determinarEtapa(baseProcesso, index, columns);

      return Object.assign({}, baseProcesso, {
        etapa: etapa,
        etapaNome: obterNomeEtapa(etapa, columns),
        valorNumerico: valorNumerico,
        valorFormatado: Number.isFinite(valorNumerico)
          ? moedaFormatter.format(valorNumerico)
          : processo.valor_causa
      });
    });

    popularFiltroStatus(processos, statusFilter);
    renderizarQuadro();
  }

  function registrarEventos() {
    if (statusFilter) {
      statusFilter.addEventListener('change', function (event) {
        filtrosAtivos.status = event.target.value;
        renderizarQuadro();
      });
    }

    if (sortFilter) {
      sortFilter.addEventListener('change', function (event) {
        filtrosAtivos.sort = event.target.value;
        renderizarQuadro();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function (event) {
        filtrosAtivos.search = event.target.value.trim().toLowerCase();
        renderizarQuadro();
      });
    }

    if (clearFiltersButton) {
      clearFiltersButton.addEventListener('click', function () {
        filtrosAtivos = { status: 'all', search: '', sort: 'recent' };
        if (statusFilter) {
          statusFilter.value = 'all';
        }
        if (sortFilter) {
          sortFilter.value = 'recent';
        }
        if (searchInput) {
          searchInput.value = '';
        }
        renderizarQuadro();
      });
    }

    viewToggleButtons.forEach(function (botao) {
      botao.addEventListener('click', function () {
        const destino = botao.getAttribute('data-view-toggle');
        alternarVisualizacao(destino);
      });
    });

    if (exportButton) {
      exportButton.addEventListener('click', function () {
        exportarProcessos();
      });
    }

    if (exportSettingsButton) {
      exportSettingsButton.addEventListener('click', function () {
        alternarPopoverExportacao();
      });
    }

    if (exportPopoverClose) {
      exportPopoverClose.addEventListener('click', function () {
        fecharPopoverExportacao();
      });
    }

    exportOrderInputs.forEach(function (input) {
      if (input.value === exportOrder) {
        input.checked = true;
      }
      input.addEventListener('change', function (event) {
        exportOrder = event.target.value;
      });
    });

    document.addEventListener('click', function (event) {
      if (exportPopover && !exportPopover.hidden) {
        const clicouDentroPopover = exportPopover.contains(event.target);
        const clicouNoBotao = exportSettingsButton && exportSettingsButton.contains(event.target);
        if (!clicouDentroPopover && !clicouNoBotao) {
          fecharPopoverExportacao();
        }
      }

      if (cardMenuAberto && cardMenuAberto.container) {
        const clicouNoMenu = cardMenuAberto.container.contains(event.target);
        const clicouNoBotaoMenu = cardMenuAberto.trigger && cardMenuAberto.trigger.contains(event.target);
        if (!clicouNoMenu && !clicouNoBotaoMenu) {
          fecharMenuCard();
        }
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (exportPopover && !exportPopover.hidden) {
          fecharPopoverExportacao();
        }
        if (cardMenuAberto) {
          fecharMenuCard();
        }
      }
    });

    if (reloadButton) {
      reloadButton.addEventListener('click', function () {
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
      });
    }
  }

  function renderizarQuadro() {
    fecharMenuCard();
    limparDestaquesDeSoltar();
    const comparator = obterComparador(filtrosAtivos.sort);
    const processosFiltrados = obterProcessosFiltrados();

    const contagemTotal = processosFiltrados.length;
    if (totalProcessosChip) {
      totalProcessosChip.textContent = contagemTotal +
        ' processo' + (contagemTotal === 1 ? '' : 's');
    }

    renderizarLista(processosFiltrados, comparator);

    const processosPorColuna = agruparPorColuna(processosFiltrados, comparator, columns);

    columns.forEach(function (column) {
      const id = column.id;
      const coluna = columnElements.get(id);
      if (!coluna) {
        return;
      }

      const lista = coluna.querySelector('.column-cards');
      const contador = coluna.querySelector('[data-count]');
      const itens = processosPorColuna.get(id) || [];

      lista.innerHTML = '';

      if (!itens.length) {
        const vazio = document.createElement('div');
        vazio.className = 'empty-column';
        vazio.textContent = 'Nenhum processo nesta etapa.';
        lista.appendChild(vazio);
      } else {
        itens.forEach(function (processo) {
          lista.appendChild(criarCardProcesso(processo));
        });
      }

      if (contador) {
        contador.textContent = itens.length;
      }
    });
  }

  function obterProcessosFiltrados() {
    return processos
      .filter(function (processo) {
        return filtrarPorStatus(processo, filtrosAtivos.status);
      })
      .filter(function (processo) {
        return filtrarPorPesquisa(processo, filtrosAtivos.search);
      });
  }

  function agruparPorColuna(processosFiltrados, comparator, columnsReference) {
    const mapa = new Map(columnsReference.map(function (coluna) {
      return [coluna.id, []];
    }));

    processosFiltrados.forEach(function (processo) {
      const colunaAtual = mapa.get(processo.etapa);
      if (!colunaAtual) {
        mapa.set(processo.etapa, [processo]);
        return;
      }
      colunaAtual.push(processo);
    });

    mapa.forEach(function (itens) {
      itens.sort(comparator);
    });

    return mapa;
  }

  function filtrarPorStatus(processo, statusAtual) {
    if (statusAtual === 'all') {
      return true;
    }
    const statusProcesso = normalizarStatus(processo.status);
    return statusProcesso === normalizarStatus(statusAtual);
  }

  function filtrarPorPesquisa(processo, termo) {
    if (!termo) {
      return true;
    }

    const campos = [
      processo.nome_reu,
      processo.cpf_cnpj_reu,
      processo.numero_processo,
      processo.status
    ]
      .filter(function (valor) {
        return Boolean(valor);
      })
      .map(function (valor) {
        return valor.toString().toLowerCase();
      });

    return campos.some(function (campo) {
      return campo.indexOf(termo) !== -1;
    });
  }

  function obterComparador(tipoOrdenacao) {
    switch (tipoOrdenacao) {
      case 'valor-desc':
        return function (a, b) {
          return (b.valorNumerico || 0) - (a.valorNumerico || 0);
        };
      case 'valor-asc':
        return function (a, b) {
          return (a.valorNumerico || 0) - (b.valorNumerico || 0);
        };
      case 'alfabetico':
        return function (a, b) {
          return a.nome_reu.localeCompare(b.nome_reu, 'pt');
        };
      case 'recent':
      default:
        return function (a, b) {
          return (b.id || 0) - (a.id || 0);
        };
    }
  }

  function criarCardProcesso(processo) {
    const card = document.createElement('article');
    card.className = 'deal-card';
    card.setAttribute('role', 'listitem');
    if (processo && processo.id) {
      card.dataset.processoId = processo.id;
    }
    card.draggable = true;
    card.addEventListener('dragstart', function (event) {
      processoEmArraste = processo;
      fecharMenuCard();
      card.classList.add('deal-card--dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(
          'text/plain',
          processo.id || processo.numero_processo || processo.nome_reu || ''
        );
      }
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('deal-card--dragging');
      processoEmArraste = null;
      limparDestaquesDeSoltar();
    });

    const cabecalho = document.createElement('header');
    cabecalho.className = 'deal-card__header';

    const status = document.createElement('span');
    status.className = 'deal-card__status status-chip';
    aplicarClasseStatus(status, processo.status);
    status.textContent = obterRotuloStatus(processo.status);

    const valor = document.createElement('span');
    valor.className = 'deal-card__value';
    valor.textContent = processo.valorFormatado || '—';

    cabecalho.append(status, valor);

    const titulo = document.createElement('h3');
    titulo.className = 'deal-card__title';
    titulo.textContent = processo.nome_reu || 'Cliente sem nome';
    titulo.title = processo.nome_reu || '';

    const meta = document.createElement('div');
    meta.className = 'deal-card__meta';

    const processoSpan = document.createElement('span');
    const processoLabel = document.createElement('strong');
    processoLabel.textContent = 'Processo:';
    processoSpan.append(
      processoLabel,
      document.createTextNode(' ' + formatarNumeroProcesso(processo.numero_processo))
    );

    const documentoSpan = document.createElement('span');
    const documentoLabel = document.createElement('strong');
    documentoLabel.textContent = 'CPF/CNPJ:';
    documentoSpan.append(
      documentoLabel,
      document.createTextNode(' ' + (processo.cpf_cnpj_reu || 'Não informado'))
    );

    meta.append(processoSpan, documentoSpan);

    const rodape = document.createElement('footer');
    rodape.className = 'deal-card__footer';

    const etapaPill = document.createElement('span');
    etapaPill.className = 'card-pill';
    etapaPill.textContent = processo.etapaNome;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const visualizar = document.createElement('button');
    visualizar.type = 'button';
    visualizar.setAttribute('aria-label', 'Abrir detalhes do processo ' + processo.numero_processo);
    visualizar.textContent = '👁';

    const lembrar = document.createElement('button');
    lembrar.type = 'button';
    lembrar.setAttribute('aria-label', 'Adicionar lembrete para ' + (processo.nome_reu || 'o cliente'));
    lembrar.textContent = '⏰';

    const menu = document.createElement('button');
    menu.type = 'button';
    menu.setAttribute('aria-label', 'Mais opções para ' + (processo.nome_reu || 'o cliente'));
    menu.setAttribute('aria-haspopup', 'true');
    menu.setAttribute('aria-expanded', 'false');
    menu.dataset.cardMenuTrigger = 'true';
    menu.className = 'card-menu__trigger';
    menu.textContent = '⋯';
    menu.addEventListener('click', function (event) {
      event.stopPropagation();
      alternarMenuCard(processo, menu, card);
    });
    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        alternarMenuCard(processo, menu, card);
      }
    });

    actions.append(visualizar, lembrar, menu);
    rodape.append(etapaPill, actions);

    card.append(cabecalho, titulo, meta, rodape);
    return card;
  }

  function alternarMenuCard(processo, trigger, card) {
    if (cardMenuAberto && cardMenuAberto.trigger === trigger) {
      fecharMenuCard();
      return;
    }

    abrirMenuCard(processo, trigger, card);
  }

  function abrirMenuCard(processo, trigger, card) {
    if (!card) {
      return;
    }

    fecharMenuCard();

    const menu = document.createElement('div');
    menu.className = 'card-menu';
    menu.setAttribute('role', 'menu');
    menu.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    const lista = document.createElement('ul');
    lista.className = 'card-menu__list';
    lista.setAttribute('role', 'none');

    const editarItem = document.createElement('li');
    editarItem.setAttribute('role', 'none');
    const editarBotao = document.createElement('button');
    editarBotao.type = 'button';
    editarBotao.className = 'card-menu__button';
    editarBotao.textContent = 'Editar';
    editarBotao.setAttribute('role', 'menuitem');
    editarBotao.addEventListener('click', function () {
      fecharMenuCard();
    });
    editarItem.appendChild(editarBotao);

    const moverItem = document.createElement('li');
    moverItem.setAttribute('role', 'none');
    const moverBotao = document.createElement('button');
    moverBotao.type = 'button';
    moverBotao.className = 'card-menu__button';
    moverBotao.textContent = 'Mover';
    moverBotao.setAttribute('role', 'menuitem');
    moverBotao.setAttribute('aria-haspopup', 'true');
    moverBotao.setAttribute('aria-expanded', 'false');

    const moverSubmenu = document.createElement('div');
    moverSubmenu.className = 'card-menu__submenu';
    moverSubmenu.hidden = true;

    const moverSelect = document.createElement('select');
    moverSelect.className = 'card-menu__select';
    columns.forEach(function (coluna) {
      const option = document.createElement('option');
      option.value = coluna.id;
      option.textContent = coluna.label;
      moverSelect.appendChild(option);
    });
    moverSelect.value = processo.etapa || columns[0].id;

    const moverConfirmar = document.createElement('button');
    moverConfirmar.type = 'button';
    moverConfirmar.className = 'card-menu__confirm';
    moverConfirmar.textContent = 'Mover';
    moverConfirmar.addEventListener('click', function () {
      moverProcessoParaEtapa(processo, moverSelect.value);
      fecharMenuCard();
    });

    moverSubmenu.append(moverSelect, moverConfirmar);

    moverBotao.addEventListener('click', function (event) {
      event.stopPropagation();
      const estavaFechado = moverSubmenu.hidden;
      moverSubmenu.hidden = !estavaFechado;
      moverBotao.setAttribute('aria-expanded', estavaFechado ? 'true' : 'false');
      if (estavaFechado) {
        moverSelect.focus();
      }
    });

    moverItem.append(moverBotao, moverSubmenu);

    const excluirItem = document.createElement('li');
    excluirItem.setAttribute('role', 'none');
    const excluirBotao = document.createElement('button');
    excluirBotao.type = 'button';
    excluirBotao.className = 'card-menu__button card-menu__button--danger';
    excluirBotao.textContent = 'Excluir';
    excluirBotao.setAttribute('role', 'menuitem');
    excluirBotao.addEventListener('click', function () {
      const confirmou = window.confirm(
        'Esta ação é permanente. Deseja realmente excluir este processo?'
      );
      if (confirmou) {
        excluirProcesso(processo);
        fecharMenuCard();
      }
    });
    excluirItem.appendChild(excluirBotao);

    lista.append(editarItem, moverItem, excluirItem);
    menu.appendChild(lista);

    card.appendChild(menu);
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }

    cardMenuAberto = {
      container: menu,
      trigger: trigger,
      moverSubmenu: moverSubmenu,
      moverBotao: moverBotao
    };
  }

  function fecharMenuCard() {
    if (!cardMenuAberto) {
      return;
    }

    if (cardMenuAberto.trigger) {
      cardMenuAberto.trigger.setAttribute('aria-expanded', 'false');
    }

    if (cardMenuAberto.moverSubmenu) {
      cardMenuAberto.moverSubmenu.hidden = true;
    }

    if (cardMenuAberto.container && cardMenuAberto.container.parentNode) {
      cardMenuAberto.container.parentNode.removeChild(cardMenuAberto.container);
    }

    cardMenuAberto = null;
  }

  function moverProcessoParaEtapa(processo, novaEtapa) {
    if (!processo || !novaEtapa || !columnElements.has(novaEtapa)) {
      return;
    }

    processo.etapa = novaEtapa;
    processo.etapaNome = obterNomeEtapa(novaEtapa, columns);
    renderizarQuadro();
  }

  function excluirProcesso(processo) {
    const indice = processos.indexOf(processo);
    if (indice === -1) {
      return;
    }
    processos.splice(indice, 1);
    renderizarQuadro();
  }

  function configurarAreasDeSoltar() {
    columnDropZones = new Map();

    columnElements.forEach(function (coluna, id) {
      const zona = coluna ? coluna.querySelector('.column-cards') : null;
      if (!zona) {
        return;
      }

      zona.dataset.dropColumn = id;

      zona.addEventListener('dragover', function (event) {
        if (!processoEmArraste) {
          return;
        }
        event.preventDefault();
        zona.classList.add('column-cards--over');
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'move';
        }
      });

      zona.addEventListener('dragenter', function (event) {
        if (!processoEmArraste) {
          return;
        }
        event.preventDefault();
        zona.classList.add('column-cards--over');
      });

      zona.addEventListener('dragleave', function () {
        if (!processoEmArraste) {
          return;
        }
        zona.classList.remove('column-cards--over');
      });

      zona.addEventListener('drop', function (event) {
        if (!processoEmArraste) {
          return;
        }
        event.preventDefault();
        zona.classList.remove('column-cards--over');
        const destino = zona.dataset.dropColumn;
        moverProcessoParaEtapa(processoEmArraste, destino);
        processoEmArraste = null;
      });

      columnDropZones.set(id, zona);
    });
  }

  function limparDestaquesDeSoltar() {
    columnDropZones.forEach(function (zona) {
      zona.classList.remove('column-cards--over');
    });
  }

  function renderizarLista(processosFiltrados, comparator) {
    if (!listView) {
      return;
    }

    listView.innerHTML = '';

    if (!processosFiltrados.length) {
      const vazio = document.createElement('div');
      vazio.className = 'board-list__empty';
      vazio.textContent = 'Nenhum processo encontrado.';
      listView.appendChild(vazio);
      return;
    }

    const tabela = document.createElement('table');
    tabela.className = 'board-list__table';

    const cabecalho = document.createElement('thead');
    const linhaCabecalho = document.createElement('tr');
    const colunasLista = [
      { id: 'id', label: 'ID' },
      { id: 'numero', label: 'Nº Processo' },
      { id: 'reu', label: 'Réu' },
      { id: 'documento', label: 'CPF/CNPJ' },
      { id: 'valor', label: 'Valor da Causa (R$)', ordenavel: true },
      { id: 'status', label: 'Status' }
    ];

    valorSortToggleButton = null;

    colunasLista.forEach(function (coluna) {
      const th = document.createElement('th');
      th.scope = 'col';

      if (coluna.ordenavel) {
        const wrapper = document.createElement('span');
        wrapper.className = 'table-sortable';

        const rotulo = document.createElement('span');
        rotulo.textContent = coluna.label;

        const botaoOrdenacao = document.createElement('button');
        botaoOrdenacao.type = 'button';
        botaoOrdenacao.className = 'table-sort-toggle';
        botaoOrdenacao.setAttribute('aria-label', 'Alternar ordenação por valor da causa');
        botaoOrdenacao.setAttribute('aria-pressed', 'false');
        botaoOrdenacao.dataset.direction = 'desc';
        botaoOrdenacao.dataset.active = 'false';

        botaoOrdenacao.addEventListener('click', function (event) {
          event.stopPropagation();
          const atual = filtrosAtivos.sort;
          const proximo = atual === 'valor-asc' ? 'valor-desc' : 'valor-asc';
          filtrosAtivos.sort = proximo;
          if (sortFilter) {
            sortFilter.value = proximo;
          }
          renderizarQuadro();
        });

        valorSortToggleButton = botaoOrdenacao;
        wrapper.append(rotulo, botaoOrdenacao);
        th.appendChild(wrapper);
      } else {
        th.textContent = coluna.label;
      }

      linhaCabecalho.appendChild(th);
    });
    cabecalho.appendChild(linhaCabecalho);

    const corpo = document.createElement('tbody');
    const itensOrdenados = processosFiltrados.slice().sort(comparator);

    itensOrdenados.forEach(function (processo) {
      const linha = document.createElement('tr');

      const celulaId = document.createElement('td');
      celulaId.textContent = processo.id || '—';

      const celulaNumero = document.createElement('td');
      celulaNumero.textContent = formatarNumeroProcesso(processo.numero_processo);

      const celulaReu = document.createElement('td');
      celulaReu.textContent = processo.nome_reu || 'Cliente sem nome';

      const celulaDocumento = document.createElement('td');
      celulaDocumento.textContent = processo.cpf_cnpj_reu || 'Não informado';

      const celulaValor = document.createElement('td');
      celulaValor.textContent = processo.valorFormatado || processo.valor_causa || '—';

      const celulaStatus = document.createElement('td');
      const seletorStatus = document.createElement('select');
      seletorStatus.className = 'status-select status-chip';
      aplicarClasseStatus(seletorStatus, processo.status);
      seletorStatus.setAttribute(
        'aria-label',
        'Alterar status do processo ' + formatarNumeroProcesso(processo.numero_processo)
      );

      STATUS_OPTIONS.forEach(function (option) {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        seletorStatus.appendChild(optionElement);
      });

      seletorStatus.value = processo.status || STATUS_OPTIONS[0].value;

      seletorStatus.addEventListener('change', function (event) {
        const novoStatus = event.target.value;
        aplicarClasseStatus(seletorStatus, novoStatus);
        atualizarStatusProcesso(processo, novoStatus);
      });

      celulaStatus.appendChild(seletorStatus);

      linha.append(celulaId, celulaNumero, celulaReu, celulaDocumento, celulaValor, celulaStatus);
      corpo.appendChild(linha);
    });

    tabela.append(cabecalho, corpo);
    listView.appendChild(tabela);

    atualizarIndicadorOrdenacaoValor();
  }

  function atualizarIndicadorOrdenacaoValor() {
    if (!valorSortToggleButton) {
      return;
    }

    const tipoAtual = filtrosAtivos.sort;
    const ehOrdenacaoPorValor = tipoAtual === 'valor-asc' || tipoAtual === 'valor-desc';
    const direcaoAtual = tipoAtual === 'valor-asc' ? 'asc' : 'desc';
    const proximoTipo = tipoAtual === 'valor-asc' ? 'valor-desc' : 'valor-asc';
    const descricaoAtual = direcaoAtual === 'asc' ? 'menor valor primeiro' : 'maior valor primeiro';
    const descricaoProxima = proximoTipo === 'valor-asc' ? 'menor valor primeiro' : 'maior valor primeiro';

    valorSortToggleButton.dataset.active = ehOrdenacaoPorValor ? 'true' : 'false';
    valorSortToggleButton.dataset.direction = ehOrdenacaoPorValor ? direcaoAtual : 'desc';
    valorSortToggleButton.setAttribute('aria-pressed', ehOrdenacaoPorValor ? 'true' : 'false');
    valorSortToggleButton.setAttribute(
      'title',
      ehOrdenacaoPorValor
        ? 'Ordenando por ' + descricaoAtual
        : 'Ordenar por valor da causa'
    );
    valorSortToggleButton.setAttribute(
      'aria-label',
      ehOrdenacaoPorValor
        ? 'Alterar para ' + descricaoProxima
        : 'Ordenar por valor da causa (' + descricaoProxima + ')'
    );
  }

  function atualizarStatusProcesso(processo, novoStatus) {
    const statusNormalizado = normalizarStatus(novoStatus);
    processo.status = statusNormalizado;

    const indiceOriginal = processos.indexOf(processo);
    const etapaAtualizada = determinarEtapa(
      processo,
      indiceOriginal >= 0 ? indiceOriginal : 0,
      columns
    );

    processo.etapa = etapaAtualizada;
    processo.etapaNome = obterNomeEtapa(etapaAtualizada, columns);

    renderizarQuadro();
  }

  function parseCurrency(valor) {
    if (!valor) {
      return NaN;
    }
    const normalizado = valor
      .toString()
      .replace(/[^0-9,-]+/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return Number.parseFloat(normalizado);
  }

  function determinarEtapa(processo, indice, columnsReference) {
    const statusNormalizado = normalizarStatus(processo.status);

    if (statusNormalizado === 'finalizado') {
      return 'finalizados';
    }
    if (statusNormalizado === 'perdido') {
      return 'aguardando';
    }
    if (statusNormalizado === 'pendente') {
      return 'em-atendimento';
    }

    if (statusNormalizado.indexOf('aguard') !== -1) {
      return 'aguardando';
    }
    if (statusNormalizado.indexOf('aprov') !== -1) {
      return 'orcamento-aprovado';
    }
    if (statusNormalizado.indexOf('orç') !== -1 || statusNormalizado.indexOf('orc') !== -1) {
      return 'orcamento-proposta';
    }
    if (statusNormalizado.indexOf('atend') !== -1) {
      return 'em-atendimento';
    }

    const indiceSeguro = typeof indice === 'number' && indice >= 0 ? indice : 0;
    const colunaAlternativa = columnsReference[indiceSeguro % columnsReference.length];
    return colunaAlternativa ? colunaAlternativa.id : columnsReference[0].id;
  }

  function obterNomeEtapa(id, columnsReference) {
    for (let i = 0; i < columnsReference.length; i += 1) {
      if (columnsReference[i].id === id) {
        return columnsReference[i].label;
      }
    }
    return 'Etapa não definida';
  }

  function popularFiltroStatus(listaProcessos, selectElement) {
    if (!selectElement) {
      return;
    }

    const valorAtual = selectElement.value || 'all';

    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    const statusMap = new Map();
    STATUS_OPTIONS.forEach(function (option) {
      statusMap.set(option.value, option.label);
    });

    listaProcessos
      .map(function (processo) {
        return normalizarStatus(processo.status);
      })
      .filter(function (status) {
        return Boolean(status);
      })
      .forEach(function (status) {
        if (!statusMap.has(status)) {
          statusMap.set(status, obterRotuloStatus(status));
        }
      });

    statusMap.forEach(function (label, value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      selectElement.appendChild(option);
    });

    if (valorAtual !== 'all' && statusMap.has(valorAtual)) {
      selectElement.value = valorAtual;
    }
  }

  function aplicarClasseStatus(elemento, status) {
    if (!elemento || !elemento.classList) {
      return;
    }

    STATUS_CLASS_NAMES.forEach(function (classe) {
      elemento.classList.remove(classe);
    });

    const statusNormalizado = normalizarStatus(status);
    elemento.classList.add(STATUS_CLASS_PREFIX + statusNormalizado);
  }

  function obterRotuloStatus(status) {
    const statusNormalizado = normalizarStatus(status);
    for (let i = 0; i < STATUS_OPTIONS.length; i += 1) {
      if (STATUS_OPTIONS[i].value === statusNormalizado) {
        return STATUS_OPTIONS[i].label;
      }
    }
    return capitalizar(statusNormalizado);
  }

  function normalizarStatus(status) {
    if (!status && status !== 0) {
      return STATUS_OPTIONS[0].value;
    }

    const valor = status.toString().trim().toLowerCase();
    if (!valor) {
      return STATUS_OPTIONS[0].value;
    }

    for (let i = 0; i < STATUS_OPTIONS.length; i += 1) {
      if (STATUS_OPTIONS[i].value === valor) {
        return STATUS_OPTIONS[i].value;
      }
    }

    if (valor.indexOf('final') !== -1) {
      return 'finalizado';
    }
    if (valor.indexOf('perd') !== -1) {
      return 'perdido';
    }
    if (valor.indexOf('pend') !== -1) {
      return 'pendente';
    }

    return STATUS_OPTIONS[0].value;
  }

  function exportarProcessos() {
    const processosParaExportar = obterProcessosFiltrados();
    if (!processosParaExportar.length) {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Nenhum processo disponível para exportação.');
      }
      return;
    }

    const comparator = obterComparador(exportOrder);
    const dadosOrdenados = processosParaExportar.slice().sort(comparator);
    const cabecalho = [
      'ID',
      'Nº Processo',
      'Réu',
      'CPF/CNPJ',
      'Valor da Causa (R$)',
      'Status'
    ];

    const linhas = dadosOrdenados
      .map(function (processo) {
        return [
          processo.id || '',
          formatarNumeroProcesso(processo.numero_processo),
          processo.nome_reu || 'Cliente sem nome',
          processo.cpf_cnpj_reu || 'Não informado',
          processo.valorFormatado || processo.valor_causa || '',
          obterRotuloStatus(processo.status)
        ];
      })
      .map(function (linha) {
        return (
          '<tr>' +
          linha
            .map(function (celula) {
              return '<td>' + escapeHtml(celula) + '</td>';
            })
            .join('') +
          '</tr>'
        );
      })
      .join('');

    const tabelaHTML =
      '<table><thead><tr>' +
      cabecalho
        .map(function (titulo) {
          return '<th>' + escapeHtml(titulo) + '</th>';
        })
        .join('') +
      '</tr></thead><tbody>' +
      linhas +
      '</tbody></table>';

    const blob = new Blob(['\ufeff' + tabelaHTML], {
      type: 'application/vnd.ms-excel'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const hoje = new Date();
    const nomeArquivo = 'processos-' + hoje.toISOString().slice(0, 10) + '.xls';
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    fecharPopoverExportacao();
  }

  function alternarPopoverExportacao() {
    if (!exportPopover) {
      return;
    }

    if (exportPopover.hidden) {
      abrirPopoverExportacao();
      return;
    }

    fecharPopoverExportacao();
  }

  function abrirPopoverExportacao() {
    if (!exportPopover) {
      return;
    }

    exportPopover.hidden = false;
    exportPopoverOpen = true;
    exportPopover.setAttribute('aria-hidden', 'false');

    if (exportSettingsButton) {
      exportSettingsButton.classList.add('is-active');
      exportSettingsButton.setAttribute('aria-expanded', 'true');
    }

    exportOrderInputs.forEach(function (input) {
      input.checked = input.value === exportOrder;
    });
  }

  function fecharPopoverExportacao() {
    if (!exportPopover) {
      return;
    }

    exportPopover.hidden = true;
    exportPopoverOpen = false;
    exportPopover.setAttribute('aria-hidden', 'true');

    if (exportSettingsButton) {
      exportSettingsButton.classList.remove('is-active');
      exportSettingsButton.setAttribute('aria-expanded', 'false');
    }
  }

  function escapeHtml(valor) {
    return valor
      ? valor
          .toString()
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
      : '';
  }

  function capitalizar(texto) {
    return texto
      .split(' ')
      .filter(function (parte) {
        return parte.trim().length > 0;
      })
      .map(function (parte) {
        return parte.charAt(0).toUpperCase() + parte.slice(1);
      })
      .join(' ');
  }

  function formatarNumeroProcesso(numero) {
    if (!numero) {
      return '—';
    }
    return numero.toString().replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function exibirMensagemErro(mensagem) {
    const board = document.querySelector('.board');
    if (!board) {
      return;
    }
    board.innerHTML = '';
    const aviso = document.createElement('div');
    aviso.className = 'empty-column';
    aviso.textContent = mensagem;
    board.appendChild(aviso);
    if (listView) {
      listView.innerHTML = '';
      const avisoLista = document.createElement('div');
      avisoLista.className = 'board-list__empty';
      avisoLista.textContent = mensagem;
      listView.appendChild(avisoLista);
    }
  }

  function alternarVisualizacao(destino) {
    if (destino !== 'list' && destino !== 'board') {
      return;
    }

    const estadoAtual = Boolean(viewState[destino]);
    const outroDestino = destino === 'board' ? 'list' : 'board';

    if (estadoAtual) {
      if (!viewState[outroDestino]) {
        return;
      }
      viewState[destino] = false;
    } else {
      viewState[destino] = true;
    }

    atualizarVisibilidadeVisualizacao();
    atualizarBotoesVisualizacao();
  }

  function atualizarVisibilidadeVisualizacao() {
    if (boardView) {
      boardView.hidden = !viewState.board;
    }
    if (listView) {
      listView.hidden = !viewState.list;
    }
  }

  function atualizarBotoesVisualizacao() {
    viewToggleButtons.forEach(function (botao) {
      const modo = botao.getAttribute('data-view-toggle');
      const ativo = Boolean(viewState[modo]);
      botao.classList.toggle('is-active', ativo);
      botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  }
})();