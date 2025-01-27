import React from 'react';

function CommandInput({ onCommand, suggestions, onInputChange, input }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onCommand(input);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onInputChange(suggestion + ' ');
  };

  return (
    <div className="command-input">
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type a command or message..."
        onKeyDown={handleKeyPress}
      />
    </div>
  );
}

export default CommandInput;
