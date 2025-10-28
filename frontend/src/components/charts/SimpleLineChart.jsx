import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ensureSeries7 } from './chartGuards';

export default function SimpleLineChart({ data, height = 260 }) {
  const safeData = ensureSeries7(data);
  console.debug('[SimpleLineChart] raw=', data, 'safe=', safeData);
  
  if (!Array.isArray(safeData) || safeData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">No data</div>;
  }
  
  const validData = safeData.filter(d => d && typeof d.d === 'string' && typeof d.usd === 'number');
  if (validData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">Invalid data format</div>;
  }
  
  return (
    <LineChart width={670} height={height} data={validData} margin={{ top: 10, right: 16, bottom: 20, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="d" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
      <Tooltip
        contentStyle={{ background: '#1e293b', border: '1px solid #22d3ee', borderRadius: '6px' }}
        labelStyle={{ color: '#e2e8f0' }}
        itemStyle={{ color: '#22d3ee' }}
        formatter={(v) => [`$${Number(v || 0).toLocaleString()}`, 'Volume']}
      />
      <Line
        type="monotone"
        dataKey="usd"
        stroke="#06b6d4"
        strokeWidth={3}
        dot={{ fill: '#06b6d4', r: 4 }}
        activeDot={{ r: 6, fill: '#22d3ee' }}
      />
    </LineChart>
  );
}
