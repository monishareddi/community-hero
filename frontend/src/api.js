// api.js
// ---------------------------------------------------------------------------
// All the functions that talk to our backend live here, in one place.
// Because of the Vite proxy (see vite.config.js), we can use relative URLs
// like "/api/issues" and they get forwarded to http://localhost:3001.
// ---------------------------------------------------------------------------

// Get every issue (newest first).
export async function getIssues() {
  const res = await fetch("/api/issues");
  if (!res.ok) throw new Error("Failed to load issues");
  return res.json();
}

// Create a new issue.
// We use FormData (not JSON) because an image file might be attached.
export async function createIssue(formData) {
  const res = await fetch("/api/issues", {
    method: "POST",
    body: formData, // browser sets the correct multipart headers automatically
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create issue");
  }
  return res.json();
}

// Update an issue's status (Reported / Verified / In Progress / Resolved).
export async function updateStatus(id, status) {
  const res = await fetch(`/api/issues/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

// Add one upvote / verification to an issue.
export async function upvoteIssue(id) {
  const res = await fetch(`/api/issues/${id}/upvote`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to upvote");
  return res.json();
}

// Ask the rule-based "AI" to suggest a category from the description text.
export async function suggestCategory(description) {
  const res = await fetch("/api/ai/categorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error("Failed to get suggestion");
  const data = await res.json();
  return data.suggestedCategory;
}
