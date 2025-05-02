import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Cliente, Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import ClientCard from '../components/clients/ClientCard';
import ClientModal from '../components/clients/ClientModal';

const ClientsPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: clients, loading, error, refetch } = useSupabaseQuery<Cliente>({
    query: () => {
      let query = supabase
        .from('clientes')
        .select(`
          *,
          empresa:empresas (
            id,
            razao_social
          )
        `);

      if (selectedEmpresa) {
        query = query.eq('empresa_id', selectedEmpresa);
      }

      return query.order('razao_social');
    },
    dependencies: [selectedEmpresa],
  });

  const handleDelete = async (client: Cliente) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', client.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      alert('Não foi possível excluir o cliente');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Clientes</h2>
          <p className="text-gray-400 mt-1">Gerencie os clientes cadastrados no sistema</p>
        </div>
        <Button
          onClick={() => {
            if (!selectedEmpresa) {
              alert('Selecione uma empresa primeiro');
              return;
            }
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Novo Cliente
        </Button>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Todas as empresas</option>
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
        </div>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="Nenhum cliente encontrado." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onView={() => {
                setSelectedClient(client);
                setIsViewModalOpen(true);
              }}
              onEdit={() => {
                setSelectedClient(client);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ClientModal
          client={selectedClient || undefined}
          selectedEmpresa={selectedEmpresa}
          onClose={() => {
            setSelectedClient(null);
            setIsModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default ClientsPage;