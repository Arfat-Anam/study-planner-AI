import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// Helper to sanitize and parse JSON safely
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// 1. AI Study Planner Generator
app.post('/api/planner/generate', async (req, res) => {
  try {
    const { subjects, goal, examDates, dailyHours, difficulty, preferences, daysCount = 7 } = req.body;

    if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
      return res.status(400).json({ error: 'Please specify at least one subject.' });
    }

    const prompt = `You are StudyPilot AI, an elite academic advisor and cognitive learning strategist.
Generate a comprehensive, scientifically optimized ${daysCount}-day study schedule based on these requirements:
- Subjects: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}
- Primary Academic Goal: ${goal || 'Comprehensive Mastery & Exam Prep'}
- Upcoming Exam/Target Deadlines: ${examDates || 'Within the next 2-4 weeks'}
- Available Daily Study Hours: ${dailyHours || 4} hours
- Difficulty Level: ${difficulty || 'intermediate'}
- Personal Preferences & Techniques: ${preferences || 'Pomodoro intervals, active recall, problem solving, spaced repetition'}

Produce a structured JSON response matching the following schema. Ensure every day has 3 to 5 realistic time blocks with actionable checkpoint goals and high-yield cognitive learning techniques (such as Feynman Technique, Blurting, Spaced Practice, LeetCode/Problem Sets, Interleaved Practice).`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Engaging title for the plan' },
            summary: { type: Type.STRING, description: 'Executive summary of the study plan and strategy' },
            strategyNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key pedagogical strategies applied (e.g., active recall, interleaving)',
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: 'e.g. Day 1 - Monday' },
                  date: { type: Type.STRING, description: 'e.g. Day 1' },
                  focusTheme: { type: Type.STRING, description: 'Primary focus theme for this day' },
                  timeBlocks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        time: { type: Type.STRING, description: 'e.g. 09:00 - 10:15' },
                        subject: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        priority: { type: Type.STRING, description: 'high | medium | low' },
                        studyTechnique: { type: Type.STRING },
                        checkpointGoal: { type: Type.STRING },
                      },
                      required: ['id', 'time', 'subject', 'topic', 'activity', 'durationMinutes', 'priority', 'studyTechnique', 'checkpointGoal'],
                    },
                  },
                },
                required: ['day', 'date', 'focusTheme', 'timeBlocks'],
              },
            },
          },
          required: ['title', 'summary', 'strategyNotes', 'schedule'],
        },
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Planner API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

// 2. AI Tutor & Problem Solver
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { message, subject, mode = 'step_by_step', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    let modeInstruction = 'Provide clear, methodical, and engaging academic tutoring.';
    if (mode === 'math_solver') {
      modeInstruction = 'Act as an expert STEM & Mathematics problem solver. Break down the equation or problem line-by-line. Show exact formula substitutions, explain intermediate logic, and state the final answer clearly with units or verification.';
    } else if (mode === 'step_by_step') {
      modeInstruction = 'Explain this concept step-by-step using progressive scaffolding. First define core intuition, then break into 3-4 distinct logical steps, give a concrete analogy or real-world example, and finish with a check-for-understanding question.';
    } else if (mode === 'simplify') {
      modeInstruction = 'Explain this concept like I am a beginner with no prior background (Feynman Technique / ELI5). Use simple analogies, eliminate heavy jargon without losing accuracy, and provide clear intuition.';
    } else if (mode === 'concept_deep_dive') {
      modeInstruction = 'Provide an advanced, rigorous conceptual breakdown including historical context, mathematical/scientific rigor, edge cases, common pitfalls students make, and exam preparation tips.';
    }

    const systemInstruction = `You are StudyPilot AI's Master Academic Tutor.
Current Subject Focus: ${subject || 'General Academics'}.
Tutoring Mode: ${mode}.
Guidance: ${modeInstruction}
Format your response using clean Markdown with bold headers, bullet points, and code blocks or LaTeX-like formatting for mathematical expressions.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Map valid history turns
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('Tutor API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get tutor response' });
  }
});

// 3. AI Quiz Generator
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, subject, questionCount = 5, difficulty = 'medium', quizType = 'mixed' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const prompt = `Generate an interactive ${difficulty} difficulty practice quiz on the topic "${topic}" in the subject "${subject || 'General'}".
The quiz should have exactly ${questionCount} questions.
Quiz type: ${quizType} (e.g. Multiple Choice and/or True/False).
Every question must have:
- Clear question text
- 4 options for MCQ (or 2 for True/False: ["True", "False"])
- The zero-based index of the correct answer (correctAnswerIndex)
- Detailed pedagogical explanation explaining why the correct answer is right and why the distractors are wrong
- A helpful hint that guides thinking without giving away the exact answer.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'mcq | true_false' },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['id', 'type', 'question', 'options', 'correctAnswerIndex', 'explanation', 'hint'],
              },
            },
          },
          required: ['title', 'subject', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Quiz API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 4. Notes Summarizer & Key Concept Extractor
app.post('/api/notes/summarize', async (req, res) => {
  try {
    const { content, title, subject } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Note content is required.' });
    }

    const prompt = `Analyze and summarize the following study notes for the subject "${subject || 'General'}" (Title: "${title || 'Untitled Notes'}"):

"""
${content}
"""

Provide a structured study summary including:
1. Executive Summary: A crisp, clear synopsis capturing the essential thesis.
2. Key Takeaways: High-yield bullet points of critical formulas, facts, or concepts.
3. Review Questions / Active Recall: 3-5 questions the student should test themselves on.
4. Mnemonic / Memory Device: Clever memory tricks or acronyms to recall key components.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            activeRecallQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            memoryAids: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['executiveSummary', 'keyTakeaways', 'activeRecallQuestions', 'memoryAids'],
        },
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Notes Summarizer API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to summarize notes' });
  }
});

// 5. Flashcards Generator
app.post('/api/flashcards/generate', async (req, res) => {
  try {
    const { sourceText, topic, subject, count = 6 } = req.body;

    if (!sourceText && !topic) {
      return res.status(400).json({ error: 'Please provide either source text or a topic.' });
    }

    const prompt = `Generate ${count} high-yield, spaced-repetition flashcards for the subject "${subject || 'General'}" on topic "${topic || 'General'}".
${sourceText ? `Based on this text:\n"""${sourceText}"""` : ''}

Flashcard principles:
- Front: A specific, non-ambiguous prompt, formula name, term, or question.
- Back: Concise, authoritative definition, derivation, or explanation.
- Hint: A subtle clue or memory trigger.
- Category: Tag or subtopic.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['id', 'front', 'back', 'hint', 'category'],
              },
            },
          },
          required: ['deckTitle', 'cards'],
        },
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Flashcards API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Serve frontend with Vite in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StudyPilot AI server running on port ${PORT}`);
  });
}

startServer();
