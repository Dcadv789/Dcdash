import React, { useState } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

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
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Aqui você implementaria a lógica para buscar categorias e indicadores
  const availableCategories = []; // Buscar do Supabase
  const availableIndicators = []; // Buscar do Supabase

  const handleSave = async () => {
    setLoading(true);
    try {
      // Implementar lógica de salvamento
      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar componentes:', err);
    } finally {
      setLoading(false);
    }
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
            placeholder="Buscar por nome..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Categorias */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Categorias</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {/* Lista de categorias disponíveis */}
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Indicadores</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {/* Lista de indicadores disponíveis */}
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
}

export default DashboardComponentsModal;