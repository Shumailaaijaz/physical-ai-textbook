# Implementation Plan: Physical AI Humanoid Robotics Textbook Platform

**Branch**: `001-textbook-platform` | **Date**: 2025-12-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-textbook-platform/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.claude/commands/sp.plan.md` for the execution workflow.

## Summary

Build a bilingual (English/Urdu) educational platform for a humanoid robotics textbook using Docusaurus 3 as the static site generator, deployed to GitHub Pages. The platform serves 14 chapters + Appendix with 90,000-120,000 words, ≥250 APA 7 citations (≥50% peer-reviewed papers), and 40+ Docker-based companion labs. Dynamic features (user authentication, personalization profiles, lazy-loaded Urdu translations) are handled via Vercel serverless functions with Supabase backend. Primary audience is Windows 10/11 users accessing labs via Docker Desktop; GitHub Codespaces provides cloud alternative.

**Key Technical Approach** (from clarifications):
- **Translation**: Lazy-loaded via Vercel API/Supabase (<500ms first toggle, cached thereafter)
- **Platform**: Docker containers for cross-platform lab execution (Windows/Mac/Linux)
- **Sessions**: 90-day max duration with 7-day idle timeout

## Technical Context

**Language/Version**:
- **Frontend**: JavaScript/TypeScript (ES2022), React 18, Docusaurus 3.x
- **Backend**: TypeScript 5.x, Node.js 20.x LTS (Vercel serverless runtime)
- **Labs**: Python 3.10+, ROS 2 Humble/Iron (inside Docker containers)

**Primary Dependencies**:
- **Frontend**: `@docusaurus/core` 3.x, `@docusaurus/preset-classic`, `react` 18.x, `react-dom` 18.x
- **Backend**: `better-auth` (authentication), `@supabase/supabase-js` (database client), `@vercel/node` (serverless functions)
- **Database**: Supabase (PostgreSQL 15+) for user profiles, sessions, Urdu translations
- **Containers**: Docker Desktop (Windows/Mac), Docker Engine (Linux), `docker-compose` 2.x
- **CI/CD**: GitHub Actions for automated testing, deployment, citation validation

**Storage**:
- **Static Content**: GitHub Pages (Docusaurus build output, English MDX files, images, diagrams)
- **Dynamic Data**: Supabase PostgreSQL (users, personalization_profiles, sessions, translation_content, labs metadata)
- **Translation Cache**: Browser localStorage (lazy-loaded Urdu content per chapter)

**Testing**:
- **Frontend**: Jest + React Testing Library (component tests), Playwright (E2E tests for personalization/translation)
- **Backend**: Vitest (API endpoint tests), Supertest (HTTP assertions)
- **Labs**: Docker-based CI (pytest for Python labs, ROS 2 launch tests)
- **Citation Validation**: Custom Node.js script (validates ≥50% peer-reviewed, ≥30% official docs)

**Target Platform**:
- **Website**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), mobile-responsive (320px+ width)
- **Labs**: Docker containers (Ubuntu 22.04 + ROS Humble/Iron inside) on Windows 10/11 + Docker Desktop, macOS + Docker Desktop, Linux + Docker Engine
- **Cloud Alternative**: GitHub Codespaces (browser-based VS Code with devcontainers)

**Project Type**: Web application (Docusaurus static site + Vercel serverless backend)

**Performance Goals**:
- **Page Load**: <2s Time to Interactive (TTI) for chapter pages on 4G connection
- **Urdu Toggle**: <500ms first fetch (lazy-load), <100ms cached toggle
- **Personalization Toggle**: <200ms content swap (client-side conditional rendering)
- **Session Validation**: <150ms auth check (Supabase query)
- **API Latency**: p95 <300ms for auth/profile/translation endpoints

**Constraints**:
- **Content**: 90,000-120,000 words (excluding code), ≥250 sources (≥50% peer-reviewed, ≥30% official docs, ≤20% secondary)
- **Translation Accuracy**: ≥95% human-rated Urdu accuracy (measured via 500+ sentence sample)
- **Lab Reproducibility**: 100% of labs must run in Docker on Windows/Mac/Linux (verified by CI)
- **Accessibility**: Alt-text for all images, Flesch-Kincaid Grade 10-13 readability
- **Security**: 90-day session max with 7-day idle timeout, no personal data sales (GDPR compliance)
- **Mobile**: ≥30% traffic expected, ≥80% mobile user satisfaction target

**Scale/Scope**:
- **Content Volume**: 14 chapters + Appendix, 40+ companion labs, ≥250 citations
- **Expected Users**: MVP = 50 beta users; 90-day post-launch = ≥1,000 visitors, ≥300 registered users
- **Personalization Profiles**: 5 questions × 12-17 total combinations (Python: 4 levels × ROS: 3 levels × Linux: 3 levels × GPU: 3 options × Budget: 4 tiers)
- **Translation Content**: 14 chapters × ~7,000 words avg = ~98,000 words × 2 languages (English static, Urdu lazy-loaded)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Accuracy through Primary Source Verification
- ✅ **Compliant**: FR-005 to FR-007 enforce ≥50% peer-reviewed, ≥30% official docs, ≤20% secondary
- ✅ **Implementation**: Custom CI script validates citation metadata (type: peer-reviewed/official/secondary) from `citations.json` or YAML front matter
- ✅ **Enforcement**: SC-001 requires 100% citation coverage (manually audited before each release)

### Principle II: Clarity for Academic & Practitioner Audience
- ✅ **Compliant**: FR-035 enforces 90,000-120,000 word count, assumptions specify Flesch-Kincaid Grade 10-13
- ✅ **Implementation**: Docusaurus MDX allows technical precision with code examples, diagrams (SVG), and interactive content
- ✅ **Enforcement**: SC-017 requires ≥80% mobile user satisfaction (measured via surveys)

### Principle III: Reproducibility
- ✅ **Compliant**: FR-032 mandates Docker containers for all labs (Ubuntu 22.04 + ROS Humble/Iron inside)
- ✅ **Implementation**: Each lab includes Dockerfile, docker-compose.yml, devcontainer.json with locked dependencies (e.g., `ros:humble-ros-base-jammy`, `numpy==1.24.0`)
- ✅ **Enforcement**: SC-005 requires 100% reproducibility via automated CI checks on Windows/Mac/Linux hosts; SC-012 enforces zero critical lab bugs

### Principle IV: Rigor
- ✅ **Compliant**: FR-005 enforces ≥50% peer-reviewed citations (minimum 125 out of 250 sources)
- ✅ **Implementation**: Citation database tracks URL, title, authors, publication year, type; automated validation during CI
- ✅ **Enforcement**: SC-001 (100% citation coverage), SC-002 (zero plagiarism via Copyscroll + manual review), SC-013 (3+ faculty peer reviews)

### Principle V: Practicality & Inclusivity
- ✅ **Compliant**: FR-029 enforces ≥95% Urdu translation accuracy; FR-032 supports Windows 10/11 + Docker Desktop (primary platform)
- ✅ **Implementation**: Lazy-loaded Urdu via Vercel API/Supabase; Docker ensures student hardware accessibility (no native Ubuntu required); GitHub Codespaces provides one-click cloud alternative
- ✅ **Enforcement**: SC-004 (≥95% Urdu accuracy via human rating), SC-011 (≥300 users actively using Urdu/personalization within 90 days)

**GATE VERDICT**: ✅ **PASS** - No violations. All 5 constitution principles are enforced via explicit functional requirements and success criteria.

## Project Structure

### Documentation (this feature)

```text
specs/001-textbook-platform/
├── spec.md              # Feature specification (User Stories, FRs, Success Criteria)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output: Technology research & best practices
├── data-model.md        # Phase 1 output: Database schemas (User, Chapter, PersonalizationProfile, etc.)
├── quickstart.md        # Phase 1 output: Developer setup guide
├── contracts/           # Phase 1 output: API contracts
│   ├── auth.openapi.yml           # Authentication endpoints (POST /api/auth/signup, /login, /logout)
│   ├── profile.openapi.yml        # Profile endpoints (GET/PATCH /api/profile)
│   ├── translation.openapi.yml    # Translation endpoints (GET /api/translation/:chapterId)
│   └── session.openapi.yml        # Session validation (GET /api/session/validate)
├── checklists/
│   └── requirements.md  # Specification quality checklist (already exists)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (Docusaurus frontend + Vercel backend)

