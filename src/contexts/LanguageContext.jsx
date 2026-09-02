import { createContext, useContext, useState, useEffect } from "react";
import { priorityLanguages } from "@/pages/landing/nllbLanguages";
import { UI_TRANSLATIONS } from "@/locales/uiTranslations";

const LanguageContext = createContext(null);

// Map NLLB codes → short codes used in UI_TRANSLATIONS
const NLLB_TO_SHORT = {
  eng_Latn: "en",
  hin_Deva: "hi",
  mar_Deva: "mr",
  tam_Taml: "ta",
  tel_Telu: "te",
  mal_Mlym: "ml",
  kan_Knda: "kn",
};

// Map short backend codes → NLLB codes (reverse lookup)
const SHORT_TO_NLLB = Object.fromEntries(
  Object.entries(NLLB_TO_SHORT).map(([nllb, short]) => [short, nllb])
);

export function LanguageProvider({ children }) {
  // Initialize from stored language preference or default strictly to English
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLangCode = localStorage.getItem("app_language");
      if (savedLangCode) {
        const match = priorityLanguages.find((l) => l.code === savedLangCode);
        if (match) return match;
      }
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const savedCode = user?.preferred_language;
        if (savedCode) {
          const nllbCode = SHORT_TO_NLLB[savedCode];
          if (nllbCode) {
            const match = priorityLanguages.find((l) => l.code === nllbCode);
            if (match) return match;
          }
        }
      }
    } catch (_) {}
    return priorityLanguages[0]; // English is default
  });

  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      if (newLang?.code) {
        localStorage.setItem("app_language", newLang.code);
      }
    } catch (_) {}
  };

  function t(text) {
    if (!text) return "";
    const shortCode = NLLB_TO_SHORT[language?.code] ?? language?.code ?? "en";
    if (shortCode === "en") return text;
    const cleanKey = typeof text === "string" ? text.trim() : text;
    // 1. check local dictionary first
    const dict = UI_TRANSLATIONS[shortCode];
    if (dict && typeof dict[cleanKey] === "string") return dict[cleanKey];
    if (dict && typeof dict[text] === "string") return dict[text];
    // 2. fall back to runtime-loaded translations
    return translations[cleanKey] ?? translations[text] ?? text;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        setTranslations,
        translating,
        setTranslating,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}