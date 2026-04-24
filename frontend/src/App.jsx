import { useEffect, useState } from "react";
import BookList from "./components/BookList";
import BookAdd from "./components/BookAdd";
import BookHeader from "./components/BookHeader";
import BookImport from "./components/BookImport";
import "./App.css";


function App() {
    const [books, setBooks] = useState([]);
    const [user, setUser] = useState(null); // Estado para el usuario logueado (por defecto es null porque al cargar al app, no hay nadie conectado)
    const [selectedBook, setSelectedBook] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [allYears, setAllYears] = useState([]);
    const [viewMode, setViewMode] = useState("all"); // "all" o "mine"


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

    return (
        <div className="app-container">
            <header style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #ddd', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <h1>Catálogo de Libros</h1>
                {user ? ( // Si el usuario está logueado, mostramos su email y un botón para cerrar sesión
                    <div>
                        <span>Hola, <strong>{user.email}</strong></span>
                        <a href="http://localhost:8000/logout" style={{ marginLeft: '15px', color: 'red' }}>Cerrar sesión</a>
                    </div>
                ) : ( // Si el usuario no está logueado, mostramos un enlace para iniciar sesión
                    <a href="http://localhost:8000/login">Iniciar sesión</a>
                )}

            </header>

            <BookHeader selectedBook={selectedBook} />


            {/* Botones para filtrar el catálogo */}
            <section>
                <h4>Filtrar catálogo:</h4>
                <button onClick={fetchAllBooks} className="filter-button">
                    Todos los libros
                </button>
                <button onClick={handleFilterByYear} className="filter-button">
                    Filtrar por año
                </button>
                <button onClick={handleFilterByCategory} className="filter-button">
                    Filtrar por categoría
                </button>

                {/* Botón para importar JSON - SOLO PARA LOGUEADOS */}
                {user && <BookImport onImportSuccess={viewMode === "all" ? fetchAllBooks : fetchMyBooks} />}

                {/* Botón para ver mis libros - SOLO PARA LOGUEADOS */}
                {user && (
                    <button
                        onClick={viewMode === "all" ? fetchMyBooks : fetchAllBooks}
                        className="filter-button"
                        style={{ backgroundColor: viewMode === "mine" ? "#007bff" : "#6c757d", color: "white" }}
                    >
                        {viewMode === "all" ? "Ver mis libros" : "Ver todo el catálogo"}
                    </button>
                )}
            </section>


            {/* Menú de Categorías */}
            <select onChange={handleCategoryChange} className="filter-select">
                <option value="all">Todas las categorías</option>

                {/* Recorremos todas las categorías y creamos un option para cada una */}
                {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Menú de Años */}
            <select onChange={handleYearChange} className="year-select">
                <option value="all">Todos los años</option>

                {/* Recorremos todos los años y creamos un option para cada uno */}
                {allYears.map((yearSelected) => (
                    <option key={yearSelected} value={yearSelected}>
                        {yearSelected}
                    </option>
                ))}
            </select>

            {/* Formulario para agregar un nuevo libro - SOLO PARA LOGUEADOS */}
            {user && <BookAdd setBooks={viewMode === "all" ? setBooks : fetchMyBooks}></BookAdd>}
            <hr />
            <br />

            {/* Lista de libros */}
            <BookList
                books={books}
                setSelectedBook={setSelectedBook}
                setBooks={setBooks}
            ></BookList>
        </div>
    );
}

export default App;
