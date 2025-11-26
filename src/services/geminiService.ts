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

const API_KEY = import.meta.env.OPENROUTER_API_KEY; // Adjust for your env loader (e.g., process.env for Node)
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateContent(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenRouter API key not set in .env');
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // Optional: Helps with OpenRouter leaderboard
        'X-Title': 'Prof Pics App', // Optional: Your app name
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Note: "google/" prefix is correct here!
        messages: [
          { role: 'user', content: prompt } // Your prompt, e.g., "Generate a professional headshot description"
        ],
        max_tokens: 1024, // Adjust as needed
        temperature: 0.7, // Creativity level
        // Optional: stream: true for real-time output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content; // The generated text
  } catch (error) {
    console.error('API call failed:', error);
    throw error; // Bubble up for your app to handle
  }
}

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
