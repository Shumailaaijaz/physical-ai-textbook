import { createHash } from 'crypto';

interface TranslationCache {
  [key: string]: {
    original: string;
    urdu: string;
    technical_terms: string[];
    timestamp: number;
  };
}

const cache: TranslationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Translates English text to Urdu while preserving technical terms
 * @param inputText - The English text to translate
 * @returns Promise with translation result
 */
export async function translateToUrdu(inputText: string): Promise<{
  original: string;
  urdu: string;
  technical_terms: string[];
}> {
  // Generate cache key
  const cacheKey = createHash('md5').update(inputText).digest('hex');

  // Check cache
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      original: cached.original,
      urdu: cached.urdu,
      technical_terms: cached.technical_terms,
    };
  }

  // In production, this would call an AI API (OpenAI, etc.)
  // For now, return a placeholder
  const result = {
    original: inputText,
    urdu: await mockTranslate(inputText),
    technical_terms: extractTechnicalTerms(inputText),
  };

  // Cache the result
  cache[cacheKey] = {
    ...result,
    timestamp: Date.now(),
  };

  return result;
}

/**
 * Mock translation function (replace with actual AI API call)
 */
async function mockTranslate(text: string): Promise<string> {
  // This is a placeholder - in production, call OpenAI API
  // For demo purposes, preserve technical terms and add Urdu placeholder
  const technicalTerms = extractTechnicalTerms(text);
  let translated = text;

  // Mark as translated (placeholder)
  translated = `[اردو] ${text}`;

  return translated;
}

/**
 * Extract technical terms that should not be translated
 */
function extractTechnicalTerms(text: string): string[] {
  const technicalPatterns = [
    /ROS\s*2?/gi,
    /URDF/gi,
    /Gazebo/gi,
    /Python/gi,
    /JavaScript/gi,
    /TypeScript/gi,
    /Node\.js/gi,
    /Docker/gi,
    /Ubuntu/gi,
    /Windows/gi,
    /Linux/gi,
    /Isaac\s*Sim/gi,
    /Unity/gi,
    /Jetson/gi,
    /NVIDIA/gi,
    /GPU/gi,
    /CPU/gi,
    /API/gi,
    /JSON/gi,
    /YAML/gi,
    /\.py\b/g,
    /\.ts\b/g,
    /\.js\b/g,
  ];

  const terms = new Set<string>();

  technicalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => terms.add(match));
    }
  });

  return Array.from(terms);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
    }
  });
}

// Clear cache every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);
