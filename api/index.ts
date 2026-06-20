import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'kbc-quiz-app',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. AI quiz generation will fall back to static templates.");
}

// Rich static fallback questions for when Gemini is offline / key missing
const STATIC_FALLBACK_QUESTIONS: { [key: string]: any[] } = {
  gk: [
    { id: "gk-1", question: "Which animal is called the 'Ship of the Desert'?", options: ["Horse", "Camel", "Elephant", "Lion"], correctAnswer: "Camel", explanation: "Camels are known as the ship of the desert because they can carry heavy loads across sandy deserts with no water for days.", difficulty: "easy", level: 1 },
    { id: "gk-2", question: "How many primary colors are there?", options: ["Three (Red, Yellow, Blue)", "Four (Green, Blue, Yellow, Orange)", "Five", "Two"], correctAnswer: "Three (Red, Yellow, Blue)", explanation: "The primary colors are Red, Yellow, and Blue. They cannot be created by mixing other colors.", difficulty: "easy", level: 2 },
    { id: "gk-3", question: "Which is the tallest animal in the world?", options: ["Elephant", "Giraffe", "Ostrich", "Blue Whale"], correctAnswer: "Giraffe", explanation: "The giraffe is the tallest living terrestrial animal, reaching heights up to 19 feet.", difficulty: "easy", level: 3 },
    { id: "gk-4", question: "Which is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correctAnswer: "Pacific Ocean", explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions.", difficulty: "medium", level: 4 },
    { id: "gk-5", question: "Who was the first person to walk on the moon?", options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "Elon Musk"], correctAnswer: "Neil Armstrong", explanation: "Neil Armstrong landed on the moon on July 20, 1969.", difficulty: "medium", level: 5 },
    { id: "gk-6", question: "How many bones does an adult human body have?", options: ["206", "300", "150", "208"], correctAnswer: "206", explanation: "An adult human has 206 bones.", difficulty: "medium", level: 6 },
    { id: "gk-7", question: "Which is the largest democracy in the world?", options: ["United States", "India", "China", "United Kingdom"], correctAnswer: "India", explanation: "India has the largest voter base globally.", difficulty: "medium", level: 7 },
    { id: "gk-8", question: "What is the capital of Japan?", options: ["Kyoto", "Hiroshima", "Tokyo", "Osaka"], correctAnswer: "Tokyo", explanation: "Tokyo is the official administrative capital of Japan.", difficulty: "hard", level: 8 },
    { id: "gk-9", question: "Which is the highest altitude plateau in the world?", options: ["Colorado Plateau", "Tibetan Plateau", "Deccan Plateau", "Anatolian Plateau"], correctAnswer: "Tibetan Plateau", explanation: "The Tibetan Plateau is often called the 'Roof of the World'.", difficulty: "hard", level: 9 },
    { id: "gk-10", question: "Which treaty officially ended World War I?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Utrecht", "Treaty of Geneva"], correctAnswer: "Treaty of Versailles", explanation: "The Treaty of Versailles was signed in June 1919.", difficulty: "expert", level: 10 }
  ],
  science: [
    { id: "sci-1", question: "What part of the plant conducts photosynthesis?", options: ["Root", "Stem", "Leaf", "Flower"], correctAnswer: "Leaf", explanation: "Leaves contain chlorophyll for photosynthesis.", difficulty: "easy", level: 1 },
    { id: "sci-2", question: "What gas do humans need to breathe to stay alive?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"], correctAnswer: "Oxygen", explanation: "Our cells require oxygen to generate energy.", difficulty: "easy", level: 2 },
    { id: "sci-3", question: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctAnswer: "Mars", explanation: "Mars is reddish due to iron oxide on its surface.", difficulty: "easy", level: 3 },
    { id: "sci-4", question: "What is the chemical formula for water?", options: ["CO2", "NaCl", "H2O", "O2"], correctAnswer: "H2O", explanation: "Water is composed of two hydrogen atoms and one oxygen atom.", difficulty: "medium", level: 4 },
    { id: "sci-5", question: "What force pulls objects toward the center of the Earth?", options: ["Magnetism", "Friction", "Gravity", "Electricity"], correctAnswer: "Gravity", explanation: "Gravity is the force of attraction between masses.", difficulty: "medium", level: 5 },
    { id: "sci-6", question: "Which instrument is used to measure body temperature?", options: ["Barometer", "Thermometer", "Speedometer", "Seismograph"], correctAnswer: "Thermometer", explanation: "Thermometers use heat expansion to read temperatures.", difficulty: "medium", level: 6 },
    { id: "sci-7", question: "What is the closest star to Earth?", options: ["Sirius", "The Sun", "Proxima Centauri", "Polaris"], correctAnswer: "The Sun", explanation: "The Sun is our closest star, about 93 million miles away.", difficulty: "medium", level: 7 },
    { id: "sci-8", question: "What is the power house of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correctAnswer: "Mitochondria", explanation: "Mitochondria produce ATP for cellular processes.", difficulty: "hard", level: 8 },
    { id: "sci-9", question: "Which is the lightest chemical element?", options: ["Oxygen", "Helium", "Hydrogen", "Lithium"], correctAnswer: "Hydrogen", explanation: "Hydrogen has atomic number 1 and is the lightest element.", difficulty: "hard", level: 9 },
    { id: "sci-10", question: "What is the speed of light in a vacuum approximately?", options: ["3,000 km/s", "300,000 km/s", "150,000 km/s", "1,000 km/s"], correctAnswer: "300,000 km/s", explanation: "Light travels at approximately 299,792 km/s.", difficulty: "expert", level: 10 }
  ],
  history: [
    { id: "hist-1", question: "Who was known as the 'Father of the Indian Nation'?", options: ["Subhas Chandra Bose", "Mahatma Gandhi", "Jawaharlal Nehru", "Bhagat Singh"], correctAnswer: "Mahatma Gandhi", explanation: "Gandhi led the non-violent independence movement.", difficulty: "easy", level: 1 },
    { id: "hist-2", question: "Which monument was built by Emperor Shah Jahan?", options: ["Qutub Minar", "Red Fort", "Taj Mahal", "India Gate"], correctAnswer: "Taj Mahal", explanation: "Taj Mahal was built in memory of Mumtaz Mahal.", difficulty: "easy", level: 2 },
    { id: "hist-3", question: "In which year did India gain independence?", options: ["1942", "1947", "1950", "1935"], correctAnswer: "1947", explanation: "India gained independence on August 15, 1947.", difficulty: "easy", level: 3 },
    { id: "hist-4", question: "Which civilization built the Great Pyramids?", options: ["The Romans", "The Greeks", "The Egyptians", "The Harappans"], correctAnswer: "The Egyptians", explanation: "Ancient Egyptians built pyramids as tombs for pharaohs.", difficulty: "medium", level: 4 },
    { id: "hist-5", question: "Who was the first Prime Minister of India?", options: ["Lal Bahadur Shastri", "Jawaharlal Nehru", "Indira Gandhi", "Sardar Patel"], correctAnswer: "Jawaharlal Nehru", explanation: "Nehru took office on August 15, 1947.", difficulty: "medium", level: 5 },
    { id: "hist-6", question: "Which country gifted the Statue of Liberty to the US?", options: ["Great Britain", "France", "Germany", "Italy"], correctAnswer: "France", explanation: "France gifted the statue in 1886.", difficulty: "medium", level: 6 },
    { id: "hist-7", question: "Who conquered the Persian Empire?", options: ["Julius Caesar", "Alexander the Great", "Genghis Khan", "Napoleon Bonaparte"], correctAnswer: "Alexander the Great", explanation: "Alexander III of Macedon conquered the Persian Empire.", difficulty: "medium", level: 7 },
    { id: "hist-8", question: "Which Emperor converted to Buddhism after the Battle of Kalinga?", options: ["Chandragupta Maurya", "Samudragupta", "Emperor Ashoka", "Harsha Vardhana"], correctAnswer: "Emperor Ashoka", explanation: "Ashoka converted to Buddhism after the Kalinga war around 261 BCE.", difficulty: "hard", level: 8 },
    { id: "hist-9", question: "Who invented the printing press?", options: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileo Galilei"], correctAnswer: "Johannes Gutenberg", explanation: "Gutenberg introduced movable type printing around 1440.", difficulty: "hard", level: 9 },
    { id: "hist-10", question: "In which year did the French Revolution begin?", options: ["1789", "1799", "1804", "1776"], correctAnswer: "1789", explanation: "The French Revolution began in 1789 with the storming of the Bastille.", difficulty: "expert", level: 10 }
  ]
};

