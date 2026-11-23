import React from 'react';
import { Mic2, Wind, Activity, Zap } from 'lucide-react';

interface PerformanceTipsCardProps {
  tips: string[];
  bpm: number;
  subGenre: string;
}

export const PerformanceTipsCard: React.FC<PerformanceTipsCardProps> = ({
  tips,
  bpm,
  subGenre,
}) => {
  return (
    <div id="performance-tips-card" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Mic2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Nepali Rap Delivery & Flow Guide
          </h3>
          <p className="text-[11px] text-neutral-400">
            Cadence, breath control, and pronunciation techniques
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3.5">
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Rhythm & Pocket</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Lock into the {bpm} BPM grid. Accent the Nepali consonants (ट, ठ, ड, ढ) on the kick and snare beats.
          </p>
        </div>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span>Breath Control</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Take shallow diaphragmatic breaths during the 4th beat pause before double-time lines.
          </p>
        </div>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Style: {subGenre}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Keep vocal projection forward in the mouth with crisp sibilance for microphone clarity.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
          Pro Delivery Tips for this Song:
        </span>
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
            <span className="text-red-500 font-bold">•</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
