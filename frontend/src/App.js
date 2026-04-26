import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analyzer from "@/pages/Analyzer";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Analyzer />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #111",
            borderRadius: 0,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.8rem",
          },
        }}
      />
    </div>
  );
}

export default App;
