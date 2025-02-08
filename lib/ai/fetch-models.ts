import axios from 'axios';
import { Model, ModelCategory, providers, updateModels } from './models';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

// Helper function to determine model category
function getModelCategory(modelId: string): ModelCategory {
  if (modelId.includes('gpt-4') || modelId.includes('claude-3') || modelId.includes('gemini-1')) {
    return ModelCategory.LATEST;
  }
  if (modelId.includes('gpt-3.5') || modelId.includes('mistral') || modelId.includes('claude-2')) {
    return ModelCategory.EFFICIENT;
  }
  if (modelId.includes('code') || modelId.includes('python') || modelId.includes('instruct')) {
    return ModelCategory.SPECIALIZED;
  }
  if (modelId.includes('llama') || modelId.includes('mixtral') || modelId.includes('yi') || modelId.includes('falcon')) {
    return ModelCategory.OPENSOURCE;
  }
  // Default to LATEST for unknown models
  return ModelCategory.LATEST;
}

// Helper function to generate tags
function generateTags(model: OpenRouterModel): string[] {
  const tags: string[] = [];
  const id = model.id.toLowerCase();

  if (id.includes('vision')) tags.push('vision');
  if (id.includes('code') || id.includes('python')) tags.push('coding');
  if (id.includes('gpt-4') || id.includes('claude')) tags.push('reasoning');
  if (id.includes('gpt-3.5') || id.includes('mistral')) tags.push('fast');
  if (id.includes('llama') || id.includes('mixtral') || id.includes('yi')) tags.push('open-source');
  if (model.context_length >= 32000) tags.push('high-context');

  return tags;
}

export async function fetchAndUpdateModels() {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models');
    const openRouterModels = response.data.data;
    
    // Sort by context length to show most capable first
    openRouterModels.sort((a: OpenRouterModel, b: OpenRouterModel) => b.context_length - a.context_length);
    
    // Convert to our Model format
    const modelList: Model[] = openRouterModels.map((model: OpenRouterModel) => {
      const [providerId, modelName] = model.id.split('/');
      const category = getModelCategory(model.id);
      const tags = generateTags(model);
      
      const fullId = model.id;
      // Extract model name without provider prefix for ID
      const modelId = fullId.split('/')[1] || fullId;
      
      return {
        id: modelId,
        label: model.name,
        apiIdentifier: model.id,
        description: model.description || `${model.name} by ${providerId}`,
        category,
        provider: providers.find(p => p.id === 'openrouter')!,
        contextWindow: model.context_length,
        pricing: {
          prompt: parseFloat(model.pricing.prompt),
          completion: parseFloat(model.pricing.completion)
        },
        capabilities: {
          vision: model.id.includes('vision'),
          streaming: true,
          functions: ['gpt-4', 'gpt-3.5'].some(m => model.id.includes(m)),
          jsonValidation: ['gpt-4', 'gpt-3.5', 'claude'].some(m => model.id.includes(m))
        },
        tags
      };
    });

    // Update the models array
    updateModels(modelList);
    
    return modelList;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}
