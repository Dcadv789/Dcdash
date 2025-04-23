import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Input from './Input';
import Button from './Button';
import { useNotification } from '../notifications/useNotification';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authData.user?.id)
        .single();

      if (userError) throw userError;

      // Atualizar os claims do JWT com a permissão do usuário
      const { error: updateError } = await supabase.auth.refreshSession({
        refresh_token: authData.session?.refresh_token ?? '',
      });

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      notifyError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
        <p className="text-gray-400">Faça login para continuar</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            label="Email"
            type="email"
            className="pl-12"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            label="Senha"
            type="password"
            className="pl-12"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" loading={loading}>
        Entrar
      </Button>
    </form>
  );
};

export default LoginForm;