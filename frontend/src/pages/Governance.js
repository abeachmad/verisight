import React, { useState, useEffect } from 'react';
import { DEMO } from '../utils/demoFlags';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, CheckCircle2, Clock, Users } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { toast } from 'sonner';
import { fmt, clamp100 } from '../utils/safeList';

const STATUS = {
  ACTIVE: { label: 'ACTIVE', icon: Clock, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  PASSED: { label: 'PASSED', icon: CheckCircle2, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  REJECTED: { label: 'REJECTED', icon: CheckCircle2, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  PENDING: { label: 'PENDING', icon: Clock, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  CLOSED: { label: 'CLOSED', icon: CheckCircle2, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  UNKNOWN: { label: 'UNKNOWN', icon: Clock, color: 'bg-gray-700 text-gray-300 border border-gray-600' },
};

const getStatusMeta = (s) => STATUS[String(s || '').toUpperCase()] || STATUS.UNKNOWN;

const Governance = () => {
  const { isConnected } = useWallet();
  const [votedProposals, setVotedProposals] = useState(new Set());
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    // const DEMO = isDemo();
    if (DEMO) {
      setProposals([
        { id: 'prop-001', title: 'Enable Anti-Manipulation Guard', status: 'Active', votesFor: 1243, votesAgainst: 122 },
        { id: 'prop-002', title: 'Raise Validator Bond to 1,000 LIN', status: 'Pending', votesFor: 0, votesAgainst: 0 }
      ]);
      return;
    }
    // Fallback proposals for non-DEMO mode
    setProposals([
    {
      id: 1,
      title: 'Increase AI Confidence Threshold',
      description:
        'Raise the minimum confidence threshold for automatic event resolution from 90% to 95% to improve accuracy.',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 420,
      totalVotes: 1670,
      endTime: '2025-02-15T00:00:00Z',
      quorum: 2000
    },
    {
      id: 2,
      title: 'Add New Event Categories',
      description:
        'Expand supported event categories to include entertainment, technology, and climate events.',
      status: 'active',
      votesFor: 890,
      votesAgainst: 210,
      totalVotes: 1100,
      endTime: '2025-02-10T00:00:00Z',
      quorum: 2000
    },
    {
      id: 3,
      title: 'Reduce Oracle Publication Fees',
      description: 'Lower the gas fees for oracle publication by 50% to make verification more cost-effective.',
      status: 'passed',
      votesFor: 2150,
      votesAgainst: 380,
      totalVotes: 2530,
      endTime: '2025-01-25T00:00:00Z',
      quorum: 2000
    },
    {
      id: 4,
      title: 'Implement Multi-Source Verification',
      description: 'Require verification from at least 5 sources instead of 3 for higher confidence events.',
      status: 'rejected',
      votesFor: 680,
      votesAgainst: 1520,
      totalVotes: 2200,
      endTime: '2025-01-20T00:00:00Z',
      quorum: 2000
    }
    ]);
  }, []);

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

  const getStatusBadge = (status) => {
    const meta = getStatusMeta(status);
    const Icon = meta.icon;

    return (
      <Badge className={`${meta.color} border`}>
        <Icon className="mr-1 h-3 w-3" />
        {meta.label}
      </Badge>
    );
  };

  const calculatePercentage = (votes, total) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
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
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">4</div>
                <div className="text-[#A9B4C2] text-sm">Total Proposals</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">2</div>
                <div className="text-[#A9B4C2] text-sm">Active Votes</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">1</div>
                <div className="text-[#A9B4C2] text-sm">Passed</div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-[#00FFFF]" />
              <div>
                <div className="text-2xl font-['Orbitron'] font-bold text-[#00FFFF]">3.2K</div>
                <div className="text-[#A9B4C2] text-sm">Total Voters</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Proposals */}
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="bg-[#141b2d] border-[#00FFFF]/30 hover:border-[#00FFFF] smooth-transition p-6"
              data-testid={`proposal-card-${proposal.id}`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-['Orbitron'] font-semibold text-[#00FFFF]">
                      {proposal.title}
                    </h3>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <p className="text-[#A9B4C2] mb-4">{proposal.description}</p>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="space-y-4 mb-6">
                {/* For Votes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">FOR</span>
                    <span className="text-[#A9B4C2] text-sm">
                      {fmt(proposal?.votesFor)} votes ({
                        calculatePercentage(proposal.votesFor, proposal.totalVotes)
                      }%)
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0F1F] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-400 h-3 rounded-full smooth-transition"
                      style={{ width: `${clamp100(calculatePercentage(proposal.votesFor, proposal.totalVotes))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Against Votes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-semibold">AGAINST</span>
                    <span className="text-[#A9B4C2] text-sm">
                      {fmt(proposal?.votesAgainst)} votes ({
                        calculatePercentage(proposal.votesAgainst, proposal.totalVotes)
                      }%)
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0F1F] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-red-400 h-3 rounded-full smooth-transition"
                      style={{
                        width: `${clamp100(calculatePercentage(proposal.votesAgainst, proposal.totalVotes))}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Quorum Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#00FFFF] font-semibold">QUORUM PROGRESS</span>
                    <span className="text-[#A9B4C2] text-sm">
                      {fmt(proposal?.totalVotes)} / {fmt(proposal?.quorum)}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A0F1F] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#00FFFF] h-2 rounded-full glow smooth-transition"
                      style={{ width: `${clamp100((proposal.totalVotes / proposal.quorum) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#00FFFF]/20">
                <div className="text-[#A9B4C2] text-sm">
                  {proposal.status === 'active' && (
                    <span>
                      Ends: {new Date(proposal.endTime).toLocaleDateString()}
                    </span>
                  )}
                  {proposal.status !== 'active' && (
                    <span>
                      Ended: {new Date(proposal.endTime).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {proposal.status === 'active' && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleVote(proposal.id, 'for')}
                      disabled={!isConnected || votedProposals.has(proposal.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      data-testid={`vote-for-${proposal.id}`}
                    >
                      Vote FOR
                    </Button>
                    <Button
                      onClick={() => handleVote(proposal.id, 'against')}
                      disabled={!isConnected || votedProposals.has(proposal.id)}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      data-testid={`vote-against-${proposal.id}`}
                    >
                      Vote AGAINST
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Governance;