const STATIC_FALLBACK_QUESTIONS_HI: { [key: string]: any[] } = {
  gk: [
    { id: "gk-1-hi", question: "किस जानवर को 'रेगिस्तान का जहाज' कहा जाता है?", options: ["घोड़ा", "ऊंट", "हाथी", "शेर"], correctAnswer: "ऊंट", explanation: "ऊंट को रेगिस्तान का जहाज कहा जाता है।", difficulty: "easy", level: 1 },
    { id: "gk-2-hi", question: "मूल प्राथमिक रंग कितने होते हैं?", options: ["तीन (लाल, पीला, नीला)", "चार", "पांच", "दो"], correctAnswer: "तीन (लाल, पीला, नीला)", explanation: "मुख्य प्राथमिक रंग लाल, पीला और नीला हैं।", difficulty: "easy", level: 2 },
    { id: "gk-3-hi", question: "विश्व का सबसे ऊँचा जानवर कौन सा है?", options: ["हाथी", "जिराफ़", "शुतुरमुर्ग", "ब्लू व्हेल"], correctAnswer: "जिराफ़", explanation: "जिराफ़ दुनिया का सबसे ऊँचा भूमि पर रहने वाला जीव है।", difficulty: "easy", level: 3 },
    { id: "gk-4-hi", question: "पृथ्वी पर सबसे बड़ा महासागर कौन सा है?", options: ["अटलांटिक महासागर", "हिंद महासागर", "आर्कटिक महासागर", "प्रशांत महासागर"], correctAnswer: "प्रशांत महासागर", explanation: "प्रशांत महासागर पृथ्वी का सबसे बड़ा महासागर है।", difficulty: "medium", level: 4 },
    { id: "gk-5-hi", question: "चाँद पर कदम रखने वाले पहले व्यक्ति कौन थे?", options: ["यूरी गागरिन", "बज़ एल्ड्रिन", "नील आर्मस्ट्रांग", "एलोन मस्क"], correctAnswer: "नील आर्मस्ट्रांग", explanation: "नील आर्मस्ट्रांग ने 20 जुलाई 1969 को चाँद पर कदम रखा।", difficulty: "medium", level: 5 },
    { id: "gk-6-hi", question: "वयस्क मानव शरीर में कुल कितनी हड्डियाँ होती हैं?", options: ["206", "300", "150", "208"], correctAnswer: "206", explanation: "एक वयस्क मानव में 206 हड्डियाँ होती हैं।", difficulty: "medium", level: 6 },
    { id: "gk-7-hi", question: "विश्व का सबसे बड़ा लोकतंत्र कौन सा देश है?", options: ["अमेरिका", "भारत", "चीन", "ब्रिटेन"], correctAnswer: "भारत", explanation: "भारत विश्व का सबसे बड़ा प्रतिनिधि लोकतंत्र है।", difficulty: "medium", level: 7 },
    { id: "gk-8-hi", question: "जापान की राजधानी क्या है?", options: ["क्योटो", "हिरोशिमा", "टोक्यो", "ओसाका"], correctAnswer: "टोक्यो", explanation: "टोक्यो जापान की आधिकारिक राजधानी है।", difficulty: "hard", level: 8 },
    { id: "gk-9-hi", question: "विश्व का सबसे ऊँचा पठार कौन सा है?", options: ["कोलोराडो पठार", "तिब्बत का पठार", "दक्कन का पठार", "अनातोलिया पठार"], correctAnswer: "तिब्बत का पठार", explanation: "तिब्बत के पठार को 'दुनिया की छत' कहा जाता है।", difficulty: "hard", level: 9 },
    { id: "gk-10-hi", question: "प्रथम विश्व युद्ध को समाप्त करने वाली संधि कौन सी थी?", options: ["पेरिस की संधि", "वर्साय की संधि", "यूट्रेक्ट की संधि", "जिनेवा संधि"], correctAnswer: "वर्साय की संधि", explanation: "वर्साय की संधि जून 1919 में हस्ताक्षरित हुई।", difficulty: "expert", level: 10 }
  ],
  science: [
    { id: "sci-1-hi", question: "पौधे का कौन सा भाग प्रकाश संश्लेषण करता है?", options: ["जड़", "तना", "पत्ती", "फूल"], correctAnswer: "पत्ती", explanation: "पत्तियों में क्लोरोफिल होता है।", difficulty: "easy", level: 1 },
    { id: "sci-2-hi", question: "मनुष्यों को जीवित रहने के लिए किस गैस की आवश्यकता है?", options: ["कार्बन डाइऑक्साइड", "नाइट्रोजन", "ऑक्सीजन", "हाइड्रोजन"], correctAnswer: "ऑक्सीजन", explanation: "कोशिकाओं को ऊर्जा उत्पन्न करने के लिए ऑक्सीजन चाहिए।", difficulty: "easy", level: 2 },
    { id: "sci-3-hi", question: "किस ग्रह को 'लाल ग्रह' कहा जाता है?", options: ["शुक्र", "बृहस्पति", "मंगल", "शनि"], correctAnswer: "मंगल", explanation: "मंगल ग्रह आयरन ऑक्साइड के कारण लाल दिखता है।", difficulty: "easy", level: 3 },
    { id: "sci-4-hi", question: "जल का रासायनिक सूत्र क्या है?", options: ["CO2", "NaCl", "H2O", "O2"], correctAnswer: "H2O", explanation: "जल दो हाइड्रोजन और एक ऑक्सीजन परमाणु से बना है।", difficulty: "medium", level: 4 },
    { id: "sci-5-hi", question: "पृथ्वी के केंद्र की ओर वस्तुओं को खींचने वाला बल क्या है?", options: ["चुंबकत्व", "घर्षण", "गुरुत्वाकर्षण", "विद्युत"], correctAnswer: "गुरुत्वाकर्षण", explanation: "गुरुत्वाकर्षण द्रव्यमान के बीच आकर्षण बल है।", difficulty: "medium", level: 5 },
    { id: "sci-6-hi", question: "शरीर का तापमान मापने वाला उपकरण कौन सा है?", options: ["बैरोमीटर", "थर्मामीटर", "स्पीडोमीटर", "सिस्मोग्राफ"], correctAnswer: "थर्मामीटर", explanation: "थर्मामीटर ताप मापने का उपकरण है।", difficulty: "medium", level: 6 },
    { id: "sci-7-hi", question: "पृथ्वी का सबसे निकट तारा कौन सा है?", options: ["सीरियस", "सूर्य", "प्रॉक्सिमा सेंचुरी", "ध्रुव तारा"], correctAnswer: "सूर्य", explanation: "सूर्य हमारा सबसे निकटतम तारा है।", difficulty: "medium", level: 7 },
    { id: "sci-8-hi", question: "कोशिका का ऊर्जा गृह किसे कहा जाता है?", options: ["केंद्रक", "राइबोसोम", "माइटोकॉन्ड्रिया", "गॉल्जीकाय"], correctAnswer: "माइटोकॉन्ड्रिया", explanation: "माइटोकॉन्ड्रिया ऊर्जा (ATP) उत्पन्न करता है।", difficulty: "hard", level: 8 },
    { id: "sci-9-hi", question: "आवर्त सारणी पर सबसे हल्का तत्व कौन सा है?", options: ["ऑक्सीजन", "हीलियम", "हाइड्रोजन", "लिथियम"], correctAnswer: "हाइड्रोजन", explanation: "हाइड्रोजन की परमाणु संख्या 1 है।", difficulty: "hard", level: 9 },
    { id: "sci-10-hi", question: "निर्वात में प्रकाश की गति लगभग कितनी होती है?", options: ["3,000 किमी/सेकंड", "3,00000 किमी/सेकंड", "1,50,000 किमी/सेकंड", "1,000 किमी/सेकंड"], correctAnswer: "3,00000 किमी/सेकंड", explanation: "प्रकाश लगभग 3 लाख किमी/सेकंड की गति से चलता है।", difficulty: "expert", level: 10 }
  ],
  history: [
    { id: "hist-1-hi", question: "किसे 'राष्ट्रपिता' कहा जाता है?", options: ["सुभाष चंद्र बोस", "महात्मा गांधी", "जवाहरलाल नेहरू", "भगत सिंह"], correctAnswer: "महात्मा गांधी", explanation: "महात्मा गांधी को राष्ट्रपिता का दर्जा दिया गया है।", difficulty: "easy", level: 1 },
    { id: "hist-2-hi", question: "शाहजहाँ ने अपनी पत्नी की याद में कौन सा स्मारक बनवाया?", options: ["कुतुब मीनार", "लाल किला", "ताजमहल", "इंडिया गेट"], correctAnswer: "ताजमहल", explanation: "ताजमहल आगरा में सफेद संगमरमर का मकबरा है।", difficulty: "easy", level: 2 },
    { id: "hist-3-hi", question: "भारत को स्वतंत्रता किस वर्ष मिली?", options: ["1942", "1947", "1950", "1935"], correctAnswer: "1947", explanation: "भारत ने 15 अगस्त 1947 को स्वतंत्रता प्राप्त की।", difficulty: "easy", level: 3 },
    { id: "hist-4-hi", question: "ग्रेट पिरामिड किस सभ्यता ने बनवाए?", options: ["रोमन सभ्यता", "यूनानी सभ्यता", "मिस्र सभ्यता", "हड़प्पा सभ्यता"], correctAnswer: "मिस्र सभ्यता", explanation: "प्राचीन मिस्र के शासकों ने पिरामिड बनवाए।", difficulty: "medium", level: 4 }
  ]
};

