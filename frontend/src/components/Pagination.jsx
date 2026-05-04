/**
 * Componente Pagination
 * Muestra botones para navegar entre las páginas de resultados.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
    // currentPage = página actual, totalPages = número total de páginas, onPageChange = función que cambia la página

    if (totalPages <= 1) return null; // No mostramos nada si solo hay una página

    const pages = []; // Creamos un array para guardar los números de página

    for (let i = 1; i <= totalPages; i++) { // Recorremos todas las páginas
        pages.push(i); // Añadimos cada número de página al array
    }

    return (
        <div className="pagination-container" style={{ margin: '20px 0', textAlign: 'center' }}>
            {/* Botón para retroceder */}
            <button
                onClick={() => onPageChange(currentPage - 1)} // Restamos 1 a la página actual
                disabled={currentPage === 1} // Si la página actual es 1, no se puede retroceder
                className="filter-button"
            >
                Anterior
            </button>

            {pages.map(page => ( // Recorremos todas las páginas

                <button // Botón para cambiar a la página seleccionada
                    key={page}
                    onClick={() => onPageChange(page)} // Cambiamos a la página seleccionada
                    className={`filter-button ${currentPage === page ? 'active' : ''}`}
                    // Si la página actual es igual a la página que se está iterando, se le añade la clase 'active'
                    // Si no es igual, se le añade la clase 'inactive'
                    style={{
                        margin: '0 5px', // Separación entre los botones
                        backgroundColor: currentPage === page ? '#3498db' : '', // Color de fondo del botón activo
                        color: currentPage === page ? 'white' : '' // Color del texto del botón activo
                    }}
                >
                    {page}
                </button>
            ))}

            {/* Botón para avanzar */}
            <button
                onClick={() => onPageChange(currentPage + 1)} // Sumamos 1 a la página actual
                disabled={currentPage === totalPages} // Si la página actual es igual a la última página, no se puede avanzar
                className="filter-button"
            >
                Siguiente
            </button>
        </div>
    );
}

export default Pagination;
