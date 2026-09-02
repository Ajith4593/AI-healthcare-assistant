import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

export default function ConnectivityStatus() {
  const [status, setStatus] = useState("online"); // 'online' | 'limited' | 'offline'

  useEffect(() => {
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        setStatus("offline");
      } else if (navigator.connection && navigator.connection.effectiveType === "2g") {
        setStatus("limited");
      } else {
        setStatus("online");
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (status === "online") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Connected</span>
      </div>
    );
  }

  if (status === "limited") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
        <AlertCircle size={12} className="text-amber-400" />
        <span>Limited Connection — Saved health info available</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
      <WifiOff size={12} className="text-rose-400" />
      <span>Offline — Some features require internet connection</span>
    </div>
  );
}
