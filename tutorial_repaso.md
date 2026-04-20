# Tutorial: Blindando una Aplicación Symfony/React

En este tutorial repasamos los 4 pilares que hemos implementado hoy para transformar una aplicación básica en una profesional y robusta.

---

## Paso 1: Blindar la Base de Datos (Entidades)

En lugar de confiar en que el usuario mande datos correctos, forzamos la estructura en la entidad.

### ¿Cómo lo hicimos?
Usamos **atributos PHP 8** en `src/Entity/Book.php`:
1.  **Tipado estricto**: Cambiamos `private ?string` por `private string` para que el código falle si falta el dato.
2.  **Validaciones Profesionales**:
    - `#[Assert\NotBlank]`: Asegura que el campo no llegue vacío.
    - `#[Assert\Isbn]`: Valida automáticamente el algoritmo matemático del ISBN.
    - `#[UniqueEntity]`: (A nivel de clase) Verifica que no existan duplicados en la base de datos antes de guardar.

### Aprendizaje clave:
> El backend es la última línea de defensa. Si la base de datos es sólida, el resto de la app será estable.

---

## Paso 2: Validaciones Avanzadas (Regex)

A veces necesitas reglas que no existen por defecto (como el límite de palabras).

### ¿Cómo lo hicimos?
Usamos `#[Assert\Regex]`, que es la "navaja suiza" de las validaciones:
- **Límite de palabras**: `pattern: '/^(\s*\S+\s*){0,100}$/'`. Esto busca grupos de caracteres separados por espacios y cuenta hasta 100.
- **Solo letras**: `pattern: '/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/u'`. Esto bloquea cualquier cosa que no sea letra o espacio.

---

## Paso 3: Gestión de Archivos Inteligente

Ahorrar espacio es vital. Un error común es borrar el registro pero dejar la foto "viva" en el disco.

### ¿Cómo lo hicimos?
En `BookController.php`, antes de ejecutar `$em->remove($book)`, buscamos la ruta física:
```php
$filePath = $this->getParameter('kernel.project_dir') . '/public' . $image->getRutaArchivo();
if (file_exists($filePath)) {
    unlink($filePath); // <--- Borra el archivo real del disco
}
```

---

## Paso 4: Experiencia de Usuario (React)

Evitar que el usuario se desespere o haga 20 clics mientras el servidor procesa.

### ¿Cómo lo hicimos?
Creamos un estado `isSubmitting`:
1.  Al empezar el envío: `setIsSubmitting(true)`.
2.  El botón se desactiva: `<button disabled={isSubmitting}>`.
3.  Al terminar (éxito o error): `setIsSubmitting(false)`.

---

## Paso 5: Sincronización (Migraciones)

Después de cambiar la entidad, hay que avisar a MySQL.

### Comandos utilizados:
1.  `php bin/console make:migration`: Symfony compara tu código con la base de datos y crea un archivo SQL automático.
2.  `php bin/console doctrine:migrations:migrate`: Aplica esos cambios (crea los `NOT NULL` y el `UNIQUE`).

---

### Resumen para recordar:
- **Entidad**: Define qué es obligatorio.
- **Controller**: Gestiona la lógica (borrados, archivos).
- **React**: Informa al usuario de lo que está pasando.
- **Migración**: Sincroniza el código con la base de datos.

¡Espero que este recorrido te ayude a dominar la gestión de archivos y carruseles en tus futuros proyectos!
