import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrgProvider } from "@/context/OrgContext";
import { ToastProvider } from "@/context/ToastContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <OrgProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </OrgProvider>
  );
}

export default App;
