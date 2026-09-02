import { Mic, HeartPulse, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardHeader() {
  const { user }      = useAuth();
  const { t, language } = useLanguage();
  const navigate      = useNavigate();
  const [search, setSearch] = useState("");

  const userName = user?.name || user?.full_name || user?.username
    || (user?.email ? user.email.split("@")[0] : "");
  const greeting = getGreeting();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/history?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="relative z-10 px-4 pt-6 pb-2 max-w-2xl mx-auto space-y-5">

      {/* ── Greeting row ── */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      >
        {/* Inner teal glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(13,148,136,0.30) 0%, transparent 70%)" }} />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            {/* Status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                 style={{ background: "rgba(13,148,136,0.18)", border: "1px solid rgba(45,212,191,0.28)", color: "#5eead4" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t(greeting)} • RuralCare Assistant
            </div>

            {/* Name headline */}
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {userName ? `${t("Namaste")}, ${userName}` : t("Welcome to RuralCare")}
            </h1>

            <p className="text-xs text-white/55 font-medium max-w-xs">
              {t("Simplify prescriptions, speak in native dialect, and manage your health care plan.")}
            </p>
          </div>

          {/* Right action cluster */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => navigate("/assistant")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#0f172a",
                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
              }}
            >
              <Mic size={14} className="animate-pulse" />
              {t("Voice AI")}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold"
                 style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
              <HeartPulse size={13} className="text-amber-400" />
              {language.label} Active
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="relative mt-4">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.35)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search prescriptions, medicines, or ask AI…")}
            className="w-full rounded-2xl pl-9 pr-24 py-2.5 text-xs font-semibold outline-none transition-all placeholder:font-normal"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2f8f5",
              caretColor: "#5eead4",
            }}
            onFocus={(e) => {
              e.target.style.background = "rgba(255,255,255,0.11)";
              e.target.style.borderColor = "rgba(45,212,191,0.45)";
              e.target.style.boxShadow   = "0 0 0 3px rgba(45,212,191,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.background  = "rgba(255,255,255,0.07)";
              e.target.style.borderColor = "rgba(255,255,255,0.12)";
              e.target.style.boxShadow   = "none";
            }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#0d9488,#059669)",
              color: "#fff",
              boxShadow: "0 2px 10px rgba(13,148,136,0.35)",
            }}
          >
            <Sparkles size={11} /> Search
          </button>
        </form>
      </div>
    </div>
  );
}
