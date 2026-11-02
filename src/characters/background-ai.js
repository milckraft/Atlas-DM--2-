import { BACKGROUND_IDS } from "./background-catalogue.js";
import { buildBackgroundAnalysisPrompt } from "../ai/prompts/background-analysis.js";
import { validateBackgroundAnalysis } from "../ai/contracts.js";
import { requestAI } from "../ai/provider-registry.js";

export async function analyzeCharacterBackground(story, options = {}) {
  if (typeof story !== "string" || story.trim().length < 30) {
    return { status:"insufficient_story", message:"Necesito una biografía un poco más desarrollada para recomendar un trasfondo con fundamento." };
  }
  const prompt = buildBackgroundAnalysisPrompt(story);
  const response = await requestAI("narrative", { prompt, purpose:"background-analysis" }, options);
  if (response.status !== "ok") return response;
  const validation = validateBackgroundAnalysis(response.data, BACKGROUND_IDS);
  if (!validation.valid) return { status:"invalid_provider_response", errors:validation.errors };
  return { status:"ok", analysis:response.data };
}
