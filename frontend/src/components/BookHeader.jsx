import ImageCarousel from "./ImageCarousel";

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
                        {/* Pasamos las imágenes y el título del libro al componente ImageCarousel */}
                        {/* La key es necesaria porque sino, al cambiar de libro, React no se entera de que tiene que volver a renderizar el carrusel y deja la imagen en blanco */}
                        <ImageCarousel key={selectedBook.isbn} images={selectedBook.images} title={selectedBook.title} />

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
