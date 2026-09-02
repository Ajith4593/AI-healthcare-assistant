import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

// Pages
import LandingPage from "./pages/landing/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Home from "@/pages/home/Home";
import Upload from "./pages/upload/Upload";
import History from "./pages/history/History";
import PrescriptionDetails from "./pages/history/PrescriptionDetails";
import Profile from "./pages/profile/Profile";
import Assistant from "./pages/assistant/Assistant";
import DashboardPage from "./pages/dashboard/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>

            {/* ── Public-only routes (redirect to /home if already logged in) ── */}
            <Route path="/" element={
              <PublicRoute><LandingPage /></PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute><Register /></PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute><ForgotPassword /></PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute><ResetPassword /></PublicRoute>
            } />

            {/* ── Protected routes (redirect to /login if not logged in) ── */}
            <Route path="/home" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute><Upload /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />
            <Route path="/prescription/:id" element={
              <ProtectedRoute><PrescriptionDetails /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/assistant" element={
              <ProtectedRoute><Assistant /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />

            {/* ── Aliases ── */}
            <Route path="/chat" element={<Navigate to="/assistant" replace />} />

            {/* ── 404 — send to home or login depending on auth state ── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
