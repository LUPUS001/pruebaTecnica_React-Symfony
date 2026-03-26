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
        <li onClick={() => setSelectedBook(book)}>
            <div>
                {book.images && book.images.length > 0 ? (
                    <img src={book.images[0].ruta} alt={book.title} />
                ) : (
                    <span>Sin imagen</span>
                )}
            </div>
            <div>
                <h3>{book.title}</h3>
                <h3>{book.subtitle}</h3>
                <h3>{book.genre}</h3>
                <p>Autor: {book.author}</p>
                <button onClick={handleDelete}>Eliminar</button>
            </div>
        </li>
    );
}

export default BookCard;
