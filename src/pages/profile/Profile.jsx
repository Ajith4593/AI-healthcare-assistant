import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  Search,
  Check,
  Lock,
  PhoneCall,
  Edit3,
  KeyRound,
  FileText
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

const AVAILABLE_LANGUAGES = [
  { name: "English", code: "en", localName: "English" },
  { name: "Hindi", code: "hi", localName: "हिंदी" },
  { name: "Marathi", code: "mr", localName: "मराठी" },
  { name: "Tamil", code: "ta", localName: "தமிழ்" },
  { name: "Telugu", code: "te", localName: "తెలుగు" },
  { name: "Kannada", code: "kn", localName: "ಕನ್ನಡ" },
  { name: "Bengali", code: "bn", localName: "বাংলা" },
  { name: "Gujarati", code: "gu", localName: "ગુજરાતી" },
  { name: "Malayalam", code: "ml", localName: "മലയാളം" },
  { name: "Punjabi", code: "pa", localName: "ਪੰਜਾਬੀ" }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { t, language, setLanguage, setTranslations, setTranslating } = useLanguage();

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'language' | 'security' | 'help' | 'editProfile'
  const [langSearch, setLangSearch] = useState("");
  const [currentLang, setCurrentLang] = useState("English");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.full_name || user?.username || "",
    email: user?.email || "",
    phone: user?.phone_number || ""
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.full_name || user.username || "",
        email: user.email || "",
        phone: user.phone_number || ""
      });
    }
  }, [user]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const userName = user?.name || user?.full_name || user?.username || profileForm.name || "User";
  const userEmail = user?.email || profileForm.email || "";

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = async () => {
    await logout();
    toast.success(t("Logged out successfully"));
    navigate("/login");
  };

  const handleLanguageSelect = (langName) => {
    const matched = AVAILABLE_LANGUAGES.find((l) => l.name === langName);
    if (!matched) return;

    setCurrentLang(matched.name);

    const languageMap = {
      en: "eng_Latn",
      hi: "hin_Deva",
      mr: "mar_Deva",
      ta: "tam_Taml",
      te: "tel_Telu",
      ml: "mal_Mlym",
      kn: "kan_Knda",
      bn: "ben_Beng",
      gu: "guj_Gujr",
      pa: "pan_Guru",
    };

    const contextCode = languageMap[matched.code] || matched.code;
    // setLanguage triggers t() to resolve from local UI_TRANSLATIONS instantly
    setLanguage({ label: matched.name, code: contextCode });

    if (matched.code === "en") {
      setTranslations({});
    }

    setTranslating(false);
    toast.success(`Language set to ${matched.name}`);
    setActiveModal(null);
  };




  const handleToggleNotifications = (checked) => {
    setNotificationsEnabled(checked);
    toast.success(checked ? "Notifications enabled" : "Notifications muted");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUser({
      name: profileForm.name,
      full_name: profileForm.name,
      username: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      phone_number: profileForm.phone
    });
    toast.success("Profile details saved permanently!");
    setActiveModal(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to update password.");
      }
      toast.success("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setActiveModal(null);
    } catch (err) {
      toast.error(err.message || "Could not update password.");
    }
  };

  const filteredLanguages = AVAILABLE_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.localName.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      {/* Top Banner Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#06201B] via-[#0D3B31] to-[#125042] px-6 pb-12 pt-10 text-white shadow-xl">
        <div className="max-w-md mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {t("RuralCare AI • Patient Passport")}
          </span>
          <h1 className="mt-2 text-3xl font-bold font-display text-white">
            {t("Patient Profile")}
          </h1>
          <p className="mt-1 text-xs text-teal-200/90">
            {t("Manage health passport details, emergency contacts, and native language preferences.")}
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-md space-y-5 px-4 -mt-6">
        {/* Profile Identity Card */}
        <Card className="glass-card rounded-3xl p-6 shadow-xl border border-white/10 bg-white/5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-teal-400 ring-4 ring-teal-500/20 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2 font-display">
                  {userName}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                  <Mail size={13} className="text-teal-400" />
                  <span>{userEmail}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{profileForm.phone || t("No phone added")}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProfileForm({
                  name: userName !== "User" ? userName : "",
                  email: userEmail,
                  phone: user?.phone || user?.phone_number || profileForm.phone || ""
                });
                setActiveModal("editProfile");
              }}
              className="border-white/15 text-slate-200 hover:bg-white/10 text-xs font-bold rounded-xl"
            >
              <Edit3 size={14} className="mr-1 text-teal-300" /> Edit
            </Button>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="glass-card rounded-3xl p-5 shadow-lg border border-white/10 bg-white/5 text-white">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-300">
            {t("Preferences")}
          </h3>

          <div className="space-y-3">
            {/* Preferred Language Action */}
            <button
              onClick={() => setActiveModal("language")}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {t("Preferred Language")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentLang} (Click to switch)
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-300 transition-colors" />
            </button>

            {/* Notifications Action */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {t("Notifications")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {notificationsEnabled ? t("Receive dosage reminders & advisories") : t("Notifications muted")}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
          </div>
        </Card>

        {/* Settings & Security Section */}
        <Card className="glass-card rounded-3xl p-5 shadow-lg border border-white/10 bg-white/5 text-white">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-300">
            {t("Security & Support Controls")}
          </h3>

          <div className="space-y-2.5">
            {/* Privacy & Security Action */}
            <button
              onClick={() => setActiveModal("security")}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {t("Privacy & Security")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t("Password settings & HIPAA encryption")}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-300 transition-colors" />
            </button>

            {/* Help & Support Action */}
            <button
              onClick={() => setActiveModal("help")}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-white">
                    {t("Help & Emergency Helplines")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t("Toll-free 108 / 104 emergency numbers")}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-300 transition-colors" />
            </button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="h-12 w-full rounded-2xl bg-rose-600/80 hover:bg-rose-700 font-bold text-white shadow-md text-xs border border-rose-500/30"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("Sign Out of Account")}
        </Button>

        <p className="pb-4 text-center text-xs text-slate-400">
          {t("RuralCare AI Communication Assistant")}
          <br />
          {t("Encrypted & Secure • Version 1.0.0")}
        </p>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: PREFERRED LANGUAGE MODAL */}
      {/* ============================================================ */}
      {activeModal === "language" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="text-emerald-700" size={20} />
                <h3 className="font-bold text-base text-[#12312A] font-display">{t("Select Native Language")}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t("Search language (e.g. Hindi, Tamil)...")}
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.name;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-100 bg-white hover:bg-emerald-50/50 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs">{lang.name}</span>
                      <span className="ml-2 text-[11px] text-slate-500">({lang.localName})</span>
                    </div>
                    {isSelected && <Check size={16} className="text-emerald-700 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: PRIVACY & SECURITY MODAL */}
      {/* ============================================================ */}
      {activeModal === "security" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="text-emerald-700" size={20} />
                <h3 className="font-bold text-base text-[#12312A] font-display">Privacy & Account Security</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                <KeyRound size={14} /> Change Password
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl">
                Update Password
              </Button>
            </form>

            {/* Security Audit Badge */}
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <Lock size={16} className="mt-0.5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">HIPAA & Data Privacy Protected</p>
                <p className="mt-0.5 text-[11px] text-emerald-800">Your medical records and voice transcripts are end-to-end encrypted and never shared with third parties.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: HELP & SUPPORT MODAL */}
      {/* ============================================================ */}
      {activeModal === "help" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-emerald-700" size={20} />
                <h3 className="font-bold text-base text-[#12312A] font-display">Help & Emergency Support</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Emergency Helplines */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-bold uppercase text-emerald-800">Emergency Helplines (India)</h4>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:108"
                  className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 transition-colors"
                >
                  <PhoneCall size={18} className="text-rose-600" />
                  <div>
                    <p className="font-bold text-sm">108</p>
                    <p className="text-[10px] text-rose-700">Ambulance Response</p>
                  </div>
                </a>

                <a
                  href="tel:104"
                  className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <PhoneCall size={18} className="text-emerald-700" />
                  <div>
                    <p className="font-bold text-sm">104</p>
                    <p className="text-[10px] text-emerald-700">Health Helpline</p>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-emerald-800">Frequently Asked Questions</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Q: How does the AI Assistant work?</p>
                  <p className="mt-1 text-slate-600">It uses grounded medical AI models and Pinecone knowledge search to explain prescriptions in 10 regional languages with voice synthesis.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Q: Is my medical upload private?</p>
                  <p className="mt-1 text-slate-600">Yes, uploaded prescriptions are processed securely with local OCR and stored in your private history timeline.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: EDIT PROFILE MODAL */}
      {/* ============================================================ */}
      {activeModal === "editProfile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="text-emerald-700" size={20} />
                <h3 className="font-bold text-base text-[#12312A] font-display">Edit Profile Details</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="w-1/2 border-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}