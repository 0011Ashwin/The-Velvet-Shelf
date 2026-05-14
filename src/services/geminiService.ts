import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BookInfo {
  title: string;
  author: string;
}

export const extractBookInfo = async (base64Image: string): Promise<BookInfo | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Extract the book title and author from this image. Return a JSON object with 'title' and 'author' keys.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
          },
          required: ["title", "author"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as BookInfo;
  } catch (error) {
    console.error("Error extracting book info:", error);
    return null;
  }
};
