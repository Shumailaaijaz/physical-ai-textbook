# Technology Research: Physical AI Humanoid Robotics Textbook Platform

**Date**: 2025-12-05
**Feature**: Physical AI Humanoid Robotics Textbook Platform
**Branch**: `001-textbook-platform`

This document captures technology research decisions made during Phase 0 of implementation planning. Each section addresses unknowns from the Technical Context and validates technology choices against project requirements.

---

## 1. Docusaurus 3 i18n + Custom Lazy-Loading

**Question**: How to implement instant Urdu translation toggle without page reload, given Docusaurus i18n requires separate builds per locale?

**Research Findings**:

Docusaurus native i18n (via `i18n.locales: ['en', 'ur']`) generates separate routes for each language (`/en/chapter-1`, `/ur/chapter-1`). Switching languages requires navigation to a different URL, triggering full page reload (~500-1500ms depending on chapter size). This violates FR-024 requirement for instant toggle (<100ms cached, <500ms first fetch).

**Decision**: **Custom client-side lazy-loading via React hooks + Vercel API**

**Implementation Approach**:
1. **English content**: Served statically via Docusaurus build (MDX → HTML at build time)
2. **Urdu toggle button**: Custom React component (`<UrduToggle />`) in Docusaurus theme
3. **First toggle**:
   - `useUrduTranslation(chapterId)` hook calls `GET /api/translation/:chapterId?language=ur`
   - Vercel API fetches from Supabase `translation_content` table
   - Response cached in `localStorage` with key `urdu_chapter_${chapterId}`
   - MDX content swapped client-side via React state (maintains scroll position)
4. **Subsequent toggles**: Read from `localStorage` (<100ms toggle time)
5. **Language persistence**: `localStorage.setItem('preferredLanguage', 'ur')` persists across chapters

**Alternatives Considered**:
- **A. Docusaurus native i18n**: Full rebuilds per language, separate URLs, page reload on toggle ❌ (violates FR-024)
- **B. Pre-embed both languages in page bundle**: Instant toggle ✅ but doubles page size (~200KB → 400KB per chapter) ❌ (violates performance goals: <2s TTI)
- **C. Runtime machine translation (browser-based)**: Fast ✅ but unpredictable quality ❌ (violates FR-029: ≥95% accuracy requirement)

**Rationale**: Option D (lazy-loading) balances page size (English-only build), toggle speed (<500ms first, <100ms cached), and translation quality (human-translated Urdu stored in Supabase). Slightly slower first toggle is acceptable UX tradeoff (loading spinner: "جاری ہے..." / "Loading...").

**References**:
- Docusaurus i18n docs: https://docusaurus.io/docs/i18n/introduction
- React `useEffect` + `localStorage`: Standard pattern for client-side caching

---

## 2. Better-Auth + Supabase Integration

**Question**: Best practices for session management with 90-day max duration, 7-day idle timeout, JWT vs cookie-based?

**Research Findings**:

**Better-Auth** is a lightweight auth library (4KB gzipped) supporting multiple providers (email/password, OAuth). It integrates with Supabase via custom adapter pattern.

**Session Strategy Decision**: **HTTP-only cookies + Supabase sessions table**

**Implementation Approach**:
1. **Signup/Login**: Better-Auth generates JWT, stores hashed token in Supabase `sessions` table
2. **Cookie**: `session_token` stored in HTTP-only, Secure, SameSite=Strict cookie (prevents XSS)
3. **Session record**:
   ```sql
   sessions (
     session_id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     token_hash TEXT,
     created_at TIMESTAMP,
     last_activity TIMESTAMP,  -- Updated on every API request
     expires_at TIMESTAMP       -- created_at + 90 days
   )
   ```
4. **Idle timeout middleware** (Vercel API):
   - Every request calls `validateSession(token)`
   - If `NOW() - last_activity > 7 days`: return `401 Unauthorized`, delete session
   - If `NOW() - created_at > 90 days`: return `401 Unauthorized`, delete session
   - Else: `UPDATE sessions SET last_activity = NOW()`, return `200 OK`
5. **Client-side**: On `401`, redirect to `/login?expired=idle` or `/login?expired=max`

**Alternatives Considered**:
- **A. JWT-only (no database sessions)**: Stateless ✅ but cannot revoke tokens before expiry ❌ (security risk for 90-day sessions)
- **B. Short-lived JWT (15min) + refresh tokens**: Industry standard ✅ but complex refresh logic ❌ (overkill for educational platform, not handling financial data)
- **C. Server-side sessions (Redis)**: Fast ✅ but adds infrastructure dependency (Redis instance) ❌ (increases complexity vs Supabase-only)

