import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physical AI Chatbot',
  description: 'Ask questions about Physical AI and robotics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
