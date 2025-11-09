import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GalleryPage } from "./pages/GalleryPage.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { MapPage } from "./pages/MapPage.tsx";
import { RootLayout } from "./Root.tsx";

const router = createBrowserRouter([
    {
        element: <RootLayout />, // <--- provides EditContext to all children
        children: [
            { path: "/", element: <GalleryPage /> },
            { path: "/map", element: <MapPage /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
