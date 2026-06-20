import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, User, Trophy, Sparkles, Award } from "lucide-react";
import { SubjectType, BaselineDifficulty } from "../types";
import { locales } from "../locales";

interface ClassSelectProps {
  onStartQuiz: (
    studentName: string,
    classLevel: number,
    subject: SubjectType,
    timeless: boolean,
    baselineDifficulty: BaselineDifficulty,
    questionCount: number,
    isEndless: boolean,
    endlessDurationSeconds: number
  ) => void;
  onViewStats: () => void;
  onViewLeaderboard: () => void;
  themeMode?: "light" | "dark";
  language?: "en" | "hi";
}

const AVATARS = [
  "🎓", "🚀", "💡", "🔬", "🦖", "🌟", "📚", "🎨", "🦁", "🦊", "🤖", "🧭"
];

export default function ClassSelect({ 
  onStartQuiz, 
  onViewStats, 
  onViewLeaderboard, 
  themeMode = "dark", 
  language = "en" 
}: ClassSelectProps) {
  const [studentName, setStudentName] = useState("");
  const [classLevel, setClassLevel] = useState<number>(5);
  const [subject, setSubject] = useState<SubjectType>("gk");
  const [selectedAvatar, setSelectedAvatar] = useState("🚀");
  const [timeless, setTimeless] = useState(false);
  const [baselineDifficulty, setBaselineDifficulty] = useState<BaselineDifficulty>("medium");

  // Advanced configurations requested by user
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);
  const [endlessTimeValue, setEndlessTimeValue] = useState<number>(5);
  const [endlessTimeUnit, setEndlessTimeUnit] = useState<"seconds" | "minutes" | "hours">("minutes");

  const dict = locales[language] || locales.en;

  // Pre-load student name if exists in browser instance
  useEffect(() => {
    const savedName = localStorage.getItem("kbc_student_name") || "";
    if (savedName) {
      const parts = savedName.split(" ");
      if (parts.length > 1 && AVATARS.includes(parts[0])) {
        setSelectedAvatar(parts[0]);
        setStudentName(parts.slice(1).join(" "));
      } else {
        setStudentName(savedName);
      }
    }
  }, []);

  useEffect(() => {
    const isHighSchool = classLevel === 11 || classLevel === 12;
    if (isHighSchool) {
      if (subject === "science") {
        setSubject("physics");
      }
    } else {
      if (subject === "physics" || subject === "chemistry" || subject === "biology") {
        setSubject("science");
      }
    }
  }, [classLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    // Convert time unit to total seconds for endless mode
    let actualSeconds = Number(endlessTimeValue) || 60;
    if (endlessTimeUnit === "minutes") {
      actualSeconds = actualSeconds * 60;
    } else if (endlessTimeUnit === "hours") {
      actualSeconds = actualSeconds * 3600;
    }

    const finalName = selectedAvatar ? `${selectedAvatar} ${studentName.trim()}` : studentName.trim();
    onStartQuiz(
      finalName,
      classLevel,
      subject,
      timeless,
      baselineDifficulty,
      questionCount,
      isEndlessMode,
      actualSeconds
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Hero Welcome banner */}
      <div className="text-center mb-10">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className={`inline-flex items-center gap-2 ${themeMode === "light" ? "bg-blue-105 text-blue-600 border-blue-200" : "bg-blue-500/5 border-blue-500/40 text-yellow-400"} px-5 py-2 rounded-full text-xs tracking-wider uppercase mb-5 font-mono border`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          <span>QUIZMASTER PRO • GEOMETRIC EDITION</span>
        </motion.div>
        
        <h1 className={`font-display text-4xl md:text-6xl font-black tracking-wider ${themeMode === "light" ? "text-slate-900" : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 text-glow"} mb-4`}>
          {language === "hi" ? "कौन बनेगा स्कॉलर?" : "KAUN BANEGA SCHOLAR?"}
        </h1>
        <p className={`${themeMode === "light" ? "text-slate-600 font-medium" : "text-slate-300"} text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed`}>
          {language === "hi" 
            ? "कक्षा 1 से 12 के छात्रों के लिए बेहतरीन सामान्य ज्ञान, इतिहास, विज्ञान, गणित और भाषा प्रश्नोत्तरी!"
            : "Welcome to the ultimate classroom game show! Academic testing for Class 1 to 12. Test your knowledge in general knowledge, science, mathematics, language, and history."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side Quick Navigation Actions */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <button
            onClick={onViewLeaderboard}
            className={`flex items-center justify-between p-4 ${themeMode === "light" ? "bg-white hover:bg-slate-50 border-slate-200" : "bg-slate-900/80 hover:bg-slate-800/80 border-blue-500/30"} hover:border-yellow-500/60 border-2 rounded-2xl transition-all text-left group box-glow cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 kbc-logo-circle">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className={`font-display font-bold ${themeMode === "light" ? "text-slate-800" : "text-white"} group-hover:text-yellow-500 transition`}>{dict.globalStandings}</h3>
                <p className={`text-xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"}`}>{language === "hi" ? "लाइव रैंकिंग स्कोर" : "Live leaderboard data"}</p>
              </div>
            </div>
          </button>

          <button
            onClick={onViewStats}
            className={`flex items-center justify-between p-4 ${themeMode === "light" ? "bg-white hover:bg-slate-50 border-slate-200" : "bg-slate-900/80 hover:bg-slate-800/80 border-blue-500/30"} hover:border-blue-500/60 border-2 rounded-2xl transition-all text-left group box-glow cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-550">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-display font-bold ${themeMode === "light" ? "text-slate-800" : "text-white"} group-hover:text-blue-555 transition`}>{dict.reportCards}</h3>
                <p className={`text-xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"}`}>{dict.automatedReports}</p>
              </div>
            </div>
          </button>

          {/* Quick instructions on KBC mechanics */}
          <div className={`p-5 ${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-950/90 border-blue-500/25"} rounded-2xl border-2 space-y-4`}>
            <h4 className="font-display text-xs font-bold text-yellow-600 dark:text-yellow-400 tracking-wider uppercase flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>{dict.howToPlay}</span>
            </h4>
            <ul className={`text-xs ${themeMode === "light" ? "text-slate-600" : "text-slate-300"} space-y-3 font-sans`}>
              {dict.instructionsList.map((inst, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold font-mono">0{index + 1}.</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center / Right registration form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className={`p-6 md:p-8 ${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/60 border-blue-500/40"} border-2 rounded-3xl space-y-6 box-glow`}>
            <h2 className={`font-display text-xl font-bold ${themeMode === "light" ? "text-slate-800 border-slate-100" : "text-white border-blue-500/20"} flex items-center gap-2 border-b pb-3`}>
              <User className="w-5 h-5 text-yellow-500" />
              <span>{dict.registration}</span>
            </h2>

            {/* Student Name */}
            <div className="space-y-2">
              <label htmlFor="student-name" className={`text-sm font-semibold tracking-wide ${themeMode === "light" ? "text-slate-700" : "text-slate-205"}`}>{dict.enterName}</label>
              <div className="relative">
                <input
                  id="student-name"
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={language === "hi" ? "जैसे: आरव शर्मा" : "e.g. Aarav Sharma"}
                  maxLength={25}
                  className={`w-full pl-4 pr-12 py-3.5 ${themeMode === "light" ? "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/30" : "bg-slate-950 border-blue-500/30 text-white focus:ring-blue-500/50"} border focus:border-blue-500 focus:ring-1 rounded-full placeholder-slate-400 focus:outline-none transition font-sans text-sm`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">{selectedAvatar}</span>
              </div>
            </div>

            {/* Avatar Select */}
            <div className="space-y-2">
              <span className={`text-xs font-bold ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} uppercase tracking-wider`}>{dict.chooseMascot}</span>
              <div className={`flex flex-wrap gap-2.5 p-3.5 ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-blue-500/20"} border rounded-2xl`}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-xl w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      selectedAvatar === av
                        ? "bg-yellow-500/20 ring-2 ring-yellow-500 scale-110"
                        : themeMode === "light" ? "bg-white hover:bg-slate-200 text-slate-700 shadow-sm" : "bg-slate-900/60 hover:bg-slate-800 text-slate-305"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Class selection */}
            <div className="space-y-2">
              <div className={`flex justify-between items-center ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-blue-500/20"} px-4 py-2 border rounded-xl`}>
                <label htmlFor="class-select" className={`text-sm font-semibold ${themeMode === "light" ? "text-slate-705" : "text-slate-202"}`}>
                  {dict.selectClass}
                </label>
                <span className={`font-black text-sm ${themeMode === "light" ? "text-blue-600" : "text-yellow-405"}`}>
                  {language === "hi" ? `कक्षा ${classLevel}` : `Class Grade ${classLevel}`}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <button
                    key={grade}
                    id={`class-btn-${grade}`}
                    type="button"
                    onClick={() => setClassLevel(grade)}
                    className={`py-2 px-1.5 rounded-full text-xs font-bold transition font-display border-2 cursor-pointer ${
                      classLevel === grade
                        ? "bg-yellow-500 text-slate-900 border-yellow-500 font-extrabold shadow-md shadow-yellow-500/20 scale-102"
                        : themeMode === "light" ? "bg-white text-slate-755 border-slate-200 hover:bg-slate-100 shadow-sm" : "bg-slate-950 text-slate-305 border-blue-500/10 hover:text-white hover:border-blue-500/40"
                    }`}
                  >
                    C-{grade}
                  </button>
                ))}
              </div>
              <p className={`text-2xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} pt-1 leading-normal font-sans`}>
                {language === "hi" 
                  ? "कक्षा का चयन पाठ्यक्रम मानक को स्वचालित रूप से सुदृढ़ करता है।"
                  : "The difficulty of the quiz questions adapts sequentially, matching standard curriculum markers."}
              </p>
            </div>

            {/* Category selection */}
            <div className="space-y-2 font-display">
              <label className={`text-sm font-semibold ${themeMode === "light" ? "text-slate-700" : "text-slate-200"} block mb-1`}>{dict.chooseCategory}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {((isHighSchool: boolean) => {
                  const subjectsList = [
                    { id: "gk", label: language === "hi" ? "सामान्य ज्ञान (GK)" : "GK", icon: "🌍", activeClass: subject === "gk" ? (themeMode === "light" ? "bg-blue-50 border-blue-500 text-blue-600 font-bold scale-[1.01]" : "bg-blue-500/15 border-blue-400 text-blue-400 font-bold scale-[1.01]") : "" },
                    ...(isHighSchool ? [
                      { id: "physics", label: language === "hi" ? "भौतिक विज्ञान" : "Physics", icon: "⚡", activeClass: subject === "physics" ? (themeMode === "light" ? "bg-cyan-50 border-cyan-500 text-cyan-600 font-bold scale-[1.01]" : "bg-cyan-500/15 border-cyan-400 text-cyan-400 font-bold scale-[1.01]") : "" },
                      { id: "chemistry", label: language === "hi" ? "रसायन विज्ञान" : "Chemistry", icon: "⚗️", activeClass: subject === "chemistry" ? (themeMode === "light" ? "bg-indigo-50 border-indigo-505 text-indigo-600 font-bold scale-[1.01]" : "bg-indigo-500/15 border-indigo-400 text-indigo-400 font-bold scale-[1.01]") : "" },
                      { id: "biology", label: language === "hi" ? "जीव विज्ञान" : "Biology", icon: "🌿", activeClass: subject === "biology" ? (themeMode === "light" ? "bg-emerald-50 border-emerald-505 text-emerald-600 font-bold scale-[1.01]" : "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold scale-[1.01]") : "" }
                    ] : [
                      { id: "science", label: language === "hi" ? "विज्ञान" : "Science", icon: "🧪", activeClass: subject === "science" ? (themeMode === "light" ? "bg-emerald-50 border-emerald-505 text-emerald-600 font-bold scale-[1.01]" : "bg-emerald-500/15 border-emerald-400 text-emerald-400 font-bold scale-[1.01]") : "" }
                    ]),
                    { id: "history", label: language === "hi" ? "इतिहास" : "History", icon: "⏳", activeClass: subject === "history" ? (themeMode === "light" ? "bg-amber-50 border-amber-505 text-amber-600 font-bold scale-[1.01]" : "bg-amber-500/15 border-amber-400 text-amber-400 font-bold scale-[1.01]") : "" },
                    { id: "english", label: language === "hi" ? "अंग्रेजी" : "English", icon: "📖", activeClass: subject === "english" ? (themeMode === "light" ? "bg-violet-50 border-violet-505 text-violet-600 font-bold scale-[1.01]" : "bg-violet-500/15 border-violet-400 text-violet-400 font-bold scale-[1.01]") : "" },
                    { id: "maths", label: language === "hi" ? "गणित" : "Mathematics", icon: "🧮", activeClass: subject === "maths" ? (themeMode === "light" ? "bg-rose-50 border-rose-505 text-rose-600 font-bold scale-[1.01]" : "bg-rose-500/15 border-rose-400 text-rose-400 font-bold scale-[1.01]") : "" },
                    { id: "hindi", label: language === "hi" ? "हिंदी" : "Hindi", icon: "✍️", activeClass: subject === "hindi" ? (themeMode === "light" ? "bg-orange-50 border-orange-505 text-orange-600 font-bold scale-[1.01]" : "bg-orange-500/15 border-orange-400 text-orange-400 font-bold scale-[1.01]") : "" },
                  ];

                  return subjectsList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubject(item.id as SubjectType)}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        item.activeClass || (themeMode === "light" ? "bg-slate-50 border-slate-205 text-slate-705 hover:bg-slate-100" : "bg-slate-950 border-blue-500/10 text-slate-305 hover:text-white")
                      }`}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-2xs sm:text-xs tracking-wider font-extrabold text-center block mt-1">{item.label}</span>
                    </button>
                  ));
                })(classLevel === 11 || classLevel === 12)}
              </div>
            </div>

            {/* Question Series & Game Mode Configuration Section */}
            <div className={`p-5 rounded-2xl border-2 space-y-5 ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/40 border-slate-800"}`}>
              <h3 className={`text-sm font-bold tracking-wide uppercase font-display flex items-center gap-2 ${themeMode === "light" ? "text-slate-800" : "text-yellow-405"}`}>
                ⚙️ {dict.playMode}
              </h3>

              {/* Endless Mode Toggle Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className={`text-xs font-black uppercase tracking-wider block ${themeMode === "light" ? "text-slate-705" : "text-slate-202"}`}>
                    ♾️ {dict.endlessMode}
                  </span>
                  <span className={`text-2xs block font-sans ${themeMode === "light" ? "text-slate-550" : "text-slate-400"}`}>
                    {dict.endlessSubtext}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEndlessMode(!isEndlessMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer ${
                    isEndlessMode ? "bg-yellow-500" : themeMode === "light" ? "bg-slate-300" : "bg-slate-850"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform ${
                      isEndlessMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {!isEndlessMode ? (
                /* Standard Game: Choose Question Series Count */
                <div className="space-y-2">
                  <span className={`text-xs font-black uppercase tracking-wider block ${themeMode === "light" ? "text-slate-500" : "text-slate-400"}`}>
                    🔢 {dict.numQuestions}
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {[10, 20, 30, 40, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-black transition-all border-2 font-mono cursor-pointer ${
                          questionCount === num
                            ? "bg-yellow-500 text-slate-950 border-yellow-500"
                            : themeMode === "light" ? "bg-white text-slate-755 border-slate-202 hover:bg-slate-100" : "bg-slate-900/60 text-slate-350 border-blue-500/10 hover:border-blue-500/40"
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Endless Game: Choose Custom Duration */
                <div className="space-y-3 p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <span className={`text-xs font-black uppercase tracking-wider block ${themeMode === "light" ? "text-amber-805" : "text-yellow-405"}`}>
                    ⏱️ {dict.setCustomEndlessTimer}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex-grow">
                      <input
                        type="number"
                        min={5}
                        max={3600}
                        required
                        value={endlessTimeValue}
                        onChange={(e) => setEndlessTimeValue(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold pointer-events-auto ${
                          themeMode === "light" ? "bg-white border-slate-200 text-slate-900" : "bg-slate-950 border-blue-500/30 text-white"
                        }`}
                      />
                    </div>
                    <div className="w-1/2">
                      <select
                        value={endlessTimeUnit}
                        onChange={(e) => setEndlessTimeUnit(e.target.value as any)}
                        className={`w-full px-3 py-2.5 rounded-xl text-sm font-bold border cursor-pointer ${
                          themeMode === "light" ? "bg-white border-slate-200 text-slate-900 animate-none" : "bg-slate-950 border-blue-500/30 text-white"
                        }`}
                      >
                        <option value="seconds">{dict.seconds}</option>
                        <option value="minutes">{dict.minutes}</option>
                        <option value="hours">{dict.hours}</option>
                      </select>
                    </div>
                  </div>
                  <p className={`text-2xs ${themeMode === "light" ? "text-slate-550" : "text-slate-400"} font-sans leading-tight`}>
                    {dict.endlessTimerSubtext}
                  </p>
                </div>
              )}
            </div>

            {/* Baseline Difficulty selection */}
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${themeMode === "light" ? "text-slate-700" : "text-slate-202"} block`}>
                {dict.selectHardness}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBaselineDifficulty("easy")}
                  className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    baselineDifficulty === "easy"
                      ? "bg-emerald-555/20 border-emerald-400 text-emerald-400 font-bold scale-[1.02]"
                      : themeMode === "light" ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-950 border-blue-500/10 text-slate-350 hover:text-white"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">{language === "hi" ? "🟢 आसान" : "🟢 Easy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBaselineDifficulty("medium")}
                  className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    baselineDifficulty === "medium"
                      ? "bg-amber-555/20 border-amber-400 text-amber-400 font-bold scale-[1.02]"
                      : themeMode === "light" ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-950 border-blue-500/10 text-slate-350 hover:text-white"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">{language === "hi" ? "🟡 मध्यम" : "🟡 Medium"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBaselineDifficulty("hard")}
                  className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    baselineDifficulty === "hard"
                      ? "bg-rose-555/20 border-rose-400 text-rose-450 font-bold scale-[1.02]"
                      : themeMode === "light" ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-950 border-blue-500/10 text-slate-350 hover:text-white"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">{language === "hi" ? "🔴 कठिन" : "🔴 Hard"}</span>
                </button>
              </div>
              <p className={`text-2xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} pt-0.5 leading-normal font-sans`}>
                {dict.baselineSubtext}
              </p>
            </div>

            {/* Timeless option toggler / selector */}
            <div className={`flex items-center justify-between p-4 ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-blue-500/25"} border-2 rounded-2xl box-glow`}>
              <div className="space-y-0.5">
                <span className={`text-sm font-bold ${themeMode === "light" ? "text-slate-800" : "text-slate-202"} block`}>{dict.timelessMode}</span>
                <span className={`text-2xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} block font-normal font-sans leading-tight`}>
                  {dict.timelessSubtext}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTimeless(!timeless)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer ${
                  timeless ? "bg-yellow-500" : themeMode === "light" ? "bg-slate-300" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform ${
                    timeless ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* PLAY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={!studentName.trim()}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-black text-lg rounded-full transition shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center justify-center gap-2 tracking-widest cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-slate-950" />
              <span>{dict.enterHotSeat}</span>
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
