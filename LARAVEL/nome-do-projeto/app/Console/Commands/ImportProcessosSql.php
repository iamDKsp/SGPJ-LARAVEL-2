<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportProcessosSql extends Command
{
    /**
     * O nome e a assinatura do comando de console.
     */
    protected $signature = 'processos:importar-sql {arquivo : Caminho do arquivo SQL a ser importado} {--limpar : Limpa a tabela de processos antes de importar}';

    /**
     * A descrição do comando de console.
     */
    protected $description = 'Importa registros de processos a partir de um arquivo SQL exportado do banco.';

    /**
     * Executa o comando de console.
     */
    public function handle(): int
    {
        $caminho = $this->argument('arquivo');

        if (! File::exists($caminho)) {
            $caminho = base_path($caminho);
        }

        if (! File::exists($caminho)) {
            $this->error('Arquivo não encontrado: ' . $caminho);

            return self::FAILURE;
        }

        $sql = File::get($caminho);

        if ($sql === '') {
            $this->error('O arquivo informado está vazio.');

            return self::FAILURE;
        }

        try {
            DB::beginTransaction();

            if ($this->option('limpar')) {
                DB::table('processos')->truncate();
            }

            DB::unprepared($sql);

            DB::commit();
        } catch (\Throwable $exception) {
            DB::rollBack();

            $this->error('Falha ao importar os dados:');
            $this->line($exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Importação concluída com sucesso!');

        return self::SUCCESS;
    }
}
