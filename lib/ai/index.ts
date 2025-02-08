import { openai } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { togetherai } from '@ai-sdk/togetherai';
import { deepseek } from '@ai-sdk/deepseek';

import { customMiddleware } from "./custom-middleware";
// Type definition for valid reasoning models used for research and structured outputs
type ReasoningModel = typeof VALID_REASONING_MODELS[number];

// Valid reasoning models that can be used for research analysis and structured outputs
const VALID_REASONING_MODELS = [
  // OpenAI Models
  'openai/gpt-4-0125-preview',
  'openai/gpt-4',
  'openai/gpt-3.5-turbo',
  // Anthropic Models
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-2.1',
  // Google Models
  'google/gemini-pro',
  // Mistral Models
  'mistral-ai/mistral-medium',
  // Legacy Models
  'o1', 'o1-mini', 'o3-mini',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-reasoner',
  'gpt-4o'
] as const;

// Models that support JSON structured output
const JSON_SUPPORTED_MODELS = [
  'openai/gpt-4-0125-preview',
  'openai/gpt-4',
  'openai/gpt-3.5-turbo',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-2.1',
  'gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'
] as const;

// Helper to check if model supports JSON
export const supportsJsonOutput = (modelId: string) =>
  JSON_SUPPORTED_MODELS.includes(modelId as typeof JSON_SUPPORTED_MODELS[number]);

// Get reasoning model from env, with JSON support info
const REASONING_MODEL = process.env.REASONING_MODEL || 'o1-mini';
const BYPASS_JSON_VALIDATION = process.env.BYPASS_JSON_VALIDATION === 'true';

// Helper to get the reasoning model based on user's selected model
function getReasoningModel(modelId: string) {
  // If already using a valid reasoning model, keep using it
  if (VALID_REASONING_MODELS.includes(modelId as ReasoningModel)) {
    return modelId;
  }

  const configuredModel = REASONING_MODEL;

  if (!VALID_REASONING_MODELS.includes(configuredModel as ReasoningModel)) {
    const fallback = 'o1-mini';
    console.warn(`Invalid REASONING_MODEL "${configuredModel}", falling back to ${fallback}`);
    return fallback;
  }

  // Warn if trying to use JSON with unsupported model
  if (!BYPASS_JSON_VALIDATION && !supportsJsonOutput(configuredModel)) {
    console.warn(`Warning: Model ${configuredModel} does not support JSON schema. Set BYPASS_JSON_VALIDATION=true to override`);
  }

  return configuredModel;
}

export const customModel = (apiIdentifier: string, forReasoning: boolean = false) => {
  // If it's for reasoning, get the appropriate reasoning model
  const modelId = forReasoning ? getReasoningModel(apiIdentifier) : apiIdentifier;

  // Check which API key is available
  const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "****";
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "****";
  
  // Determine which provider to use based on model and available keys
  let model;
  
  if (hasOpenRouterKey) {
    // Use OpenRouter for all models if key is available
    // OpenRouter expects the full model identifier (e.g. 'openai/gpt-4')
    // OpenRouter accepts either chat or completion models
    // OpenRouter models use the chat interface for all models
    model = openrouter(modelId);
  } else if (modelId.startsWith('openai/') && hasOpenAIKey) {
    // Fallback to direct OpenAI if using OpenAI model and key is available
    model = openai(modelId.replace('openai/', ''));
  } else if (modelId === 'deepseek-ai/DeepSeek-R1') {
    model = togetherai(modelId);
  } else if (modelId === 'deepseek-reasoner') {
    model = deepseek(modelId);
  } else {
    // If no appropriate key is available, default to OpenAI
    model = openai(modelId.replace(/^.*?\//, ''));
  }

  return wrapLanguageModel({
    model,
    middleware: customMiddleware,
  });
};
