import { useRef, useState } from "react";
import { ImageLoadManager } from "../../utils";
import "./ImageViewer.scss";

export default function ImageViewer({ images, className, imageLoader }: { images: Images, className?: string, imageLoader: ImageLoadManager }) {
    const [currentIndexVisible, setCurrentIndexVisible] = useState(0);
    const [lastIndex, setLastIndex] = useState(-1);
    const projectImagesElement: React.RefObject<null | HTMLDivElement> = useRef(null);


    return <div className={"imageViewer-wrapper next show " + (className ? className : "")} data-numpictures={images.length} ref={projectImagesElement}>
        <div className="next fa fa-angle-right" onClick={(e) => onChange(e, 1)}></div>
        <div className="previous fa fa-angle-left" onClick={(e) => onChange(e, -1)}></div>
        <div className="currentIndexOf">{currentIndexVisible + 1} / {images.length}</div>
        {
            images.map((image, index) => {
                const paths = image.paths.sort((a, b) => {
                    return b.minWidth - a.minWidth;
                });
                return (
                    <div key={index} className="image" data-animate={(lastIndex == index) + ""} data-visible={(currentIndexVisible == index) + ""}>
                        <picture>
                            {
                                paths.map(path => {
                                    return <source key={path.path} srcSet={path.path} media={`(width > ${path.minWidth}px) ${path.maxWidth ? `and (width <= ${path.maxWidth}px)` : ``}`} />
                                })
                            }
                            <img src={typeof image == "string" ? image : image.defaultPath} alt={typeof image != "string" ? image.description : ""} onLoad={imageLoader.onLoad} onError={imageLoader.onError} ref={imageLoader.onRefAdd} />
                            {image.description && <span className="subtitle">{image.description}</span>}
                        </picture>
                    </div>
                );
            })
        }
    </div>;


    function onChange(e: React.MouseEvent<HTMLDivElement>, numberToAdd: number) {
        (e.target as HTMLElement)?.classList.add("animate");
        (e.target as HTMLElement)?.addEventListener("transitionend", () => {
            (e.target as HTMLElement)?.classList.remove("animate");
        }, { once: true });
        let newIndex = currentIndexVisible + numberToAdd;
        if (numberToAdd > 0) {
            projectImagesElement.current?.classList.remove("prev");
            projectImagesElement.current?.classList.add("next");
        } else if (numberToAdd < 0) {
            projectImagesElement.current?.classList.remove("next");
            projectImagesElement.current?.classList.add("prev");
        }


        setCurrentIndexVisible(clamp(newIndex, 0, images.length));
        setLastIndex(clamp(newIndex - numberToAdd, 0, images.length));
    }

}

function clamp(val: number, min: number, max: number): number {
    if (val < min) return max - 1;
    if (val >= max) return min;
    return val;
}

export type Images = Image[];

export type Image = {
    description: string;
    paths: Path[];
    defaultPath: string;
}

export type Path = {
    minWidth: number;
    maxWidth: number;
    path: string;
}