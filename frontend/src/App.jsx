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

    useEffect(() => {
        fetchAllBooks();
    }, []);

    const fetchAllBooks = async () => {
        try {
            const response = await fetch("/books");
            const data = await response.json();
            setBooks(data);

            const categories = [];
            data.forEach(book => {
                // Si la categoría no está ya en nuestra lista 'categories', la añadimos
                if (!categories.includes(book.category)) {
                    categories.push(book.category);
                }
            });
            setAllCategories(categories);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBooksAntes2013 = async () => {
        try {
            const response = await fetch("/book/before2013");
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
        const category = prompt('Introduce la categoría')
        if (category) {
            fetchCategoryBooks(category);
        }
    }

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        if (category === "all") {
            fetchAllBooks();
        } else if (category === "before2013") {
            fetchBooksAntes2013();
        } else {
            fetchCategoryBooks(category);
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
                <button onClick={fetchBooksAntes2013} className="filter-button">
                    Antes de 2013
                </button>
                <button onClick={handleFilterByCategory} className="filter-button">
                    Filtrar por categoría
                </button>
            </section>

            {/* Por si se quiere usar un select en vez de botones */}

            <select onChange={handleCategoryChange} className="filter-select">
                <option value="all">Todos los libros</option>
                <option value="before2013">Antes de 2013</option>

                {/* Mapeamos 'allCategories' en lugar de 'books' para que todas las categorías 
                    sigan apareciendo en el menú aunque hayamos filtrado el catálogo */}
                {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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
