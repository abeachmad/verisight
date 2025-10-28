export const isDemo = () => {
  const mode = String(process.env.REACT_APP_MODE || '').toLowerCase();
  const demoA = String(process.env.REACT_APP_DEMO_DATA || '') === 'true';
  const demoB = String(process.env.REACT_APP_DEMO || '') === '1';
  const demoC = String(process.env.DEMO_DATA || '') === '1';
  return mode.includes('demo') || demoA || demoB || demoC;
};
export const disableWS = () => String(process.env.REACT_APP_DISABLE_WS || '') === '1';
