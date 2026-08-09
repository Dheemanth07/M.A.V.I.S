import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: false,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            "/socket.io": {
                target: "ws://localhost:5000",
                ws: true,
            },
        },
    },
    preview: {
        host: "0.0.0.0",
        port: 4173,
        strictPort: false,
    },
});
