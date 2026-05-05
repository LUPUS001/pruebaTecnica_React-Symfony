# Reporte Técnico: Refactorización Final y Escalabilidad (React + Symfony)

Este documento detalla la gran refactorización realizada en la última etapa del proyecto. Hemos pasado de un prototipo funcional a una aplicación verdaderamente escalable y profesional, preparada para manejar miles de registros sin perder rendimiento ni romper la interfaz de usuario.

---

## 🏛️ Parte 1: Rediseño de la Arquitectura Backend

El principal problema de la versión anterior era que el frontend pedía **todos** los libros de golpe. Esto no es escalable. Si la base de datos tuviera 50,000 libros, el servidor colapsaría y el navegador del usuario se quedaría bloqueado.

### 1. Paginación Profunda en Doctrine (`BookRepository.php`)
Para solucionar esto, implementamos paginación nativa usando el **QueryBuilder** de Doctrine:
- **`limit` y `offset`**: El repositorio ahora acepta parámetros de límite (cuántos libros queremos, ej: 12) y desplazamiento (desde cuál empezamos).
- **Ejemplo**: Si estamos en la página 3 y queremos 12 libros, el `offset` se calcula como `(3 - 1) * 12 = 24`. El servidor ignorará los primeros 24 libros y devolverá del 25 al 36.

### 2. Metadatos Dinámicos en las Respuestas
El `BookController` ya no devuelve un simple array de libros. Ahora devuelve un objeto estructurado que incluye **metadatos cruciales** para que React sepa cómo dibujar la interfaz:
```json
{
  "books": [{...}, {...}],
  "total_records": 145,
  "total_pages": 13,
  "current_page": 3
}
```
*Nota técnica: Usamos `ceil()` en PHP para asegurar que si hay 13 libros y el límite es 12, se generen 2 páginas exactas.*

### 3. Endpoints Específicos para Rendimiento (`/api/books/filters`)
Antes extraíamos las categorías directamente del array de libros que llegaba a React. Al implementar paginación, este enfoque se rompió (si la página 1 no tenía libros de "Fantasía", la categoría desaparecía del filtro visual).
- **Solución**: Creamos un endpoint especializado en Symfony que hace un `SELECT DISTINCT` ultrarrápido para devolver **solo** las categorías y los años disponibles en toda la base de datos, independientemente de la página actual.

---

## ⚛️ Parte 2: El Cerebro del Frontend (React State Machine)

Para manejar la complejidad de la paginación cruzada con diferentes filtros (búsqueda, categorías, años y "mis libros"), rediseñamos el flujo de datos en `App.jsx`.

### 1. El Estado `currentFilter` (La Única Fuente de la Verdad)
Creamos un objeto de estado unificado que actúa como el "cerebro" de la aplicación:
```javascript
const [currentFilter, setCurrentFilter] = useState({ type: 'all', value: null });
```
- Si `type` es `'all'`, pedimos la página X del catálogo general.
- Si `type` es `'category'` y `value` es `'Shonen'`, pedimos la página X filtrada por Shonen.

### 2. Centralización en el `useEffect`
En lugar de tener cinco funciones distintas haciendo peticiones `fetch` que se pisaban unas a otras, centralizamos todo en un único "motor de reacción":

```javascript
useEffect(() => {
    if (viewMode === 'mine') return; // Mis libros tienen su propia lógica

    if (currentFilter.type === 'all') fetchAllBooks(currentPage);
    else if (currentFilter.type === 'category') fetchCategoryBooks(currentFilter.value, currentPage);
    else if (currentFilter.type === 'year') fetchYearBooks(currentFilter.value, currentPage);
    else if (currentFilter.type === 'search') executeSearch(currentFilter.value, currentPage);

}, [currentPage, currentFilter, viewMode]);
```
**¿Por qué es esto brillante?** Porque si el usuario cambia de página (`currentPage`), o cambia de categoría (`currentFilter`), React detecta el cambio en las dependencias y dispara la petición exacta que toca. Es imposible que la paginación y el filtro se desincronicen.

---

## 🐛 Parte 3: Solución de Problemas Clásicos (State Desync)

