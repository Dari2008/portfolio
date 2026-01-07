import "./ProjectNotFound.scss";
import ProjectNotFoundBackgroundSvg from "./ProjectNotFound-Background.svg";
import ProjectNotFoundForegroundSvg from "./ProjectNotFound-Foreground.svg";

export default function ProjectNotFound() {
    // const projectId = params.projectId;
    return (
        <>
            <div id="projectNotFoundWrapper">
                <img id="projectNotFoundBg" src={ProjectNotFoundBackgroundSvg}></img>
                <img id="projectNotFoundFg" src={ProjectNotFoundForegroundSvg}></img>
            </div>
        </>
    );
}