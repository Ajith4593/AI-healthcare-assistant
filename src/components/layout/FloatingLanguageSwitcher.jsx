import { useState, useRef, useEffect } from "react";
import { Globe, ChevronUp, Check, Sparkles, X, Languages } from "lucide-react";
import { priorityLanguages, allNllbLanguages } from "@/pages/landing/nllbLanguages";
import { useLanguage } from "@/contexts/LanguageContext";
import { authService } from "@/services/auth";
import { useLocation } from "react-router-dom";

const NLLB_TO_BACKEND = {
  eng_Latn: "en",
  hin_Deva: "hi",
  mar_Deva: "mr",
  tam_Taml: "ta",
  tel_Telu: "te",
  mal_Mlym: "ml",
  kan_Knda: "kn",
};

export function FloatingLanguageSwitcher() {
  const { language, setLanguage, setTranslations, setTranslating, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close on route change or click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const languageList = search ? allNllbLanguages : priorityLanguages;
  const filteredLanguages = search
    ? languageList.filter((lang) =>
        lang.label.toLowerCase().includes(search.toLowerCase())
      )
    : priorityLanguages;

  async function handleSelect(option) {
    setLanguage(option);
    setOpen(false);
    setSearch("");
    setTranslating(false);
    if (option.code === "eng_Latn") setTranslations({});

    const shortCode = NLLB_TO_BACKEND[option.code];
    if (shortCode && localStorage.getItem("authToken")) {
      try {
        await authService.updateLanguage(shortCode);
      } catch (err) {
        console.warn("Could not persist language preference:", err.message);
      }
    }
  }

  // Adjust bottom offset on mobile if bottom nav is present
  const isAuthOrLanding = ["/", "/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);
  const bottomClass = isAuthOrLanding ? "bottom-5 right-5" : "bottom-20 md:bottom-6 right-5";

  return (
    <div className={`fixed ${bottomClass} z-[60] font-sans`} ref={dropdownRef}>
      {/* Dropdown Menu (Opens Upward) */}
      {open && (
        <div className="absolute bottom-full right-0 mb-3 w-72 sm:w-80 bg-white/95 backdrop-blur-2xl border border-emerald-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Languages className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display text-white">Multilingual Language Support</h4>
                  <p className="text-[10px] text-emerald-200">10+ Regional & 200+ Global Languages</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Reset to English if non-English active */}
            {language?.code !== "eng_Latn" && (
              <button
                type="button"
                onClick={() => handleSelect(priorityLanguages[0])}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Reset to Default English
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="p-2.5 bg-emerald-50/60 border-b border-emerald-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-2xl shadow-inner">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                placeholder="Search language (Hindi, Tamil, etc.)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Language Options list */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/50">
            {filteredLanguages.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-xs font-semibold text-slate-500">No language matches search</p>
                <p className="text-[10px] text-slate-400 mt-1">Try typing another dialect name</p>
              </div>
            )}

            {filteredLanguages.map((option) => {
              const isSelected = language?.code === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 text-xs rounded-2xl font-semibold transition-all ${
                    isSelected
                      ? "text-emerald-950 bg-emerald-100/90 border border-emerald-300/80 shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-600 animate-ping" : "bg-slate-300"}`} />
                    <span>{option.label}</span>
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 text-emerald-700" />
                      Active
                    </span>
                  ) : option.code === "eng_Latn" ? (
                    <span className="text-[10px] text-slate-400 font-normal">Default</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-2.5 bg-[#12312A] hover:bg-[#1E5144] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 border-2 border-amber-400/80 transition-all duration-300 scale-100 hover:scale-105 active:scale-95"
        title="Change Application Language"
      >
        <div className="relative flex items-center justify-center">
          <Globe className="w-5 h-5 text-amber-300 animate-spin-slow group-hover:rotate-45 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
            Multilingual Support
          </span>
          <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            {language?.label || "English"}
            <ChevronUp className={`w-3.5 h-3.5 text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </div>
      </button>
    </div>
  );
}
