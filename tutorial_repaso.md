# Tutorial: Conexión de Usuarios (Symfony + React)

En este tutorial aprenderás cómo hemos conectado el sistema de seguridad de Symfony con el Frontend de React para que la aplicación reconozca quién ha iniciado sesión.

---

## 🛠️ Paso 1: Configuración del "Cerebro" (Symfony)

Para que React pueda "ver" al usuario, hemos configurado Symfony de la siguiente manera:

### 1. El Portal de Seguridad (`security.yaml`)
Hemos configurado el **Firewall** para que acepte tanto formularios tradicionales (`form_login`) como peticiones JSON (`json_login`). 
- **User Provider**: Le decimos que busque usuarios en la base de datos usando el `email`.
- **Logout**: Habilitamos la ruta `/logout` para cerrar sesiones y redirigir automáticamente de vuelta al frontend.

### 2. El Endpoint de Información (`AuthController.php`)
Hemos creado una ruta especial (`/api/user/status`) que responde a React:
- Si hay sesión: Devuelve los datos del usuario logueado en formato JSON.
- Si no hay sesión: Devuelve un error 401 indicando que no estás identificado.

---

## ⚛️ Paso 2: El Puente en React

Para que React se entere de lo que pasa en el servidor, hemos hecho dos cosas:

### 1. El Proxy (`vite.config.js`)
Como React corre en el puerto `5173` y Symfony en el `8000`, el navegador los ve como **dominios distintos** (aunque sean localhost). Esto provoca errores de **CORS** (*Cross-Origin Resource Sharing*): el navegador bloquea por seguridad las peticiones entre puertos diferentes.

El **Proxy** de Vite resuelve esto: todas las peticiones que empiecen por `/api` se redirigen automáticamente al servidor de Symfony, compartiendo las cookies de sesión. El navegador cree que hay una sola origin y no bloquea nada.


### 2. Detección Automática (`App.jsx`)
En el componente principal, usamos un `useEffect` para preguntar al servidor apenas carga la página:
```javascript
const checkUserSession = async () => {
    const response = await fetch("/api/user/status"); // Usamos el proxy
    if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Guardamos al usuario en el estado
    }
};
```

---

## 🧪 Cómo probar que todo funciona

Gracias a la configuración de redirecciones automáticas, ahora el flujo es más sencillo:

1. **Backend**: Ve a [http://localhost:8000/login](http://localhost:8000/login) e inicia sesión (ej: `antonio@a.com`).
2. **Redirección Automática**: Tras pulsar en "Entrar", el servidor te devolverá **automáticamente** a tu aplicación de React en [http://localhost:5173/](http://localhost:5173/).
3. **Verificación**: Verás que arriba a la derecha aparece **"Hola, antonio@a.com"** sin que hayas tenido que volver manualmente.
4. **Cerrar Sesión**: Si haces clic en el enlace de "Cerrar sesión" en React, el sistema destruirá la sesión en Symfony y te devolverá automáticamente a React, donde volverás a ver el botón de "Iniciar sesión".

---

---

## 🔒 Paso 3: Propiedad y Vistas Privadas

Ahora la aplicación es más inteligente y segura:

### 1. Dueños de Libros
Cada libro que se añade (o importa) queda vinculado al usuario que tiene la sesión iniciada. Esto se gestiona en el backend guardando el `owner_id` en la tabla de libros.

### 2. Filtro "Mis Libros"
En React, los usuarios logueados tienen un botón especial para alternar entre:
- **Ver todo el catálogo**: Ver los libros de todo el mundo.
- **Ver mis libros**: Llamada al endpoint `/api/me/books` que filtra solo los tuyos.

### 3. Seguridad en la Interfaz
Si no hay sesión iniciada, los componentes `BookAdd` y `BookImport` desaparecen de la pantalla para evitar errores y mejorar la experiencia.

¡Tu catálogo ya es una plataforma multiusuario completa! 🚀

---

## 🔐 Paso 4: Edición y Seguridad Avanzada (CRUD Completo)

Hemos completado el ciclo de vida de los libros añadiendo edición y asegurando que nadie pueda tocar lo que no es suyo.

### 1. Control de Permisos en el Servidor
No basta con ocultar botones en el frontend; el backend (`BookController.php`) ahora es el que manda:
- **Borrado Protegido**: El endpoint `/book/delete/{isbn}` comprueba si el usuario logueado es el `owner`. Si no, devuelve un error **403 Forbidden**.
- **Nuevo Endpoint de Edición**: Creado `/book/edit/{isbn}` que procesa cambios (título, autor, fotos...) solo si eres el dueño o administrador.

> [!IMPORTANT]
> **Permisos de Administrador**: Los usuarios con el rol `ROLE_ADMIN` tienen permisos "maestros". Pueden editar y borrar cualquier libro del catálogo, aunque no sean los propietarios originales.

### 2. Edición Dinámica en React
Para que la edición sea cómoda, hemos implementado:
- **Botones Inteligentes**: `BookCard.jsx` compara el email del usuario con el campo `owner` del libro, o verifica si el usuario es administrador (`ROLE_ADMIN`). Si se cumple alguna, muestra los botones de **Editar** e **Eliminar**.
- **Ventana de Edición (Modal)**: Un nuevo componente `BookEdit.jsx` que se abre sobre la pantalla, permitiendo corregir datos o añadir más imágenes sin perder tu posición en la lista.

### 3. Flexibilidad en los Nombres
Hemos actualizado la validación de la entidad `Book` para permitir **puntos** en el nombre del autor, facilitando la entrada de autores como "J.K. Rowling".

---
**Puntos clave aprendidos**:
- Validar siempre la propiedad en el **Backend** (la seguridad "de verdad").
- Usar estados en React para controlar ventanas modales (`editingBook`).
- La importancia de devolver información de propiedad en los JSON (`owner` email).

---

## ⚙️ Paso 5: Desacoplamiento de Entorno y Aislamiento de Sesión

Antes de estos cambios, el código tenía **URLs y puertos grabados a fuego** en varios archivos. Si cambiabas el puerto, tenías que editar múltiples sitios. Además, todos los proyectos Symfony compartían la misma cookie de sesión (`PHPSESSID`), lo que causaba conflictos de login entre proyectos.

> [!NOTE]
> Al hacer un `checkout` a este commit, no notarás ningún cambio visual ni funcional en la aplicación. Este paso se centra exclusivamente en construir los **pilares de infraestructura** necesarios para que todo lo que viene después sea escalable y profesional.


### 1. Variables de Entorno (`.env` y `frontend/.env`)

Se centralizan las URLs en un único lugar:

```env
# .env (Symfony)
FRONTEND_URL=http://localhost:5173

# frontend/.env (Vite/React)
VITE_BACKEND_URL=http://localhost:8000
```

Si cambias el puerto, solo editas estos archivos. El resto del código se adapta solo.

### 2. Puente entre `.env` y los `.yaml` de Symfony (`services.yaml`)

Los archivos `.yaml` de Symfony no pueden leer el `.env` directamente. `services.yaml` actúa de puente:

```yaml
parameters:
    frontend_url: '%env(FRONTEND_URL)%'   # %env()% le dice a Symfony que lea del .env
```

### 3. Redirección Dinámica tras Login (`security.yaml`)

```yaml
# Antes (URL hardcodeada):
default_target_path: 'http://localhost:5173'

# Ahora (lee del .env a través de services.yaml):
default_target_path: '%frontend_url%'
```

### 4. Proxy Dinámico en React (`vite.config.js`)

El proxy de Vite redirige las peticiones `/api/*` al backend usando la variable de entorno en lugar de un puerto fijo.

En React, las variables de entorno de Vite se usan así:

```js
import.meta.env.VITE_BACKEND_URL  // → "http://localhost:8000"

// Ejemplo de uso en JSX:
<a href={`${import.meta.env.VITE_BACKEND_URL}/logout`}>Cerrar sesión</a>
// Resultado: <a href="http://localhost:8000/logout">Cerrar sesión</a>
```

> **Regla importante**: En Vite, todas las variables de entorno **deben empezar por `VITE_`** para ser accesibles en el código del navegador. Las que no tienen ese prefijo se ignoran por seguridad.

### 5. Nombre Único de Sesión (`framework.yaml`)

```yaml
session:
    # Sin esto, todos los proyectos Symfony del mismo PC usan la cookie "PHPSESSID"
    # y el navegador mezcla las sesiones entre proyectos.
    name: APP_SESSION_LIBRERIA

    handler_id: null       # Usa el handler nativo de PHP (guarda en /var/lib/php/sessions del SO Linux)
    cookie_secure: auto    # HTTPS en producción, HTTP en local automáticamente
    cookie_samesite: lax   # Protección básica contra ataques CSRF
```

**Puntos clave aprendidos**:
- Nunca escribas URLs o puertos directamente en el código. Usa variables de entorno.
- En Symfony, la cadena de configuración es: `.env` → `services.yaml` (parámetros) → uso en `security.yaml`, etc.
- En React/Vite, todas las variables deben empezar por `VITE_` y se acceden con `import.meta.env.VITE_NOMBRE`.
- Un nombre de sesión único por proyecto evita que el navegador confunda las cookies entre proyectos.

---

## 👤 Paso 6: Perfil de Usuario (Foto y Descripción)

Hemos mejorado la entidad `User` para que los usuarios no sean solo un email, sino que tengan una "identidad" dentro de la app.

### 1. Mejoras en la Entidad y el Formulario

- **Campos nuevos**: Añadimos `photo` (texto para la ruta) y `description` (texto largo) a `User.php`.
- **UserType**: En el formulario de registro, el campo `photo` es de tipo `FileType`. No está "mapeado" directamente (`'mapped' => false`) porque no guardamos el objeto del archivo en la base de datos, sino solo el **texto de su ruta**. Esto nos da control total sobre cómo y dónde guardar el archivo antes de persistir el usuario.
- **Validación**: Hemos puesto restricciones para que las fotos no pesen más de 2MB y sean formatos válidos (JPG, PNG, WEBP).

### 2. Lógica de Subida (`UserController.php`)

Cuando un usuario se registra con una foto, el controlador intercepta el archivo antes de que Symfony intente guardarlo:
1. Extrae el archivo del formulario usando `$registration_form->get('photo')->getData()`.
2. Genera un nombre único con `uniqid()` y mantiene la extensión original.
3. Mueve el archivo físicamente a `public/uploads/profiles/`.
4. Guarda la **ruta pública** en la base de datos (ej: `/uploads/profiles/foto123.jpg`).
5. **Redirección**: Al terminar, redirigimos al login (`app_login`) para que el usuario pueda estrenar su cuenta.

### 3. Compartiendo la Info con React (`AuthController.php`)

Para que React pueda mostrar la foto de perfil en el header, el JSON de `/api/user/status` ahora incluye el campo `photo`. Si el usuario no tiene foto, el campo será `null`.

```json
{
  "user": {
    "email": "antonio@a.com",
    "photo": "/uploads/profiles/foto123.jpg",
    "description": "Hola, soy Antonio"
  }
}
```

**Puntos clave aprendidos**:
- `mapped => false` en formularios permite manejar datos que no van directos a una columna (como procesar una imagen antes de guardar su ruta).
- **Serialización**: Hemos eliminado el método `__serialize` manual de la entidad `User`. En Symfony moderno, si no necesitas una lógica muy específica, es mejor dejar que el framework maneje la serialización de la sesión para evitar que el usuario se "desloguee" al cambiar campos de la entidad.
- **Base de Datos**: Al añadir campos a una entidad, siempre hay que generar la migración (`make:migration`) y ejecutarla (`migrations:migrate`).
- **Limpiar Caché**: A veces, tras cambiar la estructura del usuario en la sesión, conviene usar `php bin/console cache:clear`.

---

## 🎨 Paso 7: Rediseño de UI Limpio y Profesional

Hemos actualizado los formularios de acceso para que tengan un aspecto moderno, limpio y profesional, sin necesidad de elementos distractores.

### 1. Tipografía y Estructura (`base.html.twig`)
En lugar de cargar fuentes externas, hemos optado por una **pila de fuentes del sistema** (System Font Stack). Esto garantiza que la aplicación cargue instantáneamente (0ms de latencia de red para la fuente) y se vea integrada con el sistema operativo del usuario. Además, hemos centrado todo el contenido en pantalla para que la experiencia sea cómoda tanto en PC como en móviles.

### 2. Estética "Clean & Minimal" y CSS Externo
En lugar de colores chillones y estilos incrustados, hemos optado por:
- **Separación de responsabilidades**: Hemos movido todo el diseño a `public/css/auth.css`. Esto mejora el rendimiento (gracias a la caché del navegador) y mantiene el código Twig mucho más limpio.
- **Colores sobrios**: Fondo gris muy claro (`#f8fafc`) y tarjetas blancas puras.
- **Micro-interacciones**: Bordes que cambian de color suavemente al escribir y botones con transiciones profesionales.
- **Jerarquía visual**: Títulos claros y campos con buen espaciado para evitar la fatiga visual.

### 3. Redirecciones Inteligentes (Control de Sesión)
Hemos hecho que el `LoginController` sea más "consciente" del estado del usuario:
- **Evitar bucles innecesarios**: Hemos añadido una comprobación inicial: `if ($this->getUser())`. Si un usuario que ya tiene sesión abierta intenta entrar en `/login`, Symfony lo detecta y lo manda directamente al frontend de React. Esto evita que los usuarios vean el formulario de login una y otra vez si ya están dentro.
- **Centralización de URLs**: Tanto el registro como el login utilizan ahora el parámetro `frontend_url` de `services.yaml`. Al usar `$this->getParameter('frontend_url')`, desacoplamos el código de las URLs físicas del servidor.

Esto significa que si mañana cambias el puerto de tu frontend (por ejemplo, de 5173 a 3000), solo tendrás que tocar el archivo `.env` y toda la lógica de redirección de PHP se actualizará sola.

**Puntos clave aprendidos**:
- Menos es más: Un buen uso del espacio en blanco y una tipografía adecuada valen más que mil efectos.
- La consistencia visual en los inputs y botones ayuda al usuario a entender la aplicación.
- Centralizar las URLs de redirección es vital para que el proyecto sea escalable y fácil de desplegar.

## ⚛️ Paso 8: Refactorización de Estilos en React (Clean Code)

Para que el frontend sea tan profesional como el backend, hemos eliminado todos los estilos "inline" (`style={{...}}`) de los componentes React y los hemos centralizado en `App.css`.

### 1. Clases de Utilidad y Estados
En lugar de definir colores y tamaños directamente en el JSX, ahora usamos clases reutilizables:
- **`.error-text`**: Unifica el estilo de todos los mensajes de validación (rojo, pequeño, legible).
- **`.input-readonly`**: Define un aspecto visual claro (gris suave) para campos que no se pueden editar, como el ISBN.
- **Estados Dinámicos**: Para botones como "Mis Libros", usamos clases dinámicas (`.active`, `.inactive`) que cambian el diseño según el estado de React sin ensuciar la lógica del componente.

### 2. Ventajas del Refactor
- **Mantenibilidad**: Si mañana quieres cambiar el color de "error" de toda la app, solo tocas una línea en el CSS, no 10 componentes distintos.
- **Legibilidad**: El código JSX queda mucho más limpio al quitarle bloques de objetos de estilo complejos.
- **Separación de Responsabilidades**: El componente se encarga de la lógica; el CSS, del diseño.

**Puntos clave aprendidos**:
- NUNCA uses estilos inline en producción salvo para valores que se calculan en tiempo real (como la posición de un scroll).
- Las clases CSS con nombres descriptivos (BEM o similar) hacen que el equipo trabaje mejor.

## 🏁 Paso 9: Integración Final y Pulido

Hemos llegado al final del proceso de profesionalización. En este último paso, hemos sincronizado todas las piezas para que la experiencia de usuario sea fluida y robusta.

### 1. Sincronización del Buscador (Full-Stack)
Hemos integrado el buscador de React con el backend de Symfony de forma eficiente:
- **Backend**: El `BookController` ahora tiene un endpoint dedicado `/book/search/{query}` que utiliza Query Builder para buscar por título y autor simultáneamente.
- **Frontend**: Los resultados se actualizan en el estado de React, manteniendo la consistencia visual y la velocidad de respuesta.

### 2. Pulido de UI y Sesión
- **Consistencia Visual**: Hemos terminado de limpiar los estilos de la lista de libros (`BookCard.jsx`), asegurando que toda la aplicación siga el mismo sistema de diseño basado en clases.
- **Persistencia**: La app ahora es consciente de quién es el usuario en cada renderizado, ocultando o mostrando las opciones de edición solo a los propietarios legítimos.

### 3. Conclusión del Proyecto
Este flujo de trabajo basado en **Commits Atómicos** y **Documentación Paso a Paso** garantiza que:
1.  El código sea fácil de revisar (Code Review).
2.  El historial sea legible (Git History).
3.  Cualquier nuevo desarrollador pueda entender qué se hizo simplemente leyendo el `tutorial_repaso.md`.

---

## 🔗 Paso 10: Funcionalidad de Compartir y APIs Nativas (Web Share API)

Para mejorar la fluidez de navegación y la interacción del usuario con los libros del catálogo, hemos implementado una funcionalidad de "Compartir" utilizando APIs nativas del navegador.

### 1. Web Share API (`navigator.share`)
Hemos introducido el uso de `navigator.share()`, que invoca el menú de compartir nativo del dispositivo del usuario (muy útil especialmente en dispositivos móviles como Android o iOS).
- Le pasamos un objeto con el **título**, el **texto** y opcionalmente la **URL** de la web oficial del libro si la tiene registrada en la base de datos.

### 2. Fallbacks (Plan de Respaldo)
Puesto que `navigator.share` no está soportado en todos los entornos (por ejemplo, en la mayoría de navegadores de escritorio en Linux), hemos implementado un comportamiento condicional (`if/else`):
- Si la API no está disponible, el sistema utiliza la API del portapapeles (`navigator.clipboard.writeText()`) para copiar la información del libro automáticamente y muestra un `alert()` para confirmar la acción al usuario.

### 3. Evitando compartir el Localhost
Nos dimos cuenta de que **no tiene sentido compartir un enlace a `localhost`**, ya que nadie externo a tu red podrá abrirlo. Por lo tanto, hemos optimizado el código para que el enlace a compartir sea dinámico: si el libro tiene un `website` oficial, se comparte ese enlace; si no, solo se comparte el título y el autor limpios.

**Puntos clave aprendidos**:
- Manejar la compatibilidad de APIs modernas del navegador usando condicionales (`if (navigator.share)`).
- Definir planes de contingencia (*fallbacks*) para que la aplicación nunca falle silenciosamente.
- Pensar desde la perspectiva del usuario final (UX) a la hora de decidir qué datos es útil compartir.

---

## 📑 Paso 11: Paginación Dinámica y Sincronización de Datos

Para que la aplicación sea escalable y profesional, no podíamos cargar todos los libros de golpe. Hemos implementado un sistema de paginación que divide el catálogo en "trozos" manejables.

### 1. El Motor en el Backend (`BookController.php`)
Hemos transformado el método `index` para que sea capaz de leer parámetros de la URL:
- **Cálculo del Offset**: Usamos `page` y `limit` para decirle a la base de datos exactamente dónde empezar a leer (por ejemplo, para la página 2 con límite 12, empezamos en el libro 13).
- **Metadatos**: El servidor ahora no solo devuelve libros, sino también el total de páginas disponibles (`total_pages`) y el número total de registros. Esto permite que React dibuje los botones necesarios.

### 2. Estados y Efectos en React (`App.jsx`)
La interfaz ahora es reactiva al cambio de página:
- **Estado `currentPage`**: Controla en qué página estamos. Cada vez que este número cambia, el `useEffect` dispara automáticamente una nueva petición al servidor.
- **Reseteo Inteligente**: Al filtrar por categorías o ver "Mis Libros", forzamos el total de páginas a 1 para limpiar los controles de navegación obsoletos.

### 3. Sincronización del Límite
Hemos conectado el estado `limit` de React directamente con la petición fetch:
```javascript
fetch(`/books?page=${page}&limit=${limit}`)
```
Esto asegura que el diseño (grid de 12 libros) y los datos del servidor estén siempre en perfecta armonía. Si cambias el diseño en React, el servidor se adapta solo.

### 4. Documentación del Código (`Pagination.jsx`)
Como parte de la profesionalización, hemos incluido comentarios detallados en el componente de paginación. Esto no solo ayuda a otros desarrolladores, sino que demuestra un control total sobre el flujo de datos: desde el bucle que genera los números de página hasta la lógica de los botones "Anterior" y "Siguiente".

**Puntos clave aprendidos**:
- Cómo usar `offset` y `limit` en el repositorio de Doctrine para optimizar consultas.
- La importancia de sincronizar los parámetros de diseño entre cliente y servidor.
- Mantener una interfaz limpia mediante la eliminación de llamadas redundantes a la API.

---

## 🐛 Paso 12: Refinamiento Lógico de Filtros y Búsqueda (Solución de Bugs)

Al integrar la paginación, detectamos y solucionamos **dos errores lógicos clásicos** en Single Page Applications (SPAs) relacionados con el estado de los componentes.

### 1. El Problema de las Categorías "Desaparecidas"
**El Bug:** Los menús desplegables extraían las categorías de la variable de estado `books`. Como introdujimos la paginación, `books` pasó a tener solo 12 elementos. Si en esos 12 elementos no había ningún libro de "Shonen", la categoría desaparecía del filtro. Al seleccionar "Fantasía", el menú se encogía a solo "Fantasía".
**La Solución (Profesional):** En lugar de pedir 1000 libros para extraer sus datos, hemos creado un endpoint específico en el backend (`/api/books/filters`). Este endpoint realiza una consulta optimizada a la base de datos para devolver directamente las categorías y años únicos. Es una solución mucho más escalable y profesional que ahorra ancho de banda, memoria y que si la aplicación crece, podrá seguir funcionando aunque haya millones de libros. Además, al usar la API, nos aseguramos de que siempre obtenemos los datos más recientes.  

### 2. La Pérdida de Reactividad al Añadir/Borrar
**El Bug:** Al meter `fetchFilters()` en un `useEffect` con dependencias vacías (`[]`), logramos que el menú cargase todas las categorías, pero **dejó de actualizarse en tiempo real**. Si añadías un libro con una categoría nueva, no aparecía en el menú hasta refrescar la página entera.
**La Solución:** Convertimos `fetchFilters` en una función asíncrona independiente en `App.jsx` y se la pasamos como *prop* a los componentes "hijos" que alteran datos:
- `BookAdd.jsx`: Al guardar un libro, ejecuta el callback `onBookAdded` definido en `App.jsx`, el cual se encarga de refrescar la lista y los filtros.
- `BookList.jsx` -> `BookCard.jsx`: Reciben la función `fetchFilters` por props para actualizar el menú lateral inmediatamente tras un borrado.
- `BookEdit.jsx`: Los filtros se refrescan automáticamente dentro de su función `onUpdate` tras confirmar una edición.

### 3. Sincronización de Búsqueda
**El Bug:** Al buscar un libro por texto (ej: "Harry Potter"), la aplicación mostraba los resultados pero los controles de paginación de abajo seguían presentes y rotos.
**La Solución:** Modificamos la función `handleSearch` para que invoque `setTotalPages(1)`. De este modo, la paginación se "esconde" inteligentemente cuando el usuario hace una búsqueda específica. Además, forzamos un retorno a la primera página (`setCurrentPage(1)`) cada vez que el usuario limpia los filtros.

**Puntos clave aprendidos**:
- En React, el estado en pantalla no siempre debe ser la única fuente de la verdad para generar filtros.
- Pasar funciones de recarga (`fetchFilters`) hacia los componentes hijos es un patrón muy limpio para mantener el estado global sincronizado sin usar herramientas complejas como Redux.
- Al cambiar la forma en la que una aplicación obtiene sus datos (como añadir paginación), siempre hay que auditar las funciones secundarias (búsqueda, filtros) para ver cómo les afecta el nuevo flujo.
- Crear endpoints específicos para metadatos (como una lista de categorías) es mucho más eficiente que filtrar grandes volúmenes de datos en el cliente.

---

## 🧠 Paso 13: Sincronización de Estados y Componentes Controlados

Durante las pruebas finales, descubrimos un bug clásico de desincronización de estado en React. Si el usuario buscaba una categoría, luego pulsaba "Todos los libros" y después pasaba a la página 2, la aplicación "se volvía loca" y volvía a mostrar libros de la categoría antigua.

### 1. El Problema del "Cerebro" Desincronizado
**El Bug:** El botón "Todos los libros" hacía una petición `fetch` directa al servidor, pero **no actualizaba el estado central** de los filtros (`currentFilter`). Por lo tanto, el `useEffect` (el motor reactivo) seguía creyendo que la categoría antigua estaba activa.
**La Solución:** En lugar de hacer una petición manual, cambiamos el botón para que simplemente "resetee el cerebro":
```javascript
// Al pulsar "Todos los libros"
setCurrentFilter({ type: 'all', value: null });
setCurrentPage(1);
```
Al cambiar el estado de React, el `useEffect` detecta automáticamente el cambio y se encarga de hacer la petición correcta, manteniendo todo sincronizado.

### 2. Componentes Controlados (Selects Rebeldes)
**El Bug:** Aunque pulsáramos "Todos los libros", las casillas desplegables (`<select>`) seguían mostrando visualmente la categoría antigua (ej: "Dark fantasy").
**La Solución (Componentes Controlados):** En React, la mejor práctica es que los *inputs* sean "esclavos" del estado. Para ello, forzamos la propiedad `value` de las casillas desplegables para que lean directamente de `currentFilter`:
```javascript
<select value={currentFilter.type === 'category' ? currentFilter.value : "all"}>
```
Con esto, si el cerebro (estado) cambia a `"all"`, la casilla está obligada a cambiar visualmente a "Todas las categorías" al instante.

**Puntos clave aprendidos**:
- **Single Source of Truth (Única Fuente de la Verdad)**: Nunca intentes actualizar la vista haciendo un `fetch` directo si tienes un `useEffect` escuchando un estado. Actualiza el estado y deja que React haga el resto.
- **Componentes Controlados**: Los elementos de formulario en React siempre deben tener un `value` atado a un estado para que no se desincronicen visualmente.