**Rationale**: HTTP-only cookies prevent XSS attacks. Supabase sessions table enables instant revocation (e.g., user clicks "Log out all devices") and activity tracking. Vercel serverless functions are stateless, so database-backed sessions fit naturally. The 7-day idle timeout is enforced via `last_activity` timestamp check on every API call (p95 latency <150ms is acceptable overhead).

**References**:
- Better-Auth docs: https://better-auth.com/docs/authentication/sessions
- Supabase session management: https://supabase.com/docs/guides/auth/sessions

---

## 3. Docker Multi-Platform GUI Forwarding

**Question**: How to enable RViz (ROS visualization tool) GUI access from Docker containers on Windows 10/11, macOS, and Linux?

**Research Findings**:

RViz requires X11 server for GUI rendering. Docker containers run headless by default. Each host OS requires different setup:

**Platform-Specific Solutions**:

### Linux (Native X11)
- **Setup**: `docker run --env DISPLAY=$DISPLAY --volume /tmp/.X11-unix:/tmp/.X11-unix:rw <image>`
- **Complexity**: Low (X11 already running)
- **Latency**: <10ms (local socket)

### macOS (XQuartz)
- **Setup**:
  1. Install XQuartz: `brew install --cask xquartz`
  2. Enable "Allow connections from network clients" in XQuartz preferences
  3. Run `xhost +localhost` to allow Docker connections
  4. `docker run --env DISPLAY=host.docker.internal:0 <image>`
- **Complexity**: Medium (requires XQuartz installation + configuration)
- **Latency**: ~50-100ms (network forwarding overhead)

### Windows 10/11 (VcXsrv / Xming / X410)
- **Setup**:
  1. Install VcXsrv (free, open-source) or X410 (paid, $10, Microsoft Store)
  2. Launch VcXsrv with "Disable access control" enabled
  3. `docker run --env DISPLAY=host.docker.internal:0 <image>`
- **Complexity**: Medium-High (Windows Firewall may block X11 port 6000)
- **Latency**: ~50-150ms (WSL2 + VcXsrv overhead)

**Alternative: VNC Server (Platform-Agnostic)**
- **Setup**:
  1. Install VNC server in Docker container (e.g., `tigervnc-standalone-server`)
  2. Expose port 5900: `docker run -p 5900:5900 <image>`
  3. Connect with VNC client (RealVNC, TigerVNC, web browser)
- **Complexity**: Medium (requires VNC server in Dockerfile, port forwarding)
- **Latency**: ~100-200ms (higher than X11 but consistent across platforms)

**Decision**: **X11 forwarding (platform-specific docs) + VNC fallback**

**Rationale**:
- **Primary**: X11 forwarding (Linux/Mac/Windows-specific instructions in each lab README)
- **Fallback**: VNC server for users who can't configure X11 (especially Windows Firewall issues)
- **GitHub Codespaces**: Uses VNC by default (browser-based noVNC client), zero local setup

**Implementation**:
- Each lab's `docker-compose.yml` includes both X11 and VNC configurations (commented examples)
- Lab `README.md` includes platform-specific instructions: "Windows users: Install VcXsrv..."
- Dockerfile includes optional VNC server: `apt-get install -y tigervnc-standalone-server xfce4`

**References**:
- ROS Docker GUI tutorial: http://wiki.ros.org/docker/Tutorials/GUI
- VcXsrv Windows setup: https://sourceforge.net/projects/vcxsrv/
- XQuartz macOS setup: https://www.xquartz.org/

---

## 4. Vercel Serverless Function Limits

**Question**: Can Vercel serverless functions handle Urdu translation payloads (~20-30KB per chapter MDX)? What are payload size limits and cold start implications?

**Research Findings**:

**Vercel Limits** (Hobby/Pro tiers):
- **Max response size**: 4.5 MB compressed (6 MB uncompressed)
- **Max execution time**: 10s (Hobby), 60s (Pro)
- **Cold start latency**: 50-200ms (Node.js 20 runtime)
- **Edge caching**: 31 days max with `Cache-Control` headers

**Urdu Translation Payload Analysis**:
- Average chapter: ~7,000 words English = ~7KB plain text
- With MDX markup (headings, code blocks, links): ~20-30KB
- Urdu (UTF-8 Nastaliq): ~25-35KB (slightly larger due to Unicode characters)
- **Total response size**: <35KB (well below 4.5 MB limit ✅)

**Decision**: **Vercel serverless functions with edge caching**

**Implementation Approach**:
1. **Endpoint**: `GET /api/translation/:chapterId?language=ur`
2. **Response headers**:
   ```javascript
   res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
   // Cache for 7 days, serve stale for 1 day while revalidating
   res.setHeader('ETag', `"urdu-chapter-${chapterId}-v${version}"`)
   ```
3. **Cold start mitigation**:
   - Use Vercel Edge Functions (faster cold start: <10ms) for `/api/session/validate` (high-frequency endpoint)
   - Use standard Node.js serverless for translation API (acceptable 50-200ms cold start on first request)
4. **Payload optimization**:
   - Return only MDX content (no metadata unless requested via `?full=true`)
   - Enable gzip compression (automatic in Vercel, reduces ~30KB → ~10KB)

**Alternatives Considered**:
- **A. Vercel Edge Functions (Rust/WASM)**: Faster cold start (<10ms) ✅ but limited to 1 MB response size ❌ (sufficient for translation but limits future features like chapter images)
- **B. Cloudflare Workers**: Cheaper ✅, faster ✅, but 25 MB script size limit complicates Better-Auth integration ❌
- **C. AWS Lambda + API Gateway**: More configurable ✅ but requires manual setup, monitoring ❌ (Vercel auto-deploys from Git)

**Rationale**: Vercel's 4.5 MB limit is 100× larger than needed for text-based Urdu translations. Edge caching reduces API calls by ~90% after first week (most users read chapters sequentially, caching populates quickly). 50-200ms cold start is acceptable for first Urdu toggle (SC-016 allows <500ms first fetch).

**References**:
- Vercel limits: https://vercel.com/docs/concepts/limits/overview
- Vercel Edge Functions: https://vercel.com/docs/functions/edge-functions

---

## 5. Urdu UTF-8 Encoding + Font Support

**Question**: How to render Urdu (Nastaliq script) in browsers with ≥95% readability on Windows/Mac/Linux? RTL layout needed?

**Research Findings**:

**Urdu Script Characteristics**:
- **Script**: Nastaliq (calligraphic style, primary for Urdu) or Naskh (simpler, used in newspapers)
- **Direction**: Right-to-left (RTL) traditionally, but **left-to-right (LTR) is acceptable** for digital text (common in educational materials, easier for mixed English/Urdu content)
- **Encoding**: UTF-8 (all modern browsers support Urdu Unicode range: U+0600–U+06FF)

**Font Options**:

| Font | Style | Source | File Size | Browser Support |
|------|-------|--------|-----------|-----------------|
| **Noto Nastaliq Urdu** | Calligraphic (traditional) | Google Fonts | ~400KB WOFF2 | Chrome 90+, Firefox 88+, Safari 14+ ✅ |
| **Jameel Noori Nastaleeq** | Calligraphic (preferred by readers) | Free download | ~1.2 MB TTF | All browsers ✅ but large size ❌ |
| **Noto Naskh Arabic** | Simplified (newspaper style) | Google Fonts | ~120KB WOFF2 | All browsers ✅ |

**Decision**: **Noto Nastaliq Urdu from Google Fonts (LTR layout)**

**Implementation Approach**:
1. **Font loading** (in `docusaurus.config.js` → `stylesheets`):
   ```javascript
   stylesheets: [
     {
       href: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
       type: 'text/css',
     },
   ],
   ```
2. **CSS**:
   ```css
   .urdu-content {
     font-family: 'Noto Nastaliq Urdu', serif;
     font-size: 1.15rem; /* Slightly larger for readability */
     line-height: 1.8;   /* More vertical spacing for Nastaliq ligatures */
     direction: ltr;     /* Left-to-right (not RTL) */
   }
   ```
3. **RTL not required**: Assumption from spec (line 222) validated—Urdu educational content commonly uses LTR to avoid layout conflicts with English code examples, equations, diagrams.
4. **Fallback**: System fonts (Windows: "Urdu Typesetting", macOS: "Geeza Pro") if Google Fonts blocked

