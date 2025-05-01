import React from 'react';
import { Modal } from '../shared/Modal';

interface DashboardConfigViewModalProps {
  config: any;
  onClose: () => void;
}

const DashboardConfigViewModal: React.FC<DashboardConfigViewModalProps> = ({
  config,
  onClose,
}) => {
  return (
    <Modal
      title="Detalhes da Configuração"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Posição</label>
          <p className="text-lg text-white">{config.posicao}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
          <p className="text-lg text-white">{config.titulo}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Visualização</label>
          <p className="text-lg text-white capitalize">{config.tipo_visualizacao}</p>
        </div>

        {config.tipo_visualizacao === 'chart' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Gráfico</label>
            <p className="text-lg text-white capitalize">{config.tipo_grafico}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Componente Principal</label>
          <p className="text-lg text-white">
            {config.categoria?.nome || config.indicador?.nome || '-'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Empresa</label>
          <p className="text-lg text-white">{config.empresa?.razao_social || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            config.ativo 
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {config.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default DashboardConfigViewModal;