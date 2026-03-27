import BookCard from "./BookCard";

function BookList(props) {
    const { books, setSelectedBook, setBooks } = props;

    const bookCard = books.map((book, index) => {
        return (
            <BookCard
                key={index}
                book={book}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
            ></BookCard>
        );
    });

    return <main className="books-grid">{bookCard}</main>;
}

export default BookList;
