import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { toArray } from '../../utils/safeList';

export default function SparklineMini({ data = [], yKey = 'v', height = 40 }) {
  const rows = toArray(data);
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: '#141b2d',
              border: '1px solid #00FFFF50',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#00FFFF" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
