import React, { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/forms/Button';
import CompanyModal from '../components/forms/CompanyModal';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ativo: boolean;
  socios: any[];
  created_at: string;
}

const Empresas: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Empresa | undefined>();

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingCompany(empresa);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await carregarEmpresas();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    }
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo
      ? 'bg-green-500/10 text-green-500'
      : 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-300">Gestão de Empresas</h2>
              <p className="text-gray-400 mt-1">
                Gerencie as empresas cadastradas no sistema e seus dados
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCompany(undefined);
                setIsModalOpen(true);
              }}
              className="!w-auto !px-2 !py-1.5 !bg-blue-500 hover:!bg-blue-600 flex items-center gap-1.5 text-sm"
            >
              <Plus size={14} />
              Nova
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {empresa.nome_fantasia || empresa.razao_social}
                      </h3>
                      <p className="text-sm text-gray-400">{empresa.cnpj || 'CNPJ não cadastrado'}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        empresa.ativo
                      )}`}
                    >
                      {empresa.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      <strong>Razão Social:</strong> {empresa.razao_social}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Sócios:</strong>{' '}
                      {empresa.socios?.length
                        ? empresa.socios.length
                        : 'Nenhum sócio cadastrado'}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => console.log('View company', empresa.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(empresa)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(empresa.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(undefined);
        }}
        onSuccess={carregarEmpresas}
        editingCompany={editingCompany}
      />
    </div>
  );
};

export default Empresas;