# 1. Docusaurus Static Site (Frontend)
docs/                                # MDX chapter content (English only; Urdu lazy-loaded)
├── 00-preface.mdx
├── 01-foundations.mdx
├── 02-ros2-basics.mdx
├── ...
└── 13-future.mdx

src/
├── components/                      # React components
│   ├── PersonalizeButton/           # "Personalise this chapter" toggle
│   │   ├── index.tsx
│   │   └── PersonalizeButton.module.css
│   ├── UrduToggle/                  # "اردو میں دیکھیں / View in Urdu" toggle
│   │   ├── index.tsx
│   │   ├── UrduToggle.module.css
│   │   └── useUrduTranslation.ts    # Hook for lazy-loading Urdu from API
│   ├── AuthProvider/                # Better-Auth context provider
│   │   ├── index.tsx
│   │   └── useAuth.ts
│   └── PersonalizationProvider/     # Personalization state management
│       ├── index.tsx
│       └── usePersonalization.ts
├── pages/                           # Docusaurus pages
│   ├── index.tsx                    # Homepage with cover image
│   ├── signup.tsx                   # Registration form (5 personalization questions)
│   └── profile.tsx                  # User profile editor
├── css/
│   └── custom.css                   # Dark mode, responsive styles
└── theme/                           # Docusaurus theme overrides
    └── MDXComponents.tsx            # Custom MDX components for personalization

