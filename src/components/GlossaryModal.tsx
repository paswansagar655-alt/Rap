import React from 'react';
import { X, BookOpen, Sparkles, Hash } from 'lucide-react';
import { GlossaryItem } from '../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryItem[];
  songTitle: string;
}

const GENERAL_NEPALI_HIPHOP_TERMS: GlossaryItem[] = [
  {
    term: 'यमबुद्ध (Yama Buddha / Anil Adhikari)',
    meaning: 'The godfather of modern Nepali hip-hop / Raw Barz rap battles who inspired a whole generation of South Asian rappers.',
  },
  {
    term: 'काण्ड (Kaanda)',
    meaning: 'Major street drama, controversial incident, or crazy hustle situation.',
  },
  {
    term: '८०८ (808 / Eight-O-Eight)',
    meaning: 'Deep sub-bass frequency kick drum staple in modern Kathmandu trap and drill beats.',
  },
  {
    term: 'बाफा (Baaphaa)',
    meaning: 'Steaming hot street energy or smoke rising from freshly cooked momos / tea in cold Kathmandu winters.',
  },
  {
    term: 'ठोक (Thoka)',
    meaning: 'Drop the punchline hard or hit the beat right on time.',
  },
  {
    term: 'नेपग्लिस (Nepglish)',
    meaning: 'Natural urban blending of Nepali and English languages used seamlessly in contemporary Nepali rap flows.',
  },
  {
    term: 'मादल र बाँसुरी (Madal & Bansuri)',
    meaning: 'Traditional two-headed Nepali drum and bamboo flute frequently sampled into modern hip-hop 808 beats.',
  },
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  glossary,
  songTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="glossary-modal"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Nepali Rap Slang & Dictionary
              </h3>
              <p className="text-xs text-neutral-400">
                Cultural meanings & street slang from "{songTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Song specific terms */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Terms in this Track:
            </h4>
            <div className="space-y-2">
              {glossary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition"
                >
                  <div className="text-sm font-bold text-white mb-0.5">{item.term}</div>
                  <div className="text-xs text-neutral-400">{item.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* General Nepali Hip-hop lore */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-red-500" />
              Essential Nepali Hip-Hop Lore:
            </h4>
            <div className="space-y-2">
              {GENERAL_NEPALI_HIPHOP_TERMS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80"
                >
                  <div className="text-xs font-bold text-neutral-300 mb-0.5">{item.term}</div>
                  <div className="text-[11px] text-neutral-400">{item.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
