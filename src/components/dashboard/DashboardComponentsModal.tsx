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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar categorias e indicadores
      const [{ data: categoriasData }, { data: indicadoresData }, { data: componentesData }] = await Promise.all([
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
          .eq('dashboard_id', config.id)
      ]);

      if (categoriasData) setCategorias(categoriasData);
      if (indicadoresData) setIndicadores(indicadoresData);
      if (componentesData) setSelectedComponents(componentesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
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

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar componentes:', err);
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
    setSelectedComponents(prev => [...prev, {
      [tipo]: item,
      cor: '#3B82F6'
    }]);
  };

  const removeComponent = (index: number) => {
    setSelectedComponents(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title="Gerenciar Componentes"
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
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
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredCategorias.map(categoria => (
                <button
                  key={`cat-${categoria.id}`}
                  onClick={() => addComponent('categoria', categoria)}
                  className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between"
                  disabled={selectedComponents.some(c => c.categoria?.id === categoria.id)}
                >
                  <div>
                    <span className="text-white">{categoria.nome}</span>
                    <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
              {filteredIndicadores.map(indicador => (
                <button
                  key={`ind-${indicador.id}`}
                  onClick={() => addComponent('indicador', indicador)}
                  className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between"
                  disabled={selectedComponents.some(c => c.indicador?.id === indicador.id)}
                >
                  <div>
                    <span className="text-white">{indicador.nome}</span>
                    <span className="text-gray-400 text-sm ml-2">({indicador.codigo})</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Itens Selecionados</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedComponents.map((comp, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-600 rounded-lg">
                  <button
                    onClick={() => removeComponent(index)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} className="text-gray-400" />
                    <div>
                      <span className="text-white">
                        {comp.categoria?.nome || comp.indicador?.nome}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({comp.categoria?.codigo || comp.indicador?.codigo})
                      </span>
                    </div>
                  </button>
                  <input
                    type="color"
                    value={comp.cor}
                    onChange={(e) => {
                      const newComponents = [...selectedComponents];
                      newComponents[index].cor = e.target.value;
                      setSelectedComponents(newComponents);
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
              ))}
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