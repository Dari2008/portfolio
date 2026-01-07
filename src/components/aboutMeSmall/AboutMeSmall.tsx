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

export default function AboutMeSmall() {
    const bg = useLoadingAnimation();
    const [aboutMe, setAboutMe] = useState<AboutMe | undefined>(undefined);
    const imageLoader = new ImageLoadManager(bg, "loadingAboutMeSmallImages");

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
        <MultiResImage sizes={[400, 600, 1000, 1500]} className="me" alt="A Image of Me" extension="jpg" suffix="me" endStr="-landscape" path="/aboutMeSmall/" imageLoader={imageLoader}></MultiResImage>
        {/* <img src="/aboutMeSmall/me.jpg" alt="A Image of Me" className="me" onError={imageLoader.onError} onLoad={imageLoader.onLoad} ref={imageLoader.onRefAdd} /> */}
        <div className="infoWrapper">
            <div className="hello">
                {
                    aboutMe && (
                        <TypingSpan speed={150}>{aboutMe.hero.hi}</TypingSpan>
                    )
                }
            </div>
            {/**aboutMe.hero.typingTexts */}
            <div className="subline">{aboutMe && aboutMe.hero.subline}</div>
            <div className="skillsWrapper">
                {
                    aboutMe && (
                        <TechnologyList className="skills" scale={1.5} technologies={aboutMe.technologies.map(e => (e.tech as Technology[])).flat()} imageLoader={imageLoader}></TechnologyList>
                    )
                }
            </div>
            <div className="buttons">
                <NavLink to={"/contact/"} className="contact">Contact</NavLink>
                <NavLink to={"/aboutMe/"} className="aboutMe">About Me</NavLink>
            </div>
        </div>
    </div>);
}
// <div className="mostUsedTech">
//     <ul className="mostUsedTechList">
//         {
//             ABOUT_ME.technologies.map(category => {
//                 return <li key={category.category}>
//                     <div className="category-name">{category.category}</div>
//                     <ul className="category-list">
//                         {
//                             category.tech.map(tech => {
//                                 return <li key={tech} data-tech-name={tech}>
//                                     <img src={resolveProgrammingLanguageIcon(tech as Technology)} width={Statics.TECHNOLOGIE_SIZE} height={Statics.TECHNOLOGIE_SIZE} alt={tech + " logo"} />
//                                 </li>
//                             })
//                         }
//                     </ul>
//                 </li>;
//             })
//         }
//     </ul>
// </div>
// <div className="motivation">{ABOUT_ME.motiviation}</div>
// <div className="learnCurrently">{ABOUT_ME.whatILearnCurrently}</div>
// <div className="whatIAm">{ABOUT_ME.hero.whatIAm}</div>