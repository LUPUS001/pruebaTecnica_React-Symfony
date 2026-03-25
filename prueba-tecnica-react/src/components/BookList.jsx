import BookCard from "./BookCard";

// El componente BookList recibe la lista de libros desde App.jsx a través de props.
function BookList(props) {
  const { books, setSelectedBook } = props;

  // Recorremos el array de libros que viene de App.jsx
  const bookCard = books.map((book, index) => {
    return (
      <BookCard 
        key={index} 
        book={book} 
        setSelectedBook={setSelectedBook}
      />
    );
  });

  /* Devolvemos el array como una lista de componentes dentro de la rejilla */
  return (
    <main className="books-grid">
      {bookCard}
    </main>
  );
}

export default BookList;
