import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root");

if (root) {
  void import("./App")
    .then(({ default: App }) => createRoot(root).render(<App />))
    .catch(() => document.getElementById("app-fallback")?.classList.add("is-retry"));
}
