// Speech synthesis utility to speak Nepali or Romanized bars with adjustable rate and pitch

export class SpeechVoiceReader {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private onLineChange: ((index: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speakLine(
    text: string,
    lang: 'ne-NP' | 'hi-IN' | 'en-US' = 'ne-NP',
    rate = 1.05,
    pitch = 0.95,
    onEnd?: () => void
  ) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a Nepali or Hindi voice if available, else standard
    const voices = this.synth.getVoices();
    const neVoice = voices.find((v) => v.lang.startsWith('ne') || v.lang.startsWith('hi'));
    if (neVoice) {
      utterance.voice = neVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  public readSongLines(
    lines: string[],
    lang: 'ne-NP' | 'hi-IN' | 'en-US' = 'ne-NP',
    onLineIndex: (idx: number) => void,
    onFinished: () => void,
    rate = 1.05
  ) {
    if (!this.synth || lines.length === 0) return;
    this.synth.cancel();
    this.isSpeaking = true;
    this.onLineChange = onLineIndex;
    this.onEndCallback = onFinished;

    let currentIndex = 0;

    const speakNext = () => {
      if (!this.isSpeaking || currentIndex >= lines.length) {
        this.isSpeaking = false;
        if (this.onEndCallback) this.onEndCallback();
        return;
      }

      if (this.onLineChange) this.onLineChange(currentIndex);
      const text = lines[currentIndex];
      currentIndex++;

      this.speakLine(text, lang, rate, 0.95, () => {
        // Small pause between bars for hip-hop breath timing
        setTimeout(() => {
          if (this.isSpeaking) {
            speakNext();
          }
        }, 180);
      });
    };

    speakNext();
  }

  public stop() {
    this.isSpeaking = false;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechReader = new SpeechVoiceReader();