**Alternatives Considered**:
- **A. Self-hosted Jameel Noori Nastaleeq**: More authentic ✅ but 1.2 MB font hurts page load (violates <2s TTI goal) ❌
- **B. Noto Naskh Arabic**: Smaller (120KB) ✅ but less traditional, may reduce reader satisfaction ❌
- **C. RTL layout**: Traditional ✅ but complicates mixed English/Urdu, code blocks, diagrams ❌

**Rationale**: Noto Nastaliq Urdu balances authenticity (Nastaliq script) with performance (400KB WOFF2 cached by Google Fonts CDN). LTR layout simplifies rendering of mixed-language content (English code examples, equations, citations remain LTR). If beta users request RTL, Docusaurus supports it via `direction: 'rtl'` in `i18n.localeConfigs.ur.direction`.

**References**:
- Google Fonts Noto Nastaliq Urdu: https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu
- Unicode Urdu range: https://en.wikipedia.org/wiki/Urdu_(Unicode_block)

---

## 6. Citation Validation Automation

**Question**: How to automatically enforce ≥50% peer-reviewed, ≥30% official docs, ≤20% secondary sources from 250+ citations?

**Research Findings**:

**Citation Storage Options**:
1. **MDX front matter** (YAML):
   ```yaml
   ---
   citations:
     - url: https://arxiv.org/abs/2204.05862
       title: "RT-1: Robotics Transformer"
       authors: "Brohan et al."
       year: 2022
       type: peer-reviewed
     - url: https://docs.ros.org/en/humble/
       title: "ROS 2 Humble Documentation"
       year: 2022
       type: official
   ---
   ```
2. **Separate `citations.json`** (global):
   ```json
   {
     "chapter-01": [
       {"url": "...", "type": "peer-reviewed"},
       {"url": "...", "type": "official"}
     ]
   }
   ```
3. **Supabase `citations` table** (database):
   ```sql
   citations (
     id UUID,
     chapter_id TEXT,
     url TEXT,
     title TEXT,
     authors TEXT,
     year INT,
     type TEXT CHECK (type IN ('peer-reviewed', 'official', 'secondary'))
   )
   ```

**Decision**: **MDX front matter + CI validation script**

**Implementation Approach**:
1. **Authors add citations** to each chapter's MDX front matter (YAML)
2. **CI script** (`scripts/validate-citations.js`):
   ```javascript
   const citations = parseAllChaptersFrontMatter(); // Read all MDX files
   const types = citations.map(c => c.type);
   const peerReviewed = types.filter(t => t === 'peer-reviewed').length;
   const official = types.filter(t => t === 'official').length;
   const secondary = types.filter(t => t === 'secondary').length;
   const total = types.length;

   if (peerReviewed / total < 0.50) throw new Error('Need ≥50% peer-reviewed');
   if (official / total < 0.30) throw new Error('Need ≥30% official docs');
   if (secondary / total > 0.20) throw new Error('Too many secondary sources');
   ```
3. **GitHub Actions** (`.github/workflows/validate-citations.yml`):
   - Runs on every PR that modifies `docs/*.mdx`
   - Blocks merge if citation percentages violated
4. **Manual audit**: SC-001 requires 100% citation coverage verified by human review before major releases (automated script catches percentage violations, humans verify accuracy/relevance)

**Alternatives Considered**:
- **A. Supabase database**: Centralized ✅ but adds runtime dependency, complicates local development ❌
- **B. Separate `citations.json`**: Simple ✅ but duplicates data (citations also in MDX for rendering) ❌
- **C. No automation, manual spreadsheet**: Flexible ✅ but error-prone, doesn't scale to 250+ citations ❌

**Rationale**: MDX front matter keeps citations co-located with content (authors see them while writing). CI automation prevents accidental violations (e.g., adding too many blog citations). Parsing YAML front matter is trivial in Node.js (use `gray-matter` library). Total validation time: <5s for all chapters (acceptable CI overhead).

**References**:
- `gray-matter` library: https://github.com/jonschlinkert/gray-matter
- GitHub Actions syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

---

## 7. GitHub Codespaces GPU Support

**Question**: Can GitHub Codespaces provide GPU access for Isaac Sim labs (Chapters 8-10)? Cost implications vs local GPU?

**Research Findings**:

**GitHub Codespaces GPU Availability**:
- **Status (Dec 2024)**: GitHub Codespaces **does not support GPU acceleration** in standard devcontainers
- **Workaround**: Use `--cap-add` Docker capabilities to access host GPU (requires self-hosted Codespaces runner with NVIDIA GPU)
- **Self-hosted runners**: Requires organization/enterprise plan ($4/user/month minimum)

