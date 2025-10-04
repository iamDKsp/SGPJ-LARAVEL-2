# SGPJ em Laravel

Este diretório contém uma instalação padrão do Laravel 10 com a interface original do painel SGPJ incorporada como página inicial. Nenhum arquivo da versão estática foi alterado; os mesmos recursos HTML, CSS e JavaScript foram adicionados em `public/` e publicados através de uma view Blade dedicada.

## Pré-requisitos

- PHP 8.2+
- Composer
- Extensões PHP recomendadas pelo instalador do Laravel (OpenSSL, PDO, Mbstring, etc.)

## Instalação

1. Dentro da pasta `LARAVEL/nome-do-projeto`, instale as dependências. O comando gerará um `composer.lock` localmente com todas as bibliotecas necessárias:
   ```bash
   composer install
   ```
2. Copie o arquivo de variáveis de ambiente e gere a chave da aplicação:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Ajuste as credenciais de banco no `.env` (host, porta, banco, usuário e senha) para apontar para o MySQL/MariaDB onde o painel será executado.
4. Importe o arquivo `processos(3).sql` (presente na raiz do repositório) para popular a tabela `processos` com os registros oficiais. Caso esteja usando o terminal integrado do VS Code, é possível executar tudo apenas com o Artisan:
   ```bash
   php artisan processos:importar-sql storage/app/processos(3).sql --limpar
   ```
   > Copie o arquivo SQL para `storage/app` ou informe o caminho completo em relação à raiz do projeto antes de rodar o comando.
   > O parâmetro `--limpar` apaga os registros atuais da tabela antes de importar o conteúdo do dump.

## Servindo a interface SGPJ

1. Inicie o servidor embutido do Laravel:
   ```bash
   php artisan serve
   ```
2. Abra `http://127.0.0.1:8000` no navegador. A página inicial carrega exatamente o dashboard SGPJ com o mesmo layout e estilos (`styles.css`). Os dados agora são buscados via API (`/api/processos`), abastecida diretamente pela tabela criada a partir do `processos(3).sql`.

## Testes

O projeto inclui a suíte padrão do Laravel. Para executá-la, use:
```bash
php artisan test
```
