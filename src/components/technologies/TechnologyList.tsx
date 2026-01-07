import { useRef, useState, type CSSProperties } from "react";
import { PROGRAMMING_LANGUAGE_LINKS } from "../../data/Data";
import { ImageLoadManager, Statics } from "../../utils";
import { TECHNOLOGY_DISPLAY_NAME, type Technology } from "../project/Project";
import TechnologyImage from "./TechnologyImage";
import "./TechnologyList.scss";
import { loadALlImagesFromListWithEffect, loadALlLinksFromListWithEffect } from "../project/resolvers/ProgrammingLanguageResolver";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> &
{
    technologies: Technology[];
    hoverable?: boolean;
    showThemeColoredImage?: boolean;
    openBrowserOnClick?: boolean;
    imageLoader?: ImageLoadManager
    scale?: number;
};

export default function TechnologyList({
    technologies,
    imageLoader,
    showThemeColoredImage = true,
    hoverable = true,
    openBrowserOnClick = true,
    className,
    scale = 1,
    ...rest
}: Props) {

    const loadingAnimation = useLoadingAnimation();
    const [, forceRerender] = useState(0);
    const randomNumber = useRef(Math.random());
    loadALlImagesFromListWithEffect(loadingAnimation, technologies, "programmingLanguagesLoadingTechnologyList" + randomNumber.current, forceRerender);
    loadALlLinksFromListWithEffect(loadingAnimation, "programmingLinksLoadingTechnologyList" + randomNumber.current, forceRerender);

    const c = (className ?? "") + " technologyList";


    const listStyle = {
        width: `calc(${Statics.TECHNOLOGIE_SIZE} * ${scale} + (${Statics.TECHNOLOGIE_SIZE} * 0.1) * 2)`,
        height: `calc(${Statics.TECHNOLOGIE_SIZE} * ${scale} + (${Statics.TECHNOLOGIE_SIZE} * 0.1) * 2)`,
        flexBasis: `calc(${Statics.TECHNOLOGIE_SIZE} * ${scale} + (${Statics.TECHNOLOGIE_SIZE} * 0.1) * 2)`,
    } as CSSProperties;

    return <ul {...rest} className={c}>
        {
            technologies.map(tech => {
                return <li
                    className={"technology " + (hoverable ? "hover-info-card" : "")}
                    data-hover-info={TECHNOLOGY_DISPLAY_NAME[tech] ?? tech}
                    key={tech}
                    style={listStyle
                        // {
                        //     width: (Statics.TECHNOLOGIE_SIZE * scale + Statics.TECHNOLOGIE_CIRCLE_PADDING * 2) + "px",
                        //     height: (Statics.TECHNOLOGIE_SIZE * scale + Statics.TECHNOLOGIE_CIRCLE_PADDING * 2) + "px"
                        // }
                    }
                    {...{ onClick: () => openBrowserOnClick && PROGRAMMING_LANGUAGE_LINKS[tech] && open(PROGRAMMING_LANGUAGE_LINKS[tech], "_blank") }}
                >
                    <TechnologyImage scale={scale} technology={tech} imageLoader={imageLoader} showThemeColoredImage={showThemeColoredImage}></TechnologyImage>
                </li>
            })
        }
    </ul >
}