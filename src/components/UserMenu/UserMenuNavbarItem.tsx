import React from 'react';
import { AuthProvider } from '../Auth/AuthProvider';
import UserMenu from './UserMenu';

export default function UserMenuNavbarItem() {
  return (
    <AuthProvider>
      <UserMenu />
    </AuthProvider>
  );
}
