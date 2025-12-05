# Feature Specification: Physical AI Humanoid Robotics Textbook Platform

**Feature Branch**: `001-textbook-platform`
**Created**: 2025-12-05
**Status**: Draft
**Input**: User description: "Physical AI & Humanoid Robotics: From Digital Brain to Embodied Intelligence - A comprehensive Docusaurus-based textbook with authentication, personalization, and bilingual (English/Urdu) support"

## Clarifications

### Session 2025-12-05

- Q: How should Urdu translation content be structured and delivered (Docusaurus i18n with separate routes, pre-generated bundle, lazy-loaded API, or runtime translation)? → A: Custom client-side translation loading - English content served via Docusaurus, Urdu fetched from Vercel API or Supabase on first toggle per chapter (lazy-loaded, <500ms first toggle, instant thereafter with caching)

- Q: Should the specification reflect Windows 10/11 + WSL2 as primary platform, multi-platform with equal priority, or platform-agnostic containers for all labs? → A: Platform-agnostic with containers - All labs run in Docker containers via Docker Desktop (Windows/Mac) or Docker Engine (Linux), ensuring consistent environment regardless of host OS. Primary audience uses Windows 10/11 + Docker Desktop; GitHub Codespaces/devcontainers as one-click cloud alternative.

- Q: What should the default session expiration duration be (24 hours, 7 days, 30 days, or 90 days with idle timeout)? → A: 90 days default session duration with 7-day idle timeout - Long-lived sessions support semester-long courses (13 weeks + buffer), but automatic logout after 7 days of inactivity maintains security and prevents stale sessions on shared computers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anonymous Reader Accessing Core Content (Priority: P1)

A robotics student or practitioner visits the textbook website to learn about humanoid robotics. They can browse all 14 chapters, read technical content with proper citations, view diagrams, and access code examples without creating an account. The content is well-structured, mobile-responsive, and includes a dark-mode compatible cover image.

**Why this priority**: This is the foundational value proposition—delivering high-quality educational content. Without readable, accessible content, personalization and translation features have no value. This represents the minimum viable textbook.

**Independent Test**: Can be fully tested by navigating to the live site, browsing chapters 0-13 and appendix, verifying all citations are clickable APA 7 format, confirming code examples are visible, and checking mobile responsiveness and dark mode compatibility.

**Acceptance Scenarios**:

1. **Given** a user visits `https://physical-ai.github.io/textbook`, **When** they click on any chapter from the table of contents, **Then** the chapter loads with formatted MDX content, visible APA 7 citations as clickable links, and all images/diagrams render correctly.
2. **Given** a user is reading Chapter 3 on mobile, **When** they scroll through the content, **Then** the layout is responsive, text is readable, and code blocks have horizontal scroll where needed.
3. **Given** a user views the homepage, **When** the page loads, **Then** they see the book cover image (1600×840 px) with proper dark-mode styling.
4. **Given** a user clicks on a citation link, **When** the link is followed, **Then** it opens the source (peer-reviewed paper, official documentation, or high-quality blog) in a new tab.
5. **Given** a user navigates to the bibliography at the end of a chapter, **When** they review the references, **Then** all sources are listed in APA 7 format with clickable hyperlinks.

---

### User Story 2 - User Registration with Personalization Profile (Priority: P2)

A learner wants to personalize their learning experience based on their background and resources. They create an account by answering 5 profile questions (Python experience, ROS experience, Linux familiarity, GPU access, hardware budget tier). This profile is saved and used to customize chapter content.

**Why this priority**: Personalization differentiates this textbook from static alternatives and addresses the "Practicality & Inclusivity" principle by adapting to diverse learner contexts. However, the textbook must be valuable without this feature (P1 first).

**Independent Test**: Can be fully tested by clicking "Sign Up", completing the 5-question form (selecting options for Python/ROS/Linux skills, GPU availability, budget tier), submitting the form, and verifying the profile is saved. Login and profile retrieval can be tested independently of content personalization.

**Acceptance Scenarios**:

