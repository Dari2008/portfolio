import { useEffect, useState } from "react";
import { ABOUT_ME, loadAboutMe, type AboutMe } from "../../data/Data";
import "./AboutMe.scss";
import { useAchievements, useLoadingAnimation } from "../../components";
import TechnologyList from "../../components/technologies/TechnologyList";
import type { Technology } from "../../components/project/Project";
import { NavLink } from "react-router";
import { MultiResImage } from "../../components/image/MultiResImage";
import { useTitle } from "../../components/titleManager/TitleManager";
import { ImageLoadManager, Statics } from "../../utils";

export default function AboutMe() {

    useTitle().setTitle(Statics.TITLE_SUFFIX + "About Me");

    const [aboutMe, setAboutMe] = useState<AboutMe>(ABOUT_ME);
    const loadingAnimation = useLoadingAnimation();
    const achievements = useAchievements();

    const imageLoader = new ImageLoadManager(loadingAnimation, "aboutMeImageLoader");
    useEffect(() => achievements.achievementFinished().visitedPage("aboutMe"));

    useEffect(() => {
        if (Object.values(aboutMe).length == 0) {
            loadingAnimation.addLoadingState("aboutMeLoading");
            (async () => {
                setAboutMe(await loadAboutMe());
                loadingAnimation.removeLoadingState("aboutMeLoading");
            })();
        }
    }, [aboutMe, loadingAnimation]);
    const isLoaded = Object.values(aboutMe).length != 0;
    return isLoaded && <>
        <h1 className="title">About Me</h1>


        {/* Intro */}
        <div className="about-me-section intro">
            <div className="image">
                {/* <img src="/aboutMeSmall/me.jpg" alt="Image of Me" /> */}
                <MultiResImage sizes={[400, 600, 1000, 1500]} extension="jpg" suffix="me" endStr="-landscape" path="/aboutMeSmall/" imageLoader={imageLoader}></MultiResImage>
                <div className="subtitle">
                    <h2>Hello, I’m {aboutMe.name}</h2>
                    <span className="subtitle">
                        {aboutMe.whatIAm.replace(/^a\s+/i, "")}
                    </span>
                </div>
            </div>
            {
                convertToPs(aboutMe.texts.intro)
            }
        </div>

        <div className="about-me-section stack">
            <h2>My Tech Stack</h2>
            {
                convertToPs(aboutMe.texts.techStack)
            }
            <TechnologyList scale={1.2} technologies={aboutMe.technologies.map(e => e.tech as Technology[]).flat()} className="techList"></TechnologyList>
        </div>

        {/* How it started */}
        <div className="about-me-section origin">
            <h2>How I Started Programming</h2>
            {
                convertToPs(aboutMe.texts.origin)
            }
        </div>

        {/* What I like building */}
        <div className="about-me-section interests">
            <h2>What I Like Building</h2>
            {
                convertToPs(aboutMe.texts.interests)
            }
        </div>

        {/* How I learn */}
        <div className="about-me-section learning">
            <h2>How I Learn & Improve</h2>
            {
                convertToPs(aboutMe.texts.learning)
            }
        </div>

        {/* Future goals */}
        <div className="about-me-section goals">
            <h2>What I’m Working Towards</h2>
            {
                convertToPs(aboutMe.texts.goals)
            }
        </div>

        {/* Actions */}
        <div className="about-me-actions">
            <NavLink to={"/projects"} className="btn">Projects</NavLink>
            <NavLink to={"/contact"} className="btn">Contact</NavLink>
        </div>
    </>;
}

function convertToPs(texts: string[] | string) {
    return typeof texts == "string" ? <p>{texts}</p> : texts.map(e => <p key={e}>{e}</p>)
}