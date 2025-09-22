import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    server: {
        fs: {
            allow: [
                "./client",
                "./shared",
                ".",
                "C:/Users/abhis/OneDrive/Desktop/game for nasa/builder-vibe-forge",
            ],
        },
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./client"),
            "@shared": path.resolve(__dirname, "./shared"),
        },
    },
});