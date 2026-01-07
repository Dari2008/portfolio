import { useEffect, useRef, useState } from "react";
import "./StemRacing.scss";
import { ImageViewer, useLoadingAnimation } from "../../../components";
import { ImageLoadManager, Statics } from "../../../utils";
import type { Images, Path } from "../../../components/imageViewer/ImageViewer";
import { loadSpecialsStemRacing, SPECIALS_STEM_RACING, type Elements, type Image, type SpecialsStemRacing, type WhatIDidEntry, type WhatILearned } from "../../../data/Data";
import { useTitle } from "../../../components/titleManager/TitleManager";


export function StemRacing() {
    useTitle().setTitle(Statics.TITLE_SUFFIX + "STEM Racing");

    const loadingAnimation = useLoadingAnimation();
    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "stemracingImageLoading"));

    const [stemRacing, setStemRacing] = useState<SpecialsStemRacing>(SPECIALS_STEM_RACING);

    useEffect(() => {
        if (Object.values(stemRacing).length == 0) {
            loadingAnimation.addLoadingState("stemRacingLoading");
            (async () => {
                setStemRacing(await loadSpecialsStemRacing());
                loadingAnimation.removeLoadingState("stemRacingLoading");
            })();
        }
    }, []);

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
            <h2 className="title">Images from the Competitions</h2>
            <ImageViewer images={COMPILED_IMAGES} imageLoader={imageLoader.current}></ImageViewer>
        </div>

        <div className="whatIsStemRacing">
            <h2 className="title">What is STEM Racing</h2>
            <div className="content">
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
            </div>
        </div>

        <div className="achievements-wrapper">
            <h2 className="title">Achievements</h2>
            <div className="achievements">
                <div className="achievement">
                    <span className="icon regionals"></span>
                    <span className="title">Regionals in Hamburg</span>
                    <span className="value">
                        <span className="medal gold"></span>
                        1st Place out of 14
                    </span>
                </div>
                <div className="achievement">
                    <span className="icon nationals"></span>
                    <span className="title">Nationals in Neuburg</span>
                    <span className="value">
                        <span className="medal silver"></span>
                        2nd Place out of 20
                    </span>
                </div>
                <div className="achievement">
                    <span className="icon world"></span>
                    <span className="title">World Championship in Singapore</span>
                    <span className="value">
                        <span className="medal grey"></span>
                        17th Place out of 83
                    </span>
                </div>
            </div>
        </div>

        <div className="whatILearned-wrapper">
            <h2 className="title">What I Learned</h2>
            <div className="whatILearned">
                {
                    WHAT_I_LEARNED.map(learned => {
                        return <div key={learned.title} className="whatILearned-section">
                            <h3>{learned.title}</h3>
                            <ul>
                                {
                                    learned.items.map(e => (<li key={e}>{e}</li>))
                                }
                            </ul>
                        </div>
                    })
                }
            </div>
        </div>

        <div className="whatIDid-wrapper">
            <h2 className="title">What I did</h2>
            <div className="whatIDid">
                {
                    WHAT_I_DID.map(did => {
                        return <div className="whatIDid-entry" key={did.title}>
                            <span className="title">{did.title}</span>
                            <div className="content">{compileWhatIDid(did.elements)}</div>
                        </div>
                    })
                }
            </div>
        </div>

    </div>
}

function compileWhatIDid(elements: string | Elements) {
    if (typeof elements == "string") return elements;
    const elementsResult = [];
    for (const element of elements) {
        switch (element.type) {
            case "link":
                elementsResult.push(<a key={element.link} href={element.link} target={element.link.startsWith("http") ? "_blank" : "_self"} className={element.link.startsWith("http") ? "externalLink" : ""}>{element.text}</a>);
                break;
            case "text":
                elementsResult.push(element.value);
                break;
            case "list":
                elementsResult.push(<ul key={element.value.join("")}>
                    {
                        element.value.map(e => <li key={e}>{e}</li>)
                    }
                </ul>
                );
                break;
        }
    }
    return elementsResult;
}