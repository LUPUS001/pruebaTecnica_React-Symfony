// Este componente es la representación visual de cada libro individual
// Es el componente más atómico. Su única misión es pintar un libro y detectar el clic del usuario.
function BookCard(books) {
  const { book, selectedBook } = books;

  // Al hacer clic ejecutamos la función que detectará el libro que estamos seleccionando
  return (
    <li onClick={() => selectedBook(selectedBook)}>
      <h3>{book.title}</h3>
      <h5>{book.subtitle}</h5>
      <h5>{book.author}</h5>
    </li>
  );
}

export default BookCard;
