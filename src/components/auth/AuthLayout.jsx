import { ShieldCheck, Languages, Sparkles, HeartPulse } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import logo from "@/assets/logo1.png";

export default function AuthLayout({ title, subtitle, children }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-slate-100 font-sans overflow-hidden relative">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      {/* Left Showcase Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#06201B] via-[#0D3B31] to-[#125042] text-white p-16 relative overflow-hidden">
        {/* Geometric Ambient Glow Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-lime-400/15 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-lime-400 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 shrink-0">
              <img src={logo} alt="RuralCare AI" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white drop-shadow-md">
                RuralCare AI
              </h1>
              <p className="text-xs sm:text-sm text-[#99F6E4] font-black uppercase tracking-widest mt-0.5">
                Healthcare Communication Assistant
              </p>
            </div>
          </div>

          <p className="text-lg text-teal-100/90 leading-relaxed mb-12 font-display font-medium">
            Bridging medical jargon, language barriers, and literacy gaps with Multilingual Voice AI and Prescription Digitization.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Encrypted & HIPAA Compliant</h3>
                <p className="text-teal-100/80 text-xs mt-0.5 font-medium">
                  Your medical records are processed in secure isolated sessions and never shared.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Languages className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">10+ Regional Languages</h3>
                <p className="text-teal-100/80 text-xs mt-0.5 font-medium">
                  Understand prescription instructions and health advisories in your native dialect.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">5th Grade Plain Language AI</h3>
                <p className="text-teal-100/80 text-xs mt-0.5 font-medium">
                  Complex Latin drug names simplified into everyday dosage instructions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-teal-300/70 font-medium relative z-10">
          © {new Date().getFullYear()} RuralCare AI. Healthcare for every rural household.
        </p>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full border border-teal-500/30">
                RuralCare Access
              </span>
              <LanguageSwitcher />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-2">
              {t(title)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              {t(subtitle)}
            </p>
          </div>

          {children}

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400 font-semibold">
            <div className="flex justify-center gap-6">
              <a href="#" className="hover:text-teal-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-teal-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-teal-300 transition-colors">Help Helpline</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}