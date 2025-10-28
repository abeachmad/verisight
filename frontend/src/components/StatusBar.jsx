import React, { useState, useEffect } from 'react';
import { DEMO } from '../utils/demoFlags';

export default function StatusBar() {
  const [health, setHealth] = useState({ status: 'unknown', blockHeight: 0, latency: 0 });

  useEffect(() => {
    if (DEMO) {
      setHealth({ status: 'healthy', blockHeight: 1000 + Math.floor(Date.now() / 5000), latency: 45 });
      return;
    }
    
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
        {DEMO && (
          <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold">
            MOCK DATA (DEMO)
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span>Status: {health.status || 'unknown'}</span>
        </div>
        <div>Block: {health.blockHeight || 0}</div>
        <div>Latency: {health.latency || 0}ms</div>
      </div>
    </div>
  );
}
