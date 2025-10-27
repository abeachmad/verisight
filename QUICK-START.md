# 🚀 Verisight - Quick Start Guide

## ✅ Prerequisites Check

Pastikan sudah terinstall:
- ✅ Python 3.11+ 
- ✅ Node.js 18+
- ✅ MongoDB (sudah berjalan di port 27017)

## 🎯 Cara Menjalankan Aplikasi

### Opsi 1: Jalankan Otomatis (RECOMMENDED)

Double-click file:
```
START-APP.bat
```

Ini akan membuka 2 terminal:
- Terminal 1: Backend (port 8001)
- Terminal 2: Frontend (port 3000)

### Opsi 2: Jalankan Manual

#### Backend:
```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend (terminal baru):
```bash
cd frontend
npm start
```

## 🌐 Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🔧 Troubleshooting

### Backend tidak jalan?
```bash
cd backend
pip install -r requirements.txt
```

### Frontend tidak jalan?
```bash
cd frontend
npm install --legacy-peer-deps
```

### MongoDB tidak jalan?
```bash
# Start MongoDB service
net start MongoDB
```

## 📝 Fitur Utama

1. **Markets** - Trading pada event yang terverifikasi AI
2. **Create Market** - Buat market prediksi baru
3. **Copy Trading** - Follow strategi trader terbaik
4. **Dashboard** - Analytics dan monitoring real-time
5. **Governance** - Vote pada proposal platform

## 🔑 Wallet Connection

Aplikasi menggunakan MetaMask untuk autentikasi:
1. Install MetaMask extension
2. Klik "Connect Wallet" di navbar
3. Approve signature request
4. Mulai trading!

## 🎨 Tech Stack

**Backend:**
- FastAPI + MongoDB
- OpenAI GPT-4o (mock mode by default)
- JWT Authentication

**Frontend:**
- React 19
- TailwindCSS + shadcn/ui
- Recharts untuk visualisasi

## 📊 Test API

```bash
# Test root endpoint
curl http://localhost:8001/api/

# Get events
curl http://localhost:8001/api/events

# Get markets
curl http://localhost:8001/api/markets
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="verisight_db"
OPENAI_API_KEY="your-key-here"  # Optional
JWT_SECRET="verisight-jwt-secret"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## ✨ Selamat Menggunakan Verisight!

Untuk pertanyaan atau masalah, check README.md untuk dokumentasi lengkap.
