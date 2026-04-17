function BookCard(props) {
    const { book, setSelectedBook, setBooks } = props;

    // Función que se ejecuta cuando se hace clic en el botón de eliminar
    const handleDelete = async (e) => {
        e.stopPropagation();

        // Hacemos la petición DELETE al webservice delete_book
        try {
            const response = await fetch(`/book/delete/${book.isbn}`, {
                method: "DELETE",
            });

            // Si la petición es exitosa, eliminamos el libro de la lista
            if (response.ok) {
                // Actualizamos el estado books con el nuevo libro
                setBooks((prevBooks) =>
                    // Filtramos los libros y nos quedamos con todos menos el que hemos eliminado
                    prevBooks.filter((b) => b.isbn !== book.isbn),
                );
                console.log("Libro eliminado con éxito");
            }
        } catch (error) {
            // Si hay un error en la petición, lo mostramos
            console.error(error);
        }
    };
    return (
        <li className="book-card-item" onClick={() => setSelectedBook(book)}>
            <div className="book-card-image-container">
                {book.images && book.images.length > 0 ? (
                    <img
                        className="book-card-image"
                        src={book.images[0].ruta}
                        alt={book.title}
                    />
                ) : (
                    <div className="book-card-placeholder">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="book-card-info">
                <h3 className="book-card-title">{book.title}</h3>
                <h4 className="book-card-subtitle">{book.subtitle}</h4>
                <p className="book-card-category">Categoría: {book.category}</p>
                <p className="book-card-author">Autor: {book.author}</p>
                <button className="book-card-delete-button" onClick={handleDelete}>
                    Eliminar
                </button>
            </div>
        </li>
    );
}

export default BookCard;
