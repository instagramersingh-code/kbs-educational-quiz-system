import React, { useState } from "react";
import { motion } from "motion/react";
import { Trophy, Award, Search, Filter, RefreshCw, Calendar, Flame } from "lucide-react";
import { LeaderboardEntry, SubjectType } from "../types";

// Prize hierarchy map
const HIGHLIGHTS = [
  { rank: 1, color: "text-yellow-450", bg: "bg-yellow-500/10 border-yellow-500/40", badge: "👑" },
  { rank: 2, color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/30", badge: "🥈" },
  { rank: 3, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30", badge: "🥉" }
];

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  themeMode?: "light" | "dark";
}

export default function Leaderboard({ entries, isLoading, onRefresh, themeMode = "dark" }: LeaderboardProps) {
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter((entry) => {
    const matchesClass = classFilter === "all" || entry.classLevel === Number(classFilter);
    const matchesSubject = subjectFilter === "all" || entry.subject === subjectFilter;
    const matchesSearch = entry.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 font-display ${themeMode === "light" ? "text-slate-800" : "text-slate-100"}`}>
      
      {/* Leaderboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className={`flex items-center gap-2 ${themeMode === "light" ? "text-blue-600 font-bold" : "text-yellow-500"} text-xs font-bold uppercase tracking-widest mb-1.5 font-mono`}>
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>REAL-TIME HOT SEAT ACCOMPLISHMENTS</span>
          </div>
          <h1 className={`text-3xl font-extrabold ${themeMode === "light" ? "text-slate-900" : "text-white text-glow"} tracking-tight flex items-center gap-2`}>
            <Trophy className="w-8 h-8 text-yellow-550 animate-bounce" />
            <span>Scholar Live Leaderboard</span>
          </h1>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-4 py-2.5 ${themeMode === "light" ? "bg-slate-100 border-slate-350 hover:bg-slate-205 text-slate-700" : "bg-slate-900 border border-slate-800 hover:border-yellow-500/50 hover:bg-slate-800 text-slate-300 hover:text-white"} rounded-xl transition border font-semibold text-sm group disabled:opacity-55`}
        >
          <RefreshCw className={`w-4 h-4 ${themeMode === "light" ? "text-blue-500" : "text-yellow-400"} group-hover:rotate-180 transition-all duration-700 ${isLoading ? "animate-spin" : ""}`} />
          <span>Real-time Ticker Refresh</span>
        </button>
      </div>

      {/* Filter and search utilities */}
      <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/85 border-2 border-blue-500/30"} border-2 p-5 rounded-3xl mb-6 space-y-4 box-glow`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${themeMode === "light" ? "text-slate-450" : "text-blue-400"}`} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3.5 ${themeMode === "light" ? "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-450 focus:border-blue-505 focus:ring-blue-105" : "bg-slate-950 border border-blue-500/25 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/45"} rounded-full text-sm focus:outline-none transition font-sans`}
            />
          </div>

          {/* Class Select */}
          <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-slate-50 border-slate-250" : "bg-slate-950 border-blue-500/20"} px-4 py-1 border rounded-full shrink-0`}>
            <Filter className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-slate-500" : "text-blue-400"} shrink-0`} />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={`flex-grow bg-transparent text-xs py-2.5 focus:outline-none focus:ring-0 cursor-pointer font-sans ${themeMode === "light" ? "text-slate-705" : "text-slate-300"}`}
            >
              <option value="all" className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>All Classes (1-12)</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                <option key={grade} value={grade} className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>Class {grade}</option>
              ))}
            </select>
          </div>

          {/* Subject Choose */}
          <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-slate-50 border-slate-250" : "bg-slate-950 border-blue-500/20"} px-4 py-1 border rounded-full shrink-0`}>
            <Filter className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-slate-500" : "text-blue-400"} shrink-0`} />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className={`flex-grow bg-transparent text-xs py-2.5 focus:outline-none focus:ring-0 cursor-pointer font-sans ${themeMode === "light" ? "text-slate-705" : "text-slate-300"}`}
            >
              <option value="all" className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>All Subjects</option>
              <option value="gk" className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>General Knowledge</option>
              <option value="science" className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>General Science</option>
              <option value="history" className={themeMode === "light" ? "bg-white text-slate-800" : "bg-slate-950"}>History Saga</option>
            </select>
          </div>

        </div>
      </div>

      {/* Leaderboard Table Grid */}
      <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/60 backdrop-blur-sm border-2 border-blue-500/30"} rounded-3xl overflow-hidden shadow-2xl border box-glow`}>
        <div className="overflow-x-auto">
          {filteredEntries.length === 0 ? (
            <div className={`p-12 text-center font-sans ${themeMode === "light" ? "text-slate-505" : "text-slate-500"}`}>
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm">No accomplishments found matching this filter combo.</p>
              <p className="text-xs pt-1">Be the first to score on top!</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={`${themeMode === "light" ? "border-b-2 border-slate-200 bg-slate-50 text-slate-700" : "border-b-2 border-blue-500/25 bg-slate-950/90 text-blue-400"} text-2xs uppercase tracking-widest font-mono`}>
                  <th className="py-4 px-5">Rank</th>
                  <th className="py-4 px-4">Student</th>
                  <th className="py-4 px-4">Academic Standard</th>
                  <th className="py-4 px-4">Subject</th>
                  <th className="py-4 px-4 text-right">Accuracy</th>
                  <th className="py-4 px-4 text-right">Time Spent</th>
                  <th className={`py-4 px-5 text-right ${themeMode === "light" ? "text-blue-600" : "text-glow text-yellow-400"}`}>Prize Score</th>
                </tr>
              </thead>
              <tbody className={`${themeMode === "light" ? "divide-y divide-slate-150" : "divide-y divide-blue-500/10"} font-sans text-xs sm:text-sm`}>
                {filteredEntries.map((entry, index) => {
                  const rank = index + 1;
                  
                  // Custom theme background mapping for prize podium
                  let medalBgClass = "";
                  let rankColor = themeMode === "light" ? "text-slate-600" : "text-slate-500";
                  let recordBadge = "";

                  if (rank === 1) {
                    medalBgClass = themeMode === "light" ? "bg-yellow-50 border-yellow-250 text-slate-900" : "bg-yellow-500/10 border-yellow-500/40 text-white";
                    rankColor = "text-yellow-605 dark:text-yellow-450";
                    recordBadge = "👑";
                  } else if (rank === 2) {
                    medalBgClass = themeMode === "light" ? "bg-slate-50 border-slate-250 text-slate-900" : "bg-slate-300/10 border-slate-300/30 text-white";
                    rankColor = "text-slate-605 dark:text-slate-300";
                    recordBadge = "🥈";
                  } else if (rank === 3) {
                    medalBgClass = themeMode === "light" ? "bg-amber-50/50 border-amber-250 text-slate-900" : "bg-amber-600/10 border-amber-600/30 text-white";
                    rankColor = "text-amber-700 dark:text-amber-600";
                    recordBadge = "🥉";
                  }
                  
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.4) }}
                      className={`transition-colors ${
                        themeMode === "light" ? "hover:bg-slate-50" : "hover:bg-slate-800/30"
                      } ${medalBgClass} border-b ${themeMode === "light" ? "border-slate-105" : "border-blue-500/5"}`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-5 font-mono font-bold">
                        {recordBadge ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{recordBadge}</span>
                            <span className={`${rankColor} font-black`}>#{rank}</span>
                          </div>
                        ) : (
                          <span className={`${themeMode === "light" ? "text-slate-450" : "text-slate-550"} pl-4`}>#{rank}</span>
                        )}
                      </td>

                      {/* Name Column */}
                      <td className={`py-4 px-4 font-display font-extrabold ${themeMode === "light" ? "text-slate-900" : "text-white"}`}>
                        {entry.studentName}
                        {entry.date === new Date().toISOString().split("T")[0] && (
                          <span className={`inline-block ml-2 text-3xs font-mono font-black tracking-widest ${themeMode === "light" ? "bg-blue-105 text-blue-650" : "bg-yellow-400/20 text-yellow-400"} px-2 py-0.5 rounded-full animate-pulse`}>
                            LIVE RUN
                          </span>
                        )}
                      </td>

                      {/* Class Level */}
                      <td className={`py-4 px-4 font-bold font-sans ${themeMode === "light" ? "text-slate-600" : "text-slate-300"}`}>
                        Class {entry.classLevel}
                      </td>

                      {/* Subject */}
                      <td className={`py-4 px-4 capitalize font-mono text-xs font-semibold ${themeMode === "light" ? "text-slate-550" : "text-slate-400"}`}>
                        {entry.subject}
                      </td>

                      {/* Accuracy */}
                      <td className="py-4 px-4 text-right font-mono font-bold">
                        <span className={entry.accuracy >= 80 ? "text-emerald-600" : entry.accuracy >= 50 ? "text-amber-600" : "text-rose-600"}>
                          {entry.accuracy}%
                        </span>
                        <span className={`${themeMode === "light" ? "text-slate-405" : "text-slate-500"} block text-2xs font-normal font-sans pt-0.5`}>
                          ({entry.score}/{entry.totalQuestions} Corr)
                        </span>
                      </td>

                      {/* Time taken */}
                      <td className={`py-4 px-4 text-right font-mono text-xs font-semibold ${themeMode === "light" ? "text-slate-605" : "text-slate-300"}`}>
                        {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s
                      </td>

                      {/* Total Points */}
                      <td className={`py-4 px-5 text-right font-display font-black text-sm ${themeMode === "light" ? "text-blue-600" : "text-slate-205 text-glow"}`}>
                        {entry.points.toLocaleString()}
                      </td>

                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
