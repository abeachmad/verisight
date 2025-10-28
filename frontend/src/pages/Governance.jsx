import React from 'react';
import { isDemo } from '../utils/demoFlags';

const STATUS_META = {
  ACTIVE:  { label: 'ACTIVE',  icon: '🟢', classes: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  PASSED:  { label: 'PASSED',  icon: '✅', classes: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  FAILED:  { label: 'FAILED',  icon: '⛔', classes: 'bg-rose-600/20 text-rose-300 border border-rose-500/40' },
  PENDING: { label: 'PENDING', icon: '🟡', classes: 'bg-amber-600/20 text-amber-300 border border-amber-500/40' },
  RESOLVED:{ label: 'RESOLVED',icon: '🔵', classes: 'bg-sky-600/20 text-sky-300 border border-sky-500/40' },
  CLOSED:  { label: 'CLOSED',  icon: '⚪', classes: 'bg-gray-600/20 text-gray-300 border border-gray-500/40' },
  UNKNOWN: { label: 'UNKNOWN', icon: '•',  classes: 'bg-gray-700 text-gray-300 border border-gray-600' },
};
function normalizeStatus(s) {
  if (!s) return 'UNKNOWN';
  if (typeof s === 'string') return s.trim().toUpperCase();
  if (typeof s === 'object') {
    const v = s.state ?? s.status ?? s.phase ?? s.value ?? '';
    return String(v).trim().toUpperCase() || 'UNKNOWN';
  }
  return 'UNKNOWN';
}
function getStatusMeta(s) {
  const key = normalizeStatus(s);
  return STATUS_META[key] || STATUS_META.UNKNOWN;
}
function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${meta.classes}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

const DEMO_PROPOSALS = [
  { id: 'prop-001', title: 'Increase AI Confidence Threshold', status: 'ACTIVE',  forVotes: 1250, againstVotes: 420,  quorum: { current: 1670, required: 2000 },
    description: 'Raise the minimum confidence threshold for automatic event resolution from 90% to 95% to improve accuracy.' },
  { id: 'prop-002', title: 'Enable Copy Trading Beta',          status: 'PASSED',  forVotes: 2100, againstVotes: 180,  quorum: { current: 2280, required: 2000 },
    description: 'Open beta for copy trading strategies.' },
  { id: 'prop-003', title: 'Reduce Trading Fee to 0.2%',        status: 'FAILED',  forVotes: 500,  againstVotes: 850,  quorum: { current: 1350, required: 2000 },
    description: 'Reduce market fee for increased volume.' },
  { id: 'prop-004', title: 'Treasury Transparency Report Q4',   status: 'PENDING', forVotes: 0,    againstVotes: 0,    quorum: { current: 0,    required: 2000 },
    description: 'Publish quarterly treasury report.' },
];

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-900/60 rounded-lg p-6 border border-gray-800">
      <div className="text-teal-300 text-4xl font-semibold">{value}</div>
      <div className="text-gray-400 mt-2">{label}</div>
    </div>
  );
}

export default function Governance() {
  const proposals = isDemo() ? DEMO_PROPOSALS : DEMO_PROPOSALS;

  const totals = {
    total: proposals.length,
    active: proposals.filter(p => normalizeStatus(p.status) === 'ACTIVE').length,
    passed: proposals.filter(p => normalizeStatus(p.status) === 'PASSED').length,
    voters: '3.2K',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-teal-300 mb-3">Governance</h1>
      <p className="text-gray-400 mb-8">Vote on proposals to shape the future of Verisight platform</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Proposals" value={totals.total} />
        <StatCard label="Active Votes" value={totals.active} />
        <StatCard label="Passed" value={totals.passed} />
        <StatCard label="Total Voters" value={totals.voters} />
      </div>

      <div className="space-y-6">
        {proposals.map((p) => {
          const votes = p.forVotes + p.againstVotes;
          const forPct = votes > 0 ? Math.round((p.forVotes / votes) * 100) : 0;
          const quorumPct = p.quorum.required > 0 ? Math.min(100, Math.round((p.quorum.current / p.quorum.required) * 100)) : 0;

          return (
            <div key={p.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold text-teal-200">{p.title}</h2>
                <StatusBadge status={p.status} />
              </div>

              <p className="text-gray-400 mb-6">{p.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800">
                  <div className="text-gray-400 text-sm mb-2">FOR</div>
                  <div className="text-teal-300 font-semibold">
                    {p.forVotes.toLocaleString()} votes ({forPct}%)
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-teal-500 rounded" style={{ width: `${forPct}%` }} />
                  </div>
                </div>

                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800">
                  <div className="text-gray-400 text-sm mb-2">AGAINST</div>
                  <div className="text-rose-300 font-semibold">
                    {p.againstVotes.toLocaleString()} votes ({100 - forPct}%)
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-rose-500 rounded" style={{ width: `${100 - forPct}%` }} />
                  </div>
                </div>

                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800">
                  <div className="text-gray-400 text-sm mb-2">QUORUM PROGRESS</div>
                  <div className="text-cyan-300 font-semibold">
                    {p.quorum.current.toLocaleString()} / {p.quorum.required.toLocaleString()}
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-cyan-500 rounded" style={{ width: `${quorumPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}