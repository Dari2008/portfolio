import { useEffect, useRef, useState } from "react";
import "./StemRacing.scss";
import { ImageViewer, useLoadingAnimation } from "../../../components";
import { ImageLoadManager, Statics } from "../../../utils";
import type { Images, Path } from "../../../components/imageViewer/ImageViewer";
import { loadSpecialsStemRacing, SPECIALS_STEM_RACING, type Element, type Elements, type Image, type LanguageString, type LinkElement, type ListElement, type SpecialsStemRacing, type TextElement, type WhatIDidEntry, type WhatILearned } from "../../../data/Data";
import { useTitle } from "../../../components/titleManager/TitleManager";
import { LangElement, useLanguage } from "../../../lang";
import type { LanguageCode } from "../../../lang/LanguageManager";


export function StemRacing() {

    useTitle().setTitle(Statics.TITLE_SUFFIX + "STEM Racing");

    const loadingAnimation = useLoadingAnimation();
    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "stemracingImageLoading"));

    const [stemRacing, setStemRacing] = useState<SpecialsStemRacing>(SPECIALS_STEM_RACING);
    const [language,] = useLanguage();

    useEffect(() => {
        if (Object.values(stemRacing).length == 0) {
            loadingAnimation.addLoadingState("stemRacingLoading");
            (async () => {
                setStemRacing(await loadSpecialsStemRacing());
                loadingAnimation.removeLoadingState("stemRacingLoading");
            })();
        }
    }, []);
    console.log(stemRacing);
    if (!stemRacing || !stemRacing.images || !stemRacing.whatIDid || !stemRacing.whatILearned) return <></>;

    const SIZES = [400, 600, 1000, 1500, 2000, 2500, 3000].sort();
    const IMAGES: Image[] = stemRacing.images;
    const WHAT_I_DID: WhatIDidEntry[] = stemRacing.whatIDid;
    const WHAT_I_LEARNED: WhatILearned[] = stemRacing.whatILearned;

    const COMPILED_IMAGES: Images = IMAGES.map(image => {
        return {
            defaultPath: image.folder + image.baseName + "." + image.extension,
            description: image.description,
            paths: SIZES.sort((a, b) => {
                return a - b;
            }).map((size, i) => {
                return {
                    path: image.folder + image.baseName + "-" + size + "-landscape." + image.extension,
                    maxWidth: i != (SIZES.length - 1) ? SIZES[i + 1] : undefined,
                    minWidth: size
                } as Path
            })
        }
    });

    return <div className="stemRacing">
        <h1 className="title">STEM Racing</h1>

        <div className="images-wrapper">
            <h2 className="title">
                <LangElement
                    en="Images from the Competitions"
                    de="Bilder vom Wettbewerb"
                />
            </h2>
            <ImageViewer images={COMPILED_IMAGES} imageLoader={imageLoader.current}></ImageViewer>
        </div>

        <div className="whatIsStemRacing">
            <h2 className="title">
                <LangElement
                    en="What is STEM Racing"
                    de="Was ist STEM Racing"
                />
            </h2>
            <div className="content">
                <LangElement
                    en={
                        <>
                            <p>STEM Racing, formerly known as F1 in Schools, is the world&#x2019;s largest STEM competition for students aged 11 to 19. Participants compete in various categories, including:</p>

                            <ul>
                                <li>Designing and manufacturing a miniature Formula 1 car powered by CO2 cartridges</li>
                                <li>Creating three detailed portfolios (Project Management, Enterprise, and Design & Engineering)</li>
                                <li>Building a pit display</li>
                                <li>Delivering a 10-minute presentation</li>
                            </ul>

                            <p>
                                Each project element is judged and awarded points. The car is scored based on race times and results from the scruitineering process.
                                The overall winner is determined by the total number of points achieved. The competition consists of several levels: Regional, National, and World Finals.
                                Winning teams at each level qualify for the next stage.
                            </p>
                        </>
                    }
                    de={
                        <>
                            <p>STEM Racing, früher bekannt als F1 in Schools, ist der weltweit größte MINT-Wettbewerb für Schülerinnen und Schüler im Alter von 11 bis 19 Jahren. Die Teilnehmenden treten in verschiedenen Kategorien an, darunter:</p>

                            <ul>
                                <li>Entwurf und Herstellung eines Miniatur-Formel-1-Autos, das mit CO₂-Kartuschen angetrieben wird</li>
                                <li>Erstellung von drei detaillierten Portfolios (Projektmanagement, Unternehmenskonzept sowie Design & Engineering)</li>
                                <li>Aufbau eines Pit-Displays</li>
                                <li>Durchführung einer 10-minütigen Präsentation</li>
                            </ul>

                            <p>
                                Jedes Projektelement wird bewertet und mit Punkten ausgezeichnet. Das Auto wird anhand der Rennzeiten sowie der Ergebnisse aus dem Scrutineering-Prozess bewertet.
                                Der Gesamtsieger wird durch die erreichte Gesamtpunktzahl ermittelt. Der Wettbewerb besteht aus mehreren Ebenen: Regional-, National- und Weltfinale.
                                Die Siegerteams jeder Ebene qualifizieren sich für die nächste Stufe.
                            </p>
                        </>
                    }
                />
            </div>
        </div>

        <div className="achievements-wrapper">
            <h2 className="title"><LangElement en="Achievements" de="Erfolge" /></h2>
            <div className="achievements">
                <div className="achievement">
                    <span className="icon regionals"></span>
                    <span className="title"><LangElement en="Regionals in Hamburg" de="Regionale Meisterschaft in Hamburg" /></span>
                    <span className="value">
                        <span className="medal gold"></span>
                        <LangElement en="1st Place out of 14" de="1. Platz von 14" />
                    </span>
                </div>
                <div className="achievement">
                    <span className="icon nationals"></span>
                    <span className="title"><LangElement en="Nationals in Neuburg" de="Nationalmeisterschaft in Nürnberg" /></span>
                    <span className="value">
                        <span className="medal silver"></span>
                        <LangElement en="2nd Place out of 20" de="2. Platz von 20" />
                    </span>
                </div>
                <div className="achievement">
                    <span className="icon world"></span>
                    <span className="title"><LangElement en="World Championship in Singapore" de="Weltmeisterschaft in Singapur" /></span>
                    <span className="value">
                        <span className="medal grey"></span>
                        <LangElement en="17th Place out of 83" de="17. Platz von 83" />
                    </span>
                </div>
            </div>
        </div>

        <div className="whatILearned-wrapper">
            <h2 className="title"><LangElement en="What I Learned" de="Was ich gelernt habe" /></h2>
            <div className="whatILearned">
                {
                    WHAT_I_LEARNED.map(learned => {
                        return <div key={learned.title.en} className="whatILearned-section">
                            <h3>{learned.title[language]}</h3>
                            <ul>
                                {
                                    learned.items.map(e => (<li key={e.en}>{e[language]}</li>))
                                }
                            </ul>
                        </div>
                    })
                }
            </div>
        </div>

        <div className="whatIDid-wrapper">
            <h2 className="title"><LangElement en="What I did" de="Was ich gemacht habe" /></h2>
            <div className="whatIDid">
                {
                    WHAT_I_DID.map(did => {
                        return <div className="whatIDid-entry" key={did.title.en}>
                            <span className="title">{did.title[language]}</span>
                            <div className="content">{compileWhatIDid(did.elements, language)}</div>
                        </div>
                    })
                }
            </div>
        </div>

    </div>;
}

function compileWhatIDid(elements: LanguageString | Elements, language: LanguageCode) {
    if (typeof (elements as any).en == "string") return (elements as LanguageString)[language];
    const elementsResult = [];
    for (const e of (elements as Elements)) {
        const element = e as Element;
        switch (e.type) {
            case "link":
                elementsResult.push(<a key={(element as LinkElement).link} href={(element as LinkElement).link} target={(element as LinkElement).link.startsWith("http") ? "_blank" : "_self"} className={(element as LinkElement).link.startsWith("http") ? "externalLink" : ""}>{(element as LinkElement).text[language]}</a>);
                break;
            case "text":
                elementsResult.push((element as TextElement).value[language]);
                break;
            case "list":
                elementsResult.push(<ul key={(element as ListElement).value.map(e => e[language]).join("")}>
                    {
                        (element as ListElement).value.map(e => <li key={e.en}>{e[language]}</li>)
                    }
                </ul>
                );
                break;
        }
    }
    return elementsResult;
}