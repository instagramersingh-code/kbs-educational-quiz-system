import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Setup ESM paths
const __filename = process.argv[1] || "";
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. AI quiz generation will fall back to rich default templates.");
}

// Ensure database folders are setup
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const QUIZ_CACHE_FILE = path.join(DATA_DIR, "quiz_cache.json");

// Rich Mock Data for pre-seeding
const DEFAULT_LEADERBOARD = [
  { id: "mock-1", studentName: "Aarav Sharma", classLevel: 8, subject: "science", points: 70000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 245, date: "2026-06-18" },
  { id: "mock-2", studentName: "Priya Patel", classLevel: 6, subject: "gk", points: 320000, score: 7, totalQuestions: 10, accuracy: 70, timeSpent: 180, date: "2026-06-19" },
  { id: "mock-3", studentName: "Kabir Singh", classLevel: 10, subject: "history", points: 1250000, score: 8, totalQuestions: 10, accuracy: 80, timeSpent: 210, date: "2026-06-19" },
  { id: "mock-4", studentName: "Ananya Iyer", classLevel: 5, subject: "science", points: 10000, score: 4, totalQuestions: 10, accuracy: 40, timeSpent: 95, date: "2026-06-20" },
  { id: "mock-5", studentName: "Rohan Das", classLevel: 12, subject: "history", points: 70000000, score: 10, totalQuestions: 10, accuracy: 100, timeSpent: 305, date: "2026-06-20" },
  { id: "mock-6", studentName: "Siddharth Sen", classLevel: 4, subject: "gk", points: 160000, score: 6, totalQuestions: 10, accuracy: 60, timeSpent: 130, date: "2026-06-20" },
  { id: "mock-7", studentName: "Meera Nair", classLevel: 3, subject: "science", points: 50000, score: 5, totalQuestions: 10, accuracy: 50, timeSpent: 110, date: "2026-06-17" },
  { id: "mock-8", studentName: "Vihaan Gupta", classLevel: 7, subject: "gk", points: 1250000, score: 8, totalQuestions: 10, accuracy: 80, timeSpent: 195, date: "2026-06-18" },
];

const DEFAULT_REPORTS = [
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

// Helper to safely read files
function readJSONFile(filePath: string, defaultValue: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}`, err);
    return defaultValue;
  }
}

// Helper to safely write files
function writeJSONFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}`, err);
  }
}

// API Routes
app.get("/api/leaderboard", (req, res) => {
  const data = readJSONFile(LEADERBOARD_FILE, DEFAULT_LEADERBOARD);
  res.json(data);
});

app.post("/api/leaderboard", (req, res) => {
  const { studentName, classLevel, subject, points, score, totalQuestions, accuracy, timeSpent } = req.body;
  if (!studentName) {
    return res.status(400).json({ error: "Student name is required." });
  }

  const list = readJSONFile(LEADERBOARD_FILE, DEFAULT_LEADERBOARD);
  const newEntry = {
    id: "lead-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    studentName,
    classLevel: Number(classLevel) || 1,
    subject: subject || "gk",
    points: Number(points) || 0,
    score: Number(score) || 0,
    totalQuestions: Number(totalQuestions) || 10,
    accuracy: Number(accuracy) || 0,
    timeSpent: Number(timeSpent) || 0,
    date: new Date().toISOString().split("T")[0]
  };

  list.push(newEntry);
  // Sort descending by points, then accuracy, then ascending timeSpent
  list.sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.timeSpent - b.timeSpent;
  });

  writeJSONFile(LEADERBOARD_FILE, list);
  res.status(201).json(newEntry);
});

app.get("/api/reports", (req, res) => {
  const data = readJSONFile(REPORTS_FILE, DEFAULT_REPORTS);
  res.json(data);
});

app.post("/api/reports", (req, res) => {
  const report = req.body;
  if (!report.studentName) {
    return res.status(400).json({ error: "Student Name is required" });
  }

  const reports = readJSONFile(REPORTS_FILE, DEFAULT_REPORTS);
  const newReport = {
    ...report,
    id: "rep-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    date: new Date().toISOString().split("T")[0]
  };

  reports.unshift(newReport); // newest first
  writeJSONFile(REPORTS_FILE, reports);
  res.status(201).json(newReport);
});

app.post("/api/reports/clear", (req, res) => {
  writeJSONFile(REPORTS_FILE, []);
  writeJSONFile(LEADERBOARD_FILE, []);
  res.json({ success: true, message: "All local trial reports and leaderboard scores have been successfully cleared!" });
});


