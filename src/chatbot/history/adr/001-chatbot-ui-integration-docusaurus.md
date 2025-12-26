# ADR-001: Chatbot UI Integration Strategy for Docusaurus Textbook

**Status**: Accepted
**Date**: 2025-12-09
**Deciders**: Project Lead, Technical Team
**Context**: Hackathon deliverable for Physical AI & Humanoid Robotics Textbook

## Context and Problem Statement

The Physical AI & Humanoid Robotics textbook is built with Docusaurus and deployed to GitHub Pages. We need to integrate a RAG-powered chatbot that allows students to ask questions about the textbook content while reading. The chatbot must:

1. Be accessible from any page in the textbook
2. Support two interaction modes: general questions (entire textbook) and selected-text questions
3. Not interfere with existing textbook features (personalization, Urdu translation)
4. Provide clickable citations that navigate to textbook sections
5. Be mobile-responsive and accessible

**Key Question**: How should the chatbot UI be integrated into the existing Docusaurus textbook site?

## Existing Textbook Architecture

The textbook currently has:
- **Docusaurus 3.x** with custom React components
- **Custom features**:
  - `AuthProvider` (authentication)
  - `PersonalizationProvider` (difficulty levels: beginner/intermediate/advanced)
  - `UrduTranslate` component (language toggle)
  - MDX components: `<Beginner>`, `<Advanced>`, `<SimulationOnly>`, `<ResearchGrade>`
- **Basic Chatbot component** at `src/components/Chatbot.js` (placeholder, needs replacement)
- **Deployment**: GitHub Pages at `shumailaaijaz.github.io/physical-ai-textbook/`

## Decision Drivers

- **Student experience**: Chatbot should enhance learning without disrupting reading flow
- **Accessibility**: Must work on mobile devices (students read on phones/tablets)
- **Technical feasibility**: Must integrate with existing Docusaurus theme/components
- **Hackathon timeline**: Must be implementable within sprint deadline
- **Maintainability**: Should be modular and replaceable if needed
- **Citation UX**: Clicking citations must scroll to exact textbook paragraph

## Considered Options

### Option 1: Floating Action Button (FAB) + Modal Popup ⭐ SELECTED

**Description**:
- Fixed position button in bottom-right corner (classic chat widget pattern)
- Opens full-screen modal (mobile) or 400x600px popup (desktop)
- Modal overlays textbook content with semi-transparent backdrop
- Uses OpenAI ChatKit React component for chat interface

**Pros**:
- ✅ Familiar UX pattern (used by Intercom, Drift, ChatGPT mobile)
- ✅ Non-intrusive: hidden until user activates
- ✅ Works on mobile (full-screen modal prevents scroll issues)
- ✅ Easy to implement with existing `src/components/Chatbot.js` as base
- ✅ ChatKit SDK provides professional chat UI out-of-the-box
- ✅ Can be used on ANY page (global component)

**Cons**:
- ⚠️ Modal blocks textbook content when open (but can be closed)
- ⚠️ Requires JavaScript (not an issue for Docusaurus)
- ⚠️ Chatbot hidden by default (students must discover it)

**Implementation Details**:
```tsx
// src/theme/Root.tsx (Docusaurus theme swizzling)
import React from 'react';
import ChatbotWidget from '@site/src/components/ChatbotWidget';

export default function Root({children}) {
  return (
    <>
      {children}
      <ChatbotWidget /> {/* Globally available on all pages */}
    </>
  );
}
```

```tsx
// src/components/ChatbotWidget/index.tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedText = useTextSelection(); // Custom hook for text selection

  const { control } = useChatKit({
    api: { url: process.env.REACT_APP_API_URL, domainKey: 'textbook' },
    theme: { colorScheme: 'dark', /* match Docusaurus theme */ },
    onThreadChange: ({threadId}) => localStorage.setItem('chat-thread', threadId),
  });

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="chatbot-fab"
        aria-label="Open AI Assistant"
      >
        <ChatIcon />
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <span>📚 Textbook Assistant</span>
            {selectedText && <span>📄 {selectedText.length} chars selected</span>}
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <ChatKit control={control} />
        </div>
      )}
    </>
  );
}
```

