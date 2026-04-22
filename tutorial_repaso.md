# Tutorial: Importación Masiva de Datos (JSON)

En este tutorial aprenderás cómo hemos implementado la funcionalidad para importar libros masivamente desde archivos JSON, integrando la lógica en el Backend (Symfony) y una interfaz de carga en el Frontend (React).

---

## 🛠️ Fase 1: Backend (Symfony) - El Endpoint de Carga

El objetivo es tener un punto de entrada que reciba un JSON, lo valide y guarde cada libro en la base de datos de forma automática, actuando como un "filtro de calidad".

### 1. El Controlador Robusto (`BookController.php`)
Hemos añadido el método `import_books` para procesar las peticiones POST con el contenido del archivo.

```php
#[Route('/book/import', name: 'api_book_import_json', methods: ['POST'])]
public function import_books(Request $request, ValidatorInterface $validator): Response {
    $data = json_decode($request->getContent(), true); // Convertimos JSON a array de PHP

    foreach ($data['books'] as $bookData) {
        $isbn = $bookData['isbn'] ?? null;
        
        // 1. Evitamos duplicados comprobando si el ISBN ya existe o es nulo
        $existing = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);
        if ($existing || !$isbn) continue;

        // 2. Creación y Relleno (Orden Crítico)
        // Creamos y rellenamos el objeto ANTES de validarlo
        $book = new Book();
        $book->setIsbn($isbn);
        $book->setTitle($bookData['title'] ?? 'Sin título');
        $book->setAuthor($bookData['author'] ?? 'Anónimo');
        // ... seteamos el resto de campos (páginas, descripción, etc.)

        // 3. Validación Estricta (Tus reglas de negocio)
        // El validador usa los #[Assert\...] definidos en Book.php (ej: límite de palabras)
        $errors = $validator->validate($book);
        if (count($errors) > 0) continue; // Si no cumple las reglas, saltamos este libro

        $this->em->persist($book);
    }
    $this->em->flush(); // Guardamos todos los libros válidos de golpe
}
```

> [!TIP]
> **Orden de Ejecución**: Es vital crear y rellenar el objeto `$book` antes de llamar a `$validator->validate($book)`. De lo contrario, estaríamos validando una variable vacía y el servidor daría error.

---

## ⚛️ Fase 2: Frontend (React) - Componente de Importación

Hemos creado un componente modular que permite al usuario seleccionar archivos locales de forma elegante.

### 1. Estrategia del "Input Oculto"
Los inputs de archivo por defecto son difíciles de estilizar. Por eso:
- **Ocultamos el real**: Usamos `display: none` y una `ref={fileInputRef}`.
- **Botón Bonito**: Creamos un botón con estilos CSS que, al pulsarlo, simula un clic en el input oculto (`fileInputRef.current.click()`).

### 2. Procesamiento con `FileReader`
Leemos el archivo en el navegador para limpiarlo antes de enviarlo:
```javascript
const reader = new FileReader();
reader.onload = async (event) => {
    const rawContent = event.target.result;
    // Eliminamos el BOM (\uFEFF) y espacios laterales innecesarios
    const jsonContent = rawContent.replace(/^\uFEFF/, '').trim();
    
    // Validamos localmente con JSON.parse antes de molestar al servidor
    JSON.parse(jsonContent);

    // Enviamos el JSON limpio al servidor
    await fetch('/book/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonContent
    });
};
reader.readAsText(file);
```

---

## 🛡️ Fase 3: Lecciones Aprendidas (Resolución de Bugs)

### 1. El Error 405 y la Colisión de Rutas
Si Symfony te da un error de "Método no permitido" al importar:
1.  **Nombres**: Asegúrate de que la ruta de importación tenga un nombre único (ej: `api_book_import_json`).
2.  **Orden**: Las rutas estáticas fijas como `/book/import` deben estar definidas **antes** que las rutas con variables dinámicas como `/book/{isbn}` en tu controlador.

---

## 🎓 Resumen del Sistema Final
1.  **Integridad**: El sistema respeta todas tus reglas (regex de autor, palabras de descripción, etc.).
2.  **Robustez**: Maneja errores de formato y caracteres invisibles automágicamente.
3.  **UX**: Feedback inmediato con recuento de éxitos y saltos.

¡Disfruta cargando catálogos completos con un click! 🚀
