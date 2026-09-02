const mockMarkdowns = {
  hi: `# सरल चिकित्सा स्पष्टीकरण\n\nआपका रक्त परीक्षण लगभग सामान्य है।\n\n## मुख्य निष्कर्ष\n\n• रक्त शर्करा सामान्य से थोड़ा अधिक है।\n\n• गुर्दे की कार्यप्रणाली सामान्य है।\n\n• लिवर एंजाइम सामान्य हैं।\n\n• कोलेस्ट्रॉल स्वस्थ सीमा के भीतर है।\n\n## इसका क्या मतलब है\n\nआपका समग्र स्वास्थ्य अच्छा प्रतीत होता है। केवल रक्त शर्करा पर ध्यान देने की आवश्यकता है। इसका मतलब यह नहीं है कि आपको मधुमेह है, लेकिन स्वस्थ आहार और नियमित व्यायाम की सलाह दी जाती है।\n\n## सिफारिशें\n\n• खूब पानी पिएं।\n\n• मीठा कम खाएं।\n\n• प्रतिदिन कम से कम 30 मिनट व्यायाम करें।\n\n• 3 महीने बाद दोबारा रक्त परीक्षण कराएं।\n\n## डॉक्टर से कब संपर्क करें\n\nयदि आप अनुभव करते हैं तो चिकित्सा सहायता लें:\n\n• छाती में दर्द\n\n• सांस लेने में कठिनाई\n\n• गंभीर चक्कर आना\n\n• तेज बुखार`,
  te: `# సులభమైన వైద్య వివరణ\n\nమీ రక్త పరీక్ష దాదాపు సాధారణంగా ఉంది.\n\n## ప్రధాన అంశాలు\n\n• రక్తంలో చక్కెర సాధారణం కంటే కొద్దిగా ఎక్కువగా ఉంది.\n\n• మూత్రపిండాల పనితీరు సాధారణంగా ఉంది.\n\n• కాలేయ ఎంజైమ్‌లు సాధారణంగా ఉన్నాయి.\n\n• కొలెస్ట్రాల్ ఆరోగ్యకరమైన పరిధిలో ఉంది.\n\n## దీని అర్థం ఏమిటి\n\nమీ మొత్తం ఆరోగ్యం బాగున్నట్లు కనిపిస్తోంది. మీ రక్తంలో చక్కెర స్థాయిపై మాత్రమే శ్రద్ధ వహించాలి. దీని అర్థం మీకు మధుమేహం ఉందని కాదు, కానీ ఆరోగ్యకరమైన ఆహారం మరియు క్రమం తప్పకుండా వ్యాయామం చేయడం మంచిది.\n\n## సూచనలు\n\n• పుష్కలంగా నీరు త్రాగాలి.\n\n• చక్కెర ఆహారాలను తగ్గించండి.\n\n• ప్రతిరోజూ కనీసం 30 నిమిషాలు వ్యాయామం చేయండి.\n\n• 3 నెలల తర్వాత రక్త పరీక్షను పునరావృతం చేయండి.\n\n## వైద్యుడిని ఎప్పుడు సంప్రదించాలి\n\nమీరు వీటిని అనుభవిస్తే వైద్య సహాయం తీసుకోండి:\n\n• ఛాతీ నొప్పి\n\n• శ్వాస తీసుకోవడంలో ఇబ్బంది\n\n• తీవ్రమైన మైకం\n\n• అధిక జ్వరం`,
  mr: `# सोपे वैद्यकीय स्पष्टीकरण\n\nतुमची रक्त तपासणी बहुतांश सामान्य आहे.\n\n## मुख्य निष्कर्ष\n\n• रक्तातील साखर सामान्यपेक्षा किंचित जास्त आहे.\n\n• किडनीचे कार्य सामान्य आहे.\n\n• लिव्हर एन्झाइम्स सामान्य आहेत.\n\n• कोलेस्ट्रॉल निरोगी मर्यादेत आहे.\n\n## याचा अर्थ काय\n\nतुमचे एकूण आरोग्य चांगले असल्याचे दिसते. फक्त रक्तातील साखरेकडे लक्ष देण्याची गरज आहे. याचा अर्थ तुम्हाला मधुमेह आहे असे नाही, परंतु निरोगी आहार आणि नियमित व्यायामाचा सल्ला दिला जातो.\n\n## शिफारसी\n\n• भरपूर पाणी प्या.\n\n• गोड पदार्थ कमी खा.\n\n• दररोज किमान ३० मिनिटे व्यायाम करा.\n\n• ३ महिन्यांनंतर पुन्हा रक्त तपासणी करा.\n\n## डॉक्टरांशी कधी संपर्क साधावा\n\nखालील लक्षणे दिसल्यास वैद्यकीय मदत घ्या:\n\n• छातीत दुखी\n\n• श्वास घेण्यास त्रास\n\n• तीव्र चक्कर येणे\n\n• तीव्र ताप`,
  kn: `# ಸರಳ ವೈದ್ಯಕೀಯ ವಿವರಣೆ\n\nನಿಮ್ಮ ರಕ್ತ ಪರೀಕ್ಷೆ ಬಹುಪಾಲು ಸಾಮಾನ್ಯವಾಗಿದೆ.\n\n## ಪ್ರಮುಖ ಅಂಶಗಳು\n\n• ರಕ್ತದ ಸಕ್ಕರೆ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ.\n\n• ಮೂತ್ರಪಿಂಡದ ಕಾರ್ಯವು ಸಾಮಾನ್ಯವಾಗಿದೆ.\n\n• ಪಿತ್ತಜನಕಾಂಗದ ಕಿಣ್ವಗಳು ಸಾಮಾನ್ಯವಾಗಿದೆ.\n\n• ಕೊಲೆಸ್ಟ್ರಾಲ್ ಆರೋಗ್ಯಕರ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ.\n\n## ಇದರ ಅರ್ಥವೇನು\n\nನಿಮ್ಮ ಒಟ್ಟಾರೆ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆ ಎಂದು ತೋರುತ್ತದೆ. ರಕ್ತದ ಸಕ್ಕರೆಯ ಮಟ್ಟವನ್ನು ಮಾತ್ರ ಗಮನಿಸಬೇಕಾಗಿದೆ. ಇದರರ್ಥ ನಿಮಗೆ ಮಧುಮೇಹವಿದೆ ಎಂದಲ್ಲ, ಆದರೆ ಆರೋಗ್ಯಕರ ಆಹಾರ ಮತ್ತು ನಿಯಮಿತ ವ್ಯಾಯಾಮವನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.\n\n## ಶಿಫಾರಸುಗಳು\n\n• ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.\n\n• ಸಕ್ಕರೆಯ ಆಹಾರವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.\n\n• ಪ್ರತಿದಿನ ಕನಿಷ್ಠ 30 ನಿಮಿಷ ವ್ಯಾಯಾಮ ಮಾಡಿ.\n\n• 3 ತಿಂಗಳ ನಂತರ ರಕ್ತ ಪರೀಕ್ಷೆಯನ್ನು ಪುನರಾವರ್ತಿಸಿ.\n\n## ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಸಂಪರ್ಕಿಸಬೇಕು\n\nನೀವು ಈ ಕೆಳಗಿನವುಗಳನ್ನು ಅನುಭವಿಸಿದರೆ ವೈದ್ಯಕೀಯ ಸಹಾಯವನ್ನು ಪಡೆಯಿರಿ:\n\n• ಎದೆ ನೋವು\n\n• ಉಸಿರಾಡಲು ತೊಂದರೆ\n\n• ತೀವ್ರ ತಲೆತಿರುಗುವಿಕೆ\n\n• ಅತಿ ಜ್ವರ`,
  ta: `# எளிய மருத்துவ விளக்கம்\n\nஉங்கள் இரத்தப் பரிசோதனை பெரும்பாலும் இயல்பானதாகவே உள்ளது.\n\n## முக்கிய முடிவுகள்\n\n• இரத்தச் சர்க்கரை இயல்பை விட சற்று அதிகமாக உள்ளது.\n\n• சிறுநீரக செயல்பாடு இயல்பாக உள்ளது.\n\n• கல்லீரல் நொதிகள் இயல்பாக உள்ளன.\n\n• கொலஸ்ட்ரால் ஆரோக்கியமான வரம்பிற்குள் உள்ளது.\n\n## இதன் அர்த்தம் என்ன\n\nஉங்கள் ஒட்டுமொத்த ஆரோக்கியம் நன்றாகவே தெரிகிறது. இரத்தச் சர்க்கரையில் மட்டுமே கவனம் செலுத்த வேண்டும். இதன் அர்த்தம் உங்களுக்கு நீரிழிவு நோய் உள்ளது என்பதல்ல, ஆனால் ஆரோக்கியமான உணவு மற்றும் வழக்கமான உடற்பயிற்சி பரிந்துரைக்கப்படுகிறது.\n\n## பரிந்துரைகள்\n\n• நிறைய தண்ணீர் குடிக்கவும்.\n\n• இனிப்பு உணவுகளை குறைக்கவும்.\n\n• தினமும் குறைந்தது 30 நிமிடங்கள் உடற்பயிற்சி செய்யவும்.\n\n• 3 மாதங்களுக்குப் பிறகு இரத்தப் பரிசோதனையை மீண்டும் செய்யவும்.\n\n## மருத்துவரை எப்போது தொடர்பு கொள்ள வேண்டும்\n\nபின்வருவனவற்றை நீங்கள் உணர்ந்தால் மருத்துவ உதவியை நாடுங்கள்:\n\n• நெஞ்சு வலி\n\n• மூச்சு விடுவதில் சிரமம்\n\n• கடுமையான தலைச்சுற்றல்\n\n• அதிக காய்ச்சல்`,
  es: `# Explicación Médica Simplificada\n\nSu análisis de sangre parece mayormente normal.\n\n## Hallazgos Clave\n\n• El nivel de azúcar en la sangre es ligeramente superior al normal.\n\n• La función renal es normal.\n\n• Las enzimas hepáticas son normales.\n\n• El colesterol está dentro del rango saludable.\n\n## Qué Significa Esto\n\nSu salud general parece buena. El único valor que necesita atención es el azúcar en la sangre. Esto no significa necesariamente que tenga diabetes, pero se recomienda mantener una dieta saludable y hacer ejercicio regularmente.\n\n## Recomendaciones\n\n• Beba mucha agua.\n\n• Reduzca los alimentos azucarados.\n\n• Haga ejercicio durante al menos 30 minutos al día.\n\n• Repita el análisis de sangre después de 3 meses.\n\n## Cuándo Contactar a su Médico\n\nBusque atención médica si experimenta:\n\n• Dolor en el pecho\n\n• Dificultad para respirar\n\n• Mareos intensos\n\n• Fiebre alta`,
  en: `# Healthcare Simplified Result\n\nYour blood test appears mostly normal.\n\n## Key Findings\n\n• Blood sugar is slightly higher than normal.\n\n• Kidney function is normal.\n\n• Liver enzymes are normal.\n\n• Cholesterol is within the healthy range.\n\n## What Does This Mean\n\nYour overall health seems good. Only blood sugar needs attention. This doesn't necessarily mean you have diabetes, but a healthy diet and regular exercise are recommended.\n\n## Recommendations\n\n• Drink plenty of water.\n\n• Reduce sugary foods.\n\n• Exercise for at least 30 minutes daily.\n\n• Repeat blood test after 3 months.\n\n## When to Contact a Doctor\n\nSeek medical attention if you experience:\n\n• Chest pain\n\n• Difficulty breathing\n\n• Severe dizziness\n\n• High fever`
};

