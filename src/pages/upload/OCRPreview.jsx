import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  CheckCircle2,
  Pill,
  Clock,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function OCRPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const reportData = location.state?.report || location.state?.ocrResult || {
    filename: "Prescription_Scan.jpg",
    doctor: "Dr. A. K. Sharma (MD, General Medicine)",
    hospital: "City Primary Health Center",
    patientName: "Patient Record",
    date: new Date().toLocaleDateString("en-GB"),
    diagnosis: "Mild Fever & Upper Respiratory Tract Infection",
    medicines: [
      { name: "Paracetamol 500mg", dosage: "1-0-1 (Twice Daily)", timing: "After Meals", duration: "5 Days", instruction: "Take after food with warm water." },
      { name: "Amoxicillin 500mg", dosage: "1-1-1 (Thrice Daily)", timing: "After Meals", duration: "5 Days", instruction: "Complete full 5 day course." },
      { name: "Cetirizine 10mg", dosage: "0-0-1 (Nightly)", timing: "At Bedtime", duration: "3 Days", instruction: "May cause slight drowsiness." }
    ],
    vitals: { bp: "120/80 mmHg", pulse: "76 bpm", temp: "99.2 °F" },
    advice: ["Drink plenty of warm water.", "Rest for 3 days.", "Avoid cold foods and beverages."],
    originalOCRText: "Rx Paracetamol 500mg BD 5 days, Amoxicillin 500mg TDS 5 days, Cetirizine 10mg HS 3 days. Adv: Warm water & rest."
  };

  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [audioObj, setAudioObj] = useState(null);

  const handlePlayVoice = async () => {
    if (isPlayingTTS && audioObj) {
      audioObj.pause();
      setIsPlayingTTS(false);
      return;
    }

    const textToSpeak = `Prescription Summary. Diagnosis: ${reportData.diagnosis}. Prescribed medicines: ${reportData.medicines.map(m => `${m.name}, ${m.dosage}`).join(". ")}. Advice: ${reportData.advice.join(". ")}`;

    try {
      setIsPlayingTTS(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language: "English" })
      });

      if (!res.ok) throw new Error("TTS streaming failed.");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => setIsPlayingTTS(false);
      audio.onerror = () => setIsPlayingTTS(false);

      setAudioObj(audio);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setIsPlayingTTS(false);
      toast.error("Could not play voice audio.");
    }
  };

  const handleNavigateToResults = () => {
    navigate("/results", { state: { resultData: reportData } });
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="glass-orb-teal w-[500px] h-[500px] -top-32 -left-32 opacity-50" />
      <div className="glass-orb-blue w-[400px] h-[400px] top-60 right-0 opacity-40" />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-12 relative z-10 space-y-6">
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayVoice}
              className={`rounded-xl text-xs font-bold border-teal-500/30 ${isPlayingTTS ? "bg-rose-500/20 text-rose-300 border-rose-400/40" : "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"}`}
            >
              {isPlayingTTS ? <VolumeX size={15} className="mr-1.5" /> : <Volume2 size={15} className="mr-1.5" />}
              {isPlayingTTS ? "Stop Voice" : "Listen Audio"}
            </Button>

            <Button
              size="sm"
              onClick={handleNavigateToResults}
              className="btn-vibrant-primary rounded-xl text-xs font-bold"
            >
              <Sparkles size={15} className="mr-1.5" /> Simplify Advice
            </Button>
          </div>
        </div>

        {/* Title Banner */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#06201B]/80 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Clinical OCR Digitized
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Date: {reportData.date}
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-white">
            {reportData.diagnosis || "Medical Prescription Digitization"}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <Stethoscope size={14} className="text-teal-400" />
              {reportData.doctor}
            </span>
            <span>•</span>
            <span>{reportData.hospital}</span>
          </div>
        </div>

        {/* Medicines Section */}
        <Card className="glass-card border border-white/10 bg-white/5 p-6 rounded-3xl text-white space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <Pill size={18} className="text-amber-400" />
              Prescribed Medications ({reportData.medicines?.length || 0})
            </h3>
          </div>

          <div className="space-y-3">
            {reportData.medicines?.map((med, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-teal-200">{med.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-400/30">
                    {med.dosage}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-teal-400" /> Timing: {med.timing}
                  </span>
                  <span>Duration: {med.duration}</span>
                </div>

                {med.instruction && (
                  <p className="text-xs text-slate-400 italic bg-black/20 p-2 rounded-xl border border-white/5">
                    💡 {med.instruction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Doctor's Advice & Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vitals */}
          <Card className="glass-card border border-white/10 bg-white/5 p-5 rounded-3xl text-white space-y-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-2">
              🩺 Recorded Patient Vitals
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-white/5">
                <span className="text-slate-300">Blood Pressure (BP):</span>
                <span className="font-bold text-emerald-400">{reportData.vitals?.bp || "120/80 mmHg"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5">
                <span className="text-slate-300">Pulse Rate:</span>
                <span className="font-bold text-emerald-400">{reportData.vitals?.pulse || "76 bpm"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5">
                <span className="text-slate-300">Temperature:</span>
                <span className="font-bold text-amber-400">{reportData.vitals?.temp || "98.6 °F"}</span>
              </div>
            </div>
          </Card>

          {/* Advice */}
          <Card className="glass-card border border-white/10 bg-white/5 p-5 rounded-3xl text-white space-y-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-2">
              📋 Clinical Recommendations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {reportData.advice?.map((adv, aIdx) => (
                <li key={aIdx} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Original OCR Text Accordion */}
        {reportData.originalOCRText && (
          <Card className="glass-card border border-white/10 bg-white/5 p-5 rounded-3xl text-white space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scanned Raw OCR Text
            </h4>
            <pre className="text-xs text-slate-300 font-mono bg-black/40 p-3 rounded-2xl whitespace-pre-wrap overflow-x-auto border border-white/5">
              {reportData.originalOCRText}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}
