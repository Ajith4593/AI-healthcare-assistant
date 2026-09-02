import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import EmptyState from "@/components/common/EmptyState";
import PrescriptionCard from "@/components/cards/PrescriptionCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribe } from "@/lib/events";

export default function History() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Recent");

  // ── fetch history ──────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    let apiRecords = [];

    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await fetch("/api/v1/ocr", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          apiRecords = (Array.isArray(data) ? data : []).map((r) => {
            let statusArr = ["Completed"];
            if (Array.isArray(r.status)) {
              statusArr = r.status;
            } else if (typeof r.status === "string" && r.status.trim()) {
              statusArr = [r.status.charAt(0).toUpperCase() + r.status.slice(1)];
            }

            let dateStr = "—";
            if (r.created_at) {
              const d = new Date(r.created_at);
              if (!isNaN(d)) {
                dateStr = d.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              }
            }

            return {
              id: r.id,
              date: dateStr,
              rawDate: r.created_at || "",
              medication: r.primary_medication || r.filename || "Medical Record",
              language: "English",
              doctor: r.doctor_name || "Primary Care Physician",
              hospital: r.hospital || "Health Center",
              status: statusArr,
              needs_review: r.needs_review || false,
              ocr_confidence: r.ocr_confidence,
              filename: r.filename,
            };
          });
        }
      }
    } catch (err) {
      console.warn("Backend history fetch notice:", err);
    }

    // ── Check local storage prescriptions ───────────────────────────────
    let localRecords = [];
    try {
      const stored = localStorage.getItem("user_prescriptions") || localStorage.getItem("prescription_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localRecords = parsed.map((p) => ({
            id: p.id || "local-" + Math.random().toString(36).substring(2, 7),
            date: p.date || new Date().toLocaleDateString("en-GB"),
            rawDate: p.rawDate || new Date().toISOString(),
            medication: p.title || p.medication || p.primary_medication || "Prescription Record",
            language: p.language || "English",
            doctor: p.doctor || "Consulting Physician",
            hospital: p.hospital || "Community Health Center",
            status: Array.isArray(p.status) ? p.status : [p.status || "Completed"],
            filename: p.filename || "Scanned_Prescription.png"
          }));
        }
      }
    } catch (_) {}

    // Combine real-time database & local storage records
    const combined = [...apiRecords, ...localRecords];

    setPrescriptions(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── SSE: subscribe to prescription uploads to update history in realtime ──
  useEffect(() => {
    let unsub = null;
    try {
      unsub = subscribe("prescription.uploaded", (payload) => {
        try {
          const r = payload || {};
          const dateStr = r.created_at
            ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : new Date().toLocaleDateString("en-GB");

          const item = {
            id: r.id || "local-" + Math.random().toString(36).slice(2, 9),
            date: dateStr,
            rawDate: r.created_at || new Date().toISOString(),
            medication: r.primary_medication || r.filename || "Prescription Record",
            language: r.language || "English",
            doctor: r.doctor_name || "Consulting Physician",
            hospital: r.hospital || "Community Health Center",
            status: Array.isArray(r.status) ? r.status : [r.status || "Pending"],
            filename: r.filename || "uploaded_prescription.png",
          };

          setPrescriptions((prev) => [item, ...prev]);
          toast.success("New prescription uploaded");
        } catch (err) {
          console.warn("Failed to handle prescription.uploaded SSE:", err);
        }
      });
    } catch (err) {
      console.warn("SSE subscription failed:", err);
    }

    return () => {
      try {
        if (unsub) unsub();
      } catch {}
    };
  }, []);

  // ── delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription record?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (token && !String(id).startsWith("rx-sample") && !String(id).startsWith("local")) {
        await fetch(`/api/v1/ocr/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch (_) {}

    // Update local storage
    try {
      const stored = localStorage.getItem("user_prescriptions");
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(p => String(p.id) !== String(id));
        localStorage.setItem("user_prescriptions", JSON.stringify(filtered));
      }
    } catch (_) {}

    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Record removed.");
  };


  // ── filter + sort ────────────────────────────────────────────────────
  const filteredPrescriptions = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = prescriptions.filter((item) => {
      const matchSearch =
        q === "" ||
        (item.medication || "").toLowerCase().includes(q) ||
        (item.doctor || "").toLowerCase().includes(q) ||
        (item.hospital || "").toLowerCase().includes(q) ||
        (item.filename || "").toLowerCase().includes(q);

      const matchLang = languageFilter === "All" || item.language === languageFilter;
      const matchStatus =
        statusFilter === "All" ||
        (Array.isArray(item.status) ? item.status.includes(statusFilter) : item.status === statusFilter);

      return matchSearch && matchLang && matchStatus;
    });

    result = [...result].sort((a, b) => {
      const da = a.rawDate ? new Date(a.rawDate) : new Date(0);
      const db = b.rawDate ? new Date(b.rawDate) : new Date(0);
      return sortOrder === "Oldest" ? da - db : db - da;
    });

    return result;
  }, [prescriptions, search, languageFilter, statusFilter, sortOrder]);

  const clearFilters = () => {
    setSearch("");
    setLanguageFilter("All");
    setStatusFilter("All");
    setSortOrder("Recent");
  };



  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      <div className="max-w-4xl mx-auto px-4 pt-8 pb-10 relative z-10 space-y-6">
        {/* Page Header */}
        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-3.5 py-1 rounded-full border border-teal-500/30">
            {t("Medical Archives")}
          </span>
          <h1 className="text-3xl font-bold text-white font-display mt-2">
            {t("Medical Records")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {t("Your complete prescription, diagnosis summary, and OCR scan history")}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white/5 p-2 rounded-2xl border border-white/10 shadow-sm backdrop-blur-md">
          <Input
            placeholder={t("Search prescription, medicine, doctor, or OCR text...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white placeholder:text-white/40 text-xs sm:text-sm focus-visible:ring-0"
          />
        </div>

        {/* Filters */}
        <div className="grid gap-2.5 grid-cols-2 md:grid-cols-5">
          <select
            className="rounded-xl border border-white/10 bg-[#06201b] px-3 py-2 text-xs font-semibold text-white outline-none shadow-sm cursor-pointer"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="All">{t("All Languages")}</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Marathi">Marathi</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-[#06201b] px-3 py-2 text-xs font-semibold text-white outline-none shadow-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">{t("All Status")}</option>
            <option value="Completed">Completed</option>
            <option value="Simplified">Simplified</option>
            <option value="Translated">Translated</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-[#06201b] px-3 py-2 text-xs font-semibold text-white outline-none shadow-sm cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Recent">{t("Recent First")}</option>
            <option value="Oldest">{t("Oldest First")}</option>
          </select>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 shadow-sm"
          >
            {t("Clear Filters")}
          </Button>

          <Button
            variant="outline"
            onClick={fetchHistory}
            className="rounded-xl border-teal-500/40 bg-teal-900/40 text-xs font-bold text-teal-300 hover:bg-teal-800/50 shadow-sm"
          >
            ↻ Refresh
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-3.5">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-6 text-center text-rose-200 text-xs">
              <p className="font-bold text-sm mb-1">⚠️ Could not load history</p>
              <p>{error}</p>
              <Button
                onClick={fetchHistory}
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Retry
              </Button>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center shadow-sm">
              {prescriptions.length === 0 ? (
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <p className="font-bold text-white text-base">No prescriptions yet</p>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">Upload your first prescription to generate simplified healthcare advice.</p>
                  <Button
                    onClick={() => navigate("/upload")}
                    className="mt-5 btn-vibrant-primary font-bold text-xs rounded-xl shadow-sm px-5 py-2.5"
                  >
                    Upload Prescription
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-bold text-sm">No records match your filters</p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4 border-white/15 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    {t("Clear Filters")}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                date={prescription.date}
                medication={prescription.medication}
                language={prescription.language}
                doctor={prescription.doctor !== "—" ? prescription.doctor : undefined}
                status={prescription.status}
                onView={() => navigate(`/prescription/${prescription.id}`)}
                onDelete={() => handleDelete(prescription.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

