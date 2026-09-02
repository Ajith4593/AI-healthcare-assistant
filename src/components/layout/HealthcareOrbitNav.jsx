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
  HeartPulse,
  ChevronUp,
  Stethoscope,
  Compass
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HealthcareOrbitNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const location = useLocation();
  const { t } = useLanguage();
  const orbitRef = useRef(null);

  // Close orbit menu on Escape key press or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (orbitRef.current && !orbitRef.current.contains(e.target)) {
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

  const navNodes = [
    {
      id: "home",
      path: "/home",
      label: "Home",
      tooltip: "Care Hub",
      icon: Home,
      angle: 210, // Top Left
    },
    {
      id: "assistant",
      path: "/assistant",
      label: "AI Voice",
      tooltip: "Voice Assistant",
      icon: Mic,
      angle: 150, // Mid Top Left
    },
    {
      id: "analytics",
      path: "/dashboard",
      label: "Analytics",
      tooltip: "Clinical Insights",
      icon: Activity,
      angle: 90, // Top Center
    },
    {
      id: "ocr",
      path: "/upload",
      label: "Scan OCR",
      tooltip: "Rx Reader",
      icon: ScanLine,
      angle: 30, // Mid Top Right
    },
    {
      id: "history",
      path: "/history",
      label: "History",
      tooltip: "Medical Logs",
      icon: Clock,
      angle: -30, // Top Right
    },
    {
      id: "passport",
      path: "/profile",
      label: "Passport",
      tooltip: "Health Profile",
      icon: UserCheck,
      angle: -90, // Right
    },
  ];

  const isActive = (path) =>
    location.pathname === path || (path === "/assistant" && location.pathname === "/chat");

  const toggleOrbit = () => setIsOpen((prev) => !prev);

  // Calculate orbital position coordinates around nucleus (radius ~140px)
  const getOrbitalStyle = (angleInDegrees, radius = 145) => {
    const rad = (angleInDegrees * Math.PI) / 180;
    const x = Math.round(Math.cos(rad) * radius);
    const y = Math.round(-Math.sin(rad) * radius);
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  return (
    <div
      ref={orbitRef}
      role="navigation"
      aria-label="Healthcare Orbit Navigation"
      className="fixed z-50 font-sans"
    >
      {/* ── DESKTOP ORBITAL INTERFACE (Right Hero Floating Command Nucleus) ── */}
      <div className="hidden md:block fixed right-10 top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="relative flex items-center justify-center w-80 h-80">
          
          {/* Subtle SVG Connection Rays & Particle Rings */}
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            viewBox="0 0 320 320"
          >
            <defs>
              <linearGradient id="orbitRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#84cc16" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Orbital Ring Track */}
            <circle
              cx="160"
              cy="160"
              r="145"
              fill="none"
              stroke="#0d9488"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className="animate-spin-slow origin-center"
            />

            {/* Connecting Lines to Core */}
            {navNodes.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const x2 = 160 + Math.cos(rad) * 145;
              const y2 = 160 - Math.sin(rad) * 145;
              const active = isActive(node.path);
              const isHovered = hoveredNode === node.id;

              return (
                <line
                  key={node.id}
                  x1="160"
                  y1="160"
                  x2={x2}
                  y2={y2}
                  stroke={active || isHovered ? "url(#orbitRayGrad)" : "#14b8a6"}
                  strokeOpacity={active ? "0.9" : isHovered ? "0.7" : "0.25"}
                  strokeWidth={active || isHovered ? "2.5" : "1"}
                  strokeDasharray={active || isHovered ? "none" : "3 3"}
                  filter={active || isHovered ? "url(#glow)" : "none"}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* ── 6 Floating Orbital Navigation Nodes ── */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-75 pointer-events-none"
            }`}
          >
            {navNodes.map((node, index) => {
              const Icon = node.icon;
              const active = isActive(node.path);
              const isHovered = hoveredNode === node.id;
              const posStyle = getOrbitalStyle(node.angle, 145);

              return (
                <div
                  key={node.id}
                  style={{
                    ...posStyle,
                    transitionDelay: isOpen ? `${index * 35}ms` : "0ms",
                  }}
                  className="absolute flex flex-col items-center justify-center group"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <Link
                    to={node.path}
                    onClick={() => setIsOpen(false)}
                    aria-label={`${node.label} - ${node.tooltip}`}
                    className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-2xl transition-all duration-300 shadow-2xl border ${
                      active
                        ? "bg-gradient-to-br from-teal-600 via-emerald-600 to-lime-600 text-white border-amber-400 shadow-teal-600/50 scale-110 ring-2 ring-amber-400/60"
                        : "bg-white/90 dark:bg-slate-900/90 text-teal-950 dark:text-teal-100 border-teal-200/80 dark:border-teal-700/80 hover:bg-teal-50 dark:hover:bg-slate-800 hover:scale-110 hover:border-teal-400 hover:shadow-teal-500/30"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors ${
                        active
                          ? "text-amber-300"
                          : isHovered
                          ? "text-teal-600 dark:text-emerald-400"
                          : "text-teal-700 dark:text-teal-300"
                      }`}
                    />

                    {/* Active State Indicator Dot */}
                    {active && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
                      </span>
                    )}
                  </Link>

                  {/* Clean Tooltip Label */}
                  <div
                    className={`absolute -bottom-8 px-2.5 py-0.5 rounded-full bg-[#06201B]/95 text-white border border-teal-400/50 shadow-lg text-[10px] font-extrabold whitespace-nowrap transition-all duration-200 ${
                      active || isHovered
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-1 scale-90 pointer-events-none"
                    }`}
                  >
                    {t(node.label)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Central Nucleus: Circular "RuralCare AI" Heartbeat Trigger ── */}
          <button
            type="button"
            onClick={toggleOrbit}
            aria-expanded={isOpen}
            aria-label="Toggle Healthcare Orbit Navigation"
            className={`relative z-20 flex flex-col items-center justify-center w-28 h-28 rounded-full backdrop-blur-2xl transition-all duration-300 shadow-2xl border ${
              isOpen
                ? "bg-[#06201B] border-amber-400 text-white ring-4 ring-teal-500/40 scale-105"
                : "bg-gradient-to-br from-[#06201B] via-[#0D3B31] to-[#125042] border-teal-300/60 text-white hover:scale-105 hover:border-teal-300 shadow-teal-900/50"
            }`}
          >
            {/* Heartbeat Pulse Ring */}
            <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-400 opacity-40 blur-lg animate-pulse-soft pointer-events-none" />

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-md mb-1">
              {isOpen ? (
                <X size={20} className="text-white transition-transform rotate-90" />
              ) : (
                <HeartPulse size={22} className="text-amber-300 animate-pulse" />
              )}
            </div>

            <span className="font-display font-extrabold text-[11px] tracking-tight text-white leading-tight">
              RuralCare AI
            </span>
            <span className="text-[9px] text-teal-300 font-extrabold uppercase tracking-wider mt-0.5">
              {isOpen ? "Close Orbit" : "Healthcare Orbit"}
            </span>
          </button>
        </div>
      </div>

      {/* ── MOBILE / TABLET ORBITAL EXPANDABLE DOCK ── */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto">
        {/* Mobile Expanded Orbit Menu (2x3 Floating Glass Grid) */}
        {isOpen && (
          <div className="mb-3 p-4 rounded-3xl bg-[#06201B]/95 backdrop-blur-2xl border border-teal-400/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-teal-800/80 text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <HeartPulse size={16} className="text-amber-400 animate-pulse" /> RuralCare AI Healthcare Orbit
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-teal-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {navNodes.map((node) => {
                const Icon = node.icon;
                const active = isActive(node.path);
                return (
                  <Link
                    key={node.id}
                    to={node.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all ${
                      active
                        ? "bg-gradient-to-br from-teal-600 via-emerald-600 to-lime-600 text-white font-extrabold shadow-md border border-amber-400/80"
                        : "bg-white/10 text-teal-100 hover:bg-white/20 border border-teal-500/20"
                    }`}
                  >
                    <Icon size={20} className={active ? "text-amber-300" : "text-teal-300"} />
                    <span className="text-[11px] font-extrabold mt-1">{t(node.label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Floating Trigger Dock */}
        <div className="flex items-center justify-between p-2 rounded-full bg-[#06201B]/95 backdrop-blur-2xl border border-teal-400/40 shadow-2xl text-white">
          <Link
            to="/home"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Home size={18} className="text-teal-300" />
            <span className="text-xs font-extrabold">{t("Home")}</span>
          </Link>

          {/* Central Pulsing "RuralCare AI" Nucleus Button */}
          <button
            type="button"
            onClick={toggleOrbit}
            aria-expanded={isOpen}
            aria-label="Open Healthcare Orbit Navigation"
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 text-white shadow-xl shadow-teal-500/40 -mt-6 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
          >
            <span className="absolute -inset-1 rounded-full bg-teal-400/40 blur-sm animate-pulse-soft pointer-events-none" />
            {isOpen ? (
              <X size={22} />
            ) : (
              <HeartPulse size={22} className="text-amber-300 animate-pulse" />
            )}
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
