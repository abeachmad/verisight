import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { isDemo } from '../utils/demoFlags';
import eventsFixture from '../mocks/fixtures/events.json';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo()) {
      console.info('[DEMO] Events: using fixtures', eventsFixture.length);
      const transformedEvents = eventsFixture.map(event => ({
        id: event.event_id,
        event_title: event.title,
        event_description: `AI-verified event in ${event.category} category`,
        status: event.status,
        confidence: event.confidence,
        created_at: event.created_at
      }));
      setEvents(transformedEvents);
      setLoading(false);
      return;
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const timeout = setTimeout(() => {
      console.warn('[FALLBACK] Using fixtures due to slow/failed fetch');
      const transformedEvents = eventsFixture.map(event => ({
        id: event.event_id,
        event_title: event.title,
        event_description: `AI-verified event in ${event.category} category`,
        status: event.status,
        confidence: event.confidence,
        created_at: event.created_at
      }));
      setEvents(transformedEvents);
      setLoading(false);
    }, 300);

    try {
      const response = await axios.get(`${API}/events`);
      clearTimeout(timeout);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      clearTimeout(timeout);
      const transformedEvents = eventsFixture.map(event => ({
        id: event.event_id,
        event_title: event.title,
        event_description: `AI-verified event in ${event.category} category`,
        status: event.status,
        confidence: event.confidence,
        created_at: event.created_at
      }));
      setEvents(transformedEvents);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'verifying':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'verifying':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#00FFFF] text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-['Orbitron'] font-bold text-[#00FFFF] mb-2">
            Oracle Events
          </h1>
          <p className="text-[#A9B4C2]">
            AI-verified real-world events from OracleFeed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-[#141b2d] border-[#00FFFF]/30 p-6 cursor-pointer hover:border-[#00FFFF] smooth-transition"
              onClick={() => navigate(`/market/${event.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${getStatusColor(event.status)} border flex items-center`}>
                  {getStatusIcon(event.status)}
                  <span className="ml-1">{event.status.toUpperCase()}</span>
                </Badge>
                {event.confidence && (
                  <span className="text-[#00FFFF] text-sm font-semibold">
                    {(event.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <h3 className="text-lg font-['Orbitron'] font-semibold text-[#00FFFF] mb-2">
                {event.event_title}
              </h3>
              <p className="text-[#A9B4C2] text-sm mb-4 line-clamp-2">
                {event.event_description}
              </p>

              <div className="text-xs text-[#A9B4C2]">
                {new Date(event.created_at).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#A9B4C2]">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
