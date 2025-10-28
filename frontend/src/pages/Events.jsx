import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEMO } from '../utils/demoFlags';
import eventsFixture from '../mocks/fixtures/events.json';

const CATEGORIES = ['All', 'Politics', 'Crypto', 'Sports', 'Science', 'Tech', 'Entertainment'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const loadEvents = () => {
      if (DEMO) {
        console.info('[DEMO] Events: using fixtures', eventsFixture.length);
        setEvents(eventsFixture);
        setLoading(false);
        return;
      }
      
      const timeout = setTimeout(() => {
        console.warn('[DEMO] Fetch timeout, falling back to fixtures');
        setEvents(eventsFixture);
        setLoading(false);
      }, 300);
      
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          clearTimeout(timeout);
          if (data && data.length > 0) {
            setEvents(data);
          } else {
            setEvents(eventsFixture);
          }
          setLoading(false);
        })
        .catch(err => {
          clearTimeout(timeout);
          console.error('Failed to fetch events, using fixtures:', err);
          setEvents(eventsFixture);
          setLoading(false);
        });
    };

    loadEvents();
  }, []);

  const filtered = filter === 'All' 
    ? events 
    : events.filter(e => e.category === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Events</h1>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Events</h1>
        <div className="flex gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded ${filter === cat ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No events found</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cyan-600 rounded">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded transition ${filter === cat ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(event => (
          <Link
            key={event.event_id}
            to={`/events/${event.event_id}`}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <span className={`px-3 py-1 rounded text-sm font-bold ${
                event.confidence >= 0.8 ? 'bg-green-600' :
                event.confidence >= 0.6 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {Math.round(event.confidence * 100)}%
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span className="px-2 py-1 bg-gray-700 rounded">{event.category}</span>
              <span className="px-2 py-1 bg-gray-700 rounded">{event.status}</span>
              <span>{event.sources?.length || 0} sources</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
