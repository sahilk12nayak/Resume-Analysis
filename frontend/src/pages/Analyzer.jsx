import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import LandingView from "@/components/LandingView";
import LoadingView from "@/components/LoadingView";
import DashboardView from "@/components/DashboardView";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analyzer() {
  const [phase, setPhase] = useState("landing"); // landing | loading | dashboard
  const [result, setResult] = useState(null);

  const runAnalysis = async ({ jd, file }) => {
    setPhase("loading");
    try {
      const form = new FormData();
      form.append("job_description", jd);
      form.append("resume", file);
      const res = await axios.post(`${API}/analyze`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      setResult(res.data);
      setPhase("dashboard");
    } catch (e) {
      const detail =
        e?.response?.data?.detail || e?.message || "Analysis failed";
      toast.error(typeof detail === "string" ? detail : "Analysis failed");
      setPhase("landing");
    }
  };

  const reset = () => {
    setResult(null);
    setPhase("landing");
  };

  return (
    <div className="min-h-screen bg-white text-[#111]" data-testid="analyzer-root">
      {phase === "landing" && <LandingView onSubmit={runAnalysis} />}
      {phase === "loading" && <LoadingView />}
      {phase === "dashboard" && result && (
        <DashboardView result={result} onReset={reset} />
      )}
    </div>
  );
}
