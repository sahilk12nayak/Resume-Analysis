import { useMemo } from "react";
import {
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Clock,
  ExternalLink,
  Printer,
  BookOpen,
  Video,
  FileCode,
  Hammer,
  GraduationCap,
} from "lucide-react";

const STATUS_STYLE = {
  match: {
    label: "MATCH",
    cls: "border-[#002FA7] text-[#002FA7]",
    icon: Check,
  },
  partial: {
    label: "PARTIAL",
    cls: "border-black text-black",
    icon: AlertTriangle,
  },
  missing: {
    label: "MISSING",
    cls: "border-[#FF3B30] text-[#FF3B30] stripes-red",
    icon: X,
  },
};

const RES_ICON = {
  course: GraduationCap,
  documentation: FileCode,
  video: Video,
  article: BookOpen,
  project: Hammer,
};

function StatusBadge({ status }) {
  const meta = STATUS_STYLE[status] || STATUS_STYLE.partial;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 overline ${meta.cls}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}

function ImportanceBadge({ importance }) {
  const map = {
    critical: "bg-[#FF3B30] text-white",
    important: "bg-black text-white",
    "nice-to-have": "bg-[#F9FAFB] text-[#6B7280] border border-[#6B7280]",
  };
  return (
    <span className={`overline px-2 py-1 ${map[importance] || map.important}`}>
      {(importance || "important").toUpperCase()}
    </span>
  );
}

