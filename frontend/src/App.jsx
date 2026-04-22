import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import BookImport from "./components/BookImport";
import Pagination from "./components/Pagination"; // Nuevo componente
import "./App.css";

function App() {
    const [books, setBooks] = useState([]); 
    const [selectedBook, setSelectedBook] = useState(null); 
    const [allCategories, setAllCategories] = useState([]);
    const [allYears, setAllYears] = useState([]);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(12);

    useEffect(() => {
        fetchAllBooks(currentPage);
    }, [currentPage]);

    const fetchAllBooks = async (page = 1) => {
        try {
            const response = await fetch(`/books?page=${page}&limit=${limit}`);
            const result = await response.json();
            
            // La API ahora devuelve un objeto { books, total, page, totalPages }
            setBooks(result.books || []);
            setTotalPages(result.totalPages || 1);
        } catch (error) {
            console.error("Error al obtener libros:", error);
        }
    };

    // Obtenemos una lista completa para las categorías y años (sin paginar para el menú)
    // Esto es necesario para que los filtros tengan todas las opciones disponibles
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                // Hacemos una petición con un límite muy alto para obtener todos los libros solo para filtrar
                const response = await fetch("/books?limit=1000");
                const result = await response.json();
                const allBooks = result.books || [];

                const categories = [];
                const years = [];

                allBooks.forEach((book) => {
                    if (book.category && !categories.includes(book.category)) {
                        categories.push(book.category);
                    }
                    if (book.published) {
                        let year = book.published.split("-")[0];
                        if (!years.includes(year)) {
                            years.push(year);
                        }
                    }
                });
                setAllCategories(categories.sort());
                setAllYears(years.sort((a, b) => b - a));
            } catch (error) {
                console.error("Error al cargar filtros:", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchFindYear = async (year) => {
        try {
            const response = await fetch(`/book/year/${year}`);
            const data = await response.json();
            setBooks(data);
            setTotalPages(1); // Desactivamos paginación al filtrar por año/categoría (por ahora)
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategoryBooks = async (category) => {
        try {
            const response = await fetch(`/book/category/${category}`);
            const data = await response.json();
            setBooks(data);
            setTotalPages(1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        if (category === "all") {
            setCurrentPage(1);
            fetchAllBooks(1);
        } else {
            fetchCategoryBooks(category);
        }
    };

    const handleYearChange = (e) => {
        const yearSelected = e.target.value;
        if (yearSelected === "all") {
            setCurrentPage(1);
            fetchAllBooks(1);
        } else {
            fetchFindYear(yearSelected);
        }
    };

    return (
        <div className="app-container">
            <BookHeader selectedBook={selectedBook} />

            <section className="filters-section">
                <h4>Filtrar catálogo:</h4>
                <div className="filters-controls">
                    <button onClick={() => { setCurrentPage(1); fetchAllBooks(1); }} className="filter-button">
                        Todos los libros
                    </button>
                    
                    <BookImport onImportSuccess={() => { setCurrentPage(1); fetchAllBooks(1); }} />

                    <select onChange={handleCategoryChange} className="filter-select">
                        <option value="all">Todas las categorías</option>
                        {allCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select onChange={handleYearChange} className="year-select">
                        <option value="all">Todos los años</option>
                        {allYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </section>

            <BookAdd setBooks={(newBook) => {
                // Al añadir un libro, refrescamos la primera página para verlo (si está ordenado por ID desc)
                if (currentPage === 1) fetchAllBooks(1);
                else setCurrentPage(1);
            }}></BookAdd>
            
            <hr />
            
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />

            <BookList
                books={books}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
            ></BookList>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />
        </div>
    );
}

export default App;
