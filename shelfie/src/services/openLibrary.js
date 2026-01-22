const BASE_URL = 'https://openlibrary.org';

export async function fetchBookByISBN(isbn) {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  const response = await fetch(`${BASE_URL}/isbn/${cleanISBN}.json`);
  
  if (!response.ok) {
    throw new Error('Book not found');
  }
  
  const data = await response.json();
  
  // Get author names if available
  let authors = [];
  if (data.authors) {
    const authorPromises = data.authors.map(async (author) => {
      try {
        const authorRes = await fetch(`${BASE_URL}${author.key}.json`);
        const authorData = await authorRes.json();
        return authorData.name;
      } catch {
        return 'Unknown Author';
      }
    });
    authors = await Promise.all(authorPromises);
  }
  
  return {
    isbn: cleanISBN,
    title: data.title,
    authors,
    coverUrl: `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`,
    publishDate: data.publish_date,
    numberOfPages: data.number_of_pages,
    key: data.key,
  };
}

export async function searchBooks(query) {
  const response = await fetch(
    `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`
  );
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  const data = await response.json();
  
  return data.docs.map((doc) => ({
    key: doc.key,
    title: doc.title,
    authors: doc.author_name || [],
    isbn: doc.isbn?.[0] || null,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
    publishYear: doc.first_publish_year,
  }));
}
