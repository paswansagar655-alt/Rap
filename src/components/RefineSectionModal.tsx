import React, { useState } from 'react';
import { X, Sparkles, Loader2, RefreshCw, Wand2 } from 'lucide-react';
import { SongSection } from '../types';

interface RefineSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SongSection | null;
  onSectionUpdated: (updatedSection: SongSection) => void;
  styleContext: string;
}

export const RefineSectionModal: React.FC<RefineSectionModalProps> = ({
  isOpen,
  onClose,
  section,
  onSectionUpdated,
  styleContext,
}) => {
  const [instruction, setInstruction] = useState<string>('Make the rhymes more complex and multisyllabic, with heavier punchlines');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !section) return null;

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefining(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          instruction,
          styleContext,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to refine section');
      }

      onSectionUpdated(data.section);
      onClose();
    } catch (err: any) {
      console.error('Refine section error:', err);
      setErrorMsg(err.message || 'Failed to refine section');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="refine-modal"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Refine / Rewrite {section.title}
              </h3>
              <p className="text-xs text-neutral-400">
                Adjust flow, rhymes, speed, or tone with AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRefine} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Current Bars Preview:
            </label>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 max-h-36 overflow-y-auto text-xs font-mono text-neutral-300">
              {section.lines.map((l, i) => (
                <div key={i} className="truncate">
                  {i + 1}. {l.nepali}
                </div>
              ))}
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5">
              Quick Instructions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Make the rhymes multisyllabic',
                'Make flow faster & more aggressive',
                'Add emotional metaphors about family & hustle',
                'Write in pure poetic Nepali without English words',
                'Add clever punchlines and wordplay',
              ].map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInstruction(text)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="refine-instruction" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Refinement Instruction:
            </label>
            <textarea
              id="refine-instruction"
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isRefining || !instruction.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition disabled:opacity-50"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rewriting Bars...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Update Section</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
