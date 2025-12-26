---
id: 003
title: Task Generation for Textbook Platform
stage: tasks
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: textbook-platform
branch: 001-textbook-platform
user: Shumailaaijaz
command: /sp.tasks
labels: ["tasks", "workflow", "roadmap", "implementation", "milestones", "deadlines"]
links:
  spec: specs/001-textbook-platform/spec.md
  plan: specs/001-textbook-platform/plan.md
  tasks: specs/001-textbook-platform/tasks.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-textbook-platform/tasks.md
tests:
  - N/A (task generation phase)
---

## Prompt

```text
Create two public repos:

github.com/physical-ai/textbook
github.com/physical-ai/labs
Add MIT license + push all existing files (plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts folder)
Add file CLAUDE_SYSTEM_PROMPT.txt at root with the exact Windows 10/11 prompt
Acceptance: repos public, all files present, CI passes

T1 Docusaurus + Full Platform Setup – Deadline: 14 Dec 2025
Run npx create-docusaurus@latest textbook classic --typescript
Integrate Better-Auth + Supabase (signup with 5 questions)
Implement personalisation engine + Urdu toggle (react-i18next)
Two mandatory buttons at top of every chapter
Cover image at static/img/book-cover-image.jpg
GitHub Actions + Vercel CI/CD blue on Windows 10/11 + WSL2
Acceptance: site live, login works, buttons work on sample chapter

[... T2-T9 deadlines and requirements ...]

Immediate next step (today): Complete T0 – create the two repos and push everything.
Reply with the repo URLs when done and we start T1 instantly
```

## Response snapshot

Executed `/sp.tasks` workflow to generate comprehensive implementation tasks for Physical AI Humanoid Robotics Textbook Platform.

**Total Tasks Generated**: 202 tasks across 10 phases (T0-T9)

**Timeline**: 5 Dec 2025 → 28 Feb 2026 (85 days)

**Phase Structure**:
- **T0 (Today)**: Repository setup - 18 tasks to create github.com/physical-ai/textbook and github.com/physical-ai/labs, push all design documents, set up CI
- **T1 (14 Dec)**: Platform setup - 66 tasks for Docusaurus + Better-Auth + Supabase + personalization + Urdu toggle + sample chapter (9-day sprint)
- **T2 (16 Dec)**: Chapter template - 12 tasks for reusable MDX template with strict validation, Windows-first setup sections, auto-generated sidebar
- **T3 (21 Dec)**: Part 0+1 content - 14 tasks for Chapters 0-1 with full Urdu translation
- **T4 (04 Jan)**: Part 2 content - 20 tasks for Chapters 2-5 (ROS 2) + 5 companion labs
- **T5 (11 Jan)**: Part 3 content - 11 tasks for Chapters 6-7 (Isaac Sim, Windows native)
- **T6 (18 Jan)**: Part 4 content - 14 tasks for Chapters 8-11 (Locomotion, VLA, Capstone)
- **T7 (25 Jan)**: MVP Beta Launch - 17 tasks for ≥50 beta users, public announcement
- **T8 (08 Feb)**: Polish - 16 tasks for Chapters 12-13 + Appendix + PDF export + beta feedback
- **T9 (28 Feb)**: Official 1.0 Launch - 14 tasks for peer review, course adoptions, media coverage

**Task Format**: All tasks follow strict checklist format with Task IDs (T001-T202), [P] markers for parallelizable tasks, [US1-US5] labels mapping to user stories from spec.md

**Key Features**:
- **Windows-First Approach**: Every Docker/WSL2 setup explicitly starts with Windows 10/11 instructions (per CLAUDE_SYSTEM_PROMPT.txt requirement)
- **Parallel Execution**: 40+ tasks marked [P] for concurrent execution (API endpoints, chapter authoring, lab development)
- **User Story Mapping**: Tasks organized by priority (P1-P5 user stories from spec.md)
- **Quality Gates**: Citation validation (≥50% peer-reviewed), Urdu accuracy (≥95%), lab reproducibility (100% CI pass)
- **Incremental Delivery**: MVP (T0-T1), Beta (T3-T7 Chapters 0-11), Full (T8-T9 Chapters 0-13)

