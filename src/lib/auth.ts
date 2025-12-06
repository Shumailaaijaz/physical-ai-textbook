import { betterAuth } from 'better-auth';
import { supabase } from './supabase';

const authSecret = process.env.BETTER_AUTH_SECRET || 'development-secret-key-change-in-production';
const authUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
  secret: authSecret,
  baseURL: authUrl,
  database: {
    // Use Supabase as the database provider
    type: 'postgres',
    url: process.env.SUPABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      python_skill: {
        type: 'string',
        required: false,
        defaultValue: 'beginner',
      },
      ros_experience: {
        type: 'string',
        required: false,
        defaultValue: 'none',
      },
      linux_familiarity: {
        type: 'string',
        required: false,
        defaultValue: 'none',
      },
      gpu_access: {
        type: 'string',
        required: false,
        defaultValue: 'none',
      },
      budget_tier: {
        type: 'string',
        required: false,
        defaultValue: 'simulation_only',
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.User;
