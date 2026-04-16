import { useState } from "react";

function BookAdd(props) {
    const { setBooks } = props;
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [genre, setGenre] = useState("");
    const [pages, setPages] = useState("");

    // En un principio el formulario enviaba archivos de texto plano (JSON) pero como 
    // las imagenes son archivos binarios, necesitamos usar FormData para enviar archivos binarios
    const [image, setImage] = useState(null);

    // Este es el estado que nos permitirá recibir los errores que hemos configurado en BookType
    // y mostrarlos en el frontend (con esto detectará por ejemplo si la imagen es demasiado grande)
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Creamos un objeto FormData para enviar tanto archivos binarios como de texto plano (JSON)
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("isbn", isbn);
        formData.append("category", genre);
        formData.append("pages", pages);
        if (image) {
            formData.append("image", image);
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
                setBooks((prevBooks) => [...prevBooks, savedBook]);
                setTitle("");
                setAuthor("");
                setIsbn("");
                setGenre("");
                setPages("");
                setImage(null);
                setErrors([]); // Limpiamos errores previos
                e.target.reset();
                alert("¡Libro añadido con éxito!");
            } else if (response.status === 400) {
                const errorData = await response.json();
                setErrors(errorData.errors || ["Error en la validación"]);
            } else {
                setErrors(["Ocurrió un error inesperado en el servidor."]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="book-add-container">
            <h3>Agregar nuevo libro</h3>

            {errors.length > 0 && (
                <div className="error-messages">
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index} style={{ color: "red", fontSize: "0.85em" }}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="book-add-form">
                <input
                    name="title"
                    type="text"
                    placeholder="Titulo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    name="author"
                    type="text"
                    placeholder="Autor"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                />
                <input
                    name="isbn"
                    type="text"
                    placeholder="ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    required
                />
                <input
                    name="genre"
                    type="text"
                    placeholder="Género"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    required
                />
                <input
                    name="pages"
                    type="number"
                    placeholder="Páginas"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    required
                />
                <div className="file-input-container">
                    <label htmlFor="image-upload">
                        Subir imagen de portada:
                    </label>
                    <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit" className="book-add-button">
                    Agregar libro
                </button>
            </form>
        </div>
    );
}

export default BookAdd;
