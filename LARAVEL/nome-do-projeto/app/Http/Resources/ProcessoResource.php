<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ProcessoResource extends JsonResource
{
    /**
     * Transforma o recurso em um array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $atributos = $this->resource instanceof \JsonSerializable
            ? $this->resource->jsonSerialize()
            : (array) $this->resource;

        $id = $this->primeiroValor($atributos, ['id', 'processo_id']);
        if (is_numeric($id)) {
            $id = (int) $id;
        }

        $numeroProcesso = $this->primeiroValor($atributos, [
            'numero_processo',
            'numeroProcesso',
            'numero',
            'codigo_processo',
        ], $id ?: null);

        $nomeReu = $this->primeiroValor($atributos, [
            'nome_reu',
            'reu',
            'nome',
            'cliente',
            'parte',
        ], 'Não informado');

        $documento = $this->primeiroValor($atributos, [
            'cpf_cnpj_reu',
            'documento',
            'cpf_cnpj',
            'cnpj',
            'cpf',
        ]);

        $status = $this->primeiroValor($atributos, [
            'status',
            'situacao',
            'etapa',
            'fase',
        ], 'pendente');

        $responsavelId = $this->primeiroValor($atributos, [
            'responsavel_id',
            'responsavelId',
            'responsavel_slug',
            'responsavel',
        ]);

        $responsavelNome = $this->primeiroValor($atributos, [
            'responsavel_nome',
            'responsavel',
            'usuario_responsavel',
        ]);

        $valorBruto = $this->primeiroValor($atributos, [
            'valor_causa',
            'valor_da_causa',
            'valor',
            'valor_total',
            'valor_da_acao',
        ]);

        $valorFormatado = $this->formatarMoeda($valorBruto);

        $etapa = $this->primeiroValor($atributos, [
            'etapa',
            'fase',
            'status_funil',
        ]);

        $atualizadoEm = $this->primeiroValor($atributos, [
            'updated_at',
            'atualizado_em',
            'modificado_em',
        ]);

        if ($responsavelNome && ! $responsavelId) {
            $responsavelId = Str::slug(mb_strtolower($responsavelNome, 'UTF-8'));
        }

        return [
            'id' => $id ?: $numeroProcesso,
            'numero_processo' => $numeroProcesso,
            'nome_reu' => $nomeReu,
            'cpf_cnpj_reu' => $documento,
            'valor_causa' => $valorFormatado,
            'status' => $status,
            'responsavelId' => $responsavelId ? (string) $responsavelId : null,
            'responsavel' => $responsavelNome,
            'responsavel_nome' => $responsavelNome,
            'responsavel_inicial' => $responsavelNome ? mb_strtoupper(mb_substr($responsavelNome, 0, 1, 'UTF-8'), 'UTF-8') : null,
            'etapa' => $etapa,
            'atualizado_em' => $atualizadoEm,
        ];
    }

    /**
     * Retorna o primeiro valor disponível para as chaves informadas.
     *
     * @param  array<int, string>  $chaves
     */
    protected function primeiroValor(array $atributos, array $chaves, $padrao = null)
    {
        foreach ($chaves as $chave) {
            if (Arr::exists($atributos, $chave)) {
                $valor = $atributos[$chave];
                if ($valor !== null && $valor !== '') {
                    return $valor;
                }
            }
        }

        return $padrao;
    }

    protected function formatarMoeda($valor): ?string
    {
        if ($valor === null || $valor === '') {
            return null;
        }

        if (is_string($valor)) {
            $limpo = preg_replace('/[^0-9,.-]+/', '', $valor);
            if ($limpo === '') {
                return null;
            }

            $temVirgula = str_contains($limpo, ',');
            $temPonto = str_contains($limpo, '.');

            if ($temVirgula && $temPonto) {
                $limpo = str_replace('.', '', $limpo);
                $limpo = str_replace(',', '.', $limpo);
            } elseif ($temVirgula && ! $temPonto) {
                $limpo = str_replace(',', '.', $limpo);
            }

            if (! is_numeric($limpo)) {
                return $valor;
            }

            $valor = (float) $limpo;
        }

        if (is_numeric($valor)) {
            return 'R$ ' . number_format((float) $valor, 2, ',', '.');
        }

        return null;
    }
}
