# StudyPilot AI 🚀

**StudyPilot AI** is an intelligent academic study planner and learning operating system built with React, TypeScript, Tailwind CSS, Express, and Google's Gemini 3.8 Flash API via the modern `@google/genai` TypeScript SDK.

## Key Features

1. **Academic Command Center (Dashboard)**
   - Real-time study metrics: logged study hours, task completion rate, streak tracking, and next exam horizons.
   - Today's AI study schedule with quick check-off and direct Pomodoro launcher.
   - Priority tasks and upcoming exam countdowns.
   - Daily cognitive technique spotlight.

2. **AI Study Planner**
   - Generates personalized daily and multi-day study schedules using target subjects, primary goals, exam deadlines, daily hours, difficulty level, and study preferences.
   - Formulates structured time blocks with specific goals, duration, priorities, techniques (Feynman, Blurting, Interleaved Practice), and checkpoints.
   - Ability to add custom study blocks, delete blocks, or toggle block completion.
   - One-click "Sync Day to Tasks" that automatically generates actionable checklist tasks in the Task Manager.

3. **AI Concept Tutor & Problem Solver**
   - 4 specialized tutoring modes:
     - **Step-by-Step**: Progressive conceptual scaffolding with analogies and self-checks.
     - **Math Solver**: Line-by-line substitutions, algebraic derivations, and verification.
     - **Simplify (ELI5)**: Jargon-free intuitive explanations using the Feynman technique.
     - **Deep Dive**: Rigorous mathematical rigor, common exam traps, and edge cases.
   - Quick starter prompt shortcuts across Mathematics, Computer Science, Physics, and Chemistry.

4. **AI Quiz Generator**
   - Generates adaptive practice diagnostics with configurable difficulty, questions count, and question types (MCQ, True/False, Mixed).
   - Interactive testing mode with immediate feedback, rationale for both correct answers and distractors, contextual hints, and confetti celebration on completion.

5. **Notes & Spaced Repetition Flashcards**
   - Rich Markdown study note library.
   - 1-click **"Summarize with AI"** extracting executive synopses, key exam takeaways, active recall questions, and memory aids/mnemonics.
   - 1-click **"Extract Flashcards"** from notes or any topic prompt.
   - Interactive 3D flip card with SM-2 spaced repetition grading (Again, Hard, Good, Easy) and due queue counters.

6. **Task Manager**
   - Full task management: Add, edit, delete, prioritize (High/Medium/Low), filter by status (All/Active/Completed), filter by Subject, and live search.

7. **Study Calendar**
   - Month, Week, and Day views displaying upcoming exam dates, assignment deadlines, and daily scheduled study sessions with click-to-inspect agenda.

8. **Focus Pomodoro Timer**
   - Customizable focus and break intervals (25m Focus, 5m Short Break, 15m Long Break).
   - Zero-latency synthesized Web Audio ambient soundscapes (Gentle Rain, Library Hum, White Noise, Silent).
   - Harmonic audio chime upon session completion.
   - Automatic focus session logger linked directly to Study Analytics.

9. **Study Analytics & Consistency Heatmap**
   - Interactive SVG weekly hours bar chart.
   - Subject distribution breakdown.
   - 28-day study consistency matrix heatmap.
   - Composite Cognitive Exam Readiness score.

## Architecture & Security

- **Server-Side AI Calls**: All Gemini calls run through server-side Express routes (`server.ts`) using the `@google/genai` SDK and `gemini-3.8-flash`. API keys are never exposed to the client browser.
- **Persistence**: High-yield initial seed data and full state persistence in `localStorage`.
- **Styling**: Tailwind CSS with dark slate theme, violet accents, and clean Plus Jakarta Sans & JetBrains Mono typography.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```
