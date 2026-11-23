import React from 'react';
import { Mic, Music, Sparkles, BookOpen, Volume2, PlusCircle, Flame } from 'lucide-react';
import { NepaliRapSong } from '../types';

interface HeaderProps {
  currentSong: NepaliRapSong;
  onOpenGenerator: () => void;
  onOpenMusicGen: () => void;
  onOpenGlossary: () => void;
  onOpenRecorder: () => void;
  allSongs: NepaliRapSong[];
  onSelectSong: (song: NepaliRapSong) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSong,
  onOpenGenerator,
  onOpenMusicGen,
  onOpenGlossary,
  onOpenRecorder,
  allSongs,
  onSelectSong,
}) => {
  return (
    <header id="header-main" className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-crimson-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/20 border border-red-500/40">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                नेपाली RAP STUDIO
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60">
                K-Town 808
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Devanagari • Romanized Phonetics • English • AI Beats & Lyria
            </p>
          </div>
        </div>

        {/* Quick Track Switcher dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="track-select" className="text-xs text-neutral-400 hidden sm:inline-block">
            Track:
          </label>
          <select
            id="track-select"
            value={currentSong.id || currentSong.titleNepali}
            onChange={(e) => {
              const selected = allSongs.find(
                (s) => (s.id || s.titleNepali) === e.target.value
              );
              if (selected) onSelectSong(selected);
            }}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:outline-none transition max-w-[190px] sm:max-w-xs truncate"
          >
            {allSongs.map((s) => (
              <option key={s.id || s.titleNepali} value={s.id || s.titleNepali}>
                {s.titleNepali} ({s.titleRoman})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            id="btn-open-generator"
            onClick={onOpenGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-900/30 transition transform active:scale-95"
            title="Generate custom Nepali rap songs with AI"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Rap Generator</span>
          </button>

          <button
            id="btn-open-music-lyria"
            onClick={onOpenMusicGen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 shadow-sm transition transform active:scale-95"
            title="Generate AI Beat/Music using Lyria (Clip & Pro)"
          >
            <Music className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Lyria Music AI</span>
            <span className="sm:hidden">Lyria</span>
          </button>

          <button
            id="btn-open-recorder"
            onClick={onOpenRecorder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-red-300 border border-red-500/30 transition transform active:scale-95"
            title="Record your vocals over the beat"
          >
            <Mic className="w-4 h-4 text-red-400" />
            <span className="hidden md:inline">Mic Booth</span>
          </button>

          <button
            id="btn-open-glossary"
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            title="Nepali Rap Slang & Cultural Glossary"
          >
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span className="hidden lg:inline">Slang Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
