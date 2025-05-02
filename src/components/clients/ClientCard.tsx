import React from 'react';
import { Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import { Cliente } from '../../types/database';
import { formatCNPJ } from '../../utils/formatters';

interface ClientCardProps {
  client: Cliente;
  onView: (client: Cliente) => void;
  onEdit: (client: Cliente) => void;
  onDelete: (client: Cliente) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
            <Building2 className="text-gray-500" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{client.razao_social}</h3>
            <p className="text-gray-400 text-sm">{client.nome_fantasia || 'Nome Fantasia não informado'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          client.ativo 
            ? 'bg-green-500/20 text-green-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {client.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Building2 size={16} className="text-gray-400" />
          <span className="text-gray-400">CNPJ:</span>
          <span className="text-white">{formatCNPJ(client.cnpj)}</span>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={() => onView(client)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          title="Visualizar"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEdit(client)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(client)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ClientCard;