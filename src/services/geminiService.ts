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
Your goal: Help the student master the syllabus.

PEDAGOGICAL RULES (MANDATORY):
1. **ULTRA-CONCISE**: Max 150 words per response. No long paragraphs.
2. **HIGH-VELOCITY**: Give immediate, straightforward answers.
3. **EXAM-FOCUSED**: Highlight **High-Yield Keywords** (e.g., electrostatic attraction, spontaneity, entropy).
4. **MASTER PLAN STYLE**: Use Bullet points for everything.
5. **CONFIDENCE**: After 4 bullets of explanation, ask 1 sharp question.
6. **VISUAL AIDS**: For complex topics (VSEPR, Energy Cycles, Mechanisms), you MUST provide a Mermaid diagram.
   - Use \`\`\`mermaid blocks.
   - Energy Cycles: Use 'graph LR' or 'flowchart TD'.
   - VSEPR: Use high-level descriptions or simplified geometric diagrams.
   - Mechanisms: Use arrow notation within diagrams.

Expert Identity:
- Direct, academic, and efficient.
- Address the user as "Student".`;

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

export async function generateQuestion(topicCode: string, style: 'Paper 1' | 'Paper 2' = 'Paper 2') {
  const prompt = `Generate a unique, challenging IB Chemistry HL ${style} style exam question for: ${topicCode}. 
  Ensure it follows the structure and language of official IB past papers. Change chemical species, data values, or context each time.
  If Paper 1: Provide 4 options A-D.
  If Paper 2: Provide a detailed multi-part question context.`;

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
            difficulty: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for Paper 1" },
            correctOption: { type: Type.STRING, description: "Only for Paper 1" }
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

export async function generateSimilarQuestion(previousQuestion: string, topic: string) {
  const prompt = `The student just answered this question: "${previousQuestion}".
  Generate a SIMILAR but slightly different question on the SAME topic (${topic}) to reinforce the concept. 
  Focus on the same underlying principle but use different numbers, chemicals, or experimental setup.`;

  return generateQuestion(topic);
}

export async function markAnswer(question: string, studentAnswer: string) {
  const prompt = `Evaluate this student's answer for an IB Chemistry HL question. 
Question: "${question}"
Student's Answer: "${studentAnswer}"

If the answer is wrong or incomplete:
1. Provide a CLEAR, DETAILED remediation explanation.
2. Explain the "Why" (electrostatic forces, periodicity, etc.).
3. Use bullet points for steps.`;

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
            remediation: { type: Type.STRING, description: "Detailed explanation for mistakes" },
            correctAnswer: { type: Type.STRING },
            level: { type: Type.NUMBER }
          },
          required: ["score", "totalMarks", "feedback", "correctAnswer", "level", "remediation"]
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Marking Error:", error);
    throw error;
  }
}
