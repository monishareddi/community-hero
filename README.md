# 🦸 Community Hero

A beginner-friendly, fully runnable MVP for reporting and tracking local **civic
issues** (potholes, water leaks, broken streetlights, garbage, etc.).

Anyone can submit an issue with a location on a map, see all issues in a list and
on the map, upvote/verify them, and move them through a status workflow. A simple
**rule-based "AI-assisted suggestion"** helps pick a category from the description.

> **Honesty note:** This is an MVP. It only implements what is listed in
> [Features](#features) below. The "AI-assisted suggestion" is **keyword matching,
> not machine learning** — it is clearly labelled as such everywhere in the app.
> There is **no authentication** and **no paid API**.

---

## Features

What this project **actually does** (no inflated claims):

1. **Submit a civic issue** with title, description, category, severity,
   latitude, longitude, and an **optional image**.
2. **Stores issues in SQLite** (a single local file, no database server needed).
3. **Shows all issues** both as a **list** and as **markers on a map**
   (Leaflet + OpenStreetMap, no API key).
4. **Update issue status**: `Reported` → `Verified` → `In Progress` → `Resolved`.
5. **Upvote / verification count** — a button increments a counter per issue.
6. **Rule-based AI categorization** from the description text, shown as an
   **"AI-assisted suggestion"** that the user can apply or ignore.
7. **Pick location by clicking the map** (or use the picked coordinates shown
   in the form).
8. **Filter the list by status**.

What this project **does NOT do** (intentionally out of scope for the MVP):

- No login / user accounts / authentication.
- No editing or deleting of issues after submission.
- No real machine-learning model.
- No email/SMS notifications.
- No deployment config (runs locally only).

---

## Tech stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18 + Vite                              |
| Map       | Leaflet + react-leaflet + OpenStreetMap tiles|
| Backend   | Node.js + Express                            |
| Database  | SQLite (via `better-sqlite3`)                |
| Uploads   | `multer` (stores images on disk)             |

No Docker. No paid APIs. No authentication.

---

## Architecture

```
                 HTTP (JSON + multipart)
  ┌──────────────┐   /api/...        ┌──────────────────┐
  │   Browser    │ ───────────────▶  │  Express backend │
  │ React + Vite │ ◀───────────────  │  (Node.js)       │
  │  (port 5173) │   JSON responses  │   (port 3001)    │
  └──────┬───────┘                   └─────────┬────────┘
         │                                     │
         │ Leaflet loads free                  │ reads/writes
         │ map tiles directly                  ▼
         ▼                            ┌──────────────────┐
  ┌──────────────┐                    │  SQLite file     │
  │ OpenStreetMap│                    │ community_hero.db│
  │ tile servers │                    └──────────────────┘
  └──────────────┘                    + uploads/ (images on disk)
```

- During development, Vite **proxies** any `/api` and `/uploads` request to the
  backend (see `frontend/vite.config.js`), so the React code uses simple
  relative URLs and there are no CORS headaches.
- The backend serves uploaded images as static files from `/uploads`.

### Folder structure

```
community-hero/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js          # Express app + all API routes
│   ├── db.js              # SQLite setup + table schema
│   ├── aiCategorize.js    # rule-based category suggestion
│   └── uploads/           # uploaded images are saved here at runtime
└── frontend/
    ├── package.json
    ├── vite.config.js     # dev server + proxy to backend
    ├── index.html
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # top-level state + layout
        ├── api.js         # all backend fetch calls
        ├── index.css
        └── components/
            ├── IssueForm.jsx  # submit form + AI suggestion
            ├── IssueMap.jsx   # Leaflet map, click to pick location
            ├── IssueList.jsx  # list + status filter
            └── IssueCard.jsx  # one issue: status + upvote
```

---

## Setup (Windows)

**Prerequisite:** Install **Node.js LTS (v18 or newer)** from
<https://nodejs.org>. This includes `npm`. Verify in a terminal:

```bat
node --version
npm --version
```

You will run the **backend** and the **frontend** in **two separate terminals**.

### Terminal 1 — Backend

```bat
cd community-hero\backend
npm install
npm start
```

You should see: `Community Hero backend running at http://localhost:3001`
The SQLite file `community_hero.db` is created automatically on first run.

> `npm install` downloads a prebuilt `better-sqlite3` binary, so you do **not**
> need any C++ build tools on a normal Windows machine.

### Terminal 2 — Frontend

```bat
cd community-hero\frontend
npm install
npm run dev
```

Vite will print a local URL (default **http://localhost:5173**).
Open it in your browser.

### Using the app

1. Click anywhere on the map to set the issue location (a green marker appears).
2. Fill in the title and description.
3. (Optional) Click **"Suggest category (AI-assisted)"** to get a keyword-based
   category guess, then **Apply** it or pick your own.
4. Choose severity, optionally attach an image, and click **Submit issue**.
5. The new issue appears in the list and as a marker on the map.
6. Use the **Upvote / Verify** button and the **Status** dropdown on each card.

---

## API endpoints

Base URL: `http://localhost:3001`

| Method | Endpoint                     | Body                                  | Description                              |
|--------|------------------------------|---------------------------------------|------------------------------------------|
| GET    | `/api/health`                | —                                     | Health check.                            |
| GET    | `/api/issues`                | —                                     | List all issues (newest first).          |
| POST   | `/api/issues`                | `multipart/form-data` (fields below)  | Create an issue (optional `image` file). |
| PATCH  | `/api/issues/:id/status`     | `{ "status": "Verified" }`            | Update status.                           |
| POST   | `/api/issues/:id/upvote`     | —                                     | Add 1 to the upvote count.               |
| POST   | `/api/ai/categorize`         | `{ "description": "..." }`            | Rule-based category suggestion.          |

**Create issue fields** (`POST /api/issues`, multipart/form-data):
`title`, `description`, `category`, `severity`, `latitude`, `longitude`,
and optional `image` (image file, max 5 MB).

**Valid statuses:** `Reported`, `Verified`, `In Progress`, `Resolved`.

### Example response (`GET /api/issues`)

```json
[
  {
    "id": 1,
    "title": "Broken streetlight",
    "description": "The streetlight pole near the park has no power at night",
    "category": "Electricity",
    "severity": "High",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "image_path": null,
    "status": "Verified",
    "upvotes": 2,
    "ai_suggested_category": "Electricity",
    "created_at": "2026-06-23 16:50:07"
  }
]
```

---

## Database schema

Single table, `issues`:

| Column                  | Type    | Notes                                            |
|-------------------------|---------|--------------------------------------------------|
| `id`                    | INTEGER | Primary key, auto-increment.                     |
| `title`                 | TEXT    | Required.                                         |
| `description`           | TEXT    | Required.                                         |
| `category`              | TEXT    | Required (chosen by the user).                    |
| `severity`              | TEXT    | Required (Low / Medium / High / Critical).        |
| `latitude`              | REAL    | Required.                                         |
| `longitude`             | REAL    | Required.                                         |
| `image_path`            | TEXT    | Optional. Public path like `/uploads/123-foo.jpg`.|
| `status`                | TEXT    | Defaults to `Reported`.                           |
| `upvotes`               | INTEGER | Defaults to `0`.                                  |
| `ai_suggested_category` | TEXT    | What the rule-based AI guessed at creation time.  |
| `created_at`            | TEXT    | Defaults to current timestamp.                    |

The exact `CREATE TABLE` statement lives in `backend/db.js`.

---

## Screenshots

> Screenshots are not included in this repository. To add your own, run the app,
> take screenshots, save them in a `docs/` folder, and reference them here, e.g.:

```
![Home page with map and form](docs/home.png)
![Issue list](docs/issue-list.png)
![AI-assisted suggestion](docs/ai-suggestion.png)
```

Suggested shots to capture: the map + form view, the issue list with several
cards, and the "AI-assisted suggestion" box after clicking the suggest button.

---

## How the "AI-assisted suggestion" works

It is a **keyword matcher** in `backend/aiCategorize.js`:

1. The description is lower-cased.
2. Each category has a list of keywords (e.g. `Water` → "leak", "pipe", "drain").
3. The category whose keywords appear most often wins.
4. If nothing matches, it suggests `Other`.

It is deliberately simple and transparent. It is labelled **"AI-assisted
suggestion"** in the UI and the user always makes the final choice.

---

## Future improvements (honest list)

These are **not** implemented yet — they are ideas for later:

- **Authentication & user accounts** so upvotes/edits are tied to real users and
  can't be spammed.
- **Edit / delete** issues, with permissions.
- **Real ML categorization** (e.g. a small text classifier) to replace the
  keyword rules.
- **Image storage** in cloud object storage instead of local disk.
- **Pagination / search** for large numbers of issues.
- **Duplicate detection** (merge nearby reports of the same problem).
- **Reverse geocoding** to show human-readable addresses.
- **Admin dashboard** and analytics (issues by category/area over time).
- **Deployment** (a production build + hosting) and automated tests.
- **Accessibility & i18n** improvements.

---

## License

MIT — free to use, learn from, and modify.
