# ✅ Sanity Check - Mock Mode

## Prerequisites
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] .env.local configured for mock mode

## Start Services

### Terminal 1: Backend (Mock)
```powershell
cd backend
$env:ENV="development"
uvicorn server:app --host 127.0.0.1 --port 8001 --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete.
```

### Terminal 2: Frontend
```powershell
cd frontend
npm start
```

**Expected Output**:
```
Compiled successfully!
You can now view frontend in the browser.
  Local:            http://localhost:3000
```

---

## ✅ Checklist (Pass Criteria)

### 1. Frontend Loads
- [ ] http://localhost:3000 opens successfully
- [ ] No console errors (check F12 DevTools)
- [ ] Landing page displays

### 2. StatusBar Component
- [ ] StatusBar visible at top
- [ ] Shows "Linera Testnet" or service URL
- [ ] Block height displays (can be "Unknown" in mock)
- [ ] Latency displays (can be "N/A" in mock)
- [ ] Status indicator shows (green/yellow/red dot)

### 3. Events Page
- [ ] Navigate to /events
- [ ] Event list displays (mock data)
- [ ] Confidence badges show (e.g., 95%)
- [ ] Click event navigates to detail

### 4. Market Detail Page
- [ ] Market info displays
- [ ] On-chain evidence section shows:
  - [ ] IPFS CID (can be mock)
  - [ ] TX Hash (can be mock)
  - [ ] Chain ID (can be mock)
- [ ] Odds chart displays
- [ ] Stake panel visible

### 5. Stake Button Logic
- [ ] Button enabled for active markets
- [ ] Button disabled when:
  - [ ] Market cutoff passed
  - [ ] Market resolved
  - [ ] Shows appropriate message

### 6. Backend API
- [ ] http://127.0.0.1:8001/docs opens (FastAPI docs)
- [ ] GET /api/events returns data
- [ ] GET /api/markets returns data

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
cd backend
pip install -r requirements.txt
```

### Frontend won't start
```powershell
cd frontend
npm install --legacy-peer-deps
```

### Port already in use
```powershell
# Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS errors
Check backend .env:
```
CORS_ORIGINS="*"
```

---

## 📸 Screenshot Checklist

For submission, capture:
1. Landing page
2. Events list with confidence badges
3. Market detail with on-chain evidence
4. Stake panel (enabled + disabled states)
5. StatusBar with metrics

---

## ⏱️ Expected Time
- Setup: 2 minutes
- Testing: 5 minutes
- Total: ~7 minutes

---

## 🎯 Success Criteria

**PASS** if all 5 checklist sections complete without errors.

**FAIL** if:
- Frontend doesn't load
- Console shows critical errors
- Stake button logic broken
- API endpoints return 500 errors
