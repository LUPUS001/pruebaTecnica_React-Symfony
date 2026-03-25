function BookCard(props) {
  const { book } = props;

  return (
    <li 
      style={{ 
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
      </div>
    </li>
  );
}

export default BookCard;
