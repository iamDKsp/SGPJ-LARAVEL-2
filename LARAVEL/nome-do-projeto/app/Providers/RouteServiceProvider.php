<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Caminho para a rota "home" da aplicação.
     *
     * Normalmente os usuários são redirecionados para cá após a autenticação.
     */
    public const HOME = '/home';

    /**
     * Definir bindings de modelo, filtros de padrão e demais configurações de rotas.
     */
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
