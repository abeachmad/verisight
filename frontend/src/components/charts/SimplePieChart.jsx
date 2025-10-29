import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ensureCategories } from './chartGuards';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function SimplePieChart({ data, height = 260 }) {
  const safeData = ensureCategories(data);
  console.debug('[SimplePieChart] raw=', data, 'safe=', safeData);
  
  if (!Array.isArray(safeData) || safeData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">No data</div>;
  }
  
  const validData = safeData.filter(d => d && typeof d.name === 'string' && typeof d.value === 'number' && d.value > 0);
  if (validData.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-slate-500">Invalid data format</div>;
  }
  
  return (
    <PieChart width={670} height={height}>
      <Tooltip
        contentStyle={{ background: '#1e293b', border: '1px solid #22d3ee', borderRadius: '6px' }}
        labelStyle={{ color: '#e2e8f0' }}
        itemStyle={{ color: '#22d3ee' }}
      />
      <Pie
        data={validData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={2}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        labelLine={{ stroke: '#cbd5e1' }}
        fill="#06b6d4"
      >
        {validData.map((_, i) => (
          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}
