import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Zap, Shield, TrendingUp, Brain, Network, ArrowRight } from 'lucide-react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Brain className="h-12 w-12" />,
      title: 'AI-Powered Verification',
      description: 'Multi-agent AI system verifies events across reputable sources with transparent reasoning.'
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: 'Blockchain Oracle',
      description: 'Verified data published to Linera microchains for immutable, trustless event resolution.'
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: 'Prediction Markets',
      description: 'Trade on verified events with AI-managed agents and community-driven predictions.'
    },
    {
      icon: <Network className="h-12 w-12" />,
      title: 'Copy Trading',
      description: 'Follow top traders and AI strategies to maximize returns with proven track records.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Events Verified' },
    { value: '94%', label: 'Accuracy Rate' },
    { value: '$2M+', label: 'Trading Volume' },
    { value: '5K+', label: 'Active Users' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00FFFF] opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00FFFF] opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Logo Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Eye className="h-24 w-24 text-[#00FFFF] animate-float" />
                <div className="absolute inset-0 bg-[#00FFFF] opacity-30 blur-2xl animate-pulse-slow"></div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-['Orbitron'] font-bold text-[#00FFFF] mb-6 text-glow">
              VERISIGHT
            </h1>
            <p className="text-2xl sm:text-3xl text-[#A9B4C2] mb-4 font-['Orbitron'] font-light tracking-wide">
              Truth in Real Time
            </p>
            <p className="text-base sm:text-lg text-[#A9B4C2] max-w-3xl mx-auto mb-12">
              AI-powered oracle and prediction platform that validates real-world events, feeds verified results into prediction markets, and provides transparent dashboards for data tracking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/markets">
                <Button
                  data-testid="explore-markets-btn"
                  className="bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] px-8 py-6 text-lg font-semibold glow-strong"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Explore Markets
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  data-testid="view-dashboard-btn"
                  className="border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 px-8 py-6 text-lg font-semibold"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#00FFFF] rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-[#00FFFF] rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#141b2d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-105 smooth-transition"
                data-testid={`stat-${index}`}
              >
                <div className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-2 text-glow">
                  {stat.value}
                </div>
                <div className="text-[#A9B4C2] text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
              How It Works
            </h2>
            <p className="text-[#A9B4C2] text-lg max-w-2xl mx-auto">
              Powered by advanced AI agents and blockchain technology for trustless verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-glass border border-[#00FFFF]/30 rounded-2xl p-8 hover:border-[#00FFFF] smooth-transition hover:glow group"
                data-testid={`feature-${index}`}
              >
                <div className="text-[#00FFFF] mb-4 group-hover:scale-110 smooth-transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-['Orbitron'] font-semibold text-[#00FFFF] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#A9B4C2]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Verification Works */}
      <section className="py-20 bg-[#141b2d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
              AI Verification Pipeline
            </h2>
            <p className="text-[#A9B4C2] text-lg max-w-2xl mx-auto">
              Multi-agent system ensures accuracy and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Event Detection', desc: 'AI identifies trending events' },
              { step: '02', title: 'Source Verification', desc: 'Cross-checks multiple sources' },
              { step: '03', title: 'Confidence Scoring', desc: 'Calculates reliability score' },
              { step: '04', title: 'Oracle Publishing', desc: 'Publishes to blockchain' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="backdrop-blur-glass border border-[#00FFFF]/30 rounded-xl p-6 hover:border-[#00FFFF] smooth-transition">
                  <div className="text-5xl font-['Orbitron'] font-bold text-[#00FFFF] opacity-20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-['Orbitron'] font-semibold text-[#00FFFF] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#A9B4C2] text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-[#00FFFF]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="backdrop-blur-glass border border-[#00FFFF]/30 rounded-3xl p-12 glow">
            <h2 className="text-3xl sm:text-4xl font-['Orbitron'] font-bold text-[#00FFFF] mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-[#A9B4C2] text-lg mb-8">
              Join thousands of traders using AI-verified data to make informed decisions
            </p>
            <Link to="/markets">
              <Button
                data-testid="get-started-btn"
                className="bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] px-10 py-6 text-lg font-semibold glow-strong"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;