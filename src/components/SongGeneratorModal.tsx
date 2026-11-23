import React, { useState } from 'react';
import { X, Sparkles, Flame, Loader2, Music, Mic, Layers, Sliders, Wand2 } from 'lucide-react';
import { NepaliRapSong } from '../types';

interface SongGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongGenerated: (song: NepaliRapSong) => void;
}

const PRESET_THEMES = [
  {
    title: 'Kathmandu Street Life & Ambition (काठमाडौँ को गल्ली र सपना)',
    theme: 'Kathmandu narrow alleys, tea stalls, morning fog, hustle from Asan to Thamel, dreams of conquering the city with rap bars.',
    subGenre: 'Boom Bap',
    mood: 'Gritty & Inspiring',
    bpm: 90,
  },
  {
    title: 'Himalayan Pride & Resilience (हिमालको रगत र शान)',
    theme: 'Everest resilience, brave mountain spirit, rising above poverty, fearless mindset, Nepali identity in the global hip-hop map.',
    subGenre: '808 Trap',
    mood: 'Aggressive & Fierce',
    bpm: 140,
  },
  {
    title: 'Midnight Hustle & Hard Work (रातभरिको कलम र पसिना)',
    theme: 'Writing lyrics past midnight, overcoming family doubts, financial struggles, perseverance, making parents proud.',
    subGenre: 'Lo-Fi Melodic Rap',
    mood: 'Emotional & Reflective',
    bpm: 85,
  },
  {
    title: 'K-Town Drill & Street Brotherhood (काठमाडौँ ड्रिल र दाजुभाइ)',
    theme: 'Loyalty with day-ones, sliding 808s, raw urban energy, underground freestyle battles in Basantapur, staying authentic.',
    subGenre: 'Himalayan Drill',
    mood: 'Heavy & Confident',
    bpm: 142,
  },
  {
    title: 'Nepali Folk & Hip-Hop Fusion (मादल, बाँसुरी र ८०८ बेस)',
    theme: 'Traditional Nepali folk melody rhythms fused with punchy modern hip-hop drums, cultural celebrations, roots & revolution.',
    subGenre: 'Folk-Rap Fusion',
    mood: 'Festive & Energetic',
    bpm: 96,
  },
];

export const SongGeneratorModal: React.FC<SongGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSongGenerated,
}) => {
  const [theme, setTheme] = useState<string>('Kathmandu Street Life, hustle in the alleys, and relentless dreams');
  const [subGenre, setSubGenre] = useState<string>('Boom Bap');
  const [mood, setMood] = useState<string>('Gritty & Inspiring');
  const [dialect, setDialect] = useState<string>('Kathmandu Urban Slang & Nepglish');
  const [tempo, setTempo] = useState<number>(90);
  const [verseCount, setVerseCount] = useState<number>(2);
  const [includeChorus, setIncludeChorus] = useState<boolean>(true);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme(preset.theme);
    setSubGenre(preset.subGenre);
    setMood(preset.mood);
    setTempo(preset.bpm);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-rap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          subGenre,
          mood,
          dialect,
          tempo,
          verseCount,
          includeChorus,
          customPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate song');
      }

      onSongGenerated(data.song);
      onClose();
    } catch (err: any) {
      console.error('Song generation error:', err);
      setErrorMsg(err.message || 'Failed to generate song');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="generator-modal-content"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Generate Nepali Rap Track
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Gemini 3.7 AI
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Creates Devanagari lyrics, Romanized guide, English meanings & cadence notes
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

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              🔥 Quick Preset Themes:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_THEMES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800/90 border border-neutral-800 hover:border-red-500/50 transition group"
                >
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-300">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span>{p.subGenre}</span> • <span>{p.bpm} BPM</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Topic Description */}
          <div>
            <label htmlFor="input-theme" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Song Theme / Topic:
            </label>
            <textarea
              id="input-theme"
              rows={2}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Growing up in Pokhara, chasing musical dreams despite family expectations, hard punchlines about perseverance..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Subgenre & Mood Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="select-subgenre" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Sub-Genre:
              </label>
              <select
                id="select-subgenre"
                value={subGenre}
                onChange={(e) => setSubGenre(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="Boom Bap">Boom Bap (90s Classic)</option>
                <option value="808 Trap">808 Trap (Modern K-Town)</option>
                <option value="Himalayan Drill">Himalayan Drill (Fast Slides)</option>
                <option value="Lo-Fi Melodic Rap">Lo-Fi Melodic Rap (Late Night)</option>
                <option value="Folk-Rap Fusion">Folk-Rap (Madal + Flute + 808)</option>
                <option value="Fast Chopper Flow">Fast Chopper Flow (Rapid Spit)</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-mood" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Mood / Tone:
              </label>
              <select
                id="select-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="Gritty & Inspiring">Gritty & Inspiring</option>
                <option value="Aggressive & Hardcore">Aggressive & Hardcore</option>
                <option value="Emotional & Nostalgic">Emotional & Nostalgic</option>
                <option value="Poetic & Philosophical">Poetic & Philosophical</option>
                <option value="High-Energy Party Banger">High-Energy Party Banger</option>
                <option value="Dark & Introspective">Dark & Introspective</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-dialect" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nepali Slang Style:
              </label>
              <select
                id="select-dialect"
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="Kathmandu Urban Slang & Nepglish">K-Town Urban Slang</option>
                <option value="Pure Poetic Literary Nepali">Pure Poetic Nepali</option>
                <option value="Balanced Nepglish Rap">Balanced Nepglish</option>
                <option value="Pokhara Lakeside Vibe">Pokhara Chill Style</option>
              </select>
            </div>
          </div>

          {/* Tempo & Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <div>
              <label htmlFor="input-tempo" className="block text-xs text-neutral-400 mb-1">
                Target BPM ({tempo}):
              </label>
              <input
                id="input-tempo"
                type="range"
                min="70"
                max="160"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="select-verse-count" className="block text-xs text-neutral-400 mb-1">
                Verse Count:
              </label>
              <select
                id="select-verse-count"
                value={verseCount}
                onChange={(e) => setVerseCount(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value={1}>1 Long Verse (Freestyle format)</option>
                <option value={2}>2 Verses (Standard Song)</option>
                <option value={3}>3 Verses (Full Anthem)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="checkbox-chorus"
                type="checkbox"
                checked={includeChorus}
                onChange={(e) => setIncludeChorus(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded bg-neutral-800 border-neutral-700"
              />
              <label htmlFor="checkbox-chorus" className="text-xs text-neutral-300 font-medium">
                Include Catchy Chorus Hook
              </label>
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label htmlFor="custom-notes" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Specific Punchlines / Keywords (Optional):
            </label>
            <input
              id="custom-notes"
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Mention Yama Buddha tribute, multisyllabic rhymes ending in -आगो / -साँझ..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              Cancel
            </button>

            <button
              id="btn-generate-song-submit"
              type="submit"
              disabled={isGenerating || !theme.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 via-crimson-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/30 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Writing Nepali Rap Bars with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Full Rap Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
