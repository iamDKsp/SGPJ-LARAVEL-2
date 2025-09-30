(function () {
  'use strict';

  const DETALHE_STORAGE_KEY = 'sgpj-detalhe-processo';
  const ANEXOS_STORAGE_KEY = 'sgpj-anexos';
  const EDICOES_STORAGE_KEY = 'sgpj-detalhe-edicoes';
  const STATUS_CLASS_PREFIX = 'status-chip--';
  const STATUS_NORMALIZE = {
    pendente: 'pendente',
    perdido: 'perdido',
    finalizado: 'finalizado'
  };
  const DESCRICAO_PADRAO =
    'Utilize esta página para acompanhar a negociação em detalhes, adicionar observações internas e anexar documentos importantes relacionados ao processo.';

  let detalheShell;
  let statusChip;
  let statusSelect;
  let titulo;
  let etapa;
  let stageInput;
  let numero;
  let valor;
  let documento;
  let responsavel;
  let numeroResumo;
  let valorResumo;
  let documentoResumo;
  let responsavelResumo;
  let atualizado;
  let descricao;
  let voltarBotao;
  let loading;
  let attachmentInput;
  let attachmentList;
  let attachmentTemplate;
  let attachmentEmptyTemplate;
  let processoAtual = null;
  let anexosAtuais = [];
  let processoId = null;
  let atualizarTimeout = null;

  document.addEventListener('DOMContentLoaded', inicializar);

  function inicializar() {
    detalheShell = document.getElementById('detail-shell');
    statusChip = document.getElementById('detail-status');
    statusSelect = document.getElementById('detail-status-select');
    titulo = document.getElementById('detail-title-input');
    etapa = document.getElementById('detail-stage');
    stageInput = document.getElementById('detail-stage-input');
    numero = document.getElementById('detail-number');
    valor = document.getElementById('detail-value');
    documento = document.getElementById('detail-document');
    responsavel = document.getElementById('detail-responsible');
    numeroResumo = document.getElementById('detail-number-display');
    valorResumo = document.getElementById('detail-value-display');
    documentoResumo = document.getElementById('detail-document-display');
    responsavelResumo = document.getElementById('detail-responsible-display');
    atualizado = document.getElementById('detail-updated');
    descricao = document.getElementById('detail-description');
    voltarBotao = document.getElementById('detail-open-board');
    loading = document.getElementById('detail-loading');
    attachmentInput = document.getElementById('attachment-input');
    attachmentList = document.getElementById('attachment-list');
    attachmentTemplate = document.getElementById('attachment-item-template');
    attachmentEmptyTemplate = document.getElementById('attachment-empty-template');

    registrarEventosEdicao();

    processoId = obterIdentificadorProcesso();
    carregarProcesso();
  }

  function obterIdentificadorProcesso() {
    if (document.body.dataset.processoId) {
      return document.body.dataset.processoId;
    }

    const search = new URLSearchParams(window.location.search);
    if (search.has('id')) {
      return search.get('id');
    }

    const rota = window.location.pathname.match(/processos\/(.+)$/);
    if (rota && rota[1]) {
      return decodeURIComponent(rota[1]);
    }

    return null;
  }

  function carregarProcesso() {
    const salvo = obterProcessoArmazenado();
    if (salvo) {
      processoAtual = salvo;
      prepararTela();
      return;
    }

    const origemDados = document.body.getAttribute('data-processes-url') || 'processos.json';
    const url = new URL(origemDados, window.location.href);

    fetch(url.toString())
      .then(function (resposta) {
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os dados dos processos');
        }
        return resposta.json();
      })
      .then(function (lista) {
        if (!Array.isArray(lista)) {
          throw new Error('Formato de dados inválido');
        }
        processoAtual = localizarProcesso(lista, processoId);
        prepararTela();
      })
      .catch(function (erro) {
        console.error(erro);
        mostrarErro('Não foi possível carregar as informações deste processo.');
      });
  }

  function obterProcessoArmazenado() {
    try {
      let bruto = sessionStorage.getItem(DETALHE_STORAGE_KEY);
      if (!bruto) {
        bruto = localStorage.getItem(DETALHE_STORAGE_KEY);
      }

      if (!bruto) {
        return null;
      }

      const processo = JSON.parse(bruto);
      if (!processo) {
        return null;
      }

      if (!processoId) {
        return processo;
      }

      if (
        String(processo.id) === String(processoId) ||
        (processo.numero_processo && String(processo.numero_processo) === String(processoId))
      ) {
        return processo;
      }

      return null;
    } catch (erro) {
      console.warn('Falha ao recuperar processo salvo', erro);
      return null;
    }
  }

  function localizarProcesso(lista, idBuscado) {
    if (!idBuscado) {
      return lista[0] || null;
    }

    const encontrado = lista.find(function (processo) {
      return (
        String(processo.id) === String(idBuscado) ||
        (processo.numero_processo && String(processo.numero_processo) === String(idBuscado))
      );
    });

    return encontrado || null;
  }

  function prepararTela() {
    if (!processoAtual) {
      mostrarErro('Processo não encontrado.');
      return;
    }

    aplicarInformacoesProcesso();
    inicializarAnexos();

    try {
      sessionStorage.removeItem(DETALHE_STORAGE_KEY);
    } catch (erro) {
      console.warn('Não foi possível limpar o processo armazenado', erro);
    }

    try {
      localStorage.removeItem(DETALHE_STORAGE_KEY);
    } catch (erro) {
      console.warn('Não foi possível limpar o cache local do processo', erro);
    }

    if (loading) {
      loading.remove();
    }

    if (detalheShell) {
      detalheShell.hidden = false;
    }
  }

  function aplicarInformacoesProcesso() {
    const edicoes = carregarEdicoesLocais();
    if (edicoes) {
      processoAtual = Object.assign({}, processoAtual, edicoes);
    }

    const nomeProcessoAtualizado = processoAtual.nome_reu || 'Processo sem nome';
    atualizarTituloPagina(nomeProcessoAtualizado);
    if (titulo) {
      titulo.value = nomeProcessoAtualizado;
    }

    const statusNormalizado = normalizarStatus(processoAtual.status);
    atualizarStatus(statusNormalizado);

    const etapaAtual = processoAtual.etapaNome || '';
    atualizarEtapa(etapaAtual);
    if (stageInput) {
      stageInput.value = etapaAtual;
    }

    if (numero) {
      numero.value = formatarNumeroProcesso(processoAtual.numero_processo);
    }

    if (valor) {
      const exibicaoValor = processoAtual.valorFormatado || processoAtual.valor_causa || '';
      valor.value = exibicaoValor;
    }

    if (documento) {
      documento.value = processoAtual.cpf_cnpj_reu || '';
    }

    if (responsavel) {
      responsavel.value =
        processoAtual.responsavelNome ||
        processoAtual.responsavel ||
        (processoAtual.responsavelId ? processoAtual.responsavelId.toString().toUpperCase() : '');
    }

    if (descricao) {
      if (Object.prototype.hasOwnProperty.call(processoAtual, 'descricaoPersonalizada')) {
        descricao.value = processoAtual.descricaoPersonalizada || '';
      } else if (processoAtual.descricao) {
        descricao.value = processoAtual.descricao;
      } else {
        descricao.value = DESCRICAO_PADRAO;
      }
    }

    const dataAtualizacao = processoAtual.atualizadoEm ? new Date(processoAtual.atualizadoEm) : new Date();
    processoAtual.atualizadoEm = dataAtualizacao.toISOString();
    if (atualizado) {
      atualizado.textContent = 'Atualizado em ' + formatarDataHumana(dataAtualizacao);
      atualizado.dateTime = processoAtual.atualizadoEm;
    }

    atualizarResumoCampos();

    if (voltarBotao && !voltarBotao.dataset.bound) {
      voltarBotao.dataset.bound = 'true';
      voltarBotao.addEventListener('click', function () {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        const dashboard = document.body.getAttribute('data-dashboard-url');
        if (dashboard) {
          window.location.href = dashboard;
        }
      });
    }
  }

  function registrarEventosEdicao() {
    if (titulo) {
      titulo.addEventListener('input', function (evento) {
        const texto = evento.target.value.trim();
        atualizarTituloPagina(texto);
        if (!processoAtual) {
          return;
        }
        processoAtual.nome_reu = texto;
        registrarAtualizacao();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', function (evento) {
        if (!processoAtual) {
          return;
        }
        const novoStatus = normalizarStatus(evento.target.value);
        processoAtual.status = novoStatus;
        atualizarStatus(novoStatus);
        registrarAtualizacao();
      });
    }

    if (stageInput) {
      stageInput.addEventListener('input', function (evento) {
        const valorEtapa = evento.target.value.trim();
        atualizarEtapa(valorEtapa);
        if (!processoAtual) {
          return;
        }
        processoAtual.etapaNome = valorEtapa;
        registrarAtualizacao();
      });
    }

    if (numero) {
      numero.addEventListener('blur', function (evento) {
        if (!processoAtual) {
          return;
        }
        const texto = evento.target.value.trim();
        processoAtual.numero_processo = texto;
        evento.target.value = formatarNumeroProcesso(texto);
        registrarAtualizacao();
        atualizarResumoCampos();
      });
    }

    if (valor) {
      valor.addEventListener('blur', function (evento) {
        if (!processoAtual) {
          return;
        }
        const texto = evento.target.value.trim();
        if (!texto) {
          processoAtual.valor_causa = '';
          processoAtual.valorFormatado = '';
          evento.target.value = '';
        } else {
          const formatado = formatarValorMonetario(texto);
          processoAtual.valor_causa = formatado;
          processoAtual.valorFormatado = formatado;
          evento.target.value = formatado;
        }
        registrarAtualizacao();
        atualizarResumoCampos();
      });
    }

    if (documento) {
      documento.addEventListener('input', function (evento) {
        if (!processoAtual) {
          return;
        }
        processoAtual.cpf_cnpj_reu = evento.target.value.trim();
        registrarAtualizacao();
        atualizarResumoCampos();
      });
    }

    if (responsavel) {
      responsavel.addEventListener('input', function (evento) {
        if (!processoAtual) {
          return;
        }
        const texto = evento.target.value.trim();
        processoAtual.responsavelNome = texto;
        registrarAtualizacao();
        atualizarResumoCampos();
      });
    }

    if (descricao) {
      descricao.addEventListener('input', function (evento) {
        if (!processoAtual) {
          return;
        }
        processoAtual.descricaoPersonalizada = evento.target.value;
        registrarAtualizacao();
      });
    }
  }

  function atualizarTituloPagina(nome) {
    const base = 'Detalhes do Processo';
    if (nome) {
      document.title = nome + ' · ' + base;
    } else {
      document.title = base;
    }
  }

  function atualizarEtapa(texto) {
    if (!etapa) {
      return;
    }
    etapa.textContent = texto || 'Etapa não definida';
  }

  function atualizarResumoCampos() {
    if (numeroResumo) {
      const numeroTexto = numero && numero.value ? numero.value.trim() : '';
      numeroResumo.textContent = numeroTexto || '—';
    }

    if (valorResumo) {
      const valorTexto = valor && valor.value ? valor.value.trim() : '';
      valorResumo.textContent = valorTexto || '—';
    }

    if (documentoResumo) {
      const documentoTexto = documento && documento.value ? documento.value.trim() : '';
      documentoResumo.textContent = documentoTexto || '—';
    }

    if (responsavelResumo) {
      const responsavelTexto = responsavel && responsavel.value ? responsavel.value.trim() : '';
      responsavelResumo.textContent = responsavelTexto || '—';
    }
  }

  function registrarAtualizacao() {
    if (!processoAtual) {
      return;
    }

    if (atualizarTimeout) {
      clearTimeout(atualizarTimeout);
    }

    atualizarTimeout = setTimeout(function () {
      atualizarTimeout = null;
      const agora = new Date();
      processoAtual.atualizadoEm = agora.toISOString();
      if (atualizado) {
        atualizado.textContent = 'Atualizado em ' + formatarDataHumana(agora);
        atualizado.dateTime = processoAtual.atualizadoEm;
      }
      salvarEdicoesLocais();
    }, 250);
  }

  function salvarEdicoesLocais() {
    const chave = obterChaveProcesso();
    if (!chave || !processoAtual) {
      return;
    }

    const todas = carregarTodasEdicoes();
    todas[chave] = {
      nome_reu: processoAtual.nome_reu || '',
      numero_processo: processoAtual.numero_processo || '',
      valor_causa: processoAtual.valor_causa || '',
      valorFormatado: processoAtual.valorFormatado || processoAtual.valor_causa || '',
      cpf_cnpj_reu: processoAtual.cpf_cnpj_reu || '',
      responsavelNome: processoAtual.responsavelNome || '',
      status: processoAtual.status,
      etapaNome: processoAtual.etapaNome || '',
      descricaoPersonalizada: processoAtual.descricaoPersonalizada,
      atualizadoEm: processoAtual.atualizadoEm || ''
    };

    try {
      localStorage.setItem(EDICOES_STORAGE_KEY, JSON.stringify(todas));
    } catch (erro) {
      console.warn('Não foi possível salvar as edições locais', erro);
    }
  }

  function carregarEdicoesLocais() {
    const chave = obterChaveProcesso();
    if (!chave) {
      return null;
    }

    const todas = carregarTodasEdicoes();
    if (Object.prototype.hasOwnProperty.call(todas, chave)) {
      return todas[chave];
    }

    return null;
  }

  function carregarTodasEdicoes() {
    try {
      const bruto = localStorage.getItem(EDICOES_STORAGE_KEY);
      if (!bruto) {
        return {};
      }

      const dados = JSON.parse(bruto);
      if (dados && typeof dados === 'object') {
        return dados;
      }

      return {};
    } catch (erro) {
      console.warn('Não foi possível carregar as edições locais', erro);
      return {};
    }
  }

  function obterChaveProcesso() {
    if (processoAtual && processoAtual.id != null) {
      return String(processoAtual.id);
    }

    if (processoAtual && processoAtual.numero_processo) {
      return String(processoAtual.numero_processo);
    }

    if (processoId) {
      return String(processoId);
    }

    return null;
  }

  function formatarValorMonetario(texto) {
    if (!texto) {
      return '';
    }

    const normalizado = texto
      .toString()
      .replace(/[^0-9,.-]+/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const numero = Number(normalizado);
    if (Number.isNaN(numero)) {
      return texto;
    }

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
  }

  function inicializarAnexos() {
    if (!processoId && processoAtual) {
      processoId = processoAtual.id != null ? String(processoAtual.id) : processoAtual.numero_processo;
    }

    anexosAtuais = carregarAnexos(processoId);
    renderizarAnexos();

    if (attachmentInput) {
      attachmentInput.addEventListener('change', aoSelecionarArquivo);
    }
  }

  function carregarAnexos(id) {
    if (!id) {
      return [];
    }

    try {
      const bruto = localStorage.getItem(ANEXOS_STORAGE_KEY);
      if (!bruto) {
        return [];
      }

      const mapa = JSON.parse(bruto) || {};
      const anexos = mapa[id];
      return Array.isArray(anexos) ? anexos : [];
    } catch (erro) {
      console.warn('Não foi possível carregar os anexos salvos', erro);
      return [];
    }
  }

  function salvarAnexos(id, anexos) {
    if (!id) {
      return;
    }

    try {
      const bruto = localStorage.getItem(ANEXOS_STORAGE_KEY);
      const mapa = bruto ? JSON.parse(bruto) : {};
      mapa[id] = anexos;
      localStorage.setItem(ANEXOS_STORAGE_KEY, JSON.stringify(mapa));
    } catch (erro) {
      console.warn('Não foi possível salvar os anexos', erro);
    }
  }

  function aoSelecionarArquivo(evento) {
    const arquivos = evento.target.files;
    if (!arquivos || !arquivos.length) {
      return;
    }

    const arquivo = arquivos[0];
    const leitor = new FileReader();

    leitor.addEventListener('load', function () {
      const anexo = {
        id: gerarIdentificador(),
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
        data: leitor.result,
        enviadoEm: new Date().toISOString()
      };

      anexosAtuais.push(anexo);
      salvarAnexos(processoId, anexosAtuais);
      renderizarAnexos();
      evento.target.value = '';
    });

    leitor.readAsDataURL(arquivo);
  }

  function renderizarAnexos() {
    if (!attachmentList) {
      return;
    }

    attachmentList.innerHTML = '';

    if (!anexosAtuais.length) {
      const vazio = attachmentEmptyTemplate.content.cloneNode(true);
      attachmentList.appendChild(vazio);
      return;
    }

    anexosAtuais.forEach(function (anexo) {
      const item = attachmentTemplate.content.cloneNode(true);
      const nome = item.querySelector('.attachment-item__name');
      const info = item.querySelector('.attachment-item__info');
      const download = item.querySelector('.attachment-item__download');
      const remover = item.querySelector('.attachment-item__remove');

      nome.textContent = anexo.nome;
      info.textContent = formatarInfoAnexo(anexo);

      if (download) {
        download.href = anexo.data;
        download.download = anexo.nome;
      }

      if (remover) {
        remover.addEventListener('click', function () {
          removerAnexo(anexo.id);
        });
      }

      attachmentList.appendChild(item);
    });
  }

  function removerAnexo(id) {
    anexosAtuais = anexosAtuais.filter(function (anexo) {
      return anexo.id !== id;
    });
    salvarAnexos(processoId, anexosAtuais);
    renderizarAnexos();
  }

  function formatarInfoAnexo(anexo) {
    const tamanho = formatarTamanho(anexo.tamanho);
    const data = anexo.enviadoEm ? formatarDataHumana(new Date(anexo.enviadoEm)) : 'agora';
    return tamanho + ' · enviado em ' + data;
  }

  function formatarTamanho(bytes) {
    if (!bytes) {
      return '0 KB';
    }

    const unidades = ['bytes', 'KB', 'MB', 'GB'];
    let tamanho = bytes;
    let indice = 0;

    while (tamanho >= 1024 && indice < unidades.length - 1) {
      tamanho /= 1024;
      indice += 1;
    }

    return tamanho.toFixed(indice === 0 ? 0 : 1) + ' ' + unidades[indice];
  }

  function atualizarStatus(status) {
    statusChip.textContent = obterRotuloStatus(status);
    statusChip.classList.remove(
      STATUS_CLASS_PREFIX + 'pendente',
      STATUS_CLASS_PREFIX + 'perdido',
      STATUS_CLASS_PREFIX + 'finalizado'
    );
    statusChip.classList.add(STATUS_CLASS_PREFIX + status);
    if (statusSelect) {
      statusSelect.value = status;
    }
  }

  function obterRotuloStatus(status) {
    switch (status) {
      case 'perdido':
        return 'Perdido';
      case 'finalizado':
        return 'Finalizado';
      default:
        return 'Pendente';
    }
  }

  function normalizarStatus(status) {
    if (!status) {
      return 'pendente';
    }

    const chave = status.toString().toLowerCase();
    if (STATUS_NORMALIZE[chave]) {
      return STATUS_NORMALIZE[chave];
    }

    if (chave === 'perdida' || chave === 'perdido') {
      return 'perdido';
    }

    if (chave === 'finalizada' || chave === 'finalizado') {
      return 'finalizado';
    }

    return 'pendente';
  }

  function formatarNumeroProcesso(numeroProcesso) {
    if (!numeroProcesso) {
      return '';
    }

    const texto = numeroProcesso.toString().replace(/[^0-9]/g, '');
    if (texto.length !== 20) {
      return numeroProcesso;
    }

    return (
      texto.slice(0, 7) +
      '-' +
      texto.slice(7, 9) +
      '.' +
      texto.slice(9, 13) +
      '.' +
      texto.slice(13, 14) +
      '.' +
      texto.slice(14, 16) +
      '.' +
      texto.slice(16)
    );
  }

  function formatarDataHumana(data) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      return 'agora';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(data);
  }

  function gerarIdentificador() {
    return 'anexo-' + Math.random().toString(36).slice(2, 11);
  }

  function mostrarErro(mensagem) {
    if (loading) {
      loading.querySelector('.detail-loading__label').textContent = mensagem;
      const spinner = loading.querySelector('.detail-loading__spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }
})();
