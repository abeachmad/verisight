import React, { useState, useEffect, useRef } from 'react';

const StatusBar = () => {
  const [health, setHealth] = useState(null);
  const [latency, setLatency] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchHealth = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const start = Date.now();
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`, {
          signal: abortControllerRef.current.signal
        });
        const data = await response.json();
        setLatency(Date.now() - start);
        setHealth(data);
        setRetryCount(0);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Health check failed:', error);
          setRetryCount(prev => prev + 1);
        }
      }
    };

    fetchHealth();
    const delay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
    const interval = setInterval(fetchHealth, delay);
    
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [retryCount]);

  const lineraUrl = process.env.REACT_APP_LINERA_TESTNET_SERVICE_URL || 'https://rpc.testnet.linera.net';
  const blockHeight = health?.services?.linera?.block_height || 0;
  const status = health?.status || 'unknown';
  const isHealthy = status === 'healthy';
  const statusText = isHealthy ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Unknown';

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 text-xs text-gray-400" role="status" aria-live="polite">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <span 
              className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}
              aria-label={`Status: ${statusText}`}
            ></span>
            <span className="sr-only">Status: {statusText}</span>
            Testnet: {lineraUrl}
          </span>
          <span aria-label={`Block height: ${blockHeight.toLocaleString()}`}>
            Block: {blockHeight.toLocaleString()}
          </span>
          <span aria-label={`Latency: ${latency} milliseconds`}>
            Latency: {latency}ms
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
