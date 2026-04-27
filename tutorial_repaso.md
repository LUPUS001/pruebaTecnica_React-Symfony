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
- **UserType**: En el formulario de registro, el campo `photo` es de tipo `FileType`. No está "mapeado" directamente (`'mapped' => false`) porque no guardamos el archivo en la base de datos, sino su **ruta**.
- **Validación**: Hemos puesto restricciones para que las fotos no pesen más de 2MB y sean formatos válidos (JPG, PNG, WEBP).

### 2. Lógica de Subida (`UserController.php`)

Cuando un usuario se registra con una foto, el servidor hace lo siguiente:
1. Extrae el archivo del formulario.
2. Genera un nombre único (para que dos fotos no choquen).
3. Mueve el archivo a `public/uploads/profiles/`.
4. Guarda la **ruta pública** en la base de datos (ej: `/uploads/profiles/foto123.jpg`).

### 3. Compartiendo la Info con React (`AuthController.php`)

Para que React pueda mostrar la foto de perfil arriba a la derecha, el JSON de `/api/user/status` ahora incluye estos campos:

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
- `mapped => false` en formularios Symfony permite manejar archivos manualmente antes de guardar la entidad.
- Las fotos nunca se guardan en la base de datos (sería muy ineficiente), solo se guarda la ruta al archivo.
- Al actualizar la entidad `User`, a veces es necesario limpiar la caché de Symfony (`php bin/console cache:clear`) para que el sistema de seguridad reconozca los nuevos campos en la sesión.



