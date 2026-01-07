import { type Project } from "./Project.ts";
import "./Project-Small.scss";
import { useNavigate } from "react-router";
import { useRef } from "react";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext.ts";
import ImageLoadManager from "../../utils/ImageLoadManager.ts";
import TechnologyList from "../technologies/TechnologyList.tsx";
import { useLanguage } from "../../lang/LanguageContext.tsx";



export default function ProjectSmall({ project }: { project: Project }) {
    const navigate = useNavigate();
    const loadingAnimation = useLoadingAnimation();
    const navigateLink = `/projects/${project.id}`;
    const [language,] = useLanguage();

    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "loadingProjectSmallImages"));
    return (
        <>
            <div className="project-card-small card">
                <h2 className="project-title" onClick={() => navigate(navigateLink)}>{project.title[language]}</h2>
                <div className="project-image-wrapper" onClick={() => navigate(navigateLink)}>
                    <img src={typeof project.projectImage == "string" ? project.projectImage : project.projectImage.link} alt={project.title[language]} className="project-image" onLoad={imageLoader.current.onLoad} onError={imageLoader.current.onError} ref={imageLoader.current.onRefAdd} />
                </div>
                <p className="project-description" onClick={() => navigate(navigateLink)}>{project.description[language]}</p>
                <TechnologyList technologies={project.technologies} imageLoader={imageLoader.current} className="project-technologies"></TechnologyList>
            </div>
        </>
    );
}