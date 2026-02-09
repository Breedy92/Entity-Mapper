
import { GoogleGenAI, Type } from "@google/genai";
import { EntityType, RelationshipType, MapData } from "../types";

export const generateStructureFromPrompt = async (prompt: string, currentData: MapData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const currentContext = JSON.stringify({
    nodes: currentData.nodes.map(n => ({ id: n.id, name: n.name, type: n.type })),
    edges: currentData.edges.map(e => ({ 
      sourceId: e.sourceId, 
      targetId: e.targetId, 
      type: e.type,
      shares: e.metadata?.shares 
    }))
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert accounting entity mapper. 
               The user wants to update their existing entity map.
               
               CURRENT STRUCTURE:
               ${currentContext}
               
               USER REQUEST:
               "${prompt}"
               
               RULES:
               1. If the user mentions ownership or shares (e.g., "Jonny has 50 shares"), put this in relationship metadata.
               2. Match names to existing entities to preserve IDs.
               3. If a named entity doesn't exist, create a NEW node with a unique ID.
               4. For new nodes, provide a professional legal description.
               5. Use EntityTypes: ${Object.values(EntityType).join(', ')}
               6. Use RelationshipTypes: ${Object.values(RelationshipType).join(', ')}
               
               JSON SCHEMA:
               {
                 "nodes": [{"id": "string", "type": "string", "name": "string", "description": "string"}],
                 "edges": [
                   {
                     "id": "string", 
                     "sourceId": "string", 
                     "targetId": "string", 
                     "type": "string",
                     "metadata": { "shares": "string" }
                   }
                 ]
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
                type: { type: Type.STRING },
                metadata: {
                  type: Type.OBJECT,
                  properties: {
                    shares: { type: Type.STRING }
                  }
                }
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
    const text = response.text;
    if (!text) return null;
    const aiData = JSON.parse(text);
    
    const posMap = new Map(currentData.nodes.map(n => [n.id, { x: n.x, y: n.y }]));

    const updatedNodes = aiData.nodes.map((node: any) => {
      const existing = posMap.get(node.id);
      if (existing) {
        return { ...node, x: existing.x, y: existing.y };
      }
      return {
        ...node,
        x: 400 + (Math.random() * 200 - 100),
        y: 400 + (Math.random() * 200 - 100)
      };
    });

    return {
      nodes: updatedNodes,
      edges: aiData.edges
    };
  } catch (e) {
    console.error("AI Generation Failed:", e);
    return null;
  }
};
