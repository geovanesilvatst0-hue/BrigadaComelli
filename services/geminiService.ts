
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeExtinguisherPhoto(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `Analise esta foto de um extintor de incêndio. Verifique:
            1. O manômetro está na faixa verde?
            2. O lacre está visível e intacto?
            3. A mangueira parece estar em boas condições?
            4. Existe algum dano visível no casco?
            Responda em JSON com os campos: manometerOk (boolean), sealOk (boolean), hoseOk (boolean), casingOk (boolean), confidenceScore (0-1), e observation (string em português).`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            manometerOk: { type: Type.BOOLEAN },
            sealOk: { type: Type.BOOLEAN },
            hoseOk: { type: Type.BOOLEAN },
            casingOk: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER },
            observation: { type: Type.STRING }
          },
          required: ['manometerOk', 'sealOk', 'hoseOk', 'casingOk', 'observation']
        }
      }
    });

    // Fix: Use response.text property directly and trim whitespace before parsing
    const text = response.text?.trim();
    if (!text) {
      throw new Error("Resposta da IA está vazia ou indefinida.");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao analisar imagem com Gemini:", error);
    throw error;
  }
}