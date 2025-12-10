---
id: 001
title: Create Chatbot Constitution for RAG Integration
stage: constitution
date: 2025-12-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: chatbot-rag-integration
branch: main
user: developer
command: /sp.constitution
labels: ["constitution", "rag", "chatbot", "hackathon", "docusaurus"]
links:
  spec: null
  ticket: null
  adr: src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md
  pr: null
files:
  - src/chatbot/.specify/memory/constitution.md
  - src/chatbot/README.md
  - src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md
  - src/chatbot/.specify/ (directory structure)
  - src/chatbot/specs/ (directory structure)
  - src/chatbot/history/prompts/constitution/ (directory structure)
  - src/chatbot/history/prompts/general/ (directory structure)
  - src/chatbot/history/adr/ (directory structure)
tests:
  - None (constitution document, no executable tests)
---

## Prompt

```text
✅ Hackathon Constitution Prompt — Integrated RAG Chatbot Development

Title: Constitution for the Development of an Integrated RAG Chatbot for the Physical AI & Humanoid Robotics Textbook

1. Purpose of the Project

This constitution defines the complete technical, functional, and architectural requirements for building, integrating, and deploying a Retrieval-Augmented Generation (RAG) Chatbot inside the Docusaurus-based textbook for the Physical AI & Humanoid Robotics Course.

The goal is to create an AI assistant that can answer questions strictly from the book's content and also from user-selected text, ensuring accurate, explainable, and source-grounded responses.

2. Core Hackathon Requirements (Must-Have)
2.1 Integrated RAG Chatbot

The chatbot must:

Be embedded inside the published Docusaurus book website.

Provide answers based only on:

The entire textbook content

OR based on text specifically selected by the user

Use Retrieval-Augmented Generation (RAG) to ensure fact-based answers.

Produce citations/sources for every answer.

2.2 Required Technologies

The system must be built using the following stack:

AI + Chatbot Layer

OpenAI Agents / ChatKit SDK

Model selection: GPT-4.1, GPT-4o, GPT-O series, or equivalent Free/Open models if needed

Smooth frontend UI integrated into Docusaurus

Backend Layer

FastAPI (Python) for:

Query routing

RAG flow

Authentication (optional)

Data ingestion

PDF/text chunking APIs

Database Layer

Neon Serverless Postgres for:

User settings

Chat history

RAG metadata

Books & chapter indexing

Vector Database

Qdrant Cloud (Free Tier) for:

Storing embeddings

Performing similarity search

Returning top-k relevant chunks

2.3 User Interaction Requirements

The chatbot must support:

A. General Book Questioning

User asks any question about the book

System retrieves the most relevant text chunks → generates answer → shows citations

B. "Answer from selected text" Mode

When the user highlights text:

Only that selected text is used for grounding

Answer must not use any outside knowledge

C. Transparent RAG Pipeline

The chatbot must display:

Which paragraphs were used

Confidence or relevance score

Chapter / section reference

3. Functional Requirements
3.1 Chunking & Ingestion

Automatic parsing of all book chapters (Markdown or HTML)

Clean chunking strategy (200–500 tokens)

Embedding generation using OpenAI Text Embeddings

Insertion of chunks into Qdrant

3.2 RAG Pipeline

A complete RAG pipeline must include:

User Query

Embedding the query

Vector search (Qdrant)

Fetch top-k relevant chunks

Build context window

Pass to OpenAI model via ChatKit

Generate answer + citations

Save to Neon Postgres (optional but encouraged)

4. System Architecture Requirements

The system must follow this structure:

Frontend (Docusaurus)

Chat popup or side panel widget

Text selection mode (highlight → ask question)

Communicates with FastAPI backend via REST or WebSocket

FastAPI Backend

/embed — embed text / chapters

/search — similarity search from Qdrant

/ask — main RAG endpoint

/ask-selected — selected-text RAG endpoint

/history — save/load chat sessions

Database Layer

Neon Postgres for persistent storage

Qdrant Cloud for embeddings

5. Evaluation Requirements (Hackathon Scoring)

Your submission must demonstrate:

✔ A running Docusaurus textbook with integrated chatbot
✔ RAG answers with citations
✔ Working FastAPI server
✔ Qdrant search + Neon Postgres
✔ Ability to answer from selected text
✔ Clean architecture & code organization
✔ Clear documentation
6. Deployment Requirements

FastAPI on Render/Vercel/Cloud Run

Docusaurus deployed to GitHub Pages

Qdrant Cloud Free Tier

Neon Postgres Free Tier

API keys securely stored in .env

7. Deliverables
A. GitHub Repo

Containing:

Full backend (FastAPI)

RAG pipeline code

Docusaurus site with chatbot

Instructions & environment setup

B.

RAG answering general questions

RAG answering from selected text

Citation accuracy

Chatbot embedded in the book site

8. Ethical + Safety Requirements

Chatbot must avoid hallucinations

Answers must be based ONLY on book content

Include citation verification logic

No unsafe robot/AI instructions
```

User follow-up request:
"yes and create ADR too make sure this chatbot should be a part of textbook UI w previously created by you and me. student may use it with book"

## Response snapshot

Created comprehensive constitution for the Integrated RAG Chatbot project with the following structure:

### Constitution Document (v1.0.0)
Created at `src/chatbot/.specify/memory/constitution.md` with:

