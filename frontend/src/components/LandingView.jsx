import { useRef, useState } from "react";
import { Upload, FileText, ArrowRight, Target, Brain, Map } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_JD = `Senior Frontend Engineer — React/TypeScript

We are looking for a Senior Frontend Engineer with 5+ years of experience to lead our web platform team.

Required:
- Expert in React 18+, TypeScript, and modern hooks patterns
- Strong CSS skills (Tailwind, responsive design, accessibility)
- Experience with state management (Redux Toolkit, Zustand, or React Query)
- REST/GraphQL API integration
- Testing with Jest + React Testing Library
- Performance optimization (Core Web Vitals, code splitting)
- CI/CD experience (GitHub Actions or similar)

Nice to have:
- Next.js / SSR experience
- Design system / component library ownership
- Mentoring junior engineers
- Familiarity with backend (Node.js)`;

export default function LandingView({ onSubmit }) {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const ok = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!ok) {
      toast.error("Upload a PDF, DOCX, or TXT file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10 MB)");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const submit = () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a real job description (min 30 chars)");
      return;
    }
    if (!file) {
      toast.error("Upload your resume");
      return;
    }
    onSubmit({ jd, file });
  };

  return (
    <div className="bg-white" data-testid="landing-view">
      {/* TOP BAR */}
      <header className="border-b border-black px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#FF3B30]" />
          <span className="overline">RESUME // VERDICT</span>
        </div>
        <div className="overline text-[#6B7280] hidden sm:block">
          v.01 / FEB.2026
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black px-6 md:px-12 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />
        <div className="relative max-w-7xl mx-auto">
          <div className="overline text-[#002FA7] mb-6">
            ▌ AI–POWERED SKILL MATCHING ENGINE
          </div>
          <h1
            className="font-display font-black tracking-tighter uppercase leading-[0.9] text-5xl sm:text-7xl md:text-8xl"
            data-testid="hero-title"
          >
            The Resume.
            <br />
            The Job.
            <br />
            <span className="text-[#002FA7]">The Verdict.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg text-[#111] leading-relaxed">
            Paste a job description. Drop your resume. We'll score the match,
            expose every skill gap, and hand you a personalised learning plan
            built on adjacent skills you can realistically acquire — with
            curated resources and time estimates.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 border border-black">
            {[
              {
                icon: Target,
                title: "PRECISION SCORING",
                body: "Skill-by-skill verdict with evidence pulled from your resume.",
              },
              {
                icon: Brain,
                title: "GAP DIAGNOSIS",
                body: "Honest read on what you're missing — and what's adjacent.",
              },
              {
                icon: Map,
                title: "LEARNING ROADMAP",
                body: "Prioritised plan with resources and hours to mastery.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`p-6 md:p-8 ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-black" : ""
                }`}
              >
                <Icon className="w-6 h-6 mb-4" strokeWidth={1.5} />
                <div className="overline mb-2">{title}</div>
                <div className="text-sm text-[#111] leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INPUT GRID */}
      <section
        id="analyze"
        className="px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto"
      >
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="overline text-[#6B7280] mb-2">STEP 01</div>
            <h2 className="font-display font-black uppercase tracking-tight text-3xl md:text-4xl">
              Submit For Verdict
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setJd(SAMPLE_JD)}
            className="overline border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            data-testid="load-sample-jd-btn"
          >
            ▌ Load Sample JD
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 border border-black">
          {/* JD INPUT */}
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-black bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="overline">▌ JOB DESCRIPTION</div>
              <div className="overline text-[#6B7280]">
                {jd.length} CHARS
              </div>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-72 md:h-96 bg-white border border-black p-4 font-mono text-sm leading-relaxed focus:outline-none focus:shadow-[inset_0_0_0_2px_#002FA7] resize-none"
              data-testid="jd-input"
            />
          </div>

          {/* RESUME DROPZONE */}
          <div className="p-6 md:p-8 bg-[#F9FAFB]">
            <div className="flex items-center justify-between mb-4">
              <div className="overline">▌ RESUME UPLOAD</div>
              <div className="overline text-[#6B7280]">PDF · DOCX · TXT</div>
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative h-72 md:h-96 border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center p-6 transition-colors ${
                dragOver
                  ? "border-[#002FA7] bg-white"
                  : "border-black bg-white hover:bg-[#F9FAFB]"
              }`}
              data-testid="resume-dropzone"
            >
              <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
                data-testid="resume-file-input"
              />
              {file ? (
                <div className="relative z-10">
                  <FileText className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
                  <div className="font-mono text-sm font-bold mb-1">
                    {file.name}
                  </div>
                  <div className="overline text-[#6B7280]">
                    {(file.size / 1024).toFixed(1)} KB · CLICK TO REPLACE
                  </div>
                </div>
              ) : (
                <div className="relative z-10">
                  <Upload className="w-10 h-10 mx-auto mb-4" strokeWidth={1.5} />
                  <div className="font-display font-bold text-lg mb-2">
                    DROP RESUME HERE
                  </div>
                  <div className="overline text-[#6B7280]">
                    OR CLICK TO BROWSE
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] border border-black">
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black">
            <div className="overline mb-1">READY?</div>
            <div className="font-display font-bold text-xl">
              No accounts. No fluff. One honest verdict.
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!jd || !file}
            className="btn-primary flex items-center justify-center gap-3 px-10 disabled:bg-[#9CA3AF] disabled:hover:bg-[#9CA3AF]"
            data-testid="analyze-btn"
          >
            ANALYZE MATCH
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-black px-6 md:px-12 py-6 flex items-center justify-between flex-wrap gap-3">
        <div className="overline text-[#6B7280]">
          ▌ POWERED BY CLAUDE SONNET 4.5
        </div>
        <div className="overline text-[#6B7280]">
          NO TRACKING · NO ACCOUNTS · 100% LOCAL TO SESSION
        </div>
      </footer>
    </div>
  );
}
