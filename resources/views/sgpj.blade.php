<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SGPJ</title>
    <link rel="stylesheet" href="{{ asset('styles.css') }}" />
  </head>
  <body>
    <div id="app"></div>

    <script>
      window.sgpjConfig = {
        processosJsonUrl: "{{ asset('processos.json') }}",
        processoDetalheUrlTemplate: "{{ route('processos.show', ['id' => '__ID__']) }}"
      };
    </script>
    <script src="{{ asset('script.js') }}" defer></script>
  </body>
</html>
