import type { BirdImage } from "../data/types";

interface BirdImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
    image: BirdImage;
    hideAttribution?: boolean;
    doNotFit?: boolean;
    imageSize?: number; // in pixels
}

export function BirdImage({ image, hideAttribution, doNotFit, imageSize, ...props }: BirdImageProps) {
    const transform = `
        scale(${image.fit?.scale ?? 1})
        translate(${(image.fit?.offsetX ?? 0) * 50}%, ${(image.fit?.offsetY ?? 0) * 50}%)
        `;
    return (
        <div className="relative w-full h-full overflow-hidden">
            <img
                src={`${image.url.startsWith("http") ? image.url : `${import.meta.env.VITE_BACKEND_URL}${image.url}`.replace("uploads", "image")}?${imageSize ? `h=${imageSize}` : ""}`}
                alt={image.description}
                {...props}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                    ...props.style,
                    overflow: "visible",
                    objectPosition: "center",
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    transform: doNotFit ? undefined : transform,
                }}
            />
            {(image.author || image.license) && !hideAttribution && (
                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs p-1 px-2 w-full">
                    {image.author && (
                        <span>
                            Foto von: {image.author}
                            {image.license ? ". " : ""}
                        </span>
                    )}
                    {image.license && <span>Lizenz: {image.license}</span>}
                </div>
            )}
        </div>
    );
}
