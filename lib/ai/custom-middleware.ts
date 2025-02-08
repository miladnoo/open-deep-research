import type { Experimental_LanguageModelV1Middleware } from 'ai';

// Using experimental middleware as per ai SDK v4.1.16
export const customMiddleware = {
  experimental_modifyRequest(request: any) {
    // Add OpenRouter specific headers if using OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      return {
        ...request,
        headers: {
          ...request.headers,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Open Deep Research',
        },
      };
    }
    return request;
  }
} as Experimental_LanguageModelV1Middleware;
