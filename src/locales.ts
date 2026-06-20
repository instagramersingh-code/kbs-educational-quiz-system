export interface TranslationKeys {
  home: string;
  standings: string;
  reports: string;
  howToPlay: string;
  registration: string;
  enterName: string;
  chooseMascot: string;
  selectClass: string;
  chooseCategory: string;
  playMode: string;
  endlessMode: string;
  endlessSubtext: string;
  numQuestions: string;
  setCustomEndlessTimer: string;
  seconds: string;
  minutes: string;
  hours: string;
  endlessTimerSubtext: string;
  selectHardness: string;
  easy: string;
  medium: string;
  hard: string;
  baselineSubtext: string;
  timelessMode: string;
  timelessSubtext: string;
  enterHotSeat: string;
  globalStandings: string;
  liveLeaderboard: string;
  reportCards: string;
  automatedReports: string;
  academicReportCard: string;
  automatedAssessment: string;
  certificateTitle: string;
  certificatePresented: string;
  certificateMotto: string;
  securingScore: string;
  accumulatedPoints: string;
  accuracy: string;
  gradeLevel: string;
  diagnosticAssessment: string;
  printReport: string;
  playNewGame: string;
  diagnosticBreakdown: string;
  lessonGuide: string;
  pastTrialPapers: string;
  teacherRemark: string;
  deleteUser: string;
  allClear: string;
  welcomeBack: string;
  instructionsList: string[];
}

