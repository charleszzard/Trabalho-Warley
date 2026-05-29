import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import type { AppState } from '../types';

interface GaussianChartProps {
  stats: AppState;
}

const GaussianChart: React.FC<GaussianChartProps> = ({ stats }) => {
  const chartData = useMemo(() => {
    if (!stats.gp_curve || !stats.gp_curve.x || stats.gp_curve.x.length === 0) return [];
    
    return stats.gp_curve.x.map((x, i) => {
      const y = stats.gp_curve.y[i];
      const sigma = stats.gp_curve.sigma[i];
      return {
        packs: Math.round(x),
        mean: Math.round(y),
        upper: Math.min(stats.total_album_size, Math.round(y + 1.96 * sigma)),
        lower: Math.max(0, Math.round(y - 1.96 * sigma)),
      };
    });
  }, [stats]);

  if (chartData.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 font-mono text-sm">AGUARDANDO DADOS...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSigma" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b800ff" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#b800ff" stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
        <XAxis 
          dataKey="packs" 
          stroke="#ffffff80" 
          fontSize={12} 
          tickFormatter={(val) => `${val}`}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#ffffff80" 
          fontSize={12}
          domain={[0, stats.total_album_size]}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', borderColor: '#00f0ff', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
        />
        {/* Confidence Interval */}
        <Area 
          type="monotone" 
          dataKey="upper" 
          stroke="none" 
          fill="url(#colorSigma)" 
        />
        <Area 
          type="monotone" 
          dataKey="lower" 
          stroke="none" 
          fill="#0a0a0f" 
        />
        {/* Mean Prediction */}
        <Line 
          type="monotone" 
          dataKey="mean" 
          stroke="#00f0ff" 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: "#00f0ff", stroke: "#fff" }}
        />
        {/* Album Size Target Line */}
        <Line 
          type="step" 
          dataKey={() => stats.total_album_size} 
          stroke="#ffffff40" 
          strokeDasharray="5 5" 
          dot={false} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GaussianChart;
