import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import "./App.css";

function App() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState([]);

    const fetchAllBooks = async () => {
        try {
            const response = await fetch("/books");
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBooksAntes2013 = async () => {
        try {
            const response = await fetch("/book/antes2013");
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDramaBooks = async () => {
        try {
            const response = await fetch("/book/drama");
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAllBooks();
    }, []);

    return (
        <div>
            <header className="app-header">
                {selectedBook.isbn ? (
                    <>
                        {selectedBook.images &&
                        selectedBook.images.length > 0 ? (
                            <img
                                className="selected-book-img"
                                src={selectedBook.images[0].ruta}
                                alt={selectedBook.title}
                            />
                        ) : (
                            <div className="selected-no-book-img">
                                Sin imagen
                            </div>
                        )}
                        <div>
                            <h2>{selectedBook.title}</h2>
                            <p>
                                <strong>Autor:</strong> {selectedBook.author}
                            </p>
                            <p>
                                <strong>ISBN:</strong> {selectedBook.isbn}
                            </p>
                        </div>
                    </>
                ) : (
                    <p>Selecciona un libro del catálogo</p>
                )}
            </header>

            <section>
                <h4>Filtrar catálogo:</h4>
                <button onClick={fetchAllBooks}>Todos los libros</button>
                <button onClick={fetchBooksAntes2013}>Antes de 2013</button>
                <button onClick={fetchDramaBooks}>Drama</button>
            </section>

            <BookAdd setBooks={setBooks}></BookAdd>
            <hr />
            <br />

            <BookList
                books={books}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
            ></BookList>
        </div>
    );
}

export default App;
