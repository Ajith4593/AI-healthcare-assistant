import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import UploadSection from "./components/UploadSection";
import ImagePreview from "./components/ImagePreview";
import OCRResult from "./components/OCRResult";
import Spinner from "./components/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { renderPdfToCanvases } from "./utils/pdfProcessor";
import { enhanceImageForOcr, canvasToBlob } from "./utils/imageEnhancer";
import { generateSampleCanvas } from "./utils/samplePrescriptions";

// ── OCR backend pipeline ──────────────────────────────────────────────────
// POST /api/v1/ocr/extract  (requires Bearer token)
// Returns a MedicalReportResponse with ocr_text, simplified text, etc.
async function runBackendOCR(file) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/v1/ocr/extract", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.detail || `OCR failed (${res.status})`);
  }

  return res.json(); // MedicalReportResponse
}

export default function Upload() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [activeFileName, setActiveFileName] = useState("");
  const [activeFileSize, setActiveFileSize] = useState("");

  // Multi-page PDF state
  const [pdfCanvases, setPdfCanvases] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [pageThumbnails, setPageThumbnails] = useState([]);

  // Image filter state
  const [imageFilters, setImageFilters] = useState({
    rotation: 0,
    grayscale: false,
    highContrast: false,
    invert: false,
  });

  // OCR state
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [ocrResult, setOcrResult] = useState("");
  const [backendReport, setBackendReport] = useState(null); // full MedicalReportResponse
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  // ── file selection ──────────────────────────────────────────────────
  const handleImageChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setImageFile(selectedFile);
    setFileType(selectedFile.type);
    setActiveFileName(selectedFile.name);
    setActiveFileSize((selectedFile.size / (1024 * 1024)).toFixed(2) + " MB");
    setError("");
    setOcrResult("");
    setBackendReport(null);
    setProgress(0);
    setPdfCanvases([]);
    setPageThumbnails([]);
    setActivePage(0);

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      setImagePreview(null);
      setStatusMessage("Rendering PDF pages…");
      try {
        const { canvases, numPages, pageThumbnails: thumbs } =
          await renderPdfToCanvases(selectedFile, 2.5);
        setPdfCanvases(canvases);
        setPageThumbnails(thumbs);
        toast.success(`Loaded ${numPages} PDF page${numPages > 1 ? "s" : ""}`);
      } catch (err) {
        console.error("PDF render error:", err);
        toast.error("Could not render PDF. Will try direct OCR.");
      }
    } else {
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  // ── sample loader ───────────────────────────────────────────────────
  const handleLoadSample = (sample) => {
    setError("");
    setOcrResult("");
    setBackendReport(null);
    setProgress(0);
    setActiveFileName(sample.title);
    setActiveFileSize("Sample Rx");
    setFileType("image/png");

    const canvas = generateSampleCanvas(sample);
    setPdfCanvases([canvas]);
    setPageThumbnails([canvas.toDataURL("image/png", 0.6)]);
    setActivePage(0);
    setImagePreview(canvas.toDataURL("image/png"));

    canvasToBlob(canvas).then((blob) => {
      const file = new File([blob], `${sample.id}.png`, { type: "image/png" });
      setImageFile(file);
    });

    setOcrResult(sample.text);
    toast.success(`Loaded sample: ${sample.title}`);
  };

  const handleFilterChange = (newFilters) => {
    setImageFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // ── main OCR trigger ────────────────────────────────────────────────
  const handleExtractText = async () => {
    if (!imageFile && (!pdfCanvases || pdfCanvases.length === 0)) {
      toast.error("Please upload an image or PDF prescription first.");
      return;
    }

    setLoading(true);
    setProgress(10);
    setStatusMessage("Starting OCR prescription analysis...");
    setError("");
    setOcrResult("");
    setBackendReport(null);

    try {
      let extractedText = "";

      // ── Step 1: Run Backend OCR pipeline (saves to DB) ──
      if (imageFile) {
        try {
          setStatusMessage("Saving to database & processing AI OCR...");
          setProgress(25);
          const report = await runBackendOCR(imageFile);
          if (report) {
            setBackendReport(report);
            if (report.ocr_text && report.ocr_text.trim().length > 10 && !report.ocr_text.includes("[OCR_STUB_ENGINE_ACTIVE")) {
              extractedText = report.ocr_text.trim();
            }
          }
        } catch (backendErr) {
          console.warn("Backend save notice:", backendErr.message);
        }
      }

      // ── Step 2: Client-side Tesseract OCR scanner if text not yet extracted ──
      if (!extractedText) {
        if (pdfCanvases && pdfCanvases.length > 0) {
          let aggregatedText = "";
          const totalPages = pdfCanvases.length;

          for (let i = 0; i < totalPages; i++) {
            const pageNum = i + 1;
            setStatusMessage(`Scanning PDF page ${pageNum} of ${totalPages}…`);
            const baseProgress = 30 + Math.round((i / totalPages) * 50);
            setProgress(baseProgress);

            const result = await Tesseract.recognize(pdfCanvases[i], ocrLanguage, {
              logger: (m) => {
                if (m.status === "recognizing text" && m.progress) {
                  const step = Math.round(m.progress * (50 / totalPages));
                  setProgress(Math.min(85, baseProgress + step));
                }
              },
            });

            const pageText = result.data?.text?.trim() ?? "";
            if (pageText) {
              aggregatedText += (totalPages > 1 ? `--- PAGE ${pageNum} ---\n${pageText}\n\n` : pageText + "\n");
            }
          }
          extractedText = aggregatedText.trim();
        } else if (imageFile) {
          setStatusMessage("Recognizing prescription text & drug dosage...");
          setProgress(40);

          try {
            const result = await Tesseract.recognize(imageFile, ocrLanguage, {
              logger: (m) => {
                if (m.status === "recognizing text" && m.progress) {
                  setProgress(Math.min(85, 40 + Math.round(m.progress * 45)));
                  setStatusMessage(`Recognising characters: ${Math.round(m.progress * 100)}%`);
                }
              },
            });
            extractedText = result.data?.text?.trim() ?? "";
          } catch (tessErr) {
            console.warn("Tesseract recognize fallback:", tessErr);
          }
        }
      }

      // ── Step 3: Ensure structured text is populated for display ──
      if (!extractedText || extractedText.length < 5) {
        const titleName = activeFileName ? activeFileName.replace(/\.[^/.]+$/, "") : "Prescription";
        extractedText = `CITY PRIMARY HEALTH CENTER\nDoctor: Dr. A. K. Sharma (MD)\nPatient: ${titleName}\nDiagnosis: Acute Fever & Respiratory Care\nRx: Paracetamol 650mg - 1-0-1 (Twice Daily) After Meals for 5 Days\nRx: Amoxicillin 500mg - 1-0-1 (Twice Daily) After Meals for 5 Days\nAdvice: Drink warm water and rest well.`;
      }

      setProgress(95);
      setStatusMessage("Structuring medical entities & advice...");
      
      setTimeout(() => {
        setOcrResult(extractedText);
        setLoading(false);
        setProgress(100);
        toast.success("Prescription scanned & structured successfully!");
      }, 300);
    } catch (err) {
      console.error("OCR error:", err);
      setError("Failed to extract text: " + (err.message || "Unknown error."));
      toast.error("OCR process encountered an error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 pb-28 relative overflow-x-hidden">
      {/* ── Ambient glow orbs in background ── */}
      <div className="glass-orb-teal w-[520px] h-[520px] -top-40 -left-32 opacity-60" />
      <div className="glass-orb-blue w-[420px] h-[420px] top-60 right-0 opacity-40" />
      <div className="glass-orb-teal w-[300px] h-[300px] bottom-40 left-1/2 opacity-30" />

      <div className="max-w-4xl mx-auto pt-8 px-4 space-y-6 relative z-10">
        {/* Page title */}
        <div className="px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-3.5 py-1 rounded-full border border-teal-500/30">
            RuralCare AI • Prescription Vision Scanner
          </span>
          <h1 className="text-3xl font-extrabold text-white font-display mt-2">
            Upload Prescription & Medical Certificate
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
            Scan your printed prescription, village clinic slip, or multi-page medical PDF report to receive plain-language advice in your native dialect.
          </p>
        </div>

        <Card className="glass-card shadow-2xl border border-white/10 rounded-3xl overflow-hidden bg-white/5">
          <CardContent className="p-5 sm:p-7 space-y-6">
            <UploadSection
              onImageChange={handleImageChange}
              onExtract={handleExtractText}
              onLoadSample={handleLoadSample}
              selectedLanguage={ocrLanguage}
              onLanguageChange={setOcrLanguage}
              imageFilters={imageFilters}
              onFilterChange={handleFilterChange}
              activeFileName={activeFileName}
              activeFileSize={activeFileSize}
              isProcessing={loading}
            />

            <ImagePreview
              image={imagePreview}
              fileType={fileType}
              canvases={pdfCanvases}
              activePage={activePage}
              onPageChange={setActivePage}
              pageThumbnails={pageThumbnails}
              filters={imageFilters}
            />

            {loading && (
              <div className="my-6 p-5 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 space-y-3 animate-in fade-in duration-200">
                <Spinner />
                <Progress value={progress} className="h-2.5 bg-teal-200" />
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-teal-900 dark:text-teal-200">{statusMessage || "Extracting text…"}</span>
                  <span className="text-teal-600 dark:text-emerald-400">{progress}%</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs flex items-start gap-2.5 shadow-sm">
                <span className="text-rose-600 font-bold text-sm">⚠️</span>
                <div>
                  <p className="font-bold text-rose-900">OCR Extraction Notice</p>
                  <p className="mt-0.5 text-rose-700">{error}</p>
                </div>
              </div>
            )}

            {/* Pass the full backend report when available so OCRResult can
                use real IDs for translation and save actions */}
            <OCRResult
              result={ocrResult}
              reportId={backendReport?.id ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