**Constitution Compliance**:
- Accuracy: T161, T185 enforce ≥50% peer-reviewed citations across all phases
- Reproducibility: T126-T130, T140-T141, T154-T155 ensure 100% lab reproducibility on Windows/Mac/Linux + Codespaces
- Inclusivity: T104-T106, T118-T119, T136, T149, T177 ensure ≥95% Urdu translation accuracy via human review
- Clarity: T069, T195 ensure mobile responsiveness, accessibility (alt-text, screen reader testing)
- Rigor: T189-T191, T194 enforce external peer review, plagiarism checks before 1.0 release

**Risk Mitigation**:
- Translation quality: Budget $5,000 for professional translator (Chapters 0-6), GPT-4 + human review (Chapters 7-13)
- Docker GUI forwarding: 3 fallbacks documented (VcXsrv X11, VNC browser, Codespaces cloud)
- GPU access: NVIDIA Cloud free tier + Codespaces GPU + clear "GPU required" warnings
- Beta signup goals: Pre-announce 2 weeks early, reach out to 50+ robotics labs, offer incentives
- Citation targets: Real-time tracking, prioritize peer-reviewed during authoring, backfill with ICRA/IROS papers

**Immediate Next Action (T0)**: Create two public repos, push all files (spec.md, plan.md, research.md, data-model.md, contracts/), add MIT LICENSE, CLAUDE_SYSTEM_PROMPT.txt, basic CI workflows - Est. 2-3 hours

## Outcome

- ✅ Impact: Comprehensive 85-day roadmap with 202 actionable tasks, clear deadlines (T0-T9), and quality gates. Ready for immediate execution starting with T0 (repository setup).
- 🧪 Tests: Citation validation (automated), lab reproducibility (CI matrix on Windows/Mac/Linux), Urdu accuracy (human review), accessibility (Lighthouse + screen reader)
- 📁 Files: Created `specs/001-textbook-platform/tasks.md` (202 tasks, 600+ lines)
- 🔁 Next prompts:
  - Execute T0: Create github.com/physical-ai/textbook and github.com/physical-ai/labs repos, push all design documents
  - Reply with repo URLs when T0 complete to start T1 (Docusaurus + platform setup) immediately
  - Monitor deadlines: T1 (14 Dec), T2 (16 Dec), T3 (21 Dec), T7 Beta (25 Jan), T9 Final (28 Feb)
- 🧠 Reflection: The user's deadline-driven approach (T0-T9) with explicit acceptance criteria is excellent for accountability and incremental delivery. The Windows-first mandate (CLAUDE_SYSTEM_PROMPT.txt) is critical for the target audience (students with Windows laptops). Parallelization opportunities are significant (40+ [P] tasks) but require careful coordination (e.g., Urdu translation can start as soon as English chapter draft complete). The MVP scope (T0-T1) validates technical feasibility early (lazy-loaded i18n, Better-Auth + Supabase integration) before scaling to 14 chapters. Beta launch at T7 (Chapters 0-11) allows real-world feedback before final polish (T8-T9). The 85-day timeline is ambitious but achievable with a 2-3 person team focused on parallel workstreams (content authoring, lab development, translation).

## Evaluation notes (flywheel)

- Failure modes observed: None. Task generation followed strict checklist format (all tasks have checkboxes, IDs, file paths, [P]/[US] labels where appropriate). Windows-first requirement successfully encoded in T0 (CLAUDE_SYSTEM_PROMPT.txt creation) and T1 tasks (explicit Windows 10/11 setup steps).
- Graders run and results (PASS/FAIL): Task format validation: PASSED (all 202 tasks follow `- [ ] TXXX [P?] [USX?] Description with file path` format). User story mapping: PASSED (all user stories from spec.md have corresponding task phases with [US1-US5] labels).
- Prompt variant (if applicable): User requested specific T0-T9 milestone structure with deadlines, which was integrated into standard `/sp.tasks` workflow. This is a good pattern for deadline-driven projects (vs open-ended "generate tasks" prompts).
- Next experiment (smallest change to try): During T1 execution, validate that lazy-loaded Urdu translation (<500ms first fetch, <100ms cached) is achievable with Vercel Edge Functions + Supabase. If latency exceeds targets, consider pre-fetching Urdu on page load (hidden) or switching to static i18n build (tradeoff: larger bundle size, but instant toggles).
