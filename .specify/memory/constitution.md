<!--
SYNC IMPACT REPORT
==================
Version change: [UNVERSIONED] → 1.0.0
Created: 2025-12-05

Rationale for version 1.0.0:
- Initial constitution creation for Physical AI Humanoid Robotics Textbook project
- MAJOR version because this establishes foundational governance framework

Modified principles: N/A (new creation)
Added sections:
- Core Principles (5 principles: Accuracy, Clarity, Reproducibility, Rigor, Practicality & Inclusivity)
- Key Standards (Citation & Source Quality)
- Constraints (Scope & Technical Requirements)
- Success Criteria (Quality & Adoption Metrics)
- Governance (Amendment & Compliance)

Templates requiring updates:
✅ .specify/templates/spec-template.md - Verified: No constitution-specific constraints, compatible as-is
✅ .specify/templates/plan-template.md - Verified: Constitution Check section will use these principles
✅ .specify/templates/tasks-template.md - Verified: Task quality aligns with reproducibility principle
⚠️  PENDING: README.md or project documentation should reference this constitution for contributor onboarding

Follow-up TODOs:
- Implement automated plagiarism checking workflow (Copyscroll integration)
- Define PHR workflow for textbook chapter development
- Create ADR for Docusaurus + GitHub Pages deployment strategy
- Establish peer review process with 3+ robotics faculty
- Set up Urdu translation pipeline and accuracy verification process
-->

# Physical AI Humanoid Robotics Textbook Constitution

## Core Principles

### I. Accuracy through Primary Source Verification

Every factual claim, technical specification, benchmark, and hardware recommendation in the textbook MUST be traced to a verifiable primary source. Claims without citations are prohibited.

**Rationale**: Academic and practitioner audiences depend on authoritative, verifiable information. Unsubstantiated claims erode trust and educational value.

### II. Clarity for Academic & Practitioner Audience

All content assumes readers have a computer science and robotics background (undergraduate level minimum). Technical explanations must be precise yet accessible, targeting Flesch-Kincaid Grade 10–13 readability.

**Rationale**: The textbook serves dual audiences—students building foundational knowledge and practitioners seeking implementation guidance. Overly simplified content wastes expert readers' time; overly dense content blocks learning.

### III. Reproducibility

Every technical claim, code example, simulation, and hardware configuration MUST be reproducible on documented hardware/software configurations. All dependencies, versions, and platform requirements must be explicitly stated.

**Rationale**: Educational content loses value if readers cannot replicate results. Reproducibility is the cornerstone of scientific credibility and practical utility.

### IV. Rigor

Content prioritizes peer-reviewed academic publications and official technical documentation over secondary sources. Expert review validates technical accuracy before publication.

**Rationale**: The field of humanoid robotics moves rapidly, with competing claims and preliminary results. Rigorous sourcing ensures readers access validated knowledge, not transient hype.

### V. Practicality & Inclusivity

All technical content must be accessible on student hardware tiers (clearly documented), and the entire textbook must support both English and Urdu languages with high-quality translation.

**Rationale**: Democratizing access to robotics education requires both economic accessibility (avoiding GPU/hardware lock-in where possible) and linguistic accessibility (serving non-English-speaking communities).

## Key Standards

### Citation & Source Quality

**Mandatory Citation Format**:
- APA 7th edition for all references
- Inline clickable hyperlinks in web version
- Full bibliography at chapter end
- Every claim requiring domain expertise MUST have a visible citation

**Source Priority (minimum targets across entire textbook)**:
- ≥50% peer-reviewed conference/journal papers (ICRA, IROS, RSS, CoRL, RA-L, IJRR, T-RO, etc.)
- ≥30% official documentation (ROS 2, NVIDIA Isaac Sim, Unitree SDK, Intel RealSense, etc.)
- ≤20% high-quality blogs, whitepapers, or open-source READMEs (only when no authoritative source exists)

**Source Exclusions**:
- Wikipedia, personal blogs (unless author is a recognized domain expert), marketing materials, unverified social media posts

**Plagiarism Policy**:
- 0% tolerance for plagiarism
- Automated checking via Copyscroll before every merge
- Manual review for close paraphrasing
- Proper attribution for adapted figures, tables, code snippets

### Writing & Technical Standards

**Readability**: Flesch-Kincaid Grade Level 10–13 (undergraduate to graduate level)

**Code & Simulations**:
- 100% reproducible on Ubuntu 22.04 LTS (or explicitly documented alternative platforms)
- All dependencies versioned and locked (package.json, requirements.txt, etc.)
- Environment setup documented in companion repository

**Diagrams & Figures**:
- Original vector graphics (SVG preferred)
- Dark-mode compatible color schemes
- Alt-text for accessibility
- Source files committed to repository for future editing

## Constraints

### Scope

- **Total Book Length**: 90,000–120,000 words (excluding code, excluding bibliographies)
- **Minimum Sources**: 250 traceable, high-quality sources across the entire textbook
- **Minimum Code Artifacts**: 40 runnable ROS 2 packages or Isaac Sim scenes in companion repository
- **Chapter Count**: 14 chapters (as per outline)

### Technical Requirements

**Primary Format**:
- Docusaurus/MDX web book (responsive, mobile-first, desktop-optimized)
- Deployed to GitHub Pages at `physical-ai.github.io/textbook`

**PDF Export**:
- Available but secondary priority
- Generated from Docusaurus build

**Interactive Features** (for logged-in users):
- "Personalise this chapter" button in every chapter
  - Toggles difficulty level (introductory / intermediate / advanced)
  - Toggles hardware track (simulation-only / budget-hardware / research-grade)
- "اردو میں دیکھیں / View in Urdu" button in every chapter
  - Instant language toggle (no page reload)
  - Maintains scroll position and interactive state

**Companion Repositories**:
- Main textbook source: `github.com/physical-ai/textbook`
- Code labs & assets: `github.com/physical-ai/labs`

## Success Criteria

### Quality Metrics (Launch & Every Major Release)

- ✅ **100% citation coverage**: Every technical claim verified against cited primary sources
- ✅ **Zero plagiarism**: Automated + human audit passes
- ✅ **Full feature parity**: All 14 chapters have functional "Personalise" and "Urdu" buttons
- ✅ **Translation quality**: Urdu translation accuracy ≥95% (human-rated sample of 500+ sentences)
- ✅ **Reproducibility**: All code examples run successfully on documented platforms (automated CI checks)

### Adoption Metrics (90 Days Post-Launch)

- ✅ **≥200 unique logged-in users** actively using personalisation or Urdu features
- ✅ **External peer review completed**: At least 3 robotics faculty/researchers provide written feedback
- ✅ **Student validation**: At least 2 university courses or bootcamps adopt textbook as primary resource

### Maintenance & Updates

- **Quarterly reviews**: Update citations for deprecated APIs, new ROS 2 releases, hardware changes
- **Annual major revision**: Incorporate new research (ICRA, IROS, RSS proceedings), expanded chapters, new case studies

## Governance

### Amendment Process

This constitution can be amended via the following process:

1. **Proposal**: Document proposed change in an ADR (Architecture Decision Record) via `/sp.adr <title>`
2. **Justification**: Explain why the amendment is necessary (new requirements, changing context, discovered gaps)
3. **Impact Analysis**: Assess which templates, workflows, and existing content are affected
4. **Approval**: Requires consensus from project maintainers and at least one external robotics educator/researcher
5. **Migration Plan**: Define how existing content will be updated to comply with amended principles
6. **Version Bump**: Follow semantic versioning (MAJOR for breaking changes, MINOR for new principles, PATCH for clarifications)

### Compliance

- **All PRs** must verify compliance with constitution principles (enforced via `/sp.constitution` checks)
- **Spec-Kit Plus workflows** (`/sp.specify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`) MUST respect these principles
- **Constitution supersedes** conflicting guidance in README, issue templates, or informal discussions
- **Blocking violations**: Failure to meet citation standards, plagiarism, non-reproducible code examples

### Version Control

**Version**: 1.0.0
**Ratified**: 2025-12-05
**Last Amended**: 2025-12-05

**Semantic Versioning Rules**:
- **MAJOR (X.0.0)**: Backward-incompatible governance changes, principle removals, redefined success criteria
- **MINOR (1.X.0)**: New principles added, new standards introduced, materially expanded guidance
- **PATCH (1.0.X)**: Clarifications, typo fixes, non-semantic wording improvements
