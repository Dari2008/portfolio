import type { CSSProperties } from "react";
import { ImageLoadManager, Statics } from "../../utils";
import AsyncImage from "../asyncImage/AsyncImage";
import type { Technology } from "../project/Project";
import { resolveProgrammingLanguageIcon, THEME_COLORED_IMAGES } from "../project/resolvers";
import "./TechnologyImage.scss";


export default function TechnologyImage({ technology, imageLoader, showThemeColoredImage, scale = 1 }: { technology: Technology; imageLoader?: ImageLoadManager; showThemeColoredImage?: boolean; scale?: number }) {

    const imageStyle = {
        width: `calc(${Statics.TECHNOLOGIE_SIZE} * ${scale})`,
        height: `calc(${Statics.TECHNOLOGIE_SIZE} * ${scale})`,
    } as CSSProperties;

    return <>
        <AsyncImage srcFunc={async () => { return await resolveProgrammingLanguageIcon(technology as Technology) }} className={`technologyImage ${showThemeColoredImage ? "hasThemeColoredImage" : ""}`} style={imageStyle} alt={technology + " logo"} onLoad={imageLoader?.onLoad} onError={imageLoader?.onError} ref={imageLoader?.onRefAdd} />
        {
            showThemeColoredImage && THEME_COLORED_IMAGES[technology as Technology] && <img className="themeColor" src={THEME_COLORED_IMAGES[technology as Technology]} style={imageStyle} alt={technology + " logo"} onLoad={imageLoader?.onLoad} onError={imageLoader?.onError} ref={imageLoader?.onRefAdd} />
        }
    </>

}