1. **Given** a user clicks "Sign Up" on the homepage, **When** the registration form loads, **Then** they see 5 questions with clear options: Python skill level (None/Beginner/Intermediate/Advanced), ROS experience (None/Basic/Experienced), Linux familiarity (None/Some/Proficient), GPU access (Yes/No/Cloud only), and Budget tier (Simulation-only/<$500/<$2000/Research-grade).
2. **Given** a user completes all 5 questions, **When** they submit the form with a valid email and password, **Then** their account is created, profile is saved, and they are logged in automatically.
3. **Given** a registered user logs in, **When** they navigate to their profile page, **Then** they see their saved answers to all 5 personalization questions with the option to edit them.
4. **Given** a user updates their profile (e.g., changes budget tier from "Simulation-only" to "<$500"), **When** they save changes, **Then** the updated profile is persisted and affects future chapter personalization.

---

### User Story 3 - Personalized Chapter Content (Priority: P3)

A logged-in user reads a chapter and clicks the "Personalise this chapter" button at the top. The content adapts to show difficulty level (introductory/intermediate/advanced) and hardware track (simulation-only/budget-hardware/research-grade) based on their profile. For example, a user with no GPU access sees Isaac Sim cloud instructions, while a user with research-grade budget sees local setup guides.

**Why this priority**: This is the "power feature" that delivers on the personalization promise, but it depends on both content (P1) and user profiles (P2) being in place. It significantly enhances learning efficiency but is not required for the textbook to be useful.

**Independent Test**: Can be fully tested by logging in as a user with a specific profile (e.g., Beginner Python, No ROS, Simulation-only), clicking "Personalise this chapter" in Chapter 4, and verifying that content adapts (e.g., shows beginner explanations, hides advanced sections, emphasizes simulation over hardware).

**Acceptance Scenarios**:

1. **Given** a logged-in user with profile "Python: Beginner, ROS: None, GPU: No, Budget: Simulation-only" is reading Chapter 4 (ROS 2 Basics), **When** they click "Personalise this chapter", **Then** the content shows introductory Python code comments, beginner-friendly ROS explanations, and simulation-only setup instructions (no hardware purchasing guides).
2. **Given** a logged-in user with profile "Python: Advanced, ROS: Experienced, GPU: Yes, Budget: Research-grade" is reading Chapter 9 (Isaac Sim), **When** they click "Personalise this chapter", **Then** the content shows advanced optimization techniques, assumes ROS familiarity, and provides local GPU setup guides for Isaac Sim.
3. **Given** a logged-in user has not clicked "Personalise this chapter", **When** they read chapter content, **Then** they see the default "intermediate" difficulty with all hardware tracks visible (inclusive default).
4. **Given** a logged-in user toggles personalization on, **When** they navigate to a different chapter, **Then** personalization remains active across chapters until explicitly toggled off.

---

### User Story 4 - Instant Urdu Translation Toggle (Priority: P4)

A user who prefers reading in Urdu clicks the "اردو میں دیکھیں / View in Urdu" button at the top of any chapter. The entire chapter content instantly switches to Urdu translation without page reload, maintaining scroll position and interactive state. The translation is high-quality (≥95% human-rated accuracy).

**Why this priority**: This fulfills the "Practicality & Inclusivity" principle by serving non-English-speaking communities, particularly in Pakistan and Urdu-speaking regions. It depends on having English content (P1) first, making it a later-stage feature, but is critical for the project's inclusivity mission.

**Independent Test**: Can be fully tested by opening any chapter, clicking the Urdu toggle button, verifying the content switches to Urdu instantly (no reload), clicking the English toggle, and verifying it switches back while maintaining scroll position.

**Acceptance Scenarios**:

1. **Given** a user is reading Chapter 2 in English, **When** they click "اردو میں دیکھیں", **Then** all chapter text (headings, paragraphs, code comments) switches to Urdu instantly without page reload, the user's scroll position is maintained, and the button text changes to "View in English".
2. **Given** a user is reading Chapter 5 in Urdu, **When** they click "View in English", **Then** all content switches back to English instantly, maintaining scroll position and interactive state (e.g., open/closed code blocks).
3. **Given** a user has Urdu enabled in Chapter 3, **When** they navigate to Chapter 4, **Then** Chapter 4 loads in Urdu by default (language preference persists across chapters).
4. **Given** a user toggles between English and Urdu multiple times, **When** they refresh the page, **Then** the last selected language is remembered and applied on page load.
5. **Given** a native Urdu speaker reads 500+ random sentences from translated chapters, **When** they rate translation accuracy, **Then** the average accuracy is ≥95% (human-rated metric, measured via user study or expert review).

