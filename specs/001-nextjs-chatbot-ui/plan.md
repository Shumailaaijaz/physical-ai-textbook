# Implementation Plan: Next.js Chatbot UI for RAG System

**Feature**: Next.js Chatbot UI for RAG System
**Branch**: `1-nextjs-chatbot-ui`
**Spec**: [spec.md](./spec.md)
**Created**: 2025-12-26

## Executive Summary

Create a minimal, standalone Next.js chatbot UI using App Router and TypeScript. The frontend provides a clean interface with text input, submit button, and response display section. This phase focuses solely on UI functionality without backend integration.

**Technology Stack**:
- Next.js 14+ (App Router)
- TypeScript 5+
- React 18+
- Tailwind CSS (for rapid development and responsive design)
- ESLint + Prettier (code quality)

**Location**: `D:\nativ-ai-web\website\frontend`
**Port**: localhost:3000

## Technical Context

### Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main chatbot page
│   ├── globals.css          # Global styles (Tailwind imports)
│   └── favicon.ico          # Favicon
├── components/
│   ├── ChatContainer.tsx    # Main container component
│   ├── ChatInput.tsx        # Text input + submit button
│   ├── ResponseDisplay.tsx  # Query/response display area
│   └── ErrorMessage.tsx     # Error notification component
├── types/
│   └── chat.ts              # TypeScript interfaces/types
├── lib/
│   └── validation.ts        # Input validation utilities
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .eslintrc.json
└── .gitignore
```

### Architecture Decisions

**1. State Management**:
- **Decision**: Use React useState hooks (no external state library)
- **Rationale**:
  - Simple UI with minimal state (query text, loading, error)
  - No complex state transitions or global state needed
  - useState provides sufficient reactivity for form handling
- **Alternatives considered**:
  - Zustand: Overkill for 3-4 state variables
  - Redux: Too heavy for simple chatbot UI
  - Context API: Not needed without component tree depth

**2. Styling Framework**:
- **Decision**: Tailwind CSS
- **Rationale**:
  - Rapid development with utility-first approach
  - Built-in responsive design utilities
  - No custom CSS file management
  - Excellent TypeScript support
- **Alternatives considered**:
  - CSS Modules: More boilerplate, harder to maintain responsive breakpoints
  - Styled-components: Runtime overhead, not needed for static styles
  - Plain CSS: Requires manual responsive design, more maintenance

**3. Form Handling**:
- **Decision**: Native React form with controlled components
- **Rationale**:
  - Simple form with one input field
  - Built-in validation via HTML5 + custom logic
  - No need for react-hook-form complexity
- **Alternatives considered**:
  - react-hook-form: Overkill for single input
  - Formik: Legacy library, heavier bundle

**4. Component Architecture**:
- **Decision**: Composition pattern with 4 main components
- **Rationale**:
  - Clear separation of concerns (input, display, error, container)
  - Easy to test each component independently
  - Reusable components for future features
- **Components**:
  - `ChatContainer`: Manages state and coordinates child components
  - `ChatInput`: Handles user input and validation
  - `ResponseDisplay`: Shows submitted query and placeholder response
  - `ErrorMessage`: Displays validation/error messages

### Technology Choices

**Next.js App Router vs Pages Router**:
- Using App Router (Next.js 13+) per requirements
- Benefits: Server components by default, improved performance, better TypeScript support
- Trade-off: Client-side state requires 'use client' directive

**TypeScript Configuration**:
- Strict mode enabled for type safety
- Path aliases (@/ for imports)
- React JSX transform

**Development Tools**:
- ESLint with Next.js config
- Prettier for code formatting
- Husky + lint-staged for pre-commit hooks (optional, not blocking)

## Constitution Check

### Code Quality Principles

✅ **Testability**: Each component is pure and testable
- ChatInput: Test validation logic, submit handling
- ResponseDisplay: Test rendering of query/response data
- ErrorMessage: Test conditional rendering of errors

✅ **Separation of Concerns**:
- UI components separate from validation logic (lib/validation.ts)
- Type definitions in dedicated types/ directory
- No business logic mixed with presentation

✅ **Type Safety**:
- All components fully typed with TypeScript
- No 'any' types allowed
- Strict null checks enabled

### Performance

✅ **Bundle Size**:
- Tailwind CSS purges unused styles in production
- No heavy dependencies (no date libraries, no state management libs)
- Expected bundle: < 100KB (gzipped)

✅ **Rendering**:
- Server components where possible (layout, static content)
- Client components only for interactive elements (ChatContainer)
- No unnecessary re-renders (proper React key usage)

### Security

✅ **Input Validation**:
- XSS prevention via React's automatic escaping
- Input sanitization (max length, trim whitespace)
- No dangerouslySetInnerHTML usage

✅ **No Sensitive Data**:
- No API keys or secrets in frontend code
- No authentication logic (per requirements)
- No localStorage/sessionStorage (per constraints)

### Architecture

✅ **Maintainability**:
- Clear folder structure (components/, lib/, types/)
- Consistent naming conventions (PascalCase components, camelCase functions)
- Self-documenting code with TSDoc comments

✅ **Scalability**:
- Component architecture allows easy addition of features
- Types defined separately for reusability
- Validation logic isolated for testing/extension

## Phase 0: Research & Technical Decisions

### Research Summary

**1. Next.js 14 App Router Best Practices**:
- Use 'use client' directive for components with state/events
- Co-locate components with their page in app/ directory initially
- Move to components/ directory when reused
- Use TypeScript for all files
- Reference: [Next.js App Router Documentation](https://nextjs.org/docs/app)

**2. Form Validation Patterns**:
- Client-side validation for immediate feedback
- HTML5 attributes (required, maxLength) as first line of defense
- JavaScript validation for complex rules (trim, special characters)
- Display errors inline near input field
- Reference: [React Forms Best Practices](https://react.dev/learn/reacting-to-input-with-state)

**3. Accessibility Standards**:
- ARIA labels for screen readers
- Keyboard navigation (Tab, Enter to submit)
- Focus states for interactive elements
- Semantic HTML (form, button, input)
- Reference: [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

**4. Responsive Design Breakpoints (Tailwind CSS)**:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)
- Use Tailwind responsive prefixes (sm:, md:, lg:)
- Mobile-first approach

**5. TypeScript in Next.js App Router**:
- All files use .tsx extension
- Enable strict mode in tsconfig.json
- Use interface for props, type for unions
- Define return types for functions
- Reference: [Next.js TypeScript Guide](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

### Dependencies Analysis

**Production Dependencies**:
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

**Development Dependencies**:
```json
{
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "^20.0.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0"
}
```

**Rationale for minimal dependencies**:
- No state management library (useState sufficient)
- No form library (simple form with one input)
- No UI component library (custom components with Tailwind)
- No date/time libraries (not needed for this phase)
- No testing libraries in initial MVP (can add later)

## Phase 1: Data Model & Contracts

### Data Model

**File**: `types/chat.ts`

```typescript
/**
 * User's submitted query
 */
