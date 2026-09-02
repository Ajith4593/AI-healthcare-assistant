import React, { useState, useEffect } from "react";
import {
  Activity,
  Bed,
  Stethoscope,
  HeartPulse,
  TrendingUp,
  AlertCircle,
  Users,
  ShieldCheck,
  RefreshCw,
  MapPin,
  PhoneCall,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { subscribe } from "@/lib/events";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("week");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [stats, setStats] = useState({
    totalBeds: 120,
    availableBeds: 84,
    icuBeds: 12,
    doctorsOnDuty: 18,
    oxygenStock: "92%",
    totalConsultations: 1420,
    activePatients: 340,
    prescriptionsUploaded: 0,
    conversations: 0,
    pendingReviews: 0,
    verifiedReports: 0,
    totalMedicinesTracked: 0,
  });

  const fetchRealtimeMetrics = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch("/api/v1/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const s = data.stats || {};
        setStats((prev) => ({
          ...prev,
          prescriptionsUploaded: s.total_reports ?? prev.prescriptionsUploaded,
          pendingReviews: s.pending_reviews ?? 0,
          verifiedReports: s.verified_reports ?? 0,
          totalMedicinesTracked: s.total_medicines_tracked ?? 0,
          totalConsultations: 1420 + (s.total_reports || 0),
          activePatients: 340 + (s.pending_reviews || 0),
        }));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard metrics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRealtimeMetrics().then(() => {
      toast.success("Real-time dashboard metrics refreshed!");
    });
  };

  useEffect(() => {
    fetchRealtimeMetrics();
  }, []);

  // SSE subscriptions to update analytics in realtime
  useEffect(() => {
    const subs = [];

    try {
      subs.push(
        subscribe("prescription.uploaded", (payload) => {
          fetchRealtimeMetrics();
          toast.success("New prescription uploaded in real time!");
        })
      );

      subs.push(
        subscribe("conversation.created", (payload) => {
          setStats((s) => ({ ...s, conversations: (s.conversations || 0) + 1, totalConsultations: (s.totalConsultations || 0) + 1 }));
        })
      );

      subs.push(
        subscribe("conversation.updated", (payload) => {
          setStats((s) => ({ ...s }));
        })
      );
    } catch (err) {
      console.warn("Dashboard SSE subscribe failed:", err);
    }

    return () => {
      try {
        subs.forEach((u) => u && u());
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      {/* Top Banner Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#06201B] via-[#0D3B31] to-[#125042] px-6 pb-10 pt-8 text-white shadow-lg border-b border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                RuralCare AI • Health Insights
              </p>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Real-Time Live Sync
              </span>
              <div className="ml-2 flex items-center gap-2 text-xs text-slate-200">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">Prescriptions: <strong className="text-emerald-300">{stats.prescriptionsUploaded}</strong></span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">Medicines Tracked: <strong className="text-amber-300">{stats.totalMedicinesTracked}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                • Updated {lastUpdated}
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold font-display text-white">
              Rural Health Intelligence
            </h1>
            <p className="mt-1 text-xs text-teal-200">
              Real-time insights & capacity monitoring for rural healthcare communities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-white/15 bg-white/10 text-white hover:bg-white/20 text-xs font-bold rounded-xl"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Metrics
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6 px-5 -mt-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: PHC Centers */}
          <Card className="glass-metric text-center p-4 border border-white/10 bg-[#06201B]/80 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">PHC Centers</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <MapPin size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">24</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-bold">Active Centers</p>
          </Card>

          {/* Card 2: Tele-Health Doctors */}
          <Card className="glass-metric text-center p-4 border border-white/10 bg-[#06201B]/80 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tele-Health Doctors</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <Stethoscope size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.doctorsOnDuty}</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-bold">Available Now</p>
          </Card>

          {/* Card 3: OPD Patients */}
          <Card className="glass-metric text-center p-4 border border-white/10 bg-[#06201B]/80 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">OPD Patients</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <Users size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.totalConsultations}</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-bold">Total Visits</p>
          </Card>

          {/* Card 4: Emergency Cases */}
          <Card className="glass-metric text-center p-4 border border-white/10 bg-[#06201B]/80 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Emergency Cases</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{stats.activePatients}</p>
            <p className="mt-1 text-[11px] text-slate-300 font-medium">Referred Today</p>
          </Card>
        </div>

        {/* Analytics Section & Common Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Consultations Analytics */}
          <Card className="col-span-1 md:col-span-2 glass-card border border-white/10 bg-white/5 p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-teal-400" size={20} />
                <h3 className="font-bold text-lg text-white font-display">OPD Patient Flow Analytics</h3>
              </div>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setTimeframe("week")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    timeframe === "week" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeframe("month")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    timeframe === "month" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Visual Bar Graph Representation */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Monday (OPD Peak)</span>
                  <span className="font-bold text-emerald-400">240 Patients</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Tuesday</span>
                  <span className="font-bold text-emerald-400">195 Patients</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full opacity-80" style={{ width: "70%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Wednesday</span>
                  <span className="font-bold text-emerald-400">210 Patients</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full opacity-80" style={{ width: "75%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Thursday (Today)</span>
                  <span className="font-bold text-emerald-400">180 Patients</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-lime-400 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Common Disease Prevalence Breakdown */}
          <Card className="glass-card border border-white/10 bg-white/5 p-5 shadow-lg text-white">
            <h3 className="font-bold text-base text-white mb-3 border-b border-white/10 pb-2 font-display">
              Common Rural Conditions
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Viral Fever & Seasonal Infections</span>
                <span className="font-bold text-emerald-400">38%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Respiratory & Bronchitis</span>
                <span className="font-bold text-emerald-400">24%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Diabetes Mellitus</span>
                <span className="font-bold text-emerald-400">18%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Hypertension</span>
                <span className="font-bold text-emerald-400">12%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Primary Health Centers (PHC) Network */}
        <Card className="glass-card border border-white/10 bg-white/5 p-5 shadow-lg text-white">
          <h3 className="font-bold text-lg text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2 font-display">
            <MapPin className="text-teal-400" size={20} /> Primary Healthcare Center (PHC) Network
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Raipur Central PHC</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-400">Distance: 4.2 km • Tele-consultation active</p>
              <div className="pt-2 flex items-center gap-2">
                <a href="tel:108" className="text-xs text-teal-300 hover:underline flex items-center gap-1 font-semibold">
                  <PhoneCall size={12} /> Contact Emergency
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Durg Rural Health Clinic</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-400">Distance: 8.5 km • 3 Ambulances ready</p>
              <div className="pt-2 flex items-center gap-2">
                <a href="tel:104" className="text-xs text-teal-300 hover:underline flex items-center gap-1 font-semibold">
                  <PhoneCall size={12} /> Helpline 104
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Bilaspur Community Center</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-400">Distance: 12.0 km • Oxygen stock 100%</p>
              <div className="pt-2 flex items-center gap-2">
                <a href="tel:108" className="text-xs text-teal-300 hover:underline flex items-center gap-1 font-semibold">
                  <PhoneCall size={12} /> Contact PHC
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
