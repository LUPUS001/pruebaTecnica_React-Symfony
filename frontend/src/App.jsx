import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import BookImport from "./components/BookImport";
import BookEdit from "./components/BookEdit";
import "./App.css";
import Pagination from "./components/Pagination";


function App() {
    const [books, setBooks] = useState([]);
    const [user, setUser] = useState(null); // Estado para el usuario logueado (por defecto es null porque al cargar al app, no hay nadie conectado)
    const [selectedBook, setSelectedBook] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [allYears, setAllYears] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all"); // Estado para la categoría seleccionada
    const [selectedYear, setSelectedYear] = useState("all"); // Estado para el año seleccionado
    const [viewMode, setViewMode] = useState("all"); // "all" o "mine"
    const [editingBook, setEditingBook] = useState(null); // Libro que se está editando
    const [searchQuery, setSearchQuery] = useState(""); // Estado para el buscador (le indica a React que abra el formulario para editar los datos del libro)
    // guardamos el libro que se esta editando en el estado editingBook

    //Estados para la paginación 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(12); // 12 = número de libros por página

    useEffect(() => {
        fetchAllBooks(currentPage); // Carga la primera página de libros al cargar la app
        checkUserSession(); // Comprobamos si hay sesión al cargar (si el usuario estaba logueado, se mantendrá logueado)
    }, [currentPage]); // [] significa que se ejecutará solo una vez, al cargar la página

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
    const fetchAllBooks = async (page = 1) => { // page = 1 es el valor por defecto (la primera página) si no se le pasa un valor
        try {
            const response = await fetch(`/books?page=${page}&limit=${limit}`); // Petición al servidor enviando la página solicitada y el límite de libros por página
            const data = await response.json(); // Convertimos la respuesta a JSON

            // Si el usuario borra el último libro de una página, el servidor nos dirá que esa página está vacía
            // pero que existen páginas anteriores. En ese caso, bajamos automáticamente a la última página con contenido.
            if (data.books && data.books.length === 0 && data.total_pages > 0 && page > data.total_pages) {
                setCurrentPage(data.total_pages);
                return; // El useEffect detectará el cambio de currentPage y volverá a llamar a fetchAllBooks
            }

            // La API ahora devuelve un objeto { books, total_pages, ... }
            setBooks(data.books || []); // books = array de libros
            setTotalPages(data.total_pages || 1); // total_pages = número total de páginas
            setViewMode("all"); // all = todos los libros
            
            // Reseteamos visualmente los filtros para que coincidan con la vista de todos los libros
            setSelectedCategory("all");
            setSelectedYear("all");
            setSearchQuery("");
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
                setTotalPages(1); // 1 = solo una página de libros
                setViewMode("mine"); // mine = solo mis libros
            } else {
                alert("Debes iniciar sesión para ver tus libros");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // (＊1) Función para obtener una lista completa de categorías y años (se llama al inicio y tras modificaciones)
    const fetchFilters = async () => {
        try {
            // Pedimos un límite alto para tener todos los libros y extraer sus categorías/años
            const response = await fetch("/books?limit=1000"); // 1000 = límite de libros (es poco probable tener más de 1000 libros en el caso de nuestra app)
            const result = await response.json(); // Convertimos la respuesta a JSON
            const allBooks = result.books || []; // books = array de libros

            const categories = []; // Array para guardar las categorías
            const years = []; // Array para guardar los años

            // Recorremos todos los libros para obtener las categorías y años
            allBooks.forEach((book) => {
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
            setAllYears(years.sort((a, b) => b - a)); // sort() ordena numéricamente de mayor a menor
        } catch (error) {
            console.error("Error al cargar filtros:", error);
        }
    };

    // Obtenemos una lista completa de categorías y años al inicio
    useEffect(() => {
        fetchFilters();
    }, []); // [] para que se ejecute solo una vez al cargar la app

    // Obtenemos los libros de un año concreto
    const fetchFindYear = async (year) => {
        try {
            const response = await fetch(`/book/year/${year}`);
            const data = await response.json();
            setBooks(data);
            setTotalPages(1); // 1 = solo una página de libros
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
            setTotalPages(1); // 1 = solo una página de libros
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
        
        setSelectedCategory(category); // Actualizamos visualmente el menú desplegable de categoría
        setSelectedYear("all"); // Reseteamos el menú del año para evitar cruces
        setSearchQuery(""); // Reseteamos la búsqueda

        if (category === "all") { // Si el usuario selecciona "all", llamamos a la función fetchAllBooks para que muestre todos los libros
            // Al cambiar de filtro, siempre reseteamos a la página 1 para evitar quedarnos en una página 
            // inexistente (ej: si estábamos en la pág 10 y el nuevo filtro solo tiene 1 página).
            setCurrentPage(1); // volvemos a la primera página visualmente
            fetchAllBooks(1); // pedimos al servidor los libros de la primera página
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
        
        setSelectedYear(yearSelected); // Actualizamos visualmente el menú desplegable del año
        setSelectedCategory("all"); // Reseteamos el menú de categorías para evitar cruces
        setSearchQuery(""); // Reseteamos la búsqueda

        if (yearSelected === "all") {
            // Reseteamos a la página 1 por seguridad para asegurar que siempre haya resultados visibles
            setCurrentPage(1); // Volvemos a la primera página
            fetchAllBooks(1); // Obtenemos todos los libros de la primera página
        } else {
            fetchFindYear(yearSelected);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // Reseteamos los menús desplegables visualmente al buscar texto
        setSelectedCategory("all");
        setSelectedYear("all");

        // Si el buscador se queda vacío (o solo tiene espacios), reseteamos la vista al catálogo completo
        if (query.trim() === "") {
            setCurrentPage(1); // Reseteamos a la página 1
            fetchAllBooks(1); // Volvemos a cargar el catálogo completo desde el principio
            return; // Salimos de la función para evitar hacer una petición de búsqueda vacía al servidor
        }

        try {
            const response = await fetch(`/book/search/${query}`);
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
                setTotalPages(1); // 1 = Escondemos la paginación al buscar un libro específico (solo queremos que se vean los resultados de la búsqueda)
                // esconderemos la paginación gracias a lo que hemos configurado en Pagination.jsx (if (totalPages <= 1) return null; // No mostramos nada si solo hay una página)
                setViewMode("all");
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    };

    // Función que se dispara cuando un libro es eliminado con éxito
    const handleBookDeleted = () => {
        // Refrescamos la vista actual para que la paginación y el listado sean correctos
        if (viewMode === "all") {
            fetchAllBooks(currentPage);
        } else {
            fetchMyBooks();
        }
        // Actualizamos los filtros por si hemos borrado el último libro de una categoría
        fetchFilters();
    };

    return (
        <div className="app-container">
            <header className="app-top-bar">
                <h1>Catálogo de Libros</h1>
                {user ? ( // Si el usuario está logueado, mostramos su email y un botón para cerrar sesión
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
                        {/* 
                            import.meta.env. contiene información sobre las variables definidas en frontend/.env.
                            VITE_BACKEND_URL es una variable de entorno que contiene la URL del backend. (http://localhost:8000)
                            {`${import.meta.env.VITE_BACKEND_URL}/logout`} == "http://localhost:8000/logout"
                        */}
                    </div>
                ) : ( // Si el usuario no está logueado, mostramos un enlace para iniciar sesión
                    <a href={`${import.meta.env.VITE_BACKEND_URL}/login`} className="login-link">Iniciar sesión</a>
                )}

            </header>


            {/* Si selectedBook es null, mostramos la lista de libros. Si no, mostramos el header con la información del libro seleccionado */}
            {/* Usamos selectedBook como condicion para mostrar el header o la lista de libros */}
            {/* onBack es una prop que le pasamos a BookHeader para que pueda volver a la lista de libros */}
            {/* 
            selectedBook = null
            -> Muestra la lista de libros
            
            selectedBook = {libro}
            -> Muestra el header con la información del libro seleccionado
            */}

            <BookHeader selectedBook={selectedBook} onBack={() => setSelectedBook(null)} />


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

                <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select">
                    <option value="all">Todas las categorías</option>
                    {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select value={selectedYear} onChange={handleYearChange} className="year-select">
                    <option value="all">Todos los años</option>
                    {allYears.map((yearSelected) => (
                        <option key={yearSelected} value={yearSelected}>{yearSelected}</option>
                    ))}
                </select>

                {user && (
                    <div className="toolbar-user-actions">
                        {/* Importamos la funcionalidad para importar libros desde un archivo JSON */}
                        <BookImport onImportSuccess={() => {
                            if (viewMode === "all") fetchAllBooks(currentPage); // Si estamos en "all", recargamos todos los libros 
                            // currentPage = para que el usuario se quede en la página en la que estaba, pero con los nuevos libros importados

                            else fetchMyBooks(); // Si estamos en "mine", recargamos solo los libros del usuario
                            fetchFilters(); // Recargamos categorías/años por si se importan nuevas
                        }} />
                        <button
                            onClick={() => {
                                if (viewMode === "all") {
                                    fetchMyBooks();
                                } else {
                                    setCurrentPage(1);
                                    fetchAllBooks(1);
                                }
                            }}
                            className={`view-mode-button ${viewMode === "mine" ? "active" : "inactive"}`}
                        >
                            {viewMode === "all" ? "Mis Libros" : "Catálogo Global"}
                        </button>
                    </div>
                )}
            </section>

            {/* Los selectores ahora están dentro del toolbar de arriba */}

            {/* Formulario para agregar un nuevo libro - SOLO PARA LOGUEADOS */}
            {user && <BookAdd onBookAdded={() => { // (*2) el libro que acabamos de crear se recargará desde el servidor
                // Al añadir un libro, recargamos la primera página para que aparezca arriba del todo
                if (viewMode === "all") {
                    setCurrentPage(1);
                    fetchAllBooks(1);
                } else {
                    // Si estamos en "Mis Libros", recargamos la lista desde el servidor
                    fetchMyBooks();
                }
                // Siempre recargamos los filtros por si hemos creado una categoría nueva
                fetchFilters();
            }}></BookAdd>}
            <hr />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <br />

            {/* Lista de libros */}
            <BookList
                books={books}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
                fetchFilters={fetchFilters} // Pasamos la función para recargar filtros tras eliminar
                user={user} // pasamos el usuario a BookList para que le muestre los botones de editar y borrar si es el dueño o admin
                onEdit={(book) => setEditingBook(book)} // pasamos la función onEdit a BookList para que pueda editar los libros
                onBookDeleted={handleBookDeleted} // Notificación de que un libro ha sido borrado
            ></BookList>

            {/* Modal de edición */}
            {editingBook && (
                <BookEdit
                    book={editingBook} // pasamos el libro que se está editando
                    onCancel={() => setEditingBook(null)} // cancelamos la edición y cerramos el modal

                    onUpdate={(updatedBook) => {
                        setBooks(prev => prev.map(b => b.isbn === updatedBook.isbn ? updatedBook : b)); // actualizamos el libro antiguo por el nuevo
                        setEditingBook(null); // cerramos el modal
                        fetchFilters(); // Recargamos filtros tras editar
                    }}
                />
            )}
        </div>
    );
}

export default App;

/* 
(＊1)
   ¿Por qué sacamos esta lógica de filtros fuera del useEffect?
       
   El problema: Si la lógica de extraer categorías y años está encerrada dentro de un useEffect con 
   corchetes vacíos [], solo se ejecuta una vez al cargar la página. Si el usuario añade un libro 
   con una categoría nueva (ej: "Misterio"), el menú desplegable no se actualizaría hasta que 
   el usuario pulsara F5, ya que no podíamos obligar al useEffect a ejecutarse de nuevo.

   La Solución (REUTILIZACIÓN): Al sacar la lógica a esta función independiente (fetchFilters):
   1. La llamamos al inicio dentro del useEffect para la carga inicial.
   2. La podemos "disparar" manualmente desde cualquier otra parte (como al añadir o borrar un libro).
       
   De este modo, la app es capaz de "pulsar el botón" de refrescar filtros por sí sola tras cada 
   modificación, manteniendo el menú siempre actualizado en tiempo real.

*/

/*

(＊2) newBook es el libro que acabamos de crear
    
    setBooks((prevBooks) => [...prevBooks, newBook]);
    
    - prevBooks: es el array de libros que teníamos hasta el momento.
    - [ ...prevBooks ]: spread operator, que se utiliza para copiar todos los elementos del array.
    - newBook: es el nuevo libro que queremos añadir.
    - [...prevBooks, newBook]: crea un nuevo array con todos los libros anteriores y el nuevo libro.
    
    La línea significa que estamos creando un nuevo array con todos los libros anteriores y el nuevo libro.
  
   
Este bloque es el "cerebro" de lo que ocurre justo después de que rellenas el formulario y guardas un libro nuevo. Es la función que coordina la actualización de la pantalla:

1.  user &&: Es una condición de seguridad. Solo mostramos el componente `BookAdd` (el formulario) si el usuario ha iniciado sesión.

2.  onBookAdded={(newBook) => { ... } }: Es la función que le pasamos al "hijo" (`BookAdd`). Cuando el hijo termina de guardar el libro 
    en la base de datos, nos devuelve el objeto `newBook` y nosotros decidimos qué hacer con él.

3.  if (viewMode === "all") Si el usuario está viendo el **Catálogo Global**, usamos `setBooks` para añadir el nuevo libro directamente al array que ya tenemos en memoria. 
    Esto hace que el libro aparezca en la lista al instante, sin tener que esperar a que el servidor vuelva a mandarnos toda la lista (es lo que llamamos una actualización "optimista").

4.  else { fetchMyBooks(); }: Si el usuario está en la sección de **"Mis Libros"**, en lugar de añadirlo a mano, llamamos a la función que descarga sus libros desde el servidor. 
    Esto garantiza que su lista personal esté perfectamente sincronizada.

5.  fetchFilters(); Al igual que con la importación, añadir un solo libro puede introducir una **categoría nueva** o un **año nuevo**. 
    Esta línea "pulsa el botón" de refrescar los menús desplegables para que el usuario pueda filtrar por esa nueva categoría de inmediato.

*/