import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Eye, Trash2 } from "lucide-react";


export default function PrescriptionCard({
  date,
  medication,
  language,
  doctor,
  status,
  onView,
  onDelete,
}) {


  return (
    <Card className="glass-card rounded-2xl p-5 border border-white/10 bg-white/5 hover:border-teal-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{date}</span>
          <h3 className="mt-1 text-base font-extrabold text-white font-display">
            {medication}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px]">
            {language}
          </Badge>
        </div>
      </div>

      {doctor && (
        <p className="mt-2 text-xs text-slate-300 font-medium">
          Prescribing Clinician: <span className="text-white font-bold">{doctor}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.isArray(status) && status.map((item) => (
          <Badge key={item} className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
            {item}
          </Badge>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
        <Button
          onClick={onView}
          size="sm"
          className="btn-vibrant-primary text-xs font-bold px-4 py-1.5 rounded-xl h-9"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5 text-amber-300"/>
          View Analysis
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold rounded-xl h-9 px-3"
        >
          <Trash2 className="h-3.5 w-3.5"/>
        </Button>
      </div>
    </Card>
  );

}