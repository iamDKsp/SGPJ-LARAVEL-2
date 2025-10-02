<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div class="min-h-screen flex flex-col items-center justify-center px-6 py-8">
            <div class="text-center">
                <h1 class="text-4xl font-semibold mb-4">Bem-vindo ao Laravel</h1>
                <p class="text-lg mb-8">Você instalou com sucesso o esqueleto do framework Laravel. Comece agora a construir algo incrível!</p>
            </div>
            <div class="grid gap-6 w-full max-w-4xl md:grid-cols-2">
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laravel.com/docs" target="_blank">
                    <h2 class="text-xl font-semibold">Documentação</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Acesse a documentação oficial do Laravel para guias completos e referências detalhadas.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laracasts.com" target="_blank">
                    <h2 class="text-xl font-semibold">Laracasts</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Aprenda Laravel com screencasts práticos que cobrem cada aspecto do framework.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laravel-news.com" target="_blank">
                    <h2 class="text-xl font-semibold">Laravel News</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Fique por dentro das últimas notícias, pacotes e novidades do ecossistema.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://github.com/laravel/laravel" target="_blank">
                    <h2 class="text-xl font-semibold">GitHub</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Contribua com o framework Laravel ou explore o código-fonte no GitHub.</p>
                </a>
            </div>
        </div>
    </body>
</html>
