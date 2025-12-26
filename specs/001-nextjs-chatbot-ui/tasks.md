# Implementation Tasks: Next.js Chatbot UI for RAG System

**Feature**: Next.js Chatbot UI for RAG System
**Branch**: `1-nextjs-chatbot-ui`
**Date**: 2025-12-26
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Summary

Create minimal Next.js chatbot UI with TypeScript and Tailwind CSS. Frontend at `D:\nativ-ai-web\website\frontend` runs on localhost:3000 with text input, submit button, and response display.

**Tech Stack**: Next.js 14+ (App Router), TypeScript 5+, React 18+, Tailwind CSS 3.3+
**Components**: ChatContainer (state), ChatInput (input), ResponseDisplay (display), ErrorMessage (errors)
**State**: React useState (no external state library)

## Implementation Strategy

**MVP Scope**: User Story 1 + User Story 2 (Phases 1-4)
- Delivers core functionality: submit query, see response, validation
- Independently testable without backend
- Production-ready for UI testing

**Incremental Delivery**:
1. Phase 1-2: Setup + foundation
2. Phase 3-4: US1 + US2 (MVP - core UI functionality)
3. Phase 5: US3 (responsive design)
4. Phase 6: Polish

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
                                             ↓
                                         MVP Complete
```

**User Story Dependencies**:
- US1 (P1): No dependencies - can start after Phase 2
- US2 (P1): Depends on US1 (enhances existing UI)
- US3 (P2): Depends on US1+US2 (adds responsive styling)

## Phase 1: Setup

**Goal**: Initialize Next.js project with TypeScript and Tailwind CSS

- [X] T001 Initialize Next.js project with create-next-app at D:\nativ-ai-web\website\frontend (TypeScript, Tailwind, App Router, ESLint)
- [X] T002 Verify dev server starts successfully on localhost:3000 with `npm run dev`
- [X] T003 Configure TypeScript strict mode in tsconfig.json and verify path alias @/*

## Phase 2: Foundation

**Goal**: Core infrastructure that all user stories depend on

- [X] T004 [P] Create types/chat.ts with all TypeScript interfaces (ChatQuery, ChatState, ChatResponse, Citation, ValidationResult, component props)
- [X] T005 [P] Implement lib/validation.ts with validateQuery function (min 1 char, max 1000 chars, trim whitespace)
- [X] T006 Verify TypeScript compilation succeeds with no errors using `npm run build`

## Phase 3: User Story 1 - Submit Query via UI (P1)

**Story Goal**: User can visit localhost:3000, type query, submit, and see query displayed in response section.

**Independent Test Criteria**:
1. Load localhost:3000 → Verify page renders with input field and submit button
2. Type "What is Physical AI?" and click submit → Verify query appears in response section
3. Submit empty query → Verify validation error "Please enter a question"
4. Submit 1001 character query → Verify validation error about character limit
5. Press Enter key in input field → Verify form submits (same as button click)

**Implementation Tasks**:

- [X] T007 [US1] Create components/ErrorMessage.tsx with conditional rendering for validation errors and dismiss button
- [X] T008 [US1] Create components/ChatInput.tsx with controlled input, submit button, Enter key handler, and disabled states
- [X] T009 [US1] Create components/ResponseDisplay.tsx with empty state, loading indicator, and query/response display
- [X] T010 [US1] Create components/ChatContainer.tsx with ChatState management, validation, and submit handler
- [X] T011 [US1] Update app/page.tsx to render ChatContainer component
- [X] T012 [US1] Update app/layout.tsx with metadata (title: "Physical AI Chatbot", description)
- [X] T013 [US1] Verify end-to-end: Load page, submit query, see query displayed in response section

**Acceptance**: User can submit "What is Physical AI?" and see it displayed with timestamp.

## Phase 4: User Story 2 - Clear and Intuitive Interface (P1)

**Story Goal**: UI is self-explanatory, clean, and provides clear visual feedback.

**Independent Test Criteria**:
1. Load page → Verify new user understands they can type and submit a question
2. Focus input field → Verify visual focus state (ring, border color change)
3. Hover submit button → Verify hover state (background color change)
4. Submit query → Verify loading state if applicable (button text changes to "Submitting...")
5. View submitted query → Verify clear visual distinction between query and response areas

**Implementation Tasks**:

- [X] T014 [US2] Add focus states to ChatInput (ring-2 ring-blue-500) and hover states to submit button
- [X] T015 [US2] Add ARIA labels to input field (aria-label="Query input") and submit button (aria-label="Submit query")
- [X] T016 [US2] Enhance ResponseDisplay with distinct visual styling (blue background for query, gray for response)
- [X] T017 [US2] Add placeholder text to input field: "Ask a question about Physical AI..."
- [X] T018 [US2] Add empty state message in ResponseDisplay: "Ask a question to get started"
- [X] T019 [US2] Verify visual feedback: Focus states, hover states, loading indicators, clear query/response distinction

**Acceptance**: New user can submit a query within 10 seconds without instructions. Clear visual feedback for all interactions.

## Phase 5: User Story 3 - Responsive Layout (P2)

**Story Goal**: UI works on desktop, tablet, and mobile screen sizes.

**Independent Test Criteria**:
1. Resize browser to 375px width (mobile) → Verify all elements visible and usable, no horizontal scroll
2. Resize to 768px width (tablet) → Verify layout adapts appropriately
3. Resize to 1920px width (desktop) → Verify content is centered and max-width applied
4. Test on actual mobile device → Verify touch-friendly input and button sizes

**Implementation Tasks**:

- [X] T020 [US3] Add responsive classes to ChatContainer (max-w-3xl mx-auto for centering, p-6 for padding)
- [X] T021 [US3] Add responsive input/button layout (flex gap-2, stack on mobile if needed with sm: breakpoint)
- [X] T022 [US3] Add responsive typography (text-3xl on desktop, text-2xl on mobile with sm: prefix)
- [X] T023 [US3] Test responsive design: Mobile (375px), Tablet (768px), Desktop (1920px)
- [X] T024 [US3] Verify keyboard navigation works on all screen sizes (Tab, Enter)

**Acceptance**: UI remains usable and visually appealing on all screen sizes without horizontal scrolling.

## Phase 6: Polish & Cross-Cutting

**Goal**: Production readiness, browser compatibility, and documentation

- [X] T025 Add README.md in frontend/ with setup instructions (npm install, npm run dev, port 3000)
- [X] T026 [P] Test cross-browser compatibility (Chrome, Firefox, Safari, Edge latest versions)
- [X] T027 [P] Verify no console errors in browser dev tools during normal usage
- [X] T028 Create production build with `npm run build` and verify no errors or warnings
- [X] T029 Document component props with TSDoc comments in all component files

## Parallel Execution Opportunities

**Phase 2 (Foundation)**:
- T004 (types) + T005 (validation) can run in parallel

**Phase 3 (US1)**:
- T007 (ErrorMessage) + T008 (ChatInput) + T009 (ResponseDisplay) can be built in parallel
- T010 (ChatContainer) depends on T007-T009 completing

**Phase 4 (US2)**:
- T014 (focus states) + T015 (ARIA) + T016 (visual styling) + T017 (placeholder) can run in parallel

**Phase 5 (US3)**:
- T020 (container responsive) + T021 (input responsive) + T022 (typography responsive) can run in parallel

**Phase 6 (Polish)**:
- T026 (browser testing) + T027 (console check) can run in parallel with T025 (README)

## Task Summary

**Total Tasks**: 29

**By Phase**:
- Setup: 3 tasks
- Foundation: 3 tasks
- US1 (P1): 7 tasks (MVP scope)
- US2 (P1): 6 tasks (MVP scope)
- US3 (P2): 5 tasks
- Polish: 5 tasks

**By User Story**:
- US1: 7 tasks (core submit functionality)
- US2: 6 tasks (UX enhancements)
- US3: 5 tasks (responsive design)
- Infrastructure: 11 tasks (setup + foundation + polish)

**Parallel Tasks**: 11 marked with [P]

**MVP Delivery**: Complete Phases 1-4 (19 tasks) for production-ready core UI functionality

## File Creation Order

**Foundation** (Phase 1-2):
1. Project initialization (T001)
2. types/chat.ts (T004)
3. lib/validation.ts (T005)

**Components** (Phase 3-4):
4. components/ErrorMessage.tsx (T007)
5. components/ChatInput.tsx (T008)
6. components/ResponseDisplay.tsx (T009)
7. components/ChatContainer.tsx (T010)

**Integration** (Phase 3-4):
8. app/page.tsx (T011)
9. app/layout.tsx (T012)

**Enhancement** (Phase 5-6):
10. Responsive refinements (T020-T022)
11. Documentation (T025, T029)

## Testing Checklist

### Manual Functional Tests (US1)
- [ ] Page loads at localhost:3000 without errors
- [ ] Input field accepts text
- [ ] Submit button is clickable
- [ ] Valid query displays in response section
- [ ] Empty query shows error message
- [ ] Long query (1000+ chars) shows error message
- [ ] Enter key submits form
- [ ] Input clears after successful submission

### UX Tests (US2)
- [ ] Input focus shows visual feedback (blue ring)
- [ ] Button hover shows visual feedback (darker background)
- [ ] Placeholder text is visible and clear
- [ ] Empty state message displays before first query
- [ ] Query and response areas are visually distinct
- [ ] Error message can be dismissed

### Responsive Tests (US3)
- [ ] Mobile (375px): All elements visible, no horizontal scroll
- [ ] Tablet (768px): Layout adapts appropriately
- [ ] Desktop (1920px): Content centered with max-width
- [ ] Keyboard navigation works on all sizes

### Cross-Browser Tests (Polish)
- [ ] Chrome (latest): All features work
- [ ] Firefox (latest): All features work
- [ ] Safari (latest): All features work
- [ ] Edge (latest): All features work

### Build & Quality Tests
- [ ] TypeScript compilation succeeds (no errors)
- [ ] ESLint runs without warnings
- [ ] Production build completes successfully
- [ ] No console errors during usage
- [ ] Bundle size is reasonable (< 100KB gzipped)

## Success Metrics

**Development Success**:
- [ ] `npm run dev` starts server on localhost:3000
- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings

**Functional Success**:
- [ ] User can submit valid query and see it displayed
- [ ] Empty query validation works
- [ ] Long query validation works
- [ ] Keyboard navigation (Tab, Enter) works
- [ ] Visual feedback on all interactions

**Quality Success**:
- [ ] All components have TypeScript types
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Cross-browser compatibility verified
- [ ] No console errors in browser dev tools

## Notes

**No Backend Integration**: This phase focuses solely on UI. Backend integration (connecting to FastAPI at localhost:8000) will be added in a future phase.

**No Testing Framework**: Manual testing only for MVP. Jest + React Testing Library can be added in future phase if needed.

**Future Enhancements** (out of scope):
- Backend API integration
- Chat history display
- Markdown rendering for responses
- Copy-to-clipboard functionality
- Dark mode toggle
