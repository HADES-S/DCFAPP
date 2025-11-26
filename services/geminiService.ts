import { GoogleGenAI } from "@google/genai";
import { AIAnalysisResponse, DCFInputs } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStockWithGemini = async (ticker: string): Promise<AIAnalysisResponse> => {
  try {
    const prompt = `
      I need to perform a Discounted Cash Flow (DCF) valuation for the company with ticker symbol: ${ticker}.
      
      Please use Google Search to find the most recent financial data available.
      I need the following specific metrics:
      1. Current Stock Price (USD).
      2. Latest Annual Free Cash Flow (FCF) in USD.
      3. Estimated Growth Rate for the next 5 years (percentage). If unknown, estimate based on historical CAGR or industry averages (conservative).
      4. Weighted Average Cost of Capital (WACC) as the Discount Rate (percentage).
      5. Shares Outstanding.
      
      Return a JSON object with this structure:
      {
        "symbol": "${ticker}",
        "currentPrice": <number>,
        "freeCashFlow": <number>,
        "growthRate": <number>,
        "discountRate": <number>,
        "terminalGrowthRate": 2.5,
        "sharesOutstanding": <number>,
        "reasoning": "<简短总结这些数据的来源以及为何选择该增长率/WACC (Must be in Chinese)>"
      }

      Rules:
      - Return ONLY raw JSON. No markdown code blocks.
      - freeCashFlow and sharesOutstanding should be full raw numbers (e.g., 1000000000 for 1B).
      - If you find values in billions/millions, convert them to full numbers.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseSchema is NOT allowed with googleSearch, so we rely on prompt engineering for JSON
      },
    });

    const text = response.text || "{}";
    
    // Extract JSON from potential markdown blocks if the model ignores the "no markdown" rule
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    
    const data = JSON.parse(jsonString);

    const inputs: Partial<DCFInputs> = {
      symbol: data.symbol || ticker.toUpperCase(),
      currentPrice: typeof data.currentPrice === 'number' ? data.currentPrice : 0,
      freeCashFlow: typeof data.freeCashFlow === 'number' ? data.freeCashFlow : 0,
      growthRate: typeof data.growthRate === 'number' ? data.growthRate : 10,
      discountRate: typeof data.discountRate === 'number' ? data.discountRate : 9,
      terminalGrowthRate: typeof data.terminalGrowthRate === 'number' ? data.terminalGrowthRate : 2.5,
      sharesOutstanding: typeof data.sharesOutstanding === 'number' ? data.sharesOutstanding : 0,
      projectionYears: 5
    };
    
    // Get search sources if available
    const sources: string[] = [];
    if (response.candidates && response.candidates[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }

    return {
      inputs,
      reasoning: data.reasoning || "由 Gemini 2.5 Flash 估算的数据。",
      sources: [...new Set(sources)] // Unique sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("无法获取股票数据，请手动输入。");
  }
};
