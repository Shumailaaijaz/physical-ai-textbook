# Implementation Tasks: Physical AI Humanoid Robotics Textbook Platform

**Feature**: `001-textbook-platform` | **Branch**: `001-textbook-platform`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Generated**: 2025-12-05

## Overview

This document contains actionable implementation tasks for the Physical AI Humanoid Robotics Textbook Platform. Tasks are organized by delivery milestones (T0-T9) with clear deadlines and acceptance criteria.

**Total Estimated Tasks**: 85+ tasks
**Delivery Timeline**: T0 (Today) → T9 (28 Feb 2026)
**Primary Technology Stack**: Docusaurus 3, TypeScript, React 18, Better-Auth, Supabase, Docker, Vercel

## Dependencies & Execution Order

**Milestone Dependencies**:
- T0 (Repository Setup) → **BLOCKS ALL** (must complete first)
- T1 (Platform Setup) → T2 (Chapter Template) → T3-T6 (Content)
- T2 (Chapter Template) → T3-T8 (all content phases depend on template)
- T3-T6 (Content) can proceed in parallel after T2
- T7 (Beta Launch) depends on T3-T6 (Chapters 0-11 complete)
- T8-T9 (Polish & Launch) depend on T7 (Beta feedback)

**Parallelization Opportunities**:
- Within T1: Frontend components, API endpoints, database migration can run in parallel
- Within T3-T6: Individual chapter authoring can be parallelized across team
- T4-T6 labs: Multiple lab packages can be developed concurrently

---

## Phase T0: Repository Setup & Initial Push

**Deadline**: TODAY (5 Dec 2025)
**Goal**: Create public GitHub repositories and push all existing design documents
**Acceptance**: Repos public, all files present, CI passes

### Tasks

