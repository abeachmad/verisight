import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marketsFixture from '../mocks/fixtures/markets.json';
import oddsFixture from '../mocks/fixtures/odds.json';
import evidenceFixture from '../mocks/fixtures/evidence.json';
import eventsFixture from '../mocks/fixtures/events.json';

const isDemoMode = process.env.REACT_APP_MODE === 'MOCK' || process.env.REACT_APP_DEMO_DATA === 'true';

const jitter = (base, range) => base + (Math.random() * range * 2 - range);

export default function MarketDetail() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarket = () => {
      if (isDemoMode) {
        const marketData = marketsFixture.find(m => m.market_id === id);
        if (marketData) {
          const odds = oddsFixture[id] || { yes: 0.5, no: 0.5, implied_vol: 0.1 };
          const evidence = evidenceFixture[id] || {};
          const event = eventsFixture.find(e => e.event_id === marketData.event_id) || {};
          
          setMarket({
            ...marketData,
            event,
            odds: {
              yes: Math.max(0.02, Math.min(0.98, jitter(odds.yes, 0.01))),
              no: Math.max(0.02, Math.min(0.98, jitter(odds.no, 0.01))),
              implied_vol: odds.implied_vol
            },
            evidence: {
              ...evidence,
              block_height: 1000 + Math.floor(Date.now() / 5000)
            }
          });
        }
        setLoading(false);
        return;
      }
      
      fetchMarket();
    };
    
    const fetchMarket = async () => {
      try {
        const res = await fetch(`/api/markets/${id}`);
        const data = await res.json();
        if (data && data.market_id) {
          setMarket(data);
        } else if (isDemoMode) {
          loadMarket();
        }
      } catch (err) {
        console.error('Failed to fetch market:', err);
        if (isDemoMode) {
          loadMarket();
        }
      } finally {
        setLoading(false);
      }
    };

    loadMarket();
    const interval = setInterval(loadMarket, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8" />
          <div className="h-32 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Market not found</p>
      </div>
    );
  }

  const cutoffPassed = new Date(market.cutoff_at) < new Date();
  const stakeDisabled = market.resolved || cutoffPassed;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{market.title}</h1>
        
        {market.event && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">Confidence:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold ${
                market.event.confidence >= 0.8 ? 'bg-green-600' :
                market.event.confidence >= 0.6 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {Math.round(market.event.confidence * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-cyan-600 h-2 rounded-full transition-all"
                style={{ width: `${market.event.confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {market.evidence && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              On-Chain Evidence
              {isDemoMode && <span className="text-xs px-2 py-1 bg-purple-600 rounded">mock</span>}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 w-24">IPFS CID:</span>
                <a 
                  href={`https://ipfs.io/ipfs/${market.evidence.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline break-all"
                >
                  {market.evidence.cid}
                </a>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24">TX Hash:</span>
                <span className="font-mono text-xs break-all">{market.evidence.tx_hash}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24">Chain ID:</span>
                <span className="font-mono text-xs">{market.evidence.chain_id}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-24">Block:</span>
                <span>{market.evidence.block_height || 'N/A'}</span>
              </div>
              {market.evidence.sources && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24">Sources:</span>
                  <div className="flex flex-col gap-1">
                    {market.evidence.sources.map((src, i) => (
                      <a 
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline text-xs"
                      >
                        {src}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {market.odds && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Current Odds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {Math.round(market.odds.yes * 100)}%
                </div>
                <div className="text-sm text-gray-400">YES</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">
                  {Math.round(market.odds.no * 100)}%
                </div>
                <div className="text-sm text-gray-400">NO</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Place Prediction</h3>
          <button
            disabled={stakeDisabled}
            className={`w-full py-3 rounded font-semibold transition ${
              stakeDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            {market.resolved ? 'Market Resolved' : cutoffPassed ? 'Cutoff Passed' : 'Stake Now'}
          </button>
          {stakeDisabled && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              {market.resolved ? 'This market has been resolved' : 'Cutoff time has passed'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
