---
id: 002
title: Specification Clarifications
stage: misc
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: textbook-platform
branch: 001-textbook-platform
user: Shumailaaijaz
command: /sp.clarify
labels: ["clarify", "architecture", "platform", "translation", "session-management", "docker"]
links:
  spec: specs/001-textbook-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-textbook-platform/spec.md
tests:
  - N/A (clarification phase)
---

## Prompt

```text
Please makesure we have context7 mcp, their you can access docusorus docs.
```

## Response snapshot

Executed /sp.clarify workflow to resolve critical architectural ambiguities in the Physical AI Humanoid Robotics Textbook Platform specification.

**Context7 MCP Verified**: Confirmed access to Docusaurus documentation via `/websites/docusaurus_io` (7858 code snippets, High reputation, Benchmark Score 89.3) and `/facebook/docusaurus` (2359 snippets).

**Questions Asked & Answered**: 3 of 5 allowed (all high-impact architectural decisions)

**Clarification 1: Urdu Translation Delivery Strategy**
- Q: How should Urdu translation content be structured and delivered?
- A: **Option C** - Custom client-side lazy-loading via Vercel API or Supabase
- Rationale: English served via Docusaurus static bundle; Urdu fetched on first toggle per chapter (<500ms), then cached for instant subsequent toggles (<100ms). Balances page size vs initial latency.
- Impact: Defines translation API architecture, caching strategy, storage requirements (Supabase)

**Clarification 2: Platform Strategy for Labs**
- Q: Primary platform for 40+ companion labs (Ubuntu-only, multi-platform, or containers)?
- A: **Option C** - Platform-agnostic Docker containers
- Rationale: All labs run in Docker containers (Ubuntu 22.04 + ROS Humble/Iron inside) via Docker Desktop (Windows/Mac) or Docker Engine (Linux). GitHub Codespaces provides one-click cloud alternative. Ensures 100% reproducibility across all host platforms.
- Impact: Fundamental architecture shift from "Ubuntu 22.04 required" to "Docker required" - affects 15+ requirements, 5 success criteria, dependencies, assumptions, and risks.

**Clarification 3: Session Management Duration**
- Q: Default session expiration duration (24h, 7d, 30d, or 90d with idle timeout)?
- A: **Option D** - 90-day maximum with 7-day idle timeout
- Rationale: Supports full semester (13 weeks) + buffer without re-authentication, but auto-logout after 7 days of inactivity maintains security on shared university computers.
- Impact: Defines authentication architecture, session storage requirements, UX expectations

**Sections Updated**:
- Added `## Clarifications` section with 3 Q&A pairs (lines 8-16)
- User Story 5: Rewrote acceptance scenarios for Docker-based execution (5 scenarios)
- FR-016: Added explicit 7-day idle timeout, 90-day max duration
- FR-024 to FR-027: Added lazy-loading details (<500ms first fetch, localStorage persistence)
- FR-031 to FR-033: Rewrote for Docker/devcontainer/GitHub Codespaces requirements
- Session entity: Added last_activity_timestamp, creation_timestamp, 90d/7d logic
- Dependencies: Replaced "Ubuntu 22.04 LTS" with "Docker Desktop/Engine" and "GitHub Codespaces"
- Assumptions: Updated Translation Pipeline (lazy-loading), Lab Maintenance (Docker), Target Audience (Windows 10/11 primary)
- Success Criteria: Updated SC-005, SC-009, SC-012 to reflect Docker cross-platform testing
- Risks: Updated Lab Reproducibility (Docker GUI forwarding complexity, GPU passthrough), Session Expiry UX (90d/7d mitigation)

**Coverage Summary** (All categories Resolved or Clear):
✅ Functional Scope, Domain & Data Model, Interaction & UX, Non-Functional QA, Integration & Dependencies, Edge Cases, Constraints, Terminology, Completion Signals, Misc/Placeholders

**No Outstanding Ambiguities**: All critical decisions made. Lower-impact choices (analytics platform: Plausible vs Umami, personalization storage details) deferred to planning phase.

**Recommended ADRs** (for `/sp.plan`):
1. Docker-based platform-agnostic architecture (vs native Ubuntu requirement)
2. Lazy-loaded Urdu translation strategy (tradeoff analysis: initial latency vs page bundle size)
3. 90-day session duration rationale (security vs UX balance for educational platform)

## Outcome

- ✅ Impact: Specification is now architecturally complete with concrete decisions on translation delivery (API-based lazy-loading), platform strategy (Docker containers for cross-platform reproducibility), and session management (90d max, 7d idle timeout). Ready for `/sp.plan`.
- 🧪 Tests: N/A (clarification phase; acceptance scenarios updated to reflect Docker execution)
- 📁 Files: Updated `specs/001-textbook-platform/spec.md` (15+ FRs, 5 SCs, 7 entities, 4 assumptions, 3 dependencies, 2 risks, User Story 5)
- 🔁 Next prompts:
  - Run `/sp.plan` with access to Context7 Docusaurus docs (`/websites/docusaurus_io`)
  - Create ADRs for Docker platform strategy, lazy-loaded translation, and session duration
  - During planning: finalize analytics platform choice, citation tracking automation
- 🧠 Reflection: The platform clarification (Question 2) had the highest impact - shifting from "Ubuntu 22.04 required" to "Docker containers" touched 20+ parts of the spec but significantly improves accessibility (Windows/Mac users) and reproducibility (locked environments). The lazy-loaded Urdu translation (Question 1) is a pragmatic compromise between Docusaurus static generation (fast) and dynamic i18n (flexible). The 90d/7d session policy (Question 3) elegantly balances semester-long courses with security on shared computers.

## Evaluation notes (flywheel)

- Failure modes observed: Initial platform assumption ("Ubuntu 22.04 + ROS Humble/Iron") was incompatible with user's stated target audience (Windows 10/11 primary). Corrected via Question 2. This highlights the importance of clarifying platform assumptions early, especially for educational content targeting diverse student environments.
- Graders run and results (PASS/FAIL): Specification coverage analysis: PASSED (all 10 taxonomy categories resolved or clear, zero blocking ambiguities)
- Prompt variant (if applicable): Standard /sp.clarify workflow with Context7 MCP verification (Docusaurus docs confirmed available)
- Next experiment (smallest change to try): During `/sp.plan`, validate Docker GUI forwarding complexity (X11/VNC for RViz visualizations) via Docusaurus plugin research - Context7 may have examples of similar interactive visualization setups in static sites.
