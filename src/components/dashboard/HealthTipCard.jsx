import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lightbulb, Volume2, VolumeX, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const tips = [
  "💧 Drink at least 2 litres of clean water every day to stay hydrated.",
  "🚶 A 30-minute daily walk strengthens your heart and keeps joint pains away.",
  "🥗 Include fresh local greens, lentils, and seasonal vegetables in your meals.",
  "💊 Always complete your prescribed course of medicine even if you feel better.",
  "😴 7–8 hours of sound sleep each night supports your immune system.",
  "🧘 Deep breathing for 5 minutes daily calms stress and regulates blood pressure.",
  "🩺 Schedule a health check-up at your local Primary Health Centre (PHC) annually.",
];

export default function HealthTipCard() {
  const { t }       = useLanguage();
  const [playing, setPlaying] = useState(false);

  const dayIndex = Math.floor(Date.now() / 86_400_000) % tips.length;
  const tipText  = tips[dayIndex];

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported"); return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utterance  = new SpeechSynthesisUtterance(tipText);
    utterance.onend  = () => setPlaying(false);
    utterance.onerror= () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className="rounded-3xl p-4 sm:p-5 flex items-start gap-3 relative overflow-hidden"
      style={{
        background: "rgba(245,158,11,0.10)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(245,158,11,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Amber glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)" }}
      />

      {/* Icon */}
      <div
        className="shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mt-0.5"
        style={{
          background: "rgba(245,158,11,0.22)",
          border: "1px solid rgba(245,158,11,0.35)",
        }}
      >
        <Lightbulb size={17} className="text-amber-400" />
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
            {t("Daily Health Advisory")}
          </h3>
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
            style={
              playing
                ? { background: "rgba(245,158,11,0.30)", border: "1px solid rgba(245,158,11,0.60)", color: "#fbbf24" }
                : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.60)" }
            }
          >
            {playing ? <VolumeX size={11} /> : <Volume2 size={11} />}
            {playing ? t("Stop") : t("Listen")}
          </button>
        </div>
        <p className="text-xs text-white/70 font-medium leading-relaxed">{tipText}</p>
      </div>
    </section>
  );
}
