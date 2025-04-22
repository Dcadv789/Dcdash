import React from 'react';
import Card from '../components/Card';
import PageTitle from '../components/PageTitle';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" />
      
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-300">Bem-vindo ao seu Dashboard</h2>
          <p className="text-gray-400">
            Este painel de controle fornece uma visão geral completa do seu sistema,
            permitindo monitorar métricas importantes, gerar relatórios e acompanhar
            indicadores de desempenho em tempo real.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;