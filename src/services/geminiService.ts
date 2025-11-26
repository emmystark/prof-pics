import { GoogleGenAI } from "@google/genai";
import { ProfessionalStyle, BackgroundStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStylePrompt = (style: ProfessionalStyle): string => {
  switch (style) {
    case 'corporate':
      return "wearing a high-quality, tailored navy blue business suit with a crisp white dress shirt and a silk tie. The look should be powerful, executive, and extremely professional.";
    case 'startup':
      return "wearing a smart-casual ensemble, such as a high-end grey blazer over a quality charcoal t-shirt or a fitted polo. The look should be 'Tech Lead' or 'Founder' style - approachable but sharp.";
    case 'minimalist':
      return "wearing a solid black high-quality turtleneck or a premium fitted plain t-shirt. Similar to Steve Jobs or modern Silicon Valley aesthetics. Clean, minimal, focus on the face.";
    case 'creative':
      return "wearing a stylish, layered outfit. Maybe a denim shirt under a knit sweater, or a textured jacket. Professional but showing personality and artistic flair.";
    default:
      return "wearing professional business attire.";
  }
};

const getBackgroundPrompt = (bg: BackgroundStyle): string => {
  switch (bg) {
    case 'office':
      return "a blurred, modern open-plan tech office in the background with glass walls and soft lighting.";
    case 'studio':
      return "a dark, professional studio background with rim lighting highlighting the subject.";
    case 'bokeh':
      return "a blurred city street background with beautiful bokeh lights, looking like a high-end editorial shot.";
    case 'gradient':
      return "a clean, soft neutral grey or blue gradient background, perfect for a standard LinkedIn profile.";
    default:
      return "a professional blurred background.";
  }
};

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; // Loads from .env
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Optional: System prompt for prof-pic context (customize as needed)
export async function generateContent(userPrompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenRouter API key not set in .env - add VITE_OPENROUTER_API_KEY');
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'https://localhost:5173', // For dev/prod attribution
        'X-Title': 'Prof Pics App', // Optional: Shows in OpenRouter dashboard
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Your tested model
        messages: [
          { role: 'system', content: SYSTEM_PROMPT }, // Context for better prof-pic outputs
          { role: 'user', content: userPrompt } // e.g., "for a 30yo female software engineer"
        ],
        max_tokens: 512, // Shorter for image prompts
        temperature: 0.8, // Balanced creativity for descriptions
      }),
    });

    if (!response.ok) {
      const errorData = response.status === 429 
        ? { error: { message: 'Rate limit hit - check OpenRouter dashboard' } } 
        : await response.json();
      throw new Error(`OpenRouter API Error (${response.status}): ${errorData.error?.message || 'Unknown issue'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated - check prompt length or credits');
    }

    return generatedText.trim(); // Clean output for your app
  } catch (error) {
    console.error('OpenRouter fetch failed:', error);
    // Fallback: Return a static prompt if API fails (for dev)
    return 'A professional headshot of a confident individual in business attire, smiling against a neutral gray background, soft natural lighting.';
  }
}

// Export for easy import in your components
export default { generateContent };

export const generateHeadshot = async (
  imageBase64: string,
  mimeType: string,
  style: ProfessionalStyle,
  background: BackgroundStyle,
  customPrompt?: string
): Promise<{ data: string; mimeType: string }> => {
  
  const clothing = getStylePrompt(style);
  const bg = getBackgroundPrompt(background);

  // We ask Gemini to describe the image first to ensure it understands the face, 
  // then we instruct it to modify it.
  // Using gemini-2.5-flash-image for speed and efficiency in editing.
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    You are a world-class professional photographer and photo editor.
    
    Task: Transform this selfie into a highly professional LinkedIn headshot for a Software Engineer.
    
    Current Appearance Analysis:
    Identify the facial features, skin tone, and hair structure of the person in the image. These MUST be preserved.
    
    Target Style:
    - Attire: ${clothing}
    - Background: ${bg}
    
    User Specific Instructions:
    ${customPrompt ? `The user has requested the following specific adjustments: "${customPrompt}". Apply these while maintaining the professional look.` : "No specific custom instructions."}
    
    Strict Requirements:
    1. IDENTITY PRESERVATION IS PARAMOUNT. Do not change the face shape, eyes, nose, mouth, or unique features. Only improve lighting and skin texture (remove acne/blemishes if requested or implicit in professional retouching).
    2. The output must be photorealistic, high resolution.
    3. Framing: Head and shoulders shot. Center the subject.
    4. Lighting: Professional studio lighting.
    
    Do not distort the face.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Check for image in response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/jpeg'
          };
        }
      }
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }



  
};
