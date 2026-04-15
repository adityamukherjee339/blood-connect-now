export type Locale = "en" | "hi";

export const translations = {
  // ── Navbar ──
  language: { en: "English", hi: "हिन्दी" },

  // ── Home Page ──
  homeTagline: {
    en: "Quickly connect donors and patients in emergencies.",
    hi: "आपातकाल में दाताओं और रोगियों को तुरंत जोड़ें।",
  },
  donateBlood: { en: "Donate Blood", hi: "रक्तदान करें" },
  bookBloodTest: { en: "Book Blood Test", hi: "रक्त जांच बुक करें" },
  needBloodEmergency: {
    en: "Need Blood (Emergency)",
    hi: "रक्त चाहिए (आपातकाल)",
  },
  donors: { en: "Donors", hi: "दाता" },
  requests: { en: "Requests", hi: "अनुरोध" },
  viewAllRecords: { en: "View all records", hi: "सभी रिकॉर्ड देखें" },

  // ── Emergency Dashboard ──
  emergencyDashboard: { en: "Emergency Dashboard", hi: "आपातकालीन डैशबोर्ड" },
  gettingLocation: { en: "Getting location...", hi: "स्थान प्राप्त कर रहे हैं..." },
  locationPrefix: { en: "Location", hi: "स्थान" },
  enterYourName: { en: "Enter your name", hi: "अपना नाम दर्ज करें" },
  enterYourPhone: {
    en: "Enter your phone number",
    hi: "अपना फ़ोन नंबर दर्ज करें",
  },
  requestBlood: { en: "Request Blood", hi: "रक्त अनुरोध" },
  reportAccident: { en: "Report Accident", hi: "दुर्घटना की रिपोर्ट करें" },
  selectBloodType: {
    en: "Select needed blood type",
    hi: "आवश्यक रक्त समूह चुनें",
  },
  nearestHospitalsWith: {
    en: "Nearest hospitals with",
    hi: "निकटतम अस्पताल जिनमें उपलब्ध है",
  },
  kmAway: { en: "km away", hi: "किमी दूर" },
  call: { en: "Call", hi: "कॉल करें" },
  noHospitalsFound: {
    en: "No hospitals found with this blood type nearby.",
    hi: "इस रक्त समूह वाला कोई अस्पताल पास में नहीं मिला।",
  },
  requestForBloodNow: {
    en: "Request for {blood} Blood Now",
    hi: "अभी {blood} रक्त का अनुरोध करें",
  },
  notifyDonorsMsg: {
    en: "This will notify all nearby donors and hospitals about your urgent requirement.",
    hi: "यह आपकी तत्काल आवश्यकता के बारे में सभी नज़दीकी दाताओं और अस्पतालों को सूचित करेगा।",
  },
  bloodRequestSent: { en: "Blood Request Sent!", hi: "रक्त अनुरोध भेजा गया!" },
  bloodRequestSentMsg: {
    en: "We've notified hospitals and {blood} donors in your area. They will contact you shortly.",
    hi: "हमने आपके क्षेत्र के अस्पतालों और {blood} दाताओं को सूचित कर दिया है। वे जल्द ही आपसे संपर्क करेंगे।",
  },
  bloodType: { en: "Type", hi: "प्रकार" },
  sendAnotherRequest: {
    en: "Send another request",
    hi: "एक और अनुरोध भेजें",
  },
  requestAmbulanceFast: {
    en: "🚑 Request Ambulance Fast",
    hi: "🚑 एम्बुलेंस तुरंत बुलाएं",
  },
  coordsSharedMsg: {
    en: "Your coordinates ({lat}, {lng}) will be shared with emergency services.",
    hi: "आपके निर्देशांक ({lat}, {lng}) आपातकालीन सेवाओं के साथ साझा किए जाएंगे।",
  },
  requestSent: { en: "Request Sent!", hi: "अनुरोध भेजा गया!" },
  ambulanceOnWay: {
    en: "Emergency services have been notified. Help is on the way.",
    hi: "आपातकालीन सेवाओं को सूचित कर दिया गया है। मदद आ रही है।",
  },
  locationLabel: { en: "Location", hi: "स्थान" },
  locationDenied: {
    en: "Location access denied. Using default location.",
    hi: "स्थान अनुमति अस्वीकार। डिफ़ॉल्ट स्थान का उपयोग हो रहा है।",
  },
  enterNamePhoneFirst: {
    en: "Please enter your name and phone number first.",
    hi: "कृपया पहले अपना नाम और फ़ोन नंबर दर्ज करें।",
  },
  selectBloodTypeFirst: {
    en: "Please select a blood type.",
    hi: "कृपया रक्त समूह चुनें।",
  },
  ambulanceRequestSent: {
    en: "Ambulance request sent! Help is on the way.",
    hi: "एम्बुलेंस अनुरोध भेजा गया! मदद आ रही है।",
  },
  bloodRequestToast: {
    en: "Blood request for {blood} sent to nearby hospitals and donors!",
    hi: "{blood} रक्त अनुरोध निकटतम अस्पतालों और दाताओं को भेजा गया!",
  },

  // ── Donate Page ──
  donorRegistration: { en: "Donor Registration", hi: "दाता पंजीकरण" },
  stepOf: { en: "Step {step} of {total}", hi: "चरण {step} / {total}" },
  fullName: { en: "Full Name", hi: "पूरा नाम" },
  age: { en: "Age", hi: "आयु" },
  bloodGroup: { en: "Blood Group", hi: "रक्त समूह" },
  selectBloodGroup: { en: "Select blood group", hi: "रक्त समूह चुनें" },
  next: { en: "Next", hi: "अगला" },
  medicalConditions: {
    en: "Medical Conditions (optional)",
    hi: "चिकित्सा स्थितियाँ (वैकल्पिक)",
  },
  anyKnownConditions: {
    en: "Any known conditions...",
    hi: "कोई ज्ञात स्थिति...",
  },
  address: { en: "Address", hi: "पता" },
  addressPlaceholder: {
    en: "House No, Street, City, State, PIN Code",
    hi: "मकान नं, गली, शहर, राज्य, पिन कोड",
  },
  contactNumber: { en: "Contact Number", hi: "संपर्क नंबर" },
  uploadBloodReport: {
    en: "Upload Blood Report (PDF)",
    hi: "रक्त रिपोर्ट अपलोड करें (PDF)",
  },
  clickToUpload: {
    en: "Click to upload your blood report PDF",
    hi: "अपनी रक्त रिपोर्ट PDF अपलोड करने के लिए क्लिक करें",
  },
  submitRegistration: { en: "Submit Registration", hi: "पंजीकरण जमा करें" },
  thankYou: { en: "Thank You!", hi: "धन्यवाद!" },
  donorRegSubmitted: {
    en: "Your donor registration has been submitted.",
    hi: "आपका दाता पंजीकरण जमा कर दिया गया है।",
  },
  backToHome: { en: "Back to Home", hi: "होम पर वापस जाएं" },
  registrationSuccess: {
    en: "Registration submitted successfully!",
    hi: "पंजीकरण सफलतापूर्वक जमा हो गया!",
  },

  // ── Book Test Page ──
  bookBloodTestTitle: { en: "Book Blood Test", hi: "रक्त जांच बुक करें" },
  fullAddress: { en: "Full Address", hi: "पूरा पता" },
  submitBooking: { en: "Submit Booking", hi: "बुकिंग जमा करें" },
  submitting: { en: "Submitting…", hi: "जमा हो रहा है…" },
  bookingConfirmed: { en: "Booking Confirmed!", hi: "बुकिंग पक्की!" },
  bookingConfirmedMsg: {
    en: "Your blood test has been booked. We will contact you shortly to confirm the schedule.",
    hi: "आपकी रक्त जांच बुक हो गई है। हम शीघ्र ही शेड्यूल की पुष्टि के लिए संपर्क करेंगे।",
  },
  bookingSuccessToast: {
    en: "Blood test booked successfully!",
    hi: "रक्त जांच सफलतापूर्वक बुक हो गई!",
  },

  // ── 404 Page ──
  pageNotFound: { en: "Oops! Page not found", hi: "ओह! पेज नहीं मिला" },
  returnToHome: { en: "Return to Home", hi: "होम पर वापस जाएं" },
} as const;

export type TranslationKey = keyof typeof translations;
