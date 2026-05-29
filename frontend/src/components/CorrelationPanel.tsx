import React from 'react';
import type { Correlations } from '../types';
import { Sigma, Repeat, TrendingDown, GitCompareArrows } from 'lucide-react';

interface CorrelationPanelProps {
  correlations: Correlations;
}

const Metric = ({ icon: Icon, label, value, hint, colorClass }: {
  icon: React.ElementType; label: string; value: string; hint: string; colorClass: string;
}) => (
  <div className="glass-panel p-4 flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <p className="text-xs text-gray-400 font-mono">{label}</p>
    </div>
    <p className="text-2xl font-bold font-mono">{value}</p>
    <p className="text-[11px] text-gray-500 leading-tight">{hint}</p>
  </div>
);

const CorrelationPanel: React.FC<CorrelationPanelProps> = ({ correlations }) => {
  const c = correlations;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric
        icon={Sigma}
        label="MÉDIA_NOVAS/PACOTE"
        value={c.avg_new_per_pack.toFixed(2)}
        hint="Figurinhas inéditas por pacote (cai conforme o álbum enche)."
        colorClass="text-green-400"
      />
      <Metric
        icon={Repeat}
        label="MÉDIA_REPETIDAS/PACOTE"
        value={c.avg_repeated_per_pack.toFixed(2)}
        hint="Figurinhas duplicadas por pacote (sobe ao longo do tempo)."
        colorClass="text-red-400"
      />
      <Metric
        icon={TrendingDown}
        label="TAXA_DUPLICAÇÃO"
        value={`${(c.duplication_rate * 100).toFixed(1)}%`}
        hint="Fração de todas as figurinhas encontradas que já tinha."
        colorClass="text-orange-400"
      />
      <Metric
        icon={GitCompareArrows}
        label="CORR(PACOTE, NOVAS)"
        value={c.corr_pack_vs_new.toFixed(2)}
        hint="Correlação de Pearson — negativa confirma o Colecionador de Cupons."
        colorClass="text-neonPurple"
      />
    </div>
  );
};

export default CorrelationPanel;
