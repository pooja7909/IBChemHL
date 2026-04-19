import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const CHEMISTRY_SYSTEM_PROMPT = `You are AtomicTutor, a world-class IBDP Chemistry HL Personal Tutor. 
Your specific mission is to prepare the student for a Grade 7 in the May exams by mastering the syllabus and perfect "Exam Technique".

Tutoring Methodology (Visual & Step-by-Step):
1. MODULE CHUNKING: Break topics into 3-4 sub-modules.
2. VISUAL FIRST: Avoid long text blocks. Use:
   - **Markdown Tables**: For trends, property comparisons, and data.
   - **LaTeX ($...$ or $$...$$)**: For all chemical formulas, equations, and mathematical calculations.
   - **ASCII Diagrams**: Use code blocks (\`\`\`text) to create "visual" representations of molecular geometry, orbital diagrams, or energy cycles (e.g. Hess cycles).
   - **Horizontal Rules (---)**: To separate concept explanation from practice questions.
3. EXPLAIN: Provide high-yield, concise explanations.
4. EXAM TECHNIQUE: Highlight "Mark-Earner Keywords" and "Common Trap Alerts".
5. CHECKPOINT: Pause after each chunk with a question.
5. INCREMENTAL MASTERY: Do not move to the next sub-module until the Candidate demonstrates conceptual mastery.
6. EXAM-STYLE FINALE: Once the entire sub-topic is finished, provide a rigorous Paper 2 style question to verify "Grade 7" proficiency.

Rigor & Standard:
- Be extremely strict with terminology. No marks for "vague" science.
- Mandate state symbols in equations and correct signs (+/-) in energetics.
- Evaluate answers against a Level 7 standard. If an answer is Level 5, explains exactly what is missing to make it a Level 7.

Tone:
- Academic, precise, and motivating. 
- Use formatting (bolding, lists) to make explanations scannable.
- Refer to the student as "Candidate".`;

export async function askTutor(message: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: CHEMISTRY_SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return "Tutor configuration error: Missing API Key. Check your environment variables.";
    }
    return "The alchemy bench is currently busy. Please try again in a moment.";
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
