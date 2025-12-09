import { USE_MOCK_API, getApiBaseUrl } from '@/config';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  response: string;
  sources?: Array<{ title: string; url: string }>;
}

export interface ResearchResponse {
  response: string;
  reasoning: string;
}

// --- Mock Implementation ---

const mockSendMessage = async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); 

  const responses = [
    "That's an interesting question about Physical AI.",
    "Based on Module 1, we define this as the intersection of robotics and ML.",
    "I can certainly help you with that. The key concept here is...",
  ];

  return {
    response: `${responses[Math.floor(Math.random() * responses.length)]} (Mock Response)`,
    sources: []
  };
};

const mockSendSelectedChat = async (selectedText: string, userQuery: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `(Mock) You asked about "${selectedText}". Here is the explanation: ...`;
};

const mockFetchLatest = async (bookSection: string): Promise<ResearchResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    response: `### Recent Breakthroughs in ${bookSection}\n\n*   **Paper A (2024)**: Proposed a new method for sim-to-real transfer.\n*   **Paper B (2025)**: Achieved 500Hz control loops on edge hardware.\n\nThese developments suggest a shift towards...`,
    reasoning: "I searched Arxiv for 'Physical AI' and 'Sim-to-Real' filtered by date > 2024."
  };
};


// --- Real Implementation ---

const realSendMessage = async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
  const payloadHistory = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  const res = await fetch(`${getApiBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: payloadHistory }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Chat API Error:", err);
    throw new Error('Chat request failed');
  }

  const data = await res.json();
  
  return {
    response: typeof data === 'string' ? data : data.response || "No response field",
    sources: data.sources || []
  };
};

const realSendSelectedChat = async (selectedText: string, userQuery: string): Promise<string> => {
  const res = await fetch(`${getApiBaseUrl()}/api/chat/selected`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selected_text: selectedText, 
      user_query: userQuery 
    }),
  });

  if (!res.ok) throw new Error('Selected chat request failed');

  const data = await res.json();
  return typeof data === 'string' ? data : data.response || JSON.stringify(data);
};

const realFetchLatest = async (bookSection: string): Promise<ResearchResponse> => {
  const res = await fetch(`${getApiBaseUrl()}/api/latest-developments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_section: bookSection }),
  });

  if (!res.ok) throw new Error('Research request failed');
  return res.json();
};

// --- Exported Service ---

export const ChatService = {
  sendMessage: USE_MOCK_API ? mockSendMessage : realSendMessage,
  sendSelectedChat: USE_MOCK_API ? mockSendSelectedChat : realSendSelectedChat,
  fetchLatest: USE_MOCK_API ? mockFetchLatest : realFetchLatest,
};