import { useRef, useState } from "react";
import "./LanguageChangeButton.scss";
import { LanguageManager, useLanguage } from "../../lang";
import { ImageLoadManager } from "../../utils";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import type { LanguageCode } from "../../lang/LanguageManager";

export default function LanguageChangeButton() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const loadingAnimation = useLoadingAnimation();
    const imageloader = new ImageLoadManager(loadingAnimation, "language-image-loading");
    const [language, setLanguage] = useLanguage();
    const wrapperRef = useRef<HTMLDivElement>(null);
    function onClick() {
        setOpen(!isOpen);
    }

    function onLanguageClicked(lang: LanguageCode) {
        setLanguage(lang);
        setOpen(false);
    }

    document.addEventListener("click", (e) => {
        if (!wrapperRef.current) return;
        if (wrapperRef.current.contains(e.target as Node)) return;
        setOpen(false);
    })

    return <div className="language-wrapper" ref={wrapperRef}>
        <div className={"language-dropdown" + (isOpen ? " open" : "")}>

            {
                LanguageManager.SUPPORTED_LANGUAGES.map(lang => {
                    return <div key={lang} className="language-dropdown-element">
                        <img src={LanguageManager.LANGUAGE_FLAGS[lang]} alt={lang} className={"flag" + (language == lang ? " selected" : "")} onClick={() => onLanguageClicked(lang)} onLoad={imageloader.onLoad} onError={imageloader.onError} ref={imageloader.onRefAdd} />
                    </div>
                })
            }

        </div>
        <button className={"language-change-btn" + (isOpen ? " open" : "")} onClick={onClick}>&#xf106;</button>
    </div>
}