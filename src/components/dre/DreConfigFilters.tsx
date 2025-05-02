import React from 'react';
import { Search } from 'lucide-react';
import { Empresa } from '../../types/database';
import { Button } from '../shared/Button';

interface DreConfigFiltersProps {
  selectedEmpresa: string;
  selectedType: 'todos' | '+' | '-' | '=';
  searchTerm: string;
  empresas: Empresa[];
  onEmpresaChange: (empresaId: string) => void;
  onTypeChange: (type: 'todos' | '+' | '-' | '=') => void;
  onSearchChange: (term: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const DreConfigFilters: React.FC<DreConfigFiltersProps> = ({
  selectedEmpresa,
  selectedType,
  searchTerm,
  empresas,
  onEmpresaChange,
  onTypeChange,
  onSearchChange,
  onKeyDown,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4 w-full">
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

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar por nome... (pressione Enter)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedType === 'todos' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('todos')}
            className="px-6"
          >
            Todos
          </Button>
          <Button
            variant={selectedType === '+' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('+')}
            className="px-6"
          >
            Soma (+)
          </Button>
          <Button
            variant={selectedType === '-' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('-')}
            className="px-6"
          >
            Subtração (-)
          </Button>
          <Button
            variant={selectedType === '=' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('=')}
            className="px-6"
          >
            Resultado (=)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DreConfigFilters;