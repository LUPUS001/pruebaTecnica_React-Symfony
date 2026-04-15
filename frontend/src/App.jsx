import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import "./App.css";

function App() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState([]);

    // allCategories guarda la lista completa de categorías disponibles.
    // Lo separamos del estado 'books' para que, al filtrar libros, no perdamos las opciones del menú desplegable.
    const [allCategories, setAllCategories] = useState([]);

    const [allYears, setAllYears] = useState([]);

    useEffect(() => {
        fetchAllBooks();
    }, []);

    const fetchAllBooks = async () => {
        try {
            const response = await fetch("/books");
            const data = await response.json();
            setBooks(data);

            const categories = [];
            const years = [];

            // Recorremos todos los libros para obtener todas las categorías y años
            data.forEach((book) => {
                // Si la categoría no está ya en nuestra lista 'categories', la añadimos
                if (!categories.includes(book.category)) {
                    categories.push(book.category);
                }

                // split("-")[0] para obtener solo el año (2013) y no la fecha completa (2013-01-01)
                let year = book.published.split("-")[0];

                // Si el año no está ya en nuestra lista 'years', lo añadimos
                if (!years.includes(year)) {
                    years.push(year);
                }
            });
            setAllCategories(categories);
            setAllYears(years);
        } catch (error) {
            console.error(error);
        }
    };

    // Obtenemos los libros de un año concreto
    const fetchFindYear = async (year) => {
        try {
            const response = await fetch(`/book/year/${year}`);
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Recibimos la categoría que nos llega desde el botón handleFilterByCategory
    const fetchCategoryBooks = async (category) => {
        try {
            const response = await fetch(`/book/category/${category}`);
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Aquí será donde recibiremos la categoría que busca el usuario
    const handleFilterByCategory = () => {
        const category = prompt("Introduce la categoría");
        if (category) {
            fetchCategoryBooks(category);
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        if (category === "all") {
            fetchAllBooks();
        } else {
            fetchCategoryBooks(category);
        }
    };

    // Aquí será donde recibiremos el año que busca el usuario
    const handleFilterByYear = () => {
        const yearSelected = prompt("Introduce el año");
        if (yearSelected) {
            fetchFindYear(yearSelected);
        }
    };

    const handleYearChange = (e) => {
        const yearSelected = e.target.value;
        if (yearSelected === "all") {
            fetchAllBooks();
        } else {
            fetchFindYear(yearSelected);
        }
    };

    return (
        <div>
            <header className="app-header">
                {selectedBook.isbn ? (
                    <>
                        <div className="selected-book-image-container">
                            {selectedBook.images &&
                                selectedBook.images.length > 0 ? (
                                <img
                                    className="selected-book-image"
                                    src={selectedBook.images[0].ruta}
                                    alt={selectedBook.title}
                                />
                            ) : (
                                <div className="no-image-placeholder">
                                    Sin imagen
                                </div>
                            )}
                        </div>
                        <div>
                            <h2>{selectedBook.title}</h2>
                            <p>
                                <strong>Autor:</strong> {selectedBook.author}
                            </p>
                            <p>
                                <strong>ISBN:</strong>
                                {selectedBook.isbn}
                            </p>
                            <p>
                                <strong>Categoria:</strong>
                                {selectedBook.category}
                            </p>
                            <p>
                                <em>{selectedBook.description}</em>
                            </p>
                        </div>
                    </>
                ) : (
                    <p>Selecciona un libro</p>
                )}
            </header>

            <section>
                <h4>Filtrar catálogo:</h4>
                <button onClick={fetchAllBooks} className="filter-button">
                    Todos los libros
                </button>
                <button onClick={handleFilterByYear} className="filter-button">
                    Filtrar por año
                </button>
                <button
                    onClick={handleFilterByCategory}
                    className="filter-button"
                >
                    Filtrar por categoría
                </button>
            </section>

            {/* Menú de Categorías */}
            <select onChange={handleCategoryChange} className="filter-select">
                <option value="all">Todas las categorías</option>

                {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Menú de Años */}
            <select onChange={handleYearChange} className="year-select">
                <option value="all">Todos los años</option>
                {allYears.map((yearSelected) => (
                    <option key={yearSelected} value={yearSelected}>
                        {yearSelected}
                    </option>
                ))}
            </select>

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