static/
├── img/
│   ├── book-cover-image.jpg         # 1600×840 px cover (dark-mode ready)
│   └── diagrams/                    # SVG diagrams with source files
└── ...

docusaurus.config.js                 # Docusaurus configuration (theme, plugins, i18n stub)
package.json                         # Frontend dependencies

# 2. Vercel Serverless Backend (API)
api/                                 # Vercel serverless functions
├── auth/
│   ├── signup.ts                    # POST /api/auth/signup (create user + profile)
│   ├── login.ts                     # POST /api/auth/login (create session)
│   └── logout.ts                    # POST /api/auth/logout (invalidate session)
├── profile/
│   ├── get.ts                       # GET /api/profile (fetch user profile)
│   └── update.ts                    # PATCH /api/profile (update 5 questions)
├── translation/
│   └── [chapterId].ts               # GET /api/translation/:chapterId (lazy-load Urdu)
├── session/
│   └── validate.ts                  # GET /api/session/validate (check auth + idle timeout)
└── lib/
    ├── supabase.ts                  # Supabase client initialization
    ├── auth.ts                      # Better-Auth configuration
    └── session.ts                   # Session validation logic (90d max, 7d idle)

# 3. Database (Supabase - managed externally)
# Schema defined in specs/001-textbook-platform/data-model.md
# Tables: users, personalization_profiles, sessions, translation_content, labs

# 4. Companion Labs Repository (separate repo: github.com/physical-ai/labs)
# Structure (example for one lab):
labs/
├── chapter-03-urdf/
│   ├── README.md                    # Setup instructions, expected output
│   ├── Dockerfile                   # Ubuntu 22.04 + ROS Humble base
│   ├── docker-compose.yml           # Container orchestration
│   ├── .devcontainer/
│   │   └── devcontainer.json        # GitHub Codespaces configuration
│   ├── src/
│   │   └── urdf_robot.py            # Lab code
│   ├── requirements.txt             # Python dependencies (versioned)
│   └── package.xml                  # ROS 2 package manifest
└── ...                              # 40+ labs total

# 5. Testing
tests/
├── frontend/
│   ├── components/
│   │   ├── PersonalizeButton.test.tsx
│   │   └── UrduToggle.test.tsx
│   └── e2e/
│       ├── personalization.spec.ts  # Playwright E2E: toggle, content swap
│       └── translation.spec.ts      # Playwright E2E: Urdu fetch, cache
├── backend/
│   ├── auth.test.ts                 # API tests for signup/login/logout
│   ├── profile.test.ts              # API tests for profile CRUD
│   └── translation.test.ts          # API tests for Urdu lazy-loading
└── citation-validator/
    └── validate-citations.js        # Custom script: enforces ≥50% peer-reviewed

# 6. CI/CD
.github/
└── workflows/
    ├── build-deploy.yml             # Deploy Docusaurus to GitHub Pages
    ├── test-frontend.yml            # Run Jest + Playwright tests
    ├── test-backend.yml             # Run Vitest API tests
    ├── test-labs.yml                # Docker-based lab tests (Windows/Mac/Linux matrix)
    └── validate-citations.yml       # Run citation validator on PRs
```

**Structure Decision**: This is a **web application** (Docusaurus static site + Vercel serverless backend). Docusaurus handles static content (MDX chapters, images, cover) and client-side React components (PersonalizeButton, UrduToggle). Vercel serverless functions (`api/`) handle dynamic features (auth, profiles, Urdu translations) with Supabase as the database. Companion labs are in a separate repository (`github.com/physical-ai/labs`) with Docker-based execution.

**Rationale for separation**:
- **Docusaurus**: Optimized for static content generation, SEO, mobile responsiveness, dark mode
- **Vercel**: Serverless auto-scaling, edge deployment, <150ms cold start for API endpoints
- **Supabase**: Managed PostgreSQL with real-time subscriptions, row-level security, automatic backups
- **Separate labs repo**: Keeps large Docker images/code out of textbook site repo; allows independent versioning

## Complexity Tracking

> **No violations detected.** Constitution Check passed all 5 principles without justifications needed. This table is not applicable.

## Phase 0: Research & Technology Decisions

(See `research.md` for detailed findings)

**Research Tasks** (to resolve unknowns and validate technology choices):

1. **Docusaurus 3 i18n + Custom Lazy-Loading**: Research Docusaurus i18n plugin limitations (full rebuild per language) vs custom client-side lazy-loading approach (API fetch + localStorage cache)
2. **Better-Auth + Supabase Integration**: Best practices for session management (JWT vs cookie-based), idle timeout implementation, 90-day session renewal
3. **Docker Multi-Platform GUI Forwarding**: Solutions for RViz visualization access (X11 forwarding on Linux, XQuartz on Mac, VcXsrv/X410 on Windows)
4. **Vercel Serverless Function Limits**: Payload size limits (4.5 MB compressed), cold start mitigation, edge caching for translation API
5. **Urdu UTF-8 Encoding + Font Support**: Nastaliq script rendering in browsers, left-to-right layout (not RTL), Google Fonts or self-hosted Noto Nastaliq Urdu
6. **Citation Validation Automation**: Parsing APA 7 citations from MDX/YAML, categorizing sources (peer-reviewed/official/secondary), enforcing percentages
7. **GitHub Codespaces GPU Support**: Availability of GPU-enabled devcontainers for Isaac Sim labs, cost implications, fallback to NVIDIA cloud
8. **Personalization Content Authoring Strategy**: MDX conditional components (e.g., `<Beginner>`, `<Advanced>`) vs separate files, impact on authoring workflow

**Output**: `research.md` with decisions, rationale, and alternatives for each research task above.

## Phase 1: Design Artifacts

### 1. Data Model (`data-model.md`)

Entities derived from spec (FR-010 to FR-039, Key Entities section):
- **User**: email, password_hash, created_at, last_login
- **PersonalizationProfile**: user_id (FK), python_skill, ros_experience, linux_familiarity, gpu_access, budget_tier
- **Session**: session_id, user_id (FK), token_hash, created_at, last_activity, expires_at, personalization_enabled, language_preference
- **TranslationContent**: chapter_id, language, mdx_content, completeness_percentage, last_updated
- **Lab**: lab_id, chapter_ids (array), title, docker_image, github_url, platform_requirements
- **Citation**: citation_id, chapter_id, url, title, authors, year, type (peer-reviewed/official/secondary)

### 2. API Contracts (`contracts/`)

OpenAPI 3.0 schemas for:
- **POST /api/auth/signup**: Request (email, password, 5 profile answers), Response (user, session_token)
- **POST /api/auth/login**: Request (email, password), Response (session_token, profile)
- **POST /api/auth/logout**: Request (session_token), Response (success)
- **GET /api/profile**: Headers (Authorization: Bearer <token>), Response (5 profile questions + answers)
- **PATCH /api/profile**: Request (updated profile answers), Response (updated profile)
- **GET /api/translation/:chapterId**: Query (language=ur), Response (mdx_content, completeness_percentage), Caching (ETag, max-age=7d)
- **GET /api/session/validate**: Headers (Authorization), Response (valid, user, idle_timeout_warning)

### 3. Quickstart Guide (`quickstart.md`)

**Prerequisites**: Node.js 20.x, Docker Desktop (Windows/Mac) or Docker Engine (Linux), Supabase account, Vercel account (for deployment)

**Local Development Setup**:
1. Clone repo: `git clone github.com/physical-ai/textbook && cd textbook`
2. Install dependencies: `npm install`
3. Set up `.env.local` with Supabase URL/key, Better-Auth secret
4. Run Docusaurus dev server: `npm run start` (localhost:3000)
5. Run Vercel dev server: `vercel dev` (localhost:3001 for API)
6. Access site at `http://localhost:3000`, API at `http://localhost:3001/api`