**Citation Navigation**:
- Backend returns citations as: `{"chapter": 3, "section": "2.1", "heading": "kinematics", "url": "/docs/chapter-3/kinematics#forward-kinematics"}`
- Frontend renders: `[Chapter 3, Section 2.1] <link>`
- On click: `navigate(url); setTimeout(() => scrollToHeading('forward-kinematics'), 100)`
- Highlight: Add `highlight` CSS class for 3 seconds

---

### Option 2: Sidebar Panel (Persistent)

**Description**:
- Fixed right sidebar (300px width) always visible
- Slides in/out with toggle button
- Textbook content shrinks to accommodate sidebar (responsive layout)

**Pros**:
- ✅ Chatbot always visible (high discoverability)
- ✅ Can read textbook and chat simultaneously (split-screen)
- ✅ Good for desktop users with large screens

**Cons**:
- ❌ Poor mobile experience (sidebar takes 50%+ screen width)
- ❌ Reduces textbook reading area on laptops (13-14" screens)
- ❌ Requires complex responsive layout (textbook content reflow)
- ❌ Harder to implement (needs Docusaurus theme customization)
- ❌ Distracting for students who don't need chatbot

---

### Option 3: Inline Bottom Bar (Collapsed)

**Description**:
- Sticky bottom bar (like cookie consent banner)
- Expands to 400px height when clicked
- Chatbot appears in bottom bar, textbook content above

**Pros**:
- ✅ Always discoverable (visible bar at bottom)
- ✅ Works on mobile (full-width bottom sheet)

**Cons**:
- ❌ Always takes screen space (even when collapsed)
- ❌ Obscures textbook content (especially on mobile)
- ❌ Competes with Docusaurus footer
- ❌ Awkward UX (students expect bottom = footer, not chat)

---

### Option 4: Separate Page (/chatbot route)

**Description**:
- Dedicated chatbot page at `/chatbot`
- Link in navbar: "AI Assistant"
- Full-page chat interface

**Pros**:
- ✅ Zero interference with textbook reading
- ✅ Simplest implementation (just another Docusaurus page)

**Cons**:
- ❌ Breaks reading flow (students must navigate away from textbook)
- ❌ Cannot use selected-text mode (no access to textbook content)
- ❌ Poor UX for quick questions (context switching)
- ❌ Not aligned with hackathon requirement: "embedded inside the textbook"

---

## Decision Outcome

**Chosen Option**: **Option 1: Floating Action Button (FAB) + Modal Popup**

### Rationale

1. **Hackathon Requirement Compliance**: Constitution states "Be embedded inside the published Docusaurus book website" — FAB+modal is truly embedded (global component).
2. **Student UX Priority**: Non-intrusive when not needed, full-featured when activated.
3. **Mobile-First**: Full-screen modal on mobile prevents layout issues.
4. **Implementation Speed**: Can reuse existing `src/components/Chatbot.js` structure, replace with ChatKit.
5. **Industry Standard**: Students already familiar with FAB pattern (used in 90% of chat widgets).

### Consequences

**Positive**:
- ✅ Clean integration with existing Docusaurus theme
- ✅ No conflicts with AuthProvider, PersonalizationProvider, UrduTranslate
- ✅ ChatKit SDK handles chat UI/UX (saves development time)
- ✅ Text selection API works across all pages (useTextSelection hook)
- ✅ Easy to add "View in Textbook" citation links (navigate + scrollIntoView)

**Negative**:
- ⚠️ Discoverability risk: Students may not notice FAB button → Mitigation: Add onboarding tooltip ("Click here to ask questions!")
- ⚠️ Modal blocks textbook when open → Mitigation: Provide "Minimize" button (collapse to FAB with unread indicator)
- ⚠️ Requires environment variable for API URL → Mitigation: Document in `.env.example`

**Neutral**:
- 🔄 Need to create custom `useTextSelection` hook for selected-text mode
- 🔄 Need to style ChatKit to match Docusaurus dark/light theme
- 🔄 Need to implement citation click handler (navigation + scroll + highlight)

## Implementation Plan

### Phase 1: ChatKit Integration (Week 1)
1. Install dependencies: `npm install @openai/chatkit-react`
2. Create `src/theme/Root.tsx` (swizzle Docusaurus root)
3. Create `src/components/ChatbotWidget/index.tsx`
4. Implement FAB button + modal layout (CSS modules)
5. Integrate ChatKit component with API endpoint

### Phase 2: Text Selection Mode (Week 1)
1. Create `src/hooks/useTextSelection.ts` hook
2. Add "Ask about selection" button (shows when text selected)
3. Pass `selectedText` to backend `/ask-selected` endpoint
4. Display selected text preview in modal header

### Phase 3: Citation Navigation (Week 2)
1. Parse backend citation format: `{chapter, section, heading, url}`
2. Render citations as clickable links: `<a href={url}>[Chapter X, Section Y]</a>`
3. Implement click handler:
   ```ts
   const handleCitationClick = (url: string, heading: string) => {
     navigate(url);
     setTimeout(() => {
       const el = document.getElementById(heading);
       el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
       el?.classList.add('highlight');
       setTimeout(() => el?.classList.remove('highlight'), 3000);
     }, 100);
   };
   ```
4. Add `.highlight` CSS: yellow background fade animation

### Phase 4: Styling & Polish (Week 2)
1. Match ChatKit theme to Docusaurus colors (dark/light mode)
2. Add mobile-responsive styles (max-width: 100vw on <768px)
3. Add accessibility: ARIA labels, keyboard shortcuts (Esc to close)
4. Add onboarding tooltip: "Try asking a question about the textbook!"

### Phase 5: Testing & Deployment (Week 2)
1. Test on mobile devices (iOS Safari, Android Chrome)
2. Test text selection on different pages
3. Test citation navigation (verify scrolling + highlighting)
4. Deploy backend to Render, update API URL in `.env`
5. Deploy Docusaurus to GitHub Pages

## Technical Details

### File Structure
```
src/
├── components/
│   ├── ChatbotWidget/
│   │   ├── index.tsx               # Main widget component
│   │   ├── ChatbotWidget.module.css # Styles
│   │   └── ChatIcon.tsx            # FAB icon
│   └── Chatbot.js                  # DELETE (old placeholder)
├── hooks/
│   └── useTextSelection.ts         # Text selection hook
├── theme/
│   └── Root.tsx                    # Swizzled root (global components)
└── css/
    └── custom.css                  # Add .highlight animation
```

### Environment Variables
```env
# frontend/.env (Docusaurus)
REACT_APP_API_URL=https://chatbot-api.onrender.com
REACT_APP_CHATKIT_DOMAIN_KEY=textbook
```

### Backend Requirements
```python
# backend/main.py
@app.post("/ask")
async def ask_general(query: str):
    # RAG pipeline: embed → Qdrant search → LLM → extract citations
    return {
        "answer": "Forward kinematics calculates end-effector position...",
        "citations": [
            {"chapter": 3, "section": "2.1", "heading": "forward-kinematics",
             "url": "/docs/chapter-3/kinematics#forward-kinematics", "score": 0.92}
        ]
    }

@app.post("/ask-selected")
async def ask_selected(query: str, selected_text: str):
    # No Qdrant search, just LLM with selected_text as context
    return {"answer": "Based on your selection...", "citations": [{"text": "from your selected text"}]}
```

## Monitoring & Success Metrics

Post-deployment, track:
- **Chatbot engagement**: % of sessions where FAB clicked (target: >30%)
- **Citation clicks**: % of answers where citations clicked (target: >50%)
- **Selected-text usage**: % of queries using selected-text mode (target: >20%)
- **Mobile usage**: % of chatbot sessions on mobile devices (expected: >40%)

## References

- OpenAI ChatKit Docs: https://platform.openai.com/docs/chatkit
- Docusaurus Swizzling Guide: https://docusaurus.io/docs/swizzling
- Text Selection API: https://developer.mozilla.org/en-US/docs/Web/API/Selection
- Existing `Chatbot.js`: `src/components/Chatbot.js` (to be replaced)

## Related Decisions

- **ADR-002** (pending): ChatKit vs Custom Chat UI (why ChatKit?)
- **ADR-003** (pending): Qdrant vs Pinecone for Vector Store
- **ADR-004** (pending): Citation Format & Linking Strategy

---

**Approved By**: [Project Lead Name]
**Implementation Assigned To**: [Developer Name]
**Target Completion**: 2025-12-16 (1 week sprint)
