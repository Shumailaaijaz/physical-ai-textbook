import React from 'react';
import Layout from '@theme/Layout';
import LoginForm from '../components/Auth/LoginForm';
import { AuthProvider } from '../components/Auth/AuthProvider';

export default function LoginPage() {
  return (
    <AuthProvider>
      <Layout
        title="Sign In"
        description="Sign in to access your personalized Physical AI textbook"
      >
        <main style={{ minHeight: '70vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <LoginForm />
        </main>
      </Layout>
    </AuthProvider>
  );
}
