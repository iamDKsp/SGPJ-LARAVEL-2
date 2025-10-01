<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Detalhes do Processo</title>
    <link rel="stylesheet" href="{{ asset('styles.css') }}" />
  </head>
  <body>
    <main id="detalhe"></main>

    <nav>
      <a href="{{ route('processos.index') }}">&larr; Voltar</a>
    </nav>

    <script>
      window.sgpjDetalhesConfig = {
        processosJsonUrl: "{{ asset('processos.json') }}"
      };
    </script>
    <script src="{{ asset('detalhes.js') }}" defer></script>
  </body>
</html>