---

### User Story 5 - Running Companion Labs (Priority: P5)

A learner wants to practice concepts from the textbook. They visit the companion labs repository (`github.com/physical-ai/labs`), clone it, and run one of the 40+ ROS 2 packages or Isaac Sim scenes using Docker containers (via Docker Desktop on Windows/Mac or Docker Engine on Linux) or GitHub Codespaces. Each lab corresponds to a chapter and includes setup instructions, Dockerfile/devcontainer configuration, versioned dependencies, and expected outputs.

**Why this priority**: Hands-on practice is essential for robotics education and fulfills the "Reproducibility" principle. However, learners can read and understand the textbook (P1) before running labs. This is a complementary feature that enhances learning but is not blocking for the textbook itself.

**Independent Test**: Can be fully tested by cloning the labs repository, following Docker setup instructions for a specific lab (e.g., Chapter 3 URDF lab), running `docker compose up` or opening in GitHub Codespaces, and verifying the expected output matches documentation.

**Acceptance Scenarios**:

1. **Given** a user has Docker Desktop installed on Windows 10/11, **When** they clone `github.com/physical-ai/labs` and run `docker compose up` for the Chapter 3 URDF lab following the README, **Then** the lab executes successfully in a containerized Ubuntu 22.04 + ROS Humble environment, produces the expected visualization in RViz (via X11 forwarding or VNC), and matches the output described in the textbook.
2. **Given** a user prefers a one-click setup, **When** they click "Open in GitHub Codespaces" from the lab repository, **Then** a pre-configured devcontainer launches with all dependencies installed, and they can run the lab immediately in a cloud-based VS Code environment.
3. **Given** a user does not have local GPU access, **When** they follow cloud setup instructions for the Isaac Sim labs, **Then** they can run the lab on NVIDIA cloud, GitHub Codespaces with GPU support, or via Docker with GPU passthrough on compatible systems, seeing the same results as local execution.
4. **Given** a user encounters a dependency issue, **When** they check the lab's `Dockerfile` or `requirements.txt`, **Then** all dependencies are explicitly versioned and locked (e.g., `ros:humble-ros-base-jammy`, `numpy==1.24.0`), ensuring reproducible builds.
5. **Given** a user completes a lab, **When** they review the lab's README, **Then** it includes a clear "Expected Output" section with screenshots or terminal output examples for verification, plus Docker-specific notes (port mappings, volume mounts, GUI access).

---

### Edge Cases

- **What happens when a user with JavaScript disabled tries to toggle Urdu?** The system should detect JavaScript is disabled and display a notice: "JavaScript is required for language toggle and personalization features. Please enable JavaScript for the best experience." The default English content remains accessible.
- **How does the system handle network failures during Urdu translation fetch?** If translation data fails to load, the system displays an error message: "Translation temporarily unavailable. Please try again." and keeps the current language active (no broken state).
- **What happens when a logged-in user's session expires while reading a personalized chapter?** Personalization gracefully falls back to default (intermediate, all tracks visible) with a banner: "Session expired. Log in again to restore personalization."
- **How does the system handle users who skip questions during signup?** All 5 personalization questions are required. The "Create Account" button remains disabled until all questions are answered (form validation prevents submission).
- **What happens when a citation link is broken (404)?** The citation remains clickable, but clicking it shows a browser 404 error. The textbook includes a link to report broken citations via GitHub Issues (quality assurance process).
- **How does the system handle mobile users toggling personalization with limited screen space?** The "Personalise this chapter" and Urdu buttons are fixed at the top of the viewport (sticky header) on mobile, ensuring they're always accessible without excessive scrolling.
- **What happens when a chapter has not been translated to Urdu yet?** The Urdu toggle button is hidden for that chapter, with a notice: "Urdu translation coming soon." Only chapters with ≥95% translation completeness show the toggle.

## Requirements *(mandatory)*

### Functional Requirements

