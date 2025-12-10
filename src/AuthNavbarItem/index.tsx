import React from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import { useAuth } from ' ../../contexts/AuthContext.tsx';
import Link from '@docusaurus/Link';

export default function AuthNavbarItem(props: any) {
  const { user } = useAuth();

  if (user) {
    return (
      <DropdownNavbarItem
        {...props}
        label={
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span className="font-medium hidden md:block">{user.name}</span>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex items-center space-x-3 ml-4">
      <Link
        to="/login"
        className="font-bold hover:text-primary text-sm transition-colors"
      >
        Log in
      </Link>
      <Link
        to="/signup"
        className="button button--primary button--sm rounded-lg py-2 px-4 shadow-md hover:-translate-y-0.5 transition-transform"
      >
        Sign Up
      </Link>
    </div>
  );
}