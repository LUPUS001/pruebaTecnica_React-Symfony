import { useState, useEffect } from "react";
import "./App.css";
import BookList from "./components/BookList";

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState({});

  const fetchAllBooks = async () => {
    try {
      const response = await fetch("/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  return (
    <div className="App">
      <header style={{ padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "8px", marginBottom: "20px", display: "flex", gap: "20px" }}>
        {selectedBook.isbn ? (
          <>
            <div style={{ flex: "1", textAlign: "center" }}>
              {selectedBook.images && selectedBook.images.length > 0 ? (
                <img src={selectedBook.images[0].ruta} alt={selectedBook.title} style={{ width: "150px", borderRadius: "4px" }} />
              ) : (
                <div style={{ width: "150px", height: "180px", backgroundColor: "#ccc", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>Sin imagen</div>
              )}
            </div>
            <div style={{ flex: "2" }}>
              <h2>{selectedBook.title}</h2>
              <p><strong>Autor:</strong> {selectedBook.author}</p>
              <p><strong>ISBN:</strong> {selectedBook.isbn}</p>
              <p><strong>Categoría:</strong> {selectedBook.category}</p>
              <p><em>{selectedBook.description}</em></p>
            </div>
          </>
        ) : (
          <p>Selecciona un libro en la parrilla para ver más información.</p>
        )}
      </header>

      <BookList books={books} setSelectedBook={setSelectedBook} />
    </div>
  );
}

export default App;
