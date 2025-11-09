import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import type { DataSource } from "../data/DataSource";
import { useSearchParams } from "react-router";

interface BirdDataContextProps {
    dataSource: DataSource;
    isEditingAllowed: boolean;
    stopEditing: () => void;
    editKey: string | null;
}

const BirdDataContext = createContext<BirdDataContextProps | undefined>(undefined);
interface BirdDataProviderProps {
    dataSource: DataSource;
    children: ReactNode;
}

export const BirdDataProvider: React.FC<BirdDataProviderProps> = ({ dataSource, children }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const editKey = useMemo(() => {
        return searchParams.get("edit");
    }, [searchParams]);

    const isEditingAllowed = useMemo(() => {
        console.log("BirdDataProvider: checking if editing is allowed with editKey =", editKey, import.meta.env.VITE_EDIT_LINK_KEY);
        return editKey !== null && editKey === import.meta.env.VITE_EDIT_LINK_KEY;
    }, [editKey]);

    const stopEditing = () => {
        setSearchParams({});
    };

    return (
        <BirdDataContext.Provider
            value={{
                dataSource,
                isEditingAllowed,
                stopEditing,
                editKey,
            }}
        >
            {children}
        </BirdDataContext.Provider>
    );
};

export const useBirdData = (): BirdDataContextProps => {
    const context = useContext(BirdDataContext);
    if (!context) {
        throw new Error("useBirdData must be used within a BirdDataProvider");
    }
    return context;
};