// Fallback high-quality static templates for when Gemini is offline / key missing
const STATIC_FALLBACK_QUESTIONS: { [key: string]: any[] } = {
  gk: [
    { id: "gk-1", question: "Which animal is called the 'Ship of the Desert'?", options: ["Horse", "Camel", "Elephant", "Lion"], correctAnswer: "Camel", explanation: "Camels are known as the ship of the desert because they can carry heavy loads across sandy deserts with no water for days.", difficulty: "easy", level: 1 },
    { id: "gk-2", question: "How many primary colors are there?", options: ["Three (Red, Yellow, Blue)", "Four (Green, Blue, Yellow, Orange)", "Five", "Two"], correctAnswer: "Three (Red, Yellow, Blue)", explanation: "The primary colors are Red, Yellow, and Blue. They cannot be created by mixing other colors.", difficulty: "easy", level: 2 },
    { id: "gk-3", question: "Which is the tallest animal in the world?", options: ["Elephant", "Giraffe", "Ostrich", "Blue Whale"], correctAnswer: "Giraffe", explanation: "The giraffe is the tallest living terrestrial animal, reaching heights up to 19 feet.", difficulty: "easy", level: 3 },
    { id: "gk-4", question: "Which is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correctAnswer: "Pacific Ocean", explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions.", difficulty: "medium", level: 4 },
    { id: "gk-5", question: "Who was the first person to walk on the moon?", options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "Elon Musk"], correctAnswer: "Neil Armstrong", explanation: "Neil Armstrong landed on the moon on July 20, 1969, immortalizing his words: 'That's one small step for man, one giant leap for mankind.'", difficulty: "medium", level: 5 },
    { id: "gk-6", question: "How many bones does an adult human body have?", options: ["206", "300", "150", "208"], correctAnswer: "206", explanation: "An adult human has 206 bones, while infants are born with around 270 bones which fuse together over time.", difficulty: "medium", level: 6 },
    { id: "gk-7", question: "Which is the largest democracy in the world?", options: ["United States", "India", "China", "United Kingdom"], correctAnswer: "India", explanation: "India has the largest voter base globally, making it the largest representative democracy.", difficulty: "medium", level: 7 },
    { id: "gk-8", question: "What is the capital of Japan?", options: ["Kyoto", "Hiroshima", "Tokyo", "Osaka"], correctAnswer: "Tokyo", explanation: "Tokyo is the official administrative capital and most populous city region in Japan.", difficulty: "hard", level: 8 },
    { id: "gk-9", question: "Which of the following is the highest altitude plateau in the world?", options: ["Colorado Plateau", "Tibetan Plateau", "Deccan Plateau", "Anatolian Plateau"], correctAnswer: "Tibetan Plateau", explanation: "The Tibetan Plateau is often called the 'Roof of the World' and stretches nearly 2.5 million square kilometers.", difficulty: "hard", level: 9 },
    { id: "gk-10", question: "Which treaty officially ended World War I?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Utrecht", "Treaty of Geneva"], correctAnswer: "Treaty of Versailles", explanation: "The Treaty of Versailles, signed in June 1919, officially concluded the state of war between Germany and the Allied Powers.", difficulty: "expert", level: 10 }
  ],
  science: [
    { id: "sci-1", question: "What part of the plant conducts photosynthesis?", options: ["Root", "Stem", "Leaf", "Flower"], correctAnswer: "Leaf", explanation: "Leaves contain chlorophyll, which absorbs sunlight to convert carbon dioxide and water into food during photosynthesis.", difficulty: "easy", level: 1 },
    { id: "sci-2", question: "What gas do humans need to breathe to stay alive?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"], correctAnswer: "Oxygen", explanation: "Our cells require oxygen to generate energy (ATP) through respiration.", difficulty: "easy", level: 2 },
    { id: "sci-3", question: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctAnswer: "Mars", explanation: "Mars is reddish due to the high presence of iron oxide (rust) on its surface.", difficulty: "easy", level: 3 },
    { id: "sci-4", question: "What is the chemical formula for water?", options: ["CO2", "NaCl", "H2O", "O2"], correctAnswer: "H2O", explanation: "Each water molecule is composed of two hydrogen atoms covalently bonded to one oxygen atom.", difficulty: "medium", level: 4 },
    { id: "sci-5", question: "What force pulls objects toward the center of the Earth?", options: ["Magnetism", "Friction", "Gravity", "Electricity"], correctAnswer: "Gravity", explanation: "Gravity is the invisible force of attraction between masses, pulling things back to Earth's center.", difficulty: "medium", level: 5 },
    { id: "sci-6", question: "Which instrument is used to measure body temperature?", options: ["Barometer", "Thermometer", "Speedometer", "Seismograph"], correctAnswer: "Thermometer", explanation: "Thermometers use heat expansion (traditionally mercury or modern digital sensors) to read temperatures.", difficulty: "medium", level: 6 },
    { id: "sci-7", question: "What is the closest star to Earth?", options: ["Sirius", "The Sun", "Proxima Centauri", "Polaris"], correctAnswer: "The Sun", explanation: "The Sun is our closest stellar neighbor, located about 93 million miles away.", difficulty: "medium", level: 7 },
    { id: "sci-8", question: "What is the power house of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correctAnswer: "Mitochondria", explanation: "Mitochondria create oxygen-derived chemical power (ATP) for cellular processes, acting as metabolic batteries.", difficulty: "hard", level: 8 },
    { id: "sci-9", question: "Which of these is the lightest chemical element on the periodic table?", options: ["Oxygen", "Helium", "Hydrogen", "Lithium"], correctAnswer: "Hydrogen", explanation: "Hydrogen has an atomic number of 1 and is the lightest, most abundant standard element in the universe.", difficulty: "hard", level: 9 },
    { id: "sci-10", question: "What is the speed of light in a vacuum approximately?", options: ["3,000 km/s", "300,000 km/s", "150,000 km/s", "1,000 km/s"], correctAnswer: "300,000 km/s", explanation: "Light travels at approximately 299,792 kilometers per second (186,000 miles/sec) in cosmic vacuums.", difficulty: "expert", level: 10 }
  ],
  history: [
    { id: "hist-1", question: "Who was known as the 'Father of the Indian Nation'?", options: ["Subhas Chandra Bose", "Mahatma Gandhi", "Jawaharlal Nehru", "Bhagat Singh"], correctAnswer: "Mahatma Gandhi", explanation: "Mahatma Gandhi is globally revered as the guide of non-violent resistance that secured India's freedom.", difficulty: "easy", level: 1 },
    { id: "hist-2", question: "Which monument was built by Emperor Shah Jahan in memory of his wife?", options: ["Qutub Minar", "Red Fort", "Taj Mahal", "India Gate"], correctAnswer: "Taj Mahal", explanation: "Taj Mahal is a white marble mausoleum located in Agra, built in memoriam of Mumtaz Mahal.", difficulty: "easy", level: 2 },
    { id: "hist-3", question: "In which year did India gain independence from British rule?", options: ["1942", "1947", "1950", "1935"], correctAnswer: "1947", explanation: "India declared freedom and sovereignty on August 15, 1947.", difficulty: "easy", level: 3 },
    { id: "hist-4", question: "Which ancient civilization built the Great Pyramids?", options: ["The Romans", "The Greeks", "The Egyptians", "The Harappans"], correctAnswer: "The Egyptians", explanation: "The ancient Egyptians built Pyramids as monumental tombs for their kings (Pharaohs).", difficulty: "medium", level: 4 },
    { id: "hist-5", question: "Who was the first Prime Minister of independent India?", options: ["Lal Bahadur Shastri", "Jawaharlal Nehru", "Indira Gandhi", "Sardar Patel"], correctAnswer: "Jawaharlal Nehru", explanation: "Pandit Jawaharlal Nehru took office on August 15, 1947, and delivered the 'Tryst with Destiny' speech.", difficulty: "medium", level: 5 },
    { id: "hist-6", question: "Which country gifted the Statue of Liberty to the United States?", options: ["Great Britain", "France", "Germany", "Italy"], correctAnswer: "France", explanation: "France gifted the statue to celebrate the US centennial alliance and shared love of liberty in 1886.", difficulty: "medium", level: 6 },
    { id: "hist-7", question: "Who was the legendary ruler of the Macedonian Empire who conquered Persia?", options: ["Julius Caesar", "Alexander the Great", "Genghis Khan", "Napoleon Bonaparte"], correctAnswer: "Alexander the Great", explanation: "Alexander III of Macedon conquered the Persian Achaemenid Empire and marched as far as the Punjab river systems.", difficulty: "medium", level: 7 },
    { id: "hist-8", question: "Which Mauryan Emperor renounced violence and converted to Buddhism after the bloody Battle of Kalinga?", options: ["Chandragupta Maurya", "Samudragupta", "Emperor Ashoka", "Harsha Vardhana"], correctAnswer: "Emperor Ashoka", explanation: "Ashoka the Great converted to Buddhism after reflecting on the massive loss of life at the Kalinga war around 261 BCE.", difficulty: "hard", level: 8 },
    { id: "hist-9", question: "Who invented the first successful printing press in the 15th century?", options: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileo Galilei"], correctAnswer: "Johannes Gutenberg", explanation: "Johannes Gutenberg introduced movable type printing to Europe around 1440, revolutionizing human literacy.", difficulty: "hard", level: 9 },
    { id: "hist-10", question: "In which year did the French Revolution begin?", options: ["1789", "1799", "1804", "1776"], correctAnswer: "1789", explanation: "The French Revolution began in 1789 with the storming of the Bastille on July 14, seeking to overturn absolutist feudalism.", difficulty: "expert", level: 10 }
  ]
};

