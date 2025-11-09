import { Outlet } from "react-router";
import { BirdDataProvider } from "./contexts/BirdDataContext";
import { PythonDataSource } from "./data/PythonDataSource";

export function RootLayout() {
    return (
        <BirdDataProvider dataSource={new PythonDataSource(import.meta.env.VITE_BACKEND_URL)}>
            <Outlet />
        </BirdDataProvider>
    );
}
