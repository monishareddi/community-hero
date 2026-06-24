// main.jsx
// ---------------------------------------------------------------------------
// This is the very first JavaScript file React runs.
// It finds the <div id="root"> in index.html and renders <App /> inside it.
// ---------------------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
