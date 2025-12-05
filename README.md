# Physical AI & Humanoid Robotics: From Digital Brain to Embodied Intelligence

> A comprehensive, bilingual (English/Urdu) open-source textbook on humanoid robotics, ROS 2, and physical AI — built with Docusaurus, featuring personalized learning paths and 40+ hands-on labs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.x-green.svg)](https://docusaurus.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

**Live Site**: [https://physical-ai.github.io/textbook](https://physical-ai.github.io/textbook) *(coming soon)*

**Companion Labs**: [github.com/physical-ai/labs](https://github.com/physical-ai/labs)

---

## 📚 What is This?

A **free, open-source textbook** designed for:
- **Advanced undergraduate and graduate students** in robotics, computer science, and electrical engineering
- **Industry practitioners** upskilling in humanoid robotics and Physical AI
- **Researchers** looking for a comprehensive ROS 2 + Isaac Sim reference

### Key Features

✅ **14 Chapters + Appendix** (90,000-120,000 words) covering:
  - Part 0: Preface & Setup
  - Part 1: Foundations of Physical AI
  - Part 2: ROS 2, URDF, Gazebo, Unity (Weeks 1-7)
  - Part 3: NVIDIA Isaac Sim + Isaac ROS (Weeks 8-10)
  - Part 4: Locomotion, Manipulation, VLA, Capstone (Weeks 11-13)
  - Part 5: Hardware Guide (3 budget tiers), Ethics, Future

✅ **Bilingual Support**: Instant toggle between English and Urdu (≥95% human-rated translation accuracy)

✅ **Personalized Learning**: Answer 5 questions (Python/ROS/Linux skill, GPU access, budget) → content adapts to your level

✅ **40+ Companion Labs**: Hands-on ROS 2 packages and Isaac Sim scenes (all runnable via Docker on Windows 10/11, macOS, Linux)

✅ **250+ Verified Citations**: ≥50% peer-reviewed papers (ICRA, IROS, RSS, CoRL), ≥30% official documentation

✅ **Windows-First**: Primary platform is **Windows 10/11 + Docker Desktop** (no native Ubuntu required)

✅ **Dark Mode**: Full support with high-contrast diagrams

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Windows 10/11** (primary), macOS, or Linux
- **Node.js 20.x** or later
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/))
- **Supabase account** (free tier: [supabase.com](https://supabase.com))
- **Vercel account** (free tier: [vercel.com](https://vercel.com))

### Local Development Setup

```powershell
# 1. Clone repository
git clone https://github.com/physical-ai/textbook.git
cd textbook

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy .env.example .env.local
# Edit .env.local with your Supabase URL/key and Better-Auth secret

# 4. Start development server
npm run start
# Site opens at http://localhost:3000

# 5. (Optional) Start Vercel dev server for API endpoints
npx vercel dev
# API available at http://localhost:3001/api
```

### One-Click Cloud Alternative

Click here to open in **GitHub Codespaces** (no installation required):

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=physical-ai/textbook)

---

## 📖 Project Structure

```
textbook/
├── docs/                       # MDX chapter content (English only; Urdu lazy-loaded)
│   ├── 00-preface.mdx
│   ├── 01-introduction.mdx
│   ├── 02-ros2-fundamentals.mdx
│   ├── ...
│   └── 13-ethics-future.mdx
├── src/
│   ├── components/
│   │   ├── Auth/               # SignupForm, LoginForm, AuthProvider
│   │   ├── Personalization/    # PersonalizeButton, PersonalizationProvider
│   │   ├── Translation/        # UrduToggle, TranslationProvider
│   │   └── MDX/                # Beginner, Advanced, SimulationOnly components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePersonalization.ts
│   │   └── useUrduTranslation.ts
│   ├── pages/
│   │   ├── index.tsx           # Homepage with book cover
│   │   ├── signup.tsx
│   │   ├── login.tsx
│   │   └── profile.tsx
│   └── css/
│       └── custom.css          # Dark-mode compatible styles
├── api/                        # Vercel serverless functions
│   ├── auth/
│   │   ├── signup.ts
│   │   ├── login.ts
│   │   └── logout.ts
│   ├── profile.ts
│   ├── translation/
│   │   └── [chapterId].ts
│   └── session/
│       ├── validate.ts
│       └── state.ts
├── static/
│   ├── img/
│   │   ├── book-cover-image.jpg  # 1600×840 px cover
│   │   └── diagrams/             # SVG diagrams (dark-mode compatible)
│   └── fonts/
│       └── NotoNastaliqUrdu-Regular.ttf
├── docs/planning/              # Design documents
│   ├── spec.md
│   ├── plan.md
│   ├── research.md
│   ├── data-model.md
│   └── contracts/              # OpenAPI 3.0 specs
│       ├── auth.openapi.yml
│       ├── profile.openapi.yml
│       ├── translation.openapi.yml
│       └── session.openapi.yml
├── .github/
│   └── workflows/
│       ├── build-deploy.yml    # Deploy to GitHub Pages
│       ├── test-frontend.yml   # TypeScript + lint + build checks
│       └── validate-citations.yml
├── CLAUDE_SYSTEM_PROMPT.txt    # Windows-first instructions for AI assistants
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## 🎯 Technology Stack

- **Frontend**: [Docusaurus 3](https://docusaurus.io/), React 18, TypeScript, MDX
- **Authentication**: [Better-Auth](https://www.better-auth.com/) (email/password)
- **Backend**: [Vercel](https://vercel.com/) serverless functions, Node.js 20.x
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL 15+) with Row-Level Security
- **Deployment**: GitHub Pages (static site) + Vercel (API endpoints)
- **Translation**: Custom lazy-loading system (Urdu fetched via API on first toggle, cached in localStorage)
- **Personalization**: Client-side conditional MDX components based on user profile

---

## 🧪 Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build (validates frontmatter + generates sidebar)
npm run build

# Citation validation (requires all chapters committed)
npm run validate-citations
```

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) *(coming soon)* for:
- Chapter authoring guidelines
- MDX component usage
- Citation requirements (APA 7, ≥50% peer-reviewed)
- Urdu translation workflow
- Code style and commit conventions

### Quick Contribution Checklist

- [ ] All new chapters use `templates/chapter-template.mdx`
- [ ] Citations in APA 7 format with clickable links
- [ ] Alt-text added to all images/diagrams
- [ ] Frontmatter validates against `contracts/chapter-metadata-schema.json`
- [ ] Windows-first setup instructions (see `CLAUDE_SYSTEM_PROMPT.txt`)
- [ ] Dark-mode compatible diagrams (SVG preferred)
- [ ] Tested on Windows 10/11 + Docker Desktop

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file.

All textbook content (text, diagrams, code) is released under the MIT License, allowing free use, modification, and distribution. This aligns with our "Practicality & Inclusivity" principle by maximizing accessibility.

---

## 🙏 Acknowledgments

- **ROS 2 Community** for the foundational robotics framework
- **NVIDIA Isaac Sim Team** for cutting-edge simulation tools
- **Docusaurus Team** for the excellent static site generator
- **Urdu Translators** (names TBD) for high-quality translations
- **Beta Testers** (50+ students and researchers) for invaluable feedback

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/physical-ai/textbook/issues)
- **Discussions**: [GitHub Discussions](https://github.com/physical-ai/textbook/discussions)
- **Email**: contact@physical-ai.org *(coming soon)*
- **Twitter**: [@PhysicalAI](https://twitter.com/PhysicalAI) *(coming soon)*

---

## 🗺️ Roadmap

- [x] T0: Repository setup (Today)
- [ ] T1: Docusaurus + platform setup (14 Dec 2025)
- [ ] T2: Chapter template + validation (16 Dec 2025)
- [ ] T3: Chapters 0-1 complete (21 Dec 2025)
- [ ] T4-T6: Chapters 2-11 complete (18 Jan 2026)
- [ ] T7: MVP Beta Launch - ≥50 users (25 Jan 2026)
- [ ] T8: Chapters 12-13 + PDF export (08 Feb 2026)
- [ ] T9: Official 1.0 Release (28 Feb 2026)

See [tasks.md](docs/planning/tasks.md) for detailed implementation plan (202 tasks).

---

**Built with ❤️ for the robotics community | Powered by Docusaurus**
