import { useParams } from "react-router";
import { loadProjects, PROJECTS } from "../../data/Data";
import ProjectNotFound from "./ProjectNotFound";
import ProjectViewer from "./ProjectViewer";
import { useLoadingAnimation } from "../../components";
import { useState } from "react";


export default function ProjectViewerWrapper() {
    let params = useParams();

    const loadingAnimation = useLoadingAnimation();
    const [projects, setProjects] = useState(PROJECTS);

    (async () => {
        if (projects.length == 0) {
            loadingAnimation.addLoadingState("projectWrapperProjects");
            (async () => {
                setProjects(await loadProjects());
                loadingAnimation.removeLoadingState("projectWrapperProjects");
            })();
        }
    })();

    const projectid = params.projectId ?? "";
    const project = PROJECTS.find(project => project.id == projectid);
    if (!project) {
        return (<ProjectNotFound />);
    }

    return <ProjectViewer project={project} />;
}
