# Security & Performance Checklist

## ✅ Completed

### Frontend Security
- [x] No sensitive APP_IDs in `REACT_APP_*` env variables
- [x] Only public URLs exposed (RPC endpoint, IPFS gateway)
- [x] External links use `rel="noopener noreferrer"`
- [x] `.env.example` includes security notes

### Performance & Reliability
- [x] Polling with abort controllers (StatusBar, MarketDetail)
- [x] Exponential backoff for health check retries (5s → 7.5s → 11.25s, max 30s)
- [x] Cleanup on route change/unmount
- [x] Concurrent request limiting via abort

### Accessibility (A11y)
- [x] Status indicators have text labels + colors
- [x] `aria-live="polite"` for StatusBar
- [x] `aria-label` for interactive elements
- [x] Screen reader text with `sr-only` class

### UX Enhancements
- [x] Copy to clipboard button for TX hash
- [x] Toast notifications for velocity cap/cooldown warnings
- [x] Visual feedback (check icon) on successful copy
- [x] Fallback health badge (yellow) when backend down

## Implementation Details

### Polling Strategy
```javascript
// StatusBar: 5s base, exponential backoff on failure
const delay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);

// MarketDetail: 3s fixed interval with abort on unmount
const oddsInterval = setInterval(fetchOdds, 3000);
```

### Abort Pattern
```javascript
const abortControllerRef = useRef(null);

// Before fetch
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
abortControllerRef.current = new AbortController();

// Cleanup
return () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
};
```

### Security Notes
- APP_IDs are **never** exposed in frontend env
- Backend `/health` endpoint provides runtime config if needed
- All external links open in new tab with `noopener`
- IPFS gateway and RPC URLs are public infrastructure

## Testing Recommendations

1. **Network Failure**: Disconnect network → verify exponential backoff
2. **Route Change**: Navigate away → verify fetch aborted
3. **Clipboard**: Test copy button on different browsers
4. **Screen Reader**: Test with NVDA/JAWS for status announcements
5. **Load**: Open multiple tabs → verify no request flooding

## Production Checklist

- [ ] Set production RPC endpoint in env
- [ ] Configure CDN for IPFS gateway
- [ ] Enable rate limiting on backend
- [ ] Add Sentry/error tracking
- [ ] Test with slow 3G network
- [ ] Verify CSP headers
