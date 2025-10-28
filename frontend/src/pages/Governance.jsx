import React from 'react';
import { isDemo } from '../utils/demoFlags';
import { toArray, num, fmt, clamp100 } from '../utils/safeList';
import demoGov from '../mocks/fixtures/governance.json';

// ---- Status meta with fallback (keeps prior styling)
const STATUS = {
  ACTIVE:  { label: 'ACTIVE',  icon: '🟢', chip: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  PASSED:  { label: 'PASSED',  icon: '✅',  chip: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  FAILED:  { label: 'FAILED',  icon: '⛔', chip: 'bg-rose-600/20 text-rose-300 border border-rose-500/40' },
  PENDING: { label: 'PENDING', icon: '🟡', chip: 'bg-amber-600/20 text-amber-300 border border-amber-500/40' },
  CLOSED:  { label: 'CLOSED',  icon: '⚪', chip: 'bg-gray-600/20 text-gray-300 border border-gray-500/40' },
  UNKNOWN: { label: 'UNKNOWN', icon: '•',  chip: 'bg-gray-700 text-gray-300 border border-gray-600' }
};
const statusMeta = s => STATUS[String(s || '').toUpperCase()] || STATUS.UNKNOWN;

const safeDate = (x) => {
  const d = new Date(x);
  return isFinite(d.getTime()) ? d.toLocaleDateString() : '—';
};

const StatCard = ({ label, value }) => (
  <div className="bg-gray-900/60 rounded-lg p-6 border border-gray-800">
    <div className="text-teal-300 text-4xl font-semibold">{fmt(num(value))}</div>
    <div className="text-gray-400 mt-2">{label}</div>
  </div>
);

export default function Governance() {
  // DEMO: gunakan fixture numerik; non-DEMO: biarkan kosong (tidak fetch di mock run)
  const source = isDemo() ? toArray(demoGov?.proposals) : [];
  const proposals = source.map((p, idx) => ({
    id: String(p.id ?? idx),
    title: p.title ?? '',
    status: p.status ?? p.state ?? 'UNKNOWN',
    forVotes: num(p.forVotes ?? p.votesFor, 0),
    againstVotes: num(p.againstVotes ?? p.votesAgainst, 0),
    quorum: {
      current: num(p?.quorum?.current ?? p.quorumCurrent, 0),
      required: num(p?.quorum?.required ?? p.quorumRequired, 2000)
    },
    endTs: p.endTs ?? p.endsAt ?? null,
    description: p.description ?? ''
  }));

  const totals = {
    total: proposals.length,
    active: proposals.filter(p => statusMeta(p.status).label === 'ACTIVE').length,
    passed: proposals.filter(p => statusMeta(p.status).label === 'PASSED').length,
    voters: 3200
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
          const votes = num(p.forVotes) + num(p.againstVotes);
          const forPct = votes > 0 ? Math.round((num(p.forVotes) / votes) * 100) : 0;
          const againstPct = votes > 0 ? 100 - forPct : 0;
          const quorumPct = clamp100((num(p.quorum.current) / Math.max(1, num(p.quorum.required))) * 100);

          const m = statusMeta(p.status);

          return (
            <div key={p.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold text-teal-200">{p.title}</h2>
                <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${m.chip}`}>
                  <span aria-hidden>{m.icon}</span>
                  {m.label}
                </span>
              </div>

              {p.description && <p className="text-gray-400 mb-6">{p.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800 overflow-hidden">
                  <div className="text-gray-400 text-sm mb-2">FOR</div>
                  <div className="text-teal-300 font-semibold">
                    {fmt(num(p.forVotes))} votes ({forPct}%)
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-teal-500 rounded" style={{ width: `${forPct}%` }} />
                  </div>
                </div>

                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800 overflow-hidden">
                  <div className="text-gray-400 text-sm mb-2">AGAINST</div>
                  <div className="text-rose-300 font-semibold">
                    {fmt(num(p.againstVotes))} votes ({againstPct}%)
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-rose-500 rounded" style={{ width: `${againstPct}%` }} />
                  </div>
                </div>

                <div className="bg-gray-950/40 rounded-lg p-4 border border-gray-800 overflow-hidden">
                  <div className="text-gray-400 text-sm mb-2">QUORUM PROGRESS</div>
                  <div className="text-cyan-300 font-semibold">
                    {fmt(num(p.quorum.current))} / {fmt(num(p.quorum.required))}
                  </div>
                  <div className="h-2 bg-gray-800 rounded mt-2">
                    <div className="h-2 bg-cyan-500 rounded" style={{ width: `${quorumPct}%` }} />
                  </div>
                  <div className="text-gray-500 text-xs mt-2">Ends: {safeDate(p.endTs)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
