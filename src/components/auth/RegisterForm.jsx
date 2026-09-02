import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";
import toast from "react-hot-toast";

import PasswordInput from "./PasswordInput";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Google sign-up removed; using email/password register only

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Password strength ─────────────────────────────────────────────
  const getStrength = (password) => {
    if (password.length < 8)
      return { text: "Too short (min 8 chars)", width: "25%", color: "bg-red-500" };

    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUpper && hasDigit && hasSpecial)
      return { text: "Strong ✓", width: "100%", color: "bg-emerald-500" };

    const missing = [];
    if (!hasUpper) missing.push("uppercase letter");
    if (!hasDigit) missing.push("digit");
    if (!hasSpecial) missing.push("special character (!@#$...)");

    return { text: `Needs: ${missing.join(", ")}`, width: "55%", color: "bg-amber-500" };
  };

  const strength = getStrength(formData.password);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Email/password register ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanName = formData.full_name.trim();
    const cleanEmail = formData.email.trim();

    if (!cleanName) {
      const msg = "Please enter your full name.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const pwd = formData.password;
    if (
      pwd.length < 8 ||
      !/[A-Z]/.test(pwd) ||
      !/[0-9]/.test(pwd) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    ) {
      const msg = "Password must be at least 8 characters long with 1 uppercase letter, 1 digit, and 1 special character (e.g. Hello@123).";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      await register({
        full_name: cleanName,
        email: cleanEmail,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Account created successfully!");
      navigate("/home");
    } catch (err) {
      const msg = err.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-3 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* Full name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          name="full_name"
          placeholder={t("Full Name")}
          value={formData.full_name}
          onChange={handleChange}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="email"
          name="email"
          placeholder={t("Email Address")}
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
      </div>

      {/* Password */}
      <PasswordInput
        id="password"
        name="password"
        placeholder="Password (e.g. Hello@123)"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {formData.password ? (
        <div>
          <div className="h-1.5 w-full rounded bg-slate-800 border border-white/10">
            <div
              className={`h-1.5 rounded transition-all duration-300 ${strength.color}`}
              style={{ width: strength.width }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-300">{strength.text}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 font-medium">
          8+ chars · uppercase · digit · special character{" "}
          <span className="font-mono text-teal-300">(e.g. Hello@123)</span>
        </p>
      )}

      {/* Role */}
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 px-4 text-xs font-medium text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
      >
        <option value="patient" className="bg-slate-900 text-white">{t("Patient")}</option>
        <option value="healthcare_worker" className="bg-slate-900 text-white">{t("Healthcare Worker")}</option>
      </select>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-vibrant-primary py-3.5 rounded-2xl text-sm font-extrabold shadow-lg shadow-teal-600/25"
      >
        {loading ? t("Creating Account...") : t("Create Account")}
      </Button>

      <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t("Already have an account?")}{" "}
        <Link to="/login" className="font-extrabold text-teal-700 dark:text-emerald-400 hover:underline">
          {t("Login")}
        </Link>
      </p>
    </form>
  );
}
