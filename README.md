# Folio — Personal Knowledge Workspace & Smart Search

A modern, production-grade personal knowledge management platform with an art-directed editorial design language, interactive knowledge graph, persistent mind maps, and instant search capabilities.

Built for students, software engineers, and researchers to capture, organize, cross-link, and visually explore their ideas.

---

## 🌿 Highlights & Key Capabilities

- **Editorial Design System**: Warm ivory (`#F7F6F2`), deep charcoal (`#252720`), restrained olive (`#596A50`) and terracotta (`#BF765C`) accents. Features typography pairing *Instrument Serif*, *DM Sans*, and *JetBrains Mono*.
- **Multi-Modality Note Cards**: Full support for Study Notes, Code Snippets (with syntax styling), Web Links (with metadata), and Research Notes.
- **Smart Search & Command Palette (`Ctrl/Cmd + K`)**: Instant search across titles, content, tags, collections, and URLs with keyboard navigation and filter pills.
- **Interactive Knowledge Graph**: React Flow (`@xyflow/react`) powered visualization mapping explicit links and shared semantic tags into a navigable graph with slide-over inspection drawers.
- **Persistent Mind Map Studio**: Visual idea-mapping canvas where nodes can be connected, colored, edited inline, and linked directly to existing knowledge base notes.
- **Deep Analytics & Insights**: Responsive charts tracking capture velocity over time (7d, 30d, 90d), note type distribution, collection balance, and dominant tags.
- **Version Revision History**: Snapshot preservation on note updates with instant one-click rollback and version comparison.
- **Real Database Integration**: Connected to local MongoDB Community Server via Mongoose with strict startup verification, ObjectId-to-virtual-id transformation, and full CRUD operations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS (custom design tokens), Lucide React |
| **Knowledge Graph** | React Flow (`@xyflow/react`) |
| **Visual Analytics** | Recharts (area, bar, and donut charts) |
| **Routing & Auth** | React Router DOM v6, JWT context authentication |
| **Backend Runtime** | Node.js, Express.js |
| **Database & ODM** | MongoDB Community Server (v9.0+), Mongoose ODM |
| **Security & Auth** | JWT (`jsonwebtoken`), bcrypt password hashing, CORS |
| **Diagnostics & Tools** | Morgan HTTP logging, standalone E2E & DB test scripts |

---

## 📂 Project Organization

```text
Full-Stack Project/
├── client/                     # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, Sidebar, Header
│   │   │   ├── notes/          # NoteCard, NoteEditorModal, RevisionHistoryModal
│   │   │   ├── collections/    # CollectionModal
│   │   │   └── search/         # CommandPalette (Ctrl+K)
│   │   ├── pages/              # Dashboard, AllNotes, Collections, Graph, MindMaps, Analytics, Settings
│   │   ├── services/           # Axios/Fetch API clients for notes, collections, mindmaps, analytics
│   │   ├── context/            # AuthContext (JWT session management)
│   │   └── types/              # TypeScript interface definitions
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Mongoose connection & DNS resolution
│   ├── models/                 # User, Note, Collection, NoteRevision, MindMap schemas
│   ├── routes/                 # Express REST endpoints (auth, notes, collections, mindmaps, analytics)
│   ├── middleware/             # JWT auth middleware & data ownership checks
│   ├── seed.js                 # Realistic seed script for demonstration
│   ├── test-db-connection.js   # Local MongoDB connection diagnostic test
│   ├── test-api-e2e.js         # End-to-end API integration test
│   ├── server.js               # Express application entry (database-gated startup)
│   ├── .env                    # Environment variables (ignored by git)
│   └── .env.example            # Environment template
├── package.json                # Root package.json (concurrent orchestration)
└── README.md
```

---

## 🚀 Quick Start & Starting Commands

### Prerequisites
1. **Node.js**: v18.0.0 or higher
2. **npm**: v9.0.0 or higher
3. **MongoDB Community Server**: Running locally on port `27017`
4. **MongoDB Compass** *(optional but recommended for visual database inspection)*

---

### Step 1: Install Dependencies
From the repository root folder:
```powershell
npm run install:all
```
*Or install client and server individually:*
```powershell
cd server
npm install
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables
Verify or create `server/.env` (a template is provided in `server/.env.example`):
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/folio
JWT_SECRET=folio_super_secret_jwt_key_2026_knowledge_workspace
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Seed the Database
Populate your local MongoDB `folio` database with 12 rich technical notes, 5 collections, sample revisions, and an interactive mind map:
```powershell
npm run seed
```
*Or directly inside the server folder:*
```powershell
cd server
node seed.js
```

---

### Step 4: Start the Application

#### Option A: Concurrent Start (Single Terminal)
From the project root:
```powershell
npm start
```
This concurrently launches:
- **Frontend App**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`

