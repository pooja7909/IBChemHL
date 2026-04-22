import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    // The platform handles mapping GEMINI_API_KEY to process.env in the SDK initialization
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your platform settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const CHEMISTRY_SYSTEM_PROMPT = `You are AtomicTutor, an elite IBDP Chemistry HL Personal Tutor.
Your goal: Prepare the Candidate for a Grade 7 in May.

PEDAGOGICAL RULES (MANDATORY):
1. **ULTRA-CONCISE**: Max 150 words per response. No long paragraphs.
2. **HIGH-VELOCITY**: Give immediate, straightforward answers.
3. **EXAM-FOCUSED**: Highlight **Grade 7 Keywords** (e.g., electrostatic attraction, spontaneity, entropy).
4. **MASTER PLAN STYLE**: Use Bullet points for everything.
5. **CONFIDENCE**: After 4 bullets of explanation, ask 1 sharp question.

Level 7 Identity:
- Direct, academic, and efficient.
- Address the user as "Candidate".`;

export async function askTutor(message: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
    return response.text ?? "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Surface the actual error message if possible to help the user debug
    const errorMsg = error?.message || "Unknown Error";
    return `The alchemy bench is currently busy.\n\n**Diagnostic Info:** ${errorMsg}\n\n*Please ensure your GEMINI_API_KEY is correctly set in the environment settings.*`;
  }
}

export async function generateQuestion(topicCode: string) {
  const prompt = `Generate a unique, challenging IB Chemistry HL Paper 2 style exam question for: ${topicCode}. 
  Ensure it is different from common textbook examples. Change chemical species, data values, or context each time.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT + "\n\nOutput strictly as JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            question: { type: Type.STRING },
            marks: { type: Type.NUMBER },
            difficulty: { type: Type.STRING }
          },
          required: ["topic", "question", "marks", "difficulty"]
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
}

export async function markAnswer(question: string, studentAnswer: string) {
  const prompt = `Evaluate this student's answer for an IB Chemistry HL question. 
Question: "${question}"
Student's Answer: "${studentAnswer}"`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT + "\n\nEvaluate and return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            totalMarks: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            level: { type: Type.NUMBER }
          },
          required: ["score", "totalMarks", "feedback", "correctAnswer", "level"]
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Marking Error:", error);
    throw error;
  }
}
