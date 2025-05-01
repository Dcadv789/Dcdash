import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '../shared/Button';

interface DashboardComponentsPanelProps {
  config?: any;
  onManageComponents: () => void;
}

const DashboardComponentsPanel: React.FC<DashboardComponentsPanelProps> = ({
  config,
  onManageComponents,
}) => {
  if (!config) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-gray-400 text-center">
          Selecione um item para visualizar seus componentes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Componentes</h3>
        <Button
          variant="secondary"
          icon={Calculator}
          onClick={onManageComponents}
        >
          Gerenciar
        </Button>
      </div>

      <div className="space-y-4">
        {config.chart_components?.map((comp: any) => (
          <div key={comp.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: comp.cor }}
              />
              <div>
                {comp.categoria ? (
                  <span className="text-white">{comp.categoria.nome}</span>
                ) : comp.indicador ? (
                  <span className="text-white">{comp.indicador.nome}</span>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {(!config.chart_components || config.chart_components.length === 0) && (
          <p className="text-gray-400 text-center">
            Nenhum componente configurado
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardComponentsPanel;