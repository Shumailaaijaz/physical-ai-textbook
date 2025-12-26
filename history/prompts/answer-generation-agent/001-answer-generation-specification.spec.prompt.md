---
id: 001
title: Answer Generation Agent Specification
stage: spec
date: 2025-12-25
surface: agent
model: claude-sonnet-4-5-20250929
feature: answer-generation-agent
branch: main
user: developer
command: /sp.specify
labels: ["spec", "rag", "answer-generation", "grounding", "hallucination-control"]
links:
  spec: specs/004-answer-generation-agent/spec.md
  plan: null
  tasks: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-answer-generation-agent/spec.md
  - specs/004-answer-generation-agent/checklists/requirements.md
tests:
  - Specification quality checklist validation (16/16 items PASS)
  - Technology-agnostic success criteria (0 implementation details)
  - Testable functional requirements (15/15 validated)
  - Independent user stories (4 stories with P0-P3 priorities)
---

## Prompt

/sp.specify You are an AI answer-generation agent with retrieval-augmented capabilities, responsible for producing final, user-facing responses using only retrieved book content provided by upstream agents and tools. You operate as part of a multi-agent system, where retrieval is handled by a dedicated retriever agent (SPEC2) and answer synthesis and grounding are your exclusive responsibility. [Full specification requirements provided describing RAG answer generation with strict hallucination controls, two answering modes (standard RAG and selected-text-only), agent orchestration boundaries, book constraints, grounding controls, output requirements, and success criteria]

## Response snapshot

Created comprehensive specification for RAG Answer Generation Agent (SPEC 004) with strict hallucination prevention and multi-mode answering.

**Specification Overview**:

**4 User Stories** (Prioritized for independent delivery):
1. **P0 - Standard RAG Answering**: Core grounded answer generation with citations
   - Ask questions → receive book-grounded answers with chapter/section/URL citations
   - Refuse unsupported questions with clear message
   - Independent test: Validate answer uses only retrieved content, includes citations, refuses out-of-scope questions
2. **P1 - Selected Text Clarification**: Focused answering on user-highlighted passages
   - Highlight text → ask clarifying questions using ONLY that selection
   - Ignores all other retrieved chunks (strict mode)
   - Independent test: Provide selected text, validate answer ignores non-selected chunks
3. **P2 - Unsupported Question Handling**: Clear refusals for out-of-scope questions
   - Ask out-of-scope question → receive explanation of limitation
   - Independent test: Ask "How do I train GPT?" (not in book) → validate clear refusal message
4. **P3 - Multi-Source Citation Synthesis**: Advanced citation for multi-chapter answers
   - Ask broad question → receive synthesized answer citing all relevant chapters
   - Independent test: Ask question requiring 2+ chapters → validate all sources cited

**15 Functional Requirements** (All testable and unambiguous):
- FR-001: Use only retrieved chunks from upstream retrieval agent
- FR-002: Preserve book terminology exactly
- FR-003: Include source citations (chapter, section, URL)
- FR-004: Refuse when content insufficient ("The provided book content does not contain sufficient information to answer this question")
- FR-005: Support selected-text-only mode (ignore all other chunks)
- FR-006: Refusal message for selected-text mode ("The selected text does not contain this information")
- FR-007: No external knowledge usage
- FR-008: No added examples/explanations not in book
- FR-009: Consume retrieval results without requesting additional tools
- FR-010: Maintain conceptual consistency with book definitions
- FR-011: Clear, professional, technical tone
- FR-012: Handle empty retrieval results gracefully
- FR-013: Synthesize multi-chunk information without contradictions
- FR-014: Distinguish required vs. optional citations
- FR-015: Refuse questions requiring speculation/inference

**7 Success Criteria** (Technology-agnostic, measurable):
- SC-001: 100% of answers grounded (0 hallucinations in manual review)
- SC-002: 100% of in-scope answers include at least one citation
- SC-003: 100% of out-of-scope questions receive refusals
- SC-004: 100% selected-text mode compliance (ignores non-selected chunks)
- SC-005: 0% terminology substitution (preserve exact book terms)
- SC-006: Multi-chapter questions cite all relevant sources
- SC-007: Unsupported questions refused in <1 second

**6 Key Entities**:
- Retrieved Chunk (text + metadata: chapter, section, URL, score)
- User Query (question + optional selected text)
- Grounded Answer (synthesized text + citations)
- Citation (chapter, section, URL)
- Answer Mode (Standard RAG | Selected-Text-Only)
- Refusal Message (structured explanation)

**7 Edge Cases**:
1. Contradictory information across book sections
2. User-selected text too short to answer
3. Follow-up questions referencing previous context
4. Reasoning across disconnected chunks
5. Incomplete sentences from ingestion
6. Requests to compare book vs. external knowledge
7. Selected text contradicts broader context

**Key Design Decisions**:

1. **Zero Hallucination Tolerance**: Absolute prohibition on external knowledge
   - Rationale: Educational integrity requires perfect grounding
   - Trade-off: May refuse answerable questions if retrieval is weak

2. **Two Answer Modes**: Standard RAG vs. Selected-Text-Only
   - Rationale: Supports both exploratory learning (broad retrieval) and precision learning (focused text)
   - Trade-off: Selected-text mode may feel limiting to users expecting comprehensive answers

3. **Agent Orchestration Boundary**: This agent consumes retrieval outputs but never invokes tools
   - Rationale: Clean separation of concerns (retrieval vs. generation)
   - Trade-off: Cannot adaptively re-query if initial retrieval is insufficient

4. **Mandatory Citations**: All in-scope answers must include source references
   - Rationale: Traceability and academic rigor
   - Trade-off: Adds output verbosity

5. **Terminology Preservation**: Must use book's exact terms even if technically imprecise
   - Rationale: Respect author intent and maintain consistency
   - Trade-off: May perpetuate book's technical inaccuracies

**Assumptions**:
- Retrieval agent (SPEC2) operational and returning well-formatted chunks
- Chunks contain sufficient context (good chunking strategy)
- Queries in English (textbook language)
- Source URLs valid (validated by SPEC3)
- Multi-agent orchestration routes correctly
- Stateless conversations (no memory)
- Text selection API available in web UI

**Dependencies**:
- Upstream: Retrieval agent (SPEC2) complete
- Upstream: Retrieval validation (SPEC3) passing
- Upstream: Content ingestion (Phase 0) complete
- Downstream: Web UI for text selection (out of scope)

**Out of Scope**:
- Direct Qdrant querying (retrieval agent's job)
- Content ingestion/embedding (Phase 0)
- Real-time book updates
- Multi-turn memory
- Answer quality A/B testing
- User authentication
- Generating new examples
- Translation
- External tool usage (calculations, code execution)

**Validation Results**:
✅ All 16 checklist items passed
- No implementation details (no LLMs, APIs, frameworks mentioned)
- User-centric focus (book reader, researcher personas)
- Measurable success criteria (specific percentages, timeframes)
- Complete acceptance scenarios (16 Given/When/Then scenarios across 4 stories)
- Bounded scope (clear Out of Scope section)
- No [NEEDS CLARIFICATION] markers (all decisions resolved)

**Specification Readiness**: Ready for `/sp.plan`

## Outcome

- ✅ **Impact**: Complete specification for strict RAG answer generation agent; 4 independently testable user stories; 15 testable functional requirements; 7 measurable success criteria; zero hallucination tolerance enforced
- 🧪 **Tests**: Checklist validation 16/16 PASS; technology-agnostic verified (0 implementation details); testability confirmed (all FRs have concrete test cases); independent story validation (each P0-P3 story deliverable standalone)
- 📁 **Files**:
  - specs/004-answer-generation-agent/spec.md (comprehensive specification)
  - specs/004-answer-generation-agent/checklists/requirements.md (16/16 items passed)
- 🔁 **Next prompts**:
  1. Planning: `/sp.plan` (design answer generation architecture, grounding logic, citation formatting)
  2. Task generation: `/sp.tasks` (break down into implementation tasks)
  3. Clarification (optional): `/sp.clarify` (if any ambiguities surface during planning)
- 🧠 **Reflection**: This spec required careful balance between educational integrity (zero hallucination tolerance) and usability (must refuse when unsure). The two-mode design (standard RAG vs. selected-text-only) addresses different learning styles: exploratory (broad retrieval) vs. precision (focused reading). Agent orchestration boundary (consumer-only, no tool invocation) ensures clean separation from retrieval. Success criteria are aggressive (100% grounding, 0% hallucinations) reflecting the high stakes of educational content. The P0-P3 prioritization enables incremental delivery: P0 delivers basic grounded answering, P1 adds precision mode, P2 hardens refusal logic, P3 adds advanced citation. All 15 functional requirements are testable with concrete scenarios. No [NEEDS CLARIFICATION] markers because informed assumptions were made (e.g., text selection via API parameter, citations as structured refs, refusals when content insufficient). The spec intentionally avoids implementation (no prompt engineering, no LLM selection) to maintain technology independence.

## Evaluation notes (flywheel)

- **Failure modes observed**: None; specification validation passed all 16 checklist items on first iteration
- **Graders run and results (PASS/FAIL)**:
  - Content quality - PASS (no implementation details, user-focused, stakeholder-appropriate language)
  - Requirement completeness - PASS (0 [NEEDS CLARIFICATION] markers, all testable, measurable criteria, scenarios defined)
  - Feature readiness - PASS (acceptance criteria clear, primary flows covered, no implementation leakage)
  - Technology independence - PASS (0 references to LLMs, frameworks, APIs)
  - Testability - PASS (15/15 functional requirements have concrete test cases)
  - Independent stories - PASS (4 stories with clear P0-P3 priorities, each independently deliverable)
- **Prompt variant (if applicable)**: User provided detailed agent description with responsibilities, modes, constraints, and prohibitions; transformed into user-centric spec with prioritized stories and measurable outcomes
- **Next experiment (smallest change to try)**: For next specification, test whether including "story dependency graph" (e.g., "P1 depends on P0 for grounding framework") improves planning clarity vs. relying on priority ordering alone. Also consider adding "rejection examples" (sample questions that should be refused) directly in spec for better testability.
