import React from 'react';
import Chatbot from '../components/Chatbot';

// Your existing layout...
export default function Root({ children }) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
}