import { useState } from "react";

function BookAdd(props) {
    const { setBooks } = props;
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [genre, setGenre] = useState("");
    const [pages, setPages] = useState("");
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("isbn", isbn);
        formData.append("category", genre);
        formData.append("pages", pages);
        if (image) {
            formData.append("image", image);
        }

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
                // Reseteamos el input de archivo manualmente si es necesario (o confiamos en el estado)
                e.target.reset();
                // Para que el usuario sepa que la operación tuvo éxito
                console.log("Libro añadido con éxito:", savedBook.title);
                alert("¡Libro añadido con éxito!");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="book-add-container">
            <h3>Agregar nuevo libro</h3>
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
