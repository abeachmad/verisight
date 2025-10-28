import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const toArr = (x) => Array.isArray(x) ? x : (x ? [x] : []);

export default function SimpleBarChart({ data, xKey = 'range', yKey = 'count', height = 280 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={toArr(data)} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
          <CartesianGrid stroke="var(--chart-grid, rgba(255,255,255,0.06))" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: 'rgba(255,255,255,0.55)' }} axisLine={false}/>
          <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.55)' }} axisLine={false}/>
          <Tooltip
            labelStyle={{ color: 'white' }}
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey={yKey} fill="var(--chart-accent-2, #34d399)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