const STATIC_FALLBACK_QUESTIONS_HI: { [key: string]: any[] } = {
  gk: [
    { id: "gk-1-hi", question: "किस जानवर को 'रेगिस्तान का जहाज' कहा जाता है?", options: ["घोड़ा", "ऊंट", "हाथी", "शेर"], correctAnswer: "ऊंट", explanation: "ऊंट को रेगिस्तान का जहाज कहा जाता है क्योंकि वे बिना पानी के कई दिनों तक रेत पर चल सकते हैं।", difficulty: "easy", level: 1 },
    { id: "gk-2-hi", question: "मूल प्राथमिक रंग कितने होते हैं?", options: ["तीन (लाल, पीला, नीला)", "चार", "पांच", "दो"], correctAnswer: "तीन (लाल, पीला, नीला)", explanation: "मुख्य प्राथमिक रंग लाल, पीला और नीला हैं। इन्हें मिलाए बिना कोई अन्य रंग नहीं बन सकता।", difficulty: "easy", level: 2 },
    { id: "gk-3-hi", question: "विश्व का सबसे ऊँचा जानवर कौन सा है?", options: ["हाथी", "जिराफ़", "शुतुरमुर्ग", "ब्लू व्हेल"], correctAnswer: "जिराफ़", explanation: "जिराफ़ दुनिया का सबसे ऊँचा भूमि पर रहने वाला जीव है, जो 19 फीट की ऊँचाई तक पहुँच सकता है।", difficulty: "easy", level: 3 },
    { id: "gk-4-hi", question: "पृथ्वी पर सबसे बड़ा महासागर कौन सा है?", options: ["अटलांटिक महासागर", "हिंद महासागर", "आर्कटिक महासागर", "प्रशांत महासागर"], correctAnswer: "प्रशांत महासागर", explanation: "प्रशांत महासागर पृथ्वी का सबसे बड़ा और गहरा महासागर है।", difficulty: "medium", level: 4 },
    { id: "gk-5-hi", question: "चाँद पर कदम रखने वाले पहले व्यक्ति कौन थे?", options: ["यूरी गागरिन", "बज़ एल्ड्रिन", "नील आर्मस्ट्रांग", "एलोन मस्क"], correctAnswer: "नील आर्मस्ट्रांग", explanation: "नील आर्मस्ट्रांग ने 20 जुलाई 1969 को चाँद पर कदम रखकर इतिहास रचा था।", difficulty: "medium", level: 5 },
    { id: "gk-6-hi", question: "वयस्क मानव शरीर में कुल कितनी हड्डियाँ होती हैं?", options: ["206", "300", "150", "208"], correctAnswer: "206", explanation: "एक वयस्क मानव में 206 हड्डियाँ होती हैं, जबकि नवजात शिशु लगभग 270 हड्डियों के साथ पैदा होते हैं।", difficulty: "medium", level: 6 },
    { id: "gk-7-hi", question: "विश्व का सबसे बड़ा लोकतंत्र कौन सा देश है?", options: ["अमेरिका", "भारत", "चीन", "ब्रिटेन"], correctAnswer: "भारत", explanation: "भारत विश्व का सबसे बड़ा प्रतिनिधि लोकतंत्र है जहाँ सबसे अधिक मतदाता हैं।", difficulty: "medium", level: 7 },
    { id: "gk-8-hi", question: "जापान की राजधानी क्या है?", options: ["क्योटो", "हिरोशिमा", "टोक्यो", "ओसाका"], correctAnswer: "टोक्यो", explanation: "टोक्यो जापान की आधिकारिक राजधानी और सबसे व्यस्त प्रशासनिक क्षेत्र है।", difficulty: "hard", level: 8 },
    { id: "gk-9-hi", question: "विश्व का सबसे ऊँचा पठार कौन सा है?", options: ["कोलोराडो पठार", "तिब्बत का पठार", "दक्कन का पठार", "अनातोलिया पठार"], correctAnswer: "तिब्बत का पठार", explanation: "तिब्बत के पठार को अक्सर 'दुनिया की छत' कहा जाता है जो लगभग 2.5 मिलियन वर्ग किलोमीटर में फैला है।", difficulty: "hard", level: 9 },
    { id: "gk-10-hi", question: "प्रथम विश्व युद्ध को आधिकारिक रूप से समाप्त करने वाली संधि कौन सी थी?", options: ["पेरिस की संधि", "वर्साय की संधि", "यूट्रेक्ट की संधि", "जिनेवा संधि"], correctAnswer: "वर्साय की संधि", explanation: "जून 1919 में हस्ताक्षरित वर्साय की संधि ने जर्मनी और मित्र देशों के बीच युद्ध को समाप्त किया।", difficulty: "expert", level: 10 }
  ],
  science: [
    { id: "sci-1-hi", question: "पौधे का कौन सा भाग प्रकाश संश्लेषण (Photosynthesis) करता है?", options: ["जड़", "तना", "पत्ती", "फूल"], correctAnswer: "पत्ती", explanation: "पत्तियों में क्लोरोफिल होता है, जो सूर्य के प्रकाश को अवशोषित करके भोजन बनाता है।", difficulty: "easy", level: 1 },
    { id: "sci-2-hi", question: "मनुष्यों को जीवित रहने के लिए किस गैस को सांस के रूप में लेना आवश्यक है?", options: ["कार्बन डाइऑक्साइड", "नाइट्रोजन", "ऑक्सीजन", "हाइड्रोजन"], correctAnswer: "ऑक्सीजन", explanation: "हमारी कोशिकाओं को श्वसन के माध्यम से ऊर्जा उत्पन्न करने के लिए ऑक्सीजन की आवश्यकता होती है।", difficulty: "easy", level: 2 },
    { id: "sci-3-hi", question: "किस ग्रह को 'लाल ग्रह' (Red Planet) कहा जाता है?", options: ["शुक्र", "बृहस्पति", "मंगल", "शनि"], correctAnswer: "मंगल", explanation: "मंगल ग्रह की सतह पर अत्यधिक आयरन ऑक्साइड (जंग) की उपस्थिति के कारण यह लाल दिखाई देता है।", difficulty: "easy", level: 3 },
    { id: "sci-4-hi", question: "जल का रासायनिक सूत्र क्या है?", options: ["CO2", "NaCl", "H2O", "O2"], correctAnswer: "H2O", explanation: "प्रत्येक जल अणु दो हाइड्रोजन परमाणुओं और एक ऑक्सीजन परमाणु से मिलकर रासायनिक बंध बनाता है।", difficulty: "medium", level: 4 },
    { id: "sci-5-hi", question: "चिकनगुनिया रोग किस रोगाणु के कारण होता है?", options: ["जीवाणु", "विषाणु (वायरस)", "कवक", "प्रोटोजोआ"], correctAnswer: "विषाणु (वायरस)", explanation: "चिकनगुनिया एक वायरल बीमारी है जो संक्रमित एडिस मच्छरों के काटने से मनुष्यों में फैलती है।", difficulty: "medium", level: 5 },
    { id: "sci-6-hi", question: "मानव शरीर की सबसे बड़ी ग्रंथि कौन सी है?", options: ["अग्नाशय", "थायरॉयड", "यकृत (लीवर)", "पीयूष ग्रंथि"], correctAnswer: "यकृत (लीवर)", explanation: "यकृत मानव शरीर की सबसे बड़ी आंतरिक ग्रंथि है जो पित्त का स्राव करती है और विषैले पदार्थों को बाहर निकालती है।", difficulty: "medium", level: 6 },
    { id: "sci-7-hi", question: "ध्वनि की गति किस माध्यम में सबसे अधिक होती है?", options: ["हवा", "पानी", "लोहा (ठोस)", "निर्वात"], correctAnswer: "लोहा (ठोस)", explanation: "ठोस पदार्थों में कण अत्यधिक संकुचित होते हैं, जिसके कारण ध्वनि की तरंगें वायु या द्रव की तुलना में बहुत तेज गति करती हैं।", difficulty: "medium", level: 7 },
    { id: "sci-8-hi", question: "कोशिका का ऊर्जा गृह (Powerhouse of the Cell) किसे कहा जाता है?", options: ["केंद्रक", "राइबोसोम", "माइटोकॉन्ड्रिया", "गॉल्जीकाय"], correctAnswer: "माइटोकॉन्ड्रिया", explanation: "माइटोकॉन्ड्रिया कोशिकीय श्वसन द्वारा ऊर्जा (ATP) उत्पन्न करता है और एटीपी संचय गृह के रूप में कार्य करता है।", difficulty: "hard", level: 8 },
    { id: "sci-9-hi", question: "आवर्त सारणी (Periodic Table) पर सबसे हल्का रासायनिक तत्व कौन सा है?", options: ["ऑक्सीजन", "हीलियम", "हाइड्रोजन", "लिथियम"], correctAnswer: "हाइड्रोजन", explanation: "हाइड्रोजन की परमाणु संख्या 1 है और यह ब्रह्मांड का सबसे हल्का और सबसे प्रचुर मात्रा में मिलने वाला तत्व है।", difficulty: "hard", level: 9 },
    { id: "sci-10-hi", question: "निर्वात में प्रकाश की गति लगभग कितनी होती है?", options: ["3,000 किमी/सेकंड", "3,00000 किमी/सेकंड", "1,50,000 किमी/सेकंड", "1,000 किमी/सेकंड"], correctAnswer: "3,00000 किमी/सेकंड", explanation: "प्रकाश निर्वात में ठीक 2,99,792 किलोमीटर प्रति सेकंड (लगभग 3 लाख किमी/सेकंड) की असाधारण गति से यात्रा करता है।", difficulty: "expert", level: 10 }
  ],
  history: [
    { id: "hist-1-hi", question: "किसे 'भारतीय राष्ट्र का पिता' (राष्ट्रपिता) कहा जाता है?", options: ["सुभाष चंद्र बोस", "महात्मा गांधी", "जवाहरलाल नेहरू", "भगत सिंह"], correctAnswer: "महात्मा गांधी", explanation: "महात्मा गांधी को अहिंसक स्वतंत्रता आंदोलन का नेतृत्व करने के लिए आदरपूर्वक 'राष्ट्रपिता' का दर्जा दिया गया है।", difficulty: "easy", level: 1 },
    { id: "hist-2-hi", question: "मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज की याद में कौन सा स्मारक बनवाया था?", options: ["कुतुब मीनार", "लाल किला", "ताजमहल", "इंडिया गेट"], correctAnswer: "ताजमहल", explanation: "ताजमहल आगरा में स्थित सफेद संगमरमर का एक मकबरा है, जिसे उत्कृष्ट वास्तुकला विरासत माना जाता है।", difficulty: "easy", level: 2 },
    { id: "hist-3-hi", question: "भारत को ब्रिटिश हुकूमत से किस वर्ष में स्वतंत्रता मिली?", options: ["1942", "1947", "1950", "1935"], correctAnswer: "1947", explanation: "भारत ने 15 अगस्त 1947 को ब्रिटिश औपनिवेशिक शासन से पूर्ण स्वतंत्रता और संप्रभुता हासिल की।", difficulty: "easy", level: 3 },
    { id: "hist-4-hi", question: "ग्रेट पिरामिड किस प्राचीन सभ्यता ने बनवाए थे?", options: ["रोमन सभ्यता", "यूनानी सभ्यता", "मिस्र सभ्यता", "हड़प्पा सभ्यता"], correctAnswer: "मिस्र सभ्यता", explanation: "प्राचीन मिस्र के शासकों (फिरौन) ने अपने मकबरों के रूप में पत्थरों के विशाल पिरामिड बनवाए थे।", difficulty: "medium", level: 4 }
  ]
};

