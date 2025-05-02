import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface DashboardConfigModalProps {
  empresaId: string;
  config?: any;
  onClose: () => void;
  onSave: () => void;
  table?: 'dashboard_config' | 'vendas_config' | 'analise_config';
}

const DashboardConfigModal: React.FC<DashboardConfigModalProps> = ({
  empresaId,
  config,
  onClose,
  onSave,
  table = 'dashboard_config'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    posicao: config?.posicao.toString() || '',
    titulo: config?.titulo || '',
    tipo_visualizacao: config?.tipo_visualizacao || 'card',
    tipo_grafico: config?.tipo_grafico || 'line',
    lista_tipo: config?.lista_tipo || 'categoria',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const saveData = {
        posicao: parseInt(formData.posicao),
        titulo: formData.titulo,
        tipo_visualizacao: formData.tipo_visualizacao,
        tipo_grafico: formData.tipo_visualizacao === 'chart' ? formData.tipo_grafico : null,
        lista_tipo: formData.tipo_visualizacao === 'list' ? formData.lista_tipo : null,
        empresa_id: empresaId,
      };

      if (config) {
        const { error } = await supabase
          .from(table)
          .update(saveData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([saveData]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
      setError('Não foi possível salvar a configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={config ? 'Editar Configuração' : 'Nova Configuração'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Posição (1-7)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.posicao}
            onChange={(e) => setFormData(prev => ({ ...prev, posicao: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Título
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tipo de Visualização
          </label>
          <select
            value={formData.tipo_visualizacao}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              tipo_visualizacao: e.target.value as 'card' | 'chart' | 'list'
            }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="card">Card</option>
            <option value="chart">Gráfico</option>
            <option value="list">Lista</option>
          </select>
        </div>

        {formData.tipo_visualizacao === 'chart' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo de Gráfico
            </label>
            <select
              value={formData.tipo_grafico}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo_grafico: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="line">Linha</option>
              <option value="bar">Barras</option>
              <option value="area">Área</option>
              <option value="pie">Pizza</option>
            </select>
          </div>
        )}

        {formData.tipo_visualizacao === 'list' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo de Lista
            </label>
            <select
              value={formData.lista_tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, lista_tipo: e.target.value as 'categoria' | 'cliente' }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="categoria">Categorias</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DashboardConfigModal;