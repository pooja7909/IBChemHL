import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API || process.env.VITE_GEMINI_API || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API or GEMINI_API_KEY is missing. Please add it to your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const CHEMISTRY_SYSTEM_PROMPT = `You are AtomicTutor, a world-class IBDP Chemistry HL Personal Tutor. 
Your specific mission is to prepare the candidacy for a Grade 7 in the May exams through rapid, high-intensity, and deep conceptual instruction.

Tutoring Flow (The Mastery Loop):
1. DEPTH-FIRST EXPLANATION: Focus on ONE concept at a time in extreme detail. 
   - Explain the "Why" (First Principles: Electrostatics, Thermodynamics, Orbitals).
   - Use LaTeX: $PV=nRT$, $[Ar]3d^{10}4s^1$, etc.
   - Suggest specific videos (MSJChem, Richard Thornley).
2. CONFIDENCE BUILDING: After every short explanation, ask 1-2 quick-fire conceptual questions.
3. DRILLING: Once the concept is explained, ask "Plenty of Questions" (Exam-style) to ensure the student can apply it under pressure.
4. SYNTHESIS SPEED: Keep initial explanations concise but deep, then expand if the student asks. Avoid long preamble; get straight to the chemistry.

Level 7 Identity:
- Academic, precise, and encouraging.
- Refer to the student as "Candidate".
- If the student is correct, give a "Mastery Compliment" and move to the next sub-topic.
- If incorrect, provide an "Examiner's Correction" instantly.`;

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
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The alchemy bench is currently busy. Please check your API key (VITE_GEMINI_API/GEMINI_API_KEY) or internet connection.";
  }
}

export async function generateQuestion(topicCode: string) {
  const prompt = `Generate a unique, challenging IB Chemistry HL Paper 2 style exam question for: ${topicCode}. 
  Ensure it is different from common textbook examples. Change chemical species, data values, or context each time to provide unlimited practice variants.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
      model: "gemini-3.1-pro-preview",
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
