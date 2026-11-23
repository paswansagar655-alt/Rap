import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2, Sliders, Music2, Activity, Zap } from 'lucide-react';
import { beatSynth } from '../utils/audioSynth';
import { BeatStyle } from '../types';

interface BeatMachineProps {
  currentBpm: number;
  onBpmChange: (bpm: number) => void;
  suggestedStyle?: string;
  isBeatPlaying: boolean;
  setIsBeatPlaying: (playing: boolean) => void;
}

export const BeatMachine: React.FC<BeatMachineProps> = ({
  currentBpm,
  onBpmChange,
  suggestedStyle,
  isBeatPlaying,
  setIsBeatPlaying,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedStyle, setSelectedStyle] = useState<BeatStyle>('boombap');
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [kickVol, setKickVol] = useState<number>(0.9);
  const [snareVol, setSnareVol] = useState<number>(0.85);
  const [hihatVol, setHihatVol] = useState<number>(0.6);
  const [bassVol, setBassVol] = useState<number>(0.8);
  const [melodyVol, setMelodyVol] = useState<number>(0.65);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Sync with prop BPM
  useEffect(() => {
    beatSynth.setTempo(currentBpm);
  }, [currentBpm]);

  // Sync with suggested subgenre
  useEffect(() => {
    if (suggestedStyle) {
      const lower = suggestedStyle.toLowerCase();
      if (lower.includes('trap')) {
        setSelectedStyle('trap');
        beatSynth.setStyle('trap');
      } else if (lower.includes('drill')) {
        setSelectedStyle('drill');
        beatSynth.setStyle('drill');
      } else if (lower.includes('lo-fi') || lower.includes('lofi')) {
        setSelectedStyle('lofi');
        beatSynth.setStyle('lofi');
      } else if (lower.includes('folk') || lower.includes('madal') || lower.includes('bansuri')) {
        setSelectedStyle('nepalifolk');
        beatSynth.setStyle('nepalifolk');
      } else {
        setSelectedStyle('boombap');
        beatSynth.setStyle('boombap');
      }
    }
  }, [suggestedStyle]);

  // Setup step callback & visualizer
  useEffect(() => {
    beatSynth.setOnStepCallback((step) => {
      setActiveStep(step);
    });

    const drawVisualizer = () => {
      const canvas = canvasRef.current;
      const analyser = beatSynth.getAnalyser();

      if (canvas && analyser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            // Gradient colors from red to gold
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#dc2626');
            gradient.addColorStop(0.6, '#ea580c');
            gradient.addColorStop(1, '#f59e0b');

            ctx.fillStyle = isBeatPlaying ? gradient : '#404040';
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(drawVisualizer);
    };

    drawVisualizer();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isBeatPlaying]);

  const handleTogglePlay = () => {
    const playing = beatSynth.togglePlay();
    setIsBeatPlaying(playing);
  };

  const handleStyleChange = (style: BeatStyle) => {
    setSelectedStyle(style);
    beatSynth.setStyle(style);

    // Auto-adjust default BPM for style if requested
    let defaultBpm = currentBpm;
    if (style === 'boombap') defaultBpm = 90;
    if (style === 'trap') defaultBpm = 140;
    if (style === 'drill') defaultBpm = 142;
    if (style === 'lofi') defaultBpm = 84;
    if (style === 'nepalifolk') defaultBpm = 95;

    onBpmChange(defaultBpm);
    beatSynth.setTempo(defaultBpm);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    taps.push(now);

    if (taps.length > 4) {
      taps.shift();
    }

    if (taps.length >= 2) {
      let intervals = 0;
      for (let i = 1; i < taps.length; i++) {
        intervals += taps[i] - taps[i - 1];
      }
      const avgInterval = intervals / (taps.length - 1);
      const bpm = Math.round(60000 / avgInterval);
      if (bpm >= 60 && bpm <= 180) {
        onBpmChange(bpm);
        beatSynth.setTempo(bpm);
      }
    }
  };

  const handleKickVol = (v: number) => {
    setKickVol(v);
    beatSynth.kickVol = v;
  };
  const handleSnareVol = (v: number) => {
    setSnareVol(v);
    beatSynth.snareVol = v;
  };
  const handleHihatVol = (v: number) => {
    setHihatVol(v);
    beatSynth.hihatVol = v;
  };
  const handleBassVol = (v: number) => {
    setBassVol(v);
    beatSynth.bassVol = v;
  };
  const handleMelodyVol = (v: number) => {
    setMelodyVol(v);
    beatSynth.melodyVol = v;
  };

  return (
    <div id="beat-machine-card" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-neutral-800">
        {/* Left: Beat Title & Style Badges */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-beat"
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white transition-all transform active:scale-95 shadow-lg ${
              isBeatPlaying
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
            title={isBeatPlaying ? 'Pause Beat' : 'Play Live Rap Beat'}
          >
            {isBeatPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Music2 className="w-4 h-4 text-amber-400" />
                Live Beat Engine
              </h3>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isBeatPlaying
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {isBeatPlaying ? 'ON AIR' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Web Audio Synthesizer • Head-bobbing drums & Bansuri flute synth
            </p>
          </div>
        </div>

        {/* Center: Style Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'boombap', label: 'Boom Bap', bpm: 90 },
              { id: 'trap', label: '808 Trap', bpm: 140 },
              { id: 'drill', label: 'K-Town Drill', bpm: 142 },
              { id: 'lofi', label: 'Lo-Fi Chill', bpm: 84 },
              { id: 'nepalifolk', label: 'Madal & Bansuri Folk', bpm: 95 },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              id={`style-btn-${st.id}`}
              onClick={() => handleStyleChange(st.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                selectedStyle === st.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Right: BPM Controls & Mixer Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400 font-medium">BPM:</span>
            <span className="text-sm font-black text-amber-400 font-mono w-9 text-center">
              {currentBpm}
            </span>
            <input
              id="bpm-range-slider"
              type="range"
              min="65"
              max="165"
              value={currentBpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-20 accent-red-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
            />
            <button
              id="btn-tap-tempo"
              onClick={handleTapTempo}
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
              title="Tap repeatedly to calculate BPM"
            >
              Tap
            </button>
          </div>

          <button
            id="btn-toggle-mixer"
            onClick={() => setShowMixer(!showMixer)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              showMixer
                ? 'bg-neutral-800 text-white border-neutral-600'
                : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title="Toggle Drum Mixer"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Mixer</span>
          </button>
        </div>
      </div>

      {/* 16-Step LED Sequencer Lights & Waveform Display */}
      <div className="mt-3.5 flex flex-col md:flex-row items-center gap-4">
        {/* Step lights */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5 font-mono">
            <span>BAR 1 (Steps 1-8)</span>
            <span>BAR 2 (Steps 9-16)</span>
          </div>
          <div className="grid grid-cols-16 gap-1 sm:gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isActive = activeStep === idx && isBeatPlaying;
              const isQuarter = idx % 4 === 0;
              return (
                <div
                  key={idx}
                  className={`h-6 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/80 scale-105 ring-2 ring-red-300'
                      : isQuarter
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-neutral-900 text-neutral-600'
                  }`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Spectrum Analyzer Canvas */}
        <div className="w-full md:w-48 h-11 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center p-1 relative overflow-hidden">
          <canvas ref={canvasRef} width={180} height={40} className="w-full h-full" />
          {!isBeatPlaying && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
              [SPECTRUM READY]
            </div>
          )}
        </div>
      </div>

      {/* Expandable Mixer Controls */}
      {showMixer && (
        <div id="mixer-panel" className="mt-3.5 pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-neutral-950/70 p-3 rounded-xl">
          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>808 / Kick</span>
              <span className="text-neutral-500">{Math.round(kickVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={kickVol}
              onChange={(e) => handleKickVol(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>Snare / Clap</span>
              <span className="text-neutral-500">{Math.round(snareVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={snareVol}
              onChange={(e) => handleSnareVol(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>Hi-Hats</span>
              <span className="text-neutral-500">{Math.round(hihatVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hihatVol}
              onChange={(e) => handleHihatVol(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>Sub Bass</span>
              <span className="text-neutral-500">{Math.round(bassVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bassVol}
              onChange={(e) => handleBassVol(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>Bansuri / Synth</span>
              <span className="text-neutral-500">{Math.round(melodyVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={melodyVol}
              onChange={(e) => handleMelodyVol(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
