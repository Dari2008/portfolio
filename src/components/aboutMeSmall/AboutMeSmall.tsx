import { useEffect, useState } from "react";
import { loadAboutMe, type AboutMe } from "../../data/Data";
import { ImageLoadManager } from "../../utils";
import { type Technology } from "../project/Project";
import "./AboutMeSmall.scss";
import { TypingSpan } from "../typingText/TypingSpan";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import { NavLink } from "react-router";
import TechnologyList from "../technologies/TechnologyList";
import { MultiResImage } from "../image/MultiResImage";
import { LangElement, useLanguage } from "../../lang";

export default function AboutMeSmall() {
    const bg = useLoadingAnimation();
    const [aboutMe, setAboutMe] = useState<AboutMe | undefined>(undefined);
    const imageLoader = new ImageLoadManager(bg, "loadingAboutMeSmallImages");
    const [language,] = useLanguage();

    useEffect(() => {
        if (aboutMe == undefined) {
            bg.addLoadingState("aboutMeSmall");
            (async () => {
                setAboutMe(await loadAboutMe());
                bg.removeLoadingState("aboutMeSmall");
            })();
        }
    }, [aboutMe, bg]);

    return (<div className="aboutMeSmall section">
        <MultiResImage sizes={[400, 600, 1000, 1500]} className="me" alt="An Image of Me" extension="jpg" suffix="me" endStr="-landscape" path="/aboutMeSmall/" imageLoader={imageLoader}></MultiResImage>
        {/* <img src="/aboutMeSmall/me.jpg" alt="A Image of Me" className="me" onError={imageLoader.onError} onLoad={imageLoader.onLoad} ref={imageLoader.onRefAdd} /> */}
        <div className="infoWrapper">
            <div className="hello">
                {
                    aboutMe && (
                        <>
                            {language == "en" && <TypingSpan speed={150} children={aboutMe.hero.hi["en"]}></TypingSpan>}
                            {language == "de" && <TypingSpan speed={150} children={aboutMe.hero.hi["de"]}></TypingSpan>}
                        </>
                    )
                }
            </div>
            {/**aboutMe.hero.typingTexts */}
            <div className="subline">{aboutMe && aboutMe.hero.subline[language]}</div>
            <div className="skillsWrapper">
                {
                    aboutMe && (
                        <TechnologyList className="skills" scale={1.5} technologies={aboutMe.technologies.map(e => (e.tech as Technology[])).flat()} imageLoader={imageLoader}></TechnologyList>
                    )
                }
            </div>
            <div className="buttons">
                <NavLink to={"/contact/"} className="contact">
                    <LangElement
                        en="Contact"
                        de="Kontakt"
                    />
                </NavLink>
                <NavLink to={"/aboutMe/"} className="aboutMe">
                    <LangElement
                        en="About Me"
                        de="Über mich"
                    />
                </NavLink>
            </div>
        </div>
    </div>);
}