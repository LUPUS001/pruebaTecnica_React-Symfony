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
Como React corre en el puerto `5173` y Symfony en el `8000`, el navegador los ve como mundos distintos. Hemos configurado un **Proxy** para que todas las peticiones que empiecen por `/api` se envíen automáticamente al servidor de Symfony, compartiendo las cookies de sesión.

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

