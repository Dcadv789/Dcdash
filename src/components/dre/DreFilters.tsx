import React from 'react';
import { Empresa } from '../../types/database';
import { Button } from '../shared/Button';

interface DreFiltersProps {
  selectedEmpresa: string;
  selectedYear: number;
  selectedMonth: number;
  empresas: Empresa[];
  showVariation: boolean;
  periodType: '6M' | '13M';
  onEmpresaChange: (empresaId: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onToggleVariation: () => void;
  onPeriodTypeChange: (type: '6M' | '13M') => void;
}

const DreFilters: React.FC<DreFiltersProps> = ({
  selectedEmpresa,
  selectedYear,
  selectedMonth,
  empresas = [],
  showVariation,
  periodType,
  onEmpresaChange,
  onYearChange,
  onMonthChange,
  onToggleVariation,
  onPeriodTypeChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4">
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

        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={periodType === '6M' ? 'primary' : 'secondary'}
            onClick={() => onPeriodTypeChange('6M')}
          >
            Últimos 6 meses
          </Button>
          <Button
            variant={periodType === '13M' ? 'primary' : 'secondary'}
            onClick={() => onPeriodTypeChange('13M')}
          >
            Últimos 13 meses
          </Button>
        </div>

        <div className="ml-auto">
          <Button
            variant={showVariation ? 'primary' : 'secondary'}
            onClick={onToggleVariation}
          >
            {showVariation ? 'Sem variação %' : 'Com variação %'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DreFilters;