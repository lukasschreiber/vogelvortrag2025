import ZoomPlusIcon from "../assets/icons/zoom-plus.svg?react";
import ZoomMinusIcon from "../assets/icons/zoom-minus.svg?react";

interface ZoomButtonsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
}

export function ZoomButtons({ onZoomIn, onZoomOut }: ZoomButtonsProps) {
    return (
        <div className="flex flex-col">
            <button
                onClick={() => onZoomIn()}
                className="rounded-t-xl bg-gray-200 w-10 h-10 font-lg font-bold border-b border-gray-300 cursor-pointer flex items-center justify-center text-gray-800"
            >
                <ZoomPlusIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => onZoomOut()}
                className="rounded-b-xl bg-gray-200 w-10 h-10 font-lg font-bold cursor-pointer flex items-center justify-center text-gray-800"
            >
                <ZoomMinusIcon className="w-6 h-6" />
            </button>
        </div>
    );
}
