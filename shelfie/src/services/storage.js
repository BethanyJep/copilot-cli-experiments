const STORAGE_KEY = 'shelfie_library';

export function getLibrary() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.warn('Failed to parse library data, returning empty array');
    return [];
  }
}

export function saveLibrary(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addBook(book) {
  const library = getLibrary();
  const exists = library.some((b) => {
    // Only compare if both values exist and are non-empty
    if (book.isbn && b.isbn && book.isbn === b.isbn) return true;
    if (book.key && b.key && book.key === b.key) return true;
    return false;
  });
  
  if (exists) {
    return { success: false, message: 'Book already in library' };
  }
  
  const bookWithTimestamp = {
    ...book,
    addedAt: new Date().toISOString(),
    id: crypto.randomUUID(),
  };
  
  library.push(bookWithTimestamp);
  saveLibrary(library);
  
  return { success: true, book: bookWithTimestamp };
}

export function removeBook(bookId) {
  const library = getLibrary();
  const filtered = library.filter((b) => b.id !== bookId);
  saveLibrary(filtered);
  return filtered;
}

export function exportLibrary() {
  const library = getLibrary();
  return JSON.stringify(library, null, 2);
}

export function importLibrary(jsonString) {
  try {
    const books = JSON.parse(jsonString);
    if (!Array.isArray(books)) {
      throw new Error('Invalid format');
    }
    saveLibrary(books);
    return { success: true, count: books.length };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
