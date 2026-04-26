import { useEffect, useState } from "react";

const STEPS = [
  "▌ INITIALISING ANALYSIS ENGINE...",
  "▌ PARSING RESUME DOCUMENT...",
  "▌ EXTRACTING SKILL GRAPH FROM JD...",
  "▌ CROSS-REFERENCING EVIDENCE...",
  "▌ COMPUTING PROFICIENCY VECTORS...",
  "▌ IDENTIFYING ADJACENT SKILLS...",
  "▌ GENERATING LEARNING ROADMAP...",
  "▌ COMPILING FINAL VERDICT...",
];

export default function LoadingView() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => (v < STEPS.length ? v + 1 : v));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen bg-white px-6 md:px-12 py-12 flex flex-col"
      data-testid="loading-view"
    >
      <div className="border-b border-black pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#FF3B30] flicker" />
          <span className="overline">PROCESSING</span>
        </div>
        <div className="overline text-[#6B7280]">SESSION // ACTIVE</div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0 border-l border-r border-b border-black">
        {/* TERMINAL */}
        <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-black bg-white min-h-[60vh]">
          <div className="overline text-[#6B7280] mb-6">▌ TERMINAL_OUT</div>
          <div className="font-mono text-sm md:text-base space-y-3">
            {STEPS.slice(0, visible).map((s, i) => (
              <div key={i} className="flex items-start gap-3 slide-up">
                <span className="text-[#002FA7]">{`[${String(i + 1).padStart(
                  2,
                  "0"
                )}]`}</span>
                <span className="flex-1">{s}</span>
                <span className="text-[#002FA7] font-bold">OK</span>
              </div>
            ))}
            {visible < STEPS.length && (
              <div className="flex items-start gap-3">
                <span className="text-[#002FA7]">{`[${String(
                  visible + 1
                ).padStart(2, "0")}]`}</span>
                <span className="flex-1 flicker">
                  {STEPS[visible].replace("▌", "▶")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="overline mb-3">▌ PROGRESS</div>
            <div className="w-full h-6 border border-black relative overflow-hidden">
              <div className="h-full bg-[#002FA7] bar-load" />
            </div>
          </div>
        </div>

        {/* SIDE */}
        <div className="p-8 md:p-12 bg-[#F9FAFB] flex flex-col justify-between">
          <div>
            <div className="overline text-[#6B7280] mb-4">▌ STATUS</div>
            <div className="font-display font-black uppercase text-3xl md:text-5xl tracking-tighter leading-none">
              Holding
              <br />
              Court.
            </div>
            <p className="mt-6 text-sm text-[#6B7280] leading-relaxed">
              Claude Sonnet 4.5 is reading every line of your resume, mapping it
              against each requirement, and shaping a learning plan you can
              actually finish.
            </p>
          </div>
          <div className="mt-10 border-t border-black pt-6">
            <div className="overline text-[#6B7280] mb-2">EST. RUNTIME</div>
            <div className="font-mono text-2xl font-bold">15–30 SEC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