Durante la implementación, detectamos y solucionamos varios "Bugs" típicos de las Single Page Applications (SPAs):

### Bug 1: La Reactividad Rota en CRUD
**Problema:** Al borrar o añadir un libro, los filtros (ej: el selector de categorías) no se actualizaban si el nuevo libro introducía una categoría nunca antes vista.
**Solución:** Desacoplamos la carga de filtros (`fetchFilters()`) y la pasamos como función de *callback* a los componentes hijos (`BookAdd`, `BookCard`). Ahora, cada vez que la base de datos se modifica, el componente avisa al padre (`App.jsx`) para que recargue silenciosamente la lista de categorías.

### Bug 2: Componentes "Rebeldes" (El problema del botón "Todos los libros")
**Problema:** Al buscar una categoría, y luego pulsar "Todos los libros", la vista volvía al catálogo general, pero los menús desplegables (`<select>`) seguían mostrando el texto de la categoría antigua. Si pasabas de página, el sistema colapsaba y te devolvía a la categoría en lugar de mostrarte el catálogo.
**Solución:** 
1. **Reseteo Total**: El botón "Todos los libros" ahora no hace un fetch directo. En su lugar, modifica la "Única Fuente de la Verdad":
   ```javascript
   setCurrentFilter({ type: 'all', value: null });
   setCurrentPage(1);
   ```
2. **Componentes Controlados**: Atamos la vista (los `<select>`) al estado interno usando la propiedad `value`:
   ```javascript
   <select value={currentFilter.type === 'category' ? currentFilter.value : "all"}>
   ```
   Si el estado dice `'all'`, la casilla está **obligada** visualmente a cambiar a "Todas las categorías". Ya no hay elementos visuales huérfanos.

---

## 🔒 Parte 4: Endurecimiento de la Seguridad y Profesionalidad

Para que este código fuera "Production-Ready", cerramos varias brechas de seguridad críticas:

### 1. Inyección SQL Prevenida por Diseño
En lugar de concatenar cadenas (lo cual permite a un hacker destruir la base de datos enviando código SQL malicioso a través de la barra de búsqueda), usamos el método `setParameter` del `QueryBuilder`:
```php
$qb->where('book.published LIKE :fecha')
   ->setParameter('fecha', $year . "%");
```
Doctrine sanitiza automáticamente el valor de `:fecha`, haciendo imposible la inyección de SQL.

### 2. Validación Real de Archivos (Magic Bytes)
Anteriormente, verificábamos las subidas de imágenes mirando la extensión del archivo (ej: `.jpg`). Un atacante podría subir un `virus.exe` renombrado a `virus.jpg`.
**Solución:** Cambiamos a la validación por **MimeTypes**. Symfony ahora inspecciona el interior del archivo, lee su firma hexadecimal ("Magic Bytes") y verifica que, internamente, los bits correspondan verdaderamente a una imagen.

### 3. Protección de Rutas Destructivas
La ruta `/import-books` borraba la base de datos y la recargaba. Antes funcionaba por método GET, lo que significa que un usuario que simplemente hiciera clic en un enlace engañoso o refrescara la página sin querer, detonaría la bomba.
**Solución:** Se cambió el endpoint estrictamente a `POST`. Los navegadores no pueden hacer peticiones POST simplemente navegando por URL, requiriendo un botón de confirmación explicito dentro de la app con el token adecuado.

### 4. Limpieza Ecológica de Archivos
Añadimos lógica en el controlador de borrado para que, cuando un usuario elimine un libro, Symfony busque la imagen física en la carpeta `public/images/` y ejecute un `unlink()`. Esto previene que el servidor se llene de "basura" o imágenes huérfanas con el tiempo.

---

## 🏆 Conclusión

Esta refactorización marca la diferencia entre un desarrollador Junior y uno Mid/Senior. 

Se ha priorizado **la única fuente de la verdad** en React, **la protección contra ataques comunes** en Symfony (SQLi, File Spoofing) y **la escalabilidad** usando paginación a nivel de base de datos. El código resultante es limpio, predecible y altamente documentado.