**Core Principles (5)**:
1. **Source Fidelity (Zero External Knowledge)**: All responses must be grounded exclusively in textbook content
2. **RAG Pipeline Transparency**: Display which paragraphs, chapters, and confidence scores were used
3. **Dual-Mode Interaction**: Support general book mode and selected-text mode
4. **Zero Hallucination Tolerance**: Refuse to answer when insufficient context available
5. **Explainability & Citations**: Every answer must include inline citations with clickable links

**Technical Standards**:
- Stack Requirements: OpenAI ChatKit SDK, FastAPI, Qdrant Cloud, Neon Postgres
- System Architecture: Complete data flow diagrams for ingestion, general questions, and selected-text queries
- Data Flow: Detailed pipeline from Docusaurus .md/.mdx files → chunking → embedding → Qdrant storage

**Functional Requirements**:
- FR-001 to FR-018: Covering chunking/ingestion, RAG pipeline, citation system, and user interaction modes
- Detailed specifications for chunk size (400 tokens, 100 overlap), embedding model (text-embedding-3-small), similarity threshold (0.7)

**Success Criteria**:
- 7 Hackathon Deliverables (D-001 to D-007): Running Docusaurus + chatbot, RAG with citations, working FastAPI, database integration, selected-text mode, clean architecture, documentation
- 5 Quality Metrics (Q-001 to Q-005): Citation accuracy ≥95%, zero hallucinations, response latency <3s, user satisfaction ≥80%, text selection accuracy 100%

**Deployment Requirements**:
- Environment variables configuration
- Backend deployment (Render/Railway)
- Frontend deployment (GitHub Pages)
- Database deployment (Qdrant Cloud, Neon Postgres)

**Ethical & Safety**:
- E-001 to E-005: Hallucination prevention, source fidelity enforcement, citation verification, safety guidelines, privacy protection

### Architecture Decision Record (ADR-001)
Created at `src/chatbot/history/adr/001-chatbot-ui-integration-docusaurus.md`:

**Decision**: Floating Action Button (FAB) + Modal Popup ⭐ SELECTED

**Rationale**:
- Embedded inside textbook (meets hackathon requirement)
- Non-intrusive when not needed, full-featured when activated
- Mobile-first design (full-screen modal on mobile)
- Industry standard UX pattern (students familiar with it)
- Easy integration with existing Docusaurus components

**Considered Alternatives**:
1. Sidebar Panel (Persistent) - rejected due to poor mobile UX
2. Inline Bottom Bar - rejected due to always taking screen space
3. Separate Page (/chatbot route) - rejected due to breaking reading flow

**Implementation Plan**: 5-phase rollout over 2 weeks covering ChatKit integration, text selection mode, citation navigation, styling, and deployment

**Technical Details**:
- File structure for `ChatbotWidget` component
- Environment variables configuration
- Backend API contract (`/ask`, `/ask-selected`)
- Citation click handler with smooth scroll + highlight animation

### Project Structure
Created directory hierarchy:
```
src/chatbot/
├── .specify/memory/constitution.md
├── README.md
├── history/
│   ├── prompts/
│   │   ├── constitution/
│   │   └── general/
│   └── adr/
│       └── 001-chatbot-ui-integration-docusaurus.md
├── specs/
├── backend/
└── frontend/
```

### README Documentation
Created `src/chatbot/README.md` with:
- Project overview and key features
- Architecture diagram
- Technology stack
- Getting started guide (prerequisites, backend setup, frontend setup)
- Development workflow (Spec-Driven Development)
- Current status and TODO checklist
- API endpoints reference
- Contributing guidelines
- Hackathon deliverables checklist

## Outcome

- ✅ Impact: Established complete governance framework for chatbot subproject within textbook repository
- 🧪 Tests: No executable tests (constitution and ADR are documentation artifacts)
- 📁 Files: 7 files created/modified (constitution, README, ADR, directory structure)
- 🔁 Next prompts:
  1. Create feature specification: `/sp.specify` for RAG integration
  2. Create implementation plan: `/sp.plan` for technical architecture
  3. Generate tasks: `/sp.tasks` for development sprint
  4. Create ADR-002: ChatKit vs Custom Chat UI decision
  5. Create ADR-003: Qdrant vs alternatives (Pinecone, Weaviate)
- 🧠 Reflection: Successfully translated hackathon requirements into formal constitution structure. Key insight: Separating "must-have" principles (Source Fidelity, Zero Hallucination) from "nice-to-have" features enables MVP prioritization. ADR-001 decision for FAB+Modal aligns with existing textbook UX (AuthProvider, PersonalizationProvider, UrduTranslate components).

## Evaluation notes (flywheel)

- Failure modes observed: None observed during creation. Potential risk: Constitution may be too prescriptive for rapid hackathon iteration (e.g., strict similarity threshold of 0.7 may need tuning based on textbook content quality).
- Graders run and results (PASS/FAIL):
  - ✅ PASS: Constitution structure validation (all required sections present)
  - ✅ PASS: Template consistency check (aligns with parent project constitution format)
  - ✅ PASS: Principle testability (all principles have concrete enforcement mechanisms)
  - ✅ PASS: ADR decision justification (clear rationale with pros/cons analysis)
- Prompt variant (if applicable): Standard constitution creation flow using `/sp.constitution` command
- Next experiment (smallest change to try): Test whether FR-007 similarity threshold (0.7) is optimal by running retrieval evaluation on 20 sample questions from textbook. If precision <80%, adjust threshold to 0.75 or 0.8.

---

**Note**: This PHR captures the full context of constitution creation including user's request for ADR covering chatbot integration into existing Docusaurus textbook UI. The decision ensures students can use the chatbot while reading without disrupting their flow (FAB pattern with modal popup).
