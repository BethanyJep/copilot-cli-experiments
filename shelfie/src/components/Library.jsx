import BookCard from './BookCard';
import './Library.css';

export default function Library({ books, onRemove }) {
  if (books.length === 0) {
    return (
      <div className="library-empty">
        <div className="empty-icon">📚</div>
        <h2>Your library is empty</h2>
        <p>Search for books or scan an ISBN barcode to add books to your collection.</p>
      </div>
    );
  }

  return (
    <div className="library">
      <h2 className="library-title">
        My Library <span className="book-count">({books.length} books)</span>
      </h2>
      <div className="library-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onRemove={onRemove}
            isInLibrary={true}
          />
        ))}
      </div>
    </div>
  );
}
