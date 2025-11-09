import { useState } from "react";
import QRCodeIcon from "../assets/icons/qr.svg?react";
import { QRCodeModal } from "./modals/QRCodeModal";
import { Button } from "./Button";

export function QRCodeButton() {
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    setShowQRCodeModal(true);
                }}
                variant="subdue"
                className="mb-2 rounded-xl w-10 h-10"
            >
                <QRCodeIcon className="w-6 h-6" />
            </Button>
            <QRCodeModal
                open={showQRCodeModal}
                onClose={() => {
                    setShowQRCodeModal(false);
                }}
            />
        </>
    );
}