#### Content Delivery
- **FR-001**: System MUST serve 14 chapters (0-13) plus Appendix organized into 5 Parts (Part 0: Preface, Part 1: Foundations, Part 2: ROS 2, Part 3: Isaac Sim, Part 4: Advanced Topics, Part 5: Hardware & Ethics) as navigable MDX pages.
- **FR-002**: System MUST display a book cover image at `static/img/book-cover-image.jpg` (1600×840 px) on the homepage with dark-mode compatible styling.
- **FR-003**: System MUST render all citations in APA 7 format with clickable hyperlinks that open in new tabs.
- **FR-004**: System MUST include a full bibliography at the end of each chapter with all sources listed in APA 7 format.
- **FR-005**: System MUST ensure ≥50% of total citations (minimum 125 out of 250 sources across the textbook) link to peer-reviewed conference/journal papers (ICRA, IROS, RSS, CoRL, RA-L, IJRR, T-RO, etc.).
- **FR-006**: System MUST ensure ≥30% of total citations (minimum 75 out of 250) link to official documentation (ROS 2, NVIDIA Isaac Sim, Unitree SDK, Intel RealSense, etc.).
- **FR-007**: System MUST limit citations to high-quality blogs, whitepapers, or GitHub READMEs to ≤20% of total (maximum 50 out of 250).
- **FR-008**: System MUST provide responsive layouts that adapt to mobile (320px+ width), tablet (768px+), and desktop (1024px+) screen sizes.
- **FR-009**: System MUST support dark mode styling for all content, images, and diagrams without requiring user toggle (respects OS/browser preference).

#### Authentication & User Profiles
- **FR-010**: System MUST provide user registration with email and password authentication.
- **FR-011**: System MUST collect 5 required personalization questions during signup: Python skill level (4 options), ROS experience (3 options), Linux familiarity (3 options), GPU access (3 options), Hardware budget tier (4 options).
- **FR-012**: System MUST prevent account creation if any of the 5 personalization questions are unanswered (form validation).
- **FR-013**: System MUST allow users to log in with email and password after registration.
- **FR-014**: System MUST allow logged-in users to view and edit their profile (5 personalization questions) at any time.
- **FR-015**: System MUST persist user profiles and login sessions across page navigations.
- **FR-016**: System MUST log users out automatically after 7 days of inactivity (idle timeout) even if session is within the 90-day maximum duration, and display a re-login prompt with message: "Session expired due to inactivity. Please log in again to restore personalization."

#### Personalization
- **FR-017**: System MUST display a "Personalise this chapter" button at the top of every chapter for logged-in users.
- **FR-018**: System MUST hide the "Personalise this chapter" button for anonymous users (not logged in).
- **FR-019**: System MUST adapt chapter content based on user profile when personalization is active: Difficulty level (introductory for Python: None/Beginner, intermediate for Intermediate, advanced for Advanced) and Hardware track (simulation-only for Budget: Simulation-only, budget-hardware for <$500/<$2000, research-grade for Research-grade).
- **FR-020**: System MUST show default content (intermediate difficulty, all hardware tracks visible) when personalization is not active or user is not logged in.
- **FR-021**: System MUST persist personalization state (on/off) across chapter navigations within a session.
- **FR-022**: System MUST allow users to toggle personalization on and off per chapter (not forced).

#### Urdu Translation
- **FR-023**: System MUST display a bilingual button "اردو میں دیکھیں / View in Urdu" at the top of every chapter (when translation is available).
- **FR-024**: System MUST fetch Urdu translation from Vercel API or Supabase on first toggle per chapter (lazy-loaded, <500ms initial fetch) and switch content without page reload. Subsequent toggles use cached translation for instant (<100ms) switching.
- **FR-025**: System MUST switch chapter content back to English instantly (without page reload or API fetch, as English is always present in static bundle) when the English toggle is clicked.
- **FR-026**: System MUST maintain user scroll position and interactive state (open/closed accordions, code blocks, etc.) when toggling languages.
- **FR-027**: System MUST persist language preference (English/Urdu) across chapter navigations and page refreshes using browser localStorage or session storage.
- **FR-028**: System MUST hide the Urdu toggle button for chapters where Urdu translation is incomplete (less than 95% translated).
- **FR-029**: System MUST achieve ≥95% human-rated translation accuracy for all Urdu content (measured via user study with native Urdu speakers or expert review).

