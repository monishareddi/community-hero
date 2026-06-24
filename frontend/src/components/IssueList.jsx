// IssueList.jsx
// ---------------------------------------------------------------------------
// Shows all issues as a list of cards, with a simple status filter on top.
// ---------------------------------------------------------------------------

import { useState } from "react";
import IssueCard from "./IssueCard";

const FILTERS = ["All", "Reported", "Verified", "In Progress", "Resolved"];

export default function IssueList({ issues, onChanged }) {
  const [filter, setFilter] = useState("All");

  // Apply the chosen status filter (or show everything for "All").
  const visibleIssues =
    filter === "All" ? issues : issues.filter((i) => i.status === filter);

  return (
    <section className="issue-list">
      <div className="list-header">
        <h2>All issues ({issues.length})</h2>
        <label className="filter-label">
          Filter:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleIssues.length === 0 ? (
        <p className="muted">No issues to show. Be the first to report one!</p>
      ) : (
        <div className="issue-grid">
          {visibleIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
