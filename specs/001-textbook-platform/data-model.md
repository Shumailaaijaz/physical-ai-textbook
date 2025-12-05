# Data Model: Physical AI Humanoid Robotics Textbook Platform

**Feature**: `001-textbook-platform` | **Date**: 2025-12-05 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

**Database**: Supabase PostgreSQL 15+
**Schema Version**: 1.0.0

## Overview

This data model defines the database schema for the Physical AI Humanoid Robotics Textbook Platform. The system stores user accounts, personalization profiles, session data, Urdu translations, lab metadata, and citation tracking. All entities are implemented in Supabase PostgreSQL with row-level security (RLS) policies for data protection.

**Entity Relationships Summary**:
- Each **User** has exactly one **PersonalizationProfile** (1:1)
- Each **User** can have multiple **Sessions** (1:N), but only one active session at a time
- Each **Chapter** can have multiple **TranslationContent** entries (1:N, one per language)
- Each **Chapter** can have multiple **Citations** (1:N)
- Each **Lab** can be linked to multiple **Chapters** (N:M via chapter_ids array)

## Entities

### 1. User

**Purpose**: Represents a registered learner with authentication credentials and account metadata.

**Table Name**: `users`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (never store plain text) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `last_login` | TIMESTAMPTZ | NULL | Most recent successful login timestamp |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status (allows soft-delete/deactivation) |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification status (future feature) |

**Indexes**:
- PRIMARY KEY on `id` (automatic B-tree index)
- UNIQUE INDEX on `email` (for fast login lookups)
- INDEX on `created_at` (for analytics queries)

**Validation Rules**:
- `email`: Must match RFC 5322 email format (validated by Better-Auth)
- `password_hash`: Minimum 60 characters (bcrypt outputs 60-char hashes)
- `email`: Case-insensitive (normalize to lowercase before insert)

**Derived From**:
- FR-010: User registration with email and password
- FR-013: User login with email and password
- FR-015: Persist user sessions across page navigations

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@university.edu",
  "password_hash": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "created_at": "2025-12-01T10:30:00Z",
  "last_login": "2025-12-05T14:22:00Z",
  "is_active": true,
  "email_verified": false
}
```

**RLS Policy**:
- Users can SELECT/UPDATE only their own row (WHERE user_id = auth.uid())
- INSERT allowed only via signup API (service role)
- DELETE not allowed (use `is_active = FALSE` for soft delete)

---

### 2. PersonalizationProfile

**Purpose**: Stores a user's answers to 5 personalization questions, used to adapt chapter content (difficulty level and hardware track).

**Table Name**: `personalization_profiles`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique profile identifier |
| `user_id` | UUID | FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE, UNIQUE, NOT NULL | User who owns this profile |
| `python_skill` | VARCHAR(20) | NOT NULL, CHECK (python_skill IN ('none', 'beginner', 'intermediate', 'advanced')) | Python skill level |
| `ros_experience` | VARCHAR(20) | NOT NULL, CHECK (ros_experience IN ('none', 'basic', 'experienced')) | ROS experience level |
| `linux_familiarity` | VARCHAR(20) | NOT NULL, CHECK (linux_familiarity IN ('none', 'some', 'proficient')) | Linux familiarity level |
| `gpu_access` | VARCHAR(20) | NOT NULL, CHECK (gpu_access IN ('yes', 'no', 'cloud_only')) | GPU access availability |
| `budget_tier` | VARCHAR(30) | NOT NULL, CHECK (budget_tier IN ('simulation_only', 'under_500', 'under_2000', 'research_grade')) | Hardware budget tier |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last profile update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `user_id` (ensures 1:1 relationship with User)
- INDEX on `updated_at` (for analytics)

**Validation Rules**:
- All 5 profile fields are required (NOT NULL constraint)
- Enum values are validated via CHECK constraints
- `updated_at` is automatically updated on PATCH /api/profile via trigger

**Derived From**:
- FR-011: Collect 5 required personalization questions during signup
- FR-012: Prevent account creation if any question is unanswered
- FR-014: Allow users to view and edit their profile
- FR-019: Adapt content based on user profile (difficulty + hardware track)

**Sample Data**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "python_skill": "intermediate",
  "ros_experience": "basic",
  "linux_familiarity": "some",
  "gpu_access": "no",
  "budget_tier": "simulation_only",
  "created_at": "2025-12-01T10:30:05Z",
  "updated_at": "2025-12-03T16:45:00Z"
}
```

**Personalization Mapping** (for content adaptation):
- **Difficulty Level**:
  - `python_skill IN ('none', 'beginner')` → Show introductory content
  - `python_skill = 'intermediate'` → Show intermediate content (default)
  - `python_skill = 'advanced'` → Show advanced content
- **Hardware Track**:
  - `budget_tier = 'simulation_only'` → Emphasize simulation-only instructions
  - `budget_tier IN ('under_500', 'under_2000')` → Show budget hardware options
  - `budget_tier = 'research_grade'` → Show local GPU setup guides

**RLS Policy**:
- Users can SELECT/UPDATE/INSERT only their own profile (WHERE user_id = auth.uid())
- Automatic creation during signup (INSERT via signup API)

---

### 3. Session

**Purpose**: Represents a logged-in user's active session with authentication token, personalization state, language preference, and activity tracking for idle timeout.

**Table Name**: `sessions`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | UUID | FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE, NOT NULL | User who owns this session |
| `token_hash` | VARCHAR(255) | UNIQUE, NOT NULL | Hashed session token (for secure validation) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Session creation timestamp |
| `last_activity` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Most recent user activity timestamp |
| `expires_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() + INTERVAL '90 days' | Absolute session expiration (90 days from creation) |
| `personalization_enabled` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether "Personalise this chapter" is active |
| `language_preference` | VARCHAR(10) | NOT NULL, DEFAULT 'en', CHECK (language_preference IN ('en', 'ur')) | Current language preference (English/Urdu) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Session active status (allows soft-delete on logout) |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `token_hash` (for fast session validation)
- INDEX on `user_id` (for user session lookups)
- INDEX on `last_activity` (for idle timeout cleanup queries)
- INDEX on `expires_at` (for session expiration cleanup)

**Validation Rules**:
- `token_hash`: SHA-256 hashed token (64 characters hex)
- `last_activity`: Updated on every API request via middleware
- `expires_at`: Set to `created_at + 90 days` on session creation
- **Idle Timeout Logic**: Session is invalid if `last_activity < NOW() - INTERVAL '7 days'` (even if `expires_at` has not passed)
- **Absolute Expiration Logic**: Session is invalid if `NOW() > expires_at`

**Session Validation Query**:
```sql
SELECT * FROM sessions
WHERE token_hash = $1
  AND is_active = TRUE
  AND last_activity >= NOW() - INTERVAL '7 days'  -- Idle timeout check
  AND expires_at > NOW()                            -- Absolute expiration check
LIMIT 1;
```

**Derived From**:
- FR-015: Persist login sessions across page navigations
- FR-016: Log users out after 7 days of inactivity (idle timeout) or 90 days max
- FR-021: Persist personalization state across chapter navigations
- FR-027: Persist language preference across chapter navigations and page refreshes

**Sample Data**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "token_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "created_at": "2025-12-01T10:30:10Z",
  "last_activity": "2025-12-05T14:22:00Z",
  "expires_at": "2026-03-01T10:30:10Z",
  "personalization_enabled": true,
  "language_preference": "ur",
  "is_active": true
}
```

**Session Lifecycle**:
1. **Creation**: POST /api/auth/signup or POST /api/auth/login → Insert new session with `created_at = NOW()`, `expires_at = NOW() + 90 days`
2. **Activity Tracking**: Every API request updates `last_activity = NOW()` (via middleware)
3. **Idle Timeout**: If user inactive for 7 days, session becomes invalid (query returns no rows)
4. **Absolute Expiration**: After 90 days, session becomes invalid regardless of activity
5. **Logout**: POST /api/auth/logout → Set `is_active = FALSE` (soft delete)

**RLS Policy**:
- Users can SELECT only their own sessions (WHERE user_id = auth.uid())
- INSERT/UPDATE via API only (service role)
- Cleanup job deletes sessions where `expires_at < NOW() - INTERVAL '30 days'` (keep 30-day audit trail)

---

### 4. TranslationContent

**Purpose**: Stores Urdu translation of chapter content (lazy-loaded via API), with completeness percentage tracking.

