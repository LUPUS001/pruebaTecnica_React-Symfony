// Este componente es la representación visual de cada libro individual
// Es el componente más atómico. Su única misión es pintar un libro y detectar el clic del usuario.
function BookCard(books) {
  const { book, setSelectedBook } = books;

  // Ejecutamos la función y le pasamos ESTE libro específicamente
  return (
    <li onClick={() => setSelectedBook(book)}>
      <h3>{book.title}</h3>
      <h5>{book.subtitle}</h5>
      <h5>{book.author}</h5>
    </li>
  );
}

export default BookCard;
