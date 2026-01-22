import { useState, useCallback } from 'react';
import { getLibrary, addBook, removeBook } from '../services/storage';

export function useLibrary() {
  const [books, setBooks] = useState(() => getLibrary());
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setBooks(getLibrary());
  }, []);

  const add = useCallback((book) => {
    const result = addBook(book);
    if (result.success) {
      setBooks(getLibrary());
      setError(null);
    } else {
      setError(result.message);
    }
    return result;
  }, []);

  const remove = useCallback((bookId) => {
    const updated = removeBook(bookId);
    setBooks(updated);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    books,
    error,
    add,
    remove,
    refresh,
    clearError,
  };
}
