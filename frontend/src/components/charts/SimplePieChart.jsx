import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const toArr = (x) => Array.isArray(x) ? x : (x ? [x] : []);
const palette = ['#22d3ee', '#34d399', '#a78bfa', '#f59e0b', '#f472b6'];

export default function SimplePieChart({ data, nameKey = 'name', valueKey = 'value', height = 280 }) {
  const arr = toArr(data);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            labelStyle={{ color: 'white' }}
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
          <Pie
            data={arr}
            dataKey={valueKey}
            nameKey={nameKey}
            outerRadius={100}
            innerRadius={60}
            isAnimationActive={false}
          >
            {arr.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
