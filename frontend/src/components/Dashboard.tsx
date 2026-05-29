import React from 'react';
import type { AppState } from '../types';
import { Layers, CheckCircle2, Copy, Package, Percent, TrendingUp } from 'lucide-react';

interface DashboardProps {
  stats: AppState | null;
}

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: React.ElementType;
  colorClass: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, suffix = '' }) => (
  <div className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('text-', 'bg-')}`} />
    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-mono mb-1">{title}</p>
      <p className="text-2xl font-bold font-mono">
        {value !== undefined ? value : '--'}
        <span className="text-sm ml-1 text-gray-500">{suffix}</span>
      </p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        title="PACOTES_ABERTOS" 
        value={stats?.packs_opened} 
        icon={Package} 
        colorClass="text-neonBlue" 
      />
      <StatCard 
        title="TOTAL_ENCONTRADO" 
        value={stats?.total_stickers_found} 
        icon={Layers} 
        colorClass="text-blue-400" 
      />
      <StatCard 
        title="ÚNICAS" 
        value={stats?.unique_stickers} 
        icon={CheckCircle2} 
        colorClass="text-green-400" 
        suffix={`/ ${stats?.total_album_size || '--'}`}
      />
      <StatCard 
        title="REPETIDAS" 
        value={stats?.repeated_stickers} 
        icon={Copy} 
        colorClass="text-red-400" 
      />
      <StatCard 
        title="PROB_CONCLUSÃO" 
        value={stats ? (stats.probability_completion * 100).toFixed(2) : '--'} 
        icon={Percent} 
        colorClass="text-neonPurple"
        suffix="%"
      />
      <StatCard 
        title="EST_FALTANTES" 
        value={stats?.total_album_size ? (stats.total_album_size - (stats.unique_stickers || 0)) : '--'} 
        icon={TrendingUp} 
        colorClass="text-orange-400" 
      />
    </div>
  );
};

export default Dashboard;
