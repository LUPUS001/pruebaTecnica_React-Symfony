import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import BookImport from "./components/BookImport";
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

    useEffect(() => {
        fetchAllBooks();
        checkUserSession(); // Comprobamos si hay sesión al cargar (si el usuario estaba logueado, se mantendrá logueado)
    }, []); // [] significa que se ejecutará solo una vez, al cargar la página

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


    // Función que obtiene todos los libros de la base de datos
    const fetchAllBooks = async () => {
        try {
            const response = await fetch("/books");
            const data = await response.json();
            setBooks(data);
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
                setViewMode("mine"); // mine = solo mis libros
            } else {
                alert("Debes iniciar sesión para ver tus libros");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Usamos useEffect porque si no lo hacemos, no se actualizará la lista de categorías
    // y años cuando agreguemos un nuevo libro hasta que recarguemos la página.
    useEffect(() => {
        const categories = []; // Array para guardar las categorías
        const years = []; // Array para guardar los años

        // Recorremos todos los libros para obtener las categorías y años
        books.forEach((book) => {
            // Si el libro tiene una categoría y no está ya en nuestra lista 'categories', lo añadimos
            if (book.category && !categories.includes(book.category)) {
                categories.push(book.category);
            }
            // En el filtro if también ponemos book.category, porque sino podríamos añadir categorías vacías,

            // Si el libro tiene una fecha de publicación y no está ya en nuestra lista 'years', lo añadimos
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

    }, [books]); // Se ejecuta cada vez que 'books' cambia 

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
    // async es una palabra clave que se usa para declarar una función asíncrona. Indicamos que la función fetchFindYear no se ejecutará al momento de ser llamada, sino que se ejecutará de forma asíncrona.
    // await es una palabra clave que se usa para esperar a que una promesa se resuelva. Para que la página no se quede en blanco mientras espera a que el servidor responda.


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
        const category = prompt("Introduce la categoría"); // prompt() es una función que muestra un cuadro de diálogo que pide al usuario que introduzca un valor.

        if (category) { // Si el usuario introduce un valor, lo guardamos en la variable category
            fetchCategoryBooks(category); // Llamamos a la función fetchCategoryBooks con el valor de category
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value; // e.target.value es el valor que se selecciona en el menú desplegable (por ejemplo, "Fantasía", "Ciencia Ficción", etc.)

        if (category === "all") { // Si el usuario selecciona "all", llamamos a la función fetchAllBooks para que muestre todos los libros
            fetchAllBooks();
        } else { // Si el usuario no selecciona "all", llamamos a la función fetchCategoryBooks con el valor de category ("Fantasía", etc.)
            fetchCategoryBooks(category); // y nos devuelve los libros de esa categoría
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

                <button onClick={fetchAllBooks} className="filter-button secondary">
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
                        <BookImport onImportSuccess={viewMode === "all" ? fetchAllBooks : fetchMyBooks} />
                        <button
                            onClick={viewMode === "all" ? fetchMyBooks : fetchAllBooks}
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
            {user && <BookAdd setBooks={viewMode === "all" ? setBooks : fetchMyBooks}></BookAdd>}
            <hr />
            <br />

            {/* Lista de libros */}
            <BookList
                books={books}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
                user={user} // pasamos el usuario a BookList para que le muestre los botones de editar y borrar si es el dueño o admin
                onEdit={(book) => setEditingBook(book)} // pasamos la función onEdit a BookList para que pueda editar los libros
            ></BookList>

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
