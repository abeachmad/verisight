import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ensureCategories } from './chartGuards';

const COLORS = ['#22d3ee', '#34d399', '#f59e0b', '#e879f9', '#60a5fa'];

export default function SimplePieChart({ data, height = 260 }) {
  const safeData = ensureCategories(data);
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: '#0b1220',
              border: '1px solid #10b981',
              color: '#e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Pie
            data={safeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            label
          >
            {safeData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