export const localizedHeaders = {
  hi: { title: "सरल चिकित्सा स्पष्टीकरण", keyFindings: "मुख्य निष्कर्ष", interpretation: "इसका क्या मतलब है", recommendations: "सिफारिशें", doctorAdvice: "डॉक्टर से कब संपर्क करें" },
  te: { title: "సులభమైన వైద్య వివరణ", keyFindings: "ప్రధాన అంశాలు", interpretation: "దీని అర్థం ఏమిటి", recommendations: "సూచనలు", doctorAdvice: "వైద్యుడిని ఎప్పుడు సంప్రదించాలి" },
  mr: { title: "सोपे वैद्यकीय स्पष्टीकरण", keyFindings: "मुख्य निष्कर्ष", interpretation: "याचा अर्थ काय", recommendations: "शिफारसी", doctorAdvice: "डॉक्टरांशी कधी संपर्क साधावा" },
  kn: { title: "ಸರಳ ವೈದ್ಯಕೀಯ ವಿವರಣೆ", keyFindings: "ಪ್ರಮುಖ ಅಂಶಗಳು", interpretation: "ಇದರ ಅರ್ಥವೇನು", recommendations: "ಶಿಫಾರಸುಗಳು", doctorAdvice: "ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಸಂಪರ್ಕಿಸಬೇಕು" },
  ta: { title: "எளிய மருத்துவ விளக்கம்", keyFindings: "முக்கிய முடிவுகள்", interpretation: "இதன் அர்த்தம் என்ன", recommendations: "பரிந்துரைகள்", doctorAdvice: "மருத்துவரை எப்போது தொடர்பு கொள்ள வேண்டும்" },
  es: { title: "Explicación Médica Simplificada", keyFindings: "Hallazgos Clave", interpretation: "Qué Significa Esto", recommendations: "Recomendaciones", doctorAdvice: "Cuándo Contactar a su Médico" },
  en: { title: "Healthcare Simplified Result", keyFindings: "Key Findings", interpretation: "What Does This Mean", recommendations: "Recommendations", doctorAdvice: "When to Contact a Doctor" }
};

