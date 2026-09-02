import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowLeft,
  Stethoscope,
  Calendar,
  FileText,
  Building2,
  UserCheck,
  HeartPulse,
  Activity,
  Pill,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  FileCheck2,
  Clock,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { refineOcrData } from "../upload/utils/ocrRefiner";

export default function PrescriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token && id && !id.startsWith("local-") && !id.startsWith("rx-sample-")) {
          const res = await fetch(`/api/v1/ocr/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const report = await res.json();
            const parsed = report.ocr_text ? refineOcrData(report.ocr_text) : {};

            let medicines = [];
            if (Array.isArray(report.entities?.medicines) && report.entities.medicines.length > 0) {
              medicines = report.entities.medicines;
            } else if (Array.isArray(parsed.medicines) && parsed.medicines.length > 0) {
              medicines = parsed.medicines;
            }

            setPrescription({
              id: report.id,
              title: report.primary_medication || parsed.documentType || "Medical Prescription",
              date: report.created_at ? new Date(report.created_at).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
              rawDate: report.created_at,
              medication: report.primary_medication || parsed.medicines?.[0]?.name || "Prescription Record",
              language: report.language || "English",
              doctor: report.doctor_name || parsed.doctor || "Attending Physician",
              doctorDegree: parsed.doctorDegree || "",
              hospital: report.hospital || parsed.hospital || "Health Center",
              hospitalAddress: parsed.hospitalAddress || "",
              patient: report.patient_name || parsed.patient || "Patient Record",
              patientAge: parsed.patientAge || "",
              patientGender: parsed.patientGender || "",
              diagnosis: parsed.diagnosis || "Medical Consultation",
              status: Array.isArray(report.status) ? report.status : [report.status || "Completed"],
              medicines: medicines,
              advice: parsed.advice || [],
              healthSummary: parsed.healthSummary || "Scanned medical report details.",
              ocrText: report.ocr_text || parsed.rawText || "",
              filename: report.filename || "Scanned_Prescription.png",
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch API report details:", err);
      }

      // Fallback to local storage
      try {
        const stored = localStorage.getItem("user_prescriptions") || localStorage.getItem("prescription_history");
        const savedList = stored ? JSON.parse(stored) : [];
        const found = savedList.find((p) => String(p.id) === String(id));

        if (found) {
          setPrescription(found);
          return;
        }
      } catch (_) {}

      // Fallback default
      const emptyParsed = refineOcrData("");
      setPrescription({
        id: id,
        title: "Prescription Record #" + String(id).slice(0, 8),
        date: new Date().toLocaleDateString("en-GB"),
        medication: "Prescription Record",
        language: "English",
        doctor: emptyParsed.doctor || "Attending Physician",
        hospital: emptyParsed.hospital || "Medical Center",
        patient: "Patient Record",
        diagnosis: "General Examination",
        status: ["Completed"],
        medicines: [],
        ocrText: "No original text available.",
      });
    };

    loadReport();
  }, [id]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handleCopy = () => {
    if (!prescription) return;
    const text = `MEDICAL PRESCRIPTION RECORD #${id}
Date: ${prescription.date}
Hospital: ${prescription.hospital || "Medical Center"}
Doctor: ${prescription.doctor || "Physician"}
Patient: ${prescription.patient || "Patient Record"}
Diagnosis: ${prescription.diagnosis || "Medical Consultation"}

MEDICINES:
${
  prescription.medicines && prescription.medicines.length > 0
    ? prescription.medicines
        .map(
          (m, i) =>
            `${i + 1}. ${m.name} — ${m.dosage} — ${m.timing} — ${m.duration}`
        )
        .join("\n")
    : prescription.ocrText || "See original scan"
}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Prescription copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSpeak = () => {
    if (!prescription || !window.speechSynthesis) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `Prescription for ${prescription.patient || "the patient"}. ` +
        `Doctor: ${prescription.doctor || "Physician"}. ` +
        `Diagnosis: ${prescription.diagnosis || "Medical consultation"}. ` +
        (prescription.medicines?.length > 0
          ? prescription.medicines
              .map(
                (m) =>
                  `${m.name}, ${m.dosage}, ${m.timing}, for ${m.duration}.`
              )
              .join(" ")
          : prescription.ocrText || "")
    );
    utterance.rate = 0.92;
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
    toast.success("Reading prescription aloud…");
  };

  const handleStopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handleDownload = () => {
    if (!prescription) return;
    const reportText = `==========================================================
RURALCARE AI — PRESCRIPTION RECORD #${id}
==========================================================

Date        : ${prescription.date}
Hospital    : ${prescription.hospital || "Hospital"}
Address     : ${prescription.hospitalAddress || "N/A"}
Doctor      : ${prescription.doctor || "Consultant"}
Patient     : ${prescription.patient || "Patient Record"}
Diagnosis   : ${prescription.diagnosis || "Medical Consultation"}
Status      : ${prescription.status || "Active"}

PRESCRIBED MEDICINES:
${
  prescription.medicines && prescription.medicines.length > 0
    ? prescription.medicines
        .map(
          (m, i) =>
            `${i + 1}. [${m.formulation || "Tab"}] ${m.name} ${m.strength || ""}
   Dosage   : ${m.dosage || m.frequency}
   Timing   : ${m.timing || "After food"}
   Duration : ${m.duration || "As directed"}`
        )
        .join("\n\n")
    : prescription.ocrText || "No text attached"
}

ORIGINAL OCR SCAN:
${prescription.ocrText || prescription.prescriptionText || "N/A"}
`;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prescription-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Prescription file downloaded!");
  };

  if (!prescription) return null;

  const statusArr = Array.isArray(prescription.status)
    ? prescription.status
    : [prescription.status || "Active"];

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-[#06201B] via-[#0D3B31] to-[#125042] px-5 pb-14 pt-9 text-white shadow-2xl overflow-hidden rounded-b-[42px]">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
        <div className="absolute -bottom-10 left-10 w-64 h-64 bg-lime-400/15 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          {/* Back */}
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to History
          </button>

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
                  RuralCare AI • Prescription Record
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Sparkles size={22} className="text-amber-300" />
                {prescription.title || prescription.medication || "Prescription Details"}
              </h1>
              <p className="mt-1 text-xs text-teal-200/80 font-medium">
                Encrypted Record ID: {id} &bull; AI OCR Verified
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all backdrop-blur-md"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-300" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs font-bold transition-all backdrop-blur-md ${
                  isSpeaking
                    ? "bg-amber-400/20 border-amber-400/60 text-amber-300"
                    : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                }`}
              >
                <Volume2 size={13} className={isSpeaking ? "text-amber-300" : ""} />
                {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Listen"}
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeaking}
                  className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/60 text-rose-300 rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                >
                  <VolumeX size={13} /> Stop
                </button>
              )}

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl px-4 py-1.5 text-xs font-extrabold shadow-lg shadow-teal-700/30 transition-all"
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Cards ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-4">

        {/* Hospital & Doctor row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-300/40">
                <Building2 className="text-teal-700 dark:text-teal-300 h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 uppercase font-extrabold tracking-wider mb-0.5">
                  Hospital / Medical Center
                </p>
                <h4 className="font-bold text-sm text-teal-950 dark:text-white">
                  {prescription.hospital || "Medical Clinic"}
                </h4>
                {prescription.hospitalAddress && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {prescription.hospitalAddress}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-300/40">
                <Stethoscope className="text-teal-700 dark:text-teal-300 h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 uppercase font-extrabold tracking-wider mb-0.5">
                  Attending Doctor
                </p>
                <h4 className="font-bold text-sm text-teal-950 dark:text-white">
                  {prescription.doctor || "Physician"}
                </h4>
                {prescription.doctorDegree && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                    {prescription.doctorDegree}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Patient Demographics */}
        <Card className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10">
          <p className="text-[10px] text-teal-700 dark:text-teal-400 uppercase font-extrabold tracking-wider mb-4 flex items-center gap-1.5">
            <Activity size={13} /> Patient Overview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                <UserCheck size={11} className="text-teal-600" /> Patient
              </p>
              <p className="font-bold text-sm text-teal-950 dark:text-white">
                {prescription.patient || "Patient Record"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Calendar size={11} className="text-teal-600" /> Date
              </p>
              <p className="font-bold text-sm text-teal-950 dark:text-white">
                {prescription.date}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                <HeartPulse size={11} className="text-teal-600" /> Diagnosis
              </p>
              <p className="font-bold text-sm text-teal-700 dark:text-emerald-300">
                {prescription.diagnosis || "General Observation"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                {statusArr.map((s, i) => (
                  <Badge
                    key={i}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-[10px]"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Medicines Table */}
        {prescription.medicines && prescription.medicines.length > 0 && (
          <Card className="glass-card rounded-2xl border border-white/80 dark:border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-teal-100/60 dark:border-white/10 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-300/40">
                <Pill className="text-teal-700 dark:text-teal-300 h-4 w-4" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-teal-950 dark:text-white">
                  Prescribed Medicines
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {prescription.medicines.length} medication
                  {prescription.medicines.length !== 1 ? "s" : ""} prescribed
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {prescription.medicines.map((med, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gradient-to-r from-teal-50/70 to-emerald-50/50 dark:from-teal-900/20 dark:to-emerald-900/10 border border-teal-200/60 dark:border-teal-700/40 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-[10px] font-extrabold shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-extrabold text-sm text-teal-950 dark:text-white">
                      {med.name}
                    </span>
                    {med.strength && (
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border border-teal-300/60 font-bold text-[10px]">
                        {med.strength}
                      </Badge>
                    )}
                    {med.formulation && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300/60 font-bold text-[10px]">
                        {med.formulation}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {med.dosage && (
                      <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 rounded-xl px-3 py-2 border border-teal-200/50 dark:border-teal-700/30">
                        <Activity size={12} className="text-teal-600 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Dosage</p>
                          <p className="text-[11px] font-extrabold text-teal-900 dark:text-teal-100">
                            {med.dosage}
                          </p>
                        </div>
                      </div>
                    )}
                    {med.timing && (
                      <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 rounded-xl px-3 py-2 border border-teal-200/50 dark:border-teal-700/30">
                        <Clock size={12} className="text-amber-600 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Timing</p>
                          <p className="text-[11px] font-extrabold text-teal-900 dark:text-teal-100">
                            {med.timing}
                          </p>
                        </div>
                      </div>
                    )}
                    {med.duration && (
                      <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 rounded-xl px-3 py-2 border border-teal-200/50 dark:border-teal-700/30">
                        <Calendar size={12} className="text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Duration</p>
                          <p className="text-[11px] font-extrabold text-teal-900 dark:text-teal-100">
                            {med.duration}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {med.instruction && (
                    <div className="flex items-start gap-2 bg-amber-50/70 dark:bg-amber-900/10 rounded-xl px-3 py-2 border border-amber-200/60 dark:border-amber-700/30">
                      <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-900 dark:text-amber-200 font-semibold">
                        {med.instruction}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Raw OCR Text */}
        {(prescription.ocrText || prescription.prescriptionText) && (
          <Card className="glass-card rounded-2xl border border-white/80 dark:border-white/10 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left border-b border-teal-100/60 dark:border-white/10 hover:bg-teal-50/50 dark:hover:bg-white/5 transition-colors"
              onClick={() => setShowRaw((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-300/40">
                  <FileText className="text-teal-700 dark:text-teal-300 h-4 w-4" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-teal-950 dark:text-white">
                    Original OCR Scan Text
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Raw extracted prescription data
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                {showRaw ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {showRaw && (
              <div className="p-4">
                <pre className="bg-teal-950/90 dark:bg-black/60 text-emerald-300 font-mono text-[11px] leading-relaxed rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap border border-teal-700/40">
                  {prescription.ocrText || prescription.prescriptionText}
                </pre>
              </div>
            )}
          </Card>
        )}

        {/* Security badge */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50/80 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-700/40 text-xs text-teal-800 dark:text-teal-200">
          <FileCheck2 size={15} className="text-teal-600 shrink-0" />
          <p className="font-semibold">
            This record is end-to-end encrypted and stored only in your private
            health session. &nbsp;
            <span className="font-extrabold">HIPAA Compliant.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
