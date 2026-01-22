import BookCard from './BookCard';
import './SearchResults.css';

export default function SearchResults({ results, onAdd, loading, error }) {
  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="search-results">
      <h2 className="results-title">Search Results</h2>
      <div className="results-grid">
        {results.map((book, index) => (
          <BookCard
            key={book.key || index}
            book={book}
            onAdd={onAdd}
            isInLibrary={false}
          />
        ))}
      </div>
    </div>
  );
}
