import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';
import { toArray } from '../../utils/safeList';

const COLORS = ['#22d3ee', '#34d399', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa'];

export default function SimplePieChart({ data = [], nameKey = 'label', valueKey = 'count', height = 320 }) {
  const rows = toArray(data);
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={rows} dataKey={valueKey} nameKey={nameKey} outerRadius={110} label>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
