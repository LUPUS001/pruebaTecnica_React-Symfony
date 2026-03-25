# Prueba Técnica: Integración React + Symfony

Este repositorio contiene la integración completa de una **API REST en Symfony** con un frontend moderno en **React (SPA)**.

## 📁 Estructura del Proyecto

El proyecto está organizado de forma unificada pero con una clara separación de responsabilidades:

- **Raíz (`/`)**: Aplicación Backend desarrollada en **Symfony**. 
- **Carpeta `frontend/`**: Aplicación Frontend desarrollada en **React (Vite)**.

## 📚 Repositorio Original del Frontend

La parte de React fue desarrollada de forma independiente y luego integrada en este repositorio **preservando todo su historial de commits**. Puedes consultar el repositorio original dedicado exclusivamente al frontend en el siguiente enlace:

🔗 [https://github.com/LUPUS001/pruebaT_React](https://github.com/LUPUS001/pruebaT_React)

## 🛠️ Requisitos e Instalación

1. **Backend**:
   - Ejecutar `composer install`.
   - Levantar el servidor: `symfony serve` o `php bin/console server:start`.
   - Importar datos base: `php bin/console app:import-books` o visita `/import-books`.

2. **Frontend**:
   - Entrar en `cd frontend`.
   - Ejecutar `npm install`.
   - Levantar desarrollo: `npm run dev`.

---
*Proyecto realizado como parte de una prueba técnica para la posición de desarrollador.*
