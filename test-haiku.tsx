import React, { useState } from 'react';

export default function HelloWorld() {
  const [showMessage, setShowMessage] = useState(true);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{showMessage ? 'Hello from Haiku!' : 'Message hidden'}</h1>
      <button 
        onClick={() => setShowMessage(!showMessage)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          borderRadius: '4px',
          border: '1px solid #ccc',
          background: '#f5f5f5'
        }}
      >
        Toggle Message
      </button>
    </div>
  );
}
