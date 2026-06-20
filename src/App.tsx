import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Award, BookOpen, GraduationCap, Sparkles, PhoneCall, RefreshCw, Flame, Sun, Moon, Languages } from "lucide-react";
import ClassSelect from "./components/ClassSelect";
import KbcGame from "./components/KbcGame";
import GradeReporting from "./components/GradeReporting";
import Leaderboard from "./components/Leaderboard";
import { LeaderboardEntry, GradeReport, QuizQuestion, SubjectType, BaselineDifficulty } from "./types";
import { locales } from "./locales";

type TabType = "home" | "game" | "reports" | "leaderboard";

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  // 🥇 Rank 1 — "Grand Scholar" — Requires ~5-7 perfect sessions + bonus rounds to surpass (~450M)
  { id: "mock-1", studentName: "🏆 Arjun Verma", classLevel: 12, subject: "science", points: 450000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 198, date: "2026-06-01" },
  // 🥈 Rank 2 — Requires ~3-4 perfect sessions to surpass (~280M)
  { id: "mock-2", studentName: "🌟 Aisha Kapoor", classLevel: 10, subject: "history", points: 280000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 215, date: "2026-06-05" },
  // 🥉 Rank 3 — Requires 2 perfect sessions + bonus to surpass (~160M)
  { id: "mock-3", studentName: "🎓 Rohan Mehta", classLevel: 11, subject: "gk", points: 160000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 230, date: "2026-06-08" },
  // Rank 4 — Requires 1 perfect game + a great bonus round (~95M)
  { id: "mock-4", studentName: "Priya Sharma", classLevel: 9, subject: "science", points: 95000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 265, date: "2026-06-10" },
  // Rank 5 — Requires 1 perfect standard game (70M) to beat
  { id: "mock-5", studentName: "Kabir Singhania", classLevel: 8, subject: "history", points: 70000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 290, date: "2026-06-12" },
  // Rank 6 — Requires 9/10 on hard difficulty (50L)
  { id: "mock-6", studentName: "Ananya Iyer", classLevel: 7, subject: "gk", points: 5000000, score: 9, totalQuestions: 10, accuracy: 90, timeSpent: 245, date: "2026-06-14" },
  // Rank 7 — Requires 8/10 correct (12.5L)
  { id: "mock-7", studentName: "Vihaan Gupta", classLevel: 6, subject: "science", points: 1250000, score: 8, totalQuestions: 10, accuracy: 80, timeSpent: 210, date: "2026-06-15" },
  // Rank 8 — Beatable with a decent first game (3.2L)
  { id: "mock-8", studentName: "Meera Nair", classLevel: 5, subject: "history", points: 320000, score: 7, totalQuestions: 10, accuracy: 70, timeSpent: 185, date: "2026-06-18" },
];

