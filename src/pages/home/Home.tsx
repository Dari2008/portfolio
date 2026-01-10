import { useEffect, useState } from 'react';
import { AboutMeSmall, ProjectSmall, Statistics, useAchievements, useLoadingAnimation } from '../../components'
import { loadProjects } from '../../data/Data'
import './Home.scss'
import { type Project as ProjectType } from '../../components/project/Project';
import { useTitle } from '../../components/titleManager/TitleManager';
import { LangElement } from '../../lang';

export default function Home() {
    useTitle().setTitle("Darius Portfolio");
    const achievements = useAchievements();

    useEffect(() => achievements.achievementFinished().visitedPage("home"));

    const bg = useLoadingAnimation();
    const [projects, setProjects] = useState<ProjectType[]>([]);

    useEffect(() => {
        if (projects.length == 0) {
            bg.addLoadingState("homeProjects");
            (async () => {
                setProjects(await loadProjects());
                bg.removeLoadingState("homeProjects");
            })();
        }
    }, [projects, bg]);

    return (
        <>
            <AboutMeSmall />
            <Statistics />
            <div id="projects" className='section'>
                <h1><LangElement en="Projects" de="Projekte" /></h1>
                <div className="projects-wrapper">
                    {
                        projects.map(project => {
                            return (
                                <ProjectSmall key={project.id} project={project} />
                            );
                        })
                    }
                </div>
            </div>
        </>
    )
}