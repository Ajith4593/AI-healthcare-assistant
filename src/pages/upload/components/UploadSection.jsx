import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  Camera,
  FileText,
  Sparkles,
  RotateCw,
  SunMedium,
  Contrast,
  Languages,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import CameraCapture from "./CameraCapture";
import { SAMPLE_PRESCRIPTIONS } from "../utils/samplePrescriptions";

const OCR_LANGUAGES = [
  { code: "eng", name: "English (Default)" },
  { code: "hin", name: "Hindi (हिन्दी)" },
  { code: "mar", name: "Marathi (मराठी)" },
  { code: "tel", name: "Telugu (తెలుగు)" },
  { code: "tam", name: "Tamil (தமிழ்)" },
  { code: "ben", name: "Bengali (বাংলা)" },
  { code: "guj", name: "Gujarati (ગુજરાતી)" },
  { code: "kan", name: "Kannada (ಕನ್ನಡ)" },
  { code: "mal", name: "Malayalam (മലയാളം)" },
  { code: "pan", name: "Punjabi (ਪੰਜਾਬੀ)" },
];

function UploadSection({
  onImageChange,
  onExtract,
  onLoadSample,
  selectedLanguage,
  onLanguageChange,
  imageFilters,
  onFilterChange,
  activeFileName,
  activeFileSize,
  isProcessing,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "application/pdf",
  ];

  const validateAndSend = (file) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload an image (JPG, PNG, WebP) or PDF prescription file.");
      return;
    }
    setError("");
    onImageChange({ target: { files: [file] } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSend(droppedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSend(selectedFile);
  };

  const handleCameraCapture = (file) => {
    validateAndSend(file);
    setIsCameraModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Language Picker */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 font-display">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
                <FileText className="h-5 w-5" />
              </div>
              Understand Your Prescription
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Photograph or upload your printed prescription, doctor clinic note, or multi-page medical PDF report
            </p>
          </div>

          {/* OCR Primary Language Select */}
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-sm shrink-0">
            <Languages size={16} className="text-teal-300 shrink-0" />
            <span className="text-xs font-bold text-slate-200">Audio & OCR Language:</span>
            <select
              value={selectedLanguage || "eng"}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-[#06201b] text-xs font-extrabold text-teal-200 rounded-xl px-2.5 py-1 border border-white/15 outline-none cursor-pointer focus:ring-2 focus:ring-teal-400"
            >
              {OCR_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-Click Quick Sample Prescriptions */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 text-xs font-extrabold text-teal-200">
            <Sparkles size={15} className="text-amber-400" />
            <span>Try 1-Click Medical Samples (Instant Demo Test):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_PRESCRIPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onLoadSample(s)}
                className="text-left p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm hover:shadow-md transition-all group scale-100 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    {s.badge}
                  </span>
                </div>
                <p className="font-extrabold text-xs text-white mt-2 line-clamp-1 group-hover:text-teal-300">
                  {s.title}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                  {s.patient}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dominant Dual Hero Action Cards: Camera Scan & Upload Document */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Camera Scan Card */}
        <button
          type="button"
          onClick={() => setIsCameraModalOpen(true)}
          className="glass-card-hover p-6 rounded-3xl text-left border border-teal-500/30 bg-[#06201B]/80 hover:bg-[#06201B] flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40 shadow-lg">
              <Camera size={24} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">📷 Camera Scan</h3>
              <p className="text-xs text-slate-300 font-medium">Snap live photo of paper prescription</p>
            </div>
          </div>
          <div className="w-full btn-vibrant-primary py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform mt-2">
            <Camera size={16} /> Open Camera
          </div>
        </button>

        {/* Upload Document Card */}
        <label className="glass-card-hover p-6 rounded-3xl text-left border border-amber-500/30 bg-[#06201B]/80 hover:bg-[#06201B] flex flex-col justify-between group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40 shadow-lg">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">📄 Upload Document</h3>
              <p className="text-xs text-slate-300 font-medium">JPG, PNG, WebP, or Multi-page PDF</p>
            </div>
          </div>
          <div className="w-full btn-amber-primary py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform mt-2">
            <UploadCloud size={16} /> Select File from Device
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.bmp,.tiff,.pdf,image/*,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </div>

        {/* Selected file badge */}
        {activeFileName && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-teal-400/30 text-xs text-teal-200 shadow-md">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="font-extrabold">{activeFileName}</span>
            {activeFileSize && <span className="text-slate-400 font-medium">({activeFileSize})</span>}
          </div>
        )}

        {/* Processing State Progress Indicator */}
        {isProcessing && (
          <div className="mt-4 p-4 rounded-2xl bg-[#06201B] border border-teal-500/40 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-teal-300">
              <span className="flex items-center gap-2">
                <FileText size={15} className="animate-pulse text-amber-400" />
                📄 Processing prescription... Reading document
              </span>
              <span>80%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-[80%] animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-300">Applying OCR filters and extracting dosages...</p>
          </div>
        )}

        {/* Detailed OCR Error & Retry State */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-300">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>We couldn't read this document properly.</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 pl-6 list-disc font-medium">
              <li>Use better lighting when taking the photo</li>
              <li>Place the prescription flat on a surface</li>
              <li>Ensure doctor's handwriting or printed text is clear</li>
            </ul>
            <p className="text-[11px] text-rose-300 font-semibold pt-1">{error}</p>
          </div>
        )}

      {/* Image Preprocessing / Enhancement Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-teal-100/80 dark:border-teal-800/60">
        <div className="flex items-center gap-2 text-xs text-teal-950 dark:text-white font-extrabold">
          <Contrast size={16} className="text-teal-600 dark:text-emerald-400" />
          <span>Image Pre-Filters (Enhances Faint Handwriting & Scans):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange({ rotation: ((imageFilters?.rotation || 0) + 90) % 360 })}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50 text-xs font-bold text-slate-700 dark:text-slate-200 border border-teal-200 dark:border-teal-700 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCw size={13} /> Rotate 90° ({imageFilters?.rotation || 0}°)
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ highContrast: !imageFilters?.highContrast })}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border shadow-sm transition-all ${
              imageFilters?.highContrast
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 border-teal-200 dark:border-teal-700"
            }`}
          >
            <SunMedium size={13} className="inline mr-1" /> High Contrast
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ grayscale: !imageFilters?.grayscale })}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border shadow-sm transition-all ${
              imageFilters?.grayscale
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 border-teal-200 dark:border-teal-700"
            }`}
          >
            Grayscale
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ invert: !imageFilters?.invert })}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border shadow-sm transition-all ${
              imageFilters?.invert
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 border-teal-200 dark:border-teal-700"
            }`}
          >
            Invert
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ rotation: 0, grayscale: false, highContrast: false, invert: false })}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Extract Action Button */}
      <Button
        onClick={onExtract}
        disabled={isProcessing}
        className="w-full btn-vibrant-primary h-14 rounded-2xl text-base font-extrabold shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2.5"
      >
        <Sparkles size={20} className="text-amber-300 animate-pulse" />
        {isProcessing ? "Processing & Extracting Medical Data..." : "Run Optical Character Recognition (OCR Scan)"}
      </Button>

      {/* Camera Capture Modal */}
      {isCameraModalOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraModalOpen(false)}
        />
      )}
    </div>
  );
}

export default UploadSection;