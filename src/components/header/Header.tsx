import { useRef, useState, type JSX } from "react";
import "./Header.scss";
import { MENU_ITEMS } from "../../app/Menu";
import { NavLink, useNavigate } from "react-router";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import { LangElement } from "../../lang";


export default function Header(): JSX.Element {
    const nav = useNavigate();
    const loadingAnimation = useLoadingAnimation();
    const imageRef = useRef<HTMLImageElement>(null);
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    if (!imageRef.current || !imageRef.current?.complete) {
        loadingAnimation.addLoadingState("loadingHeaderImg");
    }

    const handleImageLoaded = () => {
        loadingAnimation.removeLoadingState("loadingHeaderImg")
    };

    const handleMobileCloseEvent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        setMobileNavOpen(false);
    }

    const onMenuClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        console.log(!isMobileNavOpen);
        setMobileNavOpen(!isMobileNavOpen);
    }

    return (
        <>
            <header id="header" className={`${isMobileNavOpen ? "open" : ""}`} onClick={handleMobileCloseEvent}>
                {
                    navigator.share && navigator.canShare({ title: "Darius Portfolio", url: location.href }) && <button className="share big" onClick={() => navigator.share({ title: "Darius Portfolio", url: location.href })}></button> //navigator.share && navigator.canShare({ title: "Darius Portfolio", url: location.href }) && 
                }
                <div id="navContent">
                    <ul>
                        {
                            MENU_ITEMS.map(menuItem => {
                                return (
                                    <li key={menuItem.name + menuItem.path}>
                                        {
                                            menuItem.name.en == "Curriculum Vitae"
                                                ?
                                                <NavLink key={menuItem.name + menuItem.path + "button"} to={menuItem.path}>

                                                    <LangElement en={
                                                        <span className="normal">{menuItem.name.en}</span>
                                                    }
                                                        de={
                                                            <span className="normal">{menuItem.name.de}</span>
                                                        } />
                                                    <span className="short">CV</span>
                                                </NavLink>
                                                :
                                                <NavLink key={menuItem.name + menuItem.path + "button"} to={menuItem.path}>
                                                    <LangElement {...menuItem.name} />
                                                </NavLink>
                                        }
                                    </li>);
                            })
                        }
                    </ul>
                </div>
                {
                    navigator.share && navigator.canShare({ title: "Darius Portfolio", url: location.href }) && <button className="share small" onClick={() => navigator.share({ title: "Darius Portfolio", url: location.href })}></button>
                }
                <button className="openMenu" onClick={onMenuClick}>
                    <div className="icon-1"></div>
                    <div className="icon-2"></div>
                    <div className="icon-3"></div>
                    <div className="clear"></div>
                </button>
                <img src={"/manifest/Logo_Quer.svg"} role="link" alt="Logo" onClick={() => nav("/")} onError={handleImageLoaded} onLoad={handleImageLoaded} ref={imageRef} />
            </header >
        </>
    );
}