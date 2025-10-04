<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProcessoResource;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class ProcessoController extends Controller
{
    /**
     * Lista todos os processos cadastrados na base.
     */
    public function index(): JsonResponse
    {
        if (! Schema::hasTable('processos')) {
            return response()->json([
                'message' => 'Tabela "processos" não encontrada. Importe o arquivo processos(3).sql antes de consultar os dados.'
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $registros = DB::table('processos')->get();
        $request = request();

        $dados = $registros->map(function ($registro) use ($request) {
            return (new ProcessoResource($registro))->toArray($request);
        });

        return response()->json($dados, Response::HTTP_OK);
    }

    /**
     * Exibe um processo específico.
     */
    public function show(string $processo): JsonResponse
    {
        if (! Schema::hasTable('processos')) {
            return response()->json([
                'message' => 'Tabela "processos" não encontrada. Importe o arquivo processos(3).sql antes de consultar os dados.'
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $colunas = Schema::getColumnListing('processos');

        $registro = DB::table('processos')
            ->where(function (Builder $query) use ($processo, $colunas): void {
                $condicoesAplicadas = false;

                if (in_array('id', $colunas, true) && is_numeric($processo)) {
                    $query->where('id', (int) $processo);
                    $condicoesAplicadas = true;
                }

                foreach (['processo_id', 'numero_processo', 'numeroProcesso', 'numero', 'codigo'] as $coluna) {
                    if (in_array($coluna, $colunas, true)) {
                        if ($condicoesAplicadas) {
                            $query->orWhere($coluna, $processo);
                        } else {
                            $query->where($coluna, $processo);
                            $condicoesAplicadas = true;
                        }
                    }
                }

                if (! $condicoesAplicadas) {
                    $query->whereRaw('1 = 0');
                }
            })
            ->first();

        if (! $registro) {
            return response()->json([
                'message' => 'Processo não encontrado.'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json((new ProcessoResource($registro))->toArray(request()), Response::HTTP_OK);
    }
}