export interface ChatQuery {
  text: string;            // Query text (1-1000 characters)
  timestamp: number;       // Submission timestamp (Date.now())
}

/**
 * Response from backend (placeholder for future)
 */
export interface ChatResponse {
  text: string;            // Response text from backend
  citations?: Citation[];  // Optional citations (future)
  timestamp: number;       // Response timestamp
}

/**
 * Citation metadata (future use)
 */
export interface Citation {
  chapter: string | null;
  section: string | null;
  source_url: string | null;
  referenced_text: string | null;
}

/**
 * UI state for chat interface
 */
export interface ChatState {
  query: string;           // Current input text
  isSubmitting: boolean;   // Loading state during submission
  error: string | null;    // Error message (null if no error)
  submittedQuery: ChatQuery | null;  // Last submitted query
  response: ChatResponse | null;     // Backend response (null initially)
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}
```

**Entity Relationships**:
- ChatState contains optional ChatQuery and ChatResponse
- ChatResponse may contain multiple Citations
- ValidationResult is independent utility type

**State Transitions**:
```
Initial → User typing → Validating → Submitting → Success/Error
  ↓                                                    ↓
  Empty query                                    Show result
  isSubmitting: false                            isSubmitting: false
  error: null                                    error: null or string
  submittedQuery: null                           submittedQuery: ChatQuery
  response: null                                 response: null (no backend yet)
```

### Validation Rules

**File**: `lib/validation.ts`

```typescript
import { ValidationResult } from '@/types/chat';

