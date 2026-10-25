# CloudRescue — Cloud Backup & Disaster Recovery System

A **complete, modern cloud backup and disaster recovery application**, featuring a **React + Vite frontend** and a secure **Node.js + Express + AWS SDK v3 backend**.

> **Mode Support**: 
> - **Live Mode (Connected):** When the backend is running (`npm start` in `backend/`), files upload to private Amazon S3 buckets via server-side encryption, download streams are piped securely, recovery workflows verify S3 objects, and alerts dispatch through Amazon SNS.
> - **Demo Mode (Offline Fallback):** When the backend is offline, the frontend safely falls back to local simulation without crashing.

---

## 🚀 Quick Start

### 1. Start the Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env    # Configure your S3 bucket & region
npm start
# Runs on http://localhost:5000 (Health: http://localhost:5000/api/health)
```

### 2. Start the Frontend (Terminal 2)
```bash
# In the project root directory
npm install
npm run dev
# Runs on http://localhost:5173
```

Open your browser at: **http://localhost:5173**

---

## 📁 Project Structure

```
cloudrescue/
├── index.html                    # App entry HTML with SEO meta tags
├── vite.config.js                # Vite configuration
├── package.json
├── README.md
└── src/
    ├── main.jsx                  # ReactDOM entry point
    ├── App.jsx                   # Root layout and page router
    ├── index.css                 # Global design system (CSS variables, components)
    │
    ├── context/
    │   └── AppContext.jsx        # Global state: backups, notifications, toasts
    │
    ├── data/
    │   └── mockData.js           # Simulated backup records, notifications, chart data
    │
    ├── components/
    │   ├── Sidebar.jsx           # Dark navy navigation sidebar
    │   ├── Topbar.jsx            # Top navigation bar
    │   ├── ToastContainer.jsx    # Toast notification overlay
    │   └── ui.jsx                # Reusable primitives: badges, toggles, spinners, etc.
    │
    └── pages/
        ├── Dashboard.jsx         # Overview: stat cards, charts, activity feed
        ├── BackupManager.jsx     # Upload, search, filter, manage backups
        ├── RecoveryCenter.jsx    # Restore from backup + DR simulation
        ├── Notifications.jsx     # Backup/recovery alert feed
        └── Settings.jsx          # Notification prefs, storage info, backup config
```

---

## ✨ Features

### 🖥️ Dashboard
- Total backups, storage used, successful/failed counts
- 7-day backup activity bar chart (Recharts)
- Storage usage trend area chart
- Recent backups table with status badges
- Live activity feed

### 📦 Backup Manager
- **Drag-and-drop file upload** (react-dropzone)
- Simulated upload progress bar
- Search by name or source
- Filter by status (success, failed, warning)
- Delete with confirmation dialog
- Simulated download action

### 🔄 Recovery Center
- **Backup selection** with radio-card UI
- **Restore confirmation dialog** with detail review
- **Animated step-by-step restore progress** (6 steps)
- **Disaster Recovery Simulation** — 6-step DR drill with per-step animation and elapsed timer
- All labeled clearly as Demo Mode

### 🔔 Notifications
- Unread / read notification separation
- Mark All Read
- Type-colored icons (success, error, warning, info)

### ⚙️ Settings
- **Notification toggles** for 8 alert types
- Backup frequency, retention period, region, encryption selects
- **Storage usage bars** with per-region breakdown
- Account information panel

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Recharts | Charts (bar, area) |
| lucide-react | Icons |
| react-dropzone | File drag-and-drop |
| Vanilla CSS | Custom design system |

---

## 🔌 Backend Integration Roadmap

This frontend is ready to connect to a **Node.js/Express** backend with AWS services:

| Feature | Backend Integration |
|---|---|
| File upload | `POST /api/backups` → Express → `aws-sdk` S3 `putObject` |
| List backups | `GET /api/backups` → Express → S3 `listObjectsV2` |
| Download | `GET /api/backups/:id/download` → S3 signed URL |
| Restore | `POST /api/recovery/restore` → EC2 / custom restore script |
| Notifications | AWS SNS → backend webhook → push to frontend via SSE/WebSocket |
| Settings | `PUT /api/settings` → Express → database |

> **Security note**: Never hardcode AWS credentials in frontend code. Use environment variables on the backend and IAM roles on EC2/Lambda.

---

## 🎨 Design System

- **Sidebar**: Dark navy (`#0f1629`) with blue accent icons
- **Content area**: Light gray (`#f8fafc`) background, white cards
- **Typography**: Inter font, clean hierarchy
- **Accent color**: Blue (`#2563eb`)
- **Status colors**: Green (success), Red (error), Yellow (warning), Purple (running)
- **Responsive**: Mobile hamburger menu, collapsible sidebar

---

## 📝 License

MIT — for demonstration purposes.
