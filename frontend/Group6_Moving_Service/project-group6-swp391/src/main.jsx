import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { App as AntApp } from "antd";
import "antd/dist/reset.css";
import { AuthProvider } from "./context/AuthContext";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <AntApp
        notification={{
          placement: "topRight",
          duration: 4,
          maxCount: 1,
        }}
      >
    <AuthProvider>
    
        <App />
      
    </AuthProvider>
    </AntApp>
  </StrictMode>
);
