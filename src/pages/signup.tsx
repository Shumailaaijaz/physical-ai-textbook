import React from 'react';
import Layout from '@theme/Layout';
import SignupForm from '../components/Auth/SignupForm';
import { AuthProvider } from '../components/Auth/AuthProvider';

export default function SignupPage() {
  return (
    <AuthProvider>
      <Layout
        title="Create Account"
        description="Create your account to get personalized Physical AI content"
      >
        <main style={{ minHeight: '70vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <SignupForm />
        </main>
      </Layout>
    </AuthProvider>
  );
}
