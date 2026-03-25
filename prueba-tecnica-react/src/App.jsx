import { useState, useEffect } from "react";
import "./App.css";
import BookList from "./components/BookList";

function App() {
  const [books, setBooks] = useState([]);

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
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>Parrilla de Libros</h1>
      </header>

      <BookList books={books} />
    </div>
  );
}

export default App;