#### Companion Labs
- **FR-030**: System MUST provide a companion repository at `github.com/physical-ai/labs` with a minimum of 40 runnable ROS 2 packages or Isaac Sim scenes.
- **FR-031**: System MUST ensure all labs include a README with Docker setup instructions (Dockerfile, docker-compose.yml, or devcontainer.json), versioned dependencies (locked base images like `ros:humble-ros-base-jammy`, requirements.txt, package.xml), and expected output examples.
- **FR-032**: System MUST ensure all labs are runnable via Docker containers on any host OS (Windows 10/11 + Docker Desktop, macOS + Docker Desktop, Linux + Docker Engine) with consistent Ubuntu 22.04 + ROS Humble/Iron environment inside containers. Each lab must document Docker commands (e.g., `docker compose up`, `docker run`) and GitHub Codespaces "Open" link.
- **FR-033**: System MUST provide GitHub Codespaces/devcontainer configuration for one-click cloud execution. For labs requiring GPU access (Isaac Sim, deep learning), provide instructions for NVIDIA cloud, GitHub Codespaces with GPU support, or Docker with GPU passthrough (`docker run --gpus all`).
- **FR-034**: System MUST link each chapter to its corresponding lab(s) in the companion repository with clear references (e.g., "Try Lab 3-1: URDF Robot Modeling").

#### Content Quality & Citations
- **FR-035**: System MUST ensure total word count (excluding code blocks) is between 90,000 and 120,000 words across all 14 chapters and appendix.
- **FR-036**: System MUST include a minimum of 250 traceable, high-quality sources across the entire textbook (tracked via bibliography aggregation).
- **FR-037**: System MUST ensure all diagrams and figures are original vector graphics (SVG format preferred) with dark-mode compatible color schemes.
- **FR-038**: System MUST include alt-text for all images and diagrams for accessibility compliance.
- **FR-039**: System MUST provide source files (e.g., Figma, draw.io, or SVG source) for all diagrams committed to the repository for future editing.

### Key Entities

- **User**: Represents a registered learner with email, password, and personalization profile (5 answers: Python skill, ROS experience, Linux familiarity, GPU access, Budget tier). Can be authenticated or anonymous. Authenticated users have access to personalization and Urdu translation features.

- **Chapter**: Represents one of the 14 main chapters (0-13) or the Appendix. Contains MDX content, APA 7 citations, bibliography, code examples, diagrams, and metadata (Part number, Week range, translation status). Chapters can be read by anyone but are personalized only for logged-in users.

- **PersonalizationProfile**: Stores a user's 5 answers (Python skill level, ROS experience, Linux familiarity, GPU access, Hardware budget tier). Used to adapt chapter content (difficulty level and hardware track). Can be edited by the user at any time.

- **Citation**: Represents a single source reference in APA 7 format. Contains URL, title, authors, publication year, and type (peer-reviewed paper / official documentation / high-quality blog). Aggregated to ensure source priority targets are met (≥50% peer-reviewed, ≥30% official docs, ≤20% secondary).

- **TranslationContent**: Represents the Urdu translation of a chapter. Contains translated MDX content, translation completeness percentage (must be ≥95% to enable toggle), and last updated timestamp. Linked to a specific Chapter.

- **Lab**: Represents a hands-on ROS 2 package or Isaac Sim scene in the companion repository. Contains README, versioned dependencies, setup instructions, expected outputs, and platform requirements (Ubuntu 22.04 + ROS Humble/Iron). Linked to one or more Chapters.

- **Session**: Represents a logged-in user's active session with authentication token, personalization state (on/off), language preference (English/Urdu), last activity timestamp, and creation timestamp. Maximum duration is 90 days, but expires after 7 days of inactivity (idle timeout), triggering logout and fallback to default content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Content Quality (Launch & Every Major Release)
- **SC-001**: Every technical claim in all 14 chapters has a verifiable citation that links to a primary source (100% citation coverage, manually audited).
- **SC-002**: Zero instances of plagiarism detected via automated Copyscroll checks and manual expert review.
- **SC-003**: All 14 chapters plus Appendix have functional "Personalise this chapter" and "اردو میں دیکھیں / View in Urdu" buttons for logged-in users (100% feature parity).
- **SC-004**: Urdu translation accuracy is ≥95% based on human evaluation by native Urdu speakers (minimum 500-sentence sample across all chapters).
- **SC-005**: All code examples across all chapters run successfully in Docker containers (Ubuntu 22.04 + ROS Humble/Iron base images) or GitHub Codespaces as verified by automated CI checks (100% reproducibility across Windows, Mac, Linux hosts).

