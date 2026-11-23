import React, { useState } from 'react';
import { X, Sparkles, Music, Loader2, Play, Square, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NepaliRapSong } from '../types';

interface LyriaMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: NepaliRapSong;
  onAudioGenerated: (audioUrl: string) => void;
}

export const LyriaMusicModal: React.FC<LyriaMusicModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  onAudioGenerated,
}) => {
  const [modelType, setModelType] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [prompt, setPrompt] = useState<string>(
    currentSong.beatDescription ||
      'Heavy 90s boom bap hip hop drum beat, 808 sub bass, nepali flute bansuri sample, dark minor chords, 90 bpm'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: modelType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate music with Lyria');
      }

      // Convert base64 to Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setGeneratedAudioUrl(url);
      onAudioGenerated(url);

      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (err: any) {
      console.error('Lyria generation error:', err);
      setErrorMessage(
        err.message ||
          'Music generation failed. Note: Lyria models require an active GEMINI_API_KEY with appropriate project permissions.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="lyria-modal-content"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Lyria AI Music Generator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                  Lyria 3
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Generate high-fidelity audio beats & instrumentals for your Nepali rap
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Select Lyria Model:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModelType('lyria-3-clip-preview')}
                className={`p-3 rounded-xl border text-left transition ${
                  modelType === 'lyria-3-clip-preview'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-bold text-sm text-white">Lyria Clip</div>
                <div className="text-xs text-neutral-400">lyria-3-clip-preview</div>
                <div className="text-[11px] text-amber-400/80 mt-1">Short clips (up to 30 seconds)</div>
              </button>

              <button
                type="button"
                onClick={() => setModelType('lyria-3-pro-preview')}
                className={`p-3 rounded-xl border text-left transition ${
                  modelType === 'lyria-3-pro-preview'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-bold text-sm text-white">Lyria Pro</div>
                <div className="text-xs text-neutral-400">lyria-3-pro-preview</div>
                <div className="text-[11px] text-amber-400/80 mt-1">Full-length music tracks</div>
              </button>
            </div>
          </div>

          {/* Prompt Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="lyria-prompt" className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Music Prompt:
              </label>
              <button
                type="button"
                onClick={() => setPrompt(currentSong.beatDescription)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset from Track Info
              </button>
            </div>
            <textarea
              id="lyria-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Heavy 90s boom bap hip hop drum beat, 808 sub bass, nepali flute bansuri sample, dark minor chords, 90 bpm"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
            />
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
              Quick Prompt Vibes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Kathmandu 808 Trap with fast hi-hat rolls & Sarangi',
                '90s Boom Bap with vinyl crackle & Himalayan Bansuri',
                'Aggressive K-Town Drill with deep sliding 808s',
                'Late night chill Lo-Fi rap beat with mellow piano',
                'Folk-Rap fusion with Nepali Madal and acoustic guitar',
              ].map((vibe, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(vibe + `, ${currentSong.bpm} bpm`)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Generation Notice</p>
                <p className="mt-0.5">{errorMessage}</p>
                <p className="mt-1 text-[11px] text-red-400">
                  Tip: You can always use the built-in <strong>Live Beat Engine</strong> on the main studio screen which generates instant Web Audio beats!
                </p>
              </div>
            </div>
          )}

          {/* Generated audio preview player */}
          {generatedAudioUrl && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Track Ready for Playback</span>
                </div>
                <a
                  href={generatedAudioUrl}
                  download={`${currentSong.titleRoman || 'nepali-rap'}-lyria-track.wav`}
                  className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download WAV</span>
                </a>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlayback}
                  className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center justify-center transition shadow-md"
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {currentSong.titleNepali} — Lyria Instrumental Beat
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Model: {modelType} • WAV Encoded
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            Close
          </button>

          <button
            id="btn-trigger-lyria"
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-900/30 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Track with {modelType === 'lyria-3-clip-preview' ? 'Lyria Clip' : 'Lyria Pro'}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Beat with Lyria</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
