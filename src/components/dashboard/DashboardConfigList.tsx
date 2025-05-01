import React from 'react';
import { Eye, Pencil, Calculator, Power } from 'lucide-react';

interface DashboardConfigListProps {
  configs: any[];
  selectedConfig?: any;
  expandedContas?: Set<string>;
  onSelect: (config: any) => void;
  onEdit: (config: any) => void;
  onView: (config: any) => void;
  onManageComponents: (config: any) => void;
  onToggleActive?: (config: any) => void;
}

const DashboardConfigList: React.FC<DashboardConfigListProps> = ({
  configs,
  selectedConfig,
  onSelect,
  onEdit,
  onView,
  onManageComponents,
  onToggleActive,
}) => {
  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="text-left p-4 text-gray-400">Posição</th>
            <th className="text-left p-4 text-gray-400">Título</th>
            <th className="text-left p-4 text-gray-400">Tipo</th>
            <th className="text-right p-4 text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => (
            <tr 
              key={config.id} 
              className={`border-b border-gray-800 cursor-pointer transition-colors hover:bg-gray-900 ${
                selectedConfig?.id === config.id ? 'bg-gray-900' : ''
              }`}
              onClick={() => onSelect(config)}
            >
              <td className="p-4 text-white">{config.posicao}</td>
              <td className="p-4 text-white">{config.titulo}</td>
              <td className="p-4 text-white capitalize">{config.tipo_visualizacao}</td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(config);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(config);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageComponents(config);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Gerenciar Componentes"
                  >
                    <Calculator size={18} />
                  </button>
                  {onToggleActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(config);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        config.ativo 
                          ? 'text-green-500 hover:text-green-400'
                          : 'text-red-500 hover:text-red-400'
                      } hover:bg-gray-700`}
                      title={config.ativo ? 'Desativar' : 'Ativar'}
                    >
                      <Power size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardConfigList;