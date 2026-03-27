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
        <li className="book-card" onClick={() => setSelectedBook(book)}>
            {book.images && book.images.length > 0 ? (
                <img
                    className="book-thumbnail"
                    src={book.images[0].ruta_archivo}
                    alt={book.title}
                />
            ) : (
                <div className="book-thumbnail">Sin imagen</div>
            )}
            <div>
                <h3>{book.title}</h3>
                <p>Autor: {book.author}</p>
                <button onClick={handleDelete}>Eliminar</button>
            </div>
        </li>
    );
}

export default BookCard;