---

#### Option B: Separate Terminals (Recommended for Development)

**Terminal 1 — Backend Server:**
```powershell
cd server
npm run dev
# or: node server.js
```

**Terminal 2 — Frontend App:**
```powershell
cd client
npm run dev
```

---

## 🔐 Default Demo Credentials

Once the application is running, navigate to **http://localhost:5173**:

- **Email**: `alex.chen@folio.workspace`
- **Password**: `folio2026`
- **Quick Access**: Click the **"1-Click Demo Sign In"** button on the login screen to authenticate instantly.

---

## 🧭 Viewing in MongoDB Compass

To inspect the raw database records created by Folio:

1. Open **MongoDB Compass**.
2. Connect to the local server URI:
   ```text
   mongodb://localhost:27017
   ```
3. Click on the **`folio`** database in the left sidebar.
4. You will see 5 collections:
   - **`users`**: User profiles with bcrypt-hashed passwords and preferences
   - **`notes`**: Note records with types, markdown content, tags, and cross-references
   - **`collections`**: Color-coded category folders
   - **`noterevisions`**: Historical version snapshots of notes
   - **`mindmaps`**: Node-and-edge layout definitions for interactive canvases

---

## 🧪 Testing & Verification Scripts

The backend includes built-in diagnostic test scripts:

### Test Local MongoDB Connection
```powershell
cd server
node test-db-connection.js
```
*Outputs MongoDB version, host, database name, connection status, and document counts across all collections.*

### Test End-to-End API Routes
```powershell
cd server
node test-api-e2e.js
```
*Tests authentication login, note queries, collection fetching, mind maps, and analytics generation against the live backend.*

### Check API Server Health
Visit in your browser or run:
```powershell
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "status": "ok",
  "name": "Folio API Server",
  "version": "1.0.0",
  "database": {
    "isConnected": true,
    "useEmbeddedFallback": false,
    "type": "mongodb-local",
    "host": "127.0.0.1",
    "name": "folio"
  }
}
```

---

## 📖 Complete API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile |
| `PUT` | `/api/auth/profile` | Update profile name and UI preferences |

### Notes (`/api/notes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Query notes with search, type, collection, tag, favorite, and sort filters |
| `POST` | `/api/notes` | Create a new note and record initial version revision |
| `GET` | `/api/notes/:id` | Retrieve single note with populated related links |
| `PUT` | `/api/notes/:id` | Update note and archive pre-edit revision snapshot |
| `DELETE` | `/api/notes/:id` | Delete note and its associated revisions |
| `POST` | `/api/notes/:id/duplicate`| Clone an existing note |
| `PATCH`| `/api/notes/:id/favorite` | Toggle favorite star status |
| `GET` | `/api/notes/:id/revisions`| Retrieve revision history list |
| `POST` | `/api/notes/:id/revisions/:revisionId/restore` | Restore note content to a previous version |
| `GET` | `/api/notes/tags` | List all unique tags and their occurrence frequencies |

### Collections (`/api/collections`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/collections` | List all collections with real-time note counts |
| `POST` | `/api/collections` | Create a new category collection |
| `GET` | `/api/collections/:id` | Get collection details and assigned notes |
| `PUT` | `/api/collections/:id` | Update collection name, color, and description |
| `DELETE`| `/api/collections/:id`| Delete collection (unassigns associated notes cleanly) |

### Mind Maps (`/api/mindmaps`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/mindmaps` | List all mind maps for user |
| `POST` | `/api/mindmaps` | Create a new mind map |
| `GET` | `/api/mindmaps/:id` | Get mind map node and edge structure |
| `PUT` | `/api/mindmaps/:id` | Save modified node positions, labels, and links |
| `DELETE`| `/api/mindmaps/:id` | Delete a mind map |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics?days=30` | Calculate activity timeline, word counts, collection balance, type distributions, and weekly velocity |

---

## 🛠️ Windows Troubleshooting

### 1. MongoDB Service Not Running
If the backend logs `Server startup aborted: Failed to establish MongoDB connection`:
1. Open an Administrator Command Prompt or PowerShell:
   ```cmd
   net start MongoDB
   ```
2. Or press `Win + R`, type `services.msc`, locate **MongoDB Server (MongoDB)**, right-click, and select **Start**.

### 2. Port Already in Use
- **Port 5000** (Backend):
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
- **Port 5173** (Frontend Vite):
  Vite will automatically offer the next available port (e.g. `5174`), or you can terminate the existing process.

---

## 📄 License
This project is developed for educational and portfolio demonstration purposes. All rights reserved.
