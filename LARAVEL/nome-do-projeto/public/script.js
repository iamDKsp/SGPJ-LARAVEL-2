(function () {
  const columns = [
    { id: 'em-atendimento', label: 'Em atendimento' },
    { id: 'orcamento-proposta', label: 'Orçamento enviado' },
    { id: 'orcamento-aprovado', label: 'Orçamento aprovado' },
    { id: 'aguardando', label: 'Aguardando retorno' },
    { id: 'finalizados', label: 'Finalizados' }
  ];

  const STATUS_PADROES = ['pendente', 'perdido', 'finalizado'];

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
  let currentView = 'board';
  let temaAtual = 'light';

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
      const valorNumerico = parseCurrency(processo.valor_causa);
      const etapa = determinarEtapa(processo, index, columns);

      return Object.assign({}, processo, {
        indiceOriginal: index,
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

    if (reloadButton) {
      reloadButton.addEventListener('click', function () {
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
      });
    }
  }

  function renderizarQuadro() {
    const comparator = obterComparador(filtrosAtivos.sort);
    const processosFiltrados = processos
      .filter(function (processo) {
        return filtrarPorStatus(processo, filtrosAtivos.status);
      })
      .filter(function (processo) {
        return filtrarPorPesquisa(processo, filtrosAtivos.search);
      });

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
    const statusProcesso = processo.status ? processo.status.toLowerCase() : '';
    return statusProcesso === statusAtual;
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

    const cabecalho = document.createElement('header');
    cabecalho.className = 'deal-card__header';

    const status = document.createElement('span');
    status.className = 'deal-card__status';
    status.textContent = processo.status || 'Sem status';

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
    menu.textContent = '⋯';

    actions.append(visualizar, lembrar, menu);
    rodape.append(etapaPill, actions);

    card.append(cabecalho, titulo, meta, rodape);
    return card;
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
    ['ID', 'Nº Processo', 'Réu', 'CPF/CNPJ', 'Valor da Causa (R$)', 'Status'].forEach(function (titulo) {
      const th = document.createElement('th');
      th.scope = 'col';

      if (titulo === 'Valor da Causa (R$)') {
        const texto = document.createElement('span');
        texto.textContent = titulo;
        th.appendChild(texto);

        const botaoOrdenacao = document.createElement('button');
        botaoOrdenacao.type = 'button';
        botaoOrdenacao.className = 'value-sort-button';
        botaoOrdenacao.setAttribute('aria-label', 'Alternar ordenação por valor da causa');

        const ordenacaoAtual = filtrosAtivos.sort;
        const estaAscendente = ordenacaoAtual === 'valor-asc';
        if (estaAscendente) {
          botaoOrdenacao.classList.add('is-ascending');
        }
        botaoOrdenacao.textContent = estaAscendente ? '▴' : '▾';

        botaoOrdenacao.addEventListener('click', function () {
          let proximaOrdenacao = 'valor-desc';
          if (filtrosAtivos.sort === 'valor-desc') {
            proximaOrdenacao = 'valor-asc';
          } else if (filtrosAtivos.sort === 'valor-asc') {
            proximaOrdenacao = 'valor-desc';
          }

          filtrosAtivos.sort = proximaOrdenacao;
          if (sortFilter) {
            sortFilter.value = proximaOrdenacao;
          }

          renderizarQuadro();
        });

        th.appendChild(botaoOrdenacao);
      } else {
        th.textContent = titulo;
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
      const statusNormalizado = (processo.status || '').toLowerCase();

      const wrapperStatus = document.createElement('div');
      wrapperStatus.className = 'status-editor';

      const seletorStatus = document.createElement('select');
      seletorStatus.className = 'status-selector';
      seletorStatus.setAttribute(
        'aria-label',
        'Alterar status do processo ' + formatarNumeroProcesso(processo.numero_processo)
      );

      const opcoesDisponiveis = STATUS_PADROES.slice();
      if (statusNormalizado && opcoesDisponiveis.indexOf(statusNormalizado) === -1) {
        opcoesDisponiveis.push(statusNormalizado);
      }

      opcoesDisponiveis.forEach(function (status) {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = capitalizar(status);
        seletorStatus.appendChild(option);
      });

      if (statusNormalizado && opcoesDisponiveis.indexOf(statusNormalizado) !== -1) {
        seletorStatus.value = statusNormalizado;
      }

      seletorStatus.addEventListener('change', function (event) {
        atualizarStatusProcesso(processo.id, event.target.value);
      });

      wrapperStatus.appendChild(seletorStatus);
      celulaStatus.appendChild(wrapperStatus);

      linha.append(celulaId, celulaNumero, celulaReu, celulaDocumento, celulaValor, celulaStatus);
      corpo.appendChild(linha);
    });

    tabela.append(cabecalho, corpo);
    listView.appendChild(tabela);
  }

  function atualizarStatusProcesso(id, novoStatus) {
    const statusNormalizado = (novoStatus || '').toLowerCase();
    if (!statusNormalizado) {
      return;
    }

    const processo = processos.find(function (item) {
      return item.id === id;
    });

    if (!processo) {
      return;
    }

    processo.status = statusNormalizado.toUpperCase();

    const indiceReferencia = Number.isInteger(processo.indiceOriginal)
      ? processo.indiceOriginal
      : 0;
    const novaEtapa = determinarEtapa(processo, indiceReferencia, columns);
    processo.etapa = novaEtapa;
    processo.etapaNome = obterNomeEtapa(novaEtapa, columns);

    popularFiltroStatus(processos, statusFilter);
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
    const statusNormalizado = (processo.status || '').toLowerCase();

    if (statusNormalizado.indexOf('perd') !== -1) {
      return 'finalizados';
    }
    if (statusNormalizado.indexOf('final') !== -1) {
      return 'finalizados';
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
    if (statusNormalizado.indexOf('pend') !== -1) {
      return 'em-atendimento';
    }

    const colunaAlternativa = columnsReference[indice % columnsReference.length];
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

    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    const conjuntoStatus = new Set(STATUS_PADROES);

    listaProcessos
      .map(function (processo) {
        return processo.status;
      })
      .filter(function (status) {
        return Boolean(status);
      })
      .map(function (status) {
        return status.toLowerCase();
      })
      .forEach(function (status) {
        conjuntoStatus.add(status);
      });

    const statusOrdenados = Array.from(conjuntoStatus).sort();

    statusOrdenados.forEach(function (status) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = capitalizar(status);
      selectElement.appendChild(option);
    });

    if (filtrosAtivos.status !== 'all') {
      if (statusOrdenados.indexOf(filtrosAtivos.status) !== -1) {
        selectElement.value = filtrosAtivos.status;
      } else {
        filtrosAtivos.status = 'all';
        selectElement.value = 'all';
      }
    } else {
      selectElement.value = 'all';
    }
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
      destino = 'board';
    }

    currentView = destino;
    atualizarVisibilidadeVisualizacao();
    atualizarBotoesVisualizacao();
  }

  function atualizarVisibilidadeVisualizacao() {
    if (boardView) {
      boardView.hidden = currentView !== 'board';
    }
    if (listView) {
      listView.hidden = currentView !== 'list';
    }
  }

  function atualizarBotoesVisualizacao() {
    viewToggleButtons.forEach(function (botao) {
      const modo = botao.getAttribute('data-view-toggle');
      const ativo = modo === currentView;
      botao.classList.toggle('is-active', ativo);
      botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  }
})();