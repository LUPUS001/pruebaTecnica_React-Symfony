import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargamos las variables de entorno del directorio actual
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/book': { target: backendUrl, changeOrigin: true },
        '/books': { target: backendUrl, changeOrigin: true },
        '/images': { target: backendUrl, changeOrigin: true },
        '/uploads': { target: backendUrl, changeOrigin: true },
        '/api': { target: backendUrl, changeOrigin: true }
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