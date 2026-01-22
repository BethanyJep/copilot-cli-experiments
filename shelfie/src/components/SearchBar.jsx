import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onISBNSubmit, onScanClick }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('search'); // 'search' or 'isbn'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (mode === 'isbn') {
      onISBNSubmit(query.trim());
    } else {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-bar">
      <div className="search-modes">
        <button
          className={`mode-btn ${mode === 'search' ? 'active' : ''}`}
          onClick={() => setMode('search')}
        >
          Search
        </button>
        <button
          className={`mode-btn ${mode === 'isbn' ? 'active' : ''}`}
          onClick={() => setMode('isbn')}
        >
          ISBN
        </button>
        <button className="mode-btn scan-btn" onClick={onScanClick}>
          📷 Scan
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'isbn' ? 'Enter ISBN...' : 'Search by title or author...'}
          className="search-input"
        />
        <button type="submit" className="search-submit">
          {mode === 'isbn' ? 'Lookup' : 'Search'}
        </button>
      </form>
    </div>
  );
}