#### MVP Launch (Chapters 0-6 Complete)
- **SC-006**: Chapters 0-6 (Preface through Chapter 6) are fully written, cited, personalized, and translated to Urdu with ≥95% accuracy.
- **SC-007**: Minimum 50 beta users have created accounts, tested personalization, and provided feedback on usability.
- **SC-008**: Book cover image (1600×840 px) is live on the homepage with dark-mode styling.
- **SC-009**: Companion labs repository contains at least 20 runnable labs (corresponding to Chapters 0-6) with zero broken lab setups (tested via Docker on Windows 10/11, macOS, and Linux + GitHub Codespaces CI).

#### 90-Day Post-Launch Adoption
- **SC-010**: Website receives ≥1,000 unique visitors within 90 days of full launch (measured via analytics).
- **SC-011**: ≥300 registered users have created accounts and actively use Urdu translation or personalization features within 90 days (tracked via feature usage analytics).
- **SC-012**: Zero critical bugs in labs (all 40+ labs run without errors in Docker containers on Windows, Mac, Linux, and GitHub Codespaces, verified via user reports and CI).
- **SC-013**: At least 3 robotics faculty or researchers provide written external peer review feedback on technical accuracy and pedagogical quality.
- **SC-014**: At least 2 university courses, bootcamps, or self-study groups adopt the textbook as a primary or supplementary resource within 90 days.

#### User Experience
- **SC-015**: 90% of logged-in users successfully complete personalization setup (answer all 5 questions) on first signup attempt (measured via signup analytics).
- **SC-016**: Average time to toggle between English and Urdu is <1 second with no page reload (measured via performance monitoring).
- **SC-017**: Mobile users (≥30% of traffic expected) report satisfactory reading experience with responsive layouts and accessible personalization/Urdu buttons (measured via user surveys, target ≥80% satisfaction).
- **SC-018**: Users can navigate from any chapter to its corresponding lab in ≤2 clicks (direct link from chapter to lab README).

### Assumptions

- **Platform Hosting**: The textbook will be deployed as a static site on GitHub Pages for content delivery, with dynamic features (authentication, personalization, Urdu translation) served via Vercel serverless functions or a lightweight backend (e.g., Supabase for auth + profile storage). This hybrid approach balances static site performance with dynamic user features.

- **Translation Pipeline**: Urdu translation will be performed by human translators or high-quality machine translation (e.g., GPT-4 with human review) to achieve ≥95% accuracy. Initial translation for Chapters 0-6 (MVP) will be prioritized, with remaining chapters translated iteratively. Translation content will be stored in Supabase or served via Vercel API endpoints and lazy-loaded on first Urdu toggle per chapter (<500ms fetch), then cached in browser for instant subsequent toggles.

- **Personalization Content Strategy**: Each chapter will include conditional content blocks (MDX components) that render based on user profile. For example, a chapter might have separate sections for "Beginner Python Setup" vs. "Advanced Python Optimization", with visibility controlled by user profile. This requires authoring ~30-50% more content per chapter to cover all difficulty/hardware track variations.

- **Citation Tracking**: A separate metadata file (e.g., `citations.json` or YAML front matter per chapter) will track each citation's type (peer-reviewed, official docs, blog) to ensure source priority targets (≥50% peer-reviewed, ≥30% official docs) are met. Automated scripts will validate these percentages during CI/CD.

- **Lab Maintenance**: Labs in the companion repository will run in Docker containers with Ubuntu 22.04 + ROS Humble (primary) or ROS Iron (secondary) base images. All labs will include Dockerfile/docker-compose.yml and devcontainer.json for GitHub Codespaces. Labs requiring GPU will provide instructions for Docker GPU passthrough (`--gpus all`), NVIDIA cloud, or GitHub Codespaces with GPU support. Dependency versions will be locked (e.g., `ros:humble-ros-base-jammy`, `numpy==1.24.0`) to ensure reproducible builds across all host platforms (Windows, Mac, Linux).

- **User Analytics & Privacy**: Usage metrics (visitors, registered users, feature usage) will be collected via privacy-respecting analytics (e.g., Plausible, Umami, or self-hosted Matomo) to avoid GDPR/privacy concerns. No personal data will be sold or shared with third parties.

