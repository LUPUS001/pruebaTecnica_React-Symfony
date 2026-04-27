import BookCard from "./BookCard";

function BookList(props) {
    const { books, setSelectedBook, setBooks, user, onEdit } = props;

    const bookCard = books.map((book, index) => {
        return (
            <BookCard
                key={index}
                book={book}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
                user={user} // La información de quién esta logueado
                onEdit={onEdit} // La función que permite editar el libro, la que abre el modal/formulario de edición
            ></BookCard>
        );
    });

    return <main className="books-grid">{bookCard}</main>;
}

export default BookList;

// BookList sigue siendo el intermediario, el puente que le entrega a BookCard las herramientas que necesita