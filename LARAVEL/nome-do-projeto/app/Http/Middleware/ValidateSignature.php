<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ValidateSignature as Middleware;

class ValidateSignature extends Middleware
{
    /**
     * Nomes dos parâmetros de query string que devem ser ignorados.
     *
     * @var array<int, string>
     */
    protected $except = [
        // 'fbclid',
        // 'utm_campaign',
        // 'utm_medium',
        // 'utm_source',
    ];
}
