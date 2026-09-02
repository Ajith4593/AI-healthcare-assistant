import { Camera, FileUp, Sparkles, ScanLine, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const GLASS = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
};

export default function QuickUpload() {
  const navigate = useNavigate();
  const { t }    = useLanguage();

  return (
    <section className="rounded-3xl p-5 sm:p-6 relative overflow-hidden" style={GLASS}>
      {/* Inner accent glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(13,148,136,0.20) 0%, transparent 70%)" }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-1 relative z-10">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-2"
            style={{
              background: "rgba(13,148,136,0.18)",
              border: "1px solid rgba(45,212,191,0.28)",
              color: "#5eead4",
            }}
          >
            <ScanLine size={11} /> {t("OCR Prescription Scanner")}
          </span>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <ScanLine size={20} className="text-teal-400" />
            {t("Scan & Read Medical Documents")}
          </h2>
        </div>
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 14px rgba(245,158,11,0.40)" }}
        >
          <Sparkles size={17} className="text-white" />
        </div>
      </div>

      <p className="text-xs text-white/50 mb-5 font-medium leading-relaxed relative z-10">
        {t("Snap a photo of your prescription or upload a PDF report to receive plain language explanations in your language.")}
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* Camera Scan — primary */}
        <button
          onClick={() => navigate("/upload")}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl py-5 px-4 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0d9488 0%,#059669 55%,#65a30d 100%)",
            boxShadow: "0 6px 24px rgba(13,148,136,0.40)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ background: "rgba(255,255,255,0.08)" }} />
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
          >
            <Camera size={22} className="text-white" />
          </div>
          <span className="text-xs font-extrabold text-white">{t("Camera Scan")}</span>
          <span
            className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.20)", color: "#fff" }}
          >
            <Zap size={8} /> LIVE
          </span>
        </button>

        {/* Upload Document — secondary glass */}
        <button
          onClick={() => navigate("/upload")}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl py-5 px-4 transition-all hover:scale-[1.02] active:scale-95 group"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.13)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background    = "rgba(255,255,255,0.12)";
            e.currentTarget.style.borderColor   = "rgba(45,212,191,0.40)";
            e.currentTarget.style.boxShadow     = "0 0 0 1px rgba(45,212,191,0.20)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
            e.currentTarget.style.boxShadow   = "none";
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(13,148,136,0.20)", border: "1px solid rgba(45,212,191,0.25)" }}
          >
            <FileUp size={22} className="text-teal-300" />
          </div>
          <span className="text-xs font-extrabold text-white/80">{t("Upload Document")}</span>
        </button>
      </div>
    </section>
  );
}