**Table Name**: `translation_content`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique translation record identifier |
| `chapter_id` | VARCHAR(50) | NOT NULL | Chapter identifier (e.g., '00-preface', '03-ros2-basics') |
| `language` | VARCHAR(10) | NOT NULL, CHECK (language IN ('en', 'ur')) | Language code (ISO 639-1) |
| `mdx_content` | TEXT | NOT NULL | Full translated MDX content (headings, paragraphs, code comments) |
| `completeness_percentage` | INTEGER | NOT NULL, DEFAULT 0, CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100) | Translation completeness (0-100%) |
| `last_updated` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last translation update timestamp |
| `translator_notes` | TEXT | NULL | Optional notes from translator (e.g., "Technical terms kept in English") |
| `word_count` | INTEGER | NULL | Approximate word count (for tracking translation progress) |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(chapter_id, language)` (prevents duplicate translations per chapter)
- INDEX on `completeness_percentage` (for filtering incomplete translations)
- INDEX on `last_updated` (for tracking recent updates)

**Validation Rules**:
- `chapter_id`: Must match existing chapter filename (e.g., '00-preface', '01-foundations', etc.)
- `language`: Only 'en' or 'ur' allowed (English is static in Docusaurus, Urdu is lazy-loaded)
- `completeness_percentage`: Must be ≥95 for Urdu toggle button to be visible (FR-028)
- `mdx_content`: Preserve MDX syntax (code blocks, links, citations) with translated text

**Derived From**:
- FR-024: Fetch Urdu translation from API on first toggle (<500ms)
- FR-028: Hide Urdu toggle button for chapters with <95% translation completeness
- FR-029: Achieve ≥95% human-rated translation accuracy
- SC-004: Urdu translation accuracy ≥95% via human evaluation

**Sample Data**:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "chapter_id": "02-ros2-basics",
  "language": "ur",
  "mdx_content": "# ROS 2 بنیادی باتیں\n\nیہ باب ROS 2 (Robot Operating System 2) کا تعارف فراہم کرتا ہے...",
  "completeness_percentage": 98,
  "last_updated": "2025-11-28T09:15:00Z",
  "translator_notes": "Technical terms like 'node', 'topic', 'service' kept in English for consistency",
  "word_count": 7200
}
```

**Translation API Response** (GET /api/translation/:chapterId?language=ur):
```json
{
  "chapter_id": "02-ros2-basics",
  "language": "ur",
  "mdx_content": "# ROS 2 بنیادی باتیں\n\n...",
  "completeness_percentage": 98,
  "cached_until": "2025-12-12T14:22:00Z"
}
```

**Caching Strategy**:
- **Server-side**: ETag header based on `last_updated` timestamp, max-age=7d
- **Client-side**: Store in localStorage with key `translation_${chapterId}_ur`, expire after 7 days

**RLS Policy**:
- All users can SELECT translations (public read access)
- INSERT/UPDATE only via admin API (service role for translators)

---

### 5. Lab

**Purpose**: Represents a companion ROS 2 package or Isaac Sim scene in the labs repository, with Docker setup metadata and links to corresponding chapters.

**Table Name**: `labs`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique lab identifier |
| `lab_id` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable lab ID (e.g., 'lab-03-1-urdf-robot') |
| `title` | VARCHAR(255) | NOT NULL | Lab title (e.g., 'URDF Robot Modeling') |
| `chapter_ids` | TEXT[] | NOT NULL, DEFAULT '{}' | Array of chapter IDs linked to this lab |
| `description` | TEXT | NULL | Brief lab description (1-2 sentences) |
| `docker_image` | VARCHAR(255) | NULL | Docker image name (e.g., 'physical-ai/lab-03-1:latest') |
| `github_url` | VARCHAR(500) | NOT NULL | URL to lab directory in github.com/physical-ai/labs |
| `platform_requirements` | JSONB | NOT NULL, DEFAULT '{}' | Platform-specific requirements (Docker version, GPU, X11 forwarding) |
| `expected_duration_minutes` | INTEGER | NULL | Estimated time to complete lab (for user planning) |
| `difficulty_level` | VARCHAR(20) | CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) | Lab difficulty (aligned with personalization) |
| `ros_version` | VARCHAR(20) | NOT NULL, DEFAULT 'humble' | ROS version (humble/iron) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Lab creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last lab update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `lab_id`
- GIN INDEX on `chapter_ids` (for array containment queries)
- INDEX on `difficulty_level` (for filtering labs by difficulty)

