import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  User, LogOut, Home, Mic, Activity, ScanLine, Clock, UserCheck, Bell
} from "lucide-react";
import logo from "../../assets/logo1.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { path: "/home",      label: "Home",     icon: Home },
  { path: "/assistant", label: "AI Voice", icon: Mic },
  { path: "/dashboard", label: "Analytics",icon: Activity },
  { path: "/upload",    label: "Scan",     icon: ScanLine },
  { path: "/history",   label: "History",  icon: Clock },
  { path: "/profile",   label: "Profile",  icon: UserCheck },
];

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  // Auth pages keep their own minimal nav — no top bar needed
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/"];
  const isAuthPage = authRoutes.includes(location.pathname);

  if (isAuthPage) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path === "/assistant" && location.pathname === "/chat");

  const userName =
    user?.name || user?.full_name || user?.email?.split("@")[0] || "Account";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          TOP FROSTED-GLASS NAVBAR  — always shown
      ══════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 gap-4">

          {/* ── Brand ── */}
          <Link
            to={isAuthenticated ? "/home" : "/"}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 shadow-xl shadow-teal-600/40 group-hover:scale-105 transition-transform">
              <img src={logo} alt="RuralCare AI" className="w-7 h-7 object-contain" />
              {/* Live pulse dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-[#041014]" />
              </span>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-display font-extrabold text-white text-xl tracking-tight">
                RuralCare AI
              </p>
              <p className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                AI Health Assistant
              </p>
            </div>
          </Link>

          {/* ── Centre inline nav links (authenticated, md+) ── */}
          {isAuthenticated && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
              {NAV_LINKS.map(({ path, label, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all ${
                      active
                        ? "bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border border-teal-400/50 shadow-lg shadow-teal-600/20"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? "text-emerald-400 shrink-0" : "text-slate-400 shrink-0"}
                    />
                    <span className="whitespace-nowrap">{t(label)}</span>
                    {active && (
                      <span className="ml-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* ── Right controls ── */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher
              buttonClassName="bg-white/10 border-white/15 text-white hover:bg-white/20 text-xs px-3 py-2 rounded-xl"
            />

            {isAuthenticated ? (
              <>
                {/* Bell */}
                <button className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/20 transition-all">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#060f14]" />
                </button>

                {/* Avatar pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 hover:border-teal-400/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate transition-colors">
                    {userName}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title={t("Logout")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs font-extrabold transition-all"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">{t("Logout")}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-2xl px-5 py-2.5 shadow-lg shadow-teal-700/30 transition-all hover:scale-105"
              >
                {t("Sign In")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Spacer so page content starts below the fixed nav */}
      {!isAuthPage && <div className="h-20" />}
    </>
  );
}