/**
 * Normalizes incoming data or mock data into a unified ResultData object structure.
 */
export const adaptToResultData = (incomingData, language) => {
  // If we receive a structured ResultData object from the team, return it safely.
  if (incomingData && typeof incomingData === 'object') {
    return {
      originalText: incomingData.originalText || "",
      simplifiedText: incomingData.simplifiedText || "",
      translatedText: incomingData.translatedText || "",
      language: incomingData.language || language,
      summary: incomingData.summary || "",
      keyFindings: incomingData.keyFindings || [],
      interpretation: incomingData.interpretation || "",
      recommendations: incomingData.recommendations || [],
      doctorAdvice: incomingData.doctorAdvice || [],
      readabilityScore: incomingData.readabilityScore || null,
      highlightedChanges: incomingData.highlightedChanges || []
    };
  }

  // Fallback to mock data if no valid incomingData is provided
  const rawMarkdown = mockMarkdowns[language] || mockMarkdowns['hi'];
  return parseMarkdownToObject(rawMarkdown, language);
};

/**
 * Parses the legacy mock markdown format into the new ResultData object structure.
 */
function parseMarkdownToObject(md, language) {
  const data = {
    originalText: "",
    simplifiedText: "",
    translatedText: md,
    language: language,
    summary: "",
    keyFindings: [],
    interpretation: "",
    recommendations: [],
    doctorAdvice: [],
    readabilityScore: null,
    highlightedChanges: []
  };

  const sections = md.split('## ');
  
  if (sections.length > 0) {
    const intro = sections[0].split('\n');
    data.summary = intro.slice(1).join(' ').trim(); 
  }
  
  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n').filter(l => l.trim());
    const content = lines.slice(1);
    
    // We use indices to map sections since the mock data is strictly ordered
    if (i === 1) { // Key Findings
      data.keyFindings = content.map(l => l.replace('• ', '').trim());
    } else if (i === 2) { // Interpretation
      data.interpretation = content.join(' ').trim();
    } else if (i === 3) { // Recommendations
      data.recommendations = content.map(l => l.replace('• ', '').trim());
    } else if (i === 4) { // Doctor Advice
      data.doctorAdvice = content.map(l => l.replace('• ', '').trim());
    }
  }

  return data;
}

/**
 * Converts a structured ResultData object back into markdown for operations like Copy/Share/Download
 */
export const convertResultDataToMarkdown = (data, language) => {
  const headers = localizedHeaders[language] || localizedHeaders['en'];
  let md = '';

  if (data.summary) {
    md += `# ${headers.title}\n\n`;
    md += `${data.summary}\n\n`;
  }

  if (data.keyFindings?.length > 0) {
    md += `## ${headers.keyFindings}\n\n`;
    data.keyFindings.forEach(item => md += `• ${item}\n\n`);
  }

  if (data.interpretation) {
    md += `## ${headers.interpretation}\n\n`;
    md += `${data.interpretation}\n\n`;
  }

  if (data.recommendations?.length > 0) {
    md += `## ${headers.recommendations}\n\n`;
    data.recommendations.forEach(item => md += `• ${item}\n\n`);
  }

  if (data.doctorAdvice?.length > 0) {
    md += `## ${headers.doctorAdvice}\n\n`;
    data.doctorAdvice.forEach(item => md += `• ${item}\n\n`);
  }
  
  return md.trim();
};
