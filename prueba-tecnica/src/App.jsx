import { useState } from "react";
import "./App.css";
import BookList from "./components/BookList";

function App() {
  const [selectedBook, setSelectedBook] = useState([]);
  /* 
    Nos saldrá este error por consola:
    - Uncaught TypeError: selectedBook is not a function
    
    Nos pasaba porque intentabamos llamar a un array (selectedBook) como si fuera una función, lo que causaba el TypeError.
    
    Para solucionarlo, tenemos que pasarle también la función que actualiza el estado de los libros (setSelectedBook)
  */

  return (
    <>
      {/* Este encabezado nos mostrará de forma visual el libro que hemos seleccionado y demostrará que la lógica funciona correctamente */}
      <h2>
        Libro seleccionado actualmente:{" "}
        {/* Si hay un libro seleccionado, mostrará su título; si no, mostrará el texto "Ninguno" */}
        {selectedBook.title ? selectedBook.title : "Ninguno"}
      </h2>
      <BookList
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
      ></BookList>
    </>
  );
}

export default App;

/* 
Se inicializa el estado como un array vacío [] por consistencia, pero se utiliza un 
renderizado condicional {selectedBook.title ? ...} para gestionar la visualización inicial de forma segura.
*/
