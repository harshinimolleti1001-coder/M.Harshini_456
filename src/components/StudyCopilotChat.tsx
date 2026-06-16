import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  Flame,
  AlertTriangle
} from "lucide-react";
import { StudentProfile, StudyTask, NotesItem, GamificationState } from "../types";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

interface StudyCopilotChatProps {
  profile: StudentProfile | null;
  tasks: StudyTask[];
  notes: NotesItem[];
  gamification: GamificationState;
  isLight: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudyCopilotChat({
  profile,
  tasks,
  notes,
  gamification,
  isLight,
  isOpen,
  onClose
}: StudyCopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "👋 Hello Student! I am your Anti-Procrastination Personal Coach. Ask me questions about your upcoming exam, get quick cheat note summaries, review pending tasks, or brainstorm high-efficiency revision strategies. Let's get to work!",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal.trim();
    if (!textToSend || loading) return;

    if (!customText) {
      setInputVal("");
    }

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      // Build history payload
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/study-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          tasks,
          profile,
          notes,
          gamification
        })
      });

      if (!res.ok) {
        throw new Error("Failed to contact study assistant");
      }

      const data = await res.json();
      const modelResponseText = data.text || "I apologize, my communication core has encountered a brief stall. Let's continue studying!";

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: modelResponseText,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "⚠️ Oh no! I'm having trouble matching your context coordinates right now. Check your internet connection or verify your API keys are registered under Secrets in AI Studio Settings.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptType: string, meta?: any) => {
    let promptText = "";
    if (promptType === "tasks") {
      promptText = "Could you analyze our current active study tasks? Let me know which ones I should focus on first based on priority, and offer focus tips to avoid putting them off.";
    } else if (promptType === "summary" && meta) {
      promptText = `Can you quickly summarize my cheat note titled "${meta.title}" in Subject "${meta.subject}"? Break it down into clear core concepts and design 2 quick-recall questions about it.`;
    } else if (promptType === "attendance") {
      promptText = `My attendance is currently at ${profile?.attendancePercentage || 0}%. Can you offer guidance on how to avoid falling under the 75% cutoff and optimize my study plan accordingly?`;
    } else if (promptType === "streak") {
      promptText = "How do study streaks and fallback streak freezes protect my consistency index? Could you design a quick plan to maintain a high streak?";
    } else if (promptType === "general_summary") {
      promptText = "Can you draft a comprehensive master summary of all my saved cheat notes to help me review my full curriculum?";
    }

    if (promptText) {
      handleSendMessage(promptText);
    }
  };

  // Theme support
  const drawerBg = isLight 
    ? "bg-slate-50 border-l border-slate-200 text-slate-800" 
    : "bg-slate-900 border-l border-white/10 text-slate-100";

  const messageBubbleClass = (role: "user" | "model") => {
    if (role === "user") {
      return isLight
        ? "bg-indigo-600 text-white self-end ml-12 rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm text-sm"
        : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white self-end ml-12 rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md shadow-indigo-600/10 text-sm";
    }
    return isLight
      ? "bg-white border border-slate-200 text-slate-800 self-start mr-12 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs text-sm"
      : "bg-white/5 border border-white/5 text-slate-200 self-start mr-12 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-sm";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div 
        className="fixed inset-0 bg-transparent z-[49]" 
        onClick={onClose}
      />

      <div 
        id="study-copilot-sidebar"
        className={`fixed right-0 top-0 h-screen w-full sm:w-[420px] ${drawerBg} shadow-2xl z-50 flex flex-col transition-all duration-300 animate-slide-in`}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/20'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Parent Coach AI</h2>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tutor Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <span className={`text-[9px] font-semibold text-slate-400 uppercase tracking-wider ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                {msg.role === 'user' ? 'You' : 'AI Coach'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className={messageBubbleClass(msg.role)}>
                {/* Custom basic formatting helper to support lists and bold texts cleanly without full-blown dependency */}
                <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                  {msg.text.split("\n").map((line, idx) => {
                    let formattedLine = line;
                    // Detect custom subheadings
                    if (formattedLine.startsWith("### ")) {
                      return <h4 key={idx} className="font-bold text-xs text-indigo-400 mt-2 mb-1 uppercase tracking-wide">{formattedLine.replace("### ", "")}</h4>;
                    }
                    if (formattedLine.startsWith("## ")) {
                      return <h3 key={idx} className="font-bold text-sm text-purple-400 mt-3 mb-1">{formattedLine.replace("## ", "")}</h3>;
                    }
                    if (formattedLine.startsWith("# ")) {
                      return <h2 key={idx} className="font-extrabold text-base text-cyan-400 mt-4 mb-2">{formattedLine.replace("# ", "")}</h2>;
                    }

                    // Bold texts highlight
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = boldRegex.exec(formattedLine)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(formattedLine.substring(lastIndex, match.index));
                      }
                      parts.push(<strong key={match.index} className="text-cyan-400 font-extrabold">{match[1]}</strong>);
                      lastIndex = boldRegex.lastIndex;
                    }
                    if (lastIndex < formattedLine.length) {
                      parts.push(formattedLine.substring(lastIndex));
                    }

                    return (
                      <p key={idx} className={formattedLine.trim() === "" ? "h-2" : "mb-1.5"}>
                        {parts.length > 0 ? parts : formattedLine}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Assistant thoughts loader */}
          {loading && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">AI Coach is thinking...</span>
              <div className={messageBubbleClass("model")}>
                <div className="flex items-center gap-1 py-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Suggestion Anchors */}
        <div className={`p-3 border-t ${isLight ? 'border-slate-200 bg-slate-100' : 'border-white/5 bg-slate-950/40'} text-xs overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none`}>
          <button 
            onClick={() => handleQuickPrompt("tasks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-400/20 text-[11px] font-semibold transition cursor-pointer shrink-0 ${isLight ? 'bg-white hover:bg-slate-50 text-indigo-600' : 'bg-indigo-900/10 hover:bg-indigo-900/25 text-indigo-300'}`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>📋 Prioritize My Tasks</span>
          </button>

          {notes && notes.length > 0 ? (
            notes.slice(0, 3).map((note) => (
              <button 
                key={note.id}
                onClick={() => handleQuickPrompt("summary", note)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/20 text-[11px] font-semibold transition cursor-pointer shrink-0 ${isLight ? 'bg-white hover:bg-slate-50 text-cyan-600' : 'bg-cyan-900/10 hover:bg-cyan-900/25 text-cyan-300'}`}
                title={`Summarize ${note.title}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📝 Summarize: {note.title}</span>
              </button>
            ))
          ) : (
            <button 
              onClick={() => handleSendMessage("Suggest some standard formulas, equations, or laws of physics I can create in my Cheat Notes tab today.")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-400/20 text-[11px] font-semibold transition cursor-pointer shrink-0 ${isLight ? 'bg-white hover:bg-slate-50 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 Sample Cheat Notes idea</span>
            </button>
          )}

          {profile && profile.attendancePercentage < 75 ? (
            <button 
              onClick={() => handleQuickPrompt("attendance")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-300 text-[11px] font-semibold transition cursor-pointer shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>⚠️ Critical Attendance rescue</span>
            </button>
          ) : null}

          <button 
            onClick={() => handleQuickPrompt("streak")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-400/20 text-[11px] font-semibold transition cursor-pointer shrink-0 ${isLight ? 'bg-white hover:bg-slate-50 text-pink-600' : 'bg-pink-900/10 hover:bg-pink-900/25 text-pink-300'}`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>🔥 Streak protections explained</span>
          </button>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className={`p-3 border-t flex gap-2 items-center ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/30'}`}
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a message or ask for summaries..."
            disabled={loading}
            className={`flex-1 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-800 focus:bg-white' : 'bg-white/5 border border-white/5 text-slate-100 focus:bg-white/10'}`}
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
