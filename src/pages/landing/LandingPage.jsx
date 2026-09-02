import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LandingInput } from "./LandingInput";
import { LandingAccordion } from "./LandingAccordion";
import { Mail, Phone, MapPin, Mic, FileText, Globe, Sparkles, CheckCircle2, ShieldCheck, HeartPulse, ArrowRight, Activity } from "lucide-react";
import { submitContactForm } from "@/services/contact";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import logo from "@/assets/logo1.png";

const translatedGreetings = [
  { lang: "Hindi", text: "आपका स्वास्थ्य, आपकी भाषा में", script: "हिंदी" },
  { lang: "Marathi", text: "तुमचं आरोग्य, तुमच्या भाषेत", script: "मराठी" },
  { lang: "Tamil", text: "உங்கள் ஆரோக்கியம், உங்கள் மொழியில்", script: "தமிழ்" },
  { lang: "Telugu", text: "మీ ఆరోగ్యం, మీ భాషలో", script: "తెలుగు" },
  { lang: "Kannada", text: "ನಿಮ್ಮ आरोग्य, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ", script: "ಕನ್ನಡ" },
];

function useRotatingIndex(length, intervalMs) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return index;
}

function LandingNavbar() {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-50 glass-header px-4 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-lime-500 text-white shadow-lg shadow-teal-600/30">
            <img src={logo} alt="RuralCare AI" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-teal-950 dark:text-white text-lg tracking-tight">RuralCare AI</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-300 font-bold hidden sm:block">
              Healthcare Assistant for Rural Communities
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-700 dark:text-slate-200">
          <a href="#features" className="hover:text-teal-600 dark:hover:text-emerald-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-teal-600 dark:hover:text-emerald-400 transition-colors">How it works</a>
          <a href="#faq" className="hover:text-teal-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-teal-600 dark:hover:text-emerald-400 transition-colors">Contact</a>
        </nav>

        {/* Auth buttons & Language Switcher */}
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher buttonClassName="bg-white/80 dark:bg-slate-900/80 border-teal-200 text-teal-900 hover:bg-teal-50" />
          <Link
            to="/login"
            className="text-xs font-bold text-teal-900 border border-teal-300/80 rounded-2xl px-4 py-2 hover:bg-teal-50/80 transition-all"
          >
            {t("Sign In")}
          </Link>
          <Link
            to="/login"
            className="btn-vibrant-primary text-xs py-2 px-4.5 rounded-2xl"
          >
            <Sparkles size={14} className="text-amber-300" />
            {t("Get Started")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const rotatingIndex = useRotatingIndex(translatedGreetings.length, 2600);
  const { t } = useLanguage();

  return (
    <section className="relative px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative Geometric Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl -z-10 animate-pulse-soft" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl -z-10" />

      <div className="grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-lime-500/15 border border-teal-500/30 text-teal-900 dark:text-teal-200 text-xs font-bold shadow-sm backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("Empowering Rural Healthcare Across 10+ Native Languages")}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] text-teal-950 dark:text-white">
            {t("Medical advice, simplified.")}
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
              {t("Spoken in your native tongue.")}
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
            {t(
              "Prescriptions, lab reports, and complex diagnosis jargon transformed into plain 5th-grade explanations with voice synthesis for rural patients, elders, and community health workers."
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="btn-vibrant-primary text-base px-7 py-4"
            >
              <Sparkles size={18} className="text-amber-300" />
              {t("Try it now")}
            </Link>
            <Link
              to="/login"
              className="btn-vibrant-secondary text-base px-7 py-4"
            >
              {t("Sign In")}
            </Link>
          </div>

          {/* Quick Metrics Pills */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-teal-900/10 dark:border-white/10">
            <div>
              <p className="font-display text-2xl font-extrabold text-teal-700 dark:text-emerald-400">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t("Grounded AI Safety")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-teal-700 dark:text-emerald-400">10+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t("Vernacular Dialects")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-teal-700 dark:text-emerald-400">Instant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t("Voice & OCR Reader")}</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Voice Card */}
        <div className="md:col-span-5">
          <Card className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-2xl -z-10" />

            <div className="flex items-center justify-between pb-4 mb-4 border-b border-teal-100/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Mic size={18} />
                </div>
                <span className="text-xs font-extrabold text-teal-950 dark:text-white">{t("Live Voice AI Preview")}</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100/80 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 px-3 py-1 rounded-full border border-teal-300/60">
                {translatedGreetings[rotatingIndex].script}
              </span>
            </div>

            <div className="min-h-[115px] flex flex-col justify-center my-2 bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-lime-50/40 dark:from-slate-800/60 dark:to-slate-800/40 rounded-2xl p-5 border border-teal-200/60 dark:border-white/10">
              <p className="text-xs text-teal-700 dark:text-emerald-400 font-extrabold uppercase tracking-wider mb-1">
                {translatedGreetings[rotatingIndex].lang}
              </p>
              <p key={rotatingIndex} className="font-display text-2xl font-extrabold text-teal-950 dark:text-white animate-fade-in">
                "{translatedGreetings[rotatingIndex].text}"
              </p>
            </div>

            {/* Audio Wave Visualizer representation */}
            <div className="flex items-center justify-center gap-1.5 py-4">
              {[40, 75, 100, 60, 90, 45, 80, 30, 95, 50, 70, 40].map((h, idx) => (
                <span
                  key={idx}
                  style={{ height: `${h * 0.38}px` }}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    idx % 2 === 0 ? "bg-gradient-to-t from-teal-600 to-emerald-500" : "bg-gradient-to-t from-amber-500 to-orange-400"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-teal-100/60 dark:border-white/10 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-teal-800 dark:text-emerald-300">
                <CheckCircle2 size={15} className="text-emerald-500" />
                {t("5th Grade Plain Language")}
              </span>
              <span className="font-extrabold text-teal-600/80 dark:text-teal-400">gTTS + Groq Whisper</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "Plain-language simplification",
    description: "Complex Latin medical terms, diagnoses, and lab reports rewritten into everyday clear words.",
  },
  {
    icon: Globe,
    title: "Regional language translation",
    description: "Instant translation across 10+ Indian languages including Hindi, Tamil, Telugu, Marathi, and Kannada.",
  },
  {
    icon: FileText,
    title: "Prescription OCR scanning",
    description: "Photograph or upload printed prescriptions to extract dosage intervals, drug names, and precautions.",
  },
  {
    icon: HeartPulse,
    title: "Personal health passport",
    description: "Every simplified summary is saved to your profile history, allowing easy access for clinic visits.",
  },
];

function Features() {
  const { t } = useLanguage();
  return (
    <section id="features" className="px-4 md:px-8 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/80 dark:bg-teal-900/60 dark:text-teal-200 px-3.5 py-1 rounded-full border border-teal-200/80">
            {t("Core Capabilities")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-teal-950 dark:text-white mt-3">
            {t("What RuralCare AI does for patients")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="glass-card-hover p-6 rounded-3xl border border-teal-100/80 group">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-extrabold text-teal-950 dark:text-white mb-2">{t(f.title)}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{t(f.description)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { number: "01", title: "Upload your prescription", description: "Snap a photo of your prescription or report using your camera or file upload." },
  { number: "02", title: "AI extracts & simplifies", description: "Our neural model converts complex clinical jargon into plain 5th-grade advice." },
  { number: "03", title: "Choose your language", description: "Select your native language for instant written and spoken translation." },
  { number: "04", title: "Listen & follow care plan", description: "Hear spoken voice instructions and follow your visual morning/night medication timeline." },
];

function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how-it-works" className="px-4 md:px-8 py-20 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100/80 dark:bg-amber-900/60 dark:text-amber-200 px-3.5 py-1 rounded-full border border-amber-200/80">
          {t("Simple 4-Step Process")}
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-teal-950 dark:text-white mt-3">
          {t("How it works in 4 easy steps")}
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="glass-card-hover p-6 rounded-3xl relative border border-teal-100/80">
            <span className="font-display text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent block mb-3">{step.number}</span>
            <h3 className="font-display text-base font-extrabold text-teal-950 dark:text-white mb-2">{t(step.title)}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{t(step.description)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  { q: "Is my medical information kept private?", a: "Yes. Your prescriptions and reports are processed in secure encrypted sessions and are never sold or shared with external third parties." },
  {
    q: "Which Indian languages are supported?",
    a: "We support over 10 major Indian regional languages including Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, and Punjabi with voice synthesis.",
  },
  { q: "Can community health workers use this in offline areas?", a: "Yes. ASHA workers and clinic staff can upload scanned prescriptions and play voice summaries directly for rural families during home visits." },
  { q: "Is the medical advice clinical grade?", a: "Our AI provides grounded educational summaries based on medical knowledge bases (Pinecone vector index + BioClinicalBERT), intended to complement your doctor's instructions." },
];

function FAQ() {
  const { t } = useLanguage();
  const translatedFaqs = faqs.map((faq) => ({
    q: t(faq.q),
    a: t(faq.a),
  }));

  return (
    <section id="faq" className="px-4 md:px-8 py-20 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-extrabold text-teal-950 dark:text-white">{t("Frequently asked questions")}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">{t("Everything you need to know about RuralCare AI")}</p>
        </div>
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-100/80">
          <LandingAccordion items={translatedFaqs} />
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitContactForm(formData);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="px-4 md:px-8 py-20 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5 space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/80 dark:bg-teal-900/60 dark:text-teal-200 px-3.5 py-1 rounded-full border border-teal-200">
            {t("Community & Partner Support")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-teal-950 dark:text-white">{t("Get in touch with us")}</h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {t("Questions about bringing RuralCare AI to primary health centers (PHCs), rural clinics, or community health worker teams — reach out directly.")}
          </p>
          <div className="space-y-4 pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-3 glass-card p-4 rounded-2xl border border-teal-100/80">
              <Mail className="h-4 w-4 text-teal-600" />
              <span>support@ruralcareai.in</span>
            </div>
            <div className="flex items-center gap-3 glass-card p-4 rounded-2xl border border-teal-100/80">
              <Phone className="h-4 w-4 text-teal-600" />
              <span>1800-RURAL-CARE (Toll Free Helpline)</span>
            </div>
            <div className="flex items-center gap-3 glass-card p-4 rounded-2xl border border-teal-100/80">
              <MapPin className="h-4 w-4 text-teal-600" />
              <span>Rural Healthcare Innovation Hub, India</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <Card className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80">
            <CardContent className="p-0">
              {submitted ? (
                <div className="p-8 text-center bg-teal-50/80 dark:bg-slate-800/80 rounded-2xl border border-teal-200">
                  <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                  <p className="text-base font-extrabold text-teal-950 dark:text-white">{t("Message sent successfully!")}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-1">{t("Our rural healthcare team will get back to you shortly.")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t("Your Name")}</label>
                    <LandingInput
                      name="name"
                      placeholder="e.g. Dr. Rajesh Kumar / Asha Worker"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t("Email Address")}</label>
                    <LandingInput
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t("Message or Query")}</label>
                    <Textarea
                      name="message"
                      placeholder="How can we assist your community clinic?"
                      value={formData.message}
                      onChange={handleChange}
                      className="rounded-2xl border-teal-200/80 focus:border-teal-500 min-h-[100px] text-xs font-medium"
                      required
                    />
                  </div>
                  {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-vibrant-primary text-xs py-3.5 rounded-2xl"
                  >
                    {loading ? "Sending..." : t("Send Message")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="px-4 md:px-8 py-12 bg-gradient-to-br from-[#06201B] via-[#092B24] to-[#0D382F] text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-teal-800/60 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-lime-400 flex items-center justify-center shadow-lg">
            <img src={logo} alt="RuralCare AI" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <p className="font-display font-extrabold text-base text-white">{t("RuralCare AI")}</p>
            <p className="text-xs text-teal-200/80 font-medium">{t("Bridging medical jargon and literacy gaps for rural communities.")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-teal-200">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          <LanguageSwitcher dropdownPosition="up" buttonClassName="bg-teal-950/80 border-teal-700 text-teal-100 hover:bg-teal-900" />
        </div>
      </div>
      <p className="text-center text-[11px] text-teal-300/70 pt-6 font-medium">
        © {new Date().getFullYear()} RuralCare AI. Dedicated to rural community health & digital equality.
      </p>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-[#F3FAF7] via-[#EBF7F3] to-[#F5FCFA] dark:from-[#041210] dark:to-[#091F1B] min-h-screen font-sans overflow-x-hidden">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}