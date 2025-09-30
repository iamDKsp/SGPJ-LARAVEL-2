<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Detalhes do Processo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="{{ asset('styles.css') }}" />
  </head>
  <body
    class="detail-body"
    data-processes-url="{{ asset('processos.json') }}"
    data-processo-id="{{ $processoId ?? '' }}"
    data-dashboard-url="{{ url('/') }}"
  >
    <div class="detail-shell" id="detail-shell" hidden>
      <header class="detail-header">
        <div class="detail-header__primary">
          <span class="status-chip" id="detail-status">Status</span>
          <h1 class="detail-title" id="detail-title">Processo</h1>
          <p class="detail-stage" id="detail-stage">Etapa do funil</p>
        </div>
        <div class="detail-header__actions">
          <a class="detail-back" href="{{ url('/') }}">⟵ Voltar para o CRM</a>
          <button type="button" class="detail-action" id="detail-open-board">
            Retomar negociação
          </button>
        </div>
      </header>

      <section class="detail-grid" aria-labelledby="detail-infos-title">
        <h2 class="detail-section-title" id="detail-infos-title">Informações do processo</h2>
        <div class="detail-grid__content">
          <article class="detail-card">
            <span class="detail-card__label">Número do processo</span>
            <p class="detail-card__value" id="detail-number">—</p>
          </article>
          <article class="detail-card">
            <span class="detail-card__label">Valor da causa</span>
            <p class="detail-card__value" id="detail-value">—</p>
          </article>
          <article class="detail-card">
            <span class="detail-card__label">CPF/CNPJ</span>
            <p class="detail-card__value" id="detail-document">—</p>
          </article>
          <article class="detail-card">
            <span class="detail-card__label">Responsável</span>
            <p class="detail-card__value" id="detail-responsible">Não atribuído</p>
          </article>
        </div>
      </section>

      <section class="detail-section" aria-labelledby="detail-notes-title">
        <div class="detail-section__header">
          <h2 class="detail-section-title" id="detail-notes-title">Resumo</h2>
          <time class="detail-updated" id="detail-updated" datetime="">
            Atualizado agora
          </time>
        </div>
        <p class="detail-description" id="detail-description">
          Utilize esta página para acompanhar a negociação em detalhes, adicionar
          observações internas e anexar documentos importantes relacionados ao processo.
        </p>
      </section>

      <section class="detail-section" aria-labelledby="detail-attachments-title">
        <div class="detail-section__header">
          <h2 class="detail-section-title" id="detail-attachments-title">Anexos</h2>
          <p class="detail-section__subtitle">
            Faça upload de contratos, comprovantes ou qualquer documento de apoio.
          </p>
        </div>
        <form class="detail-upload" id="attachment-form">
          <label class="detail-upload__field" for="attachment-input">
            <span class="detail-upload__label">Selecionar arquivo</span>
            <input
              type="file"
              id="attachment-input"
              name="attachment"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar,.7z"
            />
          </label>
          <p class="detail-upload__hint">
            Os arquivos ficam salvos localmente no seu navegador.
          </p>
        </form>
        <ul class="attachment-list" id="attachment-list" aria-live="polite">
          <li class="attachment-list__empty">Nenhum arquivo anexado ainda.</li>
        </ul>
      </section>
    </div>

    <div class="detail-loading" id="detail-loading">
      <span class="detail-loading__spinner" aria-hidden="true"></span>
      <p class="detail-loading__label">Carregando informações do processo…</p>
    </div>

    <template id="attachment-item-template">
      <li class="attachment-item">
        <div class="attachment-item__icon" aria-hidden="true">📄</div>
        <div class="attachment-item__meta">
          <strong class="attachment-item__name"></strong>
          <span class="attachment-item__info"></span>
        </div>
        <div class="attachment-item__actions">
          <a class="attachment-item__download" href="#" download>Baixar</a>
          <button type="button" class="attachment-item__remove">Remover</button>
        </div>
      </li>
    </template>

    <template id="attachment-empty-template">
      <li class="attachment-list__empty">Nenhum arquivo anexado ainda.</li>
    </template>

    <script src="{{ asset('detalhes.js') }}" defer></script>
  </body>
</html>
