// App.jsx
// ---------------------------------------------------------------------------
// The top-level component. It:
//   - loads all issues from the backend when the page opens
//   - keeps the "picked location" (from clicking the map) in state
//   - wires the form, map, and list together
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { getIssues } from "./api";
import IssueForm from "./components/IssueForm";
import IssueMap from "./components/IssueMap";
import IssueList from "./components/IssueList";

export default function App() {
  const [issues, setIssues] = useState([]);
  const [picked, setPicked] = useState(null); // { lat, lng } or null
  const [error, setError] = useState("");

  // Load issues from the backend.
  async function loadIssues() {
    try {
      const data = await getIssues();
      setIssues(data);
      setError("");
    } catch (err) {
      setError(
        "Could not reach the backend. Is it running on http://localhost:3001 ?"
      );
    }
  }

  // Run loadIssues once when the app first appears.
  useEffect(() => {
    loadIssues();
  }, []);

  // Called when the map is clicked: store the picked location.
  // Passing null clears it (used after a successful submit).
  function handlePick(lat, lng) {
    if (lat === null) {
      setPicked(null);
    } else {
      setPicked({ lat, lng });
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🦸 Community Hero</h1>
        <p>Report local civic issues and track them together.</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="layout">
        {/* Left column: the submission form. */}
        <div className="left-col">
          <IssueForm
            picked={picked}
            onPick={handlePick}
            onCreated={loadIssues}
          />
        </div>

        {/* Right column: the map. */}
        <div className="right-col">
          <div className="map-wrapper">
            <IssueMap issues={issues} picked={picked} onPick={handlePick} />
          </div>
          <p className="map-hint">Tip: click anywhere on the map to set the issue location.</p>
        </div>
      </main>

      {/* Full-width list below. */}
      <IssueList issues={issues} onChanged={loadIssues} />

      <footer className="app-footer">
         Community Hero · Report. Track. Resolve.
      </footer>
    </div>
  );
}
