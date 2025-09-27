<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/laravel/actions"><img src="https://github.com/laravel/laravel/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects.

## Learning Laravel

Laravel has the most extensive and thorough documentation and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## Como executar a interface SGPJ dentro do Laravel

A aplicação front-end original da pasta `V7` foi portada integralmente para esta instalação Laravel. Para executar a mesma interface com toda a funcionalidade preservada:

1. Instale as dependências do projeto Laravel (exige PHP 8.2+ e Composer):
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. Inicie o servidor de desenvolvimento do Laravel:
   ```bash
   php artisan serve
   ```
3. Acesse `http://localhost:8000` no navegador. O painel SGPJ aparecerá exatamente como na versão estática, incluindo login, filtros, quadro e visualização em lista.

Os arquivos estáticos (`styles.css`, `script.js`, `processos.json` e `processos-data.js`) estão na pasta `public/`, garantindo que a interface mantenha todos os comportamentos originais.
