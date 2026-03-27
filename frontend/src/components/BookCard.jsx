function BookCard(props) {
    const { book, setSelectedBook, setBooks } = props;

    const handleDelete = async (e) => {
        e.stopPropagation();

        try {
            const response = await fetch(`/book/delete/${book.isbn}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setBooks((prevBooks) =>
                    prevBooks.filter((b) => b.isbn !== book.isbn),
                );
                console.log("Libro eliminado con éxito");
            }
        } catch (error) {
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
                    <span className="book-card-placeholder-text">Sin imagen</span>
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
