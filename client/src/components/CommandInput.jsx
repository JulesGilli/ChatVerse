import React from 'react';

function CommandInput({ onCommand }) {
  const [input, setInput] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onCommand(input);
      setInput('');
    }
  };

  return (
    <div className="command-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a command or message..."
        onKeyDown={handleKeyPress}
      />
    </div>
  );
}

export default CommandInput;
