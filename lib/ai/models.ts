import { z } from 'zod';

// Provider type definition
export interface Provider {
  id: string;
  name: string;
  description: string;
  website: string;
  capabilities: {
    streaming: boolean;
    functions: boolean;
    jsonValidation: boolean;
  };
}

// Provider definitions
export const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Leading AI research company',
    website: 'https://openai.com',
    capabilities: {
      streaming: true,
      functions: true,
      jsonValidation: true
    }
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Advanced AI systems with strong safety focus',
    website: 'https://anthropic.com',
    capabilities: {
      streaming: true,
      functions: false,
      jsonValidation: true
    }
  },
  {
    id: 'google',
    name: 'Google',
    description: 'State-of-the-art language models',
    website: 'https://ai.google.dev',
    capabilities: {
      streaming: true,
      functions: true,
      jsonValidation: true
    }
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Efficient and powerful open models',
    website: 'https://mistral.ai',
    capabilities: {
      streaming: true,
      functions: false,
      jsonValidation: false
    }
  },
  {
    id: 'meta',
    name: 'Meta AI',
    description: 'Open source language models',
    website: 'https://ai.meta.com',
    capabilities: {
      streaming: true,
      functions: false,
      jsonValidation: false
    }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Specialized in code and reasoning',
    website: 'https://deepseek.ai',
    capabilities: {
      streaming: true,
      functions: false,
      jsonValidation: false
    }
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Enterprise-focused language models',
    website: 'https://cohere.ai',
    capabilities: {
      streaming: true,
      functions: true,
      jsonValidation: true
    }
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Universal API for AI models',
    website: 'https://openrouter.ai',
    capabilities: {
      streaming: true,
      functions: true,
      jsonValidation: true
    }
  }
];

// Model categories for better organization
export enum ModelCategory {
  LATEST = 'Latest & Most Capable',
  EFFICIENT = 'Fast & Efficient',
  SPECIALIZED = 'Specialized Models',
  OPENSOURCE = 'Open Source Models'
}

// Extended model interface
export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
  category: ModelCategory;
  provider: Provider;
  contextWindow: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  capabilities: {
    vision: boolean;
    streaming: boolean;
    functions: boolean;
    jsonValidation: boolean;
  };
  tags: string[];
}

// Model definitions with comprehensive OpenRouter catalog
// Initialize empty models array to be populated by fetch-models
export let models: Model[] = [];

// Function to update models array with fetched data
export function updateModels(newModels: Model[]) {
  models = newModels;
}

// Default model ID
export const DEFAULT_MODEL_NAME = 'gpt-4-0125-preview';

// Helper function to get all models for a category
export const getModelsByCategory = (category: ModelCategory) =>
  models.filter(model => model.category === category);

// Helper function to get all models with a specific capability
export const getModelsByCapability = (capability: keyof Model['capabilities']) =>
  models.filter(model => model.capabilities[capability]);

// Helper function to get all models with a specific tag
export const getModelsByTag = (tag: string) =>
  models.filter(model => model.tags.includes(tag));

// Helper function to get all models for a provider
export const getModelsByProvider = (providerId: string) =>
  models.filter(model => model.provider.id === providerId);

// Zod schema for runtime validation
export const ModelSchema = z.object({
  id: z.string(),
  label: z.string(),
  apiIdentifier: z.string(),
  description: z.string(),
  category: z.nativeEnum(ModelCategory),
  provider: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    website: z.string(),
    capabilities: z.object({
      streaming: z.boolean(),
      functions: z.boolean(),
      jsonValidation: z.boolean()
    })
  }),
  contextWindow: z.number(),
  pricing: z.object({
    prompt: z.number(),
    completion: z.number()
  }),
  capabilities: z.object({
    vision: z.boolean(),
    streaming: z.boolean(),
    functions: z.boolean(),
    jsonValidation: z.boolean()
  }),
  tags: z.array(z.string())
});
