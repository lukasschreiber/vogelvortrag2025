import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default ({ mode }: any) => {
    const env = loadEnv(mode, "../", "");

    return defineConfig({
        plugins: [react(), tailwindcss(), svgr()],
        define: {
            "import.meta.env.VITE_BACKEND_URL": JSON.stringify(env.BACKEND_URL),
            "import.meta.env.VITE_EDIT_LINK_KEY": JSON.stringify(env.EDIT_LINK_KEY),
        },
    });
};
