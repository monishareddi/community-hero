// server.js
// ---------------------------------------------------------------------------
// The main backend file. It starts an Express web server that exposes a small
// REST API. The React frontend talks to this API.
//
// Run it with:   npm start    (or  npm run dev  to auto-restart on changes)
// It listens on: http://localhost:3001
// ---------------------------------------------------------------------------

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("./db");                       // our SQLite database
const { suggestCategory } = require("./aiCategorize");

const app = express();
const PORT = 3001;

// The list of statuses an issue can have. We validate against this list so
// nobody can set a random/invalid status.
const VALID_STATUSES = ["Reported", "Verified", "In Progress", "Resolved"];

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors());            // allow the React app (different port) to call us
app.use(express.json());    // parse JSON request bodies into req.body

// Make sure the "uploads" folder exists (for optional issue images).
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded images so the browser can load them via
// http://localhost:3001/uploads/<filename>
app.use("/uploads", express.static(uploadsDir));

// ---------------------------------------------------------------------------
// File uploads (multer)
// Saves uploaded images into the uploads/ folder with a unique filename.
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Example result: 1716900000000-photo.jpg
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// Only accept image files, and cap size at 5 MB.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

// Health check — handy to confirm the server is alive.
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Community Hero backend is running." });
});

// -- AI-assisted category suggestion ---------------------------------------
// POST /api/ai/categorize   body: { description: "..." }
// Returns: { suggestedCategory: "Roads" }
// (Rule-based keyword matching — see aiCategorize.js)
app.post("/api/ai/categorize", (req, res) => {
  const { description } = req.body;
  const suggestedCategory = suggestCategory(description);
  res.json({ suggestedCategory });
});

// -- Get all issues ---------------------------------------------------------
// GET /api/issues
// Returns newest issues first.
app.get("/api/issues", (req, res) => {
  const issues = db
    .prepare("SELECT * FROM issues ORDER BY created_at DESC, id DESC")
    .all();
  res.json(issues);
});

// -- Create a new issue -----------------------------------------------------
// POST /api/issues   (multipart/form-data because of the optional image)
// Fields: title, description, category, severity, latitude, longitude
// Optional file field: image
app.post("/api/issues", upload.single("image"), (req, res) => {
  const { title, description, category, severity, latitude, longitude } =
    req.body;

  // Basic validation: required text fields must be present.
  if (!title || !description || !category || !severity) {
    return res
      .status(400)
      .json({ error: "title, description, category and severity are required." });
  }

  // Latitude/longitude must be valid numbers.
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res
      .status(400)
      .json({ error: "latitude and longitude must be valid numbers." });
  }

  // If an image was uploaded, store its public path (else NULL).
  const imagePath = req.file ? "/uploads/" + req.file.filename : null;

  // We also store what the rule-based AI would have suggested, for transparency.
  const aiSuggested = suggestCategory(description);

  // Insert the new row. The "?" placeholders prevent SQL injection.
  const result = db
    .prepare(
      `INSERT INTO issues
         (title, description, category, severity, latitude, longitude,
          image_path, ai_suggested_category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title, description, category, severity, lat, lng, imagePath, aiSuggested);

  // Fetch and return the row we just created.
  const newIssue = db
    .prepare("SELECT * FROM issues WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(newIssue);
});

// -- Update an issue's status ----------------------------------------------
// PATCH /api/issues/:id/status   body: { status: "Verified" }
app.patch("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Use one of: " + VALID_STATUSES.join(", "),
    });
  }

  const result = db
    .prepare("UPDATE issues SET status = ? WHERE id = ?")
    .run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Issue not found." });
  }

  const updated = db.prepare("SELECT * FROM issues WHERE id = ?").get(id);
  res.json(updated);
});

// -- Upvote / verify an issue ----------------------------------------------
// POST /api/issues/:id/upvote
// Adds 1 to the upvote count. (No login in the MVP, so anyone can upvote.)
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;

  const result = db
    .prepare("UPDATE issues SET upvotes = upvotes + 1 WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Issue not found." });
  }

  const updated = db.prepare("SELECT * FROM issues WHERE id = ?").get(id);
  res.json(updated);
});

// ---------------------------------------------------------------------------
// Error handler for multer (e.g. file too big / wrong type).
// This must come AFTER the routes.
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

// ---------------------------------------------------------------------------
// Start the server.
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Community Hero backend running at http://localhost:${PORT}`);
});
