import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardCard from './DashboardCard';
import DashboardChart from './DashboardChart';
import DashboardList from './DashboardList';

interface DashboardGridProps {
  data: any[];
  selectedMonth: number;
  selectedYear: number;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  data,
  selectedMonth,
  selectedYear,
}) => {
  const [cardValues, setCardValues] = useState<{ [key: string]: number }>({});
  const [chartData, setChartData] = useState<{ [key: string]: any[] }>({});
  const [listData, setListData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  const getMesesRange = () => {
    const meses = [];
    let currentDate = new Date(selectedYear, selectedMonth - 1);
    currentDate.setMonth(currentDate.getMonth() - 12);
    
    for (let i = 0; i < 13; i++) {
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

  const fetchDashboardData = async () => {
    setLoading(true);
    const meses = getMesesRange();
    const newCardValues: { [key: string]: number } = {};
    const newChartData: { [key: string]: any[] } = {};
    const newListData: { [key: string]: any[] } = {};
    const cacheIndicadores = new Map<string, number>();

    try {
      // Buscar todos os dados necessários em paralelo
      const [
        { data: lancamentos },
        { data: indicadores },
        { data: indicadorComponentes },
        { data: clientes }
      ] = await Promise.all([
        supabase
          .from('lancamentos')
          .select('*')
          .in('mes', meses.map(m => m.mes))
          .in('ano', [...new Set(meses.map(m => m.ano))]),
        supabase
          .from('indicadores')
          .select('*'),
        supabase
          .from('indicador_composicoes')
          .select('*'),
        supabase
          .from('clientes')
          .select('*')
      ]);

      if (!lancamentos || !indicadores || !indicadorComponentes) {
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
      
      const clientesMap = new Map(clientes?.map(c => [c.id, c]) || []);

      // Processar cada configuração
      await Promise.all(data.map(async (config) => {
        if (config.tipo_visualizacao === 'card') {
          // Buscar componentes do card
          const { data: cardComponents } = await supabase
            .from('dashboard_card_components')
            .select(`
              *,
              categoria:categorias (*),
              indicador:indicadores (*)
            `)
            .eq('dashboard_id', config.id);

          if (cardComponents && cardComponents.length > 0) {
            let valor = 0;
            await Promise.all(cardComponents.map(async (comp) => {
              if (comp.categoria) {
                const lancamentosCategoria = lancamentos?.filter(l => 
                  l.categoria_id === comp.categoria.id && 
                  l.mes === selectedMonth && 
                  l.ano === selectedYear
                );
                valor += lancamentosCategoria?.reduce((sum, l) => 
                  sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
              } else if (comp.indicador) {
                const valorIndicador = await calcularValorIndicador(
                  comp.indicador.id,
                  selectedMonth,
                  selectedYear,
                  config.empresa_id,
                  cacheIndicadores,
                  lancamentos,
                  indicadoresMap,
                  componentesMap
                );
                valor += valorIndicador;
              }
            }));
            newCardValues[config.id] = valor;
          }
        } else if (config.tipo_visualizacao === 'chart') {
          // Buscar componentes do gráfico
          const { data: chartComponents } = await supabase
            .from('dashboard_chart_components')
            .select(`
              *,
              categoria:categorias (*),
              indicador:indicadores (*)
            `)
            .eq('dashboard_id', config.id);

          if (chartComponents) {
            const chartValues = await Promise.all(meses.map(async ({ mes, ano }) => {
              const monthData: { [key: string]: any } = { 
                name: `${mes}/${ano}`
              };
              
              await Promise.all(chartComponents.map(async (comp) => {
                let componentValue = 0;
                if (comp.categoria) {
                  const lancamentosCategoria = lancamentos?.filter(l => 
                    l.categoria_id === comp.categoria.id && 
                    l.mes === mes && 
                    l.ano === ano
                  );
                  componentValue = lancamentosCategoria?.reduce((sum, l) => 
                    sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
                } else if (comp.indicador) {
                  componentValue = await calcularValorIndicador(
                    comp.indicador.id,
                    mes,
                    ano,
                    config.empresa_id,
                    cacheIndicadores,
                    lancamentos,
                    indicadoresMap,
                    componentesMap
                  );
                }
                
                const componentName = comp.categoria?.nome || comp.indicador?.nome || 'Valor';
                monthData[componentName] = componentValue;
              }));
              
              return monthData;
            }));

            newChartData[config.id] = chartValues;
          }
        } else if (config.tipo_visualizacao === 'list') {
          let listValues = [];
          
          // Verificar o tipo de lista configurado
          if (config.lista_tipo === 'categoria' || !config.lista_tipo) {
            // Buscar as 10 maiores categorias de despesa
            const { data: topCategorias } = await supabase
              .from('lancamentos')
              .select(`
                categoria_id,
                categoria:categorias (id, nome),
                valor,
                tipo
              `)
              .eq('mes', selectedMonth)
              .eq('ano', selectedYear)
              .eq('empresa_id', config.empresa_id)
              .eq('tipo', 'despesa')
              .not('categoria_id', 'is', null);
            
            if (topCategorias && topCategorias.length > 0) {
              // Agrupar por categoria e somar valores
              const categoriasAgrupadas = topCategorias.reduce((acc, lancamento) => {
                if (!lancamento.categoria) return acc;
                
                const categoriaId = lancamento.categoria.id;
                if (!acc[categoriaId]) {
                  acc[categoriaId] = {
                    id: categoriaId,
                    nome: lancamento.categoria.nome,
                    valor: 0
                  };
                }
                
                acc[categoriaId].valor += lancamento.valor;
                return acc;
              }, {} as Record<string, { id: string, nome: string, valor: number }>);
              
              // Converter para array, ordenar e pegar os 10 maiores
              listValues = Object.values(categoriasAgrupadas)
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 10);
            }
          } else if (config.lista_tipo === 'cliente') {
            // Buscar os lançamentos por cliente
            const { data: lancamentosClientes } = await supabase
              .from('lancamentos')
              .select(`
                cliente_id,
                valor,
                tipo
              `)
              .eq('mes', selectedMonth)
              .eq('ano', selectedYear)
              .eq('empresa_id', config.empresa_id)
              .eq('tipo', 'receita')
              .not('cliente_id', 'is', null);
            
            if (lancamentosClientes && lancamentosClientes.length > 0) {
              // Agrupar por cliente e somar valores
              const clientesAgrupados = lancamentosClientes.reduce((acc, lancamento) => {
                if (!lancamento.cliente_id) return acc;
                
                const clienteId = lancamento.cliente_id;
                const cliente = clientesMap.get(clienteId);
                
                if (!cliente) return acc;
                
                if (!acc[clienteId]) {
                  acc[clienteId] = {
                    id: clienteId,
                    nome: cliente.razao_social,
                    valor: 0
                  };
                }
                
                acc[clienteId].valor += lancamento.valor;
                return acc;
              }, {} as Record<string, { id: string, nome: string, valor: number }>);
              
              // Converter para array, ordenar e pegar os 10 maiores
              listValues = Object.values(clientesAgrupados)
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 10);
            }
          }
          
          newListData[config.id] = listValues;
        }
      }));

      setCardValues(newCardValues);
      setChartData(newChartData);
      setListData(newListData);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [data, selectedMonth, selectedYear]);

  // Calcular variação em relação ao mês anterior
  const calcularVariacao = (configId: string) => {
    const valorAtual = cardValues[configId] || 0;
    const mesAnterior = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const anoAnterior = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    const config = data.find(c => c.id === configId);
    if (!config) return 0;

    const valorAnterior = chartData[configId]?.find(d => {
      const [mes, ano] = d.name.split('/');
      return parseInt(mes) === mesAnterior && parseInt(ano) === anoAnterior;
    })?.value || 0;

    if (valorAnterior === 0) return 0;
    return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  // Organizar os cards por posição
  const topCards = data.filter(item => item.posicao >= 1 && item.posicao <= 4);
  const middleCard = data.find(item => item.posicao === 5);
  const bottomCards = data.filter(item => item.posicao >= 6 && item.posicao <= 7);

  // Helper function para determinar o tipo de dado
  const getDataType = (item: any) => {
    if (item?.indicador) {
      return item.indicador.tipo_dado;
    }
    if (item?.categoria) {
      return 'moeda';
    }
    return 'moeda';
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top row - 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {topCards.map(card => {
          if (card.tipo_visualizacao === 'list') {
            return (
              <div key={card.id} className="col-span-1">
                <DashboardList
                  title={card.titulo}
                  items={listData[card.id] || []}
                  type={getDataType(card)}
                />
              </div>
            );
          }
          return (
            <DashboardCard
              key={card.id}
              title={card.titulo}
              value={cardValues[card.id] || 0}
              variation={calcularVariacao(card.id)}
              type={getDataType(card)}
            />
          );
        })}
      </div>

      {/* Middle row - 1 chart or list */}
      {middleCard && (
        <div className="flex-1 min-h-0 bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 font-medium">{middleCard.titulo}</h3>
            {middleCard.tipo_visualizacao === 'chart' && (
              <div className="flex gap-4">
                {middleCard.chart_components?.map(comp => (
                  <div key={comp.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.cor }} />
                    <span className="text-sm text-gray-400">
                      {comp.categoria?.nome || comp.indicador?.nome || 'Valor'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="h-[calc(100%-2rem)]">
            {middleCard.tipo_visualizacao === 'list' ? (
              <DashboardList
                title={middleCard.titulo}
                items={listData[middleCard.id] || []}
                type={getDataType(middleCard)}
                fullWidth
              />
            ) : (
              <DashboardChart
                title={middleCard.titulo}
                data={chartData[middleCard.id] || []}
                type={getDataType(middleCard)}
                chartType={middleCard.tipo_grafico}
                components={middleCard.chart_components?.map(comp => ({
                  name: comp.categoria?.nome || comp.indicador?.nome || 'Valor',
                  color: comp.cor
                }))}
              />
            )}
          </div>
        </div>
      )}

      {/* Bottom row - 2 cards or lists */}
      <div className="grid grid-cols-2 gap-4 h-64">
        {bottomCards.map(card => (
          <div key={card.id} className="h-full">
            {card.tipo_visualizacao === 'list' ? (
              <DashboardList
                title={card.titulo}
                items={listData[card.id] || []}
                type={getDataType(card)}
                fullWidth
              />
            ) : (
              <DashboardCard
                title={card.titulo}
                value={cardValues[card.id] || 0}
                variation={calcularVariacao(card.id)}
                type={getDataType(card)}
                fullWidth
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;