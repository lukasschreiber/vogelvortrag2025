import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "../Modal";

interface QRCodeModalProps {
    open: boolean;
    onClose: () => void;
}

export function QRCodeModal({ open, onClose }: QRCodeModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="QR-Code scannen" size="lg">
            <div className="flex flex-col items-center gap-8">
                <QRCodeCanvas
                    value={window.location.origin}
                    size={1024}
                    className="w-lg! h-128! aspect-square!"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                />
                <p className="text-center text-gray-800">
                    Scannen Sie diesen QR-Code mit Ihrem Mobilgerät, um auf die mobile Version der
                    Vogelbeobachtungskarte zuzugreifen.
                </p>
                <p className="text-center text-lg font-bold text-gray-800">{`URL: ${window.location.origin}`}</p>
            </div>
        </Modal>
    );
}
