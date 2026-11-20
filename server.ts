import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_CATEGORIES = [
  'Tech & AI',
  'Arts & Culture',
  'Sports',
  'Career',
  'Social',
  'Academic',
] as const;

interface AutoFillRequestBody {
  title?: string;
  venue?: string;
  date?: string;
  time?: string;
  apiKey?: string;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/autofill', async (req, res) => {
    try {
      const body = (req.body ?? {}) as AutoFillRequestBody;
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const venue = typeof body.venue === 'string' ? body.venue.trim() : '';
      const date = typeof body.date === 'string' ? body.date.trim() : '';
      const time = typeof body.time === 'string' ? body.time.trim() : '';
      const userApiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';

      if (!title) {
        res.status(400).json({
          error: 'Enter an event title first so Gemini can draft a description and category.',
        });
        return;
      }

      const effectiveKey = userApiKey || process.env.GEMINI_API_KEY || '';
      if (!effectiveKey) {
        res.status(400).json({
          error: 'Paste your Gemini API key in the field above to run Auto-Fill with AI.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: effectiveKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextLines = [
        `Event Title: ${title}`,
        venue ? `Campus Venue: ${venue}` : '',
        date ? `Date: ${date}` : '',
        time ? `Time: ${time}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const prompt = [
        'You are helping a university student club organiser write a concise, engaging campus event listing.',
        'Based on the event details below, generate:',
        '1. "category": Pick the single best fit from: Tech & AI, Arts & Culture, Sports, Career, Social, Academic.',
        '2. "description": Write a clear, welcoming 2-sentence description (30 to 55 words) explaining what attendees will experience and who should come. Avoid clichés, emojis, and exclamation-mark spam.',
        '',
        contextLines,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: [...ALLOWED_CATEGORIES],
                description: 'Best matching campus event category.',
              },
              description: {
                type: Type.STRING,
                description: 'Concise 2-sentence campus event description.',
              },
            },
            required: ['category', 'description'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          error: 'Gemini returned an empty response. Please try again.',
        });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        category?: string;
        description?: string;
      };

      const matchedCategory = ALLOWED_CATEGORIES.includes(
        parsed.category as (typeof ALLOWED_CATEGORIES)[number]
      )
        ? parsed.category
        : 'Social';

      const description =
        typeof parsed.description === 'string' ? parsed.description.trim() : '';

      if (!description) {
        res.status(502).json({
          error: 'Gemini could not produce an event description. Please try refining your title.',
        });
        return;
      }

      res.json({
        category: matchedCategory,
        description,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error calling Gemini API.';
      const lower = message.toLowerCase();

      if (lower.includes('api_key_invalid') || lower.includes('api key not valid') || lower.includes('400')) {
        res.status(400).json({
          error: 'The provided Gemini API key appears invalid. Double-check the key and try again.',
        });
        return;
      }

      if (lower.includes('permission_denied') || lower.includes('403')) {
        res.status(403).json({
          error: 'Permission denied for this Gemini API key. Verify key access and billing settings.',
        });
        return;
      }

      if (lower.includes('resource_exhausted') || lower.includes('429')) {
        res.status(429).json({
          error: 'Gemini API rate limit or quota reached. Wait a moment or check your API key quota.',
        });
        return;
      }

      res.status(500).json({
        error: `Gemini Auto-Fill failed: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusPulse server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusPulse server:', err);
  process.exit(1);
});
