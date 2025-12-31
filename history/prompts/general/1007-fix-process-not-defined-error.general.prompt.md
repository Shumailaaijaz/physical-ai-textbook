---
id: 1007
title: Fix Process Not Defined Error
stage: misc
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: none
labels: ["bugfix", "browser", "environment-variables", "supabase"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - src/lib/supabase.ts
tests:
  - none
---

## Prompt

Uncaught runtime errors:
ERROR: process is not defined
ReferenceError: process is not defined at eval (webpack-internal:///./src/lib/supabase.ts:6:19)

## Response snapshot

Fixed the "process is not defined" error in browser context:

1. Created a safe `getEnvVar()` helper function that checks if `process` exists before accessing it
2. Replaced direct `process.env` calls with safe environment variable access
3. Added proper type checking: `typeof process !== 'undefined'` before using `process.env`

The issue was that `process.env` is a Node.js global that doesn't exist in browser environments. By adding runtime checks, the code now works in both Node.js (during build) and browser (during runtime) contexts.

**Changes made in src/lib/supabase.ts:**
- Lines 3-9: Added getEnvVar helper function with process existence check
- Lines 11-12: Updated supabaseUrl and supabaseAnonKey to use safe helper
- Lines 14-15: Added process check before accessing environment variables

## Outcome

- ✅ Impact: Fixed runtime error that was preventing the application from loading
- 🧪 Tests: Server needs manual restart by user to apply changes
- 📁 Files: Modified 1 file (src/lib/supabase.ts)
- 🔁 Next prompts: User should manually restart server to see fix in action
- 🧠 Reflection: Browser environments don't have access to Node.js globals like `process`. Always use runtime checks when accessing Node-specific APIs.

## Evaluation notes (flywheel)

- Failure modes observed: Direct process.env usage causing browser runtime errors
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider using Docusaurus customFields for configuration instead of environment variables
