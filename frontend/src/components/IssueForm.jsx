// IssueForm.jsx
// ---------------------------------------------------------------------------
// The form for submitting a new civic issue.
// Includes the "AI-assisted suggestion" button which asks the backend's
// rule-based categorizer to guess a category from the description.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { createIssue, suggestCategory } from "../api";

// The fixed lists of choices, kept in sync with the backend.
const CATEGORIES = [
  "Roads",
  "Water",
  "Electricity",
  "Sanitation",
  "Public Safety",
  "Parks/Environment",
  "Other",
];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

export default function IssueForm({ picked, onPick, onCreated }) {
  // Form field state.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [severity, setSeverity] = useState("Medium");
  const [image, setImage] = useState(null);

  // UI helper state.
  const [aiSuggestion, setAiSuggestion] = useState(null); // string or null
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(""); // success / error text

  // Ask the backend's rule-based AI for a suggested category.
  async function handleSuggest() {
    setMessage("");
    if (!description.trim()) {
      setMessage("Type a description first, then ask for a suggestion.");
      return;
    }
    try {
      const suggestion = await suggestCategory(description);
      setAiSuggestion(suggestion);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // Submit the form to create the issue.
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    // The location must be picked on the map (or entered) before submitting.
    if (!picked) {
      setMessage("Click on the map to pick the issue location first.");
      return;
    }

    // Build FormData so we can include the optional image file.
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("severity", severity);
    formData.append("latitude", picked.lat);
    formData.append("longitude", picked.lng);
    if (image) formData.append("image", image);

    try {
      setSubmitting(true);
      await createIssue(formData);
      setMessage("Issue submitted successfully!");

      // Reset the form for the next entry.
      setTitle("");
      setDescription("");
      setCategory("Roads");
      setSeverity("Medium");
      setImage(null);
      setAiSuggestion(null);
      onPick(null); // clear the picked location marker
      onCreated();  // tell the parent to refresh the issue list + map
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <h2>Report an issue</h2>

      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Large pothole on Main Street"
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the problem in a sentence or two"
          rows={3}
          required
        />
      </label>

      {/* AI-assisted suggestion area --------------------------------------- */}
      <button type="button" className="btn-secondary" onClick={handleSuggest}>
        Suggest category (AI-assisted)
      </button>
      {aiSuggestion && (
        <div className="ai-suggestion">
          <span className="ai-badge">AI-assisted suggestion</span>
          <span>
            This looks like: <strong>{aiSuggestion}</strong>
          </span>
          <button
            type="button"
            className="btn-link"
            onClick={() => setCategory(aiSuggestion)}
          >
            Apply
          </button>
          <p className="ai-note">
            Note: this is a simple keyword-based guess, not real machine
            learning. Please review before submitting.
          </p>
        </div>
      )}

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Severity
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        Image (optional)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0] || null)}
        />
      </label>

      {/* Show the picked location so the user knows it's set. */}
      <div className="location-box">
        {picked ? (
          <span>
            Location picked: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
          </span>
        ) : (
          <span className="muted">Click on the map to pick a location →</span>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit issue"}
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}