// POST route to generate a dynamic quiz
app.post("/api/quiz/generate", async (req, res) => {
  const { classLevel, subject, baselineDifficulty, language } = req.body;
  const grade = Number(classLevel) || 1;
  const sub = subject || "gk";
  const baselineDiff = baselineDifficulty || "medium";
  const lang = language === "hi" ? "hi" : "en";
  const cacheKey = `${sub}_${grade}_${baselineDiff}_${lang}`;

  console.log(`Generating quiz for Grade ${grade}, Subject: ${sub}, Baseline Difficulty: ${baselineDiff}, Language: ${lang}...`);

  // Try loading from persistent disk cache first for zero-latency instantly appearing questions
  try {
    const cacheData = readJSONFile(QUIZ_CACHE_FILE, {});
    const cachedLists = cacheData[cacheKey] || [];
    if (cachedLists.length > 0) {
      // Pick a random quiz from the cached variation lists for variety
      const randomIndex = Math.floor(Math.random() * cachedLists.length);
      const selectedQuiz = cachedLists[randomIndex];
      
      // Assign fresh random IDs for proper React key rendering without collisions
      const customQuestions = selectedQuiz.map((q: any, index: number) => ({
        ...q,
        id: `cached-${sub}-${grade}-${index + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }));
      
      console.log(`[QUIZ CACHE HIT] Instantly returning cached quiz variety for key: ${cacheKey} (variation ${randomIndex})`);
      return res.json({ questions: customQuestions });
    }
  } catch (cacheErr) {
    console.error("Cache read failed, continuing with direct generation:", cacheErr);
  }

  if (!ai) {
    // If Gemini key is missing, fall back to high-quality static template with adjusted details
    console.log("Using cached fallback questions template...");
    // Let's vary static fallback questions dynamically based on easy/medium/hard to support offline testing
    const fallbackTemplate = lang === "hi" ? STATIC_FALLBACK_QUESTIONS_HI : STATIC_FALLBACK_QUESTIONS;
    let baseQuestions = fallbackTemplate[sub] || fallbackTemplate.gk;
    
    // Customize phrasing or adjust the display to reflect easy/medium/hard
    const customQuestions = baseQuestions.map((q, index) => {
      let qText = q.question;
      if (baselineDiff === "easy") {
        qText = lang === "hi" ? `(आसान बेसलाइन) ${qText}` : `(Easy Baseline) ${qText}`;
      } else if (baselineDiff === "hard") {
        qText = lang === "hi" ? `(कठिन बेसलाइन / उन्नत) ${qText}` : `(Hard Baseline/Advanced) ${qText}`;
      }
      return {
        ...q,
        question: qText,
        id: `${sub}-${grade}-${q.level}-${Date.now()}`
      };
    });
    return res.json({ questions: customQuestions });
  }

  try {
    let languageGuideline = "The language of the entire output (question, options, correctAnswer, and explanation) MUST be in English.";
    if (lang === "hi") {
      languageGuideline = `CRITICAL: The entire generated quiz MUST be strictly in HINDI using Devanagari script.
- The "question" must be written in Hindi.
- All 4 strings inside the "options" array MUST be in Hindi.
- The "correctAnswer" MUST completely and exactly match one of the 4 options written in Hindi in the options array.
- The "explanation" must be written in clear, educational, child-friendly Hindi.`;
    }

    let curriculumSeriousnessCode = "";
    if (grade === 11 || grade === 12) {
      curriculumSeriousnessCode = `CRITICAL: The Class grade level is ${grade} (High School Senior). These students are preparing for crucial competitive and academic board assessments (CBSE, ICSE, JEE, NEET, or IB). 
- Do NOT generate trivial, simplistic, or child-like questions or games elements.
- The questions for Physics, Chemistry, Biology, and Mathematics must strictly match standard, high-level core academic school syllabus curricula.
- Physics questions must focus on authentic subjects: Mechanics, Thermodynamics, Electromagnetism, Modern Physics, Waves, Optics, Kinematics, etc.
- Chemistry questions must focus on core concepts: Organic reaction mechanisms, Chemical Kinetics, Coordination Compounds, Periodic laws, Atomic Structure, Equilibrium, etc.
- Biology questions must focus on core science: Cell Division, Human Physiology, Genetics, Biotechnology, Plant biology, Evolution, Ecology, etc.
- Mathematics questions must focus on genuine board mathematics: Calculus (Derivatives/Integrals/Limits), Differential equations, Vectors and 3D Geometry, Linear Programming, Complex Numbers, Probability, Matrices, etc.
- Ensure all other subjects (History, English, General Knowledge) also maintain rigorous academic decorum, utilizing genuine curriculums of standard education frameworks.`;
    } else {
      curriculumSeriousnessCode = `Maintain accurate and highly helpful curriculum-matched academic standards appropriate for Class ${grade}. The questions should combine the excitement of a KBC game show with standard educational benchmarks (no silly or non-educational content).`;
    }

    const prompt = `Generate exactly 10 multiple-choice questions for educational Class Level ${grade} to play a Kaun Banega Crorepati (KBC) style quiz on the subject of ${sub.toUpperCase()}.
The OVERALL BASELINE DIFFICULTY of this quiz session MUST be tuned to: ${baselineDiff.toUpperCase()}.
- If 'EASY' baseline: Questions must be on the simpler, highly foundational, and encouraging side for a Class ${grade} student.
- If 'MEDIUM' baseline: Questions must match standard curriculum-based expectations for Class ${grade}.
- If 'HARD' baseline: Questions must be noticeably challenging, analytical, deep, or advanced for Class ${grade}.

Regardless of the baseline, the questions MUST progress in difficulty sequentially:
- Questions 1 to 3 (Level 1-3): Easy difficulty (relative to the baseline) appropriate for a Class ${grade} student.
- Questions 4 to 7 (Level 4-7): Medium difficulty (relative to the baseline) for Class ${grade}.
- Questions 8 to 9 (Level 8-9): Hard difficulty (relative to the baseline) for Class ${grade}.
- Question 10 (Level 10): Expert/Challenging difficulty (The ultimate prize question relative to the baseline) for an advanced Class ${grade} student.

${languageGuideline}

${curriculumSeriousnessCode}

Each question object you generate MUST comply exactly with the following format and rules:
1. "question": string. Age-appropriate, engaging.
2. "options": array of exactly 4 strings. They must be completely distinct, brief, and plausible.
3. "correctAnswer": string. Must exactly match one of the 4 strings in the options array.
4. "explanation": string. A small 1-2 sentence kid-friendly educational paragraph explaining the answer.
5. "difficulty": "easy" (for levels 1-3), "medium" (for levels 4-7), "hard" (for levels 8-9), "expert" (for level 10).
6. "level": integer representing the escalation ladder, starting from 1 up to 10 consecutively.

Return a JSON array containing these 10 questions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["questions"],
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "List of 10 sequential KBC educational quiz questions",
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "correctAnswer", "explanation", "difficulty", "level"],
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 multiple choice options"
                  },
                  correctAnswer: { type: Type.STRING, description: "Must EXACTLY match one of the elements in options" },
                  explanation: { type: Type.STRING, description: "Educational explanation of the correct answer" },
                  difficulty: { type: Type.STRING },
                  level: { type: Type.INTEGER }
                }
              }
            }
          }
        },
        temperature: 0.8,
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length === 10) {
      // Add ids and double check correct mapping
      const mappedQuestions = parsed.questions.map((q: any, index: number) => {
        // Double check options and correctAnswer synchronization
        let options = q.options || [];
        if (options.length < 4) {
          options = [...options, "Option A", "Option B", "Option C", "Option D"].slice(0, 4);
        }
        let correct = q.correctAnswer;
        if (!options.includes(correct)) {
          options[0] = correct; // force match
        }
        return {
          id: `ai-${sub}-${grade}-${index + 1}-${Date.now()}`,
          question: q.question,
          options: options,
          correctAnswer: correct,
          explanation: q.explanation || "Correct answer explanation placeholder",
          difficulty: q.difficulty || (index < 3 ? "easy" : index < 7 ? "medium" : index < 9 ? "hard" : "expert"),
          level: index + 1
        };
      });

      // Save successful generation into local persistent cache for future instant loadings
      try {
        const cacheData = readJSONFile(QUIZ_CACHE_FILE, {});
        if (!cacheData[cacheKey]) {
          cacheData[cacheKey] = [];
        }
        
        // Strip dynamic IDs from cached structure
        const quizToStore = mappedQuestions.map((q: any) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          level: q.level
        }));
        
        cacheData[cacheKey].push(quizToStore);
        writeJSONFile(QUIZ_CACHE_FILE, cacheData);
        console.log(`[QUIZ CACHE SAVE] Successfully stored newly generated quiz under key: ${cacheKey}`);
      } catch (saveCacheErr) {
        console.error("Failed to write to quiz cache:", saveCacheErr);
      }

      return res.json({ questions: mappedQuestions });
    } else {
      throw new Error("Slight model format mismatch, falling back to static questions");
    }

  } catch (error) {
    console.error("Gemini failed to generate quiz questions, falling back:", error);
    const fallbackTemplate = lang === "hi" ? STATIC_FALLBACK_QUESTIONS_HI : STATIC_FALLBACK_QUESTIONS;
    const baseQuestions = fallbackTemplate[sub] || fallbackTemplate.gk;
    const customQuestions = baseQuestions.map(q => ({
      ...q,
      id: `${sub}-${grade}-${q.level}-${Date.now()}`
    }));
    return res.json({ questions: customQuestions });
  }
});

