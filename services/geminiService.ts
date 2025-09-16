
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateColorPalette = async (prompt: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a 5-color palette based on this theme: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palette: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A hex color code string, e.g., '#RRGGBB'",
                            },
                        },
                    },
                    required: ["palette"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result.palette && Array.isArray(result.palette) && result.palette.length > 0) {
            return result.palette.slice(0, 5); // Ensure only 5 colors are returned
        } else {
            throw new Error("Invalid palette format in response.");
        }

    } catch (error) {
        console.error("Error generating color palette:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};
