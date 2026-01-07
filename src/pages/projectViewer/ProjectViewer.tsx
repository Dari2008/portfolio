import "./ProjectViewer.scss";
import { type Project } from "../../components/project/Project";
import { useEffect, useRef, useState } from "react";
import { loadPorgrammingLanguageLinks, loadProgrammingLanguageColors, PROGRAMMING_LANGUAGE_COLORS, PROGRAMMING_LANGUAGE_LINKS } from "../../data/Data";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { ImageViewer, useAchievements, useLoadingAnimation } from "../../components";
import { ImageLoadManager, Statics } from "../../utils";
import TechnologyList from "../../components/technologies/TechnologyList";
import { useTitle } from "../../components/titleManager/TitleManager";
dayjs.extend(customParseFormat);


type CodePercentage = {
    [key: string]: number;
};

export default function ProjectViewer(params: { project: Project }) {
    const project = params.project;
    const achievements = useAchievements();

    useEffect(() => achievements.achievementFinished().visitedProject(project.id));

    useTitle().setTitle(Statics.TITLE_SUFFIX + project.title);

    const loadingAnimation = useLoadingAnimation();

    const projectImage = project.projectImage;
    const allImages = [projectImage, ...(project.otherImages ?? [])];
    const daysSince = Math.abs(dayjs(project.date, "DD.MM.YYYY").diff(dayjs(), "days"));

    const [programmingLanguageColors, setProgrammingLanguageColors] = useState(PROGRAMMING_LANGUAGE_COLORS);
    const [programmingLanguageLinks, setProgrammingLanguageLinks] = useState(PROGRAMMING_LANGUAGE_LINKS);

    const [codePercentages, setCodePercentages] = useState<CodePercentage>({});
    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "imagesProjectViewer"));


    useEffect(() => {
        if (Object.values(programmingLanguageColors).length == 0) {
            loadingAnimation.addLoadingState("programmingLanguageColorsProjectViewer");
            (async () => {
                setProgrammingLanguageColors(await loadProgrammingLanguageColors());
                loadingAnimation.removeLoadingState("programmingLanguageColorsProjectViewer");
            })();
        }

        if (Object.values(programmingLanguageLinks).length == 0) {
            loadingAnimation.addLoadingState("programmingLanguageLinksProjectViewer");
            (async () => {
                setProgrammingLanguageLinks(await loadPorgrammingLanguageLinks());
                loadingAnimation.removeLoadingState("programmingLanguageLinksProjectViewer");
            })();
        }

        if (Object.keys(codePercentages).length == 0) {
            loadingAnimation.addLoadingState("loadingPercentages" + project.id);

            (async () => {
                const hasToSet = await loadCodePercentages(project);
                if (!hasToSet) return;
                setCodePercentages(hasToSet);
                loadingAnimation.removeLoadingState("loadingPercentages" + project.id);
            })();
        }
    });

    const totalCharCount = Object.values(codePercentages).reduce((a, b) => a + b, 0);
    console.log("project", project);
    return (
        <>
            <h1 className="project-title title">{project.title}</h1>

            <ImageViewer className="project-images" imageLoader={imageLoader.current} images={allImages.map(e => {
                return {
                    defaultPath: typeof e == "string" ? e : e.link,
                    description: typeof e == "string" ? "" : e.description,
                    paths: []
                }
            })}></ImageViewer>

            <div className="detailsWrapper">
                <div className="project-description grid-item">
                    <h3 className="title">Description</h3>
                    <div className="description">{project.description}</div>
                </div>
                {
                    project.sourceCodeLink && Object.keys(codePercentages).length > 0 && (
                        <div className="codePercentages grid-item">
                            <h3 className="title">Languages Used</h3>
                            <div className="visualPercentages">
                                {
                                    Object.keys(codePercentages).map((language, index) => {
                                        const percentage = Math.round((codePercentages[language] / totalCharCount) * 100 * 100) / 100;
                                        const color = programmingLanguageColors[language.toLowerCase()];
                                        return (
                                            <span key={index} className="hover-info-card" data-hover-info={language} style={{ backgroundColor: color, "--calculatedWidth": percentage + "%" } as any}></span>
                                        );
                                    })
                                }
                            </div>
                            <ul className="names">
                                {
                                    Object.keys(codePercentages).map((language, index) => {
                                        const percentage = Math.round((codePercentages[language] / totalCharCount) * 100 * 100) / 100;
                                        const color = programmingLanguageColors[language.toLowerCase()];
                                        return (
                                            <li key={index} style={{ "--languageColor": color } as any} data-percentage={percentage}>{language}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    )
                }
                <div className="timeStats grid-item">
                    <h3 className="title">Time Stats</h3>
                    <div className="lastWorkedDays">Last Worked: {daysSince == 0 ? "just today" : daysSince + " " + (daysSince == 1 ? "day" : "days")} ago</div>
                    <div className="timeTaken">Time Taken: {`${project.timeTakenToCreate.time} ${project.timeTakenToCreate.unit}`}</div>
                </div>
                <div className="project-technologies grid-item">
                    <h3 className="title">Technologies</h3>
                    <TechnologyList className="technologies" technologies={project.technologies} showThemeColoredImage={false}></TechnologyList>
                </div>
                <ul className="project-features grid-item">
                    <h3 className="title">Features</h3>
                    <div className="features">
                        {
                            project.features.map((feature, index) => (
                                <li key={index} className="feature">{feature}</li>
                            ))
                        }
                    </div>
                </ul>
                <div className="links grid-item">
                    <h3 className="title">Links</h3>
                    {
                        project.liveLink && (
                            <>
                                <i className="fa fa-desktop" />
                                <a className="liveDemo" target="_blank" href={project.liveLink}><span className="long">{project.liveLink}</span><span className="short">Demo</span></a>
                            </>
                        )
                    }
                    {
                        project.sourceCodeLink && (
                            <>
                                <i className="fa fa-github" />
                                <a className="sourceCode" target="_blank" href={project.liveLink}><span className="long">{project.sourceCodeLink}</span><span className="short">Source Code</span></a>
                            </>
                        )
                    }
                </div>
            </div>
        </>
    );
}

const CACHED_LANGUAGES: { [key: string]: string; } = {};

async function loadCodePercentages(project: Project) {
    const sourceCodeLink = project.sourceCodeLink;
    if (!sourceCodeLink) return;

    if (CACHED_LANGUAGES[project.id]) return CACHED_LANGUAGES[project.id];

    const owner = sourceCodeLink.split("/")[3];
    const repo = sourceCodeLink.split("/")[4];

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/languages`

    const response = await (await fetch(endpoint)).json();
    if (response.status == "404") return;
    CACHED_LANGUAGES[project.id] = response;
    return response;
}