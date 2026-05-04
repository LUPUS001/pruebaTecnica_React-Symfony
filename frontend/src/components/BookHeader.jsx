import ImageCarousel from "./ImageCarousel";

// Este componente muestra la información del libro seleccionado

function BookHeader({ selectedBook, onBack }) {

    // Función que permite compartir la información del libro en otras aplicaciones
    const handleShare = () => {
        // Preparamos el texto a compartir (Título y Autor)
        let textToShare = `${selectedBook.title} - ${selectedBook.author}`;

        // Solo añadimos la URL si el libro tiene una web oficial (evitamos compartir localhost)
        if (selectedBook.website) {
            textToShare += `\nWeb oficial: ${selectedBook.website}`;
        }

        if (navigator.share) {
            /*
            navigator.share() recibe un objeto con la información que se quiere compartir.
            title: título del libro
            text: texto que se quiere compartir
            url: url del libro (solo usamos la web oficial si la tiene)
            */
            const shareData = {
                title: selectedBook.title,
                text: `Mira este libro: ${selectedBook.title} de ${selectedBook.author}`,
            };

            // Si hay web oficial, la añadimos al objeto shareData
            if (selectedBook.website) {
                shareData.url = selectedBook.website;
            }
            /*
            navigator.share(shareData) : Muestra la ventana nativa del sistema para compartir el contenido.

            .catch((error) => ...): Maneja el error por si el usuario cancela el cuadro de diálogo.
            */
            navigator.share(shareData).catch((error) => console.log('Error compartiendo', error));
        } else {
            navigator.clipboard.writeText(textToShare); // Copia el texto al portapapeles.
            alert("¡Información del libro copiada!"); // Muestra un mensaje de alerta
        }
    };

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

                        {/* Mostramos la web oficial si existe */}
                        {selectedBook.website && (
                            <p>
                                <strong>Web oficial: </strong>
                                <a href={selectedBook.website} target="_blank" rel="noopener noreferrer">
                                    {selectedBook.website}
                                </a>
                            </p>
                        )}

                        {/* Botones de acción */}
                        <div className="book-header-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            {/* Botón para volver */}
                            <button onClick={onBack} className="filter-button secondary">
                                Volver
                            </button>
                            {/* Botón para compartir */}
                            <button onClick={handleShare} className="book-add-button">
                                Compartir
                            </button>
                        </div>
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