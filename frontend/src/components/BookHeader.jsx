// Este componente muestra la información del libro seleccionado

function BookHeader({ selectedBook }) {
    return (
        <header className="app-header">
            {selectedBook.isbn ? (
                <>
                    <div className="selected-book-image-container">
                        {selectedBook.images && selectedBook.images.length > 0 ? (
                            <img
                                className="selected-book-image"
                                src={selectedBook.images[0].ruta}
                                alt={selectedBook.title}
                            />
                        ) : (
                            <div className="no-image-placeholder">Sin imagen</div>
                        )}
                    </div>
                    <div>
                        <h2>{selectedBook.title}</h2>
                        <p>
                            <strong>Autor:</strong> {selectedBook.author}
                        </p>
                        <p>
                            <strong>ISBN:</strong> {selectedBook.isbn}
                        </p>
                        <p>
                            <strong>Categoria:</strong> {selectedBook.category}
                        </p>
                        <p>
                            <em>{selectedBook.description}</em>
                        </p>
                    </div>
                </>
            ) : (
                <p>Selecciona un libro</p>
            )}
        </header>
    );
}

export default BookHeader;
