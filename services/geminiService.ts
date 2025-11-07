
import { GoogleGenAI } from '@google/genai';
import { TorNode } from '../types';

export const analyzeNodeWithGemini = async (ai: GoogleGenAI, node: TorNode): Promise<string> => {
  const prompt = `
    Analyze the following TOR network node data and provide a concise, one-paragraph threat assessment and geopolitical context.
    Focus on potential risks associated with this node's type and location. Be factual and analytical.

    Node Data:
    - IP Address: ${node.id}
    - Type: ${node.type}
    - Country: ${node.country}
    - Uptime: ${node.uptime} hours
    - Bandwidth: ${node.bandwidth} KB/s

    Assessment:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Error: The provided API key is not valid. Please check your configuration.";
    }
    return "An error occurred while analyzing the node. The AI service may be unavailable.";
  }
};
