import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useAuth } from '../Auth/AuthProvider';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, session, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/physical-ai-textbook/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user || !session) {
    return null;
  }

  const userEmail = session.user?.email || 'User';
  const userName = userEmail.split('@')[0]; // Use email prefix as name

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.userButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.avatar}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className={styles.userName}>{userName}</span>
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.avatarLarge}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userNameLarge}>{userName}</div>
              <div className={styles.userEmail}>{userEmail}</div>
            </div>
          </div>

          <div className={styles.dropdownDivider} />

          <Link
            to="/profile"
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
            </svg>
            View Profile
          </Link>

          <Link
            to="/profile#settings"
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.5 8c0-.17-.01-.33-.03-.5h2.03c.26.48.5.99.5 1.5 0 .51-.24 1.02-.5 1.5h-2.03c.02-.17.03-.33.03-.5zm-2.5-3.5c.3 0 .58.04.86.1l1.43-1.43c-.86-.59-1.87-.92-2.93-.92-1.06 0-2.07.33-2.93.92l1.43 1.43c.28-.06.56-.1.86-.1.14 0 .28.01.41.03L8.7 3.2c-.23-.04-.46-.06-.7-.06-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.24-.02-.47-.06-.7l-1.43 1.43c.02.13.03.27.03.41 0 .3-.04.58-.1.86l1.43 1.43c.59-.86.92-1.87.92-2.93s-.33-2.07-.92-2.93l-1.43 1.43c.06.28.1.56.1.86z" />
            </svg>
            Personalization Settings
          </Link>

          <div className={styles.dropdownDivider} />

          <button
            className={styles.dropdownItem}
            onClick={handleSignOut}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1h8v2H3v10h8v2H3a2 2 0 01-2-2V3a2 2 0 012-2zm10.59 4L11 7.59 12.41 9 16 5.41 12.41 2 11 3.41 13.59 6H7v2h6.59z" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
