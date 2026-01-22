import { useState } from 'react';
import { useLibrary } from './hooks/useLibrary';
import { fetchBookByISBN, searchBooks } from './services/openLibrary';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Bookshelf3D from './components/Bookshelf3D';
import BarcodeScanner from './components/BarcodeScanner';
import './App.css';

function App() {
  const { books, add, remove, error: libraryError, clearError } = useLibrary();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setSearchError(null);
    
    try {
      const results = await searchBooks(query);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No books found');
      }
    } catch (err) {
      setSearchResults([]);
      setSearchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleISBNLookup = async (isbn) => {
    setLoading(true);
    setSearchError(null);
    
    try {
      const book = await fetchBookByISBN(isbn);
      setSearchResults([book]);
    } catch (err) {
      setSearchResults([]);
      setSearchError(`Could not find book with ISBN: ${isbn}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (isbn) => {
    setShowScanner(false);
    handleISBNLookup(isbn);
  };

  const handleAddBook = (book) => {
    const result = add(book);
    if (result.success) {
      showNotification(`"${book.title}" added to library!`);
      setSearchResults([]);
    } else {
      showNotification(result.message, 'error');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">📚 Shelfie</h1>
        <p className="tagline">Your personal book library</p>
      </header>

      <main className="main">
        <SearchBar
          onSearch={handleSearch}
          onISBNSubmit={handleISBNLookup}
          onScanClick={() => setShowScanner(true)}
        />

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <SearchResults
          results={searchResults}
          onAdd={handleAddBook}
          loading={loading}
          error={searchError}
        />

        <Bookshelf3D 
          books={books} 
          onRemove={remove} 
          onScanClick={() => setShowScanner(true)}
        />
      </main>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default App;
