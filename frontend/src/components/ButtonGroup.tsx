import React from "react";
import { Button } from "./Button";
import useLocalStorage from "../hooks/useLocalStorage";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import MenuIcon from "../assets/icons/menu.svg?react";

export default function CollapsibleButtonGroup({ children }: React.PropsWithChildren) {
    const [open, setOpen] = useLocalStorage("collapsible-button-group-open", false);

    return (
        <div className="fixed bottom-2 right-2 bg-white flex flex-col items-center p-2 rounded-xl z-1000">
            {open && <div className="flex flex-col items-center w-full mb-2">{children}</div>}

            <Button onClick={() => setOpen(!open)} variant="subdue" className="rounded-xl w-10 h-10">
                {open ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </Button>
        </div>
    );
}
