import { useState, useEffect } from "react";

function BookEdit(props) {
    const { book, onCancel, onUpdate } = props;

    // Estados para almacenar los datos del formulario, inicializados con los datos del libro
    const [title, setTitle] = useState(book.title || "");
    const [subtitle, setSubtitle] = useState(book.subtitle || "");
    const [author, setAuthor] = useState(book.author || "");
    const [isbn, setIsbn] = useState(book.isbn || ""); // No se puede editar el ISBN porque es el identificador único del libro 
    const [category, setCategory] = useState(book.category || "");
    const [pages, setPages] = useState(book.pages || "");
    const [published, setPublished] = useState(book.published || "");
    const [description, setDescription] = useState(book.description || "");
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    /*
        Lo primero que hace el componente es rellenar el formulario con los datos del libro que se le pasa como prop.
    */

    // Función que se ejecuta cuando se envía el nuevo formulario con los datos actualizados del libro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors([]);

        // Creamos un objeto FormData para enviar los datos del formulario
        const formData = new FormData();
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("author", author);
        formData.append("isbn", isbn);
        formData.append("category", category);
        formData.append("pages", pages);
        formData.append("published", published);
        formData.append("description", description);

        // Añadimos las imágenes al FormData
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append("image[]", images[i]); // Añadimos cada imagen al FormData (aunque puede que no se hayan añadido nuevas imágenes)
            }
        }

        // Hacemos la petición POST al webservice edit_book pasándole el FormData con los datos del formulario
        try {
            const response = await fetch(`/book/edit/${book.isbn}`, {
                method: "POST",
                body: formData,
            });

            // Si la petición es exitosa, actualizamos el libro
            if (response.ok) {
                const updatedBook = await response.json();
                alert("¡Libro actualizado con éxito!");
                onUpdate(updatedBook); // Notificamos al componente padre (App) que el libro ha sido actualizado para que actualice la lista de libros y cierre el modal
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || ["Error al actualizar el libro"]); // Si hay un error, lo mostramos
            }
        } catch (error) {
            console.error(error);
            setErrors(["Error de conexión con el servidor"]);
        } finally {
            setIsSubmitting(false); // Finalizamos el envío del formulario
        }
    };

    return (
        <div className="book-edit-overlay">
            <div className="book-edit-modal">
                <h3>Editar libro: {book.title}</h3>

                {errors.length > 0 && (
                    <ul className="error-messages">
                        {errors.map((error, index) => (
                            <li key={index} style={{ color: "red", fontSize: "0.85em" }}>{error}</li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="book-add-form">
                    <label>Título:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

                    <label>Subtítulo:</label>
                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />

                    <label>Autor:</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />

                    <label>ISBN (Identificador único):</label>
                    <input type="text" value={isbn} readOnly style={{ backgroundColor: "#eee" }} />

                    <label>Categoría:</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />

                    <label>Páginas:</label>
                    <input type="number" value={pages} onChange={(e) => setPages(e.target.value)} required />

                    <label>Fecha de publicación:</label>
                    <input type="date" value={published} onChange={(e) => setPublished(e.target.value)} required />

                    <label>Descripción (opcional):</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Escribe una breve reseña..."
                        className="description-input"
                    ></textarea>

                    <label>Añadir más fotos (opcional):</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />

                    <div className="modal-actions">
                        <button type="submit" className="book-add-button" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </button>
                        <button type="button" onClick={onCancel} className="filter-button" style={{ backgroundColor: "#6c757d" }}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookEdit;
