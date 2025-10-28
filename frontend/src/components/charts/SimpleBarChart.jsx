import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { toArray } from '../../utils/safeList';

export default function SimpleBarChart({ data = [], xKey, yKey, height = 280 }) {
  const rows = toArray(data);
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows}>
          <XAxis dataKey={xKey} stroke="#A9B4C2" />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey={yKey} fill="#00FFFF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
