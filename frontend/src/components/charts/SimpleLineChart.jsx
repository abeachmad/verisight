import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { toArray } from '../../utils/safeList';

export default function SimpleLineChart({ data = [], xKey, yKey, height = 320 }) {
  const rows = toArray(data);
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows}>
          <XAxis dataKey={xKey} stroke="#A9B4C2" />
          <YAxis stroke="#A9B4C2" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '8px'
            }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#00FFFF" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
