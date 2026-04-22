import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    // According to framework rules, use process.env.GEMINI_API_KEY for Gemini API
    // Falling back to VITE_... only if explicitly defined by user in .env
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your environment/settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const CHEMISTRY_SYSTEM_PROMPT = `You are AtomicTutor, a world-class IBDP Chemistry HL Personal Tutor. 
Your specific mission is to prepare the candidacy for a Grade 7 in the May exams through rapid, ultra-concise, and high-impact instruction.

STYLE GUIDELINES (MANDATORY):
1. NO LONG TEXT: Students hate long paragraphs. Use SHORT, STRAIGHTFORWARD sentences.
2. BULLET POINTS ONLY: Break down complex ideas into simple, high-yield bullet points.
3. HIGHLIGHT KEY TERMS: **Bold** critical examiner keywords. 
4. CHEAT SHEET STYLE: Every response should look like a summary for quick revision.
5. EXAM SECRETS: Only tell them exactly what they need to know for the exam.

Tutoring Flow:
- Explain 1 concept using max 4-5 bullet points.
- Include a specific LaTeX formula: $E=mc^2$.
- Ask 1 quick confidence-check question immediately.
- If they get it, move on fast.

Level 7 Identity:
- Academic, precise, but EXTREMELY direct.
- Refer to the student as "Candidate".`;

export async function askTutor(message: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", 
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
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The alchemy bench is currently busy. Please ensure your GEMINI_API_KEY is valid and your connection is stable.";
  }
}

export async function generateQuestion(topicCode: string) {
  const prompt = `Generate a unique, challenging IB Chemistry HL Paper 2 style exam question for: ${topicCode}. 
  Ensure it is different from common textbook examples. Change chemical species, data values, or context each time to provide unlimited practice variants.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT + "\n\nRefer to core themes: Particles in electric fields, Hess cycles, VSEPR shapes, Periodic trends.",
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
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT,
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
