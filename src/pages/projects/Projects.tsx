import { useEffect, useState } from "react";
import { loadProjects } from "../../data/Data";
import "./Projects.scss";
import { useLoadingAnimation } from "../../components";
import { type Project as ProjectType } from '../../components/project/Project';
import { ProjectBig } from "../../components";
import { Statics } from "../../utils";
import { useTitle } from "../../components/titleManager/TitleManager";

export default function Projects() {
    useTitle().setTitle(Statics.TITLE_SUFFIX + "Projects");

    const bg = useLoadingAnimation();
    const [projects, setProjects] = useState<ProjectType[]>([]);

    useEffect(() => {
        if (projects.length == 0) {
            bg.addLoadingState("projects");
            (async () => {
                setProjects(await loadProjects());
                bg.removeLoadingState("projects");
            })();
        }
    }, [projects, bg]);

    return (<>
        <h1 className="title">Projects</h1>
        {
            projects.map(project => {
                return <ProjectBig key={project.id} project={project} />
            })
        }
    </>);
}