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
import { LangElement, useLanguage } from "../../lang";

export default function AboutMe() {

    useTitle().setTitle(Statics.TITLE_SUFFIX + "About Me");

    const [aboutMe, setAboutMe] = useState<AboutMe>(ABOUT_ME);
    const loadingAnimation = useLoadingAnimation();
    const achievements = useAchievements();
    const [language,] = useLanguage();

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
        <h1 className="title">
            <LangElement
                en="About Me"
                de="Über mich"
            />
        </h1>


        {/* Intro */}
        <div className="about-me-section intro">
            <div className="image">
                {/* <img src="/aboutMeSmall/me.jpg" alt="Image of Me" /> */}
                <MultiResImage sizes={[400, 600, 1000, 1500]} extension="jpg" suffix="me" endStr="-landscape" path="/aboutMeSmall/" imageLoader={imageLoader}></MultiResImage>
                <div className="subtitle">
                    <h2><LangElement en="Hello, I’m " de="Hallo, ich bin " />{aboutMe.name}</h2>
                    <span className="subtitle">
                        {aboutMe.whatIAm[language].replace(/^a\s+/i, "")}
                    </span>
                </div>
            </div>
            {
                convertToPs(aboutMe.texts.intro[language])
            }
        </div>

        <div className="about-me-section stack">
            <h2>
                <LangElement
                    en="My Tech Stack"
                    de="Mein Tech Stack"
                />
            </h2>
            {
                convertToPs(aboutMe.texts.techStack[language])
            }
            <TechnologyList scale={1.2} technologies={aboutMe.technologies.map(e => e.tech as Technology[]).flat()} className="techList"></TechnologyList>
        </div>

        {/* How it started */}
        <div className="about-me-section origin">
            <h2>
                <LangElement
                    en="How I Started Programming"
                    de="Wie ich angefangen habe zu programmieren"
                />
            </h2>
            {
                convertToPs(aboutMe.texts.origin[language])
            }
        </div>

        {/* What I like building */}
        <div className="about-me-section interests">
            <h2>
                <LangElement
                    en="What I Like Building"
                    de="Was ich baue"
                />
            </h2>
            {
                convertToPs(aboutMe.texts.interests[language])
            }
        </div>

        {/* How I learn */}
        <div className="about-me-section learning">
            <h2>
                <LangElement
                    en="How I Learn & Improve"
                    de="Wie ich lerne & mich verbesser"
                />
            </h2>
            {
                convertToPs(aboutMe.texts.learning[language])
            }
        </div>

        {/* Future goals */}
        <div className="about-me-section goals">
            <h2>
                <LangElement
                    en="What I’m Working Towards"
                    de="Auf was ich hinaus arbeite"
                />
            </h2>
            {
                convertToPs(aboutMe.texts.goals[language])
            }
        </div>

        {/* Actions */}
        <div className="about-me-actions">
            <NavLink to={"/projects"} className="btn"><LangElement en="Projects" de="Projekte" /></NavLink>
            <NavLink to={"/contact"} className="btn"><LangElement en="Contact" de="Kontakt" /></NavLink>
        </div>
    </>;
}

function convertToPs(texts: string[] | string) {
    return typeof texts == "string" ? <p>{texts}</p> : texts.map(e => <p key={e}>{e}</p>)
}