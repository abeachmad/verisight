import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Github, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0F1F] border-t border-[#00FFFF]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-8 w-8 text-[#00FFFF]" />
              <span className="text-2xl font-bold text-[#00FFFF] font-['Orbitron']">
                VERISIGHT
              </span>
            </div>
            <p className="text-[#A9B4C2] mb-4 max-w-md">
              Truth in Real Time. AI-powered oracle and prediction platform built on Linera blockchain.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#00FFFF] font-['Orbitron'] font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/markets" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Markets
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Create Market
                </Link>
              </li>
              <li>
                <Link to="/copytrading" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Copy Trading
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[#00FFFF] font-['Orbitron'] font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Whitepaper
                </a>
              </li>
              <li>
                <Link to="/governance" className="text-[#A9B4C2] hover:text-[#00FFFF] smooth-transition">
                  Governance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#00FFFF]/20 text-center text-[#A9B4C2]">
          <p>&copy; {currentYear} Verisight. All rights reserved. Built on Linera L1.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;