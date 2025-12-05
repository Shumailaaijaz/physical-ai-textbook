---
id: 001
title: Physical AI Textbook Constitution
stage: constitution
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Shumailaaijaz
command: /sp.constitution
labels: ["constitution", "governance", "textbook", "robotics", "education"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

```text
constitution recommendations for the Physical AI Humanoid Robotics Textbook project, which involves:
Writing a book using Docusaurus and deploying to GitHub Pages
Using Spec-Kit Plus and Claude Code for AI/Spec-driven development
Creating educational content about humanoid robotics

Core Principles (non-negotiable)

Accuracy through primary source verification
Clarity for academic & practitioner audience (assumes CS/robotics background)
Reproducibility – every technical claim, benchmark, or hardware recommendation is traceable and runnable
Rigor – prefer peer-reviewed papers, official NVIDIA/ROS documentation, and open-source repository releases
Practicality & Inclusivity – content must run on student-accessible hardware tiers and be available in English + Urdu

Key Standards

All factual claims must be cited with a visible inline link or reference
Citation format: APA 7th edition (clickable hyperlinks in web version, full bibliography at chapter end)
Source priority (minimum targets across the entire book):
→ ≥50 % peer-reviewed conference/journal papers (ICRA, IROS, RSS, CoRL, RA-L, etc.)
→ ≥30 % official documentation (ROS 2, NVIDIA Isaac, Unitree, Intel RealSense)
→ ≤20 % high-quality blogs, whitepapers, or GitHub READMEs (only when no better source exists)
Plagiarism tolerance: 0 % (checked via Copyscroll + manual review before merge)
Writing clarity: Flesch-Kincaid Grade 10–13 (clear to advanced undergrads/grads)
Code & simulations: 100 % reproducible on Ubuntu 22.04 with openly disclosed versions
Diagrams: original clean vector/SVG, dark-mode compatible, with alt-text

Constraints

Total book length (excluding code): 90,000–120,000 words
Minimum 250 traceable sources across the entire book
Minimum 40 runnable ROS 2 packages or Isaac Sim scenes published in companion repo
Primary format: Docusaurus/MDX web book (responsive, mobile-friendly)
→ PDF export available but secondary
Every chapter must contain (for logged-in users):
→ "Personalise this chapter" button (toggles difficulty & hardware track)
→ "اردو میں دیکھیں / View in Urdu" button (instant translation)

Success Criteria (measured at launch and every major release)

100 % of technical claims verified against cited primary sources
Zero plagiarism (automated + human audit)
All 14 chapters have functional "Personalise" and "Urdu" buttons
Urdu translation accuracy ≥95 % (human-rated sample)
≥200 unique logged-in users actively using personalisation or Urdu features within 90 days of launch
External peer review by at least 3 robotics faculty/researchers completed

Repository: github.com/physical-ai/textbook
Live site: physical-ai.github.io/textbook
Companion code & assets: github.com/physical-ai/labs
This constitution is enforceable via Spec-Kit Plus /sp.constitution checks and must be respected in every /sp.specify, /sp.plan, and /sp.implement command.
Ratified and effective immediately
```

## Response snapshot

Created Physical AI Humanoid Robotics Textbook Constitution v1.0.0 with five core principles:

1. **Accuracy through Primary Source Verification**: All claims must be cited with verifiable primary sources
2. **Clarity for Academic & Practitioner Audience**: Flesch-Kincaid Grade 10-13, assumes CS/robotics background
3. **Reproducibility**: All code/simulations must run on documented platforms (Ubuntu 22.04 LTS primary)
4. **Rigor**: ≥50% peer-reviewed papers, ≥30% official docs, ≤20% high-quality secondary sources
5. **Practicality & Inclusivity**: Student-accessible hardware tiers + English/Urdu bilingual support

Key constraints established:
- 90,000-120,000 words across 14 chapters
- Minimum 250 traceable sources
- 40+ runnable ROS 2 packages/Isaac Sim scenes
- Interactive features: "Personalise" and Urdu translation buttons in every chapter
- Zero plagiarism tolerance (Copyscroll + manual review)

Success criteria defined for quality (100% citation coverage, zero plagiarism, ≥95% Urdu accuracy) and adoption (≥200 active users within 90 days, 3+ faculty peer reviews).

Constitution file created at `.specify/memory/constitution.md` with HTML comment header containing Sync Impact Report documenting version bump rationale and template compatibility checks.

## Outcome

- ✅ Impact: Established foundational governance framework for Physical AI Humanoid Robotics Textbook project; all future features must comply with these principles
- 🧪 Tests: N/A (governance document)
- 📁 Files: Created `.specify/memory/constitution.md` (v1.0.0)
- 🔁 Next prompts:
  - Implement plagiarism checking workflow (Copyscroll integration)
  - Create ADR for Docusaurus + GitHub Pages deployment strategy
  - Define PHR workflow for textbook chapter development
  - Set up Urdu translation pipeline
- 🧠 Reflection: Constitution successfully captures the dual requirements of academic rigor (peer-reviewed sources, reproducibility) and accessibility (student hardware, bilingual support). The source priority percentages provide clear enforcement targets. Interactive features ("Personalise" and Urdu buttons) are technically ambitious and will require careful UX design.

## Evaluation notes (flywheel)

- Failure modes observed: None in this session. Potential risk: source priority percentages may be difficult to track manually; recommend automated citation analysis tooling.
- Graders run and results (PASS/FAIL): N/A (constitution creation, no code execution)
- Prompt variant (if applicable): N/A (initial constitution)
- Next experiment (smallest change to try): Validate constitution enforcement during first `/sp.specify` command for a textbook chapter; observe if principles translate into actionable spec requirements.
