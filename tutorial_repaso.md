# Tutorial: Implementación de Múltiples Imágenes y Carrusel 

En este tutorial aprenderás cómo transformar un sistema de carga de imagen única en uno de múltiples imágenes con visualización interactiva (carrusel), integrando Symfony (Backend) y React (Frontend).

---

## 🛠️ Fase 1: El Backend (Symfony)

El objetivo es permitir que el formulario reciba un array de archivos y que el controlador los guarde uno a uno.

### 1. Preparar el Formulario (`BookType.php`)
Por defecto, un campo `FileType` solo acepta un archivo. Debemos habilitar la opción `multiple`.

```php
// src/Form/BookType.php
->add('image', FileType::class, [
    'multiple' => true, // Permite seleccionar varios archivos
    'mapped' => false,   // No se mapea directamente a la entidad Book
    'constraints' => [
        new Assert\All([ // IMPORTANTE: Aplica validaciones a CADA archivo del array
            new Assert\File([
                'maxSize' => '30MB',
                'extensions' => ['jpg', 'png', 'webp'],
            ])
        ])
    ],
])
```

### 2. Procesar el Array en el Controlador (`BookController.php`)
Ahora que el formulario devuelve un array (`$uploadedFiles`), debemos iterar sobre él.

```php
// src/Controller/BookController.php
$uploadedFiles = $form->get('image')->getData(); // Esto ahora es un array

if ($uploadedFiles) {
    foreach ($uploadedFiles as $file) {
        // Generamos un nombre único: ISBN + Hash
        $newFilename = $book->getIsbn() . '-' . uniqid() . '.' . $file->guessExtension();
        
        $file->move($destination, $newFilename); // Guardado físico

        $image = new Image();
        $image->setRutaArchivo('/images/' . $newFilename);
        $image->setBook($book); // Vinculamos a la entidad Book
        $this->em->persist($image);
    }
    $this->em->flush();
}
```

---

## ⚛️ Fase 2: El Frontend (React)

El objetivo es enviar los archivos como un array y crear un componente para visualizarlos.

### 1. Enviar múltiples archivos (`BookAdd.jsx`)
En React, para enviar archivos usamos `FormData`. Para que PHP lo entienda como un array, la clave debe terminar en `[]`.

```javascript
// Al seleccionar archivos:
onChange={(e) => setImages(Array.from(e.target.files))}

// Al enviar (handleSubmit):
const formData = new FormData();
images.forEach((file) => {
    formData.append("image[]", file); // Clave con []
});
```

### 2. El Componente `ImageCarousel.jsx`
Este componente gestiona su propia navegación. Su lógica principal es el estado `currentIndex`.

*   **Puntos clave del diseño:**
    *   `position: absolute` para las imágenes para que se superpongan.
    *   `opacity: 1/0` y `transition` para el efecto de fundido.
    *   `stopPropagation()` en los botones para que al hacer clic en "Siguiente" no se active el clic de la tarjeta del libro.

---

## ✨ Fase 3: UX y Diseño Premium

### 1. Estrategia de Visualización
*   **Lista (`BookCard`)**: Mostramos solo la primera imagen (`book.images[0]`). Esto mantiene la interfaz limpia y rápida de cargar.
*   **Detalle (`BookHeader`)**: Al seleccionar un libro, mostramos el carrusel completo. Es aquí donde el usuario quiere ver todos los detalles.

### 2. Toques Finales en el CSS
Para un look "premium", usamos:
*   **Glassmorphism**: Botones con fondo semi-transparente y desenfoque (`backdrop-filter: blur(4px)`).
*   **Micro-animaciones**: Un ligero `transform: scale(1.05)` en las imágenes inactivas que se suaviza al activarse.

---

## 🎓 Resumen de Aprendizaje
1.  **Backend**: `multiple => true` + Bucle `foreach` en el controlador.
2.  **Frontend**: `input multiple` + `FormData.append("key[]", file)`.
3.  **UI**: Componente modular para el carrusel + separación entre miniatura (catálogo) y carrusel (detalle).

¡Espero que este recorrido te ayude a dominar la gestión de archivos y carruseles en tus futuros proyectos!
