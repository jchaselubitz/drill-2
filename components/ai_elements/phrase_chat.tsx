import React, { useState } from 'react';

import { ChatMessage } from './content_request';

interface PhraseChatProps {
  messages: ChatMessage[];
  handleRequest: (request: string) => void;
}

const PhraseChat: React.FC<PhraseChatProps> = ({ messages, handleRequest }) => {
  const [newMessage, setNewMessage] = useState<string>('');

  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    handleRequest(newMessage);
    setNewMessage('');
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                maxWidth: '60%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: message.role === 'assistant' ? '#d1e7dd' : '#cfe2ff',
                color: '#333',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleSend}
          onKeyDown={(e) => handleKeyPress(e)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PhraseChat;
