import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Detect Procrastination Patterns API
app.post("/api/analyze-procrastination", async (req, res) => {
  try {
    const { semester, subjects, examDate, dailyFreeTime, attendancePercentage, survey } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Identify a student's procrastination profile based on:
Semester: ${semester}
Subjects: ${subjects?.join(", ")}
Upcoming Exam date: ${examDate}
Daily free study time: ${dailyFreeTime} hours
Current attendance: ${attendancePercentage}%
Student self-report behavior: ${survey || "Tends to postpone until the deadline feels extremely close."}

Provide standard types of procrastination, such as:
- 'The Perfectionist' (Fear of not doing it perfectly, so doesn't start)
- 'The Crisis Maker' (Gets high on the deadline rush)
- 'The Dreamer' (Wants easy goals, avoids hard work)
- 'The Defier' (Resents the structured schedule)
- 'The Worrier' (Fears failure, gets overwhelmed)
- 'The Passive Evader' (Distracts with mini-tasks or social media)

Formulate a professional and highly encouraging assessment that explicitly reasons on their academic pressure (specifically analyzing if their attendance is dangerously close to the 75% critical cutoff). Deliver the output strictly in the specified JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            procrastinationType: {
              type: Type.STRING,
              description: "The identified procrastination style (e.g. 'The Crisis Maker')."
            },
            analysis: {
              type: Type.STRING,
              description: "A constructive, highly encouraging, customized 3-4 sentence analysis explaining why they fall in this category and analyzing their 75% attendance situation if applicable."
            },
            focusTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable focus tips tailored specifically for this student profile."
            }
          },
          required: ["procrastinationType", "analysis", "focusTips"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Procrastination Analysis error:", error);
    res.status(500).json({
      procrastinationType: "The Overwhelmed Learner",
      analysis: "Unable to contact parent AI. Remember: taking the first step is always the hardest. Break your work into tiny blocks to reduce anxiety.",
      focusTips: [
        "Commit to studying for just 5 minutes right now.",
        "Remove phone distractions from your workspace.",
        "Plan your day with a clear visual calendar."
      ],
      error: error.message
    });
  }
});

// 2. Break Chapters into Microtasks (Pomodoro) API
app.post("/api/break-chapter", async (req, res) => {
  try {
    const { chapterName, subject } = req.body;
    if (!chapterName) {
      return res.status(400).json({ error: "Chapter name is required." });
    }
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Break down the study chapter "${chapterName}" for the subject "${subject || 'General'}" into a detailed series of exactly 4-5 microtasks. Each task must represent a focused 25-minute study block (one Pomodoro session) suitable for a student. Include clear names and descriptive micro-objectives so they don't get distracted. Apply higher XP rewards for harder tasks. Deliver output in JSON matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Compact task name." },
                  description: { type: Type.STRING, description: "Actionable study objective for this 25 min Pomodoro block." },
                  duration: { type: Type.INTEGER, description: "Block length (always 25 minutes)." },
                  xpReward: { type: Type.INTEGER, description: "XP award, typically 10 for standard, 15 for tricky steps." }
                },
                required: ["title", "description", "duration", "xpReward"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Break Chapter error:", error);
    res.status(500).json({
      tasks: [
        { title: "Introduction & Context Setting", description: "Read summary or key points of the chapter to establish basic familiarity.", duration: 25, xpReward: 10 },
        { title: "Core Terminologies & Mindmap", description: "Identify and write down the top 5 definitions and how they connect.", duration: 25, xpReward: 10 },
        { title: "Deep Dive Concepts", description: "Study the primary core mechanics of the chapter with hands-on scribble notes.", duration: 25, xpReward: 15 },
        { title: "Scribble Session / Self Quiz", description: "Try to explain what you learned out loud or on paper without looking.", duration: 25, xpReward: 10 }
      ],
      error: error.message
    });
  }
});