**Lab Development**:
1. Clone labs repo: `git clone github.com/physical-ai/labs`
2. Navigate to lab: `cd labs/chapter-03-urdf`
3. Build Docker image: `docker compose build`
4. Run lab: `docker compose up` (RViz GUI via X11/VNC)
5. Alternative: Open in GitHub Codespaces (click "Open in Codespaces" button)

**Deployment**:
- **Docusaurus**: `npm run build && npm run deploy` (GitHub Pages via `gh-pages` branch)
- **Vercel**: `vercel --prod` (auto-deploy API endpoints)
- **Supabase**: Run migrations via `supabase db push`

### 4. Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude` to add:
- Docusaurus 3 (static site generator)
- Better-Auth (authentication library)
- Supabase (PostgreSQL backend)
- Docker Desktop/Engine (containerization)
- Vercel (serverless functions)

---

## Next Steps

This plan concludes Phase 1 (Design). Proceed with:

1. **Generate research.md**: Document technology decisions from Phase 0 research tasks
2. **Generate data-model.md**: Define schemas for 6 entities (User, PersonalizationProfile, Session, TranslationContent, Lab, Citation)
3. **Generate contracts/**: Create OpenAPI 3.0 specs for 7 API endpoints
4. **Generate quickstart.md**: Write developer setup guide
5. **Run `/sp.tasks`**: Generate actionable task list from this plan

**Estimated Complexity**: **High** due to:
- Multi-platform Docker setup (GUI forwarding for RViz on Windows/Mac/Linux)
- Custom lazy-loading i18n (Docusaurus doesn't support this natively)
- Session management with idle timeout tracking (requires background job or middleware)
- Citation validation automation (parsing APA 7 from MDX, categorizing sources)

**Key Risks** (from spec):
- Lab reproducibility across Docker versions/platforms (GPU passthrough, X11 forwarding)
- Translation quality (≥95% Urdu accuracy requires skilled translators or GPT-4 + review)
- Personalization complexity (30-50% more content per chapter for difficulty/hardware variations)
