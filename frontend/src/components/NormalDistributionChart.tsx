import React, { useMemo } from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { PredictiveDistribution } from '../types';

interface NormalDistributionChartProps {
  dist: PredictiveDistribution;
}

const NormalDistributionChart: React.FC<NormalDistributionChartProps> = ({ dist }) => {
  const chartData = useMemo(() => {
    if (!dist || !dist.x || dist.x.length === 0) return [];
    return dist.x.map((x, i) => ({
      value: x,
      density: dist.pdf[i],
      // Mass in the right tail (>= target) is exactly the completion probability.
      completion: x >= dist.target ? dist.pdf[i] : null,
    }));
  }, [dist]);

  // The album-size line is only meaningful once the bell's window reaches it.
  const targetVisible = dist.x.length > 0 && dist.target <= dist.x[dist.x.length - 1];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
        ABRA PACOTES PARA GERAR A DISTRIBUIÇÃO...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="bellFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
        <XAxis
          dataKey="value"
          type="number"
          domain={['dataMin', 'dataMax']}
          stroke="#ffffff80"
          fontSize={12}
          tickFormatter={(v) => `${Math.round(v)}`}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} tick={false} width={20} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', borderColor: '#00f0ff', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
          formatter={(val) => [Number(val).toExponential(2), 'densidade']}
          labelFormatter={(v) => `${Math.round(Number(v))} figurinhas únicas`}
        />
        <Area type="monotone" dataKey="density" stroke="#00f0ff" strokeWidth={2} fill="url(#bellFill)" />
        <Area type="monotone" dataKey="completion" stroke="#22c55e" strokeWidth={2} fill="url(#completionFill)" connectNulls={false} />
        <ReferenceLine
          x={dist.mean}
          stroke="#b800ff"
          strokeDasharray="4 4"
          label={{ value: `μ ≈ ${Math.round(dist.mean)}`, fill: '#b800ff', fontSize: 11, position: 'top' }}
        />
        {targetVisible && (
          <ReferenceLine
            x={dist.target}
            stroke="#ffffff80"
            strokeDasharray="5 5"
            label={{ value: `álbum ${dist.target}`, fill: '#ffffffb0', fontSize: 11, position: 'insideTopRight' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default NormalDistributionChart;
