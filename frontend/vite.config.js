import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El proxy es esencial por dos motivos:
    // 1. Evita problemas de CORS *1(Cross-Origin Resource Sharing) al unificar React (5173) y Symfony (8000) bajo el mismo origen.
    // 2. Permite que las Cookies de la sesión de Symfony se envíen automáticamente en cada petición.
    proxy: {
      // Redirigimos las rutas de libros y recursos estáticos al backend:
      '/book': { target: 'http://localhost:8000', changeOrigin: true },
      '/books': { target: 'http://localhost:8000', changeOrigin: true },
      '/images': { target: 'http://localhost:8000', changeOrigin: true },

      // Todas las rutas de autenticación y datos de usuario:
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})

// Recordemos que esto es lo que permite que se comuniquen los frameworks, ya que React se ejecuta en el puerto 5173 y Symfony en el 8000 simulamos que ambos corren en el mismo servidor
// Con esto conseguimos que cuando hagamos una petición a /book, /books, /images o /api, se redirija a nuestro servidor de Symfony

/*
*1
  CORS es la barrera que impide que páginas web externas roben datos de tus APIs, y el Proxy es el "túnel seguro" que usamos en desarrollo 
  para saltarnos esa barrera sin tener que configurar reglas complejas en los servidores.
  El CORS es una medida de seguridad del navegador que prohíbe peticiones entre diferentes puertos (como el 5173 de React y el 8000 de Symfony). 
  Al usar un proxy, hacemos creer al navegador que todo viene del mismo sitio.
*/