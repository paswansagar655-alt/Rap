import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Generate Nepali Rap Song with Gemini
  app.post('/api/generate-rap', async (req, res) => {
    try {
      const {
        theme = 'Kathmandu Street Life & Ambition',
        subGenre = 'Boom Bap',
        mood = 'Gritty & Inspiring',
        dialect = 'Kathmandu Urban Slang & Nepglish',
        tempo = 92,
        customPrompt = '',
        includeChorus = true,
        verseCount = 2,
      } = req.body;

      const ai = getGenAI();

      const systemInstruction = `You are a legendary Nepali hip-hop / rap pioneer and lyricist (inspired by pioneers of Nepali rap like Yama Buddha, Laure, Uniq Poet, MC Flo, Sacar, VTEN, and Dong).
Your mission is to write authentic, hard-hitting, deeply rhythmic Nepali rap songs with masterful rhyme schemes, clever wordplay, Nepali metaphors (काठमाडौँ, पशुपति, हिमाल, चिया पसल, सपना, गल्ली, संघर्ष), internal rhymes, and punchlines.

Every line must include:
1. 'nepali': Devanagari script with natural rap cadence and slang.
2. 'romanized': Romanized transliteration in Nepglish (easy to read and rap along with accurate pronunciation).
3. 'english': Direct English translation/meaning so non-native speakers understand every bar.
4. 'rhymeKey': Group identifier for rhyming bars (e.g. 'A', 'B', 'C').
5. 'cadenceMarker': Flow instruction (e.g. 'Heavy 4/4 Punch', 'Fast Triplet Flow', 'Laid-back Drag', 'Staccato Delivery', 'Melodic Hook').

Also provide:
- A catchy title in Nepali, Romanized, and English.
- Recommended BPM and Beat Description tailored for music/beat generation.
- A Nepali slang glossary explaining cultural terms and rap lingo used in the track.
- Performance and delivery tips for rapping in Nepali.`;

      const prompt = `Write an authentic Nepali Rap Song based on:
- Theme / Topic: ${theme}
- Sub-Genre: ${subGenre} (e.g., Boom Bap, Trap, Drill, Lo-fi, Folk-Rap fusion)
- Mood & Tone: ${mood}
- Dialect Style: ${dialect}
- Target BPM: ${tempo}
- Structure: Intro, ${verseCount} Verses, ${includeChorus ? 'Chorus (catchy & memorable hook),' : ''} and Outro.
- Additional Instructions: ${customPrompt || 'Make the rhymes tight with multisyllabic schemes, street metaphors, and motivational bars.'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleNepali: { type: Type.STRING, description: 'Title in Nepali Devanagari' },
              titleRoman: { type: Type.STRING, description: 'Romanized Title' },
              titleEnglish: { type: Type.STRING, description: 'English translation of Title' },
              artistPersona: { type: Type.STRING, description: 'Suggested artist name or persona' },
              subGenre: { type: Type.STRING, description: 'Sub-genre of rap' },
              bpm: { type: Type.INTEGER, description: 'BPM tempo' },
              mood: { type: Type.STRING, description: 'Mood/Vibe' },
              beatDescription: { type: Type.STRING, description: 'Detailed beat generation prompt with instruments, drums, bass, and vibe' },
              summary: { type: Type.STRING, description: 'Brief background story/theme of this rap song' },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: 'intro | verse | chorus | bridge | outro' },
                    title: { type: Type.STRING, description: 'Section title, e.g. Verse 1 / पहिलो हरफ' },
                    flowNote: { type: Type.STRING, description: 'Flow cadence instructions for delivery' },
                    lines: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          nepali: { type: Type.STRING, description: 'Devanagari lyric line' },
                          romanized: { type: Type.STRING, description: 'Romanized transliteration' },
                          english: { type: Type.STRING, description: 'English translation' },
                          rhymeKey: { type: Type.STRING, description: 'Rhyme identifier e.g. A, B' },
                          cadenceMarker: { type: Type.STRING, description: 'Flow cadence marker' },
                        },
                        required: ['nepali', 'romanized', 'english', 'rhymeKey', 'cadenceMarker'],
                      },
                    },
                  },
                  required: ['type', 'title', 'flowNote', 'lines'],
                },
              },
              glossary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: 'Nepali word/slang in Devanagari + Roman' },
                    meaning: { type: Type.STRING, description: 'Meaning and cultural context' },
                  },
                  required: ['term', 'meaning'],
                },
              },
              performanceTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'titleNepali',
              'titleRoman',
              'titleEnglish',
              'artistPersona',
              'subGenre',
              'bpm',
              'mood',
              'beatDescription',
              'summary',
              'sections',
              'glossary',
              'performanceTips',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI model');
      }

      const songData = JSON.parse(text);
      res.json({ success: true, song: songData });
    } catch (error: any) {
      console.error('Error generating rap song:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate Nepali rap song',
      });
    }
  });

  // Lyria AI Music Generation Endpoint
  app.post('/api/generate-music', async (req, res) => {
    try {
      const {
        prompt = 'Heavy 90s hip hop boom bap drum beat, 808 sub bass, nepali flute bansuri melody, urban gritty vibe 90 bpm',
        model = 'lyria-3-clip-preview', // 'lyria-3-clip-preview' (30s) or 'lyria-3-pro-preview' (full track)
      } = req.body;

      const ai = getGenAI();

      const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        throw new Error('No audio data received from Lyria music model');
      }

      res.json({
        success: true,
        audioBase64,
        mimeType,
        lyrics,
        model: selectedModel,
      });
    } catch (error: any) {
      console.error('Error in Lyria music generation:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Music generation failed. Make sure a valid GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }
  });

  // Rewrite / Refine Verse
  app.post('/api/refine-section', async (req, res) => {
    try {
      const { section, instruction, styleContext } = req.body;
      const ai = getGenAI();

      const prompt = `Refine this Nepali rap section based on user feedback:
Feedback/Instruction: ${instruction}
Current Section Data:
${JSON.stringify(section, null, 2)}
Overall Style Context: ${styleContext || 'Nepali hip-hop'}

Return the revised section maintaining Devanagari Nepali, Romanized transliteration, English translation, rhymeKey, and cadenceMarker.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              flowNote: { type: Type.STRING },
              lines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nepali: { type: Type.STRING },
                    romanized: { type: Type.STRING },
                    english: { type: Type.STRING },
                    rhymeKey: { type: Type.STRING },
                    cadenceMarker: { type: Type.STRING },
                  },
                  required: ['nepali', 'romanized', 'english', 'rhymeKey', 'cadenceMarker'],
                },
              },
            },
            required: ['type', 'title', 'flowNote', 'lines'],
          },
        },
      });

      const updatedSection = JSON.parse(response.text || '{}');
      res.json({ success: true, section: updatedSection });
    } catch (error: any) {
      console.error('Error refining section:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nepali Rap Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
