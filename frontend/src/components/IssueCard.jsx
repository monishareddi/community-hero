// IssueCard.jsx
// ---------------------------------------------------------------------------
// Displays one issue. Lets the user:
//   - change its status (dropdown)
//   - add an upvote / verification (button)
// ---------------------------------------------------------------------------

import { updateStatus, upvoteIssue } from "../api";

const STATUSES = ["Reported", "Verified", "In Progress", "Resolved"];

// Pick a colour for each status (purely visual).
const STATUS_COLORS = {
  Reported: "#6b7280",
  Verified: "#2563eb",
  "In Progress": "#d97706",
  Resolved: "#16a34a",
};

export default function IssueCard({ issue, onChanged }) {
  // Change the status, then ask the parent to refresh data.
  async function handleStatusChange(e) {
    await updateStatus(issue.id, e.target.value);
    onChanged();
  }

  // Add an upvote, then refresh.
  async function handleUpvote() {
    await upvoteIssue(issue.id);
    onChanged();
  }

  return (
    <div className="issue-card">
      <div className="issue-card-header">
        <h3>{issue.title}</h3>
        <span
          className="status-pill"
          style={{ backgroundColor: STATUS_COLORS[issue.status] || "#6b7280" }}
        >
          {issue.status}
        </span>
      </div>

      <p className="issue-desc">{issue.description}</p>

      {/* Show the uploaded image if there is one. */}
      {issue.image_path && (
        <img className="issue-image" src={issue.image_path} alt={issue.title} />
      )}

      <div className="issue-meta">
        <span>📂 {issue.category}</span>
        <span>⚠️ {issue.severity}</span>
        <span>
          📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
        </span>
      </div>

      {/* If the rule-based AI guessed a different category, show it for info. */}
      {issue.ai_suggested_category &&
        issue.ai_suggested_category !== issue.category && (
          <p className="ai-hint">
            <span className="ai-badge small">AI-assisted suggestion</span>
            originally guessed: {issue.ai_suggested_category}
          </p>
        )}

      <div className="issue-actions">
        <button className="btn-upvote" onClick={handleUpvote}>
          👍 Upvote / Verify ({issue.upvotes})
        </button>

        <label className="status-select-label">
          Status:
          <select value={issue.status} onChange={handleStatusChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
