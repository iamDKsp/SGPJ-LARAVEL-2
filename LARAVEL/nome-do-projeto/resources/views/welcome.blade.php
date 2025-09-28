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
                <h1 class="text-4xl font-semibold mb-4">Welcome to Laravel</h1>
                <p class="text-lg mb-8">You have successfully installed the Laravel framework skeleton. Start building something amazing!</p>
            </div>
            <div class="grid gap-6 w-full max-w-4xl md:grid-cols-2">
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laravel.com/docs" target="_blank">
                    <h2 class="text-xl font-semibold">Documentation</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Dive into the official Laravel documentation for comprehensive guides and references.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laracasts.com" target="_blank">
                    <h2 class="text-xl font-semibold">Laracasts</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Learn Laravel through practical screencasts covering every aspect of the framework.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://laravel-news.com" target="_blank">
                    <h2 class="text-xl font-semibold">Laravel News</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Stay up to date with the latest news, packages, and ecosystem updates.</p>
                </a>
                <a class="p-6 rounded-xl bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition hover:shadow-lg" href="https://github.com/laravel/laravel" target="_blank">
                    <h2 class="text-xl font-semibold">GitHub</h2>
                    <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">Contribute to the Laravel framework or explore the source code on GitHub.</p>
                </a>
            </div>
        </div>
    </body>
</html>
