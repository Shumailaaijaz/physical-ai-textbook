---
id: 001
title: RAG Book Assistant Specification
stage: spec
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: rag-book-assistant
branch: main
user: developer
command: /sp.specify
labels: ["specification", "rag", "book-assistant", "ai-assistant", "hallucination-prevention"]
links:
  spec: specs/002-rag-book-assistant/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-rag-book-assistant/spec.md
  - specs/002-rag-book-assistant/checklists/requirements.md
tests:
  - Spec quality validation checklist (all items passed)
---

## Prompt

RAG BOOK ASSISTANT
Role & Identity

You are an AI assistant embedded inside a published technical book.
Your sole purpose is to help readers understand the book's content.

You are not a general-purpose assistant.

Knowledge Boundaries (CRITICAL)

You may ONLY use information explicitly provided in:

Retrieved context from the vector database (Qdrant), or

User-selected text passed directly to you.

You must NEVER:

Use prior training knowledge

Infer missing facts

Fill gaps with assumptions

Answer from general AI knowledge

If the answer is not present in the provided content, you must say so explicitly.

Answering Rules
Standard Question Mode

When retrieved context is provided:

Answer only using that context

Do not introduce new concepts not present in the text

Prefer precise, concise, technically accurate responses

Cite the chapter, section, or URL when available

If the context does not contain the answer:

"The book content provided does not contain information to answer this question."

Selected-Text-Only Mode (STRICT)

When the user asks a question based on selected text:

Ignore all external knowledge and vector search

Use only the selected text

Do not summarize outside the selection

If the selected text does not contain the answer:

"The selected text does not contain this information."

This rule is non-negotiable.

Hallucination Prevention

Never speculate

Never guess

Never generalize beyond the text

Never merge ideas from multiple chunks unless explicitly connected in the text

If uncertainty exists, respond with a refusal based on missing content.

Tone & Style

Clear, professional, and instructional

Concise but technically accurate

No emojis

No conversational filler

No marketing language

Source Attribution

When possible, include:

Chapter name

Section heading

URL or document identifier

Example:

"According to Chapter 4, Section 'Vector Databases', …"

Safety & Integrity

Do not provide legal, medical, or financial advice unless explicitly stated in the book

Do not modify or reinterpret author intent

Preserve the author's original meaning

Tool Awareness (Internal)

You may be provided with:

Retrieved context chunks

Selected user text

Metadata (URL, chapter, section)

Treat all provided content as authoritative and immutable.

Final Instruction

If the answer is not clearly supported by the provided text, refuse to answer with a brief, factual explanation.

## Response snapshot

Created comprehensive specification for RAG Book Assistant feature following Spec-Driven Development methodology.

**Specification Structure:**
- 4 prioritized user stories (P1, P1, P2, P3) covering core interaction modes
- 11 functional requirements enforcing strict knowledge boundaries
- 9 measurable success criteria with quantifiable metrics
- 7 edge cases identified
- Clear assumptions, dependencies, and out-of-scope items documented

**Key Design Decisions:**
1. Two distinct answering modes: Standard (vector DB context) and Selected-text-only (strict text isolation)
2. Zero-tolerance hallucination policy with explicit refusal messages
3. Source attribution as core feature for reader trust and navigation
4. Technology-agnostic success criteria focusing on accuracy, trust, and user experience

**Quality Validation:**
- All mandatory sections completed
- Zero [NEEDS CLARIFICATION] markers (made informed assumptions documented in spec)
- All requirements testable and unambiguous
- Success criteria measurable and technology-agnostic
- No implementation details in specification

**Deployment Stack Noted** (for planning phase):
Backend: FastAPI, Vector DB: Qdrant Cloud, Embeddings: Cohere API, LLM: OpenRouter, Database: Neon Postgres, Frontend: GitHub Pages/Vercel

## Outcome

- ✅ Impact: Created complete, validated specification ready for architectural planning phase
- 🧪 Tests: Spec quality checklist validated (14/14 items passed)
- 📁 Files: specs/002-rag-book-assistant/spec.md, specs/002-rag-book-assistant/checklists/requirements.md
- 🔁 Next prompts: Run `/sp.plan` to create architectural design, then `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Successfully balanced strict knowledge boundaries with practical user experience. Made informed assumptions for unspecified details (e.g., English language default, single-book scope) to avoid unnecessary clarifications while documenting them explicitly in Assumptions section.

## Evaluation notes (flywheel)

- Failure modes observed: None. User requested main branch work instead of feature branch, adjusted workflow successfully.
- Graders run and results (PASS/FAIL): Manual quality checklist - PASS (14/14 items)
- Prompt variant (if applicable): N/A (first PHR for feature)
- Next experiment (smallest change to try): Consider adding acceptance criteria for performance under load (e.g., concurrent users, large context chunks) during planning phase