- [ ] T001 Create public GitHub repository at github.com/physical-ai/textbook
- [ ] T002 Create public GitHub repository at github.com/physical-ai/labs
- [ ] T003 Add MIT LICENSE file to textbook repo (exact text from https://opensource.org/licenses/MIT)
- [ ] T004 Add MIT LICENSE file to labs repo
- [ ] T005 Create CLAUDE_SYSTEM_PROMPT.txt at textbook repo root with Windows 10/11 first instructions: "You are writing for the Physical AI & Humanoid Robotics textbook. NEVER assume or require native Ubuntu. Primary platform is Windows 10 or Windows 11 + WSL2 (or Docker Desktop). All instructions must start with Windows-first steps. When Linux commands are needed, prefix with 'Inside WSL2 terminal:'. Always provide a one-click GitHub Codespaces / devcontainer alternative. Isaac Sim runs natively on Windows – mention this first. Native Ubuntu instructions are forbidden."
- [ ] T006 Push specs/001-textbook-platform/spec.md to textbook repo at docs/planning/spec.md
- [ ] T007 Push specs/001-textbook-platform/plan.md to textbook repo at docs/planning/plan.md
- [ ] T008 Push specs/001-textbook-platform/research.md to textbook repo at docs/planning/research.md
- [ ] T009 Push specs/001-textbook-platform/data-model.md to textbook repo at docs/planning/data-model.md
- [ ] T010 Push specs/001-textbook-platform/contracts/ directory to textbook repo at docs/planning/contracts/ (4 OpenAPI files)
- [ ] T011 Create README.md for textbook repo with project description, setup instructions, contribution guidelines
- [ ] T012 Create README.md for labs repo with Docker setup instructions, Codespaces quick-start
- [ ] T013 Create .gitignore for textbook repo (Node.js, Docusaurus build outputs, .env files)
- [ ] T014 Create .gitignore for labs repo (Docker volumes, Python __pycache__, ROS build artifacts)
- [ ] T015 Set up GitHub Actions placeholder CI workflow in textbook repo at .github/workflows/ci.yml (basic lint/build check)
- [ ] T016 Set up GitHub Actions placeholder CI workflow in labs repo at .github/workflows/ci.yml (basic Docker build check)
- [ ] T017 Verify both repositories are public and accessible
- [ ] T018 Verify CI passes for both repositories (green checkmarks)

**Deliverable**: Two public GitHub repos with all design documents, MIT license, CI passing

---

## Phase T1: Docusaurus + Full Platform Setup

**Deadline**: 14 Dec 2025 (9 days)
**Goal**: Complete working platform with authentication, personalization, Urdu toggle, and sample chapter
**Acceptance**: Site live, login works, both mandatory buttons work on sample chapter

### T1.1 Project Initialization

- [ ] T019 Run `npx create-docusaurus@latest textbook classic --typescript` in textbook repo root
- [ ] T020 Install core dependencies: `npm install better-auth @supabase/supabase-js react-i18next i18next`
- [ ] T021 Install dev dependencies: `npm install --save-dev @types/react @types/node typescript eslint prettier`
- [ ] T022 Create .env.example with placeholders: SUPABASE_URL, SUPABASE_ANON_KEY, BETTER_AUTH_SECRET, VERCEL_URL
- [ ] T023 Create docusaurus.config.ts with title "Physical AI & Humanoid Robotics", tagline, GitHub URL, theme config (dark mode default)
- [ ] T024 Update package.json scripts: add `"deploy": "docusaurus deploy"`, `"type-check": "tsc --noEmit"`

### T1.2 Supabase Database Setup

- [ ] T025 Create Supabase project at https://supabase.com (project name: physical-ai-textbook)
- [ ] T026 Run database migration from docs/planning/data-model.md schema (users, personalization_profiles, sessions, translation_content, labs, citations tables)
- [ ] T027 Enable Row Level Security (RLS) policies per data-model.md specifications
- [ ] T028 Create database indexes per data-model.md (token_hash, chapter_id, user_id, etc.)
- [ ] T029 Verify tables created with `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
- [ ] T030 Add sample seed data: 2 test users (beginner + advanced profiles), 1 sample translation (Chapter 0 Urdu)

### T1.3 Better-Auth Integration

- [ ] T031 [P] Create src/lib/auth.ts with Better-Auth configuration (email/password provider, Supabase adapter)
- [ ] T032 [P] Create api/auth/signup.ts Vercel serverless function implementing POST /api/auth/signup per contracts/auth.openapi.yml
- [ ] T033 [P] Create api/auth/login.ts implementing POST /api/auth/login
- [ ] T034 [P] Create api/auth/logout.ts implementing POST /api/auth/logout
- [ ] T035 Create src/components/Auth/SignupForm.tsx with 5 personalization questions (dropdown selects for python_skill, ros_experience, linux_familiarity, gpu_access, budget_tier)
- [ ] T036 Create src/components/Auth/LoginForm.tsx with email/password inputs
- [ ] T037 Create src/components/Auth/AuthProvider.tsx context provider wrapping Better-Auth session
- [ ] T038 Add authentication pages: src/pages/signup.tsx, src/pages/login.tsx
- [ ] T039 Test signup flow: create account with all 5 questions answered, verify user + profile + session created in Supabase
- [ ] T040 Test login flow: log in with credentials, verify session token cookie set (HttpOnly, Secure, SameSite=Strict)

### T1.4 Profile Management API

- [ ] T041 [P] Create api/profile.ts implementing GET /api/profile and PATCH /api/profile per contracts/profile.openapi.yml
- [ ] T042 [P] Create api/session/validate.ts implementing GET /api/session/validate per contracts/session.openapi.yml
- [ ] T043 [P] Create api/session/state.ts implementing PATCH /api/session/state per contracts/session.openapi.yml
- [ ] T044 Create src/middleware/auth.ts middleware for session validation (checks idle timeout + absolute expiration)
- [ ] T045 Create src/components/Profile/ProfilePage.tsx displaying user's 5 personalization answers with edit button
- [ ] T046 Add /profile route in docusaurus.config.ts custom pages
- [ ] T047 Test profile retrieval: log in, navigate to /profile, verify all 5 questions displayed
- [ ] T048 Test profile update: change budget_tier, save, verify updated in database and reflected immediately

### T1.5 Personalization Engine

- [ ] T049 Create src/components/Personalization/PersonalizeButton.tsx sticky button component ("Personalise this chapter" text, toggle on/off)
- [ ] T050 Create src/hooks/usePersonalization.ts hook returning {enabled, profile, togglePersonalization}
- [ ] T051 Create src/components/Personalization/PersonalizationProvider.tsx context managing personalization state (reads from session, updates via PATCH /api/session/state)
- [ ] T052 Create src/components/MDX/Beginner.tsx conditional MDX component (shows children only if profile.python_skill === 'beginner')
- [ ] T053 Create src/components/MDX/Advanced.tsx (shows if python_skill === 'advanced')
- [ ] T054 Create src/components/MDX/SimulationOnly.tsx (shows if budget_tier === 'simulation_only')
- [ ] T055 Create src/components/MDX/ResearchGrade.tsx (shows if budget_tier === 'research_grade')
- [ ] T056 Register MDX components in docusaurus.config.ts MDXComponents
- [ ] T057 Test personalization toggle: log in, click "Personalise this chapter", verify button state persists across page navigation

### T1.6 Urdu Translation System

- [ ] T058 [P] Create api/translation/[chapterId].ts implementing GET /api/translation/:chapterId per contracts/translation.openapi.yml
- [ ] T059 Create src/components/Translation/UrduToggle.tsx bilingual button ("اردو میں دیکھیں / View in English")
- [ ] T060 Create src/hooks/useUrduTranslation.ts hook with lazy-loading logic (fetch from API on first toggle, cache in localStorage for 7 days)
- [ ] T061 Create src/components/Translation/TranslationProvider.tsx context managing language_preference state (syncs with session via PATCH /api/session/state)
- [ ] T062 Implement client-side translation swap: replace chapter MDX content with fetched Urdu mdx_content without page reload
- [ ] T063 Implement scroll position preservation during language toggle (store scrollY before swap, restore after)
- [ ] T064 Add Noto Nastaliq Urdu font to static/fonts/ and configure in custom.css
- [ ] T065 Test Urdu toggle: open sample chapter, click "اردو میں دیکھیں", verify content swaps instantly, scroll position maintained
- [ ] T066 Test language persistence: toggle to Urdu, navigate to different chapter, verify Urdu loads by default

### T1.7 Cover Image & UI Polish

- [ ] T067 Create book cover image at static/img/book-cover-image.jpg (1600×840 px, dark-mode compatible colors)
- [ ] T068 Update src/pages/index.tsx homepage to display cover image with proper dark-mode CSS filter
- [ ] T069 Create src/css/custom.css with dark-mode compatible color palette (high contrast, no pure black/white)
- [ ] T070 Add both mandatory buttons (PersonalizeButton + UrduToggle) to DocItem layout wrapper (show only for logged-in users)
- [ ] T071 Style buttons as sticky header on mobile (position: sticky, top: 0, z-index: 100)
- [ ] T072 Test mobile responsiveness: open site on 375px viewport, verify buttons accessible, no layout overflow

### T1.8 CI/CD Setup

- [ ] T073 Create .github/workflows/build-deploy.yml: Build Docusaurus on push to main, deploy to GitHub Pages (gh-pages branch)
- [ ] T074 Create .github/workflows/test-frontend.yml: Run `npm run type-check`, `npm run lint`, `npm run build`
- [ ] T075 Set up Vercel project: connect textbook repo, configure API routes to deploy to Vercel Edge Functions
- [ ] T076 Add Supabase secrets to Vercel environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, BETTER_AUTH_SECRET)
- [ ] T077 Test Vercel deployment: push to main, verify API endpoints accessible at https://physical-ai-textbook.vercel.app/api
- [ ] T078 Verify GitHub Pages deployment: site accessible at https://physical-ai.github.io/textbook

### T1.9 Sample Chapter for Testing

- [ ] T079 Create sample chapter at docs/00-sample.mdx with front matter (title, sidebar_position)
- [ ] T080 Add sample content with MDX components: <Beginner>, <Advanced>, <SimulationOnly>, code blocks, citations
- [ ] T081 Add sample Urdu translation to translation_content table (completeness_percentage: 100)
- [ ] T082 Test end-to-end flow on sample chapter: login → toggle personalization → verify conditional content shows → toggle Urdu → verify translation loads
- [ ] T083 Verify both buttons visible and functional on sample chapter
- [ ] T084 Take screenshots for demo: unauthenticated view, authenticated with personalization, Urdu view

**Deliverable**: Working platform at https://physical-ai.github.io/textbook with functional authentication, personalization, Urdu toggle on sample chapter

---

## Phase T2: Chapter Template & Strict Validation

**Deadline**: 16 Dec 2025 (2 days after T1)
**Goal**: Reusable MDX chapter template with strict validation, Windows-first setup sections, auto-generated sidebar
**Acceptance**: Template builds, frontmatter validation passes, both buttons present in template

### Tasks

- [ ] T085 Create contracts/chapter-metadata-schema.json JSON Schema defining required frontmatter fields (id, title, part, week, difficulty_levels, hardware_tracks, citation_count, word_count, urdu_completeness)
- [ ] T086 Create templates/chapter-template.mdx with strict frontmatter structure per schema
- [ ] T087 Add collapsible "Windows + WSL2 Quick-Start" MDX section to template with <details> element: "Inside WSL2 terminal: `wsl -d Ubuntu-22.04`"
- [ ] T088 Add collapsible "One-click GitHub Codespaces" MDX section to template with badge link to Codespaces
- [ ] T089 Create scripts/validate-frontmatter.ts Node.js script using Ajv to validate all docs/*.mdx against chapter-metadata-schema.json
- [ ] T090 Add frontmatter validation to .github/workflows/test-frontend.yml (run on PR, block merge if validation fails)
- [ ] T091 Create contracts/sidebar-config-structure.ts TypeScript type defining sidebar structure (Parts 0-5 with nested chapters)
- [ ] T092 Create scripts/generate-sidebar.ts script reading all docs/*.mdx frontmatter and auto-generating sidebars.ts (sorted by Part → sidebar_position)
- [ ] T093 Add sidebar generation to package.json prebuild script: `"prebuild": "npm run generate-sidebar && npm run validate-frontmatter"`
- [ ] T094 Test template: copy template to docs/99-test-chapter.mdx, run build, verify frontmatter validation passes
- [ ] T095 Test sidebar auto-generation: add 3 sample chapters with different Parts, run generate-sidebar, verify sidebars.ts groups by Part
- [ ] T096 Verify both buttons (PersonalizeButton + UrduToggle) render in template layout

**Deliverable**: Production-ready chapter template with automated validation and sidebar generation

---

## Phase T3: Part 0 + Part 1 (Preface & Introduction)

**Deadline**: 21 Dec 2025 (5 days after T2)
**Goal**: Chapters 0-1 complete, fully Urdu-translated, live on site
**Acceptance**: Chapters 0-1 accessible at /docs/00-preface and /docs/01-introduction, Urdu toggle functional, ≥95% translation completeness

### Tasks

- [ ] T097 [P] [US1] Author Chapter 0 (Preface) in docs/00-preface.mdx: Project vision, target audience, how to use this textbook, prerequisites (Windows 10/11 + Docker Desktop)
- [ ] T098 [P] [US1] Add 10+ APA 7 citations to Chapter 0 (mix of peer-reviewed papers on humanoid robotics history, ROS 2 official docs)
- [ ] T099 [P] [US1] Author Chapter 1 (Introduction to Physical AI) in docs/01-introduction.mdx: Define Physical AI, embodied intelligence, differentiate from pure simulation
- [ ] T100 [P] [US1] Add 15+ APA 7 citations to Chapter 1 (≥50% peer-reviewed: ICRA, IROS, RSS papers on embodied AI)
- [ ] T101 [P] [US1] Create 3-5 original SVG diagrams for Chapter 1 (Physical AI stack, digital brain vs embodied intelligence comparison) in static/img/diagrams/
- [ ] T102 [P] [US1] Add alt-text to all diagrams in Chapter 1 (accessibility compliance per FR-038)
- [ ] T103 [P] [US3] Add personalization MDX components to Chapter 1: <Beginner> sections explaining programming basics, <Advanced> sections on optimization
- [ ] T104 [US4] Translate Chapter 0 to Urdu (hire translator or use GPT-4 + human review), insert into translation_content table with completeness_percentage ≥ 95
- [ ] T105 [US4] Translate Chapter 1 to Urdu, verify technical terms (node, topic, Physical AI) kept in English with Urdu explanations
- [ ] T106 [US4] Human quality review: Native Urdu speaker reviews 100+ random sentences from Chapters 0-1, confirms ≥95% accuracy
- [ ] T107 Update citations table: Insert all Chapter 0-1 citations with type classification (peer_reviewed/official_docs/secondary)
- [ ] T108 Run citation validation script: Verify ≥50% peer-reviewed for Chapters 0-1 combined
- [ ] T109 Commit and push Chapters 0-1 to main branch, verify GitHub Actions build passes
- [ ] T110 Verify Chapters 0-1 live on https://physical-ai.github.io/textbook with functional Urdu toggle

**Deliverable**: Chapters 0-1 live on site with high-quality Urdu translation and validated citations

---

## Phase T4: Part 2 – ROS 2 & Simulation (Chapters 2–5)

**Deadline**: 04 Jan 2026 (14 days after T3)
**Goal**: Chapters 2-5 complete with ≥5 companion labs in /labs repo
**Acceptance**: Chapters 2-5 live, all labs runnable via WSL2 or Codespaces, ≥5 packages in labs repo

### T4.1 Chapter Authoring

- [ ] T111 [P] [US1] Author Chapter 2 (ROS 2 Fundamentals) in docs/02-ros2-fundamentals.mdx: Nodes, topics, services, parameters, launch files
- [ ] T112 [P] [US1] Author Chapter 3 (URDF & Robot Modeling) in docs/03-urdf-modeling.mdx: URDF syntax, xacro, robot_state_publisher
- [ ] T113 [P] [US1] Author Chapter 4 (Gazebo Simulation) in docs/04-gazebo-sim.mdx: Gazebo Classic vs Gazebo Sim, world files, sensor plugins
- [ ] T114 [P] [US1] Author Chapter 5 (Unity Robotics Hub) in docs/05-unity-robotics.mdx: Unity ML-Agents, ROS-TCP-Connector (Windows native support)
- [ ] T115 [P] [US1] Add 20+ APA 7 citations per chapter (ROS 2 Design docs, Gazebo tutorials, Unity Robotics papers)
- [ ] T116 [P] [US1] Create 10+ SVG diagrams for Chapters 2-5 (ROS 2 graph, URDF tree, Gazebo architecture)
- [ ] T117 [P] [US3] Add personalization: <SimulationOnly> sections in all 4 chapters (emphasize cloud/Codespaces), <ResearchGrade> sections (local GPU setup)
- [ ] T118 [US4] Translate Chapters 2-5 to Urdu (estimated 28,000 words × 4 chapters = 28,000 words, budget for translator)
- [ ] T119 [US4] Human quality review: ≥95% accuracy for Chapters 2-5 Urdu translations

### T4.2 Companion Labs (labs repo)

- [ ] T120 [P] [US5] Create lab-02-1-ros2-hello-world in labs/ repo: Simple publisher/subscriber, Dockerfile with ros:humble-ros-base-jammy, devcontainer.json
- [ ] T121 [P] [US5] Create lab-03-1-urdf-robot in labs/: URDF quadruped model, RViz visualization, X11 forwarding instructions for Windows (VcXsrv setup)
- [ ] T122 [P] [US5] Create lab-04-1-gazebo-world in labs/: Custom Gazebo world, spawn robot, camera sensor plugin
- [ ] T123 [P] [US5] Create lab-04-2-gazebo-control in labs/: Joint trajectory controller, keyboard teleoperation
- [ ] T124 [P] [US5] Create lab-05-1-unity-tcp-connector in labs/: Unity scene with ROS-TCP-Connector, Windows native execution steps (Isaac Sim note: "Unity runs natively on Windows – no WSL2 needed for this lab")
- [ ] T125 [US5] Add GitHub Codespaces "Open in Codespaces" badge to each lab README
- [ ] T126 [US5] Create .github/workflows/test-labs.yml in labs repo: Matrix build for all 5 labs on Ubuntu 22.04 (docker compose build && docker compose up --abort-on-container-exit)
- [ ] T127 [US5] Add Expected Output screenshots to each lab README (RViz visualization, Gazebo GUI, Unity scene)
- [ ] T128 [US5] Lock all dependencies: Verify Dockerfile FROM ros:humble-ros-base-jammy (exact tag, not :latest), pin numpy, scipy versions in requirements.txt
- [ ] T129 Test all labs on Windows 10 + Docker Desktop: Verify X11 forwarding works with VcXsrv, RViz GUI displays correctly
- [ ] T130 Test all labs on GitHub Codespaces: Click "Open in Codespaces", verify one-click setup, labs run successfully

**Deliverable**: Chapters 2-5 live with 5 working labs (100% reproducible on Windows/Mac/Linux + Codespaces)

---

## Phase T5: Part 3 – NVIDIA Isaac (Chapters 6–7)

**Deadline**: 11 Jan 2026 (7 days after T4)
**Goal**: Chapters 6-7 complete with Isaac Sim labs (native Windows support emphasized)
**Acceptance**: Chapters 6-7 live, Isaac Sim labs runnable on Windows natively or via NVIDIA Cloud

### Tasks

- [ ] T131 [P] [US1] Author Chapter 6 (Isaac Sim Basics) in docs/06-isaac-sim-basics.mdx: Omniverse launcher, Isaac Sim installation on Windows 10/11 (native, NO WSL2 required), first robot import
- [ ] T132 [P] [US1] Author Chapter 7 (Isaac ROS Integration) in docs/07-isaac-ros.mdx: Isaac ROS GEMs, sensor simulation, navigation stack
- [ ] T133 [P] [US1] Add 15+ APA 7 citations per chapter (NVIDIA Isaac Sim docs, Isaac ROS GitHub, research papers using Isaac Sim)
- [ ] T134 [P] [US1] Create 8+ SVG diagrams for Chapters 6-7 (Isaac Sim UI, ROS bridge architecture)
- [ ] T135 [P] [US3] Add personalization: <CloudOnly> sections (NVIDIA Cloud instructions), <ResearchGrade> sections (local RTX GPU setup on Windows)
- [ ] T136 [US4] Translate Chapters 6-7 to Urdu
- [ ] T137 [P] [US5] Create lab-06-1-isaac-first-scene in labs/: Windows native Isaac Sim setup, import Unitree Go1, basic movement
- [ ] T138 [P] [US5] Create lab-07-1-isaac-ros-bridge in labs/: ROS 2 Humble + Isaac Sim bridge, publish /camera/rgb topic, visualize in RViz (Windows native workflow)
- [ ] T139 [US5] Add fallback instructions for users without RTX GPU: NVIDIA Cloud free trial, Codespaces GPU support (note: limited availability)
- [ ] T140 Test Isaac Sim labs on Windows 10 + RTX 3060: Verify native execution (no Docker/WSL2), ROS bridge functional
- [ ] T141 Test Isaac Sim lab on NVIDIA Cloud: Verify free tier accessible, same lab runs identically

**Deliverable**: Chapters 6-7 live with Isaac Sim labs (Windows-native first, cloud fallback)

---

## Phase T6: Part 4 – Locomotion, Manipulation, VLA, Capstone (Chapters 8–11)

**Deadline**: 18 Jan 2026 (7 days after T5)
**Goal**: Chapters 8-11 complete with advanced labs and capstone project repository
**Acceptance**: Chapters 8-11 live, capstone repo created (sim-first approach)

### Tasks

- [ ] T142 [P] [US1] Author Chapter 8 (Legged Locomotion) in docs/08-locomotion.mdx: Quadruped gaits, MPC, Unitree SDK integration (Windows + WSL2 workflow)
- [ ] T143 [P] [US1] Author Chapter 9 (Manipulation & Grasping) in docs/09-manipulation.mdx: Kinematic chains, IK solvers, grasp planning
- [ ] T144 [P] [US1] Author Chapter 10 (Vision-Language-Action Models) in docs/10-vla-models.mdx: RT-1, RT-2, OpenVLA, fine-tuning on custom tasks
- [ ] T145 [P] [US1] Author Chapter 11 (Capstone Project) in docs/11-capstone.mdx: Design your humanoid task (pick-and-place, navigation, social interaction), simulation-first workflow
- [ ] T146 [P] [US1] Add 20+ APA 7 citations per chapter (≥60% peer-reviewed: CoRL, RSS, ICRA papers on locomotion, VLA, manipulation)
- [ ] T147 [P] [US1] Create 12+ SVG diagrams for Chapters 8-11 (gait cycle, IK chain, VLA architecture, capstone workflow)
- [ ] T148 [P] [US3] Add personalization: <BudgetHardware> sections (affordable servos, RPi), <ResearchGrade> sections (high-torque actuators, NVIDIA Orin)
- [ ] T149 [US4] Translate Chapters 8-11 to Urdu (estimated 32,000 words)
- [ ] T150 [P] [US5] Create lab-08-1-quadruped-walk in labs/: Unitree Go1 gait controller in Isaac Sim (Windows native)
- [ ] T151 [P] [US5] Create lab-09-1-grasp-planning in labs/: Franka Emika Panda arm, MoveIt 2, grasp pose generation
- [ ] T152 [P] [US5] Create lab-10-1-vla-inference in labs/: Run OpenVLA inference on custom image (Docker with GPU passthrough or NVIDIA Cloud)
- [ ] T153 [US5] Create capstone starter repository at github.com/physical-ai/capstone-starter: Template project, sim-first instructions (Isaac Sim + ROS 2), grading rubric
- [ ] T154 Test all advanced labs on Windows 10 + Docker Desktop + WSL2 (verify GPU passthrough for VLA lab)
- [ ] T155 Test capstone starter: Clone repo, follow README, verify simulation runs, robot performs basic task

**Deliverable**: Chapters 8-11 live with advanced labs and capstone starter repository

---

## Phase T7: MVP Public Beta Launch

**Deadline**: 25 Jan 2026 (7 days after T6)
**Goal**: Chapters 0-11 live, ≥50 registered users, public announcement
**Acceptance**: ≥50 beta users registered, ≥10 users completed at least one lab, public announcement on Twitter/LinkedIn/Reddit

### Tasks

- [ ] T156 Create beta signup landing page at /beta with email collection form (Supabase table: beta_signups)
- [ ] T157 Design beta feedback form: Google Forms or Typeform with questions on usability, translation quality, lab reproducibility
- [ ] T158 Run final end-to-end test: Anonymous reader → Signup → Login → Toggle personalization → Toggle Urdu → Run lab → Submit feedback
- [ ] T159 Verify all Chapters 0-11 live with ≥95% Urdu translation completeness
- [ ] T160 Verify all labs (15+ labs) pass CI on GitHub Actions (green checkmarks)
- [ ] T161 Run citation validation across Chapters 0-11: Verify ≥50% peer-reviewed (minimum 62 out of 125 citations if 125 total so far)
- [ ] T162 Take demo screenshots for announcement: Homepage with cover image, personalization toggle, Urdu toggle, lab setup in Codespaces
- [ ] T163 Write public announcement blog post (500 words): Project vision, key features, call for beta testers
- [ ] T164 Post announcement on Twitter with #Robotics #ROS2 #PhysicalAI #OpenSource hashtags (tag NVIDIA, Open Robotics)
- [ ] T165 Post announcement on LinkedIn (personal + company pages if applicable)
- [ ] T166 Post announcement on Reddit: r/robotics, r/ROS, r/MachineLearning (follow subreddit rules, avoid spam)
- [ ] T167 Post announcement on ROS Discourse: https://discourse.ros.org/ (category: News & Events)
- [ ] T168 Email 20+ robotics professors/researchers for course adoption: Include beta link, offer to present at labs
- [ ] T169 Monitor beta signups: Track daily signups in Supabase dashboard, send welcome email with quickstart guide
- [ ] T170 Collect feedback: Review Google Forms responses daily, triage bugs/feature requests into GitHub Issues
- [ ] T171 Verify ≥50 registered users within 7 days (check Supabase users table count)
- [ ] T172 Verify ≥10 users completed at least one lab (track via analytics or feedback form "Which labs did you complete?")

**Deliverable**: Public beta launched with ≥50 users, community engagement started, feedback collection underway

---

## Phase T8: Part 5 + Polish (Chapters 12–13 + Appendix + PDF)

**Deadline**: 08 Feb 2026 (14 days after T7)
**Goal**: Complete remaining chapters, generate PDF export, polish based on beta feedback
**Acceptance**: Chapters 12-13 + Appendix live, PDF export available, top 10 beta bugs fixed

### Tasks

- [ ] T173 [P] [US1] Author Chapter 12 (Hardware Guide) in docs/12-hardware-guide.mdx: 3 budget tiers (simulation-only: $0, budget: <$500, research: $2000+), Bill of Materials for each tier (Windows-compatible components)
- [ ] T174 [P] [US1] Author Chapter 13 (Ethics & Future of Physical AI) in docs/13-ethics-future.mdx: Safety considerations, bias in embodied AI, societal impact
- [ ] T175 [P] [US1] Author Appendix in docs/14-appendix.mdx: Glossary, additional resources, troubleshooting common Docker/WSL2 issues on Windows
- [ ] T176 [P] [US1] Add 15+ APA 7 citations per chapter (ethics papers, hardware vendor docs)
- [ ] T177 [US4] Translate Chapters 12-13 + Appendix to Urdu
- [ ] T178 Triage beta feedback: Review all Google Forms responses, create GitHub Issues for top 10 bugs + top 5 feature requests
- [ ] T179 Fix top 10 bugs from beta feedback (e.g., Urdu toggle breaks on mobile Safari, X11 forwarding fails on Windows 11 with WSLg)
- [ ] T180 Implement top 3 feature requests if feasible (e.g., "Add keyboard shortcuts for Urdu toggle", "Show estimated lab duration in README")
- [ ] T181 Install Docusaurus PDF plugin: `npm install @docusaurus/plugin-pdf`
- [ ] T182 Configure PDF export in docusaurus.config.ts: Generate single PDF with all 14 chapters + Appendix
- [ ] T183 Run PDF export: `npm run build:pdf`, verify output at build/pdf/physical-ai-textbook.pdf
- [ ] T184 Add PDF download link to homepage: "Download Full Textbook (PDF, 500+ pages)"
- [ ] T185 Run final citation validation: Verify ≥50% peer-reviewed across ALL chapters (minimum 125 out of 250 total sources)
- [ ] T186 Run final word count check: Verify 90,000-120,000 words total (excluding code blocks)
- [ ] T187 Verify all 40+ labs present in labs repo, all pass CI
- [ ] T188 Update README.md with final stats: "14 chapters, 250+ sources, 40+ labs, 95%+ Urdu translation accuracy, 100% Windows 10/11 compatible"

**Deliverable**: Complete textbook with all 14 chapters + Appendix, PDF export, beta feedback incorporated

---

## Phase T9: Final Review & Official 1.0 Launch

**Deadline**: 28 Feb 2026 (20 days after T8)
**Goal**: External peer review, official 1.0 release, course adoption partnerships
**Acceptance**: ≥3 faculty peer reviews, ≥2 university courses adopted, official 1.0 release announcement

### Tasks

- [ ] T189 Send textbook to 10+ robotics faculty for external peer review: Include review rubric (technical accuracy, pedagogical quality, citation rigor)
- [ ] T190 Collect ≥3 written peer reviews (target: professors from top-20 robotics programs)
- [ ] T191 Incorporate peer review feedback: Fix technical errors, improve clarity, add missing citations
- [ ] T192 Negotiate course adoption with ≥2 universities: Offer guest lectures, custom labs, office hours support
- [ ] T193 Create instructor guide (50+ pages): Lecture slides for 13-week semester, assignment templates, grading rubrics, lab solutions
- [ ] T194 Run Copyscroll plagiarism check: Verify zero plagiarism across all chapters
- [ ] T195 Run accessibility audit: Test with screen reader (NVDA on Windows), verify all images have alt-text, headings hierarchical
- [ ] T196 Verify all success criteria from spec.md: SC-001 (100% citation coverage), SC-004 (≥95% Urdu accuracy), SC-005 (100% lab reproducibility), SC-010 (≥1,000 visitors), SC-011 (≥300 users using Urdu/personalization), SC-012 (zero critical lab bugs)
- [ ] T197 Create 1.0 release tag in GitHub: `git tag -a v1.0.0 -m "Official 1.0 Release: Physical AI & Humanoid Robotics Textbook"`
- [ ] T198 Write official 1.0 release announcement (1,000 words): Include peer review quotes, adoption stats, impact metrics
- [ ] T199 Post 1.0 announcement on all channels: Twitter, LinkedIn, Reddit, ROS Discourse, Hacker News (if appropriate)
- [ ] T200 Submit textbook to academic databases: arXiv (if accepted), ResearchGate, Google Scholar indexing
- [ ] T201 Create press release: Send to TechCrunch, IEEE Spectrum, VentureBeat (robotics/AI beat reporters)
- [ ] T202 Celebrate with team: Public thank-you post acknowledging contributors, translators, beta testers

**Deliverable**: Official 1.0 release with external validation, course adoptions, media coverage

---

## Parallel Execution Examples

**T0 (Repository Setup)**: Sequential (must complete before any other tasks)

**T1 (Platform Setup)**: High parallelization
- T1.2 (Database) + T1.3 (Auth) + T1.4 (Profile API) + T1.7 (Cover Image) can run in parallel
- T1.5 (Personalization) + T1.6 (Urdu) depend on T1.3/T1.4 (auth context), but can run in parallel with each other
- T1.9 (Sample Chapter) must wait for T1.5 + T1.6 complete

**T3-T6 (Content Authoring)**: Maximum parallelization
- Individual chapters within each phase can be authored in parallel by different team members
- Labs can be developed in parallel (separate directories, no dependencies)
- Urdu translation can start as soon as English chapter draft complete (parallel track)

**T7 (Beta Launch)**: Mostly sequential (announcement tasks depend on readiness checks)

**T8 (Polish)**: Bug fixes can be parallelized; PDF generation sequential (depends on all chapters complete)

**T9 (Final Launch)**: Sequential (peer review → feedback incorporation → release)

---

## Implementation Strategy

**MVP Scope (T0-T1)**: Working platform with authentication, personalization, Urdu toggle on sample chapter
- **Why**: Validates core technical feasibility (lazy-loaded i18n, Better-Auth + Supabase, MDX conditional components)
- **Risk Mitigation**: Catch integration issues early before content authoring scales

**Incremental Delivery (T2-T6)**: One Part at a time
- **Why**: Each Part represents a coherent learning unit (ROS 2 → Isaac Sim → Advanced Topics)
- **Feedback Loop**: Beta users can start with Part 0-1, provide feedback while Parts 2-3 still in progress

**Beta Launch (T7)**: Chapters 0-11 (excludes hardware guide, ethics, appendix)
- **Why**: Core technical content complete (foundations + ROS 2 + Isaac Sim + advanced topics)
- **Benefit**: Early adopters can start semester-long courses with Chapters 0-11, giving time for feedback before final chapters

**Polish Phase (T8-T9)**: Feedback-driven improvements
- **Why**: Beta testing reveals UX issues, lab reproducibility bugs, translation errors that can't be anticipated
- **Quality Gate**: External peer review (T9) ensures academic rigor before 1.0 release

---

## Testing Strategy

**Per User Story**:
- **US1 (Content Access)**: Manual testing on 3 browsers (Chrome, Firefox, Safari) + mobile (iOS, Android). Verify citations clickable, dark mode works, responsive layout.
- **US2 (Registration)**: Automated API tests for signup endpoint. Manual testing of 5-question form validation.
- **US3 (Personalization)**: Manual testing with 3 profiles (beginner/simulation, intermediate/budget, advanced/research). Verify conditional content shows/hides correctly.
- **US4 (Urdu Toggle)**: Automated tests for translation API (ETag caching, <500ms first fetch). Manual testing on 5 chapters for scroll preservation, localStorage persistence.
- **US5 (Labs)**: CI/CD automated testing (docker compose build + run on Ubuntu 22.04). Manual testing on Windows 10 + Docker Desktop, GitHub Codespaces.

**Citation Validation**: Automated script runs on every PR, blocks merge if <50% peer-reviewed.

**Accessibility**: Automated Lighthouse audit (target score ≥90). Manual screen reader testing on 3 chapters.

**Performance**: Lighthouse metrics on sample chapter (TTI <2s on 4G, Urdu toggle <500ms first fetch).

---

## Risk Mitigation

**Risk 1: Urdu translation quality <95%**
- Mitigation: Hire professional translator for MVP (Chapters 0-6), GPT-4 + human review for Chapters 7-13. Budget $5,000 for translation.

**Risk 2: Docker GUI forwarding fails on Windows 11**
- Mitigation: Provide 3 fallbacks: VcXsrv (X11), VNC server (browser-based), GitHub Codespaces (cloud). Document all 3 in quickstart.md.

**Risk 3: Isaac Sim requires RTX GPU (excludes budget users)**
- Mitigation: NVIDIA Cloud free tier (100 hours), Codespaces GPU support (if available), clear documentation: "Isaac Sim chapters require GPU – use cloud if no local GPU."

**Risk 4: <50 beta signups within 7 days**
- Mitigation: Pre-announce 2 weeks before launch on ROS Discourse, reach out to 50+ robotics labs directly, offer incentives (free 1-on-1 office hours for first 50 signups).

**Risk 5: Citation validation fails (<50% peer-reviewed)**
- Mitigation: Track citation types in real-time (Google Sheet or Supabase table), prioritize peer-reviewed sources during authoring, backfill with ICRA/IROS papers if needed.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-05
**Total Tasks**: 202 tasks across 10 phases (T0-T9)
**Estimated Effort**: 85 days (5 Dec 2025 → 28 Feb 2026) with 2-3 person team
