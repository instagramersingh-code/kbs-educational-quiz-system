import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Users, RefreshCw, AlertCircle, Clock, Volume2, Award, LogOut, Sparkles } from "lucide-react";
import { QuizQuestion, SubjectType } from "../types";

// Prize ladder levels
export const PRIZE_LADDER = [
  { level: 10, value: 70000000, label: "7 CRORE 🌟" },
  { level: 9, value: 5000000, label: "50 LAKH" },
  { level: 8, value: 1250000, label: "12.5 LAKH" },
  { level: 7, value: 320000, label: "3.2 LAKH" },
  { level: 6, value: 160000, label: "1.6 LAKH 🔒 (Safe Haven)" },
  { level: 5, value: 50000, label: "50,000" },
  { level: 4, value: 20000, label: "20,000" },
  { level: 3, value: 10000, label: "10,000 🔒 (Safe Haven)" },
  { level: 2, value: 5000, label: "5,000" },
  { level: 1, value: 1000, label: "1,000" }
];

// Web Audio API Sound Synthesizer for retro KBC-style game show SFX
const playSfx = (type: 'tick' | 'correct' | 'wrong' | 'lock' | 'milestone' | 'bonus_start') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'lock') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.55);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'correct') {
      const playTone = (freq: number, startDelay: number, duration: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
        g.gain.setValueAtTime(0, ctx.currentTime + startDelay);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startDelay + 0.05);
        g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + startDelay + duration);
        o.start(ctx.currentTime + startDelay);
        o.stop(ctx.currentTime + startDelay + duration);
      };
      playTone(523.25, 0, 0.35);      // C5
      playTone(659.25, 0.1, 0.35);    // E5
      playTone(783.99, 0.2, 0.35);    // G5
      playTone(1046.50, 0.3, 0.61);   // C6
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.connect(flt);
      flt.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.85);
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(800, ctx.currentTime);
      flt.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.85);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.9);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.9);
    } else if (type === 'milestone') {
      const playBrightTone = (freq: number, startDelay: number, duration: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
        g.gain.setValueAtTime(0.12, ctx.currentTime + startDelay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
        o.start(ctx.currentTime + startDelay);
        o.stop(ctx.currentTime + startDelay + duration);
      };
      playBrightTone(880.00, 0, 0.45);   // A5
      playBrightTone(1318.51, 0.08, 0.45); // E6
      playBrightTone(1760.00, 0.16, 0.7);  // A6
    } else if (type === 'bonus_start') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.1);
      g.gain.setValueAtTime(0.01, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.15);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 1.15);
    }
  } catch (e) {
    console.warn("AudioContext setup block:", e);
  }
};

interface BonusQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  funFact: string;
}

const BONUS_QUESTIONS: BonusQuestion[] = [
  {
    question: "Which of the following creatures cannot blink because it has no eyelids?",
    options: ["Snake", "Owl", "Chameleon", "Koala"],
    correctAnswer: "Snake",
    explanation: "Snakes have transparent scales called brilles rather than moveable eyelids to shield their eyes in the wild.",
    funFact: "Therefore, snakes literally sleep with their eyes wide open!"
  },
  {
    question: "If you unraveled all of the DNA inside a single human cell, how far would it stretch mapped end-to-end?",
    options: ["From the Earth to the Sun and back", "Across an entire football field", "Directly from India to London", "About 2 meters"],
    correctAnswer: "From the Earth to the Sun and back",
    explanation: "All combined cells contain DNA spanning billions of kilometers, representing multiple roundtrips to the sun!",
    funFact: "The total length is mathematically calculated to be roughly 150 billion kilometers."
  },
  {
    question: "What is the only country in the entire world that doesn't have a rectangular or square official flag?",
    options: ["Nepal", "Switzerland", "Vatican City", "Bhutan"],
    correctAnswer: "Nepal",
    explanation: "Nepal's flag consists of two single triangles (pennons) representing Himalaya peaks and main local faiths.",
    funFact: "It stands as a beautiful geometric icon in human vexillology."
  },
  {
    question: "What celestial object emits powerful deep radio frequency pulses resembling ticking clocks in deep space?",
    options: ["Pulsars (Neutron Stars)", "Black Holes", "Supernovae", "Red Giants"],
    correctAnswer: "Pulsars (Neutron Stars)",
    explanation: "Pulsars rotate hundreds of times per second and send steady electromagnetic beams rotating past Earth like cosmic lighthouses.",
    funFact: "Their cycles are so precise they acts as inter-stellar coordinate clocks."
  },
  {
    question: "Before it became a widely celebrated beverage, chocolate was once used by the ancient Aztecs and Mayans as what?",
    options: ["A form of official currency", "Paint for royal temples", "A cleaning element", "Fuel for fire pits"],
    correctAnswer: "A form of official currency",
    explanation: "Cocoa beans were highly treasured in Mesoamerica and used as standardized money to buy food or trade.",
    funFact: "One rabbit could traditionally be purchased for exactly 30 cocoa beans!"
  }
];

interface KbcGameProps {
  studentName: string;
  classLevel: number;
  subject: SubjectType;
  questions: QuizQuestion[];
  timelessMode?: boolean;
  onGameEnd: (results: {
    pointsWon: number;
    correctCount: number;
    totalQuestions: number;
    timeSpent: number;
    answersList: {
      question: string;
      options: string[];
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  }) => void;
  onQuit: () => void;
  themeMode?: "light" | "dark";
  isEndless?: boolean;
  endlessDurationSeconds?: number;
  totalConfiguredQuestions?: number;
  language?: "en" | "hi";
}

// Helper to calculate dynamic ladder sizes
export const getDynamicLadder = (count: number) => {
  const ladder = [];
  for (let i = count; i >= 1; i--) {
    let value = 1000;
    if (i === count) {
      value = 70000000;
    } else if (i === 1) {
      value = 1000;
    } else {
      const ratio = (i - 1) / (count - 1);
      value = Math.round(1000 * Math.pow(70000000 / 1000, ratio));
      if (value > 1000000) {
        value = Math.round(value / 100000) * 100000;
      } else if (value > 10000) {
        value = Math.round(value / 5000) * 5000;
      } else {
        value = Math.round(value / 500) * 500;
      }
    }

    const milestone1 = Math.floor(count * 0.3);
    const milestone2 = Math.floor(count * 0.6);
    let label = value.toLocaleString();
    if (i === milestone1 || i === milestone2) {
      label += " 🔒 (Haven)";
    }
    if (i === count) {
      label += " 🌟";
    }
    ladder.push({ level: i, value, label });
  }
  return ladder;
};

export default function KbcGame({
  studentName,
  classLevel,
  subject,
  questions,
  timelessMode = false,
  onGameEnd,
  onQuit,
  themeMode = "dark",
  isEndless = false,
  endlessDurationSeconds = 300,
  totalConfiguredQuestions = 10,
  language = "en"
}: KbcGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showAnswerState, setShowAnswerState] = useState<'correct' | 'wrong' | null>(null);

