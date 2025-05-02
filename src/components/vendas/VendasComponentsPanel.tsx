import React, { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface VendasComponentsPanelProps {
  config?: any;
  onManageComponents: () => void;
}

const VendasComponentsPanel: React.FC<VendasComponentsPanelProps> = ({
  config,
  onManageComponents,
}) => {
  const [componentes, setComponentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      fetchComponentes();
    }
  }, [config]);

  const fetchComponentes = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      let query;
      
      if (config.tipo_visualizacao === 'chart') {
        query = supabase
          .from('vendas_chart_components')
          .select(`
            *,
            categoria:categorias (
              id,
              nome,
              codigo
            ),
            indicador:indicadores (
              id,
              nome,
              codigo
            )
          `)
          .eq('dashboard_id', config.id);
      } else if (config.tipo_visualizacao === 'list') {
        query = supabase
          .from('vendas_list_components')
          .select(`
            *,
            categoria:categorias (
              id,
              nome,
              codigo
            ),
            indicador:indicadores (
              id,
              nome,
              codigo
            ),
            cliente:clientes (
              id,
              razao_social
            )
          `)
          .eq('dashboard_id', config.id);
      } else {
        query = supabase
          .from('vendas_card_components')
          .select(`
            *,
            categoria:categorias (
              id,
              nome,
              codigo
            ),
            indicador:indicadores (
              id,
              nome,
              codigo
            )
          `)
          .eq('dashboard_id', config.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setComponentes(data || []);
    } catch (err) {
      console.error('Erro ao carregar componentes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="text-gray-400 text-center py-8">
        Selecione uma configuração para visualizar seus componentes
      </div>
    );
  }

  const renderComponent = (comp: any) => {
    if (!comp) return null;

    let content;
    if (comp.categoria) {
      content = (
        <>
          <span className="text-white">{comp.categoria.nome}</span>
          <span className="text-gray-400 text-sm ml-2">({comp.categoria.codigo})</span>
        </>
      );
    } else if (comp.indicador) {
      content = (
        <>
          <span className="text-white">{comp.indicador.nome}</span>
          <span className="text-gray-400 text-sm ml-2">({comp.indicador.codigo})</span>
        </>
      );
    } else if (comp.cliente) {
      content = <span className="text-white">{comp.cliente.razao_social}</span>;
    } else {
      return null;
    }

    return (
      <div key={comp.id} className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {(config.tipo_visualizacao === 'chart' || config.tipo_visualizacao === 'card') && (
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: comp.cor }}
            />
          )}
          <div>{content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Componentes</h3>
        <Button
          variant="secondary"
          icon={Calculator}
          onClick={onManageComponents}
        >
          Gerenciar
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : componentes.length === 0 ? (
          <p className="text-gray-400 text-center">
            Nenhum componente configurado
          </p>
        ) : (
          componentes.map(renderComponent)
        )}
      </div>
    </div>
  );
};

export default VendasComponentsPanel;