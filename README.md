# Folio — Personal Knowledge Workspace & Smart Search

A full-stack, personal knowledge management platform with an art-directed editorial design language, interactive knowledge graph, persistent mind maps, and search capabilities.

Built for students, software engineers, and researchers to capture, organize, cross-link, and visually explore their ideas.

---

## 🌿 Highlights & Key Differentiators

- **Editorial Design System**: Warm ivory (`#F7F6F2`), deep charcoal (`#252720`), restrained olive (`#596A50`) and terracotta (`#BF765C`) accents. Features typography pairing *Instrument Serif*, *DM Sans*, and *JetBrains Mono*.
- **Multi-Modality Note Cards**: Full support for Study Notes, Code Snippets (with syntax styling), Web Links (with metadata), and Research Notes.
- **Smart Search & Command Palette (`Ctrl/Cmd + K`)**: Instant search across titles, content, tags, collections, and URLs with keyboard navigation and filter pills.
- **Interactive Knowledge Graph**: React Flow powered visualization mapping explicit links and shared semantic tags into a navigable graph with slide-over inspection drawers.
- **Persistent Mind Map Studio**: Visual idea-mapping canvas where nodes can be connected, colored, edited inline, and linked directly to existing knowledge base notes.
- **Deep Analytics & Insights**: Responsive charts tracking capture velocity over time (7d, 30d, 90d), note type distribution, collection balance, and dominant tags.
- **Version Revision History**: Snapshot preservation on note updates with instant one-click rollback.
- **Dual-Mode Database Engine**: Connects natively to MongoDB via Mongoose. If MongoDB is not installed locally, it seamlessly switches to the zero-config embedded storage engine (`server/data/folio-db.json`) ensuring immediate demonstration without dependencies.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS tailored with custom Folio design tokens
- **Graph & Mind Maps**: React Flow (`@xyflow/react`)
- **Visual Analytics**: Recharts
- **Iconography**: Lucide React
- **Routing**: React Router DOM v6
- **Markdown / Code**: Custom formatted code blocks and markdown preview

### Backend
- **Runtime**: Node.js & Express
- **Authentication**: JWT & bcryptjs password hashing
- **Database**: Mongoose (MongoDB) with embedded zero-config fallback
- **Logging & Security**: Morgan, CORS, input validation, strict user data isolation

---

## 📂 Project Organization

```
Full-Stack Project/
├── client/                     # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, Sidebar, Header
│   │   │   ├── notes/          # NoteCard, NoteEditorModal, RevisionHistoryModal
│   │   │   ├── collections/    # CollectionModal
│   │   │   └── search/         # CommandPalette (Ctrl+K)
│   │   ├── pages/              # Dashboard, AllNotes, Collections, Graph, MindMaps, Analytics, etc.
│   │   ├── services/           # API clients for notes, collections, mindmaps, analytics
│   │   ├── context/            # AuthContext (JWT session management)
│   │   └── types/              # TypeScript interface definitions
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Database connection & dual-mode driver
│   ├── models/                 # User, Note, Collection, NoteRevision, MindMap
│   ├── routes/                 # Express REST endpoints
│   ├── middleware/             # JWT auth middleware & data ownership checks
│   ├── data/                   # Embedded fallback database storage
│   ├── seed.js                 # Realistic seed script for demonstration
│   └── server.js               # Express application entry
├── package.json                # Root package.json (concurrent orchestration)
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB or MongoDB Atlas URI (not required; embedded engine activates automatically if MongoDB is absent).

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```
*Or install client and server individually:*
```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Seed the Knowledge Base
Populate the database with realistic notes, linked knowledge graph edges, collections, and a sample mind map:
```bash
npm run seed
```

This creates the default demo account:
- **Email**: `alex.chen@folio.workspace`
- **Password**: `folio2026`
*(You can also use the **1-Click Demo Sign In** button directly on the login screen).*

### Step 3: Start the Application
Run both backend API and frontend Vite dev server concurrently:
```bash
npm start
```
- Frontend will open at: **http://localhost:5173**
- Backend API will run at: **http://localhost:5000**
- Health Check available at: **http://localhost:5000/api/health**

---

## ⚙️ Environment Variables

Create a `server/.env` file (a pre-configured template is available at `server/.env.example`):

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/folio
JWT_SECRET=folio_super_secret_jwt_key_2026_knowledge_workspace
CLIENT_URL=http://localhost:5173
```

*Note: If `MONGODB_URI` cannot connect to a running instance within 2.5 seconds, Folio automatically activates its Embedded Data Engine, logging diagnostic output in the terminal.*

---

## 📖 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Get authenticated user profile
- `PUT /api/auth/profile` — Update display name and preferences

### Notes (`/api/notes`)
- `GET /api/notes` — Query notes with search, type, collection, tag, and sort filters
- `POST /api/notes` — Create note and log initial revision
- `GET /api/notes/:id` — Retrieve note with populated links
- `PUT /api/notes/:id` — Update note and save historical snapshot
- `DELETE /api/notes/:id` — Delete note and revisions
- `POST /api/notes/:id/duplicate` — Duplicate note
- `PATCH /api/notes/:id/favorite` — Toggle starred status
- `GET /api/notes/:id/revisions` — List revision history
- `POST /api/notes/:id/revisions/:revisionId/restore` — Restore previous version
- `GET /api/notes/tags` — Aggregated tag frequency list

### Collections (`/api/collections`)
- `GET /api/collections` — List collections with real-time note counts
- `POST /api/collections` — Create new collection
- `GET /api/collections/:id` — Get collection details and its notes
- `PUT /api/collections/:id` — Update collection
- `DELETE /api/collections/:id` — Safe deletion (unassigns notes)

### Mind Maps (`/api/mindmaps`)
- `GET /api/mindmaps` — List user's saved mind maps
- `POST /api/mindmaps` — Create new mind map
- `GET /api/mindmaps/:id` — Retrieve mind map nodes and edges
- `PUT /api/mindmaps/:id` — Persist changes to nodes and connections
- `DELETE /api/mindmaps/:id` — Delete mind map

### Analytics (`/api/analytics`)
- `GET /api/analytics?days=30` — Compute activity timeline, distribution, tags, word counts, and graph connectivity

---

## 🧪 Verification & Demonstration Steps

1. **Dashboard Check**: Sign in with 1-Click Demo login (`alex.chen@folio.workspace`). Verify greeting, overview statistics cards, notes activity graph, and category distribution donut.
2. **Notes Management**: Switch between Grid and List views. Filter by "Code" or "Research", sort by Title or Date. Open a note to edit, add a tag, and toggle star.
3. **Smart Search**: Press `Ctrl + K` (or `Cmd + K`). Type keywords like "event loop" or "aws" to see instant filtering and keyboard selection.
4. **Knowledge Graph**: Navigate to **Knowledge Graph**. Pan, zoom, click a node to open the slide-over inspection drawer, and test the collection/type filters.
5. **Mind Maps**: Open **Mind Maps**. Double-click a node to edit text, click **+** to sprout connected child nodes, or click a linked note badge to open the source note. Save canvas changes.
6. **Version History**: Edit a note title or content, open the **Version History** modal, compare the previous snapshot, and test **Restore This Version**.
7. **Vault Export**: Go to **Settings** and click **Download Full Vault Backup** to receive a JSON archive of all notes and mind maps.
