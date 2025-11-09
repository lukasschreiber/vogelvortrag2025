import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import { BirdImage as BirdImageComp } from "./BirdImage";
import XMarkIcon from "../assets/icons/xmark.svg?react";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { createPortal } from "react-dom";
import type { BirdImage } from "../data/types";

type LightboxProps = {
    images: BirdImage[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
};

export function Lightbox({ images, initialIndex = 0, open, onClose }: LightboxProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-9999">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white text-3xl font-bold cursor-pointer hover:text-gray-300"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>

            <Swiper
                modules={[Navigation, Pagination, Keyboard]}
                navigation
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                initialSlide={initialIndex}
                className="w-full h-full"
                // onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="flex justify-center items-center w-full h-full">
                            <BirdImageComp image={img} doNotFit className="max-w-full max-h-full object-contain!" />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>,
        document.body
    );
}
