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

    useEffect(() => {
        fetchAllBooks(currentPage);
        checkUserSession(); // Comprobamos si hay sesión al cargar (si el usuario estaba logueado, se mantendrá logueado)
    }, [currentPage]); // [] significa que se ejecutará solo una vez, al cargar la página, mas currentPage

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
            const result = await response.json();
            
            // La API ahora devuelve un objeto { books, total, page, totalPages }
            setBooks(result.books || []);
            setTotalPages(result.totalPages || 1);
            setViewMode("all"); // all = todos los libros
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

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            fetchAllBooks();
            return;
        }

        try {
            const response = await fetch(`/book/search/${query}`);
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
                setViewMode("all");
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    };

    return (
        <div className="app-container">
            <header style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #ddd', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <h1>Catálogo de Libros</h1>
                {user ? ( // Si el usuario está logueado, mostramos su email y un botón para cerrar sesión
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.photo && (
                            <img 
                                src={user.photo} 
                                alt="Profile" 
                                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }} 
                            />
                        )}
                        <span>Hola, <strong>{user.email}</strong></span>
                        <a href={`${import.meta.env.VITE_BACKEND_URL}/logout`} style={{ marginLeft: '15px', color: 'red', textDecoration: 'none', fontWeight: 'bold' }}>Cerrar sesión</a>
                    </div>
                ) : ( // Si el usuario no está logueado, mostramos un enlace para iniciar sesión
                    <a href={`${import.meta.env.VITE_BACKEND_URL}/login`}>Iniciar sesión</a>
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

                <button onClick={() => { setCurrentPage(1); fetchAllBooks(1); }} className="filter-button secondary">
                    Todos los libros
                </button>

                <select onChange={handleCategoryChange} className="filter-select">
                    <option value="all">Todas las categorías</option>
                    {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select onChange={handleYearChange} className="year-select">
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
                            className="view-mode-button"
                            style={{ backgroundColor: viewMode === "mine" ? "#3498db" : "#6c757d" }}
                        >
                            {viewMode === "all" ? "Mis Libros" : "Catálogo Global"}
                        </button>
                    </div>
                )}
            </section>

            {/* Los selectores ahora están dentro del toolbar de arriba */}

            {/* Formulario para agregar un nuevo libro - SOLO PARA LOGUEADOS */}
            {user && <BookAdd setBooks={(newBook) => {
                if (currentPage === 1) fetchAllBooks(1);
                else setCurrentPage(1);
            }}></BookAdd>}
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
                user={user} // pasamos el usuario a BookList para que le muestre los botones de editar y borrar si es el dueño o admin
                onEdit={(book) => setEditingBook(book)} // pasamos la función onEdit a BookList para que pueda editar los libros
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
                        setBooks(prev => prev.map(b => b.isbn === updatedBook.isbn ? updatedBook : b)); // actualizamos el libro antiguo por el nuevo
                        setEditingBook(null); // cerramos el modal
                    }}
                />
            )}
        </div>
    );
}

export default App;
