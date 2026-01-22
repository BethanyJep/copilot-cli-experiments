import { useState, useEffect } from 'react';
import './BookDetails.css';

// Get/save reviews from localStorage
const getReview = (bookId) => {
  try {
    const reviews = JSON.parse(localStorage.getItem('shelfie_reviews') || '{}');
    return reviews[bookId] || { rating: 0, dateCompleted: '', review: '' };
  } catch {
    return { rating: 0, dateCompleted: '', review: '' };
  }
};

const saveReview = (bookId, reviewData) => {
  try {
    const reviews = JSON.parse(localStorage.getItem('shelfie_reviews') || '{}');
    reviews[bookId] = reviewData;
    localStorage.setItem('shelfie_reviews', JSON.stringify(reviews));
  } catch {
    console.warn('Failed to save review');
  }
};

function StarRating({ rating, onRate, editable = true }) {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${(hoverRating || rating) >= star ? 'filled' : ''} ${editable ? 'editable' : ''}`}
          onClick={() => editable && onRate(star)}
          onMouseEnter={() => editable && setHoverRating(star)}
          onMouseLeave={() => editable && setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function BookDetails({ book, onClose, onRemove }) {
  const [reviewData, setReviewData] = useState({ rating: 0, dateCompleted: '', review: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (book?.id) {
      setReviewData(getReview(book.id));
    }
  }, [book?.id]);
  
  const handleSaveReview = () => {
    saveReview(book.id, reviewData);
    setIsEditing(false);
  };
  
  const handleRatingChange = (rating) => {
    const newData = { ...reviewData, rating };
    setReviewData(newData);
    saveReview(book.id, newData);
  };
  
  return (
    <div className="book-details-overlay" onClick={onClose}>
      <div className="book-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="book-details-content">
          <div className="book-details-cover">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="cover-placeholder" 
              style={{ display: book.coverUrl ? 'none' : 'flex' }}
            >
              <span>{book.title?.[0] || '?'}</span>
            </div>
          </div>
          
          <div className="book-details-info">
            <h2>{book.title}</h2>
            <p className="authors">
              {book.authors?.join(', ') || 'Unknown Author'}
            </p>
            
            {book.publishYear && (
              <p className="detail-row">
                <span className="label">Year:</span>
                <span>{book.publishYear}</span>
              </p>
            )}
            
            {book.numberOfPages && (
              <p className="detail-row">
                <span className="label">Pages:</span>
                <span>{book.numberOfPages}</span>
              </p>
            )}
            
            {book.isbn && (
              <p className="detail-row">
                <span className="label">ISBN:</span>
                <span>{book.isbn}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Journal Review Section */}
        <div className="journal-section">
          <div className="journal-page">
            <div className="journal-header">
              <h3>Reading Journal</h3>
              <div className="journal-bookmark"></div>
            </div>
            
            <div className="journal-content">
              <div className="journal-field">
                <label>My Rating</label>
                <StarRating 
                  rating={reviewData.rating} 
                  onRate={handleRatingChange}
                />
              </div>
              
              <div className="journal-field">
                <label>Date Completed</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="journal-date-input"
                    value={reviewData.dateCompleted}
                    onChange={(e) => setReviewData({ ...reviewData, dateCompleted: e.target.value })}
                  />
                ) : (
                  <span className="journal-date handwritten">
                    {reviewData.dateCompleted 
                      ? new Date(reviewData.dateCompleted).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : '— not yet finished —'}
                  </span>
                )}
              </div>
              
              <div className="journal-field review-field">
                <label>My Thoughts</label>
                <div className="ruled-paper">
                  {isEditing ? (
                    <textarea
                      className="journal-textarea handwritten"
                      placeholder="Write your thoughts about this book..."
                      value={reviewData.review}
                      onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                      rows={6}
                    />
                  ) : (
                    <div className="journal-text handwritten">
                      {reviewData.review || 'No review yet. Click "Write Review" to add your thoughts.'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="journal-actions">
                {isEditing ? (
                  <>
                    <button className="btn-journal btn-save" onClick={handleSaveReview}>
                      Save Review
                    </button>
                    <button className="btn-journal btn-cancel" onClick={() => {
                      setReviewData(getReview(book.id));
                      setIsEditing(false);
                    }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-journal btn-edit" onClick={() => setIsEditing(true)}>
                    {reviewData.review ? 'Edit Review' : 'Write Review'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="book-details-actions">
          <button className="btn btn-remove" onClick={onRemove}>
            Remove from Library
          </button>
        </div>
      </div>
    </div>
  );
}
