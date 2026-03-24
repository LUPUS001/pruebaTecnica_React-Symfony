// Este componente se encarga del "Renderizado de listas". Se encarga de procesar los datos y organizar cómo se ven en conjunto.
import { useState, useEffect } from "react";
import BookCard from "./BookCard";

function BookList(props) {
  // DESESTRUCTURACIÓN: Extraemos las props de forma limpia.
  const { selectedBook, setSelectedBook } = props;

  // Por ahora los datos estan fijos "hardcoded". En el siguiente commit
  // utilizaremos useEffect para traer estos datos desde el JSON externo
  const [books, setBooks] = useState([]);

  // useEffect se ejecuta después del primer renderizado.
  // Es el lugar ideal para peticiones HTTP (fetch).
  useEffect(() => {
    // Definimos la función de carga de datos
    const fetchBooks = async () => {
      try {
        const response = await fetch("/books.json");
        const data = await response.json();
        setBooks(data.books); // El JSON tiene una propiedad 'books' que es el array
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []); // El array vacío [] indica que solo se ejecute una vez al montar el componente

  // Transforma el array de libros(objetos 'books') en componentes visuales usando .map
  const bookCard = books.map((book) => {
    return (
      <BookCard
        key={book.isbn}
        book={book}
        setSelectedBook={setSelectedBook}
      ></BookCard>
    );
  });

  /* Devolvemos el array como una lista de componentes */
  return (
    <div>
      <main>
        {/* Renderizaremos esta lista de tarjetas/cards en el .map */}
        <ol>{bookCard}</ol>
      </main>
    </div>
  );
}

export default BookList;
