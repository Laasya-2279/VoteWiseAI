const { logger } = require('../utils/logger');

/**
 * Call the standard Gemini API natively using REST fetch (No Vertex AI dependencies).
 * This completely isolates generation from Vertex AI and relies directly on Gemini Developer API.
 */
async function callGemini(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.2 }
    };
    
    logger.info('Sending prompt to standard Gemini LLM', { promptLength: prompt.length });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No valid text returned from Gemini API');
    }
    
    return responseText;
  } catch (error) {
    logger.error('Gemini API call failed', error);
    throw error;
  }
}

/**
 * Generate response with a safety retry layer.
 */
async function generateWithRetry(prompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callGemini(prompt);
    } catch (error) {
      if (i === retries) throw error;
      
      const isRateLimit = error.message.includes('429');
      const delay = isRateLimit ? (i + 1) * 3000 : 1000;
      
      logger.info(`Retrying Gemini API call in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { generateWithRetry };
