export interface RapLine {
  nepali: string;
  romanized: string;
  english: string;
  rhymeKey: string;
  cadenceMarker: string;
}

export interface SongSection {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  title: string;
  flowNote: string;
  lines: RapLine[];
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface NepaliRapSong {
  id?: string;
  titleNepali: string;
  titleRoman: string;
  titleEnglish: string;
  artistPersona: string;
  subGenre: string;
  bpm: number;
  mood: string;
  beatDescription: string;
  summary: string;
  sections: SongSection[];
  glossary: GlossaryItem[];
  performanceTips: string[];
  generatedAudioUrl?: string;
  isLyriaGenerated?: boolean;
}

export type DisplayScriptMode = 'all' | 'nepali' | 'romanized' | 'english';

export type BeatStyle = 'boombap' | 'trap' | 'drill' | 'lofi' | 'nepalifolk';

export interface BeatPatternConfig {
  name: string;
  genre: BeatStyle;
  bpm: number;
  description: string;
  kickPattern: number[]; // 16 steps: 1 or 0
  snarePattern: number[];
  hihatPattern: number[];
  bassPattern: number[]; // note pitch frequencies or 0
  melodyPattern: number[]; // note frequencies or 0
}
