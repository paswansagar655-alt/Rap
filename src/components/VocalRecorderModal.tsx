import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Download, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';
import { beatSynth } from '../utils/audioSynth';

interface VocalRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  bpm: number;
}

export const VocalRecorderModal: React.FC<VocalRecorderModalProps> = ({
  isOpen,
  onClose,
  songTitle,
  bpm,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [playBeatWhileRecording, setPlayBeatWhileRecording] = useState<boolean>(true);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsRecording(false);
    setIsPlayingRecording(false);
  };

  if (!isOpen) return null;

  const startRecording = async () => {
    setMicPermissionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Setup live mic visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      audioContextRef.current = actx;
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = actx.createMediaStreamSource(stream);
      source.connect(analyser);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        const player = new Audio(url);
        player.onended = () => setIsPlayingRecording(false);
        audioPlayerRef.current = player;

        if (playBeatWhileRecording && beatSynth.getIsPlaying()) {
          beatSynth.stop();
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start beat if requested
      if (playBeatWhileRecording && !beatSynth.getIsPlaying()) {
        beatSynth.play();
      }

      // Duration counter
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Visualizer loop
      const draw = () => {
        if (canvasRef.current && analyserRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            const bufferLen = analyserRef.current.frequencyBinCount;
            const data = new Uint8Array(bufferLen);
            analyserRef.current.getByteFrequencyData(data);

            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            const barW = (canvasRef.current.width / bufferLen) * 2;
            let x = 0;

            for (let i = 0; i < bufferLen; i++) {
              const h = (data[i] / 255) * canvasRef.current.height;
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(x, canvasRef.current.height - h, barW - 1, h);
              x += barW;
            }
          }
        }
        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicPermissionError(
        'Could not access microphone. Please allow microphone permissions in your browser.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayRecording = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingRecording) {
      audioPlayerRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        id="vocal-recorder-modal"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Vocal Booth / रेकर्डिङ स्टुडियो
              </h3>
              <p className="text-xs text-neutral-400">
                Rap live over the beat & record your performance
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-center">
          <div className="text-xs text-neutral-400">
            Track: <span className="text-white font-bold">{songTitle}</span> ({bpm} BPM)
          </div>

          {/* Live Mic Canvas & Record Button */}
          <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center space-y-4">
            <div className="w-full h-16 bg-neutral-900/80 rounded-xl overflow-hidden flex items-center justify-center relative">
              <canvas ref={canvasRef} width={280} height={64} className="w-full h-full" />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500 font-mono">
                  [MIC STANDBY - READY TO RECORD]
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-2xl font-mono font-black text-red-500">
              {formatTime(recordingDuration)}
            </div>

            {/* Main Record Action Button */}
            {!isRecording ? (
              <button
                id="btn-start-mic-record"
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/40 transition transform active:scale-95"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording Rap</span>
              </button>
            ) : (
              <button
                id="btn-stop-mic-record"
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-neutral-800 hover:bg-neutral-700 text-red-400 border border-red-500/50 shadow-xl transition transform active:scale-95 animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {/* Sync beat checkbox */}
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                id="sync-beat-checkbox"
                type="checkbox"
                checked={playBeatWhileRecording}
                onChange={(e) => setPlayBeatWhileRecording(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded bg-neutral-800 border-neutral-700"
              />
              <label htmlFor="sync-beat-checkbox">
                Auto-play drum beat while recording
              </label>
            </div>
          </div>

          {micPermissionError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{micPermissionError}</span>
            </div>
          )}

          {/* Recorded Playback & Download */}
          {recordedAudioUrl && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/40 text-left space-y-3">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>Vocal Take Recorded ({formatTime(recordingDuration)})</span>
                <a
                  href={recordedAudioUrl}
                  download={`${songTitle}-vocal-recording.webm`}
                  className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Audio</span>
                </a>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayRecording}
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center transition shadow-md"
                >
                  {isPlayingRecording ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <div className="text-xs text-neutral-400">
                  Click play to review your Nepali vocal flow over the take.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            Close Booth
          </button>
        </div>
      </div>
    </div>
  );
};
