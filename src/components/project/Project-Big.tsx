import { useRef } from "react";
import { type Project } from "./Project";
import "./Project-Big.scss";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import { ImageLoadManager } from "../../utils";
import { NavLink } from "react-router";
import TechnologyList from "../technologies/TechnologyList";
import { useLanguage } from "../../lang";


export default function ProjectBig({ project }: { project: Project }) {

    const loadingAnimation = useLoadingAnimation();
    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "loadingProjectBigImages"));
    const [language,] = useLanguage();

    return <div className="project-card-big">

        <div className="project-previewImage">
            <img src={typeof project.projectImage == "string" ? project.projectImage : project.projectImage.link} alt={typeof project.projectImage == "string" ? "" : project.projectImage.description[language]} onLoad={imageLoader.current.onLoad} onError={imageLoader.current.onError} ref={imageLoader.current.onRefAdd} />
        </div>

        <h2 className="project-title">
            {
                project.title[language]
            }
        </h2>

        <div className="project-description">
            {
                project.description[language]
            }
        </div>

        <div className="project-buttons">
            <NavLink to={`/projects/${project.id}`} className="openProject">Open Project</NavLink>
            {project.liveLink && <NavLink className="openDemo" to={project.liveLink} target="_blank" onClick={() => open(project.liveLink, "_blank")}>Open Demo</NavLink>}
        </div>

        <div className="project-technologies-wrapper">
            <label htmlFor=".project-technologies" className="technologies-label">Technologies used:</label>
            <TechnologyList technologies={project.technologies} imageLoader={imageLoader.current} className="project-technologies"></TechnologyList>
        </div>

    </div>

}