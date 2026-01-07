import type { ReactNode } from "react";
import type { ImageLoadManager } from "../../utils";

type Props = {
    sizes: number[];
    path: string;
    suffix: string;
    endStr?: string;
    extension: string;
    alt?: string;
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    ref?: React.RefObject<HTMLImageElement> | ((el: HTMLImageElement) => void);
    children?: ReactNode;
    imageLoader?: ImageLoadManager;
    className?: string;
}

export function MultiResImage({
    sizes,
    path,
    suffix,
    endStr = "-landscapr",
    extension,
    alt,
    onLoad,
    onError,
    children,
    ref,
    imageLoader,
    className
}: Props) {
    const sortedSizes = sizes.sort();
    return <picture className={className}>
        {
            sortedSizes.map((size, i) => {
                return <source key={size} srcSet={`${path}${suffix}-${size}${endStr ? endStr : ""}.${extension}`} media={`(width > ${size}px) ${i != sortedSizes.length - 1 ? `and (width <= ${sortedSizes[i + 1]}px)` : ``}`} />
            })
        }
        <img src={path + suffix + "." + extension} alt={alt} onLoad={onLoad ?? imageLoader?.onLoad} onError={onError ?? imageLoader?.onError} ref={ref ?? imageLoader?.onRefAdd} />
        {children}
    </picture>;
}