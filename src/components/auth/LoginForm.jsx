import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

import PasswordInput from "./PasswordInput";
import Loader from "../common/Loader";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Google sign-in removed; using email/password auth only

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();

  const googleBtnRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);


  // Called by GIS after user picks a Google account
  const handleGoogleCredential = async ({ credential }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credential }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || "Google sign-in failed.");
      }

      const data = await res.json();
      const token = data.access_token;

      const profileRes = await fetch("/api/v1/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();

      const user = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        full_name: profile.full_name,
        phone_number: profile.phone_number || "",
        role: profile.role,
        preferred_language: profile.preferred_language || "en",
        token,
      };

      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", data.refresh_token || "");
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Signed in with Google!");
      const destination = location.state?.from?.pathname || "/home";
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || "Google sign-in failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const cleanEmail = formData.email.trim();
    try {
      await login({ email: cleanEmail, password: formData.password });

      if (rememberMe) {
        localStorage.setItem("rememberEmail", cleanEmail);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      toast.success("Welcome back!");
      const destination = location.state?.from?.pathname || "/home";
      navigate(destination, { replace: true });
    } catch (err) {
      const message = err.message || "Invalid email or password.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo credentials with one click
  // demo access removed — use real backend credentials

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Use real credentials — demo access removed */}

      {error && (
        <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-3 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* Google Sign-In removed — use email/password below */}

      {/* Email */}
      <div>
        <label className="mb-2 block text-xs font-bold text-slate-300">
          {t("Email")}
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="email"
            name="email"
            placeholder={t("Enter your email")}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-xs font-bold text-slate-300">
          {t("Password")}
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder={t("Enter your password")}
          value={formData.password}
          onChange={handleChange}
          required
          inputClassName="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-500"
          />
          {t("Remember Me")}
        </label>
        <Link
          to="/forgot-password"
          className="text-teal-300 hover:text-teal-200 hover:underline"
        >
          {t("Forgot Password?")}
        </Link>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-vibrant-primary py-3.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-teal-600/30"
      >
        {loading ? <Loader text={t("Signing In...")} /> : t("Sign In")}
      </Button>

      <p className="text-center text-xs font-semibold text-slate-400">
        {t("Don't have an account?")}{" "}
        <Link to="/register" className="font-extrabold text-teal-300 hover:underline">
          {t("Register")}
        </Link>
      </p>
    </form>
  );
}
