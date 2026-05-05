import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import BookImport from "./components/BookImport";
import Pagination from "./components/Pagination"; // Nuevo componente
import BookEdit from "./components/BookEdit";
import "./App.css";

function App() {
    const [books, setBooks] = useState([]);
    const [user, setUser] = useState(null); // Estado para el usuario logueado (por defecto es null porque al cargar al app, no hay nadie conectado)
    const [selectedBook, setSelectedBook] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [allYears, setAllYears] = useState([]);
    const [viewMode, setViewMode] = useState("all"); // "all" o "mine"
    const [editingBook, setEditingBook] = useState(null); // Libro que se está editando
    const [searchQuery, setSearchQuery] = useState(""); // Estado para el buscador (le indica a React que abra el formulario para editar los datos del libro)
    // guardamos el libro que se esta editando en el estado editingBook

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(12);
    const [currentFilter, setCurrentFilter] = useState({ type: 'all', value: null });

    useEffect(() => {
        if (viewMode === 'mine') return;

        if (currentFilter.type === 'all') {
            fetchAllBooks(currentPage);
        } else if (currentFilter.type === 'category') {
            fetchCategoryBooks(currentFilter.value, currentPage);
        } else if (currentFilter.type === 'year') {
            fetchFindYear(currentFilter.value, currentPage);
        } else if (currentFilter.type === 'search') {
            executeSearch(currentFilter.value, currentPage);
        }
    }, [currentPage, currentFilter, viewMode]);

    useEffect(() => {
        checkUserSession(); // Comprobamos si hay sesión al cargar
    }, []);

    const checkUserSession = async () => {
        try {
            const response = await fetch("/api/user/status"); // Hacemos una petición a la ruta /api/user/status para obtener la información del usuario
            if (response.ok) { // Si la respuesta es exitosa (código 200)
                const data = await response.json(); // Convertimos la respuesta a JSON
                setUser(data.user); // Guardamos el usuario en el estado 'user'
            }
        } catch (error) {
            // Si falla o no hay sesión, el usuario sigue siendo null
        }
    };

    useEffect(() => {
        fetchAllBooks(currentPage);
    }, [currentPage]);

    const fetchAllBooks = async (page = 1) => {
        try {
            const response = await fetch(`/books?page=${page}&limit=${limit}`);
            const data = await response.json();

            if (data.books && data.books.length === 0 && data.total_pages > 0 && page > data.total_pages) {
                setCurrentPage(data.total_pages);
                return;
            }
            
            setBooks(data.books || []);
            setTotalPages(data.total_pages || data.totalPages || 1);
            setViewMode("all");
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyBooks = async () => {
        try {
            const response = await fetch("/api/me/books");
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
                setTotalPages(1); // Desactiva paginator
                setViewMode("mine"); // mine = solo mis libros
            } else {
                alert("Debes iniciar sesión para ver tus libros");
            }
        } catch (error) {
            console.error("Error al obtener libros:", error);
        }
    };

    // Obtenemos una lista completa para las categorías y años (sin paginar para el menú)
    // Esto es necesario para que los filtros tengan todas las opciones disponibles
    const fetchFilters = async () => {
        try {
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

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFindYear = async (year, page = 1) => {
        try {
            const response = await fetch(`/book/year/${year}?page=${page}&limit=${limit}`);
            const data = await response.json();

            if (data.books && data.books.length === 0 && data.total_pages > 0 && page > data.total_pages) {
                setCurrentPage(data.total_pages);
                return;
            }

            setBooks(data.books || []);
            setTotalPages(data.total_pages || data.totalPages || 1);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategoryBooks = async (category, page = 1) => {
        try {
            const response = await fetch(`/book/category/${category}?page=${page}&limit=${limit}`);
            const data = await response.json();

            if (data.books && data.books.length === 0 && data.total_pages > 0 && page > data.total_pages) {
                setCurrentPage(data.total_pages);
                return;
            }

            setBooks(data.books || []);
            setTotalPages(data.total_pages || data.totalPages || 1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setCurrentPage(1);
        setViewMode("all");
        if (category === "all") {
            setCurrentFilter({ type: 'all', value: null });
        } else {
            setCurrentFilter({ type: 'category', value: category });
        }
    };

    const handleYearChange = (e) => {
        const yearSelected = e.target.value;
        setCurrentPage(1);
        setViewMode("all");
        if (yearSelected === "all") {
            setCurrentFilter({ type: 'all', value: null });
        } else {
            setCurrentFilter({ type: 'year', value: yearSelected });
        }
    };

    const executeSearch = async (query, page = 1) => {
        try {
            const response = await fetch(`/book/search/${query}?page=${page}&limit=${limit}`);
            if (response.ok) {
                const data = await response.json();

                if (data.books && data.books.length === 0 && data.total_pages > 0 && page > data.total_pages) {
                    setCurrentPage(data.total_pages);
                    return;
                }

                setBooks(data.books || []);
                setTotalPages(data.total_pages || data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            setCurrentPage(1);
            setViewMode("all");
            setCurrentFilter({ type: 'all', value: null });
            fetchAllBooks(1); // Carga de nuevo todo al borrar la búsqueda
            return;
        }

        setCurrentPage(1);
        setViewMode("all");
        setCurrentFilter({ type: 'search', value: query });
    };

    const resetFilters = () => {
        setSearchQuery("");
        setCurrentPage(1);
        setViewMode("all");
        setCurrentFilter({ type: 'all', value: null });
        fetchAllBooks(1);
    };

    const handleBookDeleted = () => {
        fetchFilters(); // Refrescamos categorías y años
        if (viewMode === "mine") {
            fetchMyBooks();
        } else {
            if (currentFilter.type === 'all') fetchAllBooks(currentPage);
            else if (currentFilter.type === 'category') fetchCategoryBooks(currentFilter.value, currentPage);
            else if (currentFilter.type === 'year') fetchFindYear(currentFilter.value, currentPage);
            else if (currentFilter.type === 'search') executeSearch(currentFilter.value, currentPage);
        }
    };

    const handleBookUpdated = (updatedBook) => {
        fetchFilters(); // Por si cambió la categoría o año
        
        // Actualizamos el header si es el libro que estamos viendo
        if (selectedBook && selectedBook.isbn === updatedBook.isbn) {
            setSelectedBook(updatedBook);
        }

        // Refrescamos la vista actual para aplicar filtros si cambiaron
        if (viewMode === "mine") {
            fetchMyBooks();
        } else {
            if (currentFilter.type === 'all') fetchAllBooks(currentPage);
            else if (currentFilter.type === 'category') fetchCategoryBooks(currentFilter.value, currentPage);
            else if (currentFilter.type === 'year') fetchFindYear(currentFilter.value, currentPage);
            else if (currentFilter.type === 'search') executeSearch(currentFilter.value, currentPage);
        }
    };

    const handleBookAdded = () => {
        fetchFilters();
        resetFilters(); // Al añadir, lo mejor es volver al catálogo general para ver el nuevo libro
    };

    return (
        <div className="app-container">
            <header className="app-top-bar">
                <h1>Catálogo de Libros</h1>
                {user ? (
                    <div className="user-info-section">
                        {user.photo && (
                            <img 
                                src={user.photo} 
                                alt="Profile" 
                                className="user-profile-avatar"
                            />
                        )}
                        <span>Hola, <strong>{user.email}</strong></span>
                        <a href={`${import.meta.env.VITE_BACKEND_URL}/logout`} className="logout-link">Cerrar sesión</a>
                    </div>
                ) : (
                    <a href={`${import.meta.env.VITE_BACKEND_URL}/login`} className="login-link">Iniciar sesión</a>
                )}
            </header>

            <BookHeader selectedBook={selectedBook} />


            <section className="toolbar">
                <input
                    type="text"
                    placeholder="Buscar por título o autor..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />

                <button onClick={resetFilters} className="filter-button secondary">
                    Todos los libros
                </button>

                <select 
                    onChange={handleCategoryChange} 
                    className="filter-select"
                    value={currentFilter.type === 'category' ? currentFilter.value : 'all'}
                >
                    <option value="all">Todas las categorías</option>
                    {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select 
                    onChange={handleYearChange} 
                    className="year-select"
                    value={currentFilter.type === 'year' ? currentFilter.value : 'all'}
                >
                    <option value="all">Todos los años</option>
                    {allYears.map((yearSelected) => (
                        <option key={yearSelected} value={yearSelected}>{yearSelected}</option>
                    ))}
                </select>

                {user && (
                    <div className="toolbar-user-actions">
                        <BookImport onImportSuccess={() => { setCurrentPage(1); fetchAllBooks(1); }} />
                        <button
                            onClick={viewMode === "all" ? fetchMyBooks : () => { setCurrentPage(1); fetchAllBooks(1); }}
                            className={`view-mode-button ${viewMode === "mine" ? "active" : "inactive"}`}
                        >
                            {viewMode === "all" ? "Mis Libros" : "Catálogo Global"}
                        </button>
                    </div>
                )}
            </section>

            {/* Los selectores ahora están dentro del toolbar de arriba */}

            {/* Formulario para agregar un nuevo libro - SOLO PARA LOGUEADOS */}
            {user && <BookAdd onBookAdded={handleBookAdded}></BookAdd>}
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
                user={user}
                onEdit={(book) => setEditingBook(book)}
                onBookDeleted={handleBookDeleted}
            ></BookList>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />

            {/* Modal de edición */}
            {editingBook && (
                <BookEdit
                    book={editingBook} // pasamos el libro que se está editando
                    onCancel={() => setEditingBook(null)} // cancelamos la edición y cerramos el modal

                    onUpdate={(updatedBook) => {
                        handleBookUpdated(updatedBook); // nueva función robusta
                        setEditingBook(null); // cerramos el modal
                    }}
                />
            )}
        </div>
    );
}

export default App;