  // Dynamic KBC ladder list based on total configuration
  const activePrizeLadder = React.useMemo(() => {
    return getDynamicLadder(totalConfiguredQuestions);
  }, [totalConfiguredQuestions]);

  // Endless Mode unified cooldown counter
  const [endlessTimeLeft, setEndlessTimeLeft] = useState(endlessDurationSeconds);

  // Bonus Game Level State variables
  const [showBonusIntro, setShowBonusIntro] = useState(false);
  const [inBonusMode, setInBonusMode] = useState(false);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusScore, setBonusScore] = useState(0);
  const [bonusSelectedOption, setBonusSelectedOption] = useState<string | null>(null);
  const [bonusIsLocked, setBonusIsLocked] = useState(false);
  const [bonusShowState, setBonusShowState] = useState<'correct' | 'wrong' | null>(null);
  const [bonusUserAnswers, setBonusUserAnswers] = useState<string[]>([]);
  const [bonusTimeLeft, setBonusTimeLeft] = useState(25);
  const bonusTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lifelines
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    flipQuestion: true,
    audiencePoll: true
  });
  
  // State for active lifeline effects
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [pollPercentages, setPollPercentages] = useState<{ [option: string]: number } | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion>(questions[0]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [pointsWon, setPointsWon] = useState(0);
  const [narratorText, setNarratorText] = useState("The game starts! Lock in your first answer to start climbing.");

  // Timers
  const [seconds, setSeconds] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeSpent = useRef(0);

  // Scroll tracking to show floating sticky timer when stats bar scrolls offscreen
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowFloatingTimer(true);
      } else {
        setShowFloatingTimer(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load current question
  useEffect(() => {
    if (questions[currentIdx]) {
      setActiveQuestion(questions[currentIdx]);
      setEliminatedOptions([]);
      setPollPercentages(null);
      setSelectedOption(null);
      setIsLocked(false);
      setShowAnswerState(null);

      // Adaptation of Timer based on Level relative to total configured count
      const level = currentIdx + 1;
      const progressRatio = level / totalConfiguredQuestions;
      if (progressRatio <= 0.3) {
        setSeconds(30);
      } else if (progressRatio <= 0.7) {
        setSeconds(45);
      } else {
        setSeconds(60);
      }
    }
  }, [currentIdx, questions, totalConfiguredQuestions]);

  // Unified Endless Mode countdown ticker
  useEffect(() => {
    if (!isEndless || isLocked || showBonusIntro || inBonusMode) {
      return;
    }

    const interval = setInterval(() => {
      totalTimeSpent.current += 1;
      setEndlessTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndlessTimeUp();
          return 0;
        }
        playSfx('tick');
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEndless, isLocked, showBonusIntro, inBonusMode]);

  const handleEndlessTimeUp = () => {
    setIsLocked(true);
    setNarratorText("⏰ Countdown Timer is up! Dramatic educational bells chime for assessments...");
    playSfx('milestone');
    setTimeout(() => {
      triggerGameEnd(pointsWon, correctCount);
    }, 1800);
  };

  // Standard Timers effect (disabled for endless mode)
  useEffect(() => {
    if (isLocked || isEndless) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      totalTimeSpent.current += 1;
      if (!timelessMode) {
        setSeconds((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          playSfx('tick');
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLocked, currentIdx, timelessMode, isEndless]);

  const handleTimeout = () => {
    setIsLocked(true);
    setNarratorText("⏰ Time's up! Dramatic buzzer sounds...");
    setTimeout(() => {
      handleWrongAnswer("");
    }, 1500);
  };

  // Get Safe Haven Points on Failure
  const getFallbackPoints = (currentLevel: number): number => {
    // Dynamically retrieve safepoint using our helper
    const milestone1 = Math.floor(totalConfiguredQuestions * 0.3);
    const milestone2 = Math.floor(totalConfiguredQuestions * 0.6);
    
    if (currentLevel >= milestone2) {
      const match = activePrizeLadder.find(p => p.level === milestone2);
      return match ? match.value : 0;
    } else if (currentLevel >= milestone1) {
      const match = activePrizeLadder.find(p => p.level === milestone1);
      return match ? match.value : 0;
    }
    return 0;
  };

  const handleOptionClick = (option: string) => {
    if (isLocked || eliminatedOptions.includes(option)) return;
    setSelectedOption(option);
  };

  // Lock and submit option
  const handleLockAnswer = () => {
    if (!selectedOption || isLocked) return;
    setIsLocked(true);
    playSfx('lock');
    setNarratorText("🔒 Locking in your answer... Let's see if that's correct.");

    // Match sound effect
    const isCorrect = selectedOption === activeQuestion.correctAnswer;

    // Dramatic pause
    setTimeout(() => {
      if (isCorrect) {
        const finalCorrectVal = correctCount + 1;
        setCorrectCount(finalCorrectVal);
        setShowAnswerState('correct');

        // Points calculation
        let prizeValue = 0;
        if (isEndless) {
          prizeValue = finalCorrectVal * 10000000; // 1 Crore per correct answer in Endless Mode
        } else {
          const levelPrizeDetails = activePrizeLadder.find(p => p.level === activeQuestion.level);
          prizeValue = levelPrizeDetails ? levelPrizeDetails.value : 0;
        }
        setPointsWon(prizeValue);

        const milestone1 = Math.floor(totalConfiguredQuestions * 0.3);
        const milestone2 = Math.floor(totalConfiguredQuestions * 0.6);

        if (!isEndless && (activeQuestion.level === milestone1 || activeQuestion.level === milestone2)) {
          playSfx('milestone');
          setNarratorText(`🎉 MATCH! You've secured the Milestones safe haven points. Outstanding!`);
        } else if (!isEndless && activeQuestion.level === totalConfiguredQuestions) {
          playSfx('milestone');
          setNarratorText(`🏆 CONGRATULATIONS! You achieved the Ultimate Standard of ${prizeValue.toLocaleString()} Points! Fanfares blast!`);
        } else {
          playSfx('correct');
          setNarratorText("🌈 CORRECT! Splendid choice. Let's head to the next question.");
        }

        // Wait to proceed
        setTimeout(() => {
          if (isEndless) {
            // Endless mode: loop or advance
            setCurrentIdx((prev) => {
              if (prev + 1 >= questions.length) {
                return 0; // Seamlessly loop around questions
              }
              return prev + 1;
            });
          } else if (activeQuestion.level === totalConfiguredQuestions) {
            // Standard mode: final question completed! Check 100% accuracy all clear for Secret Bonus Round
            if (finalCorrectVal === totalConfiguredQuestions) {
              setNarratorText(`🌟 ALL CLEAR! You achieved 100% accuracy with ${finalCorrectVal}/${totalConfiguredQuestions} correct answers and unlocked the Secret KBC Bonus Stage!`);
              setTimeout(() => {
                setShowBonusIntro(true);
              }, 1200);
            } else {
              triggerGameEnd(prizeValue, finalCorrectVal);
            }
          } else {
            setCurrentIdx((prev) => prev + 1);
          }
        }, 2200);

      } else {
        playSfx('wrong');
        setShowAnswerState('wrong');
        setNarratorText("💔 Alas... That is the incorrect answer.");
        setTimeout(() => {
          if (isEndless) {
            // Endless mode keeps going, just advances
            setCurrentIdx((prev) => {
              if (prev + 1 >= questions.length) {
                return 0; // Loops seamlessly
              }
              return prev + 1;
            });
          } else {
            handleWrongAnswer(selectedOption);
          }
        }, 2200);
      }
    }, 1800);
  };

  const handleWrongAnswer = (userAns: string) => {
    const fallback = getFallbackPoints(activeQuestion.level - 1);
    setNarratorText(`😔 Game Over! You finished and walk away with safe haven points: ${fallback.toLocaleString()}!`);
    triggerGameEnd(fallback, correctCount);
  };

  // Bonus Game Clock Effect
  useEffect(() => {
    if (!inBonusMode || bonusIsLocked || timelessMode) {
      if (bonusTimerRef.current) {
        clearInterval(bonusTimerRef.current);
        bonusTimerRef.current = null;
      }
      return;
    }

    setBonusTimeLeft(25);

    bonusTimerRef.current = setInterval(() => {
      totalTimeSpent.current += 1;
      setBonusTimeLeft((prev) => {
        if (prev <= 1) {
          if (bonusTimerRef.current) clearInterval(bonusTimerRef.current);
          handleBonusTimeout();
          return 0;
        }
        playSfx('tick');
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (bonusTimerRef.current) {
        clearInterval(bonusTimerRef.current);
        bonusTimerRef.current = null;
      }
    };
  }, [inBonusMode, bonusIndex, bonusIsLocked, timelessMode]);

  const handleBonusTimeout = () => {
    setBonusIsLocked(true);
    setBonusShowState('wrong');
    playSfx('wrong');
    setBonusUserAnswers((prev) => [...prev, "Timed Out"]);
    
    setTimeout(() => {
      advanceBonusRound();
    }, 4500);
  };

  const advanceBonusRound = () => {
    if (bonusIndex < 4) {
      setBonusIndex((prev) => prev + 1);
      setBonusSelectedOption(null);
      setBonusIsLocked(false);
      setBonusShowState(null);
    } else {
      triggerBonusGameEnd();
    }
  };

  const handleLockBonusAnswer = () => {
    if (!bonusSelectedOption || bonusIsLocked) return;
    setBonusIsLocked(true);
    playSfx('lock');
    setBonusUserAnswers((prev) => [...prev, bonusSelectedOption]);

    const activeBonus = BONUS_QUESTIONS[bonusIndex];
    const isCorr = bonusSelectedOption === activeBonus.correctAnswer;

    setTimeout(() => {
      if (isCorr) {
        setBonusScore((prev) => prev + 1);
        setBonusShowState('correct');
        playSfx('correct');
      } else {
        setBonusShowState('wrong');
        playSfx('wrong');
      }

      setTimeout(() => {
        advanceBonusRound();
      }, 4000);
    }, 1200);
  };

  const triggerBonusGameEnd = () => {
    const corePoints = 70000000;
    const finalPoints = corePoints + (bonusScore * 10000000);
    const finalCorrect = 10 + bonusScore;

    const coreResults = questions.map((q) => ({
      question: q.question,
      options: q.options,
      userAnswer: q.correctAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: true,
      explanation: q.explanation
    }));

    const bonusResults = BONUS_QUESTIONS.map((bq, idx) => {
      const uAns = bonusUserAnswers[idx] || (idx === bonusIndex ? bonusSelectedOption : null) || "Timed Out";
      const isCorr = uAns === bq.correctAnswer;
      return {
        question: `[🌟 BONUS GALA] ${bq.question}`,
        options: bq.options,
        userAnswer: uAns,
        correctAnswer: bq.correctAnswer,
        isCorrect: isCorr,
        explanation: `${bq.explanation} Fun Fact: ${bq.funFact}`
      };
    });

    onGameEnd({
      pointsWon: finalPoints,
      correctCount: finalCorrect,
      totalQuestions: 15,
      timeSpent: totalTimeSpent.current,
      answersList: [...coreResults, ...bonusResults]
    });
  };

  // Submit final scores
  const triggerGameEnd = (finalPoints: number, finalCorrect: number) => {
    const maxQuestions = isEndless ? Math.max(1, currentIdx + 1) : totalConfiguredQuestions;
    const sliceRange = questions.slice(0, maxQuestions);

    const savedResults = sliceRange.map((q, idx) => {
      // Find what they answered for this index of questions (if played yet)
      const isPlayed = idx < currentIdx || (idx === currentIdx && isLocked);
      let uAns = "";
      let isCorr = false;
      if (idx < currentIdx) {
        uAns = q.correctAnswer; // must have been correct to advance
        isCorr = true;
      } else if (idx === currentIdx && isLocked) {
        uAns = selectedOption || "Timed Out";
        isCorr = uAns === q.correctAnswer;
      } else {
        uAns = "Not Attempted";
        isCorr = false;
      }

      return {
        question: q.question,
        options: q.options,
        userAnswer: uAns,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorr,
        explanation: q.explanation
      };
    });

    onGameEnd({
      pointsWon: finalPoints,
      correctCount: finalCorrect,
      totalQuestions: maxQuestions,
      timeSpent: totalTimeSpent.current,
      answersList: savedResults
    });
  };

  // Handle Lifeline 50-50
  const handleFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isLocked) return;
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
    setNarratorText("🧙‍♂️ Lifeline: 50-50 Activated! Removing two incorrect options.");

    const correct = activeQuestion.correctAnswer;
    const incorrects = activeQuestion.options.filter(o => o !== correct);
    
    // Choose 2 random incorrects to eliminate
    const shuffledIncorrects = [...incorrects].sort(() => Math.random() - 0.5);
    const deleted = shuffledIncorrects.slice(0, 2);
    setEliminatedOptions(deleted);
  };

  // Handle Lifeline Audience Poll
  const handleAudiencePoll = () => {
    if (!lifelines.audiencePoll || isLocked) return;
    setLifelines((prev) => ({ ...prev, audiencePoll: false }));
    setNarratorText("📊 Lifeline: Audience Poll! The audience is keying in their answers.");

    const correct = activeQuestion.correctAnswer;
    const level = activeQuestion.level;

    // Correct answer chances: High for easy, slightly lower for expert
    let correctWeight = 75;
    if (level > 3 && level <= 7) correctWeight = 55;
    else if (level > 7) correctWeight = 42;

    const remainingWeight = 100 - correctWeight;
    const incorrects = activeQuestion.options.filter(o => o !== correct);
    
    // Distribute remaining amongst incorrect options
    const rawShares = incorrects.map(() => Math.random());
    const sum = rawShares.reduce((a, b) => a + b, 0);
    const shares = rawShares.map(s => Math.round((s / sum) * remainingWeight));
    
    // Accumulate percentages and level out to exactly 100
    const finalPoll: { [option: string]: number } = {};
    finalPoll[correct] = correctWeight;
    
    incorrects.forEach((inc, idx) => {
      finalPoll[inc] = shares[idx] || 0;
    });

    // Handle any small rounding error
    let totalPct = Object.values(finalPoll).reduce((a, b) => a + b, 0);
    if (totalPct !== 100) {
      finalPoll[correct] += (100 - totalPct);
    }

    setPollPercentages(finalPoll);
  };

  // Handle Lifeline Flip Question
  const handleFlipQuestion = () => {
    if (!lifelines.flipQuestion || isLocked) return;
    setLifelines((prev) => ({ ...prev, flipQuestion: false }));
    setIsFlipped(true);
    setNarratorText("🔄 Lifeline: Flip Question! Replacing the current subject question.");

    // Generate/inject a substitute high-quality question tailored to same level/subject
    const substituteQuestion: QuizQuestion = {
      id: `flipped-ques-${Date.now()}`,
      question: subject === "science" 
        ? "Which of the following is the physical state of water below 0 degrees Celsius?" 
        : subject === "history" 
          ? "Who was the legendary Queen of Jhansi known for her pivotal role in the Indian Revolt of 1857?"
          : "Which country is renowned as the Land of the Rising Sun?",
      options: subject === "science"
        ? ["Gas (Steam)", "Liquid (Water)", "Solid (Ice)", "Plasma"]
        : subject === "history"
          ? ["Rani Lakshmibai", "Rani Padmini", "Razia Sultana", "Astrid of Britain"]
          : ["Japan", "Norway", "Cairo", "Australia"],
      correctAnswer: subject === "science" ? "Solid (Ice)" : subject === "history" ? "Rani Lakshmibai" : "Japan",
      explanation: "This acts as a solid backup standard, ensuring educational progress.",
      difficulty: activeQuestion.difficulty,
      level: activeQuestion.level
    };

    setActiveQuestion(substituteQuestion);
    setEliminatedOptions([]);
    setPollPercentages(null);
    setSelectedOption(null);
  };

  // Safe Walk away / Quit Option
  const handleWalkAway = () => {
    let walkAwayPoints = 0;
    if (isEndless) {
      walkAwayPoints = pointsWon;
    } else {
      walkAwayPoints = currentIdx > 0 ? activePrizeLadder.find(p => p.level === currentIdx)?.value || 0 : 0;
    }
    setNarratorText(`🚪 You decided to Quit and Walk Away. Enjoy your points: ${walkAwayPoints.toLocaleString()}!`);
    setTimeout(() => {
      triggerGameEnd(walkAwayPoints, correctCount);
    }, 1500);
  };

  if (showBonusIntro) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-display text-center animate-transition">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border-2 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 ${
            themeMode === "light" 
              ? "bg-white border-yellow-400 text-slate-900" 
              : "bg-slate-900/90 border-yellow-500/60 text-white box-glow"
          }`}
        >
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full animate-pulse">
              <Sparkles className="w-12 h-12 text-yellow-550" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 animate-bounce">
              🌟 EXTRAORDINARY ACHIEVEMENT 🌟
            </h1>
            <p className={`text-xs sm:text-sm tracking-widest uppercase font-mono ${themeMode === "light" ? "text-slate-500" : "text-yellow-405"}`}>
              100% Accuracy All Clear!
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4 font-sans leading-relaxed">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Congratulations {studentName}! You answered all 10 standard level questions correctly!
            </h3>
            <p className={themeMode === "light" ? "text-slate-605 font-medium" : "text-slate-300"}>
              You have secured the monumental <strong>7 CRORE (70,000,000) base points!</strong> Your impeccable knowledge has unlocked the legendary <strong>KBC Secret Bonus Round</strong>.
            </p>
            <div className={`p-5 rounded-2xl border text-left ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-cyan-500/30 text-cyan-300"}`}>
              <h4 className="font-bold text-sm mb-2 text-yellow-500">🛡️ BONUS ROUND RULES:</h4>
              <ul className="text-xs space-y-1.5 text-left list-disc list-inside">
                <li>You will face <strong>5 highly fun knowledge questions and mind-boggling fun facts</strong>.</li>
                <li>Questions cover an integrated mixture of General Knowledge, Science, and History!</li>
                <li>Each correct answer appends a massive <strong>1 Crore (10,000,000) points</strong> to your safe vault score!</li>
                <li>There are no lifelines here. A fast 25-second timer runs continuously (if not timeless).</li>
                <li>Incorrect answers do NOT lose your base 7 Crore points; they simply add no extra bonus. Try for a perfect 12 Crore score!</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => {
                setShowBonusIntro(false);
                setInBonusMode(true);
                playSfx('bonus_start');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm tracking-widest rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 cursor-pointer animate-pulse"
            >
              🚀 ENTER SECRET BONUS ROUND
            </button>
            <button
              onClick={() => {
                triggerGameEnd(70000000, 10);
              }}
              className={`w-full sm:w-auto px-8 py-4 border-2 rounded-full font-bold text-sm tracking-widest transition duration-300 transform hover:scale-102 cursor-pointer ${
                themeMode === "light" 
                  ? "bg-slate-100 border-slate-300 hover:bg-slate-202 text-slate-700" 
                  : "bg-slate-950/40 border-slate-800 hover:bg-slate-900 text-slate-300"
              }`}
            >
              💰 BANK 7 CRORE POINTS & EXIT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (inBonusMode) {
    const currentBonusNum = bonusIndex + 1;
    const activeBonus = BONUS_QUESTIONS[bonusIndex];

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 font-display animate-transition">
        {/* Top Header stats */}
        <div className={`flex flex-col md:flex-row justify-between items-center ${themeMode === "light" ? "bg-white border-slate-200 text-slate-850" : "bg-slate-900/80 border-yellow-500/20"} border-2 px-6 py-4 rounded-3xl mb-8 gap-4 box-glow shadow-xl`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center kbc-logo-circle">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
            </div>
            <div>
              <h3 className={`font-extrabold text-base md:text-lg ${themeMode === "light" ? "text-slate-850" : "text-white"}`}>{studentName}</h3>
              <p className={`text-xs ${themeMode === "light" ? "text-slate-550" : "text-amber-400"} font-sans tracking-wide uppercase font-bold`}>
                ⭐ SECRET BONUS GALA ROUND ⭐
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timelessMode ? (
              <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-slate-100 border-emerald-500 text-emerald-600" : "bg-[#1E293B] border-emerald-500/60 text-emerald-400"} px-5 py-2 rounded-full border-2 font-mono font-bold text-xs tracking-wider uppercase`}>
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Timeless ⏳</span>
              </div>
            ) : (
              <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-amber-50 border-amber-400 text-amber-700 font-mono font-bold" : "bg-[#1E293B] border-yellow-500 text-yellow-400"} px-6 py-2 rounded-full border-2 font-mono font-bold text-xl timer-glow animate-pulse`}>
                <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
                <span>00:{bonusTimeLeft.toString().padStart(2, "0")}</span>
              </div>
            )}
            <div className={`px-4 py-2 text-xs font-bold rounded-full ${themeMode === "light" ? "bg-slate-105 border text-slate-705" : "bg-slate-950/60 border border-slate-800 text-slate-400"}`}>
              {bonusScore} / 5 Correct
            </div>
          </div>

          <div className="text-right">
            <p className={`text-xs ${themeMode === "light" ? "text-slate-500" : "text-slate-400"} uppercase tracking-widest font-mono`}>SAFE BANK + ACCUMULATED BONUS</p>
            <p className={`text-2xl font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-405"} text-glow`}>{(70000000 + (bonusScore * 10000000)).toLocaleString()} Pts</p>
          </div>
        </div>

        {/* Play core grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Question Display Card (With magical cyber design) */}
            <div className={`${themeMode === "light" ? "bg-white border-2 border-slate-205 text-slate-850" : "geo-question-box"} p-8 sm:p-12 rounded-3xl text-center box-glow overflow-hidden relative border-yellow-500/30`}>
              {themeMode !== "light" && (
                <>
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-yellow-500/40 via-transparent to-yellow-500/40"></div>
                  <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-yellow-500/40 via-transparent to-yellow-500/40"></div>
                </>
              )}

              <span className={`text-xs font-bold ${themeMode === "light" ? "text-amber-600" : "text-yellow-450"} tracking-widest uppercase block mb-3 font-mono`}>
                ⭐ BONUS CHALLENGE {currentBonusNum} OF 5 ⭐ VALUE: +1 CRORE
              </span>

              <motion.h2
                key={bonusIndex}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-xl sm:text-3xl font-black ${themeMode === "light" ? "text-slate-900" : "text-white text-glow"} leading-relaxed font-display`}
              >
                {activeBonus.question}
              </motion.h2>
            </div>

            {/* Answers Options Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBonus.options.map((opt, i) => {
                const isSel = bonusSelectedOption === opt;
                const isCorrectAns = opt === activeBonus.correctAnswer;
                const charCode = ["A", "B", "C", "D"][i];

                let optionStyle = themeMode === "light"
                  ? "bg-white border-slate-200 text-slate-750 hover:bg-slate-50 focus:bg-slate-55"
                  : "bg-slate-900/60 border-blue-500/15 text-slate-200 hover:border-cyan-500/40 hover:text-white";

                if (bonusIsLocked) {
                  if (bonusShowState === null) {
                    optionStyle = isSel 
                      ? "bg-amber-500/20 border-amber-500 text-amber-500 cursor-not-allowed scale-[1.01]" 
                      : "opacity-40 cursor-not-allowed";
                  } else {
                    if (isCorrectAns) {
                      optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold animate-pulse scale-[1.01] shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    } else if (isSel) {
                      optionStyle = "bg-rose-500/15 border-rose-500 text-rose-400 font-bold opacity-80 scale-98";
                    } else {
                      optionStyle = "opacity-25 cursor-not-allowed";
                    }
                  }
                } else if (isSel) {
                  optionStyle = themeMode === "light"
                    ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm scale-101 font-semibold"
                    : "bg-[#1E293B] border-cyan-500 text-cyan-400 scale-[1.01] shadow-[0_0_12px_rgba(34,211,238,0.25)] font-semibold";
                }

                return (
                  <button
                    key={opt}
                    disabled={bonusIsLocked}
                    onClick={() => {
                      if (!bonusIsLocked) setBonusSelectedOption(opt);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition duration-300 font-display flex items-center justify-between group overflow-hidden relative cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono tracking-normal shrink-0 border duration-300 ${
                        isSel 
                          ? "bg-cyan-500 text-slate-950 border-cyan-500" 
                          : themeMode === "light" ? "bg-slate-100 text-slate-450 border-slate-202" : "bg-slate-950 text-blue-400 border-blue-500/30"
                      }`}>
                        {charCode}
                      </span>
                      <span className="text-xs sm:text-sm tracking-wide font-semibold pr-2 select-none">
                        {opt}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Lock Confirmation */}
            {bonusSelectedOption && !bonusIsLocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleLockBonusAnswer}
                  className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm tracking-widest rounded-full transition duration-300 flex items-center gap-2 shadow-lg shadow-yellow-500/30 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>CONFIRM & LOCK BONUS SELECTION</span>
                </button>
              </motion.div>
            )}

            {/* Atmosphere Narrator Caption & Fun Fact display */}
            <div className={`p-5 ${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/95 border-yellow-500/20"} border-2 rounded-2xl flex flex-col gap-3 mt-2`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className={`font-sans text-xs italic ${themeMode === "light" ? "text-slate-700" : "text-slate-200"} antialiased leading-relaxed`}>
                  {bonusIsLocked
                    ? bonusShowState === 'correct'
                      ? "🎉 Spot on! Extraordinary logic! That is absolutely correct! Preparing next bonus frame..."
                      : bonusShowState === 'wrong'
                        ? "💔 Alas, that was the incorrect option. Let's study the answer facts to sharpen your knowledge!"
                        : "🔒 Evaluating. Wait for the clock verification..."
                    : "Pick an option and lock it in. No lifelines, just pure educational brilliance!"}
                </div>
              </div>

              {bonusShowState !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`mt-2 pt-3 border-t font-sans text-xs space-y-2 ${themeMode === "light" ? "border-slate-200" : "border-yellow-500/10"}`}
                >
                  <p className={themeMode === "light" ? "text-slate-800" : "text-slate-100"}>
                    <strong>🧠 Educational Fact:</strong> {activeBonus.explanation}
                  </p>
                  <p className={themeMode === "light" ? "text-emerald-700 font-semibold" : "text-emerald-400 font-semibold"}>
                    <strong>✨ Fun Fact:</strong> {activeBonus.funFact}
                  </p>
                </motion.div>
              )}
            </div>

          </div>

          {/* Sidebar tracker: Visual Level ladder of current bonus index */}
          <div className="lg:col-span-1">
            <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/80 border-yellow-500/25"} border-2 rounded-3xl p-5 space-y-4 shadow-2xl`}>
              <div className="flex justify-between items-center pb-2 border-b border-yellow-500/20 flex-nowrap">
                <span className={`text-xs font-black ${themeMode === "light" ? "text-amber-600" : "text-yellow-405"} tracking-wider uppercase font-mono`}>BONUS CHART</span>
                <span className="text-3xs bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-1.5 py-0.5 rounded-full font-bold">BONUS</span>
              </div>
              
              <div className="space-y-1.5 font-mono text-xs">
                {BONUS_QUESTIONS.map((item, idx) => {
                  const itemIndex = idx + 1;
                  const isCurrent = bonusIndex === idx;
                  const isSolved = idx < bonusIndex;
                  const isCorrectBonus = isSolved && bonusUserAnswers[idx] === item.correctAnswer;

                  let rowStyle = "opacity-40 border-transparent bg-slate-950/20";
                  if (isCurrent) {
                    rowStyle = "border-2 border-yellow-500 bg-yellow-500/15 font-black text-yellow-500";
                  } else if (isSolved) {
                    rowStyle = isCorrectBonus 
                      ? "border border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold opacity-80"
                      : "border border-rose-950 bg-rose-500/5 text-rose-400 font-bold opacity-60";
                  }

                  return (
                    <div
                      key={item.question.slice(0, 15)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300 ${rowStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>#{itemIndex.toString().padStart(2, "0")}</span>
                        <span className="text-3xs tracking-widest uppercase font-sans">
                          {isCurrent ? "ACTIVE" : isSolved ? isCorrectBonus ? "CORRECT" : "MISSED" : "LOCKED"}
                        </span>
                      </div>
                      <span className="text-right font-bold text-3xs font-sans">
                        {isSolved ? (isCorrectBonus ? "+1 CRORE" : "+0") : `+1 CRORE`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-yellow-500/20 text-center text-xs">
                <span className={`${themeMode === "light" ? "text-slate-550" : "text-slate-400"}`}>Gained Bonus Pts:</span>
                <p className={`text-lg font-black ${themeMode === "light" ? "text-emerald-700" : "text-emerald-400"} mt-0.5 animate-pulse`}>
                  +{(bonusScore * 10000000).toLocaleString()} POINTS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-display animate-transition">
      {/* Quiz Top Action & Stats Bar with Geometric styling */}
      <div className={`flex flex-col md:flex-row justify-between items-center ${themeMode === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900/80 border-blue-500/30"} border-2 px-6 py-4 rounded-3xl mb-8 gap-4 box-glow`}>
        
        {/* Student identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center kbc-logo-circle">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className={`font-extrabold text-base md:text-lg ${themeMode === "light" ? "text-slate-850" : "text-white"}`}>{studentName}</h3>
            <p className={`text-xs ${themeMode === "light" ? "text-slate-550" : "text-slate-400"} font-sans tracking-wide`}>
              Grade {classLevel} Scholar • <span className={`uppercase font-bold ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"}`}>{subject} Adaptivity</span>
            </p>
          </div>
        </div>

        {/* Live Timer styled as the red monospace pill from the Design HTML */}
        <div className="flex items-center gap-4 animate-transition">
          {timelessMode ? (
            <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-slate-100 border-emerald-500 text-emerald-600 animate-none" : "bg-[#1E293B] border-emerald-500/70 text-emerald-400"} px-5 py-2 rounded-full border-2 font-mono font-bold text-xs tracking-wider uppercase timer-glow shadow-[0_0_15px_rgba(16,185,129,0.15)]`}>
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Timeless ⏳</span>
            </div>
          ) : isEndless ? (
            <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-amber-50 border-amber-500 text-amber-600" : "bg-[#1E293B] border-[#EAB308] text-[#EAB308]"} px-6 py-2 rounded-full border-2 font-mono font-bold text-xl timer-glow animate-pulse`}>
              <Clock className="w-5 h-5 text-[#EAB308] animate-spin" />
              <span>
                {Math.floor(endlessTimeLeft / 60).toString().padStart(2, "0")}:
                {(endlessTimeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-[#FFF1F2] border-red-400 text-red-650" : "bg-[#1E293B] border-red-500 text-red-500"} px-6 py-2 rounded-full border-2 font-mono font-bold text-xl timer-glow animate-pulse`}>
              <Clock className="w-5 h-5 text-red-500 animate-spin" />
              <span>00:{seconds.toString().padStart(2, "0")}</span>
            </div>
          )}

          <button
            onClick={handleWalkAway}
            className={`flex items-center gap-2 px-5 py-2 ${themeMode === "light" ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" : "bg-red-950/40 hover:bg-red-900/40 text-red-400 border-2 border-red-900/50"} rounded-full transition text-xs font-bold uppercase tracking-wider group border`}
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span>Quit Match</span>
          </button>
        </div>

        {/* Current status points */}
        <div className="text-right">
          <p className={`text-xs ${themeMode === "light" ? "text-slate-550" : "text-slate-400"} uppercase tracking-widest font-mono`}>Accumulated Points</p>
          <p className={`text-2xl font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} text-glow`}>{pointsWon.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Play interface: Questions and options */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Lifelines section as round capsules */}
          <div className={`${themeMode === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-blue-500/25"} border-2 p-4 rounded-full flex justify-around items-center`}>
            <span className={`text-xs font-bold ${themeMode === "light" ? "text-slate-600" : "text-blue-400"} uppercase tracking-widest hidden md:inline ml-4`}>LIFELINES:</span>
            
            <button
              onClick={handleFiftyFifty}
              disabled={!lifelines.fiftyFifty || isLocked}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                lifelines.fiftyFifty 
                  ? themeMode === "light" ? "bg-white border-slate-200 hover:border-yellow-600/70 text-slate-705 hover:text-yellow-650" : "bg-slate-900 border-blue-500/20 hover:border-yellow-500/50 text-gray-200 hover:text-yellow-400 box-glow" 
                  : "bg-slate-900/20 border-slate-900 text-slate-450 line-through cursor-not-allowed opacity-30"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>50-50</span>
            </button>

            <button
              onClick={handleAudiencePoll}
              disabled={!lifelines.audiencePoll || isLocked}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                lifelines.audiencePoll 
                  ? themeMode === "light" ? "bg-white border-slate-200 hover:border-orange-500/70 text-slate-705 hover:text-orange-600" : "bg-slate-900 border-blue-500/20 hover:border-orange-500/50 text-gray-200 hover:text-orange-400 box-glow" 
                  : "bg-slate-900/20 border-slate-900 text-slate-450 line-through cursor-not-allowed opacity-30"
              }`}
            >
              <Users className="w-4 h-4 text-orange-400" />
              <span>Audience</span>
            </button>

            <button
              onClick={handleFlipQuestion}
              disabled={!lifelines.flipQuestion || isLocked}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                lifelines.flipQuestion 
                  ? themeMode === "light" ? "bg-white border-slate-200 hover:border-violet-500/70 text-slate-705 hover:text-violet-600" : "bg-slate-900 border-blue-500/20 hover:border-violet-500/50 text-gray-200 hover:text-violet-400 box-glow" 
                  : "bg-slate-900/20 border-slate-900 text-slate-450 line-through cursor-not-allowed opacity-30"
              }`}
            >
              <RefreshCw className="w-4 h-4 text-violet-400" />
              <span>Flip</span>
            </button>
          </div>

          {/* Question Display Card (with custom KBC line geometry from index.css) */}
          <div className={`${themeMode === "light" ? "bg-white border-2 border-slate-200 text-slate-800" : "geo-question-box"} p-8 sm:p-12 rounded-3xl text-center box-glow overflow-hidden relative`}>
            {themeMode !== "light" && (
              <>
                <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-blue-550 via-transparent to-blue-550"></div>
                <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-blue-550 via-transparent to-blue-550"></div>
              </>
            )}
            
            <span className={`text-xs font-bold ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} tracking-widest uppercase block mb-3 font-mono`}>
              {isEndless 
                ? `QUESTION ${currentIdx + 1} • ENDLESS CHALLENGE` 
                : `LEVEL ${activeQuestion.level} OF ${totalConfiguredQuestions} • ${activeQuestion.difficulty.toUpperCase()}`
              }
            </span>

            <motion.h2
              key={activeQuestion.id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-xl sm:text-3xl font-black ${themeMode === "light" ? "text-slate-900" : "text-white text-glow"} leading-relaxed font-display`}
            >
              {activeQuestion.question}
            </motion.h2>
          </div>

          {/* Options Grid styled as rounded capsules / pills as requested */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQuestion.options.map((opt, idx) => {
              const letter = ["A", "B", "C", "D"][idx];
              const isEliminated = eliminatedOptions.includes(opt);
              const isChosen = selectedOption === opt;
              
              // Resolve classes for background, flashing, locking and correctness in capsules
              let optClass = themeMode === "light"
                ? "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-800" 
                : "bg-slate-950 border-blue-500/30 hover:border-blue-550 hover:bg-slate-900 text-slate-200";
              
              if (isChosen) {
                optClass = "bg-amber-500/10 border-amber-500 text-amber-600 font-bold ring-1 ring-amber-500/30";
              }
              if (isLocked && isChosen) {
                optClass = "bg-yellow-500/20 border-yellow-550 text-yellow-600 font-black animate-pulse";
              }
              if (showAnswerState && isChosen) {
                optClass = showAnswerState === 'correct' 
                  ? "bg-emerald-500/25 border-emerald-500 text-emerald-600 font-extrabold" 
                  : "bg-red-500/25 border-red-500 text-red-650 font-extrabold animate-bounce";
              }
              // If wrong answered, highlight the correct one in green
              if (showAnswerState === 'wrong' && opt === activeQuestion.correctAnswer) {
                optClass = "bg-emerald-500/20 border-emerald-500 text-emerald-600 font-extrabold";
              }
              if (isEliminated) {
                optClass = themeMode === "light"
                  ? "opacity-20 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "opacity-20 bg-slate-950 border-slate-950 text-slate-705 cursor-not-allowed";
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isLocked || isEliminated}
                  className={`w-full py-4.5 px-8 rounded-full border-2 text-left flex items-center justify-between transition-all duration-300 group box-glow ${optClass}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Prefix letter matching design: opt-prefix yellow, bold 1.1rem */}
                    <span className="text-yellow-550 dark:text-yellow-400 font-mono font-black text-base tracking-wider mr-1">
                      {letter}:
                    </span>
                    
                    {/* Option Text */}
                    <span className="text-sm sm:text-base flex-grow font-sans font-medium tracking-tight">
                      {isEliminated ? "------" : opt}
                    </span>
                  </div>

                  {/* Audience poll indicator overlay */}
                  {pollPercentages && !isEliminated && (
                    <div className="flex items-center gap-2 font-mono text-xs font-bold pl-2">
                      <span className="text-yellow-550 dark:text-yellow-400">{pollPercentages[opt]}%</span>
                      <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-400 h-full transition-all duration-1000"
                          style={{ width: `${pollPercentages[opt]}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Locking Prompt button */}
          {selectedOption && !isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={handleLockAnswer}
                className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm tracking-widest rounded-full transition duration-300 flex items-center gap-2 shadow-lg shadow-yellow-500/30"
              >
                <Volume2 className="w-4 h-4" />
                <span>CONFIRM & LOCK SELECTION</span>
              </button>
            </motion.div>
          )}

          {/* Atmosphere Narrator Caption */}
          <div className={`p-4 ${themeMode === "light" ? "bg-slate-50 border-slate-205" : "bg-slate-950/95 border-blue-500/20"} border-2 rounded-2xl flex items-start gap-3 mt-2`}>
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className={`font-sans text-xs italic ${themeMode === "light" ? "text-slate-705" : "text-slate-300"} antialiased leading-relaxed`}>
              {narratorText}
            </div>
          </div>

        </div>

        {/* Right side Prize ladder hierarchy - styled as Sidebar card from Design HTML or Endless Summary */}
        <div className="lg:col-span-1">
          {isEndless ? (
            <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/80 border-blue-500/30"} border-2 rounded-3xl p-5 space-y-4 shadow-2xl box-glow`}>
              <div className={`flex justify-between items-center pb-2 border-b ${themeMode === "light" ? "border-slate-105" : "border-blue-500/20"}`}>
                <span className={`text-xs font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} tracking-wider uppercase font-mono`}>ENDLESS PLAY SUMMARY</span>
                <span className="text-xs bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-2 py-0.5 rounded-full font-bold animate-pulse">RUNNING</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className={`p-3.5 rounded-2xl ${themeMode === "light" ? "bg-slate-50 border border-slate-200" : "bg-slate-950/40 border border-blue-500/10"}`}>
                  <span className="text-3xs text-slate-400 uppercase tracking-widest block font-bold">TOTAL ATTEMPTED</span>
                  <p className={`text-lg font-black mt-0.5 ${themeMode === "light" ? "text-slate-800" : "text-blue-400"}`}>{currentIdx} Questions</p>
                </div>

                <div className={`p-3.5 rounded-2xl ${themeMode === "light" ? "bg-slate-50 border border-slate-200" : "bg-slate-950/40 border border-blue-500/10"}`}>
                  <span className="text-3xs text-slate-400 uppercase tracking-widest block font-bold">ACCUMULATED CORRECT</span>
                  <p className="text-lg font-black mt-0.5 text-emerald-500">{correctCount} Correct</p>
                </div>

                <div className={`p-3.5 rounded-2xl ${themeMode === "light" ? "bg-slate-50 border border-slate-200" : "bg-slate-950/40 border border-blue-500/10"}`}>
                  <span className="text-3xs text-slate-400 uppercase tracking-widest block font-bold">CURRENT PERFORMANCE SCORE</span>
                  <p className="text-lg font-black mt-0.5 text-yellow-400 animate-pulse">{pointsWon.toLocaleString()} PTS</p>
                </div>
              </div>

              <div className={`pt-3 border-t ${themeMode === "light" ? "border-slate-105" : "border-blue-500/20"} text-center`}>
                <span className={`text-xs ${themeMode === "light" ? "text-slate-500" : "text-slate-405"} italic leading-relaxed`}>
                  Countdown ticker governs active session limit. Maximize scores!
                </span>
              </div>
            </div>
          ) : (
            <div className={`${themeMode === "light" ? "bg-white border-slate-200" : "bg-slate-900/80 border-blue-500/30"} border-2 rounded-3xl p-5 space-y-4 shadow-2xl box-glow`}>
              <div className={`flex justify-between items-center pb-2 border-b ${themeMode === "light" ? "border-slate-105" : "border-blue-500/20"}`}>
                <span className={`text-xs font-black ${themeMode === "light" ? "text-blue-600" : "text-yellow-400"} tracking-wider uppercase font-mono`}>PRIZE CHART</span>
                <span className="text-xs bg-red-500/20 border border-red-500 text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
              </div>
              
              <div className="space-y-1.5">
                {activePrizeLadder.map((item) => {
                  const isActive = activeQuestion.level === item.level;
                  const isPassed = item.level < activeQuestion.level;
                  
                  let textStyle = themeMode === "light" ? "text-slate-400 font-sans font-medium" : "text-slate-500 font-sans font-medium";
                  let containerClass = "border-transparent bg-slate-950/20";
                  
                  if (isActive) {
                    textStyle = themeMode === "light" ? "text-blue-600 font-black" : "text-yellow-400 font-black text-glow";
                    containerClass = themeMode === "light" ? "border-2 border-blue-500 bg-blue-50/5 shadow-sm" : "border-2 border-yellow-500/50 bg-yellow-500/10";
                  } else if (isPassed) {
                    textStyle = "text-emerald-500 font-semibold line-through decoration-emerald-500/40 opacity-70";
                  } else if (themeMode === "light") {
                    containerClass = "border-transparent bg-slate-50";
                  }

                  return (
                    <div
                      key={item.level}
                      className={`flex items-center justify-between px-3.5 py-1.5 rounded-xl border text-sm transition-all duration-300 ${containerClass}`}
                    >
                      <span className={`font-mono text-xs ${isActive ? (themeMode === "light" ? "text-blue-600 font-bold" : "text-yellow-400 font-bold") : isPassed ? "text-emerald-500" : themeMode === "light" ? "text-slate-450" : "text-slate-600"}`}>
                        #{item.level.toString().padStart(2, "0")}
                      </span>
                      <span className={`text-right tracking-tight font-display text-xs font-bold ${textStyle}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={`pt-3 border-t ${themeMode === "light" ? "border-slate-105" : "border-blue-500/20"}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`${themeMode === "light" ? "text-slate-555" : "text-slate-400"} font-semibold`}>Safe Threshold:</span>
                  <span className={`${themeMode === "light" ? "text-blue-600" : "text-blue-400"} font-black tracking-wide`}>
                    {getFallbackPoints(activeQuestion.level - 1).toLocaleString()} Pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Sticky Timer for Scroll Resilience */}
      <AnimatePresence>
        {showFloatingTimer && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-55 pointer-events-auto"
          >
            {timelessMode ? (
              <div className={`flex items-center gap-2 ${themeMode === "light" ? "bg-white border-emerald-400 text-emerald-600 shadow-xl" : "bg-slate-900/95 border-emerald-500/70 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"} px-4 py-2.5 rounded-full border-2 font-mono font-bold text-xs tracking-wider uppercase backdrop-blur-md`}>
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Timeless⏳</span>
              </div>
            ) : isEndless ? (
              <div className={`flex items-center gap-3 ${themeMode === "light" ? "bg-white border-amber-400 text-amber-600 shadow-xl" : "bg-slate-900/95 border-amber-500/70 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]"} px-5 py-3 rounded-full border-2 font-mono font-bold text-lg backdrop-blur-md`}>
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                  <Clock className="w-4 h-4 sm:w-5 h-5 text-amber-500 animate-spin relative" />
                </div>
                <span>
                  {Math.floor(endlessTimeLeft / 60).toString().padStart(2, "0")}:
                  {(endlessTimeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            ) : (
              <div className={`flex items-center gap-3 ${themeMode === "light" ? "bg-white border-red-400 text-red-600 shadow-xl" : "bg-slate-900/95 border-red-500/70 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]"} px-5 py-3 rounded-full border-2 font-mono font-bold text-lg backdrop-blur-md`}>
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <Clock className="w-4 h-4 sm:w-5 h-5 text-red-500 animate-spin relative" />
                </div>
                <span>00:{seconds.toString().padStart(2, "0")}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