// POST route to get personalized teacher report card feedback from Gemini
app.post("/api/reports/feedback", async (req, res) => {
  const { studentName, classLevel, subject, correctCount, totalQuestions, pointsWon, results, language } = req.body;
  const lang = language === "hi" ? "hi" : "en";
  
  if (!ai) {
    const defaultFeedbackMark = lang === "hi" 
      ? `शानदार प्रयास, ${studentName}! आपने Class ${classLevel} के ${subject} विषय में ${correctCount}/${totalQuestions} सही उत्तर दिए। सीखने और आगे बढ़ते रहने का आपका जुनून बेहद प्रेरणादायक है!`
      : `Excellent effort, ${studentName}! You answered ${correctCount}/${totalQuestions} correctly in ${subject}. Keep studying and attempting quizzes to climb higher on the leaderboards!`;
    return res.json({ feedback: defaultFeedbackMark });
  }

  try {
    const qaSummaries = (results || []).slice(0, 4).map((r: any) => 
      `Q: "${r.question}" | Ans: "${r.userAnswer}" | Status: ${r.isCorrect ? "CORRECT" : "WRONG"}`
    ).join("\n");

    let languageGuideline = "Write the feedback in English.";
    if (lang === "hi") {
      languageGuideline = "Write the feedback strictly in HINDI using Devanagari script. Establish a warm, highly encouraging, and supportive Indian school teacher persona.";
    }

    const prompt = `Write a short, highly personalized, and encouraging Teacher Remark for an academic report card.
Student Name: ${studentName}
Class Grade: Class ${classLevel}
Subject: ${subject}
Quiz Performance: Scored ${correctCount} out of ${totalQuestions} and won ${pointsWon.toLocaleString()} points.
Sample of answers played:\n${qaSummaries}

Write in the tone of a passionate, inspiring, supportive expert teacher. It must be exactly 2 to 3 sentences long.
- Address the student by name.
- Highlight something positive they did.
- Provide one actionable and fun study tip related to their grade and subject to help them grow.
- Do NOT use brackets or placeholders in the response. Give the straight final text.
- ${languageGuideline}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    const val = response.text ? response.text.trim() : "";
    let fallbackText = lang === "hi" 
      ? `शाबाश ${studentName}! आपने Class ${classLevel} ${subject} प्रश्नोत्तरी में उत्कृष्ट प्रदर्शन किया। कठिन अध्यायों का अभ्यास जारी रखें और सफलता की ऊंचाइयों को छुएं!`
      : `Well played ${studentName}! Excellent work tackling the ${subject} quiz. Keep practicing!`;
    res.json({ feedback: val || fallbackText });
  } catch (error) {
    console.error("Error generating report feedback:", error);
    let fallbackText = lang === "hi" 
      ? `अद्भुत प्रदर्शन ${studentName}! आपने Class ${classLevel} ${subject} परीक्षा में अविश्वसनीय कार्य किया। कठिन प्रश्नों को हल करने का अभ्यास करें और आगे बढ़ें!`
      : `Incredible work ${studentName}! You did a magnificent job in class ${classLevel} ${subject}. Focus on clarifying tough questions and strive for the maximum safe haven points next time!`;
    res.json({ feedback: fallbackText });
  }
});


// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Hot Seat Quiz server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
