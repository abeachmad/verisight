# 🔧 Verisight - Troubleshooting Guide

## ❌ Error: Port 8001 Already in Use

**Error Message:**
```
ERROR: [WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions
```

**Solusi:**

### Opsi 1: Gunakan STOP-APP.bat (Recommended)
```bash
# Double-click file ini untuk stop semua proses:
STOP-APP.bat

# Kemudian jalankan lagi:
START-APP.bat
```

### Opsi 2: Manual Kill Process
```bash
# Cari PID yang menggunakan port 8001
netstat -ano | findstr :8001

# Kill process (ganti 12345 dengan PID yang ditemukan)
taskkill /F /PID 12345
```

### Opsi 3: Gunakan Port Lain
Edit `backend/.env`:
```env
PORT=8002
```

Edit `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8002
```

---

## ❌ Error: MongoDB Not Running

**Error Message:**
```
pymongo.errors.ServerSelectionTimeoutError
```

**Solusi:**
```bash
# Start MongoDB service
net start MongoDB

# Atau jalankan mongod manual
mongod --dbpath C:\data\db
```

---

## ❌ Error: Module Not Found (Backend)

**Error Message:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solusi:**
```bash
cd backend
pip install -r requirements.txt
```

---

## ❌ Error: npm Dependencies (Frontend)

**Error Message:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solusi:**
```bash
cd frontend
npm install --legacy-peer-deps
```

---

## ❌ Error: MetaMask Not Detected

**Solusi:**
1. Install MetaMask extension: https://metamask.io/download/
2. Refresh browser
3. Click "Connect Wallet"

---

## ❌ Frontend Tidak Muncul

**Cek:**
1. Apakah terminal frontend menunjukkan "Compiled successfully"?
2. Buka http://localhost:3000 di browser
3. Clear browser cache (Ctrl+Shift+Delete)
4. Coba browser lain

---

## ❌ Backend API Tidak Responding

**Cek:**
```bash
# Test API
curl http://localhost:8001/api/

# Cek log di terminal backend
# Pastikan tidak ada error
```

---

## 🔄 Reset Aplikasi

Jika semua cara gagal:

```bash
# 1. Stop semua proses
STOP-APP.bat

# 2. Reinstall backend
cd backend
pip uninstall -y -r requirements.txt
pip install -r requirements.txt

# 3. Reinstall frontend
cd ../frontend
rmdir /s /q node_modules
npm install --legacy-peer-deps

# 4. Restart
cd ..
START-APP.bat
```

---

## 📞 Masih Bermasalah?

1. Check log di terminal backend dan frontend
2. Pastikan MongoDB running
3. Pastikan port 8001 dan 3000 tidak digunakan aplikasi lain
4. Restart komputer

---

## ✅ Quick Checks

```bash
# MongoDB running?
tasklist | findstr mongod

# Port 8001 free?
netstat -ano | findstr :8001

# Port 3000 free?
netstat -ano | findstr :3000

# Backend dependencies OK?
cd backend && python -c "import fastapi, motor, jose; print('OK')"

# Frontend dependencies OK?
cd frontend && dir node_modules\react
```
