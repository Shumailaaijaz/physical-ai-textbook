# Physical AI Textbook Platform - Setup Guide

This document provides complete setup instructions for the Physical AI & Humanoid Robotics Textbook Platform.

## 🎯 Features Implemented

✅ **Authentication System** - User signup/login with Better-Auth + Supabase
✅ **Personalization Engine** - Conditional content based on user skill levels
✅ **Urdu Translation** - Toggle between English and Urdu with caching
✅ **Profile Management** - Edit personalization preferences
✅ **Conditional MDX Components** - `<Beginner>`, `<Advanced>`, `<SimulationOnly>`, `<ResearchGrade>`
✅ **Session Management** - Persistent user sessions with auto-expiry
✅ **Responsive UI** - Mobile-friendly sticky buttons

---

## 📋 Prerequisites

- **Node.js** 20.0 or higher
- **npm** or **yarn**
- **Supabase Account** (free tier works fine)
- **Vercel Account** (for API deployment, optional for local dev)

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/Shumailaaijaz/physical-ai-textbook.git
cd physical-ai-textbook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to **Project Settings** > **API** and copy:
   - `Project URL` (e.g., `https://abc123xyz.supabase.co`)
   - `anon public` key

### 4. Run Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Open the file `database/migration.sql` from this repository
3. Copy the entire contents and paste into the SQL Editor
4. Click **Run** to create all tables and policies

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
BETTER_AUTH_SECRET=your-random-secret-key-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Generate a secure secret for BETTER_AUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Start Development Server

```bash
npm start
```

The site will be available at [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment to Vercel + GitHub Pages

### Deploy API Routes to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BETTER_AUTH_SECRET`

5. Update `.env` with your Vercel URL:

```env
BETTER_AUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

### Deploy Static Site to GitHub Pages

1. Update `docusaurus.config.ts`:

```ts
url: 'https://your-username.github.io',
baseUrl: '/your-repo-name/',
organizationName: 'your-username',
projectName: 'your-repo-name',
```

2. Deploy:

```bash
GIT_USER=your-username npm run deploy
```

---

## 🧪 Testing the Features

### Test Authentication

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create an account with all 5 personalization questions answered
3. Check Supabase dashboard → Table Editor → `personalization_profiles` to verify the entry
4. Sign out and sign in again at `/login`

### Test Personalization

1. Sign in to your account
2. Go to any chapter (e.g., `/docs/00-preface`)
3. You should see the "Personalize this chapter" button (sticky on desktop, floating on mobile)
4. Click it to enable personalization
5. Add this test content to a chapter MDX file:

```mdx
<Beginner>
This content only shows for beginners!
</Beginner>

<Advanced>
This content only shows for advanced users!
</Advanced>

<SimulationOnly>
Cloud/simulation setup instructions here.
</SimulationOnly>

<ResearchGrade>
Research-grade hardware setup here.
</ResearchGrade>
```

6. Toggle personalization on/off to see content appear/disappear based on your profile

### Test Urdu Translation

1. First, add sample Urdu translation to your Supabase database:

```sql
INSERT INTO translation_content (chapter_id, language_code, mdx_content, completeness_percentage)
VALUES (
  '00-preface',
  'ur',
  '<h1>پیش لفظ</h1><p>یہ Physical AI اور Humanoid Robotics کی تعلیم کے لیے ایک جامع کتاب ہے۔</p>',
  100
);
```

2. Go to the chapter at `/docs/00-preface`
3. Click the "🇵🇰 اردو میں دیکھیں" button
4. Content should switch to Urdu instantly
5. Scroll position should be preserved
6. Toggle back to English

### Test Profile Management

1. Go to `/profile`
2. Click "Edit Profile"
3. Change your Python skill level
4. Click "Save Changes"
5. Go back to a chapter and enable personalization
6. Conditional content should reflect your new profile

---

## 📁 Project Structure

```
physical-ai-textbook/
├── api/                          # Vercel serverless functions
│   ├── auth/
│   │   ├── signup.ts
│   │   ├── login.ts
│   │   └── logout.ts
│   ├── profile/
│   │   └── index.ts
│   ├── session/
│   │   ├── validate.ts
│   │   └── state.ts
│   └── translation/
│       └── [chapterId].ts
├── database/
│   └── migration.sql              # Supabase database schema
├── docs/                          # MDX chapter files
│   ├── 00-preface.mdx
│   ├── 01-introduction-to-physical-ai.mdx
│   └── ...
├── src/
│   ├── components/
│   │   ├── Auth/                  # Authentication components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── Auth.module.css
│   │   ├── Personalization/       # Personalization components
│   │   │   ├── PersonalizationProvider.tsx
│   │   │   ├── PersonalizeButton.tsx
│   │   │   └── Personalization.module.css
│   │   ├── MDX/                   # Conditional MDX components
│   │   │   ├── Beginner.tsx
│   │   │   ├── Advanced.tsx
│   │   │   ├── SimulationOnly.tsx
│   │   │   └── ResearchGrade.tsx
│   │   └── UrduTranslate/         # Urdu translation component
│   ├── hooks/
│   │   └── usePersonalization.ts
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client config
│   │   └── auth.ts                # Better-Auth config
│   ├── pages/                     # Custom pages
│   │   ├── signup.tsx
│   │   ├── login.tsx
│   │   └── profile.tsx
│   └── theme/                     # Theme overrides
│       ├── Root.tsx               # App-wide providers
│       └── MDXComponents.tsx      # MDX component registration
├── .env.example
├── docusaurus.config.ts
└── package.json
```

---

## 🔧 Troubleshooting

### Issue: "Supabase environment variables not set"

**Solution:** Make sure `.env` file exists and contains valid `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### Issue: Authentication fails with "Invalid credentials"

**Solution:**
1. Check Supabase Auth settings → Make sure Email provider is enabled
2. Verify the user exists in Supabase dashboard → Authentication → Users
3. Check browser console for detailed error messages

### Issue: Personalization button not visible

**Solution:**
1. Make sure you're signed in
2. Clear browser cache and localStorage
3. Check browser console for JavaScript errors

### Issue: Urdu translation doesn't load

**Solution:**
1. Verify translation exists in Supabase: `SELECT * FROM translation_content WHERE chapter_id = '00-preface';`
2. Check browser Network tab for failed API requests
3. Ensure RLS policies allow public read access to `translation_content` table

### Issue: Build fails with TypeScript errors

**Solution:**

```bash
npm run typecheck
```

Fix any type errors shown, then run:

```bash
npm run build
```

---

## 📚 Database Schema

See `database/migration.sql` for the complete schema. Key tables:

- **personalization_profiles** - User skill levels and preferences
- **sessions** - Active user sessions
- **translation_content** - Urdu translations for chapters
- **labs** - Interactive lab exercises
- **citations** - Chapter citations

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Getting Help

- **Issues:** [GitHub Issues](https://github.com/Shumailaaijaz/physical-ai-textbook/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Shumailaaijaz/physical-ai-textbook/discussions)
- **Email:** [Your email]

---

## ✨ Next Steps

1. ✅ Test all features locally
2. ✅ Deploy to Vercel + GitHub Pages
3. ⏳ Add content to chapters with personalization
4. ⏳ Translate chapters to Urdu
5. ⏳ Create lab exercises
6. ⏳ Add citations to chapters

Happy teaching! 🤖📚
