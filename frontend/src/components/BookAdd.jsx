import { useState } from "react";

function BookAdd(props) {
    const { setBooks } = props;
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [genre, setGenre] = useState("");
    const [pages, setPages] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newBook = {
            title,
            author,
            isbn,
            category: genre,
            pages: parseInt(pages) || 1,
        };

        try {
            const response = await fetch("/book/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newBook),
            });

            if (response.ok) {
                const savedBook = await response.json();
                setBooks((prevBooks) => [...prevBooks, savedBook]);
                setTitle("");
                setAuthor("");
                setIsbn("");
                setGenre("");
                setPages("");
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
                <button type="submit" className="book-add-button">
                    Agregar libro
                </button>
            </form>
        </div>
    );
}

export default BookAdd;
