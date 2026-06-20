import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, ChevronDown, ChevronUp, Download, Eye, GraduationCap, MapPin, Printer, RefreshCw, Calendar, Sparkles, BookOpen, Trash2, ShieldAlert, TrendingUp } from "lucide-react";
import { GradeReport, SubjectType } from "../types";
import { locales } from "../locales";

interface GradeReportingProps {
  reports: GradeReport[];
  onRestart: () => void;
  isLoadingFeedback: boolean;
  themeMode?: "light" | "dark";
  language?: "en" | "hi";
  currentStudentName?: string;
  onClearData?: () => Promise<void>;
}

export default function GradeReporting({ 
  reports, 
  onRestart, 
  isLoadingFeedback, 
  themeMode = "dark",
  language = "en",
  currentStudentName = "",
  onClearData
}: GradeReportingProps) {
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState(false);

  // Progress Chart States
  const [showProgressChart, setShowProgressChart] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<"points" | "accuracy">("points");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamic state for local records synced to localStorage to track the student progress
  const [localRecords, setLocalRecords] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kbc_quiz_records");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading initial kbc_quiz_records:", e);
      return [];
    }
  });

  // Keep localStorage synchronized with reports list
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("kbc_quiz_records");
      let currentLocal = saved ? JSON.parse(saved) : [];
      let updated = false;

      // Seed with server reports matching current student
      reports.forEach((rep) => {
        if (!rep.studentName) return;
        const cleanRepName = rep.studentName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim().toLowerCase();
        const cleanCurrentName = currentStudentName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim().toLowerCase();
        
        const isMatch = !currentStudentName || cleanRepName.includes(cleanCurrentName) || cleanRepName === cleanCurrentName;

        if (isMatch) {
          const exists = currentLocal.some((local: any) => local.id === rep.id || (local.date === rep.date && local.pointsWon === rep.pointsWon));
          if (!exists) {
            currentLocal.push({
              id: rep.id,
              studentName: rep.studentName,
              classLevel: rep.classLevel,
              subject: rep.subject,
              pointsWon: rep.pointsWon,
              correctCount: rep.correctCount,
              totalQuestions: rep.totalQuestions,
              accuracy: rep.accuracy,
              timeSpent: rep.timeSpent,
              date: rep.date || new Date().toISOString().split("T")[0]
            });
            updated = true;
          }
        }
      });

      if (updated || !saved) {
        localStorage.setItem("kbc_quiz_records", JSON.stringify(currentLocal));
        setLocalRecords(currentLocal);
      }
    } catch (err) {
      console.error("Error syncing reports to local storage", err);
    }
  }, [reports, currentStudentName]);

  const dict = locales[language] || locales.en;

  const toggleExpand = (id: string) => {
    setExpandedReportId((prev) => (prev === id ? null : id));
  };

  const handlePrint = (report: GradeReport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print report card");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Academic Report Card - ${report.studentName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background-color: #fcfcfc;}
            .header { text-align: center; border-bottom: 2px solid #eab308; padding-bottom: 20px; margin-bottom: 30px; }
            .school-title { font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase; }
            .report-card { border: 2px solid #ccc; border-radius: 12px; padding: 35px; background: #fff; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 14px; border-bottom: 1px dashed #ddd; padding-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .stats-bar { display: flex; justify-content: space-around; background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .stat { text-align: center; }
            .stat-val { font-size: 18px; font-weight: bold; color: #1e3a8a; }
            .feedback-box { background: #fef9c3; padding: 20px; border-radius: 8px; border-left: 5px solid #eab308; margin-bottom: 25px; font-style: italic; font-size: 14px; line-height: 1.5; color: #1e293b; }
            .question-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; font-size: 13.5px; }
            .correct { color: #16a34a; font-weight: bold; }
            .incorrect { color: #dc2626; font-weight: bold; }
            .explanation { font-style: normal; color: #475569; margin-top: 6px; font-size: 12.5px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header">
              <h1 class="school-title">KAUN BANEGA SCHOLAR ACADEMY</h1>
              <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px; letter-spacing: 0.5px;">Automated Assessment & Diagnostic Lesson Report</p>
            </div>
            
            <div class="info-grid">
              <div><span class="label">Student Name / शुभंकर:</span> ${report.studentName}</div>
              <div><span class="label">Academic Class / कक्षा:</span> Class ${report.classLevel}</div>
              <div><span class="label">Subject Assessment / विषय:</span> ${report.subject.toUpperCase()}</div>
              <div><span class="label">Date Held / तिथि:</span> ${report.date}</div>
            </div>

            <div class="stats-bar">
              <div class="stat">
                <div class="stat-val">${report.pointsWon.toLocaleString()}</div>
                <div class="label" style="font-size:11px; text-transform: uppercase;">Points Earned</div>
              </div>
              <div class="stat">
                <div class="stat-val">${report.correctCount} / ${report.totalQuestions}</div>
                <div class="label" style="font-size:11px; text-transform: uppercase;">Correct Choice</div>
              </div>
              <div class="stat">
                <div class="stat-val">${report.accuracy}%</div>
                <div class="label" style="font-size:11px; text-transform: uppercase;">Accuracy</div>
              </div>
              <div class="stat">
                <div class="stat-val">${Math.floor(report.timeSpent / 60)}m ${report.timeSpent % 60}s</div>
                <div class="label" style="font-size:11px; text-transform: uppercase;">Time Taken</div>
              </div>
            </div>

            <div class="feedback-box">
              <strong style="font-style: normal; text-transform: uppercase; color: #0f172a; display: block; margin-bottom: 6px;">Teacher Report (Gemini AI Diagnostics):</strong>
              "${report.aiFeedback}"
            </div>

            <h3 style="border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 25px; color: #1e3a8a; font-size: 16px; text-transform: uppercase;">Question & Lesson Breakdown:</h3>
            ${report.results.map((q, idx) => `
              <div class="question-item">
                <strong style="color: #0f172a;">Q${idx + 1}: ${q.question}</strong><br/>
                <div style="margin-top: 5px;">Your Choice: <span class="${q.isCorrect ? 'correct' : 'incorrect'}">${q.userAnswer || "Timed Out"}</span> | 
                Correct Answer: <span class="correct">${q.correctAnswer}</span></div>
                <div class="explanation"><strong>Lesson Guide:</strong> ${q.explanation}</div>
              </div>
            `).join("")}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const nameToFilter = currentStudentName || "";

  // Filter reports either for the current active session student, or show all
  const filteredReports = reports.filter((rep) => {
    if (showAllStudents) return true;
    if (!nameToFilter) return false;
    
    // Clean string comparison to account for emojis
    const cleanRepName = rep.studentName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim().toLowerCase();
    const cleanCurrentName = nameToFilter.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim().toLowerCase();
    return cleanRepName.includes(cleanCurrentName) || cleanRepName === cleanCurrentName;
  });

  const latestReport = filteredReports[0]; // No fallback to reports[0] so we don't leak other students' certificates after clear!

  // Academic Summary Metrics
  const studentQuizzesCount = filteredReports.length;
  const totalPointsEarned = filteredReports.reduce((sum, r) => sum + r.pointsWon, 0);
  const highestPointsEarned = filteredReports.reduce((max, r) => r.pointsWon > max ? r.pointsWon : max, 0);
  const averageAccuracy = studentQuizzesCount > 0 
    ? Math.round(filteredReports.reduce((sum, r) => sum + r.accuracy, 0) / studentQuizzesCount) 
    : 0;

  // Helper to format date labels on Progress chart
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (language === "hi") {
        const months = ["जन", "फर", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अग", "सित", "अक्तू", "नवं", "दिसं"];
        return `${d.getDate()} ${months[d.getMonth()]}`;
      } else {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[d.getMonth()]} ${d.getDate()}`;
      }
    } catch {
      return dateStr;
    }
  };

  // Helper to format Y-axis labels on Progress chart (crores and lakhs for Indian format, K for thousands)
  const formatYMetric = (val: number, type: "points" | "accuracy") => {
    if (type === "accuracy") return `${val}%`;
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  // Filter local storage quiz records specifically for the active student
  const activeStudentClean = nameToFilter
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "")
    .trim()
    .toLowerCase();

  const userLocalRecords = localRecords.filter((rec) => {
    if (!activeStudentClean) return false;
    const cleanRecName = (rec.studentName || "")
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "")
      .trim()
      .toLowerCase();
    return cleanRecName.includes(activeStudentClean) || cleanRecName === activeStudentClean;
  });

  // Sort chronological
  const chronSorted = [...userLocalRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by day-by-day
  const dayGroups: { [date: string]: { points: number; accuracySum: number; count: number } } = {};
  chronSorted.forEach((rec) => {
    const d = rec.date || new Date().toISOString().split("T")[0];
    if (!dayGroups[d]) {
      dayGroups[d] = { points: 0, accuracySum: 0, count: 0 };
    }
    dayGroups[d].points += rec.pointsWon || 0;
    dayGroups[d].accuracySum += typeof rec.accuracy === "number" ? rec.accuracy : 0;
    dayGroups[d].count += 1;
  });

  const timelineKeys = Object.keys(dayGroups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const rawTimeline = timelineKeys.map((dateStr) => {
    const g = dayGroups[dateStr];
    return {
      date: dateStr,
      formattedDate: formatDateLabel(dateStr),
      points: g.points,
      avgAccuracy: Math.round(g.accuracySum / g.count),
      testCount: g.count
    };
  });

  // Automatically start from 0 if there is only 1 point to show progressive climbing slope
  const chartData = rawTimeline.length === 1
    ? [
        { date: "Start", formattedDate: language === "hi" ? "शुरुआत" : "Start", points: 0, avgAccuracy: 0, testCount: 0 },
        ...rawTimeline
      ]
    : rawTimeline;

  // Chart dimensions & plotting coefficients
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 35;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxPoints = Math.max(...chartData.map(d => d.points), 10000);
  const maxVal = selectedMetric === "points" ? maxPoints : 100;

  const pointsList = chartData.map((item, i) => {
    const x = paddingLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2);
    const val = selectedMetric === "points" ? item.points : item.avgAccuracy;
    const y = paddingTop + chartHeight - (maxVal > 0 ? (val / maxVal) * chartHeight : 0);
    return { x, y, item, value: val, index: i };
  });

  // Generate SVG Path coordinates safely
  let pathD = "";
  let areaD = "";
  if (pointsList.length > 0) {
    pathD = `M ${pointsList[0].x} ${pointsList[0].y} ` + pointsList.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    const firstX = pointsList[0].x;
    const lastX = pointsList[pointsList.length - 1].x;
    const bottomY = paddingTop + chartHeight;
    areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  const handleClearHistory = async () => {
    if (!onClearData) return;
    const confirmMessage = language === "hi"
      ? "क्या आप निश्चित रूप से अपना संपूर्ण शैक्षणिक इतिहास और लीडरबोर्ड स्कोर हटाना चाहते हैं? यह प्रक्रिया वापस नहीं ली जा सकती।"
      : "Are you absolutely sure you want to completely erase your academic class report history and leaderboard entries? This action is permanent and irreversible.";
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsClearing(true);
        await onClearData();
        localStorage.removeItem("kbc_quiz_records");
        setLocalRecords([]);
      } catch (err) {
        console.error("Failed to clear data:", err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 font-display ${themeMode === "light" ? "text-slate-800" : "text-slate-100"}`}>
      
      {/* Loading micro State */}
      {isLoadingFeedback && (
        <div className={`${themeMode === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900/80 border-blue-500/30"} p-8 rounded-3xl border-2 text-center space-y-4 mb-8 box-glow`}>
          <RefreshCw className="w-8 h-8 text-yellow-500 dark:text-yellow-500 animate-spin mx-auto" />
          <p className={`text-sm ${themeMode === "light" ? "text-slate-700" : "text-yellow-405"} font-bold tracking-widest animate-pulse uppercase`}>
            {language === "hi" 
              ? "एआई आपके शैक्षणिक उत्तरों का विश्लेषण और निदान तैयार कर रहा है..."
              : "AI is analyzing your academic answers & generating diagnostic Remarks..."}
          </p>
        </div>
      )}

      {/* Student Stat Overview Card - Rendered always when not loading, so that clear history correctly shows zero values */}
      {!isLoadingFeedback && (
        <div className={`p-6 rounded-3xl border-2 ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/50 border-blue-500/10"} grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 box-glow`}>
          <div className="text-center p-2.5">
            <span className={`block text-3xs font-black uppercase tracking-widest ${themeMode === "light" ? "text-slate-500" : "text-slate-450"}`}>
              {language === "hi" ? "दिए गए टेस्ट" : "ASSESSMENTS"}
            </span>
            <span className={`text-xl sm:text-2xl font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>
              {studentQuizzesCount} Times
            </span>
          </div>
          <div className="text-center p-2.5 border-l border-blue-500/10">
            <span className={`block text-3xs font-black uppercase tracking-widest ${themeMode === "light" ? "text-slate-500" : "text-slate-450"}`}>
              {language === "hi" ? "कुल शैक्षणिक अंक" : "TOTAL POINTS"}
            </span>
            <span className={`text-xl sm:text-2xl font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>
              {totalPointsEarned.toLocaleString()} Pts
            </span>
          </div>
          <div className="text-center p-2.5 border-l border-blue-500/10">
            <span className={`block text-3xs font-black uppercase tracking-widest ${themeMode === "light" ? "text-slate-500" : "text-slate-450"}`}>
              {language === "hi" ? "सर्वोच्च अंक" : "BEST RECORD"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-500">
              {highestPointsEarned.toLocaleString()} Pts
            </span>
          </div>
          <div className="text-center p-2.5 border-l border-blue-500/10">
            <span className={`block text-3xs font-black uppercase tracking-widest ${themeMode === "light" ? "text-slate-500" : "text-slate-450"}`}>
              {language === "hi" ? "औसत सटीकता" : "AVG ACCURACY"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-sky-400">
              {averageAccuracy}%
            </span>
          </div>
        </div>
      )}

      {/* Interactive Progress Chart Button & Section */}
      {!isLoadingFeedback && (
        <div className="mb-8 flex flex-col items-center">
          <button
            onClick={() => setShowProgressChart(!showProgressChart)}
            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 cursor-pointer transition-all duration-300 border-2 ${
              showProgressChart
                ? themeMode === "light"
                  ? "bg-slate-800 text-white border-slate-900"
                  : "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-yellow-500/10"
                : themeMode === "light"
                ? "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                : "bg-slate-900/40 text-slate-200 border-blue-500/20 hover:border-blue-500/40 hover:bg-slate-900/60"
            }`}
          >
            <TrendingUp className={`w-4 h-4 transition-transform duration-300 ${showProgressChart ? "rotate-180" : ""}`} />
            <span>
              {showProgressChart
                ? (language === "hi" ? "प्रगति चार्ट छिपाएं 📉" : "Hide Progress Chart 📉")
                : (language === "hi" ? "प्रगति चार्ट देखें 📈" : "View Progress Chart 📈")}
            </span>
          </button>

          <AnimatePresence>
            {showProgressChart && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full overflow-hidden mt-4"
              >
                <div className={`p-6 md:p-8 rounded-3xl border-2 ${themeMode === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-[#0d1127]/90 border-blue-500/20 shadow-glow"} relative`}>
                  
                  {/* Chart header & tabs */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className={`text-md font-black uppercase tracking-wider ${themeMode === "light" ? "text-slate-900" : "text-yellow-400 text-glow"}`}>
                        {language === "hi" ? "शैक्षणिक प्रगति चार्ट" : "Academic Progress Chart"}
                      </h3>
                      <p className={`text-3xs sm:text-2xs font-sans ${themeMode === "light" ? "text-slate-500" : "text-slate-400"}`}>
                        {language === "hi" 
                          ? "दिन-प्रतिदिन अर्जित किए गए अंकों और सटीकता की प्रगति" 
                          : "Chronological day-by-day learning curve based on your quiz history"}
                      </p>
                    </div>

                    {/* Metric Select Tabs */}
                    <div className={`flex p-1 rounded-xl border ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-blue-500/10"}`}>
                      <button
                        onClick={() => { setSelectedMetric("points"); setHoveredIndex(null); }}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition-all duration-200 cursor-pointer ${
                          selectedMetric === "points"
                            ? themeMode === "light"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {language === "hi" ? "शैक्षणिक अंक" : "Points"}
                      </button>
                      <button
                        onClick={() => { setSelectedMetric("accuracy"); setHoveredIndex(null); }}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition-all duration-200 cursor-pointer ${
                          selectedMetric === "accuracy"
                            ? themeMode === "light"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "bg-blue-600 text-white font-black shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {language === "hi" ? "सटीकता %" : "Accuracy %"}
                      </button>
                    </div>
                  </div>

                  {userLocalRecords.length === 0 ? (
                    /* Empty records state */
                    <div className="text-center py-8 px-4 space-y-2 border border-dashed rounded-2xl border-blue-500/15">
                      <span className="text-3xl block animate-bounce">📈</span>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {language === "hi" ? "कोई परीक्षण रिकॉर्ड उपलब्ध नहीं है" : "No Quiz Attempts Recorded"}
                      </h4>
                      <p className={`text-3xs sm:text-2xs font-sans max-w-sm mx-auto ${themeMode === "light" ? "text-slate-500" : "text-slate-400"}`}>
                        {language === "hi"
                          ? "प्रगति चार्ट देखने के लिए, कृपया पहले मुख्य पृष्ठ पर जाकर कोई खेलें!"
                          : "Take a standard quiz assessment under General Knowledge, Science, or History to start plotting your progress curve!"}
                      </p>
                    </div>
                  ) : (
                    /* Proper Interactive SVG line chart */
                    <div className="relative select-none" style={{ height: "230px" }}>
                      
                      {/* Interactive floating absolute tooltip */}
                      {hoveredIndex !== null && pointsList[hoveredIndex] && (
                        <div 
                          className={`absolute z-10 p-3 rounded-xl border pointer-events-none text-3xs ${
                            themeMode === "light" ? "bg-white border-slate-200 text-slate-800 shadow-lg" : "bg-slate-950/95 border-blue-500/40 text-white shadow-glow"
                          }`}
                          style={{
                            left: `${(pointsList[hoveredIndex].x / svgWidth) * 100}%`,
                            top: `${(pointsList[hoveredIndex].y / svgHeight) * 100 - 15}%`,
                            transform: "translate(-50%, -100%)"
                          }}
                        >
                          <p className={`font-black uppercase tracking-widest border-b pb-1 mb-1 ${themeMode === "light" ? "border-slate-100" : "border-blue-500/10 text-yellow-500"}`}>
                            {pointsList[hoveredIndex].item.formattedDate}
                          </p>
                          <p className="flex justify-between gap-4 font-mono font-bold">
                            <span>{selectedMetric === "points" ? (language === "hi" ? "कुल अंक:" : "Points:") : (language === "hi" ? "सटीकता:" : "Accuracy:")}</span>
                            <span className={selectedMetric === "points" ? "text-yellow-500 font-extrabold" : "text-sky-450 font-extrabold"}>
                              {selectedMetric === "points" ? pointsList[hoveredIndex].item.points.toLocaleString() : `${pointsList[hoveredIndex].item.avgAccuracy}%`}
                            </span>
                          </p>
                          {pointsList[hoveredIndex].item.testCount > 0 && (
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {language === "hi" ? `दिए गए टेस्ट: ${pointsList[hoveredIndex].item.testCount}` : `Assessments: ${pointsList[hoveredIndex].item.testCount}`}
                            </p>
                          )}
                        </div>
                      )}

                      {/* SVG Canvas */}
                      <svg 
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                        className="w-full h-full overflow-visible"
                      >
                        <defs>
                          <linearGradient id="progressAreaGrad-points" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#eab308" stopOpacity={themeMode === "light" ? "0.2" : "0.3"} />
                            <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="progressAreaGrad-accuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={themeMode === "light" ? "0.2" : "0.3"} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Y-axis Ticks and Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((tickValue) => {
                          const tickY = paddingTop + chartHeight - (tickValue * chartHeight);
                          const calculatedVal = Math.round(tickValue * maxVal);
                          return (
                            <g key={tickValue} className="opacity-70">
                              <line 
                                x1={paddingLeft} 
                                y1={tickY} 
                                x2={paddingLeft + chartWidth} 
                                y2={tickY} 
                                stroke={themeMode === "light" ? "#f1f5f9" : "rgba(59, 130, 246, 0.12)"} 
                                strokeDasharray="3,3" 
                                strokeWidth="1"
                              />
                              <text 
                                x={paddingLeft - 8} 
                                y={tickY + 3} 
                                textAnchor="end" 
                                className={`font-mono text-[9px] font-bold ${themeMode === "light" ? "fill-slate-550" : "fill-blue-300"}`}
                              >
                                {formatYMetric(calculatedVal, selectedMetric)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Chronological X axis date labels */}
                        {pointsList.map((pt, idx) => {
                          const shouldShowLabel = pointsList.length <= 6 || idx % Math.ceil(pointsList.length / 6) === 0 || idx === pointsList.length - 1;
                          if (!shouldShowLabel) return null;
                          return (
                            <text 
                              key={idx}
                              x={pt.x}
                              y={paddingTop + chartHeight + 14}
                              textAnchor="middle"
                              className={`font-mono text-[9px] font-bold ${themeMode === "light" ? "fill-slate-500" : "fill-slate-400"}`}
                            >
                              {pt.item.formattedDate}
                            </text>
                          );
                        })}

                        {/* X and Y baselines */}
                        <line 
                          x1={paddingLeft} 
                          y1={paddingTop + chartHeight} 
                          x2={paddingLeft + chartWidth} 
                          y2={paddingTop + chartHeight} 
                          stroke={themeMode === "light" ? "#cbd5e1" : "rgba(59, 130, 246, 0.25)"} 
                          strokeWidth="1.2"
                        />
                        <line 
                          x1={paddingLeft} 
                          y1={paddingTop} 
                          x2={paddingLeft} 
                          y2={paddingTop + chartHeight} 
                          stroke={themeMode === "light" ? "#cbd5e1" : "rgba(59, 130, 246, 0.25)"} 
                          strokeWidth="1.2"
                        />

                        {/* Chart Line path and glowing gradient background */}
                        {pointsList.length > 0 && (
                          <>
                            {/* Gradient fill field */}
                            <path 
                              d={areaD} 
                              fill={`url(#progressAreaGrad-${selectedMetric})`}
                              className="transition-all duration-300"
                            />
                            {/* Glowing background duplicate path */}
                            <path 
                              d={pathD} 
                              fill="none" 
                              stroke={selectedMetric === "points" ? "#eab308" : "#3b82f6"} 
                              strokeWidth="4" 
                              opacity="0.15"
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="blur-xs"
                            />
                            {/* Solid front Path line */}
                            <path 
                              d={pathD} 
                              fill="none" 
                              stroke={selectedMetric === "points" ? "#eab308" : "#3b82f6"} 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-300"
                            />
                          </>
                        )}

                        {/* Point coordinate data Circles */}
                        {pointsList.map((pt, idx) => (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredIndex === idx ? 6 : 4}
                              fill={selectedMetric === "points" ? "#eab308" : "#3b82f6"}
                              stroke={themeMode === "light" ? "#ffffff" : "#0d1127"}
                              strokeWidth="1.5"
                              className="cursor-pointer transition-all duration-150"
                              onMouseEnter={() => setHoveredIndex(idx)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            />
                            {hoveredIndex === idx && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={10}
                                fill="none"
                                stroke={selectedMetric === "points" ? "rgba(234, 179, 8, 0.35)" : "rgba(59, 130, 246, 0.35)"}
                                strokeWidth="1"
                                className="animate-ping"
                              />
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}

                  {/* Summary / Tip Label */}
                  <p className={`text-[10px] font-sans ${themeMode === "light" ? "text-slate-450" : "text-slate-400"} mt-4 text-center italic`}>
                    {language === "hi" 
                      ? "💡 टिप: विवरण देखने के लिए ग्राफ पर दिए गए बिंदुओं पर अपना माउस या अंगुली ले जाएं!" 
                      : "💡 Tip: Hover or tap on any point above to inspect details of your test results!"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Latest Report Overview (Certificate & score card) */}
      {latestReport && !isLoadingFeedback ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >

          {/* Elegant Printable Digital Certificate of Achievement */}
          <div className={`relative ${themeMode === "light" ? "bg-white border-blue-600/60 text-slate-900" : "bg-slate-950/95 border-blue-500/50"} border-4 border-double p-8 md:p-12 rounded-3xl text-center shadow-2xl overflow-hidden box-glow`}>
            
            {/* Visual background decorations */}
            <div className="absolute top-4 left-4 text-blue-500/10"><GraduationCap className="w-16 h-16 animate-pulse" /></div>
            <div className="absolute top-4 right-4 text-yellow-500/10"><Sparkles className="w-16 h-16" /></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl"></div>

            <div className="mx-auto max-w-2xl space-y-6">
              <span className={`tracking-widest font-mono text-xs font-black uppercase block ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>
                • {dict.certificateMotto} •
              </span>
              
              <h1 className={`text-2xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r ${themeMode === "light" ? "from-blue-700 via-indigo-650 to-blue-800" : "from-yellow-400 via-amber-200 to-yellow-500 text-glow"} tracking-wider`}>
                {dict.certificateTitle}
              </h1>
              
              <p className={`text-xs sm:text-sm ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} font-sans italic`}>
                {dict.certificatePresented}
              </p>

              {/* Student Name Display */}
              <h2 className={`text-2xl sm:text-4xl font-black ${themeMode === "light" ? "text-slate-900 border-indigo-600" : "text-white border-blue-500/30 text-glow"} tracking-widest font-display border-b-2 pb-3 inline-block max-w-[80%] mx-auto`}>
                {latestReport.studentName}
              </h2>

              <p className={`text-xs sm:text-sm ${themeMode === "light" ? "text-slate-600" : "text-slate-350"} font-sans max-w-lg mx-auto leading-relaxed`}>
                {language === "hi" 
                  ? `कक्षा स्तर ${latestReport.classLevel} के मानक प्रश्नों के साथ विषय ${latestReport.subject.toUpperCase()} की हॉट सीट परीक्षा में उत्कृष्ट अकादमिक हिम्मत प्रदर्शित की है, जिसमें इनका अर्जित परिणाम नीचे है:`
                  : `For outstanding academic courage and successfully competing on the Hot Seat, answering questions in subject ${latestReport.subject.toUpperCase()} adapted to Class Grade ${latestReport.classLevel} standard, securing a score of:`}
              </p>

              {/* Score summary badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3">
                <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-blue-500/20"} border px-5 py-2.5 rounded-full text-center`}>
                  <span className={`block text-2xs font-bold ${themeMode === "light" ? "text-slate-500" : "text-slate-405"} uppercase tracking-wider font-sans`}>{dict.accumulatedPoints}</span>
                  <span className={`text-base sm:text-lg font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>{latestReport.pointsWon.toLocaleString()} Pts</span>
                </div>

                <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-blue-500/20"} border px-5 py-2.5 rounded-full text-center`}>
                  <span className={`block text-2xs font-bold ${themeMode === "light" ? "text-slate-500" : "text-slate-405"} uppercase tracking-wider font-sans`}>{dict.accuracy}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-650 dark:text-emerald-400">{latestReport.accuracy}%</span>
                </div>

                <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-blue-500/20"} border px-5 py-2.5 rounded-full text-center`}>
                  <span className={`block text-2xs font-bold ${themeMode === "light" ? "text-slate-500" : "text-slate-405"} uppercase tracking-wider font-sans`}>{dict.gradeLevel}</span>
                  <span className={`text-base sm:text-lg font-black ${themeMode === "light" ? "text-indigo-600" : "text-sky-400"}`}>C-{latestReport.classLevel}</span>
                </div>
              </div>

              {/* AI Diagnostic Comments Block */}
              <div className={`mt-8 p-5 ${themeMode === "light" ? "bg-blue-50/50 hover:bg-blue-50 border-blue-200" : "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/25"} transition duration-350 border-2 rounded-2xl max-w-xl mx-auto text-left space-y-2 box-glow`}>
                <div className={`flex items-center gap-2 text-2xs font-black ${themeMode === "light" ? "text-blue-650" : "text-yellow-400"} uppercase tracking-widest`}>
                  <GraduationCap className={`w-4 h-4 ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`} />
                  <span>{dict.diagnosticAssessment}</span>
                </div>
                <p className={`text-xs sm:text-sm ${themeMode === "light" ? "text-slate-705" : "text-slate-200"} leading-relaxed font-sans italic`}>
                  &ldquo;{latestReport.aiFeedback}&rdquo;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => handlePrint(latestReport)}
                  className={`flex items-center gap-2 px-6 py-3 cursor-pointer ${themeMode === "light" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 font-black"} font-bold text-xs sm:text-sm rounded-full transition shadow-lg shadow-blue-500/10`}
                >
                  <Printer className="w-4 h-4" />
                  <span>{dict.printReport}</span>
                </button>
                
                <button
                  type="button"
                  onClick={onRestart}
                  className={`flex items-center gap-2 px-6 py-3 cursor-pointer ${themeMode === "light" ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300" : "bg-slate-900 hover:bg-slate-800 border-blue-500/30 text-slate-200"} border-2 font-bold text-xs sm:text-sm rounded-full transition`}
                >
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <span>{dict.playNewGame}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Assessment Breakdown list */}
          <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/60 border-blue-500/25"} border-2 rounded-3xl p-6 sm:p-8 space-y-6 box-glow`}>
            <h3 className={`text-md sm:text-lg font-black ${themeMode === "light" ? "text-slate-800 border-slate-105" : "text-white border-blue-500/20"} flex items-center gap-2 border-b pb-3`}>
              <BookOpen className={`w-5 h-5 ${themeMode === "light" ? "text-blue-500" : "text-yellow-400"}`} />
              <span>{dict.diagnosticBreakdown}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {latestReport.results.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-3.5 transition-all duration-300 ${
                    item.isCorrect 
                      ? themeMode === "light" ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400" : "bg-emerald-950/15 border-emerald-900/30 hover:border-emerald-500/35" 
                      : themeMode === "light" ? "bg-red-50/40 border-red-200 hover:border-red-400" : "bg-red-950/15 border-red-900/30 hover:border-red-500/35"
                  }`}
                >
                  <div className={`space-y-1 ${themeMode === "light" ? "bg-slate-50" : "bg-slate-950/30"} p-2.5 rounded-xl border ${themeMode === "light" ? "border-slate-150" : "border-blue-500/5"}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">Q#{idx + 1}</span>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                        item.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-750"
                      }`}>
                        {item.isCorrect ? (language === "hi" ? "सही" : "Correct") : (language === "hi" ? "गलत" : "Incorrect")}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold ${themeMode === "light" ? "text-slate-800" : "text-slate-202"}`}>{item.question}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-2xs">
                    <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-150" : "bg-slate-950 border-blue-500/10"} p-2.5 rounded-xl border`}>
                      <span className="block text-slate-400">{language === "hi" ? "आपका उत्तर:" : "Your Choice:"}</span>
                      <span className={`font-bold ${item.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                        {item.userAnswer || (language === "hi" ? "समय समाप्त (Time Out)" : "Timed Out")}
                      </span>
                    </div>

                    <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-150" : "bg-slate-950 border-blue-500/10"} p-2.5 rounded-xl border`}>
                      <span className="block text-slate-400">{language === "hi" ? "सही उत्तर:" : "Right Answer:"}</span>
                      <span className="font-bold text-emerald-600">{item.correctAnswer}</span>
                    </div>
                  </div>

                  <p className={`text-xs ${themeMode === "light" ? "text-slate-600" : "text-slate-300"} leading-relaxed font-sans pt-1 border-t ${themeMode === "light" ? "border-slate-100" : "border-blue-500/15"}`}>
                    <strong className={`font-bold font-display ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>{dict.lessonGuide}:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        !isLoadingFeedback && (
          <div className={`relative ${themeMode === "light" ? "bg-white border-slate-200 text-slate-850" : "bg-slate-950/60 border-blue-500/20 text-slate-100"} border-2 p-8 md:p-12 rounded-3xl text-center shadow-xl space-y-4 box-glow`}>
            <span className="text-4xl block animate-pulse">📊</span>
            <h3 className="text-lg font-black uppercase tracking-wider">
              {language === "hi" ? "कोई शैक्षणिक इतिहास उपलब्ध नहीं है" : "No Academic History Found"}
            </h3>
            <p className={`text-xs sm:text-sm font-sans max-w-md mx-auto leading-relaxed ${themeMode === "light" ? "text-slate-600" : "text-slate-400"}`}>
              {language === "hi"
                ? "इस छात्र का कोई पुराना रिकॉर्ड नहीं है। कृपया नया खेल खेलने के लिए मुख्य पृष्ठ पर जाएं और शानदार शैक्षणिक अंक अर्जित करें।"
                : "This student does not have any saved test history. Complete standard quizzes to view certificates, progress graphs, and deep AI study reflections."}
            </p>
            <button
              onClick={onRestart}
              className={`mt-4 px-6 py-2.5 ${themeMode === "light" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 text-slate-950"} rounded-full text-xs font-bold transition mx-auto flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "मुख्य पृष्ठ पर जाएं" : "Go to Main Page"}</span>
            </button>
          </div>
        )
      )}

      {/* Reports History Archive List section */}
      {reports.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className={`text-base sm:text-lg font-black ${themeMode === "light" ? "text-slate-600" : "text-slate-400"} tracking-wider uppercase`}>
              {dict.pastTrialPapers}
            </h3>

            {/* Filter Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-2xs font-semibold uppercase">{language === "hi" ? "सभी छात्रों का परिणाम दिखाएं" : "Show All Students"}</span>
              <button
                type="button"
                onClick={() => setShowAllStudents(!showAllStudents)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer ${
                  showAllStudents ? "bg-yellow-500" : themeMode === "light" ? "bg-slate-200" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-100 transition-transform ${
                    showAllStudents ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredReports.map((rep) => {
              const isExpanded = expandedReportId === rep.id;
              return (
                <div key={rep.id} className={`${themeMode === "light" ? "bg-white border-slate-200 hover:border-slate-300 text-slate-800" : "bg-slate-900/60 border-2 border-blue-500/20 hover:border-blue-500/40 text-slate-100"} border-2 rounded-2xl overflow-hidden transition duration-300 box-glow`}>
                  <button
                    onClick={() => toggleExpand(rep.id)}
                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3 text-left focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <h4 className={`font-display font-bold text-sm sm:text-base ${themeMode === "light" ? "text-slate-850" : "text-slate-200"}`}>{rep.studentName}</h4>
                        <p className={`text-xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} flex items-center gap-1.5 font-sans pt-0.5`}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Class {rep.classLevel} • {rep.subject.toUpperCase()} • {rep.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <div className="text-right">
                        <span className="block text-3xs text-slate-400 font-sans">{language === "hi" ? "अर्जित अंक" : "Points"}</span>
                        <span className={`text-xs ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} font-bold`}>{rep.pointsWon.toLocaleString()} Pts</span>
                      </div>

                      <div className="text-right">
                        <span className="block text-3xs text-slate-400 font-sans">{language === "hi" ? "सटीकता" : "Accuracy"}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{rep.accuracy}%</span>
                      </div>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`border-t-2 ${themeMode === "light" ? "border-slate-150 bg-slate-50" : "border-blue-500/15 bg-slate-950/65"} px-6 py-4 space-y-4`}
                      >
                        <div className={`p-4 ${themeMode === "light" ? "bg-blue-50/50 border-blue-200" : "bg-blue-500/5 border border-blue-500/20"} rounded-xl`}>
                          <strong className={`text-xs ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} font-display font-bold tracking-wider block mb-1`}>{dict.teacherRemark}</strong>
                          <p className={`text-xs ${themeMode === "light" ? "text-slate-700" : "text-slate-200"} italic font-sans leading-relaxed`}>&ldquo;{rep.aiFeedback}&rdquo;</p>
                        </div>

                        {/* Print action */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handlePrint(rep)}
                            className={`flex items-center gap-1.5 px-4.5 py-2 cursor-pointer ${themeMode === "light" ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300" : "bg-slate-900 text-slate-200 border border-blue-500/20 hover:border-blue-500/40"} rounded-full text-xs font-semibold transition`}
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-500" />
                            <span>{dict.printReport}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear session option for new student */}
      {onClearData && (
        <div className={`mt-12 p-6 rounded-2xl border-2 border-red-500/10 bg-red-500/5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-500 flex items-center gap-1.5 font-display">
              <ShieldAlert className="w-4 h-4" />
              <span>{dict.deleteUser}</span>
            </h4>
            <p className="text-2xs text-slate-400 font-sans leading-normal">
              {dict.allClear}
            </p>
          </div>
          <button
            type="button"
            disabled={isClearing}
            onClick={handleClearHistory}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800/30 text-white focus:outline-none transition font-bold font-sans text-xs rounded-full flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? "Cleaning..." : dict.deleteUser}</span>
          </button>
        </div>
      )}

      {/* FOOTER ACTION BACK */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onRestart}
          className={`px-8 py-3 ${themeMode === "light" ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-slate-905 hover:bg-slate-800 text-slate-200"} rounded-full transition flex items-center gap-2 font-display text-xs border border-blue-500/10 cursor-pointer`}
        >
          <RefreshCw className="w-4 h-4 text-yellow-500" />
          <span>{dict.playNewGame}</span>
        </button>
      </div>

    </div>
  );
}
