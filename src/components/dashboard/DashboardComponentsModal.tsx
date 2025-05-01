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
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar dados básicos
      const [{ data: categoriasData }, { data: indicadoresData }, { data: clientesData }] = await Promise.all([
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('clientes')
          .select('*')
          .eq('ativo', true)
          .order('razao_social')
      ]);

      if (categoriasData) setCategorias(categoriasData);
      if (indicadoresData) setIndicadores(indicadoresData);
      if (clientesData) setClientes(clientesData);

      // Buscar componentes existentes baseado no tipo de visualização
      let componentsData;
      if (config.tipo_visualizacao === 'chart') {
        const { data } = await supabase
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
        componentsData = data;
      } else if (config.tipo_visualizacao === 'list') {
        const { data } = await supabase
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
            ),
            cliente:clientes (
              id,
              razao_social
            )
          `)
          .eq('dashboard_id', config.id);
        componentsData = data;
      }

      if (componentsData) {
        setSelectedComponents(componentsData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Determinar tabela baseado no tipo de visualização
      let table = '';
      let componentsData;

      if (config.tipo_visualizacao === 'chart') {
        table = 'dashboard_chart_components';
        componentsData = selectedComponents.map((comp, index) => ({
          dashboard_id: config.id,
          categoria_id: comp.categoria?.id || null,
          indicador_id: comp.indicador?.id || null,
          ordem: index + 1,
          cor: comp.cor || '#3B82F6'
        }));
      } else if (config.tipo_visualizacao === 'list') {
        table = 'dashboard_list_components';
        componentsData = selectedComponents.map((comp, index) => ({
          dashboard_id: config.id,
          categoria_id: comp.categoria?.id || null,
          indicador_id: comp.indicador?.id || null,
          cliente_id: comp.cliente?.id || null,
          ordem: index + 1
        }));
      }

      if (table) {
        // Deletar componentes existentes
        await supabase
          .from(table)
          .delete()
          .eq('dashboard_id', config.id);

        // Inserir novos componentes
        if (componentsData && componentsData.length > 0) {
          const { error } = await supabase
            .from(table)
            .insert(componentsData);

          if (error) throw error;
        }
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

  const addComponent = (tipo: 'categoria' | 'indicador' | 'cliente', item: any) => {
    setSelectedComponents(prev => [...prev, {
      [tipo]: item,
      cor: config.tipo_visualizacao === 'chart' ? '#3B82F6' : undefined
    }]);
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

  const filteredCategorias = categorias.filter(cat => 
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIndicadores = indicadores.filter(ind => 
    ind.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClientes = clientes.filter(cliente => 
    cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Itens Disponíveis</h4>
            <div className="space-y-4">
              {/* Categorias */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-400 mb-3">Categorias</h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {filteredCategorias
                    .filter(cat => !selectedComponents.some(c => c.categoria?.id === cat.id))
                    .map(categoria => (
                      <button
                        key={categoria.id}
                        onClick={() => addComponent('categoria', categoria)}
                        className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="text-white">{categoria.nome}</span>
                          <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Indicadores */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-400 mb-3">Indicadores</h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {filteredIndicadores
                    .filter(ind => !selectedComponents.some(c => c.indicador?.id === ind.id))
                    .map(indicador => (
                      <button
                        key={indicador.id}
                        onClick={() => addComponent('indicador', indicador)}
                        className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
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

              {/* Clientes (apenas para listas) */}
              {config.tipo_visualizacao === 'list' && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">Clientes</h5>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {filteredClientes
                      .filter(cliente => !selectedComponents.some(c => c.cliente?.id === cliente.id))
                      .map(cliente => (
                        <button
                          key={cliente.id}
                          onClick={() => addComponent('cliente', cliente)}
                          className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
                        >
                          <span className="text-white">{cliente.razao_social}</span>
                          <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Itens Selecionados</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
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
                      ) : comp.cliente ? (
                        <span className="text-white">{comp.cliente.razao_social}</span>
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