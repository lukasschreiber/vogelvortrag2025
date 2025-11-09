import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default ({ mode }: any) => {
    // Only load env manually in development
    const isDev = mode === "development";
    const env = isDev ? loadEnv(mode, "../", "") : process.env;

    return defineConfig({
        plugins: [react(), tailwindcss(), svgr()],
        define: {
            // Use env vars differently depending on mode
            "import.meta.env.VITE_BACKEND_URL": JSON.stringify(isDev ? env.BACKEND_URL : process.env.VITE_BACKEND_URL),
            "import.meta.env.VITE_EDIT_LINK_KEY": JSON.stringify(
                isDev ? env.EDIT_LINK_KEY : process.env.VITE_EDIT_LINK_KEY
            ),
        },
    });
};