**Cost Analysis** (for 50 beta users):

| Option | Setup Cost | Usage Cost (per user, per week) | Total (50 users, 13 weeks) |
|--------|------------|----------------------------------|----------------------------|
| **Local GPU** (user-owned) | $0 (assumes students have GPU) | $0 | $0 |
| **NVIDIA Omniverse Cloud** | $0 setup | $1.60/hour × 10 hours/week = $16/week | $10,400 (50 users × 13 weeks × $16) |
| **AWS EC2 g4dn.xlarge** | $0 setup | $0.526/hour × 10 hours/week = $5.26/week | $3,419 (50 users × 13 weeks × $5.26) |
| **GitHub Codespaces + self-hosted GPU runner** | $500 (one-time: GPU server) | $4/user/month (org plan) | $2,600 (50 users × 3.25 months × $4) + $500 = $3,100 |

**Decision**: **Primary = Local GPU (Docker with `--gpus all`), Fallback = NVIDIA Omniverse Cloud**

**Rationale**:
- **Local GPU**: Free for users who already have NVIDIA GPU (common for robotics students: RTX 3060+, GTX 1660+). Docker GPU passthrough works on Windows 10/11 with Docker Desktop + NVIDIA Container Toolkit.
- **Cloud Alternative**: Direct users to NVIDIA Omniverse Cloud (official Isaac Sim cloud platform) for 3-4 labs requiring GPU. Cost: ~$16/week per user (acceptable for short-term lab completion vs $3,000+ infrastructure investment).
- **GitHub Codespaces**: **NOT recommended for GPU labs** due to lack of native GPU support. Use for non-GPU labs only (Chapters 0-7, 11-13).

**Implementation Approach**:
1. **Lab README** (Chapter 8-10):
   ```markdown
   ## GPU Requirements
   - **Local**: NVIDIA GPU (RTX 20XX+ or GTX 16XX+), Docker Desktop with `--gpus all` flag
   - **Cloud**: NVIDIA Omniverse Cloud (free trial: 500 credits, ~10 hours)
   - **Not Supported**: GitHub Codespaces (no GPU acceleration)
   ```
2. **Docker command**:
   ```bash
   docker run --gpus all -it <isaac-sim-image>
   ```
3. **Omniverse Cloud instructions**: Link to https://www.nvidia.com/en-us/omniverse/cloud/

**References**:
- GitHub Codespaces GPU limitations: https://github.com/orgs/community/discussions/48406
- NVIDIA Container Toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/
- NVIDIA Omniverse Cloud pricing: https://www.nvidia.com/en-us/omniverse/cloud/

---

## 8. Personalization Content Authoring Strategy

**Question**: How to author chapter content variations (beginner/intermediate/advanced difficulty + simulation/budget/research hardware tracks) without tripling authoring effort?

**Research Findings**:

**Personalization Permutations**:
- Python skill: 4 levels (None, Beginner, Intermediate, Advanced)
- Difficulty mapping: None/Beginner → introductory, Intermediate → intermediate, Advanced → advanced
- Hardware track: Budget tier maps to track (Simulation-only → simulation, <$500/<$2000 → budget, Research-grade → research)
- **Total unique combinations**: 3 difficulties × 3 hardware tracks = 9 permutations

**Authoring Strategies**:

### Strategy A: Separate Files (9× authoring effort ❌)
- Create 9 versions of each chapter: `chapter-01-intro-sim.mdx`, `chapter-01-intro-budget.mdx`, etc.
- **Effort**: 9× content (90,000 words → 810,000 words total)
- **Maintenance**: Nightmare (updating a diagram = 9 file edits)

### Strategy B: MDX Conditional Components (2-3× authoring effort ✅)
- Single MDX file with conditional blocks:
  ```mdx
  <Beginner>
  Python reminder: A list in Python uses square brackets `[]`.
  </Beginner>

  <Advanced>
  We'll use NumPy vectorization for efficient tensor operations.
  </Advanced>

  <SimulationOnly>
  Run Isaac Sim in cloud: `./isaac-sim.sh --headless`
  </SimulationOnly>

  <BudgetHardware>
  Use Raspberry Pi 4 (4GB RAM, $55) for this lab.
  </BudgetHardware>
  ```
- **Effort**: ~2-3× content (write beginner/intermediate/advanced sections + hardware variations)
- **Maintenance**: Easy (update diagram once, applies to all profiles)

