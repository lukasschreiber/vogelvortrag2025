import { Outlet } from "react-router";
import { BirdDataProvider } from "./contexts/BirdDataContext";
import { PythonDataSource } from "./data/PythonDataSource";
import { useMemo } from "react";
import { SettingsProvider } from "./contexts/SettingsContext";

export function RootLayout() {
    const dataSource = useMemo(() => {
        return new PythonDataSource(import.meta.env.VITE_BACKEND_URL);
    }, []);

    return (
        <SettingsProvider>
            <BirdDataProvider dataSource={dataSource}>
                <Outlet />
            </BirdDataProvider>
        </SettingsProvider>
    );
}