// POST route to generate a dynamic quiz
app.post("/api/quiz/generate", async (req, res) => {
  const { classLevel, subject, baselineDifficulty, language } = req.body;
  const grade = Number(classLevel) || 1;
  const sub = subject || "gk";
  const baselineDiff = baselineDifficulty || "medium";
  const lang = language === "hi" ? "hi" : "en";

  console.log(`Generating quiz for Grade ${grade}, Subject: ${sub}, Baseline Difficulty: ${baselineDiff}, Language: ${lang}...`);

  if (!ai) {
    console.log("Using fallback questions template...");
    const fallbackTemplate = lang === "hi" ? STATIC_FALLBACK_QUESTIONS_HI : STATIC_FALLBACK_QUESTIONS;
    let baseQuestions = fallbackTemplate[sub] || fallbackTemplate.gk;
    const customQuestions = baseQuestions.map((q: any, index: number) => {
      let qText = q.question;
      if (baselineDiff === "easy") {
        qText = lang === "hi" ? `(आसान बेसलाइन) ${qText}` : `(Easy Baseline) ${qText}`;
      } else if (baselineDiff === "hard") {
        qText = lang === "hi" ? `(कठिन बेसलाइन) ${qText}` : `(Hard Baseline) ${qText}`;
      }
      return { ...q, question: qText, id: `${sub}-${grade}-${q.level}-${Date.now()}` };
    });
    return res.json({ questions: customQuestions });
  }

  try {
    let languageGuideline = "The language of the entire output (question, options, correctAnswer, and explanation) MUST be in English.";
    if (lang === "hi") {
      languageGuideline = `CRITICAL: The entire generated quiz MUST be strictly in HINDI using Devanagari script.
- The "question" must be written in Hindi.
- All 4 strings inside the "options" array MUST be in Hindi.
- The "correctAnswer" MUST completely and exactly match one of the 4 options written in Hindi.
- The "explanation" must be written in clear, educational, child-friendly Hindi.`;
    }

    let curriculumSeriousnessCode = "";
    if (grade === 11 || grade === 12) {
      curriculumSeriousnessCode = `CRITICAL: The Class grade level is ${grade} (High School Senior). These students are preparing for crucial competitive and academic board assessments (CBSE, ICSE, JEE, NEET, or IB). 
- Do NOT generate trivial, simplistic, or child-like questions.
- Physics: Mechanics, Thermodynamics, Electromagnetism, Modern Physics, Waves, Optics, Kinematics.
- Chemistry: Organic reactions, Chemical Kinetics, Coordination Compounds, Periodic laws, Atomic Structure.
- Biology: Cell Division, Human Physiology, Genetics, Biotechnology, Plant biology, Evolution, Ecology.
- Mathematics: Calculus, Differential equations, Vectors, 3D Geometry, Linear Programming, Probability, Matrices.`;
    } else {
      curriculumSeriousnessCode = `Maintain accurate curriculum-matched academic standards appropriate for Class ${grade}.`;
    }

    const prompt = `Generate exactly 10 multiple-choice questions for educational Class Level ${grade} to play a Kaun Banega Crorepati (KBC) style quiz on the subject of ${sub.toUpperCase()}.
The OVERALL BASELINE DIFFICULTY of this quiz session MUST be tuned to: ${baselineDiff.toUpperCase()}.
- If 'EASY' baseline: Questions must be on the simpler side for a Class ${grade} student.
- If 'MEDIUM' baseline: Questions must match standard curriculum-based expectations for Class ${grade}.
- If 'HARD' baseline: Questions must be noticeably challenging for Class ${grade}.

Questions MUST progress in difficulty sequentially:
- Questions 1 to 3 (Level 1-3): Easy difficulty for Class ${grade}.
- Questions 4 to 7 (Level 4-7): Medium difficulty for Class ${grade}.
- Questions 8 to 9 (Level 8-9): Hard difficulty for Class ${grade}.
- Question 10 (Level 10): Expert difficulty for Class ${grade}.

${languageGuideline}

${curriculumSeriousnessCode}

Each question object MUST have:
1. "question": string.
2. "options": array of exactly 4 distinct strings.
3. "correctAnswer": string matching one of the 4 options exactly.
4. "explanation": string with a 1-2 sentence educational explanation.
5. "difficulty": "easy" (1-3), "medium" (4-7), "hard" (8-9), "expert" (10).
6. "level": integer from 1 to 10.

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
      const mappedQuestions = parsed.questions.map((q: any, index: number) => {
        let options = q.options || [];
        if (options.length < 4) {
          options = [...options, "Option A", "Option B", "Option C", "Option D"].slice(0, 4);
        }
        let correct = q.correctAnswer;
        if (!options.includes(correct)) {
          options[0] = correct;
        }
        return {
          id: `ai-${sub}-${grade}-${index + 1}-${Date.now()}`,
          question: q.question,
          options: options,
          correctAnswer: correct,
          explanation: q.explanation || "Correct answer explanation.",
          difficulty: q.difficulty || (index < 3 ? "easy" : index < 7 ? "medium" : index < 9 ? "hard" : "expert"),
          level: index + 1
        };
      });
      return res.json({ questions: mappedQuestions });
    } else {
      throw new Error("Model format mismatch, falling back to static questions");
    }

  } catch (error) {
    console.error("Gemini failed to generate quiz questions, falling back:", error);
    const fallbackTemplate = lang === "hi" ? STATIC_FALLBACK_QUESTIONS_HI : STATIC_FALLBACK_QUESTIONS;
    const baseQuestions = fallbackTemplate[sub] || fallbackTemplate.gk;
    const customQuestions = baseQuestions.map((q: any) => ({
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
    const defaultFeedback = lang === "hi" 
      ? `शानदार प्रयास, ${studentName}! आपने Class ${classLevel} के ${subject} विषय में ${correctCount}/${totalQuestions} सही उत्तर दिए। सीखने और आगे बढ़ते रहने का आपका जुनून बेहद प्रेरणादायक है!`
      : `Excellent effort, ${studentName}! You answered ${correctCount}/${totalQuestions} correctly in ${subject}. Keep studying and attempting quizzes to climb higher on the leaderboards!`;
    return res.json({ feedback: defaultFeedback });
  }

  try {
    const qaSummaries = (results || []).slice(0, 4).map((r: any) => 
      `Q: "${r.question}" | Ans: "${r.userAnswer}" | Status: ${r.isCorrect ? "CORRECT" : "WRONG"}`
    ).join("\n");

    let languageGuideline = "Write the feedback in English.";
    if (lang === "hi") {
      languageGuideline = "Write the feedback strictly in HINDI using Devanagari script. Establish a warm, encouraging, supportive Indian school teacher persona.";
    }

    const prompt = `Write a short, personalized, and encouraging Teacher Remark for an academic report card.
Student Name: ${studentName}
Class Grade: Class ${classLevel}
Subject: ${subject}
Quiz Performance: Scored ${correctCount} out of ${totalQuestions} and won ${pointsWon.toLocaleString()} points.
Sample of answers played:\n${qaSummaries}

Write in the tone of a passionate, inspiring teacher. It must be exactly 2 to 3 sentences long.
- Address the student by name.
- Highlight something positive they did.
- Provide one actionable study tip related to their grade and subject.
- Do NOT use brackets or placeholders.
- ${languageGuideline}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { temperature: 0.8 }
    });

    const val = response.text ? response.text.trim() : "";
    let fallbackText = lang === "hi" 
      ? `शाबाश ${studentName}! आपने Class ${classLevel} ${subject} में उत्कृष्ट प्रदर्शन किया।`
      : `Well played ${studentName}! Excellent work tackling the ${subject} quiz. Keep practicing!`;
    res.json({ feedback: val || fallbackText });
  } catch (error) {
    console.error("Error generating report feedback:", error);
    let fallbackText = lang === "hi" 
      ? `अद्भुत प्रदर्शन ${studentName}! आपने Class ${classLevel} ${subject} परीक्षा में अविश्वसनीय कार्य किया।`
      : `Incredible work ${studentName}! You did a magnificent job in class ${classLevel} ${subject}. Keep practicing!`;
    res.json({ feedback: fallbackText });
  }
});

// Handle clear reports (no-op on serverless, actual clearing is done in localStorage)
app.post("/api/reports/clear", (req, res) => {
  res.json({ success: true, message: "Cleared successfully." });
});

export default app;
