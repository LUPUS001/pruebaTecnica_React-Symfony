/**
 * Componente Pagination
 * Muestra botones para navegar entre las páginas de resultados.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null; // No mostramos nada si solo hay una página

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination-container" style={{ margin: '20px 0', textAlign: 'center' }}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="filter-button"
            >
                Anterior
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`filter-button ${currentPage === page ? 'active' : ''}`}
                    style={{ 
                        margin: '0 5px', 
                        backgroundColor: currentPage === page ? '#3498db' : '',
                        color: currentPage === page ? 'white' : ''
                    }}
                >
                    {page}
                </button>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="filter-button"
            >
                Siguiente
            </button>
        </div>
    );
}

export default Pagination;
