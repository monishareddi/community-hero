// aiCategorize.js
// ---------------------------------------------------------------------------
// "AI-assisted suggestion" — rule-based categorization.
//
// IMPORTANT / HONEST NOTE:
// This is NOT machine learning. It is a simple keyword-matching function.
// We label it as an "AI-assisted suggestion" in the UI because it helps the
// user pick a category, but it is just rules. We do not pretend it is smart.
//
// How it works:
//   1. Lower-case the description text.
//   2. For each category, check how many of its keywords appear.
//   3. The category with the most keyword hits wins.
//   4. If nothing matches, we suggest "Other".
// ---------------------------------------------------------------------------

// Each category has a list of keywords that hint at it.
const CATEGORY_KEYWORDS = {
  Roads: [
    "pothole", "road", "street", "highway", "footpath", "sidewalk",
    "speed breaker", "traffic", "asphalt", "crack", "manhole",
  ],
  Water: [
    "water", "leak", "leakage", "pipe", "pipeline", "drainage", "drain",
    "sewage", "flood", "flooding", "tap", "supply", "overflow",
  ],
  Electricity: [
    "electric", "electricity", "power", "current", "wire", "wires",
    "transformer", "streetlight", "street light", "light", "pole", "outage",
  ],
  Sanitation: [
    "garbage", "trash", "waste", "dustbin", "litter", "dump", "dumping",
    "dirty", "smell", "sanitation", "cleaning", "toilet",
  ],
  "Public Safety": [
    "accident", "danger", "dangerous", "crime", "theft", "unsafe",
    "fire", "broken", "fallen", "tree fallen", "hazard", "open wire",
  ],
  "Parks/Environment": [
    "park", "tree", "trees", "garden", "pollution", "air", "noise",
    "playground", "green", "plant", "lake", "pond",
  ],
};

/**
 * Suggest a category from a free-text description.
 * @param {string} description - the issue description typed by the user
 * @returns {string} one of the category names, or "Other"
 */
function suggestCategory(description) {
  // Guard: if there is no usable text, we cannot guess anything.
  if (!description || typeof description !== "string") {
    return "Other";
  }

  const text = description.toLowerCase();

  let bestCategory = "Other";
  let bestScore = 0;

  // Go through every category and count keyword matches.
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    // Keep the category with the highest score.
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

module.exports = { suggestCategory, CATEGORY_KEYWORDS };
