# Quickstart Guide: Next.js Chatbot UI

**Feature**: Next.js Chatbot UI for RAG System
**Time to complete**: ~30 minutes
**Prerequisites**: Node.js v18+, npm

## Overview

This guide walks you through setting up and running the minimal Next.js chatbot UI locally. You'll have a working chatbot interface running on localhost:3000 by the end.

## Step 1: Initialize Next.js Project (5 minutes)

Navigate to the website directory and create the Next.js application:

```bash
cd D:\nativ-ai-web\website
npx create-next-app@latest frontend
```

**Configuration prompts** (select these options):
```
✔ Would you like to use TypeScript? › Yes
✔ Would you like to use ESLint? › Yes
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like to use `src/` directory? › No
✔ Would you like to use App Router? › Yes
✔ Would you like to customize the default import alias (@/*)? › No
```

**Expected output**:
```
Creating a new Next.js app in D:\nativ-ai-web\website\frontend...
Installing dependencies...
Success! Created frontend at D:\nativ-ai-web\website\frontend
```

## Step 2: Verify Installation (2 minutes)

Navigate into the frontend directory and start the development server:

```bash
cd frontend
npm run dev
```

**Expected output**:
```
 ▲ Next.js 14.x.x
 - Local:        http://localhost:3000
 - Environments: .env

 ✓ Ready in 1.2s
```

Open your browser to http://localhost:3000 and verify you see the default Next.js welcome page.

**Stop the server** with `Ctrl+C` before continuing.

## Step 3: Create Type Definitions (3 minutes)

Create the types directory and define TypeScript interfaces:

```bash
mkdir types
```

Create `types/chat.ts`:

```typescript
export interface ChatQuery {
  text: string;
  timestamp: number;
}

export interface ChatResponse {
  text: string;
  citations?: Citation[];
  timestamp: number;
}

export interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}

export interface ChatState {
  query: string;
  isSubmitting: boolean;
  error: string | null;
  submittedQuery: ChatQuery | null;
  response: ChatResponse | null;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export interface ResponseDisplayProps {
  query: ChatQuery | null;
  response: ChatResponse | null;
  isLoading: boolean;
}

export interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
}
```

## Step 4: Create Validation Utility (2 minutes)

Create the lib directory and implement validation:

```bash
mkdir lib
```

Create `lib/validation.ts`:

```typescript
import { ValidationResult } from '@/types/chat';

const MIN_QUERY_LENGTH = 1;
const MAX_QUERY_LENGTH = 1000;

export function validateQuery(query: string): ValidationResult {
  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return {
      isValid: false,
      error: 'Please enter a question'
    };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Question must be less than ${MAX_QUERY_LENGTH} characters`
    };
  }

  return {
    isValid: true,
    error: null
  };
}
```

## Step 5: Create Components (10 minutes)

Create the components directory:

```bash
mkdir components
```

### ErrorMessage Component

Create `components/ErrorMessage.tsx`:

```typescript
'use client';

import { ErrorMessageProps } from '@/types/chat';

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-red-800 text-sm">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 ml-4"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

### ChatInput Component

Create `components/ChatInput.tsx`:

```typescript
'use client';

import { ChatInputProps } from '@/types/chat';

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || isSubmitting}
          placeholder="Ask a question about Physical AI..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          maxLength={1000}
          aria-label="Query input"
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Submit query"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
```

### ResponseDisplay Component

Create `components/ResponseDisplay.tsx`:

```typescript
'use client';

import { ResponseDisplayProps } from '@/types/chat';

export default function ResponseDisplay({
  query,
  response,
  isLoading
}: ResponseDisplayProps) {
  if (!query) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Ask a question to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Query */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-600 font-semibold mb-1">Your Question:</p>
        <p className="text-gray-800">{query.text}</p>
        <p className="text-xs text-gray-500 mt-2">
          {new Date(query.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* Response or Loading */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 font-semibold mb-1">Response:</p>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-gray-600">Processing...</p>
          </div>
        ) : response ? (
          <p className="text-gray-800">{response.text}</p>
        ) : (
          <p className="text-gray-500 italic">
            Waiting for backend integration... (showing placeholder)
          </p>
        )}
      </div>
    </div>
  );
}
```

### ChatContainer Component

