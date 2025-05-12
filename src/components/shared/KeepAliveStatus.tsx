import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface KeepAliveLog {
  id: string;
  timestamp: string;
  success: boolean;
  details: string;
}

export const KeepAliveStatus: React.FC = () => {
  const [lastLog, setLastLog] = useState<KeepAliveLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLastLog();
  }, []);

  const fetchLastLog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('keep_alive_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar logs de keep-alive:', error);
      }

      if (data) {
        setLastLog(data as KeepAliveLog);
      }
    } catch (err) {
      console.error('Erro ao buscar status do keep-alive:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} h atrás`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} dias atrás`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Clock size={16} className="animate-pulse" />
        <span>Verificando status...</span>
      </div>
    );
  }

  if (!lastLog) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <XCircle size={16} />
        <span>Sem registros de atividade</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {lastLog.success ? (
        <CheckCircle size={16} className="text-green-500" />
      ) : (
        <XCircle size={16} className="text-red-500" />
      )}
      <span className={lastLog.success ? 'text-green-400' : 'text-red-400'}>
        Última verificação: {getTimeSince(lastLog.timestamp)}
      </span>
    </div>
  );
};