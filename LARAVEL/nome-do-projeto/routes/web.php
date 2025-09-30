<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('sgpj');
})->name('sgpj.dashboard');

Route::get('/processos/{processo}', function (string $processo) {
    return view('sgpj-detalhe', ['processoId' => $processo]);
})->where('processo', '[A-Za-z0-9\-]+')->name('sgpj.processo');
