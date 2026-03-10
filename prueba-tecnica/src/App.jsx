// Este es el puente entre los diferentes componentes
import { useState } from "react";
import "./App.css";
import BookList from "./components/BookList";

function App() {
  // Declaramos selectedBook para saber el libro que ha pulsado el usuario
  // Iniciamos con un array vacío para cumplir con el requisito de "mostrar información dinámica" al interactuar.
  const [selectedBook, setSelectedBook] = useState([]);

  /* 
    PROPS DE PADRE A HIJO
    le pasamos selectedBook a BookList 
  */
  return (
    <>
      <BookList selectedBook={selectedBook}></BookList>
    </>
  );
}

export default App;
