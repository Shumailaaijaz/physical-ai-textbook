import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [useSelected, setUseSelected] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Capture text selection
  React.useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection().toString();
      if (selection) setSelectedText(selection);
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleSubmit = async () => {
    const params = { query };
    if (useSelected && selectedText) params.selected_text = selectedText;
    const response = await axios.get('https://your-backend-url/rag-chat', { params });  // Replace with deployed URL
    setAnswer(response.data.answer);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '300px', border: '1px solid #ccc', padding: '10px', background: 'white' }}>
      <h3>Book Chatbot</h3>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about the book..." />
      <label>
        <input type="checkbox" checked={useSelected} onChange={(e) => setUseSelected(e.target.checked)} />
        Use selected text only?
      </label>
      {selectedText && <p>Selected: {selectedText.slice(0, 50)}...</p>}
      <button onClick={handleSubmit}>Ask</button>
      {answer && <p>Answer: {answer}</p>}
    </div>
  );
};

export default Chatbot;