import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Mic,
  Activity,
  ScanLine,
  Clock,
  UserCheck,
  Sparkles,
  X,
  Plus,
  ChevronRight,
  ShieldAlert,
  Stethoscope
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CareDockNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const { t } = useLanguage();
  const dockRef = useRef(null);

  // Close dock on Escape key press or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation Items
  const navItems = [
    {
      id: "home",
      path: "/home",
      label: "Home",
      tooltip: "Care Hub & Dashboard",
      icon: Home,
      accent: "from-teal-500 to-emerald-600",
    },
    {
      id: "assistant",
      path: "/assistant",
      label: "AI Voice",
      tooltip: "Multilingual Voice AI",
      icon: Mic,
      accent: "from-amber-400 to-orange-500",
    },
    {
      id: "analytics",
      path: "/dashboard",
      label: "Analytics",
      tooltip: "Clinical Insights & RAG",
      icon: Activity,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      id: "ocr",
      path: "/upload",
      label: "Scan OCR",
      tooltip: "Prescription Digitizer",
      icon: ScanLine,
      accent: "from-teal-600 to-cyan-500",
    },
    {
      id: "history",
      path: "/history",
      label: "History",
      tooltip: "Medical Record Logs",
      icon: Clock,
      accent: "from-indigo-500 to-teal-600",
    },
    {
      id: "passport",
      path: "/profile",
      label: "Passport",
      tooltip: "Personal Health Profile",
      icon: UserCheck,
      accent: "from-emerald-600 to-lime-500",
    },
  ];

  const isActive = (path) =>
    location.pathname === path || (path === "/assistant" && location.pathname === "/chat");

  const toggleDock = () => setIsOpen((prev) => !prev);

  return (
    <div
      ref={dockRef}
      role="navigation"
      aria-label="RuralCare AI Care Dock Command Center"
      className="fixed z-50 font-sans"
    >
      {/* ── DESKTOP DOCK (Right Side of Screen / Hero Section) ── */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-end gap-3 pointer-events-auto">
        {/* Expanded Navigation Menu (Vertical Column) */}
        <div
          className={`flex flex-col items-end gap-3 transition-all duration-300 ease-out origin-right ${
            isOpen
              ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
              : "opacity-0 scale-90 translate-x-10 pointer-events-none"
          }`}
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div
                key={item.id}
                className="relative flex items-center group"
                style={{
                  transitionDelay: isOpen ? `${index * 40}ms` : "0ms",
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* SVG Glowing Connection Line */}
                <div
                  className={`absolute right-12 w-8 h-[2px] bg-gradient-to-r from-teal-400/60 to-transparent transition-opacity duration-300 pointer-events-none ${
                    hoveredItem === item.id || active ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Short Tooltip Tag */}
                <div
                  className={`mr-3 px-3 py-1.5 rounded-2xl bg-[#06201B]/95 dark:bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 text-white shadow-xl flex items-center gap-2 transition-all duration-200 ${
                    hoveredItem === item.id || active
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 translate-x-3 scale-95 pointer-events-none"
                  }`}
                >
                  <span className="text-xs font-extrabold tracking-wide whitespace-nowrap">
                    {t(item.label)}
                  </span>
                  <span className="text-[10px] text-teal-300 font-medium whitespace-nowrap">
                    • {t(item.tooltip)}
                  </span>
                </div>

                {/* Care Dock Nav Button */}
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  aria-label={`${item.label} - ${item.tooltip}`}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-2xl transition-all duration-300 shadow-xl border ${
                    active
                      ? "bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 text-white border-amber-400/80 shadow-teal-600/40 scale-110 ring-2 ring-amber-400/50"
                      : "bg-white/85 dark:bg-slate-900/90 text-teal-950 dark:text-teal-100 border-teal-200/80 dark:border-teal-700/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:scale-105 hover:border-teal-400"
                  }`}
                >
                  <Icon size={20} className={active ? "text-amber-300" : "text-teal-700 dark:text-teal-300"} />

                  {/* Active Indicator Pulse Dot */}
                  {active && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── Main Default State: Circular "Care AI" Command Trigger ── */}
        <button
          type="button"
          onClick={toggleDock}
          aria-expanded={isOpen}
          aria-label="Care AI Command Dock Navigation"
          className={`relative group flex items-center gap-3 p-2 rounded-full backdrop-blur-2xl transition-all duration-300 shadow-2xl border ${
            isOpen
              ? "bg-[#06201B] border-amber-400/80 text-white ring-4 ring-teal-500/30 scale-105"
              : "bg-gradient-to-br from-[#06201B] via-[#0D3B31] to-[#125042] border-teal-400/50 text-white hover:scale-105 hover:border-teal-300"
          }`}
        >
          {/* Subtle Healthcare Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-400 opacity-40 blur-md group-hover:opacity-80 transition-opacity animate-pulse-soft pointer-events-none" />

          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 text-white shadow-lg shadow-teal-500/40">
            {isOpen ? (
              <X size={20} className="text-white transition-transform rotate-90" />
            ) : (
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
            )}
          </div>

          <div className="pr-3 flex flex-col text-left leading-none">
            <span className="font-display font-extrabold text-xs tracking-tight text-white flex items-center gap-1">
              Care AI
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[9px] text-teal-300 font-extrabold uppercase tracking-wider mt-0.5">
              {isOpen ? "Close Dock" : "Command AI"}
            </span>
          </div>
        </button>
      </div>

      {/* ── MOBILE / TABLET DOCK (Bottom Floating Dock) ── */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto">
        {/* Mobile Expanded Menu (Floating Grid Bar) */}
        {isOpen && (
          <div className="mb-3 p-3 rounded-3xl bg-[#06201B]/95 backdrop-blur-2xl border border-teal-400/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-teal-800/80 text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Stethoscope size={14} className="text-amber-400" /> Care AI Command Center
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-teal-300 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all ${
                      active
                        ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white font-extrabold shadow-md border border-amber-400/60"
                        : "bg-white/10 text-teal-100 hover:bg-white/20"
                    }`}
                  >
                    <Icon size={20} className={active ? "text-amber-300" : "text-teal-300"} />
                    <span className="text-[11px] font-bold mt-1">{t(item.label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Default Floating Trigger Dock */}
        <div className="flex items-center justify-between p-2 rounded-full bg-[#06201B]/95 backdrop-blur-2xl border border-teal-400/40 shadow-2xl text-white">
          <Link
            to="/home"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Home size={18} className="text-teal-300" />
            <span className="text-xs font-extrabold">{t("Home")}</span>
          </Link>

          {/* Central Pulsing "Care AI" Circular Button */}
          <button
            type="button"
            onClick={toggleDock}
            aria-expanded={isOpen}
            aria-label="Open Care AI Command Center"
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 text-white shadow-xl shadow-teal-500/40 -mt-5 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
          >
            <span className="absolute -inset-1 rounded-full bg-teal-400/40 blur-sm animate-pulse-soft pointer-events-none" />
            {isOpen ? <X size={22} /> : <Sparkles size={22} className="text-amber-300 animate-pulse" />}
          </button>

          <Link
            to="/assistant"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Mic size={18} className="text-amber-400" />
            <span className="text-xs font-extrabold">{t("AI Voice")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
