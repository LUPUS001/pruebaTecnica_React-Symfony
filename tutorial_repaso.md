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

## 🎓 Conceptos Clave aprendidos
- **Sesiones Persistentes**: Aunque React se recargue, la sesión se mantiene en el navegador.
- **Redirecciones de Servidor**: Usando `default_target_path` en Symfony, podemos controlar a dónde va el usuario tras identificarse.
- **Proxies de Desarrollo**: Fundamentales para saltarse problemas de CORS y compartir cookies entre puertos distintos.
- **Componentes Reactivos**: La UI cambia automáticamente cuando el estado `user` se rellena.


¡Tu conexión entre Symfony y React ya es funcional! 🚀
