import { useState } from 'react';

/**
 * ImageCarousel Component
 * 
 * Un componente elegante para mostrar un carrusel de imágenes con navegación.
 * 
 * @param {Object} props - Las propiedades del componente 
 * @param {Array} props.images - Array de objetos de imagen [{id, ruta}]
 * @param {string} props.title - Título del libro para el atributo alt
 */
function ImageCarousel({ images, title }) {
    const [currentIndex, setCurrentIndex] = useState(0); // Estado que "decide" la imagen que se muestra en cada momento  

    // Si no hay imágenes, devolvemos un placeholder
    if (!images || images.length === 0) {
        return <div className="carousel-placeholder">Sin imagen</div>;
    }

    const nextSlide = (e) => {
        e.stopPropagation(); // Evitamos que el clic en la flecha active el modal/detalle del libro

        // Para avanzar a la siguiente imagen, incrementamos el índice en 1
        // Si estamos en la última imagen, volvemos a la primera, si no, avanzamos a la siguiente
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = (e) => {
        e.stopPropagation();

        // Para retroceder a la imagen anterior, restamos el índice en 1
        // Si estamos en la primera imagen, volvemos a la última, si no, retrocedemos a la anterior
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="image-carousel">
            <div className="carousel-inner">
                {/* Jugando con el CSS hacemos que las imágenes que no están activas se oculten */}
                {images.map((image, index) => (
                    <div
                        key={image.id || index}
                        className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                    >
                        <img
                            src={image.ruta}
                            alt={`${title} - imagen ${index + 1}`}
                            className="carousel-image"
                        />
                    </div>
                ))}
            </div>


            {/* Solo mostramos controles si hay más de una imagen */}
            {images.length > 1 && (
                <>
                    {/* Botones de control */}
                    <button className="carousel-control prev" onClick={prevSlide} aria-label="Anterior">
                        {'<'}
                    </button>
                    <button className="carousel-control next" onClick={nextSlide} aria-label="Siguiente">
                        {'>'}
                    </button>

                    {/* Indicadores de posición */}
                    <div className="carousel-indicators">
                        {/* Mapeamos el array de imágenes para crear un indicador por cada imagen, son los puntitos que se ven abajo 
                            con el map sabemos cuántas imágenes hay y creamos un indicador/puntito por cada una*/}
                        {images.map((_, index) => (
                            <span
                                key={index}
                                // Si el índice es igual al índice actual, se muestra el indicador activo, si no, se muestra el indicador inactivo (que el punto brille o no)
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}

                                // Al hacer clic en un indicador, se muestra la imagen correspondiente 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ImageCarousel;
