import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A comprehensive 13-week university curriculum for building intelligent robots',
  favicon: 'img/favicon.ico',

  // Custom fields for environment variables (accessible in browser)
  customFields: {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://yndqobmkdauicfrlfnss.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluZHFvYm1rZGF1aWNmcmxmbnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzQ3OTgsImV4cCI6MjA4MDk1MDc5OH0.GDoqhdC5ZmihAkRdnPOVQ5fkI75d0a6KDCLtF1eg2mw',
  },

  // Mermaid diagram support
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // Set the production url of your site here
  url: 'https://shumailaaijaz.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/physical-ai-textbook/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Shumailaaijaz', // Usually your GitHub org/user name.
  projectName: 'physical-ai-textbook', // Usually your repo name.

  deploymentBranch: 'gh-pages', // Branch for GitHub Pages deployment
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Edit this page links
          editUrl:
            'https://github.com/Shumailaaijaz/physical-ai-textbook/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Physical AI Textbook',
      logo: {
        alt: 'Physical AI Logo',
        src: 'img/logo.jpeg',
        style: {
          borderRadius: '50%',
          width: '40px',
          height: '40px',
        },
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/chatbot', label: 'AI Chatbot', position: 'left'},
        {
          href: 'https://github.com/Shumailaaijaz/physical-ai-labs',
          label: 'Labs',
          position: 'right',
        },
        {
          href: 'https://github.com/Shumailaaijaz/physical-ai-textbook',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/login',
          label: 'Login',
          position: 'right',
        },
        {
          to: '/signup',
          label: 'Sign Up',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Textbook',
          items: [
            {
              label: 'Start Learning',
              to: '/docs/00-preface',
            },
            {
              label: 'Chapter Outlines',
              to: '/docs/CHAPTER_OUTLINES',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Labs Repository',
              href: 'https://github.com/Shumailaaijaz/physical-ai-labs',
            },
            {
              label: 'Textbook Repository',
              href: 'https://github.com/Shumailaaijaz/physical-ai-textbook',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/Shumailaaijaz/physical-ai-textbook/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Report Issues',
              href: 'https://github.com/Shumailaaijaz/physical-ai-textbook/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI Textbook. Open source under MIT License.<br/><div style="margin-top: 1rem;"><a href="https://www.linkedin.com/in/shumaila-aijaz-916b412b3" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg><span>Connect on LinkedIn</span></a></div>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
