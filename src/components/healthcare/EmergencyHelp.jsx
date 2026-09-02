import React, { useState } from "react";
import { PhoneCall, ShieldAlert, X, AlertCircle } from "lucide-react";

export default function EmergencyHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-extrabold shadow-md shadow-rose-900/40 border border-rose-400/40 transition-all hover:scale-105"
      >
        <ShieldAlert size={14} className="animate-pulse text-amber-300" />
        <span>108 Emergency</span>
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-card border border-rose-500/40 bg-[#06201B] text-white shadow-2xl space-y-5">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <PhoneCall size={24} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  Need Urgent Medical Help?
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Toll-free emergency helplines for rural India
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="tel:108"
                className="flex items-center justify-between p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall size={20} />
                  <div>
                    <p className="text-base font-extrabold">Call 108 Emergency</p>
                    <p className="text-[11px] text-rose-200 font-normal">Ambulance & Critical Care Response</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white/20 text-xs">Dial 108</span>
              </a>

              <a
                href="tel:104"
                className="flex items-center justify-between p-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-lg shadow-amber-900/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall size={20} />
                  <div>
                    <p className="text-base font-extrabold">Call 104 Health Helpline</p>
                    <p className="text-[11px] text-amber-200 font-normal">Medical Advice & Clinic Assistance</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white/20 text-xs">Dial 104</span>
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                Both 108 and 104 are free government services available 24/7 in all Indian states.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