const MIN_QUERY_LENGTH = 1;
const MAX_QUERY_LENGTH = 1000;

/**
 * Validate user query input
 */
export function validateQuery(query: string): ValidationResult {
  // Trim whitespace
  const trimmed = query.trim();

  // Check empty
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return {
      isValid: false,
      error: 'Please enter a question'
    };
  }

  // Check max length
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

### Component Contracts

#### ChatContainer (Main Component)

**Props**: None (root component)

**State**:
```typescript
const [state, setState] = useState<ChatState>({
  query: '',
  isSubmitting: false,
  error: null,
  submittedQuery: null,
  response: null
});
```

**Methods**:
- `handleQueryChange(text: string): void` - Update query state
- `handleSubmit(): void` - Validate and submit query
- `resetError(): void` - Clear error message

#### ChatInput

**Props**:
```typescript
interface ChatInputProps {
  value: string;                      // Current query text
  onChange: (text: string) => void;   // Text change handler
  onSubmit: () => void;               // Submit handler
  isSubmitting: boolean;              // Loading state
  disabled?: boolean;                 // Disable input (optional)
}
```

**Events**:
- Input change → calls onChange
- Submit button click → calls onSubmit
- Enter key press → calls onSubmit

#### ResponseDisplay

**Props**:
```typescript
interface ResponseDisplayProps {
  query: ChatQuery | null;      // Submitted query
  response: ChatResponse | null; // Backend response
  isLoading: boolean;            // Show loading indicator
}
```

**Rendering Logic**:
- No query: Show empty state ("Ask a question to get started")
- Query submitted: Show query + loading indicator
- Response received: Show query + response (future)

#### ErrorMessage

**Props**:
```typescript
interface ErrorMessageProps {
  message: string | null;  // Error text
  onDismiss?: () => void;  // Optional dismiss handler
}
```

**Rendering**:
- Null message: Render nothing
- Non-null message: Show error with dismiss button

## Phase 2: API Integration Plan (Future)

### Backend Integration (Out of Scope for Current Phase)

This phase focuses solely on UI. Backend integration will be added in a future phase via:

1. **API Client Module** (`lib/api.ts`):
```typescript
// Future implementation
export async function submitQuery(query: string): Promise<ChatResponse> {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return response.json();
}
```

2. **Update ChatContainer**:
- Replace placeholder submission with actual API call
- Handle loading states and errors
- Display real backend responses

3. **Environment Configuration**:
- Add NEXT_PUBLIC_API_URL to .env.local
- Configure CORS for localhost:3000

**Current Phase**: Submit handler shows query in ResponseDisplay without backend call.

## Development Workflow

### Setup Steps

