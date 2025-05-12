import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { Button } from '../components/shared/Button';
import { RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface KeepAliveLog {
  id: string;
  timestamp: string;
  success: boolean;
  details: string;
}

const KeepAlivePage: React.FC = () => {
  const [logs, setLogs] = useState<KeepAliveLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('keep_alive_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError('Não foi possível carregar os logs de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const triggerManualKeepAlive = async () => {
    try {
      setRefreshing(true);
      
      // Chamar a função register_keep_alive
      const { error } = await supabase.rpc('register_keep_alive');
      
      if (error) throw error;
      
      // Registrar o sucesso nos logs
      await supabase
        .from('keep_alive_logs')
        .insert({
          success: true,
          details: 'Consulta de manutenção executada manualmente'
        });
      
      // Atualizar a lista de logs
      await fetchLogs();
    } catch (err) {
      console.error('Erro ao executar keep-alive manual:', err);
      setError('Não foi possível executar a consulta de manutenção');
      
      // Tentar registrar o erro
      try {
        await supabase
          .from('keep_alive_logs')
          .insert({
            success: false,
            details: `Erro na execução manual: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          });
      } catch (logError) {
        console.error('Erro ao registrar falha:', logError);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Sistema Keep-Alive</h2>
          <p className="text-gray-400 mt-1">
            Monitoramento das consultas de manutenção para evitar a pausa do projeto
          </p>
        </div>
        <Button
          onClick={triggerManualKeepAlive}
          icon={RefreshCw}
          loading={refreshing}
        >
          Executar Agora
        </Button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Informações do Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-gray-400">
              <span className="font-medium">Horário programado:</span>{' '}
              <span className="text-white">Diariamente às 20:00</span>
            </p>
            <p className="text-gray-400">
              <span className="font-medium">Total de registros:</span>{' '}
              <span className="text-white">{logs.length}</span>
            </p>
            <p className="text-gray-400">
              <span className="font-medium">Último registro:</span>{' '}
              <span className="text-white">
                {logs.length > 0 ? formatDate(logs[0].timestamp) : 'Nenhum registro'}
              </span>
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-400">
              <span className="font-medium">Status:</span>{' '}
              <span className={logs.length > 0 && logs[0].success ? 'text-green-400' : 'text-red-400'}>
                {logs.length > 0 && logs[0].success ? 'Funcionando' : 'Com problemas'}
              </span>
            </p>
            <p className="text-gray-400">
              <span className="font-medium">Sucesso:</span>{' '}
              <span className="text-white">
                {logs.filter(log => log.success).length} de {logs.length}
              </span>
            </p>
            <p className="text-gray-400">
              <span className="font-medium">Falhas:</span>{' '}
              <span className="text-white">
                {logs.filter(log => !log.success).length} de {logs.length}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Histórico de Consultas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="text-left p-4 text-gray-400">Data/Hora</th>
                <th className="text-left p-4 text-gray-400">Status</th>
                <th className="text-left p-4 text-gray-400">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-400">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-700">
                    <td className="p-4 text-white">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="p-4">
                      {log.success ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle size={16} />
                          <span>Sucesso</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle size={16} />
                          <span>Falha</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-white">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeepAlivePage;