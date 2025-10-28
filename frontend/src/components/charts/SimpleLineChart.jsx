import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const toArr = (x) => Array.isArray(x) ? x : (x ? [x] : []);
const fmtUSD = (v) => `$${Number(v || 0).toLocaleString()}`;

export default function SimpleLineChart({ data, xKey = 'd', yKey = 'usd', height = 280 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={toArr(data)} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
          <CartesianGrid stroke="var(--chart-grid, rgba(255,255,255,0.06))" vertical={false} />
          <XAxis dataKey={xKey} tick={false} axisLine={false} />
          <YAxis
            width={60}
            axisLine={false}
            tick={{ fill: 'rgba(255,255,255,0.55)' }}
            tickFormatter={(v) => v >= 1000 ? `${Math.round(v/1000)}k` : v}
          />
          <Tooltip
            labelStyle={{ color: 'white' }}
            formatter={(v) => [fmtUSD(v), 'Volume']}
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="var(--chart-accent, #22d3ee)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            strokeOpacity={0.95}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
