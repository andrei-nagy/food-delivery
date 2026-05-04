// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ← Import App, nu Home
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App /> {/* ← Render-ezi App, care are router-ul */}
  </React.StrictMode>
);