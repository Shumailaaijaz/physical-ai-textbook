import axios from 'axios';
import { CHATBOT_API_URL } from '../config';

// Create an axios instance with default configuration
const chatbotApi = axios.create({
  baseURL: CHATBOT_API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle errors and logging
chatbotApi.interceptors.request.use(
  (config) => {
    console.log('Sending request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle responses and errors
chatbotApi.interceptors.response.use(
  (response) => {
    console.log('Received response:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  response: string;
  sources?: Array<{
    title: string;
    url: string;
    content?: string;
  }>;
  context?: any;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  sessionId?: string;
  selected_text?: string; // For RAG with selected text
}

// Function to try different possible endpoints for the chatbot
const tryChatEndpoints = async (request: ChatRequest) => {
  // List of possible endpoints to try
  const endpoints = ['/chat', '/api/chat', '/ask', '/query', '/generate'];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);

      // Transform request format based on endpoint
      let requestBody = request;
      if (endpoint === '/ask') {
        // HuggingFace backend expects {query: string}
        requestBody = { query: request.message } as any;
      }

      const response = await chatbotApi.post(endpoint, requestBody);

      // If successful, return the response
      // Handle different response formats that might come from the backend
      if (response.data) {
        // If the response has a 'response' field, use it
        if (response.data.response) {
          return { response: response.data.response, sources: response.data.sources || [] };
        }
        // If the response has an 'answer' field, use it
        else if (response.data.answer) {
          return { response: response.data.answer, sources: response.data.sources || [] };
        }
        // If the response is a string, return it directly
        else if (typeof response.data === 'string') {
          return { response: response.data, sources: [] };
        }
        // If the response is an object with the result in a different field
        else if (response.data.result) {
          return { response: response.data.result, sources: response.data.sources || [] };
        }
        // Otherwise, return the entire data as response
        else {
          return { response: JSON.stringify(response.data), sources: [] };
        }
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} failed:`, error.message);
      // Continue to next endpoint
      continue;
    }
  }

  // If all endpoints failed, throw an error
  throw new Error('All chat endpoints failed. Please check the backend configuration.');
};

/**
 * Send a chat message to the backend
 */
export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    return await tryChatEndpoints(request);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server Error: ${error.response.status} - ${error.response.data?.detail || error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Network Error: No response received from server. Please check your connection and backend URL.');
      } else {
        // Something else happened
        throw new Error(`Request Error: ${error.message}`);
      }
    }
    throw error;
  }
};

// Function to try different possible health check endpoints
const tryHealthEndpoints = async () => {
  const endpoints = ['/health', '/api/health', '/healthz', '/status', '/'];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying health endpoint: ${endpoint}`);
      const response = await chatbotApi.get(endpoint);
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.log(`Health endpoint ${endpoint} failed:`, error.message);
      continue;
    }
  }
  return false;
};

/**
 * Health check for the chatbot API
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    return await tryHealthEndpoints();
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default chatbotApi;