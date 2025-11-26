// In your React/Vue/Svelte component
import { generateContent } from '../services/geminiService'; // Adjust path

const handleGenerate = async () => {
  try {
    const prompt = await generateContent('professional pic for a graphic designer');
    setGeneratedPrompt(prompt); // Update state for display
    // Optional: Feed to image gen API like Replicate or Hugging Face
  } catch (error) {
    alert(`Oops: ${error.message}`);
  }
};

// In JSX: <button onClick={handleGenerate}>Generate Prof Pic Prompt</button>