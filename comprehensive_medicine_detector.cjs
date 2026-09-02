/**
 * Comprehensive Medicine Detector & Validator
 * ===========================================
 * CommonJS validator module for extracting, normalizing, and verifying
 * medical extractions, dosage patterns, frequencies, and strengths from clinical text.
 */

const COMMON_MEDICINES = new Set([
  'paracetamol', 'acetaminophen', 'amoxicillin', 'ibuprofen', 'azithromycin',
  'metformin', 'pantoprazole', 'omeprazole', 'atorvastatin', 'amlodipine',
  'losartan', 'cetirizine', 'levocetirizine', 'doxycycline', 'ciprofloxacin',
  'metoprolol', 'ranitidine', 'telmisartan', 'clopidogrel', 'aspirin',
  'disprin', 'pcm', 'crocin', 'dolo', 'dolo-650', 'calpol', 'augmentin',
  'azee', 'pan-d', 'pantocid', 'zifi', 'taxim-o', 'combiflam', 'brufen'
]);

const DOSAGE_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|tablets?|capsules?|pills?|iu)/gi,
  /\b([10]\s*-\s*[10]\s*-\s*[10])\b/g, // 1-0-1, 1-1-1, 0-0-1
  /\b(once|twice|thrice|three times|four times)\s*(?:a|per)?\s*day\b/gi,
  /\b(bid|tid|qid|qd|prn|hs|stat|od)\b/gi,
  /\b(before|after)\s*(?:food|meals|breakfast|lunch|dinner)\b/gi
];

/**
 * Detects medicine names mentioned in a given text string.
 * @param {string} text 
 * @returns {Array<{medicine: string, confidence: number}>}
 */
function detectMedicines(text) {
  if (!text || typeof text !== 'string') return [];

  const found = [];
  const words = text.toLowerCase().split(/[\s,;:()\/\-\n\r]+/);
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    if (COMMON_MEDICINES.has(cleanWord)) {
      found.push({
        medicine: cleanWord,
        confidence: 0.95
      });
    }
  }

  // Also check for dose pattern matches in proximity to capitalized terms
  const rawWords = text.split(/\s+/);
  for (let i = 0; i < rawWords.length; i++) {
    const raw = rawWords[i].replace(/[^a-zA-Z]/g, '');
    if (raw.length >= 4 && /^[A-Z][a-z]+$/.test(raw)) {
      const lower = raw.toLowerCase();
      if (!found.some(item => item.medicine === lower)) {
        // High heuristic score if followed by dosage (e.g. 500mg)
        if (i + 1 < rawWords.length && /\d+(mg|g|ml)/i.test(rawWords[i + 1])) {
          found.push({
            medicine: lower,
            confidence: 0.85
          });
        }
      }
    }
  }

  return found;
}

/**
 * Normalizes dosage instructions (e.g. 1-0-1 -> Twice Daily).
 * @param {string} text 
 * @returns {string}
 */
function normalizeDosage(text) {
  if (!text) return 'As Directed';
  
  const lower = text.toLowerCase().trim();
  if (/1-0-1/.test(lower) || /bid/.test(lower) || /twice\s*daily/.test(lower)) {
    return 'Twice Daily (Morning & Evening)';
  }
  if (/1-1-1/.test(lower) || /tid/.test(lower) || /thrice\s*daily/.test(lower)) {
    return 'Three Times Daily (Morning, Afternoon, Evening)';
  }
  if (/1-0-0/.test(lower) || /0-0-1/.test(lower) || /od/.test(lower) || /once\s*daily/.test(lower)) {
    return 'Once Daily';
  }
  if (/prn|as needed/.test(lower)) {
    return 'As Needed (PRN)';
  }

  return text;
}

/**
 * Validates extracted prescription data JSON structure.
 * @param {Object} data 
 * @returns {{isValid: boolean, errors: Array<string>}}
 */
function validatePrescriptionExtraction(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Prescription data must be a valid object.'] };
  }

  if (!Array.isArray(data.medicines) || data.medicines.length === 0) {
    errors.push('No medicines extracted or medicines array is empty.');
  } else {
    data.medicines.forEach((med, idx) => {
      if (!med.name) {
        errors.push(`Medicine at index ${idx} missing 'name' attribute.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  COMMON_MEDICINES: Array.from(COMMON_MEDICINES),
  detectMedicines,
  normalizeDosage,
  validatePrescriptionExtraction
};