export const locales: Record<"en" | "hi", TranslationKeys> = {
  en: {
    home: "Hot Seat Home",
    standings: "Standings",
    reports: "Reports",
    howToPlay: "HOW TO PLAY THE SHOW",
    registration: "Student Registration",
    enterName: "Enter Your Name",
    chooseMascot: "Choose Lucky Mascot",
    selectClass: "Select Your Class Level",
    chooseCategory: "Choose Quiz Category",
    playMode: "Play Mode & Series Set Options",
    endlessMode: "Endless Play Mode",
    endlessSubtext: "Answer endlessly from the chosen category under a custom countdown time",
    numQuestions: "Number of Questions in Game",
    setCustomEndlessTimer: "Set Custom Endless Timer Duration",
    seconds: "Seconds (s)",
    minutes: "Minutes (m)",
    hours: "Hours (h)",
    endlessTimerSubtext: "Enter the countdown amount. Example: 5 minutes or 120 seconds. Quiz will progress dynamically with no questions cap until this duration completes!",
    selectHardness: "Select Game Hardness (Baseline)",
    easy: "🟢 Easy",
    medium: "🟡 Medium",
    hard: "🔴 Hard",
    baselineSubtext: "Controls the baseline benchmarks: Easy shifts questions simpler, Hard shifts them advanced. Sequential levels 1-10 escalation still applies!",
    timelessMode: "Timeless Mode ⏳",
    timelessSubtext: "Disables the countdown clock for calm, unlimited thinking time",
    enterHotSeat: "ENTER HOT SEAT",
    globalStandings: "Global Standings",
    liveLeaderboard: "Live leaderboard standings by standard KBC points won",
    reportCards: "Report Cards",
    automatedReports: "Automated grade reports",
    academicReportCard: "Academic Report Card",
    automatedAssessment: "Automated Assessment & Performance Report",
    certificateTitle: "CERTIFICATE OF ACHIEVEMENT",
    certificatePresented: "This academic certificate of completion is proudly presented to",
    certificateMotto: "for outstanding academic courage and successfully competing on the Hot Seat standard",
    securingScore: "securing a score of:",
    accumulatedPoints: "Accumulated Points",
    accuracy: "Accuracy",
    gradeLevel: "Grade Level",
    diagnosticAssessment: "AI CLASSROOM DIAGNOSTIC ASSESSMENT",
    printReport: "Print Report Card",
    playNewGame: "Play New Game",
    diagnosticBreakdown: "Diagnostic Assessment Breakdown",
    lessonGuide: "Lesson Guide",
    pastTrialPapers: "PAST TRIAL PAPERS",
    teacherRemark: "TEACHER REMARK:",
    deleteUser: "Delete Current User & Erase History",
    allClear: "All Clear & Erase local history for a blank slate transition.",
    welcomeBack: "Welcome back",
    instructionsList: [
      "Select your academic class to customize question difficulty automatically.",
      "Progressive questions leading to the legendary prize score standard!",
      "Use your 3 Lifelines wisely: 50-50, Flip Question, or Audience Poll.",
      "Secure safe milestone thresholds throughout the escalation ladder."
    ]
  },
  hi: {
    home: "हॉट सीट होम",
    standings: "रैंकिंग सूची",
    reports: "प्रगति रिपोर्ट",
    howToPlay: "खेलने के नियम",
    registration: "छात्र पंजीकरण",
    enterName: "अपना नाम दर्ज करें",
    chooseMascot: "लकी शुभंकर (मास्कॉट) चुनें",
    selectClass: "अपनी कक्षा का स्तर चुनें",
    chooseCategory: "प्रश्नोत्तरी श्रेणी चुनें",
    playMode: "प्ले मोड और प्रश्न श्रृंखला विकल्प",
    endlessMode: "अंतहीन प्ले मोड (एंडलेस)",
    endlessSubtext: "चयनित श्रेणी से एक कस्टम उलटी गिनती समय में अंतहीन उत्तर दें",
    numQuestions: "खेल में प्रश्नों की संख्या",
    setCustomEndlessTimer: "कस्टम अंतहीन टाइमर अवधि सेट करें",
    seconds: "सेकंड (s)",
    minutes: "मिनट (m)",
    hours: "घंटे (h)",
    endlessTimerSubtext: "उलटी गिनती की अवधि दर्ज करें। उदाहरण के लिए: 5 मिनट या 120 सेकंड। इस अवधि के पूरा होने तक प्रश्नोत्तरी बिना किसी सीमा के आगे बढ़ेगी!",
    selectHardness: "प्रश्नोत्तरी कठिनाई स्तर (बेसलाइन) चुनें",
    easy: "🟢 आसान",
    medium: "🟡 मध्यम",
    hard: "🔴 कठिन",
    baselineSubtext: "यह बुनियादी मानक तय करता है: आसान से प्रश्न सरल होंगे, कठिन से उन्नत होंगे। लेकिन स्तर 1 से आगे बढ़ना लागू रहेगा!",
    timelessMode: "समय रहित मोड ⏳",
    timelessSubtext: "शांत और असीमित सोचने के समय के लिए उलटी गिनती घड़ी को अक्षम करता है",
    enterHotSeat: "हॉट सीट पर बैठें (शुरू करें)",
    globalStandings: "वैश्विक स्टैंडिंग्स",
    liveLeaderboard: "हॉट सीट पर अर्जित अंकों के आधार पर लाइव रैंकिंग सूची",
    reportCards: "प्रगति रिपोर्ट कार्ड",
    automatedReports: "स्वचालित ग्रेड रिपोर्ट",
    academicReportCard: "शैक्षणिक रिपोर्ट कार्ड",
    automatedAssessment: "स्वचालित मूल्यांकन और प्रदर्शन रिपोर्ट",
    certificateTitle: "उपलब्धि का प्रमाण पत्र",
    certificatePresented: "यह शैक्षणिक पूर्णता प्रमाण पत्र गर्व के साथ प्रस्तुत किया जाता है",
    certificateMotto: "असाधारण शैक्षणिक साहस प्रदर्शित करने और विषय हॉट सीट परीक्षा में सफलतापूर्वक भाग लेने के लिए",
    securingScore: "एक शानदार स्कोर हासिल करते हुए:",
    accumulatedPoints: "कुल अर्जित अंक",
    accuracy: "सटीकता (Accuracy)",
    gradeLevel: "कक्षा स्तर (Grade)",
    diagnosticAssessment: "एआई एसेसमेंट रिपोर्ट कमेंट्स",
    printReport: "रिपोर्ट कार्ड प्रिंट करें",
    playNewGame: "नया खेल खेलें",
    diagnosticBreakdown: "प्रश्नोत्तरी मूल्यांकन विश्लेषण",
    lessonGuide: "संक्षिप्त सीख",
    pastTrialPapers: "पुराने खेल के प्रयास पत्र",
    teacherRemark: "शिक्षक की टिप्पणी:",
    deleteUser: "वर्तमान उपयोगकर्ता मिटाएं और इतिहास साफ करें",
    allClear: "नए छात्र के उपयोग के लिए पुराना इतिहास पूरी तरह से डिलीट करें।",
    welcomeBack: "आपका स्वागत है",
    instructionsList: [
      "स्वचालित रूप से कठिनता अनुकूलित करने के लिए अपनी शैक्षणिक कक्षा का चयन करें।",
      "ऐतिहासिक और उच्चतम स्कोर मानक तक ले जाने वाले प्रगतिशील प्रश्न!",
      "अपनी 3 जीवन रेखाओं (Lifelines) का बुद्धिमानी से उपयोग करें: 50-50, फ्लिप प्रश्न, या दर्शक पोल।",
      "प्रश्न श्रृंखला में सुरक्षित मील का पत्थर पार करें और अपनी जीत सुरक्षित करें।"
    ]
  }
};