// 3. Generate Non-judgmental Recovery Plan API
app.post("/api/generate-recovery", async (req, res) => {
  try {
    const { missedDaysCount, missedTasks, subjects } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `The student missed ${missedDaysCount || 1} days of planning and has these specific missed tasks waiting: ${JSON.stringify(missedTasks || [])}. Create a highly encouraging, ultra-kind Recovery Plan that splits these tasks evenly across the next 3 days. Do NOT blame or criticize them. Explain that slipping is normal but starting small is the best solution. Distribute rescheduled tasks in the JSON response, assigning a daysOffset (1, 2, or 3 days from today).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motivationLetter: {
              type: Type.STRING,
              description: "A personalized, incredibly warm, and constructive message comforting the student and assuring them they can recover easily."
            },
            rescheduledTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  subject: { type: Type.STRING },
                  xpReward: { type: Type.INTEGER },
                  daysOffset: { type: Type.INTEGER, description: "Days from now to insert (1, 2 or 3)" }
                },
                required: ["title", "description", "duration", "subject", "xpReward", "daysOffset"]
              }
            }
          },
          required: ["motivationLetter", "rescheduledTasks"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    const { missedTasks } = req.body || {};
    console.error("Generate Recovery Plans error:", error);
    res.status(500).json({
      motivationLetter: "Hey! Missing a day is completely okay. Life happens. What matters is our direction today, not yesterday's delays. Let's tackle these backlog tasks gently together!",
      rescheduledTasks: (missedTasks || []).map((t: any, idx: number) => ({
        title: `Recovery: ${t.title || 'Study session'}`,
        description: `Catchup: ${t.description || 'Gentle review of missed materials.'}`,
        duration: t.duration || 25,
        subject: t.subject || 'General',
        xpReward: (t.xpReward || 10) + 2, // Slight progress incentive
        daysOffset: (idx % 3) + 1
      })),
      error: error.message
    });
  }
});

// 4. Personal Study Coach & Chat summaries API
app.post("/api/study-chat", async (req, res) => {
  try {
    const { message, history, tasks, profile, notes, gamification } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }
    const ai = getGenAI();

    // Compile active tasks list
    const activeTasksText = tasks && tasks.length > 0 
      ? tasks.map((t: any) => `- Name: ${t.title} [Subject: ${t.subject}] | Date: ${t.date} | Duration: ${t.duration}m | XP: ${t.xpReward} | Status: ${t.completed ? 'COMPLETED' : 'PENDING'}`).join("\n")
      : "No active study tasks currently registered in the system.";

    // Compile cheat notes context
    const notesText = notes && notes.length > 0
      ? notes.map((n: any) => `* TITLE: ${n.title} (Subject: ${n.subject})\nCONTENT:\n${n.content}`).join("\n---\n")
      : "No custom cheat notes or formulas saved currently.";

    // Compile student profile information
    const profileText = profile 
      ? `Goal: ${profile.semester || 'Academic term'}
Subjects: ${profile.subjects?.join(", ") || 'General Study'}
Attendance Index: ${profile.attendancePercentage}% ${profile.attendancePercentage < 75 ? '(Under critical 75% cutoff!)' : ''}
Procrastination Profile: ${profile.procrastinationType || 'Unassessed'}
Custom focus tips: ${profile.focusTips?.join(". ") || 'Standard Pomodoro'}`
      : "No student academic profile configured yet.";

    // Compile level & streak
    const gamificationText = gamification
      ? `Level: ${gamification.level} | Total XP: ${gamification.xp} | Streak: ${gamification.streak} Days | Freezes available: ${gamification.streakFreezes || 0}`
      : "Level: 1 | XP: 0 | Streak: 0 Days";

    // System instruction coaching persona
    const systemInstruction = `You are the Anti-Procrastination Companion Parent AI, a friendly, encouraging, and highly professional personal academic coach and study tutor.
You have full access to the student's workspace state which is printed below.
Use this context to answer questions about their pending tasks, study milestones, attendance status, streak protections, or summarize chapters.
Be extremely supportive, positive, and action-oriented. Suggest clear pomodoro sessions (e.g., 25-minute sprints) when applicable.

Student Profile Context:
${profileText}

Gamification & Consistency:
${gamificationText}

Active Study Tasks:
${activeTasksText}

Revision Cheat Notes & Formulas:
${notesText}

Rules:
1. Speak directly to the student. Be encouraging but focused on dynamic action.
2. If the user asks about their tasks, references a note, or asks for a chapter summary, refer to the printed context.
3. Keep answers concise, highly scannable (using bullet points and bold headers), and structured for quick reading during study breaks.
4. If they ask to summarize a chapter/topic or want a revision guide, give them a high-quality, neat breakdown structured with markdown.`;

    // Process chat history in Gemini-compatible formats
    const contents: any[] = [];
    
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    
    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Study Chat error:", error);
    res.status(500).json({
      text: "I was unable to establish connection with my knowledge core right now, but do not let that stall your momentum! Keep working on your scheduled tasks. Remember, consistency is your superpower! ❄️✨",
      error: error.message
    });
  }
});

// Serve frontend assets using Vite middleware or production static build
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Development] Fullstack server operational on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Production] Fullstack server serving from ${distPath} on port ${PORT}`);
  });
}
