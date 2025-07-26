import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css"
import App from "./App.jsx";
import { NetworkStatusProvider } from "./context/NetworkStatusContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NetworkStatusProvider>
      <App />
    </NetworkStatusProvider>
  </StrictMode>
);