**Validation Rules**:
- `lab_id`: Kebab-case format (e.g., 'lab-03-1-urdf-robot')
- `chapter_ids`: Array of valid chapter IDs (e.g., ['03-ros2-urdf', '04-ros2-visualization'])
- `github_url`: Must start with 'https://github.com/physical-ai/labs/'
- `platform_requirements`: JSON with keys: `docker_version`, `gpu_required`, `gui_forwarding_method`

**Derived From**:
- FR-030: Provide companion repository with ≥40 runnable ROS 2 packages/Isaac Sim scenes
- FR-031: All labs include README with Docker setup instructions, versioned dependencies
- FR-032: All labs runnable via Docker on Windows/Mac/Linux
- FR-033: Provide GitHub Codespaces/devcontainer configuration for one-click cloud execution
- FR-034: Link each chapter to corresponding lab(s)

**Sample Data**:
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "lab_id": "lab-03-1-urdf-robot",
  "title": "URDF Robot Modeling",
  "chapter_ids": ["03-ros2-urdf"],
  "description": "Create and visualize a simple robot model using URDF and RViz",
  "docker_image": "physical-ai/lab-03-1:latest",
  "github_url": "https://github.com/physical-ai/labs/tree/main/chapter-03-urdf",
  "platform_requirements": {
    "docker_version": ">=24.0.0",
    "gpu_required": false,
    "gui_forwarding_method": "x11"
  },
  "expected_duration_minutes": 45,
  "difficulty_level": "beginner",
  "ros_version": "humble",
  "created_at": "2025-11-15T12:00:00Z",
  "updated_at": "2025-11-20T10:30:00Z"
}
```

**Query for Chapter Labs** (GET /api/labs?chapter=03-ros2-urdf):
```sql
SELECT * FROM labs
WHERE '03-ros2-urdf' = ANY(chapter_ids)
ORDER BY lab_id ASC;
```

**RLS Policy**:
- All users can SELECT labs (public read access)
- INSERT/UPDATE only via admin API (service role for lab maintainers)

---

### 6. Citation

**Purpose**: Tracks all sources (peer-reviewed papers, official docs, blogs) referenced in chapters, with type classification for enforcing source priority targets (≥50% peer-reviewed).

**Table Name**: `citations`

**Schema**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique citation identifier |
| `citation_id` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable citation ID (e.g., 'cite-ros2-design-2022') |
| `chapter_id` | VARCHAR(50) | NOT NULL | Chapter where citation appears (e.g., '02-ros2-basics') |
| `url` | VARCHAR(1000) | NOT NULL | Source URL (peer-reviewed paper DOI, official docs, blog) |
| `title` | VARCHAR(500) | NOT NULL | Source title (e.g., 'ROS 2 Design Document') |
| `authors` | TEXT | NULL | Author names (comma-separated, e.g., 'Smith, J., Johnson, K.') |
| `publication_year` | INTEGER | CHECK (publication_year >= 2000 AND publication_year <= 2030) | Publication year |
| `type` | VARCHAR(30) | NOT NULL, CHECK (type IN ('peer_reviewed', 'official_docs', 'secondary')) | Citation type (for source priority tracking) |
| `apa7_formatted` | TEXT | NOT NULL | Full APA 7 citation string (pre-formatted for display) |
| `venue` | VARCHAR(255) | NULL | Publication venue (e.g., 'ICRA 2022', 'ros.org', 'robotics.stackexchange.com') |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Citation creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `citation_id`
- INDEX on `chapter_id` (for fetching all citations per chapter)
- INDEX on `type` (for source priority validation queries)

**Validation Rules**:
- `citation_id`: Kebab-case format (e.g., 'cite-ros2-design-2022')
- `type`: Must be 'peer_reviewed', 'official_docs', or 'secondary'
- `url`: Valid URL format (HTTP/HTTPS)
- `apa7_formatted`: Must follow APA 7 citation format (validated during CI)

**Derived From**:
- FR-003: Render all citations in APA 7 format with clickable hyperlinks
- FR-004: Include full bibliography at end of each chapter
- FR-005: Ensure ≥50% of total citations are peer-reviewed (minimum 125 out of 250)
- FR-006: Ensure ≥30% of total citations are official documentation (minimum 75 out of 250)
- FR-007: Limit secondary sources to ≤20% (maximum 50 out of 250)
- FR-036: Include minimum 250 traceable sources across entire textbook
- SC-001: Every technical claim has verifiable citation (100% coverage)

**Sample Data**:
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "citation_id": "cite-ros2-design-2022",
  "chapter_id": "02-ros2-basics",
  "url": "https://design.ros2.org/articles/why_ros2.html",
  "title": "Why ROS 2?",
  "authors": "Open Robotics",
  "publication_year": 2022,
  "type": "official_docs",
  "apa7_formatted": "Open Robotics. (2022). Why ROS 2? https://design.ros2.org/articles/why_ros2.html",
  "venue": "ros2.org",
  "created_at": "2025-11-10T08:00:00Z"
}
```

