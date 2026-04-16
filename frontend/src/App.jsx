import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import "./App.css";

function App() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null); // lo ponemos como null porque es un objeto y no un array, y al ser null no muestra nada al principio y no da error al cargar la página 

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
        } catch (error) {
            console.error(error);
        }
    };

    // Usamos useEffect porque si no lo hacemos, no se actualizará la lista de categorías
    // y años cuando agreguemos un nuevo libro hasta que recarguemos la página.
    useEffect(() => {
        const categories = [];
        const years = [];

        // Recorremos todos los libros para obtener las categorías y años
        books.forEach((book) => {
            // Si el libro tiene una categoría y no está ya en nuestra lista 'categories', lo añadimos
            if (book.category && !categories.includes(book.category)) {
                categories.push(book.category);
            }
            // En el filtro if también ponemos book.category, porque sino podríamos añadir categorías vacías,

            if (book.published) {
                let year = book.published.split("-")[0];
                // split("-")[0] para obtener solo el año (2013) y no la fecha completa (2013-01-01)

                // Si el año no está ya en nuestra lista 'years', lo añadimos
                if (!years.includes(year)) {
                    years.push(year);
                }
            }
        });
        setAllCategories(categories.sort()); // sort() ordena alfabéticamente
        setAllYears(years.sort((a, b) => b - a)); // sort((a, b) => b - a) ordena numéricamente de mayor a menor
    }, [books]);

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
        <div className="app-container">
            <BookHeader selectedBook={selectedBook} />

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
