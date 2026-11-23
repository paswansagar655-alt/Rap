/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { BeatMachine } from './components/BeatMachine';
import { LyricsTeleprompter } from './components/LyricsTeleprompter';
import { PerformanceTipsCard } from './components/PerformanceTipsCard';
import { SongGeneratorModal } from './components/SongGeneratorModal';
import { LyriaMusicModal } from './components/LyriaMusicModal';
import { VocalRecorderModal } from './components/VocalRecorderModal';
import { GlossaryModal } from './components/GlossaryModal';
import { RefineSectionModal } from './components/RefineSectionModal';
import { DEFAULT_TRACKS } from './data/defaultTracks';
import { NepaliRapSong, DisplayScriptMode, SongSection } from './types';
import { Download, Sparkles, Music, Mic, BookOpen, Share2, Check } from 'lucide-react';

export default function App() {
  const [allSongs, setAllSongs] = useState<NepaliRapSong[]>(DEFAULT_TRACKS);
  const [currentSong, setCurrentSong] = useState<NepaliRapSong>(DEFAULT_TRACKS[0]);
  const [displayMode, setDisplayMode] = useState<DisplayScriptMode>('all');
  const [currentBpm, setCurrentBpm] = useState<number>(DEFAULT_TRACKS[0].bpm);
  const [isBeatPlaying, setIsBeatPlaying] = useState<boolean>(false);

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isMusicGenOpen, setIsMusicGenOpen] = useState<boolean>(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [refiningSection, setRefiningSection] = useState<SongSection | null>(null);
  const [copiedSong, setCopiedSong] = useState<boolean>(false);

  const handleSelectSong = (song: NepaliRapSong) => {
    setCurrentSong(song);
    setCurrentBpm(song.bpm);
  };

  const handleSongGenerated = (newSong: NepaliRapSong) => {
    const songWithId = { ...newSong, id: `custom-${Date.now()}` };
    setAllSongs([songWithId, ...allSongs]);
    setCurrentSong(songWithId);
    setCurrentBpm(songWithId.bpm);
  };

  const handleSectionUpdated = (updatedSection: SongSection) => {
    const updatedSections = currentSong.sections.map((sec) =>
      sec.title === updatedSection.title || sec.type === updatedSection.type ? updatedSection : sec
    );
    const updatedSong = { ...currentSong, sections: updatedSections };
    setCurrentSong(updatedSong);
    setAllSongs(
      allSongs.map((s) => ((s.id || s.titleNepali) === (updatedSong.id || updatedSong.titleNepali) ? updatedSong : s))
    );
  };

  const handleLyriaAudioGenerated = (audioUrl: string) => {
    const updated = { ...currentSong, generatedAudioUrl: audioUrl, isLyriaGenerated: true };
    setCurrentSong(updated);
  };

  const handleExportFullSongTxt = () => {
    let content = `NEPALI RAP: ${currentSong.titleNepali} (${currentSong.titleRoman})\n`;
    content += `Translation: ${currentSong.titleEnglish}\n`;
    content += `Artist Persona: ${currentSong.artistPersona}\n`;
    content += `Genre: ${currentSong.subGenre} | BPM: ${currentSong.bpm} | Mood: ${currentSong.mood}\n`;
    content += `Summary: ${currentSong.summary}\n\n`;
    content += `=======================================================\n\n`;

    currentSong.sections.forEach((sec) => {
      content += `[${sec.title}] (${sec.type.toUpperCase()})\n`;
      content += `Flow Note: ${sec.flowNote}\n\n`;
      sec.lines.forEach((l, i) => {
        content += `${i + 1}. ${l.nepali}\n`;
        content += `   Roman: ${l.romanized}\n`;
        content += `   Meaning: ${l.english}\n`;
        content += `   Cadence: [${l.cadenceMarker}] | Rhyme: [${l.rhymeKey}]\n\n`;
      });
      content += `-------------------------------------------------------\n\n`;
    });

    content += `GLOSSARY / CULTURAL TERMS:\n`;
    currentSong.glossary.forEach((g) => {
      content += `- ${g.term}: ${g.meaning}\n`;
    });

    content += `\nPERFORMANCE TIPS:\n`;
    currentSong.performanceTips.forEach((t) => {
      content += `• ${t}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSong.titleRoman || 'nepali-rap'}-lyrics.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAllLyrics = () => {
    let content = `${currentSong.titleNepali} (${currentSong.titleRoman})\n\n`;
    currentSong.sections.forEach((sec) => {
      content += `--- ${sec.title} ---\n`;
      sec.lines.forEach((l) => {
        content += `${l.nepali}\n${l.romanized}\n"${l.english}"\n\n`;
      });
    });
    navigator.clipboard.writeText(content);
    setCopiedSong(true);
    setTimeout(() => setCopiedSong(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-red-600 selection:text-white font-sans">
      {/* Main Studio Navigation Header */}
      <Header
        currentSong={currentSong}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenMusicGen={() => setIsMusicGenOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        allSongs={allSongs}
        onSelectSong={handleSelectSong}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Control Bar: Beat Machine Synthesizer */}
        <BeatMachine
          currentBpm={currentBpm}
          onBpmChange={setCurrentBpm}
          suggestedStyle={currentSong.subGenre}
          isBeatPlaying={isBeatPlaying}
          setIsBeatPlaying={setIsBeatPlaying}
        />

        {/* Action quickbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-quick-new-song"
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Write New Nepali Rap</span>
            </button>

            <button
              id="btn-quick-lyria"
              onClick={() => setIsMusicGenOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Generate AI Beat (Lyria)</span>
            </button>

            <button
              id="btn-quick-record"
              onClick={() => setIsRecorderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span>Record Rap Vocals</span>
            </button>

            <button
              id="btn-quick-glossary"
              onClick={() => setIsGlossaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Nepali Slang ({currentSong.glossary.length} terms)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-all-lyrics"
              onClick={handleCopyAllLyrics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
              title="Copy all lyrics to clipboard"
            >
              {copiedSong ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedSong ? 'Lyrics Copied!' : 'Copy Full Song'}</span>
            </button>

            <button
              id="btn-export-txt"
              onClick={handleExportFullSongTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
              title="Download full lyrics & guide as text file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export .TXT</span>
            </button>
          </div>
        </div>

        {/* Central Core: Lyrics Teleprompter & Reader */}
        <LyricsTeleprompter
          song={currentSong}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          onRefineSection={(sec) => setRefiningSection(sec)}
        />

        {/* Performance Guide & Delivery Tips */}
        <PerformanceTipsCard
          tips={currentSong.performanceTips}
          bpm={currentSong.bpm}
          subGenre={currentSong.subGenre}
        />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-4 px-4 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            नेपाली Rap Studio • Powered by Gemini 3.7 & Lyria Music Generation • K-Town Hip-Hop
          </p>
          <p className="text-[11px] text-neutral-400">
            Dedicated to the Nepali Hip-Hop Community & Lyricists
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SongGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSongGenerated={handleSongGenerated}
      />

      <LyriaMusicModal
        isOpen={isMusicGenOpen}
        onClose={() => setIsMusicGenOpen(false)}
        currentSong={currentSong}
        onAudioGenerated={handleLyriaAudioGenerated}
      />

      <VocalRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        songTitle={currentSong.titleRoman}
        bpm={currentBpm}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={currentSong.glossary}
        songTitle={currentSong.titleNepali}
      />

      <RefineSectionModal
        isOpen={!!refiningSection}
        onClose={() => setRefiningSection(null)}
        section={refiningSection}
        onSectionUpdated={handleSectionUpdated}
        styleContext={`${currentSong.subGenre} - ${currentSong.mood}`}
      />
    </div>
  );
}
