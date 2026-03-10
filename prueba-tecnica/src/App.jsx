import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [books, setBooks] = useState();

  return (
    <>
      <main className="books">
        <h1>Parrilla</h1>
        <section>
          {/* Para recorrer los libros del JSON */}
          {books.map((_, index) => {
            return (
              <BookCard
                key={books.isbn}
                title={books.title}
                subtitle={books.subtitle}
                author={books.author}
                published={books.published}
                publisher={books.publisher}
                pages={books.pages}
                description={books.description}
                website={books.website}
                category={books.category}
              ></BookCard>
            );
            /* React no usa los tipicos bucles for para recorrer elementos, usa un map que transforma cada dato en un componente */
          })}
        </section>
      </main>
    </>
  );
}

export default App;
