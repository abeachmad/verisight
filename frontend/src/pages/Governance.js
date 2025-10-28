import React, { useState, useEffect } from 'react';
import { isDemo } from '../utils/demoFlags';
import governanceFixture from '../mocks/fixtures/governance.json';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, CheckCircle2, Clock, Users } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { toast } from 'sonner';

// ---- local helpers (file-scoped; do NOT export) ----
const num = (x, d = 0) => {
  // turn "1,250" or " 1250 " or 1250 into a number
  if (x === null || x === undefined) return d;
  const n = Number(String(x).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : d;
};
const fmt = (x) => {
  const n = num(x, null);
  return n === null ? '—' : n.toLocaleString();
};
const clamp100 = (v) => Math.max(0, Math.min(100, num(v, 0)));
const toArr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const safeDateLabel = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.valueOf()) ? '—' : d.toLocaleDateString();
};

// status map with fallback
const STATUS_META = {
  ACTIVE:  { label: 'ACTIVE',  icon: '🟢', classes: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  PASSED:  { label: 'PASSED',  icon: '✅',  classes: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' },
  FAILED:  { label: 'FAILED',  icon: '⛔',  classes: 'bg-rose-600/20 text-rose-300 border border-rose-500/40' },
  PENDING: { label: 'PENDING', icon: '🟡', classes: 'bg-amber-600/20 text-amber-300 border border-amber-500/40' },
  CLOSED:  { label: 'CLOSED',  icon: '⚪',  classes: 'bg-gray-600/20 text-gray-300 border border-gray-500/40' },
  UNKNOWN: { label: 'UNKNOWN', icon: '•',   classes: 'bg-gray-700 text-gray-300 border border-gray-600' },
};
const normalizeStatus = (s) => String((s?.status ?? s?.state ?? s ?? '')).trim().toUpperCase() || 'UNKNOWN';
const getStatusMeta = (s) => STATUS_META[normalizeStatus(s)] || STATUS_META.UNKNOWN;

const Governance = () => {
  const { isConnected } = useWallet();
  const [votedProposals, setVotedProposals] = useState(new Set());

  const DEMO = isDemo();
  const proposals = DEMO ? toArr(governanceFixture.proposals) : [];

  const totals = {
    total: proposals.length,
    active: proposals.filter(p => normalizeStatus(p.status) === 'ACTIVE').length,
    passed: proposals.filter(p => normalizeStatus(p.status) === 'PASSED').length,
    voters: '3.2K'
  };

  const handleVote = (proposalId, voteType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (votedProposals.has(proposalId)) {
      toast.error('You have already voted on this proposal');
      return;
    }

    setVotedProposals(new Set(votedProposals).add(proposalId));
    toast.success(`Vote ${voteType === 'for' ? 'FOR' : 'AGAINST'} recorded successfully!`);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
            Governance
          </h1>
          <p className="text-[#A9B4C2] text-lg">
            Vote on proposals to shape the future of Verisight platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Vote className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">{totals.total}</div>
                <div className="text-[#A9B4C2] text-sm">Total Proposals</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">{totals.active}</div>
                <div className="text-[#A9B4C2] text-sm">Active Votes</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">{totals.passed}</div>
                <div className="text-[#A9B4C2] text-sm">Passed</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">{totals.voters}</div>
                <div className="text-[#A9B4C2] text-sm">Total Voters</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Proposals */}
        <div className="space-y-6">
          {proposals.map(p => {
            const forVotes = num(p.forVotes);
            const againstVotes = num(p.againstVotes);
            const totalVotes = forVotes + againstVotes;

            const forPct = totalVotes > 0 ? Math.round((forVotes / totalVotes) * 100) : 0;
            const againstPct = 100 - forPct;

            const qCur = num(p.quorum?.current);
            const qReq = num(p.quorum?.required);
            const qPct = qReq > 0 ? clamp100((qCur / qReq) * 100) : 0;

            const meta = getStatusMeta(p.status);

            return (
              <Card
                key={p.id}
                className="bg-[#141b2d] border-[#00FFFF]/30 hover:border-[#00FFFF] smooth-transition p-6"
                data-testid={`proposal-card-${p.id}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF]">
                        {p.title}
                      </h3>
                      <Badge className={`${meta.classes} border`}>
                        <span aria-hidden className="mr-1">{meta.icon}</span>
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-[#A9B4C2] mb-4">{p.description}</p>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="space-y-4 mb-6">
                  {/* For Votes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-semibold">FOR</span>
                      <span className="text-[#A9B4C2] text-sm">
                        {fmt(forVotes)} votes ({forPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-400 h-3 rounded-full smooth-transition"
                        style={{ width: `${forPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Against Votes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-semibold">AGAINST</span>
                      <span className="text-[#A9B4C2] text-sm">
                        {fmt(againstVotes)} votes ({againstPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-red-400 h-3 rounded-full smooth-transition"
                        style={{ width: `${againstPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quorum Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#00FFFF] font-semibold">QUORUM PROGRESS</span>
                      <span className="text-[#A9B4C2] text-sm">
                        {fmt(qCur)} / {fmt(qReq)}
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0F1F] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00FFFF] h-2 rounded-full glow smooth-transition"
                        style={{ width: `${qPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#00FFFF]/20">
                  <div className="text-[#A9B4C2] text-sm">
                    Ends: {safeDateLabel(p.endTs)}
                  </div>

                  {normalizeStatus(p.status) === 'ACTIVE' && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleVote(p.id, 'for')}
                        disabled={!isConnected || votedProposals.has(p.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        data-testid={`vote-for-${p.id}`}
                      >
                        Vote FOR
                      </Button>
                      <Button
                        onClick={() => handleVote(p.id, 'against')}
                        disabled={!isConnected || votedProposals.has(p.id)}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        data-testid={`vote-against-${p.id}`}
                      >
                        Vote AGAINST
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Governance;
