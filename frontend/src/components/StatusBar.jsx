import React, { useState, useEffect } from 'react';

export default function StatusBar() {
  const [health, setHealth] = useState({ status: 'unknown', blockHeight: 0, latency: 0 });
  const isDemoMode = process.env.REACT_APP_MODE === 'MOCK' || process.env.REACT_APP_DEMO_DATA === 'true';

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: 'unknown', blockHeight: 0, latency: 0 });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-500'
  }[health.status] || 'bg-gray-500';

  return (
    <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        {isDemoMode && (
          <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold">
            MOCK DATA
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span>Status: {health.status || 'unknown'}</span>
        </div>
        <div>Block: {health.blockHeight || 0}</div>
        <div>Latency: {health.latency || 0}ms</div>
        {isDemoMode && <span className="text-xs text-gray-400">(Mock Mode)</span>}
      </div>
    </div>
  );
}
