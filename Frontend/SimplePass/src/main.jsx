import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="535820265699-ei5pbc6f2u53ccgm157g1mtdg6sh3nrv.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