- **Urdu Language Support**: The system will use Unicode (UTF-8) encoding for Urdu text. Right-to-left (RTL) rendering is not required (Urdu in this context will be written left-to-right in Nastaliq script, common in digital educational materials). If RTL is needed, Docusaurus supports RTL via configuration.

- **MVP Scope**: The MVP launch focuses on Chapters 0-6 (Preface, Foundations, ROS 2 Basics) with full personalization and Urdu translation. Chapters 7-13 (Isaac Sim, Locomotion, Manipulation, VLA, Capstone, Hardware, Ethics) will be completed iteratively post-MVP based on beta user feedback.

- **Content Licensing**: All textbook content (text, diagrams, code) will be released under MIT License, allowing free use, modification, and distribution. This aligns with the "Practicality & Inclusivity" principle by maximizing accessibility.

- **Target Audience**: The primary audience is advanced undergraduate and graduate students in computer science, electrical engineering, or robotics programs, as well as industry practitioners upskilling in humanoid robotics. Content assumes familiarity with programming (at least one language) and basic linear algebra. Primary platform is Windows 10/11 + Docker Desktop, with macOS and Linux also supported via Docker.

- **Chapter Word Count Distribution**: Assuming 14 chapters + appendix, average word count per chapter is ~6,000-8,000 words (90,000-120,000 total). Foundational chapters (Part 1) may be shorter (~4,000 words), while advanced chapters (Part 4) may be longer (~10,000 words).

- **Authentication Provider**: Better-Auth (lightweight, customizable auth library) will be used for user registration and login, with Supabase as the backend for storing user profiles and session data. This provides a balance of simplicity and scalability.

- **Dark Mode Implementation**: Docusaurus natively supports dark mode via theme configuration. All custom diagrams and images will be designed with dark-mode compatible color palettes (e.g., high contrast, avoiding pure black/white).

## Out of Scope

The following features are explicitly excluded from this specification:

- **Interactive Simulations in Browser**: Embedded 3D robot simulations or ROS visualizations directly in the web page (e.g., via WebGL) are out of scope. Users will run simulations locally or in the cloud via companion labs.

- **Video Tutorials**: The textbook will be text-based with static diagrams. Video content (lectures, demos) is out of scope for the MVP. Future iterations may link to external videos.

- **Discussion Forums / Q&A**: Community features like comments, forums, or Q&A sections are out of scope. Users can ask questions via GitHub Issues or external platforms (e.g., Discord, Reddit).

- **Progress Tracking / Gamification**: Features like chapter completion checkmarks, badges, or progress dashboards are out of scope. Users track their own progress manually.

- **Multi-Language Support Beyond Urdu**: Only English and Urdu are in scope. Additional languages (Arabic, Chinese, Spanish, etc.) are out of scope for the MVP but may be considered in future versions.

- **Paid Subscriptions / Premium Content**: All content is free and open-source under MIT License. Monetization features (paywalls, subscriptions) are out of scope.

- **Offline Mode / Progressive Web App (PWA)**: The textbook requires an internet connection to access. Offline reading via PWA or downloadable PDFs is out of scope for the MVP (though static PDF export may be added later as a secondary format).

- **Admin Dashboard for Content Management**: Authors will edit content directly in the GitHub repository (MDX files). A web-based CMS or admin panel is out of scope.

- **Automated Personalization via AI**: Content personalization is based on explicit user profile answers (5 questions). AI-driven adaptive learning (e.g., adjusting difficulty based on quiz performance) is out of scope.

- **Live Code Execution in Browser**: Users cannot run ROS 2 code directly in the browser. All code execution happens locally or in external cloud environments (labs repository).

- **Accessibility Beyond Alt-Text**: While alt-text for images is required (FR-038), advanced accessibility features (screen reader optimization, keyboard-only navigation, ARIA labels) are not explicitly prioritized in the MVP. These may be improved based on user feedback.

- **Citation Management Integration**: The textbook will not integrate with citation management tools (Zotero, Mendeley, EndNote). Users can manually copy citations in APA 7 format.

- **Chapter Versioning / Change Tracking**: The textbook will not display version history or change logs per chapter. Users can view commit history on GitHub if needed.

## Dependencies

- **Docusaurus 3**: Static site generator for building the textbook website. Required for MDX rendering, responsive layouts, and dark mode support.

