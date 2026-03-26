import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/book": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
            "/books": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
            "/images": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
        },
    },
});
