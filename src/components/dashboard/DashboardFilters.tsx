import React from 'react';
import { Button } from '../shared/Button';
import { Empresa } from '../../types/database';

interface DashboardFiltersProps {
  selectedEmpresa: string;
  selectedType: 'todos' | 'card' | 'chart' | 'list';
  showInactive: boolean;
  empresas: Empresa[];
  onEmpresaChange: (empresaId: string) => void;
  onTypeChange: (type: 'todos' | 'card' | 'chart' | 'list') => void;
  onToggleInactive: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedEmpresa,
  selectedType,
  showInactive,
  empresas,
  onEmpresaChange,
  onTypeChange,
  onToggleInactive,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <select
            value={selectedEmpresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Selecione uma empresa</option>
            {empresas?.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razao_social}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant={selectedType === 'todos' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('todos')}
            className="px-6"
          >
            Todos
          </Button>
          <Button
            variant={selectedType === 'card' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('card')}
            className="px-6"
          >
            Cards
          </Button>
          <Button
            variant={selectedType === 'chart' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('chart')}
            className="px-6"
          >
            Gráficos
          </Button>
          <Button
            variant={selectedType === 'list' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('list')}
            className="px-6"
          >
            Listas
          </Button>
          <Button
            variant={showInactive ? 'primary' : 'secondary'}
            onClick={onToggleInactive}
            className="px-6"
          >
            {showInactive ? 'Mostrar Inativos' : 'Ocultar Inativos'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;