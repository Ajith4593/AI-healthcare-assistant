import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown, Check, Globe } from "lucide-react";
import { priorityLanguages, allNllbLanguages } from "@/pages/landing/nllbLanguages";
import { useLanguage } from "@/contexts/LanguageContext";
import { authService } from "@/services/auth";

// Map NLLB code → backend short language code
const NLLB_TO_BACKEND = {
  eng_Latn: "en",
  hin_Deva: "hi",
  mar_Deva: "mr",
  tam_Taml: "ta",
  tel_Telu: "te",
  mal_Mlym: "ml",
  kan_Knda: "kn",
};

export function LanguageSwitcher({
  className = "",
  buttonClassName = "",
  dropdownAlign = "right", // "right" | "left"
  dropdownPosition = "down", // "down" | "up"
}) {
  const { language, setLanguage, setTranslations, setTranslating } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const dropdownPositionClasses = `${dropdownPosition === "up" ? "bottom-full mb-2" : "top-full mt-2"} ${
    dropdownAlign === "left" ? "left-0" : "right-0"
  }`;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 bg-teal-50/90 dark:bg-slate-900/90 border border-teal-300/80 dark:border-teal-700/80 text-teal-950 dark:text-teal-100 rounded-2xl px-3.5 py-1.5 text-xs font-bold hover:bg-teal-100/80 transition-all shadow-sm ${buttonClassName}`}
      >
        <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="truncate max-w-[120px]">{language?.label || "English"}</span>
        <ChevronDown className={`h-3 w-3 text-teal-600 dark:text-teal-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute ${dropdownPositionClasses} w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-teal-200/80 dark:border-teal-700/80 rounded-3xl shadow-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-150`}>
          <div className="p-2 border-b border-teal-100 dark:border-teal-800 bg-teal-50/60 dark:bg-slate-850">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 rounded-2xl">
              <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <input
                type="text"
                placeholder="Search 200+ languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredLanguages.length === 0 && (
              <p className="px-3 py-3 text-xs text-slate-400 text-center font-medium">No language found</p>
            )}
            {filteredLanguages.map((option) => {
              const isSelected = language?.code === option.code;
              return (
                <button
                  key={option.code}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center justify-between w-full px-3.5 py-2 text-xs rounded-2xl font-bold transition-all ${
                    isSelected
                      ? "text-teal-950 dark:text-white bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/60 dark:to-emerald-900/60 border border-teal-300/80"
                      : "text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-800"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}