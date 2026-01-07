import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import "./CV.scss";
import { CURRICULUM_VITAE, loadCV, type CurriculumVitae, type CurriculumVitaeDownloadItem, type CurriculumVitaeEntry, type LanguageString } from "../../data/Data";
import { useAchievements, useLoadingAnimation } from "../../components";
import dayjs from "dayjs";
import StringOdometer from "../../components/statistics/StringOdometer";
import { useNavigate } from "react-router";
import { ImageLoadManager, Statics } from "../../utils";
import { useTitle } from "../../components/titleManager/TitleManager";
import { LangElement, useLanguage } from "../../lang";
import type { LanguageCode } from "../../lang/LanguageManager";

let countUps: (() => void)[] = [];
let hasAllLoaded = false;
export default function CV() {
    useTitle().setTitle(Statics.TITLE_SUFFIX + "CV");
    const achievements = useAchievements();
    const [language,] = useLanguage();

    useEffect(() => achievements.achievementFinished().visitedPage("cv"));

    const [cv, setCV] = useState<CurriculumVitae>(Object.keys(CURRICULUM_VITAE).length > 0 ? CURRICULUM_VITAE : {
        entrys: [],
        location: "",
        infos: [],
        name: {
            firstName: "",
            lastName: ""
        }
    });

    const hasAllLoadedRef = useRef(hasAllLoaded);
    hasAllLoaded = hasAllLoadedRef.current;

    const loadingAnimation = useLoadingAnimation();
    const navigate = useNavigate();
    const imageLoader = useRef(new ImageLoadManager(loadingAnimation, "imagesCv"));

    const cvElement = useRef<HTMLDivElement>(null);
    const timeSpanGraph = useRef<HTMLDivElement>(null);
    const documentViewer = useRef<HTMLDivElement>(null);

    const filterRef = useRef<HTMLDivElement>(null);
    const [currentFilters, setCurrentFilters] = useState<string[]>([...(new Set(cv.entrys.map(e => e.category.en)))]);

    const categoryLanguageMap: {
        [key: string]: LanguageString;
    } = {};

    cv.entrys.forEach(e => {
        categoryLanguageMap[e.category.en] = e.category;
    });

    const currentEntrys = cv.entrys.filter(e => {
        if (currentFilters.length == 0) return true;
        return currentFilters.includes(e.category.en);
    });

    const handleOnDocumentClick = (entry: CurriculumVitaeEntry, download: CurriculumVitaeDownloadItem) => {
        const docViewer = documentViewer.current;
        if (!docViewer) return;
        const embed = docViewer.querySelector("embed");
        if (!embed) return;
        embed.src = download.downloadLink;
        docViewer.classList.add("open");

        const downloadA = docViewer.querySelector(".downloadBtn") as HTMLAnchorElement;
        if (!downloadA) return;
        downloadA.download = `${entry.title[language].replaceAll(" ", "-")}_${download.name}_${dayjs(entry.from, "DD.MM.YYYY").format("YYYY-MM-DD")}_${dayjs().format("YYYY-MM-DD")}${download.extension ?? ""}`;
        downloadA.href = download.downloadLink;

    };

    useEffect(() => {
        countUps.forEach(e => e());
        hasAllLoadedRef.current = true;
        hasAllLoaded = true;
    }, []);

    // loadingAnimation.addOnFinishedLoading(() => {
    //     countUps.forEach(e => e());
    // });

    useLayoutEffect(() => {
        if (!timeSpanGraph.current) return;
        const observer = new ResizeObserver(entries => {


            for (const entry of entries) {
                timeSpanGraph.current!.style.setProperty("--cv-graph-width", Math.round(entry.contentRect.width) + "px");
                timeSpanGraph.current!.style.setProperty("--cv-graph-height", Math.round(entry.contentRect.height) + "px");
            }
        });
        observer.observe(timeSpanGraph.current);

        return () => {
            observer.unobserve(timeSpanGraph.current!);
            observer.disconnect();
        };
    }, [timeSpanGraph]);


    useEffect(() => {
        if (cv.entrys.length == 0) {
            loadingAnimation.addLoadingState("cvLoading");
            (async () => {
                setCV(await loadCV());
                loadingAnimation.removeLoadingState("cvLoading");
            })();
        }
    })
    // index = 0;

    useEffect(() => {

        const handleScroll = () => {
            updateCurrentDateAndScrollPosition();
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("wheel", handleScroll);
        window.addEventListener("scrollend", handleScroll);
        document.addEventListener("scroll", handleScroll);
        document.addEventListener("wheel", handleScroll);
        document.addEventListener("scrollend", handleScroll);
        return () => {

            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", handleScroll);
            window.removeEventListener("scrollend", handleScroll);
            document.removeEventListener("scroll", handleScroll);
            document.removeEventListener("wheel", handleScroll);
            document.removeEventListener("scrollend", handleScroll);
        };
    }, [Math.random()]);


    const elements = cv.entrys.map((entry, index) => {
        const addReference = (ref: HTMLDivElement) => {
            element.references.push(ref);
        }

        const element = {
            entry: entry,
            references: [],
            getReference: (refClass: string) => {
                return element.references.find(e => e.classList.contains(refClass));
            },
            timeGraphElement: (
                <div key={entry.title.en + "timeGraphElement"} className="graphEntry indexPositionedElement timeGraphElement from-graph-entry" style={{ "--index": index } as any} data-date={convertDateToDisplayDate(entry.from, language)} ref={addReference}></div>
            ),
            entrys: (
                <div key={entry.title.en + "entrys"} className={`cv-entry cvEntry ${entry.image ? "" : "no-image"}`} style={{ "--index": index } as any} data-date={convertDateToDisplayDate(entry.from, language)} ref={addReference}>
                    <h2 className="title">{entry.title[language]}</h2>
                    <span className="description">{convertLinks(entry.description[language])}</span>
                    {
                        entry.image &&
                        <img src={typeof entry.image == "string" ? entry.image : entry.image?.link} alt={typeof entry.image == "string" ? entry.description[language] : entry.image?.description[language]} className="image" onLoad={imageLoader.current.onLoad} onError={imageLoader.current.onError} ref={imageLoader.current.onRefAdd} />
                    }
                    {
                        entry.downloadItems && entry.downloadItems.length > 0 && <div className="downloadButtons">
                            {
                                entry.downloadItems.map(downloadItem => {
                                    return <button key={downloadItem.name.en} className="downloadBtn" onClick={() => handleOnDocumentClick(entry, downloadItem)}>{downloadItem.name[language]}</button>
                                })
                            }
                        </div>
                    }
                    <div className="fromToDate">
                        <span className="from">From: {(entry.from == "today" || entry.from == "Today") ? (language == "en" ? "Today" : "Heute") : entry.from}</span>
                        <span className="until">Until: {((entry.to == "today" || entry.to == "Today") ? (language == "en" ? "Today" : "Heute") : entry.to) ?? (language == "en" ? "Today" : "Heute")}</span>
                    </div>
                </div>
            ),
            endTimeTag: (
                <div key={entry.title.en + "endTimeTag"} className="graphEntry indexPositionedElement endTimeTag to-graph-entry" style={{ "--index": index } as any} data-date={convertDateToDisplayDate(entry.to, language)} ref={addReference}></div>
            )
        } as {
            entry: CurriculumVitaeEntry;
            references: HTMLDivElement[];
            timeGraphElement: ReactNode;
            entrys: ReactNode;
            endTimeTag: ReactNode;
            getReference: (className: string) => HTMLDivElement | undefined;
        };

        return element;
    });

    function handleFilterApply(e: MouseEvent, category: string) {
        if (!e.target) return;

        if (category == "x") {
            if (filterRef.current) {
                filterRef.current.querySelectorAll(".active").forEach(e => e.classList.remove("active"));
            }
            setCurrentFilters([]);
            return;
        }

        const target = e.target as HTMLButtonElement;
        if (target.classList.contains("active")) {
            target.classList.remove("active");
            setCurrentFilters(currentFilters.filter(e => e != category));
        } else {
            target.classList.add("active");
            setCurrentFilters([...(new Set([...currentFilters, category]))]);
        }


    }

    const elementsFiltered = elements.filter(e => {
        if (currentFilters.length == 0) return true;
        return currentFilters.includes(e.entry.category.en);
    });;

    return cv && <div className="cv-wrapper">
        <h1 className="title"><LangElement en="Curriculum Vitae" de="Lebenslauf" /> - {`${cv.name?.firstName} ${cv.name?.lastName}`}</h1>

        <h2>Info</h2>
        <div className="infos-wrapper">
            {
                cv.infos.map(info => <InfoElement key={info.title.en} info={info} language={language}></InfoElement>)
            }
        </div>

        <h2><LangElement en="Entries" de="Einträge" /></h2>
        <div className="filter-wrapper">
            <div className="filter" ref={filterRef}>
                <h3><LangElement en="Filters" de="Filter" /></h3>
                <div className="filterButtons">
                    {
                        [...(new Set(elements.map(e => e.entry.category.en)))].map(category => (
                            <button key={category} className="filterButton" onClick={(e) => handleFilterApply(e, category)}>{categoryLanguageMap[category][language]}</button>
                        ))
                    }
                    <button className="clearButton" onClick={(e) => handleFilterApply(e, "x")}>+</button>
                </div>
            </div>
        </div>
        <div className="cv" style={{ "--entry-count": currentEntrys.length } as any} ref={cvElement}>
            <div className="from-graph time-graph">
                <div className="from-label label"></div>
            </div>
            {/* Dots From*/}
            {
                elementsFiltered.map((e, i) => {
                    ((e.timeGraphElement as ReactElement).props as any).style["--index"] = i;
                    return e.timeGraphElement;
                })
            }
            {/* All Entries */}
            {
                elementsFiltered.map((e, i) => {
                    ((e.entrys as ReactElement).props as any).style["--index"] = i;
                    return e.entrys;
                })
            }
            {/* All Span elements inbetween */}
            {
                currentEntrys.map((entry, index) => {
                    return currentEntrys.length - 1 >= index + 1 && <div key={entry.title.en + "diff"} style={{ "--index": index } as any} className="timeSpan indexPositionedElement">{Math.abs(dayjs(currentEntrys[index + 1].from, "DD.MM.YYYY").diff(dayjs(entry.from, "DD.MM.YYYY"), "days")) + " days"}</div>
                })
            }
            {/* Dots To */}
            {
                elementsFiltered.map((e, i) => {
                    ((e.endTimeTag as ReactElement).props as any).style["--index"] = i;
                    return e.endTimeTag;
                })
            }
            <div className="to-graph time-graph">
                <div className="to-label label"></div>
            </div>
        </div>

        <div className="download-wrapper">
            <button className="download-btn"><LangElement en="Download CV" de="Download Lebenslauf" /></button>
        </div>

        <div className="documentViewerWrapper">
            <div className="documentViewer" ref={documentViewer}>
                <button className="close" onClick={(e) => (e.target as HTMLButtonElement).parentElement?.classList.remove("open")}>&times;</button>
                <embed></embed>
                <a href="" className="downloadBtn" target="_blank">&#xf019;</a>
            </div>
        </div>
    </div>;

    function updateCurrentDateAndScrollPosition(offsetFactor = 0.52) {
        if (!cvElement.current) return;
        const box = cvElement.current!.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // how much the element has moved relative to the viewport offset
        const scrolled = viewportHeight * offsetFactor - box.top;

        // total scrollable height
        const maxScroll = box.height;

        // clamp between 0 and maxScroll
        const normalizedScroll = Math.min(Math.max(scrolled, 0), maxScroll);

        // 0 → 100 %
        const percentageScrolled = (normalizedScroll / maxScroll) * 100;

        const entryCount = currentEntrys.length;
        const heightPerEntry = 100 / entryCount;

        // map to index
        let index = Math.floor(percentageScrolled / heightPerEntry);

        // clamp
        if (index < 0) index = 0;
        if (index >= entryCount) index = entryCount - 1;

        // const currentEntry = currentEntrys[index];

        cvElement.current?.style.setProperty("--currentIndex", index.toString());
        cvElement.current?.style.setProperty("--scrolled-y", percentageScrolled + "");

        // if (currentEntry) currentPositionDotFrom.current?.setAttribute("data-date", convertDateToDisplayDate(currentEntry.from));
        // if (currentEntry) currentPositionDotTo.current?.setAttribute("data-date", convertDateToDisplayDate(currentEntry.to));
    }


    // function getPercentageFor(d: string, currentIndex: number) {
    //     const date = !d ? dayjs() : (d == "today" ? dayjs() : dayjs(d, "DD.MM.YYYY"));
    //     for (let i = 0; i < currentEntrys.length; i++) {
    //         const current = currentEntrys[i];
    //         const next = currentEntrys[i - 1];
    //         const spanStartDate = dayjs(current.from, "DD.MM.YYYY");
    //         const spanEndDate = next
    //             ? dayjs(next.from, "DD.MM.YYYY")
    //             : dayjs();

    //         // if (date.format("DD.MM.YYYY") == "08.08.2025") {
    //         //     console.log(date.format("DD.MM.YYYY"), spanStartDate.format("DD.MM.YYYY"), spanEndDate.format("DD.MM.YYYY"), (date.isAfter(spanStartDate) || date.isSame(spanStartDate)) &&
    //         //         (date.isBefore(spanEndDate) || date.isSame(spanEndDate)))
    //         // }

    //         if (
    //             (date.isAfter(spanStartDate) || date.isSame(spanStartDate)) &&
    //             (date.isBefore(spanEndDate) || date.isSame(spanEndDate))
    //         ) {
    //             const fullSpanDays = Math.abs(spanEndDate.diff(spanStartDate, "days"));
    //             const passedSpanDays = Math.abs(date.diff(spanStartDate, "days"));
    //             const offset = passedSpanDays / fullSpanDays;
    //             return { "--toIndex": i, "--toIndexRest": Math.abs(offset - 1) };
    //         }
    //     }
    //     return { "--toIndex": 0, "--toIndexRest": 0 };
    // }


    function convertLinks(text: string): ReactNode {

        const parts = text.split(/(#\(.*?\)#)/m);

        const allElements = parts.map(part => {
            if (part.match(/#\((.*?),(.*?)\)#/gm)) {
                part = part.replace(/#\((.*?),(.*?)\)#/gm, "$1\\$2");
                const displayString = part.split("\\")[0];
                const link = part.split("\\")[1];
                const endsWithSpace = displayString.endsWith(" ");
                const startsWithSpace = displayString.endsWith(" ");
                const howToOpen = {
                    onClick: link.startsWith("http") ? undefined : () => navigate(link),
                    href: link.startsWith("http") ? link : undefined
                }
                return <a {...howToOpen} key={link} target={link.startsWith("http") ? "_blank" : "_self"} className={`${link.startsWith("http") ? "externalLink" : ""}`}>
                    {startsWithSpace && (<>&nbsp;</>)}
                    {
                        startsWithSpace
                            ?
                            (
                                endsWithSpace
                                    ?
                                    convertLineBreaks(displayString.substring(1, displayString.length - 1))
                                    :
                                    convertLineBreaks(displayString.substring(1, displayString.length))
                            )
                            :
                            (
                                endsWithSpace
                                    ?
                                    convertLineBreaks(displayString.substring(0, displayString.length - 1))
                                    :
                                    convertLineBreaks(displayString)
                            )
                    }
                    {endsWithSpace && (<>&nbsp;</>)}
                </a>
            }


            return convertLineBreaks(part);
        })

        return allElements;
    }

}

// const themeGradientColors = [
//     "#92487A",
//     "#9B5882",
//     "#A46A8A",
//     "#AD7B92",
//     "#B68DA0",
//     "#BF9EB0",
//     "#C9AFBF",
//     "#D2C0CD",
//     "#DBCFE0",
//     "#E4C2E4",
//     "#E6B8D0",
//     "#E7AFBC",
//     "#E89FA8",
//     "#E99F94",
//     "#EBAE89",
//     "#EBC080",
//     "#ECCA78",
//     "#EDD06F",
//     "#EEDD66",
//     "#FFE55D",
//     "#FFD3D5"
// ].reverse();

// let index = 0;

// function generateRandomColor() {
//     index++;
//     return themeGradientColors[index - 1];
// }

const InfoElement = ({ info, language }: { info: Info; language: LanguageCode }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        navigator.clipboard.writeText(info.value);
        if (ref.current) ref.current.classList.add("copied");
        setTimeout(() => {
            if (ref.current) ref.current.classList.remove("copied");
        }, 500);
    };

    console.log(info.value, hasAllLoaded);

    return <div className="info-card" key={info.title.en} ref={ref}>
        <div className="icon">{info.icon}</div>
        <span className="title">{info.title[language]}</span>
        <StringOdometer value={info.value} duration={500} onClick={handleClick} hasAllreadyLoaded={hasAllLoaded} className="value" setOnLoad={func => { countUps.push(func); }}></StringOdometer>
    </div>;
};

type Info = {
    icon: string;
    value: string;
    title: LanguageString;
}


function convertLineBreaks(text: string) {
    let startIndex = text.startsWith(" ") ? 1 : 0;
    let endIndex = text.endsWith(" ") ? text.length - 1 : text.length;
    if (startIndex != 0 || endIndex != text.length) {
        return <span key={text}>
            {startIndex != 0 && <>&nbsp;</>}
            {text.substring(startIndex, endIndex)}
            {endIndex != text.length && <>&nbsp;</>}
        </span>;
    }

    return text;
}

function convertDateToDisplayDate(date: string, lang: LanguageCode) {
    if (!date) return lang == "en" ? "Today" : "Heute";
    return date.toLowerCase() == "today" ? (lang == "en" ? "Today" : "Heute") : date;
}