**Source Priority Validation Query** (CI script):
```sql
-- Total citations
SELECT COUNT(*) AS total_citations FROM citations;

-- Peer-reviewed count (must be ≥50%)
SELECT COUNT(*) AS peer_reviewed_count
FROM citations
WHERE type = 'peer_reviewed';

-- Official docs count (must be ≥30%)
SELECT COUNT(*) AS official_docs_count
FROM citations
WHERE type = 'official_docs';

-- Secondary count (must be ≤20%)
SELECT COUNT(*) AS secondary_count
FROM citations
WHERE type = 'secondary';
```

**Citation Type Classification**:
- **peer_reviewed**: Papers from ICRA, IROS, RSS, CoRL, RA-L, IJRR, T-RO, or other peer-reviewed venues (DOI link preferred)
- **official_docs**: Official documentation from ROS 2, NVIDIA Isaac Sim, Unitree, Intel RealSense, etc. (authoritative sources)
- **secondary**: High-quality blogs, GitHub READMEs, whitepapers, tutorial sites (e.g., robotics.stackexchange.com, LearnOpenCV, PyImageSearch)

**RLS Policy**:
- All users can SELECT citations (public read access)
- INSERT/UPDATE only via admin API (service role for content authors)

---

## Relationships Summary

```text
User (1) ──── (1) PersonalizationProfile
  │
  └──── (N) Session (one active at a time, but multiple historical sessions)

Chapter (static MDX files, not in database)
  │
  ├──── (N) TranslationContent (one per language: en, ur)
  ├──── (N) Citation (multiple sources per chapter)
  └──── (M) Lab (via chapter_ids array in Lab table)
```

**Key Design Decisions**:
- **User ↔ PersonalizationProfile**: 1:1 relationship enforced by UNIQUE constraint on `personalization_profiles.user_id`
- **User ↔ Session**: 1:N relationship (user can have multiple sessions, but only one active), enforced by application logic (not database constraint)
- **Chapter ↔ TranslationContent**: 1:N relationship (one chapter, multiple languages), enforced by UNIQUE constraint on `(chapter_id, language)`
- **Chapter ↔ Citation**: 1:N relationship (one chapter, multiple citations)
- **Chapter ↔ Lab**: N:M relationship (one lab can be linked to multiple chapters, one chapter can have multiple labs), implemented via `chapter_ids` TEXT[] array in Lab table

## Migration Strategy

**Initial Schema Setup** (Supabase SQL Editor):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create personalization_profiles table
CREATE TABLE personalization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  python_skill VARCHAR(20) NOT NULL CHECK (python_skill IN ('none', 'beginner', 'intermediate', 'advanced')),
  ros_experience VARCHAR(20) NOT NULL CHECK (ros_experience IN ('none', 'basic', 'experienced')),
  linux_familiarity VARCHAR(20) NOT NULL CHECK (linux_familiarity IN ('none', 'some', 'proficient')),
  gpu_access VARCHAR(20) NOT NULL CHECK (gpu_access IN ('yes', 'no', 'cloud_only')),
  budget_tier VARCHAR(30) NOT NULL CHECK (budget_tier IN ('simulation_only', 'under_500', 'under_2000', 'research_grade')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_personalization_profiles_user_id ON personalization_profiles(user_id);
CREATE INDEX idx_personalization_profiles_updated_at ON personalization_profiles(updated_at);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '90 days',
  personalization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  language_preference VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'ur')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create translation_content table
CREATE TABLE translation_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL CHECK (language IN ('en', 'ur')),
  mdx_content TEXT NOT NULL,
  completeness_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  translator_notes TEXT,
  word_count INTEGER,
  UNIQUE (chapter_id, language)
);

