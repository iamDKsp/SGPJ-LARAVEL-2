# SGPJ em Laravel

Este diretório contém uma instalação padrão do Laravel 10 com a interface original do painel SGPJ incorporada como página inicial. Nenhum arquivo da versão estática foi alterado; os mesmos recursos HTML, CSS e JavaScript foram adicionados em `public/` e publicados através de uma view Blade dedicada.

## Pré-requisitos

- PHP 8.2+
- Composer
- Extensões PHP recomendadas pelo instalador do Laravel (OpenSSL, PDO, Mbstring, etc.)

## Instalação

1. Dentro da pasta `LARAVEL/nome-do-projeto`, instale as dependências:
   ```bash
   composer install
   ```
2. Copie o arquivo de variáveis de ambiente e gere a chave da aplicação:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Opcional: ajuste as credenciais de banco no `.env` caso vá usar recursos que dependam de banco de dados.

## Servindo a interface SGPJ

1. Inicie o servidor embutido do Laravel:
   ```bash
   php artisan serve
   ```
2. Abra `http://127.0.0.1:8000` no navegador. A página inicial carrega exatamente o dashboard SGPJ da pasta `V7`, com o mesmo layout, estilos (`styles.css`) e scripts (`script.js` / `processos-data.js`).

> Observação: todos os arquivos originais continuam preservados na pasta `V7` caso precise consultá-los diretamente.

## Testes

O projeto inclui a suíte padrão do Laravel. Para executá-la, use:
```bash
php artisan test
```
