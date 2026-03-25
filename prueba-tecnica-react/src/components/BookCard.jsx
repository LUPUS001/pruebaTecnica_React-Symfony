function BookCard(props) {
  const { book, setSelectedBook, setBooks } = props;

  const handleDelete = async (e) => {
    e.stopPropagation(); // Evita que se seleccione el libro al borrarlo
    
    try {
      const response = await fetch(`/book/delete/${book.isbn}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBooks((prevBooks) => prevBooks.filter((b) => b.isbn !== book.isbn));
        console.log("Libro eliminado con éxito");
      }
    } catch (error) {
      console.error("Error al eliminar el libro:", error);
    }
  };

  return (
    <li 
      onClick={() => setSelectedBook(book)}
      style={{ 
        cursor: "pointer",
        border: "1px solid #ddd", 
        padding: "15px", 
        margin: "10px", 
        listStyle: "none", 
        display: "flex", 
        gap: "15px",
        alignItems: "center",
        borderRadius: "8px",
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}
    >
      <div style={{ width: "80px", height: "110px", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", overflow: "hidden" }}>
        {book.images && book.images.length > 0 ? (
          <img src={book.images[0].ruta} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "10px", color: "#999" }}>Sin imagen</span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1em" }}>{book.title}</h3>
        <h5 style={{ margin: "0 0 5px 0", color: "#666" }}>{book.subtitle}</h5>
        <p style={{ margin: "0", fontSize: "0.9em" }}><strong>Autor:</strong> {book.author}</p>
        <button 
          onClick={handleDelete}
          style={{ marginTop: "10px", backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

export default BookCard;
