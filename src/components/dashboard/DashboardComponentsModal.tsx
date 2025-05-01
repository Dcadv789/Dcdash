import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface DashboardComponentsModalProps {
  config: any;
  onClose: () => void;
  onSave: () => void;
}

const DashboardComponentsModal: React.FC<DashboardComponentsModalProps> = ({
  config,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: categoriasData }, { data: indicadoresData }] = await Promise.all([
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo')
      ]);

      if (categoriasData) setCategorias(categoriasData);
      if (indicadoresData) setIndicadores(indicadoresData);

      // Buscar componentes existentes baseado no tipo de visualização
      if (config.tipo_visualizacao === 'chart') {
        const { data: chartComponents } = await supabase
          .from('dashboard_chart_components')
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

        if (chartComponents) {
          setSelectedComponents(chartComponents.map(comp => ({
            ...comp,
            cor: comp.cor || '#3B82F6'
          })));
        }
      } else if (config.tipo_visualizacao === 'list') {
        const { data: listComponents } = await supabase
          .from('dashboard_list_components')
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

        if (listComponents) {
          setSelectedComponents(listComponents);
        }
      } else if (config.tipo_visualizacao === 'card') {
        if (config.categoria_id) {
          const categoria = categoriasData?.find(c => c.id === config.categoria_id);
          if (categoria) {
            setSelectedComponents([{ categoria }]);
          }
        } else if (config.indicador_id) {
          const indicador = indicadoresData?.find(i => i.id === config.indicador_id);
          if (indicador) {
            setSelectedComponents([{ indicador }]);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (config.tipo_visualizacao === 'chart') {
        // Remover componentes existentes
        await supabase
          .from('dashboard_chart_components')
          .delete()
          .eq('dashboard_id', config.id);

        // Inserir novos componentes
        if (selectedComponents.length > 0) {
          const { error } = await supabase
            .from('dashboard_chart_components')
            .insert(
              selectedComponents.map((comp, index) => ({
                dashboard_id: config.id,
                categoria_id: comp.categoria?.id || null,
                indicador_id: comp.indicador?.id || null,
                ordem: index + 1,
                cor: comp.cor || '#3B82F6'
              }))
            );

          if (error) throw error;
        }
      } else if (config.tipo_visualizacao === 'list') {
        // Remover componentes existentes
        await supabase
          .from('dashboard_list_components')
          .delete()
          .eq('dashboard_id', config.id);

        // Inserir novos componentes
        if (selectedComponents.length > 0) {
          const { error } = await supabase
            .from('dashboard_list_components')
            .insert(
              selectedComponents.map((comp, index) => ({
                dashboard_id: config.id,
                categoria_id: comp.categoria?.id || null,
                indicador_id: comp.indicador?.id || null,
                ordem: index + 1
              }))
            );

          if (error) throw error;
        }
      } else if (config.tipo_visualizacao === 'card') {
        // Atualizar a configuração do card
        const { error } = await supabase
          .from('dashboard_config')
          .update({
            categoria_id: selectedComponents[0]?.categoria?.id || null,
            indicador_id: selectedComponents[0]?.indicador?.id || null
          })
          .eq('id', config.id);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar componentes:', err);
      setError('Não foi possível salvar os componentes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIndicadores = indicadores.filter(ind => 
    ind.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addComponent = (tipo: 'categoria' | 'indicador', item: any) => {
    if (config.tipo_visualizacao === 'card') {
      setSelectedComponents([{ [tipo]: item }]);
    } else {
      setSelectedComponents(prev => [...prev, {
        [tipo]: item,
        cor: config.tipo_visualizacao === 'chart' ? '#3B82F6' : undefined
      }]);
    }
  };

  const removeComponent = (index: number) => {
    setSelectedComponents(prev => prev.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, cor: string) => {
    if (config.tipo_visualizacao !== 'chart') return;
    
    setSelectedComponents(prev => prev.map((comp, i) => 
      i === index ? { ...comp, cor } : comp
    ));
  };

  return (
    <Modal
      title="Gerenciar Componentes"
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Itens Disponíveis</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredCategorias
                .filter(cat => !selectedComponents.some(c => c.categoria?.id === cat.id))
                .map(categoria => (
                  <button
                    key={categoria.id}
                    onClick={() => addComponent('categoria', categoria)}
                    className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
                    disabled={config.tipo_visualizacao === 'card' && selectedComponents.length > 0}
                  >
                    <div>
                      <span className="text-white">{categoria.nome}</span>
                      <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}

              {filteredIndicadores
                .filter(ind => !selectedComponents.some(c => c.indicador?.id === ind.id))
                .map(indicador => (
                  <button
                    key={indicador.id}
                    onClick={() => addComponent('indicador', indicador)}
                    className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
                    disabled={config.tipo_visualizacao === 'card' && selectedComponents.length > 0}
                  >
                    <div>
                      <span className="text-white">{indicador.nome}</span>
                      <span className="text-gray-400 text-sm ml-2">({indicador.codigo})</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Itens Selecionados</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {selectedComponents.map((comp, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg group">
                  <button
                    onClick={() => removeComponent(index)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded opacity-0 group-hover:opacity-100"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex-1">
                    {comp.categoria ? (
                      <div>
                        <span className="text-white">{comp.categoria.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({comp.categoria.codigo})</span>
                      </div>
                    ) : comp.indicador ? (
                      <div>
                        <span className="text-white">{comp.indicador.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({comp.indicador.codigo})</span>
                      </div>
                    ) : null}
                  </div>
                  {config.tipo_visualizacao === 'chart' && (
                    <input
                      type="color"
                      value={comp.cor}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent"
                    />
                  )}
                </div>
              ))}

              {selectedComponents.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  Nenhum item selecionado
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DashboardComponentsModal;