function BookCard(props) {
    const { book, setSelectedBook, setBooks, user } = props;

    // Comprobar si el usuario actual es el dueño del libro o es un administrador
    const isOwner = user && (book.owner === user.email || user.roles.includes("ROLE_ADMIN"));

    // Función que se ejecuta cuando se hace clic en el botón de eliminar
    const handleDelete = async (e) => {
        e.stopPropagation();

        // Este es un mensaje de confirmación que se muestra al usuario antes de eliminar el libro
        if (!window.confirm("¿Estás seguro de que quieres eliminar este libro?")) return; // devolverá true o false

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
            } else {
                const errorData = await response.json(); // Convertimos la respuesta a JSON
                alert(errorData.error || "Error al eliminar el libro"); // Mostramos el error
            }
        } catch (error) {
            // Si hay un error en la petición, lo mostramos
            console.error(error);
        }
    };

    // Función que se ejecuta cuando se hace clic en el botón de editar
    const handleEdit = (e) => {
        e.stopPropagation();

        // Llamar a una función de edición que definiremos en App (a través de props)
        if (props.onEdit) {
            props.onEdit(book); // Pasamos el libro que se está editando
        }
    }

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

                {/* Solo se muestran los botones de editar y eliminar si el usuario es el dueño del libro o es un administrador */}
                {isOwner && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
                        <button onClick={handleEdit}>
                            Editar
                        </button>
                        <button className="book-card-delete-button" onClick={handleDelete}>
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
}

export default BookCard;
