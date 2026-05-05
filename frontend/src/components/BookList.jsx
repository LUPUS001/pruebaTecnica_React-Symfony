import BookCard from "./BookCard";

function BookList(props) {
    const { books, setSelectedBook, setBooks, user, onEdit, onBookDeleted } = props;

    const bookCard = books.map((book, index) => {
        return (
            <BookCard
                key={index}
                book={book}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
                /*
                fetchFilters: Función que permite refrescar los filtros del menú lateral, después de eliminar o editar un libro.
                */
                fetchFilters={props.fetchFilters}
                user={user} // La información de quién esta logueado
                onEdit={onEdit} // La función que permite editar el libro, la que abre el modal/formulario de edición
                onBookDeleted={onBookDeleted} // Callback para cuando se borra un libro (actualiza el listado y los filtros)
            ></BookCard>
        );
    });

    return <main className="books-grid">{bookCard}</main>;
}

export default BookList;

// BookList sigue siendo el intermediario, el puente que le entrega a BookCard las herramientas que necesita