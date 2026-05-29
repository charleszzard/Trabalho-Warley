import React from 'react';
import { BellRing, TrendingUp, Network, Sigma } from 'lucide-react';
import type { AppState } from '../types';
import Dashboard from '../components/Dashboard';
import GaussianChart from '../components/GaussianChart';
import NormalDistributionChart from '../components/NormalDistributionChart';
import PackFlowChart from '../components/PackFlowChart';
import CorrelationPanel from '../components/CorrelationPanel';

interface DashboardPageProps {
  stats: AppState | null;
}

const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-neonBlue">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="glass-panel p-12 flex items-center justify-center text-gray-400 animate-pulse">
        Carregando dados do modelo...
      </div>
    );
  }

  const dist = stats.predictive_distribution;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <Dashboard stats={stats} />

      {/* Predictive Gaussian (bell curve) */}
      <div className="glass-panel p-6">
        <SectionTitle
          icon={BellRing}
          title="Curva Gaussiana dos Pacotes Abertos"
          subtitle="Distribuição normal preditiva do Processo Gaussiano nos pacotes abertos até agora"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[320px]">
            <NormalDistributionChart dist={dist} />
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <div className="glass-panel p-4">
              <p className="text-xs text-gray-400 font-mono mb-1 flex items-center gap-1"><Sigma className="w-3 h-3" /> MÉDIA (μ)</p>
              <p className="text-2xl font-bold font-mono text-neonBlue">{Math.round(dist.mean)}</p>
              <p className="text-[11px] text-gray-500">figurinhas únicas esperadas em {stats.packs_opened} pacotes</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-xs text-gray-400 font-mono mb-1">INCERTEZA (σ)</p>
              <p className="text-2xl font-bold font-mono text-neonPurple">± {dist.sigma.toFixed(1)}</p>
              <p className="text-[11px] text-gray-500">desvio-padrão da previsão do GP</p>
            </div>
            <div className="glass-panel p-4 border-green-500/30">
              <p className="text-xs text-gray-400 font-mono mb-1">P(COMPLETAR ÁLBUM)</p>
              <p className="text-2xl font-bold font-mono text-green-400">{(dist.prob_completion * 100).toFixed(2)}%</p>
              <p className="text-[11px] text-gray-500">P(Y ≥ {dist.target}) — cauda da curva além do álbum (área verde quando visível)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saturation curve (GP regression) */}
      <div className="glass-panel p-6">
        <SectionTitle
          icon={TrendingUp}
          title="Curva de Saturação (Regressão por Processo Gaussiano)"
          subtitle="Figurinhas únicas acumuladas × pacotes abertos, com intervalo de confiança de 95%"
        />
        <div className="h-[320px]">
          <GaussianChart stats={stats} />
        </div>
      </div>

      {/* Statistical associations */}
      <div className="glass-panel p-6">
        <SectionTitle
          icon={Network}
          title="Correlações Estatísticas"
          subtitle="Associações entre pacotes abertos e figurinhas novas/repetidas"
        />
        <div className="space-y-6">
          <CorrelationPanel correlations={stats.correlations} />
          <div className="h-[280px]">
            <PackFlowChart history={stats.pack_history} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
