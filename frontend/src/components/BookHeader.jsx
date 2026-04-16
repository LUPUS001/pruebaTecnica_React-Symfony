// Este componente muestra la información del libro seleccionado

function BookHeader({ selectedBook }) {
    return (
        <header className="app-header">
            {/* Si selectedBook existe y tiene un ISBN, mostramos la información del libro 
                Esto es necesario ponerlo por haber cambiado el estado inicial de selectedBook a null en App.jsx
                Si no lo ponemos, nos daría error al intentar acceder a selectedBook.isbn y la página se mostraría vacía
            */}
            {selectedBook && selectedBook.isbn ? (
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
                    <div className="selected-book-info">
                        <h2>{selectedBook.title}</h2>
                        <p>
                            <strong>Autor:</strong> {selectedBook.author}
                        </p>
                        <p>
                            <strong>ISBN:</strong> {selectedBook.isbn}
                        </p>
                        <p>
                            <strong>Categoría:</strong> {selectedBook.category}
                        </p>
                        <p>
                            <em>{selectedBook.description || "Sin descripción disponible."}</em>
                        </p>
                    </div>
                </>
            ) : (
                <div className="selected-book-info">
                    <p>Selecciona un libro del catálogo para ver sus detalles aquí.</p>
                </div>
            )}
        </header>
    );
}

export default BookHeader;
