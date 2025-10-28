import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { DEMO } from './utils/demoFlags';

async function bootstrap() {
  // Service Worker hygiene - unregister all at startup
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach(r => r.unregister());
    } catch (_) {}
  }
  
  if (DEMO) {
    console.log('[DEMO] Mock fixtures enabled');
    // Set localStorage flag for consistency
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('VERISIGHT_DEMO', '1');
    }
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: '/mockServiceWorker.js' }
      });
      console.log('[MSW] Mock Service Worker started');
    } catch (error) {
      console.warn('[MSW] Failed to start, continuing with fixtures:', error);
    }
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
