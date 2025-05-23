import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import DashboardConfigList from '../components/dashboard/DashboardConfigList';
import DashboardConfigFilters from '../components/dashboard/DashboardConfigFilters';
import DashboardConfigModal from '../components/dashboard/DashboardConfigModal';
import DashboardConfigViewModal from '../components/dashboard/DashboardConfigViewModal';
import AnalysisComponentsPanel from '../components/analysis/AnalysisComponentsPanel';
import DashboardComponentsModal from '../components/dashboard/DashboardComponentsModal';

const ConfigAnalysePage: React.FC = () => {
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
        .from('analise_config')
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
          )
        `)
        .eq('empresa_id', selectedEmpresa);

      if (!showInactive) {
        query = query.eq('ativo', true);
      }

      if (selectedType !== 'todos') {
        query = query.eq('tipo_visualizacao', selectedType);
      }

      return query.order('posicao');
    },
    dependencies: [selectedEmpresa, selectedType, showInactive],
  });

  const handleToggleActive = async (config: any) => {
    try {
      const { error } = await supabase
        .from('analise_config')
        .update({ ativo: !config.ativo })
        .eq('id', config.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Não foi possível atualizar o status da configuração');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Configuração do Dashboard de Análise</h2>
          <p className="text-gray-400 mt-1">Configure os indicadores e categorias que serão exibidos no dashboard de análise</p>
        </div>
        <Button
          onClick={() => {
            if (!selectedEmpresa) {
              alert('Selecione uma empresa primeiro');
              return;
            }
            setSelectedConfig(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Novo Card
        </Button>
      </div>

      <DashboardConfigFilters
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
                onToggleActive={handleToggleActive}
              />
            )}
          </div>

          <div className="flex-[4]">
            <AnalysisComponentsPanel
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
          table="analise_config"
        />
      )}

      {isViewModalOpen && selectedConfig && (
        <DashboardConfigViewModal
          config={selectedConfig}
          onClose={() => {
            setSelectedConfig(null);
            setIsViewModalOpen(false);
          }}
        />
      )}

      {isComponentsModalOpen && selectedConfig && (
        <DashboardComponentsModal
          config={selectedConfig}
          onClose={() => {
            setIsComponentsModalOpen(false);
          }}
          onSave={() => {
            refetch();
          }}
          table="analise_config"
        />
      )}
    </div>
  );
};

export default ConfigAnalysePage;