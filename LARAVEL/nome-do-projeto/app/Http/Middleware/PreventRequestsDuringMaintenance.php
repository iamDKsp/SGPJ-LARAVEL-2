<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;

class PreventRequestsDuringMaintenance extends Middleware
{
    /**
     * URIs que devem permanecer acessíveis enquanto o modo de manutenção estiver ativo.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];
}
