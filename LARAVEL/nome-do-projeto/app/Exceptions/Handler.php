<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Lista de tipos de exceção com seus respectivos níveis personalizados de log.
     *
     * @var array<class-string<Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [];

    /**
     * Lista de tipos de exceção que não são reportados.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [];

    /**
     * Lista de inputs que nunca são armazenados em sessão em exceções de validação.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Registrar os callbacks de tratamento de exceções da aplicação.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
