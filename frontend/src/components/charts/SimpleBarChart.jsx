import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ensureBuckets } from './chartGuards';

export default function SimpleBarChart({ data, height = 260 }) {
  const safeData = ensureBuckets(data);
  console.debug('[SimpleBarChart] raw=', data, 'safe=', safeData);
  
  if (!Array.isArray(safeData) || safeData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">No data</div>;
  }
  
  const validData = safeData.filter(d => d && typeof d.range === 'string' && typeof d.count === 'number');
  if (validData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">Invalid data format</div>;
  }
  
  return (
    <BarChart width={670} height={height} data={validData} margin={{ top: 10, right: 16, bottom: 20, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
      <Tooltip
        contentStyle={{ background: '#1e293b', border: '1px solid #34d399', borderRadius: '6px' }}
        labelStyle={{ color: '#e2e8f0' }}
        itemStyle={{ color: '#34d399' }}
      />
      <Bar dataKey="count" fill="#10b981" />
    </BarChart>
  );
}
