import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ensureSeries7 } from './chartGuards';

export default function SimpleLineChart({ data, height = 260 }) {
  const safeData = ensureSeries7(data);
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="d" tick={{ fill: '#9ca3af', fontSize: 12 }} tickMargin={8} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} width={48} />
          <Tooltip
            contentStyle={{
              background: '#0b1220',
              border: '1px solid #10b981',
              color: '#e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(v) => [`$${Number(v || 0).toLocaleString()}`, 'Volume']}
          />
          <Line
            type="monotone"
            dataKey="usd"
            stroke="#22d3ee"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
