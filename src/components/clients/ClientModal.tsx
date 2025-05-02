import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Cliente } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface ClientModalProps {
  client?: Cliente;
  selectedEmpresa: string;
  onClose: () => void;
  onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ 
  client, 
  selectedEmpresa,
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    razao_social: client?.razao_social || '',
    nome_fantasia: client?.nome_fantasia || '',
    cnpj: client?.cnpj || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (client) {
        const { error } = await supabase
          .from('clientes')
          .update({
            razao_social: formData.razao_social,
            nome_fantasia: formData.nome_fantasia || null,
            cnpj: formData.cnpj || null,
          })
          .eq('id', client.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{
            razao_social: formData.razao_social,
            nome_fantasia: formData.nome_fantasia || null,
            cnpj: formData.cnpj || null,
            empresa_id: selectedEmpresa,
            ativo: true,
          }]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Não foi possível salvar o cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.razao_social}
              onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={formData.nome_fantasia}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">