- **GitHub Pages**: Hosting platform for the static textbook site at `physical-ai.github.io/textbook`. Required for free, reliable static site hosting.

- **Vercel (or similar serverless platform)**: Hosts dynamic features (authentication API, personalization logic, Urdu translation delivery). Required for handling user sessions and dynamic content.

- **Better-Auth**: Lightweight authentication library for user registration and login. Required for FR-010 to FR-016.

- **Supabase**: Backend-as-a-Service for storing user profiles (5 personalization questions), session data, and Urdu translation content. Required for FR-014, FR-015, FR-024, FR-027. Translation content is lazy-loaded via API on first Urdu toggle per chapter.

- **Docker Desktop (Windows/Mac) or Docker Engine (Linux)**: Required for running all companion labs in consistent containerized environments (Ubuntu 22.04 + ROS Humble/Iron inside containers). Enables platform-agnostic lab execution on any host OS.

- **GitHub Codespaces**: One-click cloud alternative for labs via pre-configured devcontainers. Provides browser-based VS Code with all dependencies pre-installed.

- **NVIDIA Isaac Sim (optional for users)**: Required for Isaac Sim labs (Chapters 8-10). Runs natively on Windows; users without local GPU access can use NVIDIA cloud, GitHub Codespaces with GPU support, or Docker with GPU passthrough.

- **Human Translators or GPT-4 + Human Review**: Required for Urdu translation to meet ≥95% accuracy target (FR-029, SC-004).

- **Citation Database**: A structured file (JSON, YAML, or CSV) tracking all 250+ sources with metadata (type, URL, title, authors) to validate source priority targets (FR-005 to FR-007). This will be maintained in the textbook repository.

- **GitHub Actions or Similar CI/CD**: Required for automated testing of labs (FR-032, SC-005) and citation validation (SC-001).

## Risks

- **Translation Quality Risk**: Achieving ≥95% human-rated Urdu accuracy (FR-029, SC-004) is challenging and requires skilled translators or extensive review. **Mitigation**: Start with professional translators for MVP (Chapters 0-6), budget for human review, and collect user feedback to iteratively improve.

- **Personalization Complexity**: Authoring conditional content for multiple difficulty levels and hardware tracks increases content creation effort by ~30-50% per chapter. **Mitigation**: Start with coarse-grained personalization (show/hide sections) rather than rewriting entire chapters. Use MDX components to manage complexity.

- **Lab Reproducibility Risk**: Ensuring all 40+ labs run flawlessly in Docker containers across Windows, Mac, and Linux hosts (FR-032, SC-012) is challenging due to Docker version differences, GUI forwarding complexity (X11/VNC), and GPU passthrough variations. **Mitigation**: Lock Docker base images and all dependency versions (e.g., `ros:humble-ros-base-jammy`, `numpy==1.24.0`), automate lab testing in CI on multiple platforms, provide GitHub Codespaces as a guaranteed cloud alternative, and document GUI setup for each platform (X11 on Linux, XQuartz on Mac, VcXsrv/Xming on Windows).

- **Citation Target Risk**: Meeting ≥50% peer-reviewed paper citations (FR-005) may be difficult for rapidly evolving topics (e.g., VLA, Isaac Sim) where official docs or blogs are more current. **Mitigation**: Prioritize peer-reviewed papers for foundational topics (Part 1, Part 2), accept higher secondary source percentage for cutting-edge topics, and document rationale in constitution.

- **User Adoption Risk**: Achieving ≥300 registered users within 90 days (SC-011) requires active marketing, community building, and partnerships with universities. **Mitigation**: Engage with robotics communities (ROS Discourse, Reddit, Twitter), present at conferences (ICRA, IROS), and partner with universities for course adoption.

- **Session Expiry UX Risk**: If users lose personalization due to session expiry (FR-016), they may be frustrated, especially during multi-week study sessions. **Mitigation**: Set 90-day maximum session duration to cover full semester (13 weeks + buffer), with 7-day idle timeout to maintain security. Provide clear re-login prompts explaining inactivity timeout, and restore personalization state immediately upon re-login (profile data persists in database).

- **Urdu RTL Rendering**: If Urdu text requires right-to-left (RTL) rendering (not assumed in current spec), this adds complexity. **Mitigation**: Validate assumption with native Urdu speakers during beta testing. If RTL is needed, Docusaurus supports it via configuration.
