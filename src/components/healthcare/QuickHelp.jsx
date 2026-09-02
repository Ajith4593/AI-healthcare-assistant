import React from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Stethoscope, FileText, MapPin, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function QuickHelp() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const helpItems = [
    {
      icon: Pill,
      title: "Medicines",
      desc: "Understand my medicine",
      action: () => navigate("/upload"),
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      icon: Stethoscope,
      title: "Symptoms",
      desc: "Tell me what I'm feeling",
      action: () => navigate("/assistant"),
      color: "text-teal-300",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      icon: FileText,
      title: "Prescription",
      desc: "Explain my prescription",
      action: () => navigate("/upload"),
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: MapPin,
      title: "Find Care",
      desc: "Find nearby healthcare",
      action: () => navigate("/dashboard"),
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      icon: Calendar,
      title: "Appointment",
      desc: "Manage my appointment",
      action: () => navigate("/history"),
      color: "text-amber-300",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#06201B]/80 space-y-4 text-white">
      <div>
        <h3 className="font-display font-extrabold text-lg text-white">
          {t("What do you need help with?")}
        </h3>
        <p className="text-xs text-slate-300 font-medium mt-0.5">
          {t("Tap any topic for instant plain-language guidance")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {helpItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className={`p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border ${item.borderColor} text-left transition-all group scale-100 hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div className={`w-9 h-9 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center mb-2`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-teal-300 flex items-center justify-between">
                  {t(item.title)}
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                  {t(item.desc)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
