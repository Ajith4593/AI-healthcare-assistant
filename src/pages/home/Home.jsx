import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeHealthcareOrbit from "@/components/layout/HomeHealthcareOrbit";
import ConnectivityStatus from "@/components/healthcare/ConnectivityStatus";
import QuickHelp from "@/components/healthcare/QuickHelp";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mic,
  ScanLine,
  FileText,
  Pill,
  Calendar,
  Activity,
  PhoneCall,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Clock
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const userName = user?.name || user?.full_name || user?.email?.split("@")[0] || "Guest";

  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await fetch("/api/v1/ocr", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (Array.isArray(data) ? data : []).slice(0, 3).map((r) => ({
            id: r.id,
            title: r.primary_medication || r.filename || "Medical Record",
            language: "English",
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—",
            status: r.status || "Completed",
          }));
          setRecent(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch recent prescriptions:", err);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[600px] h-[600px] -top-40 -left-40 opacity-50" />
      <div className="glass-orb-blue w-[500px] h-[500px] top-80 right-0 opacity-40" />

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-12 relative z-10 space-y-8">
        
        {/* ── Patient Welcome Header & Connectivity ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-extrabold mb-1">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              {t("RuralCare AI • Health Assistant for Rural India")}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              {t("Namaste")}, {userName} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {t("How can RuralCare AI help you today?")}
            </p>
          </div>

          <div className="self-center sm:self-start">
            <ConnectivityStatus />
          </div>
        </div>

        {/* ── Top Main Layout Grid: Hero Actions (Left) & Signature Orbit (Center) & Snapshot (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* ── LEFT COLUMN: Dominant Primary Hero Action Cards ── */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Action Card 1: 🎙 Talk to RuralCare AI */}
            <div
              onClick={() => navigate("/assistant")}
              className="glass-card-hover p-6 rounded-3xl cursor-pointer group border border-teal-500/30 bg-[#06201B]/80 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Mic size={90} className="text-teal-300" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40">
                  <Mic size={20} />
                </div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  {t("Talk to RuralCare AI")}
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-5">
                {t("Speak naturally in your preferred language (Telugu, Hindi, Tamil, Marathi & more)")}
              </p>
              <button
                className="w-full btn-vibrant-primary py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
              >
                <Mic size={16} /> {t("Tap to Speak")}
              </button>
            </div>

            {/* Action Card 2: 📄 Scan Prescription */}
            <div
              onClick={() => navigate("/upload")}
              className="glass-card-hover p-6 rounded-3xl cursor-pointer group border border-amber-500/30 bg-[#06201B]/80 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ScanLine size={90} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
                  <ScanLine size={20} />
                </div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  {t("Scan Prescription")}
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-5">
                {t("Upload or photograph your medical documents to receive 5th-grade plain advice")}
              </p>
              <button
                className="w-full btn-amber-primary py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform"
              >
                <ScanLine size={16} /> {t("Scan Now")}
              </button>
            </div>

          </div>

          {/* ── CENTER COLUMN: Signature Interactive Healthcare Orbit ── */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <HomeHealthcareOrbit />
          </div>

          {/* ── RIGHT COLUMN: Your Health Snapshot ── */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#06201B]/80 space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                  <HeartPulse size={18} className="text-emerald-400" />
                  {t("Your Health Snapshot")}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-teal-400" />
                    <span className="font-bold text-slate-200">{t("Prescriptions")}</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">{recent.length || 24}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Pill size={15} className="text-amber-400" />
                    <span className="font-bold text-slate-200">{t("Medicines")}</span>
                  </div>
                  <span className="font-extrabold text-amber-400 text-sm">8 {t("Active")}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-teal-300" />
                    <span className="font-bold text-slate-200">{t("Appointments")}</span>
                  </div>
                  <span className="font-extrabold text-teal-300 text-sm">3 {t("Upcoming")}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-emerald-400" />
                    <span className="font-bold text-slate-200">{t("Reports")}</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">12</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/history")}
                className="w-full py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {t("View All Records")} <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* ── Quick Help Section ── */}
        <QuickHelp />

        {/* ── Emergency Help Banner ── */}
        <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-[#06201B]/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <ShieldAlert size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-white">
                {t("Need urgent medical help?")}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {t("Quick access to government emergency response and health advisories")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href="tel:108"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-900/40 transition-all"
            >
              <PhoneCall size={16} />
              <span>{t("108 Emergency")}</span>
            </a>

            <a
              href="tel:104"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-900/40 transition-all"
            >
              <PhoneCall size={16} />
              <span>{t("104 Health Helpline")}</span>
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}

