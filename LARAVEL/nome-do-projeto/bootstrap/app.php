<?php

use App\Console\Kernel as AppConsoleKernel;
use App\Exceptions\Handler as AppExceptionHandler;
use App\Http\Kernel as AppHttpKernel;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Application;

$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->singleton(
    ExceptionHandler::class,
    AppExceptionHandler::class
);

$app->singleton(
    ConsoleKernel::class,
    AppConsoleKernel::class
);

$app->singleton(
    HttpKernel::class,
    AppHttpKernel::class
);

return $app;
