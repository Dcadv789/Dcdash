import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import DashboardConfigList from '../components/dashboard/DashboardConfigList';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardConfigModal from '../components/dashboard/DashboardConfigModal';
import DashboardComponentsPanel from '../components/dashboard/DashboardComponentsPanel';

const ConfigDashboardPage: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'todos' | 'card' | 'chart' | 'list'>('todos');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);

  const { data: empresas } = useSupabaseQuery({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: configs, loading, error, refetch } = useSupabaseQuery({
    query: () => {
      if (!selectedEmpresa) return Promise.resolve({ data: [] });

      let query = supabase
        .from('dashboard_config')
        .select(`
          *,
          indicador:indicadores (
            id,
            nome,
            codigo
          ),
          categoria:categorias (
            id,
            nome,
            codigo
          ),
          chart_components:dashboard_chart_components (
            id,
            ordem,
            cor,
            categoria:categorias (
              id,
              nome
            ),
            indicador:indicadores (
              id,
              nome
            )
          )
        `)
        .eq('empresa_id', selectedEmpresa)
        .order('posicao');

      if (!showInactive) {
        query = query.eq('ativo', true);
      }

      if (selectedType !== 'todos') {
        query = query.eq('tipo_visualizacao', selectedType);
      }

      return query;
    },
    dependencies: [selectedEmpresa, selectedType, showInactive],
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Configuração do Dashboard</h2>
          <p className="text-gray-400 mt-1">Configure os indicadores e categorias que serão exibidos no dashboard</p>
        </div>
        <Button
          onClick={() => {
            setSelectedConfig(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Novo Card
        </Button>
      </div>

      <DashboardFilters
        selectedEmpresa={selectedEmpresa}
        selectedType={selectedType}
        showInactive={showInactive}
        empresas={empresas}
        onEmpresaChange={setSelectedEmpresa}
        onTypeChange={setSelectedType}
        onToggleInactive={() => setShowInactive(!showInactive)}
      />

      {!selectedEmpresa ? (
        <EmptyState message="Selecione uma empresa para configurar o dashboard" />
      ) : (
        <div className="flex gap-6">
          <div className="flex-[6]">
            {configs.length === 0 ? (
              <EmptyState message="Nenhuma configuração encontrada" />
            ) : (
              <DashboardConfigList
                configs={configs}
                selectedConfig={selectedConfig}
                onSelect={setSelectedConfig}
                onView={(config) => {
                  setSelectedConfig(config);
                  setIsViewModalOpen(true);
                }}
                onEdit={(config) => {
                  setSelectedConfig(config);
                  setIsModalOpen(true);
                }}
                onManageComponents={(config) => {
                  setSelectedConfig(config);
                  setIsComponentsModalOpen(true);
                }}
              />
            )}
          </div>

          <div className="flex-[4]">
            <DashboardComponentsPanel
              config={selectedConfig}
              onManageComponents={() => setIsComponentsModalOpen(true)}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <DashboardConfigModal
          empresaId={selectedEmpresa}
          config={selectedConfig}
          onClose={() => {
            setSelectedConfig(null);
            setIsModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default ConfigDashboardPage;