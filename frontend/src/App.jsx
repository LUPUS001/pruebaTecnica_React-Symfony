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
    const [viewMode, setViewMode] = useState("all"); // "all" o "mine"
    const [editingBook, setEditingBook] = useState(null); // Libro que se está editando
    const [searchQuery, setSearchQuery] = useState(""); // Estado para el buscador (le indica a React que abra el formulario para editar los datos del libro)
    // guardamos el libro que se esta editando en el estado editingBook

    //Estados para la paginación 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(12); // 12 = número de libros por página
    const [currentFilter, setCurrentFilter] = useState({ type: 'all', value: null });
    // en lugar de usar peticiones HTTP para filtrar los libros, actualizamos el estado
    // de esta manera, si hay un cambio en los datos, React lo detecta y actualiza la interfaz

    useEffect(() => {
        checkUserSession(); // Comprobamos si hay sesión al cargar
    }, []);

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
    // ^ LISTA DE DEPENDENCIAS: Este array es vital. Le dice a React que si cualquiera de estos 
    // valores cambia (página, filtro o modo de vista), debe volver a ejecutar este bloque para traer los datos correctos.

    const checkUserSession = async () => {
        try {
            const response = await fetch("/api/user/status"); // Hacemos una petición a la ruta /api/user/status para obtener la información del usuario
            if (response.ok) { // Si la respuesta es exitosa (código 200)
                const data = await response.json(); // Convertimos la respuesta a JSON
                setUser(data.user); // Guardamos el usuario en el estado 'user'
            }
        } catch (error) {
            console.error("Error comprobando sesión:", error);
        }
    };


    // Función que obtiene todos los libros de la base de datos 
    const fetchAllBooks = async (page = 1) => { // page = 1 es el valor por defecto (la primera página) si no se le pasa un valor
        try {
            const response = await fetch(`/books?page=${page}&limit=${limit}`); // Petición al servidor enviando la página solicitada y el límite de libros por página
            const data = await response.json(); // Convertimos la respuesta a JSON

            // La API ahora devuelve un objeto { books, total_pages, ... }
            setBooks(data.books || []); // books = array de libros
            setTotalPages(data.total_pages || 1);
            // Usamos || 1 como "valor de seguridad". Si el servidor devuelve 0 páginas (porque no hay libros), 
            // forzamos a que sea 1 para que el componente de paginación no dé error al renderizar.
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
                setTotalPages(1); // 1 = solo una página de libros
                setViewMode("mine"); // mine = solo mis libros
            } else {
                alert("Debes iniciar sesión para ver tus libros");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // (＊1) Función profesional para obtener categorías y años directamente desde la API (sin cargar libros)
    const fetchFilters = async () => {
        try {
            // Llamamos al nuevo endpoint profesional que devuelve solo los datos únicos
            const response = await fetch("/books/filters");
            const data = await response.json();

            // Actualizamos los estados con la información limpia recibida del servidor
            setAllCategories(data.categories || []);
            setAllYears(data.years || []);
        } catch (error) {
            console.error("Error al cargar los filtros:", error);
        }
    };

    // Obtenemos una lista completa de categorías y años al inicio
    useEffect(() => {
        fetchFilters();
    }, []); // [] para que se ejecute solo una vez al cargar la app

    // Obtenemos los libros de un año concreto
    const fetchFindYear = async (year, page = 1) => { // page = número de página (por defecto 1)
        try {
            const response = await fetch(`/book/year/${year}?page=${page}&limit=${limit}`); // Hacemos una petición a la ruta /book/year/{year} para obtener los libros del año seleccionado y el límite de libros por página
            const data = await response.json(); // Convertimos la respuesta a JSON
            setBooks(data.books || []); // books = array de libros
            setTotalPages(data.total_pages || 1); // mostramos solo la primera página si no hay libros (al mostrar al menos 1 página la app no se rompera si total_pages = 0)
        } catch (error) {
            console.error(error);
        }
    };
    // async es una palabra clave que se usa para declarar una función asíncrona. Indicamos que la función fetchFindYear no se ejecutará al momento de ser llamada, sino que se ejecutará de forma asíncrona.
    // await es una palabra clave que se usa para esperar a que una promesa se resuelva. Para que la página no se quede en blanco mientras espera a que el servidor responda.


    // Función para obtener los libros filtrados por una categoría específica
    const fetchCategoryBooks = async (category, page = 1) => {
        try {
            const response = await fetch(`/book/category/${category}?page=${page}&limit=${limit}`);
            const data = await response.json();
            setBooks(data.books || []);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error(error);
        }
    };

    // Función que ejecuta la búsqueda de un libro por título o autor 
    const executeSearch = async (query, page = 1) => {
        try {
            const response = await fetch(`/book/search/${query}?page=${page}&limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                setBooks(data.books || []);
                setTotalPages(data.total_pages || 1);
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setCurrentPage(1); // Reseteamos la página a la primera
        // Si estabas en la página 5 de "Ficción" y cambias a "Terror", no puedes seguir en la página 5 porque quizás "Terror" solo tiene 2 páginas. 
        // Siempre reiniciamos al principio al cambiar el filtro.
        setViewMode("all"); // all = todos los libros  |  Nos asegura que el usuario vea el catálogo global y no se quede atrapado en la vista de "Mis Libros".
        if (category === "all") { // Si la categoría es "all", mostramos todos los libros 
            setCurrentFilter({ type: 'all', value: null }); // type = tipo de filtro, value = valor del filtro  | Resetear el filtro a "null" significa que le 
            //                                                                                                                                                                                                        // estamos diciendo a la aplicación: "Quiero ver todo, sin filtros".
        } else { // Si la categoría es diferente de "all", mostramos los libros de la categoría seleccionada
            setCurrentFilter({ type: 'category', value: category }); // type = tipo de filtro, value = valor del filtro  
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


    // Maneja la búsqueda de un libro por título o autor 
    const handleSearch = (e) => {
        // ya no usa async ni await para obtener los libros (antes los obtenía desde el backend con fetch), 
        // sino que los obtiene directamente desde el backend con executeSearch a través del useEffect.
        // Nota: En apps reales aquí se usaría "Debouncing" para no saturar el servidor con cada letra escrita.
        const query = e.target.value; // query = lo que escribe el usuario en el buscador
        setSearchQuery(query); // setSearchQuery = actualiza el estado searchQuery con lo que escribe el usuario en el buscador

        if (query.trim() === "") { // trim() elimina los espacios en blanco del principio y del final 
            setCurrentPage(1);
            setViewMode("all");
            setCurrentFilter({ type: 'all', value: null });
            return;
        }

        setCurrentPage(1);
        setViewMode("all");
        setCurrentFilter({ type: 'search', value: query }); // search = búsqueda por título o autor, query = lo que escribe el usuario en el buscador 
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

                <button
                    onClick={() => {
                        // Al pulsar "Todos los libros", debemos "resetear el cerebro" de la aplicación.
                        // Si no limpiamos currentFilter, la paginación seguiría recordando el filtro anterior (ej: "Dark fantasy").
                        setCurrentPage(1); // Volvemos a la página 1
                        setViewMode("all"); // Nos aseguramos de estar en el catálogo global
                        setCurrentFilter({ type: 'all', value: null }); // Le decimos al cerebro: "Quiero verlo todo"
                        setSearchQuery(""); // Limpiamos también el buscador si hubiera algo escrito
                    }}
                    className="filter-button secondary"
                >
                    Todos los libros
                </button>

                <select
                    onChange={handleCategoryChange}
                    className="filter-select"
                    /* COMPONENTE CONTROLADO:
                       Enlazamos visualmente este desplegable a lo que dicte el "cerebro" (currentFilter).
                       Si el cerebro dice que el filtro actual es 'category', mostramos su valor.
                       Si el cerebro dice 'all' (porque pulsamos Todos los libros), forzamos visualmente a "all".
                       Esto evita que el desplegable se quede "atascado" mostrando una categoría antigua.
                    */
                    value={currentFilter.type === 'category' ? currentFilter.value : "all"}
                >
                    <option value="all">Todas las categorías</option>
                    {allCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    onChange={handleYearChange}
                    className="year-select"
                    /* COMPONENTE CONTROLADO: Igual que en categorías, forzamos que la vista
                       coincida exactamente con el estado interno de la aplicación. */
                    value={currentFilter.type === 'year' ? currentFilter.value : "all"}
                >
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
                                // Si el usuario está en "all", mostramos sus libros, si está en "mine", mostramos todos los libros
                                if (viewMode === "all") {
                                    fetchMyBooks(); // Si estamos en "all", recargamos solo los libros del usuario
                                } else { // Si el usuario está en "mine", lo enviamos a "all" y reseteamos todo
                                    setViewMode("all"); // Reseteamos el modo de vista
                                    setCurrentPage(1); // Reseteamos la página a 1
                                    setCurrentFilter({ type: 'all', value: null }); // Reseteamos los filtros 
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
                // Al añadir un libro, forzamos un reseteo al inicio del catálogo para que el 
                // libro recién añadido (orden DESC) aparezca el primero
                if (viewMode === "all") {
                    /*
                    ¿Por qué ya no usamos setBooks((prevBooks) => [...prevBooks, newBook])?
                    
                    ANTES: Pegábamos el libro nuevo "a mano" al final del array local. 
                    - Problema 1: Se rompía el límite de paginación (si el límite era 12, pasábamos a tener 13 en pantalla).
                    - Problema 2: El servidor manda los libros más nuevos PRIMERO (ORDER BY id DESC). 
                      Al pegarlo al final, el orden visual quedaba al revés.

                    AHORA: 
                    1. setCurrentFilter: Limpiamos cualquier filtro activo (ej: si estábamos en "Fantasía") para ver el catálogo global.
                    2. setCurrentPage(1): Volvemos a la página 1 para asegurarnos de estar arriba del todo.
                    3. fetchAllBooks(1): Forzamos la descarga desde el servidor. Si el usuario ya estaba en la página 1, 
                       el `useEffect` NO saltaría por sí solo (porque la página no ha cambiado de valor). 
                       Así garantizamos que la pantalla parpadee y el nuevo libro aparezca exactamente en la primera posición.
                    */
                    setCurrentFilter({ type: "all", value: null });
                    setCurrentPage(1);
                    fetchAllBooks(1); // Forzamos petición directa

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
   REUTILIZACIÓN Y OPTIMIZACIÓN (fetchFilters):

   ¿Por qué sacamos esta lógica fuera del useEffect?
   Si la lógica de obtener categorías estuviera encerrada dentro de un useEffect con [], solo 
   se ejecutaría una vez al inicio. Al sacarla a esta función independiente (fetchFilters), podemos 
   "dispararla" manualmente cada vez que hay un cambio (POST/DELETE/PUT). De este modo, el menú 
   lateral se actualiza en tiempo real sin que el usuario tenga que refrescar la página entera.

   ¿Por qué usar una API específica (/api/books/filters)?
   En la versión anterior pedíamos 1000 libros solo para extraer sus categorías en JavaScript. 
   Esto era ineficiente (consumía mucha memoria y ancho de banda). Ahora usamos un endpoint 
   profesional en Symfony que utiliza consultas DISTINCT directamente en la base de datos.
   Es una solución escalable: funcionará igual de rápido con 100 libros que con 1 millón.
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