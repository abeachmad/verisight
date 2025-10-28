import { http, HttpResponse, delay } from 'msw';
import eventsData from './fixtures/events.json';
import marketsData from './fixtures/markets.json';
import oddsData from './fixtures/odds.json';
import evidenceData from './fixtures/evidence.json';

let blockHeight = 1000;
let lastBlockUpdate = Date.now();

const jitter = (base, range) => base + (Math.random() * range * 2 - range);

export const handlers = [
  http.get('**/api/events', async () => {
    await delay(100);
    return HttpResponse.json(eventsData);
  }),
  
  http.get('**/events', async () => {
    await delay(100);
    return HttpResponse.json(eventsData);
  }),

  http.get('**/api/markets', async () => {
    await delay(120);
    return HttpResponse.json(marketsData);
  }),
  
  http.get('**/markets', async () => {
    await delay(120);
    return HttpResponse.json(marketsData);
  }),

  http.get('**/api/markets/:id', async ({ params }) => {
    await delay(80);
    const { id } = params;
    const market = marketsData.find(m => m.market_id === id);
    
    if (!market) {
      return new HttpResponse(null, { status: 404 });
    }

    const odds = oddsData[id] || { yes: 0.5, no: 0.5, implied_vol: 0.1 };
    const evidence = evidenceData[id] || {};
    const event = eventsData.find(e => e.event_id === market.event_id) || {};

    return HttpResponse.json({
      ...market,
      event,
      odds: {
        yes: Math.max(0.02, Math.min(0.98, jitter(odds.yes, 0.01))),
        no: Math.max(0.02, Math.min(0.98, jitter(odds.no, 0.01))),
        implied_vol: odds.implied_vol
      },
      evidence: {
        ...evidence,
        block_height: blockHeight
      }
    });
  }),

  http.get('**/markets/:id', async ({ params }) => {
    await delay(80);
    const { id } = params;
    const market = marketsData.find(m => m.market_id === id);
    
    if (!market) {
      return new HttpResponse(null, { status: 404 });
    }

    const odds = oddsData[id] || { yes: 0.5, no: 0.5, implied_vol: 0.1 };
    const evidence = evidenceData[id] || {};
    const event = eventsData.find(e => e.event_id === market.event_id) || {};

    return HttpResponse.json({
      ...market,
      event,
      odds: {
        yes: Math.max(0.02, Math.min(0.98, jitter(odds.yes, 0.01))),
        no: Math.max(0.02, Math.min(0.98, jitter(odds.no, 0.01))),
        implied_vol: odds.implied_vol
      },
      evidence: {
        ...evidence,
        block_height: blockHeight
      }
    });
  }),

  http.get('**/api/odds/:market_id', async ({ params }) => {
    await delay(50);
    const { market_id } = params;
    const odds = oddsData[market_id] || { yes: 0.5, no: 0.5, implied_vol: 0.1 };

    return HttpResponse.json({
      yes: Math.max(0.02, Math.min(0.98, jitter(odds.yes, 0.01))),
      no: Math.max(0.02, Math.min(0.98, jitter(odds.no, 0.01))),
      implied_vol: odds.implied_vol,
      timestamp: new Date().toISOString()
    });
  }),

  http.get('**/odds/:market_id', async ({ params }) => {
    await delay(50);
    const { market_id } = params;
    const odds = oddsData[market_id] || { yes: 0.5, no: 0.5, implied_vol: 0.1 };

    return HttpResponse.json({
      yes: Math.max(0.02, Math.min(0.98, jitter(odds.yes, 0.01))),
      no: Math.max(0.02, Math.min(0.98, jitter(odds.no, 0.01))),
      implied_vol: odds.implied_vol,
      timestamp: new Date().toISOString()
    });
  }),
  
  http.get('**/evidence/:id', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const evidence = evidenceData[id] || {};
    return HttpResponse.json(evidence);
  }),

  http.get('**/health', async () => {
    await delay(30);
    
    const now = Date.now();
    if (now - lastBlockUpdate > 5000) {
      blockHeight += 1;
      lastBlockUpdate = now;
    }

    return HttpResponse.json({
      status: 'degraded',
      blockHeight,
      latency: Math.floor(jitter(130, 50)),
      timestamp: new Date().toISOString()
    });
  }),
  
  http.get('**/api/health', async () => {
    await delay(30);
    
    const now = Date.now();
    if (now - lastBlockUpdate > 5000) {
      blockHeight += 1;
      lastBlockUpdate = now;
    }

    return HttpResponse.json({
      status: 'degraded',
      blockHeight,
      latency: Math.floor(jitter(130, 50)),
      timestamp: new Date().toISOString()
    });
  }),
  
  http.get('/health', async () => {
    await delay(30);
    
    const now = Date.now();
    if (now - lastBlockUpdate > 5000) {
      blockHeight += 1;
      lastBlockUpdate = now;
    }

    return HttpResponse.json({
      status: 'degraded',
      blockHeight,
      latency: Math.floor(jitter(130, 50)),
      timestamp: new Date().toISOString()
    });
  })
];
