import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Sparkles,
  Play,
  Square,
  Eye,
  Type,
  Mic2,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { NepaliRapSong, DisplayScriptMode, SongSection } from '../types';
import { speechReader } from '../utils/speechVoice';

interface LyricsTeleprompterProps {
  song: NepaliRapSong;
  displayMode: DisplayScriptMode;
  setDisplayMode: (mode: DisplayScriptMode) => void;
  onRefineSection: (section: SongSection) => void;
}

// Color palette for rhyme keys
const RHYME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-800/60' },
  B: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60' },
  C: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800/60' },
  D: { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-800/60' },
  E: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-800/60' },
  F: { bg: 'bg-pink-950/60', text: 'text-pink-300', border: 'border-pink-800/60' },
  G: { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-800/60' },
  H: { bg: 'bg-lime-950/60', text: 'text-lime-300', border: 'border-lime-800/60' },
};

export const LyricsTeleprompter: React.FC<LyricsTeleprompterProps> = ({
  song,
  displayMode,
  setDisplayMode,
  onRefineSection,
}) => {
  const [copiedSectionIndex, setCopiedSectionIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [activeSpeakingLine, setActiveSpeakingLine] = useState<{ secIdx: number; lineIdx: number } | null>(null);
  const [isSpeakingFullSong, setIsSpeakingFullSong] = useState<boolean>(false);

  useEffect(() => {
    // Reset active speaking on song change
    speechReader.stop();
    setActiveSpeakingLine(null);
    setIsSpeakingFullSong(false);
  }, [song]);

  const handleCopySection = (section: SongSection, index: number) => {
    const text = section.lines
      .map((l) => `${l.nepali}\n(${l.romanized})\n[${l.english}]`)
      .join('\n\n');
    navigator.clipboard.writeText(`${section.title}\n\n${text}`);
    setCopiedSectionIndex(index);
    setTimeout(() => setCopiedSectionIndex(null), 2000);
  };

  const handleSpeakLine = (nepaliText: string, secIdx: number, lineIdx: number) => {
    if (
      activeSpeakingLine?.secIdx === secIdx &&
      activeSpeakingLine?.lineIdx === lineIdx &&
      speechReader.getIsSpeaking()
    ) {
      speechReader.stop();
      setActiveSpeakingLine(null);
      return;
    }

    setActiveSpeakingLine({ secIdx, lineIdx });
    speechReader.speakLine(nepaliText, 'ne-NP', 1.05, 0.95, () => {
      setActiveSpeakingLine(null);
    });
  };

  const handleReadFullSong = () => {
    if (isSpeakingFullSong) {
      speechReader.stop();
      setIsSpeakingFullSong(false);
      setActiveSpeakingLine(null);
      return;
    }

    // Flatten all lines
    const flattenedLines: { text: string; secIdx: number; lineIdx: number }[] = [];
    song.sections.forEach((sec, secIdx) => {
      sec.lines.forEach((l, lineIdx) => {
        flattenedLines.push({ text: l.nepali, secIdx, lineIdx });
      });
    });

    setIsSpeakingFullSong(true);
    speechReader.readSongLines(
      flattenedLines.map((f) => f.text),
      'ne-NP',
      (idx) => {
        const item = flattenedLines[idx];
        if (item) {
          setActiveSpeakingLine({ secIdx: item.secIdx, lineIdx: item.lineIdx });
        }
      },
      () => {
        setIsSpeakingFullSong(false);
        setActiveSpeakingLine(null);
      },
      1.1
    );
  };

  return (
    <div id="lyrics-teleprompter" className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Song Header Info Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-5 border-b border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white tracking-wide uppercase">
                {song.subGenre}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-800 text-amber-400 border border-amber-500/30">
                {song.bpm} BPM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                {song.mood}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-neutral-400 bg-neutral-900">
                {song.artistPersona}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2.5 font-sans">
              <span>{song.titleNepali}</span>
              <span className="text-lg sm:text-xl font-medium text-neutral-400 font-sans">
                / {song.titleRoman}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 italic">
              "{song.titleEnglish}" — {song.summary}
            </p>
          </div>

          {/* Teleprompter Quick Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-read-full-flow"
              onClick={handleReadFullSong}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-md ${
                isSpeakingFullSong
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30'
              }`}
              title="Speak entire song with rhythmic flow"
            >
              {isSpeakingFullSong ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSpeakingFullSong ? 'Stop Voice Flow' : 'Voice Cadence Guide'}</span>
            </button>

            {/* Font Size Selector */}
            <div className="flex items-center bg-neutral-950 rounded-xl p-1 border border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-500 px-1.5">Size</span>
              {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                    fontSize === sz ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sz === 'normal' ? 'S' : sz === 'large' ? 'M' : 'L'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Mode Tabs */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <span className="text-xs font-semibold text-neutral-400 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Script:
            </span>
            {(
              [
                { id: 'all', label: 'All 3 Views (नेपाली + Roman + English)' },
                { id: 'nepali', label: 'देवनागरी (Nepali)' },
                { id: 'romanized', label: 'Romanized (Nepglish)' },
                { id: 'english', label: 'English Meaning' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                id={`tab-script-${tab.id}`}
                onClick={() => setDisplayMode(tab.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  displayMode === tab.id
                    ? 'bg-neutral-800 text-amber-300 font-bold shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Click any speaker icon to hear line rhythm & pronunciation</span>
          </div>
        </div>
      </div>

      {/* Song Sections Container */}
      <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {song.sections.map((section, secIdx) => {
          const isChorus = section.type === 'chorus';
          return (
            <div
              key={secIdx}
              id={`section-${secIdx}`}
              className={`rounded-2xl border transition-all ${
                isChorus
                  ? 'bg-gradient-to-br from-amber-950/20 via-neutral-900 to-amber-950/10 border-amber-500/40 shadow-lg shadow-amber-900/10'
                  : 'bg-neutral-950/60 border-neutral-800'
              } p-4 sm:p-5`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      isChorus
                        ? 'bg-amber-500 text-neutral-950'
                        : section.type === 'intro'
                        ? 'bg-neutral-800 text-neutral-300'
                        : section.type === 'outro'
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {section.type}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {section.title}
                  </h3>
                  <span className="text-xs text-neutral-400 hidden sm:inline-block italic">
                    • {section.flowNote}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopySection(section, secIdx)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs transition"
                    title="Copy section lyrics"
                  >
                    {copiedSectionIndex === secIdx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onRefineSection(section)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
                    title="Rewrite or refine this section with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Refine Bar</span>
                  </button>
                </div>
              </div>

              {/* Lines list */}
              <div className="space-y-3.5">
                {section.lines.map((line, lineIdx) => {
                  const isActive =
                    activeSpeakingLine?.secIdx === secIdx &&
                    activeSpeakingLine?.lineIdx === lineIdx;
                  const rhymeStyle =
                    RHYME_COLORS[line.rhymeKey] || {
                      bg: 'bg-neutral-800',
                      text: 'text-neutral-300',
                      border: 'border-neutral-700',
                    };

                  return (
                    <div
                      key={lineIdx}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500/50'
                          : 'bg-neutral-900/90 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* 1. Devanagari Line */}
                          {(displayMode === 'all' || displayMode === 'nepali') && (
                            <p
                              className={`font-black text-white tracking-wide leading-relaxed font-sans ${
                                fontSize === 'normal'
                                  ? 'text-base'
                                  : fontSize === 'large'
                                  ? 'text-lg sm:text-xl'
                                  : 'text-xl sm:text-2xl'
                              }`}
                            >
                              {line.nepali}
                            </p>
                          )}

                          {/* 2. Romanized Line */}
                          {(displayMode === 'all' || displayMode === 'romanized') && (
                            <p
                              className={`font-semibold text-amber-300 tracking-wide font-sans ${
                                fontSize === 'normal'
                                  ? 'text-sm'
                                  : fontSize === 'large'
                                  ? 'text-base sm:text-lg'
                                  : 'text-lg sm:text-xl'
                              }`}
                            >
                              {line.romanized}
                            </p>
                          )}

                          {/* 3. English Meaning */}
                          {(displayMode === 'all' || displayMode === 'english') && (
                            <p
                              className={`text-neutral-400 italic ${
                                fontSize === 'normal'
                                  ? 'text-xs'
                                  : fontSize === 'large'
                                  ? 'text-xs sm:text-sm'
                                  : 'text-sm sm:text-base'
                              }`}
                            >
                              "{line.english}"
                            </p>
                          )}
                        </div>

                        {/* Right: Flow & Rhyme Badges + TTS Trigger */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            onClick={() => handleSpeakLine(line.nepali, secIdx, lineIdx)}
                            className={`p-1.5 rounded-lg border text-xs transition ${
                              isActive
                                ? 'bg-red-600 text-white border-red-500 shadow-md animate-pulse'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                            }`}
                            title="Speak bar cadence"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1">
                            {line.cadenceMarker && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                                {line.cadenceMarker}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${rhymeStyle.bg} ${rhymeStyle.text} ${rhymeStyle.border}`}
                              title={`Rhyme group ${line.rhymeKey}`}
                            >
                              {line.rhymeKey}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
