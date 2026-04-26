# ⚡ Quick Start - Real-Time LMS

## 3-Minute Setup

### Backend Setup

```bash
# 1. Create folders
cd C:\Users\Ashish\Desktop\lms
mkdir backend\src
mkdir backend\data

# 2. Create package.json in backend folder with dependencies (see BACKEND_SETUP.md)
# 3. Create .env in backend folder (see BACKEND_SETUP.md)
# 4. Create server.js in backend\src (see BACKEND_SERVER.md)

# 5. Install and run
cd backend
npm install
npm run dev
```

**Expected Output:**
```
🚀 LMS Backend running on port 5000
🔌 WebSocket ready for real-time updates
```

### Frontend Setup

```bash
# Terminal 2 (Keep backend running)
cd C:\Users\Ashish\Desktop\lms\frontend

# Install missing dependencies
npm install

# Start frontend
npm run dev
```

**Expected Output:**
```
➜ Local:   http://localhost:5173/
```

---

## Test It!

1. **Open**: http://localhost:5173
2. **Register**: Create a new account
3. **Login**: Use your credentials
4. **See**: Real-time updates on dashboard

### Test Real-Time Features

Open **2 browser windows**:

**Window 1**: Login as User A
**Window 2**: Login as User B

When User B does something (enrolls course, etc.), User A sees it instantly!

---

## What's Working

✅ User registration & login
✅ Real-time updates
✅ Live dashboard
✅ Course management
✅ Progress tracking
✅ WebSocket events

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5000 in use | Change PORT in backend/.env |
| Port 5173 in use | Vite will use 5174 automatically |
| WebSocket error | Check CORS_ORIGIN in .env matches http://localhost:5173 |
| Can't login | Check backend is running (http://localhost:5000/api/health) |

---

## Next Steps

1. ✅ Explore the dashboard
2. ✅ Test real-time features with 2 windows
3. ✅ Create courses
4. ✅ Enroll in courses
5. ✅ Check progress tracking

---

## 📖 Full Guides

- **REALTIME_INTEGRATION_GUIDE.md** - Detailed setup
- **BACKEND_SETUP.md** - Backend instructions
- **BACKEND_SERVER.md** - Server code

---

**That's it! Your real-time LMS is running!** 🚀

For detailed setup, see **REALTIME_INTEGRATION_GUIDE.md**