export default function DashboardView({ result, onReset }) {
  const {
    overall_score,
    verdict,
    candidate,
    job_title,
    skills = [],
    strengths = [],
    gaps = [],
    learning_plan = [],
    total_learning_hours,
  } = result;

  const stats = useMemo(() => {
    const m = skills.filter((s) => s.status === "match").length;
    const p = skills.filter((s) => s.status === "partial").length;
    const x = skills.filter((s) => s.status === "missing").length;
    return { m, p, x, total: skills.length };
  }, [skills]);

  const scoreColor =
    overall_score >= 75
      ? "#002FA7"
      : overall_score >= 50
      ? "#111111"
      : "#FF3B30";

  return (
    <div className="bg-white" data-testid="dashboard-view">
      {/* TOP BAR */}
      <header className="border-b border-black px-6 md:px-12 py-5 flex items-center justify-between print:hidden">
        <button
          onClick={onReset}
          className="overline flex items-center gap-2 hover:text-[#002FA7]"
          data-testid="reset-btn"
        >
          <ArrowLeft className="w-4 h-4" /> NEW ANALYSIS
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.print()}
            className="overline flex items-center gap-2 border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
            data-testid="print-btn"
          >
            <Printer className="w-4 h-4" /> EXPORT PDF
          </button>
        </div>
      </header>

      {/* HEADER ROW */}
      <section className="grid grid-cols-1 md:grid-cols-12 border-b border-black">
        {/* SCORE */}
        <div
          className="md:col-span-4 p-8 md:p-10 border-b md:border-b-0 md:border-r border-black flex flex-col justify-between"
          style={{ backgroundColor: "#F9FAFB" }}
          data-testid="score-card"
        >
          <div className="overline text-[#6B7280]">▌ OVERALL MATCH</div>
          <div className="my-6">
            <div
              className="font-display font-black tracking-tighter leading-none"
              style={{ color: scoreColor, fontSize: "clamp(6rem, 14vw, 11rem)" }}
              data-testid="overall-score"
            >
              {overall_score}
            </div>
            <div className="overline mt-2">/ 100 — {verdict}</div>
          </div>
          <div className="grid grid-cols-3 border border-black mt-4 font-mono text-xs">
            <div className="p-3 border-r border-black">
              <div className="text-[#002FA7] font-bold text-lg">{stats.m}</div>
              <div className="overline text-[#6B7280]">MATCH</div>
            </div>
            <div className="p-3 border-r border-black">
              <div className="text-black font-bold text-lg">{stats.p}</div>
              <div className="overline text-[#6B7280]">PARTIAL</div>
            </div>
            <div className="p-3">
              <div className="text-[#FF3B30] font-bold text-lg">{stats.x}</div>
              <div className="overline text-[#6B7280]">MISSING</div>
            </div>
          </div>
        </div>

        {/* CANDIDATE */}
        <div className="md:col-span-8 p-8 md:p-10">
          <div className="overline text-[#6B7280] mb-2">▌ CANDIDATE PROFILE</div>
          <h1
            className="font-display font-black uppercase tracking-tighter text-4xl md:text-6xl leading-[0.9]"
            data-testid="candidate-name"
          >
            {candidate?.name || "Candidate"}
          </h1>
          <div className="font-mono text-sm mt-3">
            {candidate?.title || "—"} · {candidate?.years_experience || "—"}
          </div>
          <p className="mt-5 max-w-2xl text-[#111] text-base leading-relaxed">
            {candidate?.summary}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 border border-black">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-black">
              <div className="overline text-[#6B7280] mb-1">EVALUATED FOR</div>
              <div className="font-display font-bold text-lg" data-testid="job-title">
                {job_title}
              </div>
            </div>
            <div className="p-5">
              <div className="overline text-[#6B7280] mb-1">LEARNING DEBT</div>
              <div className="font-display font-bold text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {total_learning_hours || 0} HOURS TO CLOSE GAPS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL MATRIX */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-black">
          <div className="px-8 md:px-10 py-6 border-b border-black flex items-center justify-between">
            <div>
              <div className="overline text-[#6B7280] mb-1">▌ SECTION 02</div>
              <h2 className="font-display font-black uppercase tracking-tight text-2xl md:text-3xl">
                Skill Match Breakdown
              </h2>
            </div>
            <div className="overline text-[#6B7280] hidden sm:block">
              {stats.total} CHECKS
            </div>
          </div>
          <ul className="divide-y divide-black" data-testid="skills-list">
            {skills.map((s, i) => (
              <li key={`${s.skill}-${i}`} className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-bold text-lg">
                        {s.skill}
                      </h3>
                      <StatusBadge status={s.status} />
                      <ImportanceBadge importance={s.importance} />
                    </div>
                    <div className="font-mono text-xs text-[#6B7280] mt-2 uppercase tracking-wider">
                      Proficiency · {s.proficiency || "n/a"}
                    </div>
                    <p className="text-sm mt-2 text-[#111] leading-relaxed">
                      {s.evidence}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* STRENGTHS / GAPS */}
        <div className="lg:col-span-5">
          <div className="border-b border-black p-6 md:p-8">
            <div className="overline text-[#6B7280] mb-2">▌ STRENGTHS</div>
            <ul className="space-y-3 mt-3" data-testid="strengths-list">
              {strengths.map((str, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <Check
                    className="w-4 h-4 mt-0.5 text-[#002FA7] shrink-0"
                    strokeWidth={3}
                  />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 md:p-8">
            <div className="overline text-[#FF3B30] mb-2">▌ GAPS</div>
            <ul className="space-y-3 mt-3" data-testid="gaps-list">
              {gaps.map((g, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <X
                    className="w-4 h-4 mt-0.5 text-[#FF3B30] shrink-0"
                    strokeWidth={3}
                  />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LEARNING PLAN */}
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="overline text-[#6B7280] mb-1">▌ SECTION 03</div>
            <h2 className="font-display font-black uppercase tracking-tight text-3xl md:text-5xl">
              Learning Plan
            </h2>
            <p className="text-[#6B7280] mt-2 max-w-xl text-sm">
              Adjacent skills you can realistically acquire from your current
              foundation. Resources hand-picked. Hours estimated.
            </p>
          </div>
          <div className="border border-black px-4 py-3">
            <div className="overline text-[#6B7280]">TOTAL TIME</div>
            <div className="font-display font-black text-2xl">
              {total_learning_hours || 0}H
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 border border-black"
          data-testid="learning-plan"
        >
          {learning_plan.map((item, i) => {
            const isLastRow =
              i >= learning_plan.length - (learning_plan.length % 2 || 2);
            const isRight = i % 2 === 1;
            return (
              <div
                key={`${item.skill}-${i}`}
                className={`p-6 md:p-8 ${
                  !isLastRow ? "border-b border-black" : ""
                } ${!isRight ? "md:border-r md:border-black" : ""}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <span
                    className={`overline px-2 py-1 ${
                      item.priority === "high"
                        ? "bg-[#FF3B30] text-white"
                        : item.priority === "medium"
                        ? "bg-black text-white"
                        : "border border-[#6B7280] text-[#6B7280]"
                    }`}
                  >
                    {item.priority?.toUpperCase()} PRIORITY
                  </span>
                  <span className="font-mono text-xs flex items-center gap-1.5 text-[#111]">
                    <Clock className="w-3.5 h-3.5" />
                    {item.estimated_hours}H
                  </span>
                </div>
                <h3 className="font-display font-black uppercase tracking-tight text-2xl mb-2">
                  {item.skill}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
                  <span className="text-[#002FA7] font-bold">WHY ADJACENT: </span>
                  {item.why_adjacent}
                </p>
                <div className="overline text-[#6B7280] mb-3">RESOURCES</div>
                <ul className="space-y-2">
                  {(item.resources || []).map((r, j) => {
                    const Icon = RES_ICON[r.type] || BookOpen;
                    const Wrapper = r.url ? "a" : "div";
                    const props = r.url
                      ? {
                          href: r.url,
                          target: "_blank",
                          rel: "noreferrer",
                        }
                      : {};
                    return (
                      <li key={j}>
                        <Wrapper
                          {...props}
                          className={`flex items-center gap-3 border border-black p-3 group ${
                            r.url ? "hover:bg-black hover:text-white transition-colors" : ""
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">
                              {r.title}
                            </div>
                            <div className="overline text-[#6B7280] group-hover:text-white">
                              {r.provider} · {r.type?.toUpperCase()}
                            </div>
                          </div>
                          {r.url && (
                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                          )}
                        </Wrapper>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-black px-6 md:px-12 py-6 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="overline text-[#6B7280]">
          ▌ ANALYSIS ID · {result.id?.slice(0, 8)}
        </div>
        <button
          onClick={onReset}
          className="btn-secondary"
          data-testid="footer-reset-btn"
        >
          Run Another Analysis
        </button>
      </footer>
    </div>
  );
}
