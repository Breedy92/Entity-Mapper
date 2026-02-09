
import { GoogleGenAI, Type } from "@google/genai";
import { EntityType, RelationshipType } from "../types";

export const generateStructureFromPrompt = async (prompt: string) => {
  // Fix: Create a new GoogleGenAI instance inside the function to ensure the most up-to-date API key is used from environment/dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed JSON entity structure for a complex accounting setup: ${prompt}. 
               
               RULES:
               1. Use EntityTypes: ${Object.values(EntityType).join(', ')}
               2. Use RelationshipTypes: ${Object.values(RelationshipType).join(', ')}
               3. If a person has multiple roles (e.g., Director and Shareholder), create TWO separate edge objects between the same source and target IDs.
               4. For individual names, use realistic professional examples.
               5. Output must be a strictly valid JSON object with "nodes" and "edges".
               
               JSON SCHEMA:
               {
                 "nodes": [{"id": "string", "type": "string", "name": "string", "description": "string"}],
                 "edges": [{"id": "string", "sourceId": "string", "targetId": "string", "type": "string"}]
               }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "type", "name", "description"]
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                sourceId: { type: Type.STRING },
                targetId: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["id", "sourceId", "targetId", "type"]
            }
          }
        },
        required: ["nodes", "edges"]
      }
    }
  });

  try {
    // Fix: Using response.text as a property directly, not as a method.
    const text = response.text;
    if (!text) return null;
    const data = JSON.parse(text);
    
    // Safety check: ensure edges only point to valid nodes
    const nodeIds = new Set(data.nodes.map((n: any) => n.id));
    data.edges = data.edges.filter((e: any) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));

    // Initial grid spread so lines don't stack at 0,0
    data.nodes = data.nodes.map((node: any, idx: number) => ({
      ...node,
      x: 300 + (idx % 3) * 300,
      y: 150 + Math.floor(idx / 3) * 250
    }));
    
    return data;
  } catch (e) {
    console.error("AI Generation Failed:", e);
    return null;
  }
};