1. **Initialize Next.js Project**:
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --eslint
cd frontend
```

Options selected:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: @/* (default)

2. **Install Dependencies** (if needed):
```bash
npm install
```

3. **Configure TypeScript**:
- Verify `tsconfig.json` has strict mode enabled
- Add path alias for @/ to app/

4. **Start Development Server**:
```bash
npm run dev
```
- Server runs on localhost:3000
- Hot reload enabled

### File Creation Order

**Phase 1: Foundation**
1. `types/chat.ts` - Define all TypeScript interfaces
2. `lib/validation.ts` - Implement validation logic
3. `app/globals.css` - Set up Tailwind imports

**Phase 2: Components**
4. `components/ErrorMessage.tsx` - Error display component
5. `components/ChatInput.tsx` - Input and submit button
6. `components/ResponseDisplay.tsx` - Query/response display
7. `components/ChatContainer.tsx` - Main container with state

**Phase 3: Integration**
8. `app/page.tsx` - Integrate ChatContainer into main page
9. `app/layout.tsx` - Configure metadata and global styles

**Phase 4: Polish**
10. Add responsive design refinements
11. Test keyboard accessibility
12. Verify cross-browser compatibility

### Testing Strategy (Manual for MVP)

**Functional Testing**:
1. Load localhost:3000 → Verify page loads without errors
2. Type query → Verify input updates
3. Submit empty → Verify error message
4. Submit valid query → Verify query appears in response area
5. Submit 1000+ chars → Verify max length validation

**Responsive Testing**:
1. Desktop (1920x1080) → Verify centered layout
2. Tablet (768x1024) → Verify responsive breakpoints
3. Mobile (375x667) → Verify touch-friendly inputs

**Accessibility Testing**:
1. Tab navigation → Verify focus states
2. Enter key → Verify form submission
3. Screen reader → Verify ARIA labels (manual with browser tools)

**Browser Testing**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Build & Deployment (Future)

**Production Build**:
```bash
npm run build
npm run start
```

**Deployment Options** (not in current scope):
- Vercel (recommended for Next.js)
- Netlify
- Docker container
- Self-hosted Node.js server

## Implementation Checklist

### Prerequisites
- [ ] Node.js v18+ installed
- [ ] npm or yarn available
- [ ] Port 3000 not in use
- [ ] Text editor with TypeScript support

### Phase 1: Project Setup
- [ ] Run `create-next-app` with TypeScript + Tailwind
- [ ] Verify dev server starts on localhost:3000
- [ ] Configure tsconfig.json for strict mode
- [ ] Set up ESLint configuration

### Phase 2: Foundation
- [ ] Create `types/chat.ts` with all interfaces
- [ ] Implement `lib/validation.ts` with query validation
- [ ] Configure Tailwind CSS in `app/globals.css`

### Phase 3: Components
- [ ] Build `ErrorMessage.tsx` component
- [ ] Build `ChatInput.tsx` with controlled input
- [ ] Build `ResponseDisplay.tsx` with conditional rendering
- [ ] Build `ChatContainer.tsx` with state management

### Phase 4: Integration
- [ ] Update `app/page.tsx` to use ChatContainer
- [ ] Configure `app/layout.tsx` metadata
- [ ] Add responsive design classes
- [ ] Test keyboard accessibility

### Phase 5: Validation
- [ ] Manual functional testing (submit, validation, display)
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility testing (keyboard nav, screen reader labels)

### Phase 6: Documentation
- [ ] Add README.md with setup instructions
- [ ] Document component props in TSDoc comments
- [ ] Create DEVELOPMENT.md with workflow guide

## Risk Assessment

### Technical Risks

**R1: Port 3000 already in use**
- **Impact**: Medium - Cannot start dev server
- **Mitigation**: Check running processes, use alternative port via `PORT=3001 npm run dev`

**R2: TypeScript compilation errors**
- **Impact**: Low - Well-defined types reduce runtime errors
- **Mitigation**: Enable strict mode, use ESLint, frequent type checking

**R3: Browser compatibility issues**
- **Impact**: Low - Modern Next.js handles polyfills
- **Mitigation**: Test on target browsers, use Next.js built-in compatibility features

**R4: Tailwind CSS purge removes needed styles**
- **Impact**: Low - Production build may miss custom classes
- **Mitigation**: Use standard Tailwind classes, test production build before deployment

### Scope Risks

**S1: Feature creep (adding backend integration prematurely)**
- **Impact**: High - Increases complexity beyond spec
- **Mitigation**: Strict adherence to FR-009 (no backend logic), use placeholder responses

**S2: Over-engineering state management**
- **Impact**: Medium - Unnecessary complexity
- **Mitigation**: Use simple useState, avoid external state libraries

## Success Metrics

**Development Success**:
- [ ] `npm run dev` starts server without errors
- [ ] localhost:3000 loads in < 2 seconds
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings (or documented exceptions)

**Functional Success**:
- [ ] User can submit valid query and see it displayed
- [ ] Empty query shows error message
- [ ] 1000+ character query shows error message
- [ ] Submit button shows loading state (if applicable)

**Quality Success**:
- [ ] All components have TypeScript interfaces
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Tab/Enter keyboard navigation works
- [ ] No console errors in browser dev tools

## Next Steps After Implementation

1. **Backend Integration** (Future Phase):
   - Add API client module
   - Connect to FastAPI backend at localhost:8000
   - Handle real responses and citations

2. **Enhanced Features** (Future Phases):
   - Chat history display
   - Markdown rendering for responses
   - Copy-to-clipboard for responses
   - Dark mode toggle

3. **Testing** (Future Phase):
   - Add Jest + React Testing Library
   - Unit tests for components
   - Integration tests for user flows

4. **Deployment** (Future Phase):
   - Configure production build
   - Deploy to Vercel or similar platform
   - Set up CI/CD pipeline

---

**Plan Status**: Complete - Ready for `/sp.tasks`
**Last Updated**: 2025-12-26
