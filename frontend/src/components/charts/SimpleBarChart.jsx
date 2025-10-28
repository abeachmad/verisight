import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ensureBuckets } from './chartGuards';

export default function SimpleBarChart({ data, height = 260 }) {
  const safeData = ensureBuckets(data);
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 12 }} tickMargin={8} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} width={48} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#0b1220',
              border: '1px solid #10b981',
              color: '#e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="count" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
