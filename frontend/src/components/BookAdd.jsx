import { useState } from "react";

function BookAdd(props) {
    // Recibimos la función setBooks del componente BookList
    const { setBooks } = props;

    // Estados para almacenar los datos del formulario
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [category, setCategory] = useState(""); // Renombrado de genre para coincidir con backend
    const [pages, setPages] = useState("");
    const [description, setDescription] = useState(""); // Nueva descripción opcional

    // Usamos la fecha actual como valor por defecto 
    const today = new Date().toISOString().split('T')[0];
    /*
    new Date() -> Thu Apr 17 2026 10:38:53 GMT+0200 (Central European Summer Time)
               -> Crea un objeto con la fecha y hora actuales
    .toISOString() -> 2026-04-17T08:38:53.123Z
                   -> Convierte el objeto a una cadena en formato ISO
    .split('T') -> ["2026-04-17", "08:38:53.123Z"]
                -> Divide la cadena en un array de dos elementos usando la letra 'T' como separador
    [0] -> "2026-04-17"
        -> Toma el primer elemento del array

    Estos pasos son necesarios porque el input de tipo date necesita una cadena con este formato YYYY-MM-DD 
    y new Date().toISOString() devuelve una cadena con el formato YYYY-MM-DDTHH:MM:SS.sssZ
    */
    const [published, setPublished] = useState(today);

    // En un principio el formulario enviaba archivos de texto plano (JSON) pero como 
    // las imagenes son archivos binarios, necesitamos usar FormData para enviar archivos binarios
    const [images, setImages] = useState([]); // Cambiado a array para soportar múltiples imágenes

    // Este es el estado que nos permitirá recibir los errores que hemos configurado en BookType
    // y mostrarlos en el frontend (con esto detectará por ejemplo si la imagen es demasiado grande)
    const [errors, setErrors] = useState([]);

    // Nuevos estados para feedback y control de carga
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Función que se ejecuta cuando se envía el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Habilitamos el estado de envío para que no se pueda enviar el formulario dos veces
        setErrors([]); // Limpiamos los errores previos para que no se muestren los errores del envío anterior
        setSuccess(false); // Limpiamos el mensaje de éxito 

        // Creamos un objeto FormData para enviar tanto archivos binarios como de texto plano (JSON)
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("isbn", isbn);
        formData.append("category", category); // Usamos el nuevo estado category
        formData.append("pages", pages);
        formData.append("published", published);
        formData.append("description", description);

        // Añadimos todas las imágenes seleccionadas al FormData
        // El nombre debe terminar en [] para que PHP lo reciba como un array
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append("image[]", images[i]);
            }
        }

        // Hacemos la petición POST al webservice add_book
        // No es necesario especificar el header 'Content-Type' con 'multipart/form-data'
        // porque el navegador lo hace automáticamente al enviar un FormData
        try {
            const response = await fetch("/book/add", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const savedBook = await response.json();
                // Actualizamos el estado books con el nuevo libro
                setBooks((prevBooks) => [...prevBooks, savedBook]);
                setTitle("");
                setAuthor("");
                setIsbn("");
                setCategory("");
                setPages("");
                setDescription("");
                setPublished(today);
                setImages([]); // Limpiamos las imágenes para que no se muestren en el siguiente renderizado 
                e.target.reset(); // Limpiamos el formulario

                // Feedback visual en lugar de alert
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else if (response.status === 400) {
                const errorData = await response.json(); // Obtenemos los errores del servidor
                setErrors(errorData.errors || ["Error en la validación"]); // Guardamos los errores en el estado errors
            } else {
                setErrors(["Ocurrió un error inesperado en el servidor."]); // Si hay otro tipo de error, lo mostramos
            }
        } catch (error) {
            console.error(error); // Si hay un error en la petición, lo mostramos
            setErrors(["Error de conexión con el servidor"]);
        } finally {
            setIsSubmitting(false); // Siempre volvemos a habilitar el formulario
        }
    };

    // Renderizado del formulario
    return (
        <div className="book-add-container">
            <h3>Agregar nuevo libro</h3>

            {/* Mensaje de éxito temporal */}
            {success && (
                <div className="success-message">
                    ¡Libro añadido con éxito!
                </div>
            )}

            {/* Si hay errores, los mostramos en una lista */}
            {errors.length > 0 && (
                /* Lista de errores */
                <ul className="error-messages">
                    {/* Mapeamos los errores y los mostramos en una lista */}
                    {errors.map((error, index) => (
                        // Mostramos cada error en un elemento de lista
                        <li key={index} style={{ color: "red", fontSize: "0.85em" }}>{error}</li>
                    ))}
                </ul>
            )}

            {/* Formulario para agregar un nuevo libro */}
            <form onSubmit={handleSubmit} className="book-add-form">

                {/* Campo para el título del libro */}
                <input
                    name="title" // Nombre del campo que coincide con el nombre de la propiedad en el objeto Book
                    type="text" // Tipo de campo
                    placeholder="Titulo" // Texto que se muestra en el campo
                    value={title} // Valor del campo
                    onChange={(e) => setTitle(e.target.value)} // Función que se ejecuta cuando cambia el valor del campo 
                    required // Campo requerido
                    disabled={isSubmitting}
                />
                <input
                    name="author"
                    type="text"
                    placeholder="Autor"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <input
                    name="isbn"
                    type="text"
                    placeholder="ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <input
                    name="category"
                    type="text"
                    placeholder="Categoría (Género)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <input
                    name="pages"
                    type="number"
                    placeholder="Páginas"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                
                <textarea
                    name="description"
                    placeholder="Descripción del libro (opcional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    className="description-input"
                ></textarea>

                {/* Campo para la fecha de publicación del libro */}
                <div className="file-input-container">
                    <label htmlFor="publish-date">Fecha de publicación:</label> {/* Etiqueta del campo */}
                    <input
                        id="publish-date" // ID del campo
                        name="published" // Nombre del campo que coincide con el nombre de la propiedad en el objeto Book
                        type="date" // Tipo de campo (recibirá el valor en formato YYYY-MM-DD)
                        className="date-input" // Clase del campo (la que definimos en el CSS)
                        value={published} // Valor del campo (el que definimos en el estado published)
                        onChange={(e) => setPublished(e.target.value)} // Función que se ejecuta cuando cambia el valor del campo (actualiza el estado published)
                        required // Campo requerido
                        disabled={isSubmitting}
                    />
                </div>

                {/* Campo para subir las imágenes de portada del libro (puedes subir varias) */}
                <div className="file-input-container">
                    <label htmlFor="image-upload">Subir imágenes de portada (puedes elegir varias):</label> {/* Etiqueta del campo */}
                    <input
                        id="image-upload" // ID del campo
                        name="image[]" // Nombre del campo (usamos [] para que PHP lo reciba como array / lista)
                        type="file" // Tipo de campo
                        accept="image/*" // Solo permite archivos que sean imágenes 
                        multiple // Permitimos seleccionar múltiples archivos
                        onChange={(e) => setImages(Array.from(e.target.files))} // Convertimos FileList a Array y actualizamos el estado
                        /*
                         * El input type="file" recibe los archivos seleccionados en un objeto llamado FileList
                         * FileList es un objeto similar a un array que contiene los archivos seleccionados (es el objeto que recibe e.target.files)
                         * lo convertimos a Array con Array.from() para poder manejarlo como un array y poder recorrerlo con map() entre otras cosas
                         */
                        disabled={isSubmitting}
                    />
                </div>

                {/* Botón para enviar el formulario */}
                <button
                    type="submit"
                    className="book-add-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Guardando..." : "Agregar libro"}
                </button>
            </form>
        </div>
    );
}

export default BookAdd;
