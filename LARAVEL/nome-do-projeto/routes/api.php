<?php

use App\Http\Controllers\Api\ProcessoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/processos', [ProcessoController::class, 'index'])->name('api.processos.index');
Route::get('/processos/{processo}', [ProcessoController::class, 'show'])->name('api.processos.show');