CREATE INDEX idx_translation_content_chapter_language ON translation_content(chapter_id, language);
CREATE INDEX idx_translation_content_completeness ON translation_content(completeness_percentage);
CREATE INDEX idx_translation_content_last_updated ON translation_content(last_updated);

-- Create labs table
CREATE TABLE labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  chapter_ids TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  docker_image VARCHAR(255),
  github_url VARCHAR(500) NOT NULL,
  platform_requirements JSONB NOT NULL DEFAULT '{}',
  expected_duration_minutes INTEGER,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  ros_version VARCHAR(20) NOT NULL DEFAULT 'humble',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labs_lab_id ON labs(lab_id);
CREATE INDEX idx_labs_chapter_ids ON labs USING GIN(chapter_ids);
CREATE INDEX idx_labs_difficulty_level ON labs(difficulty_level);

-- Create citations table
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation_id VARCHAR(50) UNIQUE NOT NULL,
  chapter_id VARCHAR(50) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  title VARCHAR(500) NOT NULL,
  authors TEXT,
  publication_year INTEGER CHECK (publication_year >= 2000 AND publication_year <= 2030),
  type VARCHAR(30) NOT NULL CHECK (type IN ('peer_reviewed', 'official_docs', 'secondary')),
  apa7_formatted TEXT NOT NULL,
  venue VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citations_citation_id ON citations(citation_id);
CREATE INDEX idx_citations_chapter_id ON citations(chapter_id);
CREATE INDEX idx_citations_type ON citations(type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be added in a separate migration
```

**Row-Level Security (RLS) Policies** (Phase 2 - after initial schema):

```sql
-- Users: Can only read/update own row
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- PersonalizationProfiles: Can only read/update own profile
CREATE POLICY profiles_select_own ON personalization_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON personalization_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Sessions: Can only read own sessions
CREATE POLICY sessions_select_own ON sessions FOR SELECT USING (auth.uid() = user_id);

-- TranslationContent: Public read access
CREATE POLICY translation_select_all ON translation_content FOR SELECT USING (true);

-- Labs: Public read access
CREATE POLICY labs_select_all ON labs FOR SELECT USING (true);

-- Citations: Public read access
CREATE POLICY citations_select_all ON citations FOR SELECT USING (true);
```

## Seeding Strategy (Development & Testing)

**Development Seed Data**:
1. Create 3 test users (beginner, intermediate, advanced profiles)
2. Create Urdu translation for Chapters 0-2 (MVP testing)
3. Create 5 sample labs (ROS 2 basics + URDF)
4. Create 20 sample citations (10 peer-reviewed, 5 official docs, 5 secondary)

**Production Seed Data**:
1. Insert Chapter 0-6 Urdu translations (MVP launch)
2. Insert 20+ labs corresponding to Chapters 0-6
3. Insert 125+ citations (≥50% peer-reviewed)

## Backup & Recovery

- **Supabase Auto-Backup**: Daily automated backups (retained for 7 days on Free plan, 30 days on Pro)
- **Point-in-Time Recovery**: Available on Supabase Pro plan (restore to any point in last 30 days)
- **Manual Backups**: Weekly `pg_dump` exports stored in separate cloud storage (Google Cloud Storage or AWS S3)

## Performance Considerations

- **Session Validation**: Most frequent query (~1000s req/day). Indexed on `token_hash` for O(log n) lookup.
- **Translation Fetch**: Moderate frequency (~100s req/day). Cached on client-side (localStorage) and server-side (ETag).
- **Citation Aggregation**: Infrequent (CI only). No performance concerns.
- **Profile Updates**: Infrequent (~10s req/day). No performance concerns.

**Estimated Database Size** (90-day post-launch):
- Users: 300 rows × 0.5 KB = 150 KB
- PersonalizationProfiles: 300 rows × 0.3 KB = 90 KB
- Sessions: 500 rows × 0.4 KB = 200 KB (includes inactive sessions)
- TranslationContent: 14 chapters × 7 KB avg = 98 KB
- Labs: 40 rows × 1 KB = 40 KB
- Citations: 250 rows × 0.5 KB = 125 KB
- **Total**: ~700 KB (well within Supabase Free tier 500 MB limit)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-05
**Next Review**: After `/sp.tasks` (when implementation begins)