Create `components/ChatContainer.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ChatState, ChatQuery } from '@/types/chat';
import { validateQuery } from '@/lib/validation';
import ChatInput from './ChatInput';
import ResponseDisplay from './ResponseDisplay';
import ErrorMessage from './ErrorMessage';

export default function ChatContainer() {
  const [state, setState] = useState<ChatState>({
    query: '',
    isSubmitting: false,
    error: null,
    submittedQuery: null,
    response: null
  });

  const handleQueryChange = (text: string) => {
    setState({ ...state, query: text, error: null });
  };

  const handleSubmit = () => {
    const validation = validateQuery(state.query);

    if (!validation.isValid) {
      setState({ ...state, error: validation.error });
      return;
    }

    const chatQuery: ChatQuery = {
      text: state.query.trim(),
      timestamp: Date.now()
    };

    setState({
      ...state,
      isSubmitting: false,
      submittedQuery: chatQuery,
      error: null,
      query: '' // Clear input after submission
    });
  };

  const resetError = () => {
    setState({ ...state, error: null });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Physical AI Chatbot
        </h1>
        <p className="text-gray-600">
          Ask questions about Physical AI and robotics
        </p>
      </div>

      <div className="space-y-6">
        <ErrorMessage message={state.error} onDismiss={resetError} />

        <ChatInput
          value={state.query}
          onChange={handleQueryChange}
          onSubmit={handleSubmit}
          isSubmitting={state.isSubmitting}
        />

        <ResponseDisplay
          query={state.submittedQuery}
          response={state.response}
          isLoading={state.isSubmitting}
        />
      </div>
    </div>
  );
}
```

## Step 6: Update Main Page (2 minutes)

Replace the content of `app/page.tsx`:

```typescript
import ChatContainer from '@/components/ChatContainer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-8">
      <ChatContainer />
    </main>
  );
}
```

Update `app/layout.tsx` metadata (optional):

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physical AI Chatbot',
  description: 'Ask questions about Physical AI and robotics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Step 7: Start Development Server (1 minute)

Start the dev server and test the application:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 8: Test the UI (5 minutes)

Perform the following tests:

### Functional Tests

1. **Submit valid query**:
   - Type "What is Physical AI?" in the input field
   - Click Submit button
   - ✅ Verify query appears in the response section with timestamp
   - ✅ Verify input field is cleared after submission

2. **Test validation - empty query**:
   - Submit without typing anything
   - ✅ Verify error message "Please enter a question" appears
   - ✅ Verify error can be dismissed by clicking ✕

3. **Test validation - long query**:
   - Paste text longer than 1000 characters
   - Try to submit
   - ✅ Verify error message about character limit appears

4. **Test keyboard navigation**:
   - Press Tab to focus input field
   - Type a query
   - Press Enter
   - ✅ Verify form submits (same as clicking button)

### Responsive Tests

5. **Desktop view** (resize browser to 1920x1080):
   - ✅ Verify content is centered
   - ✅ Verify max-width constraint (3xl = 48rem)

6. **Mobile view** (resize to 375x667):
   - ✅ Verify input and button stack responsively
   - ✅ Verify text is readable
   - ✅ Verify no horizontal scrolling

### Browser Tests

7. **Cross-browser**:
   - Test in Chrome ✅
   - Test in Firefox ✅
   - Test in Edge ✅
   - Test in Safari (if available) ✅

## Troubleshooting

### Port 3000 already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Either kill the process using port 3000, or use a different port:
```bash
PORT=3001 npm run dev
```

### TypeScript errors

**Error**: `Cannot find module '@/types/chat'`

**Solution**: Verify `tsconfig.json` has the paths configuration:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind styles not working

**Error**: Input/button have no styling

**Solution**:
1. Verify `app/globals.css` includes Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. Check `tailwind.config.ts` has correct content paths:
```typescript
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
],
```

## Next Steps

### Backend Integration (Future Phase)

To connect this frontend to the FastAPI backend (from `api.py`):

1. Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. Create `lib/api.ts`:
```typescript
export async function submitQuery(query: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }
  );
  return response.json();
}
```

3. Update `ChatContainer` handleSubmit to call the API

### Additional Features

- Add chat history display
- Add markdown rendering for responses
- Add copy-to-clipboard button
- Add dark mode toggle
- Add loading skeletons

---

**Quickstart Complete!**

You now have a working Next.js chatbot UI running on localhost:3000.

**Time spent**: ~30 minutes
**Next**: Run `/sp.tasks` to generate detailed implementation tasks
