import React, { useState } from 'react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import DreFilters from '../components/dre/DreFilters';
import DreReport from '../components/dre/DreReport';

interface ContaCalculada extends DreConfiguracao {
  valores: { [key: string]: number };
  total12Meses: number;
  contas_filhas?: ContaCalculada[];
}

const DrePage: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [contasCalculadas, setContasCalculadas] = useState<ContaCalculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVariation, setShowVariation] = useState(false);
  const [periodType, setPeriodType] = useState<'6M' | '13M'>('13M');

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: contas } = useSupabaseQuery<DreConfiguracao>({
    query: () => {
      if (!selectedEmpresa) return Promise.resolve({ data: [] });

      return supabase
        .from('dre_configuracao')
        .select(`
          *,
          conta_pai:dre_configuracao!conta_pai_id (
            id,
            nome
          ),
          empresas:dre_contas_empresa!inner(
            empresa_id,
            ativo
          )
        `)
        .eq('ativo', true)
        .eq('dre_contas_empresa.empresa_id', selectedEmpresa)
        .eq('dre_contas_empresa.ativo', true)
        .order('ordem');
    },
    dependencies: [selectedEmpresa],
  });

  const getMesesVisualizacao = () => {
    const meses = [];
    let currentDate = new Date(selectedYear, selectedMonth - 1);
    const monthsToGoBack = periodType === '13M' ? 12 : 5;
    currentDate.setMonth(currentDate.getMonth() - monthsToGoBack);
    
    for (let i = 0; i < (periodType === '13M' ? 13 : 6); i++) {
      meses.push({
        mes: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return meses;
  };

  const calcularValorIndicador = async (
    indicadorId: string,
    mes: number,
    ano: number,
    empresaId: string,
    cache: Map<string, number>,
    lancamentos: any[],
    indicadoresMap: Map<string, any>,
    componentesMap: Map<string, any[]>
  ): Promise<number> => {
    const cacheKey = `${indicadorId}-${mes}-${ano}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const indicador = indicadoresMap.get(indicadorId);
    if (!indicador) return 0;

    let valorTotal = 0;

    if (indicador.tipo === 'único') {
      valorTotal = lancamentos
        .filter(l => l.indicador_id === indicadorId && l.mes === mes && l.ano === ano)
        .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
    } else {
      const componentes = componentesMap.get(indicadorId) || [];
      
      await Promise.all(componentes.map(async (componente) => {
        if (componente.componente_indicador_id) {
          const valorIndicador = await calcularValorIndicador(
            componente.componente_indicador_id,
            mes,
            ano,
            empresaId,
            cache,
            lancamentos,
            indicadoresMap,
            componentesMap
          );
          valorTotal += valorIndicador;
        } else if (componente.componente_categoria_id) {
          const valorCategoria = lancamentos
            .filter(l => l.categoria_id === componente.componente_categoria_id && l.mes === mes && l.ano === ano)
            .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
          valorTotal += valorCategoria;
        }
      }));
    }

    cache.set(cacheKey, valorTotal);
    return valorTotal;
  };

  const calcularValores = async () => {
    if (!selectedEmpresa || !contas?.length) return;
    
    setLoading(true);
    setError(null);

    try {
      const meses = getMesesVisualizacao();
      const periodoInicial = meses[0];
      const periodoFinal = meses[meses.length - 1];

      // Buscar todos os dados necessários em paralelo
      const [
        { data: lancamentos },
        { data: componentes },
        { data: indicadores },
        { data: indicadorComponentes }
      ] = await Promise.all([
        supabase
          .from('lancamentos')
          .select('*')
          .eq('empresa_id', selectedEmpresa)
          .gte('ano', periodoInicial.ano)
          .lte('ano', periodoFinal.ano),
        supabase
          .from('dre_conta_componentes')
          .select('*')
          .in('conta_id', contas.map(c => c.id)),
        supabase
          .from('indicadores')
          .select('*'),
        supabase
          .from('indicador_composicoes')
          .select('*')
      ]);

      if (!lancamentos || !componentes || !indicadores || !indicadorComponentes) {
        throw new Error('Erro ao buscar dados');
      }

      // Criar maps para acesso rápido
      const indicadoresMap = new Map(indicadores.map(i => [i.id, i]));
      const componentesMap = new Map();
      indicadorComponentes.forEach(ic => {
        const list = componentesMap.get(ic.indicador_id) || [];
        list.push(ic);
        componentesMap.set(ic.indicador_id, list);
      });

      const contasMap = new Map<string, ContaCalculada>();
      const contasRaiz: ContaCalculada[] = [];
      const cacheIndicadores = new Map<string, number>();

      // Inicializar contas
      contas.forEach(conta => {
        const valores: { [key: string]: number } = {};
        meses.forEach(({ mes, ano }) => {
          valores[`${ano}-${mes}`] = 0;
        });

        contasMap.set(conta.id, { 
          ...conta, 
          valores,
          total12Meses: 0
        });
      });

      // Calcular valores para cada conta em paralelo
      await Promise.all(contas.map(async (conta) => {
        const contaCalculada = contasMap.get(conta.id)!;
        const componentesConta = componentes.filter(c => c.conta_id === conta.id);

        await Promise.all(meses.map(async ({ mes, ano }) => {
          let valorTotal = 0;

          await Promise.all(componentesConta.map(async (componente) => {
            let valor = 0;

            if (componente.categoria_id) {
              valor = lancamentos
                .filter(l => l.categoria_id === componente.categoria_id && l.mes === mes && l.ano === ano)
                .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
            } else if (componente.indicador_id) {
              valor = await calcularValorIndicador(
                componente.indicador_id,
                mes,
                ano,
                selectedEmpresa,
                cacheIndicadores,
                lancamentos,
                indicadoresMap,
                componentesMap
              );
            }

            valorTotal += componente.simbolo === '+' ? valor : -valor;
          }));

          contaCalculada.valores[`${ano}-${mes}`] = valorTotal;
        }));

        // Calcular total dos últimos meses
        contaCalculada.total12Meses = meses
          .slice(1)
          .reduce((total, { mes, ano }) => total + contaCalculada.valores[`${ano}-${mes}`], 0);
      }));

      // Organizar hierarquia
      contas.forEach(conta => {
        const contaCalculada = contasMap.get(conta.id)!;
        
        if (conta.conta_pai_id) {
          const contaPai = contasMap.get(conta.conta_pai_id);
          if (contaPai) {
            if (!contaPai.contas_filhas) contaPai.contas_filhas = [];
            contaPai.contas_filhas.push(contaCalculada);
            
            meses.forEach(({ mes, ano }) => {
              contaPai.valores[`${ano}-${mes}`] += contaCalculada.valores[`${ano}-${mes}`];
            });
            contaPai.total12Meses += contaCalculada.total12Meses;
          }
        } else {
          contasRaiz.push(contaCalculada);
        }
      });

      const ordenarContasFilhas = (contas: ContaCalculada[]) => {
        contas.sort((a, b) => a.ordem - b.ordem);
        contas.forEach(conta => {
          if (conta.contas_filhas && conta.contas_filhas.length > 0) {
            ordenarContasFilhas(conta.contas_filhas);
          }
        });
      };

      ordenarContasFilhas(contasRaiz);
      setContasCalculadas(contasRaiz);
    } catch (err) {
      console.error('Erro ao calcular valores:', err);
      setError('Não foi possível calcular os valores do DRE');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedEmpresa && selectedYear && selectedMonth) {
      calcularValores();
    }
  }, [selectedEmpresa, selectedYear, selectedMonth, contas, periodType]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">DRE</h2>
          <p className="text-gray-400 mt-1">Demonstrativo do Resultado do Exercício</p>
        </div>

        <DreFilters
          selectedEmpresa={selectedEmpresa}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          empresas={empresas}
          showVariation={showVariation}
          periodType={periodType}
          onEmpresaChange={setSelectedEmpresa}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onToggleVariation={() => setShowVariation(!showVariation)}
          onPeriodTypeChange={setPeriodType}
        />
      </div>

      <div className="flex-1 overflow-auto mt-6">
        {!selectedEmpresa ? (
          <EmptyState message="Selecione uma empresa para visualizar o DRE" />
        ) : contasCalculadas.length === 0 ? (
          loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <EmptyState message="Nenhuma conta configurada para exibição" />
          )
        ) : (
          <DreReport 
            contas={contasCalculadas} 
            meses={getMesesVisualizacao()}
            showVariation={showVariation}
          />
        )}
      </div>
    </div>
  );
};

export default DrePage;