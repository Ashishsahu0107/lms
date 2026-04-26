# ⚙️ COMPLETE BACKEND SETUP GUIDE

## 📋 Step 1: Create Folder Structure

### Using File Explorer:
1. Open File Explorer
2. Navigate to: `C:\Users\Ashish\Desktop\lms`
3. Create a new folder called: `backend`
4. Inside `backend`, create two folders:
   - `src`
   - `data`

### Final Structure:
```
lms/
├── frontend/
├── backend/          ← NEW
│   ├── src/         ← NEW (put server.js here)
│   └── data/        ← NEW (database will go here)
├── QUICK_START.md
└── [other files]
```

---

## 📄 Step 2: Create Backend Files

### Create 3 files as shown below:

#### File 1: `C:\Users\Ashish\Desktop\lms\backend\package.json`

```json
{
  "name": "lms-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Real-time Learning Management System Backend",
  "main": "src/server.js",
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js"
  },
  "keywords": ["lms", "learning", "management", "system", "realtime", "websocket"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.0",
    "sqlite3": "^5.1.6",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "engines": {"node": ">=14.0.0"}
}
```

#### File 2: `C:\Users\Ashish\Desktop\lms\backend\.env`

```
NODE_ENV=development
PORT=5000
JWT_SECRET=lms_super_secret_jwt_key_change_in_production_12345
CORS_ORIGIN=http://localhost:5173
DB_PATH=./data/lms.db
API_BASE_URL=http://localhost:5000
```

#### File 3: `C:\Users\Ashish\Desktop\lms\backend\src\server.js`

Copy the complete server code from `BACKEND_SERVER_CODE.md` (see below)

---

## 🚀 Step 3: Install Dependencies

Open Command Prompt:

```bash
cd C:\Users\Ashish\Desktop\lms\backend
npm install
```

Wait for installation to complete (5-10 minutes).

---

## ▶️ Step 4: Start Backend Server

In the same Command Prompt:

```bash
npm run dev
```

You should see:
```
🚀 LMS Backend running on port 5000
📊 Health check: http://localhost:5000/api/health
🔌 WebSocket ready for real-time updates
```

---

## 🔗 Step 5: Connect Frontend

Open another Command Prompt:

```bash
cd C:\Users\Ashish\Desktop\lms\frontend
npm run dev
```

You should see:
```
➜ Local: http://localhost:5173/
```

---

## ✅ Step 6: Test Everything

1. Open browser: `http://localhost:5173`
2. Click "Register"
3. Create a test account
4. You should see real-time updates!

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 5000 already in use | Change PORT in .env file |
| Database error | Delete `backend/data/lms.db` and restart |
| CORS error | Check CORS_ORIGIN in .env matches frontend URL |
| WebSocket won't connect | Check both servers are running |

---

## 📚 Complete Server Code

See: `BACKEND_SERVER_COMPLETE.md` for the full `server.js` code

---

## 🎉 You're Done!

Your backend is now running with:
- ✅ Express.js REST API
- ✅ Socket.IO real-time updates
- ✅ SQLite database
- ✅ JWT authentication
- ✅ 25+ API endpoints
- ✅ Real-time event broadcasting

Enjoy your Learning Management System! 🎓
