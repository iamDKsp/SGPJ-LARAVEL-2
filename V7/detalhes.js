(function () {
  'use strict';

  const DETALHE_STORAGE_KEY = 'sgpj-detalhe-processo';
  const ANEXOS_STORAGE_KEY = 'sgpj-anexos';
  const STATUS_CLASS_PREFIX = 'status-chip--';
  const STATUS_NORMALIZE = {
    pendente: 'pendente',
    perdido: 'perdido',
    finalizado: 'finalizado'
  };

  let detalheShell;
  let statusChip;
  let titulo;
  let etapa;
  let numero;
  let valor;
  let documento;
  let responsavel;
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

  document.addEventListener('DOMContentLoaded', inicializar);

  function inicializar() {
    detalheShell = document.getElementById('detail-shell');
    statusChip = document.getElementById('detail-status');
    titulo = document.getElementById('detail-title');
    etapa = document.getElementById('detail-stage');
    numero = document.getElementById('detail-number');
    valor = document.getElementById('detail-value');
    documento = document.getElementById('detail-document');
    responsavel = document.getElementById('detail-responsible');
    atualizado = document.getElementById('detail-updated');
    descricao = document.getElementById('detail-description');
    voltarBotao = document.getElementById('detail-open-board');
    loading = document.getElementById('detail-loading');
    attachmentInput = document.getElementById('attachment-input');
    attachmentList = document.getElementById('attachment-list');
    attachmentTemplate = document.getElementById('attachment-item-template');
    attachmentEmptyTemplate = document.getElementById('attachment-empty-template');

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
    const nomeProcesso = processoAtual.nome_reu || 'Processo sem nome';
    titulo.textContent = nomeProcesso;
    document.title = nomeProcesso + ' · Detalhes do Processo';

    const statusNormalizado = normalizarStatus(processoAtual.status);
    atualizarStatus(statusNormalizado);

    etapa.textContent = processoAtual.etapaNome || 'Etapa não definida';
    numero.textContent = formatarNumeroProcesso(processoAtual.numero_processo);
    valor.textContent = processoAtual.valorFormatado || processoAtual.valor_causa || '—';
    documento.textContent = processoAtual.cpf_cnpj_reu || 'Não informado';

    if (processoAtual.responsavelNome) {
      responsavel.textContent = processoAtual.responsavelNome;
    } else if (processoAtual.responsavelId) {
      responsavel.textContent = processoAtual.responsavelId.toString().toUpperCase();
    } else {
      responsavel.textContent = 'Não atribuído';
    }

    if (descricao) {
      descricao.textContent =
        'Este processo está classificado como ' +
        obterRotuloStatus(statusNormalizado).toLowerCase() +
        ' e localizado na etapa "' +
        (processoAtual.etapaNome || 'não definida') +
        '". Atualize as informações, registre observações e mantenha os documentos organizados para a equipe.';
    }

    const agora = new Date();
    atualizado.textContent = 'Atualizado em ' + formatarDataHumana(agora);
    atualizado.dateTime = agora.toISOString();

    if (voltarBotao) {
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
      return '—';
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