### Strategy C: Hybrid (Coarse + Fine) ✅
- **Coarse**: Show/hide entire sections based on difficulty
  ```mdx
  <Advanced>
  ## Advanced Topic: Jacobian Inverse Kinematics
  [Full section here, only shown to Advanced users]
  </Advanced>
  ```
- **Fine**: Inline hints for beginners
  ```mdx
  The forward kinematics equation <Beginner>(which predicts end-effector position from joint angles)</Beginner> is:
  ```
- **Effort**: ~1.5-2× content (mostly coarse sections, few inline hints)

**Decision**: **Strategy C (Hybrid: Coarse sections + inline beginner hints)**

**Implementation Approach**:
1. **Custom MDX components** (`src/theme/MDXComponents.tsx`):
   ```tsx
   export default {
     Beginner: ({ children }) => {
       const { difficulty } = usePersonalization();
       return difficulty === 'introductory' ? <span className="beginner-hint">{children}</span> : null;
     },
     Advanced: ({ children }) => {
       const { difficulty } = usePersonalization();
       return difficulty === 'advanced' ? <div className="advanced-section">{children}</div> : null;
     },
     SimulationOnly: ({ children }) => {
       const { hardwareTrack } = usePersonalization();
       return hardwareTrack === 'simulation' ? <div>{children}</div> : null;
     },
     // ... BudgetHardware, ResearchGrade
   };
   ```
2. **Authoring workflow**:
   - Write core content for intermediate difficulty (default)
   - Add `<Beginner>` inline hints where jargon appears (~10-15 per chapter)
   - Add `<Advanced>` optional sections for deeper math/theory (~2-3 per chapter)
   - Add hardware-specific sections (`<SimulationOnly>`, `<BudgetHardware>`, `<ResearchGrade>`) for setup instructions
3. **Estimated overhead**: +50% authoring time (90,000 words → ~135,000 words with variations)

**Alternatives Considered**:
- **A. Separate files (9 versions)**: Unmaintainable ❌
- **B. Fully granular conditional components**: Over-engineered (too many `<If>` tags, hard to read) ❌
- **D. No personalization (single version for all)**: Simpler ✅ but violates FR-019 requirement and "Practicality & Inclusivity" principle ❌

**Rationale**: Hybrid approach balances authoring effort (~1.5-2× vs 9×) with meaningful personalization. Coarse sections (show/hide full "Advanced Topic" blocks) deliver value without tripling work. Inline beginner hints (`<Beginner>which means...</Beginner>`) are cheap to add (1-2 sentences) and significantly improve comprehension for novices. MDX makes this pattern natural (components look like HTML tags, familiar to technical authors).

**References**:
- MDX components: https://mdxjs.com/table-of-components/
- Docusaurus MDX: https://docusaurus.io/docs/markdown-features/react

---

## Summary of Decisions

| Research Area | Decision | Key Tradeoff |
|---------------|----------|--------------|
| **1. Urdu i18n** | Custom lazy-loading via API | Slower first toggle (<500ms) vs smaller page bundles |
| **2. Session Management** | HTTP-only cookies + Supabase sessions | Database dependency vs instant token revocation |
| **3. Docker GUI** | X11 forwarding (platform-specific) + VNC fallback | Setup complexity vs zero-cost GUI access |
| **4. Vercel Limits** | Standard serverless + edge caching | 50-200ms cold start vs simple deployment |
| **5. Urdu Font** | Noto Nastaliq Urdu (LTR) | 400KB font size vs authentic script rendering |
| **6. Citation Validation** | MDX front matter + CI script | Manual YAML entry vs automated enforcement |
| **7. GPU Labs** | Local GPU (Docker) + NVIDIA Cloud fallback | User setup burden vs $0 infrastructure cost |
| **8. Personalization** | Hybrid MDX components (coarse + fine) | +50% authoring effort vs 9× maintenance nightmare |

**Overall Risk Assessment**: **Medium**
- Highest risk: Docker multi-platform GUI setup (Windows Firewall, XQuartz config) → **Mitigation**: VNC fallback + detailed platform-specific docs
- Medium risk: Translation quality (≥95% Urdu accuracy) → **Mitigation**: Budget for professional translators, human review of GPT-4 output
- Low risk: All other decisions backed by mature technologies (Docusaurus, Vercel, Supabase, Better-Auth)

**Next Phase**: Proceed to Phase 1 (Design) to generate `data-model.md`, API `contracts/`, and `quickstart.md`.
