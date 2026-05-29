import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { PackHistoryEntry } from '../types';

interface PackFlowChartProps {
  history: PackHistoryEntry[];
}

const PackFlowChart: React.FC<PackFlowChartProps> = ({ history }) => {
  const chartData = useMemo(
    () => history.map((h) => ({ pack: h.pack, novas: h.new, repetidas: h.repeated })),
    [history],
  );

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
        SEM HISTÓRICO DE PACOTES AINDA...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="newFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="repFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
        <XAxis dataKey="pack" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', borderColor: '#00f0ff', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
          labelFormatter={(v) => `Pacote #${v}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="novas" stackId="1" stroke="#22c55e" fill="url(#newFill)" strokeWidth={2} />
        <Area type="monotone" dataKey="repetidas" stackId="1" stroke="#ef4444" fill="url(#repFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PackFlowChart;