const DEFAULT_REPORTS: GradeReport[] = [
  {
    id: "rep-mock-1",
    studentName: "Aarav Sharma",
    classLevel: 8,
    subject: "science",
    pointsWon: 70000000,
    correctCount: 10,
    totalQuestions: 10,
    accuracy: 100,
    timeSpent: 245,
    date: "2026-06-18",
    results: [
      { question: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Fe", "Gd"], userAnswer: "Au", correctAnswer: "Au", isCorrect: true, explanation: "Au is derived from the Latin word 'Aurum', which means shining dawn." },
      { question: "Which organ rules the nervous system in humans?", options: ["Heart", "Lungs", "Brain", "Kidney"], userAnswer: "Brain", correctAnswer: "Brain", isCorrect: true, explanation: "The brain acts as the central control unit for the nervous system." }
    ],
    aiFeedback: "Masterful performance, Aarav! You demonstrated absolute precision. Keep exploring high-level astrophysics and quantum concepts."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme_mode");
    return (saved === "light" || saved === "dark") ? saved : "light";
  });

  const [language, setLanguage] = useState<"en" | "hi">((() => {
    const saved = localStorage.getItem("kbc_language");
    return (saved === "en" || saved === "hi") ? saved : "en";
  }) as any);

  useEffect(() => {
    localStorage.setItem("kbc_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("theme_mode", themeMode);
  }, [themeMode]);

  
  // Registration Data
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem("kbc_student_name") || "";
  });
  const [classLevel, setClassLevel] = useState<number>(5);
  const [subject, setSubject] = useState<SubjectType>("gk");
  const [timelessMode, setTimelessMode] = useState(false);
  const [baselineDifficulty, setBaselineDifficulty] = useState<BaselineDifficulty>("medium");

  // Endless Mode and custom counts states 
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isEndless, setIsEndless] = useState<boolean>(false);
  const [endlessDurationSeconds, setEndlessDurationSeconds] = useState<number>(300);

  const dict = locales[language] || locales.en;

  // Game/API operational states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLobbyLoading, setIsLobbyLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [reports, setReports] = useState<GradeReport[]>([]);

  // Fetch initial standings on mount
  useEffect(() => {
    fetchLeaderboard();
    fetchReports();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const saved = localStorage.getItem("kbc_leaderboard");
      if (saved) {
        setLeaderboard(JSON.parse(saved));
      } else {
        localStorage.setItem("kbc_leaderboard", JSON.stringify(DEFAULT_LEADERBOARD));
        setLeaderboard(DEFAULT_LEADERBOARD);
      }
    } catch (err) {
      console.warn("Unable to load leaderboard from localStorage, utilizing defaults:", err);
      setLeaderboard(DEFAULT_LEADERBOARD);
    }
  };

  const fetchReports = async () => {
    try {
      const saved = localStorage.getItem("kbc_reports");
      if (saved) {
        setReports(JSON.parse(saved));
      } else {
        localStorage.setItem("kbc_reports", JSON.stringify(DEFAULT_REPORTS));
        setReports(DEFAULT_REPORTS);
      }
    } catch (err) {
      console.warn("Unable to load reports from localStorage, utilizing defaults:", err);
      setReports(DEFAULT_REPORTS);
    }
  };

  // Triggers quiz generation on Backend and transitions
  const handleStartQuiz = async (
    name: string,
    grade: number,
    sub: SubjectType,
    timeless: boolean,
    baselineDiff: BaselineDifficulty,
    count: number,
    endlessMode: boolean,
    endlessSecs: number
  ) => {
    setStudentName(name);
    localStorage.setItem("kbc_student_name", name);
    setClassLevel(grade);
    setSubject(sub);
    setTimelessMode(timeless);
    setBaselineDifficulty(baselineDiff);
    setQuestionCount(count);
    setIsEndless(endlessMode);
    setEndlessDurationSeconds(endlessSecs);
    setIsLobbyLoading(true);
    setActiveTab("game");

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: grade,
          subject: sub,
          baselineDifficulty: baselineDiff,
          questionCount: endlessMode ? 60 : count, // Fetch 60 questions for long endless gameplay, otherwise standard count
          isEndless: endlessMode,
          language: language
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          throw new Error("No questions payload received from generation endpoints.");
        }
      } else {
        throw new Error("Generation server offline or endpoint error code.");
      }
    } catch (err) {
      console.error("API error during generation, fallback applied:", err);
    } finally {
      setIsLobbyLoading(false);
    }
  };

  // Handles Saving automated report cards & leaderboard entries
  const handleGameEnd = async (gameResults: {
    pointsWon: number;
    correctCount: number;
    totalQuestions: number;
    timeSpent: number;
    answersList: any[];
  }) => {
    setIsFeedbackLoading(true);
    setActiveTab("reports");

    let teacherRemark = `Excellent attempt, ${studentName}! You succeeded in Class ${classLevel} ${subject} with points of: ${gameResults.pointsWon.toLocaleString()}. Join us again next time!`;

    // 1. Fetch AI personalized Teacher remark from server
    try {
      const remarkRes = await fetch("/api/reports/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          classLevel,
          subject,
          correctCount: gameResults.correctCount,
          totalQuestions: gameResults.totalQuestions,
          pointsWon: gameResults.pointsWon,
          results: gameResults.answersList,
          language: language
        })
      });

      if (remarkRes.ok) {
        const markData = await remarkRes.json();
        if (markData.feedback) {
          teacherRemark = markData.feedback;
        }
      }
    } catch (err) {
      console.warn("Unable to fetch teacher feedback, applying static assessment:", err);
    }

    const accuracyVal = Math.round((gameResults.correctCount / gameResults.totalQuestions) * 100);

    // 2. Save Automated Grade Report locally
    const newReport: GradeReport = {
      studentName,
      classLevel,
      subject,
      pointsWon: gameResults.pointsWon,
      correctCount: gameResults.correctCount,
      totalQuestions: gameResults.totalQuestions,
      accuracy: accuracyVal,
      timeSpent: gameResults.timeSpent,
      results: gameResults.answersList,
      aiFeedback: teacherRemark,
      id: "rep-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().split("T")[0]
    };

    setReports((prev) => {
      const updated = [newReport, ...prev];
      localStorage.setItem("kbc_reports", JSON.stringify(updated));
      return updated;
    });

    // 3. Save Leaderboard Standings locally
    const newLeaderboardEntry: LeaderboardEntry = {
      studentName,
      classLevel,
      subject,
      points: gameResults.pointsWon,
      score: gameResults.correctCount,
      totalQuestions: gameResults.totalQuestions,
      accuracy: accuracyVal,
      timeSpent: gameResults.timeSpent,
      id: "lead-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().split("T")[0]
    };

    setLeaderboard((prev) => {
      const list = [newLeaderboardEntry, ...prev];
      // Sort descending by points, then accuracy, then ascending timeSpent
      list.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.timeSpent - b.timeSpent;
      });
      localStorage.setItem("kbc_leaderboard", JSON.stringify(list));
      return list;
    });

    setIsFeedbackLoading(false);
  };

  const handleRestart = () => {
    setActiveTab("home");
    setQuestions([]);
  };

  const handleClearData = async () => {
    try {
      // Attempt server clean up if running locally/monolith, but catch and ignore any error
      try {
        await fetch("/api/reports/clear", { method: "POST" });
      } catch (err) {
        console.warn("Bypassed server report clear:", err);
      }

      localStorage.removeItem("kbc_student_name");
      localStorage.removeItem("kbc_language");
      localStorage.removeItem("kbc_reports");
      localStorage.removeItem("kbc_leaderboard");
      setReports(DEFAULT_REPORTS);
      setLeaderboard(DEFAULT_LEADERBOARD);
      setStudentName("");
      handleRestart(); // Redirect home
    } catch (err) {
      console.error("Error clearing user session history:", err);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeMode === "light" ? "bg-slate-100 text-slate-800" : "bg-[#070817] bg-radial-gradient text-slate-100"} flex flex-col justify-between selection:bg-yellow-500/30`}>
      
      {/* Visual background ambient glow overlay */}
      {themeMode === "dark" ? (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-950/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-3xl pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Main Navigation Utility Ribbon */}
      <header className={`border-b ${themeMode === "light" ? "border-slate-200 bg-white/95 text-slate-900 shadow-sm" : "border-slate-900 bg-slate-950/80 text-white"} backdrop-blur-md sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div onClick={handleRestart} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold font-display shadow-md shadow-yellow-500/10 group-hover:scale-105 transition">
              🎓
            </div>
            <div>
              <h1 className={`${themeMode === "light" ? "text-slate-950" : "text-white text-glow"} font-display font-extrabold tracking-tight text-md sm:text-lg flex items-center gap-1.5`}>
                <span>Kaun Banega Scholar</span>
                <span className={`text-3xs font-mono font-bold uppercase tracking-widest ${themeMode === "light" ? "bg-blue-100 text-blue-600" : "bg-yellow-450/10 text-yellow-400"} px-1.5 py-0.5 rounded`}>
                  CLASS 1-12
                </span>
              </h1>
              <p className={`text-4xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} font-sans tracking-wide uppercase`}>Interactive Game Show & Real-time Analytics</p>
            </div>
          </div>

          {/* Navigation Action Buttons tab toggles and Theme Toggle */}
          <div className="flex items-center gap-3">
            <nav className={`flex items-center gap-1 ${themeMode === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-900"} p-1 rounded-xl border`}>
              <button
                onClick={() => { if (activeTab !== "game" || questions.length === 0) setActiveTab("home"); }}
                disabled={activeTab === "game" && questions.length > 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition ${
                  activeTab === "home"
                    ? themeMode === "light"
                      ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                      : "bg-slate-900 text-yellow-400 border border-slate-800"
                    : themeMode === "light"
                      ? "text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      : "text-slate-400 hover:text-white disabled:opacity-30"
                }`}
              >
                {dict.home}
              </button>

              <button
                onClick={() => { if (activeTab !== "game") setActiveTab("leaderboard"); }}
                disabled={activeTab === "game" && questions.length > 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition flex items-center gap-1 ${
                  activeTab === "leaderboard"
                    ? themeMode === "light"
                      ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                      : "bg-slate-900 text-yellow-400 border border-slate-800"
                    : themeMode === "light"
                      ? "text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      : "text-slate-400 hover:text-white disabled:opacity-30"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 animate-pulse" />
                <span>{dict.standings}</span>
              </button>

              <button
                onClick={() => { if (activeTab !== "game") setActiveTab("reports"); }}
                disabled={activeTab === "game" && questions.length > 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition flex items-center gap-1 ${
                  activeTab === "reports"
                    ? themeMode === "light"
                      ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                      : "bg-slate-900 text-yellow-400 border border-slate-800"
                    : themeMode === "light"
                      ? "text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      : "text-slate-400 hover:text-white disabled:opacity-30"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{dict.reports}</span>
              </button>
            </nav>

            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-extrabold cursor-pointer ${
                themeMode === "light"
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-705"
                  : "bg-slate-950 hover:bg-slate-900 border-slate-900 text-yellow-400"
              }`}
              title={language === "en" ? "हिन्दी में बदलें 🇮🇳" : "Switch to English 🇬🇧"}
            >
              <Languages className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="hidden sm:inline">{language === "en" ? "हिन्दी" : "Eng"}</span>
            </button>

            <button
              onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
              className={`p-2 rounded-xl border transition-colors ${
                themeMode === "light"
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-707"
                  : "bg-slate-950 hover:bg-slate-900 border-slate-900 text-yellow-400"
              }`}
              title={themeMode === "light" ? "Switch to Dark Mode 🌙" : "Switch to Light Mode ☀️"}
            >
              {themeMode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Render Box */}
      <main className="flex-grow py-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ClassSelect
                onStartQuiz={handleStartQuiz}
                onViewStats={() => setActiveTab("reports")}
                onViewLeaderboard={() => setActiveTab("leaderboard")}
                themeMode={themeMode}
                language={language}
              />
            </motion.div>
          )}

          {activeTab === "game" && (
            <div key="game" className="relative min-h-[400px]">
              {isLobbyLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6 text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
                    <span className="absolute inset-x-0 bottom-0 text-xl text-center">🧠</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className={`font-display font-extrabold ${themeMode === "light" ? "text-slate-800" : "text-white text-glow"} text-xl sm:text-2xl tracking-wider uppercase animate-bounce`}>
                      {language === "hi" ? "आपकी हॉट सीट तैयार की जा रही है..." : "TAKING YOUR HOT SEAT..."}
                    </h3>
                    <p className={`text-xs sm:text-sm ${themeMode === "light" ? "text-slate-600" : "text-slate-450"} font-sans max-w-sm mx-auto leading-relaxed`}>
                      {language === "hi" 
                        ? `कक्षा ${classLevel} के मानकों के अनुकूल विषय ${subject.toUpperCase()} में एआई ${isEndless ? "एक अंतहीन श्रृंखला" : `${questionCount} प्रगतिशील`} बहुविकल्पीय प्रश्न तैयार कर रहा है।`
                        : `AI is generating ${isEndless ? "an endless stream of" : `${questionCount} progressive`} multiple choice questions tailored for Class ${classLevel} standard in ${subject.toUpperCase()}.`}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <KbcGame
                  studentName={studentName}
                  classLevel={classLevel}
                  subject={subject}
                  questions={questions}
                  timelessMode={timelessMode}
                  onGameEnd={handleGameEnd}
                  onQuit={handleRestart}
                  themeMode={themeMode}
                  isEndless={isEndless}
                  endlessDurationSeconds={endlessDurationSeconds}
                  totalConfiguredQuestions={questionCount}
                  language={language}
                />
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GradeReporting
                reports={reports}
                onRestart={handleRestart}
                isLoadingFeedback={isFeedbackLoading}
                themeMode={themeMode}
                language={language}
                currentStudentName={studentName}
                onClearData={handleClearData}
              />
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Leaderboard
                entries={leaderboard}
                isLoading={false}
                onRefresh={fetchLeaderboard}
                themeMode={themeMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer disclaimer and credit */}
      <footer className={`border-t ${themeMode === "light" ? "border-slate-200 bg-white" : "border-slate-900 bg-slate-950/60"} py-6 text-center transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-4xs sm:text-3xs text-slate-550 font-sans gap-2.5">
          <span>&copy; {new Date().getFullYear()} Kaun Banega Scholar Academy. Safe educational gaming.</span>
          <div className="flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500/60 animate-pulse" />
            <span>AI assessment remarks mapped automatically on completions. No actual currency prizes.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
