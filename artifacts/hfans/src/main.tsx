import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🔥 IMPORTANTE
import { setBaseUrl } from "@workspace/api-client-react";

// 👉 TU BACKEND REAL (CAMBIA SI ES NECESARIO)
setBaseUrl("https://hfan1.onrender.com");

createRoot(document.getElementById("root")!).render(<App />);
