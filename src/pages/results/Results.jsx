import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Share2,
  Download,
  Copy,
  Check,
  ShieldAlert,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/healthcare/ResultPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

const LANGUAGES = [
  { name: "English", code: "en" },
  { name: "Hindi", code: "hi" },
  { name: "Marathi", code: "mr" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Bengali", code: "bn" },
  { name: "Gujarati", code: "gu" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Punjabi", code: "pa" }
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language: ctxLanguage } = useLanguage();

  const [selectedLang, setSelectedLang] = useState(ctxLanguage?.code || "hi");
  const [isTranslating, setIsTranslating] = useState(false);

  const rawData = location.state?.resultData || location.state?.report || {
    filename: "Prescription_Report.pdf",
    diagnosis: "Acute Upper Respiratory Infection & Fever",
    medicines: [
      { name: "Paracetamol 500mg", dosage: "1-0-1 (Twice Daily)", timing: "After Meals", duration: "5 Days" },
      { name: "Amoxicillin 500mg", dosage: "1-1-1 (Thrice Daily)", timing: "After Meals", duration: "5 Days" }
    ],
    vitals: { bp: "120/80 mmHg", temp: "99.4 °F" },
    advice: ["Take rest.", "Drink warm fluids."]
  };

  const handleLanguageChange = async (newLangCode) => {
    setSelectedLang(newLangCode);
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      const matched = LANGUAGES.find(l => l.code === newLangCode);
      toast.success(`Translated to ${matched?.name || newLangCode}`);
    }, 400);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* Glow Orbs */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-32 -left-32 opacity-50" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-12 relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-teal-300" />
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-[#06201B] text-teal-200 border border-teal-500/30 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Banner */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#06201B]/80 text-white space-y-1">
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold inline-flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-amber-400" /> 5th-Grade Clinical Reading Level
          </span>
          <h1 className="font-display font-bold text-2xl text-white">
            Simplified Health Explanation
          </h1>
          <p className="text-xs text-slate-300">
            Medical jargon converted into simple, easy-to-understand vernacular advice.
          </p>
        </div>

        {/* Main Result Card */}
        <div className="min-h-[480px] flex flex-col">
          <ResultPanel
            language={selectedLang}
            isTranslating={isTranslating}
            resultData={rawData}
          />
        </div>
      </main>
    </div>
  );
}
