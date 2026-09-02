import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Mic,
  Activity,
  ScanLine,
  Clock,
  UserCheck,
  HeartPulse,
  X,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomeHealthcareOrbit() {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const location = useLocation();
  const { t } = useLanguage();
  const orbitRef = useRef(null);

  const navNodes = [
    {
      id: "home",
      path: "/home",
      label: "Home",
      sublabel: "Dashboard",
      icon: Home,
      angle: 90, // Top
    },
    {
      id: "analytics",
      path: "/dashboard",
      label: "Analytics",
      sublabel: "Health Insights",
      icon: Activity,
      angle: 30, // Top Right
    },
    {
      id: "ocr",
      path: "/upload",
      label: "Scan OCR",
      sublabel: "Read Prescriptions",
      icon: ScanLine,
      angle: -30, // Bottom Right
    },
    {
      id: "passport",
      path: "/profile",
      label: "Health Passport",
      sublabel: "Your Health ID",
      icon: UserCheck,
      angle: -90, // Bottom
    },
    {
      id: "history",
      path: "/history",
      label: "History",
      sublabel: "Medical Records",
      icon: Clock,
      angle: -150, // Bottom Left
    },
    {
      id: "assistant",
      path: "/assistant",
      label: "AI Voice",
      sublabel: "Assistant",
      icon: Mic,
      angle: 150, // Top Left
    },
  ];

  const isActive = (path) =>
    location.pathname === path || (path === "/assistant" && location.pathname === "/chat");

  const getOrbitalStyle = (angleInDegrees, radius = 175) => {
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
      className="relative z-20 my-6 flex items-center justify-center"
    >
      {/* ── DESKTOP SIGNATURE ORBITAL INTERFACE ── */}
      <div className="relative flex items-center justify-center w-[440px] h-[440px]">
        {/* Ambient Pulsing Back Glow */}
        <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-lime-500/20 blur-3xl animate-pulse-soft pointer-events-none" />

        {/* SVG Connection Rays & Particle Rings */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 440 440"
        >
          <defs>
            <linearGradient id="orbitRayGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Orbital Ring Tracks */}
          <circle
            cx="220"
            cy="220"
            r="175"
            fill="none"
            stroke="#0D9488"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-spin-slow origin-center"
          />
          <circle
            cx="220"
            cy="220"
            r="175"
            fill="none"
            stroke="#10B981"
            strokeOpacity="0.1"
            strokeWidth="1"
          />

          {/* Connecting Rays to Core */}
          {navNodes.map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const x2 = 220 + Math.cos(rad) * 175;
            const y2 = 220 - Math.sin(rad) * 175;
            const active = isActive(node.path);
            const isHovered = hoveredNode === node.id;

            return (
              <g key={node.id}>
                <line
                  x1="220"
                  y1="220"
                  x2={x2}
                  y2={y2}
                  stroke={active || isHovered ? "url(#orbitRayGradActive)" : "#0D9488"}
                  strokeOpacity={active ? "0.95" : isHovered ? "0.8" : "0.25"}
                  strokeWidth={active || isHovered ? "2.5" : "1"}
                  strokeDasharray={active || isHovered ? "none" : "3 4"}
                  filter={active || isHovered ? "url(#glowEffect)" : "none"}
                  className="transition-all duration-300"
                />
                {(active || isHovered) && (
                  <circle
                    cx={x2}
                    cy={y2}
                    r="4"
                    fill="#10B981"
                    className="animate-ping origin-center"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ── 6 Floating Orbital Navigation Nodes with Text Labels ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          {navNodes.map((node, index) => {
            const Icon = node.icon;
            const active = isActive(node.path);
            const isHovered = hoveredNode === node.id;
            const posStyle = getOrbitalStyle(node.angle, 175);

            return (
              <div
                key={node.id}
                style={posStyle}
                className="absolute flex flex-col items-center justify-center group"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <Link
                  to={node.path}
                  aria-label={`${node.label} - ${node.sublabel}`}
                  className={`relative flex flex-col items-center justify-center p-3 w-28 h-20 rounded-2xl backdrop-blur-2xl transition-all duration-300 shadow-xl border ${
                    active
                      ? "bg-gradient-to-br from-[#06201B] to-[#0D9488]/80 text-white border-[#10B981] shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/50"
                      : "bg-[#06201B]/85 hover:bg-[#0D9488]/30 text-white/90 border-white/10 hover:border-teal-400/60 hover:scale-105 hover:shadow-teal-500/20"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      active
                        ? "text-[#10B981]"
                        : isHovered
                        ? "text-mint text-[#99F6E4]"
                        : "text-teal-400"
                    }`}
                  />
                  <span className="font-extrabold text-[11px] text-white tracking-tight mt-1 whitespace-nowrap">
                    {t(node.label)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-normal whitespace-nowrap">
                    {t(node.sublabel)}
                  </span>

                  {/* Active Soft Emerald Illumination Indicator */}
                  {active && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── Central Nucleus: Circular "RuralCare AI" Heartbeat Node ── */}
        <div
          className="relative z-20 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-[#041014] via-[#06201B] to-[#0D9488]/50 border-2 border-teal-400/40 text-white shadow-2xl backdrop-blur-2xl text-center p-3"
        >
          {/* Heartbeat Pulse Ring */}
          <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-500 opacity-30 blur-md animate-pulse-soft pointer-events-none" />

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg mb-1">
            <HeartPulse size={24} className="text-amber-300 animate-pulse" />
          </div>

          <span className="font-display font-extrabold text-xs tracking-tight text-white leading-tight">
            RuralCare AI
          </span>
          <span className="text-[9px] text-teal-300 font-bold uppercase tracking-wider mt-0.5">
            Your Health Assistant
          </span>
        </div>
      </div>
    </div>
  );
}
