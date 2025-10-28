import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const enableMock = process.env.REACT_APP_MODE === 'MOCK' || process.env.REACT_APP_DEMO_DATA === 'true';

async function bootstrap() {
  if (enableMock) {
    // Unregister old service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' }
    });
    console.log('[MSW] Mock Service Worker started');
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
