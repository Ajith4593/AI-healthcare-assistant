import { ChevronRight, FileText, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecentPrescriptionCard({ prescription }) {
  const navigate    = useNavigate();
  const isCompleted = prescription.status === "Completed";

  return (
    <button
      onClick={() => navigate(`/prescription/${prescription.id}`)}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-3.5 transition-all group"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background   = "rgba(255,255,255,0.10)";
        e.currentTarget.style.borderColor  = "rgba(45,212,191,0.35)";
        e.currentTarget.style.boxShadow    = "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(45,212,191,0.15)";
        e.currentTarget.style.transform    = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background  = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.boxShadow   = "0 4px 20px rgba(0,0,0,0.25)";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all"
        style={{
          background: isCompleted
            ? "rgba(13,148,136,0.22)"
            : "rgba(245,158,11,0.18)",
          border: isCompleted
            ? "1px solid rgba(45,212,191,0.28)"
            : "1px solid rgba(245,158,11,0.30)",
        }}
      >
        <FileText
          size={20}
          className={isCompleted ? "text-teal-300" : "text-amber-400"}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm text-white/90 truncate group-hover:text-white transition-colors">
          {prescription.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/45">
          <Calendar size={11} className="text-white/30 shrink-0" />
          <span>{prescription.date}</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold text-[10px]"
            style={{
              background: "rgba(13,148,136,0.18)",
              border: "1px solid rgba(45,212,191,0.22)",
              color: "#5eead4",
            }}
          >
            {prescription.language}
          </span>
        </div>
      </div>

      {/* Status + arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={
            isCompleted
              ? { background: "rgba(13,148,136,0.20)", border: "1px solid rgba(45,212,191,0.28)", color: "#5eead4" }
              : { background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.32)", color: "#fbbf24" }
          }
        >
          {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
          {prescription.status}
        </span>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <ChevronRight size={15} className="text-white/40 group-hover:text-teal-300 transition-colors" />
        </div>
      </div>
    </button>
  );
}
