import './BookCard.css';

export default function BookCard({ book, onRemove, onAdd, isInLibrary }) {
  const coverUrl = book.coverUrl || '/placeholder-book.svg';
  
  return (
    <div className="book-card">
      <div className="book-cover">
        <img 
          src={coverUrl} 
          alt={book.title}
          onError={(e) => {
            e.target.src = '/placeholder-book.svg';
          }}
        />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">
          {book.authors?.join(', ') || 'Unknown Author'}
        </p>
        {book.publishYear && (
          <p className="book-year">{book.publishYear}</p>
        )}
        {book.isbn && (
          <p className="book-isbn">ISBN: {book.isbn}</p>
        )}
      </div>
      <div className="book-actions">
        {isInLibrary ? (
          <button 
            className="btn btn-remove" 
            onClick={() => onRemove(book.id)}
          >
            Remove
          </button>
        ) : (
          <button 
            className="btn btn-add" 
            onClick={() => onAdd(book)}
          >
            Add to Library
          </button>
        )}
      </div>
    </div>
  );
}
